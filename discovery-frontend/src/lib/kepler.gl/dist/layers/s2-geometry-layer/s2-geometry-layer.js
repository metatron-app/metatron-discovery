"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.S2VisConfigs = exports.defaultLineWidth = exports.defaultElevation = exports.S2TokenAccessor = exports.s2RequiredColumns = exports.S2_TOKEN_FIELDS = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _geoLayers = require("@deck.gl/geo-layers");

var _colorUtils = require("../../utils/color-utils");

var _defaultSettings = require("../../constants/default-settings");

var _layerFactory = require("../layer-factory");

var _baseLayer = _interopRequireDefault(require("../base-layer"));

var _s2LayerIcon = _interopRequireDefault(require("./s2-layer-icon"));

var _s2Utils = require("./s2-utils");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var zoomFactorValue = 8;
var S2_TOKEN_FIELDS = {
  token: ['s2', 's2_token']
};
exports.S2_TOKEN_FIELDS = S2_TOKEN_FIELDS;
var s2RequiredColumns = ['token'];
exports.s2RequiredColumns = s2RequiredColumns;

var S2TokenAccessor = function S2TokenAccessor(_ref) {
  var token = _ref.token;
  return function (d) {
    return d[token.fieldIdx];
  };
};

exports.S2TokenAccessor = S2TokenAccessor;
var defaultElevation = 500;
exports.defaultElevation = defaultElevation;
var defaultLineWidth = 1;
exports.defaultLineWidth = defaultLineWidth;
var S2VisConfigs = {
  // Filled color
  opacity: 'opacity',
  colorRange: 'colorRange',
  filled: {
    type: 'boolean',
    label: 'Fill Color',
    defaultValue: true,
    property: 'filled'
  },
  // stroke
  thickness: _objectSpread(_objectSpread({}, _layerFactory.LAYER_VIS_CONFIGS.thickness), {}, {
    defaultValue: 0.5
  }),
  strokeColor: 'strokeColor',
  strokeColorRange: 'strokeColorRange',
  sizeRange: 'strokeWidthRange',
  stroked: 'stroked',
  // height
  enable3d: 'enable3d',
  elevationScale: 'elevationScale',
  heightRange: 'elevationRange',
  // wireframe
  wireframe: 'wireframe'
};
exports.S2VisConfigs = S2VisConfigs;

