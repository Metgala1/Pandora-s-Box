-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "cloudinary_public_id" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "storage" TEXT NOT NULL DEFAULT 'local';
