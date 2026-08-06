# 06-system-architecture.md

> **Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD)**
>
> **Version:** 1.0.0
>
> **Status:** Draft
>
> **Document Owner:** Product Team
>
> **Target Release:** Q3 2026
>
> **Architecture Style:** Layered Architecture + REST API
>
> **Last Updated:** 2026

---

# PART 1

# 1. Introduction

## 1.1 Purpose

Dokumen ini menjelaskan arsitektur teknis Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD).

Dokumen ini menjadi acuan utama bagi:

- Backend Developer
- Frontend Developer
- DevOps Engineer
- QA Engineer
- System Analyst
- Product Owner

Dokumen ini mendeskripsikan bagaimana seluruh komponen sistem saling berkomunikasi mulai dari browser pengguna hingga database.

---

## 1.2 Scope

Dokumen ini mencakup:

- High Level Architecture
- Technology Stack
- Frontend Architecture
- Backend Architecture
- Database Architecture
- Authentication
- Authorization
- File Storage
- Email Service
- Attendance Engine
- Security
- Deployment
- Logging
- Monitoring

---

## 1.3 Objectives

Tujuan utama arsitektur sistem adalah:

- Mudah dikembangkan.
- Mudah dipelihara.
- Aman.
- Modular.
- Scalable.
- Testable.
- Siap untuk pengembangan jangka panjang.

---

# 2. Architecture Goals

SIMAD dirancang dengan prinsip sebagai berikut.

---

## AG-001 Maintainability

Kode harus mudah dipahami dan dipelihara.

Perubahan pada satu modul tidak boleh mempengaruhi modul lainnya secara langsung.

---

## AG-002 Scalability

Sistem harus dapat menangani:

- Banyak peserta magang
- Banyak supervisor
- Banyak kantor PLN
- Multi Branch (Future Enhancement)

---

## AG-003 Security

Seluruh endpoint yang bersifat privat wajib menggunakan autentikasi.

Semua validasi bisnis dilakukan pada Backend.

---

## AG-004 Reliability

Seluruh transaksi penting menggunakan Database Transaction.

---

## AG-005 Availability

Sistem harus dapat diakses melalui:

- Desktop
- Laptop
- Tablet
- Smartphone

menggunakan browser modern.

---

## AG-006 Performance

Target waktu respons:

| Endpoint       | Target     |
| -------------- | ---------- |
| Authentication | < 500 ms   |
| Attendance     | < 700 ms   |
| Dashboard      | < 1000 ms  |
| Export Excel   | < 10 detik |

---

# 3. Architecture Principles

SIMAD menggunakan beberapa prinsip arsitektur berikut.

---

## AP-001 Separation of Concerns

Setiap layer hanya memiliki satu tanggung jawab.

---

## AP-002 Single Responsibility Principle

Satu class hanya memiliki satu alasan untuk berubah.

---

## AP-003 Dependency Injection

Dependency antar Service menggunakan Injection.

---

## AP-004 Repository Pattern

Seluruh akses database dilakukan melalui Repository.

Controller tidak boleh mengakses Prisma secara langsung.

---

## AP-005 Service Layer

Business Logic hanya berada pada Service.

---

## AP-006 Stateless API

REST API tidak menyimpan Session pada Server.

Autentikasi menggunakan JWT.

---

## AP-007 Transaction First

Seluruh proses penting menggunakan Transaction.

Contoh:

- Approve Internship
- Generate Certificate
- Attendance

---

# 4. Technology Stack

## Frontend

| Technology      | Purpose            |
| --------------- | ------------------ |
| Next.js         | Frontend Framework |
| React           | UI Library         |
| TypeScript      | Type Safety        |
| Tailwind CSS    | Styling            |
| Shadcn/UI       | UI Components      |
| React Hook Form | Form Management    |
| Zod             | Validation         |
| TanStack Query  | Data Fetching      |
| Axios           | HTTP Client        |

---

## Backend

