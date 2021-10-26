"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateStateOnLayerVisibilityChange = updateStateOnLayerVisibilityChange;
exports.layerConfigChangeUpdater = layerConfigChangeUpdater;
exports.layerTextLabelChangeUpdater = layerTextLabelChangeUpdater;
exports.layerTypeChangeUpdater = layerTypeChangeUpdater;
exports.layerVisualChannelChangeUpdater = layerVisualChannelChangeUpdater;
exports.layerVisConfigChangeUpdater = layerVisConfigChangeUpdater;
exports.setFilterUpdater = setFilterUpdater;
exports.interactionConfigChangeUpdater = interactionConfigChangeUpdater;
exports.loadFileStepSuccessUpdater = loadFileStepSuccessUpdater;
exports.loadNextFileUpdater = loadNextFileUpdater;
exports.makeLoadFileTask = makeLoadFileTask;
exports.processFileContentUpdater = processFileContentUpdater;
exports.parseProgress = parseProgress;
exports.addDefaultLayers = addDefaultLayers;
exports.addDefaultTooltips = addDefaultTooltips;
exports.initialFileLoadingProgress = initialFileLoadingProgress;
exports.updateFileLoadingProgressUpdater = updateFileLoadingProgressUpdater;
exports.updateAllLayerDomainData = updateAllLayerDomainData;
exports.updateAnimationDomain = updateAnimationDomain;
exports.setFeaturesUpdater = setFeaturesUpdater;
exports.deleteFeatureUpdater = deleteFeatureUpdater;
exports.setPolygonFilterLayerUpdater = setPolygonFilterLayerUpdater;
exports.sortTableColumnUpdater = sortTableColumnUpdater;
exports.pinTableColumnUpdater = pinTableColumnUpdater;
exports.copyTableColumnUpdater = copyTableColumnUpdater;
exports.toggleEditorVisibilityUpdater = toggleEditorVisibilityUpdater;
exports.setSelectedFeatureUpdater = exports.setEditorModeUpdater = exports.setMapInfoUpdater = exports.applyCPUFilterUpdater = exports.loadFilesErrUpdater = exports.nextFileBatchUpdater = exports.loadFilesUpdater = exports.updateVisDataUpdater = exports.toggleLayerForMapUpdater = exports.toggleSplitMapUpdater = exports.mouseMoveUpdater = exports.mapClickUpdater = exports.layerClickUpdater = exports.layerHoverUpdater = exports.receiveMapConfigUpdater = exports.resetMapConfigUpdater = exports.showDatasetTableUpdater = exports.updateLayerBlendingUpdater = exports.removeDatasetUpdater = exports.reorderLayerUpdater = exports.removeLayerUpdater = exports.addLayerUpdater = exports.removeFilterUpdater = exports.toggleFilterFeatureUpdater = exports.enlargeFilterUpdater = exports.updateLayerAnimationSpeedUpdater = exports.updateAnimationTimeUpdater = exports.updateFilterAnimationSpeedUpdater = exports.toggleFilterAnimationUpdater = exports.layerColorUIChangeUpdater = exports.addFilterUpdater = exports.setFilterPlotUpdater = exports.INITIAL_VIS_STATE = exports.DEFAULT_EDITOR = exports.DEFAULT_ANIMATION_CONFIG = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _window = require("global/window");

var _tasks = require("react-palm/tasks");

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _lodash2 = _interopRequireDefault(require("lodash.uniq"));

var _lodash3 = _interopRequireDefault(require("lodash.get"));

var _lodash4 = _interopRequireDefault(require("lodash.xor"));

var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));

var _dataUtils = require("../utils/data-utils");

var _tasks2 = require("../tasks/tasks");

var _visStateActions = require("../actions/vis-state-actions");

var _interactionUtils = require("../utils/interaction-utils");

var _filterUtils = require("../utils/filter-utils");

var _gpuFilterUtils = require("../utils/gpu-filter-utils");

var _datasetUtils = require("../utils/dataset-utils");

var _utils = require("../utils/utils");

var _layerUtils = require("../utils/layer-utils");

var _visStateMerger = require("./vis-state-merger");

var _splitMapUtils = require("../utils/split-map-utils");

var _layers = require("../layers");

var _layerFactory = require("../layers/layer-factory");

var _defaultSettings = require("../constants/default-settings");

var _composerHelpers = require("./composer-helpers");

var _schemas = _interopRequireDefault(require("../schemas"));

var _actionWrapper = require("../actions/action-wrapper");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return (0, _typeof2["default"])(key) === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if ((0, _typeof2["default"])(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if ((0, _typeof2["default"])(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// type imports

/** @typedef {import('./vis-state-updaters').Field} Field */

/** @typedef {import('./vis-state-updaters').Filter} Filter */

/** @typedef {import('./vis-state-updaters').Dataset} Dataset */

/** @typedef {import('./vis-state-updaters').VisState} VisState */

/** @typedef {import('./vis-state-updaters').Datasets} Datasets */

/** @typedef {import('./vis-state-updaters').AnimationConfig} AnimationConfig */

/** @typedef {import('./vis-state-updaters').Editor} Editor */
// react-palm
// disable capture exception for react-palm call to withTask
(0, _tasks.disableStackCapturing)();
/**
 * Updaters for `visState` reducer. Can be used in your root reducer to directly modify kepler.gl's state.
 * Read more about [Using updaters](../advanced-usage/using-updaters.md)
 *
 * @public
 * @example
 *
 * import keplerGlReducer, {visStateUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    case 'CLICK_BUTTON':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          foo: {
 *             ...state.keplerGl.foo,
 *             visState: visStateUpdaters.enlargeFilterUpdater(
 *               state.keplerGl.foo.visState,
 *               {idx: 0}
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
// @ts-ignore

var visStateUpdaters = null;
/* eslint-enable no-unused-vars */

/** @type {AnimationConfig} */

var DEFAULT_ANIMATION_CONFIG = {
  domain: null,
  currentTime: null,
  speed: 1
};
/** @type {Editor} */

exports.DEFAULT_ANIMATION_CONFIG = DEFAULT_ANIMATION_CONFIG;
var DEFAULT_EDITOR = {
  mode: _defaultSettings.EDITOR_MODES.DRAW_POLYGON,
  features: [],
  selectedFeature: null,
  visible: true
};
/**
 * Default initial `visState`
 * @memberof visStateUpdaters
 * @constant
 * @type {VisState}
 * @public
 */

exports.DEFAULT_EDITOR = DEFAULT_EDITOR;
var INITIAL_VIS_STATE = {
  // map info
  mapInfo: {
    title: '',
    description: ''
  },
  // layers
  layers: [],
  layerData: [],
  layerToBeMerged: [],
  layerOrder: [],
  // filters
  filters: [],
  filterToBeMerged: [],
  // a collection of multiple dataset
  datasets: {},
  editingDataset: undefined,
  interactionConfig: (0, _interactionUtils.getDefaultInteraction)(),
  interactionToBeMerged: undefined,
  layerBlending: 'normal',
  hoverInfo: undefined,
  clicked: undefined,
  mousePos: {},
  // this is used when user split maps
  splitMaps: [// this will contain a list of objects to
    // describe the state of layer availability and visibility for each map
    // [
    //   {
    //      layers: {layer_id: true | false}
    //   }
    // ]
  ],
  splitMapsToBeMerged: [],
  // defaults layer classes
  layerClasses: _layers.LayerClasses,
  // default animation
  // time in unix timestamp (milliseconds) (the number of seconds since the Unix Epoch)
  animationConfig: DEFAULT_ANIMATION_CONFIG,
  editor: DEFAULT_EDITOR,
  fileLoading: false,
  fileLoadingProgress: {},
  loaders: [],
  loadOptions: {},
  // visStateMergers
  mergers: _visStateMerger.VIS_STATE_MERGERS,
  schema: _schemas["default"]
};
/**
 * Update state with updated layer and layerData
 * @type {typeof import('./vis-state-updaters').updateStateWithLayerAndData}
 *
 */

exports.INITIAL_VIS_STATE = INITIAL_VIS_STATE;

function updateStateWithLayerAndData(state, _ref) {
  var layerData = _ref.layerData,
      layer = _ref.layer,
      idx = _ref.idx;
  return _objectSpread(_objectSpread({}, state), {}, {
    layers: state.layers.map(function (lyr, i) {
      return i === idx ? layer : lyr;
    }),
    layerData: layerData ? state.layerData.map(function (d, i) {
      return i === idx ? layerData : d;
    }) : state.layerData
  });
}

function updateStateOnLayerVisibilityChange(state, layer) {
  var newState = state;

  if (state.splitMaps.length) {
    newState = _objectSpread(_objectSpread({}, state), {}, {
      splitMaps: layer.config.isVisible ? (0, _splitMapUtils.addNewLayersToSplitMap)(state.splitMaps, layer) : (0, _splitMapUtils.removeLayerFromSplitMaps)(state.splitMaps, layer)
    });
  }

  if (layer.config.animation.enabled) {
    newState = updateAnimationDomain(state);
  }

  return newState;
}
/**
 * Update layer base config: dataId, label, column, isVisible
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerConfigChangeUpdater}
 * @returns nextState
 */


function layerConfigChangeUpdater(state, action) {
  var oldLayer = action.oldLayer;
  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var props = Object.keys(action.newConfig);
  var newLayer = oldLayer.updateLayerConfig(action.newConfig);
  var layerData; // let newLayer;

  if (newLayer.shouldCalculateLayerData(props)) {
    var oldLayerData = state.layerData[idx];
    var updateLayerDataResult = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData);
    layerData = updateLayerDataResult.layerData;
    newLayer = updateLayerDataResult.layer;
  }

  var newState = state;

  if ('isVisible' in action.newConfig) {
    newState = updateStateOnLayerVisibilityChange(state, newLayer);
  }

  return updateStateWithLayerAndData(newState, {
    layer: newLayer,
    layerData: layerData,
    idx: idx
  });
}

function addOrRemoveTextLabels(newFields, textLabel) {
  var newTextLabel = textLabel.slice();
  var currentFields = textLabel.map(function (tl) {
    return tl.field && tl.field.name;
  }).filter(function (d) {
    return d;
  });
  var addFields = newFields.filter(function (f) {
    return !currentFields.includes(f.name);
  });
  var deleteFields = currentFields.filter(function (f) {
    return !newFields.find(function (fd) {
      return fd.name === f;
    });
  }); // delete

  newTextLabel = newTextLabel.filter(function (tl) {
    return tl.field && !deleteFields.includes(tl.field.name);
  });
  newTextLabel = !newTextLabel.length ? [_layerFactory.DEFAULT_TEXT_LABEL] : newTextLabel; // add

  newTextLabel = [].concat((0, _toConsumableArray2["default"])(newTextLabel.filter(function (tl) {
    return tl.field;
  })), (0, _toConsumableArray2["default"])(addFields.map(function (af) {
    return _objectSpread(_objectSpread({}, _layerFactory.DEFAULT_TEXT_LABEL), {}, {
      field: af
    });
  })));
  return newTextLabel;
}

function updateTextLabelPropAndValue(idx, prop, value, textLabel) {
  if (!textLabel[idx].hasOwnProperty(prop)) {
    return textLabel;
  }

  var newTextLabel = textLabel.slice();

  if (prop && (value || textLabel.length === 1)) {
    newTextLabel = textLabel.map(function (tl, i) {
      return i === idx ? _objectSpread(_objectSpread({}, tl), {}, (0, _defineProperty2["default"])({}, prop, value)) : tl;
    });
  } else if (prop === 'field' && value === null && textLabel.length > 1) {
    // remove label when field value is set to null
    newTextLabel.splice(idx, 1);
  }

  return newTextLabel;
}
/**
 * Update layer base config: dataId, label, column, isVisible
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerTextLabelChangeUpdater}
 * @returns nextState
 */


function layerTextLabelChangeUpdater(state, action) {
  var oldLayer = action.oldLayer,
      idx = action.idx,
      prop = action.prop,
      value = action.value;
  var textLabel = oldLayer.config.textLabel;
  var newTextLabel = textLabel.slice();

  if (!textLabel[idx] && idx === textLabel.length) {
    // if idx is set to length, add empty text label
    newTextLabel = [].concat((0, _toConsumableArray2["default"])(textLabel), [_layerFactory.DEFAULT_TEXT_LABEL]);
  }

  if (idx === 'all' && prop === 'fields') {
    newTextLabel = addOrRemoveTextLabels(value, textLabel);
  } else {
    newTextLabel = updateTextLabelPropAndValue(idx, prop, value, newTextLabel);
  } // update text label prop and value


  return layerConfigChangeUpdater(state, {
    oldLayer: oldLayer,
    newConfig: {
      textLabel: newTextLabel
    }
  });
}
/**
 * Update layer type. Previews layer config will be copied if applicable.
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerTypeChangeUpdater}
 * @public
 */


function layerTypeChangeUpdater(state, action) {
  var oldLayer = action.oldLayer,
      newType = action.newType;

  if (!oldLayer) {
    return state;
  }

  var oldId = oldLayer.id;
  var idx = state.layers.findIndex(function (l) {
    return l.id === oldId;
  });

  if (!state.layerClasses[newType]) {
    _window.console.error("".concat(newType, " is not a valid layer type"));

    return state;
  } // get a mint layer, with new id and type
  // because deck.gl uses id to match between new and old layer.
  // If type has changed but id is the same, it will break


  var newLayer = new state.layerClasses[newType]();
  newLayer.assignConfigToLayer(oldLayer.config, oldLayer.visConfigSettings); // if (newLayer.config.dataId) {
  //   const dataset = state.datasets[newLayer.config.dataId];
  //   newLayer.updateLayerDomain(dataset);
  // }

  newLayer.updateLayerDomain(state.datasets);

  var _calculateLayerData = (0, _layerUtils.calculateLayerData)(newLayer, state),
      layerData = _calculateLayerData.layerData,
      layer = _calculateLayerData.layer;

  var newState = updateStateWithLayerAndData(state, {
    layerData: layerData,
    layer: layer,
    idx: idx
  });

  if (layer.config.animation.enabled || oldLayer.config.animation.enabled) {
    newState = updateAnimationDomain(newState);
  } // update splitMap layer id


  if (state.splitMaps.length) {
    newState = _objectSpread(_objectSpread({}, newState), {}, {
      splitMaps: newState.splitMaps.map(function (settings) {
        var _settings$layers = settings.layers,
            oldLayerMap = _settings$layers[oldId],
            otherLayers = (0, _objectWithoutProperties2["default"])(_settings$layers, [oldId].map(_toPropertyKey));
        return oldId in settings.layers ? _objectSpread(_objectSpread({}, settings), {}, {
          layers: _objectSpread(_objectSpread({}, otherLayers), {}, (0, _defineProperty2["default"])({}, layer.id, oldLayerMap))
        }) : settings;
      })
    });
  }

  return newState;
}
/**
 * Update layer visual channel
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerVisualChannelChangeUpdater}
 * @returns {Object} nextState
 * @public
 */


function layerVisualChannelChangeUpdater(state, action) {
  var oldLayer = action.oldLayer,
      newConfig = action.newConfig,
      channel = action.channel;

  if (!oldLayer.config.dataId) {
    return state;
  }

  var dataset = state.datasets[oldLayer.config.dataId];
  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var newLayer = oldLayer.updateLayerConfig(newConfig);
  newLayer.updateLayerVisualChannel(dataset, channel);
  var oldLayerData = state.layerData[idx];

  var _calculateLayerData2 = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData),
      layerData = _calculateLayerData2.layerData,
      layer = _calculateLayerData2.layer;

  return updateStateWithLayerAndData(state, {
    layerData: layerData,
    layer: layer,
    idx: idx
  });
}
/**
 * Update layer `visConfig`
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerVisConfigChangeUpdater}
 * @public
 */


function layerVisConfigChangeUpdater(state, action) {
  var oldLayer = action.oldLayer;
  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var props = Object.keys(action.newVisConfig);

  var newVisConfig = _objectSpread(_objectSpread({}, oldLayer.config.visConfig), action.newVisConfig);

  var newLayer = oldLayer.updateLayerConfig({
    visConfig: newVisConfig
  });

  if (newLayer.shouldCalculateLayerData(props)) {
    var oldLayerData = state.layerData[idx];

    var _calculateLayerData3 = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData),
        layerData = _calculateLayerData3.layerData,
        layer = _calculateLayerData3.layer;

    return updateStateWithLayerAndData(state, {
      layerData: layerData,
      layer: layer,
      idx: idx
    });
  }

  return updateStateWithLayerAndData(state, {
    layer: newLayer,
    idx: idx
  });
}
/**
 * Update filter property
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setFilterUpdater}
 * @public
 */


function setFilterUpdater(state, action) {
  var idx = action.idx,
      prop = action.prop,
      value = action.value,
      _action$valueIndex = action.valueIndex,
      valueIndex = _action$valueIndex === void 0 ? 0 : _action$valueIndex;
  var oldFilter = state.filters[idx];
  var newFilter = (0, _utils.set)([prop], value, oldFilter);
  var newState = state;
  var _newFilter = newFilter,
      dataId = _newFilter.dataId; // Ensuring backward compatibility

  var datasetIds = (0, _utils.toArray)(dataId);

  switch (prop) {
    // TODO: Next PR for UI if we update dataId, we need to consider two cases:
    // 1. dataId is empty: create a default filter
    // 2. Add a new dataset id
    case _filterUtils.FILTER_UPDATER_PROPS.dataId:
      // if trying to update filter dataId. create an empty new filter
      newFilter = (0, _filterUtils.updateFilterDataId)(dataId);
      break;

    case _filterUtils.FILTER_UPDATER_PROPS.name:
      // we are supporting the current functionality
      // TODO: Next PR for UI filter name will only update filter name but it won't have side effects
      // we are gonna use pair of datasets and fieldIdx to update the filter
      var datasetId = newFilter.dataId[valueIndex];

      var _applyFilterFieldName = (0, _filterUtils.applyFilterFieldName)(newFilter, state.datasets[datasetId], value, valueIndex, {
        mergeDomain: false
      }),
          updatedFilter = _applyFilterFieldName.filter,
          newDataset = _applyFilterFieldName.dataset;

      if (!updatedFilter) {
        return state;
      }

      newFilter = updatedFilter;

      if (newFilter.gpu) {
        newFilter = (0, _gpuFilterUtils.setFilterGpuMode)(newFilter, state.filters);
        newFilter = (0, _gpuFilterUtils.assignGpuChannel)(newFilter, state.filters);
      }

      newState = (0, _utils.set)(['datasets', datasetId], newDataset, state); // only filter the current dataset

      break;

    case _filterUtils.FILTER_UPDATER_PROPS.layerId:
      // We need to update only datasetId/s if we have added/removed layers
      // - check for layerId changes (XOR works because of string values)
      // if no differences between layerIds, don't do any filtering
      // @ts-ignore
      var layerIdDifference = (0, _lodash4["default"])(newFilter.layerId, oldFilter.layerId);
      var layerDataIds = (0, _lodash2["default"])(layerIdDifference.map(function (lid) {
        return (0, _lodash3["default"])(state.layers.find(function (l) {
          return l.id === lid;
        }), ['config', 'dataId']);
      }).filter(function (d) {
        return d;
      })); // only filter datasetsIds

      datasetIds = layerDataIds; // Update newFilter dataIds

      var newDataIds = (0, _lodash2["default"])(newFilter.layerId.map(function (lid) {
        return (0, _lodash3["default"])(state.layers.find(function (l) {
          return l.id === lid;
        }), ['config', 'dataId']);
      }).filter(function (d) {
        return d;
      }));
      newFilter = _objectSpread(_objectSpread({}, newFilter), {}, {
        dataId: newDataIds
      });
      break;

    default:
      break;
  }

  var enlargedFilter = state.filters.find(function (f) {
    return f.enlarged;
  });

  if (enlargedFilter && enlargedFilter.id !== newFilter.id) {
    // there should be only one enlarged filter
    newFilter.enlarged = false;
  } // save new filters to newState


  newState = (0, _utils.set)(['filters', idx], newFilter, newState); // if we are currently setting a prop that only requires to filter the current
  // dataset we will pass only the current dataset to applyFiltersToDatasets and
  // updateAllLayerDomainData otherwise we pass the all list of datasets as defined in dataId

  var datasetIdsToFilter = _filterUtils.LIMITED_FILTER_EFFECT_PROPS[prop] ? [datasetIds[valueIndex]] : datasetIds; // filter data

  var filteredDatasets = (0, _filterUtils.applyFiltersToDatasets)(datasetIdsToFilter, newState.datasets, newState.filters, newState.layers);
  newState = (0, _utils.set)(['datasets'], filteredDatasets, newState); // dataId is an array
  // pass only the dataset we need to update

  newState = updateAllLayerDomainData(newState, datasetIdsToFilter, newFilter);
  return newState;
}
/**
 * Set the property of a filter plot
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setFilterPlotUpdater}
 * @public
 */


var setFilterPlotUpdater = function setFilterPlotUpdater(state, _ref2) {
  var idx = _ref2.idx,
      newProp = _ref2.newProp,
      _ref2$valueIndex = _ref2.valueIndex,
      valueIndex = _ref2$valueIndex === void 0 ? 0 : _ref2$valueIndex;

  var newFilter = _objectSpread(_objectSpread({}, state.filters[idx]), newProp);

  var prop = Object.keys(newProp)[0];

  if (prop === 'yAxis') {
    var plotType = (0, _filterUtils.getDefaultFilterPlotType)(newFilter); // TODO: plot is not supported in multi dataset filter for now

    if (plotType) {
      newFilter = _objectSpread(_objectSpread(_objectSpread({}, newFilter), (0, _filterUtils.getFilterPlot)(_objectSpread(_objectSpread({}, newFilter), {}, {
        plotType: plotType
      }), state.datasets[newFilter.dataId[valueIndex]].allData)), {}, {
        plotType: plotType
      });
    }
  }

  return _objectSpread(_objectSpread({}, state), {}, {
    filters: state.filters.map(function (f, i) {
      return i === idx ? newFilter : f;
    })
  });
};
/**
 * Add a new filter
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').addFilterUpdater}
 * @public
 */


exports.setFilterPlotUpdater = setFilterPlotUpdater;

var addFilterUpdater = function addFilterUpdater(state, action) {
  return !action.dataId ? state : _objectSpread(_objectSpread({}, state), {}, {
    filters: [].concat((0, _toConsumableArray2["default"])(state.filters), [(0, _filterUtils.getDefaultFilter)(action.dataId)])
  });
};
/**
 * Set layer color palette ui state
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerColorUIChangeUpdater}
 */


exports.addFilterUpdater = addFilterUpdater;

var layerColorUIChangeUpdater = function layerColorUIChangeUpdater(state, _ref3) {
  var oldLayer = _ref3.oldLayer,
      prop = _ref3.prop,
      newConfig = _ref3.newConfig;
  var newLayer = oldLayer.updateLayerColorUI(prop, newConfig);
  return _objectSpread(_objectSpread({}, state), {}, {
    layers: state.layers.map(function (l) {
      return l.id === oldLayer.id ? newLayer : l;
    })
  });
};
/**
 * Start and end filter animation
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').toggleFilterAnimationUpdater}
 * @public
 */


exports.layerColorUIChangeUpdater = layerColorUIChangeUpdater;

var toggleFilterAnimationUpdater = function toggleFilterAnimationUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    filters: state.filters.map(function (f, i) {
      return i === action.idx ? _objectSpread(_objectSpread({}, f), {}, {
        isAnimating: !f.isAnimating
      }) : f;
    })
  });
};
/**
 * Change filter animation speed
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').updateFilterAnimationSpeedUpdater}
 * @public
 */


exports.toggleFilterAnimationUpdater = toggleFilterAnimationUpdater;

var updateFilterAnimationSpeedUpdater = function updateFilterAnimationSpeedUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    filters: state.filters.map(function (f, i) {
      return i === action.idx ? _objectSpread(_objectSpread({}, f), {}, {
        speed: action.speed
      }) : f;
    })
  });
};
/**
 * Reset animation config current time to a specified value
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').updateAnimationTimeUpdater}
 * @public
 *
 */


exports.updateFilterAnimationSpeedUpdater = updateFilterAnimationSpeedUpdater;

var updateAnimationTimeUpdater = function updateAnimationTimeUpdater(state, _ref4) {
  var value = _ref4.value;
  return _objectSpread(_objectSpread({}, state), {}, {
    animationConfig: _objectSpread(_objectSpread({}, state.animationConfig), {}, {
      currentTime: value
    })
  });
};
/**
 * Update animation speed with the vertical speed slider
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').updateLayerAnimationSpeedUpdater}
 * @public
 *
 */


exports.updateAnimationTimeUpdater = updateAnimationTimeUpdater;

var updateLayerAnimationSpeedUpdater = function updateLayerAnimationSpeedUpdater(state, _ref5) {
  var speed = _ref5.speed;
  return _objectSpread(_objectSpread({}, state), {}, {
    animationConfig: _objectSpread(_objectSpread({}, state.animationConfig), {}, {
      speed: speed
    })
  });
};
/**
 * Show larger time filter at bottom for time playback (apply to time filter only)
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').enlargeFilterUpdater}
 * @public
 */


exports.updateLayerAnimationSpeedUpdater = updateLayerAnimationSpeedUpdater;

var enlargeFilterUpdater = function enlargeFilterUpdater(state, action) {
  var isEnlarged = state.filters[action.idx].enlarged;
  return _objectSpread(_objectSpread({}, state), {}, {
    filters: state.filters.map(function (f, i) {
      f.enlarged = !isEnlarged && i === action.idx;
      return f;
    })
  });
};
/**
 * Toggles filter feature visibility
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').toggleFilterFeatureUpdater}
 */


exports.enlargeFilterUpdater = enlargeFilterUpdater;

var toggleFilterFeatureUpdater = function toggleFilterFeatureUpdater(state, action) {
  var filter = state.filters[action.idx];
  var isVisible = (0, _lodash3["default"])(filter, ['value', 'properties', 'isVisible']);

  var newFilter = _objectSpread(_objectSpread({}, filter), {}, {
    value: (0, _filterUtils.featureToFilterValue)(filter.value, filter.id, {
      isVisible: !isVisible
    })
  });

  return _objectSpread(_objectSpread({}, state), {}, {
    filters: Object.assign((0, _toConsumableArray2["default"])(state.filters), (0, _defineProperty2["default"])({}, action.idx, newFilter))
  });
};
/**
 * Remove a filter
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').removeFilterUpdater}
 * @public
 */


