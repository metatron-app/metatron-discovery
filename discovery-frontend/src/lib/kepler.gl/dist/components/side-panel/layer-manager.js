"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddDataButtonFactory = AddDataButtonFactory;
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactSortableHoc = require("react-sortable-hoc");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reselect = require("reselect");

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

var _dataUtils = require("../../utils/data-utils");

var _layerPanel = _interopRequireDefault(require("./layer-panel/layer-panel"));

var _sourceDataCatalog = _interopRequireDefault(require("./common/source-data-catalog"));

var _icons = require("../common/icons");

var _itemSelector = _interopRequireDefault(require("../common/item-selector/item-selector"));

var _styledComponents2 = require("../common/styled-components");

var _defaultSettings = require("../../constants/default-settings");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  z-index: ", ";\n\n  &.sorting {\n    pointer-events: none;\n  }\n\n  &.sorting-layers .layer-panel__header {\n    background-color: ", ";\n    font-family: ", ";\n    font-weight: ", ";\n    font-size: ", ";\n    line-height: ", ";\n    *,\n    *:before,\n    *:after {\n      box-sizing: border-box;\n    }\n    .layer__drag-handle {\n      opacity: 1;\n      color: ", ";\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var LayerBlendingSelector = function LayerBlendingSelector(_ref) {
  var layerBlending = _ref.layerBlending,
      updateLayerBlending = _ref.updateLayerBlending,
      intl = _ref.intl;
  var labeledLayerBlendings = Object.keys(_defaultSettings.LAYER_BLENDINGS).reduce(function (acc, current) {
    return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, intl.formatMessage({
      id: _defaultSettings.LAYER_BLENDINGS[current].label
    }), current));
  }, {});
  var onChange = (0, _react.useCallback)(function (blending) {
    return updateLayerBlending(labeledLayerBlendings[blending]);
  }, [updateLayerBlending, labeledLayerBlendings]);
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: "layerBlending.title"
  })), /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], {
    selectedItems: intl.formatMessage({
      id: _defaultSettings.LAYER_BLENDINGS[layerBlending].label
    }),
    options: Object.keys(labeledLayerBlendings),
    multiSelect: false,
    searchable: false,
    onChange: onChange
  }));
}; // make sure the element is always visible while is being dragged
// item being dragged is appended in body, here to reset its global style


var SortableStyledItem = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.dropdownWrapperZ + 1;
}, function (props) {
  return props.theme.panelBackgroundHover;
}, function (props) {
  return props.theme.fontFamily;
}, function (props) {
  return props.theme.fontWeight;
}, function (props) {
  return props.theme.fontSize;
}, function (props) {
  return props.theme.lineHeight;
}, function (props) {
  return props.theme.textColorHl;
});

function AddDataButtonFactory() {
  var AddDataButton = function AddDataButton(_ref2) {
    var onClick = _ref2.onClick,
        isInactive = _ref2.isInactive;
    return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
      className: "add-data-button",
      onClick: onClick,
      isInactive: !isInactive,
      width: "105px",
      secondary: true
    }, /*#__PURE__*/_react["default"].createElement(_icons.Add, {
      height: "12px"
    }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'layerManager.addData'
    }));
  };

  return AddDataButton;
}

LayerManagerFactory.deps = [AddDataButtonFactory, _layerPanel["default"], _sourceDataCatalog["default"]];

