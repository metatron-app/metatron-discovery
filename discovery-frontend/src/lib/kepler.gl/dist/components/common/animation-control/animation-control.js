"use strict";

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

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _moment = _interopRequireDefault(require("moment"));

var _slider = _interopRequireDefault(require("../slider/slider"));

var _styledComponents2 = require("../styled-components");

var _speedControl = _interopRequireDefault(require("./speed-control"));

var _playbackControls = _interopRequireDefault(require("./playback-controls"));

var _floatingTimeDisplay = _interopRequireDefault(require("./floating-time-display"));

var _animationController = _interopRequireDefault(require("./animation-controller"));

var _dataUtils = require("../../../utils/data-utils");

var _constants = require("../../../constants");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-weight: 400;\n  font-size: 10px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: relative;\n  display: flex;\n  align-items: center;\n  height: 32px;\n\n  .animation-control__speed-control {\n    margin-right: -10px;\n\n    .animation-control__speed-slider {\n      right: calc(0% - 10px);\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  position: relative;\n  flex-grow: 1;\n  margin-right: 24px;\n  margin-left: 24px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var SliderWrapper = _styledComponents["default"].div(_templateObject());

var AnimationWidgetInner = _styledComponents["default"].div(_templateObject2());

var StyledDomain = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.titleTextColor;
});

var BUTTON_HEIGHT = '18px';
AnimationControlFactory.deps = [_speedControl["default"], _playbackControls["default"], _floatingTimeDisplay["default"], _animationController["default"]];

