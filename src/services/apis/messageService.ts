import { apiClient } from './axios';

export interface MessagePayload {
  content: string;
  senderId: number;
  receiverId: number;
  imageUrl?: string;
  fileUrl?: string;
}

export interface ReactionPayload {
  emoji: string;
  userId: number;
  messageId: number;
}

export interface ReplyPayload {
  content: string;
  senderId: number;
  originalMessageId: number;
}

// 📨 Send a new message
export const sendMessage = async (data: MessagePayload) => {
  const response = await apiClient.post('/messages', data);
  return response.data;
};

// 📩 Get all messages between two users
export const getMessages = async (userId1: number, userId2: number) => {
  const response = await apiClient.get(`/messages/${userId1}/${userId2}`);
  return response.data;
};

// 🗑️ Delete a message by ID
export const deleteMessage = async (messageId: number) => {
  const response = await apiClient.delete(`/messages/${messageId}`);
  return response.data;
};

// 😀 Add emoji reaction to a message
export const addReaction = async (data: ReactionPayload) => {
  const response = await apiClient.post(`/messages/${data.messageId}/reactions`, data);
  return response.data;
};

// ❌ Remove reaction by user from a message
export const removeReaction = async (messageId: number, userId: number) => {
  const response = await apiClient.delete(`/messages/${messageId}/reactions/${userId}`);
  return response.data;
};

// 💬 Reply to a message
export const sendReply = async (data: ReplyPayload) => {
  const response = await apiClient.post(`/messages/${data.originalMessageId}/replies`, data);
  return response.data;
};

// 🖼️ Upload image/file (assumes you have a file upload route)
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
