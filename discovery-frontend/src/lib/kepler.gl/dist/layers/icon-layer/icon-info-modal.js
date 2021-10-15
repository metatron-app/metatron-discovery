"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _d3Shape = require("d3-shape");

var _styledComponents2 = require("../../components/common/styled-components");

var _localization = require("../../localization");

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: flex-start;\n  flex-wrap: wrap;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 20px;\n  letter-spacing: 1.25px;\n  margin: 18px 0 14px 0;\n  color: ", ";\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding-left: 6px;\n  width: 180px;\n  height: 48px;\n  margin-right: 12px;\n\n  .icon-table_item__name {\n    margin-left: 12px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var lineFunction = (0, _d3Shape.line)().x(function (d) {
  return d[0] * 10;
}).y(function (d) {
  return d[1] * 10;
});

var IconShape = function IconShape(_ref) {
  var mesh = _ref.mesh;
  return /*#__PURE__*/_react["default"].createElement("svg", {
    width: "20px",
    height: "20px"
  }, /*#__PURE__*/_react["default"].createElement("g", {
    transform: "translate(10, 10)"
  }, mesh.cells.map(function (cell, i) {
    return /*#__PURE__*/_react["default"].createElement("path", {
      key: i,
      fill: "#000000",
      d: lineFunction(cell.map(function (idx) {
        return mesh.positions[idx];
      }))
    });
  })));
};

var StyledIconItem = (0, _styledComponents["default"])(_styledComponents2.CenterFlexbox)(_templateObject());

var StyledCode = _styledComponents["default"].code(_templateObject2(), function (props) {
  return props.theme.titleColorLT;
});

var StyledTitle = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.titleColorLT;
});

var IconItem = function IconItem(_ref2) {
  var _ref2$icon = _ref2.icon,
      id = _ref2$icon.id,
      mesh = _ref2$icon.mesh;
  return /*#__PURE__*/_react["default"].createElement(StyledIconItem, {
    className: "icon-table__item"
  }, /*#__PURE__*/_react["default"].createElement(IconShape, {
    className: "icon-table__item__shape",
    mesh: mesh
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "icon-table_item__name"
  }, /*#__PURE__*/_react["default"].createElement(StyledCode, null, id)));
};

var ExampleTable = function ExampleTable() {
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Table, {
    className: "icon-example-table"
  }, /*#__PURE__*/_react["default"].createElement("thead", null, /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("th", null, "point_lat"), /*#__PURE__*/_react["default"].createElement("th", null, "point_lng"), /*#__PURE__*/_react["default"].createElement("th", null, "icon"))), /*#__PURE__*/_react["default"].createElement("tbody", null, /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.769897"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.41168"), /*#__PURE__*/_react["default"].createElement("td", null, /*#__PURE__*/_react["default"].createElement(StyledCode, null, "android"))), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.806928"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.40218"), /*#__PURE__*/_react["default"].createElement("td", null)), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.778564"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.39096"), /*#__PURE__*/_react["default"].createElement("td", null, /*#__PURE__*/_react["default"].createElement(StyledCode, null, "calendar"))), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.745995"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.30220"), /*#__PURE__*/_react["default"].createElement("td", null)), /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "37.329841"), /*#__PURE__*/_react["default"].createElement("td", null, "-122.103847"), /*#__PURE__*/_react["default"].createElement("td", null, /*#__PURE__*/_react["default"].createElement(StyledCode, null, "control-off")))));
};

var IconTable = _styledComponents["default"].div(_templateObject4());

var IconInfoModalFactory = function IconInfoModalFactory() {
  var svgIcons = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var IconInfoModal = function IconInfoModal() {
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "icon-info-modal"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "icon-info-modal__description"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.iconInfo.description1'
    }), ' ', /*#__PURE__*/_react["default"].createElement("code", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.iconInfo.code'
    })), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.iconInfo.description2'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "icon-info-modal__example"
    }, /*#__PURE__*/_react["default"].createElement(StyledTitle, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.iconInfo.example'
    })), /*#__PURE__*/_react["default"].createElement(ExampleTable, null)), /*#__PURE__*/_react["default"].createElement("div", {
      className: "icon-info-modal__icons"
    }, /*#__PURE__*/_react["default"].createElement(StyledTitle, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.iconInfo.icons'
    })), /*#__PURE__*/_react["default"].createElement(IconTable, {
      className: "icon-info-modal__icons__table"
    }, svgIcons.map(function (icon) {
      return /*#__PURE__*/_react["default"].createElement(IconItem, {
        key: icon.id,
        icon: icon
      });
    }))));
  };

  return IconInfoModal;
};

var _default = IconInfoModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaWNvbi1sYXllci9pY29uLWluZm8tbW9kYWwuanMiXSwibmFtZXMiOlsibGluZUZ1bmN0aW9uIiwieCIsImQiLCJ5IiwiSWNvblNoYXBlIiwibWVzaCIsImNlbGxzIiwibWFwIiwiY2VsbCIsImkiLCJpZHgiLCJwb3NpdGlvbnMiLCJTdHlsZWRJY29uSXRlbSIsIkNlbnRlckZsZXhib3giLCJTdHlsZWRDb2RlIiwic3R5bGVkIiwiY29kZSIsInByb3BzIiwidGhlbWUiLCJ0aXRsZUNvbG9yTFQiLCJTdHlsZWRUaXRsZSIsImRpdiIsIkljb25JdGVtIiwiaWNvbiIsImlkIiwiRXhhbXBsZVRhYmxlIiwiSWNvblRhYmxlIiwiSWNvbkluZm9Nb2RhbEZhY3RvcnkiLCJzdmdJY29ucyIsIkljb25JbmZvTW9kYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUcscUJBQ2xCQyxDQURrQixDQUNoQixVQUFBQyxDQUFDO0FBQUEsU0FBSUEsQ0FBQyxDQUFDLENBQUQsQ0FBRCxHQUFPLEVBQVg7QUFBQSxDQURlLEVBRWxCQyxDQUZrQixDQUVoQixVQUFBRCxDQUFDO0FBQUEsU0FBSUEsQ0FBQyxDQUFDLENBQUQsQ0FBRCxHQUFPLEVBQVg7QUFBQSxDQUZlLENBQXJCOztBQUlBLElBQU1FLFNBQVMsR0FBRyxTQUFaQSxTQUFZO0FBQUEsTUFBRUMsSUFBRixRQUFFQSxJQUFGO0FBQUEsc0JBQ2hCO0FBQUssSUFBQSxLQUFLLEVBQUMsTUFBWDtBQUFrQixJQUFBLE1BQU0sRUFBQztBQUF6QixrQkFDRTtBQUFHLElBQUEsU0FBUyxFQUFDO0FBQWIsS0FDR0EsSUFBSSxDQUFDQyxLQUFMLENBQVdDLEdBQVgsQ0FBZSxVQUFDQyxJQUFELEVBQU9DLENBQVA7QUFBQSx3QkFDZDtB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QUFDO0FBQWYsb0JBQ0UsZ0NBQUMsV0FBRCxxQkFDRSxnQ0FBQyw4QkFBRDtBQUFrQixNQUFBLEVBQUUsRUFBRTtBQUF0QixNQURGLENBREYsZUFJRSxnQ0FBQyxTQUFEO0FBQVcsTUFBQSxTQUFTLEVBQUM7QUFBckIsT0FDR0QsUUFBUSxDQUFDckIsR0FBVCxDQUFhLFVBQUFnQixJQUFJO0FBQUEsMEJBQ2hCLGdDQUFDLFFBQUQ7QUFBVSxRQUFBLEdBQUcsRUFBRUEsSUFBSSxDQUFDQyxFQUFwQjtBQUF3QixRQUFBLElBQUksRUFBRUQ7QUFBOUIsUUFEZ0I7QUFBQSxLQUFqQixDQURILENBSkYsQ0FkRixDQURvQjtBQUFBLEdBQXRCOztBQTRCQSxTQUFPTSxhQUFQO0FBQ0QsQ0E5QkQ7O2VBZ0NlRixvQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7bGluZX0gZnJvbSAnZDMtc2hhcGUnO1xuaW1wb3J0IHtUYWJsZSwgQ2VudGVyRmxleGJveH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBsaW5lRnVuY3Rpb24gPSBsaW5lKClcbiAgLngoZCA9PiBkWzBdICogMTApXG4gIC55KGQgPT4gZFsxXSAqIDEwKTtcblxuY29uc3QgSWNvblNoYXBlID0gKHttZXNofSkgPT4gKFxuICA8c3ZnIHdpZHRoPVwiMjBweFwiIGhlaWdodD1cIjIwcHhcIj5cbiAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMTAsIDEwKVwiPlxuICAgICAge21lc2guY2VsbHMubWFwKChjZWxsLCBpKSA9PiAoXG4gICAgICAgIDxwYXRoIGtleT17aX0gZmlsbD1cIiMwMDAwMDBcIiBkPXtsaW5lRnVuY3Rpb24oY2VsbC5tYXAoaWR4ID0+IG1lc2gucG9zaXRpb25zW2lkeF0pKX0gLz5cbiAgICAgICkpfVxuICAgIDwvZz5cbiAgPC9zdmc+XG4pO1xuXG5jb25zdCBTdHlsZWRJY29uSXRlbSA9IHN0eWxlZChDZW50ZXJGbGV4Ym94KWBcbiAgcGFkZGluZy1sZWZ0OiA2cHg7XG4gIHdpZHRoOiAxODBweDtcbiAgaGVpZ2h0OiA0OHB4O1xuICBtYXJnaW4tcmlnaHQ6IDEycHg7XG5cbiAgLmljb24tdGFibGVfaXRlbV9fbmFtZSB7XG4gICAgbWFyZ2luLWxlZnQ6IDEycHg7XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZENvZGUgPSBzdHlsZWQuY29kZWBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGl0bGVDb2xvckxUfTtcbmA7XG5cbmNvbnN0IFN0eWxlZFRpdGxlID0gc3R5bGVkLmRpdmBcbiAgZm9udC1zaXplOiAyMHB4O1xuICBsZXR0ZXItc3BhY2luZzogMS4yNXB4O1xuICBtYXJnaW46IDE4cHggMCAxNHB4IDA7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpdGxlQ29sb3JMVH07XG5gO1xuXG5jb25zdCBJY29uSXRlbSA9ICh7aWNvbjoge2lkLCBtZXNofX0pID0+IChcbiAgPFN0eWxlZEljb25JdGVtIGNsYXNzTmFtZT1cImljb24tdGFibGVfX2l0ZW1cIj5cbiAgICA8SWNvblNoYXBlIGNsYXNzTmFtZT1cImljb24tdGFibGVfX2l0ZW1fX3NoYXBlXCIgbWVzaD17bWVzaH0gLz5cbiAgICA8ZGl2IGNsYXNzTmFtZT1cImljb24tdGFibGVfaXRlbV9fbmFtZVwiPlxuICAgICAgPFN0eWxlZENvZGU+e2lkfTwvU3R5bGVkQ29kZT5cbiAgICA8L2Rpdj5cbiAgPC9TdHlsZWRJY29uSXRlbT5cbik7XG5cbmNvbnN0IEV4YW1wbGVUYWJsZSA9ICgpID0+IChcbiAgPFRhYmxlIGNsYXNzTmFtZT1cImljb24tZXhhbXBsZS10YWJsZVwiPlxuICAgIDx0aGVhZD5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRoPnBvaW50X2xhdDwvdGg+XG4gICAgICAgIDx0aD5wb2ludF9sbmc8L3RoPlxuICAgICAgICA8dGg+aWNvbjwvdGg+XG4gICAgICA8L3RyPlxuICAgIDwvdGhlYWQ+XG4gICAgPHRib2R5PlxuICAgICAgPHRyPlxuICAgICAgICA8dGQ+MzcuNzY5ODk3PC90ZD5cbiAgICAgICAgPHRkPi0xMjIuNDExNjg8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPFN0eWxlZENvZGU+YW5kcm9pZDwvU3R5bGVkQ29kZT5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICA8dHI+XG4gICAgICAgIDx0ZD4zNy44MDY5Mjg8L3RkPlxuICAgICAgICA8dGQ+LTEyMi40MDIxODwvdGQ+XG4gICAgICAgIDx0ZCAvPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3Ljc3ODU2NDwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjM5MDk2PC90ZD5cbiAgICAgICAgPHRkPlxuICAgICAgICAgIDxTdHlsZWRDb2RlPmNhbGVuZGFyPC9TdHlsZWRDb2RlPlxuICAgICAgICA8L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPjM3Ljc0NTk5NTwvdGQ+XG4gICAgICAgIDx0ZD4tMTIyLjMwMjIwPC90ZD5cbiAgICAgICAgPHRkIC8+XG4gICAgICA8L3RyPlxuICAgICAgPHRyPlxuICAgICAgICA8dGQ+MzcuMzI5ODQxPC90ZD5cbiAgICAgICAgPHRkPi0xMjIuMTAzODQ3PC90ZD5cbiAgICAgICAgPHRkPlxuICAgICAgICAgIDxTdHlsZWRDb2RlPmNvbnRyb2wtb2ZmPC9TdHlsZWRDb2RlPlxuICAgICAgICA8L3RkPlxuICAgICAgPC90cj5cbiAgICA8L3Rib2R5PlxuICA8L1RhYmxlPlxuKTtcblxuY29uc3QgSWNvblRhYmxlID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gIGZsZXgtd3JhcDogd3JhcDtcbmA7XG5cbmNvbnN0IEljb25JbmZvTW9kYWxGYWN0b3J5ID0gKHN2Z0ljb25zID0gW10pID0+IHtcbiAgY29uc3QgSWNvbkluZm9Nb2RhbCA9ICgpID0+IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImljb24taW5mby1tb2RhbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uLWluZm8tbW9kYWxfX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuaWNvbkluZm8uZGVzY3JpcHRpb24xJ30gLz57JyAnfVxuICAgICAgICA8Y29kZT5cbiAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmljb25JbmZvLmNvZGUnfSAvPlxuICAgICAgICA8L2NvZGU+XG4gICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuaWNvbkluZm8uZGVzY3JpcHRpb24yJ30gLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uLWluZm8tbW9kYWxfX2V4YW1wbGVcIj5cbiAgICAgICAgPFN0eWxlZFRpdGxlPlxuICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuaWNvbkluZm8uZXhhbXBsZSd9IC8+XG4gICAgICAgIDwvU3R5bGVkVGl0bGU+XG4gICAgICAgIDxFeGFtcGxlVGFibGUgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uLWluZm8tbW9kYWxfX2ljb25zXCI+XG4gICAgICAgIDxTdHlsZWRUaXRsZT5cbiAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmljb25JbmZvLmljb25zJ30gLz5cbiAgICAgICAgPC9TdHlsZWRUaXRsZT5cbiAgICAgICAgPEljb25UYWJsZSBjbGFzc05hbWU9XCJpY29uLWluZm8tbW9kYWxfX2ljb25zX190YWJsZVwiPlxuICAgICAgICAgIHtzdmdJY29ucy5tYXAoaWNvbiA9PiAoXG4gICAgICAgICAgICA8SWNvbkl0ZW0ga2V5PXtpY29uLmlkfSBpY29uPXtpY29ufSAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0ljb25UYWJsZT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xuXG4gIHJldHVybiBJY29uSW5mb01vZGFsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSWNvbkluZm9Nb2RhbEZhY3Rvcnk7XG4iXX0=