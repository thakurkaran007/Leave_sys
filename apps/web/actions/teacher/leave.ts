"use server";

import { auth } from "@/auth";
import { feasibleReq } from "@/data/teachers/user";
import { db } from "@repo/db/src"

export const createLeave = async (lectureId: string, reason: string) => {
    const session = await auth();
    if (!session || !session.user.id) return {error: "Unauthorized"};
    if (!lectureId || !reason) return {error: "Lecture ID and reason are required"};
    
    const requesterId = session.user.id!;

    //check feasiblity
    const feasible = await feasibleReq(lectureId, requesterId);
    if (feasible.error) return {error: `${feasible.error}`};

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
            
            // send replacement offer to other teachers having not assigned lecture at that time slot
            const lecture = await tx.lecture.findUnique({
                where: { id: lectureId },
                include: { timeSlot: true, subject: true }
            });

            if (lecture) {
                const potentialOfferers = await tx.user.findMany({
                    where: {
                        role: "TEACHER",
                        id: { not: requesterId },
                        lectures: {
                            none: {
                                timeSlotId: lecture.timeSlotId
                            },
                        }
                    }
                });
                
                for (const accepter of potentialOfferers) {
                    await tx.replacementOffer.create({
                        data: {
                            leaveId: leaveRequest.id,
                            accepterId: accepter.id,
                            offererId: requesterId,
                            lectureId: lectureId,
                            message: `${session.user.name} needs coverage for ${lecture.subject?.name || 'lecture'}`
                        }
                    });
                }
            }
        });
        return { success: "Leave request created successfully" };
    } catch (error) {
        console.error("Error creating leave request:", error);
        return {error: `Failed to create leave request: ${error}`};
    }
}