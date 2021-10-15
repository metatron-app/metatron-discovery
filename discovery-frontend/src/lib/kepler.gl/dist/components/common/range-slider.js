"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = RangeSliderFactory;

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

var _reselect = require("reselect");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _rangePlot = _interopRequireDefault(require("./range-plot"));

var _slider = _interopRequireDefault(require("./slider/slider"));

var _styledComponents2 = require("./styled-components");

var _dataUtils = require("../../utils/data-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-top: 6px;\n  display: flex;\n  justify-content: space-between;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  position: relative;\n  align-items: center;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: ", "px;\n  margin-left: ", "px;\n  font-size: ", "; // 10px // 12px;\n  padding: ", "; // 4px 6px; // 6px 12px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var SliderInput = (0, _styledComponents["default"])(_styledComponents2.Input)(_templateObject(), function (props) {
  return props.theme.sliderInputWidth;
}, function (props) {
  return props.flush ? 0 : props.size === 'tiny' ? 12 : 18;
}, function (props) {
  return props.theme.sliderInputFontSize;
}, function (props) {
  return props.theme.sliderInputPadding;
});

var SliderWrapper = _styledComponents["default"].div(_templateObject2());

var RangeInputWrapper = _styledComponents["default"].div(_templateObject3());

RangeSliderFactory.deps = [_rangePlot["default"]];

