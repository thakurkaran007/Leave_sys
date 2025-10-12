// server.ts
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import type { IncomingMessage } from "http";
import { userInstance } from "./manager/UserManger.js"; // keep your filename consistent

interface MyJwtPayload extends JwtPayload {
  id?: string;
  role?: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is required");

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req: IncomingMessage | undefined) => {
  const rawUrl = req?.url ?? "";
  const params = new URLSearchParams(rawUrl.split("?")[1] || "");
  const token = params.get("token");
  if (!token) {
    ws.close(1008, "No token provided");
    return;
  }

  let payload: MyJwtPayload;
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (typeof verified === "string") throw new Error("Invalid token payload");
    payload = verified as MyJwtPayload;
  } catch {
    ws.close(4002, "Invalid token");
    return;
  }

  const userId = payload.id;
  const role = (payload.role ?? "TEACHER") as UserRole;

  if (!userId) {
    ws.close(4003, "Token missing user id");
    return;
  }

  const validRoles = new Set(Object.values(UserRole));
  if (!validRoles.has(role)) {
    ws.close(4004, "Invalid role");
    return;
  }

  userInstance.addUser(userId, ws, role);
  console.log(`User connected: ${userId} (${role})`);

  ws.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ error: "invalid_json" }));
      return;
    }

    switch (msg.type) {
      case "requestLeave":
        if (role !== "TEACHER") {
          ws.send(JSON.stringify({ error: "Only teachers can request leave" }));
          return;
        }
        userInstance.requestLeave(userId, msg.reason, msg.lectureId);
        break;
    }
  });

  ws.on("close", () => {
    userInstance.removeUser(userId);
  });
});
