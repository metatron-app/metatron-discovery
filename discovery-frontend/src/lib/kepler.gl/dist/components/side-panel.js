"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SidePanelFactory;
exports.PanelTitleFactory = void 0;

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

var _localization = require("../localization");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _lodash = _interopRequireDefault(require("lodash.get"));

var _sideBar = _interopRequireDefault(require("./side-panel/side-bar"));

var _panelHeader = _interopRequireDefault(require("./side-panel/panel-header"));

var _layerManager = _interopRequireDefault(require("./side-panel/layer-manager"));

var _filterManager = _interopRequireDefault(require("./side-panel/filter-manager"));

var _interactionManager = _interopRequireDefault(require("./side-panel/interaction-manager"));

var _mapManager = _interopRequireDefault(require("./side-panel/map-manager"));

var _panelToggle = _interopRequireDefault(require("./side-panel/panel-toggle"));

var _customPanel = _interopRequireDefault(require("./side-panel/custom-panel"));

var _defaultSettings = require("../constants/default-settings");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: ", ";\n  line-height: ", ";\n  font-weight: 400;\n  letter-spacing: 1.25px;\n  margin-bottom: 14px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n  flex-grow: 1;\n  padding: ", "px;\n  overflow-y: scroll;\n  overflow-x: hidden;\n\n  .side-panel__content__inner {\n    display: flex;\n    height: 100%;\n    flex-direction: column;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var SidePanelContent = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.sidePanelScrollBar;
}, function (props) {
  return props.theme.sidePanelInnerPadding;
});

var PanelTitleFactory = function PanelTitleFactory() {
  return _styledComponents["default"].div(_templateObject2(), function (props) {
    return props.theme.titleTextColor;
  }, function (props) {
    return props.theme.sidePanelTitleFontsize;
  }, function (props) {
    return props.theme.sidePanelTitleLineHeight;
  });
};

exports.PanelTitleFactory = PanelTitleFactory;
SidePanelFactory.deps = [_sideBar["default"], _panelHeader["default"], _panelToggle["default"], PanelTitleFactory, _layerManager["default"], _filterManager["default"], _interactionManager["default"], _mapManager["default"], _customPanel["default"]];
/**
 *
 * Vertical sidebar containing input components for the rendering layers
 */

