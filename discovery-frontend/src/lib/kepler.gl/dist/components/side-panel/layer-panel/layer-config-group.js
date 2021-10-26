"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayerConfigGroupLabelFactory = LayerConfigGroupLabelFactory;
exports["default"] = exports.StyledLayerConfigGroup = exports.ConfigGroupCollapsibleHeader = exports.ConfigGroupCollapsibleContent = exports.StyledLayerConfigGroupAction = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _reactLifecyclesCompat = require("react-lifecycles-compat");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reactIntl = require("react-intl");

var _switch = _interopRequireDefault(require("../../common/switch"));

var _infoHelper = _interopRequireDefault(require("../../common/info-helper"));

var _icons = require("../../common/icons");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    border-left: ", " solid\n      ", ";\n    line-height: 12px;\n    margin-left: ", ";\n    padding-left: ", ";\n\n    display: flex;\n    align-items: center;\n\n    span {\n      color: ", ";\n      font-weight: 500;\n      letter-spacing: 0.2px;\n      text-transform: capitalize;\n      margin-left: ", ";\n      font-size: ", ";\n    }\n  "]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  &.disabled {\n    opacity: 0.3;\n    pointer-events: none;\n    * {\n      pointer-events: none;\n    }\n  }\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n\n  :hover {\n    cursor: pointer;\n    .layer-config-group__label {\n      color: ", ";\n    }\n\n    .layer-config-group__action {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding-left: ", "px;\n  margin-bottom: ", "px;\n\n  &.disabled {\n    opacity: 0.3;\n    pointer-events: none;\n  }\n  &.collapsed {\n    .layer-config-group__header__collapsible {\n      overflow: visible;\n      max-height: 600px;\n    }\n    .layer-config-group__content {\n      .layer-config-group__content__collapsible {\n        overflow: hidden;\n        max-height: 0;\n      }\n    }\n  }\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  overflow: visible;\n  overflow: hidden;\n  max-height: 0;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  overflow: visible;\n  transition: max-height 0.3s ease-out;\n  height: max-content;\n  max-height: 600px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  color: ", ";\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledLayerConfigGroupAction = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColor;
});

exports.StyledLayerConfigGroupAction = StyledLayerConfigGroupAction;

var ConfigGroupCollapsibleContent = _styledComponents["default"].div.attrs({
  className: 'layer-config-group__content__collapsible'
})(_templateObject2());

exports.ConfigGroupCollapsibleContent = ConfigGroupCollapsibleContent;

var ConfigGroupCollapsibleHeader = _styledComponents["default"].div.attrs({
  className: 'layer-config-group__header__collapsible'
})(_templateObject3());

exports.ConfigGroupCollapsibleHeader = ConfigGroupCollapsibleHeader;

var StyledLayerConfigGroup = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.layerConfigGroupPaddingLeft;
}, function (props) {
  return props.theme.layerConfigGroupMarginBottom;
});

exports.StyledLayerConfigGroup = StyledLayerConfigGroup;

var StyledConfigGroupHeader = _styledComponents["default"].div(_templateObject5(), function (props) {
  return props.theme.textColorHl;
}, function (props) {
  return props.theme.textColorHl;
});

var ConfigGroupContent = _styledComponents["default"].div(_templateObject6());

LayerConfigGroupLabelFactory.deps = [_infoHelper["default"]];

function LayerConfigGroupLabelFactory(InfoHelper) {
  var StyledLayerConfigGroupLabel = _styledComponents["default"].div(_templateObject7(), function (props) {
    return props.theme.layerConfigGroupLabelBorderLeft;
  }, function (props) {
    return props.theme.labelColor;
  }, function (props) {
    return props.theme.layerConfigGroupLabelMargin;
  }, function (props) {
    return props.theme.layerConfigGroupLabelPadding;
  }, function (props) {
    return props.theme.textColor;
  }, function (props) {
    return props.theme.layerConfigGroupLabelLabelMargin;
  }, function (props) {
    return props.theme.layerConfigGroupLabelLabelFontSize;
  });

  var LayerConfigGroupLabel = function LayerConfigGroupLabel(_ref) {
    var label = _ref.label,
        description = _ref.description;
    return /*#__PURE__*/_react["default"].createElement(StyledLayerConfigGroupLabel, {
      className: "layer-config-group__label"
    }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_reactIntl.FormattedMessage, {
      id: label || 'misc.empty',
      defaultMessage: label
    })), description && /*#__PURE__*/_react["default"].createElement(InfoHelper, {
      description: description,
      id: label
    }));
  };

  return LayerConfigGroupLabel;
}

