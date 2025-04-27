import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

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

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    console.log("🚀 ~ checkUser ~ error:", error);
    return null;
  }
  return null;
}

const users: User[] = [];

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

  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws: ws,
  });

  ws.on("message", async function message(data) {
    const parseData = JSON.parse(data as unknown as string);

    if (parseData.type === "join_room") {
      const user = users.find((user) => user.ws === ws);
      if (!user) {
        return;
      }
      user.rooms.push(parseData.roomId);
    }
    if (parseData.type === "leave_room") {
      const user = users.find((user) => user.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parseData.room);
    }
    if (parseData.type === "chat") {
      const roomId = parseData.roomId;
      const message = parseData.message;

      await prismaClient.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId) && user.userId !== userId) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              content: message,
              roomId,
            })
          );
        }
      });
    }

    ws.send("pong");
  });
});
