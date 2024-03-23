import type { BungieUser } from "@/bungie/Types.ts";

export const globalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case "setCurrentAccount": {
      return { ...state, currentAccount: action.payload };
    }
    case "setCurrentListIndex": {
      return { ...state, currentListIndex: action.payload };
    }
    case "setDefinitionsReady": {
      return { ...state, definitionsReady: action.payload };
    }
    default: {
      return state;
    }
  }
};

export type GlobalState = {
  currentAccount: BungieUser | null;
  currentListIndex: number;
  definitionsReady: boolean;
};

export const initialGlobalState: GlobalState = {
  currentAccount: null,
  currentListIndex: 0,
  definitionsReady: false,
};

export type GlobalAction =
  | {
      type: "setCurrentAccount";
      payload: BungieUser | null;
    }
  | {
      type: "setCurrentListIndex";
      payload: number;
    }
  | {
      type: "setDefinitionsReady";
      payload: boolean;
    };
