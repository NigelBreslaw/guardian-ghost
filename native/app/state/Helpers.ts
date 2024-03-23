import type { BungieUser } from "@/bungie/Types.ts";

export const globalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case "setAuthenticated": {
      return { ...state, authenticated: action.payload };
    }
    case "setCurrentAccount": {
      return { ...state, currentAccount: action.payload };
    }
    case "setCurrentListIndex": {
      return { ...state, currentListIndex: action.payload };
    }
    case "setDefinitionsReady": {
      return { ...state, definitionsReady: action.payload };
    }
    case "setInitComplete": {
      return { ...state, initComplete: action.payload };
    }
    case "setLoggingIn": {
      return { ...state, loggingIn: action.payload };
    }
    case "setSystemDisabled": {
      return { ...state, systemDisabled: action.payload };
    }
    default: {
      return state;
    }
  }
};

export type GlobalState = {
  authenticated: boolean;
  currentAccount: BungieUser | null;
  currentListIndex: number;
  definitionsReady: boolean;
  initComplete: boolean;
  loggingIn: boolean;
  systemDisabled: boolean;
};

export const initialGlobalState: GlobalState = {
  authenticated: false,
  currentAccount: null,
  currentListIndex: 0,
  definitionsReady: false,
  initComplete: false,
  loggingIn: false,
  systemDisabled: false,
};

export type GlobalAction =
  | {
      type: "setAuthenticated";
      payload: boolean;
    }
  | {
      type: "setCurrentAccount";
      payload: BungieUser | null;
    }
  | {
      type: "setCurrentListIndex";
      payload: number;
    }
  | {
      type: "setDefinitionsReady";
      payload: boolean;
    }
  | {
      type: "setInitComplete";
      payload: boolean;
    }
  | {
      type: "setLoggingIn";
      payload: boolean;
    }
  | {
      type: "setSystemDisabled";
      payload: boolean;
    };
