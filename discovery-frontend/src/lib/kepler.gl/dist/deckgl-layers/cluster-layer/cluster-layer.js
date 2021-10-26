"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.clusterAggregation = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _layers = require("@deck.gl/layers");

var _aggregationLayers = require("@deck.gl/aggregation-layers");

var _geoViewport = _interopRequireDefault(require("@mapbox/geo-viewport"));

var _cpuAggregator = _interopRequireWildcard(require("../layer-utils/cpu-aggregator"));

var _viewportMercatorProject = require("viewport-mercator-project");

var _d3Array = require("d3-array");

var _colorRanges = require("../../constants/color-ranges");

var _layerFactory = require("../../layers/layer-factory");

var _defaultSettings = require("../../constants/default-settings");

var _clusterUtils = _interopRequireWildcard(require("../layer-utils/cluster-utils"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var defaultRadius = _layerFactory.LAYER_VIS_CONFIGS.clusterRadius.defaultValue;
var defaultRadiusRange = _layerFactory.LAYER_VIS_CONFIGS.clusterRadiusRange.defaultValue;

var defaultGetColorValue = function defaultGetColorValue(points) {
  return points.length;
};

var defaultGetRadiusValue = function defaultGetRadiusValue(cell) {
  return cell.filteredPoints ? cell.filteredPoints.length : cell.points.length;
};

function processGeoJSON(step, props, aggregation, _ref) {
  var viewport = _ref.viewport;
  var data = props.data,
      getPosition = props.getPosition,
      filterData = props.filterData;
  var geoJSON = (0, _clusterUtils.getGeoJSON)(data, getPosition, filterData);
  var clusterBuilder = new _clusterUtils["default"]();
  this.setState({
    geoJSON: geoJSON,
    clusterBuilder: clusterBuilder
  });
}

function getClusters(step, props, aggregation, _ref2) {
  var viewport = _ref2.viewport;
  var _this$state = this.state,
      geoJSON = _this$state.geoJSON,
      clusterBuilder = _this$state.clusterBuilder;
  var clusterRadius = props.clusterRadius,
      zoom = props.zoom,
      width = props.width,
      height = props.height;
  var longitude = viewport.longitude,
      latitude = viewport.latitude; // zoom needs to be an integer for the different map utils. Also helps with cache key.

  var bbox = _geoViewport["default"].bounds([longitude, latitude], zoom, [width, height]);

  var clusters = clusterBuilder.clustersAtZoom({
    bbox: bbox,
    clusterRadius: clusterRadius,
    geoJSON: geoJSON,
    zoom: zoom
  });
  this.setState({
    layerData: {
      data: clusters
    }
  });
}

function getSubLayerRadius(dimensionState, dimension, layerProps) {
  return function (cell) {
    var getRadiusValue = layerProps.getRadiusValue;
    var scaleFunc = dimensionState.scaleFunc;
    return scaleFunc(getRadiusValue(cell));
  };
}

var clusterAggregation = {
  key: 'position',
  updateSteps: [{
    key: 'geojson',
    triggers: {
      position: {
        prop: 'getPosition',
        updateTrigger: 'getPosition'
      },
      filterData: {
        prop: 'filterData',
        updateTrigger: 'filterData'
      }
    },
    updater: processGeoJSON
  }, {
    key: 'clustering',
    triggers: {
      clusterRadius: {
        prop: 'clusterRadius'
      },
      zoom: {
        prop: 'zoom'
      },
      width: {
        prop: 'width'
      },
      height: {
        prop: 'height'
      }
    },
    updater: getClusters
  }]
};
exports.clusterAggregation = clusterAggregation;

function getRadiusValueDomain(step, props, dimensionUpdater) {
  var key = dimensionUpdater.key;
  var getRadiusValue = props.getRadiusValue;
  var layerData = this.state.layerData;
  var valueDomain = [0, (0, _d3Array.max)(layerData.data, getRadiusValue)];

  this._setDimensionState(key, {
    valueDomain: valueDomain
  });
}

var clusterLayerDimensions = [_cpuAggregator.defaultColorDimension, {
  key: 'radius',
  accessor: 'getRadius',
  nullValue: 0,
  updateSteps: [{
    key: 'getDomain',
    triggers: {
      value: {
        prop: 'getRadiusValue',
        updateTrigger: 'getRadiusValue'
      }
    },
    updater: getRadiusValueDomain
  }, {
    key: 'getScaleFunc',
    triggers: {
      domain: {
        prop: 'radiusDomain'
      },
      range: {
        prop: 'radiusRange'
      },
      scaleType: {
        prop: 'radiusScaleType'
      }
    },
    updater: _cpuAggregator.getDimensionScale
  }],
  getSubLayerAccessor: getSubLayerRadius,
  getPickingInfo: function getPickingInfo(dimensionState, cell, layerProps) {
    var radiusValue = layerProps.getRadiusValue(cell);
    return {
      radiusValue: radiusValue
    };
  }
}];
var defaultProps = {
  clusterRadius: defaultRadius,
  colorDomain: null,
  colorRange: _colorRanges.DefaultColorRange,
  colorScaleType: _defaultSettings.SCALE_TYPES.quantize,
  radiusScaleType: _defaultSettings.SCALE_TYPES.sqrt,
  radiusRange: defaultRadiusRange,
  getPosition: {
    type: 'accessor',
    value: function value(x) {
      return x.position;
    }
  },
  getColorValue: {
    type: 'accessor',
    value: defaultGetColorValue
  },
  getRadiusValue: {
    type: 'accessor',
    value: defaultGetRadiusValue
  }
};

var ClusterLayer = /*#__PURE__*/function (_AggregationLayer) {
  (0, _inherits2["default"])(ClusterLayer, _AggregationLayer);

  var _super = _createSuper(ClusterLayer);

  function ClusterLayer() {
    (0, _classCallCheck2["default"])(this, ClusterLayer);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ClusterLayer, [{
    key: "initializeState",
    value: function initializeState() {
      var cpuAggregator = new _cpuAggregator["default"]({
        aggregation: clusterAggregation,
        dimensions: clusterLayerDimensions
      });
      this.state = {
        cpuAggregator: cpuAggregator,
        aggregatorState: cpuAggregator.state
      };
      var attributeManager = this.getAttributeManager();
      attributeManager.add({
        positions: {
          size: 3,
          accessor: 'getPosition'
        }
      });
    }
  }, {
    key: "updateState",
    value: function updateState(_ref3) {
      var oldProps = _ref3.oldProps,
          props = _ref3.props,
          changeFlags = _ref3.changeFlags;
      this.setState({
        // make a copy of the internal state of cpuAggregator for testing
        aggregatorState: this.state.cpuAggregator.updateState({
          oldProps: oldProps,
          props: props,
          changeFlags: changeFlags
        }, {
          viewport: this.context.viewport,
          attributes: this.getAttributes(),
          numInstances: this.getNumInstances(props)
        })
      });
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref4) {
      var info = _ref4.info;
      return this.state.cpuAggregator.getPickingInfo({
        info: info
      }, this.props);
    }
  }, {
    key: "_getSublayerUpdateTriggers",
    value: function _getSublayerUpdateTriggers() {
      return this.state.cpuAggregator.getUpdateTriggers(this.props);
    }
  }, {
    key: "_getSubLayerAccessors",
    value: function _getSubLayerAccessors() {
      return {
        getRadius: this.state.cpuAggregator.getAccessor('radius', this.props),
        getFillColor: this.state.cpuAggregator.getAccessor('fillColor', this.props)
      };
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      // for subclassing, override this method to return
      // customized sub layer props
      var _this$props = this.props,
          id = _this$props.id,
          radiusScale = _this$props.radiusScale;
      var cpuAggregator = this.state.cpuAggregator; // base layer props

      var _this$props2 = this.props,
          opacity = _this$props2.opacity,
          pickable = _this$props2.pickable,
          autoHighlight = _this$props2.autoHighlight,
          highlightColor = _this$props2.highlightColor;

      var updateTriggers = this._getSublayerUpdateTriggers();

      var accessors = this._getSubLayerAccessors();

      var distanceScale = (0, _viewportMercatorProject.getDistanceScales)(this.context.viewport);
      var metersPerPixel = distanceScale.metersPerPixel[0]; // return props to the sublayer constructor

      return new _layers.ScatterplotLayer(_objectSpread({
        id: "".concat(id, "-cluster"),
        data: cpuAggregator.state.layerData.data,
        radiusScale: metersPerPixel * radiusScale,
        opacity: opacity,
        pickable: pickable,
        autoHighlight: autoHighlight,
        highlightColor: highlightColor,
        updateTriggers: updateTriggers
      }, accessors));
    }
  }]);
  return ClusterLayer;
}(_aggregationLayers._AggregationLayer);

exports["default"] = ClusterLayer;
ClusterLayer.layerName = 'ClusterLayer';
ClusterLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL2NsdXN0ZXItbGF5ZXIvY2x1c3Rlci1sYXllci5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0UmFkaXVzIiwiTEFZRVJfVklTX0NPTkZJR1MiLCJjbHVzdGVyUmFkaXVzIiwiZGVmYXVsdFZhbHVlIiwiZGVmYXVsdFJhZGl1c1JhbmdlIiwiY2x1c3RlclJhZGl1c1JhbmdlIiwiZGVmYXVsdEdldENvbG9yVmFsdWUiLCJwb2ludHMiLCJsZW5ndGgiLCJkZWZhdWx0R2V0UmFkaXVzVmFsdWUiLCJjZWxsIiwiZmlsdGVyZWRQb2ludHMiLCJwcm9jZXNzR2VvSlNPTiIsInN0ZXAiLCJwcm9wcyIsImFnZ3JlZ2F0aW9uIiwidmlld3BvcnQiLCJkYXRhIiwiZ2V0UG9zaXRpb24iLCJmaWx0ZXJEYXRhIiwiZ2VvSlNPTiIsImNsdXN0ZXJCdWlsZGVyIiwiQ2x1c3RlckJ1aWxkZXIiLCJzZXRTdGF0ZSIsImdldENsdXN0ZXJzIiwic3RhdGUiLCJ6b29tIiwid2lkdGgiLCJoZWlnaHQiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsImJib3giLCJnZW9WaWV3cG9ydCIsImJvdW5kcyIsImNsdXN0ZXJzIiwiY2x1c3RlcnNBdFpvb20iLCJsYXllckRhdGEiLCJnZXRTdWJMYXllclJhZGl1cyIsImRpbWVuc2lvblN0YXRlIiwiZGltZW5zaW9uIiwibGF5ZXJQcm9wcyIsImdldFJhZGl1c1ZhbHVlIiwic2NhbGVGdW5jIiwiY2x1c3RlckFnZ3JlZ2F0aW9uIiwia2V5IiwidXBkYXRlU3RlcHMiLCJ0cmlnZ2VycyIsInBvc2l0aW9uIiwicHJvcCIsInVwZGF0ZVRyaWdnZXIiLCJ1cGRhdGVyIiwiZ2V0UmFkaXVzVmFsdWVEb21haW4iLCJkaW1lbnNpb25VcGRhdGVyIiwidmFsdWVEb21haW4iLCJfc2V0RGltZW5zaW9uU3RhdGUiLCJjbHVzdGVyTGF5ZXJEaW1lbnNpb25zIiwiZGVmYXVsdENvbG9yRGltZW5zaW9uIiwiYWNjZXNzb3IiLCJudWxsVmFsdWUiLCJ2YWx1ZSIsImRvbWFpbiIsInJhbmdlIiwic2NhbGVUeXBlIiwiZ2V0RGltZW5zaW9uU2NhbGUiLCJnZXRTdWJMYXllckFjY2Vzc29yIiwiZ2V0UGlja2luZ0luZm8iLCJyYWRpdXNWYWx1ZSIsImRlZmF1bHRQcm9wcyIsImNvbG9yRG9tYWluIiwiY29sb3JSYW5nZSIsIkRlZmF1bHRDb2xvclJhbmdlIiwiY29sb3JTY2FsZVR5cGUiLCJTQ0FMRV9UWVBFUyIsInF1YW50aXplIiwicmFkaXVzU2NhbGVUeXBlIiwic3FydCIsInJhZGl1c1JhbmdlIiwidHlwZSIsIngiLCJnZXRDb2xvclZhbHVlIiwiQ2x1c3RlckxheWVyIiwiY3B1QWdncmVnYXRvciIsIkNQVUFnZ3JlZ2F0b3IiLCJkaW1lbnNpb25zIiwiYWdncmVnYXRvclN0YXRlIiwiYXR0cmlidXRlTWFuYWdlciIsImdldEF0dHJpYnV0ZU1hbmFnZXIiLCJhZGQiLCJwb3NpdGlvbnMiLCJzaXplIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsInVwZGF0ZVN0YXRlIiwiY29udGV4dCIsImF0dHJpYnV0ZXMiLCJnZXRBdHRyaWJ1dGVzIiwibnVtSW5zdGFuY2VzIiwiZ2V0TnVtSW5zdGFuY2VzIiwiaW5mbyIsImdldFVwZGF0ZVRyaWdnZXJzIiwiZ2V0UmFkaXVzIiwiZ2V0QWNjZXNzb3IiLCJnZXRGaWxsQ29sb3IiLCJpZCIsInJhZGl1c1NjYWxlIiwib3BhY2l0eSIsInBpY2thYmxlIiwiYXV0b0hpZ2hsaWdodCIsImhpZ2hsaWdodENvbG9yIiwidXBkYXRlVHJpZ2dlcnMiLCJfZ2V0U3VibGF5ZXJVcGRhdGVUcmlnZ2VycyIsImFjY2Vzc29ycyIsIl9nZXRTdWJMYXllckFjY2Vzc29ycyIsImRpc3RhbmNlU2NhbGUiLCJtZXRlcnNQZXJQaXhlbCIsIlNjYXR0ZXJwbG90TGF5ZXIiLCJBZ2dyZWdhdGlvbkxheWVyIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFD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RUFBUkEsUUFMSztBQU1MQyxRQUFBQSxhQUFhLEVBQWJBLGFBTks7QUFPTEMsUUFBQUEsY0FBYyxFQUFkQSxjQVBLO0FBUUxDLFFBQUFBLGNBQWMsRUFBZEE7QUFSSyxTQVNGRSxTQVRFLEVBQVA7QUFXRDs7O0VBeEV1Q0ssb0M7OztBQTJFMUNwQyxZQUFZLENBQUNxQyxTQUFiLEdBQXlCLGNBQXpCO0FBQ0FyQyxZQUFZLENBQUNiLFlBQWIsR0FBNEJBLFlBQTVCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtTY2F0dGVycGxvdExheWVyfSBmcm9tICdAZGVjay5nbC9sYXllcnMnO1xuaW1wb3J0IHtfQWdncmVnYXRpb25MYXllciBhcyBBZ2dyZWdhdGlvbkxheWVyfSBmcm9tICdAZGVjay5nbC9hZ2dyZWdhdGlvbi1sYXllcnMnO1xuXG5pbXBvcnQgZ2VvVmlld3BvcnQgZnJvbSAnQG1hcGJveC9nZW8tdmlld3BvcnQnO1xuaW1wb3J0IENQVUFnZ3JlZ2F0b3IsIHtcbiAgZGVmYXVsdENvbG9yRGltZW5zaW9uLFxuICBnZXREaW1lbnNpb25TY2FsZVxufSBmcm9tICcuLi9sYXllci11dGlscy9jcHUtYWdncmVnYXRvcic7XG5pbXBvcnQge2dldERpc3RhbmNlU2NhbGVzfSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCB7bWF4fSBmcm9tICdkMy1hcnJheSc7XG5cbmltcG9ydCB7RGVmYXVsdENvbG9yUmFuZ2V9IGZyb20gJ2NvbnN0YW50cy9jb2xvci1yYW5nZXMnO1xuaW1wb3J0IHtMQVlFUl9WSVNfQ09ORklHU30gZnJvbSAnbGF5ZXJzL2xheWVyLWZhY3RvcnknO1xuaW1wb3J0IHtTQ0FMRV9UWVBFU30gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuXG5pbXBvcnQgQ2x1c3RlckJ1aWxkZXIsIHtnZXRHZW9KU09OfSBmcm9tICcuLi9sYXllci11dGlscy9jbHVzdGVyLXV0aWxzJztcblxuY29uc3QgZGVmYXVsdFJhZGl1cyA9IExBWUVSX1ZJU19DT05GSUdTLmNsdXN0ZXJSYWRpdXMuZGVmYXVsdFZhbHVlO1xuY29uc3QgZGVmYXVsdFJhZGl1c1JhbmdlID0gTEFZRVJfVklTX0NPTkZJR1MuY2x1c3RlclJhZGl1c1JhbmdlLmRlZmF1bHRWYWx1ZTtcblxuY29uc3QgZGVmYXVsdEdldENvbG9yVmFsdWUgPSBwb2ludHMgPT4gcG9pbnRzLmxlbmd0aDtcbmNvbnN0IGRlZmF1bHRHZXRSYWRpdXNWYWx1ZSA9IGNlbGwgPT5cbiAgY2VsbC5maWx0ZXJlZFBvaW50cyA/IGNlbGwuZmlsdGVyZWRQb2ludHMubGVuZ3RoIDogY2VsbC5wb2ludHMubGVuZ3RoO1xuXG5mdW5jdGlvbiBwcm9jZXNzR2VvSlNPTihzdGVwLCBwcm9wcywgYWdncmVnYXRpb24sIHt2aWV3cG9ydH0pIHtcbiAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9uLCBmaWx0ZXJEYXRhfSA9IHByb3BzO1xuICBjb25zdCBnZW9KU09OID0gZ2V0R2VvSlNPTihkYXRhLCBnZXRQb3NpdGlvbiwgZmlsdGVyRGF0YSk7XG4gIGNvbnN0IGNsdXN0ZXJCdWlsZGVyID0gbmV3IENsdXN0ZXJCdWlsZGVyKCk7XG5cbiAgdGhpcy5zZXRTdGF0ZSh7Z2VvSlNPTiwgY2x1c3RlckJ1aWxkZXJ9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2x1c3RlcnMoc3RlcCwgcHJvcHMsIGFnZ3JlZ2F0aW9uLCB7dmlld3BvcnR9KSB7XG4gIGNvbnN0IHtnZW9KU09OLCBjbHVzdGVyQnVpbGRlcn0gPSB0aGlzLnN0YXRlO1xuICBjb25zdCB7Y2x1c3RlclJhZGl1cywgem9vbSwgd2lkdGgsIGhlaWdodH0gPSBwcm9wcztcbiAgY29uc3Qge2xvbmdpdHVkZSwgbGF0aXR1ZGV9ID0gdmlld3BvcnQ7XG5cbiAgLy8gem9vbSBuZWVkcyB0byBiZSBhbiBpbnRlZ2VyIGZvciB0aGUgZGlmZmVyZW50IG1hcCB1dGlscy4gQWxzbyBoZWxwcyB3aXRoIGNhY2hlIGtleS5cbiAgY29uc3QgYmJveCA9IGdlb1ZpZXdwb3J0LmJvdW5kcyhbbG9uZ2l0dWRlLCBsYXRpdHVkZV0sIHpvb20sIFt3aWR0aCwgaGVpZ2h0XSk7XG4gIGNvbnN0IGNsdXN0ZXJzID0gY2x1c3RlckJ1aWxkZXIuY2x1c3RlcnNBdFpvb20oe2Jib3gsIGNsdXN0ZXJSYWRpdXMsIGdlb0pTT04sIHpvb219KTtcblxuICB0aGlzLnNldFN0YXRlKHtcbiAgICBsYXllckRhdGE6IHtkYXRhOiBjbHVzdGVyc31cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN1YkxheWVyUmFkaXVzKGRpbWVuc2lvblN0YXRlLCBkaW1lbnNpb24sIGxheWVyUHJvcHMpIHtcbiAgcmV0dXJuIGNlbGwgPT4ge1xuICAgIGNvbnN0IHtnZXRSYWRpdXNWYWx1ZX0gPSBsYXllclByb3BzO1xuICAgIGNvbnN0IHtzY2FsZUZ1bmN9ID0gZGltZW5zaW9uU3RhdGU7XG4gICAgcmV0dXJuIHNjYWxlRnVuYyhnZXRSYWRpdXNWYWx1ZShjZWxsKSk7XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBjbHVzdGVyQWdncmVnYXRpb24gPSB7XG4gIGtleTogJ3Bvc2l0aW9uJyxcbiAgdXBkYXRlU3RlcHM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdnZW9qc29uJyxcbiAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgcHJvcDogJ2dldFBvc2l0aW9uJyxcbiAgICAgICAgICB1cGRhdGVUcmlnZ2VyOiAnZ2V0UG9zaXRpb24nXG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlckRhdGE6IHtcbiAgICAgICAgICBwcm9wOiAnZmlsdGVyRGF0YScsXG4gICAgICAgICAgdXBkYXRlVHJpZ2dlcjogJ2ZpbHRlckRhdGEnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVyOiBwcm9jZXNzR2VvSlNPTlxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnY2x1c3RlcmluZycsXG4gICAgICB0cmlnZ2Vyczoge1xuICAgICAgICBjbHVzdGVyUmFkaXVzOiB7XG4gICAgICAgICAgcHJvcDogJ2NsdXN0ZXJSYWRpdXMnXG4gICAgICAgIH0sXG4gICAgICAgIHpvb206IHtcbiAgICAgICAgICBwcm9wOiAnem9vbSdcbiAgICAgICAgfSxcbiAgICAgICAgd2lkdGg6IHtcbiAgICAgICAgICBwcm9wOiAnd2lkdGgnXG4gICAgICAgIH0sXG4gICAgICAgIGhlaWdodDoge1xuICAgICAgICAgIHByb3A6ICdoZWlnaHQnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVyOiBnZXRDbHVzdGVyc1xuICAgIH1cbiAgXVxufTtcblxuZnVuY3Rpb24gZ2V0UmFkaXVzVmFsdWVEb21haW4oc3RlcCwgcHJvcHMsIGRpbWVuc2lvblVwZGF0ZXIpIHtcbiAgY29uc3Qge2tleX0gPSBkaW1lbnNpb25VcGRhdGVyO1xuICBjb25zdCB7Z2V0UmFkaXVzVmFsdWV9ID0gcHJvcHM7XG4gIGNvbnN0IHtsYXllckRhdGF9ID0gdGhpcy5zdGF0ZTtcblxuICBjb25zdCB2YWx1ZURvbWFpbiA9IFswLCBtYXgobGF5ZXJEYXRhLmRhdGEsIGdldFJhZGl1c1ZhbHVlKV07XG4gIHRoaXMuX3NldERpbWVuc2lvblN0YXRlKGtleSwge3ZhbHVlRG9tYWlufSk7XG59XG5cbmNvbnN0IGNsdXN0ZXJMYXllckRpbWVuc2lvbnMgPSBbXG4gIGRlZmF1bHRDb2xvckRpbWVuc2lvbixcbiAge1xuICAgIGtleTogJ3JhZGl1cycsXG4gICAgYWNjZXNzb3I6ICdnZXRSYWRpdXMnLFxuICAgIG51bGxWYWx1ZTogMCxcbiAgICB1cGRhdGVTdGVwczogW1xuICAgICAge1xuICAgICAgICBrZXk6ICdnZXREb21haW4nLFxuICAgICAgICB0cmlnZ2Vyczoge1xuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBwcm9wOiAnZ2V0UmFkaXVzVmFsdWUnLFxuICAgICAgICAgICAgdXBkYXRlVHJpZ2dlcjogJ2dldFJhZGl1c1ZhbHVlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlcjogZ2V0UmFkaXVzVmFsdWVEb21haW5cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogJ2dldFNjYWxlRnVuYycsXG4gICAgICAgIHRyaWdnZXJzOiB7XG4gICAgICAgICAgZG9tYWluOiB7cHJvcDogJ3JhZGl1c0RvbWFpbid9LFxuICAgICAgICAgIHJhbmdlOiB7cHJvcDogJ3JhZGl1c1JhbmdlJ30sXG4gICAgICAgICAgc2NhbGVUeXBlOiB7cHJvcDogJ3JhZGl1c1NjYWxlVHlwZSd9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZXI6IGdldERpbWVuc2lvblNjYWxlXG4gICAgICB9XG4gICAgXSxcbiAgICBnZXRTdWJMYXllckFjY2Vzc29yOiBnZXRTdWJMYXllclJhZGl1cyxcbiAgICBnZXRQaWNraW5nSW5mbzogKGRpbWVuc2lvblN0YXRlLCBjZWxsLCBsYXllclByb3BzKSA9PiB7XG4gICAgICBjb25zdCByYWRpdXNWYWx1ZSA9IGxheWVyUHJvcHMuZ2V0UmFkaXVzVmFsdWUoY2VsbCk7XG4gICAgICByZXR1cm4ge3JhZGl1c1ZhbHVlfTtcbiAgICB9XG4gIH1cbl07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgY2x1c3RlclJhZGl1czogZGVmYXVsdFJhZGl1cyxcbiAgY29sb3JEb21haW46IG51bGwsXG4gIGNvbG9yUmFuZ2U6IERlZmF1bHRDb2xvclJhbmdlLFxuICBjb2xvclNjYWxlVHlwZTogU0NBTEVfVFlQRVMucXVhbnRpemUsXG4gIHJhZGl1c1NjYWxlVHlwZTogU0NBTEVfVFlQRVMuc3FydCxcbiAgcmFkaXVzUmFuZ2U6IGRlZmF1bHRSYWRpdXNSYW5nZSxcbiAgZ2V0UG9zaXRpb246IHt0eXBlOiAnYWNjZXNzb3InLCB2YWx1ZTogeCA9PiB4LnBvc2l0aW9ufSxcbiAgZ2V0Q29sb3JWYWx1ZToge3R5cGU6ICdhY2Nlc3NvcicsIHZhbHVlOiBkZWZhdWx0R2V0Q29sb3JWYWx1ZX0sXG4gIGdldFJhZGl1c1ZhbHVlOiB7dHlwZTogJ2FjY2Vzc29yJywgdmFsdWU6IGRlZmF1bHRHZXRSYWRpdXNWYWx1ZX1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJMYXllciBleHRlbmRzIEFnZ3JlZ2F0aW9uTGF5ZXIge1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3QgY3B1QWdncmVnYXRvciA9IG5ldyBDUFVBZ2dyZWdhdG9yKHtcbiAgICAgIGFnZ3JlZ2F0aW9uOiBjbHVzdGVyQWdncmVnYXRpb24sXG4gICAgICBkaW1lbnNpb25zOiBjbHVzdGVyTGF5ZXJEaW1lbnNpb25zXG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY3B1QWdncmVnYXRvcixcbiAgICAgIGFnZ3JlZ2F0b3JTdGF0ZTogY3B1QWdncmVnYXRvci5zdGF0ZVxuICAgIH07XG4gICAgY29uc3QgYXR0cmlidXRlTWFuYWdlciA9IHRoaXMuZ2V0QXR0cmlidXRlTWFuYWdlcigpO1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkKHtcbiAgICAgIHBvc2l0aW9uczoge3NpemU6IDMsIGFjY2Vzc29yOiAnZ2V0UG9zaXRpb24nfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAvLyBtYWtlIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgY3B1QWdncmVnYXRvciBmb3IgdGVzdGluZ1xuICAgICAgYWdncmVnYXRvclN0YXRlOiB0aGlzLnN0YXRlLmNwdUFnZ3JlZ2F0b3IudXBkYXRlU3RhdGUoXG4gICAgICAgIHtvbGRQcm9wcywgcHJvcHMsIGNoYW5nZUZsYWdzfSxcbiAgICAgICAge1xuICAgICAgICAgIHZpZXdwb3J0OiB0aGlzLmNvbnRleHQudmlld3BvcnQsXG4gICAgICAgICAgYXR0cmlidXRlczogdGhpcy5nZXRBdHRyaWJ1dGVzKCksXG4gICAgICAgICAgbnVtSW5zdGFuY2VzOiB0aGlzLmdldE51bUluc3RhbmNlcyhwcm9wcylcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm99KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuY3B1QWdncmVnYXRvci5nZXRQaWNraW5nSW5mbyh7aW5mb30sIHRoaXMucHJvcHMpO1xuICB9XG5cbiAgX2dldFN1YmxheWVyVXBkYXRlVHJpZ2dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuY3B1QWdncmVnYXRvci5nZXRVcGRhdGVUcmlnZ2Vycyh0aGlzLnByb3BzKTtcbiAgfVxuXG4gIF9nZXRTdWJMYXllckFjY2Vzc29ycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0UmFkaXVzOiB0aGlzLnN0YXRlLmNwdUFnZ3JlZ2F0b3IuZ2V0QWNjZXNzb3IoJ3JhZGl1cycsIHRoaXMucHJvcHMpLFxuICAgICAgZ2V0RmlsbENvbG9yOiB0aGlzLnN0YXRlLmNwdUFnZ3JlZ2F0b3IuZ2V0QWNjZXNzb3IoJ2ZpbGxDb2xvcicsIHRoaXMucHJvcHMpXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlckxheWVycygpIHtcbiAgICAvLyBmb3Igc3ViY2xhc3NpbmcsIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHJldHVyblxuICAgIC8vIGN1c3RvbWl6ZWQgc3ViIGxheWVyIHByb3BzXG4gICAgY29uc3Qge2lkLCByYWRpdXNTY2FsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtjcHVBZ2dyZWdhdG9yfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAvLyBiYXNlIGxheWVyIHByb3BzXG4gICAgY29uc3Qge29wYWNpdHksIHBpY2thYmxlLCBhdXRvSGlnaGxpZ2h0LCBoaWdobGlnaHRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHVwZGF0ZVRyaWdnZXJzID0gdGhpcy5fZ2V0U3VibGF5ZXJVcGRhdGVUcmlnZ2VycygpO1xuICAgIGNvbnN0IGFjY2Vzc29ycyA9IHRoaXMuX2dldFN1YkxheWVyQWNjZXNzb3JzKCk7XG5cbiAgICBjb25zdCBkaXN0YW5jZVNjYWxlID0gZ2V0RGlzdGFuY2VTY2FsZXModGhpcy5jb250ZXh0LnZpZXdwb3J0KTtcbiAgICBjb25zdCBtZXRlcnNQZXJQaXhlbCA9IGRpc3RhbmNlU2NhbGUubWV0ZXJzUGVyUGl4ZWxbMF07XG5cbiAgICAvLyByZXR1cm4gcHJvcHMgdG8gdGhlIHN1YmxheWVyIGNvbnN0cnVjdG9yXG4gICAgcmV0dXJuIG5ldyBTY2F0dGVycGxvdExheWVyKHtcbiAgICAgIGlkOiBgJHtpZH0tY2x1c3RlcmAsXG4gICAgICBkYXRhOiBjcHVBZ2dyZWdhdG9yLnN0YXRlLmxheWVyRGF0YS5kYXRhLFxuICAgICAgcmFkaXVzU2NhbGU6IG1ldGVyc1BlclBpeGVsICogcmFkaXVzU2NhbGUsXG4gICAgICBvcGFjaXR5LFxuICAgICAgcGlja2FibGUsXG4gICAgICBhdXRvSGlnaGxpZ2h0LFxuICAgICAgaGlnaGxpZ2h0Q29sb3IsXG4gICAgICB1cGRhdGVUcmlnZ2VycyxcbiAgICAgIC4uLmFjY2Vzc29yc1xuICAgIH0pO1xuICB9XG59XG5cbkNsdXN0ZXJMYXllci5sYXllck5hbWUgPSAnQ2x1c3RlckxheWVyJztcbkNsdXN0ZXJMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=