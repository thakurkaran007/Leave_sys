/*
  Warnings:

  - Added the required column `weekDay` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lecture" ADD COLUMN     "weekDay" INTEGER NOT NULL;