LayerConfigGroupFactory.deps = [LayerConfigGroupLabelFactory];

function LayerConfigGroupFactory(LayerConfigGroupLabel) {
  var LayerConfigGroup = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(LayerConfigGroup, _Component);

    var _super = _createSuper(LayerConfigGroup);

    function LayerConfigGroup() {
      var _this;

      (0, _classCallCheck2["default"])(this, LayerConfigGroup);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        collapsed: true
      });
      return _this;
    }

    (0, _createClass2["default"])(LayerConfigGroup, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props = this.props,
            label = _this$props.label,
            children = _this$props.children,
            property = _this$props.property,
            layer = _this$props.layer,
            _onChange2 = _this$props.onChange,
            collapsible = _this$props.collapsible,
            description = _this$props.description,
            disabled = _this$props.disabled;
        var collapsed = this.state.collapsed;
        return /*#__PURE__*/_react["default"].createElement(StyledLayerConfigGroup, {
          className: (0, _classnames["default"])('layer-config-group', {
            collapsed: collapsed,
            disabled: disabled
          })
        }, /*#__PURE__*/_react["default"].createElement(StyledConfigGroupHeader, {
          className: "layer-config-group__header",
          onClick: function onClick() {
            return _this2.setState({
              collapsed: !_this2.state.collapsed
            });
          }
        }, /*#__PURE__*/_react["default"].createElement(LayerConfigGroupLabel, {
          label: label,
          description: description
        }), /*#__PURE__*/_react["default"].createElement(StyledLayerConfigGroupAction, {
          className: "layer-config-group__action"
        }, property ? /*#__PURE__*/_react["default"].createElement(_switch["default"], {
          checked: layer.config.visConfig[property],
          id: "".concat(layer.id, "-").concat(property),
          onChange: function onChange() {
            return _onChange2((0, _defineProperty2["default"])({}, property, !layer.config.visConfig[property]));
          }
        }) : null, collapsible ? /*#__PURE__*/_react["default"].createElement(_icons.VertThreeDots, {
          height: "18px"
        }) : null)), /*#__PURE__*/_react["default"].createElement(ConfigGroupContent, {
          className: (0, _classnames["default"])('layer-config-group__content', {
            disabled: property && !layer.config.visConfig[property]
          })
        }, children));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(props, state) {
        //  invoked after a component is instantiated as well as before it is re-rendered
        if (props.expanded && state.collapsed) {
          return {
            collapsed: false
          };
        }

        return null;
      }
    }]);
    return LayerConfigGroup;
  }(_react.Component);

  (0, _defineProperty2["default"])(LayerConfigGroup, "defaultProps", {
    collapsible: false,
    expanded: false,
    onChange: function onChange() {},
    description: null,
    disabled: false
  });
  (0, _reactLifecyclesCompat.polyfill)(LayerConfigGroup);
  return LayerConfigGroup;
}

