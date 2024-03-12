import type { BungieUser } from "@/bungie/Types.ts";

export type GlobalState = {
  initComplete: boolean;
  loggingIn: boolean;
  authenticated: boolean;
  systemDisabled: boolean;
  currentAccount: BungieUser | null;
  dataIsReady: boolean;
  definitionsReady: boolean;
};

export const initialGlobalState: GlobalState = {
  initComplete: false,
  loggingIn: false,
  authenticated: false,
  systemDisabled: false,
  currentAccount: null,
  dataIsReady: false,
  definitionsReady: false,
};

export type GlobalAction =
  | {
      type: "setInitComplete";
      payload: boolean;
    }
  | {
      type: "setLoggingIn";
      payload: boolean;
    }
  | {
      type: "setAuthenticated";
      payload: boolean;
    }
  | {
      type: "setCurrentAccount";
      payload: BungieUser | null;
    }
  | {
      type: "setDataIsReady";
      payload: boolean;
    }
  | {
      type: "setDefinitionsReady";
      payload: boolean;
    }
  | {
      type: "setSystemDisabled";
      payload: boolean;
    };
