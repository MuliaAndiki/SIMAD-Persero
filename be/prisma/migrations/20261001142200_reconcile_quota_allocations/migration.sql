-- Reconcile quota schema to v1.0.1 final design: Office Master Quota + QuotaDepartmentAllocation

-- 1. Alter internship_quotas
-- Drop old foreign key if exists
ALTER TABLE "internship_quotas" DROP CONSTRAINT IF EXISTS "internship_quotas_department_id_fkey";

-- Drop old indexes if exist
DROP INDEX IF EXISTS "internship_quotas_office_location_id_department_id_idx";
DROP INDEX IF EXISTS "internship_quotas_start_date_end_date_idx";

-- Drop old columns if exist
ALTER TABLE "internship_quotas" DROP COLUMN IF EXISTS "capacity";
ALTER TABLE "internship_quotas" DROP COLUMN IF EXISTS "department_id";
ALTER TABLE "internship_quotas" DROP COLUMN IF EXISTS "end_date";
ALTER TABLE "internship_quotas" DROP COLUMN IF EXISTS "start_date";

-- Add total_capacity column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'internship_quotas' AND column_name = 'total_capacity'
    ) THEN
        ALTER TABLE "internship_quotas" ADD COLUMN "total_capacity" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add unique constraint on office_location_id if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "internship_quotas_office_location_id_key" ON "internship_quotas"("office_location_id");

-- 2. Create quota_department_allocations table if not exists
CREATE TABLE IF NOT EXISTS "quota_department_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quota_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "capacity" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "quota_department_allocations_pkey" PRIMARY KEY ("id")
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS "quota_department_allocations_department_id_idx" ON "quota_department_allocations"("department_id");
CREATE UNIQUE INDEX IF NOT EXISTS "quota_department_allocations_quota_id_department_id_key" ON "quota_department_allocations"("quota_id", "department_id");

-- Add foreign keys if not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'quota_department_allocations_quota_id_fkey'
    ) THEN
        ALTER TABLE "quota_department_allocations" 
        ADD CONSTRAINT "quota_department_allocations_quota_id_fkey" 
        FOREIGN KEY ("quota_id") REFERENCES "internship_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'quota_department_allocations_department_id_fkey'
    ) THEN
        ALTER TABLE "quota_department_allocations" 
        ADD CONSTRAINT "quota_department_allocations_department_id_fkey" 
        FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
