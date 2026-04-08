const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import { cleanupFcmToken } from './fcm';

/**
 * Logout user by calling the logout API and clearing all auth tokens
 * @param {string} accessToken - The access token from localStorage
 * @param {string} refreshToken - Optional refresh token from localStorage
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function logoutUser(accessToken, refreshToken = null) {
  try {
    // Call the logout API endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      return { success: true, message: data.message || 'Logged out successfully' };
    } else {
      // Even if API fails, we still want to clear local tokens for security
      console.warn('Logout API returned non-success:', data);
      return { success: true, message: 'Logged out locally' };
    }
  } catch (error) {
    // Network error or other issues - still clear tokens for security
    console.error('Logout API error:', error);
    return { success: true, message: 'Logged out locally (API error)' };
  }
}

/**
 * Clear all authentication tokens from localStorage and sessionStorage
 */
export function clearAuthTokens() {
  // Clear from localStorage
  const localStorageKeys = [
    'access_token',
    'refresh_token',
    'user_session',
    'user',
    'token',
    'auth_token',
    // Also clear camelCase keys used by auth service
    'accessToken',
    'refreshToken',
    'userData',
  ];
  
  localStorageKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Clear from sessionStorage
  const sessionStorageKeys = [
    'access_token',
    'refresh_token',
    'user_session',
    'user',
    'token',
    // Also clear camelCase keys
    'accessToken',
    'refreshToken',
    'userData',
  ];
  
  sessionStorageKeys.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Perform complete logout: call API, clear tokens, and redirect to login
 * Uses window.location for full page redirect to clear browser history
 * @returns {Promise<void>}
 */
export async function performLogout() {
  // Get tokens from localStorage (check both snake_case and camelCase keys)
  const accessToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');

  // Call logout API (fire and forget - we always want to clear tokens regardless of API result)
  if (accessToken) {
    await logoutUser(accessToken, refreshToken);
  }

  // Always clear tokens and redirect, even if API fails
  clearAuthTokens();
  
  // Deactivate FCM token on logout
  cleanupFcmToken();

  // Use window.location for full page redirect to clear browser history
  // This prevents user from going back to protected pages after logout
  window.location.replace('/login');
}