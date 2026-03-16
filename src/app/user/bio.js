import api from "@/services/api";

/**
 * Bio Management API endpoints
 * Based on PROFILE_COMPLETION_API.md specifications
 */

/**
 * Update user profile bio
 * Endpoint: PATCH /api/v1/users/:id
 * 
 * @param {string} userId - User ID
 * @param {string} bio - Bio text (max 200 characters)
 * @returns {Promise} API response with updated user profile
 */
export const updateBio = async (userId, bio) => {
  try {
    const response = await api.patch(`/users/${userId}`, {
      bio: bio
    });
    return response.data;
  } catch (error) {
    console.error('Update bio error:', error);
    throw error;
  }
};

/**
 * Generate bio using AI from profile data
 * Endpoint: POST /api/v1/ai/generate-bio
 * 
 * @returns {Promise} API response with generated bio
 */
export const generateAIBioFromProfile = async () => {
  try {
    const response = await api.post(`/ai/generate-bio`, {
      ai_generate: true
    });
    return response.data;
  } catch (error) {
    console.error('AI bio generation error:', error);
    throw error;
  }
};

/**
 * Generate bio using AI from custom prompt
 * Endpoint: POST /api/v1/ai/generate-bio
 * 
 * @param {string} prompt - Custom prompt for bio generation
 * @returns {Promise} API response with generated bio
 */
export const generateBioFromPrompt = async (prompt) => {
  try {
    const response = await api.post(`/ai/generate-bio`, {
      prompt: prompt
    });
    return response.data;
  } catch (error) {
    console.error('Prompt bio generation error:', error);
    throw error;
  }
};

/**
 * Get username suggestions
 * Endpoint: GET /api/v1/users/username/suggestions
 * 
 * @returns {Promise} API response with username suggestions
 */
export const getUsernameSuggestions = async () => {
  try {
    const response = await api.get(`/users/username/suggestions`);
    return response.data;
  } catch (error) {
    console.error('Get username suggestions error:', error);
    throw error;
  }
};

/**
 * Get user profile
 * Endpoint: GET /api/v1/users/:id
 * 
 * @param {string} userId - User ID
 * @returns {Promise} API response with user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Get current user's profile (me)
 * Endpoint: GET /api/v1/users/me
 * 
 * @returns {Promise} API response with current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get(`/users/me`);
    return response.data;
  } catch (error) {
    console.error('Get current user profile error:', error);
    throw error;
  }
};

export default {
  updateBio,
  generateAIBioFromProfile,
  generateBioFromPrompt,
  getUsernameSuggestions,
  getUserProfile,
  getCurrentUserProfile
};
