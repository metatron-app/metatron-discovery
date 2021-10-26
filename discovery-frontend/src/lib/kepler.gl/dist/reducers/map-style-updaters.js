"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMapStyles = getMapStyles;
exports.getInitialInputStyle = getInitialInputStyle;
exports.set3dBuildingColorUpdater = exports.addCustomMapStyleUpdater = exports.inputMapStyleUpdater = exports.loadCustomMapStyleUpdater = exports.resetMapConfigMapStyleUpdater = exports.receiveMapConfigUpdater = exports.requestMapStylesUpdater = exports.loadMapStyleErrUpdater = exports.loadMapStylesUpdater = exports.mapStyleChangeUpdater = exports.mapConfigChangeUpdater = exports.initMapStyleUpdater = exports.INITIAL_MAP_STYLE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _tasks = _interopRequireWildcard(require("react-palm/tasks"));

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _mapboxGlStyleEditor = require("../utils/map-style-utils/mapbox-gl-style-editor");

var _defaultSettings = require("../constants/default-settings");

var _utils = require("../utils/utils");

var _tasks2 = require("../tasks/tasks");

var _mapStyleActions = require("../actions/map-style-actions");

var _d3Color = require("d3-color");

var _colorUtils = require("../utils/color-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_BLDG_COLOR = '#D1CEC7';
/**
 * @return {import('./map-style-updaters').MapStyle}
 */

var getDefaultState = function getDefaultState() {
  var visibleLayerGroups = {};
  var styleType = 'dark';
  var topLayerGroups = {};
  return {
    styleType: styleType,
    visibleLayerGroups: visibleLayerGroups,
    topLayerGroups: topLayerGroups,
    mapStyles: _defaultSettings.DEFAULT_MAP_STYLES.reduce(function (accu, curr) {
      return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, curr.id, curr));
    }, {}),
    // save mapbox access token
    mapboxApiAccessToken: null,
    mapboxApiUrl: _defaultSettings.DEFAULT_MAPBOX_API_URL,
    mapStylesReplaceDefault: false,
    inputStyle: getInitialInputStyle(),
    threeDBuildingColor: (0, _colorUtils.hexToRgb)(DEFAULT_BLDG_COLOR),
    custom3DBuildingColor: false
  };
};
/**
 * Updaters for `mapStyle`. Can be used in your root reducer to directly modify kepler.gl's state.
 * Read more about [Using updaters](../advanced-usage/using-updaters.md)
 * @public
 * @example
 *
 * import keplerGlReducer, {mapStyleUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    // click button to hide label from background map
 *    case 'CLICK_BUTTON':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          foo: {
 *             ...state.keplerGl.foo,
 *             mapStyle: mapStyleUpdaters.mapConfigChangeUpdater(
 *               mapStyle,
 *               {payload: {visibleLayerGroups: {label: false, road: true, background: true}}}
 *             )
 *          }
 *        }
 *      };
 *  }
 *  return reducers(state, action);
 * };
 *
 * export default composedReducer;
 */

/* eslint-disable no-unused-vars */


var mapStyleUpdaters = null;
/* eslint-enable no-unused-vars */

/**
 * Default initial `mapStyle`
 * @memberof mapStyleUpdaters
 * @constant
 * @property styleType - Default: `'dark'`
 * @property visibleLayerGroups - Default: `{}`
 * @property topLayerGroups - Default: `{}`
 * @property mapStyles - mapping from style key to style object
 * @property mapboxApiAccessToken - Default: `null`
 * @Property mapboxApiUrl - Default null
 * @Property mapStylesReplaceDefault - Default: `false`
 * @property inputStyle - Default: `{}`
 * @property threeDBuildingColor - Default: `[r, g, b]`
 * @type {import('./map-style-updaters').MapStyle}
 * @public
 */

var INITIAL_MAP_STYLE = getDefaultState();
/**
 * Create two map styles from preset map style, one for top map one for bottom
 *
 * @param {string} styleType - current map style
 * @param {Object} visibleLayerGroups - visible layers of bottom map
 * @param {Object} topLayerGroups - visible layers of top map
 * @param {Object} mapStyles - a dictionary of all map styles
 * @returns {Object} bottomMapStyle | topMapStyle | isRaster
 */

exports.INITIAL_MAP_STYLE = INITIAL_MAP_STYLE;

function getMapStyles(_ref) {
  var styleType = _ref.styleType,
      visibleLayerGroups = _ref.visibleLayerGroups,
      topLayerGroups = _ref.topLayerGroups,
      mapStyles = _ref.mapStyles;
  var mapStyle = mapStyles[styleType]; // style might not be loaded yet

  if (!mapStyle || !mapStyle.style) {
    return {};
  }

  var editable = Object.keys(visibleLayerGroups).length;
  var bottomMapStyle = !editable ? mapStyle.style : (0, _mapboxGlStyleEditor.editBottomMapStyle)({
    id: styleType,
    mapStyle: mapStyle,
    visibleLayerGroups: visibleLayerGroups
  });
  var hasTopLayer = editable && Object.values(topLayerGroups).some(function (v) {
    return v;
  }); // mute top layer if not visible in bottom layer

  var topLayers = hasTopLayer && Object.keys(topLayerGroups).reduce(function (accu, key) {
    return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, topLayerGroups[key] && visibleLayerGroups[key]));
  }, {});
  var topMapStyle = hasTopLayer ? (0, _mapboxGlStyleEditor.editTopMapStyle)({
    id: styleType,
    mapStyle: mapStyle,
    visibleLayerGroups: topLayers
  }) : null;
  return {
    bottomMapStyle: bottomMapStyle,
    topMapStyle: topMapStyle,
    editable: editable
  };
}

function findLayerFillColor(layer) {
  return layer && layer.paint && layer.paint['background-color'];
}

function get3DBuildingColor(style) {
  // set building color to be the same as the background color.
  if (!style.style) {
    return (0, _colorUtils.hexToRgb)(DEFAULT_BLDG_COLOR);
  }

  var backgroundLayer = (style.style.layers || []).find(function (_ref2) {
    var id = _ref2.id;
    return id === 'background';
  });
  var buildingLayer = (style.style.layers || []).find(function (_ref3) {
    var id = _ref3.id;
    return id.match(/building/);
  });
  var buildingColor = findLayerFillColor(buildingLayer) || findLayerFillColor(backgroundLayer) || DEFAULT_BLDG_COLOR; // brighten or darken building based on style

  var operation = style.id.match(/(?=(dark|night))/) ? 'brighter' : 'darker';
  var alpha = 0.2;
  var rgbObj = (0, _d3Color.rgb)(buildingColor)[operation]([alpha]);
  return [rgbObj.r, rgbObj.g, rgbObj.b];
}

function getLayerGroupsFromStyle(style) {
  return Array.isArray(style.layers) ? _defaultSettings.DEFAULT_LAYER_GROUPS.filter(function (lg) {
    return style.layers.filter(lg.filter).length;
  }) : [];
} // Updaters

/**
 * Propagate `mapStyle` reducer with `mapboxApiAccessToken` and `mapStylesReplaceDefault`.
 * if mapStylesReplaceDefault is true mapStyles is emptied; loadMapStylesUpdater() will
 * populate mapStyles.
 *
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').initMapStyleUpdater}
 * @public
 */


var initMapStyleUpdater = function initMapStyleUpdater(state, _ref4) {
  var _ref4$payload = _ref4.payload,
      payload = _ref4$payload === void 0 ? {} : _ref4$payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    // save mapbox access token to map style state
    mapboxApiAccessToken: payload.mapboxApiAccessToken || state.mapboxApiAccessToken,
    mapboxApiUrl: payload.mapboxApiUrl || state.mapboxApiUrl,
    mapStyles: !payload.mapStylesReplaceDefault ? state.mapStyles : {},
    mapStylesReplaceDefault: payload.mapStylesReplaceDefault || false
  });
}; // });

/**
 * Update `visibleLayerGroups`to change layer group visibility
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').mapConfigChangeUpdater}
 * @public
 */


