# BUSINESS_RULES.md

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

# 1. Introduction

## 1.1 Purpose

Dokumen ini mendefinisikan seluruh aturan bisnis (Business Rules) yang berlaku pada Sistem Informasi Manajemen Magang & Absensi Digital (SIMAD).

Dokumen ini menjadi acuan utama dalam proses:

- Perancangan Database
- Implementasi Backend
- Implementasi Frontend
- Pengujian Sistem (QA)
- Integrasi API
- Audit Sistem
- Pengembangan fitur di masa depan

Semua aturan yang tertulis pada dokumen ini bersifat mengikat selama tidak terdapat perubahan yang disetujui oleh Product Owner.

---

## 1.2 Scope

Dokumen ini mencakup aturan bisnis untuk seluruh modul SIMAD.

- Authentication
- User Management
- Internship Registration
- Internship Approval
- Onboarding
- Attendance
- Geofencing
- Certificate
- Notification
- Audit
- Reporting

---

## 1.3 Target Platform

SIMAD dikembangkan sebagai aplikasi berbasis Web dengan dukungan Progressive Web App (PWA).

Target pengguna:

- Peserta Magang
- Human Resource (HR)
- Supervisor
- Resepsionis

---

# 2. Terminology

| Istilah         | Definisi                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| Intern          | Peserta magang yang telah memiliki akun SIMAD.                                         |
| Applicant       | Calon peserta magang yang masih dalam proses pengajuan.                                |
| HR              | Petugas yang bertanggung jawab melakukan validasi administrasi dan persetujuan magang. |
| Supervisor      | Pembimbing peserta magang pada unit kerja tertentu.                                    |
| Receptionist    | Petugas yang menerima pengajuan awal dari calon peserta magang.                        |
| Internship      | Periode aktif magang yang telah disetujui oleh HR.                                     |
| Check In        | Absensi masuk.                                                                         |
| Check Out       | Absensi pulang.                                                                        |
| Geofence        | Area virtual yang digunakan untuk memvalidasi lokasi absensi.                          |
| Office Location | Titik lokasi kantor PLN yang dijadikan pusat geofence.                                 |
| Certificate     | Sertifikat digital yang diterbitkan setelah magang selesai.                            |
| Override        | Perubahan status absensi oleh Supervisor.                                              |
| Audit Log       | Riwayat aktivitas penting pada sistem.                                                 |

---

# 3. General Business Rules

## BR-GEN-001

Setiap pengguna wajib memiliki akun yang terdaftar pada sistem.

---

## BR-GEN-002

Email hanya boleh digunakan oleh satu akun.

---

## BR-GEN-003

Seluruh waktu pada sistem menggunakan zona waktu Asia/Jakarta (UTC+7).

---

## BR-GEN-004

Semua aktivitas penting wajib dicatat pada Audit Log.

Contoh:

- Login
- Logout
- Approval
- Reject
- Override Attendance
- Generate Certificate

---

## BR-GEN-005

Semua Primary Key menggunakan UUID.

---

## BR-GEN-006

Soft Delete digunakan pada seluruh data utama.

Kolom:

```text
deleted_at
```

Data yang dihapus tidak boleh langsung dihapus permanen dari database.

---

## BR-GEN-007

Setiap tabel transaksi wajib memiliki:

```text
created_at

updated_at
```

---

## BR-GEN-008

Status tidak boleh diubah langsung melalui database.

Perubahan status hanya diperbolehkan melalui Business Logic Backend.

---

## BR-GEN-009

Seluruh validasi bisnis dilakukan pada Backend.

Frontend hanya bertugas melakukan validasi dasar (client-side validation).

---

## BR-GEN-010

Semua endpoint wajib melalui Authentication Middleware.

Kecuali:

- Login
- Register
- Verify Email
- Forgot Password
- Reset Password

---

# 4. User Roles

SIMAD memiliki empat role utama.

## Intern

Hak akses:

- Registrasi
- Login
- Mengelola profil
- Mengajukan magang
- Check In
- Check Out
- Melihat notifikasi
- Mengunduh sertifikat

---

## Human Resource (HR)

Hak akses:

- Melihat seluruh pengajuan
- Approve magang
- Reject magang
- Menentukan Supervisor
- Menentukan Department
- Melihat seluruh absensi
- Export laporan

