import axios from "axios";
import { toast } from "react-toastify";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 429) {
      toast.error("Too many requests. Slow down.");
    }
    return Promise.reject(err);
  }
);

export default api;