exports.initMapStyleUpdater = initMapStyleUpdater;

var mapConfigChangeUpdater = function mapConfigChangeUpdater(state, action) {
  return _objectSpread(_objectSpread(_objectSpread({}, state), action.payload), getMapStyles(_objectSpread(_objectSpread({}, state), action.payload)));
};
/**
 * Change to another map style. The selected style should already been loaded into `mapStyle.mapStyles`
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').mapStyleChangeUpdater}
 * @public
 */


exports.mapConfigChangeUpdater = mapConfigChangeUpdater;

var mapStyleChangeUpdater = function mapStyleChangeUpdater(state, _ref5) {
  var styleType = _ref5.payload;

  if (!state.mapStyles[styleType]) {
    // we might not have received the style yet
    return state;
  }

  var defaultLGVisibility = (0, _mapboxGlStyleEditor.getDefaultLayerGroupVisibility)(state.mapStyles[styleType]);
  var visibleLayerGroups = (0, _mapboxGlStyleEditor.mergeLayerGroupVisibility)(defaultLGVisibility, state.visibleLayerGroups);
  var threeDBuildingColor = state.custom3DBuildingColor ? state.threeDBuildingColor : get3DBuildingColor(state.mapStyles[styleType]);
  return _objectSpread(_objectSpread({}, state), {}, {
    styleType: styleType,
    visibleLayerGroups: visibleLayerGroups,
    threeDBuildingColor: threeDBuildingColor
  }, getMapStyles(_objectSpread(_objectSpread({}, state), {}, {
    visibleLayerGroups: visibleLayerGroups,
    styleType: styleType
  })));
};
/**
 * Callback when load map style success
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').loadMapStylesUpdater}
 * @public
 */


exports.mapStyleChangeUpdater = mapStyleChangeUpdater;

var loadMapStylesUpdater = function loadMapStylesUpdater(state, action) {
  var newStyles = action.payload || {};
  var addLayerGroups = Object.keys(newStyles).reduce(function (accu, id) {
    return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, id, _objectSpread(_objectSpread({}, newStyles[id]), {}, {
      layerGroups: newStyles[id].layerGroups || getLayerGroupsFromStyle(newStyles[id].style)
    })));
  }, {}); // add new styles to state

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    mapStyles: _objectSpread(_objectSpread({}, state.mapStyles), addLayerGroups)
  });

  return newStyles[state.styleType] ? mapStyleChangeUpdater(newState, {
    payload: state.styleType
  }) : newState;
};
/**
 * Callback when load map style error
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').loadMapStyleErrUpdater}
 * @public
 */
// do nothing for now, if didn't load, skip it


exports.loadMapStylesUpdater = loadMapStylesUpdater;

var loadMapStyleErrUpdater = function loadMapStyleErrUpdater(state) {
  return state;
};
/**
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').requestMapStylesUpdater}
 * @public
 */


exports.loadMapStyleErrUpdater = loadMapStyleErrUpdater;

var requestMapStylesUpdater = function requestMapStylesUpdater(state, _ref6) {
  var mapStyles = _ref6.payload;
  var loadMapStyleTasks = getLoadMapStyleTasks(mapStyles, state.mapboxApiAccessToken, state.mapboxApiUrl);
  return (0, _tasks.withTask)(state, loadMapStyleTasks);
};
/**
 * Load map style object when pass in saved map config
 * @memberof mapStyleUpdaters
 * @param state `mapStyle`
 * @param action
 * @param action.payload saved map config `{mapStyle, visState, mapState}`
 * @returns nextState or `react-pam` tasks to load map style object
 * @type {typeof import('./map-style-updaters').receiveMapConfigUpdater}
 */


exports.requestMapStylesUpdater = requestMapStylesUpdater;

var receiveMapConfigUpdater = function receiveMapConfigUpdater(state, _ref7) {
  var _ref7$payload$config = _ref7.payload.config,
      config = _ref7$payload$config === void 0 ? {} : _ref7$payload$config;

  var _ref8 = config || {},
      mapStyle = _ref8.mapStyle;

  if (!mapStyle) {
    return state;
  } // if saved custom mapStyles load the style object


  var loadMapStyleTasks = mapStyle.mapStyles ? getLoadMapStyleTasks(mapStyle.mapStyles, state.mapboxApiAccessToken, state.mapboxApiUrl) : null; // merge default mapStyles

  var merged = mapStyle.mapStyles ? _objectSpread(_objectSpread({}, mapStyle), {}, {
    mapStyles: _objectSpread(_objectSpread({}, mapStyle.mapStyles), state.mapStyles)
  }) : mapStyle; // set custom3DBuildingColor: true if mapStyle contains threeDBuildingColor

  merged.custom3DBuildingColor = Boolean(mapStyle.threeDBuildingColor) || merged.custom3DBuildingColor;
  var newState = mapConfigChangeUpdater(state, {
    payload: merged
  });
  return loadMapStyleTasks ? (0, _tasks.withTask)(newState, loadMapStyleTasks) : newState;
};

exports.receiveMapConfigUpdater = receiveMapConfigUpdater;

function getLoadMapStyleTasks(mapStyles, mapboxApiAccessToken, mapboxApiUrl) {
  return [_tasks["default"].all(Object.values(mapStyles).map(function (_ref9) {
    var id = _ref9.id,
        url = _ref9.url,
        accessToken = _ref9.accessToken;
    return {
      id: id,
      url: (0, _mapboxGlStyleEditor.isValidStyleUrl)(url) ? (0, _mapboxGlStyleEditor.getStyleDownloadUrl)(url, accessToken || mapboxApiAccessToken, mapboxApiUrl) : url
    };
  }).map(_tasks2.LOAD_MAP_STYLE_TASK)).bimap( // success
  function (results) {
    return (0, _mapStyleActions.loadMapStyles)(results.reduce(function (accu, _ref10) {
      var id = _ref10.id,
          style = _ref10.style;
      return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, id, _objectSpread(_objectSpread({}, mapStyles[id]), {}, {
        style: style
      })));
    }, {}));
  }, // error
  _mapStyleActions.loadMapStyleErr)];
}
/**
 * Reset map style config to initial state
 * @memberof mapStyleUpdaters
 * @param state `mapStyle`
 * @returns nextState
 * @type {typeof import('./map-style-updaters').resetMapConfigMapStyleUpdater}
 * @public
 */


var resetMapConfigMapStyleUpdater = function resetMapConfigMapStyleUpdater(state) {
  var emptyConfig = _objectSpread(_objectSpread(_objectSpread({}, INITIAL_MAP_STYLE), {}, {
    mapboxApiAccessToken: state.mapboxApiAccessToken,
    mapboxApiUrl: state.mapboxApiUrl,
    mapStylesReplaceDefault: state.mapStylesReplaceDefault
  }, state.initialState), {}, {
    mapStyles: state.mapStyles,
    initialState: state.initialState
  });

  return mapStyleChangeUpdater(emptyConfig, {
    payload: emptyConfig.styleType
  });
};
/**
 * Callback when a custom map style object is received
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').loadCustomMapStyleUpdater}
 * @public
 */


exports.resetMapConfigMapStyleUpdater = resetMapConfigMapStyleUpdater;

var loadCustomMapStyleUpdater = function loadCustomMapStyleUpdater(state, _ref11) {
  var _ref11$payload = _ref11.payload,
      icon = _ref11$payload.icon,
      style = _ref11$payload.style,
      error = _ref11$payload.error;
  return _objectSpread(_objectSpread({}, state), {}, {
    inputStyle: _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, state.inputStyle), style ? {
      id: style.id || (0, _utils.generateHashId)(),
      // make a copy of the style object
      style: (0, _lodash["default"])(style),
      label: style.name,
      // gathering layer group info from style json
      layerGroups: getLayerGroupsFromStyle(style)
    } : {}), icon ? {
      icon: icon
    } : {}), error !== undefined ? {
      error: error
    } : {})
  });
};
/**
 * Input a custom map style object
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').inputMapStyleUpdater}
 * @public
 */


