import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const TOKEN_STORAGE_KEY = 'todo_jwt_token';

// Read saved token on startup
const initialToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

let inMemoryToken: string | null = initialToken;

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(initialToken ? { Authorization: `Bearer ${initialToken}` } : {}),
  },
});

export function setApiToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export function getApiToken(): string | null {
  if (!inMemoryToken && typeof window !== 'undefined') {
    inMemoryToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return inMemoryToken;
}

// Request interceptor to attach bearer token to all outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = getApiToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

