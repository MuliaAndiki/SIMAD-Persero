/*
  Catch-up idempotente para Neon: tabel push_subscriptions ya ada di sana
  (dibuat vía db push, tanpa riwayat migrasi), sehingga migrasi gabungan
  20261010142303 tidak bisa di-deploy ulang di Neon (CREATE TABLE konflik).

  File ini hanya berisi DROP yang idempoten — no-op di lokal
  (sudah teraplikasi) dan drop betulan di Neon. Data 4 tabel + 2 kolom
  sudah di-backup ke CSV sebelum deploy.
*/
-- DropForeignKey (idempoten, tahan tabel sudah hilang)
DO $$ BEGIN
  ALTER TABLE "attendance_devices" DROP CONSTRAINT IF EXISTS "attendance_devices_user_id_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "attendance_logs" DROP CONSTRAINT IF EXISTS "attendance_logs_photo_file_id_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "attendance_reminders" DROP CONSTRAINT IF EXISTS "attendance_reminders_internship_id_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "attendance_violations" DROP CONSTRAINT IF EXISTS "attendance_violations_resolved_by_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permission_id_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_role_id_fkey";
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- DropIndex (idempoten)
DROP INDEX IF EXISTS "attendance_logs_photo_file_id_idx";
DROP INDEX IF EXISTS "attendance_violations_resolved_by_idx";

-- AlterTable (idempoten)
ALTER TABLE IF EXISTS "attendance_logs" DROP COLUMN IF EXISTS "photo_file_id";
ALTER TABLE IF EXISTS "attendance_violations" DROP COLUMN IF EXISTS "resolved_by";

-- DropTable (child dulu, idempoten)
DROP TABLE IF EXISTS "role_permissions";
DROP TABLE IF EXISTS "attendance_devices";
DROP TABLE IF EXISTS "attendance_reminders";
DROP TABLE IF EXISTS "permissions";
