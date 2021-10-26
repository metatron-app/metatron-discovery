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

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _chickletedInput = require("../../../common/item-selector/chickleted-input");

var _icons = require("../../../common/icons");

var _dropdownList = _interopRequireDefault(require("../../../common/item-selector/dropdown-list"));

var _styledComponents2 = require("../../../common/styled-components");

var _localization = require("../../../../localization");

var _reactOnclickoutside = _interopRequireDefault(require("react-onclickoutside"));

var _defaultSettings = require("../../../../constants/default-settings");

var _tooltip = require("../../../../constants/tooltip");

var _dataUtils = require("../../../../utils/data-utils");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-left: -64px;\n  position: absolute;\n  top: 20px;\n  width: 140px;\n  z-index: 101;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-right: 4px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: relative;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var TIME_DISPLAY = '2020-05-11 14:00';

var getValue = function getValue(fmt) {
  return fmt[_tooltip.TOOLTIP_KEY];
};

var addDTimeLabel = function addDTimeLabel(formats) {
  return formats.map(function (f) {
    return _objectSpread(_objectSpread({}, f), {}, {
      label: f.type === _tooltip.TOOLTIP_FORMAT_TYPES.DATE_TIME || f.type === _tooltip.TOOLTIP_FORMAT_TYPES.DATE ? (0, _dataUtils.getFormatter)(getValue(f))(TIME_DISPLAY) : f.label
    });
  });
};

function getFormatLabels(fields, fieldName) {
  var fieldType = fields.find(function (f) {
    return f.name === fieldName;
  }).type;
  var tooltipTypes = fieldType && _defaultSettings.FIELD_OPTS[fieldType].format.tooltip || [];
  var formatLabels = Object.values(_tooltip.TOOLTIP_FORMATS).filter(function (t) {
    return tooltipTypes.includes(t.type);
  });
  return addDTimeLabel(formatLabels);
}

var ChickletAddonWrapper = _styledComponents["default"].div(_templateObject());

var ChickletAddon = _styledComponents["default"].div(_templateObject2());

var StyledPopover = _styledComponents["default"].div(_templateObject3());

var hashStyles = {
  SHOW: 'SHOW',
  ACTIVE: 'ACTIVE'
};

var IconDiv = _styledComponents["default"].div.attrs({
  className: 'tooltip-chicklet__icon'
})(_templateObject4(), function (props) {
  return props.status === hashStyles.SHOW ? props.theme.subtextColorActive : props.status === hashStyles.ACTIVE ? props.theme.activeColor : props.theme.textColor;
});

function getFormatTooltip(formatLabels, format) {
  if (!format) {
    return null;
  }

  var formatLabel = formatLabels.find(function (fl) {
    return getValue(fl) === format;
  });

  if (formatLabel) {
    return formatLabel.label;
  }

  return (0, _typeof2["default"])(format) === 'object' ? JSON.stringify(format, null, 2) : String(format);
}