---

## Supervisor

Hak akses:

- Melihat peserta magang pada divisinya
- Melihat absensi
- Override absensi
- Memberikan catatan kepada peserta

---

## Receptionist

Hak akses:

- Membantu registrasi awal
- Memberikan informasi prosedur
- Tidak memiliki hak Approval

---

# 5. Authentication Rules

## BR-AUTH-001

Pengguna wajib melakukan registrasi menggunakan:

- Nama Lengkap
- Email
- Password

---

## BR-AUTH-002

Email wajib diverifikasi sebelum pengguna dapat mengakses Dashboard.

---

## BR-AUTH-003

Password wajib memenuhi ketentuan berikut:

Minimal:

- 8 karakter

Harus mengandung:

- Huruf besar
- Huruf kecil
- Angka

Disarankan:

- Karakter khusus

---

## BR-AUTH-004

Password disimpan menggunakan algoritma hashing yang aman.

Password tidak boleh disimpan dalam bentuk Plain Text.

---

## BR-AUTH-005

Sistem menggunakan JWT Authentication.

Access Token memiliki masa berlaku terbatas.

Refresh Token digunakan untuk memperbarui Access Token.

---

## BR-AUTH-006

Refresh Token dapat dicabut (Revoked) oleh sistem.

Contoh:

- Logout
- Password berubah
- Akun dinonaktifkan

---

## BR-AUTH-007

Magic Link hanya berlaku satu kali.

Token akan langsung dinyatakan tidak valid setelah digunakan.

---

## BR-AUTH-008

Token Reset Password memiliki masa berlaku terbatas.

Setelah melewati batas waktu, token otomatis tidak berlaku.

---

## BR-AUTH-009

Akun yang dinonaktifkan tidak dapat melakukan login.

---

## BR-AUTH-010

Sistem wajib mencatat:

- Waktu Login
- IP Address
- Browser
- Device
- User Agent

ke dalam Audit Log.

---

# 6. Authorization Rules

Hak akses ditentukan berdasarkan Role.

Satu User dapat memiliki lebih dari satu Role.

Contoh:

HR

-

Supervisor

---

Permission tidak boleh diperiksa di Frontend.

Seluruh pengecekan Authorization dilakukan oleh Backend.

---

# 7. Session Rules

Session akan berakhir apabila:

- Logout
- Refresh Token dicabut
- Refresh Token kedaluwarsa
- Akun dinonaktifkan

---

Apabila Access Token kedaluwarsa namun Refresh Token masih valid:

Sistem wajib menghasilkan Access Token baru tanpa meminta pengguna login ulang.

---

# 8. Security Rules

Seluruh komunikasi antara Client dan Server wajib menggunakan HTTPS.

---

CORS wajib dikonfigurasi sesuai Origin yang diizinkan.

---

Rate Limiting wajib diterapkan pada endpoint:

- Login
- Register
- Forgot Password
- Verify Email

untuk mencegah Brute Force Attack.

---

Input pengguna wajib divalidasi dan disanitasi sebelum diproses.

---

Seluruh file upload wajib dilakukan validasi:

- MIME Type
- Ukuran File
- Ekstensi File

---

Tidak diperbolehkan menyimpan password, OTP, maupun token sensitif pada Local Storage.

Gunakan mekanisme yang lebih aman sesuai arsitektur autentikasi yang dipilih.

---

# End of Part 1

---

# 9. Intern Profile Rules

Modul Intern Profile digunakan untuk menyimpan identitas peserta magang.

Data pada modul ini hanya dapat dimiliki oleh User dengan Role:

- Intern

---

## BR-PROFILE-001

Setiap peserta magang wajib melengkapi profil sebelum dapat mengajukan magang.

---

## BR-PROFILE-002

Data berikut wajib diisi:

- Nama Lengkap
- NIM / NPM
- Universitas / Sekolah / Instansi
- Program Studi / Jurusan
- Nomor Handphone
- Skill yang Dimiliki

---

## BR-PROFILE-003

Field berikut bersifat opsional:

- Fakultas
- Tempat Lahir
- Tanggal Lahir
- Jenis Kelamin
- Alamat
- Bio

---

## BR-PROFILE-004

