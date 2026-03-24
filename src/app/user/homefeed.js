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
 * Sort stories inside a single user by createdAt ASC (oldest first)
 * Instagram-style: first story uploaded is shown first
 */
export const sortStoriesByCreatedAtASC = (stories) => {
  if (!Array.isArray(stories)) return [];
  return [...stories].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0);
    const dateB = new Date(b.createdAt || b.created_at || 0);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Sort story groups (users) by their latest story's createdAt DESC (most recent first)
 * Instagram-style: users with most recent activity appear first
 */
export const sortStoryGroupsByLatestFirst = (storyGroups) => {
  if (!Array.isArray(storyGroups)) return [];
  return [...storyGroups].sort((a, b) => {
    // Get the latest story from each user group
    const aLatest = a.stories?.[a.stories.length - 1] || {};
    const bLatest = b.stories?.[b.stories.length - 1] || {};
    const dateA = new Date(aLatest.createdAt || aLatest.created_at || 0);
    const dateB = new Date(bLatest.createdAt || bLatest.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });
};

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
 * Returns sorted by latest story DESC (most recent first)
 */
export const getStoryFeed = async (limit = 20, cursor = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  console.log("[getStoryFeed] Calling API with params:", params.toString());
  
  const res = await axios.get(`${API_BASE}/stories/feed?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  console.log("[getStoryFeed] Raw API response:", res.data);
  
  const data = res.data.data;
  console.log("[getStoryFeed] Data:", data);
  
  // Handle different response formats:
  // Format 1: { stories: [...], next_cursor, has_more } - stories directly in array
  // Format 2: { items: [{ user, stories: [...] }] } - grouped by user
  let storyItems = [];
  
  if (data?.stories && Array.isArray(data.stories)) {
    // Format 1: Flat array of stories with embedded author
    console.log("[getStoryFeed] Processing format 1: stories array");
    storyItems = normalizeStoriesWithAuthors(data.stories);
  } else if (data?.items && Array.isArray(data.items)) {
    // Format 2: Array of story groups with user and stories
    console.log("[getStoryFeed] Processing format 2: items array");
    storyItems = data.items;
  } else {
    console.log("[getStoryFeed] Unexpected data format:", data);
    return data;
  }

  console.log("[getStoryFeed] Processed story items:", storyItems.length);
  
  // Apply sorting
  if (storyItems.length > 0) {
    const sortedItems = storyItems.map(group => ({
      ...group,
      // Sort stories within each user by createdAt ASC (oldest first)
      stories: sortStoriesByCreatedAtASC(group.stories || [])
    }));
    
    // Sort users by their latest story DESC
    return {
      ...data,
      items: sortStoryGroupsByLatestFirst(sortedItems)
    };
  }
  
  return { items: [] };
};

/**
 * Normalize stories from format where each story has embedded author
 * Convert to format expected by frontend: { user, stories: [...] }
 */
const normalizeStoriesWithAuthors = (stories) => {
  if (!Array.isArray(stories)) return [];
  
  // Group stories by author
  const groupedByAuthor = {};
  
  stories.forEach(story => {
    const authorId = story.author?._id || story.author_id;
    if (!authorId) return;
    
    if (!groupedByAuthor[authorId]) {
      groupedByAuthor[authorId] = {
        user: {
          user_id: authorId,
          full_name: story.author?.full_name || 'Unknown',
          profile_image_url: story.author?.profile_image_url || '',
        },
        stories: [],
      };
    }
    
    // Normalize the story format
    groupedByAuthor[authorId].stories.push({
      ...story,
      media_url: story.media?.url || story.media_url,
      media_type: story.media?.type || story.media_type || 'image',
      createdAt: story.created_at,
    });
  });
  
  return Object.values(groupedByAuthor);
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
      
      // Return active_stories array with defensive sorting
      // Sort by createdAt ASC (oldest first) for Instagram-style viewing
      if (storiesData?.active_stories && Array.isArray(storiesData.active_stories)) {
        console.log("[getMyStory] Found active_stories:", storiesData.active_stories.length);
        // Apply defensive sorting - oldest first (ASC)
        const sortedStories = sortStoriesByCreatedAtASC(storiesData.active_stories);
        console.log("[getMyStory] Sorted stories (ASC):", sortedStories.map(s => s.createdAt));
        return sortedStories;
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
 * GET /api/v1/stories/:storyId
 * Get story preview by ID - returns story details including media, author, etc.
 * Used when clicking on a highlight to preview the story
 */
export const getStoryPreview = async (storyId) => {
  console.log("[getStoryPreview] Fetching story preview:", storyId);
  const res = await axios.get(`${API_BASE}/stories/${storyId}`, {
    headers: getAuthHeaders(),
  });
  console.log("[getStoryPreview] Response:", res.data);
  return res.data.data;
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
 * Request body: { highlight_id: string }
 */
export const saveStoryToHighlight = async (storyId, highlightId) => {
  console.log("[saveStoryToHighlight] Saving story to highlight:", { storyId, highlightId });
  const res = await axios.post(
    `${API_BASE}/stories/${storyId}/highlight`,
    { highlight_id: highlightId },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  console.log("[saveStoryToHighlight] Response:", res.data);
  return res.data.data;
};

// =====================================================
// HIGHLIGHTS APIs
// =====================================================

/**
 * POST /api/v1/highlights/create
 * Create a new highlight collection
 * Request body: { name: string, description?: string, is_visible?: boolean }
 * Then adds stories to the highlight one by one
 */
export const createHighlight = async (name, storyIds = [], description = "", is_visible = true) => {
  console.log("[createHighlight] Creating highlight:", { name, storyIds, description, is_visible });
  
  // First create the highlight
  const res = await axios.post(
    `${API_BASE}/highlights/create`,
    { 
      name, 
      description: description || "",
      is_visible: is_visible !== false
    },
    { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
  );
  console.log("[createHighlight] Response:", res.data);
  
  const highlight = res.data.data;
  
  // If storyIds provided, add them to the highlight
  if (highlight && highlight.highlight_id && storyIds && storyIds.length > 0) {
    console.log("[createHighlight] Adding stories to highlight:", storyIds);
    for (const storyId of storyIds) {
      try {
        await axios.post(
          `${API_BASE}/highlights/${highlight.highlight_id}/stories`,
          { story_id: storyId },
          { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
        );
        console.log("[createHighlight] Added story:", storyId);
      } catch (storyErr) {
        console.error("[createHighlight] Error adding story:", storyId, storyErr);
      }
    }
    
    // Fetch the updated highlight with stories
    try {
      const highlightRes = await axios.get(
        `${API_BASE}/highlights/${highlight.highlight_id}`,
        { headers: getAuthHeaders() }
      );
      return highlightRes.data.data || highlight;
    } catch (fetchErr) {
      console.log("[createHighlight] Error fetching updated highlight:", fetchErr);
      return highlight;
    }
  }
  
  return highlight;
};

/**
 * GET /api/v1/users/me/highlights?page=1&limit=20
 * Get current user's highlights
 */
export const getMyHighlights = async (page = 1, limit = 20) => {
  console.log("[getMyHighlights] Fetching highlights...");
  try {
    const res = await axios.get(`${API_BASE}/users/me/highlights?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    console.log("[getMyHighlights] Response:", res.data);
    return res.data.data?.highlights ?? [];
  } catch (err) {
    console.error("[getMyHighlights] Error:", err.response?.status, err.message);
    // Return empty array on error
    return [];
  }
};

/**
 * GET /api/v1/users/:userId/highlights?page=1&limit=20
 * Get another user's highlights
 */
export const getUserHighlights = async (userId, page = 1, limit = 20) => {
  console.log("[getUserHighlights] Fetching highlights for userId:", userId);
  try {
    const res = await axios.get(`${API_BASE}/users/${userId}/highlights?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    console.log("[getUserHighlights] Response:", res.data);
    return res.data.data?.highlights ?? [];
  } catch (err) {
    console.log("[getUserHighlights] Error:", err.response?.status, err.message);
    // Return empty array on error
    return [];
  }
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
 * DELETE /api/v1/stories/:storyId/highlight
 * Remove a story from its highlight (only removes from highlight, doesn't delete story)
 */
export const removeStoryFromHighlight = async (storyId, highlightId) => {
  console.log("[removeStoryFromHighlight] Removing story from highlight:", storyId, "highlightId:", highlightId);
  try {
    const res = await axios.delete(
      `${API_BASE}/stories/${storyId}/highlight`,
      { 
        data: { highlight_id: highlightId },
        headers: { 
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("[removeStoryFromHighlight] Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[removeStoryFromHighlight] Error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * DELETE /api/v1/highlights/:highlightId
 * Delete a highlight collection
 */
export const deleteHighlight = async (highlightId) => {
  console.log("[deleteHighlight] Deleting highlight:", highlightId);
  const res = await axios.delete(`${API_BASE}/highlights/${highlightId}`, {
    headers: getAuthHeaders(),
  });
  console.log("[deleteHighlight] Response:", res.data);
  return res.data.data;
};

/**
 * GET /api/v1/stories/archive
 * Get archived stories (expired stories)
 */
export const getArchivedStories = async (limit = 20) => {
  const res = await axios.get(`${API_BASE}/stories/archive?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return res.data.data?.archived_stories ?? res.data.data?.stories ?? [];
};

/**
 * GET /api/v1/users/{userId}/stories
 * Get current user's active + archived stories
 * Returns { active_stories: [], archived_stories: [] }
 * Tries with user_id from localStorage first, then falls back to "me"
 */
export const getMyAllStories = async (limit = 20) => {
  // Try to get actual user ID - check multiple storage keys
  let userId = sessionStorage.getItem("user_id") || localStorage.getItem("user_id") || localStorage.getItem("_id");
  
  // If no userId found, try to get it from /users/me endpoint
  if (!userId || userId === "me") {
    try {
      console.log("[getMyAllStories] No userId in storage, fetching from /users/me...");
      const meRes = await axios.get(`${API_BASE}/users/me`, {
        headers: getAuthHeaders(),
      });
      const userData = meRes.data.data || meRes.data;
      userId = userData?._id || userData?.id;
      console.log("[getMyAllStories] Got userId from /users/me:", userId);
    } catch (meErr) {
      console.log("[getMyAllStories] Failed to get user from /users/me:", meErr.message);
    }
  }
  
  // Fallback to "me" if still no userId
  userId = userId || "me";
  console.log("[getMyAllStories] Using userId:", userId);
  
  // First try: /users/{userId}/stories (with actual user ID)
  try {
    console.log("[getMyAllStories] Trying /users/" + userId + "/stories...");
    const res = await axios.get(`${API_BASE}/users/${userId}/stories?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    console.log("[getMyAllStories] Response:", res.data);
    
    const data = res.data.data || res.data;
    return {
      active_stories: data?.active_stories || data?.stories || [],
      archived_stories: data?.archived_stories || []
    };
  } catch (err) {
    console.log("[getMyAllStories] /users/" + userId + "/stories failed:", err.response?.status, err.message);
    
    // Second try: /users/me/stories (only if we had a real userId that failed)
    if (userId !== "me") {
      try {
        console.log("[getMyAllStories] Trying /users/me/stories...");
        const res = await axios.get(`${API_BASE}/users/me/stories?limit=${limit}`, {
          headers: getAuthHeaders(),
        });
        console.log("[getMyAllStories] Response:", res.data);
        
        const data = res.data.data || res.data;
        return {
          active_stories: data?.active_stories || data?.stories || [],
          archived_stories: data?.archived_stories || []
        };
      } catch (err2) {
        console.log("[getMyAllStories] /users/me/stories failed:", err2.response?.status, err2.message);
      }
    }
    
    // Third try: /stories/archive endpoint
    try {
      console.log("[getMyAllStories] Trying /stories/archive...");
      const archiveRes = await axios.get(`${API_BASE}/stories/archive?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      console.log("[getMyAllStories] Archive response:", archiveRes.data);
      
      const data = archiveRes.data.data || archiveRes.data;
      return {
        active_stories: [],
        archived_stories: data?.archived_stories || data?.stories || []
      };
    } catch (archiveErr) {
      console.log("[getMyAllStories] /stories/archive also failed:", archiveErr.response?.status);
      return { active_stories: [], archived_stories: [] };
    }
  }
};

/**
 * GET /api/v1/users/{userId}/stories
 * Get a user's stories (active + archived)
 * NOTE: May return empty if endpoint doesn't exist
 */
export const getUserStories = async (userId, limit = 20) => {
  try {
    console.log("[getUserStories] Fetching stories for userId:", userId);
    const res = await axios.get(`${API_BASE}/users/${userId}/stories?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    console.log("[getUserStories] Response:", res.data);
    return res.data.data || {};
  } catch (err) {
    console.log("[getUserStories] Error or endpoint not found:", err.response?.status, err.message);
    return { active_stories: [], archived_stories: [] };
  }
};

/**
 * GET /api/v1/highlights/:highlightId
 * Get highlight details (includes stories)
 */
export const getHighlightDetails = async (highlightId) => {
  console.log("[getHighlightDetails] Fetching highlight:", highlightId);
  const res = await axios.get(`${API_BASE}/highlights/${highlightId}`, {
    headers: getAuthHeaders(),
  });
  console.log("[getHighlightDetails] Response:", res.data);
  return res.data.data;
};

/**
 * PUT /api/v1/highlights/:highlightId
 * Update highlight
 */
export const updateHighlight = async (highlightId, data) => {
  console.log("[updateHighlight] Updating highlight:", highlightId, data);
  const res = await axios.put(`${API_BASE}/highlights/${highlightId}`, data, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  console.log("[updateHighlight] Response:", res.data);
  return res.data.data;
};

/**
 * GET /api/v1/highlights/:highlightId/stories
 * Get stories in a highlight
 */
export const getHighlightStories = async (highlightId) => {
  console.log("[getHighlightStories] Fetching stories for highlight:", highlightId);
  const res = await axios.get(`${API_BASE}/highlights/${highlightId}/stories`, {
    headers: getAuthHeaders(),
  });
  console.log("[getHighlightStories] Response:", res.data);
  return res.data.data?.stories ?? [];
};

/**
 * POST /api/v1/highlights/:highlightId/view
 * Mark highlight as viewed
 */
export const markHighlightViewed = async (highlightId) => {
  const res = await axios.post(
    `${API_BASE}/highlights/${highlightId}/view`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * GET /api/v1/highlights/:highlightId/viewers
 * Get highlight viewers (owner only)
 */
export const getHighlightViewers = async (highlightId, limit = 20) => {
  const res = await axios.get(
    `${API_BASE}/highlights/${highlightId}/viewers?limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return res.data.data?.viewers ?? [];
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
