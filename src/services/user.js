import api from './api';

export const userService = {
  // ============ PROFILE ============
  updateName: (name) => api.post('/users/profile/name', { name }),
  updateGender: (gender) => api.post('/users/profile/gender', { gender }),
  updateDOB: (dob) => api.post('/users/profile/dob', { dob }),
  
  updateLocation: (locationData) => {
    // Supports: place_id OR lat/lng OR location object with coordinates
    return api.post('/users/profile/location', locationData);
  },
  
  updateProfile: (data) => 
    api.post('/users/profile', data),

  // ============ ONBOARDING ============
  getOnboardingStatus: () => api.get('/users/onboarding/status'),
  completeOnboarding: () => api.post('/users/onboarding/complete'),
  
  updateLanguage: (language) => 
    api.post('/users/language', { language }),
  
  saveInterests: (interests) => 
    api.post('/users/onboarding/interests', { interests }),

  // ============ ACTIVITY INTENT ============
  setActivityIntent: (activityType, details = {}) => 
    api.post('/users/activity-intent', { 
      activity_type: activityType, 
      details 
    }),

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

  // ============ PARENT CONSENT (MINORS) ============
  giveParentConsent: () => api.post('/users/parent/consent/give'),
  getParentConsentStatus: () => api.get('/users/parent/consent/status'),
  revokeParentConsent: () => api.post('/users/parent/consent/revoke'),

  // ============ KYC ============
  // Aadhaar Verification
  sendAadhaarOTP: (aadhaarNumber) => 
    api.post('/kyc/aadhaar/otp/send', { aadhaar_number: aadhaarNumber }),
  
  verifyAadhaarOTP: (otp, referenceId) => 
    api.post('/kyc/aadhaar/otp/verify', { otp, reference_id: referenceId }),

  // Face Verification
  verifyFace: (imageData) => 
    api.post('/kyc/face/verify', imageData),
  
  checkLiveness: (imageData) => 
    api.post('/kyc/face/liveness', imageData),

  // ============ MEDIA UPLOAD ============
  getPresignedUrl: (fileName, contentType) => 
    api.post('/users/media/presign', { 
      file_name: fileName, 
      content_type: contentType 
    }),

  // Upload file using presigned URL
  uploadToPresigned: async (presignedUrl, file, contentType) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
    });
  },

  // ============ HELPERS ============
  // Get current user profile (if needed)
  getMe: () => api.get('/users/me'),
};

export default userService;
