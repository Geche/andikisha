// AndikishaHR API Client
import axios, { AxiosInstance } from 'axios';

export function createApiClient(baseURL: string, getToken?: () => string | null): AxiosInstance {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const apiClient = createApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
);

export default apiClient;
