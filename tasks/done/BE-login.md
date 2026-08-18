# Task: BE-01 - API Autentikasi Login (Email & Password)

**Assignee:** BE Agent  
**Status:** DONE  
**Tanggal Dibuat:** 2026-08-18  
**Tanggal Selesai:** 2026-08-18  

---

## 1. Tujuan
Menyediakan endpoint API backend untuk menangani proses autentikasi pengguna menggunakan **Email** dan **Password**, serta mengembalikan response status dan data/token yang sesuai untuk dikonsumsi oleh frontend.

---

## 2. Endpoint API yang Diperlukan

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/login` (atau `/api/v1/auth/login`) | Memvalidasi kredensial pengguna dan menghasilkan status login |
| `GET` | `/api/health` | Healthcheck status server backend |
| `GET` | `/` | Informasi API dan root service info |

---

## 3. Spesifikasi Request & Response

### A. Request
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Body Schema (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```

### B. Response

#### 1. Berhasil (200 OK)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Validasi Gagal / Bad Request (400 Bad Request)
*Kondisi: Email tidak valid, email kosong, atau password kosong.*
```json
{
  "success": false,
  "message": "Email dan password wajib diisi dengan format yang benar",
  "errors": [
    "Format email tidak valid"
  ]
}
```

#### 3. Kredensial Salah (401 Unauthorized)
*Kondisi: Email tidak terdaftar atau password tidak cocok.*
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

#### 4. Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server"
}
```

---

## 4. Pekerjaan yang Harus Dilakukan
1. **Inisialisasi Server Backend:**
   - Menyiapkan struktur folder backend (`backend/src/`).
   - Mengonfigurasi dependensi dasar (`express`, `cors`, `dotenv`).
   - Mengatur script start, dev, dan test di `package.json`.
2. **Implementasi CORS & Middleware:**
   - Mengaktifkan CORS (`cors`) agar API dapat diakses dari domain/port frontend.
   - Menambahkan middleware body parser (`express.json()`, `express.urlencoded()`) beserta error handling untuk syntax error JSON.
3. **Implementasi Handler Endpoint Login:**
   - Membuat routing dan controller untuk `POST /api/login` & alias `POST /api/v1/auth/login`.
   - Validasi input email (format regex RFC) dan password.
   - Pengecekan kredensial dengan password hashing secure (`crypto.scryptSync` & `crypto.timingSafeEqual`) dan pembuatan JWT token.
   - Mengirim HTTP status code dan format JSON yang konsisten sesuai spesifikasi.
4. **Environment Configuration:**
   - Menyediakan konfigurasi `.env` dan template `.env.example` (`PORT`, `CORS_ORIGIN`, `TOKEN_SECRET`).

---

## 5. Kriteria Selesai (Definition of Done)
- [x] Server backend dapat dijalankan secara lokal tanpa error.
- [x] Endpoint `POST /api/login` dapat menerima request JSON berisi `email` dan `password`.
- [x] Mengembalikan HTTP 200 dengan payload sukses jika kredensial benar.
- [x] Mengembalikan HTTP 400 jika payload request tidak lengkap atau format email salah.
- [x] Mengembalikan HTTP 401 jika email atau password salah.
- [x] Konfigurasi CORS aktif sehingga request dari frontend tidak terblokir.
- [x] Kode terorganisir dengan rapi dan mudah diintegrasikan oleh FE Agent.

---

## 6. Laporan Hasil Pekerjaan (Backend Agent)

### A. Struktur File Backend yang Dibuat
```
backend/
├── .env                       # Konfigurasi environment lokal (PORT=5000)
├── .env.example               # Template environment
├── package.json               # Dependensi & script (start, dev, test)
├── src/
│   ├── app.js                 # Konfigurasi Express, middleware CORS/JSON, routing, error handlers
│   ├── server.js              # Server entry point
│   ├── config/
│   │   └── env.js             # Environment loader & validation
│   ├── data/
│   │   └── users.js           # In-memory user data dengan password hash
│   ├── controllers/
│   │   └── authController.js  # Controller HTTP handler login
│   ├── services/
│   │   └── authService.js     # Business logic autentikasi & generate token
│   ├── routes/
│   │   ├── authRoutes.js      # Route definitions untuk autentikasi
│   │   └── index.js           # Main router & health check
│   ├── middlewares/
│   │   ├── validateLogin.js   # Middleware validasi email & password
│   │   └── errorHandler.js    # Centralized 404 & 500 error handler
│   └── utils/
│       └── crypto.js          # Password hashing (scrypt) & JWT generator
└── tests/
    ├── auth.test.js           # Integration tests untuk login & CORS (6 tests)
    ├── health.test.js         # Tests untuk health check & 404 handler (3 tests)
    └── validation.test.js     # Tests untuk validasi & edge cases (5 tests)
```

### B. User Kredensial untuk Pengujian
| Email | Password | Role / Nama |
| :--- | :--- | :--- |
| `user@example.com` | `securepassword123` | User Name |
| `admin@example.com` | `admin123` | Administrator |
| `purnomo@example.com` | `purnomo123` | Purnomo Yusgiantoro |

### C. Hasil Backend Automated Testing
Eksekusi command: `npm test` (menjalankan `node --test tests/**/*.test.js`)
```
▶ Auth Endpoints (POST /api/login)
  ✔ POST /api/login with valid user credentials returns 200 and auth payload
  ✔ POST /api/login with admin credentials returns 200
  ✔ POST /api/v1/auth/login works as an alias
  ✔ POST /api/login with wrong password returns 401 Unauthorized
  ✔ POST /api/login with non-existent email returns 401 Unauthorized
  ✔ OPTIONS /api/login responds with proper CORS headers
✔ Auth Endpoints (POST /api/login)
▶ Health & Status Endpoints
  ✔ GET / returns 200 and server info
  ✔ GET /api/health returns 200 and status ok
  ✔ GET /non-existent-endpoint returns 404
✔ Health & Status Endpoints
▶ Validation & Edge Cases
  ✔ POST /api/login with missing email returns 400
  ✔ POST /api/login with missing password returns 400
  ✔ POST /api/login with invalid email format returns 400
  ✔ POST /api/login with empty body returns 400
  ✔ POST /api/login with malformed JSON body returns 400
✔ Validation & Edge Cases

ℹ tests 14
ℹ suites 3
ℹ pass 14
ℹ fail 0
```

### D. Hasil Verifikasi Live API
Pengujian endpoint HTTP pada server yang berjalan (`http://localhost:5000`):
1. **Health Check (`GET /api/health`)** ➡️ Status 200 OK:
   ```json
   { "status": "ok", "message": "Backend server is running" }
   ```
2. **Login Berhasil (`POST /api/login` - `user@example.com` / `securepassword123`)** ➡️ Status 200 OK:
   ```json
   {
     "success": true,
     "message": "Login berhasil",
     "data": {
       "user": { "id": "1", "email": "user@example.com", "name": "User Name" },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```
3. **Login Kredensial Salah (`POST /api/login` - password salah)** ➡️ Status 401 Unauthorized:
   ```json
   { "success": false, "message": "Email atau password salah" }
   ```
4. **Validasi Gagal (`POST /api/login` - format salah / kosong)** ➡️ Status 400 Bad Request:
   ```json
   {
     "success": false,
     "message": "Email dan password wajib diisi dengan format yang benar",
     "errors": ["Format email tidak valid", "Password wajib diisi"]
   }
   ```
