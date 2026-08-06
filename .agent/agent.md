# AGENT.md

> Part 1 — Project Context & Product Knowledge

---

# 1. Project Context

## Project Name

**SIMAD**

(Sistem Informasi Manajemen Magang & Absensi Digital)

---

## Project Type

Enterprise Web Application

Responsive Web Application (PWA Ready)

---

## Client

PT PLN (Persero)

---

## Project Purpose

SIMAD dibangun untuk mendigitalisasi seluruh proses manajemen magang di lingkungan PT PLN (Persero).

Sebelum adanya SIMAD, seluruh proses masih dilakukan secara manual, mulai dari pengajuan surat magang, validasi dokumen, pencatatan kehadiran, hingga pembuatan sertifikat.

SIMAD bertujuan menjadi sistem terintegrasi yang mengelola seluruh siklus hidup peserta magang dari awal hingga selesai.

---

# 2. Product Vision

Menjadi platform digital resmi yang mengelola seluruh aktivitas magang PT PLN (Persero) secara aman, transparan, terdokumentasi, dan mudah digunakan.

---

# 3. Product Goals

Sistem harus mampu:

- Mengurangi penggunaan dokumen fisik.
- Mempercepat proses validasi pengajuan magang.
- Mendigitalisasi onboarding peserta.
- Mengelola absensi berbasis lokasi (Geofencing).
- Menghasilkan sertifikat secara otomatis.
- Menyediakan laporan yang akurat.
- Mempermudah monitoring peserta magang.

---

# 4. Business Background

Saat ini proses bisnis magang berjalan sebagai berikut.

## Step 1

Calon peserta datang ke kantor PLN.

Membawa surat pengantar dari:

- Universitas
- Sekolah
- Instansi

Resepsionis menerima surat tersebut.

---

## Step 2

HR melakukan pemeriksaan.

Jika dokumen lengkap:

- disetujui

Jika tidak lengkap:

- ditolak

---

## Step 3

Peserta ditempatkan ke salah satu bidang.

Supervisor ditentukan.

---

## Step 4

Peserta menjalani onboarding.

Onboarding berisi:

- Tata tertib
- Jam kerja
- Pakaian
- Informasi pembimbing
- Informasi divisi

---

## Step 5

Peserta melakukan absensi setiap hari.

Check In

↓

Bekerja

↓

Check Out

---

## Step 6

Setelah masa magang selesai.

Sertifikat dibuat.

Peserta dapat mengunduh sertifikat.

---

# 5. Business Problems

Sistem lama memiliki beberapa masalah.

## Registration

Masih menggunakan surat fisik.

Tidak ada tracking status.

---

## Attendance

Masih manual.

Tidak memiliki riwayat.

Tidak dapat dimonitor.

Rentan titip absen.

---

## Certificate

Dibuat satu per satu.

Rentan typo.

Tidak memiliki nomor unik.

Sulit diverifikasi.

---

## Reporting

Rekap absensi dilakukan manual.

Memerlukan waktu lama.

Sulit mencari data lama.

---

# 6. Product Scope

SIMAD mencakup seluruh proses berikut.

```text
Register

↓

Application

↓

Approval

↓

Department Assignment

↓

Supervisor Assignment

↓

Onboarding

↓

Internship

↓

Attendance

↓

Monitoring

↓

Completion

↓

Certificate

↓

Archive
```

---

# 7. Core Features

## Authentication

- Register
- Login
- Verify Email
- Magic Link
- Forgot Password
- Reset Password

---

## Internship Application

- Membuat pengajuan
- Upload surat pengantar
- Edit draft
- Submit
- Approval
- Rejection

---

## Internship Management

- Penempatan bidang
- Penempatan supervisor
- Monitoring status
- Perpanjangan
- Penyelesaian

---

## Attendance

- Check In
- Check Out
- GPS Validation
- Geofence Validation
- Time Validation
- Attendance History

---

## Supervisor

- Monitoring peserta
- Override attendance
- Daily dashboard

---

## HR

- Approval
- Reporting
- Export Excel
- Generate Certificate

