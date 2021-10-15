"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireWildcard(require("styled-components"));

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  border-radius: 50%;\n  border: 3px solid ", ";\n  padding: 2px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    border-left-color: ", ";\n    animation: _preloader_spin_ 500ms linear infinite;\n    border-radius: 50%;\n    border-top-color: transparent;\n    border-bottom-color: transparent;\n    border-right-color: transparent;\n    cursor: wait;\n    border-style: solid;\n    display: block;\n    animation-name: ", ";\n}"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var animationName = (0, _styledComponents.keyframes)(_templateObject());

var Loader = _styledComponents["default"].span(_templateObject2(), function (props) {
  return props.color || props.theme.primaryBtnBgd;
}, animationName);

var LoadingWrapper = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.borderColor || props.theme.borderColorLT;
});

var LoadingSpinner = function LoadingSpinner(_ref) {
  var _ref$size = _ref.size,
      size = _ref$size === void 0 ? 32 : _ref$size,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? '' : _ref$color,
      _ref$borderColor = _ref.borderColor,
      borderColor = _ref$borderColor === void 0 ? '' : _ref$borderColor,
      _ref$strokeWidth = _ref.strokeWidth,
      strokeWidth = _ref$strokeWidth === void 0 ? 3 : _ref$strokeWidth,
      _ref$gap = _ref.gap,
      gap = _ref$gap === void 0 ? 2 : _ref$gap;
  return /*#__PURE__*/_react["default"].createElement(LoadingWrapper, {
    style: {
      width: "".concat(size, "px"),
      height: "".concat(size, "px"),
      padding: "".concat(gap, "px")
    }
  }, /*#__PURE__*/_react["default"].createElement(Loader, {
    color: color,
    style: {
      width: "".concat(size - strokeWidth * 2 - gap * 2, "px"),
      height: "".concat(size - strokeWidth * 2 - gap * 2, "px")
    }
  }));
};

var _default = LoadingSpinner;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9sb2FkaW5nLXNwaW5uZXIuanMiXSwibmFtZXMiOlsiYW5pbWF0aW9uTmFtZSIsImtleWZyYW1lcyIsIkxvYWRlciIsInN0eWxlZCIsInNwYW4iLCJwcm9wcyIsImNvbG9yIiwidGhlbWUiLCJwcmltYXJ5QnRuQmdkIiwiTG9hZGluZ1dyYXBwZXIiLCJkaXYiLCJib3JkZXJDb2xvciIsImJvcmRlckNvbG9yTFQiLCJMb2FkaW5nU3Bpbm5lciIsInNpemUiLCJzdHJva2VXaWR0aCIsImdhcCIsIndpZHRoIiwiaGVpZ2h0IiwicGFkZGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxhQUFhLE9BQUdDLDJCQUFILG9CQUFuQjs7QUFTQSxJQUFNQyxNQUFNLEdBQUdDLDZCQUFPQyxJQUFWLHFCQUNhLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sSUFBZUQsS0FBSyxDQUFDRSxLQUFOLENBQVlDLGFBQS9CO0FBQUEsQ0FEbEIsRUFVVVIsYUFWVixDQUFaOztBQWFBLElBQU1TLGNBQWMsR0FBR04sNkJBQU9PLEdBQVYscUJBRUUsVUFBQUwsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ00sV0FBTixJQUFxQk4sS0FBSyxDQUFDRSxLQUFOLENBQVlLLGFBQXJDO0FBQUEsQ0FGUCxDQUFwQjs7QUFNQSxJQUFNQyxjQUFjLEdBQUcsU0FBakJBLGNBQWlCO0FBQUEsdUJBQUVDLElBQUY7QUFBQSxNQUFFQSxJQUFGLDBCQUFTLEVBQVQ7QUFBQSx3QkFBYVIsS0FBYjtBQUFBLE1BQWFBLEtBQWIsMkJBQXFCLEVBQXJCO0FBQUEsOEJBQXlCSyxXQUF6QjtBQUFBLE1BQXlCQSxXQUF6QixpQ0FBdUMsRUFBdkM7QUFBQSw4QkFBMkNJLFdBQTNDO0FBQUEsTUFBMkNBLFdBQTNDLGlDQUF5RCxDQUF6RDtBQUFBLHNCQUE0REMsR0FBNUQ7QUFBQSxNQUE0REEsR0FBNUQseUJBQWtFLENBQWxFO0FBQUEsc0JBQ3JCLGdDQUFDLGNBQUQ7QUFBZ0IsSUFBQSxLQUFLLEVBQUU7QUFBQ0MsTUFBQUEsS0FBSyxZQUFLSCxJQUFMLE9BQU47QUFBcUJJLE1BQUFBLE1BQU0sWUFBS0osSUFBTCxPQUEzQjtBQUEwQ0ssTUFBQUEsT0FBTyxZQUFLSCxHQUFMO0FBQWpEO0FBQXZCLGtCQUNFLGdDQUFDLE1BQUQ7QUFDRSxJQUFBLEtBQUssRUFBRVYsS0FEVDtBQUVFLElBQUEsS0FBSyxFQUFFO0FBQ0xXLE1BQUFBLEtBQUssWUFBS0gsSUFBSSxHQUFHQyxXQUFXLEdBQUcsQ0FBckIsR0FBeUJDLEdBQUcsR0FBRyxDQUFwQyxPQURBO0FBRUxFLE1BQUFBLE1BQU0sWUFBS0osSUFBSSxHQUFHQyxXQUFXLEdBQUcsQ0FBckIsR0FBeUJDLEdBQUcsR0FBRyxDQUFwQztBQUZEO0FBRlQsSUFERixDQURxQjtBQUFBLENBQXZCOztlQVllSCxjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQsIHtrZXlmcmFtZXN9IGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcblxuY29uc3QgYW5pbWF0aW9uTmFtZSA9IGtleWZyYW1lc2BcbiAgMCUge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICB9XG4gIDEwMCUge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gIH1cbmA7XG5cbmNvbnN0IExvYWRlciA9IHN0eWxlZC5zcGFuYFxuICAgIGJvcmRlci1sZWZ0LWNvbG9yOiAke3Byb3BzID0+IHByb3BzLmNvbG9yIHx8IHByb3BzLnRoZW1lLnByaW1hcnlCdG5CZ2R9O1xuICAgIGFuaW1hdGlvbjogX3ByZWxvYWRlcl9zcGluXyA1MDBtcyBsaW5lYXIgaW5maW5pdGU7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGJvcmRlci10b3AtY29sb3I6IHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1ib3R0b20tY29sb3I6IHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgY3Vyc29yOiB3YWl0O1xuICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgYW5pbWF0aW9uLW5hbWU6ICR7YW5pbWF0aW9uTmFtZX07XG59YDtcblxuY29uc3QgTG9hZGluZ1dyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIGJvcmRlcjogM3B4IHNvbGlkICR7cHJvcHMgPT4gcHJvcHMuYm9yZGVyQ29sb3IgfHwgcHJvcHMudGhlbWUuYm9yZGVyQ29sb3JMVH07XG4gIHBhZGRpbmc6IDJweDtcbmA7XG5cbmNvbnN0IExvYWRpbmdTcGlubmVyID0gKHtzaXplID0gMzIsIGNvbG9yID0gJycsIGJvcmRlckNvbG9yID0gJycsIHN0cm9rZVdpZHRoID0gMywgZ2FwID0gMn0pID0+IChcbiAgPExvYWRpbmdXcmFwcGVyIHN0eWxlPXt7d2lkdGg6IGAke3NpemV9cHhgLCBoZWlnaHQ6IGAke3NpemV9cHhgLCBwYWRkaW5nOiBgJHtnYXB9cHhgfX0+XG4gICAgPExvYWRlclxuICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IGAke3NpemUgLSBzdHJva2VXaWR0aCAqIDIgLSBnYXAgKiAyfXB4YCxcbiAgICAgICAgaGVpZ2h0OiBgJHtzaXplIC0gc3Ryb2tlV2lkdGggKiAyIC0gZ2FwICogMn1weGBcbiAgICAgIH19XG4gICAgLz5cbiAgPC9Mb2FkaW5nV3JhcHBlcj5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTcGlubmVyO1xuIl19