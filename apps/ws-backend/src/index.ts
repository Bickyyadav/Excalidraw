import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8000 });

interface User {
  userId: String;
  ws: WebSocket;
  rooms: number[];
}

interface messageType {
  type: "join_room" | "leave_room" | "chat";
  roomId: number;
  message?: string;
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  if (!token) {
    ws.close();
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded == "string") {
    ws.close();
    return;
  }
  if (!decoded || !decoded.userId) {
    ws.close();
    return;
  }

  // const userId = token;
  // console.log("🚀 ~ connection ~ userId:", userId);

  ws.on("message", function message(data) {
    ws.send("pong");
  });
});
