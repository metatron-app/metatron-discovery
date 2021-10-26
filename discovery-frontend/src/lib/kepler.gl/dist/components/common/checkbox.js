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

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _lodash = _interopRequireDefault(require("lodash.pick"));

var _classnames = _interopRequireDefault(require("classnames"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  min-height: ", "px;\n  margin-left: ", "px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  display: none;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", "\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function noop() {}

var StyledSwitchInput = _styledComponents["default"].label(_templateObject(), function (props) {
  return props.secondary ? props.theme.secondarySwitch : props.theme.inputSwitch;
});

var StyledCheckboxInput = _styledComponents["default"].label(_templateObject2(), function (props) {
  return props.theme.inputCheckbox;
});

var HiddenInput = _styledComponents["default"].input(_templateObject3());

var StyledCheckbox = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.switchHeight;
}, function (props) {
  return props.theme.switchLabelMargin;
});

var Checkbox = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Checkbox, _Component);

  var _super = _createSuper(Checkbox);

  function Checkbox() {
    var _this;

    (0, _classCallCheck2["default"])(this, Checkbox);

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(_args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      focused: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleFocus", function (args) {
      _this.setState({
        focused: true
      });

      _this.props.onFocus(args);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleBlur", function (args) {
      _this.setState({
        focused: false
      });

      _this.props.onBlur(args);
    });
    return _this;
  }

  (0, _createClass2["default"])(Checkbox, [{
    key: "render",
    value: function render() {
      var inputProps = _objectSpread(_objectSpread({}, (0, _lodash["default"])(this.props, ['checked', 'disabled', 'id', 'onChange', 'value'])), {}, {
        type: 'checkbox',
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
      });

      var labelProps = _objectSpread(_objectSpread({}, (0, _lodash["default"])(this.props, ['checked', 'disabled', 'secondary'])), {}, {
        htmlFor: this.props.id
      });

      var LabelElement = this.props.type === 'checkbox' ? StyledCheckboxInput : StyledSwitchInput;
      return /*#__PURE__*/_react["default"].createElement(StyledCheckbox, {
        className: (0, _classnames["default"])('kg-checkbox', this.props.className)
      }, /*#__PURE__*/_react["default"].createElement(HiddenInput, inputProps), /*#__PURE__*/_react["default"].createElement(LabelElement, (0, _extends2["default"])({
        className: "kg-checkbox__label"
      }, labelProps), this.props.label));
    }
  }]);
  return Checkbox;
}(_react.Component);

