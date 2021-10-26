"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = RangePlotFactory;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _d3Scale = require("d3-scale");

var _moment = _interopRequireDefault(require("moment"));

var _d3Array = require("d3-array");

var _reselect = require("reselect");

var _reactVis = require("react-vis");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _classnames = _interopRequireDefault(require("classnames"));

var _rangeBrush = _interopRequireDefault(require("./range-brush"));

var _filterUtils = require("../../utils/filter-utils");

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: #d3d8e0;\n  border-radius: 2px;\n  color: ", ";\n  font-size: 9px;\n  margin: 4px;\n  padding: 3px 6px;\n  pointer-events: none;\n  user-select: none;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .histogram-bars {\n    rect {\n      fill: ", ";\n    }\n    rect.in-range {\n      fill: ", ";\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .rv-xy-plot__inner path {\n    fill: none;\n    stroke-width: 1.5;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var chartMargin = {
  top: 8,
  bottom: 0,
  left: 0,
  right: 0
};
var chartH = 52;
var containerH = 68;
var histogramStyle = {
  highlightW: 0.7,
  unHighlightedW: 0.4
};
RangePlotFactory.deps = [_rangeBrush["default"]];

function RangePlotFactory(RangeBrush) {
  var RangePlot = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(RangePlot, _Component);

    var _super = _createSuper(RangePlot);

    function RangePlot() {
      var _this;

      (0, _classCallCheck2["default"])(this, RangePlot);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        hoveredDP: null
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "domainSelector", function (props) {
        return props.lineChart && props.lineChart.xDomain;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "hintFormatter", (0, _reselect.createSelector)(_this.domainSelector, function (domain) {
        return (0, _filterUtils.getTimeWidgetHintFormatter)(domain);
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onMouseMove", function (hoveredDP) {
        _this.setState({
          hoveredDP: hoveredDP
        });
      });
      return _this;
    }

    (0, _createClass2["default"])(RangePlot, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            onBrush = _this$props.onBrush,
            range = _this$props.range,
            value = _this$props.value,
            width = _this$props.width,
            plotType = _this$props.plotType,
            lineChart = _this$props.lineChart,
            histogram = _this$props.histogram;
        var domain = [histogram[0].x0, histogram[histogram.length - 1].x1];

        var brushComponent = /*#__PURE__*/_react["default"].createElement(RangeBrush, {
          domain: domain,
          onBrush: onBrush,
          range: range,
          value: value,
          width: width
        });

        return /*#__PURE__*/_react["default"].createElement("div", {
          style: {
            height: "".concat(containerH, "px"),
            position: 'relative'
          }
        }, plotType === 'lineChart' ? /*#__PURE__*/_react["default"].createElement(LineChart, {
          hoveredDP: this.state.hoveredDP,
          width: width,
          height: containerH,
          margin: chartMargin,
          children: brushComponent,
          onMouseMove: this.onMouseMove,
          yDomain: lineChart.yDomain,
          hintFormat: this.hintFormatter(this.props),
          data: lineChart.series
        }) : /*#__PURE__*/_react["default"].createElement(Histogram, {
          width: width,
          height: chartH,
          value: value,
          margin: chartMargin,
          histogram: histogram,
          brushComponent: brushComponent
        }));
      }
    }]);
    return RangePlot;
  }(_react.Component);

  (0, _defineProperty2["default"])(RangePlot, "propTypes", {
    value: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
    histogram: _propTypes["default"].arrayOf(_propTypes["default"].shape({
      x0: _propTypes["default"].number,
      x1: _propTypes["default"].number
    })),
    lineChart: _propTypes["default"].object,
    plotType: _propTypes["default"].string,
    isEnlarged: _propTypes["default"].bool,
    onBlur: _propTypes["default"].func,
    width: _propTypes["default"].number.isRequired
  });
  return RangePlot;
}