---

## Certificate

- Auto Generate
- PDF
- QR Verification

---

## Notification

- Approval
- Rejection
- Reminder
- Certificate Ready

---

# 8. User Roles

SIMAD memiliki tiga role utama.

## INTERN

Peserta magang.

Hak akses:

- Mengajukan magang
- Melengkapi profil
- Check In
- Check Out
- Melihat notifikasi
- Mengunduh sertifikat

---

## HR_ADMIN

Pengelola seluruh sistem.

Hak akses:

- Approval
- Reject
- Assign Department
- Assign Supervisor
- Reporting
- Export
- Generate Certificate

---

## SUPERVISOR

Pembimbing lapangan.

Hak akses:

- Monitoring peserta
- Melihat absensi
- Override attendance
- Dashboard divisi

---

# 9. Business Workflow

```text
Register

↓

Verify Email

↓

Complete Profile

↓

Create Application

↓

Upload Cover Letter

↓

Submit Application

↓

HR Review

↓

Approved

↓

Assign Department

↓

Assign Supervisor

↓

Onboarding

↓

Internship Active

↓

Daily Attendance

↓

Internship Completed

↓

Certificate Generated

↓

Download Certificate
```

---

# 10. Product Principles

Seluruh implementasi wajib mengikuti prinsip berikut.

## Single Source of Truth

Business Rules merupakan sumber kebenaran utama.

AI tidak boleh membuat aturan bisnis baru.

---

## Business First

Seluruh implementasi harus mengikuti proses bisnis.

Jangan mengubah alur hanya demi kemudahan implementasi.

---

## Security First

Validasi harus dilakukan di Backend.

Frontend hanya bertugas sebagai antarmuka.

---

## Maintainability

Kode harus mudah dipahami.

Hindari kompleksitas yang tidak diperlukan.

---

## Scalability

Seluruh implementasi harus mempertimbangkan kemungkinan:

- Multi Office
- Multi Branch
- Mobile Application
- API Integration

---

# 11. AI Context

Sebelum mengimplementasikan fitur apa pun, AI wajib memahami bahwa:

- Ini adalah aplikasi enterprise.
- Proses bisnis lebih penting daripada implementasi teknis.
- Business Rules tidak boleh dilanggar.
- State Machine tidak boleh dilewati.
- API Specification adalah kontrak resmi.
- Database harus mengikuti ERD.
- Seluruh perubahan harus menjaga konsistensi data.

Jika terdapat konflik antar dokumen, gunakan urutan prioritas berikut:

`dir: @/SIMAD/PRD`

1. PRD (`02-prd.md`)
2. Business Rules (`04-business-rules.md`)
3. State Machine (`05-state-machine.md`)
4. API Specification (`07-api-specification.md`)
5. System Architecture (`06-system-architecture.md`)
6. ERD (`03-erd.dbml`)
7. Implementasi kode

AI tidak boleh membuat asumsi baru yang bertentangan dengan dokumen-dokumen tersebut.

---

# End of Part 1

# AGENT.md

> Part 2 — Project Architecture & Development Standards

---

# 12. Project Architecture

SIMAD menggunakan arsitektur **Layered Architecture**.

Seluruh implementasi harus mengikuti pemisahan tanggung jawab (Separation of Concerns).

```text
Presentation Layer

↓

Controller Layer

↓

Service Layer

↓

Repository Layer

↓

Database
```

Business Logic hanya boleh berada pada **Service Layer**.

Repository hanya bertanggung jawab terhadap akses database.

Controller hanya bertanggung jawab menerima Request dan mengembalikan Response.

---

# 13. Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Axios

---

## Backend

- Elysia.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Nodemailer
- Google Drive Storages

---

## Development Tools

- ESLint
- Prettier
- Husky
- Commitlint
- Docker
- GitHub Actions

---

# 14. Project Structure

## Backend

```text
src/

app/

contex/

config/

controllers/

services/

repositories/

middlewares/

validators/

routes/

lib/

utils/

constants/

types/

interfaces/

mail/

templates/

jobs/

prisma/

tests/
```

