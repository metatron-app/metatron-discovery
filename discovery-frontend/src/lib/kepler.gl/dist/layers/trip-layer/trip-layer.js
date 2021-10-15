"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.featureResolver = exports.featureAccessor = exports.geoJsonRequiredColumns = exports.tripVisConfigs = exports.defaultWidth = exports.defaultThickness = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _lodash2 = _interopRequireDefault(require("lodash.uniq"));

var _baseLayer = _interopRequireDefault(require("../base-layer"));

var _geoLayers = require("@deck.gl/geo-layers");

var _defaultSettings = require("../../constants/default-settings");

var _tripLayerIcon = _interopRequireDefault(require("./trip-layer-icon"));

var _geojsonUtils = require("../geojson-layer/geojson-utils");

var _tripUtils = require("./trip-utils");

var _colorUtils = require("../../utils/color-utils");

var _tripInfoModal = _interopRequireDefault(require("./trip-info-modal"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var zoomFactorValue = 8;
var defaultThickness = 0.5;
exports.defaultThickness = defaultThickness;
var defaultWidth = 1;
exports.defaultWidth = defaultWidth;
var tripVisConfigs = {
  opacity: 'opacity',
  thickness: {
    type: 'number',
    defaultValue: defaultThickness,
    label: 'Stroke Width',
    isRanged: false,
    range: [0, 100],
    step: 0.1,
    group: 'stroke',
    property: 'thickness'
  },
  colorRange: 'colorRange',
  trailLength: 'trailLength',
  sizeRange: 'strokeWidthRange'
};
exports.tripVisConfigs = tripVisConfigs;
var geoJsonRequiredColumns = ['geojson'];
exports.geoJsonRequiredColumns = geoJsonRequiredColumns;

var featureAccessor = function featureAccessor(_ref) {
  var geojson = _ref.geojson;
  return function (d) {
    return d[geojson.fieldIdx];
  };
};

exports.featureAccessor = featureAccessor;

var featureResolver = function featureResolver(_ref2) {
  var geojson = _ref2.geojson;
  return geojson.fieldIdx;
};

exports.featureResolver = featureResolver;

var TripLayer = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(TripLayer, _Layer);

  var _super = _createSuper(TripLayer);

  function TripLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, TripLayer);
    _this = _super.call(this, props);
    _this.dataToFeature = [];
    _this.dataToTimeStamp = [];

    _this.registerVisConfig(tripVisConfigs);

    _this.getFeature = (0, _lodash["default"])(featureAccessor, featureResolver);
    _this._layerInfoModal = (0, _tripInfoModal["default"])();
    return _this;
  }

  (0, _createClass2["default"])(TripLayer, [{
    key: "getPositionAccessor",
    value: function getPositionAccessor() {
      return this.getFeature(this.config.columns);
    }
  }, {
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig(props) {
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(TripLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        animation: {
          enabled: true,
          domain: null
        }
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
    value: function calculateDataAttribute(_ref3, getPosition) {
      var _this2 = this;

      var allData = _ref3.allData,
          filteredIndex = _ref3.filteredIndex;
      return filteredIndex.map(function (i) {
        return _this2.dataToFeature[i];
      }).filter(function (d) {
        return d && d.geometry.type === 'LineString';
      });
    }
  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, oldLayerData) {
      var _this3 = this;

      // to-do: parse segment from allData
      var _this$config = this.config,
          colorScale = _this$config.colorScale,
          colorField = _this$config.colorField,
          colorDomain = _this$config.colorDomain,
          color = _this$config.color,
          sizeScale = _this$config.sizeScale,
          sizeDomain = _this$config.sizeDomain,
          sizeField = _this$config.sizeField,
          visConfig = _this$config.visConfig;
      var colorRange = visConfig.colorRange,
          sizeRange = visConfig.sizeRange;
      var _datasets$this$config = datasets[this.config.dataId],
          allData = _datasets$this$config.allData,
          gpuFilter = _datasets$this$config.gpuFilter;

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data; // color


      var cScale = colorField && this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(_colorUtils.hexToRgb)); // calculate stroke scale - if stroked = true

      var sScale = sizeField && this.getVisChannelScale(sizeScale, sizeDomain, sizeRange); // access feature properties from geojson sub layer

      var getDataForGpuFilter = function getDataForGpuFilter(f) {
        return allData[f.properties.index];
      };

      var getIndexForGpuFilter = function getIndexForGpuFilter(f) {
        return f.properties.index;
      };

      return {
        data: data,
        getFilterValue: gpuFilter.filterValueAccessor(getIndexForGpuFilter, getDataForGpuFilter),
        getPath: function getPath(d) {
          return d.geometry.coordinates;
        },
        getTimestamps: function getTimestamps(d) {
          return _this3.dataToTimeStamp[d.properties.index];
        },
        getColor: function getColor(d) {
          return cScale ? _this3.getEncodedChannelValue(cScale, allData[d.properties.index], colorField) : d.properties.fillColor || color;
        },
        getWidth: function getWidth(d) {
          return sScale ? _this3.getEncodedChannelValue(sScale, allData[d.properties.index], sizeField, 0) : d.properties.lineWidth || defaultWidth;
        }
      };
    }
  }, {
    key: "updateAnimationDomain",
    value: function updateAnimationDomain(domain) {
      this.updateLayerConfig({
        animation: _objectSpread(_objectSpread({}, this.config.animation), {}, {
          domain: domain
        })
      });
    }
  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData) {
      var getFeature = this.getPositionAccessor();

      if (getFeature === this.meta.getFeature) {
        // TODO: revisit this after gpu filtering
        return;
      }

      this.dataToFeature = (0, _geojsonUtils.getGeojsonDataMaps)(allData, getFeature);

      var _parseTripGeoJsonTime = (0, _tripUtils.parseTripGeoJsonTimestamp)(this.dataToFeature),
          dataToTimeStamp = _parseTripGeoJsonTime.dataToTimeStamp,
          animationDomain = _parseTripGeoJsonTime.animationDomain;

      this.dataToTimeStamp = dataToTimeStamp;
      this.updateAnimationDomain(animationDomain); // get bounds from features

      var bounds = (0, _geojsonUtils.getGeojsonBounds)(this.dataToFeature); // keep a record of what type of geometry the collection has

      var featureTypes = (0, _geojsonUtils.getGeojsonFeatureTypes)(this.dataToFeature);
      this.updateMeta({
        bounds: bounds,
        featureTypes: featureTypes,
        getFeature: getFeature
      });
    }
  }, {
    key: "setInitialLayerConfig",
    value: function setInitialLayerConfig(allData) {
      this.updateLayerMeta(allData);
      return this;
    }
  }, {
    key: "renderLayer",
    value: function renderLayer(opts) {
      var data = opts.data,
          gpuFilter = opts.gpuFilter,
          mapState = opts.mapState,
          animationConfig = opts.animationConfig;
      var visConfig = this.config.visConfig;
      var zoomFactor = this.getZoomFactor(mapState);
      var updateTriggers = {
        getColor: {
          color: this.config.color,
          colorField: this.config.colorField,
          colorRange: visConfig.colorRange,
          colorScale: this.config.colorScale
        },
        getWidth: {
          sizeField: this.config.sizeField,
          sizeRange: visConfig.sizeRange
        },
        getTimestamps: {
          columns: this.config.columns,
          domain0: animationConfig.domain[0]
        },
        getFilterValue: gpuFilter.filterValueUpdateTriggers
      };
      var defaultLayerProps = this.getDefaultDeckLayerProps(opts);
      return [new _geoLayers.TripsLayer(_objectSpread(_objectSpread(_objectSpread({}, defaultLayerProps), data), {}, {
        getTimestamps: function getTimestamps(d) {
          return data.getTimestamps(d).map(function (ts) {
            return ts - animationConfig.domain[0];
          });
        },
        widthScale: this.config.visConfig.thickness * zoomFactor * zoomFactorValue,
        rounded: true,
        wrapLongitude: false,
        parameters: {
          depthTest: mapState.dragRotate,
          depthMask: false
        },
        trailLength: visConfig.trailLength * 1000,
        currentTime: animationConfig.currentTime - animationConfig.domain[0],
        updateTriggers: updateTriggers
      }))];
    }
  }, {
    key: "type",
    get: function get() {
      return 'trip';
    }
  }, {
    key: "name",
    get: function get() {
      return 'Trip';
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _tripLayerIcon["default"];
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return geoJsonRequiredColumns;
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(TripLayer.prototype), "visualChannels", this)), {}, {
        size: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(TripLayer.prototype), "visualChannels", this).size), {}, {
          property: 'stroke',
          condition: function condition(config) {
            return config.visConfig.stroked;
          }
        })
      });
    }
  }, {
    key: "animationDomain",
    get: function get() {
      return this.config.animation.domain;
    }
  }, {
    key: "layerInfoModal",
    get: function get() {
      return {
        id: 'iconInfo',
        template: this._layerInfoModal,
        modalProps: {
          title: 'modal.tripInfo.title'
        }
      };
    }
  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(_ref4, foundLayers) {
      var _this4 = this;

      var label = _ref4.label,
          _ref4$fields = _ref4.fields,
          fields = _ref4$fields === void 0 ? [] : _ref4$fields,
          _ref4$allData = _ref4.allData,
          allData = _ref4$allData === void 0 ? [] : _ref4$allData,
          id = _ref4.id;
      var geojsonColumns = fields.filter(function (f) {
        return f.type === 'geojson';
      }).map(function (f) {
        return f.name;
      });
      var defaultColumns = {
        geojson: (0, _lodash2["default"])([].concat((0, _toConsumableArray2["default"])(_defaultSettings.GEOJSON_FIELDS.geojson), (0, _toConsumableArray2["default"])(geojsonColumns)))
      };
      var geoJsonColumns = this.findDefaultColumnField(defaultColumns, fields);
      var tripColumns = (geoJsonColumns || []).filter(function (col) {
        return (0, _tripUtils.isTripGeoJsonField)(allData, fields[col.geojson.fieldIdx]);
      });

      if (!tripColumns.length) {
        return {
          props: []
        };
      }

      return {
        props: tripColumns.map(function (columns) {
          return {
            label: typeof label === 'string' && label.replace(/\.[^/.]+$/, '') || _this4.type,
            columns: columns,
            isVisible: true
          };
        }),
        // if a geojson layer is created from this column, delete it
        foundLayers: foundLayers.filter(function (prop) {
          return prop.type !== 'geojson' || prop.dataId !== id || !tripColumns.find(function (c) {
            return prop.columns.geojson.name === c.geojson.name;
          });
        })
      };
    }
  }]);
  return TripLayer;
}(_baseLayer["default"]);

