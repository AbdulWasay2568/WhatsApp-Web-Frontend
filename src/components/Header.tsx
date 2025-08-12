import React from "react";
import IncomingCallModal from "./IncomingCallModal";
import CallButton from "./CallButton";

interface Props {
  userId: number;
  selectedUser: number;
}

const Header: React.FC<Props> = ({ userId, selectedUser }) => {
  return (
    <div className="p-4 border-b font-semibold bg-gray-100 flex justify-between items-center">
      <div>Chat with User {selectedUser}</div>
      <div className="flex gap-2">
        <CallButton userId={userId} selectedUser={selectedUser} type="audio" />
        <CallButton userId={userId} selectedUser={selectedUser} type="video" />
      </div>

      {/* ✅ Remove the prop — it's not needed anymore */}
      <IncomingCallModal />
    </div>
  );
};

export default Header;
