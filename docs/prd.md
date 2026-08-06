# Product Requirements Document (PRD)

# Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD)

> **Version:** 1.0.0 (Draft)
> **Document Status:** 🟡 In Progress
> **Project Code:** SIMAD
> **Target Release:** Q3 2026
> **Platform:** Progressive Web Application (PWA)
> **Document Owner:** Product Team
> **Prepared By:** Product Manager
> **Last Updated:** August 2026

---

# Document Information

| Item           | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| Product Name   | Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD) |
| Short Name     | SIMAD                                                       |
| Client         | PLN Persero                                                 |
| Platform       | Web Application (Responsive) & Progressive Web App (PWA)    |
| Frontend       | Next.js + TypeScript                                        |
| Backend        | Elysia.js + TypeScript                                      |
| Database       | PostgreSQL                                                  |
| ORM            | Prisma ORM                                                  |
| Storage        | Cloudinary                                                  |
| Authentication | JWT + Magic Link + Email Verification                       |
| Deployment     | Docker                                                      |

---

# Purpose

Dokumen ini menjadi acuan utama dalam proses analisis, perancangan, pengembangan, pengujian, hingga implementasi Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD).

PRD ini bertujuan untuk memastikan seluruh stakeholder memiliki pemahaman yang sama mengenai ruang lingkup proyek, kebutuhan bisnis, kebutuhan pengguna, aturan bisnis, serta spesifikasi teknis yang akan diterapkan selama pengembangan sistem.

Dokumen ini juga menjadi referensi utama bagi Product Manager, UI/UX Designer, Frontend Developer, Backend Developer, QA Engineer, dan Stakeholder PLN Persero selama siklus pengembangan produk.

---

# Background

Saat ini proses administrasi magang di PLN Persero masih dilakukan secara manual.

Calon peserta magang diwajibkan datang langsung ke kantor untuk menyerahkan surat pengantar dari perguruan tinggi. Setelah dokumen diverifikasi oleh pihak HR atau penanggung jawab magang, peserta akan diberikan penjelasan mengenai tata tertib kerja secara lisan dan kemudian ditempatkan pada bidang tertentu.

Selama masa magang berlangsung belum tersedia sistem yang mampu mencatat kehadiran peserta secara digital. Seluruh aktivitas absensi masih dilakukan secara manual bahkan pada beberapa unit tidak dilakukan pencatatan sama sekali.

Selain itu, proses pembuatan sertifikat magang juga masih dilakukan secara manual menggunakan aplikasi pengolah dokumen sehingga membutuhkan waktu cukup lama serta memiliki risiko kesalahan penulisan identitas peserta.

Melihat kondisi tersebut, diperlukan sebuah sistem yang mampu mendigitalisasi seluruh proses bisnis magang mulai dari registrasi, onboarding, penempatan peserta, absensi harian, monitoring supervisor, hingga penerbitan sertifikat secara otomatis.

---

# Vision

Membangun sistem manajemen magang yang modern, terdigitalisasi, transparan, serta mampu meningkatkan efisiensi administrasi magang di lingkungan PLN Persero.

---

# Mission

- Mendigitalisasi proses registrasi peserta magang.
- Mengurangi penggunaan dokumen fisik (paperless).
- Mempermudah proses verifikasi oleh HR.
- Menyediakan sistem absensi digital berbasis lokasi (GPS).
- Memberikan dashboard monitoring kepada supervisor.
- Mengotomatisasi proses penerbitan sertifikat magang.
- Menyediakan laporan absensi yang akurat dan dapat diekspor.
- Meningkatkan transparansi data selama proses magang.

---

# Problem Statement

Beberapa permasalahan utama pada proses bisnis saat ini antara lain:

- Seluruh proses registrasi masih menggunakan dokumen fisik.
- Data peserta belum tersimpan secara terpusat.
- Tata tertib hanya disampaikan secara lisan.
- Tidak terdapat sistem onboarding digital.
- Penempatan supervisor belum terdokumentasi dengan baik.
- Tidak tersedia sistem absensi digital.
- Tidak tersedia monitoring kehadiran secara real-time.
- Rekap absensi dilakukan secara manual.
- Sertifikat dibuat satu per satu menggunakan template dokumen.
- Tidak tersedia histori aktivitas peserta selama masa magang.
- Tidak terdapat audit log terhadap perubahan data.

---

# Product Goals

SIMAD dibangun untuk mencapai beberapa tujuan berikut.

## Business Goals