function RangeSliderFactory(RangePlot) {
  var RangeSlider = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(RangeSlider, _Component);

    var _super = _createSuper(RangeSlider);

    function RangeSlider() {
      var _this;

      (0, _classCallCheck2["default"])(this, RangeSlider);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        value0: 0,
        value1: 1,
        prevValue0: 0,
        prevValue1: 1,
        width: 288
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "sliderContainer", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "inputValue0", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "inputValue1", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "value0Selector", function (props) {
        return props.value0;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "value1Selector", function (props) {
        return props.value1;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filterValueSelector", (0, _reselect.createSelector)(_this.value0Selector, _this.value1Selector, function (value0, value1) {
        return [value0, value1];
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isVal0InRange", function (val) {
        var _this$props = _this.props,
            value1 = _this$props.value1,
            range = _this$props.range;
        return Boolean(val >= range[0] && val <= value1);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isVal1InRange", function (val) {
        var _this$props2 = _this.props,
            range = _this$props2.range,
            value0 = _this$props2.value0;
        return Boolean(val <= range[1] && val >= value0);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_roundValToStep", function (val) {
        var _this$props3 = _this.props,
            range = _this$props3.range,
            step = _this$props3.step;
        return (0, _dataUtils.roundValToStep)(range[0], step, val);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_setRangeVal1", function (val) {
        var _this$props4 = _this.props,
            value0 = _this$props4.value0,
            onChange = _this$props4.onChange;
        var val1 = Number(val);

        if (_this._isVal1InRange(val1)) {
          onChange([value0, _this._roundValToStep(val1)]);
          return true;
        }

        return false;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_setRangeVal0", function (val) {
        var _this$props5 = _this.props,
            value1 = _this$props5.value1,
            onChange = _this$props5.onChange;
        var val0 = Number(val);

        if (_this._isVal0InRange(val0)) {
          onChange([_this._roundValToStep(val0), value1]);
          return true;
        }

        return false;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onChangeInput", function (key, e) {
        _this.setState((0, _defineProperty2["default"])({}, key, e.target.value));
      });
      return _this;
    }

    (0, _createClass2["default"])(RangeSlider, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._resize();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps, prevState) {
        this._resize();
      }
    }, {
      key: "_resize",
      value: function _resize() {
        var width = this.sliderContainer.current.offsetWidth;

        if (width !== this.state.width) {
          this.setState({
            width: width
          });
        }
      }
    }, {
      key: "_renderInput",
      value: function _renderInput(key) {
        var _this2 = this;

        var setRange = key === 'value0' ? this._setRangeVal0 : this._setRangeVal1;
        var ref = key === 'value0' ? this.inputValue0 : this.inputValue1;

        var update = function update(e) {
          if (!setRange(e.target.value)) {
            _this2.setState((0, _defineProperty2["default"])({}, key, _this2.state[key]));
          }
        };

        var onChange = this._onChangeInput.bind(this, key);

        return /*#__PURE__*/_react["default"].createElement(SliderInput, {
          className: "kg-range-slider__input",
          type: "number",
          ref: ref,
          id: "slider-input-".concat(key),
          key: key,
          value: this.state[key],
          onChange: onChange,
          onKeyPress: function onKeyPress(e) {
            if (e.key === 'Enter') {
              update(e);
              ref.current.blur();
            }
          },
          onBlur: update,
          flush: key === 'value0',
          size: this.props.inputSize,
          secondary: this.props.inputTheme === 'secondary'
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props6 = this.props,
            isRanged = _this$props6.isRanged,
            showInput = _this$props6.showInput,
            histogram = _this$props6.histogram,
            range = _this$props6.range,
            onChange = _this$props6.onChange,
            sliderHandleWidth = _this$props6.sliderHandleWidth,
            step = _this$props6.step;
        var height = isRanged && showInput ? '16px' : '24px';
        var width = this.state.width;
        var plotWidth = Math.max(width - sliderHandleWidth, 0);
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "kg-range-slider",
          style: {
            width: '100%',
            padding: "0 ".concat(sliderHandleWidth / 2, "px")
          },
          ref: this.sliderContainer
        }, histogram && histogram.length ? /*#__PURE__*/_react["default"].createElement(RangePlot, {
          histogram: histogram,
          lineChart: this.props.lineChart,
          plotType: this.props.plotType,
          isEnlarged: this.props.isEnlarged,
          onBrush: function onBrush(val0, val1) {
            return onChange([val0, val1]);
          },
          marks: this.props.marks,
          range: range,
          value: this.filterValueSelector(this.props),
          width: plotWidth,
          isRanged: isRanged,
          step: step
        }) : null, /*#__PURE__*/_react["default"].createElement(SliderWrapper, {
          style: {
            height: height
          },
          className: "kg-range-slider__slider"
        }, this.props.xAxis ? /*#__PURE__*/_react["default"].createElement(this.props.xAxis, {
          width: plotWidth,
          domain: range
        }) : null, /*#__PURE__*/_react["default"].createElement(_slider["default"], {
          marks: this.props.marks,
          showValues: false,
          isRanged: isRanged,
          minValue: range[0],
          maxValue: range[1],
          value0: this.props.value0,
          value1: this.props.value1,
          step: step,
          handleWidth: sliderHandleWidth,
          onSlider0Change: this._setRangeVal0,
          onSlider1Change: this._setRangeVal1,
          onSliderBarChange: function onSliderBarChange(val0, val1) {
            onChange([val0, val1]);
          },
          enableBarDrag: true
        }), !isRanged && showInput ? this._renderInput('value1') : null), isRanged && showInput ? /*#__PURE__*/_react["default"].createElement(RangeInputWrapper, {
          className: "range-slider__input-group"
        }, this._renderInput('value0'), this._renderInput('value1')) : null);
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(props, state) {
        var update = null;
        var value0 = props.value0,
            value1 = props.value1;

        if (props.value0 !== state.prevValue0 && !isNaN(value0)) {
          update = _objectSpread(_objectSpread({}, update || {}), {}, {
            value0: value0,
            prevValue0: value0
          });
        }

        if (props.value1 !== state.prevValue1 && !isNaN(value1)) {
          update = _objectSpread(_objectSpread({}, update || {}), {}, {
            value1: value1,
            prevValue1: value1
          });
        }

        return update;
      }
    }]);
    return RangeSlider;
  }(_react.Component);

  (0, _defineProperty2["default"])(RangeSlider, "propTypes", {
    range: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    value0: _propTypes["default"].number.isRequired,
    value1: _propTypes["default"].number.isRequired,
    onChange: _propTypes["default"].func.isRequired,
    histogram: _propTypes["default"].arrayOf(_propTypes["default"].any),
    isRanged: _propTypes["default"].bool,
    isEnlarged: _propTypes["default"].bool,
    showInput: _propTypes["default"].bool,
    inputTheme: _propTypes["default"].string,
    inputSize: _propTypes["default"].string,
    step: _propTypes["default"].number,
    sliderHandleWidth: _propTypes["default"].number,
    xAxis: _propTypes["default"].func
  });
  (0, _defineProperty2["default"])(RangeSlider, "defaultProps", {
    isEnlarged: false,
    isRanged: true,
    showInput: true,
    sliderHandleWidth: 12,
    inputTheme: '',
    inputSize: 'small',
    onChange: function onChange() {}
  });
  (0, _reactLifecyclesCompat.polyfill)(RangeSlider);
  return RangeSlider;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9yYW5nZS1zbGlkZXIuanMiXSwibmFtZXMiOlsiU2xpZGVySW5wdXQiLCJJbnB1dCIsInByb3BzIiwidGhlbWUiLCJzbGlkZXJJbnB1dFdpZHRoIiwiZmx1c2giLCJzaXplIiwic2xpZGVySW5wdXRGb250U2l6ZSIsInNsaWRlcklucHV0UGFkZGluZyIsIlNsaWRlcldyYXBwZXIiLCJzdHlsZWQiLCJkaXYiLCJSYW5nZUlucHV0V3JhcHBlciIsIlJhbmdlU2xpZGVyRmFjdG9yeSIsImRlcHMiLCJSYW5nZVBsb3RGYWN0b3J5IiwiUmFuZ2VQbG90IiwiUmFuZ2VTbGlkZXIiLCJ2YWx1ZTAiLCJ2YWx1ZTEiLCJwcmV2VmFsdWUwIiwicHJldlZhbHVlMSIsIndpZHRoIiwidmFsdWUwU2VsZWN0b3IiLCJ2YWx1ZTFTZWxlY3RvciIsInZhbCIsInJhbmdlIiwiQm9vbGVhbiIsInN0ZXAiLCJvbkNoYW5nZSIsInZhbDEiLCJOdW1iZXIiLCJfaXNWYWwxSW5SYW5nZSIsIl9yb3VuZFZhbFRvU3RlcCIsInZhbDAiLCJfaXNWYWwwSW5SYW5nZSIsImtleSIsImUiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiX3Jlc2l6ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsInNsaWRlckNvbnRhaW5lciIsImN1cnJlbnQiLCJvZmZzZXRXaWR0aCIsInN0YXRlIiwic2V0UmFuZ2UiLCJfc2V0UmFuZ2VWYWwwIiwiX3NldFJhbmdlVmFsMSIsInJlZiIsImlucHV0VmFsdWUwIiwiaW5wdXRWYWx1ZTEiLCJ1cGRhdGUiLCJfb25DaGFuZ2VJbnB1dCIsImJpbmQiLCJibHVyIiwiaW5wdXRTaXplIiwiaW5wdXRUaGVtZSIsImlzUmFuZ2VkIiwic2hvd0lucHV0IiwiaGlzdG9ncmFtIiwic2xpZGVySGFuZGxlV2lkdGgiLCJoZWlnaHQiLCJwbG90V2lkdGgiLCJNYXRoIiwibWF4IiwicGFkZGluZyIsImxlbmd0aCIsImxpbmVDaGFydCIsInBsb3RUeXBlIiwiaXNFbmxhcmdlZCIsIm1hcmtzIiwiZmlsdGVyVmFsdWVTZWxlY3RvciIsInhBeGlzIiwiX3JlbmRlcklucHV0IiwiaXNOYU4iLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJhbnkiLCJib29sIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxXQUFXLEdBQUcsa0NBQU9DLHdCQUFQLENBQUgsb0JBQ04sVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxnQkFBaEI7QUFBQSxDQURDLEVBRUEsVUFBQUYsS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0csS0FBTixHQUFjLENBQWQsR0FBa0JILEtBQUssQ0FBQ0ksSUFBTixLQUFlLE1BQWYsR0FBd0IsRUFBeEIsR0FBNkIsRUFBcEQ7QUFBQSxDQUZMLEVBR0YsVUFBQUosS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSSxtQkFBaEI7QUFBQSxDQUhILEVBSUosVUFBQUwsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSyxrQkFBaEI7QUFBQSxDQUpELENBQWpCOztBQU9BLElBQU1DLGFBQWEsR0FBR0MsNkJBQU9DLEdBQVYsb0JBQW5COztBQU1BLElBQU1DLGlCQUFpQixHQUFHRiw2QkFBT0MsR0FBVixvQkFBdkI7O0FBTUFFLGtCQUFrQixDQUFDQyxJQUFuQixHQUEwQixDQUFDQyxxQkFBRCxDQUExQjs7QUFFZSxTQUFTRixrQkFBVCxDQUE0QkcsU0FBNUIsRUFBdUM7QUFBQSxNQUM5Q0MsV0FEOEM7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBOztBQUFB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LE1BQU0sRUFBRTRELHNCQUFVRSxNQUFWLENBQWlCQyxVQUhSO0FBSWpCckQsSUFBQUEsUUFBUSxFQUFFa0Qsc0JBQVVJLElBQVYsQ0FBZUQsVUFKUjtBQUtqQnBCLElBQUFBLFNBQVMsRUFBRWlCLHNCQUFVQyxPQUFWLENBQWtCRCxzQkFBVUssR0FBNUIsQ0FMTTtBQU1qQnhCLElBQUFBLFFBQVEsRUFBRW1CLHNCQUFVTSxJQU5IO0FBT2pCYixJQUFBQSxVQUFVLEVBQUVPLHNCQUFVTSxJQVBMO0FBUWpCeEIsSUFBQUEsU0FBUyxFQUFFa0Isc0JBQVVNLElBUko7QUFTakIxQixJQUFBQSxVQUFVLEVBQUVvQixzQkFBVU8sTUFUTDtBQVVqQjVCLElBQUFBLFNBQVMsRUFBRXFCLHNCQUFVTyxNQVZKO0FBV2pCMUQsSUFBQUEsSUFBSSxFQUFFbUQsc0JBQVVFLE1BWEM7QUFZakJsQixJQUFBQSxpQkFBaUIsRUFBRWdCLHNCQUFVRSxNQVpaO0FBYWpCTixJQUFBQSxLQUFLLEVBQUVJLHNCQUFVSTtBQWJBLEdBRitCO0FBQUEsbUNBQzlDbEUsV0FEOEMsa0JBa0I1QjtBQUNwQnVELElBQUFBLFVBQVUsRUFBRSxLQURRO0FBRXBCWixJQUFBQSxRQUFRLEVBQUUsSUFGVTtBQUdwQkMsSUFBQUEsU0FBUyxFQUFFLElBSFM7QUFJcEJFLElBQUFBLGlCQUFpQixFQUFFLEVBSkM7QUFLcEJKLElBQUFBLFVBQVUsRUFBRSxFQUxRO0FBTXBCRCxJQUFBQSxTQUFTLEVBQUUsT0FOUztBQU9wQjdCLElBQUFBLFFBQVEsRUFBRSxvQkFBTSxDQUFFO0FBUEUsR0FsQjRCO0FBbU5wRCx1Q0FBU1osV0FBVDtBQUVBLFNBQU9BLFdBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudCwgY3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge3BvbHlmaWxsfSBmcm9tICdyZWFjdC1saWZlY3ljbGVzLWNvbXBhdCc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgUmFuZ2VQbG90RmFjdG9yeSBmcm9tICcuL3JhbmdlLXBsb3QnO1xuaW1wb3J0IFNsaWRlciBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zbGlkZXIvc2xpZGVyJztcbmltcG9ydCB7SW5wdXR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcblxuaW1wb3J0IHtyb3VuZFZhbFRvU3RlcH0gZnJvbSAndXRpbHMvZGF0YS11dGlscyc7XG5cbmNvbnN0IFNsaWRlcklucHV0ID0gc3R5bGVkKElucHV0KWBcbiAgd2lkdGg6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2xpZGVySW5wdXRXaWR0aH1weDtcbiAgbWFyZ2luLWxlZnQ6ICR7cHJvcHMgPT4gKHByb3BzLmZsdXNoID8gMCA6IHByb3BzLnNpemUgPT09ICd0aW55JyA/IDEyIDogMTgpfXB4O1xuICBmb250LXNpemU6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2xpZGVySW5wdXRGb250U2l6ZX07IC8vIDEwcHggLy8gMTJweDtcbiAgcGFkZGluZzogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJJbnB1dFBhZGRpbmd9OyAvLyA0cHggNnB4OyAvLyA2cHggMTJweDtcbmA7XG5cbmNvbnN0IFNsaWRlcldyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5gO1xuXG5jb25zdCBSYW5nZUlucHV0V3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbi10b3A6IDZweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuYDtcblxuUmFuZ2VTbGlkZXJGYWN0b3J5LmRlcHMgPSBbUmFuZ2VQbG90RmFjdG9yeV07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJhbmdlU2xpZGVyRmFjdG9yeShSYW5nZVBsb3QpIHtcbiAgY2xhc3MgUmFuZ2VTbGlkZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICByYW5nZTogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm51bWJlcikuaXNSZXF1aXJlZCxcbiAgICAgIHZhbHVlMDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgdmFsdWUxOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGhpc3RvZ3JhbTogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSksXG4gICAgICBpc1JhbmdlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBpc0VubGFyZ2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIHNob3dJbnB1dDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBpbnB1dFRoZW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgaW5wdXRTaXplOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgc3RlcDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHNsaWRlckhhbmRsZVdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgeEF4aXM6IFByb3BUeXBlcy5mdW5jXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICBpc0VubGFyZ2VkOiBmYWxzZSxcbiAgICAgIGlzUmFuZ2VkOiB0cnVlLFxuICAgICAgc2hvd0lucHV0OiB0cnVlLFxuICAgICAgc2xpZGVySGFuZGxlV2lkdGg6IDEyLFxuICAgICAgaW5wdXRUaGVtZTogJycsXG4gICAgICBpbnB1dFNpemU6ICdzbWFsbCcsXG4gICAgICBvbkNoYW5nZTogKCkgPT4ge31cbiAgICB9O1xuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wcywgc3RhdGUpIHtcbiAgICAgIGxldCB1cGRhdGUgPSBudWxsO1xuICAgICAgY29uc3Qge3ZhbHVlMCwgdmFsdWUxfSA9IHByb3BzO1xuICAgICAgaWYgKHByb3BzLnZhbHVlMCAhPT0gc3RhdGUucHJldlZhbHVlMCAmJiAhaXNOYU4odmFsdWUwKSkge1xuICAgICAgICB1cGRhdGUgPSB7Li4uKHVwZGF0ZSB8fCB7fSksIHZhbHVlMCwgcHJldlZhbHVlMDogdmFsdWUwfTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9wcy52YWx1ZTEgIT09IHN0YXRlLnByZXZWYWx1ZTEgJiYgIWlzTmFOKHZhbHVlMSkpIHtcbiAgICAgICAgdXBkYXRlID0gey4uLih1cGRhdGUgfHwge30pLCB2YWx1ZTEsIHByZXZWYWx1ZTE6IHZhbHVlMX07XG4gICAgICB9XG4gICAgICByZXR1cm4gdXBkYXRlO1xuICAgIH1cblxuICAgIHN0YXRlID0ge1xuICAgICAgdmFsdWUwOiAwLFxuICAgICAgdmFsdWUxOiAxLFxuICAgICAgcHJldlZhbHVlMDogMCxcbiAgICAgIHByZXZWYWx1ZTE6IDEsXG4gICAgICB3aWR0aDogMjg4XG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fcmVzaXplKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgICB0aGlzLl9yZXNpemUoKTtcbiAgICB9XG5cbiAgICBzbGlkZXJDb250YWluZXIgPSBjcmVhdGVSZWYoKTtcbiAgICBpbnB1dFZhbHVlMCA9IGNyZWF0ZVJlZigpO1xuICAgIGlucHV0VmFsdWUxID0gY3JlYXRlUmVmKCk7XG4gICAgdmFsdWUwU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy52YWx1ZTA7XG4gICAgdmFsdWUxU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy52YWx1ZTE7XG4gICAgZmlsdGVyVmFsdWVTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy52YWx1ZTBTZWxlY3RvcixcbiAgICAgIHRoaXMudmFsdWUxU2VsZWN0b3IsXG4gICAgICAodmFsdWUwLCB2YWx1ZTEpID0+IFt2YWx1ZTAsIHZhbHVlMV1cbiAgICApO1xuXG4gICAgX2lzVmFsMEluUmFuZ2UgPSB2YWwgPT4ge1xuICAgICAgY29uc3Qge3ZhbHVlMSwgcmFuZ2V9ID0gdGhpcy5wcm9wcztcblxuICAgICAgcmV0dXJuIEJvb2xlYW4odmFsID49IHJhbmdlWzBdICYmIHZhbCA8PSB2YWx1ZTEpO1xuICAgIH07XG5cbiAgICBfaXNWYWwxSW5SYW5nZSA9IHZhbCA9PiB7XG4gICAgICBjb25zdCB7cmFuZ2UsIHZhbHVlMH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICByZXR1cm4gQm9vbGVhbih2YWwgPD0gcmFuZ2VbMV0gJiYgdmFsID49IHZhbHVlMCk7XG4gICAgfTtcblxuICAgIF9yb3VuZFZhbFRvU3RlcCA9IHZhbCA9PiB7XG4gICAgICBjb25zdCB7cmFuZ2UsIHN0ZXB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgcmV0dXJuIHJvdW5kVmFsVG9TdGVwKHJhbmdlWzBdLCBzdGVwLCB2YWwpO1xuICAgIH07XG5cbiAgICBfc2V0UmFuZ2VWYWwxID0gdmFsID0+IHtcbiAgICAgIGNvbnN0IHt2YWx1ZTAsIG9uQ2hhbmdlfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB2YWwxID0gTnVtYmVyKHZhbCk7XG4gICAgICBpZiAodGhpcy5faXNWYWwxSW5SYW5nZSh2YWwxKSkge1xuICAgICAgICBvbkNoYW5nZShbdmFsdWUwLCB0aGlzLl9yb3VuZFZhbFRvU3RlcCh2YWwxKV0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgX3NldFJhbmdlVmFsMCA9IHZhbCA9PiB7XG4gICAgICBjb25zdCB7dmFsdWUxLCBvbkNoYW5nZX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgdmFsMCA9IE51bWJlcih2YWwpO1xuXG4gICAgICBpZiAodGhpcy5faXNWYWwwSW5SYW5nZSh2YWwwKSkge1xuICAgICAgICBvbkNoYW5nZShbdGhpcy5fcm91bmRWYWxUb1N0ZXAodmFsMCksIHZhbHVlMV0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgX3Jlc2l6ZSgpIHtcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5zbGlkZXJDb250YWluZXIuY3VycmVudC5vZmZzZXRXaWR0aDtcbiAgICAgIGlmICh3aWR0aCAhPT0gdGhpcy5zdGF0ZS53aWR0aCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt3aWR0aH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfb25DaGFuZ2VJbnB1dCA9IChrZXksIGUpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1trZXldOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBfcmVuZGVySW5wdXQoa2V5KSB7XG4gICAgICBjb25zdCBzZXRSYW5nZSA9IGtleSA9PT0gJ3ZhbHVlMCcgPyB0aGlzLl9zZXRSYW5nZVZhbDAgOiB0aGlzLl9zZXRSYW5nZVZhbDE7XG4gICAgICBjb25zdCByZWYgPSBrZXkgPT09ICd2YWx1ZTAnID8gdGhpcy5pbnB1dFZhbHVlMCA6IHRoaXMuaW5wdXRWYWx1ZTE7XG4gICAgICBjb25zdCB1cGRhdGUgPSBlID0+IHtcbiAgICAgICAgaWYgKCFzZXRSYW5nZShlLnRhcmdldC52YWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtba2V5XTogdGhpcy5zdGF0ZVtrZXldfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG9uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2VJbnB1dC5iaW5kKHRoaXMsIGtleSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTbGlkZXJJbnB1dFxuICAgICAgICAgIGNsYXNzTmFtZT1cImtnLXJhbmdlLXNsaWRlcl9faW5wdXRcIlxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICAgIGlkPXtgc2xpZGVyLWlucHV0LSR7a2V5fWB9XG4gICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGVba2V5XX1cbiAgICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgICAgb25LZXlQcmVzcz17ZSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgdXBkYXRlKGUpO1xuICAgICAgICAgICAgICByZWYuY3VycmVudC5ibHVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfX1cbiAgICAgICAgICBvbkJsdXI9e3VwZGF0ZX1cbiAgICAgICAgICBmbHVzaD17a2V5ID09PSAndmFsdWUwJ31cbiAgICAgICAgICBzaXplPXt0aGlzLnByb3BzLmlucHV0U2l6ZX1cbiAgICAgICAgICBzZWNvbmRhcnk9e3RoaXMucHJvcHMuaW5wdXRUaGVtZSA9PT0gJ3NlY29uZGFyeSd9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtpc1JhbmdlZCwgc2hvd0lucHV0LCBoaXN0b2dyYW0sIHJhbmdlLCBvbkNoYW5nZSwgc2xpZGVySGFuZGxlV2lkdGgsIHN0ZXB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3QgaGVpZ2h0ID0gaXNSYW5nZWQgJiYgc2hvd0lucHV0ID8gJzE2cHgnIDogJzI0cHgnO1xuICAgICAgY29uc3Qge3dpZHRofSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCBwbG90V2lkdGggPSBNYXRoLm1heCh3aWR0aCAtIHNsaWRlckhhbmRsZVdpZHRoLCAwKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cImtnLXJhbmdlLXNsaWRlclwiXG4gICAgICAgICAgc3R5bGU9e3t3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiBgMCAke3NsaWRlckhhbmRsZVdpZHRoIC8gMn1weGB9fVxuICAgICAgICAgIHJlZj17dGhpcy5zbGlkZXJDb250YWluZXJ9XG4gICAgICAgID5cbiAgICAgICAgICB7aGlzdG9ncmFtICYmIGhpc3RvZ3JhbS5sZW5ndGggPyAoXG4gICAgICAgICAgICA8UmFuZ2VQbG90XG4gICAgICAgICAgICAgIGhpc3RvZ3JhbT17aGlzdG9ncmFtfVxuICAgICAgICAgICAgICBsaW5lQ2hhcnQ9e3RoaXMucHJvcHMubGluZUNoYXJ0fVxuICAgICAgICAgICAgICBwbG90VHlwZT17dGhpcy5wcm9wcy5wbG90VHlwZX1cbiAgICAgICAgICAgICAgaXNFbmxhcmdlZD17dGhpcy5wcm9wcy5pc0VubGFyZ2VkfVxuICAgICAgICAgICAgICBvbkJydXNoPXsodmFsMCwgdmFsMSkgPT4gb25DaGFuZ2UoW3ZhbDAsIHZhbDFdKX1cbiAgICAgICAgICAgICAgbWFya3M9e3RoaXMucHJvcHMubWFya3N9XG4gICAgICAgICAgICAgIHJhbmdlPXtyYW5nZX1cbiAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuZmlsdGVyVmFsdWVTZWxlY3Rvcih0aGlzLnByb3BzKX1cbiAgICAgICAgICAgICAgd2lkdGg9e3Bsb3RXaWR0aH1cbiAgICAgICAgICAgICAgaXNSYW5nZWQ9e2lzUmFuZ2VkfVxuICAgICAgICAgICAgICBzdGVwPXtzdGVwfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8U2xpZGVyV3JhcHBlciBzdHlsZT17e2hlaWdodH19IGNsYXNzTmFtZT1cImtnLXJhbmdlLXNsaWRlcl9fc2xpZGVyXCI+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy54QXhpcyA/IDx0aGlzLnByb3BzLnhBeGlzIHdpZHRoPXtwbG90V2lkdGh9IGRvbWFpbj17cmFuZ2V9IC8+IDogbnVsbH1cbiAgICAgICAgICAgIDxTbGlkZXJcbiAgICAgICAgICAgICAgbWFya3M9e3RoaXMucHJvcHMubWFya3N9XG4gICAgICAgICAgICAgIHNob3dWYWx1ZXM9e2ZhbHNlfVxuICAgICAgICAgICAgICBpc1JhbmdlZD17aXNSYW5nZWR9XG4gICAgICAgICAgICAgIG1pblZhbHVlPXtyYW5nZVswXX1cbiAgICAgICAgICAgICAgbWF4VmFsdWU9e3JhbmdlWzFdfVxuICAgICAgICAgICAgICB2YWx1ZTA9e3RoaXMucHJvcHMudmFsdWUwfVxuICAgICAgICAgICAgICB2YWx1ZTE9e3RoaXMucHJvcHMudmFsdWUxfVxuICAgICAgICAgICAgICBzdGVwPXtzdGVwfVxuICAgICAgICAgICAgICBoYW5kbGVXaWR0aD17c2xpZGVySGFuZGxlV2lkdGh9XG4gICAgICAgICAgICAgIG9uU2xpZGVyMENoYW5nZT17dGhpcy5fc2V0UmFuZ2VWYWwwfVxuICAgICAgICAgICAgICBvblNsaWRlcjFDaGFuZ2U9e3RoaXMuX3NldFJhbmdlVmFsMX1cbiAgICAgICAgICAgICAgb25TbGlkZXJCYXJDaGFuZ2U9eyh2YWwwLCB2YWwxKSA9PiB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoW3ZhbDAsIHZhbDFdKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgZW5hYmxlQmFyRHJhZ1xuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgeyFpc1JhbmdlZCAmJiBzaG93SW5wdXQgPyB0aGlzLl9yZW5kZXJJbnB1dCgndmFsdWUxJykgOiBudWxsfVxuICAgICAgICAgIDwvU2xpZGVyV3JhcHBlcj5cbiAgICAgICAgICB7aXNSYW5nZWQgJiYgc2hvd0lucHV0ID8gKFxuICAgICAgICAgICAgPFJhbmdlSW5wdXRXcmFwcGVyIGNsYXNzTmFtZT1cInJhbmdlLXNsaWRlcl9faW5wdXQtZ3JvdXBcIj5cbiAgICAgICAgICAgICAge3RoaXMuX3JlbmRlcklucHV0KCd2YWx1ZTAnKX1cbiAgICAgICAgICAgICAge3RoaXMuX3JlbmRlcklucHV0KCd2YWx1ZTEnKX1cbiAgICAgICAgICAgIDwvUmFuZ2VJbnB1dFdyYXBwZXI+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwb2x5ZmlsbChSYW5nZVNsaWRlcik7XG5cbiAgcmV0dXJuIFJhbmdlU2xpZGVyO1xufVxuIl19