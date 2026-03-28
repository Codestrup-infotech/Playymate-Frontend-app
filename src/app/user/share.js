/**
 * Share & Bookmarks API Service
 * Base URL: /api/v1
 * All endpoints require Authorization: Bearer {token}
 */

// Determine base URL - handle both cases: with or without /api/v1
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    // Remove trailing slash and check if it already includes /api/v1
    const cleanUrl = envUrl.replace(/\/$/, '');
    return cleanUrl.includes('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  }
  return "http://localhost:5000/api/v1";
};

const BASE_URL = getBaseUrl();

// ─── Helpers ────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  if (typeof window === "undefined") {
    throw new Error("Auth headers requested outside browser context");
  }

  // Tokens are stored inconsistently across login flows; support all known keys.
  const token =
    window.sessionStorage.getItem("access_token") ||
    window.sessionStorage.getItem("accessToken") ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("playymate_access_token") ||
    window.sessionStorage.getItem("playymate_access_token");

  if (!token) {
    throw new Error("No auth token found (expected accessToken/access_token)");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  const data = await res.json();
  console.log("[API Response] Status:", res.status, "Body:", data);
  if (!res.ok || !data.success) {
    const err = new Error(data.message || "Request failed");
    err.code = data.error;
    err.status = res.status;
    console.log("[API Error]", { code: err.code, status: err.status, message: err.message });
    throw err;
  }
  return data.data;
}

// ─── Sharing API ─────────────────────────────────────────────────────────────

/**
 * Share content externally (generates a share link/record)
 * @param {"post"|"reel"|"story"} contentType
 * @param {string} contentId
 * @returns {Promise<Object>} share record
 */
export async function shareExternal(contentType, contentId, thumbnail = null, title = null) {
  console.log('[shareExternal] API Request:', { content_id: contentId, content_type: contentType, shared_to: "external", thumbnail, title });
  const res = await fetch(`${BASE_URL}/shares`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content_id: contentId,
      content_type: contentType,
      shared_to: "external",
      thumbnail,
      title,
    }),
  });
  const result = await handleResponse(res);
  console.log('[shareExternal] API Response:', result);
  return result;
}

/**
 * Share content via Direct Message to another user
 * @param {"post"|"reel"|"story"} contentType
 * @param {string} contentId
 * @param {string} recipientId  - target user's ID
 * @param {string} [message]    - optional message to attach
 * @returns {Promise<Object>} share record with conversation_id
 */
export async function shareViaDM(contentType, contentId, recipientId, message = "", thumbnail = null, title = null) {
  console.log('[shareViaDM] API Request:', { content_id: contentId, content_type: contentType, shared_to: "direct_message", recipient_id: recipientId, message, thumbnail, title });
  const res = await fetch(`${BASE_URL}/shares`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content_id: contentId,
      content_type: contentType,
      shared_to: "direct_message",
      recipient_id: recipientId,
      message,
      thumbnail,
      title,
    }),
  });
  const result = await handleResponse(res);
  console.log('[shareViaDM] API Response:', result);
  return result;
}

/**
 * Get share history for the logged-in user (newest first)
 * @param {number} [limit=20]
 * @param {string} [cursor]   - for pagination
 * @returns {Promise<{ shares: Array, next_cursor: string|null, has_more: boolean }>}
 */
