"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldListItemFactoryFactory = FieldListItemFactoryFactory;
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

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reselect = require("reselect");

var _itemSelector = _interopRequireDefault(require("./item-selector/item-selector"));

var _dropdownList = require("./item-selector/dropdown-list");

var _utils = require("../../utils/utils");

var _dataUtils = require("../../utils/data-utils");

var _fieldToken = _interopRequireDefault(require("../common/field-token"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  line-height: 0;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: inline-block;\n  margin: 0 ", "px 0 0;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var defaultDisplayOption = function defaultDisplayOption(d) {
  return d.name;
};

var StyledToken = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.fieldTokenRightMargin;
});

var StyledFieldListItem = _styledComponents["default"].div(_templateObject2());

FieldListItemFactoryFactory.deps = [_fieldToken["default"]]; // custom list Item

function FieldListItemFactoryFactory(FieldToken) {
  var FieldListItemFactory = function FieldListItemFactory() {
    var showToken = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var FieldListItem = function FieldListItem(_ref) {
      var value = _ref.value,
          _ref$displayOption = _ref.displayOption,
          displayOption = _ref$displayOption === void 0 ? defaultDisplayOption : _ref$displayOption;
      return /*#__PURE__*/_react["default"].createElement(StyledFieldListItem, {
        className: "field-selector_list-item"
      }, showToken ? /*#__PURE__*/_react["default"].createElement(StyledToken, null, /*#__PURE__*/_react["default"].createElement(FieldToken, {
        type: value.type
      })) : null, /*#__PURE__*/_react["default"].createElement("span", {
        className: _dropdownList.classList.listItemAnchor
      }, displayOption(value)));
    };

    return FieldListItem;
  };

  return FieldListItemFactory;
}

var SuggestedFieldHeader = function SuggestedFieldHeader() {
  return /*#__PURE__*/_react["default"].createElement("div", null, "Suggested Field");
};

var FieldType = _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].arrayOf(_propTypes["default"].string), _propTypes["default"].arrayOf(_propTypes["default"].shape({
  name: _propTypes["default"].string,
  format: _propTypes["default"].string
})), _propTypes["default"].shape({
  format: _propTypes["default"].string,
  id: _propTypes["default"].string,
  name: _propTypes["default"].string,
  tableFieldIndex: _propTypes["default"].number,
  type: _propTypes["default"].number
})]);

