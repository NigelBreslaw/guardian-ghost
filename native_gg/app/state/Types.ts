import { BungieUser } from "@/app/bungie/Types.ts";

export type GlobalState = {
  appReady: boolean;
  loggingIn: boolean;
  authenticated: boolean;
  currentAccount: BungieUser | null;
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
    };
