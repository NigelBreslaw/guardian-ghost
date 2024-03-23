import { create } from "zustand";

type AuthenticationStore = {
  authenticated: boolean;
  setAuthenticated: () => void;
  setNotAuthenticated: () => void;
  loggingIn: boolean;
};

export const useAuthenticationStore = create<AuthenticationStore>((set) => ({
  authenticated: false,
  loggingIn: false,
  setAuthenticated: () => set({ authenticated: true }),
  setNotAuthenticated: () => set({ authenticated: false }),
  setLoggingIn: (payload: boolean) => set({ loggingIn: payload }),
}));
