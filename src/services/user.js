import api from './api';
import axios from 'axios';

export const userService = {
  // ============ PROFILE ============
  updateName: (name) => api.post('/users/profile/name', { full_name: name }),
  updateGender: (gender) => {
    console.log('Updating gender:', { gender, type: typeof gender });
    const payload = { gender };
    console.log('Gender payload JSON:', JSON.stringify(payload));
    return api.post('/users/profile/gender', payload);
  },
  updateDOB: (dob) => api.post('/users/profile/dob', { dob }),
  
  updateLocation: (locationData) => {
    // Supports: place_id OR lat/lng OR location object with coordinates
    return api.post('/users/profile/location', locationData);
  },
  
  updateProfile: (data) => 
    api.post('/users/profile', data),

   //gender
    getScreenConfig: (screenKey) =>
  api.get(`/onboarding/config/screens/${screenKey}`),


    // ============ AUTH ============
emailPasswordSignup: (email, password, confirmPassword) =>
api.post("/api/v1/auth/signup/email-password", {
  email,
  password,
  confirm_password: confirmPassword,
}),


  // ============ ONBOARDING ============
  getOnboardingStatus: () => api.get('/users/onboarding/status'),
  completeOnboarding: () => api.post('/users/onboarding/complete'),
  
  updateLanguage: (language) => 
    api.post('/users/language', { language }),
  
  saveInterests: (interests) => 
    api.post('/users/onboarding/interests', { interests }),

  // ============ ACTIVITY INTENT ============
  setActivityIntent: (activityType, details = '') => 
    api.post('/users/activity-intent', { 
      activity_type: activityType, 
      details: details  // details is a string, not an object
    }),

  // Get roles for activity intent
  getActivityIntentRoles: () => 
    api.get('/users/activity-intent/roles'),

  // Get profile role config (form fields) by role - NEW ENDPOINT
  getProfileRoleConfig: (role) => 
    role ? api.get(`/users/profile-role-config/${role}`) : api.get('/users/profile-role-config'),

  // ============ PROFILE DETAILS ============
  setProfileDetails: (roleType, details) => 
    api.post('/users/profile-details', { 
      role_type: roleType, 
      details 
    }),

  // ============ PROFILE SETUP (Complete Profile) ============
  // Save profile setup data and navigate to KYC
  completeProfileSetup: (profileType, profileData) => 
    api.post('/users/profile-setup/complete', {
      profile_type: profileType,
      profile_data: profileData,
      next_step: 'kyc'
    }),

  // ============ PROFILE PHOTO ============
  updateProfilePhoto: (imageUrl) => 
    api.post('/users/profile-photo', { image_url: imageUrl }),

  // ============ PARENT CONSENT (MINORS) - NEW API WITH ID PROOF ============
  // Submit parent consent with ID proof document (RECOMMENDED)
  submitParentConsentWithID: (data) => api.post('/users/parent/consent/submit', data),
  
  // Get parent consent request details
  getParentConsentRequest: (requestId) => api.get(`/users/parent/consent/request/${requestId}`),
  
  // Legacy methods (kept for backward compatibility)
  giveParentConsent: () => api.post('/users/parent/consent/give', { accepted: true }),
  getParentConsentStatus: () => api.get('/users/parent/consent/status'),
  revokeParentConsent: (reason) => api.post('/users/parent/consent/revoke', { reason: reason || '' }),

  // ============ KYC ============

  // Face Verification
  verifyFace: (imageData) => 
    api.post('/kyc/face/verify', imageData),
  
  checkLiveness: (imageData) => 
    api.post('/kyc/face/liveness', imageData),

  // ============ MEDIA UPLOAD ============
  getPresignedUrl: (fileName, file) =>
    api.post("/users/media/presign", {
      file_name: fileName,
      mime_type: file.type,
      size_bytes: file.size,
      purpose: 'parent_consent',
    }),

  // Upload file using presigned URL
  uploadToPresigned: async (presignedUrl, file, contentType) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
    });
  },

  // Upload cover photo to presigned URL
  uploadCoverPhotoToPresigned: async (presignedUrl, file, contentType) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
    });
  },

  // ============ HELPERS ============
  // Get current user profile (if needed)
  getMe: () => api.get('/users/me'),

  // ============ GET USER BY ID ============
  // Get user profile by user ID (for viewing other user profiles)
  getUserById: (userId) => api.get(`/users/${userId}`),

  // ============ STORIES ============
  // Get user stories (for viewing other user's stories)
  getUserStories: (userId) => api.get(`/users/${userId}/stories?limit=20`),

  // ============ FOLLOWERS & FOLLOWING ============
  // Get followers list for a user
  getFollowers: (userId, limit = 20, cursor = null) => 
    api.get(`/users/${userId}/followers`, { params: { limit, cursor } }),

  // Get following list for a user
  getFollowing: (userId, limit = 20, cursor = null) => 
    api.get(`/users/${userId}/following`, { params: { limit, cursor } }),

  // Follow a user
  followUser: (userId) => api.post(`/users/${userId}/follow`),

  // Unfollow a user
  unfollowUser: (userId) => {
    console.log('unfollowUser called with userId:', userId);
    return api.delete(`/users/${userId}/follow`);
  },

  // Remove a follower - removes user from YOUR followers list
  // This uses /users/:followerId/follow to remove them (they follow you, not vice versa)
  removeFollower: (followerId) => {
    console.log('removeFollower called with followerId:', followerId);
    return api.delete(`/users/${followerId}/follow`);
  },

  // Check follow status
  getFollowStatus: (userId) => api.get(`/users/${userId}/follow-status`),

  // ============ FOLLOW REQUESTS (for private accounts) ============
  // Send a follow request to a private user
  sendFollowRequest: (userId, message = '') => api.post(`/users/${userId}/follow`, { message }),

  // Cancel a sent follow request by userId
  cancelFollowRequest: (userId) => api.delete(`/users/${userId}/follow-request`),

  // Accept a follow request
  acceptFollowRequest: (requestId) => api.post(`/follow-requests/${requestId}/accept`),

  // Reject a follow request
  rejectFollowRequest: (requestId) => api.post(`/follow-requests/${requestId}/reject`),

  // Get follow request status with a user
  getFollowRequestStatus: (userId) => api.get(`/users/${userId}/follow-request-status`),

  // Get pending follow requests (received)
  getPendingFollowRequests: (limit = 20, cursor = null) => 
    api.get('/follow-requests/pending', { params: { limit, cursor } }),

  // Get sent follow requests
  getSentFollowRequests: (limit = 20, cursor = null) => 
    api.get('/follow-requests/sent', { params: { limit, cursor } }),

  // ============ BLOCK/UNBLOCK ============
  // Block a user - also removes them from your followers list
  blockUser: (userId, reason = "") => api.post(`/users/${userId}/block`, { reason }),

  // Unblock a user
  unblockUser: (userId) => api.delete(`/users/${userId}/block`),

  // ============ MUTE/UNMUTE ============
  // Mute a user
  muteUser: (userId, muteOptions = { mute_posts: true, mute_stories: true, mute_notifications: false }) => 
    api.post(`/users/${userId}/mute`, muteOptions),

  // Unmute a user
  unmuteUser: (userId) => api.delete(`/users/${userId}/mute`),

  // Get mute status for a specific user (by checking muted users list)
  getMuteStatus: async (userId) => {
    // Get all muted users and check if the target user is in the list
    const response = await api.get('/users/muted', { params: { limit: 100 } });
    const mutedData = response?.data?.data || response?.data;
    const mutedUsers = mutedData?.muted_users || [];
    
    // Check if the userId matches any muted user
    const isMuted = mutedUsers.some(mu => 
      mu.user?._id === userId || 
      mu.user?.user_id === userId || 
      mu.user?.username === userId
    );
    
    return { data: { is_muted: isMuted } };
  },

  // Get muted users list
  getMutedUsers: (limit = 20, cursor = null) => 
    api.get('/users/muted', { params: { limit, cursor } }),

  // ============ CLOSE FRIENDS ============
  // Add user to close friends (by username)
  addToCloseFriends: (username) => api.post(`/close-friends/${username}`),

  // Remove user from close friends (by username)
  removeFromCloseFriends: (username) => api.delete(`/close-friends/${username}`),

  // Get close friends list
  getCloseFriends: (limit = 20, cursor = null) => 
    api.get('/close-friends', { params: { limit, cursor } }),

  // ============ LIKES/REACTIONS ============
  // Toggle like on story
  toggleStoryLike: (storyId) => 
    api.post('/likes/toggle', {
      content_type: 'story',
      content_id: storyId,
      reaction: 'like'
    }),

  // Reply to a story - sends a DM to the story owner
  replyToStory: (storyId, message) => 
    api.post(`/stories/${storyId}/reply`, {
      message
    }),

  // ============ COVER PHOTO ============
  // Step 1: Get presigned URL for cover photo upload
  getCoverPhotoPresign: (userId, fileName, mimeType, sizeBytes) => 
    api.post(`/users/${userId}/cover-photo/presign`, {
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes
    }),

  // Step 2: Confirm cover photo upload
  confirmCoverPhoto: (userId, fileUrl, fileKey) => 
    api.post(`/users/${userId}/cover-photo/confirm`, {
      file_url: fileUrl,
      file_key: fileKey
    }),

  // Delete cover photo
  deleteCoverPhoto: (userId) => 
    api.delete(`/users/${userId}/cover-photo`),

  // ============ AVATAR / PROFILE PHOTO ============
  // Step 1: Get presigned URL for avatar upload
  getAvatarPresign: (userId, fileName, mimeType, sizeBytes) => 
    api.post(`/users/${userId}/avatar/presign`, {
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes
    }),

  // Step 2: Confirm avatar upload
  confirmAvatar: (userId, fileUrl, fileKey) => 
    api.post(`/users/${userId}/avatar/confirm`, {
      file_url: fileUrl,
      file_key: fileKey
    }),

  // Delete avatar
  deleteAvatar: (userId) => 
    api.delete(`/users/${userId}/avatar`),

  // Get all profile photos
  getProfilePhotos: () => 
    api.get('/users/profile-photos'),

  // Delete profile photo
  deleteProfilePhoto: (photoIndex) => 
    api.delete(`/users/profile-photos/${photoIndex}`),

  // Set primary photo
  setPrimaryPhoto: (photoIndex) => 
    api.put(`/users/profile-photos/${photoIndex}/set-primary`),

  // ============ PRIVACY SETTINGS ============
  // Get privacy settings
  getPrivacy: (userId) => api.get(`/users/${userId}/privacy`),

  // Update privacy settings (uses PATCH as per API doc)
  updatePrivacy: (userId, privacyData) => 
    api.patch(`/users/${userId}/privacy`, privacyData),

  // ============ ACCOUNT PRIVACY (is_private) ============
  // Get account privacy (public/private account)
  getAccountPrivacy: () => api.get('/users/me/privacy/account'),

  // Update account privacy (toggle public/private)
  updateAccountPrivacy: (isPrivate) => 
    api.patch('/users/me/privacy/account', { is_private: isPrivate }),
};

