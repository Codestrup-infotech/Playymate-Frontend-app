import api from "@/services/api";

// ─────────────────────────────────────────────
// FOLLOW REQUEST API
// Based on FOLLOW_REQUEST_API.md documentation
// ─────────────────────────────────────────────

/**
 * Get pending follow requests (received by the user)
 */
export const getPendingFollowRequests = ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get("/follow-requests/pending", { params });
};

/**
 * Get sent follow requests
 */
export const getSentFollowRequests = ({ limit = 20, cursor } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  return api.get("/follow-requests/sent", { params });
};

/**
 * Accept a follow request
 */
export const acceptFollowRequest = (requestId) =>
  api.post(`/follow-requests/${requestId}/accept`);

/**
 * Reject a follow request
 */
export const rejectFollowRequest = (requestId) =>
  api.post(`/follow-requests/${requestId}/reject`);

/**
 * Cancel a follow request (sent by the user)
 */
export const cancelFollowRequest = (requestId) =>
  api.delete(`/follow-requests/${requestId}`);

/**
 * Send a follow request to a user
 */
export const sendFollowRequest = (userId, message) =>
  api.post(`/users/${userId}/follow`, { message });

/**
 * Check follow request status with a specific user
 */
export const getFollowRequestStatus = (userId) =>
  api.get(`/users/${userId}/follow-request-status`);