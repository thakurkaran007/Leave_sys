import { Lecture, Subject, TimeSlot, User } from "@prisma/client";

export type LectureWithRelations = Lecture & {
  subject: Subject;
  teacher: User;
  timeSlot: TimeSlot;
};

export interface SubjectType {
  name: string;
  code: string;
}

export interface TimetableStatsProps {
  lectures: LectureWithRelations[];
}

export interface TeacherType {
  name: string;
}

export interface LectureType {
  id: string;
  weekDay: number;
  timeSlot: TimeSlotType
  subject: SubjectType;
  room: string;
}

export interface TimeSlotType {
  startTime: string;
  endTime: string;
}

export interface DayType {
  id: number;
  name: string;
  short: string;
}



