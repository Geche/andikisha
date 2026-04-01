import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { TokenResponse } from "@andikisha/shared-types";

interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT and tenant ID
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const tenantId = localStorage.getItem("tenantId");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        if (tenantId) config.headers["X-Tenant-ID"] = tenantId;
    }
    return config;
});

// Response interceptor: handle 401 with refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const { data } = await axios.post<TokenResponse>(
                    `${API_BASE_URL}/api/v1/auth/refresh`,
                    { refreshToken }
                );
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            } catch {
                localStorage.clear();
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export { apiClient as default };