"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeFilters = mergeFilters;
exports.mergeLayers = mergeLayers;
exports.mergeInteractions = mergeInteractions;
exports.mergeSplitMaps = mergeSplitMaps;
exports.mergeInteractionTooltipConfig = mergeInteractionTooltipConfig;
exports.mergeLayerBlending = mergeLayerBlending;
exports.mergeAnimationConfig = mergeAnimationConfig;
exports.validateSavedLayerColumns = validateSavedLayerColumns;
exports.validateSavedTextLabel = validateSavedTextLabel;
exports.validateSavedVisualChannels = validateSavedVisualChannels;
exports.validateLayerWithData = validateLayerWithData;
exports.isValidMerger = isValidMerger;
exports.VIS_STATE_MERGERS = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash.uniq"));

var _lodash2 = _interopRequireDefault(require("lodash.pick"));

var _lodash3 = _interopRequireDefault(require("lodash.isequal"));

var _lodash4 = _interopRequireDefault(require("lodash.flattendeep"));

var _utils = require("../utils/utils");

var _filterUtils = require("../utils/filter-utils");

var _splitMapUtils = require("../utils/split-map-utils");

var _gpuFilterUtils = require("../utils/gpu-filter-utils");

var _defaultSettings = require("../constants/default-settings");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Merge loaded filters with current state, if no fields or data are loaded
 * save it for later
 *
 * @type {typeof import('./vis-state-merger').mergeFilters}
 */
function mergeFilters(state, filtersToMerge) {
  var merged = [];
  var unmerged = [];
  var datasets = state.datasets;
  var updatedDatasets = datasets;

  if (!Array.isArray(filtersToMerge) || !filtersToMerge.length) {
    return state;
  } // merge filters


  filtersToMerge.forEach(function (filter) {
    // we can only look for datasets define in the filter dataId
    var datasetIds = (0, _utils.toArray)(filter.dataId); // we can merge a filter only if all datasets in filter.dataId are loaded

    if (datasetIds.every(function (d) {
      return datasets[d];
    })) {
      // all datasetIds in filter must be present the state datasets
      var _datasetIds$reduce = datasetIds.reduce(function (acc, datasetId) {
        var dataset = updatedDatasets[datasetId];
        var layers = state.layers.filter(function (l) {
          return l.config.dataId === dataset.id;
        });

        var _validateFilterWithDa = (0, _filterUtils.validateFilterWithData)(acc.augmentedDatasets[datasetId] || dataset, filter, layers),
            updatedFilter = _validateFilterWithDa.filter,
            updatedDataset = _validateFilterWithDa.dataset;

        if (updatedFilter) {
          return _objectSpread(_objectSpread({}, acc), {}, {
            // merge filter props
            filter: acc.filter ? _objectSpread(_objectSpread({}, acc.filter), (0, _filterUtils.mergeFilterDomainStep)(acc, updatedFilter)) : updatedFilter,
            applyToDatasets: [].concat((0, _toConsumableArray2["default"])(acc.applyToDatasets), [datasetId]),
            augmentedDatasets: _objectSpread(_objectSpread({}, acc.augmentedDatasets), {}, (0, _defineProperty2["default"])({}, datasetId, updatedDataset))
          });
        }

        return acc;
      }, {
        filter: null,
        applyToDatasets: [],
        augmentedDatasets: {}
      }),
          validatedFilter = _datasetIds$reduce.filter,
          applyToDatasets = _datasetIds$reduce.applyToDatasets,
          augmentedDatasets = _datasetIds$reduce.augmentedDatasets;

      if (validatedFilter && (0, _lodash3["default"])(datasetIds, applyToDatasets)) {
        merged.push(validatedFilter);
        updatedDatasets = _objectSpread(_objectSpread({}, updatedDatasets), augmentedDatasets);
      }
    } else {
      unmerged.push(filter);
    }
  }); // merge filter with existing

  var updatedFilters = [].concat((0, _toConsumableArray2["default"])(state.filters || []), merged);
  updatedFilters = (0, _gpuFilterUtils.resetFilterGpuMode)(updatedFilters);
  updatedFilters = (0, _gpuFilterUtils.assignGpuChannels)(updatedFilters); // filter data

  var datasetsToFilter = (0, _lodash["default"])((0, _lodash4["default"])(merged.map(function (f) {
    return f.dataId;
  })));
  var filtered = (0, _filterUtils.applyFiltersToDatasets)(datasetsToFilter, updatedDatasets, updatedFilters, state.layers);
  return _objectSpread(_objectSpread({}, state), {}, {
    filters: updatedFilters,
    datasets: filtered,
    filterToBeMerged: [].concat((0, _toConsumableArray2["default"])(state.filterToBeMerged), unmerged)
  });
}
/**
 * Merge layers from de-serialized state, if no fields or data are loaded
 * save it for later
 *
 * @type {typeof import('./vis-state-merger').mergeLayers}
 */


function mergeLayers(state, layersToMerge) {
  var mergedLayer = [];
  var unmerged = [];
  var datasets = state.datasets;

  if (!Array.isArray(layersToMerge) || !layersToMerge.length) {
    return state;
  }

  layersToMerge.forEach(function (layer) {
    if (datasets[layer.config.dataId]) {
      // datasets are already loaded
      var validateLayer = validateLayerWithData(datasets[layer.config.dataId], layer, state.layerClasses);

      if (validateLayer) {
        mergedLayer.push(validateLayer);
      }
    } else {
      // datasets not yet loaded
      unmerged.push(layer);
    }
  });
  var layers = [].concat((0, _toConsumableArray2["default"])(state.layers), mergedLayer);
  var newLayerOrder = mergedLayer.map(function (_, i) {
    return state.layers.length + i;
  }); // put new layers in front of current layers

  var layerOrder = [].concat((0, _toConsumableArray2["default"])(newLayerOrder), (0, _toConsumableArray2["default"])(state.layerOrder));
  return _objectSpread(_objectSpread({}, state), {}, {
    layers: layers,
    layerOrder: layerOrder,
    layerToBeMerged: [].concat((0, _toConsumableArray2["default"])(state.layerToBeMerged), unmerged)
  });
}
/**
 * Merge interactions with saved config
 *
 * @type {typeof import('./vis-state-merger').mergeInteractions}
 */


function mergeInteractions(state, interactionToBeMerged) {
  var merged = {};
  var unmerged = {};

  if (interactionToBeMerged) {
    Object.keys(interactionToBeMerged).forEach(function (key) {
      if (!state.interactionConfig[key]) {
        return;
      }

      var currentConfig = state.interactionConfig[key].config;

      var _ref = interactionToBeMerged[key] || {},
          enabled = _ref.enabled,
          configSaved = (0, _objectWithoutProperties2["default"])(_ref, ["enabled"]);

      var configToMerge = configSaved;

      if (key === 'tooltip') {
        var _mergeInteractionTool = mergeInteractionTooltipConfig(state, configSaved),
            mergedTooltip = _mergeInteractionTool.mergedTooltip,
            unmergedTooltip = _mergeInteractionTool.unmergedTooltip; // merge new dataset tooltips with original dataset tooltips


        configToMerge = {
          fieldsToShow: _objectSpread(_objectSpread({}, currentConfig.fieldsToShow), mergedTooltip)
        };

        if (Object.keys(unmergedTooltip).length) {
          unmerged.tooltip = {
            fieldsToShow: unmergedTooltip,
            enabled: enabled
          };
        }
      }

      merged[key] = _objectSpread(_objectSpread({}, state.interactionConfig[key]), {}, {
        enabled: enabled
      }, currentConfig ? {
        config: (0, _lodash2["default"])(_objectSpread(_objectSpread({}, currentConfig), configToMerge), Object.keys(currentConfig))
      } : {});
    });
  }

  return _objectSpread(_objectSpread({}, state), {}, {
    interactionConfig: _objectSpread(_objectSpread({}, state.interactionConfig), merged),
    interactionToBeMerged: unmerged
  });
}
/**
 * Merge splitMaps config with current visStete.
 * 1. if current map is split, but splitMap DOESNOT contain maps
 *    : don't merge anything
 * 2. if current map is NOT split, but splitMaps contain maps
 *    : add to splitMaps, and add current layers to splitMaps
 * @type {typeof import('./vis-state-merger').mergeInteractions}
 */


