import { create } from "zustand";
import { createAccountSlice, type AccountSlice } from "./AccountSlice.ts";
import { createAuthenticationSlice, type AuthenticationSlice } from "./AuthenticationSlice.ts";
import { createDefinitionsSlice, type DefinitionsSlice } from "./DefinitionsSlice.ts";
import { createGlobalStateSlice, type GlobalStateSlice } from "./GlobalStateSlice.ts";

interface IStore extends AccountSlice, AuthenticationSlice, DefinitionsSlice, GlobalStateSlice {}

export const useGGStore = create<IStore>()((...a) => ({
  ...createAccountSlice(...a),
  ...createAuthenticationSlice(...a),
  ...createDefinitionsSlice(...a),
  ...createGlobalStateSlice(...a),
}));
