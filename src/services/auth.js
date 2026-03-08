import api from '../lib/api/client';

export const authService = {


  // ============ LOGIN CONFIG ============

getLoginScreen: async (screenType, platform = "web") => {
  console.log("Fetching login screen:", screenType);

  const response = await api.get(
    `/auth/login-config/screens/${screenType}?platform=${platform}`
  );

  return response;
},

getAllLoginScreens: async (platform = "web") => {
  console.log("Fetching all login screens");

  const response = await api.get(
    `/auth/login-config/screens?platform=${platform}`
  );

  return response;
},



// ============ ONBOARDING CONFIG ============

getOnboardingScreen: async (screenKey, platform = "web") => {
  console.log("Fetching onboarding screen:", screenKey);

  const response = await api.get(
  `/api/v1/onboarding/config/screens/${screenKey}?platform=${platform}`
);

  return response;
},

getAllOnboardingScreens: async (platform = "web") => {
  console.log("Fetching all onboarding screens");

  const response = await api.get(
    `/api/v1/onboarding/config/screens?platform=${platform}`
  );

  return response;
},

getOnboardingScreenKeys: async () => {
  console.log("Fetching onboarding screen keys");

  const response = await api.get(
    `/api/v1/onboarding/config/keys`
  );

  return response;
},



  // ============ PHONE OTP ============


  // sendPhoneOTP: (phone) => {
  //   console.log('Sending phone OTP:', { phone });
  //   return api.post('/auth/phone/send-otp', { phone });
  // },



sendPhoneOTP: async (phone) => {
  console.log("📤 Sending phone OTP:", { phone });

  const response = await api.post('/auth/phone/send-otp', { phone });

  // 🔥 LOG FULL RESPONSE
  console.log("📥 OTP API RESPONSE:", response.data);

  return response;
},





  verifyPhoneOTP: (authFlowId, otp) => {
    console.log('Verifying phone OTP:', { auth_flow_id: authFlowId, otp });
    return api.post('/auth/phone/verify-otp', { auth_flow_id: authFlowId, otp });
  },

  // ============ EMAIL OTP ============
  sendEmailOTP: (authFlowId, email) => {
    console.log('Sending email OTP:', { auth_flow_id: authFlowId, email });
    return api.post('/auth/email/send-otp', { auth_flow_id: authFlowId, email });
  },
  verifyEmailOTP: (authFlowId, otp, email) => {
    console.log('Verifying email OTP:', { auth_flow_id: authFlowId, otp, email });
    return api.post('/auth/email/verify-otp', { auth_flow_id: authFlowId, otp, email });
  },

  // ============ ACCOUNT COMPLETION ============
  updateName: (authFlowId, name) => {
    console.log('Updating name:', { auth_flow_id: authFlowId, full_name: name });
    return api.post('/auth/profile/name', { auth_flow_id: authFlowId, full_name: name });
  },
  completeLogin: (authFlowId) => {
    console.log('Completing login:', { auth_flow_id: authFlowId });
    return api.post('/auth/complete', { auth_flow_id: authFlowId });
  },

  // ============ TOKEN MANAGEMENT ============
  storeTokens: (tokens) => {
    // Clear old tokens first to avoid stale token issues
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      
      // Store ONLY in sessionStorage - tokens will be cleared when browser tab is closed
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      
      console.log('Tokens stored in sessionStorage only - will be cleared on tab close');
    }
  },
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      // Only check sessionStorage - tokens should only be stored there now
      return sessionStorage.getItem('accessToken');
    }
    return null;
  },

  clearTokens: () => {
    // Clear ONLY sessionStorage tokens
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      console.log('Session tokens cleared (tab close behavior)');
    }
  },

  // ============ ONBOARDING RESUME ============
  storeOnboardingResume: (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_resume_data', JSON.stringify(data));
      if (data.onboarding_state) {
        localStorage.setItem('onboarding_state', data.onboarding_state);
      }
      if (data.progress_percentage) {
        localStorage.setItem('progress_percentage', data.progress_percentage.toString());
      }
    }
  },
  getOnboardingResume: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('onboarding_resume_data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  storeOnboardingState: (data) => {
    if (typeof window !== 'undefined') {
      if (data.onboarding_state) {
        localStorage.setItem('onboarding_state', data.onboarding_state);
      }
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id);
      }
      if (data.current_step) {
        localStorage.setItem('current_step', data.current_step);
      }
    }
  },

  // ============ REDIRECT LOGIC ============
  getOnboardingRedirect: (onboardingState) => {
    const stateToScreen = {
      'INIT': '/login',
      'PHONE_VERIFIED': '/login',
      'EMAIL_VERIFIED': '/login',
      'BASIC_ACCOUNT_CREATED': '/onboarding/gender',
      'GENDER_CAPTURED': '/onboarding/dob',
      'DOB_CAPTURED': '/onboarding/location',
      'PARENT_CONSENT_PENDING': '/onboarding/parent-consent',
      'PARENT_CONSENT_APPROVED': '/onboarding/location',
      'LOCATION_CAPTURED': '/onboarding/photo',
      'PROFILE_PHOTO_CAPTURED': '/onboarding/activity-intent',
      'ACTIVITY_INTENT_CAPTURED': '/onboarding/profile-details',
      'PROFILE_DETAILS_CAPTURED': '/onboarding/physical',  
      'AADHAAR_VERIFIED': '/verification/liveness',
      'FACE_LIVENESS_PASSED': '/verification/complete',
      'VERIFICATION_PENDING': '/onboarding/physical',
      'KYC_COMPLETED': '/physical-activity',
      'PHYSICAL_PROFILE_CONSENT': '/physical-activity',
      'PHYSICAL_PROFILE_COMPLETED': '/physical-questions',
      'QUESTIONNAIRE_STARTED': '/physical-questions',
      'QUESTIONNAIRE_COMPLETED': '/',
      'COMPLETED': '/',
      'ACTIVE_USER': '/'
    };
    
    return stateToScreen[onboardingState] || '/onboarding/gender';
  },

  // ============ SOCIAL LOGIN ============
  loginWithGoogle: (token) => api.post('/auth/social/google', { token }),
  loginWithFacebook: (token) => api.post('/auth/social/facebook', { token }),
  loginWithApple: (token) => api.post('/auth/social/apple', { token }),
};

export default authService;
