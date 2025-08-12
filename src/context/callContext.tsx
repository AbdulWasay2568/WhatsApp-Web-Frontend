import React, { createContext, useContext, useEffect, useState } from "react";
import { setupSignaling } from "../services/apis/signaling";
import { useSocket } from "./socketContext";
import { useAuth } from "./Auth"; // ✅ Make sure this exists and provides userId

type CallStatus = "idle" | "calling" | "incoming" | "connected" | "rejected";

interface RemoteUser {
  id: number;
  name: string;
}

interface CallContextType {
  callType: "video" | "audio" | null;
  remoteUser: RemoteUser | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: CallStatus;
  incomingCall: CallData | null;

  setIncomingCall: (data: CallData | null) => void;
  startCall: (userId: number, type: "audio" | "video") => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  peerConnection: RTCPeerConnection | null;
  setPeerConnection: (pc: RTCPeerConnection | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setStatus: (status: CallStatus) => void;
}

interface CallData {
  from: number;
  offer: RTCSessionDescriptionInit;
  type: "video" | "audio";
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used inside CallProvider");
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { userId } = useAuth(); // ✅ get the caller ID

  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", (data: CallData) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
      setStatus("incoming");
    });

    socket.on("call:ended", () => {
      console.log("🔚 Call ended by other user");
      setIncomingCall(null);
      setStatus("idle");
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:ended");
    };
  }, [socket]);

  const startCall = async (calleeId: number, type: "audio" | "video") => {
    if (!userId || !socket) return;

    const pc = new RTCPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: type === "video",
      audio: true,
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    setPeerConnection(pc);
    setLocalStream(stream);
    setCallType(type);
    setRemoteUser({ id: calleeId, name: `User ${calleeId}` });
    setStatus("calling");

    const remote = new MediaStream();
    pc.ontrack = (event) => {
      remote.addTrack(event.track);
      setRemoteStream(remote);
    };

    setupSignaling(socket, pc, setRemoteStream);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          to: calleeId,
          candidate: event.candidate,
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:request", {
      from: userId,      // ✅ Correct: sender
      to: calleeId,      // ✅ Correct: receiver
      offer,
      type,
    });
  };

  const acceptCall = async () => {
    if (!incomingCall || !socket) return;

    const pc = new RTCPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: incomingCall.type === "video",
      audio: true,
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    setPeerConnection(pc);
    setLocalStream(stream);
    setCallType(incomingCall.type);
    setRemoteUser({ id: incomingCall.from, name: `User ${incomingCall.from}` });
    setStatus("connected");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    setupSignaling(socket, pc, setRemoteStream);
  };

  const rejectCall = () => {
    console.log("❌ Call rejected");
    setIncomingCall(null);
    setStatus("rejected");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const endCall = () => {
    console.log("🔚 Call ended");
    if (socket && remoteUser) {
      socket.emit("call:end", { to: remoteUser.id });
    }

    peerConnection?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());

    setCallType(null);
    setRemoteUser(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setStatus("idle");
    setPeerConnection(null);
  };

  return (
    <CallContext.Provider
      value={{
        callType,
        remoteUser,
        localStream,
        remoteStream,
        peerConnection,
        status,
        incomingCall,
        setPeerConnection,
        setLocalStream,
        setRemoteStream,
        setIncomingCall,
        setStatus,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