exports.loadCustomMapStyleUpdater = loadCustomMapStyleUpdater;

var inputMapStyleUpdater = function inputMapStyleUpdater(state, _ref12) {
  var _ref12$payload = _ref12.payload,
      inputStyle = _ref12$payload.inputStyle,
      mapState = _ref12$payload.mapState;

  var updated = _objectSpread(_objectSpread({}, state.inputStyle), inputStyle);

  var isValid = (0, _mapboxGlStyleEditor.isValidStyleUrl)(updated.url);
  var icon = isValid ? (0, _mapboxGlStyleEditor.getStyleImageIcon)({
    mapState: mapState,
    styleUrl: updated.url,
    mapboxApiAccessToken: updated.accessToken || state.mapboxApiAccessToken,
    mapboxApiUrl: state.mapboxApiUrl || _defaultSettings.DEFAULT_MAPBOX_API_URL
  }) : state.inputStyle.icon;
  return _objectSpread(_objectSpread({}, state), {}, {
    inputStyle: _objectSpread(_objectSpread({}, updated), {}, {
      isValid: isValid,
      icon: icon
    })
  });
};
/**
 * Add map style from user input to reducer and set it to current style
 * This action is called when user click confirm after putting in a valid style url in the custom map style dialog.
 * It should not be called from outside kepler.gl without a valid `inputStyle` in the `mapStyle` reducer.
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').addCustomMapStyleUpdater}
 */


exports.inputMapStyleUpdater = inputMapStyleUpdater;

var addCustomMapStyleUpdater = function addCustomMapStyleUpdater(state) {
  var styleId = state.inputStyle.id;

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    mapStyles: _objectSpread(_objectSpread({}, state.mapStyles), {}, (0, _defineProperty2["default"])({}, styleId, state.inputStyle)),
    // set to default
    inputStyle: getInitialInputStyle()
  }); // set new style


  return mapStyleChangeUpdater(newState, {
    payload: styleId
  });
};
/**
 * Updates 3d building color
 * @memberof mapStyleUpdaters
 * @type {typeof import('./map-style-updaters').set3dBuildingColorUpdater}
 */


exports.addCustomMapStyleUpdater = addCustomMapStyleUpdater;

var set3dBuildingColorUpdater = function set3dBuildingColorUpdater(state, _ref13) {
  var color = _ref13.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    threeDBuildingColor: color,
    custom3DBuildingColor: true
  });
};
/**
 * Return the initial input style
 * @return Object
 */


exports.set3dBuildingColorUpdater = set3dBuildingColorUpdater;