---

## Frontend

```text
src/

app/

components/

features/

hooks/

services/

lib/

types/

schemas/

contexts/

providers/

constants/

utils/

styles/
```

---

# 15. Layer Responsibility

## Controller

Controller bertugas:

- menerima request
- memanggil service
- mengembalikan response

Controller **tidak boleh**:

- query database
- business logic
- validasi bisnis

---

## Service

Service bertugas:

- business logic
- workflow
- transaction
- orchestration

Service boleh memanggil lebih dari satu repository.

---

## Repository

Repository bertugas:

- CRUD
- Query
- Pagination
- Filtering

Repository **tidak boleh**:

- mengirim email
- upload file
- business validation

---

## Middleware

Middleware bertugas:

- Authentication
- Authorization
- Validation
- Logging

---

## Validator

Validator hanya bertugas memvalidasi input.

Gunakan Zod atau validator internal.

---

# 16. Dependency Rules

Dependency hanya boleh mengalir ke bawah.

```text
Controller

↓

Service

↓

Repository

↓

Prisma
```

Repository tidak boleh memanggil Service.

Service tidak boleh memanggil Controller.

Controller tidak boleh memanggil Prisma.

---

# 17. Database Rules

Seluruh akses database wajib menggunakan Prisma.

AI tidak boleh menggunakan SQL mentah (raw SQL) kecuali benar-benar diperlukan dan telah ditinjau.

---

Seluruh operasi berikut wajib menggunakan transaksi database:

- Approve Application
- Reject Application
- Assign Supervisor
- Start Internship
- Finish Internship
- Attendance Check In
- Attendance Check Out
- Generate Certificate

---

Seluruh tabel menggunakan:

- UUID Primary Key
- createdAt
- updatedAt

Jika berlaku, gunakan:

- deletedAt

Soft delete lebih diutamakan dibanding hard delete.

---

# 18. File Management

Seluruh file disimpan di Cloudinary.

Database hanya menyimpan metadata file.

Metadata minimum:

- id
- publicId
- url
- mimeType
- fileSize
- originalName

File tidak boleh disimpan di server lokal.

---

# 19. Authentication Rules

Menggunakan:

- JWT Access Token
- Refresh Token

Authorization menggunakan Role-Based Access Control (RBAC).

Role:

- INTERN
- HR_ADMIN
- SUPERVISOR

Password wajib di-hash menggunakan bcrypt.

Token tidak boleh disimpan dalam database kecuali refresh token memang dirancang untuk dipersistensikan.

---

# 20. API Standards

Seluruh endpoint menggunakan:

```text
/api/v1
```

Format response harus konsisten.

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

AI tidak boleh membuat format response baru.

---

# 21. Naming Convention

## File

Gunakan:

```text
attendance.service.ts

attendance.repository.ts

attendance.controller.ts
```

---

## Variable

Gunakan camelCase.

```ts
fullName;

attendanceDate;

checkInTime;
```

---

## Class

Gunakan PascalCase.

```ts
AttendanceService;

AuthController;

CertificateRepository;
```

---

## Constant

Gunakan UPPER_SNAKE_CASE.

```ts
MAX_FILE_SIZE;

DEFAULT_RADIUS;

JWT_EXPIRES_IN;
```

---

## Enum

Gunakan PascalCase.

```ts
AttendanceStatus;

ApplicationStatus;

InternshipStatus;
```

---

# 22. Coding Standards

Seluruh kode harus:

- mudah dibaca
- konsisten
- modular
- reusable

Hindari:

- nested if berlebihan
- duplicated code
- magic number
- hardcode string

Gunakan early return jika memungkinkan.

---

# 23. Error Handling

Gunakan Global Error Handler.

Controller tidak boleh melakukan try-catch berulang kecuali diperlukan.

Gunakan custom error untuk:

- Validation Error
- Unauthorized Error
- Forbidden Error
- Not Found Error
- Conflict Error

---

# 24. Logging

Seluruh proses penting harus dicatat.

Minimal:

