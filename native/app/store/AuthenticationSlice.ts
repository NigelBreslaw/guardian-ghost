import type { StateCreator } from "zustand";

export interface AuthenticationSlice {
  authenticated: boolean;
  setAuthenticated: () => void;
  setNotAuthenticated: () => void;
  loggingIn: boolean;
  setLoggingIn: (loggingIn: boolean) => void;
}

export const createAuthenticationSlice: StateCreator<AuthenticationSlice> = (set) => ({
  authenticated: false,
  loggingIn: false,
  setAuthenticated: () => set({ authenticated: true }),
  setNotAuthenticated: () => set({ authenticated: false }),
  setLoggingIn: (payload: boolean) => set({ loggingIn: payload }),
});
