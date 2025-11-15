"use server";

import { db } from "@repo/db/src";

const getTeachers = async (date: Date, startTime: Date, endTime: Date) => {
    // First, find all teachers who ARE busy at this specific time
    const busyTeachers = await db.lecture.findMany({
        where: {
            date: date,
            timeSlot: {
                startTime: startTime,
                endTime: endTime,
            }
        },
        select: {
            teacherId: true
        }
    });

    const busyTeacherIds = busyTeachers.map((lecture: any) => lecture.teacherId);

    const availableTeachers = await db.user.findMany({
        where: {
            role: 'TEACHER',
            teacher_status: 'ACTIVE',
            id: {
                notIn: busyTeacherIds.length > 0 ? busyTeacherIds : ['dummy'] // Avoid empty array
            }
        }
    });

    return availableTeachers;
};

export default getTeachers;