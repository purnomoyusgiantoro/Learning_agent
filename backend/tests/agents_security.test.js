const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

describe('Learning Agent Security, IDOR Protection & Boundary Validation Tests', () => {
  let server;
  let baseUrl;
  let user1Token;
  let user2Token;
  let user1AgentId;

  before(async () => {
    await new Promise(resolve => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Login User 1 (user@example.com)
    const res1 = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'securepassword123'
      })
    });
    const body1 = await res1.json();
    user1Token = body1.data.token;

    // 2. Register & Login User 2 (agent_tester2@example.com)
    await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Agent Tester 2',
        email: 'agent_tester2@example.com',
        password: 'password123'
      })
    });

    const res2 = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent_tester2@example.com',
        password: 'password123'
      })
    });
    const body2 = await res2.json();
    user2Token = body2.data.token;

    // 3. User 1 creates an agent
    const createRes = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        name: 'User 1 Confidential Agent',
        description: 'Private research model for user 1',
        model: 'gemini-1.5-pro',
        temperature: 0.8
      })
    });
    const createBody = await createRes.json();
    user1AgentId = createBody.data.id;
  });

  after((t, done) => {
    server.close(done);
  });

  test('IDOR-AGENT-1: User 2 attempting to GET User 1 agent is blocked with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('izin') || body.message.includes('Akses ditolak'));
  });

  test('IDOR-AGENT-2: User 2 attempting to PATCH User 1 agent is blocked with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user2Token}`
      },
      body: JSON.stringify({ name: 'Hacked Agent Name' })
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('IDOR-AGENT-3: User 2 attempting to DELETE User 1 agent is blocked with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('IDOR-AGENT-4: User 2 attempting to EXECUTE User 1 agent is blocked with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user2Token}`
      },
      body: JSON.stringify({ prompt: 'Unauthorized execution test' })
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('IDOR-AGENT-5: User 2 attempting to view User 1 agent logs is blocked with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}/logs`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('AUTH-AGENT-1: Requests without Authorization header are rejected with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, { method: 'GET' });
    assert.strictEqual(res.status, 401);
  });

  test('AUTH-AGENT-2: Requests with tampered/invalid token signature return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid.tampered.token.signature' }
    });
    assert.strictEqual(res.status, 401);
  });

  test('BOUND-AGENT-1: Create agent with empty name is rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({ name: '   ' })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors && body.errors.length > 0);
  });

  test('BOUND-AGENT-2: Create agent with temperature out of bounds (> 2.0) is rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        name: 'Out of Bounds Agent',
        temperature: 3.5
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('BOUND-AGENT-3: Execute agent with empty prompt is rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({ prompt: '' })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('BOUND-AGENT-4: Execute agent with invalid iterations (> 100) is rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/${user1AgentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        prompt: 'Valid prompt string',
        iterations: 500
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('BOUND-AGENT-5: Access non-existent agent returns 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents/non-existent-agent-999999`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });
});
