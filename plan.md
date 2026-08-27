# PLAN IMPLEMENTASI SIMAD: INTEGRASI ENDPOINT & FITUR TERSEDIA PADA FRONTEND

> **Dokumen Plan Master Implementation FE**
> **Project:** SIMAD (Sistem Informasi Manajemen Magang & Absensi Digital)
> **Tanggal:** 27 Agustus 2026

---

## 1. Executive Summary & Ringkasan Hasil Analisis

Berdasarkan analisis menyeluruh terhadap dokumentasi (`docs/`), backend API (`be/`), dan struktur frontend (`fe/`), SIMAD memiliki fondasi arsitektur yang sangat solid:
1. **Backend (`be`)**: Memiliki 17 router utama dengan lebih dari 60 REST API endpoint lengkap, melingkupi seluruh siklus magang (Auth, User, Department, Office, Institution, Application, Internship, Attendance, Certificate, Notification, Supervisor, Reporting, AuditLog, Dashboard, File).
2. **Frontend (`fe`)**: Menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Query**, dan **Atomic Design** dengan pola arsitektur `_container` (Orchestration Layer).

Meskipun sebagian besar halaman dasar sudah dibuat, ditemukan **gap signifikan** antara endpoint/fitur backend yang sudah siap dengan fitur yang telah terintegrasi di UI Frontend.

Dokumen `plan.md` ini disusun untuk menjadi **panduan langkah demi langkah (roadmap)** dalam menyelesaikan seluruh endpoint dan fitur yang belum terpakai pada Frontend SIMAD, mengikuti konvensi dan pola desain yang sudah berlaku di dalam codebase.

---

## 2. Matrix Gap Analysis: Endpoint & Fitur Backend yang Belum Terpakai di FE

| Modul | Endpoint / Fitur Backend | Status di FE | Temuan & Tindakan Pembentukan UI / Integration |
|---|---|---|---|
| **Notification** | `useNotification` Facade Hook | ❌ Unlinked | `useNotification` sudah ada di `fe/src/hooks/useService/notification`, tetapi **belum diekspor di `useApi()`** (`fe/src/hooks/useService/useApi.ts`). Harus diekspor agar seragam. |
| **Notification** | `POST /notifications/send` | ⚠️ No UI | HR Admin belum memiliki modal/halaman untuk **mengirim notifikasi siaran (broadcast)** atau notifikasi khusus ke Intern/Supervisor. |
| **Auth / Session** | `GET /auth/sessions`<br>`DELETE /auth/sessions/:sessionId`<br>`POST /auth/logout-all` | ⚠️ Service Ready, No UI | Endpoint manajemen sesi aktif (Active Devices / Sessions) sudah siap di service & hook, tetapi **belum ada UI daftar perangkat aktif & tombol revoke sesi** di halaman Profil/Pengaturan. |
| **Auth / Email** | `PATCH /auth/change-email`<br>`POST /auth/change-email/verify` | ⚠️ Service Ready, No UI | Pengajuan ubah email dan verifikasi token email baru belum memiliki form/modal di UI Profil. |
| **Internship** | `PATCH /internships/:id/start`<br>`PATCH /internships/:id/finish`<br>`PATCH /internships/:id/extend`<br>`PATCH /internships/:id/assign-supervisor`<br>`PATCH /internships/:id/change-department`<br>`PATCH /internships/:id/archive` | ⚠️ Service Ready, No UI Action | Halaman `/HR_ADMIN/internships` saat ini **hanya menampilkan tabel & filter**, belum memiliki aksi interaktif (start, finish, perpanjang masa magang, ganti supervisor, ganti departemen, arsip magang). |
| **Certificate** | `POST /certificates/generate`<br>`POST /certificates/:id/regenerate` | ⚠️ Service Ready, No UI Action | HR Admin belum memiliki UI tombol/modal aksi untuk **menerbitkan (generate) sertifikat digital** bagi peserta yang sudah tamat magang, maupun meregenerasi sertifikat. |
| **Certificate** | Pengaturan Sertifikat | ⚠️ Mock Implementation | Container `/HR_ADMIN/certificate-setting` masih menggunakan `setTimeout` tiruan (mock), belum terintegrasi ke alur sertifikat sistem. |
| **Attendance** | `GET /attendance/export` | ⚠️ Service Ready, No UI Action | Fitur ekspor data absensi ke format Excel/CSV belum dihubungkan dengan tombol "Export" pada Laporan HR Admin & Supervisor. |
| **Attendance** | List Absensi Supervisor | ❌ Missing Route Page | Halaman `/SUPERVISOR/attendance` belum memiliki file `page.tsx` & `_containers` untuk menampilkan **daftar absensi harian seluruh peserta bimbingan**. (Baru ada `[attendanceId]` detail page). |
| **Audit Log** | `GET /audit-logs/users/:userId` | ⚠️ Service Ready, No UI | Audit log aktivitas spesifik pengguna belum ada tombol pemicunya pada tabel user/profile di HR Admin. |
| **Application** | `DELETE /applications/:id` | ⚠️ Service Ready, No UI Action | Tombol hapus draf pengajuan pada dashboard Intern belum terhubung ke API `deleteDraft`. |