// Direct exports for commonly used functions
export const getUserById = (userId) => userService.getUserById(userId);
export const getUserStories = (userId) => userService.getUserStories(userId);
export const getFollowers = (userId, limit, cursor) => userService.getFollowers(userId, limit, cursor);
export const getFollowing = (userId, limit, cursor) => userService.getFollowing(userId, limit, cursor);
export const followUser = (userId) => userService.followUser(userId);
export const unfollowUser = (userId) => userService.unfollowUser(userId);
export const getAccountPrivacy = () => userService.getAccountPrivacy();
export const updateAccountPrivacy = (isPrivate) => userService.updateAccountPrivacy(isPrivate);

// Follow request exports
export const sendFollowRequest = (userId, message) => userService.sendFollowRequest(userId, message);
export const cancelFollowRequest = (userId) => userService.cancelFollowRequest(userId);
export const acceptFollowRequest = (requestId) => userService.acceptFollowRequest(requestId);
export const rejectFollowRequest = (requestId) => userService.rejectFollowRequest(requestId);
export const getFollowRequestStatus = (userId) => userService.getFollowRequestStatus(userId);
export const getPendingFollowRequests = (limit, cursor) => userService.getPendingFollowRequests(limit, cursor);
export const getSentFollowRequests = (limit, cursor) => userService.getSentFollowRequests(limit, cursor);

export default userService;
