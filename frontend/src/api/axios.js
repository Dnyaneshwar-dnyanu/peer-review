import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || window.location.origin;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

// Add a response interceptor to handle errors globally and reduce console noise
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        await refreshClient.post('/api/auth/refresh-token');
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      return Promise.reject(error);
    } else if (error.request) {
      console.error("Network Error: No response received from server.");
    } else {
      console.error("Axios setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
