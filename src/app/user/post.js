import api from '@/services/api';
import axios from 'axios';

/**
 * Posts, Media, and Reels API Service
 * Based on USER_API.md documentation
 */

export const postService = {
  // ============ POSTS MODULE ============
  
  /**
   * Create a new post
   * POST /api/v1/posts/create
   */
  createPost: (data) => {
    const payload = {
      content: {
        text: data.text,
        location: data.location || null
      },
      media: data.media || [],
      visibility: data.visibility || 'public',
      allow_comments: data.allowComments !== false,
      allow_shares: data.allowShares !== false,
      linked_activity: data.linkedActivity || null
    };
    return api.post('/posts/create', payload);
  },

  /**
   * Get post by ID
   * GET /api/v1/posts/:id
   */
  getPost: (postId) => api.get(`/posts/${postId}`),

  /**
   * Update a post
   * PUT /api/v1/posts/:id
   */
  updatePost: (postId, data) => {
    const payload = {
      content: {
        text: data.text
      },
      visibility: data.visibility || 'public',
      allow_comments: data.allowComments !== false,
      allow_shares: data.allowShares !== false
    };
    return api.put(`/posts/${postId}`, payload);
  },

  /**
   * Delete a post
   * DELETE /api/v1/posts/:id
   */
  deletePost: (postId) => api.delete(`/posts/${postId}`),

  /**
   * Search posts by hashtag
   * GET /api/v1/posts/search
   */
  searchPosts: (hashtag, limit = 20, cursor = null) => {
    const params = { hashtag, limit };
    if (cursor) params.cursor = cursor;
    return api.get('/posts/search', { params });
  },

  /**
   * Get posts by location
   * GET /api/v1/posts/location
   */
  getPostsByLocation: (latitude, longitude, radius = 10, limit = 20) => {
    return api.get('/posts/location', {
      params: { latitude, longitude, radius, limit }
    });
  },

  /**
   * Get posts by user ID
   * GET /api/v1/users/:id/posts
   */
  getUserPosts: (userId, limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get(`/users/${userId}/posts`, { params });
  },

  /**
   * Get current user's posts
   * GET /api/v1/users/me/posts
   */
  getMyPosts: (limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get('/users/me/posts', { params });
  },

  /**
   * Accept auto-generated post
   * POST /api/v1/posts/:id/accept-auto
   */
  acceptAutoPost: (postId) => api.post(`/posts/${postId}/accept-auto`),

  /**
   * Decline auto-generated post
   * DELETE /api/v1/posts/:id/decline-auto
   */
  declineAutoPost: (postId) => api.delete(`/posts/${postId}/decline-auto`),

  // ============ COMMENTS MODULE ============

  /**
   * Create comment on post
   * POST /api/v1/posts/:postId/comments
   */
  createComment: (postId, data) => {
    const payload = {
      text: data.text,
      mention_tags: data.mentionTags || []
    };
    return api.post(`/posts/${postId}/comments`, payload);
  },

  /**
   * Get post comments
   * GET /api/v1/posts/:postId/comments
   */
  getPostComments: (postId, limit = 20, cursor = null, sortBy = 'recent') => {
    const params = { limit, sort_by: sortBy };
    if (cursor) params.cursor = cursor;
    return api.get(`/posts/${postId}/comments`, { params });
  },

  /**
   * Reply to comment
   * POST /api/v1/comments/:commentId/reply
   */
  replyToComment: (commentId, text) => {
    return api.post(`/comments/${commentId}/reply`, { text });
  },

  /**
   * Update comment
   * PUT /api/v1/comments/:commentId
   */
  updateComment: (commentId, text) => {
    return api.put(`/comments/${commentId}`, { text });
  },

  /**
   * Delete comment
   * DELETE /api/v1/comments/:commentId
   */
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  /**
   * Get comment replies
   * GET /api/v1/comments/:commentId/replies
   */
  getCommentReplies: (commentId, limit = 10, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get(`/comments/${commentId}/replies`, { params });
  },

  // ============ MEDIA MODULE ============

  /**
   * Presign media upload
   * POST /api/v1/posts/media/presign
   */
  presignMediaUpload: (data) => {
    const payload = {
      filename: data.filename,
      mime_type: data.mimeType,
      type: data.type // 'image' or 'video'
    };
    return api.post('/posts/media/presign', payload);
  },

  /**
   * Upload file to presigned URL
   */
  uploadToPresignedUrl: async (presignedUrl, file, contentType) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
      timeout: 300000, // 5 minutes timeout for large files
    });
  },

  /**
   * Confirm media upload
   * POST /api/v1/posts/media/confirm
   */
  confirmMediaUpload: (data) => {
    const payload = {
      post_id: data.postId,
      file_key: data.fileKey,
      type: data.type,
      width: data.width,
      height: data.height,
      duration: data.duration || null,
      original_filename: data.originalFilename,
      mime_type: data.mimeType,
      file_size: data.fileSize
    };
    return api.post('/posts/media/confirm', payload);
  },

  // ============ REELS MODULE ============

  /**
   * Presign reel upload
   * POST /api/v1/reels/presign
   */
  presignReelUpload: (data) => {
    const payload = {
      file_name: data.fileName,
      mime_type: data.mimeType,
      size_bytes: data.sizeBytes,
      purpose: data.purpose || 'reel' // 'reel' or 'thumbnail'
    };
    // Call the Next.js API route
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    return axios.post('/api/v1/reels/presign', payload, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
    });
  },

  /**
   * Create reel
   * POST /api/v1/reels/create
   */
  createReel: (data) => {
    const payload = {
      video_url: data.videoUrl,
      duration: data.duration,
      thumbnail_url: data.thumbnailUrl || null,
      aspect_ratio: data.aspectRatio || '9:16',
      title: data.title || '',
      caption: data.caption || '',
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
      visibility: data.visibility || 'public',
      allow_comments: data.allowComments !== false,
      allow_duets: data.allowDuets !== false,
      allow_stitches: data.allowStitches !== false
    };
    // Call the Next.js API route
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    return axios.post('/api/v1/reels/create', payload, {
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
    });
  },

  /**
   * Get reel by ID
   * GET /api/v1/reels/:id
   */
  getReel: (reelId) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    return axios.get(`/api/v1/reels/${reelId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Update reel
   * PUT /api/v1/reels/:id
   */
  updateReel: (reelId, data) => {
    const payload = {
      caption: data.caption,
      hashtags: data.hashtags || [],
      visibility: data.visibility || 'public',
      allow_comments: data.allowComments !== false
    };
    return api.put(`/reels/${reelId}`, payload);
  },

  /**
   * Track reel view
   * POST /api/v1/reels/:id/view
   */
  trackReelView: (reelId, watchDurationMs) => {
    return api.post(`/reels/${reelId}/view`, { watch_duration_ms: watchDurationMs });
  },

  /**
   * Get reel analytics (owner only)
   * GET /api/v1/reels/:id/analytics
   */
  getReelAnalytics: (reelId) => api.get(`/reels/${reelId}/analytics`),

  /**
   * Get explore feed (personalized reels)
   * GET /api/v1/reels/explore
   */
  getExploreReels: (limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get('/reels/explore', { params });
  },

  /**
   * Get trending reels
   * GET /api/v1/reels/trending
   */
  getTrendingReels: (limit = 20) => {
    return api.get('/reels/trending', { params: { limit } });
  },

  /**
   * Search reels
   * GET /api/v1/reels/search
   */
  searchReels: (query = null, hashtag = null, limit = 20) => {
    const params = { limit };
    if (query) params.q = query;
    if (hashtag) params.hashtag = hashtag;
    return api.get('/reels/search', { params });
  },

  /**
   * Delete reel
   * DELETE /api/v1/reels/:id
   */
  deleteReel: (reelId) => api.delete(`/reels/${reelId}`),

  /**
   * Get user's reels
   * GET /api/v1/users/:id/reels
   */
  getUserReels: (userId, limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    // Call the Next.js API route with auth headers
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    return axios.get(`/api/v1/users/${userId}/reels`, { 
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  /**
   * Get current user's reels
   * GET /api/v1/users/me/reels
   */
  getMyReels: (limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    // Call the Next.js API route with auth headers
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    return axios.get(`/api/v1/users/me/reels`, { 
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // ============ LIKES MODULE ============

  /**
   * Like content (post, comment, or reel)
   * POST /api/v1/likes
   */
  likeContent: (contentType, contentId, reaction = 'like') => {
    return api.post('/likes', {
      content_type: contentType,
      content_id: contentId,
      reaction
    });
  },

  /**
   * Unlike content
   * DELETE /api/v1/likes
   */
  unlikeContent: (contentType, contentId) => {
    return api.delete('/likes', {
      data: {
        content_type: contentType,
        content_id: contentId
      }
    });
  },

  /**
   * Get likes on content
   * GET /api/v1/likes/:contentType/:contentId
   */
  getContentLikes: (contentType, contentId, limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get(`/likes/${contentType}/${contentId}`, { params });
  },

  // ============ STORIES MODULE ============

  /**
   * Presign story upload
   * POST /api/v1/stories/presign
   */
  presignStoryUpload: (data) => {
    const payload = {
      file_name: data.fileName,
      mime_type: data.mimeType,
      size_bytes: data.sizeBytes,
      purpose: data.purpose || 'story'
    };
    return api.post('/stories/presign', payload);
  },

  /**
   * Create story
   * POST /api/v1/stories/create
   */
  createStory: (data) => {
    const payload = {
      media_url: data.mediaUrl,
      media_type: data.mediaType,
      duration: data.duration || null,
      thumbnail_url: data.thumbnailUrl || null,
      caption: data.caption || '',
      visibility: data.visibility || 'public',
      overlays: data.overlays || [],
      music_track_id: data.musicTrackId || null,
      activity_link: data.activityLink || null
    };
    return api.post('/stories/create', payload);
  },

  /**
   * Get story feed
   * GET /api/v1/stories/feed
   */
  getStoryFeed: (limit = 20, cursor = null) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get('/stories/feed', { params });
  },

  /**
   * Get story by ID
   * GET /api/v1/stories/:id
   */
  getStory: (storyId) => api.get(`/stories/${storyId}`),

  /**
   * Mark story as viewed
   * POST /api/v1/stories/:id/view
   */
  markStoryViewed: (storyId) => api.post(`/stories/${storyId}/view`),

  /**
   * Get story viewers (owner only)
   * GET /api/v1/stories/:id/viewers
   */
  getStoryViewers: (storyId, limit = 20) => {
    return api.get(`/stories/${storyId}/viewers`, { params: { limit } });
  },

  /**
   * Delete story
   * DELETE /api/v1/stories/:id
   */
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),

  // ============ HIGHLIGHTS MODULE ============

  /**
   * Create highlight
   * POST /api/v1/highlights/create
   */
  createHighlight: (name, stories = []) => {
    return api.post('/highlights/create', { name, stories });
  },

  /**
   * Get my highlights
   * GET /api/v1/users/me/highlights
   */
  getMyHighlights: () => api.get('/users/me/highlights'),

  /**
   * Add story to highlight
   * POST /api/v1/highlights/:highlightId/stories
   */
  addStoryToHighlight: (highlightId, storyId) => {
    return api.post(`/highlights/${highlightId}/stories`, { story_id: storyId });
  },

  /**
   * Remove story from highlight
   * DELETE /api/v1/stories/:storyId/highlight
   */
  removeStoryFromHighlight: (storyId, highlightId) => {
    return api.delete(`/stories/${storyId}/highlight`, {
      data: { highlight_id: highlightId }
    });
  },

  /**
   * Delete highlight
   * DELETE /api/v1/highlights/:highlightId
   */
  deleteHighlight: (highlightId) => api.delete(`/highlights/${highlightId}`),

  // ============ BLOCK & MUTE MODULE ============

  /**
   * Block user
   * POST /api/v1/users/:id/block
   */
  blockUser: (userId) => api.post(`/users/${userId}/block`),

  /**
   * Unblock user
   * DELETE /api/v1/users/:id/block
   */
  unblockUser: (userId) => api.delete(`/users/${userId}/block`),

  /**
   * Get blocked users
   * GET /api/v1/users/me/blocked
   */
  getBlockedUsers: () => api.get('/users/me/blocked'),

  /**
   * Mute user
   * POST /api/v1/users/:id/mute
   */
  muteUser: (userId) => api.post(`/users/${userId}/mute`),

  /**
   * Unmute user
   * DELETE /api/v1/users/:id/mute
   */
  unmuteUser: (userId) => api.delete(`/users/${userId}/mute`),

  /**
   * Get muted users
   * GET /api/v1/users/me/muted
   */
  getMutedUsers: () => api.get('/users/me/muted'),
};

export default postService;