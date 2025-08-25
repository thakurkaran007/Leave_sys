import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@repo/db/dist"
import { serialize } from 'cookie';

import { LoginSchema } from "../validation.js";

const userRouter = Router();

userRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validatePassword = bcrypt.compare(password, user.password);
    if (!validatePassword) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret");

    
    res.setHeader("Set-Header", serialize("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    }))
    
    return res.status(200).json({ token });
});

export default userRouter;