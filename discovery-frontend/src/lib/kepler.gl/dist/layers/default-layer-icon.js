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

var _base = _interopRequireDefault(require("../components/common/icons/base"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DefaultLayerIcon = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(DefaultLayerIcon, _Component);

  var _super = _createSuper(DefaultLayerIcon);

  function DefaultLayerIcon() {
    (0, _classCallCheck2["default"])(this, DefaultLayerIcon);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(DefaultLayerIcon, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_base["default"], this.props, /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "29.4",
        cy: "31.6",
        r: "8.4"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "48.5",
        cy: "15.7",
        r: "6.5"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "11",
        cy: "44.2",
        r: "3"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "50",
        cy: "44.2",
        r: "5"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "34",
        cy: "54.2",
        r: "3"
      }), /*#__PURE__*/_react["default"].createElement("circle", {
        cx: "14",
        cy: "16.2",
        r: "4"
      }));
    }
  }]);
  return DefaultLayerIcon;
}(_react.Component);

(0, _defineProperty2["default"])(DefaultLayerIcon, "propTypes", {
  height: _propTypes["default"].string,
  colors: _propTypes["default"].arrayOf(_propTypes["default"].string)
});
(0, _defineProperty2["default"])(DefaultLayerIcon, "defaultProps", {
  height: '16px',
  predefinedClassName: 'default-layer-icon'
});
var _default = DefaultLayerIcon;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvZGVmYXVsdC1sYXllci1pY29uLmpzIl0sIm5hbWVzIjpbIkRlZmF1bHRMYXllckljb24iLCJwcm9wcyIsIkNvbXBvbmVudCIsImhlaWdodCIsIlByb3BUeXBlcyIsInN0cmluZyIsImNvbG9ycyIsImFycmF5T2YiLCJwcmVkZWZpbmVkQ2xhc3NOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7O0lBRU1BLGdCOzs7Ozs7Ozs7Ozs7NkJBV0s7QUFDUCwwQkFDRSxnQ0FBQyxnQkFBRCxFQUFVLEtBQUtDLEtBQWYsZUFDRTtBQUFRLFFBQUEsRUFBRSxFQUFDLE1BQVg7QUFBa0IsUUFBQSxFQUFFLEVBQUMsTUFBckI7QUFBNEIsUUFBQSxDQUFDLEVBQUM7QUFBOUIsUUFERixlQUVFO0FBQVEsUUFBQSxFQUFFLEVBQUMsTUFBWDtBQUFrQixRQUFBLEVBQUUsRUFBQyxNQUFyQjtBQUE0QixRQUFBLENBQUMsRUFBQztBQUE5QixRQUZGLGVBR0U7QUFBUSxRQUFBLEVBQUUsRUFBQyxJQUFYO0FBQWdCLFFBQUEsRUFBRSxFQUFDLE1BQW5CO0FBQTBCLFFBQUEsQ0FBQyxFQUFDO0FBQTVCLFFBSEYsZUFJRTtBQUFRLFFBQUEsRUFBRSxFQUFDLElBQVg7QUFBZ0IsUUFBQSxFQUFFLEVBQUMsTUFBbkI7QUFBMEIsUUFBQSxDQUFDLEVBQUM7QUFBNUIsUUFKRixlQUtFO0FBQVEsUUFBQSxFQUFFLEVBQUMsSUFBWDtBQUFnQixRQUFBLEVBQUUsRUFBQyxNQUFuQjtBQUEwQixRQUFBLENBQUMsRUFBQztBQUE1QixRQUxGLGVBTUU7QUFBUSxRQUFBLEVBQUUsRUFBQyxJQUFYO0FBQWdCLFFBQUEsRUFBRSxFQUFDLE1BQW5CO0FBQTBCLFFBQUEsQ0FBQyxFQUFDO0FBQTVCLFFBTkYsQ0FERjtBQVVEOzs7RUF0QjRCQyxnQjs7aUNBQXpCRixnQixlQUNlO0FBQ2pCRyxFQUFBQSxNQUFNLEVBQUVDLHNCQUFVQyxNQUREO0FBRWpCQyxFQUFBQSxNQUFNLEVBQUVGLHNCQUFVRyxPQUFWLENBQWtCSCxzQkFBVUMsTUFBNUI7QUFGUyxDO2lDQURmTCxnQixrQkFNa0I7QUFDcEJHLEVBQUFBLE1BQU0sRUFBRSxNQURZO0FBRXBCSyxFQUFBQSxtQkFBbUIsRUFBRTtBQUZELEM7ZUFtQlRSLGdCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEJhc2UgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMvYmFzZSc7XG5cbmNsYXNzIERlZmF1bHRMYXllckljb24gZXh0ZW5kcyBDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGhlaWdodDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjb2xvcnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBoZWlnaHQ6ICcxNnB4JyxcbiAgICBwcmVkZWZpbmVkQ2xhc3NOYW1lOiAnZGVmYXVsdC1sYXllci1pY29uJ1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJhc2Ugey4uLnRoaXMucHJvcHN9PlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMjkuNFwiIGN5PVwiMzEuNlwiIHI9XCI4LjRcIiAvPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiNDguNVwiIGN5PVwiMTUuN1wiIHI9XCI2LjVcIiAvPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMTFcIiBjeT1cIjQ0LjJcIiByPVwiM1wiIC8+XG4gICAgICAgIDxjaXJjbGUgY3g9XCI1MFwiIGN5PVwiNDQuMlwiIHI9XCI1XCIgLz5cbiAgICAgICAgPGNpcmNsZSBjeD1cIjM0XCIgY3k9XCI1NC4yXCIgcj1cIjNcIiAvPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMTRcIiBjeT1cIjE2LjJcIiByPVwiNFwiIC8+XG4gICAgICA8L0Jhc2U+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0TGF5ZXJJY29uO1xuIl19