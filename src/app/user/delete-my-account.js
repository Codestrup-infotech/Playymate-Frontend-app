import api from '@/services/api';

/**
 * Account Management API Functions
 * Based on PLAYYMATE_ACCOUNT_MANAGEMENT_API.postman_collection.json
 */

/**
 * Get Account Status
 * GET /api/v1/users/me/account-status
 * Returns: account_status (active/deactivated/deleted), is_deactivated, deactivated_at, deactivation_reason
 */
export const getAccountStatus = async () => {
  try {
    console.log('[DeleteAccount] Fetching account status from API...');
    const response = await api.get('/users/me/account-status');
    console.log('[DeleteAccount] Account status response:', response.data);
    console.log('[DeleteAccount] Account status data:', response.data.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('[DeleteAccount] Error fetching account status:', error);
    console.log('[DeleteAccount] Error response:', error.response?.data);
    console.log('[DeleteAccount] Error status:', error.response?.status);
    const status = error.response?.status;
    const errorCode = error.response?.data?.error_code;
    
    if (status === 403 || errorCode === 'FORBIDDEN') {
      return {
        success: false,
        error: 'You do not have permission to access this feature. Please ensure you are logged in and have the required permissions.',
        code: 'FORBIDDEN',
        requiresAuth: true
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch account status',
      code: error.response?.data?.code
    };
  }
};

/**
 * Deactivate Account (Temporary)
 * POST /api/v1/users/me/deactivate
 * Body: { "reason": "Taking a break from the platform" }
 * Error Codes: ALREADY_DEACTIVATED, ACCOUNT_NOT_ACTIVE
 */
export const deactivateAccount = async (reason) => {
  try {
    console.log('[DeleteAccount] Deactivating account with reason:', reason);
    const response = await api.post('/users/me/deactivate', { reason });
    console.log('[DeleteAccount] Deactivate response:', response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('[DeleteAccount] Error deactivating account:', error);
    console.log('[DeleteAccount] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to deactivate account',
      code: error.response?.data?.code
    };
  }
};

/**
 * Reactivate Account
 * POST /api/v1/users/me/reactivate
 * Used to reactivate a deactivated account
 */
export const reactivateAccount = async () => {
  try {
    console.log('[DeleteAccount] Reactivating account...');
    const response = await api.post('/users/me/reactivate');
    console.log('[DeleteAccount] Reactivate response:', response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('[DeleteAccount] Error reactivating account:', error);
    console.log('[DeleteAccount] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reactivate account',
      code: error.response?.data?.code
    };
  }
};

/**
 * Request Permanent Deletion
 * POST /api/v1/users/me/delete-request
 * Body: { "reason": "No longer need the platform" }
 * Requirements: Reason must be at least 5 characters
 * Error Codes: ALREADY_DELETED, DELETION_ALREADY_REQUESTED, REASON_REQUIRED
 * Returns: deletion_requested_at, deletion_scheduled_at, grace_period_days
 */
export const requestAccountDeletion = async (reason) => {
  try {
    console.log('[DeleteAccount] Requesting account deletion with reason:', reason);
    const response = await api.post('/users/me/delete-request', { reason });
    console.log('[DeleteAccount] Delete request response:', response.data);
    console.log('[DeleteAccount] Deletion data:', response.data.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('[DeleteAccount] Error requesting account deletion:', error);
    console.log('[DeleteAccount] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to request account deletion',
      code: error.response?.data?.code
    };
  }
};

/**
 * Cancel Deletion Request
 * DELETE /api/v1/users/me/delete-request
 * Cancels a pending deletion request before the grace period ends
 */
export const cancelDeletionRequest = async () => {
  try {
    console.log('[DeleteAccount] Cancelling deletion request...');
    const response = await api.delete('/users/me/delete-request');
    console.log('[DeleteAccount] Cancel deletion response:', response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('[DeleteAccount] Error cancelling deletion request:', error);
    console.log('[DeleteAccount] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to cancel deletion request',
      code: error.response?.data?.code
    };
  }
};

// Error code constants for handling
export const ACCOUNT_ERROR_CODES = {
  ALREADY_DEACTIVATED: 'ALREADY_DEACTIVATED',
  ACCOUNT_NOT_ACTIVE: 'ACCOUNT_NOT_ACTIVE',
  ALREADY_DELETED: 'ALREADY_DELETED',
  DELETION_ALREADY_REQUESTED: 'DELETION_ALREADY_REQUESTED',
  REASON_REQUIRED: 'REASON_REQUIRED'
};