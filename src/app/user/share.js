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
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    const err = new Error(data.message || "Request failed");
    err.code = data.error;
    err.status = res.status;
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
export async function shareExternal(contentType, contentId) {
  const res = await fetch(`${BASE_URL}/shares`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content_id: contentId,
      content_type: contentType,
      shared_to: "external",
    }),
  });
  return handleResponse(res);
}

/**
 * Share content via Direct Message to another user
 * @param {"post"|"reel"|"story"} contentType
 * @param {string} contentId
 * @param {string} recipientId  - target user's ID
 * @param {string} [message]    - optional message to attach
 * @returns {Promise<Object>} share record with conversation_id
 */
export async function shareViaDM(contentType, contentId, recipientId, message = "") {
  const res = await fetch(`${BASE_URL}/shares`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content_id: contentId,
      content_type: contentType,
      shared_to: "direct_message",
      recipient_id: recipientId,
      message,
    }),
  });
  return handleResponse(res);
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
 * @returns {Promise<{ count: number }>}
 */
export async function getPostShareCount(postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/shares/count`, {
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
  const body = { content_id: contentId, content_type: contentType };
  if (notes) body.notes = notes;

  const res = await fetch(`${BASE_URL}/bookmarks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
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
  const params = new URLSearchParams({ content_id: contentId, content_type: contentType });
  const res = await fetch(`${BASE_URL}/bookmarks/check?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * Remove a bookmark by its ID
 * @param {string} bookmarkId  - the _id field from bookmark record
 * @returns {Promise<{ removed: boolean }>}
 */
export async function removeBookmark(bookmarkId) {
  const res = await fetch(`${BASE_URL}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
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
  const res = await fetch(`${BASE_URL}/bookmarks/collections`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      collection_name: collectionName,
      description,
      visibility,
    }),
  });
  return handleResponse(res);
}

/**
 * Get all bookmark collections for the logged-in user
 * @returns {Promise<{ collections: Array }>}
 */
export async function getCollections() {
  const res = await fetch(`${BASE_URL}/bookmarks/collections`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

/**
 * Add a bookmark to a collection
 * @param {string} collectionId  - the collection's _id
 * @param {string} bookmarkId
 * @returns {Promise<{ added: boolean }>}
 * @throws Will throw with code "ALREADY_IN_COLLECTION" if duplicate
 */
export async function addToCollection(collectionId, bookmarkId) {
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookmark_id: bookmarkId }),
  });
  return handleResponse(res);
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
 * @returns {Promise<{ removed: boolean }>}
 */
export async function removeFromCollection(collectionId) {
  const res = await fetch(`${BASE_URL}/bookmarks/collections/${collectionId}/remove`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
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