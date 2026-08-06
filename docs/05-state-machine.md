# 05-state-machine.md

> Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD)
>
> Version : 1.0
>
> Status : Draft
>
> Document Owner : Product Team
>
> Last Updated : 2026

---

# PART 1

# 1. Introduction

## 1.1 Purpose

Dokumen ini mendefinisikan seluruh **State Machine** yang digunakan pada Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD).

State Machine bertujuan untuk memastikan bahwa setiap perubahan status pada sistem:

- Memiliki alur yang jelas.
- Tidak dapat melompat ke status yang tidak valid.
- Dapat diaudit.
- Konsisten pada Backend maupun Frontend.
- Menjadi acuan implementasi Business Logic.

Dokumen ini menjadi referensi utama bagi:

- Backend Developer
- Frontend Developer
- QA Engineer
- Product Owner
- System Analyst

---

## 1.2 Scope

State Machine diterapkan pada modul berikut:

- Authentication
- User Account
- Internship Application
- Internship
- Onboarding
- Attendance
- Certificate
- Notification
- File Upload

---

## 1.3 Objectives

State Machine digunakan untuk:

- Menghindari perubahan status yang tidak valid.
- Menentukan transisi yang diperbolehkan.
- Menentukan Actor yang boleh melakukan transisi.
- Menentukan Trigger dari setiap perubahan status.
- Menentukan Side Effect setelah transisi berhasil.

---

# 2. Terminology

| Istilah       | Definisi                                                   |
| ------------- | ---------------------------------------------------------- |
| State         | Kondisi suatu data pada waktu tertentu.                    |
| Transition    | Perubahan dari satu state ke state lainnya.                |
| Trigger       | Peristiwa yang menyebabkan perubahan state.                |
| Actor         | Pengguna atau sistem yang melakukan perubahan state.       |
| Validation    | Aturan yang harus dipenuhi sebelum transisi dilakukan.     |
| Side Effect   | Proses tambahan yang dijalankan setelah transisi berhasil. |
| Initial State | State awal ketika data dibuat.                             |
| Final State   | State terakhir yang tidak memiliki transisi lanjutan.      |

---

# 3. State Machine Principles

Seluruh State Machine pada SIMAD mengikuti prinsip berikut.

---

## SM-PRINCIPLE-001

Setiap Entity hanya memiliki satu State aktif.

---

## SM-PRINCIPLE-002

State hanya dapat berubah melalui Backend.

Frontend tidak diperbolehkan mengubah status secara langsung.

---

## SM-PRINCIPLE-003

Perubahan status wajib melalui proses validasi.

Apabila validasi gagal, transisi dibatalkan.

---

## SM-PRINCIPLE-004

Setiap transisi wajib menghasilkan Audit Log.

---

## SM-PRINCIPLE-005

State sebelumnya tidak boleh dihapus.

Riwayat perubahan disimpan pada tabel History.

---

## SM-PRINCIPLE-006

State yang telah mencapai Final State tidak dapat diubah kembali.

Kecuali terdapat Business Rule yang secara eksplisit memperbolehkannya.

---

## SM-PRINCIPLE-007

Semua transisi harus bersifat Atomic Transaction.

Apabila salah satu proses gagal, seluruh perubahan harus dibatalkan (Rollback).

---

## SM-PRINCIPLE-008

Setiap transisi harus memiliki:

- Trigger
- Actor
- Validation
- Side Effect

---

# 4. Global State Rules

Seluruh State Machine pada SIMAD mengikuti aturan umum berikut.

---

## SM-GLOBAL-001

Status tidak boleh diubah langsung melalui Database.

---

## SM-GLOBAL-002

Status tidak boleh diubah melalui Frontend.

---

## SM-GLOBAL-003

Perubahan status hanya dilakukan melalui Service Layer.

---

## SM-GLOBAL-004

Semua perubahan status harus tercatat pada:

- Audit Log
- Status History (jika tersedia)

---

## SM-GLOBAL-005

Apabila terjadi kegagalan pada proses transisi, status harus kembali ke kondisi sebelumnya.

---

## SM-GLOBAL-006

Side Effect hanya dijalankan apabila transisi berhasil.

---

## SM-GLOBAL-007

