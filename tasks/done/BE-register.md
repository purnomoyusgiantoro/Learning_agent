# Task: BE-REGISTER-01 - API Registrasi Pengguna Baru (Register User)

- **ID:** BE-REGISTER-01
- **Agent:** BE Agent
- **Status:** DONE
- **Dependency:** None (Dapat langsung dikerjakan)

---

## 1. Tujuan
Menyediakan endpoint API backend untuk memproses pendaftaran (*register*) pengguna baru dengan data **Nama**, **Email**, dan **Password**, melakukan validasi data, memastikan email belum pernah terdaftar, dan menyimpan pengguna baru ke repository data agar dapat langsung digunakan untuk proses login.

---

## 2. Pekerjaan yang Harus Dilakukan
1. **Middleware Validasi (`validateRegister.js`):**
   - Validasi keberadaan dan format field `name`, `email`, dan `password`.
   - Pastikan nama tidak kosong (minimal 2 karakter).
   - Pastikan format email valid (RFC-compliant email regex).
   - Pastikan password tidak kosong (minimal 6 karakter).
   - Mengembalikan HTTP 400 Bad Request jika validasi gagal.
2. **Service & Repository (`authService.js` & `users.js`):**
   - Menambahkan method `register({ name, email, password })`.
   - Mengecek apakah email sudah terdaftar. Jika sudah, kembalikan status error konflik (HTTP 409 / Conflict atau pesan duplikasi).
   - Menyimpan user baru ke dalam array data pengguna (`users.js`).
3. **Controller & Routing (`authController.js` & `authRoutes.js`):**
   - Menambahkan method handler `register` di controller.
   - Mendaftarkan route `POST /api/register` (dan alias opsional `POST /api/v1/auth/register`).
4. **Backend Test Suite:**
   - Menambahkan pengujian otomatis unit/integration test untuk skenario registrasi sukses, validasi payload, dan pencegahan duplikasi email.

---

## 3. Spesifikasi Kontrak API

### Endpoint: `POST /api/register`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

#### Response: Berhasil (201 Created)
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "4",
      "name": "Budi Santoso",
      "email": "budi@example.com"
    }
  }
}
```

#### Response: Validasi Gagal (400 Bad Request)
```json
{
  "success": false,
  "message": "Data registrasi tidak lengkap atau tidak valid",
  "errors": [
    "Format email tidak valid",
    "Password minimal 6 karakter"
  ]
]
```

#### Response: Email Sudah Terdaftar (409 Conflict)
```json
{
  "success": false,
  "message": "Email sudah terdaftar. Silakan gunakan email lain atau login."
}
```

---

## 4. File yang Diubah / Dibuat
- `backend/src/middlewares/validateRegister.js` *(Baru)*
- `backend/src/routes/authRoutes.js` *(Update)*
- `backend/src/controllers/authController.js` *(Update)*
- `backend/src/services/authService.js` *(Update)*
- `backend/src/data/users.js` *(Update)*
- `backend/src/app.js` *(Update)*
- `backend/tests/register.test.js` *(Baru)*

---

## 5. Acceptance Criteria (Definition of Done)
- [x] Endpoint `POST /api/register` aktif dan dapat menerima request JSON.
- [x] Mengembalikan HTTP 201 dengan data user (tanpa mengekspos plaintext password) saat data valid.
- [x] Mengembalikan HTTP 400 jika field `name`, `email`, atau `password` kosong/tidak valid.
- [x] Mengembalikan HTTP 409 jika `email` sudah pernah terdaftar sebelumnya.
- [x] User yang baru didaftarkan langsung tersimpan dan dapat digunakan untuk login melalui endpoint `POST /api/login`.
- [x] Seluruh unit/integration test backend berjalan lancar (`npm test` PASS: 26/26 tests passed).

---

## 6. Ringkasan Implementasi
- **Middleware:** `validateRegister.js` memvalidasi input `name` (min 2 karakter), format `email`, dan `password` (min 6 karakter) dengan error array deskriptif.
- **Data Layer:** `users.js` diperkaya dengan `createUser` (auto-hashing via `scrypt`, generate incrementing ID, store cleaned input) dan `emailExists`.
- **Service Layer:** `authService.js` mengimplementasikan fungsi `registerUser` dengan pengecekan konflik email (HTTP 409) dan pembuatan user baru.
- **Controller & Router:** `authController.js` dan `authRoutes.js` memetakan endpoint `POST /api/register` (serta alias `/api/v1/auth/register`, dsb.).
- **Testing:** Menambahkan 12 test case baru di `register.test.js` yang menguji status 201, integrasi pendaftaran -> login langsung, pencegahan duplikasi email case-insensitive (409), serta seluruh variasi kegagalan validasi (400).
