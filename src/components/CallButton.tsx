import React from "react";
import { useCall } from "../context/callContext";

interface Props {
  userId: number;
  selectedUser: number;
  type: "audio" | "video";
}

const CallButton: React.FC<Props> = ({ selectedUser, type }) => {
  const { startCall } = useCall();

  const handleClick = () => {
    if (selectedUser === 0) return alert("Select a user first.");
    startCall(selectedUser, type);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-500 text-white px-4 py-1 rounded text-sm"
    >
      Start {type === "video" ? "📹 Video" : "🎙 Audio"} Call
    </button>
  );
};

export default CallButton;
