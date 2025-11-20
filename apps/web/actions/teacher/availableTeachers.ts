"use server";

import { TimeSlotType } from "@/app/home/types";
import { db } from "@repo/db/src";

const getTeachers = async (
  weekDay: number,
  originalStart: Date,
  originalEnd: Date,
  replaceSlot: TimeSlotType
) => {
  // Extract HH:MM from original lecture & replace slot
  const originalStartHM = originalStart.toISOString().substring(11, 16);
  const originalEndHM = originalEnd.toISOString().substring(11, 16);

  const replaceStartHM = replaceSlot.startTime;
  const replaceEndHM = replaceSlot.endTime;

  // ---------------------------------------------------
  // 🔍 Fetch TimeSlot IDs from DB dynamically
  // ---------------------------------------------------

  const originalSlot = await db.timeSlot.findFirst({
    where: {
      AND: [
        {
          startTime: {
            // match ISO time substring
            equals: new Date(`2025-01-01T${originalStartHM}:00.000Z`)
          }
        },
        {
          endTime: {
            equals: new Date(`2025-01-01T${originalEndHM}:00.000Z`)
          }
        }
      ]
    }
  });

  const replacementSlot = await db.timeSlot.findFirst({
    where: {
      AND: [
        {
          startTime: {
            equals: new Date(`2025-01-01T${replaceStartHM}:00.000Z`)
          }
        },
        {
          endTime: {
            equals: new Date(`2025-01-01T${replaceEndHM}:00.000Z`)
          }
        }
      ]
    }
  });

  if (!originalSlot || !replacementSlot) {
    console.log("No matching slots found → Double check seed times");
    return [];
  }

  // ---------------------------------------------------
  // 🔥 Now query teachers with condition:
  //  - Must have lecture at replacement slot
  //  - Must NOT have lecture at original slot
  // ---------------------------------------------------

  const teachers = await db.user.findMany({
    where: {
      role: "TEACHER",
      teacher_status: "ACTIVE",

      lectures: {
        some: {
          weekDay,
          timeSlotId: replacementSlot.id
        }
      },

      AND: {
        lectures: {
          none: {
            weekDay,
            timeSlotId: originalSlot.id
          }
        }
      }
    },
    include: {
      lectures: true,
    }
  });

  return teachers;
};

export default getTeachers;
