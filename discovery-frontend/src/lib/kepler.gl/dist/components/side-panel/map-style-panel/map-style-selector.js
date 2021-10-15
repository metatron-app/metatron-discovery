"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _classnames = _interopRequireDefault(require("classnames"));

var _icons = require("../../common/icons");

var _panelHeaderAction = _interopRequireDefault(require("../panel-header-action"));

var _styledComponents2 = require("../../common/styled-components");

var _localization = require("../../../localization");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  height: 48px;\n  margin-bottom: 5px;\n  opacity: 1;\n  position: relative;\n  transition: opacity 0.05s ease-in, height 0.25s ease-out;\n\n  &.collapsed {\n    height: 0;\n    margin-bottom: 0;\n    opacity: 0;\n  }\n\n  :hover {\n    cursor: pointer;\n    background-color: ", ";\n  }\n\n  .map-title-block img {\n    margin-right: 12px;\n  }\n\n  .map-preview {\n    border-radius: 3px;\n    height: 30px;\n    width: 40px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledMapDropdown = (0, _styledComponents["default"])(_styledComponents2.StyledPanelHeader)(_templateObject(), function (props) {
  return props.theme.panelBackgroundHover;
});

function MapStyleSelectorFactory() {
  var MapStyleSelector = function MapStyleSelector(_ref) {
    var mapStyle = _ref.mapStyle,
        onChange = _ref.onChange,
        toggleActive = _ref.toggleActive,
        isSelecting = _ref.isSelecting;
    return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'mapManager.mapStyle'
    })), Object.keys(mapStyle.mapStyles).map(function (op) {
      return /*#__PURE__*/_react["default"].createElement(StyledMapDropdown, {
        className: (0, _classnames["default"])('map-dropdown-option', {
          collapsed: !isSelecting && mapStyle.styleType !== op
        }),
        key: op,
        onClick: isSelecting ? function () {
          return onChange(op);
        } : toggleActive
      }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelHeaderContent, {
        className: "map-title-block"
      }, /*#__PURE__*/_react["default"].createElement("img", {
        className: "map-preview",
        src: mapStyle.mapStyles[op].icon
      }), /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelHeaderTitle, {
        className: "map-preview-name"
      }, mapStyle.mapStyles[op].label)), !isSelecting ? /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
        className: "map-dropdown-option__enable-config",
        id: "map-enable-config",
        IconComponent: _icons.ArrowDown,
        tooltip: 'tooltip.selectBaseMapStyle',
        onClick: toggleActive
      }) : null);
    }));
  };

  return MapStyleSelector;
}

