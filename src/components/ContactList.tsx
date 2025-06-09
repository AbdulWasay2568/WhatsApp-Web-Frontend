import React, { useEffect, useState } from "react";
import { fetchRecentChats } from "../services/apis/chatService";

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

    useEffect(() => {
        const fetchRecentMessages = async()=> {
            try{
                const recentChatMessages = await fetchRecentChats(userId);
                setRecentMessages(recentChatMessages);
                }catch(error){
                    console.log("Error fetching recent messages:", error);
                }
            }
        fetchRecentMessages();
    }, [userId]);
  
  return (
    <div className="w-1/3 border-r h-full overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Contacts</h2>
      {recentMessages.map((user) => (
        <div
          key={user.userId}
          className="p-4 hover:bg-gray-100 cursor-pointer"
          onClick={() => {onSelect(user.userId); console.log("Selected user:", user.userId);}}
        >
          {user.name}
        </div>
      ))}
    </div>
  );
};

export default ContactList;
