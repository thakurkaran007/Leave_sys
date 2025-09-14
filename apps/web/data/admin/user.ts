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
    const reqs = await db.user.findFirst({
        where: {
            role: 'ADMIN'
        },
        include: {
            replacementOffers: true
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

export const getApprovedReqs = async () => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            status: 'SUCCESS'
        }
    });
    return reqs;
}