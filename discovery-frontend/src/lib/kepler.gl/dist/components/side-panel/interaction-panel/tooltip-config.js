"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactIntl = require("react-intl");

var _localization = require("../../../localization");

var _styledComponents2 = require("../../common/styled-components");

var _datasetTag = _interopRequireDefault(require("../common/dataset-tag"));

var _tooltipChicklet = _interopRequireDefault(require("./tooltip-config/tooltip-chicklet"));

var _switch = _interopRequireDefault(require("../../common/switch"));

var _itemSelector = _interopRequireDefault(require("../../common/item-selector/item-selector"));

var _tooltip = require("../../../constants/tooltip");

var _fieldSelector = _interopRequireDefault(require("../../common/field-selector"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  display: flex;\n  font-size: ", ";\n  justify-content: space-between;\n  line-height: 11px;\n  margin-bottom: 8px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: inherit;\n  padding: 0;\n\n  .button.clear-all {\n    background: transparent;\n    color: ", ";\n    margin: 0 0 0 8px;\n    padding: 0;\n\n    &:hover {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .item-selector > div > div {\n    overflow: visible;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var TooltipConfigWrapper = _styledComponents["default"].div(_templateObject());

var ButtonWrapper = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.subtextColor;
}, function (props) {
  return props.theme.textColor;
});

var CompareSwitchWrapper = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.labelColor;
}, function (props) {
  return props.theme.inputFontSize;
});

TooltipConfigFactory.deps = [_datasetTag["default"], _fieldSelector["default"]];

function TooltipConfigFactory(DatasetTag, FieldSelector) {
  var TooltipConfig = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TooltipConfig, _Component);

    var _super = _createSuper(TooltipConfig);

    function TooltipConfig() {
      (0, _classCallCheck2["default"])(this, TooltipConfig);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(TooltipConfig, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            config = _this$props.config,
            datasets = _this$props.datasets,
            _onChange = _this$props.onChange,
            intl = _this$props.intl;
        return /*#__PURE__*/_react["default"].createElement(TooltipConfigWrapper, null, Object.keys(config.fieldsToShow).map(function (dataId) {
          return /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, {
            key: dataId
          }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.SBFlexboxNoMargin, null, /*#__PURE__*/_react["default"].createElement(DatasetTag, {
            dataset: datasets[dataId]
          }), Boolean(config.fieldsToShow[dataId].length) && /*#__PURE__*/_react["default"].createElement(ButtonWrapper, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
            className: "clear-all",
            onClick: function onClick() {
              var newConfig = _objectSpread(_objectSpread({}, config), {}, {
                fieldsToShow: _objectSpread(_objectSpread({}, config.fieldsToShow), {}, (0, _defineProperty2["default"])({}, dataId, []))
              });

              _onChange(newConfig);
            },
            width: "54px",
            secondary: true
          }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: "fieldSelector.clearAll"
          })))), /*#__PURE__*/_react["default"].createElement(FieldSelector, {
            fields: datasets[dataId].fields,
            value: config.fieldsToShow[dataId],
            onSelect: function onSelect(selected) {
              var newConfig = _objectSpread(_objectSpread({}, config), {}, {
                fieldsToShow: _objectSpread(_objectSpread({}, config.fieldsToShow), {}, (0, _defineProperty2["default"])({}, dataId, selected.map(function (f) {
                  return config.fieldsToShow[dataId].find(function (tooltipField) {
                    return tooltipField.name === f.name;
                  }) || {
                    name: f.name,
                    // default initial tooltip is null
                    format: null
                  };
                })))
              });

              _onChange(newConfig);
            },
            closeOnSelect: false,
            multiSelect: true,
            inputTheme: "secondary",
            CustomChickletComponent: (0, _tooltipChicklet["default"])(dataId, config, _onChange, datasets[dataId].fields)
          }));
        }), /*#__PURE__*/_react["default"].createElement(CompareSwitchWrapper, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: "compare.modeLabel"
        }), /*#__PURE__*/_react["default"].createElement(_switch["default"], {
          checked: config.compareMode,
          id: "compare-mode-toggle",
          onChange: function onChange() {
            var newConfig = _objectSpread(_objectSpread({}, config), {}, {
              compareMode: !config.compareMode
            });

            _onChange(newConfig);
          },
          secondary: true
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: "compare.typeLabel"
        })), /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], {
          disabled: !config.compareMode,
          displayOption: function displayOption(d) {
            return intl.formatMessage({
              id: "compare.types.".concat(d)
            });
          },
          selectedItems: config.compareType,
          options: Object.values(_tooltip.COMPARE_TYPES),
          multiSelect: false,
          searchable: false,
          inputTheme: 'secondary',
          getOptionValue: function getOptionValue(d) {
            return d;
          },
          onChange: function onChange(option) {
            var newConfig = _objectSpread(_objectSpread({}, config), {}, {
              compareType: option
            });

            _onChange(newConfig);
          }
        })));
      }
    }]);
    return TooltipConfig;
  }(_react.Component);

  return (0, _reactIntl.injectIntl)(TooltipConfig);
}

