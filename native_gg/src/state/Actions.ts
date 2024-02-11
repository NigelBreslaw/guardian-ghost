export type AppAction =
  | {
      type: "setAuthenticated";
      payload: boolean;
    }
  | {
      type: "setCurrentUserID";
      payload: string;
    };

export type AppState = {
  authenticated: boolean;
  currentUserID: string;
};
