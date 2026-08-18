const DEFAULT_METRICS = [
  {
    id: "metrics-rl-001",
    agent_id: "agent-rl-001",
    total_executions: 12,
    successful_executions: 11,
    failed_executions: 1,
    success_rate: 91.67,
    avg_latency_ms: 115.4,
    total_tokens_used: 18450,
    current_loss: 0.012,
    current_reward: 50.0,
    loss_history: [
      { iteration: 1, loss: 0.125, timestamp: "2026-08-18T09:05:00.100Z" },
      { iteration: 2, loss: 0.084, timestamp: "2026-08-18T09:05:00.200Z" },
      { iteration: 3, loss: 0.045, timestamp: "2026-08-18T09:05:00.400Z" },
      { iteration: 4, loss: 0.021, timestamp: "2026-08-18T09:05:00.600Z" },
      { iteration: 5, loss: 0.012, timestamp: "2026-08-18T09:05:00.800Z" }
    ],
    reward_history: [
      { iteration: 1, reward: 1.0, timestamp: "2026-08-18T09:05:00.100Z" },
      { iteration: 2, reward: 5.0, timestamp: "2026-08-18T09:05:00.200Z" },
      { iteration: 3, reward: 18.0, timestamp: "2026-08-18T09:05:00.400Z" },
      { iteration: 4, reward: 35.0, timestamp: "2026-08-18T09:05:00.600Z" },
      { iteration: 5, reward: 50.0, timestamp: "2026-08-18T09:05:00.800Z" }
    ],
    updated_at: "2026-08-18T09:05:01.000Z"
  }
];

let metricsList = JSON.parse(JSON.stringify(DEFAULT_METRICS));

function findMetricsByAgentId(agentId) {
  let m = metricsList.find(item => String(item.agent_id) === String(agentId));
  if (!m) {
    // Create initialized default metrics if not exists
    m = {
      id: `metrics-${agentId}`,
      agent_id: String(agentId),
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      success_rate: 100.0,
      avg_latency_ms: 0,
      total_tokens_used: 0,
      current_loss: 0,
      current_reward: 0,
      loss_history: [],
      reward_history: [],
      updated_at: new Date().toISOString()
    };
    metricsList.push(m);
  }
  return m;
}

function recordExecutionMetrics({
  agentId,
  isSuccess = true,
  durationMs = 0,
  tokensUsed = 0,
  finalLoss = 0,
  finalReward = 0,
  lossHistory = [],
  rewardHistory = []
}) {
  const m = findMetricsByAgentId(agentId);
  const now = new Date().toISOString();

  m.total_executions += 1;
  if (isSuccess) {
    m.successful_executions += 1;
  } else {
    m.failed_executions += 1;
  }

  m.success_rate = Number(((m.successful_executions / m.total_executions) * 100).toFixed(2));
  m.avg_latency_ms = Number(((m.avg_latency_ms * (m.total_executions - 1) + durationMs) / m.total_executions).toFixed(1));
  m.total_tokens_used += tokensUsed;
  m.current_loss = finalLoss;
  m.current_reward = finalReward;

  if (Array.isArray(lossHistory) && lossHistory.length > 0) {
    m.loss_history = m.loss_history.concat(lossHistory).slice(-50); // Keep last 50
  }
  if (Array.isArray(rewardHistory) && rewardHistory.length > 0) {
    m.reward_history = m.reward_history.concat(rewardHistory).slice(-50);
  }

  m.updated_at = now;
  return m;
}

function resetMetrics() {
  metricsList = JSON.parse(JSON.stringify(DEFAULT_METRICS));
}

module.exports = {
  findMetricsByAgentId,
  recordExecutionMetrics,
  resetMetrics
};
