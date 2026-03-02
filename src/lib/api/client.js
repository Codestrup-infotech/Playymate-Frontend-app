import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.playymate.com/api/v1';

const api = axios.create({   
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Only check sessionStorage - tokens stored there only
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          // Only check sessionStorage for refresh token
          const refreshToken = sessionStorage.getItem('refreshToken');
          if (refreshToken) {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });

            const newAccessToken = data.data?.accessToken;
            const newRefreshToken = data.data?.refreshToken;

            if (newAccessToken) {
              // Store in sessionStorage for session-based auth
              sessionStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                sessionStorage.setItem('refreshToken', newRefreshToken);
              }

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        // Clear sessionStorage auth data on refresh failure
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('auth_flow_id');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
