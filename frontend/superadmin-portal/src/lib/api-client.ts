import axios from "axios";

// All API calls go through the Next.js proxy route which attaches
// the HttpOnly token server-side. The token is never readable by JS.
export const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      typeof window !== "undefined" &&
      !err.config?.url?.includes("/super-admin/login")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
