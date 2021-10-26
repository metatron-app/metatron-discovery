"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ChickletTag = exports.ChickletButton = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _delete = _interopRequireDefault(require("../icons/delete"));

var _localization = require("../../../localization");

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", "\n\n  color: ", ";\n  overflow: hidden;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-right: 10px;\n  text-overflow: ellipsis;\n  width: 100%;\n  overflow: hidden;\n\n  :hover {\n    overflow: visible;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background: ", ";\n  border-radius: 1px;\n  color: ", ";\n  font-size: 11px;\n  line-height: 20px;\n  margin: 4px 10px 4px 3px;\n  padding: 2px 6px;\n  display: flex;\n  align-items: center;\n  max-width: calc(100% - 8px);\n\n  :hover {\n    color: ", ";\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var propTypes = {
  // required properties
  onClick: _propTypes["default"].func.isRequired,
  removeItem: _propTypes["default"].func.isRequired,
  // optional properties
  selectedItems: _propTypes["default"].arrayOf(_propTypes["default"].any),
  disabled: _propTypes["default"].bool,
  displayOption: _propTypes["default"].func,
  focus: _propTypes["default"].bool,
  error: _propTypes["default"].bool,
  placeholder: _propTypes["default"].string,
  inputTheme: _propTypes["default"].string
};

var ChickletButton = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.chickletBgd;
}, function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.textColorHl;
});

exports.ChickletButton = ChickletButton;

var ChickletTag = _styledComponents["default"].span(_templateObject2());

exports.ChickletTag = ChickletTag;

var Chicklet = function Chicklet(_ref) {
  var disabled = _ref.disabled,
      name = _ref.name,
      remove = _ref.remove;
  return /*#__PURE__*/_react["default"].createElement(ChickletButton, null, /*#__PURE__*/_react["default"].createElement(ChickletTag, null, name), /*#__PURE__*/_react["default"].createElement(_delete["default"], {
    onClick: disabled ? null : remove
  }));
};

var ChickletedInputContainer = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.inputTheme === 'secondary' ? props.theme.secondaryChickletedInput : props.theme.chickletedInput;
}, function (props) {
  return props.hasPlaceholder ? props.theme.selectColorPlaceHolder : props.theme.selectColor;
});

var ChickletedInput = function ChickletedInput(_ref2) {
  var focus = _ref2.focus,
      disabled = _ref2.disabled,
      error = _ref2.error,
      onClick = _ref2.onClick,
      className = _ref2.className,
      _ref2$selectedItems = _ref2.selectedItems,
      selectedItems = _ref2$selectedItems === void 0 ? [] : _ref2$selectedItems,
      _ref2$placeholder = _ref2.placeholder,
      placeholder = _ref2$placeholder === void 0 ? '' : _ref2$placeholder,
      removeItem = _ref2.removeItem,
      _ref2$displayOption = _ref2.displayOption,
      displayOption = _ref2$displayOption === void 0 ? function (d) {
    return d;
  } : _ref2$displayOption,
      inputTheme = _ref2.inputTheme,
      CustomChickletComponent = _ref2.CustomChickletComponent;
  return /*#__PURE__*/_react["default"].createElement(ChickletedInputContainer, {
    className: "".concat(className, " chickleted-input"),
    focus: focus,
    disabled: disabled,
    error: error,
    onClick: onClick,
    inputTheme: inputTheme,
    hasPlaceholder: !selectedItems || !selectedItems.length
  }, selectedItems.length > 0 ? selectedItems.map(function (item, i) {
    return CustomChickletComponent ? /*#__PURE__*/_react["default"].createElement(CustomChickletComponent, {
      disabled: disabled,
      key: "".concat(displayOption(item), "_").concat(i),
      name: displayOption(item),
      remove: function remove(e) {
        return removeItem(item, e);
      }
    }) : /*#__PURE__*/_react["default"].createElement(Chicklet, {
      disabled: disabled,
      key: "".concat(displayOption(item), "_").concat(i),
      name: displayOption(item),
      remove: function remove(e) {
        return removeItem(item, e);
      }
    });
  }) : /*#__PURE__*/_react["default"].createElement("span", {
    className: "".concat(className, " chickleted-input__placeholder")
  }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: placeholder
  })));
};