State Machine harus bersifat deterministic.

Input yang sama harus menghasilkan state yang sama.

---

# 5. Authentication State Machine

Authentication mengatur siklus hidup autentikasi pengguna.

---

## Authentication Flow

```text
Unregistered
        │
        ▼
Registered
        │
        ▼
Email Verification Pending
        │
        ▼
Verified
        │
        ▼
Authenticated
        │
        ▼
Session Expired
        │
        ▼
Authenticated
```

---

## State : Unregistered

### Description

Pengguna belum memiliki akun.

---

### Allowed Next State

- Registered

---

### Trigger

Register Account

---

### Actor

Guest

---

### Validation

- Email belum digunakan.
- Password valid.
- Data registrasi lengkap.

---

### Side Effect

- Membuat User.
- Mengirim Email Verifikasi.
- Membuat Audit Log.

---

## State : Registered

### Description

Akun berhasil dibuat tetapi belum aktif.

---

### Allowed Next State

- Email Verification Pending

---

### Trigger

Account Created

---

### Actor

System

---

### Side Effect

- Generate Verification Token.
- Kirim Email.

---

## State : Email Verification Pending

### Description

Pengguna harus melakukan verifikasi email.

---

### Allowed Next State

- Verified

---

### Trigger

Verify Email

---

### Actor

User

---

### Validation

- Verification Token valid.
- Token belum kedaluwarsa.

---

### Side Effect

- Mengaktifkan akun.
- Menghapus Verification Token.
- Membuat Audit Log.

---

## State : Verified

### Description

Akun siap digunakan.

---

### Allowed Next State

- Authenticated

---

### Trigger

Login

---

### Validation

- Password benar.
- Akun aktif.
- Email terverifikasi.

---

### Side Effect

- Generate JWT.
- Generate Refresh Token.
- Membuat Login Log.

---

## State : Authenticated

### Description

Pengguna berhasil login.

---

### Allowed Next State

- Session Expired

---

### Trigger

Logout

atau

Token Expired

---

### Side Effect

- Revoke Refresh Token.
- Update Login History.

---

## State : Session Expired

### Description

Access Token telah habis masa berlaku.

---

### Allowed Next State

- Authenticated

---

### Trigger

Refresh Token

---

### Validation

- Refresh Token valid.
- Belum dicabut.
- Belum kedaluwarsa.

---

### Side Effect

- Generate Access Token baru.

---

# 6. User Account State Machine

State Machine ini mengatur status akun pengguna.

---

## User Account Flow

```text
Active
    │
    ├──────────────► Suspended
    │                    │
    │                    ▼
    │                 Active
    │
    ▼
Deactivated
```

---

## State : Active

### Description

Akun aktif dan dapat digunakan.

---

### Allowed Next State

- Suspended
- Deactivated

---

### Trigger

Suspend Account

atau

Deactivate Account

---

### Actor

HR
Administrator

---

## Validation

- User ditemukan.
- User masih aktif.

---

### Side Effect

- Logout seluruh perangkat.
- Cabut Refresh Token.
- Audit Log.

---

## State : Suspended

### Description

Akun dinonaktifkan sementara.

---

### Allowed Next State

- Active

---

### Trigger

Activate Account

---

### Actor

Administrator

---

### Side Effect

- Mengaktifkan akun kembali.
- Audit Log.

---

## State : Deactivated

### Description

Akun dinonaktifkan permanen.

---

### Allowed Next State

Tidak ada.

Final State.

---

### Trigger

Deactivate User

---

### Actor

Administrator

---

### Side Effect

- Cabut seluruh Session.
- Nonaktifkan Login.
- Audit Log.

---

# 7. State Machine Design Rules

Setiap State Machine pada SIMAD wajib memiliki:

- Initial State
- Transition
- Validation
- Actor
- Trigger
- Side Effect
- Final State

---

Setiap perubahan status harus:

1. Lolos Validasi.
2. Disimpan ke Database.
3. Dicatat pada History.
4. Dicatat pada Audit Log.
5. Menjalankan Side Effect.
6. Mengembalikan Response kepada Client.

---

# End of Part 1

---

# PART 2

# 8. Internship Application State Machine

