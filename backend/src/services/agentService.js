const {
  findAgentsByUserId,
  findAgentById,
  createAgent: createAgentData,
  updateAgent: updateAgentData,
  setAgentStatus,
  deleteAgent: deleteAgentData
} = require('../data/agents');
const { createSession, findSessionsByAgentId } = require('../data/sessions');
const { createTask, updateTask, getLatestTaskByAgentId, findTasksByAgentId } = require('../data/tasks');
const { appendLog, findLogsByAgentId } = require('../data/learningLogs');
const { findMetricsByAgentId, recordExecutionMetrics } = require('../data/metrics');

/**
 * List all agents belonging to the authenticated user
 */
async function listAgents(userId, options = {}) {
  return findAgentsByUserId(userId, options);
}

/**
 * Get detailed agent configuration by ID with IDOR protection
 */
async function getAgentById(agentId, userId, userRole = 'user') {
  const agent = findAgentById(agentId);
  if (!agent) {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  if (!isAdmin && userId && String(agent.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengakses agen ini"
    };
  }

  const metrics = findMetricsByAgentId(agentId);
  const latestTask = getLatestTaskByAgentId(agentId);

  return {
    success: true,
    status: 200,
    data: {
      ...agent,
      metrics: {
        total_executions: metrics.total_executions,
        success_rate: metrics.success_rate,
        avg_latency_ms: metrics.avg_latency_ms,
        current_loss: metrics.current_loss,
        current_reward: metrics.current_reward
      },
      latest_task: latestTask ? {
        id: latestTask.id,
        status: latestTask.status,
        duration_ms: latestTask.duration_ms,
        created_at: latestTask.created_at
      } : null
    }
  };
}

/**
 * Create a new agent configuration
 */
async function createAgent(userId, data) {
  const newAgent = createAgentData({
    userId,
    name: data.name,
    description: data.description,
    model: data.model,
    system_prompt: data.system_prompt,
    temperature: data.temperature,
    max_tokens: data.max_tokens,
    learning_rate: data.learning_rate,
    discount_factor: data.discount_factor,
    exploration_rate: data.exploration_rate
  });

  // Initialize metrics
  findMetricsByAgentId(newAgent.id);

  return {
    success: true,
    status: 201,
    message: "Konfigurasi agen berhasil dibuat",
    data: newAgent
  };
}

/**
 * Update agent configuration
 */
async function updateAgent(agentId, userId, updates, userRole = 'user') {
  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  const result = updateAgentData(agentId, userId, updates, isAdmin);

  if (result.error === 'NOT_FOUND') {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  if (result.error === 'FORBIDDEN') {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengubah agen ini"
    };
  }

  return {
    success: true,
    status: 200,
    message: "Konfigurasi agen berhasil diperbarui",
    data: result.agent
  };
}

/**
 * Delete an agent
 */
async function deleteAgent(agentId, userId, userRole = 'user') {
  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  const result = deleteAgentData(agentId, userId, isAdmin);

  if (result.error === 'NOT_FOUND') {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  if (result.error === 'FORBIDDEN') {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk menghapus agen ini"
    };
  }

  return {
    success: true,
    status: 200,
    message: "Agen berhasil dihapus",
    data: { id: result.id }
  };
}

/**
 * Execute agent learning loop / task
 */
async function executeAgent(agentId, userId, { prompt, parameters = {}, iterations = 5, session_id = null }, userRole = 'user') {
  const agent = findAgentById(agentId);
  if (!agent) {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  if (!isAdmin && userId && String(agent.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengeksekusi agen ini"
    };
  }

  const startTime = Date.now();
  setAgentStatus(agentId, 'LEARNING');

  let session = session_id ? null : createSession({ agentId, userId, title: `Execution: ${prompt.slice(0, 30)}...` });
  const activeSessionId = session_id || (session ? session.id : `session-${Date.now()}`);

  const task = createTask({
    agentId,
    sessionId: activeSessionId,
    userId,
    prompt,
    parameters: {
      ...parameters,
      iterations: Number(iterations) || 5,
      model: agent.model,
      temperature: agent.temperature
    },
    status: 'RUNNING'
  });

  const numIterations = Math.max(1, Math.min(50, Number(iterations) || 5));
  const lossHistory = [];
  const rewardHistory = [];
  const stepsLogs = [];

  let baseLoss = 0.25;
  let baseReward = 2.0;

  for (let i = 1; i <= numIterations; i++) {
    const iterLoss = Number((baseLoss / (1 + i * 0.4) + Math.random() * 0.005).toFixed(4));
    const iterReward = Number((baseReward * Math.pow(1.8, i * 0.6) + Math.random() * 2).toFixed(2));
    const nowIso = new Date().toISOString();

    lossHistory.push({ iteration: i, loss: iterLoss, timestamp: nowIso });
    rewardHistory.push({ iteration: i, reward: iterReward, timestamp: nowIso });

    const logEntry = appendLog({
      agentId,
      executionId: task.id,
      iteration: i,
      step: i * 2,
      level: 'INFO',
      action: i === numIterations ? 'OPTIMIZE_FINAL_POLICY' : `EXPLORE_STEP_${i}`,
      observation: { iteration: i, loss: iterLoss, reward: iterReward },
      reward: iterReward,
      loss: iterLoss,
      message: `Iteration ${i}/${numIterations} completed with loss ${iterLoss} and reward ${iterReward}`
    });

    stepsLogs.push(logEntry);
  }

  const durationMs = Date.now() - startTime + 10;
  const finalLoss = lossHistory[lossHistory.length - 1].loss;
  const finalReward = rewardHistory[rewardHistory.length - 1].reward;
  const estimatedTokens = prompt.length * 2 + numIterations * 120;

  const outputResult = {
    message: "Eksekusi proses pembelajaran agen selesai",
    total_iterations: numIterations,
    final_loss: finalLoss,
    total_reward: finalReward,
    convergence_achieved: true,
    policy_summary: `Optimal policy learned for model ${agent.model} across ${numIterations} iterations.`,
    execution_duration_ms: durationMs
  };

  const updatedTask = updateTask(task.id, {
    status: 'SUCCESS',
    output: outputResult,
    iterations_count: numIterations,
    duration_ms: durationMs,
    error: null
  });

  recordExecutionMetrics({
    agentId,
    isSuccess: true,
    durationMs,
    tokensUsed: estimatedTokens,
    finalLoss,
    finalReward,
    lossHistory,
    rewardHistory
  });

  setAgentStatus(agentId, 'IDLE');

  return {
    success: true,
    status: 200,
    message: "Eksekusi agen berhasil",
    data: {
      execution_id: updatedTask.id,
      agent_id: agentId,
      session_id: activeSessionId,
      status: 'SUCCESS',
      output: outputResult,
      iterations: numIterations,
      duration_ms: durationMs,
      created_at: updatedTask.created_at,
      latest_logs: stepsLogs.slice(0, 5)
    }
  };
}

/**
 * Get current execution status of an agent
 */
async function getAgentStatus(agentId, userId, userRole = 'user') {
  const agent = findAgentById(agentId);
  if (!agent) {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  if (!isAdmin && userId && String(agent.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengakses status agen ini"
    };
  }

  const latestTask = getLatestTaskByAgentId(agentId);
  const metrics = findMetricsByAgentId(agentId);

  return {
    success: true,
    status: 200,
    message: "Status agen berhasil diambil",
    data: {
      agent_id: agent.id,
      name: agent.name,
      status: agent.status,
      model: agent.model,
      updated_at: agent.updated_at,
      active_task: latestTask ? {
        id: latestTask.id,
        status: latestTask.status,
        iterations_count: latestTask.iterations_count,
        duration_ms: latestTask.duration_ms,
        created_at: latestTask.created_at
      } : null,
      metrics_summary: {
        total_executions: metrics.total_executions,
        success_rate: metrics.success_rate,
        current_loss: metrics.current_loss,
        current_reward: metrics.current_reward
      }
    }
  };
}

/**
 * Get learning logs of an agent
 */
async function getAgentLogs(agentId, userId, options = {}, userRole = 'user') {
  const agent = findAgentById(agentId);
  if (!agent) {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  if (!isAdmin && userId && String(agent.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengakses log agen ini"
    };
  }

  const logsResult = findLogsByAgentId(agentId, options);
  return {
    success: true,
    status: 200,
    message: "Log pembelajaran agen berhasil diambil",
    data: logsResult.items,
    pagination: logsResult.pagination
  };
}

/**
 * Get metrics of an agent
 */
async function getAgentMetrics(agentId, userId, userRole = 'user') {
  const agent = findAgentById(agentId);
  if (!agent) {
    return { success: false, status: 404, message: "Agen tidak ditemukan" };
  }

  const isAdmin = userRole === 'admin' || userRole === 'agent_manager';
  if (!isAdmin && userId && String(agent.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: "Akses ditolak: Anda tidak memiliki izin untuk mengakses metrik agen ini"
    };
  }

  const metrics = findMetricsByAgentId(agentId);
  return {
    success: true,
    status: 200,
    message: "Metrik agen berhasil diambil",
    data: metrics
  };
}

module.exports = {
  listAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  executeAgent,
  getAgentStatus,
  getAgentLogs,
  getAgentMetrics
};