---

## 3. Standard Pattern & Frontend Architecture Rules

Dalam mengimplementasikan seluruh fitur di atas, **WAJIB** mematuhi arsitektur yang sudah berjalan di SIMAD:

### 3.1 Flow Arsitektur Komponen
```text
App Router (page.tsx)
       │
       ▼
_containers/ (Orchestration Layer: Hooks, State, TanStack Query, Alerts, Routing)
       │
       ▼
components/page/ (Section Layer: Layout composition, Tab/Modal state passing)
       │
       ▼
components/organisms/ (Domain UI: Form, Table, Card, Dialog)
       │
       ▼
components/atoms/ (Primitive UI: Button, Input, Badge, Dialog Primitive)
```

### 3.2 Aturan Utama Implementation Pattern
1. **Zero Direct Fetch in UI**: Halaman (`page.tsx`) dan Organism tidak boleh melakukan `fetch` atau `axios` langsung.
2. **Single Entry Hook (`useApi()`)**: Semua panggilan API dilakukan via `const api = useApi();` di dalam `_container`.
3. **Organism Pure Presentation**: Organism menerima props `state` dan `actions` dari Container/Section.
4. **SweetAlert / Toast Handling**: Gunakan `useAppNameSpace().alert` atau `toast` untuk konfirmasi aksi bermutasi (Delete, Start, Finish, Approve, Reject).

---

## 4. Phase-by-Phase Actionable Implementation Roadmap

---

### 🔹 PHASE 1: Infrastructure & Facade Alignment (Prioritas Utama)

#### Objective:
Merapikan penyedia API tunggal `useApi` dan memastikan semua hook modul siap digunakan oleh container.

#### Steps:
1. **Ekspor Modul Notification di `useApi.ts`**:
   - File: `fe/src/hooks/useService/useApi.ts`
   - Tambahkan `notification: useNotification()` pada return object `useApi()`.
2. **Verifikasi Query Keys & Invalidation**:
   - Pastikan `queryClient.invalidateQueries()` dipanggil pada setiap pemicu mutasi (misal: saat generate certificate, query list certificate & internship otomatis di-refresh).

---

### 🔹 PHASE 2: Auth & Session Management Feature (Profile Settings)

#### Objective:
Melengkapi fitur keamanan pengguna di halaman `/HR_ADMIN/profile`, `/INTERN/profile`, dan `/SUPERVISOR/profile`.

#### Steps:
1. **Komponen Organism Perangkat Aktif (`ActiveSessionsCard.tsx`)**:
   - File: `fe/src/components/organisms/profile/ActiveSessionsCard.tsx`
   - Menampilkan daftar perangkat (browser, IP, last active, current session indicator).
   - Tombol "Akhiri Sesi Ini" & "Keluar dari Semua Perangkat Lain".
2. **Komponen Modal Form Ubah Email (`ChangeEmailModal.tsx`)**:
   - File: `fe/src/components/organisms/profile/ChangeEmailModal.tsx`
   - Form memasukkan email baru & password saat ini.
   - Modal konfirmasi masukan token verifikasi email (`POST /auth/change-email/verify`).
3. **Update Profile Container**:
   - Tambahkan integrasi `api.auth.query.sessions()`, `api.auth.mutate.deleteSession()`, `api.auth.mutate.logoutAll()`, `api.auth.mutate.changeEmail()`, dan `api.auth.mutate.changeEmailVerify()`.

---

### 🔹 PHASE 3: Internship Lifecycle & Control Actions (HR Admin)

#### Objective:
Mengubah halaman `/HR_ADMIN/internships` dari sekadar tabel pasif menjadi **Pusat Kontrol Magang (Internship Control Center)**.

#### Steps:
1. **Buat Organism Modal Aksi Magang (`InternshipActionModals.tsx`)**:
   - Modal **Start Internship** (Konfirmasi mulai magang).
   - Modal **Finish Internship** (Konfirmasi selesaikan magang & alur ke penerbitan sertifikat).
   - Modal **Extend Internship** (Input tanggal akhir baru & alasan perpanjangan).
   - Modal **Change Department & Office** (Dropdown pilih departemen & lokasi kantor baru).
   - Modal **Assign/Change Supervisor** (Dropdown pilih supervisor bimbingan).
   - Modal **Archive Internship** (Konfirmasi pengarsipan data).
2. **Update `HrInternshipsContainer` (`fe/src/app/(private)/HR_ADMIN/internships/_containers/internships.tsx`)**:
   - Hubungkan mutasi API: `api.internship.mutate.start`, `finish`, `extend`, `changeDepartment`, `assignSupervisor`, `archive`.
   - Salurkan aksi ke `InternshipsSection.tsx` untuk dirender sebagai dropdown menu "Aksi" pada setiap baris tabel magang.