State Machine ini mengatur seluruh siklus hidup pengajuan magang mulai dari pembuatan draft hingga arsip.

---

## Internship Application Flow

```text
Draft
   │
   ▼
Submitted
   │
   ▼
Under Review
   ├──────────────► Rejected
   │                    │
   │                    ▼
   │                Resubmitted
   │                    │
   └────────────────────┘
   │
   ▼
Approved
   │
   ▼
Internship Created
```

---

## State : Draft

### Description

Pengguna sedang mengisi formulir pengajuan magang.

Data masih dapat diubah.

---

### Allowed Previous State

- Initial State

---

### Allowed Next State

- Submitted

---

### Trigger

Submit Internship Application

---

### Actor

Intern

---

### Validation

- Profil lengkap.
- Email telah diverifikasi.
- Surat pengantar telah diunggah.
- Tanggal magang valid.

---

### Side Effects

- Generate Application Number.
- Simpan data pengajuan.
- Audit Log.

---

### Failure Handling

Tetap berada pada state Draft.

---

## State : Submitted

### Description

Pengajuan telah dikirim dan menunggu pemeriksaan HR.

---

### Allowed Previous State

- Draft
- Resubmitted

---

### Allowed Next State

- Under Review

---

### Trigger

HR Opens Application

---

### Actor

System

---

### Side Effects

- Notification ke HR.
- Activity Log.

---

## State : Under Review

### Description

HR sedang melakukan pemeriksaan administrasi.

---

### Allowed Previous State

- Submitted

---

### Allowed Next State

- Approved
- Rejected

---

### Trigger

Review Application

---

### Actor

HR

---

### Validation

HR memverifikasi:

- Surat Pengantar
- Profil
- Durasi Magang
- Kelengkapan Dokumen

---

### Side Effects

Audit Log.

---

## State : Approved

### Description

Pengajuan diterima.

---

### Allowed Previous State

- Under Review

---

### Allowed Next State

- Internship Created

---

### Trigger

Approve Application

---

### Actor

HR

---

### Validation

HR wajib menentukan:

- Department
- Supervisor
- Office Location

---

### Side Effects

- Notification
- Email
- Audit Log

---

## State : Rejected

### Description

Pengajuan ditolak.

---

### Allowed Previous State

- Under Review

---

### Allowed Next State

- Resubmitted

---

### Trigger

Reject Application

---

### Actor

HR

---

### Validation

Alasan penolakan wajib diisi.

---

### Side Effects

- Notification
- Email
- Audit Log

---

## State : Resubmitted

### Description

Peserta memperbaiki pengajuan berdasarkan catatan HR.

---

### Allowed Previous State

- Rejected

---

### Allowed Next State

- Submitted

---

### Trigger

Submit Again

---

### Actor

Intern

---

### Validation

Perbaikan telah dilakukan.

---

### Side Effects

Audit Log.

---

## State : Internship Created

### Description

Record Internship berhasil dibuat.

---

### Allowed Previous State

- Approved

---

### Allowed Next State

- Onboarding Pending

---

### Trigger

Create Internship

---

### Actor

System

---

### Side Effects

- Membuat Internship.
- Membuat Supervisor Assignment.
- Membuat Notification.

---

# 9. Internship Lifecycle State Machine

State Machine ini mengatur siklus hidup peserta selama masa magang.

---

## Internship Lifecycle Flow

```text
Onboarding Pending
        │
        ▼
Onboarding Completed
        │
        ▼
Active Internship
        │
        ▼
Completed
        │
        ▼
Certificate Generated
        │
        ▼
Archived
```

---

## State : Onboarding Pending

### Description

Peserta telah diterima tetapi belum menyelesaikan onboarding.

---

### Allowed Previous State

- Internship Created

---

### Allowed Next State

- Onboarding Completed

---

### Trigger

Open Onboarding Page

---

### Actor

Intern

---

### Validation

Status Application = Approved.

---

### Side Effects

Membuat histori onboarding.

---

## State : Onboarding Completed

### Description

Peserta telah menyetujui seluruh tata tertib.

---

### Allowed Previous State

- Onboarding Pending

---

### Allowed Next State

- Active Internship

---

### Trigger

Accept Onboarding

