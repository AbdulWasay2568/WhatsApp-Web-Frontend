import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./Auth";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userId: number | null;
  onlineUsers: number[];
  connectionError: string | null;
}

const socketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !userId) {
      console.log("⏳ Waiting for auth token and userId");
      return;
    }

    console.log(`🔌 Initializing Socket.io connection for userId: ${userId}`);
    
    const socketUrl = (import.meta as any).env.VITE_API_URL as string;
    
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // ✅ Connection Events
    newSocket.on("connect", () => {
      console.log("✅ Socket.io connected successfully");
      setIsConnected(true);
      setConnectionError(null);
      
      // Emit online presence
      newSocket.emit("presence:online");
      
      // Request online users list
      newSocket.emit("online:get-users");
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("🔴 Socket.io disconnected:", reason);
      setIsConnected(false);
      
      // Emit offline presence
      newSocket.emit("presence:offline");
    });

    newSocket.on("connect_error", (error: any) => {
      console.error("❌ Socket.io connection error:", error);
      setConnectionError(error.message || "Connection failed");
      setIsConnected(false);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("🔄 Socket.io reconnecting...");
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Socket.io reconnection failed");
      setConnectionError("Failed to reconnect");
    });

    // ✅ Online Users Events
    newSocket.on("online-users", (users: number[]) => {
      console.log("👥 Online users:", users);
      setOnlineUsers(users);
    });

    newSocket.on("user:online", (data: { userId: number; timestamp?: string }) => {
      console.log("✅ User came online:", data.userId);
      setOnlineUsers((prev: number[]) => 
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      );
    });

    newSocket.on("online", (onlineUserId: number) => {
      console.log("✅ User online:", onlineUserId);
      setOnlineUsers((prev: number[]) => 
        prev.includes(onlineUserId) ? prev : [...prev, onlineUserId]
      );
    });

    newSocket.on("offline", (offlineUserId: number) => {
      console.log("❌ User offline:", offlineUserId);
      setOnlineUsers((prev: number[]) => prev.filter((id: number) => id !== offlineUserId));
    });

    // ✅ Error Events
    newSocket.on("error", (errorData: any) => {
      console.error("❌ Socket error:", errorData);
      setConnectionError(errorData?.message || "An error occurred");
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up Socket.io connection");
      newSocket.emit("presence:offline");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    };
  }, [token, userId]);

  return (
    <socketContext.Provider 
      value={{ 
        socket, 
        isConnected, 
        userId: userId || null, 
        onlineUsers,
        connectionError 
      }}
    >
      {children}
    </socketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(socketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketContextProvider");
  }
  return context;
};
