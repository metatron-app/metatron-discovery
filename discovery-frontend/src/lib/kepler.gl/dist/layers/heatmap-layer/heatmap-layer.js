"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.heatmapVisConfigs = exports.pointColResolver = exports.pointPosAccessor = exports.MAX_ZOOM_LEVEL = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _reselect = require("reselect");

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _defaultSettings = require("../../constants/default-settings");

var _colorUtils = require("../../utils/color-utils");

var _mapboxglLayer = _interopRequireDefault(require("../mapboxgl-layer"));

var _heatmapLayerIcon = _interopRequireDefault(require("./heatmap-layer-icon"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MAX_ZOOM_LEVEL = 18;
exports.MAX_ZOOM_LEVEL = MAX_ZOOM_LEVEL;

var pointPosAccessor = function pointPosAccessor(_ref) {
  var lat = _ref.lat,
      lng = _ref.lng;
  return function (d) {
    return [// lng
    d[lng.fieldIdx], // lat
    d[lat.fieldIdx]];
  };
};

exports.pointPosAccessor = pointPosAccessor;

var pointColResolver = function pointColResolver(_ref2) {
  var lat = _ref2.lat,
      lng = _ref2.lng;
  return "".concat(lat.fieldIdx, "-").concat(lng.fieldIdx);
};

exports.pointColResolver = pointColResolver;
var heatmapVisConfigs = {
  opacity: 'opacity',
  colorRange: 'colorRange',
  radius: 'heatmapRadius'
};
/**
 *
 * @param {Object} colorRange
 * @return {Array} [
 *  0, "rgba(33,102,172,0)",
 *  0.2, "rgb(103,169,207)",
 *  0.4, "rgb(209,229,240)",
 *  0.6, "rgb(253,219,199)",
 *  0.8, "rgb(239,138,98)",
 *  1, "rgb(178,24,43)"
 * ]
 */

exports.heatmapVisConfigs = heatmapVisConfigs;

var heatmapDensity = function heatmapDensity(colorRange) {
  var scaleFunction = _defaultSettings.SCALE_FUNC.quantize;
  var colors = ['#000000'].concat((0, _toConsumableArray2["default"])(colorRange.colors));
  var scale = scaleFunction().domain([0, 1]).range(colors);
  var colorDensity = scale.range().reduce(function (bands, level) {
    var invert = scale.invertExtent(level);
    return [].concat((0, _toConsumableArray2["default"])(bands), [invert[0], // first value in the range
    "rgb(".concat((0, _colorUtils.hexToRgb)(level).join(','), ")") // color
    ]);
  }, []);
  colorDensity[1] = 'rgba(0,0,0,0)';
  return colorDensity;
};

var HeatmapLayer = /*#__PURE__*/function (_MapboxGLLayer) {
  (0, _inherits2["default"])(HeatmapLayer, _MapboxGLLayer);

  var _super = _createSuper(HeatmapLayer);

  function HeatmapLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HeatmapLayer);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "columnsSelector", function (config) {
      return pointColResolver(config.columns);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "visConfigSelector", function (config) {
      return config.visConfig;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "weightFieldSelector", function (config) {
      return config.weightField ? config.weightField.name : null;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "weightDomainSelector", function (config) {
      return config.weightDomain;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "paintSelector", (0, _reselect.createSelector)(_this.visConfigSelector, _this.weightFieldSelector, _this.weightDomainSelector, function (visConfig, weightField, weightDomain) {
      return {
        'heatmap-weight': weightField ? ['interpolate', ['linear'], ['get', weightField], weightDomain[0], 0, weightDomain[1], 1] : 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, MAX_ZOOM_LEVEL, 3],
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density']].concat((0, _toConsumableArray2["default"])(heatmapDensity(visConfig.colorRange))),
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, MAX_ZOOM_LEVEL, visConfig.radius // radius
        ],
        'heatmap-opacity': visConfig.opacity
      };
    }));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "computeHeatmapConfiguration", (0, _reselect.createSelector)(_this.sourceSelector, _this.filterSelector, _this.paintSelector, function (source, filter, paint) {
      return _objectSpread({
        type: 'heatmap',
        id: _this.id,
        source: source,
        layout: {
          visibility: 'visible'
        },
        maxzoom: MAX_ZOOM_LEVEL,
        paint: paint
      }, _this.isValidFilter(filter) ? {
        filter: filter
      } : {});
    }));

    _this.registerVisConfig(heatmapVisConfigs);

    _this.getPosition = (0, _lodash["default"])(pointPosAccessor, pointColResolver);
    return _this;
  }

  (0, _createClass2["default"])(HeatmapLayer, [{
    key: "getVisualChannelDescription",
    value: function getVisualChannelDescription(channel) {
      return channel === 'color' ? {
        label: 'property.color',
        measure: 'property.density'
      } : {
        label: 'property.weight',
        measure: this.config.weightField ? this.config.weightField.name : 'property.density'
      };
    }
  }, {
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // mapbox heatmap layer color is always based on density
      // no need to set colorField, colorDomain and colorScale

      /* eslint-disable no-unused-vars */
      var _get$call$weightField = _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(HeatmapLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        weightField: null,
        weightDomain: [0, 1],
        weightScale: 'linear'
      }),
          colorField = _get$call$weightField.colorField,
          colorDomain = _get$call$weightField.colorDomain,
          colorScale = _get$call$weightField.colorScale,
          layerConfig = (0, _objectWithoutProperties2["default"])(_get$call$weightField, ["colorField", "colorDomain", "colorScale"]);
      /* eslint-enable no-unused-vars */


      return layerConfig;
    }
  }, {
    key: "getPositionAccessor",
    value: function getPositionAccessor() {
      return this.getPosition(this.config.columns);
    }
  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData) {
      var getPosition = this.getPositionAccessor();
      var bounds = this.getPointsBounds(allData, function (d) {
        return getPosition(d);
      });
      this.updateMeta({
        bounds: bounds
      });
    }
  }, {
    key: "getGeometry",
    value: function getGeometry(position) {
      return position.every(Number.isFinite) ? {
        type: 'Point',
        coordinates: position
      } : null;
    }
  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, oldLayerData) {
      var weightField = this.config.weightField;
      var getPosition = this.getPositionAccessor();

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data;

      var newConfig = this.computeHeatmapConfiguration(this.config, datasets);
      newConfig.id = this.id;
      return {
        columns: this.config.columns,
        config: newConfig,
        data: data,
        weightField: weightField,
        getPosition: getPosition
      };
    }
  }, {
    key: "type",
    get: function get() {
      return 'heatmap';
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return {
        weight: {
          property: 'weight',
          field: 'weightField',
          scale: 'weightScale',
          domain: 'weightDomain',
          key: 'weight',
          // supportedFieldTypes can be determined by channelScaleType
          // or specified here
          defaultMeasure: 'property.density',
          supportedFieldTypes: [_defaultSettings.ALL_FIELD_TYPES.real, _defaultSettings.ALL_FIELD_TYPES.integer],
          channelScaleType: _defaultSettings.CHANNEL_SCALES.size
        }
      };
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _heatmapLayerIcon["default"];
    }
  }]);
  return HeatmapLayer;
}(_mapboxglLayer["default"]);