---

### Actor

Intern

---

### Validation

- Seluruh materi telah dibaca.
- Persetujuan digital diberikan.

---

### Side Effects

- Simpan waktu persetujuan.
- Simpan IP Address.
- Audit Log.

---

## State : Active Internship

### Description

Peserta resmi menjalani magang.

---

### Allowed Previous State

- Onboarding Completed

---

### Allowed Next State

- Completed

---

### Trigger

Internship Start Date Reached

---

### Actor

System

---

### Side Effects

- Mengaktifkan fitur absensi.
- Notification.

---

## State : Completed

### Description

Periode magang telah selesai.

---

### Allowed Previous State

- Active Internship

---

### Allowed Next State

- Certificate Generated

---

### Trigger

Internship End Date Reached

---

### Actor

System

---

### Validation

Current Date >= End Date.

---

### Side Effects

- Menonaktifkan absensi.
- Notification.
- Audit Log.

---

## State : Certificate Generated

### Description

Sertifikat berhasil dibuat.

---

### Allowed Previous State

- Completed

---

### Allowed Next State

- Archived

---

### Trigger

Generate Certificate

---

### Actor

System

---

### Side Effects

- Generate PDF.
- Generate QR Verification.
- Notification.
- Audit Log.

---

## State : Archived

### Description

Data magang dipindahkan ke arsip.

---

### Allowed Previous State

- Certificate Generated

---

### Allowed Next State

Tidak ada.

Final State.

---

### Trigger

Archive Internship

---

### Actor

System

---

### Side Effects

- Lock seluruh data transaksi.
- Data hanya dapat dibaca.

---

# 10. Supervisor Assignment State Machine

State Machine ini mengatur proses penugasan supervisor.

---

## Supervisor Assignment Flow

```text
Unassigned
      │
      ▼
Assigned
      │
      ▼
Reassigned
      │
      ▼
Ended
```

---

## State : Unassigned

### Description

Peserta belum memiliki supervisor.

---

### Allowed Next State

- Assigned

---

### Trigger

Assign Supervisor

---

### Actor

HR

---

### Validation

Supervisor harus aktif.

---

### Side Effects

Notification ke Supervisor.

---

## State : Assigned

### Description

Supervisor aktif membimbing peserta.

---

### Allowed Next State

- Reassigned
- Ended

---

### Trigger

Change Supervisor

atau

Finish Internship

---

### Actor

HR

---

### Side Effects

Audit Log.

---

## State : Reassigned

### Description

Supervisor diganti.

---

### Allowed Next State

- Assigned

---

### Trigger

Assign New Supervisor

---

### Actor

HR

---

### Side Effects

- Tutup assignment lama.
- Buat assignment baru.
- Notification.

---

## State : Ended

### Description

Hubungan pembimbing selesai.

Final State.

---

# 11. Department Assignment State Machine

Department Assignment menentukan unit kerja peserta.

---

## Flow

```text
Pending
    │
    ▼
Assigned
    │
    ▼
Transferred
    │
    ▼
Finished
```

---

## Rules

### Pending

- Menunggu penempatan.

---

### Assigned

- Peserta aktif pada Department tertentu.

---

### Transferred

- HR memindahkan peserta ke Department lain.
- Histori wajib disimpan.

---

### Finished

- Penempatan selesai karena masa magang berakhir.

---

# 12. Transition Summary

| Module                 | Initial State      | Final State        |
| ---------------------- | ------------------ | ------------------ |
| Internship Application | Draft              | Internship Created |
| Internship Lifecycle   | Onboarding Pending | Archived           |
| Supervisor Assignment  | Unassigned         | Ended              |
| Department Assignment  | Pending            | Finished           |

---

# End of Part 2

---

# PART 3

# 13. Attendance State Machine

State Machine ini mengatur seluruh proses absensi peserta magang.

Seluruh proses validasi dilakukan pada Backend.

---

## Attendance Workflow

```text
Waiting Check In
        │
        ▼
Check In Requested
        │
        ▼
Location Validation
        │
        ▼
Attendance Validation
        │
        ▼
Attendance Recorded
        │
        ▼
Waiting Check Out
        │
        ▼
Check Out Requested
        │
        ▼
Attendance Completed
```

