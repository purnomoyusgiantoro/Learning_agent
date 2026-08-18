const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const { resetDatabase } = require('../src/data/database');
const { generateToken } = require('../src/utils/crypto');
const config = require('../src/config/env');

describe('Agent Execution, Status Polling, Logs, and Metrics Endpoints', () => {
  let server;
  let baseUrl;
  let user1Token;
  let user2Token;

  before((t, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });

    user1Token = generateToken({ id: "1", email: "user@example.com", name: "User Name", role: "user" }, config.tokenSecret);
    user2Token = generateToken({ id: "2", email: "admin@example.com", name: "Administrator", role: "admin" }, config.tokenSecret);
  });

  after((t, done) => {
    server.close(done);
  });

  test('POST /api/v1/agents/:id/execute runs learning loop and produces output', async () => {
    const payload = {
      prompt: "Find shortest obstacle-free path from (0,0) to (9,9) on 10x10 grid.",
      iterations: 3,
      parameters: { learning_rate: 0.05, discount_factor: 0.95 }
    };

    const res = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.execution_id);
    assert.strictEqual(body.data.status, 'SUCCESS');
    assert.strictEqual(body.data.iterations, 3);
    assert.ok(body.data.duration_ms >= 0);
    assert.ok(body.data.output);
    assert.strictEqual(body.data.output.convergence_achieved, true);
    assert.ok(Array.isArray(body.data.latest_logs));
    assert.ok(body.data.latest_logs.length > 0);
  });

  test('GET /api/v1/agents/:id/status returns real-time agent status and latest task', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/status`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.agent_id, 'agent-rl-001');
    assert.strictEqual(body.data.status, 'IDLE');
    assert.ok(body.data.metrics_summary);
  });

  test('GET /api/v1/agents/:id/logs retrieves iteration learning logs with pagination', async () => {
    // Run an execution first
    await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "Test log generation", iterations: 2 })
    });

    const res = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/logs?limit=10`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.data[0].level);
    assert.ok(body.data[0].action);
    assert.ok(body.pagination);
  });

  test('GET /api/v1/agents/:id/metrics retrieves full performance metrics and loss/reward history', async () => {
    // Run an execution
    await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "Calculate metrics delta", iterations: 3 })
    });

    const res = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/metrics`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.total_executions > 0);
    assert.ok(Array.isArray(body.data.loss_history));
    assert.ok(Array.isArray(body.data.reward_history));
    assert.ok(typeof body.data.success_rate === 'number');
  });

  test('IDOR Security: User 1 cannot trigger execution or view logs of User 2 agent (403 Forbidden)', async () => {
    // Attempt execute
    const execRes = await fetch(`${baseUrl}/api/v1/agents/agent-admin-003/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "Unauthorized execution attempt" })
    });
    assert.strictEqual(execRes.status, 403);

    // Attempt get logs
    const logsRes = await fetch(`${baseUrl}/api/v1/agents/agent-admin-003/logs`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert.strictEqual(logsRes.status, 403);

    // Attempt get metrics
    const metricsRes = await fetch(`${baseUrl}/api/v1/agents/agent-admin-003/metrics`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert.strictEqual(metricsRes.status, 403);
  });

  test('Validation: Rejects execution with empty prompt or invalid iterations (400 Bad Request)', async () => {
    // Empty prompt
    const res1 = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "" })
    });
    assert.strictEqual(res1.status, 400);

    // Invalid iterations (> 100)
    const res2 = await fetch(`${baseUrl}/api/v1/agents/agent-rl-001/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "Valid prompt", iterations: 500 })
    });
    assert.strictEqual(res2.status, 400);

    // Non-existent agent (404)
    const res3 = await fetch(`${baseUrl}/api/v1/agents/non-existent-agent-id/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: "Valid prompt" })
    });
    assert.strictEqual(res3.status, 404);
  });
});
