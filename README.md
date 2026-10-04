<p align="center">
  <img src="fe/public/images/logos.png" alt="Logo PT PLN (Persero)" width="130" />
</p>

<h1 align="center">⚡ SIMAD (Sistem Informasi Manajemen Magang & Administrasi Diklat)</h1>

<p align="center">
  <strong>Platform Terpadu Digitalisasi Siklus Magang & Presensi Geofencing PT PLN (Persero)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.2+-f472b6?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Next.js-16_Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Elysia.js-1.4+-7c3aed?style=for-the-badge&logo=elysia&logoColor=white" alt="Elysia.js" />
  <img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📌 1. Tentang SIMAD

**SIMAD (Sistem Informasi Manajemen Magang & Administrasi Diklat)** adalah sistem platform terpadu berbasis web yang dikembangkan untuk mendigitalisasi keseluruhan siklus tata kelola program kerja praktik dan magang di lingkungan **PT PLN (Persero)**. 

Sebelum adanya SIMAD, proses magang berjalan secara manual: dokumen surat pengantar fisik, pencatatan absensi di atas kertas/spreadsheet tanpa validasi lokasi, alokasi kuota yang rawan bentrok (*overbooking*), hingga pembuatan sertifikat fisik yang rentan kesalahan penulisan. 

SIMAD hadir sebagai solusi transformasi digital BUMN yang menghadirkan:
- **Transparansi & Akurasi:** Presensi kehadiran tervalidasi radius GPS (*Geofencing*) kantor unit PLN dan batas waktu jam kerja presisi.
- **Efisiensi Administratif:** Otomatisasi verifikasi pengajuan, alokasi kuota per kantor dan departemen dengan *concurrency protection*, penilaian performa peserta, hingga penerbitan e-sertifikat digital ber-QR Code.
- **Monitoring Terpusat & Real-Time:** Dashboard interaktif untuk HR Admin dan Supervisor guna memantau sebaran peserta aktif, rekapitulasi absensi harian, dan evaluasi berkala.

---

## 🚀 2. Alur Siklus Magang (End-to-End Workflow)

```mermaid
flowchart TD
    A([Calon Peserta / Mahasiswa]) -->|1. Registrasi & Unggah Berkas| B[Pengajuan Magang Online]
    C([Resepsionis]) -->|2. Verifikasi Fisik / Registrasi Awal| B
    B --> D{Verifikasi Dokumen & Kuota}
    D -->|Ditolak| E([Pengajuan Ditolak])
    D -->|Disetujui HR Admin| F[Alokasi Kantor & Departemen]
    F --> G[Onboarding & Tata Tertib Digital]
    G --> H([Peserta Magang Aktif])
    
    subgraph Masa Pelaksanaan Magang
        H -->|Presensi Harian| I[Presensi Geofencing GPS & Waktu]
        I --> J{Validasi Koordinat & Jam}
        J -->|Radius Sesuai & <= 08:00| K[Status: HADIR]
        J -->|Radius Sesuai & > 08:00| L[Status: TERLAMBAT]
        J -->|Di Luar Radius| M[Presensi Gagal / Koreksi Absen]
        
        H -->|Bimbingan & Logbook| N([Supervisor Lapangan])
        N -->|Review Koreksi Absen| I
        N -->|Evaluasi Berkala & Akhir| O[Form Penilaian Kinerja]
    end
    
    O -->|Kalkulasi Skor Otomatis Grade A-E| P[Approval Nilai HR Admin]
    P --> Q[Penerbitan E-Sertifikat Digital]
    Q --> R([Klaim E-Sertifikat Ber-QR Code])
```

---

## 👥 3. Peran & Hak Akses (Role-Based Access Control)

Sistem mengadopsi prinsip *Least Privilege* dengan 4 tingkatan hak akses:

