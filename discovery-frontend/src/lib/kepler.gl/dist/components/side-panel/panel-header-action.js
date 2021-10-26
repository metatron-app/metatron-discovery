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

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames2 = _interopRequireDefault(require("classnames"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _localization = require("../../localization");

var _styledComponents2 = require("../common/styled-components");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-left: ", "px;\n  display: flex;\n  align-items: center;\n  color: ", ";\n\n  :hover {\n    cursor: pointer;\n    color: ", ";\n  }\n\n  &.disabled {\n    pointer-events: none;\n    opacity: 0.3;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var HeaderActionWrapper = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.flush ? 0 : 8;
}, function (props) {
  return props.active ? props.theme.panelHeaderIconActive : props.theme.panelHeaderIcon;
}, function (props) {
  return props.hoverColor ? props.theme[props.hoverColor] : props.theme.panelHeaderIconHover;
}); // Need to use react class to access props.component


var PanelHeaderAction = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(PanelHeaderAction, _Component);

  var _super = _createSuper(PanelHeaderAction);

  function PanelHeaderAction() {
    (0, _classCallCheck2["default"])(this, PanelHeaderAction);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(PanelHeaderAction, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          onClick = _this$props.onClick,
          tooltip = _this$props.tooltip,
          id = _this$props.id,
          active = _this$props.active,
          flush = _this$props.flush,
          hoverColor = _this$props.hoverColor,
          tooltipType = _this$props.tooltipType,
          disabled = _this$props.disabled,
          className = _this$props.className;
      return /*#__PURE__*/_react["default"].createElement(HeaderActionWrapper, {
        className: (0, _classnames2["default"])('panel--header__action', (0, _defineProperty2["default"])({
          disabled: disabled
        }, className, className)),
        active: active,
        hoverColor: hoverColor,
        flush: flush
      }, /*#__PURE__*/_react["default"].createElement(this.props.IconComponent, {
        "data-tip": true,
        "data-for": "".concat(tooltip, "_").concat(id),
        height: "16px",
        onClick: onClick
      }), tooltip ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
        id: "".concat(tooltip, "_").concat(id),
        effect: "solid",
        delayShow: 500,
        type: tooltipType
      }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: tooltip
      }))) : null);
    }
  }]);
  return PanelHeaderAction;
}(_react.Component);

