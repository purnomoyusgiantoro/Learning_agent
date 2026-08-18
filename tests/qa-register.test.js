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

describe('QA Suite 1: Backend Registration API Verification', () => {
  const uniqueSuffix = Date.now();

  test('BE-REG-1: Register with valid data returns 201 Created and user info without password hash', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'Agus Pratama',
      email: `agus.${uniqueSuffix}@example.com`,
      password: 'password123'
    });

    assert.strictEqual(res.status, 201, 'Status code should be 201 Created');
    assert.strictEqual(res.data.success, true, 'Success flag should be true');
    assert.strictEqual(res.data.message, 'Registrasi berhasil');
    assert.ok(res.data.data && res.data.data.user, 'User object should be returned');
    assert.strictEqual(res.data.data.user.name, 'Agus Pratama');
    assert.strictEqual(res.data.data.user.email, `agus.${uniqueSuffix}@example.com`);
    assert.strictEqual(res.data.data.user.passwordHash, undefined, 'Password hash must never be exposed');
    assert.strictEqual(res.data.data.user.password, undefined, 'Raw password must never be exposed');
  });

  test('BE-REG-2: Register with existing email returns 409 Conflict', async () => {
    // Attempt to register with pre-existing seeded user
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'Duplicate User',
      email: 'user@example.com',
      password: 'password123'
    });

    assert.strictEqual(res.status, 409, 'Status code should be 409 Conflict');
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /sudah terdaftar/i);
  });

  test('BE-REG-3: Duplicate email check is case-insensitive (409 Conflict)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'Admin Duplicate',
      email: 'ADMIN@EXAMPLE.COM',
      password: 'password123'
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  test('BE-REG-4: Validation fails on empty/missing name (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: '',
      email: `valid.${uniqueSuffix}@example.com`,
      password: 'password123'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(Array.isArray(res.data.errors), 'Should return errors array');
    assert.ok(res.data.errors.some(e => e.includes('Nama')));
  });

  test('BE-REG-5: Validation fails on name shorter than 2 characters (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'A',
      email: `valid.${uniqueSuffix}@example.com`,
      password: 'password123'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.errors.some(e => e.includes('minimal 2 karakter')));
  });

  test('BE-REG-6: Validation fails on empty/missing email (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'Valid Name',
      email: '',
      password: 'password123'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.errors.some(e => e.includes('Email')));
  });

  test('BE-REG-7: Validation fails on invalid email format (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {
      name: 'Valid Name',
      email: 'not-an-email',
      password: 'password123'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.errors.some(e => e.includes('Format email tidak valid')));
  });

  test('BE-REG-8: Validation fails on missing password or shorter than 6 chars (400 Bad Request)', async () => {
    const resEmpty = await makeRequest(app, 'POST', '/api/register', {
      name: 'Valid Name',
      email: `valid2.${uniqueSuffix}@example.com`,
      password: ''
    });
    assert.strictEqual(resEmpty.status, 400);
    assert.ok(resEmpty.data.errors.some(e => e.includes('Password')));

    const resShort = await makeRequest(app, 'POST', '/api/register', {
      name: 'Valid Name',
      email: `valid2.${uniqueSuffix}@example.com`,
      password: '12345'
    });
    assert.strictEqual(resShort.status, 400);
    assert.ok(resShort.data.errors.some(e => e.includes('Password minimal 6 karakter')));
  });

  test('BE-REG-9: Validation fails with aggregated errors on empty payload (400 Bad Request)', async () => {
    const res = await makeRequest(app, 'POST', '/api/register', {});
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.errors.length, 3, 'Should have errors for name, email, and password');
  });

  test('BE-REG-10: Route aliases for register (/api/auth/register, /api/v1/register, /api/v1/auth/register) work correctly', async () => {
    const res1 = await makeRequest(app, 'POST', '/api/auth/register', {
      name: 'Alias User 1',
      email: `alias1.${uniqueSuffix}@example.com`,
      password: 'password123'
    });
    assert.strictEqual(res1.status, 201);

    const res2 = await makeRequest(app, 'POST', '/api/v1/register', {
      name: 'Alias User 2',
      email: `alias2.${uniqueSuffix}@example.com`,
      password: 'password123'
    });
    assert.strictEqual(res2.status, 201);

    const res3 = await makeRequest(app, 'POST', '/api/v1/auth/register', {
      name: 'Alias User 3',
      email: `alias3.${uniqueSuffix}@example.com`,
      password: 'password123'
    });
    assert.strictEqual(res3.status, 201);
  });

  test('BE-REG-11: OPTIONS /api/register responds with proper CORS headers', async () => {
    const res = await makeRequest(app, 'OPTIONS', '/api/register');
    assert.strictEqual(res.status, 204);
    assert.ok(res.headers.get('access-control-allow-methods'));
  });
});