function LayerManagerFactory(AddDataButton, LayerPanel, SourceDataCatalog) {
  // By wrapping layer panel using a sortable element we don't have to implement the drag and drop logic into the panel itself;
  // Developers can provide any layer panel implementation and it will still be sortable
  var SortableItem = (0, _reactSortableHoc.sortableElement)(function (_ref3) {
    var children = _ref3.children,
        isSorting = _ref3.isSorting;
    return /*#__PURE__*/_react["default"].createElement(SortableStyledItem, {
      className: (0, _classnames["default"])('sortable-layer-items', {
        sorting: isSorting
      })
    }, children);
  });
  var SortableContainer = (0, _reactSortableHoc.sortableContainer)(function (_ref4) {
    var children = _ref4.children;
    return /*#__PURE__*/_react["default"].createElement("div", null, children);
  });

  var LayerManager = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(LayerManager, _Component);

    var _super = _createSuper(LayerManager);

    function LayerManager() {
      var _this;

      (0, _classCallCheck2["default"])(this, LayerManager);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        isSorting: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerClassSelector", function (props) {
        return props.layerClasses;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerTypeOptionsSelector", (0, _reselect.createSelector)(_this.layerClassSelector, function (layerClasses) {
        return Object.keys(layerClasses).map(function (key) {
          var layer = new layerClasses[key]();
          return {
            id: key,
            label: layer.name,
            icon: layer.layerIcon
          };
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_addEmptyNewLayer", function () {
        _this.props.addLayer();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_handleSort", function (_ref5) {
        var oldIndex = _ref5.oldIndex,
            newIndex = _ref5.newIndex;

        _this.props.updateLayerOrder((0, _dataUtils.arrayMove)(_this.props.layerOrder, oldIndex, newIndex));

        _this.setState({
          isSorting: false
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onSortStart", function () {
        _this.setState({
          isSorting: true
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateBeforeSortStart", function (_ref6) {
        var index = _ref6.index;
        // if layer config is active, close it
        var _this$props = _this.props,
            layerOrder = _this$props.layerOrder,
            layers = _this$props.layers,
            layerConfigChange = _this$props.layerConfigChange;
        var layerIdx = layerOrder[index];

        if (layers[layerIdx].config.isConfigActive) {
          layerConfigChange(layers[layerIdx], {
            isConfigActive: false
          });
        }
      });
      return _this;
    }

    (0, _createClass2["default"])(LayerManager, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props2 = this.props,
            layers = _this$props2.layers,
            datasets = _this$props2.datasets,
            layerOrder = _this$props2.layerOrder,
            openModal = _this$props2.openModal,
            intl = _this$props2.intl;
        var defaultDataset = Object.keys(datasets)[0];
        var layerTypeOptions = this.layerTypeOptionsSelector(this.props);
        var layerActions = {
          layerColorUIChange: this.props.layerColorUIChange,
          layerConfigChange: this.props.layerConfigChange,
          layerVisualChannelConfigChange: this.props.layerVisualChannelConfigChange,
          layerTypeChange: this.props.layerTypeChange,
          layerVisConfigChange: this.props.layerVisConfigChange,
          layerTextLabelChange: this.props.layerTextLabelChange,
          removeLayer: this.props.removeLayer
        };
        var panelProps = {
          datasets: datasets,
          openModal: openModal,
          layerTypeOptions: layerTypeOptions
        };
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "layer-manager"
        }, /*#__PURE__*/_react["default"].createElement(SourceDataCatalog, {
          datasets: datasets,
          showDatasetTable: this.props.showDatasetTable,
          removeDataset: this.props.removeDataset,
          showDeleteDataset: true
        }), /*#__PURE__*/_react["default"].createElement(AddDataButton, {
          onClick: this.props.showAddDataModal,
          isInactive: !defaultDataset
        }), /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelDivider, null), /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(SortableContainer, {
          onSortEnd: this._handleSort,
          onSortStart: this._onSortStart,
          updateBeforeSortStart: this._updateBeforeSortStart,
          lockAxis: "y",
          helperClass: "sorting-layers",
          useDragHandle: true
        }, layerOrder.map(function (layerIdx, index) {
          return !layers[layerIdx].config.hidden && /*#__PURE__*/_react["default"].createElement(SortableItem, {
            key: "layer-".concat(layerIdx),
            index: index,
            isSorting: _this2.state.isSorting
          }, /*#__PURE__*/_react["default"].createElement(LayerPanel, (0, _extends2["default"])({}, panelProps, layerActions, {
            sortData: layerIdx,
            key: layers[layerIdx].id,
            idx: layerIdx,
            layer: layers[layerIdx]
          })));
        }))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, defaultDataset ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
          className: "add-layer-button",
          onClick: this._addEmptyNewLayer,
          width: "105px"
        }, /*#__PURE__*/_react["default"].createElement(_icons.Add, {
          height: "12px"
        }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'layerManager.addLayer'
        })) : null), /*#__PURE__*/_react["default"].createElement(LayerBlendingSelector, {
          layerBlending: this.props.layerBlending,
          updateLayerBlending: this.props.updateLayerBlending,
          intl: intl
        }));
      }
    }]);
    return LayerManager;
  }(_react.Component);

  (0, _defineProperty2["default"])(LayerManager, "propTypes", {
    datasets: _propTypes["default"].object.isRequired,
    layerBlending: _propTypes["default"].string.isRequired,
    layerClasses: _propTypes["default"].object.isRequired,
    layers: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    // functions
    addLayer: _propTypes["default"].func.isRequired,
    layerColorUIChange: _propTypes["default"].func.isRequired,
    layerConfigChange: _propTypes["default"].func.isRequired,
    layerTextLabelChange: _propTypes["default"].func.isRequired,
    layerVisualChannelConfigChange: _propTypes["default"].func.isRequired,
    layerTypeChange: _propTypes["default"].func.isRequired,
    layerVisConfigChange: _propTypes["default"].func.isRequired,
    openModal: _propTypes["default"].func.isRequired,
    removeLayer: _propTypes["default"].func.isRequired,
    removeDataset: _propTypes["default"].func.isRequired,
    showDatasetTable: _propTypes["default"].func.isRequired,
    updateLayerBlending: _propTypes["default"].func.isRequired,
    updateLayerOrder: _propTypes["default"].func.isRequired
  });
  return (0, _reactIntl.injectIntl)(LayerManager);
}