var FieldSelectorFactory = function FieldSelectorFactory(FieldListItemFactory) {
  var FieldSelector = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(FieldSelector, _Component);

    var _super = _createSuper(FieldSelector);

    function FieldSelector() {
      var _this;

      (0, _classCallCheck2["default"])(this, FieldSelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldsSelector", function (props) {
        return props.fields;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filteredFieldsSelector", function (props) {
        return props.fields.filter(function (field) {
          return !(0, _utils.toArray)(props.value).find(function (d) {
            return d.name ? d.name === field.name : d === field.name;
          });
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "valueSelector", function (props) {
        return props.value;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filterFieldTypesSelector", function (props) {
        return props.filterFieldTypes;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "showTokenSelector", function (props) {
        return props.showToken;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "selectedItemsSelector", (0, _reselect.createSelector)(_this.fieldsSelector, _this.valueSelector, function (fields, value) {
        return (0, _utils.toArray)(value).map(function (d) {
          return fields.find(function (f) {
            return (0, _dataUtils.notNullorUndefined)(d) && d.name ? d.name === defaultDisplayOption(f) : d === defaultDisplayOption(f);
          });
        }).filter(function (d) {
          return d;
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldOptionsSelector", (0, _reselect.createSelector)(_this.filteredFieldsSelector, _this.filterFieldTypesSelector, function (fields, filterFieldTypes) {
        if (!filterFieldTypes) {
          return fields;
        }

        var filters = Array.isArray(filterFieldTypes) ? filterFieldTypes : [filterFieldTypes];
        return fields.filter(function (f) {
          return filters.includes(f.type);
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldListItemSelector", (0, _reselect.createSelector)(_this.showTokenSelector, FieldListItemFactory));
      return _this;
    }

    (0, _createClass2["default"])(FieldSelector, [{
      key: "render",
      value: function render() {
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "field-selector"
        }, /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], {
          getOptionValue: function getOptionValue(d) {
            return d;
          },
          closeOnSelect: this.props.closeOnSelect,
          displayOption: defaultDisplayOption,
          filterOption: "name",
          fixedOptions: this.props.suggested,
          inputTheme: this.props.inputTheme,
          isError: this.props.error,
          selectedItems: this.selectedItemsSelector(this.props),
          erasable: this.props.erasable,
          options: this.fieldOptionsSelector(this.props),
          multiSelect: this.props.multiSelect,
          placeholder: this.props.placeholder,
          placement: this.props.placement,
          onChange: this.props.onSelect,
          DropDownLineItemRenderComponent: this.fieldListItemSelector(this.props),
          DropdownHeaderComponent: this.props.suggested ? SuggestedFieldHeader : null,
          CustomChickletComponent: this.props.CustomChickletComponent
        }));
      }
    }]);
    return FieldSelector;
  }(_react.Component);

  (0, _defineProperty2["default"])(FieldSelector, "propTypes", {
    fields: _propTypes["default"].oneOfType([_propTypes["default"].array, _propTypes["default"].arrayOf(FieldType)]),
    onSelect: _propTypes["default"].func.isRequired,
    placement: _propTypes["default"].string,
    value: FieldType,
    filterFieldTypes: _propTypes["default"].oneOfType([FieldType, _propTypes["default"].arrayOf(FieldType)]),
    inputTheme: _propTypes["default"].string,
    placeholder: _propTypes["default"].string,
    erasable: _propTypes["default"].bool,
    error: _propTypes["default"].bool,
    multiSelect: _propTypes["default"].bool,
    closeOnSelect: _propTypes["default"].bool,
    showToken: _propTypes["default"].bool,
    suggested: _propTypes["default"].arrayOf(_propTypes["default"].any),
    CustomChickletComponent: _propTypes["default"].func
  });
  (0, _defineProperty2["default"])(FieldSelector, "defaultProps", {
    erasable: true,
    error: false,
    fields: [],
    onSelect: function onSelect() {},
    placement: 'bottom',
    value: null,
    multiSelect: false,
    closeOnSelect: true,
    showToken: true,
    placeholder: 'placeholder.selectField'
  });
  return FieldSelector;
};

FieldSelectorFactory.deps = [FieldListItemFactoryFactory];
var _default = FieldSelectorFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9maWVsZC1zZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0RGlzcGxheU9wdGlvbiIsImQiLCJuYW1lIiwiU3R5bGVkVG9rZW4iLCJzdHlsZWQiLCJkaXYiLCJwcm9wcyIsInRoZW1lIiwiZmllbGRUb2tlblJpZ2h0TWFyZ2luIiwiU3R5bGVkRmllbGRMaXN0SXRlbSIsIkZpZWxkTGlzdEl0ZW1GYWN0b3J5RmFjdG9yeSIsImRlcHMiLCJGaWVsZFRva2VuRmFjdG9yeSIsIkZpZWxkVG9rZW4iLCJGaWVsZExpc3RJdGVtRmFjdG9yeSIsInNob3dUb2tlbiIsIkZpZWxkTGlzdEl0ZW0iLCJ2YWx1ZSIsImRpc3BsYXlPcHRpb24iLCJ0eXBlIiwiY2xhc3NMaXN0IiwibGlzdEl0ZW1BbmNob3IiLCJTdWdnZXN0ZWRGaWVsZEhlYWRlciIsIkZpZWxkVHlwZSIsIlByb3BUeXBlcyIsIm9uZU9mVHlwZSIsInN0cmluZyIsImFycmF5T2YiLCJzaGFwZSIsImZvcm1hdCIsImlkIiwidGFibGVGaWVsZEluZGV4IiwibnVtYmVyIiwiRmllbGRTZWxlY3RvckZhY3RvcnkiLCJGaWVsZFNlbGVjdG9yIiwiZmllbGRzIiwiZmlsdGVyIiwiZmllbGQiLCJmaW5kIiwiZmlsdGVyRmllbGRUeXBlcyIsImZpZWxkc1NlbGVjdG9yIiwidmFsdWVTZWxlY3RvciIsIm1hcCIsImYiLCJmaWx0ZXJlZEZpZWxkc1NlbGVjdG9yIiwiZmlsdGVyRmllbGRUeXBlc1NlbGVjdG9yIiwiZmlsdGVycyIsIkFycmF5IiwiaXNBcnJheSIsImluY2x1ZGVzIiwic2hvd1Rva2VuU2VsZWN0b3IiLCJjbG9zZU9uU2VsZWN0Iiwic3VnZ2VzdGVkIiwiaW5wdXRUaGVtZSIsImVycm9yIiwic2VsZWN0ZWRJdGVtc1NlbGVjdG9yIiwiZXJhc2FibGUiLCJmaWVsZE9wdGlvbnNTZWxlY3RvciIsIm11bHRpU2VsZWN0IiwicGxhY2Vob2xkZXIiLCJwbGFjZW1lbnQiLCJvblNlbGVjdCIsImZpZWxkTGlzdEl0ZW1TZWxlY3RvciIsIkN1c3RvbUNoaWNrbGV0Q29tcG9uZW50IiwiQ29tcG9uZW50IiwiYXJyYXkiLCJmdW5jIiwiaXNSZXF1aXJlZCIsImJvb2wiLCJhbnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsb0JBQW9CLEdBQUcsU0FBdkJBLG9CQUF1QixDQUFBQyxDQUFDO0FBQUEsU0FBSUEsQ0FBQyxDQUFDQyxJQUFOO0FBQUEsQ0FBOUI7O0FBRUEsSUFBTUMsV0FBVyxHQUFHQyw2QkFBT0MsR0FBVixvQkFFSCxVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLHFCQUFoQjtBQUFBLENBRkYsQ0FBakI7O0FBSUEsSUFBTUMsbUJBQW1CLEdBQUdMLDZCQUFPQyxHQUFWLG9CQUF6Qjs7QUFJQUssMkJBQTJCLENBQUNDLElBQTVCLEdBQW1DLENBQUNDLHNCQUFELENBQW5DLEMsQ0FDQTs7QUFDTyxTQUFTRiwyQkFBVCxDQUFxQ0csVUFBckMsRUFBaUQ7QUFDdEQsTUFBTUMsb0JBQW9CLEdBQUcsU0FBdkJBLG9CQUF1QixHQUFzQjtBQUFBLFFBQXJCQyxTQUFxQix1RUFBVCxJQUFTOztBQUNqRCxRQUFNQyxhQUFhLEdBQUcsU0FBaEJBLGFBQWdCO0FBQUEsVUFBRUMsS0FBRixRQUFFQSxLQUFGO0FBQUEsb0NBQVNDLGFBQVQ7QUFBQSxVQUFTQSxhQUFULG1DQUF5QmxCLG9CQUF6QjtBQUFBLDBCQUNwQixnQ0FBQyxtQkFBRDtBQUFxQixRQUFBLFNBQVMsRUFBQztBQUEvQixTQUNHZSxTQUFTLGdCQUNSLGdDQUFDLFdBQUQscUJBQ0UsZ0NBQUMsVUFBRDtBQUFZLFFBQUEsSUFBSSxFQUFFRSxLQUFLLENBQUNFO0FBQXhCLFFBREYs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QVFqQjhCLElBQUFBLFFBQVEsRUFBRWhDLHNCQUFVNEMsSUFSSDtBQVNqQmQsSUFBQUEsS0FBSyxFQUFFOUIsc0JBQVU0QyxJQVRBO0FBVWpCVixJQUFBQSxXQUFXLEVBQUVsQyxzQkFBVTRDLElBVk47QUFXakJqQixJQUFBQSxhQUFhLEVBQUUzQixzQkFBVTRDLElBWFI7QUFZakJyRCxJQUFBQSxTQUFTLEVBQUVTLHNCQUFVNEMsSUFaSjtBQWFqQmhCLElBQUFBLFNBQVMsRUFBRTVCLHNCQUFVRyxPQUFWLENBQWtCSCxzQkFBVTZDLEdBQTVCLENBYk07QUFjakJOLElBQUFBLHVCQUF1QixFQUFFdkMsc0JBQVUwQztBQWRsQixHQUY4QjtBQUFBLG1DQUM3Q2hDLGFBRDZDLGtCQW1CM0I7QUFDcEJzQixJQUFBQSxRQUFRLEVBQUUsSUFEVTtBQUVwQkYsSUFBQUEsS0FBSyxFQUFFLEtBRmE7QUFHcEJuQixJQUFBQSxNQUFNLEVBQUUsRUFIWTtBQUlwQjBCLElBQUFBLFFBQVEsRUFBRSxvQkFBTSxDQUFFLENBSkU7QUFLcEJELElBQUFBLFNBQVMsRUFBRSxRQUxTO0FBTXBCM0MsSUFBQUEsS0FBSyxFQUFFLElBTmE7QUFPcEJ5QyxJQUFBQSxXQUFXLEVBQUUsS0FQTztBQVFwQlAsSUFBQUEsYUFBYSxFQUFFLElBUks7QUFTcEJwQyxJQUFBQSxTQUFTLEVBQUUsSUFUUztBQVVwQjRDLElBQUFBLFdBQVcsRUFBRTtBQVZPLEdBbkIyQjtBQWlHbkQsU0FBT3pCLGFBQVA7QUFDRCxDQWxHRDs7QUFvR0FELG9CQUFvQixDQUFDdEIsSUFBckIsR0FBNEIsQ0FBQ0QsMkJBQUQsQ0FBNUI7ZUFDZXVCLG9CIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5cbmltcG9ydCBJdGVtU2VsZWN0b3IgZnJvbSAnLi9pdGVtLXNlbGVjdG9yL2l0ZW0tc2VsZWN0b3InO1xuaW1wb3J0IHtjbGFzc0xpc3R9IGZyb20gJy4vaXRlbS1zZWxlY3Rvci9kcm9wZG93bi1saXN0JztcbmltcG9ydCB7dG9BcnJheX0gZnJvbSAndXRpbHMvdXRpbHMnO1xuaW1wb3J0IHtub3ROdWxsb3JVbmRlZmluZWR9IGZyb20gJ3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IEZpZWxkVG9rZW5GYWN0b3J5IGZyb20gJy4uL2NvbW1vbi9maWVsZC10b2tlbic7XG5cbmNvbnN0IGRlZmF1bHREaXNwbGF5T3B0aW9uID0gZCA9PiBkLm5hbWU7XG5cbmNvbnN0IFN0eWxlZFRva2VuID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICBtYXJnaW46IDAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5maWVsZFRva2VuUmlnaHRNYXJnaW59cHggMCAwO1xuYDtcbmNvbnN0IFN0eWxlZEZpZWxkTGlzdEl0ZW0gPSBzdHlsZWQuZGl2YFxuICBsaW5lLWhlaWdodDogMDtcbmA7XG5cbkZpZWxkTGlzdEl0ZW1GYWN0b3J5RmFjdG9yeS5kZXBzID0gW0ZpZWxkVG9rZW5GYWN0b3J5XTtcbi8vIGN1c3RvbSBsaXN0IEl0ZW1cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZExpc3RJdGVtRmFjdG9yeUZhY3RvcnkoRmllbGRUb2tlbikge1xuICBjb25zdCBGaWVsZExpc3RJdGVtRmFjdG9yeSA9IChzaG93VG9rZW4gPSB0cnVlKSA9PiB7XG4gICAgY29uc3QgRmllbGRMaXN0SXRlbSA9ICh7dmFsdWUsIGRpc3BsYXlPcHRpb24gPSBkZWZhdWx0RGlzcGxheU9wdGlvbn0pID0+IChcbiAgICAgIDxTdHlsZWRGaWVsZExpc3RJdGVtIGNsYXNzTmFtZT1cImZpZWxkLXNlbGVjdG9yX2xpc3QtaXRlbVwiPlxuICAgICAgICB7c2hvd1Rva2VuID8gKFxuICAgICAgICAgIDxTdHlsZWRUb2tlbj5cbiAgICAgICAgICAgIDxGaWVsZFRva2VuIHR5cGU9e3ZhbHVlLnR5cGV9IC8+XG4gICAgICAgICAgPC9TdHlsZWRUb2tlbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NMaXN0Lmxpc3RJdGVtQW5jaG9yfT57ZGlzcGxheU9wdGlvbih2YWx1ZSl9PC9zcGFuPlxuICAgICAgPC9TdHlsZWRGaWVsZExpc3RJdGVtPlxuICAgICk7XG4gICAgcmV0dXJuIEZpZWxkTGlzdEl0ZW07XG4gIH07XG4gIHJldHVybiBGaWVsZExpc3RJdGVtRmFjdG9yeTtcbn1cblxuY29uc3QgU3VnZ2VzdGVkRmllbGRIZWFkZXIgPSAoKSA9PiA8ZGl2PlN1Z2dlc3RlZCBGaWVsZDwvZGl2PjtcblxuY29uc3QgRmllbGRUeXBlID0gUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gIFByb3BUeXBlcy5zdHJpbmcsXG4gIFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICBQcm9wVHlwZXMuYXJyYXlPZihcbiAgICBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIGZvcm1hdDogUHJvcFR5cGVzLnN0cmluZ1xuICAgIH0pXG4gICksXG4gIFByb3BUeXBlcy5zaGFwZSh7XG4gICAgZm9ybWF0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGlkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgdGFibGVGaWVsZEluZGV4OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHR5cGU6IFByb3BUeXBlcy5udW1iZXJcbiAgfSlcbl0pO1xuXG5jb25zdCBGaWVsZFNlbGVjdG9yRmFjdG9yeSA9IEZpZWxkTGlzdEl0ZW1GYWN0b3J5ID0+IHtcbiAgY2xhc3MgRmllbGRTZWxlY3RvciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIGZpZWxkczogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmFycmF5LCBQcm9wVHlwZXMuYXJyYXlPZihGaWVsZFR5cGUpXSksXG4gICAgICBvblNlbGVjdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHBsYWNlbWVudDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIHZhbHVlOiBGaWVsZFR5cGUsXG4gICAgICBmaWx0ZXJGaWVsZFR5cGVzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtGaWVsZFR5cGUsIFByb3BUeXBlcy5hcnJheU9mKEZpZWxkVHlwZSldKSxcbiAgICAgIGlucHV0VGhlbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBwbGFjZWhvbGRlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIGVyYXNhYmxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIGVycm9yOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIG11bHRpU2VsZWN0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIGNsb3NlT25TZWxlY3Q6IFByb3BUeXBlcy5ib29sLFxuICAgICAgc2hvd1Rva2VuOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIHN1Z2dlc3RlZDogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSksXG4gICAgICBDdXN0b21DaGlja2xldENvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmNcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgIGVyYXNhYmxlOiB0cnVlLFxuICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgZmllbGRzOiBbXSxcbiAgICAgIG9uU2VsZWN0OiAoKSA9PiB7fSxcbiAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcbiAgICAgIGNsb3NlT25TZWxlY3Q6IHRydWUsXG4gICAgICBzaG93VG9rZW46IHRydWUsXG4gICAgICBwbGFjZWhvbGRlcjogJ3BsYWNlaG9sZGVyLnNlbGVjdEZpZWxkJ1xuICAgIH07XG5cbiAgICBmaWVsZHNTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmZpZWxkcztcbiAgICBmaWx0ZXJlZEZpZWxkc1NlbGVjdG9yID0gcHJvcHMgPT5cbiAgICAgIHByb3BzLmZpZWxkcy5maWx0ZXIoXG4gICAgICAgIGZpZWxkID0+XG4gICAgICAgICAgIXRvQXJyYXkocHJvcHMudmFsdWUpLmZpbmQoZCA9PiAoZC5uYW1lID8gZC5uYW1lID09PSBmaWVsZC5uYW1lIDogZCA9PT0gZmllbGQubmFtZSkpXG4gICAgICApO1xuICAgIHZhbHVlU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy52YWx1ZTtcbiAgICBmaWx0ZXJGaWVsZFR5cGVzU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5maWx0ZXJGaWVsZFR5cGVzO1xuICAgIHNob3dUb2tlblNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMuc2hvd1Rva2VuO1xuXG4gICAgc2VsZWN0ZWRJdGVtc1NlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgICB0aGlzLmZpZWxkc1NlbGVjdG9yLFxuICAgICAgdGhpcy52YWx1ZVNlbGVjdG9yLFxuICAgICAgKGZpZWxkcywgdmFsdWUpID0+XG4gICAgICAgIHRvQXJyYXkodmFsdWUpXG4gICAgICAgICAgLm1hcChkID0+XG4gICAgICAgICAgICBmaWVsZHMuZmluZChmID0+XG4gICAgICAgICAgICAgIG5vdE51bGxvclVuZGVmaW5lZChkKSAmJiBkLm5hbWVcbiAgICAgICAgICAgICAgICA/IGQubmFtZSA9PT0gZGVmYXVsdERpc3BsYXlPcHRpb24oZilcbiAgICAgICAgICAgICAgICA6IGQgPT09IGRlZmF1bHREaXNwbGF5T3B0aW9uKGYpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgIC5maWx0ZXIoZCA9PiBkKVxuICAgICk7XG5cbiAgICBmaWVsZE9wdGlvbnNTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy5maWx0ZXJlZEZpZWxkc1NlbGVjdG9yLFxuICAgICAgdGhpcy5maWx0ZXJGaWVsZFR5cGVzU2VsZWN0b3IsXG4gICAgICAoZmllbGRzLCBmaWx0ZXJGaWVsZFR5cGVzKSA9PiB7XG4gICAgICAgIGlmICghZmlsdGVyRmllbGRUeXBlcykge1xuICAgICAgICAgIHJldHVybiBmaWVsZHM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsdGVycyA9IEFycmF5LmlzQXJyYXkoZmlsdGVyRmllbGRUeXBlcykgPyBmaWx0ZXJGaWVsZFR5cGVzIDogW2ZpbHRlckZpZWxkVHlwZXNdO1xuICAgICAgICByZXR1cm4gZmllbGRzLmZpbHRlcihmID0+IGZpbHRlcnMuaW5jbHVkZXMoZi50eXBlKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGZpZWxkTGlzdEl0ZW1TZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKHRoaXMuc2hvd1Rva2VuU2VsZWN0b3IsIEZpZWxkTGlzdEl0ZW1GYWN0b3J5KTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmllbGQtc2VsZWN0b3JcIj5cbiAgICAgICAgICA8SXRlbVNlbGVjdG9yXG4gICAgICAgICAgICBnZXRPcHRpb25WYWx1ZT17ZCA9PiBkfVxuICAgICAgICAgICAgY2xvc2VPblNlbGVjdD17dGhpcy5wcm9wcy5jbG9zZU9uU2VsZWN0fVxuICAgICAgICAgICAgZGlzcGxheU9wdGlvbj17ZGVmYXVsdERpc3BsYXlPcHRpb259XG4gICAgICAgICAgICBmaWx0ZXJPcHRpb249XCJuYW1lXCJcbiAgICAgICAgICAgIGZpeGVkT3B0aW9ucz17dGhpcy5wcm9wcy5zdWdnZXN0ZWR9XG4gICAgICAgICAgICBpbnB1dFRoZW1lPXt0aGlzLnByb3BzLmlucHV0VGhlbWV9XG4gICAgICAgICAgICBpc0Vycm9yPXt0aGlzLnByb3BzLmVycm9yfVxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcz17dGhpcy5zZWxlY3RlZEl0ZW1zU2VsZWN0b3IodGhpcy5wcm9wcyl9XG4gICAgICAgICAgICBlcmFzYWJsZT17dGhpcy5wcm9wcy5lcmFzYWJsZX1cbiAgICAgICAgICAgIG9wdGlvbnM9e3RoaXMuZmllbGRPcHRpb25zU2VsZWN0b3IodGhpcy5wcm9wcyl9XG4gICAgICAgICAgICBtdWx0aVNlbGVjdD17dGhpcy5wcm9wcy5tdWx0aVNlbGVjdH1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgcGxhY2VtZW50PXt0aGlzLnByb3BzLnBsYWNlbWVudH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0fVxuICAgICAgICAgICAgRHJvcERvd25MaW5lSXRlbVJlbmRlckNvbXBvbmVudD17dGhpcy5maWVsZExpc3RJdGVtU2VsZWN0b3IodGhpcy5wcm9wcyl9XG4gICAgICAgICAgICBEcm9wZG93bkhlYWRlckNvbXBvbmVudD17dGhpcy5wcm9wcy5zdWdnZXN0ZWQgPyBTdWdnZXN0ZWRGaWVsZEhlYWRlciA6IG51bGx9XG4gICAgICAgICAgICBDdXN0b21DaGlja2xldENvbXBvbmVudD17dGhpcy5wcm9wcy5DdXN0b21DaGlja2xldENvbXBvbmVudH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBGaWVsZFNlbGVjdG9yO1xufTtcblxuRmllbGRTZWxlY3RvckZhY3RvcnkuZGVwcyA9IFtGaWVsZExpc3RJdGVtRmFjdG9yeUZhY3RvcnldO1xuZXhwb3J0IGRlZmF1bHQgRmllbGRTZWxlY3RvckZhY3Rvcnk7XG4iXX0=