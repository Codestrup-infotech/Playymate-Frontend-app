import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Read the auth token from localStorage and return axios-ready headers */
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

/**
 * Get username suggestions from API
 * Endpoint: GET /api/v1/users/username/suggestions
 */
export const getUsernameSuggestions = async () => {
  const res = await axios.get(`${API_BASE}/users/username/suggestions`, {
    headers: getAuthHeaders(),
  });
  return res.data.data.suggestions;
};

/**
 * Update user profile (username, bio, full_name, profile_location)
 * Endpoint: PATCH /api/v1/users/:id
 * @param {string} userId - User ID
 * @param {object} data - Profile data to update
 */
export const updateUserProfile = async (userId, data) => {
  const res = await axios.patch(`${API_BASE}/users/${userId}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * Update profile main type (primary activity/sport category)
 * Endpoint: POST /api/v1/users/profile-main-type
 * @param {string} mainType - Main type value (e.g., "cricket")
 * @param {string} category - Category (sports, hobbies, activities, additional, nostalgia)
 */
export const updateProfileMainType = async (mainType, category) => {
  const res = await axios.post(
    `${API_BASE}/users/profile-main-type`,
    { main_type: mainType, category },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Generate bio using AI
 * Endpoint: POST /api/v1/ai/generate-bio
 * @param {string|null} prompt - Optional custom prompt for bio generation
 */
export const generateAIBio = async (prompt = null) => {
  const res = await axios.post(
    `${API_BASE}/ai/generate-bio`,
    { ai_generate: !prompt, prompt },
    { headers: getAuthHeaders() }
  );
  return res.data.data.bio;
};

/**
 * Get current user ID from localStorage
 */
export const getCurrentUserId = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user._id || user.id;
    }
    return localStorage.getItem("user_id");
  }
  return null;
};

/**
 * Get user profile data
 * Endpoint: GET /api/v1/users/:id
 * @param {string} userId - User ID
 */
export const getUserProfile = async (userId) => {
  const res = await axios.get(`${API_BASE}/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  // Handle both nested and non-nested API response formats
  // Return the profile data directly
  return res.data?.data || res.data;
};

/**
 * Get feed with profile completion card status
 * Endpoint: GET /api/v1/feed
 * @param {string} cursor - Pagination cursor
 * @param {number} limit - Items per page
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
 * Get profile completion card status from feed
 */
export const getProfileCompletionStatus = async () => {
  const res = await axios.get(`${API_BASE}/feed`, {
    headers: getAuthHeaders(),
  });
  return res.data.data.profile_completion_card;
};

/**
 * Save user profile (legacy method for compatibility)
 * @param {string} username - Username
 * @param {string} profileType - Profile type
 */
export const saveUserProfile = async (username, profileType) => {
  const res = await axios.post(
    `${API_BASE}/users/profile`,
    { username, profile_type: profileType },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ============================================
// Avatar / Profile Photo API Endpoints
// ============================================

/**
 * Get presigned URL for avatar upload
 * Endpoint: POST /api/v1/users/:id/avatar/presign
 * @param {string} userId - User ID
 * @param {object} data - File data { file_name, mime_type, size_bytes }
 */
export const getAvatarPresignedUrl = async (userId, data) => {
  console.log("getAvatarPresignedUrl - Request:", { userId, data });
  try {
    const res = await axios.post(
      `${API_BASE}/users/${userId}/avatar/presign`,
      data,
      { headers: getAuthHeaders() }
    );
    console.log("getAvatarPresignedUrl - Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("getAvatarPresignedUrl - Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Confirm avatar upload
 * Endpoint: POST /api/v1/users/:id/avatar/confirm
 * @param {string} userId - User ID
 * @param {object} data - { file_url, file_key }
 */
export const confirmAvatarUpload = async (userId, data) => {
  const res = await axios.post(
    `${API_BASE}/users/${userId}/avatar/confirm`,
    data,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Delete avatar
 * Endpoint: DELETE /api/v1/users/:id/avatar
 * @param {string} userId - User ID
 */
export const deleteAvatar = async (userId) => {
  const res = await axios.delete(
    `${API_BASE}/users/${userId}/avatar`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Get all profile photos
 * Endpoint: GET /api/v1/users/profile-photos
 */
export const getAllProfilePhotos = async () => {
  const res = await axios.get(
    `${API_BASE}/users/profile-photos`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Delete profile photo
 * Endpoint: DELETE /api/v1/users/profile-photos/:photoIndex
 * @param {number} photoIndex - Index of the photo to delete
 */
export const deleteProfilePhoto = async (photoIndex) => {
  const res = await axios.delete(
    `${API_BASE}/users/profile-photos/${photoIndex}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Set primary photo
 * Endpoint: PUT /api/v1/users/profile-photos/:photoIndex/set-primary
 * @param {number} photoIndex - Index of the photo to set as primary
 */
export const setPrimaryPhoto = async (photoIndex) => {
  const res = await axios.put(
    `${API_BASE}/users/profile-photos/${photoIndex}/set-primary`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/**
 * Upload avatar with presigned URL
 * Handles the complete upload flow: get presigned URL -> upload file to Wasabi -> confirm
 * @param {string} userId - User ID
 * @param {File} file - Image file to upload
 */
export const uploadAvatar = async (userId, file) => {
  try {
    // Step 1: Get presigned URL from API
    console.log("=== UPLOAD AVATAR FLOW ===");
    console.log("Profile photo is uploading...");
    console.log("User ID:", userId);
    console.log("File name:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);
    console.log("Step 1: Getting presigned URL from API...");
    
    const presignResponse = await getAvatarPresignedUrl(userId, {
      file_name: file.name || `avatar_${Date.now()}.jpg`,
      mime_type: file.type || "image/jpeg",
      size_bytes: file.size
    });

    console.log("Presign endpoint response:", presignResponse);
    console.log("Presign response status:", presignResponse.status);
    
    if (presignResponse.status !== "success") {
      console.error("Presign failed:", presignResponse);
      throw new Error(presignResponse.message || "Failed to get presigned URL");
    }

    const { upload_url, file_url, file_key } = presignResponse.data;
    console.log("Presigned URL received!");
    console.log("Upload URL:", upload_url);
    console.log("CDN URL:", file_url);

    // Step 2: Upload file directly to Wasabi using presigned URL
    console.log("Step 2: Uploading file to Wasabi...");
    await axios.put(upload_url, file, {
      headers: {
        'Content-Type': file.type || "image/jpeg"
      },
      timeout: 60000 // 60 seconds timeout for large files
    });

    console.log("File uploaded to Wasabi!");

    // Step 3: Confirm upload to get final CDN URL
    console.log("Step 3: Confirming upload...");
    const confirmResponse = await confirmAvatarUpload(userId, {
      file_url: file_url,
      file_key: file_key
    });

    console.log("Upload confirmed!");
    console.log("Final CDN URL:", confirmResponse.data.profile_image_url);
    console.log("=== UPLOAD COMPLETE ===\n");

    return confirmResponse;
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received (network error?)");
      console.error("Error request:", error.request);
    }
    console.error("=== END ERROR ===\n");
    throw error;
  }
};