Nomor Handphone harus menggunakan format nomor Indonesia yang valid.

Contoh:

- 081234567890
- +6281234567890

---

## BR-PROFILE-005

Satu akun hanya boleh memiliki satu Intern Profile.

Relasi:

User (1)
↓

Intern Profile (1)

---

## BR-PROFILE-006

Skill dapat dipilih lebih dari satu.

Contoh:

- Microsoft Office
- React.js
- Laravel
- Public Speaking
- UI / UX
- Node.js

---

## BR-PROFILE-007

Skill baru hanya dapat ditambahkan oleh Administrator apabila belum tersedia pada Master Data.

---

## BR-PROFILE-008

Perubahan data profil diperbolehkan selama status pengajuan belum Approved.

---

## BR-PROFILE-009

Apabila peserta sudah berstatus Active Internship, perubahan terhadap data berikut tidak diperbolehkan:

- NIM / NPM
- Universitas
- Program Studi

Perubahan hanya dapat dilakukan oleh HR.

---

# 10. Internship Application Rules

Modul ini mengatur seluruh proses pengajuan magang.

---

## BR-APP-001

Peserta wajib memiliki akun yang aktif.

---

## BR-APP-002

Email harus sudah diverifikasi.

---

## BR-APP-003

Intern Profile wajib telah lengkap.

---

## BR-APP-004

Peserta wajib mengunggah Surat Pengantar dari:

- Fakultas
- Sekolah
- Instansi

---

## BR-APP-005

Format file yang diperbolehkan:

- PDF

Versi berikutnya dapat mendukung:

- JPG
- JPEG
- PNG

---

## BR-APP-006

Ukuran maksimal file:

5 MB

---

## BR-APP-007

File yang diunggah wajib lolos validasi:

- MIME Type
- File Size
- Virus Scan (Future Feature)

---

## BR-APP-008

Peserta wajib menentukan:

- Tanggal Mulai
- Tanggal Selesai

---

## BR-APP-009

Tanggal mulai tidak boleh lebih besar daripada tanggal selesai.

---

## BR-APP-010

Tanggal mulai tidak boleh berada pada tanggal yang telah berlalu.

---

## BR-APP-011

Durasi magang mengikuti kebijakan PLN.

Jika terdapat perubahan kebijakan maka konfigurasi dilakukan melalui Admin.

---

## BR-APP-012

Sistem menghasilkan Nomor Pengajuan secara otomatis.

Contoh:

APP-2026-000001

---

## BR-APP-013

Satu peserta hanya boleh memiliki satu pengajuan aktif.

Status yang dianggap aktif:

- Draft
- Submitted
- Under Review
- Approved
- Active

---

## BR-APP-014

Peserta tidak dapat membuat pengajuan baru apabila masih memiliki pengajuan aktif.

---

## BR-APP-015

Peserta dapat mengubah data pengajuan selama status masih Draft.

---

## BR-APP-016

Setelah status Submitted, data tidak dapat diubah.

---

## BR-APP-017

Apabila pengajuan ditolak (Rejected), peserta diperbolehkan membuat pengajuan baru.

---

## BR-APP-018

Seluruh perubahan status wajib dicatat pada Internship Status History.

---

# 11. Internship Application Workflow

Status pengajuan terdiri dari:

Draft

↓

Submitted

↓

Under Review

↓

Approved

↓

Onboarding

↓

Active Internship

↓

Completed

↓

Certificate Generated

↓

Archived

---

## Draft

Pengguna masih mengisi data.

Belum dikirim ke HR.

---

## Submitted

Data telah dikirim.

HR belum melakukan pemeriksaan.

---

## Under Review

HR sedang melakukan pemeriksaan administrasi.

---

## Approved

Pengajuan diterima.

Peserta akan menerima:

- Notifikasi
- Email

---

## Rejected

Pengajuan ditolak.

Peserta wajib menerima alasan penolakan.

---

## Onboarding

Peserta membaca:

- Tata Tertib
- Jam Kerja
- Ketentuan Pakaian
- Peraturan Divisi

Peserta wajib menyetujui seluruh ketentuan sebelum memulai magang.

---

## Active Internship

Peserta resmi menjadi peserta magang.

Fitur berikut akan aktif:

- Check In
- Check Out
- Dashboard
- Notifikasi

