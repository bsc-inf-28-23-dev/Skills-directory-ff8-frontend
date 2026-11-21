
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string; fieldErrors?: Record<string, string> }
        | undefined;

      return Promise.reject({
        status: error.response?.status ?? null,
        message: 'We could not complete that action. Please try again.',
        fieldErrors: responseData?.fieldErrors,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
