import axios from 'axios';
import { BRAND } from '../constants/brand';
import { useAuthStore } from '../store/useAuthStore';

const rawBaseURL = BRAND.apiBaseUrl;
const baseURL = rawBaseURL.replace(/\/api\/v1\/?$/, '').replace(/\/v1\/?$/, '');

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export function resolveApiUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseURL}${normalizedPath}`;
}

export function getAuthImageHeaders() {
  const { token, selectedUnitId } = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (selectedUnitId) {
    headers['X-Selected-Unit-Id'] = selectedUnitId;
  }

  return headers;
}

api.interceptors.request.use((config) => {
  const { token, selectedUnitId } = useAuthStore.getState();
  const requestUrl = String(config.url || '');
  const skipSelectedUnit = config.headers?.['X-Skip-Selected-Unit'] === 'true';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (skipSelectedUnit) {
    delete config.headers['X-Skip-Selected-Unit'];
    delete config.headers['X-Selected-Unit-Id'];
  } else if (selectedUnitId && !requestUrl.includes('/auth/login')) {
    config.headers['X-Selected-Unit-Id'] = selectedUnitId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;
