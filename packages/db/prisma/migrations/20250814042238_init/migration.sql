-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'SUCCESS', 'DENIED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "status" "public"."Status" DEFAULT 'PENDING';
