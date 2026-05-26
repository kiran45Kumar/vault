import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "http://localhost:8000/api",
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // TOO MANY REQUESTS
    if (error.response?.status === 429) {
      toast.error("Too many requests. Slow down.");
    }

    // ACCESS TOKEN EXPIRED
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh =
          localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

        // NO REFRESH TOKEN
        if (!refresh) {
          localStorage.clear();
          window.location.href = "/login";

          return Promise.reject(error);
        }

        // GET NEW ACCESS TOKEN
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/token/refresh/`,
          {
            refresh,
          },
        );

        const newAccess = response.data.access;

        // SAVE NEW ACCESS TOKEN
        localStorage.setItem("access", newAccess);
        sessionStorage.setItem("access", newAccess);

        // UPDATE HEADER
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        // RETRY ORIGINAL REQUEST
        return api(originalRequest);
      } catch (refreshError) {
        // REFRESH TOKEN EXPIRED
        localStorage.clear();

        toast.error("Session expired. Please login again.");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
