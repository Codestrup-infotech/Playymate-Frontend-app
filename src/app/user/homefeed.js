import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Read the auth token from localStorage/sessionStorage */
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("playymate_access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =====================================================
// FEED MODULE APIs
// =====================================================

/**
 * GET /api/v1/feed
 * Personalized home feed — returns items[], profile_completion_card, pagination
 */
export const getFeed = async (cursor = null, limit = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/feed?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/feed/suggested-follows
 * Suggested users to follow
 */
export const getSuggestedFollows = async () => {
  const res = await axios.get(`${API_BASE}/feed/suggested-follows`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.items ?? [];
};

/**
 * GET /api/v1/feed/nearby-venues
 * Nearby venues based on user's location
 */
export const getNearbyVenues = async () => {
  const res = await axios.get(`${API_BASE}/feed/nearby-venues`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.items ?? [];
};

/**
 * POST /api/v1/feed/refresh
 * Invalidate feed cache so next GET returns fresh data
 */
export const refreshFeedCache = async () => {
  const res = await axios.post(
    `${API_BASE}/feed/refresh`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * GET /api/v1/users/me/venues
 * Get current user's own venues/stores
 */
export const getMyVenues = async () => {
  const res = await axios.get(`${API_BASE}/users/me/venues`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.items ?? [];
};

/**
 * GET /api/v1/users/:userId/venues
 * Get a specific user's venues/stores
 */
export const getUserVenues = async (userId) => {
  const res = await axios.get(`${API_BASE}/users/${userId}/venues`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.items ?? [];
};

// =====================================================
// POSTS MODULE APIs
// =====================================================

/**
 * POST /api/v1/posts/create
 * Create a new post with text, media, visibility settings
 */
export const createPost = async (postData) => {
  const res = await axios.post(`${API_BASE}/posts/create`, postData, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

/**
 * GET /api/v1/posts/:id
 * Get a post by ID with author details and engagement counts
 */
export const getPostById = async (postId) => {
  const res = await axios.get(`${API_BASE}/posts/${postId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * PUT /api/v1/posts/:id
 * Update a post's content and settings (author only)
 */
export const updatePost = async (postId, updateData) => {
  const res = await axios.put(`${API_BASE}/posts/${postId}`, updateData, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

/**
 * DELETE /api/v1/posts/:id
 * Delete a post (author only)
 */
export const deletePost = async (postId) => {
  const res = await axios.delete(`${API_BASE}/posts/${postId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/posts/search
 * Search posts by hashtag
 */
export const searchPostsByHashtag = async (hashtag, limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("hashtag", hashtag);
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/posts/search?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/posts/location
 * Get posts within a certain radius of a location
 */
export const getPostsByLocation = async (latitude, longitude, radius = 10, limit = 20) => {
  const params = new URLSearchParams();
  params.append("latitude", latitude);
  params.append("longitude", longitude);
  params.append("radius", radius);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/posts/location?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/users/:id/posts
 * Get posts by a specific user
 */
export const getUserPosts = async (userId, limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/users/${userId}/posts?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/posts/:id/accept-auto
 * Accept an AI-generated post suggestion
 */
export const acceptAutoGeneratedPost = async (postId) => {
  const res = await axios.post(`${API_BASE}/posts/${postId}/accept-auto`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * DELETE /api/v1/posts/:id/decline-auto
 * Decline/remove an AI-generated post suggestion
 */
export const declineAutoGeneratedPost = async (postId) => {
  const res = await axios.delete(`${API_BASE}/posts/${postId}/decline-auto`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// =====================================================
// COMMENTS MODULE APIs
// =====================================================

/**
 * POST /api/v1/posts/:postId/comments
 * Create a comment on a post
 */
export const createComment = async (postId, text, mentionTags = []) => {
  const res = await axios.post(
    `${API_BASE}/posts/${postId}/comments`,
    { text, mention_tags: mentionTags },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * GET /api/v1/posts/:postId/comments
 * Get comments on a post
 */
export const getPostComments = async (postId, limit = 20, cursor = null, sortBy = "recent") => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);
  params.append("sort_by", sortBy);

  const res = await axios.get(`${API_BASE}/posts/${postId}/comments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/comments/:commentId/reply
 * Reply to a comment (cannot reply to a reply)
 */
export const replyToComment = async (commentId, text) => {
  const res = await axios.post(
    `${API_BASE}/comments/${commentId}/reply`,
    { text },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * PUT /api/v1/comments/:commentId
 * Update a comment (edit window: 5 minutes)
 */
export const updateComment = async (commentId, text) => {
  const res = await axios.put(
    `${API_BASE}/comments/${commentId}`,
    { text },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * DELETE /api/v1/comments/:commentId
 * Delete a comment (author or post owner can delete)
 */
export const deleteComment = async (commentId) => {
  const res = await axios.delete(`${API_BASE}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/comments/:commentId/replies
 * Get replies to a comment
 */
export const getCommentReplies = async (commentId, limit = 10, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/comments/${commentId}/replies?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// =====================================================
// MEDIA MODULE APIs
// =====================================================

/**
 * POST /api/v1/posts/media/presign
 * Generate presigned URL for uploading media (images/videos)
 */
export const presignMediaUpload = async (filename, mimeType, type) => {
  const res = await axios.post(
    `${API_BASE}/posts/media/presign`,
    { filename, mime_type: mimeType, type },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * POST /api/v1/posts/media/confirm
 * Confirm media upload after file is uploaded to storage
 */
export const confirmMediaUpload = async (mediaData) => {
  const res = await axios.post(`${API_BASE}/posts/media/confirm`, mediaData, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

// =====================================================
// REELS MODULE APIs
// =====================================================

/**
 * POST /api/v1/reels/presign
 * Generate presigned upload URL for reel video or thumbnail
 */
export const presignReelUpload = async (fileName, mimeType, sizeBytes, purpose = "reel") => {
  const res = await axios.post(
    `${API_BASE}/reels/presign`,
    { file_name: fileName, mime_type: mimeType, size_bytes: sizeBytes, purpose },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * POST /api/v1/reels/create
 * Create a new reel with video URL from presign
 */
export const createReel = async (reelData) => {
  const res = await axios.post(`${API_BASE}/reels/create`, reelData, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

/**
 * GET /api/v1/reels/:id
 * Get a reel by ID
 */
export const getReelById = async (reelId) => {
  const res = await axios.get(`${API_BASE}/reels/${reelId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/reels/feed
 * Get reels feed
 */
export const getReelsFeed = async (limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/reels/feed?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * DELETE /api/v1/reels/:id
 * Delete a reel (author only)
 */
export const deleteReel = async (reelId) => {
  const res = await axios.delete(`${API_BASE}/reels/${reelId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// =====================================================
// STORIES MODULE APIs
// =====================================================

/**
 * POST /api/v1/stories/presign
 * Generate presigned upload URL for story image/video or thumbnail
 */
export const presignStoryUpload = async (fileName, mimeType, sizeBytes, purpose = "story") => {
  const res = await axios.post(
    `${API_BASE}/stories/presign`,
    { file_name: fileName, mime_type: mimeType, size_bytes: sizeBytes, purpose },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * POST /api/v1/stories/create
 * Create a new story (expires in 24 hours)
 */
export const createStory = async (storyData) => {
  const res = await axios.post(`${API_BASE}/stories/create`, storyData, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

/**
 * GET /api/v1/stories/feed
 * Get story feed from followed users
 */
export const getStoryFeed = async (limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/stories/feed?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/stories/me
 * Get current user's own story from story feed
 */
export const getMyStory = async (userId = null) => {
  try {
    // Use provided userId or get from localStorage or use _id from profile
    const currentUserId = userId || localStorage.getItem("user_id") || localStorage.getItem("_id");
    console.log("[getMyStory] Looking for story with userId:", currentUserId);
    
    // Use the correct endpoint: /users/{user_id}/stories
    try {
      const url = `${API_BASE}/users/${currentUserId}/stories?limit=20`;
      console.log("[getMyStory] Calling URL:", url);
      
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      console.log("[getMyStory] Full response:", res.data);
      
      const data = res.data;
      console.log("[getMyStory] data:", data);
      
      // Handle both response formats: { data: { active_stories: [] } } or { active_stories: [] }
      const storiesData = data?.data || data;
      console.log("[getMyStory] storiesData:", storiesData);
      
      // Return active_stories array
      if (storiesData?.active_stories && Array.isArray(storiesData.active_stories)) {
        console.log("[getMyStory] Found active_stories:", storiesData.active_stories.length);
        return storiesData.active_stories;
      }
      
      console.log("[getMyStory] No active_stories found");
      return null;
    } catch (userErr) {
      console.log("[getMyStory] /users/{id}/stories error:", userErr.message);
      console.log("[getMyStory] Error response:", userErr.response?.data);
    }
    
    // Fallback: Try /stories/me
    try {
      const meRes = await axios.get(`${API_BASE}/stories/me`, {
        headers: getAuthHeaders(),
      });
      const storyData = meRes.data.data;
      console.log("[getMyStory] /stories/me response:", storyData);
      
      if (storyData) {
        return [storyData]; // Return as array
      }
    } catch (meErr) {
      console.log("[getMyStory] /stories/me error:", meErr.message);
    }
    
    return null;
  } catch (err) {
    console.log("[getMyStory] Error:", err.message);
    return null;
  }
};

/**
 * GET /api/v1/stories/:id
 * Get a single story (marks as viewed)
 */
export const getStoryById = async (storyId) => {
  const res = await axios.get(`${API_BASE}/stories/${storyId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/stories/:id/view
 * Explicitly mark a story as viewed
 */
export const markStoryAsViewed = async (storyId) => {
  const res = await axios.post(`${API_BASE}/stories/${storyId}/view`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/stories/:id/viewers
 * Get viewer list for a story (owner only)
 */
export const getStoryViewers = async (storyId, limit = 20) => {
  const params = new URLSearchParams();
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/stories/${storyId}/viewers?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * DELETE /api/v1/stories/:id
 * Delete a story (owner only)
 */
export const deleteStory = async (storyId) => {
  const res = await axios.delete(`${API_BASE}/stories/${storyId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/stories/:storyId/highlight
 * Save a story to a highlight
 */
export const saveStoryToHighlight = async (storyId, highlightId) => {
  const res = await axios.post(
    `${API_BASE}/stories/${storyId}/highlight`,
    { highlight_id: highlightId },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * DELETE /api/v1/stories/:storyId/highlight
 * Remove a story from a highlight
 */
export const removeStoryFromHighlight = async (storyId, highlightId) => {
  const res = await axios.delete(`${API_BASE}/stories/${storyId}/highlight`, {
    data: { highlight_id: highlightId },
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data.data;
};

// =====================================================
// HIGHLIGHTS APIs
// =====================================================

/**
 * POST /api/v1/highlights/create
 * Create a new highlight collection
 */
export const createHighlight = async (name, stories = []) => {
  const res = await axios.post(
    `${API_BASE}/highlights/create`,
    { name, stories },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * GET /api/v1/users/me/highlights
 * Get current user's highlights
 */
export const getMyHighlights = async () => {
  const res = await axios.get(`${API_BASE}/users/me/highlights`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.highlights ?? [];
};

/**
 * POST /api/v1/highlights/:highlightId/stories
 * Add a story to an existing highlight
 */
export const addStoryToHighlight = async (highlightId, storyId) => {
  const res = await axios.post(
    `${API_BASE}/highlights/${highlightId}/stories`,
    { story_id: storyId },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * DELETE /api/v1/highlights/:highlightId
 * Delete a highlight collection
 */
export const deleteHighlight = async (highlightId) => {
  const res = await axios.delete(`${API_BASE}/highlights/${highlightId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// =====================================================
// LIKES MODULE APIs
// =====================================================

/**
 * POST /api/v1/likes
 * Like a post, comment, or reel
 */
export const likeContent = async (contentType, contentId, reaction = "like") => {
  const res = await axios.post(
    `${API_BASE}/likes`,
    { content_type: contentType, content_id: contentId, reaction },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * POST /api/v1/likes/toggle
 * Toggle like (like → unlike or unlike → like)
 */
export const toggleLike = async (contentType, contentId, reaction = "like") => {
  const res = await axios.post(
    `${API_BASE}/likes/toggle`,
    { content_type: contentType, content_id: contentId, reaction },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * DELETE /api/v1/likes/:likeId
 * Remove a like by like_id
 */
export const unlikeContent = async (likeId) => {
  const res = await axios.delete(`${API_BASE}/likes/${likeId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/likes/:likeId/hide
 * Hide your like from public like list
 */
export const hideLike = async (likeId) => {
  const res = await axios.post(`${API_BASE}/likes/${likeId}/hide`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * POST /api/v1/likes/:likeId/show
 * Make a hidden like visible again
 */
export const showLike = async (likeId) => {
  const res = await axios.post(`${API_BASE}/likes/${likeId}/show`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/posts/:content_id/likes
 * Get likes for a post
 */
export const getPostLikes = async (postId, limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/posts/${postId}/likes?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/comments/:content_id/likes
 * Get likes for a comment
 */
export const getCommentLikes = async (commentId, limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/comments/${commentId}/likes?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/reels/:content_id/likes
 * Get likes for a reel
 */
export const getReelLikes = async (reelId, limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const res = await axios.get(`${API_BASE}/reels/${reelId}/likes?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/posts/:content_id/like-check
 * Check if the current user has liked a post
 */
export const checkPostLikeStatus = async (postId) => {
  const res = await axios.get(`${API_BASE}/posts/${postId}/like-check`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/comments/:content_id/like-check
 * Check if the current user has liked a comment
 */
export const checkCommentLikeStatus = async (commentId) => {
  const res = await axios.get(`${API_BASE}/comments/${commentId}/like-check`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

/**
 * GET /api/v1/reels/:content_id/like-check
 * Check if the current user has liked a reel
 */
export const checkReelLikeStatus = async (reelId) => {
  const res = await axios.get(`${API_BASE}/reels/${reelId}/like-check`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

// =====================================================
// BLOCK & MUTE MODULE APIs
// =====================================================

/**
 * POST /api/v1/users/:userId/block
 * Block a user
 */
export const blockUser = async (userId, reason = "") => {
  const res = await axios.post(
    `${API_BASE}/users/${userId}/block`,
    { reason },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  return res.data.data;
};

/**
 * DELETE /api/v1/users/:userId/block
 * Unblock a user
 */
export const unblockUser = async (userId) => {
  const res = await axios.delete(`${API_BASE}/users/${userId}/block`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};
