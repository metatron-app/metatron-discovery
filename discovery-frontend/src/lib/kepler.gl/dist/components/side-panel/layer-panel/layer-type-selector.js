"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _dropdownList = require("../../common/item-selector/dropdown-list");

var _itemSelector = _interopRequireDefault(require("../../common/item-selector/item-selector"));

var _defaultSettings = require("../../../constants/default-settings");

var _styledComponents2 = require("../../common/styled-components");

var _localization = require("../../../localization");

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  // override item-selector dropdown padding\n  .item-selector .item-selector__dropdown {\n    padding: 4px 10px 4px 2px;\n  }\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n  background-color: ", ";\n  border-top: 1px solid ", ";\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  padding: ", "px 0 0 ", "px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  &.list {\n    display: flex;\n    align-items: center;\n\n    .layer-type-selector__item__icon {\n      color: ", ";\n      background-size: ", "px\n        ", "px;\n      margin-right: 12px;\n    }\n  }\n\n  .layer-type-selector__item__icon {\n    color: ", ";\n    display: flex;\n    background-image: url(", ");\n    background-size: ", "px\n      ", "px;\n  }\n\n  .layer-type-selector__item__label {\n    text-transform: capitalize;\n    font-size: 12px;\n    text-align: center;\n    color: ", ";\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding-bottom: ", "px;\n  padding-right: ", "px;\n\n  &.selected {\n    .layer-type-selector__item__icon {\n      border: 1px solid #caf2f4;\n    }\n  }\n\n  :hover,\n  &.selected {\n    cursor: pointer;\n    .layer-type-selector__item__icon {\n      color: ", ";\n    }\n\n    .layer-type-selector__item__label {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var ITEM_SIZE = {
  large: 50,
  small: 28
};

var StyledDropdownListItem = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.layerTypeIconPdL;
}, function (props) {
  return props.theme.layerTypeIconPdL;
}, function (props) {
  return props.theme.activeColor;
}, function (props) {
  return props.theme.textColor;
});

var StyledListItem = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.activeColor;
}, function (props) {
  return props.theme.layerTypeIconSizeSM;
}, function (props) {
  return props.theme.layerTypeIconSizeSM;
}, function (props) {
  return props.theme.labelColor;
}, "".concat(_defaultSettings.CLOUDFRONT, "/kepler.gl-layer-icon-bg.png"), function (props) {
  return props.theme.layerTypeIconSizeL;
}, function (props) {
  return props.theme.layerTypeIconSizeL;
}, function (props) {
  return props.theme.selectColor;
});

var DropdownListWrapper = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.dropdownList;
}, function (props) {
  return props.theme.dropdownListBgd;
}, function (props) {
  return props.theme.dropdownListBorderTop;
}, function (props) {
  return props.theme.layerTypeIconPdL;
}, function (props) {
  return props.theme.layerTypeIconPdL;
});

var LayerTypeListItem = function LayerTypeListItem(_ref) {
  var value = _ref.value,
      isTile = _ref.isTile;
  return /*#__PURE__*/_react["default"].createElement(StyledListItem, {
    className: (0, _classnames["default"])('layer-type-selector__item__inner', {
      list: !isTile
    })
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "layer-type-selector__item__icon"
  }, /*#__PURE__*/_react["default"].createElement(value.icon, {
    height: "".concat(isTile ? ITEM_SIZE.large : ITEM_SIZE.small, "px")
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "layer-type-selector__item__label"
  }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: "layer.type.".concat(value.label.toLowerCase()),
    defaultMessage: value.label
  })));
};

