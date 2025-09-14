/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,subject]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - Made the column `approverId` on table `LeaveRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reason` on table `LeaveRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."LeaveRequest" DROP CONSTRAINT "LeaveRequest_approverId_fkey";

-- AlterTable
ALTER TABLE "public"."LeaveRequest" ALTER COLUMN "approverId" SET NOT NULL,
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "teacher_status" "public"."Status" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."SignupRequests" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "SignupRequests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupRequests_email_key" ON "public"."SignupRequests"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_teacherId_subject_key" ON "public"."Lecture"("teacherId", "subject");

-- AddForeignKey
ALTER TABLE "public"."SignupRequests" ADD CONSTRAINT "SignupRequests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
