"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = TimeRangeSliderFactory;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

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

var _moment = _interopRequireDefault(require("moment"));

var _lodash = _interopRequireDefault(require("lodash.throttle"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reselect = require("reselect");

var _icons = require("./icons");

var _styledComponents2 = require("./styled-components");

var _rangeSlider = _interopRequireDefault(require("./range-slider"));

var _timeSliderMarker = _interopRequireDefault(require("./time-slider-marker"));

var _playbackControls = _interopRequireDefault(require("./animation-control/playback-controls"));

var _animationController = _interopRequireDefault(require("./animation-control/animation-controller"));

var _defaultSettings = require("../../constants/default-settings");

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  font-size: 11px;\n  justify-content: ", ";\n\n  .horizontal-bar {\n    padding: 0 12px;\n    color: ", ";\n  }\n\n  .time-value {\n    display: flex;\n    flex-direction: ", ";\n    align-items: flex-start;\n\n    span {\n      color: ", ";\n    }\n  }\n\n  .time-value:last-child {\n    align-items: flex-end;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: flex-end;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n\n  .time-range-slider__control {\n    margin-bottom: 12px;\n    margin-right: 30px;\n  }\n\n  .playback-control-button {\n    padding: 9px 12px;\n  }\n\n  .kg-range-slider__slider .kg-slider {\n    margin-top: ", "px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var animationControlWidth = 140;

var StyledSliderContainer = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.sliderMarginTopIsTime;
});

TimeRangeSliderFactory.deps = [_playbackControls["default"], _rangeSlider["default"], _timeSliderMarker["default"], _animationController["default"]];

function TimeRangeSliderFactory(PlaybackControls, RangeSlider, TimeSliderMarker, AnimationController) {
  var TimeRangeSlider = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TimeRangeSlider, _Component);

    var _super = _createSuper(TimeRangeSlider);

    function TimeRangeSlider(_props) {
      var _this;

      (0, _classCallCheck2["default"])(this, TimeRangeSlider);
      _this = _super.call(this, _props);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "timeSelector", function (props) {
        return props.currentTime;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "formatSelector", function (props) {
        return props.format;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "displayTimeSelector", (0, _reselect.createSelector)(_this.timeSelector, _this.formatSelector, function (currentTime, format) {
        var groupTime = Array.isArray(currentTime) ? currentTime : [currentTime];
        return groupTime.reduce(function (accu, curr) {
          var displayDateTime = _moment["default"].utc(curr).format(format);

          var _displayDateTime$spli = displayDateTime.split(' '),
              _displayDateTime$spli2 = (0, _slicedToArray2["default"])(_displayDateTime$spli, 2),
              displayDate = _displayDateTime$spli2[0],
              displayTime = _displayDateTime$spli2[1];

          if (!accu.displayDate.includes(displayDate)) {
            accu.displayDate.push(displayDate);
          }

          accu.displayTime.push(displayTime);
          return accu;
        }, {
          displayDate: [],
          displayTime: []
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_sliderUpdate", function (args) {
        _this._sliderThrottle.cancel();

        _this._sliderThrottle(args);
      });
      _this._sliderThrottle = (0, _lodash["default"])(function () {
        var _this$props;

        return (_this$props = _this.props).onChange.apply(_this$props, arguments);
      }, 20);
      return _this;
    }

    (0, _createClass2["default"])(TimeRangeSlider, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props2 = this.props,
            domain = _this$props2.domain,
            value = _this$props2.value,
            isEnlarged = _this$props2.isEnlarged,
            hideTimeTitle = _this$props2.hideTimeTitle;
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "time-range-slider"
        }, !hideTimeTitle ? /*#__PURE__*/_react["default"].createElement(TimeTitle, {
          timeFormat: this.props.timeFormat,
          value: value,
          isEnlarged: isEnlarged
        }) : null, /*#__PURE__*/_react["default"].createElement(StyledSliderContainer, {
          className: "time-range-slider__container",
          isEnlarged: isEnlarged
        }, isEnlarged ? /*#__PURE__*/_react["default"].createElement(AnimationController, {
          value: this.props.value,
          domain: this.props.domain,
          speed: this.props.speed,
          startAnimation: this.props.toggleAnimation,
          pauseAnimation: this.props.toggleAnimation,
          updateAnimation: this.props.onChange
        }, function (isAnimating, start, pause, reset) {
          return /*#__PURE__*/_react["default"].createElement(PlaybackControls, {
            isAnimatable: _this2.props.isAnimatable,
            isAnimating: isAnimating,
            width: animationControlWidth,
            pauseAnimation: pause,
            resetAnimation: reset,
            startAnimation: start,
            buttonHeight: "12px",
            buttonStyle: "secondary"
          });
        }) : null, /*#__PURE__*/_react["default"].createElement("div", {
          style: {
            width: isEnlarged ? "calc(100% - ".concat(animationControlWidth, "px)") : '100%'
          }
        }, /*#__PURE__*/_react["default"].createElement(RangeSlider, {
          range: domain,
          value0: value[0],
          value1: value[1],
          histogram: this.props.histogram,
          lineChart: this.props.lineChart,
          plotType: this.props.plotType,
          isEnlarged: isEnlarged,
          showInput: false,
          step: this.props.step,
          onChange: this._sliderUpdate,
          xAxis: TimeSliderMarker
        }))));
      }
    }]);
    return TimeRangeSlider;
  }(_react.Component);

  (0, _defineProperty2["default"])(TimeRangeSlider, "propTypes", {
    onChange: _propTypes["default"].func.isRequired,
    domain: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    value: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    step: _propTypes["default"].number.isRequired,
    plotType: _propTypes["default"].string,
    histogram: _propTypes["default"].arrayOf(_propTypes["default"].any),
    lineChart: _propTypes["default"].object,
    toggleAnimation: _propTypes["default"].func.isRequired,
    isAnimatable: _propTypes["default"].bool,
    isEnlarged: _propTypes["default"].bool,
    speed: _propTypes["default"].number,
    timeFormat: _propTypes["default"].string,
    hideTimeTitle: _propTypes["default"].bool
  });
  TimeRangeSlider.defaultProps = {
    timeFormat: _defaultSettings.DEFAULT_TIME_FORMAT
  };
  return TimeRangeSlider;
}

