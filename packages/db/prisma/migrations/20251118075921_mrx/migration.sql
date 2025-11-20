-- AlterTable
ALTER TABLE "ReplacementOffer" ADD COLUMN     "leaveId" TEXT;

-- AddForeignKey
ALTER TABLE "ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
