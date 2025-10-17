/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,subjectId,date,timeSlotId]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Lecture_teacherId_subjectId_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_teacherId_subjectId_date_timeSlotId_key" ON "public"."Lecture"("teacherId", "subjectId", "date", "timeSlotId");