exports.toggleFilterFeatureUpdater = toggleFilterFeatureUpdater;

var removeFilterUpdater = function removeFilterUpdater(state, action) {
  var idx = action.idx;
  var _state$filters$idx = state.filters[idx],
      dataId = _state$filters$idx.dataId,
      id = _state$filters$idx.id;
  var newFilters = [].concat((0, _toConsumableArray2["default"])(state.filters.slice(0, idx)), (0, _toConsumableArray2["default"])(state.filters.slice(idx + 1, state.filters.length)));
  var filteredDatasets = (0, _filterUtils.applyFiltersToDatasets)(dataId, state.datasets, newFilters, state.layers);
  var newEditor = (0, _filterUtils.getFilterIdInFeature)(state.editor.selectedFeature) === id ? _objectSpread(_objectSpread({}, state.editor), {}, {
    selectedFeature: null
  }) : state.editor;
  var newState = (0, _utils.set)(['filters'], newFilters, state);
  newState = (0, _utils.set)(['datasets'], filteredDatasets, newState);
  newState = (0, _utils.set)(['editor'], newEditor, newState);
  return updateAllLayerDomainData(newState, dataId, undefined);
};
/**
 * Add a new layer
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').addLayerUpdater}
 * @public
 */


exports.removeFilterUpdater = removeFilterUpdater;

var addLayerUpdater = function addLayerUpdater(state, action) {
  var defaultDataset = Object.keys(state.datasets)[0];
  var newLayer = new _layers.Layer(_objectSpread({
    isVisible: true,
    isConfigActive: true,
    dataId: defaultDataset
  }, action.props));
  return _objectSpread(_objectSpread({}, state), {}, {
    layers: [].concat((0, _toConsumableArray2["default"])(state.layers), [newLayer]),
    layerData: [].concat((0, _toConsumableArray2["default"])(state.layerData), [{}]),
    layerOrder: [].concat((0, _toConsumableArray2["default"])(state.layerOrder), [state.layerOrder.length]),
    splitMaps: (0, _splitMapUtils.addNewLayersToSplitMap)(state.splitMaps, newLayer)
  });
};
/**
 * remove layer
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').removeLayerUpdater}
 * @public
 */


exports.addLayerUpdater = addLayerUpdater;

var removeLayerUpdater = function removeLayerUpdater(state, _ref6) {
  var idx = _ref6.idx;
  var layers = state.layers,
      layerData = state.layerData,
      clicked = state.clicked,
      hoverInfo = state.hoverInfo;
  var layerToRemove = state.layers[idx];
  var newMaps = (0, _splitMapUtils.removeLayerFromSplitMaps)(state.splitMaps, layerToRemove);

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    layers: [].concat((0, _toConsumableArray2["default"])(layers.slice(0, idx)), (0, _toConsumableArray2["default"])(layers.slice(idx + 1, layers.length))),
    layerData: [].concat((0, _toConsumableArray2["default"])(layerData.slice(0, idx)), (0, _toConsumableArray2["default"])(layerData.slice(idx + 1, layerData.length))),
    layerOrder: state.layerOrder.filter(function (i) {
      return i !== idx;
    }).map(function (pid) {
      return pid > idx ? pid - 1 : pid;
    }),
    clicked: layerToRemove.isLayerHovered(clicked) ? undefined : clicked,
    hoverInfo: layerToRemove.isLayerHovered(hoverInfo) ? undefined : hoverInfo,
    splitMaps: newMaps // TODO: update filters, create helper to remove layer form filter (remove layerid and dataid) if mapped

  });

  return updateAnimationDomain(newState);
};
/**
 * Reorder layer
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').reorderLayerUpdater}
 * @public
 */


exports.removeLayerUpdater = removeLayerUpdater;

var reorderLayerUpdater = function reorderLayerUpdater(state, _ref7) {
  var order = _ref7.order;
  return _objectSpread(_objectSpread({}, state), {}, {
    layerOrder: order
  });
};
/**
 * Remove a dataset and all layers, filters, tooltip configs that based on it
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').removeDatasetUpdater}
 * @public
 */


exports.reorderLayerUpdater = reorderLayerUpdater;

var removeDatasetUpdater = function removeDatasetUpdater(state, action) {
  // extract dataset key
  var datasetKey = action.dataId;
  var datasets = state.datasets; // check if dataset is present

  if (!datasets[datasetKey]) {
    return state;
  }
  /* eslint-disable no-unused-vars */


  var layers = state.layers,
      _state$datasets = state.datasets,
      dataset = _state$datasets[datasetKey],
      newDatasets = (0, _objectWithoutProperties2["default"])(_state$datasets, [datasetKey].map(_toPropertyKey));
  /* eslint-enable no-unused-vars */

  var indexes = layers.reduce(function (listOfIndexes, layer, index) {
    if (layer.config.dataId === datasetKey) {
      listOfIndexes.push(index);
    }

    return listOfIndexes;
  }, []); // remove layers and datasets

  var _indexes$reduce = indexes.reduce(function (_ref8, idx) {
    var currentState = _ref8.newState,
        indexCounter = _ref8.indexCounter;
    var currentIndex = idx - indexCounter;
    currentState = removeLayerUpdater(currentState, {
      idx: currentIndex
    });
    indexCounter++;
    return {
      newState: currentState,
      indexCounter: indexCounter
    };
  }, {
    newState: _objectSpread(_objectSpread({}, state), {}, {
      datasets: newDatasets
    }),
    indexCounter: 0
  }),
      newState = _indexes$reduce.newState; // remove filters


  var filters = state.filters.filter(function (filter) {
    return !filter.dataId.includes(datasetKey);
  }); // update interactionConfig

  var interactionConfig = state.interactionConfig;
  var _interactionConfig = interactionConfig,
      tooltip = _interactionConfig.tooltip;

  if (tooltip) {
    var config = tooltip.config;
    /* eslint-disable no-unused-vars */

    var _config$fieldsToShow = config.fieldsToShow,
        fields = _config$fieldsToShow[datasetKey],
        fieldsToShow = (0, _objectWithoutProperties2["default"])(_config$fieldsToShow, [datasetKey].map(_toPropertyKey));
    /* eslint-enable no-unused-vars */

    interactionConfig = _objectSpread(_objectSpread({}, interactionConfig), {}, {
      tooltip: _objectSpread(_objectSpread({}, tooltip), {}, {
        config: _objectSpread(_objectSpread({}, config), {}, {
          fieldsToShow: fieldsToShow
        })
      })
    });
  }

  return _objectSpread(_objectSpread({}, newState), {}, {
    filters: filters,
    interactionConfig: interactionConfig
  });
};
/**
 * update layer blending mode
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').updateLayerBlendingUpdater}
 * @public
 */


exports.removeDatasetUpdater = removeDatasetUpdater;

var updateLayerBlendingUpdater = function updateLayerBlendingUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    layerBlending: action.mode
  });
};
/**
 * Display dataset table in a modal
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').showDatasetTableUpdater}
 * @public
 */


exports.updateLayerBlendingUpdater = updateLayerBlendingUpdater;

var showDatasetTableUpdater = function showDatasetTableUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    editingDataset: action.dataId
  });
};
/**
 * reset visState to initial State
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').resetMapConfigUpdater}
 * @public
 */


exports.showDatasetTableUpdater = showDatasetTableUpdater;

var resetMapConfigUpdater = function resetMapConfigUpdater(state) {
  return _objectSpread(_objectSpread(_objectSpread({}, INITIAL_VIS_STATE), state.initialState), {}, {
    initialState: state.initialState
  });
};
/**
 * Propagate `visState` reducer with a new configuration. Current config will be override.
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').receiveMapConfigUpdater}
 * @public
 */


exports.resetMapConfigUpdater = resetMapConfigUpdater;

var receiveMapConfigUpdater = function receiveMapConfigUpdater(state, _ref9) {
  var _ref9$payload = _ref9.payload,
      _ref9$payload$config = _ref9$payload.config,
      config = _ref9$payload$config === void 0 ? {} : _ref9$payload$config,
      _ref9$payload$options = _ref9$payload.options,
      options = _ref9$payload$options === void 0 ? {} : _ref9$payload$options;

  if (!config.visState) {
    return state;
  }

  var keepExistingConfig = options.keepExistingConfig; // reset config if keepExistingConfig is falsy

  var mergedState = !keepExistingConfig ? resetMapConfigUpdater(state) : state;

  var _iterator = _createForOfIteratorHelper(state.mergers),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var merger = _step.value;

      if ((0, _visStateMerger.isValidMerger)(merger) && config.visState[merger.prop]) {
        mergedState = merger.merge(mergedState, config.visState[merger.prop]);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return mergedState;
};
/**
 * Trigger layer hover event with hovered object
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerHoverUpdater}
 * @public
 */


exports.receiveMapConfigUpdater = receiveMapConfigUpdater;

var layerHoverUpdater = function layerHoverUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    hoverInfo: action.info
  });
};
/* eslint-enable max-statements */

/**
 * Update `interactionConfig`
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').interactionConfigChangeUpdater}
 * @public
 */


exports.layerHoverUpdater = layerHoverUpdater;

function interactionConfigChangeUpdater(state, action) {
  var config = action.config;

  var interactionConfig = _objectSpread(_objectSpread({}, state.interactionConfig), (0, _defineProperty2["default"])({}, config.id, config)); // Don't enable tooltip and brush at the same time
  // but coordinates can be shown at all time


  var contradict = ['brush', 'tooltip'];

  if (contradict.includes(config.id) && config.enabled && !state.interactionConfig[config.id].enabled) {
    // only enable one interaction at a time
    contradict.forEach(function (k) {
      if (k !== config.id) {
        interactionConfig[k] = _objectSpread(_objectSpread({}, interactionConfig[k]), {}, {
          enabled: false
        });
      }
    });
  }

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    interactionConfig: interactionConfig
  });

  if (config.id === 'geocoder' && !config.enabled) {
    return removeDatasetUpdater(newState, {
      dataId: 'geocoder_dataset'
    });
  }

  return newState;
}
/**
 * Trigger layer click event with clicked object
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').layerClickUpdater}
 * @public
 */


var layerClickUpdater = function layerClickUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    mousePos: state.interactionConfig.coordinate.enabled ? _objectSpread(_objectSpread({}, state.mousePos), {}, {
      pinned: state.mousePos.pinned ? null : (0, _lodash["default"])(state.mousePos)
    }) : state.mousePos,
    clicked: action.info && action.info.picked ? action.info : null
  });
};
/**
 * Trigger map click event, unselect clicked object
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').mapClickUpdater}
 * @public
 */


exports.layerClickUpdater = layerClickUpdater;

var mapClickUpdater = function mapClickUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    clicked: null
  });
};
/**
 * Trigger map move event
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').mouseMoveUpdater}
 * @public
 */


exports.mapClickUpdater = mapClickUpdater;

var mouseMoveUpdater = function mouseMoveUpdater(state, _ref10) {
  var evt = _ref10.evt;

  if (Object.values(state.interactionConfig).some(function (config) {
    return config.enabled;
  })) {
    return _objectSpread(_objectSpread({}, state), {}, {
      mousePos: _objectSpread(_objectSpread({}, state.mousePos), {}, {
        mousePosition: (0, _toConsumableArray2["default"])(evt.point),
        coordinate: (0, _toConsumableArray2["default"])(evt.lngLat)
      })
    });
  }

  return state;
};
/**
 * Toggle visibility of a layer for a split map
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').toggleSplitMapUpdater}
 * @public
 */


exports.mouseMoveUpdater = mouseMoveUpdater;

var toggleSplitMapUpdater = function toggleSplitMapUpdater(state, action) {
  return state.splitMaps && state.splitMaps.length === 0 ? _objectSpread(_objectSpread({}, state), {}, {
    // maybe we should use an array to store state for a single map as well
    // if current maps length is equal to 0 it means that we are about to split the view
    splitMaps: (0, _splitMapUtils.computeSplitMapLayers)(state.layers)
  }) : closeSpecificMapAtIndex(state, action);
};
/**
 * Toggle visibility of a layer in a split map
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').toggleLayerForMapUpdater}
 * @public
 */


exports.toggleSplitMapUpdater = toggleSplitMapUpdater;

var toggleLayerForMapUpdater = function toggleLayerForMapUpdater(state, _ref11) {
  var mapIndex = _ref11.mapIndex,
      layerId = _ref11.layerId;
  var splitMaps = state.splitMaps;
  return _objectSpread(_objectSpread({}, state), {}, {
    splitMaps: splitMaps.map(function (sm, i) {
      return i === mapIndex ? _objectSpread(_objectSpread({}, splitMaps[i]), {}, {
        layers: _objectSpread(_objectSpread({}, splitMaps[i].layers), {}, (0, _defineProperty2["default"])({}, layerId, !splitMaps[i].layers[layerId]))
      }) : sm;
    })
  });
};
/**
 * Add new dataset to `visState`, with option to load a map config along with the datasets
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').updateVisDataUpdater}
 * @public
 */

/* eslint-disable max-statements */
// eslint-disable-next-line complexity


exports.toggleLayerForMapUpdater = toggleLayerForMapUpdater;

var updateVisDataUpdater = function updateVisDataUpdater(state, action) {
  // datasets can be a single data entries or an array of multiple data entries
  var config = action.config,
      options = action.options;
  var datasets = (0, _utils.toArray)(action.datasets);
  var newDataEntries = datasets.reduce(function (accu) {
    var _ref12 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref12$info = _ref12.info,
        info = _ref12$info === void 0 ? {} : _ref12$info,
        data = _ref12.data;

    return _objectSpread(_objectSpread({}, accu), (0, _datasetUtils.createNewDataEntry)({
      info: info,
      data: data
    }, state.datasets) || {});
  }, {});
  var dataEmpty = Object.keys(newDataEntries).length < 1; // apply config if passed from action

  var previousState = config ? receiveMapConfigUpdater(state, {
    payload: {
      config: config,
      options: options
    }
  }) : state;

  var mergedState = _objectSpread(_objectSpread({}, previousState), {}, {
    datasets: _objectSpread(_objectSpread({}, previousState.datasets), newDataEntries)
  }); // merge state with config to be merged


  var _iterator2 = _createForOfIteratorHelper(mergedState.mergers),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var merger = _step2.value;

      if ((0, _visStateMerger.isValidMerger)(merger) && merger.toMergeProp && mergedState[merger.toMergeProp]) {
        var toMerge = mergedState[merger.toMergeProp];
        mergedState[merger.toMergeProp] = INITIAL_VIS_STATE[merger.toMergeProp];
        mergedState = merger.merge(mergedState, toMerge);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  var newLayers = !dataEmpty ? mergedState.layers.filter(function (l) {
    return l.config.dataId in newDataEntries;
  }) : [];

  if (!newLayers.length && (options || {}).autoCreateLayers !== false) {
    // no layer merged, find defaults
    var result = addDefaultLayers(mergedState, newDataEntries);
    mergedState = result.state;
    newLayers = result.newLayers;
  }

  if (mergedState.splitMaps.length) {
    // if map is split, add new layers to splitMaps
    newLayers = mergedState.layers.filter(function (l) {
      return l.config.dataId in newDataEntries;
    });
    mergedState = _objectSpread(_objectSpread({}, mergedState), {}, {
      splitMaps: (0, _splitMapUtils.addNewLayersToSplitMap)(mergedState.splitMaps, newLayers)
    });
  } // if no tooltips merged add default tooltips


  Object.keys(newDataEntries).forEach(function (dataId) {
    var tooltipFields = mergedState.interactionConfig.tooltip.config.fieldsToShow[dataId];

    if (!Array.isArray(tooltipFields) || !tooltipFields.length) {
      mergedState = addDefaultTooltips(mergedState, newDataEntries[dataId]);
    }
  });
  var updatedState = updateAllLayerDomainData(mergedState, dataEmpty ? Object.keys(mergedState.datasets) : Object.keys(newDataEntries), undefined); // register layer animation domain,
  // need to be called after layer data is calculated

  updatedState = updateAnimationDomain(updatedState);
  return updatedState;
};
/* eslint-enable max-statements */

/**
 * When a user clicks on the specific map closing icon
 * the application will close the selected map
 * and will merge the remaining one with the global state
 * TODO: i think in the future this action should be called merge map layers with global settings
 * @param {Object} state `visState`
 * @param {Object} action action
 * @returns {Object} nextState
 */


exports.updateVisDataUpdater = updateVisDataUpdater;

function closeSpecificMapAtIndex(state, action) {
  // retrieve layers meta data from the remaining map that we need to keep
  var indexToRetrieve = 1 - action.payload;
  var mapLayers = state.splitMaps[indexToRetrieve].layers;
  var layers = state.layers; // update layer visibility

  var newLayers = layers.map(function (layer) {
    return !mapLayers[layer.id] && layer.config.isVisible ? layer.updateLayerConfig({
      // if layer.id is not in mapLayers, it should be inVisible
      isVisible: false
    }) : layer;
  }); // delete map

  return _objectSpread(_objectSpread({}, state), {}, {
    layers: newLayers,
    splitMaps: []
  });
}
/**
 * Trigger file loading dispatch `addDataToMap` if succeed, or `loadFilesErr` if failed
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').loadFilesUpdater}
 * @public
 */


var loadFilesUpdater = function loadFilesUpdater(state, action) {
  var files = action.files,
      meta = action.meta,
      _action$onFinish = action.onFinish,
      onFinish = _action$onFinish === void 0 ? _visStateActions.loadFilesSuccess : _action$onFinish;

  if (!files.length) {
    return state;
  }

  var fileLoadingProgress = Array.from(files).reduce(function (accu, f, i) {
    return (0, _composerHelpers.merge_)(initialFileLoadingProgress(f, i))(accu);
  }, {});
  var fileLoading = {
    fileCache: [],
    filesToLoad: files,
    meta: meta,
    onFinish: onFinish
  };
  var nextState = (0, _composerHelpers.merge_)({
    fileLoadingProgress: fileLoadingProgress,
    fileLoading: fileLoading
  })(state);
  return loadNextFileUpdater(nextState);
};

exports.loadFilesUpdater = loadFilesUpdater;

function nextAction(meta, action) {
  return meta && typeof meta._id_ === 'string' ? (0, _actionWrapper.wrapTo)(meta._id_, action) : action;
}
/**
 * Sucessfully loaded one file, move on to the next one
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').loadFileStepSuccessUpdater}
 * @public
 */


function loadFileStepSuccessUpdater(state, action) {
  if (!state.fileLoading) {
    return state;
  }

  var fileName = action.fileName,
      fileCache = action.fileCache,
      meta = action.meta;
  var _state$fileLoading = state.fileLoading,
      filesToLoad = _state$fileLoading.filesToLoad,
      onFinish = _state$fileLoading.onFinish;
  var stateWithProgress = updateFileLoadingProgressUpdater(state, {
    fileName: fileName,
    progress: {
      percent: 1,
      message: 'Done'
    }
  }); // save processed file to fileCache

  var stateWithCache = (0, _composerHelpers.pick_)('fileLoading')((0, _composerHelpers.merge_)({
    fileCache: fileCache
  }))(stateWithProgress);
  return (0, _tasks.withTask)(stateWithCache, (0, _tasks2.DELAY_TASK)(200).map(filesToLoad.length ? _visStateActions.loadNextFile : function () {
    return nextAction(meta, onFinish(fileCache));
  }));
} // withTask<T>(state: T, task: any): T

/**
 *
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').loadNextFileUpdater}
 * @public
 */


function loadNextFileUpdater(state) {
  if (!state.fileLoading) {
    return state;
  }

  var meta = state.fileLoading['meta'];
  var filesToLoad = state.fileLoading.filesToLoad;

  var _filesToLoad = (0, _toArray2["default"])(filesToLoad),
      file = _filesToLoad[0],
      remainingFilesToLoad = _filesToLoad.slice(1); // save filesToLoad to state


  var nextState = (0, _composerHelpers.pick_)('fileLoading')((0, _composerHelpers.merge_)({
    filesToLoad: remainingFilesToLoad
  }))(state);
  var stateWithProgress = updateFileLoadingProgressUpdater(nextState, {
    fileName: file.name,
    progress: {
      percent: 0,
      message: 'loading...'
    }
  });
  var loaders = state.loaders,
      loadOptions = state.loadOptions;
  return (0, _tasks.withTask)(stateWithProgress, makeLoadFileTask(file, nextState.fileLoading.fileCache, loaders, loadOptions, meta));
}

function makeLoadFileTask(file, fileCache) {
  var loaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var loadOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var meta = arguments.length > 4 ? arguments[4] : undefined;
  return (0, _tasks2.LOAD_FILE_TASK)({
    file: file,
    fileCache: fileCache,
    loaders: loaders,
    loadOptions: loadOptions
  }).bimap( // prettier ignore
  // success
  function (gen) {
    return nextAction(meta, (0, _visStateActions.nextFileBatch)({
      gen: gen,
      fileName: file.name,
      meta: meta,
      onFinish: function onFinish(result) {
        return (0, _visStateActions.processFileContent)({
          content: result,
          meta: meta,
          fileCache: fileCache
        });
      }
    }));
  }, // error
  function (err) {
    return nextAction(meta, (0, _visStateActions.loadFilesErr)(file.name, err, meta));
  });
}
/**
 *
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').processFileContentUpdater}
 * @public
 */


function processFileContentUpdater(state, action) {
  var _action$payload = action.payload,
      content = _action$payload.content,
      fileCache = _action$payload.fileCache,
      meta = _action$payload.meta;
  var stateWithProgress = updateFileLoadingProgressUpdater(state, {
    fileName: content.fileName,
    progress: {
      percent: 1,
      message: 'processing...'
    }
  });
  return (0, _tasks.withTask)(stateWithProgress, (0, _tasks2.PROCESS_FILE_DATA)({
    content: content,
    fileCache: fileCache
  }).bimap(function (result) {
    return nextAction(meta, (0, _visStateActions.loadFileStepSuccess)({
      fileName: content.fileName,
      fileCache: result,
      meta: meta
    }));
  }, function (err) {
    return nextAction(meta, (0, _visStateActions.loadFilesErr)(content.fileName, err, meta));
  }));
}

function parseProgress() {
  var prevProgress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var progress = arguments.length > 1 ? arguments[1] : undefined;

  // This happens when receiving query metadata or other cases we don't
  // have an update for the user.
  if (!progress || !progress.percent) {
    return {};
  }

  return {
    percent: progress.percent
  };
}
/**
 * gets called with payload = AsyncGenerator<???>
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').nextFileBatchUpdater}
 * @public
 */


var nextFileBatchUpdater = function nextFileBatchUpdater(state, _ref13) {
  var _ref13$payload = _ref13.payload,
      gen = _ref13$payload.gen,
      fileName = _ref13$payload.fileName,
      progress = _ref13$payload.progress,
      accumulated = _ref13$payload.accumulated,
      meta = _ref13$payload.meta,
      onFinish = _ref13$payload.onFinish;
  var stateWithProgress = updateFileLoadingProgressUpdater(state, {
    fileName: fileName,
    progress: parseProgress(state.fileLoadingProgress[fileName], progress)
  });
  return (0, _tasks.withTask)(stateWithProgress, (0, _tasks2.UNWRAP_TASK)(gen.next()).bimap(function (_ref14) {
    var value = _ref14.value,
        done = _ref14.done;
    return done ? nextAction(meta, onFinish(accumulated)) : nextAction(meta, (0, _visStateActions.nextFileBatch)({
      gen: gen,
      fileName: fileName,
      progress: value.progress,
      accumulated: value,
      meta: meta,
      onFinish: onFinish
    }));
  }, function (err) {
    return nextAction(meta, (0, _visStateActions.loadFilesErr)(fileName, err, meta));
  }));
};
/**
 * Trigger loading file error
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').loadFilesErrUpdater}
 * @public
 */


exports.nextFileBatchUpdater = nextFileBatchUpdater;

var loadFilesErrUpdater = function loadFilesErrUpdater(state, _ref15) {
  var error = _ref15.error,
      fileName = _ref15.fileName,
      _ref15$meta = _ref15.meta,
      meta = _ref15$meta === void 0 ? {} : _ref15$meta;

  // update ui with error message
  _window.console.warn(error);

  if (!state.fileLoading) {
    return state;
  }

  var _state$fileLoading2 = state.fileLoading,
      filesToLoad = _state$fileLoading2.filesToLoad,
      onFinish = _state$fileLoading2.onFinish,
      fileCache = _state$fileLoading2.fileCache;
  var nextState = updateFileLoadingProgressUpdater(state, {
    fileName: fileName,
    progress: {
      error: error
    }
  }); // kick off next file or finish

  return (0, _tasks.withTask)(nextState, (0, _tasks2.DELAY_TASK)(200).map(filesToLoad.length ? _visStateActions.loadNextFile : function () {
    return nextAction(meta, onFinish(fileCache));
  }));
};
/**
 * When select dataset for export, apply cpu filter to selected dataset
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').applyCPUFilterUpdater}
 * @public
 */


exports.loadFilesErrUpdater = loadFilesErrUpdater;

var applyCPUFilterUpdater = function applyCPUFilterUpdater(state, _ref16) {
  var dataId = _ref16.dataId;
  // apply cpuFilter
  var dataIds = (0, _utils.toArray)(dataId);
  return dataIds.reduce(function (accu, id) {
    return (0, _filterUtils.filterDatasetCPU)(accu, id);
  }, state);
};
/**
 * User input to update the info of the map
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setMapInfoUpdater}
 * @public
 */


exports.applyCPUFilterUpdater = applyCPUFilterUpdater;

var setMapInfoUpdater = function setMapInfoUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    mapInfo: _objectSpread(_objectSpread({}, state.mapInfo), action.info)
  });
};
/**
 * Helper function to update All layer domain and layer data of state
 * @type {typeof import('./vis-state-updaters').addDefaultLayers}
 */


exports.setMapInfoUpdater = setMapInfoUpdater;