var S2GeometryLayer = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(S2GeometryLayer, _Layer);

  var _super = _createSuper(S2GeometryLayer);

  function S2GeometryLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, S2GeometryLayer);
    _this = _super.call(this, props);

    _this.registerVisConfig(S2VisConfigs);

    _this.getPositionAccessor = function () {
      return S2TokenAccessor(_this.config.columns);
    };

    return _this;
  }

  (0, _createClass2["default"])(S2GeometryLayer, [{
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(S2GeometryLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        // add height visual channel
        heightField: null,
        heightDomain: [0, 1],
        heightScale: 'linear',
        // add stroke color visual channel
        strokeColorField: null,
        strokeColorDomain: [0, 1],
        strokeColorScale: 'quantile'
      });
    }
  }, {
    key: "calculateDataAttribute",
    value: function calculateDataAttribute(_ref2, getS2Token) {
      var allData = _ref2.allData,
          filteredIndex = _ref2.filteredIndex;
      var data = [];

      for (var i = 0; i < filteredIndex.length; i++) {
        var index = filteredIndex[i];
        var token = getS2Token(allData[index]);

        if (token) {
          data.push({
            // keep a reference to the original data index
            index: index,
            data: allData[index],
            token: token
          });
        }
      }

      return data;
    }
  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData, getS2Token) {
      var centroids = allData.reduce(function (acc, entry) {
        var s2Token = getS2Token(entry);
        return s2Token ? [].concat((0, _toConsumableArray2["default"])(acc), [(0, _s2Utils.getS2Center)(s2Token)]) : acc;
      }, []);
      var bounds = this.getPointsBounds(centroids);
      this.dataToFeature = {
        centroids: centroids
      };
      this.updateMeta({
        bounds: bounds
      });
    }
    /* eslint-disable complexity */

  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, oldLayerData) {
      var _this2 = this;

      var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _this$config = this.config,
          colorScale = _this$config.colorScale,
          colorDomain = _this$config.colorDomain,
          colorField = _this$config.colorField,
          color = _this$config.color,
          heightField = _this$config.heightField,
          heightDomain = _this$config.heightDomain,
          heightScale = _this$config.heightScale,
          strokeColorField = _this$config.strokeColorField,
          strokeColorScale = _this$config.strokeColorScale,
          strokeColorDomain = _this$config.strokeColorDomain,
          sizeScale = _this$config.sizeScale,
          sizeDomain = _this$config.sizeDomain,
          sizeField = _this$config.sizeField,
          visConfig = _this$config.visConfig;
      var enable3d = visConfig.enable3d,
          stroked = visConfig.stroked,
          colorRange = visConfig.colorRange,
          heightRange = visConfig.heightRange,
          sizeRange = visConfig.sizeRange,
          strokeColorRange = visConfig.strokeColorRange,
          strokeColor = visConfig.strokeColor;
      var gpuFilter = datasets[this.config.dataId].gpuFilter;
      var getS2Token = this.getPositionAccessor();

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data;

      var cScale = colorField && this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(_colorUtils.hexToRgb)); // calculate elevation scale - if extruded = true

      var eScale = heightField && enable3d && this.getVisChannelScale(heightScale, heightDomain, heightRange); // stroke color

      var scScale = strokeColorField && this.getVisChannelScale(strokeColorScale, strokeColorDomain, strokeColorRange.colors.map(_colorUtils.hexToRgb)); // calculate stroke scale - if stroked = true

      var sScale = sizeField && stroked && this.getVisChannelScale(sizeScale, sizeDomain, sizeRange);
      return {
        data: data,
        getS2Token: getS2Token,
        getLineColor: function getLineColor(d) {
          return scScale ? _this2.getEncodedChannelValue(scScale, d.data, strokeColorField) : strokeColor || color;
        },
        getLineWidth: function getLineWidth(d) {
          return sScale ? _this2.getEncodedChannelValue(sScale, d.data, sizeField, 0) : defaultLineWidth;
        },
        getFillColor: function getFillColor(d) {
          return cScale ? _this2.getEncodedChannelValue(cScale, d.data, colorField) : color;
        },
        getElevation: function getElevation(d) {
          return eScale ? _this2.getEncodedChannelValue(eScale, d.data, heightField, 0) : defaultElevation;
        },
        getFilterValue: gpuFilter.filterValueAccessor()
      };
    }
    /* eslint-enable complexity */

  }, {
    key: "renderLayer",
    value: function renderLayer(opts) {
      var data = opts.data,
          gpuFilter = opts.gpuFilter,
          interactionConfig = opts.interactionConfig,
          mapState = opts.mapState;
      var defaultLayerProps = this.getDefaultDeckLayerProps(opts);
      var eleZoomFactor = this.getElevationZoomFactor(mapState);
      var zoomFactor = this.getZoomFactor(mapState);
      var config = this.config;
      var visConfig = config.visConfig;
      var updateTriggers = {
        getLineColor: {
          color: visConfig.strokeColor,
          colorField: config.strokeColorField,
          colorRange: visConfig.strokeColorRange,
          colorScale: config.strokeColorScale
        },
        getLineWidth: {
          sizeField: config.sizeField,
          sizeRange: visConfig.sizeRange
        },
        getFillColor: {
          color: config.color,
          colorField: config.colorField,
          colorRange: visConfig.colorRange,
          colorScale: config.colorScale
        },
        getElevation: {
          heightField: config.heightField,
          heightScaleType: config.heightScale,
          heightRange: visConfig.heightRange
        },
        getFilterValue: gpuFilter.filterValueUpdateTriggers
      };
      return [new _geoLayers.S2Layer(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, defaultLayerProps), interactionConfig), data), {}, {
        getS2Token: function getS2Token(d) {
          return d.token;
        },
        autoHighlight: visConfig.enable3d,
        highlightColor: _defaultSettings.HIGHLIGH_COLOR_3D,
        // stroke
        lineWidthScale: visConfig.thickness * zoomFactor * zoomFactorValue,
        stroked: visConfig.stroked,
        lineMiterLimit: 2,
        // Filled color
        filled: visConfig.filled,
        opacity: visConfig.opacity,
        wrapLongitude: false,
        // Elevation
        elevationScale: visConfig.elevationScale * eleZoomFactor,
        extruded: visConfig.enable3d,
        wireframe: visConfig.wireframe,
        pickable: true,
        updateTriggers: updateTriggers
      }))];
    }
  }, {
    key: "type",
    get: function get() {
      return 's2';
    }
  }, {
    key: "name",
    get: function get() {
      return 'S2';
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return s2RequiredColumns;
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _s2LayerIcon["default"];
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(S2GeometryLayer.prototype), "visualChannels", this)), {}, {
        color: {
          property: 'color',
          field: 'colorField',
          scale: 'colorScale',
          domain: 'colorDomain',
          range: 'colorRange',
          key: 'color',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.color
        },
        size: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(S2GeometryLayer.prototype), "visualChannels", this).size), {}, {
          property: 'stroke',
          condition: function condition(config) {
            return config.visConfig.stroked;
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
            return config.visConfig.stroked;
          }
        },
        height: {
          property: 'height',
          field: 'heightField',
          scale: 'heightScale',
          domain: 'heightDomain',
          range: 'heightRange',
          key: 'height',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.size,
          condition: function condition(config) {
            return config.visConfig.enable3d;
          }
        }
      });
    }
  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(_ref3) {
      var _ref3$fields = _ref3.fields,
          fields = _ref3$fields === void 0 ? [] : _ref3$fields;
      var foundColumns = this.findDefaultColumnField(S2_TOKEN_FIELDS, fields);

      if (!foundColumns || !foundColumns.length) {
        return {
          props: []
        };
      }

      return {
        props: foundColumns.map(function (columns) {
          return {
            isVisible: true,
            label: 'S2',
            columns: columns
          };
        })
      };
    }
  }]);
  return S2GeometryLayer;
}(_baseLayer["default"]);