| Role | Tanggung Jawab Utama | Fitur Kunci |
| :--- | :--- | :--- |
| **HR Admin** | Pengendali master data & kebijakan magang seluruh unit kerja | • Pengaturan kuota kantor & departemen<br>• Verifikasi pengajuan & penempatan peserta<br>• Manajemen akun Supervisor & Resepsionis<br>• Konfigurasi master kantor & titik batas geofence<br>• Approval & penerbitan e-sertifikat<br>• Rekapitulasi laporan absensi & export Excel<br>• Audit trail log sistem |
| **Resepsionis** | Titik pertama penerimaan tamu & berkas calon peserta di unit PLN | • Pengecekan ketersediaan kuota kantor secara *real-time* (*read-only*)<br>• Verifikasi fisik surat pengantar kampus / sekolah<br>• Registrasi awal pengajuan magang *walk-in* |
| **Supervisor** | Pembimbing lapangan di bidang/departemen penempatan | • Monitoring kehadiran harian peserta magang bimbingan<br>• Review & persetujuan pengajuan koreksi presensi<br>• Pengisian evaluasi kinerja & penilaian akhir peserta magang |
| **Intern (Peserta)** | Mahasiswa / siswa yang menjalani program magang | • Pengajuan magang & onboarding tata tertib digital<br>• Presensi harian (*check-in/check-out*) berbasis Geofence radius GPS<br>• Pengajuan izin/sakit & permohonan koreksi absensi<br>• Akses rekap kehadiran pribadi & klaim e-sertifikat |

---

## ⭐ 4. Fitur-Fitur Unggulan

### 📍 1. Presensi Berbasis Geofencing & Jam Disiplin PLN
- **Validasi Jarak GPS Otomatis:** Menggunakan formula *Haversine* untuk menghitung jarak presisi antara perangkat peserta dengan titik koordinat kantor PLN yang dipilih.
- **Standar Waktu Kehadiran:** Presensi *check-in* sebelum atau tepat pukul **08:00:00 WIB** ditandai **HADIR (PRESENT)**; presensi di atas batas jam tersebut otomatis ditandai **TERLAMBAT (LATE)**.
- **Radius Fleksibel:** Toleransi radius meter dapat diatur tersendiri per kantor unit PLN (misal: 100 meter).

### 🗺️ 2. Peta Interaktif & Pencarian Lokasi Cerdas (Map Geocoder)
- **Leaflet & OpenStreetMap:** Peta interaktif penentuan koordinat kantor dengan drag-and-drop pin dan indikator lingkaran geofence.
- **Search Bar Terintegrasi:** Dilengkapi fitur pencarian alamat dan nama tempat otomatis (*autocomplete*) menggunakan geocoding engine serta dukungan pengenalan format koordinat instan (`-5.381234, 105.256789`).
- **Proxy Server-Side Geocoding:** Mencegah masalah CORS dan adblocker dengan *automatic fallback* multi-provider (Photon & Nominatim).

### 🔒 3. Proteksi Alokasi Kuota dengan PostgreSQL Advisory Locks
- Mencegah fenomena *race condition* dan *overbooking* kuota magang ketika banyak pengajuan diproses bersamaan menggunakan **PostgreSQL Transactional Advisory Locks** (`pg_try_advisory_xact_lock`).
- Alokasi kuota kantor secara ketat memvalidasi kapasitas gabungan departemen agar tidak melampaui daya tampung kantor unit.

### 📊 4. Pelaporan Multi-Dimensi & Tag Filter Fleksibel
- Filter instan dengan tombol **"Semua Data (Query All)"** maupun filter bertahap (per Kantor, per Departemen, per Peserta, Bulan, dan Tahun).
- **Tag Pill Status:** Navigasi cepat status presensi (`Semua`, `Hadir`, `Terlambat`, `Izin`, `Sakit`, `Alpha`).
- **Pencarian Real-Time Peserta:** Cari peserta magang secara cepat berdasarkan Nama, NIM, Email, Universitas, atau Supervisor.
- **Export Excel:** Unduh laporan absensi lengkap berformat `.xlsx` untuk kebutuhan arsip dan rekapitulasi HR.

