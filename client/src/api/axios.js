import axios from 'axios';
import authService from '../utils/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

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

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
    authService.logout({ reason: 'expired' });
    throw new Error('No refresh token');
  }

  try {
    const response = await refreshClient.post('/auth/refresh', { refreshToken });
    authService.setTokens(
      {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      },
      { silent: true }
    );
    processQueue(null, response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    processQueue(error, null);
    authService.logout({ reason: 'expired' });
    throw error;
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = authService.getAccessToken();

    if (!token) {
      return config;
    }

    if (authService.isTokenExpired(token)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;