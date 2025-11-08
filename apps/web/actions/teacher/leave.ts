import { db } from "@repo/db/src"

export const createLeave = async (id: string, lectureId: string, reason: string) => {
    try {
        const leave = await db.leaveRequest.create({
            data: {
                lectureId,
                reason,
                requesterId: id
            }
        });
        return true;
    } catch (error) {
        console.error("Error creating leave request:", error);
        return false;
    }

}