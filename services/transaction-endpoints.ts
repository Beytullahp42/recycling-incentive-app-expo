import { StartSessionDTO } from "@/dtos/StartSessionDTO";
import api from "@/services/axios-config";

export type StartSessionResponse =
  | {
      success: true;
      bin_name: string;
      session_token: string;
      time_left: number;
    }
  | { success: false; message?: string; errors?: Record<string, string[]> };

export async function startSession(
  data: StartSessionDTO
): Promise<StartSessionResponse> {
  const response = await api.post("/start-session", data);

  if (response.status === 200) {
    return {
      success: true,
      bin_name: response.data.bin_name,
      session_token: response.data.session_token,
      time_left: response.data.time_left,
    };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}
