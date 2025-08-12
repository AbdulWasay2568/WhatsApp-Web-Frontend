import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./Auth";
import { setupSignaling } from "../services/apis/signaling"; // Adjust the import path as necessary

interface socketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const socketContext = createContext<socketContextType | undefined>(undefined);

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !userId) return;

    console.log('token', token);
    console.log('userId', userId);

    const newSocket = io(import.meta.env.VITE_API_URL as string, {
      transports: ["websocket"],
      withCredentials: true,  
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Unified socket connected");
      setIsConnected(true);
      
      newSocket.emit("presence:online", userId); // Example channel
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Unified socket disconnected");
      setIsConnected(false);
    });

    return () => {
      newSocket.emit("presence:offline", userId);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token, userId]);

  return (
    <socketContext.Provider value={{ socket, isConnected }}>
      {children}
    </socketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(socketContext);
  if (!context) throw new Error("useSocket must be used within SocketContextProvider");
  return context;
};
