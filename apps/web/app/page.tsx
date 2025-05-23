import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRooomId] = useState("");
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div>
        <input
          value={roomId}
          onChange={(e) => setRooomId(e.target.value)}
        ></input>
        <button onClick={() => router.push(`/room/${roomId}`)}>
          Join Room
        </button>
      </div>
    </div>
  );
}
