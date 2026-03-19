import axios from "axios";

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
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
  (res) => res,
  (err) => Promise.reject(err)
);

// ─────────────────────────────────────────────
// HELPERS — unwrap API response shapes
//   Shape A: { data: { data: { conversations: [] } } }
//   Shape B: { data: { conversations: [] } }
//   Shape C: { data: { ... } }   ← single object
// ─────────────────────────────────────────────

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// ─────────────────────────────────────────────
// 1. CONVERSATIONS
// ─────────────────────────────────────────────

export const createConversation = async (payload) => {
  const res = await api.post("/messages/conversations", payload);
  return unwrap(res); // returns the conversation object
};

export const getConversations = async ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get("/messages/conversations", { params });
  return unwrap(res); // returns { conversations, has_more, next_cursor }
};

export const getConversation = async (conversationId) => {
  const res = await api.get(`/messages/conversations/${conversationId}`);
  return unwrap(res);
};

export const updateConversation = async (conversationId, payload) => {
  const res = await api.patch(`/messages/conversations/${conversationId}`, payload);
  return unwrap(res);
};

export const leaveConversation = async (conversationId) => {
  const res = await api.delete(`/messages/conversations/${conversationId}`);
  return unwrap(res);
};

export const pinConversation = async (conversationId) => {
  const res = await api.post(`/messages/conversations/${conversationId}/pin`);
  return unwrap(res);
};

export const unpinConversation = async (conversationId) => {
  const res = await api.delete(`/messages/conversations/${conversationId}/pin`);
  return unwrap(res);
};

export const archiveConversation = async (conversationId) => {
  const res = await api.post(`/messages/conversations/${conversationId}/archive`);
  return unwrap(res);
};

export const unarchiveConversation = async (conversationId) => {
  const res = await api.delete(`/messages/conversations/${conversationId}/archive`);
  return unwrap(res);
};

// ─────────────────────────────────────────────
// 2. MESSAGES
// ─────────────────────────────────────────────

export const sendMessage = async (conversationId, payload) => {
  const res = await api.post(
    `/messages/conversations/${conversationId}/messages`,
    payload
  );
  return unwrap(res); // returns the new message object
};

export const getMessages = async (conversationId, { limit = 50, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get(
    `/messages/conversations/${conversationId}/messages`,
    { params }
  );
  return unwrap(res); // returns { messages, has_more, next_cursor }
};

export const editMessage = async (messageId, content) => {
  const res = await api.patch(`/messages/messages/${messageId}`, { content });
  return unwrap(res);
};

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/messages/messages/${messageId}`);
  return unwrap(res);
};

export const addReaction = async (messageId, emoji) => {
  const res = await api.post(`/messages/messages/${messageId}/reactions`, { emoji });
  return unwrap(res);
};

export const removeReaction = async (messageId, emoji) => {
  const res = await api.delete(`/messages/messages/${messageId}/reactions`, {
    params: { emoji },
  });
  return unwrap(res);
};

export const markMessageRead = async (messageId) => {
  const res = await api.post(`/messages/messages/${messageId}/read`);
  return unwrap(res);
};

export const forwardMessage = async (messageId, targetConversations) => {
  const res = await api.post(`/messages/messages/${messageId}/forward`, {
    target_conversations: targetConversations,
  });
  return unwrap(res);
};

// ─────────────────────────────────────────────
// 3. MEDIA UPLOAD
// ─────────────────────────────────────────────

export const getUploadUrl = async (payload) => {
  const res = await api.post("/messages/media/upload-url", payload);
  return unwrap(res); // returns { upload_url, key }
};

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

export const getViewUrl = async (key) => {
  const res = await api.post("/messages/media/view-url", { key });
  return unwrap(res);
};

// ─────────────────────────────────────────────
// 4. BLOCK & PRIVACY
// ─────────────────────────────────────────────

export const checkBlocked = async (userId) => {
  const res = await api.get(`/users/${userId}/blocked-check`);
  return unwrap(res);
};

export const blockUser = async (userId, reason = "") => {
  const res = await api.post(`/users/${userId}/block`, { reason });
  return unwrap(res);
};

export const unblockUser = async (userId) => {
  const res = await api.delete(`/users/${userId}/block`);
  return unwrap(res);
};