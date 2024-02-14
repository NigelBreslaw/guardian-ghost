import { BungieUser } from "../account/Account";

export type AppAction =
  | {
      type: "setAuthenticated";
      payload: boolean;
    }
  | {
      type: "setCurrentAccount";
      payload: BungieUser | null;
    };

export type AppState = {
  authenticated: boolean;
  currentAccount: BungieUser | null;
};
