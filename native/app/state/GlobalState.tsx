import StorageGG from "@/app/storage/StorageGG.ts";
import AuthService from "@/authentication/AuthService.ts";
import DataService from "@/core/DataService.ts";
import * as SplashScreen from "expo-splash-screen";
import type React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import { type GlobalAction, type GlobalState, initialGlobalState, globalReducer } from "./Helpers.ts";
import { useGlobalStateStore } from "@/app/store/GlobalStateStore.ts";

export const StateContext = createContext<GlobalState | null>(null);
export const StateDispatchContext = createContext<React.Dispatch<GlobalAction> | null>(null);

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialGlobalState);
  const initComplete = useGlobalStateStore((state) => state.initComplete);
  const setInitComplete = useGlobalStateStore((state) => state.setInitComplete);

  useEffect(() => {
    const _storageService = StorageGG.getInstance();
    const _authService = AuthService.getInstance();
    const _dataService = DataService.getInstance();
    AuthService.setGlobalDispatch(dispatch);
    DataService.setGlobalDispatch(dispatch);

    return () => {
      setInitComplete(false);
      AuthService.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (initComplete) {
      SplashScreen.hideAsync();
    }
  }, [initComplete]);

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
