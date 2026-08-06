# 01. Product Overview

> Version 1.0.0

---

# 1. Introduction

## 1.1 Background

Proses administrasi magang di PLN Persero saat ini masih dilakukan secara manual. Seluruh proses mulai dari pengajuan magang, verifikasi dokumen, penyampaian tata tertib, pencatatan kehadiran, hingga pembuatan sertifikat dilakukan menggunakan dokumen fisik maupun aplikasi perkantoran sederhana.

Kondisi tersebut menyebabkan berbagai kendala operasional, seperti lamanya proses administrasi, sulitnya melakukan monitoring peserta magang, tidak tersedianya data absensi yang valid, serta tingginya beban administratif bagi bagian Human Resource (HR).

Selain itu, supervisor pada masing-masing bidang juga tidak memiliki media untuk memantau kehadiran peserta magang secara real-time sehingga evaluasi peserta menjadi kurang optimal.

Seiring dengan transformasi digital yang sedang dilakukan oleh berbagai perusahaan BUMN, diperlukan sebuah sistem yang mampu mendigitalisasi keseluruhan proses bisnis magang agar lebih efektif, transparan, terdokumentasi, dan mudah dipantau oleh seluruh pihak yang terlibat.

SIMAD (Sistem Informasi Manajemen Magang & Absensi Digital) dikembangkan sebagai solusi untuk mengintegrasikan seluruh proses tersebut ke dalam satu platform berbasis web.

---

# 1.2 Existing Business Process (AS-IS)

Saat ini alur administrasi magang berjalan sebagai berikut.

```text
Mahasiswa
      │
      ▼
Datang ke Kantor PLN
      │
      ▼
Menyerahkan Surat Pengantar
      │
      ▼
Resepsionis menerima dokumen
      │
      ▼
HR memverifikasi dokumen
      │
      ├── Ditolak
      │
      └── Diterima
              │
              ▼
Menjelaskan Tata Tertib
              │
              ▼
Menentukan Bidang
              │
              ▼
Mahasiswa Mulai Magang
              │
              ▼
Tidak Ada Sistem Absensi
              │
              ▼
Sertifikat Dibuat Manual
```

---

# 1.3 Current Problems

Berdasarkan observasi proses bisnis yang berjalan, ditemukan beberapa permasalahan utama.

## A. Administrasi

- Pengajuan dilakukan secara manual.
- Dokumen disimpan dalam bentuk fisik.
- Sulit melakukan pencarian data lama.
- Risiko kehilangan dokumen cukup tinggi.

---

## B. Monitoring

- Tidak terdapat dashboard monitoring.
- Supervisor tidak mengetahui status kehadiran peserta.
- HR kesulitan mengetahui peserta yang masih aktif.

---

## C. Attendance

- Tidak ada sistem absensi.
- Tidak ada validasi lokasi.
- Tidak ada validasi waktu.
- Tidak ada histori kehadiran.
- Tidak tersedia laporan absensi.

---

## D. Certificate

- Sertifikat dibuat satu per satu.
- Pengetikan data masih manual.
- Berpotensi terjadi kesalahan penulisan nama.
- Membutuhkan waktu cukup lama.

---

## E. Reporting

- Rekap absensi dilakukan secara manual.
- Sulit mengetahui jumlah kehadiran peserta.
- Tidak tersedia data statistik.

---

# 1.4 Root Cause Analysis

| Problem                           | Root Cause                             |
| --------------------------------- | -------------------------------------- |
| Data tersebar                     | Tidak terdapat database terpusat       |
| Absensi tidak valid               | Tidak ada sistem digital               |
| Sertifikat lama selesai           | Pembuatan masih manual                 |
| Monitoring sulit                  | Tidak tersedia dashboard               |
| HR banyak pekerjaan administratif | Seluruh proses dilakukan secara manual |
| Tidak ada histori                 | Belum terdapat sistem informasi        |

---

# 1.5 Proposed Solution (TO-BE)

SIMAD akan mengubah proses bisnis menjadi digital end-to-end.

```text
Registrasi
      │
      ▼
Upload Surat Fakultas
      │
      ▼
Approval HR
      │
      ▼
Assignment Supervisor
      │
      ▼
Digital Onboarding
      │
      ▼
Mulai Magang
      │
      ▼
GPS Attendance
      │
      ▼
Supervisor Monitoring
      │
      ▼
Generate Certificate
      │
      ▼
Download PDF
```

---

# 1.6 Product Vision

Menjadi platform digital yang mampu mengelola seluruh proses administrasi magang secara terintegrasi, efisien, transparan, serta mendukung transformasi digital di lingkungan PLN Persero.

---

# 1.7 Product Mission

SIMAD dibangun dengan beberapa misi utama.

