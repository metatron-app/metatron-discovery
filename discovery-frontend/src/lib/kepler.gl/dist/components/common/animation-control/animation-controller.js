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

var _react = require("react");

var _d3Array = require("d3-array");

var _window = require("global/window");

var _constants = require("../../../constants");

var _console = _interopRequireDefault(require("global/console"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function AnimationControllerFactory() {
  var AnimationController = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(AnimationController, _Component);

    var _super = _createSuper(AnimationController);

    function AnimationController() {
      var _this;

      (0, _classCallCheck2["default"])(this, AnimationController);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        isAnimating: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_timer", null);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_animate", function (delay) {
        _this._startTime = new Date().getTime();

        var loop = function loop() {
          var current = new Date().getTime(); // @ts-ignore

          var delta = current - _this._startTime;

          if (delta >= delay) {
            _this._nextFrame();

            _this._startTime = new Date().getTime();
          } else {
            _this._timer = (0, _window.requestAnimationFrame)(loop);
          }
        };

        _this._timer = (0, _window.requestAnimationFrame)(loop);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_resetAnimationWindow", function () {
        var _this$props = _this.props,
            domain = _this$props.domain,
            value = _this$props.value;

        if (Array.isArray(value)) {
          var value0 = domain[0];
          var value1 = value0 + value[1] - value[0];

          _this.props.updateAnimation([value0, value1]);
        } else {
          _this.props.updateAnimation(domain[0]);
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_resetAnimtionStep", function () {
        // go to the first steps
        _this.props.updateAnimation([_this.props.steps[0], 0]);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_resetAnimation", function () {
        if (_this.props.animationType === _constants.ANIMATION_TYPE.continuous) {
          _this._resetAnimationWindow();
        } else {
          _this._resetAnimtionStep();
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_startAnimation", function () {
        _this._pauseAnimation();

        if (typeof _this.props.startAnimation === 'function') {
          _this.props.startAnimation();
        }

        _this.setState({
          isAnimating: true
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_pauseAnimation", function () {
        if (_this._timer) {
          (0, _window.cancelAnimationFrame)(_this._timer);

          if (typeof _this.props.pauseAnimation === 'function') {
            _this.props.pauseAnimation();
          }

          _this._timer = null;
        }

        _this.setState({
          isAnimating: false
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_nextFrame", function () {
        _this._timer = null;
        var nextValue = _this.props.animationType === _constants.ANIMATION_TYPE.continuous ? _this._nextFrameByWindow() : _this._nextFrameByStep();

        _this.props.updateAnimation(nextValue);
      });
      return _this;
    }

    (0, _createClass2["default"])(AnimationController, [{
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        if (!this._timer && this.state.isAnimating) {
          if (this.props.animationType === _constants.ANIMATION_TYPE.continuous) {
            this._timer = (0, _window.requestAnimationFrame)(this._nextFrame);
          } else {
            // animate by interval
            // 30*600
            var _this$props2 = this.props,
                steps = _this$props2.steps,
                speed = _this$props2.speed;

            if (!Array.isArray(steps) || !steps.length) {
              _console["default"].warn('animation steps should be an array');

              return;
            } // when speed = 1, animation should loop through 600 frames at 60 FPS
            // calculate delay based on # steps


            var delay = _constants.BASE_SPEED * (1000 / _constants.FPS) / steps.length / (speed || 1);

            this._animate(delay);
          }
        }
      }
    }, {
      key: "_nextFrameByWindow",
      value: function _nextFrameByWindow() {
        var _this$props3 = this.props,
            domain = _this$props3.domain,
            value = _this$props3.value,
            speed = _this$props3.speed,
            baseSpeed = _this$props3.baseSpeed;
        var delta = (domain[1] - domain[0]) / baseSpeed * speed; // loop when reaches the end

        if (Array.isArray(value)) {
          var value0 = value[1] + delta > domain[1] ? domain[0] : value[0] + delta;
          var value1 = value0 + value[1] - value[0];
          return [value0, value1];
        }

        return value + delta > domain[1] ? domain[0] : value + delta;
      }
    }, {
      key: "_nextFrameByStep",
      value: function _nextFrameByStep() {
        var _this$props4 = this.props,
            steps = _this$props4.steps,
            value = _this$props4.value;
        var val = Array.isArray(value) ? value[0] : value;
        var index = (0, _d3Array.bisectLeft)(steps, val);
        var nextIdx = index >= steps.length - 1 ? 0 : index + 1;
        return [steps[nextIdx], nextIdx];
      }
    }, {
      key: "render",
      value: function render() {
        var isAnimating = this.state.isAnimating;
        var children = this.props.children;
        return typeof children === 'function' ? children(isAnimating, this._startAnimation, this._pauseAnimation, this._resetAnimation) : null;
      }
    }]);
    return AnimationController;
  }(_react.Component);

  (0, _defineProperty2["default"])(AnimationController, "defaultProps", {
    baseSpeed: _constants.BASE_SPEED,
    speed: 1,
    animationType: _constants.ANIMATION_TYPE.continuous
  });
  return AnimationController;
}

var _default = AnimationControllerFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9hbmltYXRpb24tY29udHJvbC9hbmltYXRpb24tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJBbmltYXRpb25Db250cm9sbGVyRmFjdG9yeSIsIkFuaW1hdGlvbkNvbnRyb2xsZXIiLCJpc0FuaW1hdGluZyIsImRlbGF5IiwiX3N0YXJ0VGltZSIsIkRhdGUiLCJnZXRUaW1lIiwibG9vcCIsImN1cnJlbnQiLCJkZWx0YSIsIl9uZXh0RnJhbWUiLCJfdGltZXIiLCJwcm9wcyIsImRvbWFpbiIsInZhbHVlIiwiQXJyYXkiLCJpc0FycmF5IiwidmFsdWUwIiwidmFsdWUxIiwidXBkYXRlQW5pbWF0aW9uIiwic3RlcHMiLCJhbmltYXRpb25UeXBlIiwiQU5JTUFUSU9OX1RZUEUiLCJjb250aW51b3VzIiwiX3Jlc2V0QW5pbWF0aW9uV2luZG93IiwiX3Jlc2V0QW5pbXRpb25TdGVwIiwiX3BhdXNlQW5pbWF0aW9uIiwic3RhcnRBbmltYXRpb24iLCJzZXRTdGF0ZSIsInBhdXNlQW5pbWF0aW9uIiwibmV4dFZhbHVlIiwiX25leHRGcmFtZUJ5V2luZG93IiwiX25leHRGcmFtZUJ5U3RlcCIsInN0YXRlIiwic3BlZWQiLCJsZW5ndGgiLCJDb25zb2xlIiwid2FybiIsIkJBU0VfU1BFRUQiLCJGUFMiLCJfYW5pbWF0ZSIsImJhc2VTcGVlZCIsInZhbCIsImluZGV4IiwibmV4dElkeCIsImNoaWxkcmVuIiwiX3N0YXJ0QW5pbWF0aW9uIiwiX3Jlc2V0QW5pbWF0aW9uIiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBQ0EsU0FBU0EsMEJBQVQsR0FBc0M7QUFBQSxNQUM5QkMsbUJBRDhCO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxnR0FRMUI7QUFD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QTtBQUFBLCtCQWdJekI7QUFBQSxZQUNBMUMsV0FEQSxHQUNlLEtBQUsrQixLQURwQixDQUNBL0IsV0FEQTtBQUFBLFlBRUEyQyxRQUZBLEdBRVksS0FBS2pDLEtBRmpCLENBRUFpQyxRQUZBO0FBSVAsZUFBTyxPQUFPQSxRQUFQLEtBQW9CLFVBQXBCLEdBQ0hBLFFBQVEsQ0FBQzNDLFdBQUQsRUFBYyxLQUFLNEMsZUFBbkIsRUFBb0MsS0FBS3BCLGVBQXpDLEVBQTBELEtBQUtxQixlQUEvRCxDQURMLEdBRUgsSUFGSjtBQUdEO0FBdklpQztBQUFBO0FBQUEsSUFDRkMsZ0JBREU7O0FBQUEsbUNBQzlCL0MsbUJBRDhCLGtCQUVaO0FBQ3BCd0MsSUFBQUEsU0FBUyxFQUFFSCxxQkFEUztBQUVwQkosSUFBQUEsS0FBSyxFQUFFLENBRmE7QUFHcEJiLElBQUFBLGFBQWEsRUFBRUMsMEJBQWVDO0FBSFYsR0FGWTtBQTBJcEMsU0FBT3RCLG1CQUFQO0FBQ0Q7O2VBRWNELDBCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7YmlzZWN0TGVmdH0gZnJvbSAnZDMtYXJyYXknO1xuaW1wb3J0IHtyZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lfSBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCB7QkFTRV9TUEVFRCwgRlBTLCBBTklNQVRJT05fVFlQRX0gZnJvbSAnY29uc3RhbnRzJztcbmltcG9ydCBDb25zb2xlIGZyb20gJ2dsb2JhbC9jb25zb2xlJztcbmZ1bmN0aW9uIEFuaW1hdGlvbkNvbnRyb2xsZXJGYWN0b3J5KCkge1xuICBjbGFzcyBBbmltYXRpb25Db250cm9sbGVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgYmFzZVNwZWVkOiBCQVNFX1NQRUVELFxuICAgICAgc3BlZWQ6IDEsXG4gICAgICBhbmltYXRpb25UeXBlOiBBTklNQVRJT05fVFlQRS5jb250aW51b3VzXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgaXNBbmltYXRpbmc6IGZhbHNlXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgIGlmICghdGhpcy5fdGltZXIgJiYgdGhpcy5zdGF0ZS5pc0FuaW1hdGluZykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hbmltYXRpb25UeXBlID09PSBBTklNQVRJT05fVFlQRS5jb250aW51b3VzKSB7XG4gICAgICAgICAgdGhpcy5fdGltZXIgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fbmV4dEZyYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBhbmltYXRlIGJ5IGludGVydmFsXG4gICAgICAgICAgLy8gMzAqNjAwXG4gICAgICAgICAgY29uc3Qge3N0ZXBzLCBzcGVlZH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzdGVwcykgfHwgIXN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgQ29uc29sZS53YXJuKCdhbmltYXRpb24gc3RlcHMgc2hvdWxkIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdoZW4gc3BlZWQgPSAxLCBhbmltYXRpb24gc2hvdWxkIGxvb3AgdGhyb3VnaCA2MDAgZnJhbWVzIGF0IDYwIEZQU1xuICAgICAgICAgIC8vIGNhbGN1bGF0ZSBkZWxheSBiYXNlZCBvbiAjIHN0ZXBzXG4gICAgICAgICAgY29uc3QgZGVsYXkgPSAoQkFTRV9TUEVFRCAqICgxMDAwIC8gRlBTKSkgLyBzdGVwcy5sZW5ndGggLyAoc3BlZWQgfHwgMSk7XG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZShkZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBfdGltZXIgPSBudWxsO1xuXG4gICAgX2FuaW1hdGUgPSBkZWxheSA9PiB7XG4gICAgICB0aGlzLl9zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgY29uc3QgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IGRlbHRhID0gY3VycmVudCAtIHRoaXMuX3N0YXJ0VGltZTtcblxuICAgICAgICBpZiAoZGVsdGEgPj0gZGVsYXkpIHtcbiAgICAgICAgICB0aGlzLl9uZXh0RnJhbWUoKTtcbiAgICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl90aW1lciA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5fdGltZXIgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfTtcblxuICAgIF9yZXNldEFuaW1hdGlvbldpbmRvdyA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHtkb21haW4sIHZhbHVlfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUwID0gZG9tYWluWzBdO1xuICAgICAgICBjb25zdCB2YWx1ZTEgPSB2YWx1ZTAgKyB2YWx1ZVsxXSAtIHZhbHVlWzBdO1xuICAgICAgICB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvbihbdmFsdWUwLCB2YWx1ZTFdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvcHMudXBkYXRlQW5pbWF0aW9uKGRvbWFpblswXSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9yZXNldEFuaW10aW9uU3RlcCA9ICgpID0+IHtcbiAgICAgIC8vIGdvIHRvIHRoZSBmaXJzdCBzdGVwc1xuICAgICAgdGhpcy5wcm9wcy51cGRhdGVBbmltYXRpb24oW3RoaXMucHJvcHMuc3RlcHNbMF0sIDBdKTtcbiAgICB9O1xuXG4gICAgX3Jlc2V0QW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMucHJvcHMuYW5pbWF0aW9uVHlwZSA9PT0gQU5JTUFUSU9OX1RZUEUuY29udGludW91cykge1xuICAgICAgICB0aGlzLl9yZXNldEFuaW1hdGlvbldpbmRvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzZXRBbmltdGlvblN0ZXAoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3N0YXJ0QW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgdGhpcy5fcGF1c2VBbmltYXRpb24oKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5zdGFydEFuaW1hdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnByb3BzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0FuaW1hdGluZzogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBfcGF1c2VBbmltYXRpb24gPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fdGltZXIpIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fdGltZXIpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMucGF1c2VBbmltYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNBbmltYXRpbmc6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9uZXh0RnJhbWUgPSAoKSA9PiB7XG4gICAgICB0aGlzLl90aW1lciA9IG51bGw7XG4gICAgICBjb25zdCBuZXh0VmFsdWUgPVxuICAgICAgICB0aGlzLnByb3BzLmFuaW1hdGlvblR5cGUgPT09IEFOSU1BVElPTl9UWVBFLmNvbnRpbnVvdXNcbiAgICAgICAgICA/IHRoaXMuX25leHRGcmFtZUJ5V2luZG93KClcbiAgICAgICAgICA6IHRoaXMuX25leHRGcmFtZUJ5U3RlcCgpO1xuXG4gICAgICB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvbihuZXh0VmFsdWUpO1xuICAgIH07XG5cbiAgICBfbmV4dEZyYW1lQnlXaW5kb3coKSB7XG4gICAgICBjb25zdCB7ZG9tYWluLCB2YWx1ZSwgc3BlZWQsIGJhc2VTcGVlZH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgZGVsdGEgPSAoKGRvbWFpblsxXSAtIGRvbWFpblswXSkgLyBiYXNlU3BlZWQpICogc3BlZWQ7XG5cbiAgICAgIC8vIGxvb3Agd2hlbiByZWFjaGVzIHRoZSBlbmRcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBjb25zdCB2YWx1ZTAgPSB2YWx1ZVsxXSArIGRlbHRhID4gZG9tYWluWzFdID8gZG9tYWluWzBdIDogdmFsdWVbMF0gKyBkZWx0YTtcbiAgICAgICAgY29uc3QgdmFsdWUxID0gdmFsdWUwICsgdmFsdWVbMV0gLSB2YWx1ZVswXTtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZTAsIHZhbHVlMV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUgKyBkZWx0YSA+IGRvbWFpblsxXSA/IGRvbWFpblswXSA6IHZhbHVlICsgZGVsdGE7XG4gICAgfVxuXG4gICAgX25leHRGcmFtZUJ5U3RlcCgpIHtcbiAgICAgIGNvbnN0IHtzdGVwcywgdmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHZhbCA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWVbMF0gOiB2YWx1ZTtcbiAgICAgIGNvbnN0IGluZGV4ID0gYmlzZWN0TGVmdChzdGVwcywgdmFsKTtcbiAgICAgIGNvbnN0IG5leHRJZHggPSBpbmRleCA+PSBzdGVwcy5sZW5ndGggLSAxID8gMCA6IGluZGV4ICsgMTtcblxuICAgICAgcmV0dXJuIFtzdGVwc1tuZXh0SWR4XSwgbmV4dElkeF07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2lzQW5pbWF0aW5nfSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCB7Y2hpbGRyZW59ID0gdGhpcy5wcm9wcztcblxuICAgICAgcmV0dXJuIHR5cGVvZiBjaGlsZHJlbiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGNoaWxkcmVuKGlzQW5pbWF0aW5nLCB0aGlzLl9zdGFydEFuaW1hdGlvbiwgdGhpcy5fcGF1c2VBbmltYXRpb24sIHRoaXMuX3Jlc2V0QW5pbWF0aW9uKVxuICAgICAgICA6IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEFuaW1hdGlvbkNvbnRyb2xsZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbkNvbnRyb2xsZXJGYWN0b3J5O1xuIl19