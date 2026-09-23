# ProdiDoc ISO 21001 — Sistem Penjaminan Mutu & Repositori Akreditasi EOMS

Aplikasi manajemen dan repositori berkas akreditasi berbasis **ISO 21001:2018 (Educational Organizations Management System / EOMS)** dan Standar Penjaminan Mutu Internal (SPMI) Fakultas Teknik.

---

## 🌟 Fitur Utama

1. **Dashboard Kesiapan Audit EOMS**:
   - Skor pemenuhan dokumen secara real-time.
   - Distribusi status dokumen (Missing, Submitted, Verified, Rejected/NCR, Not Applicable).
   - Pengingat sisa hari menuju jadwal audit mutu.

2. **Checklist Poin 7 FT (30 Instrumen Mutu)**:
   - Matriks 30 butir instrumen audit Fakultas Teknik.
   - Pengelompokan 5 Root Folder: `01_Kurikulum`, `02_Pelaksanaan-Perkuliahan`, `03_Evaluasi-Pembelajaran`, `04_Penjaminan-Mutu`, `05_Laporan-Akademik`.
   - Pemetaan klausul ISO 21001 dan PIC pelaksana prodi.

3. **Matriks Perangkat Perkuliahan & Aksi CRUD**:
   - Pemantauan 9 instrumen perangkat perkuliahan per mata kuliah (Silabus, RPS, Presensi, Jurnal, Kontrak Belajar, Materi, Soal UTS/UAS, Pedoman Praktikum, Bukti Penilaian).
   - Penambahan mata kuliah baru (`+ Tambah Mata Kuliah`) dengan pembuatan struktur folder otomatis.
   - Penyuntingan dan penghapusan mata kuliah secara aman.
   - Pengaturan jenis kuliah (Teori vs Teori + Praktikum).

4. **Tree Explorer & Repositori Berkas Digital**:
   - Struktur direktori hierarkis real-time prodi (TIF & TIND).
   - Sinkronisasi otomatis saat ada penambahan atau perubahan mata kuliah di Perangkat MK.
   - Kotak pencarian filter folder & mata kuliah.
   - Pratinjau berkas dokumen PDF/Word/Excel dan tautan Google Drive langsung di dalam aplikasi.

5. **Unggah Berkas Fisik & Tautan Google Drive**:
   - Dukungan unggah berkas dari komputer (PDF, DOCX, XLSX hingga 50MB).
   - Dukungan penautan Google Drive (Docs, Sheets, Slides, Folder, File).
   - Opsi pengunduhan otomatis salinan berkas fisik dan sinkronisasi metadata repositori.

6. **Lembar Verifikasi & Dialog Multi-Pihak**:
   - Form verifikasi bukti audit bagi auditor mutu.
   - Penerbitan temuan audit: Sesuai, Observasi, atau Ketidaksesuaian (NCR).
   - Forum diskusi klarifikasi temuan antara Dosen, Kaprodi, GPM, dan Auditor.

7. **Simulasi Multi-Peran (RBAC) & Kustomisasi**:
   - Simulasi multi-peran: **GPM (PIC Mutu)**, **Kaprodi**, **Auditor Mutu**, dan **Dosen Pengampu**.
   - Form kustomisasi identitas pejabat (Nama Lengkap, Gelar, NIP/NIDN, Unit Kerja, Emoji Avatar, Warna Badge).
   - Matriks 6 hak akses RBAC dinamis:
     - `canUpload`: Unggah dokumen mutu
     - `canRevise`: Revisi & perbarui versi
     - `canComment`: Beri catatan/komentar audit
     - `canApproveFormal`: Otorisasi kebijakan & validasi formal
     - `canIssueNCR`: Penerbitan temuan NCR / Observasi
     - `canSignReport`: Tanda tangan digital laporan resmi
   - Penyimpanan pengaturan persisten di `localStorage`.

8. **Ekspor Hierarkis (ZIP)**:
   - Unduh seluruh dokumen perangkat perkuliahan dalam berkas ZIP terkompresi.

---

## 🏗️ Arsitektur & Teknologi

- **Frontend**: React 18, Vite, Lucide React Icons, Vanilla CSS (Modern Design System).
- **Backend**: Laravel 11 RESTful API, PHP 8.4.
- **Database**: PostgreSQL 15.
- **Web Server / Reverse Proxy**: Nginx (Alpine).
- **Orkestrator**: Docker & Docker Compose.

---

## 🚀 Panduan Menjalankan Sistem

### Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker Engine dan Docker Compose telah terpasang di komputer Anda.

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/turnback2ubuntu-wq/ISO-webapp.git
   cd ISO-webapp
   ```

2. **Jalankan Kontainer**:
   ```bash
   docker compose up -d --build
   ```

3. **Akses Layanan**:
   - **Frontend Web**: [http://localhost:8020](http://localhost:8020)
   - **Backend API**: [http://localhost:8021](http://localhost:8021)
   - **PostgreSQL Database**: Port `5434` (User: `postgres`, Pass: `secret`, DB: `iso21001_db`)

---

## 📜 Lisensi & Standar Acuan

- Standar Acuan: **ISO 21001:2018 (EOMS)** & Standar Nasional Pendidikan Tinggi (SN-Dikti).
- Lisensi: **MIT License**.
