/**
 * Onboarding State Machine - Maps states to routes
 * Based on state_onboarding.md
 */

// All onboarding states in order
export const ONBOARDING_STATES = {
  INIT: 'INIT',
  PHONE_VERIFIED: 'PHONE_VERIFIED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  BASIC_ACCOUNT_CREATED: 'BASIC_ACCOUNT_CREATED',
  GENDER_CAPTURED: 'GENDER_CAPTURED',
  DOB_CAPTURED: 'DOB_CAPTURED',
  PARENT_CONSENT_PENDING: 'PARENT_CONSENT_PENDING',
  PARENT_CONSENT_APPROVED: 'PARENT_CONSENT_APPROVED',
  LOCATION_CAPTURED: 'LOCATION_CAPTURED',
  PROFILE_PHOTO_CAPTURED: 'PROFILE_PHOTO_CAPTURED',
  ACTIVITY_INTENT_CAPTURED: 'ACTIVITY_INTENT_CAPTURED',
  PROFILE_DETAILS_CAPTURED: 'PROFILE_DETAILS_CAPTURED',
  AADHAAR_VERIFIED: 'AADHAAR_VERIFIED',
  FACE_LIVENESS_PASSED: 'FACE_LIVENESS_PASSED',
  KYC_COMPLETED: 'KYC_COMPLETED',
  PHYSICAL_PROFILE_CONSENT: 'PHYSICAL_PROFILE_CONSENT',
  PHYSICAL_PROFILE_COMPLETED: 'PHYSICAL_PROFILE_COMPLETED',
  QUESTIONNAIRE_STARTED: 'QUESTIONNAIRE_STARTED',
  QUESTIONNAIRE_COMPLETED: 'QUESTIONNAIRE_COMPLETED',
  EXTENDED_PROFILE_INTRO: 'EXTENDED_PROFILE_INTRO',
  EXTENDED_PROFILE_PENDING: 'EXTENDED_PROFILE_PENDING',
  EXTENDED_PROFILE_COMPLETED: 'EXTENDED_PROFILE_COMPLETED',
  COMPLETED: 'COMPLETED',
  ACTIVE_USER: 'ACTIVE_USER',
};

// State to Screen Mapping - Frontend routes based on backend state
export const STATE_TO_SCREEN = {
  'INIT': '/login',
  'PHONE_VERIFIED': '/login', // Email verification step
  'EMAIL_VERIFIED': '/login', // Name capture step
  'BASIC_ACCOUNT_CREATED': '/onboarding/gender',
  'GENDER_CAPTURED': '/onboarding/dob',
  'DOB_CAPTURED': '/onboarding/location',
  'PARENT_CONSENT_PENDING': '/onboarding/parent-consent',
  'PARENT_CONSENT_APPROVED': '/onboarding/location',
  'LOCATION_CAPTURED': '/onboarding/photo',
  'PROFILE_PHOTO_CAPTURED': '/onboarding/activity',
  'ACTIVITY_INTENT_CAPTURED': '/onboarding/details',
  'PROFILE_DETAILS_CAPTURED': '/onboarding/kyc',
  'AADHAAR_VERIFIED': '/verification/liveness',
  'FACE_LIVENESS_PASSED': '/verification/complete',
  'VERIFICATION_PENDING': '/onboarding/physical',   
  'KYC_COMPLETED': '/physical-activity',
  'PHYSICAL_PROFILE_CONSENT': '/physical-activity',
  'PHYSICAL_PROFILE_COMPLETED': '/physical-questions',
  'QUESTIONNAIRE_STARTED': '/physical-questions',
  'QUESTIONNAIRE_COMPLETED': '/verification/complete',
  'EXTENDED_PROFILE_INTRO': '/onboarding/extended-profile',
  'EXTENDED_PROFILE_PENDING': '/onboarding/extended-profile',
  'EXTENDED_PROFILE_COMPLETED': '/',
  'COMPLETED': '/',
  'ACTIVE_USER': '/',
  'DONE': '/'
};