| Technology   | Purpose          |
| ------------ | ---------------- |
| Elysia.js    | REST API         |
| TypeScript   | Language         |
| Prisma ORM   | ORM              |
| PostgreSQL   | Database         |
| JWT          | Authentication   |
| bcrypt       | Password Hashing |
| Google Drive | File Upload      |
| Nodemailer   | Email Service    |
| XLSX         | Export Excel     |

---

## Infrastructure

| Technology     | Purpose                    |
| -------------- | -------------------------- |
| Vercel         | Frontend Deployment        |
| Render         | Backend Deployment         |
| Nginx          | Reverse Proxy              |
| Cloudflare     | Content Delivery Network   |
| GitHub Actions | CI/CD (Future Enhancement) |

---

# 5. High Level Architecture

```text
                    +----------------------+
                    |      Browser         |
                    +----------+-----------+
                               |
                               |
                               ▼
                    +----------------------+
                    |      Next.js App     |
                    +----------+-----------+
                               |
                      HTTPS REST API
                               |
                               ▼
                    +----------------------+
                    |    Elysia Server     |
                    +----------+-----------+
                               |
                +--------------+---------------+
                |                              |
                ▼                              ▼
        Business Services             Authentication
                |                              |
                +--------------+---------------+
                               |
                               ▼
                    +----------------------+
                    |  Prisma Repository   |
                    +----------+-----------+
                               |
                               ▼
                    +----------------------+
                    | PostgreSQL           |
                    +----------------------+

                 External Services

         +------------------------------+
         |      Google Drive Storage    |
         +------------------------------+

         +------------------------------+
         |       SMTP Email Server       |
         +------------------------------+
```

---

# 6. C4 Context Diagram

```text
                    +----------------------+
                    |       Intern         |
                    +----------+-----------+
                               |
                               |
                               ▼
                    +----------------------+
                    |       SIMAD          |
                    +----------+-----------+
                               ▲
                               |
          +--------------------+-------------------+
          |                                        |
          |                                        |
+----------------------+                +----------------------+
|     HR Admin         |                |     Supervisor       |
+----------------------+                +----------------------+

                    External Systems

         +------------------------------+
         |      Google Drive Storage    |
         +------------------------------+

         +------------------------------+
         |      SMTP Email Server        |
         +------------------------------+
```

---

# 7. C4 Container Diagram

```text
                 Browser

                    │

                    ▼

        +---------------------+
        |     Next.js App     |
        +---------------------+

                    │
               REST API

                    ▼

        +---------------------+
        |     Elysia API      |
        +---------------------+

          │       │        │
          │       │        │
          ▼       ▼        ▼

 Authentication  Attendance  Internship

          │       │        │

          └───────┴────────┘

                  │

                  ▼

        +---------------------+
        |    Prisma ORM       |
        +---------------------+

                  │

                  ▼

        +---------------------+
        | PostgreSQL Database |
        +---------------------+

          │              │

          ▼              ▼

    Google Drive      SMTP Server
```

---

# 8. User Roles

Sistem memiliki tiga aktor utama.

| Role       | Deskripsi                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Intern     | Melakukan registrasi, pengajuan magang, onboarding, absensi, dan mengunduh sertifikat.                            |
| HR Admin   | Memverifikasi pengajuan, menetapkan supervisor, mengelola peserta, dan membuat laporan.                           |
| Supervisor | Memantau peserta pada departemen yang menjadi tanggung jawabnya serta melakukan override absensi bila diperlukan. |

---

# 9. Core Modules

SIMAD dibagi menjadi beberapa modul utama.

| Modul                  | Fungsi                                      |
| ---------------------- | ------------------------------------------- |
| Authentication         | Login, Register, Magic Link, Reset Password |
| User Management        | Pengelolaan akun pengguna                   |
| Internship Application | Pengajuan magang                            |
| Internship             | Pengelolaan masa magang                     |
| Onboarding             | Tata tertib dan persetujuan peserta         |
| Attendance             | Check In & Check Out berbasis geofence      |
| Department             | Penempatan unit kerja                       |
| Supervisor             | Pembimbing peserta                          |
| Certificate            | Sertifikat digital otomatis                 |
| Notification           | Notifikasi sistem                           |
| File Management        | Upload surat dan dokumen                    |
| Reporting              | Rekap absensi & export Excel                |
| Audit Log              | Riwayat aktivitas penting                   |

