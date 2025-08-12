import { useSocket } from "../context/socketContext";
import { useEffect, useState } from "react";

export const useCall = (userId: number) => {
  const socket = useSocket();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    socket?.on("call:incoming", (call) => {
      setIncomingCall(call);
    });

    socket?.on("call:updated", (updatedCall) => {
      console.log("Call updated", updatedCall);
    });

    return () => {
      socket?.off("call:incoming");
      socket?.off("call:updated");
    };
  }, [socket]);

  return { incomingCall };
};
