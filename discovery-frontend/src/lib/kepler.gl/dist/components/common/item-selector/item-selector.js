"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

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

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = _interopRequireDefault(require("lodash.uniqby"));

var _reactOnclickoutside = _interopRequireDefault(require("react-onclickoutside"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _accessor = _interopRequireDefault(require("./accessor"));

var _chickletedInput = _interopRequireDefault(require("./chickleted-input"));

var _typeahead = _interopRequireDefault(require("./typeahead"));

var _icons = require("../icons");

var _dropdownList = _interopRequireWildcard(require("./dropdown-list"));

var _utils = require("../../../utils/utils");

var _reactIntl = require("react-intl");

var _localization = require("../../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  border: 0;\n  width: 100%;\n  left: 0;\n  z-index: ", ";\n  position: absolute;\n  bottom: ", ";\n  margin-top: ", ";\n  margin-bottom: ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-left: 6px;\n  display: flex;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  overflow: hidden;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n\n  height: ", "px;\n\n  .list__item__anchor {\n    ", ";\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledDropdownSelect = _styledComponents["default"].div.attrs({
  className: 'item-selector__dropdown'
})(_templateObject(), function (props) {
  return props.inputTheme === 'secondary' ? props.theme.secondaryInput : props.theme.input;
}, function (props) {
  return props.theme.dropdownSelectHeight;
}, function (props) {
  return props.theme.dropdownListAnchor;
});

var DropdownSelectValue = _styledComponents["default"].span(_templateObject2(), function (props) {
  return props.hasPlaceholder ? props.theme.selectColorPlaceHolder : props.theme.selectColor;
});

var DropdownSelectErase = _styledComponents["default"].div(_templateObject3());

var DropdownWrapper = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.dropdownWrapperZ;
}, function (props) {
  return props.placement === 'top' ? props.theme.inputBoxHeight : 'auto';
}, function (props) {
  return props.placement === 'bottom' ? "".concat(props.theme.dropdownWapperMargin, "px") : 'auto';
}, function (props) {
  return props.placement === 'top' ? "".concat(props.theme.dropdownWapperMargin, "px") : 'auto';
});

