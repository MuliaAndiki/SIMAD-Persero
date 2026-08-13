# Daftar API Backend SIMAD

Dokumen ini berisi **seluruh API yang terdaftar di backend** SIMAD, beserta penjelasan dan **role akses** masing-masing endpoint.

- **Base URL (semua modul):** `/api/v1`
- **Semua endpoint** (kecuali yang ditandai `Public`) **wajib menyertakan header**:
  - `Authorization: Bearer <accessToken>`
  - `x-api-key: <InternalApiKey>` (diberlakukan global oleh middleware `InternalApiKey`)
- **Role yang tersedia:** `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST`
- **Auth**: `verifyToken` = user sudah login (token valid). `requireRole([...])` = hanya role tertentu yang boleh akses.
- Sumber aturan detail: [`docs/07-api-specification.md`](docs/07-api-specification.md)

---

## Ringkasan Akses per Role

| Endpoint                         |       INTERN       | HR_ADMIN | SUPERVISOR  | RECEPTIONIST | Public |
| -------------------------------- | :----------------: | :------: | :---------: | :----------: | :----: |
| `GET /` (health check)           |         –          |    –     |      –      |      –       |   ✅   |
| Auth (register, login, dll.)     |         –          |    –     |      –      |      –       |   ✅   |
| `GET/PATCH /auth/me` & akun      |         ✅         |    ✅    |     ✅      |      ✅      |   –    |
| `GET /users/profile`             |         ✅         |    ✅    |     ✅      |      –       |   –    |
| `PATCH /users/change-password`   |         ✅         |    ✅    |     ✅      |      ✅      |   –    |
| `GET/POST /institutions`         |         ✅         |    ✅    |     ✅      |      ✅      |   –    |
| `POST /files/upload`             |         ✅         |    ✅    |     ✅      |      ✅      |   –    |
| Aplikasi magang (intern)         |         ✅         |    –     |      –      |      –       |   –    |
| Aplikasi magang (review)         |         –          |    ✅    | ✅ (detail) |      –       |   –    |
| Internship                       |  ✅ (me/profile)   |    ✅    | ✅ (detail) |      –       |   –    |
| Attendance (check-in/out)        |         ✅         |    –     |      –      |      –       |   –    |
| Attendance (review/override)     |         –          |    ✅    |     ✅      |      –       |   –    |
| Certificate                      | ✅ (milik sendiri) |    ✅    | ✅ (detail) |      –       |   –    |
| `GET /certificates/verify/:code` |         –          |    –     |      –      |      –       |   ✅   |
| Notification                     |         ✅         |    ✅    |     ✅      |      ✅      |   –    |
| `POST /notifications/send`       |         –          |    ✅    |      –      |      –       |   –    |
| Department/Office                |         –          |    ✅    |  ✅ (baca)  |      –       |   –    |
| Supervisor management            |         –          |    ✅    |      –      |      –       |   –    |
| Reports & Audit Log              |         –          |    ✅    |      –      |      –       |   –    |
| Dashboard per role               |         ✅         |    ✅    |     ✅      |      –       |   –    |

---

## 0. Root / Health Check

### `GET /`

|                |                                                                           |
| -------------- | ------------------------------------------------------------------------- |
| **Deskripsi**  | Endpoint health check server. Mengembalikan pesan `Hello Elysia! Bun js`. |
| **Role akses** | Public (tanpa autentikasi)                                                |
| **File**       | [`be/src/app.ts`](be/src/app.ts:15)                                       |

---

## 1. Auth Module — prefix `/auth`

File: [`be/src/routes/authRoutes.ts`](be/src/routes/authRoutes.ts)

### 1.1 `POST /auth/register`

|                |                                               |
| -------------- | --------------------------------------------- |
| **Deskripsi**  | Mendaftarkan akun pengguna baru ke sistem.    |
| **Role akses** | Public (dibatasi `rateLimit` khusus register) |

### 1.2 `POST /auth/verify-email/send`

