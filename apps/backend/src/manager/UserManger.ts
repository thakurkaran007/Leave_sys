
import { UserRole } from "@prisma/client";
import WebSocket from "ws";


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

    emit(id: string, type: string, data: any) {
        this.getUser(id)?.send(JSON.stringify({ type, data }));
    }

    sendToAdmin(type: string, data: any) {
        if (this.adminId) {
            this.emit(this.adminId, type, data);
        }
    }

    sendToHod(type: string, data: any) {
        if (this.hodId) {
            this.emit(this.hodId, type, data);
        }
    }

    public addUser(id: string, ws: WebSocket, role: UserRole = 'TEACHER'): void {
        this.users.set(id, ws);
        if (role === 'ADMIN') this.adminId = id;
        if (role === 'HOD') this.hodId = id;
    }

    public removeUser(ws: WebSocket): void {
        this.users.forEach((value, key) => {
            if (value === ws) {
                this.users.delete(key);
            }
        });
    }

    public getUser(id: string): WebSocket | undefined {
        return this.users.get(id);
    }

}

export const userInstance = UserManager.getInstance();