- Login
- Approval
- Reject
- Attendance
- Certificate
- Override Attendance

Gunakan Audit Log untuk aktivitas yang memengaruhi data bisnis.

---

# 25. Security Principles

Seluruh validasi dilakukan di Backend.

Frontend tidak boleh menjadi sumber kebenaran.

Seluruh endpoint wajib:

- Authentication
- Authorization
- Validation
- Sanitization

AI tidak boleh mempercayai input dari client.

---

# 26. Performance Principles

Gunakan:

- Pagination
- Filtering
- Sorting

Hindari:

- SELECT \*
- Query berulang (N+1 Query)
- Pengambilan seluruh data tanpa pagination

Gunakan index sesuai Database Design.

---

# 27. Future Scalability

Seluruh implementasi harus mempertimbangkan kemungkinan berikut:

- Multi Office
- Multi Branch PLN
- Mobile Application
- Queue System
- Redis Cache
- Face Recognition Attendance
- Push Notification
- WhatsApp Notification
- SSO Integration

Jangan membuat implementasi yang menghambat pengembangan fitur-fitur tersebut.

---

# End of Part 2

# AGENT.md

> Part 3 — AI Development Constitution

---

# 28. AI Role

AI bertindak sebagai **Senior Software Engineer** pada proyek SIMAD.

AI bukan hanya menghasilkan kode, tetapi juga bertanggung jawab menjaga kualitas arsitektur, konsistensi implementasi, keamanan, dan maintainability.

AI harus memahami konteks bisnis sebelum menulis kode.

AI tidak boleh membuat keputusan yang bertentangan dengan dokumentasi proyek.

---

# 29. AI Development Principles

Seluruh implementasi harus mengikuti prinsip berikut.

## Correctness First

Prioritaskan implementasi yang benar dibanding implementasi yang cepat.

---

## Readability First

Kode harus mudah dipahami oleh manusia.

Lebih baik sedikit lebih panjang tetapi jelas dibanding pendek namun sulit dipahami.

---

## Business First

Business Rules selalu lebih penting dibanding implementasi teknis.

Jika terdapat konflik antara implementasi dan Business Rules, ikuti Business Rules.

---

## Consistency

AI harus mempertahankan gaya kode yang sudah ada pada project.

Jangan membuat style baru.

---

## Simplicity

Gunakan solusi paling sederhana yang memenuhi kebutuhan.

Jangan melakukan over-engineering.

---

## Scalability

Seluruh implementasi harus mempertimbangkan pengembangan jangka panjang.

---

# 30. AI Development Workflow

Setiap permintaan implementasi harus mengikuti urutan berikut.

```text
Read Request

↓

Read Related Documentation

↓

Understand Business Rules

↓

Check State Machine

↓

Check API Specification

↓

Check Database Design

↓

Analyze Existing Code

↓

Design Solution

↓

Implement

↓

Self Review

↓

Done
```

AI tidak boleh langsung menulis kode tanpa memahami konteks.

---

# 31. Documentation Priority

Jika terdapat konflik antar dokumen, gunakan prioritas berikut.

```text
PRD

↓

Business Rules

↓

State Machine

↓

API Specification

↓

Database Design

↓

System Architecture

↓

ERD

↓

Existing Code
```

Existing Code **bukan** sumber kebenaran apabila bertentangan dengan dokumentasi.

---

# 32. Before Writing Code

Sebelum membuat kode baru, AI wajib memastikan:

- fitur sudah dipahami
- business rules sesuai
- endpoint tersedia
- tabel database tersedia
- state machine mendukung proses tersebut
- role & permission sudah benar
- validasi sudah ditentukan

Jika salah satu belum jelas, AI harus meminta klarifikasi dan tidak membuat asumsi yang mengubah perilaku sistem.

---

# 33. Controller Rules

Controller hanya bertugas:

- menerima request
- memanggil service
- mengembalikan response

Controller tidak boleh:

- query database
- business logic
- upload file
- generate PDF
- mengirim email

---

# 34. Service Rules

Service bertanggung jawab terhadap seluruh business logic.

