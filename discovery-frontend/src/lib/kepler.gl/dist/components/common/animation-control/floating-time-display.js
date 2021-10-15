"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = FloatingTimeDisplayFactory;

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

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _moment = _interopRequireDefault(require("moment"));

var _reselect = require("reselect");

var _icons = require("../icons");

var _defaultSettings = require("../../../constants/default-settings");

var _styledComponents2 = require("../styled-components");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin: 0 12px;\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  display: flex;\n  font-size: 14px;\n  font-weight: 500;\n  justify-content: center;\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  display: flex;\n  font-size: 12px;\n  font-weight: 500;\n  justify-content: center;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  display: flex;\n  flex-direction: row;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  border-radius: ", "px;\n  bottom: ", ";\n  color: ", ";\n  display: flex;\n  height: ", "px;\n  justify-content: center;\n  left: calc(50% - 88px);\n  min-width: ", "px;\n  opacity: ", ";\n  padding: ", ";\n  position: absolute;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledTimeDisplay = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.panelBackground;
}, function (props) {
  return props.theme.timeDisplayBorderRadius;
}, function (props) {
  return "calc(100% + ".concat(props.theme.bottomPanelGap, "px)");
}, function (props) {
  return props.theme.titleTextColor;
}, function (props) {
  return props.theme.timeDisplayHeight;
}, function (props) {
  return props.theme.timeDisplayMinWidth;
}, function (props) {
  return props.theme.timeDisplayOpacity;
}, function (props) {
  return props.theme.timeDisplayPadding;
});

var StyledTimeDisplayGroups = _styledComponents["default"].div(_templateObject2());

var StyledTimeDisplayRows = _styledComponents["default"].div(_templateObject3());

var StyledTimeDisplayTop = _styledComponents["default"].div.attrs({
  className: 'animation-control__time-display__top'
})(_templateObject4(), function (props) {
  return props.theme.textColor;
});

var StyledTimeDisplayBottom = _styledComponents["default"].div.attrs({
  className: 'animation-control__time-display__bottom'
})(_templateObject5(), function (props) {
  return props.theme.titleTextColor;
});

var StyledTimeValueGroup = _styledComponents["default"].div.attrs({
  className: 'animation-control__time-value-group'
})(_templateObject6());

var StyledHorizontalBar = _styledComponents["default"].div.attrs({
  className: 'animation-control__horizontal-bar'
})(_templateObject7());

var TimeDivider = function TimeDivider() {
  return /*#__PURE__*/_react["default"].createElement(StyledHorizontalBar, null, /*#__PURE__*/_react["default"].createElement(_icons.Minus, {
    height: "12px"
  }));
};

var TimeDisplayRow = function TimeDisplayRow(_ref) {
  var _ref$timeValues = _ref.timeValues,
      timeValues = _ref$timeValues === void 0 ? [] : _ref$timeValues;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, null, /*#__PURE__*/_react["default"].createElement("div", null, timeValues[0]), timeValues[1] ? /*#__PURE__*/_react["default"].createElement(TimeDivider, null) : null, timeValues[1] ? /*#__PURE__*/_react["default"].createElement("div", null, timeValues[1]) : null);
};

