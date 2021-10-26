"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _styledComponents2 = require("../../components/common/styled-components");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 20px;\n  letter-spacing: 1.25px;\n  margin: 18px 0 14px 0;\n  color: ", ";\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledTitle = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.titleColorLT;
});

var ExampleTable = function ExampleTable() {
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Table, {
    className: "scenegraph-example-table"
  }, /*#__PURE__*/_react["default"].createElement("thead", null, /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("th", null, "point_lat"), /*#__PURE__*/_react["default"].createElement("th", null, "point_lng"), /*#__PURE__*/_react["default"].createElement("th", null, "alt"))), /*#__PURE__*/_react["default"].createElement("tbody", null, /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.769897"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.41168"), /*#__PURE__*/_react["default"].createElement("td", null, "0")), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.806928"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.40218"), /*#__PURE__*/_react["default"].createElement("td", null, "0")), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.778564"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.39096"), /*#__PURE__*/_react["default"].createElement("td", null, "1000")), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.745995"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.30220"), /*#__PURE__*/_react["default"].createElement("td", null, "2000")), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.329841"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.103847"), /*#__PURE__*/_react["default"].createElement("td", null, "3000"))));
};

var ScenegraphInfoModalFactory = function ScenegraphInfoModalFactory() {
  var ScenegraphInfoModal = function ScenegraphInfoModal() {
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "scenegraph-info-modal"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "scenegraph-info-modal__description"
    }, /*#__PURE__*/_react["default"].createElement("span", null, "In your csv you can specify points with optional altitude. The models will show at each point you specify. You can use a sample model or upload one in", ' '), /*#__PURE__*/_react["default"].createElement("code", null, "glTF (GLB or Embedded)"), /*#__PURE__*/_react["default"].createElement("span", null, " format.")), /*#__PURE__*/_react["default"].createElement("div", {
      className: "scenegraph-info-modal__example"
    }, /*#__PURE__*/_react["default"].createElement(StyledTitle, null, "Example:"), /*#__PURE__*/_react["default"].createElement(ExampleTable, null)), /*#__PURE__*/_react["default"].createElement("div", {
      className: "scenegraph-info-modal__icons"
    }, /*#__PURE__*/_react["default"].createElement(StyledTitle, null, "Sample Models"), /*#__PURE__*/_react["default"].createElement("div", null, "Duck"), /*#__PURE__*/_react["default"].createElement("div", null, "Use your own model")));
  };

  return ScenegraphInfoModal;
};

var _default = ScenegraphInfoModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NlbmVncmFwaC1sYXllci9zY2VuZWdyYXBoLWluZm8tbW9kYWwuanMiXSwibmFtZXMiOlsiU3R5bGVkVGl0bGUiLCJzdHlsZWQiLCJkaXYiLCJwcm9wcyIsInRoZW1lIiwidGl0bGVDb2xvckxUIiwiRXhhbXBsZVRhYmxlIiwiU2NlbmVncmFwaEluZm9Nb2RhbEZhY3RvcnkiLCJTY2VuZWdyYXBoSW5mb01vZGFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsV0FBVyxHQUFHQyw2QkFBT0MsR0FBVixvQkFJTixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLFlBQWhCO0FBQUEsQ0FKQyxDQUFqQjs7QUFPQSxJQUFNQyxZQUFZLEdBQUcsU0FBZkEsWUFBZTtBQUFBLHNCQUNuQixnQ0FBQyx3QkFBRDtBQUFPLElBQUEsU0FBUyxFQUFDO0FBQWpCLGtCQUNFLDREQUNFLHlEQUNFLHdEQURGLGVBRUUsd0RBRkYsZUFHRSxrREFIRixDQURGLENBREYsZUFRRSw0REFDRSx5REFDRSx3REFERixlQUVFLHlEQUZGLGVBR0UsZ0RBSEYsQ0FERixlQU1FLHlEQUNFLHdEQURGLGVBRUUseURBRkYsZUFHRSxnREFIRixDQU5GLGVBV0UseURBQ0Usd0RBREYsZUFFRSx5REFGRixlQUdFLG1EQUhGLENBWEYsZUFnQkUseURBQ0Usd0RBREYsZUFFRSx5REFGRixlQUdFLG1EQUhGLENBaEJGLGVBcUJFLHlEQUNFLHdEQURGLGVBRUUsMERBRkYsZUFHRSxtREFIRixDQXJCRixDQVJGLENBRG1CO0FBQUEsQ0FBckI7O0FBdUNBLElBQU1DLDBCQUEwQixHQUFHLFNBQTdCQSwwQkFBNkIsR0FBTTtBQUN2QyxNQUFNQyxtQkFBbUIsR0FBRyxTQUF0QkEsbUJBQXNCO0FBQUEsd0JBQzFCO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0Usd01BRWlFLEdBRmpFLENBREYsZUFLRSx1RUFMRixlQU1FLHlEQU5GLENBREYsZUFTRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0UsZ0NBQUMsV0FBRCxtQkFERixlQUVFLGdDQUFDLFlBQUQsT0FGRixDQVRGLGVBYUU7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLGdDQUFDLFdBQUQsd0JBREYsZUFFRSxvREFGRixlQUdFLGtFQUhGLENBYkYsQ0FEMEI7QUFBQSxHQUE1Qjs7QUFzQkEsU0FBT0EsbUJBQVA7QUFDRCxDQXhCRDs7ZUEwQmVELDBCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtUYWJsZX0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuXG5jb25zdCBTdHlsZWRUaXRsZSA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtc2l6ZTogMjBweDtcbiAgbGV0dGVyLXNwYWNpbmc6IDEuMjVweDtcbiAgbWFyZ2luOiAxOHB4IDAgMTRweCAwO1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aXRsZUNvbG9yTFR9O1xuYDtcblxuY29uc3QgRXhhbXBsZVRhYmxlID0gKCkgPT4gKFxuICA8VGFibGUgY2xhc3NOYW1lPVwic2NlbmVncmFwaC1leGFtcGxlLXRhYmxlXCI+XG4gICAgPHRoZWFkPlxuICAgICAgPHRyPlxuICAgICAgICA8dGg+cG9pbnRfbGF0PC90aD5cbiAgICAgICAgPHRoPnBvaW50X2xuZzwvdGg+XG4gICAgICAgIDx0aD5hbHQ8L3RoPlxuICAgICAgPC90cj5cbiAgICA8L3RoZWFkPlxuICAgIDx0Ym9keT5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3Ljc2OTg5NzwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjQxMTY4PC90ZD5cbiAgICAgICAgPHRkPjA8L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3LjgwNjkyODwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjQwMjE4PC90ZD5cbiAgICAgICAgPHRkPjA8L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3Ljc3ODU2NDwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjM5MDk2PC90ZD5cbiAgICAgICAgPHRkPjEwMDA8L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3Ljc0NTk5NTwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjMwMjIwPC90ZD5cbiAgICAgICAgPHRkPjIwMDA8L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3LjMyOTg0MTwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjEwMzg0NzwvdGQ+XG4gICAgICAgIDx0ZD4zMDAwPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgPC90Ym9keT5cbiAgPC9UYWJsZT5cbik7XG5cbmNvbnN0IFNjZW5lZ3JhcGhJbmZvTW9kYWxGYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBTY2VuZWdyYXBoSW5mb01vZGFsID0gKCkgPT4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwic2NlbmVncmFwaC1pbmZvLW1vZGFsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNjZW5lZ3JhcGgtaW5mby1tb2RhbF9fZGVzY3JpcHRpb25cIj5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgSW4geW91ciBjc3YgeW91IGNhbiBzcGVjaWZ5IHBvaW50cyB3aXRoIG9wdGlvbmFsIGFsdGl0dWRlLiBUaGUgbW9kZWxzIHdpbGwgc2hvdyBhdCBlYWNoXG4gICAgICAgICAgcG9pbnQgeW91IHNwZWNpZnkuIFlvdSBjYW4gdXNlIGEgc2FtcGxlIG1vZGVsIG9yIHVwbG9hZCBvbmUgaW57JyAnfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxjb2RlPmdsVEYgKEdMQiBvciBFbWJlZGRlZCk8L2NvZGU+XG4gICAgICAgIDxzcGFuPiBmb3JtYXQuPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNjZW5lZ3JhcGgtaW5mby1tb2RhbF9fZXhhbXBsZVwiPlxuICAgICAgICA8U3R5bGVkVGl0bGU+RXhhbXBsZTo8L1N0eWxlZFRpdGxlPlxuICAgICAgICA8RXhhbXBsZVRhYmxlIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2NlbmVncmFwaC1pbmZvLW1vZGFsX19pY29uc1wiPlxuICAgICAgICA8U3R5bGVkVGl0bGU+U2FtcGxlIE1vZGVsczwvU3R5bGVkVGl0bGU+XG4gICAgICAgIDxkaXY+RHVjazwvZGl2PlxuICAgICAgICA8ZGl2PlVzZSB5b3VyIG93biBtb2RlbDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG5cbiAgcmV0dXJuIFNjZW5lZ3JhcGhJbmZvTW9kYWw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZWdyYXBoSW5mb01vZGFsRmFjdG9yeTtcbiJdfQ==