-- AlterTable
ALTER TABLE "ReplacementOffer" ADD COLUMN     "replaceLectureId" TEXT;

-- AddForeignKey
ALTER TABLE "ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_replaceLectureId_fkey" FOREIGN KEY ("replaceLectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
