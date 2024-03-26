import type { BungieUser } from "@/app/bungie/Types.ts";
import { getTokenAsync, initAuthentication } from "@/app/store/AuthenticationLogic.ts";
import type { AuthToken } from "@/app/store/Utilities.ts";
import type { StateCreator } from "zustand";

export interface AuthenticationSlice {
  authenticated: boolean;
  setAuthenticated: () => void;
  setNotAuthenticated: () => void;
  loggingIn: boolean;
  setLoggingIn: (loggingIn: boolean) => void;
  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  bungieUser: BungieUser | null;
  setBungieUser: (bungieUser: BungieUser | null) => void;
}

export const createAuthenticationSlice: StateCreator<AuthenticationSlice> = (set) => ({
  authenticated: false,
  loggingIn: false,
  setAuthenticated: () => set({ authenticated: true }),
  setNotAuthenticated: () => set({ authenticated: false }),
  setLoggingIn: (payload) => set({ loggingIn: payload }),
  getTokenAsync,
  initAuthentication,
  bungieUser: null,
  setBungieUser: (bungieUser) => set({ bungieUser }),
});
