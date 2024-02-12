export type AppAction =
  | {
      type: "setAuthenticated";
      payload: boolean;
    }
  | {
      type: "setCurrentUserID";
      payload: string | null;
    };

export type AppState = {
  authenticated: boolean;
  currentUserID: string;
};
