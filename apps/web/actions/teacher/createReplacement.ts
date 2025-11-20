"use server";

import { auth } from "@/auth";
import { feasibleReq } from "@/data/teachers/user";
import { db } from "@repo/db/src";
import { TimeSlotType } from "@/app/home/types";
import { console } from "inspector";

const createReplacementOffer = async (
  lectureId: string,
  teacherIds: string[],
  message: string | undefined,
  replaceSlot: TimeSlotType,
  weekDay: number
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const lecture = await db.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture) throw new Error("Lecture not found");
    if (lecture.teacherId !== userId)
      throw new Error("You can only offer replacement for your own lectures");

    // feasibility check
    const feasible = await feasibleReq(lectureId, userId);
    if (feasible.error) throw new Error(feasible.error);

    // --- 1️⃣ Resolve timeSlotId from times ---
    const rs = replaceSlot.startTime;
    const re = replaceSlot.endTime;

    const replacementSlot = await db.timeSlot.findFirst({
      where: {
        startTime: new Date(`2025-01-01T${rs}:00.000Z`),
        endTime: new Date(`2025-01-01T${re}:00.000Z`)
      }
    });

    if (!replacementSlot) throw new Error("No matching replacement timeslot found");

    // --- 2️⃣ Find each teacher’s lecture in that replacement slot ---
    const targetLectures = await db.lecture.findMany({
      where: {
        weekDay,
        timeSlotId: replacementSlot.id,
        teacherId: { in: teacherIds }
      },
      select: { id: true, teacherId: true }
    });

    const lectureMap = Object.fromEntries(
      targetLectures.map(l => [l.teacherId, l.id])
    );

    // --- 3️⃣ Insert offers including replacementLectureId ---
    const replacementOffers = await db.replacementOffer.createMany({
      data: teacherIds.map(teacherId => ({
        lectureId,
        offererId: userId,
        accepterId: teacherId,
        replaceLectureId: lectureMap[teacherId] ?? null,
        message: message ?? undefined,
        status: "PENDING"
      }))
    });

    return {
      success: true,
      count: replacementOffers.count,
      message: `Offers sent to ${replacementOffers.count} teacher(s)`,
    };

  } catch (error) {
    console.error("Error creating replacement offers:", error);
    throw error;
  }
};

export default createReplacementOffer;
