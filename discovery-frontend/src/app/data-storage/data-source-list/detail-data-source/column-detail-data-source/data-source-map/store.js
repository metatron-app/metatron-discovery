import {keplerGlReducer} from "kepler.gl/reducers";
import {enhanceReduxMiddleware} from "kepler.gl/middleware";
import {applyMiddleware} from "redux";
import {combineReducers, compose, createStore} from "redux";

function appReducer(){
  return {}
}
const reducers = combineReducers({
  keplerGl: keplerGlReducer,
  app: appReducer
});
const middlewares = enhanceReduxMiddleware([]);
const enhancers = [applyMiddleware(...middlewares)];

const initialState = {};

export default createStore(reducers, initialState, compose(...enhancers));

