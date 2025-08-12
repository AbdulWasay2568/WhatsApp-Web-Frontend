import { apiClient } from './axios';

export const fetchRecentChats = async (userId: number) => {
  const res = await apiClient.get(`/chats/recent/${userId}`);
  return res.data;
};

export const markMessagesAsRead = async (senderId: number, receiverId: number) => {
  const res = await apiClient.post("/messages/mark-read", { senderId, receiverId });
  return res.data;
};
