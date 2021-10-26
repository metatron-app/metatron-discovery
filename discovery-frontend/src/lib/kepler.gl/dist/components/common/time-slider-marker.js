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

var _d3Scale = require("d3-scale");

var _d3Selection = require("d3-selection");

var _d3Axis = require("d3-axis");

var _reselect = require("reselect");

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  pointer-events: none;\n  position: absolute;\n\n  .axis text {\n    font-size: 9px;\n    fill: ", ";\n  }\n\n  .axis line,\n  .axis path {\n    fill: none;\n    stroke: ", ";\n    shape-rendering: crispEdges;\n    stroke-width: 2;\n  }\n\n  .axis .domain {\n    display: none;\n  }\n\n  .value {\n    fill: ", ";\n    font-size: 10px;\n\n    &.start {\n      text-anchor: start;\n    }\n\n    &.end {\n      text-anchor: end;\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var MIN_TICK_WIDTH = 50;

var TimeSliderContainer = _styledComponents["default"].svg(_templateObject(), function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.sliderBarBgd;
}, function (props) {
  return props.theme.textColor;
});

var height = 30;

function TimeSliderMarkerFactory() {
  var TimeSliderMarker = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TimeSliderMarker, _Component);

    var _super = _createSuper(TimeSliderMarker);

    function TimeSliderMarker() {
      var _this;

      (0, _classCallCheck2["default"])(this, TimeSliderMarker);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "xAxis", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "domainSelector", function (props) {
        return props.domain;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "widthSelector", function (props) {
        return props.width;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "scaleSelector", (0, _reselect.createSelector)(_this.domainSelector, _this.widthSelector, function (domain, width) {
        return Array.isArray(domain) ? (0, _d3Scale.scaleUtc)().domain(domain).range([0, width]) : null;
      }));
      return _this;
    }

    (0, _createClass2["default"])(TimeSliderMarker, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._updateAxis(this.scaleSelector(this.props));
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (this.scaleSelector(this.props) !== this.scaleSelector(prevProps)) {
          this._updateAxis(this.scaleSelector(this.props));
        }
      }
    }, {
      key: "_updateAxis",
      value: function _updateAxis(scale) {
        if (!scale) {
          return;
        } // TODO: pass in ticks if interval is defined


        var ticks = Math.floor(this.props.width / MIN_TICK_WIDTH);
        var xAxis = (0, _d3Axis.axisBottom)(scale).ticks(ticks).tickSize(8).tickPadding(6);
        (0, _d3Selection.select)(this.xAxis.current).call(xAxis);
      }
    }, {
      key: "render",
      value: function render() {
        return /*#__PURE__*/_react["default"].createElement(TimeSliderContainer, {
          className: "time-slider-marker",
          width: this.props.width,
          height: height
        }, /*#__PURE__*/_react["default"].createElement("g", {
          className: "x axis",
          ref: this.xAxis,
          transform: "translate(0, 0)"
        }));
      }
    }]);
    return TimeSliderMarker;
  }(_react.Component);

  (0, _defineProperty2["default"])(TimeSliderMarker, "propTypes", {
    domain: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    width: _propTypes["default"].number.isRequired
  });
  return TimeSliderMarker;
}

