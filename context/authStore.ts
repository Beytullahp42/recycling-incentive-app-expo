import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean | null; // null = not yet checked
  setAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  logout: async () => {
    await SecureStore.deleteItemAsync("API_TOKEN");
    set({ isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync("API_TOKEN");
    const hasToken = !!token;
    set({ isAuthenticated: hasToken });
    return hasToken;
  },
}));

// For use in non-React code (like axios interceptors)
export const logoutUser = async () => {
  await useAuthStore.getState().logout();
};
