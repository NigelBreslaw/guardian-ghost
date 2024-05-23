import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { type AccountSlice, createAccountSlice } from "./AccountSlice.ts";
import { type AuthenticationSlice, createAuthenticationSlice } from "./AuthenticationSlice.ts";
import { type DefinitionsSlice, createDefinitionsSlice } from "./DefinitionsSlice.ts";
import { type UIDataSlice, createUIDataSlice } from "./UIDataSlice.ts";

export interface IStore extends AccountSlice, AuthenticationSlice, DefinitionsSlice, UIDataSlice {}

export const useGGStore = create<IStore>()(
  subscribeWithSelector((...a) => ({
    ...createAccountSlice(...a),
    ...createAuthenticationSlice(...a),
    ...createDefinitionsSlice(...a),
    ...createUIDataSlice(...a),
  })),
);
