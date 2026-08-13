# 07-api-specification.md

> **Project:** Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD)
>
> **Version:** 1.0.0
>
> **API Version:** v1
>
> **Protocol:** HTTPS
>
> **Format:** JSON
>
> **Architecture:** REST API
>
> **Status:** Draft
>
> **Document Owner:** Backend Team
>
> **Last Updated:** 2026

---

# PART 1

# 1. Introduction

## 1.1 Purpose

Dokumen ini mendefinisikan seluruh spesifikasi REST API yang digunakan oleh SIMAD.

Dokumen ini menjadi kontrak resmi antara:

- Frontend Developer
- Backend Developer
- Mobile Developer
- QA Engineer
- DevOps Engineer

---

## 1.2 API Base URL

### Development

```
http://localhost:5000/api/v1
```

---

### Staging

```
https://staging-api.simad.my.id/api/v1
```

---

### Production

```
https://api.simad.my.id/api/v1
```

---

# 2. API Design Standards

Seluruh endpoint mengikuti standar berikut.

## Protocol

HTTPS

---

## Format

JSON

---

## Character Encoding

UTF-8

---

## Naming Convention

Gunakan:

```
kebab-case
```

Contoh

```
forgot-password

magic-link

check-in

check-out
```

---

## Resource Naming

Gunakan bentuk plural.

Contoh

```
/users

/applications

/attendance

/certificates

/notifications
```

---

## HTTP Method

| Method | Fungsi                 |
| ------ | ---------------------- |
| GET    | Mengambil Data         |
| POST   | Membuat Data           |
| PUT    | Mengganti Seluruh Data |
| PATCH  | Update Sebagian        |
| DELETE | Menghapus Data         |

---

# 3. API Versioning

Seluruh endpoint menggunakan prefix:

```
/api/v1
```

Contoh

```
/api/v1/auth/login
```

Future:

```
/api/v2
```

---

# 4. Authentication

SIMAD menggunakan:

- JWT Access Token
- Refresh Token
- Internal Api Secret

---

## Authorization Header

```
Authorization: Bearer <access_token>
x-internal-api-key: <X-Internal-Api-Key>
```

---

Endpoint Public tidak memerlukan Authorization Header, Cukup Menggunakan.
`x-internal-api-key: <X-Internal-Api-Key>`

---

# 5. Content Type

Semua request JSON

```
Content-Type: application/json
```

---

Upload File

```
multipart/form-data
```

---

# 6. Standard Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

# 7. Standard Error Response

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

# 8. HTTP Status Code

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

# 9. Pagination

Request

```
?page=1

&limit=10
```

---

Response

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 120,
    "totalPages": 12
  }
}
```

---

# 10. Filtering

Contoh

```
GET /applications

?status=approved

&departmentId=uuid

&keyword=andi
```

---

# 11. Sorting

Contoh

```
?sortBy=createdAt

&order=desc
```

---

# 12. Authentication Module

Base URL

```
/auth
```

---

# 12.1 Register

## Endpoint

```
POST /auth/register
```

---

## Description

Mendaftarkan akun baru.

---

## Authentication

Public

---

## Request

```json
{
  "fullName": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!"
}
```

---

## Success Response

201 Created

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "uuid",
    "email": "budi@example.com"
  }
}
```

---

## Error Response

400

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## Business Rules

- Email harus unik.
- Password mengikuti Password Policy.
- Status akun = Pending Verification.
- Sistem mengirim email verifikasi.

---

# 12.2 Verify Email

## Endpoint

```
POST /auth/verify-email
```

---

## Authentication

Public

---

## Request

