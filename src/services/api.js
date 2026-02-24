import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
      const token = localStorage.getItem('accessToken');
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
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            const newAccessToken = data.data?.accessToken;
            const newRefreshToken = data.data?.refreshToken;

            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
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
          // Clear all auth data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('next_required_step');
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