function SidePanelFactory(Sidebar, PanelHeader, PanelToggle, PanelTitle, LayerManager, FilterManager, InteractionManager, MapManager, CustomPanels) {
  var customPanels = (0, _lodash["default"])(CustomPanels, ['defaultProps', 'panels']) || [];

  var getCustomPanelProps = (0, _lodash["default"])(CustomPanels, ['defaultProps', 'getProps']) || function () {
    return {};
  };

  var SidePanel = /*#__PURE__*/function (_PureComponent) {
    (0, _inherits2["default"])(SidePanel, _PureComponent);

    var _super = _createSuper(SidePanel);

    function SidePanel() {
      var _this;

      (0, _classCallCheck2["default"])(this, SidePanel);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onOpenOrClose", function () {
        _this.props.uiStateActions.toggleSidePanel(_this.props.uiState.activeSidePanel ? null : 'layer');
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_showDatasetTable", function (dataId) {
        // this will open data table modal
        _this.props.visStateActions.showDatasetTable(dataId);

        _this.props.uiStateActions.toggleModal(_defaultSettings.DATA_TABLE_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_showAddDataModal", function () {
        _this.props.uiStateActions.toggleModal(_defaultSettings.ADD_DATA_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_showAddMapStyleModal", function () {
        _this.props.uiStateActions.toggleModal(_defaultSettings.ADD_MAP_STYLE_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_removeDataset", function (key) {
        // this will show the modal dialog to confirm deletion
        _this.props.uiStateActions.openDeleteModal(key);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickExportImage", function () {
        return _this.props.uiStateActions.toggleModal(_defaultSettings.EXPORT_IMAGE_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickExportData", function () {
        return _this.props.uiStateActions.toggleModal(_defaultSettings.EXPORT_DATA_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickExportMap", function () {
        return _this.props.uiStateActions.toggleModal(_defaultSettings.EXPORT_MAP_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickSaveToStorage", function () {
        return _this.props.uiStateActions.toggleModal(_this.props.mapSaved ? _defaultSettings.OVERWRITE_MAP_ID : _defaultSettings.SAVE_MAP_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickSaveAsToStorage", function () {
        // add (copy) to file name
        _this.props.visStateActions.setMapInfo({
          title: "".concat(_this.props.mapInfo.title || 'Kepler.gl', " (Copy)")
        });

        _this.props.uiStateActions.toggleModal(_defaultSettings.SAVE_MAP_ID);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickShareMap", function () {
        return _this.props.uiStateActions.toggleModal(_defaultSettings.SHARE_MAP_ID);
      });
      return _this;
    }

    (0, _createClass2["default"])(SidePanel, [{
      key: "render",
      // eslint-disable-next-line complexity
      value: function render() {
        var _this$props = this.props,
            appName = _this$props.appName,
            appWebsite = _this$props.appWebsite,
            version = _this$props.version,
            datasets = _this$props.datasets,
            filters = _this$props.filters,
            layers = _this$props.layers,
            layerBlending = _this$props.layerBlending,
            layerClasses = _this$props.layerClasses,
            uiState = _this$props.uiState,
            layerOrder = _this$props.layerOrder,
            interactionConfig = _this$props.interactionConfig,
            visStateActions = _this$props.visStateActions,
            mapStyleActions = _this$props.mapStyleActions,
            uiStateActions = _this$props.uiStateActions,
            availableProviders = _this$props.availableProviders;
        var activeSidePanel = uiState.activeSidePanel;
        var isOpen = Boolean(activeSidePanel);
        var panels = [].concat((0, _toConsumableArray2["default"])(this.props.panels), (0, _toConsumableArray2["default"])(customPanels));
        var layerManagerActions = {
          addLayer: visStateActions.addLayer,
          layerConfigChange: visStateActions.layerConfigChange,
          layerColorUIChange: visStateActions.layerColorUIChange,
          layerTextLabelChange: visStateActions.layerTextLabelChange,
          layerVisualChannelConfigChange: visStateActions.layerVisualChannelConfigChange,
          layerTypeChange: visStateActions.layerTypeChange,
          layerVisConfigChange: visStateActions.layerVisConfigChange,
          updateLayerBlending: visStateActions.updateLayerBlending,
          updateLayerOrder: visStateActions.reorderLayer,
          showDatasetTable: this._showDatasetTable,
          showAddDataModal: this._showAddDataModal,
          removeLayer: visStateActions.removeLayer,
          removeDataset: this._removeDataset,
          openModal: uiStateActions.toggleModal
        };
        var filterManagerActions = {
          addFilter: visStateActions.addFilter,
          removeFilter: visStateActions.removeFilter,
          setFilter: visStateActions.setFilter,
          showDatasetTable: this._showDatasetTable,
          showAddDataModal: this._showAddDataModal,
          toggleAnimation: visStateActions.toggleFilterAnimation,
          enlargeFilter: visStateActions.enlargeFilter,
          toggleFilterFeature: visStateActions.toggleFilterFeature
        };
        var interactionManagerActions = {
          onConfigChange: visStateActions.interactionConfigChange
        };
        var mapManagerActions = {
          addMapStyleUrl: mapStyleActions.addMapStyleUrl,
          onConfigChange: mapStyleActions.mapConfigChange,
          onStyleChange: mapStyleActions.mapStyleChange,
          onBuildingChange: mapStyleActions.mapBuildingChange,
          set3dBuildingColor: mapStyleActions.set3dBuildingColor,
          showAddMapStyleModal: this._showAddMapStyleModal
        };
        return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(Sidebar, {
          width: this.props.width,
          isOpen: isOpen,
          minifiedWidth: 0,
          onOpenOrClose: this._onOpenOrClose
        }, /*#__PURE__*/_react["default"].createElement(PanelHeader, {
          appName: appName,
          version: version,
          appWebsite: appWebsite,
          visibleDropdown: uiState.visibleDropdown,
          showExportDropdown: uiStateActions.showExportDropdown,
          hideExportDropdown: uiStateActions.hideExportDropdown,
          onExportImage: this._onClickExportImage,
          onExportData: this._onClickExportData,
          onExportMap: this._onClickExportMap,
          onSaveMap: this.props.onSaveMap,
          onSaveToStorage: availableProviders.hasStorage ? this._onClickSaveToStorage : null,
          onSaveAsToStorage: availableProviders.hasStorage && this.props.mapSaved ? this._onClickSaveAsToStorage : null,
          onShareMap: availableProviders.hasShare ? this._onClickShareMap : null
        }), /*#__PURE__*/_react["default"].createElement(PanelToggle, {
          panels: panels,
          activePanel: activeSidePanel,
          togglePanel: uiStateActions.toggleSidePanel
        }), /*#__PURE__*/_react["default"].createElement(SidePanelContent, {
          className: "side-panel__content"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "side-panel__content__inner"
        }, /*#__PURE__*/_react["default"].createElement(PanelTitle, {
          className: "side-panel__content__title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: (panels.find(function (_ref) {
            var id = _ref.id;
            return id === activeSidePanel;
          }) || {}).label
        })), activeSidePanel === 'layer' && /*#__PURE__*/_react["default"].createElement(LayerManager, (0, _extends2["default"])({}, layerManagerActions, {
          datasets: datasets,
          layers: layers,
          layerClasses: layerClasses,
          layerOrder: layerOrder,
          layerBlending: layerBlending,
          colorPalette: uiState.colorPalette
        })), activeSidePanel === 'filter' && /*#__PURE__*/_react["default"].createElement(FilterManager, (0, _extends2["default"])({}, filterManagerActions, {
          datasets: datasets,
          layers: layers,
          filters: filters
        })), activeSidePanel === 'interaction' && /*#__PURE__*/_react["default"].createElement(InteractionManager, (0, _extends2["default"])({}, interactionManagerActions, {
          datasets: datasets,
          interactionConfig: interactionConfig
        })), activeSidePanel === 'map' && /*#__PURE__*/_react["default"].createElement(MapManager, (0, _extends2["default"])({}, mapManagerActions, {
          mapStyle: this.props.mapStyle
        })), (customPanels || []).find(function (p) {
          return p.id === activeSidePanel;
        }) ? /*#__PURE__*/_react["default"].createElement(CustomPanels, (0, _extends2["default"])({}, getCustomPanelProps(this.props), {
          activeSidePanel: activeSidePanel
        })) : null))));
      }
    }]);
    return SidePanel;
  }(_react.PureComponent);

  (0, _defineProperty2["default"])(SidePanel, "propTypes", {
    filters: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    interactionConfig: _propTypes["default"].object.isRequired,
    layerBlending: _propTypes["default"].string.isRequired,
    layers: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    layerClasses: _propTypes["default"].object.isRequired,
    mapStyle: _propTypes["default"].object.isRequired,
    width: _propTypes["default"].number.isRequired,
    datasets: _propTypes["default"].object.isRequired,
    visStateActions: _propTypes["default"].object.isRequired,
    mapStyleActions: _propTypes["default"].object.isRequired,
    availableProviders: _propTypes["default"].object,
    mapSaved: _propTypes["default"].string,
    panels: _propTypes["default"].arrayOf(_propTypes["default"].object)
  });
  (0, _defineProperty2["default"])(SidePanel, "defaultProps", {
    panels: _defaultSettings.SIDEBAR_PANELS,
    uiState: {},
    visStateActions: {},
    mapStyleActions: {},
    uiStateActions: {},
    availableProviders: {}
  });
  return SidePanel;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwuanMiXSwibmFtZXMiOlsiU2lkZVBhbmVsQ29udGVudCIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJzaWRlUGFuZWxTY3JvbGxCYXIiLCJzaWRlUGFuZWxJbm5lclBhZGRpbmciLCJQYW5lbFRpdGxlRmFjdG9yeSIsInRpdGxlVGV4dENvbG9yIiwic2lkZVBhbmVsVGl0bGVGb250c2l6ZSIsInNpZGVQYW5lbFRpdGxlTGluZUhlaWdodCIsIlNpZGVQYW5lbEZhY3RvcnkiLCJkZXBzIiwiU2lkZWJhckZhY3RvcnkiLCJQYW5lbEhlYWRlckZhY3RvcnkiLCJQYW5lbFRvZ2dsZUZhY3RvcnkiLCJMYXllck1hbmFnZXJGYWN0b3J5IiwiRmlsdGVyTWFuYWdlckZhY3RvcnkiLCJJbnRlcmFjdGlvbk1hbmFnZXJGYWN0b3J5IiwiTWFwTWFuYWdlckZhY3RvcnkiLCJDdXN0b21QYW5lbHNGYWN0b3J5IiwiU2lkZWJhciIsIlBhbmVsSGVhZGVyIiwiUGFuZWxUb2dnbGUiLCJQYW5lbFRpdGxlIiwiTGF5ZXJNYW5hZ2VyIiwiRmlsdGVyTWFuYWdlciIsIkludGVyYWN0aW9uTWFuYWdlciIsIk1hcE1hbmFnZXIiLCJDdXN0b21QYW5lbHMiLCJjdXN0b21QYW5lbHMiLCJnZXRDdXN0b21QYW5lbFByb3BzIiwiU2lkZVBhbmVsIiwidWlTdGF0ZUFjdGlvbnMiLCJ0b2dnbGVTaWRlUGFuZWwiLCJ1aVN0YXRlIiwiYWN0aXZlU2lkZVBhbmVsIiwiZGF0YUlkIiwidmlzU3RhdGVBY3Rpb25zIiwic2hvd0RhdGFzZXRUYWJsZSIsInRvZ2dsZU1vZGFsIiwiREFUQV9UQUJMRV9JRCIsIkFERF9EQVRBX0lEIiwiQUREX01BUF9TVFlMRV9JRCIsImtleSIsIm9wZW5EZWxldGVNb2RhbCIsIkVYUE9SVF9JTUFHRV9JRCIsIkVYUE9SVF9EQVRBX0lEIiwiRVhQT1JUX01BUF9JRCIsIm1hcFNhdmVkIiwiT1ZFUldSSVRFX01BUF9JRCIsIlNBVkVfTUFQX0lEIiwic2V0TWFwSW5mbyIsInRpdGxlIiwibWFwSW5mbyIsIlNIQVJFX01BUF9JRCIsImFwcE5hbWUiLCJhcHBXZWJzaXRlIiwidmVyc2lvbiIsImRhdGFzZXRzIiwiZmlsdGVycyIsImxheWVycyIsImxheWVyQmxlbmRpbmciLCJsYXllckNsYXNzZXMiLCJsYXllck9yZGVyIiwiaW50ZXJhY3Rpb25Db25maWciLCJtYXBTdHlsZUFjdGlvbnMiLCJhdmFpbGFibGVQcm92aWRlcnMiLCJpc09wZW4iLCJCb29sZWFuIiwicGFuZWxzIiwibGF5ZXJNYW5hZ2VyQWN0aW9ucyIsImFkZExheWVyIiwibGF5ZXJDb25maWdDaGFuZ2UiLCJsYXllckNvbG9yVUlDaGFuZ2UiLCJsYXllclRleHRMYWJlbENoYW5nZSIsImxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZ0NoYW5nZSIsImxheWVyVHlwZUNoYW5nZSIsImxheWVyVmlzQ29uZmlnQ2hhbmdlIiwidXBkYXRlTGF5ZXJCbGVuZGluZyIsInVwZGF0ZUxheWVyT3JkZXIiLCJyZW9yZGVyTGF5ZXIiLCJfc2hvd0RhdGFzZXRUYWJsZSIsInNob3dBZGREYXRhTW9kYWwiLCJfc2hvd0FkZERhdGFNb2RhbCIsInJlbW92ZUxheWVyIiwicmVtb3ZlRGF0YXNldCIsIl9yZW1vdmVEYXRhc2V0Iiwib3Blbk1vZGFsIiwiZmlsdGVyTWFuYWdlckFjdGlvbnMiLCJhZGRGaWx0ZXIiLCJyZW1vdmVGaWx0ZXIiLCJzZXRGaWx0ZXIiLCJ0b2dnbGVBbmltYXRpb24iLCJ0b2dnbGVGaWx0ZXJBbmltYXRpb24iLCJlbmxhcmdlRmlsdGVyIiwidG9nZ2xlRmlsdGVyRmVhdHVyZSIsImludGVyYWN0aW9uTWFuYWdlckFjdGlvbnMiLCJvbkNvbmZpZ0NoYW5nZSIsImludGVyYWN0aW9uQ29uZmlnQ2hhbmdlIiwibWFwTWFuYWdlckFjdGlvbnMiLCJhZGRNYXBTdHlsZVVybCIsIm1hcENvbmZpZ0NoYW5nZSIsIm9uU3R5bGVDaGFuZ2UiLCJtYXBTdHlsZUNoYW5nZSIsIm9uQnVpbGRpbmdDaGFuZ2UiLCJtYXBCdWlsZGluZ0NoYW5nZSIsInNldDNkQnVpbGRpbmdDb2xvciIsInNob3dBZGRNYXBTdHlsZU1vZGFsIiwiX3Nob3dBZGRNYXBTdHlsZU1vZGFsIiwid2lkdGgiLCJfb25PcGVuT3JDbG9zZSIsInZpc2libGVEcm9wZG93biIsInNob3dFeHBvcnREcm9wZG93biIsImhpZGVFeHBvcnREcm9wZG93biIsIl9vbkNsaWNrRXhwb3J0SW1hZ2UiLCJfb25DbGlja0V4cG9ydERhdGEiLCJfb25DbGlja0V4cG9ydE1hcCIsIm9uU2F2ZU1hcCIsImhhc1N0b3JhZ2UiLCJfb25DbGlja1NhdmVUb1N0b3JhZ2UiLCJfb25DbGlja1NhdmVBc1RvU3RvcmFnZSIsImhhc1NoYXJlIiwiX29uQ2xpY2tTaGFyZU1hcCIsImZpbmQiLCJpZCIsImxhYmVsIiwiY29sb3JQYWxldHRlIiwibWFwU3R5bGUiLCJwIiwiUHVyZUNvbXBvbmVudCIsIlByb3BUeXBlcyIsImFycmF5T2YiLCJhbnkiLCJpc1JlcXVpcmVkIiwib2JqZWN0Iiwic3RyaW5nIiwibnVtYmVyIiwiU0lERUJBUl9QQU5FTFMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLElBQU1BLGdCQUFnQixHQUFHQyw2QkFBT0MsR0FBVixvQkFDbEIsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxrQkFBaEI7QUFBQSxDQURhLEVBR1QsVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxxQkFBaEI7QUFBQSxDQUhJLENBQXRCOztBQWNPLElBQU1DLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBb0I7QUFBQSxTQUFN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QUlqQnpFLElBQUFBLE1BQU0sRUFBRXNFLHNCQUFVQyxPQUFWLENBQWtCRCxzQkFBVUUsR0FBNUIsRUFBaUNDLFVBSnhCO0FBS2pCdkUsSUFBQUEsWUFBWSxFQUFFb0Usc0JBQVVJLE1BQVYsQ0FBaUJELFVBTGQ7QUFNakJOLElBQUFBLFFBQVEsRUFBRUcsc0JBQVVJLE1BQVYsQ0FBaUJELFVBTlY7QUFPakJ4QixJQUFBQSxLQUFLLEVBQUVxQixzQkFBVU0sTUFBVixDQUFpQkgsVUFQUDtBQVFqQjNFLElBQUFBLFFBQVEsRUFBRXdFLHNCQUFVSSxNQUFWLENBQWlCRCxVQVJWO0FBU2pCaEcsSUFBQUEsZUFBZSxFQUFFNkYsc0JBQVVJLE1BQVYsQ0FBaUJELFVBVGpCO0FBVWpCcEUsSUFBQUEsZUFBZSxFQUFFaUUsc0JBQVVJLE1BQVYsQ0FBaUJELFVBVmpCO0FBV2pCbkUsSUFBQUEsa0JBQWtCLEVBQUVnRSxzQkFBVUksTUFYYjtBQVlqQnRGLElBQUFBLFFBQVEsRUFBRWtGLHNCQUFVSyxNQVpIO0FBYWpCbEUsSUFBQUEsTUFBTSxFQUFFNkQsc0JBQVVDLE9BQVYsQ0FBa0JELHNCQUFVSSxNQUE1QjtBQWJTLEdBTHJCO0FBQUEsbUNBSU12RyxTQUpOLGtCQXFCd0I7QUFDcEJzQyxJQUFBQSxNQUFNLEVBQUVvRSwrQkFEWTtBQUVwQnZHLElBQUFBLE9BQU8sRUFBRSxFQUZXO0FBR3BCRyxJQUFBQSxlQUFlLEVBQUUsRUFIRztBQUlwQjRCLElBQUFBLGVBQWUsRUFBRSxFQUpHO0FBS3BCakMsSUFBQUEsY0FBYyxFQUFFLEVBTEk7QUFNcEJrQyxJQUFBQSxrQkFBa0IsRUFBRTtBQU5BLEdBckJ4QjtBQStOQSxTQUFPbkMsU0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7UHVyZUNvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcblxuaW1wb3J0IFNpZGViYXJGYWN0b3J5IGZyb20gJy4vc2lkZS1wYW5lbC9zaWRlLWJhcic7XG5pbXBvcnQgUGFuZWxIZWFkZXJGYWN0b3J5IGZyb20gJy4vc2lkZS1wYW5lbC9wYW5lbC1oZWFkZXInO1xuaW1wb3J0IExheWVyTWFuYWdlckZhY3RvcnkgZnJvbSAnLi9zaWRlLXBhbmVsL2xheWVyLW1hbmFnZXInO1xuaW1wb3J0IEZpbHRlck1hbmFnZXJGYWN0b3J5IGZyb20gJy4vc2lkZS1wYW5lbC9maWx0ZXItbWFuYWdlcic7XG5pbXBvcnQgSW50ZXJhY3Rpb25NYW5hZ2VyRmFjdG9yeSBmcm9tICcuL3NpZGUtcGFuZWwvaW50ZXJhY3Rpb24tbWFuYWdlcic7XG5pbXBvcnQgTWFwTWFuYWdlckZhY3RvcnkgZnJvbSAnLi9zaWRlLXBhbmVsL21hcC1tYW5hZ2VyJztcbmltcG9ydCBQYW5lbFRvZ2dsZUZhY3RvcnkgZnJvbSAnLi9zaWRlLXBhbmVsL3BhbmVsLXRvZ2dsZSc7XG5pbXBvcnQgQ3VzdG9tUGFuZWxzRmFjdG9yeSBmcm9tICcuL3NpZGUtcGFuZWwvY3VzdG9tLXBhbmVsJztcblxuaW1wb3J0IHtcbiAgQUREX0RBVEFfSUQsXG4gIEFERF9NQVBfU1RZTEVfSUQsXG4gIERBVEFfVEFCTEVfSUQsXG4gIEVYUE9SVF9EQVRBX0lELFxuICBFWFBPUlRfTUFQX0lELFxuICBTSEFSRV9NQVBfSUQsXG4gIFNJREVCQVJfUEFORUxTLFxuICBPVkVSV1JJVEVfTUFQX0lELFxuICBTQVZFX01BUF9JRCxcbiAgRVhQT1JUX0lNQUdFX0lEXG59IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuY29uc3QgU2lkZVBhbmVsQ29udGVudCA9IHN0eWxlZC5kaXZgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2lkZVBhbmVsU2Nyb2xsQmFyfTtcbiAgZmxleC1ncm93OiAxO1xuICBwYWRkaW5nOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNpZGVQYW5lbElubmVyUGFkZGluZ31weDtcbiAgb3ZlcmZsb3cteTogc2Nyb2xsO1xuICBvdmVyZmxvdy14OiBoaWRkZW47XG5cbiAgLnNpZGUtcGFuZWxfX2NvbnRlbnRfX2lubmVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgUGFuZWxUaXRsZUZhY3RvcnkgPSAoKSA9PiBzdHlsZWQuZGl2YFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aXRsZVRleHRDb2xvcn07XG4gIGZvbnQtc2l6ZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zaWRlUGFuZWxUaXRsZUZvbnRzaXplfTtcbiAgbGluZS1oZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2lkZVBhbmVsVGl0bGVMaW5lSGVpZ2h0fTtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgbGV0dGVyLXNwYWNpbmc6IDEuMjVweDtcbiAgbWFyZ2luLWJvdHRvbTogMTRweDtcbmA7XG5cblNpZGVQYW5lbEZhY3RvcnkuZGVwcyA9IFtcbiAgU2lkZWJhckZhY3RvcnksXG4gIFBhbmVsSGVhZGVyRmFjdG9yeSxcbiAgUGFuZWxUb2dnbGVGYWN0b3J5LFxuICBQYW5lbFRpdGxlRmFjdG9yeSxcbiAgTGF5ZXJNYW5hZ2VyRmFjdG9yeSxcbiAgRmlsdGVyTWFuYWdlckZhY3RvcnksXG4gIEludGVyYWN0aW9uTWFuYWdlckZhY3RvcnksXG4gIE1hcE1hbmFnZXJGYWN0b3J5LFxuICBDdXN0b21QYW5lbHNGYWN0b3J5XG5dO1xuXG4vKipcbiAqXG4gKiBWZXJ0aWNhbCBzaWRlYmFyIGNvbnRhaW5pbmcgaW5wdXQgY29tcG9uZW50cyBmb3IgdGhlIHJlbmRlcmluZyBsYXllcnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZVBhbmVsRmFjdG9yeShcbiAgU2lkZWJhcixcbiAgUGFuZWxIZWFkZXIsXG4gIFBhbmVsVG9nZ2xlLFxuICBQYW5lbFRpdGxlLFxuICBMYXllck1hbmFnZXIsXG4gIEZpbHRlck1hbmFnZXIsXG4gIEludGVyYWN0aW9uTWFuYWdlcixcbiAgTWFwTWFuYWdlcixcbiAgQ3VzdG9tUGFuZWxzXG4pIHtcbiAgY29uc3QgY3VzdG9tUGFuZWxzID0gZ2V0KEN1c3RvbVBhbmVscywgWydkZWZhdWx0UHJvcHMnLCAncGFuZWxzJ10pIHx8IFtdO1xuICBjb25zdCBnZXRDdXN0b21QYW5lbFByb3BzID0gZ2V0KEN1c3RvbVBhbmVscywgWydkZWZhdWx0UHJvcHMnLCAnZ2V0UHJvcHMnXSkgfHwgKCgpID0+ICh7fSkpO1xuXG4gIGNsYXNzIFNpZGVQYW5lbCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBmaWx0ZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuYW55KS5pc1JlcXVpcmVkLFxuICAgICAgaW50ZXJhY3Rpb25Db25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyQmxlbmRpbmc6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyQ2xhc3NlczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwU3R5bGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICBkYXRhc2V0czogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgdmlzU3RhdGVBY3Rpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBtYXBTdHlsZUFjdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGF2YWlsYWJsZVByb3ZpZGVyczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIG1hcFNhdmVkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgcGFuZWxzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KVxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgcGFuZWxzOiBTSURFQkFSX1BBTkVMUyxcbiAgICAgIHVpU3RhdGU6IHt9LFxuICAgICAgdmlzU3RhdGVBY3Rpb25zOiB7fSxcbiAgICAgIG1hcFN0eWxlQWN0aW9uczoge30sXG4gICAgICB1aVN0YXRlQWN0aW9uczoge30sXG4gICAgICBhdmFpbGFibGVQcm92aWRlcnM6IHt9XG4gICAgfTtcblxuICAgIC8qIGNvbXBvbmVudCBwcml2YXRlIGZ1bmN0aW9ucyAqL1xuICAgIF9vbk9wZW5PckNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVTaWRlUGFuZWwoXG4gICAgICAgIHRoaXMucHJvcHMudWlTdGF0ZS5hY3RpdmVTaWRlUGFuZWwgPyBudWxsIDogJ2xheWVyJ1xuICAgICAgKTtcbiAgICB9O1xuXG4gICAgX3Nob3dEYXRhc2V0VGFibGUgPSBkYXRhSWQgPT4ge1xuICAgICAgLy8gdGhpcyB3aWxsIG9wZW4gZGF0YSB0YWJsZSBtb2RhbFxuICAgICAgdGhpcy5wcm9wcy52aXNTdGF0ZUFjdGlvbnMuc2hvd0RhdGFzZXRUYWJsZShkYXRhSWQpO1xuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChEQVRBX1RBQkxFX0lEKTtcbiAgICB9O1xuXG4gICAgX3Nob3dBZGREYXRhTW9kYWwgPSAoKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLnVpU3RhdGVBY3Rpb25zLnRvZ2dsZU1vZGFsKEFERF9EQVRBX0lEKTtcbiAgICB9O1xuXG4gICAgX3Nob3dBZGRNYXBTdHlsZU1vZGFsID0gKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChBRERfTUFQX1NUWUxFX0lEKTtcbiAgICB9O1xuXG4gICAgX3JlbW92ZURhdGFzZXQgPSBrZXkgPT4ge1xuICAgICAgLy8gdGhpcyB3aWxsIHNob3cgdGhlIG1vZGFsIGRpYWxvZyB0byBjb25maXJtIGRlbGV0aW9uXG4gICAgICB0aGlzLnByb3BzLnVpU3RhdGVBY3Rpb25zLm9wZW5EZWxldGVNb2RhbChrZXkpO1xuICAgIH07XG5cbiAgICBfb25DbGlja0V4cG9ydEltYWdlID0gKCkgPT4gdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChFWFBPUlRfSU1BR0VfSUQpO1xuXG4gICAgX29uQ2xpY2tFeHBvcnREYXRhID0gKCkgPT4gdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChFWFBPUlRfREFUQV9JRCk7XG5cbiAgICBfb25DbGlja0V4cG9ydE1hcCA9ICgpID0+IHRoaXMucHJvcHMudWlTdGF0ZUFjdGlvbnMudG9nZ2xlTW9kYWwoRVhQT1JUX01BUF9JRCk7XG5cbiAgICBfb25DbGlja1NhdmVUb1N0b3JhZ2UgPSAoKSA9PlxuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbCh0aGlzLnByb3BzLm1hcFNhdmVkID8gT1ZFUldSSVRFX01BUF9JRCA6IFNBVkVfTUFQX0lEKTtcblxuICAgIF9vbkNsaWNrU2F2ZUFzVG9TdG9yYWdlID0gKCkgPT4ge1xuICAgICAgLy8gYWRkIChjb3B5KSB0byBmaWxlIG5hbWVcbiAgICAgIHRoaXMucHJvcHMudmlzU3RhdGVBY3Rpb25zLnNldE1hcEluZm8oe1xuICAgICAgICB0aXRsZTogYCR7dGhpcy5wcm9wcy5tYXBJbmZvLnRpdGxlIHx8ICdLZXBsZXIuZ2wnfSAoQ29weSlgXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChTQVZFX01BUF9JRCk7XG4gICAgfTtcblxuICAgIF9vbkNsaWNrU2hhcmVNYXAgPSAoKSA9PiB0aGlzLnByb3BzLnVpU3RhdGVBY3Rpb25zLnRvZ2dsZU1vZGFsKFNIQVJFX01BUF9JRCk7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYXBwTmFtZSxcbiAgICAgICAgYXBwV2Vic2l0ZSxcbiAgICAgICAgdmVyc2lvbixcbiAgICAgICAgZGF0YXNldHMsXG4gICAgICAgIGZpbHRlcnMsXG4gICAgICAgIGxheWVycyxcbiAgICAgICAgbGF5ZXJCbGVuZGluZyxcbiAgICAgICAgbGF5ZXJDbGFzc2VzLFxuICAgICAgICB1aVN0YXRlLFxuICAgICAgICBsYXllck9yZGVyLFxuICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgdmlzU3RhdGVBY3Rpb25zLFxuICAgICAgICBtYXBTdHlsZUFjdGlvbnMsXG4gICAgICAgIHVpU3RhdGVBY3Rpb25zLFxuICAgICAgICBhdmFpbGFibGVQcm92aWRlcnNcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBjb25zdCB7YWN0aXZlU2lkZVBhbmVsfSA9IHVpU3RhdGU7XG4gICAgICBjb25zdCBpc09wZW4gPSBCb29sZWFuKGFjdGl2ZVNpZGVQYW5lbCk7XG4gICAgICBjb25zdCBwYW5lbHMgPSBbLi4udGhpcy5wcm9wcy5wYW5lbHMsIC4uLmN1c3RvbVBhbmVsc107XG5cbiAgICAgIGNvbnN0IGxheWVyTWFuYWdlckFjdGlvbnMgPSB7XG4gICAgICAgIGFkZExheWVyOiB2aXNTdGF0ZUFjdGlvbnMuYWRkTGF5ZXIsXG4gICAgICAgIGxheWVyQ29uZmlnQ2hhbmdlOiB2aXNTdGF0ZUFjdGlvbnMubGF5ZXJDb25maWdDaGFuZ2UsXG4gICAgICAgIGxheWVyQ29sb3JVSUNoYW5nZTogdmlzU3RhdGVBY3Rpb25zLmxheWVyQ29sb3JVSUNoYW5nZSxcbiAgICAgICAgbGF5ZXJUZXh0TGFiZWxDaGFuZ2U6IHZpc1N0YXRlQWN0aW9ucy5sYXllclRleHRMYWJlbENoYW5nZSxcbiAgICAgICAgbGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlOiB2aXNTdGF0ZUFjdGlvbnMubGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlLFxuICAgICAgICBsYXllclR5cGVDaGFuZ2U6IHZpc1N0YXRlQWN0aW9ucy5sYXllclR5cGVDaGFuZ2UsXG4gICAgICAgIGxheWVyVmlzQ29uZmlnQ2hhbmdlOiB2aXNTdGF0ZUFjdGlvbnMubGF5ZXJWaXNDb25maWdDaGFuZ2UsXG4gICAgICAgIHVwZGF0ZUxheWVyQmxlbmRpbmc6IHZpc1N0YXRlQWN0aW9ucy51cGRhdGVMYXllckJsZW5kaW5nLFxuICAgICAgICB1cGRhdGVMYXllck9yZGVyOiB2aXNTdGF0ZUFjdGlvbnMucmVvcmRlckxheWVyLFxuICAgICAgICBzaG93RGF0YXNldFRhYmxlOiB0aGlzLl9zaG93RGF0YXNldFRhYmxlLFxuICAgICAgICBzaG93QWRkRGF0YU1vZGFsOiB0aGlzLl9zaG93QWRkRGF0YU1vZGFsLFxuICAgICAgICByZW1vdmVMYXllcjogdmlzU3RhdGVBY3Rpb25zLnJlbW92ZUxheWVyLFxuICAgICAgICByZW1vdmVEYXRhc2V0OiB0aGlzLl9yZW1vdmVEYXRhc2V0LFxuICAgICAgICBvcGVuTW9kYWw6IHVpU3RhdGVBY3Rpb25zLnRvZ2dsZU1vZGFsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBmaWx0ZXJNYW5hZ2VyQWN0aW9ucyA9IHtcbiAgICAgICAgYWRkRmlsdGVyOiB2aXNTdGF0ZUFjdGlvbnMuYWRkRmlsdGVyLFxuICAgICAgICByZW1vdmVGaWx0ZXI6IHZpc1N0YXRlQWN0aW9ucy5yZW1vdmVGaWx0ZXIsXG4gICAgICAgIHNldEZpbHRlcjogdmlzU3RhdGVBY3Rpb25zLnNldEZpbHRlcixcbiAgICAgICAgc2hvd0RhdGFzZXRUYWJsZTogdGhpcy5fc2hvd0RhdGFzZXRUYWJsZSxcbiAgICAgICAgc2hvd0FkZERhdGFNb2RhbDogdGhpcy5fc2hvd0FkZERhdGFNb2RhbCxcbiAgICAgICAgdG9nZ2xlQW5pbWF0aW9uOiB2aXNTdGF0ZUFjdGlvbnMudG9nZ2xlRmlsdGVyQW5pbWF0aW9uLFxuICAgICAgICBlbmxhcmdlRmlsdGVyOiB2aXNTdGF0ZUFjdGlvbnMuZW5sYXJnZUZpbHRlcixcbiAgICAgICAgdG9nZ2xlRmlsdGVyRmVhdHVyZTogdmlzU3RhdGVBY3Rpb25zLnRvZ2dsZUZpbHRlckZlYXR1cmVcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGludGVyYWN0aW9uTWFuYWdlckFjdGlvbnMgPSB7XG4gICAgICAgIG9uQ29uZmlnQ2hhbmdlOiB2aXNTdGF0ZUFjdGlvbnMuaW50ZXJhY3Rpb25Db25maWdDaGFuZ2VcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG1hcE1hbmFnZXJBY3Rpb25zID0ge1xuICAgICAgICBhZGRNYXBTdHlsZVVybDogbWFwU3R5bGVBY3Rpb25zLmFkZE1hcFN0eWxlVXJsLFxuICAgICAgICBvbkNvbmZpZ0NoYW5nZTogbWFwU3R5bGVBY3Rpb25zLm1hcENvbmZpZ0NoYW5nZSxcbiAgICAgICAgb25TdHlsZUNoYW5nZTogbWFwU3R5bGVBY3Rpb25zLm1hcFN0eWxlQ2hhbmdlLFxuICAgICAgICBvbkJ1aWxkaW5nQ2hhbmdlOiBtYXBTdHlsZUFjdGlvbnMubWFwQnVpbGRpbmdDaGFuZ2UsXG4gICAgICAgIHNldDNkQnVpbGRpbmdDb2xvcjogbWFwU3R5bGVBY3Rpb25zLnNldDNkQnVpbGRpbmdDb2xvcixcbiAgICAgICAgc2hvd0FkZE1hcFN0eWxlTW9kYWw6IHRoaXMuX3Nob3dBZGRNYXBTdHlsZU1vZGFsXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxTaWRlYmFyXG4gICAgICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH1cbiAgICAgICAgICAgIGlzT3Blbj17aXNPcGVufVxuICAgICAgICAgICAgbWluaWZpZWRXaWR0aD17MH1cbiAgICAgICAgICAgIG9uT3Blbk9yQ2xvc2U9e3RoaXMuX29uT3Blbk9yQ2xvc2V9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFBhbmVsSGVhZGVyXG4gICAgICAgICAgICAgIGFwcE5hbWU9e2FwcE5hbWV9XG4gICAgICAgICAgICAgIHZlcnNpb249e3ZlcnNpb259XG4gICAgICAgICAgICAgIGFwcFdlYnNpdGU9e2FwcFdlYnNpdGV9XG4gICAgICAgICAgICAgIHZpc2libGVEcm9wZG93bj17dWlTdGF0ZS52aXNpYmxlRHJvcGRvd259XG4gICAgICAgICAgICAgIHNob3dFeHBvcnREcm9wZG93bj17dWlTdGF0ZUFjdGlvbnMuc2hvd0V4cG9ydERyb3Bkb3dufVxuICAgICAgICAgICAgICBoaWRlRXhwb3J0RHJvcGRvd249e3VpU3RhdGVBY3Rpb25zLmhpZGVFeHBvcnREcm9wZG93bn1cbiAgICAgICAgICAgICAgb25FeHBvcnRJbWFnZT17dGhpcy5fb25DbGlja0V4cG9ydEltYWdlfVxuICAgICAgICAgICAgICBvbkV4cG9ydERhdGE9e3RoaXMuX29uQ2xpY2tFeHBvcnREYXRhfVxuICAgICAgICAgICAgICBvbkV4cG9ydE1hcD17dGhpcy5fb25DbGlja0V4cG9ydE1hcH1cbiAgICAgICAgICAgICAgb25TYXZlTWFwPXt0aGlzLnByb3BzLm9uU2F2ZU1hcH1cbiAgICAgICAgICAgICAgb25TYXZlVG9TdG9yYWdlPXthdmFpbGFibGVQcm92aWRlcnMuaGFzU3RvcmFnZSA/IHRoaXMuX29uQ2xpY2tTYXZlVG9TdG9yYWdlIDogbnVsbH1cbiAgICAgICAgICAgICAgb25TYXZlQXNUb1N0b3JhZ2U9e1xuICAgICAgICAgICAgICAgIGF2YWlsYWJsZVByb3ZpZGVycy5oYXNTdG9yYWdlICYmIHRoaXMucHJvcHMubWFwU2F2ZWRcbiAgICAgICAgICAgICAgICAgID8gdGhpcy5fb25DbGlja1NhdmVBc1RvU3RvcmFnZVxuICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgb25TaGFyZU1hcD17YXZhaWxhYmxlUHJvdmlkZXJzLmhhc1NoYXJlID8gdGhpcy5fb25DbGlja1NoYXJlTWFwIDogbnVsbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8UGFuZWxUb2dnbGVcbiAgICAgICAgICAgICAgcGFuZWxzPXtwYW5lbHN9XG4gICAgICAgICAgICAgIGFjdGl2ZVBhbmVsPXthY3RpdmVTaWRlUGFuZWx9XG4gICAgICAgICAgICAgIHRvZ2dsZVBhbmVsPXt1aVN0YXRlQWN0aW9ucy50b2dnbGVTaWRlUGFuZWx9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFNpZGVQYW5lbENvbnRlbnQgY2xhc3NOYW1lPVwic2lkZS1wYW5lbF9fY29udGVudFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNpZGUtcGFuZWxfX2NvbnRlbnRfX2lubmVyXCI+XG4gICAgICAgICAgICAgICAgPFBhbmVsVGl0bGUgY2xhc3NOYW1lPVwic2lkZS1wYW5lbF9fY29udGVudF9fdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIGlkPXsocGFuZWxzLmZpbmQoKHtpZH0pID0+IGlkID09PSBhY3RpdmVTaWRlUGFuZWwpIHx8IHt9KS5sYWJlbH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9QYW5lbFRpdGxlPlxuICAgICAgICAgICAgICAgIHthY3RpdmVTaWRlUGFuZWwgPT09ICdsYXllcicgJiYgKFxuICAgICAgICAgICAgICAgICAgPExheWVyTWFuYWdlclxuICAgICAgICAgICAgICAgICAgICB7Li4ubGF5ZXJNYW5hZ2VyQWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM9e2RhdGFzZXRzfVxuICAgICAgICAgICAgICAgICAgICBsYXllcnM9e2xheWVyc31cbiAgICAgICAgICAgICAgICAgICAgbGF5ZXJDbGFzc2VzPXtsYXllckNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgIGxheWVyT3JkZXI9e2xheWVyT3JkZXJ9XG4gICAgICAgICAgICAgICAgICAgIGxheWVyQmxlbmRpbmc9e2xheWVyQmxlbmRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yUGFsZXR0ZT17dWlTdGF0ZS5jb2xvclBhbGV0dGV9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAge2FjdGl2ZVNpZGVQYW5lbCA9PT0gJ2ZpbHRlcicgJiYgKFxuICAgICAgICAgICAgICAgICAgPEZpbHRlck1hbmFnZXJcbiAgICAgICAgICAgICAgICAgICAgey4uLmZpbHRlck1hbmFnZXJBY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0cz17ZGF0YXNldHN9XG4gICAgICAgICAgICAgICAgICAgIGxheWVycz17bGF5ZXJzfVxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzPXtmaWx0ZXJzfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHthY3RpdmVTaWRlUGFuZWwgPT09ICdpbnRlcmFjdGlvbicgJiYgKFxuICAgICAgICAgICAgICAgICAgPEludGVyYWN0aW9uTWFuYWdlclxuICAgICAgICAgICAgICAgICAgICB7Li4uaW50ZXJhY3Rpb25NYW5hZ2VyQWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM9e2RhdGFzZXRzfVxuICAgICAgICAgICAgICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZz17aW50ZXJhY3Rpb25Db25maWd9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAge2FjdGl2ZVNpZGVQYW5lbCA9PT0gJ21hcCcgJiYgKFxuICAgICAgICAgICAgICAgICAgPE1hcE1hbmFnZXIgey4uLm1hcE1hbmFnZXJBY3Rpb25zfSBtYXBTdHlsZT17dGhpcy5wcm9wcy5tYXBTdHlsZX0gLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHsoY3VzdG9tUGFuZWxzIHx8IFtdKS5maW5kKHAgPT4gcC5pZCA9PT0gYWN0aXZlU2lkZVBhbmVsKSA/IChcbiAgICAgICAgICAgICAgICAgIDxDdXN0b21QYW5lbHNcbiAgICAgICAgICAgICAgICAgICAgey4uLmdldEN1c3RvbVBhbmVsUHJvcHModGhpcy5wcm9wcyl9XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVNpZGVQYW5lbD17YWN0aXZlU2lkZVBhbmVsfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1NpZGVQYW5lbENvbnRlbnQ+XG4gICAgICAgICAgPC9TaWRlYmFyPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFNpZGVQYW5lbDtcbn1cbiJdfQ==