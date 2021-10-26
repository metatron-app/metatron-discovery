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

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _d3Selection = require("d3-selection");

var _d3Brush = require("d3-brush");

var _dataUtils = require("../../utils/data-utils");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .selection {\n    stroke: none;\n    fill: ", ";\n    fill-opacity: ", ";\n  }\n  .handle {\n    fill: ", ";\n    fill-opacity: 0.3;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledG = _styledComponents["default"].g(_templateObject(), function (props) {
  return props.isRanged ? props.theme.rangeBrushBgd : props.theme.BLUE2;
}, function (props) {
  return props.isRanged ? 0.3 : 1;
}, function (props) {
  return props.theme.BLUE2;
});

function moveRight(startSel, selection) {
  var _startSel = (0, _slicedToArray2["default"])(startSel, 1),
      startSel0 = _startSel[0];

  var _selection = (0, _slicedToArray2["default"])(selection, 1),
      sel0 = _selection[0];

  return Boolean(startSel0 === sel0);
}

function RangeBrushFactory() {
  var RangeBrush = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(RangeBrush, _Component);

    var _super = _createSuper(RangeBrush);

    function RangeBrush() {
      var _this;

      (0, _classCallCheck2["default"])(this, RangeBrush);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "rootContainer", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_brushed", function (evt) {
        if (evt.sourceEvent.type === 'brush') return;

        var _evt$selection = (0, _slicedToArray2["default"])(evt.selection, 2),
            sel0 = _evt$selection[0],
            sel1 = _evt$selection[1];

        var right = moveRight(_this._startSel, evt.selection);

        var _this$props = _this.props,
            _this$props$range = (0, _slicedToArray2["default"])(_this$props.range, 2),
            min = _this$props$range[0],
            max = _this$props$range[1],
            step = _this$props.step,
            width = _this$props.width,
            marks = _this$props.marks,
            isRanged = _this$props.isRanged;

        var invert = function invert(x) {
          return x * (max - min) / width + min;
        };

        var d0 = invert(sel0);
        var d1 = invert(sel1);
        d0 = (0, _dataUtils.normalizeSliderValue)(d0, min, step, marks);
        d1 = (0, _dataUtils.normalizeSliderValue)(d1, min, step, marks);
        if (isRanged) _this._move(d0, d1);else _this._move(right ? d1 : d0);
        if (isRanged) _this._onBrush(d0, d1);else _this._onBrush(right ? d1 : d0);
      });
      return _this;
    }

    (0, _createClass2["default"])(RangeBrush, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        // We want the React app to respond to brush state and vice-versa
        // but d3-brush fires the same events for both user-initiated brushing
        // and programmatic brushing (brush.move). We need these flags to
        // distinguish between the uses.
        //
        // We don't use state because that would trigger another `componentDidUpdate`
        this.brushing = false;
        this.moving = false;
        this.root = (0, _d3Selection.select)(this.rootContainer.current);
        this.brush = (0, _d3Brush.brushX)().handleSize(3).on('start', function () {
          if (typeof _this2.props.onBrushStart === 'function') _this2.props.onBrushStart();
          _this2._startSel = _d3Selection.event.selection;
        }).on('brush', function () {
          if (_this2.moving) {
            return;
          }

          if (_d3Selection.event.selection) {
            _this2.brushing = true;

            _this2._brushed(_d3Selection.event);
          }
        }).on('end', function () {
          if (!_this2.brushing && _this2._startSel && !_d3Selection.event.selection) {
            // handle click
            _this2._click(_this2._startSel);
          }

          if (typeof _this2.props.onBrushEnd === 'function') _this2.props.onBrushEnd();
          _this2.brushing = false;
          _this2.moving = false;
        });
        this.root.call(this.brush);

        var _this$props$value = (0, _slicedToArray2["default"])(this.props.value, 2),
            val0 = _this$props$value[0],
            val1 = _this$props$value[1];

        this.moving = true;

        this._move(val0, val1);
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var _this$props2 = this.props,
            _this$props2$value = (0, _slicedToArray2["default"])(_this$props2.value, 2),
            val0 = _this$props2$value[0],
            val1 = _this$props2$value[1],
            width = _this$props2.width;

        var _prevProps$value = (0, _slicedToArray2["default"])(prevProps.value, 2),
            prevVal0 = _prevProps$value[0],
            prevVal1 = _prevProps$value[1];

        if (prevProps.width !== width) {
          // width change should not trigger this._brushed
          this.moving = true;
          this.root.call(this.brush);

          this._move(val0, val1);
        }

        if (!this.brushing && !this.moving) {
          if (prevVal0 !== val0 || prevVal1 !== val1) {
            this.moving = true;

            this._move(val0, val1);
          }
        }
      }
    }, {
      key: "_click",
      value: function _click(selection) {
        // fake brush
        this.brushing = true;

        this._brushed({
          sourceEvent: {},
          selection: selection
        });
      }
    }, {
      key: "_move",
      value: function _move(val0, val1) {
        var _this$props3 = this.props,
            _this$props3$range = (0, _slicedToArray2["default"])(_this$props3.range, 2),
            min = _this$props3$range[0],
            max = _this$props3$range[1],
            width = _this$props3.width,
            isRanged = _this$props3.isRanged;

        if (width && max - min) {
          var scale = function scale(x) {
            return (x - min) * width / (max - min);
          };

          if (!isRanged) {
            // only draw a 1 pixel line
            this.brush.move(this.root, [scale(val0), scale(val0) + 1]);
          } else {
            this.brush.move(this.root, [scale(val0), scale(val1)]);
          }
        }
      }
    }, {
      key: "_onBrush",
      value: function _onBrush(val0, val1) {
        var _this$props4 = this.props,
            isRanged = _this$props4.isRanged,
            _this$props4$value = (0, _slicedToArray2["default"])(_this$props4.value, 2),
            currentVal0 = _this$props4$value[0],
            currentVal1 = _this$props4$value[1];

        if (currentVal0 === val0 && currentVal1 === val1) {
          return;
        }

        if (isRanged) {
          this.props.onBrush(val0, val1);
        } else {
          this.props.onBrush(val0, val0);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var isRanged = this.props.isRanged;
        return /*#__PURE__*/_react["default"].createElement(StyledG, {
          className: "kg-range-slider__brush",
          isRanged: isRanged,
          ref: this.rootContainer
        });
      }
    }]);
    return RangeBrush;
  }(_react.Component);

  (0, _defineProperty2["default"])(RangeBrush, "propTypes", {
    onBrush: _propTypes["default"].func.isRequired,
    range: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    value: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    width: _propTypes["default"].number.isRequired,
    isRanged: _propTypes["default"].bool
  });
  (0, _defineProperty2["default"])(RangeBrush, "defaultProps", {
    isRanged: true
  });
  return RangeBrush;
}

