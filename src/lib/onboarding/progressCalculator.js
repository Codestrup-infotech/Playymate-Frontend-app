/**
 * Onboarding Progress Calculator
 * Calculates the onboarding completion percentage based on user state
 */

// Complete list of onboarding states in order
export const ONBOARDING_PROGRESS_STATES = [
  { state: 'INIT', percentage: 0, label: 'Get Started' },
  { state: 'PHONE_VERIFIED', percentage: 5, label: 'Phone Verified' },
  { state: 'EMAIL_VERIFIED', percentage: 10, label: 'Email Verified' },
  { state: 'BASIC_ACCOUNT_CREATED', percentage: 15, label: 'Account Created' },
  { state: 'GENDER_CAPTURED', percentage: 20, label: 'Gender Selected' },
  { state: 'DOB_CAPTURED', percentage: 30, label: 'Date of Birth' },
  { state: 'PARENT_CONSENT_PENDING', percentage: 25, label: 'Parent Consent Required' },
  { state: 'PARENT_CONSENT_APPROVED', percentage: 35, label: 'Parent Consent Given' },
  { state: 'LOCATION_CAPTURED', percentage: 40, label: 'Location Set' },
  { state: 'PROFILE_PHOTO_CAPTURED', percentage: 50, label: 'Profile Photo Added' },
  { state: 'ACTIVITY_INTENT_CAPTURED', percentage: 55, label: 'Activity Selected' },
  { state: 'PROFILE_DETAILS_CAPTURED', percentage: 60, label: 'Profile Details Added' },
  { state: 'AADHAAR_VERIFIED', percentage: 70, label: 'Aadhaar Verified' },
  { state: 'FACE_LIVENESS_PASSED', percentage: 75, label: 'Face Verification Passed' },
  { state: 'VERIFICATION_PENDING', percentage: 65, label: 'Verification Pending' },
  { state: 'KYC_COMPLETED', percentage: 80, label: 'KYC Completed' },
  { state: 'PHYSICAL_PROFILE_CONSENT', percentage: 82, label: 'Physical Profile Consent' },
  { state: 'PHYSICAL_PROFILE_COMPLETED', percentage: 85, label: 'Physical Profile Completed' },
  { state: 'QUESTIONNAIRE_STARTED', percentage: 87, label: 'Questionnaire Started' },
  { state: 'QUESTIONNAIRE_COMPLETED', percentage: 90, label: 'Questionnaire Completed' },
  { state: 'EXTENDED_PROFILE_INTRO', percentage: 92, label: 'Extended Profile' },
  { state: 'EXTENDED_PROFILE_PENDING', percentage: 95, label: 'Extended Profile' },
  { state: 'EXTENDED_PROFILE_COMPLETED', percentage: 100, label: 'Profile Complete' },
  { state: 'COMPLETED', percentage: 100, label: 'Completed' },
  { state: 'ACTIVE_USER', percentage: 100, label: 'Active User' },
];

/**
 * Calculate progress percentage from onboarding state
 * @param {string} onboardingState - Current onboarding state
 * @returns {number} - Progress percentage (0-100)
 */
export function calculateProgressPercentage(onboardingState) {
  if (!onboardingState) return 0;
  
  const stateEntry = ONBOARDING_PROGRESS_STATES.find(
    (entry) => entry.state === onboardingState
  );
  
  return stateEntry ? stateEntry.percentage : 0;
}

/**
 * Get progress label for current state
 * @param {string} onboardingState - Current onboarding state
 * @returns {string} - Progress label
 */
export function getProgressLabel(onboardingState) {
  if (!onboardingState) return 'Get Started';
  
  const stateEntry = ONBOARDING_PROGRESS_STATES.find(
    (entry) => entry.state === onboardingState
  );
  
  return stateEntry ? stateEntry.label : 'Onboarding';
}

/**
 * Get all remaining steps from current state
 * @param {string} onboardingState - Current onboarding state
 * @returns {Array} - Array of remaining steps
 */
export function getRemainingSteps(onboardingState) {
  if (!onboardingState) return ONBOARDING_PROGRESS_STATES;
  
  const currentIndex = ONBOARDING_PROGRESS_STATES.findIndex(
    (entry) => entry.state === onboardingState
  );
  
  if (currentIndex === -1 || currentIndex >= ONBOARDING_PROGRESS_STATES.length - 1) {
    return [];
  }
  
  return ONBOARDING_PROGRESS_STATES.slice(currentIndex + 1);
}

/**
 * Check if onboarding is complete
 * @param {string} onboardingState - Current onboarding state
 * @returns {boolean} - True if onboarding is complete
 */
export function isOnboardingComplete(onboardingState) {
  const completeStates = ['COMPLETED', 'ACTIVE_USER', 'EXTENDED_PROFILE_COMPLETED'];
  return completeStates.includes(onboardingState);
}

/**
 * Get detailed progress information
 * @param {string} onboardingState - Current onboarding state
 * @returns {Object} - Progress details object
 */
export function getProgressDetails(onboardingState) {
  const percentage = calculateProgressPercentage(onboardingState);
  const label = getProgressLabel(onboardingState);
  const complete = isOnboardingComplete(onboardingState);
  const remainingSteps = getRemainingSteps(onboardingState);
  
  return {
    percentage,
    label,
    complete,
    remainingSteps,
    totalSteps: ONBOARDING_PROGRESS_STATES.length,
    completedSteps: Math.floor((percentage / 100) * ONBOARDING_PROGRESS_STATES.length),
  };
}

/**
 * Format percentage for display
 * @param {number} percentage - Progress percentage
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(percentage) {
  return `${Math.round(percentage)}%`;
}

/**
 * Get next step information
 * @param {string} onboardingState - Current onboarding state
 * @returns {Object|null} - Next step object or null if complete
 */
export function getNextStep(onboardingState) {
  const remainingSteps = getRemainingSteps(onboardingState);
  return remainingSteps.length > 0 ? remainingSteps[0] : null;
}

export default {
  ONBOARDING_PROGRESS_STATES,
  calculateProgressPercentage,
  getProgressLabel,
  getRemainingSteps,
  isOnboardingComplete,
  getProgressDetails,
  formatPercentage,
  getNextStep,
};