---

## Completed

Periode magang telah selesai.

Peserta tidak dapat melakukan absensi lagi.

---

## Certificate Generated

Sertifikat berhasil dibuat.

Peserta dapat mengunduh PDF.

---

## Archived

Data dipindahkan ke arsip.

Tidak dapat dilakukan perubahan lagi.

---

# 12. HR Approval Rules

Seluruh proses Approval dilakukan oleh HR.

---

## BR-HR-001

HR hanya dapat melihat pengajuan dengan status:

Submitted

atau

Under Review

---

## BR-HR-002

HR wajib memeriksa:

- Surat Pengantar
- Data Mahasiswa
- Durasi Magang
- Kelengkapan Dokumen

---

## BR-HR-003

HR dapat:

- Approve
- Reject

---

## BR-HR-004

Apabila Approve, HR wajib menentukan:

- Department
- Office Location
- Supervisor

---

## BR-HR-005

Status otomatis berubah menjadi:

Approved

---

## BR-HR-006

Sistem membuat record Internship secara otomatis setelah Approval berhasil.

---

## BR-HR-007

Sistem mengirimkan:

- Email
- In App Notification

kepada peserta.

---

## BR-HR-008

Apabila Reject:

HR wajib memberikan alasan penolakan.

---

## BR-HR-009

Alasan penolakan bersifat wajib.

---

## BR-HR-010

Seluruh aktivitas Approval wajib masuk Audit Log.

---

# 13. Onboarding Rules

Onboarding dilakukan setelah HR menyetujui pengajuan.

---

## BR-ONBOARD-001

Peserta wajib membaca seluruh tata tertib.

---

## BR-ONBOARD-002

Materi onboarding minimal memuat:

- Jam Kerja
- Jam Istirahat
- Ketentuan Berpakaian
- Tata Tertib
- Ketentuan Absensi
- Larangan Penggunaan Fake GPS
- Sanksi Pelanggaran

---

## BR-ONBOARD-003

Peserta wajib memberikan persetujuan digital.

---

## BR-ONBOARD-004

Tanggal persetujuan wajib disimpan.

---

## BR-ONBOARD-005

IP Address dan User Agent wajib dicatat.

---

## BR-ONBOARD-006

Peserta tidak dapat melakukan absensi sebelum onboarding selesai.

---

## BR-ONBOARD-007

Status onboarding hanya dapat dilakukan satu kali untuk setiap periode magang.

---

# End of Part 2

---

# 14. Attendance Business Rules

Modul Attendance digunakan untuk mencatat kehadiran peserta magang secara digital berdasarkan waktu dan lokasi.

Seluruh validasi absensi dilakukan oleh Backend.

Frontend hanya bertugas memperoleh lokasi pengguna dan mengirimkannya ke Server.

---

## BR-ATT-001

Peserta hanya dapat melakukan absensi apabila:

- Status Internship = Active
- Onboarding telah selesai
- Akun masih aktif

---

## BR-ATT-002

Peserta hanya dapat melakukan:

- 1 Check In
- 1 Check Out

dalam satu hari.

---

## BR-ATT-003

Check Out hanya dapat dilakukan apabila peserta telah berhasil melakukan Check In.

---

## BR-ATT-004

Absensi wajib menggunakan lokasi GPS perangkat.

Lokasi yang dikirim manual tidak diperbolehkan.

---

## BR-ATT-005

Seluruh proses validasi dilakukan oleh Backend.

Frontend tidak diperbolehkan menentukan status:

- Hadir
- Terlambat
- Invalid

---

## BR-ATT-006

Setiap absensi wajib menyimpan:

- Waktu
- Latitude
- Longitude
- Accuracy GPS
- Device
- Browser
- User Agent
- IP Address

---

## BR-ATT-007

Setiap perubahan status absensi wajib dicatat pada Attendance Log.

---

# 15. Check In Rules

## BR-CHECKIN-001

Check In hanya dapat dilakukan satu kali dalam satu hari.

---

## BR-CHECKIN-002

Jam Check In mengikuti konfigurasi Attendance Setting.

Contoh:

Senin–Kamis

08.00 – 10.00 WIB

Jumat

07.30 – 10.00 WIB

---

## BR-CHECKIN-003