### 📜 5. E-Sertifikat Digital & QR Code Verification
- **Visual Certificate Builder:** Konfigurasi template sertifikat digital langsung dari dashboard HR Admin.
- **Verifikasi Publik:** Setiap sertifikat dilengkapi nomor registrasi unik dan QR Code yang dapat dipindai oleh pihak eksternal untuk membuktikan keaslian dokumen kelulusan magang.

### 🔭 6. Observability & Audit Trail Komprehensif
- Pencatatan seluruh mutasi data sensitif (perubahan kuota, status magang, nilai, user) ke dalam tabel `AuditLog`.
- Terintegrasi penuh dengan stack **OpenTelemetry, Grafana, Loki, Tempo, dan Prometheus** untuk memantau performa HTTP, log traces, dan database query latency.

---

## 🛠️ 5. Teknologi yang Digunakan

### Frontend (`/fe`)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Library UI:** React 19, Radix UI Primitives, Lucide Icons, Sonner Toast
- **Styling:** Tailwind CSS 3.4
- **State & Data Fetching:** TanStack Query (React Query v5)
- **Map & Geolocation:** Leaflet, React-Leaflet
- **Linter & Code Quality:** Biome 1.9

### Backend (`/be`)
- **Runtime:** Bun 1.2+
- **Framework:** Elysia.js 1.4
- **ORM & Database Client:** Prisma ORM 7 (`@prisma/client@7.10.0`, Driver Adapter `@prisma/adapter-pg`, `pg@8.23.1`)
- **Database:** PostgreSQL 17
- **Authentication:** JWT (JSON Web Token), Argon2 / Bcrypt password hashing
- **Tracing & Logging:** OpenTelemetry SDK, Pino Logger
- **Dokumentasi API:** Elysia Swagger / OpenAPI

### Observability & Infrastructure
- **Grafana LGTM Stack:** Grafana Alloy, Loki, Tempo, Prometheus, Grafana Dashboard
- **Containerization:** Docker & Docker Compose

---

## 💻 6. Panduan Menjalankan Proyek (Getting Started)

