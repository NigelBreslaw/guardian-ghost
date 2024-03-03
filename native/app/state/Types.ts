import { BungieUser } from "@/bungie/Types.ts";

export type GlobalState = {
  appReady: boolean;
  loggingIn: boolean;
  authenticated: boolean;
  currentAccount: BungieUser | null;
  dataIsReady: boolean;
  definitionsReady: boolean;
};

export type GlobalAction =
  | {
      type: "setAppReady";
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
