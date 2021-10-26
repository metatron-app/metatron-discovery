"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keplerGlInit = exports.receiveMapConfig = exports.resetMapConfig = exports.addDataToMap = void 0;

var _actionTypes = _interopRequireDefault(require("../constants/action-types"));

var _reduxActions = require("redux-actions");

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

/**
 * Add data to kepler.gl reducer, prepare map with preset configuration if config is passed.
 * Kepler.gl provides a handy set of utils to parse data from different formats to the `data` object required in dataset. You rarely need to manually format the data obejct.
 *
 * Use `KeplerGlSchema.getConfigToSave` to generate a json blob of the currents instance config.
 * The config object value will always have higher precedence than the options properties.
 *
 * Kepler.gl uses `dataId` in the config to match with loaded dataset. If you pass a config object, you need
 * to match the `info.id` of your dataset to the `dataId` in each `layer`, `filter` and `interactionConfig.tooltips.fieldsToShow`
 *
 * @memberof main
 * @param {Object} data
 * @param {Array<Object>|Object} data.datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param {Object} data.datasets.info -info of a dataset
 * @param {string} data.datasets.info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
 * @param {string} data.datasets.info.label - A display name of this dataset
 * @param {Object} data.datasets.data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
 * @param {Array<Object>} data.datasets.data.fields - ***required** Array of fields,
 * @param {string} data.datasets.data.fields.name - ***required** Name of the field,
 * @param {Array<Array>} data.datasets.data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`
 *
 * @param {Object} data.options
 * @param {boolean} data.options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries.  `options.centerMap` will override `config.mapState` if passed in.
 * @param {boolean} data.options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param {boolean} data.options.keepExistingConfig whether to keep exiting map data and associated layer filter  interaction config `default: false`.
 * @param {Object} data.config this object will contain the full kepler.gl instance configuration {mapState, mapStyle, visState}
 * @public
 * @example
 *
 * // app.js
 * import {addDataToMap} from 'kepler.gl/actions';
 *
 * const sampleTripData = {
 *  fields: [
 *    {name: 'tpep_pickup_datetime', format: 'YYYY-M-D H:m:s', type: 'timestamp'},
 *    {name: 'pickup_longitude', format: '', type: 'real'},
 *    {name: 'pickup_latitude', format: '', type: 'real'}
 *  ],
 *  rows: [
 *    ['2015-01-15 19:05:39 +00:00', -73.99389648, 40.75011063],
 *    ['2015-01-15 19:05:39 +00:00', -73.97642517, 40.73981094],
 *    ['2015-01-15 19:05:40 +00:00', -73.96870422, 40.75424576],
 *  ]
 * };
 *
 * const sampleConfig = {
 *   visState: {
 *     filters: [
 *       {
 *         id: 'me',
 *         dataId: 'test_trip_data',
 *         name: 'tpep_pickup_datetime',
 *         type: 'timeRange',
 *         enlarged: true
 *       }
 *     ]
 *   }
 * }
 *
 * this.props.dispatch(
 *   addDataToMap({
 *     datasets: {
 *       info: {
 *         label: 'Sample Taxi Trips in New York City',
 *         id: 'test_trip_data'
 *       },
 *       data: sampleTripData
 *     },
 *     option: {
 *       centerMap: true,
 *       readOnly: false,
 *       keepExistingConfig: false
 *     },
 *     info: {
 *       title: 'Taro and Blue',
 *       description: 'This is my map'
 *     }
 *     config: sampleConfig
 *   })
 * );
 */
var addDataToMap = (0, _reduxActions.createAction)(_actionTypes["default"].ADD_DATA_TO_MAP, function (data) {
  return data;
});
/**
 * Reset all sub-reducers to its initial state. This can be used to clear out all configuration in the reducer.
 * @memberof main
 * @public
 */

