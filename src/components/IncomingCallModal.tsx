import React from "react";
import { useCall } from "../context/callContext";
import { useSocket } from "../context/socketContext";

const IncomingCallModal: React.FC = () => {
  const { incomingCall, rejectCall, acceptCall, status } = useCall();

  if (!incomingCall || status !== "incoming") return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold">
          Incoming {incomingCall.type === "video" ? "📹 Video" : "🎙 Audio"} Call from User {incomingCall.from}
        </h2>

        <div className="flex justify-center gap-4">
          <button onClick={acceptCall} className="bg-green-600 text-white px-4 py-2 rounded">
            Accept
          </button>
          <button onClick={rejectCall} className="bg-red-500 text-white px-4 py-2 rounded">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
