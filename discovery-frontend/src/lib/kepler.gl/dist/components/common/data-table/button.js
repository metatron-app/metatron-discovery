"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  background-color: transparent;\n  border: none;\n  cursor: pointer;\n  outline: none;\n  transition: ", ";\n  height: 2rem;\n  display: flex;\n  align-items: center;\n  padding: 0;\n\n  &:hover {\n    opacity: 0.8;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledButton = _styledComponents["default"].button(_templateObject(), function (props) {
  return props.theme.optionButtonColor;
}, function (props) {
  return props.theme.transition;
});

var noop = function noop() {};

var Button = function Button(_ref) {
  var _ref$onClick = _ref.onClick,
      onClick = _ref$onClick === void 0 ? noop : _ref$onClick,
      _ref$disabled = _ref.disabled,
      disabled = _ref$disabled === void 0 ? false : _ref$disabled,
      _ref$text = _ref.text,
      text = _ref$text === void 0 ? '' : _ref$text,
      children = _ref.children,
      props = (0, _objectWithoutProperties2["default"])(_ref, ["onClick", "disabled", "text", "children"]);
  return /*#__PURE__*/_react["default"].createElement(StyledButton, (0, _extends2["default"])({}, props, {
    onClick: disabled ? null : onClick
  }), text || children);
};

var _default = Button;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9kYXRhLXRhYmxlL2J1dHRvbi5qcyJdLCJuYW1lcyI6WyJTdHlsZWRCdXR0b24iLCJzdHlsZWQiLCJidXR0b24iLCJwcm9wcyIsInRoZW1lIiwib3B0aW9uQnV0dG9uQ29sb3IiLCJ0cmFuc2l0aW9uIiwibm9vcCIsIkJ1dHRvbiIsIm9uQ2xpY2siLCJkaXNhYmxlZCIsInRleHQiLCJjaGlsZHJlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUdDLDZCQUFPQyxNQUFWLG9CQUNQLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsaUJBQWhCO0FBQUEsQ0FERSxFQU1GLFVBQUFGLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUUsVUFBaEI7QUFBQSxDQU5ILENBQWxCOztBQWdCQSxJQUFNQyxJQUFJLEdBQUcsU0FBUEEsSUFBTyxHQUFNLENBQUUsQ0FBckI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHLFNBQVRBLE1BQVM7QUFBQSwwQkFBRUMsT0FBRjtBQUFBLE1BQUVBLE9BQUYsNkJBQVlGLElBQVo7QUFBQSwyQkFBa0JHLFFBQWxCO0FBQUEsTUFBa0JBLFFBQWxCLDhCQUE2QixLQUE3QjtBQUFBLHVCQUFvQ0MsSUFBcEM7QUFBQSxNQUFvQ0EsSUFBcEMsMEJBQTJDLEVBQTNDO0FBQUEsTUFBK0NDLFFBQS9DLFFBQStDQSxRQUEvQztBQUFBLE1BQTREVCxLQUE1RDtBQUFBLHNCQUNiLGdDQUFDLFlBQUQsZ0NBQWtCQSxLQUFsQjtBQUF5QixJQUFBLE9BQU8sRUFBRU8sUUFBUSxHQUFHLElBQUgsR0FBVUQ7QUFBcEQsTUFDR0UsSUFBSSxJQUFJQyxRQURYLENBRGE7QUFBQSxDQUFmOztlQU1lSixNIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuXG5jb25zdCBTdHlsZWRCdXR0b24gPSBzdHlsZWQuYnV0dG9uYFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5vcHRpb25CdXR0b25Db2xvcn07XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICBib3JkZXI6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgb3V0bGluZTogbm9uZTtcbiAgdHJhbnNpdGlvbjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50cmFuc2l0aW9ufTtcbiAgaGVpZ2h0OiAycmVtO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAwO1xuXG4gICY6aG92ZXIge1xuICAgIG9wYWNpdHk6IDAuODtcbiAgfVxuYDtcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcbmNvbnN0IEJ1dHRvbiA9ICh7b25DbGljayA9IG5vb3AsIGRpc2FibGVkID0gZmFsc2UsIHRleHQgPSAnJywgY2hpbGRyZW4sIC4uLnByb3BzfSkgPT4gKFxuICA8U3R5bGVkQnV0dG9uIHsuLi5wcm9wc30gb25DbGljaz17ZGlzYWJsZWQgPyBudWxsIDogb25DbGlja30+XG4gICAge3RleHQgfHwgY2hpbGRyZW59XG4gIDwvU3R5bGVkQnV0dG9uPlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uO1xuIl19