|                |                                                                 |
| -------------- | --------------------------------------------------------------- |
| **Deskripsi**  | Mengirim ulang email berisi token verifikasi ke email pengguna. |
| **Role akses** | Public                                                          |

### 1.3 `POST /auth/verify-email`

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **Deskripsi**  | Memverifikasi email pengguna menggunakan token dari email. |
| **Role akses** | Public                                                     |

### 1.4 `POST /auth/login`

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Deskripsi**  | Autentikasi dengan email + password. Mengembalikan `accessToken` + `refreshToken`. |
| **Role akses** | Public (dibatasi `rateLimit` khusus login)                                         |

### 1.5 `POST /auth/magic-link/send`

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Deskripsi**  | Mengirim link login sekali pakai (magic link) ke email pengguna. |
| **Role akses** | Public (dibatasi `rateLimit` khusus magic link)                  |

### 1.6 `POST /auth/magic-link/verify`

|                |                                               |
| -------------- | --------------------------------------------- |
| **Deskripsi**  | Menukar token magic link menjadi session JWT. |
| **Role akses** | Public                                        |

### 1.7 `POST /auth/forgot-password`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Mengirim email berisi token untuk reset password.  |
| **Role akses** | Public (dibatasi `rateLimit` khusus lupa password) |

### 1.8 `POST /auth/reset-password`

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Deskripsi**  | Mereset password pengguna menggunakan token dari email. |
| **Role akses** | Public                                                  |

### 1.9 `POST /auth/refresh-token`

|                |                                                   |
| -------------- | ------------------------------------------------- |
| **Deskripsi**  | Menukar `refreshToken` dengan `accessToken` baru. |
| **Role akses** | Public (menggunakan body `refreshToken`)          |

### 1.10 `POST /auth/logout`

|                |                                  |
| -------------- | -------------------------------- |
| **Deskripsi**  | Membatalkan sesi saat ini.       |
| **Role akses** | `verifyToken` (semua user login) |

### 1.11 `POST /auth/logout-all`

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **Deskripsi**  | Membatalkan seluruh sesi aktif pengguna (semua perangkat). |
| **Role akses** | `verifyToken` (semua user login)                           |

### 1.12 `GET /auth/me`

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Deskripsi**  | Mengembalikan data profil pengguna yang sedang login. |
| **Role akses** | `verifyToken` (semua user login)                      |

### 1.13 `PATCH /auth/change-password`

|                |                                               |
| -------------- | --------------------------------------------- |
| **Deskripsi**  | Mengubah password pengguna yang sedang login. |
| **Role akses** | `verifyToken` (semua user login)              |

### 1.14 `PATCH /auth/change-email`

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Deskripsi**  | Mengajukan perubahan email dan mengirim token konfirmasi. |
| **Role akses** | `verifyToken` (semua user login)                          |

### 1.15 `POST /auth/change-email/verify`

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Deskripsi**  | Menyelesaikan perubahan email menggunakan token konfirmasi. |
| **Role akses** | `verifyToken` (semua user login)                            |

### 1.16 `GET /auth/sessions`

|                |                                            |
| -------------- | ------------------------------------------ |
| **Deskripsi**  | Mengembalikan seluruh sesi aktif pengguna. |
| **Role akses** | `verifyToken` (semua user login)           |

### 1.17 `DELETE /auth/sessions/:sessionId`

|                |                                                |
| -------------- | ---------------------------------------------- |
| **Deskripsi**  | Membatalkan sesi tertentu berdasarkan ID sesi. |
| **Role akses** | `verifyToken` (semua user login)               |

---

## 2. User Module — prefix `/users`

File: [`be/src/routes/userRoutes.ts`](be/src/routes/userRoutes.ts)

### 2.1 `GET /users/profile`

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Deskripsi**  | Mengembalikan profil pengguna yang sedang login. |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`               |

### 2.2 `PATCH /users/profile`

|                |                                                                 |
| -------------- | --------------------------------------------------------------- |
| **Deskripsi**  | Memperbarui profil pengguna. Email dan role tidak dapat diubah. |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`                              |

