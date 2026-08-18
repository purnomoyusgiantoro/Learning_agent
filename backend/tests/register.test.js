const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

describe('Register Endpoints (POST /api/register)', () => {
  let server;
  let baseUrl;

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

  test('POST /api/register with valid payload returns 201 Created and user data', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.message, 'Registrasi berhasil');
    assert.ok(body.data, 'Response should contain data');
    assert.ok(body.data.user, 'Response data should contain user');
    assert.ok(body.data.user.id, 'User should have an id');
    assert.strictEqual(body.data.user.name, 'Budi Santoso');
    assert.strictEqual(body.data.user.email, 'budi.santoso@example.com');
    // Ensure password and passwordHash are not exposed
    assert.strictEqual(body.data.user.password, undefined);
    assert.strictEqual(body.data.user.passwordHash, undefined);
  });

  test('Newly registered user can immediately login via POST /api/login', async () => {
    const registerPayload = {
      name: 'Dewi Lestari',
      email: 'dewi.lestari@example.com',
      password: 'dewipassword456'
    };

    // 1. Register
    const regRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    assert.strictEqual(regRes.status, 201);
    const regBody = await regRes.json();
    const registeredUserId = regBody.data.user.id;

    // 2. Login with registered credentials
    const loginRes = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerPayload.email,
        password: registerPayload.password
      })
    });

    assert.strictEqual(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.strictEqual(loginBody.success, true);
    assert.strictEqual(loginBody.message, 'Login berhasil');
    assert.strictEqual(loginBody.data.user.id, registeredUserId);
    assert.strictEqual(loginBody.data.user.email, registerPayload.email);
    assert.strictEqual(loginBody.data.user.name, registerPayload.name);
    assert.ok(typeof loginBody.data.token === 'string' && loginBody.data.token.length > 0);
  });

  test('POST /api/register with duplicate email returns 409 Conflict', async () => {
    // Attempt to register with already existing pre-seeded email
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: 'user@example.com',
        password: 'somepassword123'
      })
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
  });

  test('POST /api/register duplicate check is case-insensitive', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Case Test',
        email: 'USER@EXAMPLE.COM',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
  });

  test('POST /api/v1/auth/register works as an alias route', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alias User',
        email: 'alias.user@example.com',
        password: 'aliaspassword123'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.name, 'Alias User');
  });

  test('POST /api/register with missing name returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'noname@example.com',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, 'Data registrasi tidak lengkap atau tidak valid');
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.includes('Nama wajib diisi'));
  });

  test('POST /api/register with name shorter than 2 characters returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'shortname@example.com',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Nama minimal 2 karakter'));
  });

  test('POST /api/register with missing email returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Email wajib diisi'));
  });

  test('POST /api/register with invalid email format returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'invalid-email-format',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Format email tidak valid'));
  });

  test('POST /api/register with missing password returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'nopass@example.com'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Password wajib diisi'));
  });

  test('POST /api/register with password shorter than 6 characters returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'shortpass@example.com',
        password: '12345'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Password minimal 6 karakter'));
  });

  test('POST /api/register with empty body returns 400 Bad Request with all validation errors', async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.includes('Nama wajib diisi'));
    assert.ok(body.errors.includes('Email wajib diisi'));
    assert.ok(body.errors.includes('Password wajib diisi'));
  });
});
