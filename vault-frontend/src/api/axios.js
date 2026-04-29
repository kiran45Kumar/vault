import axios from "axios";
import { toast } from "react-toastify";
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
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