---

# 10. Non-Functional Requirements

| Kategori        | Target                        |
| --------------- | ----------------------------- |
| Availability    | ≥ 99%                         |
| Security        | JWT + HTTPS                   |
| Scalability     | Mendukung ribuan data peserta |
| Maintainability | Layered Architecture          |
| Performance     | API < 1 detik (rata-rata)     |
| Portability     | Browser modern                |
| Reliability     | Database Transaction          |
| Extensibility   | Mudah menambah modul baru     |

---

# 11. Architecture Constraints

Beberapa batasan yang digunakan dalam pengembangan:

- Backend menggunakan Elysia.js.
- ORM menggunakan Prisma.
- Database menggunakan PostgreSQL (Neon).
- Frontend menggunakan Next.js.
- Upload file menggunakan Google Drive Storage.
- Sertifikat dihasilkan dalam format PDF.
- Seluruh komunikasi menggunakan REST API.
- Validasi geofence dilakukan di Backend.
- Seluruh endpoint privat menggunakan JWT Authentication.

---

# 12. Design Decisions

| Keputusan            | Alasan                                                |
| -------------------- | ----------------------------------------------------- |
| REST API             | Mudah diintegrasikan dengan web maupun mobile.        |
| Layered Architecture | Memisahkan tanggung jawab tiap layer.                 |
| Prisma ORM           | Type-safe dan produktif untuk PostgreSQL.             |
| PostgreSQL           | Mendukung relasi kompleks dan transaksi.              |
| Google Drive Storage | Penyimpanan file yang andal dan mudah diintegrasikan. |
| JWT Authentication   | Stateless dan cocok untuk REST API.                   |
| TypeScript           | Mengurangi bug dengan type safety.                    |

---

# End of Part 1

---

# PART 2

# 13. Frontend Architecture

Frontend SIMAD dibangun menggunakan **Next.js App Router** dengan pendekatan Component-Based Architecture.

Setiap halaman bertanggung jawab untuk menampilkan UI, sedangkan seluruh Business Logic berada pada Backend.

---

## Frontend Architecture Diagram

```text
Browser

    │

    ▼

Next.js App

    │

    ├──────────── Pages (App Router)

    ├──────────── Layout

    ├──────────── Components

    ├──────────── Hooks

    ├──────────── Services

    ├──────────── Stores

    ├──────────── Utils

    └──────────── Types
```

---

## Frontend Responsibilities

Frontend hanya bertanggung jawab terhadap:

- UI Rendering
- Form Validation
- Routing
- API Communication
- Session Management
- State Management

Frontend **tidak diperbolehkan** melakukan:

- Validasi Geofence
- Validasi Business Rules
- Perhitungan Attendance
- Generate Certificate

Semua dilakukan oleh Backend.

---

# 14. Frontend Project Structure

```text
src/

├── app/

├── components/

│   ├── atoms/

│   ├── molecules/

│   ├── organisms/

│   └── templates/

├── features/

│   ├── auth/

│   ├── internship/

│   ├── attendance/

│   ├── onboarding/

│   ├── certificate/

│   └── dashboard/

├── services/

├── hooks/

├── stores/

├── lib/

├── types/

├── utils/

├── constants/

├── providers/

└── middleware.ts
```

---

## Frontend Design Principles

- Reusable Components
- Atomic Design
- Feature Based Module
- Lazy Loading
- Code Splitting
- Server Components jika memungkinkan
- Client Components hanya bila diperlukan

---

# 15. Backend Architecture

Backend menggunakan Layered Architecture.

