import { create } from "zustand";

type AuthenticationStore = {
  authenticated: boolean;
  setAuthenticated: () => void;
  setNotAuthenticated: () => void;
};

export const useAuthenticationStore = create<AuthenticationStore>((set) => ({
  authenticated: false,
  setAuthenticated: () => set({ authenticated: true }),
  setNotAuthenticated: () => set({ authenticated: false }),
}));