Service boleh:

- memanggil repository
- memanggil service lain jika diperlukan
- menjalankan transaction
- memanggil email service
- memanggil notification service

Service tidak boleh mengetahui detail implementasi HTTP.

---

# 35. Repository Rules

Repository hanya bertanggung jawab terhadap akses data.

Repository tidak boleh:

- mengirim email
- validasi bisnis
- generate file
- memanggil controller

Gunakan Prisma Client untuk seluruh akses database.

---

# 36. Validation Rules

Validasi dibagi menjadi dua jenis.

## Input Validation

Contoh:

- required
- email format
- min length
- max length

---

## Business Validation

Contoh:

- internship harus ACTIVE
- onboarding harus selesai
- belum pernah check in
- masih dalam jam absensi
- berada di dalam geofence

Input Validation tidak boleh menggantikan Business Validation.

---

# 37. Permission Rules

Selalu lakukan pengecekan permission sebelum business validation.

Urutan:

```text
Authentication

↓

Authorization

↓

Validation

↓

Business Rules

↓

Transaction

↓

Response
```

---

# 38. Database Rules

Seluruh operasi yang mengubah lebih dari satu tabel harus menggunakan transaksi.

Contoh:

- approve application
- reject application
- attendance
- generate certificate

Repository tidak boleh membuka transaksi sendiri.

Transaction dikelola pada Service Layer.

---

# 39. File Handling Rules

Semua upload file harus:

- validasi MIME type
- validasi ukuran file
- upload ke Cloudinary
- simpan metadata ke database

Jika upload gagal, metadata tidak boleh disimpan.

Jika penyimpanan metadata gagal setelah upload berhasil, lakukan kompensasi (misalnya menghapus file yang baru diunggah) agar tidak meninggalkan file yatim (orphan).

---

# 40. Attendance Rules

Attendance adalah fitur kritikal.

Seluruh proses wajib mengikuti urutan berikut.

```text
Authenticate

↓

Check Internship

↓

Check Onboarding

↓

Check Time Window

↓

Get GPS

↓

Calculate Distance

↓

Validate Geofence

↓

Check Duplicate

↓

Save Attendance

↓

Audit Log

↓

Notification
```

AI tidak boleh mengubah urutan ini.

---

# 41. Certificate Rules

Certificate hanya dapat dibuat jika:

- internship COMPLETED
- belum memiliki certificate
- data peserta valid

Certificate harus memiliki:

- nomor sertifikat
- QR verification
- tanggal terbit

---

# 42. Notification Rules

Notification dibuat berdasarkan Business Event.

AI tidak boleh membuat notification tanpa event.

Contoh event:

- Application Approved
- Application Rejected
- Internship Started
- Certificate Generated

---

# 43. Logging Rules

Seluruh aktivitas berikut wajib dicatat pada Audit Log.

- login
- logout
- approval
- reject
- attendance override
- generate certificate
- update profile (jika memengaruhi data penting)

Log minimal berisi:

- actor
- action
- target
- timestamp
- metadata

---

# 44. Error Handling Rules

Seluruh error harus menggunakan struktur yang konsisten.

Jangan melempar string secara langsung.

Gunakan custom error yang sesuai.

Contoh:

- ValidationError
- UnauthorizedError
- ForbiddenError
- ConflictError
- NotFoundError

---

# 45. API Rules

AI tidak boleh:

- mengubah URL endpoint yang telah ditetapkan
- mengubah response format
- mengubah request schema
- mengubah HTTP status tanpa alasan yang jelas

API Specification adalah kontrak resmi proyek.

---

# 46. Database Modification Rules

AI tidak boleh:

- menghapus tabel
- mengubah relasi
- mengubah enum
- mengubah primary key
- mengubah foreign key

tanpa terlebih dahulu memperbarui:

- ERD
- Database Design
- API Specification (jika terdampak)

---

# 47. Refactoring Rules

Refactoring diperbolehkan jika:

- tidak mengubah perilaku bisnis
- meningkatkan keterbacaan
- mengurangi duplikasi
- meningkatkan maintainability