function addDefaultLayers(state, datasets) {
  /** @type {Layer[]} */
  var empty = [];
  var defaultLayers = Object.values(datasets).reduce(function (accu, dataset) {
    var foundLayers = (0, _layerUtils.findDefaultLayer)(dataset, state.layerClasses);
    return foundLayers && foundLayers.length ? accu.concat(foundLayers) : accu;
  }, empty);
  return {
    state: _objectSpread(_objectSpread({}, state), {}, {
      layers: [].concat((0, _toConsumableArray2["default"])(state.layers), (0, _toConsumableArray2["default"])(defaultLayers)),
      layerOrder: [].concat((0, _toConsumableArray2["default"])(defaultLayers.map(function (_, i) {
        return state.layers.length + i;
      })), (0, _toConsumableArray2["default"])(state.layerOrder))
    }),
    newLayers: defaultLayers
  };
}
/**
 * helper function to find default tooltips
 * @param {Object} state
 * @param {Object} dataset
 * @returns {Object} nextState
 */


function addDefaultTooltips(state, dataset) {
  var tooltipFields = (0, _interactionUtils.findFieldsToShow)(dataset);

  var merged = _objectSpread(_objectSpread({}, state.interactionConfig.tooltip.config.fieldsToShow), tooltipFields);

  return (0, _utils.set)(['interactionConfig', 'tooltip', 'config', 'fieldsToShow'], merged, state);
}

function initialFileLoadingProgress(file, index) {
  var fileName = file.name || "Untitled File ".concat(index);
  return (0, _defineProperty2["default"])({}, fileName, {
    // percent of current file
    percent: 0,
    message: '',
    fileName: fileName,
    error: null
  });
}

function updateFileLoadingProgressUpdater(state, _ref18) {
  var fileName = _ref18.fileName,
      progress = _ref18.progress;
  return (0, _composerHelpers.pick_)('fileLoadingProgress')((0, _composerHelpers.pick_)(fileName)((0, _composerHelpers.merge_)(progress)))(state);
}
/**
 * Helper function to update layer domains for an array of datasets
 * @type {typeof import('./vis-state-updaters').updateAllLayerDomainData}
 */


function updateAllLayerDomainData(state, dataId, updatedFilter) {
  var dataIds = typeof dataId === 'string' ? [dataId] : dataId;
  var newLayers = [];
  var newLayerData = [];
  state.layers.forEach(function (oldLayer, i) {
    if (oldLayer.config.dataId && dataIds.includes(oldLayer.config.dataId)) {
      // No need to recalculate layer domain if filter has fixed domain
      var newLayer = updatedFilter && updatedFilter.fixedDomain ? oldLayer : oldLayer.updateLayerDomain(state.datasets, updatedFilter);

      var _calculateLayerData4 = (0, _layerUtils.calculateLayerData)(newLayer, state, state.layerData[i]),
          layerData = _calculateLayerData4.layerData,
          layer = _calculateLayerData4.layer;

      newLayers.push(layer);
      newLayerData.push(layerData);
    } else {
      newLayers.push(oldLayer);
      newLayerData.push(state.layerData[i]);
    }
  });

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    layers: newLayers,
    layerData: newLayerData
  });

  return newState;
}

function updateAnimationDomain(state) {
  // merge all animatable layer domain and update global config
  var animatableLayers = state.layers.filter(function (l) {
    return l.config.isVisible && l.config.animation && l.config.animation.enabled && Array.isArray(l.animationDomain);
  });

  if (!animatableLayers.length) {
    return _objectSpread(_objectSpread({}, state), {}, {
      animationConfig: DEFAULT_ANIMATION_CONFIG
    });
  }

  var mergedDomain = animatableLayers.reduce(function (accu, layer) {
    return [Math.min(accu[0], layer.animationDomain[0]), Math.max(accu[1], layer.animationDomain[1])];
  }, [Number(Infinity), -Infinity]);
  return _objectSpread(_objectSpread({}, state), {}, {
    animationConfig: _objectSpread(_objectSpread({}, state.animationConfig), {}, {
      currentTime: (0, _filterUtils.isInRange)(state.animationConfig.currentTime, mergedDomain) ? state.animationConfig.currentTime : mergedDomain[0],
      domain: mergedDomain
    })
  });
}
/**
 * Update the status of the editor
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setEditorModeUpdater}
 */


var setEditorModeUpdater = function setEditorModeUpdater(state, _ref19) {
  var mode = _ref19.mode;
  return _objectSpread(_objectSpread({}, state), {}, {
    editor: _objectSpread(_objectSpread({}, state.editor), {}, {
      mode: mode,
      selectedFeature: null
    })
  });
}; // const featureToFilterValue = (feature) => ({...feature, id: feature.id});

/**
 * Update editor features
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setFeaturesUpdater}
 */


exports.setEditorModeUpdater = setEditorModeUpdater;

function setFeaturesUpdater(state, _ref20) {
  var _ref20$features = _ref20.features,
      features = _ref20$features === void 0 ? [] : _ref20$features;
  var lastFeature = features.length && features[features.length - 1];

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    editor: _objectSpread(_objectSpread({}, state.editor), {}, {
      // only save none filter features to editor
      features: features.filter(function (f) {
        return !(0, _filterUtils.getFilterIdInFeature)(f);
      }),
      mode: lastFeature && lastFeature.properties.isClosed ? _defaultSettings.EDITOR_MODES.EDIT : state.editor.mode
    })
  }); // Retrieve existing feature


  var selectedFeature = state.editor.selectedFeature; // If no feature is selected we can simply return since no operations

  if (!selectedFeature) {
    return newState;
  } // TODO: check if the feature has changed


  var feature = features.find(function (f) {
    return f.id === selectedFeature.id;
  }); // if feature is part of a filter

  var filterId = feature && (0, _filterUtils.getFilterIdInFeature)(feature);

  if (filterId && feature) {
    var featureValue = (0, _filterUtils.featureToFilterValue)(feature, filterId);
    var filterIdx = state.filters.findIndex(function (fil) {
      return fil.id === filterId;
    });
    return setFilterUpdater(newState, {
      idx: filterIdx,
      prop: 'value',
      value: featureValue
    });
  }

  return newState;
}
/**
 * Set the current selected feature
 * @memberof uiStateUpdaters
 * @type {typeof import('./vis-state-updaters').setSelectedFeatureUpdater}
 */


var setSelectedFeatureUpdater = function setSelectedFeatureUpdater(state, _ref21) {
  var feature = _ref21.feature;
  return _objectSpread(_objectSpread({}, state), {}, {
    editor: _objectSpread(_objectSpread({}, state.editor), {}, {
      selectedFeature: feature
    })
  });
};
/**
 * Delete existing feature from filters
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').deleteFeatureUpdater}
 */


exports.setSelectedFeatureUpdater = setSelectedFeatureUpdater;

function deleteFeatureUpdater(state, _ref22) {
  var feature = _ref22.feature;

  if (!feature) {
    return state;
  }

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    editor: _objectSpread(_objectSpread({}, state.editor), {}, {
      selectedFeature: null
    })
  });

  if ((0, _filterUtils.getFilterIdInFeature)(feature)) {
    var filterIdx = newState.filters.findIndex(function (f) {
      return f.id === (0, _filterUtils.getFilterIdInFeature)(feature);
    });
    return filterIdx > -1 ? removeFilterUpdater(newState, {
      idx: filterIdx
    }) : newState;
  } // modify editor object


  var newEditor = _objectSpread(_objectSpread({}, state.editor), {}, {
    features: state.editor.features.filter(function (f) {
      return f.id !== feature.id;
    }),
    selectedFeature: null
  });

  return _objectSpread(_objectSpread({}, state), {}, {
    editor: newEditor
  });
}
/**
 * Toggle feature as layer filter
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').setPolygonFilterLayerUpdater}
 */


function setPolygonFilterLayerUpdater(state, payload) {
  var layer = payload.layer,
      feature = payload.feature;
  var filterId = (0, _filterUtils.getFilterIdInFeature)(feature); // let newFilter = null;

  var filterIdx;
  var newLayerId = [layer.id];
  var newState = state; // If polygon filter already exists, we need to find out if the current layer is already included

  if (filterId) {
    filterIdx = state.filters.findIndex(function (f) {
      return f.id === filterId;
    });

    if (!state.filters[filterIdx]) {
      // what if filter doesn't exist?... not possible.
      // because features in the editor is passed in from filters and editors.
      // but we will move this feature back to editor just in case
      var noneFilterFeature = _objectSpread(_objectSpread({}, feature), {}, {
        properties: _objectSpread(_objectSpread({}, feature.properties), {}, {
          filterId: null
        })
      });

      return _objectSpread(_objectSpread({}, state), {}, {
        editor: _objectSpread(_objectSpread({}, state.editor), {}, {
          features: [].concat((0, _toConsumableArray2["default"])(state.editor.features), [noneFilterFeature]),
          selectedFeature: noneFilterFeature
        })
      });
    }

    var filter = state.filters[filterIdx];
    var _filter$layerId = filter.layerId,
        layerId = _filter$layerId === void 0 ? [] : _filter$layerId;
    var isLayerIncluded = layerId.includes(layer.id);
    newLayerId = isLayerIncluded ? // if layer is included, remove it
    layerId.filter(function (l) {
      return l !== layer.id;
    }) : [].concat((0, _toConsumableArray2["default"])(layerId), [layer.id]);
  } else {
    // if we haven't create the polygon filter, create it
    var newFilter = (0, _filterUtils.generatePolygonFilter)([], feature);
    filterIdx = state.filters.length; // add feature, remove feature from eidtor

    newState = _objectSpread(_objectSpread({}, state), {}, {
      filters: [].concat((0, _toConsumableArray2["default"])(state.filters), [newFilter]),
      editor: _objectSpread(_objectSpread({}, state.editor), {}, {
        features: state.editor.features.filter(function (f) {
          return f.id !== feature.id;
        }),
        selectedFeature: newFilter.value
      })
    });
  }

  return setFilterUpdater(newState, {
    idx: filterIdx,
    prop: 'layerId',
    value: newLayerId
  });
}
/**
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').sortTableColumnUpdater}
 * @public
 */


function sortTableColumnUpdater(state, _ref23) {
  var dataId = _ref23.dataId,
      column = _ref23.column,
      mode = _ref23.mode;
  var dataset = state.datasets[dataId];

  if (!dataset) {
    return state;
  }

  if (!mode) {
    var currentMode = (0, _lodash3["default"])(dataset, ['sortColumn', column]);
    mode = currentMode ? Object.keys(_defaultSettings.SORT_ORDER).find(function (m) {
      return m !== currentMode;
    }) : _defaultSettings.SORT_ORDER.ASCENDING;
  }

  var sorted = (0, _datasetUtils.sortDatasetByColumn)(dataset, column, mode);
  return (0, _utils.set)(['datasets', dataId], sorted, state);
}
/**
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').pinTableColumnUpdater}
 * @public
 */


function pinTableColumnUpdater(state, _ref24) {
  var dataId = _ref24.dataId,
      column = _ref24.column;
  var dataset = state.datasets[dataId];

  if (!dataset) {
    return state;
  }

  var field = dataset.fields.find(function (f) {
    return f.name === column;
  });

  if (!field) {
    return state;
  }

  var pinnedColumns;

  if (Array.isArray(dataset.pinnedColumns) && dataset.pinnedColumns.includes(field.name)) {
    // unpin it
    pinnedColumns = dataset.pinnedColumns.filter(function (co) {
      return co !== field.name;
    });
  } else {
    pinnedColumns = (dataset.pinnedColumns || []).concat(field.name);
  }

  return (0, _utils.set)(['datasets', dataId, 'pinnedColumns'], pinnedColumns, state);
}
/**
 * Copy column content as strings
 * @memberof visStateUpdaters
 * @type {typeof import('./vis-state-updaters').copyTableColumnUpdater}
 * @public
 */


function copyTableColumnUpdater(state, _ref25) {
  var dataId = _ref25.dataId,
      column = _ref25.column;
  var dataset = state.datasets[dataId];

  if (!dataset) {
    return state;
  }

  var fieldIdx = dataset.fields.findIndex(function (f) {
    return f.name === column;
  });

  if (fieldIdx < 0) {
    return state;
  }

  var type = dataset.fields[fieldIdx].type;
  var text = dataset.allData.map(function (d) {
    return (0, _dataUtils.parseFieldValue)(d[fieldIdx], type);
  }).join('\n');
  (0, _copyToClipboard["default"])(text);
  return state;
}
/**
 * Update editor
 * @type {typeof import('./vis-state-updaters').toggleEditorVisibilityUpdater}
 */


function toggleEditorVisibilityUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    editor: _objectSpread(_objectSpread({}, state.editor), {}, {
      visible: !state.editor.visible
    })
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy92aXMtc3RhdGUtdXBkYXRlcnMuanMiXSwibmFtZXMiOlsidmlzU3RhdGVVcGRhdGVycyIsIkRFRkFVTFRfQU5JTUFUSU9OX0NPTkZJRyIsImRvbWFpbiIsImN1cnJlbnRUaW1lIiwic3BlZWQiLCJERUZBVUxUX0VESVRPUiIsIm1vZGUiLCJFRElUT1JfTU9ERVMiLCJEUkFXX1BPTFlHT04iLCJmZWF0dXJlcyIsInNlbGVjdGVkRmVhdHVyZSIsInZpc2libGUiLCJJTklUSUFMX1ZJU19TVEFURSIsIm1hcEluZm8iLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibGF5ZXJzIiwibGF5ZXJEYXRhIiwibGF5ZXJUb0JlTWVyZ2VkIiwibGF5ZXJPcmRlciIsImZpbHRlcnMiLCJmaWx0ZXJUb0JlTWVyZ2VkIiwiZGF0YXNldHMiLCJlZGl0aW5nRGF0YXNldCIsInVuZGVmaW5lZCIsImludGVyYWN0aW9uQ29uZmlnIiwiaW50ZXJhY3Rpb25Ub0JlTWVyZ2VkIiwibGF5ZXJCbGVuZGluZyIsImhvdmVySW5mbyIsImNsaWNrZWQiLCJtb3VzZVBvcyIsInNwbGl0TWFwcyIsInNwbGl0TWFwc1RvQmVNZXJnZWQiLCJsYXllckNsYXNzZXMiLCJMYXllckNsYXNzZXMiLCJhbmltYXRpb25Db25maWciLCJlZGl0b3IiLCJmaWxlTG9hZGluZyIsImZpbGVMb2FkaW5nUHJvZ3Jlc3MiLCJsb2FkZXJzIiwibG9hZE9wdGlvbnMiLCJtZXJnZXJzIiwiVklTX1NUQVRFX01FUkdFUlMiLCJzY2hlbWEiLCJLZXBsZXJHTFNjaGVtYSIsInVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YSIsInN0YXRlIiwibGF5ZXIiLCJpZHgiLCJtYXAiLCJseXIiLCJpIiwiZCIsInVwZGF0ZVN0YXRlT25MYXllclZpc2liaWxpdHlDaGFuZ2UiLCJuZXdTdGF0ZSIsImxlbmd0aCIsImNvbmZpZyIsImlzVmlzaWJsZSIsImFuaW1hdGlvbiIsImVuYWJsZWQiLCJ1cGRhdGVBbmltYXRpb25Eb21haW4iLCJsYXllckNvbmZpZ0NoYW5nZVVwZGF0ZXIiLCJhY3Rpb24iLCJvbGRMYXllciIsImZpbmRJbmRleCIsImwiLCJpZCIsInByb3BzIiwiT2JqZWN0Iiwia2V5cyIsIm5ld0NvbmZpZyIsIm5ld0xheWVyIiwidXBkYXRlTGF5ZXJDb25maWciLCJzaG91bGRDYWxjdWxhdGVMYXllckRhdGEiLCJvbGRMYXllckRhdGEiLCJ1cGRhdGVMYXllckRhdGFSZXN1bHQiLCJhZGRPclJlbW92ZVRleHRMYWJlbHMiLCJuZXdGaWVsZHMiLCJ0ZXh0TGFiZWwiLCJuZXdUZXh0TGFiZWwiLCJzbGljZSIsImN1cnJlbnRGaWVsZHMiLCJ0bCIsImZpZWxkIiwibmFtZSIsImZpbHRlciIsImFkZEZpZWxkcyIsImYiLCJpbmNsdWRlcyIsImRlbGV0ZUZpZWxkcyIsImZpbmQiLCJmZCIsIkRFRkFVTFRfVEVYVF9MQUJFTCIsImFmIiwidXBkYXRlVGV4dExhYmVsUHJvcEFuZFZhbHVlIiwicHJvcCIsInZhbHVlIiwiaGFzT3duUHJvcGVydHkiLCJzcGxpY2UiLCJsYXllclRleHRMYWJlbENoYW5nZVVwZGF0ZXIiLCJsYXllclR5cGVDaGFuZ2VVcGRhdGVyIiwibmV3VHlwZSIsIm9sZElkIiwiQ29uc29sZSIsImVycm9yIiwiYXNzaWduQ29uZmlnVG9MYXllciIsInZpc0NvbmZpZ1NldHRpbmdzIiwidXBkYXRlTGF5ZXJEb21haW4iLCJzZXR0aW5ncyIsIm9sZExheWVyTWFwIiwib3RoZXJMYXllcnMiLCJsYXllclZpc3VhbENoYW5uZWxDaGFuZ2VVcGRhdGVyIiwiY2hhbm5lbCIsImRhdGFJZCIsImRhdGFzZXQiLCJ1cGRhdGVMYXllclZpc3VhbENoYW5uZWwiLCJsYXllclZpc0NvbmZpZ0NoYW5nZVVwZGF0ZXIiLCJuZXdWaXNDb25maWciLCJ2aXNDb25maWciLCJzZXRGaWx0ZXJVcGRhdGVyIiwidmFsdWVJbmRleCIsIm9sZEZpbHRlciIsIm5ld0ZpbHRlciIsImRhdGFzZXRJZHMiLCJGSUxURVJfVVBEQVRFUl9QUk9QUyIsImRhdGFzZXRJZCIsIm1lcmdlRG9tYWluIiwidXBkYXRlZEZpbHRlciIsIm5ld0RhdGFzZXQiLCJncHUiLCJsYXllcklkIiwibGF5ZXJJZERpZmZlcmVuY2UiLCJsYXllckRhdGFJZHMiLCJsaWQiLCJuZXdEYXRhSWRzIiwiZW5sYXJnZWRGaWx0ZXIiLCJlbmxhcmdlZCIsImRhdGFzZXRJZHNUb0ZpbHRlciIsIkxJTUlURURfRklMVEVSX0VGRkVDVF9QUk9QUyIsImZpbHRlcmVkRGF0YXNldHMiLCJ1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEiLCJzZXRGaWx0ZXJQbG90VXBkYXRlciIsIm5ld1Byb3AiLCJwbG90VHlwZSIsImFsbERhdGEiLCJhZGRGaWx0ZXJVcGRhdGVyIiwibGF5ZXJDb2xvclVJQ2hhbmdlVXBkYXRlciIsInVwZGF0ZUxheWVyQ29sb3JVSSIsInRvZ2dsZUZpbHRlckFuaW1hdGlvblVwZGF0ZXIiLCJpc0FuaW1hdGluZyIsInVwZGF0ZUZpbHRlckFuaW1hdGlvblNwZWVkVXBkYXRlciIsInVwZGF0ZUFuaW1hdGlvblRpbWVVcGRhdGVyIiwidXBkYXRlTGF5ZXJBbmltYXRpb25TcGVlZFVwZGF0ZXIiLCJlbmxhcmdlRmlsdGVyVXBkYXRlciIsImlzRW5sYXJnZWQiLCJ0b2dnbGVGaWx0ZXJGZWF0dXJlVXBkYXRlciIsImFzc2lnbiIsInJlbW92ZUZpbHRlclVwZGF0ZXIiLCJuZXdGaWx0ZXJzIiwibmV3RWRpdG9yIiwiYWRkTGF5ZXJVcGRhdGVyIiwiZGVmYXVsdERhdGFzZXQiLCJMYXllciIsImlzQ29uZmlnQWN0aXZlIiwicmVtb3ZlTGF5ZXJVcGRhdGVyIiwibGF5ZXJUb1JlbW92ZSIsIm5ld01hcHMiLCJwaWQiLCJpc0xheWVySG92ZXJlZCIsInJlb3JkZXJMYXllclVwZGF0ZXIiLCJvcmRlciIsInJlbW92ZURhdGFzZXRVcGRhdGVyIiwiZGF0YXNldEtleSIsIm5ld0RhdGFzZXRzIiwiaW5kZXhlcyIsInJlZHVjZSIsImxpc3RPZkluZGV4ZXMiLCJpbmRleCIsInB1c2giLCJjdXJyZW50U3RhdGUiLCJpbmRleENvdW50ZXIiLCJjdXJyZW50SW5kZXgiLCJ0b29sdGlwIiwiZmllbGRzVG9TaG93IiwiZmllbGRzIiwidXBkYXRlTGF5ZXJCbGVuZGluZ1VwZGF0ZXIiLCJzaG93RGF0YXNldFRhYmxlVXBkYXRlciIsInJlc2V0TWFwQ29uZmlnVXBkYXRlciIsImluaXRpYWxTdGF0ZSIsInJlY2VpdmVNYXBDb25maWdVcGRhdGVyIiwicGF5bG9hZCIsIm9wdGlvbnMiLCJ2aXNTdGF0ZSIsImtlZXBFeGlzdGluZ0NvbmZpZyIsIm1lcmdlZFN0YXRlIiwibWVyZ2VyIiwibWVyZ2UiLCJsYXllckhvdmVyVXBkYXRlciIsImluZm8iLCJpbnRlcmFjdGlvbkNvbmZpZ0NoYW5nZVVwZGF0ZXIiLCJjb250cmFkaWN0IiwiZm9yRWFjaCIsImsiLCJsYXllckNsaWNrVXBkYXRlciIsImNvb3JkaW5hdGUiLCJwaW5uZWQiLCJwaWNrZWQiLCJtYXBDbGlja1VwZGF0ZXIiLCJtb3VzZU1vdmVVcGRhdGVyIiwiZXZ0IiwidmFsdWVzIiwic29tZSIsIm1vdXNlUG9zaXRpb24iLCJwb2ludCIsImxuZ0xhdCIsInRvZ2dsZVNwbGl0TWFwVXBkYXRlciIsImNsb3NlU3BlY2lmaWNNYXBBdEluZGV4IiwidG9nZ2xlTGF5ZXJGb3JNYXBVcGRhdGVyIiwibWFwSW5kZXgiLCJzbSIsInVwZGF0ZVZpc0RhdGFVcGRhdGVyIiwibmV3RGF0YUVudHJpZXMiLCJhY2N1IiwiZGF0YSIsImRhdGFFbXB0eSIsInByZXZpb3VzU3RhdGUiLCJ0b01lcmdlUHJvcCIsInRvTWVyZ2UiLCJuZXdMYXllcnMiLCJhdXRvQ3JlYXRlTGF5ZXJzIiwicmVzdWx0IiwiYWRkRGVmYXVsdExheWVycyIsInRvb2x0aXBGaWVsZHMiLCJBcnJheSIsImlzQXJyYXkiLCJhZGREZWZhdWx0VG9vbHRpcHMiLCJ1cGRhdGVkU3RhdGUiLCJpbmRleFRvUmV0cmlldmUiLCJtYXBMYXllcnMiLCJsb2FkRmlsZXNVcGRhdGVyIiwiZmlsZXMiLCJtZXRhIiwib25GaW5pc2giLCJsb2FkRmlsZXNTdWNjZXNzIiwiZnJvbSIsImluaXRpYWxGaWxlTG9hZGluZ1Byb2dyZXNzIiwiZmlsZUNhY2hlIiwiZmlsZXNUb0xvYWQiLCJuZXh0U3RhdGUiLCJsb2FkTmV4dEZpbGVVcGRhdGVyIiwibmV4dEFjdGlvbiIsIl9pZF8iLCJsb2FkRmlsZVN0ZXBTdWNjZXNzVXBkYXRlciIsImZpbGVOYW1lIiwic3RhdGVXaXRoUHJvZ3Jlc3MiLCJ1cGRhdGVGaWxlTG9hZGluZ1Byb2dyZXNzVXBkYXRlciIsInByb2dyZXNzIiwicGVyY2VudCIsIm1lc3NhZ2UiLCJzdGF0ZVdpdGhDYWNoZSIsImxvYWROZXh0RmlsZSIsImZpbGUiLCJyZW1haW5pbmdGaWxlc1RvTG9hZCIsIm1ha2VMb2FkRmlsZVRhc2siLCJiaW1hcCIsImdlbiIsImNvbnRlbnQiLCJlcnIiLCJwcm9jZXNzRmlsZUNvbnRlbnRVcGRhdGVyIiwicGFyc2VQcm9ncmVzcyIsInByZXZQcm9ncmVzcyIsIm5leHRGaWxlQmF0Y2hVcGRhdGVyIiwiYWNjdW11bGF0ZWQiLCJuZXh0IiwiZG9uZSIsImxvYWRGaWxlc0VyclVwZGF0ZXIiLCJ3YXJuIiwiYXBwbHlDUFVGaWx0ZXJVcGRhdGVyIiwiZGF0YUlkcyIsInNldE1hcEluZm9VcGRhdGVyIiwiZW1wdHkiLCJkZWZhdWx0TGF5ZXJzIiwiZm91bmRMYXllcnMiLCJjb25jYXQiLCJfIiwibWVyZ2VkIiwibmV3TGF5ZXJEYXRhIiwiZml4ZWREb21haW4iLCJhbmltYXRhYmxlTGF5ZXJzIiwiYW5pbWF0aW9uRG9tYWluIiwibWVyZ2VkRG9tYWluIiwiTWF0aCIsIm1pbiIsIm1heCIsIk51bWJlciIsIkluZmluaXR5Iiwic2V0RWRpdG9yTW9kZVVwZGF0ZXIiLCJzZXRGZWF0dXJlc1VwZGF0ZXIiLCJsYXN0RmVhdHVyZSIsInByb3BlcnRpZXMiLCJpc0Nsb3NlZCIsIkVESVQiLCJmZWF0dXJlIiwiZmlsdGVySWQiLCJmZWF0dXJlVmFsdWUiLCJmaWx0ZXJJZHgiLCJmaWwiLCJzZXRTZWxlY3RlZEZlYXR1cmVVcGRhdGVyIiwiZGVsZXRlRmVhdHVyZVVwZGF0ZXIiLCJzZXRQb2x5Z29uRmlsdGVyTGF5ZXJVcGRhdGVyIiwibmV3TGF5ZXJJZCIsIm5vbmVGaWx0ZXJGZWF0dXJlIiwiaXNMYXllckluY2x1ZGVkIiwic29ydFRhYmxlQ29sdW1uVXBkYXRlciIsImNvbHVtbiIsImN1cnJlbnRNb2RlIiwiU09SVF9PUkRFUiIsIm0iLCJBU0NFTkRJTkciLCJzb3J0ZWQiLCJwaW5UYWJsZUNvbHVtblVwZGF0ZXIiLCJwaW5uZWRDb2x1bW5zIiwiY28iLCJjb3B5VGFibGVDb2x1bW5VcGRhdGVyIiwiZmllbGRJZHgiLCJ0eXBlIiwidGV4dCIsImpvaW4iLCJ0b2dnbGVFZGl0b3JWaXNpYmlsaXR5VXBkYXRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQVFBOztBQUNBOztBQWVBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQTtBQUNBOztBQUNBLElBQU1BLGdCQUFnQixHQUFHLElBQXpCO0FBQ0E7O0FBRUE7O0FBQ08sSUFBTUMsd0JBQXdCLEdBQUc7QUFDdENDLEVBQUFBLE1BQU0sRUFBRSxJQUQ4QjtBQUV0Q0MsRUFBQUEsV0FBVyxFQUFFLElBRnlCO0FBR3RDQyxFQUFBQSxLQUFLLEVBQUU7QUFIK0IsQ0FBakM7QUFNUDs7O0FBQ08sSUFBTUMsY0FBYyxHQUFHO0FBQzVCQyxFQUFBQSxJ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akJBLE1BQWlCO0FBQUEsTUFBVHlNLE1BQVMsVUFBVEEsTUFBUztBQUM5RCxNQUFNeE0sT0FBTyxHQUFHcEUsS0FBSyxDQUFDeEIsUUFBTixDQUFlMkYsTUFBZixDQUFoQjs7QUFDQSxNQUFJLENBQUNDLE9BQUwsRUFBYztBQUNaLFdBQU9wRSxLQUFQO0FBQ0Q7O0FBQ0QsTUFBTXNSLFFBQVEsR0FBR2xOLE9BQU8sQ0FBQ3NFLE1BQVIsQ0FBZXhILFNBQWYsQ0FBeUIsVUFBQXVCLENBQUM7QUFBQSxXQUFJQSxDQUFDLENBQUNILElBQUYsS0FBV3NPLE1BQWY7QUFBQSxHQUExQixDQUFqQjs7QUFDQSxNQUFJVSxRQUFRLEdBQUcsQ0FBZixFQUFrQjtBQUNoQixXQUFPdFIsS0FBUDtBQUNEOztBQVI2RCxNQVN2RHVSLElBVHVELEdBUy9Dbk4sT0FBTyxDQUFDc0UsTUFBUixDQUFlNEksUUFBZixDQVQrQyxDQVN2REMsSUFUdUQ7QUFVOUQsTUFBTUMsSUFBSSxHQUFHcE4sT0FBTyxDQUFDOEIsT0FBUixDQUFnQi9GLEdBQWhCLENBQW9CLFVBQUFHLENBQUM7QUFBQSxXQUFJLGdDQUFnQkEsQ0FBQyxDQUFDZ1IsUUFBRCxDQUFqQixFQUE2QkMsSUFBN0IsQ0FBSjtBQUFBLEdBQXJCLEVBQTZERSxJQUE3RCxDQUFrRSxJQUFsRSxDQUFiO0FBRUEsbUNBQUtELElBQUw7QUFFQSxTQUFPeFIsS0FBUDtBQUNEO0FBRUQ7Ozs7OztBQUlPLFNBQVMwUiw2QkFBVCxDQUF1QzFSLEtBQXZDLEVBQThDO0FBQ25ELHlDQUNLQSxLQURMO0FBRUVWLElBQUFBLE1BQU0sa0NBQ0RVLEtBQUssQ0FBQ1YsTUFETDtBQUVKekIsTUFBQUEsT0FBTyxFQUFFLENBQUNtQyxLQUFLLENBQUNWLE1BQU4sQ0FBYXpCO0FBRm5CO0FBRlI7QUFPRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Y29uc29sZSBhcyBDb25zb2xlfSBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCB7ZGlzYWJsZVN0YWNrQ2FwdHVyaW5nLCB3aXRoVGFza30gZnJvbSAncmVhY3QtcGFsbS90YXNrcyc7XG5pbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnO1xuaW1wb3J0IHVuaXEgZnJvbSAnbG9kYXNoLnVuaXEnO1xuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcbmltcG9ydCB4b3IgZnJvbSAnbG9kYXNoLnhvcic7XG5pbXBvcnQgY29weSBmcm9tICdjb3B5LXRvLWNsaXBib2FyZCc7XG5pbXBvcnQge3BhcnNlRmllbGRWYWx1ZX0gZnJvbSAndXRpbHMvZGF0YS11dGlscyc7XG4vLyBUYXNrc1xuaW1wb3J0IHtMT0FEX0ZJTEVfVEFTSywgVU5XUkFQX1RBU0ssIFBST0NFU1NfRklMRV9EQVRBLCBERUxBWV9UQVNLfSBmcm9tICd0YXNrcy90YXNrcyc7XG4vLyBBY3Rpb25zXG5pbXBvcnQge1xuICBsb2FkRmlsZXNFcnIsXG4gIGxvYWRGaWxlc1N1Y2Nlc3MsXG4gIGxvYWRGaWxlU3RlcFN1Y2Nlc3MsXG4gIGxvYWROZXh0RmlsZSxcbiAgbmV4dEZpbGVCYXRjaFxufSBmcm9tICdhY3Rpb25zL3Zpcy1zdGF0ZS1hY3Rpb25zJztcbi8vIFV0aWxzXG5pbXBvcnQge2ZpbmRGaWVsZHNUb1Nob3csIGdldERlZmF1bHRJbnRlcmFjdGlvbn0gZnJvbSAndXRpbHMvaW50ZXJhY3Rpb24tdXRpbHMnO1xuaW1wb3J0IHtcbiAgYXBwbHlGaWx0ZXJGaWVsZE5hbWUsXG4gIGFwcGx5RmlsdGVyc1RvRGF0YXNldHMsXG4gIGZlYXR1cmVUb0ZpbHRlclZhbHVlLFxuICBGSUxURVJfVVBEQVRFUl9QUk9QUyxcbiAgZmlsdGVyRGF0YXNldENQVSxcbiAgZ2VuZXJhdGVQb2x5Z29uRmlsdGVyLFxuICBnZXREZWZhdWx0RmlsdGVyLFxuICBnZXREZWZhdWx0RmlsdGVyUGxvdFR5cGUsXG4gIGdldEZpbHRlcklkSW5GZWF0dXJlLFxuICBnZXRGaWx0ZXJQbG90LFxuICBpc0luUmFuZ2UsXG4gIExJTUlURURfRklMVEVSX0VGRkVDVF9QUk9QUyxcbiAgdXBkYXRlRmlsdGVyRGF0YUlkXG59IGZyb20gJ3V0aWxzL2ZpbHRlci11dGlscyc7XG5pbXBvcnQge2Fzc2lnbkdwdUNoYW5uZWwsIHNldEZpbHRlckdwdU1vZGV9IGZyb20gJ3V0aWxzL2dwdS1maWx0ZXItdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVOZXdEYXRhRW50cnksIHNvcnREYXRhc2V0QnlDb2x1bW59IGZyb20gJ3V0aWxzL2RhdGFzZXQtdXRpbHMnO1xuaW1wb3J0IHtzZXQsIHRvQXJyYXl9IGZyb20gJ3V0aWxzL3V0aWxzJztcblxuaW1wb3J0IHtjYWxjdWxhdGVMYXllckRhdGEsIGZpbmREZWZhdWx0TGF5ZXJ9IGZyb20gJ3V0aWxzL2xheWVyLXV0aWxzJztcblxuaW1wb3J0IHtpc1ZhbGlkTWVyZ2VyLCBWSVNfU1RBVEVfTUVSR0VSU30gZnJvbSAnLi92aXMtc3RhdGUtbWVyZ2VyJztcblxuaW1wb3J0IHtcbiAgYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcCxcbiAgY29tcHV0ZVNwbGl0TWFwTGF5ZXJzLFxuICByZW1vdmVMYXllckZyb21TcGxpdE1hcHNcbn0gZnJvbSAndXRpbHMvc3BsaXQtbWFwLXV0aWxzJztcblxuaW1wb3J0IHtMYXllciwgTGF5ZXJDbGFzc2VzfSBmcm9tICdsYXllcnMnO1xuaW1wb3J0IHtERUZBVUxUX1RFWFRfTEFCRUx9IGZyb20gJ2xheWVycy9sYXllci1mYWN0b3J5JztcbmltcG9ydCB7RURJVE9SX01PREVTLCBTT1JUX09SREVSfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge3BpY2tfLCBtZXJnZV99IGZyb20gJy4vY29tcG9zZXItaGVscGVycyc7XG5pbXBvcnQge3Byb2Nlc3NGaWxlQ29udGVudH0gZnJvbSAnYWN0aW9ucy92aXMtc3RhdGUtYWN0aW9ucyc7XG5cbmltcG9ydCBLZXBsZXJHTFNjaGVtYSBmcm9tICdzY2hlbWFzJztcbmltcG9ydCB7d3JhcFRvfSBmcm9tICdhY3Rpb25zL2FjdGlvbi13cmFwcGVyJztcblxuLy8gdHlwZSBpbXBvcnRzXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5GaWVsZH0gRmllbGQgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLkZpbHRlcn0gRmlsdGVyICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5EYXRhc2V0fSBEYXRhc2V0ICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5WaXNTdGF0ZX0gVmlzU3RhdGUgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLkRhdGFzZXRzfSBEYXRhc2V0cyAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuQW5pbWF0aW9uQ29uZmlnfSBBbmltYXRpb25Db25maWcgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLkVkaXRvcn0gRWRpdG9yICovXG5cbi8vIHJlYWN0LXBhbG1cbi8vIGRpc2FibGUgY2FwdHVyZSBleGNlcHRpb24gZm9yIHJlYWN0LXBhbG0gY2FsbCB0byB3aXRoVGFza1xuZGlzYWJsZVN0YWNrQ2FwdHVyaW5nKCk7XG5cbi8qKlxuICogVXBkYXRlcnMgZm9yIGB2aXNTdGF0ZWAgcmVkdWNlci4gQ2FuIGJlIHVzZWQgaW4geW91ciByb290IHJlZHVjZXIgdG8gZGlyZWN0bHkgbW9kaWZ5IGtlcGxlci5nbCdzIHN0YXRlLlxuICogUmVhZCBtb3JlIGFib3V0IFtVc2luZyB1cGRhdGVyc10oLi4vYWR2YW5jZWQtdXNhZ2UvdXNpbmctdXBkYXRlcnMubWQpXG4gKlxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQga2VwbGVyR2xSZWR1Y2VyLCB7dmlzU3RhdGVVcGRhdGVyc30gZnJvbSAna2VwbGVyLmdsL3JlZHVjZXJzJztcbiAqIC8vIFJvb3QgUmVkdWNlclxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGtlcGxlckdsOiBrZXBsZXJHbFJlZHVjZXIsXG4gKiAgYXBwOiBhcHBSZWR1Y2VyXG4gKiB9KTtcbiAqXG4gKiBjb25zdCBjb21wb3NlZFJlZHVjZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICogIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAqICAgIGNhc2UgJ0NMSUNLX0JVVFRPTic6XG4gKiAgICAgIHJldHVybiB7XG4gKiAgICAgICAgLi4uc3RhdGUsXG4gKiAgICAgICAga2VwbGVyR2w6IHtcbiAqICAgICAgICAgIC4uLnN0YXRlLmtlcGxlckdsLFxuICogICAgICAgICAgZm9vOiB7XG4gKiAgICAgICAgICAgICAuLi5zdGF0ZS5rZXBsZXJHbC5mb28sXG4gKiAgICAgICAgICAgICB2aXNTdGF0ZTogdmlzU3RhdGVVcGRhdGVycy5lbmxhcmdlRmlsdGVyVXBkYXRlcihcbiAqICAgICAgICAgICAgICAgc3RhdGUua2VwbGVyR2wuZm9vLnZpc1N0YXRlLFxuICogICAgICAgICAgICAgICB7aWR4OiAwfVxuICogICAgICAgICAgICAgKVxuICogICAgICAgICAgfVxuICogICAgICAgIH1cbiAqICAgICAgfTtcbiAqICB9XG4gKiAgcmV0dXJuIHJlZHVjZXJzKHN0YXRlLCBhY3Rpb24pO1xuICogfTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBjb21wb3NlZFJlZHVjZXI7XG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4vLyBAdHMtaWdub3JlXG5jb25zdCB2aXNTdGF0ZVVwZGF0ZXJzID0gbnVsbDtcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuLyoqIEB0eXBlIHtBbmltYXRpb25Db25maWd9ICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9BTklNQVRJT05fQ09ORklHID0ge1xuICBkb21haW46IG51bGwsXG4gIGN1cnJlbnRUaW1lOiBudWxsLFxuICBzcGVlZDogMVxufTtcblxuLyoqIEB0eXBlIHtFZGl0b3J9ICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9FRElUT1IgPSB7XG4gIG1vZGU6IEVESVRPUl9NT0RFUy5EUkFXX1BPTFlHT04sXG4gIGZlYXR1cmVzOiBbXSxcbiAgc2VsZWN0ZWRGZWF0dXJlOiBudWxsLFxuICB2aXNpYmxlOiB0cnVlXG59O1xuXG4vKipcbiAqIERlZmF1bHQgaW5pdGlhbCBgdmlzU3RhdGVgXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQGNvbnN0YW50XG4gKiBAdHlwZSB7VmlzU3RhdGV9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBJTklUSUFMX1ZJU19TVEFURSA9IHtcbiAgLy8gbWFwIGluZm9cbiAgbWFwSW5mbzoge1xuICAgIHRpdGxlOiAnJyxcbiAgICBkZXNjcmlwdGlvbjogJydcbiAgfSxcbiAgLy8gbGF5ZXJzXG4gIGxheWVyczogW10sXG4gIGxheWVyRGF0YTogW10sXG4gIGxheWVyVG9CZU1lcmdlZDogW10sXG4gIGxheWVyT3JkZXI6IFtdLFxuXG4gIC8vIGZpbHRlcnNcbiAgZmlsdGVyczogW10sXG4gIGZpbHRlclRvQmVNZXJnZWQ6IFtdLFxuXG4gIC8vIGEgY29sbGVjdGlvbiBvZiBtdWx0aXBsZSBkYXRhc2V0XG4gIGRhdGFzZXRzOiB7fSxcbiAgZWRpdGluZ0RhdGFzZXQ6IHVuZGVmaW5lZCxcblxuICBpbnRlcmFjdGlvbkNvbmZpZzogZ2V0RGVmYXVsdEludGVyYWN0aW9uKCksXG4gIGludGVyYWN0aW9uVG9CZU1lcmdlZDogdW5kZWZpbmVkLFxuXG4gIGxheWVyQmxlbmRpbmc6ICdub3JtYWwnLFxuICBob3ZlckluZm86IHVuZGVmaW5lZCxcbiAgY2xpY2tlZDogdW5kZWZpbmVkLFxuICBtb3VzZVBvczoge30sXG5cbiAgLy8gdGhpcyBpcyB1c2VkIHdoZW4gdXNlciBzcGxpdCBtYXBzXG4gIHNwbGl0TWFwczogW1xuICAgIC8vIHRoaXMgd2lsbCBjb250YWluIGEgbGlzdCBvZiBvYmplY3RzIHRvXG4gICAgLy8gZGVzY3JpYmUgdGhlIHN0YXRlIG9mIGxheWVyIGF2YWlsYWJpbGl0eSBhbmQgdmlzaWJpbGl0eSBmb3IgZWFjaCBtYXBcbiAgICAvLyBbXG4gICAgLy8gICB7XG4gICAgLy8gICAgICBsYXllcnM6IHtsYXllcl9pZDogdHJ1ZSB8IGZhbHNlfVxuICAgIC8vICAgfVxuICAgIC8vIF1cbiAgXSxcbiAgc3BsaXRNYXBzVG9CZU1lcmdlZDogW10sXG5cbiAgLy8gZGVmYXVsdHMgbGF5ZXIgY2xhc3Nlc1xuICBsYXllckNsYXNzZXM6IExheWVyQ2xhc3NlcyxcblxuICAvLyBkZWZhdWx0IGFuaW1hdGlvblxuICAvLyB0aW1lIGluIHVuaXggdGltZXN0YW1wIChtaWxsaXNlY29uZHMpICh0aGUgbnVtYmVyIG9mIHNlY29uZHMgc2luY2UgdGhlIFVuaXggRXBvY2gpXG4gIGFuaW1hdGlvbkNvbmZpZzogREVGQVVMVF9BTklNQVRJT05fQ09ORklHLFxuXG4gIGVkaXRvcjogREVGQVVMVF9FRElUT1IsXG5cbiAgZmlsZUxvYWRpbmc6IGZhbHNlLFxuICBmaWxlTG9hZGluZ1Byb2dyZXNzOiB7fSxcblxuICBsb2FkZXJzOiBbXSxcbiAgbG9hZE9wdGlvbnM6IHt9LFxuXG4gIC8vIHZpc1N0YXRlTWVyZ2Vyc1xuICBtZXJnZXJzOiBWSVNfU1RBVEVfTUVSR0VSUyxcblxuICBzY2hlbWE6IEtlcGxlckdMU2NoZW1hXG59O1xuXG4vKipcbiAqIFVwZGF0ZSBzdGF0ZSB3aXRoIHVwZGF0ZWQgbGF5ZXIgYW5kIGxheWVyRGF0YVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykudXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhfVxuICpcbiAqL1xuZnVuY3Rpb24gdXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhKHN0YXRlLCB7bGF5ZXJEYXRhLCBsYXllciwgaWR4fSkge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGxheWVyczogc3RhdGUubGF5ZXJzLm1hcCgobHlyLCBpKSA9PiAoaSA9PT0gaWR4ID8gbGF5ZXIgOiBseXIpKSxcbiAgICBsYXllckRhdGE6IGxheWVyRGF0YVxuICAgICAgPyBzdGF0ZS5sYXllckRhdGEubWFwKChkLCBpKSA9PiAoaSA9PT0gaWR4ID8gbGF5ZXJEYXRhIDogZCkpXG4gICAgICA6IHN0YXRlLmxheWVyRGF0YVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3RhdGVPbkxheWVyVmlzaWJpbGl0eUNoYW5nZShzdGF0ZSwgbGF5ZXIpIHtcbiAgbGV0IG5ld1N0YXRlID0gc3RhdGU7XG4gIGlmIChzdGF0ZS5zcGxpdE1hcHMubGVuZ3RoKSB7XG4gICAgbmV3U3RhdGUgPSB7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIHNwbGl0TWFwczogbGF5ZXIuY29uZmlnLmlzVmlzaWJsZVxuICAgICAgICA/IGFkZE5ld0xheWVyc1RvU3BsaXRNYXAoc3RhdGUuc3BsaXRNYXBzLCBsYXllcilcbiAgICAgICAgOiByZW1vdmVMYXllckZyb21TcGxpdE1hcHMoc3RhdGUuc3BsaXRNYXBzLCBsYXllcilcbiAgICB9O1xuICB9XG5cbiAgaWYgKGxheWVyLmNvbmZpZy5hbmltYXRpb24uZW5hYmxlZCkge1xuICAgIG5ld1N0YXRlID0gdXBkYXRlQW5pbWF0aW9uRG9tYWluKHN0YXRlKTtcbiAgfVxuXG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgbGF5ZXIgYmFzZSBjb25maWc6IGRhdGFJZCwgbGFiZWwsIGNvbHVtbiwgaXNWaXNpYmxlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykubGF5ZXJDb25maWdDaGFuZ2VVcGRhdGVyfVxuICogQHJldHVybnMgbmV4dFN0YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllckNvbmZpZ0NoYW5nZVVwZGF0ZXIoc3RhdGUsIGFjdGlvbikge1xuICBjb25zdCB7b2xkTGF5ZXJ9ID0gYWN0aW9uO1xuICBjb25zdCBpZHggPSBzdGF0ZS5sYXllcnMuZmluZEluZGV4KGwgPT4gbC5pZCA9PT0gb2xkTGF5ZXIuaWQpO1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKGFjdGlvbi5uZXdDb25maWcpO1xuICBsZXQgbmV3TGF5ZXIgPSBvbGRMYXllci51cGRhdGVMYXllckNvbmZpZyhhY3Rpb24ubmV3Q29uZmlnKTtcblxuICBsZXQgbGF5ZXJEYXRhO1xuXG4gIC8vIGxldCBuZXdMYXllcjtcbiAgaWYgKG5ld0xheWVyLnNob3VsZENhbGN1bGF0ZUxheWVyRGF0YShwcm9wcykpIHtcbiAgICBjb25zdCBvbGRMYXllckRhdGEgPSBzdGF0ZS5sYXllckRhdGFbaWR4XTtcbiAgICBjb25zdCB1cGRhdGVMYXllckRhdGFSZXN1bHQgPSBjYWxjdWxhdGVMYXllckRhdGEobmV3TGF5ZXIsIHN0YXRlLCBvbGRMYXllckRhdGEpO1xuXG4gICAgbGF5ZXJEYXRhID0gdXBkYXRlTGF5ZXJEYXRhUmVzdWx0LmxheWVyRGF0YTtcbiAgICBuZXdMYXllciA9IHVwZGF0ZUxheWVyRGF0YVJlc3VsdC5sYXllcjtcbiAgfVxuXG4gIGxldCBuZXdTdGF0ZSA9IHN0YXRlO1xuICBpZiAoJ2lzVmlzaWJsZScgaW4gYWN0aW9uLm5ld0NvbmZpZykge1xuICAgIG5ld1N0YXRlID0gdXBkYXRlU3RhdGVPbkxheWVyVmlzaWJpbGl0eUNoYW5nZShzdGF0ZSwgbmV3TGF5ZXIpO1xuICB9XG5cbiAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShuZXdTdGF0ZSwge1xuICAgIGxheWVyOiBuZXdMYXllcixcbiAgICBsYXllckRhdGEsXG4gICAgaWR4XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRPclJlbW92ZVRleHRMYWJlbHMobmV3RmllbGRzLCB0ZXh0TGFiZWwpIHtcbiAgbGV0IG5ld1RleHRMYWJlbCA9IHRleHRMYWJlbC5zbGljZSgpO1xuXG4gIGNvbnN0IGN1cnJlbnRGaWVsZHMgPSB0ZXh0TGFiZWwubWFwKHRsID0+IHRsLmZpZWxkICYmIHRsLmZpZWxkLm5hbWUpLmZpbHRlcihkID0+IGQpO1xuXG4gIGNvbnN0IGFkZEZpZWxkcyA9IG5ld0ZpZWxkcy5maWx0ZXIoZiA9PiAhY3VycmVudEZpZWxkcy5pbmNsdWRlcyhmLm5hbWUpKTtcbiAgY29uc3QgZGVsZXRlRmllbGRzID0gY3VycmVudEZpZWxkcy5maWx0ZXIoZiA9PiAhbmV3RmllbGRzLmZpbmQoZmQgPT4gZmQubmFtZSA9PT0gZikpO1xuXG4gIC8vIGRlbGV0ZVxuICBuZXdUZXh0TGFiZWwgPSBuZXdUZXh0TGFiZWwuZmlsdGVyKHRsID0+IHRsLmZpZWxkICYmICFkZWxldGVGaWVsZHMuaW5jbHVkZXModGwuZmllbGQubmFtZSkpO1xuICBuZXdUZXh0TGFiZWwgPSAhbmV3VGV4dExhYmVsLmxlbmd0aCA/IFtERUZBVUxUX1RFWFRfTEFCRUxdIDogbmV3VGV4dExhYmVsO1xuXG4gIC8vIGFkZFxuICBuZXdUZXh0TGFiZWwgPSBbXG4gICAgLi4ubmV3VGV4dExhYmVsLmZpbHRlcih0bCA9PiB0bC5maWVsZCksXG4gICAgLi4uYWRkRmllbGRzLm1hcChhZiA9PiAoe1xuICAgICAgLi4uREVGQVVMVF9URVhUX0xBQkVMLFxuICAgICAgZmllbGQ6IGFmXG4gICAgfSkpXG4gIF07XG5cbiAgcmV0dXJuIG5ld1RleHRMYWJlbDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGV4dExhYmVsUHJvcEFuZFZhbHVlKGlkeCwgcHJvcCwgdmFsdWUsIHRleHRMYWJlbCkge1xuICBpZiAoIXRleHRMYWJlbFtpZHhdLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgcmV0dXJuIHRleHRMYWJlbDtcbiAgfVxuXG4gIGxldCBuZXdUZXh0TGFiZWwgPSB0ZXh0TGFiZWwuc2xpY2UoKTtcblxuICBpZiAocHJvcCAmJiAodmFsdWUgfHwgdGV4dExhYmVsLmxlbmd0aCA9PT0gMSkpIHtcbiAgICBuZXdUZXh0TGFiZWwgPSB0ZXh0TGFiZWwubWFwKCh0bCwgaSkgPT4gKGkgPT09IGlkeCA/IHsuLi50bCwgW3Byb3BdOiB2YWx1ZX0gOiB0bCkpO1xuICB9IGVsc2UgaWYgKHByb3AgPT09ICdmaWVsZCcgJiYgdmFsdWUgPT09IG51bGwgJiYgdGV4dExhYmVsLmxlbmd0aCA+IDEpIHtcbiAgICAvLyByZW1vdmUgbGFiZWwgd2hlbiBmaWVsZCB2YWx1ZSBpcyBzZXQgdG8gbnVsbFxuICAgIG5ld1RleHRMYWJlbC5zcGxpY2UoaWR4LCAxKTtcbiAgfVxuXG4gIHJldHVybiBuZXdUZXh0TGFiZWw7XG59XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIGJhc2UgY29uZmlnOiBkYXRhSWQsIGxhYmVsLCBjb2x1bW4sIGlzVmlzaWJsZVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmxheWVyVGV4dExhYmVsQ2hhbmdlVXBkYXRlcn1cbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJUZXh0TGFiZWxDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge29sZExheWVyLCBpZHgsIHByb3AsIHZhbHVlfSA9IGFjdGlvbjtcbiAgY29uc3Qge3RleHRMYWJlbH0gPSBvbGRMYXllci5jb25maWc7XG5cbiAgbGV0IG5ld1RleHRMYWJlbCA9IHRleHRMYWJlbC5zbGljZSgpO1xuICBpZiAoIXRleHRMYWJlbFtpZHhdICYmIGlkeCA9PT0gdGV4dExhYmVsLmxlbmd0aCkge1xuICAgIC8vIGlmIGlkeCBpcyBzZXQgdG8gbGVuZ3RoLCBhZGQgZW1wdHkgdGV4dCBsYWJlbFxuICAgIG5ld1RleHRMYWJlbCA9IFsuLi50ZXh0TGFiZWwsIERFRkFVTFRfVEVYVF9MQUJFTF07XG4gIH1cblxuICBpZiAoaWR4ID09PSAnYWxsJyAmJiBwcm9wID09PSAnZmllbGRzJykge1xuICAgIG5ld1RleHRMYWJlbCA9IGFkZE9yUmVtb3ZlVGV4dExhYmVscyh2YWx1ZSwgdGV4dExhYmVsKTtcbiAgfSBlbHNlIHtcbiAgICBuZXdUZXh0TGFiZWwgPSB1cGRhdGVUZXh0TGFiZWxQcm9wQW5kVmFsdWUoaWR4LCBwcm9wLCB2YWx1ZSwgbmV3VGV4dExhYmVsKTtcbiAgfVxuXG4gIC8vIHVwZGF0ZSB0ZXh0IGxhYmVsIHByb3AgYW5kIHZhbHVlXG4gIHJldHVybiBsYXllckNvbmZpZ0NoYW5nZVVwZGF0ZXIoc3RhdGUsIHtcbiAgICBvbGRMYXllcixcbiAgICBuZXdDb25maWc6IHt0ZXh0TGFiZWw6IG5ld1RleHRMYWJlbH1cbiAgfSk7XG59XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIHR5cGUuIFByZXZpZXdzIGxheWVyIGNvbmZpZyB3aWxsIGJlIGNvcGllZCBpZiBhcHBsaWNhYmxlLlxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmxheWVyVHlwZUNoYW5nZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllclR5cGVDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge29sZExheWVyLCBuZXdUeXBlfSA9IGFjdGlvbjtcbiAgaWYgKCFvbGRMYXllcikge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuICBjb25zdCBvbGRJZCA9IG9sZExheWVyLmlkO1xuICBjb25zdCBpZHggPSBzdGF0ZS5sYXllcnMuZmluZEluZGV4KGwgPT4gbC5pZCA9PT0gb2xkSWQpO1xuXG4gIGlmICghc3RhdGUubGF5ZXJDbGFzc2VzW25ld1R5cGVdKSB7XG4gICAgQ29uc29sZS5lcnJvcihgJHtuZXdUeXBlfSBpcyBub3QgYSB2YWxpZCBsYXllciB0eXBlYCk7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLy8gZ2V0IGEgbWludCBsYXllciwgd2l0aCBuZXcgaWQgYW5kIHR5cGVcbiAgLy8gYmVjYXVzZSBkZWNrLmdsIHVzZXMgaWQgdG8gbWF0Y2ggYmV0d2VlbiBuZXcgYW5kIG9sZCBsYXllci5cbiAgLy8gSWYgdHlwZSBoYXMgY2hhbmdlZCBidXQgaWQgaXMgdGhlIHNhbWUsIGl0IHdpbGwgYnJlYWtcbiAgY29uc3QgbmV3TGF5ZXIgPSBuZXcgc3RhdGUubGF5ZXJDbGFzc2VzW25ld1R5cGVdKCk7XG5cbiAgbmV3TGF5ZXIuYXNzaWduQ29uZmlnVG9MYXllcihvbGRMYXllci5jb25maWcsIG9sZExheWVyLnZpc0NvbmZpZ1NldHRpbmdzKTtcblxuICAvLyBpZiAobmV3TGF5ZXIuY29uZmlnLmRhdGFJZCkge1xuICAvLyAgIGNvbnN0IGRhdGFzZXQgPSBzdGF0ZS5kYXRhc2V0c1tuZXdMYXllci5jb25maWcuZGF0YUlkXTtcbiAgLy8gICBuZXdMYXllci51cGRhdGVMYXllckRvbWFpbihkYXRhc2V0KTtcbiAgLy8gfVxuICBuZXdMYXllci51cGRhdGVMYXllckRvbWFpbihzdGF0ZS5kYXRhc2V0cyk7XG4gIGNvbnN0IHtsYXllckRhdGEsIGxheWVyfSA9IGNhbGN1bGF0ZUxheWVyRGF0YShuZXdMYXllciwgc3RhdGUpO1xuICBsZXQgbmV3U3RhdGUgPSB1cGRhdGVTdGF0ZVdpdGhMYXllckFuZERhdGEoc3RhdGUsIHtsYXllckRhdGEsIGxheWVyLCBpZHh9KTtcblxuICBpZiAobGF5ZXIuY29uZmlnLmFuaW1hdGlvbi5lbmFibGVkIHx8IG9sZExheWVyLmNvbmZpZy5hbmltYXRpb24uZW5hYmxlZCkge1xuICAgIG5ld1N0YXRlID0gdXBkYXRlQW5pbWF0aW9uRG9tYWluKG5ld1N0YXRlKTtcbiAgfVxuXG4gIC8vIHVwZGF0ZSBzcGxpdE1hcCBsYXllciBpZFxuICBpZiAoc3RhdGUuc3BsaXRNYXBzLmxlbmd0aCkge1xuICAgIG5ld1N0YXRlID0ge1xuICAgICAgLi4ubmV3U3RhdGUsXG4gICAgICBzcGxpdE1hcHM6IG5ld1N0YXRlLnNwbGl0TWFwcy5tYXAoc2V0dGluZ3MgPT4ge1xuICAgICAgICBjb25zdCB7W29sZElkXTogb2xkTGF5ZXJNYXAsIC4uLm90aGVyTGF5ZXJzfSA9IHNldHRpbmdzLmxheWVycztcbiAgICAgICAgcmV0dXJuIG9sZElkIGluIHNldHRpbmdzLmxheWVyc1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAuLi5zZXR0aW5ncyxcbiAgICAgICAgICAgICAgbGF5ZXJzOiB7XG4gICAgICAgICAgICAgICAgLi4ub3RoZXJMYXllcnMsXG4gICAgICAgICAgICAgICAgW2xheWVyLmlkXTogb2xkTGF5ZXJNYXBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogc2V0dGluZ3M7XG4gICAgICB9KVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gbmV3U3RhdGU7XG59XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIHZpc3VhbCBjaGFubmVsXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykubGF5ZXJWaXN1YWxDaGFubmVsQ2hhbmdlVXBkYXRlcn1cbiAqIEByZXR1cm5zIHtPYmplY3R9IG5leHRTdGF0ZVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJWaXN1YWxDaGFubmVsQ2hhbmdlVXBkYXRlcihzdGF0ZSwgYWN0aW9uKSB7XG4gIGNvbnN0IHtvbGRMYXllciwgbmV3Q29uZmlnLCBjaGFubmVsfSA9IGFjdGlvbjtcbiAgaWYgKCFvbGRMYXllci5jb25maWcuZGF0YUlkKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIGNvbnN0IGRhdGFzZXQgPSBzdGF0ZS5kYXRhc2V0c1tvbGRMYXllci5jb25maWcuZGF0YUlkXTtcblxuICBjb25zdCBpZHggPSBzdGF0ZS5sYXllcnMuZmluZEluZGV4KGwgPT4gbC5pZCA9PT0gb2xkTGF5ZXIuaWQpO1xuICBjb25zdCBuZXdMYXllciA9IG9sZExheWVyLnVwZGF0ZUxheWVyQ29uZmlnKG5ld0NvbmZpZyk7XG5cbiAgbmV3TGF5ZXIudXBkYXRlTGF5ZXJWaXN1YWxDaGFubmVsKGRhdGFzZXQsIGNoYW5uZWwpO1xuXG4gIGNvbnN0IG9sZExheWVyRGF0YSA9IHN0YXRlLmxheWVyRGF0YVtpZHhdO1xuICBjb25zdCB7bGF5ZXJEYXRhLCBsYXllcn0gPSBjYWxjdWxhdGVMYXllckRhdGEobmV3TGF5ZXIsIHN0YXRlLCBvbGRMYXllckRhdGEpO1xuXG4gIHJldHVybiB1cGRhdGVTdGF0ZVdpdGhMYXllckFuZERhdGEoc3RhdGUsIHtsYXllckRhdGEsIGxheWVyLCBpZHh9KTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgbGF5ZXIgYHZpc0NvbmZpZ2BcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5sYXllclZpc0NvbmZpZ0NoYW5nZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllclZpc0NvbmZpZ0NoYW5nZVVwZGF0ZXIoc3RhdGUsIGFjdGlvbikge1xuICBjb25zdCB7b2xkTGF5ZXJ9ID0gYWN0aW9uO1xuICBjb25zdCBpZHggPSBzdGF0ZS5sYXllcnMuZmluZEluZGV4KGwgPT4gbC5pZCA9PT0gb2xkTGF5ZXIuaWQpO1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKGFjdGlvbi5uZXdWaXNDb25maWcpO1xuICBjb25zdCBuZXdWaXNDb25maWcgPSB7XG4gICAgLi4ub2xkTGF5ZXIuY29uZmlnLnZpc0NvbmZpZyxcbiAgICAuLi5hY3Rpb24ubmV3VmlzQ29uZmlnXG4gIH07XG5cbiAgY29uc3QgbmV3TGF5ZXIgPSBvbGRMYXllci51cGRhdGVMYXllckNvbmZpZyh7dmlzQ29uZmlnOiBuZXdWaXNDb25maWd9KTtcblxuICBpZiAobmV3TGF5ZXIuc2hvdWxkQ2FsY3VsYXRlTGF5ZXJEYXRhKHByb3BzKSkge1xuICAgIGNvbnN0IG9sZExheWVyRGF0YSA9IHN0YXRlLmxheWVyRGF0YVtpZHhdO1xuICAgIGNvbnN0IHtsYXllckRhdGEsIGxheWVyfSA9IGNhbGN1bGF0ZUxheWVyRGF0YShuZXdMYXllciwgc3RhdGUsIG9sZExheWVyRGF0YSk7XG4gICAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShzdGF0ZSwge2xheWVyRGF0YSwgbGF5ZXIsIGlkeH0pO1xuICB9XG5cbiAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShzdGF0ZSwge2xheWVyOiBuZXdMYXllciwgaWR4fSk7XG59XG5cbi8qKlxuICogVXBkYXRlIGZpbHRlciBwcm9wZXJ0eVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnNldEZpbHRlclVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXJVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge2lkeCwgcHJvcCwgdmFsdWUsIHZhbHVlSW5kZXggPSAwfSA9IGFjdGlvbjtcblxuICBjb25zdCBvbGRGaWx0ZXIgPSBzdGF0ZS5maWx0ZXJzW2lkeF07XG4gIGxldCBuZXdGaWx0ZXIgPSBzZXQoW3Byb3BdLCB2YWx1ZSwgb2xkRmlsdGVyKTtcbiAgbGV0IG5ld1N0YXRlID0gc3RhdGU7XG5cbiAgY29uc3Qge2RhdGFJZH0gPSBuZXdGaWx0ZXI7XG5cbiAgLy8gRW5zdXJpbmcgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICBsZXQgZGF0YXNldElkcyA9IHRvQXJyYXkoZGF0YUlkKTtcblxuICBzd2l0Y2ggKHByb3ApIHtcbiAgICAvLyBUT0RPOiBOZXh0IFBSIGZvciBVSSBpZiB3ZSB1cGRhdGUgZGF0YUlkLCB3ZSBuZWVkIHRvIGNvbnNpZGVyIHR3byBjYXNlczpcbiAgICAvLyAxLiBkYXRhSWQgaXMgZW1wdHk6IGNyZWF0ZSBhIGRlZmF1bHQgZmlsdGVyXG4gICAgLy8gMi4gQWRkIGEgbmV3IGRhdGFzZXQgaWRcbiAgICBjYXNlIEZJTFRFUl9VUERBVEVSX1BST1BTLmRhdGFJZDpcbiAgICAgIC8vIGlmIHRyeWluZyB0byB1cGRhdGUgZmlsdGVyIGRhdGFJZC4gY3JlYXRlIGFuIGVtcHR5IG5ldyBmaWx0ZXJcbiAgICAgIG5ld0ZpbHRlciA9IHVwZGF0ZUZpbHRlckRhdGFJZChkYXRhSWQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIEZJTFRFUl9VUERBVEVSX1BST1BTLm5hbWU6XG4gICAgICAvLyB3ZSBhcmUgc3VwcG9ydGluZyB0aGUgY3VycmVudCBmdW5jdGlvbmFsaXR5XG4gICAgICAvLyBUT0RPOiBOZXh0IFBSIGZvciBVSSBmaWx0ZXIgbmFtZSB3aWxsIG9ubHkgdXBkYXRlIGZpbHRlciBuYW1lIGJ1dCBpdCB3b24ndCBoYXZlIHNpZGUgZWZmZWN0c1xuICAgICAgLy8gd2UgYXJlIGdvbm5hIHVzZSBwYWlyIG9mIGRhdGFzZXRzIGFuZCBmaWVsZElkeCB0byB1cGRhdGUgdGhlIGZpbHRlclxuICAgICAgY29uc3QgZGF0YXNldElkID0gbmV3RmlsdGVyLmRhdGFJZFt2YWx1ZUluZGV4XTtcbiAgICAgIGNvbnN0IHtmaWx0ZXI6IHVwZGF0ZWRGaWx0ZXIsIGRhdGFzZXQ6IG5ld0RhdGFzZXR9ID0gYXBwbHlGaWx0ZXJGaWVsZE5hbWUoXG4gICAgICAgIG5ld0ZpbHRlcixcbiAgICAgICAgc3RhdGUuZGF0YXNldHNbZGF0YXNldElkXSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHZhbHVlSW5kZXgsXG4gICAgICAgIHttZXJnZURvbWFpbjogZmFsc2V9XG4gICAgICApO1xuICAgICAgaWYgKCF1cGRhdGVkRmlsdGVyKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgIH1cblxuICAgICAgbmV3RmlsdGVyID0gdXBkYXRlZEZpbHRlcjtcblxuICAgICAgaWYgKG5ld0ZpbHRlci5ncHUpIHtcbiAgICAgICAgbmV3RmlsdGVyID0gc2V0RmlsdGVyR3B1TW9kZShuZXdGaWx0ZXIsIHN0YXRlLmZpbHRlcnMpO1xuICAgICAgICBuZXdGaWx0ZXIgPSBhc3NpZ25HcHVDaGFubmVsKG5ld0ZpbHRlciwgc3RhdGUuZmlsdGVycyk7XG4gICAgICB9XG5cbiAgICAgIG5ld1N0YXRlID0gc2V0KFsnZGF0YXNldHMnLCBkYXRhc2V0SWRdLCBuZXdEYXRhc2V0LCBzdGF0ZSk7XG5cbiAgICAgIC8vIG9ubHkgZmlsdGVyIHRoZSBjdXJyZW50IGRhdGFzZXRcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRklMVEVSX1VQREFURVJfUFJPUFMubGF5ZXJJZDpcbiAgICAgIC8vIFdlIG5lZWQgdG8gdXBkYXRlIG9ubHkgZGF0YXNldElkL3MgaWYgd2UgaGF2ZSBhZGRlZC9yZW1vdmVkIGxheWVyc1xuICAgICAgLy8gLSBjaGVjayBmb3IgbGF5ZXJJZCBjaGFuZ2VzIChYT1Igd29ya3MgYmVjYXVzZSBvZiBzdHJpbmcgdmFsdWVzKVxuICAgICAgLy8gaWYgbm8gZGlmZmVyZW5jZXMgYmV0d2VlbiBsYXllcklkcywgZG9uJ3QgZG8gYW55IGZpbHRlcmluZ1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgbGF5ZXJJZERpZmZlcmVuY2UgPSB4b3IobmV3RmlsdGVyLmxheWVySWQsIG9sZEZpbHRlci5sYXllcklkKTtcblxuICAgICAgY29uc3QgbGF5ZXJEYXRhSWRzID0gdW5pcShcbiAgICAgICAgbGF5ZXJJZERpZmZlcmVuY2VcbiAgICAgICAgICAubWFwKGxpZCA9PlxuICAgICAgICAgICAgZ2V0KFxuICAgICAgICAgICAgICBzdGF0ZS5sYXllcnMuZmluZChsID0+IGwuaWQgPT09IGxpZCksXG4gICAgICAgICAgICAgIFsnY29uZmlnJywgJ2RhdGFJZCddXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgIC5maWx0ZXIoZCA9PiBkKVxuICAgICAgKTtcblxuICAgICAgLy8gb25seSBmaWx0ZXIgZGF0YXNldHNJZHNcbiAgICAgIGRhdGFzZXRJZHMgPSBsYXllckRhdGFJZHM7XG5cbiAgICAgIC8vIFVwZGF0ZSBuZXdGaWx0ZXIgZGF0YUlkc1xuICAgICAgY29uc3QgbmV3RGF0YUlkcyA9IHVuaXEoXG4gICAgICAgIG5ld0ZpbHRlci5sYXllcklkXG4gICAgICAgICAgLm1hcChsaWQgPT5cbiAgICAgICAgICAgIGdldChcbiAgICAgICAgICAgICAgc3RhdGUubGF5ZXJzLmZpbmQobCA9PiBsLmlkID09PSBsaWQpLFxuICAgICAgICAgICAgICBbJ2NvbmZpZycsICdkYXRhSWQnXVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgICAuZmlsdGVyKGQgPT4gZClcbiAgICAgICk7XG5cbiAgICAgIG5ld0ZpbHRlciA9IHtcbiAgICAgICAgLi4ubmV3RmlsdGVyLFxuICAgICAgICBkYXRhSWQ6IG5ld0RhdGFJZHNcbiAgICAgIH07XG5cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGNvbnN0IGVubGFyZ2VkRmlsdGVyID0gc3RhdGUuZmlsdGVycy5maW5kKGYgPT4gZi5lbmxhcmdlZCk7XG5cbiAgaWYgKGVubGFyZ2VkRmlsdGVyICYmIGVubGFyZ2VkRmlsdGVyLmlkICE9PSBuZXdGaWx0ZXIuaWQpIHtcbiAgICAvLyB0aGVyZSBzaG91bGQgYmUgb25seSBvbmUgZW5sYXJnZWQgZmlsdGVyXG4gICAgbmV3RmlsdGVyLmVubGFyZ2VkID0gZmFsc2U7XG4gIH1cblxuICAvLyBzYXZlIG5ldyBmaWx0ZXJzIHRvIG5ld1N0YXRlXG4gIG5ld1N0YXRlID0gc2V0KFsnZmlsdGVycycsIGlkeF0sIG5ld0ZpbHRlciwgbmV3U3RhdGUpO1xuXG4gIC8vIGlmIHdlIGFyZSBjdXJyZW50bHkgc2V0dGluZyBhIHByb3AgdGhhdCBvbmx5IHJlcXVpcmVzIHRvIGZpbHRlciB0aGUgY3VycmVudFxuICAvLyBkYXRhc2V0IHdlIHdpbGwgcGFzcyBvbmx5IHRoZSBjdXJyZW50IGRhdGFzZXQgdG8gYXBwbHlGaWx0ZXJzVG9EYXRhc2V0cyBhbmRcbiAgLy8gdXBkYXRlQWxsTGF5ZXJEb21haW5EYXRhIG90aGVyd2lzZSB3ZSBwYXNzIHRoZSBhbGwgbGlzdCBvZiBkYXRhc2V0cyBhcyBkZWZpbmVkIGluIGRhdGFJZFxuICBjb25zdCBkYXRhc2V0SWRzVG9GaWx0ZXIgPSBMSU1JVEVEX0ZJTFRFUl9FRkZFQ1RfUFJPUFNbcHJvcF1cbiAgICA/IFtkYXRhc2V0SWRzW3ZhbHVlSW5kZXhdXVxuICAgIDogZGF0YXNldElkcztcblxuICAvLyBmaWx0ZXIgZGF0YVxuICBjb25zdCBmaWx0ZXJlZERhdGFzZXRzID0gYXBwbHlGaWx0ZXJzVG9EYXRhc2V0cyhcbiAgICBkYXRhc2V0SWRzVG9GaWx0ZXIsXG4gICAgbmV3U3RhdGUuZGF0YXNldHMsXG4gICAgbmV3U3RhdGUuZmlsdGVycyxcbiAgICBuZXdTdGF0ZS5sYXllcnNcbiAgKTtcblxuICBuZXdTdGF0ZSA9IHNldChbJ2RhdGFzZXRzJ10sIGZpbHRlcmVkRGF0YXNldHMsIG5ld1N0YXRlKTtcbiAgLy8gZGF0YUlkIGlzIGFuIGFycmF5XG4gIC8vIHBhc3Mgb25seSB0aGUgZGF0YXNldCB3ZSBuZWVkIHRvIHVwZGF0ZVxuICBuZXdTdGF0ZSA9IHVwZGF0ZUFsbExheWVyRG9tYWluRGF0YShuZXdTdGF0ZSwgZGF0YXNldElkc1RvRmlsdGVyLCBuZXdGaWx0ZXIpO1xuXG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHByb3BlcnR5IG9mIGEgZmlsdGVyIHBsb3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5zZXRGaWx0ZXJQbG90VXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEZpbHRlclBsb3RVcGRhdGVyID0gKHN0YXRlLCB7aWR4LCBuZXdQcm9wLCB2YWx1ZUluZGV4ID0gMH0pID0+IHtcbiAgbGV0IG5ld0ZpbHRlciA9IHsuLi5zdGF0ZS5maWx0ZXJzW2lkeF0sIC4uLm5ld1Byb3B9O1xuICBjb25zdCBwcm9wID0gT2JqZWN0LmtleXMobmV3UHJvcClbMF07XG4gIGlmIChwcm9wID09PSAneUF4aXMnKSB7XG4gICAgY29uc3QgcGxvdFR5cGUgPSBnZXREZWZhdWx0RmlsdGVyUGxvdFR5cGUobmV3RmlsdGVyKTtcbiAgICAvLyBUT0RPOiBwbG90IGlzIG5vdCBzdXBwb3J0ZWQgaW4gbXVsdGkgZGF0YXNldCBmaWx0ZXIgZm9yIG5vd1xuICAgIGlmIChwbG90VHlwZSkge1xuICAgICAgbmV3RmlsdGVyID0ge1xuICAgICAgICAuLi5uZXdGaWx0ZXIsXG4gICAgICAgIC4uLmdldEZpbHRlclBsb3QoXG4gICAgICAgICAgey4uLm5ld0ZpbHRlciwgcGxvdFR5cGV9LFxuICAgICAgICAgIHN0YXRlLmRhdGFzZXRzW25ld0ZpbHRlci5kYXRhSWRbdmFsdWVJbmRleF1dLmFsbERhdGFcbiAgICAgICAgKSxcbiAgICAgICAgcGxvdFR5cGVcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBmaWx0ZXJzOiBzdGF0ZS5maWx0ZXJzLm1hcCgoZiwgaSkgPT4gKGkgPT09IGlkeCA/IG5ld0ZpbHRlciA6IGYpKVxuICB9O1xufTtcblxuLyoqXG4gKiBBZGQgYSBuZXcgZmlsdGVyXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuYWRkRmlsdGVyVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZEZpbHRlclVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT5cbiAgIWFjdGlvbi5kYXRhSWRcbiAgICA/IHN0YXRlXG4gICAgOiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBmaWx0ZXJzOiBbLi4uc3RhdGUuZmlsdGVycywgZ2V0RGVmYXVsdEZpbHRlcihhY3Rpb24uZGF0YUlkKV1cbiAgICAgIH07XG5cbi8qKlxuICogU2V0IGxheWVyIGNvbG9yIHBhbGV0dGUgdWkgc3RhdGVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5sYXllckNvbG9yVUlDaGFuZ2VVcGRhdGVyfVxuICovXG5leHBvcnQgY29uc3QgbGF5ZXJDb2xvclVJQ2hhbmdlVXBkYXRlciA9IChzdGF0ZSwge29sZExheWVyLCBwcm9wLCBuZXdDb25maWd9KSA9PiB7XG4gIGNvbnN0IG5ld0xheWVyID0gb2xkTGF5ZXIudXBkYXRlTGF5ZXJDb2xvclVJKHByb3AsIG5ld0NvbmZpZyk7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgbGF5ZXJzOiBzdGF0ZS5sYXllcnMubWFwKGwgPT4gKGwuaWQgPT09IG9sZExheWVyLmlkID8gbmV3TGF5ZXIgOiBsKSlcbiAgfTtcbn07XG5cbi8qKlxuICogU3RhcnQgYW5kIGVuZCBmaWx0ZXIgYW5pbWF0aW9uXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykudG9nZ2xlRmlsdGVyQW5pbWF0aW9uVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZUZpbHRlckFuaW1hdGlvblVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGZpbHRlcnM6IHN0YXRlLmZpbHRlcnMubWFwKChmLCBpKSA9PiAoaSA9PT0gYWN0aW9uLmlkeCA/IHsuLi5mLCBpc0FuaW1hdGluZzogIWYuaXNBbmltYXRpbmd9IDogZikpXG59KTtcblxuLyoqXG4gKiBDaGFuZ2UgZmlsdGVyIGFuaW1hdGlvbiBzcGVlZFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnVwZGF0ZUZpbHRlckFuaW1hdGlvblNwZWVkVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUZpbHRlckFuaW1hdGlvblNwZWVkVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZmlsdGVyczogc3RhdGUuZmlsdGVycy5tYXAoKGYsIGkpID0+IChpID09PSBhY3Rpb24uaWR4ID8gey4uLmYsIHNwZWVkOiBhY3Rpb24uc3BlZWR9IDogZikpXG59KTtcblxuLyoqXG4gKiBSZXNldCBhbmltYXRpb24gY29uZmlnIGN1cnJlbnQgdGltZSB0byBhIHNwZWNpZmllZCB2YWx1ZVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnVwZGF0ZUFuaW1hdGlvblRpbWVVcGRhdGVyfVxuICogQHB1YmxpY1xuICpcbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUFuaW1hdGlvblRpbWVVcGRhdGVyID0gKHN0YXRlLCB7dmFsdWV9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgYW5pbWF0aW9uQ29uZmlnOiB7XG4gICAgLi4uc3RhdGUuYW5pbWF0aW9uQ29uZmlnLFxuICAgIGN1cnJlbnRUaW1lOiB2YWx1ZVxuICB9XG59KTtcblxuLyoqXG4gKiBVcGRhdGUgYW5pbWF0aW9uIHNwZWVkIHdpdGggdGhlIHZlcnRpY2FsIHNwZWVkIHNsaWRlclxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWRVcGRhdGVyfVxuICogQHB1YmxpY1xuICpcbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWRVcGRhdGVyID0gKHN0YXRlLCB7c3BlZWR9KSA9PiB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgYW5pbWF0aW9uQ29uZmlnOiB7XG4gICAgICAuLi5zdGF0ZS5hbmltYXRpb25Db25maWcsXG4gICAgICBzcGVlZFxuICAgIH1cbiAgfTtcbn07XG5cbi8qKlxuICogU2hvdyBsYXJnZXIgdGltZSBmaWx0ZXIgYXQgYm90dG9tIGZvciB0aW1lIHBsYXliYWNrIChhcHBseSB0byB0aW1lIGZpbHRlciBvbmx5KVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmVubGFyZ2VGaWx0ZXJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgZW5sYXJnZUZpbHRlclVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICBjb25zdCBpc0VubGFyZ2VkID0gc3RhdGUuZmlsdGVyc1thY3Rpb24uaWR4XS5lbmxhcmdlZDtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGZpbHRlcnM6IHN0YXRlLmZpbHRlcnMubWFwKChmLCBpKSA9PiB7XG4gICAgICBmLmVubGFyZ2VkID0gIWlzRW5sYXJnZWQgJiYgaSA9PT0gYWN0aW9uLmlkeDtcbiAgICAgIHJldHVybiBmO1xuICAgIH0pXG4gIH07XG59O1xuXG4vKipcbiAqIFRvZ2dsZXMgZmlsdGVyIGZlYXR1cmUgdmlzaWJpbGl0eVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnRvZ2dsZUZpbHRlckZlYXR1cmVVcGRhdGVyfVxuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlRmlsdGVyRmVhdHVyZVVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICBjb25zdCBmaWx0ZXIgPSBzdGF0ZS5maWx0ZXJzW2FjdGlvbi5pZHhdO1xuICBjb25zdCBpc1Zpc2libGUgPSBnZXQoZmlsdGVyLCBbJ3ZhbHVlJywgJ3Byb3BlcnRpZXMnLCAnaXNWaXNpYmxlJ10pO1xuICBjb25zdCBuZXdGaWx0ZXIgPSB7XG4gICAgLi4uZmlsdGVyLFxuICAgIHZhbHVlOiBmZWF0dXJlVG9GaWx0ZXJWYWx1ZShmaWx0ZXIudmFsdWUsIGZpbHRlci5pZCwge1xuICAgICAgaXNWaXNpYmxlOiAhaXNWaXNpYmxlXG4gICAgfSlcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGZpbHRlcnM6IE9iamVjdC5hc3NpZ24oWy4uLnN0YXRlLmZpbHRlcnNdLCB7W2FjdGlvbi5pZHhdOiBuZXdGaWx0ZXJ9KVxuICB9O1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYSBmaWx0ZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5yZW1vdmVGaWx0ZXJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlRmlsdGVyVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGNvbnN0IHtpZHh9ID0gYWN0aW9uO1xuICBjb25zdCB7ZGF0YUlkLCBpZH0gPSBzdGF0ZS5maWx0ZXJzW2lkeF07XG5cbiAgY29uc3QgbmV3RmlsdGVycyA9IFtcbiAgICAuLi5zdGF0ZS5maWx0ZXJzLnNsaWNlKDAsIGlkeCksXG4gICAgLi4uc3RhdGUuZmlsdGVycy5zbGljZShpZHggKyAxLCBzdGF0ZS5maWx0ZXJzLmxlbmd0aClcbiAgXTtcblxuICBjb25zdCBmaWx0ZXJlZERhdGFzZXRzID0gYXBwbHlGaWx0ZXJzVG9EYXRhc2V0cyhkYXRhSWQsIHN0YXRlLmRhdGFzZXRzLCBuZXdGaWx0ZXJzLCBzdGF0ZS5sYXllcnMpO1xuICBjb25zdCBuZXdFZGl0b3IgPVxuICAgIGdldEZpbHRlcklkSW5GZWF0dXJlKHN0YXRlLmVkaXRvci5zZWxlY3RlZEZlYXR1cmUpID09PSBpZFxuICAgICAgPyB7XG4gICAgICAgICAgLi4uc3RhdGUuZWRpdG9yLFxuICAgICAgICAgIHNlbGVjdGVkRmVhdHVyZTogbnVsbFxuICAgICAgICB9XG4gICAgICA6IHN0YXRlLmVkaXRvcjtcblxuICBsZXQgbmV3U3RhdGUgPSBzZXQoWydmaWx0ZXJzJ10sIG5ld0ZpbHRlcnMsIHN0YXRlKTtcbiAgbmV3U3RhdGUgPSBzZXQoWydkYXRhc2V0cyddLCBmaWx0ZXJlZERhdGFzZXRzLCBuZXdTdGF0ZSk7XG4gIG5ld1N0YXRlID0gc2V0KFsnZWRpdG9yJ10sIG5ld0VkaXRvciwgbmV3U3RhdGUpO1xuXG4gIHJldHVybiB1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEobmV3U3RhdGUsIGRhdGFJZCwgdW5kZWZpbmVkKTtcbn07XG5cbi8qKlxuICogQWRkIGEgbmV3IGxheWVyXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuYWRkTGF5ZXJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgYWRkTGF5ZXJVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgZGVmYXVsdERhdGFzZXQgPSBPYmplY3Qua2V5cyhzdGF0ZS5kYXRhc2V0cylbMF07XG4gIGNvbnN0IG5ld0xheWVyID0gbmV3IExheWVyKHtcbiAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgaXNDb25maWdBY3RpdmU6IHRydWUsXG4gICAgZGF0YUlkOiBkZWZhdWx0RGF0YXNldCxcbiAgICAuLi5hY3Rpb24ucHJvcHNcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IFsuLi5zdGF0ZS5sYXllcnMsIG5ld0xheWVyXSxcbiAgICBsYXllckRhdGE6IFsuLi5zdGF0ZS5sYXllckRhdGEsIHt9XSxcbiAgICBsYXllck9yZGVyOiBbLi4uc3RhdGUubGF5ZXJPcmRlciwgc3RhdGUubGF5ZXJPcmRlci5sZW5ndGhdLFxuICAgIHNwbGl0TWFwczogYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcChzdGF0ZS5zcGxpdE1hcHMsIG5ld0xheWVyKVxuICB9O1xufTtcblxuLyoqXG4gKiByZW1vdmUgbGF5ZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5yZW1vdmVMYXllclVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVMYXllclVwZGF0ZXIgPSAoc3RhdGUsIHtpZHh9KSA9PiB7XG4gIGNvbnN0IHtsYXllcnMsIGxheWVyRGF0YSwgY2xpY2tlZCwgaG92ZXJJbmZvfSA9IHN0YXRlO1xuICBjb25zdCBsYXllclRvUmVtb3ZlID0gc3RhdGUubGF5ZXJzW2lkeF07XG4gIGNvbnN0IG5ld01hcHMgPSByZW1vdmVMYXllckZyb21TcGxpdE1hcHMoc3RhdGUuc3BsaXRNYXBzLCBsYXllclRvUmVtb3ZlKTtcblxuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IFsuLi5sYXllcnMuc2xpY2UoMCwgaWR4KSwgLi4ubGF5ZXJzLnNsaWNlKGlkeCArIDEsIGxheWVycy5sZW5ndGgpXSxcbiAgICBsYXllckRhdGE6IFsuLi5sYXllckRhdGEuc2xpY2UoMCwgaWR4KSwgLi4ubGF5ZXJEYXRhLnNsaWNlKGlkeCArIDEsIGxheWVyRGF0YS5sZW5ndGgpXSxcbiAgICBsYXllck9yZGVyOiBzdGF0ZS5sYXllck9yZGVyLmZpbHRlcihpID0+IGkgIT09IGlkeCkubWFwKHBpZCA9PiAocGlkID4gaWR4ID8gcGlkIC0gMSA6IHBpZCkpLFxuICAgIGNsaWNrZWQ6IGxheWVyVG9SZW1vdmUuaXNMYXllckhvdmVyZWQoY2xpY2tlZCkgPyB1bmRlZmluZWQgOiBjbGlja2VkLFxuICAgIGhvdmVySW5mbzogbGF5ZXJUb1JlbW92ZS5pc0xheWVySG92ZXJlZChob3ZlckluZm8pID8gdW5kZWZpbmVkIDogaG92ZXJJbmZvLFxuICAgIHNwbGl0TWFwczogbmV3TWFwc1xuICAgIC8vIFRPRE86IHVwZGF0ZSBmaWx0ZXJzLCBjcmVhdGUgaGVscGVyIHRvIHJlbW92ZSBsYXllciBmb3JtIGZpbHRlciAocmVtb3ZlIGxheWVyaWQgYW5kIGRhdGFpZCkgaWYgbWFwcGVkXG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZUFuaW1hdGlvbkRvbWFpbihuZXdTdGF0ZSk7XG59O1xuXG4vKipcbiAqIFJlb3JkZXIgbGF5ZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5yZW9yZGVyTGF5ZXJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgcmVvcmRlckxheWVyVXBkYXRlciA9IChzdGF0ZSwge29yZGVyfSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGxheWVyT3JkZXI6IG9yZGVyXG59KTtcblxuLyoqXG4gKiBSZW1vdmUgYSBkYXRhc2V0IGFuZCBhbGwgbGF5ZXJzLCBmaWx0ZXJzLCB0b29sdGlwIGNvbmZpZ3MgdGhhdCBiYXNlZCBvbiBpdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnJlbW92ZURhdGFzZXRVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlRGF0YXNldFVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICAvLyBleHRyYWN0IGRhdGFzZXQga2V5XG4gIGNvbnN0IHtkYXRhSWQ6IGRhdGFzZXRLZXl9ID0gYWN0aW9uO1xuICBjb25zdCB7ZGF0YXNldHN9ID0gc3RhdGU7XG5cbiAgLy8gY2hlY2sgaWYgZGF0YXNldCBpcyBwcmVzZW50XG4gIGlmICghZGF0YXNldHNbZGF0YXNldEtleV0pIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICBjb25zdCB7XG4gICAgbGF5ZXJzLFxuICAgIGRhdGFzZXRzOiB7W2RhdGFzZXRLZXldOiBkYXRhc2V0LCAuLi5uZXdEYXRhc2V0c31cbiAgfSA9IHN0YXRlO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgY29uc3QgaW5kZXhlcyA9IGxheWVycy5yZWR1Y2UoKGxpc3RPZkluZGV4ZXMsIGxheWVyLCBpbmRleCkgPT4ge1xuICAgIGlmIChsYXllci5jb25maWcuZGF0YUlkID09PSBkYXRhc2V0S2V5KSB7XG4gICAgICBsaXN0T2ZJbmRleGVzLnB1c2goaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gbGlzdE9mSW5kZXhlcztcbiAgfSwgW10pO1xuXG4gIC8vIHJlbW92ZSBsYXllcnMgYW5kIGRhdGFzZXRzXG4gIGNvbnN0IHtuZXdTdGF0ZX0gPSBpbmRleGVzLnJlZHVjZShcbiAgICAoe25ld1N0YXRlOiBjdXJyZW50U3RhdGUsIGluZGV4Q291bnRlcn0sIGlkeCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gaWR4IC0gaW5kZXhDb3VudGVyO1xuICAgICAgY3VycmVudFN0YXRlID0gcmVtb3ZlTGF5ZXJVcGRhdGVyKGN1cnJlbnRTdGF0ZSwge2lkeDogY3VycmVudEluZGV4fSk7XG4gICAgICBpbmRleENvdW50ZXIrKztcbiAgICAgIHJldHVybiB7bmV3U3RhdGU6IGN1cnJlbnRTdGF0ZSwgaW5kZXhDb3VudGVyfTtcbiAgICB9LFxuICAgIHtuZXdTdGF0ZTogey4uLnN0YXRlLCBkYXRhc2V0czogbmV3RGF0YXNldHN9LCBpbmRleENvdW50ZXI6IDB9XG4gICk7XG5cbiAgLy8gcmVtb3ZlIGZpbHRlcnNcbiAgY29uc3QgZmlsdGVycyA9IHN0YXRlLmZpbHRlcnMuZmlsdGVyKGZpbHRlciA9PiAhZmlsdGVyLmRhdGFJZC5pbmNsdWRlcyhkYXRhc2V0S2V5KSk7XG5cbiAgLy8gdXBkYXRlIGludGVyYWN0aW9uQ29uZmlnXG4gIGxldCB7aW50ZXJhY3Rpb25Db25maWd9ID0gc3RhdGU7XG4gIGNvbnN0IHt0b29sdGlwfSA9IGludGVyYWN0aW9uQ29uZmlnO1xuICBpZiAodG9vbHRpcCkge1xuICAgIGNvbnN0IHtjb25maWd9ID0gdG9vbHRpcDtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGNvbnN0IHtbZGF0YXNldEtleV06IGZpZWxkcywgLi4uZmllbGRzVG9TaG93fSA9IGNvbmZpZy5maWVsZHNUb1Nob3c7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGludGVyYWN0aW9uQ29uZmlnID0ge1xuICAgICAgLi4uaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICB0b29sdGlwOiB7Li4udG9vbHRpcCwgY29uZmlnOiB7Li4uY29uZmlnLCBmaWVsZHNUb1Nob3d9fVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gey4uLm5ld1N0YXRlLCBmaWx0ZXJzLCBpbnRlcmFjdGlvbkNvbmZpZ307XG59O1xuXG4vKipcbiAqIHVwZGF0ZSBsYXllciBibGVuZGluZyBtb2RlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykudXBkYXRlTGF5ZXJCbGVuZGluZ1VwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVMYXllckJsZW5kaW5nVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbGF5ZXJCbGVuZGluZzogYWN0aW9uLm1vZGVcbn0pO1xuXG4vKipcbiAqIERpc3BsYXkgZGF0YXNldCB0YWJsZSBpbiBhIG1vZGFsXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuc2hvd0RhdGFzZXRUYWJsZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBzaG93RGF0YXNldFRhYmxlVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZWRpdGluZ0RhdGFzZXQ6IGFjdGlvbi5kYXRhSWRcbiAgfTtcbn07XG5cbi8qKlxuICogcmVzZXQgdmlzU3RhdGUgdG8gaW5pdGlhbCBTdGF0ZVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnJlc2V0TWFwQ29uZmlnVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlc2V0TWFwQ29uZmlnVXBkYXRlciA9IHN0YXRlID0+ICh7XG4gIC4uLklOSVRJQUxfVklTX1NUQVRFLFxuICAuLi5zdGF0ZS5pbml0aWFsU3RhdGUsXG4gIGluaXRpYWxTdGF0ZTogc3RhdGUuaW5pdGlhbFN0YXRlXG59KTtcblxuLyoqXG4gKiBQcm9wYWdhdGUgYHZpc1N0YXRlYCByZWR1Y2VyIHdpdGggYSBuZXcgY29uZmlndXJhdGlvbi4gQ3VycmVudCBjb25maWcgd2lsbCBiZSBvdmVycmlkZS5cbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5yZWNlaXZlTWFwQ29uZmlnVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlY2VpdmVNYXBDb25maWdVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDoge2NvbmZpZyA9IHt9LCBvcHRpb25zID0ge319fSkgPT4ge1xuICBpZiAoIWNvbmZpZy52aXNTdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGNvbnN0IHtrZWVwRXhpc3RpbmdDb25maWd9ID0gb3B0aW9ucztcblxuICAvLyByZXNldCBjb25maWcgaWYga2VlcEV4aXN0aW5nQ29uZmlnIGlzIGZhbHN5XG4gIGxldCBtZXJnZWRTdGF0ZSA9ICFrZWVwRXhpc3RpbmdDb25maWcgPyByZXNldE1hcENvbmZpZ1VwZGF0ZXIoc3RhdGUpIDogc3RhdGU7XG4gIGZvciAoY29uc3QgbWVyZ2VyIG9mIHN0YXRlLm1lcmdlcnMpIHtcbiAgICBpZiAoaXNWYWxpZE1lcmdlcihtZXJnZXIpICYmIGNvbmZpZy52aXNTdGF0ZVttZXJnZXIucHJvcF0pIHtcbiAgICAgIG1lcmdlZFN0YXRlID0gbWVyZ2VyLm1lcmdlKG1lcmdlZFN0YXRlLCBjb25maWcudmlzU3RhdGVbbWVyZ2VyLnByb3BdKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWVyZ2VkU3RhdGU7XG59O1xuXG4vKipcbiAqIFRyaWdnZXIgbGF5ZXIgaG92ZXIgZXZlbnQgd2l0aCBob3ZlcmVkIG9iamVjdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmxheWVySG92ZXJVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgbGF5ZXJIb3ZlclVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGhvdmVySW5mbzogYWN0aW9uLmluZm9cbn0pO1xuXG4vKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzICovXG5cbi8qKlxuICogVXBkYXRlIGBpbnRlcmFjdGlvbkNvbmZpZ2BcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5pbnRlcmFjdGlvbkNvbmZpZ0NoYW5nZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcmFjdGlvbkNvbmZpZ0NoYW5nZVVwZGF0ZXIoc3RhdGUsIGFjdGlvbikge1xuICBjb25zdCB7Y29uZmlnfSA9IGFjdGlvbjtcblxuICBjb25zdCBpbnRlcmFjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5zdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAuLi57W2NvbmZpZy5pZF06IGNvbmZpZ31cbiAgfTtcblxuICAvLyBEb24ndCBlbmFibGUgdG9vbHRpcCBhbmQgYnJ1c2ggYXQgdGhlIHNhbWUgdGltZVxuICAvLyBidXQgY29vcmRpbmF0ZXMgY2FuIGJlIHNob3duIGF0IGFsbCB0aW1lXG4gIGNvbnN0IGNvbnRyYWRpY3QgPSBbJ2JydXNoJywgJ3Rvb2x0aXAnXTtcblxuICBpZiAoXG4gICAgY29udHJhZGljdC5pbmNsdWRlcyhjb25maWcuaWQpICYmXG4gICAgY29uZmlnLmVuYWJsZWQgJiZcbiAgICAhc3RhdGUuaW50ZXJhY3Rpb25Db25maWdbY29uZmlnLmlkXS5lbmFibGVkXG4gICkge1xuICAgIC8vIG9ubHkgZW5hYmxlIG9uZSBpbnRlcmFjdGlvbiBhdCBhIHRpbWVcbiAgICBjb250cmFkaWN0LmZvckVhY2goayA9PiB7XG4gICAgICBpZiAoayAhPT0gY29uZmlnLmlkKSB7XG4gICAgICAgIGludGVyYWN0aW9uQ29uZmlnW2tdID0gey4uLmludGVyYWN0aW9uQ29uZmlnW2tdLCBlbmFibGVkOiBmYWxzZX07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBpbnRlcmFjdGlvbkNvbmZpZ1xuICB9O1xuXG4gIGlmIChjb25maWcuaWQgPT09ICdnZW9jb2RlcicgJiYgIWNvbmZpZy5lbmFibGVkKSB7XG4gICAgcmV0dXJuIHJlbW92ZURhdGFzZXRVcGRhdGVyKG5ld1N0YXRlLCB7ZGF0YUlkOiAnZ2VvY29kZXJfZGF0YXNldCd9KTtcbiAgfVxuXG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cblxuLyoqXG4gKiBUcmlnZ2VyIGxheWVyIGNsaWNrIGV2ZW50IHdpdGggY2xpY2tlZCBvYmplY3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5sYXllckNsaWNrVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGxheWVyQ2xpY2tVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBtb3VzZVBvczogc3RhdGUuaW50ZXJhY3Rpb25Db25maWcuY29vcmRpbmF0ZS5lbmFibGVkXG4gICAgPyB7XG4gICAgICAgIC4uLnN0YXRlLm1vdXNlUG9zLFxuICAgICAgICBwaW5uZWQ6IHN0YXRlLm1vdXNlUG9zLnBpbm5lZCA/IG51bGwgOiBjbG9uZURlZXAoc3RhdGUubW91c2VQb3MpXG4gICAgICB9XG4gICAgOiBzdGF0ZS5tb3VzZVBvcyxcbiAgY2xpY2tlZDogYWN0aW9uLmluZm8gJiYgYWN0aW9uLmluZm8ucGlja2VkID8gYWN0aW9uLmluZm8gOiBudWxsXG59KTtcblxuLyoqXG4gKiBUcmlnZ2VyIG1hcCBjbGljayBldmVudCwgdW5zZWxlY3QgY2xpY2tlZCBvYmplY3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5tYXBDbGlja1VwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBtYXBDbGlja1VwZGF0ZXIgPSBzdGF0ZSA9PiB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY2xpY2tlZDogbnVsbFxuICB9O1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIG1hcCBtb3ZlIGV2ZW50XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykubW91c2VNb3ZlVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG1vdXNlTW92ZVVwZGF0ZXIgPSAoc3RhdGUsIHtldnR9KSA9PiB7XG4gIGlmIChPYmplY3QudmFsdWVzKHN0YXRlLmludGVyYWN0aW9uQ29uZmlnKS5zb21lKGNvbmZpZyA9PiBjb25maWcuZW5hYmxlZCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBtb3VzZVBvczoge1xuICAgICAgICAuLi5zdGF0ZS5tb3VzZVBvcyxcbiAgICAgICAgbW91c2VQb3NpdGlvbjogWy4uLmV2dC5wb2ludF0sXG4gICAgICAgIGNvb3JkaW5hdGU6IFsuLi5ldnQubG5nTGF0XVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gc3RhdGU7XG59O1xuLyoqXG4gKiBUb2dnbGUgdmlzaWJpbGl0eSBvZiBhIGxheWVyIGZvciBhIHNwbGl0IG1hcFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnRvZ2dsZVNwbGl0TWFwVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVNwbGl0TWFwVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PlxuICBzdGF0ZS5zcGxpdE1hcHMgJiYgc3RhdGUuc3BsaXRNYXBzLmxlbmd0aCA9PT0gMFxuICAgID8ge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgLy8gbWF5YmUgd2Ugc2hvdWxkIHVzZSBhbiBhcnJheSB0byBzdG9yZSBzdGF0ZSBmb3IgYSBzaW5nbGUgbWFwIGFzIHdlbGxcbiAgICAgICAgLy8gaWYgY3VycmVudCBtYXBzIGxlbmd0aCBpcyBlcXVhbCB0byAwIGl0IG1lYW5zIHRoYXQgd2UgYXJlIGFib3V0IHRvIHNwbGl0IHRoZSB2aWV3XG4gICAgICAgIHNwbGl0TWFwczogY29tcHV0ZVNwbGl0TWFwTGF5ZXJzKHN0YXRlLmxheWVycylcbiAgICAgIH1cbiAgICA6IGNsb3NlU3BlY2lmaWNNYXBBdEluZGV4KHN0YXRlLCBhY3Rpb24pO1xuXG4vKipcbiAqIFRvZ2dsZSB2aXNpYmlsaXR5IG9mIGEgbGF5ZXIgaW4gYSBzcGxpdCBtYXBcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS50b2dnbGVMYXllckZvck1hcFVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVMYXllckZvck1hcFVwZGF0ZXIgPSAoc3RhdGUsIHttYXBJbmRleCwgbGF5ZXJJZH0pID0+IHtcbiAgY29uc3Qge3NwbGl0TWFwc30gPSBzdGF0ZTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIHNwbGl0TWFwczogc3BsaXRNYXBzLm1hcCgoc20sIGkpID0+XG4gICAgICBpID09PSBtYXBJbmRleFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIC4uLnNwbGl0TWFwc1tpXSxcbiAgICAgICAgICAgIGxheWVyczoge1xuICAgICAgICAgICAgICAuLi5zcGxpdE1hcHNbaV0ubGF5ZXJzLFxuICAgICAgICAgICAgICAvLyBpZiBsYXllcklkIG5vdCBpbiBsYXllcnMsIHNldCBpdCB0byB2aXNpYmxlXG4gICAgICAgICAgICAgIFtsYXllcklkXTogIXNwbGl0TWFwc1tpXS5sYXllcnNbbGF5ZXJJZF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIDogc21cbiAgICApXG4gIH07XG59O1xuXG4vKipcbiAqIEFkZCBuZXcgZGF0YXNldCB0byBgdmlzU3RhdGVgLCB3aXRoIG9wdGlvbiB0byBsb2FkIGEgbWFwIGNvbmZpZyBhbG9uZyB3aXRoIHRoZSBkYXRhc2V0c1xuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnVwZGF0ZVZpc0RhdGFVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcbmV4cG9ydCBjb25zdCB1cGRhdGVWaXNEYXRhVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIC8vIGRhdGFzZXRzIGNhbiBiZSBhIHNpbmdsZSBkYXRhIGVudHJpZXMgb3IgYW4gYXJyYXkgb2YgbXVsdGlwbGUgZGF0YSBlbnRyaWVzXG4gIGNvbnN0IHtjb25maWcsIG9wdGlvbnN9ID0gYWN0aW9uO1xuICBjb25zdCBkYXRhc2V0cyA9IHRvQXJyYXkoYWN0aW9uLmRhdGFzZXRzKTtcblxuICBjb25zdCBuZXdEYXRhRW50cmllcyA9IGRhdGFzZXRzLnJlZHVjZShcbiAgICAoYWNjdSwge2luZm8gPSB7fSwgZGF0YX0gPSB7fSkgPT4gKHtcbiAgICAgIC4uLmFjY3UsXG4gICAgICAuLi4oY3JlYXRlTmV3RGF0YUVudHJ5KHtpbmZvLCBkYXRhfSwgc3RhdGUuZGF0YXNldHMpIHx8IHt9KVxuICAgIH0pLFxuICAgIHt9XG4gICk7XG5cbiAgY29uc3QgZGF0YUVtcHR5ID0gT2JqZWN0LmtleXMobmV3RGF0YUVudHJpZXMpLmxlbmd0aCA8IDE7XG5cbiAgLy8gYXBwbHkgY29uZmlnIGlmIHBhc3NlZCBmcm9tIGFjdGlvblxuICBjb25zdCBwcmV2aW91c1N0YXRlID0gY29uZmlnXG4gICAgPyByZWNlaXZlTWFwQ29uZmlnVXBkYXRlcihzdGF0ZSwge1xuICAgICAgICBwYXlsb2FkOiB7Y29uZmlnLCBvcHRpb25zfVxuICAgICAgfSlcbiAgICA6IHN0YXRlO1xuXG4gIGxldCBtZXJnZWRTdGF0ZSA9IHtcbiAgICAuLi5wcmV2aW91c1N0YXRlLFxuICAgIGRhdGFzZXRzOiB7XG4gICAgICAuLi5wcmV2aW91c1N0YXRlLmRhdGFzZXRzLFxuICAgICAgLi4ubmV3RGF0YUVudHJpZXNcbiAgICB9XG4gIH07XG5cbiAgLy8gbWVyZ2Ugc3RhdGUgd2l0aCBjb25maWcgdG8gYmUgbWVyZ2VkXG4gIGZvciAoY29uc3QgbWVyZ2VyIG9mIG1lcmdlZFN0YXRlLm1lcmdlcnMpIHtcbiAgICBpZiAoaXNWYWxpZE1lcmdlcihtZXJnZXIpICYmIG1lcmdlci50b01lcmdlUHJvcCAmJiBtZXJnZWRTdGF0ZVttZXJnZXIudG9NZXJnZVByb3BdKSB7XG4gICAgICBjb25zdCB0b01lcmdlID0gbWVyZ2VkU3RhdGVbbWVyZ2VyLnRvTWVyZ2VQcm9wXTtcbiAgICAgIG1lcmdlZFN0YXRlW21lcmdlci50b01lcmdlUHJvcF0gPSBJTklUSUFMX1ZJU19TVEFURVttZXJnZXIudG9NZXJnZVByb3BdO1xuICAgICAgbWVyZ2VkU3RhdGUgPSBtZXJnZXIubWVyZ2UobWVyZ2VkU3RhdGUsIHRvTWVyZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBuZXdMYXllcnMgPSAhZGF0YUVtcHR5XG4gICAgPyBtZXJnZWRTdGF0ZS5sYXllcnMuZmlsdGVyKGwgPT4gbC5jb25maWcuZGF0YUlkIGluIG5ld0RhdGFFbnRyaWVzKVxuICAgIDogW107XG5cbiAgaWYgKCFuZXdMYXllcnMubGVuZ3RoICYmIChvcHRpb25zIHx8IHt9KS5hdXRvQ3JlYXRlTGF5ZXJzICE9PSBmYWxzZSkge1xuICAgIC8vIG5vIGxheWVyIG1lcmdlZCwgZmluZCBkZWZhdWx0c1xuICAgIGNvbnN0IHJlc3VsdCA9IGFkZERlZmF1bHRMYXllcnMobWVyZ2VkU3RhdGUsIG5ld0RhdGFFbnRyaWVzKTtcbiAgICBtZXJnZWRTdGF0ZSA9IHJlc3VsdC5zdGF0ZTtcbiAgICBuZXdMYXllcnMgPSByZXN1bHQubmV3TGF5ZXJzO1xuICB9XG5cbiAgaWYgKG1lcmdlZFN0YXRlLnNwbGl0TWFwcy5sZW5ndGgpIHtcbiAgICAvLyBpZiBtYXAgaXMgc3BsaXQsIGFkZCBuZXcgbGF5ZXJzIHRvIHNwbGl0TWFwc1xuICAgIG5ld0xheWVycyA9IG1lcmdlZFN0YXRlLmxheWVycy5maWx0ZXIobCA9PiBsLmNvbmZpZy5kYXRhSWQgaW4gbmV3RGF0YUVudHJpZXMpO1xuICAgIG1lcmdlZFN0YXRlID0ge1xuICAgICAgLi4ubWVyZ2VkU3RhdGUsXG4gICAgICBzcGxpdE1hcHM6IGFkZE5ld0xheWVyc1RvU3BsaXRNYXAobWVyZ2VkU3RhdGUuc3BsaXRNYXBzLCBuZXdMYXllcnMpXG4gICAgfTtcbiAgfVxuXG4gIC8vIGlmIG5vIHRvb2x0aXBzIG1lcmdlZCBhZGQgZGVmYXVsdCB0b29sdGlwc1xuICBPYmplY3Qua2V5cyhuZXdEYXRhRW50cmllcykuZm9yRWFjaChkYXRhSWQgPT4ge1xuICAgIGNvbnN0IHRvb2x0aXBGaWVsZHMgPSBtZXJnZWRTdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZy50b29sdGlwLmNvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodG9vbHRpcEZpZWxkcykgfHwgIXRvb2x0aXBGaWVsZHMubGVuZ3RoKSB7XG4gICAgICBtZXJnZWRTdGF0ZSA9IGFkZERlZmF1bHRUb29sdGlwcyhtZXJnZWRTdGF0ZSwgbmV3RGF0YUVudHJpZXNbZGF0YUlkXSk7XG4gICAgfVxuICB9KTtcblxuICBsZXQgdXBkYXRlZFN0YXRlID0gdXBkYXRlQWxsTGF5ZXJEb21haW5EYXRhKFxuICAgIG1lcmdlZFN0YXRlLFxuICAgIGRhdGFFbXB0eSA/IE9iamVjdC5rZXlzKG1lcmdlZFN0YXRlLmRhdGFzZXRzKSA6IE9iamVjdC5rZXlzKG5ld0RhdGFFbnRyaWVzKSxcbiAgICB1bmRlZmluZWRcbiAgKTtcblxuICAvLyByZWdpc3RlciBsYXllciBhbmltYXRpb24gZG9tYWluLFxuICAvLyBuZWVkIHRvIGJlIGNhbGxlZCBhZnRlciBsYXllciBkYXRhIGlzIGNhbGN1bGF0ZWRcbiAgdXBkYXRlZFN0YXRlID0gdXBkYXRlQW5pbWF0aW9uRG9tYWluKHVwZGF0ZWRTdGF0ZSk7XG5cbiAgcmV0dXJuIHVwZGF0ZWRTdGF0ZTtcbn07XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzICovXG5cbi8qKlxuICogV2hlbiBhIHVzZXIgY2xpY2tzIG9uIHRoZSBzcGVjaWZpYyBtYXAgY2xvc2luZyBpY29uXG4gKiB0aGUgYXBwbGljYXRpb24gd2lsbCBjbG9zZSB0aGUgc2VsZWN0ZWQgbWFwXG4gKiBhbmQgd2lsbCBtZXJnZSB0aGUgcmVtYWluaW5nIG9uZSB3aXRoIHRoZSBnbG9iYWwgc3RhdGVcbiAqIFRPRE86IGkgdGhpbmsgaW4gdGhlIGZ1dHVyZSB0aGlzIGFjdGlvbiBzaG91bGQgYmUgY2FsbGVkIG1lcmdlIG1hcCBsYXllcnMgd2l0aCBnbG9iYWwgc2V0dGluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBgdmlzU3RhdGVgXG4gKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIGFjdGlvblxuICogQHJldHVybnMge09iamVjdH0gbmV4dFN0YXRlXG4gKi9cbmZ1bmN0aW9uIGNsb3NlU3BlY2lmaWNNYXBBdEluZGV4KHN0YXRlLCBhY3Rpb24pIHtcbiAgLy8gcmV0cmlldmUgbGF5ZXJzIG1ldGEgZGF0YSBmcm9tIHRoZSByZW1haW5pbmcgbWFwIHRoYXQgd2UgbmVlZCB0byBrZWVwXG4gIGNvbnN0IGluZGV4VG9SZXRyaWV2ZSA9IDEgLSBhY3Rpb24ucGF5bG9hZDtcbiAgY29uc3QgbWFwTGF5ZXJzID0gc3RhdGUuc3BsaXRNYXBzW2luZGV4VG9SZXRyaWV2ZV0ubGF5ZXJzO1xuICBjb25zdCB7bGF5ZXJzfSA9IHN0YXRlO1xuXG4gIC8vIHVwZGF0ZSBsYXllciB2aXNpYmlsaXR5XG4gIGNvbnN0IG5ld0xheWVycyA9IGxheWVycy5tYXAobGF5ZXIgPT5cbiAgICAhbWFwTGF5ZXJzW2xheWVyLmlkXSAmJiBsYXllci5jb25maWcuaXNWaXNpYmxlXG4gICAgICA/IGxheWVyLnVwZGF0ZUxheWVyQ29uZmlnKHtcbiAgICAgICAgICAvLyBpZiBsYXllci5pZCBpcyBub3QgaW4gbWFwTGF5ZXJzLCBpdCBzaG91bGQgYmUgaW5WaXNpYmxlXG4gICAgICAgICAgaXNWaXNpYmxlOiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgOiBsYXllclxuICApO1xuXG4gIC8vIGRlbGV0ZSBtYXBcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IG5ld0xheWVycyxcbiAgICBzcGxpdE1hcHM6IFtdXG4gIH07XG59XG5cbi8qKlxuICogVHJpZ2dlciBmaWxlIGxvYWRpbmcgZGlzcGF0Y2ggYGFkZERhdGFUb01hcGAgaWYgc3VjY2VlZCwgb3IgYGxvYWRGaWxlc0VycmAgaWYgZmFpbGVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykubG9hZEZpbGVzVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlc1VwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICBjb25zdCB7ZmlsZXMsIG1ldGEsIG9uRmluaXNoID0gbG9hZEZpbGVzU3VjY2Vzc30gPSBhY3Rpb247XG4gIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgY29uc3QgZmlsZUxvYWRpbmdQcm9ncmVzcyA9IEFycmF5LmZyb20oZmlsZXMpLnJlZHVjZShcbiAgICAoYWNjdSwgZiwgaSkgPT4gbWVyZ2VfKGluaXRpYWxGaWxlTG9hZGluZ1Byb2dyZXNzKGYsIGkpKShhY2N1KSxcbiAgICB7fVxuICApO1xuXG4gIGNvbnN0IGZpbGVMb2FkaW5nID0ge1xuICAgIGZpbGVDYWNoZTogW10sXG4gICAgZmlsZXNUb0xvYWQ6IGZpbGVzLFxuICAgIG1ldGE6IG1ldGEsXG4gICAgb25GaW5pc2hcbiAgfTtcblxuICBjb25zdCBuZXh0U3RhdGUgPSBtZXJnZV8oe2ZpbGVMb2FkaW5nUHJvZ3Jlc3MsIGZpbGVMb2FkaW5nfSkoc3RhdGUpO1xuXG4gIHJldHVybiBsb2FkTmV4dEZpbGVVcGRhdGVyKG5leHRTdGF0ZSk7XG59O1xuXG5mdW5jdGlvbiBuZXh0QWN0aW9uKG1ldGEsIGFjdGlvbikge1xuICByZXR1cm4gbWV0YSAmJiB0eXBlb2YgbWV0YS5faWRfID09PSAnc3RyaW5nJyA/IHdyYXBUbyhtZXRhLl9pZF8sIGFjdGlvbikgOiBhY3Rpb247XG59XG5cbi8qKlxuICogU3VjZXNzZnVsbHkgbG9hZGVkIG9uZSBmaWxlLCBtb3ZlIG9uIHRvIHRoZSBuZXh0IG9uZVxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmxvYWRGaWxlU3RlcFN1Y2Nlc3NVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZEZpbGVTdGVwU3VjY2Vzc1VwZGF0ZXIoc3RhdGUsIGFjdGlvbikge1xuICBpZiAoIXN0YXRlLmZpbGVMb2FkaW5nKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIGNvbnN0IHtmaWxlTmFtZSwgZmlsZUNhY2hlLCBtZXRhfSA9IGFjdGlvbjtcbiAgY29uc3Qge2ZpbGVzVG9Mb2FkLCBvbkZpbmlzaH0gPSBzdGF0ZS5maWxlTG9hZGluZztcbiAgY29uc3Qgc3RhdGVXaXRoUHJvZ3Jlc3MgPSB1cGRhdGVGaWxlTG9hZGluZ1Byb2dyZXNzVXBkYXRlcihzdGF0ZSwge1xuICAgIGZpbGVOYW1lLFxuICAgIHByb2dyZXNzOiB7cGVyY2VudDogMSwgbWVzc2FnZTogJ0RvbmUnfVxuICB9KTtcblxuICAvLyBzYXZlIHByb2Nlc3NlZCBmaWxlIHRvIGZpbGVDYWNoZVxuICBjb25zdCBzdGF0ZVdpdGhDYWNoZSA9IHBpY2tfKCdmaWxlTG9hZGluZycpKG1lcmdlXyh7ZmlsZUNhY2hlfSkpKHN0YXRlV2l0aFByb2dyZXNzKTtcblxuICByZXR1cm4gd2l0aFRhc2soXG4gICAgc3RhdGVXaXRoQ2FjaGUsXG4gICAgREVMQVlfVEFTSygyMDApLm1hcChmaWxlc1RvTG9hZC5sZW5ndGggPyBsb2FkTmV4dEZpbGUgOiAoKSA9PlxuICAgICAgbmV4dEFjdGlvbihtZXRhLCBvbkZpbmlzaChmaWxlQ2FjaGUpKSlcbiAgKTtcbn1cblxuLy8gd2l0aFRhc2s8VD4oc3RhdGU6IFQsIHRhc2s6IGFueSk6IFRcblxuLyoqXG4gKlxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmxvYWROZXh0RmlsZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTmV4dEZpbGVVcGRhdGVyKHN0YXRlKSB7XG4gIGlmICghc3RhdGUuZmlsZUxvYWRpbmcpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cbiAgY29uc3QgbWV0YSA9IHN0YXRlLmZpbGVMb2FkaW5nWydtZXRhJ107XG4gIGNvbnN0IHtmaWxlc1RvTG9hZH0gPSBzdGF0ZS5maWxlTG9hZGluZztcbiAgY29uc3QgW2ZpbGUsIC4uLnJlbWFpbmluZ0ZpbGVzVG9Mb2FkXSA9IGZpbGVzVG9Mb2FkO1xuXG4gIC8vIHNhdmUgZmlsZXNUb0xvYWQgdG8gc3RhdGVcbiAgY29uc3QgbmV4dFN0YXRlID0gcGlja18oJ2ZpbGVMb2FkaW5nJykobWVyZ2VfKHtmaWxlc1RvTG9hZDogcmVtYWluaW5nRmlsZXNUb0xvYWR9KSkoc3RhdGUpO1xuXG4gIGNvbnN0IHN0YXRlV2l0aFByb2dyZXNzID0gdXBkYXRlRmlsZUxvYWRpbmdQcm9ncmVzc1VwZGF0ZXIobmV4dFN0YXRlLCB7XG4gICAgZmlsZU5hbWU6IGZpbGUubmFtZSxcbiAgICBwcm9ncmVzczoge3BlcmNlbnQ6IDAsIG1lc3NhZ2U6ICdsb2FkaW5nLi4uJ31cbiAgfSk7XG5cbiAgY29uc3Qge2xvYWRlcnMsIGxvYWRPcHRpb25zfSA9IHN0YXRlO1xuICByZXR1cm4gd2l0aFRhc2soXG4gICAgc3RhdGVXaXRoUHJvZ3Jlc3MsXG4gICAgbWFrZUxvYWRGaWxlVGFzayhmaWxlLCBuZXh0U3RhdGUuZmlsZUxvYWRpbmcuZmlsZUNhY2hlLCBsb2FkZXJzLCBsb2FkT3B0aW9ucywgbWV0YSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VMb2FkRmlsZVRhc2soZmlsZSwgZmlsZUNhY2hlLCBsb2FkZXJzID0gW10sIGxvYWRPcHRpb25zID0ge30sIG1ldGEpIHtcbiAgcmV0dXJuIExPQURfRklMRV9UQVNLKHtmaWxlLCBmaWxlQ2FjaGUsIGxvYWRlcnMsIGxvYWRPcHRpb25zfSkuYmltYXAoXG4gICAgLy8gcHJldHRpZXIgaWdub3JlXG4gICAgLy8gc3VjY2Vzc1xuICAgIGdlbiA9PiBuZXh0QWN0aW9uKG1ldGEsIG5leHRGaWxlQmF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGE6IG1ldGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaDogcmVzdWx0ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGaWxlQ29udGVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YTogbWV0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUNhY2hlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAvLyBlcnJvclxuICAgIGVyciA9PiBuZXh0QWN0aW9uKG1ldGEsIGxvYWRGaWxlc0VycihmaWxlLm5hbWUsIGVyciwgbWV0YSkpXG4gICk7XG59XG5cbi8qKlxuICpcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5wcm9jZXNzRmlsZUNvbnRlbnRVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZpbGVDb250ZW50VXBkYXRlcihzdGF0ZSwgYWN0aW9uKSB7XG4gIGNvbnN0IHtjb250ZW50LCBmaWxlQ2FjaGUsIG1ldGF9ID0gYWN0aW9uLnBheWxvYWQ7XG5cbiAgY29uc3Qgc3RhdGVXaXRoUHJvZ3Jlc3MgPSB1cGRhdGVGaWxlTG9hZGluZ1Byb2dyZXNzVXBkYXRlcihzdGF0ZSwge1xuICAgIGZpbGVOYW1lOiBjb250ZW50LmZpbGVOYW1lLFxuICAgIHByb2dyZXNzOiB7cGVyY2VudDogMSwgbWVzc2FnZTogJ3Byb2Nlc3NpbmcuLi4nfVxuICB9KTtcblxuICByZXR1cm4gd2l0aFRhc2soXG4gICAgc3RhdGVXaXRoUHJvZ3Jlc3MsXG4gICAgUFJPQ0VTU19GSUxFX0RBVEEoe2NvbnRlbnQsIGZpbGVDYWNoZX0pLmJpbWFwKFxuICAgICAgcmVzdWx0ID0+IG5leHRBY3Rpb24obWV0YSwgbG9hZEZpbGVTdGVwU3VjY2Vzcyh7ZmlsZU5hbWU6IGNvbnRlbnQuZmlsZU5hbWUsIGZpbGVDYWNoZTogcmVzdWx0LCBtZXRhOiBtZXRhfSkpLFxuICAgICAgZXJyID0+IG5leHRBY3Rpb24obWV0YSwgbG9hZEZpbGVzRXJyKGNvbnRlbnQuZmlsZU5hbWUsIGVyciwgbWV0YSkpXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQcm9ncmVzcyhwcmV2UHJvZ3Jlc3MgPSB7fSwgcHJvZ3Jlc3MpIHtcbiAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gcmVjZWl2aW5nIHF1ZXJ5IG1ldGFkYXRhIG9yIG90aGVyIGNhc2VzIHdlIGRvbid0XG4gIC8vIGhhdmUgYW4gdXBkYXRlIGZvciB0aGUgdXNlci5cbiAgaWYgKCFwcm9ncmVzcyB8fCAhcHJvZ3Jlc3MucGVyY2VudCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGVyY2VudDogcHJvZ3Jlc3MucGVyY2VudFxuICB9O1xufVxuXG4vKipcbiAqIGdldHMgY2FsbGVkIHdpdGggcGF5bG9hZCA9IEFzeW5jR2VuZXJhdG9yPD8/Pz5cbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5uZXh0RmlsZUJhdGNoVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG5leHRGaWxlQmF0Y2hVcGRhdGVyID0gKFxuICBzdGF0ZSxcbiAge3BheWxvYWQ6IHtnZW4sIGZpbGVOYW1lLCBwcm9ncmVzcywgYWNjdW11bGF0ZWQsIG1ldGEsIG9uRmluaXNofX1cbikgPT4ge1xuICBjb25zdCBzdGF0ZVdpdGhQcm9ncmVzcyA9IHVwZGF0ZUZpbGVMb2FkaW5nUHJvZ3Jlc3NVcGRhdGVyKHN0YXRlLCB7XG4gICAgZmlsZU5hbWUsXG4gICAgcHJvZ3Jlc3M6IHBhcnNlUHJvZ3Jlc3Moc3RhdGUuZmlsZUxvYWRpbmdQcm9ncmVzc1tmaWxlTmFtZV0sIHByb2dyZXNzKVxuICB9KTtcbiAgcmV0dXJuIHdpdGhUYXNrKFxuICAgIHN0YXRlV2l0aFByb2dyZXNzLFxuICAgIFVOV1JBUF9UQVNLKGdlbi5uZXh0KCkpLmJpbWFwKFxuICAgICAgKHt2YWx1ZSwgZG9uZX0pID0+IHtcbiAgICAgICAgcmV0dXJuIGRvbmVcbiAgICAgICAgICA/IG5leHRBY3Rpb24obWV0YSwgb25GaW5pc2goYWNjdW11bGF0ZWQpKVxuICAgICAgICAgIDogbmV4dEFjdGlvbihtZXRhLCBuZXh0RmlsZUJhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHZhbHVlLnByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY3VtdWxhdGVkOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhOiBtZXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgfSxcbiAgICAgIGVyciA9PiBuZXh0QWN0aW9uKG1ldGEsIGxvYWRGaWxlc0VycihmaWxlTmFtZSwgZXJyLCBtZXRhKSlcbiAgICApXG4gICk7XG59O1xuXG4vKipcbiAqIFRyaWdnZXIgbG9hZGluZyBmaWxlIGVycm9yXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykubG9hZEZpbGVzRXJyVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlc0VyclVwZGF0ZXIgPSAoc3RhdGUsIHtlcnJvciwgZmlsZU5hbWUsIG1ldGEgPSB7fX0pID0+IHtcbiAgLy8gdXBkYXRlIHVpIHdpdGggZXJyb3IgbWVzc2FnZVxuICBDb25zb2xlLndhcm4oZXJyb3IpO1xuICBpZiAoIXN0YXRlLmZpbGVMb2FkaW5nKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIGNvbnN0IHtmaWxlc1RvTG9hZCwgb25GaW5pc2gsIGZpbGVDYWNoZX0gPSBzdGF0ZS5maWxlTG9hZGluZztcblxuICBjb25zdCBuZXh0U3RhdGUgPSB1cGRhdGVGaWxlTG9hZGluZ1Byb2dyZXNzVXBkYXRlcihzdGF0ZSwge1xuICAgIGZpbGVOYW1lLFxuICAgIHByb2dyZXNzOiB7ZXJyb3J9XG4gIH0pO1xuXG4gIC8vIGtpY2sgb2ZmIG5leHQgZmlsZSBvciBmaW5pc2hcbiAgcmV0dXJuIHdpdGhUYXNrKFxuICAgIG5leHRTdGF0ZSxcbiAgICBERUxBWV9UQVNLKDIwMCkubWFwKGZpbGVzVG9Mb2FkLmxlbmd0aCA/IGxvYWROZXh0RmlsZSA6ICgpID0+XG4gICAgICBuZXh0QWN0aW9uKG1ldGEsIG9uRmluaXNoKGZpbGVDYWNoZSkpXG4gICAgKVxuICApO1xufTtcblxuLyoqXG4gKiBXaGVuIHNlbGVjdCBkYXRhc2V0IGZvciBleHBvcnQsIGFwcGx5IGNwdSBmaWx0ZXIgdG8gc2VsZWN0ZWQgZGF0YXNldFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmFwcGx5Q1BVRmlsdGVyVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGFwcGx5Q1BVRmlsdGVyVXBkYXRlciA9IChzdGF0ZSwge2RhdGFJZH0pID0+IHtcbiAgLy8gYXBwbHkgY3B1RmlsdGVyXG4gIGNvbnN0IGRhdGFJZHMgPSB0b0FycmF5KGRhdGFJZCk7XG5cbiAgcmV0dXJuIGRhdGFJZHMucmVkdWNlKChhY2N1LCBpZCkgPT4gZmlsdGVyRGF0YXNldENQVShhY2N1LCBpZCksIHN0YXRlKTtcbn07XG5cbi8qKlxuICogVXNlciBpbnB1dCB0byB1cGRhdGUgdGhlIGluZm8gb2YgdGhlIG1hcFxuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnNldE1hcEluZm9VcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2V0TWFwSW5mb1VwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIG1hcEluZm86IHtcbiAgICAuLi5zdGF0ZS5tYXBJbmZvLFxuICAgIC4uLmFjdGlvbi5pbmZvXG4gIH1cbn0pO1xuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gdXBkYXRlIEFsbCBsYXllciBkb21haW4gYW5kIGxheWVyIGRhdGEgb2Ygc3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmFkZERlZmF1bHRMYXllcnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWZhdWx0TGF5ZXJzKHN0YXRlLCBkYXRhc2V0cykge1xuICAvKiogQHR5cGUge0xheWVyW119ICovXG4gIGNvbnN0IGVtcHR5ID0gW107XG4gIGNvbnN0IGRlZmF1bHRMYXllcnMgPSBPYmplY3QudmFsdWVzKGRhdGFzZXRzKS5yZWR1Y2UoKGFjY3UsIGRhdGFzZXQpID0+IHtcbiAgICBjb25zdCBmb3VuZExheWVycyA9IGZpbmREZWZhdWx0TGF5ZXIoZGF0YXNldCwgc3RhdGUubGF5ZXJDbGFzc2VzKTtcbiAgICByZXR1cm4gZm91bmRMYXllcnMgJiYgZm91bmRMYXllcnMubGVuZ3RoID8gYWNjdS5jb25jYXQoZm91bmRMYXllcnMpIDogYWNjdTtcbiAgfSwgZW1wdHkpO1xuXG4gIHJldHVybiB7XG4gICAgc3RhdGU6IHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgbGF5ZXJzOiBbLi4uc3RhdGUubGF5ZXJzLCAuLi5kZWZhdWx0TGF5ZXJzXSxcbiAgICAgIGxheWVyT3JkZXI6IFtcbiAgICAgICAgLy8gcHV0IG5ldyBsYXllcnMgb24gdG9wIG9mIG9sZCBvbmVzXG4gICAgICAgIC4uLmRlZmF1bHRMYXllcnMubWFwKChfLCBpKSA9PiBzdGF0ZS5sYXllcnMubGVuZ3RoICsgaSksXG4gICAgICAgIC4uLnN0YXRlLmxheWVyT3JkZXJcbiAgICAgIF1cbiAgICB9LFxuICAgIG5ld0xheWVyczogZGVmYXVsdExheWVyc1xuICB9O1xufVxuXG4vKipcbiAqIGhlbHBlciBmdW5jdGlvbiB0byBmaW5kIGRlZmF1bHQgdG9vbHRpcHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFzZXRcbiAqIEByZXR1cm5zIHtPYmplY3R9IG5leHRTdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmYXVsdFRvb2x0aXBzKHN0YXRlLCBkYXRhc2V0KSB7XG4gIGNvbnN0IHRvb2x0aXBGaWVsZHMgPSBmaW5kRmllbGRzVG9TaG93KGRhdGFzZXQpO1xuICBjb25zdCBtZXJnZWQgPSB7XG4gICAgLi4uc3RhdGUuaW50ZXJhY3Rpb25Db25maWcudG9vbHRpcC5jb25maWcuZmllbGRzVG9TaG93LFxuICAgIC4uLnRvb2x0aXBGaWVsZHNcbiAgfTtcblxuICByZXR1cm4gc2V0KFsnaW50ZXJhY3Rpb25Db25maWcnLCAndG9vbHRpcCcsICdjb25maWcnLCAnZmllbGRzVG9TaG93J10sIG1lcmdlZCwgc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbEZpbGVMb2FkaW5nUHJvZ3Jlc3MoZmlsZSwgaW5kZXgpIHtcbiAgY29uc3QgZmlsZU5hbWUgPSBmaWxlLm5hbWUgfHwgYFVudGl0bGVkIEZpbGUgJHtpbmRleH1gO1xuICByZXR1cm4ge1xuICAgIFtmaWxlTmFtZV06IHtcbiAgICAgIC8vIHBlcmNlbnQgb2YgY3VycmVudCBmaWxlXG4gICAgICBwZXJjZW50OiAwLFxuICAgICAgbWVzc2FnZTogJycsXG4gICAgICBmaWxlTmFtZSxcbiAgICAgIGVycm9yOiBudWxsXG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRmlsZUxvYWRpbmdQcm9ncmVzc1VwZGF0ZXIoc3RhdGUsIHtmaWxlTmFtZSwgcHJvZ3Jlc3N9KSB7XG4gIHJldHVybiBwaWNrXygnZmlsZUxvYWRpbmdQcm9ncmVzcycpKHBpY2tfKGZpbGVOYW1lKShtZXJnZV8ocHJvZ3Jlc3MpKSkoc3RhdGUpO1xufVxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gdXBkYXRlIGxheWVyIGRvbWFpbnMgZm9yIGFuIGFycmF5IG9mIGRhdGFzZXRzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS51cGRhdGVBbGxMYXllckRvbWFpbkRhdGF9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEoc3RhdGUsIGRhdGFJZCwgdXBkYXRlZEZpbHRlcikge1xuICBjb25zdCBkYXRhSWRzID0gdHlwZW9mIGRhdGFJZCA9PT0gJ3N0cmluZycgPyBbZGF0YUlkXSA6IGRhdGFJZDtcbiAgY29uc3QgbmV3TGF5ZXJzID0gW107XG4gIGNvbnN0IG5ld0xheWVyRGF0YSA9IFtdO1xuXG4gIHN0YXRlLmxheWVycy5mb3JFYWNoKChvbGRMYXllciwgaSkgPT4ge1xuICAgIGlmIChvbGRMYXllci5jb25maWcuZGF0YUlkICYmIGRhdGFJZHMuaW5jbHVkZXMob2xkTGF5ZXIuY29uZmlnLmRhdGFJZCkpIHtcbiAgICAgIC8vIE5vIG5lZWQgdG8gcmVjYWxjdWxhdGUgbGF5ZXIgZG9tYWluIGlmIGZpbHRlciBoYXMgZml4ZWQgZG9tYWluXG4gICAgICBjb25zdCBuZXdMYXllciA9XG4gICAgICAgIHVwZGF0ZWRGaWx0ZXIgJiYgdXBkYXRlZEZpbHRlci5maXhlZERvbWFpblxuICAgICAgICAgID8gb2xkTGF5ZXJcbiAgICAgICAgICA6IG9sZExheWVyLnVwZGF0ZUxheWVyRG9tYWluKHN0YXRlLmRhdGFzZXRzLCB1cGRhdGVkRmlsdGVyKTtcblxuICAgICAgY29uc3Qge2xheWVyRGF0YSwgbGF5ZXJ9ID0gY2FsY3VsYXRlTGF5ZXJEYXRhKG5ld0xheWVyLCBzdGF0ZSwgc3RhdGUubGF5ZXJEYXRhW2ldKTtcblxuICAgICAgbmV3TGF5ZXJzLnB1c2gobGF5ZXIpO1xuICAgICAgbmV3TGF5ZXJEYXRhLnB1c2gobGF5ZXJEYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3TGF5ZXJzLnB1c2gob2xkTGF5ZXIpO1xuICAgICAgbmV3TGF5ZXJEYXRhLnB1c2goc3RhdGUubGF5ZXJEYXRhW2ldKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIGxheWVyczogbmV3TGF5ZXJzLFxuICAgIGxheWVyRGF0YTogbmV3TGF5ZXJEYXRhXG4gIH07XG5cbiAgcmV0dXJuIG5ld1N0YXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQW5pbWF0aW9uRG9tYWluKHN0YXRlKSB7XG4gIC8vIG1lcmdlIGFsbCBhbmltYXRhYmxlIGxheWVyIGRvbWFpbiBhbmQgdXBkYXRlIGdsb2JhbCBjb25maWdcbiAgY29uc3QgYW5pbWF0YWJsZUxheWVycyA9IHN0YXRlLmxheWVycy5maWx0ZXIoXG4gICAgbCA9PlxuICAgICAgbC5jb25maWcuaXNWaXNpYmxlICYmXG4gICAgICBsLmNvbmZpZy5hbmltYXRpb24gJiZcbiAgICAgIGwuY29uZmlnLmFuaW1hdGlvbi5lbmFibGVkICYmXG4gICAgICBBcnJheS5pc0FycmF5KGwuYW5pbWF0aW9uRG9tYWluKVxuICApO1xuXG4gIGlmICghYW5pbWF0YWJsZUxheWVycy5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBhbmltYXRpb25Db25maWc6IERFRkFVTFRfQU5JTUFUSU9OX0NPTkZJR1xuICAgIH07XG4gIH1cblxuICBjb25zdCBtZXJnZWREb21haW4gPSBhbmltYXRhYmxlTGF5ZXJzLnJlZHVjZShcbiAgICAoYWNjdSwgbGF5ZXIpID0+IFtcbiAgICAgIE1hdGgubWluKGFjY3VbMF0sIGxheWVyLmFuaW1hdGlvbkRvbWFpblswXSksXG4gICAgICBNYXRoLm1heChhY2N1WzFdLCBsYXllci5hbmltYXRpb25Eb21haW5bMV0pXG4gICAgXSxcbiAgICBbTnVtYmVyKEluZmluaXR5KSwgLUluZmluaXR5XVxuICApO1xuXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgYW5pbWF0aW9uQ29uZmlnOiB7XG4gICAgICAuLi5zdGF0ZS5hbmltYXRpb25Db25maWcsXG4gICAgICBjdXJyZW50VGltZTogaXNJblJhbmdlKHN0YXRlLmFuaW1hdGlvbkNvbmZpZy5jdXJyZW50VGltZSwgbWVyZ2VkRG9tYWluKVxuICAgICAgICA/IHN0YXRlLmFuaW1hdGlvbkNvbmZpZy5jdXJyZW50VGltZVxuICAgICAgICA6IG1lcmdlZERvbWFpblswXSxcbiAgICAgIGRvbWFpbjogbWVyZ2VkRG9tYWluXG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc3RhdHVzIG9mIHRoZSBlZGl0b3JcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5zZXRFZGl0b3JNb2RlVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IHNldEVkaXRvck1vZGVVcGRhdGVyID0gKHN0YXRlLCB7bW9kZX0pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBlZGl0b3I6IHtcbiAgICAuLi5zdGF0ZS5lZGl0b3IsXG4gICAgbW9kZSxcbiAgICBzZWxlY3RlZEZlYXR1cmU6IG51bGxcbiAgfVxufSk7XG5cbi8vIGNvbnN0IGZlYXR1cmVUb0ZpbHRlclZhbHVlID0gKGZlYXR1cmUpID0+ICh7Li4uZmVhdHVyZSwgaWQ6IGZlYXR1cmUuaWR9KTtcbi8qKlxuICogVXBkYXRlIGVkaXRvciBmZWF0dXJlc1xuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnNldEZlYXR1cmVzVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEZlYXR1cmVzVXBkYXRlcihzdGF0ZSwge2ZlYXR1cmVzID0gW119KSB7XG4gIGNvbnN0IGxhc3RGZWF0dXJlID0gZmVhdHVyZXMubGVuZ3RoICYmIGZlYXR1cmVzW2ZlYXR1cmVzLmxlbmd0aCAtIDFdO1xuXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVkaXRvcjoge1xuICAgICAgLi4uc3RhdGUuZWRpdG9yLFxuICAgICAgLy8gb25seSBzYXZlIG5vbmUgZmlsdGVyIGZlYXR1cmVzIHRvIGVkaXRvclxuICAgICAgZmVhdHVyZXM6IGZlYXR1cmVzLmZpbHRlcihmID0+ICFnZXRGaWx0ZXJJZEluRmVhdHVyZShmKSksXG4gICAgICBtb2RlOiBsYXN0RmVhdHVyZSAmJiBsYXN0RmVhdHVyZS5wcm9wZXJ0aWVzLmlzQ2xvc2VkID8gRURJVE9SX01PREVTLkVESVQgOiBzdGF0ZS5lZGl0b3IubW9kZVxuICAgIH1cbiAgfTtcblxuICAvLyBSZXRyaWV2ZSBleGlzdGluZyBmZWF0dXJlXG4gIGNvbnN0IHtzZWxlY3RlZEZlYXR1cmV9ID0gc3RhdGUuZWRpdG9yO1xuXG4gIC8vIElmIG5vIGZlYXR1cmUgaXMgc2VsZWN0ZWQgd2UgY2FuIHNpbXBseSByZXR1cm4gc2luY2Ugbm8gb3BlcmF0aW9uc1xuICBpZiAoIXNlbGVjdGVkRmVhdHVyZSkge1xuICAgIHJldHVybiBuZXdTdGF0ZTtcbiAgfVxuXG4gIC8vIFRPRE86IGNoZWNrIGlmIHRoZSBmZWF0dXJlIGhhcyBjaGFuZ2VkXG4gIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlcy5maW5kKGYgPT4gZi5pZCA9PT0gc2VsZWN0ZWRGZWF0dXJlLmlkKTtcblxuICAvLyBpZiBmZWF0dXJlIGlzIHBhcnQgb2YgYSBmaWx0ZXJcbiAgY29uc3QgZmlsdGVySWQgPSBmZWF0dXJlICYmIGdldEZpbHRlcklkSW5GZWF0dXJlKGZlYXR1cmUpO1xuICBpZiAoZmlsdGVySWQgJiYgZmVhdHVyZSkge1xuICAgIGNvbnN0IGZlYXR1cmVWYWx1ZSA9IGZlYXR1cmVUb0ZpbHRlclZhbHVlKGZlYXR1cmUsIGZpbHRlcklkKTtcbiAgICBjb25zdCBmaWx0ZXJJZHggPSBzdGF0ZS5maWx0ZXJzLmZpbmRJbmRleChmaWwgPT4gZmlsLmlkID09PSBmaWx0ZXJJZCk7XG4gICAgcmV0dXJuIHNldEZpbHRlclVwZGF0ZXIobmV3U3RhdGUsIHtcbiAgICAgIGlkeDogZmlsdGVySWR4LFxuICAgICAgcHJvcDogJ3ZhbHVlJyxcbiAgICAgIHZhbHVlOiBmZWF0dXJlVmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGN1cnJlbnQgc2VsZWN0ZWQgZmVhdHVyZVxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuc2V0U2VsZWN0ZWRGZWF0dXJlVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IHNldFNlbGVjdGVkRmVhdHVyZVVwZGF0ZXIgPSAoc3RhdGUsIHtmZWF0dXJlfSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGVkaXRvcjoge1xuICAgIC4uLnN0YXRlLmVkaXRvcixcbiAgICBzZWxlY3RlZEZlYXR1cmU6IGZlYXR1cmVcbiAgfVxufSk7XG5cbi8qKlxuICogRGVsZXRlIGV4aXN0aW5nIGZlYXR1cmUgZnJvbSBmaWx0ZXJzXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuZGVsZXRlRmVhdHVyZVVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVGZWF0dXJlVXBkYXRlcihzdGF0ZSwge2ZlYXR1cmV9KSB7XG4gIGlmICghZmVhdHVyZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVkaXRvcjoge1xuICAgICAgLi4uc3RhdGUuZWRpdG9yLFxuICAgICAgc2VsZWN0ZWRGZWF0dXJlOiBudWxsXG4gICAgfVxuICB9O1xuXG4gIGlmIChnZXRGaWx0ZXJJZEluRmVhdHVyZShmZWF0dXJlKSkge1xuICAgIGNvbnN0IGZpbHRlcklkeCA9IG5ld1N0YXRlLmZpbHRlcnMuZmluZEluZGV4KGYgPT4gZi5pZCA9PT0gZ2V0RmlsdGVySWRJbkZlYXR1cmUoZmVhdHVyZSkpO1xuXG4gICAgcmV0dXJuIGZpbHRlcklkeCA+IC0xID8gcmVtb3ZlRmlsdGVyVXBkYXRlcihuZXdTdGF0ZSwge2lkeDogZmlsdGVySWR4fSkgOiBuZXdTdGF0ZTtcbiAgfVxuXG4gIC8vIG1vZGlmeSBlZGl0b3Igb2JqZWN0XG4gIGNvbnN0IG5ld0VkaXRvciA9IHtcbiAgICAuLi5zdGF0ZS5lZGl0b3IsXG4gICAgZmVhdHVyZXM6IHN0YXRlLmVkaXRvci5mZWF0dXJlcy5maWx0ZXIoZiA9PiBmLmlkICE9PSBmZWF0dXJlLmlkKSxcbiAgICBzZWxlY3RlZEZlYXR1cmU6IG51bGxcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVkaXRvcjogbmV3RWRpdG9yXG4gIH07XG59XG5cbi8qKlxuICogVG9nZ2xlIGZlYXR1cmUgYXMgbGF5ZXIgZmlsdGVyXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykuc2V0UG9seWdvbkZpbHRlckxheWVyVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFBvbHlnb25GaWx0ZXJMYXllclVwZGF0ZXIoc3RhdGUsIHBheWxvYWQpIHtcbiAgY29uc3Qge2xheWVyLCBmZWF0dXJlfSA9IHBheWxvYWQ7XG4gIGNvbnN0IGZpbHRlcklkID0gZ2V0RmlsdGVySWRJbkZlYXR1cmUoZmVhdHVyZSk7XG5cbiAgLy8gbGV0IG5ld0ZpbHRlciA9IG51bGw7XG4gIGxldCBmaWx0ZXJJZHg7XG4gIGxldCBuZXdMYXllcklkID0gW2xheWVyLmlkXTtcbiAgbGV0IG5ld1N0YXRlID0gc3RhdGU7XG4gIC8vIElmIHBvbHlnb24gZmlsdGVyIGFscmVhZHkgZXhpc3RzLCB3ZSBuZWVkIHRvIGZpbmQgb3V0IGlmIHRoZSBjdXJyZW50IGxheWVyIGlzIGFscmVhZHkgaW5jbHVkZWRcbiAgaWYgKGZpbHRlcklkKSB7XG4gICAgZmlsdGVySWR4ID0gc3RhdGUuZmlsdGVycy5maW5kSW5kZXgoZiA9PiBmLmlkID09PSBmaWx0ZXJJZCk7XG5cbiAgICBpZiAoIXN0YXRlLmZpbHRlcnNbZmlsdGVySWR4XSkge1xuICAgICAgLy8gd2hhdCBpZiBmaWx0ZXIgZG9lc24ndCBleGlzdD8uLi4gbm90IHBvc3NpYmxlLlxuICAgICAgLy8gYmVjYXVzZSBmZWF0dXJlcyBpbiB0aGUgZWRpdG9yIGlzIHBhc3NlZCBpbiBmcm9tIGZpbHRlcnMgYW5kIGVkaXRvcnMuXG4gICAgICAvLyBidXQgd2Ugd2lsbCBtb3ZlIHRoaXMgZmVhdHVyZSBiYWNrIHRvIGVkaXRvciBqdXN0IGluIGNhc2VcbiAgICAgIGNvbnN0IG5vbmVGaWx0ZXJGZWF0dXJlID0ge1xuICAgICAgICAuLi5mZWF0dXJlLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgLi4uZmVhdHVyZS5wcm9wZXJ0aWVzLFxuICAgICAgICAgIGZpbHRlcklkOiBudWxsXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBlZGl0b3I6IHtcbiAgICAgICAgICAuLi5zdGF0ZS5lZGl0b3IsXG4gICAgICAgICAgZmVhdHVyZXM6IFsuLi5zdGF0ZS5lZGl0b3IuZmVhdHVyZXMsIG5vbmVGaWx0ZXJGZWF0dXJlXSxcbiAgICAgICAgICBzZWxlY3RlZEZlYXR1cmU6IG5vbmVGaWx0ZXJGZWF0dXJlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGZpbHRlciA9IHN0YXRlLmZpbHRlcnNbZmlsdGVySWR4XTtcbiAgICBjb25zdCB7bGF5ZXJJZCA9IFtdfSA9IGZpbHRlcjtcbiAgICBjb25zdCBpc0xheWVySW5jbHVkZWQgPSBsYXllcklkLmluY2x1ZGVzKGxheWVyLmlkKTtcblxuICAgIG5ld0xheWVySWQgPSBpc0xheWVySW5jbHVkZWRcbiAgICAgID8gLy8gaWYgbGF5ZXIgaXMgaW5jbHVkZWQsIHJlbW92ZSBpdFxuICAgICAgICBsYXllcklkLmZpbHRlcihsID0+IGwgIT09IGxheWVyLmlkKVxuICAgICAgOiBbLi4ubGF5ZXJJZCwgbGF5ZXIuaWRdO1xuICB9IGVsc2Uge1xuICAgIC8vIGlmIHdlIGhhdmVuJ3QgY3JlYXRlIHRoZSBwb2x5Z29uIGZpbHRlciwgY3JlYXRlIGl0XG4gICAgY29uc3QgbmV3RmlsdGVyID0gZ2VuZXJhdGVQb2x5Z29uRmlsdGVyKFtdLCBmZWF0dXJlKTtcbiAgICBmaWx0ZXJJZHggPSBzdGF0ZS5maWx0ZXJzLmxlbmd0aDtcblxuICAgIC8vIGFkZCBmZWF0dXJlLCByZW1vdmUgZmVhdHVyZSBmcm9tIGVpZHRvclxuICAgIG5ld1N0YXRlID0ge1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBmaWx0ZXJzOiBbLi4uc3RhdGUuZmlsdGVycywgbmV3RmlsdGVyXSxcbiAgICAgIGVkaXRvcjoge1xuICAgICAgICAuLi5zdGF0ZS5lZGl0b3IsXG4gICAgICAgIGZlYXR1cmVzOiBzdGF0ZS5lZGl0b3IuZmVhdHVyZXMuZmlsdGVyKGYgPT4gZi5pZCAhPT0gZmVhdHVyZS5pZCksXG4gICAgICAgIHNlbGVjdGVkRmVhdHVyZTogbmV3RmlsdGVyLnZhbHVlXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBzZXRGaWx0ZXJVcGRhdGVyKG5ld1N0YXRlLCB7XG4gICAgaWR4OiBmaWx0ZXJJZHgsXG4gICAgcHJvcDogJ2xheWVySWQnLFxuICAgIHZhbHVlOiBuZXdMYXllcklkXG4gIH0pO1xufVxuXG4vKipcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZVVwZGF0ZXJzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtdXBkYXRlcnMnKS5zb3J0VGFibGVDb2x1bW5VcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gc29ydFRhYmxlQ29sdW1uVXBkYXRlcihzdGF0ZSwge2RhdGFJZCwgY29sdW1uLCBtb2RlfSkge1xuICBjb25zdCBkYXRhc2V0ID0gc3RhdGUuZGF0YXNldHNbZGF0YUlkXTtcbiAgaWYgKCFkYXRhc2V0KSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIGlmICghbW9kZSkge1xuICAgIGNvbnN0IGN1cnJlbnRNb2RlID0gZ2V0KGRhdGFzZXQsIFsnc29ydENvbHVtbicsIGNvbHVtbl0pO1xuICAgIG1vZGUgPSBjdXJyZW50TW9kZVxuICAgICAgPyBPYmplY3Qua2V5cyhTT1JUX09SREVSKS5maW5kKG0gPT4gbSAhPT0gY3VycmVudE1vZGUpXG4gICAgICA6IFNPUlRfT1JERVIuQVNDRU5ESU5HO1xuICB9XG5cbiAgY29uc3Qgc29ydGVkID0gc29ydERhdGFzZXRCeUNvbHVtbihkYXRhc2V0LCBjb2x1bW4sIG1vZGUpO1xuICByZXR1cm4gc2V0KFsnZGF0YXNldHMnLCBkYXRhSWRdLCBzb3J0ZWQsIHN0YXRlKTtcbn1cblxuLyoqXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJykucGluVGFibGVDb2x1bW5VcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGluVGFibGVDb2x1bW5VcGRhdGVyKHN0YXRlLCB7ZGF0YUlkLCBjb2x1bW59KSB7XG4gIGNvbnN0IGRhdGFzZXQgPSBzdGF0ZS5kYXRhc2V0c1tkYXRhSWRdO1xuICBpZiAoIWRhdGFzZXQpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cbiAgY29uc3QgZmllbGQgPSBkYXRhc2V0LmZpZWxkcy5maW5kKGYgPT4gZi5uYW1lID09PSBjb2x1bW4pO1xuICBpZiAoIWZpZWxkKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgbGV0IHBpbm5lZENvbHVtbnM7XG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGFzZXQucGlubmVkQ29sdW1ucykgJiYgZGF0YXNldC5waW5uZWRDb2x1bW5zLmluY2x1ZGVzKGZpZWxkLm5hbWUpKSB7XG4gICAgLy8gdW5waW4gaXRcbiAgICBwaW5uZWRDb2x1bW5zID0gZGF0YXNldC5waW5uZWRDb2x1bW5zLmZpbHRlcihjbyA9PiBjbyAhPT0gZmllbGQubmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgcGlubmVkQ29sdW1ucyA9IChkYXRhc2V0LnBpbm5lZENvbHVtbnMgfHwgW10pLmNvbmNhdChmaWVsZC5uYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzZXQoWydkYXRhc2V0cycsIGRhdGFJZCwgJ3Bpbm5lZENvbHVtbnMnXSwgcGlubmVkQ29sdW1ucywgc3RhdGUpO1xufVxuXG4vKipcbiAqIENvcHkgY29sdW1uIGNvbnRlbnQgYXMgc3RyaW5nc1xuICogQG1lbWJlcm9mIHZpc1N0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLmNvcHlUYWJsZUNvbHVtblVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5VGFibGVDb2x1bW5VcGRhdGVyKHN0YXRlLCB7ZGF0YUlkLCBjb2x1bW59KSB7XG4gIGNvbnN0IGRhdGFzZXQgPSBzdGF0ZS5kYXRhc2V0c1tkYXRhSWRdO1xuICBpZiAoIWRhdGFzZXQpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cbiAgY29uc3QgZmllbGRJZHggPSBkYXRhc2V0LmZpZWxkcy5maW5kSW5kZXgoZiA9PiBmLm5hbWUgPT09IGNvbHVtbik7XG4gIGlmIChmaWVsZElkeCA8IDApIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cbiAgY29uc3Qge3R5cGV9ID0gZGF0YXNldC5maWVsZHNbZmllbGRJZHhdO1xuICBjb25zdCB0ZXh0ID0gZGF0YXNldC5hbGxEYXRhLm1hcChkID0+IHBhcnNlRmllbGRWYWx1ZShkW2ZpZWxkSWR4XSwgdHlwZSkpLmpvaW4oJ1xcbicpO1xuXG4gIGNvcHkodGV4dCk7XG5cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBlZGl0b3JcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS11cGRhdGVycycpLnRvZ2dsZUVkaXRvclZpc2liaWxpdHlVcGRhdGVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlRWRpdG9yVmlzaWJpbGl0eVVwZGF0ZXIoc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBlZGl0b3I6IHtcbiAgICAgIC4uLnN0YXRlLmVkaXRvcixcbiAgICAgIHZpc2libGU6ICFzdGF0ZS5lZGl0b3IudmlzaWJsZVxuICAgIH1cbiAgfTtcbn1cbiJdfQ==