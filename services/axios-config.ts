import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { logoutUser } from "@/context/authStore";
import { triggerNetworkCheck } from "@/context/networkStatusStore";
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
    console.log(i18n.language);
    config.headers["Accept-Language"] = i18n.language;
  }

  return config;
});

// Response interceptor to handle auth errors and network errors
api.interceptors.response.use(
  async (response) => {
    // Handle 401 Unauthenticated - clear token and trigger logout
    if (response.status === 401) {
      await logoutUser();
    }
    return response;
  },
  async (error) => {
    // Check if it's a network error (no response received)
    if (!error.response && error.code === "ERR_NETWORK") {
      triggerNetworkCheck();
    }
    return Promise.reject(error);
  }
);

export default api;
