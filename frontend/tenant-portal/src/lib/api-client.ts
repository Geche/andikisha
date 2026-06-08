import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Single home for tenant-portal response-error policy (W0).
 *
 * All tenant-portal API calls go through this instance (BFF proxy, cookie auth),
 * so every response-error rule lives in the one interceptor below — new cases are
 * added here, never as a second interceptor elsewhere.
 *
 * Policy:
 *  - 503 LICENCE_CHECK_UNAVAILABLE → transient. Retry with backoff; if still
 *    failing, surface a non-blocking "reconnecting" banner (window event) and
 *    reject. Never hard-blocks a read — the gateway now fails open for reads, so
 *    this code path is only reached for writes during a tenant-service outage.
 *  - 401 → expired/invalid session. Bounce to /login; the full navigation drops
 *    in-memory client state and the (invalid) cookie no longer authenticates.
 */

const LICENCE_UNAVAILABLE = "LICENCE_CHECK_UNAVAILABLE";
const LICENCE_RETRY_MAX = 2;
const LICENCE_BACKOFF_MS = [600, 1800];

// Window events consumed by <ConnectionBanner/>. SSR-guarded.
export const CONNECTION_DEGRADED = "andikisha:connection-degraded";
export const CONNECTION_OK = "andikisha:connection-ok";

function emit(name: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

type RetryableConfig = InternalAxiosRequestConfig & { __licenceRetry?: number };

export const apiClient = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    emit(CONNECTION_OK); // a successful round-trip clears any degraded banner
    return response;
  },
  async (err: AxiosError<{ code?: string }>) => {
    const status = err.response?.status;
    const code = err.response?.data?.code;
    const config = err.config as RetryableConfig | undefined;

    if (status === 503 && code === LICENCE_UNAVAILABLE && config) {
      const attempt = config.__licenceRetry ?? 0;
      if (attempt < LICENCE_RETRY_MAX) {
        config.__licenceRetry = attempt + 1;
        await new Promise((resolve) =>
          setTimeout(resolve, LICENCE_BACKOFF_MS[attempt])
        );
        return apiClient(config);
      }
      emit(CONNECTION_DEGRADED); // retries exhausted — degrade, do not crash
    }

    if (status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);
