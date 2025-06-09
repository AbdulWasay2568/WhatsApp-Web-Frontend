import React, { useState } from "react";
import ContactList from "../components/ContactList";
import ChatScreen from "../components/ChatScreen";
import { useAuth } from "../context/Auth";


const ChatPage: React.FC = () => {
    const { userId } = useAuth();
    console.log(userId);

    
    const [selectedUser, setSelectedUser] = useState<number>(0);
    
    const currentUserId = Number(userId); 

  return (
    <div className="flex h-screen">
        <ContactList userId={currentUserId} onSelect={setSelectedUser} />
        <ChatScreen selectedUser={selectedUser} userId={currentUserId} />
    </div>
  );
};

export default ChatPage;