describe('QA Suite 2: Frontend Register UI & Client-Side Validation Verification', () => {
  const registerHtmlPath = path.resolve(__dirname, '../frontend/register.html');
  const indexHtmlPath = path.resolve(__dirname, '../frontend/index.html');
  const registerHtml = fs.readFileSync(registerHtmlPath, 'utf8');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  test('FE-REG-1: Form contains full name input field with correct attributes', () => {
    assert.match(registerHtml, /<input[^>]*type=["']text["'][^>]*id=["']name["']/i);
    assert.match(registerHtml, /name=["']name["']/i);
    assert.match(registerHtml, /autocomplete=["']name["']/i);
  });

  test('FE-REG-2: Form contains email input field with correct attributes', () => {
    assert.match(registerHtml, /<input[^>]*type=["']email["'][^>]*id=["']email["']/i);
    assert.match(registerHtml, /name=["']email["']/i);
    assert.match(registerHtml, /autocomplete=["']email["']/i);
  });

  test('FE-REG-3: Form contains password input field with correct attributes', () => {
    assert.match(registerHtml, /<input[^>]*type=["']password["'][^>]*id=["']password["']/i);
    assert.match(registerHtml, /name=["']password["']/i);
    assert.match(registerHtml, /autocomplete=["']new-password["']/i);
  });

  test('FE-REG-4: Form contains submit button with proper ID and text', () => {
    assert.match(registerHtml, /<button[^>]*type=["']submit["'][^>]*id=["']submitBtn["']/i);
    assert.match(registerHtml, /Daftar/);
  });

  test('FE-REG-5: Alert container exists with accessibility role="alert"', () => {
    assert.match(registerHtml, /id=["']alertMessage["'][^>]*role=["']alert["']/i);
  });

  test('FE-REG-6: Dedicated field error message spans exist for client-side feedback', () => {
    assert.match(registerHtml, /id=["']nameError["']/);
    assert.match(registerHtml, /id=["']emailError["']/);
    assert.match(registerHtml, /id=["']passwordError["']/);
  });

  test('FE-REG-7: Client-side validation implements email regex, name length, and password length checks', () => {
    assert.match(registerHtml, /validateEmail/);
    assert.match(registerHtml, /nameValue\.length\s*<\s*2/);
    assert.match(registerHtml, /passValue\.length\s*<\s*6/);
  });

  test('FE-REG-8: Bi-directional navigation links exist between register.html and index.html', () => {
    // register.html contains link back to login (index.html)
    assert.match(registerHtml, /<a\s+[^>]*href=["']index\.html["'][^>]*>/i);
    
    // index.html contains link to register page (register.html)
    assert.match(indexHtml, /<a\s+[^>]*href=["']register\.html["'][^>]*>/i);
  });

  test('FE-REG-9: Backend API URL is configured to http://localhost:5000/api/register', () => {
    assert.match(registerHtml, /const\s+API_URL\s*=\s*["']http:\/\/localhost:5000\/api\/register["']/);
  });
});

describe('QA Suite 3: End-to-End Integration Flow (Register -> Login -> Token Verification)', () => {
  const testEmail = `e2e.user.${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'E2E Test User';

  test('E2E-1: Step 1 - Register new user account via API', async () => {
    const regRes = await makeRequest(app, 'POST', '/api/register', {
      name: testName,
      email: testEmail,
      password: testPassword
    });

    assert.strictEqual(regRes.status, 201, 'Registration must return 201');
    assert.strictEqual(regRes.data.success, true);
    assert.strictEqual(regRes.data.data.user.email, testEmail.toLowerCase());
    assert.strictEqual(regRes.data.data.user.name, testName);
    assert.ok(regRes.data.data.user.id, 'User ID should be assigned');
  });

  test('E2E-2: Step 2 - Authenticate immediately with the newly registered user via /api/login', async () => {
    const loginRes = await makeRequest(app, 'POST', '/api/login', {
      email: testEmail,
      password: testPassword
    });

    assert.strictEqual(loginRes.status, 200, 'Login must return 200 OK');
    assert.strictEqual(loginRes.data.success, true);
    assert.ok(loginRes.data.data.token, 'JWT/Auth Token must be issued for new user');
    assert.strictEqual(loginRes.data.data.user.email, testEmail.toLowerCase());
    assert.strictEqual(loginRes.data.data.user.name, testName);
  });

  test('E2E-3: Step 3 - Attempt duplicate registration with the same email fails with 409 Conflict', async () => {
    const dupRes = await makeRequest(app, 'POST', '/api/register', {
      name: 'Different Name',
      email: testEmail,
      password: 'anotherPassword123'
    });

    assert.strictEqual(dupRes.status, 409, 'Duplicate registration attempt must return 409 Conflict');
    assert.strictEqual(dupRes.data.success, false);
    assert.match(dupRes.data.message, /sudah terdaftar/i);
  });

  test('E2E-4: Step 4 - Verify Login with wrong password for newly registered user returns 401', async () => {
    const wrongPassRes = await makeRequest(app, 'POST', '/api/login', {
      email: testEmail,
      password: 'IncorrectPassword'
    });

    assert.strictEqual(wrongPassRes.status, 401, 'Wrong password must return 401 Unauthorized');
    assert.strictEqual(wrongPassRes.data.success, false);
  });
});
