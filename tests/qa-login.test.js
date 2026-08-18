const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../backend/src/app');

// Helper to run simulated HTTP request to Express app
async function makeRequest(app, method, url, body = null, headers = {}) {
  const http = require('node:http');
  const server = http.createServer(app);
  
  return new Promise((resolve, reject) => {
    server.listen(0, async () => {
      const port = server.address().port;
      try {
        const fetchOptions = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        };
        if (body) {
          fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }
        const res = await fetch(`http://127.0.0.1:${port}${url}`, fetchOptions);
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        server.close(() => {
          resolve({ status: res.status, headers: res.headers, data });
        });
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

describe('QA Suite 1: Backend API Login Verification', () => {
  test('BE-1: Health check endpoint is active', async () => {
    const res = await makeRequest(app, 'GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  test('BE-2: Login with valid credentials (user@example.com) returns 200 and token', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'user@example.com',
      password: 'securepassword123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token, 'Token should be returned');
    assert.strictEqual(res.data.data.user.email, 'user@example.com');
  });

  test('BE-3: Login with admin credentials (admin@example.com) returns 200', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.name, 'Administrator');
  });

  test('BE-4: Login with third user credentials (purnomo@example.com) returns 200', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'purnomo@example.com',
      password: 'purnomo123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.name, 'Purnomo Yusgiantoro');
  });

  test('BE-5: Login with wrong password returns 401 Unauthorized', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'user@example.com',
      password: 'wrongpassword'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Email atau password salah');
  });

  test('BE-6: Login with unregistered email returns 401 Unauthorized', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'unregistered@example.com',
      password: 'somepassword'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  test('BE-7: Input validation fails on empty email (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: '',
      password: 'somepassword'
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  test('BE-8: Input validation fails on invalid email format (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'invalid-email-format',
      password: 'somepassword'
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  test('BE-9: Input validation fails on missing password (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/login', {
      email: 'user@example.com',
      password: ''
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });
});

describe('QA Suite 2: Frontend Structure & Client-side Validation', () => {
  const htmlPath = path.resolve(__dirname, '../frontend/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  test('FE-1: Form contains email input with type="email"', () => {
    assert.match(htmlContent, /<input[^>]*type=["']email["'][^>]*id=["']email["']/);
  });

  test('FE-2: Form contains password input with type="password"', () => {
    assert.match(htmlContent, /<input[^>]*type=["']password["'][^>]*id=["']password["']/);
  });

  test('FE-3: Form contains submit button', () => {
    assert.match(htmlContent, /<button[^>]*type=["']submit["']/);
  });

  test('FE-4: Client-side validation logic contains email regex', () => {
    assert.match(htmlContent, /validateEmail/);
    assert.ok(htmlContent.includes('/^[^\s@]+@[^\s@]+\\.[^\s@]+$/') || htmlContent.includes('@[^\\s@]+\\.[^\\s@]+'));
  });

  test('FE-5: Error banner container exists with accessibility role', () => {
    assert.match(htmlContent, /id=["']alertMessage["'][^>]*role=["']alert["']/);
  });
});

describe('QA Suite 3: Frontend to Backend Integration Verification', () => {
  const htmlPath = path.resolve(__dirname, '../frontend/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  test('INT-1: Frontend calls Backend API endpoint http://localhost:5000/api/login', () => {
    const hasApiUrl = /http:\/\/localhost:5000\/api\/login/.test(htmlContent);
    const callsFetch = /fetch\(\s*API_URL/.test(htmlContent) || /fetch\(\s*['"`]http:\/\/localhost:5000\/api\/login['"`]/.test(htmlContent);
    assert.strictEqual(hasApiUrl && callsFetch, true, 'Frontend must fetch from Backend API endpoint');
  });

  test('INT-2: Frontend does not depend on insecure static env file', () => {
    const usesEnvFile = /fetch\(\s*['"`]env['"`]\)/.test(htmlContent);
    assert.strictEqual(usesEnvFile, false, 'Frontend should not fetch static env file');
  });

  test('INT-3: Frontend handles authToken and user storage in sessionStorage', () => {
    assert.match(htmlContent, /sessionStorage\.setItem\(\s*["']authToken["']/);
    assert.match(htmlContent, /sessionStorage\.setItem\(\s*["']userEmail["']/);
  });

  test('INT-4: Frontend handles 401 and 400 error responses from Backend', () => {
    assert.match(htmlContent, /res\.status\s*===\s*401/);
    assert.match(htmlContent, /data\.errors/);
    assert.match(htmlContent, /showAlert/);
  });

  test('INT-5: Post-login dashboard (halaman2.html) supports reading sessionStorage and logout', () => {
    const dashPath = path.resolve(__dirname, '../frontend/halaman2.html');
    const dashContent = fs.readFileSync(dashPath, 'utf8');
    assert.match(dashContent, /sessionStorage\.getItem\(\s*["']userEmail["']\)/);
    assert.match(dashContent, /sessionStorage\.removeItem\(\s*["']authToken["']\)/);
  });
});
