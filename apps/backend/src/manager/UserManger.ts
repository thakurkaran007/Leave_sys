
import { UserRole } from "@prisma/client";
import { db } from "@repo/db/dist/index.js";
import WebSocket from "ws";

interface User {
    id: string;
    ws: WebSocket;
}

class UserManager {
    private users: Map<string, WebSocket>;
    private adminId: string | null = null;
    private hodId: string | null = null;
    
    private static instance: UserManager;

    private constructor() {
        this.users = new Map<string, WebSocket>();
    }
    
    public static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    public addUser(id: string, ws: WebSocket, role: UserRole): void {
        this.users.set(id, ws);
        if (role === 'ADMIN') this.adminId = id;
        if (role === 'HOD') this.hodId = id;
    }

    public removeUser(id: string): void {
        this.users.delete(id);
    }

    public getUser(id: string): WebSocket | undefined {
        return this.users.get(id);
    }

    public async requestLeave(id: string, reason: string, lectureId: string): Promise<void> {
        const req = await db.leaveRequest.create({
            data: {
                requesterId: id,
                reason: reason,
                lectureId: lectureId 
            },
            include: {
                requester: true,
                lecture: true
            }
        })
        const adminWs = this.adminId ? this.getUser(this.adminId) : null;
        adminWs?.send(JSON.stringify({ type: 'newLeaveRequest', request: req }));
    }
}

export const userInstance = UserManager.getInstance();