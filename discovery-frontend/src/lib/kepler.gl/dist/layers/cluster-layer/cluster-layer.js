"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.clusterVisConfigs = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _aggregationLayer = _interopRequireDefault(require("../aggregation-layer"));

var _layers = require("@deck.gl/layers");

var _clusterLayer = _interopRequireDefault(require("../../deckgl-layers/cluster-layer/cluster-layer"));

var _defaultSettings = require("../../constants/default-settings");

var _clusterLayerIcon = _interopRequireDefault(require("./cluster-layer-icon"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var clusterVisConfigs = {
  opacity: 'opacity',
  clusterRadius: 'clusterRadius',
  colorRange: 'colorRange',
  radiusRange: 'clusterRadiusRange',
  colorAggregation: 'aggregation'
};
exports.clusterVisConfigs = clusterVisConfigs;

var ClusterLayer = /*#__PURE__*/function (_AggregationLayer) {
  (0, _inherits2["default"])(ClusterLayer, _AggregationLayer);

  var _super = _createSuper(ClusterLayer);

  function ClusterLayer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, ClusterLayer);
    _this = _super.call(this, props);

    _this.registerVisConfig(clusterVisConfigs);

    return _this;
  }

  (0, _createClass2["default"])(ClusterLayer, [{
    key: "renderLayer",
    value: function renderLayer(opts) {
      var visConfig = this.config.visConfig;
      var data = opts.data,
          gpuFilter = opts.gpuFilter,
          objectHovered = opts.objectHovered,
          mapState = opts.mapState,
          layerCallbacks = opts.layerCallbacks;
      var updateTriggers = {
        getColorValue: {
          colorField: this.config.colorField,
          colorAggregation: this.config.visConfig.colorAggregation
        },
        filterData: _objectSpread({
          filterRange: gpuFilter.filterRange
        }, gpuFilter.filterValueUpdateTriggers)
      };
      var filterData = data._filterData,
          clusterData = (0, _objectWithoutProperties2["default"])(data, ["_filterData"]);
      return [new _clusterLayer["default"](_objectSpread(_objectSpread(_objectSpread({}, this.getDefaultDeckLayerProps(opts)), clusterData), {}, {
        filterData: filterData,
        // radius
        radiusScale: 1,
        radiusRange: visConfig.radiusRange,
        clusterRadius: visConfig.clusterRadius,
        // color
        colorRange: this.getColorRange(visConfig.colorRange),
        colorScaleType: this.config.colorScale,
        colorAggregation: visConfig.colorAggregation,
        zoom: Math.round(mapState.zoom),
        width: mapState.width,
        height: mapState.height,
        // updateTriggers
        updateTriggers: updateTriggers,
        // call back from layer after calculate clusters
        onSetColorDomain: layerCallbacks.onSetLayerDomain
      }))].concat((0, _toConsumableArray2["default"])(this.isLayerHovered(objectHovered) ? [new _layers.ScatterplotLayer({
        id: "".concat(this.id, "-hovered"),
        data: [objectHovered.object],
        getFillColor: this.config.highlightColor,
        getRadius: function getRadius(d) {
          return d.radius;
        },
        radiusScale: 1,
        pickable: false
      })] : []));
    }
  }, {
    key: "type",
    get: function get() {
      return 'cluster';
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _clusterLayerIcon["default"];
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return {
        color: {
          aggregation: 'colorAggregation',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.colorAggr,
          defaultMeasure: 'property.pointCount',
          domain: 'colorDomain',
          field: 'colorField',
          key: 'color',
          property: 'color',
          range: 'colorRange',
          scale: 'colorScale'
        }
      };
    }
  }]);
  return ClusterLayer;
}(_aggregationLayer["default"]);