### 2.3 `POST /users/profile/photo`

|                |                                                                    |
| -------------- | ------------------------------------------------------------------ |
| **Deskripsi**  | Upload foto profil (JPG/JPEG/PNG, maks. 5 MB). Foto lama diganti.  |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR` (dibatasi `rateLimit` per user) |

### 2.4 `PATCH /users/change-password`

|                |                                                                               |
| -------------- | ----------------------------------------------------------------------------- |
| **Deskripsi**  | Mengubah password pengguna yang sedang login (`oldPassword` + `newPassword`). |
| **Role akses** | `verifyToken` (semua user login)                                              |

---

## 3. File Module — prefix `/files`

File: [`be/src/routes/fileRoutes.ts`](be/src/routes/fileRoutes.ts)

### 3.1 `POST /files/upload`

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Deskripsi**  | Upload file PDF/JPG/JPEG/PNG maks. 5 MB (`multipart/form-data`). |
| **Role akses** | `verifyToken` (semua user login, dibatasi `rateLimit` per user)  |

### 3.2 `GET /files/:fileId`

|                |                                             |
| -------------- | ------------------------------------------- |
| **Deskripsi**  | Mengembalikan metadata file berdasarkan ID. |
| **Role akses** | `verifyToken` (semua user login)            |

### 3.3 `GET /files/:fileId/download`

|                |                                       |
| -------------- | ------------------------------------- |
| **Deskripsi**  | Mengunduh konten file berdasarkan ID. |
| **Role akses** | `verifyToken` (semua user login)      |

### 3.4 `DELETE /files/:fileId`

|                |                                                                                     |
| -------------- | ----------------------------------------------------------------------------------- |
| **Deskripsi**  | Menghapus file (soft delete via `deleted_at`) — hanya pemilik file atau `HR_ADMIN`. |
| **Role akses** | `verifyToken` (semua user login; otorisasi pemilik/HR_ADMIN di service)             |

---

## 4. Institution Module — prefix `/institutions`

File: [`be/src/routes/institutionRoutes.ts`](be/src/routes/institutionRoutes.ts)

### 4.1 `GET /institutions`

|                |                                                                                |
| -------------- | ------------------------------------------------------------------------------ |
| **Deskripsi**  | Mengembalikan daftar institusi (kampus/sekolah) dengan pagination & pencarian. |
| **Role akses** | `verifyToken` (semua user login — dipakai INTERN saat mengisi profil)          |

### 4.2 `GET /institutions/:institutionId`

|                |                                                     |
| -------------- | --------------------------------------------------- |
| **Deskripsi**  | Mengembalikan detail satu institusi berdasarkan ID. |
| **Role akses** | `verifyToken` (semua user login)                    |

---

## 5. Internship Application Module — prefix `/applications`

File: [`be/src/routes/applicationRoutes.ts`](be/src/routes/applicationRoutes.ts)

### 5.1 `POST /applications` — Buat aplikasi (draft)

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **Deskripsi**  | Membuat pengajuan magang baru (status awal `DRAFT`). |
| **Role akses** | `INTERN`                                             |

### 5.2 `GET /applications/me` — Aplikasi milik saya

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Deskripsi**  | Mengembalikan seluruh aplikasi milik pengguna INTERN yang login. |
| **Role akses** | `INTERN`                                                         |

### 5.3 `PATCH /applications/:id` — Update draft

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Memperbarui draft aplikasi (hanya status `DRAFT`). |
| **Role akses** | `INTERN` (pemilik)                                 |

### 5.4 `POST /applications/:id/submit` — Submit aplikasi

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Deskripsi**  | Mengirim aplikasi untuk direview HR (status → `PENDING`). |
| **Role akses** | `INTERN` (pemilik)                                        |

### 5.5 `POST /applications/:id/cancel` — Batalkan aplikasi

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **Deskripsi**  | Membatalkan aplikasi yang masih berstatus `PENDING`. |
| **Role akses** | `INTERN` (pemilik)                                   |

### 5.6 `DELETE /applications/:id` — Hapus draft

|                |                                       |
| -------------- | ------------------------------------- |
| **Deskripsi**  | Menghapus aplikasi berstatus `DRAFT`. |
| **Role akses** | `INTERN` (pemilik)                    |

### 5.7 `GET /applications` — List semua aplikasi

|                |                                                                           |
| -------------- | ------------------------------------------------------------------------- |
| **Deskripsi**  | Mengembalikan daftar seluruh aplikasi dengan pagination, filter, sorting. |
| **Role akses** | `HR_ADMIN`                                                                |

### 5.8 `GET /applications/:id` — Detail aplikasi

|                |                                                                                     |
| -------------- | ----------------------------------------------------------------------------------- |
| **Deskripsi**  | Mengembalikan detail satu aplikasi. INTERN hanya dapat melihat aplikasinya sendiri. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`, `INTERN` (pemilik)                                        |

