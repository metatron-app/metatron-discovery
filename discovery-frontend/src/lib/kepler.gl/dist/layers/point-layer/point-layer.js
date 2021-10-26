"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.pointVisConfigs = exports.pointOptionalColumns = exports.pointRequiredColumns = exports.pointPosAccessor = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _extensions = require("@deck.gl/extensions");

var _layers = require("@deck.gl/layers");

var _baseLayer = _interopRequireDefault(require("../base-layer"));

var _colorUtils = require("../../utils/color-utils");

var _pointLayerIcon = _interopRequireDefault(require("./point-layer-icon"));

var _defaultSettings = require("../../constants/default-settings");

var _layerTextLabel = require("../layer-text-label");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var pointPosAccessor = function pointPosAccessor(_ref) {
  var lat = _ref.lat,
      lng = _ref.lng,
      altitude = _ref.altitude;
  return function (d) {
    return [// lng
    d.data[lng.fieldIdx], // lat
    d.data[lat.fieldIdx], altitude && altitude.fieldIdx > -1 ? d.data[altitude.fieldIdx] : 0];
  };
};

exports.pointPosAccessor = pointPosAccessor;
var pointRequiredColumns = ['lat', 'lng'];
exports.pointRequiredColumns = pointRequiredColumns;
var pointOptionalColumns = ['altitude'];
exports.pointOptionalColumns = pointOptionalColumns;
var brushingExtension = new _extensions.BrushingExtension();
var pointVisConfigs = {
  radius: 'radius',
  fixedRadius: 'fixedRadius',
  opacity: 'opacity',
  outline: 'outline',
  thickness: 'thickness',
  strokeColor: 'strokeColor',
  colorRange: 'colorRange',
  strokeColorRange: 'strokeColorRange',
  radiusRange: 'radiusRange',
  filled: {
    type: 'boolean',
    label: 'layer.fillColor',
    defaultValue: true,
    property: 'filled'
  }
};
exports.pointVisConfigs = pointVisConfigs;