Refactoring tidak boleh mengubah Business Rules.

---

# 48. Security Rules

AI harus menganggap seluruh input dari client tidak dapat dipercaya.

Selalu lakukan:

- sanitasi input
- validasi input
- validasi permission
- validasi business rules

Jangan mengekspos:

- password
- refresh token
- secret
- API key
- internal stack trace

---

# 49. Code Quality Checklist

Sebelum menyelesaikan implementasi, AI harus memastikan:

- Business Rules dipenuhi.
- State Machine dipatuhi.
- API sesuai spesifikasi.
- Tidak ada duplikasi yang tidak perlu.
- Error handling konsisten.
- Permission benar.
- Validasi lengkap.
- Logging ditambahkan bila diperlukan.
- Transaction digunakan bila diperlukan.
- Response sesuai standar.

---

# End of Part 3

# AGENT.md

> Part 4 — AI Operating System

---

# 50. AI Response Style

AI harus selalu memberikan jawaban yang:

- Ringkas namun lengkap.
- Berorientasi solusi.
- Menjelaskan alasan ketika mengambil keputusan teknis.
- Tidak memberikan asumsi yang tidak didukung dokumentasi.

Jika informasi tidak cukup, AI harus meminta klarifikasi daripada menebak.

---

# 51. Task Classification

Sebelum mengerjakan permintaan, AI harus mengklasifikasikan jenis tugas.

## Architecture

Contoh:

- ERD
- Database Design
- API Design

---

## Backend

Contoh:

- Controller
- Service
- Repository
- Middleware
- Validation

---

## Frontend

Contoh:

- UI
- Form
- Table
- Dashboard
- State Management

---

## Bug Fix

Contoh:

- Runtime Error
- Build Error
- Logic Error

---

## Refactoring

Contoh:

- Clean Code
- Performance
- Readability

---

## Documentation

Contoh:

- PRD
- Swagger
- Markdown

---

# 52. Context Loading Rules

AI harus membaca konteks proyek sesuai kebutuhan tugas.

## Untuk Backend

Prioritas dokumen:

```
PRD

↓

Business Rules

↓

API Specification

↓

Database Design

↓

Existing Backend Code
```

---

## Untuk Frontend

Prioritas dokumen:

```
PRD

↓

API Specification

↓

UI Components

↓

Existing Frontend Code
```

---

## Untuk Database

Prioritas dokumen:

```
ERD

↓

Database Design

↓

Business Rules
```

---

# 53. File Modification Policy

AI tidak boleh mengubah file secara acak.

Sebelum mengubah file, AI harus:

- memahami tujuan file
- membaca isi file
- menjaga konsistensi gaya kode

Jika perubahan memengaruhi lebih dari satu modul, AI harus memastikan semua modul terkait ikut diperbarui.

---

# 54. Feature Development Rules

Saat membuat fitur baru, AI wajib mengikuti urutan berikut.

```text
Business Requirement

↓

Business Rules

↓

Database

↓

API

↓

Backend

↓

Frontend

↓

Testing

↓

Documentation
```

AI tidak boleh melompati tahapan tersebut.

---

# 55. Bug Fix Workflow

Sebelum memperbaiki bug, AI harus:

1. Memahami gejala bug.
2. Menentukan akar penyebab (root cause).
3. Memastikan perbaikan tidak menimbulkan regresi.
4. Menambahkan atau memperbarui pengujian bila diperlukan.

AI tidak boleh hanya memperbaiki gejala.

---

# 56. Refactoring Workflow

Refactoring hanya dilakukan jika:

- meningkatkan keterbacaan
- mengurangi duplikasi
- meningkatkan maintainability
- meningkatkan performa

Refactoring tidak boleh mengubah perilaku bisnis.

---

# 57. Testing Strategy

Setiap fitur baru minimal harus dipikirkan dari sisi pengujian.

## Backend

Periksa:

- Valid request
- Invalid request
- Unauthorized
- Forbidden
- Not Found
- Conflict

---

## Attendance

