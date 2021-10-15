import {createAction, handleActions} from 'redux-actions';

// CONSTANTS
export const INIT = 'INIT';

// ACTIONS
export const appInit = createAction(INIT);

// INITIAL_STATE
const initialState = {
  appName: 'metatron',
  loaded: false
};

// REDUCER
const appReducer = handleActions(
  {
    [INIT]: (state, _action) => ({
      ...state,
      loaded: true
    })
  },
  initialState
);

export default appReducer;
