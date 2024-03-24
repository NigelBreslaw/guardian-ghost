import { create } from "zustand";
import { createAccountSlice, type AccountSlice } from "./AccountSlice.ts";
import { createAuthenticationSlice, type AuthenticationSlice } from "@/app/store/AuthenticationSlice.ts";

interface IStore extends AccountSlice, AuthenticationSlice {}

export const useBoundStore = create<IStore>((...a) => ({
  ...createAccountSlice(...a),
  ...createAuthenticationSlice(...a),
}));
