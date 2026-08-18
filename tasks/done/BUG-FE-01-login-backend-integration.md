# Bug Report: BUG-FE-01 - Frontend Login Belum Terintegrasi ke Backend API

**ID Bug:** BUG-FE-01  
**Assignee:** FRONTEND Agent  
**Reporter:** QA Agent  
**Severity:** High / Blocker (End-to-End Auth)  
**Status:** RESOLVED (DONE)  
**Tanggal Dibuat:** 2026-08-18  
**Tanggal Diselesaikan:** 2026-08-18  

---

## 1. Ringkasan Bug (Summary)
Form login pada `frontend/index.html` belum terhubung ke endpoint Backend API (`POST http://localhost:5000/api/login`). Script frontend sebelumnya membaca file statis lokal `frontend/env` via `fetch('env')` dan membandingkan teks mentah `PASSWORD:admin123`.

---

## 2. Dampak (Impact)
1. **Frontend gagal berkomunikasi dengan Backend:** Tidak ada request HTTP POST yang dikirim ke service backend.
2. **Kredensial Valid Gagal:** Pengguna valid yang terdaftar di database backend (seperti `user@example.com` / `securepassword123` dan `purnomo@example.com` / `purnomo123`) tidak bisa login melalui UI frontend (ditolak dengan alert "Password salah!").
3. **JWT Token & Data User Terabaikan:** Token autentikasi dan identitas pengguna dari backend tidak tersimpan di client (`sessionStorage`).
4. **Error Handling Backend Tidak Aktif:** Pesan error dan validasi dari server (HTTP 400 & HTTP 401) tidak tertangani secara dinamis di UI.

---

## 3. Komponen & Kepemilikan (Ownership)
- **Komponen:** Frontend UI & API Client (`frontend/index.html`)
- **Penanggung Jawab:** **FRONTEND Agent (FE)**

---

## 4. Langkah Reproduksi (Steps to Reproduce)
1. Pastikan server backend berjalan di port 5000 (`http://localhost:5000/api/health`).
2. Buka `frontend/index.html` di browser.
3. Masukkan kredensial backend yang valid:
   - **Email:** `user@example.com`
   - **Password:** `securepassword123`
4. Klik tombol **Login**.
5. Buka Browser DevTools (Network Tab & Console):
   - Request yang dikirim adalah `GET /env` (bukan `POST http://localhost:5000/api/login`).
   - Tampilan UI menampilkan pesan kesalahan: `"Password salah!"`.

---

## 5. Hasil yang Diharapkan vs Hasil Aktual (Expected vs Actual)
- **Expected:**
  - Submit form mengirim request `POST` ke `http://localhost:5000/api/login` dengan header `Content-Type: application/json` dan body:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
  - Jika response `200 OK`: Simpan token dan data user ke `sessionStorage`, lalu redirect ke `halaman2.html`.
  - Jika response `400 Bad Request` atau `401 Unauthorized`: Tampilkan pesan error dari backend (`data.message` atau `data.errors[0]`) di elemen `#alertMessage`.
  - Jika koneksi gagal / server backend offline: Tampilkan pesan error koneksi backend.
- **Actual:**
  - Script membaca file statis `env` (`fetch('env')`) dan mencocokkan password secara hardcoded (`admin123`).

---

## 6. Lokasi Kode Bermasalah
File: [`frontend/index.html`](file:///D:/documents/1-Projek/Learning_agent/frontend/index.html)

---

## 7. Panduan Langkah Perbaikan (Action Items untuk FRONTEND Agent)
- [x] **Perbarui submit handler di `frontend/index.html`:**
  - Gunakan `fetch` ke endpoint backend API: `http://localhost:5000/api/login`.
  - Kirim `method: 'POST'`, headers `'Content-Type': 'application/json'`, dan `body: JSON.stringify({ email: emailValue, password: passValue })`.
- [x] **Tangani HTTP Response Status:**
  - Parsing respon JSON (`data = await res.json()`).
  - **Kondisi Sukses (`res.ok` / `200 OK`):** Simpan `authToken`, `userEmail`, `userName`, dan `userData` ke `sessionStorage`, lalu redirect ke `halaman2.html`.
  - **Kondisi Gagal (`400 Bad Request` / `401 Unauthorized`):** Tampilkan pesan error backend (`data.message` atau `data.errors.join(', ')`) pada alert box dan tandai field input invalid.
  - **Kondisi Error Jaringan:** Tampilkan pesan kegagalan koneksi server backend.
- [x] **Bersihkan sisa file static mock:**
  - Menghapus pemanggilan file `env` lokal dan menghapus file mock `frontend/env`.
- [x] **Hapus direktori redundan `frotend/`:**
  - Menghapus direktori `frotend/` beserta seluruh isinya dan memastikan seluruh pengerjaan serta referensi kode hanya berada di dalam direktori `frontend/`.

---

## 8. Laporan Hasil Perbaikan Bug (Resolution Report)

### Tindakan yang Dilakukan:
1. **Integrasi REST API Backend (`frontend/index.html`):**
   - Handler form submit telah dihubungkan langsung ke `http://localhost:5000/api/login` menggunakan `fetch` `POST` dengan `Content-Type: application/json`.
   - Mengirimkan payload JSON `{ email, password }`.
2. **Pengelolaan Session & Token:**
   - Menyimpan `authToken`, `userEmail`, `userName`, dan objek `userData` ke dalam `sessionStorage` pada response sukses `200 OK`.
   - Mengarahkan pengguna secara otomatis ke `halaman2.html`.
   - Halaman `halaman2.html` menampilkan nama dan email pengguna terautentikasi serta menyediakan tombol logout yang membersihkan seluruh session.
3. **Penanganan Error Server Komprehensif:**
   - Menangani response `401 Unauthorized` (kredensial salah) dengan pesan dinamis dari server dan highlight border merah pada input password.
   - Menangani response `400 Bad Request` dengan menggabungkan list validasi error server (`data.errors`).
   - Menangani kegagalan jaringan / offline server backend via blok `catch`.
4. **Pembersihan File Mock & Folder Redundan:**
   - Direktori redundan `frotend/` telah dihapus menggunakan perintah PowerShell `Remove-Item -Recurse -Force "D:\documents\1-Projek\Learning_agent\frotend"`.
   - Seluruh kode frontend aktif kini tunggal dan terpusat di direktori `frontend/` (`frontend/index.html`, `frontend/halaman2.html`, `frontend/package.json`).

### Hasil Verifikasi & Testing:
- ✅ Endpoint `POST http://localhost:5000/api/login` terhubung dengan benar.
- ✅ Respon `200 OK` dengan token & user data berhasil diproses dan disimpan ke `sessionStorage`.
- ✅ Respon `401 Unauthorized` berhasil dirender dengan pesan `"Email atau password salah"`.
- ✅ Respon `400 Bad Request` berhasil menampilkan pesan validasi backend.
- ✅ Respon network failure ditangani dengan pesan informatif.
- ✅ Direktori `frotend/` terverifikasi sudah tidak ada di workspace root.
