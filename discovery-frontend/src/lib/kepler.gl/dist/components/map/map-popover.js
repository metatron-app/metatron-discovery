"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = MapPopoverFactory;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _layerHoverInfo = _interopRequireDefault(require("./layer-hover-info"));

var _coordinateInfo = _interopRequireDefault(require("./coordinate-info"));

var _icons = require("../common/icons");

var _errorBoundary = _interopRequireDefault(require("../common/error-boundary"));

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  left: 50%;\n  transform: rotate(30deg);\n  top: 10px;\n  color: ", ";\n\n  &.popover-arrow-left {\n    left: 40%;\n    transform: rotate(0deg);\n  }\n\n  &.popover-arrow-right {\n    left: 60%;\n    transform: rotate(0deg);\n  }\n\n  :hover {\n    cursor: pointer;\n    color: ", ";\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n  font-size: 11px;\n  font-weight: 500;\n  background-color: ", ";\n  color: ", ";\n  z-index: 1000;\n  position: absolute;\n  overflow-x: auto;\n  box-shadow: ", ";\n\n  :hover {\n    background-color: ", ";\n  }\n\n  .gutter {\n    height: 6px;\n    margin-bottom: 20px;\n  }\n\n  .primary-label {\n    color: ", ";\n    position: absolute;\n    right: 18px;\n    top: 10px;\n    font-size: 10px;\n  }\n\n  table {\n    margin: 2px 12px 12px 12px;\n    width: auto;\n\n    tbody {\n      border-top: transparent;\n      border-bottom: transparent;\n    }\n\n    td {\n      border-color: transparent;\n      padding: 4px;\n      color: ", ";\n    }\n\n    td.row__value {\n      text-align: right;\n      font-weight: 500;\n      color: ", ";\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var MAX_WIDTH = 500;
var MAX_HEIGHT = 600;

var StyledMapPopover = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.scrollBar;
}, function (props) {
  return props.theme.panelBackground;
}, function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.panelBoxShadow;
}, function (props) {
  return "".concat(props.theme.panelBackground, "dd");
}, function (props) {
  return props.theme.notificationColors.success;
}, function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.textColorHl;
});

var StyledIcon = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.primaryBtnBgd;
}, function (props) {
  return props.theme.linkBtnColor;
});

MapPopoverFactory.deps = [_layerHoverInfo["default"], _coordinateInfo["default"]];

