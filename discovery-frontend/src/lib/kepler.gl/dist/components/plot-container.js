"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = PlotContainerFactory;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reselect = require("reselect");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactMapGl = require("react-map-gl");

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _notificationsUtils = require("../utils/notifications-utils");

var _mapContainer = _interopRequireDefault(require("./map-container"));

var _exportUtils = require("../utils/export-utils");

var _mapboxGlStyleEditor = require("../utils/map-style-utils/mapbox-gl-style-editor");

var _dataUtils = require("../utils/data-utils");

var _geoViewport = _interopRequireDefault(require("@mapbox/geo-viewport"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: ", "px;\n  height: ", "px;\n  display: flex;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .mapboxgl-ctrl-bottom-left,\n  .mapboxgl-ctrl-bottom-right,\n  .mapbox-attribution-container {\n    display: none;\n  }\n\n  position: absolute;\n  top: ", "px;\n  left: ", "px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var CLASS_FILTER = ['mapboxgl-control-container', 'attrition-link', 'attrition-logo'];

var DOM_FILTER_FUNC = function DOM_FILTER_FUNC(node) {
  return !CLASS_FILTER.includes(node.className);
};

var OUT_OF_SCREEN_POSITION = -9999;
var propTypes = {
  width: _propTypes["default"].number.isRequired,
  height: _propTypes["default"].number.isRequired,
  exportImageSetting: _propTypes["default"].object.isRequired,
  addNotification: _propTypes["default"].func.isRequired,
  mapFields: _propTypes["default"].object.isRequired,
  setExportImageSetting: _propTypes["default"].object.isRequired,
  setExportImageDataUri: _propTypes["default"].func.isRequired,
  setExportImageError: _propTypes["default"].func.isRequired,
  splitMaps: _propTypes["default"].arrayOf(_propTypes["default"].object)
};
PlotContainerFactory.deps = [_mapContainer["default"]]; // Remove mapbox logo in exported map, because it contains non-ascii characters

var StyledPlotContainer = _styledComponents["default"].div(_templateObject(), OUT_OF_SCREEN_POSITION, OUT_OF_SCREEN_POSITION);

var StyledMapContainer = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.width;
}, function (props) {
  return props.height;
});

var deckGlProps = {
  glOptions: {
    preserveDrawingBuffer: true,
    useDevicePixels: false
  }
};

