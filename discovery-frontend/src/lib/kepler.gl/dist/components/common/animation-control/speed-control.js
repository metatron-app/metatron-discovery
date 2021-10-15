"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _animationSpeedSlider = _interopRequireDefault(require("./animation-speed-slider"));

var _styledComponents2 = require("../styled-components");

var _icons = require("../icons");

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: inline-block;\n  width: 24px;\n  text-align: left;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-grow: 0;\n  color: ", ";\n  position: relative;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledSpeedToggle = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColor;
});

var StyledSpeedText = _styledComponents["default"].div(_templateObject2());

SpeedControlFactory.deps = [_animationSpeedSlider["default"]];

function SpeedControlFactory(AnimationSpeedSlider) {
  var SpeedControl = function SpeedControl(_ref) {
    var onClick = _ref.onClick,
        updateAnimationSpeed = _ref.updateAnimationSpeed,
        speed = _ref.speed,
        showSpeedControl = _ref.showSpeedControl,
        _ref$buttonHeight = _ref.buttonHeight,
        buttonHeight = _ref$buttonHeight === void 0 ? '18px' : _ref$buttonHeight;
    return /*#__PURE__*/_react["default"].createElement(StyledSpeedToggle, {
      className: "animation-control__speed-control"
    }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
      link: true,
      width: "80px",
      onClick: onClick
    }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, {
      className: "bottom-widget__icon speed"
    }, /*#__PURE__*/_react["default"].createElement(_icons.Rocket, {
      height: buttonHeight
    })), /*#__PURE__*/_react["default"].createElement(StyledSpeedText, {
      style: {
        visibility: !showSpeedControl ? 'visible' : 'hidden'
      }
    }, speed, "x")), showSpeedControl ? /*#__PURE__*/_react["default"].createElement(AnimationSpeedSlider, {
      onHide: onClick,
      updateAnimationSpeed: updateAnimationSpeed,
      speed: speed
    }) : null);
  };

  return SpeedControl;
}

