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

Object.keys(sessionStorage).forEach(k => console.log(k, sessionStorage.getItem(k)?.slice(0,150)))
const token = sessionStorage.getItem("access_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("your ID:", payload.sub); // should log: 69b7e36801e0a06c2e8a50e5
// ─────────────────────────────────────────────
// 1. CONVERSATIONS
// ─────────────────────────────────────────────

/** Create a 1:1 DM or group conversation.
 *  1:1:   createConversation({ participants: ["userId"] })
 *  Group: createConversation({ is_group: true, group_name: "Team", participants: ["id1","id2"] })
 */
export const createConversation = (payload) =>
  api.post("/messages/conversations", payload);

/** List all conversations sorted by latest message.
 *  getConversations({ limit: 20, cursor: "..." })
 */
export const getConversations = ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get("/messages/conversations", { params });
};

/** Get a single conversation by ID. */
export const getConversation = (conversationId) =>
  api.get(`/messages/conversations/${conversationId}`);

/** Update group name or settings. Only group owner/admin. */
export const updateConversation = (conversationId, payload) =>
  api.patch(`/messages/conversations/${conversationId}`, payload);

/** Leave a conversation (hides 1:1 | removes from group | owner deletes group). */
export const leaveConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}`);

/** Pin a conversation for the logged-in user. */
export const pinConversation = (conversationId) =>
  api.post(`/messages/conversations/${conversationId}/pin`);

/** Unpin a conversation. */
export const unpinConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}/pin`);

/** Archive a conversation for the logged-in user. */
export const archiveConversation = (conversationId) =>
  api.post(`/messages/conversations/${conversationId}/archive`);

/** Unarchive a conversation. */
export const unarchiveConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}/archive`);

// ─────────────────────────────────────────────
// 2. MESSAGES
// ─────────────────────────────────────────────

/** Send a text message.
 *  sendMessage(convId, { message_type: "text", content: "Hello!" })
 *  Reply: sendMessage(convId, { message_type: "text", content: "Reply!", reply_to: messageId })
 *  Media: sendMessage(convId, { message_type: "image", media_key: "social/..." })
 */
export const sendMessage = (conversationId, payload) =>
  api.post(`/messages/conversations/${conversationId}/messages`, payload);

/** Get all messages in a conversation. Oldest-first. Cursor-based pagination.
 *  getMessages(convId, { limit: 50, cursor: "..." })
 */
export const getMessages = (conversationId, { limit = 50, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get(`/messages/conversations/${conversationId}/messages`, {
    params,
  });
};

/** Edit message content. Only the sender can edit. */
export const editMessage = (messageId, content) =>
  api.patch(`/messages/messages/${messageId}`, { content });

/** Soft delete a message. Only the sender can delete. */
export const deleteMessage = (messageId) =>
  api.delete(`/messages/messages/${messageId}`);

/** Add an emoji reaction to a message.
 *  addReaction("messageId", "❤️")
 */
export const addReaction = (messageId, emoji) =>
  api.post(`/messages/messages/${messageId}/reactions`, { emoji });

/** Remove your reaction from a message.
 *  removeReaction("messageId", "❤️")
 */
export const removeReaction = (messageId, emoji) =>
  api.delete(`/messages/messages/${messageId}/reactions`, {
    params: { emoji },
  });

/** Mark a message as read. Also resets conversation unread count for this user. */
export const markMessageRead = (messageId) =>
  api.post(`/messages/messages/${messageId}/read`);

/** Forward a message to one or more conversations.
 *  forwardMessage("messageId", ["convId1", "convId2"])
 */
export const forwardMessage = (messageId, targetConversations) =>
  api.post(`/messages/messages/${messageId}/forward`, {
    target_conversations: targetConversations,
  });

// ─────────────────────────────────────────────
// 3. MEDIA UPLOAD
// ─────────────────────────────────────────────

/** Step 1 — Get a presigned Wasabi upload URL (expires in 5 min).
 *  getUploadUrl({ file_name: "photo.jpg", file_type: "image/jpeg", file_size: 1024000 })
 *  Returns: { upload_url, key, expires_in }
 */
export const getUploadUrl = (payload) =>
  api.post("/messages/media/upload-url", payload);

/** Step 2 — PUT file directly to Wasabi (uses plain fetch, no auth headers).
 *  uploadFileToWasabi(upload_url, file)
 */
export const uploadFileToWasabi = async (uploadUrl, file) => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload file to storage");
  return true;
};

/** All-in-one helper — step 1 + step 2. Returns media_key for sendMessage.
 *  const mediaKey = await uploadMedia(file);
 *  await sendMessage(convId, { message_type: "image", media_key: mediaKey });
 */
export const uploadMedia = async (file) => {
  const { upload_url, key } = await getUploadUrl({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
  });
  await uploadFileToWasabi(upload_url, file);
  return key;
};

/** Get a signed view URL for already-uploaded media. Valid for 7 days.
 *  getViewUrl("social/userId/dm_attachment/filename.jpg")
 *  Returns: { view_url }
 */
export const getViewUrl = (key) =>
  api.post("/messages/media/view-url", { key });

// ─────────────────────────────────────────────
// 4. BLOCK & PRIVACY
// ─────────────────────────────────────────────

/** Check if you blocked a user or they blocked you.
 *  Returns: { blocked: false, blocked_by: false }
 */
export const checkBlocked = (userId) =>
  api.get(`/users/${userId}/blocked-check`);

/** Block a user. Removes existing follow relationships.
 *  blockUser("userId", "Spam")
 */
export const blockUser = (userId, reason = "") =>
  api.post(`/users/${userId}/block`, { reason });

/** Unblock a previously blocked user. */
export const unblockUser = (userId) => api.delete(`/users/${userId}/block`);