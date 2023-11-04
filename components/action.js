// actions.js
export const setInputText = (text) => ({
  type: "SET_INPUT_TEXT",
  payload: text,
});

// reducers.js
const initialState = {
  inputText: "",
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_INPUT_TEXT":
      return { ...state, inputText: action.payload };
    // Add other cases for additional state management if needed
    default:
      return state;
  }
};

export default rootReducer;
