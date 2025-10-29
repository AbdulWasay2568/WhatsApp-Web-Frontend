import React, { useEffect, useRef, useState } from "react";
import { getMessages, uploadFile } from "../services/apis/messageService";
import Header from "./Header";
import { useChatSocket } from "../hooks/useChatSocket";

interface Props {
  userId: number;
  selectedUser: number;
}

const ChatScreen: React.FC<Props> = ({ userId, selectedUser }) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const { messages = [], setMessages, isTyping, sendMessageSocket, sendTypingStatus } =
    useChatSocket(userId, selectedUser);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const fetched = await getMessages(userId, selectedUser);
        setMessages(
          fetched.map((msg: any) => ({
            from: msg.senderId,
            to: msg.receiverId,
            content: msg.content,
            timestamp: msg.createdAt,
            status: msg.status.toLowerCase(),
            fileUrl: msg.fileUrl,
            imageUrl: msg.imageUrl,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchChat();
  }, [userId, selectedUser, setMessages]);

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

    try {
      let uploadedImageUrl: string | null = null;
      let uploadedFileUrl: string | null = null;
      let uploadedFileName: string | null = null;
      let uploadedFileSize: number | undefined;

      if (file) {
        const { url, originalName, size } = await uploadFile(file);
        if (file.type.startsWith("image/")) uploadedImageUrl = url;
        else {
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

      sendMessageSocket(payload);

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
      sendTypingStatus(false);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="w-2/3 h-full flex flex-col">
      <Header userId={userId} selectedUser={selectedUser} />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-xs group relative ${
              msg.from === userId ? "bg-green-100 self-end" : "bg-gray-200 self-start"
            }`}
          >
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="thumbnail"
                className="w-[50px] h-[50px] object-cover cursor-pointer rounded mb-1"
                onClick={() => setFullscreenImage(msg.imageUrl!)}
              />
            )}

            {msg.fileUrl && (
              <div className="flex items-center gap-1 mb-1">
                <button
                  onClick={async () => {
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
                  }}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  ⬇ {msg.content}
                </button>
                {msg.fileSize && (
                  <span className="text-xs text-gray-500">({formatFileSize(msg.fileSize)})</span>
                )}
              </div>
            )}

            <p className="text-sm break-words">{msg.content}</p>
          </div>
        ))}
        {isTyping && <div className="text-sm text-gray-500 italic">Typing...</div>}
        <div ref={chatEndRef}></div>
      </div>

      <div className="p-4 border-t flex flex-col gap-2">
        {previewUrl && (
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <img src={previewUrl} alt="Preview" className="h-20 object-cover" />
            <button onClick={() => setPreviewUrl(null)} className="text-red-500 text-xs">
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
            <img src={fullscreenImage} alt="full" className="max-h-[90vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