---

# 14. Check In State Machine

## Flow

```text
Idle
 │
 ▼
Request Received
 │
 ▼
Validate Time
 │
 ▼
Validate GPS
 │
 ▼
Validate Geofence
 │
 ▼
Save Attendance
 │
 ▼
Success
```

---

## State : Idle

### Description

Peserta belum melakukan Check In.

---

### Allowed Next State

- Request Received

---

### Trigger

Klik tombol Check In.

---

### Actor

Intern

---

### Validation

- Internship Active
- Onboarding Completed
- Belum Check In Hari Ini

---

### Side Effects

Mengirim koordinat GPS ke Backend.

---

## State : Request Received

### Description

Backend menerima permintaan absensi.

---

### Allowed Next State

- Validate Time

---

### Trigger

HTTP Request diterima.

---

### Side Effects

Membuat Request Log.

---

## State : Validate Time

### Description

Backend memeriksa apakah waktu absensi berada pada jam yang diizinkan.

---

### Allowed Next State

- Validate GPS
- Rejected

---

### Validation

Contoh:

Senin–Kamis

08.00–10.00 WIB

Jumat

07.30–10.00 WIB

---

### Failure Handling

Return:

```
Attendance Window Closed
```

---

## State : Validate GPS

### Description

Backend memvalidasi koordinat GPS.

---

### Allowed Next State

- Validate Geofence
- Rejected

---

### Validation

- Latitude tersedia
- Longitude tersedia
- Accuracy memenuhi batas minimum

---

### Side Effects

Hitung Accuracy.

---

## State : Validate Geofence

### Description

Backend menghitung jarak pengguna terhadap lokasi kantor.

---

### Allowed Next State

- Save Attendance
- Rejected

---

### Validation

Menggunakan:

Haversine Formula

---

### Side Effects

Hitung Distance Meter.

---

## State : Save Attendance

### Description

Menyimpan data absensi.

---

### Allowed Next State

- Success

---

### Side Effects

- Attendance
- Attendance Log
- Activity Log

---

## State : Success

### Description

Check In berhasil.

---

### Final State

Ya.

---

# 15. Check Out State Machine

## Flow

```text
Waiting
   │
   ▼
Request
   │
   ▼
Validate Time
   │
   ▼
Validate Attendance
   │
   ▼
Save Check Out
   │
   ▼
Completed
```

---

## Validation

Backend wajib memastikan:

- Sudah Check In
- Belum Check Out
- Waktu valid

---

## Side Effects

- Hitung Total Jam Kerja
- Update Attendance
- Activity Log

---

# 16. Geofence Validation State Machine

## Flow

```text
Receive Coordinate
        │
        ▼
Calculate Distance
        │
        ▼
Inside Radius?
      │
  ┌───┴────┐
 YES      NO
 │          │
 ▼          ▼
PASS     REJECT
```

---

## Validation

Menggunakan:

Haversine Formula

---

## Rules

Radius diperoleh dari:

Office Location

---

Apabila:

Distance <= Radius

↓

PASS

---

Apabila:

Distance > Radius

↓

REJECT

---

# 17. GPS Validation State Machine

GPS Validation memastikan koordinat yang diterima layak digunakan.

---

## Flow

```text
Coordinate Received
        │
        ▼
Accuracy Validation
        │
        ▼
Coordinate Valid
```

---

## Validation

Backend memeriksa:

- Latitude
- Longitude
- Accuracy
- Timestamp

---

Apabila salah satu tidak valid

↓

Reject Attendance

---

# 18. Attendance Result State Machine

Setelah seluruh validasi berhasil.

---

## Flow

```text
Attendance Saved
      │
      ▼
Present
      │
      ▼
Completed
```

---

Kemungkinan hasil:

- Present
- Late
- Pending Review
- Invalid
- Absent

---

# 19. Attendance Override State Machine

Supervisor dapat mengubah status absensi.

---

## Flow

```text
Present
   │
   ▼
Review
   │
   ▼
Override
   │
   ▼
Invalid
```

---

## Trigger

Supervisor menekan tombol:

Override Attendance

---

## Validation

Supervisor harus berasal dari Department yang sama.

---

