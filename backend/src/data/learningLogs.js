const crypto = require('crypto');

const DEFAULT_LOGS = [
  {
    id: "log-seed-001",
    agent_id: "agent-rl-001",
    execution_id: "exec-initial-001",
    iteration: 1,
    step: 1,
    level: "INFO",
    action: "MOVE_FORWARD",
    observation: { position: [0, 1], distance_to_goal: 12.7 },
    reward: 1.0,
    loss: 0.125,
    message: "Exploration step executed successfully",
    created_at: "2026-08-18T09:05:00.100Z"
  },
  {
    id: "log-seed-002",
    agent_id: "agent-rl-001",
    execution_id: "exec-initial-001",
    iteration: 1,
    step: 2,
    level: "INFO",
    action: "TURN_RIGHT",
    observation: { position: [1, 1], distance_to_goal: 11.3 },
    reward: 2.0,
    loss: 0.084,
    message: "Q-value table updated with gradient step",
    created_at: "2026-08-18T09:05:00.200Z"
  },
  {
    id: "log-seed-003",
    agent_id: "agent-rl-001",
    execution_id: "exec-initial-001",
    iteration: 5,
    step: 10,
    level: "INFO",
    action: "REACH_GOAL",
    observation: { position: [9, 9], distance_to_goal: 0 },
    reward: 50.0,
    loss: 0.012,
    message: "Target goal reached. Policy episode finalized.",
    created_at: "2026-08-18T09:05:00.800Z"
  }
];

let logs = JSON.parse(JSON.stringify(DEFAULT_LOGS));

function findLogsByAgentId(agentId, options = {}) {
  let list = logs.filter(l => String(l.agent_id) === String(agentId));

  if (options.execution_id) {
    list = list.filter(l => String(l.execution_id) === String(options.execution_id));
  }

  if (options.iteration !== undefined && options.iteration !== null && options.iteration !== '') {
    list = list.filter(l => l.iteration === parseInt(options.iteration, 10));
  }

  if (options.level) {
    list = list.filter(l => l.level.toUpperCase() === String(options.level).toUpperCase());
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 50));
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  return {
    items: list.slice(offset, offset + limit),
    total,
    pagination: {
      total,
      total_items: total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

function appendLog({
  agentId,
  executionId,
  iteration = 1,
  step = 1,
  level = 'INFO',
  action = 'ACTION',
  observation = {},
  reward = 0,
  loss = 0,
  message = ''
}) {
  const newLog = {
    id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    agent_id: String(agentId),
    execution_id: executionId ? String(executionId) : null,
    iteration: Number(iteration),
    step: Number(step),
    level: String(level || 'INFO').toUpperCase(),
    action: String(action || 'STEP'),
    observation: observation || {},
    reward: Number(reward || 0),
    loss: Number(loss || 0),
    message: String(message || ''),
    created_at: new Date().toISOString()
  };

  logs.unshift(newLog);
  return newLog;
}

function resetLogs() {
  logs = JSON.parse(JSON.stringify(DEFAULT_LOGS));
}

module.exports = {
  findLogsByAgentId,
  appendLog,
  resetLogs
};
