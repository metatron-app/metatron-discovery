"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = GeocoderPanelFactory;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

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

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _processors = _interopRequireDefault(require("../processors"));

var _core = require("@deck.gl/core");

var _geoViewport = _interopRequireDefault(require("@mapbox/geo-viewport"));

var _schemas = _interopRequireDefault(require("../schemas"));

var _geocoder = _interopRequireDefault(require("./geocoder/geocoder"));

var _defaultSettings = require("../constants/default-settings");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  top: ", "px;\n  right: ", "px;\n  width: ", "px;\n  box-shadow: ", ";\n  z-index: 100;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var ICON_LAYER = {
  id: _defaultSettings.GEOCODER_LAYER_ID,
  type: 'icon',
  config: {
    label: 'Geocoder Layer',
    color: _defaultSettings.GEOCODER_ICON_COLOR,
    dataId: _defaultSettings.GEOCODER_DATASET_NAME,
    columns: {
      lat: 'lt',
      lng: 'ln',
      icon: 'icon',
      label: 'text'
    },
    isVisible: true,
    hidden: true,
    visConfig: {
      radius: _defaultSettings.GEOCODER_ICON_SIZE
    }
  }
};

var PARSED_CONFIG = _schemas["default"].parseSavedConfig({
  version: 'v1',
  config: {
    visState: {
      layers: [ICON_LAYER]
    }
  }
});

var StyledGeocoderPanel = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.geocoderTop;
}, function (props) {
  return props.theme.geocoderRight;
}, function (props) {
  return Number.isFinite(props.width) ? props.width : props.theme.geocoderWidth;
}, function (props) {
  return props.theme.boxShadow;
});

function generateGeocoderDataset(lat, lon, text) {
  return {
    data: _processors["default"].processRowObject([{
      lt: lat,
      ln: lon,
      icon: 'place',
      text: text
    }]),
    id: _defaultSettings.GEOCODER_DATASET_NAME,
    info: {
      hidden: true,
      id: _defaultSettings.GEOCODER_DATASET_NAME,
      label: _defaultSettings.GEOCODER_DATASET_NAME
    }
  };
}

function isValid(key) {
  return /pk\..*\..*/.test(key);
}

