import { create } from "zustand";
import { type AccountSlice, createAccountSlice } from "./AccountSlice.ts";
import { type AuthenticationSlice, createAuthenticationSlice } from "./AuthenticationSlice.ts";
import { type DefinitionsSlice, createDefinitionsSlice } from "./DefinitionsSlice.ts";

interface IStore extends AccountSlice, AuthenticationSlice, DefinitionsSlice {}

export const useGGStore = create<IStore>()((...a) => ({
  ...createAccountSlice(...a),
  ...createAuthenticationSlice(...a),
  ...createDefinitionsSlice(...a),
}));