var TimeValueWrapper = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.isEnlarged ? 'center' : 'space-between';
}, function (props) {
  return props.theme.titleTextColor;
}, function (props) {
  return props.isEnlarged ? 'row' : 'column';
}, function (props) {
  return props.theme.titleTextColor;
});

var TimeTitle = function TimeTitle(_ref) {
  var value = _ref.value,
      isEnlarged = _ref.isEnlarged,
      _ref$timeFormat = _ref.timeFormat,
      timeFormat = _ref$timeFormat === void 0 ? _defaultSettings.DEFAULT_TIME_FORMAT : _ref$timeFormat;
  return /*#__PURE__*/_react["default"].createElement(TimeValueWrapper, {
    isEnlarged: isEnlarged,
    className: "time-range-slider__time-title"
  }, /*#__PURE__*/_react["default"].createElement(TimeValue, {
    key: 0,
    value: _moment["default"].utc(value[0]).format(timeFormat),
    split: !isEnlarged
  }), isEnlarged ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "horizontal-bar"
  }, /*#__PURE__*/_react["default"].createElement(_icons.Minus, {
    height: "12px"
  })) : null, /*#__PURE__*/_react["default"].createElement(TimeValue, {
    key: 1,
    value: _moment["default"].utc(value[1]).format(timeFormat),
    split: !isEnlarged
  }));
};

