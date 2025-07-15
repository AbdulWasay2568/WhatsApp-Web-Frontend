import React, { useEffect, useState } from "react";
import { fetchRecentChats } from "../services/apis/chatService";
import useSocketEvents from "../hooks/useSocket"; // ✅ your updated hook

interface Props {
  userId: number;
  onSelect: (user: number) => void;
}

export interface Message {
  userId: number;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

const ContactList: React.FC<Props> = ({ userId, onSelect }) => {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  useSocketEvents(userId, setOnlineUsers); // ✅ use unified socket

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const recentChatMessages = await fetchRecentChats(userId);
        setRecentMessages(recentChatMessages);
      } catch (error) {
        console.log("Error fetching recent messages:", error);
      }
    };

    fetchRecentMessages();
  }, [userId]);

  return (
    <div className="w-1/3 border-r h-full overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Contacts</h2>
      {recentMessages.map((user) => (
        <div
          key={user.userId}
          className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
          onClick={() => onSelect(user.userId)}
        >
          <span>{user.name}</span>
          {onlineUsers.includes(user.userId) && (
            <span className="text-green-500 text-sm">● Online</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactList;
