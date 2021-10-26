"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.UploadAnimation = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _icons = require("../common/icons");

var _styledComponents2 = require("../common/styled-components");

var _errorDisplay = _interopRequireDefault(require("./error-display"));

var _localization = require("../../localization");

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-right: 16px;\n\n  line {\n    stroke: ", ";\n    stroke-width: 4;\n    stroke-linecap: square;\n    stroke-dasharray: 5 12;\n    animation: dash-animation 25s infinite linear;\n  }\n  circle {\n    fill: ", ";\n  }\n\n  @keyframes dash-animation {\n    to {\n      stroke-dashoffset: -1000;\n    }\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  margin-right: 16px;\n  margin-top: 4px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledUploader = _styledComponents["default"].div(_templateObject());

var StyledMapIcon = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.textColorLT;
});

var StyledSvg = _styledComponents["default"].svg(_templateObject3(), function (props) {
  return props.theme.selectBorderColorLT;
}, function (props) {
  return props.theme.selectBorderColorLT;
});

var Line = function Line() {
  return /*#__PURE__*/_react["default"].createElement(StyledSvg, {
    height: "5px",
    width: "150px"
  }, /*#__PURE__*/_react["default"].createElement("line", {
    x1: "0",
    y1: "4",
    x2: "150",
    y2: "4"
  }));
};

var UploadAnimation = function UploadAnimation(props) {
  return /*#__PURE__*/_react["default"].createElement(StyledUploader, null, /*#__PURE__*/_react["default"].createElement(StyledMapIcon, null, /*#__PURE__*/_react["default"].createElement(_icons.MapIcon, {
    height: "48px"
  })), /*#__PURE__*/_react["default"].createElement(Line, null), props.icon && /*#__PURE__*/_react["default"].createElement(props.icon, {
    height: "64px"
  }));
};

exports.UploadAnimation = UploadAnimation;

var StatusPanel = function StatusPanel(_ref) {
  var error = _ref.error,
      isLoading = _ref.isLoading,
      providerIcon = _ref.providerIcon;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "description"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "title"
  }, isLoading ? /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: 'modal.statusPanel.mapUploading'
  }) : error ? /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: 'modal.statusPanel.error'
  }) : null)), /*#__PURE__*/_react["default"].createElement("div", {
    className: "selection"
  }, isLoading && /*#__PURE__*/_react["default"].createElement(UploadAnimation, {
    icon: providerIcon
  }), error && /*#__PURE__*/_react["default"].createElement(_errorDisplay["default"], {
    error: error
  })));
};

var _default = StatusPanel;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9zdGF0dXMtcGFuZWwuanMiXSwibmFtZXMiOlsiU3R5bGVkVXBsb2FkZXIiLCJzdHlsZWQiLCJkaXYiLCJTdHlsZWRNYXBJY29uIiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvckxUIiwiU3R5bGVkU3ZnIiwic3ZnIiwic2VsZWN0Qm9yZGVyQ29sb3JMVCIsIkxpbmUiLCJVcGxvYWRBbmltYXRpb24iLCJpY29uIiwiU3RhdHVzUGFuZWwiLCJlcnJvciIsImlzTG9hZGluZyIsInByb3ZpZGVySWNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsY0FBYyxHQUFHQyw2QkFBT0MsR0FBVixtQkFBcEI7O0FBTUEsSUFBTUMsYUFBYSxHQUFHRiw2QkFBT0MsR0FBVixxQkFDUixVQUFBRSxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLFdBQWhCO0FBQUEsQ0FERyxDQUFuQjs7QUFNQSxJQUFNQyxTQUFTLEdBQUdOLDZCQUFPTyxHQUFWLHFCQUlELFVBQUFKLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUksbUJBQWhCO0FBQUEsQ0FKSixFQVdILFVBQUFMLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUksbUJBQWhCO0FBQUEsQ0FYRixDQUFmOztBQXFCQSxJQUFNQyxJQUFJLEdBQUcsU0FBUEEsSUFBTztBQUFBLHNCQUNYLGdDQUFDLFNBQUQ7QUFBVyxJQUFBLE1BQU0sRUFBQyxLQUFsQjtBQUF3QixJQUFBLEtBQUssRUFBQztBQUE5QixrQkFDRTtBQUFNLElBQUEsRUFBRSxFQUFDLEdBQVQ7QUFBYSxJQUFBLEVBQUUsRUFBQyxHQUFoQjtBQUFvQixJQUFBLEVBQUUsRUFBQyxLQUF2QjtBQUE2QixJQUFBLEVBQUUsRUFBQztBQUFoQyxJQURGLENBRFc7QUFBQSxDQUFiOztBQU1PLElBQU1DLGVBQWUsR0FBRyxTQUFsQkEsZUFBa0IsQ0FBQVAsS0FBSztBQUFBLHNCQUNsQyxnQ0FBQyxjQUFELHFCQUNFLGdDQUFDLGFBQUQscUJBQ0UsZ0NBQUMsY0FBRDtBQUFTLElBQUEsTUFBTSxFQUFDO0FBQWhCLElBREYsQ0FERixlQUlFLGdDQUFDLElBQUQsT0FKRixFQUtHQSxLQUFLLENBQUNRLElBQU4saUJBQWMsZ0NBQUMsS0FBRCxDQUFPLElBQVA7QUFBWSxJQUFBLE1BQU0sRUFBQztBQUFuQixJQUxqQixDQURrQztBQUFBLENBQTdCOzs7O0FBVVAsSUFBTUMsV0FBVyxHQUFHLFNBQWRBLFdBQWM7QUFBQSxNQUFFQyxLQUFGLFFBQUVBLEtBQUY7QUFBQSxNQUFTQyxTQUFULFFBQVNBLFNBQVQ7QUFBQSxNQUFvQkMsWUFBcEIsUUFBb0JBLFlBQXBCO0FBQUEsc0JBQ2xCLGdDQUFDLHNDQUFELHFCQUNFO0FBQUssSUFBQSxTQUFTLEVBQUM7QUFBZixrQkFDRTtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsS0FDR0QsU0FBUyxnQkFDUixnQ0FBQyw4QkFBRDtBQUFrQixJQUFBLEVBQUUsRUFBRTtBQUF0QixJQURRLEdBRU5ELEtBQUssZ0JBQ1AsZ0NBQUMsOEJBQUQ7QUFBa0IsSUFBQSxFQUFFLEVBQUU7QUFBdEIsSUFETyxHQUVMLElBTE4sQ0FERixDQURGLGVBVUU7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ0dDLFNBQVMsaUJBQUksZ0NBQUMsZUFBRDtBQUFpQixJQUFBLElBQUksRUFBRUM7QUFBdkIsSUFEaEIsRUFFR0YsS0FBSyxpQkFBSSxnQ0FBQyx3QkFBRDtBQUFjLElBQUEsS0FBSyxFQUFFQTtBQUFyQixJQUZaLENBVkYsQ0FEa0I7QUFBQSxDQUFwQjs7ZUFrQmVELFciLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge01hcEljb259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCB7U3R5bGVkRXhwb3J0U2VjdGlvbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IEVycm9yRGlzcGxheSBmcm9tICcuL2Vycm9yLWRpc3BsYXknO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBTdHlsZWRVcGxvYWRlciA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbmA7XG5cbmNvbnN0IFN0eWxlZE1hcEljb24gPSBzdHlsZWQuZGl2YFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gIG1hcmdpbi1yaWdodDogMTZweDtcbiAgbWFyZ2luLXRvcDogNHB4O1xuYDtcblxuY29uc3QgU3R5bGVkU3ZnID0gc3R5bGVkLnN2Z2BcbiAgbWFyZ2luLXJpZ2h0OiAxNnB4O1xuXG4gIGxpbmUge1xuICAgIHN0cm9rZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zZWxlY3RCb3JkZXJDb2xvckxUfTtcbiAgICBzdHJva2Utd2lkdGg6IDQ7XG4gICAgc3Ryb2tlLWxpbmVjYXA6IHNxdWFyZTtcbiAgICBzdHJva2UtZGFzaGFycmF5OiA1IDEyO1xuICAgIGFuaW1hdGlvbjogZGFzaC1hbmltYXRpb24gMjVzIGluZmluaXRlIGxpbmVhcjtcbiAgfVxuICBjaXJjbGUge1xuICAgIGZpbGw6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2VsZWN0Qm9yZGVyQ29sb3JMVH07XG4gIH1cblxuICBAa2V5ZnJhbWVzIGRhc2gtYW5pbWF0aW9uIHtcbiAgICB0byB7XG4gICAgICBzdHJva2UtZGFzaG9mZnNldDogLTEwMDA7XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBMaW5lID0gKCkgPT4gKFxuICA8U3R5bGVkU3ZnIGhlaWdodD1cIjVweFwiIHdpZHRoPVwiMTUwcHhcIj5cbiAgICA8bGluZSB4MT1cIjBcIiB5MT1cIjRcIiB4Mj1cIjE1MFwiIHkyPVwiNFwiIC8+XG4gIDwvU3R5bGVkU3ZnPlxuKTtcblxuZXhwb3J0IGNvbnN0IFVwbG9hZEFuaW1hdGlvbiA9IHByb3BzID0+IChcbiAgPFN0eWxlZFVwbG9hZGVyPlxuICAgIDxTdHlsZWRNYXBJY29uPlxuICAgICAgPE1hcEljb24gaGVpZ2h0PVwiNDhweFwiIC8+XG4gICAgPC9TdHlsZWRNYXBJY29uPlxuICAgIDxMaW5lIC8+XG4gICAge3Byb3BzLmljb24gJiYgPHByb3BzLmljb24gaGVpZ2h0PVwiNjRweFwiIC8+fVxuICA8L1N0eWxlZFVwbG9hZGVyPlxuKTtcblxuY29uc3QgU3RhdHVzUGFuZWwgPSAoe2Vycm9yLCBpc0xvYWRpbmcsIHByb3ZpZGVySWNvbn0pID0+IChcbiAgPFN0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgPGRpdiBjbGFzc05hbWU9XCJkZXNjcmlwdGlvblwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICB7aXNMb2FkaW5nID8gKFxuICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc3RhdHVzUGFuZWwubWFwVXBsb2FkaW5nJ30gLz5cbiAgICAgICAgKSA6IGVycm9yID8gKFxuICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc3RhdHVzUGFuZWwuZXJyb3InfSAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICB7aXNMb2FkaW5nICYmIDxVcGxvYWRBbmltYXRpb24gaWNvbj17cHJvdmlkZXJJY29ufSAvPn1cbiAgICAgIHtlcnJvciAmJiA8RXJyb3JEaXNwbGF5IGVycm9yPXtlcnJvcn0gLz59XG4gICAgPC9kaXY+XG4gIDwvU3R5bGVkRXhwb3J0U2VjdGlvbj5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXR1c1BhbmVsO1xuIl19