# Prompt — Seed Master Education Level & Institution

Saya ingin melakukan **seeding master data `EducationLevel` dan `Institution` menggunakan Prisma**.

Gunakan schema Prisma yang sudah tersedia:

```prisma
model EducationLevel {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code      String?   @unique @db.VarChar(20)
  name      String?   @db.VarChar(100)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamp(6)

  institutions Institution[]

  @@map("education_levels")
}

model Institution {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  educationLevelId String?   @map("education_level_id") @db.Uuid
  name             String?   @db.VarChar(200)
  shortName        String?   @map("short_name") @db.VarChar(100)
  province         String?   @db.VarChar(100)
  city             String?   @db.VarChar(100)
  createdAt        DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt        DateTime? @updatedAt @map("updated_at") @db.Timestamp(6)

  educationLevel    EducationLevel?    @relation(fields: [educationLevelId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  institutionMajors InstitutionMajor[]
  internProfiles    InternProfile[]

  @@index([educationLevelId])
  @@map("institutions")
}
```

## Tujuan

Buat seed master data berikut:

### Education Level

Gunakan tepat 3 education level:

```text
SMA
SMK
UNIVERSITAS
```

Dengan nama:

```text
SMA          → Sekolah Menengah Atas
SMK          → Sekolah Menengah Kejuruan
UNIVERSITAS  → Universitas
```

---

# Institution Data

## UNIVERSITAS

Masukkan:

1. Universitas Syiah Kuala
2. Universitas Islam Negeri Ar-Raniry

Gunakan:

```text
province = "Aceh"
city     = "Banda Aceh"
```

Gunakan `shortName` yang wajar:

```text
Universitas Syiah Kuala
shortName = "USK"

Universitas Islam Negeri Ar-Raniry
shortName = "UIN Ar-Raniry"
```

---

# SMA / MA

Semua sekolah berikut dimasukkan ke `EducationLevel` dengan code:

```text
SMA
```

Untuk setiap institution:

```text
province = "Aceh"
city     = "Banda Aceh"
```

Masukkan data berikut.

## Madrasah Aliyah Negeri

1. MA Negeri 2 Banda Aceh
2. MA Negeri Model
3. MA Negeri Rukoh Banda Aceh

---

## Madrasah Aliyah Swasta

4. MA Swasta Babun Najah Banda Aceh
5. MA Swasta Darul 'Ulum Banda Aceh
6. MA Swasta Darussyari'ah Banda Aceh
7. MA Swasta Ulumul Qur'an Banda Aceh

---

# SMA Negeri

8. SMA Negeri 1 Banda Aceh
9. SMA Negeri 2 Banda Aceh
10. SMA Negeri 3 Banda Aceh
11. SMA Negeri 4 Banda Aceh
12. SMA Negeri 5 Banda Aceh
13. SMA Negeri 6 Banda Aceh
14. SMA Negeri 7 Banda Aceh
15. SMA Negeri 8 Banda Aceh
16. SMA Negeri 9 Banda Aceh
17. SMA Negeri 10 Fajar Harapan
18. SMA Negeri 11 Banda Aceh
19. SMA Negeri 12 Banda Aceh
20. SMA Negeri 13 Banda Aceh
21. SMA Negeri 14 Banda Aceh
22. SMA Negeri 15 Adidarma Banda Aceh
23. SMAN 16 Banda Aceh

---

# SMA Swasta

24. SMAS Al-Mishbah
25. SMAS Cut Mutia Banda Aceh
26. SMAS Fatih Bilingual School
27. SMAS Granada PGRI Banda Aceh
28. SMAS Inshafuddin
29. SMAS Kartika XIV Banda Aceh
30. SMAS Katolik
31. SMAS Laboratorium Unsyiah
32. SMAS Methodist
33. SMAS Muhammadiyah 1 Banda Aceh
34. SMAS Safiafuddin
35. SMAS Teuku Nyak Arief
36. SMAS Teuku Nyak Arif Fatih Bilingual School

---

# Important Implementation Requirements