var _default = TooltipConfigFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvaW50ZXJhY3Rpb24tcGFuZWwvdG9vbHRpcC1jb25maWcuanMiXSwibmFtZXMiOlsiVG9vbHRpcENvbmZpZ1dyYXBwZXIiLCJzdHlsZWQiLCJkaXYiLCJCdXR0b25XcmFwcGVyIiwicHJvcHMiLCJ0aGVtZSIsInN1YnRleHRDb2xvciIsInRleHRDb2xvciIsIkNvbXBhcmVTd2l0Y2hXcmFwcGVyIiwibGFiZWxDb2xvciIsImlucHV0Rm9udFNpemUiLCJUb29sdGlwQ29uZmlnRmFjdG9yeSIsImRlcHMiLCJEYXRhc2V0VGFnRmFjdG9yeSIsIkZpZWxkU2VsZWN0b3JGYWN0b3J5IiwiRGF0YXNldFRhZyIsIkZpZWxkU2VsZWN0b3IiLCJUb29sdGlwQ29uZmlnIiwiY29uZmlnIiwiZGF0YXNldHMiLCJvbkNoYW5nZSIsImludGwiLCJPYmplY3QiLCJrZXlzIiwiZmllbGRzVG9TaG93IiwibWFwIiwiZGF0YUlkIiwiQm9vbGVhbiIsImxlbmd0aCIsIm5ld0NvbmZpZyIsImZpZWxkcyIsInNlbGVjdGVkIiwiZiIsImZpbmQiLCJ0b29sdGlwRmllbGQiLCJuYW1lIiwiZm9ybWF0IiwiY29tcGFyZU1vZGUiLCJkIiwiZm9ybWF0TWVzc2FnZSIsImlkIiwiY29tcGFyZVR5cGUiLCJ2YWx1ZXMiLCJDT01QQVJFX1RZUEVTIiwib3B0aW9uIiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsb0JBQW9CLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUExQjs7QUFNQSxJQUFNQyxhQUFhLEdBQUdGLDZCQUFPQyxHQUFWLHFCQU1OLFVBQUFFLEtBQUs7QUFBQSxTQUFJ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LFVBQUEsT0FBTyxFQUFFbkIsTUFBTSxDQUFDb0IsTUFBUCxDQUFjQyxzQkFBZCxDQVJYO0FBU0UsVUFBQSxXQUFXLEVBQUUsS0FUZjtBQVVFLFVBQUEsVUFBVSxFQUFFLEtBVmQ7QUFXRSxVQUFBLFVBQVUsRUFBRSxXQVhkO0FBWUUsVUFBQSxjQUFjLEVBQUUsd0JBQUFMLENBQUM7QUFBQSxtQkFBSUEsQ0FBSjtBQUFBLFdBWm5CO0FBYUUsVUFBQSxRQUFRLEVBQUUsa0JBQUFNLE1BQU0sRUFBSTtBQUNsQixnQkFBTWYsU0FBUyxtQ0FDVlgsTUFEVTtBQUVidUIsY0FBQUEsV0FBVyxFQUFFRztBQUZBLGNBQWY7O0FBSUF4QixZQUFBQSxTQUFRLENBQUNTLFNBQUQsQ0FBUjtBQUNEO0FBbkJILFVBSkYsQ0E1RUYsQ0FERjtBQXlHRDtBQTdHb0Q7QUFBQTtBQUFBLElBQzNCZ0IsZ0JBRDJCOztBQWdIdkQsU0FBTywyQkFBVzVCLGFBQVgsQ0FBUDtBQUNEOztlQUVjTixvQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge2luamVjdEludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5pbXBvcnQge1xuICBTaWRlUGFuZWxTZWN0aW9uLFxuICBTQkZsZXhib3hOb01hcmdpbixcbiAgQnV0dG9uLFxuICBQYW5lbExhYmVsXG59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBEYXRhc2V0VGFnRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvY29tbW9uL2RhdGFzZXQtdGFnJztcbmltcG9ydCBUb29sdGlwQ2hpY2tsZXRGYWN0b3J5IGZyb20gJy4vdG9vbHRpcC1jb25maWcvdG9vbHRpcC1jaGlja2xldCc7XG5pbXBvcnQgU3dpdGNoIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N3aXRjaCc7XG5pbXBvcnQgSXRlbVNlbGVjdG9yIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2l0ZW0tc2VsZWN0b3IvaXRlbS1zZWxlY3Rvcic7XG5pbXBvcnQge0NPTVBBUkVfVFlQRVN9IGZyb20gJ2NvbnN0YW50cy90b29sdGlwJztcbmltcG9ydCBGaWVsZFNlbGVjdG9yRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vZmllbGQtc2VsZWN0b3InO1xuXG5jb25zdCBUb29sdGlwQ29uZmlnV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIC5pdGVtLXNlbGVjdG9yID4gZGl2ID4gZGl2IHtcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgfVxuYDtcblxuY29uc3QgQnV0dG9uV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGluaGVyaXQ7XG4gIHBhZGRpbmc6IDA7XG5cbiAgLmJ1dHRvbi5jbGVhci1hbGwge1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnN1YnRleHRDb2xvcn07XG4gICAgbWFyZ2luOiAwIDAgMCA4cHg7XG4gICAgcGFkZGluZzogMDtcblxuICAgICY6aG92ZXIge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbiAgICB9XG4gIH1cbmA7XG5cbmNvbnN0IENvbXBhcmVTd2l0Y2hXcmFwcGVyID0gc3R5bGVkLmRpdmBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZvbnQtc2l6ZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5pbnB1dEZvbnRTaXplfTtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBsaW5lLWhlaWdodDogMTFweDtcbiAgbWFyZ2luLWJvdHRvbTogOHB4O1xuYDtcblxuVG9vbHRpcENvbmZpZ0ZhY3RvcnkuZGVwcyA9IFtEYXRhc2V0VGFnRmFjdG9yeSwgRmllbGRTZWxlY3RvckZhY3RvcnldO1xuZnVuY3Rpb24gVG9vbHRpcENvbmZpZ0ZhY3RvcnkoRGF0YXNldFRhZywgRmllbGRTZWxlY3Rvcikge1xuICBjbGFzcyBUb29sdGlwQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7Y29uZmlnLCBkYXRhc2V0cywgb25DaGFuZ2UsIGludGx9ID0gdGhpcy5wcm9wcztcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUb29sdGlwQ29uZmlnV3JhcHBlcj5cbiAgICAgICAgICB7T2JqZWN0LmtleXMoY29uZmlnLmZpZWxkc1RvU2hvdykubWFwKGRhdGFJZCA9PiAoXG4gICAgICAgICAgICA8U2lkZVBhbmVsU2VjdGlvbiBrZXk9e2RhdGFJZH0+XG4gICAgICAgICAgICAgIDxTQkZsZXhib3hOb01hcmdpbj5cbiAgICAgICAgICAgICAgICA8RGF0YXNldFRhZyBkYXRhc2V0PXtkYXRhc2V0c1tkYXRhSWRdfSAvPlxuICAgICAgICAgICAgICAgIHtCb29sZWFuKGNvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXS5sZW5ndGgpICYmIChcbiAgICAgICAgICAgICAgICAgIDxCdXR0b25XcmFwcGVyPlxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY2xlYXItYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzVG9TaG93OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLmZpZWxkc1RvU2hvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGF0YUlkXTogW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG5ld0NvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjU0cHhcIlxuICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9XCJmaWVsZFNlbGVjdG9yLmNsZWFyQWxsXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbldyYXBwZXI+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9TQkZsZXhib3hOb01hcmdpbj5cbiAgICAgICAgICAgICAgPEZpZWxkU2VsZWN0b3JcbiAgICAgICAgICAgICAgICBmaWVsZHM9e2RhdGFzZXRzW2RhdGFJZF0uZmllbGRzfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb25maWcuZmllbGRzVG9TaG93W2RhdGFJZF19XG4gICAgICAgICAgICAgICAgb25TZWxlY3Q9e3NlbGVjdGVkID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0NvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNUb1Nob3c6IHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi5jb25maWcuZmllbGRzVG9TaG93LFxuICAgICAgICAgICAgICAgICAgICAgIFtkYXRhSWRdOiBzZWxlY3RlZC5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICBmID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXS5maW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBGaWVsZCA9PiB0b29sdGlwRmllbGQubmFtZSA9PT0gZi5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGYubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IGluaXRpYWwgdG9vbHRpcCBpcyBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZShuZXdDb25maWcpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgY2xvc2VPblNlbGVjdD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgbXVsdGlTZWxlY3RcbiAgICAgICAgICAgICAgICBpbnB1dFRoZW1lPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICBDdXN0b21DaGlja2xldENvbXBvbmVudD17VG9vbHRpcENoaWNrbGV0RmFjdG9yeShcbiAgICAgICAgICAgICAgICAgIGRhdGFJZCxcbiAgICAgICAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgZGF0YXNldHNbZGF0YUlkXS5maWVsZHNcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9TaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgICkpfVxuICAgICAgICAgIDxDb21wYXJlU3dpdGNoV3JhcHBlcj5cbiAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPVwiY29tcGFyZS5tb2RlTGFiZWxcIiAvPlxuICAgICAgICAgICAgPFN3aXRjaFxuICAgICAgICAgICAgICBjaGVja2VkPXtjb25maWcuY29tcGFyZU1vZGV9XG4gICAgICAgICAgICAgIGlkPVwiY29tcGFyZS1tb2RlLXRvZ2dsZVwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Q29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICAgICAgICAgICAgY29tcGFyZU1vZGU6ICFjb25maWcuY29tcGFyZU1vZGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG5ld0NvbmZpZyk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHNlY29uZGFyeVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0NvbXBhcmVTd2l0Y2hXcmFwcGVyPlxuICAgICAgICAgIDxTaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPVwiY29tcGFyZS50eXBlTGFiZWxcIiAvPlxuICAgICAgICAgICAgPC9QYW5lbExhYmVsPlxuICAgICAgICAgICAgPEl0ZW1TZWxlY3RvclxuICAgICAgICAgICAgICBkaXNhYmxlZD17IWNvbmZpZy5jb21wYXJlTW9kZX1cbiAgICAgICAgICAgICAgZGlzcGxheU9wdGlvbj17ZCA9PlxuICAgICAgICAgICAgICAgIGludGwuZm9ybWF0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICBpZDogYGNvbXBhcmUudHlwZXMuJHtkfWBcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM9e2NvbmZpZy5jb21wYXJlVHlwZX1cbiAgICAgICAgICAgICAgb3B0aW9ucz17T2JqZWN0LnZhbHVlcyhDT01QQVJFX1RZUEVTKX1cbiAgICAgICAgICAgICAgbXVsdGlTZWxlY3Q9e2ZhbHNlfVxuICAgICAgICAgICAgICBzZWFyY2hhYmxlPXtmYWxzZX1cbiAgICAgICAgICAgICAgaW5wdXRUaGVtZT17J3NlY29uZGFyeSd9XG4gICAgICAgICAgICAgIGdldE9wdGlvblZhbHVlPXtkID0+IGR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtvcHRpb24gPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0NvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAgICAgICAgIGNvbXBhcmVUeXBlOiBvcHRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG5ld0NvbmZpZyk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgPC9Ub29sdGlwQ29uZmlnV3JhcHBlcj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluamVjdEludGwoVG9vbHRpcENvbmZpZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRvb2x0aXBDb25maWdGYWN0b3J5O1xuIl19