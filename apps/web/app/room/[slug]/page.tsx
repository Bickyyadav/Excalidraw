import axios from "axios";
import { BACKENT_URL } from "../../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKENT_URL}/room/${slug}`);
  return response.data.room.id;
}

async function ChatRoom1({ params }: { params: { slug: string } }) {
  const slug = await params.slug;
  const roomId = await getRoomId(slug);

  return <ChatRoom id={roomId}></ChatRoom>;
}
