import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.playymate.com/api/v1';

const api = axios.create({   
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ============ TOKEN REFRESH QUEUE PATTERN ============
// Following the implementation guide's recommended pattern:
// - Single in-flight refresh promise
// - Pending request queue while refreshing
// - Replay queued requests after refresh
// - Hard logout on refresh failure

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Only check sessionStorage - tokens should only be stored there
      const token = sessionStorage.getItem('accessToken');
      console.log('API Request - Token present:', !!token);
      console.log('API Request - Token value:', token ? token.substring(0, 20) + '...' : null);
      console.log('API Request - URL:', config.url);
      console.log('API Request - Method:', config.method);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh with queue pattern
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log all errors for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      dataString: JSON.stringify(error.response?.data),
      message: error.message,
      code: error.code,
      requestData: error.config?.data,
      headers: error.response?.headers
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Add to queue and wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (typeof window !== 'undefined') {
          // Only check sessionStorage for refresh token
          const refreshToken = sessionStorage.getItem('refreshToken');
          if (refreshToken) {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              { refresh_token: refreshToken }  // API expects snake_case
            );

            const newAccessToken = data.data?.accessToken;
            const newRefreshToken = data.data?.refreshToken;

            if (newAccessToken) {
              // Store ONLY in sessionStorage
              sessionStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                sessionStorage.setItem('refreshToken', newRefreshToken);
              }

              // Process queued requests with new token
              processQueue(null, newAccessToken);

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              isRefreshing = false;
              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed - hard logout
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          // Clear sessionStorage auth data
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('auth_flow_id');

          // Redirect to login
          window.location.href = '/login';
        }

        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