ChickletedInput.propTypes = propTypes;
var _default = ChickletedInput;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9pdGVtLXNlbGVjdG9yL2NoaWNrbGV0ZWQtaW5wdXQuanMiXSwibmFtZXMiOlsicHJvcFR5cGVzIiwib25DbGljayIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwicmVtb3ZlSXRlbSIsInNlbGVjdGVkSXRlbXMiLCJhcnJheU9mIiwiYW55IiwiZGlzYWJsZWQiLCJib29sIiwiZGlzcGxheU9wdGlvbiIsImZvY3VzIiwiZXJyb3IiLCJwbGFjZWhvbGRlciIsInN0cmluZyIsImlucHV0VGhlbWUiLCJDaGlja2xldEJ1dHRvbiIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJjaGlja2xldEJnZCIsInRleHRDb2xvciIsInRleHRDb2xvckhsIiwiQ2hpY2tsZXRUYWciLCJzcGFuIiwiQ2hpY2tsZXQiLCJuYW1lIiwicmVtb3ZlIiwiQ2hpY2tsZXRlZElucHV0Q29udGFpbmVyIiwic2Vjb25kYXJ5Q2hpY2tsZXRlZElucHV0IiwiY2hpY2tsZXRlZElucHV0IiwiaGFzUGxhY2Vob2xkZXIiLCJzZWxlY3RDb2xvclBsYWNlSG9sZGVyIiwic2VsZWN0Q29sb3IiLCJDaGlja2xldGVkSW5wdXQiLCJjbGFzc05hbWUiLCJkIiwiQ3VzdG9tQ2hpY2tsZXRDb21wb25lbnQiLCJsZW5ndGgiLCJtYXAiLCJpdGVtIiwiaSIsImUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQVMsR0FBRztBQUNoQjtBQUNBQyxFQUFBQSxPQUFPLEVBQUVDLHNCQUFVQyxJQUFWLENBQWVDLFVBRlI7QUFHaEJDLEVBQUFBLFVBQVUsRUFBRUgsc0JBQVVDLElBQVYsQ0FBZUMsVUFIWDtBQUtoQjtBQUNBRSxFQUFBQSxhQUFhLEVBQUVKLHNCQUFVSyxPQUFWLENBQWtCTCxzQkFB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bkQsS0FTR2xDLGFBQWEsQ0FBQ2tDLE1BQWQsR0FBdUIsQ0FBdkIsR0FDQ2xDLGFBQWEsQ0FBQ21DLEdBQWQsQ0FBa0IsVUFBQ0MsSUFBRCxFQUFPQyxDQUFQO0FBQUEsV0FDaEJKLHVCQUF1QixnQkFDckIsZ0NBQUMsdUJBQUQ7QUFDRSxNQUFBLFFBQVEsRUFBRTlCLFFBRFo7QUFFRSxNQUFBLEdBQUcsWUFBS0UsYUFBYSxDQUFDK0IsSUFBRCxDQUFsQixjQUE0QkMsQ0FBNUIsQ0FGTDtBQUdFLE1BQUEsSUFBSSxFQUFFaEMsYUFBYSxDQUFDK0IsSUFBRCxDQUhyQjtBQUlFLE1BQUEsTUFBTSxFQUFFLGdCQUFBRSxDQUFDO0FBQUEsZUFBSXZDLFVBQVUsQ0FBQ3FDLElBQUQsRUFBT0UsQ0FBUCxDQUFkO0FBQUE7QUFKWCxNQURxQixnQkFRckIsZ0NBQUMsUUFBRDtBQUNFLE1BQUEsUUFBUSxFQUFFbkMsUUFEWjtBQUVFLE1BQUEsR0FBRyxZQUFLRSxhQUFhLENBQUMrQixJQUFELENBQWxCLGNBQTRCQyxDQUE1QixDQUZMO0FBR0UsTUFBQSxJQUFJLEVBQUVoQyxhQUFhLENBQUMrQixJQUFELENBSHJCO0FBSUUsTUFBQSxNQUFNLEVBQUUsZ0JBQUFFLENBQUM7QUFBQSxlQUFJdkMsVUFBVSxDQUFDcUMsSUFBRCxFQUFPRSxDQUFQLENBQWQ7QUFBQTtBQUpYLE1BVGM7QUFBQSxHQUFsQixDQURELGdCQW1CQztBQUFNLElBQUEsU0FBUyxZQUFLUCxTQUFMO0FBQWYsa0JBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsSUFBQSxFQUFFLEVBQUV2QjtBQUF0QixJQURGLENBNUJKLENBYnNCO0FBQUEsQ0FBeEI7O0FBZ0RBc0IsZUFBZSxDQUFDcEMsU0FBaEIsR0FBNEJBLFNBQTVCO2VBRWVvQyxlIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IERlbGV0ZSBmcm9tICcuLi9pY29ucy9kZWxldGUnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIC8vIHJlcXVpcmVkIHByb3BlcnRpZXNcbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgcmVtb3ZlSXRlbTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAvLyBvcHRpb25hbCBwcm9wZXJ0aWVzXG4gIHNlbGVjdGVkSXRlbXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLFxuICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gIGRpc3BsYXlPcHRpb246IFByb3BUeXBlcy5mdW5jLFxuICBmb2N1czogUHJvcFR5cGVzLmJvb2wsXG4gIGVycm9yOiBQcm9wVHlwZXMuYm9vbCxcbiAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGlucHV0VGhlbWU6IFByb3BUeXBlcy5zdHJpbmdcbn07XG5cbmV4cG9ydCBjb25zdCBDaGlja2xldEJ1dHRvbiA9IHN0eWxlZC5kaXZgXG4gIGJhY2tncm91bmQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuY2hpY2tsZXRCZ2R9O1xuICBib3JkZXItcmFkaXVzOiAxcHg7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gIG1hcmdpbjogNHB4IDEwcHggNHB4IDNweDtcbiAgcGFkZGluZzogMnB4IDZweDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWF4LXdpZHRoOiBjYWxjKDEwMCUgLSA4cHgpO1xuXG4gIDpob3ZlciB7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9ySGx9O1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgQ2hpY2tsZXRUYWcgPSBzdHlsZWQuc3BhbmBcbiAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgd2lkdGg6IDEwMCU7XG4gIG92ZXJmbG93OiBoaWRkZW47XG5cbiAgOmhvdmVyIHtcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgfVxuYDtcblxuY29uc3QgQ2hpY2tsZXQgPSAoe2Rpc2FibGVkLCBuYW1lLCByZW1vdmV9KSA9PiAoXG4gIDxDaGlja2xldEJ1dHRvbj5cbiAgICA8Q2hpY2tsZXRUYWc+e25hbWV9PC9DaGlja2xldFRhZz5cbiAgICA8RGVsZXRlIG9uQ2xpY2s9e2Rpc2FibGVkID8gbnVsbCA6IHJlbW92ZX0gLz5cbiAgPC9DaGlja2xldEJ1dHRvbj5cbik7XG5cbmNvbnN0IENoaWNrbGV0ZWRJbnB1dENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gICR7cHJvcHMgPT5cbiAgICBwcm9wcy5pbnB1dFRoZW1lID09PSAnc2Vjb25kYXJ5J1xuICAgICAgPyBwcm9wcy50aGVtZS5zZWNvbmRhcnlDaGlja2xldGVkSW5wdXRcbiAgICAgIDogcHJvcHMudGhlbWUuY2hpY2tsZXRlZElucHV0fVxuXG4gIGNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuaGFzUGxhY2Vob2xkZXIgPyBwcm9wcy50aGVtZS5zZWxlY3RDb2xvclBsYWNlSG9sZGVyIDogcHJvcHMudGhlbWUuc2VsZWN0Q29sb3J9O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuYDtcblxuY29uc3QgQ2hpY2tsZXRlZElucHV0ID0gKHtcbiAgZm9jdXMsXG4gIGRpc2FibGVkLFxuICBlcnJvcixcbiAgb25DbGljayxcbiAgY2xhc3NOYW1lLFxuICBzZWxlY3RlZEl0ZW1zID0gW10sXG4gIHBsYWNlaG9sZGVyID0gJycsXG4gIHJlbW92ZUl0ZW0sXG4gIGRpc3BsYXlPcHRpb24gPSBkID0+IGQsXG4gIGlucHV0VGhlbWUsXG4gIEN1c3RvbUNoaWNrbGV0Q29tcG9uZW50XG59KSA9PiAoXG4gIDxDaGlja2xldGVkSW5wdXRDb250YWluZXJcbiAgICBjbGFzc05hbWU9e2Ake2NsYXNzTmFtZX0gY2hpY2tsZXRlZC1pbnB1dGB9XG4gICAgZm9jdXM9e2ZvY3VzfVxuICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICBlcnJvcj17ZXJyb3J9XG4gICAgb25DbGljaz17b25DbGlja31cbiAgICBpbnB1dFRoZW1lPXtpbnB1dFRoZW1lfVxuICAgIGhhc1BsYWNlaG9sZGVyPXshc2VsZWN0ZWRJdGVtcyB8fCAhc2VsZWN0ZWRJdGVtcy5sZW5ndGh9XG4gID5cbiAgICB7c2VsZWN0ZWRJdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgc2VsZWN0ZWRJdGVtcy5tYXAoKGl0ZW0sIGkpID0+XG4gICAgICAgIEN1c3RvbUNoaWNrbGV0Q29tcG9uZW50ID8gKFxuICAgICAgICAgIDxDdXN0b21DaGlja2xldENvbXBvbmVudFxuICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAga2V5PXtgJHtkaXNwbGF5T3B0aW9uKGl0ZW0pfV8ke2l9YH1cbiAgICAgICAgICAgIG5hbWU9e2Rpc3BsYXlPcHRpb24oaXRlbSl9XG4gICAgICAgICAgICByZW1vdmU9e2UgPT4gcmVtb3ZlSXRlbShpdGVtLCBlKX1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxDaGlja2xldFxuICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAga2V5PXtgJHtkaXNwbGF5T3B0aW9uKGl0ZW0pfV8ke2l9YH1cbiAgICAgICAgICAgIG5hbWU9e2Rpc3BsYXlPcHRpb24oaXRlbSl9XG4gICAgICAgICAgICByZW1vdmU9e2UgPT4gcmVtb3ZlSXRlbShpdGVtLCBlKX1cbiAgICAgICAgICAvPlxuICAgICAgICApXG4gICAgICApXG4gICAgKSA6IChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YCR7Y2xhc3NOYW1lfSBjaGlja2xldGVkLWlucHV0X19wbGFjZWhvbGRlcmB9PlxuICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17cGxhY2Vob2xkZXJ9IC8+XG4gICAgICA8L3NwYW4+XG4gICAgKX1cbiAgPC9DaGlja2xldGVkSW5wdXRDb250YWluZXI+XG4pO1xuXG5DaGlja2xldGVkSW5wdXQucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuXG5leHBvcnQgZGVmYXVsdCBDaGlja2xldGVkSW5wdXQ7XG4iXX0=