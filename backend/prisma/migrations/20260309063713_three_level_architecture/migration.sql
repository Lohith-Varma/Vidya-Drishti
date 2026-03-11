/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `colleges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PLATFORM_ADMIN', 'COLLEGE_ADMIN', 'STUDENT');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "collegeId" TEXT;

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "city" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "onboardedById" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_onboardedById_fkey" FOREIGN KEY ("onboardedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
