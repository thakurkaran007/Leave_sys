/*
  Warnings:

  - The values [STUDENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('HOD', 'ADMIN', 'TEACHER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'TEACHER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "status",
ALTER COLUMN "role" SET DEFAULT 'TEACHER';

-- DropTable
DROP TABLE "public"."accounts";

-- CreateTable
CREATE TABLE "public"."Lecture" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "room" TEXT,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeaveRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "approverId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReplacementOffer" (
    "id" TEXT NOT NULL,
    "offererId" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ReplacementOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveRequest_lectureId_key" ON "public"."LeaveRequest"("lectureId");

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "public"."LeaveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