function FloatingTimeDisplayFactory() {
  var FloatingTimeDisplay = /*#__PURE__*/function (_PureComponent) {
    (0, _inherits2["default"])(FloatingTimeDisplay, _PureComponent);

    var _super = _createSuper(FloatingTimeDisplay);

    function FloatingTimeDisplay() {
      var _this;

      (0, _classCallCheck2["default"])(this, FloatingTimeDisplay);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
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
      return _this;
    }

    (0, _createClass2["default"])(FloatingTimeDisplay, [{
      key: "render",
      value: function render() {
        var _this$displayTimeSele = this.displayTimeSelector(this.props),
            displayDate = _this$displayTimeSele.displayDate,
            displayTime = _this$displayTimeSele.displayTime;

        var twoGroups = displayDate.length === 2 && displayTime.length === 2;
        var bottomRow = displayTime.length ? displayTime : displayDate.length ? displayDate : null;
        var topRow = displayDate.length && displayTime.length ? displayDate : null;
        return /*#__PURE__*/_react["default"].createElement(StyledTimeDisplay, {
          className: "animation-control__time-display"
        }, twoGroups ? /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayGroups, null, /*#__PURE__*/_react["default"].createElement(StyledTimeValueGroup, null, /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayTop, null, displayDate[0]), /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayBottom, null, displayTime[0])), /*#__PURE__*/_react["default"].createElement(TimeDivider, null), /*#__PURE__*/_react["default"].createElement(StyledTimeValueGroup, null, /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayTop, null, displayDate[1]), /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayBottom, null, displayTime[1]))) : /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayRows, null, topRow ? /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayTop, null, /*#__PURE__*/_react["default"].createElement(TimeDisplayRow, {
          timeValues: topRow
        })) : null, bottomRow ? /*#__PURE__*/_react["default"].createElement(StyledTimeDisplayBottom, null, /*#__PURE__*/_react["default"].createElement(TimeDisplayRow, {
          timeValues: bottomRow
        })) : null));
      }
    }]);
    return FloatingTimeDisplay;
  }(_react.PureComponent);

  FloatingTimeDisplay.defaultProps = {
    format: _defaultSettings.DEFAULT_TIME_FORMAT,
    currentTime: null
  };
  return FloatingTimeDisplay;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9hbmltYXRpb24tY29udHJvbC9mbG9hdGluZy10aW1lLWRpc3BsYXkuanMiXSwibmFtZXMiOlsiU3R5bGVkVGltZURpc3BsYXkiLCJzdHlsZWQiLCJkaXYiLCJwcm9wcyIsInRoZW1lIiwicGFuZWxCYWNrZ3JvdW5kIiwidGltZURpc3BsYXlCb3JkZXJSYWRpdXMiLCJib3R0b21QYW5lbEdhcCIsInRpdGxlVGV4dENvbG9yIiwidGltZURpc3BsYXlIZWlnaHQiLCJ0aW1lRGlzcGxheU1pbldpZHRoIiwidGltZURpc3BsYXlPcGFjaXR5IiwidGltZURpc3BsYXlQYWRkaW5nIiwiU3R5bGVkVGltZURpc3BsYXlHcm91cHMiLCJTdHlsZWRUaW1lRGlzcGxheVJvd3MiLCJTdHlsZWRUaW1lRGlzcGxheVRvcCIsImF0dHJzIiwiY2xhc3NOYW1lIiwidGV4dENvbG9yIiwiU3R5bGVkVGltZURpc3BsYXlCb3R0b20iLCJTdHlsZWRUaW1lVmFsdWVHcm91cCIsIlN0eWxlZEhvcml6b250YWxCYXIiLCJUaW1lRGl2aWRlciIsIlRpbWVEaXNwbGF5Um93IiwidGltZVZhbHVlcyIsIkZsb2F0aW5nVGltZURpc3BsYXlGYWN0b3J5IiwiRmxvYXRpbmdUaW1lRGlzcGxheSIsImN1cnJlbnRUaW1lIiwiZm9ybWF0IiwidGltZVNlbGVjdG9yIiwiZm9ybWF0U2VsZWN0b3IiLCJncm91cFRpbWUiLCJBcnJheSIsImlzQXJyYXkiLCJyZWR1Y2UiLCJhY2N1IiwiY3VyciIsImRpc3BsYXlEYXRlVGltZSIsIm1vbWVudCIsInV0YyIsInNwbGl0IiwiZGlzcGxheURhdGUiLCJkaXNwbGF5VGltZSIsImluY2x1ZGVzIiwicHVzaCIsImRpc3BsYXlUaW1lU2VsZWN0b3IiLCJ0d29Hcm91cHMiLCJsZW5ndGgiLCJib3R0b21Sb3ciLCJ0b3BSb3ciLCJQdXJlQ29tcG9uZW50IiwiZGVmYXVsdFByb3BzIiwiREVGQVVMVF9USU1F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cUJBQ0UsZ0NBQUMsY0FBRDtBQUFnQixVQUFBLFVBQVUsRUFBRUE7QUFBNUIsVUFERixDQURRLEdBSU4sSUFWTixDQWhCSixDQURGO0FBZ0NEO0FBaEVnRDtBQUFBO0FBQUEsSUFDakJFLG9CQURpQjs7QUFtRW5EeEIsRUFBQUEsbUJBQW1CLENBQUN5QixZQUFwQixHQUFtQztBQUNqQ3ZCLElBQUFBLE1BQU0sRUFBRXdCLG9DQUR5QjtBQUVqQ3pCLElBQUFBLFdBQVcsRUFBRTtBQUZvQixHQUFuQztBQUtBLFNBQU9ELG1CQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtQdXJlQ29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCB7TWludXN9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCB7REVGQVVMVF9USU1FX0ZPUk1BVH0gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuaW1wb3J0IHtDZW50ZXJGbGV4Ym94fSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5cbmNvbnN0IFN0eWxlZFRpbWVEaXNwbGF5ID0gc3R5bGVkLmRpdmBcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbEJhY2tncm91bmR9O1xuICBib3JkZXItcmFkaXVzOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpbWVEaXNwbGF5Qm9yZGVyUmFkaXVzfXB4O1xuICBib3R0b206ICR7cHJvcHMgPT4gYGNhbGMoMTAwJSArICR7cHJvcHMudGhlbWUuYm90dG9tUGFuZWxHYXB9cHgpYH07XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpdGxlVGV4dENvbG9yfTtcbiAgZGlzcGxheTogZmxleDtcbiAgaGVpZ2h0OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpbWVEaXNwbGF5SGVpZ2h0fXB4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbGVmdDogY2FsYyg1MCUgLSA4OHB4KTtcbiAgbWluLXdpZHRoOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpbWVEaXNwbGF5TWluV2lkdGh9cHg7XG4gIG9wYWNpdHk6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGltZURpc3BsYXlPcGFjaXR5fTtcbiAgcGFkZGluZzogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aW1lRGlzcGxheVBhZGRpbmd9O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG5gO1xuXG5jb25zdCBTdHlsZWRUaW1lRGlzcGxheUdyb3VwcyA9IHN0eWxlZC5kaXZgXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG5gO1xuXG5jb25zdCBTdHlsZWRUaW1lRGlzcGxheVJvd3MgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbmA7XG5cbmNvbnN0IFN0eWxlZFRpbWVEaXNwbGF5VG9wID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ2FuaW1hdGlvbi1jb250cm9sX190aW1lLWRpc3BsYXlfX3RvcCdcbn0pYFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3J9O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuYDtcblxuY29uc3QgU3R5bGVkVGltZURpc3BsYXlCb3R0b20gPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnYW5pbWF0aW9uLWNvbnRyb2xfX3RpbWUtZGlzcGxheV9fYm90dG9tJ1xufSlgXG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpdGxlVGV4dENvbG9yfTtcbiAgZGlzcGxheTogZmxleDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbmA7XG5cbmNvbnN0IFN0eWxlZFRpbWVWYWx1ZUdyb3VwID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ2FuaW1hdGlvbi1jb250cm9sX190aW1lLXZhbHVlLWdyb3VwJ1xufSlgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5gO1xuXG5jb25zdCBTdHlsZWRIb3Jpem9udGFsQmFyID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ2FuaW1hdGlvbi1jb250cm9sX19ob3Jpem9udGFsLWJhcidcbn0pYFxuICBtYXJnaW46IDAgMTJweDtcbmA7XG5cbmNvbnN0IFRpbWVEaXZpZGVyID0gKCkgPT4gKFxuICA8U3R5bGVkSG9yaXpvbnRhbEJhcj5cbiAgICA8TWludXMgaGVpZ2h0PVwiMTJweFwiIC8+XG4gIDwvU3R5bGVkSG9yaXpvbnRhbEJhcj5cbik7XG5cbmNvbnN0IFRpbWVEaXNwbGF5Um93ID0gKHt0aW1lVmFsdWVzID0gW119KSA9PiAoXG4gIDxDZW50ZXJGbGV4Ym94PlxuICAgIDxkaXY+e3RpbWVWYWx1ZXNbMF19PC9kaXY+XG4gICAge3RpbWVWYWx1ZXNbMV0gPyA8VGltZURpdmlkZXIgLz4gOiBudWxsfVxuICAgIHt0aW1lVmFsdWVzWzFdID8gPGRpdj57dGltZVZhbHVlc1sxXX08L2Rpdj4gOiBudWxsfVxuICA8L0NlbnRlckZsZXhib3g+XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGbG9hdGluZ1RpbWVEaXNwbGF5RmFjdG9yeSgpIHtcbiAgY2xhc3MgRmxvYXRpbmdUaW1lRGlzcGxheSBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICAgIHRpbWVTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmN1cnJlbnRUaW1lO1xuICAgIGZvcm1hdFNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMuZm9ybWF0O1xuICAgIGRpc3BsYXlUaW1lU2VsZWN0b3IgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgIHRoaXMudGltZVNlbGVjdG9yLFxuICAgICAgdGhpcy5mb3JtYXRTZWxlY3RvcixcbiAgICAgIChjdXJyZW50VGltZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgIGNvbnN0IGdyb3VwVGltZSA9IEFycmF5LmlzQXJyYXkoY3VycmVudFRpbWUpID8gY3VycmVudFRpbWUgOiBbY3VycmVudFRpbWVdO1xuICAgICAgICByZXR1cm4gZ3JvdXBUaW1lLnJlZHVjZShcbiAgICAgICAgICAoYWNjdSwgY3VycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheURhdGVUaW1lID0gbW9tZW50LnV0YyhjdXJyKS5mb3JtYXQoZm9ybWF0KTtcbiAgICAgICAgICAgIGNvbnN0IFtkaXNwbGF5RGF0ZSwgZGlzcGxheVRpbWVdID0gZGlzcGxheURhdGVUaW1lLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgICAgIGlmICghYWNjdS5kaXNwbGF5RGF0ZS5pbmNsdWRlcyhkaXNwbGF5RGF0ZSkpIHtcbiAgICAgICAgICAgICAgYWNjdS5kaXNwbGF5RGF0ZS5wdXNoKGRpc3BsYXlEYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjY3UuZGlzcGxheVRpbWUucHVzaChkaXNwbGF5VGltZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBhY2N1O1xuICAgICAgICAgIH0sXG4gICAgICAgICAge2Rpc3BsYXlEYXRlOiBbXSwgZGlzcGxheVRpbWU6IFtdfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7ZGlzcGxheURhdGUsIGRpc3BsYXlUaW1lfSA9IHRoaXMuZGlzcGxheVRpbWVTZWxlY3Rvcih0aGlzLnByb3BzKTtcbiAgICAgIGNvbnN0IHR3b0dyb3VwcyA9IGRpc3BsYXlEYXRlLmxlbmd0aCA9PT0gMiAmJiBkaXNwbGF5VGltZS5sZW5ndGggPT09IDI7XG4gICAgICBjb25zdCBib3R0b21Sb3cgPSBkaXNwbGF5VGltZS5sZW5ndGggPyBkaXNwbGF5VGltZSA6IGRpc3BsYXlEYXRlLmxlbmd0aCA/IGRpc3BsYXlEYXRlIDogbnVsbDtcbiAgICAgIGNvbnN0IHRvcFJvdyA9IGRpc3BsYXlEYXRlLmxlbmd0aCAmJiBkaXNwbGF5VGltZS5sZW5ndGggPyBkaXNwbGF5RGF0ZSA6IG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRUaW1lRGlzcGxheSBjbGFzc05hbWU9XCJhbmltYXRpb24tY29udHJvbF9fdGltZS1kaXNwbGF5XCI+XG4gICAgICAgICAge3R3b0dyb3VwcyA/IChcbiAgICAgICAgICAgIDxTdHlsZWRUaW1lRGlzcGxheUdyb3Vwcz5cbiAgICAgICAgICAgICAgPFN0eWxlZFRpbWVWYWx1ZUdyb3VwPlxuICAgICAgICAgICAgICAgIHsvKiBUaW1lIFN0YXJ0ICovfVxuICAgICAgICAgICAgICAgIDxTdHlsZWRUaW1lRGlzcGxheVRvcD57ZGlzcGxheURhdGVbMF19PC9TdHlsZWRUaW1lRGlzcGxheVRvcD5cbiAgICAgICAgICAgICAgICA8U3R5bGVkVGltZURpc3BsYXlCb3R0b20+e2Rpc3BsYXlUaW1lWzBdfTwvU3R5bGVkVGltZURpc3BsYXlCb3R0b20+XG4gICAgICAgICAgICAgIDwvU3R5bGVkVGltZVZhbHVlR3JvdXA+XG4gICAgICAgICAgICAgIDxUaW1lRGl2aWRlciAvPlxuICAgICAgICAgICAgICA8U3R5bGVkVGltZVZhbHVlR3JvdXA+XG4gICAgICAgICAgICAgICAgey8qIFRpbWUgRW5kICovfVxuICAgICAgICAgICAgICAgIDxTdHlsZWRUaW1lRGlzcGxheVRvcD57ZGlzcGxheURhdGVbMV19PC9TdHlsZWRUaW1lRGlzcGxheVRvcD5cbiAgICAgICAgICAgICAgICA8U3R5bGVkVGltZURpc3BsYXlCb3R0b20+e2Rpc3BsYXlUaW1lWzFdfTwvU3R5bGVkVGltZURpc3BsYXlCb3R0b20+XG4gICAgICAgICAgICAgIDwvU3R5bGVkVGltZVZhbHVlR3JvdXA+XG4gICAgICAgICAgICA8L1N0eWxlZFRpbWVEaXNwbGF5R3JvdXBzPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8U3R5bGVkVGltZURpc3BsYXlSb3dzPlxuICAgICAgICAgICAgICB7dG9wUm93ID8gKFxuICAgICAgICAgICAgICAgIDxTdHlsZWRUaW1lRGlzcGxheVRvcD5cbiAgICAgICAgICAgICAgICAgIDxUaW1lRGlzcGxheVJvdyB0aW1lVmFsdWVzPXt0b3BSb3d9IC8+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRUaW1lRGlzcGxheVRvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtib3R0b21Sb3cgPyAoXG4gICAgICAgICAgICAgICAgPFN0eWxlZFRpbWVEaXNwbGF5Qm90dG9tPlxuICAgICAgICAgICAgICAgICAgPFRpbWVEaXNwbGF5Um93IHRpbWVWYWx1ZXM9e2JvdHRvbVJvd30gLz5cbiAgICAgICAgICAgICAgICA8L1N0eWxlZFRpbWVEaXNwbGF5Qm90dG9tPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvU3R5bGVkVGltZURpc3BsYXlSb3dzPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvU3R5bGVkVGltZURpc3BsYXk+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEZsb2F0aW5nVGltZURpc3BsYXkuZGVmYXVsdFByb3BzID0ge1xuICAgIGZvcm1hdDogREVGQVVMVF9USU1FX0ZPUk1BVCxcbiAgICBjdXJyZW50VGltZTogbnVsbFxuICB9O1xuXG4gIHJldHVybiBGbG9hdGluZ1RpbWVEaXNwbGF5O1xufVxuIl19