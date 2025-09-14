import { db } from "@repo/db/src"

export const getLeaveReqsById = async (id: string) => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            requesterId: id,
        }
    })
    return reqs;
}
