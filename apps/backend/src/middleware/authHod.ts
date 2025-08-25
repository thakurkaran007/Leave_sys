import { db } from "@repo/db/dist/index.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const hodMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;
    
    if (!token) return res.status(401).json({ error: "Unauthorized" });

try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await db.user.findFirst({
        where: {
            id: (payload as jwt.JwtPayload).userId,
            role: "HOD"
        }
    })
    if (!user) return res.status(403).json({ error: "Forbidden" });
    //@ts-ignore
    req.id = payload.userId;
    next();
} catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
}}


export default hodMiddleware;