### 5.9 `PATCH /applications/:id/approve` — Approve

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Deskripsi**  | Menyetujui aplikasi (status → `APPROVED`) dan membuat data internship. Idempotent. |
| **Role akses** | `HR_ADMIN`                                                                         |

### 5.10 `PATCH /applications/:id/reject` — Reject

|                |                                                        |
| -------------- | ------------------------------------------------------ |
| **Deskripsi**  | Menolak aplikasi beserta alasan penolakan. Idempotent. |
| **Role akses** | `HR_ADMIN`                                             |

---

## 6. Internship Module — prefix `/internships`

File: [`be/src/routes/internshipRoutes.ts`](be/src/routes/internshipRoutes.ts)

### 6.1 `GET /internships/me` — Internship saya

|                |                                                               |
| -------------- | ------------------------------------------------------------- |
| **Deskripsi**  | Mengembalikan data internship milik INTERN yang sedang login. |
| **Role akses** | `INTERN`                                                      |

### 6.2 `GET /internships/:id` — Detail internship

|                |                                       |
| -------------- | ------------------------------------- |
| **Deskripsi**  | Mengembalikan detail satu internship. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`              |

### 6.3 `PATCH /internships/:id/start` — Mulai internship

|                |                                                                |
| -------------- | -------------------------------------------------------------- |
| **Deskripsi**  | Mengubah status internship menjadi `ONGOING` (mulai berjalan). |
| **Role akses** | `HR_ADMIN`                                                     |

### 6.4 `PATCH /internships/:id/finish` — Selesaikan internship

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Deskripsi**  | Mengubah status internship menjadi `COMPLETED`. Idempotent. |
| **Role akses** | `HR_ADMIN`                                                  |

### 6.5 `PATCH /internships/:id/extend` — Perpanjang internship

|                |                                         |
| -------------- | --------------------------------------- |
| **Deskripsi**  | Memperpanjang tanggal akhir internship. |
| **Role akses** | `HR_ADMIN`                              |

### 6.6 `PATCH /internships/:id/assign-supervisor` — Assign supervisor

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Deskripsi**  | Menetapkan supervisor untuk internship tertentu. |
| **Role akses** | `HR_ADMIN`                                       |

### 6.7 `PATCH /internships/:id/change-department` — Pindah departemen

|                |                                 |
| -------------- | ------------------------------- |
| **Deskripsi**  | Mengubah departemen internship. |
| **Role akses** | `HR_ADMIN`                      |

### 6.8 `PATCH /internships/:id/archive` — Arsipkan internship

|                |                                        |
| -------------- | -------------------------------------- |
| **Deskripsi**  | Mengarsipkan internship (soft delete). |
| **Role akses** | `HR_ADMIN`                             |

### 6.9 `POST /internships/profile` — Buat profil intern

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| **Deskripsi**  | Membuat/melengkapi profil intern (institusi, jurusan, dll.). |
| **Role akses** | `INTERN`                                                     |

### 6.10 `GET /internships/profile` — Lihat profil intern

|                |                                                        |
| -------------- | ------------------------------------------------------ |
| **Deskripsi**  | Mengembalikan profil intern milik pengguna yang login. |
| **Role akses** | `INTERN`                                               |

### 6.11 `GET /internships/skill` — Daftar skill

|                |                                           |
| -------------- | ----------------------------------------- |
| **Deskripsi**  | Mengembalikan daftar skill yang tersedia. |
| **Role akses** | `verifyToken` (semua user login)          |

### 6.12 `POST /internships/add-skills` — Tambah skill

|                |                                     |
| -------------- | ----------------------------------- |
| **Deskripsi**  | Menambahkan skill ke profil intern. |
| **Role akses** | `INTERN`                            |

### 6.13 `DELETE /internships/remove-skill/:skillId` — Hapus skill

|                |                                     |
| -------------- | ----------------------------------- |
| **Deskripsi**  | Menghapus skill dari profil intern. |
| **Role akses** | `INTERN`                            |

---

## 7. Attendance Module — prefix `/attendance`

File: [`be/src/routes/attendanceRoutes.ts`](be/src/routes/attendanceRoutes.ts)

### 7.1 `POST /attendance/check-in`

|                |                                                                                       |
| -------------- | ------------------------------------------------------------------------------------- |
| **Deskripsi**  | Absen masuk dengan validasi geofence lokasi kantor. Dibatasi rate limit & idempotent. |
| **Role akses** | `INTERN`                                                                              |

### 7.2 `POST /attendance/check-out`

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **Deskripsi**  | Absen pulang dengan validasi geofence. Dibatasi rate limit & idempotent. |
| **Role akses** | `INTERN`                                                                 |

### 7.3 `GET /attendance/me`

|                |                                                                     |
| -------------- | ------------------------------------------------------------------- |
| **Deskripsi**  | Riwayat absensi milik INTERN yang login (dengan pagination/filter). |
| **Role akses** | `INTERN`                                                            |

### 7.4 `GET /attendance/today`

|                |                                                |
| -------------- | ---------------------------------------------- |
| **Deskripsi**  | Data absensi hari ini milik INTERN yang login. |
| **Role akses** | `INTERN`                                       |

### 7.5 `GET /attendance/summary`

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **Deskripsi**  | Ringkasan statistik absensi milik INTERN yang login. |
| **Role akses** | `INTERN`                                             |

### 7.6 `GET /attendance/supervisor`

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Deskripsi**  | Dashboard absensi untuk supervisor (data intern yang dibimbing). |
| **Role akses** | `SUPERVISOR`                                                     |

### 7.7 `GET /attendance/history`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Riwayat absensi seluruh intern dengan filter (HR). |
| **Role akses** | `HR_ADMIN`                                         |

### 7.8 `GET /attendance/export`

|                |                                                               |
| -------------- | ------------------------------------------------------------- |
| **Deskripsi**  | Export data absensi (CSV/Excel) untuk kebutuhan pelaporan HR. |
| **Role akses** | `HR_ADMIN`                                                    |

### 7.9 `GET /attendance/:attendanceId`

|                |                             |
| -------------- | --------------------------- |
| **Deskripsi**  | Detail satu record absensi. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`    |

