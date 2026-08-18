const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');
const { generateToken } = require('../src/utils/crypto');
const config = require('../src/config/env');
const { seedTodos } = require('../src/data/todos');

// Helper to make HTTP requests against express app
function makeRequest(app, options, body = null) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const reqOptions = {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          server.close();
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  });
}

// Generate valid tokens for testing
const user1 = { id: "1", email: "user@example.com", name: "User One" };
const user2 = { id: "2", email: "admin@example.com", name: "Admin Two" };
const tokenUser1 = generateToken(user1, config.tokenSecret);
const tokenUser2 = generateToken(user2, config.tokenSecret);

describe('Backend QA Suite 1: Authentication & Authorization for Todos API', () => {
  test('AUTH-1: GET /api/v1/todos without Authorization header returns 401 Unauthorized', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'GET'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Token autentikasi tidak disediakan/i);
  });

  test('AUTH-2: POST /api/v1/todos with invalid token signature returns 401 Unauthorized', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.invalidsignature123';
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${fakeToken}` }
    }, { title: 'Test invalid token' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('AUTH-3: PATCH /api/v1/todos/1 with malformed Authorization header returns 401', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/1',
      method: 'PATCH',
      headers: { Authorization: 'Basic dXNlcjpwYXNz' }
    }, { is_completed: true });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });
});

describe('Backend QA Suite 2: CRUD Operations & Query Filtering', () => {
  beforeEach(() => {
    seedTodos([
      {
        id: "t-1",
        user_id: "1",
        title: "Tugas A User 1",
        is_completed: false,
        due_date: "2026-09-01",
        priority: "MEDIUM",
        created_at: new Date(Date.now() - 2000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "t-2",
        user_id: "1",
        title: "Tugas B User 1",
        is_completed: true,
        due_date: null,
        priority: "HIGH",
        created_at: new Date(Date.now() - 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "t-3",
        user_id: "2",
        title: "Tugas User 2",
        is_completed: false,
        due_date: null,
        priority: "LOW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  });

  test('CRUD-1: GET /api/v1/todos returns only todos belonging to authenticated user', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 2);
    assert.ok(res.body.data.every(t => t.user_id === "1"));
  });

  test('CRUD-2: GET /api/v1/todos?is_completed=true filters completed items', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos?is_completed=true',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.data[0].id, 't-2');
    assert.strictEqual(res.body.data[0].is_completed, true);
  });

  test('CRUD-3: GET /api/v1/todos?is_completed=false filters active items', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos?is_completed=false',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.data[0].id, 't-1');
    assert.strictEqual(res.body.data[0].is_completed, false);
  });

  test('CRUD-4: POST /api/v1/todos creates new todo with title only', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: 'Belajar Node.js Testing' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Belajar Node.js Testing');
    assert.strictEqual(res.body.data.user_id, '1');
    assert.strictEqual(res.body.data.is_completed, false);
    assert.strictEqual(res.body.data.priority, 'MEDIUM');
  });

  test('CRUD-5: POST /api/v1/todos creates todo with title + due date + priority', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, {
      title: 'Deploy ke Production',
      description: 'Lakukan final audit sebelum rilis',
      due_date: '2026-12-31',
      priority: 'HIGH'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.title, 'Deploy ke Production');
    assert.strictEqual(res.body.data.description, 'Lakukan final audit sebelum rilis');
    assert.strictEqual(res.body.data.due_date, '2026-12-31');
    assert.strictEqual(res.body.data.priority, 'HIGH');
  });

  test('CRUD-6: PATCH /api/v1/todos/:id updates completion status and title', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/t-1',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { is_completed: true, title: 'Tugas A User 1 - Selesai' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.is_completed, true);
    assert.strictEqual(res.body.data.title, 'Tugas A User 1 - Selesai');
  });

  test('CRUD-7: DELETE /api/v1/todos/:id removes the specified item', async () => {
    const delRes = await makeRequest(app, {
      path: '/api/v1/todos/t-1',
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delRes.body.success, true);

    // Verify deletion
    const listRes = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    assert.strictEqual(listRes.body.data.some(t => t.id === 't-1'), false);
  });
});

describe('Backend QA Suite 3: Negative Validation & Error Handling', () => {
  test('NEG-1: POST with empty title or only whitespace returns 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: '     ' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('wajib diisi')));
  });

  test('NEG-2: POST with title exceeding 255 characters returns 400 Bad Request', async () => {
    const longTitle = 'X'.repeat(256);
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: longTitle });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('255 karakter')));
  });

  test('NEG-3: POST with invalid due_date string returns 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: 'Tugas dengan tanggal rusak', due_date: 'bukan-tanggal-valid' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('due_date')));
  });

  test('NEG-4: POST with invalid priority returns 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: 'Tugas prioritas salah', priority: 'URGENT_NOW' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('LOW, MEDIUM, HIGH')));
  });

  test('NEG-5: PATCH non-existent todo ID returns 404 Not Found', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/non-existent-id-999',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { is_completed: true });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });
});

describe('Backend QA Suite 4: Security Verification (Zero-IDOR, XSS, Rate Limiting)', () => {
  beforeEach(() => {
    seedTodos([
      {
        id: "target-user2-todo",
        user_id: "2",
        title: "Dokumen Pribadi User 2",
        is_completed: false,
        due_date: null,
        priority: "HIGH",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  });

  test('IDOR-1: User 1 attempting to GET User 2 todo detail returns 403 Forbidden', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/target-user2-todo',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /tidak memiliki izin/i);
  });

  test('IDOR-2: User 1 attempting to PATCH User 2 todo returns 403 Forbidden', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/target-user2-todo',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { is_completed: true, title: 'Hacked title' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('IDOR-3: User 1 attempting to DELETE User 2 todo returns 403 Forbidden', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/todos/target-user2-todo',
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('XSS-1: Payload script is saved safely as raw text data without execution', async () => {
    const xssPayload = '<script>alert("XSS-ATTACK")</script>';
    const res = await makeRequest(app, {
      path: '/api/v1/todos',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenUser1}` }
    }, { title: xssPayload, description: '<img src=x onerror=alert(1)>' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.title, xssPayload);
    assert.strictEqual(res.body.data.description, '<img src=x onerror=alert(1)>');
  });

  test('RATE-1: Rate limiter rejects excessive mutation requests with 429 Too Many Requests', async () => {
    const server = http.createServer(app);
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;

    const makeSinglePost = () => {
      return new Promise((resolve) => {
        const req = http.request({
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/todos',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenUser1}`
          }
        }, res => {
          let d = '';
          res.on('data', chunk => d += chunk);
          res.on('end', () => resolve(res.statusCode));
        });
        req.write(JSON.stringify({ title: 'Flooding request' }));
        req.end();
      });
    };

    // Send 30 requests rapidly
    const responses = await Promise.all(
      Array.from({ length: 30 }, () => makeSinglePost())
    );

    server.close();

    const rateLimitedCount = responses.filter(code => code === 429).length;
    assert.ok(rateLimitedCount > 0, `Expected some requests to be rate limited (429), received: ${JSON.stringify(responses)}`);
  });
});
