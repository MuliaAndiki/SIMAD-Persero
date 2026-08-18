-- CreateTable: implicit many-to-many OfficeLocation <-> Department
-- A = Department.id, B = OfficeLocation.id (Prisma convention "_DepartmentToOfficeLocation")
CREATE TABLE "_DepartmentToOfficeLocation" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_DepartmentToOfficeLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DepartmentToOfficeLocation_B_index" ON "_DepartmentToOfficeLocation"("B");

-- AddForeignKey
ALTER TABLE "_DepartmentToOfficeLocation" ADD CONSTRAINT "_DepartmentToOfficeLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToOfficeLocation" ADD CONSTRAINT "_DepartmentToOfficeLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "office_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData: pindahkan relasi kantor -> departemen (kolom lama department_id)
-- ke join table m2m agar data yang sudah ada tidak hilang.
INSERT INTO "_DepartmentToOfficeLocation" ("A", "B")
SELECT "department_id", "id" FROM "office_locations" WHERE "department_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "public"."office_locations" DROP CONSTRAINT "office_locations_department_id_fkey";

-- DropIndex
DROP INDEX "public"."office_locations_department_id_idx";

-- AlterTable: kolom department_id tidak lagi dipakai (relasi m2m via join table)
ALTER TABLE "office_locations" DROP COLUMN "department_id";