var _default = MapStyleSelectorFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbWFwLXN0eWxlLXBhbmVsL21hcC1zdHlsZS1zZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJTdHlsZWRNYXBEcm9wZG93biIsIlN0eWxlZFBhbmVsSGVhZGVyIiwicHJvcHMiLCJ0aGVtZSIsInBhbmVsQmFja2dyb3VuZEhvdmVyIiwiTWFwU3R5bGVTZWxlY3RvckZhY3RvcnkiLCJNYXBTdHlsZVNlbGVjdG9yIiwibWFwU3R5bGUiLCJvbkNoYW5nZSIsInRvZ2dsZUFjdGl2ZSIsImlzU2VsZWN0aW5nIiwiT2JqZWN0Iiwia2V5cyIsIm1hcFN0eWxlcyIsIm1hcCIsIm9wIiwiY29sbGFwc2VkIiwic3R5bGVUeXBlIiwiaWNvbiIsImxhYmVsIiwiQXJyb3dEb3duIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFNQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsaUJBQWlCLEdBQUcsa0NBQU9DLG9DQUFQLENBQUgsb0JBZUMsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxvQkFBaEI7QUFBQSxDQWZOLENBQXZCOztBQTZCQSxTQUFTQyx1QkFBVCxHQUFtQztBQUNqQyxNQUFNQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CO0FBQUEsUUFBRUMsUUFBRixRQUFFQSxRQUFGO0FBQUEsUUFBWUMsUUFBWixRQUFZQSxRQUFaO0FBQUEsUUFBc0JDLFlBQXRCLFFBQXNCQSxZQUF0QjtBQUFBLFFBQW9DQyxXQUFwQyxRQUFvQ0EsV0FBcEM7QUFBQSx3QkFDdkIsMERBQ0UsZ0NBQUMsNkJBQUQscUJBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsTUFBQSxFQUFFLEVBQUU7QUFBdEIsTUFERixDQURGLEVBSUdDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxRQUFRLENBQUNNLFNBQXJCLEVBQWdDQyxHQUFoQyxDQUFvQyxVQUFBQyxFQUFFO0FBQUEsMEJBQ3JDLGdDQUFDLGlCQUFEO0FBQ0UsUUFBQSxTQUFTLEVBQUUsNEJBQVcscUJBQVgsRUFBa0M7QUFDM0NDLFVBQUFBLFNBQVMsRUFBRSxDQUFDTixXQUFELElBQWdCSCxRQUFRLENBQUNVLFNBQVQsS0FBdUJGO0FBRFAsU0FBbEMsQ0FEYjtBQUlFLFFBQUEsR0FBRyxFQUFFQSxFQUpQO0FBS0UsUUFBQSxPQUFPLEVBQUVMLFdBQVcsR0FBRztBQUFBLGlCQUFNRixRQUFRLENBQUNPLEVBQUQsQ0FBZDtBQUFBLFNBQUgsR0FBd0JOO0FBTDlDLHNCQU9FLGdDQUFDLHFDQUFEO0FBQW9CLFFBQUEsU0FBUyxFQUFDO0FBQTlCLHNCQUNFO0FBQUssUUFBQSxTQUFTLEVBQUMsYUFBZjtBQUE2QixRQUFBLEdBQUcsRUFBRUYsUUFBUSxDQUFDTSxTQUFULENBQW1CRSxFQUFuQixFQUF1Qkc7QUFBekQsUUFERixlQUVFLGdDQUFDLG1DQUFEO0FBQWtCLFFBQUEsU0FBUyxFQUFDO0FBQTVCLFNBQ0dYLFFBQVEsQ0FBQ00sU0FBVCxDQUFtQkUsRUFBbkIsRUFBdUJJLEtBRDFCLENBRkYsQ0FQRixFQWFHLENBQUNULFdBQUQsZ0JBQ0MsZ0NBQUMsNkJBQUQ7QUFDRSxRQUFBLFNBQVMsRUFBQyxvQ0FEWjtBQUVFLFFBQUEsRUFBRSxFQUFDLG1CQUZMO0FBR0UsUUFBQSxhQUFhLEVBQUVVLGdCQUhqQjtBQUlFLFFBQUEsT0FBTyxFQUFFLDRCQUpYO0FBS0UsUUFBQSxPQUFPLEVBQUVYO0FBTFgsUUFERCxHQVFHLElBckJOLENBRHFDO0FBQUEsS0FBdEMsQ0FKSCxDQUR1QjtBQUFBLEdBQXpCOztBQWlDQSxTQUFPSCxnQkFBUDtBQUNEOztlQUVjRCx1QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtBcnJvd0Rvd259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBQYW5lbEhlYWRlckFjdGlvbiBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvcGFuZWwtaGVhZGVyLWFjdGlvbic7XG5cbmltcG9ydCB7XG4gIFBhbmVsSGVhZGVyQ29udGVudCxcbiAgUGFuZWxIZWFkZXJUaXRsZSxcbiAgUGFuZWxMYWJlbCxcbiAgU3R5bGVkUGFuZWxIZWFkZXJcbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBTdHlsZWRNYXBEcm9wZG93biA9IHN0eWxlZChTdHlsZWRQYW5lbEhlYWRlcilgXG4gIGhlaWdodDogNDhweDtcbiAgbWFyZ2luLWJvdHRvbTogNXB4O1xuICBvcGFjaXR5OiAxO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4wNXMgZWFzZS1pbiwgaGVpZ2h0IDAuMjVzIGVhc2Utb3V0O1xuXG4gICYuY29sbGFwc2VkIHtcbiAgICBoZWlnaHQ6IDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgICBvcGFjaXR5OiAwO1xuICB9XG5cbiAgOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbEJhY2tncm91bmRIb3Zlcn07XG4gIH1cblxuICAubWFwLXRpdGxlLWJsb2NrIGltZyB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMnB4O1xuICB9XG5cbiAgLm1hcC1wcmV2aWV3IHtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgaGVpZ2h0OiAzMHB4O1xuICAgIHdpZHRoOiA0MHB4O1xuICB9XG5gO1xuXG5mdW5jdGlvbiBNYXBTdHlsZVNlbGVjdG9yRmFjdG9yeSgpIHtcbiAgY29uc3QgTWFwU3R5bGVTZWxlY3RvciA9ICh7bWFwU3R5bGUsIG9uQ2hhbmdlLCB0b2dnbGVBY3RpdmUsIGlzU2VsZWN0aW5nfSkgPT4gKFxuICAgIDxkaXY+XG4gICAgICA8UGFuZWxMYWJlbD5cbiAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtYXBNYW5hZ2VyLm1hcFN0eWxlJ30gLz5cbiAgICAgIDwvUGFuZWxMYWJlbD5cbiAgICAgIHtPYmplY3Qua2V5cyhtYXBTdHlsZS5tYXBTdHlsZXMpLm1hcChvcCA9PiAoXG4gICAgICAgIDxTdHlsZWRNYXBEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnbWFwLWRyb3Bkb3duLW9wdGlvbicsIHtcbiAgICAgICAgICAgIGNvbGxhcHNlZDogIWlzU2VsZWN0aW5nICYmIG1hcFN0eWxlLnN0eWxlVHlwZSAhPT0gb3BcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBrZXk9e29wfVxuICAgICAgICAgIG9uQ2xpY2s9e2lzU2VsZWN0aW5nID8gKCkgPT4gb25DaGFuZ2Uob3ApIDogdG9nZ2xlQWN0aXZlfVxuICAgICAgICA+XG4gICAgICAgICAgPFBhbmVsSGVhZGVyQ29udGVudCBjbGFzc05hbWU9XCJtYXAtdGl0bGUtYmxvY2tcIj5cbiAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibWFwLXByZXZpZXdcIiBzcmM9e21hcFN0eWxlLm1hcFN0eWxlc1tvcF0uaWNvbn0gLz5cbiAgICAgICAgICAgIDxQYW5lbEhlYWRlclRpdGxlIGNsYXNzTmFtZT1cIm1hcC1wcmV2aWV3LW5hbWVcIj5cbiAgICAgICAgICAgICAge21hcFN0eWxlLm1hcFN0eWxlc1tvcF0ubGFiZWx9XG4gICAgICAgICAgICA8L1BhbmVsSGVhZGVyVGl0bGU+XG4gICAgICAgICAgPC9QYW5lbEhlYWRlckNvbnRlbnQ+XG4gICAgICAgICAgeyFpc1NlbGVjdGluZyA/IChcbiAgICAgICAgICAgIDxQYW5lbEhlYWRlckFjdGlvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtYXAtZHJvcGRvd24tb3B0aW9uX19lbmFibGUtY29uZmlnXCJcbiAgICAgICAgICAgICAgaWQ9XCJtYXAtZW5hYmxlLWNvbmZpZ1wiXG4gICAgICAgICAgICAgIEljb25Db21wb25lbnQ9e0Fycm93RG93bn1cbiAgICAgICAgICAgICAgdG9vbHRpcD17J3Rvb2x0aXAuc2VsZWN0QmFzZU1hcFN0eWxlJ31cbiAgICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlQWN0aXZlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9TdHlsZWRNYXBEcm9wZG93bj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApO1xuXG4gIHJldHVybiBNYXBTdHlsZVNlbGVjdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNYXBTdHlsZVNlbGVjdG9yRmFjdG9yeTtcbiJdfQ==