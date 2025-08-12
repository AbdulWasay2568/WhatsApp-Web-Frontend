import { useEffect, useState } from "react";
import { useSocket } from "../context/socketContext";
import { Message } from "../interfaces/message.interface";

export const useMessages = (userId: number) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message:receive", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("message:receive");
    };
  }, [socket]);

  return { messages, setMessages };
};
