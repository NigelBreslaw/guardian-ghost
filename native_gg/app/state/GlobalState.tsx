import * as SplashScreen from "expo-splash-screen";
import React, { useReducer, createContext, useContext, useEffect } from "react";
import AuthService from "../authentication/AuthService";
import { GlobalAction, GlobalState } from "./Types";

// Define the context
const initialState: GlobalState = {
  appReady: false,
  loggingIn: false,
  authenticated: false,
  currentAccount: null,
};

export const StateContext = createContext<GlobalState | null>(null);
export const StateDispatchContext = createContext<React.Dispatch<GlobalAction> | null>(null);

const globalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case "setAppReady": {
      return { ...state, appReady: action.payload };
    }
    case "setAuthenticated": {
      return { ...state, authenticated: action.payload };
    }
    case "setCurrentAccount": {
      return { ...state, currentAccount: action.payload };
    }
    case "setLoggingIn": {
      return { ...state, loggingIn: action.payload };
    }
    default: {
      return state;
    }
  }
};

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const authService = AuthService.getInstance();
  AuthService.subscribe(dispatch);

  useEffect(() => {
    if (state.appReady) {
      console.log("App is ready");
      SplashScreen.hideAsync();
    }
  }, [state.appReady]);

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={dispatch}>{children}</StateDispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useGlobalStateContext = () => {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useStateContext must be used within a StateContextProvider");
  }
  return context;
};

export const useGlobalDispatchContext = () => {
  const context = useContext(StateDispatchContext);
  if (context === null) {
    throw new Error("useDispatchContext must be used within a StateDispatchContextProvider");
  }
  return context;
};

export default GlobalStateProvider;