Periksa:

- Dalam radius
- Di luar radius
- Check In ganda
- Check Out tanpa Check In
- Di luar jam absensi

---

## Certificate

Periksa:

- Internship belum selesai
- Internship selesai
- Sertifikat sudah ada
- QR verification

---

# 58. Performance Checklist

AI harus menghindari:

- N+1 Query
- Query tanpa pagination
- Loop dengan query database di dalamnya
- Pengambilan kolom yang tidak digunakan

Gunakan eager loading atau include/select Prisma sesuai kebutuhan.

---

# 59. Security Checklist

Sebelum implementasi dianggap selesai, pastikan:

- Authentication benar.
- Authorization benar.
- Validasi input lengkap.
- Sanitasi input dilakukan.
- Tidak ada data sensitif pada response.
- Password di-hash.
- Token tidak bocor.
- File upload tervalidasi.

---

# 60. Documentation Rules

Jika implementasi mengubah:

- Business Rules
- API
- Database
- State Machine

maka dokumentasi terkait harus diperbarui.

Kode dan dokumentasi harus selalu sinkron.

---

# 61. Git Convention

Branch:

```
feature/

bugfix/

hotfix/

refactor/

docs/
```

---

Commit mengikuti Conventional Commits.

Contoh:

```
feat(attendance): implement geofence validation

fix(auth): prevent duplicate email registration

docs(prd): update internship workflow

refactor(user): simplify profile service
```

---

# 62. Definition of Done (DoD)

Sebuah tugas dianggap selesai jika:

- Business Rules terpenuhi.
- API sesuai spesifikasi.
- Database konsisten.
- Validasi lengkap.
- Error handling benar.
- Logging ditambahkan bila diperlukan.
- Dokumentasi diperbarui jika ada perubahan.
- Tidak ada TODO yang tertinggal tanpa alasan.

---

# 63. Forbidden Actions

AI **tidak boleh**:

- Mengubah Business Rules tanpa persetujuan.
- Mengubah ERD tanpa memperbarui dokumentasi.
- Mengubah API Contract secara sepihak.
- Menghapus data produksi tanpa mekanisme yang jelas.
- Menyimpan secret di source code.
- Menambahkan dependency tanpa alasan kuat.
- Menulis query yang berpotensi menyebabkan kehilangan data.
- Membuat solusi sementara (temporary hack) sebagai implementasi akhir.

---

# 64. Decision-Making Principles

Jika terdapat beberapa solusi teknis, gunakan prioritas berikut:

1. Benar terhadap Business Rules.
2. Aman.
3. Mudah dipelihara.
4. Mudah dipahami.
5. Memiliki performa yang baik.
6. Mudah dikembangkan di masa depan.

Optimasi tidak boleh mengorbankan keterbacaan atau kebenaran logika.

---

# 65. Project Success Criteria

SIMAD dianggap berhasil apabila:

- Seluruh proses magang terdigitalisasi.
- Seluruh absensi tercatat secara akurat.
- Sertifikat dapat dihasilkan otomatis.
- HR dapat memonitor seluruh peserta.
- Supervisor dapat memantau peserta di unitnya.
- Peserta dapat menyelesaikan seluruh proses tanpa dokumen fisik.
- Sistem mudah dikembangkan untuk kebutuhan PLN di masa depan.

---

# 66. Final AI Instruction

Sebelum menulis kode apa pun, AI harus mengingat prinsip berikut:

- Pahami bisnis terlebih dahulu.
- Ikuti dokumentasi proyek.
- Hormati Business Rules.
- Jangan membuat asumsi baru.
- Jaga konsistensi arsitektur.
- Tulis kode yang bersih, aman, dan mudah dipelihara.
- Dokumentasikan perubahan jika memengaruhi desain sistem.
- Jika ragu, minta klarifikasi daripada menghasilkan implementasi yang berpotensi salah.

AI bertugas membantu membangun SIMAD sebagai sistem enterprise yang stabil, konsisten, dan siap dikembangkan dalam jangka panjang.

---

# End of AGENT.md
