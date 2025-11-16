import { db } from "@repo/db/src"
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const getLeaveReqsById = async (id: string) => {
    const reqs = await db.leaveRequest.findMany({
        where: {
            requesterId: id,
        },
        include: {
            lecture: {
                include: {
                    timeSlot: true,
                    subject: true
                }
            },
            application: true
        }
    })
    return reqs;
}

export const getReplacementsById = async (id: string) => {
    const reqs = await db.replacementOffer.findMany({
        where: {
            offererId: id,
        }, 
        include: {
            offerer: true,
            accepter: true,
            lecture: {
                include: {
                    subject: true,
                    timeSlot: true,
                    teacher: true,
                }
            }
        }
    })
    return reqs;
}

export const getReplacementsOffered = async (id: string) => {
    const reqs = await db.replacementOffer.findMany({
        where: {
            accepterId: id,
        },
        include: {
            offerer: true,
            lecture: {
                include: {
                    subject: true,
                    timeSlot: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
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

export const getSignUrl = async (key: string) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        ContentType: 'application/pdf'
    })
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
}

export const getImage = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
    })
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
}