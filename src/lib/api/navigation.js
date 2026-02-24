/**
 * Navigation utilities for handling onboarding state machine
 * Maps next_required_step to routes and handles navigation flow
 */

import { userService } from '@/services/user';

// Step to route mapping
export const stepRouteMap = {
  // Auth steps
  'PHONE_OTP': '/login',
  'EMAIL_OTP': '/login',
  'EMAIL_PASSWORD_SIGNUP': '/login',
  'SOCIAL_LOGIN': '/login',
  'AUTH_COMPLETE': '/login',
  
  // Onboarding steps
  'NAME': '/onboarding/name',
  'GENDER': '/onboarding/gender',
  'DOB': '/onboarding/dob',
  'PARENT_CONSENT': '/onboarding/parent-consent',
  'LOCATION': '/onboarding/location',
  'PROFILE_PHOTO': '/onboarding/profile-photo',
  'ACTIVITY_INTENT': '/onboarding/activity-intent',
  'PROFILE_DETAILS': '/onboarding/profile-details',
  
  // KYC steps
  'KYC_DIGILOCKER': '/verification/digilocker',
  'KYC_LIVENESS': '/verification/liveness',
  'KYC_COMPLETE': '/verification/complete',
  'KYC_PENDING': '/verification/digilocker',
  
  // Questionnaire steps
  'QUESTIONNAIRE': '/physical-questions',
  'QUESTIONNAIRE_CATEGORY': '/physical-questions',
  'QUESTIONNAIRE_COMPLETE': '/',
  
  // Final state
  'COMPLETED': '/',
  'ACTIVE': '/',
};

// Reverse mapping - route to step
export const routeStepMap = Object.entries(stepRouteMap).reduce((acc, [step, route]) => {
  acc[route] = step;
  return acc;
}, {});

/**
 * Get route from onboarding step
 * @param {string} step - The next_required_step from backend
 * @returns {string} Route path
 */
export const getRouteFromStep = (step) => {
  if (!step) return '/';
  return stepRouteMap[step] || '/';
};

/**
 * Get step from route
 * @param {string} route - Route path
 * @returns {string} Onboarding step
 */
export const getStepFromRoute = (route) => {
  if (!route) return null;
  return routeStepMap[route] || null;
};

/**
 * Check if route requires authentication
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const requiresAuth = (route) => {
  const authRoutes = ['/login', '/register'];
  return !authRoutes.includes(route);
};

/**
 * Check if route is part of onboarding flow
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const isOnboardingRoute = (route) => {
  const onboardingRoutes = [
    '/onboarding/name',
    '/onboarding/gender',
    '/onboarding/dob',
    '/onboarding/parent-consent',
    '/onboarding/location',
    '/onboarding/profile-photo',
    '/onboarding/activity-intent',
    '/onboarding/profile-details',
    '/verification/digilocker',
    '/verification/liveness',
    '/verification/complete',
  ];
  return onboardingRoutes.some(r => route?.startsWith(r));
};

/**
 * Check if route is part of verification flow
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const isVerificationRoute = (route) => {
  return route?.startsWith('/verification');
};

/**
 * Navigate to the correct step based on onboarding status
 * @param {Object} status - Onboarding status from API
 * @param {Object} router - Next.js router
 */
export const navigateToNextStep = async (status, router) => {
  const nextStep = status?.next_required_step;
  if (nextStep) {
    const route = getRouteFromStep(nextStep);
    router.push(route);
    return true;
  }
  return false;
};

/**
 * Navigate after OTP verification
 * @param {Object} response - Auth response from OTP verification
 * @param {Object} router - Next.js router
 */
export const navigateAfterOTP = async (response, router) => {
  const nextStep = response?.data?.data?.next_required_step;
  
  if (nextStep) {
    const route = getRouteFromStep(nextStep);
    router.push(route);
    return true;
  }
  
  // Default to onboarding or home
  router.push('/onboarding/name');
  return false;
};

/**
 * Fetch onboarding status and navigate to correct step
 * @param {Object} router - Next.js router
 * @returns {boolean} True if navigation occurred
 */
export const resumeOnboarding = async (router) => {
  try {
    const status = await userService.getOnboardingStatus();
    return await navigateToNextStep(status, router);
  } catch (error) {
    console.error('Error resuming onboarding:', error);
    // If error, go to home
    router.push('/');
    return false;
  }
};

/**
 * Check if user is a minor based on DOB
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isMinor = (dob) => {
  if (!dob) return false;
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age < 18;
};

/**
 * Check if route should be blocked for minors
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const isBlockedForMinors = (route) => {
  const blockedRoutes = [
    '/onboarding/activity-intent',
    '/onboarding/profile-details',
    '/verification/digilocker',
    '/verification/liveness',
    '/verification/complete',
  ];
  return blockedRoutes.includes(route);
};

/**
 * Get the initial route for new users
 * @returns {string}
 */
export const getInitialRoute = () => {
  return '/login';
};

/**
 * Get home route based on user state
 * @param {Object} userStatus - User status from API
 * @returns {string}
 */
export const getHomeRoute = (userStatus) => {
  if (!userStatus?.onboarding_state || userStatus.onboarding_state === 'NOT_STARTED') {
    return '/login';
  }
  
  if (userStatus.onboarding_state === 'COMPLETED' || userStatus.onboarding_state === 'ACTIVE') {
    return '/';
  }
  
  // Resume onboarding
  return null; // Caller should call resumeOnboarding
};

export default {
  stepRouteMap,
  routeStepMap,
  getRouteFromStep,
  getStepFromRoute,
  requiresAuth,
  isOnboardingRoute,
  isVerificationRoute,
  navigateToNextStep,
  navigateAfterOTP,
  resumeOnboarding,
  isMinor,
  isBlockedForMinors,
  getInitialRoute,
  getHomeRoute,
};

/**
 * Navigate after successful authentication (used by StepGoogle.jsx)
 * @param {Object} router - Next.js router
 * @param {boolean} isNewUser - Whether this is a new user
 * @param {Object} data - Auth response data containing tokens and user info
 */
export const navigateAfterAuth = async (router, isNewUser = false, data = null) => {
  // Store auth data if provided
  if (data) {
    const { accessToken, refreshToken, user, next_required_step } = data;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (next_required_step) {
      localStorage.setItem('next_required_step', next_required_step);
    }
    
    // Clear auth flow ID if present
    sessionStorage.removeItem('auth_flow_id');
  }
  
  // Navigate based on onboarding status
  const nextStep = data?.next_required_step;
  
  if (nextStep && nextStep !== 'COMPLETED') {
    // Navigate to the next required step
    const route = getRouteFromStep(nextStep);
    if (route) {
      router.push(route);
      return;
    }
  }
  
  // Default navigation - check if onboarding is complete
  if (nextStep === 'COMPLETED' || !nextStep) {
    router.push('/');
  } else {
    // Resume onboarding
    router.push('/onboarding/name');
  }
};