function AnimationControlFactory(SpeedControl, AnimationPlaybacks, FloatingTimeDisplay, AnimationController) {
  var AnimationControl = /*#__PURE__*/function (_React$PureComponent) {
    (0, _inherits2["default"])(AnimationControl, _React$PureComponent);

    var _super = _createSuper(AnimationControl);

    function AnimationControl() {
      var _this;

      (0, _classCallCheck2["default"])(this, AnimationControl);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        showSpeedControl: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onSlider1Change", function (val) {
        var domain = _this.props.animationConfig.domain;

        if (Array.isArray(_this.props.timeSteps)) {
          _this.props.updateAnimationTime((0, _dataUtils.snapToMarks)(val, _this.props.timeSteps)); // TODO: merge slider in to avoid this step

        } else if (val >= domain[0] && val <= domain[1]) {
          _this.props.updateAnimationTime(val);
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "toggleSpeedControl", function () {
        _this.setState({
          showSpeedControl: !_this.state.showSpeedControl
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onChange", function () {
        _this.toggleSpeedControl();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateAnimation", function (value) {
        _this.props.updateAnimationTime(Array.isArray(value) ? value[0] : value);
      });
      return _this;
    }

    (0, _createClass2["default"])(AnimationControl, [{
      key: "render",
      value: function render() {
        var _this$props$animation = this.props.animationConfig,
            currentTime = _this$props$animation.currentTime,
            domain = _this$props$animation.domain,
            speed = _this$props$animation.speed,
            step = _this$props$animation.step,
            timeSteps = _this$props$animation.timeSteps;
        var showSpeedControl = this.state.showSpeedControl;
        var animationType = Array.isArray(timeSteps) ? _constants.ANIMATION_TYPE.interval : _constants.ANIMATION_TYPE.continuous;
        return /*#__PURE__*/_react["default"].createElement(_styledComponents2.BottomWidgetInner, {
          className: "bottom-widget--inner"
        }, /*#__PURE__*/_react["default"].createElement(AnimationWidgetInner, {
          className: "animation-widget--inner"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          style: {
            marginLeft: '-10px'
          }
        }, /*#__PURE__*/_react["default"].createElement(AnimationController, {
          value: currentTime,
          domain: domain,
          speed: speed,
          updateAnimation: this._updateAnimation,
          steps: timeSteps,
          animationType: animationType
        }, function (isAnimating, start, pause, reset) {
          return /*#__PURE__*/_react["default"].createElement(AnimationPlaybacks, {
            className: "animation-control-playpause",
            startAnimation: start,
            isAnimating: isAnimating,
            pauseAnimation: pause,
            resetAnimation: reset,
            buttonHeight: BUTTON_HEIGHT,
            buttonStyle: "link"
          });
        })), /*#__PURE__*/_react["default"].createElement(StyledDomain, {
          className: "animation-control__time-domain"
        }, /*#__PURE__*/_react["default"].createElement("span", null, _moment["default"].utc(domain[0]).format(_constants.DEFAULT_TIME_FORMAT))), /*#__PURE__*/_react["default"].createElement(SliderWrapper, {
          className: "animation-control__slider"
        }, /*#__PURE__*/_react["default"].createElement(_slider["default"], {
          showValues: false,
          isRanged: false,
          step: step,
          minValue: domain ? domain[0] : 0,
          maxValue: domain ? domain[1] : 1,
          value1: currentTime,
          onSlider1Change: this.onSlider1Change,
          enableBarDrag: true
        })), /*#__PURE__*/_react["default"].createElement(StyledDomain, {
          className: "animation-control__time-domain"
        }, /*#__PURE__*/_react["default"].createElement("span", null, _moment["default"].utc(domain[1]).format(_constants.DEFAULT_TIME_FORMAT))), /*#__PURE__*/_react["default"].createElement("div", {
          className: "animation-control__speed-control"
        }, /*#__PURE__*/_react["default"].createElement(SpeedControl, {
          onClick: this.toggleSpeedControl,
          showSpeedControl: showSpeedControl,
          updateAnimationSpeed: this.props.updateAnimationSpeed,
          speed: speed,
          buttonHeight: BUTTON_HEIGHT
        }))), /*#__PURE__*/_react["default"].createElement(FloatingTimeDisplay, {
          currentTime: currentTime
        }));
      }
    }]);
    return AnimationControl;
  }(_react["default"].PureComponent);

  AnimationControl.defaultProps = {
    sliderHandleWidth: 12,
    onChange: function onChange() {}
  };
  return AnimationControl;
}

var _default = AnimationControlFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9hbmltYXRpb24tY29udHJvbC9hbmltYXRpb24tY29udHJvbC5qcyJdLCJuYW1lcyI6WyJTbGlkZXJXcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwiQW5pbWF0aW9uV2lkZ2V0SW5uZXIiLCJTdHlsZWREb21haW4iLCJwcm9wcyIsInRoZW1lIiwidGl0bGVUZXh0Q29sb3IiLCJCVVRUT05fSEVJR0hUIiwiQW5pbWF0aW9uQ29udHJvbEZhY3RvcnkiLCJkZXBzIiwiU3BlZWRDb250cm9sRmFjdG9yeSIsIkFuaW1hdGlvblBsYXliYWNrc0ZhY3RvcnkiLCJGbG9hdGluZ1RpbWVEaXNwbGF5RmFjdG9yeSIsIkFuaW1hdGlvbkNvbnRyb2xsZXJGYWN0b3J5IiwiU3BlZWRDb250cm9sIiwiQW5pbWF0aW9uUGxheWJhY2tzIiwiRmxvYXRpbmdUaW1lRGlzcGxheSIsIkFuaW1hdGlvbkNvbnRyb2xsZXIiLCJBbmltYXRpb25Db250cm9sIiwic2hvd1NwZWVkQ29udHJvbCIsInZhbCIsImRvbWFpbiIsImFuaW1hdGlvbkNvbmZpZyIsIkFycmF5IiwiaXNBcnJheSIsInRpbWVTdGVwcyIsInVwZGF0ZUFuaW1hdGlvblRpbWUiLCJzZXRTdGF0ZSIsInN0YXRlIiwidG9nZ2xlU3BlZWRDb250cm9sIiwidmFsdWUiLCJjdXJyZW50VGltZSIsInNwZWVkIiwic3RlcCIsImFuaW1hdGlvblR5cGUiLCJBTklNQVRJT05fVFlQRSIsImludGVydmFsIiwiY29udGludW91cyIsIm1hcmdpbkxlZnQiLCJfdXBkYXRlQW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJzdGFydCIsInBhdXNlIiwicmVzZXQiLCJtb21lbnQiLCJ1dGMiLCJmb3JtYXQiLCJERUZBVUxUX1RJTUVfRk9STUFUIiwib25TbGlkZXIxQ2hhbmdlIiwidXBkYXRlQW5pbWF0aW9uU3BlZWQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJkZWZhdWx0UHJvcHMi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QUtFLFVBQUEsUUFBUSxFQUFFQSxNQUFNLEdBQUdBLE1BQU0sQ0FBQyxDQUFELENBQVQsR0FBZSxDQUxqQztBQU1FLFVBQUEsTUFBTSxFQUFFVSxXQU5WO0FBT0UsVUFBQSxlQUFlLEVBQUUsS0FBS2lCLGVBUHhCO0FBUUUsVUFBQSxhQUFhLEVBQUU7QUFSakIsVUFERixDQTFCRixlQXNDRSxnQ0FBQyxZQUFEO0FBQWMsVUFBQSxTQUFTLEVBQUM7QUFBeEIsd0JBQ0UsOENBQU9KLG1CQUFPQyxHQUFQLENBQVd4QixNQUFNLENBQUMsQ0FBRCxDQUFqQixFQUFzQnlCLE1BQXRCLENBQTZCQyw4QkFBN0IsQ0FBUCxDQURGLENBdENGLGVBeUNFO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZix3QkFDRSxnQ0FBQyxZQUFEO0FBQ0UsVUFBQSxPQUFPLEVBQUUsS0FBS2xCLGtCQURoQjtBQUVFLFVBQUEsZ0JBQWdCLEVBQUVWLGdCQUZwQjtBQUdFLFVBQUEsb0JBQW9CLEVBQUUsS0FBS2YsS0FBTCxDQUFXNkMsb0JBSG5DO0FBSUUsVUFBQSxLQUFLLEVBQUVqQixLQUpUO0FBS0UsVUFBQSxZQUFZLEVBQUV6QjtBQUxoQixVQURGLENBekNGLENBREYsZUFvREUsZ0NBQUMsbUJBQUQ7QUFBcUIsVUFBQSxXQUFXLEVBQUV3QjtBQUFsQyxVQXBERixDQURGO0FBd0REO0FBMUZIO0FBQUE7QUFBQSxJQUMrQm1CLGtCQUFNQyxhQURyQzs7QUE2RkFqQyxFQUFBQSxnQkFBZ0IsQ0FBQ2tDLFlBQWpCLEdBQWdDO0FBQzlCQyxJQUFBQSxpQkFBaUIsRUFBRSxFQURXO0FBRTlCQyxJQUFBQSxRQUFRLEVBQUUsb0JBQU0sQ0FBRTtBQUZZLEdBQWhDO0FBS0EsU0FBT3BDLGdCQUFQO0FBQ0Q7O2VBRWNWLHVCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuXG5pbXBvcnQgU2xpZGVyIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3NsaWRlci9zbGlkZXInO1xuaW1wb3J0IHtCb3R0b21XaWRnZXRJbm5lcn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IFNwZWVkQ29udHJvbEZhY3RvcnkgZnJvbSAnLi9zcGVlZC1jb250cm9sJztcbmltcG9ydCBBbmltYXRpb25QbGF5YmFja3NGYWN0b3J5IGZyb20gJy4vcGxheWJhY2stY29udHJvbHMnO1xuaW1wb3J0IEZsb2F0aW5nVGltZURpc3BsYXlGYWN0b3J5IGZyb20gJy4vZmxvYXRpbmctdGltZS1kaXNwbGF5JztcbmltcG9ydCBBbmltYXRpb25Db250cm9sbGVyRmFjdG9yeSBmcm9tICcuL2FuaW1hdGlvbi1jb250cm9sbGVyJztcbmltcG9ydCB7c25hcFRvTWFya3N9IGZyb20gJ3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHtERUZBVUxUX1RJTUVfRk9STUFULCBBTklNQVRJT05fVFlQRX0gZnJvbSAnY29uc3RhbnRzJztcblxuY29uc3QgU2xpZGVyV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZmxleC1ncm93OiAxO1xuICBtYXJnaW4tcmlnaHQ6IDI0cHg7XG4gIG1hcmdpbi1sZWZ0OiAyNHB4O1xuYDtcblxuY29uc3QgQW5pbWF0aW9uV2lkZ2V0SW5uZXIgPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGhlaWdodDogMzJweDtcblxuICAuYW5pbWF0aW9uLWNvbnRyb2xfX3NwZWVkLWNvbnRyb2wge1xuICAgIG1hcmdpbi1yaWdodDogLTEwcHg7XG5cbiAgICAuYW5pbWF0aW9uLWNvbnRyb2xfX3NwZWVkLXNsaWRlciB7XG4gICAgICByaWdodDogY2FsYygwJSAtIDEwcHgpO1xuICAgIH1cbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkRG9tYWluID0gc3R5bGVkLmRpdmBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGl0bGVUZXh0Q29sb3J9O1xuICBmb250LXdlaWdodDogNDAwO1xuICBmb250LXNpemU6IDEwcHg7XG5gO1xuXG5jb25zdCBCVVRUT05fSEVJR0hUID0gJzE4cHgnO1xuXG5BbmltYXRpb25Db250cm9sRmFjdG9yeS5kZXBzID0gW1xuICBTcGVlZENvbnRyb2xGYWN0b3J5LFxuICBBbmltYXRpb25QbGF5YmFja3NGYWN0b3J5LFxuICBGbG9hdGluZ1RpbWVEaXNwbGF5RmFjdG9yeSxcbiAgQW5pbWF0aW9uQ29udHJvbGxlckZhY3Rvcnlcbl07XG5cbmZ1bmN0aW9uIEFuaW1hdGlvbkNvbnRyb2xGYWN0b3J5KFxuICBTcGVlZENvbnRyb2wsXG4gIEFuaW1hdGlvblBsYXliYWNrcyxcbiAgRmxvYXRpbmdUaW1lRGlzcGxheSxcbiAgQW5pbWF0aW9uQ29udHJvbGxlclxuKSB7XG4gIGNsYXNzIEFuaW1hdGlvbkNvbnRyb2wgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0ZSA9IHtcbiAgICAgIHNob3dTcGVlZENvbnRyb2w6IGZhbHNlXG4gICAgfTtcbiAgICBvblNsaWRlcjFDaGFuZ2UgPSB2YWwgPT4ge1xuICAgICAgY29uc3Qge2RvbWFpbn0gPSB0aGlzLnByb3BzLmFuaW1hdGlvbkNvbmZpZztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucHJvcHMudGltZVN0ZXBzKSkge1xuICAgICAgICB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvblRpbWUoc25hcFRvTWFya3ModmFsLCB0aGlzLnByb3BzLnRpbWVTdGVwcykpO1xuICAgICAgICAvLyBUT0RPOiBtZXJnZSBzbGlkZXIgaW4gdG8gYXZvaWQgdGhpcyBzdGVwXG4gICAgICB9IGVsc2UgaWYgKHZhbCA+PSBkb21haW5bMF0gJiYgdmFsIDw9IGRvbWFpblsxXSkge1xuICAgICAgICB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvblRpbWUodmFsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdG9nZ2xlU3BlZWRDb250cm9sID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1NwZWVkQ29udHJvbDogIXRoaXMuc3RhdGUuc2hvd1NwZWVkQ29udHJvbH0pO1xuICAgIH07XG5cbiAgICBvbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgIHRoaXMudG9nZ2xlU3BlZWRDb250cm9sKCk7XG4gICAgfTtcblxuICAgIF91cGRhdGVBbmltYXRpb24gPSB2YWx1ZSA9PiB7XG4gICAgICB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvblRpbWUoQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVswXSA6IHZhbHVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2N1cnJlbnRUaW1lLCBkb21haW4sIHNwZWVkLCBzdGVwLCB0aW1lU3RlcHN9ID0gdGhpcy5wcm9wcy5hbmltYXRpb25Db25maWc7XG4gICAgICBjb25zdCB7c2hvd1NwZWVkQ29udHJvbH0gPSB0aGlzLnN0YXRlO1xuICAgICAgY29uc3QgYW5pbWF0aW9uVHlwZSA9IEFycmF5LmlzQXJyYXkodGltZVN0ZXBzKVxuICAgICAgICA/IEFOSU1BVElPTl9UWVBFLmludGVydmFsXG4gICAgICAgIDogQU5JTUFUSU9OX1RZUEUuY29udGludW91cztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEJvdHRvbVdpZGdldElubmVyIGNsYXNzTmFtZT1cImJvdHRvbS13aWRnZXQtLWlubmVyXCI+XG4gICAgICAgICAgPEFuaW1hdGlvbldpZGdldElubmVyIGNsYXNzTmFtZT1cImFuaW1hdGlvbi13aWRnZXQtLWlubmVyXCI+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7bWFyZ2luTGVmdDogJy0xMHB4J319PlxuICAgICAgICAgICAgICA8QW5pbWF0aW9uQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIHZhbHVlPXtjdXJyZW50VGltZX1cbiAgICAgICAgICAgICAgICBkb21haW49e2RvbWFpbn1cbiAgICAgICAgICAgICAgICBzcGVlZD17c3BlZWR9XG4gICAgICAgICAgICAgICAgdXBkYXRlQW5pbWF0aW9uPXt0aGlzLl91cGRhdGVBbmltYXRpb259XG4gICAgICAgICAgICAgICAgc3RlcHM9e3RpbWVTdGVwc31cbiAgICAgICAgICAgICAgICBhbmltYXRpb25UeXBlPXthbmltYXRpb25UeXBlfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyhpc0FuaW1hdGluZywgc3RhcnQsIHBhdXNlLCByZXNldCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPEFuaW1hdGlvblBsYXliYWNrc1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhbmltYXRpb24tY29udHJvbC1wbGF5cGF1c2VcIlxuICAgICAgICAgICAgICAgICAgICBzdGFydEFuaW1hdGlvbj17c3RhcnR9XG4gICAgICAgICAgICAgICAgICAgIGlzQW5pbWF0aW5nPXtpc0FuaW1hdGluZ31cbiAgICAgICAgICAgICAgICAgICAgcGF1c2VBbmltYXRpb249e3BhdXNlfVxuICAgICAgICAgICAgICAgICAgICByZXNldEFuaW1hdGlvbj17cmVzZXR9XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkhlaWdodD17QlVUVE9OX0hFSUdIVH1cbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uU3R5bGU9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9BbmltYXRpb25Db250cm9sbGVyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8U3R5bGVkRG9tYWluIGNsYXNzTmFtZT1cImFuaW1hdGlvbi1jb250cm9sX190aW1lLWRvbWFpblwiPlxuICAgICAgICAgICAgICA8c3Bhbj57bW9tZW50LnV0Yyhkb21haW5bMF0pLmZvcm1hdChERUZBVUxUX1RJTUVfRk9STUFUKX08L3NwYW4+XG4gICAgICAgICAgICA8L1N0eWxlZERvbWFpbj5cbiAgICAgICAgICAgIDxTbGlkZXJXcmFwcGVyIGNsYXNzTmFtZT1cImFuaW1hdGlvbi1jb250cm9sX19zbGlkZXJcIj5cbiAgICAgICAgICAgICAgPFNsaWRlclxuICAgICAgICAgICAgICAgIHNob3dWYWx1ZXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGlzUmFuZ2VkPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBzdGVwPXtzdGVwfVxuICAgICAgICAgICAgICAgIG1pblZhbHVlPXtkb21haW4gPyBkb21haW5bMF0gOiAwfVxuICAgICAgICAgICAgICAgIG1heFZhbHVlPXtkb21haW4gPyBkb21haW5bMV0gOiAxfVxuICAgICAgICAgICAgICAgIHZhbHVlMT17Y3VycmVudFRpbWV9XG4gICAgICAgICAgICAgICAgb25TbGlkZXIxQ2hhbmdlPXt0aGlzLm9uU2xpZGVyMUNoYW5nZX1cbiAgICAgICAgICAgICAgICBlbmFibGVCYXJEcmFnPXt0cnVlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9TbGlkZXJXcmFwcGVyPlxuICAgICAgICAgICAgPFN0eWxlZERvbWFpbiBjbGFzc05hbWU9XCJhbmltYXRpb24tY29udHJvbF9fdGltZS1kb21haW5cIj5cbiAgICAgICAgICAgICAgPHNwYW4+e21vbWVudC51dGMoZG9tYWluWzFdKS5mb3JtYXQoREVGQVVMVF9USU1FX0ZPUk1BVCl9PC9zcGFuPlxuICAgICAgICAgICAgPC9TdHlsZWREb21haW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFuaW1hdGlvbi1jb250cm9sX19zcGVlZC1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxTcGVlZENvbnRyb2xcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnRvZ2dsZVNwZWVkQ29udHJvbH1cbiAgICAgICAgICAgICAgICBzaG93U3BlZWRDb250cm9sPXtzaG93U3BlZWRDb250cm9sfVxuICAgICAgICAgICAgICAgIHVwZGF0ZUFuaW1hdGlvblNwZWVkPXt0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvblNwZWVkfVxuICAgICAgICAgICAgICAgIHNwZWVkPXtzcGVlZH1cbiAgICAgICAgICAgICAgICBidXR0b25IZWlnaHQ9e0JVVFRPTl9IRUlHSFR9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L0FuaW1hdGlvbldpZGdldElubmVyPlxuICAgICAgICAgIDxGbG9hdGluZ1RpbWVEaXNwbGF5IGN1cnJlbnRUaW1lPXtjdXJyZW50VGltZX0gLz5cbiAgICAgICAgPC9Cb3R0b21XaWRnZXRJbm5lcj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgQW5pbWF0aW9uQ29udHJvbC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgc2xpZGVySGFuZGxlV2lkdGg6IDEyLFxuICAgIG9uQ2hhbmdlOiAoKSA9PiB7fVxuICB9O1xuXG4gIHJldHVybiBBbmltYXRpb25Db250cm9sO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBbmltYXRpb25Db250cm9sRmFjdG9yeTtcbiJdfQ==