// Next required step to screen mapping
export const NEXT_STEP_TO_SCREEN = {
  'INIT': '/login',
  'PHONE_VERIFICATION': '/login',
  'EMAIL_VERIFICATION': '/login', // Stay on login page, show email step
  'NAME_CAPTURE': '/login', // Stay on login page, show name step
  'NAME_CAPTURED': '/onboarding/gender',
  'GENDER': '/onboarding/gender',
  'GENDER_CAPTURED': '/onboarding/dob',
  'DOB': '/onboarding/dob',
  'DOB_CAPTURED': '/onboarding/location',
  'PARENT_CONSENT': '/onboarding/parent-consent',
  'PARENT_CONSENT_APPROVED': '/onboarding/location',
  'LOCATION': '/onboarding/location',
  'LOCATION_CAPTURED': '/onboarding/photo',
  'PROFILE_PHOTO': '/onboarding/photo',
  'PROFILE_PHOTO_CAPTURED': '/onboarding/activity',
  'ACTIVITY_INTENT': '/onboarding/activity',
  'ACTIVITY_INTENT_CAPTURED': '/onboarding/details',
  'PROFILE_DETAILS': '/onboarding/details',
  'PROFILE_DETAILS_CAPTURED': '/onboarding/kyc',
  'AADHAAR_VERIFICATION': '/onboarding/kyc',
  'AADHAAR_VERIFIED': '/verification/liveness',
  'FACE_LIVENESS': '/verification/liveness',
  'FACE_LIVENESS_PASSED': '/verification/complete',
  'KYC_COMPLETED': '/physical-activity',
  'PHYSICAL_PROFILE': '/physical-activity',
  'PHYSICAL_PROFILE_COMPLETED': '/physical-questions',
  'QUESTIONNAIRE': '/physical-questions',
  'QUESTIONNAIRE_COMPLETED': '/',
  'HOME': '/',
  'COMPLETED': '/',
  'ACTIVE_USER': '/',
  'DONE': '/'
};

/**
 * Get redirect path based on onboarding state
 * @param {string} onboardingState - Current onboarding state
 * @returns {string} - Route path
 */
export function getOnboardingRedirect(onboardingState) {
  return STATE_TO_SCREEN[onboardingState] || '/login';
}

/**
 * Get redirect path based on next required step
 * @param {string} nextRequiredStep - Next step required
 * @returns {string} - Route path
 */
export function getNextStepRedirect(nextRequiredStep) {
  return NEXT_STEP_TO_SCREEN[nextRequiredStep] || '/login';
}

/**
 * Smart redirect - considers both state and next step
 * @param {string} onboardingState - Current onboarding state
 * @param {string} nextRequiredStep - Next step required
 * @param {boolean} emailVerified - Whether email is verified
 * @returns {string} - Route path
 */
export function getSmartRedirect(onboardingState, nextRequiredStep, emailVerified = false) {
  // If user has progress beyond phone/email and email is verified, redirect to remaining step
  const advancedStates = [
    'BASIC_ACCOUNT_CREATED', 'GENDER_CAPTURED', 'DOB_CAPTURED',
    'LOCATION_CAPTURED', 'PROFILE_PHOTO_CAPTURED', 'ACTIVITY_INTENT_CAPTURED',
    'PROFILE_DETAILS_CAPTURED', 'AADHAAR_VERIFIED', 'FACE_LIVENESS_PASSED',
    'KYC_COMPLETED', 'PHYSICAL_PROFILE_COMPLETED', 'QUESTIONNAIRE_COMPLETED'
  ];
  
  if (advancedStates.includes(onboardingState) && emailVerified) {
    return getOnboardingRedirect(onboardingState);
  }
  
  // Otherwise use next required step
  if (nextRequiredStep) {
    return getNextStepRedirect(nextRequiredStep);
  }
  
  // Default to state-based redirect
  return getOnboardingRedirect(onboardingState);
}

/**
 * Store onboarding resume data
 * @param {object} data - Resume data from backend
 */
export function storeOnboardingResume(data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('onboarding_resume_data', JSON.stringify(data));
  }
}

/**
 * Get stored onboarding resume data
 * @returns {object|null} - Resume data or null
 */
export function getOnboardingResume() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('onboarding_resume_data');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * Store current onboarding state
 * @param {object} data - State data
 */
export function storeOnboardingState(data) {
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
}

/**
 * Get stored onboarding state
 * @returns {string|null} - Onboarding state or null
 */
export function getOnboardingState() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('onboarding_state');
  }
  return null;
}

export default {
  ONBOARDING_STATES,
  STATE_TO_SCREEN,
  NEXT_STEP_TO_SCREEN,
  getOnboardingRedirect,
  getNextStepRedirect,
  getSmartRedirect,
  storeOnboardingResume,
  getOnboardingResume,
  storeOnboardingState,
  getOnboardingState
};