var _default = LayerConfigGroupFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvbGF5ZXItY29uZmlnLWdyb3VwLmpzIl0sIm5hbWVzIjpbIlN0eWxlZExheWVyQ29uZmlnR3JvdXBBY3Rpb24iLCJzdHlsZWQiLCJkaXYiLCJwcm9wcyIsInRoZW1lIiwidGV4dENvbG9yIiwiQ29uZmlnR3JvdXBDb2xsYXBzaWJsZUNvbnRlbnQiLCJhdHRycyIsImNsYXNzTmFtZSIsIkNvbmZpZ0dyb3VwQ29sbGFwc2libGVIZWFkZXIiLCJTdHlsZWRMYXllckNvbmZpZ0dyb3VwIiwibGF5ZXJDb25maWdHcm91cFBhZGRpbmdMZWZ0IiwibGF5ZXJDb25maWdHcm91cE1hcmdpbkJvdHRvbSIsIlN0eWxlZENvbmZpZ0dyb3VwSGVhZGVyIiwidGV4dENvbG9ySGwiLCJDb25maWdHcm91cENvbnRlbnQiLCJMYXllckNvbmZpZ0dyb3VwTGFiZWxGYWN0b3J5IiwiZGVwcyIsIkluZm9IZWxwZXJGYWN0b3J5IiwiSW5mb0hlbHBlciIsIlN0eWxlZExheWVyQ29uZmlnR3JvdXBMYWJlbCIsImxheWVyQ29uZmlnR3JvdXBMYWJlbEJvcmRlckxlZnQiLCJsYWJlbENvbG9yIiwibGF5ZXJDb25maWdHcm91cExhYmVsTWFyZ2luIiwibGF5ZXJDb25maWdHcm91cExhYmVsUGFkZGluZyIsImxheWVyQ29uZmlnR3JvdXBMYWJlbExhYmVsTWFyZ2luIiwibGF5ZXJDb25maWdHcm91cExhYmVsTGFiZWxGb250U2l6ZSIsIkxheWVyQ29uZmlnR3JvdXBMYWJlbCIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJMYXllckNvbmZpZ0dyb3VwRmFjdG9yeSIsIkxheWVyQ29uZmlnR3JvdXAiLCJjb2xsYXBzZWQiLCJjaGlsZHJlbiIsInByb3BlcnR5IiwibGF5ZXIiLCJvbkNoYW5nZSIsImNvbGxhcHNpYmxlIiwiZGlzYWJsZWQiLCJzdGF0ZSIsInNldFN0YXRlIiwiY29uZmlnIiwidmlzQ29uZmln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dkJhLGdCQUR1Qjs7QUFBQSxtQ0FDaERkLGdCQURnRCxrQkFFOUI7QUFDcEJNLElBQUFBLFdBQVcsRUFBRSxLQURPO0FBRXBCTyxJQUFBQSxRQUFRLEVBQUUsS0FGVTtBQUdwQlIsSUFBQUEsUUFBUSxFQUFFLG9CQUFNLENBQUUsQ0FIRTtBQUlwQlAsSUFBQUEsV0FBVyxFQUFFLElBSk87QUFLcEJTLElBQUFBLFFBQVEsRUFBRTtBQUxVLEdBRjhCO0FBbUV0RCx1Q0FBU1AsZ0JBQVQ7QUFFQSxTQUFPQSxnQkFBUDtBQUNEOztlQUVjRCx1QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtwb2x5ZmlsbH0gZnJvbSAncmVhY3QtbGlmZWN5Y2xlcy1jb21wYXQnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQgU3dpdGNoIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N3aXRjaCc7XG5pbXBvcnQgSW5mb0hlbHBlckZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaW5mby1oZWxwZXInO1xuaW1wb3J0IHtWZXJ0VGhyZWVEb3RzfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRMYXllckNvbmZpZ0dyb3VwQWN0aW9uID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDb25maWdHcm91cENvbGxhcHNpYmxlQ29udGVudCA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdsYXllci1jb25maWctZ3JvdXBfX2NvbnRlbnRfX2NvbGxhcHNpYmxlJ1xufSlgXG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuICB0cmFuc2l0aW9uOiBtYXgtaGVpZ2h0IDAuM3MgZWFzZS1vdXQ7XG4gIGhlaWdodDogbWF4LWNvbnRlbnQ7XG4gIG1heC1oZWlnaHQ6IDYwMHB4O1xuYDtcblxuZXhwb3J0IGNvbnN0IENvbmZpZ0dyb3VwQ29sbGFwc2libGVIZWFkZXIgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbGF5ZXItY29uZmlnLWdyb3VwX19oZWFkZXJfX2NvbGxhcHNpYmxlJ1xufSlgXG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBtYXgtaGVpZ2h0OiAwO1xuYDtcblxuZXhwb3J0IGNvbnN0IFN0eWxlZExheWVyQ29uZmlnR3JvdXAgPSBzdHlsZWQuZGl2YFxuICBwYWRkaW5nLWxlZnQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJDb25maWdHcm91cFBhZGRpbmdMZWZ0fXB4O1xuICBtYXJnaW4tYm90dG9tOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxheWVyQ29uZmlnR3JvdXBNYXJnaW5Cb3R0b219cHg7XG5cbiAgJi5kaXNhYmxlZCB7XG4gICAgb3BhY2l0eTogMC4zO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gICYuY29sbGFwc2VkIHtcbiAgICAubGF5ZXItY29uZmlnLWdyb3VwX19oZWFkZXJfX2NvbGxhcHNpYmxlIHtcbiAgICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICAgICAgbWF4LWhlaWdodDogNjAwcHg7XG4gICAgfVxuICAgIC5sYXllci1jb25maWctZ3JvdXBfX2NvbnRlbnQge1xuICAgICAgLmxheWVyLWNvbmZpZy1ncm91cF9fY29udGVudF9fY29sbGFwc2libGUge1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICBtYXgtaGVpZ2h0OiAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkQ29uZmlnR3JvdXBIZWFkZXIgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIG1hcmdpbi1ib3R0b206IDEycHg7XG5cbiAgOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgLmxheWVyLWNvbmZpZy1ncm91cF9fbGFiZWwge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9ySGx9O1xuICAgIH1cblxuICAgIC5sYXllci1jb25maWctZ3JvdXBfX2FjdGlvbiB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JIbH07XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBDb25maWdHcm91cENvbnRlbnQgPSBzdHlsZWQuZGl2YFxuICAmLmRpc2FibGVkIHtcbiAgICBvcGFjaXR5OiAwLjM7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgKiB7XG4gICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICB9XG4gIH1cbmA7XG5cbkxheWVyQ29uZmlnR3JvdXBMYWJlbEZhY3RvcnkuZGVwcyA9IFtJbmZvSGVscGVyRmFjdG9yeV07XG5leHBvcnQgZnVuY3Rpb24gTGF5ZXJDb25maWdHcm91cExhYmVsRmFjdG9yeShJbmZvSGVscGVyKSB7XG4gIGNvbnN0IFN0eWxlZExheWVyQ29uZmlnR3JvdXBMYWJlbCA9IHN0eWxlZC5kaXZgXG4gICAgYm9yZGVyLWxlZnQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJDb25maWdHcm91cExhYmVsQm9yZGVyTGVmdH0gc29saWRcbiAgICAgICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gICAgbGluZS1oZWlnaHQ6IDEycHg7XG4gICAgbWFyZ2luLWxlZnQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJDb25maWdHcm91cExhYmVsTWFyZ2lufTtcbiAgICBwYWRkaW5nLWxlZnQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJDb25maWdHcm91cExhYmVsUGFkZGluZ307XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cbiAgICBzcGFuIHtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuMnB4O1xuICAgICAgdGV4dC10cmFuc2Zvcm06IGNhcGl0YWxpemU7XG4gICAgICBtYXJnaW4tbGVmdDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5sYXllckNvbmZpZ0dyb3VwTGFiZWxMYWJlbE1hcmdpbn07XG4gICAgICBmb250LXNpemU6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJDb25maWdHcm91cExhYmVsTGFiZWxGb250U2l6ZX07XG4gICAgfVxuICBgO1xuXG4gIGNvbnN0IExheWVyQ29uZmlnR3JvdXBMYWJlbCA9ICh7bGFiZWwsIGRlc2NyaXB0aW9ufSkgPT4gKFxuICAgIDxTdHlsZWRMYXllckNvbmZpZ0dyb3VwTGFiZWwgY2xhc3NOYW1lPVwibGF5ZXItY29uZmlnLWdyb3VwX19sYWJlbFwiPlxuICAgICAgPHNwYW4+XG4gICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXtsYWJlbCB8fCAnbWlzYy5lbXB0eSd9IGRlZmF1bHRNZXNzYWdlPXtsYWJlbH0gLz5cbiAgICAgIDwvc3Bhbj5cbiAgICAgIHtkZXNjcmlwdGlvbiAmJiA8SW5mb0hlbHBlciBkZXNjcmlwdGlvbj17ZGVzY3JpcHRpb259IGlkPXtsYWJlbH0gLz59XG4gICAgPC9TdHlsZWRMYXllckNvbmZpZ0dyb3VwTGFiZWw+XG4gICk7XG5cbiAgcmV0dXJuIExheWVyQ29uZmlnR3JvdXBMYWJlbDtcbn1cblxuTGF5ZXJDb25maWdHcm91cEZhY3RvcnkuZGVwcyA9IFtMYXllckNvbmZpZ0dyb3VwTGFiZWxGYWN0b3J5XTtcbmZ1bmN0aW9uIExheWVyQ29uZmlnR3JvdXBGYWN0b3J5KExheWVyQ29uZmlnR3JvdXBMYWJlbCkge1xuICBjbGFzcyBMYXllckNvbmZpZ0dyb3VwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgY29sbGFwc2libGU6IGZhbHNlLFxuICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgb25DaGFuZ2U6ICgpID0+IHt9LFxuICAgICAgZGVzY3JpcHRpb246IG51bGwsXG4gICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICB9O1xuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wcywgc3RhdGUpIHtcbiAgICAgIC8vICBpbnZva2VkIGFmdGVyIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBhcyB3ZWxsIGFzIGJlZm9yZSBpdCBpcyByZS1yZW5kZXJlZFxuICAgICAgaWYgKHByb3BzLmV4cGFuZGVkICYmIHN0YXRlLmNvbGxhcHNlZCkge1xuICAgICAgICByZXR1cm4ge2NvbGxhcHNlZDogZmFsc2V9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGxhYmVsLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIGxheWVyLFxuICAgICAgICBvbkNoYW5nZSxcbiAgICAgICAgY29sbGFwc2libGUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBkaXNhYmxlZFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGNvbnN0IHtjb2xsYXBzZWR9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZExheWVyQ29uZmlnR3JvdXAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKCdsYXllci1jb25maWctZ3JvdXAnLCB7Y29sbGFwc2VkLCBkaXNhYmxlZH0pfT5cbiAgICAgICAgICA8U3R5bGVkQ29uZmlnR3JvdXBIZWFkZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImxheWVyLWNvbmZpZy1ncm91cF9faGVhZGVyXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoe2NvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkfSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPExheWVyQ29uZmlnR3JvdXBMYWJlbCBsYWJlbD17bGFiZWx9IGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn0gLz5cbiAgICAgICAgICAgIDxTdHlsZWRMYXllckNvbmZpZ0dyb3VwQWN0aW9uIGNsYXNzTmFtZT1cImxheWVyLWNvbmZpZy1ncm91cF9fYWN0aW9uXCI+XG4gICAgICAgICAgICAgIHtwcm9wZXJ0eSA/IChcbiAgICAgICAgICAgICAgICA8U3dpdGNoXG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXtsYXllci5jb25maWcudmlzQ29uZmlnW3Byb3BlcnR5XX1cbiAgICAgICAgICAgICAgICAgIGlkPXtgJHtsYXllci5pZH0tJHtwcm9wZXJ0eX1gfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IG9uQ2hhbmdlKHtbcHJvcGVydHldOiAhbGF5ZXIuY29uZmlnLnZpc0NvbmZpZ1twcm9wZXJ0eV19KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge2NvbGxhcHNpYmxlID8gPFZlcnRUaHJlZURvdHMgaGVpZ2h0PVwiMThweFwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvU3R5bGVkTGF5ZXJDb25maWdHcm91cEFjdGlvbj5cbiAgICAgICAgICA8L1N0eWxlZENvbmZpZ0dyb3VwSGVhZGVyPlxuICAgICAgICAgIDxDb25maWdHcm91cENvbnRlbnRcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnbGF5ZXItY29uZmlnLWdyb3VwX19jb250ZW50Jywge1xuICAgICAgICAgICAgICBkaXNhYmxlZDogcHJvcGVydHkgJiYgIWxheWVyLmNvbmZpZy52aXNDb25maWdbcHJvcGVydHldXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgPC9Db25maWdHcm91cENvbnRlbnQ+XG4gICAgICAgIDwvU3R5bGVkTGF5ZXJDb25maWdHcm91cD5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcG9seWZpbGwoTGF5ZXJDb25maWdHcm91cCk7XG5cbiAgcmV0dXJuIExheWVyQ29uZmlnR3JvdXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IExheWVyQ29uZmlnR3JvdXBGYWN0b3J5O1xuIl19