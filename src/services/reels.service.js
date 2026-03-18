import axios from "axios";
import api from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Read the auth token from sessionStorage and return axios-ready headers */
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("playymate_access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * =========================================================
 * PRESIGN UPLOAD
 * =========================================================
 */

/**
 * Get presigned URL for reel video or thumbnail upload
 * Endpoint: POST /api/v1/reels/presign
 * @param {object} data - { file_name, mime_type, size_bytes, purpose }
 * @param {string} data.file_name - File name (e.g., "my_reel.mp4")
 * @param {string} data.mime_type - MIME type (e.g., "video/mp4")
 * @param {number} data.size_bytes - File size in bytes
 * @param {string} data.purpose - "reel" | "thumbnail" (default: "reel")
 */
export const getPresignedUrl = async (data) => {
  console.log('[REELS SERVICE] 📤 getPresignedUrl called:', data);
  const res = await axios.post(`${API_BASE}/reels/presign`, data, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Presign response received');
  return res.data;
};

/**
 * Upload file directly to Wasabi using presigned URL
 * @param {string} presignedUrl - The upload URL from presign response
 * @param {File} file - The file to upload
 * @param {string} contentType - Content type (e.g., "video/mp4")
 */
export const uploadToPresignedUrl = async (presignedUrl, file, contentType) => {
  await axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": contentType,
    },
    timeout: 300000, // 5 minutes timeout for video uploads
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
};

/**
 * Complete flow: Get presigned URL -> Upload file -> Return file URLs
 * @param {File} file - Video or thumbnail file
 * @param {string} purpose - "reel" | "thumbnail"
 * @returns {Promise<{file_url: string, wasabi_direct_url: string, key: string}>}
 */
export const uploadReelFile = async (file, purpose = "reel") => {
  console.log(`=== UPLOAD ${purpose.toUpperCase()} FLOW ===`);
  console.log("Step 1: Getting presigned URL from API...");
  
  // Step 1: Get presigned URL
  const presignResponse = await getPresignedUrl({
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    purpose: purpose,
  });

  console.log("Presign response:", presignResponse);

  if (presignResponse.status !== "success") {
    throw new Error(presignResponse.message || "Failed to get presigned URL");
  }

  const { upload_url, file_url, wasabi_direct_url, key } = presignResponse.data;
  console.log("Presigned URL received!");
  console.log("Upload URL:", upload_url);

  // Step 2: Upload file to Wasabi
  console.log("Step 2: Uploading file to Wasabi...");
  await uploadToPresignedUrl(upload_url, file, file.type);
  console.log("File uploaded to Wasabi!");

  console.log("=== UPLOAD COMPLETE ===\n");

  return {
    file_url,
    wasabi_direct_url,
    key,
  };
};

/**
 * =========================================================
 * CREATE REEL
 * =========================================================
 */

/**
 * Create a new reel with video URL from presign
 * Endpoint: POST /api/v1/reels/create
 * @param {object} data - Reel data
 * @param {string} data.video_url - Video URL from presign (wasabi_direct_url)
 * @param {number} data.duration - Video duration in seconds (max 60)
 * @param {string} data.thumbnail_url - Thumbnail URL (optional)
 * @param {string} data.aspect_ratio - Aspect ratio (e.g., "9:16")
 * @param {string} data.title - Reel title
 * @param {string} data.caption - Caption (max 2200 chars)
 * @param {string[]} data.hashtags - Array of hashtags (max 30)
 * @param {string[]} data.mentions - Array of mentioned usernames
 * @param {string} data.visibility - "public" | "followers_only" | "private"
 * @param {boolean} data.allow_comments - Allow comments
 * @param {boolean} data.allow_duets - Allow duets
 * @param {boolean} data.allow_stitches - Allow stitches
 */
export const createReel = async (data) => {
  console.log('[REELS SERVICE] 🎬 createReel called:', data);
  const res = await axios.post(`${API_BASE}/reels/create`, data, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Reel created:', res.data);
  return res.data;
};

/**
 * =========================================================
 * GET REEL
 * =========================================================
 */

/**
 * Get reel by ID
 * Endpoint: GET /api/v1/reels/:id
 * @param {string} reelId - Reel ID
 */
export const getReelById = async (reelId) => {
  console.log('[REELS SERVICE] 🔍 getReelById called for:', reelId);
  const res = await axios.get(`${API_BASE}/reels/${reelId}`, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Reel fetched:', res.data);
  return res.data;
};

/**
 * =========================================================
 * UPDATE REEL
 * =========================================================
 */

/**
 * Update reel metadata (caption, hashtags, visibility)
 * Endpoint: PUT /api/v1/reels/:id
 * @param {string} reelId - Reel ID
 * @param {object} data - Updated data
 * @param {string} data.caption - Updated caption
 * @param {string[]} data.hashtags - Updated hashtags
 * @param {string} data.visibility - Updated visibility
 * @param {boolean} data.allow_comments - Updated allow_comments
 */
export const updateReel = async (reelId, data) => {
  console.log('[REELS SERVICE] ✏️ updateReel called for:', reelId, 'with data:', data);
  const res = await axios.put(`${API_BASE}/reels/${reelId}`, data, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Reel updated:', res.data);
  return res.data;
};

/**
 * =========================================================
 * DELETE REEL
 * =========================================================
 */

/**
 * Delete a reel
 * Endpoint: DELETE /api/v1/reels/:id
 * @param {string} reelId - Reel ID
 */
export const deleteReel = async (reelId) => {
  console.log('[REELS SERVICE] 🗑️ deleteReel called for:', reelId);
  const res = await axios.delete(`${API_BASE}/reels/${reelId}`, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Reel deleted');
  return res.data;
};

/**
 * =========================================================
 * TRACK VIEW
 * =========================================================
 */

/**
 * Track a view event with watch duration
 * Endpoint: POST /api/v1/reels/:id/view
 * @param {string} reelId - Reel ID
 * @param {number} watchDurationMs - Watch duration in milliseconds
 */
export const trackReelView = async (reelId, watchDurationMs) => {
  console.log('[REELS SERVICE] 👁️ trackReelView called for:', reelId, 'duration:', watchDurationMs, 'ms');
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/view`,
    { watch_duration_ms: watchDurationMs },
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ View tracked');
  return res.data;
};

/**
 * =========================================================
 * REEL INTERACTIONS
 * =========================================================
 */

/**
 * Like a reel
 * Endpoint: POST /api/v1/reels/:id/like
 * @param {string} reelId - Reel ID
 */
export const likeReel = async (reelId) => {
  console.log('[REELS SERVICE] ❤️ likeReel called for:', reelId);
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/like`,
    {},
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ Reel liked');
  return res.data;
};

/**
 * Unlike a reel
 * Endpoint: POST /api/v1/reels/:id/unlike
 * @param {string} reelId - Reel ID
 */
export const unlikeReel = async (reelId) => {
  console.log('[REELS SERVICE] 💔 unlikeReel called for:', reelId);
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/unlike`,
    {},
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ Reel unliked');
  return res.data;
};

/**
 * Save a reel
 * Endpoint: POST /api/v1/reels/:id/save
 * @param {string} reelId - Reel ID
 */
export const saveReel = async (reelId) => {
  console.log('[REELS SERVICE] 🔖 saveReel called for:', reelId);
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/save`,
    {},
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ Reel saved');
  return res.data;
};

/**
 * Unsave a reel
 * Endpoint: POST /api/v1/reels/:id/unsave
 * @param {string} reelId - Reel ID
 */
export const unsaveReel = async (reelId) => {
  console.log('[REELS SERVICE] 🔖 unsaveReel called for:', reelId);
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/unsave`,
    {},
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ Reel unsaved');
  return res.data;
};

/**
 * =========================================================
 * REEL COMMENTS
 * =========================================================
 */

/**
 * Get comments for a reel
 * Endpoint: GET /api/v1/reels/:id/comments
 * @param {string} reelId - Reel ID
 * @param {string} cursor - Pagination cursor
 * @param {number} limit - Number of comments
 */
export const getReelComments = async (reelId, cursor = null, limit = 20) => {
  console.log('[REELS SERVICE] 💬 getReelComments called for:', reelId, { cursor, limit });
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/reels/${reelId}/comments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Comments fetched');
  return res.data;
};

/**
 * Add comment to a reel
 * Endpoint: POST /api/v1/reels/:id/comments
 * @param {string} reelId - Reel ID
 * @param {string} text - Comment text
 * @param {string[]} mentions - Mentioned usernames
 */
export const addReelComment = async (reelId, text, mentions = []) => {
  console.log('[REELS SERVICE] 💬 addReelComment called for:', reelId, { text, mentions });
  const res = await axios.post(
    `${API_BASE}/reels/${reelId}/comments`,
    { text, mentions },
    { headers: getAuthHeaders() }
  );
  console.log('[REELS SERVICE] ✅ Comment added');
  return res.data;
};

/**
 * Delete comment
 * Endpoint: DELETE /api/v1/reels/:id/comments/:commentId
 * @param {string} reelId - Reel ID
 * @param {string} commentId - Comment ID
 */
export const deleteReelComment = async (reelId, commentId) => {
  console.log('[REELS SERVICE] 🗑️ deleteReelComment called for reel:', reelId, 'comment:', commentId);
  const res = await axios.delete(`${API_BASE}/reels/${reelId}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });
  console.log('[REELS SERVICE] ✅ Comment deleted');
  return res.data;
};

/**
 * =========================================================
 * FULL REEL UPLOAD FLOW
 * =========================================================
 */

/**
 * Complete flow to create a reel with video and optional thumbnail
 * @param {object} options
 * @param {File} options.videoFile - Video file
 * @param {File} options.thumbnailFile - Optional thumbnail file
 * @param {number} options.duration - Video duration in seconds
 * @param {string} options.aspectRatio - Aspect ratio (default: "9:16")
 * @param {string} options.title - Reel title
 * @param {string} options.caption - Caption
 * @param {string[]} options.hashtags - Hashtags array
 * @param {string[]} options.mentions - Mentions array
 * @param {string} options.visibility - Visibility setting
 * @param {boolean} options.allowComments - Allow comments
 * @param {boolean} options.allowDuets - Allow duets
 * @param {boolean} options.allowStitches - Allow stitches
 * @param {function} options.onProgress - Progress callback
 */
export const createReelWithUpload = async (options) => {
  const {
    videoFile,
    thumbnailFile,
    duration,
    aspectRatio = "9:16",
    title,
    caption,
    hashtags = [],
    mentions = [],
    visibility = "public",
    allowComments = true,
    allowDuets = false,
    allowStitches = false,
    onProgress,
  } = options;

  try {
    onProgress?.(10, "Uploading video...");

    // Step 1: Upload video
    const videoUpload = await uploadReelFile(videoFile, "reel");
    console.log("Video uploaded:", videoUpload);
    onProgress?.(50, "Video uploaded!");

    let thumbnailUrl = "";
    
    // Step 2: Upload thumbnail if provided
    if (thumbnailFile) {
      onProgress?.(60, "Uploading thumbnail...");
      const thumbnailUpload = await uploadReelFile(thumbnailFile, "thumbnail");
      thumbnailUrl = thumbnailUpload.wasabi_direct_url;
      console.log("Thumbnail uploaded:", thumbnailUpload);
      onProgress?.(80, "Thumbnail uploaded!");
    }

    // Step 3: Create reel
    onProgress?.(90, "Creating reel...");
    const reelData = {
      video_url: videoUpload.wasabi_direct_url,
      duration: Math.min(duration, 60), // Max 60 seconds
      thumbnail_url: thumbnailUrl,
      aspect_ratio: aspectRatio,
      title: title || "",
      caption: caption || "",
      hashtags: hashtags.slice(0, 30), // Max 30 hashtags
      mentions: mentions,
      visibility: visibility,
      allow_comments: allowComments,
      allow_duets: allowDuets,
      allow_stitches: allowStitches,
    };

    const reelResponse = await createReel(reelData);
    console.log("Reel created:", reelResponse);
    onProgress?.(100, "Reel created successfully!");

    return reelResponse;
  } catch (error) {
    console.error("Error creating reel:", error);
    throw error;
  }
};

export default {
  getPresignedUrl,
  uploadToPresignedUrl,
  uploadReelFile,
  createReel,
  getReelById,
  updateReel,
  deleteReel,
  trackReelView,
  likeReel,
  unlikeReel,
  saveReel,
  unsaveReel,
  getReelComments,
  addReelComment,
  deleteReelComment,
  createReelWithUpload,
};
