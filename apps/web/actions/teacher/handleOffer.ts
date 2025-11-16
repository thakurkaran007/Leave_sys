"use server"

import { db } from "@repo/db/src"

export const acceptOffer = async (replacementId: string) => {
    try {
        await db.$transaction(async (tx) => {

            const result = await tx.replacementOffer.update({
                where: { id: replacementId },
                data: { status: "ACCEPTED" },
            });
            
            // delete other offers for the same lecture
            await tx.replacementOffer.deleteMany({
                where: {
                    id: { not: result.id },
                    lectureId: result.lectureId
                }
            });
            
        });
        return true;
    } catch (error) {
        console.error("Error accepting replacement offer:", error);
        return false;
    }
}

export const declineOffer = async (replacementId: string) => {
    try {
        await db.replacementOffer.update({
            where: { id: replacementId },
            data: { status: "DECLINED" },
        });
        return true;
    } catch (error) {
        console.error("Error declining replacement offer:", error);
        return false;
    }
}