# 02. Business Process

> Version 1.0.0

---

# 1. Business Process Overview

## 1.1 Introduction

Dokumen ini menjelaskan proses bisnis yang diterapkan pada Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD). Seluruh proses dirancang untuk mentransformasikan administrasi magang yang sebelumnya dilakukan secara manual menjadi proses digital yang terintegrasi, terdokumentasi, dan mudah dipantau oleh seluruh pemangku kepentingan.

Business Process menjadi dasar dalam penyusunan:

- User Flow
- UI/UX Design
- Database Design
- API Specification
- Business Rules
- System Workflow
- Acceptance Testing

---

# 1.2 Objectives

Perancangan proses bisnis memiliki beberapa tujuan utama.

### Efisiensi Operasional

Mengurangi pekerjaan administratif yang sebelumnya dilakukan secara manual oleh HR melalui digitalisasi seluruh proses magang.

---

### Transparansi

Seluruh status pengajuan, penempatan, absensi, hingga sertifikat dapat dipantau secara real-time oleh pihak yang berkepentingan.

---

### Akuntabilitas

Setiap aktivitas yang dilakukan oleh pengguna akan tercatat pada sistem sehingga menghasilkan audit trail yang jelas.

---

### Standarisasi

Seluruh unit kerja menggunakan alur administrasi magang yang sama sehingga mengurangi inkonsistensi proses.

---

# 2. Current Business Process (AS-IS)

## 2.1 Overview

Pada kondisi saat ini, proses administrasi magang di PLN Persero masih bergantung pada dokumen fisik dan komunikasi langsung antara mahasiswa, resepsionis, HR, serta supervisor.

Sebagian besar aktivitas administratif belum terdigitalisasi sehingga membutuhkan waktu yang cukup lama serta berpotensi menimbulkan kesalahan pencatatan.

---

# 2.2 AS-IS Workflow

```text
Mahasiswa
    │
    ▼
Datang ke Kantor PLN
    │
    ▼
Membawa Surat Pengantar Fakultas
    │
    ▼
Resepsionis Menerima Berkas
    │
    ▼
HR Melakukan Verifikasi
    │
    ├───────────────┐
    │               │
    ▼               ▼
 Ditolak        Diterima
                    │
                    ▼
        Menjelaskan Tata Tertib
                    │
                    ▼
          Menentukan Bidang
                    │
                    ▼
        Menentukan Supervisor
                    │
                    ▼
         Mahasiswa Mulai Magang
                    │
                    ▼
       Tidak Ada Sistem Absensi
                    │
                    ▼
      Supervisor Memantau Manual
                    │
                    ▼
      Sertifikat Dibuat Manual
                    │
                    ▼
               Selesai
```

---

# 2.3 AS-IS Process Description

| No  | Activity                   | Actor       |
| --- | -------------------------- | ----------- |
| 1   | Datang ke kantor           | Mahasiswa   |
| 2   | Menyerahkan surat fakultas | Mahasiswa   |
| 3   | Menerima dokumen           | Resepsionis |
| 4   | Memverifikasi dokumen      | HR          |
| 5   | Menjelaskan tata tertib    | HR          |
| 6   | Menentukan bidang          | HR          |
| 7   | Menentukan supervisor      | HR          |
| 8   | Memulai magang             | Mahasiswa   |
| 9   | Monitoring manual          | Supervisor  |
| 10  | Membuat sertifikat         | HR          |

---

# 2.4 Pain Point Analysis

## A. Registration

### Existing Process

Mahasiswa diwajibkan datang secara langsung ke kantor PLN hanya untuk menyerahkan surat pengantar.

### Problems

- Memerlukan perjalanan ke kantor.
- Berpotensi terjadi antrean.
- Dokumen mudah hilang.
- Tidak ada pelacakan status pengajuan.

### Impact

- Membutuhkan waktu lebih lama.
- HR harus mengarsipkan dokumen secara manual.
- Sulit mencari kembali dokumen lama.

---

## B. Verification

### Existing Process

HR memeriksa surat satu per satu secara manual.

### Problems

- Tidak ada dashboard verifikasi.
- Status approval tidak terdokumentasi.
- Mahasiswa harus menanyakan hasil secara langsung.

### Impact

- Approval menjadi lambat.
- Komunikasi tidak efisien.
- Sulit mengetahui jumlah pengajuan yang belum diproses.

---

## C. Onboarding

### Existing Process

Tata tertib hanya dijelaskan secara lisan.

### Problems

- Peserta dapat lupa.
- Tidak ada bukti bahwa tata tertib telah dibaca.
- HR harus mengulang penjelasan untuk setiap peserta baru.

### Impact

- Informasi tidak konsisten.
- Waktu HR terbuang untuk aktivitas berulang.

---

## D. Placement

### Existing Process

Penempatan bidang dilakukan secara manual.