var ItemSelector = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(ItemSelector, _Component);

  var _super = _createSuper(ItemSelector);

  function ItemSelector() {
    var _this;

    (0, _classCallCheck2["default"])(this, ItemSelector);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      showTypeahead: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleClickOutside", function () {
      _this._hideTypeahead();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onBlur", function () {
      // note: chickleted input is not a real form element so we call onBlur()
      // when we feel the events are appropriate
      if (_this.props.onBlur) {
        _this.props.onBlur();
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_removeItem", function (item, e) {
      // only used when multiSelect = true
      e.preventDefault();
      e.stopPropagation();
      var selectedItems = _this.props.selectedItems;
      var index = selectedItems.findIndex(function (t) {
        return t === item;
      });

      if (index < 0) {
        return;
      }

      var items = [].concat((0, _toConsumableArray2["default"])(selectedItems.slice(0, index)), (0, _toConsumableArray2["default"])(selectedItems.slice(index + 1, selectedItems.length)));

      _this.props.onChange(items);

      if (_this.props.closeOnSelect) {
        _this.setState({
          showTypeahead: false
        });

        _this._onBlur();
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_selectItem", function (item) {
      var getValue = _accessor["default"].generateOptionToStringFor(_this.props.getOptionValue || _this.props.displayOption);

      var previousSelected = (0, _utils.toArray)(_this.props.selectedItems);

      if (_this.props.multiSelect) {
        var items = (0, _lodash["default"])(previousSelected.concat((0, _utils.toArray)(item)), getValue);

        _this.props.onChange(items);
      } else {
        _this.props.onChange(getValue(item));
      }

      if (_this.props.closeOnSelect) {
        _this.setState({
          showTypeahead: false
        });

        _this._onBlur();
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onErase", function (e) {
      e.stopPropagation();

      _this.props.onChange(null);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_showTypeahead", function (e) {
      e.stopPropagation();

      if (!_this.props.disabled) {
        _this.setState({
          showTypeahead: true
        });
      }
    });
    return _this;
  }

  (0, _createClass2["default"])(ItemSelector, [{
    key: "_hideTypeahead",
    value: function _hideTypeahead() {
      this.setState({
        showTypeahead: false
      });

      this._onBlur();
    }
  }, {
    key: "_renderDropdown",
    value: function _renderDropdown(intl) {
      return /*#__PURE__*/_react["default"].createElement(DropdownWrapper, {
        placement: this.props.placement
      }, /*#__PURE__*/_react["default"].createElement(_typeahead["default"], {
        customClasses: {
          results: 'list-selector',
          input: 'typeahead__input',
          listItem: 'list__item',
          listAnchor: 'list__item__anchor'
        },
        options: this.props.options,
        filterOption: this.props.filterOption,
        fixedOptions: this.props.fixedOptions,
        placeholder: intl.formatMessage({
          id: 'placeholder.search'
        }),
        onOptionSelected: this._selectItem,
        customListComponent: this.props.DropDownRenderComponent,
        customListHeaderComponent: this.props.DropdownHeaderComponent,
        customListItemComponent: this.props.DropDownLineItemRenderComponent,
        displayOption: _accessor["default"].generateOptionToStringFor(this.props.displayOption),
        searchable: this.props.searchable,
        showOptionsWhenEmpty: true,
        selectedItems: (0, _utils.toArray)(this.props.selectedItems)
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var selected = (0, _utils.toArray)(this.props.selectedItems);
      var hasValue = selected.length;

      var displayOption = _accessor["default"].generateOptionToStringFor(this.props.displayOption);

      var dropdownSelectProps = {
        className: (0, _classnames["default"])({
          active: this.state.showTypeahead
        }),
        disabled: this.props.disabled,
        onClick: this._showTypeahead,
        onFocus: this._showPopover,
        error: this.props.isError,
        inputTheme: this.props.inputTheme
      };
      var intl = this.props.intl;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "item-selector"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        style: {
          position: 'relative'
        }
      }, this.props.multiSelect ? /*#__PURE__*/_react["default"].createElement(_chickletedInput["default"], (0, _extends2["default"])({}, dropdownSelectProps, {
        selectedItems: (0, _utils.toArray)(this.props.selectedItems),
        placeholder: this.props.placeholder,
        displayOption: displayOption,
        removeItem: this._removeItem,
        CustomChickletComponent: this.props.CustomChickletComponent
      })) : /*#__PURE__*/_react["default"].createElement(StyledDropdownSelect, dropdownSelectProps, /*#__PURE__*/_react["default"].createElement(DropdownSelectValue, {
        hasPlaceholder: !hasValue,
        className: "item-selector__dropdown__value"
      }, hasValue ? /*#__PURE__*/_react["default"].createElement(this.props.DropDownLineItemRenderComponent, {
        displayOption: displayOption,
        value: selected[0]
      }) : /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: this.props.placeholder
      })), this.props.erasable && hasValue ? /*#__PURE__*/_react["default"].createElement(DropdownSelectErase, null, /*#__PURE__*/_react["default"].createElement(_icons.Delete, {
        height: "12px",
        onClick: this._onErase
      })) : null), this.state.showTypeahead && this._renderDropdown(intl)));
    }
  }]);
  return ItemSelector;
}(_react.Component);