exports["default"] = ClusterLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2x1c3Rlci1sYXllci9jbHVzdGVyLWxheWVyLmpzIl0sIm5hbWVzIjpbImNsdXN0ZXJWaXNDb25maWdzIiwib3BhY2l0eSIsImNsdXN0ZXJSYWRpdXMiLCJjb2xvclJhbmdlIiwicmFkaXVzUmFuZ2UiLCJjb2xvckFnZ3JlZ2F0aW9uIiwiQ2x1c3RlckxheWVyIiwicHJvcHMiLCJyZWdpc3RlclZpc0NvbmZpZyIsIm9wdHMiLCJ2aXNDb25maWciLCJjb25maWciLCJkYXRhIiwiZ3B1RmlsdGVyIiwib2JqZWN0SG92ZXJlZCIsIm1hcFN0YXRlIiwibGF5ZXJDYWxsYmFja3MiLCJ1cGRhdGVUcmlnZ2VycyIsImdldENvbG9yVmFsdWUiLCJjb2xvckZpZWxkIiwiZmlsdGVyRGF0YSIsImZpbHRlclJhbmdlIiwiZmlsdGVyVmFsdWVVcGRhdGVUcmlnZ2VycyIsIl9maWx0ZXJEYXRhIiwiY2x1c3RlckRhdGEiLCJEZWNrR0xDbHVzdGVyTGF5ZXIiLCJnZXREZWZhdWx0RGVja0xheWVyUHJvcHMiLCJyYWRpdXNTY2FsZSIsImdldENvbG9yUmFuZ2UiLCJjb2xvclNjYWxlVHlwZSIsImNvbG9yU2NhbGUiLCJ6b29tIiwiTWF0aCIsInJvdW5kIiwid2lkdGgiLCJoZWlnaHQiLCJvblNldENvbG9yRG9tYWluIiwib25TZXRMYXllckRvbWFpbiIsImlzTGF5ZXJIb3ZlcmVkIiwiU2NhdHRlcnBsb3RMYXllciIsImlkIiwib2JqZWN0IiwiZ2V0RmlsbENvbG9yIiwiaGlnaGxpZ2h0Q29sb3IiLCJnZXRSYWRpdXMiLCJkIiwicmFkaXVzIiwicGlja2FibGUiLCJDbHVzdGVyTGF5ZXJJY29uIiwiY29sb3IiLCJhZ2dyZWdhdGlvbiIsImNoYW5uZWxTY2FsZVR5cGUiLCJDSEFOTkVMX1NDQUxFUyIsImNvbG9yQWdnciIsImRlZmF1bHRNZWFzdXJlIiwiZG9tYWluIiwiZmllbGQiLCJrZXkiLCJwcm9wZXJ0eSIsInJhbmdlIiwic2NhbGUi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QkMsUUFBQUEsU0FBUyxFQUFFLG1CQUFBQyxDQUFDO0FBQUEsaUJBQUlBLENBQUMsQ0FBQ0MsTUFBTjtBQUFBLFNBSk87QUFLbkJuQixRQUFBQSxXQUFXLEVBQUUsQ0FMTTtBQU1uQm9CLFFBQUFBLFFBQVEsRUFBRTtBQU5TLE9BQXJCLENBREYsQ0FEQSxHQVdBLEVBdENOO0FBd0NEOzs7d0JBaEZVO0FBQ1QsYUFBTyxTQUFQO0FBQ0Q7Ozt3QkFFZTtBQUNkLGFBQU9DLDRCQUFQO0FBQ0Q7Ozt3QkFFb0I7QUFDbkIsYUFBTztBQUNMQyxRQUFBQSxLQUFLLEVBQUU7QUFDTEMsVUFBQUEsV0FBVyxFQUFFLGtCQURSO0FBRUxDLFVBQUFBLGdCQUFnQixFQUFFQyxnQ0FBZUMsU0FGNUI7QUFHTEMsVUFBQUEsY0FBYyxFQUFFLHFCQUhYO0FBSUxDLFVBQUFBLE1BQU0sRUFBRSxhQUpIO0FBS0xDLFVBQUFBLEtBQUssRUFBRSxZQUxGO0FBTUxDLFVBQUFBLEdBQUcsRUFBRSxPQU5BO0FBT0xDLFVBQUFBLFFBQVEsRUFBRSxPQVBMO0FBUUxDLFVBQUFBLEtBQUssRUFBRSxZQVJGO0FBU0xDLFVBQUFBLEtBQUssRUFBRTtBQVRGO0FBREYsT0FBUDtBQWFEOzs7RUE1QnVDQyw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBBZ2dyZWdhdGlvbkxheWVyIGZyb20gJy4uL2FnZ3JlZ2F0aW9uLWxheWVyJztcbmltcG9ydCB7U2NhdHRlcnBsb3RMYXllcn0gZnJvbSAnQGRlY2suZ2wvbGF5ZXJzJztcblxuaW1wb3J0IERlY2tHTENsdXN0ZXJMYXllciBmcm9tICdkZWNrZ2wtbGF5ZXJzL2NsdXN0ZXItbGF5ZXIvY2x1c3Rlci1sYXllcic7XG5pbXBvcnQge0NIQU5ORUxfU0NBTEVTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQgQ2x1c3RlckxheWVySWNvbiBmcm9tICcuL2NsdXN0ZXItbGF5ZXItaWNvbic7XG5cbmV4cG9ydCBjb25zdCBjbHVzdGVyVmlzQ29uZmlncyA9IHtcbiAgb3BhY2l0eTogJ29wYWNpdHknLFxuICBjbHVzdGVyUmFkaXVzOiAnY2x1c3RlclJhZGl1cycsXG4gIGNvbG9yUmFuZ2U6ICdjb2xvclJhbmdlJyxcbiAgcmFkaXVzUmFuZ2U6ICdjbHVzdGVyUmFkaXVzUmFuZ2UnLFxuICBjb2xvckFnZ3JlZ2F0aW9uOiAnYWdncmVnYXRpb24nXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbHVzdGVyTGF5ZXIgZXh0ZW5kcyBBZ2dyZWdhdGlvbkxheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5yZWdpc3RlclZpc0NvbmZpZyhjbHVzdGVyVmlzQ29uZmlncyk7XG4gIH1cblxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gJ2NsdXN0ZXInO1xuICB9XG5cbiAgZ2V0IGxheWVySWNvbigpIHtcbiAgICByZXR1cm4gQ2x1c3RlckxheWVySWNvbjtcbiAgfVxuXG4gIGdldCB2aXN1YWxDaGFubmVscygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IHtcbiAgICAgICAgYWdncmVnYXRpb246ICdjb2xvckFnZ3JlZ2F0aW9uJyxcbiAgICAgICAgY2hhbm5lbFNjYWxlVHlwZTogQ0hBTk5FTF9TQ0FMRVMuY29sb3JBZ2dyLFxuICAgICAgICBkZWZhdWx0TWVhc3VyZTogJ3Byb3BlcnR5LnBvaW50Q291bnQnLFxuICAgICAgICBkb21haW46ICdjb2xvckRvbWFpbicsXG4gICAgICAgIGZpZWxkOiAnY29sb3JGaWVsZCcsXG4gICAgICAgIGtleTogJ2NvbG9yJyxcbiAgICAgICAgcHJvcGVydHk6ICdjb2xvcicsXG4gICAgICAgIHJhbmdlOiAnY29sb3JSYW5nZScsXG4gICAgICAgIHNjYWxlOiAnY29sb3JTY2FsZSdcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyTGF5ZXIob3B0cykge1xuICAgIGNvbnN0IHt2aXNDb25maWd9ID0gdGhpcy5jb25maWc7XG4gICAgY29uc3Qge2RhdGEsIGdwdUZpbHRlciwgb2JqZWN0SG92ZXJlZCwgbWFwU3RhdGUsIGxheWVyQ2FsbGJhY2tzfSA9IG9wdHM7XG5cbiAgICBjb25zdCB1cGRhdGVUcmlnZ2VycyA9IHtcbiAgICAgIGdldENvbG9yVmFsdWU6IHtcbiAgICAgICAgY29sb3JGaWVsZDogdGhpcy5jb25maWcuY29sb3JGaWVsZCxcbiAgICAgICAgY29sb3JBZ2dyZWdhdGlvbjogdGhpcy5jb25maWcudmlzQ29uZmlnLmNvbG9yQWdncmVnYXRpb25cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJEYXRhOiB7XG4gICAgICAgIGZpbHRlclJhbmdlOiBncHVGaWx0ZXIuZmlsdGVyUmFuZ2UsXG4gICAgICAgIC4uLmdwdUZpbHRlci5maWx0ZXJWYWx1ZVVwZGF0ZVRyaWdnZXJzXG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB7X2ZpbHRlckRhdGE6IGZpbHRlckRhdGEsIC4uLmNsdXN0ZXJEYXRhfSA9IGRhdGE7XG5cbiAgICByZXR1cm4gW1xuICAgICAgbmV3IERlY2tHTENsdXN0ZXJMYXllcih7XG4gICAgICAgIC4uLnRoaXMuZ2V0RGVmYXVsdERlY2tMYXllclByb3BzKG9wdHMpLFxuICAgICAgICAuLi5jbHVzdGVyRGF0YSxcbiAgICAgICAgZmlsdGVyRGF0YSxcblxuICAgICAgICAvLyByYWRpdXNcbiAgICAgICAgcmFkaXVzU2NhbGU6IDEsXG4gICAgICAgIHJhZGl1c1JhbmdlOiB2aXNDb25maWcucmFkaXVzUmFuZ2UsXG4gICAgICAgIGNsdXN0ZXJSYWRpdXM6IHZpc0NvbmZpZy5jbHVzdGVyUmFkaXVzLFxuXG4gICAgICAgIC8vIGNvbG9yXG4gICAgICAgIGNvbG9yUmFuZ2U6IHRoaXMuZ2V0Q29sb3JSYW5nZSh2aXNDb25maWcuY29sb3JSYW5nZSksXG4gICAgICAgIGNvbG9yU2NhbGVUeXBlOiB0aGlzLmNvbmZpZy5jb2xvclNjYWxlLFxuICAgICAgICBjb2xvckFnZ3JlZ2F0aW9uOiB2aXNDb25maWcuY29sb3JBZ2dyZWdhdGlvbixcblxuICAgICAgICB6b29tOiBNYXRoLnJvdW5kKG1hcFN0YXRlLnpvb20pLFxuICAgICAgICB3aWR0aDogbWFwU3RhdGUud2lkdGgsXG4gICAgICAgIGhlaWdodDogbWFwU3RhdGUuaGVpZ2h0LFxuXG4gICAgICAgIC8vIHVwZGF0ZVRyaWdnZXJzXG4gICAgICAgIHVwZGF0ZVRyaWdnZXJzLFxuXG4gICAgICAgIC8vIGNhbGwgYmFjayBmcm9tIGxheWVyIGFmdGVyIGNhbGN1bGF0ZSBjbHVzdGVyc1xuICAgICAgICBvblNldENvbG9yRG9tYWluOiBsYXllckNhbGxiYWNrcy5vblNldExheWVyRG9tYWluXG4gICAgICB9KSxcbiAgICAgIC8vIGhvdmVyIGxheWVyXG4gICAgICAuLi4odGhpcy5pc0xheWVySG92ZXJlZChvYmplY3RIb3ZlcmVkKVxuICAgICAgICA/IFtcbiAgICAgICAgICAgIG5ldyBTY2F0dGVycGxvdExheWVyKHtcbiAgICAgICAgICAgICAgaWQ6IGAke3RoaXMuaWR9LWhvdmVyZWRgLFxuICAgICAgICAgICAgICBkYXRhOiBbb2JqZWN0SG92ZXJlZC5vYmplY3RdLFxuICAgICAgICAgICAgICBnZXRGaWxsQ29sb3I6IHRoaXMuY29uZmlnLmhpZ2hsaWdodENvbG9yLFxuICAgICAgICAgICAgICBnZXRSYWRpdXM6IGQgPT4gZC5yYWRpdXMsXG4gICAgICAgICAgICAgIHJhZGl1c1NjYWxlOiAxLFxuICAgICAgICAgICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKVxuICAgIF07XG4gIH1cbn1cbiJdfQ==