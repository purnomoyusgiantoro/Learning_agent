const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const app = require('../src/app');
const { resetTodos } = require('../src/data/todos');
const { generateToken } = require('../src/utils/crypto');
const { resetRateLimits, createRateLimiter } = require('../src/middlewares/rateLimiter');
const config = require('../src/config/env');

describe('Todos Security & IDOR & Rate Limiting Tests', () => {
  let server;
  let baseUrl;
  let user1Token;
  let user2Token;

  const user1TodoId = 'e4a2d3b4-1001-4000-8000-000000000001';
  const user2TodoId = 'e4a2d3b4-2002-4000-8000-000000000001';

  before((t, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });

    user1Token = generateToken({ id: '1', email: 'user@example.com', name: 'User Name' }, config.tokenSecret);
    user2Token = generateToken({ id: '2', email: 'admin@example.com', name: 'Administrator' }, config.tokenSecret);
  });

  beforeEach(() => {
    resetTodos();
    resetRateLimits();
  });

  after((t, done) => {
    server.close(done);
  });

  test('IDOR Protection: User 1 cannot GET User 2 todo (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos/${user2TodoId}`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('Akses ditolak'));
  });

  test('IDOR Protection: User 1 cannot PATCH User 2 todo (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos/${user2TodoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user1Token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_completed: true, title: 'Hacked Title' })
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('Akses ditolak'));
  });

  test('IDOR Protection: User 1 cannot DELETE User 2 todo (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos/${user2TodoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('Akses ditolak'));
  });

  test('IDOR Protection: User 2 cannot access or mutate User 1 todo (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos/${user1TodoId}`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('Security: Request with tampered JWT signature is rejected with 401', async () => {
    const tamperedToken = user1Token.slice(0, -5) + 'abcde';
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      headers: { 'Authorization': `Bearer ${tamperedToken}` }
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('Security: Request with expired token is rejected with 401', async () => {
    // Generate expired token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: '1',
      email: 'user@example.com',
      name: 'User Name',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60 // expired 1 minute ago
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', config.tokenSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const expiredToken = `${header}.${payload}.${signature}`;

    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('kedaluwarsa'));
  });

  test('Security: Request with non-existent user token is rejected with 401', async () => {
    const phantomUserToken = generateToken({ id: '999999', email: 'phantom@example.com', name: 'Ghost' }, config.tokenSecret);
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      headers: { 'Authorization': `Bearer ${phantomUserToken}` }
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('Validation: Rejects title exceeding 255 characters with 400', async () => {
    const longTitle = 'A'.repeat(256);
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user1Token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: longTitle })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.some(e => e.includes('maksimal 255 karakter')));
  });

  test('Validation: Rejects invalid priority enum with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user1Token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Valid Title',
        priority: 'SUPER_URGENT_INVALID'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.some(e => e.includes('Prioritas (priority)')));
  });

  test('Validation: Rejects invalid due_date string format with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user1Token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Valid Title',
        due_date: 'not-a-valid-date-string'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.some(e => e.includes('Format due_date tidak valid')));
  });

  test('Security: XSS payload in title & description is stored safely without script execution', async () => {
    const xssPayload = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const res = await fetch(`${baseUrl}/api/v1/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user1Token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: xssPayload,
        description: xssPayload
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.title, xssPayload);
    assert.strictEqual(body.data.description, xssPayload);
  });

  test('Security & Rate Limiting: Rate limiter returns 429 after exceeding request limit', async () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 3, message: 'Too many requests' });
    const dummyReq = { ip: '127.0.0.1', path: '/test-burst', user: { id: 'test_user_rate' } };
    const dummyRes = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      statusCode: 200,
      jsonPayload: null,
      status(code) {
        this.statusCode = code;
        return {
          json: (data) => { this.jsonPayload = data; }
        };
      }
    };

    let nextCalled = 0;
    const next = () => { nextCalled++; };

    // Request 1, 2, 3 should pass
    limiter(dummyReq, dummyRes, next);
    limiter(dummyReq, dummyRes, next);
    limiter(dummyReq, dummyRes, next);
    assert.strictEqual(nextCalled, 3);

    // Request 4 should be blocked with 429
    limiter(dummyReq, dummyRes, next);
    assert.strictEqual(dummyRes.statusCode, 429);
    assert.strictEqual(dummyRes.jsonPayload.success, false);
    assert.ok(dummyRes.headers['Retry-After'] >= 1);
  });
});
