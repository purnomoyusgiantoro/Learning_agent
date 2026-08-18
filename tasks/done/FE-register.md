# Task: FE-REGISTER-01 - Antarmuka Halaman Registrasi Pengguna (Register UI)

- **ID:** FE-REGISTER-01
- **Agent:** FE Agent
- **Status:** DONE
- **Dependency:** BE-REGISTER-01 (Kontrak endpoint `POST /api/register`)
- **Tanggal Selesai:** 2026-08-18

---

## 1. Tujuan
Membuat antarmuka web (UI) halaman registrasi pengguna yang bersih, responsif, dan interaktif yang memungkinkan calon pengguna memasukkan **Nama Lengkap**, **Email**, dan **Password**, mengirimkannya ke endpoint Backend API, serta menampilkan pesan status berhasil atau gagal secara jelas.

---

## 2. Pekerjaan yang Harus Dilakukan
1. **Pembuatan Form UI Registrasi (`frontend/register.html`):**
   - Membuat halaman registrasi dengan form input:
     - **Nama Lengkap:** input text (`id="name"`, `required`).
     - **Email:** input email (`id="email"`, `type="email"`, `required`).
     - **Password:** input password (`id="password"`, `type="password"`, `required`).
   - Tombol submit **Daftar / Register** dengan state visual (hover, focus, disabled saat loading).
   - Tautan navigasi menuju halaman login: *"Sudah punya akun? Masuk di sini"* -> mengarah ke `index.html`.
2. **Navigasi dari Halaman Login (`frontend/index.html`):**
   - Menambahkan tautan/link menuju halaman registrasi: *"Belum punya akun? Daftar sekarang"* -> mengarah ke `register.html`.
3. **Validasi Sisi Klien & Error Handling:**
   - Validasi input sebelum submit (nama minimal 2 karakter, email berformat valid, password minimal 6 karakter).
   - Menampilkan inline feedback jika ada field yang tidak memenuhi kriteria.
4. **Integrasi dengan Backend API:**
   - Mengirim request `POST http://localhost:5000/api/register` dengan header `Content-Type: application/json`.
   - **Kondisi Sukses (201 Created):**
     - Menampilkan pesan sukses (alert box hijau).
     - Mengarahkan (*redirect*) otomatis ke `index.html` setelah 1.5 - 2 detik agar user dapat langsung login.
   - **Kondisi Gagal (400 Bad Request / 409 Conflict):**
     - Menampilkan pesan error dari backend pada box alert merah (misal: "Email sudah terdaftar").
   - **Kondisi Error Jaringan:**
     - Menampilkan pesan fallback jika server backend tidak dapat dihubungi.

---

## 3. File yang Diubah / Dibuat
- `frontend/register.html` *(Baru)*
- `frontend/index.html` *(Update tautan & styling link registrasi)*

---

## 4. Acceptance Criteria (Definition of Done)
- [x] Halaman `frontend/register.html` terbuat dengan struktur form lengkap (Nama, Email, Password, Tombol Submit).
- [x] Terdapat link navigasi bolak-balik yang berfungsi antara `index.html` (Login) dan `register.html` (Register).
- [x] Validasi form client-side berjalan mencegah submit data kosong/tidak valid.
- [x] Form mengirim data JSON ke backend `POST http://localhost:5000/api/register`.
- [x] Menampilkan pesan alert sukses dan melakukan redirect ke `index.html` saat status 201 diterima.
- [x] Menampilkan pesan alert error yang informatif saat registrasi gagal (email duplikat atau validasi gagal).
- [x] Tampilan responsif di layar mobile dan desktop serta bebas error di konsol browser.

---

## 5. Ringkasan Implementasi

### 1. Halaman Registrasi (`frontend/register.html`):
- **Struktur & Desain UI:** Mengadopsi sistem desain token konsisten dari `index.html` (palette CSS HSL/Hex, typography modern, card layout, smooth micro-interactions, responsive padding/radius).
- **Komponen Form & Aksesibilitas:**
  - Input `name` (`id="name"`, `autocomplete="name"`, placeholder deskriptif).
  - Input `email` (`id="email"`, `type="email"`, `autocomplete="email"`).
  - Input `password` (`id="password"`, `type="password"`, `autocomplete="new-password"`).
  - Box notifikasi (`id="alertMessage"`, `role="alert"`) dengan styling dinamis `.alert-success` (hijau) dan `.alert-error` (merah).
  - Inline error feedback per-field (`#nameError`, `#emailError`, `#passwordError`) yang muncul otomatis saat validasi gagal dan hilang saat pengguna mulai mengetik kembali.
- **Interaksi & Backend Integration:**
  - Validasi ketat sisi klien: Nama minimal 2 karakter, regex format email, password minimal 6 karakter.
  - State tombol loading: Mengubah teks menjadi `"Mendaftarkan..."` dan `disabled = true` selama HTTP request berlangsung.
  - Memproses response 201 Created: Menampilkan banner hijau sukses dan auto-redirect ke `index.html` dalam 1.8 detik.
  - Error handling lengkap: Menangani respons 400 Bad Request, 409 Conflict (email terdaftar), hingga network failure dengan pesan edukatif.

### 2. Navigasi Halaman Login (`frontend/index.html`):
- Menambahkan tautan ramah aksesibilitas di bawah formulir login: `"Belum punya akun? Daftar sekarang"` yang mengarah ke `register.html`.
- Menambahkan styling `.auth-footer` dan `.auth-link` dengan efek hover dan focus ring.

### 3. Hasil Pengujian:
- **Verifikasi Elemen DOM & ID:** Seluruh ID (`name`, `email`, `password`, `submitBtn`, `alertMessage`, `nameError`, `emailError`, `passwordError`, `registerForm`, `apiEndpoint`) diverifikasi hadir dan sesuai spesifikasi.
- **Verifikasi Link Navigasi 2 Arah:** Teruji bolak-balik antara login (`index.html`) dan registrasi (`register.html`).
- **Verifikasi Backend:** 26/26 backend unit & integration tests tetap berjalan lancar (`PASS: 100%`).