function mergeSplitMaps(state) {
  var splitMaps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var merged = (0, _toConsumableArray2["default"])(state.splitMaps);
  var unmerged = [];
  splitMaps.forEach(function (sm, i) {
    Object.entries(sm.layers).forEach(function (_ref2) {
      var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
          id = _ref3[0],
          value = _ref3[1];

      // check if layer exists
      var pushTo = state.layers.find(function (l) {
        return l.id === id;
      }) ? merged : unmerged; // create map panel if current map is not split

      pushTo[i] = pushTo[i] || {
        layers: pushTo === merged ? (0, _splitMapUtils.getInitialMapLayersForSplitMap)(state.layers) : []
      };
      pushTo[i].layers = _objectSpread(_objectSpread({}, pushTo[i].layers), {}, (0, _defineProperty2["default"])({}, id, value));
    });
  });
  return _objectSpread(_objectSpread({}, state), {}, {
    splitMaps: merged,
    splitMapsToBeMerged: [].concat((0, _toConsumableArray2["default"])(state.splitMapsToBeMerged), unmerged)
  });
}
/**
 * Merge interactionConfig.tooltip with saved config,
 * validate fieldsToShow
 *
 * @param {object} state
 * @param {object} tooltipConfig
 * @return {object} - {mergedTooltip: {}, unmergedTooltip: {}}
 */


function mergeInteractionTooltipConfig(state) {
  var tooltipConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var unmergedTooltip = {};
  var mergedTooltip = {};

  if (!tooltipConfig.fieldsToShow || !Object.keys(tooltipConfig.fieldsToShow).length) {
    return {
      mergedTooltip: mergedTooltip,
      unmergedTooltip: unmergedTooltip
    };
  }

  for (var dataId in tooltipConfig.fieldsToShow) {
    if (!state.datasets[dataId]) {
      // is not yet loaded
      unmergedTooltip[dataId] = tooltipConfig.fieldsToShow[dataId];
    } else {
      (function () {
        // if dataset is loaded
        var allFields = state.datasets[dataId].fields.map(function (d) {
          return d.name;
        });
        var foundFieldsToShow = tooltipConfig.fieldsToShow[dataId].filter(function (field) {
          return allFields.includes(field.name);
        });
        mergedTooltip[dataId] = foundFieldsToShow;
      })();
    }
  }

  return {
    mergedTooltip: mergedTooltip,
    unmergedTooltip: unmergedTooltip
  };
}
/**
 * Merge layerBlending with saved
 *
 * @type {typeof import('./vis-state-merger').mergeLayerBlending}
 */


function mergeLayerBlending(state, layerBlending) {
  if (layerBlending && _defaultSettings.LAYER_BLENDINGS[layerBlending]) {
    return _objectSpread(_objectSpread({}, state), {}, {
      layerBlending: layerBlending
    });
  }

  return state;
}
/**
 * Merge animation config
 * @type {typeof import('./vis-state-merger').mergeAnimationConfig}
 */


function mergeAnimationConfig(state, animation) {
  if (animation && animation.currentTime) {
    return _objectSpread(_objectSpread({}, state), {}, {
      animationConfig: _objectSpread(_objectSpread(_objectSpread({}, state.animationConfig), animation), {}, {
        domain: null
      })
    });
  }

  return state;
}
/**
 * Validate saved layer columns with new data,
 * update fieldIdx based on new fields
 *
 * @param {Array<Object>} fields
 * @param {Object} savedCols
 * @param {Object} emptyCols
 * @return {null | Object} - validated columns or null
 */


function validateSavedLayerColumns(fields, savedCols, emptyCols) {
  var colFound = {}; // find actual column fieldIdx, in case it has changed

  var allColFound = Object.keys(emptyCols).every(function (key) {
    var saved = savedCols[key];
    colFound[key] = _objectSpread({}, emptyCols[key]); // TODO: replace with new approach

    var fieldIdx = fields.findIndex(function (_ref4) {
      var name = _ref4.name;
      return name === saved;
    });

    if (fieldIdx > -1) {
      // update found columns
      colFound[key].fieldIdx = fieldIdx;
      colFound[key].value = saved;
      return true;
    } // if col is optional, allow null value


    return emptyCols[key].optional || false;
  });
  return allColFound && colFound;
}
/**
 * Validate saved text label config with new data
 * refer to vis-state-schema.js TextLabelSchemaV1
 *
 * @param {Array<Object>} fields
 * @param {Object} savedTextLabel
 * @return {Object} - validated textlabel
 */


function validateSavedTextLabel(fields, _ref5, savedTextLabel) {
  var _ref6 = (0, _slicedToArray2["default"])(_ref5, 1),
      layerTextLabel = _ref6[0];

  var savedTextLabels = Array.isArray(savedTextLabel) ? savedTextLabel : [savedTextLabel]; // validate field

  return savedTextLabels.map(function (textLabel) {
    var field = textLabel.field ? fields.find(function (fd) {
      return Object.keys(textLabel.field).every(function (key) {
        return textLabel.field[key] === fd[key];
      });
    }) : null;
    return Object.keys(layerTextLabel).reduce(function (accu, key) {
      return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, key === 'field' ? field : textLabel[key] || layerTextLabel[key]));
    }, {});
  });
}
/**
 * Validate saved visual channels config with new data,
 * refer to vis-state-schema.js VisualChannelSchemaV1
 *
 * @param {Array<Object>} fields
 * @param {Object} newLayer
 * @param {Object} savedLayer
 * @return {Object} - newLayer
 */


function validateSavedVisualChannels(fields, newLayer, savedLayer) {
  Object.values(newLayer.visualChannels).forEach(function (_ref7) {
    var field = _ref7.field,
        scale = _ref7.scale,
        key = _ref7.key;
    var foundField;

    if (savedLayer.config[field]) {
      foundField = fields.find(function (fd) {
        return Object.keys(savedLayer.config[field]).every(function (prop) {
          return savedLayer.config[field][prop] === fd[prop];
        });
      });
    }

    var foundChannel = _objectSpread(_objectSpread({}, foundField ? (0, _defineProperty2["default"])({}, field, foundField) : {}), savedLayer.config[scale] ? (0, _defineProperty2["default"])({}, scale, savedLayer.config[scale]) : {});

    if (Object.keys(foundChannel).length) {
      newLayer.updateLayerConfig(foundChannel);
      newLayer.validateVisualChannel(key);
    }
  });
  return newLayer;
}
/**
 * Validate saved layer config with new data,
 * update fieldIdx based on new fields
 * @param {object} dataset
 * @param {Array<Object>} dataset.fields
 * @param {string} dataset.id
 * @param {Object} savedLayer
 * @param {Object} layerClasses
 * @return {null | Object} - validated layer or null
 */


