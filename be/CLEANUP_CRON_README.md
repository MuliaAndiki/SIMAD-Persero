# Cleanup Cron Job Documentation

## Overview

Sistem cleanup untuk menghapus data user yang sudah dinonaktifkan dan file yang sudah tidak terpakai (orphaned files). 

⚠️ **WARNING**: Operasi ini PERMANEN dan tidak bisa di-undo!

## Endpoints

### 1. Preview Inactive Users (Safe)

**GET** `/api/cron/cleanup/preview?gracePeriod=30`

Preview list user yang eligible untuk dihapus tanpa menghapus data.

**Query Parameters:**
- `gracePeriod` (optional, default: 30): Jumlah hari grace period

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "User Name",
        "isActive": false,
        "deletedAt": "2024-01-01T00:00:00.000Z",
        "daysSinceInactive": 45
      }
    ]
  },
  "message": "Found 5 inactive users eligible for deletion."
}
```

**Usage:**
```bash
# Preview users yang akan dihapus dengan grace period 30 hari
curl -X GET "http://localhost:3000/api/cron/cleanup/preview?gracePeriod=30"

# Preview dengan grace period 60 hari
curl -X GET "http://localhost:3000/api/cron/cleanup/preview?gracePeriod=60"
```

---

### 2. Delete Inactive Users (PERMANENT!)

**POST** `/api/cron/cleanup/users?gracePeriod=30`

Hapus user yang sudah dinonaktifkan secara permanen.

⚠️ **CRITICAL**: 
- Operasi ini TIDAK BISA DI-UNDO
- Semua data terkait user akan dihapus
- Selalu gunakan `/cleanup/preview` terlebih dahulu!

**Query Parameters:**
- `gracePeriod` (optional, default: 30): Jumlah hari grace period

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "deletedUsers": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "deletedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Cleanup completed. Deleted 5 inactive users."
}
```

**Usage:**
```bash
# Delete users dengan grace period 30 hari
curl -X POST "http://localhost:3000/api/cron/cleanup/users?gracePeriod=30" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete dengan grace period 60 hari
curl -X POST "http://localhost:3000/api/cron/cleanup/users?gracePeriod=60" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Delete Orphaned Files

**POST** `/api/cron/cleanup/files?gracePeriod=60`

Hapus file yang sudah soft-deleted dan tidak terkait dengan entity manapun.

**Query Parameters:**
- `gracePeriod` (optional, default: 60): Jumlah hari grace period untuk files

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 10,
    "deletedFileIds": ["uuid1", "uuid2", ...]
  },
  "message": "Cleanup completed. Deleted 10 orphaned files."
}
```

**Usage:**
```bash
curl -X POST "http://localhost:3000/api/cron/cleanup/files?gracePeriod=60" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Yang Dihapus

### User Deletion Cascade

Ketika user dihapus, sistem akan menghapus/cleanup:

#### ✅ Hard Delete (Dihapus Permanen):
1. **InternProfile** - Profil intern
2. **InternshipApplication** - Pengajuan magang
3. **Internship** - Data magang
4. **Attendance** - Absensi
5. **AttendanceLog** - Log absensi
6. **AttendanceOverride** - Override absensi
7. **AttendanceViolation** - Pelanggaran absensi
8. **AttendanceReminder** - Reminder absensi
9. **Certificate** - Sertifikat
10. **SupervisorAssignment** - Penugasan supervisor
11. **OnboardingHistory** - Riwayat onboarding
12. **InternshipStatusHistory** - Riwayat status magang
13. **InternProfileSkill** - Skills intern
14. **NotificationRead** - Notifikasi yang dibaca
15. **AttendanceDevice** - Device attendance
16. **RefreshToken** - Token refresh
17. **UserRole** - Role user

#### 📝 Soft Delete (Ditandai deleted):
1. **File** (uploaded files) - Untuk audit trail
2. **File** (avatar) - Untuk audit trail
3. **File** (introduction letters) - Untuk audit trail

#### 🔒 Keep (Tetap untuk Audit):
1. **AuditLog** - Log audit (TETAP)
2. **ActivityLog** - Log aktivitas (TETAP)

---

## Kriteria User Eligible untuk Dihapus

User akan dihapus jika memenuhi SEMUA kondisi:

1. **Kondisi Inactive:**
   - `isActive = false` ATAU
   - `deletedAt IS NOT NULL`

2. **Kondisi Grace Period:**
   - `deletedAt <= (today - gracePeriod days)` ATAU
   - `isActive = false` DAN `updatedAt <= (today - gracePeriod days)`

**Contoh:**
```
Grace Period: 30 hari
Today: 2024-02-01

User akan dihapus jika:
- deletedAt: 2024-01-01 atau lebih lama (31+ hari yang lalu)
- ATAU isActive=false dan updatedAt: 2024-01-01 atau lebih lama
```

---

## Recommended Cron Schedule

### Development/Staging:
```bash
# Preview setiap hari jam 2 pagi (untuk monitoring)
0 2 * * * curl http://localhost:3000/api/cron/cleanup/preview?gracePeriod=30

# Delete setiap minggu (Minggu jam 3 pagi)
0 3 * * 0 curl -X POST http://localhost:3000/api/cron/cleanup/users?gracePeriod=30