---

### 🔹 PHASE 4: Digital Certificate Generation & Settings (HR Admin)

#### Objective:
Mengintegrasikan penerbitan sertifikat digital aktual dan perbaikan pengaturan sertifikat.

#### Steps:
1. **Modal Terbitkan Sertifikat (`GenerateCertificateModal.tsx`)**:
   - File: `fe/src/components/organisms/certificate/GenerateCertificateModal.tsx`
   - Form nomor sertifikat, tanggal terbit, nilai/predikat magang, dan penandatangan.
   - Panggilan API: `api.certificate.mutate.generate()`.
2. **Integrasi Aksi Regenerate Sertifikat**:
   - Pada tabel/detail sertifikat, sediakan tombol "Regenerate Certificate" (`api.certificate.mutate.regenerate()`).
3. **Perbaiki `CertificateSettingContainer` (`fe/src/app/(private)/HR_ADMIN/certificate-setting/_containers/certificate-setting.tsx`)**:
   - Ganti logika mock `setTimeout` dengan penyimpanan konfigurasi penandatangan via API file upload / setting backend.

---

### 🔹 PHASE 5: Supervisor Attendance Overview & Export Feature

#### Objective:
Melengkapi modul absensi supervisor dan fitur ekspor laporan absensi.

#### Steps:
1. **Buat Halaman Overview Absensi Supervisor (`/SUPERVISOR/attendance/page.tsx`)**:
   - File Route: `fe/src/app/(private)/SUPERVISOR/attendance/page.tsx`
   - File Container: `fe/src/app/(private)/SUPERVISOR/attendance/_containers/attendance.tsx`
   - Menampilkan rekap harian absensi seluruh anak bimbingan (Present, Late, Absent, Override) dengan fitur filter tanggal.
2. **Integrasi Fitur Export Absensi (`GET /attendance/export`)**:
   - Pada `HrReportsContainer` dan `SupervisorAttendanceContainer`, tambahkan handler `handleExportAttendance(params: { startDate, endDate, format })`.
   - Unduh file blob CSV/Excel secara otomatis di browser via `api.attendance.query.export()`.

---

### 🔹 PHASE 6: Admin Notification Broadcast & Audit Log User Filter

#### Objective:
Memberikan HR Admin kemampuan mengirim pengumuman/notifikasi siaran dan melacak log per pengguna.

#### Steps:
1. **Modal Kirim Notifikasi Siaran (`SendNotificationModal.tsx`)**:
   - File: `fe/src/components/organisms/notification/SendNotificationModal.tsx`
   - Form tipe notifikasi (INFO, WARNING, ANNOUNCEMENT), Judul, Pesan, Target (Semua User, Semua Intern, Semua Supervisor, atau Pilih User spesifik).
   - Dipicu via tombol "+ Kirim Pengumuman" di Header Topbar / Dashboard HR Admin.
   - Panggilan API: `api.notification.mutate.send()`.
2. **Integrasi Audit Log Per User**:
   - Di tabel daftar user / supervisor / intern di HR Admin, tambahkan aksi "Lihat Log Aktivitas" yang memicu modal `UserAuditLogModal.tsx` memanggil `api.auditLog.query.userActivity({ userId })`.

---

### 🔹 PHASE 7: Intern Application Action Refinements

#### Objective:
Memberikan kontrol penuh kepada Intern atas draf & pengajuan magang yang telah dibuat.

#### Steps:
1. **Tombol Hapus Draf (`DELETE /applications/:id`)**:
   - Pada card/tabel pengajuan di `INTERN/application`, jika status == `DRAFT`, tampilkan tombol "Hapus Draf" dengan konfirmasi alert.
2. **Tombol Batalkan Pengajuan (`POST /applications/:id/cancel`)**:
   - Jika status == `SUBMITTED` / `UNDER_REVIEW`, sediakan tombol "Batalkan Pengajuan" sebelum diproses oleh HR.

---

## 5. Matriks Verifikasi & Kriteria Keberhasilan (Quality Checklist)

Setiap implementasi fitur harus lulus kriteria keberhasilan berikut:

- [ ] **Type Safety**: Tidak ada `any` baru yang tidak terdokumentasi; semua payload menggunakan DTO/Type dari `@/types/api/*`.
- [ ] **Container Pattern Compliance**: Seluruh logic fetch & state mutasi berada di file `_containers/*.tsx`.
- [ ] **User Feedback**: Semua operasi asinkron (mutasi) menampilkan loading spinner, toast sukses/gagal, dan SweetAlert konfirmasi untuk aksi destruktif.
- [ ] **Responsive & Mobile Friendly**: Komponen modal, tabel, dan form dapat diakses dengan baik di tampilan desktop maupun mobile (PWA Ready).
- [ ] **Clean Lint & Build**: Bebas dari linting error (`bun run lint` / `biome check`).
