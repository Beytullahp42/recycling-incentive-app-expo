import api from "@/services/axios-config";
import * as SecureStore from "expo-secure-store";

export type AuthResponse =
  | { success: true }
  | {
      success: false;
      message?: string;
      errors?: Record<string, string[]>;
    };

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post("/login", { email, password });
  if (response.status === 200) {
    const token = response.data.token;
    await SecureStore.setItemAsync("API_TOKEN", token);
    return { success: true };
  }
  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } catch (e) {
    console.warn("Logout API call failed or network error", e);
  } finally {
    await SecureStore.deleteItemAsync("API_TOKEN");
  }
}

export async function register(
  email: string,
  password: string,
  password_confirmation: string
): Promise<AuthResponse> {
  const response = await api.post("/register", {
    email,
    password,
    password_confirmation,
  });

  if (response.status === 201 || response.status === 200) {
    if (response.data.token) {
      await SecureStore.setItemAsync("API_TOKEN", response.data.token);
    }
    return { success: true };
  }
  console.log("\nresponse.data", response.data);
  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}
