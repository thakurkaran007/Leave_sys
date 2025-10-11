import { auth } from "@/auth";
import { Lecture, Subject, TimeSlot } from "@prisma/client";
import { User } from "next-auth";
export type SessionType = Awaited<ReturnType<typeof auth>>;

export type LectureWithRelations = Lecture & {
  teacher: User;
  subject: Subject;
  timeSlot: TimeSlot;
};