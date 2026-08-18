const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

// Backend and Frontend imports
const app = require('../backend/src/app');
const { generateToken } = require('../backend/src/utils/crypto');
const { seedTodos, resetTodos } = require('../backend/src/data/todos');
const config = require('../backend/src/config/env');

const DASHBOARD_PATH = path.resolve(__dirname, '../frontend/halaman2.html');
const DASHBOARD_HTML = fs.readFileSync(DASHBOARD_PATH, 'utf8');

// Helper to make HTTP requests
function apiRequest(serverUrl, path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, serverUrl);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

describe('QA-E2E Suite 1: Functional & UI Verification on Welcome Section', () => {
  test('FE-E2E-1: Todo List widget is positioned inside Welcome Section / Dashboard container', () => {
    assert.match(
      DASHBOARD_HTML,
      /<section\b(?=[^>]*\bid=["']todoListCard["'])(?=[^>]*\bclass=["'][^"']*todo-card[^"']*)[^>]*>/i,
      'TodoListCard widget must be present'
    );
    // Ensure it is inside .dashboard-container
    const cardIndex = DASHBOARD_HTML.indexOf('id="todoListCard"');
    const containerIndex = DASHBOARD_HTML.indexOf('class="dashboard-container"');
    assert.ok(containerIndex !== -1 && cardIndex > containerIndex, 'TodoListCard must be inside .dashboard-container');
  });

  test('FE-E2E-2: Header contains progress badge and counters', () => {
    assert.match(DASHBOARD_HTML, /id=["']todoProgressBadge["']/i);
    assert.match(DASHBOARD_HTML, /id=["']completedCountBadge["']/i);
    assert.match(DASHBOARD_HTML, /id=["']totalCountBadge["']/i);
  });

  test('FE-E2E-3: Input form contains title, due date, and submit button with valid attributes', () => {
    assert.match(DASHBOARD_HTML, /<input\b(?=[^>]*\bid=["']todoTitleInput["'])(?=[^>]*\bmaxlength=["']255["'])[^>]*>/i);
    assert.match(DASHBOARD_HTML, /<input\b(?=[^>]*\bid=["']todoDueDateInput["'])(?=[^>]*\btype=["']date["'])[^>]*>/i);
    assert.match(DASHBOARD_HTML, /<button\b(?=[^>]*\bid=["']addTodoBtn["'])(?=[^>]*\btype=["']submit["'])[^>]*>/i);
  });

  test('FE-E2E-4: Filter tabs support All, Active, and Completed', () => {
    assert.match(DASHBOARD_HTML, /id=["']filterAll["']/i);
    assert.match(DASHBOARD_HTML, /id=["']filterActive["']/i);
    assert.match(DASHBOARD_HTML, /id=["']filterCompleted["']/i);
  });

  test('FE-E2E-5: Skeleton loader and empty state elements exist with appropriate semantic markup', () => {
    assert.match(DASHBOARD_HTML, /id=["']todoSkeletonLoader["']/i);
    assert.match(DASHBOARD_HTML, /id=["']todoEmptyState["']/i);
    assert.match(DASHBOARD_HTML, /class=["'][^"']*empty-title[^"']*["']/i);
  });

  test('FE-E2E-6: Toast notification and Delete confirmation modal exist for safe interaction', () => {
    assert.match(DASHBOARD_HTML, /id=["']todoToast["']/i);
    assert.match(DASHBOARD_HTML, /id=["']deleteConfirmModal["']/i);
    assert.match(DASHBOARD_HTML, /id=["']confirmDeleteBtn["']/i);
    assert.match(DASHBOARD_HTML, /id=["']cancelDeleteBtn["']/i);
  });
});

describe('QA-E2E Suite 2: Full End-to-End Flow (Login -> Todo CRUD -> Data Persistence)', () => {
  let server;
  let baseUrl;
  let authToken;

  before((t, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((t, done) => {
    server.close(done);
  });

  test('FLOW-1: Step 1 - User logs in and receives valid JWT auth token', async () => {
    const loginRes = await apiRequest(baseUrl, '/api/v1/auth/login', {
      method: 'POST'
    }, {
      email: 'user@example.com',
      password: 'securepassword123'
    });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.ok(loginRes.body.data.token, 'Must return JWT token');
    authToken = loginRes.body.data.token;
  });

  test('FLOW-2: Step 2 - Fetch initial list of user todos', async () => {
    const listRes = await apiRequest(baseUrl, '/api/v1/todos', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data), 'data must be an array of todos');
  });

  test('FLOW-3: Step 3 - Create 3 new todos (different priorities and due dates)', async () => {
    const todo1 = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    }, {
      title: 'Tugas E2E 1 - Menyiapkan Rencana Pengujian',
      description: 'Langkah pertama dalam flow E2E',
      priority: 'HIGH',
      due_date: '2026-08-25'
    });
    assert.strictEqual(todo1.status, 201);
    assert.strictEqual(todo1.body.data.title, 'Tugas E2E 1 - Menyiapkan Rencana Pengujian');
    assert.strictEqual(todo1.body.data.is_completed, false);

    const todo2 = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    }, {
      title: 'Tugas E2E 2 - Menjalankan Automation Suite',
      priority: 'MEDIUM'
    });
    assert.strictEqual(todo2.status, 201);

    const todo3 = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    }, {
      title: 'Tugas E2E 3 - Membuat Sign-off Report',
      priority: 'LOW'
    });
    assert.strictEqual(todo3.status, 201);
  });

  test('FLOW-4: Step 4 - Checklist 1 todo and verify status toggle and counter updates', async () => {
    // Get latest todos
    const listRes = await apiRequest(baseUrl, '/api/v1/todos', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(listRes.status, 200);

    const firstTodo = listRes.body.data.find(t => t.title.includes('Tugas E2E 1'));
    assert.ok(firstTodo, 'First todo should exist');

    // Toggle to completed
    const patchRes = await apiRequest(baseUrl, `/api/v1/todos/${firstTodo.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` }
    }, {
      is_completed: true
    });

    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.body.data.is_completed, true);
  });

  test('FLOW-5: Step 5 - Simulate page refresh: Re-fetch todos to verify backend persistence', async () => {
    const listRes = await apiRequest(baseUrl, '/api/v1/todos', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(listRes.status, 200);
    const toggled = listRes.body.data.find(t => t.title.includes('Tugas E2E 1'));
    assert.ok(toggled);
    assert.strictEqual(toggled.is_completed, true, 'Status must persist as completed');

    // Verify summary metrics
    if (listRes.body.summary) {
      assert.ok(listRes.body.summary.completed >= 1);
      assert.ok(listRes.body.summary.all >= 3);
    }
  });

  test('FLOW-6: Step 6 - Delete a todo and verify deletion persistence', async () => {
    const listRes = await apiRequest(baseUrl, '/api/v1/todos', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const todoToDelete = listRes.body.data.find(t => t.title.includes('Tugas E2E 3'));
    assert.ok(todoToDelete);

    const delRes = await apiRequest(baseUrl, `/api/v1/todos/${todoToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(delRes.status, 200);

    // Verify list no longer contains the deleted todo
    const verifyList = await apiRequest(baseUrl, '/api/v1/todos', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(verifyList.body.data.some(t => t.id === todoToDelete.id), false);
  });
});

describe('QA-E2E Suite 3: Negative Scenarios & Robustness Testing', () => {
  let server;
  let baseUrl;
  let testToken;

  before((t, done) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      testToken = generateToken({ id: '1', email: 'user@example.com', name: 'User One' }, config.tokenSecret);
      done();
    });
  });

  after((t, done) => {
    server.close(done);
  });

  test('NEG-E2E-1: Empty or whitespace-only title is rejected with 400 Bad Request', async () => {
    const res = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` }
    }, { title: '      ' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('wajib diisi')));
  });

  test('NEG-E2E-2: Title longer than 255 characters is rejected with 400 Bad Request', async () => {
    const overlongTitle = 'T'.repeat(256);
    const res = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` }
    }, { title: overlongTitle });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.errors.some(e => e.includes('255 karakter')));
  });

  test('NEG-E2E-3: Invalid due_date format string is rejected with 400 Bad Request', async () => {
    const res = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` }
    }, {
      title: 'Tugas dengan tanggal rusak',
      due_date: 'invalid-date-999-99'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('NEG-E2E-4: Frontend handles server errors gracefully with optimistic rollback and friendly toast', () => {
    // Verify frontend code has error alert banner and rollback logic
    assert.match(
      DASHBOARD_HTML,
      /showTodoAlert\s*\(/i,
      'Frontend must have showTodoAlert function to display friendly error messages'
    );
    assert.match(
      DASHBOARD_HTML,
      /targetTodo\.is_completed\s*=\s*previousState/i,
      'Frontend must implement rollback on checkbox toggle failure'
    );
    assert.match(
      DASHBOARD_HTML,
      /todoStore\.todos\.splice\(index,\s*0,\s*deletedTodo\)/i,
      'Frontend must restore deleted todo on delete failure'
    );
  });
});

describe('QA-E2E Suite 4: Security Testing (Zero-IDOR, Authentication, XSS, Rate Limiting)', () => {
  let server;
  let baseUrl;
  let userAToken;
  let userBToken;
  let userBTodoId;

  before(async () => {
    await new Promise(resolve => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    userAToken = generateToken({ id: '1', email: 'user@example.com', name: 'User A' }, config.tokenSecret);
    userBToken = generateToken({ id: '2', email: 'admin@example.com', name: 'User B' }, config.tokenSecret);

    // Create a todo owned by User B
    const createBRes = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userBToken}` }
    }, {
      title: 'Data Rahasia User B',
      description: 'Hanya boleh diakses oleh User B'
    });

    userBTodoId = createBRes.body.data.id;
  });

  after((t, done) => {
    server.close(done);
  });

  test('SEC-IDOR-1: User A attempting to GET User B todo is blocked with 403 Forbidden', async () => {
    const res = await apiRequest(baseUrl, `/api/v1/todos/${userBTodoId}`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /tidak memiliki izin/i);
  });

  test('SEC-IDOR-2: User A attempting to PATCH User B todo is blocked with 403 Forbidden', async () => {
    const res = await apiRequest(baseUrl, `/api/v1/todos/${userBTodoId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userAToken}` }
    }, { is_completed: true, title: 'Hacked title by User A' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('SEC-IDOR-3: User A attempting to DELETE User B todo is blocked with 403 Forbidden', async () => {
    const res = await apiRequest(baseUrl, `/api/v1/todos/${userBTodoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('SEC-AUTH-1: Requests to /api/v1/todos without Authorization header return 401 Unauthorized', async () => {
    const res = await apiRequest(baseUrl, '/api/v1/todos');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('SEC-XSS-1: XSS payload in todo title is sanitized and rendered via safe DOM textContent', async () => {
    const xssScript = '<script>alert("PWNED_XSS")</script><img src=x onerror=alert(1)>';
    const res = await apiRequest(baseUrl, '/api/v1/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    }, { title: xssScript });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.title, xssScript);

    // Verify frontend renders with textContent
    assert.match(
      DASHBOARD_HTML,
      /titleSpan\.textContent\s*=\s*todo\.title/i,
      'Frontend must use textContent to ensure no HTML/script injection occurs'
    );
  });

  test('SEC-RATE-1: Rapid consecutive mutation requests trigger 429 Too Many Requests rate limit', async () => {
    const burstRequests = Array.from({ length: 35 }, () => {
      return apiRequest(baseUrl, '/api/v1/todos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}` }
      }, { title: 'Spam task mutation' });
    });

    const responses = await Promise.all(burstRequests);
    const rateLimited = responses.filter(r => r.status === 429);

    assert.ok(rateLimited.length > 0, 'Should return 429 Too Many Requests during high request burst');
  });
});
