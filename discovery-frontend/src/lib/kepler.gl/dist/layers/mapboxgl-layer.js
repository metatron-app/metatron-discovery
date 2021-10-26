"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.pointColResolver = exports.mapboxRequiredColumns = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _baseLayer = _interopRequireWildcard(require("./base-layer"));

var _reselect = require("reselect");

var _mapboxUtils = require("./mapbox-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var mapboxRequiredColumns = ['lat', 'lng'];
exports.mapboxRequiredColumns = mapboxRequiredColumns;

var pointColResolver = function pointColResolver(_ref) {
  var lat = _ref.lat,
      lng = _ref.lng;
  return "".concat(lat.fieldIdx, "-").concat(lng.fieldIdx);
};

exports.pointColResolver = pointColResolver;

var MapboxLayerGL = /*#__PURE__*/function (_Layer) {
  (0, _inherits2["default"])(MapboxLayerGL, _Layer);

  var _super = _createSuper(MapboxLayerGL);

  function MapboxLayerGL() {
    var _this;

    (0, _classCallCheck2["default"])(this, MapboxLayerGL);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "datasetSelector", function (config) {
      return config.dataId;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "gpuFilterSelector", function (config, datasets) {
      return (datasets[config.dataId] || {}).gpuFilter;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "columnsSelector", function (config) {
      return pointColResolver(config.columns);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "sourceSelector", (0, _reselect.createSelector)(_this.datasetSelector, _this.columnsSelector, function (datasetId, columns) {
      return "".concat(datasetId, "-").concat(columns);
    }));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filterSelector", (0, _reselect.createSelector)(_this.gpuFilterSelector, function (gpuFilter) {
      return (0, _mapboxUtils.gpuFilterToMapboxFilter)(gpuFilter);
    }));
    return _this;
  }

  (0, _createClass2["default"])(MapboxLayerGL, [{
    key: "isValidFilter",
    value: function isValidFilter(filter) {
      // mapbox will crash if filter is not an array or empty
      return Array.isArray(filter) && filter.length;
    }
  }, {
    key: "getDataUpdateTriggers",
    value: function getDataUpdateTriggers(_ref2) {
      var _this2 = this;

      var filteredIndex = _ref2.filteredIndex,
          gpuFilter = _ref2.gpuFilter,
          id = _ref2.id;
      var columns = this.config.columns;
      var visualChannelFields = Object.values(this.visualChannels).reduce(function (accu, v) {
        return _objectSpread(_objectSpread({}, accu), _this2.config[v.field] ? (0, _defineProperty2["default"])({}, v.field, _this2.config[v.field].name) : {});
      }, {});
      var updateTriggers = {
        getData: _objectSpread(_objectSpread({
          datasetId: id,
          columns: columns,
          filteredIndex: filteredIndex
        }, visualChannelFields), gpuFilter.filterValueUpdateTriggers),
        getMeta: {
          datasetId: id,
          columns: columns
        }
      };
      return updateTriggers;
    }
  }, {
    key: "calculateDataAttribute",
    value: function calculateDataAttribute(_ref4, getPosition) {
      var _this3 = this;

      var allData = _ref4.allData,
          filteredIndex = _ref4.filteredIndex,
          gpuFilter = _ref4.gpuFilter;

      var getGeometry = function getGeometry(d) {
        return _this3.getGeometry(getPosition(d));
      };

      var vcFields = Object.values(this.visualChannels).map(function (v) {
        return _this3.config[v.field];
      }).filter(function (v) {
        return v;
      });
      var getPropertyFromVisualChanel = vcFields.length ? function (d) {
        return vcFields.reduce(function (accu, field) {
          return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, field.name, d[field.tableFieldIndex - 1]));
        }, {});
      } : function (d) {
        return {};
      };
      var filterValueUpdateTriggers = gpuFilter.filterValueUpdateTriggers,
          filterValueAccessor = gpuFilter.filterValueAccessor; // gpuField To property

      var hasFilter = Object.values(filterValueUpdateTriggers).filter(function (d) {
        return d;
      }).length;
      var valueAccessor = filterValueAccessor();
      var getPropertyFromFilter = hasFilter ? function (d, index) {
        var filterValue = valueAccessor({
          data: d,
          index: index
        });
        return Object.values(filterValueUpdateTriggers).reduce(function (accu, name, i) {
          return _objectSpread(_objectSpread({}, accu), name ? (0, _defineProperty2["default"])({}, (0, _mapboxUtils.prefixGpuField)(name), filterValue[i]) : {});
        }, {});
      } : function (d) {
        return {};
      };

      var getProperties = function getProperties(d, i) {
        return _objectSpread(_objectSpread({}, getPropertyFromVisualChanel(d)), getPropertyFromFilter(d, i));
      };

      return (0, _mapboxUtils.geoJsonFromData)(allData, filteredIndex, getGeometry, getProperties);
    } // this layer is rendered at mapbox level
    // todo: maybe need to find a better solution for this one

  }, {
    key: "shouldRenderLayer",
    value: function shouldRenderLayer() {
      return this.type && this.config.isVisible && this.hasAllColumns();
    }
  }, {
    key: "overlayType",
    get: function get() {
      return _baseLayer.OVERLAY_TYPE.mapboxgl;
    }
  }, {
    key: "type",
    get: function get() {
      return null;
    }
  }, {
    key: "isAggregated",
    get: function get() {
      return true;
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return mapboxRequiredColumns;
    }
  }, {
    key: "columnPairs",
    get: function get() {
      return this.defaultPointColumnPairs;
    }
  }, {
    key: "noneLayerDataAffectingProps",
    get: function get() {
      return [];
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return {};
    }
  }]);
  return MapboxLayerGL;
}(_baseLayer["default"]);

