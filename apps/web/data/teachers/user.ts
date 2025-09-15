import { db } from "@repo/db/src"

export const getLeaveReqsById = async (id: string) => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            requesterId: id,
        }
    })
    return reqs;
}

export const getLecturesById = async (id: string) => {
    const lectures = await db.lecture.findMany({
        where: {
            id: id
        },
        include: {
            teacher: true

        }
    })
}