(0, _defineProperty2["default"])(ItemSelector, "propTypes", {
  // required properties
  selectedItems: _propTypes["default"].oneOfType([_propTypes["default"].array, _propTypes["default"].string, _propTypes["default"].number, _propTypes["default"].bool, _propTypes["default"].object]),
  onChange: _propTypes["default"].func.isRequired,
  options: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
  // optional properties
  fixedOptions: _propTypes["default"].arrayOf(_propTypes["default"].any),
  erasable: _propTypes["default"].bool,
  displayOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  getOptionValue: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  filterOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  placement: _propTypes["default"].string,
  disabled: _propTypes["default"].bool,
  isError: _propTypes["default"].bool,
  multiSelect: _propTypes["default"].bool,
  inputTheme: _propTypes["default"].string,
  onBlur: _propTypes["default"].func,
  placeholder: _propTypes["default"].string,
  closeOnSelect: _propTypes["default"].bool,
  DropdownHeaderComponent: _propTypes["default"].func,
  DropDownRenderComponent: _propTypes["default"].func,
  DropDownLineItemRenderComponent: _propTypes["default"].func,
  CustomChickletComponent: _propTypes["default"].func
});
(0, _defineProperty2["default"])(ItemSelector, "defaultProps", {
  erasable: false,
  placement: 'bottom',
  selectedItems: [],
  displayOption: null,
  getOptionValue: null,
  filterOption: null,
  fixedOptions: null,
  inputTheme: 'primary',
  multiSelect: true,
  placeholder: 'placeholder.enterValue',
  closeOnSelect: true,
  searchable: true,
  dropdownHeader: null,
  DropdownHeaderComponent: null,
  DropDownRenderComponent: _dropdownList["default"],
  DropDownLineItemRenderComponent: _dropdownList.ListItem
});

var _default = (0, _reactIntl.injectIntl)((0, _reactOnclickoutside["default"])(ItemSelector));

exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9pdGVtLXNlbGVjdG9yL2l0ZW0tc2VsZWN0b3IuanMiXSwibmFtZXMiOlsiU3R5bGVkRHJvcGRvd25TZWxlY3QiLCJzdHlsZWQiLCJkaXYiLCJhdHRycyIsImNsYXNzTmFtZSIsInByb3BzIiwiaW5wdXRUaGVtZSIsInRoZW1lIiwic2Vjb25kYXJ5SW5wdXQiLCJpbnB1dCIsImRyb3Bkb3duU2VsZWN0SGVpZ2h0IiwiZHJvcGRvd25MaXN0QW5jaG9yIiwiRHJvcGRvd25TZWxlY3RWYWx1ZSIsInNwYW4iLCJoYXNQbGFjZWhvbGRlciIsInNlbGVjdENvbG9yUGxhY2VIb2xkZXIiLCJzZWxlY3RDb2xvciIsIkRyb3Bkb3duU2VsZWN0RXJhc2UiLCJEcm9wZG93bldyYXBwZXIiLCJkcm9wZG93bldyYXBwZXJaIiwicGxhY2VtZW50IiwiaW5wdXRCb3hIZWlnaHQiLCJkcm9wZG93bldhcHBlck1hcmdpbiIsIkl0ZW1TZWxlY3RvciIsInNob3dUeXBlYWhlYWQiLCJfaGlkZVR5cGVhaGVhZCIsIm9uQmx1ciIsIml0ZW0iLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzZWxlY3RlZEl0ZW1zIiwiaW5kZXgiLCJmaW5kSW5kZXgiLCJ0IiwiaXRlbXMiLCJzbGljZSIsImxlbmd0aCIsIm9uQ2hhbmdlIiwiY2xvc2VPblNlbGVjdCIsInNldFN0YXRlIiwiX29uQmx1ciIsImdldFZhbHVlIiwiQWNjZXNzb3IiLCJnZW5lcmF0ZU9wdGlvblRvU3RyaW5nRm9yIiwiZ2V0T3B0aW9uVmFsdWUiLCJkaXNwbGF5T3B0aW9uIiwicHJldmlvdXNTZWxlY3RlZCIsIm11bHRpU2VsZWN0IiwiY29uY2F0IiwiZGlzYWJsZWQiLCJpbnRsIiwicmVzdWx0cyIsImxpc3RJdGVtIiwibGlzdEFuY2hvciIsIm9wdGlvbnMiLCJmaWx0ZXJPcHRpb24iLCJmaXhlZE9wdGlvbnMiLCJmb3JtYXRNZXNzYWdlIiwiaWQiLCJfc2VsZWN0SXRlbSIsIkRyb3BEb3duUmVuZGVyQ29tcG9uZW50IiwiRHJvcGRvd25IZWFkZXJDb21wb25lbnQiLCJEcm9wRG93bkxpbmVJdGVtUmVuZGVyQ29tcG9uZW50Iiwic2VhcmNoYWJsZSIsInNlbGVjdGVkIiwiaGFzVmFsdWUiLCJkcm9wZG93blNlbGVjdFByb3BzIiwiYWN0aXZlIiwic3RhdGUiLCJvbkNsaWNrIiwiX3Nob3dUeXBlYWhlYWQiLCJvbkZvY3VzIiwiX3Nob3dQb3BvdmVyIiwiZXJyb3IiLCJpc0Vycm9yIiwicG9zaXRpb24iLCJwbGFjZWhvbGRlciIsIl9yZW1vdmVJdGVtIiwiQ3VzdG9tQ2hpY2tsZXRDb21wb25lbnQiLCJlcmFzYWJsZSIsIl9vbkVyYXNlIiwiX3JlbmRlckRyb3Bkb3duIiwiQ29tcG9uZW50IiwiUHJvcFR5cGVzIiwib25lT2ZUeXBlIiwiYXJyYXkiLCJzdHJpbmciLCJudW1iZXIiLCJib29sIiwib2JqZWN0IiwiZnVuYyIsImlzUmVxdWlyZWQiLCJhcnJheU9mIiwiYW55IiwiZHJvcGRvd25IZWFkZXIiLCJEcm9wZG93bkxpc3QiLCJMaXN0SXRlbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLG9CQUFvQixHQUFHQyw2QkFBT0MsR0FBUCxDQUFXQyxLQUFYLENBQWlCO0FBQzVDQyxFQUFBQSxTQUFTLEVBQUU7QUFEaUMsQ0FBakIsQ0FBSCxvQkFHdEIsVUFBQUMsS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0MsVUFBTixLQUFxQixXQUFyQixHQUFtQ0QsS0FBSyxDQUFDRSxLQUFOLENBQVlDLGNBQS9DLEdBQWdFSCxLQUFLLENBQUNFLEtBQU4sQ0FBWUUs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UTtBQVNwQjBDLEVBQUFBLFdBQVcsRUFBRSxJQVRPO0FBVXBCNkIsRUFBQUEsV0FBVyxFQUFFLHdCQVZPO0FBV3BCdEMsRUFBQUEsYUFBYSxFQUFFLElBWEs7QUFZcEJ5QixFQUFBQSxVQUFVLEVBQUUsSUFaUTtBQWFwQitCLEVBQUFBLGNBQWMsRUFBRSxJQWJJO0FBY3BCakMsRUFBQUEsdUJBQXVCLEVBQUUsSUFkTDtBQWVwQkQsRUFBQUEsdUJBQXVCLEVBQUVtQyx3QkFmTDtBQWdCcEJqQyxFQUFBQSwrQkFBK0IsRUFBRWtDO0FBaEJiLEM7O2VBeUxULDJCQUFXLHFDQUFzQjFFLFlBQXRCLENBQVgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHVuaXFCeSBmcm9tICdsb2Rhc2gudW5pcWJ5JztcbmltcG9ydCBsaXN0ZW5zVG9DbGlja091dHNpZGUgZnJvbSAncmVhY3Qtb25jbGlja291dHNpZGUnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5cbmltcG9ydCBBY2Nlc3NvciBmcm9tICcuL2FjY2Vzc29yJztcbmltcG9ydCBDaGlja2xldGVkSW5wdXQgZnJvbSAnLi9jaGlja2xldGVkLWlucHV0JztcbmltcG9ydCBUeXBlYWhlYWQgZnJvbSAnLi90eXBlYWhlYWQnO1xuaW1wb3J0IHtEZWxldGV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBEcm9wZG93bkxpc3QsIHtMaXN0SXRlbX0gZnJvbSAnLi9kcm9wZG93bi1saXN0JztcblxuaW1wb3J0IHt0b0FycmF5fSBmcm9tICd1dGlscy91dGlscyc7XG5pbXBvcnQge2luamVjdEludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBTdHlsZWREcm9wZG93blNlbGVjdCA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdpdGVtLXNlbGVjdG9yX19kcm9wZG93bidcbn0pYFxuICAke3Byb3BzID0+IChwcm9wcy5pbnB1dFRoZW1lID09PSAnc2Vjb25kYXJ5JyA/IHByb3BzLnRoZW1lLnNlY29uZGFyeUlucHV0IDogcHJvcHMudGhlbWUuaW5wdXQpfTtcblxuICBoZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25TZWxlY3RIZWlnaHR9cHg7XG5cbiAgLmxpc3RfX2l0ZW1fX2FuY2hvciB7XG4gICAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bkxpc3RBbmNob3J9O1xuICB9XG5gO1xuXG5jb25zdCBEcm9wZG93blNlbGVjdFZhbHVlID0gc3R5bGVkLnNwYW5gXG4gIGNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuaGFzUGxhY2Vob2xkZXIgPyBwcm9wcy50aGVtZS5zZWxlY3RDb2xvclBsYWNlSG9sZGVyIDogcHJvcHMudGhlbWUuc2VsZWN0Q29sb3J9O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuYDtcblxuY29uc3QgRHJvcGRvd25TZWxlY3RFcmFzZSA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbi1sZWZ0OiA2cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG5gO1xuXG5jb25zdCBEcm9wZG93bldyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBib3JkZXI6IDA7XG4gIHdpZHRoOiAxMDAlO1xuICBsZWZ0OiAwO1xuICB6LWluZGV4OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmRyb3Bkb3duV3JhcHBlclp9O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGJvdHRvbTogJHtwcm9wcyA9PiAocHJvcHMucGxhY2VtZW50ID09PSAndG9wJyA/IHByb3BzLnRoZW1lLmlucHV0Qm94SGVpZ2h0IDogJ2F1dG8nKX07XG4gIG1hcmdpbi10b3A6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5wbGFjZW1lbnQgPT09ICdib3R0b20nID8gYCR7cHJvcHMudGhlbWUuZHJvcGRvd25XYXBwZXJNYXJnaW59cHhgIDogJ2F1dG8nfTtcbiAgbWFyZ2luLWJvdHRvbTogJHtwcm9wcyA9PlxuICAgIHByb3BzLnBsYWNlbWVudCA9PT0gJ3RvcCcgPyBgJHtwcm9wcy50aGVtZS5kcm9wZG93bldhcHBlck1hcmdpbn1weGAgOiAnYXV0byd9O1xuYDtcblxuY2xhc3MgSXRlbVNlbGVjdG9yIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvLyByZXF1aXJlZCBwcm9wZXJ0aWVzXG4gICAgc2VsZWN0ZWRJdGVtczogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuYXJyYXksXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIFByb3BUeXBlcy5ib29sLFxuICAgICAgUHJvcFR5cGVzLm9iamVjdFxuICAgIF0pLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9wdGlvbnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG5cbiAgICAvLyBvcHRpb25hbCBwcm9wZXJ0aWVzXG4gICAgZml4ZWRPcHRpb25zOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuYW55KSxcbiAgICBlcmFzYWJsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBnZXRPcHRpb25WYWx1ZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBmaWx0ZXJPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgcGxhY2VtZW50OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpc0Vycm9yOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBtdWx0aVNlbGVjdDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5wdXRUaGVtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNsb3NlT25TZWxlY3Q6IFByb3BUeXBlcy5ib29sLFxuICAgIERyb3Bkb3duSGVhZGVyQ29tcG9uZW50OiBQcm9wVHlwZXMuZnVuYyxcbiAgICBEcm9wRG93blJlbmRlckNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgRHJvcERvd25MaW5lSXRlbVJlbmRlckNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgQ3VzdG9tQ2hpY2tsZXRDb21wb25lbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBlcmFzYWJsZTogZmFsc2UsXG4gICAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgICBzZWxlY3RlZEl0ZW1zOiBbXSxcbiAgICBkaXNwbGF5T3B0aW9uOiBudWxsLFxuICAgIGdldE9wdGlvblZhbHVlOiBudWxsLFxuICAgIGZpbHRlck9wdGlvbjogbnVsbCxcbiAgICBmaXhlZE9wdGlvbnM6IG51bGwsXG4gICAgaW5wdXRUaGVtZTogJ3ByaW1hcnknLFxuICAgIG11bHRpU2VsZWN0OiB0cnVlLFxuICAgIHBsYWNlaG9sZGVyOiAncGxhY2Vob2xkZXIuZW50ZXJWYWx1ZScsXG4gICAgY2xvc2VPblNlbGVjdDogdHJ1ZSxcbiAgICBzZWFyY2hhYmxlOiB0cnVlLFxuICAgIGRyb3Bkb3duSGVhZGVyOiBudWxsLFxuICAgIERyb3Bkb3duSGVhZGVyQ29tcG9uZW50OiBudWxsLFxuICAgIERyb3BEb3duUmVuZGVyQ29tcG9uZW50OiBEcm9wZG93bkxpc3QsXG4gICAgRHJvcERvd25MaW5lSXRlbVJlbmRlckNvbXBvbmVudDogTGlzdEl0ZW1cbiAgfTtcblxuICBzdGF0ZSA9IHtcbiAgICBzaG93VHlwZWFoZWFkOiBmYWxzZVxuICB9O1xuXG4gIGhhbmRsZUNsaWNrT3V0c2lkZSA9ICgpID0+IHtcbiAgICB0aGlzLl9oaWRlVHlwZWFoZWFkKCk7XG4gIH07XG5cbiAgX2hpZGVUeXBlYWhlYWQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1R5cGVhaGVhZDogZmFsc2V9KTtcbiAgICB0aGlzLl9vbkJsdXIoKTtcbiAgfVxuXG4gIF9vbkJsdXIgPSAoKSA9PiB7XG4gICAgLy8gbm90ZTogY2hpY2tsZXRlZCBpbnB1dCBpcyBub3QgYSByZWFsIGZvcm0gZWxlbWVudCBzbyB3ZSBjYWxsIG9uQmx1cigpXG4gICAgLy8gd2hlbiB3ZSBmZWVsIHRoZSBldmVudHMgYXJlIGFwcHJvcHJpYXRlXG4gICAgaWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQmx1cigpO1xuICAgIH1cbiAgfTtcblxuICBfcmVtb3ZlSXRlbSA9IChpdGVtLCBlKSA9PiB7XG4gICAgLy8gb25seSB1c2VkIHdoZW4gbXVsdGlTZWxlY3QgPSB0cnVlXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29uc3Qge3NlbGVjdGVkSXRlbXN9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpbmRleCA9IHNlbGVjdGVkSXRlbXMuZmluZEluZGV4KHQgPT4gdCA9PT0gaXRlbSk7XG5cbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbXMgPSBbXG4gICAgICAuLi5zZWxlY3RlZEl0ZW1zLnNsaWNlKDAsIGluZGV4KSxcbiAgICAgIC4uLnNlbGVjdGVkSXRlbXMuc2xpY2UoaW5kZXggKyAxLCBzZWxlY3RlZEl0ZW1zLmxlbmd0aClcbiAgICBdO1xuXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShpdGVtcyk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jbG9zZU9uU2VsZWN0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG93VHlwZWFoZWFkOiBmYWxzZX0pO1xuICAgICAgdGhpcy5fb25CbHVyKCk7XG4gICAgfVxuICB9O1xuXG4gIF9zZWxlY3RJdGVtID0gaXRlbSA9PiB7XG4gICAgY29uc3QgZ2V0VmFsdWUgPSBBY2Nlc3Nvci5nZW5lcmF0ZU9wdGlvblRvU3RyaW5nRm9yKFxuICAgICAgdGhpcy5wcm9wcy5nZXRPcHRpb25WYWx1ZSB8fCB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb25cbiAgICApO1xuXG4gICAgY29uc3QgcHJldmlvdXNTZWxlY3RlZCA9IHRvQXJyYXkodGhpcy5wcm9wcy5zZWxlY3RlZEl0ZW1zKTtcblxuICAgIGlmICh0aGlzLnByb3BzLm11bHRpU2VsZWN0KSB7XG4gICAgICBjb25zdCBpdGVtcyA9IHVuaXFCeShwcmV2aW91c1NlbGVjdGVkLmNvbmNhdCh0b0FycmF5KGl0ZW0pKSwgZ2V0VmFsdWUpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShpdGVtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZ2V0VmFsdWUoaXRlbSkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLmNsb3NlT25TZWxlY3QpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dUeXBlYWhlYWQ6IGZhbHNlfSk7XG4gICAgICB0aGlzLl9vbkJsdXIoKTtcbiAgICB9XG4gIH07XG5cbiAgX29uRXJhc2UgPSBlID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCk7XG4gIH07XG5cbiAgX3Nob3dUeXBlYWhlYWQgPSBlID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3dUeXBlYWhlYWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBfcmVuZGVyRHJvcGRvd24oaW50bCkge1xuICAgIHJldHVybiAoXG4gICAgICA8RHJvcGRvd25XcmFwcGVyIHBsYWNlbWVudD17dGhpcy5wcm9wcy5wbGFjZW1lbnR9PlxuICAgICAgICA8VHlwZWFoZWFkXG4gICAgICAgICAgY3VzdG9tQ2xhc3Nlcz17e1xuICAgICAgICAgICAgcmVzdWx0czogJ2xpc3Qtc2VsZWN0b3InLFxuICAgICAgICAgICAgaW5wdXQ6ICd0eXBlYWhlYWRfX2lucHV0JyxcbiAgICAgICAgICAgIGxpc3RJdGVtOiAnbGlzdF9faXRlbScsXG4gICAgICAgICAgICBsaXN0QW5jaG9yOiAnbGlzdF9faXRlbV9fYW5jaG9yJ1xuICAgICAgICAgIH19XG4gICAgICAgICAgb3B0aW9ucz17dGhpcy5wcm9wcy5vcHRpb25zfVxuICAgICAgICAgIGZpbHRlck9wdGlvbj17dGhpcy5wcm9wcy5maWx0ZXJPcHRpb259XG4gICAgICAgICAgZml4ZWRPcHRpb25zPXt0aGlzLnByb3BzLmZpeGVkT3B0aW9uc31cbiAgICAgICAgICBwbGFjZWhvbGRlcj17aW50bC5mb3JtYXRNZXNzYWdlKHtpZDogJ3BsYWNlaG9sZGVyLnNlYXJjaCd9KX1cbiAgICAgICAgICBvbk9wdGlvblNlbGVjdGVkPXt0aGlzLl9zZWxlY3RJdGVtfVxuICAgICAgICAgIGN1c3RvbUxpc3RDb21wb25lbnQ9e3RoaXMucHJvcHMuRHJvcERvd25SZW5kZXJDb21wb25lbnR9XG4gICAgICAgICAgY3VzdG9tTGlzdEhlYWRlckNvbXBvbmVudD17dGhpcy5wcm9wcy5Ecm9wZG93bkhlYWRlckNvbXBvbmVudH1cbiAgICAgICAgICBjdXN0b21MaXN0SXRlbUNvbXBvbmVudD17dGhpcy5wcm9wcy5Ecm9wRG93bkxpbmVJdGVtUmVuZGVyQ29tcG9uZW50fVxuICAgICAgICAgIGRpc3BsYXlPcHRpb249e0FjY2Vzc29yLmdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IodGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uKX1cbiAgICAgICAgICBzZWFyY2hhYmxlPXt0aGlzLnByb3BzLnNlYXJjaGFibGV9XG4gICAgICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHlcbiAgICAgICAgICBzZWxlY3RlZEl0ZW1zPXt0b0FycmF5KHRoaXMucHJvcHMuc2VsZWN0ZWRJdGVtcyl9XG4gICAgICAgIC8+XG4gICAgICA8L0Ryb3Bkb3duV3JhcHBlcj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gdG9BcnJheSh0aGlzLnByb3BzLnNlbGVjdGVkSXRlbXMpO1xuICAgIGNvbnN0IGhhc1ZhbHVlID0gc2VsZWN0ZWQubGVuZ3RoO1xuICAgIGNvbnN0IGRpc3BsYXlPcHRpb24gPSBBY2Nlc3Nvci5nZW5lcmF0ZU9wdGlvblRvU3RyaW5nRm9yKHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbik7XG5cbiAgICBjb25zdCBkcm9wZG93blNlbGVjdFByb3BzID0ge1xuICAgICAgY2xhc3NOYW1lOiBjbGFzc25hbWVzKHtcbiAgICAgICAgYWN0aXZlOiB0aGlzLnN0YXRlLnNob3dUeXBlYWhlYWRcbiAgICAgIH0pLFxuICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICBvbkNsaWNrOiB0aGlzLl9zaG93VHlwZWFoZWFkLFxuICAgICAgb25Gb2N1czogdGhpcy5fc2hvd1BvcG92ZXIsXG4gICAgICBlcnJvcjogdGhpcy5wcm9wcy5pc0Vycm9yLFxuICAgICAgaW5wdXRUaGVtZTogdGhpcy5wcm9wcy5pbnB1dFRoZW1lXG4gICAgfTtcbiAgICBjb25zdCBpbnRsID0gdGhpcy5wcm9wcy5pbnRsO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICA8ZGl2IHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZSd9fT5cbiAgICAgICAgICB7LyogdGhpcyBwYXJ0IGlzIHVzZWQgdG8gZGlzcGxheSB0aGUgbGFiZWwgKi99XG4gICAgICAgICAge3RoaXMucHJvcHMubXVsdGlTZWxlY3QgPyAoXG4gICAgICAgICAgICA8Q2hpY2tsZXRlZElucHV0XG4gICAgICAgICAgICAgIHsuLi5kcm9wZG93blNlbGVjdFByb3BzfVxuICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW1zPXt0b0FycmF5KHRoaXMucHJvcHMuc2VsZWN0ZWRJdGVtcyl9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICBkaXNwbGF5T3B0aW9uPXtkaXNwbGF5T3B0aW9ufVxuICAgICAgICAgICAgICByZW1vdmVJdGVtPXt0aGlzLl9yZW1vdmVJdGVtfVxuICAgICAgICAgICAgICBDdXN0b21DaGlja2xldENvbXBvbmVudD17dGhpcy5wcm9wcy5DdXN0b21DaGlja2xldENvbXBvbmVudH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxTdHlsZWREcm9wZG93blNlbGVjdCB7Li4uZHJvcGRvd25TZWxlY3RQcm9wc30+XG4gICAgICAgICAgICAgIDxEcm9wZG93blNlbGVjdFZhbHVlXG4gICAgICAgICAgICAgICAgaGFzUGxhY2Vob2xkZXI9eyFoYXNWYWx1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpdGVtLXNlbGVjdG9yX19kcm9wZG93bl9fdmFsdWVcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hhc1ZhbHVlID8gKFxuICAgICAgICAgICAgICAgICAgPHRoaXMucHJvcHMuRHJvcERvd25MaW5lSXRlbVJlbmRlckNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5T3B0aW9uPXtkaXNwbGF5T3B0aW9ufVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRbMF19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn0gLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L0Ryb3Bkb3duU2VsZWN0VmFsdWU+XG4gICAgICAgICAgICAgIHt0aGlzLnByb3BzLmVyYXNhYmxlICYmIGhhc1ZhbHVlID8gKFxuICAgICAgICAgICAgICAgIDxEcm9wZG93blNlbGVjdEVyYXNlPlxuICAgICAgICAgICAgICAgICAgPERlbGV0ZSBoZWlnaHQ9XCIxMnB4XCIgb25DbGljaz17dGhpcy5fb25FcmFzZX0gLz5cbiAgICAgICAgICAgICAgICA8L0Ryb3Bkb3duU2VsZWN0RXJhc2U+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9TdHlsZWREcm9wZG93blNlbGVjdD5cbiAgICAgICAgICApfVxuICAgICAgICAgIHsvKiB0aGlzIHBhcnQgaXMgdXNlZCB0byBidWlsdCB0aGUgbGlzdCAqL31cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5zaG93VHlwZWFoZWFkICYmIHRoaXMuX3JlbmRlckRyb3Bkb3duKGludGwpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0SW50bChsaXN0ZW5zVG9DbGlja091dHNpZGUoSXRlbVNlbGVjdG9yKSk7XG4iXX0=