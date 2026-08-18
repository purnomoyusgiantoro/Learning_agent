const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

describe('Health & Status Endpoints', () => {
  let server;
  let baseUrl;

  before((t, done) => {
    // Start on random available port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      done();
    });
  });

  after((t, done) => {
    server.close(done);
  });

  test('GET / returns 200 and server info', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'online');
    assert.ok(body.endpoints);
  });

  test('GET /api/health returns 200 and status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.message, 'Backend server is running');
    assert.ok(body.timestamp);
  });

  test('GET /non-existent-endpoint returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });
});