function MapPopoverFactory(LayerHoverInfo, CoordinateInfo) {
  var MapPopover = /*#__PURE__*/function (_PureComponent) {
    (0, _inherits2["default"])(MapPopover, _PureComponent);

    var _super = _createSuper(MapPopover);

    function MapPopover(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapPopover);
      _this = _super.call(this, props);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "popover", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "moveLeft", function () {
        _this.setState({
          isLeft: true
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "moveRight", function () {
        _this.setState({
          isLeft: false
        });
      });
      _this.state = {
        width: 380,
        height: 160,
        isLeft: false
      };
      return _this;
    }

    (0, _createClass2["default"])(MapPopover, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._setContainerSize();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        this._setContainerSize();
      }
    }, {
      key: "_setContainerSize",
      value: function _setContainerSize() {
        var node = this.popover.current;

        if (!node) {
          return;
        }

        var width = Math.min(Math.round(node.scrollWidth), MAX_WIDTH);
        var height = Math.min(Math.round(node.scrollHeight), MAX_HEIGHT);

        if (width !== this.state.width || height !== this.state.height) {
          this.setState({
            width: width,
            height: height
          });
        }
      }
    }, {
      key: "_getPosition",
      value: function _getPosition(x, y, isLeft) {
        var topOffset = 20;
        var leftOffset = 20;
        var _this$props = this.props,
            mapW = _this$props.mapW,
            mapH = _this$props.mapH;
        var _this$state = this.state,
            width = _this$state.width,
            height = _this$state.height;
        var pos = {};

        if (x + leftOffset + width > mapW || isLeft) {
          pos.right = mapW - x + leftOffset;
        } else {
          pos.left = x + leftOffset;
        }

        if (y + topOffset + height > mapH) {
          pos.bottom = 10;
        } else {
          pos.top = y + topOffset;
        }

        return pos;
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props2 = this.props,
            x = _this$props2.x,
            y = _this$props2.y,
            frozen = _this$props2.frozen,
            coordinate = _this$props2.coordinate,
            layerHoverProp = _this$props2.layerHoverProp,
            isBase = _this$props2.isBase,
            zoom = _this$props2.zoom;
        var isLeft = this.state.isLeft;
        var style = Number.isFinite(x) && Number.isFinite(y) ? this._getPosition(x, y, isLeft) : {};
        return /*#__PURE__*/_react["default"].createElement(_errorBoundary["default"], null, /*#__PURE__*/_react["default"].createElement(StyledMapPopover, {
          ref: this.popover,
          className: "map-popover",
          style: _objectSpread(_objectSpread({}, style), {}, {
            maxWidth: MAX_WIDTH
          })
        }, frozen ? /*#__PURE__*/_react["default"].createElement("div", {
          className: "map-popover__top"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "gutter"
        }), !isLeft && /*#__PURE__*/_react["default"].createElement(StyledIcon, {
          className: "popover-arrow-left",
          onClick: this.moveLeft
        }, /*#__PURE__*/_react["default"].createElement(_icons.ArrowLeft, null)), /*#__PURE__*/_react["default"].createElement(StyledIcon, {
          className: "popover-pin",
          onClick: this.props.onClose
        }, /*#__PURE__*/_react["default"].createElement(_icons.Pin, {
          height: "16px"
        })), isLeft && /*#__PURE__*/_react["default"].createElement(StyledIcon, {
          className: "popover-arrow-right",
          onClick: this.moveRight
        }, /*#__PURE__*/_react["default"].createElement(_icons.ArrowRight, null)), isBase && /*#__PURE__*/_react["default"].createElement("div", {
          className: "primary-label"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: "mapPopover.primary"
        }))) : null, Array.isArray(coordinate) && /*#__PURE__*/_react["default"].createElement(CoordinateInfo, {
          coordinate: coordinate,
          zoom: zoom
        }), layerHoverProp && /*#__PURE__*/_react["default"].createElement(LayerHoverInfo, layerHoverProp)));
      }
    }]);
    return MapPopover;
  }(_react.PureComponent);

  (0, _defineProperty2["default"])(MapPopover, "propTypes", {
    layerHoverProp: _propTypes["default"].object,
    coordinate: _propTypes["default"].oneOfType([_propTypes["default"].array, _propTypes["default"].bool]),
    frozen: _propTypes["default"].bool,
    x: _propTypes["default"].number,
    y: _propTypes["default"].number,
    z: _propTypes["default"].number,
    mapW: _propTypes["default"].number.isRequired,
    mapH: _propTypes["default"].number.isRequired,
    onClose: _propTypes["default"].func.isRequired,
    isBase: _propTypes["default"].bool
  });
  return (0, _reactIntl.injectIntl)(MapPopover);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21hcC9tYXAtcG9wb3Zlci5qcyJdLCJuYW1lcyI6WyJNQVhfV0lEVEgiLCJNQVhfSEVJR0hUIiwiU3R5bGVkTWFwUG9wb3ZlciIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJzY3JvbGxCYXIiLCJwYW5lbEJhY2tncm91bmQiLCJ0ZXh0Q29sb3IiLCJwYW5lbEJveFNoYWRvdyIsIm5vdGlmaWNhdGlvbkNvbG9ycyIsInN1Y2Nlc3MiLCJ0ZXh0Q29sb3JIbCIsIlN0eWxlZEljb24iLCJwcmltYXJ5QnRuQmdkIiwibGlua0J0bkNvbG9yIiwiTWFwUG9wb3ZlckZhY3RvcnkiLCJkZXBzIiwiTGF5ZXJIb3ZlckluZm9GYWN0b3J5IiwiQ29vcmRpbmF0ZUluZm9GYWN0b3J5IiwiTGF5ZXJIb3ZlckluZm8iLCJDb29yZGluYXRlSW5mbyIsIk1hcFBvcG92ZXIiLCJzZXRTdGF0ZSIsImlzTGVmdCIsInN0YXRlIiwid2lkdGgiLCJoZWlnaHQiLCJfc2V0Q29udGFpbmVyU2l6ZSIsIm5vZGUiLCJwb3BvdmVyIiwiY3VycmVudCIsIk1hdGgiLCJtaW4iLCJyb3VuZCIsInNjcm9sbFdpZHRoIiwic2Nyb2xsSGVpZ2h0IiwieCIsInkiLCJ0b3BPZmZzZXQiLCJsZWZ0T2Zmc2V0IiwibWFwVyIsIm1hcEgiLCJwb3MiLCJyaWdodCIsImxlZnQiLCJib3R0b20iLCJ0b3AiLCJmcm96ZW4iLCJjb29yZGluYXRlIiwibGF5ZXJIb3ZlclByb3AiLCJpc0Jhc2UiLCJ6b29tIiwic3R5bGUiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIl9nZXRQb3NpdGlvbiIsIm1heFdpZHRoIiwibW92ZUxlZnQiLCJvbkNsb3NlIiwibW92ZVJpZ2h0IiwiQXJyYXkiLCJpc0FycmF5IiwiUHVyZUNvbXBvbmVudCIsIlByb3BUeXBlcyIsIm9iamVjdCIsIm9uZU9mVHlwZSIsImFycmF5IiwiYm9vbCIsIm51bWJlciIsInoiLCJpc1JlcXVpcmVkIiwi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QjVCLElBQUFBLElBQUksRUFBRXVCLHNCQUFVSyxNQUFWLENBQWlCRSxVQVBOO0FBUWpCN0IsSUFBQUEsSUFBSSxFQUFFc0Isc0JBQVVLLE1BQVYsQ0FBaUJFLFVBUk47QUFTakJaLElBQUFBLE9BQU8sRUFBRUssc0JBQVVRLElBQVYsQ0FBZUQsVUFUUDtBQVVqQnBCLElBQUFBLE1BQU0sRUFBRWEsc0JBQVVJO0FBVkQsR0FGbUQ7QUE0SHhFLFNBQU8sMkJBQVc5QyxVQUFYLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge1B1cmVDb21wb25lbnQsIGNyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IExheWVySG92ZXJJbmZvRmFjdG9yeSBmcm9tICcuL2xheWVyLWhvdmVyLWluZm8nO1xuaW1wb3J0IENvb3JkaW5hdGVJbmZvRmFjdG9yeSBmcm9tICcuL2Nvb3JkaW5hdGUtaW5mbyc7XG5pbXBvcnQge1BpbiwgQXJyb3dMZWZ0LCBBcnJvd1JpZ2h0fSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9lcnJvci1ib3VuZGFyeSc7XG5pbXBvcnQge2luamVjdEludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBNQVhfV0lEVEggPSA1MDA7XG5jb25zdCBNQVhfSEVJR0hUID0gNjAwO1xuXG5jb25zdCBTdHlsZWRNYXBQb3BvdmVyID0gc3R5bGVkLmRpdmBcbiAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zY3JvbGxCYXJ9O1xuICBmb250LXNpemU6IDExcHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCYWNrZ3JvdW5kfTtcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbiAgei1pbmRleDogMTAwMDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBvdmVyZmxvdy14OiBhdXRvO1xuICBib3gtc2hhZG93OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnBhbmVsQm94U2hhZG93fTtcblxuICA6aG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gYCR7cHJvcHMudGhlbWUucGFuZWxCYWNrZ3JvdW5kfWRkYH07XG4gIH1cblxuICAuZ3V0dGVyIHtcbiAgICBoZWlnaHQ6IDZweDtcbiAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICB9XG5cbiAgLnByaW1hcnktbGFiZWwge1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLm5vdGlmaWNhdGlvbkNvbG9ycy5zdWNjZXNzfTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgcmlnaHQ6IDE4cHg7XG4gICAgdG9wOiAxMHB4O1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgfVxuXG4gIHRhYmxlIHtcbiAgICBtYXJnaW46IDJweCAxMnB4IDEycHggMTJweDtcbiAgICB3aWR0aDogYXV0bztcblxuICAgIHRib2R5IHtcbiAgICAgIGJvcmRlci10b3A6IHRyYW5zcGFyZW50O1xuICAgICAgYm9yZGVyLWJvdHRvbTogdHJhbnNwYXJlbnQ7XG4gICAgfVxuXG4gICAgdGQge1xuICAgICAgYm9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgIHBhZGRpbmc6IDRweDtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gICAgfVxuXG4gICAgdGQucm93X192YWx1ZSB7XG4gICAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JIbH07XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBTdHlsZWRJY29uID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiA1MCU7XG4gIHRyYW5zZm9ybTogcm90YXRlKDMwZGVnKTtcbiAgdG9wOiAxMHB4O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wcmltYXJ5QnRuQmdkfTtcblxuICAmLnBvcG92ZXItYXJyb3ctbGVmdCB7XG4gICAgbGVmdDogNDAlO1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICB9XG5cbiAgJi5wb3BvdmVyLWFycm93LXJpZ2h0IHtcbiAgICBsZWZ0OiA2MCU7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gIH1cblxuICA6aG92ZXIge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5saW5rQnRuQ29sb3J9O1xuICB9XG5gO1xuXG5NYXBQb3BvdmVyRmFjdG9yeS5kZXBzID0gW0xheWVySG92ZXJJbmZvRmFjdG9yeSwgQ29vcmRpbmF0ZUluZm9GYWN0b3J5XTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFwUG9wb3ZlckZhY3RvcnkoTGF5ZXJIb3ZlckluZm8sIENvb3JkaW5hdGVJbmZvKSB7XG4gIGNsYXNzIE1hcFBvcG92ZXIgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgbGF5ZXJIb3ZlclByb3A6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICBjb29yZGluYXRlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuYXJyYXksIFByb3BUeXBlcy5ib29sXSksXG4gICAgICBmcm96ZW46IFByb3BUeXBlcy5ib29sLFxuICAgICAgeDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHk6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgICB6OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgbWFwVzogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgbWFwSDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGlzQmFzZTogUHJvcFR5cGVzLmJvb2xcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHdpZHRoOiAzODAsXG4gICAgICAgIGhlaWdodDogMTYwLFxuICAgICAgICBpc0xlZnQ6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fc2V0Q29udGFpbmVyU2l6ZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgIHRoaXMuX3NldENvbnRhaW5lclNpemUoKTtcbiAgICB9XG5cbiAgICBwb3BvdmVyID0gY3JlYXRlUmVmKCk7XG5cbiAgICBfc2V0Q29udGFpbmVyU2l6ZSgpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnBvcG92ZXIuY3VycmVudDtcbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4oTWF0aC5yb3VuZChub2RlLnNjcm9sbFdpZHRoKSwgTUFYX1dJRFRIKTtcbiAgICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWluKE1hdGgucm91bmQobm9kZS5zY3JvbGxIZWlnaHQpLCBNQVhfSEVJR0hUKTtcblxuICAgICAgaWYgKHdpZHRoICE9PSB0aGlzLnN0YXRlLndpZHRoIHx8IGhlaWdodCAhPT0gdGhpcy5zdGF0ZS5oZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7d2lkdGgsIGhlaWdodH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQb3NpdGlvbih4LCB5LCBpc0xlZnQpIHtcbiAgICAgIGNvbnN0IHRvcE9mZnNldCA9IDIwO1xuICAgICAgY29uc3QgbGVmdE9mZnNldCA9IDIwO1xuICAgICAgY29uc3Qge21hcFcsIG1hcEh9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCBwb3MgPSB7fTtcbiAgICAgIGlmICh4ICsgbGVmdE9mZnNldCArIHdpZHRoID4gbWFwVyB8fCBpc0xlZnQpIHtcbiAgICAgICAgcG9zLnJpZ2h0ID0gbWFwVyAtIHggKyBsZWZ0T2Zmc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zLmxlZnQgPSB4ICsgbGVmdE9mZnNldDtcbiAgICAgIH1cblxuICAgICAgaWYgKHkgKyB0b3BPZmZzZXQgKyBoZWlnaHQgPiBtYXBIKSB7XG4gICAgICAgIHBvcy5ib3R0b20gPSAxMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcy50b3AgPSB5ICsgdG9wT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcG9zO1xuICAgIH1cblxuICAgIG1vdmVMZWZ0ID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNMZWZ0OiB0cnVlfSk7XG4gICAgfTtcblxuICAgIG1vdmVSaWdodCA9ICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzTGVmdDogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge3gsIHksIGZyb3plbiwgY29vcmRpbmF0ZSwgbGF5ZXJIb3ZlclByb3AsIGlzQmFzZSwgem9vbX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3Qge2lzTGVmdH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICBjb25zdCBzdHlsZSA9IE51bWJlci5pc0Zpbml0ZSh4KSAmJiBOdW1iZXIuaXNGaW5pdGUoeSkgPyB0aGlzLl9nZXRQb3NpdGlvbih4LCB5LCBpc0xlZnQpIDoge307XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgIDxTdHlsZWRNYXBQb3BvdmVyXG4gICAgICAgICAgICByZWY9e3RoaXMucG9wb3Zlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1hcC1wb3BvdmVyXCJcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLnN0eWxlLFxuICAgICAgICAgICAgICBtYXhXaWR0aDogTUFYX1dJRFRIXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtmcm96ZW4gPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwLXBvcG92ZXJfX3RvcFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3V0dGVyXCIgLz5cbiAgICAgICAgICAgICAgICB7IWlzTGVmdCAmJiAoXG4gICAgICAgICAgICAgICAgICA8U3R5bGVkSWNvbiBjbGFzc05hbWU9XCJwb3BvdmVyLWFycm93LWxlZnRcIiBvbkNsaWNrPXt0aGlzLm1vdmVMZWZ0fT5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93TGVmdCAvPlxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRJY29uPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPFN0eWxlZEljb24gY2xhc3NOYW1lPVwicG9wb3Zlci1waW5cIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xvc2V9PlxuICAgICAgICAgICAgICAgICAgPFBpbiBoZWlnaHQ9XCIxNnB4XCIgLz5cbiAgICAgICAgICAgICAgICA8L1N0eWxlZEljb24+XG4gICAgICAgICAgICAgICAge2lzTGVmdCAmJiAoXG4gICAgICAgICAgICAgICAgICA8U3R5bGVkSWNvbiBjbGFzc05hbWU9XCJwb3BvdmVyLWFycm93LXJpZ2h0XCIgb25DbGljaz17dGhpcy5tb3ZlUmlnaHR9PlxuICAgICAgICAgICAgICAgICAgICA8QXJyb3dSaWdodCAvPlxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRJY29uPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAge2lzQmFzZSAmJiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByaW1hcnktbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9XCJtYXBQb3BvdmVyLnByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIHtBcnJheS5pc0FycmF5KGNvb3JkaW5hdGUpICYmIDxDb29yZGluYXRlSW5mbyBjb29yZGluYXRlPXtjb29yZGluYXRlfSB6b29tPXt6b29tfSAvPn1cbiAgICAgICAgICAgIHtsYXllckhvdmVyUHJvcCAmJiA8TGF5ZXJIb3ZlckluZm8gey4uLmxheWVySG92ZXJQcm9wfSAvPn1cbiAgICAgICAgICA8L1N0eWxlZE1hcFBvcG92ZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluamVjdEludGwoTWFwUG9wb3Zlcik7XG59XG4iXX0=