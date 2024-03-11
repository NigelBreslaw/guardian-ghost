import type { BungieUser } from "@/bungie/Types.ts";

export type GlobalState = {
  initComplete: boolean;
  loggingIn: boolean;
  authenticated: boolean;
  currentAccount: BungieUser | null;
  dataIsReady: boolean;
  definitionsReady: boolean;
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
    };
