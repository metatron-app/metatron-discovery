"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findDefaultLayer = findDefaultLayer;
exports.calculateLayerData = calculateLayerData;
exports.getLayerHoverProp = getLayerHoverProp;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
 * Find default layers from fields
 * @type {typeof import('./layer-utils').findDefaultLayer}
 */
function findDefaultLayer(dataset) {
  var layerClasses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!dataset) {
    return [];
  }

  var layerProps = Object.keys(layerClasses).reduce(function (previous, lc) {
    var result = typeof layerClasses[lc].findDefaultLayerProps === 'function' ? layerClasses[lc].findDefaultLayerProps(dataset, previous) : {
      props: []
    };
    var props = Array.isArray(result) ? result : result.props || [];
    var foundLayers = result.foundLayers || previous;
    return foundLayers.concat(props.map(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        type: lc,
        dataId: dataset.id
      });
    }));
  }, []); // go through all layerProps to create layer

  return layerProps.map(function (props) {
    var layer = new layerClasses[props.type](props);
    return typeof layer.setInitialLayerConfig === 'function' && Array.isArray(dataset.allData) ? layer.setInitialLayerConfig(dataset.allData) : layer;
  });
}
/**
 * calculate layer data based on layer type, col Config,
 * return updated layer if colorDomain, dataMap has changed
 * @type {typeof import('./layer-utils').calculateLayerData}
 */


function calculateLayerData(layer, state, oldLayerData) {
  var type = layer.type;

  if (!type || !layer.hasAllColumns() || !layer.config.dataId) {
    return {
      layer: layer,
      layerData: {}
    };
  }

  var layerData = layer.formatLayerData(state.datasets, oldLayerData);
  return {
    layerData: layerData,
    layer: layer
  };
}
/**
 * Calculate props passed to LayerHoverInfo
 * @type {typeof import('./layer-utils').getLayerHoverProp}
 */


