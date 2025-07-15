import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socketContext";
import { getMessages } from "../services/apis/messageService";
import { uploadFile } from "../services/apis/fileService";
import Header from "./Header";

interface RawMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string | null;
  imageUrl: string | null;
}

interface ReplyData {
  id: number;
  content: string;
  sender: { id: number; username: string };
  originalMessageId: number;
}

interface Message {
  from: number;
  to: number;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  replyTo?: ReplyData;
  fileUrl?: string | null;
  imageUrl?: string | null;
  fileName?: string;
  fileSize?: number;
}

interface Props {
  userId: number;
  selectedUser: number;
}

const ChatScreen: React.FC<Props> = ({ selectedUser, userId }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<RawMessage | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const fetched: RawMessage[] = await getMessages(userId, selectedUser);
        const mapped: Message[] = fetched.map((msg) => ({
          from: msg.senderId,
          to: msg.receiverId,
          content: msg.content,
          timestamp: msg.createdAt,
          status: msg.status.toLowerCase() as "sent" | "delivered" | "read",
          fileUrl: msg.fileUrl,
          imageUrl: msg.imageUrl,
        }));
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchChat();
  }, [selectedUser, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg: Message) => {
      if (
        (msg.from === userId && msg.to === selectedUser) ||
        (msg.to === userId && msg.from === selectedUser)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleIncomingReply = (reply: any) => {
      setMessages((prev) => [
        ...prev,
        {
          from: reply.sender.id,
          to: reply.originalMessage.receiverId,
          content: reply.content,
          timestamp: reply.createdAt,
          status: reply.status.toLowerCase(),
          replyTo: {
            id: reply.originalMessage.id,
            content: reply.originalMessage.content,
            sender: reply.sender,
            originalMessageId: reply.originalMessage.id,
          },
          fileUrl: reply.fileUrl,
          imageUrl: reply.imageUrl,
        },
      ]);
    };

    socket.on("private:message", handleIncoming);
    socket.on("newReply", handleIncomingReply);
    socket.on("typing:start", (fromId: number) => fromId === selectedUser && setIsTyping(true));
    socket.on("typing:stop", (fromId: number) => fromId === selectedUser && setIsTyping(false));

    return () => {
      socket.off("private:message", handleIncoming);
      socket.off("newReply", handleIncomingReply);
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [socket, selectedUser, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    setUploading(true);

    let uploadedImageUrl: string | null = null;
    let uploadedFileUrl: string | null = null;
    let uploadedFileName: string | null = null;
    let uploadedFileSize: number | undefined;

    try {
      if (file) {
        const { url, originalName, mimeType, size } = await uploadFile(file);
        if (file.type.startsWith("image/")) {
          uploadedImageUrl = url;
        } else {
          uploadedFileUrl = url;
          uploadedFileName = originalName;
          uploadedFileSize = size;
        }
      }

      const payload = {
        to: selectedUser,
        content: uploadedFileName || input.trim(),
        fileUrl: uploadedFileUrl,
        imageUrl: uploadedImageUrl,
      };

      socket?.emit("private:message", payload);

      setMessages((prev) => [
        ...prev,
        {
          from: userId,
          to: selectedUser,
          content: payload.content,
          timestamp: new Date().toISOString(),
          status: "sent",
          fileUrl: uploadedFileUrl,
          imageUrl: uploadedImageUrl,
          fileName: uploadedFileName ?? undefined,
          fileSize: uploadedFileSize,
        },
      ]);

      setInput("");
      setFile(null);
      setPreviewUrl(null);
      socket?.emit("typing:stop", selectedUser);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    socket?.emit(value ? "typing:start" : "typing:stop", selectedUser);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="w-2/3 h-full flex flex-col">
      {/* <div className="p-4 border-b font-semibold bg-black-100"></div> */}
      <Header userId={userId} selectedUser={selectedUser} />


      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-xs group relative ${
              msg.from === userId ? "bg-green-100 self-end" : "bg-gray-200 self-start"
            }`}
          >
            {msg.replyTo && (
              <div className="text-xs text-gray-500 italic mb-1 border-l-2 pl-2 border-blue-400">
                {msg.replyTo.sender.username} replied: "
                {msg.replyTo.content.slice(0, 50)}..."
              </div>
            )}

            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="thumbnail"
                className="w-[50px] h-[50px] object-cover cursor-pointer rounded mb-1"
                onClick={() => setFullscreenImage(msg.imageUrl!)}
              />
            )}

            {msg.fileUrl && (
              <div className="flex items-center gap-1">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(msg.fileUrl!);
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = msg.content || "downloaded-file";
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error("Download failed:", err);
                    }
                  }}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  ⬇ {msg.content}
                </button>

                {msg.fileSize && (
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(msg.fileSize)})
                  </span>
                )}
              </div>
            )}

          </div>
        ))}

        {isTyping && <div className="text-sm text-gray-500 italic">Typing...</div>}
        <div ref={chatEndRef}></div>
      </div>

      <div className="p-4 border-t flex flex-col gap-2">
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-100 border-l-4 border-blue-500 mb-2 rounded relative">
            <p className="text-sm text-gray-600">
              Replying to: <strong>{replyingTo.content.slice(0, 80)}...</strong>
            </p>
            <button
              onClick={() => setReplyingTo(null)}
              className="absolute top-1 right-2 text-xs text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        )}

        {previewUrl && (
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <img src={previewUrl} alt="Preview" className="h-20 object-cover" />
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="text-red-500 text-xs"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {uploading && (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
            Uploading...
          </div>
        )}

        <div className="flex gap-2">
          <input type="file" onChange={handleFileChange} className="hidden" id="fileUpload" />
          <label htmlFor="fileUpload" className="bg-gray-200 px-3 py-2 rounded cursor-pointer">
            📎
          </label>
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
        </div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-2 right-2 text-white text-2xl font-bold"
            >
              ✕
            </button>
            <img
              src={fullscreenImage}
              alt="full"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
