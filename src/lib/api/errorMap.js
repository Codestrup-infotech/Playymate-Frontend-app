/**
 * Error Code Mapping - Centralized error handling
 * 
 * Based on the implementation guide's error handling strategy:
 * - error_code to user-friendly message
 * - severity level
 * - action hint
 * 
 * Each error maps to:
 * - message: User-friendly error message
 * - severity: 'low' | 'medium' | 'high' | 'critical'
 * - action: Recommended action to take
 */

/**
 * Error code to message, severity, and action mapping
 */
export const errorMap = {
  // ============ AUTH ERRORS ============
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials. Please check your email/phone and password.',
    severity: 'medium',
    action: 'retry',
  },
  ACCOUNT_NOT_FOUND: {
    message: 'Account not found. Please sign up first.',
    severity: 'medium',
    action: 'signup',
  },
  ACCOUNT_EXISTS: {
    message: 'An account with this email/phone already exists.',
    severity: 'medium',
    action: 'login',
  },
  INVALID_OTP: {
    message: 'Invalid OTP. Please enter the correct code.',
    severity: 'low',
    action: 'retry',
  },
  OTP_EXPIRED: {
    message: 'OTP has expired. Please request a new one.',
    severity: 'low',
    action: 'resend',
  },
  OTP_NOT_SENT: {
    message: 'Failed to send OTP. Please try again.',
    severity: 'medium',
    action: 'retry',
  },
  TOO_MANY_ATTEMPTS: {
    message: 'Too many attempts. Please try again later.',
    severity: 'medium',
    action: 'wait',
  },
  ACCOUNT_LOCKED: {
    message: 'Account is locked. Please contact support.',
    severity: 'high',
    action: 'support',
  },
  SOCIAL_LOGIN_FAILED: {
    message: 'Social login failed. Please try again.',
    severity: 'medium',
    action: 'retry',
  },
  INVALID_AUTH_FLOW: {
    message: 'Authentication session expired. Please start again.',
    severity: 'medium',
    action: 'restart',
  },

  // ============ ONBOARDING ERRORS ============
  INVALID_ONBOARDING_SEQUENCE: {
    message: 'We need to resume your onboarding.',
    severity: 'medium',
    action: 'resync',
  },
  PROFILE_INCOMPLETE: {
    message: 'Please complete your profile information.',
    severity: 'medium',
    action: 'complete_profile',
  },
  MINOR_NOT_ALLOWED: {
    message: 'This feature is not available for users under 18.',
    severity: 'high',
    action: 'parent_consent',
  },
  ROLE_NOT_ALLOWED_FOR_MINOR: {
    message: 'This role is not allowed for minors. Please select another.',
    severity: 'high',
    action: 'role_reselection',
  },
  INVALID_ROLE: {
    message: 'Invalid role selected. Please choose a valid option.',
    severity: 'low',
    action: 'retry',
  },
  ROLE_CONFIG_INACTIVE: {
    message: 'This role is currently not available. Please try another.',
    severity: 'medium',
    action: 'role_reselection',
  },
  MISSING_REQUIRED_FIELDS: {
    message: 'Please fill in all required fields.',
    severity: 'low',
    action: 'retry',
  },
  INVALID_ROLE_DETAILS: {
    message: 'Invalid profile details. Please check your input.',
    severity: 'low',
    action: 'retry',
  },

  // ============ PARENT CONSENT ERRORS ============
  PARENT_CONSENT_REQUIRED: {
    message: 'Parent consent is required for this action.',
    severity: 'high',
    action: 'parent_consent',
  },
  PARENT_CONSENT_DENIED: {
    message: 'Parent consent was denied. Please contact your parent/guardian.',
    severity: 'high',
    action: 'parent_consent',
  },
  PARENT_CONSENT_PENDING: {
    message: 'Parent consent is pending approval.',
    severity: 'medium',
    action: 'wait',
  },

  // ============ LOCATION ERRORS ============
  LOCATION_PERMISSION_DENIED: {
    message: 'Location permission denied. Please enable location access.',
    severity: 'medium',
    action: 'manual_location',
  },
  LOCATION_NOT_FOUND: {
    message: 'Location not found. Please try a different address.',
    severity: 'low',
    action: 'retry',
  },
  INVALID_LOCATION: {
    message: 'Invalid location. Please enter a valid address.',
    severity: 'low',
    action: 'retry',
  },

  // ============ PROFILE PHOTO ERRORS ============
  FACE_NOT_DETECTED: {
    message: 'No face detected. Please upload a photo with your face visible.',
    severity: 'low',
    action: 'retry',
  },
  MULTIPLE_FACES: {
    message: 'Multiple faces detected. Please upload a photo with only your face.',
    severity: 'low',
    action: 'retry',
  },
  LOW_FACE_CONFIDENCE: {
    message: 'Could not verify your face. Please upload a clearer photo.',
    severity: 'low',
    action: 'retry',
  },
  IMAGE_TOO_LARGE: {
    message: 'Image is too large. Please upload a smaller file.',
    severity: 'low',
    action: 'retry',
  },
  INVALID_IMAGE_FORMAT: {
    message: 'Invalid image format. Please upload JPG or PNG.',
    severity: 'low',
    action: 'retry',
  },
  UPLOAD_FAILED: {
    message: 'Upload failed. Please try again.',
    severity: 'medium',
    action: 'retry',
  },

  // ============ KYC ERRORS ============
  DIGILOCKER_REQUIRED: {
    message: 'Please complete Aadhaar verification first.',
    severity: 'high',
    action: 'digilocker',
  },
  DIGILOCKER_AUTH_FAILED: {
    message: 'DigiLocker authentication failed. Please try again.',
    severity: 'medium',
    action: 'retry',
  },
  DIGILOCKER_TIMEOUT: {
    message: 'Verification is taking longer than expected. Please try again.',
    severity: 'medium',
    action: 'retry',
  },
  AADHAAR_ALREADY_VERIFIED: {
    message: 'Aadhaar is already verified.',
    severity: 'low',
    action: 'none',
  },
  AADHAAR_NOT_VERIFIED: {
    message: 'Aadhaar verification is required.',
    severity: 'high',
    action: 'digilocker',
  },
  LIVENESS_FAILED: {
    message: 'Liveness verification failed. Please try again with better lighting.',
    severity: 'low',
    action: 'retry',
  },
  LIVENESS_REQUIRED: {
    message: 'Please complete face liveness verification.',
    severity: 'high',
    action: 'liveness',
  },
  MANUAL_REVIEW_REQUIRED: {
    message: 'Your verification is under manual review. Please wait.',
    severity: 'medium',
    action: 'wait',
  },
  KYC_ALREADY_COMPLETE: {
    message: 'KYC is already completed.',
    severity: 'low',
    action: 'none',
  },
  KYC_NOT_COMPLETE: {
    message: 'Please complete all KYC steps.',
    severity: 'high',
    action: 'kyc',
  },

  // ============ NETWORK ERRORS ============
  NETWORK_ERROR: {
    message: 'Network error. Please check your connection.',
    severity: 'medium',
    action: 'retry',
  },
  SERVER_ERROR: {
    message: 'Server error. Please try again later.',
    severity: 'high',
    action: 'retry',
  },
  TIMEOUT_ERROR: {
    message: 'Request timed out. Please try again.',
    severity: 'medium',
    action: 'retry',
  },

  // ============ GENERAL ERRORS ============
  BAD_REQUEST: {
    message: 'Invalid request. Please check your input.',
    severity: 'low',
    action: 'retry',
  },
  UNAUTHORIZED: {
    message: 'Session expired. Please login again.',
    severity: 'high',
    action: 'login',
  },
  FORBIDDEN: {
    message: 'You do not have permission for this action.',
    severity: 'high',
    action: 'none',
  },
  NOT_FOUND: {
    message: 'Resource not found.',
    severity: 'medium',
    action: 'none',
  },
  CONFLICT: {
    message: 'Resource already exists.',
    severity: 'medium',
    action: 'retry',
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Too many requests. Please wait a moment.',
    severity: 'medium',
    action: 'wait',
  },
  UNKNOWN_ERROR: {
    message: 'An unexpected error occurred. Please try again.',
    severity: 'high',
    action: 'retry',
  },
};

