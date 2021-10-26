"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDataToMapComposed = exports.loadFilesSuccessUpdater = exports.addDataToMapUpdater = exports.defaultAddDataToMapOptions = exports.isValidConfig = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _uiStateUpdaters = require("./ui-state-updaters");

var _visStateUpdaters = require("./vis-state-updaters");

var _mapStateUpdaters = require("./map-state-updaters");

var _mapStyleUpdaters = require("./map-style-updaters");

var _dataUtils = require("../utils/data-utils");

var _utils = require("../utils/utils");

var _fileHandler = require("../processors/file-handler");

var _composerHelpers = require("./composer-helpers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// compose action to apply result multiple reducers, with the output of one

/**
 * Some actions will affect the entire kepler.lg instance state.
 * The updaters for these actions is exported as `combinedUpdaters`. These updater take the entire instance state
 * as the first argument. Read more about [Using updaters](../advanced-usage/using-updaters.md)
 * @public
 * @example
 *
 * import keplerGlReducer, {combinedUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    // add data to map after receiving data from remote sources
 *    case 'LOAD_REMOTE_RESOURCE_SUCCESS':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          // pass in kepler.gl instance state to combinedUpdaters
 *          map:  combinedUpdaters.addDataToMapUpdater(
 *           state.keplerGl.map,
 *           {
 *             payload: {
 *               datasets: action.datasets,
 *               options: {readOnly: true},
 *               config: action.config
 *              }
 *            }
 *          )
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
var combinedUpdaters = null;
/* eslint-enable no-unused-vars */

var isValidConfig = function isValidConfig(config) {
  return (0, _utils.isPlainObject)(config) && (0, _utils.isPlainObject)(config.config) && config.version;
};

exports.isValidConfig = isValidConfig;
var defaultAddDataToMapOptions = {
  centerMap: true,
  keepExistingConfig: false,
  autoCreateLayers: true
};
/**
 * Combine data and full configuration update in a single action
 *
 * @memberof combinedUpdaters
 * @param {Object} state kepler.gl instance state, containing all subreducer state
 * @param {Object} action
 * @param {Object} action.payload `{datasets, options, config}`
 * @param action.payload.datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param [action.payload.options] option object `{centerMap: true}`
 * @param [action.payload.config] map config
 * @param [action.payload.info] map info contains title and description
 * @returns nextState
 *
 * @typedef {Object} Dataset
 * @property info -info of a dataset
 * @property info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
 * @property info.label - A display name of this dataset
 * @property data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
 * @property data.fields - ***required** Array of fields,
 * @property data.fields.name - ***required** Name of the field,
 * @property data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`
 *
 * @type {typeof import('./combined-updaters').addDataToMapUpdater}
 * @public
 */

exports.defaultAddDataToMapOptions = defaultAddDataToMapOptions;

var addDataToMapUpdater = function addDataToMapUpdater(state, _ref) {
  var payload = _ref.payload;
  var datasets = payload.datasets,
      config = payload.config,
      info = payload.info;

  var options = _objectSpread(_objectSpread({}, defaultAddDataToMapOptions), payload.options);

  var parsedConfig = config;

  if (isValidConfig(config)) {
    // if passed in saved config
    parsedConfig = state.visState.schema.parseSavedConfig(config);
  }

  var oldLayers = state.visState.layers;

  var filterNewlyAddedLayers = function filterNewlyAddedLayers(layers) {
    return layers.filter(function (nl) {
      return !oldLayers.find(function (ol) {
        return ol === nl;
      });
    });
  }; // Returns undefined if not found, to make typescript happy


  var findMapBoundsIfCentered = function findMapBoundsIfCentered(layers) {
    var bounds = options.centerMap && (0, _dataUtils.findMapBounds)(layers);
    return bounds ? bounds : undefined;
  };

  return (0, _composerHelpers.compose_)([(0, _composerHelpers.pick_)('visState')((0, _composerHelpers.apply_)(_visStateUpdaters.updateVisDataUpdater, {
    datasets: datasets,
    options: options,
    config: parsedConfig
  })), (0, _composerHelpers.if_)(info, (0, _composerHelpers.pick_)('visState')((0, _composerHelpers.apply_)(_visStateUpdaters.setMapInfoUpdater, {
    info: info
  }))), (0, _composerHelpers.with_)(function (_ref2) {
    var visState = _ref2.visState;
    return (0, _composerHelpers.pick_)('mapState')((0, _composerHelpers.apply_)(_mapStateUpdaters.receiveMapConfigUpdater, (0, _composerHelpers.payload_)({
      config: parsedConfig,
      options: options,
      bounds: findMapBoundsIfCentered(filterNewlyAddedLayers(visState.layers))
    })));
  }), (0, _composerHelpers.pick_)('mapStyle')((0, _composerHelpers.apply_)(_mapStyleUpdaters.receiveMapConfigUpdater, (0, _composerHelpers.payload_)({
    config: parsedConfig,
    options: options
  }))), (0, _composerHelpers.pick_)('uiState')((0, _composerHelpers.apply_)(_uiStateUpdaters.loadFilesSuccessUpdater, (0, _composerHelpers.payload_)(null))), (0, _composerHelpers.pick_)('uiState')((0, _composerHelpers.apply_)(_uiStateUpdaters.toggleModalUpdater, (0, _composerHelpers.payload_)(null))), (0, _composerHelpers.pick_)('uiState')((0, _composerHelpers.merge_)(options.hasOwnProperty('readOnly') ? {
    readOnly: options.readOnly
  } : {}))])(state);
};
/**
 * @type {typeof import('./combined-updaters').loadFilesSuccessUpdater}
 */


exports.addDataToMapUpdater = addDataToMapUpdater;

var loadFilesSuccessUpdater = function loadFilesSuccessUpdater(state, action) {
  // still more to load
  var payloads = (0, _fileHandler.filesToDataPayload)(action.result);
  var nextState = (0, _composerHelpers.compose_)([(0, _composerHelpers.pick_)('visState')((0, _composerHelpers.merge_)({
    fileLoading: false,
    fileLoadingProgress: {}
  }))])(state); // make multiple add data to map calls

  var stateWithData = (0, _composerHelpers.compose_)(payloads.map(function (p) {
    return (0, _composerHelpers.apply_)(addDataToMapUpdater, (0, _composerHelpers.payload_)(p));
  }))(nextState);
  return stateWithData;
};

exports.loadFilesSuccessUpdater = loadFilesSuccessUpdater;
var addDataToMapComposed = addDataToMapUpdater;
exports.addDataToMapComposed = addDataToMapComposed;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy9jb21iaW5lZC11cGRhdGVycy5qcyJdLCJuYW1lcyI6WyJjb21iaW5lZFVwZGF0ZXJzIiwiaXNWYWxpZENvbmZpZyIsImNvbmZpZyIsInZlcnNpb24iLCJkZWZhdWx0QWRkRGF0YVRvTWFwT3B0aW9ucyIsImNlbnRlck1hcCIsImtlZXBFeGlzdGluZ0NvbmZpZyIsImF1dG9DcmVhdGVMYXllcnMiLCJhZGREYXRhVG9NYXBVcGRhdGVyIiwic3RhdGUiLCJwYXlsb2FkIiwiZGF0YXNldHMiLCJpbmZvIiwib3B0aW9ucyIsInBhcnNlZENvbmZpZyIsInZpc1N0YXRlIiwic2NoZW1hIiwicGFyc2VTYXZlZENvbmZpZyIsIm9sZExheWVycyIsImxheWVycyIsImZpbHRlck5ld2x5QWRkZWRMYXllcnMiLCJmaWx0ZXIiLCJubCIsImZpbmQiLCJvbCIsImZpbmRNYXBCb3VuZHNJZkNlbnRlcmVkIiwiYm91bmRzIiwidW5kZWZpbmVkIiwidmlzU3RhdGVVcGRhdGVWaXNEYXRhVXBkYXRlciIsInNldE1hcEluZm9VcGRhdGVyIiwic3RhdGVNYXBDb25maWdVcGRhdGVyIiwic3R5bGVNYXBDb25maWdVcGRhdGVyIiwidWlTdGF0ZUxvYWRGaWxlc1N1Y2Nlc3NVcGRhdGVyIiwidG9nZ2xlTW9kYWxVcGRhdGVyIiwiaGFzT3duUHJvcGVydHkiLCJyZWFkT25seSIsImxvYWRGaWxlc1N1Y2Nlc3NVcGRhdGVyIiwiYWN0aW9uIiwicGF5bG9hZHMiLCJyZXN1bHQiLCJuZXh0U3RhdGUiLCJmaWxlTG9hZGluZyIsImZpbGVMb2FkaW5nUHJvZ3Jlc3MiLCJzdGF0ZVdpdGhEYXRhIiwibWFwIiwicCIsImFkZERhdGFUb01hcENvbXBvc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFJQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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b0JBQW9CLEdBQUd0QyxtQkFBN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge1xuICB0b2dnbGVNb2RhbFVwZGF0ZXIsXG4gIGxvYWRGaWxlc1N1Y2Nlc3NVcGRhdGVyIGFzIHVpU3RhdGVMb2FkRmlsZXNTdWNjZXNzVXBkYXRlclxufSBmcm9tICcuL3VpLXN0YXRlLXVwZGF0ZXJzJztcbmltcG9ydCB7XG4gIHVwZGF0ZVZpc0RhdGFVcGRhdGVyIGFzIHZpc1N0YXRlVXBkYXRlVmlzRGF0YVVwZGF0ZXIsXG4gIHNldE1hcEluZm9VcGRhdGVyXG59IGZyb20gJy4vdmlzLXN0YXRlLXVwZGF0ZXJzJztcbmltcG9ydCB7cmVjZWl2ZU1hcENvbmZpZ1VwZGF0ZXIgYXMgc3RhdGVNYXBDb25maWdVcGRhdGVyfSBmcm9tICcuL21hcC1zdGF0ZS11cGRhdGVycyc7XG5pbXBvcnQge3JlY2VpdmVNYXBDb25maWdVcGRhdGVyIGFzIHN0eWxlTWFwQ29uZmlnVXBkYXRlcn0gZnJvbSAnLi9tYXAtc3R5bGUtdXBkYXRlcnMnO1xuaW1wb3J0IHtmaW5kTWFwQm91bmRzfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7aXNQbGFpbk9iamVjdH0gZnJvbSAndXRpbHMvdXRpbHMnO1xuaW1wb3J0IHtmaWxlc1RvRGF0YVBheWxvYWR9IGZyb20gJ3Byb2Nlc3NvcnMvZmlsZS1oYW5kbGVyJztcbmltcG9ydCB7cGF5bG9hZF8sIGFwcGx5Xywgd2l0aF8sIGlmXywgY29tcG9zZV8sIG1lcmdlXywgcGlja199IGZyb20gJy4vY29tcG9zZXItaGVscGVycyc7XG5cbi8vIGNvbXBvc2UgYWN0aW9uIHRvIGFwcGx5IHJlc3VsdCBtdWx0aXBsZSByZWR1Y2Vycywgd2l0aCB0aGUgb3V0cHV0IG9mIG9uZVxuXG4vKipcbiAqIFNvbWUgYWN0aW9ucyB3aWxsIGFmZmVjdCB0aGUgZW50aXJlIGtlcGxlci5sZyBpbnN0YW5jZSBzdGF0ZS5cbiAqIFRoZSB1cGRhdGVycyBmb3IgdGhlc2UgYWN0aW9ucyBpcyBleHBvcnRlZCBhcyBgY29tYmluZWRVcGRhdGVyc2AuIFRoZXNlIHVwZGF0ZXIgdGFrZSB0aGUgZW50aXJlIGluc3RhbmNlIHN0YXRlXG4gKiBhcyB0aGUgZmlyc3QgYXJndW1lbnQuIFJlYWQgbW9yZSBhYm91dCBbVXNpbmcgdXBkYXRlcnNdKC4uL2FkdmFuY2VkLXVzYWdlL3VzaW5nLXVwZGF0ZXJzLm1kKVxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQga2VwbGVyR2xSZWR1Y2VyLCB7Y29tYmluZWRVcGRhdGVyc30gZnJvbSAna2VwbGVyLmdsL3JlZHVjZXJzJztcbiAqIC8vIFJvb3QgUmVkdWNlclxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGtlcGxlckdsOiBrZXBsZXJHbFJlZHVjZXIsXG4gKiAgYXBwOiBhcHBSZWR1Y2VyXG4gKiB9KTtcbiAqXG4gKiBjb25zdCBjb21wb3NlZFJlZHVjZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICogIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAqICAgIC8vIGFkZCBkYXRhIHRvIG1hcCBhZnRlciByZWNlaXZpbmcgZGF0YSBmcm9tIHJlbW90ZSBzb3VyY2VzXG4gKiAgICBjYXNlICdMT0FEX1JFTU9URV9SRVNPVVJDRV9TVUNDRVNTJzpcbiAqICAgICAgcmV0dXJuIHtcbiAqICAgICAgICAuLi5zdGF0ZSxcbiAqICAgICAgICBrZXBsZXJHbDoge1xuICogICAgICAgICAgLi4uc3RhdGUua2VwbGVyR2wsXG4gKiAgICAgICAgICAvLyBwYXNzIGluIGtlcGxlci5nbCBpbnN0YW5jZSBzdGF0ZSB0byBjb21iaW5lZFVwZGF0ZXJzXG4gKiAgICAgICAgICBtYXA6ICBjb21iaW5lZFVwZGF0ZXJzLmFkZERhdGFUb01hcFVwZGF0ZXIoXG4gKiAgICAgICAgICAgc3RhdGUua2VwbGVyR2wubWFwLFxuICogICAgICAgICAgIHtcbiAqICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAqICAgICAgICAgICAgICAgZGF0YXNldHM6IGFjdGlvbi5kYXRhc2V0cyxcbiAqICAgICAgICAgICAgICAgb3B0aW9uczoge3JlYWRPbmx5OiB0cnVlfSxcbiAqICAgICAgICAgICAgICAgY29uZmlnOiBhY3Rpb24uY29uZmlnXG4gKiAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICB9XG4gKiAgICAgICAgICApXG4gKiAgICAgICAgfVxuICogICAgICB9O1xuICogIH1cbiAqICByZXR1cm4gcmVkdWNlcnMoc3RhdGUsIGFjdGlvbik7XG4gKiB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGNvbXBvc2VkUmVkdWNlcjtcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLy8gQHRzLWlnbm9yZVxuY29uc3QgY29tYmluZWRVcGRhdGVycyA9IG51bGw7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbmV4cG9ydCBjb25zdCBpc1ZhbGlkQ29uZmlnID0gY29uZmlnID0+XG4gIGlzUGxhaW5PYmplY3QoY29uZmlnKSAmJiBpc1BsYWluT2JqZWN0KGNvbmZpZy5jb25maWcpICYmIGNvbmZpZy52ZXJzaW9uO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdEFkZERhdGFUb01hcE9wdGlvbnMgPSB7XG4gIGNlbnRlck1hcDogdHJ1ZSxcbiAga2VlcEV4aXN0aW5nQ29uZmlnOiBmYWxzZSxcbiAgYXV0b0NyZWF0ZUxheWVyczogdHJ1ZVxufTtcblxuLyoqXG4gKiBDb21iaW5lIGRhdGEgYW5kIGZ1bGwgY29uZmlndXJhdGlvbiB1cGRhdGUgaW4gYSBzaW5nbGUgYWN0aW9uXG4gKlxuICogQG1lbWJlcm9mIGNvbWJpbmVkVXBkYXRlcnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBrZXBsZXIuZ2wgaW5zdGFuY2Ugc3RhdGUsIGNvbnRhaW5pbmcgYWxsIHN1YnJlZHVjZXIgc3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24ucGF5bG9hZCBge2RhdGFzZXRzLCBvcHRpb25zLCBjb25maWd9YFxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkLmRhdGFzZXRzIC0gKioqcmVxdWlyZWQqKiBkYXRhc2V0cyBjYW4gYmUgYSBkYXRhc2V0IG9yIGFuIGFycmF5IG9mIGRhdGFzZXRzXG4gKiBFYWNoIGRhdGFzZXQgb2JqZWN0IG5lZWRzIHRvIGhhdmUgYGluZm9gIGFuZCBgZGF0YWAgcHJvcGVydHkuXG4gKiBAcGFyYW0gW2FjdGlvbi5wYXlsb2FkLm9wdGlvbnNdIG9wdGlvbiBvYmplY3QgYHtjZW50ZXJNYXA6IHRydWV9YFxuICogQHBhcmFtIFthY3Rpb24ucGF5bG9hZC5jb25maWddIG1hcCBjb25maWdcbiAqIEBwYXJhbSBbYWN0aW9uLnBheWxvYWQuaW5mb10gbWFwIGluZm8gY29udGFpbnMgdGl0bGUgYW5kIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEYXRhc2V0XG4gKiBAcHJvcGVydHkgaW5mbyAtaW5mbyBvZiBhIGRhdGFzZXRcbiAqIEBwcm9wZXJ0eSBpbmZvLmlkIC0gaWQgb2YgdGhpcyBkYXRhc2V0LiBJZiBjb25maWcgaXMgZGVmaW5lZCwgYGlkYCBzaG91bGQgbWF0Y2hlcyB0aGUgYGRhdGFJZGAgaW4gY29uZmlnLlxuICogQHByb3BlcnR5IGluZm8ubGFiZWwgLSBBIGRpc3BsYXkgbmFtZSBvZiB0aGlzIGRhdGFzZXRcbiAqIEBwcm9wZXJ0eSBkYXRhIC0gKioqcmVxdWlyZWQqKiBUaGUgZGF0YSBvYmplY3QsIGluIGEgdGFidWxhciBmb3JtYXQgd2l0aCAyIHByb3BlcnRpZXMgYGZpZWxkc2AgYW5kIGByb3dzYFxuICogQHByb3BlcnR5IGRhdGEuZmllbGRzIC0gKioqcmVxdWlyZWQqKiBBcnJheSBvZiBmaWVsZHMsXG4gKiBAcHJvcGVydHkgZGF0YS5maWVsZHMubmFtZSAtICoqKnJlcXVpcmVkKiogTmFtZSBvZiB0aGUgZmllbGQsXG4gKiBAcHJvcGVydHkgZGF0YS5yb3dzIC0gKioqcmVxdWlyZWQqKiBBcnJheSBvZiByb3dzLCBpbiBhIHRhYnVsYXIgZm9ybWF0IHdpdGggYGZpZWxkc2AgYW5kIGByb3dzYFxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2NvbWJpbmVkLXVwZGF0ZXJzJykuYWRkRGF0YVRvTWFwVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZERhdGFUb01hcFVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkfSkgPT4ge1xuICBjb25zdCB7ZGF0YXNldHMsIGNvbmZpZywgaW5mb30gPSBwYXlsb2FkO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgLi4uZGVmYXVsdEFkZERhdGFUb01hcE9wdGlvbnMsXG4gICAgLi4ucGF5bG9hZC5vcHRpb25zXG4gIH07XG5cbiAgbGV0IHBhcnNlZENvbmZpZyA9IGNvbmZpZztcblxuICBpZiAoaXNWYWxpZENvbmZpZyhjb25maWcpKSB7XG4gICAgLy8gaWYgcGFzc2VkIGluIHNhdmVkIGNvbmZpZ1xuICAgIHBhcnNlZENvbmZpZyA9IHN0YXRlLnZpc1N0YXRlLnNjaGVtYS5wYXJzZVNhdmVkQ29uZmlnKGNvbmZpZyk7XG4gIH1cbiAgY29uc3Qgb2xkTGF5ZXJzID0gc3RhdGUudmlzU3RhdGUubGF5ZXJzO1xuICBjb25zdCBmaWx0ZXJOZXdseUFkZGVkTGF5ZXJzID0gbGF5ZXJzID0+IGxheWVycy5maWx0ZXIobmwgPT4gIW9sZExheWVycy5maW5kKG9sID0+IG9sID09PSBubCkpO1xuXG4gIC8vIFJldHVybnMgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZCwgdG8gbWFrZSB0eXBlc2NyaXB0IGhhcHB5XG4gIGNvbnN0IGZpbmRNYXBCb3VuZHNJZkNlbnRlcmVkID0gbGF5ZXJzID0+IHtcbiAgICBjb25zdCBib3VuZHMgPSBvcHRpb25zLmNlbnRlck1hcCAmJiBmaW5kTWFwQm91bmRzKGxheWVycyk7XG4gICAgcmV0dXJuIGJvdW5kcyA/IGJvdW5kcyA6IHVuZGVmaW5lZDtcbiAgfTtcblxuICByZXR1cm4gY29tcG9zZV8oW1xuICAgIHBpY2tfKCd2aXNTdGF0ZScpKFxuICAgICAgYXBwbHlfKHZpc1N0YXRlVXBkYXRlVmlzRGF0YVVwZGF0ZXIsIHtcbiAgICAgICAgZGF0YXNldHMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGNvbmZpZzogcGFyc2VkQ29uZmlnXG4gICAgICB9KVxuICAgICksXG5cbiAgICBpZl8oaW5mbywgcGlja18oJ3Zpc1N0YXRlJykoYXBwbHlfKHNldE1hcEluZm9VcGRhdGVyLCB7aW5mb30pKSksXG5cbiAgICB3aXRoXygoe3Zpc1N0YXRlfSkgPT5cbiAgICAgIHBpY2tfKCdtYXBTdGF0ZScpKFxuICAgICAgICBhcHBseV8oXG4gICAgICAgICAgc3RhdGVNYXBDb25maWdVcGRhdGVyLFxuICAgICAgICAgIHBheWxvYWRfKHtcbiAgICAgICAgICAgIGNvbmZpZzogcGFyc2VkQ29uZmlnLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kczogZmluZE1hcEJvdW5kc0lmQ2VudGVyZWQoZmlsdGVyTmV3bHlBZGRlZExheWVycyh2aXNTdGF0ZS5sYXllcnMpKVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApLFxuXG4gICAgcGlja18oJ21hcFN0eWxlJykoYXBwbHlfKHN0eWxlTWFwQ29uZmlnVXBkYXRlciwgcGF5bG9hZF8oe2NvbmZpZzogcGFyc2VkQ29uZmlnLCBvcHRpb25zfSkpKSxcblxuICAgIHBpY2tfKCd1aVN0YXRlJykoYXBwbHlfKHVpU3RhdGVMb2FkRmlsZXNTdWNjZXNzVXBkYXRlciwgcGF5bG9hZF8obnVsbCkpKSxcblxuICAgIHBpY2tfKCd1aVN0YXRlJykoYXBwbHlfKHRvZ2dsZU1vZGFsVXBkYXRlciwgcGF5bG9hZF8obnVsbCkpKSxcblxuICAgIHBpY2tfKCd1aVN0YXRlJykobWVyZ2VfKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3JlYWRPbmx5JykgPyB7cmVhZE9ubHk6IG9wdGlvbnMucmVhZE9ubHl9IDoge30pKVxuICBdKShzdGF0ZSk7XG59O1xuXG4vKipcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2NvbWJpbmVkLXVwZGF0ZXJzJykubG9hZEZpbGVzU3VjY2Vzc1VwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZXNTdWNjZXNzVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIC8vIHN0aWxsIG1vcmUgdG8gbG9hZFxuICBjb25zdCBwYXlsb2FkcyA9IGZpbGVzVG9EYXRhUGF5bG9hZChhY3Rpb24ucmVzdWx0KTtcbiAgY29uc3QgbmV4dFN0YXRlID0gY29tcG9zZV8oW1xuICAgIHBpY2tfKCd2aXNTdGF0ZScpKFxuICAgICAgbWVyZ2VfKHtcbiAgICAgICAgZmlsZUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBmaWxlTG9hZGluZ1Byb2dyZXNzOiB7fVxuICAgICAgfSlcbiAgICApXG4gIF0pKHN0YXRlKTtcbiAgLy8gbWFrZSBtdWx0aXBsZSBhZGQgZGF0YSB0byBtYXAgY2FsbHNcbiAgY29uc3Qgc3RhdGVXaXRoRGF0YSA9IGNvbXBvc2VfKHBheWxvYWRzLm1hcChwID0+IGFwcGx5XyhhZGREYXRhVG9NYXBVcGRhdGVyLCBwYXlsb2FkXyhwKSkpKShcbiAgICBuZXh0U3RhdGVcbiAgKTtcbiAgcmV0dXJuIHN0YXRlV2l0aERhdGE7XG59O1xuXG5leHBvcnQgY29uc3QgYWRkRGF0YVRvTWFwQ29tcG9zZWQgPSBhZGREYXRhVG9NYXBVcGRhdGVyO1xuIl19