exports["default"] = S2GeometryLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvczItZ2VvbWV0cnktbGF5ZXIvczItZ2VvbWV0cnktbGF5ZXIuanMiXSwibmFtZXMiOlsiem9vbUZhY3RvclZhbHVlIiwiUzJfVE9LRU5fRklFTERTIiwidG9rZW4iLCJzMlJlcXVpcmVkQ29sdW1ucyIsIlMyVG9rZW5BY2Nlc3NvciIsImQiLCJmaWVsZElkeCIsImRlZmF1bHRFbGV2YXRpb24iLCJkZWZhdWx0TGluZVdpZHRoIiwiUzJWaXNDb25maWdzIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJmaWxsZWQiLCJ0eXBlIiwibGFiZWwiLCJkZWZhdWx0VmFsdWUiLCJwcm9wZXJ0eSIsInRoaWNrbmVzcyIsIkxBWUVSX1ZJU19DT05GSUdTIiwic3Ryb2tlQ29sb3IiLCJzdHJva2VDb2xvclJhbmdlIiwic2l6ZVJhbmdlIiwic3Ryb2tlZCIsImVuYWJsZTNkIiwiZWxldmF0aW9uU2NhbGUiLCJoZWlnaHRSYW5nZSIsIndpcmVmcmFtZSIsIlMyR2VvbWV0cnlMYXllciIsInByb3BzIiwicmVnaXN0ZXJWaXNDb25maWciLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwiY29uZmlnIiwiY29sdW1ucyIsImhlaWdodEZpZWxkIiwiaGVpZ2h0RG9tYWluIiwiaGVpZ2h0U2NhbGUiLCJzdHJva2VDb2xvckZpZWxkIiwic3Ryb2tlQ29sb3JEb21haW4iLCJzdHJva2VDb2xvclNjYWxlIiwiZ2V0UzJUb2tlbiIsImFsbERhdGEiLCJmaWx0ZXJlZEluZGV4IiwiZGF0YSIsImkiLCJsZW5ndGgiLCJpbmRleCIsInB1c2giLCJjZW50cm9pZHMiLCJyZWR1Y2UiLCJhY2MiLCJlbnRyeSIsInMyVG9rZW4iLCJib3VuZHMiLCJnZXRQb2ludHNCb3VuZHMiLCJkYXRhVG9GZWF0dXJlIiwidXBkYXRlTWV0YSIsImRhdGFzZXRzIiwib2xkTGF5ZXJEYXRhIiwib3B0IiwiY29sb3JTY2FsZSIsImNvbG9yRG9tYWluIiwiY29sb3JGaWVsZCIsImNvbG9yIiwic2l6ZVNjYWxlIiwic2l6ZURvbWFpbiIsInNpemVGaWVsZCIsInZpc0NvbmZpZyIsImdwdUZpbHRlciIsImRhdGFJZCIsInVwZGF0ZURhdGEiLCJjU2NhbGUiLCJnZXRWaXNDaGFubmVsU2NhbGUiLCJjb2xvcnMiLCJtYXAiLCJoZXhUb1JnYiIsImVTY2FsZSIsInNjU2NhbGUiLCJzU2NhbGUiLCJnZXRMaW5lQ29sb3IiLCJnZXRFbmNvZGVkQ2hhbm5lbFZhbHVlIiwiZ2V0TGluZVdpZHRoIiwiZ2V0RmlsbENvbG9yIiwiZ2V0RWxldmF0aW9uIiwiZ2V0RmlsdGVyVmFsdWUiLCJmaWx0ZXJWYWx1ZUFjY2Vzc29yIiwib3B0cyIsImludGVyYWN0aW9uQ29uZmlnIiwibWFwU3RhdGUiLCJkZWZhdWx0TGF5ZXJQcm9wcyIsImdldERlZmF1bHREZWNrTGF5ZXJQcm9wcyIsImVsZVpvb21GYWN0b3IiLCJnZXRFbGV2YXRpb25ab29tRmFjdG9yIiwiem9vbUZhY3RvciIsImdldFpvb21GYWN0b3IiLCJ1cGRhdGVUcmlnZ2VycyIsImhlaWdodFNjYWxlVHlwZSIsImZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnMiLCJTMkxheWVyIiwiYXV0b0hpZ2hsaWdodCIsImhpZ2hsaWdodENvbG9yIiwiSElHSExJR0hfQ09MT1JfM0QiLCJsaW5lV2lkdGhTY2FsZSIsImxpbmVNaXRlckxpbWl0Iiwid3JhcExvbmdpdHVkZSIsImV4dHJ1ZGVkIiwicGlja2FibGUiLCJTMkxheWVySWNvbiIsImZpZWxkIiwic2NhbGUiLCJkb21haW4iLCJyYW5nZSIsImtleSIsImNoYW5uZWxTY2FsZVR5cGUiLCJDSEFOTkVMX1NDQUxFUyIsInNpemUiLCJjb25kaXRpb24iLCJoZWlnaHQiLCJmaWVsZHMiLCJmb3VuZENvbHVtbnMiLCJmaW5kRGVmYXVsdENvbHVtbkZpZWxkIiwiaXNWaXNpYmxlIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7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WSxDQUFDN0MsR0FBYixDQUFpQixVQUFBekMsT0FBTztBQUFBLGlCQUFLO0FBQ2xDd0YsWUFBQUEsU0FBUyxFQUFFLElBRHVCO0FBRWxDMUcsWUFBQUEsS0FBSyxFQUFFLElBRjJCO0FBR2xDa0IsWUFBQUEsT0FBTyxFQUFQQTtBQUhrQyxXQUFMO0FBQUEsU0FBeEI7QUFERixPQUFQO0FBT0Q7OztFQTVGMEN5RixxQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7UzJMYXllcn0gZnJvbSAnQGRlY2suZ2wvZ2VvLWxheWVycyc7XG5pbXBvcnQge2hleFRvUmdifSBmcm9tICd1dGlscy9jb2xvci11dGlscyc7XG5pbXBvcnQge0hJR0hMSUdIX0NPTE9SXzNELCBDSEFOTkVMX1NDQUxFU30gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuaW1wb3J0IHtMQVlFUl9WSVNfQ09ORklHU30gZnJvbSAnbGF5ZXJzL2xheWVyLWZhY3RvcnknO1xuaW1wb3J0IExheWVyIGZyb20gJy4uL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IFMyTGF5ZXJJY29uIGZyb20gJy4vczItbGF5ZXItaWNvbic7XG5pbXBvcnQge2dldFMyQ2VudGVyfSBmcm9tICcuL3MyLXV0aWxzJztcblxuY29uc3Qgem9vbUZhY3RvclZhbHVlID0gODtcblxuZXhwb3J0IGNvbnN0IFMyX1RPS0VOX0ZJRUxEUyA9IHtcbiAgdG9rZW46IFsnczInLCAnczJfdG9rZW4nXVxufTtcblxuZXhwb3J0IGNvbnN0IHMyUmVxdWlyZWRDb2x1bW5zID0gWyd0b2tlbiddO1xuZXhwb3J0IGNvbnN0IFMyVG9rZW5BY2Nlc3NvciA9ICh7dG9rZW59KSA9PiBkID0+IGRbdG9rZW4uZmllbGRJZHhdO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRFbGV2YXRpb24gPSA1MDA7XG5leHBvcnQgY29uc3QgZGVmYXVsdExpbmVXaWR0aCA9IDE7XG5cbmV4cG9ydCBjb25zdCBTMlZpc0NvbmZpZ3MgPSB7XG4gIC8vIEZpbGxlZCBjb2xvclxuICBvcGFjaXR5OiAnb3BhY2l0eScsXG4gIGNvbG9yUmFuZ2U6ICdjb2xvclJhbmdlJyxcbiAgZmlsbGVkOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGxhYmVsOiAnRmlsbCBDb2xvcicsXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxuICAgIHByb3BlcnR5OiAnZmlsbGVkJ1xuICB9LFxuXG4gIC8vIHN0cm9rZVxuICB0aGlja25lc3M6IHtcbiAgICAuLi5MQVlFUl9WSVNfQ09ORklHUy50aGlja25lc3MsXG4gICAgZGVmYXVsdFZhbHVlOiAwLjVcbiAgfSxcbiAgc3Ryb2tlQ29sb3I6ICdzdHJva2VDb2xvcicsXG4gIHN0cm9rZUNvbG9yUmFuZ2U6ICdzdHJva2VDb2xvclJhbmdlJyxcbiAgc2l6ZVJhbmdlOiAnc3Ryb2tlV2lkdGhSYW5nZScsXG4gIHN0cm9rZWQ6ICdzdHJva2VkJyxcblxuICAvLyBoZWlnaHRcbiAgZW5hYmxlM2Q6ICdlbmFibGUzZCcsXG4gIGVsZXZhdGlvblNjYWxlOiAnZWxldmF0aW9uU2NhbGUnLFxuICBoZWlnaHRSYW5nZTogJ2VsZXZhdGlvblJhbmdlJyxcblxuICAvLyB3aXJlZnJhbWVcbiAgd2lyZWZyYW1lOiAnd2lyZWZyYW1lJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUzJHZW9tZXRyeUxheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnJlZ2lzdGVyVmlzQ29uZmlnKFMyVmlzQ29uZmlncyk7XG4gICAgdGhpcy5nZXRQb3NpdGlvbkFjY2Vzc29yID0gKCkgPT4gUzJUb2tlbkFjY2Vzc29yKHRoaXMuY29uZmlnLmNvbHVtbnMpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICdzMic7XG4gIH1cblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gJ1MyJztcbiAgfVxuXG4gIGdldCByZXF1aXJlZExheWVyQ29sdW1ucygpIHtcbiAgICByZXR1cm4gczJSZXF1aXJlZENvbHVtbnM7XG4gIH1cblxuICBnZXQgbGF5ZXJJY29uKCkge1xuICAgIHJldHVybiBTMkxheWVySWNvbjtcbiAgfVxuXG4gIGdldCB2aXN1YWxDaGFubmVscygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3VwZXIudmlzdWFsQ2hhbm5lbHMsXG4gICAgICBjb2xvcjoge1xuICAgICAgICBwcm9wZXJ0eTogJ2NvbG9yJyxcbiAgICAgICAgZmllbGQ6ICdjb2xvckZpZWxkJyxcbiAgICAgICAgc2NhbGU6ICdjb2xvclNjYWxlJyxcbiAgICAgICAgZG9tYWluOiAnY29sb3JEb21haW4nLFxuICAgICAgICByYW5nZTogJ2NvbG9yUmFuZ2UnLFxuICAgICAgICBrZXk6ICdjb2xvcicsXG4gICAgICAgIGNoYW5uZWxTY2FsZVR5cGU6IENIQU5ORUxfU0NBTEVTLmNvbG9yXG4gICAgICB9LFxuICAgICAgc2l6ZToge1xuICAgICAgICAuLi5zdXBlci52aXN1YWxDaGFubmVscy5zaXplLFxuICAgICAgICBwcm9wZXJ0eTogJ3N0cm9rZScsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuc3Ryb2tlZFxuICAgICAgfSxcbiAgICAgIHN0cm9rZUNvbG9yOiB7XG4gICAgICAgIHByb3BlcnR5OiAnc3Ryb2tlQ29sb3InLFxuICAgICAgICBmaWVsZDogJ3N0cm9rZUNvbG9yRmllbGQnLFxuICAgICAgICBzY2FsZTogJ3N0cm9rZUNvbG9yU2NhbGUnLFxuICAgICAgICBkb21haW46ICdzdHJva2VDb2xvckRvbWFpbicsXG4gICAgICAgIHJhbmdlOiAnc3Ryb2tlQ29sb3JSYW5nZScsXG4gICAgICAgIGtleTogJ3N0cm9rZUNvbG9yJyxcbiAgICAgICAgY2hhbm5lbFNjYWxlVHlwZTogQ0hBTk5FTF9TQ0FMRVMuY29sb3IsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuc3Ryb2tlZFxuICAgICAgfSxcbiAgICAgIGhlaWdodDoge1xuICAgICAgICBwcm9wZXJ0eTogJ2hlaWdodCcsXG4gICAgICAgIGZpZWxkOiAnaGVpZ2h0RmllbGQnLFxuICAgICAgICBzY2FsZTogJ2hlaWdodFNjYWxlJyxcbiAgICAgICAgZG9tYWluOiAnaGVpZ2h0RG9tYWluJyxcbiAgICAgICAgcmFuZ2U6ICdoZWlnaHRSYW5nZScsXG4gICAgICAgIGtleTogJ2hlaWdodCcsXG4gICAgICAgIGNoYW5uZWxTY2FsZVR5cGU6IENIQU5ORUxfU0NBTEVTLnNpemUsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuZW5hYmxlM2RcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0RGVmYXVsdExheWVyQ29uZmlnKHByb3BzID0ge30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3VwZXIuZ2V0RGVmYXVsdExheWVyQ29uZmlnKHByb3BzKSxcblxuICAgICAgLy8gYWRkIGhlaWdodCB2aXN1YWwgY2hhbm5lbFxuICAgICAgaGVpZ2h0RmllbGQ6IG51bGwsXG4gICAgICBoZWlnaHREb21haW46IFswLCAxXSxcbiAgICAgIGhlaWdodFNjYWxlOiAnbGluZWFyJyxcblxuICAgICAgLy8gYWRkIHN0cm9rZSBjb2xvciB2aXN1YWwgY2hhbm5lbFxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZDogbnVsbCxcbiAgICAgIHN0cm9rZUNvbG9yRG9tYWluOiBbMCwgMV0sXG4gICAgICBzdHJva2VDb2xvclNjYWxlOiAncXVhbnRpbGUnXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmaW5kRGVmYXVsdExheWVyUHJvcHMoe2ZpZWxkcyA9IFtdfSkge1xuICAgIGNvbnN0IGZvdW5kQ29sdW1ucyA9IHRoaXMuZmluZERlZmF1bHRDb2x1bW5GaWVsZChTMl9UT0tFTl9GSUVMRFMsIGZpZWxkcyk7XG4gICAgaWYgKCFmb3VuZENvbHVtbnMgfHwgIWZvdW5kQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7cHJvcHM6IFtdfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvcHM6IGZvdW5kQ29sdW1ucy5tYXAoY29sdW1ucyA9PiAoe1xuICAgICAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgICAgIGxhYmVsOiAnUzInLFxuICAgICAgICBjb2x1bW5zXG4gICAgICB9KSlcbiAgICB9O1xuICB9XG5cbiAgY2FsY3VsYXRlRGF0YUF0dHJpYnV0ZSh7YWxsRGF0YSwgZmlsdGVyZWRJbmRleH0sIGdldFMyVG9rZW4pIHtcbiAgICBjb25zdCBkYXRhID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZEluZGV4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGZpbHRlcmVkSW5kZXhbaV07XG4gICAgICBjb25zdCB0b2tlbiA9IGdldFMyVG9rZW4oYWxsRGF0YVtpbmRleF0pO1xuXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBvcmlnaW5hbCBkYXRhIGluZGV4XG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgZGF0YTogYWxsRGF0YVtpbmRleF0sXG4gICAgICAgICAgdG9rZW5cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgdXBkYXRlTGF5ZXJNZXRhKGFsbERhdGEsIGdldFMyVG9rZW4pIHtcbiAgICBjb25zdCBjZW50cm9pZHMgPSBhbGxEYXRhLnJlZHVjZSgoYWNjLCBlbnRyeSkgPT4ge1xuICAgICAgY29uc3QgczJUb2tlbiA9IGdldFMyVG9rZW4oZW50cnkpO1xuICAgICAgcmV0dXJuIHMyVG9rZW4gPyBbLi4uYWNjLCBnZXRTMkNlbnRlcihzMlRva2VuKV0gOiBhY2M7XG4gICAgfSwgW10pO1xuXG4gICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRQb2ludHNCb3VuZHMoY2VudHJvaWRzKTtcbiAgICB0aGlzLmRhdGFUb0ZlYXR1cmUgPSB7Y2VudHJvaWRzfTtcbiAgICB0aGlzLnVwZGF0ZU1ldGEoe2JvdW5kc30pO1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuICBmb3JtYXRMYXllckRhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSwgb3B0ID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBjb2xvclNjYWxlLFxuICAgICAgY29sb3JEb21haW4sXG4gICAgICBjb2xvckZpZWxkLFxuICAgICAgY29sb3IsXG4gICAgICBoZWlnaHRGaWVsZCxcbiAgICAgIGhlaWdodERvbWFpbixcbiAgICAgIGhlaWdodFNjYWxlLFxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZCxcbiAgICAgIHN0cm9rZUNvbG9yU2NhbGUsXG4gICAgICBzdHJva2VDb2xvckRvbWFpbixcbiAgICAgIHNpemVTY2FsZSxcbiAgICAgIHNpemVEb21haW4sXG4gICAgICBzaXplRmllbGQsXG4gICAgICB2aXNDb25maWdcbiAgICB9ID0gdGhpcy5jb25maWc7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbmFibGUzZCxcbiAgICAgIHN0cm9rZWQsXG4gICAgICBjb2xvclJhbmdlLFxuICAgICAgaGVpZ2h0UmFuZ2UsXG4gICAgICBzaXplUmFuZ2UsXG4gICAgICBzdHJva2VDb2xvclJhbmdlLFxuICAgICAgc3Ryb2tlQ29sb3JcbiAgICB9ID0gdmlzQ29uZmlnO1xuXG4gICAgY29uc3Qge2dwdUZpbHRlcn0gPSBkYXRhc2V0c1t0aGlzLmNvbmZpZy5kYXRhSWRdO1xuICAgIGNvbnN0IGdldFMyVG9rZW4gPSB0aGlzLmdldFBvc2l0aW9uQWNjZXNzb3IoKTtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnVwZGF0ZURhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSk7XG5cbiAgICBjb25zdCBjU2NhbGUgPVxuICAgICAgY29sb3JGaWVsZCAmJlxuICAgICAgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoY29sb3JTY2FsZSwgY29sb3JEb21haW4sIGNvbG9yUmFuZ2UuY29sb3JzLm1hcChoZXhUb1JnYikpO1xuXG4gICAgLy8gY2FsY3VsYXRlIGVsZXZhdGlvbiBzY2FsZSAtIGlmIGV4dHJ1ZGVkID0gdHJ1ZVxuICAgIGNvbnN0IGVTY2FsZSA9XG4gICAgICBoZWlnaHRGaWVsZCAmJiBlbmFibGUzZCAmJiB0aGlzLmdldFZpc0NoYW5uZWxTY2FsZShoZWlnaHRTY2FsZSwgaGVpZ2h0RG9tYWluLCBoZWlnaHRSYW5nZSk7XG5cbiAgICAvLyBzdHJva2UgY29sb3JcbiAgICBjb25zdCBzY1NjYWxlID1cbiAgICAgIHN0cm9rZUNvbG9yRmllbGQgJiZcbiAgICAgIHRoaXMuZ2V0VmlzQ2hhbm5lbFNjYWxlKFxuICAgICAgICBzdHJva2VDb2xvclNjYWxlLFxuICAgICAgICBzdHJva2VDb2xvckRvbWFpbixcbiAgICAgICAgc3Ryb2tlQ29sb3JSYW5nZS5jb2xvcnMubWFwKGhleFRvUmdiKVxuICAgICAgKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBzdHJva2Ugc2NhbGUgLSBpZiBzdHJva2VkID0gdHJ1ZVxuICAgIGNvbnN0IHNTY2FsZSA9XG4gICAgICBzaXplRmllbGQgJiYgc3Ryb2tlZCAmJiB0aGlzLmdldFZpc0NoYW5uZWxTY2FsZShzaXplU2NhbGUsIHNpemVEb21haW4sIHNpemVSYW5nZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF0YSxcbiAgICAgIGdldFMyVG9rZW4sXG4gICAgICBnZXRMaW5lQ29sb3I6IGQgPT5cbiAgICAgICAgc2NTY2FsZVxuICAgICAgICAgID8gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKHNjU2NhbGUsIGQuZGF0YSwgc3Ryb2tlQ29sb3JGaWVsZClcbiAgICAgICAgICA6IHN0cm9rZUNvbG9yIHx8IGNvbG9yLFxuICAgICAgZ2V0TGluZVdpZHRoOiBkID0+XG4gICAgICAgIHNTY2FsZSA/IHRoaXMuZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZShzU2NhbGUsIGQuZGF0YSwgc2l6ZUZpZWxkLCAwKSA6IGRlZmF1bHRMaW5lV2lkdGgsXG4gICAgICBnZXRGaWxsQ29sb3I6IGQgPT4gKGNTY2FsZSA/IHRoaXMuZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZShjU2NhbGUsIGQuZGF0YSwgY29sb3JGaWVsZCkgOiBjb2xvciksXG4gICAgICBnZXRFbGV2YXRpb246IGQgPT5cbiAgICAgICAgZVNjYWxlID8gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKGVTY2FsZSwgZC5kYXRhLCBoZWlnaHRGaWVsZCwgMCkgOiBkZWZhdWx0RWxldmF0aW9uLFxuICAgICAgZ2V0RmlsdGVyVmFsdWU6IGdwdUZpbHRlci5maWx0ZXJWYWx1ZUFjY2Vzc29yKClcbiAgICB9O1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY29tcGxleGl0eSAqL1xuXG4gIHJlbmRlckxheWVyKG9wdHMpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ3B1RmlsdGVyLCBpbnRlcmFjdGlvbkNvbmZpZywgbWFwU3RhdGV9ID0gb3B0cztcblxuICAgIGNvbnN0IGRlZmF1bHRMYXllclByb3BzID0gdGhpcy5nZXREZWZhdWx0RGVja0xheWVyUHJvcHMob3B0cyk7XG5cbiAgICBjb25zdCBlbGVab29tRmFjdG9yID0gdGhpcy5nZXRFbGV2YXRpb25ab29tRmFjdG9yKG1hcFN0YXRlKTtcbiAgICBjb25zdCB6b29tRmFjdG9yID0gdGhpcy5nZXRab29tRmFjdG9yKG1hcFN0YXRlKTtcbiAgICBjb25zdCB7Y29uZmlnfSA9IHRoaXM7XG4gICAgY29uc3Qge3Zpc0NvbmZpZ30gPSBjb25maWc7XG5cbiAgICBjb25zdCB1cGRhdGVUcmlnZ2VycyA9IHtcbiAgICAgIGdldExpbmVDb2xvcjoge1xuICAgICAgICBjb2xvcjogdmlzQ29uZmlnLnN0cm9rZUNvbG9yLFxuICAgICAgICBjb2xvckZpZWxkOiBjb25maWcuc3Ryb2tlQ29sb3JGaWVsZCxcbiAgICAgICAgY29sb3JSYW5nZTogdmlzQ29uZmlnLnN0cm9rZUNvbG9yUmFuZ2UsXG4gICAgICAgIGNvbG9yU2NhbGU6IGNvbmZpZy5zdHJva2VDb2xvclNjYWxlXG4gICAgICB9LFxuICAgICAgZ2V0TGluZVdpZHRoOiB7XG4gICAgICAgIHNpemVGaWVsZDogY29uZmlnLnNpemVGaWVsZCxcbiAgICAgICAgc2l6ZVJhbmdlOiB2aXNDb25maWcuc2l6ZVJhbmdlXG4gICAgICB9LFxuICAgICAgZ2V0RmlsbENvbG9yOiB7XG4gICAgICAgIGNvbG9yOiBjb25maWcuY29sb3IsXG4gICAgICAgIGNvbG9yRmllbGQ6IGNvbmZpZy5jb2xvckZpZWxkLFxuICAgICAgICBjb2xvclJhbmdlOiB2aXNDb25maWcuY29sb3JSYW5nZSxcbiAgICAgICAgY29sb3JTY2FsZTogY29uZmlnLmNvbG9yU2NhbGVcbiAgICAgIH0sXG4gICAgICBnZXRFbGV2YXRpb246IHtcbiAgICAgICAgaGVpZ2h0RmllbGQ6IGNvbmZpZy5oZWlnaHRGaWVsZCxcbiAgICAgICAgaGVpZ2h0U2NhbGVUeXBlOiBjb25maWcuaGVpZ2h0U2NhbGUsXG4gICAgICAgIGhlaWdodFJhbmdlOiB2aXNDb25maWcuaGVpZ2h0UmFuZ2VcbiAgICAgIH0sXG4gICAgICBnZXRGaWx0ZXJWYWx1ZTogZ3B1RmlsdGVyLmZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnNcbiAgICB9O1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBTMkxheWVyKHtcbiAgICAgICAgLi4uZGVmYXVsdExheWVyUHJvcHMsXG4gICAgICAgIC4uLmludGVyYWN0aW9uQ29uZmlnLFxuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBnZXRTMlRva2VuOiBkID0+IGQudG9rZW4sXG5cbiAgICAgICAgYXV0b0hpZ2hsaWdodDogdmlzQ29uZmlnLmVuYWJsZTNkLFxuICAgICAgICBoaWdobGlnaHRDb2xvcjogSElHSExJR0hfQ09MT1JfM0QsXG5cbiAgICAgICAgLy8gc3Ryb2tlXG4gICAgICAgIGxpbmVXaWR0aFNjYWxlOiB2aXNDb25maWcudGhpY2tuZXNzICogem9vbUZhY3RvciAqIHpvb21GYWN0b3JWYWx1ZSxcbiAgICAgICAgc3Ryb2tlZDogdmlzQ29uZmlnLnN0cm9rZWQsXG4gICAgICAgIGxpbmVNaXRlckxpbWl0OiAyLFxuXG4gICAgICAgIC8vIEZpbGxlZCBjb2xvclxuICAgICAgICBmaWxsZWQ6IHZpc0NvbmZpZy5maWxsZWQsXG4gICAgICAgIG9wYWNpdHk6IHZpc0NvbmZpZy5vcGFjaXR5LFxuICAgICAgICB3cmFwTG9uZ2l0dWRlOiBmYWxzZSxcblxuICAgICAgICAvLyBFbGV2YXRpb25cbiAgICAgICAgZWxldmF0aW9uU2NhbGU6IHZpc0NvbmZpZy5lbGV2YXRpb25TY2FsZSAqIGVsZVpvb21GYWN0b3IsXG4gICAgICAgIGV4dHJ1ZGVkOiB2aXNDb25maWcuZW5hYmxlM2QsXG5cbiAgICAgICAgd2lyZWZyYW1lOiB2aXNDb25maWcud2lyZWZyYW1lLFxuXG4gICAgICAgIHBpY2thYmxlOiB0cnVlLFxuXG4gICAgICAgIHVwZGF0ZVRyaWdnZXJzXG4gICAgICB9KVxuICAgIF07XG4gIH1cbn1cbiJdfQ==