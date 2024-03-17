import type { BungieUser } from "@/bungie/Types.ts";

export type GlobalState = {
  authenticated: boolean;
  currentAccount: BungieUser | null;
  currentListIndex: number;
  dataIsReady: boolean;
  definitionsReady: boolean;
  initComplete: boolean;
  loggingIn: boolean;
  systemDisabled: boolean;
};

export const initialGlobalState: GlobalState = {
  authenticated: false,
  currentAccount: null,
  currentListIndex: 0,
  dataIsReady: false,
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
      type: "setDataIsReady";
      payload: boolean;
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
