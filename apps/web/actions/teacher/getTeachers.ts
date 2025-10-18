"use server";

import { db } from "@repo/db/src";

const getTeachers = async (date: Date) => {
    const teachers = await db.user.findMany({
        where: {
            role: 'TEACHER',
            lectures: {
                some: {
                    date: {
                        not: date
                    }
                }
            }
        }
    })
    return teachers;
};

export default getTeachers;