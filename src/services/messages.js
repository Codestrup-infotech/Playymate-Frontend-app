import axios from "axios";

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// ─────────────────────────────────────────────
// TOKEN HELPER (SSR SAFE)
// ─────────────────────────────────────────────

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
};

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR (AUTO AUTH)
// ─────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────
// ✅ Return raw axios response — callers unwrap themselves.
//    The old `res.data?.data || res.data` stripped the response
//    object, which made error.response undefined in catch blocks
//    and caused "is not a function" when consuming returned values.
// ─────────────────────────────────────────────

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

  export const forwardMessage = (messageId, targetConversations) => {
    return api.post(`/messages/messages/${messageId}/forward`, {
      target_conversations: targetConversations,
    });
  };

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

// ─────────────────────────────────────────────
// 4. MESSAGE REQUESTS (for shared content)
// ─────────────────────────────────────────────

/**
 * Get pending message requests
 * Returns requests with shared_content (post/reel preview)
 */
export const getMessageRequests = ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get("/messages/requests", { params });
};

/**
 * Accept a message request
 */
export const acceptMessageRequest = (conversationId) =>
  api.post(`/messages/requests/${conversationId}/accept`);

/**
 * Decline a message request
 */
export const declineMessageRequest = (conversationId) =>
  api.post(`/messages/requests/${conversationId}/decline`);

/**
 * Block user and decline request
 */
export const blockAndDeclineRequest = (conversationId) =>
  api.post(`/messages/requests/${conversationId}/block`);