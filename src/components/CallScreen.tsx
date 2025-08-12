import React, { useEffect, useRef, useState } from "react";
import { useCall } from "../context/callContext";

const CallScreen: React.FC = () => {
  const {
    callType,
    remoteUser,
    localStream,
    remoteStream,
    status,
    endCall,
  } = useCall();

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [callTime, setCallTime] = useState(0); // in seconds

  // Set streams to video elements
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [remoteStream, localStream]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "connected") {
      timer = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 text-white flex items-center justify-center z-50">
      <div className="absolute top-4 left-4 text-lg font-semibold">
        {remoteUser?.name || "Unknown User"}
      </div>

      {callType === "video" && (
        <>
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-xl">Waiting for user to join...</div>
          )}

          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-[100px] h-[100px] rounded object-cover border-2 border-white"
            />
          )}
        </>
      )}

      {callType === "audio" && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">{remoteUser?.name || "User"}</h2>
          <p className="mb-4">
            {status === "calling" && "Ringing..."}
            {status === "connected" && `On call (${formatTime(callTime)})`}
            {status === "rejected" && "Call Rejected"}
          </p>
        </div>
      )}

      <button
        onClick={endCall}
        className="absolute bottom-10 bg-red-600 px-6 py-2 rounded-full text-white text-lg hover:bg-red-700"
      >
        Hang Up
      </button>
    </div>
  );
};

export default CallScreen;
