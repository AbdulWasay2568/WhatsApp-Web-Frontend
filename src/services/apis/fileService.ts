import { apiClient } from './axios';


// fileService.ts
export const uploadFile = async (file: File): Promise<{
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log("File uploaded successfully:", response.data);

  return response.data;
};
