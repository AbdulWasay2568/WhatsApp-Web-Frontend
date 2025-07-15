import { useEffect } from "react";
import { useSocket } from "../context/socketContext";

const useSocketEvents = (
  userId: number,
  setOnlineUsers: React.Dispatch<React.SetStateAction<number[]>>,
  onNewReply?: (reply: any) => void
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!userId || !socket) return;

    socket.emit("join", userId);

    socket.on("online", (onlineUserId: string) => {
      const numericId = Number(onlineUserId);
      setOnlineUsers((prev) => Array.from(new Set([...prev, numericId])));
    });

    socket.on("offline", (offlineUserId: string) => {
      const numericId = Number(offlineUserId);
      setOnlineUsers((prev) => prev.filter((id) => id !== numericId));
    });

    // ✅ NEW: Handle full online user list
    socket.on("online-users", (userIds: string[]) => {
      const numericIds = userIds.map((id) => Number(id));
      setOnlineUsers(numericIds);
    });

    socket.on("newReply", (reply) => {
    console.log("💬 New Reply Received:", reply);
    onNewReply?.(reply); // trigger callback if provided
  });

    return () => {
      socket.emit("leave", userId);
      socket.off("online");
      socket.off("offline");
      socket.off("online-users");
      socket.off("newReply");

    };
  }, [userId, socket]);
};

export default useSocketEvents;