exports["default"] = PanelHeaderAction;
(0, _defineProperty2["default"])(PanelHeaderAction, "propTypes", {
  id: _propTypes["default"].string,
  flush: _propTypes["default"].bool,
  tooltip: _propTypes["default"].string,
  onClick: _propTypes["default"].func,
  active: _propTypes["default"].bool,
  disabled: _propTypes["default"].bool,
  hoverColor: _propTypes["default"].string,
  className: _propTypes["default"].string,
  tooltipType: _propTypes["default"].string
});
(0, _defineProperty2["default"])(PanelHeaderAction, "defaultProps", {
  onClick: function onClick() {},
  hoverColor: null,
  active: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvcGFuZWwtaGVhZGVyLWFjdGlvbi5qcyJdLCJuYW1lcyI6WyJIZWFkZXJBY3Rpb25XcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJmbHVzaCIsImFjdGl2ZSIsInRoZW1lIiwicGFuZWxIZWFkZXJJY29uQWN0aXZlIiwicGFuZWxIZWFkZXJJY29uIiwiaG92ZXJDb2xvciIsInBhbmVsSGVhZGVySWNvbkhvdmVyIiwiUGFuZWxIZWFkZXJBY3Rpb24iLCJvbkNsaWNrIiwidG9vbHRpcCIsImlkIiwidG9vbHRpcFR5cGUiLCJkaXNhYmxlZCIsImNsYXNzTmFtZSIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsbUJBQW1CLEdBQUdDLDZCQUFPQyxHQUFWLG9CQUNSLFVBQUFDLEtBQUs7QUFBQSxTQUFLQSxLQUFLLENBQUNDLEtBQU4sR0FBYyxDQUFkLEdBQWtCLENBQXZCO0FBQUEsQ0FERyxFQUlkLFVBQUFELEtBQUs7QUFBQSxTQUNaQSxLQUFLLENBQUNFLE1BQU4sR0FBZUYsS0FBSyxDQUFDRyxLQUFOLENBQVlDLHFCQUEzQixHQUFtREosS0FBSyxDQUFDRyxLQUFOLENBQVlFLGVBRG5EO0FBQUEsQ0FKUyxFQVNaLFVBQUFMLEtBQUs7QUFBQSxTQUNaQSxLQUFLLENBQUNNLFVBQU4sR0FBbUJOLEtBQUssQ0FBQ0csS0FBTixDQUFZSCxLQUFLLENBQUNNLFVBQWxCLENBQW5CLEdBQW1ETixLQUFLLENBQUNHLEtBQU4sQ0FBWUksb0JBRG5EO0FBQUEsQ0FUTyxDQUF6QixDLENBbUJBOzs7SUFDcUJDLGlCOzs7Ozs7Ozs7Ozs7NkJBbUJWO0FBQUEsd0JBV0gsS0FBS1IsS0FYRjtBQUFBLFVBRUxTLE9BRkssZUFFTEEsT0FGSztBQUFBLFVBR0xDLE9BSEssZUFHTEEsT0FISztBQUFBLFVBSUxDLEVBSkssZUFJTEEsRUFKSztBQUFBLFVBS0xULE1BTEssZUFLTEEsTUFMSztBQUFBLFVBTUxELEtBTkssZUFNTEEsS0FOSztBQUFBLFVBT0xLLFVBUEssZUFPTEEsVUFQSztBQUFBLFVBUUxNLFdBUkssZUFRTEEsV0FSSztBQUFBLFVBU0xDLFFBVEssZUFTTEEsUUFUSztBQUFBLFVBVUxDLFNBVkssZUFVTEEsU0FWSztBQVlQLDBCQUNFLGdDQUFDLG1CQUFEO0FBQ0UsUUFBQSxTQUFTLEVBQUUsNkJBQVcsdUJBQVg7QUFBcUNELFVBQUFBLFFBQVEsRUFBUkE7QUFBckMsV0FBZ0RDLFNBQWhELEVBQTREQSxTQUE1RCxFQURiO0FBRUUsUUFBQSxNQUFNLEVBQUVaLE1BRlY7QUFHRSxRQUFBLFVBQVUsRUFBRUksVUFIZDtBQUlFLFFBQUEsS0FBSyxFQUFFTDtBQUpULHNCQU1FLHFDQUFNLEtBQU4sQ0FBWSxhQUFaO0FBQ0Usd0JBREY7QUFFRSw4QkFBYVMsT0FBYixjQUF3QkMsRUFBeEIsQ0FGRjtBQUdFLFFBQUEsTUFBTSxFQUFDLE1BSFQ7QUFJRSxRQUFBLE9BQU8sRUFBRUY7QUFKWCxRQU5GLEVBWUdDLE9BQU8sZ0JBQ04sZ0NBQUMsMEJBQUQ7QUFBUyxRQUFBLEVBQUUsWUFBS0EsT0FBTCxjQUFnQkMsRUFBaEIsQ0FBWDtBQUFpQyxRQUFBLE1BQU0sRUFBQyxPQUF4QztBQUFnRCxRQUFBLFNBQVMsRUFBRSxHQUEzRDtBQUFnRSxRQUFBLElBQUksRUFBRUM7QUFBdEUsc0JBQ0UsMkRBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsUUFBQSxFQUFFLEVBQUVGO0FBQXRCLFFBREYsQ0FERixDQURNLEdBTUosSUFsQk4sQ0FERjtBQXNCRDs7O0VBckQ0Q0ssZ0I7OztpQ0FBMUJQLGlCLGVBQ0E7QUFDakJHLEVBQUFBLEVBQUUsRUFBRUssc0JBQVVDLE1BREc7QUFFakJoQixFQUFBQSxLQUFLLEVBQUVlLHNCQUFVRSxJQUZBO0FBR2pCUixFQUFBQSxPQUFPLEVBQUVNLHNCQUFVQyxNQUhGO0FBSWpCUixFQUFBQSxPQUFPLEVBQUVPLHNCQUFVRyxJQUpGO0FBS2pCakIsRUFBQUEsTUFBTSxFQUFFYyxzQkFBVUUsSUFMRDtBQU1qQkwsRUFBQUEsUUFBUSxFQUFFRyxzQkFBVUUsSUFOSDtBQU9qQlosRUFBQUEsVUFBVSxFQUFFVSxzQkFBVUMsTUFQTDtBQVFqQkgsRUFBQUEsU0FBUyxFQUFFRSxzQkFBVUMsTUFSSjtBQVNqQkwsRUFBQUEsV0FBVyxFQUFFSSxzQkFBVUM7QUFUTixDO2lDQURBVCxpQixrQkFhRztBQUNwQkMsRUFBQUEsT0FBTyxFQUFFLG1CQUFNLENBQUUsQ0FERztBQUVwQkgsRUFBQUEsVUFBVSxFQUFFLElBRlE7QUFHcEJKLEVBQUFBLE1BQU0sRUFBRTtBQUhZLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtUb29sdGlwfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5cbmNvbnN0IEhlYWRlckFjdGlvbldyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBtYXJnaW4tbGVmdDogJHtwcm9wcyA9PiAocHJvcHMuZmx1c2ggPyAwIDogOCl9cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuYWN0aXZlID8gcHJvcHMudGhlbWUucGFuZWxIZWFkZXJJY29uQWN0aXZlIDogcHJvcHMudGhlbWUucGFuZWxIZWFkZXJJY29ufTtcblxuICA6aG92ZXIge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBjb2xvcjogJHtwcm9wcyA9PlxuICAgICAgcHJvcHMuaG92ZXJDb2xvciA/IHByb3BzLnRoZW1lW3Byb3BzLmhvdmVyQ29sb3JdIDogcHJvcHMudGhlbWUucGFuZWxIZWFkZXJJY29uSG92ZXJ9O1xuICB9XG5cbiAgJi5kaXNhYmxlZCB7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgb3BhY2l0eTogMC4zO1xuICB9XG5gO1xuXG4vLyBOZWVkIHRvIHVzZSByZWFjdCBjbGFzcyB0byBhY2Nlc3MgcHJvcHMuY29tcG9uZW50XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYW5lbEhlYWRlckFjdGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZmx1c2g6IFByb3BUeXBlcy5ib29sLFxuICAgIHRvb2x0aXA6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgYWN0aXZlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaG92ZXJDb2xvcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgdG9vbHRpcFR5cGU6IFByb3BUeXBlcy5zdHJpbmdcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIG9uQ2xpY2s6ICgpID0+IHt9LFxuICAgIGhvdmVyQ29sb3I6IG51bGwsXG4gICAgYWN0aXZlOiBmYWxzZVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBvbkNsaWNrLFxuICAgICAgdG9vbHRpcCxcbiAgICAgIGlkLFxuICAgICAgYWN0aXZlLFxuICAgICAgZmx1c2gsXG4gICAgICBob3ZlckNvbG9yLFxuICAgICAgdG9vbHRpcFR5cGUsXG4gICAgICBkaXNhYmxlZCxcbiAgICAgIGNsYXNzTmFtZVxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8SGVhZGVyQWN0aW9uV3JhcHBlclxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ3BhbmVsLS1oZWFkZXJfX2FjdGlvbicsIHtkaXNhYmxlZCwgW2NsYXNzTmFtZV06IGNsYXNzTmFtZX0pfVxuICAgICAgICBhY3RpdmU9e2FjdGl2ZX1cbiAgICAgICAgaG92ZXJDb2xvcj17aG92ZXJDb2xvcn1cbiAgICAgICAgZmx1c2g9e2ZsdXNofVxuICAgICAgPlxuICAgICAgICA8dGhpcy5wcm9wcy5JY29uQ29tcG9uZW50XG4gICAgICAgICAgZGF0YS10aXBcbiAgICAgICAgICBkYXRhLWZvcj17YCR7dG9vbHRpcH1fJHtpZH1gfVxuICAgICAgICAgIGhlaWdodD1cIjE2cHhcIlxuICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICAgIHt0b29sdGlwID8gKFxuICAgICAgICAgIDxUb29sdGlwIGlkPXtgJHt0b29sdGlwfV8ke2lkfWB9IGVmZmVjdD1cInNvbGlkXCIgZGVsYXlTaG93PXs1MDB9IHR5cGU9e3Rvb2x0aXBUeXBlfT5cbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17dG9vbHRpcH0gLz5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9IZWFkZXJBY3Rpb25XcmFwcGVyPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==