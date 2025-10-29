import React, { useEffect, useState } from "react";
import { fetchRecentChats } from "../services/apis/chatService";
import useSocketEvents from "../hooks/useSocket"; // ✅ your updated hook
import {fetchAllUsers} from "../services/apis/user.service";


interface Props {
  userId: number;
  onSelect: (user: number) => void;
}

export interface User {
  id: number;
  username: string;
  email: string;
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
  const [allUsers, setAllUsers] = useState<User[]>([]);


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

    const fetchAllUserdata = async () => {
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.log("Error fetching all users:", error);
      }
    };

    fetchRecentMessages();
    fetchAllUserdata();
  }, [userId]);

  return (
    <div className="w-1/3 border-r h-full overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Contacts</h2>
      {recentMessages.map((user) => (
        <div
          key={user.id}
          className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
          onClick={() => onSelect(user.userId)}
        >
          <span>{user.name}</span>
          <span className="text-gray-500 text-sm">{user.lastMessage}</span>
          
          {onlineUsers.includes(user.userId) && (
            <span className="text-green-500 text-sm">● Online</span>
          )}

        </div>
      ))}
      
      <div className="mt-40">
      <h2 className="p-4 font-bold text-lg">Contacts</h2>
      {allUsers.map((user) => (
        <div
          key={user.id}
          className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
          onClick={() => onSelect(user.id)}
        >
          <span>{user.username}</span>
          
        </div>
      ))}
    </div>

    </div>
  );
};

export default ContactList;