var LayerTypeDropdownList = function LayerTypeDropdownList(props) {
  return /*#__PURE__*/_react["default"].createElement(DropdownListWrapper, {
    className: _dropdownList.classList.list
  }, props.options.map(function (value, i) {
    return /*#__PURE__*/_react["default"].createElement(StyledDropdownListItem, {
      className: (0, _classnames["default"])('layer-type-selector__item', {
        selected: props.selectedItems.find(function (it) {
          return it.id === value.id;
        }),
        hover: props.selectionIndex === i
      }),
      key: "".concat(value.id, "_").concat(i),
      onMouseDown: function onMouseDown(e) {
        e.preventDefault();
        props.onOptionSelected(value, e);
      },
      onClick: function onClick(e) {
        e.preventDefault();
        props.onOptionSelected(value, e);
      }
    }, /*#__PURE__*/_react["default"].createElement(props.customListItemComponent, {
      value: value,
      isTile: true
    }));
  }));
};

var propTypes = {
  layer: _propTypes["default"].object.isRequired,
  onSelect: _propTypes["default"].func.isRequired
};

var StyledLayerTypeSelector = _styledComponents["default"].div(_templateObject4());

var LayerTypeSelector = function LayerTypeSelector(_ref2) {
  var layer = _ref2.layer,
      layerTypeOptions = _ref2.layerTypeOptions,
      onSelect = _ref2.onSelect,
      theme = _ref2.theme;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(StyledLayerTypeSelector, {
    className: "layer-config__type"
  }, /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], {
    selectedItems: layerTypeOptions.find(function (op) {
      return op.id === layer.type;
    }),
    options: layerTypeOptions,
    multiSelect: false,
    placeholder: "placeholder.selectType",
    onChange: onSelect,
    getOptionValue: function getOptionValue(op) {
      return op.id;
    },
    filterOption: "label",
    displayOption: function displayOption(op) {
      return op.label;
    },
    DropDownLineItemRenderComponent: LayerTypeListItem,
    DropDownRenderComponent: LayerTypeDropdownList
  })));
};

LayerTypeSelector.propTypes = propTypes;

var _default = (0, _styledComponents.withTheme)(LayerTypeSelector);

exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvbGF5ZXItdHlwZS1zZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJJVEVNX1NJWkUiLCJsYXJnZSIsInNtYWxsIiwiU3R5bGVkRHJvcGRvd25MaXN0SXRlbSIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJsYXllclR5cGVJY29uUGRMIiwiYWN0aXZlQ29sb3IiLCJ0ZXh0Q29sb3IiLCJTdHlsZWRMaXN0SXRlbSIsImxheWVyVHlwZUljb25TaXplU00iLCJsYWJlbENvbG9yIiwiQ0xPVURGUk9OVCIsImxheWVyVHlwZUljb25TaXplTCIsInNlbGVjdENvbG9yIiwiRHJvcGRvd25MaXN0V3JhcHBlciIsImRyb3Bkb3duTGlzdCIsImRyb3Bkb3duTGlzdEJnZCIsImRyb3Bkb3duTGlzdEJvcmRlclRvcCIsIkxheWVyVHlwZUxpc3RJdGVtIiwidmFsdWUiLCJpc1RpbGUiLCJsaXN0IiwibGFiZWwiLCJ0b0xvd2VyQ2FzZSIsIkxheWVyVHlwZURyb3Bkb3duTGlzdCIsImNsYXNzTGlzdCIsIm9wdGlvbnMiLCJtYXAiLCJpIiwic2VsZWN0ZWQiLCJzZWxlY3RlZEl0ZW1zIiwiZmluZCIsIml0IiwiaWQiLCJob3ZlciIsInNlbGVjdGlvbkluZGV4IiwiZSIsInByZXZlbnREZWZhdWx0Iiwib25PcHRpb25TZWxlY3RlZCIsInByb3BUeXBlcyIsImxheWVyIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsIm9uU2VsZWN0IiwiZnVuYyIsIlN0eWxlZExheWVyVHlwZVNlbGVjdG9yIiwiTGF5ZXJUeXBlU2VsZWN0b3IiLCJsYXllclR5cGVPcHRpb25zIiwib3AiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxTQUFTLEdBQUc7QUFDaEJDLEVBQUFBLEtBQUssRUFBRSxFQURTO0FBRWhCQyxFQUFBQSxLQUFLLEVBQUU7QUFGUyxDQUFsQjs7QUFLQSxJQUFNQyxzQkFBc0IsR0FBR0MsNkJBQU9DLEdBQVYsb0JBQ1IsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxnQkFBaEI7QUFBQSxDQURHLEVBRVQsVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxnQkFBaEI7QUFBQSxDQUZJLEVBY2IsVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxXQUFoQjtBQUFBLENBZFEsRUFrQmIsVUFBQUgsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRyxTQUFoQjtBQUFBLENBbEJRLENBQTVCOztBQXVCQSxJQUFNQyxjQUFjLEdBQUdQLDZCQUFPQyxHQUFWLHFCQU1MLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUUsV0FBaEI7QUFBQSxDQU5BLEVBT0ssVUFBQUgsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSyxtQkFBaEI7QUFBQSxDQVBWLEVBUVYsVUFBQU4sS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSyxtQkFBaEI7QUFBQSxDQVJLLEVBY1AsVUFBQU4sS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZTSxVQUFoQjtBQUFBLENBZEUsWUFnQldDLDJCQWhCWCxtQ0FpQkcsVUFBQVIsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZUSxrQkFBaEI7QUFBQSxDQWpCUixFQWtCWixVQUFBVCxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlRLGtCQUFoQjtBQUFBLENBbEJPLEVBeUJQLFVBQUFULEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWVMsV0FBaEI7QUFBQSxDQXpCRSxDQUFwQjs7QUE2QkEsSUFBTUMsbUJBQW1CLEdBQUdiLDZCQUFPQyxHQUFWLHFCQUNyQixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlXLFlBQWhCO0FBQUEsQ0FEZ0IsRUFFSCxVQUFBWixLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlZLGVBQWhCO0FBQUEsQ0FGRixFQUdDLFVBQUFiLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWWEscUJBQWhCO0FBQUEsQ0FITixFQU9aLFVBQUFkLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsZ0JBQWhCO0FBQUEsQ0FQTyxFQU9tQyxVQUFBRixLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLGdCQUFoQjtBQUFBLENBUHhDLENBQXpCOztBQVVBLElBQU1hLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBb0I7QUFBQSxNQUFFQyxLQUFGLFFBQUVBLEtBQUY7QUFBQSxNQUFTQyxNQUFULFFBQVNBLE1BQVQ7QUFBQSxzQkFDeEIsZ0NBQUMsY0FBRDtBQUFnQixJQUFBLFNBQVMsRUFBRSw0QkFBVyxrQ0FBWCxFQUErQztBQUFDQyxNQUFBQSxJQUFJLEVBQUUsQ0FBQ0Q7QUFBUixLQUEvQztBQUEzQixrQkFDRTtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0UsZ0NBQUMsS0FBRCxDQUFPLElBQVA7QUFBWSxJQUFBLE1BQU0sWUFBS0EsTUFBTSxHQUFHdkIsU0FBUyxDQUFDQyxLQUFiLEdBQXFCRCxTQUFTLENBQUNFLEtBQTFDO0FBQWxCLElBREYsQ0FERixlQUlFO0FBQUssSUFBQSxTQUFTLEVBQUM7QUFBZixrQkFDRSxnQ0FBQyw4QkFBRDtBQUNFLElBQUEsRUFBRSx1QkFBZ0JvQixLQUFLLENBQUNHLEtBQU4sQ0FBWUMsV0FBWixFQUFoQixDQURKO0FBRUUsSUFBQSxjQUFjLEVBQUVKLEtBQUssQ0FBQ0c7QUFGeEIsSUFERixDQUpGLENBRHdCO0FBQUEsQ0FBMUI7O0FBY0EsSUFBTUUscUJBQXFCLEdBQUcsU0FBeEJBLHFCQUF3QixDQUFBckIsS0FBSztBQUFBLHNCQUNqQyxnQ0FBQyxtQkFBRDtBQUFxQixJQUFBLFNBQVMsRUFBRXNCLHdCQUFVSjtBQUExQyxLQUNHbEIsS0FBSyxDQUFDdUIsT0FBTixDQUFjQyxHQUFkLENBQWtCLFVBQUNSLEtBQUQsRUFBUVMsQ0FBUjtBQUFBLHdCQUNqQixnQ0FBQyxzQkFBRDtBQUNFLE1BQUEsU0FBUyxFQUFFLDRCQUFXLDJCQUFYLEVBQXdDO0FBQ2pEQyxRQUFBQSxRQUFRLEVBQUUxQixLQUFLLENBQUMyQixhQUFOLENBQW9CQyxJQUFwQixDQUF5QixVQUFBQyxFQUFFO0FBQUEsaUJBQUlBLEVBQUUsQ0FBQ0MsRUFBSCxLQUFVZCxLQUFLLENBQUNjLEVBQXBCO0FBQUEsU0FBM0IsQ0FEdUM7QUFFakRDLFFBQUFBLEtBQUssRUFBRS9CLEtBQUssQ0FBQ2dDLGNBQU4sS0FBeUJQO0FBRmlCLE9BQXhDLENBRGI7QUFLRSxNQUFBLEdBQUcsWUFBS1QsS0FBSyxDQUFDYyxFQUFYLGNBQWlCTCxDQUFqQixDQUxMO0FBTUUsTUFBQSxXQUFXLEVBQUUscUJBQUFRLENBQUMsRUFBSTtBQUNoQkEsUUFBQUEsQ0FBQyxDQUFDQyxjQUFGO0FBQ0FsQyxRQUFBQSxLQUFLLENBQUNtQyxnQkFBTixDQUF1Qm5CLEtBQXZCLEVBQThCaUIsQ0FBOUI7QUFDRCxPQVRIO0FBVUUsTUFBQSxPQUFPLEVBQUUsaUJBQUFBLENBQUMsRUFBSTtBQUNaQSxRQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQWxDLFFBQUFBLEtBQUssQ0FBQ21DLGdCQUFOLENBQXVCbkIsS0FBdkIsRUFBOEJpQixDQUE5QjtBQUNEO0FBYkgsb0JBZUUsZ0NBQUMsS0FBRCxDQUFPLHVCQUFQO0FBQStCLE1BQUEsS0FBSyxFQUFFakIsS0FBdEM7QUFBNkMsTUFBQSxNQUFNO0FBQW5ELE1BZkYsQ0FEaUI7QUFBQSxHQUFsQixDQURILENBRGlDO0FBQUEsQ0FBbkM7O0FBd0JBLElBQU1vQixTQUFTLEdBQUc7QUFDaEJDLEVBQUFBLEtBQUssRUFBRUMsc0JBQVVDLE1BQVYsQ0FBaUJDLFVBRFI7QUFFaEJDLEVBQUFBLFFBQVEsRUFBRUgsc0JBQVVJLElBQVYsQ0FBZUY7QUFGVCxDQUFsQjs7QUFLQSxJQUFNRyx1QkFBdUIsR0FBRzdDLDZCQUFPQyxHQUFWLG9CQUE3Qjs7QUFNQSxJQUFNNkMsaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFvQjtBQUFBLE1BQUVQLEtBQUYsU0FBRUEsS0FBRjtBQUFBLE1BQVNRLGdCQUFULFNBQVNBLGdCQUFUO0FBQUEsTUFBMkJKLFFBQTNCLFNBQTJCQSxRQUEzQjtBQUFBLE1BQXFDeEMsS0FBckMsU0FBcUNBLEtBQXJDO0FBQUEsc0JBQ3hCLGdDQUFDLG1DQUFELHFCQUNFLGdDQUFDLHVCQUFEO0FBQXlCLElBQUEsU0FBUyxFQUFDO0FBQW5DLGtCQUNFLGdDQUFDLHdCQUFEO0FBQ0UsSUFBQSxhQUFhLEVBQUU0QyxnQkFBZ0IsQ0FBQ2pCLElBQWpCLENBQXNCLFVBQUFrQixFQUFFO0FBQUEsYUFBSUEsRUFBRSxDQUFDaEIsRUFBSCxLQUFVTyxLQUFLLENBQUNVLElBQXBCO0FBQUEsS0FBeEIsQ0FEakI7QUFFRSxJQUFBLE9BQU8sRUFBRUYsZ0JBRlg7QUFHRSxJQUFBLFdBQVcsRUFBRSxLQUhmO0FBSUUsSUFBQSxXQUFXLEVBQUMsd0JBSmQ7QUFLRSxJQUFBLFFBQVEsRUFBRUosUUFMWjtBQU1FLElBQUEsY0FBYyxFQUFFLHdCQUFBSyxFQUFFO0FBQUEsYUFBSUEsRUFBRSxDQUFDaEIsRUFBUDtBQUFBLEtBTnBCO0FBT0UsSUFBQSxZQUFZLEVBQUMsT0FQZjtBQVFFLElBQUEsYUFBYSxFQUFFLHVCQUFBZ0IsRUFBRTtBQUFBLGFBQUlBLEVBQUUsQ0FBQzNCLEtBQVA7QUFBQSxLQVJuQjtBQVNFLElBQUEsK0JBQStCLEVBQUVKLGlCQVRuQztBQVVFLElBQUEsdUJBQXVCLEVBQUVNO0FBVjNCLElBREYsQ0FERixDQUR3QjtBQUFBLENBQTFCOztBQW1CQXVCLGlCQUFpQixDQUFDUixTQUFsQixHQUE4QkEsU0FBOUI7O2VBRWUsaUNBQVVRLGlCQUFWLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHN0eWxlZCwge3dpdGhUaGVtZX0gZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuXG5pbXBvcnQge2NsYXNzTGlzdH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaXRlbS1zZWxlY3Rvci9kcm9wZG93bi1saXN0JztcbmltcG9ydCBJdGVtU2VsZWN0b3IgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaXRlbS1zZWxlY3Rvci9pdGVtLXNlbGVjdG9yJztcbmltcG9ydCB7Q0xPVURGUk9OVH0gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuXG5pbXBvcnQge1NpZGVQYW5lbFNlY3Rpb259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcblxuY29uc3QgSVRFTV9TSVpFID0ge1xuICBsYXJnZTogNTAsXG4gIHNtYWxsOiAyOFxufTtcblxuY29uc3QgU3R5bGVkRHJvcGRvd25MaXN0SXRlbSA9IHN0eWxlZC5kaXZgXG4gIHBhZGRpbmctYm90dG9tOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxheWVyVHlwZUljb25QZEx9cHg7XG4gIHBhZGRpbmctcmlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJUeXBlSWNvblBkTH1weDtcblxuICAmLnNlbGVjdGVkIHtcbiAgICAubGF5ZXItdHlwZS1zZWxlY3Rvcl9faXRlbV9faWNvbiB7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjY2FmMmY0O1xuICAgIH1cbiAgfVxuXG4gIDpob3ZlcixcbiAgJi5zZWxlY3RlZCB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIC5sYXllci10eXBlLXNlbGVjdG9yX19pdGVtX19pY29uIHtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmFjdGl2ZUNvbG9yfTtcbiAgICB9XG5cbiAgICAubGF5ZXItdHlwZS1zZWxlY3Rvcl9faXRlbV9fbGFiZWwge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbiAgICB9XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZExpc3RJdGVtID0gc3R5bGVkLmRpdmBcbiAgJi5saXN0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cbiAgICAubGF5ZXItdHlwZS1zZWxlY3Rvcl9faXRlbV9faWNvbiB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5hY3RpdmVDb2xvcn07XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJUeXBlSWNvblNpemVTTX1weFxuICAgICAgICAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxheWVyVHlwZUljb25TaXplU019cHg7XG4gICAgICBtYXJnaW4tcmlnaHQ6IDEycHg7XG4gICAgfVxuICB9XG5cbiAgLmxheWVyLXR5cGUtc2VsZWN0b3JfX2l0ZW1fX2ljb24ge1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxhYmVsQ29sb3J9O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7YCR7Q0xPVURGUk9OVH0va2VwbGVyLmdsLWxheWVyLWljb24tYmcucG5nYH0pO1xuICAgIGJhY2tncm91bmQtc2l6ZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5sYXllclR5cGVJY29uU2l6ZUx9cHhcbiAgICAgICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJUeXBlSWNvblNpemVMfXB4O1xuICB9XG5cbiAgLmxheWVyLXR5cGUtc2VsZWN0b3JfX2l0ZW1fX2xhYmVsIHtcbiAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNlbGVjdENvbG9yfTtcbiAgfVxuYDtcblxuY29uc3QgRHJvcGRvd25MaXN0V3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25MaXN0fTtcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bkxpc3RCZ2R9O1xuICBib3JkZXItdG9wOiAxcHggc29saWQgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bkxpc3RCb3JkZXJUb3B9O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG4gIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICBwYWRkaW5nOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxheWVyVHlwZUljb25QZEx9cHggMCAwICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGF5ZXJUeXBlSWNvblBkTH1weDtcbmA7XG5cbmNvbnN0IExheWVyVHlwZUxpc3RJdGVtID0gKHt2YWx1ZSwgaXNUaWxlfSkgPT4gKFxuICA8U3R5bGVkTGlzdEl0ZW0gY2xhc3NOYW1lPXtjbGFzc05hbWVzKCdsYXllci10eXBlLXNlbGVjdG9yX19pdGVtX19pbm5lcicsIHtsaXN0OiAhaXNUaWxlfSl9PlxuICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5ZXItdHlwZS1zZWxlY3Rvcl9faXRlbV9faWNvblwiPlxuICAgICAgPHZhbHVlLmljb24gaGVpZ2h0PXtgJHtpc1RpbGUgPyBJVEVNX1NJWkUubGFyZ2UgOiBJVEVNX1NJWkUuc21hbGx9cHhgfSAvPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5ZXItdHlwZS1zZWxlY3Rvcl9faXRlbV9fbGFiZWxcIj5cbiAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgIGlkPXtgbGF5ZXIudHlwZS4ke3ZhbHVlLmxhYmVsLnRvTG93ZXJDYXNlKCl9YH1cbiAgICAgICAgZGVmYXVsdE1lc3NhZ2U9e3ZhbHVlLmxhYmVsfVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgPC9TdHlsZWRMaXN0SXRlbT5cbik7XG5cbmNvbnN0IExheWVyVHlwZURyb3Bkb3duTGlzdCA9IHByb3BzID0+IChcbiAgPERyb3Bkb3duTGlzdFdyYXBwZXIgY2xhc3NOYW1lPXtjbGFzc0xpc3QubGlzdH0+XG4gICAge3Byb3BzLm9wdGlvbnMubWFwKCh2YWx1ZSwgaSkgPT4gKFxuICAgICAgPFN0eWxlZERyb3Bkb3duTGlzdEl0ZW1cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKCdsYXllci10eXBlLXNlbGVjdG9yX19pdGVtJywge1xuICAgICAgICAgIHNlbGVjdGVkOiBwcm9wcy5zZWxlY3RlZEl0ZW1zLmZpbmQoaXQgPT4gaXQuaWQgPT09IHZhbHVlLmlkKSxcbiAgICAgICAgICBob3ZlcjogcHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IGlcbiAgICAgICAgfSl9XG4gICAgICAgIGtleT17YCR7dmFsdWUuaWR9XyR7aX1gfVxuICAgICAgICBvbk1vdXNlRG93bj17ZSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHByb3BzLm9uT3B0aW9uU2VsZWN0ZWQodmFsdWUsIGUpO1xuICAgICAgICB9fVxuICAgICAgICBvbkNsaWNrPXtlID0+IHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgcHJvcHMub25PcHRpb25TZWxlY3RlZCh2YWx1ZSwgZSk7XG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxwcm9wcy5jdXN0b21MaXN0SXRlbUNvbXBvbmVudCB2YWx1ZT17dmFsdWV9IGlzVGlsZSAvPlxuICAgICAgPC9TdHlsZWREcm9wZG93bkxpc3RJdGVtPlxuICAgICkpfVxuICA8L0Ryb3Bkb3duTGlzdFdyYXBwZXI+XG4pO1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIGxheWVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIG9uU2VsZWN0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG59O1xuXG5jb25zdCBTdHlsZWRMYXllclR5cGVTZWxlY3RvciA9IHN0eWxlZC5kaXZgXG4gIC8vIG92ZXJyaWRlIGl0ZW0tc2VsZWN0b3IgZHJvcGRvd24gcGFkZGluZ1xuICAuaXRlbS1zZWxlY3RvciAuaXRlbS1zZWxlY3Rvcl9fZHJvcGRvd24ge1xuICAgIHBhZGRpbmc6IDRweCAxMHB4IDRweCAycHg7XG4gIH1cbmA7XG5jb25zdCBMYXllclR5cGVTZWxlY3RvciA9ICh7bGF5ZXIsIGxheWVyVHlwZU9wdGlvbnMsIG9uU2VsZWN0LCB0aGVtZX0pID0+IChcbiAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgPFN0eWxlZExheWVyVHlwZVNlbGVjdG9yIGNsYXNzTmFtZT1cImxheWVyLWNvbmZpZ19fdHlwZVwiPlxuICAgICAgPEl0ZW1TZWxlY3RvclxuICAgICAgICBzZWxlY3RlZEl0ZW1zPXtsYXllclR5cGVPcHRpb25zLmZpbmQob3AgPT4gb3AuaWQgPT09IGxheWVyLnR5cGUpfVxuICAgICAgICBvcHRpb25zPXtsYXllclR5cGVPcHRpb25zfVxuICAgICAgICBtdWx0aVNlbGVjdD17ZmFsc2V9XG4gICAgICAgIHBsYWNlaG9sZGVyPVwicGxhY2Vob2xkZXIuc2VsZWN0VHlwZVwiXG4gICAgICAgIG9uQ2hhbmdlPXtvblNlbGVjdH1cbiAgICAgICAgZ2V0T3B0aW9uVmFsdWU9e29wID0+IG9wLmlkfVxuICAgICAgICBmaWx0ZXJPcHRpb249XCJsYWJlbFwiXG4gICAgICAgIGRpc3BsYXlPcHRpb249e29wID0+IG9wLmxhYmVsfVxuICAgICAgICBEcm9wRG93bkxpbmVJdGVtUmVuZGVyQ29tcG9uZW50PXtMYXllclR5cGVMaXN0SXRlbX1cbiAgICAgICAgRHJvcERvd25SZW5kZXJDb21wb25lbnQ9e0xheWVyVHlwZURyb3Bkb3duTGlzdH1cbiAgICAgIC8+XG4gICAgPC9TdHlsZWRMYXllclR5cGVTZWxlY3Rvcj5cbiAgPC9TaWRlUGFuZWxTZWN0aW9uPlxuKTtcblxuTGF5ZXJUeXBlU2VsZWN0b3IucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoVGhlbWUoTGF5ZXJUeXBlU2VsZWN0b3IpO1xuIl19