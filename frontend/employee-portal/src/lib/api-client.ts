import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);
