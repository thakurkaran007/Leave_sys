"use server"

import { TimeSlotType } from "@/app/home/types";
import { db } from "@repo/db/src";

const TIMETABLE_CONFIG = {
  START_HOUR: 8,
  END_HOUR: 17,
  SLOT_DURATION: 60, // minutes
} as const;


const generateTimeSlots = (): TimeSlotType[] => {
  const slots: TimeSlotType[] = [];
  let hour = TIMETABLE_CONFIG.START_HOUR;
  let minute = 0;
  
  while (hour < TIMETABLE_CONFIG.END_HOUR) {
    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    minute += TIMETABLE_CONFIG.SLOT_DURATION;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
    
    const endTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push({ startTime, endTime });
  }
  
  return slots;
};


export const getEmptySlots = async (lectureId: string) => {
  // 1️⃣ Get the lecture to know weekday + teacher
  const lecture = await db.lecture.findUnique({
    where: { id: lectureId },
    include: { timeSlot: true }
  });

  if (!lecture) return [];

  const { weekDay, teacherId } = lecture;

  // 2️⃣ Get all lectures of that teacher on same weekday
  const dayLectures = await db.lecture.findMany({
    where: { teacherId, weekDay },
    include: { timeSlot: true }
  });

  // 3️⃣ Extract occupied timslot start-end
  const bookedSlots = dayLectures.map((l: any) => ({
    startTime: l.timeSlot.startTime.toISOString().substring(11, 16),
    endTime: l.timeSlot.endTime.toISOString().substring(11, 16)
  }));

  // 4️⃣ Generate full day timeslots
  const allSlots = generateTimeSlots();

  // 5️⃣ Filter out booked ones
  const emptySlots = allSlots.filter(slot =>
    !bookedSlots.some((b: any) => b.startTime === slot.startTime && b.endTime === slot.endTime)
  );
   
  return emptySlots;
};
