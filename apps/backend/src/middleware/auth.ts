import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;
    
    if (!token) return res.status(401).json({ error: "Unauthorized" });

try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    //@ts-ignore
    req.id = payload.userId;
    next();
} catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
}}


export default authMiddleware;