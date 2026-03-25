import api from "@/services/api";

/**
 * Close Friends Service
 * Provides APIs for managing close friends list
 */

const closeFriendsService = {
  /**
   * Get the authenticated user's close friends list
   * @param {number} limit - Number of results to fetch
   * @param {string|null} cursor - Pagination cursor
   * @returns {Promise} - API response with close friends list
   */
  getCloseFriends: (limit = 20, cursor = null) => 
    api.get('/close-friends', { params: { limit, cursor } }),

  /**
   * Add a user to close friends by username
   * @param {string} username - Username of the user to add
   * @returns {Promise} - API response
   */
  addToCloseFriends: (username) => 
    api.post(`/close-friends/${username}`),

  /**
   * Remove a user from close friends by username
   * @param {string} username - Username of the user to remove
   * @returns {Promise} - API response
   */
  removeFromCloseFriends: (username) => 
    api.delete(`/close-friends/${username}`),
};

export default closeFriendsService;
