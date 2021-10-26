"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.defaultRadius = exports.defaultLineWidth = exports.defaultElevation = exports.featureAccessor = exports.geoJsonRequiredColumns = exports.geojsonVisConfigs = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash.uniq"));

var _typeAnalyzer = require("type-analyzer");

var _baseLayer = _interopRequireWildcard(require("../base-layer"));

var _layers = require("@deck.gl/layers");

var _colorUtils = require("../../utils/color-utils");

var _geojsonUtils = require("./geojson-utils");

var _geojsonLayerIcon = _interopRequireDefault(require("./geojson-layer-icon"));

var _defaultSettings = require("../../constants/default-settings");

var _layerFactory = require("../layer-factory");

var _SUPPORTED_ANALYZER_T;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SUPPORTED_ANALYZER_TYPES = (_SUPPORTED_ANALYZER_T = {}, (0, _defineProperty2["default"])(_SUPPORTED_ANALYZER_T, _typeAnalyzer.DATA_TYPES.GEOMETRY, true), (0, _defineProperty2["default"])(_SUPPORTED_ANALYZER_T, _typeAnalyzer.DATA_TYPES.GEOMETRY_FROM_STRING, true), (0, _defineProperty2["default"])(_SUPPORTED_ANALYZER_T, _typeAnalyzer.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING, true), _SUPPORTED_ANALYZER_T);
var geojsonVisConfigs = {
  opacity: 'opacity',
  strokeOpacity: _objectSpread(_objectSpread({}, _layerFactory.LAYER_VIS_CONFIGS.opacity), {}, {
    property: 'strokeOpacity'
  }),
  thickness: _objectSpread(_objectSpread({}, _layerFactory.LAYER_VIS_CONFIGS.thickness), {}, {
    defaultValue: 0.5
  }),
  strokeColor: 'strokeColor',
  colorRange: 'colorRange',
  strokeColorRange: 'strokeColorRange',
  radius: 'radius',
  sizeRange: 'strokeWidthRange',
  radiusRange: 'radiusRange',
  heightRange: 'elevationRange',
  elevationScale: 'elevationScale',
  stroked: 'stroked',
  filled: 'filled',
  enable3d: 'enable3d',
  wireframe: 'wireframe'
};
exports.geojsonVisConfigs = geojsonVisConfigs;
var geoJsonRequiredColumns = ['geojson'];
exports.geoJsonRequiredColumns = geoJsonRequiredColumns;

var featureAccessor = function featureAccessor(_ref) {
  var geojson = _ref.geojson;
  return function (d) {
    return d[geojson.fieldIdx];
  };
};

exports.featureAccessor = featureAccessor;
var defaultElevation = 500;
exports.defaultElevation = defaultElevation;
var defaultLineWidth = 1;
exports.defaultLineWidth = defaultLineWidth;
var defaultRadius = 1;
exports.defaultRadius = defaultRadius;

var GeoJsonLayer = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(GeoJsonLayer, _Layer);

  var _super = _createSuper(GeoJsonLayer);

  function GeoJsonLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, GeoJsonLayer);
    _this = _super.call(this, props);
    _this.dataToFeature = [];

    _this.registerVisConfig(geojsonVisConfigs);

    _this.getPositionAccessor = function () {
      return featureAccessor(_this.config.columns);
    };

    return _this;
  }

  (0, _createClass2["default"])(GeoJsonLayer, [{
    key: "getPositionAccessor",
    value: function getPositionAccessor() {
      return this.getFeature(this.config.columns);
    }
  }, {
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(GeoJsonLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        // add height visual channel
        heightField: null,
        heightDomain: [0, 1],
        heightScale: 'linear',
        // add radius visual channel
        radiusField: null,
        radiusDomain: [0, 1],
        radiusScale: 'linear',
        // add stroke color visual channel
        strokeColorField: null,
        strokeColorDomain: [0, 1],
        strokeColorScale: 'quantile'
      });
    }
  }, {
    key: "getHoverData",
    value: function getHoverData(object, allData) {
      // index of allData is saved to feature.properties
      return allData[object.properties.index];
    }
  }, {
    key: "calculateDataAttribute",
    value: function calculateDataAttribute(_ref2, getPosition) {
      var _this2 = this;

      var allData = _ref2.allData,
          filteredIndex = _ref2.filteredIndex;
      return filteredIndex.map(function (i) {
        return _this2.dataToFeature[i];
      }).filter(function (d) {
        return d;
      });
    } // TODO: fix complexity

    /* eslint-disable complexity */

  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, oldLayerData) {
      var _this3 = this;

      var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _this$config = this.config,
          colorScale = _this$config.colorScale,
          colorField = _this$config.colorField,
          colorDomain = _this$config.colorDomain,
          strokeColorField = _this$config.strokeColorField,
          strokeColorScale = _this$config.strokeColorScale,
          strokeColorDomain = _this$config.strokeColorDomain,
          color = _this$config.color,
          sizeScale = _this$config.sizeScale,
          sizeDomain = _this$config.sizeDomain,
          sizeField = _this$config.sizeField,
          heightField = _this$config.heightField,
          heightDomain = _this$config.heightDomain,
          heightScale = _this$config.heightScale,
          radiusField = _this$config.radiusField,
          radiusDomain = _this$config.radiusDomain,
          radiusScale = _this$config.radiusScale,
          visConfig = _this$config.visConfig;
      var enable3d = visConfig.enable3d,
          stroked = visConfig.stroked,
          colorRange = visConfig.colorRange,
          heightRange = visConfig.heightRange,
          sizeRange = visConfig.sizeRange,
          radiusRange = visConfig.radiusRange,
          strokeColorRange = visConfig.strokeColorRange,
          strokeColor = visConfig.strokeColor;
      var _datasets$this$config = datasets[this.config.dataId],
          allData = _datasets$this$config.allData,
          gpuFilter = _datasets$this$config.gpuFilter;

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data; // fill color


      var cScale = colorField && this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(_colorUtils.hexToRgb)); // stroke color

      var scScale = strokeColorField && this.getVisChannelScale(strokeColorScale, strokeColorDomain, strokeColorRange.colors.map(_colorUtils.hexToRgb)); // calculate stroke scale - if stroked = true

      var sScale = sizeField && stroked && this.getVisChannelScale(sizeScale, sizeDomain, sizeRange); // calculate elevation scale - if extruded = true

      var eScale = heightField && enable3d && this.getVisChannelScale(heightScale, heightDomain, heightRange); // point radius

      var rScale = radiusField && this.getVisChannelScale(radiusScale, radiusDomain, radiusRange); // access feature properties from geojson sub layer

      var getDataForGpuFilter = function getDataForGpuFilter(f) {
        return allData[f.properties.index];
      };

      var getIndexForGpuFilter = function getIndexForGpuFilter(f) {
        return f.properties.index;
      };

      return {
        data: data,
        getFilterValue: gpuFilter.filterValueAccessor(getIndexForGpuFilter, getDataForGpuFilter),
        getFillColor: function getFillColor(d) {
          return cScale ? _this3.getEncodedChannelValue(cScale, allData[d.properties.index], colorField) : d.properties.fillColor || color;
        },
        getLineColor: function getLineColor(d) {
          return scScale ? _this3.getEncodedChannelValue(scScale, allData[d.properties.index], strokeColorField) : d.properties.lineColor || strokeColor || color;
        },
        getLineWidth: function getLineWidth(d) {
          return sScale ? _this3.getEncodedChannelValue(sScale, allData[d.properties.index], sizeField, 0) : d.properties.lineWidth || defaultLineWidth;
        },
        getElevation: function getElevation(d) {
          return eScale ? _this3.getEncodedChannelValue(eScale, allData[d.properties.index], heightField, 0) : d.properties.elevation || defaultElevation;
        },
        getRadius: function getRadius(d) {
          return rScale ? _this3.getEncodedChannelValue(rScale, allData[d.properties.index], radiusField, 0) : d.properties.radius || defaultRadius;
        }
      };
    }
    /* eslint-enable complexity */

  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData) {
      var getFeature = this.getPositionAccessor();
      this.dataToFeature = (0, _geojsonUtils.getGeojsonDataMaps)(allData, getFeature); // get bounds from features

      var bounds = (0, _geojsonUtils.getGeojsonBounds)(this.dataToFeature); // if any of the feature has properties.radius set to be true

      var fixedRadius = Boolean(this.dataToFeature.find(function (d) {
        return d && d.properties && d.properties.radius;
      })); // keep a record of what type of geometry the collection has

      var featureTypes = (0, _geojsonUtils.getGeojsonFeatureTypes)(this.dataToFeature);
      this.updateMeta({
        bounds: bounds,
        fixedRadius: fixedRadius,
        featureTypes: featureTypes
      });
    }
  }, {
    key: "setInitialLayerConfig",
    value: function setInitialLayerConfig(allData) {
      this.updateLayerMeta(allData);
      var featureTypes = this.meta.featureTypes; // default settings is stroke: true, filled: false

      if (featureTypes && featureTypes.polygon) {
        // set both fill and stroke to true
        return this.updateLayerVisConfig({
          filled: true,
          stroked: true,
          strokeColor: _baseLayer.colorMaker.next().value
        });
      } else if (featureTypes && featureTypes.point) {
        // set fill to true if detect point
        return this.updateLayerVisConfig({
          filled: true,
          stroked: false
        });
      }

      return this;
    }
  }, {
    key: "renderLayer",
    value: function renderLayer(opts) {
      var data = opts.data,
          gpuFilter = opts.gpuFilter,
          objectHovered = opts.objectHovered,
          mapState = opts.mapState;
      var _this$meta = this.meta,
          fixedRadius = _this$meta.fixedRadius,
          featureTypes = _this$meta.featureTypes;
      var radiusScale = this.getRadiusScaleByZoom(mapState, fixedRadius);
      var zoomFactor = this.getZoomFactor(mapState);
      var eleZoomFactor = this.getElevationZoomFactor(mapState);
      var visConfig = this.config.visConfig;
      var layerProps = {
        lineWidthScale: visConfig.thickness * zoomFactor * 8,
        elevationScale: visConfig.elevationScale * eleZoomFactor,
        pointRadiusScale: radiusScale,
        lineMiterLimit: 4
      };
      var updateTriggers = {
        getElevation: {
          heightField: this.config.heightField,
          heightScaleType: this.config.heightScale,
          heightRange: visConfig.heightRange
        },
        getFillColor: {
          color: this.config.color,
          colorField: this.config.colorField,
          colorRange: visConfig.colorRange,
          colorScale: this.config.colorScale
        },
        getLineColor: {
          color: visConfig.strokeColor,
          colorField: this.config.strokeColorField,
          colorRange: visConfig.strokeColorRange,
          colorScale: this.config.strokeColorScale
        },
        getLineWidth: {
          sizeField: this.config.sizeField,
          sizeRange: visConfig.sizeRange
        },
        getRadius: {
          radiusField: this.config.radiusField,
          radiusRange: visConfig.radiusRange
        },
        getFilterValue: gpuFilter.filterValueUpdateTriggers
      };
      var defaultLayerProps = this.getDefaultDeckLayerProps(opts);
      var opaOverwrite = {
        opacity: visConfig.strokeOpacity
      };
      return [new _layers.GeoJsonLayer(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, defaultLayerProps), layerProps), data), {}, {
        highlightColor: _defaultSettings.HIGHLIGH_COLOR_3D,
        autoHighlight: visConfig.enable3d,
        stroked: visConfig.stroked,
        filled: visConfig.filled,
        extruded: visConfig.enable3d,
        wireframe: visConfig.wireframe,
        wrapLongitude: false,
        lineMiterLimit: 2,
        rounded: true,
        updateTriggers: updateTriggers,
        _subLayerProps: _objectSpread(_objectSpread(_objectSpread({}, featureTypes.polygon ? {
          'polygons-stroke': opaOverwrite
        } : {}), featureTypes.line ? {
          'line-strings': opaOverwrite
        } : {}), featureTypes.point ? {
          points: {
            lineOpacity: visConfig.strokeOpacity
          }
        } : {})
      }))].concat((0, _toConsumableArray2["default"])(this.isLayerHovered(objectHovered) && !visConfig.enable3d ? [new _layers.GeoJsonLayer(_objectSpread(_objectSpread(_objectSpread({}, this.getDefaultHoverLayerProps()), layerProps), {}, {
        wrapLongitude: false,
        data: [objectHovered.object],
        getLineWidth: data.getLineWidth,
        getRadius: data.getRadius,
        getElevation: data.getElevation,
        getLineColor: this.config.highlightColor,
        getFillColor: this.config.highlightColor,
        // always draw outline
        stroked: true,
        filled: false
      }))] : []));
    }
  }, {
    key: "type",
    get: function get() {
      return 'geojson';
    }
  }, {
    key: "name",
    get: function get() {
      return 'Polygon';
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _geojsonLayerIcon["default"];
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return geoJsonRequiredColumns;
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(GeoJsonLayer.prototype), "visualChannels", this)), {}, {
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
        size: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(GeoJsonLayer.prototype), "visualChannels", this).size), {}, {
          property: 'stroke',
          condition: function condition(config) {
            return config.visConfig.stroked;
          }
        }),
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
        },
        radius: {
          property: 'radius',
          field: 'radiusField',
          scale: 'radiusScale',
          domain: 'radiusDomain',
          range: 'radiusRange',
          key: 'radius',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.radius
        }
      });
    }
  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(_ref3) {
      var _this4 = this;

      var label = _ref3.label,
          _ref3$fields = _ref3.fields,
          fields = _ref3$fields === void 0 ? [] : _ref3$fields;
      var geojsonColumns = fields.filter(function (f) {
        return f.type === 'geojson' && SUPPORTED_ANALYZER_TYPES[f.analyzerType];
      }).map(function (f) {
        return f.name;
      });
      var defaultColumns = {
        geojson: (0, _lodash["default"])([].concat((0, _toConsumableArray2["default"])(_defaultSettings.GEOJSON_FIELDS.geojson), (0, _toConsumableArray2["default"])(geojsonColumns)))
      };
      var foundColumns = this.findDefaultColumnField(defaultColumns, fields);

      if (!foundColumns || !foundColumns.length) {
        return {
          props: []
        };
      }

      return {
        props: foundColumns.map(function (columns) {
          return {
            label: typeof label === 'string' && label.replace(/\.[^/.]+$/, '') || _this4.type,
            columns: columns,
            isVisible: true
          };
        })
      };
    }
  }]);
  return GeoJsonLayer;
}(_baseLayer["default"]);

