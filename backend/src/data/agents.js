const crypto = require('crypto');

const DEFAULT_AGENTS = [
  {
    id: "agent-rl-001",
    user_id: "1",
    name: "Q-Learning Grid Navigator",
    description: "Autonomous grid navigation agent optimizing path reward and avoiding obstacles.",
    model: "q-learning-v1",
    system_prompt: "You are an autonomous reinforcement learning agent maximizing environmental reward signals.",
    temperature: 0.7,
    max_tokens: 2048,
    learning_rate: 0.05,
    discount_factor: 0.95,
    exploration_rate: 0.15,
    status: "IDLE",
    created_at: "2026-08-15T10:00:00.000Z",
    updated_at: "2026-08-15T10:00:00.000Z"
  },
  {
    id: "agent-nlp-002",
    user_id: "1",
    name: "Feedback Synthesizer Agent",
    description: "Summarizes user interaction history and calculates policy adjustments.",
    model: "gpt-4o",
    system_prompt: "Analyze agent task traces and extract actionable policy gradients.",
    temperature: 0.3,
    max_tokens: 4096,
    learning_rate: 0.01,
    discount_factor: 0.90,
    exploration_rate: 0.05,
    status: "IDLE",
    created_at: "2026-08-16T12:00:00.000Z",
    updated_at: "2026-08-16T12:00:00.000Z"
  },
  {
    id: "agent-admin-003",
    user_id: "2",
    name: "Admin System Optimizer",
    description: "System agent for cluster load balancing and prompt routing.",
    model: "claude-3-5-sonnet",
    system_prompt: "Optimize system resources and monitor agent performance.",
    temperature: 0.2,
    max_tokens: 8192,
    learning_rate: 0.02,
    discount_factor: 0.99,
    exploration_rate: 0.01,
    status: "IDLE",
    created_at: "2026-08-17T08:00:00.000Z",
    updated_at: "2026-08-17T08:00:00.000Z"
  }
];

let agents = JSON.parse(JSON.stringify(DEFAULT_AGENTS));

/**
 * Find agents by user ID with optional filtering, sorting, pagination
 * @param {string} userId 
 * @param {object} options 
 * @returns {object} { items, total, pagination }
 */
function findAgentsByUserId(userId, options = {}) {
  let userAgents = agents.filter(a => String(a.user_id) === String(userId));

  if (options.status) {
    userAgents = userAgents.filter(a => a.status.toUpperCase() === String(options.status).toUpperCase());
  }

  if (options.model) {
    userAgents = userAgents.filter(a => a.model.toLowerCase() === String(options.model).toLowerCase());
  }

  if (options.search) {
    const q = String(options.search).toLowerCase();
    userAgents = userAgents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
    );
  }

  const sortBy = options.sortBy || options.sort || 'created_at';
  const sortOrder = (options.sortOrder || options.order || 'desc').toLowerCase();

  userAgents.sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 20));
  const total = userAgents.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedItems = userAgents.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

/**
 * Find agent by ID
 * @param {string} id 
 * @returns {object|null}
 */
function findAgentById(id) {
  if (!id) return null;
  return agents.find(a => String(a.id) === String(id)) || null;
}

/**
 * Create a new agent configuration
 * @param {object} param0 
 * @returns {object}
 */
function createAgent({
  userId,
  name,
  description = '',
  model = 'qwen-2.5',
  system_prompt = 'You are an intelligent learning agent.',
  temperature = 0.7,
  max_tokens = 2048,
  learning_rate = 0.01,
  discount_factor = 0.95,
  exploration_rate = 0.1
}) {
  const now = new Date().toISOString();
  const newAgent = {
    id: `agent-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    user_id: String(userId),
    name: String(name).trim(),
    description: description ? String(description).trim() : '',
    model: String(model || 'qwen-2.5').trim(),
    system_prompt: String(system_prompt || '').trim(),
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    max_tokens: typeof max_tokens === 'number' ? max_tokens : 2048,
    learning_rate: typeof learning_rate === 'number' ? learning_rate : 0.01,
    discount_factor: typeof discount_factor === 'number' ? discount_factor : 0.95,
    exploration_rate: typeof exploration_rate === 'number' ? exploration_rate : 0.1,
    status: 'IDLE',
    created_at: now,
    updated_at: now
  };

  agents.unshift(newAgent);
  return newAgent;
}

/**
 * Update agent configuration
 * @param {string} id 
 * @param {string} userId 
 * @param {object} updates 
 * @param {boolean} isAdmin 
 * @returns {object} { agent } or { error: 'NOT_FOUND'|'FORBIDDEN' }
 */
function updateAgent(id, userId, updates = {}, isAdmin = false) {
  const index = agents.findIndex(a => String(a.id) === String(id));
  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  const current = agents[index];
  if (!isAdmin && userId && String(current.user_id) !== String(userId)) {
    return { error: 'FORBIDDEN' };
  }

  const updated = {
    ...current,
    ...updates,
    id: current.id,
    user_id: current.user_id,
    created_at: current.created_at,
    updated_at: new Date().toISOString()
  };

  if (updates.temperature !== undefined) updated.temperature = Number(updates.temperature);
  if (updates.max_tokens !== undefined) updated.max_tokens = Number(updates.max_tokens);
  if (updates.learning_rate !== undefined) updated.learning_rate = Number(updates.learning_rate);
  if (updates.discount_factor !== undefined) updated.discount_factor = Number(updates.discount_factor);
  if (updates.exploration_rate !== undefined) updated.exploration_rate = Number(updates.exploration_rate);

  agents[index] = updated;
  return { agent: updated };
}

/**
 * Set agent status directly (e.g. during execution)
 * @param {string} id 
 * @param {string} status 
 */
function setAgentStatus(id, status) {
  const agent = findAgentById(id);
  if (agent) {
    agent.status = status;
    agent.updated_at = new Date().toISOString();
  }
}

/**
 * Delete agent configuration
 * @param {string} id 
 * @param {string} userId 
 * @param {boolean} isAdmin 
 * @returns {object} { id } or { error: 'NOT_FOUND'|'FORBIDDEN' }
 */
function deleteAgent(id, userId, isAdmin = false) {
  const index = agents.findIndex(a => String(a.id) === String(id));
  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  const current = agents[index];
  if (!isAdmin && userId && String(current.user_id) !== String(userId)) {
    return { error: 'FORBIDDEN' };
  }

  const [removed] = agents.splice(index, 1);
  return { id: removed.id };
}

/**
 * Reset agents store
 */
function resetAgents() {
  agents = JSON.parse(JSON.stringify(DEFAULT_AGENTS));
}

/**
 * Seed custom agents
 */
function seedAgents(initial = []) {
  agents = JSON.parse(JSON.stringify(initial));
}

module.exports = {
  findAgentsByUserId,
  findAgentById,
  createAgent,
  updateAgent,
  setAgentStatus,
  deleteAgent,
  resetAgents,
  seedAgents
};
