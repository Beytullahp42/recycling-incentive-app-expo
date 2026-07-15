import { StoreProfileDTO } from "@/dtos/StoreProfileDTO";
import { DashboardStats } from "@/models/Dashboard";
import { Profile } from "@/models/Profile";
import api from "@/services/axios-config";
import axios from "axios";

export type ProfileResponse =
  | { success: true; profile: Profile }
  | {
      success: false;
      message?: string;
      errors?: Record<string, string[]>;
    };

export async function storeProfile(
  data: StoreProfileDTO
): Promise<ProfileResponse> {
  try {
    const response = await api.post("/profile", data);

    if (response.status === 201) {
      return { success: true, profile: new Profile(response.data) };
    }

    return {
      success: false,
      message: response.data.message,
      errors: response.data.errors,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
      };
    }

    throw error;
  }
}

export async function getMyProfile(): Promise<Profile | null> {
  const response = await api.get("/profile/me");

  if (response.status === 200 && response.data.profile) {
    return new Profile(response.data.profile);
  }

  return null;
}

export async function updateProfile(data: {
  username?: string;
  bio?: string;
}): Promise<ProfileResponse> {
  const response = await api.put("/profile", data);

  if (response.status === 200) {
    return { success: true, profile: new Profile(response.data) };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const response = await api.get("/dashboard");

  if (response.status === 200) {
    return response.data;
  }

  return null;
}
