# Task: FE-TASK - Frontend TodoList Implementation

- **ID:** FE-TASK-01
- **Agent:** FE Agent
- **Status:** DONE
- **Requirement:** Buat todolist di bagian selamat datang
- **Dependency:** BE-TASK-01
- **Tanggal Selesai:** 2026-08-18

---

## 1. Tujuan
Mengimplementasikan antarmuka pengguna (UI), interaktivitas form, validasi client, dan integrasi API sesuai requirement: Buat todolist di bagian selamat datang.

---

## 2. Pekerjaan yang Telah Diselesaikan
1. **UI & Layout (`frontend/halaman2.html`):**
   - Membuat widget/komponen `TodoListCard` (`#todoListCard`) yang terintegrasi secara modular di dalam container Dashboard selamat datang (`.dashboard-container`).
   - Mengembangkan seluruh sub-komponen:
     - `TodoHeader`: Judul section dengan ikon dan counter badge dinamis (`#todoProgressBadge`, `#completedCountBadge`, `#totalCountBadge`).
     - `TodoInputForm`: Input form (`#todoInputForm`) dengan field judul (`#todoTitleInput`), date picker batas waktu jatuh tempo opsional (`#todoDueDateInput`), dan tombol submit (`#addTodoBtn`).
     - `TodoFilter`: Tab filter status tugas (`#todoFilterGroup`) dengan pilihan *Semua*, *Belum Selesai*, dan *Selesai* lengkap dengan hitungan jumlah item real-time.
     - `SkeletonLoader`: Animasi loading placeholder shimmer (`#todoSkeletonLoader`) saat pengambilan data awal dari API.
     - `TodoList`: Container daftar tugas dinamis (`#todoList`) dengan sub-komponen `TodoItem` yang mendukung toggle status checkbox, judul dengan efek coret saat selesai, badge tanggal jatuh tempo (dengan deteksi status lewat batas waktu/overdue), dan tombol hapus (`.btn-delete-todo`).
     - `EmptyState`: Tampilan kosong informatif (`#todoEmptyState`) yang beradaptasi secara kontekstual sesuai filter yang aktif.
     - `TodoToast`: Komponen notifikasi mengambang (`#todoToast`) untuk umpan balik instan setiap aksi pengguna.
     - `DeleteConfirmModal`: Dialog konfirmasi penghapusan tugas yang aman dan aksesibel (`#deleteConfirmModal`).
   - Memastikan tampilan responsif (mobile-friendly & desktop) serta mendukung penuh tema *Light Mode* dan *Dark Mode* menggunakan token CSS variabel terpadu.

2. **Form & Validasi Client:**
   - Validasi field input tugas: wajib diisi, minimal 3 karakter, maksimal 255 karakter, otomatis menghapus whitespace (*trim*).
   - Validasi batas tanggal jatuh tempo (*due date*): menolak tanggal lampau (harus hari ini atau masa depan).
   - Menampilkan pesan error inline yang jelas (`#todoTitleError`, `#todoDueDateError`).

3. **State Management & Interaksi:**
   - Mengimplementasikan `todoStore` sebagai state management reaktif untuk mengelola daftar todo, filter aktif, kalkulasi progress, dan status loading.
   - Mengimplementasikan **Optimistic UI Updates**:
     - *Toggle Selesai/Belum:* Status di-update secara instan pada antarmuka, lalu mengirim request `PATCH` ke backend. Jika terjadi kegagalan jaringan/server, status otomatis di-*rollback* ke kondisi semula disertai notifikasi error.
     - *Hapus Item:* Item dihapus seketika dari UI, lalu mengirim request `DELETE` ke backend. Jika gagal, item dipulihkan kembali ke posisi aslinya (*rollback*).
   - Penanganan feedback lengkap (alert error, success toast, skeleton loader, dan konfirmasi modal).

4. **Integrasi API & Keamanan:**
   - Menyediakan API service layer untuk mengonsumsi endpoint CRUD todo:
     - `GET /api/v1/todos` (fallback `/api/todos`)
     - `POST /api/v1/todos` (fallback `/api/todos`)
     - `PATCH /api/v1/todos/:id` (fallback `/api/todos/:id`)
     - `DELETE /api/v1/todos/:id` (fallback `/api/todos/:id`)
   - Mengirimkan header otentikasi `Authorization: Bearer <authToken>` dari `sessionStorage` pada setiap request API.
   - Proteksi XSS dengan merender teks dinamis menggunakan `textContent` / DOM creation tanpa parsing HTML mentah.

---

## 3. File yang Diubah / Dibuat
- `frontend/halaman2.html` (Penambahan TodoListCard, styling tokens, validasi, store, optimistic UI, dan integrasi API)
- `tests/qa-fe-todolist.test.js` (Automated QA tests untuk komponen TodoList, validasi, store, optimistic updates, dan integrasi)
- `tasks/doing/FE_Task.md` (Update status task)
- `tasks/done/FE-todolist.md` (Arsip dokumentasi penyelesaian task)

---

## 4. Acceptance Criteria Verification
- [x] **Visual & Penempatan:** Widget TodoList tampil rapi, responsif, dan terintegrasi di bagian "Selamat Datang" tanpa merusak tata letak dashboard utama.
- [x] **Kelengkapan Fitur:** Pengguna dapat membuat, melihat, mengubah status (selesai/belum), dan menghapus tugas dengan sukses.
- [x] **Isolasi Data:** Header otentikasi Bearer Token dikirimkan pada setiap request untuk memastikan data terisolasi per akun pengguna.
- [x] **Validasi & Proteksi:** Form menolak input kosong/tidak valid (< 3 karakter, > 255 karakter, tanggal lampau) dan aman terhadap serangan XSS.
- [x] **Feedback Sistem:** Terdapat visual feedback lengkap untuk loading skeleton, empty state, toast alert, error banner, dan konfirmasi modal.
- [x] **Kualitas QA:** Seluruh 164 automated tests (33 suites) lolos 100% (PASS).
