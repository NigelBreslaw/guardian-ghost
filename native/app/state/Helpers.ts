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
    case "setInitComplete": {
      return { ...state, initComplete: action.payload };
    }
    case "setSystemDisabled": {
      return { ...state, systemDisabled: action.payload };
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
  initComplete: boolean;
  systemDisabled: boolean;
};

export const initialGlobalState: GlobalState = {
  currentAccount: null,
  currentListIndex: 0,
  definitionsReady: false,
  initComplete: false,
  systemDisabled: false,
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
    }
  | {
      type: "setInitComplete";
      payload: boolean;
    }
  | {
      type: "setSystemDisabled";
      payload: boolean;
    };
