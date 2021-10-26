"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _portaled = _interopRequireDefault(require("../portaled"));

var _dropdownList = _interopRequireDefault(require("../item-selector/dropdown-list"));

var _defaultSettings = require("../../../constants/default-settings");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .list-selector {\n    border-top: 0;\n    width: max-content;\n    padding: 8px 0;\n  }\n\n  .list__item > div {\n    display: flex;\n    align-items: center;\n    flex-direction: row;\n    justify-content: flex-start;\n    line-height: 18px;\n\n    svg {\n      margin-right: 5px;\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var ListItem = function ListItem(_ref) {
  var value = _ref.value;
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(value.icon, {
    height: "13px"
  }), value.display);
};

var StyledOptionsDropdown = _styledComponents["default"].div(_templateObject());

var OptionDropdown = function OptionDropdown(props) {
  var isOpened = props.isOpened,
      column = props.column,
      toggleMoreOptions = props.toggleMoreOptions,
      sortTableColumn = props.sortTableColumn,
      pinTableColumn = props.pinTableColumn,
      copyTableColumn = props.copyTableColumn;
  var onOptionSelected = (0, _react.useCallback)(function (_ref2) {
    var value = _ref2.value;

    switch (value) {
      case _defaultSettings.TABLE_OPTION.SORT_ASC:
        sortTableColumn(_defaultSettings.SORT_ORDER.ASCENDING);
        break;

      case _defaultSettings.TABLE_OPTION.SORT_DES:
        sortTableColumn(_defaultSettings.SORT_ORDER.DESCENDING);
        break;

      case _defaultSettings.TABLE_OPTION.UNSORT:
        sortTableColumn(_defaultSettings.SORT_ORDER.UNSORT);
        break;

      case _defaultSettings.TABLE_OPTION.PIN:
        pinTableColumn();
        break;

      case _defaultSettings.TABLE_OPTION.UNPIN:
        pinTableColumn();
        break;

      case _defaultSettings.TABLE_OPTION.COPY:
        copyTableColumn();
        break;

      default:
        break;
    }

    toggleMoreOptions(column);
  }, [column, sortTableColumn, pinTableColumn, copyTableColumn, toggleMoreOptions]);

  var options = _defaultSettings.TABLE_OPTION_LIST.filter(function (op) {
    return !op.condition || op.condition(props);
  });

  return /*#__PURE__*/_react["default"].createElement(_portaled["default"], {
    right: 120,
    top: 20,
    isOpened: isOpened,
    onClose: function onClose() {
      return toggleMoreOptions(column);
    }
  }, /*#__PURE__*/_react["default"].createElement(StyledOptionsDropdown, {
    className: "more-options"
  }, /*#__PURE__*/_react["default"].createElement(_dropdownList["default"], {
    displayOption: function displayOption(d) {
      return d.display;
    },
    options: options,
    customListItemComponent: ListItem,
    onOptionSelected: onOptionSelected,
    light: true
  })));
};

var _default = OptionDropdown;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9kYXRhLXRhYmxlL29wdGlvbi1kcm9wZG93bi5qcyJdLCJuYW1lcyI6WyJMaXN0SXRlbSIsInZhbHVlIiwiZGlzcGxheSIsIlN0eWxlZE9wdGlvbnNEcm9wZG93biIsInN0eWxlZCIsImRpdiIsIk9wdGlvbkRyb3Bkb3duIiwicHJvcHMiLCJpc09wZW5lZCIsImNvbHVtbiIsInRvZ2dsZU1vcmVPcHRpb25zIiwic29ydFRhYmxlQ29sdW1uIiwicGluVGFibGVDb2x1bW4iLCJjb3B5VGFibGVDb2x1bW4iLCJvbk9wdGlvblNlbGVjdGVkIiwiVEFCTEVfT1BUSU9OIiwiU09SVF9BU0MiLCJTT1JUX09SREVSIiwiQVNDRU5ESU5HIiwiU09SVF9ERVMiLCJERVNDRU5ESU5HIiwiVU5TT1JUIiwiUElOIiwiVU5QSU4iLCJDT1BZIiwib3B0aW9ucyIsIlRBQkxFX09QVElPTl9MSVNUIiwiZmlsdGVyIiwib3AiLCJjb25kaXRpb24iLCJkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxRQUFRLEdBQUcsU0FBWEEsUUFBVztBQUFBLE1BQUVDLEtBQUYsUUFBRUEsS0FBRjtBQUFBLHNCQUNmLDBEQUNFLGdDQUFDLEtBQUQsQ0FBTyxJQUFQO0FBQVksSUFBQSxNQUFNLEVBQUM7QUFBbkIsSUFERixFQUVHQSxLQUFLLENBQUNDLE9BRlQsQ0FEZTtBQUFBLENBQWpCOztBQU9BLElBQU1DLHFCQUFxQixHQUFHQyw2QkFBT0MsR0FBVixtQkFBM0I7O0FBb0JBLElBQU1DLGNBQWMsR0FBRyxTQUFqQkEsY0FBaUIsQ0FBQUMsS0FBSyxFQUFJO0FBQUEsTUFFNUJDLFFBRjRCLEdBUTFCRCxLQVIwQixDQUU1QkMsUUFGNEI7QUFBQSxNQUc1QkMsTUFINEIsR0FRMUJGLEtBUjBCLENBRzVCRSxNQUg0QjtBQUFBLE1BSTVCQyxpQkFKNEIsR0FRMUJILEtBUjBCLENBSTVCRyxpQkFKNEI7QUFBQSxNQUs1QkMsZUFMNEIsR0FRMUJKLEtBUjBCLENBSzVCSSxlQUw0QjtBQUFBLE1BTTVCQyxjQU40QixHQVExQkwsS0FSMEIsQ0FNNUJLLGNBTjRCO0FBQUEsTUFPNUJDLGVBUDRCLEdBUTFCTixLQVIwQixDQU81Qk0sZUFQNEI7QUFTOUIsTUFBTUMsZ0JBQWdCLEdBQUcsd0JBQ3ZCLGlCQUFhO0FBQUEsUUFBWGIsS0FBVyxTQUFYQSxLQUFXOztBQUNYLFlBQVFBLEtBQVI7QUFDRSxXQUFLYyw4QkFBYUMsUUFBbEI7QUFDRUwsUUFBQUEsZUFBZSxDQUFDTSw0QkFBV0MsU0FBWixDQUFmO0FBQ0E7O0FBQ0YsV0FBS0gsOEJBQWFJLFFBQWxCO0FBQ0VSLFFBQUFBLGVBQWUsQ0FBQ00sNEJBQVdHLFVBQVosQ0FBZjtBQUNBOztBQUNGLFdBQUtMLDhCQUFhTSxNQUFsQjtBQUNFVixRQUFBQSxlQUFlLENBQUNNLDRCQUFXSSxNQUFaLENBQWY7QUFDQTs7QUFDRixXQUFLTiw4QkFBYU8sR0FBbEI7QUFDRVYsUUFBQUEsY0FBYztBQUNkOztBQUNGLFdBQUtHLDhCQUFhUSxLQUFsQjtBQUNFWCxRQUFBQSxjQUFjO0FBQ2Q7O0FBQ0YsV0FBS0csOEJBQWFTLElBQWxCO0FBQ0VYLFFBQUFBLGVBQWU7QUFDZjs7QUFDRjtBQUNFO0FBcEJKOztBQXVCQUgsSUFBQUEsaUJBQWlCLENBQUNELE1BQUQsQ0FBakI7QUFDRCxHQTFCc0IsRUEyQnZCLENBQUNBLE1BQUQsRUFBU0UsZUFBVCxFQUEwQkMsY0FBMUIsRUFBMENDLGVBQTFDLEVBQTJESCxpQkFBM0QsQ0EzQnVCLENBQXpCOztBQThCQSxNQUFNZSxPQUFPLEdBQUdDLG1DQUFrQkMsTUFBbEIsQ0FBeUIsVUFBQUMsRUFBRTtBQUFBLFdBQUksQ0FBQ0EsRUFBRSxDQUFDQyxTQUFKLElBQWlCRCxFQUFFLENBQUNDLFNBQUgsQ0FBYXRCLEtBQWIsQ0FBckI7QUFBQSxHQUEzQixDQUFoQjs7QUFFQSxzQkFDRSxnQ0FBQyxvQkFBRDtBQUFVLElBQUEsS0FBSyxFQUFFLEdBQWpCO0FBQXNCLElBQUEsR0FBRyxFQUFFLEVBQTNCO0FBQStCLElBQUEsUUFBUSxFQUFFQyxRQUF6QztBQUFtRCxJQUFBLE9BQU8sRUFBRTtBQUFBLGFBQU1FLGlCQUFpQixDQUFDRCxNQUFELENBQXZCO0FBQUE7QUFBNUQsa0JBQ0UsZ0NBQUMscUJBQUQ7QUFBdUIsSUFBQSxTQUFTLEVBQUM7QUFBakMsa0JBQ0UsZ0NBQUMsd0JBQUQ7QUFDRSxJQUFBLGFBQWEsRUFBRSx1QkFBQXFCLENBQUM7QUFBQSxhQUFJQSxDQUFDLENBQUM1QixPQUFOO0FBQUEsS0FEbEI7QUFFRSxJQUFBLE9BQU8sRUFBRXVCLE9BRlg7QUFHRSxJQUFBLHVCQUF1QixFQUFFekIsUUFIM0I7QUFJRSxJQUFBLGdCQUFnQixFQUFFYyxnQkFKcEI7QUFLRSxJQUFBLEtBQUs7QUFMUCxJQURGLENBREYsQ0FERjtBQWFELENBdEREOztlQXdEZVIsYyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge3VzZUNhbGxiYWNrfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBQb3J0YWxlZCBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9wb3J0YWxlZCc7XG5pbXBvcnQgRHJvcGRvd25MaXN0IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2l0ZW0tc2VsZWN0b3IvZHJvcGRvd24tbGlzdCc7XG5pbXBvcnQge1NPUlRfT1JERVIsIFRBQkxFX09QVElPTiwgVEFCTEVfT1BUSU9OX0xJU1R9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuY29uc3QgTGlzdEl0ZW0gPSAoe3ZhbHVlfSkgPT4gKFxuICA8ZGl2PlxuICAgIDx2YWx1ZS5pY29uIGhlaWdodD1cIjEzcHhcIiAvPlxuICAgIHt2YWx1ZS5kaXNwbGF5fVxuICA8L2Rpdj5cbik7XG5cbmNvbnN0IFN0eWxlZE9wdGlvbnNEcm9wZG93biA9IHN0eWxlZC5kaXZgXG4gIC5saXN0LXNlbGVjdG9yIHtcbiAgICBib3JkZXItdG9wOiAwO1xuICAgIHdpZHRoOiBtYXgtY29udGVudDtcbiAgICBwYWRkaW5nOiA4cHggMDtcbiAgfVxuXG4gIC5saXN0X19pdGVtID4gZGl2IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gICAgbGluZS1oZWlnaHQ6IDE4cHg7XG5cbiAgICBzdmcge1xuICAgICAgbWFyZ2luLXJpZ2h0OiA1cHg7XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBPcHRpb25Ecm9wZG93biA9IHByb3BzID0+IHtcbiAgY29uc3Qge1xuICAgIGlzT3BlbmVkLFxuICAgIGNvbHVtbixcbiAgICB0b2dnbGVNb3JlT3B0aW9ucyxcbiAgICBzb3J0VGFibGVDb2x1bW4sXG4gICAgcGluVGFibGVDb2x1bW4sXG4gICAgY29weVRhYmxlQ29sdW1uXG4gIH0gPSBwcm9wcztcbiAgY29uc3Qgb25PcHRpb25TZWxlY3RlZCA9IHVzZUNhbGxiYWNrKFxuICAgICh7dmFsdWV9KSA9PiB7XG4gICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgIGNhc2UgVEFCTEVfT1BUSU9OLlNPUlRfQVNDOlxuICAgICAgICAgIHNvcnRUYWJsZUNvbHVtbihTT1JUX09SREVSLkFTQ0VORElORyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVEFCTEVfT1BUSU9OLlNPUlRfREVTOlxuICAgICAgICAgIHNvcnRUYWJsZUNvbHVtbihTT1JUX09SREVSLkRFU0NFTkRJTkcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFRBQkxFX09QVElPTi5VTlNPUlQ6XG4gICAgICAgICAgc29ydFRhYmxlQ29sdW1uKFNPUlRfT1JERVIuVU5TT1JUKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUQUJMRV9PUFRJT04uUElOOlxuICAgICAgICAgIHBpblRhYmxlQ29sdW1uKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVEFCTEVfT1BUSU9OLlVOUElOOlxuICAgICAgICAgIHBpblRhYmxlQ29sdW1uKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVEFCTEVfT1BUSU9OLkNPUFk6XG4gICAgICAgICAgY29weVRhYmxlQ29sdW1uKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRvZ2dsZU1vcmVPcHRpb25zKGNvbHVtbik7XG4gICAgfSxcbiAgICBbY29sdW1uLCBzb3J0VGFibGVDb2x1bW4sIHBpblRhYmxlQ29sdW1uLCBjb3B5VGFibGVDb2x1bW4sIHRvZ2dsZU1vcmVPcHRpb25zXVxuICApO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSBUQUJMRV9PUFRJT05fTElTVC5maWx0ZXIob3AgPT4gIW9wLmNvbmRpdGlvbiB8fCBvcC5jb25kaXRpb24ocHJvcHMpKTtcblxuICByZXR1cm4gKFxuICAgIDxQb3J0YWxlZCByaWdodD17MTIwfSB0b3A9ezIwfSBpc09wZW5lZD17aXNPcGVuZWR9IG9uQ2xvc2U9eygpID0+IHRvZ2dsZU1vcmVPcHRpb25zKGNvbHVtbil9PlxuICAgICAgPFN0eWxlZE9wdGlvbnNEcm9wZG93biBjbGFzc05hbWU9XCJtb3JlLW9wdGlvbnNcIj5cbiAgICAgICAgPERyb3Bkb3duTGlzdFxuICAgICAgICAgIGRpc3BsYXlPcHRpb249e2QgPT4gZC5kaXNwbGF5fVxuICAgICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgICAgY3VzdG9tTGlzdEl0ZW1Db21wb25lbnQ9e0xpc3RJdGVtfVxuICAgICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ9e29uT3B0aW9uU2VsZWN0ZWR9XG4gICAgICAgICAgbGlnaHRcbiAgICAgICAgLz5cbiAgICAgIDwvU3R5bGVkT3B0aW9uc0Ryb3Bkb3duPlxuICAgIDwvUG9ydGFsZWQ+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPcHRpb25Ecm9wZG93bjtcbiJdfQ==