Business Logic dipisahkan dari akses Database.

---

## Backend Architecture Diagram

```text
HTTP Request

        │

        ▼

Router

        │

        ▼

Middleware

        │

        ▼

Controller

        │

        ▼

Service

        │

        ▼

Repository

        │

        ▼

Prisma ORM

        │

        ▼

PostgreSQL
```

---

## Backend Responsibilities

Backend bertanggung jawab terhadap:

- Authentication
- Authorization
- Validation
- Business Rules
- Attendance Engine
- Geofence Engine
- Certificate Engine
- Notification Engine
- File Upload
- Audit Log

---

# 16. Backend Project Structure

```text
src/

├── config/

├── contex/

├── routes/

├── middleware/

├── controllers/

├── services/

├── repositories/

├── validators/

├── dto/

├── interfaces/

├── types/

├── enums/

├── helpers/

├── utils/

├── lib/

├── jobs/

├── mail/

├── templates/

├── storage/

├── prisma/

├── constants/

├── errors/

├── logs/

└── app.ts
```

---

# 17. Layered Architecture

Setiap layer memiliki tanggung jawab yang berbeda.

---

## Router

Tugas:

- Mapping URL
- Register Middleware
- Memanggil Controller

Tidak boleh:

- Query Database
- Business Logic

---

## Middleware

Tugas:

- JWT Validation
- Permission
- Rate Limiting
- Logging
- Request Validation

Tidak boleh:

- Business Logic

---

## Controller

Tugas:

- Menerima Request
- Memanggil Service
- Mengembalikan Response

Tidak boleh:

- Query Prisma
- Business Logic

---

## Service

Tugas:

- Seluruh Business Rules
- Transaction
- State Machine
- Validation

Service adalah inti Backend.

---

## Repository

Tugas:

- Seluruh akses Database

Repository hanya menggunakan Prisma.

---

## Prisma

Prisma hanya digunakan oleh Repository.

Layer lain tidak boleh mengakses Prisma secara langsung.

---

# 18. Dependency Rules

Arah dependency harus selalu:

```text
Controller

↓

Service

↓

Repository

↓

Prisma
```

Tidak diperbolehkan:

```text
Controller

↓

Prisma
```

atau

```text
Middleware

↓

Repository
```

---

# 19. Authentication Architecture

SIMAD menggunakan JWT Authentication.

---

## Login Flow

```text
Login

↓

Validate Email

↓

Validate Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Return Token
```

---

## Protected Request

```text
Client

↓

Authorization Header

↓

JWT Middleware

↓

Validate Token

↓

Controller

↓

Service
```

---

## Refresh Token Flow

```text
Expired Access Token

↓

Refresh Token

↓

Generate New Access Token

↓

Return New Token
```

---

# 20. Authorization

SIMAD menggunakan Role Based Access Control (RBAC).

---

## Role Hierarchy

```text
Administrator

        │

        ▼

HR

        │

        ▼

Supervisor

        │

        ▼

Intern
```

---

## Permission Flow

```text
Request

↓

Authentication

↓

Role Validation

↓

Permission Validation

↓

Controller
```

---

Contoh:

Intern

×

Approve Internship

↓

403 Forbidden

---

HR

✓

Approve Internship

---

# 21. Security Design

Seluruh sistem mengikuti prinsip Security by Design.

---

## Authentication

- JWT
- Refresh Token
- Password Hashing (bcrypt)

---

## Authorization

- RBAC
- Permission Based Access

---

## Validation

Backend melakukan validasi:

- Request
- DTO
- Business Rules

---

## Password Policy

Minimal:

- 8 karakter
- Huruf besar
- Huruf kecil
- Angka

Future Enhancement:

- Special Character

---

## File Upload Security

File wajib divalidasi:

- MIME Type
- Extension
- Size

---

## API Security

Seluruh endpoint wajib:

- HTTPS
- JWT
- Input Validation
- Output Sanitization

---

## SQL Injection Protection

Menggunakan Prisma ORM.

