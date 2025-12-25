import axios from "axios";
import * as SecureStore from "expo-secure-store";

import i18n from "@/i18n";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Prevent axios from throwing on 4xx errors so we can handle them manually
  // without crashing or triggering Expo's error overlay.
  validateStatus: (status) => status >= 200 && status < 500,
});

api.interceptors.request.use(async (config) => {
  // 1. Token Injection
  const token = await SecureStore.getItemAsync("API_TOKEN");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Language Injection
  if (config.headers) {
    config.headers["Accept-Language"] = i18n.language;
  }

  return config;
});

// We can add a response interceptor later if we want to handle
// global 401s (token expiry) by redirecting to login, even if we don't throw errors.

export default api;