```json
{
  "token": "verification-token"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Business Rules

- Token harus valid.
- Token belum kedaluwarsa.
- Akun berubah menjadi Active.

---

# 12.3 Login

## Endpoint

```
POST /auth/login
```

---

## Authentication

Public

---

## Request

```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "fullName": "Budi Santoso",
      "role": "INTERN"
    }
  }
}
```

---

## Error Response

401

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Business Rules

- Email sudah terverifikasi.
- Akun aktif.
- Password benar.
- Menghasilkan Access Token dan Refresh Token.

---

# 12.4 Refresh Token

## Endpoint

```
POST /auth/refresh-token
```

---

## Authentication

Public (menggunakan Refresh Token)

---

## Request

```json
{
  "refreshToken": "..."
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "...",
    "expiresIn": 3600
  }
}
```

---

## Business Rules

- Refresh Token valid.
- Refresh Token belum kedaluwarsa.
- Refresh Token belum dicabut.

---

# 12.5 Forgot Password

## Endpoint

```
POST /auth/forgot-password
```

---

## Request

```json
{
  "email": "budi@example.com"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Password reset link has been sent"
}
```

---

## Business Rules

- Email harus terdaftar.
- Sistem mengirim tautan reset password.

---

# 12.6 Reset Password

## Endpoint

```
POST /auth/reset-password
```

---

## Request

```json
{
  "token": "...",
  "password": "PasswordBaru123!"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Business Rules

- Token valid.
- Password mengikuti Password Policy.

---

# 12.7 Magic Link Login

## Endpoint

```
POST /auth/magic-link
```

---

## Request

```json
{
  "email": "budi@example.com"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Magic link sent"
}
```

---

## Business Rules

- Email sudah terverifikasi.
- Token berlaku satu kali pakai.
- Token memiliki masa berlaku.

---

# 12.8 Login With Magic Link

## Endpoint

```
POST /auth/magic-link/verify
```

---

## Request

```json
{
  "token": "..."
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

# 12.9 Logout

## Endpoint

```
POST /auth/logout
```

---

## Authentication

Bearer Token

---

## Success Response

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Business Rules

- Refresh Token dicabut.
- Seluruh sesi aktif dapat diakhiri (opsional).

---

# 12.10 Get Current User

## Endpoint

```
GET /auth/me
```

---

## Authentication

Bearer Token

---

## Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Budi Santoso",
    "email": "budi@example.com",
    "role": "INTERN"
  }
}
```

---

## Business Rules

Mengembalikan informasi pengguna yang sedang login.

---

# End of Part 1

---

# PART 2

# 13. User Module

Base URL

```
/users
```

---

## 13.1 Get My Profile

### Endpoint

```
GET /users/profile
```

### Description

Mengambil informasi profil pengguna yang sedang login.

### Authentication

Bearer Token

### Required Role

- INTERN
- HR_ADMIN
- SUPERVISOR

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "08123456789",
    "role": "INTERN",
    "profilePhoto": "https://..."
  }
}
```

### Related Tables

- users
- user_profiles

### Audit Log

Tidak dicatat.

---

## 13.2 Update My Profile

### Endpoint

```
PATCH /users/profile
```

### Authentication

Bearer Token

### Required Role

- INTERN
- HR_ADMIN
- SUPERVISOR

### Request

```json
{
  "fullName": "Budi Santoso",
  "phone": "08123456789"
}
```

### Business Rules

- Email tidak dapat diubah.
- Role tidak dapat diubah.
- Nomor telepon harus unik.

### Related Tables

- user_profiles

### Audit Log

Profile Updated

---

## 13.3 Upload Profile Photo

### Endpoint

```
POST /users/profile/photo
```

### Content Type

```
multipart/form-data
```

### Request

```
photo
```

### Validation

- JPG
- JPEG
- PNG
- Maksimal 5 MB

### Business Rules

- Foto lama diganti.
- Metadata file diperbarui.

---

## 13.4 Change Password

### Endpoint

```
PATCH /users/change-password
```

### Request

```json
{
  "oldPassword": "Password123!",
  "newPassword": "PasswordBaru123!"
}
```

### Validation Rules

- Password lama harus benar.
- Password baru tidak boleh sama dengan password lama.
- Mengikuti Password Policy.

### Audit Log

Password Changed

---

# 14. Internship Application Module

Base URL

```
/applications
```

---

## 14.1 Create Internship Application

### Endpoint

```
POST /applications
```

### Authentication

Bearer Token

### Required Role

- INTERN

### Description

Mengajukan permohonan magang.

### Request

```json
{
  "fullName": "Budi Santoso",
  "studentId": "221401001",
  "institution": "Universitas ABC",
  "major": "Teknik Informatika",
  "phone": "08123456789",
  "skills": ["React", "Node.js"],
  "startDate": "2026-09-01",
  "endDate": "2026-12-01",
  "coverLetterFileId": "uuid"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Application submitted successfully."
}
```

### Validation Rules

- Start Date < End Date
- Durasi magang valid.
- Surat pengantar wajib.
- Profil wajib lengkap.

### Business Rules

- Satu user hanya boleh memiliki satu pengajuan aktif.
- Status awal = DRAFT.
- Setelah submit → SUBMITTED.

### Related Tables

- internship_applications
- files
- intern_profiles

### Audit Log

Application Submitted

### Notification

HR Admin menerima notifikasi.

### State Machine

Application State Machine

---

## 14.2 Get My Application

### Endpoint

```
GET /applications/me
```

### Authentication

Bearer Token

### Required Role

INTERN

### Description

Mengambil pengajuan milik sendiri.

---

## 14.3 Update Draft Application

### Endpoint

```
PATCH /applications/{applicationId}
```

### Path Parameter

```
applicationId
```

### Business Rules

- Hanya status DRAFT.
- Tidak bisa diedit setelah SUBMITTED.

---

## 14.4 Submit Application

### Endpoint

```
POST /applications/{applicationId}/submit
```

### Business Rules

- Semua field wajib lengkap.
- Surat pengantar wajib.
- Status berubah menjadi SUBMITTED.

---

## 14.5 Cancel Application

### Endpoint

```
POST /applications/{applicationId}/cancel
```

### Business Rules

- Tidak bisa dibatalkan setelah APPROVED.

---

## 14.6 Get All Applications

### Endpoint

```
GET /applications
```

### Authentication

Bearer Token

### Required Role

HR_ADMIN

### Query

```
?page=