var Histogram = function Histogram(_ref) {
  var width = _ref.width,
      height = _ref.height,
      margin = _ref.margin,
      histogram = _ref.histogram,
      value = _ref.value,
      brushComponent = _ref.brushComponent;
  var domain = [histogram[0].x0, histogram[histogram.length - 1].x1];
  var barWidth = width / histogram.length;
  var x = (0, _d3Scale.scaleLinear)().domain(domain).range([0, width]);
  var y = (0, _d3Scale.scaleLinear)().domain([0, (0, _d3Array.max)(histogram, function (d) {
    return d.count;
  })]).range([0, height]);
  return /*#__PURE__*/_react["default"].createElement(HistogramWrapper, {
    width: width,
    height: height,
    style: {
      marginTop: "".concat(margin.top, "px")
    }
  }, /*#__PURE__*/_react["default"].createElement("g", {
    className: "histogram-bars"
  }, histogram.map(function (bar) {
    var inRange = bar.x0 >= value[0] && bar.x1 <= value[1];
    var wRatio = inRange ? histogramStyle.highlightW : histogramStyle.unHighlightedW;
    return /*#__PURE__*/_react["default"].createElement("rect", {
      className: (0, _classnames["default"])({
        'in-range': inRange
      }),
      key: bar.x0,
      height: y(bar.count),
      width: barWidth * wRatio,
      x: x(bar.x0) + barWidth * (1 - wRatio) / 2,
      rx: 1,
      ry: 1,
      y: height - y(bar.count)
    });
  })), brushComponent);
};

var LineChartWrapper = _styledComponents["default"].div(_templateObject());

var HistogramWrapper = _styledComponents["default"].svg(_templateObject2(), function (props) {
  return props.theme.histogramFillOutRange;
}, function (props) {
  return props.theme.histogramFillInRange;
});

var LineChart = function LineChart(_ref2) {
  var width = _ref2.width,
      height = _ref2.height,
      yDomain = _ref2.yDomain,
      hintFormat = _ref2.hintFormat,
      hoveredDP = _ref2.hoveredDP,
      margin = _ref2.margin,
      color = _ref2.color,
      data = _ref2.data,
      onMouseMove = _ref2.onMouseMove,
      children = _ref2.children;
  var brushData = [{
    x: data[0].x,
    y: yDomain[1],
    customComponent: function customComponent() {
      return children;
    }
  }];
  return /*#__PURE__*/_react["default"].createElement(LineChartWrapper, null, /*#__PURE__*/_react["default"].createElement(_reactVis.XYPlot, {
    width: width,
    height: height,
    margin: _objectSpread(_objectSpread({}, margin), {}, {
      bottom: 12
    })
  }, /*#__PURE__*/_react["default"].createElement(_reactVis.LineSeries, {
    strokeWidth: 2,
    color: color,
    data: data,
    onNearestX: onMouseMove
  }), /*#__PURE__*/_react["default"].createElement(_reactVis.MarkSeries, {
    data: hoveredDP ? [hoveredDP] : [],
    color: color,
    size: 3
  }), /*#__PURE__*/_react["default"].createElement(_reactVis.CustomSVGSeries, {
    data: brushData
  }), hoveredDP ? /*#__PURE__*/_react["default"].createElement(_reactVis.Hint, {
    value: hoveredDP
  }, /*#__PURE__*/_react["default"].createElement(HintContent, (0, _extends2["default"])({}, hoveredDP, {
    format: function format(val) {
      return _moment["default"].utc(val).format(hintFormat);
    }
  }))) : null));
};

var StyledHint = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.textColorLT;
});

