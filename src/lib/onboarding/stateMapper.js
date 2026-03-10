/**
 * Onboarding State Mapper
 * Maps server onboarding states to frontend step numbers
 * and provides utilities for state management
 */

// Onboarding state to step number mapping
export const STATE_TO_STEP = {
  // Initial states
  'BASIC_ACCOUNT_CREATED': 1,      // Gender
  'PHONE_VERIFIED': 1,            // Start after phone verification

  // Basic profile states
  'GENDER_CAPTURED': 2,            // Age/DOB
  'DOB_CAPTURED': 4,               // Location (adults)
  'PARENT_CONSENT_PENDING': 3,     // Parent Consent (minors)
  'PARENT_CONSENT_APPROVED': 4,    // Location (minors)
  'LOCATION_CAPTURED': 5,          // Photo
  'PROFILE_PHOTO_CAPTURED': 6,     // Status/Activity Intent

  // Additional states for later phases
  'ACTIVITY_INTENT_CAPTURED': 7,   // Profile Details
  'PROFILE_DETAILS_CAPTURED': 8,   // KYC
  'AADHAAR_VERIFIED': 9,           // Face Liveness
  'FACE_LIVENESS_PASSED': 10,      // Complete
  'KYC_COMPLETED': 11,             // Physical Profile Consent
  'PHYSICAL_PROFILE_CONSENT': 12,  // Questionnaire
  'QUESTIONNAIRE_COMPLETED': 13,   // Complete onboarding
  'COMPLETED': null,               // Redirect to home
};

// Reverse mapping: step number to expected onboarding state
export const STEP_TO_STATE = {
  1: 'BASIC_ACCOUNT_CREATED',       // Before gender
  2: 'GENDER_CAPTURED',            // After gender
  3: 'PARENT_CONSENT_PENDING',     // For minors before consent
  4: ['DOB_CAPTURED', 'PARENT_CONSENT_APPROVED'],  // After DOB/consent
  5: 'LOCATION_CAPTURED',          // After location
  6: 'PROFILE_PHOTO_CAPTURED',     // After photo
  7: 'ACTIVITY_INTENT_CAPTURED',   // After activity intent
};

/**
 * Get the frontend step number from server onboarding state
 * @param {string} onboardingState - Server onboarding state
 * @returns {number|null} - Step number or null if completed
 */
export function getStepFromState(onboardingState) {
  if (!onboardingState) {
    return 1; // Default to start
  }
  return STATE_TO_STEP[onboardingState] || 1;
}

/**
 * Get user age category from onboarding state
 * @param {string} onboardingState - Server onboarding state
 * @param {string} ageGroup - Age group from profile (18_plus, 16_17, etc.)
 * @returns {string} - 'adult', 'minor', or 'unknown'
 */
export function getAgeCategory(onboardingState, ageGroup) {
  // If we have explicit age group from profile
  if (ageGroup) {
    if (ageGroup === '18_plus' || ageGroup === 'adult') {
      return 'adult';
    }
    if (ageGroup === '16_17' || ageGroup === 'minor') {
      return 'minor';
    }
  }

  // Infer from onboarding state
  if (onboardingState === 'PARENT_CONSENT_PENDING') {
    return 'minor';
  }

  // If DOB is captured but consent not approved, might be minor
  if (onboardingState === 'DOB_CAPTURED') {
    // Need age_group from profile to determine
    return 'unknown';
  }

  return 'adult';
}

/**
 * Get the correct starting step based on onboarding state and age group
 * @param {string} onboardingState - Server onboarding state
 * @param {string} ageGroup - Age group from profile (optional)
 * @returns {number} - Correct step number
 */
export function getStartingStep(onboardingState, ageGroup) {
  const baseStep = getStepFromState(onboardingState);
  const ageCategory = getAgeCategory(onboardingState, ageGroup);

  // Handle minor flow
  if (onboardingState === 'DOB_CAPTURED' && ageCategory === 'minor') {
    return 3; // Parent consent for minors
  }

  return baseStep;
}

/**
 * Validate if user can proceed to target step
 * @param {string} currentState - Current server onboarding state
 * @param {number} targetStep - Target step number
 * @returns {Object} - { canProceed: boolean, message?: string }
 */
export function canProceedToStep(currentState, targetStep) {
  const currentStep = getStepFromState(currentState);

  if (currentStep === null) {
    return {
      canProceed: false,
      message: 'Onboarding already completed'
    };
  }

  if (targetStep <= currentStep) {
    return { canProceed: true }; // Can go back
  }

  // Can only proceed to next step
  if (targetStep === currentStep + 1) {
    return { canProceed: true };
  }

  return {
    canProceed: false,
    message: `Please complete step ${currentStep} first`
  };
}

/**
 * Get step label for display
 * @param {number} step - Step number
 * @returns {string} - Step label
 */
export function getStepLabel(step) {
  const labels = {
    1: 'Gender',
    2: 'Age / DOB',
    3: 'Parent Consent',
    4: 'Location',
    5: 'Profile Photo',
    6: 'Status / Activity',
    7: 'Profile Details',
    8: 'KYC Verification',
  };
  return labels[step] || `Step ${step}`;
}

export default {
  STATE_TO_STEP,
  STEP_TO_STATE,
  getStepFromState,
  getAgeCategory,
  getStartingStep,
  canProceedToStep,
  getStepLabel,
};
