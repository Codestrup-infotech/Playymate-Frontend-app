/**
 * API Client utilities
 * Provides authentication token management and common API utilities
 */

// Get authentication token from localStorage
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('playymate_access_token');
};

// Get refresh token
export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('playymate_refresh_token');
};

// Set authentication tokens
export const setAuthTokens = (accessToken, refreshToken = null) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('playymate_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('playymate_refresh_token', refreshToken);
  }
};

// Clear authentication tokens
export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('playymate_access_token');
  localStorage.removeItem('playymate_refresh_token');
  localStorage.removeItem('playymate_auth_flow_id');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Get auth flow ID
export const getAuthFlowId = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('playymate_auth_flow_id');
};

// Set auth flow ID
export const setAuthFlowId = (flowId) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('playymate_auth_flow_id', flowId);
};

// Clear auth flow ID
export const clearAuthFlowId = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('playymate_auth_flow_id');
};

export default {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
  getAuthFlowId,
  setAuthFlowId,
  clearAuthFlowId,
};