Apabila Check In dilakukan setelah batas waktu yang ditentukan, status menjadi:

Late

---

## BR-CHECKIN-004

Apabila peserta mencoba Check In sebelum jam yang ditentukan, sistem menolak permintaan.

---

## BR-CHECKIN-005

Apabila peserta mencoba Check In setelah waktu Check In berakhir, sistem menolak permintaan.

---

## BR-CHECKIN-006

Setelah Check In berhasil:

- Tombol Check In dinonaktifkan.
- Tombol Check Out tetap belum aktif sampai waktu Check Out dimulai.

---

# 16. Check Out Rules

## BR-CHECKOUT-001

Check Out hanya dapat dilakukan apabila telah berhasil Check In.

---

## BR-CHECKOUT-002

Jam Check Out mengikuti konfigurasi Attendance Setting.

Contoh:

17.00 – 19.00 WIB

---

## BR-CHECKOUT-003

Apabila peserta mencoba Check Out sebelum jam yang ditentukan, sistem menolak permintaan.

---

## BR-CHECKOUT-004

Setelah Check Out berhasil:

Status Attendance berubah menjadi:

Completed

---

## BR-CHECKOUT-005

Total jam kerja dihitung secara otomatis berdasarkan:

Check Out

dikurangi

Check In

---

# 17. Geofencing Rules

## BR-GEO-001

Absensi hanya diperbolehkan apabila peserta berada di dalam area geofence.

---

## BR-GEO-002

Geofence dihitung menggunakan koordinat:

Office Location

---

## BR-GEO-003

Radius geofence ditentukan oleh Administrator.

Contoh:

100 Meter

150 Meter

200 Meter

---

## BR-GEO-004

Perhitungan jarak menggunakan Haversine Formula.

---

## BR-GEO-005

Apabila peserta berada di luar radius geofence:

Status menjadi:

Outside Geofence

Permintaan absensi ditolak.

---

## BR-GEO-006

Accuracy GPS harus berada pada batas yang dapat diterima.

Apabila Accuracy terlalu rendah, sistem dapat meminta pengguna memperoleh lokasi yang lebih akurat sebelum melanjutkan proses absensi.

---

# 18. Fake GPS Rules

## BR-FGPS-001

Sistem dapat melakukan deteksi indikasi Fake GPS.

---

## BR-FGPS-002

Indikasi pelanggaran meliputi:

- Mock Location
- GPS Spoofing
- Emulator
- Root Detection (Future Enhancement)
- Jailbreak Detection (Future Enhancement)

---

## BR-FGPS-003

Apabila ditemukan indikasi Fake GPS:

Status Attendance:

Pending Review

---

## BR-FGPS-004

Supervisor menerima notifikasi untuk melakukan pemeriksaan.

---

## BR-FGPS-005

Seluruh aktivitas disimpan pada Attendance Log.

---

## BR-FGPS-006

Peserta tidak dapat mengubah data lokasi setelah absensi berhasil dikirim.

---

# 19. Attendance Status Rules

Status absensi terdiri dari:

- Present
- Late
- Completed
- Pending Review
- Invalid
- Absent

---

## Present

Peserta berhasil melakukan Check In sesuai aturan.

---

## Late

Peserta melakukan Check In setelah batas toleransi.

---

## Completed

Peserta telah melakukan:

- Check In
- Check Out

---

## Pending Review

Absensi menunggu pemeriksaan Supervisor.

---

## Invalid

Absensi dibatalkan oleh Supervisor.

---

## Absent

Peserta tidak melakukan Check In pada hari kerja.

---

# 20. Attendance Override Rules

Override hanya dapat dilakukan oleh Supervisor.

---

## BR-OVERRIDE-001

Supervisor dapat mengubah status absensi menjadi:

- Invalid
- Present

sesuai hasil pemeriksaan.

---

## BR-OVERRIDE-002

Supervisor wajib memberikan alasan Override.

---

## BR-OVERRIDE-003

Seluruh Override wajib masuk Audit Log.

---

## BR-OVERRIDE-004

Status sebelumnya tidak boleh dihapus.

Riwayat perubahan harus tetap tersimpan.

---

# 21. Attendance Violation Rules

Pelanggaran absensi meliputi:

