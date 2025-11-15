-- AlterTable
ALTER TABLE "public"."ReplacementOffer" ADD COLUMN     "approverId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ReplacementOffer" ADD CONSTRAINT "ReplacementOffer_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
