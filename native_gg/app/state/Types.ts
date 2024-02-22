import { BungieUser } from "../account/Account";

export type GlobalState = {
  appReady: boolean;
  authenticated: boolean;
  currentAccount: BungieUser | null;
};

export type GlobalAction =
  | {
      type: "setAppReady";
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
