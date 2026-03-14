import api from "@/services/api";

/**
 * Profile Search API endpoints
 * Based on USER_API.md specifications
 */

/**
 * Search for users by query string
 * Endpoint: GET /api/v1/users/search
 * 
 * @param {string} query - Search query (username, full name)
 * @param {Object} options - Additional search options
 * @param {number} options.limit - Max results (default 20, max 50)
 * @param {string} options.cursor - Pagination cursor
 * @param {string} options.type - Filter by user type (sports, hobby, etc.)
 * @returns {Promise} API response with search results
 */
export const searchUsers = async (query, options = {}) => {
  const { limit = 20, cursor = null, type = null } = options;
  
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (limit) params.append('limit', limit);
  if (cursor) params.append('cursor', cursor);
  if (type) params.append('type', type);

  try {
    const response = await api.get(`/users/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
};

/**
 * Get suggested users to follow
 * Endpoint: GET /api/v1/feed/suggested-follows
 * 
 * @param {Object} options - Additional options
 * @param {number} options.limit - Max results (default 20, max 50)
 * @returns {Promise} API response with suggested users
 */
export const getSuggestedUsers = async (options = {}) => {
  const { limit = 20 } = options;

  try {
    const response = await api.get(`/feed/suggested-follows?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get suggested users error:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * Endpoint: GET /api/v1/users/:id
 * 
 * @param {string} userId - User ID
 * @returns {Promise} API response with user profile
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};

/**
 * Follow a user
 * Endpoint: POST /api/v1/users/:id/follow
 * 
 * @param {string} userId - User ID to follow
 * @returns {Promise} API response
 */
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Follow user error:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 * Endpoint: DELETE /api/v1/users/:id/follow
 * 
 * @param {string} userId - User ID to unfollow
 * @returns {Promise} API response
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Unfollow user error:', error);
    throw error;
  }
};

/**
 * Search users by interests/sports
 * Endpoint: GET /api/v1/users/search/by-interest
 * 
 * @param {string} interest - Interest or sport to search by
 * @param {Object} options - Additional search options
 * @param {number} options.limit - Max results
 * @param {string} options.cursor - Pagination cursor
 * @returns {Promise} API response with users having that interest
 */
export const searchUsersByInterest = async (interest, options = {}) => {
  const { limit = 20, cursor = null } = options;

  try {
    const params = new URLSearchParams();
    params.append('interest', interest);
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);

    const response = await api.get(`/users/search/by-interest?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Search users by interest error:', error);
    throw error;
  }
};

/**
 * Search users by location
 * Endpoint: GET /api/v1/users/search/nearby
 * 
 * @param {Object} location - Location coordinates
 * @param {number} location.latitude - Latitude
 * @param {number} location.longitude - Longitude
 * @param {number} radius - Radius in km (default 10, max 100)
 * @returns {Promise} API response with nearby users
 */
export const searchUsersNearby = async (location, radius = 10) => {
  try {
    const response = await api.get(`/users/search/nearby`, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        radius
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search users nearby error:', error);
    throw error;
  }
};

export default {
  searchUsers,
  getSuggestedUsers,
  getUserById,
  followUser,
  unfollowUser,
  searchUsersByInterest,
  searchUsersNearby
};
