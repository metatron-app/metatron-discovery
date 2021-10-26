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

var ClusterLayerIcon = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(ClusterLayerIcon, _Component);

  var _super = _createSuper(ClusterLayerIcon);

  function ClusterLayerIcon() {
    (0, _classCallCheck2["default"])(this, ClusterLayerIcon);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ClusterLayerIcon, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_base["default"], this.props, /*#__PURE__*/_react["default"].createElement("path", {
        d: "M13.6,22.7c2.9-3.6,4.4-6.3,4.4-8c0-2.7-2.2-4.9-4.9-4.9S8.2,12,8.2,14.7c0,1.7,1.5,4.4,4.4,8l0,0 C12.8,23,13.2,23,13.6,22.7C13.5,22.8,13.6,22.7,13.6,22.7z",
        className: "cr1"
      }), /*#__PURE__*/_react["default"].createElement("path", {
        d: "M22.9,57.4c2.5-3.1,3.8-5.5,3.8-7c0-2.4-2-4.4-4.4-4.4S18,48,18,50.4c0,1.5,1.3,3.8,3.8,7l0,0 c0.3,0.3,0.7,0.4,1,0.1C22.9,57.4,22.9,57.4,22.9,57.4z",
        className: "cr2"
      }), /*#__PURE__*/_react["default"].createElement("path", {
        d: "M51.4,22.5c2.8-3.4,4.2-6,4.2-7.6c0-2.6-2.1-4.8-4.8-4.8c-2.6,0-4.8,2.1-4.8,4.8c0,1.6,1.4,4.2,4.2,7.6 l0,0c0.3,0.3,0.8,0.4,1.1,0.1C51.3,22.5,51.4,22.5,51.4,22.5z",
        className: "cr3"
      }), /*#__PURE__*/_react["default"].createElement("path", {
        d: "M49.2,53.8c3.7-4.5,5.5-7.8,5.5-9.9c0-3.3-2.7-6.1-6.1-6.1c-3.3,0-6.1,2.7-6.1,6.1 c0,2.1,1.8,5.4,5.5,9.9l0,0c0.3,0.3,0.7,0.4,1.1,0.1C49.1,53.8,49.1,53.8,49.2,53.8z",
        className: "cr4"
      }), /*#__PURE__*/_react["default"].createElement("path", {
        d: "M31.4,39.6C36.5,33.5,39,29,39,26.1c0-4.4-3.6-8-8-8s-8,3.6-8,8c0,2.9,2.5,7.4,7.6,13.5l0,0 C30.8,39.8,31.1,39.9,31.4,39.6C31.3,39.7,31.4,39.6,31.4,39.6z",
        className: "cr5"
      }));
    }
  }]);
  return ClusterLayerIcon;
}(_react.Component);

