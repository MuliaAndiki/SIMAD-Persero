-- AlterTable
ALTER TABLE "internship_applications" ADD COLUMN "office_location_id" UUID;

-- CreateIndex
CREATE INDEX "internship_applications_office_location_id_idx" ON "internship_applications"("office_location_id");

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_office_location_id_fkey" FOREIGN KEY ("office_location_id") REFERENCES "office_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