function validateLayerWithData(_ref10, savedLayer, layerClasses) {
  var fields = _ref10.fields,
      dataId = _ref10.id;
  var type = savedLayer.type; // layer doesnt have a valid type

  if (!layerClasses.hasOwnProperty(type) || !savedLayer.config || !savedLayer.config.columns) {
    return null;
  }

  var newLayer = new layerClasses[type]({
    id: savedLayer.id,
    dataId: dataId,
    label: savedLayer.config.label,
    color: savedLayer.config.color,
    isVisible: savedLayer.config.isVisible,
    hidden: savedLayer.config.hidden
  }); // find column fieldIdx

  var columns = validateSavedLayerColumns(fields, savedLayer.config.columns, newLayer.getLayerColumns());

  if (!columns) {
    return null;
  } // visual channel field is saved to be {name, type}
  // find visual channel field by matching both name and type
  // refer to vis-state-schema.js VisualChannelSchemaV1


  newLayer = validateSavedVisualChannels(fields, newLayer, savedLayer);
  var textLabel = savedLayer.config.textLabel && newLayer.config.textLabel ? validateSavedTextLabel(fields, newLayer.config.textLabel, savedLayer.config.textLabel) : newLayer.config.textLabel; // copy visConfig over to emptyLayer to make sure it has all the props

  var visConfig = newLayer.copyLayerConfig(newLayer.config.visConfig, savedLayer.config.visConfig || {}, {
    shallowCopy: ['colorRange', 'strokeColorRange']
  });
  newLayer.updateLayerConfig({
    columns: columns,
    visConfig: visConfig,
    textLabel: textLabel
  });
  return newLayer;
}

function isValidMerger(merger) {
  return (0, _utils.isObject)(merger) && typeof merger.merge === 'function' && typeof merger.prop === 'string';
}

var VIS_STATE_MERGERS = [{
  merge: mergeLayers,
  prop: 'layers',
  toMergeProp: 'layerToBeMerged'
}, {
  merge: mergeFilters,
  prop: 'filters',
  toMergeProp: 'filterToBeMerged'
}, {
  merge: mergeInteractions,
  prop: 'interactionConfig',
  toMergeProp: 'interactionToBeMerged'
}, {
  merge: mergeLayerBlending,
  prop: 'layerBlending'
}, {
  merge: mergeSplitMaps,
  prop: 'splitMaps',
  toMergeProp: 'splitMapsToBeMerged'
}, {
  merge: mergeAnimationConfig,
  prop: 'animationConfig'
}];
exports.VIS_STATE_MERGERS = VIS_STATE_MERGERS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy92aXMtc3RhdGUtbWVyZ2VyLmpzIl0sIm5hbWVzIjpbIm1lcmdlRmlsdGVycyIsInN0YXRlIiwiZmlsdGVyc1RvTWVyZ2UiLCJtZXJnZWQiLCJ1bm1lcmdlZCIsImRhdGFzZXRzIiwidXBkYXRlZERhdGFzZXRzIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiZm9yRWFjaCIsImZpbHRlciIsImRhdGFzZXRJZHMiLCJkYXRhSWQiLCJldmVyeSIsImQiLCJyZWR1Y2UiLCJhY2MiLCJkYXRhc2V0SWQiLCJkYXRhc2V0IiwibGF5ZXJzIiwibCIsImNvbmZpZyIsImlkIiwiYXVnbWVudGVkRGF0YXNldHMiLCJ1cGRhdGVkRmlsdGVyIiwidXBkYXRlZERhdGFzZXQiLCJhcHBseVRvRGF0YXNldHMiLCJ2YWxpZGF0ZWRGaWx0ZXIiLCJwdXNoIiwidXBkYXRlZEZpbHRlcnMiLCJmaWx0ZXJzIiwiZGF0YXNldHNUb0ZpbHRlciIsIm1hcCIsImYiLCJmaWx0ZXJlZCIsImZpbHRlclRvQmVNZXJnZWQiLCJtZXJnZUxheWVycyIsImxheWVyc1RvTWVyZ2UiLCJtZXJnZWRMYXllciIsImxheWVyIiwidmFsaWRhdGVMYXllciIsInZhbGlkYXRlTGF5ZXJXaXRoRGF0YSIsImxheWVyQ2xhc3NlcyIsIm5ld0xheWVyT3JkZXIiLCJfIiwiaSIsImxheWVyT3JkZXIiLCJsYXllclRvQmVNZXJnZWQiLCJtZXJnZUludGVyYWN0aW9ucyIsImludGVyYWN0aW9uVG9CZU1lcmdlZCIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJpbnRlcmFjdGlvbkNvbmZpZyIsImN1cnJlbnRDb25maWciLCJlbmFibGVkIiwiY29uZmlnU2F2ZWQiLCJjb25maWdUb01lcmdlIiwibWVyZ2VJbnRlcmFjdGlvblRvb2x0aXBDb25maWciLCJtZXJnZWRUb29sdGlwIiwidW5tZXJnZWRUb29sdGlwIiwiZmllbGRzVG9TaG93IiwidG9vbHRpcCIsIm1lcmdlU3BsaXRNYXBzIiwic3BsaXRNYXBzIiwic20iLCJlbnRyaWVzIiwidmFsdWUiLCJwdXNoVG8iLCJmaW5kIiwic3BsaXRNYXBzVG9CZU1lcmdlZCIsInRvb2x0aXBDb25maWciLCJhbGxGaWVsZHMiLCJmaWVsZHMiLCJuYW1lIiwiZm91bmRGaWVsZHNUb1Nob3ciLCJmaWVsZCIsImluY2x1ZGVzIiwibWVyZ2VMYXllckJsZW5kaW5nIiwibGF5ZXJCbGVuZGluZyIsIkxBWUVSX0JMRU5ESU5HUyIsIm1lcmdlQW5pbWF0aW9uQ29uZmlnIiwiYW5pbWF0aW9uIiwiY3VycmVudFRpbWUiLCJhbmltYXRpb25Db25maWciLCJkb21haW4iLCJ2YWxpZGF0ZVNhdmVkTGF5ZXJDb2x1bW5zIiwic2F2ZWRDb2xzIiwiZW1wdHlDb2xzIiwiY29sRm91bmQiLCJhbGxDb2xGb3VuZCIsInNhdmVkIiwiZmllbGRJZHgiLCJmaW5kSW5kZXgiLCJvcHRpb25hbCIsInZhbGlkYXRlU2F2ZWRUZXh0TGFiZWwiLCJzYXZlZFRleHRMYWJlbCIsImxheWVyVGV4dExhYmVsIiwic2F2ZWRUZXh0TGFiZWxzIiwidGV4dExhYmVsIiwiZmQiLCJhY2N1IiwidmFsaWRhdGVTYXZlZFZpc3VhbENoYW5uZWxzIiwibmV3TGF5ZXIiLCJzYXZlZExheWVyIiwidmFsdWVzIiwidmlzdWFsQ2hhbm5lbHMiLCJzY2FsZSIsImZvdW5kRmllbGQiLCJwcm9wIiwiZm91bmRDaGFubmVsIiwidXBkYXRlTGF5ZXJDb25maWciLCJ2YWxpZGF0ZVZpc3VhbENoYW5uZWwiLCJ0eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjb2x1bW5zIiwibGFiZWwiLCJjb2xvciIsImlzVmlzaWJsZSIsImhpZGRlbiIsImdldExheWVyQ29sdW1ucyIsInZpc0NvbmZpZyIsImNvcHlMYXllckNvbmZpZyIsInNoYWxsb3dDb3B5IiwiaXNWYWxpZE1lcmdlciIsIm1lcmdlciIsIm1lcmdlIiwiVklTX1NUQVRFX01FUkdFUlMiLCJ0b01lcmdlUHJvcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7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SUFBSSxFQUFFLFdBQTlCO0FBQTJDbUIsRUFBQUEsV0FBVyxFQUFFO0FBQXhELENBTCtCLEVBTS9CO0FBQUNGLEVBQUFBLEtBQUssRUFBRTdDLG9CQUFSO0FBQThCNEIsRUFBQUEsSUFBSSxFQUFFO0FBQXBDLENBTitCLENBQTFCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHVuaXEgZnJvbSAnbG9kYXNoLnVuaXEnO1xuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoLnBpY2snO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoLmlzZXF1YWwnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC5mbGF0dGVuZGVlcCc7XG5pbXBvcnQge3RvQXJyYXksIGlzT2JqZWN0fSBmcm9tICd1dGlscy91dGlscyc7XG5cbmltcG9ydCB7XG4gIGFwcGx5RmlsdGVyc1RvRGF0YXNldHMsXG4gIG1lcmdlRmlsdGVyRG9tYWluU3RlcCxcbiAgdmFsaWRhdGVGaWx0ZXJXaXRoRGF0YVxufSBmcm9tICd1dGlscy9maWx0ZXItdXRpbHMnO1xuXG5pbXBvcnQge2dldEluaXRpYWxNYXBMYXllcnNGb3JTcGxpdE1hcH0gZnJvbSAndXRpbHMvc3BsaXQtbWFwLXV0aWxzJztcbmltcG9ydCB7cmVzZXRGaWx0ZXJHcHVNb2RlLCBhc3NpZ25HcHVDaGFubmVsc30gZnJvbSAndXRpbHMvZ3B1LWZpbHRlci11dGlscyc7XG5cbmltcG9ydCB7TEFZRVJfQkxFTkRJTkdTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5cbi8qKlxuICogTWVyZ2UgbG9hZGVkIGZpbHRlcnMgd2l0aCBjdXJyZW50IHN0YXRlLCBpZiBubyBmaWVsZHMgb3IgZGF0YSBhcmUgbG9hZGVkXG4gKiBzYXZlIGl0IGZvciBsYXRlclxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1tZXJnZXInKS5tZXJnZUZpbHRlcnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUZpbHRlcnMoc3RhdGUsIGZpbHRlcnNUb01lcmdlKSB7XG4gIGNvbnN0IG1lcmdlZCA9IFtdO1xuICBjb25zdCB1bm1lcmdlZCA9IFtdO1xuICBjb25zdCB7ZGF0YXNldHN9ID0gc3RhdGU7XG4gIGxldCB1cGRhdGVkRGF0YXNldHMgPSBkYXRhc2V0cztcblxuICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyc1RvTWVyZ2UpIHx8ICFmaWx0ZXJzVG9NZXJnZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvLyBtZXJnZSBmaWx0ZXJzXG4gIGZpbHRlcnNUb01lcmdlLmZvckVhY2goZmlsdGVyID0+IHtcbiAgICAvLyB3ZSBjYW4gb25seSBsb29rIGZvciBkYXRhc2V0cyBkZWZpbmUgaW4gdGhlIGZpbHRlciBkYXRhSWRcbiAgICBjb25zdCBkYXRhc2V0SWRzID0gdG9BcnJheShmaWx0ZXIuZGF0YUlkKTtcblxuICAgIC8vIHdlIGNhbiBtZXJnZSBhIGZpbHRlciBvbmx5IGlmIGFsbCBkYXRhc2V0cyBpbiBmaWx0ZXIuZGF0YUlkIGFyZSBsb2FkZWRcbiAgICBpZiAoZGF0YXNldElkcy5ldmVyeShkID0+IGRhdGFzZXRzW2RdKSkge1xuICAgICAgLy8gYWxsIGRhdGFzZXRJZHMgaW4gZmlsdGVyIG11c3QgYmUgcHJlc2VudCB0aGUgc3RhdGUgZGF0YXNldHNcbiAgICAgIGNvbnN0IHtmaWx0ZXI6IHZhbGlkYXRlZEZpbHRlciwgYXBwbHlUb0RhdGFzZXRzLCBhdWdtZW50ZWREYXRhc2V0c30gPSBkYXRhc2V0SWRzLnJlZHVjZShcbiAgICAgICAgKGFjYywgZGF0YXNldElkKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGF0YXNldCA9IHVwZGF0ZWREYXRhc2V0c1tkYXRhc2V0SWRdO1xuICAgICAgICAgIGNvbnN0IGxheWVycyA9IHN0YXRlLmxheWVycy5maWx0ZXIobCA9PiBsLmNvbmZpZy5kYXRhSWQgPT09IGRhdGFzZXQuaWQpO1xuICAgICAgICAgIGNvbnN0IHtmaWx0ZXI6IHVwZGF0ZWRGaWx0ZXIsIGRhdGFzZXQ6IHVwZGF0ZWREYXRhc2V0fSA9IHZhbGlkYXRlRmlsdGVyV2l0aERhdGEoXG4gICAgICAgICAgICBhY2MuYXVnbWVudGVkRGF0YXNldHNbZGF0YXNldElkXSB8fCBkYXRhc2V0LFxuICAgICAgICAgICAgZmlsdGVyLFxuICAgICAgICAgICAgbGF5ZXJzXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmICh1cGRhdGVkRmlsdGVyKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAuLi5hY2MsXG4gICAgICAgICAgICAgIC8vIG1lcmdlIGZpbHRlciBwcm9wc1xuICAgICAgICAgICAgICBmaWx0ZXI6IGFjYy5maWx0ZXJcbiAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uYWNjLmZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgLi4ubWVyZ2VGaWx0ZXJEb21haW5TdGVwKGFjYywgdXBkYXRlZEZpbHRlcilcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA6IHVwZGF0ZWRGaWx0ZXIsXG5cbiAgICAgICAgICAgICAgYXBwbHlUb0RhdGFzZXRzOiBbLi4uYWNjLmFwcGx5VG9EYXRhc2V0cywgZGF0YXNldElkXSxcblxuICAgICAgICAgICAgICBhdWdtZW50ZWREYXRhc2V0czoge1xuICAgICAgICAgICAgICAgIC4uLmFjYy5hdWdtZW50ZWREYXRhc2V0cyxcbiAgICAgICAgICAgICAgICBbZGF0YXNldElkXTogdXBkYXRlZERhdGFzZXRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZmlsdGVyOiBudWxsLFxuICAgICAgICAgIGFwcGx5VG9EYXRhc2V0czogW10sXG4gICAgICAgICAgYXVnbWVudGVkRGF0YXNldHM6IHt9XG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGlmICh2YWxpZGF0ZWRGaWx0ZXIgJiYgaXNFcXVhbChkYXRhc2V0SWRzLCBhcHBseVRvRGF0YXNldHMpKSB7XG4gICAgICAgIG1lcmdlZC5wdXNoKHZhbGlkYXRlZEZpbHRlcik7XG4gICAgICAgIHVwZGF0ZWREYXRhc2V0cyA9IHtcbiAgICAgICAgICAuLi51cGRhdGVkRGF0YXNldHMsXG4gICAgICAgICAgLi4uYXVnbWVudGVkRGF0YXNldHNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdW5tZXJnZWQucHVzaChmaWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gbWVyZ2UgZmlsdGVyIHdpdGggZXhpc3RpbmdcbiAgbGV0IHVwZGF0ZWRGaWx0ZXJzID0gWy4uLihzdGF0ZS5maWx0ZXJzIHx8IFtdKSwgLi4ubWVyZ2VkXTtcbiAgdXBkYXRlZEZpbHRlcnMgPSByZXNldEZpbHRlckdwdU1vZGUodXBkYXRlZEZpbHRlcnMpO1xuICB1cGRhdGVkRmlsdGVycyA9IGFzc2lnbkdwdUNoYW5uZWxzKHVwZGF0ZWRGaWx0ZXJzKTtcbiAgLy8gZmlsdGVyIGRhdGFcbiAgY29uc3QgZGF0YXNldHNUb0ZpbHRlciA9IHVuaXEoZmxhdHRlbkRlZXAobWVyZ2VkLm1hcChmID0+IGYuZGF0YUlkKSkpO1xuXG4gIGNvbnN0IGZpbHRlcmVkID0gYXBwbHlGaWx0ZXJzVG9EYXRhc2V0cyhcbiAgICBkYXRhc2V0c1RvRmlsdGVyLFxuICAgIHVwZGF0ZWREYXRhc2V0cyxcbiAgICB1cGRhdGVkRmlsdGVycyxcbiAgICBzdGF0ZS5sYXllcnNcbiAgKTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGZpbHRlcnM6IHVwZGF0ZWRGaWx0ZXJzLFxuICAgIGRhdGFzZXRzOiBmaWx0ZXJlZCxcbiAgICBmaWx0ZXJUb0JlTWVyZ2VkOiBbLi4uc3RhdGUuZmlsdGVyVG9CZU1lcmdlZCwgLi4udW5tZXJnZWRdXG4gIH07XG59XG5cbi8qKlxuICogTWVyZ2UgbGF5ZXJzIGZyb20gZGUtc2VyaWFsaXplZCBzdGF0ZSwgaWYgbm8gZmllbGRzIG9yIGRhdGEgYXJlIGxvYWRlZFxuICogc2F2ZSBpdCBmb3IgbGF0ZXJcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtbWVyZ2VyJykubWVyZ2VMYXllcnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUxheWVycyhzdGF0ZSwgbGF5ZXJzVG9NZXJnZSkge1xuICBjb25zdCBtZXJnZWRMYXllciA9IFtdO1xuICBjb25zdCB1bm1lcmdlZCA9IFtdO1xuXG4gIGNvbnN0IHtkYXRhc2V0c30gPSBzdGF0ZTtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkobGF5ZXJzVG9NZXJnZSkgfHwgIWxheWVyc1RvTWVyZ2UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgbGF5ZXJzVG9NZXJnZS5mb3JFYWNoKGxheWVyID0+IHtcbiAgICBpZiAoZGF0YXNldHNbbGF5ZXIuY29uZmlnLmRhdGFJZF0pIHtcbiAgICAgIC8vIGRhdGFzZXRzIGFyZSBhbHJlYWR5IGxvYWRlZFxuICAgICAgY29uc3QgdmFsaWRhdGVMYXllciA9IHZhbGlkYXRlTGF5ZXJXaXRoRGF0YShcbiAgICAgICAgZGF0YXNldHNbbGF5ZXIuY29uZmlnLmRhdGFJZF0sXG4gICAgICAgIGxheWVyLFxuICAgICAgICBzdGF0ZS5sYXllckNsYXNzZXNcbiAgICAgICk7XG5cbiAgICAgIGlmICh2YWxpZGF0ZUxheWVyKSB7XG4gICAgICAgIG1lcmdlZExheWVyLnB1c2godmFsaWRhdGVMYXllcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRhdGFzZXRzIG5vdCB5ZXQgbG9hZGVkXG4gICAgICB1bm1lcmdlZC5wdXNoKGxheWVyKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGxheWVycyA9IFsuLi5zdGF0ZS5sYXllcnMsIC4uLm1lcmdlZExheWVyXTtcbiAgY29uc3QgbmV3TGF5ZXJPcmRlciA9IG1lcmdlZExheWVyLm1hcCgoXywgaSkgPT4gc3RhdGUubGF5ZXJzLmxlbmd0aCArIGkpO1xuXG4gIC8vIHB1dCBuZXcgbGF5ZXJzIGluIGZyb250IG9mIGN1cnJlbnQgbGF5ZXJzXG4gIGNvbnN0IGxheWVyT3JkZXIgPSBbLi4ubmV3TGF5ZXJPcmRlciwgLi4uc3RhdGUubGF5ZXJPcmRlcl07XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnMsXG4gICAgbGF5ZXJPcmRlcixcbiAgICBsYXllclRvQmVNZXJnZWQ6IFsuLi5zdGF0ZS5sYXllclRvQmVNZXJnZWQsIC4uLnVubWVyZ2VkXVxuICB9O1xufVxuXG4vKipcbiAqIE1lcmdlIGludGVyYWN0aW9ucyB3aXRoIHNhdmVkIGNvbmZpZ1xuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1tZXJnZXInKS5tZXJnZUludGVyYWN0aW9uc31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlSW50ZXJhY3Rpb25zKHN0YXRlLCBpbnRlcmFjdGlvblRvQmVNZXJnZWQpIHtcbiAgY29uc3QgbWVyZ2VkID0ge307XG4gIGNvbnN0IHVubWVyZ2VkID0ge307XG5cbiAgaWYgKGludGVyYWN0aW9uVG9CZU1lcmdlZCkge1xuICAgIE9iamVjdC5rZXlzKGludGVyYWN0aW9uVG9CZU1lcmdlZCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKCFzdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZ1trZXldKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudENvbmZpZyA9IHN0YXRlLmludGVyYWN0aW9uQ29uZmlnW2tleV0uY29uZmlnO1xuXG4gICAgICBjb25zdCB7ZW5hYmxlZCwgLi4uY29uZmlnU2F2ZWR9ID0gaW50ZXJhY3Rpb25Ub0JlTWVyZ2VkW2tleV0gfHwge307XG4gICAgICBsZXQgY29uZmlnVG9NZXJnZSA9IGNvbmZpZ1NhdmVkO1xuXG4gICAgICBpZiAoa2V5ID09PSAndG9vbHRpcCcpIHtcbiAgICAgICAgY29uc3Qge21lcmdlZFRvb2x0aXAsIHVubWVyZ2VkVG9vbHRpcH0gPSBtZXJnZUludGVyYWN0aW9uVG9vbHRpcENvbmZpZyhzdGF0ZSwgY29uZmlnU2F2ZWQpO1xuXG4gICAgICAgIC8vIG1lcmdlIG5ldyBkYXRhc2V0IHRvb2x0aXBzIHdpdGggb3JpZ2luYWwgZGF0YXNldCB0b29sdGlwc1xuICAgICAgICBjb25maWdUb01lcmdlID0ge1xuICAgICAgICAgIGZpZWxkc1RvU2hvdzoge1xuICAgICAgICAgICAgLi4uY3VycmVudENvbmZpZy5maWVsZHNUb1Nob3csXG4gICAgICAgICAgICAuLi5tZXJnZWRUb29sdGlwXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1bm1lcmdlZFRvb2x0aXApLmxlbmd0aCkge1xuICAgICAgICAgIHVubWVyZ2VkLnRvb2x0aXAgPSB7ZmllbGRzVG9TaG93OiB1bm1lcmdlZFRvb2x0aXAsIGVuYWJsZWR9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lcmdlZFtrZXldID0ge1xuICAgICAgICAuLi5zdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZ1trZXldLFxuICAgICAgICBlbmFibGVkLFxuICAgICAgICAuLi4oY3VycmVudENvbmZpZ1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBjb25maWc6IHBpY2soXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgLi4uY3VycmVudENvbmZpZyxcbiAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZ1RvTWVyZ2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGN1cnJlbnRDb25maWcpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHt9KVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgaW50ZXJhY3Rpb25Db25maWc6IHtcbiAgICAgIC4uLnN0YXRlLmludGVyYWN0aW9uQ29uZmlnLFxuICAgICAgLi4ubWVyZ2VkXG4gICAgfSxcbiAgICBpbnRlcmFjdGlvblRvQmVNZXJnZWQ6IHVubWVyZ2VkXG4gIH07XG59XG5cbi8qKlxuICogTWVyZ2Ugc3BsaXRNYXBzIGNvbmZpZyB3aXRoIGN1cnJlbnQgdmlzU3RldGUuXG4gKiAxLiBpZiBjdXJyZW50IG1hcCBpcyBzcGxpdCwgYnV0IHNwbGl0TWFwIERPRVNOT1QgY29udGFpbiBtYXBzXG4gKiAgICA6IGRvbid0IG1lcmdlIGFueXRoaW5nXG4gKiAyLiBpZiBjdXJyZW50IG1hcCBpcyBOT1Qgc3BsaXQsIGJ1dCBzcGxpdE1hcHMgY29udGFpbiBtYXBzXG4gKiAgICA6IGFkZCB0byBzcGxpdE1hcHMsIGFuZCBhZGQgY3VycmVudCBsYXllcnMgdG8gc3BsaXRNYXBzXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtbWVyZ2VyJykubWVyZ2VJbnRlcmFjdGlvbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNwbGl0TWFwcyhzdGF0ZSwgc3BsaXRNYXBzID0gW10pIHtcbiAgY29uc3QgbWVyZ2VkID0gWy4uLnN0YXRlLnNwbGl0TWFwc107XG4gIGNvbnN0IHVubWVyZ2VkID0gW107XG4gIHNwbGl0TWFwcy5mb3JFYWNoKChzbSwgaSkgPT4ge1xuICAgIE9iamVjdC5lbnRyaWVzKHNtLmxheWVycykuZm9yRWFjaCgoW2lkLCB2YWx1ZV0pID0+IHtcbiAgICAgIC8vIGNoZWNrIGlmIGxheWVyIGV4aXN0c1xuICAgICAgY29uc3QgcHVzaFRvID0gc3RhdGUubGF5ZXJzLmZpbmQobCA9PiBsLmlkID09PSBpZCkgPyBtZXJnZWQgOiB1bm1lcmdlZDtcblxuICAgICAgLy8gY3JlYXRlIG1hcCBwYW5lbCBpZiBjdXJyZW50IG1hcCBpcyBub3Qgc3BsaXRcbiAgICAgIHB1c2hUb1tpXSA9IHB1c2hUb1tpXSB8fCB7XG4gICAgICAgIGxheWVyczogcHVzaFRvID09PSBtZXJnZWQgPyBnZXRJbml0aWFsTWFwTGF5ZXJzRm9yU3BsaXRNYXAoc3RhdGUubGF5ZXJzKSA6IFtdXG4gICAgICB9O1xuICAgICAgcHVzaFRvW2ldLmxheWVycyA9IHtcbiAgICAgICAgLi4ucHVzaFRvW2ldLmxheWVycyxcbiAgICAgICAgW2lkXTogdmFsdWVcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgc3BsaXRNYXBzOiBtZXJnZWQsXG4gICAgc3BsaXRNYXBzVG9CZU1lcmdlZDogWy4uLnN0YXRlLnNwbGl0TWFwc1RvQmVNZXJnZWQsIC4uLnVubWVyZ2VkXVxuICB9O1xufVxuXG4vKipcbiAqIE1lcmdlIGludGVyYWN0aW9uQ29uZmlnLnRvb2x0aXAgd2l0aCBzYXZlZCBjb25maWcsXG4gKiB2YWxpZGF0ZSBmaWVsZHNUb1Nob3dcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc3RhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b29sdGlwQ29uZmlnXG4gKiBAcmV0dXJuIHtvYmplY3R9IC0ge21lcmdlZFRvb2x0aXA6IHt9LCB1bm1lcmdlZFRvb2x0aXA6IHt9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VJbnRlcmFjdGlvblRvb2x0aXBDb25maWcoc3RhdGUsIHRvb2x0aXBDb25maWcgPSB7fSkge1xuICBjb25zdCB1bm1lcmdlZFRvb2x0aXAgPSB7fTtcbiAgY29uc3QgbWVyZ2VkVG9vbHRpcCA9IHt9O1xuXG4gIGlmICghdG9vbHRpcENvbmZpZy5maWVsZHNUb1Nob3cgfHwgIU9iamVjdC5rZXlzKHRvb2x0aXBDb25maWcuZmllbGRzVG9TaG93KS5sZW5ndGgpIHtcbiAgICByZXR1cm4ge21lcmdlZFRvb2x0aXAsIHVubWVyZ2VkVG9vbHRpcH07XG4gIH1cblxuICBmb3IgKGNvbnN0IGRhdGFJZCBpbiB0b29sdGlwQ29uZmlnLmZpZWxkc1RvU2hvdykge1xuICAgIGlmICghc3RhdGUuZGF0YXNldHNbZGF0YUlkXSkge1xuICAgICAgLy8gaXMgbm90IHlldCBsb2FkZWRcbiAgICAgIHVubWVyZ2VkVG9vbHRpcFtkYXRhSWRdID0gdG9vbHRpcENvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaWYgZGF0YXNldCBpcyBsb2FkZWRcbiAgICAgIGNvbnN0IGFsbEZpZWxkcyA9IHN0YXRlLmRhdGFzZXRzW2RhdGFJZF0uZmllbGRzLm1hcChkID0+IGQubmFtZSk7XG4gICAgICBjb25zdCBmb3VuZEZpZWxkc1RvU2hvdyA9IHRvb2x0aXBDb25maWcuZmllbGRzVG9TaG93W2RhdGFJZF0uZmlsdGVyKGZpZWxkID0+XG4gICAgICAgIGFsbEZpZWxkcy5pbmNsdWRlcyhmaWVsZC5uYW1lKVxuICAgICAgKTtcblxuICAgICAgbWVyZ2VkVG9vbHRpcFtkYXRhSWRdID0gZm91bmRGaWVsZHNUb1Nob3c7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHttZXJnZWRUb29sdGlwLCB1bm1lcmdlZFRvb2x0aXB9O1xufVxuLyoqXG4gKiBNZXJnZSBsYXllckJsZW5kaW5nIHdpdGggc2F2ZWRcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtbWVyZ2VyJykubWVyZ2VMYXllckJsZW5kaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VMYXllckJsZW5kaW5nKHN0YXRlLCBsYXllckJsZW5kaW5nKSB7XG4gIGlmIChsYXllckJsZW5kaW5nICYmIExBWUVSX0JMRU5ESU5HU1tsYXllckJsZW5kaW5nXSkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIGxheWVyQmxlbmRpbmdcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG4vKipcbiAqIE1lcmdlIGFuaW1hdGlvbiBjb25maWdcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1tZXJnZXInKS5tZXJnZUFuaW1hdGlvbkNvbmZpZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQW5pbWF0aW9uQ29uZmlnKHN0YXRlLCBhbmltYXRpb24pIHtcbiAgaWYgKGFuaW1hdGlvbiAmJiBhbmltYXRpb24uY3VycmVudFRpbWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBhbmltYXRpb25Db25maWc6IHtcbiAgICAgICAgLi4uc3RhdGUuYW5pbWF0aW9uQ29uZmlnLFxuICAgICAgICAuLi5hbmltYXRpb24sXG4gICAgICAgIGRvbWFpbjogbnVsbFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgc2F2ZWQgbGF5ZXIgY29sdW1ucyB3aXRoIG5ldyBkYXRhLFxuICogdXBkYXRlIGZpZWxkSWR4IGJhc2VkIG9uIG5ldyBmaWVsZHNcbiAqXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGZpZWxkc1xuICogQHBhcmFtIHtPYmplY3R9IHNhdmVkQ29sc1xuICogQHBhcmFtIHtPYmplY3R9IGVtcHR5Q29sc1xuICogQHJldHVybiB7bnVsbCB8IE9iamVjdH0gLSB2YWxpZGF0ZWQgY29sdW1ucyBvciBudWxsXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2F2ZWRMYXllckNvbHVtbnMoZmllbGRzLCBzYXZlZENvbHMsIGVtcHR5Q29scykge1xuICBjb25zdCBjb2xGb3VuZCA9IHt9O1xuICAvLyBmaW5kIGFjdHVhbCBjb2x1bW4gZmllbGRJZHgsIGluIGNhc2UgaXQgaGFzIGNoYW5nZWRcbiAgY29uc3QgYWxsQ29sRm91bmQgPSBPYmplY3Qua2V5cyhlbXB0eUNvbHMpLmV2ZXJ5KGtleSA9PiB7XG4gICAgY29uc3Qgc2F2ZWQgPSBzYXZlZENvbHNba2V5XTtcbiAgICBjb2xGb3VuZFtrZXldID0gey4uLmVtcHR5Q29sc1trZXldfTtcblxuICAgIC8vIFRPRE86IHJlcGxhY2Ugd2l0aCBuZXcgYXBwcm9hY2hcbiAgICBjb25zdCBmaWVsZElkeCA9IGZpZWxkcy5maW5kSW5kZXgoKHtuYW1lfSkgPT4gbmFtZSA9PT0gc2F2ZWQpO1xuXG4gICAgaWYgKGZpZWxkSWR4ID4gLTEpIHtcbiAgICAgIC8vIHVwZGF0ZSBmb3VuZCBjb2x1bW5zXG4gICAgICBjb2xGb3VuZFtrZXldLmZpZWxkSWR4ID0gZmllbGRJZHg7XG4gICAgICBjb2xGb3VuZFtrZXldLnZhbHVlID0gc2F2ZWQ7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpZiBjb2wgaXMgb3B0aW9uYWwsIGFsbG93IG51bGwgdmFsdWVcbiAgICByZXR1cm4gZW1wdHlDb2xzW2tleV0ub3B0aW9uYWwgfHwgZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiBhbGxDb2xGb3VuZCAmJiBjb2xGb3VuZDtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBzYXZlZCB0ZXh0IGxhYmVsIGNvbmZpZyB3aXRoIG5ldyBkYXRhXG4gKiByZWZlciB0byB2aXMtc3RhdGUtc2NoZW1hLmpzIFRleHRMYWJlbFNjaGVtYVYxXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBmaWVsZHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzYXZlZFRleHRMYWJlbFxuICogQHJldHVybiB7T2JqZWN0fSAtIHZhbGlkYXRlZCB0ZXh0bGFiZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2F2ZWRUZXh0TGFiZWwoZmllbGRzLCBbbGF5ZXJUZXh0TGFiZWxdLCBzYXZlZFRleHRMYWJlbCkge1xuICBjb25zdCBzYXZlZFRleHRMYWJlbHMgPSBBcnJheS5pc0FycmF5KHNhdmVkVGV4dExhYmVsKSA/IHNhdmVkVGV4dExhYmVsIDogW3NhdmVkVGV4dExhYmVsXTtcblxuICAvLyB2YWxpZGF0ZSBmaWVsZFxuICByZXR1cm4gc2F2ZWRUZXh0TGFiZWxzLm1hcCh0ZXh0TGFiZWwgPT4ge1xuICAgIGNvbnN0IGZpZWxkID0gdGV4dExhYmVsLmZpZWxkXG4gICAgICA/IGZpZWxkcy5maW5kKGZkID0+XG4gICAgICAgICAgT2JqZWN0LmtleXModGV4dExhYmVsLmZpZWxkKS5ldmVyeShrZXkgPT4gdGV4dExhYmVsLmZpZWxkW2tleV0gPT09IGZkW2tleV0pXG4gICAgICAgIClcbiAgICAgIDogbnVsbDtcblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhsYXllclRleHRMYWJlbCkucmVkdWNlKFxuICAgICAgKGFjY3UsIGtleSkgPT4gKHtcbiAgICAgICAgLi4uYWNjdSxcbiAgICAgICAgW2tleV06IGtleSA9PT0gJ2ZpZWxkJyA/IGZpZWxkIDogdGV4dExhYmVsW2tleV0gfHwgbGF5ZXJUZXh0TGFiZWxba2V5XVxuICAgICAgfSksXG4gICAgICB7fVxuICAgICk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIHNhdmVkIHZpc3VhbCBjaGFubmVscyBjb25maWcgd2l0aCBuZXcgZGF0YSxcbiAqIHJlZmVyIHRvIHZpcy1zdGF0ZS1zY2hlbWEuanMgVmlzdWFsQ2hhbm5lbFNjaGVtYVYxXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBmaWVsZHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBuZXdMYXllclxuICogQHBhcmFtIHtPYmplY3R9IHNhdmVkTGF5ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gLSBuZXdMYXllclxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTYXZlZFZpc3VhbENoYW5uZWxzKGZpZWxkcywgbmV3TGF5ZXIsIHNhdmVkTGF5ZXIpIHtcbiAgT2JqZWN0LnZhbHVlcyhuZXdMYXllci52aXN1YWxDaGFubmVscykuZm9yRWFjaCgoe2ZpZWxkLCBzY2FsZSwga2V5fSkgPT4ge1xuICAgIGxldCBmb3VuZEZpZWxkO1xuICAgIGlmIChzYXZlZExheWVyLmNvbmZpZ1tmaWVsZF0pIHtcbiAgICAgIGZvdW5kRmllbGQgPSBmaWVsZHMuZmluZChmZCA9PlxuICAgICAgICBPYmplY3Qua2V5cyhzYXZlZExheWVyLmNvbmZpZ1tmaWVsZF0pLmV2ZXJ5KFxuICAgICAgICAgIHByb3AgPT4gc2F2ZWRMYXllci5jb25maWdbZmllbGRdW3Byb3BdID09PSBmZFtwcm9wXVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kQ2hhbm5lbCA9IHtcbiAgICAgIC4uLihmb3VuZEZpZWxkID8ge1tmaWVsZF06IGZvdW5kRmllbGR9IDoge30pLFxuICAgICAgLi4uKHNhdmVkTGF5ZXIuY29uZmlnW3NjYWxlXSA/IHtbc2NhbGVdOiBzYXZlZExheWVyLmNvbmZpZ1tzY2FsZV19IDoge30pXG4gICAgfTtcbiAgICBpZiAoT2JqZWN0LmtleXMoZm91bmRDaGFubmVsKS5sZW5ndGgpIHtcbiAgICAgIG5ld0xheWVyLnVwZGF0ZUxheWVyQ29uZmlnKGZvdW5kQ2hhbm5lbCk7XG4gICAgICBuZXdMYXllci52YWxpZGF0ZVZpc3VhbENoYW5uZWwoa2V5KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbmV3TGF5ZXI7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgc2F2ZWQgbGF5ZXIgY29uZmlnIHdpdGggbmV3IGRhdGEsXG4gKiB1cGRhdGUgZmllbGRJZHggYmFzZWQgb24gbmV3IGZpZWxkc1xuICogQHBhcmFtIHtvYmplY3R9IGRhdGFzZXRcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gZGF0YXNldC5maWVsZHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhc2V0LmlkXG4gKiBAcGFyYW0ge09iamVjdH0gc2F2ZWRMYXllclxuICogQHBhcmFtIHtPYmplY3R9IGxheWVyQ2xhc3Nlc1xuICogQHJldHVybiB7bnVsbCB8IE9iamVjdH0gLSB2YWxpZGF0ZWQgbGF5ZXIgb3IgbnVsbFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMYXllcldpdGhEYXRhKHtmaWVsZHMsIGlkOiBkYXRhSWR9LCBzYXZlZExheWVyLCBsYXllckNsYXNzZXMpIHtcbiAgY29uc3Qge3R5cGV9ID0gc2F2ZWRMYXllcjtcbiAgLy8gbGF5ZXIgZG9lc250IGhhdmUgYSB2YWxpZCB0eXBlXG4gIGlmICghbGF5ZXJDbGFzc2VzLmhhc093blByb3BlcnR5KHR5cGUpIHx8ICFzYXZlZExheWVyLmNvbmZpZyB8fCAhc2F2ZWRMYXllci5jb25maWcuY29sdW1ucykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IG5ld0xheWVyID0gbmV3IGxheWVyQ2xhc3Nlc1t0eXBlXSh7XG4gICAgaWQ6IHNhdmVkTGF5ZXIuaWQsXG4gICAgZGF0YUlkLFxuICAgIGxhYmVsOiBzYXZlZExheWVyLmNvbmZpZy5sYWJlbCxcbiAgICBjb2xvcjogc2F2ZWRMYXllci5jb25maWcuY29sb3IsXG4gICAgaXNWaXNpYmxlOiBzYXZlZExheWVyLmNvbmZpZy5pc1Zpc2libGUsXG4gICAgaGlkZGVuOiBzYXZlZExheWVyLmNvbmZpZy5oaWRkZW5cbiAgfSk7XG5cbiAgLy8gZmluZCBjb2x1bW4gZmllbGRJZHhcbiAgY29uc3QgY29sdW1ucyA9IHZhbGlkYXRlU2F2ZWRMYXllckNvbHVtbnMoXG4gICAgZmllbGRzLFxuICAgIHNhdmVkTGF5ZXIuY29uZmlnLmNvbHVtbnMsXG4gICAgbmV3TGF5ZXIuZ2V0TGF5ZXJDb2x1bW5zKClcbiAgKTtcblxuICBpZiAoIWNvbHVtbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHZpc3VhbCBjaGFubmVsIGZpZWxkIGlzIHNhdmVkIHRvIGJlIHtuYW1lLCB0eXBlfVxuICAvLyBmaW5kIHZpc3VhbCBjaGFubmVsIGZpZWxkIGJ5IG1hdGNoaW5nIGJvdGggbmFtZSBhbmQgdHlwZVxuICAvLyByZWZlciB0byB2aXMtc3RhdGUtc2NoZW1hLmpzIFZpc3VhbENoYW5uZWxTY2hlbWFWMVxuICBuZXdMYXllciA9IHZhbGlkYXRlU2F2ZWRWaXN1YWxDaGFubmVscyhmaWVsZHMsIG5ld0xheWVyLCBzYXZlZExheWVyKTtcblxuICBjb25zdCB0ZXh0TGFiZWwgPVxuICAgIHNhdmVkTGF5ZXIuY29uZmlnLnRleHRMYWJlbCAmJiBuZXdMYXllci5jb25maWcudGV4dExhYmVsXG4gICAgICA/IHZhbGlkYXRlU2F2ZWRUZXh0TGFiZWwoZmllbGRzLCBuZXdMYXllci5jb25maWcudGV4dExhYmVsLCBzYXZlZExheWVyLmNvbmZpZy50ZXh0TGFiZWwpXG4gICAgICA6IG5ld0xheWVyLmNvbmZpZy50ZXh0TGFiZWw7XG5cbiAgLy8gY29weSB2aXNDb25maWcgb3ZlciB0byBlbXB0eUxheWVyIHRvIG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBwcm9wc1xuICBjb25zdCB2aXNDb25maWcgPSBuZXdMYXllci5jb3B5TGF5ZXJDb25maWcoXG4gICAgbmV3TGF5ZXIuY29uZmlnLnZpc0NvbmZpZyxcbiAgICBzYXZlZExheWVyLmNvbmZpZy52aXNDb25maWcgfHwge30sXG4gICAge3NoYWxsb3dDb3B5OiBbJ2NvbG9yUmFuZ2UnLCAnc3Ryb2tlQ29sb3JSYW5nZSddfVxuICApO1xuXG4gIG5ld0xheWVyLnVwZGF0ZUxheWVyQ29uZmlnKHtcbiAgICBjb2x1bW5zLFxuICAgIHZpc0NvbmZpZyxcbiAgICB0ZXh0TGFiZWxcbiAgfSk7XG5cbiAgcmV0dXJuIG5ld0xheWVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZE1lcmdlcihtZXJnZXIpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KG1lcmdlcikgJiYgdHlwZW9mIG1lcmdlci5tZXJnZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbWVyZ2VyLnByb3AgPT09ICdzdHJpbmcnO1xufVxuXG5leHBvcnQgY29uc3QgVklTX1NUQVRFX01FUkdFUlMgPSBbXG4gIHttZXJnZTogbWVyZ2VMYXllcnMsIHByb3A6ICdsYXllcnMnLCB0b01lcmdlUHJvcDogJ2xheWVyVG9CZU1lcmdlZCd9LFxuICB7bWVyZ2U6IG1lcmdlRmlsdGVycywgcHJvcDogJ2ZpbHRlcnMnLCB0b01lcmdlUHJvcDogJ2ZpbHRlclRvQmVNZXJnZWQnfSxcbiAge21lcmdlOiBtZXJnZUludGVyYWN0aW9ucywgcHJvcDogJ2ludGVyYWN0aW9uQ29uZmlnJywgdG9NZXJnZVByb3A6ICdpbnRlcmFjdGlvblRvQmVNZXJnZWQnfSxcbiAge21lcmdlOiBtZXJnZUxheWVyQmxlbmRpbmcsIHByb3A6ICdsYXllckJsZW5kaW5nJ30sXG4gIHttZXJnZTogbWVyZ2VTcGxpdE1hcHMsIHByb3A6ICdzcGxpdE1hcHMnLCB0b01lcmdlUHJvcDogJ3NwbGl0TWFwc1RvQmVNZXJnZWQnfSxcbiAge21lcmdlOiBtZXJnZUFuaW1hdGlvbkNvbmZpZywgcHJvcDogJ2FuaW1hdGlvbkNvbmZpZyd9XG5dO1xuIl19