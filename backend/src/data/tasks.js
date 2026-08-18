const crypto = require('crypto');

const DEFAULT_TASKS = [
  {
    id: "exec-initial-001",
    agent_id: "agent-rl-001",
    session_id: "session-101",
    user_id: "1",
    prompt: "Train grid navigation policy on 10x10 maze environment with 5 obstacles.",
    parameters: { iterations: 5, learning_rate: 0.05, discount_factor: 0.95 },
    status: "SUCCESS",
    output: {
      message: "Policy converged successfully",
      total_reward: 48.5,
      average_loss: 0.042,
      convergence_step: 4,
      best_path_length: 18
    },
    iterations_count: 5,
    duration_ms: 124,
    error: null,
    created_at: "2026-08-18T09:05:00.000Z",
    updated_at: "2026-08-18T09:05:01.000Z"
  }
];

let tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));

function findTasksByAgentId(agentId, userId, options = {}) {
  let list = tasks.filter(t => String(t.agent_id) === String(agentId) && (userId ? String(t.user_id) === String(userId) : true));
  
  if (options.status) {
    list = list.filter(t => t.status.toUpperCase() === String(options.status).toUpperCase());
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 20));
  const offset = (page - 1) * limit;

  return {
    items: list.slice(offset, offset + limit),
    total: list.length,
    pagination: {
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1
    }
  };
}

function findTaskById(id) {
  if (!id) return null;
  return tasks.find(t => String(t.id) === String(id)) || null;
}

function getLatestTaskByAgentId(agentId) {
  const list = tasks.filter(t => String(t.agent_id) === String(agentId));
  if (list.length === 0) return null;
  return list[0]; // Assuming list is sorted desc or latest unshifted
}

function createTask({
  agentId,
  sessionId = null,
  userId,
  prompt,
  parameters = {},
  status = "PENDING"
}) {
  const now = new Date().toISOString();
  const newTask = {
    id: `exec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    agent_id: String(agentId),
    session_id: sessionId || `session-${Date.now()}`,
    user_id: String(userId),
    prompt: String(prompt).trim(),
    parameters: parameters || {},
    status,
    output: null,
    iterations_count: 0,
    duration_ms: 0,
    error: null,
    created_at: now,
    updated_at: now
  };

  tasks.unshift(newTask);
  return newTask;
}

function updateTask(id, updates = {}) {
  const index = tasks.findIndex(t => String(t.id) === String(id));
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return tasks[index];
}

function resetTasks() {
  tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
}

module.exports = {
  findTasksByAgentId,
  findTaskById,
  getLatestTaskByAgentId,
  createTask,
  updateTask,
  resetTasks
};
