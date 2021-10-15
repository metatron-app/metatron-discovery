"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _base = _interopRequireDefault(require("../../components/common/icons/base"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var PointLayerIcon = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(PointLayerIcon, _Component);

  var _super = _createSuper(PointLayerIcon);

  function PointLayerIcon() {
    (0, _classCallCheck2["default"])(this, PointLayerIcon);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(PointLayerIcon, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_base["default"], this.props, /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "29.4",
        cy: "31.6",
        r: "8.4",
        className: "cr1"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "48.5",
        cy: "15.7",
        r: "6.5",
        className: "cr2"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "11",
        cy: "44.2",
        r: "3",
        className: "cr3"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "50",
        cy: "44.2",
        r: "5",
        className: "cr4"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "34",
        cy: "54.2",
        r: "3",
        className: "cr5"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "14",
        cy: "16.2",
        r: "4",
        className: "cr6"
      }));
    }
  }]);
  return PointLayerIcon;
}(_react.Component);

(0, _defineProperty2["default"])(PointLayerIcon, "propTypes", {
  height: _propTypes["default"].string,
  colors: _propTypes["default"].arrayOf(_propTypes["default"].string)
});
(0, _defineProperty2["default"])(PointLayerIcon, "defaultProps", {
  height: '16px',
  predefinedClassName: 'point-layer-icon',
  totalColor: 6
});
var _default = PointLayerIcon;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvcG9pbnQtbGF5ZXIvcG9pbnQtbGF5ZXItaWNvbi5qcyJdLCJuYW1lcyI6WyJQb2ludExheWVySWNvbiIsInByb3BzIiwiQ29tcG9uZW50IiwiaGVpZ2h0IiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiY29sb3JzIiwiYXJyYXlPZiIsInByZWRlZmluZWRDbGFzc05hbWUiLCJ0b3RhbENvbG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7O0lBRU1BLGM7Ozs7Ozs7Ozs7Ozs2QkFZSztBQUNQLDBCQUNFLGdDQUFDLGdCQUFELEVBQVUsS0FBS0MsS0FBZixlQUNFO0FBQVEsUUFBQSxFQUFFLEVBQUMsTUFBWDtBQUFrQixRQUFBLEVBQUUsRUFBQyxNQUFyQjtBQUE0QixRQUFBLENBQUMsRUFBQyxLQUE5QjtBQUFvQyxRQUFBLFNBQVMsRUFBQztBQUE5QyxRQURGLGVBRUU7QUFBUSxRQUFBLEVBQUUsRUFBQyxNQUFYO0FBQWtCLFFBQUEsRUFBRSxFQUFDLE1BQXJCO0FBQTRCLFFBQUEsQ0FBQyxFQUFDLEtBQTlCO0FBQW9DLFFBQUEsU0FBUyxFQUFDO0FBQTlDLFFBRkYsZUFHRTtBQUFRLFFBQUEsRUFBRSxFQUFDLElBQVg7QUFBZ0IsUUFBQSxFQUFFLEVBQUMsTUFBbkI7QUFBMEIsUUFBQSxDQUFDLEVBQUMsR0FBNUI7QUFBZ0MsUUFBQSxTQUFTLEVBQUM7QUFBMUMsUUFIRixlQUlFO0FBQVEsUUFBQSxFQUFFLEVBQUMsSUFBWDtBQUFnQixRQUFBLEVBQUUsRUFBQyxNQUFuQjtBQUEwQixRQUFBLENBQUMsRUFBQyxHQUE1QjtBQUFnQyxRQUFBLFNBQVMsRUFBQztBQUExQyxRQUpGLGVBS0U7QUFBUSxRQUFBLEVBQUUsRUFBQyxJQUFYO0FBQWdCLFFBQUEsRUFBRSxFQUFDLE1BQW5CO0FBQTBCLFFBQUEsQ0FBQyxFQUFDLEdBQTVCO0FBQWdDLFFBQUEsU0FBUyxFQUFDO0FBQTFDLFFBTEYsZUFNRTtBQUFRLFFBQUEsRUFBRSxFQUFDLElBQVg7QUFBZ0IsUUFBQSxFQUFFLEVBQUMsTUFBbkI7QUFBMEIsUUFBQSxDQUFDLEVBQUMsR0FBNUI7QUFBZ0MsUUFBQSxTQUFTLEVBQUM7QUFBMUMsUUFORixDQURGO0FBVUQ7OztFQXZCMEJDLGdCOztpQ0FBdkJGLGMsZUFDZTtBQUNqQkcsRUFBQUEsTUFBTSxFQUFFQyxzQkFBVUMsTUFERDtBQUVqQkMsRUFBQUEsTUFBTSxFQUFFRixzQkFBVUcsT0FBVixDQUFrQkgsc0JBQVVDLE1BQTVCO0FBRlMsQztpQ0FEZkwsYyxrQkFNa0I7QUFDcEJHLEVBQUFBLE1BQU0sRUFBRSxNQURZO0FBRXBCSyxFQUFBQSxtQkFBbUIsRUFBRSxrQkFGRDtBQUdwQkMsRUFBQUEsVUFBVSxFQUFFO0FBSFEsQztlQW9CVFQsYyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBCYXNlIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zL2Jhc2UnO1xuXG5jbGFzcyBQb2ludExheWVySWNvbiBleHRlbmRzIENvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNvbG9yczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZylcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGhlaWdodDogJzE2cHgnLFxuICAgIHByZWRlZmluZWRDbGFzc05hbWU6ICdwb2ludC1sYXllci1pY29uJyxcbiAgICB0b3RhbENvbG9yOiA2XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8QmFzZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIDxjaXJjbGUgY3g9XCIyOS40XCIgY3k9XCIzMS42XCIgcj1cIjguNFwiIGNsYXNzTmFtZT1cImNyMVwiIC8+XG4gICAgICAgIDxjaXJjbGUgY3g9XCI0OC41XCIgY3k9XCIxNS43XCIgcj1cIjYuNVwiIGNsYXNzTmFtZT1cImNyMlwiIC8+XG4gICAgICAgIDxjaXJjbGUgY3g9XCIxMVwiIGN5PVwiNDQuMlwiIHI9XCIzXCIgY2xhc3NOYW1lPVwiY3IzXCIgLz5cbiAgICAgICAgPGNpcmNsZSBjeD1cIjUwXCIgY3k9XCI0NC4yXCIgcj1cIjVcIiBjbGFzc05hbWU9XCJjcjRcIiAvPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMzRcIiBjeT1cIjU0LjJcIiByPVwiM1wiIGNsYXNzTmFtZT1cImNyNVwiIC8+XG4gICAgICAgIDxjaXJjbGUgY3g9XCIxNFwiIGN5PVwiMTYuMlwiIHI9XCI0XCIgY2xhc3NOYW1lPVwiY3I2XCIgLz5cbiAgICAgIDwvQmFzZT5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBvaW50TGF5ZXJJY29uO1xuIl19