function getLayerHoverProp(_ref) {
  var interactionConfig = _ref.interactionConfig,
      hoverInfo = _ref.hoverInfo,
      layers = _ref.layers,
      layersToRender = _ref.layersToRender,
      datasets = _ref.datasets;

  if (interactionConfig.tooltip.enabled && hoverInfo && hoverInfo.picked) {
    // if anything hovered
    var object = hoverInfo.object,
        overlay = hoverInfo.layer; // deckgl layer to kepler-gl layer

    var layer = layers[overlay.props.idx];

    if (layer.getHoverData && layersToRender[layer.id]) {
      // if layer is visible and have hovered data
      var dataId = layer.config.dataId;
      var _datasets$dataId = datasets[dataId],
          allData = _datasets$dataId.allData,
          fields = _datasets$dataId.fields;
      var data = layer.getHoverData(object, allData);
      var fieldsToShow = interactionConfig.tooltip.config.fieldsToShow[dataId];
      return {
        data: data,
        fields: fields,
        fieldsToShow: fieldsToShow,
        layer: layer
      };
    }
  }

  return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sYXllci11dGlscy5qcyJdLCJuYW1lcyI6WyJmaW5kRGVmYXVsdExheWVyIiwiZGF0YXNldCIsImxheWVyQ2xhc3NlcyIsImxheWVyUHJvcHMiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwicHJldmlvdXMiLCJsYyIsInJlc3VsdCIsImZpbmREZWZhdWx0TGF5ZXJQcm9wcyIsInByb3BzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm91bmRMYXllcnMiLCJjb25jYXQiLCJtYXAiLCJwIiwidHlwZSIsImRhdGFJZCIsImlkIiwibGF5ZXIiLCJzZXRJbml0aWFsTGF5ZXJDb25maWciLCJhbGxEYXRhIiwiY2FsY3VsYXRlTGF5ZXJEYXRhIiwic3RhdGUiLCJvbGRMYXllckRhdGEiLCJoYXNBbGxDb2x1bW5zIiwiY29uZmlnIiwibGF5ZXJEYXRhIiwiZm9ybWF0TGF5ZXJEYXRhIiwiZGF0YXNldHMiLCJnZXRMYXllckhvdmVyUHJvcCIsImludGVyYWN0aW9uQ29uZmlnIiwiaG92ZXJJbmZvIiwibGF5ZXJzIiwibGF5ZXJzVG9SZW5kZXIiLCJ0b29sdGlwIiwiZW5hYmxlZCIsInBpY2tlZCIsIm9iamVjdCIsIm92ZXJsYXkiLCJpZHgiLCJnZXRIb3ZlckRhdGEiLCJmaWVsZHMiLCJkYXRhIiwiZmllbGRzVG9TaG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7O0FBSU8sU0FBU0EsZ0JBQVQsQ0FBMEJDLE9BQTFCLEVBQXNEO0FBQUEsTUFBbkJDLFlBQW1CLHVFQUFKLEVBQUk7O0FBQzNELE1BQUksQ0FBQ0QsT0FBTCxFQUFjO0FBQ1osV0FBTyxFQUFQO0FBQ0Q7O0FBQ0QsTUFBTUUsVUFBVSxHQUFHQyxNQUFNLENBQUNDLElBQVAsQ0FBWUgs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QUlyQixLQUFLLENBQUNzQixZQUFOLElBQXNCUCxjQUFjLENBQUNmLEtBQUssQ0FBQ0QsRUFBUCxDQUF4QyxFQUFvRDtBQUNsRDtBQURrRCxVQUd2Q0QsTUFIdUMsR0FJOUNFLEtBSjhDLENBR2hETyxNQUhnRCxDQUd2Q1QsTUFIdUM7QUFBQSw2QkFLeEJZLFFBQVEsQ0FBQ1osTUFBRCxDQUxnQjtBQUFBLFVBSzNDSSxPQUwyQyxvQkFLM0NBLE9BTDJDO0FBQUEsVUFLbENxQixNQUxrQyxvQkFLbENBLE1BTGtDO0FBTWxELFVBQU1DLElBQUksR0FBR3hCLEtBQUssQ0FBQ3NCLFlBQU4sQ0FBbUJILE1BQW5CLEVBQTJCakIsT0FBM0IsQ0FBYjtBQUNBLFVBQU11QixZQUFZLEdBQUdiLGlCQUFpQixDQUFDSSxPQUFsQixDQUEwQlQsTUFBMUIsQ0FBaUNrQixZQUFqQyxDQUE4QzNCLE1BQTlDLENBQXJCO0FBRUEsYUFBTztBQUNMMEIsUUFBQUEsSUFBSSxFQUFKQSxJQURLO0FBRUxELFFBQUFBLE1BQU0sRUFBTkEsTUFGSztBQUdMRSxRQUFBQSxZQUFZLEVBQVpBLFlBSEs7QUFJTHpCLFFBQUFBLEtBQUssRUFBTEE7QUFKSyxPQUFQO0FBTUQ7QUFDRjs7QUFFRCxTQUFPLElBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogRmluZCBkZWZhdWx0IGxheWVycyBmcm9tIGZpZWxkc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vbGF5ZXItdXRpbHMnKS5maW5kRGVmYXVsdExheWVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZERlZmF1bHRMYXllcihkYXRhc2V0LCBsYXllckNsYXNzZXMgPSB7fSkge1xuICBpZiAoIWRhdGFzZXQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgbGF5ZXJQcm9wcyA9IE9iamVjdC5rZXlzKGxheWVyQ2xhc3NlcykucmVkdWNlKChwcmV2aW91cywgbGMpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPVxuICAgICAgdHlwZW9mIGxheWVyQ2xhc3Nlc1tsY10uZmluZERlZmF1bHRMYXllclByb3BzID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gbGF5ZXJDbGFzc2VzW2xjXS5maW5kRGVmYXVsdExheWVyUHJvcHMoZGF0YXNldCwgcHJldmlvdXMpXG4gICAgICAgIDoge3Byb3BzOiBbXX07XG5cbiAgICBjb25zdCBwcm9wcyA9IEFycmF5LmlzQXJyYXkocmVzdWx0KSA/IHJlc3VsdCA6IHJlc3VsdC5wcm9wcyB8fCBbXTtcbiAgICBjb25zdCBmb3VuZExheWVycyA9IHJlc3VsdC5mb3VuZExheWVycyB8fCBwcmV2aW91cztcblxuICAgIHJldHVybiBmb3VuZExheWVycy5jb25jYXQoXG4gICAgICBwcm9wcy5tYXAocCA9PiAoe1xuICAgICAgICAuLi5wLFxuICAgICAgICB0eXBlOiBsYyxcbiAgICAgICAgZGF0YUlkOiBkYXRhc2V0LmlkXG4gICAgICB9KSlcbiAgICApO1xuICB9LCBbXSk7XG5cbiAgLy8gZ28gdGhyb3VnaCBhbGwgbGF5ZXJQcm9wcyB0byBjcmVhdGUgbGF5ZXJcbiAgcmV0dXJuIGxheWVyUHJvcHMubWFwKHByb3BzID0+IHtcbiAgICBjb25zdCBsYXllciA9IG5ldyBsYXllckNsYXNzZXNbcHJvcHMudHlwZV0ocHJvcHMpO1xuICAgIHJldHVybiB0eXBlb2YgbGF5ZXIuc2V0SW5pdGlhbExheWVyQ29uZmlnID09PSAnZnVuY3Rpb24nICYmIEFycmF5LmlzQXJyYXkoZGF0YXNldC5hbGxEYXRhKVxuICAgICAgPyBsYXllci5zZXRJbml0aWFsTGF5ZXJDb25maWcoZGF0YXNldC5hbGxEYXRhKVxuICAgICAgOiBsYXllcjtcbiAgfSk7XG59XG5cbi8qKlxuICogY2FsY3VsYXRlIGxheWVyIGRhdGEgYmFzZWQgb24gbGF5ZXIgdHlwZSwgY29sIENvbmZpZyxcbiAqIHJldHVybiB1cGRhdGVkIGxheWVyIGlmIGNvbG9yRG9tYWluLCBkYXRhTWFwIGhhcyBjaGFuZ2VkXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9sYXllci11dGlscycpLmNhbGN1bGF0ZUxheWVyRGF0YX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUxheWVyRGF0YShsYXllciwgc3RhdGUsIG9sZExheWVyRGF0YSkge1xuICBjb25zdCB7dHlwZX0gPSBsYXllcjtcblxuICBpZiAoIXR5cGUgfHwgIWxheWVyLmhhc0FsbENvbHVtbnMoKSB8fCAhbGF5ZXIuY29uZmlnLmRhdGFJZCkge1xuICAgIHJldHVybiB7bGF5ZXIsIGxheWVyRGF0YToge319O1xuICB9XG5cbiAgY29uc3QgbGF5ZXJEYXRhID0gbGF5ZXIuZm9ybWF0TGF5ZXJEYXRhKHN0YXRlLmRhdGFzZXRzLCBvbGRMYXllckRhdGEpO1xuICByZXR1cm4ge2xheWVyRGF0YSwgbGF5ZXJ9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBwcm9wcyBwYXNzZWQgdG8gTGF5ZXJIb3ZlckluZm9cbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2xheWVyLXV0aWxzJykuZ2V0TGF5ZXJIb3ZlclByb3B9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXllckhvdmVyUHJvcCh7XG4gIGludGVyYWN0aW9uQ29uZmlnLFxuICBob3ZlckluZm8sXG4gIGxheWVycyxcbiAgbGF5ZXJzVG9SZW5kZXIsXG4gIGRhdGFzZXRzXG59KSB7XG4gIGlmIChpbnRlcmFjdGlvbkNvbmZpZy50b29sdGlwLmVuYWJsZWQgJiYgaG92ZXJJbmZvICYmIGhvdmVySW5mby5waWNrZWQpIHtcbiAgICAvLyBpZiBhbnl0aGluZyBob3ZlcmVkXG4gICAgY29uc3Qge29iamVjdCwgbGF5ZXI6IG92ZXJsYXl9ID0gaG92ZXJJbmZvO1xuXG4gICAgLy8gZGVja2dsIGxheWVyIHRvIGtlcGxlci1nbCBsYXllclxuICAgIGNvbnN0IGxheWVyID0gbGF5ZXJzW292ZXJsYXkucHJvcHMuaWR4XTtcblxuICAgIGlmIChsYXllci5nZXRIb3ZlckRhdGEgJiYgbGF5ZXJzVG9SZW5kZXJbbGF5ZXIuaWRdKSB7XG4gICAgICAvLyBpZiBsYXllciBpcyB2aXNpYmxlIGFuZCBoYXZlIGhvdmVyZWQgZGF0YVxuICAgICAgY29uc3Qge1xuICAgICAgICBjb25maWc6IHtkYXRhSWR9XG4gICAgICB9ID0gbGF5ZXI7XG4gICAgICBjb25zdCB7YWxsRGF0YSwgZmllbGRzfSA9IGRhdGFzZXRzW2RhdGFJZF07XG4gICAgICBjb25zdCBkYXRhID0gbGF5ZXIuZ2V0SG92ZXJEYXRhKG9iamVjdCwgYWxsRGF0YSk7XG4gICAgICBjb25zdCBmaWVsZHNUb1Nob3cgPSBpbnRlcmFjdGlvbkNvbmZpZy50b29sdGlwLmNvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZmllbGRzLFxuICAgICAgICBmaWVsZHNUb1Nob3csXG4gICAgICAgIGxheWVyXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19