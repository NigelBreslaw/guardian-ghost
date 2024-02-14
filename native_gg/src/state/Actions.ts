import { BungieUser } from "../account/Account";

export type AuthState = {
  initComplete: boolean;
  authenticated: boolean;
  currentAccount: BungieUser | null;
};

export const initialAuthState: AuthState = {
  initComplete: false,
  authenticated: false,
  currentAccount: null,
};

export type AuthAction =
  | {
      type: "setInitComplete";
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

export const authReducer = (state: AuthState, action: AuthAction) => {
  const { initComplete, authenticated, currentAccount } = state;
  switch (action.type) {
    case "setInitComplete": {
      return { initComplete: action.payload, authenticated, currentAccount };
    }
    case "setAuthenticated": {
      return { initComplete, authenticated: action.payload, currentAccount };
    }
    case "setCurrentAccount": {
      return { initComplete, authenticated, currentAccount: action.payload };
    }
    default: {
      return state;
    }
  }
};