exports["default"] = TripLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvdHJpcC1sYXllci90cmlwLWxheWVyLmpzIl0sIm5hbWVzIjpbInpvb21GYWN0b3JWYWx1ZSIsImRlZmF1bHRUaGlja25lc3MiLCJkZWZhdWx0V2lkdGgiLCJ0cmlwVmlzQ29uZmlncyIsIm9wYWNpdHkiLCJ0aGlja25lc3MiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwibGFiZWwiLCJpc1JhbmdlZCIsInJhbmdlIiwic3RlcCIsImdyb3VwIiwicHJvcGVydHkiLCJjb2xvclJhbmdlIiwidHJhaWxMZW5ndGgiLCJzaXplUmFuZ2UiLCJnZW9Kc29uUmVxdWlyZWRDb2x1bW5zIiwiZmVhdHVyZUFjY2Vzc29yIiwiZ2VvanNvbiIsImQiLCJmaWVsZElkeCIsImZlYXR1cmVSZXNvbHZlciIsIlRyaXBMYXllciIsInByb3BzIiwiZGF0YVRvRmVhdHVyZSIsImRhdGFUb1RpbWVTdGFtcCIsInJlZ2lzdGVyVmlzQ29uZmlnIiwiZ2V0RmVhdHVyZSIsIl9sYXllckluZm9Nb2RhbCIsImNvbmZpZyIsImNvbHVtbnMiLCJhbmltYXRpb24iLCJlbmFibGVkIiwiZG9tYWluIiwib2JqZWN0IiwiYWxsRGF0YSIsInByb3BlcnRpZXMiLCJpbmRleCIsImdldFBvc2l0aW9uIiwiZmlsdGVyZWRJbmRleCIsIm1hcCIsImkiLCJmaWx0ZXIiLCJnZW9tZXRyeSIsImRhdGFzZXRzIiwib2xkTGF5ZXJEYXRhIiwiY29sb3JTY2FsZSIsImNvbG9yRmllbGQiLCJjb2xvckRvbWFpbiIsImNvbG9yIiwic2l6ZVNjYWxlIiwic2l6ZURvbWFpbiIsInNpemVGaWVsZCIsInZpc0NvbmZpZyIsImRhdGFJZCIsImdwdUZpbHRlciIsInVwZGF0ZURhdGEiLCJkYXRhIiwiY1NjYWxlIiwiZ2V0VmlzQ2hhbm5lbFNjYWxlIiwiY29sb3JzIiwiaGV4VG9SZ2IiLCJzU2NhbGUiLCJnZXREYXRhRm9yR3B1RmlsdGVyIiwiZiIsImdldEluZGV4Rm9yR3B1RmlsdGVyIiwiZ2V0RmlsdGVyVmFsdWUiLCJmaWx0ZXJWYWx1ZUFjY2Vzc29yIiwiZ2V0UGF0aCIsImNvb3JkaW5hdGVzIiwiZ2V0VGltZXN0YW1wcyIsImdldENvbG9yIiwiZ2V0RW5jb2RlZENoYW5uZWxWYWx1ZSIsImZpbGxDb2xvciIsImdldFdpZHRoIiwibGluZVdpZHRoIiwidXBkYXRlTGF5ZXJDb25maWciLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwibWV0YSIsImFuaW1hdGlvbkRvbWFpbiIsInVwZGF0ZUFuaW1hdGlvbkRvbWFpbiIsImJvdW5kcyIsImZlYXR1cmVUeXBlcyIsInVwZGF0ZU1ldGEiLCJ1cGRhdGVMYXllck1ldGEiLCJvcHRzIiwibWFwU3RhdGUiLCJhbmltYXRpb25Db25maWciLCJ6b29tRmFjdG9yIiwiZ2V0Wm9vbUZhY3RvciIsInVwZGF0ZVRyaWdnZXJzIiwiZG9tYWluMCIsImZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnMiLCJkZWZhdWx0TGF5ZXJQcm9wcyIsImdldERlZmF1bHREZWNrTGF5ZXJQcm9wcyIsIkRlY2tHTFRyaXBzTGF5ZXIiLCJ0cyIsIndpZHRoU2NhbGUiLCJyb3VuZGVkIiwid3JhcExvbmdpdHVkZSIsInBhcmFtZXRlcnMiLCJkZXB0aFRlc3QiLCJkcmFnUm90YXRlIiwiZGVwdGhNYXNrIiwiY3VycmVudFRpbWUiLCJUcmlwTGF5ZXJJY29uIiwic2l6ZSIsImNvbmRpdGlvbiIsInN0cm9rZWQiLCJpZCIsInRlbXBsYXRlIiwibW9kYWxQcm9wcyIsInRpdGxlIiwiZm91bmRMYXllcnMiLCJmaWVsZHMiLCJnZW9qc29uQ29sdW1ucyIsIm5hbWUiLCJkZWZhdWx0Q29sdW1ucyIsIkdFT0pTT05fRklFTERTIiwiZ2VvSnNvbkNvbHVtbnMiLCJmaW5kRGVmYXVsdENvbHVtbkZpZWxkIiwidHJpcENvbHVtbnMiLCJjb2wiLCJsZW5ndGgiLCJyZXBsYWNlIiwiaXNWaXNpYmxlIiwicHJvcCIsImZpbmQiLCJjIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7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RUFBRTtBQUFSLFNBQVA7QUFDRDs7QUFFRCxhQUFPO0FBQ0xBLFFBQUFBLEtBQUssRUFBRWtHLFdBQVcsQ0FBQ2pGLEdBQVosQ0FBZ0IsVUFBQVYsT0FBTztBQUFBLGlCQUFLO0FBQ2pDdkIsWUFBQUEsS0FBSyxFQUFHLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsSUFBNkJBLEtBQUssQ0FBQ3FILE9BQU4sQ0FBYyxXQUFkLEVBQTJCLEVBQTNCLENBQTlCLElBQWlFLE1BQUksQ0FBQ3ZILElBRDVDO0FBRWpDeUIsWUFBQUEsT0FBTyxFQUFQQSxPQUZpQztBQUdqQytGLFlBQUFBLFNBQVMsRUFBRTtBQUhzQixXQUFMO0FBQUEsU0FBdkIsQ0FERjtBQU9MO0FBQ0FaLFFBQUFBLFdBQVcsRUFBRUEsV0FBVyxDQUFDdkUsTUFBWixDQUNYLFVBQUFvRixJQUFJO0FBQUEsaUJBQ0ZBLElBQUksQ0FBQ3pILElBQUwsS0FBYyxTQUFkLElBQ0F5SCxJQUFJLENBQUN4RSxNQUFMLEtBQWdCdUQsRUFEaEIsSUFFQSxDQUFDWSxXQUFXLENBQUNNLElBQVosQ0FBaUIsVUFBQUMsQ0FBQztBQUFBLG1CQUFJRixJQUFJLENBQUNoRyxPQUFMLENBQWFaLE9BQWIsQ0FBcUJrRyxJQUFyQixLQUE4QlksQ0FBQyxDQUFDOUcsT0FBRixDQUFVa0csSUFBNUM7QUFBQSxXQUFsQixDQUhDO0FBQUEsU0FETztBQVJSLE9BQVA7QUFlRDs7O0VBekZvQ2EscUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICdsb2Rhc2gubWVtb2l6ZSc7XG5pbXBvcnQgdW5pcSBmcm9tICdsb2Rhc2gudW5pcSc7XG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vYmFzZS1sYXllcic7XG5pbXBvcnQge1RyaXBzTGF5ZXIgYXMgRGVja0dMVHJpcHNMYXllcn0gZnJvbSAnQGRlY2suZ2wvZ2VvLWxheWVycyc7XG5cbmltcG9ydCB7R0VPSlNPTl9GSUVMRFN9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCBUcmlwTGF5ZXJJY29uIGZyb20gJy4vdHJpcC1sYXllci1pY29uJztcblxuaW1wb3J0IHtcbiAgZ2V0R2VvanNvbkRhdGFNYXBzLFxuICBnZXRHZW9qc29uQm91bmRzLFxuICBnZXRHZW9qc29uRmVhdHVyZVR5cGVzXG59IGZyb20gJ2xheWVycy9nZW9qc29uLWxheWVyL2dlb2pzb24tdXRpbHMnO1xuXG5pbXBvcnQge2lzVHJpcEdlb0pzb25GaWVsZCwgcGFyc2VUcmlwR2VvSnNvblRpbWVzdGFtcH0gZnJvbSAnLi90cmlwLXV0aWxzJztcblxuaW1wb3J0IHtoZXhUb1JnYn0gZnJvbSAndXRpbHMvY29sb3ItdXRpbHMnO1xuaW1wb3J0IFRyaXBJbmZvTW9kYWxGYWN0b3J5IGZyb20gJy4vdHJpcC1pbmZvLW1vZGFsJztcblxuY29uc3Qgem9vbUZhY3RvclZhbHVlID0gODtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUaGlja25lc3MgPSAwLjU7XG5leHBvcnQgY29uc3QgZGVmYXVsdFdpZHRoID0gMTtcblxuZXhwb3J0IGNvbnN0IHRyaXBWaXNDb25maWdzID0ge1xuICBvcGFjaXR5OiAnb3BhY2l0eScsXG4gIHRoaWNrbmVzczoge1xuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIGRlZmF1bHRWYWx1ZTogZGVmYXVsdFRoaWNrbmVzcyxcbiAgICBsYWJlbDogJ1N0cm9rZSBXaWR0aCcsXG4gICAgaXNSYW5nZWQ6IGZhbHNlLFxuICAgIHJhbmdlOiBbMCwgMTAwXSxcbiAgICBzdGVwOiAwLjEsXG4gICAgZ3JvdXA6ICdzdHJva2UnLFxuICAgIHByb3BlcnR5OiAndGhpY2tuZXNzJ1xuICB9LFxuICBjb2xvclJhbmdlOiAnY29sb3JSYW5nZScsXG4gIHRyYWlsTGVuZ3RoOiAndHJhaWxMZW5ndGgnLFxuICBzaXplUmFuZ2U6ICdzdHJva2VXaWR0aFJhbmdlJ1xufTtcblxuZXhwb3J0IGNvbnN0IGdlb0pzb25SZXF1aXJlZENvbHVtbnMgPSBbJ2dlb2pzb24nXTtcbmV4cG9ydCBjb25zdCBmZWF0dXJlQWNjZXNzb3IgPSAoe2dlb2pzb259KSA9PiBkID0+IGRbZ2VvanNvbi5maWVsZElkeF07XG5leHBvcnQgY29uc3QgZmVhdHVyZVJlc29sdmVyID0gKHtnZW9qc29ufSkgPT4gZ2VvanNvbi5maWVsZElkeDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJpcExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuZGF0YVRvRmVhdHVyZSA9IFtdO1xuICAgIHRoaXMuZGF0YVRvVGltZVN0YW1wID0gW107XG4gICAgdGhpcy5yZWdpc3RlclZpc0NvbmZpZyh0cmlwVmlzQ29uZmlncyk7XG4gICAgdGhpcy5nZXRGZWF0dXJlID0gbWVtb2l6ZShmZWF0dXJlQWNjZXNzb3IsIGZlYXR1cmVSZXNvbHZlcik7XG4gICAgdGhpcy5fbGF5ZXJJbmZvTW9kYWwgPSBUcmlwSW5mb01vZGFsRmFjdG9yeSgpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICd0cmlwJztcbiAgfVxuXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiAnVHJpcCc7XG4gIH1cblxuICBnZXQgbGF5ZXJJY29uKCkge1xuICAgIHJldHVybiBUcmlwTGF5ZXJJY29uO1xuICB9XG5cbiAgZ2V0IHJlcXVpcmVkTGF5ZXJDb2x1bW5zKCkge1xuICAgIHJldHVybiBnZW9Kc29uUmVxdWlyZWRDb2x1bW5zO1xuICB9XG5cbiAgZ2V0IHZpc3VhbENoYW5uZWxzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci52aXN1YWxDaGFubmVscyxcblxuICAgICAgc2l6ZToge1xuICAgICAgICAuLi5zdXBlci52aXN1YWxDaGFubmVscy5zaXplLFxuICAgICAgICBwcm9wZXJ0eTogJ3N0cm9rZScsXG4gICAgICAgIGNvbmRpdGlvbjogY29uZmlnID0+IGNvbmZpZy52aXNDb25maWcuc3Ryb2tlZFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBnZXQgYW5pbWF0aW9uRG9tYWluKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5hbmltYXRpb24uZG9tYWluO1xuICB9XG5cbiAgZ2V0IGxheWVySW5mb01vZGFsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogJ2ljb25JbmZvJyxcbiAgICAgIHRlbXBsYXRlOiB0aGlzLl9sYXllckluZm9Nb2RhbCxcbiAgICAgIG1vZGFsUHJvcHM6IHtcbiAgICAgICAgdGl0bGU6ICdtb2RhbC50cmlwSW5mby50aXRsZSdcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0UG9zaXRpb25BY2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGZWF0dXJlKHRoaXMuY29uZmlnLmNvbHVtbnMpO1xuICB9XG5cbiAgc3RhdGljIGZpbmREZWZhdWx0TGF5ZXJQcm9wcyh7bGFiZWwsIGZpZWxkcyA9IFtdLCBhbGxEYXRhID0gW10sIGlkfSwgZm91bmRMYXllcnMpIHtcbiAgICBjb25zdCBnZW9qc29uQ29sdW1ucyA9IGZpZWxkcy5maWx0ZXIoZiA9PiBmLnR5cGUgPT09ICdnZW9qc29uJykubWFwKGYgPT4gZi5uYW1lKTtcblxuICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0ge1xuICAgICAgZ2VvanNvbjogdW5pcShbLi4uR0VPSlNPTl9GSUVMRFMuZ2VvanNvbiwgLi4uZ2VvanNvbkNvbHVtbnNdKVxuICAgIH07XG5cbiAgICBjb25zdCBnZW9Kc29uQ29sdW1ucyA9IHRoaXMuZmluZERlZmF1bHRDb2x1bW5GaWVsZChkZWZhdWx0Q29sdW1ucywgZmllbGRzKTtcblxuICAgIGNvbnN0IHRyaXBDb2x1bW5zID0gKGdlb0pzb25Db2x1bW5zIHx8IFtdKS5maWx0ZXIoY29sID0+XG4gICAgICBpc1RyaXBHZW9Kc29uRmllbGQoYWxsRGF0YSwgZmllbGRzW2NvbC5nZW9qc29uLmZpZWxkSWR4XSlcbiAgICApO1xuXG4gICAgaWYgKCF0cmlwQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7cHJvcHM6IFtdfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvcHM6IHRyaXBDb2x1bW5zLm1hcChjb2x1bW5zID0+ICh7XG4gICAgICAgIGxhYmVsOiAodHlwZW9mIGxhYmVsID09PSAnc3RyaW5nJyAmJiBsYWJlbC5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpKSB8fCB0aGlzLnR5cGUsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzVmlzaWJsZTogdHJ1ZVxuICAgICAgfSkpLFxuXG4gICAgICAvLyBpZiBhIGdlb2pzb24gbGF5ZXIgaXMgY3JlYXRlZCBmcm9tIHRoaXMgY29sdW1uLCBkZWxldGUgaXRcbiAgICAgIGZvdW5kTGF5ZXJzOiBmb3VuZExheWVycy5maWx0ZXIoXG4gICAgICAgIHByb3AgPT5cbiAgICAgICAgICBwcm9wLnR5cGUgIT09ICdnZW9qc29uJyB8fFxuICAgICAgICAgIHByb3AuZGF0YUlkICE9PSBpZCB8fFxuICAgICAgICAgICF0cmlwQ29sdW1ucy5maW5kKGMgPT4gcHJvcC5jb2x1bW5zLmdlb2pzb24ubmFtZSA9PT0gYy5nZW9qc29uLm5hbWUpXG4gICAgICApXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHRMYXllckNvbmZpZyhwcm9wcykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci5nZXREZWZhdWx0TGF5ZXJDb25maWcocHJvcHMpLFxuICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGRvbWFpbjogbnVsbFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBnZXRIb3ZlckRhdGEob2JqZWN0LCBhbGxEYXRhKSB7XG4gICAgLy8gaW5kZXggb2YgYWxsRGF0YSBpcyBzYXZlZCB0byBmZWF0dXJlLnByb3BlcnRpZXNcbiAgICByZXR1cm4gYWxsRGF0YVtvYmplY3QucHJvcGVydGllcy5pbmRleF07XG4gIH1cblxuICBjYWxjdWxhdGVEYXRhQXR0cmlidXRlKHthbGxEYXRhLCBmaWx0ZXJlZEluZGV4fSwgZ2V0UG9zaXRpb24pIHtcbiAgICByZXR1cm4gZmlsdGVyZWRJbmRleFxuICAgICAgLm1hcChpID0+IHRoaXMuZGF0YVRvRmVhdHVyZVtpXSlcbiAgICAgIC5maWx0ZXIoZCA9PiBkICYmIGQuZ2VvbWV0cnkudHlwZSA9PT0gJ0xpbmVTdHJpbmcnKTtcbiAgfVxuXG4gIGZvcm1hdExheWVyRGF0YShkYXRhc2V0cywgb2xkTGF5ZXJEYXRhKSB7XG4gICAgLy8gdG8tZG86IHBhcnNlIHNlZ21lbnQgZnJvbSBhbGxEYXRhXG5cbiAgICBjb25zdCB7XG4gICAgICBjb2xvclNjYWxlLFxuICAgICAgY29sb3JGaWVsZCxcbiAgICAgIGNvbG9yRG9tYWluLFxuICAgICAgY29sb3IsXG4gICAgICBzaXplU2NhbGUsXG4gICAgICBzaXplRG9tYWluLFxuICAgICAgc2l6ZUZpZWxkLFxuICAgICAgdmlzQ29uZmlnXG4gICAgfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgY29uc3Qge2NvbG9yUmFuZ2UsIHNpemVSYW5nZX0gPSB2aXNDb25maWc7XG4gICAgY29uc3Qge2FsbERhdGEsIGdwdUZpbHRlcn0gPSBkYXRhc2V0c1t0aGlzLmNvbmZpZy5kYXRhSWRdO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMudXBkYXRlRGF0YShkYXRhc2V0cywgb2xkTGF5ZXJEYXRhKTtcblxuICAgIC8vIGNvbG9yXG4gICAgY29uc3QgY1NjYWxlID1cbiAgICAgIGNvbG9yRmllbGQgJiZcbiAgICAgIHRoaXMuZ2V0VmlzQ2hhbm5lbFNjYWxlKGNvbG9yU2NhbGUsIGNvbG9yRG9tYWluLCBjb2xvclJhbmdlLmNvbG9ycy5tYXAoaGV4VG9SZ2IpKTtcbiAgICAvLyBjYWxjdWxhdGUgc3Ryb2tlIHNjYWxlIC0gaWYgc3Ryb2tlZCA9IHRydWVcbiAgICBjb25zdCBzU2NhbGUgPSBzaXplRmllbGQgJiYgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoc2l6ZVNjYWxlLCBzaXplRG9tYWluLCBzaXplUmFuZ2UpO1xuICAgIC8vIGFjY2VzcyBmZWF0dXJlIHByb3BlcnRpZXMgZnJvbSBnZW9qc29uIHN1YiBsYXllclxuICAgIGNvbnN0IGdldERhdGFGb3JHcHVGaWx0ZXIgPSBmID0+IGFsbERhdGFbZi5wcm9wZXJ0aWVzLmluZGV4XTtcbiAgICBjb25zdCBnZXRJbmRleEZvckdwdUZpbHRlciA9IGYgPT4gZi5wcm9wZXJ0aWVzLmluZGV4O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBnZXRGaWx0ZXJWYWx1ZTogZ3B1RmlsdGVyLmZpbHRlclZhbHVlQWNjZXNzb3IoZ2V0SW5kZXhGb3JHcHVGaWx0ZXIsIGdldERhdGFGb3JHcHVGaWx0ZXIpLFxuICAgICAgZ2V0UGF0aDogZCA9PiBkLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgZ2V0VGltZXN0YW1wczogZCA9PiB0aGlzLmRhdGFUb1RpbWVTdGFtcFtkLnByb3BlcnRpZXMuaW5kZXhdLFxuICAgICAgZ2V0Q29sb3I6IGQgPT5cbiAgICAgICAgY1NjYWxlXG4gICAgICAgICAgPyB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoY1NjYWxlLCBhbGxEYXRhW2QucHJvcGVydGllcy5pbmRleF0sIGNvbG9yRmllbGQpXG4gICAgICAgICAgOiBkLnByb3BlcnRpZXMuZmlsbENvbG9yIHx8IGNvbG9yLFxuICAgICAgZ2V0V2lkdGg6IGQgPT5cbiAgICAgICAgc1NjYWxlXG4gICAgICAgICAgPyB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoc1NjYWxlLCBhbGxEYXRhW2QucHJvcGVydGllcy5pbmRleF0sIHNpemVGaWVsZCwgMClcbiAgICAgICAgICA6IGQucHJvcGVydGllcy5saW5lV2lkdGggfHwgZGVmYXVsdFdpZHRoXG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZUFuaW1hdGlvbkRvbWFpbihkb21haW4pIHtcbiAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKHtcbiAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAuLi50aGlzLmNvbmZpZy5hbmltYXRpb24sXG4gICAgICAgIGRvbWFpblxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlTGF5ZXJNZXRhKGFsbERhdGEpIHtcbiAgICBjb25zdCBnZXRGZWF0dXJlID0gdGhpcy5nZXRQb3NpdGlvbkFjY2Vzc29yKCk7XG4gICAgaWYgKGdldEZlYXR1cmUgPT09IHRoaXMubWV0YS5nZXRGZWF0dXJlKSB7XG4gICAgICAvLyBUT0RPOiByZXZpc2l0IHRoaXMgYWZ0ZXIgZ3B1IGZpbHRlcmluZ1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YVRvRmVhdHVyZSA9IGdldEdlb2pzb25EYXRhTWFwcyhhbGxEYXRhLCBnZXRGZWF0dXJlKTtcblxuICAgIGNvbnN0IHtkYXRhVG9UaW1lU3RhbXAsIGFuaW1hdGlvbkRvbWFpbn0gPSBwYXJzZVRyaXBHZW9Kc29uVGltZXN0YW1wKHRoaXMuZGF0YVRvRmVhdHVyZSk7XG5cbiAgICB0aGlzLmRhdGFUb1RpbWVTdGFtcCA9IGRhdGFUb1RpbWVTdGFtcDtcbiAgICB0aGlzLnVwZGF0ZUFuaW1hdGlvbkRvbWFpbihhbmltYXRpb25Eb21haW4pO1xuXG4gICAgLy8gZ2V0IGJvdW5kcyBmcm9tIGZlYXR1cmVzXG4gICAgY29uc3QgYm91bmRzID0gZ2V0R2VvanNvbkJvdW5kcyh0aGlzLmRhdGFUb0ZlYXR1cmUpO1xuXG4gICAgLy8ga2VlcCBhIHJlY29yZCBvZiB3aGF0IHR5cGUgb2YgZ2VvbWV0cnkgdGhlIGNvbGxlY3Rpb24gaGFzXG4gICAgY29uc3QgZmVhdHVyZVR5cGVzID0gZ2V0R2VvanNvbkZlYXR1cmVUeXBlcyh0aGlzLmRhdGFUb0ZlYXR1cmUpO1xuXG4gICAgdGhpcy51cGRhdGVNZXRhKHtib3VuZHMsIGZlYXR1cmVUeXBlcywgZ2V0RmVhdHVyZX0pO1xuICB9XG5cbiAgc2V0SW5pdGlhbExheWVyQ29uZmlnKGFsbERhdGEpIHtcbiAgICB0aGlzLnVwZGF0ZUxheWVyTWV0YShhbGxEYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbmRlckxheWVyKG9wdHMpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ3B1RmlsdGVyLCBtYXBTdGF0ZSwgYW5pbWF0aW9uQ29uZmlnfSA9IG9wdHM7XG4gICAgY29uc3Qge3Zpc0NvbmZpZ30gPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCB6b29tRmFjdG9yID0gdGhpcy5nZXRab29tRmFjdG9yKG1hcFN0YXRlKTtcblxuICAgIGNvbnN0IHVwZGF0ZVRyaWdnZXJzID0ge1xuICAgICAgZ2V0Q29sb3I6IHtcbiAgICAgICAgY29sb3I6IHRoaXMuY29uZmlnLmNvbG9yLFxuICAgICAgICBjb2xvckZpZWxkOiB0aGlzLmNvbmZpZy5jb2xvckZpZWxkLFxuICAgICAgICBjb2xvclJhbmdlOiB2aXNDb25maWcuY29sb3JSYW5nZSxcbiAgICAgICAgY29sb3JTY2FsZTogdGhpcy5jb25maWcuY29sb3JTY2FsZVxuICAgICAgfSxcbiAgICAgIGdldFdpZHRoOiB7XG4gICAgICAgIHNpemVGaWVsZDogdGhpcy5jb25maWcuc2l6ZUZpZWxkLFxuICAgICAgICBzaXplUmFuZ2U6IHZpc0NvbmZpZy5zaXplUmFuZ2VcbiAgICAgIH0sXG4gICAgICBnZXRUaW1lc3RhbXBzOiB7XG4gICAgICAgIGNvbHVtbnM6IHRoaXMuY29uZmlnLmNvbHVtbnMsXG4gICAgICAgIGRvbWFpbjA6IGFuaW1hdGlvbkNvbmZpZy5kb21haW5bMF1cbiAgICAgIH0sXG4gICAgICBnZXRGaWx0ZXJWYWx1ZTogZ3B1RmlsdGVyLmZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnNcbiAgICB9O1xuICAgIGNvbnN0IGRlZmF1bHRMYXllclByb3BzID0gdGhpcy5nZXREZWZhdWx0RGVja0xheWVyUHJvcHMob3B0cyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgbmV3IERlY2tHTFRyaXBzTGF5ZXIoe1xuICAgICAgICAuLi5kZWZhdWx0TGF5ZXJQcm9wcyxcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgZ2V0VGltZXN0YW1wczogZCA9PiBkYXRhLmdldFRpbWVzdGFtcHMoZCkubWFwKHRzID0+IHRzIC0gYW5pbWF0aW9uQ29uZmlnLmRvbWFpblswXSksXG4gICAgICAgIHdpZHRoU2NhbGU6IHRoaXMuY29uZmlnLnZpc0NvbmZpZy50aGlja25lc3MgKiB6b29tRmFjdG9yICogem9vbUZhY3RvclZhbHVlLFxuICAgICAgICByb3VuZGVkOiB0cnVlLFxuICAgICAgICB3cmFwTG9uZ2l0dWRlOiBmYWxzZSxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIGRlcHRoVGVzdDogbWFwU3RhdGUuZHJhZ1JvdGF0ZSxcbiAgICAgICAgICBkZXB0aE1hc2s6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHRyYWlsTGVuZ3RoOiB2aXNDb25maWcudHJhaWxMZW5ndGggKiAxMDAwLFxuICAgICAgICBjdXJyZW50VGltZTogYW5pbWF0aW9uQ29uZmlnLmN1cnJlbnRUaW1lIC0gYW5pbWF0aW9uQ29uZmlnLmRvbWFpblswXSxcbiAgICAgICAgdXBkYXRlVHJpZ2dlcnNcbiAgICAgIH0pXG4gICAgXTtcbiAgfVxufVxuIl19