var _default = TimeSliderMarkerFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi90aW1lLXNsaWRlci1tYXJrZXIuanMiXSwibmFtZXMiOlsiTUlOX1RJQ0tfV0lEVEgiLCJUaW1lU2xpZGVyQ29udGFpbmVyIiwic3R5bGVkIiwic3ZnIiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvciIsInNsaWRlckJhckJnZCIsImhlaWdodCIsIlRpbWVTbGlkZXJNYXJrZXJGYWN0b3J5IiwiVGltZVNsaWRlck1hcmtlciIsImRvbWFpbiIsIndpZHRoIiwiZG9tYWluU2VsZWN0b3IiLCJ3aWR0aFNlbGVjdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwicmFuZ2UiLCJfdXBkYXRlQXhpcyIsInNjYWxlU2VsZWN0b3IiLCJwcmV2UHJvcHMiLCJzY2FsZSIsInRpY2tzIiwiTWF0aCIsImZsb29yIiwieEF4aXMiLCJ0aWNrU2l6ZSIsInRpY2tQYWRkaW5nIiwiY3VycmVudCIsImNhbGwiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwiYW55IiwiaXNSZXF1aXJlZCIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsY0FBYyxHQUFHLEVBQXZCOztBQUVBLElBQU1DLG1CQUFtQixHQUFHQyw2QkFBT0MsR0FBVixvQkFNYixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLFNBQWhCO0FBQUEsQ0FOUSxFQVlYLFVBQUFGLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUUsWUFBaEI7QUFBQSxDQVpNLEVBc0JiLFVBQUFILEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsU0FBaEI7QUFBQSxDQXRCUSxDQUF6Qjs7QUFtQ0EsSUFBTUUsTUFBTSxHQUFHLEVBQWY7O0FBRUEsU0FBU0MsdUJBQVQsR0FBbUM7QUFBQSxNQUMzQkMsZ0JBRDJCO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSw2R0FpQnZCLHVCQWpCdUI7QUFBQSx5R0FtQmQsVUFBQU4sS0FBSztBQUFBLGVBQUlBLEtBQUssQ0FBQ08sTUFBVjtBQUFBLE9BbkJTO0FBQUEsd0dBb0JmLFVBQUFQLEtBQUs7QUFBQSxlQUFJQSxLQUFLLENBQUNRLEtBQVY7QUFBQSxPQXBCVTtBQUFBLHdHQXFCZiw4QkFBZSxNQUFLQyxjQUFwQixFQUFvQyxNQUFLQyxhQUF6QyxFQUF3RCxVQUFDSCxNQUFELEVBQVNDLEtBQVQ7QUFBQSxlQUN0RUcsS0FBSyxDQUFDQyxPQUFOLENBQWNMLE1BQWQsSUFDSSx5QkFDR0EsTUFESCxDQUNVQSxNQURWLEVBRUdNLEtBRkgsQ0FFUyxDQUFDLENBQUQsRUFBSUwsS0FBSixDQUZULENBREosR0FJSSxJQUxrRTtBQUFBLE9BQXhELENBckJlO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsMENBT1g7QUFDbEIsYUFBS00sV0FBTCxDQUFpQixLQUFLQyxhQUFMLENBQW1CLEtBQUtmLEtBQXhCLENBQWpCO0FBQ0Q7QUFUOEI7QUFBQTtBQUFBLHlDQVdaZ0IsU0FYWSxFQVdEO0FBQzVCLFlBQUksS0FBS0QsYUFBTCxDQUFtQixLQUFLZixLQUF4QixNQUFtQyxLQUFLZSxhQUFMLENBQW1CQyxTQUFuQixDQUF2QyxFQUFzRTtBQUNwRSxlQUFLRixXQUFMLENBQWlCLEtBQUtDLGFBQUwsQ0FBbUIsS0FBS2YsS0FBeEIsQ0FBakI7QUFDRDtBQUNGO0FBZjhCO0FBQUE7QUFBQSxrQ0E2Qm5CaUIsS0E3Qm1CLEVBNkJaO0FBQ2pCLFlBQUksQ0FBQ0EsS0FBTCxFQUFZO0FBQ1Y7QUFDRCxTQUhnQixDQUtqQjs7O0FBQ0EsWUFBTUMsS0FBSyxHQUFHQyxJQUFJLENBQUNDLEtBQUwsQ0FBVyxLQUFLcEIsS0FBTCxDQUFXUSxLQUFYLEdBQW1CWixjQUE5QixDQUFkO0FBRUEsWUFBTXlCLEtBQUssR0FBRyx3QkFBV0osS0FBWCxFQUNYQyxLQURXLENBQ0xBLEtBREssRUFFWEksUUFGVyxDQUVGLENBRkUsRUFHWEMsV0FIVyxDQUdDLENBSEQsQ0FBZDtBQUtBLGlDQUFPLEtBQUtGLEtBQUwsQ0FBV0csT0FBbEIsRUFBMkJDLElBQTNCLENBQWdDSixLQUFoQztBQUNEO0FBM0M4QjtBQUFBO0FBQUEsK0JBNkN0QjtBQUNQLDRCQUNFLGdDQUFDLG1CQUFEO0FBQ0UsVUFBQSxTQUFTLEVBQUMsb0JBRFo7QUFFRSxVQUFBLEtBQUssRUFBRSxLQUFLckIsS0FBTCxDQUFXUSxLQUZwQjtBQUdFLFVBQUEsTUFBTSxFQUFFSjtBQUhWLHdCQUtFO0FBQUcsVUFBQSxTQUFTLEVBQUMsUUFBYjtBQUFzQixVQUFBLEdBQUcsRUFBRSxLQUFLaUIsS0FBaEM7QUFBdUMsVUFBQSxTQUFTLEVBQUM7QUFBakQsVUFMRixDQURGO0FBU0Q7QUF2RDhCO0FBQUE7QUFBQSxJQUNGSyxnQkFERTs7QUFBQSxtQ0FDM0JwQixnQkFEMkIsZUFFWjtBQUNqQkMsSUFBQUEsTUFBTSxFQUFFb0Isc0JBQVVDLE9BQVYsQ0FBa0JELHNCQUFVRSxHQUE1QixFQUFpQ0MsVUFEeEI7QUFFakJ0QixJQUFBQSxLQUFLLEVBQUVtQixzQkFBVUksTUFBVixDQUFpQkQ7QUFGUCxHQUZZO0FBMERqQyxTQUFPeEIsZ0JBQVA7QUFDRDs7ZUFFY0QsdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnQsIGNyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7c2NhbGVVdGN9IGZyb20gJ2QzLXNjYWxlJztcbmltcG9ydCB7c2VsZWN0fSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IHtheGlzQm90dG9tfSBmcm9tICdkMy1heGlzJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuXG5jb25zdCBNSU5fVElDS19XSURUSCA9IDUwO1xuXG5jb25zdCBUaW1lU2xpZGVyQ29udGFpbmVyID0gc3R5bGVkLnN2Z2BcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblxuICAuYXhpcyB0ZXh0IHtcbiAgICBmb250LXNpemU6IDlweDtcbiAgICBmaWxsOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gIH1cblxuICAuYXhpcyBsaW5lLFxuICAuYXhpcyBwYXRoIHtcbiAgICBmaWxsOiBub25lO1xuICAgIHN0cm9rZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zbGlkZXJCYXJCZ2R9O1xuICAgIHNoYXBlLXJlbmRlcmluZzogY3Jpc3BFZGdlcztcbiAgICBzdHJva2Utd2lkdGg6IDI7XG4gIH1cblxuICAuYXhpcyAuZG9tYWluIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG5cbiAgLnZhbHVlIHtcbiAgICBmaWxsOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gICAgZm9udC1zaXplOiAxMHB4O1xuXG4gICAgJi5zdGFydCB7XG4gICAgICB0ZXh0LWFuY2hvcjogc3RhcnQ7XG4gICAgfVxuXG4gICAgJi5lbmQge1xuICAgICAgdGV4dC1hbmNob3I6IGVuZDtcbiAgICB9XG4gIH1cbmA7XG5cbmNvbnN0IGhlaWdodCA9IDMwO1xuXG5mdW5jdGlvbiBUaW1lU2xpZGVyTWFya2VyRmFjdG9yeSgpIHtcbiAgY2xhc3MgVGltZVNsaWRlck1hcmtlciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIGRvbWFpbjogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWRcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl91cGRhdGVBeGlzKHRoaXMuc2NhbGVTZWxlY3Rvcih0aGlzLnByb3BzKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgICAgaWYgKHRoaXMuc2NhbGVTZWxlY3Rvcih0aGlzLnByb3BzKSAhPT0gdGhpcy5zY2FsZVNlbGVjdG9yKHByZXZQcm9wcykpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQXhpcyh0aGlzLnNjYWxlU2VsZWN0b3IodGhpcy5wcm9wcykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHhBeGlzID0gY3JlYXRlUmVmKCk7XG5cbiAgICBkb21haW5TZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmRvbWFpbjtcbiAgICB3aWR0aFNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMud2lkdGg7XG4gICAgc2NhbGVTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKHRoaXMuZG9tYWluU2VsZWN0b3IsIHRoaXMud2lkdGhTZWxlY3RvciwgKGRvbWFpbiwgd2lkdGgpID0+XG4gICAgICBBcnJheS5pc0FycmF5KGRvbWFpbilcbiAgICAgICAgPyBzY2FsZVV0YygpXG4gICAgICAgICAgICAuZG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKVxuICAgICAgICA6IG51bGxcbiAgICApO1xuXG4gICAgX3VwZGF0ZUF4aXMoc2NhbGUpIHtcbiAgICAgIGlmICghc2NhbGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBwYXNzIGluIHRpY2tzIGlmIGludGVydmFsIGlzIGRlZmluZWRcbiAgICAgIGNvbnN0IHRpY2tzID0gTWF0aC5mbG9vcih0aGlzLnByb3BzLndpZHRoIC8gTUlOX1RJQ0tfV0lEVEgpO1xuXG4gICAgICBjb25zdCB4QXhpcyA9IGF4aXNCb3R0b20oc2NhbGUpXG4gICAgICAgIC50aWNrcyh0aWNrcylcbiAgICAgICAgLnRpY2tTaXplKDgpXG4gICAgICAgIC50aWNrUGFkZGluZyg2KTtcblxuICAgICAgc2VsZWN0KHRoaXMueEF4aXMuY3VycmVudCkuY2FsbCh4QXhpcyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRpbWVTbGlkZXJDb250YWluZXJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0aW1lLXNsaWRlci1tYXJrZXJcIlxuICAgICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofVxuICAgICAgICAgIGhlaWdodD17aGVpZ2h0fVxuICAgICAgICA+XG4gICAgICAgICAgPGcgY2xhc3NOYW1lPVwieCBheGlzXCIgcmVmPXt0aGlzLnhBeGlzfSB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMCwgMClcIiAvPlxuICAgICAgICA8L1RpbWVTbGlkZXJDb250YWluZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBUaW1lU2xpZGVyTWFya2VyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBUaW1lU2xpZGVyTWFya2VyRmFjdG9yeTtcbiJdfQ==