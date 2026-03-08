/**
 * Navigation utilities for handling onboarding state machine
 * Maps next_required_step to routes and handles navigation flow
 */

import { userService } from '@/services/user';
import { getOnboardingRedirect } from '@/lib/onboarding/stateMachine';

// Step to route mapping - maps backend next_required_step values to frontend routes
export const stepRouteMap = {
  // Auth steps - mapping backend state names to frontend routes
  'INIT': '/onboarding/name',
  'PHONE_VERIFIED': '/onboarding/name',
  'EMAIL_VERIFICATION': '/login/email',
  'EMAIL_VERIFIED': '/onboarding/name',
  'EMAIL_OTP': '/login/email',
  'PHONE_OTP': '/login/phone',
  'PHONE_VERIFICATION': '/login/phone',
  'EMAIL_PASSWORD_SIGNUP': '/login',
  'SOCIAL_LOGIN': '/login',
  'AUTH_COMPLETE': '/login',
  
  // Basic account steps
  'NAME_CAPTURE': '/onboarding/name',
  'NAME': '/onboarding/name',
  'BASIC_ACCOUNT': '/onboarding/name',
  'BASIC_ACCOUNT_CREATED': '/onboarding/name',
  
  // Onboarding steps - using backend state names
  'GENDER_CAPTURED': '/onboarding/gender',
  'GENDER': '/onboarding/gender',
  'DOB_CAPTURED': '/onboarding/dob',
  'DOB': '/onboarding/dob',
  'PARENT_CONSENT_PENDING': '/onboarding/parent-consent',
  'PARENT_CONSENT_APPROVED': '/onboarding/parent-consent',
  'PARENT_CONSENT': '/onboarding/parent-consent',
  'LOCATION_CAPTURED': '/onboarding/location',
  'LOCATION': '/onboarding/location',
  'PROFILE_PHOTO_CAPTURED': '/onboarding/photo',
  'PROFILE_PHOTO': '/onboarding/photo',
  'ACTIVITY_INTENT_CAPTURED': '/onboarding/activity',
  'ACTIVITY_INTENT': '/onboarding/activity',
  'PROFILE_DETAILS_CAPTURED': '/onboarding/profile-details',
  'PROFILE_DETAILS': '/onboarding/profile-details',
  
  // New mappings for kyc flow (lowercase values from backend)
  'kyc': '/onboarding/kyc',
  'KYC_INFO': '/onboarding/kyc',
  'KYC_DETAILS': '/onboarding/kyc',
  'AADHAAR_VERIFIED': '/onboarding/kyc',
  'VERIFICATION_PENDING': '/onboarding/kyc',
  
  // KYC liveness
  'FACE_LIVENESS_PASSED': '/onboarding/kyc/liveness',
  'LIVENESS_VERIFIED': '/onboarding/kyc/liveness',
  
  // KYC completed
  'KYC_COMPLETED': '/onboarding/physical',
  
  // Physical profile steps
  'PHYSICAL_PROFILE_CONSENT': '/onboarding/physical',
  'PHYSICAL_PROFILE_COMPLETED': '/onboarding/physical',
  'PHYSICAL': '/onboarding/physical',
  
  // Questionnaire steps
  'QUESTIONNAIRE_STARTED': '/onboarding/questionnaire',
  'QUESTIONNAIRE_COMPLETED': '/onboarding/experience',
  'QUESTIONNAIRE': '/onboarding/questionnaire',
  'QUESTIONNAIRE_CATEGORY': '/onboarding/questionnaire',
  'QUESTIONNAIRE_COMPLETE': '/onboarding/experience',
  
  // Experience steps
  'EXPERIENCE': '/onboarding/experience',
  'EXPERIENCE_STARTED': '/onboarding/experience',
  'EXPERIENCE_COMPLETED': '/home',
  'EXPERIENCE_COMPLETE': '/home',
  
  // Extended profile
  'EXTENDED_PROFILE_INTRO': '/home',
  'EXTENDED_PROFILE_PENDING': '/home',
  'EXTENDED_PROFILE_COMPLETED': '/home',
  
  // Final state - all completed states should go to /home
  'COMPLETED': '/home',
  'ACTIVE': '/home',
  'ACTIVE_USER': '/home',
  'HOME': '/home',
  'DONE': '/home',
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
  // Handle null, undefined, non-string values, or empty strings/objects
  if (!step || typeof step !== 'string' || step.trim() === '' || step === '[object Object]') {
    console.warn('getRouteFromStep: Invalid step value:', step);
    // Default to gender page for invalid/empty steps (new user flow)
    return '/onboarding/gender';
  }
  
  const route = stepRouteMap[step];
  if (!route) {
    console.warn('getRouteFromStep: No route found for step:', step);
    // Default to gender for unknown steps (new user flow)
    return '/onboarding/gender';
  }
  return route;
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
    '/onboarding/photo',
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
  const onboardingState = status?.onboarding_state;
  
  // Try next_required_step first
  if (nextStep && typeof nextStep === 'string') {
    const route = getRouteFromStep(nextStep);
    if (route) {
      router.push(route);
      return true;
    }
  }
  
  // Fallback to state-based redirect if nextStep is invalid
  if (onboardingState) {
    const route = getOnboardingRedirect(onboardingState);
    if (route && route !== '/login') {
      console.log('Falling back to state-based redirect:', onboardingState, '->', route);
      router.push(route);
      return true;
    }
  }
  
  // Default to home
  router.push('/onboarding/home');
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
      sessionStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
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