export async function getShareHistory(limit = 20, cursor = null) {
  const params = new URLSearchParams({ limit });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${BASE_URL}/shares?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get total share count for a post
 * @param {string} postId
 * @param {string} contentType - optional content type (post, reel, etc)
 * @returns {Promise<{ count: number }>}
 */
export async function getPostShareCount(postId, contentType = "post") {
  const res = await fetch(`${BASE_URL}/posts/${postId}/shares/count?content_type=${contentType}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get total share count for a reel
 * @param {string} reelId
 * @returns {Promise<{ count: number }>}
 */
export async function getReelShareCount(reelId) {
  const res = await fetch(`${BASE_URL}/reels/${reelId}/shares/count`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// ─── Bookmarks API ────────────────────────────────────────────────────────────

/**
 * Bookmark a post or reel
 * @param {"post"|"reel"|"story"} contentType
 * @param {string} contentId
 * @param {string} [notes]
 * @returns {Promise<Object>} bookmark record
 * @throws Will throw with code "ALREADY_BOOKMARKED" if duplicate
 */
export async function addBookmark(contentType, contentId, notes = null) {
  console.log("[addBookmark] API Request:", { contentType, contentId, notes });
  const body = { content_id: contentId, content_type: contentType };
  if (notes) body.notes = notes;

  const res = await fetch(`${BASE_URL}/bookmarks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const result = await handleResponse(res);
  console.log("[addBookmark] API Response:", result);
  return result;
}

/**
 * Get all bookmarks for the logged-in user
 * @param {number} [limit=20]
 * @param {"post"|"reel"|"story"|null} [contentType]  - optional filter
 * @param {string} [cursor]
 * @returns {Promise<{ bookmarks: Array, next_cursor: string|null, has_more: boolean }>}
 */
export async function getBookmarks(limit = 20, contentType = null, cursor = null) {
  const params = new URLSearchParams({ limit });
  if (contentType) params.set("content_type", contentType);
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${BASE_URL}/bookmarks?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * Check if a specific piece of content is bookmarked
 * @param {string} contentId
 * @param {"post"|"reel"|"story"} contentType
 * @returns {Promise<{ bookmarked: boolean, bookmark_id: string|null }>}
 */
export async function checkBookmark(contentId, contentType) {
  console.log("[checkBookmark] API Request:", { contentId, contentType });
  const params = new URLSearchParams({ content_id: contentId, content_type: contentType });
  const res = await fetch(`${BASE_URL}/bookmarks/check?${params}`, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(res);
  console.log("[checkBookmark] API Response:", result);
  return result;
}

/**
 * Remove a bookmark by its ID
 * @param {string} bookmarkId  - the _id field from bookmark record
 * @returns {Promise<{ removed: boolean }>}
 */
export async function removeBookmark(bookmarkId) {
  console.log("[removeBookmark] API Request:", { bookmarkId });
  const res = await fetch(`${BASE_URL}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(res);
  console.log("[removeBookmark] API Response:", result);
  return result;
}

// ─── Bookmark Collections API ─────────────────────────────────────────────────

/**
 * Create a new bookmark collection
 * @param {string} collectionName
 * @param {string} [description]
 * @param {"private"|"followers_only"|"public"} [visibility="private"]
 * @returns {Promise<Object>} collection record
 */
export async function createCollection(collectionName, description = "", visibility = "private") {
  console.log("[createCollection] API Request:", { collectionName, description, visibility });
  const res = await fetch(`${BASE_URL}/bookmarks/collections`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      collection_name: collectionName,
      description,
      visibility,
    }),
  });
  const result = await handleResponse(res);
  console.log("[createCollection] API Response:", result);
  return result;
}

/**
 * Get all bookmark collections for the logged-in user
 * @returns {Promise<{ collections: Array }>}
 */
export async function getCollections() {
  console.log("[getCollections] API Request: fetching collections");
  const res = await fetch(`${BASE_URL}/bookmarks/collections`, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse(res);
  console.log("[getCollections] API Response:", result);
  return result;
}

/**
 * Add a bookmark to a collection
 * @param {string} collectionId  - the collection's _id
 * @param {string} bookmarkId
 * @returns {Promise<{ added: boolean }>}
 * @throws Will throw with code "ALREADY_IN_COLLECTION" if duplicate
 */
export async function addToCollection(collectionId, bookmarkId) {
  console.log("[addToCollection] API Request:", { collectionId, bookmarkId });
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookmark_id: bookmarkId }),
  });
  const result = await handleResponse(res);
  console.log("[addToCollection] API Response:", result);
  return result;
}

/**
 * Update a collection's name, description, or visibility
 * @param {string} collectionId
 * @param {{ collection_name?: string, description?: string, visibility?: string }} updates
 * @returns {Promise<Object>} updated collection record
 */
export async function updateCollection(collectionId, updates) {
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/**
 * Remove a bookmark from a collection (does NOT delete the bookmark itself)
 * @param {string} collectionId
 * @param {string} bookmarkId - the bookmark's _id to remove
 * @returns {Promise<{ removed: boolean }>}
 */
export async function removeFromCollection(collectionId, bookmarkId) {
  console.log("[removeFromCollection] API Request:", { collectionId, bookmarkId });
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}/remove`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookmark_id: bookmarkId }),
  });
  const result = await handleResponse(res);
  console.log("[removeFromCollection] API Response:", result);
  return result;
}

/**
 * Permanently delete a bookmark collection
 * @param {string} collectionId
 * @returns {Promise<{ deleted: boolean }>}
 */
export async function deleteCollection(collectionId) {
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}