function GeocoderPanelFactory() {
  var GeocoderPanel = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(GeocoderPanel, _Component);

    var _super = _createSuper(GeocoderPanel);

    function GeocoderPanel() {
      var _this;

      (0, _classCallCheck2["default"])(this, GeocoderPanel);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onSelected", function () {
        var viewport = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var geoItem = arguments.length > 1 ? arguments[1] : undefined;

        var _geoItem$center = (0, _slicedToArray2["default"])(geoItem.center, 2),
            lon = _geoItem$center[0],
            lat = _geoItem$center[1],
            text = geoItem.text,
            bbox = geoItem.bbox;

        _this.removeGeocoderDataset();

        _this.props.updateVisData([generateGeocoderDataset(lat, lon, text)], {
          keepExistingConfig: true
        }, PARSED_CONFIG);

        var bounds = bbox || [lon - _defaultSettings.GEOCODER_GEO_OFFSET, lat - _defaultSettings.GEOCODER_GEO_OFFSET, lon + _defaultSettings.GEOCODER_GEO_OFFSET, lat + _defaultSettings.GEOCODER_GEO_OFFSET];

        var _geoViewport$viewport = _geoViewport["default"].viewport(bounds, [_this.props.mapState.width, _this.props.mapState.height]),
            center = _geoViewport$viewport.center,
            zoom = _geoViewport$viewport.zoom;

        _this.props.updateMap({
          latitude: center[1],
          longitude: center[0],
          zoom: zoom,
          pitch: 0,
          bearing: 0,
          transitionDuration: _this.props.transitionDuration,
          transitionInterpolator: new _core.FlyToInterpolator()
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "removeMarker", function () {
        _this.removeGeocoderDataset();
      });
      return _this;
    }

    (0, _createClass2["default"])(GeocoderPanel, [{
      key: "removeGeocoderDataset",
      value: function removeGeocoderDataset() {
        this.props.removeDataset(_defaultSettings.GEOCODER_DATASET_NAME);
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            isGeocoderEnabled = _this$props.isGeocoderEnabled,
            mapboxApiAccessToken = _this$props.mapboxApiAccessToken,
            width = _this$props.width;
        return /*#__PURE__*/_react["default"].createElement(StyledGeocoderPanel, {
          className: "geocoder-panel",
          width: width,
          style: {
            display: isGeocoderEnabled ? 'block' : 'none'
          }
        }, isValid(mapboxApiAccessToken) && /*#__PURE__*/_react["default"].createElement(_geocoder["default"], {
          mapboxApiAccessToken: mapboxApiAccessToken,
          onSelected: this.onSelected,
          onDeleteMarker: this.removeMarker,
          width: width
        }));
      }
    }]);
    return GeocoderPanel;
  }(_react.Component);

  (0, _defineProperty2["default"])(GeocoderPanel, "propTypes", {
    isGeocoderEnabled: _propTypes["default"].bool.isRequired,
    mapboxApiAccessToken: _propTypes["default"].string.isRequired,
    mapState: _propTypes["default"].object.isRequired,
    updateVisData: _propTypes["default"].func.isRequired,
    removeDataset: _propTypes["default"].func.isRequired,
    updateMap: _propTypes["default"].func.isRequired,
    transitionDuration: _propTypes["default"].number,
    width: _propTypes["default"].number
  });
  GeocoderPanel.defaultProps = {
    transitionDuration: 3000
  };
  return GeocoderPanel;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2dlb2NvZGVyLXBhbmVsLmpzIl0sIm5hbWVzIjpbIklDT05fTEFZRVIiLCJpZCIsIkdFT0NPREVSX0xBWUVSX0lEIiwidHlwZSIsImNvbmZpZyIsImxhYmVsIiwiY29sb3IiLCJHRU9DT0RFUl9JQ09OX0NPTE9SIiwiZGF0YUlkIiwiR0VPQ09ERVJfREFUQVNFVF9OQU1FIiwiY29sdW1ucyIsImxhdCIsImxuZyIsImljb24iLCJpc1Zpc2libGUiLCJoaWRkZW4iLCJ2aXNDb25maWciLCJyYWRpdXMiLCJHRU9DT0RFUl9JQ09OX1NJWkUiLCJQQVJTRURfQ09ORklHIiwiS2VwbGVyR2xTY2hlbWEiLCJwYXJzZVNhdmVkQ29uZmlnIiwidmVyc2lvbiIsInZpc1N0YXRlIiwibGF5ZXJzIiwiU3R5bGVkR2VvY29kZXJQYW5lbCIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJnZW9jb2RlclRvcCIsImdlb2NvZGVyUmlnaHQiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIndpZHRoIiwiZ2VvY29kZXJXaWR0aCIsImJveFNoYWRvdyIsImdlbmVyYXRlR2VvY29kZXJEYXRhc2V0IiwibG9uIiwidGV4dCIsImRhdGEiLCJQcm9jZXNzb3JzIiwicHJvY2Vzc1Jvd09iamVjdCIsImx0IiwibG4iLCJpbmZvIiwiaXNWYWxpZCIsImtleSIsInRlc3QiLCJHZW9jb2RlclBhbmVsRmFjdG9yeSIsIkdlb2NvZGVyUGFuZWwiLCJ2aWV3cG9ydCIsImdlb0l0ZW0iLCJjZW50ZXIiLCJiYm94IiwicmVtb3ZlR2VvY29kZXJEYXRhc2V0IiwidXBkYXRlVmlzRGF0YSIsImtlZXBFeGlzdGluZ0NvbmZpZyIsImJvdW5kcyIsIkdFT0NPREVSX0dFT19PRkZTRVQiLCJnZW9WaWV3cG9ydCIsIm1hcFN0YXRlIiwiaGVpZ2h0Iiwiem9vbSIsInVwZGF0ZU1hcCIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwicGl0Y2giLCJiZWFyaW5nIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkludGVycG9sYXRvciIsIkZseVRvSW50ZXJwb2xhdG9yIiwicmVtb3ZlRGF0YXNldCIsImlzR2VvY29kZXJFbmFibGVkIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJkaXNwbGF5Iiwib25TZWxlY3RlZCIsInJlbW92ZU1hcmtlciIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsImJvb2wiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwib2JqZWN0IiwiZnVuYyIsIm51bWJlciIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRQSxJQUFNQSxVQUFVLEdBQUc7QUFDakJDLEVBQUFBLEVBQUUsRUFBRUMsa0NBRGE7QUFFakJDLEVBQUFBLElBQUksRUFBRSxNQUZXO0FBR2pCQyxFQUFBQSxNQUFNLEVBQUU7QUFDTkMsSUFBQUEsS0FBSyxFQUFFLGdCQUREO0FBRU5DLElBQUFBLEtBQUssRUFBRUMsb0NBRkQ7QUFHTkMsSUFBQUEsTUFBTSxFQUFFQyxzQ0FIRjtBQUlOQyxJQUFBQSxPQUFPLEVBQUU7QUFDUEMsTUFBQUEsR0FBRyxFQUFFLElBREU7QUFFUEMsTUFBQUEsR0FBRyxFQUFFLElBRkU7QUFHUEMsTUFBQUEsSUFBSSxFQUFFLE1BSEM7QUFJUFIsTUFBQUEsS0FBSyxFQUFFO0FBSkEsS0FKSDtBQVVOUyxJQUFBQSxTQUFTLEVBQUUsSUFWTDtBQVdOQyxJQUFBQSxNQUFNLEVBQUUsSUFYRjtBQVlOQyxJQUFBQSxTQUFTLEVBQUU7QUFDVEMsTUFBQUEsTUFBTSxFQUFFQztBQURDO0FBWkw7QUFIUyxDQUFuQjs7QUFxQkEsSUFBTUMsYUFBYSxHQUFHQyxvQkFBZUMsZ0JBQWYsQ0FBZ0M7QUFDcERDLEVBQUFBLE9BQU8sRUFBRSxJQUQyQztBQUVwRGxCLEVBQUFBLE1BQU0sRUFBRTtB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QSxLQUFLLEVBQUUzQztBQUpULFVBTkosQ0FERjtBQWdCRDtBQTVFMEM7QUFBQTtBQUFBLElBQ2pCNEMsZ0JBRGlCOztBQUFBLG1DQUN2QzVCLGFBRHVDLGVBRXhCO0FBQ2pCdUIsSUFBQUEsaUJBQWlCLEVBQUVNLHNCQUFVQyxJQUFWLENBQWVDLFVBRGpCO0FBRWpCUCxJQUFBQSxvQkFBb0IsRUFBRUssc0JBQVVHLE1BQVYsQ0FBaUJELFVBRnRCO0FBR2pCcEIsSUFBQUEsUUFBUSxFQUFFa0Isc0JBQVVJLE1BQVYsQ0FBaUJGLFVBSFY7QUFJakJ6QixJQUFBQSxhQUFhLEVBQUV1QixzQkFBVUssSUFBVixDQUFlSCxVQUpiO0FBS2pCVCxJQUFBQSxhQUFhLEVBQUVPLHNCQUFVSyxJQUFWLENBQWVILFVBTGI7QUFNakJqQixJQUFBQSxTQUFTLEVBQUVlLHNCQUFVSyxJQUFWLENBQWVILFVBTlQ7QUFRakJaLElBQUFBLGtCQUFrQixFQUFFVSxzQkFBVU0sTUFSYjtBQVNqQm5ELElBQUFBLEtBQUssRUFBRTZDLHNCQUFVTTtBQVRBLEdBRndCO0FBK0U3Q25DLEVBQUFBLGFBQWEsQ0FBQ29DLFlBQWQsR0FBNkI7QUFDM0JqQixJQUFBQSxrQkFBa0IsRUFBRTtBQURPLEdBQTdCO0FBSUEsU0FBT25CLGFBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IFByb2Nlc3NvcnMgZnJvbSAncHJvY2Vzc29ycyc7XG5pbXBvcnQge0ZseVRvSW50ZXJwb2xhdG9yfSBmcm9tICdAZGVjay5nbC9jb3JlJztcbmltcG9ydCBnZW9WaWV3cG9ydCBmcm9tICdAbWFwYm94L2dlby12aWV3cG9ydCc7XG5pbXBvcnQgS2VwbGVyR2xTY2hlbWEgZnJvbSAnc2NoZW1hcyc7XG5cbmltcG9ydCBHZW9jb2RlciBmcm9tICcuL2dlb2NvZGVyL2dlb2NvZGVyJztcbmltcG9ydCB7XG4gIEdFT0NPREVSX0RBVEFTRVRfTkFNRSxcbiAgR0VPQ09ERVJfTEFZRVJfSUQsXG4gIEdFT0NPREVSX0dFT19PRkZTRVQsXG4gIEdFT0NPREVSX0lDT05fQ09MT1IsXG4gIEdFT0NPREVSX0lDT05fU0laRVxufSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5cbmNvbnN0IElDT05fTEFZRVIgPSB7XG4gIGlkOiBHRU9DT0RFUl9MQVlFUl9JRCxcbiAgdHlwZTogJ2ljb24nLFxuICBjb25maWc6IHtcbiAgICBsYWJlbDogJ0dlb2NvZGVyIExheWVyJyxcbiAgICBjb2xvcjogR0VPQ09ERVJfSUNPTl9DT0xPUixcbiAgICBkYXRhSWQ6IEdFT0NPREVSX0RBVEFTRVRfTkFNRSxcbiAgICBjb2x1bW5zOiB7XG4gICAgICBsYXQ6ICdsdCcsXG4gICAgICBsbmc6ICdsbicsXG4gICAgICBpY29uOiAnaWNvbicsXG4gICAgICBsYWJlbDogJ3RleHQnXG4gICAgfSxcbiAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgaGlkZGVuOiB0cnVlLFxuICAgIHZpc0NvbmZpZzoge1xuICAgICAgcmFkaXVzOiBHRU9DT0RFUl9JQ09OX1NJWkVcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IFBBUlNFRF9DT05GSUcgPSBLZXBsZXJHbFNjaGVtYS5wYXJzZVNhdmVkQ29uZmlnKHtcbiAgdmVyc2lvbjogJ3YxJyxcbiAgY29uZmlnOiB7XG4gICAgdmlzU3RhdGU6IHtcbiAgICAgIGxheWVyczogW0lDT05fTEFZRVJdXG4gICAgfVxuICB9XG59KTtcblxuY29uc3QgU3R5bGVkR2VvY29kZXJQYW5lbCA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmdlb2NvZGVyVG9wfXB4O1xuICByaWdodDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5nZW9jb2RlclJpZ2h0fXB4O1xuICB3aWR0aDogJHtwcm9wcyA9PiAoTnVtYmVyLmlzRmluaXRlKHByb3BzLndpZHRoKSA/IHByb3BzLndpZHRoIDogcHJvcHMudGhlbWUuZ2VvY29kZXJXaWR0aCl9cHg7XG4gIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuYm94U2hhZG93fTtcbiAgei1pbmRleDogMTAwO1xuYDtcblxuZnVuY3Rpb24gZ2VuZXJhdGVHZW9jb2RlckRhdGFzZXQobGF0LCBsb24sIHRleHQpIHtcbiAgcmV0dXJuIHtcbiAgICBkYXRhOiBQcm9jZXNzb3JzLnByb2Nlc3NSb3dPYmplY3QoW1xuICAgICAge1xuICAgICAgICBsdDogbGF0LFxuICAgICAgICBsbjogbG9uLFxuICAgICAgICBpY29uOiAncGxhY2UnLFxuICAgICAgICB0ZXh0XG4gICAgICB9XG4gICAgXSksXG4gICAgaWQ6IEdFT0NPREVSX0RBVEFTRVRfTkFNRSxcbiAgICBpbmZvOiB7XG4gICAgICBoaWRkZW46IHRydWUsXG4gICAgICBpZDogR0VPQ09ERVJfREFUQVNFVF9OQU1FLFxuICAgICAgbGFiZWw6IEdFT0NPREVSX0RBVEFTRVRfTkFNRVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZChrZXkpIHtcbiAgcmV0dXJuIC9wa1xcLi4qXFwuLiovLnRlc3Qoa2V5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2VvY29kZXJQYW5lbEZhY3RvcnkoKSB7XG4gIGNsYXNzIEdlb2NvZGVyUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBpc0dlb2NvZGVyRW5hYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICAgIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICBtYXBTdGF0ZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgdXBkYXRlVmlzRGF0YTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHJlbW92ZURhdGFzZXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICB1cGRhdGVNYXA6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyXG4gICAgfTtcblxuICAgIHJlbW92ZUdlb2NvZGVyRGF0YXNldCgpIHtcbiAgICAgIHRoaXMucHJvcHMucmVtb3ZlRGF0YXNldChHRU9DT0RFUl9EQVRBU0VUX05BTUUpO1xuICAgIH1cblxuICAgIG9uU2VsZWN0ZWQgPSAodmlld3BvcnQgPSBudWxsLCBnZW9JdGVtKSA9PiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGNlbnRlcjogW2xvbiwgbGF0XSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgYmJveFxuICAgICAgfSA9IGdlb0l0ZW07XG4gICAgICB0aGlzLnJlbW92ZUdlb2NvZGVyRGF0YXNldCgpO1xuICAgICAgdGhpcy5wcm9wcy51cGRhdGVWaXNEYXRhKFxuICAgICAgICBbZ2VuZXJhdGVHZW9jb2RlckRhdGFzZXQobGF0LCBsb24sIHRleHQpXSxcbiAgICAgICAge1xuICAgICAgICAgIGtlZXBFeGlzdGluZ0NvbmZpZzogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBQQVJTRURfQ09ORklHXG4gICAgICApO1xuICAgICAgY29uc3QgYm91bmRzID0gYmJveCB8fCBbXG4gICAgICAgIGxvbiAtIEdFT0NPREVSX0dFT19PRkZTRVQsXG4gICAgICAgIGxhdCAtIEdFT0NPREVSX0dFT19PRkZTRVQsXG4gICAgICAgIGxvbiArIEdFT0NPREVSX0dFT19PRkZTRVQsXG4gICAgICAgIGxhdCArIEdFT0NPREVSX0dFT19PRkZTRVRcbiAgICAgIF07XG4gICAgICBjb25zdCB7Y2VudGVyLCB6b29tfSA9IGdlb1ZpZXdwb3J0LnZpZXdwb3J0KGJvdW5kcywgW1xuICAgICAgICB0aGlzLnByb3BzLm1hcFN0YXRlLndpZHRoLFxuICAgICAgICB0aGlzLnByb3BzLm1hcFN0YXRlLmhlaWdodFxuICAgICAgXSk7XG5cbiAgICAgIHRoaXMucHJvcHMudXBkYXRlTWFwKHtcbiAgICAgICAgbGF0aXR1ZGU6IGNlbnRlclsxXSxcbiAgICAgICAgbG9uZ2l0dWRlOiBjZW50ZXJbMF0sXG4gICAgICAgIHpvb20sXG4gICAgICAgIHBpdGNoOiAwLFxuICAgICAgICBiZWFyaW5nOiAwLFxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IHRoaXMucHJvcHMudHJhbnNpdGlvbkR1cmF0aW9uLFxuICAgICAgICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiBuZXcgRmx5VG9JbnRlcnBvbGF0b3IoKVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbW92ZU1hcmtlciA9ICgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlR2VvY29kZXJEYXRhc2V0KCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtpc0dlb2NvZGVyRW5hYmxlZCwgbWFwYm94QXBpQWNjZXNzVG9rZW4sIHdpZHRofSA9IHRoaXMucHJvcHM7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8U3R5bGVkR2VvY29kZXJQYW5lbFxuICAgICAgICAgIGNsYXNzTmFtZT1cImdlb2NvZGVyLXBhbmVsXCJcbiAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgc3R5bGU9e3tkaXNwbGF5OiBpc0dlb2NvZGVyRW5hYmxlZCA/ICdibG9jaycgOiAnbm9uZSd9fVxuICAgICAgICA+XG4gICAgICAgICAge2lzVmFsaWQobWFwYm94QXBpQWNjZXNzVG9rZW4pICYmIChcbiAgICAgICAgICAgIDxHZW9jb2RlclxuICAgICAgICAgICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbj17bWFwYm94QXBpQWNjZXNzVG9rZW59XG4gICAgICAgICAgICAgIG9uU2VsZWN0ZWQ9e3RoaXMub25TZWxlY3RlZH1cbiAgICAgICAgICAgICAgb25EZWxldGVNYXJrZXI9e3RoaXMucmVtb3ZlTWFya2VyfVxuICAgICAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvU3R5bGVkR2VvY29kZXJQYW5lbD5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgR2VvY29kZXJQYW5lbC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAzMDAwXG4gIH07XG5cbiAgcmV0dXJuIEdlb2NvZGVyUGFuZWw7XG59XG4iXX0=