import api from './api';

export const authService = {
  // ============ SOCIAL LOGIN ============
  loginWithGoogle: (token) => api.post('/auth/social/google', { token }),
  loginWithFacebook: (token) => api.post('/auth/social/facebook', { token }),
  loginWithApple: (token) => api.post('/auth/social/apple', { token }),

  // ============ IDENTITY SELECTION ============
  initiatePhone: (phone) => {
    console.log('Initiating phone:', { phone });
    return api.post('/auth/identity/phone', { phone });
  },
  initiateEmail: (email) => api.post('/auth/identity/email', { email }),
  initiateGoogle: (token) => api.post('/auth/identity/google', { token }),
  initiateFacebook: (token) => api.post('/auth/identity/facebook', { token }),
  initiateApple: (token) => api.post('/auth/identity/apple', { token }),

  // ============ PHONE OTP (Direct with phone only) ============
  sendPhoneOTPDirect: (phone) => {
    console.log('Sending phone OTP:', { phone });
    return api.post('/auth/phone/send-otp', { phone });
  },
  verifyPhoneOTPDirect: (phone, otp) => {
    console.log('Verifying phone OTP:', { phone, otp });
    return api.post('/auth/phone/verify-otp', { phone, otp });
  },
  
  // ============ PHONE OTP (With Flow ID - proper session flow) ============
  sendPhoneOTP: (authFlowId, phone) => {
    console.log('Sending phone OTP with flow:', { auth_flow_id: authFlowId, phone });
    return api.post('/auth/phone/send-otp', { auth_flow_id: authFlowId, phone });
  },
  verifyPhoneOTP: (authFlowId, otp) => {
    console.log('Verifying phone OTP with flow:', { auth_flow_id: authFlowId, otp });
    return api.post('/auth/phone/verify-otp', { auth_flow_id: authFlowId, otp });
  },

  // ============ EMAIL OTP (Direct with email only) ============
  sendEmailOTPDirect: (email) => {
    console.log('Sending email OTP:', { email });
    return api.post('/auth/email/send-otp', { email });
  },
  verifyEmailOTPDirect: (email, otp) => {
    console.log('Verifying email OTP:', { email, otp });
    return api.post('/auth/email/verify-otp', { email, otp });
  },

  // ============ EMAIL OTP (With Flow ID) ============
  sendEmailOTP: (authFlowId, email) => {
    console.log('Sending email OTP with flow:', { auth_flow_id: authFlowId, email });
    return api.post('/auth/email/send-otp', { auth_flow_id: authFlowId, email });
  },
  verifyEmailOTP: (authFlowId, otp) => {
    console.log('Verifying email OTP with flow:', { auth_flow_id: authFlowId, otp });
    return api.post('/auth/email/verify-otp', { auth_flow_id: authFlowId, otp });
  },
  
  // Email Login (Password-based)
  loginWithEmailPassword: (email, password) => 
    api.post('/auth/email/login', { email, password }),

  // ============ ACCOUNT COMPLETION ============
  createBasicAccount: (authFlowId, data) => 
    api.post('/auth/basic-account', { auth_flow_id: authFlowId, ...data }),
  completeLogin: (authFlowId) => 
    api.post('/auth/complete', { auth_flow_id: authFlowId }),

  // ============ SESSION MANAGEMENT ============
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),

  // ============ AUTH FLOW ID MANAGEMENT ============
  getAuthFlowId: () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_flow_id');
    }
    return null;
  },

  setAuthFlowId: (flowId) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_flow_id', flowId);
    }
  },

  clearAuthFlowId: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_flow_id');
    }
  },

  isInAuthFlow: () => {
    if (typeof window !== 'undefined') {
      const hasFlowId = !!sessionStorage.getItem('auth_flow_id');
      const hasTokens = !!localStorage.getItem('accessToken');
      return hasFlowId && !hasTokens;
    }
    return false;
  },

  // ============ HELPERS ============
  storeTokens: (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (data.accessToken) {
        sessionStorage.removeItem('auth_flow_id');
      }
    }
  },

  storeAuthData: (data) => {
    if (typeof window !== 'undefined') {
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.next_required_step) {
        localStorage.setItem('next_required_step', data.next_required_step);
      }
      if (data.accessToken) {
        sessionStorage.removeItem('auth_flow_id');
      }
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getNextRequiredStep: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('next_required_step');
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('next_required_step');
      sessionStorage.removeItem('auth_flow_id');
    }
  },

  isLoggedIn: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  },

  isOnboardingComplete: () => {
    if (typeof window !== 'undefined') {
      const nextStep = localStorage.getItem('next_required_step');
      return nextStep === 'DONE' || nextStep === null;
    }
    return false;
  },
};