### Problems

- Tidak ada histori penempatan.
- Supervisor tidak menerima notifikasi otomatis.
- Sulit melakukan pencarian data peserta berdasarkan bidang.

### Impact

- Monitoring menjadi kurang efektif.

---

## E. Attendance

### Existing Process

Belum tersedia sistem absensi digital.

### Problems

- Tidak ada jam masuk.
- Tidak ada jam pulang.
- Tidak ada validasi lokasi.
- Tidak ada histori kehadiran.

### Impact

- Sulit mengetahui tingkat kedisiplinan peserta.
- Sulit menyusun laporan.

---

## F. Reporting

### Existing Process

Laporan dibuat secara manual.

### Problems

- Membutuhkan waktu lama.
- Rentan salah hitung.
- Tidak dapat menghasilkan statistik.

---

## G. Certificate

### Existing Process

HR membuat sertifikat menggunakan template Word.

### Problems

- Penulisan nama dilakukan manual.
- Rentan typo.
- Memerlukan proses cetak satu per satu.

### Impact

- Beban administratif meningkat.
- Waktu penyelesaian menjadi lebih lama.

---

# 3. Root Cause Analysis

| Problem           | Root Cause                   | Effect                           |
| ----------------- | ---------------------------- | -------------------------------- |
| Registrasi manual | Belum ada sistem             | Administrasi lambat              |
| Approval lama     | Tidak ada dashboard          | HR kesulitan monitoring          |
| Tata tertib lisan | Tidak ada onboarding digital | Informasi tidak terdokumentasi   |
| Tidak ada absensi | Belum ada modul attendance   | Kehadiran tidak dapat divalidasi |
| Sertifikat manual | Tidak ada generator otomatis | HR bekerja berulang              |
| Data tersebar     | Tidak ada database terpusat  | Sulit mencari data               |

---

# 4. Business Opportunity

Digitalisasi proses magang memberikan berbagai peluang peningkatan kualitas layanan administrasi.

## Operational Benefits

- Mengurangi penggunaan dokumen fisik.
- Mempercepat proses approval.
- Mengurangi pekerjaan administratif.
- Mengurangi human error.

---

## Management Benefits

- Monitoring peserta secara real-time.
- Dashboard analitik.
- Rekap absensi otomatis.
- Audit aktivitas pengguna.

---

## User Benefits

### Peserta

- Registrasi online.
- Tidak perlu datang berkali-kali.
- Dapat memantau status pengajuan.
- Sertifikat tersedia otomatis.

### HR

- Approval lebih cepat.
- Data lebih terorganisir.
- Laporan otomatis.
- Sertifikat otomatis.

### Supervisor

- Monitoring lebih mudah.
- Dashboard harian.
- Validasi absensi.

---

# 5. Future Business Process (TO-BE)

SIMAD mengintegrasikan seluruh proses administrasi magang ke dalam satu sistem berbasis web.

## High-Level Workflow

```text
Registrasi Akun
        │
        ▼
Lengkapi Profil
        │
        ▼
Upload Surat Pengantar
        │
        ▼
Submit Pengajuan
        │
        ▼
HR Review
        │
 ┌──────┴─────────┐
 │                │
Reject         Approve
                    │
                    ▼
Assign Supervisor
                    │
                    ▼
Assign Bidang
                    │
                    ▼
Digital Onboarding
                    │
                    ▼
Peserta Menyetujui Tata Tertib
                    │
                    ▼
Status ACTIVE
                    │
                    ▼
Check-In
                    │
                    ▼
GPS Validation
                    │
                    ▼
Supervisor Monitoring
                    │
                    ▼
Check-Out
                    │
                    ▼
Masa Magang Berakhir
                    │
                    ▼
Generate Certificate
                    │
                    ▼
Download PDF
```

---

# 6. Business Value

Implementasi SIMAD memberikan nilai tambah bagi organisasi.

| Area        | Current   | Future             |
| ----------- | --------- | ------------------ |
| Registrasi  | Manual    | Online             |
| Approval    | Manual    | Dashboard          |
| Tata Tertib | Lisan     | Digital Onboarding |
| Penempatan  | Manual    | Terpusat           |
| Absensi     | Tidak Ada | GPS Digital        |
| Monitoring  | Manual    | Real-Time          |
| Sertifikat  | Manual    | Otomatis           |
| Reporting   | Manual    | Export Excel       |
| Audit       | Tidak Ada | Audit Log          |

---

# Next Section

Pada bagian berikutnya (**Part 2**) akan dibahas secara rinci mengenai:

- Swimlane Diagram
- BPMN Process
- Approval Workflow
- Onboarding Workflow
- Assignment Supervisor Workflow
- Decision Flow
- Activity Diagram

Bagian ini akan menjadi dasar implementasi backend dan frontend.
