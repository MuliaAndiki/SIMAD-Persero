/*
  Warnings:

  - You are about to drop the column `photo_file_id` on the `attendance_logs` table. All the data in the column will be lost.
  - You are about to drop the column `resolved_by` on the `attendance_violations` table. All the data in the column will be lost.
  - You are about to drop the `attendance_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance_reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attendance_devices" DROP CONSTRAINT "attendance_devices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_logs" DROP CONSTRAINT "attendance_logs_photo_file_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_reminders" DROP CONSTRAINT "attendance_reminders_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_violations" DROP CONSTRAINT "attendance_violations_resolved_by_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropIndex
DROP INDEX "attendance_logs_photo_file_id_idx";

-- DropIndex
DROP INDEX "attendance_violations_resolved_by_idx";

-- AlterTable
ALTER TABLE "attendance_logs" DROP COLUMN "photo_file_id";

-- AlterTable
ALTER TABLE "attendance_violations" DROP COLUMN "resolved_by";

-- DropTable
DROP TABLE "attendance_devices";

-- DropTable
DROP TABLE "attendance_reminders";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "endpoint" VARCHAR(1000) NOT NULL,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