### 7.10 `PATCH /attendance/:attendanceId/override`

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Deskripsi**  | Koreksi/override data absensi (misal: lupa check-in). |
| **Role akses** | `SUPERVISOR`                                          |

---

## 8. Certificate Module — prefix `/certificates`

File: [`be/src/routes/certificateRoutes.ts`](be/src/routes/certificateRoutes.ts)

### 8.1 `GET /certificates/verify/:verificationCode`

|                |                                                                   |
| -------------- | ----------------------------------------------------------------- |
| **Deskripsi**  | Verifikasi keaslian sertifikat via kode verifikasi (tanpa login). |
| **Role akses** | **Public**                                                        |

### 8.2 `GET /certificates/me`

|                |                                                   |
| -------------- | ------------------------------------------------- |
| **Deskripsi**  | Mengembalikan sertifikat milik INTERN yang login. |
| **Role akses** | `INTERN`                                          |

### 8.3 `POST /certificates/generate`

|                |                                                          |
| -------------- | -------------------------------------------------------- |
| **Deskripsi**  | Membuat/menerbitkan sertifikat untuk intern. Idempotent. |
| **Role akses** | `HR_ADMIN`                                               |

### 8.4 `GET /certificates/:certificateId/download`

|                |                                              |
| -------------- | -------------------------------------------- |
| **Deskripsi**  | Mengunduh file sertifikat (PDF).             |
| **Role akses** | `INTERN` (pemilik), `HR_ADMIN`, `SUPERVISOR` |

