-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "assignedToId" TEXT;

-- CreateTable
CREATE TABLE "ApplicationLeave" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "s3ObjectKey" TEXT NOT NULL,

    CONSTRAINT "ApplicationLeave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationLeave_leaveRequestId_key" ON "ApplicationLeave"("leaveRequestId");

-- CreateIndex
CREATE INDEX "ApplicationLeave_leaveRequestId_s3ObjectKey_idx" ON "ApplicationLeave"("leaveRequestId", "s3ObjectKey");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationLeave" ADD CONSTRAINT "ApplicationLeave_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationLeave" ADD CONSTRAINT "ApplicationLeave_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
