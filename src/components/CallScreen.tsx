import React, { useEffect, useRef, useState } from "react";
import { useCall } from "../context/callContext";

const CallScreen: React.FC = () => {
  const {
    callType,
    remoteUser,
    localStream,
    remoteStream,
    status,
    endCall: contextEndCall,
    acceptCall,
    rejectCall,
  } = useCall();

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [callTime, setCallTime] = useState(0); // in seconds

  // Wrapper for endCall to reset timer
  const endCall = () => {
    setCallTime(0);
    contextEndCall();
  };

  // Reset timer when call ends
  useEffect(() => {
    if (status === "idle") {
      setCallTime(0);
    }
  }, [status]);

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
    let timer: ReturnType<typeof setInterval>;

    // Start timer when call is initiated or connected
    if (status === "connected" || status === "calling") {
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
            {status === "incoming" && "Incoming call..."}
            {status === "connected" && `On call (${formatTime(callTime)})`}
            {status === "rejected" && "Call Rejected"}
          </p>
          {/* Show timer for both calling and connected states */}
          {(status === "calling" || status === "connected") && (
            <p className="text-gray-300 text-sm">
              Duration: {formatTime(callTime)}
            </p>
          )}
        </div>
      )}

      {/* Show Answer/Reject buttons for incoming calls */}
      {status === "incoming" && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={acceptCall}
            className="bg-green-600 px-8 py-3 rounded-full text-white text-lg font-semibold hover:bg-green-700 transition"
          >
            ✓ Accept
          </button>
          <button
            onClick={rejectCall}
            className="bg-red-600 px-8 py-3 rounded-full text-white text-lg font-semibold hover:bg-red-700 transition"
          >
            ✕ Reject
          </button>
        </div>
      )}

      {/* Show Hangup button for connected or calling (outgoing) calls */}
      {(status === "connected" || status === "calling") && (
        <button
          onClick={endCall}
          className="absolute bottom-10 bg-red-600 px-6 py-2 rounded-full text-white text-lg hover:bg-red-700"
        >
          Hang Up
        </button>
      )}
    </div>
  );
};

export default CallScreen;
