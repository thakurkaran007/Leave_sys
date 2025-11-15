"use server";

import { auth } from "@/auth";
import { db } from "@repo/db/src"

export const createLeave = async (lectureId: string, reason: string) => {
    const session = await auth();
    if (!session || !session.user.id) return false;
    if (!lectureId || !reason) return false;
    
    const requesterId = session.user.id!;

    const key = `leaves/${session.user.name}/${lectureId}.pdf`;

    try {
        await db.$transaction(async (tx) => {
            const leaveRequest = await tx.leaveRequest.create({
                data: {
                    lectureId,
                    requesterId,
                    reason
                }
            });
            
            await tx.applicationLeave.create({
                data: {
                    applicantId: requesterId,
                    leaveRequestId: leaveRequest.id,
                    s3ObjectKey: key,
                }
            });

        });
        return true;
    } catch (error) {
        console.error("Error creating leave request:", error);
        return false;
    }

}