Tidak diperbolehkan menggunakan raw query tanpa validasi.

---

## XSS Protection

Output harus di-escape.

Input harus divalidasi.

---

## CSRF

Menggunakan JWT pada Authorization Header.

---

## Rate Limiting

Future Enhancement:

- Login
- Register
- Forgot Password
- Attendance

---

# 22. Error Handling Strategy

Seluruh error menggunakan format yang konsisten.

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

---

Kategori Error:

- Validation Error
- Authentication Error
- Authorization Error
- Business Rule Error
- Database Error
- Internal Server Error

---

# 23. Coding Standards

Seluruh project mengikuti standar berikut.

Backend

- TypeScript Strict Mode
- ESLint
- Prettier

Frontend

- TypeScript Strict Mode
- ESLint
- Prettier

---

## Naming Convention

Class

```
AttendanceService
```

Controller

```
AttendanceController
```

Repository

```
AttendanceRepository
```

DTO

```
CreateAttendanceDto
```

Enum

```
AttendanceStatus
```

---

# 24. Architecture Summary

Layer yang digunakan pada SIMAD:

```text
Browser

↓

Next.js

↓

REST API

↓

Elysia

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Seluruh Business Logic berada pada **Service Layer**.

Seluruh akses Database dilakukan melalui **Repository Layer**.

Seluruh validasi bisnis dilakukan pada **Backend**.

---

# End of Part 2

---

# PART 3

# 25. Database Architecture

SIMAD menggunakan **PostgreSQL** sebagai Relational Database Management System (RDBMS) dengan **Prisma ORM** sebagai Data Access Layer.

Seluruh data utama sistem disimpan dalam database relasional untuk menjaga konsistensi, integritas referensial, serta mendukung transaksi kompleks.

---

## Database Architecture Diagram

```text
Application

      │

      ▼

Repository Layer

      │

      ▼

Prisma ORM

      │

      ▼

PostgreSQL
```

---

## Database Principles

Seluruh desain database mengikuti prinsip berikut.

- Third Normal Form (3NF)
- Referential Integrity
- Foreign Key Constraint
- Soft Delete
- Transaction Support
- UUID sebagai Primary Key
- Audit Trail

---

## Database Transaction

Seluruh proses berikut wajib menggunakan Database Transaction.

- Approve Internship
- Reject Internship
- Assign Supervisor
- Attendance Check In
- Attendance Check Out
- Attendance Override
- Generate Certificate

---

# 26. Prisma Architecture

Prisma digunakan sebagai ORM utama.

Prisma hanya boleh diakses oleh Repository Layer.

---

## Prisma Flow

```text
Controller

↓

Service

↓

Repository

↓

Prisma Client

↓

PostgreSQL
```

---

## Repository Pattern

Repository bertugas:

- CRUD Database
- Query Builder
- Pagination
- Filtering
- Transaction

Repository **tidak boleh** berisi Business Logic.

---

# 27. Attendance Engine

Attendance Engine merupakan inti dari SIMAD.

Engine ini bertugas melakukan seluruh validasi absensi.

---

## Attendance Engine Flow

```text
Receive Request

↓

Authentication

↓

Internship Validation

↓

Time Validation

↓

GPS Validation

↓

Geofence Validation

↓

Attendance Validation

↓

Save Attendance

↓

Audit Log

↓

Notification

↓

Response
```

---

## Attendance Components

Attendance terdiri dari beberapa komponen.

- Attendance Service
- Attendance Validator
- Time Validator
- GPS Validator
- Geofence Service
- Attendance Repository

---

## Validation Order

Urutan validasi tidak boleh diubah.

1. Authentication
2. Internship Status
3. Onboarding Status
4. Attendance Window
5. GPS
6. Geofence
7. Duplicate Attendance
8. Save Attendance

---

# 28. Geofencing Engine

Geofencing Engine bertugas menghitung apakah peserta berada dalam area kantor.

---

## Geofencing Flow

```text
GPS Coordinate

