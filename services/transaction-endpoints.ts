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
  //TODO: Remove this
  console.log(response.data);

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

// Submit Item Types & Function
export type SubmitItemResponse =
  | {
      success: true;
      points_awarded: number;
      item_name: string;
      status: string;
      message: string;
    }
  | {
      success: false;
      message?: string;
      requires_proof?: boolean;
      errors?: Record<string, string[]>;
    };

export async function submitItem(
  session_token: string,
  barcode: string
): Promise<SubmitItemResponse> {
  const response = await api.post("/submit-item", { session_token, barcode });
  //TODO: Remove this
  console.log(response.data);

  if (response.status === 200) {
    return {
      success: true,
      points_awarded: response.data.points_awarded,
      item_name: response.data.item_name,
      status: response.data.status,
      message: response.data.message,
    };
  }

  return {
    success: false,
    message: response.data.message,
    requires_proof: response.data.requires_proof,
    errors: response.data.errors,
  };
}

// Upload Proof Types & Function
export type UploadProofResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message?: string;
      errors?: Record<string, string[]>;
    };

export async function uploadProof(
  session_token: string,
  proofPhoto: { uri: string; name: string; type: string }
): Promise<UploadProofResponse> {
  const formData = new FormData();
  formData.append("session_token", session_token);
  formData.append("proof_photo", {
    uri: proofPhoto.uri,
    name: proofPhoto.name,
    type: proofPhoto.type,
  } as any);

  const response = await api.post("/upload-proof", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  //TODO: Remove this
  console.log(response.data);

  if (response.status === 200) {
    return {
      success: true,
      message: response.data.message,
    };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}

// End Session Types & Function
export type EndSessionResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message?: string;
      errors?: Record<string, string[]>;
    };

export async function endSession(
  session_token: string
): Promise<EndSessionResponse> {
  const response = await api.post("/end-session", { session_token });
  //TODO: Remove this
  console.log(response.data);

  if (response.status === 200) {
    return {
      success: true,
      message: response.data.message,
    };
  }

  return {
    success: false,
    message: response.data.message,
    errors: response.data.errors,
  };
}
