import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BACKEND_URL,
  withCredentials: true
});

// Add a request interceptor to include the token in the header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally and reduce console noise
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx (e.g. 400, 401, 403, 404, 500)
      // We reject the promise so it can be handled by the local try/catch
      return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error: No response received from server.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Axios setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
