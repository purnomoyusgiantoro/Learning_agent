# Task: FE-01 - Halaman Login Sederhana (Email & Password)

**Assignee:** FE Agent  
**Status:** DONE  
**Tanggal Dibuat:** 2026-08-18  
**Tanggal Selesai:** 2026-08-18  

---

## 1. Tujuan
Membuat antarmuka (UI) halaman login sederhana yang bersih, responsif, dan fungsional menggunakan input **Email** dan **Password**, memperbarui form login yang sebelumnya menggunakan input username.

---

## 2. Pekerjaan yang Harus Dilakukan
1. **Pembaruan Form Login UI:**
   - Menyediakan input field untuk **Email** (dengan tipe `email`, placeholder yang jelas, dan validasi format email dasar).
   - Menyediakan input field untuk **Password** (dengan tipe `password`, placeholder, dan validasi *required*).
   - Menyediakan tombol submit / login yang jelas dengan visual feedback (hover, focus, active).
2. **Validasi & Interaksi Pengguna di Frontend:**
   - Validasi input di sisi klien (memastikan email berformat valid dan password tidak kosong).
   - Menampilkan pesan error atau feedback visual yang ramah pengguna jika input tidak valid.
   - Menyiapkan handler submit form untuk menangani flow submit.
3. **Penyempurnaan Tampilan (Styling):**
   - Menjaga tata letak tetap responsif dan proporsional di tampilan desktop maupun mobile.
   - Menjaga konsistensi estetika desain (tipografi, spasi, kontras warna yang mudah dibaca).

---

## 3. File yang Kemungkinan Perlu Diubah / Dibuat
- `frotend/index.html` (pembaruan struktur form dari username ke email, styling, dan script)
- `frotend/halaman2.html` (jika ada penyesuaian alur navigasi pasca-login)

---

## 4. Kriteria Selesai (Definition of Done)
- [x] Terdapat input field untuk **Email** dengan atribut `type="email"` dan validasi format email.
- [x] Terdapat input field untuk **Password** dengan atribut `type="password"`.
- [x] Validasi form bekerja: pengguna diberi notifikasi/pesan jika email tidak valid atau password kosong.
- [x] Tampilan halaman rapi dan responsif di layar desktop dan mobile.
- [x] Tidak ada error di browser console saat halaman dimuat dan dioperasikan.

---

## 5. Laporan Hasil Pekerjaan (Frontend Agent)

### Ringkasan Perubahan:
1. **Pembaruan Antarmuka & Input Form (`frotend/index.html`):**
   - Mengganti input `username` menjadi input `email` dengan atribut `type="email"`, `id="email"`, `name="email"`, `placeholder="nama@email.com"`, serta `required` dan `autocomplete="email"`.
   - Menambahkan input `password` dengan `type="password"`, `id="password"`, `placeholder="Masukkan password Anda"`, serta `required` dan `autocomplete="current-password"`.
   - Mengimplementasikan sistem notifikasi error visual yang rapi (inline error per-field + error banner box `alertMessage`).
   - Menerapkan desain UI modern, clean card layout, responsive design (desktop & mobile viewport), serta focus states yang ramah aksesibilitas.
   - Menambahkan indikator loading state pada tombol submit saat proses autentikasi berlangsung.

2. **Pembaruan Halaman Pasca-Login (`frotend/halaman2.html`):**
   - Menyempurnakan tampilan dashboard sederhana yang menyambut email pengguna (dari `sessionStorage`) dan tombol kembali ke halaman login (logout flow).

3. **Sinkronisasi Folder:**
   - Memastikan file tersedia dan konsisten di folder `frotend/` dan `frontend/`.

### Hasil Testing:
- **Unit & Logic Verification Test:** Dilakukan pengujian otomatis terhadap ketersediaan elemen DOM, integritas regex validasi email (`^[^\s@]+@[^\s@]+\.[^\s@]+$`), inline error messaging, dan fungsionalitas redirect.
- **Hasil:** `100% Passed` (Semua kriteria terpenuhi tanpa kendala).