exports.addDataToMap = addDataToMap;
var resetMapConfig = (0, _reduxActions.createAction)(_actionTypes["default"].RESET_MAP_CONFIG);
/**
 * Pass config to kepler.gl instance, prepare the state with preset configs.
 * Calling `KeplerGlSchema.parseSavedConfig` to convert saved config before passing it in is required.
 *
 * You can call `receiveMapConfig` before passing in any data. The reducer will store layer and filter config, waiting for
 * data to come in. When data arrives, you can call `addDataToMap` without passing any config, and the reducer will try to match
 * preloaded configs. This behavior is designed to allow asynchronous data loading.
 *
 * It is also useful when you want to prepare the kepler.gl instance with some preset layer and filter settings.
 * **Note** Sequence is important, `receiveMapConfig` needs to be called __before__ data is loaded. Currently kepler.gl doesn't allow calling `receiveMapConfig` after data is loaded.
 * It will reset current configuration first then apply config to it.
 * @memberof main
 * @param {Object} config - ***required** The Config Object
 * @param {Object} options - ***optional** The Option object
 * @param {boolean} options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries
 * @param {boolean} options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param {boolean} options.keepExistingConfig whether to keep exiting layer filter and interaction config `default: false`.
 * @param {boolean} options.autoCreateLayers whether to automatically create layers based on dataset columns `default: true`.
 * @public
 * @example
 * import {receiveMapConfig} from 'kepler.gl/actions';
 * import KeplerGlSchema from 'kepler.gl/schemas';
 *
 * const parsedConfig = KeplerGlSchema.parseSavedConfig(config);
 * this.props.dispatch(receiveMapConfig(parsedConfig));
 */

exports.resetMapConfig = resetMapConfig;
var receiveMapConfig = (0, _reduxActions.createAction)(_actionTypes["default"].RECEIVE_MAP_CONFIG, function (config, options) {
  return {
    config: config,
    options: options
  };
});
/**
 * Initialize kepler.gl reducer. It is used to pass in `mapboxApiAccessToken` to `mapStyle` reducer.
 * @memberof main
 * @param {object} payload
 * @param payload.mapboxApiAccessToken - mapboxApiAccessToken to be saved to mapStyle reducer
 * @param payload.mapboxApiUrl - mapboxApiUrl to be saved to mapStyle reducer.
 * @param payload.mapStylesReplaceDefault - mapStylesReplaceDefault to be saved to mapStyle reducer
 * @param payload.initialUiState - initial ui state
 * @type {typeof import('./actions').keplerGlInit}
 * @public
 */

exports.receiveMapConfig = receiveMapConfig;
var keplerGlInit = (0, _reduxActions.createAction)(_actionTypes["default"].INIT, // @ts-ignore
function (payload) {
  return payload;
});
/**
 * This declaration is needed to group actions in docs
 */

/**
 * Main kepler.gl actions, these actions handles loading data and config into kepler.gl reducer. These actions
 * is listened by all subreducers,
 * @public
 */

/* eslint-disable no-unused-vars */
// @ts-ignore

