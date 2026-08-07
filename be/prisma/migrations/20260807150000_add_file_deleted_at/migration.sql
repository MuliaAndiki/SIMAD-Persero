-- AlterTable: tambahkan kolom deleted_at untuk soft delete file (docs/07-api-specification.md §25.3)
ALTER TABLE "files" ADD COLUMN "deleted_at" TIMESTAMP(6);