## 1. Idempotent Seed

Seed **harus idempotent**.

Jika command seed dijalankan berkali-kali:

```bash
npx prisma db seed
```

tidak boleh menghasilkan duplicate data.

Gunakan:

```typescript
upsert;
```

atau mekanisme lain yang aman terhadap duplicate.

---

## 2. EducationLevel Harus Dibuat Terlebih Dahulu

Urutan:

```text
EducationLevel
      ↓
Institution
```

Jangan membuat institution sebelum education level tersedia.

Ambil `id` dari education level berdasarkan `code`.

Contoh konsep:

```typescript
const sma = await prisma.educationLevel.upsert({
  where: {
    code: "SMA",
  },
  update: {},
  create: {
    code: "SMA",
    name: "Sekolah Menengah Atas",
  },
});
```

Kemudian gunakan `sma.id` untuk institution.

---

## 3. Institution Upsert

Karena model `Institution` saat ini belum memiliki field `code` atau unique constraint berdasarkan nama, jangan membuat duplicate ketika seed dijalankan berulang.

Gunakan strategi yang sesuai dengan Prisma schema yang tersedia.

Jika diperlukan, **jangan mengubah schema hanya untuk seed tanpa alasan**. Jika memang membutuhkan unique constraint untuk menjaga integritas data, jelaskan terlebih dahulu perubahan schema yang diperlukan.

---

## 4. Address

Perhatikan bahwa schema `Institution` **tidak memiliki field `address`**.

Karena itu jangan menambahkan field baru secara diam-diam.

Untuk sementara gunakan:

```text
name
shortName
province
city
```

dan **jangan menyimpan alamat sekolah** ke field lain secara paksa.

---

## 5. Short Name

Gunakan short name hanya jika memang jelas.

Contoh:

```text
Universitas Syiah Kuala
→ USK

Universitas Islam Negeri Ar-Raniry
→ UIN Ar-Raniry
```

Untuk sekolah, gunakan short name yang wajar seperti:

```text
SMA Negeri 1 Banda Aceh
→ SMAN 1 Banda Aceh
```

Tetapi jangan membuat abbreviation yang tidak umum hanya untuk memenuhi field.

---

# Expected Result

Setelah seed selesai:

```text
EducationLevel
├── SMA
│   ├── MA Negeri 2 Banda Aceh
│   ├── MA Negeri Model
│   ├── MA Negeri Rukoh Banda Aceh
│   ├── MA Swasta Babun Najah Banda Aceh
│   ├── ...
│   └── SMAS Teuku Nyak Arif Fatih Bilingual School
│
├── SMK
│   └── (belum ada institution)
│
└── UNIVERSITAS
    ├── Universitas Syiah Kuala
    └── Universitas Islam Negeri Ar-Raniry
```

Total data:

```text
Education Levels : 3
Universities     : 2
SMA / MA         : 29
--------------------------------
Institutions     : 31
```

Pastikan jumlah aktual sesuai dengan data yang dimasukkan.

---

# Seed File

Buat atau sesuaikan file Prisma seed yang digunakan oleh project, misalnya:

```text
prisma/seed.ts
```

Ikuti konfigurasi Prisma yang sudah digunakan project dan jangan membuat mekanisme seed kedua jika project sudah memiliki seed entry point.

Setelah implementasi selesai, jalankan:

```bash
npx prisma db seed
```

Kemudian lakukan verifikasi bahwa:

1. `SMA`, `SMK`, dan `UNIVERSITAS` tersedia.
2. Universitas Syiah Kuala terhubung ke `UNIVERSITAS`.
3. UIN Ar-Raniry terhubung ke `UNIVERSITAS`.
4. Seluruh sekolah terhubung ke `SMA`.
5. Tidak ada duplicate ketika seed dijalankan dua kali.
6. Tidak ada institution yang memiliki `educationLevelId` null untuk data seed ini.
7. Tidak ada perubahan schema yang tidak diperlukan.

Jangan mengubah model Prisma lain di luar kebutuhan seed ini.