### Prasyarat Sistem
Pastikan telah terpasang di perangkat Anda:
1. **[Bun](https://bun.sh/)** versi 1.2 atau lebih baru.
2. **[Docker](https://www.docker.com/)** & **Docker Compose**.
3. **Node.js** (opsional, Bun direkomendasikan sebagai engine utama).

---

### Langkah 1: Clone Repositori
```bash
git clone git@github.com:MuliaAndiki/SIMAD-Persero.git
cd SIMAD-Persero
```

---

### Langkah 2: Jalankan Database & Observability (Docker)
Jalankan PostgreSQL dan Grafana stack di background:
```bash
docker compose up -d
```
> Database PostgreSQL akan berjalan pada port `5432` dengan database `simad_db`. Dashboard Grafana dapat diakses pada `http://localhost:3001`.

---

### Langkah 3: Konfigurasi & Jalankan Backend (`be`)

1. Pindah ke direktori backend:
   ```bash
   cd be
   ```

2. Siapkan file environment `.env`:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan `DATABASE_URL` ke database PostgreSQL:*
   ```env
   DATABASE_URL="postgresql://root:rootpassword@localhost:5432/simad_db?schema=public"
   PORT=5000
   JWT_SECRET="rahasia-super-aman-simad-pln"
   ```

3. Pasang dependensi:
   ```bash
   bun install
   ```

4. Generate Prisma 7 Client & Jalankan Migrasi:
   ```bash
   bun run prisma:generate
   bun x prisma migrate deploy
   ```

5. Jalankan Database Seed (Data Awal Kantor, Departemen, & Admin):
   ```bash
   bun run prisma:seed
   ```

6. Jalankan Server Backend:
   ```bash
   bun run dev
   ```
   *Backend Elysia.js akan aktif di `http://localhost:5000`. Dokumentasi Swagger interaktif dapat diakses di `http://localhost:5000/swagger`.*

---

### Langkah 4: Konfigurasi & Jalankan Frontend (`fe`)

1. Buka terminal baru dan pindah ke direktori frontend:
   ```bash
   cd fe
   ```

2. Siapkan file environment `.env`:
   ```bash
   cp .env.example .env
   ```
   *Pastikan URL API backend mengarah ke port backend:*
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```

3. Pasang dependensi:
   ```bash
   bun install
   ```

4. Jalankan Frontend Next.js (Dev Mode):
   ```bash
   bun run dev
   ```
   *Aplikasi web SIMAD dapat langsung diakses melalui browser di `http://localhost:3000`.*

---

## 🧪 7. Pengujian & Validasi Kualitas Kode

Sistem dilengkapi dengan test suite otomatis untuk memvalidasi *business rules*, RBAC, dan integrasi database:

### Backend Testing (Bun Test)
```bash
cd be
bun test
```
*Mencakup pengujian RBAC Security, Aturan Presensi 08:00 WIB, Formula Penilaian Evaluasi (Grade A–E), Alokasi Kuota, serta Driver Adapter PostgreSQL Prisma 7.*

### Frontend Production Build Check
```bash
cd fe
bun run build
```
*Memastikan seluruh 70 rute halaman, komponen TypeScript, dan optimasi Turbopack lulus 100% tanpa error kompilasi.*

---

## 📁 8. Struktur Direktori

```text
SIMAD/
├── be/                         # Backend Service (Elysia.js + Prisma 7)
│   ├── prisma/                 # Schema Prisma, Migrasi SQL, & Seeder Data
│   ├── src/
│   │   ├── controllers/        # Request Handlers & HTTP Responses
│   │   ├── services/           # Logika Bisnis (Attendance, Quota, Auth, dll)
│   │   ├── routes/             # Deklarasi Endpoint REST API
│   │   ├── middlewares/        # Autentikasi JWT & Otorisasi RBAC
│   │   └── tests/              # Test Suite Otomatis (bun test)
│   ├── Dockerfile
│   └── prisma.config.ts        # Konfigurasi Datasource Prisma 7
│
├── fe/                         # Frontend Application (Next.js 16 App Router)
│   ├── public/
│   │   └── images/
│   │       └── logos.png       # Logo Resmi PT PLN (Persero)
│   ├── src/
│   │   ├── app/                # Route Handlers & Halaman (Next.js App Router)
│   │   │   ├── (private)/      # Dashboard HR Admin, Supervisor, Resepsionis, Intern
│   │   │   ├── (public)/       # Halaman Publik, Login, Register, Portal
│   │   │   └── api/            # Internal Next.js API Routes (Geocoding Proxy)
│   │   ├── components/
│   │   │   ├── atoms/          # Komponen Dasar (Button, Input, Badge, Select, dll)
│   │   │   ├── organisms/      # Komponen Kompleks (Peta Leaflet, Tabel, Dialog)
│   │   │   └── page/           # View Section Halaman
│   │   ├── hooks/              # Custom Hooks & TanStack Query Service Facade
│   │   └── types/              # Type Definitions TypeScript
│   └── Dockerfile
│
├── docs/                       # Dokumentasi Analisis Sistem & Spesifikasi API
│   ├── 01-overview.md
│   ├── 04-business-rules.md
│   ├── 06-system-architecture.md
│   └── 07-api-specification.md
│
├── observability/              # Konfigurasi Grafana, Alloy, Loki, Tempo, Prometheus
├── docker-compose.yml          # Orkestrasi Database & Observability Stack
└── README.md                   # Dokumentasi Utama Proyek
```

---

## 🏢 9. Standar Kode & Lisensi

Proyek ini dikembangkan untuk standarisasi operasional dan kepatuhan proses administrasi diklat di lingkungan **PT PLN (Persero)**.

Seluruh hak cipta, merek dagang, dan aset logo merupakan milik **PT PLN (Persero)**.
