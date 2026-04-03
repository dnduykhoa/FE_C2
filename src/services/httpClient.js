import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || '';
const devProxyPattern = /localhost:3000|127\.0\.0\.1:3000/;
const baseURL = import.meta.env.DEV && devProxyPattern.test(configuredBaseURL)
  ? ''
  : configuredBaseURL;

const httpClient = axios.create({
  baseURL,
  withCredentials: true
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