## Side Effects

- Audit Log
- Attendance Override History
- Notification

---

# 20. Attendance Violation State Machine

Digunakan untuk investigasi pelanggaran.

---

## Flow

```text
Violation Detected
        │
        ▼
Pending Investigation
        │
        ▼
Supervisor Review
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Valid    Invalid
```

---

## Violation Type

- Fake GPS
- Outside Geofence
- Multiple Device
- Multiple Login
- Late
- Early Check Out

---

## Side Effects

- Notification HR
- Notification Supervisor
- Audit Log

---

# 21. Attendance Transition Matrix

| Current State         | Event            | Next State            |
| --------------------- | ---------------- | --------------------- |
| Waiting Check In      | Submit Check In  | Check In Requested    |
| Check In Requested    | Time Valid       | Location Validation   |
| Location Validation   | GPS Valid        | Attendance Validation |
| Attendance Validation | Valid            | Attendance Recorded   |
| Attendance Recorded   | Check Out Time   | Waiting Check Out     |
| Waiting Check Out     | Submit Check Out | Check Out Requested   |
| Check Out Requested   | Valid            | Attendance Completed  |

---

# 22. Attendance Failure Matrix

| Validation            | Result            |
| --------------------- | ----------------- |
| Outside Geofence      | Reject Attendance |
| Invalid GPS           | Reject Attendance |
| Check In Twice        | Reject Attendance |
| Check Out Twice       | Reject Attendance |
| Attendance Closed     | Reject Attendance |
| Internship Not Active | Reject Attendance |
| Onboarding Incomplete | Reject Attendance |

---

# End of Part 3

---

# PART 4

# 23. Certificate State Machine

State Machine ini mengatur seluruh siklus hidup sertifikat magang.

---

## Certificate Flow

```text
Waiting
    │
    ▼
Eligible
    │
    ▼
Generating
    │
    ▼
Generated
    │
    ▼
Available
    │
    ▼
Downloaded
```

---

## State : Waiting

### Description

Peserta belum memenuhi syarat memperoleh sertifikat.

---

### Allowed Previous State

- Initial State

---

### Allowed Next State

- Eligible

---

### Trigger

Internship Completed

---

### Actor

System

---

## State : Eligible

### Description

Peserta memenuhi seluruh persyaratan.

---

### Validation

- Internship Status = Completed
- Current Date >= End Date

---

### Allowed Next State

- Generating

---

### Side Effects

Menambahkan antrean pembuatan sertifikat.

---

## State : Generating

### Description

Backend sedang menghasilkan dokumen PDF.

---

### Allowed Next State

- Generated

---

### Side Effects

- Render Template
- Generate QR Code
- Generate Verification Token
- Simpan PDF

---

## State : Generated

### Description

PDF berhasil dibuat.

---

### Allowed Next State

- Available

---

### Side Effects

- Simpan metadata sertifikat
- Audit Log
- Notification

---

## State : Available

### Description

Peserta dapat mengunduh sertifikat.

---

### Allowed Next State

- Downloaded

---

### Trigger

Download Certificate

---

### Actor

Intern

---

### Side Effects

- Activity Log
- Update Download Counter (Future Enhancement)

---

## State : Downloaded

### Description

Peserta telah mengunduh sertifikat.

Final State.

---

# 24. Notification State Machine

Notification digunakan sebagai media komunikasi sistem.

---

## Notification Flow

```text
Created
    │
    ▼
Queued
    │
    ▼
Delivered
    │
    ▼
Read
```

---

## State : Created

Notification berhasil dibuat.

---

## State : Queued

Notification masuk ke proses pengiriman.

---

## State : Delivered

Notification berhasil diterima pengguna.

---

## State : Read

Pengguna membuka notification.

Final State.

---

### Side Effects

- Update Read Time
- Activity Log

---

# 25. File Upload State Machine

State Machine ini mengatur proses upload dokumen.

---

## File Upload Flow

```text
Selected
    │
    ▼
Uploading
    │
    ▼
Scanning
    │
    ▼
Stored
    │
    ▼
Linked
```

---

## Selected

User memilih file.

---

## Uploading

File sedang dikirim.

---

## Scanning

Backend memvalidasi:

