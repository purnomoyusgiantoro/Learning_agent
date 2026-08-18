const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../backend/src/app');

describe('Full End-to-End (E2E) Learning Agent Life Cycle & Flow Verification', () => {
  let server;
  let baseUrl;
  let userToken;
  let agentId;
  let executionId;

  before(async () => {
    await new Promise(resolve => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Authenticate user
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'securepassword123'
      })
    });
    const body = await res.json();
    userToken = body.data.token;
  });

  after((t, done) => {
    server.close(done);
  });

  test('E2E-FLOW-1: Step 1 - Initialize and configure new Learning Agent', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'E2E Deep Learning Agent',
        description: 'End-to-end multi-agent test runner with policy gradient learning',
        model: 'gemini-1.5-pro',
        system_prompt: 'You are an intelligent reasoning agent that learns from trial and error feedback.',
        temperature: 0.6,
        max_tokens: 2048,
        learning_rate: 0.05,
        discount_factor: 0.99,
        exploration_rate: 0.20
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.id, 'Agent must have ID');
    agentId = body.data.id;
  });

  test('E2E-FLOW-2: Step 2 - Trigger learning loop execution (prompt -> inference -> feedback -> output)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        prompt: 'Analyze performance bottlenecks in database indexes and produce optimal indexing policy',
        iterations: 8,
        parameters: {
          workload_type: 'read_heavy',
          max_indexes: 5
        }
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'SUCCESS');
    assert.strictEqual(body.data.iterations, 8);
    assert.ok(body.data.execution_id, 'Execution ID must be present');
    assert.ok(body.data.output.final_loss < 0.25, 'Loss should decrease across iterations');
    assert.ok(body.data.output.total_reward > 0, 'Reward should be accumulated');
    executionId = body.data.execution_id;
  });

  test('E2E-FLOW-3: Step 3 - Poll agent real-time status and verify metrics synchronization', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.agent_id, agentId);
    assert.strictEqual(body.data.status, 'IDLE');
    assert.ok(body.data.active_task, 'Active task record should exist');
    assert.strictEqual(body.data.active_task.id, executionId);
  });

  test('E2E-FLOW-4: Step 4 - Verify pagination and filtering on agent learning logs', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/logs?page=1&limit=5&level=INFO`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data), 'Logs should be an array');
    assert.strictEqual(body.data.length, 5, 'Page limit should be respected');
    assert.strictEqual(body.pagination.page, 1);
    assert.ok(body.pagination.total >= 8);
  });

  test('E2E-FLOW-5: Step 5 - Verify agent metrics endpoint and convergence trend', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/metrics`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.total_executions >= 1);
    assert.strictEqual(body.data.success_rate, 100);
    assert.ok(body.data.loss_history.length >= 8);
  });

  test('E2E-FLOW-6: Step 6 - Cleanup & delete agent', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);

    // Verify 404 after deletion
    const verifyRes = await fetch(`${baseUrl}/api/v1/agents/${agentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert.strictEqual(verifyRes.status, 404);
  });
});