var PointLayer = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(PointLayer, _Layer);

  var _super = _createSuper(PointLayer);

  function PointLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, PointLayer);
    _this = _super.call(this, props);

    _this.registerVisConfig(pointVisConfigs);

    _this.getPositionAccessor = function () {
      return pointPosAccessor(_this.config.columns);
    };

    return _this;
  }

  (0, _createClass2["default"])(PointLayer, [{
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(PointLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        // add stroke color visual channel
        strokeColorField: null,
        strokeColorDomain: [0, 1],
        strokeColorScale: 'quantile'
      });
    }
  }, {
    key: "calculateDataAttribute",
    value: function calculateDataAttribute(_ref2, getPosition) {
      var allData = _ref2.allData,
          filteredIndex = _ref2.filteredIndex;
      var data = [];

      for (var i = 0; i < filteredIndex.length; i++) {
        var index = filteredIndex[i];
        var pos = getPosition({
          data: allData[index]
        }); // if doesn't have point lat or lng, do not add the point
        // deck.gl can't handle position = null

        if (pos.every(Number.isFinite)) {
          data.push({
            data: allData[index],
            position: pos,
            // index is important for filter
            index: index
          });
        }
      }

      return data;
    }
  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, oldLayerData) {
      var _this2 = this;

      var _this$config = this.config,
          colorScale = _this$config.colorScale,
          colorDomain = _this$config.colorDomain,
          colorField = _this$config.colorField,
          strokeColorField = _this$config.strokeColorField,
          strokeColorScale = _this$config.strokeColorScale,
          strokeColorDomain = _this$config.strokeColorDomain,
          color = _this$config.color,
          sizeField = _this$config.sizeField,
          sizeScale = _this$config.sizeScale,
          sizeDomain = _this$config.sizeDomain,
          textLabel = _this$config.textLabel,
          _this$config$visConfi = _this$config.visConfig,
          radiusRange = _this$config$visConfi.radiusRange,
          fixedRadius = _this$config$visConfi.fixedRadius,
          colorRange = _this$config$visConfi.colorRange,
          strokeColorRange = _this$config$visConfi.strokeColorRange,
          strokeColor = _this$config$visConfi.strokeColor;
      var gpuFilter = datasets[this.config.dataId].gpuFilter;

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data,
          triggerChanged = _this$updateData.triggerChanged;

      var getPosition = this.getPositionAccessor(); // point color

      var cScale = colorField && this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(_colorUtils.hexToRgb)); // stroke color

      var scScale = strokeColorField && this.getVisChannelScale(strokeColorScale, strokeColorDomain, strokeColorRange.colors.map(_colorUtils.hexToRgb)); // point radius

      var rScale = sizeField && this.getVisChannelScale(sizeScale, sizeDomain, radiusRange, fixedRadius);
      var getRadius = rScale ? function (d) {
        return _this2.getEncodedChannelValue(rScale, d.data, sizeField, 0);
      } : 1;
      var getFillColor = cScale ? function (d) {
        return _this2.getEncodedChannelValue(cScale, d.data, colorField);
      } : color;
      var getLineColor = scScale ? function (d) {
        return _this2.getEncodedChannelValue(scScale, d.data, strokeColorField);
      } : strokeColor || color; // get all distinct characters in the text labels

      var textLabels = (0, _layerTextLabel.formatTextLabelData)({
        textLabel: textLabel,
        triggerChanged: triggerChanged,
        oldLayerData: oldLayerData,
        data: data
      });
      return {
        data: data,
        getPosition: getPosition,
        getFillColor: getFillColor,
        getLineColor: getLineColor,
        getFilterValue: gpuFilter.filterValueAccessor(),
        getRadius: getRadius,
        textLabels: textLabels
      };
    }
    /* eslint-enable complexity */

  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData) {
      var getPosition = this.getPositionAccessor();
      var bounds = this.getPointsBounds(allData, function (d) {
        return getPosition({
          data: d
        });
      });
      this.updateMeta({
        bounds: bounds
      });
    }
  }, {
    key: "renderLayer",
    value: function renderLayer(opts) {
      var data = opts.data,
          gpuFilter = opts.gpuFilter,
          objectHovered = opts.objectHovered,
          mapState = opts.mapState,
          interactionConfig = opts.interactionConfig;
      var radiusScale = this.getRadiusScaleByZoom(mapState);

      var layerProps = _objectSpread({
        stroked: this.config.visConfig.outline,
        filled: this.config.visConfig.filled,
        lineWidthScale: this.config.visConfig.thickness,
        radiusScale: radiusScale
      }, this.config.visConfig.fixedRadius ? {} : {
        radiusMaxPixels: 500
      });

      var updateTriggers = {
        getPosition: this.config.columns,
        getRadius: {
          sizeField: this.config.sizeField,
          radiusRange: this.config.visConfig.radiusRange,
          fixedRadius: this.config.visConfig.fixedRadius,
          sizeScale: this.config.sizeScale
        },
        getFillColor: {
          color: this.config.color,
          colorField: this.config.colorField,
          colorRange: this.config.visConfig.colorRange,
          colorScale: this.config.colorScale
        },
        getLineColor: {
          color: this.config.visConfig.strokeColor,
          colorField: this.config.strokeColorField,
          colorRange: this.config.visConfig.strokeColorRange,
          colorScale: this.config.strokeColorScale
        },
        getFilterValue: gpuFilter.filterValueUpdateTriggers
      };
      var defaultLayerProps = this.getDefaultDeckLayerProps(opts);
      var brushingProps = this.getBrushingExtensionProps(interactionConfig);
      var getPixelOffset = (0, _layerTextLabel.getTextOffsetByRadius)(radiusScale, data.getRadius, mapState);
      var extensions = [].concat((0, _toConsumableArray2["default"])(defaultLayerProps.extensions), [brushingExtension]);

      var sharedProps = _objectSpread({
        getFilterValue: data.getFilterValue,
        extensions: extensions,
        filterRange: defaultLayerProps.filterRange
      }, brushingProps);

      return [new _layers.ScatterplotLayer(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, defaultLayerProps), brushingProps), layerProps), data), {}, {
        parameters: {
          // circles will be flat on the map when the altitude column is not used
          depthTest: this.config.columns.altitude.fieldIdx > -1
        },
        lineWidthUnits: 'pixels',
        updateTriggers: updateTriggers,
        extensions: extensions
      }))].concat((0, _toConsumableArray2["default"])(this.isLayerHovered(objectHovered) ? [new _layers.ScatterplotLayer(_objectSpread(_objectSpread(_objectSpread({}, this.getDefaultHoverLayerProps()), layerProps), {}, {
        data: [objectHovered.object],
        getLineColor: this.config.highlightColor,
        getFillColor: this.config.highlightColor,
        getRadius: data.getRadius,
        getPosition: data.getPosition
      }))] : []), (0, _toConsumableArray2["default"])(this.renderTextLabelLayer({
        getPosition: data.getPosition,
        sharedProps: sharedProps,
        getPixelOffset: getPixelOffset,
        updateTriggers: updateTriggers
      }, opts)));
    }
  }, {
    key: "type",
    get: function get() {
      return 'point';
    }
  }, {
    key: "isAggregated",
    get: function get() {
      return false;
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _pointLayerIcon["default"];
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return pointRequiredColumns;
    }
  }, {
    key: "optionalColumns",
    get: function get() {
      return pointOptionalColumns;
    }
  }, {
    key: "columnPairs",
    get: function get() {
      return this.defaultPointColumnPairs;
    }
  }, {
    key: "noneLayerDataAffectingProps",
    get: function get() {
      return [].concat((0, _toConsumableArray2["default"])((0, _get2["default"])((0, _getPrototypeOf2["default"])(PointLayer.prototype), "noneLayerDataAffectingProps", this)), ['radius']);
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return {
        color: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(PointLayer.prototype), "visualChannels", this).color), {}, {
          condition: function condition(config) {
            return config.visConfig.filled;
          }
        }),
        strokeColor: {
          property: 'strokeColor',
          field: 'strokeColorField',
          scale: 'strokeColorScale',
          domain: 'strokeColorDomain',
          range: 'strokeColorRange',
          key: 'strokeColor',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.color,
          condition: function condition(config) {
            return config.visConfig.outline;
          }
        },
        size: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(PointLayer.prototype), "visualChannels", this).size), {}, {
          range: 'radiusRange',
          property: 'radius',
          channelScaleType: 'radius'
        })
      };
    }
  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(_ref3) {
      var _ref3$fieldPairs = _ref3.fieldPairs,
          fieldPairs = _ref3$fieldPairs === void 0 ? [] : _ref3$fieldPairs;
      var props = []; // Make layer for each pair

      fieldPairs.forEach(function (pair) {
        // find fields for tableFieldIndex
        var latField = pair.pair.lat;
        var lngField = pair.pair.lng;
        var layerName = pair.defaultName;
        var prop = {
          label: layerName.length ? layerName : 'Point'
        }; // default layer color for begintrip and dropoff point

        if (latField.value in _defaultSettings.DEFAULT_LAYER_COLOR) {
          prop.color = (0, _colorUtils.hexToRgb)(_defaultSettings.DEFAULT_LAYER_COLOR[latField.value]);
        } // set the first layer to be visible


        if (props.length === 0) {
          prop.isVisible = true;
        }

        prop.columns = {
          lat: latField,
          lng: lngField,
          altitude: {
            value: null,
            fieldIdx: -1,
            optional: true
          }
        };
        props.push(prop);
      });
      return {
        props: props
      };
    }
  }]);
  return PointLayer;
}(_baseLayer["default"]);