exports.keplerGlInit = keplerGlInit;
var main = null;
/* eslint-enable no-unused-vars */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zL2FjdGlvbnMuanMiXSwibmFtZXMiOlsiYWRkRGF0YVRvTWFwIiwiQWN0aW9uVHlwZXMiLCJBRERfREFUQV9UT19NQVAiLCJkYXRhIiwicmVzZXRNYXBDb25maWciLCJSRVNFVF9NQVBfQ09ORklHIiwicmVjZWl2ZU1hcENvbmZpZyIsIlJFQ0VJVkVfTUFQX0NPTkZJRyIsImNvbmZpZyIsIm9wdGlvbnMiLCJrZXBsZXJHbEluaXQiLCJJTklUIiwicGF5bG9hZCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9GTyxJQUFNQSxZQUFZLEdBQUcsZ0NBQWFDLHdCQUFZQyxlQUF6QixFQUEwQyxVQUFBQyxJQUFJO0FBQUEsU0FBSUEsSUFBSjtBQUFBLENBQTlDLENBQXJCO0FBRVA7Ozs7Ozs7QUFLTyxJQUFNQyxjQUFjLEdBQUcsZ0NBQWFILHdCQUFZSSxnQkFBekIsQ0FBdkI7QUFFUDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJPLElBQU1DLGdCQUFnQixHQUFHLGdDQUFhTCx3QkFBWU0sa0JBQXpCLEVBQTZDLFVBQUNDLE1BQUQsRUFBU0MsT0FBVDtBQUFBLFNBQXNCO0FBQ2pHRCxJQUFBQSxNQUFNLEVBQU5BLE1BRGlHO0FBRWpHQyxJQUFBQSxPQUFPLEVBQVBBO0FBRmlHLEdBQXRCO0FBQUEsQ0FBN0MsQ0FBekI7QUFLUDs7Ozs7Ozs7Ozs7OztBQVdPLElBQU1DLFlBQVksR0FBRyxnQ0FDMUJULHdCQUFZVSxJQURjLEVBRTFCO0FBQ0EsVUFBQUMsT0FBTztBQUFBLFNBQUlBLE9BQUo7QUFBQSxDQUhtQixDQUFyQjtBQU1QOzs7O0FBR0E7Ozs7OztBQUtBO0FBQ0E7OztBQUNBLElBQU1DLElBQUksR0FBRyxJQUFiO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgQWN0aW9uVHlwZXMgZnJvbSAnY29uc3RhbnRzL2FjdGlvbi10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZUFjdGlvbn0gZnJvbSAncmVkdXgtYWN0aW9ucyc7XG5cbi8qKlxuICogQWRkIGRhdGEgdG8ga2VwbGVyLmdsIHJlZHVjZXIsIHByZXBhcmUgbWFwIHdpdGggcHJlc2V0IGNvbmZpZ3VyYXRpb24gaWYgY29uZmlnIGlzIHBhc3NlZC5cbiAqIEtlcGxlci5nbCBwcm92aWRlcyBhIGhhbmR5IHNldCBvZiB1dGlscyB0byBwYXJzZSBkYXRhIGZyb20gZGlmZmVyZW50IGZvcm1hdHMgdG8gdGhlIGBkYXRhYCBvYmplY3QgcmVxdWlyZWQgaW4gZGF0YXNldC4gWW91IHJhcmVseSBuZWVkIHRvIG1hbnVhbGx5IGZvcm1hdCB0aGUgZGF0YSBvYmVqY3QuXG4gKlxuICogVXNlIGBLZXBsZXJHbFNjaGVtYS5nZXRDb25maWdUb1NhdmVgIHRvIGdlbmVyYXRlIGEganNvbiBibG9iIG9mIHRoZSBjdXJyZW50cyBpbnN0YW5jZSBjb25maWcuXG4gKiBUaGUgY29uZmlnIG9iamVjdCB2YWx1ZSB3aWxsIGFsd2F5cyBoYXZlIGhpZ2hlciBwcmVjZWRlbmNlIHRoYW4gdGhlIG9wdGlvbnMgcHJvcGVydGllcy5cbiAqXG4gKiBLZXBsZXIuZ2wgdXNlcyBgZGF0YUlkYCBpbiB0aGUgY29uZmlnIHRvIG1hdGNoIHdpdGggbG9hZGVkIGRhdGFzZXQuIElmIHlvdSBwYXNzIGEgY29uZmlnIG9iamVjdCwgeW91IG5lZWRcbiAqIHRvIG1hdGNoIHRoZSBgaW5mby5pZGAgb2YgeW91ciBkYXRhc2V0IHRvIHRoZSBgZGF0YUlkYCBpbiBlYWNoIGBsYXllcmAsIGBmaWx0ZXJgIGFuZCBgaW50ZXJhY3Rpb25Db25maWcudG9vbHRpcHMuZmllbGRzVG9TaG93YFxuICpcbiAqIEBtZW1iZXJvZiBtYWluXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fE9iamVjdH0gZGF0YS5kYXRhc2V0cyAtICoqKnJlcXVpcmVkKiogZGF0YXNldHMgY2FuIGJlIGEgZGF0YXNldCBvciBhbiBhcnJheSBvZiBkYXRhc2V0c1xuICogRWFjaCBkYXRhc2V0IG9iamVjdCBuZWVkcyB0byBoYXZlIGBpbmZvYCBhbmQgYGRhdGFgIHByb3BlcnR5LlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEuZGF0YXNldHMuaW5mbyAtaW5mbyBvZiBhIGRhdGFzZXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhLmRhdGFzZXRzLmluZm8uaWQgLSBpZCBvZiB0aGlzIGRhdGFzZXQuIElmIGNvbmZpZyBpcyBkZWZpbmVkLCBgaWRgIHNob3VsZCBtYXRjaGVzIHRoZSBgZGF0YUlkYCBpbiBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YS5kYXRhc2V0cy5pbmZvLmxhYmVsIC0gQSBkaXNwbGF5IG5hbWUgb2YgdGhpcyBkYXRhc2V0XG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YS5kYXRhc2V0cy5kYXRhIC0gKioqcmVxdWlyZWQqKiBUaGUgZGF0YSBvYmplY3QsIGluIGEgdGFidWxhciBmb3JtYXQgd2l0aCAyIHByb3BlcnRpZXMgYGZpZWxkc2AgYW5kIGByb3dzYFxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBkYXRhLmRhdGFzZXRzLmRhdGEuZmllbGRzIC0gKioqcmVxdWlyZWQqKiBBcnJheSBvZiBmaWVsZHMsXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YS5kYXRhc2V0cy5kYXRhLmZpZWxkcy5uYW1lIC0gKioqcmVxdWlyZWQqKiBOYW1lIG9mIHRoZSBmaWVsZCxcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk+fSBkYXRhLmRhdGFzZXRzLmRhdGEucm93cyAtICoqKnJlcXVpcmVkKiogQXJyYXkgb2Ygcm93cywgaW4gYSB0YWJ1bGFyIGZvcm1hdCB3aXRoIGBmaWVsZHNgIGFuZCBgcm93c2BcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YS5vcHRpb25zXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRhdGEub3B0aW9ucy5jZW50ZXJNYXAgYGRlZmF1bHQ6IHRydWVgIGlmIGBjZW50ZXJNYXBgIGlzIHNldCB0byBgdHJ1ZWAga2VwbGVyLmdsIHdpbGxcbiAqIHBsYWNlIHRoZSBtYXAgdmlldyB3aXRoaW4gdGhlIGRhdGEgcG9pbnRzIGJvdW5kYXJpZXMuICBgb3B0aW9ucy5jZW50ZXJNYXBgIHdpbGwgb3ZlcnJpZGUgYGNvbmZpZy5tYXBTdGF0ZWAgaWYgcGFzc2VkIGluLlxuICogQHBhcmFtIHtib29sZWFufSBkYXRhLm9wdGlvbnMucmVhZE9ubHkgYGRlZmF1bHQ6IGZhbHNlYCBpZiBgcmVhZE9ubHlgIGlzIHNldCB0byBgdHJ1ZWBcbiAqIHRoZSBsZWZ0IHNldHRpbmcgcGFuZWwgd2lsbCBiZSBoaWRkZW5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGF0YS5vcHRpb25zLmtlZXBFeGlzdGluZ0NvbmZpZyB3aGV0aGVyIHRvIGtlZXAgZXhpdGluZyBtYXAgZGF0YSBhbmQgYXNzb2NpYXRlZCBsYXllciBmaWx0ZXIgIGludGVyYWN0aW9uIGNvbmZpZyBgZGVmYXVsdDogZmFsc2VgLlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEuY29uZmlnIHRoaXMgb2JqZWN0IHdpbGwgY29udGFpbiB0aGUgZnVsbCBrZXBsZXIuZ2wgaW5zdGFuY2UgY29uZmlndXJhdGlvbiB7bWFwU3RhdGUsIG1hcFN0eWxlLCB2aXNTdGF0ZX1cbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKlxuICogLy8gYXBwLmpzXG4gKiBpbXBvcnQge2FkZERhdGFUb01hcH0gZnJvbSAna2VwbGVyLmdsL2FjdGlvbnMnO1xuICpcbiAqIGNvbnN0IHNhbXBsZVRyaXBEYXRhID0ge1xuICogIGZpZWxkczogW1xuICogICAge25hbWU6ICd0cGVwX3BpY2t1cF9kYXRldGltZScsIGZvcm1hdDogJ1lZWVktTS1EIEg6bTpzJywgdHlwZTogJ3RpbWVzdGFtcCd9LFxuICogICAge25hbWU6ICdwaWNrdXBfbG9uZ2l0dWRlJywgZm9ybWF0OiAnJywgdHlwZTogJ3JlYWwnfSxcbiAqICAgIHtuYW1lOiAncGlja3VwX2xhdGl0dWRlJywgZm9ybWF0OiAnJywgdHlwZTogJ3JlYWwnfVxuICogIF0sXG4gKiAgcm93czogW1xuICogICAgWycyMDE1LTAxLTE1IDE5OjA1OjM5ICswMDowMCcsIC03My45OTM4OTY0OCwgNDAuNzUwMTEwNjNdLFxuICogICAgWycyMDE1LTAxLTE1IDE5OjA1OjM5ICswMDowMCcsIC03My45NzY0MjUxNywgNDAuNzM5ODEwOTRdLFxuICogICAgWycyMDE1LTAxLTE1IDE5OjA1OjQwICswMDowMCcsIC03My45Njg3MDQyMiwgNDAuNzU0MjQ1NzZdLFxuICogIF1cbiAqIH07XG4gKlxuICogY29uc3Qgc2FtcGxlQ29uZmlnID0ge1xuICogICB2aXNTdGF0ZToge1xuICogICAgIGZpbHRlcnM6IFtcbiAqICAgICAgIHtcbiAqICAgICAgICAgaWQ6ICdtZScsXG4gKiAgICAgICAgIGRhdGFJZDogJ3Rlc3RfdHJpcF9kYXRhJyxcbiAqICAgICAgICAgbmFtZTogJ3RwZXBfcGlja3VwX2RhdGV0aW1lJyxcbiAqICAgICAgICAgdHlwZTogJ3RpbWVSYW5nZScsXG4gKiAgICAgICAgIGVubGFyZ2VkOiB0cnVlXG4gKiAgICAgICB9XG4gKiAgICAgXVxuICogICB9XG4gKiB9XG4gKlxuICogdGhpcy5wcm9wcy5kaXNwYXRjaChcbiAqICAgYWRkRGF0YVRvTWFwKHtcbiAqICAgICBkYXRhc2V0czoge1xuICogICAgICAgaW5mbzoge1xuICogICAgICAgICBsYWJlbDogJ1NhbXBsZSBUYXhpIFRyaXBzIGluIE5ldyBZb3JrIENpdHknLFxuICogICAgICAgICBpZDogJ3Rlc3RfdHJpcF9kYXRhJ1xuICogICAgICAgfSxcbiAqICAgICAgIGRhdGE6IHNhbXBsZVRyaXBEYXRhXG4gKiAgICAgfSxcbiAqICAgICBvcHRpb246IHtcbiAqICAgICAgIGNlbnRlck1hcDogdHJ1ZSxcbiAqICAgICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAqICAgICAgIGtlZXBFeGlzdGluZ0NvbmZpZzogZmFsc2VcbiAqICAgICB9LFxuICogICAgIGluZm86IHtcbiAqICAgICAgIHRpdGxlOiAnVGFybyBhbmQgQmx1ZScsXG4gKiAgICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgaXMgbXkgbWFwJ1xuICogICAgIH1cbiAqICAgICBjb25maWc6IHNhbXBsZUNvbmZpZ1xuICogICB9KVxuICogKTtcbiAqL1xuZXhwb3J0IGNvbnN0IGFkZERhdGFUb01hcCA9IGNyZWF0ZUFjdGlvbihBY3Rpb25UeXBlcy5BRERfREFUQV9UT19NQVAsIGRhdGEgPT4gZGF0YSk7XG5cbi8qKlxuICogUmVzZXQgYWxsIHN1Yi1yZWR1Y2VycyB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gVGhpcyBjYW4gYmUgdXNlZCB0byBjbGVhciBvdXQgYWxsIGNvbmZpZ3VyYXRpb24gaW4gdGhlIHJlZHVjZXIuXG4gKiBAbWVtYmVyb2YgbWFpblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgcmVzZXRNYXBDb25maWcgPSBjcmVhdGVBY3Rpb24oQWN0aW9uVHlwZXMuUkVTRVRfTUFQX0NPTkZJRyk7XG5cbi8qKlxuICogUGFzcyBjb25maWcgdG8ga2VwbGVyLmdsIGluc3RhbmNlLCBwcmVwYXJlIHRoZSBzdGF0ZSB3aXRoIHByZXNldCBjb25maWdzLlxuICogQ2FsbGluZyBgS2VwbGVyR2xTY2hlbWEucGFyc2VTYXZlZENvbmZpZ2AgdG8gY29udmVydCBzYXZlZCBjb25maWcgYmVmb3JlIHBhc3NpbmcgaXQgaW4gaXMgcmVxdWlyZWQuXG4gKlxuICogWW91IGNhbiBjYWxsIGByZWNlaXZlTWFwQ29uZmlnYCBiZWZvcmUgcGFzc2luZyBpbiBhbnkgZGF0YS4gVGhlIHJlZHVjZXIgd2lsbCBzdG9yZSBsYXllciBhbmQgZmlsdGVyIGNvbmZpZywgd2FpdGluZyBmb3JcbiAqIGRhdGEgdG8gY29tZSBpbi4gV2hlbiBkYXRhIGFycml2ZXMsIHlvdSBjYW4gY2FsbCBgYWRkRGF0YVRvTWFwYCB3aXRob3V0IHBhc3NpbmcgYW55IGNvbmZpZywgYW5kIHRoZSByZWR1Y2VyIHdpbGwgdHJ5IHRvIG1hdGNoXG4gKiBwcmVsb2FkZWQgY29uZmlncy4gVGhpcyBiZWhhdmlvciBpcyBkZXNpZ25lZCB0byBhbGxvdyBhc3luY2hyb25vdXMgZGF0YSBsb2FkaW5nLlxuICpcbiAqIEl0IGlzIGFsc28gdXNlZnVsIHdoZW4geW91IHdhbnQgdG8gcHJlcGFyZSB0aGUga2VwbGVyLmdsIGluc3RhbmNlIHdpdGggc29tZSBwcmVzZXQgbGF5ZXIgYW5kIGZpbHRlciBzZXR0aW5ncy5cbiAqICoqTm90ZSoqIFNlcXVlbmNlIGlzIGltcG9ydGFudCwgYHJlY2VpdmVNYXBDb25maWdgIG5lZWRzIHRvIGJlIGNhbGxlZCBfX2JlZm9yZV9fIGRhdGEgaXMgbG9hZGVkLiBDdXJyZW50bHkga2VwbGVyLmdsIGRvZXNuJ3QgYWxsb3cgY2FsbGluZyBgcmVjZWl2ZU1hcENvbmZpZ2AgYWZ0ZXIgZGF0YSBpcyBsb2FkZWQuXG4gKiBJdCB3aWxsIHJlc2V0IGN1cnJlbnQgY29uZmlndXJhdGlvbiBmaXJzdCB0aGVuIGFwcGx5IGNvbmZpZyB0byBpdC5cbiAqIEBtZW1iZXJvZiBtYWluXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gKioqcmVxdWlyZWQqKiBUaGUgQ29uZmlnIE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSAqKipvcHRpb25hbCoqIFRoZSBPcHRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuY2VudGVyTWFwIGBkZWZhdWx0OiB0cnVlYCBpZiBgY2VudGVyTWFwYCBpcyBzZXQgdG8gYHRydWVgIGtlcGxlci5nbCB3aWxsXG4gKiBwbGFjZSB0aGUgbWFwIHZpZXcgd2l0aGluIHRoZSBkYXRhIHBvaW50cyBib3VuZGFyaWVzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMucmVhZE9ubHkgYGRlZmF1bHQ6IGZhbHNlYCBpZiBgcmVhZE9ubHlgIGlzIHNldCB0byBgdHJ1ZWBcbiAqIHRoZSBsZWZ0IHNldHRpbmcgcGFuZWwgd2lsbCBiZSBoaWRkZW5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5rZWVwRXhpc3RpbmdDb25maWcgd2hldGhlciB0byBrZWVwIGV4aXRpbmcgbGF5ZXIgZmlsdGVyIGFuZCBpbnRlcmFjdGlvbiBjb25maWcgYGRlZmF1bHQ6IGZhbHNlYC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hdXRvQ3JlYXRlTGF5ZXJzIHdoZXRoZXIgdG8gYXV0b21hdGljYWxseSBjcmVhdGUgbGF5ZXJzIGJhc2VkIG9uIGRhdGFzZXQgY29sdW1ucyBgZGVmYXVsdDogdHJ1ZWAuXG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHtyZWNlaXZlTWFwQ29uZmlnfSBmcm9tICdrZXBsZXIuZ2wvYWN0aW9ucyc7XG4gKiBpbXBvcnQgS2VwbGVyR2xTY2hlbWEgZnJvbSAna2VwbGVyLmdsL3NjaGVtYXMnO1xuICpcbiAqIGNvbnN0IHBhcnNlZENvbmZpZyA9IEtlcGxlckdsU2NoZW1hLnBhcnNlU2F2ZWRDb25maWcoY29uZmlnKTtcbiAqIHRoaXMucHJvcHMuZGlzcGF0Y2gocmVjZWl2ZU1hcENvbmZpZyhwYXJzZWRDb25maWcpKTtcbiAqL1xuZXhwb3J0IGNvbnN0IHJlY2VpdmVNYXBDb25maWcgPSBjcmVhdGVBY3Rpb24oQWN0aW9uVHlwZXMuUkVDRUlWRV9NQVBfQ09ORklHLCAoY29uZmlnLCBvcHRpb25zKSA9PiAoe1xuICBjb25maWcsXG4gIG9wdGlvbnNcbn0pKTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGtlcGxlci5nbCByZWR1Y2VyLiBJdCBpcyB1c2VkIHRvIHBhc3MgaW4gYG1hcGJveEFwaUFjY2Vzc1Rva2VuYCB0byBgbWFwU3R5bGVgIHJlZHVjZXIuXG4gKiBAbWVtYmVyb2YgbWFpblxuICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkLm1hcGJveEFwaUFjY2Vzc1Rva2VuIC0gbWFwYm94QXBpQWNjZXNzVG9rZW4gdG8gYmUgc2F2ZWQgdG8gbWFwU3R5bGUgcmVkdWNlclxuICogQHBhcmFtIHBheWxvYWQubWFwYm94QXBpVXJsIC0gbWFwYm94QXBpVXJsIHRvIGJlIHNhdmVkIHRvIG1hcFN0eWxlIHJlZHVjZXIuXG4gKiBAcGFyYW0gcGF5bG9hZC5tYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCAtIG1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0IHRvIGJlIHNhdmVkIHRvIG1hcFN0eWxlIHJlZHVjZXJcbiAqIEBwYXJhbSBwYXlsb2FkLmluaXRpYWxVaVN0YXRlIC0gaW5pdGlhbCB1aSBzdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vYWN0aW9ucycpLmtlcGxlckdsSW5pdH1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGtlcGxlckdsSW5pdCA9IGNyZWF0ZUFjdGlvbihcbiAgQWN0aW9uVHlwZXMuSU5JVCxcbiAgLy8gQHRzLWlnbm9yZVxuICBwYXlsb2FkID0+IHBheWxvYWRcbik7XG5cbi8qKlxuICogVGhpcyBkZWNsYXJhdGlvbiBpcyBuZWVkZWQgdG8gZ3JvdXAgYWN0aW9ucyBpbiBkb2NzXG4gKi9cbi8qKlxuICogTWFpbiBrZXBsZXIuZ2wgYWN0aW9ucywgdGhlc2UgYWN0aW9ucyBoYW5kbGVzIGxvYWRpbmcgZGF0YSBhbmQgY29uZmlnIGludG8ga2VwbGVyLmdsIHJlZHVjZXIuIFRoZXNlIGFjdGlvbnNcbiAqIGlzIGxpc3RlbmVkIGJ5IGFsbCBzdWJyZWR1Y2VycyxcbiAqIEBwdWJsaWNcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbi8vIEB0cy1pZ25vcmVcbmNvbnN0IG1haW4gPSBudWxsO1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuIl19