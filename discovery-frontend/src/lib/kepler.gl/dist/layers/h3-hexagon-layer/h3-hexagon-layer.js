"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.HexagonIdVisConfigs = exports.defaultCoverage = exports.defaultElevation = exports.hexIdAccessor = exports.hexIdRequiredColumns = exports.HEXAGON_ID_FIELDS = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _baseLayer = _interopRequireDefault(require("../base-layer"));

var _layers = require("@deck.gl/layers");

var _geoLayers = require("@deck.gl/geo-layers");

var _enhancedColumnLayer = _interopRequireDefault(require("../../deckgl-layers/column-layer/enhanced-column-layer"));

var _h3Utils = require("./h3-utils");

var _h3HexagonLayerIcon = _interopRequireDefault(require("./h3-hexagon-layer-icon"));

var _defaultSettings = require("../../constants/default-settings");

var _colorUtils = require("../../utils/color-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DEFAULT_LINE_SCALE_VALUE = 8;
var HEXAGON_ID_FIELDS = {
  hex_id: ['hex_id', 'hexagon_id', 'h3_id']
};
exports.HEXAGON_ID_FIELDS = HEXAGON_ID_FIELDS;
var hexIdRequiredColumns = ['hex_id'];
exports.hexIdRequiredColumns = hexIdRequiredColumns;

var hexIdAccessor = function hexIdAccessor(_ref) {
  var hex_id = _ref.hex_id;
  return function (d) {
    return d.data[hex_id.fieldIdx];
  };
};

exports.hexIdAccessor = hexIdAccessor;
var defaultElevation = 500;
exports.defaultElevation = defaultElevation;
var defaultCoverage = 1;
exports.defaultCoverage = defaultCoverage;
var HexagonIdVisConfigs = {
  opacity: 'opacity',
  colorRange: 'colorRange',
  coverage: 'coverage',
  enable3d: 'enable3d',
  sizeRange: 'elevationRange',
  coverageRange: 'coverageRange',
  elevationScale: 'elevationScale'
};
exports.HexagonIdVisConfigs = HexagonIdVisConfigs;

var HexagonIdLayer = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(HexagonIdLayer, _Layer);

  var _super = _createSuper(HexagonIdLayer);

  function HexagonIdLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HexagonIdLayer);
    _this = _super.call(this, props);

    _this.registerVisConfig(HexagonIdVisConfigs);

    _this.getPositionAccessor = function () {
      return hexIdAccessor(_this.config.columns);
    };

    return _this;
  }

  (0, _createClass2["default"])(HexagonIdLayer, [{
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(HexagonIdLayer.prototype), "getDefaultLayerConfig", this).call(this, props)), {}, {
        // add height visual channel
        coverageField: null,
        coverageDomain: [0, 1],
        coverageScale: 'linear'
      });
    }
  }, {
    key: "calculateDataAttribute",
    value: function calculateDataAttribute(_ref2, getHexId) {
      var allData = _ref2.allData,
          filteredIndex = _ref2.filteredIndex;
      var data = [];

      for (var i = 0; i < filteredIndex.length; i++) {
        var index = filteredIndex[i];
        var id = getHexId({
          data: allData[index]
        });
        var centroid = this.dataToFeature.centroids[index];

        if (centroid) {
          data.push({
            // keep a reference to the original data index
            index: index,
            data: allData[index],
            id: id,
            centroid: centroid
          });
        }
      }

      return data;
    } // TODO: fix complexity

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
          sizeField = _this$config.sizeField,
          sizeScale = _this$config.sizeScale,
          sizeDomain = _this$config.sizeDomain,
          coverageField = _this$config.coverageField,
          coverageScale = _this$config.coverageScale,
          coverageDomain = _this$config.coverageDomain,
          _this$config$visConfi = _this$config.visConfig,
          sizeRange = _this$config$visConfi.sizeRange,
          colorRange = _this$config$visConfi.colorRange,
          coverageRange = _this$config$visConfi.coverageRange,
          enable3d = _this$config$visConfi.enable3d;
      var gpuFilter = datasets[this.config.dataId].gpuFilter;
      var getHexId = this.getPositionAccessor();

      var _this$updateData = this.updateData(datasets, oldLayerData),
          data = _this$updateData.data; // color


      var cScale = colorField && this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(function (c) {
        return (0, _colorUtils.hexToRgb)(c);
      })); // height

      var sScale = sizeField && enable3d && this.getVisChannelScale(sizeScale, sizeDomain, sizeRange, 0); // coverage

      var coScale = coverageField && this.getVisChannelScale(coverageScale, coverageDomain, coverageRange, 0);
      var getElevation = sScale ? function (d) {
        return _this2.getEncodedChannelValue(sScale, d.data, sizeField, 0);
      } : defaultElevation;
      var getFillColor = cScale ? function (d) {
        return _this2.getEncodedChannelValue(cScale, d.data, colorField);
      } : color;
      var getCoverage = coScale ? function (d) {
        return _this2.getEncodedChannelValue(coScale, d.data, coverageField, 0);
      } : defaultCoverage;
      return {
        data: data,
        getElevation: getElevation,
        getFillColor: getFillColor,
        getHexId: getHexId,
        getCoverage: getCoverage,
        getFilterValue: gpuFilter.filterValueAccessor()
      };
    }
    /* eslint-enable complexity */

  }, {
    key: "updateLayerMeta",
    value: function updateLayerMeta(allData, getHexId) {
      var centroids = allData.map(function (d, index) {
        var id = getHexId({
          data: d
        });

        if (!(0, _h3Utils.h3IsValid)(id)) {
          return null;
        } // save a reference of centroids to dataToFeature
        // so we don't have to re calculate it again


        return (0, _h3Utils.getCentroid)({
          id: id
        });
      });
      var bounds = this.getPointsBounds(centroids);
      this.dataToFeature = {
        centroids: centroids
      };
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
          mapState = opts.mapState;
      var zoomFactor = this.getZoomFactor(mapState);
      var eleZoomFactor = this.getElevationZoomFactor(mapState);
      var config = this.config;
      var visConfig = config.visConfig;
      var h3HexagonLayerTriggers = {
        getFillColor: {
          color: config.color,
          colorField: config.colorField,
          colorRange: visConfig.colorRange,
          colorScale: config.colorScale
        },
        getElevation: {
          sizeField: config.sizeField,
          sizeRange: visConfig.sizeRange,
          sizeScale: config.sizeScale,
          enable3d: visConfig.enable3d
        },
        getFilterValue: gpuFilter.filterValueUpdateTriggers
      };
      var columnLayerTriggers = {
        getCoverage: {
          coverageField: config.coverageField,
          coverageRange: visConfig.coverageRange
        }
      };
      var defaultLayerProps = this.getDefaultDeckLayerProps(opts);
      return [new _geoLayers.H3HexagonLayer(_objectSpread(_objectSpread(_objectSpread({}, defaultLayerProps), data), {}, {
        wrapLongitude: false,
        getHexagon: function getHexagon(x) {
          return x.id;
        },
        // coverage
        coverage: config.coverageField ? 1 : visConfig.coverage,
        // highlight
        autoHighlight: visConfig.enable3d,
        highlightColor: _defaultSettings.HIGHLIGH_COLOR_3D,
        // elevation
        extruded: visConfig.enable3d,
        elevationScale: visConfig.elevationScale * eleZoomFactor,
        // render
        updateTriggers: h3HexagonLayerTriggers,
        _subLayerProps: {
          'hexagon-cell': {
            type: _enhancedColumnLayer["default"],
            getCoverage: data.getCoverage,
            updateTriggers: columnLayerTriggers
          }
        }
      }))].concat((0, _toConsumableArray2["default"])(this.isLayerHovered(objectHovered) && !config.sizeField ? [new _layers.GeoJsonLayer(_objectSpread(_objectSpread({}, this.getDefaultHoverLayerProps()), {}, {
        data: [(0, _h3Utils.idToPolygonGeo)(objectHovered)],
        getLineColor: config.highlightColor,
        lineWidthScale: DEFAULT_LINE_SCALE_VALUE * zoomFactor,
        wrapLongitude: false
      }))] : []));
    }
  }, {
    key: "type",
    get: function get() {
      return 'hexagonId';
    }
  }, {
    key: "name",
    get: function get() {
      return 'H3';
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return hexIdRequiredColumns;
    }
  }, {
    key: "layerIcon",
    get: function get() {
      // use hexagon layer icon for now
      return _h3HexagonLayerIcon["default"];
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(HexagonIdLayer.prototype), "visualChannels", this)), {}, {
        size: _objectSpread(_objectSpread({}, (0, _get2["default"])((0, _getPrototypeOf2["default"])(HexagonIdLayer.prototype), "visualChannels", this).size), {}, {
          property: 'height'
        }),
        coverage: {
          property: 'coverage',
          field: 'coverageField',
          scale: 'coverageScale',
          domain: 'coverageDomain',
          range: 'coverageRange',
          key: 'coverage',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.radius
        }
      });
    }
  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(_ref3) {
      var _ref3$fields = _ref3.fields,
          fields = _ref3$fields === void 0 ? [] : _ref3$fields,
          _ref3$allData = _ref3.allData,
          allData = _ref3$allData === void 0 ? [] : _ref3$allData;
      var foundColumns = this.findDefaultColumnField(HEXAGON_ID_FIELDS, fields);
      var hexFields = (0, _h3Utils.getHexFields)(fields, allData);

      if ((!foundColumns || !foundColumns.length) && !hexFields.length) {
        return {
          props: []
        };
      }

      return {
        props: (foundColumns || []).map(function (columns) {
          return {
            isVisible: true,
            label: 'H3 Hexagon',
            columns: columns
          };
        }).concat((hexFields || []).map(function (f) {
          return {
            isVisible: true,
            label: f.name,
            columns: {
              hex_id: {
                value: f.name,
                fieldIdx: fields.findIndex(function (fid) {
                  return fid.name === f.name;
                })
              }
            }
          };
        }))
      };
    }
  }]);
  return HexagonIdLayer;
}(_baseLayer["default"]);

