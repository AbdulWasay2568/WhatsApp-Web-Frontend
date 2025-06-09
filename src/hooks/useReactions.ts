import { useSocket } from "../context/socketContext";
import { useEffect } from "react";

export const useReactions = () => {
  const socket = useSocket();

  useEffect(() => {
    socket?.on("reaction:update", (reaction) => {
      console.log("Reaction updated", reaction);
    });

    return () => {
      socket?.off("reaction:update");
    };
  }, [socket]);
};