- Mendigitalisasi seluruh proses administrasi magang.
- Mengurangi penggunaan dokumen fisik.
- Menyediakan sistem absensi digital berbasis lokasi.
- Mempermudah proses monitoring peserta.
- Menghasilkan laporan secara otomatis.
- Mengotomatisasi pembuatan sertifikat.
- Meningkatkan efisiensi kerja HR.
- Meningkatkan transparansi data.

---

# 1.8 Product Objectives

## Business Objectives

- Mengurangi waktu administrasi.
- Mengurangi penggunaan kertas.
- Meningkatkan efisiensi HR.
- Meningkatkan akurasi data.
- Mempercepat proses onboarding.

---

## User Objectives

### Peserta Magang

- Registrasi secara online.
- Melihat status pengajuan.
- Melakukan absensi.
- Mengakses tata tertib.
- Mengunduh sertifikat.

### HR

- Memverifikasi peserta.
- Mengelola penempatan.
- Menghasilkan laporan.
- Mengelola seluruh data magang.

### Supervisor

- Memantau peserta.
- Melihat absensi.
- Melakukan validasi absensi.

---

# 1.9 Value Proposition

## Untuk Peserta

- Registrasi lebih mudah.
- Tidak perlu datang berkali-kali.
- Status pengajuan dapat dipantau.
- Sertifikat tersedia otomatis.

---

## Untuk HR

- Approval lebih cepat.
- Monitoring lebih mudah.
- Data tersimpan terpusat.
- Rekap absensi otomatis.
- Sertifikat otomatis.

---

## Untuk Supervisor

- Mengetahui kehadiran peserta.
- Dashboard real-time.
- Dapat melakukan validasi absensi.

---

## Untuk Perusahaan

- Mendukung transformasi digital.
- Mengurangi biaya administrasi.
- Meningkatkan kualitas layanan.
- Data terdokumentasi dengan baik.
- Memiliki histori seluruh peserta magang.

---

# 1.10 Stakeholder Map

| Stakeholder    | Interest | Influence |
| -------------- | -------- | --------- |
| Direksi        | High     | High      |
| HR             | High     | High      |
| Supervisor     | High     | Medium    |
| Peserta Magang | High     | Low       |
| IT Department  | High     | High      |
| Management     | Medium   | High      |

---

# 1.11 Success Metrics

| Indicator           | Target    |
| ------------------- | --------- |
| Registrasi Online   | >95%      |
| Approval            | <24 Jam   |
| Generate Sertifikat | <30 Detik |
| Export Excel        | <10 Detik |
| System Availability | 99.5%     |
| GPS Accuracy        | >99%      |
| User Satisfaction   | >4.5/5    |
| HR Efficiency       | +70%      |

---

# 1.12 Assumptions

Beberapa asumsi yang digunakan selama pengembangan.

- Seluruh peserta memiliki email aktif.
- Browser mendukung Geolocation API.
- Pengguna memiliki koneksi internet.
- Supervisor memiliki akun sistem.
- HR bertanggung jawab terhadap approval.
- Lokasi kantor dapat ditentukan menggunakan koordinat GPS.

---

# 1.13 Constraints

Beberapa batasan sistem pada fase pertama.

- Hanya mendukung satu kantor PLN.
- Belum mendukung multi-company.
- Belum mendukung multi-branch.
- Belum tersedia aplikasi mobile native.
- Belum menggunakan Face Recognition.
- Belum terintegrasi dengan sistem HR internal PLN.

---

# 1.14 Risks

| Risk                  | Impact | Mitigation                                                            |
| --------------------- | ------ | --------------------------------------------------------------------- |
| Fake GPS              | High   | Validasi geofencing, time-bound, audit log, dan verifikasi supervisor |
| Server Down           | High   | Monitoring server, backup, dan recovery plan                          |
| Human Error           | Medium | Validasi input dan konfirmasi tindakan penting                        |
| Kehilangan Data       | High   | Backup database berkala                                               |
| Internet Tidak Stabil | Medium | Optimasi PWA dan mekanisme retry saat sinkronisasi data               |

---

# 1.15 Product Scope Summary

## Included

- Authentication
- Internship Registration
- HR Approval
- Internship Placement
- Digital Onboarding
- GPS Attendance
- Dashboard
- Notification
- Certificate Generator
- Reporting
- Audit Log

---

## Excluded

- Face Recognition
- Mobile Native
- Payroll
- AI Monitoring
- OCR
- Single Sign-On
- SAP Integration

---

# Next Document

**02-business-process.md**

Dokumen berikut menjelaskan proses bisnis secara detail, meliputi:

- Business Process AS-IS
- Business Process TO-BE
- BPMN
- Activity Diagram
- Swimlane Diagram
- Workflow Approval
- Workflow Absensi
- Workflow Sertifikat
- Workflow Notifikasi
- State Diagram
