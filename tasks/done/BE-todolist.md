# Task: BE-TASK - Backend TodoList Implementation

- **ID:** BE-TASK-01
- **Agent:** BE Agent
- **Status:** DONE
- **Requirement:** Buat todolist di bagian selamat datang
- **Dependency:** None
- **Tanggal Selesai:** 2026-08-18

---

## 1. Tujuan
Mengimplementasikan backend API, database layer, dan validasi server sesuai requirement: Buat todolist di bagian selamat datang.

---

## 2. Pekerjaan yang Telah Diselesaikan
1. **Data Model & Schema Database (`backend/src/data/todos.js`):**
   - Entitas `todos` dengan field `id`, `user_id`, `title`, `description`, `is_completed`, `due_date`, `priority`, `created_at`, `updated_at`.
   - Isolasi user data dan fungsi query dengan filter `is_completed`, sorting, dan summary progress calculation.
2. **Routing & Endpoints (`backend/src/routes/todoRoutes.js` & `backend/src/routes/index.js`):**
   - `GET /api/v1/todos` (dan `/api/todos`) - Mengambil daftar todo milik user terautentikasi.
   - `GET /api/v1/todos/:id` - Mengambil detail satu item todo berdasarkan ID.
   - `POST /api/v1/todos` - Menambahkan todo baru.
   - `PATCH /api/v1/todos/:id` - Memperbarui status selesai atau mengubah data todo.
   - `DELETE /api/v1/todos/:id` - Menghapus todo.
3. **Middleware & Security:**
   - `authMiddleware` (`backend/src/middlewares/authMiddleware.js`): Ekstraksi dan verifikasi Bearer Token JWT dengan proteksi 401 Unauthorized.
   - Zero-IDOR Protection (`backend/src/services/todoService.js`): Pengecekan kepemilikan resource per user dengan response 403 Forbidden.
   - `rateLimiter` (`backend/src/middlewares/rateLimiter.js`): Sliding window rate limiting pada endpoint mutasi dengan response 429 Too Many Requests.
4. **Validasi Server & Error Handling:**
   - `validateTodoCreate` & `validateTodoUpdate` (`backend/src/middlewares/validateTodo.js`): Validasi schema judul (1-255 karakter, no empty/whitespace), validasi format due_date, dan validasi priority enum.
   - Response terstandarisasi dengan centralized error handling.
5. **Testing & QA Verification:**
   - `backend/tests/todos.test.js` (20 test cases - PASS)
   - `backend/tests/todos_security.test.js` (12 test cases - PASS)