↓

Office Coordinate

↓

Haversine Formula

↓

Distance

↓

Compare Radius

↓

Inside / Outside
```

---

## Input

- Latitude User
- Longitude User
- Latitude Office
- Longitude Office
- Radius

---

## Output

- Distance
- IsInside
- Accuracy

---

## Future Enhancement

- Multiple Office Radius
- Polygon Geofence
- Dynamic Radius
- Indoor Positioning

---

# 29. Certificate Engine

Certificate Engine bertugas menghasilkan sertifikat secara otomatis.

---

## Certificate Flow

```text
Internship Completed

↓

Eligibility Validation

↓

Generate PDF

↓

Generate QR Code

↓

Store PDF

↓

Save Metadata

↓

Notification

↓

Download Ready
```

---

## Certificate Components

- Certificate Service
- PDF Generator
- QR Generator
- Certificate Repository

---

## Future Enhancement

- Digital Signature
- Blockchain Verification
- Certificate Versioning

---

# 30. File Storage Architecture

SIMAD menggunakan Google Drive Storage sebagai media penyimpanan file.

---

## Upload Flow

```text
Browser

↓

Backend

↓

Validation

↓

Google Drive Storage

↓

Save Metadata

↓

Database
```

---

## File Validation

Backend memvalidasi.

- MIME Type
- Extension
- File Size

---

## Supported File

- PDF
- JPG
- JPEG
- PNG

---

## Stored Metadata

- URL
- Public ID
- Original Name
- MIME Type
- File Size
- Uploaded At

---

# 31. Email Architecture

Seluruh email dikirim dari Backend.

---

## Email Flow

```text
Business Event

↓

Email Service

↓

SMTP

↓

Recipient
```

---

## Email Event

- Register
- Verify Email
- Forgot Password
- Magic Link
- Application Approved
- Application Rejected
- Internship Started
- Certificate Generated

---

## Email Template

Template dipisahkan dari Business Logic.

```text
mail/

templates/

verification.html

forgot-password.html

magic-link.html

approved.html

rejected.html

certificate.html
```

---

# 32. Notification Architecture

Notification digunakan sebagai komunikasi internal sistem.

---

## Notification Flow

```text
Business Event

↓

Notification Service

↓

Database

↓

Notification Center
```

---

## Notification Type

- System
- Attendance
- Approval
- Rejection
- Reminder
- Certificate

---

## Future Enhancement

- Firebase Push Notification
- WhatsApp Gateway
- Telegram Bot

---

# 33. Export Engine

Export Engine digunakan untuk menghasilkan laporan.

---

## Export Flow

```text
Filter

↓

Query Database

↓

Generate Excel

↓

Download
```

---

## Supported Format

- XLSX

Future Enhancement

- CSV
- PDF

---

# 34. Logging Architecture

SIMAD memiliki dua jenis logging.

---

## Activity Log

Digunakan untuk:

- Dashboard
- User Activity
- History

---

## Audit Log

Digunakan untuk:

- Security
- Compliance
- Investigation

---

## Logging Flow

```text
Business Event

↓

Logger

↓

Database
```

---

# 35. Background Job Architecture

Beberapa proses dijalankan secara asynchronous.

---

## Background Jobs

- Generate Certificate
- Send Email
- Notification Broadcast
- Archive Internship
- Attendance Reminder

---

## Future Enhancement

Menggunakan Queue seperti:

- BullMQ

---

# 36. API Communication

Frontend berkomunikasi dengan Backend menggunakan REST API.

---

## Request Flow

```text
Client

↓

HTTPS

↓

REST API

↓

JSON

↓