&limit=

&status=

&keyword=

&institution=
```

### Business Rules

HR hanya dapat melihat seluruh pengajuan.

---

## 14.7 Get Application Detail

### Endpoint

```
GET /applications/{applicationId}
```

### Authentication

Bearer Token

### Required Role

HR_ADMIN

SUPERVISOR

---

## 14.8 Approve Application

### Endpoint

```
PATCH /applications/{applicationId}/approve
```

### Request

```json
{
  "departmentId": "uuid",
  "supervisorId": "uuid",
  "notes": "Selamat bergabung."
}
```

### Business Rules

- Hanya HR.
- Supervisor wajib dipilih.
- Department wajib dipilih.
- Internship otomatis dibuat.
- Onboarding otomatis dibuat.

### Related Tables

- internship_applications
- internships
- internship_assignments
- onboarding_sessions

### Audit Log

Application Approved

### Notification

Intern menerima notifikasi.

Supervisor menerima notifikasi.

---

## 14.9 Reject Application

### Endpoint

```
PATCH /applications/{applicationId}/reject
```

### Request

```json
{
  "reason": "Kuota penuh."
}
```

### Validation

Reason wajib diisi.

### Business Rules

Status berubah menjadi REJECTED.

### Notification

Intern menerima alasan penolakan.

---

## 14.10 Delete Draft Application

### Endpoint

```
DELETE /applications/{applicationId}
```

### Business Rules

- Hanya DRAFT.
- Soft Delete.

---

# 15. Internship Module

Base URL

```
/internships
```

---

## 15.1 Get My Internship

```
GET /internships/me
```

---

## 15.2 Get Internship Detail

```
GET /internships/{internshipId}
```

---

## 15.3 Start Internship

```
PATCH /internships/{internshipId}/start
```

### Business Rules

- Status APPROVED.
- Onboarding selesai.
- Tanggal mulai telah tiba.

Status berubah menjadi:

ACTIVE

---

## 15.4 Finish Internship

```
PATCH /internships/{internshipId}/finish
```

### Business Rules

- Seluruh periode selesai.
- Status menjadi COMPLETED.
- Certificate Engine dijalankan.

---

## 15.5 Extend Internship

```
PATCH /internships/{internshipId}/extend
```

### Request

```json
{
  "newEndDate": "2027-01-30",
  "reason": "Perpanjangan program."
}
```

### Required Role

HR_ADMIN

---

## 15.6 Assign Supervisor

```
PATCH /internships/{internshipId}/assign-supervisor
```

### Request

```json
{
  "supervisorId": "uuid"
}
```

### Business Rules

Supervisor aktif.

---

## 15.7 Change Department

```
PATCH /internships/{internshipId}/change-department
```

### Business Rules

Riwayat department tetap disimpan.

---

## 15.8 Archive Internship

```
PATCH /internships/{internshipId}/archive
```

### Business Rules

Hanya internship COMPLETED.

Status:

ARCHIVED

---

# End of Part 2

---

# PART 3

# 16. Attendance Module

Base URL

```
/attendance
```

Attendance Module digunakan untuk mencatat kehadiran peserta magang menggunakan validasi waktu dan geofence.

---

## 16.1 Check In

### Endpoint

```http
POST /attendance/check-in
```

### Authentication

Bearer Token

### Required Role

- INTERN

### Content-Type

```text
application/json
```

### Request Body

```json
{
  "latitude": -3.595196,
  "longitude": 98.672226,
  "accuracy": 12,
  "deviceId": "browser-device-id"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Check In berhasil.",
  "data": {
    "attendanceId": "uuid",
    "checkInTime": "2026-08-06T08:01:22Z",
    "status": "PRESENT"
  }
}
```

### Validation Rules

- Internship harus ACTIVE
- Onboarding selesai
- Belum Check In hari ini
- Jam absensi valid
- GPS tersedia
- Berada dalam radius kantor

### Business Rules

- Check In hanya satu kali per hari
- Attendance Log dibuat
- Audit Log dibuat

### Related Tables

- attendances
- attendance_logs
- office_locations

---

## 16.2 Check Out

### Endpoint

```http
POST /attendance/check-out
```

### Request

```json
{
  "latitude": -3.595196,
  "longitude": 98.672226,
  "accuracy": 10
}
```

### Business Rules

- Sudah Check In
- Belum Check Out
- Jam pulang valid

### Success Response

```json
{
  "success": true,
  "message": "Check Out berhasil."
}
```

---

## 16.3 Get My Attendance

```http
GET /attendance/me
```

Mengambil seluruh riwayat absensi milik pengguna.

### Query

```
?page=
&limit=
&month=
&year=
```

---

## 16.4 Attendance Detail

```http
GET /attendance/{attendanceId}
```

---

## 16.5 Get Today's Attendance

```http
GET /attendance/today
```

Mengambil absensi hari ini.

---

## 16.6 Attendance Summary

```http
GET /attendance/summary
```

Menghasilkan ringkasan:

- Hadir
- Terlambat
- Alpha
- Invalid

---

## 16.7 Supervisor Attendance Dashboard

```http
GET /attendance/supervisor
```

### Required Role

SUPERVISOR

Menampilkan peserta pada departemen supervisor.

---

## 16.8 Override Attendance

```http
PATCH /attendance/{attendanceId}/override
```

### Required Role

SUPERVISOR

### Request

```json
{
  "status": "INVALID",
  "reason": "Fake GPS"
}
```

### Business Rules

- Supervisor hanya boleh override peserta departemennya.
- Semua perubahan dicatat pada Audit Log.

---

## 16.9 Get Attendance History

```http
GET /attendance/history
```

Riwayat absensi lengkap.

---

## 16.10 Export Attendance

```http
GET /attendance/export
```

### Required Role

HR_ADMIN

### Query

```
departmentId

