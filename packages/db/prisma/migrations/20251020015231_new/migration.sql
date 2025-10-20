/*
  Warnings:

  - You are about to drop the column `leaveRequestId` on the `ReplacementOffer` table. All the data in the column will be lost.
  - Added the required column `lectureId` to the `ReplacementOffer` table without a default value. This is not possible if the table is not empty.
  - Made the column `accepterId` on table `ReplacementOffer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ReplacementOffer" DROP CONSTRAINT "ReplacementOffer_accepterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReplacementOffer" DROP CONSTRAINT "ReplacementOffer_leaveRequestId_fkey";

-- AlterTable
ALTER TABLE "public"."ReplacementOffer" DROP COLUMN "leaveRequestId",
ADD COLUMN     "lectureId" TEXT NOT NULL,
ALTER COLUMN "accepterId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ReplacementOffer_accepterId_status_idx" ON "public"."ReplacementOffer"("accepterId", "status");

-- CreateIndex
CREATE INDEX "ReplacementOffer_lectureId_idx" ON "public"."ReplacementOffer"("lectureId");

-- AddForeignKey
ALTER TABLE "public"."ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_accepterId_fkey" FOREIGN KEY ("accepterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