var _default = RangeBrushFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9yYW5nZS1icnVzaC5qcyJdLCJuYW1lcyI6WyJTdHlsZWRHIiwic3R5bGVkIiwiZyIsInByb3BzIiwiaXNSYW5nZWQiLCJ0aGVtZSIsInJhbmdlQnJ1c2hCZ2QiLCJCTFVFMiIsIm1vdmVSaWdodCIsInN0YXJ0U2VsIiwic2VsZWN0aW9uIiwic3RhcnRTZWwwIiwic2VsMCIsIkJvb2xlYW4iLCJSYW5nZUJydXNoRmFjdG9yeSIsIlJhbmdlQnJ1c2giLCJldnQiLCJzb3VyY2VFdmVudCIsInR5cGUiLCJzZWwxIiwicmlnaHQiLCJfc3RhcnRTZWwiLCJyYW5nZSIsIm1pbiIsIm1heCIsInN0ZXAiLCJ3aWR0aCIsIm1hcmtzIiwiaW52ZXJ0IiwieCIsImQwIiwiZDEiLCJfbW92ZSIsIl9vbkJydXNoIiwiYnJ1c2hpbmciLCJtb3ZpbmciLCJyb290Iiwicm9vdENvbnRhaW5lciIsImN1cnJlbnQiLCJicnVzaCIsImhhbmRsZVNpemUiLCJvbiIsIm9uQnJ1c2hTdGFydCIsImV2ZW50IiwiX2JydXNoZWQiLCJfY2xpY2siLCJvbkJydXNoRW5kIiwiY2FsbCIsInZhbHVlIiwidmFsMCIsInZhbDEiLCJwcmV2UHJvcHMiLCJwcmV2VmFsMCIsInByZXZWYWwxIiwic2NhbGUiLCJtb3ZlIiwiY3VycmVudFZhbDAiLCJjdXJyZW50VmFsMSIsIm9uQnJ1c2giLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsImFycmF5T2YiLCJudW1iZXIiLCJib29sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLE9BQU8sR0FBR0MsNkJBQU9DLENBQVYsb0JBR0QsVUFBQUMsS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0MsUUFBTixHQUFpQkQsS0FBSyxDQUFD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QTtBQUFBLCtCQXlKaEI7QUFBQSxZQUNBN0MsUUFEQSxHQUNZLEtBQUtELEtBRGpCLENBQ0FDLFFBREE7QUFHUCw0QkFDRSxnQ0FBQyxPQUFEO0FBQVMsVUFBQSxTQUFTLEVBQUMsd0JBQW5CO0FBQTRDLFVBQUEsUUFBUSxFQUFFQSxRQUF0RDtBQUFnRSxVQUFBLEdBQUcsRUFBRSxLQUFLaUM7QUFBMUUsVUFERjtBQUdEO0FBL0p3QjtBQUFBO0FBQUEsSUFDRnNCLGdCQURFOztBQUFBLG1DQUNyQjVDLFVBRHFCLGVBRU47QUFDakIyQyxJQUFBQSxPQUFPLEVBQUVFLHNCQUFVQyxJQUFWLENBQWVDLFVBRFA7QUFFakJ4QyxJQUFBQSxLQUFLLEVBQUVzQyxzQkFBVUcsT0FBVixDQUFrQkgsc0JBQVVJLE1BQTVCLEVBQW9DRixVQUYxQjtBQUdqQmQsSUFBQUEsS0FBSyxFQUFFWSxzQkFBVUcsT0FBVixDQUFrQkgsc0JBQVVJLE1BQTVCLEVBQW9DRixVQUgxQjtBQUlqQnBDLElBQUFBLEtBQUssRUFBRWtDLHNCQUFVSSxNQUFWLENBQWlCRixVQUpQO0FBS2pCMUQsSUFBQUEsUUFBUSxFQUFFd0Qsc0JBQVVLO0FBTEgsR0FGTTtBQUFBLG1DQUNyQmxELFVBRHFCLGtCQVVIO0FBQ3BCWCxJQUFBQSxRQUFRLEVBQUU7QUFEVSxHQVZHO0FBaUszQixTQUFPVyxVQUFQO0FBQ0Q7O2VBRWNELGlCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCBjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7ZXZlbnQsIHNlbGVjdH0gZnJvbSAnZDMtc2VsZWN0aW9uJztcbmltcG9ydCB7YnJ1c2hYfSBmcm9tICdkMy1icnVzaCc7XG5pbXBvcnQge25vcm1hbGl6ZVNsaWRlclZhbHVlfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcblxuY29uc3QgU3R5bGVkRyA9IHN0eWxlZC5nYFxuICAuc2VsZWN0aW9uIHtcbiAgICBzdHJva2U6IG5vbmU7XG4gICAgZmlsbDogJHtwcm9wcyA9PiAocHJvcHMuaXNSYW5nZWQgPyBwcm9wcy50aGVtZS5yYW5nZUJydXNoQmdkIDogcHJvcHMudGhlbWUuQkxVRTIpfTtcbiAgICBmaWxsLW9wYWNpdHk6ICR7cHJvcHMgPT4gKHByb3BzLmlzUmFuZ2VkID8gMC4zIDogMSl9O1xuICB9XG4gIC5oYW5kbGUge1xuICAgIGZpbGw6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuQkxVRTJ9O1xuICAgIGZpbGwtb3BhY2l0eTogMC4zO1xuICB9XG5gO1xuXG5mdW5jdGlvbiBtb3ZlUmlnaHQoc3RhcnRTZWwsIHNlbGVjdGlvbikge1xuICBjb25zdCBbc3RhcnRTZWwwXSA9IHN0YXJ0U2VsO1xuICBjb25zdCBbc2VsMF0gPSBzZWxlY3Rpb247XG5cbiAgcmV0dXJuIEJvb2xlYW4oc3RhcnRTZWwwID09PSBzZWwwKTtcbn1cblxuZnVuY3Rpb24gUmFuZ2VCcnVzaEZhY3RvcnkoKSB7XG4gIGNsYXNzIFJhbmdlQnJ1c2ggZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBvbkJydXNoOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgcmFuZ2U6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5udW1iZXIpLmlzUmVxdWlyZWQsXG4gICAgICB2YWx1ZTogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm51bWJlcikuaXNSZXF1aXJlZCxcbiAgICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICBpc1JhbmdlZDogUHJvcFR5cGVzLmJvb2xcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgIGlzUmFuZ2VkOiB0cnVlXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgLy8gV2Ugd2FudCB0aGUgUmVhY3QgYXBwIHRvIHJlc3BvbmQgdG8gYnJ1c2ggc3RhdGUgYW5kIHZpY2UtdmVyc2FcbiAgICAgIC8vIGJ1dCBkMy1icnVzaCBmaXJlcyB0aGUgc2FtZSBldmVudHMgZm9yIGJvdGggdXNlci1pbml0aWF0ZWQgYnJ1c2hpbmdcbiAgICAgIC8vIGFuZCBwcm9ncmFtbWF0aWMgYnJ1c2hpbmcgKGJydXNoLm1vdmUpLiBXZSBuZWVkIHRoZXNlIGZsYWdzIHRvXG4gICAgICAvLyBkaXN0aW5ndWlzaCBiZXR3ZWVuIHRoZSB1c2VzLlxuICAgICAgLy9cbiAgICAgIC8vIFdlIGRvbid0IHVzZSBzdGF0ZSBiZWNhdXNlIHRoYXQgd291bGQgdHJpZ2dlciBhbm90aGVyIGBjb21wb25lbnREaWRVcGRhdGVgXG5cbiAgICAgIHRoaXMuYnJ1c2hpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG5cbiAgICAgIHRoaXMucm9vdCA9IHNlbGVjdCh0aGlzLnJvb3RDb250YWluZXIuY3VycmVudCk7XG4gICAgICB0aGlzLmJydXNoID0gYnJ1c2hYKClcbiAgICAgICAgLmhhbmRsZVNpemUoMylcbiAgICAgICAgLm9uKCdzdGFydCcsICgpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMub25CcnVzaFN0YXJ0ID09PSAnZnVuY3Rpb24nKSB0aGlzLnByb3BzLm9uQnJ1c2hTdGFydCgpO1xuICAgICAgICAgIHRoaXMuX3N0YXJ0U2VsID0gZXZlbnQuc2VsZWN0aW9uO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2JydXNoJywgKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm1vdmluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXZlbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmJydXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2JydXNoZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJydXNoaW5nICYmIHRoaXMuX3N0YXJ0U2VsICYmICFldmVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIGhhbmRsZSBjbGlja1xuXG4gICAgICAgICAgICB0aGlzLl9jbGljayh0aGlzLl9zdGFydFNlbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5vbkJydXNoRW5kID09PSAnZnVuY3Rpb24nKSB0aGlzLnByb3BzLm9uQnJ1c2hFbmQoKTtcblxuICAgICAgICAgIHRoaXMuYnJ1c2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgdGhpcy5yb290LmNhbGwodGhpcy5icnVzaCk7XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdmFsdWU6IFt2YWwwLCB2YWwxXVxuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgICB0aGlzLl9tb3ZlKHZhbDAsIHZhbDEpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdmFsdWU6IFt2YWwwLCB2YWwxXSxcbiAgICAgICAgd2lkdGhcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgW3ByZXZWYWwwLCBwcmV2VmFsMV0gPSBwcmV2UHJvcHMudmFsdWU7XG5cbiAgICAgIGlmIChwcmV2UHJvcHMud2lkdGggIT09IHdpZHRoKSB7XG4gICAgICAgIC8vIHdpZHRoIGNoYW5nZSBzaG91bGQgbm90IHRyaWdnZXIgdGhpcy5fYnJ1c2hlZFxuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucm9vdC5jYWxsKHRoaXMuYnJ1c2gpO1xuICAgICAgICB0aGlzLl9tb3ZlKHZhbDAsIHZhbDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuYnJ1c2hpbmcgJiYgIXRoaXMubW92aW5nKSB7XG4gICAgICAgIGlmIChwcmV2VmFsMCAhPT0gdmFsMCB8fCBwcmV2VmFsMSAhPT0gdmFsMSkge1xuICAgICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9tb3ZlKHZhbDAsIHZhbDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcm9vdENvbnRhaW5lciA9IGNyZWF0ZVJlZigpO1xuXG4gICAgX2NsaWNrKHNlbGVjdGlvbikge1xuICAgICAgLy8gZmFrZSBicnVzaFxuICAgICAgdGhpcy5icnVzaGluZyA9IHRydWU7XG4gICAgICB0aGlzLl9icnVzaGVkKHtzb3VyY2VFdmVudDoge30sIHNlbGVjdGlvbn0pO1xuICAgIH1cblxuICAgIF9tb3ZlKHZhbDAsIHZhbDEpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcmFuZ2U6IFttaW4sIG1heF0sXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBpc1JhbmdlZFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmICh3aWR0aCAmJiBtYXggLSBtaW4pIHtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB4ID0+ICgoeCAtIG1pbikgKiB3aWR0aCkgLyAobWF4IC0gbWluKTtcbiAgICAgICAgaWYgKCFpc1JhbmdlZCkge1xuICAgICAgICAgIC8vIG9ubHkgZHJhdyBhIDEgcGl4ZWwgbGluZVxuICAgICAgICAgIHRoaXMuYnJ1c2gubW92ZSh0aGlzLnJvb3QsIFtzY2FsZSh2YWwwKSwgc2NhbGUodmFsMCkgKyAxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5icnVzaC5tb3ZlKHRoaXMucm9vdCwgW3NjYWxlKHZhbDApLCBzY2FsZSh2YWwxKV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2JydXNoZWQgPSBldnQgPT4ge1xuICAgICAgaWYgKGV2dC5zb3VyY2VFdmVudC50eXBlID09PSAnYnJ1c2gnKSByZXR1cm47XG4gICAgICBjb25zdCBbc2VsMCwgc2VsMV0gPSBldnQuc2VsZWN0aW9uO1xuICAgICAgY29uc3QgcmlnaHQgPSBtb3ZlUmlnaHQodGhpcy5fc3RhcnRTZWwsIGV2dC5zZWxlY3Rpb24pO1xuXG4gICAgICBjb25zdCB7XG4gICAgICAgIHJhbmdlOiBbbWluLCBtYXhdLFxuICAgICAgICBzdGVwLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgbWFya3MsXG4gICAgICAgIGlzUmFuZ2VkXG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGludmVydCA9IHggPT4gKHggKiAobWF4IC0gbWluKSkgLyB3aWR0aCArIG1pbjtcbiAgICAgIGxldCBkMCA9IGludmVydChzZWwwKTtcbiAgICAgIGxldCBkMSA9IGludmVydChzZWwxKTtcblxuICAgICAgZDAgPSBub3JtYWxpemVTbGlkZXJWYWx1ZShkMCwgbWluLCBzdGVwLCBtYXJrcyk7XG4gICAgICBkMSA9IG5vcm1hbGl6ZVNsaWRlclZhbHVlKGQxLCBtaW4sIHN0ZXAsIG1hcmtzKTtcblxuICAgICAgaWYgKGlzUmFuZ2VkKSB0aGlzLl9tb3ZlKGQwLCBkMSk7XG4gICAgICBlbHNlIHRoaXMuX21vdmUocmlnaHQgPyBkMSA6IGQwKTtcblxuICAgICAgaWYgKGlzUmFuZ2VkKSB0aGlzLl9vbkJydXNoKGQwLCBkMSk7XG4gICAgICBlbHNlIHRoaXMuX29uQnJ1c2gocmlnaHQgPyBkMSA6IGQwKTtcbiAgICB9O1xuXG4gICAgX29uQnJ1c2godmFsMCwgdmFsMSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc1JhbmdlZCxcbiAgICAgICAgdmFsdWU6IFtjdXJyZW50VmFsMCwgY3VycmVudFZhbDFdXG4gICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgaWYgKGN1cnJlbnRWYWwwID09PSB2YWwwICYmIGN1cnJlbnRWYWwxID09PSB2YWwxKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUmFuZ2VkKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25CcnVzaCh2YWwwLCB2YWwxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvcHMub25CcnVzaCh2YWwwLCB2YWwwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7aXNSYW5nZWR9ID0gdGhpcy5wcm9wcztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZEcgY2xhc3NOYW1lPVwia2ctcmFuZ2Utc2xpZGVyX19icnVzaFwiIGlzUmFuZ2VkPXtpc1JhbmdlZH0gcmVmPXt0aGlzLnJvb3RDb250YWluZXJ9IC8+XG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gUmFuZ2VCcnVzaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmFuZ2VCcnVzaEZhY3Rvcnk7XG4iXX0=