- Fake GPS
- Outside Geofence
- Multiple Check In
- Multiple Device Login
- Late Attendance
- Early Check Out
- Device Manipulation

---

## BR-VIOLATION-001

Setiap pelanggaran wajib dicatat.

---

## BR-VIOLATION-002

Pelanggaran tidak langsung mengubah status magang.

---

## BR-VIOLATION-003

Supervisor memiliki kewenangan melakukan investigasi.

---

## BR-VIOLATION-004

HR dapat melihat seluruh riwayat pelanggaran peserta.

---

# 22. Attendance Workflow

Check In

↓

Location Validation

↓

Geofence Validation

↓

Attendance Validation

↓

Save Attendance

↓

Attendance Log

↓

Success

---

Apabila validasi gagal:

Check In

↓

Validation Failed

↓

Attendance Rejected

↓

Show Error Message

---

# End of Part 3

---

# 23. Certificate Business Rules

Modul Certificate digunakan untuk menghasilkan sertifikat digital secara otomatis setelah peserta menyelesaikan masa magang.

---

## BR-CERT-001

Sertifikat hanya dapat diterbitkan apabila status Internship adalah:

Completed

---

## BR-CERT-002

Tanggal saat ini harus lebih besar atau sama dengan tanggal selesai magang.

```
Current Date >= Internship End Date
```

---

## BR-CERT-003

Peserta yang masih berstatus:

- Draft
- Submitted
- Under Review
- Approved
- Onboarding
- Active Internship

tidak dapat memperoleh sertifikat.

---

## BR-CERT-004

Generate sertifikat dilakukan oleh sistem secara otomatis.

HR tidak perlu membuat sertifikat secara manual.

---

## BR-CERT-005

Nomor sertifikat harus unik.

Contoh:

```
PLN-MAGANG-2026-000001
```

---

## BR-CERT-006

Sertifikat dibuat dalam format PDF.

---

## BR-CERT-007

Sertifikat menggunakan Template yang aktif.

---

## BR-CERT-008

Apabila Template berubah, sertifikat yang telah diterbitkan tidak boleh berubah.

---

## BR-CERT-009

Sertifikat yang telah diterbitkan tidak boleh dihapus.

---

## BR-CERT-010

QR Code atau Verification Token wajib bersifat unik.

---

## BR-CERT-011

Verification Token hanya digunakan untuk memverifikasi keaslian sertifikat.

---

## BR-CERT-012

Generate sertifikat wajib masuk Audit Log.

---

# 24. Notification Business Rules

Notifikasi digunakan untuk memberikan informasi kepada pengguna.

---

## BR-NOTIF-001

Notifikasi dapat dikirim melalui:

- In App Notification
- Email

Future Enhancement:

- Push Notification

---

## BR-NOTIF-002

Notifikasi dapat bersifat:

- Personal
- Broadcast

---

## BR-NOTIF-003

Jenis notifikasi meliputi:

- Approval
- Rejection
- Reminder
- Attendance
- Certificate
- Announcement

---

## BR-NOTIF-004

Setiap notifikasi memiliki status:

- Delivered
- Read

---

## BR-NOTIF-005

Status Read dicatat ketika pengguna membuka notifikasi.

---

## BR-NOTIF-006

Pengguna hanya dapat melihat notifikasi miliknya sendiri.

Kecuali Broadcast.

---

## BR-NOTIF-007

Notifikasi Broadcast dapat dibaca oleh seluruh pengguna sesuai target role.

---

## BR-NOTIF-008

Seluruh notifikasi disimpan sebagai histori.

---

# 25. File Management Rules

Seluruh dokumen pada SIMAD menggunakan File Management Service.

---

## BR-FILE-001

File yang diperbolehkan:

- PDF
- JPG
- JPEG
- PNG

---

## BR-FILE-002

Ukuran maksimal file mengikuti konfigurasi sistem.

---

## BR-FILE-003

Nama file pada penyimpanan tidak menggunakan nama asli pengguna.

Sistem wajib menghasilkan nama file unik.

---

## BR-FILE-004

Metadata file wajib disimpan.

Minimal:

- Original Name
- File Name
- MIME Type
- File Size
- Uploaded By
- Upload Time

---

## BR-FILE-005

Seluruh file wajib memiliki URL yang valid.

---

## BR-FILE-006

