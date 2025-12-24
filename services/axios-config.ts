import axios from "axios";
import * as Network from "expo-network";
import { router } from "expo-router";
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
  // 1. Network Check
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected) {
    // User is okay with a hard redirect here
    router.replace("/no-internet");
    // We reject here to stop the request from processing further
    return Promise.reject({ message: "No internet connection" });
  }

  // 2. Token Injection
  const token = await SecureStore.getItemAsync("API_TOKEN");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 3. Language Injection
  if (config.headers) {
    config.headers["Accept-Language"] = i18n.language;
    console.log("\nconfig.headers (gidiyo)", config.headers);
  } else {
    console.log("\nconfig.headers", config.headers);
    console.log("\ni18n.language", i18n.language);
  }

  return config;
});

// We can add a response interceptor later if we want to handle
// global 401s (token expiry) by redirecting to login, even if we don't throw errors.

export default api;