var _default = LayerManagerFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJMYXllckJsZW5kaW5nU2VsZWN0b3IiLCJsYXllckJsZW5kaW5nIiwidXBkYXRlTGF5ZXJCbGVuZGluZyIsImludGwiLCJsYWJlbGVkTGF5ZXJCbGVuZGluZ3MiLCJPYmplY3QiLCJrZXlzIiwiTEFZRVJfQkxFTkRJTkdTIiwicmVkdWNlIiwiYWNjIiwiY3VycmVudCIsImZvcm1hdE1lc3NhZ2UiLCJpZCIsImxhYmVsIiwib25DaGFuZ2UiLCJibGVuZGluZyIsIlNvcnRhYmxlU3R5bGVkSXRlbSIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJkcm9wZG93bldyYXBwZXJaIiwicGFuZWxCYWNrZ3JvdW5kSG92ZXIiLCJmb250RmFtaWx5IiwiZm9udFdlaWdodCIsImZvbnRTaXplIiwibGluZUhlaWdodCIsInRleHRDb2xvckhsIiwiQWRkRGF0YUJ1dHRvbkZhY3RvcnkiLCJBZGREYXRhQnV0dG9uIiwib25DbGljayIsImlzSW5hY3RpdmUiLCJMYXllck1hbmFnZXJGYWN0b3J5IiwiZGVwcyIsIkxheWVyUGFuZWxGYWN0b3J5IiwiU291cmNlRGF0YUNhdGFsb2dGYWN0b3J5IiwiTGF5ZXJQYW5lbCIsIlNvdXJjZURhdGFDYXRhbG9nIiwiU29ydGFibGVJdGVtIiwiY2hpbGRyZW4iLCJpc1NvcnRpbmciLCJzb3J0aW5nIiwiU29ydGFibGVDb250YWluZXIiLCJMYXllck1hbmFnZXIiLCJsYXllckNsYXNzZXMiLCJsYXllckNsYXNzU2VsZWN0b3IiLCJtYXAiLCJrZXkiLCJsYXllciIsIm5hbWUiLCJpY29uIiwibGF5ZXJJY29uIiwiYWRkTGF5ZXIiLCJvbGRJbmRleCIsIm5ld0luZGV4IiwidXBkYXRlTGF5ZXJPcmRlciIsImxheWVyT3JkZXIiLCJzZXRTdGF0ZSIsImluZGV4IiwibGF5ZXJzIiwibGF5ZXJDb25maWdDaGFuZ2UiLCJsYXllcklkeCIsImNvbmZpZyIsImlzQ29uZmlnQWN0aXZlIiwiZGF0YXNldHMiLCJvcGVuTW9kYWwiLCJkZWZhdWx0RGF0YXNldCIsImxheWVyVHlwZU9wdGlvbnMiLCJsYXllclR5cGVPcHRpb25zU2VsZWN0b3IiLCJsYXllckFjdGlvbnMiLCJsYXllckNvbG9yVUlDaGFuZ2UiLCJsYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2UiLCJsYXllclR5cGVDaGFuZ2UiLCJsYXllclZpc0NvbmZpZ0NoYW5nZSIsImxheWVyVGV4dExhYmVsQ2hhbmdlIiwicmVtb3ZlTGF5ZXIiLCJwYW5lbFByb3BzIiwic2hvd0RhdGFzZXRUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJzaG93QWRkRGF0YU1vZGFsIiwiX2hhbmRsZVNvcnQiLCJfb25Tb3J0U3RhcnQiLCJfdXBkYXRlQmVmb3JlU29ydFN0YXJ0IiwiaGlkZGVuIiwic3RhdGUiLCJfYWRkRW1wdHlOZXdMYXllciIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJhcnJheU9mIiwiYW55IiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU9BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0IsT0FBZ0Q7QUFBQSxNQUE5Q0MsYUFBOEMsUUFBOUNBLGFBQThDO0FBQUEsTUFBL0JDLG1CQUErQixRQUEvQkEsbUJBQStCO0FBQUEsTUFBVkMsSUFBVSxRQUFWQSxJQUFVO0FBQzVFLE1BQU1DLHFCQUFxQixHQUFHQyxNQUFNLENBQUNDLElBQVAsQ0FBWUMsZ0NBQVosRUFBNkJDLE1BQTdCLENBQzVCLFVBQUNDLEdBQUQsRUFBTUMsT0FBTjtBQUFBLDJDQUNLRCxHQURM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QUFlSixVQWJUO0FBY2pCZCxJQUFBQSxXQUFXLEVBQUVZLHNCQUFVTSxJQUFWLENBQWVKLFVBZFg7QUFlakJYLElBQUFBLGFBQWEsRUFBRVMsc0JBQVVNLElBQVYsQ0FBZUosVUFmYjtBQWdCakJaLElBQUFBLGdCQUFnQixFQUFFVSxzQkFBVU0sSUFBVixDQUFlSixVQWhCaEI7QUFpQmpCdkYsSUFBQUEsbUJBQW1CLEVBQUVxRixzQkFBVU0sSUFBVixDQUFlSixVQWpCbkI7QUFrQmpCbEMsSUFBQUEsZ0JBQWdCLEVBQUVnQyxzQkFBVU0sSUFBVixDQUFlSjtBQWxCaEIsR0FoQm9EO0FBd0p6RSxTQUFPLDJCQUFXOUMsWUFBWCxDQUFQO0FBQ0Q7O2VBRWNYLG1CIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCB1c2VDYWxsYmFja30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge3NvcnRhYmxlQ29udGFpbmVyLCBzb3J0YWJsZUVsZW1lbnR9IGZyb20gJ3JlYWN0LXNvcnRhYmxlLWhvYyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCB7aW5qZWN0SW50bH0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5pbXBvcnQge2FycmF5TW92ZX0gZnJvbSAndXRpbHMvZGF0YS11dGlscyc7XG5cbmltcG9ydCBMYXllclBhbmVsRmFjdG9yeSBmcm9tICcuL2xheWVyLXBhbmVsL2xheWVyLXBhbmVsJztcbmltcG9ydCBTb3VyY2VEYXRhQ2F0YWxvZ0ZhY3RvcnkgZnJvbSAnLi9jb21tb24vc291cmNlLWRhdGEtY2F0YWxvZyc7XG5pbXBvcnQge0FkZH0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IEl0ZW1TZWxlY3RvciBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pdGVtLXNlbGVjdG9yL2l0ZW0tc2VsZWN0b3InO1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBQYW5lbExhYmVsLFxuICBTaWRlUGFuZWxEaXZpZGVyLFxuICBTaWRlUGFuZWxTZWN0aW9uXG59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcblxuaW1wb3J0IHtMQVlFUl9CTEVORElOR1N9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuY29uc3QgTGF5ZXJCbGVuZGluZ1NlbGVjdG9yID0gKHtsYXllckJsZW5kaW5nLCB1cGRhdGVMYXllckJsZW5kaW5nLCBpbnRsfSkgPT4ge1xuICBjb25zdCBsYWJlbGVkTGF5ZXJCbGVuZGluZ3MgPSBPYmplY3Qua2V5cyhMQVlFUl9CTEVORElOR1MpLnJlZHVjZShcbiAgICAoYWNjLCBjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uYWNjLFxuICAgICAgW2ludGwuZm9ybWF0TWVzc2FnZSh7aWQ6IExBWUVSX0JMRU5ESU5HU1tjdXJyZW50XS5sYWJlbH0pXTogY3VycmVudFxuICAgIH0pLFxuICAgIHt9XG4gICk7XG5cbiAgY29uc3Qgb25DaGFuZ2UgPSB1c2VDYWxsYmFjayhibGVuZGluZyA9PiB1cGRhdGVMYXllckJsZW5kaW5nKGxhYmVsZWRMYXllckJsZW5kaW5nc1tibGVuZGluZ10pLCBbXG4gICAgdXBkYXRlTGF5ZXJCbGVuZGluZyxcbiAgICBsYWJlbGVkTGF5ZXJCbGVuZGluZ3NcbiAgXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8U2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgIDxQYW5lbExhYmVsPlxuICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD1cImxheWVyQmxlbmRpbmcudGl0bGVcIiAvPlxuICAgICAgPC9QYW5lbExhYmVsPlxuICAgICAgPEl0ZW1TZWxlY3RvclxuICAgICAgICBzZWxlY3RlZEl0ZW1zPXtpbnRsLmZvcm1hdE1lc3NhZ2Uoe2lkOiBMQVlFUl9CTEVORElOR1NbbGF5ZXJCbGVuZGluZ10ubGFiZWx9KX1cbiAgICAgICAgb3B0aW9ucz17T2JqZWN0LmtleXMobGFiZWxlZExheWVyQmxlbmRpbmdzKX1cbiAgICAgICAgbXVsdGlTZWxlY3Q9e2ZhbHNlfVxuICAgICAgICBzZWFyY2hhYmxlPXtmYWxzZX1cbiAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgLz5cbiAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICk7XG59O1xuXG4vLyBtYWtlIHN1cmUgdGhlIGVsZW1lbnQgaXMgYWx3YXlzIHZpc2libGUgd2hpbGUgaXMgYmVpbmcgZHJhZ2dlZFxuLy8gaXRlbSBiZWluZyBkcmFnZ2VkIGlzIGFwcGVuZGVkIGluIGJvZHksIGhlcmUgdG8gcmVzZXQgaXRzIGdsb2JhbCBzdHlsZVxuY29uc3QgU29ydGFibGVTdHlsZWRJdGVtID0gc3R5bGVkLmRpdmBcbiAgei1pbmRleDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bldyYXBwZXJaICsgMX07XG5cbiAgJi5zb3J0aW5nIHtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuXG4gICYuc29ydGluZy1sYXllcnMgLmxheWVyLXBhbmVsX19oZWFkZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCYWNrZ3JvdW5kSG92ZXJ9O1xuICAgIGZvbnQtZmFtaWx5OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZvbnRGYW1pbHl9O1xuICAgIGZvbnQtd2VpZ2h0OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZvbnRXZWlnaHR9O1xuICAgIGZvbnQtc2l6ZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5mb250U2l6ZX07XG4gICAgbGluZS1oZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGluZUhlaWdodH07XG4gICAgKixcbiAgICAqOmJlZm9yZSxcbiAgICAqOmFmdGVyIHtcbiAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuICAgIC5sYXllcl9fZHJhZy1oYW5kbGUge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckhsfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGREYXRhQnV0dG9uRmFjdG9yeSgpIHtcbiAgY29uc3QgQWRkRGF0YUJ1dHRvbiA9ICh7b25DbGljaywgaXNJbmFjdGl2ZX0pID0+IChcbiAgICA8QnV0dG9uXG4gICAgICBjbGFzc05hbWU9XCJhZGQtZGF0YS1idXR0b25cIlxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIGlzSW5hY3RpdmU9eyFpc0luYWN0aXZlfVxuICAgICAgd2lkdGg9XCIxMDVweFwiXG4gICAgICBzZWNvbmRhcnlcbiAgICA+XG4gICAgICA8QWRkIGhlaWdodD1cIjEycHhcIiAvPlxuICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydsYXllck1hbmFnZXIuYWRkRGF0YSd9IC8+XG4gICAgPC9CdXR0b24+XG4gICk7XG5cbiAgcmV0dXJuIEFkZERhdGFCdXR0b247XG59XG5cbkxheWVyTWFuYWdlckZhY3RvcnkuZGVwcyA9IFtBZGREYXRhQnV0dG9uRmFjdG9yeSwgTGF5ZXJQYW5lbEZhY3RvcnksIFNvdXJjZURhdGFDYXRhbG9nRmFjdG9yeV07XG5cbmZ1bmN0aW9uIExheWVyTWFuYWdlckZhY3RvcnkoQWRkRGF0YUJ1dHRvbiwgTGF5ZXJQYW5lbCwgU291cmNlRGF0YUNhdGFsb2cpIHtcbiAgLy8gQnkgd3JhcHBpbmcgbGF5ZXIgcGFuZWwgdXNpbmcgYSBzb3J0YWJsZSBlbGVtZW50IHdlIGRvbid0IGhhdmUgdG8gaW1wbGVtZW50IHRoZSBkcmFnIGFuZCBkcm9wIGxvZ2ljIGludG8gdGhlIHBhbmVsIGl0c2VsZjtcbiAgLy8gRGV2ZWxvcGVycyBjYW4gcHJvdmlkZSBhbnkgbGF5ZXIgcGFuZWwgaW1wbGVtZW50YXRpb24gYW5kIGl0IHdpbGwgc3RpbGwgYmUgc29ydGFibGVcbiAgY29uc3QgU29ydGFibGVJdGVtID0gc29ydGFibGVFbGVtZW50KCh7Y2hpbGRyZW4sIGlzU29ydGluZ30pID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPFNvcnRhYmxlU3R5bGVkSXRlbSBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ3NvcnRhYmxlLWxheWVyLWl0ZW1zJywge3NvcnRpbmc6IGlzU29ydGluZ30pfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9Tb3J0YWJsZVN0eWxlZEl0ZW0+XG4gICAgKTtcbiAgfSk7XG5cbiAgY29uc3QgU29ydGFibGVDb250YWluZXIgPSBzb3J0YWJsZUNvbnRhaW5lcigoe2NoaWxkcmVufSkgPT4ge1xuICAgIHJldHVybiA8ZGl2PntjaGlsZHJlbn08L2Rpdj47XG4gIH0pO1xuXG4gIGNsYXNzIExheWVyTWFuYWdlciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIGRhdGFzZXRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBsYXllckJsZW5kaW5nOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICBsYXllckNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIC8vIGZ1bmN0aW9uc1xuICAgICAgYWRkTGF5ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsYXllckNvbG9yVUlDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsYXllckNvbmZpZ0NoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyVGV4dExhYmVsQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJUeXBlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJWaXNDb25maWdDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBvcGVuTW9kYWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICByZW1vdmVMYXllcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHJlbW92ZURhdGFzZXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBzaG93RGF0YXNldFRhYmxlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgdXBkYXRlTGF5ZXJCbGVuZGluZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHVwZGF0ZUxheWVyT3JkZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9O1xuICAgIHN0YXRlID0ge1xuICAgICAgaXNTb3J0aW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICBsYXllckNsYXNzU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5sYXllckNsYXNzZXM7XG4gICAgbGF5ZXJUeXBlT3B0aW9uc1NlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IodGhpcy5sYXllckNsYXNzU2VsZWN0b3IsIGxheWVyQ2xhc3NlcyA9PlxuICAgICAgT2JqZWN0LmtleXMobGF5ZXJDbGFzc2VzKS5tYXAoa2V5ID0+IHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBuZXcgbGF5ZXJDbGFzc2VzW2tleV0oKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDoga2V5LFxuICAgICAgICAgIGxhYmVsOiBsYXllci5uYW1lLFxuICAgICAgICAgIGljb246IGxheWVyLmxheWVySWNvblxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgX2FkZEVtcHR5TmV3TGF5ZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLmFkZExheWVyKCk7XG4gICAgfTtcblxuICAgIF9oYW5kbGVTb3J0ID0gKHtvbGRJbmRleCwgbmV3SW5kZXh9KSA9PiB7XG4gICAgICB0aGlzLnByb3BzLnVwZGF0ZUxheWVyT3JkZXIoYXJyYXlNb3ZlKHRoaXMucHJvcHMubGF5ZXJPcmRlciwgb2xkSW5kZXgsIG5ld0luZGV4KSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc1NvcnRpbmc6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vblNvcnRTdGFydCA9ICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzU29ydGluZzogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBfdXBkYXRlQmVmb3JlU29ydFN0YXJ0ID0gKHtpbmRleH0pID0+IHtcbiAgICAgIC8vIGlmIGxheWVyIGNvbmZpZyBpcyBhY3RpdmUsIGNsb3NlIGl0XG4gICAgICBjb25zdCB7bGF5ZXJPcmRlciwgbGF5ZXJzLCBsYXllckNvbmZpZ0NoYW5nZX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgbGF5ZXJJZHggPSBsYXllck9yZGVyW2luZGV4XTtcbiAgICAgIGlmIChsYXllcnNbbGF5ZXJJZHhdLmNvbmZpZy5pc0NvbmZpZ0FjdGl2ZSkge1xuICAgICAgICBsYXllckNvbmZpZ0NoYW5nZShsYXllcnNbbGF5ZXJJZHhdLCB7aXNDb25maWdBY3RpdmU6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtsYXllcnMsIGRhdGFzZXRzLCBsYXllck9yZGVyLCBvcGVuTW9kYWwsIGludGx9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGRlZmF1bHREYXRhc2V0ID0gT2JqZWN0LmtleXMoZGF0YXNldHMpWzBdO1xuICAgICAgY29uc3QgbGF5ZXJUeXBlT3B0aW9ucyA9IHRoaXMubGF5ZXJUeXBlT3B0aW9uc1NlbGVjdG9yKHRoaXMucHJvcHMpO1xuXG4gICAgICBjb25zdCBsYXllckFjdGlvbnMgPSB7XG4gICAgICAgIGxheWVyQ29sb3JVSUNoYW5nZTogdGhpcy5wcm9wcy5sYXllckNvbG9yVUlDaGFuZ2UsXG4gICAgICAgIGxheWVyQ29uZmlnQ2hhbmdlOiB0aGlzLnByb3BzLmxheWVyQ29uZmlnQ2hhbmdlLFxuICAgICAgICBsYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2U6IHRoaXMucHJvcHMubGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlLFxuICAgICAgICBsYXllclR5cGVDaGFuZ2U6IHRoaXMucHJvcHMubGF5ZXJUeXBlQ2hhbmdlLFxuICAgICAgICBsYXllclZpc0NvbmZpZ0NoYW5nZTogdGhpcy5wcm9wcy5sYXllclZpc0NvbmZpZ0NoYW5nZSxcbiAgICAgICAgbGF5ZXJUZXh0TGFiZWxDaGFuZ2U6IHRoaXMucHJvcHMubGF5ZXJUZXh0TGFiZWxDaGFuZ2UsXG4gICAgICAgIHJlbW92ZUxheWVyOiB0aGlzLnByb3BzLnJlbW92ZUxheWVyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwYW5lbFByb3BzID0ge1xuICAgICAgICBkYXRhc2V0cyxcbiAgICAgICAgb3Blbk1vZGFsLFxuICAgICAgICBsYXllclR5cGVPcHRpb25zXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxheWVyLW1hbmFnZXJcIj5cbiAgICAgICAgICA8U291cmNlRGF0YUNhdGFsb2dcbiAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgIHNob3dEYXRhc2V0VGFibGU9e3RoaXMucHJvcHMuc2hvd0RhdGFzZXRUYWJsZX1cbiAgICAgICAgICAgIHJlbW92ZURhdGFzZXQ9e3RoaXMucHJvcHMucmVtb3ZlRGF0YXNldH1cbiAgICAgICAgICAgIHNob3dEZWxldGVEYXRhc2V0XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QWRkRGF0YUJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dBZGREYXRhTW9kYWx9IGlzSW5hY3RpdmU9eyFkZWZhdWx0RGF0YXNldH0gLz5cbiAgICAgICAgICA8U2lkZVBhbmVsRGl2aWRlciAvPlxuICAgICAgICAgIDxTaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgICAgPFNvcnRhYmxlQ29udGFpbmVyXG4gICAgICAgICAgICAgIG9uU29ydEVuZD17dGhpcy5faGFuZGxlU29ydH1cbiAgICAgICAgICAgICAgb25Tb3J0U3RhcnQ9e3RoaXMuX29uU29ydFN0YXJ0fVxuICAgICAgICAgICAgICB1cGRhdGVCZWZvcmVTb3J0U3RhcnQ9e3RoaXMuX3VwZGF0ZUJlZm9yZVNvcnRTdGFydH1cbiAgICAgICAgICAgICAgbG9ja0F4aXM9XCJ5XCJcbiAgICAgICAgICAgICAgaGVscGVyQ2xhc3M9XCJzb3J0aW5nLWxheWVyc1wiXG4gICAgICAgICAgICAgIHVzZURyYWdIYW5kbGVcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2xheWVyT3JkZXIubWFwKFxuICAgICAgICAgICAgICAgIChsYXllcklkeCwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICAgICAhbGF5ZXJzW2xheWVySWR4XS5jb25maWcuaGlkZGVuICYmIChcbiAgICAgICAgICAgICAgICAgICAgPFNvcnRhYmxlSXRlbVxuICAgICAgICAgICAgICAgICAgICAgIGtleT17YGxheWVyLSR7bGF5ZXJJZHh9YH1cbiAgICAgICAgICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgaXNTb3J0aW5nPXt0aGlzLnN0YXRlLmlzU29ydGluZ31cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxMYXllclBhbmVsXG4gICAgICAgICAgICAgICAgICAgICAgICB7Li4ucGFuZWxQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5sYXllckFjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0RGF0YT17bGF5ZXJJZHh9XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2xheWVyc1tsYXllcklkeF0uaWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHg9e2xheWVySWR4fVxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXI9e2xheWVyc1tsYXllcklkeF19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9Tb3J0YWJsZUl0ZW0+XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L1NvcnRhYmxlQ29udGFpbmVyPlxuICAgICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICA8U2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICAgIHtkZWZhdWx0RGF0YXNldCA/IChcbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJhZGQtbGF5ZXItYnV0dG9uXCIgb25DbGljaz17dGhpcy5fYWRkRW1wdHlOZXdMYXllcn0gd2lkdGg9XCIxMDVweFwiPlxuICAgICAgICAgICAgICAgIDxBZGQgaGVpZ2h0PVwiMTJweFwiIC8+XG4gICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydsYXllck1hbmFnZXIuYWRkTGF5ZXInfSAvPlxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICA8TGF5ZXJCbGVuZGluZ1NlbGVjdG9yXG4gICAgICAgICAgICBsYXllckJsZW5kaW5nPXt0aGlzLnByb3BzLmxheWVyQmxlbmRpbmd9XG4gICAgICAgICAgICB1cGRhdGVMYXllckJsZW5kaW5nPXt0aGlzLnByb3BzLnVwZGF0ZUxheWVyQmxlbmRpbmd9XG4gICAgICAgICAgICBpbnRsPXtpbnRsfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluamVjdEludGwoTGF5ZXJNYW5hZ2VyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTGF5ZXJNYW5hZ2VyRmFjdG9yeTtcbiJdfQ==