function getInitialInputStyle() {
  return {
    accessToken: null,
    error: false,
    isValid: false,
    label: null,
    style: null,
    url: null,
    icon: null,
    custom: true
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy9tYXAtc3R5bGUtdXBkYXRlcnMuanMiXSwibmFtZXMiOlsiREVGQVVMVF9CTERHX0NPTE9SIiwiZ2V0RGVmYXVsdFN0YXRlIiwidmlzaWJsZUxheWVyR3JvdXBzIiwic3R5bGVUeXBlIiwidG9wTGF5ZXJHcm91cHMiLCJtYXBTdHlsZXMiLCJERUZBVUxUX01BUF9TVFlMRVMiLCJyZWR1Y2UiLCJhY2N1IiwiY3VyciIsImlkIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJtYXBib3hBcGlVcmwiLCJERUZBVUxUX01BUEJPWF9BUElfVVJMIiwibWFwU3R5bGVzUmVwbGFjZURlZmF1bHQiLCJpbnB1dFN0eWxlIiwiZ2V0SW5pdGlhbElucHV0U3R5bGUiLCJ0aHJlZURCdWlsZGluZ0NvbG9yIiwiY3VzdG9tM0RCdWlsZGluZ0NvbG9yIiwibWFwU3R5bGVVcGRhdGVycyIsIklOSVRJQUxfTUFQX1NUWUxFIiwiZ2V0TWFwU3R5bGVzIiwibWFwU3R5bGUiLCJzdHlsZSIsImVkaXRhYmxlIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImJvdHRvbU1hcFN0eWxlIiwiaGFzVG9wTGF5ZXIiLCJ2YWx1ZXMiLCJzb21lIiwidiIsInRvcExheWVycyIsImtleSIsInRvcE1hcFN0eWxlIiwiZmluZExheWVyRmlsbENvbG9yIiwibGF5ZXIiLCJwYWludCIsImdldDNEQnVpbGRpbmdDb2xvciIsImJhY2tncm91bmRMYXllciIsImxheWVycyIsImZpbmQiLCJidWlsZGluZ0xheWVyIiwibWF0Y2giLCJidWlsZGluZ0NvbG9yIiwib3BlcmF0aW9uIiwiYWxwaGEiLCJyZ2JPYmoiLCJyIiwiZyIsImIiLCJnZXRMYXllckdyb3Vwc0Zyb21TdHlsZSIsIkFycmF5IiwiaXNBcnJheSIsIkRFRkFVTFRfTEFZRVJfR1JPVVBTIiwiZmlsdGVyIiwibGciLCJpbml0TWFwU3R5bGVVcGRhdGVyIiwic3RhdGUiLCJwYXlsb2FkIiwibWFwQ29uZmlnQ2hhbmdlVXBkYXRlciIsImFjdGlvbiIsIm1hcFN0eWxlQ2hhbmdlVXBkYXRlciIsImRlZmF1bHRMR1Zpc2liaWxpdHkiLCJsb2FkTWFwU3R5bGVzVXBkYXRlciIsIm5ld1N0eWxlcyIsImFkZExheWVyR3JvdXBzIiwibGF5ZXJHcm91cHMiLCJuZXdTdGF0ZSIsImxvYWRNYXBTdHlsZUVyclVwZGF0ZXIiLCJyZXF1ZXN0TWFwU3R5bGVzVXBkYXRlciIsImxvYWRNYXBTdHlsZVRhc2tzIiwiZ2V0TG9hZE1hcFN0eWxlVGFza3MiLCJyZWNlaXZlTWFwQ29uZmlnVXBkYXRlciIsImNvbmZpZyIsIm1lcmdlZCIsIkJvb2xlYW4iLCJUYXNrIiwiYWxsIiwibWFwIiwidXJsIiwiYWNjZXNzVG9rZW4iLCJMT0FEX01BUF9TVFlMRV9UQVNLIiwiYmltYXAiLCJyZXN1bHRzIiwibG9hZE1hcFN0eWxlRXJyIiwicmVzZXRNYXBDb25maWdNYXBTdHlsZVVwZGF0ZXIiLCJlbXB0eUNvbmZpZyIsImluaXRpYWxTdGF0ZSIsImxvYWRDdXN0b21NYXBTdHlsZVVwZGF0ZXIiLCJpY29uIiwiZXJyb3IiLCJsYWJlbCIsIm5hbWUiLCJ1bmRlZmluZWQiLCJpbnB1dE1hcFN0eWxlVXBkYXRlciIsIm1hcFN0YXRlIiwidXBkYXRlZCIsImlzVmFsaWQiLCJzdHlsZVVybCIsImFkZEN1c3RvbU1hcFN0eWxlVXBkYXRlciIsInN0eWxlSWQiLCJzZXQzZEJ1aWxkaW5nQ29sb3JVcGRhdGVyIiwiY29sb3IiLCJjdXN0b20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQXFCQTs7QUFDQTs7QUFHQTs7QUFTQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsa0JBQWtCLEdBQUcsU0FBM0I7QUFFQTs7OztBQUdBLElBQU1DLGVBQWUsR0FBRyxTQUFsQkEsZUFBa0IsR0FBTTtBQUM1QixNQUFNQyxrQkFBa0IsR0FBRyxFQUEzQjtBQUNBLE1BQU1DLFNBQVMsR0FBRyxNQUFsQjtBQUNBLE1BQU1DLGNBQWMs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TTtBQWVQOzs7Ozs7Ozs7QUFLTyxJQUFNQyx5QkFBeUIsR0FBRyxTQUE1QkEseUJBQTRCLENBQUM1QyxLQUFEO0FBQUEsTUFBa0I2QyxLQUFsQixVQUFTNUMsT0FBVDtBQUFBLHlDQUNwQ0QsS0FEb0M7QUFFdkMxQyxJQUFBQSxtQkFBbUIsRUFBRXVGLEtBRmtCO0FBR3ZDdEYsSUFBQUEscUJBQXFCLEVBQUU7QUFIZ0I7QUFBQSxDQUFsQztBQU1QOzs7Ozs7OztBQUlPLFNBQVNGLG9CQUFULEdBQWdDO0FBQ3JDLFNBQU87QUFDTGtFLElBQUFBLFdBQVcsRUFBRSxJQURSO0FBRUxVLElBQUFBLEtBQUssRUFBRSxLQUZGO0FBR0xPLElBQUFBLE9BQU8sRUFBRSxLQUhKO0FBSUxOLElBQUFBLEtBQUssRUFBRSxJQUpGO0FBS0x0RSxJQUFBQSxLQUFLLEVBQUUsSUFMRjtBQU1MMEQsSUFBQUEsR0FBRyxFQUFFLElBTkE7QUFPTFUsSUFBQUEsSUFBSSxFQUFFLElBUEQ7QUFRTGMsSUFBQUEsTUFBTSxFQUFFO0FBUkgsR0FBUDtBQVVEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gQHRzLW5vY2hlY2tcbmltcG9ydCBUYXNrLCB7d2l0aFRhc2t9IGZyb20gJ3JlYWN0LXBhbG0vdGFza3MnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJztcblxuLy8gVXRpbHNcbmltcG9ydCB7XG4gIGdldERlZmF1bHRMYXllckdyb3VwVmlzaWJpbGl0eSxcbiAgaXNWYWxpZFN0eWxlVXJsLFxuICBnZXRTdHlsZURvd25sb2FkVXJsLFxuICBtZXJnZUxheWVyR3JvdXBWaXNpYmlsaXR5LFxuICBlZGl0VG9wTWFwU3R5bGUsXG4gIGVkaXRCb3R0b21NYXBTdHlsZSxcbiAgZ2V0U3R5bGVJbWFnZUljb25cbn0gZnJvbSAndXRpbHMvbWFwLXN0eWxlLXV0aWxzL21hcGJveC1nbC1zdHlsZS1lZGl0b3InO1xuaW1wb3J0IHtcbiAgREVGQVVMVF9NQVBfU1RZTEVTLFxuICBERUZBVUxUX0xBWUVSX0dST1VQUyxcbiAgREVGQVVMVF9NQVBCT1hfQVBJX1VSTFxufSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge2dlbmVyYXRlSGFzaElkfSBmcm9tICd1dGlscy91dGlscyc7XG5pbXBvcnQge0xPQURfTUFQX1NUWUxFX1RBU0t9IGZyb20gJ3Rhc2tzL3Rhc2tzJztcbmltcG9ydCB7bG9hZE1hcFN0eWxlcywgbG9hZE1hcFN0eWxlRXJyfSBmcm9tICdhY3Rpb25zL21hcC1zdHlsZS1hY3Rpb25zJztcbmltcG9ydCB7cmdifSBmcm9tICdkMy1jb2xvcic7XG5pbXBvcnQge2hleFRvUmdifSBmcm9tICd1dGlscy9jb2xvci11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQkxER19DT0xPUiA9ICcjRDFDRUM3JztcblxuLyoqXG4gKiBAcmV0dXJuIHtpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykuTWFwU3R5bGV9XG4gKi9cbmNvbnN0IGdldERlZmF1bHRTdGF0ZSA9ICgpID0+IHtcbiAgY29uc3QgdmlzaWJsZUxheWVyR3JvdXBzID0ge307XG4gIGNvbnN0IHN0eWxlVHlwZSA9ICdkYXJrJztcbiAgY29uc3QgdG9wTGF5ZXJHcm91cHMgPSB7fTtcblxuICByZXR1cm4ge1xuICAgIHN0eWxlVHlwZSxcbiAgICB2aXNpYmxlTGF5ZXJHcm91cHMsXG4gICAgdG9wTGF5ZXJHcm91cHMsXG4gICAgbWFwU3R5bGVzOiBERUZBVUxUX01BUF9TVFlMRVMucmVkdWNlKFxuICAgICAgKGFjY3UsIGN1cnIpID0+ICh7XG4gICAgICAgIC4uLmFjY3UsXG4gICAgICAgIFtjdXJyLmlkXTogY3VyclxuICAgICAgfSksXG4gICAgICB7fVxuICAgICksXG4gICAgLy8gc2F2ZSBtYXBib3ggYWNjZXNzIHRva2VuXG4gICAgbWFwYm94QXBpQWNjZXNzVG9rZW46IG51bGwsXG4gICAgbWFwYm94QXBpVXJsOiBERUZBVUxUX01BUEJPWF9BUElfVVJMLFxuICAgIG1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0OiBmYWxzZSxcbiAgICBpbnB1dFN0eWxlOiBnZXRJbml0aWFsSW5wdXRTdHlsZSgpLFxuICAgIHRocmVlREJ1aWxkaW5nQ29sb3I6IGhleFRvUmdiKERFRkFVTFRfQkxER19DT0xPUiksXG4gICAgY3VzdG9tM0RCdWlsZGluZ0NvbG9yOiBmYWxzZVxuICB9O1xufTtcblxuLyoqXG4gKiBVcGRhdGVycyBmb3IgYG1hcFN0eWxlYC4gQ2FuIGJlIHVzZWQgaW4geW91ciByb290IHJlZHVjZXIgdG8gZGlyZWN0bHkgbW9kaWZ5IGtlcGxlci5nbCdzIHN0YXRlLlxuICogUmVhZCBtb3JlIGFib3V0IFtVc2luZyB1cGRhdGVyc10oLi4vYWR2YW5jZWQtdXNhZ2UvdXNpbmctdXBkYXRlcnMubWQpXG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICpcbiAqIGltcG9ydCBrZXBsZXJHbFJlZHVjZXIsIHttYXBTdHlsZVVwZGF0ZXJzfSBmcm9tICdrZXBsZXIuZ2wvcmVkdWNlcnMnO1xuICogLy8gUm9vdCBSZWR1Y2VyXG4gKiBjb25zdCByZWR1Y2VycyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gKiAga2VwbGVyR2w6IGtlcGxlckdsUmVkdWNlcixcbiAqICBhcHA6IGFwcFJlZHVjZXJcbiAqIH0pO1xuICpcbiAqIGNvbnN0IGNvbXBvc2VkUmVkdWNlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gKiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICogICAgLy8gY2xpY2sgYnV0dG9uIHRvIGhpZGUgbGFiZWwgZnJvbSBiYWNrZ3JvdW5kIG1hcFxuICogICAgY2FzZSAnQ0xJQ0tfQlVUVE9OJzpcbiAqICAgICAgcmV0dXJuIHtcbiAqICAgICAgICAuLi5zdGF0ZSxcbiAqICAgICAgICBrZXBsZXJHbDoge1xuICogICAgICAgICAgLi4uc3RhdGUua2VwbGVyR2wsXG4gKiAgICAgICAgICBmb286IHtcbiAqICAgICAgICAgICAgIC4uLnN0YXRlLmtlcGxlckdsLmZvbyxcbiAqICAgICAgICAgICAgIG1hcFN0eWxlOiBtYXBTdHlsZVVwZGF0ZXJzLm1hcENvbmZpZ0NoYW5nZVVwZGF0ZXIoXG4gKiAgICAgICAgICAgICAgIG1hcFN0eWxlLFxuICogICAgICAgICAgICAgICB7cGF5bG9hZDoge3Zpc2libGVMYXllckdyb3Vwczoge2xhYmVsOiBmYWxzZSwgcm9hZDogdHJ1ZSwgYmFja2dyb3VuZDogdHJ1ZX19fVxuICogICAgICAgICAgICAgKVxuICogICAgICAgICAgfVxuICogICAgICAgIH1cbiAqICAgICAgfTtcbiAqICB9XG4gKiAgcmV0dXJuIHJlZHVjZXJzKHN0YXRlLCBhY3Rpb24pO1xuICogfTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBjb21wb3NlZFJlZHVjZXI7XG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5jb25zdCBtYXBTdHlsZVVwZGF0ZXJzID0gbnVsbDtcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbi8qKlxuICogRGVmYXVsdCBpbml0aWFsIGBtYXBTdHlsZWBcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAY29uc3RhbnRcbiAqIEBwcm9wZXJ0eSBzdHlsZVR5cGUgLSBEZWZhdWx0OiBgJ2RhcmsnYFxuICogQHByb3BlcnR5IHZpc2libGVMYXllckdyb3VwcyAtIERlZmF1bHQ6IGB7fWBcbiAqIEBwcm9wZXJ0eSB0b3BMYXllckdyb3VwcyAtIERlZmF1bHQ6IGB7fWBcbiAqIEBwcm9wZXJ0eSBtYXBTdHlsZXMgLSBtYXBwaW5nIGZyb20gc3R5bGUga2V5IHRvIHN0eWxlIG9iamVjdFxuICogQHByb3BlcnR5IG1hcGJveEFwaUFjY2Vzc1Rva2VuIC0gRGVmYXVsdDogYG51bGxgXG4gKiBAUHJvcGVydHkgbWFwYm94QXBpVXJsIC0gRGVmYXVsdCBudWxsXG4gKiBAUHJvcGVydHkgbWFwU3R5bGVzUmVwbGFjZURlZmF1bHQgLSBEZWZhdWx0OiBgZmFsc2VgXG4gKiBAcHJvcGVydHkgaW5wdXRTdHlsZSAtIERlZmF1bHQ6IGB7fWBcbiAqIEBwcm9wZXJ0eSB0aHJlZURCdWlsZGluZ0NvbG9yIC0gRGVmYXVsdDogYFtyLCBnLCBiXWBcbiAqIEB0eXBlIHtpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykuTWFwU3R5bGV9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBJTklUSUFMX01BUF9TVFlMRSA9IGdldERlZmF1bHRTdGF0ZSgpO1xuXG4vKipcbiAqIENyZWF0ZSB0d28gbWFwIHN0eWxlcyBmcm9tIHByZXNldCBtYXAgc3R5bGUsIG9uZSBmb3IgdG9wIG1hcCBvbmUgZm9yIGJvdHRvbVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZVR5cGUgLSBjdXJyZW50IG1hcCBzdHlsZVxuICogQHBhcmFtIHtPYmplY3R9IHZpc2libGVMYXllckdyb3VwcyAtIHZpc2libGUgbGF5ZXJzIG9mIGJvdHRvbSBtYXBcbiAqIEBwYXJhbSB7T2JqZWN0fSB0b3BMYXllckdyb3VwcyAtIHZpc2libGUgbGF5ZXJzIG9mIHRvcCBtYXBcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXBTdHlsZXMgLSBhIGRpY3Rpb25hcnkgb2YgYWxsIG1hcCBzdHlsZXNcbiAqIEByZXR1cm5zIHtPYmplY3R9IGJvdHRvbU1hcFN0eWxlIHwgdG9wTWFwU3R5bGUgfCBpc1Jhc3RlclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFwU3R5bGVzKHtzdHlsZVR5cGUsIHZpc2libGVMYXllckdyb3VwcywgdG9wTGF5ZXJHcm91cHMsIG1hcFN0eWxlc30pIHtcbiAgY29uc3QgbWFwU3R5bGUgPSBtYXBTdHlsZXNbc3R5bGVUeXBlXTtcblxuICAvLyBzdHlsZSBtaWdodCBub3QgYmUgbG9hZGVkIHlldFxuICBpZiAoIW1hcFN0eWxlIHx8ICFtYXBTdHlsZS5zdHlsZSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGNvbnN0IGVkaXRhYmxlID0gT2JqZWN0LmtleXModmlzaWJsZUxheWVyR3JvdXBzKS5sZW5ndGg7XG5cbiAgY29uc3QgYm90dG9tTWFwU3R5bGUgPSAhZWRpdGFibGVcbiAgICA/IG1hcFN0eWxlLnN0eWxlXG4gICAgOiBlZGl0Qm90dG9tTWFwU3R5bGUoe1xuICAgICAgICBpZDogc3R5bGVUeXBlLFxuICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgdmlzaWJsZUxheWVyR3JvdXBzXG4gICAgICB9KTtcblxuICBjb25zdCBoYXNUb3BMYXllciA9IGVkaXRhYmxlICYmIE9iamVjdC52YWx1ZXModG9wTGF5ZXJHcm91cHMpLnNvbWUodiA9PiB2KTtcblxuICAvLyBtdXRlIHRvcCBsYXllciBpZiBub3QgdmlzaWJsZSBpbiBib3R0b20gbGF5ZXJcbiAgY29uc3QgdG9wTGF5ZXJzID1cbiAgICBoYXNUb3BMYXllciAmJlxuICAgIE9iamVjdC5rZXlzKHRvcExheWVyR3JvdXBzKS5yZWR1Y2UoXG4gICAgICAoYWNjdSwga2V5KSA9PiAoe1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICBba2V5XTogdG9wTGF5ZXJHcm91cHNba2V5XSAmJiB2aXNpYmxlTGF5ZXJHcm91cHNba2V5XVxuICAgICAgfSksXG4gICAgICB7fVxuICAgICk7XG5cbiAgY29uc3QgdG9wTWFwU3R5bGUgPSBoYXNUb3BMYXllclxuICAgID8gZWRpdFRvcE1hcFN0eWxlKHtcbiAgICAgICAgaWQ6IHN0eWxlVHlwZSxcbiAgICAgICAgbWFwU3R5bGUsXG4gICAgICAgIHZpc2libGVMYXllckdyb3VwczogdG9wTGF5ZXJzXG4gICAgICB9KVxuICAgIDogbnVsbDtcblxuICByZXR1cm4ge2JvdHRvbU1hcFN0eWxlLCB0b3BNYXBTdHlsZSwgZWRpdGFibGV9O1xufVxuXG5mdW5jdGlvbiBmaW5kTGF5ZXJGaWxsQ29sb3IobGF5ZXIpIHtcbiAgcmV0dXJuIGxheWVyICYmIGxheWVyLnBhaW50ICYmIGxheWVyLnBhaW50WydiYWNrZ3JvdW5kLWNvbG9yJ107XG59XG5cbmZ1bmN0aW9uIGdldDNEQnVpbGRpbmdDb2xvcihzdHlsZSkge1xuICAvLyBzZXQgYnVpbGRpbmcgY29sb3IgdG8gYmUgdGhlIHNhbWUgYXMgdGhlIGJhY2tncm91bmQgY29sb3IuXG4gIGlmICghc3R5bGUuc3R5bGUpIHtcbiAgICByZXR1cm4gaGV4VG9SZ2IoREVGQVVMVF9CTERHX0NPTE9SKTtcbiAgfVxuXG4gIGNvbnN0IGJhY2tncm91bmRMYXllciA9IChzdHlsZS5zdHlsZS5sYXllcnMgfHwgW10pLmZpbmQoKHtpZH0pID0+IGlkID09PSAnYmFja2dyb3VuZCcpO1xuXG4gIGNvbnN0IGJ1aWxkaW5nTGF5ZXIgPSAoc3R5bGUuc3R5bGUubGF5ZXJzIHx8IFtdKS5maW5kKCh7aWR9KSA9PiBpZC5tYXRjaCgvYnVpbGRpbmcvKSk7XG5cbiAgY29uc3QgYnVpbGRpbmdDb2xvciA9XG4gICAgZmluZExheWVyRmlsbENvbG9yKGJ1aWxkaW5nTGF5ZXIpIHx8IGZpbmRMYXllckZpbGxDb2xvcihiYWNrZ3JvdW5kTGF5ZXIpIHx8IERFRkFVTFRfQkxER19DT0xPUjtcblxuICAvLyBicmlnaHRlbiBvciBkYXJrZW4gYnVpbGRpbmcgYmFzZWQgb24gc3R5bGVcbiAgY29uc3Qgb3BlcmF0aW9uID0gc3R5bGUuaWQubWF0Y2goLyg/PShkYXJrfG5pZ2h0KSkvKSA/ICdicmlnaHRlcicgOiAnZGFya2VyJztcblxuICBjb25zdCBhbHBoYSA9IDAuMjtcbiAgY29uc3QgcmdiT2JqID0gcmdiKGJ1aWxkaW5nQ29sb3IpW29wZXJhdGlvbl0oW2FscGhhXSk7XG4gIHJldHVybiBbcmdiT2JqLnIsIHJnYk9iai5nLCByZ2JPYmouYl07XG59XG5cbmZ1bmN0aW9uIGdldExheWVyR3JvdXBzRnJvbVN0eWxlKHN0eWxlKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHN0eWxlLmxheWVycylcbiAgICA/IERFRkFVTFRfTEFZRVJfR1JPVVBTLmZpbHRlcihsZyA9PiBzdHlsZS5sYXllcnMuZmlsdGVyKGxnLmZpbHRlcikubGVuZ3RoKVxuICAgIDogW107XG59XG5cbi8vIFVwZGF0ZXJzXG4vKipcbiAqIFByb3BhZ2F0ZSBgbWFwU3R5bGVgIHJlZHVjZXIgd2l0aCBgbWFwYm94QXBpQWNjZXNzVG9rZW5gIGFuZCBgbWFwU3R5bGVzUmVwbGFjZURlZmF1bHRgLlxuICogaWYgbWFwU3R5bGVzUmVwbGFjZURlZmF1bHQgaXMgdHJ1ZSBtYXBTdHlsZXMgaXMgZW1wdGllZDsgbG9hZE1hcFN0eWxlc1VwZGF0ZXIoKSB3aWxsXG4gKiBwb3B1bGF0ZSBtYXBTdHlsZXMuXG4gKlxuICogQG1lbWJlcm9mIG1hcFN0eWxlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL21hcC1zdHlsZS11cGRhdGVycycpLmluaXRNYXBTdHlsZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0TWFwU3R5bGVVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZCA9IHt9fSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIC8vIHNhdmUgbWFwYm94IGFjY2VzcyB0b2tlbiB0byBtYXAgc3R5bGUgc3RhdGVcbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IHBheWxvYWQubWFwYm94QXBpQWNjZXNzVG9rZW4gfHwgc3RhdGUubWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gIG1hcGJveEFwaVVybDogcGF5bG9hZC5tYXBib3hBcGlVcmwgfHwgc3RhdGUubWFwYm94QXBpVXJsLFxuICBtYXBTdHlsZXM6ICFwYXlsb2FkLm1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0ID8gc3RhdGUubWFwU3R5bGVzIDoge30sXG4gIG1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0OiBwYXlsb2FkLm1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0IHx8IGZhbHNlXG59KTtcbi8vIH0pO1xuXG4vKipcbiAqIFVwZGF0ZSBgdmlzaWJsZUxheWVyR3JvdXBzYHRvIGNoYW5nZSBsYXllciBncm91cCB2aXNpYmlsaXR5XG4gKiBAbWVtYmVyb2YgbWFwU3R5bGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykubWFwQ29uZmlnQ2hhbmdlVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG1hcENvbmZpZ0NoYW5nZVVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIC4uLmFjdGlvbi5wYXlsb2FkLFxuICAuLi5nZXRNYXBTdHlsZXMoe1xuICAgIC4uLnN0YXRlLFxuICAgIC4uLmFjdGlvbi5wYXlsb2FkXG4gIH0pXG59KTtcblxuLyoqXG4gKiBDaGFuZ2UgdG8gYW5vdGhlciBtYXAgc3R5bGUuIFRoZSBzZWxlY3RlZCBzdHlsZSBzaG91bGQgYWxyZWFkeSBiZWVuIGxvYWRlZCBpbnRvIGBtYXBTdHlsZS5tYXBTdHlsZXNgXG4gKiBAbWVtYmVyb2YgbWFwU3R5bGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykubWFwU3R5bGVDaGFuZ2VVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgbWFwU3R5bGVDaGFuZ2VVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogc3R5bGVUeXBlfSkgPT4ge1xuICBpZiAoIXN0YXRlLm1hcFN0eWxlc1tzdHlsZVR5cGVdKSB7XG4gICAgLy8gd2UgbWlnaHQgbm90IGhhdmUgcmVjZWl2ZWQgdGhlIHN0eWxlIHlldFxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuICBjb25zdCBkZWZhdWx0TEdWaXNpYmlsaXR5ID0gZ2V0RGVmYXVsdExheWVyR3JvdXBWaXNpYmlsaXR5KHN0YXRlLm1hcFN0eWxlc1tzdHlsZVR5cGVdKTtcblxuICBjb25zdCB2aXNpYmxlTGF5ZXJHcm91cHMgPSBtZXJnZUxheWVyR3JvdXBWaXNpYmlsaXR5KFxuICAgIGRlZmF1bHRMR1Zpc2liaWxpdHksXG4gICAgc3RhdGUudmlzaWJsZUxheWVyR3JvdXBzXG4gICk7XG5cbiAgY29uc3QgdGhyZWVEQnVpbGRpbmdDb2xvciA9IHN0YXRlLmN1c3RvbTNEQnVpbGRpbmdDb2xvclxuICAgID8gc3RhdGUudGhyZWVEQnVpbGRpbmdDb2xvclxuICAgIDogZ2V0M0RCdWlsZGluZ0NvbG9yKHN0YXRlLm1hcFN0eWxlc1tzdHlsZVR5cGVdKTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIHN0eWxlVHlwZSxcbiAgICB2aXNpYmxlTGF5ZXJHcm91cHMsXG4gICAgdGhyZWVEQnVpbGRpbmdDb2xvcixcbiAgICAuLi5nZXRNYXBTdHlsZXMoe1xuICAgICAgLi4uc3RhdGUsXG4gICAgICB2aXNpYmxlTGF5ZXJHcm91cHMsXG4gICAgICBzdHlsZVR5cGVcbiAgICB9KVxuICB9O1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayB3aGVuIGxvYWQgbWFwIHN0eWxlIHN1Y2Nlc3NcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5sb2FkTWFwU3R5bGVzVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRNYXBTdHlsZXNVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgbmV3U3R5bGVzID0gYWN0aW9uLnBheWxvYWQgfHwge307XG4gIGNvbnN0IGFkZExheWVyR3JvdXBzID0gT2JqZWN0LmtleXMobmV3U3R5bGVzKS5yZWR1Y2UoXG4gICAgKGFjY3UsIGlkKSA9PiAoe1xuICAgICAgLi4uYWNjdSxcbiAgICAgIFtpZF06IHtcbiAgICAgICAgLi4ubmV3U3R5bGVzW2lkXSxcbiAgICAgICAgbGF5ZXJHcm91cHM6IG5ld1N0eWxlc1tpZF0ubGF5ZXJHcm91cHMgfHwgZ2V0TGF5ZXJHcm91cHNGcm9tU3R5bGUobmV3U3R5bGVzW2lkXS5zdHlsZSlcbiAgICAgIH1cbiAgICB9KSxcbiAgICB7fVxuICApO1xuXG4gIC8vIGFkZCBuZXcgc3R5bGVzIHRvIHN0YXRlXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIG1hcFN0eWxlczoge1xuICAgICAgLi4uc3RhdGUubWFwU3R5bGVzLFxuICAgICAgLi4uYWRkTGF5ZXJHcm91cHNcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG5ld1N0eWxlc1tzdGF0ZS5zdHlsZVR5cGVdXG4gICAgPyBtYXBTdHlsZUNoYW5nZVVwZGF0ZXIobmV3U3RhdGUsIHtwYXlsb2FkOiBzdGF0ZS5zdHlsZVR5cGV9KVxuICAgIDogbmV3U3RhdGU7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIHdoZW4gbG9hZCBtYXAgc3R5bGUgZXJyb3JcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5sb2FkTWFwU3R5bGVFcnJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG4vLyBkbyBub3RoaW5nIGZvciBub3csIGlmIGRpZG4ndCBsb2FkLCBza2lwIGl0XG5leHBvcnQgY29uc3QgbG9hZE1hcFN0eWxlRXJyVXBkYXRlciA9IHN0YXRlID0+IHN0YXRlO1xuXG4vKipcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5yZXF1ZXN0TWFwU3R5bGVzVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlcXVlc3RNYXBTdHlsZXNVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogbWFwU3R5bGVzfSkgPT4ge1xuICBjb25zdCBsb2FkTWFwU3R5bGVUYXNrcyA9IGdldExvYWRNYXBTdHlsZVRhc2tzKFxuICAgIG1hcFN0eWxlcyxcbiAgICBzdGF0ZS5tYXBib3hBcGlBY2Nlc3NUb2tlbixcbiAgICBzdGF0ZS5tYXBib3hBcGlVcmxcbiAgKTtcbiAgcmV0dXJuIHdpdGhUYXNrKHN0YXRlLCBsb2FkTWFwU3R5bGVUYXNrcyk7XG59O1xuXG4vKipcbiAqIExvYWQgbWFwIHN0eWxlIG9iamVjdCB3aGVuIHBhc3MgaW4gc2F2ZWQgbWFwIGNvbmZpZ1xuICogQG1lbWJlcm9mIG1hcFN0eWxlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgbWFwU3R5bGVgXG4gKiBAcGFyYW0gYWN0aW9uXG4gKiBAcGFyYW0gYWN0aW9uLnBheWxvYWQgc2F2ZWQgbWFwIGNvbmZpZyBge21hcFN0eWxlLCB2aXNTdGF0ZSwgbWFwU3RhdGV9YFxuICogQHJldHVybnMgbmV4dFN0YXRlIG9yIGByZWFjdC1wYW1gIHRhc2tzIHRvIGxvYWQgbWFwIHN0eWxlIG9iamVjdFxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykucmVjZWl2ZU1hcENvbmZpZ1VwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCByZWNlaXZlTWFwQ29uZmlnVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IHtjb25maWcgPSB7fX19KSA9PiB7XG4gIGNvbnN0IHttYXBTdHlsZX0gPSBjb25maWcgfHwge307XG5cbiAgaWYgKCFtYXBTdHlsZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8vIGlmIHNhdmVkIGN1c3RvbSBtYXBTdHlsZXMgbG9hZCB0aGUgc3R5bGUgb2JqZWN0XG4gIGNvbnN0IGxvYWRNYXBTdHlsZVRhc2tzID0gbWFwU3R5bGUubWFwU3R5bGVzXG4gICAgPyBnZXRMb2FkTWFwU3R5bGVUYXNrcyhtYXBTdHlsZS5tYXBTdHlsZXMsIHN0YXRlLm1hcGJveEFwaUFjY2Vzc1Rva2VuLCBzdGF0ZS5tYXBib3hBcGlVcmwpXG4gICAgOiBudWxsO1xuXG4gIC8vIG1lcmdlIGRlZmF1bHQgbWFwU3R5bGVzXG4gIGNvbnN0IG1lcmdlZCA9IG1hcFN0eWxlLm1hcFN0eWxlc1xuICAgID8ge1xuICAgICAgICAuLi5tYXBTdHlsZSxcbiAgICAgICAgbWFwU3R5bGVzOiB7XG4gICAgICAgICAgLi4ubWFwU3R5bGUubWFwU3R5bGVzLFxuICAgICAgICAgIC4uLnN0YXRlLm1hcFN0eWxlc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgOiBtYXBTdHlsZTtcblxuICAvLyBzZXQgY3VzdG9tM0RCdWlsZGluZ0NvbG9yOiB0cnVlIGlmIG1hcFN0eWxlIGNvbnRhaW5zIHRocmVlREJ1aWxkaW5nQ29sb3JcbiAgbWVyZ2VkLmN1c3RvbTNEQnVpbGRpbmdDb2xvciA9XG4gICAgQm9vbGVhbihtYXBTdHlsZS50aHJlZURCdWlsZGluZ0NvbG9yKSB8fCBtZXJnZWQuY3VzdG9tM0RCdWlsZGluZ0NvbG9yO1xuICBjb25zdCBuZXdTdGF0ZSA9IG1hcENvbmZpZ0NoYW5nZVVwZGF0ZXIoc3RhdGUsIHtwYXlsb2FkOiBtZXJnZWR9KTtcblxuICByZXR1cm4gbG9hZE1hcFN0eWxlVGFza3MgPyB3aXRoVGFzayhuZXdTdGF0ZSwgbG9hZE1hcFN0eWxlVGFza3MpIDogbmV3U3RhdGU7XG59O1xuXG5mdW5jdGlvbiBnZXRMb2FkTWFwU3R5bGVUYXNrcyhtYXBTdHlsZXMsIG1hcGJveEFwaUFjY2Vzc1Rva2VuLCBtYXBib3hBcGlVcmwpIHtcbiAgcmV0dXJuIFtcbiAgICBUYXNrLmFsbChcbiAgICAgIE9iamVjdC52YWx1ZXMobWFwU3R5bGVzKVxuICAgICAgICAubWFwKCh7aWQsIHVybCwgYWNjZXNzVG9rZW59KSA9PiAoe1xuICAgICAgICAgIGlkLFxuICAgICAgICAgIHVybDogaXNWYWxpZFN0eWxlVXJsKHVybClcbiAgICAgICAgICAgID8gZ2V0U3R5bGVEb3dubG9hZFVybCh1cmwsIGFjY2Vzc1Rva2VuIHx8IG1hcGJveEFwaUFjY2Vzc1Rva2VuLCBtYXBib3hBcGlVcmwpXG4gICAgICAgICAgICA6IHVybFxuICAgICAgICB9KSlcbiAgICAgICAgLm1hcChMT0FEX01BUF9TVFlMRV9UQVNLKVxuICAgICkuYmltYXAoXG4gICAgICAvLyBzdWNjZXNzXG4gICAgICByZXN1bHRzID0+XG4gICAgICAgIGxvYWRNYXBTdHlsZXMoXG4gICAgICAgICAgcmVzdWx0cy5yZWR1Y2UoXG4gICAgICAgICAgICAoYWNjdSwge2lkLCBzdHlsZX0pID0+ICh7XG4gICAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICAgIFtpZF06IHtcbiAgICAgICAgICAgICAgICAuLi5tYXBTdHlsZXNbaWRdLFxuICAgICAgICAgICAgICAgIHN0eWxlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAge31cbiAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAvLyBlcnJvclxuICAgICAgbG9hZE1hcFN0eWxlRXJyXG4gICAgKVxuICBdO1xufVxuLyoqXG4gKiBSZXNldCBtYXAgc3R5bGUgY29uZmlnIHRvIGluaXRpYWwgc3RhdGVcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGUgYG1hcFN0eWxlYFxuICogQHJldHVybnMgbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5yZXNldE1hcENvbmZpZ01hcFN0eWxlVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlc2V0TWFwQ29uZmlnTWFwU3R5bGVVcGRhdGVyID0gc3RhdGUgPT4ge1xuICBjb25zdCBlbXB0eUNvbmZpZyA9IHtcbiAgICAuLi5JTklUSUFMX01BUF9TVFlMRSxcbiAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogc3RhdGUubWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgbWFwYm94QXBpVXJsOiBzdGF0ZS5tYXBib3hBcGlVcmwsXG4gICAgbWFwU3R5bGVzUmVwbGFjZURlZmF1bHQ6IHN0YXRlLm1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0LFxuICAgIC4uLnN0YXRlLmluaXRpYWxTdGF0ZSxcbiAgICBtYXBTdHlsZXM6IHN0YXRlLm1hcFN0eWxlcyxcbiAgICBpbml0aWFsU3RhdGU6IHN0YXRlLmluaXRpYWxTdGF0ZVxuICB9O1xuXG4gIHJldHVybiBtYXBTdHlsZUNoYW5nZVVwZGF0ZXIoZW1wdHlDb25maWcsIHtwYXlsb2FkOiBlbXB0eUNvbmZpZy5zdHlsZVR5cGV9KTtcbn07XG5cbi8qKlxuICogQ2FsbGJhY2sgd2hlbiBhIGN1c3RvbSBtYXAgc3R5bGUgb2JqZWN0IGlzIHJlY2VpdmVkXG4gKiBAbWVtYmVyb2YgbWFwU3R5bGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vbWFwLXN0eWxlLXVwZGF0ZXJzJykubG9hZEN1c3RvbU1hcFN0eWxlVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRDdXN0b21NYXBTdHlsZVVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkOiB7aWNvbiwgc3R5bGUsIGVycm9yfX0pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBpbnB1dFN0eWxlOiB7XG4gICAgLi4uc3RhdGUuaW5wdXRTdHlsZSxcbiAgICAvLyBzdHlsZSBqc29uIGFuZCBpY29uIHdpbGwgbG9hZCBhc3luY2hyb25vdXNseVxuICAgIC4uLihzdHlsZVxuICAgICAgPyB7XG4gICAgICAgICAgaWQ6IHN0eWxlLmlkIHx8IGdlbmVyYXRlSGFzaElkKCksXG4gICAgICAgICAgLy8gbWFrZSBhIGNvcHkgb2YgdGhlIHN0eWxlIG9iamVjdFxuICAgICAgICAgIHN0eWxlOiBjbG9uZURlZXAoc3R5bGUpLFxuICAgICAgICAgIGxhYmVsOiBzdHlsZS5uYW1lLFxuICAgICAgICAgIC8vIGdhdGhlcmluZyBsYXllciBncm91cCBpbmZvIGZyb20gc3R5bGUganNvblxuICAgICAgICAgIGxheWVyR3JvdXBzOiBnZXRMYXllckdyb3Vwc0Zyb21TdHlsZShzdHlsZSlcbiAgICAgICAgfVxuICAgICAgOiB7fSksXG4gICAgLi4uKGljb24gPyB7aWNvbn0gOiB7fSksXG4gICAgLi4uKGVycm9yICE9PSB1bmRlZmluZWQgPyB7ZXJyb3J9IDoge30pXG4gIH1cbn0pO1xuXG4vKipcbiAqIElucHV0IGEgY3VzdG9tIG1hcCBzdHlsZSBvYmplY3RcbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5pbnB1dE1hcFN0eWxlVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGlucHV0TWFwU3R5bGVVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDoge2lucHV0U3R5bGUsIG1hcFN0YXRlfX0pID0+IHtcbiAgY29uc3QgdXBkYXRlZCA9IHtcbiAgICAuLi5zdGF0ZS5pbnB1dFN0eWxlLFxuICAgIC4uLmlucHV0U3R5bGVcbiAgfTtcblxuICBjb25zdCBpc1ZhbGlkID0gaXNWYWxpZFN0eWxlVXJsKHVwZGF0ZWQudXJsKTtcbiAgY29uc3QgaWNvbiA9IGlzVmFsaWRcbiAgICA/IGdldFN0eWxlSW1hZ2VJY29uKHtcbiAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgIHN0eWxlVXJsOiB1cGRhdGVkLnVybCxcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW46IHVwZGF0ZWQuYWNjZXNzVG9rZW4gfHwgc3RhdGUubWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybDogc3RhdGUubWFwYm94QXBpVXJsIHx8IERFRkFVTFRfTUFQQk9YX0FQSV9VUkxcbiAgICAgIH0pXG4gICAgOiBzdGF0ZS5pbnB1dFN0eWxlLmljb247XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBpbnB1dFN0eWxlOiB7XG4gICAgICAuLi51cGRhdGVkLFxuICAgICAgaXNWYWxpZCxcbiAgICAgIGljb25cbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIEFkZCBtYXAgc3R5bGUgZnJvbSB1c2VyIGlucHV0IHRvIHJlZHVjZXIgYW5kIHNldCBpdCB0byBjdXJyZW50IHN0eWxlXG4gKiBUaGlzIGFjdGlvbiBpcyBjYWxsZWQgd2hlbiB1c2VyIGNsaWNrIGNvbmZpcm0gYWZ0ZXIgcHV0dGluZyBpbiBhIHZhbGlkIHN0eWxlIHVybCBpbiB0aGUgY3VzdG9tIG1hcCBzdHlsZSBkaWFsb2cuXG4gKiBJdCBzaG91bGQgbm90IGJlIGNhbGxlZCBmcm9tIG91dHNpZGUga2VwbGVyLmdsIHdpdGhvdXQgYSB2YWxpZCBgaW5wdXRTdHlsZWAgaW4gdGhlIGBtYXBTdHlsZWAgcmVkdWNlci5cbiAqIEBtZW1iZXJvZiBtYXBTdHlsZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9tYXAtc3R5bGUtdXBkYXRlcnMnKS5hZGRDdXN0b21NYXBTdHlsZVVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBhZGRDdXN0b21NYXBTdHlsZVVwZGF0ZXIgPSBzdGF0ZSA9PiB7XG4gIGNvbnN0IHN0eWxlSWQgPSBzdGF0ZS5pbnB1dFN0eWxlLmlkO1xuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBtYXBTdHlsZXM6IHtcbiAgICAgIC4uLnN0YXRlLm1hcFN0eWxlcyxcbiAgICAgIFtzdHlsZUlkXTogc3RhdGUuaW5wdXRTdHlsZVxuICAgIH0sXG4gICAgLy8gc2V0IHRvIGRlZmF1bHRcbiAgICBpbnB1dFN0eWxlOiBnZXRJbml0aWFsSW5wdXRTdHlsZSgpXG4gIH07XG4gIC8vIHNldCBuZXcgc3R5bGVcbiAgcmV0dXJuIG1hcFN0eWxlQ2hhbmdlVXBkYXRlcihuZXdTdGF0ZSwge3BheWxvYWQ6IHN0eWxlSWR9KTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyAzZCBidWlsZGluZyBjb2xvclxuICogQG1lbWJlcm9mIG1hcFN0eWxlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL21hcC1zdHlsZS11cGRhdGVycycpLnNldDNkQnVpbGRpbmdDb2xvclVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBzZXQzZEJ1aWxkaW5nQ29sb3JVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogY29sb3J9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgdGhyZWVEQnVpbGRpbmdDb2xvcjogY29sb3IsXG4gIGN1c3RvbTNEQnVpbGRpbmdDb2xvcjogdHJ1ZVxufSk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBpbml0aWFsIGlucHV0IHN0eWxlXG4gKiBAcmV0dXJuIE9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdGlhbElucHV0U3R5bGUoKSB7XG4gIHJldHVybiB7XG4gICAgYWNjZXNzVG9rZW46IG51bGwsXG4gICAgZXJyb3I6IGZhbHNlLFxuICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgIGxhYmVsOiBudWxsLFxuICAgIHN0eWxlOiBudWxsLFxuICAgIHVybDogbnVsbCxcbiAgICBpY29uOiBudWxsLFxuICAgIGN1c3RvbTogdHJ1ZVxuICB9O1xufVxuIl19