var _default = SpeedControlFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9hbmltYXRpb24tY29udHJvbC9zcGVlZC1jb250cm9sLmpzIl0sIm5hbWVzIjpbIlN0eWxlZFNwZWVkVG9nZ2xlIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvciIsIlN0eWxlZFNwZWVkVGV4dCIsIlNwZWVkQ29udHJvbEZhY3RvcnkiLCJkZXBzIiwiQW5pbWF0aW9uU3BlZWRTbGlkZXJGYWN0b3J5IiwiQW5pbWF0aW9uU3BlZWRTbGlkZXIiLCJTcGVlZENvbnRyb2wiLCJvbkNsaWNrIiwidXBkYXRlQW5pbWF0aW9uU3BlZWQiLCJzcGVlZCIsInNob3dTcGVlZENvbnRyb2wiLCJidXR0b25IZWlnaHQiLCJ2aXNpYmlsaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixHQUFHQyw2QkFBT0MsR0FBVixvQkFHWixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLFNBQWhCO0FBQUEsQ0FITyxDQUF2Qjs7QUFPQSxJQUFNQyxlQUFlLEdBQUdMLDZCQUFPQyxHQUFWLG9CQUFyQjs7QUFNQUssbUJBQW1CLENBQUNDLElBQXBCLEdBQTJCLENBQUNDLGdDQUFELENBQTNCOztBQUVBLFNBQVNGLG1CQUFULENBQTZCRyxvQkFBN0IsRUFBbUQ7QUFDakQsTUFBTUMsWUFBWSxHQUFHLFNBQWZBLFlBQWU7QUFBQSxRQUNuQkMsT0FEbUIsUUFDbkJBLE9BRG1CO0FBQUEsUUFFbkJDLG9CQUZtQixRQUVuQkEsb0JBRm1CO0FBQUEsUUFHbkJDLEtBSG1CLFFBR25CQSxLQUhtQjtBQUFBLFFBSW5CQyxnQkFKbUIsUUFJbkJBLGdCQUptQjtBQUFBLGlDQUtuQkMsWUFMbUI7QUFBQSxRQUtuQkEsWUFMbUIsa0NBS0osTUFMSTtBQUFBLHdCQU9uQixnQ0FBQyxpQkFBRDtBQUFtQixNQUFBLFNBQVMsRUFBQztBQUE3QixvQkFDRSxnQ0FBQyx5QkFBRDtBQUFRLE1BQUEsSUFBSSxNQUFaO0FBQWEsTUFBQSxLQUFLLEVBQUMsTUFBbkI7QUFBMEIsTUFBQSxPQUFPLEVBQUVKO0FBQW5DLG9CQUNFLGdDQUFDLGdDQUFEO0FBQWUsTUFBQSxTQUFTLEVBQUM7QUFBekIsb0JBQ0UsZ0NBQUMsYUFBRDtBQUFRLE1BQUEsTUFBTSxFQUFFSTtBQUFoQixNQURGLENBREYsZUFJRSxnQ0FBQyxlQUFEO0FBQWlCLE1BQUEsS0FBSyxFQUFFO0FBQUNDLFFBQUFBLFVBQVUsRUFBRSxDQUFDRixnQkFBRCxHQUFvQixTQUFwQixHQUFnQztBQUE3QztBQUF4QixPQUNHRCxLQURILE1BSkYsQ0FERixFQVNHQyxnQkFBZ0IsZ0JBQ2YsZ0NBQUMsb0JBQUQ7QUFDRSxNQUFBLE1BQU0sRUFBRUgsT0FEVjtBQUVFLE1BQUEsb0JBQW9CLEVBQUVDLG9CQUZ4QjtBQUdFLE1BQUEsS0FBSyxFQUFFQztBQUhULE1BRGUsR0FNYixJQWZOLENBUG1CO0FBQUEsR0FBckI7O0FBeUJBLFNBQU9ILFlBQVA7QUFDRDs7ZUFDY0osbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgQW5pbWF0aW9uU3BlZWRTbGlkZXJGYWN0b3J5IGZyb20gJy4vYW5pbWF0aW9uLXNwZWVkLXNsaWRlcic7XG5pbXBvcnQge0J1dHRvbiwgQ2VudGVyRmxleGJveH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtSb2NrZXR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcblxuY29uc3QgU3R5bGVkU3BlZWRUb2dnbGUgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWdyb3c6IDA7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbmA7XG5cbmNvbnN0IFN0eWxlZFNwZWVkVGV4dCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2lkdGg6IDI0cHg7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG5gO1xuXG5TcGVlZENvbnRyb2xGYWN0b3J5LmRlcHMgPSBbQW5pbWF0aW9uU3BlZWRTbGlkZXJGYWN0b3J5XTtcblxuZnVuY3Rpb24gU3BlZWRDb250cm9sRmFjdG9yeShBbmltYXRpb25TcGVlZFNsaWRlcikge1xuICBjb25zdCBTcGVlZENvbnRyb2wgPSAoe1xuICAgIG9uQ2xpY2ssXG4gICAgdXBkYXRlQW5pbWF0aW9uU3BlZWQsXG4gICAgc3BlZWQsXG4gICAgc2hvd1NwZWVkQ29udHJvbCxcbiAgICBidXR0b25IZWlnaHQgPSAnMThweCdcbiAgfSkgPT4gKFxuICAgIDxTdHlsZWRTcGVlZFRvZ2dsZSBjbGFzc05hbWU9XCJhbmltYXRpb24tY29udHJvbF9fc3BlZWQtY29udHJvbFwiPlxuICAgICAgPEJ1dHRvbiBsaW5rIHdpZHRoPVwiODBweFwiIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICA8Q2VudGVyRmxleGJveCBjbGFzc05hbWU9XCJib3R0b20td2lkZ2V0X19pY29uIHNwZWVkXCI+XG4gICAgICAgICAgPFJvY2tldCBoZWlnaHQ9e2J1dHRvbkhlaWdodH0gLz5cbiAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICA8U3R5bGVkU3BlZWRUZXh0IHN0eWxlPXt7dmlzaWJpbGl0eTogIXNob3dTcGVlZENvbnRyb2wgPyAndmlzaWJsZScgOiAnaGlkZGVuJ319PlxuICAgICAgICAgIHtzcGVlZH14XG4gICAgICAgIDwvU3R5bGVkU3BlZWRUZXh0PlxuICAgICAgPC9CdXR0b24+XG4gICAgICB7c2hvd1NwZWVkQ29udHJvbCA/IChcbiAgICAgICAgPEFuaW1hdGlvblNwZWVkU2xpZGVyXG4gICAgICAgICAgb25IaWRlPXtvbkNsaWNrfVxuICAgICAgICAgIHVwZGF0ZUFuaW1hdGlvblNwZWVkPXt1cGRhdGVBbmltYXRpb25TcGVlZH1cbiAgICAgICAgICBzcGVlZD17c3BlZWR9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L1N0eWxlZFNwZWVkVG9nZ2xlPlxuICApO1xuICByZXR1cm4gU3BlZWRDb250cm9sO1xufVxuZXhwb3J0IGRlZmF1bHQgU3BlZWRDb250cm9sRmFjdG9yeTtcbiJdfQ==