(0, _defineProperty2["default"])(ClusterLayerIcon, "propTypes", {
  /** Set the height of the icon, ex. '16px' */
  height: _propTypes["default"].string,
  colors: _propTypes["default"].arrayOf(_propTypes["default"].string)
});
(0, _defineProperty2["default"])(ClusterLayerIcon, "defaultProps", {
  height: '16px',
  predefinedClassName: 'cluster-layer-icon',
  totalColor: 5
});
var _default = ClusterLayerIcon;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2x1c3Rlci1sYXllci9jbHVzdGVyLWxheWVyLWljb24uanMiXSwibmFtZXMiOlsiQ2x1c3RlckxheWVySWNvbiIsInByb3BzIiwiQ29tcG9uZW50IiwiaGVpZ2h0IiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiY29sb3JzIiwiYXJyYXlPZiIsInByZWRlZmluZWRDbGFzc05hbWUiLCJ0b3RhbENvbG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7O0lBRU1BLGdCOzs7Ozs7Ozs7Ozs7NkJBYUs7QUFDUCwwQkFDRSxnQ0FBQyxnQkFBRCxFQUFVLEtBQUtDLEtBQWYsZUFDRTtBQUNFLFFBQUEsQ0FBQyxFQUFDLDBKQURKO0FBR0UsUUFBQSxTQUFTLEVBQUM7QUFIWixRQURGLGVBTUU7QUFDRSxRQUFBLENBQUMsRUFBQyxrSkFESjtBQUdFLFFBQUEsU0FBUyxFQUFDO0FBSFosUUFORixlQVdFO0FBQ0UsUUFBQSxDQUFDLEVBQUMsaUtBREo7QUFHRSxRQUFBLFNBQVMsRUFBQztBQUhaLFFBWEYsZUFnQkU7QUFDRSxRQUFBLENBQUMsRUFBQyxtS0FESjtBQUdFLFFBQUEsU0FBUyxFQUFDO0FBSFosUUFoQkYsZUFxQkU7QUFDRSxRQUFBLENBQUMsRUFBQyx3SkFESjtBQUdFLFFBQUEsU0FBUyxFQUFDO0FBSFosUUFyQkYsQ0FERjtBQTZCRDs7O0VBM0M0QkMsZ0I7O2lDQUF6QkYsZ0IsZUFDZTtBQUNqQjtBQUNBRyxFQUFBQSxNQUFNLEVBQUVDLHNCQUFVQyxNQUZEO0FBR2pCQyxFQUFBQSxNQUFNLEVBQUVGLHNCQUFVRyxPQUFWLENBQWtCSCxzQkFBVUMsTUFBNUI7QUFIUyxDO2lDQURmTCxnQixrQkFPa0I7QUFDcEJHLEVBQUFBLE1BQU0sRUFBRSxNQURZO0FBRXBCSyxFQUFBQSxtQkFBbUIsRUFBRSxvQkFGRDtBQUdwQkMsRUFBQUEsVUFBVSxFQUFFO0FBSFEsQztlQXVDVFQsZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucy9iYXNlJztcblxuY2xhc3MgQ2x1c3RlckxheWVySWNvbiBleHRlbmRzIENvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLyoqIFNldCB0aGUgaGVpZ2h0IG9mIHRoZSBpY29uLCBleC4gJzE2cHgnICovXG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNvbG9yczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZylcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGhlaWdodDogJzE2cHgnLFxuICAgIHByZWRlZmluZWRDbGFzc05hbWU6ICdjbHVzdGVyLWxheWVyLWljb24nLFxuICAgIHRvdGFsQ29sb3I6IDVcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCYXNlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTEzLjYsMjIuN2MyLjktMy42LDQuNC02LjMsNC40LThjMC0yLjctMi4yLTQuOS00LjktNC45UzguMiwxMiw4LjIsMTQuN2MwLDEuNywxLjUsNC40LDQuNCw4bDAsMFxuXHRDMTIuOCwyMywxMy4yLDIzLDEzLjYsMjIuN0MxMy41LDIyLjgsMTMuNiwyMi43LDEzLjYsMjIuN3pcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImNyMVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk0yMi45LDU3LjRjMi41LTMuMSwzLjgtNS41LDMuOC03YzAtMi40LTItNC40LTQuNC00LjRTMTgsNDgsMTgsNTAuNGMwLDEuNSwxLjMsMy44LDMuOCw3bDAsMFxuXHRjMC4zLDAuMywwLjcsMC40LDEsMC4xQzIyLjksNTcuNCwyMi45LDU3LjQsMjIuOSw1Ny40elwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiY3IyXCJcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTUxLjQsMjIuNWMyLjgtMy40LDQuMi02LDQuMi03LjZjMC0yLjYtMi4xLTQuOC00LjgtNC44Yy0yLjYsMC00LjgsMi4xLTQuOCw0LjhjMCwxLjYsMS40LDQuMiw0LjIsNy42XG5cdGwwLDBjMC4zLDAuMywwLjgsMC40LDEuMSwwLjFDNTEuMywyMi41LDUxLjQsMjIuNSw1MS40LDIyLjV6XCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJjcjNcIlxuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNDkuMiw1My44YzMuNy00LjUsNS41LTcuOCw1LjUtOS45YzAtMy4zLTIuNy02LjEtNi4xLTYuMWMtMy4zLDAtNi4xLDIuNy02LjEsNi4xXG5cdGMwLDIuMSwxLjgsNS40LDUuNSw5LjlsMCwwYzAuMywwLjMsMC43LDAuNCwxLjEsMC4xQzQ5LjEsNTMuOCw0OS4xLDUzLjgsNDkuMiw1My44elwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiY3I0XCJcbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTMxLjQsMzkuNkMzNi41LDMzLjUsMzksMjksMzksMjYuMWMwLTQuNC0zLjYtOC04LThzLTgsMy42LTgsOGMwLDIuOSwyLjUsNy40LDcuNiwxMy41bDAsMFxuXHRDMzAuOCwzOS44LDMxLjEsMzkuOSwzMS40LDM5LjZDMzEuMywzOS43LDMxLjQsMzkuNiwzMS40LDM5LjZ6XCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJjcjVcIlxuICAgICAgICAvPlxuICAgICAgPC9CYXNlPlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2x1c3RlckxheWVySWNvbjtcbiJdfQ==