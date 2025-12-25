import { StoreProfileDTO } from "@/dtos/StoreProfileDTO";
import { Profile } from "@/models/Profile";
import api from "@/services/axios-config";

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
  const response = await api.post("/profile", data);

  if (response.status === 201) {
    return { success: true, profile: new Profile(response.data) };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

export async function getMyProfile(): Promise<Profile | null> {
  const response = await api.get("/profile/me");

  if (response.status === 200 && response.data.profile) {
    return new Profile(response.data.profile);
  }

  return null;
}
