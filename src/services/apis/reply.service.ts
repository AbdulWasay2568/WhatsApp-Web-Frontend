import { apiClient } from './axios';

export interface CreateReplyDto {
  content: string;
  originalMessageId: number;
  senderId: number;
  fileUrl?: string;
  imageUrl?: string;
  status: "Sent" | "Delivered" | "Read";
}

export interface Reply {
  id: number;
  content: string;
  senderId: number;
  sender: {
    id: number;
    username: string;
  };
  originalMessageId: number;
  originalMessage: {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  fileUrl?: string | null;
  imageUrl?: string | null;
  status: "Sent" | "Delivered" | "Read";
}

// ✅ Create a reply
export const createReply = async (data: CreateReplyDto): Promise<Reply> => {
  const response = await apiClient.post("/replies", data);
  return response.data;
};

// ✅ Get all replies for a specific message
export const getRepliesForMessage = async (messageId: number): Promise<Reply[]> => {
  const response = await apiClient.get(`/replies/message/${messageId}`);
  return response.data;
};

// ✅ Get a single reply
export const getReplyById = async (replyId: number): Promise<Reply> => {
  const response = await apiClient.get(`/replies/${replyId}`);
  return response.data;
};

// ❌ Delete a reply
export const deleteReply = async (replyId: number): Promise<void> => {
  await apiClient.delete(`/replies/${replyId}`);
};
