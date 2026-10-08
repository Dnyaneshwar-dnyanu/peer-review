import axios from "axios";

// Backend URL from Vite environment variable
const apiBaseUrl = (import.meta.env.VITE_REACT_APP_BACKEND_URL || "").replace(/\/$/, "");

if (!apiBaseUrl) {
  console.warn("VITE_REACT_APP_BACKEND_URL is not configured.");
}

// Main API client
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
});

// Separate client for refresh-token requests
const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
});

// Requests that should NOT trigger token refresh
const shouldSkipRefresh = (url) => {
  if (!url) return false;

  return (
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register") ||
    url.includes("/api/auth/forgot-password") ||
    url.includes("/api/auth/refresh-token")
  );
};

// Global response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No response from server / network error
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 responses
    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        // Try to get a new access token using refresh token
        await refreshClient.post("/api/auth/refresh-token");

        // Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token is invalid/expired
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;