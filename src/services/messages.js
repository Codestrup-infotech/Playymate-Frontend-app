import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
});

// Same token logic as wallet page
const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
};

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap res.data.data on success | throw readable error on failure
api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error_code ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────
// 1. CONVERSATIONS
// ─────────────────────────────────────────────

export const createConversation = (payload) =>
  api.post("/messages/conversations", payload);

export const getConversations = ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get("/messages/conversations", { params });
};

export const getConversation = (conversationId) =>
  api.get(`/messages/conversations/${conversationId}`);

export const updateConversation = (conversationId, payload) =>
  api.patch(`/messages/conversations/${conversationId}`, payload);

export const leaveConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}`);

export const pinConversation = (conversationId) =>
  api.post(`/messages/conversations/${conversationId}/pin`);

export const unpinConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}/pin`);

export const archiveConversation = (conversationId) =>
  api.post(`/messages/conversations/${conversationId}/archive`);

export const unarchiveConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}/archive`);

// ─────────────────────────────────────────────
// 2. MESSAGES
// ─────────────────────────────────────────────

export const sendMessage = (conversationId, payload) =>
  api.post(`/messages/conversations/${conversationId}/messages`, payload);

export const getMessages = (conversationId, { limit = 50, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get(`/messages/conversations/${conversationId}/messages`, { params });
};

export const editMessage = (messageId, content) =>
  api.patch(`/messages/messages/${messageId}`, { content });

export const deleteMessage = (messageId) =>
  api.delete(`/messages/messages/${messageId}`);

export const addReaction = (messageId, emoji) =>
  api.post(`/messages/messages/${messageId}/reactions`, { emoji });

export const removeReaction = (messageId, emoji) =>
  api.delete(`/messages/messages/${messageId}/reactions`, { params: { emoji } });

export const markMessageRead = (messageId) =>
  api.post(`/messages/messages/${messageId}/read`);

export const forwardMessage = (messageId, targetConversations) =>
  api.post(`/messages/messages/${messageId}/forward`, {
    target_conversations: targetConversations,
  });

// ─────────────────────────────────────────────
// 3. MEDIA UPLOAD
// ─────────────────────────────────────────────

export const getUploadUrl = (payload) =>
  api.post("/messages/media/upload-url", payload);

export const uploadFileToWasabi = async (uploadUrl, file) => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload file to storage");
  return true;
};

export const uploadMedia = async (file) => {
  const { upload_url, key } = await getUploadUrl({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
  });
  await uploadFileToWasabi(upload_url, file);
  return key;
};

export const getViewUrl = (key) =>
  api.post("/messages/media/view-url", { key });

// ─────────────────────────────────────────────
// 4. BLOCK & PRIVACY
// ─────────────────────────────────────────────

export const checkBlocked = (userId) =>
  api.get(`/users/${userId}/blocked-check`);

export const blockUser = (userId, reason = "") =>
  api.post(`/users/${userId}/block`, { reason });

export const unblockUser = (userId) =>
  api.delete(`/users/${userId}/block`);