import axios from "axios";
import { BACKENT_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId: string) {
  const response = await axios.get(`${BACKENT_URL}/chats/${roomId}`);
  return response.data.message;
}

export async function ChatRoom({ id }: { id: String }) {
  const messages = await getChats(id);
  return <ChatRoomClient id={id} messages={messages} />;
}