exports["default"] = HexagonIdLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaDMtaGV4YWdvbi1sYXllci9oMy1oZXhhZ29uLWxheWVyLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfTElORV9TQ0FMRV9WQUxVRSIsIkhFWEFHT05fSURfRklFTERTIiwiaGV4X2lkIiwiaGV4SWRSZXF1aXJlZENvbHVtbnMiLCJoZXhJZEFjY2Vzc29yIiwiZCIsImRhdGEiLCJmaWVsZElkeCIsImRlZmF1bHRFbGV2YXRpb24iLCJkZWZhdWx0Q292ZXJhZ2UiLCJIZXhhZ29uSWRWaXNDb25maWdzIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJjb3ZlcmFnZSIsImVuYWJsZTNkIiwic2l6ZVJhbmdlIiwiY292ZXJhZ2VSYW5nZSIsImVsZXZhdGlvblNjYWxlIiwiSGV4YWdvbklkTGF5ZXIiLCJwcm9wcyIsInJlZ2lzdGVyVmlzQ29uZmlnIiwiZ2V0UG9zaXRpb25BY2Nlc3NvciIsImNvbmZpZyIsImNvbHVtbnMiLCJjb3ZlcmFnZUZpZWxkIiwiY292ZXJhZ2VEb21haW4iLCJjb3ZlcmFnZVNjYWxlIiwiZ2V0SGV4SWQiLCJhbGxEYXRhIiwiZmlsdGVyZWRJbmRleCIsImkiLCJsZW5ndGgiLCJpbmRleCIsImlkIiwiY2VudHJvaWQiLCJkYXRhVG9GZWF0dXJlIiwiY2VudHJvaWRzIiwicHVzaCIsImRhdGFzZXRzIiwib2xkTGF5ZXJEYXRhIiwib3B0IiwiY29sb3JTY2FsZSIsImNvbG9yRG9tYWluIiwiY29sb3JGaWVsZCIsImNvbG9yIiwic2l6ZUZpZWxkIiwic2l6ZVNjYWxlIiwic2l6ZURvbWFpbiIsInZpc0NvbmZpZyIsImdwdUZpbHRlciIsImRhdGFJZCIsInVwZGF0ZURhdGEiLCJjU2NhbGUiLCJnZXRWaXNDaGFubmVsU2NhbGUiLCJjb2xvcnMiLCJtYXAiLCJjIiwic1NjYWxlIiwiY29TY2FsZSIsImdldEVsZXZhdGlvbiIsImdldEVuY29kZWRDaGFubmVsVmFsdWUiLCJnZXRGaWxsQ29sb3IiLCJnZXRDb3ZlcmFnZSIsImdldEZpbHRlclZhbHVlIiwiZmlsdGVyVmFsdWVBY2Nlc3NvciIsImJvdW5kcyIsImdldFBvaW50c0JvdW5kcyIsInVwZGF0ZU1ldGEiLCJvcHRzIiwib2JqZWN0SG92ZXJlZCIsIm1hcFN0YXRlIiwiem9vbUZhY3RvciIsImdldFpvb21GYWN0b3IiLCJlbGVab29tRmFjdG9yIiwiZ2V0RWxldmF0aW9uWm9vbUZhY3RvciIsImgzSGV4YWdvbkxheWVyVHJpZ2dlcnMiLCJmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzIiwiY29sdW1uTGF5ZXJUcmlnZ2VycyIsImRlZmF1bHRMYXllclByb3BzIiwiZ2V0RGVmYXVsdERlY2tMYXllclByb3BzIiwiSDNIZXhhZ29uTGF5ZXIiLCJ3cmFwTG9uZ2l0dWRlIiwiZ2V0SGV4YWdvbiIsIngiLCJhdXRvSGlnaGxpZ2h0IiwiaGlnaGxpZ2h0Q29sb3IiLCJISUdITElHSF9DT0xPUl8zRCIsImV4dHJ1ZGVkIiwidXBkYXRlVHJpZ2dlcnMiLCJfc3ViTGF5ZXJQcm9wcyIsInR5cGUiLCJFbmhhbmNlZENvbHVtbkxheWVyIiwiaXNMYXllckhvdmVyZWQiLCJHZW9Kc29uTGF5ZXIiLCJnZXREZWZhdWx0SG92ZXJMYXllclByb3BzIiwiZ2V0TGluZUNvbG9yIiwibGluZVdpZHRoU2NhbGUiLCJIM0hleGFnb25MYXllckljb24iLCJzaXplIiwicHJvcGVydHkiLCJmaWVsZCIsInNjYWxlIiwiZG9tYWluIiwicmFuZ2UiLCJrZXkiLCJjaGFubmVsU2NhbGVUeXBlIiwiQ0hBTk5FTF9TQ0FMRVMiLCJyYWRpdXMiLCJmaWVsZHMiLCJmb3VuZENvbHVtbnMiLCJmaW5kRGVmYXVsdENvbHVtbkZpZWxkIiwiaGV4RmllbGRzIiwiaXNWaXNpYmxlIiwibGFiZWwiLCJjb25jYXQiLCJmIiwibmFtZSIsInZhbHVlIiwiZmluZEluZGV4IiwiZmlkIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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QSxLQUFLLEVBQUVGLENBQUMsQ0FBQ0MsSUFESDtBQUVON0csZ0JBQUFBLFFBQVEsRUFBRXFHLE1BQU0sQ0FBQ1UsU0FBUCxDQUFpQixVQUFBQyxHQUFHO0FBQUEseUJBQUlBLEdBQUcsQ0FBQ0gsSUFBSixLQUFhRCxDQUFDLENBQUNDLElBQW5CO0FBQUEsaUJBQXBCO0FBRko7QUFERDtBQUhpQixXQUFMO0FBQUEsU0FBdkIsQ0FQRztBQURGLE9BQVA7QUFvQkQ7OztFQXRFeUNJLHFCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IHtHZW9Kc29uTGF5ZXJ9IGZyb20gJ0BkZWNrLmdsL2xheWVycyc7XG5pbXBvcnQge0gzSGV4YWdvbkxheWVyfSBmcm9tICdAZGVjay5nbC9nZW8tbGF5ZXJzJztcbmltcG9ydCBFbmhhbmNlZENvbHVtbkxheWVyIGZyb20gJ2RlY2tnbC1sYXllcnMvY29sdW1uLWxheWVyL2VuaGFuY2VkLWNvbHVtbi1sYXllcic7XG5pbXBvcnQge2dldENlbnRyb2lkLCBpZFRvUG9seWdvbkdlbywgaDNJc1ZhbGlkLCBnZXRIZXhGaWVsZHN9IGZyb20gJy4vaDMtdXRpbHMnO1xuaW1wb3J0IEgzSGV4YWdvbkxheWVySWNvbiBmcm9tICcuL2gzLWhleGFnb24tbGF5ZXItaWNvbic7XG5pbXBvcnQge0NIQU5ORUxfU0NBTEVTLCBISUdITElHSF9DT0xPUl8zRH0gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuaW1wb3J0IHtoZXhUb1JnYn0gZnJvbSAndXRpbHMvY29sb3ItdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0xJTkVfU0NBTEVfVkFMVUUgPSA4O1xuXG5leHBvcnQgY29uc3QgSEVYQUdPTl9JRF9GSUVMRFMgPSB7XG4gIGhleF9pZDogWydoZXhfaWQnLCAnaGV4YWdvbl9pZCcsICdoM19pZCddXG59O1xuXG5leHBvcnQgY29uc3QgaGV4SWRSZXF1aXJlZENvbHVtbnMgPSBbJ2hleF9pZCddO1xuZXhwb3J0IGNvbnN0IGhleElkQWNjZXNzb3IgPSAoe2hleF9pZH0pID0+IGQgPT4gZC5kYXRhW2hleF9pZC5maWVsZElkeF07XG5leHBvcnQgY29uc3QgZGVmYXVsdEVsZXZhdGlvbiA9IDUwMDtcbmV4cG9ydCBjb25zdCBkZWZhdWx0Q292ZXJhZ2UgPSAxO1xuXG5leHBvcnQgY29uc3QgSGV4YWdvbklkVmlzQ29uZmlncyA9IHtcbiAgb3BhY2l0eTogJ29wYWNpdHknLFxuICBjb2xvclJhbmdlOiAnY29sb3JSYW5nZScsXG4gIGNvdmVyYWdlOiAnY292ZXJhZ2UnLFxuICBlbmFibGUzZDogJ2VuYWJsZTNkJyxcbiAgc2l6ZVJhbmdlOiAnZWxldmF0aW9uUmFuZ2UnLFxuICBjb3ZlcmFnZVJhbmdlOiAnY292ZXJhZ2VSYW5nZScsXG4gIGVsZXZhdGlvblNjYWxlOiAnZWxldmF0aW9uU2NhbGUnXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uSWRMYXllciBleHRlbmRzIExheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5yZWdpc3RlclZpc0NvbmZpZyhIZXhhZ29uSWRWaXNDb25maWdzKTtcbiAgICB0aGlzLmdldFBvc2l0aW9uQWNjZXNzb3IgPSAoKSA9PiBoZXhJZEFjY2Vzc29yKHRoaXMuY29uZmlnLmNvbHVtbnMpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICdoZXhhZ29uSWQnO1xuICB9XG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuICdIMyc7XG4gIH1cblxuICBnZXQgcmVxdWlyZWRMYXllckNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIGhleElkUmVxdWlyZWRDb2x1bW5zO1xuICB9XG5cbiAgZ2V0IGxheWVySWNvbigpIHtcbiAgICAvLyB1c2UgaGV4YWdvbiBsYXllciBpY29uIGZvciBub3dcbiAgICByZXR1cm4gSDNIZXhhZ29uTGF5ZXJJY29uO1xuICB9XG5cbiAgZ2V0IHZpc3VhbENoYW5uZWxzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci52aXN1YWxDaGFubmVscyxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgLi4uc3VwZXIudmlzdWFsQ2hhbm5lbHMuc2l6ZSxcbiAgICAgICAgcHJvcGVydHk6ICdoZWlnaHQnXG4gICAgICB9LFxuICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgcHJvcGVydHk6ICdjb3ZlcmFnZScsXG4gICAgICAgIGZpZWxkOiAnY292ZXJhZ2VGaWVsZCcsXG4gICAgICAgIHNjYWxlOiAnY292ZXJhZ2VTY2FsZScsXG4gICAgICAgIGRvbWFpbjogJ2NvdmVyYWdlRG9tYWluJyxcbiAgICAgICAgcmFuZ2U6ICdjb3ZlcmFnZVJhbmdlJyxcbiAgICAgICAga2V5OiAnY292ZXJhZ2UnLFxuICAgICAgICBjaGFubmVsU2NhbGVUeXBlOiBDSEFOTkVMX1NDQUxFUy5yYWRpdXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZpbmREZWZhdWx0TGF5ZXJQcm9wcyh7ZmllbGRzID0gW10sIGFsbERhdGEgPSBbXX0pIHtcbiAgICBjb25zdCBmb3VuZENvbHVtbnMgPSB0aGlzLmZpbmREZWZhdWx0Q29sdW1uRmllbGQoSEVYQUdPTl9JRF9GSUVMRFMsIGZpZWxkcyk7XG4gICAgY29uc3QgaGV4RmllbGRzID0gZ2V0SGV4RmllbGRzKGZpZWxkcywgYWxsRGF0YSk7XG4gICAgaWYgKCghZm91bmRDb2x1bW5zIHx8ICFmb3VuZENvbHVtbnMubGVuZ3RoKSAmJiAhaGV4RmllbGRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtwcm9wczogW119O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwcm9wczogKGZvdW5kQ29sdW1ucyB8fCBbXSlcbiAgICAgICAgLm1hcChjb2x1bW5zID0+ICh7XG4gICAgICAgICAgaXNWaXNpYmxlOiB0cnVlLFxuICAgICAgICAgIGxhYmVsOiAnSDMgSGV4YWdvbicsXG4gICAgICAgICAgY29sdW1uc1xuICAgICAgICB9KSlcbiAgICAgICAgLmNvbmNhdChcbiAgICAgICAgICAoaGV4RmllbGRzIHx8IFtdKS5tYXAoZiA9PiAoe1xuICAgICAgICAgICAgaXNWaXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IGYubmFtZSxcbiAgICAgICAgICAgIGNvbHVtbnM6IHtcbiAgICAgICAgICAgICAgaGV4X2lkOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGYubmFtZSxcbiAgICAgICAgICAgICAgICBmaWVsZElkeDogZmllbGRzLmZpbmRJbmRleChmaWQgPT4gZmlkLm5hbWUgPT09IGYubmFtZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKVxuICAgICAgICApXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHRMYXllckNvbmZpZyhwcm9wcyA9IHt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLmdldERlZmF1bHRMYXllckNvbmZpZyhwcm9wcyksXG5cbiAgICAgIC8vIGFkZCBoZWlnaHQgdmlzdWFsIGNoYW5uZWxcbiAgICAgIGNvdmVyYWdlRmllbGQ6IG51bGwsXG4gICAgICBjb3ZlcmFnZURvbWFpbjogWzAsIDFdLFxuICAgICAgY292ZXJhZ2VTY2FsZTogJ2xpbmVhcidcbiAgICB9O1xuICB9XG5cbiAgY2FsY3VsYXRlRGF0YUF0dHJpYnV0ZSh7YWxsRGF0YSwgZmlsdGVyZWRJbmRleH0sIGdldEhleElkKSB7XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZEluZGV4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGZpbHRlcmVkSW5kZXhbaV07XG4gICAgICBjb25zdCBpZCA9IGdldEhleElkKHtkYXRhOiBhbGxEYXRhW2luZGV4XX0pO1xuICAgICAgY29uc3QgY2VudHJvaWQgPSB0aGlzLmRhdGFUb0ZlYXR1cmUuY2VudHJvaWRzW2luZGV4XTtcblxuICAgICAgaWYgKGNlbnRyb2lkKSB7XG4gICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgZGF0YSBpbmRleFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICAgIGRhdGE6IGFsbERhdGFbaW5kZXhdLFxuICAgICAgICAgIGlkLFxuICAgICAgICAgIGNlbnRyb2lkXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8vIFRPRE86IGZpeCBjb21wbGV4aXR5XG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgZm9ybWF0TGF5ZXJEYXRhKGRhdGFzZXRzLCBvbGRMYXllckRhdGEsIG9wdCA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgY29sb3JTY2FsZSxcbiAgICAgIGNvbG9yRG9tYWluLFxuICAgICAgY29sb3JGaWVsZCxcbiAgICAgIGNvbG9yLFxuICAgICAgc2l6ZUZpZWxkLFxuICAgICAgc2l6ZVNjYWxlLFxuICAgICAgc2l6ZURvbWFpbixcbiAgICAgIGNvdmVyYWdlRmllbGQsXG4gICAgICBjb3ZlcmFnZVNjYWxlLFxuICAgICAgY292ZXJhZ2VEb21haW4sXG4gICAgICB2aXNDb25maWc6IHtzaXplUmFuZ2UsIGNvbG9yUmFuZ2UsIGNvdmVyYWdlUmFuZ2UsIGVuYWJsZTNkfVxuICAgIH0gPSB0aGlzLmNvbmZpZztcblxuICAgIGNvbnN0IHtncHVGaWx0ZXJ9ID0gZGF0YXNldHNbdGhpcy5jb25maWcuZGF0YUlkXTtcbiAgICBjb25zdCBnZXRIZXhJZCA9IHRoaXMuZ2V0UG9zaXRpb25BY2Nlc3NvcigpO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMudXBkYXRlRGF0YShkYXRhc2V0cywgb2xkTGF5ZXJEYXRhKTtcbiAgICAvLyBjb2xvclxuICAgIGNvbnN0IGNTY2FsZSA9XG4gICAgICBjb2xvckZpZWxkICYmXG4gICAgICB0aGlzLmdldFZpc0NoYW5uZWxTY2FsZShcbiAgICAgICAgY29sb3JTY2FsZSxcbiAgICAgICAgY29sb3JEb21haW4sXG4gICAgICAgIGNvbG9yUmFuZ2UuY29sb3JzLm1hcChjID0+IGhleFRvUmdiKGMpKVxuICAgICAgKTtcblxuICAgIC8vIGhlaWdodFxuICAgIGNvbnN0IHNTY2FsZSA9XG4gICAgICBzaXplRmllbGQgJiYgZW5hYmxlM2QgJiYgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoc2l6ZVNjYWxlLCBzaXplRG9tYWluLCBzaXplUmFuZ2UsIDApO1xuXG4gICAgLy8gY292ZXJhZ2VcbiAgICBjb25zdCBjb1NjYWxlID1cbiAgICAgIGNvdmVyYWdlRmllbGQgJiYgdGhpcy5nZXRWaXNDaGFubmVsU2NhbGUoY292ZXJhZ2VTY2FsZSwgY292ZXJhZ2VEb21haW4sIGNvdmVyYWdlUmFuZ2UsIDApO1xuXG4gICAgY29uc3QgZ2V0RWxldmF0aW9uID0gc1NjYWxlXG4gICAgICA/IGQgPT4gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKHNTY2FsZSwgZC5kYXRhLCBzaXplRmllbGQsIDApXG4gICAgICA6IGRlZmF1bHRFbGV2YXRpb247XG5cbiAgICBjb25zdCBnZXRGaWxsQ29sb3IgPSBjU2NhbGVcbiAgICAgID8gZCA9PiB0aGlzLmdldEVuY29kZWRDaGFubmVsVmFsdWUoY1NjYWxlLCBkLmRhdGEsIGNvbG9yRmllbGQpXG4gICAgICA6IGNvbG9yO1xuXG4gICAgY29uc3QgZ2V0Q292ZXJhZ2UgPSBjb1NjYWxlXG4gICAgICA/IGQgPT4gdGhpcy5nZXRFbmNvZGVkQ2hhbm5lbFZhbHVlKGNvU2NhbGUsIGQuZGF0YSwgY292ZXJhZ2VGaWVsZCwgMClcbiAgICAgIDogZGVmYXVsdENvdmVyYWdlO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBnZXRFbGV2YXRpb24sXG4gICAgICBnZXRGaWxsQ29sb3IsXG4gICAgICBnZXRIZXhJZCxcbiAgICAgIGdldENvdmVyYWdlLFxuICAgICAgZ2V0RmlsdGVyVmFsdWU6IGdwdUZpbHRlci5maWx0ZXJWYWx1ZUFjY2Vzc29yKClcbiAgICB9O1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY29tcGxleGl0eSAqL1xuXG4gIHVwZGF0ZUxheWVyTWV0YShhbGxEYXRhLCBnZXRIZXhJZCkge1xuICAgIGNvbnN0IGNlbnRyb2lkcyA9IGFsbERhdGEubWFwKChkLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgaWQgPSBnZXRIZXhJZCh7ZGF0YTogZH0pO1xuICAgICAgaWYgKCFoM0lzVmFsaWQoaWQpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgLy8gc2F2ZSBhIHJlZmVyZW5jZSBvZiBjZW50cm9pZHMgdG8gZGF0YVRvRmVhdHVyZVxuICAgICAgLy8gc28gd2UgZG9uJ3QgaGF2ZSB0byByZSBjYWxjdWxhdGUgaXQgYWdhaW5cbiAgICAgIHJldHVybiBnZXRDZW50cm9pZCh7aWR9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuZ2V0UG9pbnRzQm91bmRzKGNlbnRyb2lkcyk7XG4gICAgdGhpcy5kYXRhVG9GZWF0dXJlID0ge2NlbnRyb2lkc307XG4gICAgdGhpcy51cGRhdGVNZXRhKHtib3VuZHN9KTtcbiAgfVxuXG4gIHJlbmRlckxheWVyKG9wdHMpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ3B1RmlsdGVyLCBvYmplY3RIb3ZlcmVkLCBtYXBTdGF0ZX0gPSBvcHRzO1xuXG4gICAgY29uc3Qgem9vbUZhY3RvciA9IHRoaXMuZ2V0Wm9vbUZhY3RvcihtYXBTdGF0ZSk7XG4gICAgY29uc3QgZWxlWm9vbUZhY3RvciA9IHRoaXMuZ2V0RWxldmF0aW9uWm9vbUZhY3RvcihtYXBTdGF0ZSk7XG4gICAgY29uc3Qge2NvbmZpZ30gPSB0aGlzO1xuICAgIGNvbnN0IHt2aXNDb25maWd9ID0gY29uZmlnO1xuXG4gICAgY29uc3QgaDNIZXhhZ29uTGF5ZXJUcmlnZ2VycyA9IHtcbiAgICAgIGdldEZpbGxDb2xvcjoge1xuICAgICAgICBjb2xvcjogY29uZmlnLmNvbG9yLFxuICAgICAgICBjb2xvckZpZWxkOiBjb25maWcuY29sb3JGaWVsZCxcbiAgICAgICAgY29sb3JSYW5nZTogdmlzQ29uZmlnLmNvbG9yUmFuZ2UsXG4gICAgICAgIGNvbG9yU2NhbGU6IGNvbmZpZy5jb2xvclNjYWxlXG4gICAgICB9LFxuICAgICAgZ2V0RWxldmF0aW9uOiB7XG4gICAgICAgIHNpemVGaWVsZDogY29uZmlnLnNpemVGaWVsZCxcbiAgICAgICAgc2l6ZVJhbmdlOiB2aXNDb25maWcuc2l6ZVJhbmdlLFxuICAgICAgICBzaXplU2NhbGU6IGNvbmZpZy5zaXplU2NhbGUsXG4gICAgICAgIGVuYWJsZTNkOiB2aXNDb25maWcuZW5hYmxlM2RcbiAgICAgIH0sXG4gICAgICBnZXRGaWx0ZXJWYWx1ZTogZ3B1RmlsdGVyLmZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnNcbiAgICB9O1xuXG4gICAgY29uc3QgY29sdW1uTGF5ZXJUcmlnZ2VycyA9IHtcbiAgICAgIGdldENvdmVyYWdlOiB7XG4gICAgICAgIGNvdmVyYWdlRmllbGQ6IGNvbmZpZy5jb3ZlcmFnZUZpZWxkLFxuICAgICAgICBjb3ZlcmFnZVJhbmdlOiB2aXNDb25maWcuY292ZXJhZ2VSYW5nZVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBkZWZhdWx0TGF5ZXJQcm9wcyA9IHRoaXMuZ2V0RGVmYXVsdERlY2tMYXllclByb3BzKG9wdHMpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBIM0hleGFnb25MYXllcih7XG4gICAgICAgIC4uLmRlZmF1bHRMYXllclByb3BzLFxuICAgICAgICAuLi5kYXRhLFxuICAgICAgICB3cmFwTG9uZ2l0dWRlOiBmYWxzZSxcblxuICAgICAgICBnZXRIZXhhZ29uOiB4ID0+IHguaWQsXG5cbiAgICAgICAgLy8gY292ZXJhZ2VcbiAgICAgICAgY292ZXJhZ2U6IGNvbmZpZy5jb3ZlcmFnZUZpZWxkID8gMSA6IHZpc0NvbmZpZy5jb3ZlcmFnZSxcblxuICAgICAgICAvLyBoaWdobGlnaHRcbiAgICAgICAgYXV0b0hpZ2hsaWdodDogdmlzQ29uZmlnLmVuYWJsZTNkLFxuICAgICAgICBoaWdobGlnaHRDb2xvcjogSElHSExJR0hfQ09MT1JfM0QsXG5cbiAgICAgICAgLy8gZWxldmF0aW9uXG4gICAgICAgIGV4dHJ1ZGVkOiB2aXNDb25maWcuZW5hYmxlM2QsXG4gICAgICAgIGVsZXZhdGlvblNjYWxlOiB2aXNDb25maWcuZWxldmF0aW9uU2NhbGUgKiBlbGVab29tRmFjdG9yLFxuXG4gICAgICAgIC8vIHJlbmRlclxuICAgICAgICB1cGRhdGVUcmlnZ2VyczogaDNIZXhhZ29uTGF5ZXJUcmlnZ2VycyxcbiAgICAgICAgX3N1YkxheWVyUHJvcHM6IHtcbiAgICAgICAgICAnaGV4YWdvbi1jZWxsJzoge1xuICAgICAgICAgICAgdHlwZTogRW5oYW5jZWRDb2x1bW5MYXllcixcbiAgICAgICAgICAgIGdldENvdmVyYWdlOiBkYXRhLmdldENvdmVyYWdlLFxuICAgICAgICAgICAgdXBkYXRlVHJpZ2dlcnM6IGNvbHVtbkxheWVyVHJpZ2dlcnNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgLi4uKHRoaXMuaXNMYXllckhvdmVyZWQob2JqZWN0SG92ZXJlZCkgJiYgIWNvbmZpZy5zaXplRmllbGRcbiAgICAgICAgPyBbXG4gICAgICAgICAgICBuZXcgR2VvSnNvbkxheWVyKHtcbiAgICAgICAgICAgICAgLi4udGhpcy5nZXREZWZhdWx0SG92ZXJMYXllclByb3BzKCksXG4gICAgICAgICAgICAgIGRhdGE6IFtpZFRvUG9seWdvbkdlbyhvYmplY3RIb3ZlcmVkKV0sXG4gICAgICAgICAgICAgIGdldExpbmVDb2xvcjogY29uZmlnLmhpZ2hsaWdodENvbG9yLFxuICAgICAgICAgICAgICBsaW5lV2lkdGhTY2FsZTogREVGQVVMVF9MSU5FX1NDQUxFX1ZBTFVFICogem9vbUZhY3RvcixcbiAgICAgICAgICAgICAgd3JhcExvbmdpdHVkZTogZmFsc2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKVxuICAgIF07XG4gIH1cbn1cbiJdfQ==