# Delete orphaned files setiap bulan
0 4 1 * * curl -X POST http://localhost:3000/api/cron/cleanup/files?gracePeriod=60
```

### Production:
```bash
# Preview setiap hari (monitoring)
0 2 * * * curl https://api.simad.com/api/cron/cleanup/preview?gracePeriod=60

# Delete setiap bulan (lebih konservatif)
0 3 1 * * curl -X POST https://api.simad.com/api/cron/cleanup/users?gracePeriod=60

# Delete orphaned files setiap 3 bulan
0 4 1 */3 * curl -X POST https://api.simad.com/api/cron/cleanup/files?gracePeriod=90
```

---

## Safety Features

### 1. Grace Period
- Default 30 hari untuk users
- Default 60 hari untuk files
- Configurable per request
- Mencegah accidental deletion

### 2. Preview Endpoint
- Check data sebelum delete
- Shows email, nama, dan berapa lama inactive
- Zero risk - tidak mengubah data

### 3. Transaction Safety
- Semua delete dalam transaction
- Jika ada yang gagal, rollback semua
- Maintains data integrity

### 4. Audit Logging
- Semua deletion dicatat di audit_log
- Includes who triggered the cleanup
- Timestamp dan detail user yang dihapus

### 5. Selective Retention
- Audit logs tetap disimpan
- Activity logs tetap disimpan
- File di-soft delete dulu

---

## Best Practices

### ❌ JANGAN:
1. Jalankan di production tanpa test di staging dulu
2. Set grace period terlalu pendek (<30 hari)
3. Jalankan tanpa preview dulu
4. Jalankan manual tanpa proper authorization
5. Jalankan saat peak hours

### ✅ LAKUKAN:
1. Test di staging environment dulu
2. Gunakan grace period yang aman (30-60 hari)
3. Selalu preview dulu dengan `/cleanup/preview`
4. Setup monitoring dan alerting
5. Jalankan saat off-peak hours (2-4 AM)
6. Backup database sebelum cleanup pertama kali
7. Review audit logs setelah cleanup

---

## Monitoring

### Metrics to Track:
```typescript
// Preview sebelum cleanup
const preview = await fetch('/api/cron/cleanup/preview?gracePeriod=30');
const { count } = preview.data;

// Set alert jika count > threshold
if (count > 100) {
  alert('High number of users to delete!');
}

// Track actual deletions
const result = await fetch('/api/cron/cleanup/users', { method: 'POST' });
const { deletedCount } = result.data;

// Log to monitoring system
logger.info('Cleanup completed', { deletedCount, timestamp: new Date() });
```

### Health Checks:
- Monitor execution time
- Track success/failure rate
- Alert jika deletion count anomali
- Monitor database size reduction

---

## Rollback Strategy

⚠️ **IMPORTANT**: Tidak ada automatic rollback karena ini permanent delete!

### Prevention (Before Delete):
1. ✅ Database backup (automatis daily)
2. ✅ Preview dengan `/cleanup/preview`
3. ✅ Test di staging dulu
4. ✅ Verify grace period settings

### Recovery (After Delete):
- Restore dari database backup
- Re-import dari backup
- Manual recreation (jika ada backup eksternal)

**Best Strategy**: PREVENTION, bukan recovery!

---

## Error Handling

Service akan:
1. ✅ Continue dengan user lain jika satu gagal
2. ✅ Log error untuk debugging
3. ✅ Return partial success (deleted count + errors)
4. ✅ Rollback per-user transaction jika gagal

**Example Error Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 4,
    "deletedUsers": [...],
    "errors": [
      {
        "userId": "uuid",
        "email": "user@example.com",
        "error": "Foreign key constraint violation"
      }
    ]
  }
}
```

---

## Testing

### Unit Tests:
```typescript
describe('CleanupService', () => {
  it('should not delete users within grace period', async () => {
    // Test implementation
  });

  it('should delete only inactive users', async () => {
    // Test implementation
  });

  it('should maintain audit trail', async () => {
    // Test implementation
  });
});
```

### Integration Tests:
1. Create test user
2. Set isActive = false
3. Mock updatedAt to > grace period
4. Run cleanup
5. Verify user deleted
6. Verify audit log created
7. Verify related data cleaned

---

## FAQ

### Q: Apakah data bisa di-recover setelah dihapus?
**A**: Tidak otomatis. Hanya dari database backup.

### Q: Berapa lama grace period yang aman?
**A**: Minimum 30 hari, recommended 60 hari untuk production.

### Q: Apakah audit log ikut terhapus?
**A**: TIDAK. Audit log dan activity log tetap disimpan untuk compliance.

### Q: Bagaimana dengan files di R2?
**A**: Files di-soft delete dulu (deletedAt), kemudian dihapus permanen setelah grace period files (60 hari default).

### Q: Apakah ada confirmation dialog?
**A**: Tidak di API level. Harus implement di cron scheduler atau admin panel.

### Q: Bisa batch delete atau harus satu-satu?
**A**: Batch, tapi dengan transaction per-user untuk safety.

---

## Support

**Issues?** Check:
1. Audit logs: `SELECT * FROM audit_logs WHERE module = 'CLEANUP'`
2. Error logs di console
3. Database constraints
4. Foreign key violations

**Contact:** Backend team atau DevOps

---

**Last Updated:** September 2, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ⚠️ (Use with EXTREME caution!)
