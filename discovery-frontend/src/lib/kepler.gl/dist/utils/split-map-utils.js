"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addNewLayersToSplitMap = addNewLayersToSplitMap;
exports.removeLayerFromSplitMaps = removeLayerFromSplitMaps;
exports.getInitialMapLayersForSplitMap = getInitialMapLayersForSplitMap;
exports.computeSplitMapLayers = computeSplitMapLayers;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return (0, _typeof2["default"])(key) === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if ((0, _typeof2["default"])(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if ((0, _typeof2["default"])(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Add new layers to both existing maps
 * @param {Object} splitMaps
 * @param {Object|Array<Object>} layers
 * @returns {Array<Object>} new splitMaps
 */
function addNewLayersToSplitMap(splitMaps, layers) {
  var newLayers = Array.isArray(layers) ? layers : [layers];

  if (!splitMaps.length || !newLayers.length) {
    return splitMaps;
  } // add new layer to both maps,
  // don't override, if layer.id is already in splitMaps


  return splitMaps.map(function (settings) {
    return _objectSpread(_objectSpread({}, settings), {}, {
      layers: _objectSpread(_objectSpread({}, settings.layers), newLayers.reduce(function (accu, newLayer) {
        return (// @ts-ignore
          newLayer.id in settings.layers || !newLayer.config.isVisible ? accu : _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, newLayer.id, newLayer.config.isVisible))
        );
      }, {}))
    });
  });
}
/**
 * Remove an existing layer from split map settings
 * @param {Object} splitMaps
 * @param {Object} layer
 * @returns {Object} Maps of custom layer objects
 */


function removeLayerFromSplitMaps(splitMaps, layer) {
  if (!splitMaps.length) {
    return splitMaps;
  }

  return splitMaps.map(function (settings) {
    // eslint-disable-next-line no-unused-vars
    var _settings$layers = settings.layers,
        _layer$id = layer.id,
        _ = _settings$layers[_layer$id],
        newLayers = (0, _objectWithoutProperties2["default"])(_settings$layers, [_layer$id].map(_toPropertyKey));
    return _objectSpread(_objectSpread({}, settings), {}, {
      layers: newLayers
    });
  });
}
/**
 * This method will compute the default maps layer settings
 * based on the current layers visibility
 * @param {Array<Object>} layers
 * @returns {Array<Object>} layer visibility for each panel
 */


function getInitialMapLayersForSplitMap(layers) {
  return layers.filter(function (layer) {
    return layer.config.isVisible;
  }).reduce(function (newLayers, currentLayer) {
    return _objectSpread(_objectSpread({}, newLayers), {}, (0, _defineProperty2["default"])({}, currentLayer.id, currentLayer.config.isVisible));
  }, {});
}
/**
 * This method will get default splitMap settings based on existing layers
 * @param {Array<Object>} layers
 * @returns {Array<Object>} split map settings
 */


function computeSplitMapLayers(layers) {
  var mapLayers = getInitialMapLayersForSplitMap(layers);
  return [{
    layers: mapLayers
  }, {
    layers: (0, _lodash["default"])(mapLayers)
  }];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zcGxpdC1tYXAtdXRpbHMuanMiXSwibmFtZXMiOlsiYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcCIsInNwbGl0TWFwcyIsImxheWVycyIsIm5ld0xheWVycyIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm1hcCIsInNldHRpbmdzIiwicmVkdWNlIiwiYWNjdSIsIm5ld0xheWVyIiwiaWQiLCJjb25maWciLCJpc1Zpc2libGUiLCJyZW1vdmVMYXllckZyb21TcGxpdE1hcHMiLCJsYXllciIsIl8iLCJnZXRJbml0aWFsTWFwTGF5ZXJzRm9yU3BsaXRNYXAiLCJmaWx0ZXIiLCJjdXJyZW50TGF5ZXIiLCJjb21wdXRlU3BsaXRNYXBMYXllcnMiLCJtYXBMYXllcnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7Ozs7Ozs7OztBQUVBOzs7Ozs7QUFNTyxTQUFTQSxzQkFBVCxDQUFnQ0MsU0FBaEMsRUFBMkNDLE1BQTNDLEVBQW1EO0FBQ3hELE1BQU1DLFNBQVMsR0FBR0MsS0FBSyxDQUFDQyxPQUFOLENBQWNILE1BQWQsSUFBd0JBLE1BQXhCLEdBQWlDLENBQUNBLE1BQUQsQ0FBbkQ7O0FBRUEsTUFBSSxDQUFDRCxTQUFTLENBQUNLLE1BQVgsSUFBcUIsQ0FBQ0gsU0FBUyxDQUFDRyxNQUFwQyxFQUE0QztBQUMxQyxXQUFPTCxTQUFQO0FBQ0QsR0FMdUQsQ0FPeEQ7QUFDQTs7O0FBQ0EsU0FBT0EsU0FBUyxDQUFDTSxHQUFWLENBQWMsVUFBQUMsUUFBUTtBQUFBLDJDQUN4QkEsUUFEd0I7QUFFM0JOLE1BQUFBLE1BQU0sa0NBQ0RNLFFBQVEsQ0FBQ04sTUFEUixHQUVEQyxTQUFTLENBQUNNLE1BQVYsQ0FDRCxVQUFDQyxJQUFELEVBQU9DLFFBQVA7QUFBQSxlQUNFO0FBQ0FBLFVBQUFBLFFBQVEsQ0FBQ0MsRUFBVCxJQUFlSixRQUFRLENBQUNOLE1BQXhCLElBQWtDLENBQUNTLFFBQVEsQ0FBQ0UsTUFBVCxDQUFnQkMsU0FBbkQsR0FDSUosSUFESixtQ0FHU0EsSUFIVCw0Q0FJT0MsUUFBUSxDQUFDQyxFQUpoQixFQUlxQkQsUUFBUSxDQUFDRSxNQUFULENBQWdCQyxTQUpyQztBQUZGO0FBQUEsT0FEQyxFQVNELEVBVEMsQ0FGQztBQUZxQjtBQUFBLEdBQXRCLENBQVA7QUFpQkQ7QUFFRDs7Ozs7Ozs7QUFNTyxTQUFTQyx3QkFBVCxDQUFrQ2QsU0FBbEMsRUFBNkNlLEtBQTdDLEVBQW9EO0FBQ3pELE1BQUksQ0FBQ2YsU0FBUyxDQUFDSyxNQUFmLEVBQXVCO0FBQ3JCLFdBQU9MLFNBQVA7QUFDRDs7QUFDRCxTQUFPQSxTQUFTLENBQUNNLEdBQVYsQ0FBYyxVQUFBQyxRQUFRLEVBQUk7QUFDL0I7QUFEK0IsMkJBRU9BLFFBQVEsQ0FBQ04sTUFGaEI7QUFBQSxvQkFFdkJjLEtBQUssQ0FBQ0osRUFGaUI7QUFBQSxRQUVaSyxDQUZZO0FBQUEsUUFFTmQsU0FGTTtBQUcvQiwyQ0FDS0ssUUFETDtBQUVFTixNQUFBQSxNQUFNLEVBQUVDO0FBRlY7QUFJRCxHQVBNLENBQVA7QUFRRDtBQUVEOzs7Ozs7OztBQU1PLFNBQVNlLDhCQUFULENBQXdDaEIsTUFBeEMsRUFBZ0Q7QUFDckQsU0FBT0EsTUFBTSxDQUNWaUIsTUFESSxDQUNHLFVBQUFILEtBQUs7QUFBQSxXQUFJQSxLQUFLLENBQUNILE1BQU4sQ0FBYUMsU0FBakI7QUFBQSxHQURSLEVBRUpMLE1BRkksQ0FHSCxVQUFDTixTQUFELEVBQVlpQixZQUFaO0FBQUEsMkNBQ0tqQixTQURMLDRDQUVHaUIsWUFBWSxDQUFDUixFQUZoQixFQUVxQlEsWUFBWSxDQUFDUCxNQUFiLENBQW9CQyxTQUZ6QztBQUFBLEdBSEcsRUFPSCxFQVBHLENBQVA7QUFTRDtBQUVEOzs7Ozs7O0FBS08sU0FBU08scUJBQVQsQ0FBK0JuQixNQUEvQixFQUF1QztBQUM1QyxNQUFNb0IsU0FBUyxHQUFHSiw4QkFBOEIsQ0FBQ2hCLE1BQUQsQ0FBaEQ7QUFFQSxTQUFPLENBQUM7QUFBQ0EsSUFBQUEsTUFBTSxFQUFFb0I7QUFBVCxHQUFELEVBQXNCO0FBQUNwQixJQUFBQSxNQUFNLEVBQUUsd0JBQVVvQixTQUFWO0FBQVQsR0FBdEIsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJztcblxuLyoqXG4gKiBBZGQgbmV3IGxheWVycyB0byBib3RoIGV4aXN0aW5nIG1hcHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcGxpdE1hcHNcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5PE9iamVjdD59IGxheWVyc1xuICogQHJldHVybnMge0FycmF5PE9iamVjdD59IG5ldyBzcGxpdE1hcHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZE5ld0xheWVyc1RvU3BsaXRNYXAoc3BsaXRNYXBzLCBsYXllcnMpIHtcbiAgY29uc3QgbmV3TGF5ZXJzID0gQXJyYXkuaXNBcnJheShsYXllcnMpID8gbGF5ZXJzIDogW2xheWVyc107XG5cbiAgaWYgKCFzcGxpdE1hcHMubGVuZ3RoIHx8ICFuZXdMYXllcnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHNwbGl0TWFwcztcbiAgfVxuXG4gIC8vIGFkZCBuZXcgbGF5ZXIgdG8gYm90aCBtYXBzLFxuICAvLyBkb24ndCBvdmVycmlkZSwgaWYgbGF5ZXIuaWQgaXMgYWxyZWFkeSBpbiBzcGxpdE1hcHNcbiAgcmV0dXJuIHNwbGl0TWFwcy5tYXAoc2V0dGluZ3MgPT4gKHtcbiAgICAuLi5zZXR0aW5ncyxcbiAgICBsYXllcnM6IHtcbiAgICAgIC4uLnNldHRpbmdzLmxheWVycyxcbiAgICAgIC4uLm5ld0xheWVycy5yZWR1Y2UoXG4gICAgICAgIChhY2N1LCBuZXdMYXllcikgPT5cbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgbmV3TGF5ZXIuaWQgaW4gc2V0dGluZ3MubGF5ZXJzIHx8ICFuZXdMYXllci5jb25maWcuaXNWaXNpYmxlXG4gICAgICAgICAgICA/IGFjY3VcbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICAgICAgW25ld0xheWVyLmlkXTogbmV3TGF5ZXIuY29uZmlnLmlzVmlzaWJsZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICB7fVxuICAgICAgKVxuICAgIH1cbiAgfSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbiBleGlzdGluZyBsYXllciBmcm9tIHNwbGl0IG1hcCBzZXR0aW5nc1xuICogQHBhcmFtIHtPYmplY3R9IHNwbGl0TWFwc1xuICogQHBhcmFtIHtPYmplY3R9IGxheWVyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBNYXBzIG9mIGN1c3RvbSBsYXllciBvYmplY3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVMYXllckZyb21TcGxpdE1hcHMoc3BsaXRNYXBzLCBsYXllcikge1xuICBpZiAoIXNwbGl0TWFwcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gc3BsaXRNYXBzO1xuICB9XG4gIHJldHVybiBzcGxpdE1hcHMubWFwKHNldHRpbmdzID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBjb25zdCB7W2xheWVyLmlkXTogXywgLi4ubmV3TGF5ZXJzfSA9IHNldHRpbmdzLmxheWVycztcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc2V0dGluZ3MsXG4gICAgICBsYXllcnM6IG5ld0xheWVyc1xuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHdpbGwgY29tcHV0ZSB0aGUgZGVmYXVsdCBtYXBzIGxheWVyIHNldHRpbmdzXG4gKiBiYXNlZCBvbiB0aGUgY3VycmVudCBsYXllcnMgdmlzaWJpbGl0eVxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBsYXllcnNcbiAqIEByZXR1cm5zIHtBcnJheTxPYmplY3Q+fSBsYXllciB2aXNpYmlsaXR5IGZvciBlYWNoIHBhbmVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0aWFsTWFwTGF5ZXJzRm9yU3BsaXRNYXAobGF5ZXJzKSB7XG4gIHJldHVybiBsYXllcnNcbiAgICAuZmlsdGVyKGxheWVyID0+IGxheWVyLmNvbmZpZy5pc1Zpc2libGUpXG4gICAgLnJlZHVjZShcbiAgICAgIChuZXdMYXllcnMsIGN1cnJlbnRMYXllcikgPT4gKHtcbiAgICAgICAgLi4ubmV3TGF5ZXJzLFxuICAgICAgICBbY3VycmVudExheWVyLmlkXTogY3VycmVudExheWVyLmNvbmZpZy5pc1Zpc2libGVcbiAgICAgIH0pLFxuICAgICAge31cbiAgICApO1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHdpbGwgZ2V0IGRlZmF1bHQgc3BsaXRNYXAgc2V0dGluZ3MgYmFzZWQgb24gZXhpc3RpbmcgbGF5ZXJzXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGxheWVyc1xuICogQHJldHVybnMge0FycmF5PE9iamVjdD59IHNwbGl0IG1hcCBzZXR0aW5nc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNwbGl0TWFwTGF5ZXJzKGxheWVycykge1xuICBjb25zdCBtYXBMYXllcnMgPSBnZXRJbml0aWFsTWFwTGF5ZXJzRm9yU3BsaXRNYXAobGF5ZXJzKTtcblxuICByZXR1cm4gW3tsYXllcnM6IG1hcExheWVyc30sIHtsYXllcnM6IGNsb25lRGVlcChtYXBMYXllcnMpfV07XG59XG4iXX0=