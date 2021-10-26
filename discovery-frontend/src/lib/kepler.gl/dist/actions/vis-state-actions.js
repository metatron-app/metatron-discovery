"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.layerConfigChange = layerConfigChange;
exports.layerTextLabelChange = layerTextLabelChange;
exports.layerTypeChange = layerTypeChange;
exports.layerVisualChannelConfigChange = layerVisualChannelConfigChange;
exports.layerVisConfigChange = layerVisConfigChange;
exports.layerColorUIChange = layerColorUIChange;
exports.updateLayerBlending = updateLayerBlending;
exports.interactionConfigChange = interactionConfigChange;
exports.setFilter = setFilter;
exports.addFilter = addFilter;
exports.addLayer = addLayer;
exports.reorderLayer = reorderLayer;
exports.removeFilter = removeFilter;
exports.removeLayer = removeLayer;
exports.removeDataset = removeDataset;
exports.showDatasetTable = showDatasetTable;
exports.sortTableColumn = sortTableColumn;
exports.pinTableColumn = pinTableColumn;
exports.copyTableColumn = copyTableColumn;
exports.updateVisData = updateVisData;
exports.toggleFilterAnimation = toggleFilterAnimation;
exports.updateFilterAnimationSpeed = updateFilterAnimationSpeed;
exports.updateAnimationTime = updateAnimationTime;
exports.updateLayerAnimationSpeed = updateLayerAnimationSpeed;
exports.enlargeFilter = enlargeFilter;
exports.toggleFilterFeature = toggleFilterFeature;
exports.onLayerHover = onLayerHover;
exports.onLayerClick = onLayerClick;
exports.onMapClick = onMapClick;
exports.onMouseMove = onMouseMove;
exports.toggleLayerForMap = toggleLayerForMap;
exports.setFilterPlot = setFilterPlot;
exports.setMapInfo = setMapInfo;
exports.loadFiles = loadFiles;
exports.loadNextFile = loadNextFile;
exports.loadFilesSuccess = loadFilesSuccess;
exports.loadFileStepSuccess = loadFileStepSuccess;
exports.loadFilesErr = loadFilesErr;
exports.setFeatures = setFeatures;
exports.setPolygonFilterLayer = setPolygonFilterLayer;
exports.setSelectedFeature = setSelectedFeature;
exports.deleteFeature = deleteFeature;
exports.setEditorMode = setEditorMode;
exports.applyCPUFilter = applyCPUFilter;
exports.toggleEditorVisibility = toggleEditorVisibility;
exports.nextFileBatch = nextFileBatch;
exports.processFileContent = processFileContent;

var _actionTypes = _interopRequireDefault(require("../constants/action-types"));

// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// vis-state-reducer

/**
 * Update layer base config: dataId, label, column, isVisible
 * @param oldLayer - layer to be updated
 * @param newConfig - new config to be merged with old config
 * @returns action
 * @type {typeof import('./vis-state-actions').layerConfigChange}
 * @public
 */
function layerConfigChange(oldLayer, newConfig) {
  return {
    type: _actionTypes["default"].LAYER_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig
  };
}
/**
 * Update layer text label
 * @param oldLayer - layer to be updated
 * @param idx -`idx` of text label to be updated
 * @param prop - `prop` of text label, e,g, `anchor`, `alignment`, `color`, `size`, `field`
 * @param value - new value
 * @returns action
 * @type {typeof import('./vis-state-actions').layerTextLabelChange}
 * @public
 */


function layerTextLabelChange(oldLayer, idx, prop, value) {
  return {
    type: _actionTypes["default"].LAYER_TEXT_LABEL_CHANGE,
    oldLayer: oldLayer,
    idx: idx,
    prop: prop,
    value: value
  };
}
/**
 * Update layer type. Previews layer config will be copied if applicable.
 * @param oldLayer - layer to be updated
 * @param newType - new type
 * @returns action
 * @type {typeof import('./vis-state-actions').layerTypeChange}
 * @public
 */


function layerTypeChange(oldLayer, newType) {
  return {
    type: _actionTypes["default"].LAYER_TYPE_CHANGE,
    oldLayer: oldLayer,
    newType: newType
  };
}
/**
 * Update layer visual channel
 * @memberof visStateActions
 * @param oldLayer - layer to be updated
 * @param newConfig - new visual channel config
 * @param channel - channel to be updated
 * @returns action
 * @type {typeof import('./vis-state-actions').layerVisualChannelConfigChange}
 * @public
 */


function layerVisualChannelConfigChange(oldLayer, newConfig, channel) {
  return {
    type: _actionTypes["default"].LAYER_VISUAL_CHANNEL_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig,
    channel: channel
  };
}
/**
 * Update layer `visConfig`
 * @memberof visStateActions
 * @param oldLayer - layer to be updated
 * @param newVisConfig - new visConfig as a key value map: e.g. `{opacity: 0.8}`
 * @returns action
 * @type {typeof import('./vis-state-actions').layerVisConfigChange}
 * @public
 */


function layerVisConfigChange(oldLayer, newVisConfig) {
  return {
    type: _actionTypes["default"].LAYER_VIS_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newVisConfig: newVisConfig
  };
}
/**
 * Set the color palette ui for layer color
 * @memberOf visStateActions
 * @param oldLayer - layer to be updated
 * @param prop - which color prop
 * @param newConfig - to be merged
 * @returns action
 * @type {typeof import('./vis-state-actions').layerColorUIChange}
 * @public
 */


function layerColorUIChange(oldLayer, prop, newConfig) {
  return {
    type: _actionTypes["default"].LAYER_COLOR_UI_CHANGE,
    oldLayer: oldLayer,
    prop: prop,
    newConfig: newConfig
  };
}
/**
 * Update layer blending mode
 * @memberof visStateActions
 * @param mode one of `additive`, `normal` and `subtractive`
 * @returns action
 * @type {typeof import('./vis-state-actions').updateLayerBlending}
 * @public
 */


function updateLayerBlending(mode) {
  return {
    type: _actionTypes["default"].UPDATE_LAYER_BLENDING,
    mode: mode
  };
}
/**
 * Update `interactionConfig`
 * @memberof visStateActions
 * @param config - new config as key value map: `{tooltip: {enabled: true}}`
 * @returns action
 * @type {typeof import('./vis-state-actions').interactionConfigChange}
 * @public
 */


function interactionConfigChange(config) {
  return {
    type: _actionTypes["default"].INTERACTION_CONFIG_CHANGE,
    config: config
  };
}
/**
 * Update filter property
 * @memberof visStateActions
 * @param idx -`idx` of filter to be updated
 * @param prop - `prop` of filter, e,g, `dataId`, `name`, `value`
 * @param value - new value
 * @param valueIndex - dataId index
 * @returns action
 * @type {typeof import('./vis-state-actions').setFilter}
 * @public
 */


function setFilter(idx, prop, value, valueIndex) {
  return {
    type: _actionTypes["default"].SET_FILTER,
    idx: idx,
    prop: prop,
    value: value,
    valueIndex: valueIndex
  };
}
/**
 * Add a new filter
 * @memberof visStateActions
 * @param dataId - dataset `id` this new filter is associated with
 * @returns action
 * @type {typeof import('./vis-state-actions').addFilter}
 * @public
 */


function addFilter(dataId) {
  return {
    type: _actionTypes["default"].ADD_FILTER,
    dataId: dataId
  };
}
/**
 * Add a new layer
 * @memberof visStateActions
 * @param props - new layer props
 * @returns action
 * @type {typeof import('./vis-state-actions').addLayer}
 * @public
 */


function addLayer(props) {
  return {
    type: _actionTypes["default"].ADD_LAYER,
    props: props
  };
}
/**
 * Reorder layer, order is an array of layer indexes, index 0 will be the one at the bottom
 * @memberof visStateActions
 * @param order an array of layer indexes
 * @returns action
 * @type {typeof import('./vis-state-actions').reorderLayer}
 * @public
 * @example
 *
 * // bring `layers[1]` below `layers[0]`, the sequence layers will be rendered is `1`, `0`, `2`, `3`.
 * // `1` will be at the bottom, `3` will be at the top.
 * this.props.dispatch(reorderLayer([1, 0, 2, 3]));
 */


function reorderLayer(order) {
  return {
    type: _actionTypes["default"].REORDER_LAYER,
    order: order
  };
}
/**
 * Remove a filter from `visState.filters`, once a filter is removed, data will be re-filtered and layer will be updated
 * @memberof visStateActions
 * @param idx idx of filter to be removed
 * @returns action
 * @type {typeof import('./vis-state-actions').removeFilter}
 * @public
 */


function removeFilter(idx) {
  return {
    type: _actionTypes["default"].REMOVE_FILTER,
    idx: idx
  };
}
/**
 * Remove a layer
 * @memberof visStateActions
 * @param idx idx of layer to be removed
 * @returns action
 * @type {typeof import('./vis-state-actions').removeLayer}
 * @public
 */


function removeLayer(idx) {
  return {
    type: _actionTypes["default"].REMOVE_LAYER,
    idx: idx
  };
}
/**
 * Remove a dataset and all layers, filters, tooltip configs that based on it
 * @memberof visStateActions
 * @param dataId dataset id
 * @returns action
 * @type {typeof import('./vis-state-actions').removeDataset}
 * @public
 */


function removeDataset(dataId) {
  return {
    type: _actionTypes["default"].REMOVE_DATASET,
    dataId: dataId
  };
}
/**
 * Display dataset table in a modal
 * @memberof visStateActions
 * @param dataId dataset id to show in table
 * @returns action
 * @type {typeof import('./vis-state-actions').showDatasetTable}
 * @public
 */


function showDatasetTable(dataId) {
  return {
    type: _actionTypes["default"].SHOW_DATASET_TABLE,
    dataId: dataId
  };
}
/**
 * Sort dataset column, for table display
 * @memberof visStateActions
 * @param dataId
 * @param column
 * @param mode
 * @returns action
 * @type {typeof import('./vis-state-actions').sortTableColumn}
 * @public
 */


function sortTableColumn(dataId, column, mode) {
  return {
    type: _actionTypes["default"].SORT_TABLE_COLUMN,
    dataId: dataId,
    column: column,
    mode: mode
  };
}
/**
 * Pin dataset column, for table display
 * @param dataId
 * @param column
 * @returns action
 * @type {typeof import('./vis-state-actions').pinTableColumn}
 * @public
 */


function pinTableColumn(dataId, column) {
  return {
    type: _actionTypes["default"].PIN_TABLE_COLUMN,
    dataId: dataId,
    column: column
  };
}
/**
 * Copy column, for table display
 * @param dataId
 * @param column
 * @returns action
 * @type {typeof import('./vis-state-actions').copyTableColumn}
 * @public
 */


function copyTableColumn(dataId, column) {
  return {
    type: _actionTypes["default"].COPY_TABLE_COLUMN,
    dataId: dataId,
    column: column
  };
} // * @param dataset.info -info of a dataset
// * @param dataset.info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
// * @param dataset.info.label - A display name of this dataset
// * @param dataset.data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
// * @param dataset.data.fields - ***required** Array of fields,
// * @param dataset.data.fields.name - ***required** Name of the field,
// * @param dataset.data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`

/**
 * Add new dataset to `visState`, with option to load a map config along with the datasets
 * @memberof visStateActions
 * @param datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param {object} options
 * @param options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries
 * @param options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param config this object will contain the full kepler.gl instance configuration {mapState, mapStyle, visState}
 * @returns action
 * @type {typeof import('./vis-state-actions').updateVisData}
 * @public
 */


function updateVisData(datasets, options, config) {
  return {
    type: _actionTypes["default"].UPDATE_VIS_DATA,
    datasets: datasets,
    options: options,
    config: config
  };
}
/**
 * Start and end filter animation
 * @memberof visStateActions
 * @param {Number} idx of filter
 * @type {typeof import('./vis-state-actions').toggleFilterAnimation}
 * @returns action
 * @public
 */


function toggleFilterAnimation(idx) {
  return {
    type: _actionTypes["default"].TOGGLE_FILTER_ANIMATION,
    idx: idx
  };
}
/**
 * Change filter animation speed
 * @memberof visStateActions
 * @param idx -  `idx` of filter
 * @param speed - `speed` to change it to. `speed` is a multiplier
 * @type {typeof import('./vis-state-actions').updateFilterAnimationSpeed}
 * @returns action
 * @public
 */


function updateFilterAnimationSpeed(idx, speed) {
  return {
    type: _actionTypes["default"].UPDATE_FILTER_ANIMATION_SPEED,
    idx: idx,
    speed: speed
  };
}
/**
 * Reset animation
 * @memberof visStateActions
 * @param value -  Current value of the slider
 * @type {typeof import('./vis-state-actions').updateAnimationTime}
 * @returns action
 * @public
 */


function updateAnimationTime(value) {
  return {
    type: _actionTypes["default"].UPDATE_ANIMATION_TIME,
    value: value
  };
}
/**
 * update trip layer animation speed
 * @memberof visStateActions
 * @param speed - `speed` to change it to. `speed` is a multiplier
 * @type {typeof import('./vis-state-actions').updateLayerAnimationSpeed}
 * @returns action
 * @public
 */


function updateLayerAnimationSpeed(speed) {
  return {
    type: _actionTypes["default"].UPDATE_LAYER_ANIMATION_SPEED,
    speed: speed
  };
}
/**
 * Show larger time filter at bottom for time playback (apply to time filter only)
 * @memberof visStateActions
 * @param idx - index of filter to enlarge
 * @type {typeof import('./vis-state-actions').enlargeFilter}
 * @returns action
 * @public
 */


function enlargeFilter(idx) {
  return {
    type: _actionTypes["default"].ENLARGE_FILTER,
    idx: idx
  };
}
/**
 * Show/hide filter feature on map
 * @memberof visStateActions
 * @param idx - index of filter feature to show/hide
 * @type {typeof import('./vis-state-actions').toggleFilterFeature}
 * @return action
 */


function toggleFilterFeature(idx) {
  return {
    type: _actionTypes["default"].TOGGLE_FILTER_FEATURE,
    idx: idx
  };
}
/**
 * Trigger layer hover event with hovered object
 * @memberof visStateActions
 * @param info - Object hovered, returned by deck.gl
 * @type {typeof import('./vis-state-actions').onLayerHover}
 * @returns action
 * @public
 */


function onLayerHover(info) {
  return {
    type: _actionTypes["default"].LAYER_HOVER,
    info: info
  };
}
/**
 * Trigger layer click event with clicked object
 * @memberof visStateActions
 * @param info - Object clicked, returned by deck.gl
 * @type {typeof import('./vis-state-actions').onLayerClick}
 * @returns action
 * @public
 */


function onLayerClick(info) {
  return {
    type: _actionTypes["default"].LAYER_CLICK,
    info: info
  };
}
/**
 * Trigger map click event, unselect clicked object
 * @memberof visStateActions
 * @type {typeof import('./vis-state-actions').onMapClick}
 * @returns action
 * @public
 */


function onMapClick() {
  return {
    type: _actionTypes["default"].MAP_CLICK
  };
}
/**
 * Trigger map mouse moveevent, payload would be
 * React-map-gl PointerEvent
 * https://uber.github.io/react-map-gl/#/documentation/api-reference/pointer-event
 *
 * @memberof visStateActions
 * @param evt - PointerEvent
 * @type {typeof import('./vis-state-actions').onMouseMove}
 * @returns action
 * @public
 */


function onMouseMove(evt) {
  return {
    type: _actionTypes["default"].MOUSE_MOVE,
    evt: evt
  };
}
/**
 * Toggle visibility of a layer in a split map
 * @memberof visStateActions
 * @param mapIndex - index of the split map
 * @param layerId - id of the layer
 * @type {typeof import('./vis-state-actions').toggleLayerForMap}
 * @returns action
 * @public
 */


function toggleLayerForMap(mapIndex, layerId) {
  return {
    type: _actionTypes["default"].TOGGLE_LAYER_FOR_MAP,
    mapIndex: mapIndex,
    layerId: layerId
  };
}
/**
 * Set the property of a filter plot
 * @memberof visStateActions
 * @param idx
 * @param newProp key value mapping of new prop `{yAxis: 'histogram'}`
 * @param valueIndex dataId index
 * @type {typeof import('./vis-state-actions').setFilterPlot}
 * @returns action
 * @public
 */


function setFilterPlot(idx, newProp, valueIndex) {
  return {
    type: _actionTypes["default"].SET_FILTER_PLOT,
    idx: idx,
    newProp: newProp,
    valueIndex: valueIndex
  };
}
/**
 * Set the property of a filter plot
 * @memberof visStateActions
 * @param info
 * @type {typeof import('./vis-state-actions').setMapInfo}
 * @returns action
 * @public
 */


function setMapInfo(info) {
  return {
    type: _actionTypes["default"].SET_MAP_INFO,
    info: info
  };
}
/**
 * Trigger file loading dispatch `addDataToMap` if succeed, or `loadFilesErr` if failed
 * @memberof visStateActions
 * @param files array of fileblob
 * @type {typeof import('./vis-state-actions').loadFiles}
 * @returns action
 * @public
 */


function loadFiles(files, onFinish) {
  return {
    type: _actionTypes["default"].LOAD_FILES,
    files: files,
    onFinish: onFinish
  };
}
/**
 * Called with next file to load
 * @memberof visStateActions
 * @type {typeof import('./vis-state-actions').loadNextFile}
 * @returns action
 * @public
 */


function loadNextFile() {
  return {
    type: _actionTypes["default"].LOAD_NEXT_FILE
  };
}
/**
 * called when all files are processed and loaded
 * @memberof visStateActions
 * @param result
 * @type {typeof import('./vis-state-actions').loadFilesSuccess}
 * @returns action
 */


function loadFilesSuccess(result) {
  return {
    type: _actionTypes["default"].LOAD_FILES_SUCCESS,
    result: result
  };
}
/**
 * called when successfully loaded one file, ready to move on to the next one
 * @memberof visStateActions
 * @param result
 * @type {typeof import('./vis-state-actions').loadFileStepSuccess}
 * @returns action
 */


function loadFileStepSuccess(_ref) {
  var fileName = _ref.fileName,
      fileCache = _ref.fileCache;
  return {
    type: _actionTypes["default"].LOAD_FILE_STEP_SUCCESS,
    fileName: fileName,
    fileCache: fileCache
  };
}
/**
 * Trigger loading file error
 * @memberof visStateActions
 * @param  error
 * @type {typeof import('./vis-state-actions').loadFilesErr}
 * @returns action
 * @public
 */


function loadFilesErr(fileName, error) {
  return {
    type: _actionTypes["default"].LOAD_FILES_ERR,
    fileName: fileName,
    error: error
  };
}
/**
 * Store features to state
 * @memberof visStateActions
 * @param features
 * @type {typeof import('./vis-state-actions').setFeatures}
 * @returns action
 */


function setFeatures(features) {
  return {
    type: _actionTypes["default"].SET_FEATURES,
    features: features
  };
}
/**
 * It will apply the provide feature as filter to the given layer.
 * If the given feature is already applied as filter to the layer, it will remove the layer from the filter
 * @memberof visStateActions
 * @param layer
 * @param feature
 * @type {typeof import('./vis-state-actions').setPolygonFilterLayer}
 * @returns action
 */


function setPolygonFilterLayer(layer, feature) {
  return {
    type: _actionTypes["default"].SET_POLYGON_FILTER_LAYER,
    layer: layer,
    feature: feature
  };
}
/**
 * Set the current feature to be edited/deleted
 * @memberof visStateActions
 * @param feature
 * @type {typeof import('./vis-state-actions').setSelectedFeature}
 * @returns action
 */


function setSelectedFeature(feature) {
  return {
    type: _actionTypes["default"].SET_SELECTED_FEATURE,
    feature: feature
  };
}
/**
 * Delete the given feature
 * @memberof visStateActions
 * @param feature
 * @type {typeof import('./vis-state-actions').deleteFeature}
 * @returns action
 */


function deleteFeature(feature) {
  return {
    type: _actionTypes["default"].DELETE_FEATURE,
    feature: feature
  };
}
/** Set the map mode
 * @memberof visStateActions
 * @param mode one of EDITOR_MODES
 * @type {typeof import('./vis-state-actions').setEditorMode}
 * @returns action
 * @public
 * @example
 * import {setMapMode} from 'kepler.gl/actions';
 * import {EDITOR_MODES} from 'kepler.gl/constants';
 *
 * this.props.dispatch(setMapMode(EDITOR_MODES.DRAW_POLYGON));
 */


function setEditorMode(mode) {
  return {
    type: _actionTypes["default"].SET_EDITOR_MODE,
    mode: mode
  };
}
/**
 * Trigger CPU filter of selected dataset
 * @memberof visStateActions
 * @param dataId - single dataId or an array of dataIds
 * @type {typeof import('./vis-state-actions').applyCPUFilter}
 * @returns action
 * @public
 */


function applyCPUFilter(dataId) {
  return {
    type: _actionTypes["default"].APPLY_CPU_FILTER,
    dataId: dataId
  };
}
/**
 * Toggle editor layer visibility
 * @memberof visStateActions
 * @type {typeof import('./vis-state-actions').toggleEditorVisibility}
 * @return action
 */


function toggleEditorVisibility() {
  return {
    type: _actionTypes["default"].TOGGLE_EDITOR_VISIBILITY
  };
}
/**
 * Process the next file batch
 * @memberof visStateActions
 * @param payload - batch payload
 * @type {typeof import('./vis-state-actions').nextFileBatch}
 * @return action
 */


function nextFileBatch(payload) {
  return {
    type: _actionTypes["default"].NEXT_FILE_BATCH,
    payload: payload
  };
}
/**
 * Process the file content
 * @memberof visStateActions
 * @param payload - the file content
 * @type {typeof import('./vis-state-actions').processFileContent}
 * @return action
 */


function processFileContent(payload) {
  return {
    type: _actionTypes["default"].PROCESS_FILE_CONTENT,
    payload: payload
  };
}
/**
 * This declaration is needed to group actions in docs
 */

/**
 * Actions handled mostly by `visState` reducer.
 * They manage how data is processed, filtered and displayed on the map by operates on layers,
 * filters and interaction settings.
 *
 * @public
 */

/* eslint-disable no-unused-vars */
// @ts-ignore