Response
```

---

## Response Standard

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Error Standard

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

---

# 37. Architecture Summary

Core Engine pada SIMAD terdiri dari:

- Authentication Engine
- Authorization Engine
- Attendance Engine
- Geofencing Engine
- Certificate Engine
- Notification Engine
- Email Engine
- Export Engine
- File Storage Engine
- Logging Engine

Setiap Engine memiliki tanggung jawab tunggal (Single Responsibility Principle) dan saling berkomunikasi melalui Service Layer.

---

# End of Part 3

---

# PART 4

# 38. Deployment Architecture

SIMAD menggunakan arsitektur deployment yang memisahkan Frontend, Backend, Database, dan layanan eksternal.

---

## Deployment Diagram

```text
                     Internet
                         │
                         ▼
                +------------------+
                |      User        |
                +--------+---------+
                         │ HTTPS
                         ▼
                +------------------+
                |     Vercel       |
                |   Next.js App    |
                +--------+---------+
                         │ REST API
                         ▼
                +------------------+
                |  Render          |
                |  Elysia Server   |
                +--------+---------+
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
+-------------+   +---------------+   +---------------+
| PostgreSQL  |   |  Drive        |   | SMTP Provider |
|             |   | File Storage  |   | Email Service |
+-------------+   +---------------+   +---------------+
```

---

## Deployment Components

| Component       | Platform             |
| --------------- | -------------------- |
| Frontend        | Vercel               |
| Backend         | Render               |
| Database        | PostgreSQL           |
| File Storage    | Google Drive Storage |
| Email           | SMTP                 |
| Reverse Proxy   | Nginx                |
| Process Manager | PM2                  |

---

# 39. Environment Configuration

Seluruh konfigurasi aplikasi menggunakan Environment Variables.

---

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=
```

---

## Backend

```env
PORT=

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=


SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=

APP_URL=
FRONTEND_URL=
```

---

## Rules

- Tidak menyimpan secret di repository.
- Menggunakan `.env`.
- Menyediakan `.env.example`.
- Secret berbeda untuk Development, Staging, dan Production.

---

# 40. Logging & Monitoring

Monitoring digunakan untuk memastikan sistem tetap berjalan dengan baik.

---

## Monitoring Scope

- API Availability
- CPU Usage
- Memory Usage
- Disk Usage
- Database Connection
- Error Rate
- Response Time

---

## Logging Categories

### Application Log

- HTTP Request
- HTTP Response
- Business Event

---

### Error Log

- Validation Error
- Internal Error
- Database Error

---

### Audit Log

- Login
- Approval
- Attendance
- Certificate
- Override

---

## Future Enhancement

- Grafana
- Prometheus
- Loki
- OpenTelemetry

---

# 41. Backup & Disaster Recovery

Seluruh data penting harus memiliki mekanisme backup.

---

## Backup Strategy

| Data           | Frequency |
| -------------- | --------- |
| Database       | Daily     |
| Uploaded Files | Daily     |
| Certificate    | Daily     |
| Audit Log      | Weekly    |

---

## Backup Policy

- Backup otomatis.
- Backup terenkripsi.
- Backup diuji secara berkala.
- Backup disimpan di lokasi berbeda.

---

## Disaster Recovery

Jika server mengalami kegagalan:

1. Restore Database.
2. Restore Uploaded Files.
3. Restore Certificate.
4. Restart Backend.
5. Verifikasi Integritas Data.

---

# 42. Scalability Strategy

SIMAD dirancang agar mudah dikembangkan.

---

## Horizontal Scaling

- Multiple Backend Instance
- Load Balancer
- Stateless API

---

## Vertical Scaling

- CPU Upgrade
- RAM Upgrade
- SSD Upgrade

---

## Future Enhancement

- Redis Cache
- Queue System
- Microservices
- Kubernetes
- CDN

---

# 43. Performance Optimization

Strategi optimasi performa.

---

## Frontend

- Code Splitting
- Lazy Loading
- Dynamic Import
- Image Optimization
- Caching

---

## Backend

- Pagination
- Database Index
- Query Optimization
- Connection Pooling

---

## Database

- Foreign Key Index
- Composite Index
- Query Analysis

---

# 44. Security Architecture

Seluruh sistem mengikuti prinsip Defense in Depth.

---

