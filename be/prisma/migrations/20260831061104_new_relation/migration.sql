-- AlterTable
ALTER TABLE "users" ADD COLUMN     "office_id" UUID;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
