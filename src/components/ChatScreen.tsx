import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socketContext";
import { getMessages } from "../services/apis/messageService";

interface RawMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string | null;
  imageUrl: string | null;
}

interface Message {
  from: number;
  to: number;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface Props {
  userId: number;
  selectedUser: number;
}

const ChatScreen: React.FC<Props> = ({ selectedUser, userId }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 📩 Fetch chat history on user change
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const fetched: RawMessage[] = await getMessages(userId, selectedUser);
        const mappedMessages: Message[] = fetched.map((msg) => ({
          from: msg.senderId,
          to: msg.receiverId,
          content: msg.content,
          timestamp: msg.createdAt,
          status: msg.status.toLowerCase() as "sent" | "delivered" | "read",
        }));
        setMessages(mappedMessages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchChat();
  }, [selectedUser, userId]);

  // 🔁 Socket listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg: Message) => {
      if (
        (msg.from === userId && msg.to === selectedUser) ||
        (msg.to === userId && msg.from === selectedUser)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("private:message", handleIncoming);
    return () => {
      socket.off("private:message", handleIncoming);
    };
  }, [socket, selectedUser, userId]);

  // 📨 Send message using API + socket emit
  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;

    const payload = {
      to: selectedUser,
      content: input.trim(),
    };

    const optimisticMessage: Message = {
      from: userId,
      to: selectedUser,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    try {
      setMessages((prev) => [...prev, optimisticMessage]);
      socket?.emit("private:message", payload);
      setInput("");
    } catch (err) {
      console.error("Message send failed:", err);
    }
  };

  // 🔽 Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-2/3 h-full flex flex-col">
      <div className="p-4 border-b font-semibold bg-gray-100">
        {/* You can show selected user name here if needed */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-xs break-words ${
              msg.from === userId
                ? "bg-green-100 self-end text-right"
                : "bg-gray-200 self-start text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            }
        }}
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