var visStateActions = null;
/* eslint-enable no-unused-vars */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zL3Zpcy1zdGF0ZS1hY3Rpb25zLmpzIl0sIm5hbWVzIjpbImxheWVyQ29uZmlnQ2hhbmdlIiwib2xkTGF5ZXIiLCJuZXdDb25maWciLCJ0eXBlIiwiQWN0aW9uVHlwZXMiLCJMQVlFUl9DT05GSUdfQ0hBTkdFIiwibGF5ZXJUZXh0TGFiZWxDaGFuZ2UiLCJpZHgiLCJwcm9wIiwidmFsdWUiLCJMQVlFUl9URVhUX0xBQkVMX0NIQU5HRSIsImxheWVyVHlwZUNoYW5nZSIsIm5ld1R5cGUiLCJMQVlFUl9UWVBFX0NIQU5HRSIsImxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZ0NoYW5nZSIsImNoYW5uZWwiLCJMQVlFUl9WSVNVQUxfQ0hBTk5FTF9DSEFOR0UiLCJsYXllclZpc0NvbmZpZ0NoYW5nZSIsIm5ld1Zpc0NvbmZpZyIsIkxBWUVSX1ZJU19DT05GSUdfQ0hBTkdFIiwibGF5ZXJDb2xvclVJQ2hhbmdlIiwiTEFZRVJfQ09MT1JfVUlfQ0hBTkdFIiwidXBkYXRlTGF5ZXJCbGVuZGluZyIsIm1vZGUiLCJVUERBVEVfTEFZRVJfQkxFTkRJTkciLCJpbnRlcmFjdGlvbkNvbmZpZ0NoYW5nZSIsImNvbmZpZyIsIklOVEVSQUNUSU9OX0NPTkZJR19DSEFOR0UiLCJzZXRGaWx0ZXIiLCJ2YWx1ZUluZGV4IiwiU0VUX0ZJTFRFUiIsImFkZEZpbHRlciIsImRhdGFJZCIsIkFERF9GSUxURVIiLCJhZGRMYXllciIsInByb3BzIiwiQUREX0xBWUVSIiwicmVvcmRlckxheWVyIiwib3JkZXIiLCJSRU9SREVSX0xBWUVSIiwicmVtb3ZlRmlsdGVyIiwiUkVNT1ZFX0ZJTFRFUiIsInJlbW92ZUxheWVyIiwiUkVNT1ZFX0xBWUVSIiwicmVtb3ZlRGF0YXNldCIsIlJFTU9WRV9EQVRBU0VUIiwic2hvd0RhdGFzZXRUYWJsZSIsIlNIT1dfREFUQVNFVF9UQUJMRSIsInNvcnRUYWJsZUNvbHVtbiIsImNvbHVtbiIsIlNPUlRfVEFCTEVfQ09MVU1OIiwicGluVGFibGVDb2x1bW4iLCJQSU5fVEFCTEVfQ09MVU1OIiwiY29weVRhYmxlQ29sdW1uIiwiQ09QWV9UQUJMRV9DT0xVTU4iLCJ1cGRhdGVWaXNEYXRhIiwiZGF0YXNldHMiLCJvcHRpb25zIiwiVVBEQVRFX1ZJU19EQVRBIiwidG9nZ2xlRmlsdGVyQW5pbWF0aW9uIiwiVE9HR0xFX0ZJTFRFUl9BTklNQVRJT04iLCJ1cGRhdGVGaWx0ZXJBbmltYXRpb25TcGVlZCIsInNwZWVkIiwiVVBEQVRFX0ZJTFRFUl9BTklNQVRJT05fU1BFRUQiLCJ1cGRhdGVBbmltYXRpb25UaW1lIiwiVVBEQVRFX0FOSU1BVElPTl9USU1FIiwidXBkYXRlTGF5ZXJBbmltYXRpb25TcGVlZCIsIlVQREFURV9MQVlFUl9BTklNQVRJT05fU1BFRUQiLCJlbmxhcmdlRmlsdGVyIiwiRU5MQVJHRV9GSUxURVIiLCJ0b2dnbGVGaWx0ZXJGZWF0dXJlIiwiVE9HR0xFX0ZJTFRFUl9GRUFUVVJFIiwib25MYXllckhvdmVyIiwiaW5mbyIsIkxBWUVSX0hPVkVSIiwib25MYXllckNsaWNrIiwiTEFZRVJfQ0xJQ0siLCJvbk1hcENsaWNrIiwiTUFQX0NMSUNLIiwib25Nb3VzZU1vdmUiLCJldnQiLCJNT1VTRV9NT1ZFIiwidG9nZ2xlTGF5ZXJGb3JNYXAiLCJtYXBJbmRleCIsImxheWVySWQiLCJUT0dHTEVfTEFZRVJfRk9SX01BUCIsInNldEZpbHRlclBsb3QiLCJuZXdQcm9wIiwiU0VUX0ZJTFRFUl9QTE9UIiwic2V0TWFwSW5mbyIsIlNFVF9NQVBfSU5GTyIsImxvYWRGaWxlcyIsImZpbGVzIiwib25GaW5pc2giLCJMT0FEX0ZJTEVTIiwibG9hZE5leHRGaWxlIiwiTE9BRF9ORVhUX0ZJTEUiLCJsb2FkRmlsZXNTdWNjZXNzIiwicmVzdWx0IiwiTE9BRF9GSUxFU19TVUNDRVNTIiwibG9hZEZpbGVTdGVwU3VjY2VzcyIsImZpbGVOYW1lIiwiZmlsZUNhY2hlIiwiTE9BRF9GSUxFX1NURVBfU1VDQ0VTUyIsImxvYWRGaWxlc0VyciIsImVycm9yIiwiTE9BRF9GSUxFU19FUlIiLCJzZXRGZWF0dXJlcyIsImZlYXR1cmVzIiwiU0VUX0ZFQVRVUkVTIiwic2V0UG9seWdvbkZpbHRlckxheWVyIiwibGF5ZXIiLCJmZWF0dXJlIiwiU0VUX1BPTFlHT05fRklMVEVSX0xBWUVSIiwic2V0U2VsZWN0ZWRGZWF0dXJlIiwiU0VUX1NFTEVDVEVEX0ZFQVRVUkUiLCJkZWxldGVGZWF0dXJlIiwiREVMRVRFX0ZFQVRVUkUiLCJzZXRFZGl0b3JNb2RlIiwiU0VUX0VESVRPUl9NT0RFIiwiYXBwbHlDUFVGaWx0ZXIiLCJBUFBMWV9DUFVfRklMVEVSIiwidG9nZ2xlRWRpdG9yVmlzaWJpbGl0eSIsIlRPR0dMRV9FRElUT1JfVklTSUJJTElUWSIsIm5leHRGaWxlQmF0Y2giLCJwYXlsb2FkIiwiTkVYVF9GSUxFX0JBVENIIiwicHJvY2Vzc0ZpbGVDb250ZW50IiwiUFJPQ0VTU19GSUxFX0NPTlRFTlQiLCJ2aXNTdGF0ZUFjdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQkE7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7O0FBR0E7Ozs7Ozs7O0FBUU8sU0FBU0EsaUJBQVQsQ0FBMkJDLFFBQTNCLEVBQXFDQyxTQUFyQyxFQUFnRDtBQUNyRCxTQUFPO0FBQ0xDLElBQUFBLElBQUksRUFBRUMsd0JBQVlDLG1CQURiO0FBRUxKLElBQUFBLFFBQVEsRUFBUkEsUUFGSztBQUdMQyxJQUFBQSxTQUFTLEVBQVRBO0FBSEssR0FBUDtBQUtEO0FBRUQ7Ozs7Ozs7Ozs7OztBQVVPLFNBQVNJLG9CQUFULENBQThCTCxRQUE5QixFQUF3Q00sR0FBeEMsRUFBNkNDLElBQTdDLEVBQW1EQyxLQUFuRCxFQUEwRDtBQUMvRCxTQUFPO0FBQ0xOLElB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SUFBQUEsT0FBTyxFQUFQQTtBQUZLLEdBQVA7QUFJRDtBQUVEOzs7O0FBR0E7Ozs7Ozs7O0FBT0E7QUFDQTs7O0FBQ0EsSUFBTUksZUFBZSxHQUFHLElBQXhCO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyB2aXMtc3RhdGUtcmVkdWNlclxuaW1wb3J0IEFjdGlvblR5cGVzIGZyb20gJ2NvbnN0YW50cy9hY3Rpb24tdHlwZXMnO1xuXG4vKipcbiAqIFVwZGF0ZSBsYXllciBiYXNlIGNvbmZpZzogZGF0YUlkLCBsYWJlbCwgY29sdW1uLCBpc1Zpc2libGVcbiAqIEBwYXJhbSBvbGRMYXllciAtIGxheWVyIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBuZXdDb25maWcgLSBuZXcgY29uZmlnIHRvIGJlIG1lcmdlZCB3aXRoIG9sZCBjb25maWdcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sYXllckNvbmZpZ0NoYW5nZX1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyQ29uZmlnQ2hhbmdlKG9sZExheWVyLCBuZXdDb25maWcpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9DT05GSUdfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIG5ld0NvbmZpZ1xuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBsYXllciB0ZXh0IGxhYmVsXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gaWR4IC1gaWR4YCBvZiB0ZXh0IGxhYmVsIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBwcm9wIC0gYHByb3BgIG9mIHRleHQgbGFiZWwsIGUsZywgYGFuY2hvcmAsIGBhbGlnbm1lbnRgLCBgY29sb3JgLCBgc2l6ZWAsIGBmaWVsZGBcbiAqIEBwYXJhbSB2YWx1ZSAtIG5ldyB2YWx1ZVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLmxheWVyVGV4dExhYmVsQ2hhbmdlfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJUZXh0TGFiZWxDaGFuZ2Uob2xkTGF5ZXIsIGlkeCwgcHJvcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9URVhUX0xBQkVMX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBpZHgsXG4gICAgcHJvcCxcbiAgICB2YWx1ZVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBsYXllciB0eXBlLiBQcmV2aWV3cyBsYXllciBjb25maWcgd2lsbCBiZSBjb3BpZWQgaWYgYXBwbGljYWJsZS5cbiAqIEBwYXJhbSBvbGRMYXllciAtIGxheWVyIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBuZXdUeXBlIC0gbmV3IHR5cGVcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sYXllclR5cGVDaGFuZ2V9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllclR5cGVDaGFuZ2Uob2xkTGF5ZXIsIG5ld1R5cGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9UWVBFX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBuZXdUeXBlXG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIHZpc3VhbCBjaGFubmVsXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gbmV3Q29uZmlnIC0gbmV3IHZpc3VhbCBjaGFubmVsIGNvbmZpZ1xuICogQHBhcmFtIGNoYW5uZWwgLSBjaGFubmVsIHRvIGJlIHVwZGF0ZWRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2V9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2Uob2xkTGF5ZXIsIG5ld0NvbmZpZywgY2hhbm5lbCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX1ZJU1VBTF9DSEFOTkVMX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBuZXdDb25maWcsXG4gICAgY2hhbm5lbFxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBsYXllciBgdmlzQ29uZmlnYFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIG9sZExheWVyIC0gbGF5ZXIgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIG5ld1Zpc0NvbmZpZyAtIG5ldyB2aXNDb25maWcgYXMgYSBrZXkgdmFsdWUgbWFwOiBlLmcuIGB7b3BhY2l0eTogMC44fWBcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sYXllclZpc0NvbmZpZ0NoYW5nZX1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyVmlzQ29uZmlnQ2hhbmdlKG9sZExheWVyLCBuZXdWaXNDb25maWcpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9WSVNfQ09ORklHX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBuZXdWaXNDb25maWdcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbG9yIHBhbGV0dGUgdWkgZm9yIGxheWVyIGNvbG9yXG4gKiBAbWVtYmVyT2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gcHJvcCAtIHdoaWNoIGNvbG9yIHByb3BcbiAqIEBwYXJhbSBuZXdDb25maWcgLSB0byBiZSBtZXJnZWRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sYXllckNvbG9yVUlDaGFuZ2V9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllckNvbG9yVUlDaGFuZ2Uob2xkTGF5ZXIsIHByb3AsIG5ld0NvbmZpZykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX0NPTE9SX1VJX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBwcm9wLFxuICAgIG5ld0NvbmZpZ1xuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBsYXllciBibGVuZGluZyBtb2RlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbW9kZSBvbmUgb2YgYGFkZGl0aXZlYCwgYG5vcm1hbGAgYW5kIGBzdWJ0cmFjdGl2ZWBcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS51cGRhdGVMYXllckJsZW5kaW5nfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTGF5ZXJCbGVuZGluZyhtb2RlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX0xBWUVSX0JMRU5ESU5HLFxuICAgIG1vZGVcbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgYGludGVyYWN0aW9uQ29uZmlnYFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGNvbmZpZyAtIG5ldyBjb25maWcgYXMga2V5IHZhbHVlIG1hcDogYHt0b29sdGlwOiB7ZW5hYmxlZDogdHJ1ZX19YFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLmludGVyYWN0aW9uQ29uZmlnQ2hhbmdlfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJhY3Rpb25Db25maWdDaGFuZ2UoY29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuSU5URVJBQ1RJT05fQ09ORklHX0NIQU5HRSxcbiAgICBjb25maWdcbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgZmlsdGVyIHByb3BlcnR5XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC1gaWR4YCBvZiBmaWx0ZXIgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIHByb3AgLSBgcHJvcGAgb2YgZmlsdGVyLCBlLGcsIGBkYXRhSWRgLCBgbmFtZWAsIGB2YWx1ZWBcbiAqIEBwYXJhbSB2YWx1ZSAtIG5ldyB2YWx1ZVxuICogQHBhcmFtIHZhbHVlSW5kZXggLSBkYXRhSWQgaW5kZXhcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5zZXRGaWx0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXIoaWR4LCBwcm9wLCB2YWx1ZSwgdmFsdWVJbmRleCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9GSUxURVIsXG4gICAgaWR4LFxuICAgIHByb3AsXG4gICAgdmFsdWUsXG4gICAgdmFsdWVJbmRleFxuICB9O1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBmaWx0ZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBkYXRhSWQgLSBkYXRhc2V0IGBpZGAgdGhpcyBuZXcgZmlsdGVyIGlzIGFzc29jaWF0ZWQgd2l0aFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLmFkZEZpbHRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEZpbHRlcihkYXRhSWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5BRERfRklMVEVSLFxuICAgIGRhdGFJZFxuICB9O1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBsYXllclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIHByb3BzIC0gbmV3IGxheWVyIHByb3BzXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuYWRkTGF5ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRMYXllcihwcm9wcykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkFERF9MQVlFUixcbiAgICBwcm9wc1xuICB9O1xufVxuXG4vKipcbiAqIFJlb3JkZXIgbGF5ZXIsIG9yZGVyIGlzIGFuIGFycmF5IG9mIGxheWVyIGluZGV4ZXMsIGluZGV4IDAgd2lsbCBiZSB0aGUgb25lIGF0IHRoZSBib3R0b21cbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBvcmRlciBhbiBhcnJheSBvZiBsYXllciBpbmRleGVzXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykucmVvcmRlckxheWVyfVxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBicmluZyBgbGF5ZXJzWzFdYCBiZWxvdyBgbGF5ZXJzWzBdYCwgdGhlIHNlcXVlbmNlIGxheWVycyB3aWxsIGJlIHJlbmRlcmVkIGlzIGAxYCwgYDBgLCBgMmAsIGAzYC5cbiAqIC8vIGAxYCB3aWxsIGJlIGF0IHRoZSBib3R0b20sIGAzYCB3aWxsIGJlIGF0IHRoZSB0b3AuXG4gKiB0aGlzLnByb3BzLmRpc3BhdGNoKHJlb3JkZXJMYXllcihbMSwgMCwgMiwgM10pKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlb3JkZXJMYXllcihvcmRlcikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFT1JERVJfTEFZRVIsXG4gICAgb3JkZXJcbiAgfTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBmaWx0ZXIgZnJvbSBgdmlzU3RhdGUuZmlsdGVyc2AsIG9uY2UgYSBmaWx0ZXIgaXMgcmVtb3ZlZCwgZGF0YSB3aWxsIGJlIHJlLWZpbHRlcmVkIGFuZCBsYXllciB3aWxsIGJlIHVwZGF0ZWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHggaWR4IG9mIGZpbHRlciB0byBiZSByZW1vdmVkXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykucmVtb3ZlRmlsdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRmlsdGVyKGlkeCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFTU9WRV9GSUxURVIsXG4gICAgaWR4XG4gIH07XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgbGF5ZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHggaWR4IG9mIGxheWVyIHRvIGJlIHJlbW92ZWRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5yZW1vdmVMYXllcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxheWVyKGlkeCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFTU9WRV9MQVlFUixcbiAgICBpZHhcbiAgfTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBkYXRhc2V0IGFuZCBhbGwgbGF5ZXJzLCBmaWx0ZXJzLCB0b29sdGlwIGNvbmZpZ3MgdGhhdCBiYXNlZCBvbiBpdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGRhdGFJZCBkYXRhc2V0IGlkXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykucmVtb3ZlRGF0YXNldH1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZURhdGFzZXQoZGF0YUlkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuUkVNT1ZFX0RBVEFTRVQsXG4gICAgZGF0YUlkXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGxheSBkYXRhc2V0IHRhYmxlIGluIGEgbW9kYWxcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBkYXRhSWQgZGF0YXNldCBpZCB0byBzaG93IGluIHRhYmxlXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuc2hvd0RhdGFzZXRUYWJsZX1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dEYXRhc2V0VGFibGUoZGF0YUlkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0hPV19EQVRBU0VUX1RBQkxFLFxuICAgIGRhdGFJZFxuICB9O1xufVxuXG4vKipcbiAqIFNvcnQgZGF0YXNldCBjb2x1bW4sIGZvciB0YWJsZSBkaXNwbGF5XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZGF0YUlkXG4gKiBAcGFyYW0gY29sdW1uXG4gKiBAcGFyYW0gbW9kZVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLnNvcnRUYWJsZUNvbHVtbn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRUYWJsZUNvbHVtbihkYXRhSWQsIGNvbHVtbiwgbW9kZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNPUlRfVEFCTEVfQ09MVU1OLFxuICAgIGRhdGFJZCxcbiAgICBjb2x1bW4sXG4gICAgbW9kZVxuICB9O1xufVxuXG4vKipcbiAqIFBpbiBkYXRhc2V0IGNvbHVtbiwgZm9yIHRhYmxlIGRpc3BsYXlcbiAqIEBwYXJhbSBkYXRhSWRcbiAqIEBwYXJhbSBjb2x1bW5cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5waW5UYWJsZUNvbHVtbn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpblRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuUElOX1RBQkxFX0NPTFVNTixcbiAgICBkYXRhSWQsXG4gICAgY29sdW1uXG4gIH07XG59XG5cbi8qKlxuICogQ29weSBjb2x1bW4sIGZvciB0YWJsZSBkaXNwbGF5XG4gKiBAcGFyYW0gZGF0YUlkXG4gKiBAcGFyYW0gY29sdW1uXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuY29weVRhYmxlQ29sdW1ufVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29weVRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQ09QWV9UQUJMRV9DT0xVTU4sXG4gICAgZGF0YUlkLFxuICAgIGNvbHVtblxuICB9O1xufVxuXG4vLyAqIEBwYXJhbSBkYXRhc2V0LmluZm8gLWluZm8gb2YgYSBkYXRhc2V0XG4vLyAqIEBwYXJhbSBkYXRhc2V0LmluZm8uaWQgLSBpZCBvZiB0aGlzIGRhdGFzZXQuIElmIGNvbmZpZyBpcyBkZWZpbmVkLCBgaWRgIHNob3VsZCBtYXRjaGVzIHRoZSBgZGF0YUlkYCBpbiBjb25maWcuXG4vLyAqIEBwYXJhbSBkYXRhc2V0LmluZm8ubGFiZWwgLSBBIGRpc3BsYXkgbmFtZSBvZiB0aGlzIGRhdGFzZXRcbi8vICogQHBhcmFtIGRhdGFzZXQuZGF0YSAtICoqKnJlcXVpcmVkKiogVGhlIGRhdGEgb2JqZWN0LCBpbiBhIHRhYnVsYXIgZm9ybWF0IHdpdGggMiBwcm9wZXJ0aWVzIGBmaWVsZHNgIGFuZCBgcm93c2Bcbi8vICogQHBhcmFtIGRhdGFzZXQuZGF0YS5maWVsZHMgLSAqKipyZXF1aXJlZCoqIEFycmF5IG9mIGZpZWxkcyxcbi8vICogQHBhcmFtIGRhdGFzZXQuZGF0YS5maWVsZHMubmFtZSAtICoqKnJlcXVpcmVkKiogTmFtZSBvZiB0aGUgZmllbGQsXG4vLyAqIEBwYXJhbSBkYXRhc2V0LmRhdGEucm93cyAtICoqKnJlcXVpcmVkKiogQXJyYXkgb2Ygcm93cywgaW4gYSB0YWJ1bGFyIGZvcm1hdCB3aXRoIGBmaWVsZHNgIGFuZCBgcm93c2Bcbi8qKlxuICogQWRkIG5ldyBkYXRhc2V0IHRvIGB2aXNTdGF0ZWAsIHdpdGggb3B0aW9uIHRvIGxvYWQgYSBtYXAgY29uZmlnIGFsb25nIHdpdGggdGhlIGRhdGFzZXRzXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZGF0YXNldHMgLSAqKipyZXF1aXJlZCoqIGRhdGFzZXRzIGNhbiBiZSBhIGRhdGFzZXQgb3IgYW4gYXJyYXkgb2YgZGF0YXNldHNcbiAqIEVhY2ggZGF0YXNldCBvYmplY3QgbmVlZHMgdG8gaGF2ZSBgaW5mb2AgYW5kIGBkYXRhYCBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0gb3B0aW9ucy5jZW50ZXJNYXAgYGRlZmF1bHQ6IHRydWVgIGlmIGBjZW50ZXJNYXBgIGlzIHNldCB0byBgdHJ1ZWAga2VwbGVyLmdsIHdpbGxcbiAqIHBsYWNlIHRoZSBtYXAgdmlldyB3aXRoaW4gdGhlIGRhdGEgcG9pbnRzIGJvdW5kYXJpZXNcbiAqIEBwYXJhbSBvcHRpb25zLnJlYWRPbmx5IGBkZWZhdWx0OiBmYWxzZWAgaWYgYHJlYWRPbmx5YCBpcyBzZXQgdG8gYHRydWVgXG4gKiB0aGUgbGVmdCBzZXR0aW5nIHBhbmVsIHdpbGwgYmUgaGlkZGVuXG4gKiBAcGFyYW0gY29uZmlnIHRoaXMgb2JqZWN0IHdpbGwgY29udGFpbiB0aGUgZnVsbCBrZXBsZXIuZ2wgaW5zdGFuY2UgY29uZmlndXJhdGlvbiB7bWFwU3RhdGUsIG1hcFN0eWxlLCB2aXNTdGF0ZX1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS51cGRhdGVWaXNEYXRhfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVmlzRGF0YShkYXRhc2V0cywgb3B0aW9ucywgY29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX1ZJU19EQVRBLFxuICAgIGRhdGFzZXRzLFxuICAgIG9wdGlvbnMsXG4gICAgY29uZmlnXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYW5kIGVuZCBmaWx0ZXIgYW5pbWF0aW9uXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gaWR4IG9mIGZpbHRlclxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS50b2dnbGVGaWx0ZXJBbmltYXRpb259XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUZpbHRlckFuaW1hdGlvbihpZHgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfRklMVEVSX0FOSU1BVElPTixcbiAgICBpZHhcbiAgfTtcbn1cblxuLyoqXG4gKiBDaGFuZ2UgZmlsdGVyIGFuaW1hdGlvbiBzcGVlZFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGlkeCAtICBgaWR4YCBvZiBmaWx0ZXJcbiAqIEBwYXJhbSBzcGVlZCAtIGBzcGVlZGAgdG8gY2hhbmdlIGl0IHRvLiBgc3BlZWRgIGlzIGEgbXVsdGlwbGllclxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS51cGRhdGVGaWx0ZXJBbmltYXRpb25TcGVlZH1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRmlsdGVyQW5pbWF0aW9uU3BlZWQoaWR4LCBzcGVlZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9GSUxURVJfQU5JTUFUSU9OX1NQRUVELFxuICAgIGlkeCxcbiAgICBzcGVlZFxuICB9O1xufVxuXG4vKipcbiAqIFJlc2V0IGFuaW1hdGlvblxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIHZhbHVlIC0gIEN1cnJlbnQgdmFsdWUgb2YgdGhlIHNsaWRlclxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS51cGRhdGVBbmltYXRpb25UaW1lfVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBbmltYXRpb25UaW1lKHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX0FOSU1BVElPTl9USU1FLFxuICAgIHZhbHVlXG4gIH07XG59XG5cbi8qKlxuICogdXBkYXRlIHRyaXAgbGF5ZXIgYW5pbWF0aW9uIHNwZWVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gc3BlZWQgLSBgc3BlZWRgIHRvIGNoYW5nZSBpdCB0by4gYHNwZWVkYCBpcyBhIG11bHRpcGxpZXJcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykudXBkYXRlTGF5ZXJBbmltYXRpb25TcGVlZH1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTGF5ZXJBbmltYXRpb25TcGVlZChzcGVlZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9MQVlFUl9BTklNQVRJT05fU1BFRUQsXG4gICAgc3BlZWRcbiAgfTtcbn1cblxuLyoqXG4gKiBTaG93IGxhcmdlciB0aW1lIGZpbHRlciBhdCBib3R0b20gZm9yIHRpbWUgcGxheWJhY2sgKGFwcGx5IHRvIHRpbWUgZmlsdGVyIG9ubHkpXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC0gaW5kZXggb2YgZmlsdGVyIHRvIGVubGFyZ2VcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuZW5sYXJnZUZpbHRlcn1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZW5sYXJnZUZpbHRlcihpZHgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5FTkxBUkdFX0ZJTFRFUixcbiAgICBpZHhcbiAgfTtcbn1cblxuLyoqXG4gKiBTaG93L2hpZGUgZmlsdGVyIGZlYXR1cmUgb24gbWFwXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC0gaW5kZXggb2YgZmlsdGVyIGZlYXR1cmUgdG8gc2hvdy9oaWRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLnRvZ2dsZUZpbHRlckZlYXR1cmV9XG4gKiBAcmV0dXJuIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlRmlsdGVyRmVhdHVyZShpZHgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfRklMVEVSX0ZFQVRVUkUsXG4gICAgaWR4XG4gIH07XG59XG5cbi8qKlxuICogVHJpZ2dlciBsYXllciBob3ZlciBldmVudCB3aXRoIGhvdmVyZWQgb2JqZWN0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaW5mbyAtIE9iamVjdCBob3ZlcmVkLCByZXR1cm5lZCBieSBkZWNrLmdsXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLm9uTGF5ZXJIb3Zlcn1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25MYXllckhvdmVyKGluZm8pIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9IT1ZFUixcbiAgICBpbmZvXG4gIH07XG59XG5cbi8qKlxuICogVHJpZ2dlciBsYXllciBjbGljayBldmVudCB3aXRoIGNsaWNrZWQgb2JqZWN0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaW5mbyAtIE9iamVjdCBjbGlja2VkLCByZXR1cm5lZCBieSBkZWNrLmdsXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLm9uTGF5ZXJDbGlja31cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25MYXllckNsaWNrKGluZm8pIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9DTElDSyxcbiAgICBpbmZvXG4gIH07XG59XG5cbi8qKlxuICogVHJpZ2dlciBtYXAgY2xpY2sgZXZlbnQsIHVuc2VsZWN0IGNsaWNrZWQgb2JqZWN0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLm9uTWFwQ2xpY2t9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uTWFwQ2xpY2soKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTUFQX0NMSUNLXG4gIH07XG59XG5cbi8qKlxuICogVHJpZ2dlciBtYXAgbW91c2UgbW92ZWV2ZW50LCBwYXlsb2FkIHdvdWxkIGJlXG4gKiBSZWFjdC1tYXAtZ2wgUG9pbnRlckV2ZW50XG4gKiBodHRwczovL3ViZXIuZ2l0aHViLmlvL3JlYWN0LW1hcC1nbC8jL2RvY3VtZW50YXRpb24vYXBpLXJlZmVyZW5jZS9wb2ludGVyLWV2ZW50XG4gKlxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGV2dCAtIFBvaW50ZXJFdmVudFxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5vbk1vdXNlTW92ZX1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZ0KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTU9VU0VfTU9WRSxcbiAgICBldnRcbiAgfTtcbn1cblxuLyoqXG4gKiBUb2dnbGUgdmlzaWJpbGl0eSBvZiBhIGxheWVyIGluIGEgc3BsaXQgbWFwXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbWFwSW5kZXggLSBpbmRleCBvZiB0aGUgc3BsaXQgbWFwXG4gKiBAcGFyYW0gbGF5ZXJJZCAtIGlkIG9mIHRoZSBsYXllclxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS50b2dnbGVMYXllckZvck1hcH1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlTGF5ZXJGb3JNYXAobWFwSW5kZXgsIGxheWVySWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfTEFZRVJfRk9SX01BUCxcbiAgICBtYXBJbmRleCxcbiAgICBsYXllcklkXG4gIH07XG59XG5cbi8qKlxuICogU2V0IHRoZSBwcm9wZXJ0eSBvZiBhIGZpbHRlciBwbG90XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4XG4gKiBAcGFyYW0gbmV3UHJvcCBrZXkgdmFsdWUgbWFwcGluZyBvZiBuZXcgcHJvcCBge3lBeGlzOiAnaGlzdG9ncmFtJ31gXG4gKiBAcGFyYW0gdmFsdWVJbmRleCBkYXRhSWQgaW5kZXhcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuc2V0RmlsdGVyUGxvdH1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RmlsdGVyUGxvdChpZHgsIG5ld1Byb3AsIHZhbHVlSW5kZXgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSX1BMT1QsXG4gICAgaWR4LFxuICAgIG5ld1Byb3AsXG4gICAgdmFsdWVJbmRleFxuICB9O1xufVxuXG4vKipcbiAqIFNldCB0aGUgcHJvcGVydHkgb2YgYSBmaWx0ZXIgcGxvdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGluZm9cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuc2V0TWFwSW5mb31cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TWFwSW5mbyhpbmZvKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX01BUF9JTkZPLFxuICAgIGluZm9cbiAgfTtcbn1cblxuLyoqXG4gKiBUcmlnZ2VyIGZpbGUgbG9hZGluZyBkaXNwYXRjaCBgYWRkRGF0YVRvTWFwYCBpZiBzdWNjZWVkLCBvciBgbG9hZEZpbGVzRXJyYCBpZiBmYWlsZWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBmaWxlcyBhcnJheSBvZiBmaWxlYmxvYlxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sb2FkRmlsZXN9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlcyhmaWxlcywgb25GaW5pc2gpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MT0FEX0ZJTEVTLFxuICAgIGZpbGVzLFxuICAgIG9uRmluaXNoXG4gIH07XG59XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggbmV4dCBmaWxlIHRvIGxvYWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykubG9hZE5leHRGaWxlfVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTmV4dEZpbGUoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTE9BRF9ORVhUX0ZJTEVcbiAgfTtcbn1cblxuLyoqXG4gKiBjYWxsZWQgd2hlbiBhbGwgZmlsZXMgYXJlIHByb2Nlc3NlZCBhbmQgbG9hZGVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLmxvYWRGaWxlc1N1Y2Nlc3N9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlc1N1Y2Nlc3MocmVzdWx0KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTE9BRF9GSUxFU19TVUNDRVNTLFxuICAgIHJlc3VsdFxuICB9O1xufVxuXG4vKipcbiAqIGNhbGxlZCB3aGVuIHN1Y2Nlc3NmdWxseSBsb2FkZWQgb25lIGZpbGUsIHJlYWR5IHRvIG1vdmUgb24gdG8gdGhlIG5leHQgb25lXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLmxvYWRGaWxlU3RlcFN1Y2Nlc3N9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlU3RlcFN1Y2Nlc3Moe2ZpbGVOYW1lLCBmaWxlQ2FjaGV9KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTE9BRF9GSUxFX1NURVBfU1VDQ0VTUyxcbiAgICBmaWxlTmFtZSxcbiAgICBmaWxlQ2FjaGVcbiAgfTtcbn1cblxuLyoqXG4gKiBUcmlnZ2VyIGxvYWRpbmcgZmlsZSBlcnJvclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtICBlcnJvclxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5sb2FkRmlsZXNFcnJ9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlc0VycihmaWxlTmFtZSwgZXJyb3IpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MT0FEX0ZJTEVTX0VSUixcbiAgICBmaWxlTmFtZSxcbiAgICBlcnJvclxuICB9O1xufVxuXG4vKipcbiAqIFN0b3JlIGZlYXR1cmVzIHRvIHN0YXRlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZmVhdHVyZXNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykuc2V0RmVhdHVyZXN9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEZlYXR1cmVzKGZlYXR1cmVzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0ZFQVRVUkVTLFxuICAgIGZlYXR1cmVzXG4gIH07XG59XG5cbi8qKlxuICogSXQgd2lsbCBhcHBseSB0aGUgcHJvdmlkZSBmZWF0dXJlIGFzIGZpbHRlciB0byB0aGUgZ2l2ZW4gbGF5ZXIuXG4gKiBJZiB0aGUgZ2l2ZW4gZmVhdHVyZSBpcyBhbHJlYWR5IGFwcGxpZWQgYXMgZmlsdGVyIHRvIHRoZSBsYXllciwgaXQgd2lsbCByZW1vdmUgdGhlIGxheWVyIGZyb20gdGhlIGZpbHRlclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGxheWVyXG4gKiBAcGFyYW0gZmVhdHVyZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5zZXRQb2x5Z29uRmlsdGVyTGF5ZXJ9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFBvbHlnb25GaWx0ZXJMYXllcihsYXllciwgZmVhdHVyZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9QT0xZR09OX0ZJTFRFUl9MQVlFUixcbiAgICBsYXllcixcbiAgICBmZWF0dXJlXG4gIH07XG59XG5cbi8qKlxuICogU2V0IHRoZSBjdXJyZW50IGZlYXR1cmUgdG8gYmUgZWRpdGVkL2RlbGV0ZWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBmZWF0dXJlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLnNldFNlbGVjdGVkRmVhdHVyZX1cbiAqIEByZXR1cm5zIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWRGZWF0dXJlKGZlYXR1cmUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfU0VMRUNURURfRkVBVFVSRSxcbiAgICBmZWF0dXJlXG4gIH07XG59XG5cbi8qKlxuICogRGVsZXRlIHRoZSBnaXZlbiBmZWF0dXJlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZmVhdHVyZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5kZWxldGVGZWF0dXJlfVxuICogQHJldHVybnMgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVGZWF0dXJlKGZlYXR1cmUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERUxFVEVfRkVBVFVSRSxcbiAgICBmZWF0dXJlXG4gIH07XG59XG5cbi8qKiBTZXQgdGhlIG1hcCBtb2RlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbW9kZSBvbmUgb2YgRURJVE9SX01PREVTXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLnNldEVkaXRvck1vZGV9XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQge3NldE1hcE1vZGV9IGZyb20gJ2tlcGxlci5nbC9hY3Rpb25zJztcbiAqIGltcG9ydCB7RURJVE9SX01PREVTfSBmcm9tICdrZXBsZXIuZ2wvY29uc3RhbnRzJztcbiAqXG4gKiB0aGlzLnByb3BzLmRpc3BhdGNoKHNldE1hcE1vZGUoRURJVE9SX01PREVTLkRSQVdfUE9MWUdPTikpO1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RWRpdG9yTW9kZShtb2RlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0VESVRPUl9NT0RFLFxuICAgIG1vZGVcbiAgfTtcbn1cblxuLyoqXG4gKiBUcmlnZ2VyIENQVSBmaWx0ZXIgb2Ygc2VsZWN0ZWQgZGF0YXNldFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGRhdGFJZCAtIHNpbmdsZSBkYXRhSWQgb3IgYW4gYXJyYXkgb2YgZGF0YUlkc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5hcHBseUNQVUZpbHRlcn1cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlDUFVGaWx0ZXIoZGF0YUlkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQVBQTFlfQ1BVX0ZJTFRFUixcbiAgICBkYXRhSWRcbiAgfTtcbn1cblxuLyoqXG4gKiBUb2dnbGUgZWRpdG9yIGxheWVyIHZpc2liaWxpdHlcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Zpcy1zdGF0ZS1hY3Rpb25zJykudG9nZ2xlRWRpdG9yVmlzaWJpbGl0eX1cbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVFZGl0b3JWaXNpYmlsaXR5KCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlRPR0dMRV9FRElUT1JfVklTSUJJTElUWVxuICB9O1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIG5leHQgZmlsZSBiYXRjaFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIHBheWxvYWQgLSBiYXRjaCBwYXlsb2FkXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi92aXMtc3RhdGUtYWN0aW9ucycpLm5leHRGaWxlQmF0Y2h9XG4gKiBAcmV0dXJuIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV4dEZpbGVCYXRjaChwYXlsb2FkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTkVYVF9GSUxFX0JBVENILFxuICAgIHBheWxvYWRcbiAgfTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSBmaWxlIGNvbnRlbnRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBwYXlsb2FkIC0gdGhlIGZpbGUgY29udGVudFxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdmlzLXN0YXRlLWFjdGlvbnMnKS5wcm9jZXNzRmlsZUNvbnRlbnR9XG4gKiBAcmV0dXJuIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZpbGVDb250ZW50KHBheWxvYWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QUk9DRVNTX0ZJTEVfQ09OVEVOVCxcbiAgICBwYXlsb2FkXG4gIH07XG59XG5cbi8qKlxuICogVGhpcyBkZWNsYXJhdGlvbiBpcyBuZWVkZWQgdG8gZ3JvdXAgYWN0aW9ucyBpbiBkb2NzXG4gKi9cbi8qKlxuICogQWN0aW9ucyBoYW5kbGVkIG1vc3RseSBieSBgdmlzU3RhdGVgIHJlZHVjZXIuXG4gKiBUaGV5IG1hbmFnZSBob3cgZGF0YSBpcyBwcm9jZXNzZWQsIGZpbHRlcmVkIGFuZCBkaXNwbGF5ZWQgb24gdGhlIG1hcCBieSBvcGVyYXRlcyBvbiBsYXllcnMsXG4gKiBmaWx0ZXJzIGFuZCBpbnRlcmFjdGlvbiBzZXR0aW5ncy5cbiAqXG4gKiBAcHVibGljXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4vLyBAdHMtaWdub3JlXG5jb25zdCB2aXNTdGF0ZUFjdGlvbnMgPSBudWxsO1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuIl19