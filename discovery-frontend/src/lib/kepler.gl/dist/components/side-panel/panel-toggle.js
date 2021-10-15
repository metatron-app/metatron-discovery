"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _localization = require("../../localization");

var _styledComponents2 = require("../common/styled-components");

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: flex-end;\n  border-bottom-style: solid;\n  border-bottom-width: 2px;\n  border-bottom-color: ", ";\n  color: ", ";\n  display: flex;\n  justify-content: center;\n  margin-right: ", "px;\n  padding-bottom: ", "px;\n  width: ", ";\n\n  :hover {\n    cursor: pointer;\n    color: ", ";\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  border-bottom: 1px solid ", ";\n  padding: 0 16px;\n  display: flex;\n  min-height: 30px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var propTypes = {
  panels: _propTypes["default"].arrayOf(_propTypes["default"].object),
  activePanel: _propTypes["default"].string,
  togglePanel: _propTypes["default"].func
};

var PanelHeaderBottom = _styledComponents["default"].div.attrs({
  className: 'side-side-panel__header__bottom'
})(_templateObject(), function (props) {
  return props.theme.sidePanelHeaderBg;
}, function (props) {
  return props.theme.sidePanelHeaderBorder;
});

var PanelTab = _styledComponents["default"].div.attrs({
  className: 'side-panel__tab'
})(_templateObject2(), function (props) {
  return props.active ? props.theme.panelToggleBorderColor : 'transparent';
}, function (props) {
  return props.active ? props.theme.subtextColorActive : props.theme.subtextColor;
}, function (props) {
  return props.theme.panelToggleMarginRight;
}, function (props) {
  return props.theme.panelToggleBottomPadding;
}, function (props) {
  return props.theme.panelTabWidth;
}, function (props) {
  return props.theme.textColorHl;
});

var PanelToggleFactory = function PanelToggleFactory() {
  var PanelToggle = function PanelToggle(_ref) {
    var panels = _ref.panels,
        activePanel = _ref.activePanel,
        togglePanel = _ref.togglePanel;
    return /*#__PURE__*/_react["default"].createElement(PanelHeaderBottom, null, panels.map(function (panel) {
      return /*#__PURE__*/_react["default"].createElement(PanelTab, {
        key: panel.id,
        "data-tip": true,
        "data-for": "".concat(panel.id, "-nav"),
        active: activePanel === panel.id,
        onClick: function onClick() {
          return togglePanel(panel.id);
        }
      }, /*#__PURE__*/_react["default"].createElement(panel.iconComponent, {
        height: "20px"
      }), /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
        id: "".concat(panel.id, "-nav"),
        effect: "solid",
        delayShow: 500,
        place: "bottom"
      }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: panel.label || panel.id
      }))));
    }));
  };

  PanelToggle.propTypes = propTypes;
  return PanelToggle;
};

var _default = PanelToggleFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvcGFuZWwtdG9nZ2xlLmpzIl0sIm5hbWVzIjpbInByb3BUeXBlcyIsInBhbmVscyIsIlByb3BUeXBlcyIsImFycmF5T2YiLCJvYmplY3QiLCJhY3RpdmVQYW5lbCIsInN0cmluZyIsInRvZ2dsZVBhbmVsIiwiZnVuYyIsIlBhbmVsSGVhZGVyQm90dG9tIiwic3R5bGVkIiwiZGl2IiwiYXR0cnMiLCJjbGFzc05hbWUiLCJwcm9wcyIsInRoZW1lIiwic2lkZVBhbmVsSGVhZGVyQmciLCJzaWRlUGFuZWxIZWFkZXJCb3JkZXIiLCJQYW5lbFRhYiIsImFjdGl2ZSIsInBhbmVsVG9nZ2xlQm9yZGVyQ29sb3IiLCJzdWJ0ZXh0Q29sb3JBY3RpdmUiLCJzdWJ0ZXh0Q29sb3IiLCJwYW5lbFRvZ2dsZU1hcmdpblJpZ2h0IiwicGFuZWxUb2dnbGVCb3R0b21QYWRkaW5nIiwicGFuZWxUYWJXaWR0aCIsInRleHRDb2xvckhsIiwiUGFuZWxUb2dnbGVGYWN0b3J5IiwiUGFuZWxUb2dnbGUiLCJtYXAiLCJwYW5lbCIsImlkIiwibGFiZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBUyxHQUFHO0FBQ2hCQyxFQUFBQSxNQUFNLEVBQUVDLHNCQUFVQyxPQUFWLENBQWtCRCxzQkFBVUUsTUFBNUIsQ0FEUTtBQUVoQkMsRUFBQUEsV0FBVyxFQUFFSCxzQkFBVUksTUFGUDtBQUdoQkMsRUFBQUEsV0FBVyxFQUFFTCxzQkFBVU07QUFIUCxDQUFsQjs7QUFNQSxJQUFNQyxpQkFBaUIsR0FBR0MsNkJBQU9DLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQjtBQUN6Q0MsRUFBQUEsU0FBUyxFQUFFO0FBRDhCLENBQWpCLENBQUgsb0JBR0QsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxpQkFBaEI7QUFBQSxDQUhKLEVBSU0sVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxxQkFBaEI7QUFBQSxDQUpYLENBQXZCOztBQVVBLElBQU1DLFFBQVEsR0FBR1IsNkJBQU9DLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQjtBQUNoQ0MsRUFBQUEsU0FBUyxFQUFFO0FBRHFCLENBQWpCLENBQUgscUJBTVcsVUFBQUMsS0FBSztBQUFBLFNBQzFCQSxLQUFLLENBQUNLLE1BQU4sR0FBZUwsS0FBSyxDQUFDQyxLQUFOLENBQVlLLHNCQUEzQixHQUFvRCxhQUQxQjtBQUFBLENBTmhCLEVBUUgsVUFBQU4sS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0ssTUFBTixHQUFlTCxLQUFLLENBQUNDLEtBQU4sQ0FBWU0sa0JBQTNCLEdBQWdEUCxLQUFLLENBQUNDLEtBQU4sQ0FBWU8sWUFBakU7QUFBQSxDQVJGLEVBV0ksVUFBQVIsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZUSxzQkFBaEI7QUFBQSxDQVhULEVBWU0sVUFBQVQsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZUyx3QkFBaEI7QUFBQSxDQVpYLEVBYUgsVUFBQVYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZVSxhQUFoQjtBQUFBLENBYkYsRUFpQkQsVUFBQVgsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZVyxXQUFoQjtBQUFBLENBakJKLENBQWQ7O0FBcUJBLElBQU1DLGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsR0FBTTtBQUMvQixNQUFNQyxXQUFXLEdBQUcsU0FBZEEsV0FBYztBQUFBLFFBQUUzQixNQUFGLFFBQUVBLE1BQUY7QUFBQSxRQUFVSSxXQUFWLFFBQVVBLFdBQVY7QUFBQSxRQUF1QkUsV0FBdkIsUUFBdUJBLFdBQXZCO0FBQUEsd0JBQ2xCLGdDQUFDLGlCQUFELFFBQ0dOLE1BQU0sQ0FBQzRCLEdBQVAsQ0FBVyxVQUFBQyxLQUFLO0FBQUEsMEJBQ2YsZ0NBQUMsUUFBRDtBQUNFLFFBQUEsR0FBRyxFQUFFQSxLQUFLLENBQUNDLEVBRGI7QUFFRSx3QkFGRjtBQUdFLDhCQUFhRCxLQUFLLENBQUNDLEVBQW5CLFNBSEY7QUFJRSxRQUFBLE1BQU0sRUFBRTFCLFdBQVcsS0FBS3lCLEtBQUssQ0FBQ0MsRUFKaEM7QUFLRSxRQUFBLE9BQU8sRUFBRTtBQUFBLGlCQUFNeEIsV0FBVyxDQUFDdUIsS0FBSyxDQUFDQyxFQUFQLENBQWpCO0FBQUE7QUFMWCxzQkFPRSxnQ0FBQyxLQUFELENBQU8sYUFBUDtBQUFxQixRQUFBLE1BQU0sRUFBQztBQUE1QixRQVBGLGVBUUUsZ0NBQUMsMEJBQUQ7QUFBUyxRQUFBLEVBQUUsWUFBS0QsS0FBSyxDQUFDQyxFQUFYLFNBQVg7QUFBZ0MsUUFBQSxNQUFNLEVBQUMsT0FBdkM7QUFBK0MsUUFBQSxTQUFTLEVBQUUsR0FBMUQ7QUFBK0QsUUFBQSxLQUFLLEVBQUM7QUFBckUsc0JBQ0UsMkRBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsUUFBQSxFQUFFLEVBQUVELEtBQUssQ0FBQ0UsS0FBTixJQUFlRixLQUFLLENBQUNDO0FBQTNDLFFBREYsQ0FERixDQVJGLENBRGU7QUFBQSxLQUFoQixDQURILENBRGtCO0FBQUEsR0FBcEI7O0FBcUJBSCxFQUFBQSxXQUFXLENBQUM1QixTQUFaLEdBQXdCQSxTQUF4QjtBQUNBLFNBQU80QixXQUFQO0FBQ0QsQ0F4QkQ7O2VBMEJlRCxrQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5pbXBvcnQge1Rvb2x0aXB9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICBwYW5lbHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLFxuICBhY3RpdmVQYW5lbDogUHJvcFR5cGVzLnN0cmluZyxcbiAgdG9nZ2xlUGFuZWw6IFByb3BUeXBlcy5mdW5jXG59O1xuXG5jb25zdCBQYW5lbEhlYWRlckJvdHRvbSA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdzaWRlLXNpZGUtcGFuZWxfX2hlYWRlcl9fYm90dG9tJ1xufSlgXG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2lkZVBhbmVsSGVhZGVyQmd9O1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zaWRlUGFuZWxIZWFkZXJCb3JkZXJ9O1xuICBwYWRkaW5nOiAwIDE2cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1pbi1oZWlnaHQ6IDMwcHg7XG5gO1xuXG5jb25zdCBQYW5lbFRhYiA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdzaWRlLXBhbmVsX190YWInXG59KWBcbiAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICBib3JkZXItYm90dG9tLXN0eWxlOiBzb2xpZDtcbiAgYm9yZGVyLWJvdHRvbS13aWR0aDogMnB4O1xuICBib3JkZXItYm90dG9tLWNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuYWN0aXZlID8gcHJvcHMudGhlbWUucGFuZWxUb2dnbGVCb3JkZXJDb2xvciA6ICd0cmFuc3BhcmVudCd9O1xuICBjb2xvcjogJHtwcm9wcyA9PiAocHJvcHMuYWN0aXZlID8gcHJvcHMudGhlbWUuc3VidGV4dENvbG9yQWN0aXZlIDogcHJvcHMudGhlbWUuc3VidGV4dENvbG9yKX07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBtYXJnaW4tcmlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxUb2dnbGVNYXJnaW5SaWdodH1weDtcbiAgcGFkZGluZy1ib3R0b206ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxUb2dnbGVCb3R0b21QYWRkaW5nfXB4O1xuICB3aWR0aDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbFRhYldpZHRofTtcblxuICA6aG92ZXIge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JIbH07XG4gIH1cbmA7XG5cbmNvbnN0IFBhbmVsVG9nZ2xlRmFjdG9yeSA9ICgpID0+IHtcbiAgY29uc3QgUGFuZWxUb2dnbGUgPSAoe3BhbmVscywgYWN0aXZlUGFuZWwsIHRvZ2dsZVBhbmVsfSkgPT4gKFxuICAgIDxQYW5lbEhlYWRlckJvdHRvbT5cbiAgICAgIHtwYW5lbHMubWFwKHBhbmVsID0+IChcbiAgICAgICAgPFBhbmVsVGFiXG4gICAgICAgICAga2V5PXtwYW5lbC5pZH1cbiAgICAgICAgICBkYXRhLXRpcFxuICAgICAgICAgIGRhdGEtZm9yPXtgJHtwYW5lbC5pZH0tbmF2YH1cbiAgICAgICAgICBhY3RpdmU9e2FjdGl2ZVBhbmVsID09PSBwYW5lbC5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGVQYW5lbChwYW5lbC5pZCl9XG4gICAgICAgID5cbiAgICAgICAgICA8cGFuZWwuaWNvbkNvbXBvbmVudCBoZWlnaHQ9XCIyMHB4XCIgLz5cbiAgICAgICAgICA8VG9vbHRpcCBpZD17YCR7cGFuZWwuaWR9LW5hdmB9IGVmZmVjdD1cInNvbGlkXCIgZGVsYXlTaG93PXs1MDB9IHBsYWNlPVwiYm90dG9tXCI+XG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9e3BhbmVsLmxhYmVsIHx8IHBhbmVsLmlkfSAvPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgPC9QYW5lbFRhYj5cbiAgICAgICkpfVxuICAgIDwvUGFuZWxIZWFkZXJCb3R0b20+XG4gICk7XG5cbiAgUGFuZWxUb2dnbGUucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuICByZXR1cm4gUGFuZWxUb2dnbGU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYW5lbFRvZ2dsZUZhY3Rvcnk7XG4iXX0=