import axios from "axios";
import * as Network from "expo-network";
import { create } from "zustand";

export type NetworkStatus =
  | "CHECKING"
  | "ONLINE"
  | "NO_INTERNET"
  | "SERVICE_UNAVAILABLE";

type NetworkStatusState = {
  status: NetworkStatus;
  isChecking: boolean;
  setStatus: (status: NetworkStatus) => void;
  setIsChecking: (isChecking: boolean) => void;
  checkConnectivity: () => Promise<void>;
  retry: () => Promise<void>;
};

export const useNetworkStatusStore = create<NetworkStatusState>((set, get) => ({
  status: "CHECKING",
  isChecking: true,

  setStatus: (status) => set({ status }),
  setIsChecking: (isChecking) => set({ isChecking }),

  checkConnectivity: async () => {
    set({ isChecking: true });
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        set({ status: "NO_INTERNET" });
        return;
      }

      try {
        // Use plain axios instead of api to avoid circular dependency
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/ping`,
          {
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        if (response.status >= 200 && response.status < 300) {
          set({ status: "ONLINE" });
        } else {
          set({ status: "SERVICE_UNAVAILABLE" });
        }
      } catch {
        set({ status: "SERVICE_UNAVAILABLE" });
      }
    } catch {
      set({ status: "NO_INTERNET" });
    } finally {
      set({ isChecking: false });
    }
  },

  retry: async () => {
    await get().checkConnectivity();
  },
}));

// Export a function for non-React code (like axios interceptors)
export const triggerNetworkCheck = () => {
  useNetworkStatusStore.getState().checkConnectivity();
};

export const setNetworkError = () => {
  useNetworkStatusStore.getState().setStatus("SERVICE_UNAVAILABLE");
};
