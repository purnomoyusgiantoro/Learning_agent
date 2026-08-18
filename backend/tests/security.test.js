const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const { generateToken } = require('../src/utils/crypto');
const config = require('../src/config/env');

describe('Backend Security, Headers, CORS, and RBAC Suite', () => {
  let server;
  let baseUrl;
  let regularUserToken;
  let adminUserToken;

  before((t, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });

    regularUserToken = generateToken({ id: "1", email: "user@example.com", name: "User Name", role: "user" }, config.tokenSecret);
    adminUserToken = generateToken({ id: "2", email: "admin@example.com", name: "Admin", role: "admin" }, config.tokenSecret);
  });

  after((t, done) => {
    server.close(done);
  });

  test('Security Headers: Response includes comprehensive HTTP hardening headers', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const headers = res.headers;
    assert.strictEqual(headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(headers.get('x-xss-protection'), '1; mode=block');
    assert.ok(headers.get('strict-transport-security'));
    assert.ok(headers.get('content-security-policy'));
    assert.strictEqual(headers.get('referrer-policy'), 'no-referrer-when-downgrade');
    assert.ok(headers.get('permissions-policy'));
  });

  test('CORS: OPTIONS preflight request responds with correct headers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });

    assert.ok(res.status === 200 || res.status === 204);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');
  });

  test('Centralized Error Handling: Catches malformed JSON with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularUserToken}`
      },
      body: '{"invalid_json: true' // Malformed JSON syntax
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('JSON'));
  });

  test('Protected Route without Token returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agents`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });
});
