import { WebSocketServer } from "ws";
import { userInstance } from "./manager/UserManger.js"; // keep your filename consistent

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");
  ws.on("message", (raw) => {
    console.log("Received message:", raw.toString());
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
      console.log("Parsed message:", msg);
    } catch {
      ws.send(JSON.stringify({ error: "invalid_json" }));
      return;
    }

    switch (msg.type) {
      case "toadmin":
        userInstance.sendToAdmin(msg.type, msg.data);
        break;
      case "tohod":
        userInstance.sendToHod(msg.type, msg.data);
        break;
      case "addUser":
        console.log("Adding user:", msg.id, msg.role);
        userInstance.addUser(msg.id, ws, msg.role);
        break;
    }
  });

  ws.on("close", () => {
    userInstance.removeUser(ws);
  });
});

console.log("WebSocket server running on ws://localhost:8080");