month

year

format=xlsx
```

Menghasilkan file Excel.

---

# 17. Certificate Module

Base URL

```
/certificates
```

---

## 17.1 Get My Certificate

```http
GET /certificates/me
```

Mengambil sertifikat milik peserta.

---

## 17.2 Download Certificate

```http
GET /certificates/{certificateId}/download
```

### Business Rules

- Internship selesai.
- Certificate Generated.

---

## 17.3 Certificate Detail

```http
GET /certificates/{certificateId}
```

---

## 17.4 Generate Certificate

```http
POST /certificates/generate
```

### Required Role

HR_ADMIN

### Request

```json
{
  "internshipId": "uuid"
}
```

### Business Rules

- Internship Completed
- Belum memiliki Certificate

---

## 17.5 Verify Certificate

```http
GET /certificates/verify/{verificationCode}
```

Public Endpoint.

Mengembalikan status sertifikat.

---

## 17.6 Regenerate Certificate

```http
POST /certificates/{certificateId}/regenerate
```

### Required Role

HR_ADMIN

Digunakan jika template berubah.

---

# 18. Notification Module

Base URL

```
/notifications
```

---

## 18.1 Get Notifications

```http
GET /notifications
```

### Query

```
?page=
&limit=
```

---

## 18.2 Get Notification Detail

```http
GET /notifications/{notificationId}
```

---

## 18.3 Mark As Read

```http
PATCH /notifications/{notificationId}/read
```

---

## 18.4 Mark All As Read

```http
PATCH /notifications/read-all
```

---

## 18.5 Delete Notification

```http
DELETE /notifications/{notificationId}
```

Soft Delete.

---

## 18.6 Notification Count

```http
GET /notifications/unread-count
```

Menghasilkan:

```json
{
  "count": 5
}
```

---

## 18.7 Send Notification

```http
POST /notifications/send
```

### Required Role

HR_ADMIN

Future Enhancement.

---

# 19. Dashboard Module

Dashboard berbeda untuk setiap Role.

Base URL

```
/dashboard
```

---

## 19.1 Intern Dashboard

```http
GET /intern/dashboard
```

Data:

- Internship
- Attendance Hari Ini
- Notification
- Certificate

---

## 19.2 HR Dashboard

```http
GET /hr-admin/dashboard
```

Data:

- Pending Application
- Active Internship
- Attendance Hari Ini
- Certificate Generated
- Total Supervisor

---

## 19.3 Supervisor Dashboard

```http
GET /supervisor/dashboard
```

Data:

- Peserta Departemen
- Belum Absen
- Hadir
- Invalid Attendance

---

## 19.4 Dashboard Statistics

```http
GET /hr-admin/dashboard/statistics
```

### Required Role

HR_ADMIN

Menghasilkan statistik sistem.

---

## 19.5 Dashboard Chart

```http
GET /hr-admin/dashboard/charts
```

Menghasilkan data grafik.

Contoh:

- Attendance Trend
- Internship Trend
- Department Distribution

---

## 19.6 Recent Activities

```http
GET /hr-admin/dashboard/recent-activities
```

Mengambil Activity Log terbaru.

---

# 20. API Security Requirement

Seluruh endpoint Attendance wajib:

- JWT
- GPS
- HTTPS

---

Seluruh endpoint HR wajib:

- JWT
- HR Role

---

Seluruh endpoint Supervisor wajib:

- JWT
- Supervisor Role

---

Seluruh endpoint Public:

- Tanpa JWT

---

# 21. Business Validation Matrix

| Module       | Validation            |
| ------------ | --------------------- |
| Attendance   | Time + GPS + Geofence |
| Certificate  | Internship Completed  |
| Notification | User Exists           |
| Dashboard    | Role Based            |

---

# End of Part 3

# PART 4

# 22. Department Module

Base URL

```
/departments
```

Department digunakan sebagai master data unit kerja tempat peserta magang ditempatkan.

---

## 22.1 Get All Departments

### Endpoint

```http
GET /departments
```

### Authentication

Bearer Token

### Required Role

- HR_ADMIN
- SUPERVISOR

### Query

```
?page=
&limit=
&keyword=
&status=
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Teknologi Informasi",
      "code": "IT",
      "status": "ACTIVE"
    }
  ]
}
```

---

## 22.2 Department Detail

```http
GET /departments/{departmentId}
```

---

## 22.3 Create Department

```http
POST /departments
```

### Required Role

HR_ADMIN

### Request

```json
{
  "code": "IT",
  "name": "Teknologi Informasi",
  "description": "Divisi Teknologi Informasi"
}
```

---

## 22.4 Update Department

```http
PATCH /departments/{departmentId}
```

---

## 22.5 Delete Department

```http
DELETE /departments/{departmentId}
```

Soft Delete.

---

# 23. Office Module

Base URL

```
/offices
```

Digunakan untuk menyimpan lokasi kantor yang digunakan sebagai geofence.

---

## 23.1 Get Offices

```http
GET /offices
```

---

## 23.2 Office Detail

```http
GET /offices/{officeId}
```

---

## 23.3 Create Office

```http
POST /offices
```

### Request

```json
{
  "name": "PLN UP3 Medan",
  "latitude": 3.595196,
  "longitude": 98.672226,
  "radius": 150
}
```

---

## 23.4 Update Office

```http
PATCH /offices/{officeId}
```

---

## 23.5 Delete Office

```http
DELETE /offices/{officeId}
```

---

# 24. Supervisor Module

Base URL

```
/supervisors
```

---

## 24.1 Get Supervisors

```http
GET /supervisors
```

---

## 24.2 Supervisor Detail

```http
GET /supervisors/{supervisorId}
```

---

## 24.3 Assign Intern

```http
POST /supervisors/{supervisorId}/assign
```

### Request

```json
{
  "internshipId": "uuid"
}
```

---

## 24.4 Remove Assignment

```http
DELETE /supervisors/{supervisorId}/assignments/{assignmentId}
```

---

## 24.5 Supervisor Dashboard Summary

```http
GET /supervisors/dashboard
```

---

# 25. File Module

Base URL

```
/files
```

---

## 25.1 Upload File

```http
POST /files/upload
```

### Content-Type

```
multipart/form-data
```

### Validation

- PDF
- JPG
- JPEG
- PNG

Maksimal 5 MB.

---

## 25.2 File Detail

```http
GET /files/{fileId}
```

---

## 25.3 Delete File

```http
DELETE /files/{fileId}
```

Soft Delete.

---

# 26. Reporting Module

Base URL

```
/reports
```

---

## 26.1 Attendance Report

```http
GET /reports/attendance
```

### Query

```
departmentId