exports["default"] = Checkbox;
(0, _defineProperty2["default"])(Checkbox, "propTypes", {
  id: _propTypes["default"].string.isRequired,
  label: _propTypes["default"].node,
  value: _propTypes["default"].oneOf([true, false, 'indeterminate']),
  checked: _propTypes["default"].bool,
  disabled: _propTypes["default"].bool,
  error: _propTypes["default"].string,
  "switch": _propTypes["default"].bool,
  activeColor: _propTypes["default"].string,
  secondary: _propTypes["default"].bool,
  onBlur: _propTypes["default"].func,
  onChange: _propTypes["default"].func,
  onFocus: _propTypes["default"].func
});
(0, _defineProperty2["default"])(Checkbox, "defaultProps", {
  disabled: false,
  checked: false,
  onBlur: noop,
  onChange: noop,
  onFocus: noop,
  label: ''
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9jaGVja2JveC5qcyJdLCJuYW1lcyI6WyJub29wIiwiU3R5bGVkU3dpdGNoSW5wdXQiLCJzdHlsZWQiLCJsYWJlbCIsInByb3BzIiwic2Vjb25kYXJ5IiwidGhlbWUiLCJzZWNvbmRhcnlTd2l0Y2giLCJpbnB1dFN3aXRjaCIsIlN0eWxlZENoZWNrYm94SW5wdXQiLCJpbnB1dENoZWNrYm94IiwiSGlkZGVuSW5wdXQiLCJpbnB1dCIsIlN0eWxlZENoZWNrYm94IiwiZGl2Iiwic3dpdGNoSGVpZ2h0Iiwic3dpdGNoTGFiZWxNYXJnaW4iLCJDaGVja2JveCIsImZvY3VzZWQiLCJhcmdzIiwic2V0U3RhdGUiLCJvbkZvY3VzIiwib25CbHVyIiwiaW5wdXRQcm9wcyIsInR5cGUiLCJoYW5kbGVGb2N1cyIsImhhbmRsZUJsdXIiLCJsYWJlbFByb3BzIiwiaHRtbEZvciIsImlkIiwiTGFiZWxFbGVtZW50IiwiY2xhc3NOYW1lIiwiQ29tcG9uZW50IiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsIm5vZGUiLCJ2YWx1ZSIsIm9uZU9mIiwiY2hlY2tlZCIsImJvb2wiLCJkaXNhYmxlZCIsImVycm9yIiwiYWN0aXZlQ29sb3IiLCJmdW5jIiwib25DaGFuZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLFNBQVNBLElBQVQsR0FBZ0IsQ0FBRTs7QUFFbEIsSUFBTUMsaUJBQWlCLEdBQUdDLDZCQUFPQyxLQUFWLG9CQUNuQixVQUFBQyxLQUFLO0FBQUEsU0FBS0EsS0FBSyxDQUFDQyxTQUFOLEdBQWtCRCxLQUFLLENBQUNFLEtBQU4sQ0FBWUMsZUFBOUIsR0FBZ0RILEtBQUssQ0FBQ0UsS0FBTixDQUFZRSxXQUFqRTtB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LElBWkg7QUFhakJ2QixFQUFBQSxPQUFPLEVBQUVZLHNCQUFVVztBQWJGLEM7aUNBREEzQixRLGtCQWlCRztBQUNwQndCLEVBQUFBLFFBQVEsRUFBRSxLQURVO0FBRXBCRixFQUFBQSxPQUFPLEVBQUUsS0FGVztBQUdwQmpCLEVBQUFBLE1BQU0sRUFBRXRCLElBSFk7QUFJcEI2QyxFQUFBQSxRQUFRLEVBQUU3QyxJQUpVO0FBS3BCcUIsRUFBQUEsT0FBTyxFQUFFckIsSUFMVztBQU1wQkcsRUFBQUEsS0FBSyxFQUFFO0FBTmEsQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoLnBpY2snO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5jb25zdCBTdHlsZWRTd2l0Y2hJbnB1dCA9IHN0eWxlZC5sYWJlbGBcbiAgJHtwcm9wcyA9PiAocHJvcHMuc2Vjb25kYXJ5ID8gcHJvcHMudGhlbWUuc2Vjb25kYXJ5U3dpdGNoIDogcHJvcHMudGhlbWUuaW5wdXRTd2l0Y2gpfTtcbmA7XG5cbmNvbnN0IFN0eWxlZENoZWNrYm94SW5wdXQgPSBzdHlsZWQubGFiZWxgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaW5wdXRDaGVja2JveH1cbmA7XG5cbmNvbnN0IEhpZGRlbklucHV0ID0gc3R5bGVkLmlucHV0YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGRpc3BsYXk6IG5vbmU7XG5gO1xuXG5jb25zdCBTdHlsZWRDaGVja2JveCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1pbi1oZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc3dpdGNoSGVpZ2h0fXB4O1xuICBtYXJnaW4tbGVmdDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zd2l0Y2hMYWJlbE1hcmdpbn1weDtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGxhYmVsOiBQcm9wVHlwZXMubm9kZSxcbiAgICB2YWx1ZTogUHJvcFR5cGVzLm9uZU9mKFt0cnVlLCBmYWxzZSwgJ2luZGV0ZXJtaW5hdGUnXSksXG4gICAgY2hlY2tlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgZXJyb3I6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc3dpdGNoOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBhY3RpdmVDb2xvcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBzZWNvbmRhcnk6IFByb3BUeXBlcy5ib29sLFxuICAgIG9uQmx1cjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRm9jdXM6IFByb3BUeXBlcy5mdW5jXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgY2hlY2tlZDogZmFsc2UsXG4gICAgb25CbHVyOiBub29wLFxuICAgIG9uQ2hhbmdlOiBub29wLFxuICAgIG9uRm9jdXM6IG5vb3AsXG4gICAgbGFiZWw6ICcnXG4gIH07XG5cbiAgc3RhdGUgPSB7XG4gICAgZm9jdXNlZDogZmFsc2VcbiAgfTtcblxuICBoYW5kbGVGb2N1cyA9IGFyZ3MgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzZWQ6IHRydWV9KTtcbiAgICB0aGlzLnByb3BzLm9uRm9jdXMoYXJncyk7XG4gIH07XG5cbiAgaGFuZGxlQmx1ciA9IGFyZ3MgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzZWQ6IGZhbHNlfSk7XG4gICAgdGhpcy5wcm9wcy5vbkJsdXIoYXJncyk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlucHV0UHJvcHMgPSB7XG4gICAgICAuLi5waWNrKHRoaXMucHJvcHMsIFsnY2hlY2tlZCcsICdkaXNhYmxlZCcsICdpZCcsICdvbkNoYW5nZScsICd2YWx1ZSddKSxcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBvbkZvY3VzOiB0aGlzLmhhbmRsZUZvY3VzLFxuICAgICAgb25CbHVyOiB0aGlzLmhhbmRsZUJsdXJcbiAgICB9O1xuXG4gICAgY29uc3QgbGFiZWxQcm9wcyA9IHtcbiAgICAgIC4uLnBpY2sodGhpcy5wcm9wcywgWydjaGVja2VkJywgJ2Rpc2FibGVkJywgJ3NlY29uZGFyeSddKSxcbiAgICAgIGh0bWxGb3I6IHRoaXMucHJvcHMuaWRcbiAgICB9O1xuXG4gICAgY29uc3QgTGFiZWxFbGVtZW50ID0gdGhpcy5wcm9wcy50eXBlID09PSAnY2hlY2tib3gnID8gU3R5bGVkQ2hlY2tib3hJbnB1dCA6IFN0eWxlZFN3aXRjaElucHV0O1xuICAgIHJldHVybiAoXG4gICAgICA8U3R5bGVkQ2hlY2tib3ggY2xhc3NOYW1lPXtjbGFzc25hbWVzKCdrZy1jaGVja2JveCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lKX0+XG4gICAgICAgIDxIaWRkZW5JbnB1dCB7Li4uaW5wdXRQcm9wc30gLz5cbiAgICAgICAgPExhYmVsRWxlbWVudCBjbGFzc05hbWU9XCJrZy1jaGVja2JveF9fbGFiZWxcIiB7Li4ubGFiZWxQcm9wc30+XG4gICAgICAgICAge3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgIDwvTGFiZWxFbGVtZW50PlxuICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICApO1xuICB9XG59XG4iXX0=