var _default = HeatmapLayer;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGVhdG1hcC1sYXllci9oZWF0bWFwLWxheWVyLmpzIl0sIm5hbWVzIjpbIk1BWF9aT09NX0xFVkVMIiwicG9pbnRQb3NBY2Nlc3NvciIsImxhdCIsImxuZyIsImQiLCJmaWVsZElkeCIsInBvaW50Q29sUmVzb2x2ZXIiLCJoZWF0bWFwVmlzQ29uZmlncyIsIm9wYWNpdHkiLCJjb2xvclJhbmdlIiwicmFkaXVzIiwiaGVhdG1hcERlbnNpdHkiLCJzY2FsZUZ1bmN0aW9uIiwiU0NBTEVfRlVOQyIsInF1YW50aXplIiwiY29sb3JzIiwic2NhbGUiLCJkb21haW4iLCJyYW5nZSIsImNvbG9yRGVuc2l0eSIsInJlZHVjZSIsImJhbmRzIiwibGV2ZWwiLCJpbnZlcnQiLCJpbnZlcnRFeHRlbnQiLCJqb2luIiwiSGVhdG1hcExheWVyIiwicHJvcHMiLCJjb25maWciLCJjb2x1bW5zIiwidmlzQ29uZmlnIiwid2VpZ2h0RmllbGQiLCJuYW1lIiwid2VpZ2h0RG9tYWluIiwidmlzQ29uZmlnU2VsZWN0b3IiLCJ3ZWlnaHRGaWVsZFNlbGVjdG9yIiwid2VpZ2h0RG9tYWluU2VsZWN0b3IiLCJzb3VyY2VTZWxlY3RvciIsImZpbHRlclNlbGVjdG9yIiwicGFpbnRTZWxlY3RvciIsInNvdXJjZSIsImZpbHRlciIsInBhaW50IiwidHlwZSIsImlkIiwibGF5b3V0IiwidmlzaWJpbGl0eSIsIm1heHpvb20iLCJpc1ZhbGlkRmlsdGVyIiwicmVnaXN0ZXJWaXNDb25maWciLCJnZXRQb3NpdGlvbiIsImNoYW5uZWwiLCJsYWJlbCIsIm1lYXN1cmUiLCJ3ZWlnaHRTY2FsZSIsImNvbG9yRmllbGQiLCJjb2xvckRvbWFpbiIsImNvbG9yU2NhbGUiLCJsYXllckNvbmZpZyIsImFsbERhdGEiLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwiYm91bmRzIiwiZ2V0UG9pbnRzQm91bmRzIiwidXBkYXRlTWV0YSIsInBvc2l0aW9uIiwiZXZlcnkiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImNvb3JkaW5hdGVzIiwiZGF0YXNldHMiLCJvbGRMYXllckRhdGEiLCJ1cGRhdGVEYXRhIiwiZGF0YSIsIm5ld0NvbmZpZyIsImNvbXB1dGVIZWF0bWFwQ29uZmlndXJhdGlvbiIsIndlaWdodCIsInByb3BlcnR5IiwiZmllbGQiLCJrZXkiLCJkZWZhdWx0TWVhc3VyZSIsInN1cHBvcnRlZEZpZWxkVHlwZXMiLCJBTExfRklFTERfVFlQRVMiLCJyZWFsIiwiaW50ZWdlciIsImNoYW5uZWxTY2FsZVR5cGUiLCJDSEFOTkVMX1NDQUxFUyIsInNpemUiLCJIZWF0bWFwTGF5ZXJJY29uIiwiTWFwYm94R0xMYXllciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFTyxJQUFNQSxjQUFjLEdBQUcsRUFBdkI7OztBQUVBLElBQU1DLGdCQUFnQixHQUFHLFNBQW5CQSxnQkFBbUI7QUFBQSxNQUFFQyxHQUFGLFFBQUVBLEdBQUY7QUFBQSxNQUFPQyxHQUFQLFFBQU9BLEdBQVA7QUFBQSxTQUFnQixVQUFBQyxDQUFDO0FBQUEsV0FBSSxDQUNuRDtBQUNBQSxJQUFBQSxDQUFDLENBQUNELEdBQUcsQ0FBQ0UsUUFBTCxDQUZrRCxFQUduRDtBQUNBRCxJQUFBQSxDQUFDLENBQUNGLEdBQUcsQ0FBQ0csUUFBTCxDQUprRCxDQUFKO0FBQUEsR0FBakI7QUFBQSxDQUF6Qjs7OztBQU9BLElBQU1DLGdCQUFnQixHQUFHLFNBQW5CQSxnQkFBbUI7QUFBQSxNQUFFSixHQUFGLFNBQUVBLEdBQUY7QUFBQSxNQUFPQyxHQUFQLFNBQU9BLEdBQVA7QUFBQSxtQkFBbUJELEdBQUcsQ0FBQ0csUUFBdkIsY0FBbUNGLEdBQUcsQ0FBQ0UsUUFBdkM7QUFBQSxDQUF6Qjs7O0FBRUEsSUFBTUUsaUJBQWlCLEdBQUc7QUFDL0JDLEVBQUFBLE9BQU8sRUFBRSxTQURzQjtBQUUvQkMsRUFBQUEsVUFB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QUFBQSxTQUFTLENBQUM3QixFQUFWLEdBQWUsS0FBS0EsRUFBcEI7QUFFQSxhQUFPO0FBQ0xmLFFBQUFBLE9BQU8sRUFBRSxLQUFLRCxNQUFMLENBQVlDLE9BRGhCO0FBRUxELFFBQUFBLE1BQU0sRUFBRTZDLFNBRkg7QUFHTEQsUUFBQUEsSUFBSSxFQUFKQSxJQUhLO0FBSUx6QyxRQUFBQSxXQUFXLEVBQVhBLFdBSks7QUFLTG1CLFFBQUFBLFdBQVcsRUFBWEE7QUFMSyxPQUFQO0FBT0Q7Ozt3QkEzSVU7QUFDVCxhQUFPLFNBQVA7QUFDRDs7O3dCQUVvQjtBQUNuQixhQUFPO0FBQ0x5QixRQUFBQSxNQUFNLEVBQUU7QUFDTkMsVUFBQUEsUUFBUSxFQUFFLFFBREo7QUFFTkMsVUFBQUEsS0FBSyxFQUFFLGFBRkQ7QUFHTjdELFVBQUFBLEtBQUssRUFBRSxhQUhEO0FBSU5DLFVBQUFBLE1BQU0sRUFBRSxjQUpGO0FBS042RCxVQUFBQSxHQUFHLEVBQUUsUUFMQztBQU1OO0FBQ0E7QUFDQUMsVUFBQUEsY0FBYyxFQUFFLGtCQVJWO0FBU05DLFVBQUFBLG1CQUFtQixFQUFFLENBQUNDLGlDQUFnQkMsSUFBakIsRUFBdUJELGlDQUFnQkUsT0FBdkMsQ0FUZjtBQVVOQyxVQUFBQSxnQkFBZ0IsRUFBRUMsZ0NBQWVDO0FBVjNCO0FBREgsT0FBUDtBQWNEOzs7d0JBRWU7QUFDZCxhQUFPQyw0QkFBUDtBQUNEOzs7RUE5QndCQyx5Qjs7ZUFxSlo5RCxZIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoLm1lbW9pemUnO1xuaW1wb3J0IHtDSEFOTkVMX1NDQUxFUywgU0NBTEVfRlVOQywgQUxMX0ZJRUxEX1RZUEVTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge2hleFRvUmdifSBmcm9tICd1dGlscy9jb2xvci11dGlscyc7XG5pbXBvcnQgTWFwYm94R0xMYXllciBmcm9tICcuLi9tYXBib3hnbC1sYXllcic7XG5pbXBvcnQgSGVhdG1hcExheWVySWNvbiBmcm9tICcuL2hlYXRtYXAtbGF5ZXItaWNvbic7XG5cbmV4cG9ydCBjb25zdCBNQVhfWk9PTV9MRVZFTCA9IDE4O1xuXG5leHBvcnQgY29uc3QgcG9pbnRQb3NBY2Nlc3NvciA9ICh7bGF0LCBsbmd9KSA9PiBkID0+IFtcbiAgLy8gbG5nXG4gIGRbbG5nLmZpZWxkSWR4XSxcbiAgLy8gbGF0XG4gIGRbbGF0LmZpZWxkSWR4XVxuXTtcblxuZXhwb3J0IGNvbnN0IHBvaW50Q29sUmVzb2x2ZXIgPSAoe2xhdCwgbG5nfSkgPT4gYCR7bGF0LmZpZWxkSWR4fS0ke2xuZy5maWVsZElkeH1gO1xuXG5leHBvcnQgY29uc3QgaGVhdG1hcFZpc0NvbmZpZ3MgPSB7XG4gIG9wYWNpdHk6ICdvcGFjaXR5JyxcbiAgY29sb3JSYW5nZTogJ2NvbG9yUmFuZ2UnLFxuICByYWRpdXM6ICdoZWF0bWFwUmFkaXVzJ1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbG9yUmFuZ2VcbiAqIEByZXR1cm4ge0FycmF5fSBbXG4gKiAgMCwgXCJyZ2JhKDMzLDEwMiwxNzIsMClcIixcbiAqICAwLjIsIFwicmdiKDEwMywxNjksMjA3KVwiLFxuICogIDAuNCwgXCJyZ2IoMjA5LDIyOSwyNDApXCIsXG4gKiAgMC42LCBcInJnYigyNTMsMjE5LDE5OSlcIixcbiAqICAwLjgsIFwicmdiKDIzOSwxMzgsOTgpXCIsXG4gKiAgMSwgXCJyZ2IoMTc4LDI0LDQzKVwiXG4gKiBdXG4gKi9cbmNvbnN0IGhlYXRtYXBEZW5zaXR5ID0gY29sb3JSYW5nZSA9PiB7XG4gIGNvbnN0IHNjYWxlRnVuY3Rpb24gPSBTQ0FMRV9GVU5DLnF1YW50aXplO1xuXG4gIGNvbnN0IGNvbG9ycyA9IFsnIzAwMDAwMCcsIC4uLmNvbG9yUmFuZ2UuY29sb3JzXTtcblxuICBjb25zdCBzY2FsZSA9IHNjYWxlRnVuY3Rpb24oKVxuICAgIC5kb21haW4oWzAsIDFdKVxuICAgIC5yYW5nZShjb2xvcnMpO1xuXG4gIGNvbnN0IGNvbG9yRGVuc2l0eSA9IHNjYWxlLnJhbmdlKCkucmVkdWNlKChiYW5kcywgbGV2ZWwpID0+IHtcbiAgICBjb25zdCBpbnZlcnQgPSBzY2FsZS5pbnZlcnRFeHRlbnQobGV2ZWwpO1xuICAgIHJldHVybiBbXG4gICAgICAuLi5iYW5kcyxcbiAgICAgIGludmVydFswXSwgLy8gZmlyc3QgdmFsdWUgaW4gdGhlIHJhbmdlXG4gICAgICBgcmdiKCR7aGV4VG9SZ2IobGV2ZWwpLmpvaW4oJywnKX0pYCAvLyBjb2xvclxuICAgIF07XG4gIH0sIFtdKTtcbiAgY29sb3JEZW5zaXR5WzFdID0gJ3JnYmEoMCwwLDAsMCknO1xuICByZXR1cm4gY29sb3JEZW5zaXR5O1xufTtcblxuY2xhc3MgSGVhdG1hcExheWVyIGV4dGVuZHMgTWFwYm94R0xMYXllciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMucmVnaXN0ZXJWaXNDb25maWcoaGVhdG1hcFZpc0NvbmZpZ3MpO1xuICAgIHRoaXMuZ2V0UG9zaXRpb24gPSBtZW1vaXplKHBvaW50UG9zQWNjZXNzb3IsIHBvaW50Q29sUmVzb2x2ZXIpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICdoZWF0bWFwJztcbiAgfVxuXG4gIGdldCB2aXN1YWxDaGFubmVscygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2VpZ2h0OiB7XG4gICAgICAgIHByb3BlcnR5OiAnd2VpZ2h0JyxcbiAgICAgICAgZmllbGQ6ICd3ZWlnaHRGaWVsZCcsXG4gICAgICAgIHNjYWxlOiAnd2VpZ2h0U2NhbGUnLFxuICAgICAgICBkb21haW46ICd3ZWlnaHREb21haW4nLFxuICAgICAgICBrZXk6ICd3ZWlnaHQnLFxuICAgICAgICAvLyBzdXBwb3J0ZWRGaWVsZFR5cGVzIGNhbiBiZSBkZXRlcm1pbmVkIGJ5IGNoYW5uZWxTY2FsZVR5cGVcbiAgICAgICAgLy8gb3Igc3BlY2lmaWVkIGhlcmVcbiAgICAgICAgZGVmYXVsdE1lYXN1cmU6ICdwcm9wZXJ0eS5kZW5zaXR5JyxcbiAgICAgICAgc3VwcG9ydGVkRmllbGRUeXBlczogW0FMTF9GSUVMRF9UWVBFUy5yZWFsLCBBTExfRklFTERfVFlQRVMuaW50ZWdlcl0sXG4gICAgICAgIGNoYW5uZWxTY2FsZVR5cGU6IENIQU5ORUxfU0NBTEVTLnNpemVcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0IGxheWVySWNvbigpIHtcbiAgICByZXR1cm4gSGVhdG1hcExheWVySWNvbjtcbiAgfVxuXG4gIGdldFZpc3VhbENoYW5uZWxEZXNjcmlwdGlvbihjaGFubmVsKSB7XG4gICAgcmV0dXJuIGNoYW5uZWwgPT09ICdjb2xvcidcbiAgICAgID8ge1xuICAgICAgICAgIGxhYmVsOiAncHJvcGVydHkuY29sb3InLFxuICAgICAgICAgIG1lYXN1cmU6ICdwcm9wZXJ0eS5kZW5zaXR5J1xuICAgICAgICB9XG4gICAgICA6IHtcbiAgICAgICAgICBsYWJlbDogJ3Byb3BlcnR5LndlaWdodCcsXG4gICAgICAgICAgbWVhc3VyZTogdGhpcy5jb25maWcud2VpZ2h0RmllbGQgPyB0aGlzLmNvbmZpZy53ZWlnaHRGaWVsZC5uYW1lIDogJ3Byb3BlcnR5LmRlbnNpdHknXG4gICAgICAgIH07XG4gIH1cblxuICBnZXREZWZhdWx0TGF5ZXJDb25maWcocHJvcHMgPSB7fSkge1xuICAgIC8vIG1hcGJveCBoZWF0bWFwIGxheWVyIGNvbG9yIGlzIGFsd2F5cyBiYXNlZCBvbiBkZW5zaXR5XG4gICAgLy8gbm8gbmVlZCB0byBzZXQgY29sb3JGaWVsZCwgY29sb3JEb21haW4gYW5kIGNvbG9yU2NhbGVcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGNvbnN0IHtjb2xvckZpZWxkLCBjb2xvckRvbWFpbiwgY29sb3JTY2FsZSwgLi4ubGF5ZXJDb25maWd9ID0ge1xuICAgICAgLi4uc3VwZXIuZ2V0RGVmYXVsdExheWVyQ29uZmlnKHByb3BzKSxcblxuICAgICAgd2VpZ2h0RmllbGQ6IG51bGwsXG4gICAgICB3ZWlnaHREb21haW46IFswLCAxXSxcbiAgICAgIHdlaWdodFNjYWxlOiAnbGluZWFyJ1xuICAgIH07XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgcmV0dXJuIGxheWVyQ29uZmlnO1xuICB9XG5cbiAgZ2V0UG9zaXRpb25BY2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQb3NpdGlvbih0aGlzLmNvbmZpZy5jb2x1bW5zKTtcbiAgfVxuXG4gIHVwZGF0ZUxheWVyTWV0YShhbGxEYXRhKSB7XG4gICAgY29uc3QgZ2V0UG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uQWNjZXNzb3IoKTtcbiAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldFBvaW50c0JvdW5kcyhhbGxEYXRhLCBkID0+IGdldFBvc2l0aW9uKGQpKTtcbiAgICB0aGlzLnVwZGF0ZU1ldGEoe2JvdW5kc30pO1xuICB9XG5cbiAgY29sdW1uc1NlbGVjdG9yID0gY29uZmlnID0+IHBvaW50Q29sUmVzb2x2ZXIoY29uZmlnLmNvbHVtbnMpO1xuICB2aXNDb25maWdTZWxlY3RvciA9IGNvbmZpZyA9PiBjb25maWcudmlzQ29uZmlnO1xuICB3ZWlnaHRGaWVsZFNlbGVjdG9yID0gY29uZmlnID0+IChjb25maWcud2VpZ2h0RmllbGQgPyBjb25maWcud2VpZ2h0RmllbGQubmFtZSA6IG51bGwpO1xuICB3ZWlnaHREb21haW5TZWxlY3RvciA9IGNvbmZpZyA9PiBjb25maWcud2VpZ2h0RG9tYWluO1xuXG4gIHBhaW50U2VsZWN0b3IgPSBjcmVhdGVTZWxlY3RvcihcbiAgICB0aGlzLnZpc0NvbmZpZ1NlbGVjdG9yLFxuICAgIHRoaXMud2VpZ2h0RmllbGRTZWxlY3RvcixcbiAgICB0aGlzLndlaWdodERvbWFpblNlbGVjdG9yLFxuICAgICh2aXNDb25maWcsIHdlaWdodEZpZWxkLCB3ZWlnaHREb21haW4pID0+ICh7XG4gICAgICAnaGVhdG1hcC13ZWlnaHQnOiB3ZWlnaHRGaWVsZFxuICAgICAgICA/IFsnaW50ZXJwb2xhdGUnLCBbJ2xpbmVhciddLCBbJ2dldCcsIHdlaWdodEZpZWxkXSwgd2VpZ2h0RG9tYWluWzBdLCAwLCB3ZWlnaHREb21haW5bMV0sIDFdXG4gICAgICAgIDogMSxcbiAgICAgICdoZWF0bWFwLWludGVuc2l0eSc6IFsnaW50ZXJwb2xhdGUnLCBbJ2xpbmVhciddLCBbJ3pvb20nXSwgMCwgMSwgTUFYX1pPT01fTEVWRUwsIDNdLFxuICAgICAgJ2hlYXRtYXAtY29sb3InOiBbXG4gICAgICAgICdpbnRlcnBvbGF0ZScsXG4gICAgICAgIFsnbGluZWFyJ10sXG4gICAgICAgIFsnaGVhdG1hcC1kZW5zaXR5J10sXG4gICAgICAgIC4uLmhlYXRtYXBEZW5zaXR5KHZpc0NvbmZpZy5jb2xvclJhbmdlKVxuICAgICAgXSxcbiAgICAgICdoZWF0bWFwLXJhZGl1cyc6IFtcbiAgICAgICAgJ2ludGVycG9sYXRlJyxcbiAgICAgICAgWydsaW5lYXInXSxcbiAgICAgICAgWyd6b29tJ10sXG4gICAgICAgIDAsXG4gICAgICAgIDIsXG4gICAgICAgIE1BWF9aT09NX0xFVkVMLFxuICAgICAgICB2aXNDb25maWcucmFkaXVzIC8vIHJhZGl1c1xuICAgICAgXSxcbiAgICAgICdoZWF0bWFwLW9wYWNpdHknOiB2aXNDb25maWcub3BhY2l0eVxuICAgIH0pXG4gICk7XG5cbiAgY29tcHV0ZUhlYXRtYXBDb25maWd1cmF0aW9uID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgdGhpcy5zb3VyY2VTZWxlY3RvcixcbiAgICB0aGlzLmZpbHRlclNlbGVjdG9yLFxuICAgIHRoaXMucGFpbnRTZWxlY3RvcixcbiAgICAoc291cmNlLCBmaWx0ZXIsIHBhaW50KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaGVhdG1hcCcsXG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIGxheW91dDoge1xuICAgICAgICAgIHZpc2liaWxpdHk6ICd2aXNpYmxlJ1xuICAgICAgICB9LFxuICAgICAgICBtYXh6b29tOiBNQVhfWk9PTV9MRVZFTCxcbiAgICAgICAgcGFpbnQsXG4gICAgICAgIC4uLih0aGlzLmlzVmFsaWRGaWx0ZXIoZmlsdGVyKSA/IHtmaWx0ZXJ9IDoge30pXG4gICAgICB9O1xuICAgIH1cbiAgKTtcblxuICBnZXRHZW9tZXRyeShwb3NpdGlvbikge1xuICAgIHJldHVybiBwb3NpdGlvbi5ldmVyeShOdW1iZXIuaXNGaW5pdGUpXG4gICAgICA/IHtcbiAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBwb3NpdGlvblxuICAgICAgICB9XG4gICAgICA6IG51bGw7XG4gIH1cblxuICBmb3JtYXRMYXllckRhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSkge1xuICAgIGNvbnN0IHt3ZWlnaHRGaWVsZH0gPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCBnZXRQb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb25BY2Nlc3NvcigpO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMudXBkYXRlRGF0YShkYXRhc2V0cywgb2xkTGF5ZXJEYXRhKTtcblxuICAgIGNvbnN0IG5ld0NvbmZpZyA9IHRoaXMuY29tcHV0ZUhlYXRtYXBDb25maWd1cmF0aW9uKHRoaXMuY29uZmlnLCBkYXRhc2V0cyk7XG4gICAgbmV3Q29uZmlnLmlkID0gdGhpcy5pZDtcblxuICAgIHJldHVybiB7XG4gICAgICBjb2x1bW5zOiB0aGlzLmNvbmZpZy5jb2x1bW5zLFxuICAgICAgY29uZmlnOiBuZXdDb25maWcsXG4gICAgICBkYXRhLFxuICAgICAgd2VpZ2h0RmllbGQsXG4gICAgICBnZXRQb3NpdGlvblxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhdG1hcExheWVyO1xuIl19