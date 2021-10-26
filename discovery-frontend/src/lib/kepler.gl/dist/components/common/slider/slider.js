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

var _sliderHandle = _interopRequireDefault(require("./slider-handle"));

var _sliderBarHandle = _interopRequireDefault(require("./slider-bar-handle"));

var _dataUtils = require("../../../utils/data-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  flex-grow: 1;\n  margin-top: ", "px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: relative;\n  margin-bottom: 12px;\n  background-color: ", ";\n  ", ";\n  ", ";\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function noop() {}

var StyledRangeSlider = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.sliderBarBgd;
}, function (props) {
  return "".concat(props.vertical ? 'width' : 'height', ": ").concat(props.theme.sliderBarHeight, "px");
}, function (props) {
  return "".concat(props.vertical ? 'height' : 'width', ": 100%");
});

var SliderWrapper = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.sliderMarginTop;
});

var Slider = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Slider, _Component);

  var _super = _createSuper(Slider);

  function Slider() {
    var _this;

    (0, _classCallCheck2["default"])(this, Slider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "ref", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "track", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_setAnchor", function (x) {
      // used to calculate delta
      _this._anchor = x;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isVal0InRange", function (val) {
      var _this$props = _this.props,
          value1 = _this$props.value1,
          minValue = _this$props.minValue;
      return Boolean(val >= minValue && val <= value1);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isVal1InRange", function (val) {
      var _this$props2 = _this.props,
          maxValue = _this$props2.maxValue,
          value0 = _this$props2.value0;
      return Boolean(val <= maxValue && val >= value0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "slide0Listener", function (x) {
      var val = _this._getValue(_this.props.minValue, x);

      if (_this._isVal0InRange(val)) {
        _this.props.onSlider0Change(val);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "slide1Listener", function (x) {
      var val = _this._getValue(_this.props.minValue, x);

      if (_this._isVal1InRange(val)) {
        _this.props.onSlider1Change(val);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "sliderBarListener", function (x) {
      var _this$props3 = _this.props,
          minValue = _this$props3.minValue,
          maxValue = _this$props3.maxValue; // for slider bar, we use distance delta

      var anchor = _this._anchor;

      var val0 = _this._getValue(_this.props.value0, x - anchor);

      var val1 = _this._getValue(_this.props.value1, x - anchor);

      if (val0 >= minValue && val1 <= maxValue && val1 >= val0) {
        var deltaX = _this._getDeltaX(val0 - _this.props.value0);

        _this.props.onSliderBarChange(val0, val1); // update anchor


        _this._anchor = _this._anchor + deltaX;
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "calcHandleLeft0", function (w, l, num) {
      return w === 0 ? "calc(".concat(l, "% - ").concat(_this.props.sliderHandleWidth / 2, "px)") : "calc(".concat(l, "% - ").concat(_this.props.sliderHandleWidth / 2, "px)");
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "calcHandleLeft1", function (w, l) {
      return _this.props.isRanged && w === 0 ? "".concat(l, "%") : "calc(".concat(l + w, "% - ").concat(_this.props.sliderHandleWidth / 2, "px)");
    });
    return _this;
  }

  (0, _createClass2["default"])(Slider, [{
    key: "_getBaseDistance",
    value: function _getBaseDistance() {
      return this.props.vertical ? this.ref.current.offsetHeight : this.ref.current.offsetWidth;
    }
  }, {
    key: "_getDeltaVal",
    value: function _getDeltaVal(x) {
      var percent = x / this._getBaseDistance();

      var maxDelta = this.props.maxValue - this.props.minValue;
      return percent * maxDelta;
    }
  }, {
    key: "_getDeltaX",
    value: function _getDeltaX(v) {
      var percent = v / (this.props.maxValue - this.props.minValue);

      var maxDelta = this._getBaseDistance();

      return percent * maxDelta;
    }
  }, {
    key: "_getValue",
    value: function _getValue(baseV, offset) {
      // offset is the distance between slider handle and track left
      var rawValue = baseV + this._getDeltaVal(offset);

      return this._normalizeValue(rawValue);
    }
  }, {
    key: "_normalizeValue",
    value: function _normalizeValue(val) {
      var _this$props4 = this.props,
          minValue = _this$props4.minValue,
          step = _this$props4.step,
          marks = _this$props4.marks;
      return (0, _dataUtils.normalizeSliderValue)(val, minValue, step, marks);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
          classSet = _this$props5.classSet,
          disabled = _this$props5.disabled,
          isRanged = _this$props5.isRanged,
          maxValue = _this$props5.maxValue,
          minValue = _this$props5.minValue,
          value1 = _this$props5.value1,
          vertical = _this$props5.vertical,
          sliderHandleWidth = _this$props5.sliderHandleWidth,
          showTooltip = _this$props5.showTooltip;
      var value0 = !isRanged && minValue > 0 ? minValue : this.props.value0;
      var currValDelta = value1 - value0;
      var maxDelta = maxValue - minValue;
      var width = currValDelta / maxDelta * 100;
      var v0Left = (value0 - minValue) / maxDelta * 100;
      return /*#__PURE__*/_react["default"].createElement(SliderWrapper, {
        className: (0, _classnames["default"])('kg-slider', _objectSpread(_objectSpread({}, classSet), {}, {
          disabled: disabled
        })),
        ref: this.ref,
        isRanged: isRanged,
        vertical: vertical
      }, /*#__PURE__*/_react["default"].createElement(StyledRangeSlider, {
        className: "kg-range-slider",
        vertical: vertical,
        ref: this.track
      }, /*#__PURE__*/_react["default"].createElement(_sliderHandle["default"], {
        className: "kg-range-slider__handle",
        left: this.calcHandleLeft0(width, v0Left),
        valueListener: this.slide0Listener,
        sliderHandleWidth: sliderHandleWidth,
        display: isRanged,
        vertical: vertical,
        showTooltip: showTooltip,
        track: this.track
      }), /*#__PURE__*/_react["default"].createElement(_sliderHandle["default"], {
        className: "kg-range-slider__handle",
        left: this.calcHandleLeft1(width, v0Left),
        valueListener: this.slide1Listener,
        sliderHandleWidth: sliderHandleWidth,
        vertical: vertical,
        value: value1,
        showTooltip: showTooltip,
        track: this.track
      }), /*#__PURE__*/_react["default"].createElement(_sliderBarHandle["default"], {
        width: width,
        v0Left: v0Left,
        enableBarDrag: this.props.enableBarDrag,
        sliderBarListener: this.sliderBarListener,
        vertical: vertical,
        track: this.track,
        setAnchor: this._setAnchor
      })));
    }
  }]);
  return Slider;
}(_react.Component);

exports["default"] = Slider;
(0, _defineProperty2["default"])(Slider, "propTypes", {
  title: _propTypes["default"].string,
  isRanged: _propTypes["default"].bool,
  value0: _propTypes["default"].number,
  value1: _propTypes["default"].number,
  minValue: _propTypes["default"].number,
  maxValue: _propTypes["default"].number,
  sliderHandleWidth: _propTypes["default"].number,
  onSlider0Change: _propTypes["default"].func,
  onInput0Change: _propTypes["default"].func,
  onSlider1Change: _propTypes["default"].func,
  onInput1Change: _propTypes["default"].func,
  onSliderBarChange: _propTypes["default"].func,
  step: _propTypes["default"].number,
  enableBarDrag: _propTypes["default"].bool,
  showTooltip: _propTypes["default"].bool
});
(0, _defineProperty2["default"])(Slider, "defaultProps", {
  title: '',
  isRanged: true,
  value0: 0,
  value1: 100,
  minValue: 0,
  maxValue: 100,
  step: 1,
  sliderHandleWidth: 12,
  enableBarDrag: false,
  onSlider0Change: noop,
  onInput0Change: noop,
  onSlider1Change: noop,
  onInput1Change: noop,
  onSliderBarChange: noop,
  disabled: false,
  vertical: false,
  showTooltip: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9zbGlkZXIvc2xpZGVyLmpzIl0sIm5hbWVzIjpbIm5vb3AiLCJTdHlsZWRSYW5nZVNsaWRlciIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJzbGlkZXJCYXJCZ2QiLCJ2ZXJ0aWNhbCIsInNsaWRlckJhckhlaWdodCIsIlNsaWRlcldyYXBwZXIiLCJzbGlkZXJNYXJnaW5Ub3AiLCJTbGlkZXIiLCJ4IiwiX2FuY2hvciIsInZhbCIsInZhbHVlMSIsIm1pblZhbHVlIiwiQm9vbGVhbiIsIm1heFZhbHVlIiwidmFsdWUwIiwiX2dldFZhbHVlIiwiX2lzVmFsMEluUmFuZ2UiLCJvblNsaWRlcjBDaGFuZ2UiLCJfaXNWYWwxSW5SYW5nZSIsIm9uU2xpZGVyMUNoYW5nZSIsImFuY2hvciIsInZhbDAiLCJ2YWwxIiwiZGVsdGFYIiwiX2dldERlbHRhWCIsIm9uU2xpZGVyQmFyQ2hhbmdlIiwidyIsImwiLCJudW0iLCJzbGlkZXJIYW5kbGVXaWR0aCIsImlzUmFuZ2VkIiwicmVmIiwiY3VycmVudCIsIm9mZnNldEhlaWdodCIsIm9mZnNldFdpZHRoIiwicGVyY2VudCIsIl9nZXRCYXNlRGlzdGFuY2UiLCJtYXhEZWx0YSIsInYiLCJiYXNlViIsIm9mZnNldCIsInJhd1ZhbHVlIiwiX2dldERlbHRhVmFsIiwiX25vcm1hbGl6ZVZhbHVlIiwic3RlcCIsIm1hcmtzIiwiY2xhc3NTZXQiLCJkaXNhYmxlZCIsInNob3dUb29sdGlwIiwiY3VyclZhbERlbHRhIiwid2lkdGgiLCJ2MExlZnQiLCJ0cmFjayIsImNhbGNIYW5kbGVMZWZ0MCIsInNsaWRlMExpc3RlbmVyIiwiY2FsY0hhbmRsZUxlZnQxIiwic2xpZGUxTGlzdGVuZXIiLCJlbmFibGVCYXJEcmFnIiwic2xpZGVyQmFyTGlzdGVuZXIiLCJfc2V0QW5jaG9yIiwiQ29tcG9uZW50IiwidGl0bGUiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJib29sIiwibnVtYmVyIiwiZnVuYyIsIm9uSW5wdXQwQ2hhbmdlIiwib25JbnB1dDFDaGFuZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsU0FBU0EsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQyxpQkFBaUIsR0FBR0MsNkJBQU9DLEdBQVYsb0JBR0QsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxZQUFoQjtBQUFBLENBSEosRUFJbkIsVUFBQUYsS0FBSztBQUFBLG1CQUFPQSxLQUFLLENBQUNHLFFBQU4sR0FBaUIsT0FBakIsR0FBMkIsUUFBbEMsZUFBK0NILEtBQUssQ0FBQ0MsS0FBTixDQUFZRyxlQUEzRDtBQUFBLENBSmMsRUFLbkIsVUFBQUosS0FBSztBQUFBLG1CQUFPQSxLQUFLLENBQUNHLFFBQU4sR0FBaUIsUUFBakIsR0FBNEIsT0FBbkM7QUFBQSxDQUxjLENBQXZCOztBQVFBLElBQU1FLGFBQWEsR0FBR1AsNkJBQU9DLEdBQVYscUJBRUgsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSyxlQUFoQjtBQUFBLENBRkYsQ0FBbkI7O0lBS3FCQyxNOzs7Ozs7Ozs7Ozs7Ozs7eUdBdUNiLHVCOzJHQUNFLHVCO21HQUVLLFVBQUFDLENBQUMsRUFBSTtBQUNoQjtBQUNBLFlBQUtDLE9BQUwsR0FBZUQsQ0FBZjtBQUNELEs7dUdBd0JnQixVQUFBRSxHQUFHLEVBQUk7QUFBQSx3QkFDSyxNQUFLVixLQURWO0FBQUEsVUFDZlcsTUFEZSxlQUNmQSxNQURlO0FBQUEsVUFDUEMsUUFETyxlQUNQQSxRQURPO0FBRXRCLGFBQU9DLE9BQU8sQ0FBQ0gsR0FBRyxJQUFJRSxRQUFQLElBQW1CRixHQUFHLElBQUlDLE1BQTNCLENBQWQ7QUFDRCxLO3VHQUVnQixVQUFBRCxHQUFHLEVBQUk7QUFBQSx5QkFDSyxNQUFLVixLQURWO0FBQUEsVUFDZmMsUUFEZSxnQkFDZkEsUUFEZTtBQUFBLFVBQ0xDLE1BREssZ0JBQ0xBLE1BREs7QUFFdEIsYUFBT0YsT0FBTyxDQUFDSCxHQUFHLElBQUlJLFFBQVAsSUFBbUJKLEdBQUcsSUFBSUssTUFBM0IsQ0FBZDtBQUNELEs7dUdBT2dCLFVBQUFQLENBQUMsRUFBSTtBQUNwQixVQUFNRSxHQUFHLEdBQUcsTUFBS00sU0FBTCxDQUFlLE1BQUtoQixLQUFMLENBQVdZLFFBQTFCLEVBQW9DSixDQUFwQyxDQUFaOztBQUVBLFVBQUksTUFBS1MsY0FBTCxDQUFvQlAsR0FBcEIsQ0FBSixFQUE4QjtBQUM1QixjQUFLVixLQUFMLENBQVdrQixlQUFYLENBQTJCUixHQUEzQjtBQUNEO0FBQ0YsSzt1R0FFZ0IsVUFBQUYsQ0FBQyxFQUFJO0FBQ3BCLFVBQU1FLEdBQUcsR0FBRyxNQUFLTSxTQUFMLENBQWUsTUFBS2hCLEtBQUwsQ0FBV1ksUUFBMUIsRUFBb0NKLENBQXBDLENBQVo7O0FBQ0EsVUFBSSxNQUFLVyxjQUFMLENBQW9CVCxHQUFwQixDQUFKLEVBQThCO0FBQzVCLGNBQUtWLEtBQUwsQ0FBV29CLGVBQVgsQ0FBMkJWLEdBQTNCO0FBQ0Q7QUFDRixLOzBHQUVtQixVQUFBRixDQUFDLEVBQUk7QUFBQSx5QkFDTSxNQUFLUixLQURYO0FBQUEsVUFDaEJZLFFBRGdCLGdCQUNoQkEsUUFEZ0I7QUFBQSxVQUNORSxRQURNLGdCQUNOQSxRQURNLEVBRXZCOztBQUNBLFVBQU1PLE1BQU0sR0FBRyxNQUFLWixPQUFwQjs7QUFDQSxVQUFNYSxJQUFJLEdBQUcsTUFBS04sU0FBTCxDQUFlLE1BQUtoQixLQUFMLENBQVdlLE1BQTFCLEVBQWtDUCxDQUFDLEdBQUdhLE1BQXRDLENBQWI7O0FBQ0EsVUFBTUUsSUFBSSxHQUFHLE1BQUtQLFNBQUwsQ0FBZSxNQUFLaEIsS0FBTCxDQUFXVyxNQUExQixFQUFrQ0gsQ0FBQyxHQUFHYSxNQUF0QyxDQUFiOztBQUVBLFVBQUlDLElBQUksSUFBSVYsUUFBUixJQUFvQlcsSUFBSSxJQUFJVCxRQUE1QixJQUF3Q1MsSUFBSSxJQUFJRCxJQUFwRCxFQUEwRDtBQUN4RCxZQUFNRSxNQUFNLEdBQUcsTUFBS0MsVUFBTCxDQUFnQkgsSUFBSSxHQUFHLE1BQUt0QixLQUFMLENBQVdlLE1BQWxDLENBQWY7O0FBQ0EsY0FBS2YsS0FBTCxDQUFXMEIsaUJBQVgsQ0FBNkJKLElBQTdCLEVBQW1DQyxJQUFuQyxFQUZ3RCxDQUd4RDs7O0FBQ0EsY0FBS2QsT0FBTCxHQUFlLE1BQUtBLE9BQUwsR0FBZWUsTUFBOUI7QUFDRDtBQUNGLEs7d0dBRWlCLFVBQUNHLENBQUQsRUFBSUMsQ0FBSixFQUFPQyxHQUFQLEVBQWU7QUFDL0IsYUFBT0YsQ0FBQyxLQUFLLENBQU4sa0JBQ0tDLENBREwsaUJBQ2EsTUFBSzVCLEtBQUwsQ0FBVzhCLGlCQUFYLEdBQStCLENBRDVDLDBCQUVLRixDQUZMLGlCQUVhLE1BQUs1QixLQUFMLENBQVc4QixpQkFBWCxHQUErQixDQUY1QyxRQUFQO0FBR0QsSzt3R0FFaUIsVUFBQ0gsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDMUIsYUFBTyxNQUFLNUIsS0FBTCxDQUFXK0IsUUFBWCxJQUF1QkosQ0FBQyxLQUFLLENBQTdCLGFBQ0FDLENBREEsd0JBRUtBLENBQUMsR0FBR0QsQ0FGVCxpQkFFaUIsTUFBSzNCLEtBQUwsQ0FBVzhCLGlCQUFYLEdBQStCLENBRmhELFFBQVA7QUFHRCxLOzs7Ozs7dUNBN0VrQjtBQUNqQixhQUFPLEtBQUs5QixLQUFMLENBQVdHLFFBQVgsR0FBc0IsS0FBSzZCLEdBQUwsQ0FBU0MsT0FBVCxDQUFpQkMsWUFBdkMsR0FBc0QsS0FBS0YsR0FBTCxDQUFTQyxPQUFULENBQWlCRSxXQUE5RTtBQUNEOzs7aUNBRVkzQixDLEVBQUc7QUFDZCxVQUFNNEIsT0FBTyxHQUFHNUIsQ0FBQyxHQUFHLEtBQUs2QixnQkFBTCxFQUFwQjs7QUFDQSxVQUFNQyxRQUFRLEdBQUcsS0FBS3RDLEtBQUwsQ0FBV2MsUUFBWCxHQUFzQixLQUFLZCxLQUFMLENBQVdZLFFBQWxEO0FBQ0EsYUFBT3dCLE9BQU8sR0FBR0UsUUFBakI7QUFDRDs7OytCQUNVQyxDLEVBQUc7QUFDWixVQUFNSCxPQUFPLEdBQUdHLENBQUMsSUFBSSxLQUFLdkMsS0FBTCxDQUFXYyxRQUFYLEdBQXNCLEtBQUtkLEtBQUwsQ0FBV1ksUUFBckMsQ0FBakI7O0FBQ0EsVUFBTTBCLFFBQVEsR0FBRyxLQUFLRCxnQkFBTCxFQUFqQjs7QUFDQSxhQUFPRCxPQUFPLEdBQUdFLFFBQWpCO0FBQ0Q7Ozs4QkFFU0UsSyxFQUFPQyxNLEVBQVE7QUFDdkI7QUFDQSxVQUFNQyxRQUFRLEdBQUdGLEtBQUssR0FBRyxLQUFLRyxZQUFMLENBQWtCRixNQUFsQixDQUF6Qjs7QUFFQSxhQUFPLEtBQUtHLGVBQUwsQ0FBcUJGLFFBQXJCLENBQVA7QUFDRDs7O29DQVllaEMsRyxFQUFLO0FBQUEseUJBQ2EsS0FBS1YsS0FEbEI7QUFBQSxVQUNaWSxRQURZLGdCQUNaQSxRQURZO0FBQUEsVUFDRmlDLElBREUsZ0JBQ0ZBLElBREU7QUFBQSxVQUNJQyxLQURKLGdCQUNJQSxLQURKO0FBRW5CLGFBQU8scUNBQXFCcEMsR0FBckIsRUFBMEJFLFFBQTFCLEVBQW9DaUMsSUFBcEMsRUFBMENDLEtBQTFDLENBQVA7QUFDRDs7OzZCQTRDUTtBQUFBLHlCQVdILEtBQUs5QyxLQVhGO0FBQUEsVUFFTCtDLFFBRkssZ0JBRUxBLFFBRks7QUFBQSxVQUdMQyxRQUhLLGdCQUdMQSxRQUhLO0FBQUEsVUFJTGpCLFFBSkssZ0JBSUxBLFFBSks7QUFBQSxVQUtMakIsUUFMSyxnQkFLTEEsUUFMSztBQUFBLFVBTUxGLFFBTkssZ0JBTUxBLFFBTks7QUFBQSxVQU9MRCxNQVBLLGdCQU9MQSxNQVBLO0FBQUEsVUFRTFIsUUFSSyxnQkFRTEEsUUFSSztBQUFBLFVBU0wyQixpQkFUSyxnQkFTTEEsaUJBVEs7QUFBQSxVQVVMbUIsV0FWSyxnQkFVTEEsV0FWSztBQVlQLFVBQU1sQyxNQUFNLEdBQUcsQ0FBQ2dCLFFBQUQsSUFBYW5CLFFBQVEsR0FBRyxDQUF4QixHQUE0QkEsUUFBNUIsR0FBdUMsS0FBS1osS0FBTCxDQUFXZSxNQUFqRTtBQUNBLFVBQU1tQyxZQUFZLEdBQUd2QyxNQUFNLEdBQUdJLE1BQTlCO0FBQ0EsVUFBTXVCLFFBQVEsR0FBR3hCLFFBQVEsR0FBR0YsUUFBNUI7QUFDQSxVQUFNdUMsS0FBSyxHQUFJRCxZQUFZLEdBQUdaLFFBQWhCLEdBQTRCLEdBQTFDO0FBRUEsVUFBTWMsTUFBTSxHQUFJLENBQUNyQyxNQUFNLEdBQUdILFFBQVYsSUFBc0IwQixRQUF2QixHQUFtQyxHQUFsRDtBQUVBLDBCQUNFLGdDQUFDLGFBQUQ7QUFDRSxRQUFBLFNBQVMsRUFBRSw0QkFBVyxXQUFYLGtDQUE0QlMsUUFBNUI7QUFBc0NDLFVBQUFBLFFBQVEsRUFBUkE7QUFBdEMsV0FEYjtBQUVFLFFBQUEsR0FBRyxFQUFFLEtBQUtoQixHQUZaO0FBR0UsUUFBQSxRQUFRLEVBQUVELFFBSFo7QUFJRSxRQUFBLFFBQVEsRUFBRTVCO0FBSlosc0JBTUUsZ0NBQUMsaUJBQUQ7QUFBbUIsUUFBQSxTQUFTLEVBQUMsaUJBQTdCO0FBQStDLFFBQUEsUUFBUSxFQUFFQSxRQUF6RDtBQUFtRSxRQUFBLEdBQUcsRUFBRSxLQUFLa0Q7QUFBN0Usc0JBQ0UsZ0NBQUMsd0JBQUQ7QUFDRSxRQUFBLFNBQVMsRUFBQyx5QkFEWjtBQUVFLFFBQUEsSUFBSSxFQUFFLEtBQUtDLGVBQUwsQ0FBcUJILEtBQXJCLEVBQTRCQyxNQUE1QixDQUZSO0FBR0UsUUFBQSxhQUFhLEVBQUUsS0FBS0csY0FIdEI7QUFJRSxRQUFBLGlCQUFpQixFQUFFekIsaUJBSnJCO0FBS0UsUUFBQSxPQUFPLEVBQUVDLFFBTFg7QUFNRSxRQUFBLFFBQVEsRUFBRTVCLFFBTlo7QUFPRSxRQUFBLFdBQVcsRUFBRThDLFdBUGY7QUFRRSxRQUFBLEtBQUssRUFBRSxLQUFLSTtBQVJkLFFBREYsZUFXRSxnQ0FBQyx3QkFBRDtBQUNFLFFBQUEsU0FBUyxFQUFDLHlCQURaO0FBRUUsUUFBQSxJQUFJLEVBQUUsS0FBS0csZUFBTCxDQUFxQkwsS0FBckIsRUFBNEJDLE1BQTVCLENBRlI7QUFHRSxRQUFBLGFBQWEsRUFBRSxLQUFLSyxjQUh0QjtBQUlFLFFBQUEsaUJBQWlCLEVBQUUzQixpQkFKckI7QUFLRSxRQUFBLFFBQVEsRUFBRTNCLFFBTFo7QUFNRSxRQUFBLEtBQUssRUFBRVEsTUFOVDtBQU9FLFFBQUEsV0FBVyxFQUFFc0MsV0FQZjtBQVFFLFFBQUEsS0FBSyxFQUFFLEtBQUtJO0FBUmQsUUFYRixlQXFCRSxnQ0FBQywyQkFBRDtBQUNFLFFBQUEsS0FBSyxFQUFFRixLQURUO0FBRUUsUUFBQSxNQUFNLEVBQUVDLE1BRlY7QUFHRSxRQUFBLGFBQWEsRUFBRSxLQUFLcEQsS0FBTCxDQUFXMEQsYUFINUI7QUFJRSxRQUFBLGlCQUFpQixFQUFFLEtBQUtDLGlCQUoxQjtBQUtFLFFBQUEsUUFBUSxFQUFFeEQsUUFMWjtBQU1FLFFBQUEsS0FBSyxFQUFFLEtBQUtrRCxLQU5kO0FBT0UsUUFBQSxTQUFTLEVBQUUsS0FBS087QUFQbEIsUUFyQkYsQ0FORixDQURGO0FBd0NEOzs7RUF6TGlDQyxnQjs7O2lDQUFmdEQsTSxlQUNBO0FBQ2pCdUQsRUFBQUEsS0FBSyxFQUFFQyxzQkFBVUMsTUFEQTtBQUVqQmpDLEVBQUFBLFFBQVEsRUFBRWdDLHNCQUFVRSxJQUZIO0FBR2pCbEQsRUFBQUEsTUFBTSxFQUFFZ0Qsc0JBQVVHLE1BSEQ7QUFJakJ2RCxFQUFBQSxNQUFNLEVBQUVvRCxzQkFBVUcsTUFKRDtBQUtqQnRELEVBQUFBLFFBQVEsRUFBRW1ELHNCQUFVRyxNQUxIO0FBTWpCcEQsRUFBQUEsUUFBUSxFQUFFaUQsc0JBQVVHLE1BTkg7QUFPakJwQyxFQUFBQSxpQkFBaUIsRUFBRWlDLHNCQUFVRyxNQVBaO0FBUWpCaEQsRUFBQUEsZUFBZSxFQUFFNkMsc0JBQVVJLElBUlY7QUFTakJDLEVBQUFBLGNBQWMsRUFBRUwsc0JBQVVJLElBVFQ7QUFVakIvQyxFQUFBQSxlQUFlLEVBQUUyQyxzQkFBVUksSUFWVjtBQVdqQkUsRUFBQUEsY0FBYyxFQUFFTixzQkFBVUksSUFYVDtBQVlqQnpDLEVBQUFBLGlCQUFpQixFQUFFcUMsc0JBQVVJLElBWlo7QUFhakJ0QixFQUFBQSxJQUFJLEVBQUVrQixzQkFBVUcsTUFiQztBQWNqQlIsRUFBQUEsYUFBYSxFQUFFSyxzQkFBVUUsSUFkUjtBQWVqQmhCLEVBQUFBLFdBQVcsRUFBRWMsc0JBQVVFO0FBZk4sQztpQ0FEQTFELE0sa0JBbUJHO0FBQ3BCdUQsRUFBQUEsS0FBSyxFQUFFLEVBRGE7QUFFcEIvQixFQUFBQSxRQUFRLEVBQUUsSUFGVTtBQUdwQmhCLEVBQUFBLE1BQU0sRUFBRSxDQUhZO0FBSXBCSixFQUFBQSxNQUFNLEVBQUUsR0FKWTtBQUtwQkMsRUFBQUEsUUFBUSxFQUFFLENBTFU7QUFNcEJFLEVBQUFBLFFBQVEsRUFBRSxHQU5VO0FBT3BCK0IsRUFBQUEsSUFBSSxFQUFFLENBUGM7QUFRcEJmLEVBQUFBLGlCQUFpQixFQUFFLEVBUkM7QUFTcEI0QixFQUFBQSxhQUFhLEVBQUUsS0FUSztBQVVwQnhDLEVBQUFBLGVBQWUsRUFBRXRCLElBVkc7QUFXcEJ3RSxFQUFBQSxjQUFjLEVBQUV4RSxJQVhJO0FBWXBCd0IsRUFBQUEsZUFBZSxFQUFFeEIsSUFaRztBQWFwQnlFLEVBQUFBLGNBQWMsRUFBRXpFLElBYkk7QUFjcEI4QixFQUFBQSxpQkFBaUIsRUFBRTlCLElBZEM7QUFlcEJvRCxFQUFBQSxRQUFRLEVBQUUsS0FmVTtBQWdCcEI3QyxFQUFBQSxRQUFRLEVBQUUsS0FoQlU7QUFpQnBCOEMsRUFBQUEsV0FBVyxFQUFFO0FBakJPLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnQsIGNyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5cbmltcG9ydCBTbGlkZXJIYW5kbGUgZnJvbSAnLi9zbGlkZXItaGFuZGxlJztcbmltcG9ydCBTbGlkZXJCYXJIYW5kbGUgZnJvbSAnLi9zbGlkZXItYmFyLWhhbmRsZSc7XG5pbXBvcnQge25vcm1hbGl6ZVNsaWRlclZhbHVlfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IFN0eWxlZFJhbmdlU2xpZGVyID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNsaWRlckJhckJnZH07XG4gICR7cHJvcHMgPT4gYCR7cHJvcHMudmVydGljYWwgPyAnd2lkdGgnIDogJ2hlaWdodCd9OiAke3Byb3BzLnRoZW1lLnNsaWRlckJhckhlaWdodH1weGB9O1xuICAke3Byb3BzID0+IGAke3Byb3BzLnZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnfTogMTAwJWB9O1xuYDtcblxuY29uc3QgU2xpZGVyV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIGZsZXgtZ3JvdzogMTtcbiAgbWFyZ2luLXRvcDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJNYXJnaW5Ub3B9cHg7XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbGlkZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGlzUmFuZ2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB2YWx1ZTA6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgdmFsdWUxOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1pblZhbHVlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1heFZhbHVlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHNsaWRlckhhbmRsZVdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG9uU2xpZGVyMENoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25JbnB1dDBDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uU2xpZGVyMUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25JbnB1dDFDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uU2xpZGVyQmFyQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzdGVwOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGVuYWJsZUJhckRyYWc6IFByb3BUeXBlcy5ib29sLFxuICAgIHNob3dUb29sdGlwOiBQcm9wVHlwZXMuYm9vbFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgdGl0bGU6ICcnLFxuICAgIGlzUmFuZ2VkOiB0cnVlLFxuICAgIHZhbHVlMDogMCxcbiAgICB2YWx1ZTE6IDEwMCxcbiAgICBtaW5WYWx1ZTogMCxcbiAgICBtYXhWYWx1ZTogMTAwLFxuICAgIHN0ZXA6IDEsXG4gICAgc2xpZGVySGFuZGxlV2lkdGg6IDEyLFxuICAgIGVuYWJsZUJhckRyYWc6IGZhbHNlLFxuICAgIG9uU2xpZGVyMENoYW5nZTogbm9vcCxcbiAgICBvbklucHV0MENoYW5nZTogbm9vcCxcbiAgICBvblNsaWRlcjFDaGFuZ2U6IG5vb3AsXG4gICAgb25JbnB1dDFDaGFuZ2U6IG5vb3AsXG4gICAgb25TbGlkZXJCYXJDaGFuZ2U6IG5vb3AsXG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIHZlcnRpY2FsOiBmYWxzZSxcbiAgICBzaG93VG9vbHRpcDogZmFsc2VcbiAgfTtcblxuICByZWYgPSBjcmVhdGVSZWYoKTtcbiAgdHJhY2sgPSBjcmVhdGVSZWYoKTtcblxuICBfc2V0QW5jaG9yID0geCA9PiB7XG4gICAgLy8gdXNlZCB0byBjYWxjdWxhdGUgZGVsdGFcbiAgICB0aGlzLl9hbmNob3IgPSB4O1xuICB9O1xuXG4gIF9nZXRCYXNlRGlzdGFuY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudmVydGljYWwgPyB0aGlzLnJlZi5jdXJyZW50Lm9mZnNldEhlaWdodCA6IHRoaXMucmVmLmN1cnJlbnQub2Zmc2V0V2lkdGg7XG4gIH1cblxuICBfZ2V0RGVsdGFWYWwoeCkge1xuICAgIGNvbnN0IHBlcmNlbnQgPSB4IC8gdGhpcy5fZ2V0QmFzZURpc3RhbmNlKCk7XG4gICAgY29uc3QgbWF4RGVsdGEgPSB0aGlzLnByb3BzLm1heFZhbHVlIC0gdGhpcy5wcm9wcy5taW5WYWx1ZTtcbiAgICByZXR1cm4gcGVyY2VudCAqIG1heERlbHRhO1xuICB9XG4gIF9nZXREZWx0YVgodikge1xuICAgIGNvbnN0IHBlcmNlbnQgPSB2IC8gKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKTtcbiAgICBjb25zdCBtYXhEZWx0YSA9IHRoaXMuX2dldEJhc2VEaXN0YW5jZSgpO1xuICAgIHJldHVybiBwZXJjZW50ICogbWF4RGVsdGE7XG4gIH1cblxuICBfZ2V0VmFsdWUoYmFzZVYsIG9mZnNldCkge1xuICAgIC8vIG9mZnNldCBpcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiBzbGlkZXIgaGFuZGxlIGFuZCB0cmFjayBsZWZ0XG4gICAgY29uc3QgcmF3VmFsdWUgPSBiYXNlViArIHRoaXMuX2dldERlbHRhVmFsKG9mZnNldCk7XG5cbiAgICByZXR1cm4gdGhpcy5fbm9ybWFsaXplVmFsdWUocmF3VmFsdWUpO1xuICB9XG5cbiAgX2lzVmFsMEluUmFuZ2UgPSB2YWwgPT4ge1xuICAgIGNvbnN0IHt2YWx1ZTEsIG1pblZhbHVlfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIEJvb2xlYW4odmFsID49IG1pblZhbHVlICYmIHZhbCA8PSB2YWx1ZTEpO1xuICB9O1xuXG4gIF9pc1ZhbDFJblJhbmdlID0gdmFsID0+IHtcbiAgICBjb25zdCB7bWF4VmFsdWUsIHZhbHVlMH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBCb29sZWFuKHZhbCA8PSBtYXhWYWx1ZSAmJiB2YWwgPj0gdmFsdWUwKTtcbiAgfTtcblxuICBfbm9ybWFsaXplVmFsdWUodmFsKSB7XG4gICAgY29uc3Qge21pblZhbHVlLCBzdGVwLCBtYXJrc30gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBub3JtYWxpemVTbGlkZXJWYWx1ZSh2YWwsIG1pblZhbHVlLCBzdGVwLCBtYXJrcyk7XG4gIH1cblxuICBzbGlkZTBMaXN0ZW5lciA9IHggPT4ge1xuICAgIGNvbnN0IHZhbCA9IHRoaXMuX2dldFZhbHVlKHRoaXMucHJvcHMubWluVmFsdWUsIHgpO1xuXG4gICAgaWYgKHRoaXMuX2lzVmFsMEluUmFuZ2UodmFsKSkge1xuICAgICAgdGhpcy5wcm9wcy5vblNsaWRlcjBDaGFuZ2UodmFsKTtcbiAgICB9XG4gIH07XG5cbiAgc2xpZGUxTGlzdGVuZXIgPSB4ID0+IHtcbiAgICBjb25zdCB2YWwgPSB0aGlzLl9nZXRWYWx1ZSh0aGlzLnByb3BzLm1pblZhbHVlLCB4KTtcbiAgICBpZiAodGhpcy5faXNWYWwxSW5SYW5nZSh2YWwpKSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2xpZGVyMUNoYW5nZSh2YWwpO1xuICAgIH1cbiAgfTtcblxuICBzbGlkZXJCYXJMaXN0ZW5lciA9IHggPT4ge1xuICAgIGNvbnN0IHttaW5WYWx1ZSwgbWF4VmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICAvLyBmb3Igc2xpZGVyIGJhciwgd2UgdXNlIGRpc3RhbmNlIGRlbHRhXG4gICAgY29uc3QgYW5jaG9yID0gdGhpcy5fYW5jaG9yO1xuICAgIGNvbnN0IHZhbDAgPSB0aGlzLl9nZXRWYWx1ZSh0aGlzLnByb3BzLnZhbHVlMCwgeCAtIGFuY2hvcik7XG4gICAgY29uc3QgdmFsMSA9IHRoaXMuX2dldFZhbHVlKHRoaXMucHJvcHMudmFsdWUxLCB4IC0gYW5jaG9yKTtcblxuICAgIGlmICh2YWwwID49IG1pblZhbHVlICYmIHZhbDEgPD0gbWF4VmFsdWUgJiYgdmFsMSA+PSB2YWwwKSB7XG4gICAgICBjb25zdCBkZWx0YVggPSB0aGlzLl9nZXREZWx0YVgodmFsMCAtIHRoaXMucHJvcHMudmFsdWUwKTtcbiAgICAgIHRoaXMucHJvcHMub25TbGlkZXJCYXJDaGFuZ2UodmFsMCwgdmFsMSk7XG4gICAgICAvLyB1cGRhdGUgYW5jaG9yXG4gICAgICB0aGlzLl9hbmNob3IgPSB0aGlzLl9hbmNob3IgKyBkZWx0YVg7XG4gICAgfVxuICB9O1xuXG4gIGNhbGNIYW5kbGVMZWZ0MCA9ICh3LCBsLCBudW0pID0+IHtcbiAgICByZXR1cm4gdyA9PT0gMFxuICAgICAgPyBgY2FsYygke2x9JSAtICR7dGhpcy5wcm9wcy5zbGlkZXJIYW5kbGVXaWR0aCAvIDJ9cHgpYFxuICAgICAgOiBgY2FsYygke2x9JSAtICR7dGhpcy5wcm9wcy5zbGlkZXJIYW5kbGVXaWR0aCAvIDJ9cHgpYDtcbiAgfTtcblxuICBjYWxjSGFuZGxlTGVmdDEgPSAodywgbCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmlzUmFuZ2VkICYmIHcgPT09IDBcbiAgICAgID8gYCR7bH0lYFxuICAgICAgOiBgY2FsYygke2wgKyB3fSUgLSAke3RoaXMucHJvcHMuc2xpZGVySGFuZGxlV2lkdGggLyAyfXB4KWA7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNsYXNzU2V0LFxuICAgICAgZGlzYWJsZWQsXG4gICAgICBpc1JhbmdlZCxcbiAgICAgIG1heFZhbHVlLFxuICAgICAgbWluVmFsdWUsXG4gICAgICB2YWx1ZTEsXG4gICAgICB2ZXJ0aWNhbCxcbiAgICAgIHNsaWRlckhhbmRsZVdpZHRoLFxuICAgICAgc2hvd1Rvb2x0aXBcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB2YWx1ZTAgPSAhaXNSYW5nZWQgJiYgbWluVmFsdWUgPiAwID8gbWluVmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlMDtcbiAgICBjb25zdCBjdXJyVmFsRGVsdGEgPSB2YWx1ZTEgLSB2YWx1ZTA7XG4gICAgY29uc3QgbWF4RGVsdGEgPSBtYXhWYWx1ZSAtIG1pblZhbHVlO1xuICAgIGNvbnN0IHdpZHRoID0gKGN1cnJWYWxEZWx0YSAvIG1heERlbHRhKSAqIDEwMDtcblxuICAgIGNvbnN0IHYwTGVmdCA9ICgodmFsdWUwIC0gbWluVmFsdWUpIC8gbWF4RGVsdGEpICogMTAwO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxTbGlkZXJXcmFwcGVyXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygna2ctc2xpZGVyJywgey4uLmNsYXNzU2V0LCBkaXNhYmxlZH0pfVxuICAgICAgICByZWY9e3RoaXMucmVmfVxuICAgICAgICBpc1JhbmdlZD17aXNSYW5nZWR9XG4gICAgICAgIHZlcnRpY2FsPXt2ZXJ0aWNhbH1cbiAgICAgID5cbiAgICAgICAgPFN0eWxlZFJhbmdlU2xpZGVyIGNsYXNzTmFtZT1cImtnLXJhbmdlLXNsaWRlclwiIHZlcnRpY2FsPXt2ZXJ0aWNhbH0gcmVmPXt0aGlzLnRyYWNrfT5cbiAgICAgICAgICA8U2xpZGVySGFuZGxlXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJrZy1yYW5nZS1zbGlkZXJfX2hhbmRsZVwiXG4gICAgICAgICAgICBsZWZ0PXt0aGlzLmNhbGNIYW5kbGVMZWZ0MCh3aWR0aCwgdjBMZWZ0KX1cbiAgICAgICAgICAgIHZhbHVlTGlzdGVuZXI9e3RoaXMuc2xpZGUwTGlzdGVuZXJ9XG4gICAgICAgICAgICBzbGlkZXJIYW5kbGVXaWR0aD17c2xpZGVySGFuZGxlV2lkdGh9XG4gICAgICAgICAgICBkaXNwbGF5PXtpc1JhbmdlZH1cbiAgICAgICAgICAgIHZlcnRpY2FsPXt2ZXJ0aWNhbH1cbiAgICAgICAgICAgIHNob3dUb29sdGlwPXtzaG93VG9vbHRpcH1cbiAgICAgICAgICAgIHRyYWNrPXt0aGlzLnRyYWNrfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPFNsaWRlckhhbmRsZVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwia2ctcmFuZ2Utc2xpZGVyX19oYW5kbGVcIlxuICAgICAgICAgICAgbGVmdD17dGhpcy5jYWxjSGFuZGxlTGVmdDEod2lkdGgsIHYwTGVmdCl9XG4gICAgICAgICAgICB2YWx1ZUxpc3RlbmVyPXt0aGlzLnNsaWRlMUxpc3RlbmVyfVxuICAgICAgICAgICAgc2xpZGVySGFuZGxlV2lkdGg9e3NsaWRlckhhbmRsZVdpZHRofVxuICAgICAgICAgICAgdmVydGljYWw9e3ZlcnRpY2FsfVxuICAgICAgICAgICAgdmFsdWU9e3ZhbHVlMX1cbiAgICAgICAgICAgIHNob3dUb29sdGlwPXtzaG93VG9vbHRpcH1cbiAgICAgICAgICAgIHRyYWNrPXt0aGlzLnRyYWNrfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPFNsaWRlckJhckhhbmRsZVxuICAgICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAgICAgdjBMZWZ0PXt2MExlZnR9XG4gICAgICAgICAgICBlbmFibGVCYXJEcmFnPXt0aGlzLnByb3BzLmVuYWJsZUJhckRyYWd9XG4gICAgICAgICAgICBzbGlkZXJCYXJMaXN0ZW5lcj17dGhpcy5zbGlkZXJCYXJMaXN0ZW5lcn1cbiAgICAgICAgICAgIHZlcnRpY2FsPXt2ZXJ0aWNhbH1cbiAgICAgICAgICAgIHRyYWNrPXt0aGlzLnRyYWNrfVxuICAgICAgICAgICAgc2V0QW5jaG9yPXt0aGlzLl9zZXRBbmNob3J9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9TdHlsZWRSYW5nZVNsaWRlcj5cbiAgICAgIDwvU2xpZGVyV3JhcHBlcj5cbiAgICApO1xuICB9XG59XG4iXX0=