## Authentication

- JWT
- Refresh Token

---

## Authorization

- RBAC

---

## Encryption

- bcrypt
- HTTPS

---

## Validation

- DTO Validation
- Business Validation

---

## File Security

- MIME Validation
- Extension Validation
- File Size Validation

---

## Future Enhancement

- Two Factor Authentication (2FA)
- Device Management
- IP Whitelist
- Session Management

---

# 45. CI/CD Strategy

Deployment dilakukan secara bertahap.

---

## Development Flow

```text
Developer

↓

Git

↓

GitHub

↓

Pull Request

↓

Code Review

↓

Merge

↓

Deploy
```

---

## Branch Strategy

- main
- develop
- feature/\*
- hotfix/\*
- release/\*

---

## Future Enhancement

GitHub Actions:

- Lint
- Test
- Build
- Deploy

---

# 46. Architecture Decision Records (ADR)

Beberapa keputusan arsitektur yang diambil.

---

## ADR-001

REST API dipilih dibanding GraphQL.

Alasan:

- Lebih sederhana.
- Mudah dipahami.
- Cocok untuk kebutuhan SIMAD.

---

## ADR-002

Layered Architecture dipilih dibanding MVC murni.

Alasan:

- Business Logic terpisah.
- Lebih mudah diuji.
- Mudah dikembangkan.

---

## ADR-003

Prisma dipilih sebagai ORM.

Alasan:

- Type-safe.
- Produktif.
- Dokumentasi lengkap.

---

## ADR-004

PostgreSQL dipilih sebagai database.

Alasan:

- Relasional.
- Mendukung transaksi.
- Cocok untuk data terstruktur.

---

## ADR-005

Google Drive Storage dipilih sebagai File Storage.

Alasan:

- CDN bawaan.
- Optimasi gambar.
- API sederhana.

---

# 47. Architecture Risks

| Risiko                              | Mitigasi                        |
| ----------------------------------- | ------------------------------- |
| SMTP gagal                          | Retry & Monitoring              |
| Google Drive Storage tidak tersedia | Retry Upload & Error Handling   |
| Database lambat                     | Index & Query Optimization      |
| Banyak request bersamaan            | Stateless API & Scaling         |
| Token bocor                         | Refresh Token & Expired Session |

---

# 48. Non-Functional Quality Attributes

| Attribute       | Target                    |
| --------------- | ------------------------- |
| Availability    | ≥ 99%                     |
| Reliability     | High                      |
| Maintainability | High                      |
| Scalability     | High                      |
| Security        | High                      |
| Testability     | High                      |
| Portability     | High                      |
| Performance     | < 1 detik (rata-rata API) |

---

# 49. Future Architecture Roadmap

Versi berikutnya dapat menambahkan:

- Mobile Application (React Native)
- Push Notification
- Face Recognition Attendance
- QR Attendance
- NFC Attendance
- Multi Branch PLN
- Multi Office
- AI Fraud Detection
- Dashboard Analytics
- SSO PLN
- WhatsApp Notification
- Queue System (BullMQ)
- Redis Cache

---

# 50. Final Architecture Summary

Arsitektur SIMAD menggunakan pendekatan **Layered Architecture** dengan **REST API** sebagai media komunikasi antara Frontend dan Backend.

Teknologi utama yang digunakan:

- Next.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Google Drive Storage
- Nodemailer
- JWT Authentication

Seluruh Business Logic ditempatkan pada **Service Layer**, sedangkan seluruh akses database dilakukan melalui **Repository Layer**.

Validasi bisnis seperti:

- Geofence
- Attendance
- Internship Approval
- Certificate Generation

dijalankan sepenuhnya di Backend untuk menjaga keamanan dan konsistensi data.

Arsitektur ini dirancang agar:

- Modular
- Mudah dipelihara
- Mudah diuji
- Siap dikembangkan menjadi sistem multi cabang
- Siap mendukung aplikasi web maupun mobile di masa depan

---

# End of Document
