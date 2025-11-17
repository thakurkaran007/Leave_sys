"use server"

import { db } from "@repo/db/src";

export async function approveLeaveRequest(
  requestId: string, 
  approverId: string,
  userRole: string
) {
  if (userRole === "HOD") {
    // Approve and mark for Admin review
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approverId: approverId,
      }
    });
  } else if (userRole === "ADMIN") {
    // Final approval
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        // Additional admin approval logic
      }
    });
  }
}

export async function rejectLeaveRequest(
  requestId: string,
  approverId: string
) {
  await db.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: "DENIED",
      approverId: approverId,
    }
  });
}