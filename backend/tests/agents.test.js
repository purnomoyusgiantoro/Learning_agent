const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

describe('Learning Agent Core CRUD & Execution Test Suite', () => {
  let server;
  let baseUrl;
  let authToken;
  let createdAgentId;

  before((t, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((t, done) => {
    server.close(done);
  });

  test('Auth Setup: Login to obtain valid Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'securepassword123'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    authToken = body.data.token;
  });

  test('AGENT-1: POST /api/v1/agents creates a new Learning Agent configuration', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Autonomous Code Optimizer Agent',
        description: 'Multi-agent optimizer for code refactoring and QA verification',
        model: 'gemini-1.5-pro',
        system_prompt: 'You are an autonomous learning agent optimizing system performance.',
        temperature: 0.7,
        max_tokens: 4096,
        learning_rate: 0.01,
        discount_factor: 0.95,
        exploration_rate: 0.15
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, 'Autonomous Code Optimizer Agent');
    assert.strictEqual(body.data.model, 'gemini-1.5-pro');
    assert.strictEqual(body.data.temperature, 0.7);
    assert.ok(body.data.id, 'Agent should have unique ID');
    createdAgentId = body.data.id;
  });

  test('AGENT-2: GET /api/v1/agents returns user agent configurations list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data), 'Data should be an array');
    const agent = body.data.find(a => a.id === createdAgentId);
    assert.ok(agent, 'Created agent should be in the list');
  });

  test('AGENT-3: GET /api/v1/agents/:id returns detailed agent configuration and metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.id, createdAgentId);
    assert.strictEqual(body.data.name, 'Autonomous Code Optimizer Agent');
    assert.ok(body.data.metrics, 'Agent detail should include metrics summary');
  });

  test('AGENT-4: PATCH /api/v1/agents/:id updates agent configuration and hyperparameters', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        description: 'Updated description for multi-agent learning loop',
        temperature: 0.5,
        exploration_rate: 0.05
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.description, 'Updated description for multi-agent learning loop');
    assert.strictEqual(body.data.temperature, 0.5);
    assert.strictEqual(body.data.exploration_rate, 0.05);
  });

  test('AGENT-5: POST /api/v1/agents/:id/execute runs learning loop and returns iterative feedback', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        prompt: 'Optimize the memory consumption of database query cache',
        iterations: 6,
        parameters: {
          batch_size: 32,
          optimizer: 'adam'
        }
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'SUCCESS');
    assert.strictEqual(body.data.iterations, 6);
    assert.ok(body.data.output, 'Output should be present');
    assert.strictEqual(body.data.output.convergence_achieved, true);
    assert.ok(body.data.output.total_reward > 0, 'Total reward should be positive');
  });

  test('AGENT-6: GET /api/v1/agents/:id/status returns real-time agent status & metrics summary', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.agent_id, createdAgentId);
    assert.ok(body.data.metrics_summary.total_executions >= 1, 'Total executions should be recorded');
  });

  test('AGENT-7: GET /api/v1/agents/:id/logs returns paginated learning iteration logs', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}/logs?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data), 'Logs should be an array');
    assert.ok(body.data.length > 0, 'Should return execution logs');
    assert.ok(body.pagination, 'Pagination should be present');
  });

  test('AGENT-8: GET /api/v1/agents/:id/metrics returns learning metrics and loss/reward histories', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}/metrics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.loss_history.length > 0, 'Loss history should have entries');
    assert.ok(body.data.reward_history.length > 0, 'Reward history should have entries');
  });

  test('AGENT-9: DELETE /api/v1/agents/:id removes the agent configuration', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${createdAgentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });
});
