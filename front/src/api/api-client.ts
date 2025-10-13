import axios from "axios";

export const base_api_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

const apiClient = axios.create({
  baseURL: base_api_url + '/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("code_jwt");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        localStorage.removeItem("code_jwt");

        if (status === 401) {
          console.warn("Unauthorized: Please log in again.");
        }

        if (status === 403) {
          console.error(
            "Access forbidden: You do not have permission to view this resource."
          );
        }

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