function TooltipChickletFactory(dataId, config, onChange, fields) {
  var TooltipChicklet = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TooltipChicklet, _Component);

    var _super = _createSuper(TooltipChicklet);

    function TooltipChicklet() {
      var _this;

      (0, _classCallCheck2["default"])(this, TooltipChicklet);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        show: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleClickOutside", function (e) {
        if (_this.node.contains(e.target)) {
          return;
        }

        _this.setState({
          show: false
        });
      });
      return _this;
    }

    (0, _createClass2["default"])(TooltipChicklet, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, false);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props = this.props,
            disabled = _this$props.disabled,
            name = _this$props.name,
            remove = _this$props.remove;
        var show = this.state.show;
        var tooltipField = config.fieldsToShow[dataId].find(function (fieldToShow) {
          return fieldToShow.name === name;
        });
        var formatLabels = getFormatLabels(fields, tooltipField.name);
        var hasFormat = Boolean(tooltipField.format);
        var selectionIndex = formatLabels.findIndex(function (fl) {
          return getValue(fl) === tooltipField.format;
        });
        var hashStyle = show ? hashStyles.SHOW : hasFormat ? hashStyles.ACTIVE : null;
        return /*#__PURE__*/_react["default"].createElement(_chickletedInput.ChickletButton, {
          ref: function ref(node) {
            return _this2.node = node;
          }
        }, /*#__PURE__*/_react["default"].createElement(_chickletedInput.ChickletTag, null, name), formatLabels.length > 1 && /*#__PURE__*/_react["default"].createElement(ChickletAddonWrapper, null, /*#__PURE__*/_react["default"].createElement(ChickletAddon, {
          "data-tip": true,
          "data-for": "addon-".concat(name)
        }, /*#__PURE__*/_react["default"].createElement(IconDiv, {
          status: hashStyle
        }, /*#__PURE__*/_react["default"].createElement(_icons.Hash, {
          height: "8px",
          onClick: function onClick(e) {
            e.stopPropagation();

            _this2.setState({
              show: Boolean(!show)
            });
          }
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
          id: "addon-".concat(name),
          effect: "solid"
        }, /*#__PURE__*/_react["default"].createElement("span", null, hasFormat ? getFormatTooltip(formatLabels, tooltipField.format) : /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fieldSelector.formatting'
        })))), show && /*#__PURE__*/_react["default"].createElement(StyledPopover, null, /*#__PURE__*/_react["default"].createElement(_dropdownList["default"], {
          options: formatLabels,
          selectionIndex: selectionIndex,
          displayOption: function displayOption(item) {
            return item.label;
          },
          onOptionSelected: function onOptionSelected(result, e) {
            e.stopPropagation();

            _this2.setState({
              show: false
            });

            var oldFieldsToShow = config.fieldsToShow[dataId];
            var fieldsToShow = oldFieldsToShow.map(function (fieldToShow) {
              return fieldToShow.name === name ? {
                name: name,
                format: getValue(result)
              } : fieldToShow;
            });

            var newConfig = _objectSpread(_objectSpread({}, config), {}, {
              fieldsToShow: _objectSpread(_objectSpread({}, config.fieldsToShow), {}, (0, _defineProperty2["default"])({}, dataId, fieldsToShow))
            });

            onChange(newConfig);
          }
        }))), /*#__PURE__*/_react["default"].createElement(_icons.Delete, {
          onClick: disabled ? null : remove
        }));
      }
    }]);
    return TooltipChicklet;
  }(_react.Component);

  return (0, _reactOnclickoutside["default"])(TooltipChicklet);
}

