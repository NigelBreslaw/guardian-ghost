export const globalReducer = (state: GlobalState, action: GlobalAction) => {
  switch (action.type) {
    case "setDefinitionsReady": {
      return { ...state, definitionsReady: action.payload };
    }
    default: {
      return state;
    }
  }
};

export type GlobalState = {
  definitionsReady: boolean;
};

export const initialGlobalState: GlobalState = {
  definitionsReady: false,
};

export type GlobalAction = {
  type: "setDefinitionsReady";
  payload: boolean;
};
