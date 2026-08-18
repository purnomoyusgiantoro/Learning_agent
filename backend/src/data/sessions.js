const crypto = require('crypto');

const DEFAULT_SESSIONS = [
  {
    id: "session-101",
    agent_id: "agent-rl-001",
    user_id: "1",
    title: "Gridworld Navigation Optimization Session",
    status: "ACTIVE",
    context_data: { grid_size: [10, 10], start: [0, 0], goal: [9, 9] },
    created_at: "2026-08-18T09:00:00.000Z",
    updated_at: "2026-08-18T09:00:00.000Z"
  }
];

let sessions = JSON.parse(JSON.stringify(DEFAULT_SESSIONS));

function findSessionsByAgentId(agentId, userId) {
  return sessions.filter(s => String(s.agent_id) === String(agentId) && (userId ? String(s.user_id) === String(userId) : true));
}

function findSessionById(id) {
  if (!id) return null;
  return sessions.find(s => String(s.id) === String(id)) || null;
}

function createSession({ agentId, userId, title = 'New Learning Session', context_data = {} }) {
  const now = new Date().toISOString();
  const newSession = {
    id: `session-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    agent_id: String(agentId),
    user_id: String(userId),
    title: String(title).trim(),
    status: "ACTIVE",
    context_data: context_data || {},
    created_at: now,
    updated_at: now
  };
  sessions.unshift(newSession);
  return newSession;
}

function updateSession(id, userId, updates = {}) {
  const index = sessions.findIndex(s => String(s.id) === String(id));
  if (index === -1) return { error: 'NOT_FOUND' };
  if (userId && String(sessions[index].user_id) !== String(userId)) return { error: 'FORBIDDEN' };

  sessions[index] = {
    ...sessions[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return { session: sessions[index] };
}

function resetSessions() {
  sessions = JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
}

module.exports = {
  findSessionsByAgentId,
  findSessionById,
  createSession,
  updateSession,
  resetSessions
};
