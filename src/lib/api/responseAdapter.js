/**
 * Response Adapter - Normalizes API responses to a consistent format
 * 
 * Based on the implementation guide, most endpoints use:
 * - status
 * - message
 * - data
 * - error_code
 * - next_required_step
 * 
 * This adapter normalizes these to:
 * - success: boolean
 * - message: string
 * - errorCode: string | null
 * - payload: any (the data)
 * - nextStep: string | null (next_required_step)
 */

/**
 * Adapt API response to normalized format
 * @param {Object} response - Axios response object
 * @returns {Object} Normalized response
 */
export const adaptResponse = (response) => {
  const { data } = response;
  
  // Handle case where data is the direct response (not wrapped)
  const responseData = data?.data ?? data;
  
  return {
    success: data?.status === true || data?.status === 'success',
    message: data?.message || 'Success',
    errorCode: data?.error_code || data?.errorCode || null,
    payload: responseData,
    nextStep: data?.next_required_step || data?.nextStep || null,
  };
};

/**
 * Adapt error response to normalized format
 * @param {Object} error - Axios error object
 * @returns {Object} Normalized error response
 */
export const adaptError = (error) => {
  const { response, message } = error;
  
  if (response) {
    const { data, status } = response;
    return {
      success: false,
      message: data?.message || getDefaultErrorMessage(status),
      errorCode: data?.error_code || data?.errorCode || getDefaultErrorCode(status),
      payload: data?.data || null,
      nextStep: data?.next_required_step || data?.nextStep || null,
      status,
    };
  }
  
  // Network error or other non-response errors
  return {
    success: false,
    message: message || 'Network error. Please check your connection.',
    errorCode: 'NETWORK_ERROR',
    payload: null,
    nextStep: null,
    status: 0,
  };
};

/**
 * Get default error message based on HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} Default error message
 */
const getDefaultErrorMessage = (status) => {
  const messages = {
    400: 'Bad request. Please check your input.',
    401: 'Unauthorized. Please login again.',
    403: 'Forbidden. You do not have permission.',
    404: 'Resource not found.',
    409: 'Conflict. The resource already exists.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  };
  
  return messages[status] || 'An error occurred. Please try again.';
};

/**
 * Get default error code based on HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} Default error code
 */
const getDefaultErrorCode = (status) => {
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };
  
  return codes[status] || 'UNKNOWN_ERROR';
};

/**
 * Create a promise wrapper that returns normalized response
 * @param {Promise} apiCall - The API call promise
 * @returns {Promise} Promise that resolves to normalized response
 */
export const normalizeResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return adaptResponse(response);
  } catch (error) {
    throw adaptError(error);
  }
};

/**
 * Check if response indicates onboarding is complete
 * @param {Object} normalizedResponse - Normalized response object
 * @returns {boolean} True if onboarding is complete
 */
export const isOnboardingComplete = (normalizedResponse) => {
  return normalizedResponse.nextStep === 'DONE' || 
         normalizedResponse.nextStep === null ||
         normalizedResponse.payload?.onboarding_complete === true;
};

/**
 * Extract next required step from response
 * @param {Object} normalizedResponse - Normalized response object
 * @returns {string|null} Next required step
 */
export const getNextStep = (normalizedResponse) => {
  return normalizedResponse.nextStep || normalizedResponse.payload?.next_required_step || null;
};

export default {
  adaptResponse,
  adaptError,
  normalizeResponse,
  isOnboardingComplete,
  getNextStep,
};