var HintContent = function HintContent(_ref3) {
  var x = _ref3.x,
      y = _ref3.y,
      format = _ref3.format;
  return /*#__PURE__*/_react["default"].createElement(StyledHint, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "hint--x"
  }, format(x)), /*#__PURE__*/_react["default"].createElement("div", {
    className: "row"
  }, y));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9yYW5nZS1wbG90LmpzIl0sIm5hbWVzIjpbImNoYXJ0TWFyZ2luIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwiY2hhcnRIIiwiY29udGFpbmVySCIsImhpc3RvZ3JhbVN0eWxlIiwiaGlnaGxpZ2h0VyIsInVuSGlnaGxpZ2h0ZWRXIiwiUmFuZ2VQbG90RmFjdG9yeSIsImRlcHMiLCJSYW5nZUJydXNoRmFjdG9yeSIsIlJhbmdlQnJ1c2giLCJSYW5nZVBsb3QiLCJob3ZlcmVkRFAiLCJwcm9wcyIsImxpbmVDaGFydCIsInhEb21haW4iLCJkb21haW5TZWxlY3RvciIsImRvbWFpbiIsInNldFN0YXRlIiwib25CcnVzaCIsInJhbmdlIiwidmFsdWUiLCJ3aWR0aCIsInBsb3RUeXBlIiwiaGlzdG9ncmFtIiwieDAiLCJsZW5ndGgiLCJ4MSIsImJydXNoQ29tcG9uZW50IiwiaGVpZ2h0IiwicG9zaXRpb24iLCJzdGF0ZSIsIm9uTW91c2VNb3ZlIiwieURvbWFpbiIsImhpbnRGb3JtYXR0ZXIiLCJzZXJpZXMiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsInNoYXBlIiwib2JqZWN0Iiwic3RyaW5nIiwiaXNFbmxhcmdlZCIsImJvb2wiLCJvbkJsdXIiLCJmdW5jIiwiSGlzdG9ncmFtIiwibWFyZ2luIiwiYmFyV2lkdGgiLCJ4IiwieSIsImQiLCJjb3VudCIsIm1hcmdpblRvcCIsIm1hcCIsImJhciIsImluUmFuZ2UiLCJ3UmF0aW8iLCJMaW5lQ2hhcnRXcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwiSGlzdG9ncmFtV3JhcHBlciIsInN2ZyIsInRoZW1lIiwiaGlzdG9ncmFtRmlsbE91dFJhbmdlIiwiaGlzdG9ncmFtRmlsbEluUmFuZ2UiLCJMaW5lQ2hhcnQiLCJoaW50Rm9ybWF0IiwiY29sb3IiLCJkYXRhIiwiY2hpbGRyZW4iLCJicnVzaERhdGEiLCJjdXN0b21Db21wb25lbnQiLCJ2YWwiLCJtb21lbnQiLCJ1dGMiLCJmb3JtYXQiLCJTdHlsZWRIaW50IiwidGV4dENvbG9yTFQiLCJIaW50Q29udGVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxXQUFXLEdBQUc7QUFBQ0MsRUFBQUEsR0FBRyxFQUFFLENBQU47QUFBU0MsRUFBQUEsTUFBTSxFQUFFLENBQWpCO0FBQW9CQyxFQUFBQSxJQUFJLEVBQUUsQ0FBMUI7QUFBNkJDLEVBQUFBLEtBQUssRUFBRTtBQUFwQyxDQUFwQjtBQUNBLElBQU1DLE1BQU0sR0FBRyxFQUFmO0FBQ0EsSUFBTUMsVUFBVSxHQUFHLEVBQW5CO0FBQ0EsSUFBTUMsY0FBYyxHQUFHO0FBQ3JCQyxFQUFBQSxVQUFVLEVBQUUsR0FEUztBQUVyQkMsRUFBQUEsY0FBYyxFQUFFO0FBRkssQ0FBdkI7QUFLQUMsZ0JBQWdCLENBQUNDLElBQWpCLEdBQXdCLENBQUNDLHNCQUFELENBQXhCOztBQUVlLFNBQVNGLGdCQUFULENBQTBCRyxVQUExQixFQUFzQztBQUFBLE1BQzdDQyxTQUQ2QztBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsZ0dBaUJ6QztBQUNOQyxRQUFBQSxTQUFTLEVBQUU7QUFETCxPQWpCeUM7QUFBQSx5R0FxQmhDLFVBQUFDLEtBQUs7QUFBQSxlQUFJQSxLQUFLLENBQUNDLFNBQU4sSUFBbUJELEtBQUssQ0FBQ0MsU0FBTixDQUFnQkMsT0FBdkM7QUFBQSxPQXJCMkI7QUFBQSx3R0FzQmpDLDhCQUFlLE1BQUtDLGNBQXBCLEVBQW9DLFVBQUFDLE1BQU07QUFBQSxlQUN4RCw2Q0FBMkJBLE1BQTNCLENBRHdEO0FBQUEs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QUFpQixFQUE1QztBQUFnRCxJQUFBLEtBQUssRUFBRTBELEtBQXZEO0FBQThELElBQUEsSUFBSSxFQUFFO0FBQXBFLElBRkYsZUFHRSxnQ0FBQyx5QkFBRDtBQUFpQixJQUFBLElBQUksRUFBRUc7QUFBdkIsSUFIRixFQUlHN0QsU0FBUyxnQkFDUixnQ0FBQyxjQUFEO0FBQU0sSUFBQSxLQUFLLEVBQUVBO0FBQWIsa0JBQ0UsZ0NBQUMsV0FBRCxnQ0FBaUJBLFNBQWpCO0FBQTRCLElBQUEsTUFBTSxFQUFFLGdCQUFBK0QsR0FBRztBQUFBLGFBQUlDLG1CQUFPQyxHQUFQLENBQVdGLEdBQVgsRUFBZ0JHLE1BQWhCLENBQXVCVCxVQUF2QixDQUFKO0FBQUE7QUFBdkMsS0FERixDQURRLEdBSU4sSUFSTixDQURGLENBREY7QUFjRCxDQTVCRDs7QUE4QkEsSUFBTVUsVUFBVSxHQUFHbEIsNkJBQU9DLEdBQVYscUJBR0wsVUFBQWpELEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNvRCxLQUFOLENBQVllLFdBQWhCO0FBQUEsQ0FIQSxDQUFoQjs7QUFVQSxJQUFNQyxXQUFXLEdBQUcsU0FBZEEsV0FBYztBQUFBLE1BQUU5QixDQUFGLFNBQUVBLENBQUY7QUFBQSxNQUFLQyxDQUFMLFNBQUtBLENBQUw7QUFBQSxNQUFRMEIsTUFBUixTQUFRQSxNQUFSO0FBQUEsc0JBQ2xCLGdDQUFDLFVBQUQscUJBQ0U7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQTBCQSxNQUFNLENBQUMzQixDQUFELENBQWhDLENBREYsZUFFRTtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsS0FBc0JDLENBQXRCLENBRkYsQ0FEa0I7QUFBQSxDQUFwQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7c2NhbGVMaW5lYXJ9IGZyb20gJ2QzLXNjYWxlJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCB7bWF4fSBmcm9tICdkMy1hcnJheSc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQge0xpbmVTZXJpZXMsIFhZUGxvdCwgQ3VzdG9tU1ZHU2VyaWVzLCBIaW50LCBNYXJrU2VyaWVzfSBmcm9tICdyZWFjdC12aXMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IFJhbmdlQnJ1c2hGYWN0b3J5IGZyb20gJy4vcmFuZ2UtYnJ1c2gnO1xuaW1wb3J0IHtnZXRUaW1lV2lkZ2V0SGludEZvcm1hdHRlcn0gZnJvbSAndXRpbHMvZmlsdGVyLXV0aWxzJztcblxuY29uc3QgY2hhcnRNYXJnaW4gPSB7dG9wOiA4LCBib3R0b206IDAsIGxlZnQ6IDAsIHJpZ2h0OiAwfTtcbmNvbnN0IGNoYXJ0SCA9IDUyO1xuY29uc3QgY29udGFpbmVySCA9IDY4O1xuY29uc3QgaGlzdG9ncmFtU3R5bGUgPSB7XG4gIGhpZ2hsaWdodFc6IDAuNyxcbiAgdW5IaWdobGlnaHRlZFc6IDAuNFxufTtcblxuUmFuZ2VQbG90RmFjdG9yeS5kZXBzID0gW1JhbmdlQnJ1c2hGYWN0b3J5XTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmFuZ2VQbG90RmFjdG9yeShSYW5nZUJydXNoKSB7XG4gIGNsYXNzIFJhbmdlUGxvdCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIHZhbHVlOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubnVtYmVyKS5pc1JlcXVpcmVkLFxuICAgICAgaGlzdG9ncmFtOiBQcm9wVHlwZXMuYXJyYXlPZihcbiAgICAgICAgUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICB4MDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgICB4MTogUHJvcFR5cGVzLm51bWJlclxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIGxpbmVDaGFydDogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIHBsb3RUeXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgaXNFbmxhcmdlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgIGhvdmVyZWREUDogbnVsbFxuICAgIH07XG5cbiAgICBkb21haW5TZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmxpbmVDaGFydCAmJiBwcm9wcy5saW5lQ2hhcnQueERvbWFpbjtcbiAgICBoaW50Rm9ybWF0dGVyID0gY3JlYXRlU2VsZWN0b3IodGhpcy5kb21haW5TZWxlY3RvciwgZG9tYWluID0+XG4gICAgICBnZXRUaW1lV2lkZ2V0SGludEZvcm1hdHRlcihkb21haW4pXG4gICAgKTtcblxuICAgIG9uTW91c2VNb3ZlID0gaG92ZXJlZERQID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2hvdmVyZWREUH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7b25CcnVzaCwgcmFuZ2UsIHZhbHVlLCB3aWR0aCwgcGxvdFR5cGUsIGxpbmVDaGFydCwgaGlzdG9ncmFtfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBkb21haW4gPSBbaGlzdG9ncmFtWzBdLngwLCBoaXN0b2dyYW1baGlzdG9ncmFtLmxlbmd0aCAtIDFdLngxXTtcblxuICAgICAgY29uc3QgYnJ1c2hDb21wb25lbnQgPSAoXG4gICAgICAgIDxSYW5nZUJydXNoIGRvbWFpbj17ZG9tYWlufSBvbkJydXNoPXtvbkJydXNofSByYW5nZT17cmFuZ2V9IHZhbHVlPXt2YWx1ZX0gd2lkdGg9e3dpZHRofSAvPlxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBoZWlnaHQ6IGAke2NvbnRhaW5lckh9cHhgLFxuICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Bsb3RUeXBlID09PSAnbGluZUNoYXJ0JyA/IChcbiAgICAgICAgICAgIDxMaW5lQ2hhcnRcbiAgICAgICAgICAgICAgaG92ZXJlZERQPXt0aGlzLnN0YXRlLmhvdmVyZWREUH1cbiAgICAgICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAgICAgICBoZWlnaHQ9e2NvbnRhaW5lckh9XG4gICAgICAgICAgICAgIG1hcmdpbj17Y2hhcnRNYXJnaW59XG4gICAgICAgICAgICAgIGNoaWxkcmVuPXticnVzaENvbXBvbmVudH1cbiAgICAgICAgICAgICAgb25Nb3VzZU1vdmU9e3RoaXMub25Nb3VzZU1vdmV9XG4gICAgICAgICAgICAgIHlEb21haW49e2xpbmVDaGFydC55RG9tYWlufVxuICAgICAgICAgICAgICBoaW50Rm9ybWF0PXt0aGlzLmhpbnRGb3JtYXR0ZXIodGhpcy5wcm9wcyl9XG4gICAgICAgICAgICAgIGRhdGE9e2xpbmVDaGFydC5zZXJpZXN9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8SGlzdG9ncmFtXG4gICAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgICAgaGVpZ2h0PXtjaGFydEh9XG4gICAgICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgICAgbWFyZ2luPXtjaGFydE1hcmdpbn1cbiAgICAgICAgICAgICAgaGlzdG9ncmFtPXtoaXN0b2dyYW19XG4gICAgICAgICAgICAgIGJydXNoQ29tcG9uZW50PXticnVzaENvbXBvbmVudH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gUmFuZ2VQbG90O1xufVxuXG5jb25zdCBIaXN0b2dyYW0gPSAoe3dpZHRoLCBoZWlnaHQsIG1hcmdpbiwgaGlzdG9ncmFtLCB2YWx1ZSwgYnJ1c2hDb21wb25lbnR9KSA9PiB7XG4gIGNvbnN0IGRvbWFpbiA9IFtoaXN0b2dyYW1bMF0ueDAsIGhpc3RvZ3JhbVtoaXN0b2dyYW0ubGVuZ3RoIC0gMV0ueDFdO1xuICBjb25zdCBiYXJXaWR0aCA9IHdpZHRoIC8gaGlzdG9ncmFtLmxlbmd0aDtcblxuICBjb25zdCB4ID0gc2NhbGVMaW5lYXIoKVxuICAgIC5kb21haW4oZG9tYWluKVxuICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICBjb25zdCB5ID0gc2NhbGVMaW5lYXIoKVxuICAgIC5kb21haW4oWzAsIG1heChoaXN0b2dyYW0sIGQgPT4gZC5jb3VudCldKVxuICAgIC5yYW5nZShbMCwgaGVpZ2h0XSk7XG5cbiAgcmV0dXJuIChcbiAgICA8SGlzdG9ncmFtV3JhcHBlciB3aWR0aD17d2lkdGh9IGhlaWdodD17aGVpZ2h0fSBzdHlsZT17e21hcmdpblRvcDogYCR7bWFyZ2luLnRvcH1weGB9fT5cbiAgICAgIDxnIGNsYXNzTmFtZT1cImhpc3RvZ3JhbS1iYXJzXCI+XG4gICAgICAgIHtoaXN0b2dyYW0ubWFwKGJhciA9PiB7XG4gICAgICAgICAgY29uc3QgaW5SYW5nZSA9IGJhci54MCA+PSB2YWx1ZVswXSAmJiBiYXIueDEgPD0gdmFsdWVbMV07XG4gICAgICAgICAgY29uc3Qgd1JhdGlvID0gaW5SYW5nZSA/IGhpc3RvZ3JhbVN0eWxlLmhpZ2hsaWdodFcgOiBoaXN0b2dyYW1TdHlsZS51bkhpZ2hsaWdodGVkVztcblxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoeydpbi1yYW5nZSc6IGluUmFuZ2V9KX1cbiAgICAgICAgICAgICAga2V5PXtiYXIueDB9XG4gICAgICAgICAgICAgIGhlaWdodD17eShiYXIuY291bnQpfVxuICAgICAgICAgICAgICB3aWR0aD17YmFyV2lkdGggKiB3UmF0aW99XG4gICAgICAgICAgICAgIHg9e3goYmFyLngwKSArIChiYXJXaWR0aCAqICgxIC0gd1JhdGlvKSkgLyAyfVxuICAgICAgICAgICAgICByeD17MX1cbiAgICAgICAgICAgICAgcnk9ezF9XG4gICAgICAgICAgICAgIHk9e2hlaWdodCAtIHkoYmFyLmNvdW50KX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L2c+XG4gICAgICB7YnJ1c2hDb21wb25lbnR9XG4gICAgPC9IaXN0b2dyYW1XcmFwcGVyPlxuICApO1xufTtcblxuY29uc3QgTGluZUNoYXJ0V3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIC5ydi14eS1wbG90X19pbm5lciBwYXRoIHtcbiAgICBmaWxsOiBub25lO1xuICAgIHN0cm9rZS13aWR0aDogMS41O1xuICB9XG5gO1xuXG5jb25zdCBIaXN0b2dyYW1XcmFwcGVyID0gc3R5bGVkLnN2Z2BcbiAgLmhpc3RvZ3JhbS1iYXJzIHtcbiAgICByZWN0IHtcbiAgICAgIGZpbGw6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaGlzdG9ncmFtRmlsbE91dFJhbmdlfTtcbiAgICB9XG4gICAgcmVjdC5pbi1yYW5nZSB7XG4gICAgICBmaWxsOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmhpc3RvZ3JhbUZpbGxJblJhbmdlfTtcbiAgICB9XG4gIH1cbmA7XG5jb25zdCBMaW5lQ2hhcnQgPSAoe1xuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICB5RG9tYWluLFxuICBoaW50Rm9ybWF0LFxuICBob3ZlcmVkRFAsXG4gIG1hcmdpbixcbiAgY29sb3IsXG4gIGRhdGEsXG4gIG9uTW91c2VNb3ZlLFxuICBjaGlsZHJlblxufSkgPT4ge1xuICBjb25zdCBicnVzaERhdGEgPSBbe3g6IGRhdGFbMF0ueCwgeTogeURvbWFpblsxXSwgY3VzdG9tQ29tcG9uZW50OiAoKSA9PiBjaGlsZHJlbn1dO1xuXG4gIHJldHVybiAoXG4gICAgPExpbmVDaGFydFdyYXBwZXI+XG4gICAgICA8WFlQbG90IHdpZHRoPXt3aWR0aH0gaGVpZ2h0PXtoZWlnaHR9IG1hcmdpbj17ey4uLm1hcmdpbiwgYm90dG9tOiAxMn19PlxuICAgICAgICA8TGluZVNlcmllcyBzdHJva2VXaWR0aD17Mn0gY29sb3I9e2NvbG9yfSBkYXRhPXtkYXRhfSBvbk5lYXJlc3RYPXtvbk1vdXNlTW92ZX0gLz5cbiAgICAgICAgPE1hcmtTZXJpZXMgZGF0YT17aG92ZXJlZERQID8gW2hvdmVyZWREUF0gOiBbXX0gY29sb3I9e2NvbG9yfSBzaXplPXszfSAvPlxuICAgICAgICA8Q3VzdG9tU1ZHU2VyaWVzIGRhdGE9e2JydXNoRGF0YX0gLz5cbiAgICAgICAge2hvdmVyZWREUCA/IChcbiAgICAgICAgICA8SGludCB2YWx1ZT17aG92ZXJlZERQfT5cbiAgICAgICAgICAgIDxIaW50Q29udGVudCB7Li4uaG92ZXJlZERQfSBmb3JtYXQ9e3ZhbCA9PiBtb21lbnQudXRjKHZhbCkuZm9ybWF0KGhpbnRGb3JtYXQpfSAvPlxuICAgICAgICAgIDwvSGludD5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L1hZUGxvdD5cbiAgICA8L0xpbmVDaGFydFdyYXBwZXI+XG4gICk7XG59O1xuXG5jb25zdCBTdHlsZWRIaW50ID0gc3R5bGVkLmRpdmBcbiAgYmFja2dyb3VuZC1jb2xvcjogI2QzZDhlMDtcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gIGZvbnQtc2l6ZTogOXB4O1xuICBtYXJnaW46IDRweDtcbiAgcGFkZGluZzogM3B4IDZweDtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuYDtcbmNvbnN0IEhpbnRDb250ZW50ID0gKHt4LCB5LCBmb3JtYXR9KSA9PiAoXG4gIDxTdHlsZWRIaW50PlxuICAgIDxkaXYgY2xhc3NOYW1lPVwiaGludC0teFwiPntmb3JtYXQoeCl9PC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj57eX08L2Rpdj5cbiAgPC9TdHlsZWRIaW50PlxuKTtcbiJdfQ==