import type React from "react";
import { createContext, useContext, useReducer } from "react";
import type { UiCell } from "@/app/inventory/Common.ts";

type InventoryState = {
  weaponsPageData: Array<Array<UiCell>>;
  armorPageData: Array<Array<UiCell>>;
  inventoryPageData: Array<Array<UiCell>>;
};

const initialInventoryState: InventoryState = {
  weaponsPageData: [],
  armorPageData: [],
  inventoryPageData: [],
};

type InventoryAction =
  | {
      type: "setWeaponsPageData";
      payload: Array<Array<UiCell>>;
    }
  | {
      type: "setArmorPageData";
      payload: Array<Array<UiCell>>;
    }
  | {
      type: "setInventoryPageData";
      payload: Array<Array<UiCell>>;
    };

const inventoryReducer = (state: InventoryState, action: InventoryAction) => {
  switch (action.type) {
    case "setWeaponsPageData": {
      return { ...state, weaponsPageData: action.payload };
    }
    case "setArmorPageData": {
      return { ...state, armorPageData: action.payload };
    }
    case "setInventoryPageData": {
      return { ...state, inventoryPageData: action.payload };
    }
    default: {
      return state;
    }
  }
};

const StateContext = createContext<InventoryState | null>(null);
const StateDispatchContext = createContext<React.Dispatch<InventoryAction> | null>(null);

export const useInventoryStateContext = () => {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useStateContext must be used within a StateContextProvider");
  }
  return context;
};

export const useInventoryDispatchContext = () => {
  const context = useContext(StateDispatchContext);
  if (context === null) {
    throw new Error("useDispatchContext must be used within a StateDispatchContextProvider");
  }
  return context;
};

const InventoryStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialInventoryState);

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={dispatch}>{children}</StateDispatchContext.Provider>
    </StateContext.Provider>
  );
};

export default InventoryStateProvider;
