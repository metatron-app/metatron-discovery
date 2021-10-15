"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireWildcard(require("react"));

var _reactVirtualized = require("react-virtualized");

var _lodash = _interopRequireDefault(require("lodash.isequal"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var GridHack = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(GridHack, _PureComponent);

  var _super = _createSuper(GridHack);

  function GridHack() {
    (0, _classCallCheck2["default"])(this, GridHack);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(GridHack, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(preProps) {
      /*
       * This hack exists because in react-virtualized the
       * _columnWidthGetter is only called in the constructor
       * even though it is reassigned with new props resulting in
       * a new width for cells not being calculated so we must
       * force trigger a resize.
       *
       * https://github.com/bvaughn/react-virtualized/blob/master/source/Grid/Grid.js#L322
       *
       */
      if (!(0, _lodash["default"])(preProps.cellSizeCache, this.props.cellSizeCache)) {
        this.grid.recomputeGridSize();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = this.props,
          setGridRef = _this$props.setGridRef,
          rest = (0, _objectWithoutProperties2["default"])(_this$props, ["setGridRef"]);
      return /*#__PURE__*/_react["default"].createElement(_reactVirtualized.Grid, (0, _extends2["default"])({
        ref: function ref(x) {
          if (setGridRef) setGridRef(x);
          _this.grid = x;
        },
        key: "grid-hack"
      }, rest));
    }
  }]);
  return GridHack;
}(_react.PureComponent);

exports["default"] = GridHack;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9kYXRhLXRhYmxlL2dyaWQuanMiXSwibmFtZXMiOlsiR3JpZEhhY2siLCJwcmVQcm9wcyIsImNlbGxTaXplQ2FjaGUiLCJwcm9wcyIsImdyaWQiLCJyZWNvbXB1dGVHcmlkU2l6ZSIsInNldEdyaWRSZWYiLCJyZXN0IiwieCIsIlB1cmVDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7Ozs7OztJQUVxQkEsUTs7Ozs7Ozs7Ozs7O3VDQUNBQyxRLEVBQVU7QUFDM0I7Ozs7Ozs7Ozs7QUFVQSxVQUFJLENBQUMsd0JBQVFBLFFBQVEsQ0FBQ0MsYUFBakIsRUFBZ0MsS0FBS0MsS0FBTCxDQUFXRCxhQUEzQyxDQUFMLEVBQWdFO0FBQzlELGFBQUtFLElBQUwsQ0FBVUMsaUJBQVY7QUFDRDtBQUNGOzs7NkJBRVE7QUFBQTs7QUFBQSx3QkFDdUIsS0FBS0YsS0FENUI7QUFBQSxVQUNBRyxVQURBLGVBQ0FBLFVBREE7QUFBQSxVQUNlQyxJQURmO0FBRVAsMEJBQ0UsZ0NBQUMsc0JBQUQ7QUFDRSxRQUFBLEdBQUcsRUFBRSxhQUFBQyxDQUFDLEVBQUk7QUFDUixjQUFJRixVQUFKLEVBQWdCQSxVQUFVLENBQUNFLENBQUQsQ0FBVjtBQUNoQixVQUFBLEtBQUksQ0FBQ0osSUFBTCxHQUFZSSxDQUFaO0FBQ0QsU0FKSDtBQUtFLFFBQUEsR0FBRyxFQUFDO0FBTE4sU0FNTUQsSUFOTixFQURGO0FBVUQ7OztFQTdCbUNFLG9CIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7UHVyZUNvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtHcmlkfSBmcm9tICdyZWFjdC12aXJ0dWFsaXplZCc7XG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2guaXNlcXVhbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRIYWNrIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmVQcm9wcykge1xuICAgIC8qXG4gICAgICogVGhpcyBoYWNrIGV4aXN0cyBiZWNhdXNlIGluIHJlYWN0LXZpcnR1YWxpemVkIHRoZVxuICAgICAqIF9jb2x1bW5XaWR0aEdldHRlciBpcyBvbmx5IGNhbGxlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgKiBldmVuIHRob3VnaCBpdCBpcyByZWFzc2lnbmVkIHdpdGggbmV3IHByb3BzIHJlc3VsdGluZyBpblxuICAgICAqIGEgbmV3IHdpZHRoIGZvciBjZWxscyBub3QgYmVpbmcgY2FsY3VsYXRlZCBzbyB3ZSBtdXN0XG4gICAgICogZm9yY2UgdHJpZ2dlciBhIHJlc2l6ZS5cbiAgICAgKlxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9idmF1Z2huL3JlYWN0LXZpcnR1YWxpemVkL2Jsb2IvbWFzdGVyL3NvdXJjZS9HcmlkL0dyaWQuanMjTDMyMlxuICAgICAqXG4gICAgICovXG4gICAgaWYgKCFpc0VxdWFsKHByZVByb3BzLmNlbGxTaXplQ2FjaGUsIHRoaXMucHJvcHMuY2VsbFNpemVDYWNoZSkpIHtcbiAgICAgIHRoaXMuZ3JpZC5yZWNvbXB1dGVHcmlkU2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7c2V0R3JpZFJlZiwgLi4ucmVzdH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8R3JpZFxuICAgICAgICByZWY9e3ggPT4ge1xuICAgICAgICAgIGlmIChzZXRHcmlkUmVmKSBzZXRHcmlkUmVmKHgpO1xuICAgICAgICAgIHRoaXMuZ3JpZCA9IHg7XG4gICAgICAgIH19XG4gICAgICAgIGtleT1cImdyaWQtaGFja1wiXG4gICAgICAgIHsuLi5yZXN0fVxuICAgICAgLz5cbiAgICApO1xuICB9XG59XG4iXX0=