- MIME Type
- File Size
- Ekstensi

Future Enhancement:

- Antivirus Scan

---

## Stored

File berhasil disimpan.

---

## Linked

File berhasil dihubungkan ke Entity.

Contoh:

- Internship Application
- Certificate
- Attendance Photo

---

# 26. Audit Log State Machine

Audit Log bersifat immutable.

---

## Flow

```text
Action Triggered
        │
        ▼
Collect Metadata
        │
        ▼
Store Audit Log
```

---

Metadata minimum:

- User
- Module
- Action
- Record ID
- Timestamp
- IP Address
- User Agent

---

Audit Log tidak memiliki proses Update maupun Delete.

---

# 27. Error State Machine

Setiap error mengikuti alur berikut.

```text
Request
    │
    ▼
Validation
    │
 ┌──┴───────┐
 │          │
 ▼          ▼
Success   Failed
               │
               ▼
Generate Error
               │
               ▼
Return Response
```

---

Kategori Error

- Validation Error (400)
- Unauthorized (401)
- Forbidden (403)
- Not Found (404)
- Conflict (409)
- Internal Server Error (500)

---

# 28. Cross Module State Dependencies

Hubungan antar modul.

---

## Authentication

```text
Authenticated

↓

Intern Profile
```

---

## Internship

```text
Approved

↓

Internship Created
```

---

## Onboarding

```text
Completed

↓

Attendance Enabled
```

---

## Attendance

```text
Completed

↓

Certificate Eligibility
```

---

## Certificate

```text
Generated

↓

Notification
```

---

## Notification

```text
Delivered

↓

Read
```

---

# 29. Complete System Transition Matrix

| Module                 | Initial State      | Final State          |
| ---------------------- | ------------------ | -------------------- |
| Authentication         | Unregistered       | Authenticated        |
| User Account           | Active             | Deactivated          |
| Internship Application | Draft              | Internship Created   |
| Internship             | Onboarding Pending | Archived             |
| Supervisor Assignment  | Unassigned         | Ended                |
| Department Assignment  | Pending            | Finished             |
| Attendance             | Waiting Check In   | Attendance Completed |
| Certificate            | Waiting            | Downloaded           |
| Notification           | Created            | Read                 |
| File Upload            | Selected           | Linked               |

---

# 30. State Machine Design Guidelines

Seluruh implementasi Backend wajib mengikuti aturan berikut.

---

## Rule 1

State tidak boleh diubah langsung melalui Repository.

Perubahan hanya melalui Service Layer.

---

## Rule 2

Setiap perubahan State wajib divalidasi.

---

## Rule 3

Setiap perubahan State wajib menghasilkan Audit Log.

---

## Rule 4

Seluruh Side Effect dijalankan setelah transaksi utama berhasil.

---

## Rule 5

Gunakan Database Transaction untuk setiap proses yang melibatkan lebih dari satu tabel.

---

## Rule 6

State History tidak boleh dihapus.

---

## Rule 7

Gunakan Enum untuk seluruh State.

Contoh:

```ts
ApplicationStatus;

AttendanceStatus;

InternshipStatus;

CertificateStatus;

NotificationStatus;
```

---

## Rule 8

Seluruh transisi harus bersifat idempotent.

Contoh:

Request Check In dikirim dua kali.

↓

Backend tetap menghasilkan satu Attendance.

---

# 31. Testing Recommendation

Setiap State Machine wajib memiliki pengujian.

Minimal meliputi:

### Unit Test

- Valid Transition
- Invalid Transition
- Validation Failure
- Business Rule Validation

---

### Integration Test

- Database Transaction
- Audit Log
- Notification
- File Upload

---

### End-to-End Test

- Registrasi
- Pengajuan Magang
- Approval
- Onboarding
- Check In
- Check Out
- Generate Sertifikat
- Download Sertifikat

---

# 32. Document Summary

Dokumen ini menjadi referensi utama implementasi seluruh Business Logic SIMAD.

Seluruh perubahan status pada sistem wajib mengikuti State Machine yang telah ditetapkan.

Perubahan terhadap dokumen ini hanya dapat dilakukan melalui proses Change Management dan persetujuan Product Owner.

---

# End of Document
