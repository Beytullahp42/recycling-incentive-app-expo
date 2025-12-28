import { logoutUser } from "@/context/authStore";
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
    await logoutUser(); // Clears token AND updates auth state
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

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const response = await api.get("/user");
    if (response.status === 200 && response.data?.email) {
      return response.data.email;
    }
    return null;
  } catch (e) {
    console.warn("Failed to fetch user email", e);
    return null;
  }
}

export async function updateEmail(email: string): Promise<AuthResponse> {
  const response = await api.put("/email", { email });

  if (response.status === 200) {
    return { success: true };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

export async function updatePassword(
  current_password: string,
  new_password: string,
  new_password_confirmation: string
): Promise<AuthResponse> {
  const response = await api.put("/password", {
    current_password,
    new_password,
    new_password_confirmation,
  });

  if (response.status === 200) {
    return { success: true };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

export async function deleteAccount(password: string): Promise<AuthResponse> {
  const response = await api.delete("/account", {
    data: { password },
  });

  if (response.status === 200) {
    await logoutUser(); // Clears token AND updates auth state
    return { success: true };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}