function PlotContainerFactory(MapContainer) {
  var PlotContainer = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(PlotContainer, _Component);

    var _super = _createSuper(PlotContainer);

    function PlotContainer(_props) {
      var _this;

      (0, _classCallCheck2["default"])(this, PlotContainer);
      _this = _super.call(this, _props);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "plottingAreaRef", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "mapStyleSelector", function (props) {
        return props.mapFields.mapStyle;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "mapScaleSelector", function (props) {
        var imageSize = props.exportImageSetting.imageSize;
        var mapState = props.mapFields.mapState;

        if (imageSize.scale) {
          return imageSize.scale;
        }

        var scale = (0, _exportUtils.getScaleFromImageSize)(imageSize.imageW, imageSize.imageH, mapState.width * (mapState.isSplit ? 2 : 1), mapState.height);
        return scale > 0 ? scale : 1;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "scaledMapStyleSelector", (0, _reselect.createSelector)(_this.mapStyleSelector, _this.mapScaleSelector, function (mapStyle, scale) {
        return _objectSpread(_objectSpread({}, mapStyle), {}, {
          bottomMapStyle: (0, _mapboxGlStyleEditor.scaleMapStyleByResolution)(mapStyle.bottomMapStyle, scale),
          topMapStyle: (0, _mapboxGlStyleEditor.scaleMapStyleByResolution)(mapStyle.topMapStyle, scale)
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onMapRender", function (map) {
        if (map.isStyleLoaded()) {
          _this._retrieveNewScreenshot();
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_retrieveNewScreenshot", function () {
        if (_this.plottingAreaRef.current) {
          (0, _exportUtils.convertToPng)(_this.plottingAreaRef.current, {
            filter: DOM_FILTER_FUNC
          }).then(_this.props.setExportImageDataUri)["catch"](function (err) {
            _this.props.setExportImageError(err);

            if (_this.props.enableErrorNotification) {
              _this.props.addNotification((0, _notificationsUtils.exportImageError)({
                err: err
              }));
            }
          });
        }
      });
      _this._onMapRender = (0, _lodash["default"])(_this._onMapRender, 500);
      _this._retrieveNewScreenshot = (0, _lodash["default"])(_this._retrieveNewScreenshot, 500);
      return _this;
    }

    (0, _createClass2["default"])(PlotContainer, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.props.setExportImageSetting({
          processing: true
        });
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var _this2 = this;

        // re-fetch the new screenshot only when ratio legend or resolution changes
        var checks = ['ratio', 'resolution', 'legend'];
        var shouldRetrieveScreenshot = checks.some(function (item) {
          return _this2.props.exportImageSetting[item] !== prevProps.exportImageSetting[item];
        });

        if (shouldRetrieveScreenshot) {
          this.props.setExportImageSetting({
            processing: true
          });

          this._retrieveNewScreenshot();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            exportImageSetting = _this$props.exportImageSetting,
            mapFields = _this$props.mapFields,
            splitMaps = _this$props.splitMaps;
        var _exportImageSetting$i = exportImageSetting.imageSize,
            imageSize = _exportImageSetting$i === void 0 ? {} : _exportImageSetting$i,
            legend = exportImageSetting.legend;
        var mapState = mapFields.mapState;
        var isSplit = splitMaps && splitMaps.length > 1;
        var size = {
          width: imageSize.imageW || 1,
          height: imageSize.imageH || 1
        };
        var bounds = (0, _dataUtils.findMapBounds)(mapFields.layers);
        var width = size.width / (isSplit ? 2 : 1);
        var height = size.height;
        var scale = this.mapScaleSelector(this.props);

        var newMapState = _objectSpread(_objectSpread({}, mapState), {}, {
          width: width,
          height: height,
          zoom: mapState.zoom + (Math.log2(scale) || 0)
        });

        if (exportImageSetting.center) {
          var _ref = exportImageSetting.center ? _geoViewport["default"].viewport(bounds, [width, height]) : {
            center: [mapState.longitude, mapState.latitude],
            zoom: mapState.zoom
          },
              center = _ref.center,
              zoom = _ref.zoom;

          newMapState.longitude = center[0];
          newMapState.latitude = center[1];
          newMapState.zoom = zoom + Number(Math.log2(scale) || 0);
        }

        var mapProps = _objectSpread(_objectSpread({}, mapFields), {}, {
          mapStyle: this.scaledMapStyleSelector(this.props),
          // override viewport based on export settings
          mapState: newMapState,
          mapControls: {
            // override map legend visibility
            mapLegend: {
              show: legend,
              active: true
            }
          },
          MapComponent: _reactMapGl.StaticMap,
          onMapRender: this._onMapRender,
          isExport: true,
          deckGlProps: deckGlProps
        });

        var mapContainers = !isSplit ? /*#__PURE__*/_react["default"].createElement(MapContainer, (0, _extends2["default"])({
          index: 0
        }, mapProps)) : splitMaps.map(function (settings, index) {
          return /*#__PURE__*/_react["default"].createElement(MapContainer, (0, _extends2["default"])({
            key: index,
            index: index
          }, mapProps, {
            mapLayers: splitMaps[index].layers
          }));
        });
        return /*#__PURE__*/_react["default"].createElement(StyledPlotContainer, {
          className: "export-map-instance"
        }, /*#__PURE__*/_react["default"].createElement(StyledMapContainer, {
          ref: this.plottingAreaRef,
          width: size.width,
          height: size.height
        }, mapContainers));
      }
    }]);
    return PlotContainer;
  }(_react.Component);

  PlotContainer.propsTypes = propTypes;
  return PlotContainer;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3Bsb3QtY29udGFpbmVyLmpzIl0sIm5hbWVzIjpbIkNMQVNTX0ZJTFRFUiIsIkRPTV9GSUxURVJfRlVOQyIsIm5vZGUiLCJpbmNsdWRlcyIsImNsYXNzTmFtZSIsIk9VVF9PRl9TQ1JFRU5fUE9TSVRJT04iLCJwcm9wVHlwZXMiLCJ3aWR0aCIsIlByb3BUeXBlcyIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJoZWlnaHQiLCJleHBvcnRJbWFnZVNldHRpbmciLCJvYmplY3QiLCJhZGROb3RpZmljYXRpb24iLCJmdW5jIiwibWFwRmllbGRzIiwic2V0RXhwb3J0SW1hZ2VTZXR0aW5nIiwic2V0RXhwb3J0SW1hZ2VEYXRhVXJpIiwic2V0RXhwb3J0SW1hZ2VFcnJvciIsInNwbGl0TWFwcyIsImFycmF5T2YiLCJQbG90Q29udGFpbmVyRmFjdG9yeSIsImRlcHMiLCJNYXBDb250YWluZXJGYWN0b3J5IiwiU3R5bGVkUGxvdENvbnRhaW5lciIsInN0eWxlZCIsImRpdiIsIlN0eWxlZE1hcENvbnRhaW5lciIsInByb3BzIiwiZGVja0dsUHJvcHMiLCJnbE9wdGlvbnMiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJ1c2VEZXZpY2VQaXhlbHMiLCJNYXBDb250YWluZXIiLCJQbG90Q29udGFpbmVyIiwibWFwU3R5bGUiLCJpbWFnZVNpemUiLCJtYXBTdGF0ZSIsInNjYWxlIiwiaW1hZ2VXIiwiaW1hZ2VIIiwiaXNTcGxpdCIsIm1hcFN0eWxlU2VsZWN0b3IiLCJtYXBTY2FsZVNlbGVjdG9yIiwiYm90dG9tTWFwU3R5bGUiLCJ0b3BNYXBTdHlsZSIsIm1hcCIsImlzU3R5bGVMb2FkZWQiLCJfcmV0cmlldmVOZXdTY3JlZW5zaG90IiwicGxvdHRpbmdBcmVhUmVmIiwiY3VycmVudCIsImZpbHRlciIsInRoZW4iLCJlcnIiLCJlbmFibGVFcnJvck5vdGlmaWNhdGlvbiIsIl9vbk1hcFJlbmRlciIsInByb2Nlc3NpbmciLCJwcmV2UHJvcHMiLCJjaGVja3MiLCJzaG91bGRSZXRyaWV2ZVNjcmVlbnNob3QiLCJzb21lIiwiaXRlbSIsImxlZ2VuZCIsImxlbmd0aCIsInNpemUiLCJib3VuZHMiLCJsYXllcnMiLCJuZXdNYXBTdGF0ZSIsInpvb20iLCJNYXRoIiwibG9nMiIsImNlbnRlciIsImdlb1ZpZXdwb3J0Iiwidmlld3BvcnQiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsIk51bWJlciIsIm1hcFByb3BzIiwic2NhbGVkTWFwU3R5bGVTZWxlY3RvciIsIm1hcENvbnRyb2xzIiwibWFwTGVnZW5kIiwic2hvdyIsImFjdGl2ZSIsIk1hcENvbXBvbmVudCIsIlN0YXRpY01hcCIsIm9uTWFwUmVuZGVyIiwiaXNFeHBvcnQiLCJtYXBDb250YWluZXJzIiwic2V0dGluZ3MiLCJpbmRleCIsIkNvbXBvbmVudCIsInByb3BzVHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUcsQ0FBQyw0QkFBRCxFQUErQixnQkFBL0IsRUFBaUQsZ0JBQWpELENBQXJCOztBQUNBLElBQU1DLGVBQWUsR0FBRyxTQUFsQkEsZUFBa0IsQ0FBQUMsSUFBSTtBQUFBLFNBQUksQ0FBQ0YsWUFBWSxDQUFDRyxRQUFiLENBQXNCRCxJQUFJLENBQUNFLFNBQTNCLENBQUw7QUFBQSxDQUE1Qjs7QUFDQSxJQUFNQyxzQkFBc0IsR0FBRyxDQUFDLElBQWhDO0FBRUEsSUFBTUMsU0FBUyxHQUFHO0FBQ2hCQyxFQUFBQSxLQUFLLEVBQUVDLHNCQUFVQyxNQUFWLENBQWlCQyxVQURSO0FBRWhCQyxFQUFBQSxNQUFNLEVBQUVILHNCQUFVQyxNQUFWLENBQWlCQyxVQUZUO0FBR2hCRSxFQUFBQSxrQkFBa0IsRUFBRUosc0JBQVVLLE1B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QUFBLFdBQVcsRUFBRSxLQUFLOUIsWUFkTjtBQWVaK0IsVUFBQUEsUUFBUSxFQUFFLElBZkU7QUFnQlp6RCxVQUFBQSxXQUFXLEVBQVhBO0FBaEJZLFVBQWQ7O0FBbUJBLFlBQU0wRCxhQUFhLEdBQUcsQ0FBQzlDLE9BQUQsZ0JBQ3BCLGdDQUFDLFlBQUQ7QUFBYyxVQUFBLEtBQUssRUFBRTtBQUFyQixXQUE0Qm9DLFFBQTVCLEVBRG9CLEdBR3BCMUQsU0FBUyxDQUFDMkIsR0FBVixDQUFjLFVBQUMwQyxRQUFELEVBQVdDLEtBQVg7QUFBQSw4QkFDWixnQ0FBQyxZQUFEO0FBQ0UsWUFBQSxHQUFHLEVBQUVBLEtBRFA7QUFFRSxZQUFBLEtBQUssRUFBRUE7QUFGVCxhQUdNWixRQUhOO0FBSUUsWUFBQSxTQUFTLEVBQUUxRCxTQUFTLENBQUNzRSxLQUFELENBQVQsQ0FBaUJ2QjtBQUo5QixhQURZO0FBQUEsU0FBZCxDQUhGO0FBYUEsNEJBQ0UsZ0NBQUMsbUJBQUQ7QUFBcUIsVUFBQSxTQUFTLEVBQUM7QUFBL0Isd0JBQ0UsZ0NBQUMsa0JBQUQ7QUFBb0IsVUFBQSxHQUFHLEVBQUUsS0FBS2pCLGVBQTlCO0FBQStDLFVBQUEsS0FBSyxFQUFFZSxJQUFJLENBQUMxRCxLQUEzRDtBQUFrRSxVQUFBLE1BQU0sRUFBRTBELElBQUksQ0FBQ3REO0FBQS9FLFdBQ0c2RSxhQURILENBREYsQ0FERjtBQU9EO0FBaEpzRDtBQUFBO0FBQUEsSUFDN0JHLGdCQUQ2Qjs7QUFtSnpEeEQsRUFBQUEsYUFBYSxDQUFDeUQsVUFBZCxHQUEyQnRGLFNBQTNCO0FBQ0EsU0FBTzZCLGFBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIGxpYnJhcmllc1xuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCBjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7U3RhdGljTWFwfSBmcm9tICdyZWFjdC1tYXAtZ2wnO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSc7XG5pbXBvcnQge2V4cG9ydEltYWdlRXJyb3J9IGZyb20gJ3V0aWxzL25vdGlmaWNhdGlvbnMtdXRpbHMnO1xuaW1wb3J0IE1hcENvbnRhaW5lckZhY3RvcnkgZnJvbSAnLi9tYXAtY29udGFpbmVyJztcbmltcG9ydCB7Y29udmVydFRvUG5nfSBmcm9tICd1dGlscy9leHBvcnQtdXRpbHMnO1xuaW1wb3J0IHtzY2FsZU1hcFN0eWxlQnlSZXNvbHV0aW9ufSBmcm9tICd1dGlscy9tYXAtc3R5bGUtdXRpbHMvbWFwYm94LWdsLXN0eWxlLWVkaXRvcic7XG5pbXBvcnQge2dldFNjYWxlRnJvbUltYWdlU2l6ZX0gZnJvbSAndXRpbHMvZXhwb3J0LXV0aWxzJztcbmltcG9ydCB7ZmluZE1hcEJvdW5kc30gZnJvbSAndXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgZ2VvVmlld3BvcnQgZnJvbSAnQG1hcGJveC9nZW8tdmlld3BvcnQnO1xuXG5jb25zdCBDTEFTU19GSUxURVIgPSBbJ21hcGJveGdsLWNvbnRyb2wtY29udGFpbmVyJywgJ2F0dHJpdGlvbi1saW5rJywgJ2F0dHJpdGlvbi1sb2dvJ107XG5jb25zdCBET01fRklMVEVSX0ZVTkMgPSBub2RlID0+ICFDTEFTU19GSUxURVIuaW5jbHVkZXMobm9kZS5jbGFzc05hbWUpO1xuY29uc3QgT1VUX09GX1NDUkVFTl9QT1NJVElPTiA9IC05OTk5O1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBleHBvcnRJbWFnZVNldHRpbmc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgYWRkTm90aWZpY2F0aW9uOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBtYXBGaWVsZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgc2V0RXhwb3J0SW1hZ2VTZXR0aW5nOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIHNldEV4cG9ydEltYWdlRGF0YVVyaTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgc2V0RXhwb3J0SW1hZ2VFcnJvcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgc3BsaXRNYXBzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KVxufTtcblxuUGxvdENvbnRhaW5lckZhY3RvcnkuZGVwcyA9IFtNYXBDb250YWluZXJGYWN0b3J5XTtcblxuLy8gUmVtb3ZlIG1hcGJveCBsb2dvIGluIGV4cG9ydGVkIG1hcCwgYmVjYXVzZSBpdCBjb250YWlucyBub24tYXNjaWkgY2hhcmFjdGVyc1xuY29uc3QgU3R5bGVkUGxvdENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIC5tYXBib3hnbC1jdHJsLWJvdHRvbS1sZWZ0LFxuICAubWFwYm94Z2wtY3RybC1ib3R0b20tcmlnaHQsXG4gIC5tYXBib3gtYXR0cmlidXRpb24tY29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG5cbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6ICR7T1VUX09GX1NDUkVFTl9QT1NJVElPTn1weDtcbiAgbGVmdDogJHtPVVRfT0ZfU0NSRUVOX1BPU0lUSU9OfXB4O1xuYDtcblxuY29uc3QgU3R5bGVkTWFwQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgd2lkdGg6ICR7cHJvcHMgPT4gcHJvcHMud2lkdGh9cHg7XG4gIGhlaWdodDogJHtwcm9wcyA9PiBwcm9wcy5oZWlnaHR9cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG5gO1xuXG5jb25zdCBkZWNrR2xQcm9wcyA9IHtcbiAgZ2xPcHRpb25zOiB7XG4gICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlLFxuICAgIHVzZURldmljZVBpeGVsczogZmFsc2VcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxvdENvbnRhaW5lckZhY3RvcnkoTWFwQ29udGFpbmVyKSB7XG4gIGNsYXNzIFBsb3RDb250YWluZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICBzdXBlcihwcm9wcyk7XG4gICAgICB0aGlzLl9vbk1hcFJlbmRlciA9IGRlYm91bmNlKHRoaXMuX29uTWFwUmVuZGVyLCA1MDApO1xuICAgICAgdGhpcy5fcmV0cmlldmVOZXdTY3JlZW5zaG90ID0gZGVib3VuY2UodGhpcy5fcmV0cmlldmVOZXdTY3JlZW5zaG90LCA1MDApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5wcm9wcy5zZXRFeHBvcnRJbWFnZVNldHRpbmcoe3Byb2Nlc3Npbmc6IHRydWV9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgICAvLyByZS1mZXRjaCB0aGUgbmV3IHNjcmVlbnNob3Qgb25seSB3aGVuIHJhdGlvIGxlZ2VuZCBvciByZXNvbHV0aW9uIGNoYW5nZXNcbiAgICAgIGNvbnN0IGNoZWNrcyA9IFsncmF0aW8nLCAncmVzb2x1dGlvbicsICdsZWdlbmQnXTtcbiAgICAgIGNvbnN0IHNob3VsZFJldHJpZXZlU2NyZWVuc2hvdCA9IGNoZWNrcy5zb21lKFxuICAgICAgICBpdGVtID0+IHRoaXMucHJvcHMuZXhwb3J0SW1hZ2VTZXR0aW5nW2l0ZW1dICE9PSBwcmV2UHJvcHMuZXhwb3J0SW1hZ2VTZXR0aW5nW2l0ZW1dXG4gICAgICApO1xuICAgICAgaWYgKHNob3VsZFJldHJpZXZlU2NyZWVuc2hvdCkge1xuICAgICAgICB0aGlzLnByb3BzLnNldEV4cG9ydEltYWdlU2V0dGluZyh7cHJvY2Vzc2luZzogdHJ1ZX0pO1xuICAgICAgICB0aGlzLl9yZXRyaWV2ZU5ld1NjcmVlbnNob3QoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbG90dGluZ0FyZWFSZWYgPSBjcmVhdGVSZWYoKTtcblxuICAgIG1hcFN0eWxlU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5tYXBGaWVsZHMubWFwU3R5bGU7XG4gICAgbWFwU2NhbGVTZWxlY3RvciA9IHByb3BzID0+IHtcbiAgICAgIGNvbnN0IHtpbWFnZVNpemV9ID0gcHJvcHMuZXhwb3J0SW1hZ2VTZXR0aW5nO1xuICAgICAgY29uc3Qge21hcFN0YXRlfSA9IHByb3BzLm1hcEZpZWxkcztcbiAgICAgIGlmIChpbWFnZVNpemUuc2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGltYWdlU2l6ZS5zY2FsZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2NhbGUgPSBnZXRTY2FsZUZyb21JbWFnZVNpemUoXG4gICAgICAgIGltYWdlU2l6ZS5pbWFnZVcsXG4gICAgICAgIGltYWdlU2l6ZS5pbWFnZUgsXG4gICAgICAgIG1hcFN0YXRlLndpZHRoICogKG1hcFN0YXRlLmlzU3BsaXQgPyAyIDogMSksXG4gICAgICAgIG1hcFN0YXRlLmhlaWdodFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHNjYWxlID4gMCA/IHNjYWxlIDogMTtcbiAgICB9O1xuXG4gICAgc2NhbGVkTWFwU3R5bGVTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy5tYXBTdHlsZVNlbGVjdG9yLFxuICAgICAgdGhpcy5tYXBTY2FsZVNlbGVjdG9yLFxuICAgICAgKG1hcFN0eWxlLCBzY2FsZSkgPT4gKHtcbiAgICAgICAgLi4ubWFwU3R5bGUsXG4gICAgICAgIGJvdHRvbU1hcFN0eWxlOiBzY2FsZU1hcFN0eWxlQnlSZXNvbHV0aW9uKG1hcFN0eWxlLmJvdHRvbU1hcFN0eWxlLCBzY2FsZSksXG4gICAgICAgIHRvcE1hcFN0eWxlOiBzY2FsZU1hcFN0eWxlQnlSZXNvbHV0aW9uKG1hcFN0eWxlLnRvcE1hcFN0eWxlLCBzY2FsZSlcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIF9vbk1hcFJlbmRlciA9IG1hcCA9PiB7XG4gICAgICBpZiAobWFwLmlzU3R5bGVMb2FkZWQoKSkge1xuICAgICAgICB0aGlzLl9yZXRyaWV2ZU5ld1NjcmVlbnNob3QoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3JldHJpZXZlTmV3U2NyZWVuc2hvdCA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnBsb3R0aW5nQXJlYVJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNvbnZlcnRUb1BuZyh0aGlzLnBsb3R0aW5nQXJlYVJlZi5jdXJyZW50LCB7ZmlsdGVyOiBET01fRklMVEVSX0ZVTkN9KVxuICAgICAgICAgIC50aGVuKHRoaXMucHJvcHMuc2V0RXhwb3J0SW1hZ2VEYXRhVXJpKVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXRFeHBvcnRJbWFnZUVycm9yKGVycik7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmFibGVFcnJvck5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgICB0aGlzLnByb3BzLmFkZE5vdGlmaWNhdGlvbihleHBvcnRJbWFnZUVycm9yKHtlcnJ9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtleHBvcnRJbWFnZVNldHRpbmcsIG1hcEZpZWxkcywgc3BsaXRNYXBzfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB7aW1hZ2VTaXplID0ge30sIGxlZ2VuZH0gPSBleHBvcnRJbWFnZVNldHRpbmc7XG4gICAgICBjb25zdCB7bWFwU3RhdGV9ID0gbWFwRmllbGRzO1xuICAgICAgY29uc3QgaXNTcGxpdCA9IHNwbGl0TWFwcyAmJiBzcGxpdE1hcHMubGVuZ3RoID4gMTtcblxuICAgICAgY29uc3Qgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGltYWdlU2l6ZS5pbWFnZVcgfHwgMSxcbiAgICAgICAgaGVpZ2h0OiBpbWFnZVNpemUuaW1hZ2VIIHx8IDFcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGJvdW5kcyA9IGZpbmRNYXBCb3VuZHMobWFwRmllbGRzLmxheWVycyk7XG4gICAgICBjb25zdCB3aWR0aCA9IHNpemUud2lkdGggLyAoaXNTcGxpdCA/IDIgOiAxKTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLm1hcFNjYWxlU2VsZWN0b3IodGhpcy5wcm9wcyk7XG4gICAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHtcbiAgICAgICAgLi4ubWFwU3RhdGUsXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHpvb206IG1hcFN0YXRlLnpvb20gKyAoTWF0aC5sb2cyKHNjYWxlKSB8fCAwKVxuICAgICAgfTtcblxuICAgICAgaWYgKGV4cG9ydEltYWdlU2V0dGluZy5jZW50ZXIpIHtcbiAgICAgICAgY29uc3Qge2NlbnRlciwgem9vbX0gPSBleHBvcnRJbWFnZVNldHRpbmcuY2VudGVyXG4gICAgICAgICAgPyBnZW9WaWV3cG9ydC52aWV3cG9ydChib3VuZHMsIFt3aWR0aCwgaGVpZ2h0XSlcbiAgICAgICAgICA6IHtjZW50ZXI6IFttYXBTdGF0ZS5sb25naXR1ZGUsIG1hcFN0YXRlLmxhdGl0dWRlXSwgem9vbTogbWFwU3RhdGUuem9vbX07XG5cbiAgICAgICAgbmV3TWFwU3RhdGUubG9uZ2l0dWRlID0gY2VudGVyWzBdO1xuICAgICAgICBuZXdNYXBTdGF0ZS5sYXRpdHVkZSA9IGNlbnRlclsxXTtcbiAgICAgICAgbmV3TWFwU3RhdGUuem9vbSA9IHpvb20gKyBOdW1iZXIoTWF0aC5sb2cyKHNjYWxlKSB8fCAwKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWFwUHJvcHMgPSB7XG4gICAgICAgIC4uLm1hcEZpZWxkcyxcbiAgICAgICAgbWFwU3R5bGU6IHRoaXMuc2NhbGVkTWFwU3R5bGVTZWxlY3Rvcih0aGlzLnByb3BzKSxcblxuICAgICAgICAvLyBvdmVycmlkZSB2aWV3cG9ydCBiYXNlZCBvbiBleHBvcnQgc2V0dGluZ3NcbiAgICAgICAgbWFwU3RhdGU6IG5ld01hcFN0YXRlLFxuICAgICAgICBtYXBDb250cm9sczoge1xuICAgICAgICAgIC8vIG92ZXJyaWRlIG1hcCBsZWdlbmQgdmlzaWJpbGl0eVxuICAgICAgICAgIG1hcExlZ2VuZDoge1xuICAgICAgICAgICAgc2hvdzogbGVnZW5kLFxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBNYXBDb21wb25lbnQ6IFN0YXRpY01hcCxcbiAgICAgICAgb25NYXBSZW5kZXI6IHRoaXMuX29uTWFwUmVuZGVyLFxuICAgICAgICBpc0V4cG9ydDogdHJ1ZSxcbiAgICAgICAgZGVja0dsUHJvcHNcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG1hcENvbnRhaW5lcnMgPSAhaXNTcGxpdCA/IChcbiAgICAgICAgPE1hcENvbnRhaW5lciBpbmRleD17MH0gey4uLm1hcFByb3BzfSAvPlxuICAgICAgKSA6IChcbiAgICAgICAgc3BsaXRNYXBzLm1hcCgoc2V0dGluZ3MsIGluZGV4KSA9PiAoXG4gICAgICAgICAgPE1hcENvbnRhaW5lclxuICAgICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgIHsuLi5tYXBQcm9wc31cbiAgICAgICAgICAgIG1hcExheWVycz17c3BsaXRNYXBzW2luZGV4XS5sYXllcnN9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSlcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRQbG90Q29udGFpbmVyIGNsYXNzTmFtZT1cImV4cG9ydC1tYXAtaW5zdGFuY2VcIj5cbiAgICAgICAgICA8U3R5bGVkTWFwQ29udGFpbmVyIHJlZj17dGhpcy5wbG90dGluZ0FyZWFSZWZ9IHdpZHRoPXtzaXplLndpZHRofSBoZWlnaHQ9e3NpemUuaGVpZ2h0fT5cbiAgICAgICAgICAgIHttYXBDb250YWluZXJzfVxuICAgICAgICAgIDwvU3R5bGVkTWFwQ29udGFpbmVyPlxuICAgICAgICA8L1N0eWxlZFBsb3RDb250YWluZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIFBsb3RDb250YWluZXIucHJvcHNUeXBlcyA9IHByb3BUeXBlcztcbiAgcmV0dXJuIFBsb3RDb250YWluZXI7XG59XG4iXX0=