var _default = MapboxLayerGL;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbWFwYm94Z2wtbGF5ZXIuanMiXSwibmFtZXMiOlsibWFwYm94UmVxdWlyZWRDb2x1bW5zIiwicG9pbnRDb2xSZXNvbHZlciIsImxhdCIsImxuZyIsImZpZWxkSWR4IiwiTWFwYm94TGF5ZXJHTCIsImNvbmZpZyIsImRhdGFJZCIsImRhdGFzZXRzIiwiZ3B1RmlsdGVyIiwiY29sdW1ucyIsImRhdGFzZXRTZWxlY3RvciIsImNvbHVtbnNTZWxlY3RvciIsImRhdGFzZXRJZCIsImdwdUZpbHRlclNlbGVjdG9yIiwiZmlsdGVyIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiZmlsdGVyZWRJbmRleCIsImlkIiwidmlzdWFsQ2hhbm5lbEZpZWxkcyIsIk9iamVjdCIsInZhbHVlcyIsInZpc3VhbENoYW5uZWxzIiwicmVkdWNlIiwiYWNjdSIsInYiLCJmaWVsZCIsIm5hbWUiLCJ1cGRhdGVUcmlnZ2VycyIsImdldERhdGEiLCJmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzIiwiZ2V0TWV0YSIsImdldFBvc2l0aW9uIiwiYWxsRGF0YSIsImdldEdlb21ldHJ5IiwiZCIsInZjRmllbGRzIiwibWFwIiwiZ2V0UHJvcGVydHlGcm9tVmlzdWFsQ2hhbmVsIiwidGFibGVGaWVsZEluZGV4IiwiZmlsdGVyVmFsdWVBY2Nlc3NvciIsImhhc0ZpbHRlciIsInZhbHVlQWNjZXNzb3IiLCJnZXRQcm9wZXJ0eUZyb21GaWx0ZXIiLCJpbmRleCIsImZpbHRlclZhbHVlIiwiZGF0YSIsImkiLCJnZXRQcm9wZXJ0aWVzIiwidHlwZSIsImlzVmlzaWJsZSIsImhhc0FsbENvbHVtbnMiLCJPVkVSTEFZX1RZUEUiLCJtYXBib3hnbCIsImRlZmF1bHRQb2ludENvbHVtblBhaXJzIiwiTGF5ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUFFTyxJQUFNQSxxQkFBcUIsR0FBRyxD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QSxpREFDS3ZCLElBREwsR0FFTUcsSUFBSSx3Q0FBSyxpQ0FBZUEsSUFBZixDQUFMLEVBQTRCa0IsV0FBVyxDQUFDRSxDQUFELENBQXZDLElBQThDLEVBRnhEO0FBQUEsU0FESyxFQUtMLEVBTEssQ0FBUDtBQU9ELE9BVmtDLEdBV25DLFVBQUFaLENBQUM7QUFBQSxlQUFLLEVBQUw7QUFBQSxPQVhMOztBQWFBLFVBQU1hLGFBQWEsR0FBRyxTQUFoQkEsYUFBZ0IsQ0FBQ2IsQ0FBRCxFQUFJWSxDQUFKO0FBQUEsK0NBQ2pCVCwyQkFBMkIsQ0FBQ0gsQ0FBRCxDQURWLEdBRWpCUSxxQkFBcUIsQ0FBQ1IsQ0FBRCxFQUFJWSxDQUFKLENBRko7QUFBQSxPQUF0Qjs7QUFLQSxhQUFPLGtDQUFnQmQsT0FBaEIsRUFBeUJoQixhQUF6QixFQUF3Q2lCLFdBQXhDLEVBQXFEYyxhQUFyRCxDQUFQO0FBQ0QsSyxDQUVEO0FBQ0E7Ozs7d0NBQ29CO0FBQ2xCLGFBQU8sS0FBS0MsSUFBTCxJQUFhLEtBQUs3QyxNQUFMLENBQVk4QyxTQUF6QixJQUFzQyxLQUFLQyxhQUFMLEVBQTdDO0FBQ0Q7Ozt3QkF4SGlCO0FBQ2hCLGFBQU9DLHdCQUFhQyxRQUFwQjtBQUNEOzs7d0JBRVU7QUFDVCxhQUFPLElBQVA7QUFDRDs7O3dCQUVrQjtBQUNqQixhQUFPLElBQVA7QUFDRDs7O3dCQUUwQjtBQUN6QixhQUFPdkQscUJBQVA7QUFDRDs7O3dCQUVpQjtBQUNoQixhQUFPLEtBQUt3RCx1QkFBWjtBQUNEOzs7d0JBRWlDO0FBQ2hDLGFBQU8sRUFBUDtBQUNEOzs7d0JBRW9CO0FBQ25CLGFBQU8sRUFBUDtBQUNEOzs7RUEzQnlCQyxxQjs7ZUE0SGJwRCxhIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyLCB7T1ZFUkxBWV9UWVBFfSBmcm9tICcuL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuXG5pbXBvcnQge2dlb0pzb25Gcm9tRGF0YSwgcHJlZml4R3B1RmllbGQsIGdwdUZpbHRlclRvTWFwYm94RmlsdGVyfSBmcm9tICcuL21hcGJveC11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBtYXBib3hSZXF1aXJlZENvbHVtbnMgPSBbJ2xhdCcsICdsbmcnXTtcblxuZXhwb3J0IGNvbnN0IHBvaW50Q29sUmVzb2x2ZXIgPSAoe2xhdCwgbG5nfSkgPT4gYCR7bGF0LmZpZWxkSWR4fS0ke2xuZy5maWVsZElkeH1gO1xuXG5jbGFzcyBNYXBib3hMYXllckdMIGV4dGVuZHMgTGF5ZXIge1xuICBnZXQgb3ZlcmxheVR5cGUoKSB7XG4gICAgcmV0dXJuIE9WRVJMQVlfVFlQRS5tYXBib3hnbDtcbiAgfVxuXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0IGlzQWdncmVnYXRlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldCByZXF1aXJlZExheWVyQ29sdW1ucygpIHtcbiAgICByZXR1cm4gbWFwYm94UmVxdWlyZWRDb2x1bW5zO1xuICB9XG5cbiAgZ2V0IGNvbHVtblBhaXJzKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmF1bHRQb2ludENvbHVtblBhaXJzO1xuICB9XG5cbiAgZ2V0IG5vbmVMYXllckRhdGFBZmZlY3RpbmdQcm9wcygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXQgdmlzdWFsQ2hhbm5lbHMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIGRhdGFzZXRTZWxlY3RvciA9IGNvbmZpZyA9PiBjb25maWcuZGF0YUlkO1xuICBncHVGaWx0ZXJTZWxlY3RvciA9IChjb25maWcsIGRhdGFzZXRzKSA9PiAoZGF0YXNldHNbY29uZmlnLmRhdGFJZF0gfHwge30pLmdwdUZpbHRlcjtcbiAgY29sdW1uc1NlbGVjdG9yID0gY29uZmlnID0+IHBvaW50Q29sUmVzb2x2ZXIoY29uZmlnLmNvbHVtbnMpO1xuXG4gIHNvdXJjZVNlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgdGhpcy5kYXRhc2V0U2VsZWN0b3IsXG4gICAgdGhpcy5jb2x1bW5zU2VsZWN0b3IsXG4gICAgKGRhdGFzZXRJZCwgY29sdW1ucykgPT4gYCR7ZGF0YXNldElkfS0ke2NvbHVtbnN9YFxuICApO1xuXG4gIGZpbHRlclNlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IodGhpcy5ncHVGaWx0ZXJTZWxlY3RvciwgZ3B1RmlsdGVyID0+XG4gICAgZ3B1RmlsdGVyVG9NYXBib3hGaWx0ZXIoZ3B1RmlsdGVyKVxuICApO1xuXG4gIGlzVmFsaWRGaWx0ZXIoZmlsdGVyKSB7XG4gICAgLy8gbWFwYm94IHdpbGwgY3Jhc2ggaWYgZmlsdGVyIGlzIG5vdCBhbiBhcnJheSBvciBlbXB0eVxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGZpbHRlcikgJiYgZmlsdGVyLmxlbmd0aDtcbiAgfVxuXG4gIGdldERhdGFVcGRhdGVUcmlnZ2Vycyh7ZmlsdGVyZWRJbmRleCwgZ3B1RmlsdGVyLCBpZH0pIHtcbiAgICBjb25zdCB7Y29sdW1uc30gPSB0aGlzLmNvbmZpZztcblxuICAgIGNvbnN0IHZpc3VhbENoYW5uZWxGaWVsZHMgPSBPYmplY3QudmFsdWVzKHRoaXMudmlzdWFsQ2hhbm5lbHMpLnJlZHVjZShcbiAgICAgIChhY2N1LCB2KSA9PiAoe1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICAuLi4odGhpcy5jb25maWdbdi5maWVsZF0gPyB7W3YuZmllbGRdOiB0aGlzLmNvbmZpZ1t2LmZpZWxkXS5uYW1lfSA6IHt9KVxuICAgICAgfSksXG4gICAgICB7fVxuICAgICk7XG5cbiAgICBjb25zdCB1cGRhdGVUcmlnZ2VycyA9IHtcbiAgICAgIGdldERhdGE6IHtcbiAgICAgICAgZGF0YXNldElkOiBpZCxcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgZmlsdGVyZWRJbmRleCxcbiAgICAgICAgLi4udmlzdWFsQ2hhbm5lbEZpZWxkcyxcbiAgICAgICAgLi4uZ3B1RmlsdGVyLmZpbHRlclZhbHVlVXBkYXRlVHJpZ2dlcnNcbiAgICAgIH0sXG4gICAgICBnZXRNZXRhOiB7ZGF0YXNldElkOiBpZCwgY29sdW1uc31cbiAgICB9O1xuXG4gICAgcmV0dXJuIHVwZGF0ZVRyaWdnZXJzO1xuICB9XG5cbiAgY2FsY3VsYXRlRGF0YUF0dHJpYnV0ZSh7YWxsRGF0YSwgZmlsdGVyZWRJbmRleCwgZ3B1RmlsdGVyfSwgZ2V0UG9zaXRpb24pIHtcbiAgICBjb25zdCBnZXRHZW9tZXRyeSA9IGQgPT4gdGhpcy5nZXRHZW9tZXRyeShnZXRQb3NpdGlvbihkKSk7XG5cbiAgICBjb25zdCB2Y0ZpZWxkcyA9IE9iamVjdC52YWx1ZXModGhpcy52aXN1YWxDaGFubmVscylcbiAgICAgIC5tYXAodiA9PiB0aGlzLmNvbmZpZ1t2LmZpZWxkXSlcbiAgICAgIC5maWx0ZXIodiA9PiB2KTtcblxuICAgIGNvbnN0IGdldFByb3BlcnR5RnJvbVZpc3VhbENoYW5lbCA9IHZjRmllbGRzLmxlbmd0aFxuICAgICAgPyBkID0+XG4gICAgICAgICAgdmNGaWVsZHMucmVkdWNlKFxuICAgICAgICAgICAgKGFjY3UsIGZpZWxkKSA9PiAoe1xuICAgICAgICAgICAgICAuLi5hY2N1LFxuICAgICAgICAgICAgICBbZmllbGQubmFtZV06IGRbZmllbGQudGFibGVGaWVsZEluZGV4IC0gMV1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAge31cbiAgICAgICAgICApXG4gICAgICA6IGQgPT4gKHt9KTtcblxuICAgIGNvbnN0IHtmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzLCBmaWx0ZXJWYWx1ZUFjY2Vzc29yfSA9IGdwdUZpbHRlcjtcblxuICAgIC8vIGdwdUZpZWxkIFRvIHByb3BlcnR5XG4gICAgY29uc3QgaGFzRmlsdGVyID0gT2JqZWN0LnZhbHVlcyhmaWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzKS5maWx0ZXIoZCA9PiBkKS5sZW5ndGg7XG4gICAgY29uc3QgdmFsdWVBY2Nlc3NvciA9IGZpbHRlclZhbHVlQWNjZXNzb3IoKTtcblxuICAgIGNvbnN0IGdldFByb3BlcnR5RnJvbUZpbHRlciA9IGhhc0ZpbHRlclxuICAgICAgPyAoZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJWYWx1ZSA9IHZhbHVlQWNjZXNzb3Ioe2RhdGE6IGQsIGluZGV4fSk7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoZmlsdGVyVmFsdWVVcGRhdGVUcmlnZ2VycykucmVkdWNlKFxuICAgICAgICAgICAgKGFjY3UsIG5hbWUsIGkpID0+ICh7XG4gICAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICAgIC4uLihuYW1lID8ge1twcmVmaXhHcHVGaWVsZChuYW1lKV06IGZpbHRlclZhbHVlW2ldfSA6IHt9KVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB7fVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIDogZCA9PiAoe30pO1xuXG4gICAgY29uc3QgZ2V0UHJvcGVydGllcyA9IChkLCBpKSA9PiAoe1xuICAgICAgLi4uZ2V0UHJvcGVydHlGcm9tVmlzdWFsQ2hhbmVsKGQpLFxuICAgICAgLi4uZ2V0UHJvcGVydHlGcm9tRmlsdGVyKGQsIGkpXG4gICAgfSk7XG5cbiAgICByZXR1cm4gZ2VvSnNvbkZyb21EYXRhKGFsbERhdGEsIGZpbHRlcmVkSW5kZXgsIGdldEdlb21ldHJ5LCBnZXRQcm9wZXJ0aWVzKTtcbiAgfVxuXG4gIC8vIHRoaXMgbGF5ZXIgaXMgcmVuZGVyZWQgYXQgbWFwYm94IGxldmVsXG4gIC8vIHRvZG86IG1heWJlIG5lZWQgdG8gZmluZCBhIGJldHRlciBzb2x1dGlvbiBmb3IgdGhpcyBvbmVcbiAgc2hvdWxkUmVuZGVyTGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSAmJiB0aGlzLmNvbmZpZy5pc1Zpc2libGUgJiYgdGhpcy5oYXNBbGxDb2x1bW5zKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwYm94TGF5ZXJHTDtcbiJdfQ==