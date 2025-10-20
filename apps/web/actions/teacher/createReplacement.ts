"use server";

import { auth } from "@/auth";
import { db } from "@repo/db/src";

const createReplacementOffer = async (
  lectureId: string,
  teacherIds: string[],
  message?: string
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      throw new Error("Lecture not found");
    }

    if (lecture.teacherId !== userId) {
      throw new Error("You can only offer replacement for your own lectures");
    }


    const replacementOffers = await db.replacementOffer.createMany({
      data: teacherIds.map((teacherId) => ({
        lectureId: lectureId,
        offererId: userId, // Use the const instead
        accepterId: teacherId,
        message: message ?? undefined, // Use ?? undefined instead of || null
        status: "PENDING",
      })),
    });

    return {
      success: true,
      count: replacementOffers.count,
      message: `Replacement offers sent to ${replacementOffers.count} teacher(s)`,
    };
  } catch (error) {
    console.error("Error creating replacement offers:", error);
    throw error;
  }
};

export default createReplacementOffer;