const { resetUsers, seedUsers, getAllUsers } = require('./users');
const { resetTodos, seedTodos } = require('./todos');
const { resetAgents, seedAgents } = require('./agents');
const { resetSessions } = require('./sessions');
const { resetTasks } = require('./tasks');
const { resetLogs } = require('./learningLogs');
const { resetMetrics } = require('./metrics');

/**
 * Reset entire in-memory database to initial state
 */
function resetDatabase() {
  resetUsers();
  resetTodos();
  resetAgents();
  resetSessions();
  resetTasks();
  resetLogs();
  resetMetrics();
}

/**
 * Seed database with optional custom fixtures
 * @param {object} fixtures 
 */
function seedDatabase(fixtures = {}) {
  if (fixtures.users) seedUsers(fixtures.users);
  if (fixtures.todos) seedTodos(fixtures.todos);
  if (fixtures.agents) seedAgents(fixtures.agents);
}

module.exports = {
  resetDatabase,
  seedDatabase
};