Penghapusan file mengikuti kebijakan Retention Policy.

---

## BR-FILE-007

File yang digunakan oleh data aktif tidak boleh dihapus secara fisik.

---

# 26. Audit Log Rules

Audit Log digunakan sebagai bukti aktivitas sistem.

---

## BR-AUDIT-001

Audit Log tidak boleh diubah.

---

## BR-AUDIT-002

Audit Log tidak boleh dihapus oleh pengguna.

---

## BR-AUDIT-003

Audit Log minimal mencatat:

- User
- Modul
- Action
- Timestamp
- IP Address
- User Agent

---

## BR-AUDIT-004

Aktivitas berikut wajib masuk Audit Log:

- Login
- Logout
- Register
- Approval
- Reject
- Override Attendance
- Generate Certificate
- Download Certificate
- Upload File

---

## BR-AUDIT-005

Audit Log hanya dapat diakses oleh Administrator yang berwenang.

---

# 27. Activity Log Rules

Activity Log digunakan untuk mencatat aktivitas pengguna yang tidak termasuk Audit Log.

---

## BR-ACT-001

Activity Log dapat digunakan untuk:

- Dashboard
- Statistik
- Riwayat Aktivitas

---

## BR-ACT-002

Activity Log tidak digunakan sebagai bukti hukum.

Audit Log tetap menjadi sumber utama.

---

# 28. Reporting Rules

Sistem wajib menyediakan laporan.

---

## BR-REPORT-001

HR dapat melihat laporan:

- Peserta Magang
- Pengajuan
- Absensi
- Sertifikat

---

## BR-REPORT-002

Supervisor hanya dapat melihat peserta pada Department yang menjadi tanggung jawabnya.

---

## BR-REPORT-003

Laporan dapat difilter berdasarkan:

- Nama
- NIM / NPM
- Universitas
- Department
- Status
- Tanggal

---

## BR-REPORT-004

Laporan dapat diekspor ke:

- Excel (.xlsx)

Future Enhancement:

- PDF
- CSV

---

# 29. Data Retention Rules

Seluruh data mengikuti kebijakan retensi perusahaan.

---

## BR-RETENTION-001

Soft Delete digunakan pada data utama.

---

## BR-RETENTION-002

Audit Log tidak boleh dihapus selama masa retensi.

---

## BR-RETENTION-003

Sertifikat yang telah diterbitkan harus tetap dapat diverifikasi selama masa retensi.

---

## BR-RETENTION-004

Data peserta yang telah selesai magang dipindahkan ke status Archive.

---

# 30. Error Handling Rules

Seluruh error harus memiliki pesan yang jelas.

---

## BR-ERROR-001

Pesan error tidak boleh menampilkan informasi sensitif.

Contoh:

- SQL Query
- Stack Trace
- Database Error

---

## BR-ERROR-002

Error dikategorikan menjadi:

- Validation Error
- Authentication Error
- Authorization Error
- Business Rule Error
- Internal Server Error

---

## BR-ERROR-003

Seluruh Internal Server Error wajib dicatat pada Log Server.

---

# 31. Future Business Rules

Beberapa fitur yang direncanakan pada versi berikutnya:

- Multi Branch PLN
- Multi Office Location
- Push Notification
- Face Recognition Attendance
- NFC Attendance
- QR Code Attendance
- Mobile Application
- AI Attendance Fraud Detection
- Dashboard Analytics
- Integrasi SSO PLN
- Integrasi Email PLN
- Integrasi WhatsApp Notification

---

# 32. Business Rule Priority

Business Rule diklasifikasikan menjadi:

| Priority | Deskripsi                                                      |
| -------- | -------------------------------------------------------------- |
| Critical | Wajib dipenuhi sebelum sistem dapat digunakan.                 |
| High     | Sangat penting dan harus tersedia pada Release pertama.        |
| Medium   | Penting namun masih dapat dijadwalkan pada Release berikutnya. |
| Low      | Future Enhancement.                                            |

---

# 33. Business Rule Change Management

Seluruh perubahan Business Rule wajib:

- Melalui persetujuan Product Owner.
- Didokumentasikan pada Change Log.
- Memiliki nomor versi dokumen.
- Diimplementasikan pada Backend sebelum Frontend.

---

# End of Part 4