### 8.5 `GET /certificates/:certificateId`

|                |                                              |
| -------------- | -------------------------------------------- |
| **Deskripsi**  | Detail satu sertifikat.                      |
| **Role akses** | `INTERN` (pemilik), `HR_ADMIN`, `SUPERVISOR` |

### 8.6 `POST /certificates/:certificateId/regenerate`

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Deskripsi**  | Membuat ulang sertifikat (misal: data berubah / PDF rusak). |
| **Role akses** | `HR_ADMIN`                                                  |

---

## 9. Notification Module — prefix `/notifications`

File: [`be/src/routes/notificationRoutes.ts`](be/src/routes/notificationRoutes.ts)

### 9.1 `GET /notifications`

|                |                                                                     |
| -------------- | ------------------------------------------------------------------- |
| **Deskripsi**  | Daftar notifikasi milik user yang login (dengan pagination/filter). |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST`                  |

### 9.2 `GET /notifications/unread-count`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Jumlah notifikasi belum dibaca.                    |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST` |

### 9.3 `PATCH /notifications/read-all`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Menandai semua notifikasi sebagai sudah dibaca.    |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST` |

### 9.4 `POST /notifications/send`

|                |                                            |
| -------------- | ------------------------------------------ |
| **Deskripsi**  | Mengirim notifikasi ke satu/beberapa user. |
| **Role akses** | `HR_ADMIN`                                 |

### 9.5 `GET /notifications/:notificationId`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Detail satu notifikasi milik user yang login.      |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST` |

### 9.6 `PATCH /notifications/:notificationId/read`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Menandai satu notifikasi sebagai sudah dibaca.     |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST` |

### 9.7 `DELETE /notifications/:notificationId`

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Deskripsi**  | Menghapus satu notifikasi milik user yang login.   |
| **Role akses** | `INTERN`, `HR_ADMIN`, `SUPERVISOR`, `RECEPTIONIST` |

---

## 10. Department Module — prefix `/departments`

File: [`be/src/routes/departmentRoutes.ts`](be/src/routes/departmentRoutes.ts)

### 10.1 `GET /departments`

|                |                                                                |
| -------------- | -------------------------------------------------------------- |
| **Deskripsi**  | Daftar departemen dengan pagination, pencarian, filter status. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`                                       |

### 10.2 `GET /departments/:departmentId`

|                |                                        |
| -------------- | -------------------------------------- |
| **Deskripsi**  | Detail satu departemen berdasarkan ID. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`               |

### 10.3 `POST /departments`

|                |                                            |
| -------------- | ------------------------------------------ |
| **Deskripsi**  | Membuat departemen baru (kode harus unik). |
| **Role akses** | `HR_ADMIN`                                 |

### 10.4 `PATCH /departments/:departmentId`

|                |                              |
| -------------- | ---------------------------- |
| **Deskripsi**  | Memperbarui data departemen. |
| **Role akses** | `HR_ADMIN`                   |

### 10.5 `DELETE /departments/:departmentId`

|                |                                                                 |
| -------------- | --------------------------------------------------------------- |
| **Deskripsi**  | Menonaktifkan departemen (soft delete via `is_active = false`). |
| **Role akses** | `HR_ADMIN`                                                      |

