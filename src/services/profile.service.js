import axios from "axios";

const API_BASE = "/api/v1";

/**
 * Get username suggestions from API
 * Endpoint: GET /api/v1/users/username/suggestions
 */
export const getUsernameSuggestions = async () => {
  const res = await axios.get(`${API_BASE}/users/username/suggestions`);
  return res.data.data.suggestions;
};

/**
 * Update user profile (username, bio, full_name, profile_location)
 * Endpoint: PATCH /api/v1/users/:id
 * @param {string} userId - User ID
 * @param {object} data - Profile data to update
 */
export const updateUserProfile = async (userId, data) => {
  const res = await axios.patch(`${API_BASE}/users/${userId}`, data);
  return res.data;
};

/**
 * Update profile main type (primary activity/sport category)
 * Endpoint: POST /api/v1/users/profile-main-type
 * @param {string} mainType - Main type value (e.g., "cricket")
 * @param {string} category - Category (sports, hobbies, activities, additional, nostalgia)
 */
export const updateProfileMainType = async (mainType, category) => {
  const res = await axios.post(`${API_BASE}/users/profile-main-type`, {
    main_type: mainType,
    category: category,
  });
  return res.data;
};

/**
 * Generate bio using AI
 * Endpoint: POST /api/v1/ai/generate-bio
 * @param {string|null} prompt - Optional custom prompt for bio generation
 */
export const generateAIBio = async (prompt = null) => {
  const res = await axios.post(`${API_BASE}/ai/generate-bio`, {
    ai_generate: !prompt,
    prompt: prompt,
  });
  return res.data.data.bio;
};

/**
 * Get current user ID from localStorage
 */
export const getCurrentUserId = () => {
  if (typeof window !== "undefined") {
    // Try to get from user object first
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user._id || user.id;
    }
    // Fallback to user_id directly
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
  const res = await axios.get(`${API_BASE}/users/${userId}`);
  return res.data.data;
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

  const res = await axios.get(`${API_BASE}/feed?${params.toString()}`);
  return res.data.data;
};

/**
 * Get profile completion card status from feed
 */
export const getProfileCompletionStatus = async () => {
  const res = await axios.get(`${API_BASE}/feed`);
  return res.data.data.profile_completion_card;
};

/**
 * Save user profile (legacy method for compatibility)
 * @param {string} username - Username
 * @param {string} profileType - Profile type
 */
export const saveUserProfile = async (username, profileType) => {
  const res = await axios.post(`${API_BASE}/users/profile`, {
    username,
    profile_type: profileType,
  });
  return res.data;
};