/**
 * Get error details by error code
 * @param {string} errorCode - The error code
 * @returns {Object} Error details (message, severity, action)
 */
export const getErrorDetails = (errorCode) => {
  const normalizedCode = errorCode?.toUpperCase();
  return errorMap[normalizedCode] || errorMap.UNKNOWN_ERROR;
};

/**
 * Get user-friendly error message
 * @param {string} errorCode - The error code
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (errorCode) => {
  return getErrorDetails(errorCode).message;
};

/**
 * Get recommended action for error
 * @param {string} errorCode - The error code
 * @returns {string} Recommended action
 */
export const getErrorAction = (errorCode) => {
  return getErrorDetails(errorCode).action;
};

/**
 * Get severity level of error
 * @param {string} errorCode - The error code
 * @returns {string} Severity level
 */
export const getErrorSeverity = (errorCode) => {
  return getErrorDetails(errorCode).severity;
};

/**
 * Determine if error should trigger logout
 * @param {string} errorCode - The error code
 * @returns {boolean} True if should logout
 */
export const shouldLogout = (errorCode) => {
  const logoutCodes = ['UNAUTHORIZED', 'INVALID_AUTH_FLOW', 'ACCOUNT_LOCKED'];
  return logoutCodes.includes(errorCode?.toUpperCase());
};

/**
 * Determine if error should trigger onboarding resync
 * @param {string} errorCode - The error code
 * @returns {boolean} True if should resync
 */
export const shouldResyncOnboarding = (errorCode) => {
  const resyncCodes = ['INVALID_ONBOARDING_SEQUENCE', 'PROFILE_INCOMPLETE'];
  return resyncCodes.includes(errorCode?.toUpperCase());
};

export default {
  errorMap,
  getErrorDetails,
  getErrorMessage,
  getErrorAction,
  getErrorSeverity,
  shouldLogout,
  shouldResyncOnboarding,
};