month

year

format=xlsx
```

---

## 26.2 Internship Report

```http
GET /reports/internships
```

---

## 26.3 Certificate Report

```http
GET /reports/certificates
```

---

## 26.4 Dashboard Report

```http
GET /reports/dashboard
```

---

# 27. Audit Log Module

Base URL

```
/audit-logs
```

---

## 27.1 Get Audit Logs

```http
GET /audit-logs
```

### Required Role

HR_ADMIN

---

## 27.2 Audit Detail

```http
GET /audit-logs/{auditId}
```

---

## 27.3 User Activity

```http
GET /audit-logs/users/{userId}
```

---

# 28. Rate Limiting

Default Rate Limit

| Endpoint        | Limit                |
| --------------- | -------------------- |
| Login           | 5 / menit            |
| Forgot Password | 3 / jam              |
| Magic Link      | 5 / jam              |
| Register        | 10 / jam             |
| Attendance      | 1 request / 10 detik |
| Upload          | 10 / menit           |

---

# 29. Idempotency Rules

Endpoint berikut wajib bersifat idempotent.

- Check In
- Check Out
- Approve Application
- Reject Application
- Finish Internship
- Generate Certificate

Jika request yang sama dikirim dua kali, sistem tidak boleh menghasilkan data ganda.

---

# 30. API Security Standards

Seluruh endpoint wajib:

- HTTPS
- JWT Authentication (kecuali endpoint publik)
- Input Validation
- Output Sanitization
- SQL Injection Protection
- XSS Protection
- CSRF Protection (untuk cookie-based auth)
- CORS Configuration

---

# 31. Standard Headers

Request

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Response

```http
Content-Type: application/json
```

---

# 32. Error Code Catalog

| Code     | Description                  |
| -------- | ---------------------------- |
| AUTH_001 | Invalid Credential           |
| AUTH_002 | Token Expired                |
| AUTH_003 | Email Not Verified           |
| USER_001 | User Not Found               |
| APP_001  | Application Already Exists   |
| APP_002  | Application Already Approved |
| ATT_001  | Check In Window Closed       |
| ATT_002  | Outside Office Radius        |
| ATT_003  | Already Checked In           |
| ATT_004  | Already Checked Out          |
| CERT_001 | Certificate Not Available    |
| FILE_001 | Invalid File Type            |
| FILE_002 | File Too Large               |

---

# 33. API Checklist

Seluruh endpoint wajib memenuhi standar berikut.

- Menggunakan HTTPS.
- Menggunakan JSON.
- Seluruh Endpoint Menggunakan x-internal-api-key
- Memiliki autentikasi sesuai kebutuhan.
- Memiliki validasi input.
- Menggunakan HTTP Status Code yang sesuai.
- Mendukung Audit Log jika diperlukan.
- Mendukung Soft Delete jika relevan.
- Mendukung Pagination pada endpoint list.
- Mendukung Filtering jika diperlukan.
- Mendukung Sorting jika diperlukan.

---

# 34. API Endpoint Summary

| Module                 |  Total Endpoint |
| ---------------------- | --------------: |
| Authentication         |              10 |
| User                   |               4 |
| Internship Application |              10 |
| Internship             |               8 |
| Attendance             |              10 |
| Certificate            |               6 |
| Notification           |               7 |
| Dashboard              |               6 |
| Department             |               5 |
| Office                 |               5 |
| Supervisor             |               5 |
| File                   |               3 |
| Reporting              |               4 |
| Audit Log              |               3 |
| **Total**              | **86 Endpoint** |

---

# 35. Final Summary

API SIMAD menggunakan arsitektur REST API dengan format JSON dan versioning `/api/v1`.

Seluruh endpoint dirancang mengikuti prinsip:

- RESTful Resource Naming
- Layered Architecture
- Role-Based Access Control (RBAC)
- JWT Authentication
- Consistent Response Format
- Soft Delete
- Audit Logging
- Pagination, Filtering, dan Sorting

Dokumen ini menjadi acuan implementasi Backend, Frontend, Mobile Application, QA, serta dokumentasi OpenAPI/Swagger.

---

# End of Document