- Mengurangi proses administrasi manual.
- Mempercepat proses approval peserta magang.
- Meminimalisir kesalahan administrasi.
- Meningkatkan efisiensi pekerjaan HR.
- Menyediakan data magang secara terpusat.
- Mempermudah proses monitoring peserta.

## User Goals

### Peserta Magang

- Registrasi dapat dilakukan secara online.
- Dapat mengetahui status pengajuan kapan saja.
- Melakukan absensi melalui smartphone maupun laptop.
- Mengakses tata tertib secara digital.
- Mengunduh sertifikat secara mandiri.

### HR

- Memverifikasi pengajuan lebih cepat.
- Mengatur penempatan peserta.
- Mengelola data peserta.
- Menghasilkan laporan absensi.
- Menghasilkan sertifikat otomatis.

### Supervisor

- Melihat peserta pada bidangnya.
- Memantau kehadiran harian.
- Melakukan validasi atau pembatalan absensi jika diperlukan.
- Melihat riwayat kehadiran peserta.

---

# Success Metrics (KPI)

Produk dianggap berhasil apabila memenuhi indikator berikut.

| KPI                                | Target        |
| ---------------------------------- | ------------- |
| Registrasi dilakukan secara online | ≥95%          |
| Approval maksimal                  | <1 Hari Kerja |
| Akurasi absensi GPS                | ≥99%          |
| Generate sertifikat                | <30 Detik     |
| Waktu ekspor laporan               | <10 Detik     |
| Availability Sistem                | ≥99.5%        |
| Error Rate                         | <1%           |
| Paper Usage Reduction              | ≥90%          |

---

# Stakeholders

| Role               | Responsibility                        |
| ------------------ | ------------------------------------- |
| Product Owner      | Menentukan arah produk                |
| Product Manager    | Menyusun kebutuhan produk             |
| HR PLN             | Mengelola administrasi peserta        |
| Supervisor         | Membimbing peserta magang             |
| Peserta Magang     | Menggunakan sistem selama masa magang |
| UI/UX Designer     | Mendesain antarmuka                   |
| Frontend Developer | Mengembangkan aplikasi frontend       |
| Backend Developer  | Mengembangkan API dan database        |
| QA Engineer        | Melakukan pengujian sistem            |
| DevOps Engineer    | Deployment dan monitoring server      |

---

# Product Scope

## In Scope

- Registrasi akun
- Login
- Email Verification
- Magic Link Authentication
- Reset Password
- Pengajuan Magang
- Upload Surat Pengantar
- Dashboard HR
- Dashboard Supervisor
- Dashboard Peserta
- Approval Workflow
- Assignment Supervisor
- Assignment Bidang
- Digital Onboarding
- Notification Center
- GPS Attendance
- Check In
- Check Out
- Attendance History
- Export Excel
- Generate Certificate
- Download Certificate
- Audit Log
- Profile Management

---

## Out of Scope

Fitur berikut tidak termasuk pada fase pertama pengembangan.

- Mobile Native Application
- Face Recognition
- Fingerprint Attendance
- RFID Attendance
- Payroll
- Performance Assessment
- Chat Internal
- Video Meeting
- AI Attendance Detection
- OCR Surat Otomatis
- Integrasi SAP PLN
- Integrasi Single Sign-On Internal PLN

---

# High Level Modules

SIMAD terdiri dari beberapa modul utama.

1. Authentication Module
2. User Management
3. Internship Registration
4. Approval Management
5. Internship Placement
6. Digital Onboarding
7. Attendance Management
8. GPS Validation
9. Notification Center
10. Dashboard HR
11. Dashboard Supervisor
12. Dashboard Intern
13. Reporting
14. Certificate Generator
15. Audit Log
16. System Configuration

---

# Version History

| Version | Date        | Author       | Description   |
| ------- | ----------- | ------------ | ------------- |
| 1.0.0   | August 2026 | Product Team | Initial Draft |

---

# Approval

| Role            | Name | Status  |
| --------------- | ---- | ------- |
| Product Owner   | -    | Pending |
| HR PLN          | -    | Pending |
| Project Manager | -    | Pending |
| Technical Lead  | -    | Pending |

---

# Next Document

➡️ **01-overview.md**

Dokumen selanjutnya menjelaskan secara rinci mengenai latar belakang proyek, analisis masalah, tujuan bisnis, visi produk, nilai yang diberikan kepada pengguna, serta ruang lingkup sistem yang akan dibangun.