exports["default"] = PointLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvcG9pbnQtbGF5ZXIvcG9pbnQtbGF5ZXIuanMiXSwibmFtZXMiOlsicG9pbnRQb3NBY2Nlc3NvciIsImxhdCIsImxuZyIsImFsdGl0dWRlIiwiZCIsImRhdGEiLCJmaWVsZElkeCIsInBvaW50UmVxdWlyZWRDb2x1bW5zIiwicG9pbnRPcHRpb25hbENvbHVtbnMiLCJicnVzaGluZ0V4dGVuc2lvbiIsIkJydXNoaW5nRXh0ZW5zaW9uIiwicG9pbnRWaXNDb25maWdzIiwicmFkaXVzIiwiZml4ZWRSYWRpdXMiLCJvcGFjaXR5Iiwib3V0bGluZSIsInRoaWNrbmVzcyIsInN0cm9rZUNvbG9yIiwiY29sb3JSYW5nZSIsInN0cm9rZUNvbG9yUmFuZ2UiLCJyYWRpdXNSYW5nZSIsImZpbGxlZCIsInR5cGUiLCJsYWJlbCIsImRlZmF1bHRWYWx1ZSIsInByb3BlcnR5IiwiUG9pbnRMYXllciIsInByb3BzIiwicmVnaXN0ZXJWaXNDb25maWciLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwiY29uZmlnIiwiY29sdW1ucyIsInN0cm9rZUNvbG9yRmllbGQiLCJzdHJva2VDb2xvckRvbWFpbiIsInN0cm9rZUNvbG9yU2NhbGUiLCJnZXRQb3NpdGlvbiIsImFsbERhdGEiLCJmaWx0ZXJlZEluZGV4IiwiaSIsImxlbmd0aCIsImluZGV4IiwicG9zIiwiZXZlcnkiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInB1c2giLCJwb3NpdGlvbiIsImRhdGFzZXRzIiwib2xkTGF5ZXJEYXRhIiwiY29sb3JTY2FsZSIsImNvbG9yRG9tYWluIiwiY29sb3JGaWVsZCIsImNvbG9yIiwic2l6ZUZpZWxkIiwic2l6ZVNjYWxlIiwic2l6ZURvbWFpbiIsInRleHRMYWJlbCIsInZpc0NvbmZpZyIsImdwdUZpbHRlciIsImRhdGFJZCIsInVwZGF0ZURhdGEiLCJ0cmlnZ2VyQ2hhbmdlZCIsImNTY2FsZSIsImdldFZpc0NoYW5uZWxTY2FsZSIsImNvbG9ycyIsIm1hcCIsImhleFRvUmdiIiwic2NTY2FsZSIsInJTY2FsZSIsImdldFJhZGl1cyIsImdldEVuY29kZWRDaGFubmVsVmFsdWUiLCJnZXRGaWxsQ29sb3IiLCJnZXRMaW5lQ29sb3IiLCJ0ZXh0TGFiZWxzIiwiZ2V0RmlsdGVyVmFsdWUiLCJmaWx0ZXJWYWx1ZUFjY2Vzc29yIiwiYm91bmRzIiwiZ2V0UG9pbnRzQm91bmRzIiwidXBkYXRlTWV0YSIsIm9wdHMiLCJvYmplY3RIb3ZlcmVkIiwibWFwU3RhdGUiLCJpbnRlcmFjdGlvbkNvbmZpZyIsInJhZGl1c1NjYWxlIiwiZ2V0UmFkaXVzU2NhbGVCeVpvb20iLCJsYXllclByb3BzIiwic3Ryb2tlZCIsImxpbmVXaWR0aFNjYWxlIiwicmFkaXVzTWF4UGl4ZWxzIiwidXBkYXRlVHJpZ2dlcnMiLCJmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzIiwiZGVmYXVsdExheWVyUHJvcHMiLCJnZXREZWZhdWx0RGVja0xheWVyUHJvcHMiLCJicnVzaGluZ1Byb3BzIiwiZ2V0QnJ1c2hpbmdFeHRlbnNpb25Qcm9wcyIsImdldFBpeGVsT2Zmc2V0IiwiZXh0ZW5zaW9ucyIsInNoYXJlZFByb3BzIiwiZmlsdGVyUmFuZ2UiLCJTY2F0dGVycGxvdExheWVyIiwicGFyYW1ldGVycyIsImRlcHRoVGVzdCIsImxpbmVXaWR0aFVuaXRzIiwiaXNMYXllckhvdmVyZWQiLCJnZXREZWZhdWx0SG92ZXJMYXllclByb3BzIiwib2JqZWN0IiwiaGlnaGxpZ2h0Q29sb3IiLCJyZW5kZXJUZXh0TGFiZWxMYXllciIsIlBvaW50TGF5ZXJJY29uIiwiZGVmYXVsdFBvaW50Q29sdW1uUGFpcnMiLCJjb25kaXRpb24iLCJmaWVsZCIsInNjYWxlIiwiZG9tYWluIiwicmFuZ2UiLCJrZXkiLCJjaGFubmVsU2NhbGVUeXBlIiwiQ0hBTk5FTF9TQ0FMRVMiLCJzaXplIiwiZmllbGRQYWlycyIsImZvckVhY2giLCJwYWlyIiwibGF0RmllbGQiLCJsbmdGaWVsZCIsImxheWVyTmFtZSIsImRlZmF1bHROYW1lIiwicHJvcCIsInZhbHVlIiwiREVGQVVMVF9MQVlFUl9DT0xPUiIsImlzVmlzaWJsZSIsIm9wdGlvbmFsIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUFFTyxJQUFNQSxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CO0FBQUEsTUFBRUMsR0FBRixRQUFFQSxHQUFGO0FBQUEsTUFBT0MsR0FBUCxRQUFPQSxHQUFQO0FBQUEsTUFBWUMsUUFBWixRQUFZQSxRQUFaO0FBQUEsU0FBMEIsVUFBQUMsQ0FBQztBQUFBLFdBQUksQ0FDN0Q7QUFDQUEsSUFBQUEsQ0FBQyxDQUFDQyxJQUFGLENBQU9ILEdBQUcsQ0FBQ0ksUUFBWCxDQUY2RCxFQUc3RDtBQUNBRixJQUFBQSxDQUFDLENBQUNDLElBQUYsQ0FBT0osR0FBRyxDQUFDSyxRQUFYLENBSjZELEVBSzdESCxRQUFRLElBQUlBLFFBQVEsQ0FBQ0csUUFBVCxHQUFvQixDQUFDLENBQWpDLEdBQXFDRixDQUFDLENBQUNDLElBQUYsQ0FBT0YsUUFBUSxDQUFDRyxRQUFoQixDQUFyQyxHQUFpRSxDQUxKLENBQUo7QUFBQSxHQUEzQjtBQUFBLENBQXpCOzs7QUFRQSxJQUFNQyxvQkFBb0IsR0FBRyxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQTdCOztBQUNBLElBQU1DLG9CQUFvQixHQUFHLENBQUMsVUFBRCxDQUE3Qjs7QUFFUCxJQUFNQyxpQkFBaUIsR0FBRyxJQUFJQyw2QkFBSixFQUExQjtBQUVPLElBQU1DLGVBQWUsR0FBRztBQUM3QkMsRUFBQUEsTUFBTSxFQUFFLFFBRHFCO0FBRTdCQyxFQUFBQSxXQUFXLEVBQUUsYUFGZ0I7QUFHN0JDLEVBQUFBLE9BQU8sRUFBRSxTQUhvQjtBQUk3QkMsRUFBQUEsT0FBTyxFQUFFLFNBSm9CO0FBSzdCQyxFQUFBQSxTQUFTLEVBQUUsV0FMa0I7QUFNN0JDLEVBQUFBLFdBQVcsRUFBRSxhQU5n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RUE5RnFDd0cscUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0JydXNoaW5nRXh0ZW5zaW9ufSBmcm9tICdAZGVjay5nbC9leHRlbnNpb25zJztcbmltcG9ydCB7U2NhdHRlcnBsb3RMYXllcn0gZnJvbSAnQGRlY2suZ2wvbGF5ZXJzJztcblxuaW1wb3J0IExheWVyIGZyb20gJy4uL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IHtoZXhUb1JnYn0gZnJvbSAndXRpbHMvY29sb3ItdXRpbHMnO1xuaW1wb3J0IFBvaW50TGF5ZXJJY29uIGZyb20gJy4vcG9pbnQtbGF5ZXItaWNvbic7XG5pbXBvcnQge0RFRkFVTFRfTEFZRVJfQ09MT1IsIENIQU5ORUxfU0NBTEVTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5cbmltcG9ydCB7Z2V0VGV4dE9mZnNldEJ5UmFkaXVzLCBmb3JtYXRUZXh0TGFiZWxEYXRhfSBmcm9tICcuLi9sYXllci10ZXh0LWxhYmVsJztcblxuZXhwb3J0IGNvbnN0IHBvaW50UG9zQWNjZXNzb3IgPSAoe2xhdCwgbG5nLCBhbHRpdHVkZX0pID0+IGQgPT4gW1xuICAvLyBsbmdcbiAgZC5kYXRhW2xuZy5maWVsZElkeF0sXG4gIC8vIGxhdFxuICBkLmRhdGFbbGF0LmZpZWxkSWR4XSxcbiAgYWx0aXR1ZGUgJiYgYWx0aXR1ZGUuZmllbGRJZHggPiAtMSA/IGQuZGF0YVthbHRpdHVkZS5maWVsZElkeF0gOiAwXG5dO1xuXG5leHBvcnQgY29uc3QgcG9pbnRSZXF1aXJlZENvbHVtbnMgPSBbJ2xhdCcsICdsbmcnXTtcbmV4cG9ydCBjb25zdCBwb2ludE9wdGlvbmFsQ29sdW1ucyA9IFsnYWx0aXR1ZGUnXTtcblxuY29uc3QgYnJ1c2hpbmdFeHRlbnNpb24gPSBuZXcgQnJ1c2hpbmdFeHRlbnNpb24oKTtcblxuZXhwb3J0IGNvbnN0IHBvaW50VmlzQ29uZmlncyA9IHtcbiAgcmFkaXVzOiAncmFkaXVzJyxcbiAgZml4ZWRSYWRpdXM6ICdmaXhlZFJhZGl1cycsXG4gIG9wYWNpdHk6ICdvcGFjaXR5JyxcbiAgb3V0bGluZTogJ291dGxpbmUnLFxuICB0aGlja25lc3M6ICd0aGlja25lc3MnLFxuICBzdHJva2VDb2xvcjogJ3N0cm9rZUNvbG9yJyxcbiAgY29sb3JSYW5nZTogJ2NvbG9yUmFuZ2UnLFxuICBzdHJva2VDb2xvclJhbmdlOiAnc3Ryb2tlQ29sb3JSYW5nZScsXG4gIHJhZGl1c1JhbmdlOiAncmFkaXVzUmFuZ2UnLFxuICBmaWxsZWQ6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgbGFiZWw6ICdsYXllci5maWxsQ29sb3InLFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgICBwcm9wZXJ0eTogJ2ZpbGxlZCdcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRMYXllciBleHRlbmRzIExheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyVmlzQ29uZmlnKHBvaW50VmlzQ29uZmlncyk7XG4gICAgdGhpcy5nZXRQb3NpdGlvbkFjY2Vzc29yID0gKCkgPT4gcG9pbnRQb3NBY2Nlc3Nvcih0aGlzLmNvbmZpZy5jb2x1bW5zKTtcbiAgfVxuXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiAncG9pbnQnO1xuICB9XG5cbiAgZ2V0IGlzQWdncmVnYXRlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXQgbGF5ZXJJY29uKCkge1xuICAgIHJldHVybiBQb2ludExheWVySWNvbjtcbiAgfVxuICBnZXQgcmVxdWlyZWRMYXllckNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIHBvaW50UmVxdWlyZWRDb2x1bW5zO1xuICB9XG5cbiAgZ2V0IG9wdGlvbmFsQ29sdW1ucygpIHtcbiAgICByZXR1cm4gcG9pbnRPcHRpb25hbENvbHVtbnM7XG4gIH1cblxuICBnZXQgY29sdW1uUGFpcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFBvaW50Q29sdW1uUGFpcnM7XG4gIH1cblxuICBnZXQgbm9uZUxheWVyRGF0YUFmZmVjdGluZ1Byb3BzKCkge1xuICAgIHJldHVybiBbLi4uc3VwZXIubm9uZUxheWVyRGF0YUFmZmVjdGluZ1Byb3BzLCAncmFkaXVzJ107XG4gIH1cblxuICBnZXQgdmlzdWFsQ2hhbm5lbHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiB7XG4gICAgICAgIC4uLnN1cGVyLnZpc3VhbENoYW5uZWxzLmNvbG9yLFxuICAgICAgICBjb25kaXRpb246IGNvbmZpZyA9PiBjb25maWcudmlzQ29uZmlnLmZpbGxlZFxuICAgICAgfSxcbiAgICAgIHN0cm9rZUNvbG9yOiB7XG4gICAgICAgIHByb3BlcnR5OiAnc3Ryb2tlQ29sb3InLFxuICAgICAgICBmaWVsZDogJ3N0cm9rZUNvbG9yRmllbGQnLFxuICAgICAgICBzY2FsZTogJ3N0cm9rZUNvbG9yU2NhbGUnLFxuICAgICAgICBkb21haW46ICdzdHJva2VDb2xvckRvbWFpbicsXG4gICAgICAgIHJhbmdlOiAnc3Ryb2tlQ29sb3JSYW5nZScsXG4gICAgICAgIGtleTogJ3N0cm9rZUNvbG9yJyxcbiAgICAgICAgY2hhbm5lbFNjYWxlVHlwZTogQ0hBTk5FTF9TQ0FMRVMuY29sb3IsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcub3V0bGluZVxuICAgICAgfSxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgLi4uc3VwZXIudmlzdWFsQ2hhbm5lbHMuc2l6ZSxcbiAgICAgICAgcmFuZ2U6ICdyYWRpdXNSYW5nZScsXG4gICAgICAgIHByb3BlcnR5OiAncmFkaXVzJyxcbiAgICAgICAgY2hhbm5lbFNjYWxlVHlwZTogJ3JhZGl1cydcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZpbmREZWZhdWx0TGF5ZXJQcm9wcyh7ZmllbGRQYWlycyA9IFtdfSkge1xuICAgIGNvbnN0IHByb3BzID0gW107XG5cbiAgICAvLyBNYWtlIGxheWVyIGZvciBlYWNoIHBhaXJcbiAgICBmaWVsZFBhaXJzLmZvckVhY2gocGFpciA9PiB7XG4gICAgICAvLyBmaW5kIGZpZWxkcyBmb3IgdGFibGVGaWVsZEluZGV4XG4gICAgICBjb25zdCBsYXRGaWVsZCA9IHBhaXIucGFpci5sYXQ7XG4gICAgICBjb25zdCBsbmdGaWVsZCA9IHBhaXIucGFpci5sbmc7XG4gICAgICBjb25zdCBsYXllck5hbWUgPSBwYWlyLmRlZmF1bHROYW1lO1xuXG4gICAgICBjb25zdCBwcm9wID0ge1xuICAgICAgICBsYWJlbDogbGF5ZXJOYW1lLmxlbmd0aCA/IGxheWVyTmFtZSA6ICdQb2ludCdcbiAgICAgIH07XG5cbiAgICAgIC8vIGRlZmF1bHQgbGF5ZXIgY29sb3IgZm9yIGJlZ2ludHJpcCBhbmQgZHJvcG9mZiBwb2ludFxuICAgICAgaWYgKGxhdEZpZWxkLnZhbHVlIGluIERFRkFVTFRfTEFZRVJfQ09MT1IpIHtcbiAgICAgICAgcHJvcC5jb2xvciA9IGhleFRvUmdiKERFRkFVTFRfTEFZRVJfQ09MT1JbbGF0RmllbGQudmFsdWVdKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2V0IHRoZSBmaXJzdCBsYXllciB0byBiZSB2aXNpYmxlXG4gICAgICBpZiAocHJvcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHByb3AuaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcHJvcC5jb2x1bW5zID0ge1xuICAgICAgICBsYXQ6IGxhdEZpZWxkLFxuICAgICAgICBsbmc6IGxuZ0ZpZWxkLFxuICAgICAgICBhbHRpdHVkZToge3ZhbHVlOiBudWxsLCBmaWVsZElkeDogLTEsIG9wdGlvbmFsOiB0cnVlfVxuICAgICAgfTtcblxuICAgICAgcHJvcHMucHVzaChwcm9wKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7cHJvcHN9O1xuICB9XG5cbiAgZ2V0RGVmYXVsdExheWVyQ29uZmlnKHByb3BzID0ge30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3VwZXIuZ2V0RGVmYXVsdExheWVyQ29uZmlnKHByb3BzKSxcblxuICAgICAgLy8gYWRkIHN0cm9rZSBjb2xvciB2aXN1YWwgY2hhbm5lbFxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZDogbnVsbCxcbiAgICAgIHN0cm9rZUNvbG9yRG9tYWluOiBbMCwgMV0sXG4gICAgICBzdHJva2VDb2xvclNjYWxlOiAncXVhbnRpbGUnXG4gICAgfTtcbiAgfVxuXG4gIGNhbGN1bGF0ZURhdGFBdHRyaWJ1dGUoe2FsbERhdGEsIGZpbHRlcmVkSW5kZXh9LCBnZXRQb3NpdGlvbikge1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyZWRJbmRleC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5kZXggPSBmaWx0ZXJlZEluZGV4W2ldO1xuICAgICAgY29uc3QgcG9zID0gZ2V0UG9zaXRpb24oe2RhdGE6IGFsbERhdGFbaW5kZXhdfSk7XG5cbiAgICAgIC8vIGlmIGRvZXNuJ3QgaGF2ZSBwb2ludCBsYXQgb3IgbG5nLCBkbyBub3QgYWRkIHRoZSBwb2ludFxuICAgICAgLy8gZGVjay5nbCBjYW4ndCBoYW5kbGUgcG9zaXRpb24gPSBudWxsXG4gICAgICBpZiAocG9zLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSkpIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICBkYXRhOiBhbGxEYXRhW2luZGV4XSxcbiAgICAgICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgICAgIC8vIGluZGV4IGlzIGltcG9ydGFudCBmb3IgZmlsdGVyXG4gICAgICAgICAgaW5kZXhcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZm9ybWF0TGF5ZXJEYXRhKGRhdGFzZXRzLCBvbGRMYXllckRhdGEpIHtcbiAgICBjb25zdCB7XG4gICAgICBjb2xvclNjYWxlLFxuICAgICAgY29sb3JEb21haW4sXG4gICAgICBjb2xvckZpZWxkLFxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZCxcbiAgICAgIHN0cm9rZUNvbG9yU2NhbGUsXG4gICAgICBzdHJva2VDb2xvckRvbWFpbixcbiAgICAgIGNvbG9yLFxuICAgICAgc2l6ZUZpZWxkLFxuICAgICAgc2l6ZVNjYWxlLFxuICAgICAgc2l6ZURvbWFpbixcbiAgICAgIHRleHRMYWJlbCxcbiAgICAgIHZpc0NvbmZpZzoge3JhZGl1c1JhbmdlLCBmaXhlZFJhZGl1cywgY29sb3JSYW5nZSwgc3Ryb2tlQ29sb3JSYW5nZSwgc3Ryb2tlQ29sb3J9XG4gICAgfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgY29uc3Qge2dwdUZpbHRlcn0gPSBkYXRhc2V0c1t0aGlzLmNvbmZpZy5kYXRhSWRdO1xuICAgIGNvbnN0IHtkYXRhLCB0cmlnZ2VyQ2hhbmdlZH0gPSB0aGlzLnVwZGF0ZURhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSk7XG4gICAgY29uc3QgZ2V0UG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uQWNjZXNzb3IoKTtcbiAgICAvLyBwb2ludCBjb2xvclxuXG4gICAgY29uc3QgY1NjYWxlID1cbiAgICAgIGNvbG9yRmllbGQgJiZcbiAgICAgIHRoaXMuZ2V0VmlzQ2hhbm5lbFNjYWxlKGNvbG9yU2NhbGUsIGNvbG9yRG9tYWluLCBjb2xvclJhbmdlLmNvbG9ycy5tYXAoaGV4VG9SZ2IpKTtcblxuICAgIC8vIHN0cm9rZSBjb2xvclxuICAgIGNvbnN0IHNjU2NhbGUgPVxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZCAmJlxuICAgICAgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoXG4gICAgICAgIHN0cm9rZUNvbG9yU2NhbGUsXG4gICAgICAgIHN0cm9rZUNvbG9yRG9tYWluLFxuICAgICAgICBzdHJva2VDb2xvclJhbmdlLmNvbG9ycy5tYXAoaGV4VG9SZ2IpXG4gICAgICApO1xuXG4gICAgLy8gcG9pbnQgcmFkaXVzXG4gICAgY29uc3QgclNjYWxlID1cbiAgICAgIHNpemVGaWVsZCAmJiB0aGlzLmdldFZpc0NoYW5uZWxTY2FsZShzaXplU2NhbGUsIHNpemVEb21haW4sIHJhZGl1c1JhbmdlLCBmaXhlZFJhZGl1cyk7XG5cbiAgICBjb25zdCBnZXRSYWRpdXMgPSByU2NhbGUgPyBkID0+IHRoaXMuZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZShyU2NhbGUsIGQuZGF0YSwgc2l6ZUZpZWxkLCAwKSA6IDE7XG5cbiAgICBjb25zdCBnZXRGaWxsQ29sb3IgPSBjU2NhbGVcbiAgICAgID8gZCA9PiB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoY1NjYWxlLCBkLmRhdGEsIGNvbG9yRmllbGQpXG4gICAgICA6IGNvbG9yO1xuXG4gICAgY29uc3QgZ2V0TGluZUNvbG9yID0gc2NTY2FsZVxuICAgICAgPyBkID0+IHRoaXMuZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZShzY1NjYWxlLCBkLmRhdGEsIHN0cm9rZUNvbG9yRmllbGQpXG4gICAgICA6IHN0cm9rZUNvbG9yIHx8IGNvbG9yO1xuXG4gICAgLy8gZ2V0IGFsbCBkaXN0aW5jdCBjaGFyYWN0ZXJzIGluIHRoZSB0ZXh0IGxhYmVsc1xuICAgIGNvbnN0IHRleHRMYWJlbHMgPSBmb3JtYXRUZXh0TGFiZWxEYXRhKHtcbiAgICAgIHRleHRMYWJlbCxcbiAgICAgIHRyaWdnZXJDaGFuZ2VkLFxuICAgICAgb2xkTGF5ZXJEYXRhLFxuICAgICAgZGF0YVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBnZXRQb3NpdGlvbixcbiAgICAgIGdldEZpbGxDb2xvcixcbiAgICAgIGdldExpbmVDb2xvcixcbiAgICAgIGdldEZpbHRlclZhbHVlOiBncHVGaWx0ZXIuZmlsdGVyVmFsdWVBY2Nlc3NvcigpLFxuICAgICAgZ2V0UmFkaXVzLFxuICAgICAgdGV4dExhYmVsc1xuICAgIH07XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbiAgdXBkYXRlTGF5ZXJNZXRhKGFsbERhdGEpIHtcbiAgICBjb25zdCBnZXRQb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb25BY2Nlc3NvcigpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuZ2V0UG9pbnRzQm91bmRzKGFsbERhdGEsIGQgPT4gZ2V0UG9zaXRpb24oe2RhdGE6IGR9KSk7XG4gICAgdGhpcy51cGRhdGVNZXRhKHtib3VuZHN9KTtcbiAgfVxuXG4gIHJlbmRlckxheWVyKG9wdHMpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ3B1RmlsdGVyLCBvYmplY3RIb3ZlcmVkLCBtYXBTdGF0ZSwgaW50ZXJhY3Rpb25Db25maWd9ID0gb3B0cztcblxuICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gdGhpcy5nZXRSYWRpdXNTY2FsZUJ5Wm9vbShtYXBTdGF0ZSk7XG5cbiAgICBjb25zdCBsYXllclByb3BzID0ge1xuICAgICAgc3Ryb2tlZDogdGhpcy5jb25maWcudmlzQ29uZmlnLm91dGxpbmUsXG4gICAgICBmaWxsZWQ6IHRoaXMuY29uZmlnLnZpc0NvbmZpZy5maWxsZWQsXG4gICAgICBsaW5lV2lkdGhTY2FsZTogdGhpcy5jb25maWcudmlzQ29uZmlnLnRoaWNrbmVzcyxcbiAgICAgIHJhZGl1c1NjYWxlLFxuICAgICAgLi4uKHRoaXMuY29uZmlnLnZpc0NvbmZpZy5maXhlZFJhZGl1cyA/IHt9IDoge3JhZGl1c01heFBpeGVsczogNTAwfSlcbiAgICB9O1xuXG4gICAgY29uc3QgdXBkYXRlVHJpZ2dlcnMgPSB7XG4gICAgICBnZXRQb3NpdGlvbjogdGhpcy5jb25maWcuY29sdW1ucyxcbiAgICAgIGdldFJhZGl1czoge1xuICAgICAgICBzaXplRmllbGQ6IHRoaXMuY29uZmlnLnNpemVGaWVsZCxcbiAgICAgICAgcmFkaXVzUmFuZ2U6IHRoaXMuY29uZmlnLnZpc0NvbmZpZy5yYWRpdXNSYW5nZSxcbiAgICAgICAgZml4ZWRSYWRpdXM6IHRoaXMuY29uZmlnLnZpc0NvbmZpZy5maXhlZFJhZGl1cyxcbiAgICAgICAgc2l6ZVNjYWxlOiB0aGlzLmNvbmZpZy5zaXplU2NhbGVcbiAgICAgIH0sXG4gICAgICBnZXRGaWxsQ29sb3I6IHtcbiAgICAgICAgY29sb3I6IHRoaXMuY29uZmlnLmNvbG9yLFxuICAgICAgICBjb2xvckZpZWxkOiB0aGlzLmNvbmZpZy5jb2xvckZpZWxkLFxuICAgICAgICBjb2xvclJhbmdlOiB0aGlzLmNvbmZpZy52aXNDb25maWcuY29sb3JSYW5nZSxcbiAgICAgICAgY29sb3JTY2FsZTogdGhpcy5jb25maWcuY29sb3JTY2FsZVxuICAgICAgfSxcbiAgICAgIGdldExpbmVDb2xvcjoge1xuICAgICAgICBjb2xvcjogdGhpcy5jb25maWcudmlzQ29uZmlnLnN0cm9rZUNvbG9yLFxuICAgICAgICBjb2xvckZpZWxkOiB0aGlzLmNvbmZpZy5zdHJva2VDb2xvckZpZWxkLFxuICAgICAgICBjb2xvclJhbmdlOiB0aGlzLmNvbmZpZy52aXNDb25maWcuc3Ryb2tlQ29sb3JSYW5nZSxcbiAgICAgICAgY29sb3JTY2FsZTogdGhpcy5jb25maWcuc3Ryb2tlQ29sb3JTY2FsZVxuICAgICAgfSxcbiAgICAgIGdldEZpbHRlclZhbHVlOiBncHVGaWx0ZXIuZmlsdGVyVmFsdWVVcGRhdGVUcmlnZ2Vyc1xuICAgIH07XG5cbiAgICBjb25zdCBkZWZhdWx0TGF5ZXJQcm9wcyA9IHRoaXMuZ2V0RGVmYXVsdERlY2tMYXllclByb3BzKG9wdHMpO1xuICAgIGNvbnN0IGJydXNoaW5nUHJvcHMgPSB0aGlzLmdldEJydXNoaW5nRXh0ZW5zaW9uUHJvcHMoaW50ZXJhY3Rpb25Db25maWcpO1xuICAgIGNvbnN0IGdldFBpeGVsT2Zmc2V0ID0gZ2V0VGV4dE9mZnNldEJ5UmFkaXVzKHJhZGl1c1NjYWxlLCBkYXRhLmdldFJhZGl1cywgbWFwU3RhdGUpO1xuICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBbLi4uZGVmYXVsdExheWVyUHJvcHMuZXh0ZW5zaW9ucywgYnJ1c2hpbmdFeHRlbnNpb25dO1xuXG4gICAgY29uc3Qgc2hhcmVkUHJvcHMgPSB7XG4gICAgICBnZXRGaWx0ZXJWYWx1ZTogZGF0YS5nZXRGaWx0ZXJWYWx1ZSxcbiAgICAgIGV4dGVuc2lvbnMsXG4gICAgICBmaWx0ZXJSYW5nZTogZGVmYXVsdExheWVyUHJvcHMuZmlsdGVyUmFuZ2UsXG4gICAgICAuLi5icnVzaGluZ1Byb3BzXG4gICAgfTtcblxuICAgIHJldHVybiBbXG4gICAgICBuZXcgU2NhdHRlcnBsb3RMYXllcih7XG4gICAgICAgIC4uLmRlZmF1bHRMYXllclByb3BzLFxuICAgICAgICAuLi5icnVzaGluZ1Byb3BzLFxuICAgICAgICAuLi5sYXllclByb3BzLFxuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgLy8gY2lyY2xlcyB3aWxsIGJlIGZsYXQgb24gdGhlIG1hcCB3aGVuIHRoZSBhbHRpdHVkZSBjb2x1bW4gaXMgbm90IHVzZWRcbiAgICAgICAgICBkZXB0aFRlc3Q6IHRoaXMuY29uZmlnLmNvbHVtbnMuYWx0aXR1ZGUuZmllbGRJZHggPiAtMVxuICAgICAgICB9LFxuICAgICAgICBsaW5lV2lkdGhVbml0czogJ3BpeGVscycsXG4gICAgICAgIHVwZGF0ZVRyaWdnZXJzLFxuICAgICAgICBleHRlbnNpb25zXG4gICAgICB9KSxcbiAgICAgIC8vIGhvdmVyIGxheWVyXG4gICAgICAuLi4odGhpcy5pc0xheWVySG92ZXJlZChvYmplY3RIb3ZlcmVkKVxuICAgICAgICA/IFtcbiAgICAgICAgICAgIG5ldyBTY2F0dGVycGxvdExheWVyKHtcbiAgICAgICAgICAgICAgLi4udGhpcy5nZXREZWZhdWx0SG92ZXJMYXllclByb3BzKCksXG4gICAgICAgICAgICAgIC4uLmxheWVyUHJvcHMsXG4gICAgICAgICAgICAgIGRhdGE6IFtvYmplY3RIb3ZlcmVkLm9iamVjdF0sXG4gICAgICAgICAgICAgIGdldExpbmVDb2xvcjogdGhpcy5jb25maWcuaGlnaGxpZ2h0Q29sb3IsXG4gICAgICAgICAgICAgIGdldEZpbGxDb2xvcjogdGhpcy5jb25maWcuaGlnaGxpZ2h0Q29sb3IsXG4gICAgICAgICAgICAgIGdldFJhZGl1czogZGF0YS5nZXRSYWRpdXMsXG4gICAgICAgICAgICAgIGdldFBvc2l0aW9uOiBkYXRhLmdldFBvc2l0aW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF1cbiAgICAgICAgOiBbXSksXG4gICAgICAvLyB0ZXh0IGxhYmVsIGxheWVyXG4gICAgICAuLi50aGlzLnJlbmRlclRleHRMYWJlbExheWVyKFxuICAgICAgICB7XG4gICAgICAgICAgZ2V0UG9zaXRpb246IGRhdGEuZ2V0UG9zaXRpb24sXG4gICAgICAgICAgc2hhcmVkUHJvcHMsXG4gICAgICAgICAgZ2V0UGl4ZWxPZmZzZXQsXG4gICAgICAgICAgdXBkYXRlVHJpZ2dlcnNcbiAgICAgICAgfSxcbiAgICAgICAgb3B0c1xuICAgICAgKVxuICAgIF07XG4gIH1cbn1cbiJdfQ==