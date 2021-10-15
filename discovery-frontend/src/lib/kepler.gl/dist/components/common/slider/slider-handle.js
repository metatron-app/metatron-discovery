"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

var _classnames = _interopRequireDefault(require("classnames"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _mouseEvent = _interopRequireDefault(require("./mouse-event"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  border-radius: 3px;\n  display: inline-block;\n  pointer-events: none;\n  transition: opacity 0.3s ease-out;\n  z-index: 999;\n  margin-left: ", "px;\n  font-size: 9.5px;\n  font-weight: 500;\n  padding: 7px 10px;\n  background-color: ", ";\n  color: ", ";\n  margin-bottom: -6px;\n  width: 50px;\n\n  :before,\n  :after {\n    content: '';\n    width: 0;\n    height: 0;\n    position: absolute;\n  }\n\n  :before {\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent;\n    left: -8px;\n    top: 50%;\n  }\n\n  :after {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    left: -6px;\n    top: 50%;\n    margin-top: -4px;\n    border-right-color: ", ";\n    border-right-style: solid;\n    border-right-width: 6px;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  z-index: 10;\n  ", ": -", "px;\n\n  height: ", "px;\n  width: ", "px;\n  box-shadow: ", ";\n  background-color: ", ";\n  color: ", ";\n\n  border-width: 1px;\n  border-radius: ", ";\n  border-style: solid;\n  border-color: ", ";\n\n  :hover {\n    background-color: ", ";\n    cursor: pointer;\n  }\n\n  line-height: 10px;\n  font-size: 6px;\n  padding: 0 3px;\n  letter-spacing: 1px;\n  :after {\n    content: '", "';\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledSliderHandle = _styledComponents["default"].span(_templateObject(), function (props) {
  return props.vertical ? 'margin-left' : 'margin-top';
}, function (props) {
  return (props.sliderHandleWidth - props.theme.sliderBarHeight) / 2;
}, function (props) {
  return Number.isFinite(props.sliderHandleWidth) ? props.sliderHandleWidth : props.theme.sliderHandleHeight;
}, function (props) {
  return Number.isFinite(props.sliderHandleWidth) ? props.sliderHandleWidth : props.theme.sliderHandleHeight;
}, function (props) {
  return props.theme.sliderHandleShadow;
}, function (props) {
  return props.theme.sliderHandleColor;
}, function (props) {
  return props.theme.sliderHandleTextColor;
}, function (props) {
  return props.theme.sliderBorderRadius;
}, function (props) {
  return props.active ? props.theme.selectBorderColor : props.theme.sliderHandleColor;
}, function (props) {
  return props.theme.sliderHandleHoverColor;
}, function (props) {
  return props.theme.sliderHandleAfterContent;
});

var StyledSliderTooltip = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.sliderHandleWidth + 12;
}, function (props) {
  return props.theme.tooltipBg;
}, function (props) {
  return props.theme.tooltipColor;
}, function (props) {
  return props.theme.tooltipBg;
});

var SliderTooltip = function SliderTooltip(_ref) {
  var value = _ref.value,
      _ref$format = _ref.format,
      format = _ref$format === void 0 ? function (val) {
    return val;
  } : _ref$format,
      style = _ref.style,
      sliderHandleWidth = _ref.sliderHandleWidth;
  return /*#__PURE__*/_react["default"].createElement(StyledSliderTooltip, {
    sliderHandleWidth: sliderHandleWidth,
    style: style
  }, format(value));
};

var SliderHandle = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(SliderHandle, _Component);

  var _super = _createSuper(SliderHandle);

  function SliderHandle(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, SliderHandle);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      mouseOver: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "ref", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "toggleMouseOver", function () {
      _this.setState({
        mouseOver: !_this.state.mouseOver
      });
    });
    _this.mouseEvent = new _mouseEvent["default"]({
      vertical: props.vertical,
      valueListener: props.valueListener,
      toggleMouseOver: _this.toggleMouseOver,
      track: props.track
    });
    return _this;
  }

  (0, _createClass2["default"])(SliderHandle, [{
    key: "render",
    value: function render() {
      var style = (0, _defineProperty2["default"])({}, this.props.vertical ? 'bottom' : 'left', this.props.left);
      return /*#__PURE__*/_react["default"].createElement("div", {
        style: {
          display: this.props.display ? 'block' : 'none'
        }
      }, this.props.showTooltip && this.state.mouseOver ? /*#__PURE__*/_react["default"].createElement(SliderTooltip, {
        style: style,
        sliderHandleWidth: this.props.sliderHandleWidth,
        value: Number.isFinite(this.props.value) ? this.props.value : null
      }) : null, /*#__PURE__*/_react["default"].createElement(StyledSliderHandle, {
        className: (0, _classnames["default"])('kg-range-slider__handle', {
          'kg-range-slider__handle--active': this.state.mouseOver
        }),
        ref: this.ref,
        sliderHandleWidth: this.props.sliderHandleWidth,
        active: this.state.mouseOver,
        vertical: this.props.vertical,
        style: style,
        onMouseDown: this.mouseEvent.handleMouseDown,
        onTouchStart: this.mouseEvent.handleTouchStart
      }));
    }
  }]);
  return SliderHandle;
}(_react.Component);

exports["default"] = SliderHandle;
(0, _defineProperty2["default"])(SliderHandle, "propTypes", {
  sliderHandleWidth: _propTypes["default"].number,
  left: _propTypes["default"].string,
  display: _propTypes["default"].bool,
  valueListener: _propTypes["default"].func,
  vertical: _propTypes["default"].bool
});
(0, _defineProperty2["default"])(SliderHandle, "defaultProps", {
  sliderHandleWidth: 12,
  left: '50%',
  display: true,
  vertical: false,
  valueListener: function valueListenerFn() {},
  showTooltip: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9zbGlkZXIvc2xpZGVyLWhhbmRsZS5qcyJdLCJuYW1lcyI6WyJTdHlsZWRTbGlkZXJIYW5kbGUiLCJzdHlsZWQiLCJzcGFuIiwicHJvcHMiLCJ2ZXJ0aWNhbCIsInNsaWRlckhhbmRsZVdpZHRoIiwidGhlbWUiLCJzbGlkZXJCYXJIZWlnaHQiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInNsaWRlckhhbmRsZUhlaWdodCIsInNsaWRlckhhbmRsZVNoYWRvdyIsInNsaWRlckhhbmRsZUNvbG9yIiwic2xpZGVySGFuZGxlVGV4dENvbG9yIiwic2xpZGVyQm9yZGVyUmFkaXVzIiwiYWN0aXZlIiwic2VsZWN0Qm9yZGVyQ29sb3IiLCJzbGlkZXJIYW5kbGVIb3ZlckNvbG9yIiwic2xpZGVySGFuZGxlQWZ0ZXJDb250ZW50IiwiU3R5bGVkU2xpZGVyVG9vbHRpcCIsImRpdiIsInRvb2x0aXBCZyIsInRvb2x0aXBDb2xvciIsIlNsaWRlclRvb2x0aXAiLCJ2YWx1ZSIsImZvcm1hdCIsInZhbCIsInN0eWxlIiwiU2xpZGVySGFuZGxlIiwibW91c2VPdmVyIiwic2V0U3RhdGUiLCJzdGF0ZSIsIm1vdXNlRXZlbnQiLCJNb3VzZUV2ZW50SGFuZGxlciIsInZhbHVlTGlzdGVuZXIiLCJ0b2dnbGVNb3VzZU92ZXIiLCJ0cmFjayIsImxlZnQiLCJkaXNwbGF5Iiwic2hvd1Rvb2x0aXAiLCJyZWYiLCJoYW5kbGVNb3VzZURvd24iLCJoYW5kbGVUb3VjaFN0YXJ0IiwiQ29tcG9uZW50IiwiUHJvcFR5cGVzIiwibnVtYmVyIiwic3RyaW5nIiwiYm9vbCIsImZ1bmMiLCJ2YWx1ZUxpc3RlbmVyRm4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxrQkFBa0IsR0FBR0MsNkJBQU9D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RjtBQURDLFNBQXRDLENBRGI7QUFJRSxRQUFBLEdBQUcsRUFBRSxLQUFLVyxHQUpaO0FBS0UsUUFBQSxpQkFBaUIsRUFBRSxLQUFLckMsS0FBTCxDQUFXRSxpQkFMaEM7QUFNRSxRQUFBLE1BQU0sRUFBRSxLQUFLMEIsS0FBTCxDQUFXRixTQU5yQjtBQU9FLFFBQUEsUUFBUSxFQUFFLEtBQUsxQixLQUFMLENBQVdDLFFBUHZCO0FBUUUsUUFBQSxLQUFLLEVBQUV1QixLQVJUO0FBU0UsUUFBQSxXQUFXLEVBQUUsS0FBS0ssVUFBTCxDQUFnQlMsZUFUL0I7QUFVRSxRQUFBLFlBQVksRUFBRSxLQUFLVCxVQUFMLENBQWdCVTtBQVZoQyxRQVJGLENBREY7QUF1QkQ7OztFQTlEdUNDLGdCOzs7aUNBQXJCZixZLGVBQ0E7QUFDakJ2QixFQUFBQSxpQkFBaUIsRUFBRXVDLHNCQUFVQyxNQURaO0FBRWpCUixFQUFBQSxJQUFJLEVBQUVPLHNCQUFVRSxNQUZDO0FBR2pCUixFQUFBQSxPQUFPLEVBQUVNLHNCQUFVRyxJQUhGO0FBSWpCYixFQUFBQSxhQUFhLEVBQUVVLHNCQUFVSSxJQUpSO0FBS2pCNUMsRUFBQUEsUUFBUSxFQUFFd0Msc0JBQVVHO0FBTEgsQztpQ0FEQW5CLFksa0JBU0c7QUFDcEJ2QixFQUFBQSxpQkFBaUIsRUFBRSxFQURDO0FBRXBCZ0MsRUFBQUEsSUFBSSxFQUFFLEtBRmM7QUFHcEJDLEVBQUFBLE9BQU8sRUFBRSxJQUhXO0FBSXBCbEMsRUFBQUEsUUFBUSxFQUFFLEtBSlU7QUFLcEI4QixFQUFBQSxhQUFhLEVBQUUsU0FBU2UsZUFBVCxHQUEyQixDQUFFLENBTHhCO0FBTXBCVixFQUFBQSxXQUFXLEVBQUU7QUFOTyxDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCBjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IE1vdXNlRXZlbnRIYW5kbGVyIGZyb20gJy4vbW91c2UtZXZlbnQnO1xuXG5jb25zdCBTdHlsZWRTbGlkZXJIYW5kbGUgPSBzdHlsZWQuc3BhbmBcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiAxMDtcbiAgJHtwcm9wcyA9PiAocHJvcHMudmVydGljYWwgPyAnbWFyZ2luLWxlZnQnIDogJ21hcmdpbi10b3AnKX06IC0ke3Byb3BzID0+XG4gIChwcm9wcy5zbGlkZXJIYW5kbGVXaWR0aCAtIHByb3BzLnRoZW1lLnNsaWRlckJhckhlaWdodCkgLyAyfXB4O1xuXG4gIGhlaWdodDogJHtwcm9wcyA9PlxuICAgIE51bWJlci5pc0Zpbml0ZShwcm9wcy5zbGlkZXJIYW5kbGVXaWR0aClcbiAgICAgID8gcHJvcHMuc2xpZGVySGFuZGxlV2lkdGhcbiAgICAgIDogcHJvcHMudGhlbWUuc2xpZGVySGFuZGxlSGVpZ2h0fXB4O1xuICB3aWR0aDogJHtwcm9wcyA9PlxuICAgIE51bWJlci5pc0Zpbml0ZShwcm9wcy5zbGlkZXJIYW5kbGVXaWR0aClcbiAgICAgID8gcHJvcHMuc2xpZGVySGFuZGxlV2lkdGhcbiAgICAgIDogcHJvcHMudGhlbWUuc2xpZGVySGFuZGxlSGVpZ2h0fXB4O1xuICBib3gtc2hhZG93OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNsaWRlckhhbmRsZVNoYWRvd307XG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2xpZGVySGFuZGxlQ29sb3J9O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJIYW5kbGVUZXh0Q29sb3J9O1xuXG4gIGJvcmRlci13aWR0aDogMXB4O1xuICBib3JkZXItcmFkaXVzOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNsaWRlckJvcmRlclJhZGl1c307XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIGJvcmRlci1jb2xvcjogJHtwcm9wcyA9PlxuICAgIHByb3BzLmFjdGl2ZSA/IHByb3BzLnRoZW1lLnNlbGVjdEJvcmRlckNvbG9yIDogcHJvcHMudGhlbWUuc2xpZGVySGFuZGxlQ29sb3J9O1xuXG4gIDpob3ZlciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJIYW5kbGVIb3ZlckNvbG9yfTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gIH1cblxuICBsaW5lLWhlaWdodDogMTBweDtcbiAgZm9udC1zaXplOiA2cHg7XG4gIHBhZGRpbmc6IDAgM3B4O1xuICBsZXR0ZXItc3BhY2luZzogMXB4O1xuICA6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcke3Byb3BzID0+IHByb3BzLnRoZW1lLnNsaWRlckhhbmRsZUFmdGVyQ29udGVudH0nO1xuICB9XG5gO1xuXG5jb25zdCBTdHlsZWRTbGlkZXJUb29sdGlwID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBib3JkZXItcmFkaXVzOiAzcHg7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBlYXNlLW91dDtcbiAgei1pbmRleDogOTk5O1xuICBtYXJnaW4tbGVmdDogJHtwcm9wcyA9PiBwcm9wcy5zbGlkZXJIYW5kbGVXaWR0aCArIDEyfXB4O1xuICBmb250LXNpemU6IDkuNXB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBwYWRkaW5nOiA3cHggMTBweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50b29sdGlwQmd9O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50b29sdGlwQ29sb3J9O1xuICBtYXJnaW4tYm90dG9tOiAtNnB4O1xuICB3aWR0aDogNTBweDtcblxuICA6YmVmb3JlLFxuICA6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHdpZHRoOiAwO1xuICAgIGhlaWdodDogMDtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIH1cblxuICA6YmVmb3JlIHtcbiAgICBib3JkZXItdG9wOiA2cHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyLWJvdHRvbTogNnB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGxlZnQ6IC04cHg7XG4gICAgdG9wOiA1MCU7XG4gIH1cblxuICA6YWZ0ZXIge1xuICAgIGJvcmRlci10b3A6IDVweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICBib3JkZXItYm90dG9tOiA1cHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgbGVmdDogLTZweDtcbiAgICB0b3A6IDUwJTtcbiAgICBtYXJnaW4tdG9wOiAtNHB4O1xuICAgIGJvcmRlci1yaWdodC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50b29sdGlwQmd9O1xuICAgIGJvcmRlci1yaWdodC1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXJpZ2h0LXdpZHRoOiA2cHg7XG4gIH1cbmA7XG5cbmNvbnN0IFNsaWRlclRvb2x0aXAgPSAoe3ZhbHVlLCBmb3JtYXQgPSB2YWwgPT4gdmFsLCBzdHlsZSwgc2xpZGVySGFuZGxlV2lkdGh9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPFN0eWxlZFNsaWRlclRvb2x0aXAgc2xpZGVySGFuZGxlV2lkdGg9e3NsaWRlckhhbmRsZVdpZHRofSBzdHlsZT17c3R5bGV9PlxuICAgICAge2Zvcm1hdCh2YWx1ZSl9XG4gICAgPC9TdHlsZWRTbGlkZXJUb29sdGlwPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xpZGVySGFuZGxlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzbGlkZXJIYW5kbGVXaWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBsZWZ0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc3BsYXk6IFByb3BUeXBlcy5ib29sLFxuICAgIHZhbHVlTGlzdGVuZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIHZlcnRpY2FsOiBQcm9wVHlwZXMuYm9vbFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgc2xpZGVySGFuZGxlV2lkdGg6IDEyLFxuICAgIGxlZnQ6ICc1MCUnLFxuICAgIGRpc3BsYXk6IHRydWUsXG4gICAgdmVydGljYWw6IGZhbHNlLFxuICAgIHZhbHVlTGlzdGVuZXI6IGZ1bmN0aW9uIHZhbHVlTGlzdGVuZXJGbigpIHt9LFxuICAgIHNob3dUb29sdGlwOiBmYWxzZVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5tb3VzZUV2ZW50ID0gbmV3IE1vdXNlRXZlbnRIYW5kbGVyKHtcbiAgICAgIHZlcnRpY2FsOiBwcm9wcy52ZXJ0aWNhbCxcbiAgICAgIHZhbHVlTGlzdGVuZXI6IHByb3BzLnZhbHVlTGlzdGVuZXIsXG4gICAgICB0b2dnbGVNb3VzZU92ZXI6IHRoaXMudG9nZ2xlTW91c2VPdmVyLFxuICAgICAgdHJhY2s6IHByb3BzLnRyYWNrXG4gICAgfSk7XG4gIH1cblxuICBzdGF0ZSA9IHttb3VzZU92ZXI6IGZhbHNlfTtcbiAgcmVmID0gY3JlYXRlUmVmKCk7XG5cbiAgdG9nZ2xlTW91c2VPdmVyID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe21vdXNlT3ZlcjogIXRoaXMuc3RhdGUubW91c2VPdmVyfSk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHN0eWxlID0ge1t0aGlzLnByb3BzLnZlcnRpY2FsID8gJ2JvdHRvbScgOiAnbGVmdCddOiB0aGlzLnByb3BzLmxlZnR9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgc3R5bGU9e3tkaXNwbGF5OiB0aGlzLnByb3BzLmRpc3BsYXkgPyAnYmxvY2snIDogJ25vbmUnfX0+XG4gICAgICAgIHt0aGlzLnByb3BzLnNob3dUb29sdGlwICYmIHRoaXMuc3RhdGUubW91c2VPdmVyID8gKFxuICAgICAgICAgIDxTbGlkZXJUb29sdGlwXG4gICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICBzbGlkZXJIYW5kbGVXaWR0aD17dGhpcy5wcm9wcy5zbGlkZXJIYW5kbGVXaWR0aH1cbiAgICAgICAgICAgIHZhbHVlPXtOdW1iZXIuaXNGaW5pdGUodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLnZhbHVlIDogbnVsbH1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPFN0eWxlZFNsaWRlckhhbmRsZVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygna2ctcmFuZ2Utc2xpZGVyX19oYW5kbGUnLCB7XG4gICAgICAgICAgICAna2ctcmFuZ2Utc2xpZGVyX19oYW5kbGUtLWFjdGl2ZSc6IHRoaXMuc3RhdGUubW91c2VPdmVyXG4gICAgICAgICAgfSl9XG4gICAgICAgICAgcmVmPXt0aGlzLnJlZn1cbiAgICAgICAgICBzbGlkZXJIYW5kbGVXaWR0aD17dGhpcy5wcm9wcy5zbGlkZXJIYW5kbGVXaWR0aH1cbiAgICAgICAgICBhY3RpdmU9e3RoaXMuc3RhdGUubW91c2VPdmVyfVxuICAgICAgICAgIHZlcnRpY2FsPXt0aGlzLnByb3BzLnZlcnRpY2FsfVxuICAgICAgICAgIHN0eWxlPXtzdHlsZX1cbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5tb3VzZUV2ZW50LmhhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgICBvblRvdWNoU3RhcnQ9e3RoaXMubW91c2VFdmVudC5oYW5kbGVUb3VjaFN0YXJ0fVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19