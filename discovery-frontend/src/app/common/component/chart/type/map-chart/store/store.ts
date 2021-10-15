import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import keplerGlReducer, {uiStateUpdaters} from 'kepler.gl/reducers';
import {enhanceReduxMiddleware} from 'kepler.gl/middleware';
import appReducer from './reducers';

const customizedKeplerGlReducer = keplerGlReducer
  .initialState({
    uiState: {
      // hide side panel to disallower user customize the map
      readOnly: false,
      activeSidePanel: null,
      currentModal: null,

      // customize which map control button to show
      mapControls: {
        ...uiStateUpdaters.DEFAULT_MAP_CONTROLS,
        visibleLayers: {
          show: false
        },
        mapLegend: {
          show: false,
          active: true
        },
        toggle3d: {
          show: false
        },
        splitMap: {
          show: false
        },
        mapDraw: {
          show: false
        },
        mapLocale: {
          show: false
        }
      }
    },
    mapStyle: {
      styleType: 'light'
    },
    mapState: {
      latitude: 37.5662805,
      longitude: 126.9846542
    }
  })
  // handle additional actions
  ;

const reducers = combineReducers({
  keplerGl: customizedKeplerGlReducer,
  app: appReducer
});

const middlewares = enhanceReduxMiddleware([]);
const enhancers = [applyMiddleware(...middlewares)];

const initialState = {};

// add redux devtools
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(reducers, initialState, compose(...enhancers));
