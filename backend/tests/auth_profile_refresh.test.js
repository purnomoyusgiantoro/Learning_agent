const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

describe('Auth Profile & Token Refresh Endpoints', () => {
  let server;
  let baseUrl;
  let authToken;
  let refreshToken;

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

  test('Setup: Login to obtain valid tokens', async () => {
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
    refreshToken = body.data.refreshToken;
    assert.ok(authToken, 'Token should exist');
    assert.ok(refreshToken, 'RefreshToken should exist');
  });

  test('GET /api/profile with valid Bearer token returns 200 and user profile', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'user@example.com');
    assert.strictEqual(body.data.name, 'User Name');
  });

  test('GET /api/auth/profile alias works as expected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'user@example.com');
  });

  test('GET /api/profile without Authorization header returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      method: 'GET'
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('POST /api/refresh with valid refreshToken in body returns 200 and renewed tokens', async () => {
    const res = await fetch(`${baseUrl}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token, 'Should return new access token');
    assert.ok(body.data.refreshToken, 'Should return new refresh token');
  });

  test('POST /api/auth/refresh alias with Bearer token in header returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  test('POST /api/refresh without any token returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('POST /api/refresh with invalid token returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid.token.payload'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });
});