---

## 11. Office Module — prefix `/offices`

File: [`be/src/routes/officeRoutes.ts`](be/src/routes/officeRoutes.ts)

### 11.1 `GET /offices`

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| **Deskripsi**  | Daftar lokasi kantor dengan pagination, pencarian, filter departemen. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`                                              |

### 11.2 `GET /offices/:officeId`

|                |                                           |
| -------------- | ----------------------------------------- |
| **Deskripsi**  | Detail satu lokasi kantor berdasarkan ID. |
| **Role akses** | `HR_ADMIN`, `SUPERVISOR`                  |

### 11.3 `POST /offices`

|                |                                                                                 |
| -------------- | ------------------------------------------------------------------------------- |
| **Deskripsi**  | Membuat lokasi kantor beserta koordinat geofence (latitude, longitude, radius). |
| **Role akses** | `HR_ADMIN`                                                                      |

### 11.4 `PATCH /offices/:officeId`

|                |                                 |
| -------------- | ------------------------------- |
| **Deskripsi**  | Memperbarui data lokasi kantor. |
| **Role akses** | `HR_ADMIN`                      |

### 11.5 `DELETE /offices/:officeId`

|                |                                         |
| -------------- | --------------------------------------- |
| **Deskripsi**  | Menghapus lokasi kantor berdasarkan ID. |
| **Role akses** | `HR_ADMIN`                              |

---

## 12. Supervisor Module — prefix `/supervisors`

File: [`be/src/routes/supervisorRoutes.ts`](be/src/routes/supervisorRoutes.ts)

### 12.1 `GET /supervisors/dashboard`

|                |                                                               |
| -------------- | ------------------------------------------------------------- |
| **Deskripsi**  | Ringkasan dashboard supervisor (intern yang dibimbing, dll.). |
| **Role akses** | `SUPERVISOR`                                                  |

### 12.2 `GET /supervisors`

|                |                                             |
| -------------- | ------------------------------------------- |
| **Deskripsi**  | Daftar supervisor dengan pagination/filter. |
| **Role akses** | `HR_ADMIN`                                  |

### 12.3 `GET /supervisors/:supervisorId`

|                |                         |
| -------------- | ----------------------- |
| **Deskripsi**  | Detail satu supervisor. |
| **Role akses** | `HR_ADMIN`              |

### 12.4 `POST /supervisors/:supervisorId/assign`

|                |                                           |
| -------------- | ----------------------------------------- |
| **Deskripsi**  | Menetapkan intern ke supervisor tertentu. |
| **Role akses** | `HR_ADMIN`                                |

### 12.5 `DELETE /supervisors/:supervisorId/assignments/:assignmentId`

|                |                                             |
| -------------- | ------------------------------------------- |
| **Deskripsi**  | Menghapus penugasan intern dari supervisor. |
| **Role akses** | `HR_ADMIN`                                  |

---

## 13. Reporting Module — prefix `/reports`

File: [`be/src/routes/reportingRoutes.ts`](be/src/routes/reportingRoutes.ts)

### 13.1 `GET /reports/attendance`

|                |                                                          |
| -------------- | -------------------------------------------------------- |
| **Deskripsi**  | Laporan data absensi (dengan filter periode/departemen). |
| **Role akses** | `HR_ADMIN`                                               |

### 13.2 `GET /reports/internships`

|                |                          |
| -------------- | ------------------------ |
| **Deskripsi**  | Laporan data internship. |
| **Role akses** | `HR_ADMIN`               |

### 13.3 `GET /reports/certificates`

|                |                          |
| -------------- | ------------------------ |
| **Deskripsi**  | Laporan data sertifikat. |
| **Role akses** | `HR_ADMIN`               |

### 13.4 `GET /reports/dashboard`

|                |                                       |
| -------------- | ------------------------------------- |
| **Deskripsi**  | Ringkasan laporan untuk dashboard HR. |
| **Role akses** | `HR_ADMIN`                            |

---

## 14. Audit Log Module — prefix `/audit-logs`

File: [`be/src/routes/auditLogRoutes.ts`](be/src/routes/auditLogRoutes.ts)

### 14.1 `GET /audit-logs`

|                |                                                                |
| -------------- | -------------------------------------------------------------- |
| **Deskripsi**  | Daftar seluruh audit log aktivitas sistem (pagination/filter). |
| **Role akses** | `HR_ADMIN`                                                     |

### 14.2 `GET /audit-logs/users/:userId`

|                |                                              |
| -------------- | -------------------------------------------- |
| **Deskripsi**  | Riwayat aktivitas (audit log) satu pengguna. |
| **Role akses** | `HR_ADMIN`                                   |

### 14.3 `GET /audit-logs/:auditId`

|                |                        |
| -------------- | ---------------------- |
| **Deskripsi**  | Detail satu audit log. |
| **Role akses** | `HR_ADMIN`             |

---

## 15. Dashboard Module — endpoint dipisah per role

File: [`be/src/routes/dashboardRoutes.ts`](be/src/routes/dashboardRoutes.ts)

> Setiap role memiliki **namespace endpoint sendiri** dan tidak berbagi prefix `/dashboard`. Nama namespace disamakan dengan folder rute frontend `(private)/<ROLE>/dashboard`.

### 15.1 `GET /intern/dashboard`

|                |                                                                                     |
| -------------- | ----------------------------------------------------------------------------------- |
| **Deskripsi**  | Data dashboard INTERN: status internship, absensi hari ini, notifikasi, sertifikat. |
| **Role akses** | `INTERN`                                                                            |

### 15.2 `GET /hr-admin/dashboard`

|                |                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Deskripsi**  | Data dashboard HR_ADMIN: total intern, intern aktif, total departemen, total lokasi kantor. |
| **Role akses** | `HR_ADMIN`                                                                                  |

### 15.3 `GET /supervisor/dashboard`

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| **Deskripsi**  | Data dashboard SUPERVISOR: intern yang dibimbing, kehadiran hari ini, dll. |
| **Role akses** | `SUPERVISOR`                                                               |

### 15.4 `GET /hr-admin/dashboard/statistics`

|                |                                                                           |
| -------------- | ------------------------------------------------------------------------- |
| **Deskripsi**  | Statistik tambahan untuk dashboard HR (jumlah aplikasi, kelulusan, dll.). |
| **Role akses** | `HR_ADMIN`                                                                |

### 15.5 `GET /hr-admin/dashboard/charts`

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Deskripsi**  | Data grafik dashboard HR (tren kehadiran, tren internship, distribusi departemen). |
| **Role akses** | `HR_ADMIN`                                                                         |

### 15.6 `GET /hr-admin/dashboard/recent-activities`

|                |                                                                 |
| -------------- | --------------------------------------------------------------- |
| **Deskripsi**  | Aktivitas terbaru di sistem untuk dashboard HR (query `limit`). |
| **Role akses** | `HR_ADMIN`                                                      |

---

## Catatan Teknis

- Registrasi router global: [`be/src/routes/apiRoutes.ts`](be/src/routes/apiRoutes.ts:34) — semua modul di-mount ke prefix `/api/v1` dan dilindungi middleware `InternalApiKey`.
- Middleware autentikasi & otorisasi: [`be/src/middlewares/auth.ts`](be/src/middlewares/auth.ts) (`verifyToken`, `requireRole`).
- Middleware rate limit: [`be/src/middlewares/rateLimit.ts`](be/src/middlewares/rateLimit.ts) (dipakai pada login, register, magic link, forgot password, upload, check-in/out).
- Middleware idempotency: [`be/src/middlewares/idempotency.ts`](be/src/middlewares/idempotency.ts) (dipakai pada approve/reject aplikasi, finish internship, generate sertifikat, check-in/out).
- Spesifikasi API lengkap (request/response/error): [`docs/07-api-specification.md`](docs/07-api-specification.md).
