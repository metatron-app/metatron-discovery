"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reselect = require("reselect");

var _context = _interopRequireDefault(require("../components/context"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var identity = function identity(state) {
  return state;
};

var mergeSelectors = function mergeSelectors(parentSelector, childSelector) {
  return function (state) {
    return childSelector(parentSelector(state));
  };
}; // store the parent selector in the parent context
// and return the parent component
// when a selector is passed to a container component,
// it will be stored in the context and passed down to child components,
// as well as prop to the given component


var withLocalSelector = function withLocalSelector(ParentComponent) {
  var WithConnectSelector = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(WithConnectSelector, _Component);

    var _super = _createSuper(WithConnectSelector);

    function WithConnectSelector() {
      var _this;

      (0, _classCallCheck2["default"])(this, WithConnectSelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "selectorFromContext", function (_, ctx) {
        return ctx.selector ? ctx.selector : identity;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "selectorFromProps", function (props, _) {
        return props.selector ? props.selector : identity;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "idFromProps", function (props, _) {
        return props.id;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "computedSelector", (0, _reselect.createSelector)(_this.selectorFromContext, _this.selectorFromProps, function (ctx, props) {
        return mergeSelectors(ctx, props);
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "contextSelector", (0, _reselect.createSelector)(_this.computedSelector, _this.idFromProps, function (selector, id) {
        return {
          selector: selector,
          id: id
        };
      }));
      return _this;
    }

    (0, _createClass2["default"])(WithConnectSelector, [{
      key: "render",
      value: function render() {
        var computedContext = this.contextSelector(this.props, this.context);
        return /*#__PURE__*/_react["default"].createElement(_context["default"].Provider, {
          value: computedContext
        }, /*#__PURE__*/_react["default"].createElement(ParentComponent, (0, _extends2["default"])({}, this.props, {
          selector: computedContext.selector
        })));
      }
    }]);
    return WithConnectSelector;
  }(_react.Component);

  (0, _defineProperty2["default"])(WithConnectSelector, "contextType", _context["default"]);
  return WithConnectSelector;
};

var _default = withLocalSelector;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25uZWN0L3dpdGgtbG9jYWwtc2VsZWN0b3IuanMiXSwibmFtZXMiOlsiaWRlbnRpdHkiLCJzdGF0ZSIsIm1lcmdlU2VsZWN0b3JzIiwicGFyZW50U2VsZWN0b3IiLCJjaGlsZFNlbGVjdG9yIiwid2l0aExvY2FsU2VsZWN0b3IiLCJQYXJlbnRDb21wb25lbnQiLCJXaXRoQ29ubmVjdFNlbGVjdG9yIiwiXyIsImN0eCIsInNlbGVjdG9yIiwicHJvcHMiLCJpZCIsInNlbGVjdG9yRnJvbUNvbnRleHQiLCJzZWxlY3RvckZyb21Qcm9wcyIsImNvbXB1dGVkU2VsZWN0b3IiLCJpZEZyb21Qcm9wcyIsImNvbXB1dGVkQ29udGV4dCIsImNvbnRleHRTZWxlY3RvciIsImNvbnRleHQiLCJDb21wb25lbnQiLCJLZXBsZXJHbENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsUUFBUSxHQUFHLFNBQVhBLFFBQVcsQ0FBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUo7QUFBQSxDQUF0Qjs7QUFFQSxJQUFNQyxjQUFjLEdBQUcsU0FBakJBLGNBQWlCLENBQUNDLGNBQUQsRUFBaUJDLGFBQWpCO0FBQUEsU0FBbUMsVUFBQUgsS0FBSztBQUFBLFdBQzdERyxhQUFhLENBQUNELGNBQWMsQ0FBQ0YsS0FBRCxDQUFmLENBRGdEO0FBQUEsR0FBeEM7QUFBQSxDQUF2QixDLENBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsSUFBTUksaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFvQixDQUFBQyxlQUFlLEVBQUk7QUFBQSxNQUNyQ0MsbUJBRHFDO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSw4R0FJbkIsVUFBQ0MsQ0FBRCxFQUFJQyxHQUFKO0FBQUEsZUFBYUEsR0FBRyxDQUFDQyxRQUFKLEdBQWVELEdBQUcsQ0FBQ0MsUUFBbkIsR0FBOEJWLFFBQTNDO0FBQUEsT0FKbUI7QUFBQSw0R0FLckIsVUFBQ1csS0FBRCxFQUFRSCxDQUFSO0FBQUEsZUFBZUcsS0FBSyxDQUFDRCxRQUFOLEdBQWlCQyxLQUFLLENBQUNELFFBQXZCLEdBQWtDVixRQUFqRDtBQUFBLE9BTHFCO0FBQUEsc0dBTTNCLFVBQUNXLEtBQUQsRUFBUUgsQ0FBUjtBQUFBLGVBQWNHLEtBQUssQ0FBQ0MsRUFBcEI7QUFBQSxPQU4yQjtBQUFBLDJHQU90Qiw4QkFDakIsTUFBS0MsbUJBRFksRUFFakIsTUFBS0MsaUJBRlksRUFHakIsVUFBQ0wsR0FBRCxFQUFNRSxLQUFOO0FBQUEsZUFBZ0JULGNBQWMsQ0FBQ08sR0FBRCxFQUFNRSxLQUFOLENBQTlCO0FBQUEsT0FIaUIsQ0FQc0I7QUFBQSwwR0FZdkIsOEJBQWUsTUFBS0ksZ0JBQXBCLEVBQXNDLE1BQUtDLFdBQTNDLEVBQXdELFVBQUNOLFFBQUQsRUFBV0UsRUFBWDtBQUFBLGVBQW1CO0FBQzNGRixVQUFBQSxRQUFRLEVBQVJBLFFBRDJGO0FBRTNGRSxVQUFBQSxFQUFFLEVBQUZBO0FBRjJGLFNBQW5CO0FBQUEsT0FBeEQsQ0FadUI7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSwrQkFpQmhDO0FBQ1AsWUFBTUssZUFBZSxHQUFHLEtBQUtDLGVBQUwsQ0FBcUIsS0FBS1AsS0FBMUIsRUFBaUMsS0FBS1EsT0FBdEMsQ0FBeEI7QUFDQSw0QkFDRSxnQ0FBQyxtQkFBRCxDQUFpQixRQUFqQjtBQUEwQixVQUFBLEtBQUssRUFBRUY7QUFBakMsd0JBQ0UsZ0NBQUMsZUFBRCxnQ0FBcUIsS0FBS04sS0FBMUI7QUFBaUMsVUFBQSxRQUFRLEVBQUVNLGVBQWUsQ0FBQ1A7QUFBM0QsV0FERixDQURGO0FBS0Q7QUF4QndDO0FBQUE7QUFBQSxJQUNUVSxnQkFEUzs7QUFBQSxtQ0FDckNiLG1CQURxQyxpQkFFcEJjLG1CQUZvQjtBQTJCM0MsU0FBT2QsbUJBQVA7QUFDRCxDQTVCRDs7ZUE4QmVGLGlCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQgS2VwbGVyR2xDb250ZXh0IGZyb20gJ2NvbXBvbmVudHMvY29udGV4dCc7XG5cbmNvbnN0IGlkZW50aXR5ID0gc3RhdGUgPT4gc3RhdGU7XG5cbmNvbnN0IG1lcmdlU2VsZWN0b3JzID0gKHBhcmVudFNlbGVjdG9yLCBjaGlsZFNlbGVjdG9yKSA9PiBzdGF0ZSA9PlxuICBjaGlsZFNlbGVjdG9yKHBhcmVudFNlbGVjdG9yKHN0YXRlKSk7XG5cbi8vIHN0b3JlIHRoZSBwYXJlbnQgc2VsZWN0b3IgaW4gdGhlIHBhcmVudCBjb250ZXh0XG4vLyBhbmQgcmV0dXJuIHRoZSBwYXJlbnQgY29tcG9uZW50XG4vLyB3aGVuIGEgc2VsZWN0b3IgaXMgcGFzc2VkIHRvIGEgY29udGFpbmVyIGNvbXBvbmVudCxcbi8vIGl0IHdpbGwgYmUgc3RvcmVkIGluIHRoZSBjb250ZXh0IGFuZCBwYXNzZWQgZG93biB0byBjaGlsZCBjb21wb25lbnRzLFxuLy8gYXMgd2VsbCBhcyBwcm9wIHRvIHRoZSBnaXZlbiBjb21wb25lbnRcbmNvbnN0IHdpdGhMb2NhbFNlbGVjdG9yID0gUGFyZW50Q29tcG9uZW50ID0+IHtcbiAgY2xhc3MgV2l0aENvbm5lY3RTZWxlY3RvciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gS2VwbGVyR2xDb250ZXh0O1xuXG4gICAgc2VsZWN0b3JGcm9tQ29udGV4dCA9IChfLCBjdHgpID0+IChjdHguc2VsZWN0b3IgPyBjdHguc2VsZWN0b3IgOiBpZGVudGl0eSk7XG4gICAgc2VsZWN0b3JGcm9tUHJvcHMgPSAocHJvcHMsIF8pID0+IChwcm9wcy5zZWxlY3RvciA/IHByb3BzLnNlbGVjdG9yIDogaWRlbnRpdHkpO1xuICAgIGlkRnJvbVByb3BzID0gKHByb3BzLCBfKSA9PiBwcm9wcy5pZDtcbiAgICBjb21wdXRlZFNlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgICB0aGlzLnNlbGVjdG9yRnJvbUNvbnRleHQsXG4gICAgICB0aGlzLnNlbGVjdG9yRnJvbVByb3BzLFxuICAgICAgKGN0eCwgcHJvcHMpID0+IG1lcmdlU2VsZWN0b3JzKGN0eCwgcHJvcHMpXG4gICAgKTtcbiAgICBjb250ZXh0U2VsZWN0b3IgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLmNvbXB1dGVkU2VsZWN0b3IsIHRoaXMuaWRGcm9tUHJvcHMsIChzZWxlY3RvciwgaWQpID0+ICh7XG4gICAgICBzZWxlY3RvcixcbiAgICAgIGlkXG4gICAgfSkpO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3QgY29tcHV0ZWRDb250ZXh0ID0gdGhpcy5jb250ZXh0U2VsZWN0b3IodGhpcy5wcm9wcywgdGhpcy5jb250ZXh0KTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxLZXBsZXJHbENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e2NvbXB1dGVkQ29udGV4dH0+XG4gICAgICAgICAgPFBhcmVudENvbXBvbmVudCB7Li4udGhpcy5wcm9wc30gc2VsZWN0b3I9e2NvbXB1dGVkQ29udGV4dC5zZWxlY3Rvcn0gLz5cbiAgICAgICAgPC9LZXBsZXJHbENvbnRleHQuUHJvdmlkZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBXaXRoQ29ubmVjdFNlbGVjdG9yO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgd2l0aExvY2FsU2VsZWN0b3I7XG4iXX0=