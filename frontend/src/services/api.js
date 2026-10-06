import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("dera_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export function getApiErrorMessage(error) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your admin session is missing or has expired.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status >= 500) {
    return "The server encountered an error. Please try again.";
  }
  if (error.request && !error.response) {
    return "Unable to connect to the server.";
  }

  return error.response?.data?.detail || error.message || "Request failed.";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      !error.config?.url?.includes("/api/admin/auth/login")
    ) {
      window.localStorage.removeItem("dera_admin_token");
      window.localStorage.removeItem("dera_admin");

      if (window.location.pathname !== "/admin/login") {
        window.location.assign("/admin/login");
      }
    }

    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  }
);

export default api;