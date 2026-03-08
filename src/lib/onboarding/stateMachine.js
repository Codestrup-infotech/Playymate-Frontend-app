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
  EXPERIENCE_STARTED: 'EXPERIENCE_STARTED',
  EXPERIENCE_COMPLETED: 'EXPERIENCE_COMPLETED',
  EXTENDED_PROFILE_INTRO: 'EXTENDED_PROFILE_INTRO',
  EXTENDED_PROFILE_PENDING: 'EXTENDED_PROFILE_PENDING',
  EXTENDED_PROFILE_COMPLETED: 'EXTENDED_PROFILE_COMPLETED',
  COMPLETED: 'COMPLETED',
  ACTIVE_USER: 'ACTIVE_USER',
};

// State to Screen Mapping - Frontend routes based on backend state
export const STATE_TO_SCREEN = {
  'INIT': '/onboarding/name',
  'PHONE_VERIFIED': '/onboarding/name',
  'EMAIL_VERIFICATION': '/login/email',
  'EMAIL_VERIFIED': '/onboarding/name',
  'BASIC_ACCOUNT_CREATED': '/onboarding/name',
  'GENDER_CAPTURED': '/onboarding/gender',
  'DOB_CAPTURED': '/onboarding/dob',
  'PARENT_CONSENT_PENDING': '/onboarding/parent-consent',
  'PARENT_CONSENT_APPROVED': '/onboarding/parent-consent',
  'LOCATION_CAPTURED': '/onboarding/location',
  'PROFILE_PHOTO_CAPTURED': '/onboarding/photo',
  'ACTIVITY_INTENT_CAPTURED': '/onboarding/activity',
  'PROFILE_DETAILS_CAPTURED': '/onboarding/profile-details',
  'AADHAAR_VERIFIED': '/onboarding/kyc',
  'VERIFICATION_PENDING': '/onboarding/kyc',
  'FACE_LIVENESS_PASSED': '/onboarding/kyc/liveness',
  'KYC_COMPLETED': '/onboarding/physical',
  'PHYSICAL_PROFILE_CONSENT': '/onboarding/physical',
  'PHYSICAL_PROFILE_COMPLETED': '/onboarding/questionnaire',
  'QUESTIONNAIRE_STARTED': '/onboarding/questionnaire',
  'QUESTIONNAIRE_COMPLETED': '/onboarding/experience',
  'EXPERIENCE': '/onboarding/experience',
  'EXPERIENCE_STARTED': '/onboarding/experience',
  'EXPERIENCE_COMPLETED': '/home',
  'EXTENDED_PROFILE_INTRO': '/home',
  'EXTENDED_PROFILE_PENDING': '/home',
  'EXTENDED_PROFILE_COMPLETED': '/home',
  'COMPLETED': '/home',
  'ACTIVE_USER': '/home',
  'HOME': '/home',
  'DONE': '/home',
  'ACTIVE': '/home',
  
  // Lowercase variants
  'kyc': '/onboarding/kyc',
  'KYC_INFO': '/onboarding/kyc',
  'KYC_DETAILS': '/onboarding/kyc',
  'profile-details': '/onboarding/profile-details',
  'PROFILE_DETAILS': '/onboarding/profile-details',
  'activity-intent': '/onboarding/activity',
  'ACTIVITY_INTENT': '/onboarding/activity',
  'profile-photo': '/onboarding/photo',
  'PROFILE_PHOTO': '/onboarding/photo',
  'parent-consent': '/onboarding/parent-consent',
  'PARENT_CONSENT': '/onboarding/parent-consent',
  'dob': '/onboarding/dob',
  'DOB': '/onboarding/dob',
  'gender': '/onboarding/gender',
  'GENDER': '/onboarding/gender',
  'name': '/onboarding/name',
  'NAME': '/onboarding/name',
  'NAME_CAPTURE': '/onboarding/name',
  'BASIC_ACCOUNT': '/onboarding/name',
  'email': '/login/email',
  'EMAIL_VERIFICATION': '/login/email',
  'EMAIL_OTP': '/login/email',
  'phone': '/login/phone',
  'PHONE_VERIFICATION': '/login/phone',
  'PHONE_OTP': '/login/phone',
};

// Next required step to screen mapping
export const NEXT_STEP_TO_SCREEN = {
  'INIT': '/onboarding/name',
  'PHONE_VERIFICATION': '/login/phone',
  'PHONE_OTP': '/login/phone',
  'EMAIL_VERIFICATION': '/login/email',
  'EMAIL_OTP': '/login/email',
  'NAME_CAPTURE': '/onboarding/name',
  'NAME_CAPTURED': '/onboarding/name',
  'NAME': '/onboarding/name',
  'BASIC_ACCOUNT': '/onboarding/name',
  'BASIC_ACCOUNT_CREATED': '/onboarding/name',
  'GENDER': '/onboarding/gender',
  'GENDER_CAPTURED': '/onboarding/gender',
  'DOB': '/onboarding/dob',
  'DOB_CAPTURED': '/onboarding/dob',
  'PARENT_CONSENT': '/onboarding/parent-consent',
  'PARENT_CONSENT_PENDING': '/onboarding/parent-consent',
  'PARENT_CONSENT_APPROVED': '/onboarding/parent-consent',
  'LOCATION': '/onboarding/location',
  'LOCATION_CAPTURED': '/onboarding/location',
  'PROFILE_PHOTO': '/onboarding/photo',
  'PROFILE_PHOTO_CAPTURED': '/onboarding/photo',
  'ACTIVITY_INTENT': '/onboarding/activity',
  'ACTIVITY_INTENT_CAPTURED': '/onboarding/activity',
  'PROFILE_DETAILS': '/onboarding/profile-details',
  'PROFILE_DETAILS_CAPTURED': '/onboarding/profile-details',
  'KYC_INFO': '/onboarding/kyc',
  'KYC_DETAILS': '/onboarding/kyc',
  'AADHAAR_VERIFICATION': '/onboarding/kyc',
  'AADHAAR_VERIFIED': '/onboarding/kyc',
  'VERIFICATION_PENDING': '/onboarding/kyc',
  'FACE_LIVENESS': '/onboarding/kyc/liveness',
  'FACE_LIVENESS_PASSED': '/onboarding/kyc/liveness',
  'LIVENESS_VERIFIED': '/onboarding/kyc/liveness',
  'KYC_COMPLETED': '/onboarding/physical',
  'PHYSICAL_PROFILE': '/onboarding/physical',
  'PHYSICAL_PROFILE_CONSENT': '/onboarding/physical',
  'PHYSICAL_PROFILE_COMPLETED': '/onboarding/questionnaire',
  'QUESTIONNAIRE': '/onboarding/questionnaire',
  'QUESTIONNAIRE_STARTED': '/onboarding/questionnaire',
  'QUESTIONNAIRE_COMPLETED': '/onboarding/experience',
  'QUESTIONNAIRE_COMPLETE': '/onboarding/experience',
  'EXPERIENCE': '/onboarding/experience',
  'EXPERIENCE_STARTED': '/onboarding/experience',
  'EXPERIENCE_COMPLETED': '/home',
  'EXPERIENCE_COMPLETE': '/home',
  'EXTENDED_PROFILE': '/home',
  'EXTENDED_PROFILE_PENDING': '/home',
  'EXTENDED_PROFILE_COMPLETED': '/home',
  'HOME': '/home',
  'COMPLETED': '/home',
  'ACTIVE_USER': '/home',
  'ACTIVE': '/home',
  'DONE': '/home',
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
