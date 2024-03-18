import StorageGG from "@/app/storage/StorageGG.ts";
import AuthService from "@/authentication/AuthService.ts";
import DataService from "@/core/DataService.ts";
import * as SplashScreen from "expo-splash-screen";
import type React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import { type GlobalAction, type GlobalState, initialGlobalState } from "./Types.ts";

export const StateContext = createContext<GlobalState | null>(null);
export const StateDispatchContext = createContext<React.Dispatch<GlobalAction> | null>(null);

const globalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case "setAuthenticated": {
      return { ...state, authenticated: action.payload };
    }
    case "setCurrentAccount": {
      return { ...state, currentAccount: action.payload };
    }
    case "setCurrentListIndex": {
      return { ...state, currentListIndex: action.payload };
    }
    case "setDataIsReady": {
      return { ...state, dataIsReady: action.payload };
    }
    case "setDefinitionsReady": {
      return { ...state, definitionsReady: action.payload };
    }
    case "setInitComplete": {
      return { ...state, initComplete: action.payload };
    }
    case "setLoggingIn": {
      return { ...state, loggingIn: action.payload };
    }
    case "setSystemDisabled": {
      return { ...state, systemDisabled: action.payload };
    }
    default: {
      return state;
    }
  }
};

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialGlobalState);

  useEffect(() => {
    const storageService = StorageGG.getInstance();
    const authService = AuthService.getInstance();
    AuthService.subscribe(dispatch);
    const dataService = DataService.getInstance(dispatch);

    return () => {
      dispatch({ type: "setInitComplete", payload: false });
      AuthService.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.initComplete) {
      SplashScreen.hideAsync();
    }
  }, [state.initComplete]);

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
