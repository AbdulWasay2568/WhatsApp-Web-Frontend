import React, { useState } from "react";
import ContactList from "../components/ContactList";
import ChatScreen from "../components/ChatScreen";
import CallScreen from "../components/CallScreen"; // 👈 import the CallScreen
import { useAuth } from "../context/Auth";
import { useCall } from "../context/callContext";

const ChatPage: React.FC = () => {
  const { userId } = useAuth();
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const currentUserId = Number(userId);
  const { status } = useCall();

  return (
    <div className="flex h-screen relative">
      <ContactList userId={currentUserId} onSelect={setSelectedUser} />
      <ChatScreen selectedUser={selectedUser} userId={currentUserId} />
      {status !== "idle" && <CallScreen />} {/* ✅ Only show when in a call */}    
      </div>
  );
};

export default ChatPage;
