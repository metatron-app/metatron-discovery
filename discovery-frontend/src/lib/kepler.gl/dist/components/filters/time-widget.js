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

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reselect = require("reselect");

var _styledComponents2 = require("../common/styled-components");

var _icons = require("../common/icons");

var _speedControl = _interopRequireDefault(require("../common/animation-control/speed-control"));

var _timeRangeFilter = _interopRequireDefault(require("./time-range-filter"));

var _floatingTimeDisplay = _interopRequireDefault(require("../common/animation-control/floating-time-display"));

var _fieldSelector = _interopRequireDefault(require("../common/field-selector"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  flex-grow: 0;\n  color: ", ";\n  margin-right: 10px;\n\n  .bottom-widget__icon {\n    margin-right: 6px;\n  }\n  .bottom-widget__icon.speed {\n    margin-right: 0;\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n  color: ", ";\n  height: ", ";\n\n  .bottom-widget__y-axis {\n    flex-grow: 1;\n    margin-left: 20px;\n  }\n\n  .bottom-widget__field-select {\n    width: 160px;\n    display: inline-block;\n\n    .item-selector__dropdown {\n      background: transparent;\n      padding: 4px 10px 4px 4px;\n      border-color: transparent;\n\n      :active,\n      :focus,\n      &.focus,\n      &.active {\n        background: transparent;\n        border-color: transparent;\n      }\n    }\n\n    .item-selector__dropdown:hover {\n      background: transparent;\n      border-color: transparent;\n\n      .item-selector__dropdown__value {\n        color: ", ";\n      }\n    }\n  }\n\n  .animation-control__speed-control {\n    margin-right: -12px;\n\n    .animation-control__speed-slider {\n      right: calc(0% - 48px);\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding: 6px 32px 16px 32px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var TOP_SECTION_HEIGHT = '36px';
var TimeBottomWidgetInner = (0, _styledComponents["default"])(_styledComponents2.BottomWidgetInner)(_templateObject());

var TopSectionWrapper = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.labelColor;
}, TOP_SECTION_HEIGHT, function (props) {
  return props.hoverColor ? props.theme[props.hoverColor] : props.theme.textColorHl;
});

var StyledTitle = (0, _styledComponents["default"])(_styledComponents2.CenterFlexbox)(_templateObject3(), function (props) {
  return props.theme.textColor;
});
TimeWidgetFactory.deps = [_speedControl["default"], _timeRangeFilter["default"], _floatingTimeDisplay["default"], _fieldSelector["default"]];

function TimeWidgetFactory(SpeedControl, TimeRangeFilter, FloatingTimeDisplay, FieldSelector) {
  var TimeWidget = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TimeWidget, _Component);

    var _super = _createSuper(TimeWidget);

    function TimeWidget() {
      var _this;

      (0, _classCallCheck2["default"])(this, TimeWidget);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        showSpeedControl: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldSelector", function (props) {
        return props.fields;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "yAxisFieldsSelector", (0, _reselect.createSelector)(_this.fieldSelector, function (fields) {
        return fields.filter(function (f) {
          return f.type === 'integer' || f.type === 'real';
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateAnimationSpeed", function (speed) {
        return _this.props.updateAnimationSpeed(_this.props.index, speed);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleSpeedControl", function () {
        return _this.setState({
          showSpeedControl: !_this.state.showSpeedControl
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_setFilterPlotYAxis", function (value) {
        return _this.props.setFilterPlot(_this.props.index, {
          yAxis: value
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateAnimationSpeed", function (speed) {
        return _this.props.updateAnimationSpeed(_this.props.index, speed);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleAnimation", function () {
        return _this.props.toggleAnimation(_this.props.index);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClose", function () {
        return _this.props.enlargeFilter(_this.props.index);
      });
      return _this;
    }

    (0, _createClass2["default"])(TimeWidget, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            datasets = _this$props.datasets,
            filter = _this$props.filter,
            index = _this$props.index,
            readOnly = _this$props.readOnly,
            _setFilter = _this$props.setFilter,
            showTimeDisplay = _this$props.showTimeDisplay;
        var showSpeedControl = this.state.showSpeedControl;
        return /*#__PURE__*/_react["default"].createElement(TimeBottomWidgetInner, {
          className: "bottom-widget--inner"
        }, /*#__PURE__*/_react["default"].createElement(TopSectionWrapper, null, /*#__PURE__*/_react["default"].createElement(StyledTitle, {
          className: "bottom-widget__field"
        }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, {
          className: "bottom-widget__icon"
        }, /*#__PURE__*/_react["default"].createElement(_icons.Clock, {
          height: "15px"
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectTextBold, null, filter.name)), /*#__PURE__*/_react["default"].createElement(StyledTitle, {
          className: "bottom-widget__y-axis"
        }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, {
          className: "bottom-widget__icon"
        }, /*#__PURE__*/_react["default"].createElement(_icons.LineChart, {
          height: "15px"
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "bottom-widget__field-select"
        }, /*#__PURE__*/_react["default"].createElement(FieldSelector, {
          fields: this.yAxisFieldsSelector(datasets[filter.dataId[0]]),
          placement: "top",
          id: "selected-time-widget-field",
          value: filter.yAxis ? filter.yAxis.name : null,
          onSelect: this._setFilterPlotYAxis,
          placeholder: "placeholder.yAxis",
          erasable: true,
          showToken: false
        }))), /*#__PURE__*/_react["default"].createElement(StyledTitle, {
          className: "bottom-widget__speed"
        }, /*#__PURE__*/_react["default"].createElement(SpeedControl, {
          onClick: this._toggleSpeedControl,
          showSpeedControl: showSpeedControl,
          updateAnimationSpeed: this._updateAnimationSpeed,
          speed: filter.speed
        })), !readOnly ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.IconRoundSmall, null, /*#__PURE__*/_react["default"].createElement(_icons.Close, {
          height: "12px",
          onClick: this._onClose
        }))) : null), /*#__PURE__*/_react["default"].createElement(TimeRangeFilter, {
          filter: filter,
          setFilter: function setFilter(value) {
            return _setFilter(index, 'value', value);
          },
          toggleAnimation: this._toggleAnimation,
          hideTimeTitle: showTimeDisplay,
          isAnimatable: true
        }), showTimeDisplay ? /*#__PURE__*/_react["default"].createElement(FloatingTimeDisplay, {
          currentTime: filter.value
        }) : null);
      }
    }]);
    return TimeWidget;
  }(_react.Component);

  return TimeWidget;
}

var _default = TimeWidgetFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlcnMvdGltZS13aWRnZXQuanMiXSwibmFtZXMiOlsiVE9QX1NFQ1RJT05fSEVJR0hUIiwiVGltZUJvdHRvbVdpZGdldElubmVyIiwiQm90dG9tV2lkZ2V0SW5uZXIiLCJUb3BTZWN0aW9uV3JhcHBlciIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJsYWJlbENvbG9yIiwiaG92ZXJDb2xvciIsInRleHRDb2xvckhsIiwiU3R5bGVkVGl0bGUiLCJDZW50ZXJGbGV4Ym94IiwidGV4dENvbG9yIiwiVGltZVdpZGdldEZhY3RvcnkiLCJkZXBzIiwiU3BlZWRDb250cm9sRmFjdG9yeSIsIlRpbWVSYW5nZUZpbHRlckZhY3RvcnkiLCJGbG9hdGluZ1RpbWVEaXNwbGF5RmFjdG9yeSIsIkZpZWxkU2VsZWN0b3JGYWN0b3J5IiwiU3BlZWRDb250cm9sIiwiVGltZVJhbmdlRmlsdGVyIiwiRmxvYXRpbmdUaW1lRGlzcGxheSIsIkZpZWxkU2VsZWN0b3IiLCJUaW1lV2lkZ2V0Iiwic2hvd1NwZWVkQ29udHJvbCIsImZpZWxkcyIsImZpZWxkU2VsZWN0b3IiLCJmaWx0ZXIiLCJmIiwidHlwZSIsInNwZWVkIiwidXBkYXRlQW5pbWF0aW9uU3BlZWQiLCJpbmRleCIsInNldFN0YXRlIiwic3RhdGUiLCJ2YWx1ZSIsInNldEZpbHRlclBsb3QiLCJ5QXhpcyIsInRvZ2dsZUFuaW1hdGlvbiIsImVubGFyZ2VGaWx0ZXIiLCJkYXRhc2V0cyIsInJlYWRPbmx5Iiwic2V0RmlsdGVyIiwic2hvd1RpbWVEaXNwbGF5IiwibmFtZSIsInlBeGlzRmllbGRzU2VsZWN0b3IiLCJkYXRhSWQiLCJfc2V0RmlsdGVyUGxvdFlBeGlzIiwiX3RvZ2dsZVNwZWVkQ29udHJvbCIsIl91cGRhdGVBbmltYXRpb25TcGVlZCIsIl9vbkNsb3NlIiwiX3RvZ2dsZUFuaW1hdGlvbiIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7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aUY1RixTQUFPN0IsVUFBUDtBQUNEOztlQUVjVixpQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5cbmltcG9ydCB7XG4gIFNlbGVjdFRleHRCb2xkLFxuICBJY29uUm91bmRTbWFsbCxcbiAgQ2VudGVyRmxleGJveCxcbiAgQm90dG9tV2lkZ2V0SW5uZXJcbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtDbG9zZSwgQ2xvY2ssIExpbmVDaGFydH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IFNwZWVkQ29udHJvbEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9jb21tb24vYW5pbWF0aW9uLWNvbnRyb2wvc3BlZWQtY29udHJvbCc7XG5pbXBvcnQgVGltZVJhbmdlRmlsdGVyRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2ZpbHRlcnMvdGltZS1yYW5nZS1maWx0ZXInO1xuaW1wb3J0IEZsb2F0aW5nVGltZURpc3BsYXlGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2FuaW1hdGlvbi1jb250cm9sL2Zsb2F0aW5nLXRpbWUtZGlzcGxheSc7XG5pbXBvcnQgRmllbGRTZWxlY3RvckZhY3RvcnkgZnJvbSAnLi4vY29tbW9uL2ZpZWxkLXNlbGVjdG9yJztcblxuY29uc3QgVE9QX1NFQ1RJT05fSEVJR0hUID0gJzM2cHgnO1xuXG5jb25zdCBUaW1lQm90dG9tV2lkZ2V0SW5uZXIgPSBzdHlsZWQoQm90dG9tV2lkZ2V0SW5uZXIpYFxuICBwYWRkaW5nOiA2cHggMzJweCAxNnB4IDMycHg7XG5gO1xuY29uc3QgVG9wU2VjdGlvbldyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIHdpZHRoOiAxMDAlO1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5sYWJlbENvbG9yfTtcbiAgaGVpZ2h0OiAke1RPUF9TRUNUSU9OX0hFSUdIVH07XG5cbiAgLmJvdHRvbS13aWRnZXRfX3ktYXhpcyB7XG4gICAgZmxleC1ncm93OiAxO1xuICAgIG1hcmdpbi1sZWZ0OiAyMHB4O1xuICB9XG5cbiAgLmJvdHRvbS13aWRnZXRfX2ZpZWxkLXNlbGVjdCB7XG4gICAgd2lkdGg6IDE2MHB4O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcblxuICAgIC5pdGVtLXNlbGVjdG9yX19kcm9wZG93biB7XG4gICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICAgIHBhZGRpbmc6IDRweCAxMHB4IDRweCA0cHg7XG4gICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xuXG4gICAgICA6YWN0aXZlLFxuICAgICAgOmZvY3VzLFxuICAgICAgJi5mb2N1cyxcbiAgICAgICYuYWN0aXZlIHtcbiAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLml0ZW0tc2VsZWN0b3JfX2Ryb3Bkb3duOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgICAgYm9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDtcblxuICAgICAgLml0ZW0tc2VsZWN0b3JfX2Ryb3Bkb3duX192YWx1ZSB7XG4gICAgICAgIGNvbG9yOiAke3Byb3BzID0+XG4gICAgICAgICAgcHJvcHMuaG92ZXJDb2xvciA/IHByb3BzLnRoZW1lW3Byb3BzLmhvdmVyQ29sb3JdIDogcHJvcHMudGhlbWUudGV4dENvbG9ySGx9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC5hbmltYXRpb24tY29udHJvbF9fc3BlZWQtY29udHJvbCB7XG4gICAgbWFyZ2luLXJpZ2h0OiAtMTJweDtcblxuICAgIC5hbmltYXRpb24tY29udHJvbF9fc3BlZWQtc2xpZGVyIHtcbiAgICAgIHJpZ2h0OiBjYWxjKDAlIC0gNDhweCk7XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBTdHlsZWRUaXRsZSA9IHN0eWxlZChDZW50ZXJGbGV4Ym94KWBcbiAgZmxleC1ncm93OiAwO1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3J9O1xuICBtYXJnaW4tcmlnaHQ6IDEwcHg7XG5cbiAgLmJvdHRvbS13aWRnZXRfX2ljb24ge1xuICAgIG1hcmdpbi1yaWdodDogNnB4O1xuICB9XG4gIC5ib3R0b20td2lkZ2V0X19pY29uLnNwZWVkIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDA7XG4gIH1cbmA7XG5cblRpbWVXaWRnZXRGYWN0b3J5LmRlcHMgPSBbXG4gIFNwZWVkQ29udHJvbEZhY3RvcnksXG4gIFRpbWVSYW5nZUZpbHRlckZhY3RvcnksXG4gIEZsb2F0aW5nVGltZURpc3BsYXlGYWN0b3J5LFxuICBGaWVsZFNlbGVjdG9yRmFjdG9yeVxuXTtcbmZ1bmN0aW9uIFRpbWVXaWRnZXRGYWN0b3J5KFNwZWVkQ29udHJvbCwgVGltZVJhbmdlRmlsdGVyLCBGbG9hdGluZ1RpbWVEaXNwbGF5LCBGaWVsZFNlbGVjdG9yKSB7XG4gIGNsYXNzIFRpbWVXaWRnZXQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRlID0ge1xuICAgICAgc2hvd1NwZWVkQ29udHJvbDogZmFsc2VcbiAgICB9O1xuXG4gICAgZmllbGRTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmZpZWxkcztcbiAgICB5QXhpc0ZpZWxkc1NlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IodGhpcy5maWVsZFNlbGVjdG9yLCBmaWVsZHMgPT5cbiAgICAgIGZpZWxkcy5maWx0ZXIoZiA9PiBmLnR5cGUgPT09ICdpbnRlZ2VyJyB8fCBmLnR5cGUgPT09ICdyZWFsJylcbiAgICApO1xuXG4gICAgX3VwZGF0ZUFuaW1hdGlvblNwZWVkID0gc3BlZWQgPT4gdGhpcy5wcm9wcy51cGRhdGVBbmltYXRpb25TcGVlZCh0aGlzLnByb3BzLmluZGV4LCBzcGVlZCk7XG5cbiAgICBfdG9nZ2xlU3BlZWRDb250cm9sID0gKCkgPT4gdGhpcy5zZXRTdGF0ZSh7c2hvd1NwZWVkQ29udHJvbDogIXRoaXMuc3RhdGUuc2hvd1NwZWVkQ29udHJvbH0pO1xuXG4gICAgX3NldEZpbHRlclBsb3RZQXhpcyA9IHZhbHVlID0+IHRoaXMucHJvcHMuc2V0RmlsdGVyUGxvdCh0aGlzLnByb3BzLmluZGV4LCB7eUF4aXM6IHZhbHVlfSk7XG5cbiAgICBfdXBkYXRlQW5pbWF0aW9uU3BlZWQgPSBzcGVlZCA9PiB0aGlzLnByb3BzLnVwZGF0ZUFuaW1hdGlvblNwZWVkKHRoaXMucHJvcHMuaW5kZXgsIHNwZWVkKTtcblxuICAgIF90b2dnbGVBbmltYXRpb24gPSAoKSA9PiB0aGlzLnByb3BzLnRvZ2dsZUFuaW1hdGlvbih0aGlzLnByb3BzLmluZGV4KTtcblxuICAgIF9vbkNsb3NlID0gKCkgPT4gdGhpcy5wcm9wcy5lbmxhcmdlRmlsdGVyKHRoaXMucHJvcHMuaW5kZXgpO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2RhdGFzZXRzLCBmaWx0ZXIsIGluZGV4LCByZWFkT25seSwgc2V0RmlsdGVyLCBzaG93VGltZURpc3BsYXl9ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3Qge3Nob3dTcGVlZENvbnRyb2x9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUaW1lQm90dG9tV2lkZ2V0SW5uZXIgY2xhc3NOYW1lPVwiYm90dG9tLXdpZGdldC0taW5uZXJcIj5cbiAgICAgICAgICA8VG9wU2VjdGlvbldyYXBwZXI+XG4gICAgICAgICAgICA8U3R5bGVkVGl0bGUgY2xhc3NOYW1lPVwiYm90dG9tLXdpZGdldF9fZmllbGRcIj5cbiAgICAgICAgICAgICAgPENlbnRlckZsZXhib3ggY2xhc3NOYW1lPVwiYm90dG9tLXdpZGdldF9faWNvblwiPlxuICAgICAgICAgICAgICAgIDxDbG9jayBoZWlnaHQ9XCIxNXB4XCIgLz5cbiAgICAgICAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICAgICAgICA8U2VsZWN0VGV4dEJvbGQ+e2ZpbHRlci5uYW1lfTwvU2VsZWN0VGV4dEJvbGQ+XG4gICAgICAgICAgICA8L1N0eWxlZFRpdGxlPlxuICAgICAgICAgICAgPFN0eWxlZFRpdGxlIGNsYXNzTmFtZT1cImJvdHRvbS13aWRnZXRfX3ktYXhpc1wiPlxuICAgICAgICAgICAgICA8Q2VudGVyRmxleGJveCBjbGFzc05hbWU9XCJib3R0b20td2lkZ2V0X19pY29uXCI+XG4gICAgICAgICAgICAgICAgPExpbmVDaGFydCBoZWlnaHQ9XCIxNXB4XCIgLz5cbiAgICAgICAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJvdHRvbS13aWRnZXRfX2ZpZWxkLXNlbGVjdFwiPlxuICAgICAgICAgICAgICAgIDxGaWVsZFNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICBmaWVsZHM9e3RoaXMueUF4aXNGaWVsZHNTZWxlY3RvcihkYXRhc2V0c1tmaWx0ZXIuZGF0YUlkWzBdXSl9XG4gICAgICAgICAgICAgICAgICBwbGFjZW1lbnQ9XCJ0b3BcIlxuICAgICAgICAgICAgICAgICAgaWQ9XCJzZWxlY3RlZC10aW1lLXdpZGdldC1maWVsZFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZmlsdGVyLnlBeGlzID8gZmlsdGVyLnlBeGlzLm5hbWUgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgb25TZWxlY3Q9e3RoaXMuX3NldEZpbHRlclBsb3RZQXhpc31cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwicGxhY2Vob2xkZXIueUF4aXNcIlxuICAgICAgICAgICAgICAgICAgZXJhc2FibGVcbiAgICAgICAgICAgICAgICAgIHNob3dUb2tlbj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1N0eWxlZFRpdGxlPlxuICAgICAgICAgICAgPFN0eWxlZFRpdGxlIGNsYXNzTmFtZT1cImJvdHRvbS13aWRnZXRfX3NwZWVkXCI+XG4gICAgICAgICAgICAgIDxTcGVlZENvbnRyb2xcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVTcGVlZENvbnRyb2x9XG4gICAgICAgICAgICAgICAgc2hvd1NwZWVkQ29udHJvbD17c2hvd1NwZWVkQ29udHJvbH1cbiAgICAgICAgICAgICAgICB1cGRhdGVBbmltYXRpb25TcGVlZD17dGhpcy5fdXBkYXRlQW5pbWF0aW9uU3BlZWR9XG4gICAgICAgICAgICAgICAgc3BlZWQ9e2ZpbHRlci5zcGVlZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvU3R5bGVkVGl0bGU+XG4gICAgICAgICAgICB7IXJlYWRPbmx5ID8gKFxuICAgICAgICAgICAgICA8Q2VudGVyRmxleGJveD5cbiAgICAgICAgICAgICAgICA8SWNvblJvdW5kU21hbGw+XG4gICAgICAgICAgICAgICAgICA8Q2xvc2UgaGVpZ2h0PVwiMTJweFwiIG9uQ2xpY2s9e3RoaXMuX29uQ2xvc2V9IC8+XG4gICAgICAgICAgICAgICAgPC9JY29uUm91bmRTbWFsbD5cbiAgICAgICAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9Ub3BTZWN0aW9uV3JhcHBlcj5cbiAgICAgICAgICA8VGltZVJhbmdlRmlsdGVyXG4gICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgIHNldEZpbHRlcj17dmFsdWUgPT4gc2V0RmlsdGVyKGluZGV4LCAndmFsdWUnLCB2YWx1ZSl9XG4gICAgICAgICAgICB0b2dnbGVBbmltYXRpb249e3RoaXMuX3RvZ2dsZUFuaW1hdGlvbn1cbiAgICAgICAgICAgIGhpZGVUaW1lVGl0bGU9e3Nob3dUaW1lRGlzcGxheX1cbiAgICAgICAgICAgIGlzQW5pbWF0YWJsZVxuICAgICAgICAgIC8+XG4gICAgICAgICAge3Nob3dUaW1lRGlzcGxheSA/IDxGbG9hdGluZ1RpbWVEaXNwbGF5IGN1cnJlbnRUaW1lPXtmaWx0ZXIudmFsdWV9IC8+IDogbnVsbH1cbiAgICAgICAgPC9UaW1lQm90dG9tV2lkZ2V0SW5uZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gVGltZVdpZGdldDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGltZVdpZGdldEZhY3Rvcnk7XG4iXX0=