var TimeValue = function TimeValue(_ref2) {
  var value = _ref2.value,
      split = _ref2.split;
  return (
    /*#__PURE__*/
    // render two lines if not enlarged
    _react["default"].createElement("div", {
      className: "time-value"
    }, split ? value.split(' ').map(function (v, i) {
      return /*#__PURE__*/_react["default"].createElement("div", {
        key: i
      }, i === 0 ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectText, null, v) : /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectTextBold, null, v));
    }) : /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectTextBold, null, value))
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi90aW1lLXJhbmdlLXNsaWRlci5qcyJdLCJuYW1lcyI6WyJhbmltYXRpb25Db250cm9sV2lkdGgiLCJTdHlsZWRTbGlkZXJDb250YWluZXIiLCJzdHlsZWQiLCJkaXYiLCJwcm9wcyIsInRoZW1lIiwic2xpZGVyTWFyZ2luVG9wSXNUaW1lIiwiVGltZVJhbmdlU2xpZGVyRmFjdG9yeSIsImRlcHMiLCJQbGF5YmFja0NvbnRyb2xzRmFjdG9yeSIsIlJhbmdlU2xpZGVyRmFjdG9yeSIsIlRpbWVTbGlkZXJNYXJrZXJGYWN0b3J5IiwiQW5pbWF0aW9uQ29udHJvbGxlckZhY3RvcnkiLCJQbGF5YmFja0NvbnRyb2xzIiwiUmFuZ2VTbGlkZXIiLCJUaW1lU2xpZGVyTWFya2VyIiwiQW5pbWF0aW9uQ29udHJvbGxlciIsIlRpbWVSYW5nZVNsaWRlciIsImN1cnJlbnRUaW1lIiwiZm9ybWF0IiwidGltZVNlbGVjdG9yIiwiZm9ybWF0U2VsZWN0b3IiLCJncm91cFRpbWUiLCJBcnJheSIsImlzQXJyYXkiLCJyZWR1Y2UiLCJhY2N1IiwiY3VyciIsImRpc3BsYXlEYXRlVGltZSIsIm1vbWVudCIsInV0YyIsInNwbGl0IiwiZGlzcGxheURhdGUiLCJkaXNwbGF5VGltZSIsImluY2x1ZGVzIiwicHVzaCIsImFyZ3MiLCJfc2xpZGVyVGhyb3R0bGUiLCJjYW5jZWwiLCJvbkNoYW5nZSIsImRvbWFpbiIsInZhbHVlIiwiaXNFbmxhcmdlZCIsImhpZGVUaW1lVGl0bGUiLCJ0aW1lRm9ybWF0Iiwic3BlZWQiLCJ0b2dnbGVBbmltYXRpb24iLCJpc0FuaW1hdGluZyIsInN0YXJ0IiwicGF1c2UiLCJyZXNldCIsImlzQW5pbWF0YWJsZSIsIndpZHRoIiwiaGlzdG9ncmFtIiwibGluZUNoYXJ0IiwicGxvdFR5cGUiLCJzdGVwIiwiX3NsaWRlclVwZGF0ZSIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsIm51bWJlciIsInN0cmluZyIsImFueSIsIm9iamVjdCIsImJvb2wiLCJkZWZhdWx0UHJvcHMiLCJERUZBVUxUX1RJTUVfRk9STUFUIiwiVGltZVZhbHVlV3JhcHBlciIsInRpdGxlVGV4dENvbG9yIiwiVGltZVRpdGxlIiwiVGltZVZhbHVlIiwibWFwIiwidiIsImkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLHFCQUFxQixHQUFHLEdBQTlCOztBQUVBLElBQU1DLHFCQUFxQixHQUFHQyw2QkFBT0MsR0FBVixvQkFnQlQsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxxQkFBaEI7QUFBQSxDQWhCSSxDQUEzQjs7QUFvQkFDLHNCQUFzQixDQUFDQyxJQUF2QixHQUE4QixDQUM1QkMsNEJBRDRCLEVBRTVCQyx1QkFGNEIsRUFHNUJDLDRCQUg0QixFQUk1QkMsK0JBSjRCLENBQTlCOztBQU9lLFNBQVNMLHNCQUFULENBQ2JNLGdCQURhLEVBRWJDLFdBRmEsRUFHYkMsZ0JBSGEsRUFJYkMsbUJBSmEsRUFLYjtBQUFBLE1BQ01DLGVBRE47QUFBQTs7QUFBQTs7QUFrQkUsNkJBQVliLE1BQVosRUFBbUI7QUFBQTs7QUFBQTtBQUNqQixnQ0FBTUEsTUFBTjtBQURpQix1R0FLSixVQUFBQSxLQUFLO0FBQUEsZUFBSUEsS0FBSyxDQUFDYyxXQUFWO0FBQUEsT0FMRDtBQUFBLHlHQU1GLFVBQUFkLEtBQUs7QUFBQSxlQUFJQSxLQUFLLENBQUNlLE1BQVY7QUFBQSxPQU5IO0FBQUEsOEdBT0csOEJBQ3BCLE1BQUtDLFlBRGUsRUFFcEIsTUFBS0MsY0FGZSxFQUdwQixVQUFDSCxXQUFELEVBQWNDLE1BQWQsRUFBeUI7QUFD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QkFBVSxnQ0FBQyw2QkFBRCxRQUFhRCxDQUFiLENBQVYsZ0JBQXlDLGdDQUFDLGlDQUFELFFBQWlCQSxDQUFqQixDQUQ1QyxDQURHO0FBQUEsS0FGUCxDQURJLGdCQVNKLGdDQUFDLGlDQUFELFFBQWlCbEMsS0FBakIsQ0FWSjtBQUZnQjtBQUFBLENBQWxCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2xvZGFzaC50aHJvdHRsZSc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcblxuaW1wb3J0IHtNaW51c30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IHtTZWxlY3RUZXh0Qm9sZCwgU2VsZWN0VGV4dH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IFJhbmdlU2xpZGVyRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9yYW5nZS1zbGlkZXInO1xuaW1wb3J0IFRpbWVTbGlkZXJNYXJrZXJGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3RpbWUtc2xpZGVyLW1hcmtlcic7XG5pbXBvcnQgUGxheWJhY2tDb250cm9sc0ZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9jb21tb24vYW5pbWF0aW9uLWNvbnRyb2wvcGxheWJhY2stY29udHJvbHMnO1xuaW1wb3J0IEFuaW1hdGlvbkNvbnRyb2xsZXJGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2FuaW1hdGlvbi1jb250cm9sL2FuaW1hdGlvbi1jb250cm9sbGVyJztcblxuaW1wb3J0IHtERUZBVUxUX1RJTUVfRk9STUFUfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5cbmNvbnN0IGFuaW1hdGlvbkNvbnRyb2xXaWR0aCA9IDE0MDtcblxuY29uc3QgU3R5bGVkU2xpZGVyQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG5cbiAgLnRpbWUtcmFuZ2Utc2xpZGVyX19jb250cm9sIHtcbiAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgIG1hcmdpbi1yaWdodDogMzBweDtcbiAgfVxuXG4gIC5wbGF5YmFjay1jb250cm9sLWJ1dHRvbiB7XG4gICAgcGFkZGluZzogOXB4IDEycHg7XG4gIH1cblxuICAua2ctcmFuZ2Utc2xpZGVyX19zbGlkZXIgLmtnLXNsaWRlciB7XG4gICAgbWFyZ2luLXRvcDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJNYXJnaW5Ub3BJc1RpbWV9cHg7XG4gIH1cbmA7XG5cblRpbWVSYW5nZVNsaWRlckZhY3RvcnkuZGVwcyA9IFtcbiAgUGxheWJhY2tDb250cm9sc0ZhY3RvcnksXG4gIFJhbmdlU2xpZGVyRmFjdG9yeSxcbiAgVGltZVNsaWRlck1hcmtlckZhY3RvcnksXG4gIEFuaW1hdGlvbkNvbnRyb2xsZXJGYWN0b3J5XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUaW1lUmFuZ2VTbGlkZXJGYWN0b3J5KFxuICBQbGF5YmFja0NvbnRyb2xzLFxuICBSYW5nZVNsaWRlcixcbiAgVGltZVNsaWRlck1hcmtlcixcbiAgQW5pbWF0aW9uQ29udHJvbGxlclxuKSB7XG4gIGNsYXNzIFRpbWVSYW5nZVNsaWRlciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgZG9tYWluOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubnVtYmVyKS5pc1JlcXVpcmVkLFxuICAgICAgdmFsdWU6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5udW1iZXIpLmlzUmVxdWlyZWQsXG4gICAgICBzdGVwOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICBwbG90VHlwZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIGhpc3RvZ3JhbTogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSksXG4gICAgICBsaW5lQ2hhcnQ6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICB0b2dnbGVBbmltYXRpb246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBpc0FuaW1hdGFibGU6IFByb3BUeXBlcy5ib29sLFxuICAgICAgaXNFbmxhcmdlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBzcGVlZDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHRpbWVGb3JtYXQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBoaWRlVGltZVRpdGxlOiBQcm9wVHlwZXMuYm9vbFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5fc2xpZGVyVGhyb3R0bGUgPSB0aHJvdHRsZSgoLi4udmFsdWUpID0+IHRoaXMucHJvcHMub25DaGFuZ2UoLi4udmFsdWUpLCAyMCk7XG4gICAgfVxuXG4gICAgdGltZVNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMuY3VycmVudFRpbWU7XG4gICAgZm9ybWF0U2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5mb3JtYXQ7XG4gICAgZGlzcGxheVRpbWVTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy50aW1lU2VsZWN0b3IsXG4gICAgICB0aGlzLmZvcm1hdFNlbGVjdG9yLFxuICAgICAgKGN1cnJlbnRUaW1lLCBmb3JtYXQpID0+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBUaW1lID0gQXJyYXkuaXNBcnJheShjdXJyZW50VGltZSkgPyBjdXJyZW50VGltZSA6IFtjdXJyZW50VGltZV07XG4gICAgICAgIHJldHVybiBncm91cFRpbWUucmVkdWNlKFxuICAgICAgICAgIChhY2N1LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5RGF0ZVRpbWUgPSBtb21lbnQudXRjKGN1cnIpLmZvcm1hdChmb3JtYXQpO1xuICAgICAgICAgICAgY29uc3QgW2Rpc3BsYXlEYXRlLCBkaXNwbGF5VGltZV0gPSBkaXNwbGF5RGF0ZVRpbWUuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgaWYgKCFhY2N1LmRpc3BsYXlEYXRlLmluY2x1ZGVzKGRpc3BsYXlEYXRlKSkge1xuICAgICAgICAgICAgICBhY2N1LmRpc3BsYXlEYXRlLnB1c2goZGlzcGxheURhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWNjdS5kaXNwbGF5VGltZS5wdXNoKGRpc3BsYXlUaW1lKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFjY3U7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7ZGlzcGxheURhdGU6IFtdLCBkaXNwbGF5VGltZTogW119XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIF9zbGlkZXJVcGRhdGUgPSBhcmdzID0+IHtcbiAgICAgIHRoaXMuX3NsaWRlclRocm90dGxlLmNhbmNlbCgpO1xuICAgICAgdGhpcy5fc2xpZGVyVGhyb3R0bGUoYXJncyk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtkb21haW4sIHZhbHVlLCBpc0VubGFyZ2VkLCBoaWRlVGltZVRpdGxlfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGltZS1yYW5nZS1zbGlkZXJcIj5cbiAgICAgICAgICB7IWhpZGVUaW1lVGl0bGUgPyAoXG4gICAgICAgICAgICA8VGltZVRpdGxlIHRpbWVGb3JtYXQ9e3RoaXMucHJvcHMudGltZUZvcm1hdH0gdmFsdWU9e3ZhbHVlfSBpc0VubGFyZ2VkPXtpc0VubGFyZ2VkfSAvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxTdHlsZWRTbGlkZXJDb250YWluZXIgY2xhc3NOYW1lPVwidGltZS1yYW5nZS1zbGlkZXJfX2NvbnRhaW5lclwiIGlzRW5sYXJnZWQ9e2lzRW5sYXJnZWR9PlxuICAgICAgICAgICAge2lzRW5sYXJnZWQgPyAoXG4gICAgICAgICAgICAgIDxBbmltYXRpb25Db250cm9sbGVyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMudmFsdWV9XG4gICAgICAgICAgICAgICAgZG9tYWluPXt0aGlzLnByb3BzLmRvbWFpbn1cbiAgICAgICAgICAgICAgICBzcGVlZD17dGhpcy5wcm9wcy5zcGVlZH1cbiAgICAgICAgICAgICAgICBzdGFydEFuaW1hdGlvbj17dGhpcy5wcm9wcy50b2dnbGVBbmltYXRpb259XG4gICAgICAgICAgICAgICAgcGF1c2VBbmltYXRpb249e3RoaXMucHJvcHMudG9nZ2xlQW5pbWF0aW9ufVxuICAgICAgICAgICAgICAgIHVwZGF0ZUFuaW1hdGlvbj17dGhpcy5wcm9wcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsoaXNBbmltYXRpbmcsIHN0YXJ0LCBwYXVzZSwgcmVzZXQpID0+IChcbiAgICAgICAgICAgICAgICAgIDxQbGF5YmFja0NvbnRyb2xzXG4gICAgICAgICAgICAgICAgICAgIGlzQW5pbWF0YWJsZT17dGhpcy5wcm9wcy5pc0FuaW1hdGFibGV9XG4gICAgICAgICAgICAgICAgICAgIGlzQW5pbWF0aW5nPXtpc0FuaW1hdGluZ31cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9e2FuaW1hdGlvbkNvbnRyb2xXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgcGF1c2VBbmltYXRpb249e3BhdXNlfVxuICAgICAgICAgICAgICAgICAgICByZXNldEFuaW1hdGlvbj17cmVzZXR9XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uPXtzdGFydH1cbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uSGVpZ2h0PVwiMTJweFwiXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvblN0eWxlPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9BbmltYXRpb25Db250cm9sbGVyPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGlzRW5sYXJnZWQgPyBgY2FsYygxMDAlIC0gJHthbmltYXRpb25Db250cm9sV2lkdGh9cHgpYCA6ICcxMDAlJ1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8UmFuZ2VTbGlkZXJcbiAgICAgICAgICAgICAgICByYW5nZT17ZG9tYWlufVxuICAgICAgICAgICAgICAgIHZhbHVlMD17dmFsdWVbMF19XG4gICAgICAgICAgICAgICAgdmFsdWUxPXt2YWx1ZVsxXX1cbiAgICAgICAgICAgICAgICBoaXN0b2dyYW09e3RoaXMucHJvcHMuaGlzdG9ncmFtfVxuICAgICAgICAgICAgICAgIGxpbmVDaGFydD17dGhpcy5wcm9wcy5saW5lQ2hhcnR9XG4gICAgICAgICAgICAgICAgcGxvdFR5cGU9e3RoaXMucHJvcHMucGxvdFR5cGV9XG4gICAgICAgICAgICAgICAgaXNFbmxhcmdlZD17aXNFbmxhcmdlZH1cbiAgICAgICAgICAgICAgICBzaG93SW5wdXQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIHN0ZXA9e3RoaXMucHJvcHMuc3RlcH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fc2xpZGVyVXBkYXRlfVxuICAgICAgICAgICAgICAgIHhBeGlzPXtUaW1lU2xpZGVyTWFya2VyfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9TdHlsZWRTbGlkZXJDb250YWluZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBUaW1lUmFuZ2VTbGlkZXIuZGVmYXVsdFByb3BzID0ge1xuICAgIHRpbWVGb3JtYXQ6IERFRkFVTFRfVElNRV9GT1JNQVRcbiAgfTtcblxuICByZXR1cm4gVGltZVJhbmdlU2xpZGVyO1xufVxuXG5jb25zdCBUaW1lVmFsdWVXcmFwcGVyID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZm9udC1zaXplOiAxMXB4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6ICR7cHJvcHMgPT4gKHByb3BzLmlzRW5sYXJnZWQgPyAnY2VudGVyJyA6ICdzcGFjZS1iZXR3ZWVuJyl9O1xuXG4gIC5ob3Jpem9udGFsLWJhciB7XG4gICAgcGFkZGluZzogMCAxMnB4O1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpdGxlVGV4dENvbG9yfTtcbiAgfVxuXG4gIC50aW1lLXZhbHVlIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiAke3Byb3BzID0+IChwcm9wcy5pc0VubGFyZ2VkID8gJ3JvdycgOiAnY29sdW1uJyl9O1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuXG4gICAgc3BhbiB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aXRsZVRleHRDb2xvcn07XG4gICAgfVxuICB9XG5cbiAgLnRpbWUtdmFsdWU6bGFzdC1jaGlsZCB7XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICB9XG5gO1xuXG5jb25zdCBUaW1lVGl0bGUgPSAoe3ZhbHVlLCBpc0VubGFyZ2VkLCB0aW1lRm9ybWF0ID0gREVGQVVMVF9USU1FX0ZPUk1BVH0pID0+IChcbiAgPFRpbWVWYWx1ZVdyYXBwZXIgaXNFbmxhcmdlZD17aXNFbmxhcmdlZH0gY2xhc3NOYW1lPVwidGltZS1yYW5nZS1zbGlkZXJfX3RpbWUtdGl0bGVcIj5cbiAgICA8VGltZVZhbHVlIGtleT17MH0gdmFsdWU9e21vbWVudC51dGModmFsdWVbMF0pLmZvcm1hdCh0aW1lRm9ybWF0KX0gc3BsaXQ9eyFpc0VubGFyZ2VkfSAvPlxuICAgIHtpc0VubGFyZ2VkID8gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJob3Jpem9udGFsLWJhclwiPlxuICAgICAgICA8TWludXMgaGVpZ2h0PVwiMTJweFwiIC8+XG4gICAgICA8L2Rpdj5cbiAgICApIDogbnVsbH1cbiAgICA8VGltZVZhbHVlIGtleT17MX0gdmFsdWU9e21vbWVudC51dGModmFsdWVbMV0pLmZvcm1hdCh0aW1lRm9ybWF0KX0gc3BsaXQ9eyFpc0VubGFyZ2VkfSAvPlxuICA8L1RpbWVWYWx1ZVdyYXBwZXI+XG4pO1xuXG5jb25zdCBUaW1lVmFsdWUgPSAoe3ZhbHVlLCBzcGxpdH0pID0+IChcbiAgLy8gcmVuZGVyIHR3byBsaW5lcyBpZiBub3QgZW5sYXJnZWRcbiAgPGRpdiBjbGFzc05hbWU9XCJ0aW1lLXZhbHVlXCI+XG4gICAge3NwbGl0ID8gKFxuICAgICAgdmFsdWVcbiAgICAgICAgLnNwbGl0KCcgJylcbiAgICAgICAgLm1hcCgodiwgaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtpfT5cbiAgICAgICAgICAgIHtpID09PSAwID8gPFNlbGVjdFRleHQ+e3Z9PC9TZWxlY3RUZXh0PiA6IDxTZWxlY3RUZXh0Qm9sZD57dn08L1NlbGVjdFRleHRCb2xkPn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSlcbiAgICApIDogKFxuICAgICAgPFNlbGVjdFRleHRCb2xkPnt2YWx1ZX08L1NlbGVjdFRleHRCb2xkPlxuICAgICl9XG4gIDwvZGl2PlxuKTtcbiJdfQ==