exports["default"] = GeoJsonLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ2VvanNvbi1sYXllci9nZW9qc29uLWxheWVyLmpzIl0sIm5hbWVzIjpbIlNVUFBPUlRFRF9BTkFMWVpFUl9UWVBFUyIsIkRBVEFfVFlQRVMiLCJHRU9NRVRSWSIsIkdFT01FVFJZX0ZST01fU1RSSU5HIiwiUEFJUl9HRU9NRVRSWV9GUk9NX1NUUklORyIsImdlb2pzb25WaXNDb25maWdzIiwib3BhY2l0eSIsInN0cm9rZU9wYWNpdHkiLCJMQVlFUl9WSVNfQ09ORklHUyIsInByb3BlcnR5IiwidGhpY2tuZXNzIiwiZGVmYXVsdFZhbHVlIiwic3Ryb2tlQ29sb3IiLCJjb2xvclJhbmdlIiwic3Ryb2tlQ29sb3JSYW5nZSIsInJhZGl1cyIsInNpemVSYW5nZSIsInJhZGl1c1JhbmdlIiwiaGVpZ2h0UmFuZ2UiLCJlbGV2YXRpb25TY2FsZSIsInN0cm9rZWQiLCJmaWxsZWQiLCJlbmFibGUzZCIsIndpcmVmcmFtZSIsImdlb0pzb25SZXF1aXJlZENvbHVtbnMiLCJmZWF0dXJlQWNjZXNzb3IiLCJnZW9qc29uIiwiZCIsImZpZWxkSWR4IiwiZGVmYXVsdEVsZXZhdGlvbiIsImRlZmF1bHRMaW5lV2lkdGgiLCJkZWZhdWx0UmFkaXVzIiwiR2VvSnNvbkxheWVyIiwicHJvcHMiLCJkYXRhVG9GZWF0dXJlIiwicmVnaXN0ZXJWaXNDb25maWciLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwiY29uZmlnIiwiY29sdW1ucyIsImdldEZlYXR1cmUiLCJoZWlnaHRGaWVsZCIsImhlaWdodERvbWFpbiIsImhlaWdodFNjYWxlIiwicmFkaXVzRmllbGQiLCJyYWRpdXNEb21haW4iLCJyYWRpdXNTY2FsZSIsInN0cm9rZUNvbG9yRmllbGQiLCJzdHJva2VDb2xvckRvbWFpbiIsInN0cm9rZUNvbG9yU2NhbGUiLCJvYmplY3QiLCJhbGxEYXRhIiwicHJvcGVydGllcyIsImluZGV4IiwiZ2V0UG9zaXRpb24iLCJmaWx0ZXJlZEluZGV4IiwibWFwIiwiaSIsImZpbHRlciIsImRhdGFzZXRzIiwib2xkTGF5ZXJEYXRhIiwib3B0IiwiY29sb3JTY2FsZSIsImNvbG9yRmllbGQiLCJjb2xvckRvbWFpbiIsImNvbG9yIiwic2l6ZVNjYWxlIiwic2l6ZURvbWFpbiIsInNpemVGaWVsZCIsInZpc0NvbmZpZyIsImRhdGFJZCIsImdwdUZpbHRlciIsInVwZGF0ZURhdGEiLCJkYXRhIiwiY1NjYWxlIiwiZ2V0VmlzQ2hhbm5lbFNjYWxlIiwiY29sb3JzIiwiaGV4VG9SZ2IiLCJzY1NjYWxlIiwic1NjYWxlIiwiZVNjYWxlIiwiclNjYWxlIiwiZ2V0RGF0YUZvckdwdUZpbHRlciIsImYiLCJnZXRJbmRleEZvckdwdUZpbHRlciIsImdldEZpbHRlclZhbHVlIiwiZmlsdGVyVmFsdWVBY2Nlc3NvciIsImdldEZpbGxDb2xvciIsImdldEVuY29kZWRDaGFubmVsVmFsdWUiLCJmaWxsQ29sb3IiLCJnZXRMaW5lQ29sb3IiLCJsaW5lQ29sb3IiLCJnZXRMaW5lV2lkdGgiLCJsaW5lV2lkdGgiLCJnZXRFbGV2YXRpb24iLCJlbGV2YXRpb24iLCJnZXRSYWRpdXMiLCJib3VuZHMiLCJmaXhlZFJhZGl1cyIsIkJvb2xlYW4iLCJmaW5kIiwiZmVhdHVyZVR5cGVzIiwidXBkYXRlTWV0YSIsInVwZGF0ZUxheWVyTWV0YSIsIm1ldGEiLCJwb2x5Z29uIiwidXBkYXRlTGF5ZXJWaXNDb25maWciLCJjb2xvck1ha2VyIiwibmV4dCIsInZhbHVlIiwicG9pbnQiLCJvcHRzIiwib2JqZWN0SG92ZXJlZCIsIm1hcFN0YXRlIiwiZ2V0UmFkaXVzU2NhbGVCeVpvb20iLCJ6b29tRmFjdG9yIiwiZ2V0Wm9vbUZhY3RvciIsImVsZVpvb21GYWN0b3IiLCJnZXRFbGV2YXRpb25ab29tRmFjdG9yIiwibGF5ZXJQcm9wcyIsImxpbmVXaWR0aFNjYWxlIiwicG9pbnRSYWRpdXNTY2FsZSIsImxpbmVNaXRlckxpbWl0IiwidXBkYXRlVHJpZ2dlcnMiLCJoZWlnaHRTY2FsZVR5cGUiLCJmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzIiwiZGVmYXVsdExheWVyUHJvcHMiLCJnZXREZWZhdWx0RGVja0xheWVyUHJvcHMiLCJvcGFPdmVyd3JpdGUiLCJEZWNrR0xHZW9Kc29uTGF5ZXIiLCJoaWdobGlnaHRDb2xvciIsIkhJR0hMSUdIX0NPTE9SXzNEIiwiYXV0b0hpZ2hsaWdodCIsImV4dHJ1ZGVkIiwid3JhcExvbmdpdHVkZSIsInJvdW5kZWQiLCJfc3ViTGF5ZXJQcm9wcyIsImxpbmUiLCJwb2ludHMiLCJsaW5lT3BhY2l0eSIsImlzTGF5ZXJIb3ZlcmVkIiwiZ2V0RGVmYXVsdEhvdmVyTGF5ZXJQcm9wcyIsIkdlb2pzb25MYXllckljb24iLCJmaWVsZCIsInNjYWxlIiwiZG9tYWluIiwicmFuZ2UiLCJrZXkiLCJjaGFubmVsU2NhbGVUeXBlIiwiQ0hBTk5FTF9TQ0FMRVMiLCJjb25kaXRpb24iLCJzaXplIiwiaGVpZ2h0IiwibGFiZWwiLCJmaWVsZHMiLCJnZW9qc29uQ29sdW1ucyIsInR5cGUiLCJhbmFseXplclR5cGUiLCJuYW1lIiwiZGVmYXVsdENvbHVtbnMiLCJHRU9KU09OX0ZJRUxEUyIsImZvdW5kQ29sdW1ucyIsImZpbmREZWZhdWx0Q29sdW1uRmllbGQiLCJsZW5ndGgiLCJyZXBsYWNlIiwiaXNWaXNpYmxlIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsd0JBQXdCLHdGQUMzQkMseUJBQVdDLFFBRGdCLEVBQ0wsSUFESywyREFFM0JELHlCQUFXRSxvQkFGZ0IsRUFFTyxJQUZQLDJEQUczQkYseUJBQVdHLHlCQUhnQixFQUdZLElBSFoseUJBQTlCO0FBTU8sSUFBTUMsaUJBQWlCLEdBQUc7QUFDL0JDLEVBQUFBLE9BQU8sRUFBRSxTQURzQjtBQUUvQkMsRUFBQUEsYUFBYSxrQ0FDUkMsZ0NBQWtCRixPQURW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QURZLE9BQXZCO0FBSUEsVUFBTU0sWUFBWSxHQUFHLEtBQUtDLHNCQUFMLENBQTRCSCxjQUE1QixFQUE0Q0wsTUFBNUMsQ0FBckI7O0FBQ0EsVUFBSSxDQUFDTyxZQUFELElBQWlCLENBQUNBLFlBQVksQ0FBQ0UsTUFBbkMsRUFBMkM7QUFDekMsZUFBTztBQUFDakksVUFBQUEsS0FBSyxFQUFFO0FBQVIsU0FBUDtBQUNEOztBQUVELGFBQU87QUFDTEEsUUFBQUEsS0FBSyxFQUFFK0gsWUFBWSxDQUFDekcsR0FBYixDQUFpQixVQUFBakIsT0FBTztBQUFBLGlCQUFLO0FBQ2xDa0gsWUFBQUEsS0FBSyxFQUFHLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFBNkJBLEtBQUssQ0FBQ1csT0FBTixDQUFjLFdBQWQsRUFBMkIsRUFBM0IsQ0FBOUIsSUFBaUUsTUFBSSxDQUFDUixJQUQzQztBQUVsQ3JILFlBQUFBLE9BQU8sRUFBUEEsT0FGa0M7QUFHbEM4SCxZQUFBQSxTQUFTLEVBQUU7QUFIdUIsV0FBTDtBQUFBLFNBQXhCO0FBREYsT0FBUDtBQU9EOzs7RUExRnVDQyxxQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB1bmlxIGZyb20gJ2xvZGFzaC51bmlxJztcbmltcG9ydCB7REFUQV9UWVBFU30gZnJvbSAndHlwZS1hbmFseXplcic7XG5cbmltcG9ydCBMYXllciwge2NvbG9yTWFrZXJ9IGZyb20gJy4uL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IHtHZW9Kc29uTGF5ZXIgYXMgRGVja0dMR2VvSnNvbkxheWVyfSBmcm9tICdAZGVjay5nbC9sYXllcnMnO1xuaW1wb3J0IHtoZXhUb1JnYn0gZnJvbSAndXRpbHMvY29sb3ItdXRpbHMnO1xuaW1wb3J0IHtnZXRHZW9qc29uRGF0YU1hcHMsIGdldEdlb2pzb25Cb3VuZHMsIGdldEdlb2pzb25GZWF0dXJlVHlwZXN9IGZyb20gJy4vZ2VvanNvbi11dGlscyc7XG5pbXBvcnQgR2VvanNvbkxheWVySWNvbiBmcm9tICcuL2dlb2pzb24tbGF5ZXItaWNvbic7XG5pbXBvcnQge0dFT0pTT05fRklFTERTLCBISUdITElHSF9DT0xPUl8zRCwgQ0hBTk5FTF9TQ0FMRVN9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCB7TEFZRVJfVklTX0NPTkZJR1N9IGZyb20gJ2xheWVycy9sYXllci1mYWN0b3J5JztcblxuY29uc3QgU1VQUE9SVEVEX0FOQUxZWkVSX1RZUEVTID0ge1xuICBbREFUQV9UWVBFUy5HRU9NRVRSWV06IHRydWUsXG4gIFtEQVRBX1RZUEVTLkdFT01FVFJZX0ZST01fU1RSSU5HXTogdHJ1ZSxcbiAgW0RBVEFfVFlQRVMuUEFJUl9HRU9NRVRSWV9GUk9NX1NUUklOR106IHRydWVcbn07XG5cbmV4cG9ydCBjb25zdCBnZW9qc29uVmlzQ29uZmlncyA9IHtcbiAgb3BhY2l0eTogJ29wYWNpdHknLFxuICBzdHJva2VPcGFjaXR5OiB7XG4gICAgLi4uTEFZRVJfVklTX0NPTkZJR1Mub3BhY2l0eSxcbiAgICBwcm9wZXJ0eTogJ3N0cm9rZU9wYWNpdHknXG4gIH0sXG4gIHRoaWNrbmVzczoge1xuICAgIC4uLkxBWUVSX1ZJU19DT05GSUdTLnRoaWNrbmVzcyxcbiAgICBkZWZhdWx0VmFsdWU6IDAuNVxuICB9LFxuICBzdHJva2VDb2xvcjogJ3N0cm9rZUNvbG9yJyxcbiAgY29sb3JSYW5nZTogJ2NvbG9yUmFuZ2UnLFxuICBzdHJva2VDb2xvclJhbmdlOiAnc3Ryb2tlQ29sb3JSYW5nZScsXG4gIHJhZGl1czogJ3JhZGl1cycsXG5cbiAgc2l6ZVJhbmdlOiAnc3Ryb2tlV2lkdGhSYW5nZScsXG4gIHJhZGl1c1JhbmdlOiAncmFkaXVzUmFuZ2UnLFxuICBoZWlnaHRSYW5nZTogJ2VsZXZhdGlvblJhbmdlJyxcbiAgZWxldmF0aW9uU2NhbGU6ICdlbGV2YXRpb25TY2FsZScsXG4gIHN0cm9rZWQ6ICdzdHJva2VkJyxcbiAgZmlsbGVkOiAnZmlsbGVkJyxcbiAgZW5hYmxlM2Q6ICdlbmFibGUzZCcsXG4gIHdpcmVmcmFtZTogJ3dpcmVmcmFtZSdcbn07XG5cbmV4cG9ydCBjb25zdCBnZW9Kc29uUmVxdWlyZWRDb2x1bW5zID0gWydnZW9qc29uJ107XG5leHBvcnQgY29uc3QgZmVhdHVyZUFjY2Vzc29yID0gKHtnZW9qc29ufSkgPT4gZCA9PiBkW2dlb2pzb24uZmllbGRJZHhdO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRFbGV2YXRpb24gPSA1MDA7XG5leHBvcnQgY29uc3QgZGVmYXVsdExpbmVXaWR0aCA9IDE7XG5leHBvcnQgY29uc3QgZGVmYXVsdFJhZGl1cyA9IDE7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdlb0pzb25MYXllciBleHRlbmRzIExheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLmRhdGFUb0ZlYXR1cmUgPSBbXTtcbiAgICB0aGlzLnJlZ2lzdGVyVmlzQ29uZmlnKGdlb2pzb25WaXNDb25maWdzKTtcbiAgICB0aGlzLmdldFBvc2l0aW9uQWNjZXNzb3IgPSAoKSA9PiBmZWF0dXJlQWNjZXNzb3IodGhpcy5jb25maWcuY29sdW1ucyk7XG4gIH1cblxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gJ2dlb2pzb24nO1xuICB9XG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuICdQb2x5Z29uJztcbiAgfVxuXG4gIGdldCBsYXllckljb24oKSB7XG4gICAgcmV0dXJuIEdlb2pzb25MYXllckljb247XG4gIH1cblxuICBnZXQgcmVxdWlyZWRMYXllckNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIGdlb0pzb25SZXF1aXJlZENvbHVtbnM7XG4gIH1cblxuICBnZXQgdmlzdWFsQ2hhbm5lbHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLnZpc3VhbENoYW5uZWxzLFxuICAgICAgc3Ryb2tlQ29sb3I6IHtcbiAgICAgICAgcHJvcGVydHk6ICdzdHJva2VDb2xvcicsXG4gICAgICAgIGZpZWxkOiAnc3Ryb2tlQ29sb3JGaWVsZCcsXG4gICAgICAgIHNjYWxlOiAnc3Ryb2tlQ29sb3JTY2FsZScsXG4gICAgICAgIGRvbWFpbjogJ3N0cm9rZUNvbG9yRG9tYWluJyxcbiAgICAgICAgcmFuZ2U6ICdzdHJva2VDb2xvclJhbmdlJyxcbiAgICAgICAga2V5OiAnc3Ryb2tlQ29sb3InLFxuICAgICAgICBjaGFubmVsU2NhbGVUeXBlOiBDSEFOTkVMX1NDQUxFUy5jb2xvcixcbiAgICAgICAgY29uZGl0aW9uOiBjb25maWcgPT4gY29uZmlnLnZpc0NvbmZpZy5zdHJva2VkXG4gICAgICB9LFxuICAgICAgc2l6ZToge1xuICAgICAgICAuLi5zdXBlci52aXN1YWxDaGFubmVscy5zaXplLFxuICAgICAgICBwcm9wZXJ0eTogJ3N0cm9rZScsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuc3Ryb2tlZFxuICAgICAgfSxcbiAgICAgIGhlaWdodDoge1xuICAgICAgICBwcm9wZXJ0eTogJ2hlaWdodCcsXG4gICAgICAgIGZpZWxkOiAnaGVpZ2h0RmllbGQnLFxuICAgICAgICBzY2FsZTogJ2hlaWdodFNjYWxlJyxcbiAgICAgICAgZG9tYWluOiAnaGVpZ2h0RG9tYWluJyxcbiAgICAgICAgcmFuZ2U6ICdoZWlnaHRSYW5nZScsXG4gICAgICAgIGtleTogJ2hlaWdodCcsXG4gICAgICAgIGNoYW5uZWxTY2FsZVR5cGU6IENIQU5ORUxfU0NBTEVTLnNpemUsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuZW5hYmxlM2RcbiAgICAgIH0sXG4gICAgICByYWRpdXM6IHtcbiAgICAgICAgcHJvcGVydHk6ICdyYWRpdXMnLFxuICAgICAgICBmaWVsZDogJ3JhZGl1c0ZpZWxkJyxcbiAgICAgICAgc2NhbGU6ICdyYWRpdXNTY2FsZScsXG4gICAgICAgIGRvbWFpbjogJ3JhZGl1c0RvbWFpbicsXG4gICAgICAgIHJhbmdlOiAncmFkaXVzUmFuZ2UnLFxuICAgICAgICBrZXk6ICdyYWRpdXMnLFxuICAgICAgICBjaGFubmVsU2NhbGVUeXBlOiBDSEFOTkVMX1NDQUxFUy5yYWRpdXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0UG9zaXRpb25BY2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGZWF0dXJlKHRoaXMuY29uZmlnLmNvbHVtbnMpO1xuICB9XG5cbiAgc3RhdGljIGZpbmREZWZhdWx0TGF5ZXJQcm9wcyh7bGFiZWwsIGZpZWxkcyA9IFtdfSkge1xuICAgIGNvbnN0IGdlb2pzb25Db2x1bW5zID0gZmllbGRzXG4gICAgICAuZmlsdGVyKGYgPT4gZi50eXBlID09PSAnZ2VvanNvbicgJiYgU1VQUE9SVEVEX0FOQUxZWkVSX1RZUEVTW2YuYW5hbHl6ZXJUeXBlXSlcbiAgICAgIC5tYXAoZiA9PiBmLm5hbWUpO1xuXG4gICAgY29uc3QgZGVmYXVsdENvbHVtbnMgPSB7XG4gICAgICBnZW9qc29uOiB1bmlxKFsuLi5HRU9KU09OX0ZJRUxEUy5nZW9qc29uLCAuLi5nZW9qc29uQ29sdW1uc10pXG4gICAgfTtcblxuICAgIGNvbnN0IGZvdW5kQ29sdW1ucyA9IHRoaXMuZmluZERlZmF1bHRDb2x1bW5GaWVsZChkZWZhdWx0Q29sdW1ucywgZmllbGRzKTtcbiAgICBpZiAoIWZvdW5kQ29sdW1ucyB8fCAhZm91bmRDb2x1bW5zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtwcm9wczogW119O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwcm9wczogZm91bmRDb2x1bW5zLm1hcChjb2x1bW5zID0+ICh7XG4gICAgICAgIGxhYmVsOiAodHlwZW9mIGxhYmVsID09PSAnc3RyaW5nJyAmJiBsYWJlbC5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpKSB8fCB0aGlzLnR5cGUsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzVmlzaWJsZTogdHJ1ZVxuICAgICAgfSkpXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHRMYXllckNvbmZpZyhwcm9wcyA9IHt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLmdldERlZmF1bHRMYXllckNvbmZpZyhwcm9wcyksXG5cbiAgICAgIC8vIGFkZCBoZWlnaHQgdmlzdWFsIGNoYW5uZWxcbiAgICAgIGhlaWdodEZpZWxkOiBudWxsLFxuICAgICAgaGVpZ2h0RG9tYWluOiBbMCwgMV0sXG4gICAgICBoZWlnaHRTY2FsZTogJ2xpbmVhcicsXG5cbiAgICAgIC8vIGFkZCByYWRpdXMgdmlzdWFsIGNoYW5uZWxcbiAgICAgIHJhZGl1c0ZpZWxkOiBudWxsLFxuICAgICAgcmFkaXVzRG9tYWluOiBbMCwgMV0sXG4gICAgICByYWRpdXNTY2FsZTogJ2xpbmVhcicsXG5cbiAgICAgIC8vIGFkZCBzdHJva2UgY29sb3IgdmlzdWFsIGNoYW5uZWxcbiAgICAgIHN0cm9rZUNvbG9yRmllbGQ6IG51bGwsXG4gICAgICBzdHJva2VDb2xvckRvbWFpbjogWzAsIDFdLFxuICAgICAgc3Ryb2tlQ29sb3JTY2FsZTogJ3F1YW50aWxlJ1xuICAgIH07XG4gIH1cblxuICBnZXRIb3ZlckRhdGEob2JqZWN0LCBhbGxEYXRhKSB7XG4gICAgLy8gaW5kZXggb2YgYWxsRGF0YSBpcyBzYXZlZCB0byBmZWF0dXJlLnByb3BlcnRpZXNcbiAgICByZXR1cm4gYWxsRGF0YVtvYmplY3QucHJvcGVydGllcy5pbmRleF07XG4gIH1cblxuICBjYWxjdWxhdGVEYXRhQXR0cmlidXRlKHthbGxEYXRhLCBmaWx0ZXJlZEluZGV4fSwgZ2V0UG9zaXRpb24pIHtcbiAgICByZXR1cm4gZmlsdGVyZWRJbmRleC5tYXAoaSA9PiB0aGlzLmRhdGFUb0ZlYXR1cmVbaV0pLmZpbHRlcihkID0+IGQpO1xuICB9XG4gIC8vIFRPRE86IGZpeCBjb21wbGV4aXR5XG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgZm9ybWF0TGF5ZXJEYXRhKGRhdGFzZXRzLCBvbGRMYXllckRhdGEsIG9wdCA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgY29sb3JTY2FsZSxcbiAgICAgIGNvbG9yRmllbGQsXG4gICAgICBjb2xvckRvbWFpbixcbiAgICAgIHN0cm9rZUNvbG9yRmllbGQsXG4gICAgICBzdHJva2VDb2xvclNjYWxlLFxuICAgICAgc3Ryb2tlQ29sb3JEb21haW4sXG4gICAgICBjb2xvcixcbiAgICAgIHNpemVTY2FsZSxcbiAgICAgIHNpemVEb21haW4sXG4gICAgICBzaXplRmllbGQsXG4gICAgICBoZWlnaHRGaWVsZCxcbiAgICAgIGhlaWdodERvbWFpbixcbiAgICAgIGhlaWdodFNjYWxlLFxuICAgICAgcmFkaXVzRmllbGQsXG4gICAgICByYWRpdXNEb21haW4sXG4gICAgICByYWRpdXNTY2FsZSxcbiAgICAgIHZpc0NvbmZpZ1xuICAgIH0gPSB0aGlzLmNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGVuYWJsZTNkLFxuICAgICAgc3Ryb2tlZCxcbiAgICAgIGNvbG9yUmFuZ2UsXG4gICAgICBoZWlnaHRSYW5nZSxcbiAgICAgIHNpemVSYW5nZSxcbiAgICAgIHJhZGl1c1JhbmdlLFxuICAgICAgc3Ryb2tlQ29sb3JSYW5nZSxcbiAgICAgIHN0cm9rZUNvbG9yXG4gICAgfSA9IHZpc0NvbmZpZztcblxuICAgIGNvbnN0IHthbGxEYXRhLCBncHVGaWx0ZXJ9ID0gZGF0YXNldHNbdGhpcy5jb25maWcuZGF0YUlkXTtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnVwZGF0ZURhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSk7XG5cbiAgICAvLyBmaWxsIGNvbG9yXG4gICAgY29uc3QgY1NjYWxlID1cbiAgICAgIGNvbG9yRmllbGQgJiZcbiAgICAgIHRoaXMuZ2V0VmlzQ2hhbm5lbFNjYWxlKGNvbG9yU2NhbGUsIGNvbG9yRG9tYWluLCBjb2xvclJhbmdlLmNvbG9ycy5tYXAoaGV4VG9SZ2IpKTtcblxuICAgIC8vIHN0cm9rZSBjb2xvclxuICAgIGNvbnN0IHNjU2NhbGUgPVxuICAgICAgc3Ryb2tlQ29sb3JGaWVsZCAmJlxuICAgICAgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoXG4gICAgICAgIHN0cm9rZUNvbG9yU2NhbGUsXG4gICAgICAgIHN0cm9rZUNvbG9yRG9tYWluLFxuICAgICAgICBzdHJva2VDb2xvclJhbmdlLmNvbG9ycy5tYXAoaGV4VG9SZ2IpXG4gICAgICApO1xuXG4gICAgLy8gY2FsY3VsYXRlIHN0cm9rZSBzY2FsZSAtIGlmIHN0cm9rZWQgPSB0cnVlXG4gICAgY29uc3Qgc1NjYWxlID1cbiAgICAgIHNpemVGaWVsZCAmJiBzdHJva2VkICYmIHRoaXMuZ2V0VmlzQ2hhbm5lbFNjYWxlKHNpemVTY2FsZSwgc2l6ZURvbWFpbiwgc2l6ZVJhbmdlKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBlbGV2YXRpb24gc2NhbGUgLSBpZiBleHRydWRlZCA9IHRydWVcbiAgICBjb25zdCBlU2NhbGUgPVxuICAgICAgaGVpZ2h0RmllbGQgJiYgZW5hYmxlM2QgJiYgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoaGVpZ2h0U2NhbGUsIGhlaWdodERvbWFpbiwgaGVpZ2h0UmFuZ2UpO1xuXG4gICAgLy8gcG9pbnQgcmFkaXVzXG4gICAgY29uc3QgclNjYWxlID0gcmFkaXVzRmllbGQgJiYgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUocmFkaXVzU2NhbGUsIHJhZGl1c0RvbWFpbiwgcmFkaXVzUmFuZ2UpO1xuXG4gICAgLy8gYWNjZXNzIGZlYXR1cmUgcHJvcGVydGllcyBmcm9tIGdlb2pzb24gc3ViIGxheWVyXG4gICAgY29uc3QgZ2V0RGF0YUZvckdwdUZpbHRlciA9IGYgPT4gYWxsRGF0YVtmLnByb3BlcnRpZXMuaW5kZXhdO1xuICAgIGNvbnN0IGdldEluZGV4Rm9yR3B1RmlsdGVyID0gZiA9PiBmLnByb3BlcnRpZXMuaW5kZXg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF0YSxcbiAgICAgIGdldEZpbHRlclZhbHVlOiBncHVGaWx0ZXIuZmlsdGVyVmFsdWVBY2Nlc3NvcihnZXRJbmRleEZvckdwdUZpbHRlciwgZ2V0RGF0YUZvckdwdUZpbHRlciksXG4gICAgICBnZXRGaWxsQ29sb3I6IGQgPT5cbiAgICAgICAgY1NjYWxlXG4gICAgICAgICAgPyB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoY1NjYWxlLCBhbGxEYXRhW2QucHJvcGVydGllcy5pbmRleF0sIGNvbG9yRmllbGQpXG4gICAgICAgICAgOiBkLnByb3BlcnRpZXMuZmlsbENvbG9yIHx8IGNvbG9yLFxuICAgICAgZ2V0TGluZUNvbG9yOiBkID0+XG4gICAgICAgIHNjU2NhbGVcbiAgICAgICAgICA/IHRoaXMuZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZShzY1NjYWxlLCBhbGxEYXRhW2QucHJvcGVydGllcy5pbmRleF0sIHN0cm9rZUNvbG9yRmllbGQpXG4gICAgICAgICAgOiBkLnByb3BlcnRpZXMubGluZUNvbG9yIHx8IHN0cm9rZUNvbG9yIHx8IGNvbG9yLFxuICAgICAgZ2V0TGluZVdpZHRoOiBkID0+XG4gICAgICAgIHNTY2FsZVxuICAgICAgICAgID8gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKHNTY2FsZSwgYWxsRGF0YVtkLnByb3BlcnRpZXMuaW5kZXhdLCBzaXplRmllbGQsIDApXG4gICAgICAgICAgOiBkLnByb3BlcnRpZXMubGluZVdpZHRoIHx8IGRlZmF1bHRMaW5lV2lkdGgsXG4gICAgICBnZXRFbGV2YXRpb246IGQgPT5cbiAgICAgICAgZVNjYWxlXG4gICAgICAgICAgPyB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoZVNjYWxlLCBhbGxEYXRhW2QucHJvcGVydGllcy5pbmRleF0sIGhlaWdodEZpZWxkLCAwKVxuICAgICAgICAgIDogZC5wcm9wZXJ0aWVzLmVsZXZhdGlvbiB8fCBkZWZhdWx0RWxldmF0aW9uLFxuICAgICAgZ2V0UmFkaXVzOiBkID0+XG4gICAgICAgIHJTY2FsZVxuICAgICAgICAgID8gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKHJTY2FsZSwgYWxsRGF0YVtkLnByb3BlcnRpZXMuaW5kZXhdLCByYWRpdXNGaWVsZCwgMClcbiAgICAgICAgICA6IGQucHJvcGVydGllcy5yYWRpdXMgfHwgZGVmYXVsdFJhZGl1c1xuICAgIH07XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbiAgdXBkYXRlTGF5ZXJNZXRhKGFsbERhdGEpIHtcbiAgICBjb25zdCBnZXRGZWF0dXJlID0gdGhpcy5nZXRQb3NpdGlvbkFjY2Vzc29yKCk7XG4gICAgdGhpcy5kYXRhVG9GZWF0dXJlID0gZ2V0R2VvanNvbkRhdGFNYXBzKGFsbERhdGEsIGdldEZlYXR1cmUpO1xuXG4gICAgLy8gZ2V0IGJvdW5kcyBmcm9tIGZlYXR1cmVzXG4gICAgY29uc3QgYm91bmRzID0gZ2V0R2VvanNvbkJvdW5kcyh0aGlzLmRhdGFUb0ZlYXR1cmUpO1xuICAgIC8vIGlmIGFueSBvZiB0aGUgZmVhdHVyZSBoYXMgcHJvcGVydGllcy5yYWRpdXMgc2V0IHRvIGJlIHRydWVcbiAgICBjb25zdCBmaXhlZFJhZGl1cyA9IEJvb2xlYW4oXG4gICAgICB0aGlzLmRhdGFUb0ZlYXR1cmUuZmluZChkID0+IGQgJiYgZC5wcm9wZXJ0aWVzICYmIGQucHJvcGVydGllcy5yYWRpdXMpXG4gICAgKTtcblxuICAgIC8vIGtlZXAgYSByZWNvcmQgb2Ygd2hhdCB0eXBlIG9mIGdlb21ldHJ5IHRoZSBjb2xsZWN0aW9uIGhhc1xuICAgIGNvbnN0IGZlYXR1cmVUeXBlcyA9IGdldEdlb2pzb25GZWF0dXJlVHlwZXModGhpcy5kYXRhVG9GZWF0dXJlKTtcblxuICAgIHRoaXMudXBkYXRlTWV0YSh7Ym91bmRzLCBmaXhlZFJhZGl1cywgZmVhdHVyZVR5cGVzfSk7XG4gIH1cblxuICBzZXRJbml0aWFsTGF5ZXJDb25maWcoYWxsRGF0YSkge1xuICAgIHRoaXMudXBkYXRlTGF5ZXJNZXRhKGFsbERhdGEpO1xuXG4gICAgY29uc3Qge2ZlYXR1cmVUeXBlc30gPSB0aGlzLm1ldGE7XG4gICAgLy8gZGVmYXVsdCBzZXR0aW5ncyBpcyBzdHJva2U6IHRydWUsIGZpbGxlZDogZmFsc2VcbiAgICBpZiAoZmVhdHVyZVR5cGVzICYmIGZlYXR1cmVUeXBlcy5wb2x5Z29uKSB7XG4gICAgICAvLyBzZXQgYm90aCBmaWxsIGFuZCBzdHJva2UgdG8gdHJ1ZVxuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlTGF5ZXJWaXNDb25maWcoe1xuICAgICAgICBmaWxsZWQ6IHRydWUsXG4gICAgICAgIHN0cm9rZWQ6IHRydWUsXG4gICAgICAgIHN0cm9rZUNvbG9yOiBjb2xvck1ha2VyLm5leHQoKS52YWx1ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChmZWF0dXJlVHlwZXMgJiYgZmVhdHVyZVR5cGVzLnBvaW50KSB7XG4gICAgICAvLyBzZXQgZmlsbCB0byB0cnVlIGlmIGRldGVjdCBwb2ludFxuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlTGF5ZXJWaXNDb25maWcoe2ZpbGxlZDogdHJ1ZSwgc3Ryb2tlZDogZmFsc2V9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbmRlckxheWVyKG9wdHMpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ3B1RmlsdGVyLCBvYmplY3RIb3ZlcmVkLCBtYXBTdGF0ZX0gPSBvcHRzO1xuXG4gICAgY29uc3Qge2ZpeGVkUmFkaXVzLCBmZWF0dXJlVHlwZXN9ID0gdGhpcy5tZXRhO1xuICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gdGhpcy5nZXRSYWRpdXNTY2FsZUJ5Wm9vbShtYXBTdGF0ZSwgZml4ZWRSYWRpdXMpO1xuICAgIGNvbnN0IHpvb21GYWN0b3IgPSB0aGlzLmdldFpvb21GYWN0b3IobWFwU3RhdGUpO1xuICAgIGNvbnN0IGVsZVpvb21GYWN0b3IgPSB0aGlzLmdldEVsZXZhdGlvblpvb21GYWN0b3IobWFwU3RhdGUpO1xuXG4gICAgY29uc3Qge3Zpc0NvbmZpZ30gPSB0aGlzLmNvbmZpZztcblxuICAgIGNvbnN0IGxheWVyUHJvcHMgPSB7XG4gICAgICBsaW5lV2lkdGhTY2FsZTogdmlzQ29uZmlnLnRoaWNrbmVzcyAqIHpvb21GYWN0b3IgKiA4LFxuICAgICAgZWxldmF0aW9uU2NhbGU6IHZpc0NvbmZpZy5lbGV2YXRpb25TY2FsZSAqIGVsZVpvb21GYWN0b3IsXG4gICAgICBwb2ludFJhZGl1c1NjYWxlOiByYWRpdXNTY2FsZSxcbiAgICAgIGxpbmVNaXRlckxpbWl0OiA0XG4gICAgfTtcblxuICAgIGNvbnN0IHVwZGF0ZVRyaWdnZXJzID0ge1xuICAgICAgZ2V0RWxldmF0aW9uOiB7XG4gICAgICAgIGhlaWdodEZpZWxkOiB0aGlzLmNvbmZpZy5oZWlnaHRGaWVsZCxcbiAgICAgICAgaGVpZ2h0U2NhbGVUeXBlOiB0aGlzLmNvbmZpZy5oZWlnaHRTY2FsZSxcbiAgICAgICAgaGVpZ2h0UmFuZ2U6IHZpc0NvbmZpZy5oZWlnaHRSYW5nZVxuICAgICAgfSxcbiAgICAgIGdldEZpbGxDb2xvcjoge1xuICAgICAgICBjb2xvcjogdGhpcy5jb25maWcuY29sb3IsXG4gICAgICAgIGNvbG9yRmllbGQ6IHRoaXMuY29uZmlnLmNvbG9yRmllbGQsXG4gICAgICAgIGNvbG9yUmFuZ2U6IHZpc0NvbmZpZy5jb2xvclJhbmdlLFxuICAgICAgICBjb2xvclNjYWxlOiB0aGlzLmNvbmZpZy5jb2xvclNjYWxlXG4gICAgICB9LFxuICAgICAgZ2V0TGluZUNvbG9yOiB7XG4gICAgICAgIGNvbG9yOiB2aXNDb25maWcuc3Ryb2tlQ29sb3IsXG4gICAgICAgIGNvbG9yRmllbGQ6IHRoaXMuY29uZmlnLnN0cm9rZUNvbG9yRmllbGQsXG4gICAgICAgIGNvbG9yUmFuZ2U6IHZpc0NvbmZpZy5zdHJva2VDb2xvclJhbmdlLFxuICAgICAgICBjb2xvclNjYWxlOiB0aGlzLmNvbmZpZy5zdHJva2VDb2xvclNjYWxlXG4gICAgICB9LFxuICAgICAgZ2V0TGluZVdpZHRoOiB7XG4gICAgICAgIHNpemVGaWVsZDogdGhpcy5jb25maWcuc2l6ZUZpZWxkLFxuICAgICAgICBzaXplUmFuZ2U6IHZpc0NvbmZpZy5zaXplUmFuZ2VcbiAgICAgIH0sXG4gICAgICBnZXRSYWRpdXM6IHtcbiAgICAgICAgcmFkaXVzRmllbGQ6IHRoaXMuY29uZmlnLnJhZGl1c0ZpZWxkLFxuICAgICAgICByYWRpdXNSYW5nZTogdmlzQ29uZmlnLnJhZGl1c1JhbmdlXG4gICAgICB9LFxuICAgICAgZ2V0RmlsdGVyVmFsdWU6IGdwdUZpbHRlci5maWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzXG4gICAgfTtcblxuICAgIGNvbnN0IGRlZmF1bHRMYXllclByb3BzID0gdGhpcy5nZXREZWZhdWx0RGVja0xheWVyUHJvcHMob3B0cyk7XG4gICAgY29uc3Qgb3BhT3ZlcndyaXRlID0ge1xuICAgICAgb3BhY2l0eTogdmlzQ29uZmlnLnN0cm9rZU9wYWNpdHlcbiAgICB9O1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBEZWNrR0xHZW9Kc29uTGF5ZXIoe1xuICAgICAgICAuLi5kZWZhdWx0TGF5ZXJQcm9wcyxcbiAgICAgICAgLi4ubGF5ZXJQcm9wcyxcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgaGlnaGxpZ2h0Q29sb3I6IEhJR0hMSUdIX0NPTE9SXzNELFxuICAgICAgICBhdXRvSGlnaGxpZ2h0OiB2aXNDb25maWcuZW5hYmxlM2QsXG4gICAgICAgIHN0cm9rZWQ6IHZpc0NvbmZpZy5zdHJva2VkLFxuICAgICAgICBmaWxsZWQ6IHZpc0NvbmZpZy5maWxsZWQsXG4gICAgICAgIGV4dHJ1ZGVkOiB2aXNDb25maWcuZW5hYmxlM2QsXG4gICAgICAgIHdpcmVmcmFtZTogdmlzQ29uZmlnLndpcmVmcmFtZSxcbiAgICAgICAgd3JhcExvbmdpdHVkZTogZmFsc2UsXG4gICAgICAgIGxpbmVNaXRlckxpbWl0OiAyLFxuICAgICAgICByb3VuZGVkOiB0cnVlLFxuICAgICAgICB1cGRhdGVUcmlnZ2VycyxcbiAgICAgICAgX3N1YkxheWVyUHJvcHM6IHtcbiAgICAgICAgICAuLi4oZmVhdHVyZVR5cGVzLnBvbHlnb24gPyB7J3BvbHlnb25zLXN0cm9rZSc6IG9wYU92ZXJ3cml0ZX0gOiB7fSksXG4gICAgICAgICAgLi4uKGZlYXR1cmVUeXBlcy5saW5lID8geydsaW5lLXN0cmluZ3MnOiBvcGFPdmVyd3JpdGV9IDoge30pLFxuICAgICAgICAgIC4uLihmZWF0dXJlVHlwZXMucG9pbnRcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHBvaW50czoge1xuICAgICAgICAgICAgICAgICAgbGluZU9wYWNpdHk6IHZpc0NvbmZpZy5zdHJva2VPcGFjaXR5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHt9KVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC4uLih0aGlzLmlzTGF5ZXJIb3ZlcmVkKG9iamVjdEhvdmVyZWQpICYmICF2aXNDb25maWcuZW5hYmxlM2RcbiAgICAgICAgPyBbXG4gICAgICAgICAgICBuZXcgRGVja0dMR2VvSnNvbkxheWVyKHtcbiAgICAgICAgICAgICAgLi4udGhpcy5nZXREZWZhdWx0SG92ZXJMYXllclByb3BzKCksXG4gICAgICAgICAgICAgIC4uLmxheWVyUHJvcHMsXG4gICAgICAgICAgICAgIHdyYXBMb25naXR1ZGU6IGZhbHNlLFxuICAgICAgICAgICAgICBkYXRhOiBbb2JqZWN0SG92ZXJlZC5vYmplY3RdLFxuICAgICAgICAgICAgICBnZXRMaW5lV2lkdGg6IGRhdGEuZ2V0TGluZVdpZHRoLFxuICAgICAgICAgICAgICBnZXRSYWRpdXM6IGRhdGEuZ2V0UmFkaXVzLFxuICAgICAgICAgICAgICBnZXRFbGV2YXRpb246IGRhdGEuZ2V0RWxldmF0aW9uLFxuICAgICAgICAgICAgICBnZXRMaW5lQ29sb3I6IHRoaXMuY29uZmlnLmhpZ2hsaWdodENvbG9yLFxuICAgICAgICAgICAgICBnZXRGaWxsQ29sb3I6IHRoaXMuY29uZmlnLmhpZ2hsaWdodENvbG9yLFxuICAgICAgICAgICAgICAvLyBhbHdheXMgZHJhdyBvdXRsaW5lXG4gICAgICAgICAgICAgIHN0cm9rZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGZpbGxlZDogZmFsc2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKVxuICAgIF07XG4gIH1cbn1cbiJdfQ==