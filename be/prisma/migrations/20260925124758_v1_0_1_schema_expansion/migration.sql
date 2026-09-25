-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "approval_status" VARCHAR(50) DEFAULT 'WAITING_EVALUATION',
ADD COLUMN     "approved_at" TIMESTAMP(6),
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "evaluation_id" UUID,
ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "internship_applications" ADD COLUMN     "actual_end_date" DATE,
ADD COLUMN     "actual_start_date" DATE;

-- AlterTable
ALTER TABLE "internships" ADD COLUMN     "quota_id" UUID;

-- CreateTable
CREATE TABLE "certificate_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "office_location_id" UUID,
    "signer_name" VARCHAR(150) NOT NULL,
    "signer_role" VARCHAR(150) NOT NULL,
    "signature_file_id" UUID,
    "stamp_file_id" UUID,
    "template_file_id" UUID,
    "certificate_number_format" VARCHAR(100) NOT NULL DEFAULT 'SIMAD/{OFFICE_CODE}/{YEAR}/{NUM}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "certificate_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_quotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "office_location_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "capacity" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "internship_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_correction_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendance_id" UUID NOT NULL,
    "internship_id" UUID NOT NULL,
    "intern_id" UUID NOT NULL,
    "supervisor_id" UUID,
    "correction_type" VARCHAR(50) NOT NULL,
    "requested_check_in" TIMESTAMP(6),
    "requested_check_out" TIMESTAMP(6),
    "reason" TEXT NOT NULL,
    "evidence_file_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "supervisor_notes" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "attendance_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "discipline_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "responsibility_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "teamwork_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "communication_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "technical_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "initiative_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "final_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "grade" VARCHAR(10),
    "comments" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "internship_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_contents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "video_url" VARCHAR(500),
    "content" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "guide_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_settings_office_location_id_key" ON "certificate_settings"("office_location_id");

-- CreateIndex
CREATE INDEX "application_documents_file_id_idx" ON "application_documents"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_documents_application_id_type_key" ON "application_documents"("application_id", "type");

-- CreateIndex
CREATE INDEX "internship_quotas_office_location_id_department_id_idx" ON "internship_quotas"("office_location_id", "department_id");

-- CreateIndex
CREATE INDEX "internship_quotas_start_date_end_date_idx" ON "internship_quotas"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_internship_id_status_idx" ON "attendance_correction_requests"("internship_id", "status");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_supervisor_id_status_idx" ON "attendance_correction_requests"("supervisor_id", "status");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_intern_id_idx" ON "attendance_correction_requests"("intern_id");

-- CreateIndex
CREATE UNIQUE INDEX "internship_evaluations_internship_id_key" ON "internship_evaluations"("internship_id");

-- CreateIndex
CREATE INDEX "internship_evaluations_supervisor_id_status_idx" ON "internship_evaluations"("supervisor_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "guide_contents_slug_key" ON "guide_contents"("slug");

-- CreateIndex
CREATE INDEX "guide_contents_category_is_published_idx" ON "guide_contents"("category", "is_published");

-- CreateIndex
CREATE INDEX "certificates_approved_by_id_idx" ON "certificates"("approved_by_id");

-- CreateIndex
CREATE INDEX "certificates_evaluation_id_idx" ON "certificates"("evaluation_id");

-- CreateIndex
CREATE INDEX "internships_quota_id_idx" ON "internships"("quota_id");

-- AddForeignKey
ALTER TABLE "certificate_settings" ADD CONSTRAINT "certificate_settings_office_location_id_fkey" FOREIGN KEY ("office_location_id") REFERENCES "office_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_settings" ADD CONSTRAINT "certificate_settings_signature_file_id_fkey" FOREIGN KEY ("signature_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_settings" ADD CONSTRAINT "certificate_settings_stamp_file_id_fkey" FOREIGN KEY ("stamp_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_settings" ADD CONSTRAINT "certificate_settings_template_file_id_fkey" FOREIGN KEY ("template_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "internship_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_quotas" ADD CONSTRAINT "internship_quotas_office_location_id_fkey" FOREIGN KEY ("office_location_id") REFERENCES "office_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_quotas" ADD CONSTRAINT "internship_quotas_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_quotas" ADD CONSTRAINT "internship_quotas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_quota_id_fkey" FOREIGN KEY ("quota_id") REFERENCES "internship_quotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_evidence_file_id_fkey" FOREIGN KEY ("evidence_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_evaluations" ADD CONSTRAINT "internship_evaluations_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_evaluations" ADD CONSTRAINT "internship_evaluations_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "internship_evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_contents" ADD CONSTRAINT "guide_contents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