var _default = TooltipChickletFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvaW50ZXJhY3Rpb24tcGFuZWwvdG9vbHRpcC1jb25maWcvdG9vbHRpcC1jaGlja2xldC5qcyJdLCJuYW1lcyI6WyJUSU1FX0RJU1BMQVkiLCJnZXRWYWx1ZSIsImZtdCIsIlRPT0xUSVBfS0VZIiwiYWRkRFRpbWVMYWJlbCIsImZvcm1hdHMiLCJtYXAiLCJmIiwibGFiZWwiLCJ0eXBlIiwiVE9PTFRJUF9GT1JNQVRfVFlQRVMiLCJEQVRFX1RJTUUiLCJEQVRFIiwiZ2V0Rm9ybWF0TGFiZWxzIiwiZmllbGRzIiwiZmllbGROYW1lIiwiZmllbGRUeXBlIiwiZmluZCIsIm5hbWUiLCJ0b29sdGlwVHlwZXMiLCJGSUVMRF9PUFRTIiwiZm9ybWF0IiwidG9vbHRpcCIsImZvcm1hdExhYmVscyIsIk9iamVjdCIsInZhbHVlcyIsIlRPT0xUSVBfRk9STUFUUyIsImZpbHRlciIsInQiLCJpbmNsdWRlcyIsIkNoaWNrbGV0QWRkb25XcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwiQ2hpY2tsZXRBZGRvbiIsIlN0eWxlZFBvcG92ZXIiLCJoYXNoU3R5bGVzIiwiU0hPVyIsIkFDVElWRSIsIkljb25EaXYiLCJhdHRycyIsImNsYXNzTmFtZSIsInByb3BzIiwic3RhdHVzIiwidGhlbWUiLCJzdWJ0ZXh0Q29sb3JBY3RpdmUiLCJhY3RpdmVDb2xvciIsInRleHRDb2xvciIsImdldEZvcm1hdFRvb2x0aXAiLCJmb3JtYXRMYWJlbCIsImZsIiwiSlNPTiIsInN0cmluZ2lmeSIsIlN0cmluZyIsIlRvb2x0aXBDaGlja2xldEZhY3RvcnkiLCJkYXRhSWQiLCJjb25maWciLCJvbkNoYW5nZSIsIlRvb2x0aXBDaGlja2xldCIsInNob3ciLCJlIiwibm9kZSIsImNvbnRhaW5zIiwidGFyZ2V0Iiwic2V0U3RhdGUiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJoYW5kbGVDbGlja091dHNpZGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGlzYWJsZWQiLCJyZW1vdmUiLCJzdGF0ZSIsInRvb2x0aXBGaWVsZCIsImZpZWxkc1RvU2hvdyIsImZpZWxkVG9TaG93IiwiaGFzRm9ybWF0IiwiQm9vbGVhbiIsInNlbGVjdGlvbkluZGV4IiwiZmluZEluZGV4IiwiaGFzaFN0eWxlIiwibGVuZ3RoIiwic3RvcFByb3BhZ2F0aW9uIiwiaXRlbSIsInJlc3VsdCIsIm9sZEZpZWxkc1RvU2hvdyIsIm5ld0NvbmZpZyIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxHQUFHLGtCQUFyQjs7QUFDQSxJQUFNQyxRQUFRLEdBQUcsU0FBWEEsUUFBVyxDQUFBQyxHQUFHO0FBQUEsU0FBSUEsR0FBRyxDQUFDQyxvQkFBRCxDQUFQO0FBQUEsQ0FBcEI7O0FBRUEsSUFBTUMsYUFBYSxHQUFHLFNBQWhCQSxhQUFnQixDQUFBQyxPQUFPO0FBQUEsU0FDM0JBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFVBQUFDLENBQUM7QUFBQSwyQ0FDUkEsQ0FEUTtBQUVYQyxNQUFBQSxLQUFLLEVBQ0hELENBQUMsQ0FBQ0UsSUFBRixLQUFXQyw4QkFBcUJDLFNBQWhDLElBQTZDSixDQUFDLENBQUNFLElBQUYsS0FBV0MsOEJBQXFCRSxJQUE3RSxHQUNJLDZCQUFhWCxRQUFRLENBQUNNLENBQUQsQ0FBckIsRUFBMEJQLFlBQTFCLENBREosR0FFSU8sQ0FBQyxDQUFDQztBQUxHO0FBQUEsR0FBYixDQUQyQjtBQUFBLENBQTdCOztBQVNBLFNBQVNLLGVBQVQsQ0FBeUJDLE1BQXpCLEVBQWlDQyxTQUFqQyxFQUE0QztBQUMxQyxNQUFNQyxTQUFTLEdBQUdGLE1BQU0sQ0FB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O0FBQ1pMLGNBQUFBLElBQUksRUFBRTtBQURNLGFBQWQ7O0FBSUEsZ0JBQU15QixlQUFlLEdBQUc1QixNQUFNLENBQUNpQixZQUFQLENBQW9CbEIsTUFBcEIsQ0FBeEI7QUFDQSxnQkFBTWtCLFlBQVksR0FBR1csZUFBZSxDQUFDN0UsR0FBaEIsQ0FBb0IsVUFBQW1FLFdBQVcsRUFBSTtBQUN0RCxxQkFBT0EsV0FBVyxDQUFDdkQsSUFBWixLQUFxQkEsSUFBckIsR0FDSDtBQUNFQSxnQkFBQUEsSUFBSSxFQUFKQSxJQURGO0FBRUVHLGdCQUFBQSxNQUFNLEVBQUVwQixRQUFRLENBQUNpRixNQUFEO0FBRmxCLGVBREcsR0FLSFQsV0FMSjtBQU1ELGFBUG9CLENBQXJCOztBQVFBLGdCQUFNVyxTQUFTLG1DQUNWN0IsTUFEVTtBQUViaUIsY0FBQUEsWUFBWSxrQ0FDUGpCLE1BQU0sQ0FBQ2lCLFlBREEsNENBRVRsQixNQUZTLEVBRUFrQixZQUZBO0FBRkMsY0FBZjs7QUFPQWhCLFlBQUFBLFFBQVEsQ0FBQzRCLFNBQUQsQ0FBUjtBQUNEO0FBM0JILFVBREYsQ0F0QkosQ0FISixlQTJERSxnQ0FBQyxhQUFEO0FBQVEsVUFBQSxPQUFPLEVBQUVoQixRQUFRLEdBQUcsSUFBSCxHQUFVQztBQUFuQyxVQTNERixDQURGO0FBK0REO0FBL0Y2RDtBQUFBO0FBQUEsSUFDbENnQixnQkFEa0M7O0FBaUdoRSxTQUFPLHFDQUFlNUIsZUFBZixDQUFQO0FBQ0Q7O2VBRWNKLHNCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Q2hpY2tsZXRCdXR0b24sIENoaWNrbGV0VGFnfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pdGVtLXNlbGVjdG9yL2NoaWNrbGV0ZWQtaW5wdXQnO1xuaW1wb3J0IHtIYXNoLCBEZWxldGV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBEcm9wZG93bkxpc3QgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaXRlbS1zZWxlY3Rvci9kcm9wZG93bi1saXN0JztcbmltcG9ydCB7VG9vbHRpcH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuaW1wb3J0IG9uQ2xpY2tPdXRzaWRlIGZyb20gJ3JlYWN0LW9uY2xpY2tvdXRzaWRlJztcbmltcG9ydCB7RklFTERfT1BUU30gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuaW1wb3J0IHtUT09MVElQX0ZPUk1BVFMsIFRPT0xUSVBfRk9STUFUX1RZUEVTLCBUT09MVElQX0tFWX0gZnJvbSAnY29uc3RhbnRzL3Rvb2x0aXAnO1xuaW1wb3J0IHtnZXRGb3JtYXR0ZXJ9IGZyb20gJ3V0aWxzL2RhdGEtdXRpbHMnO1xuXG5jb25zdCBUSU1FX0RJU1BMQVkgPSAnMjAyMC0wNS0xMSAxNDowMCc7XG5jb25zdCBnZXRWYWx1ZSA9IGZtdCA9PiBmbXRbVE9PTFRJUF9LRVldO1xuXG5jb25zdCBhZGREVGltZUxhYmVsID0gZm9ybWF0cyA9PlxuICBmb3JtYXRzLm1hcChmID0+ICh7XG4gICAgLi4uZixcbiAgICBsYWJlbDpcbiAgICAgIGYudHlwZSA9PT0gVE9PTFRJUF9GT1JNQVRfVFlQRVMuREFURV9USU1FIHx8IGYudHlwZSA9PT0gVE9PTFRJUF9GT1JNQVRfVFlQRVMuREFURVxuICAgICAgICA/IGdldEZvcm1hdHRlcihnZXRWYWx1ZShmKSkoVElNRV9ESVNQTEFZKVxuICAgICAgICA6IGYubGFiZWxcbiAgfSkpO1xuXG5mdW5jdGlvbiBnZXRGb3JtYXRMYWJlbHMoZmllbGRzLCBmaWVsZE5hbWUpIHtcbiAgY29uc3QgZmllbGRUeXBlID0gZmllbGRzLmZpbmQoZiA9PiBmLm5hbWUgPT09IGZpZWxkTmFtZSkudHlwZTtcbiAgY29uc3QgdG9vbHRpcFR5cGVzID0gKGZpZWxkVHlwZSAmJiBGSUVMRF9PUFRTW2ZpZWxkVHlwZV0uZm9ybWF0LnRvb2x0aXApIHx8IFtdO1xuICBjb25zdCBmb3JtYXRMYWJlbHMgPSBPYmplY3QudmFsdWVzKFRPT0xUSVBfRk9STUFUUykuZmlsdGVyKHQgPT4gdG9vbHRpcFR5cGVzLmluY2x1ZGVzKHQudHlwZSkpO1xuXG4gIHJldHVybiBhZGREVGltZUxhYmVsKGZvcm1hdExhYmVscyk7XG59XG5cbmNvbnN0IENoaWNrbGV0QWRkb25XcmFwcGVyID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuYDtcblxuY29uc3QgQ2hpY2tsZXRBZGRvbiA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbi1yaWdodDogNHB4O1xuYDtcblxuY29uc3QgU3R5bGVkUG9wb3ZlciA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbi1sZWZ0OiAtNjRweDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDIwcHg7XG4gIHdpZHRoOiAxNDBweDtcbiAgei1pbmRleDogMTAxO1xuYDtcblxuY29uc3QgaGFzaFN0eWxlcyA9IHtcbiAgU0hPVzogJ1NIT1cnLFxuICBBQ1RJVkU6ICdBQ1RJVkUnXG59O1xuXG5jb25zdCBJY29uRGl2ID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ3Rvb2x0aXAtY2hpY2tsZXRfX2ljb24nXG59KWBcbiAgY29sb3I6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5zdGF0dXMgPT09IGhhc2hTdHlsZXMuU0hPV1xuICAgICAgPyBwcm9wcy50aGVtZS5zdWJ0ZXh0Q29sb3JBY3RpdmVcbiAgICAgIDogcHJvcHMuc3RhdHVzID09PSBoYXNoU3R5bGVzLkFDVElWRVxuICAgICAgPyBwcm9wcy50aGVtZS5hY3RpdmVDb2xvclxuICAgICAgOiBwcm9wcy50aGVtZS50ZXh0Q29sb3J9O1xuYDtcblxuZnVuY3Rpb24gZ2V0Rm9ybWF0VG9vbHRpcChmb3JtYXRMYWJlbHMsIGZvcm1hdCkge1xuICBpZiAoIWZvcm1hdCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGZvcm1hdExhYmVsID0gZm9ybWF0TGFiZWxzLmZpbmQoZmwgPT4gZ2V0VmFsdWUoZmwpID09PSBmb3JtYXQpO1xuICBpZiAoZm9ybWF0TGFiZWwpIHtcbiAgICByZXR1cm4gZm9ybWF0TGFiZWwubGFiZWw7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBmb3JtYXQgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoZm9ybWF0LCBudWxsLCAyKSA6IFN0cmluZyhmb3JtYXQpO1xufVxuXG5mdW5jdGlvbiBUb29sdGlwQ2hpY2tsZXRGYWN0b3J5KGRhdGFJZCwgY29uZmlnLCBvbkNoYW5nZSwgZmllbGRzKSB7XG4gIGNsYXNzIFRvb2x0aXBDaGlja2xldCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGUgPSB7XG4gICAgICBzaG93OiBmYWxzZVxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlQ2xpY2tPdXRzaWRlLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUNsaWNrT3V0c2lkZSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrT3V0c2lkZSA9IGUgPT4ge1xuICAgICAgaWYgKHRoaXMubm9kZS5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdzogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2Rpc2FibGVkLCBuYW1lLCByZW1vdmV9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHtzaG93fSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCB0b29sdGlwRmllbGQgPSBjb25maWcuZmllbGRzVG9TaG93W2RhdGFJZF0uZmluZChcbiAgICAgICAgZmllbGRUb1Nob3cgPT4gZmllbGRUb1Nob3cubmFtZSA9PT0gbmFtZVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGZvcm1hdExhYmVscyA9IGdldEZvcm1hdExhYmVscyhmaWVsZHMsIHRvb2x0aXBGaWVsZC5uYW1lKTtcbiAgICAgIGNvbnN0IGhhc0Zvcm1hdCA9IEJvb2xlYW4odG9vbHRpcEZpZWxkLmZvcm1hdCk7XG4gICAgICBjb25zdCBzZWxlY3Rpb25JbmRleCA9IGZvcm1hdExhYmVscy5maW5kSW5kZXgoZmwgPT4gZ2V0VmFsdWUoZmwpID09PSB0b29sdGlwRmllbGQuZm9ybWF0KTtcbiAgICAgIGNvbnN0IGhhc2hTdHlsZSA9IHNob3cgPyBoYXNoU3R5bGVzLlNIT1cgOiBoYXNGb3JtYXQgPyBoYXNoU3R5bGVzLkFDVElWRSA6IG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDaGlja2xldEJ1dHRvbiByZWY9e25vZGUgPT4gKHRoaXMubm9kZSA9IG5vZGUpfT5cbiAgICAgICAgICA8Q2hpY2tsZXRUYWc+e25hbWV9PC9DaGlja2xldFRhZz5cbiAgICAgICAgICB7Zm9ybWF0TGFiZWxzLmxlbmd0aCA+IDEgJiYgKFxuICAgICAgICAgICAgPENoaWNrbGV0QWRkb25XcmFwcGVyPlxuICAgICAgICAgICAgICA8Q2hpY2tsZXRBZGRvbiBkYXRhLXRpcCBkYXRhLWZvcj17YGFkZG9uLSR7bmFtZX1gfT5cbiAgICAgICAgICAgICAgICA8SWNvbkRpdiBzdGF0dXM9e2hhc2hTdHlsZX0+XG4gICAgICAgICAgICAgICAgICA8SGFzaFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCI4cHhcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3c6IEJvb2xlYW4oIXNob3cpfSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbkRpdj5cbiAgICAgICAgICAgICAgICA8VG9vbHRpcCBpZD17YGFkZG9uLSR7bmFtZX1gfSBlZmZlY3Q9XCJzb2xpZFwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHtoYXNGb3JtYXQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgZ2V0Rm9ybWF0VG9vbHRpcChmb3JtYXRMYWJlbHMsIHRvb2x0aXBGaWVsZC5mb3JtYXQpXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydmaWVsZFNlbGVjdG9yLmZvcm1hdHRpbmcnfSAvPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICAgICAgPC9DaGlja2xldEFkZG9uPlxuICAgICAgICAgICAgICB7c2hvdyAmJiAoXG4gICAgICAgICAgICAgICAgPFN0eWxlZFBvcG92ZXI+XG4gICAgICAgICAgICAgICAgICA8RHJvcGRvd25MaXN0XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2Zvcm1hdExhYmVsc31cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXg9e3NlbGVjdGlvbkluZGV4fVxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5T3B0aW9uPXtpdGVtID0+IGl0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ9eyhyZXN1bHQsIGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZEZpZWxkc1RvU2hvdyA9IGNvbmZpZy5maWVsZHNUb1Nob3dbZGF0YUlkXTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWVsZHNUb1Nob3cgPSBvbGRGaWVsZHNUb1Nob3cubWFwKGZpZWxkVG9TaG93ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFRvU2hvdy5uYW1lID09PSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogZ2V0VmFsdWUocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBmaWVsZFRvU2hvdztcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHNUb1Nob3c6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uY29uZmlnLmZpZWxkc1RvU2hvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW2RhdGFJZF06IGZpZWxkc1RvU2hvd1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UobmV3Q29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRQb3BvdmVyPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9DaGlja2xldEFkZG9uV3JhcHBlcj5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxEZWxldGUgb25DbGljaz17ZGlzYWJsZWQgPyBudWxsIDogcmVtb3ZlfSAvPlxuICAgICAgICA8L0NoaWNrbGV0QnV0dG9uPlxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9uQ2xpY2tPdXRzaWRlKFRvb2x0aXBDaGlja2xldCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRvb2x0aXBDaGlja2xldEZhY3Rvcnk7XG4iXX0=