import { db } from "@repo/db/src"

export const getAdminId = async () => {
    const admin = await db.user.findFirst({ where: { role: 'ADMIN' }});
    return admin?.id;
}

export const getSignInReqs = async () => {
    const reqs = await db.user.findFirst({
        where: {
            role: 'ADMIN'
        },
        include: {
            signupRequests: true
        }
    })
    return reqs;
}

export const getReplacementsReqs = async () => {
    const reqs = await db.replacementOffer.findMany({
        where: {
            status: 'PENDING'
        }
    })
    return reqs;
}

export const getLeaveReqs = async () => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            status: 'PENDING'
        }
    });
    return reqs;
}

export const getApprovedLeaveReqs = async () => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            status: 'APPROVED'
        }
    });
    return reqs;
}