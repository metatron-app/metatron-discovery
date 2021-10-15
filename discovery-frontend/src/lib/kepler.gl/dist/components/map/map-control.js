"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.MapLegendPanel = void 0;

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

var _reselect = require("reselect");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _localization = require("../../localization");

var _classnames = _interopRequireDefault(require("classnames"));

var _styledComponents2 = require("../common/styled-components");

var _mapLayerSelector = _interopRequireDefault(require("../common/map-layer-selector"));

var _logo = _interopRequireDefault(require("../common/logo"));

var _mapLegend = _interopRequireDefault(require("./map-legend"));

var _icons = require("../common/icons");

var _verticalToolbar = _interopRequireDefault(require("../common/vertical-toolbar"));

var _toolbarItem = _interopRequireDefault(require("../common/toolbar-item"));

var _defaultSettings = require("../../constants/default-settings");

var _locales = require("../../localization/locales");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  right: 32px;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: space-between;\n  background-color: ", ";\n  height: 32px;\n  padding: 6px 12px;\n  font-size: 11px;\n  color: ", ";\n  position: relative;\n\n  button {\n    width: 18px;\n    height: 18px;\n  }\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n  max-height: 500px;\n  min-height: 100px;\n  min-width: ", "px;\n  overflow: auto;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  flex-grow: 1;\n  z-index: 1;\n  p {\n    margin-bottom: 0;\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding: 4px 0;\n  display: flex;\n  justify-content: flex-end;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  right: 0;\n  padding: ", "px;\n  z-index: 10;\n  margin-top: ", "px;\n  position: absolute;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledMapControl = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.mapControl.padding;
}, function (props) {
  return props.top || 0;
});

var StyledMapControlAction = _styledComponents["default"].div(_templateObject2());

var StyledMapControlPanel = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.mapPanelBackgroundColor;
});

var StyledMapControlPanelContent = _styledComponents["default"].div.attrs({
  className: 'map-control__panel-content'
})(_templateObject4(), function (props) {
  return props.theme.dropdownScrollBar;
}, function (props) {
  return props.theme.mapControl.width;
});

var StyledMapControlPanelHeader = _styledComponents["default"].div.attrs({
  className: 'map-control__panel-header'
})(_templateObject5(), function (props) {
  return props.theme.mapPanelHeaderBackgroundColor;
}, function (props) {
  return props.theme.titleTextColor;
});

var ActionPanel = function ActionPanel(_ref) {
  var className = _ref.className,
      children = _ref.children;
  return /*#__PURE__*/_react["default"].createElement(StyledMapControlAction, {
    className: className
  }, children);
};

ActionPanel.displayName = 'ActionPanel';

var MapControlTooltip = /*#__PURE__*/_react["default"].memo(function (_ref2) {
  var id = _ref2.id,
      message = _ref2.message;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
    id: id,
    place: "left",
    effect: "solid"
  }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: message
  })));
});

MapControlTooltip.displayName = 'MapControlTooltip';

var MapLegendTooltip = function MapLegendTooltip(_ref3) {
  var id = _ref3.id,
      message = _ref3.message;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
    id: id,
    place: "left",
    effect: "solid"
  }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: message
  })));
};

var LayerSelectorPanel = /*#__PURE__*/_react["default"].memo(function (_ref4) {
  var items = _ref4.items,
      onMapToggleLayer = _ref4.onMapToggleLayer,
      isActive = _ref4.isActive,
      toggleMenuPanel = _ref4.toggleMenuPanel;
  return !isActive ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    key: 1,
    onClick: function onClick(e) {
      e.preventDefault();
      toggleMenuPanel();
    },
    className: "map-control-button toggle-layer",
    "data-tip": true,
    "data-for": "toggle-layer"
  }, /*#__PURE__*/_react["default"].createElement(_icons.Layers, {
    height: "22px"
  }), /*#__PURE__*/_react["default"].createElement(MapControlTooltip, {
    id: "toggle-layer",
    message: isActive ? 'tooltip.hideLayerPanel' : 'tooltip.showLayerPanel'
  })) : /*#__PURE__*/_react["default"].createElement(MapControlPanel, {
    header: "header.visibleLayers",
    onClick: toggleMenuPanel
  }, /*#__PURE__*/_react["default"].createElement(_mapLayerSelector["default"], {
    layers: items,
    onMapToggleLayer: onMapToggleLayer
  }));
});

LayerSelectorPanel.displayName = 'LayerSelectorPanel';

var MapControlPanel = /*#__PURE__*/_react["default"].memo(function (_ref5) {
  var children = _ref5.children,
      header = _ref5.header,
      onClick = _ref5.onClick,
      _ref5$scale = _ref5.scale,
      scale = _ref5$scale === void 0 ? 1 : _ref5$scale,
      isExport = _ref5.isExport,
      _ref5$disableClose = _ref5.disableClose,
      disableClose = _ref5$disableClose === void 0 ? false : _ref5$disableClose,
      logoComponent = _ref5.logoComponent;
  return /*#__PURE__*/_react["default"].createElement(StyledMapControlPanel, {
    style: {
      transform: "scale(".concat(scale, ")"),
      marginBottom: '8px'
    }
  }, /*#__PURE__*/_react["default"].createElement(StyledMapControlPanelHeader, null, isExport && logoComponent ? logoComponent : header ? /*#__PURE__*/_react["default"].createElement("span", {
    style: {
      verticalAlign: 'middle'
    }
  }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: header
  })) : null, isExport ? null : /*#__PURE__*/_react["default"].createElement(_styledComponents2.IconRoundSmall, {
    className: "close-map-control-item",
    onClick: onClick
  }, /*#__PURE__*/_react["default"].createElement(_icons.Close, {
    height: "16px"
  }))), /*#__PURE__*/_react["default"].createElement(StyledMapControlPanelContent, null, children));
});

MapControlPanel.displayName = 'MapControlPanel';

var MapLegendPanel = function MapLegendPanel(_ref6) {
  var layers = _ref6.layers,
      isActive = _ref6.isActive,
      scale = _ref6.scale,
      onToggleMenuPanel = _ref6.onToggleMenuPanel,
      isExport = _ref6.isExport,
      disableClose = _ref6.disableClose,
      logoComponent = _ref6.logoComponent;
  return !isActive ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    key: 2,
    "data-tip": true,
    "data-for": "show-legend",
    className: "map-control-button show-legend",
    onClick: function onClick(e) {
      e.preventDefault();
      onToggleMenuPanel();
    }
  }, /*#__PURE__*/_react["default"].createElement(_icons.Legend, {
    height: "22px"
  }), /*#__PURE__*/_react["default"].createElement(MapLegendTooltip, {
    id: "show-legend",
    message: 'tooltip.showLegend'
  })) : /*#__PURE__*/_react["default"].createElement(MapControlPanel, {
    scale: scale,
    header: 'header.layerLegend',
    onClick: onToggleMenuPanel,
    isExport: isExport,
    disableClose: disableClose,
    logoComponent: logoComponent
  }, /*#__PURE__*/_react["default"].createElement(_mapLegend["default"], {
    layers: layers
  }));
};

exports.MapLegendPanel = MapLegendPanel;
MapLegendPanel.displayName = 'MapControlPanel';

var SplitMapButton = /*#__PURE__*/_react["default"].memo(function (_ref7) {
  var isSplit = _ref7.isSplit,
      mapIndex = _ref7.mapIndex,
      onToggleSplitMap = _ref7.onToggleSplitMap;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    active: isSplit,
    onClick: function onClick(e) {
      e.preventDefault();
      onToggleSplitMap(isSplit ? mapIndex : undefined);
    },
    key: "split-".concat(isSplit),
    className: (0, _classnames["default"])('map-control-button', 'split-map', {
      'close-map': isSplit
    }),
    "data-tip": true,
    "data-for": "action-toggle"
  }, isSplit ? /*#__PURE__*/_react["default"].createElement(_icons.Delete, {
    height: "18px"
  }) : /*#__PURE__*/_react["default"].createElement(_icons.Split, {
    height: "18px"
  }), /*#__PURE__*/_react["default"].createElement(MapControlTooltip, {
    id: "action-toggle",
    message: isSplit ? 'tooltip.closePanel' : 'tooltip.switchToDualView'
  }));
});

SplitMapButton.displayName = 'SplitMapButton';

var Toggle3dButton = /*#__PURE__*/_react["default"].memo(function (_ref8) {
  var dragRotate = _ref8.dragRotate,
      onTogglePerspective = _ref8.onTogglePerspective;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    onClick: function onClick(e) {
      e.preventDefault();
      onTogglePerspective();
    },
    active: dragRotate,
    "data-tip": true,
    "data-for": "action-3d"
  }, /*#__PURE__*/_react["default"].createElement(_icons.Cube3d, {
    height: "22px"
  }), /*#__PURE__*/_react["default"].createElement(MapControlTooltip, {
    id: "action-3d",
    message: dragRotate ? 'tooltip.disable3DMap' : 'tooltip.3DMap'
  }));
});

Toggle3dButton.displayName = 'Toggle3dButton';
var StyledToolbar = (0, _styledComponents["default"])(_verticalToolbar["default"])(_templateObject6());

var MapDrawPanel = /*#__PURE__*/_react["default"].memo(function (_ref9) {
  var editor = _ref9.editor,
      isActive = _ref9.isActive,
      onToggleMenuPanel = _ref9.onToggleMenuPanel,
      onSetEditorMode = _ref9.onSetEditorMode,
      onToggleEditorVisibility = _ref9.onToggleEditorVisibility;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "map-draw-controls",
    style: {
      position: 'relative'
    }
  }, isActive ? /*#__PURE__*/_react["default"].createElement(StyledToolbar, {
    show: isActive
  }, /*#__PURE__*/_react["default"].createElement(_toolbarItem["default"], {
    className: "edit-feature",
    onClick: function onClick() {
      return onSetEditorMode(_defaultSettings.EDITOR_MODES.EDIT);
    },
    label: "toolbar.select",
    iconHeight: "22px",
    icon: _icons.CursorClick,
    active: editor.mode === _defaultSettings.EDITOR_MODES.EDIT
  }), /*#__PURE__*/_react["default"].createElement(_toolbarItem["default"], {
    className: "draw-feature",
    onClick: function onClick() {
      return onSetEditorMode(_defaultSettings.EDITOR_MODES.DRAW_POLYGON);
    },
    label: "toolbar.polygon",
    iconHeight: "22px",
    icon: _icons.Polygon,
    active: editor.mode === _defaultSettings.EDITOR_MODES.DRAW_POLYGON
  }), /*#__PURE__*/_react["default"].createElement(_toolbarItem["default"], {
    className: "draw-rectangle",
    onClick: function onClick() {
      return onSetEditorMode(_defaultSettings.EDITOR_MODES.DRAW_RECTANGLE);
    },
    label: "toolbar.rectangle",
    iconHeight: "22px",
    icon: _icons.Rectangle,
    active: editor.mode === _defaultSettings.EDITOR_MODES.DRAW_RECTANGLE
  }), /*#__PURE__*/_react["default"].createElement(_toolbarItem["default"], {
    className: "toggle-features",
    onClick: onToggleEditorVisibility,
    label: editor.visible ? 'toolbar.hide' : 'toolbar.show',
    iconHeight: "22px",
    icon: editor.visible ? _icons.EyeSeen : _icons.EyeUnseen
  })) : null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    onClick: function onClick(e) {
      e.preventDefault();
      onToggleMenuPanel();
    },
    active: isActive,
    "data-tip": true,
    "data-for": "map-draw"
  }, /*#__PURE__*/_react["default"].createElement(_icons.DrawPolygon, {
    height: "22px"
  }), /*#__PURE__*/_react["default"].createElement(MapControlTooltip, {
    id: "map-draw",
    message: "tooltip.DrawOnMap"
  })));
});

MapDrawPanel.displayName = 'MapDrawPanel';

var LocalePanel = /*#__PURE__*/_react["default"].memo(function (_ref10) {
  var availableLocales = _ref10.availableLocales,
      isActive = _ref10.isActive,
      onToggleMenuPanel = _ref10.onToggleMenuPanel,
      onSetLocale = _ref10.onSetLocale,
      activeLocale = _ref10.activeLocale;
  var onClickItem = (0, _react.useCallback)(function (locale) {
    onSetLocale(locale);
  }, [onSetLocale]);
  var onClickButton = (0, _react.useCallback)(function (e) {
    e.preventDefault();
    onToggleMenuPanel();
  }, [onToggleMenuPanel]);
  var getLabel = (0, _react.useCallback)(function (locale) {
    return "toolbar.".concat(locale);
  }, []);
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      position: 'relative'
    }
  }, isActive ? /*#__PURE__*/_react["default"].createElement(StyledToolbar, {
    show: isActive
  }, availableLocales.map(function (locale) {
    return /*#__PURE__*/_react["default"].createElement(_toolbarItem["default"], {
      key: locale,
      onClick: function onClick() {
        return onClickItem(locale);
      },
      label: getLabel(locale),
      active: activeLocale === locale
    });
  })) : null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.MapControlButton, {
    onClick: onClickButton,
    active: isActive,
    "data-tip": true,
    "data-for": "locale"
  }, activeLocale.toUpperCase(), /*#__PURE__*/_react["default"].createElement(MapControlTooltip, {
    id: "locale",
    message: "tooltip.selectLocale"
  })));
});

LocalePanel.displayName = 'LocalePanel';

var LegendLogo = /*#__PURE__*/_react["default"].createElement(_logo["default"], {
  version: false,
  appName: "kepler.gl"
});

var MapControlFactory = function MapControlFactory() {
  var MapControl = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(MapControl, _Component);

    var _super = _createSuper(MapControl);

    function MapControl() {
      var _this;

      (0, _classCallCheck2["default"])(this, MapControl);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerSelector", function (props) {
        return props.layers;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layersToRenderSelector", function (props) {
        return props.layersToRender;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerPanelItemsSelector", (0, _reselect.createSelector)(_this.layerSelector, _this.layersToRenderSelector, function (layers, layersToRender) {
        return layers.filter(function (l) {
          return l.config.isVisible;
        }).map(function (layer) {
          return {
            id: layer.id,
            name: layer.config.label,
            // layer
            isVisible: layersToRender[layer.id]
          };
        });
      }));
      return _this;
    }

    (0, _createClass2["default"])(MapControl, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            dragRotate = _this$props.dragRotate,
            layers = _this$props.layers,
            layersToRender = _this$props.layersToRender,
            isSplit = _this$props.isSplit,
            isExport = _this$props.isExport,
            mapIndex = _this$props.mapIndex,
            mapControls = _this$props.mapControls,
            onTogglePerspective = _this$props.onTogglePerspective,
            onToggleSplitMap = _this$props.onToggleSplitMap,
            onMapToggleLayer = _this$props.onMapToggleLayer,
            onToggleMapControl = _this$props.onToggleMapControl,
            editor = _this$props.editor,
            scale = _this$props.scale,
            readOnly = _this$props.readOnly,
            locale = _this$props.locale,
            top = _this$props.top,
            logoComponent = _this$props.logoComponent;
        var _mapControls$visibleL = mapControls.visibleLayers,
            visibleLayers = _mapControls$visibleL === void 0 ? {} : _mapControls$visibleL,
            _mapControls$mapLegen = mapControls.mapLegend,
            mapLegend = _mapControls$mapLegen === void 0 ? {} : _mapControls$mapLegen,
            _mapControls$toggle3d = mapControls.toggle3d,
            toggle3d = _mapControls$toggle3d === void 0 ? {} : _mapControls$toggle3d,
            _mapControls$splitMap = mapControls.splitMap,
            splitMap = _mapControls$splitMap === void 0 ? {} : _mapControls$splitMap,
            _mapControls$mapDraw = mapControls.mapDraw,
            mapDraw = _mapControls$mapDraw === void 0 ? {} : _mapControls$mapDraw,
            _mapControls$mapLocal = mapControls.mapLocale,
            mapLocale = _mapControls$mapLocal === void 0 ? {} : _mapControls$mapLocal;
        return /*#__PURE__*/_react["default"].createElement(StyledMapControl, {
          className: "map-control",
          top: top
        }, splitMap.show && readOnly !== true ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          className: "split-map",
          key: 0
        }, /*#__PURE__*/_react["default"].createElement(SplitMapButton, {
          isSplit: isSplit,
          mapIndex: mapIndex,
          onToggleSplitMap: onToggleSplitMap
        })) : null, isSplit && visibleLayers.show && readOnly !== true ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          className: "map-layers",
          key: 1
        }, /*#__PURE__*/_react["default"].createElement(LayerSelectorPanel, {
          items: this.layerPanelItemsSelector(this.props),
          onMapToggleLayer: onMapToggleLayer,
          isActive: visibleLayers.active,
          toggleMenuPanel: function toggleMenuPanel() {
            return onToggleMapControl('visibleLayers');
          }
        })) : null, toggle3d.show ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          className: "toggle-3d",
          key: 2
        }, /*#__PURE__*/_react["default"].createElement(Toggle3dButton, {
          dragRotate: dragRotate,
          onTogglePerspective: onTogglePerspective
        })) : null, mapLegend.show ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          className: "show-legend",
          key: 3
        }, /*#__PURE__*/_react["default"].createElement(MapLegendPanel, {
          layers: layers.filter(function (l) {
            return layersToRender[l.id];
          }),
          scale: scale,
          isExport: isExport,
          onMapToggleLayer: onMapToggleLayer,
          isActive: mapLegend.active,
          onToggleMenuPanel: function onToggleMenuPanel() {
            return onToggleMapControl('mapLegend');
          },
          disableClose: mapLegend.disableClose,
          logoComponent: logoComponent
        })) : null, mapDraw.show ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          key: 4
        }, /*#__PURE__*/_react["default"].createElement(MapDrawPanel, {
          isActive: mapDraw.active && mapDraw.activeMapIndex === mapIndex,
          editor: editor,
          onToggleMenuPanel: function onToggleMenuPanel() {
            return onToggleMapControl('mapDraw');
          },
          onSetEditorMode: this.props.onSetEditorMode,
          onToggleEditorVisibility: this.props.onToggleEditorVisibility
        })) : null, mapLocale.show ? /*#__PURE__*/_react["default"].createElement(ActionPanel, {
          key: 5
        }, /*#__PURE__*/_react["default"].createElement(LocalePanel, {
          isActive: mapLocale.active,
          activeLocale: locale,
          availableLocales: Object.keys(_locales.LOCALE_CODES),
          onSetLocale: this.props.onSetLocale,
          onToggleMenuPanel: function onToggleMenuPanel() {
            return onToggleMapControl('mapLocale');
          }
        })) : null);
      }
    }]);
    return MapControl;
  }(_react.Component);

  (0, _defineProperty2["default"])(MapControl, "propTypes", {
    datasets: _propTypes["default"].object.isRequired,
    dragRotate: _propTypes["default"].bool.isRequired,
    isSplit: _propTypes["default"].bool.isRequired,
    layers: _propTypes["default"].arrayOf(_propTypes["default"].object),
    layersToRender: _propTypes["default"].object.isRequired,
    mapIndex: _propTypes["default"].number.isRequired,
    mapControls: _propTypes["default"].object.isRequired,
    onTogglePerspective: _propTypes["default"].func.isRequired,
    onToggleSplitMap: _propTypes["default"].func.isRequired,
    onToggleMapControl: _propTypes["default"].func.isRequired,
    onSetEditorMode: _propTypes["default"].func.isRequired,
    onToggleEditorVisibility: _propTypes["default"].func.isRequired,
    top: _propTypes["default"].number.isRequired,
    onSetLocale: _propTypes["default"].func.isRequired,
    locale: _propTypes["default"].string.isRequired,
    logoComponent: _propTypes["default"].oneOfType([_propTypes["default"].element, _propTypes["default"].func]),
    // optional
    readOnly: _propTypes["default"].bool,
    scale: _propTypes["default"].number,
    mapLayers: _propTypes["default"].object,
    editor: _propTypes["default"].object
  });
  (0, _defineProperty2["default"])(MapControl, "defaultProps", {
    isSplit: false,
    top: 0,
    mapIndex: 0,
    logoComponent: LegendLogo
  });
  MapControl.displayName = 'MapControl';
  return MapControl;
};

var _default = MapControlFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21hcC9tYXAtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJTdHlsZWRNYXBDb250cm9sIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJ0aGVtZSIsIm1hcENvbnRyb2wiLCJwYWRkaW5nIiwidG9wIiwiU3R5bGVkTWFwQ29udHJvbEFjdGlvbiIsIlN0eWxlZE1hcENvbnRyb2xQYW5lbCIsIm1hcFBhbmVsQmFja2dyb3VuZENvbG9yIiwiU3R5bGVkTWFwQ29udHJvbFBhbmVsQ29udGVudCIsImF0dHJzIiwiY2xhc3NOYW1lIiwiZHJvcGRvd25TY3JvbGxCYXIiLCJ3aWR0aCIsIlN0eWxlZE1hcENvbnRyb2xQYW5lbEhlYWRlciIsIm1hcFBhbmVsSGVhZGVyQmFja2dyb3VuZENvbG9yIiwidGl0bGVUZXh0Q29sb3IiLCJBY3Rpb25QYW5lbCIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiLCJNYXBDb250cm9sVG9vbHRpcCIsIlJlYWN0IiwibWVtbyIsImlkIiwibWVzc2FnZSIsIk1hcExlZ2VuZFRvb2x0aXAiLCJMYXllclNlbGVjdG9yUGFuZWwiLCJpdGVtcyIsIm9uTWFwVG9nZ2xlTGF5ZXIiLCJpc0FjdGl2ZSIsInRvZ2dsZU1lbnVQYW5lbCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsIk1hcENvbnRyb2xQYW5lbCIsImhlYWRlciIsIm9uQ2xpY2siLCJzY2FsZSIsImlzRXhwb3J0IiwiZGlzYWJsZUNsb3NlIiwibG9nb0NvbXBvbmVudCIsInRyYW5zZm9ybSIsIm1hcmdpbkJvdHRvbSIsInZlcnRpY2FsQWxpZ24iLCJNYXBMZWdlbmRQYW5lbCIsImxheWVycyIsIm9uVG9nZ2xlTWVudVBhbmVsIiwiU3BsaXRNYXBCdXR0b24iLCJpc1NwbGl0IiwibWFwSW5kZXgiLCJvblRvZ2dsZVNwbGl0TWFwIiwidW5kZWZpbmVkIiwiVG9nZ2xlM2RCdXR0b24iLCJkcmFnUm90YXRlIiwib25Ub2dnbGVQZXJzcGVjdGl2ZSIsIlN0eWxlZFRvb2xiYXIiLCJWZXJ0aWNhbFRvb2xiYXIiLCJNYXBEcmF3UGFuZWwiLCJlZGl0b3IiLCJvblNldEVkaXRvck1vZGUiLCJvblRvZ2dsZUVkaXRvclZpc2liaWxpdHkiLCJwb3NpdGlvbiIsIkVESVRPUl9NT0RFUyIsIkVESVQiLCJDdXJzb3JDbGljayIsIm1vZGUiLCJEUkFXX1BPTFlHT04iLCJQb2x5Z29uIiwiRFJBV19SRUNUQU5HTEUiLCJSZWN0YW5nbGUiLCJ2aXNpYmxlIiwiRXllU2VlbiIsIkV5ZVVuc2VlbiIsIkxvY2FsZVBhbmVsIiwiYXZhaWxhYmxlTG9jYWxlcyIsIm9uU2V0TG9jYWxlIiwiYWN0aXZlTG9jYWxlIiwib25DbGlja0l0ZW0iLCJsb2NhbGUiLCJvbkNsaWNrQnV0dG9uIiwiZ2V0TGFiZWwiLCJtYXAiLCJ0b1VwcGVyQ2FzZSIsIkxlZ2VuZExvZ28iLCJNYXBDb250cm9sRmFjdG9yeSIsIk1hcENvbnRyb2wiLCJsYXllcnNUb1JlbmRlciIsImxheWVyU2VsZWN0b3IiLCJsYXllcnNUb1JlbmRlclNlbGVjdG9yIiwiZmlsdGVyIiwibCIsImNvbmZpZyIsImlzVmlzaWJsZSIsImxheWVyIiwibmFtZSIsImxhYmVsIiwibWFwQ29udHJvbHMiLCJvblRvZ2dsZU1hcENvbnRyb2wiLCJyZWFkT25seSIsInZpc2libGVMYXllcnMiLCJtYXBMZWdlbmQiLCJ0b2dnbGUzZCIsInNwbGl0TWFwIiwibWFwRHJhdyIsIm1hcExvY2FsZSIsInNob3ciLCJsYXllclBhbmVsSXRlbXNTZWxlY3RvciIsImFjdGl2ZSIsImFjdGl2ZU1hcEluZGV4IiwiT2JqZWN0Iiwia2V5cyIsIkxPQ0FMRV9DT0RFUyIsIkNvbXBvbmVudCIsImRhdGFzZXRzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImJvb2wiLCJhcnJheU9mIiwibnVtYmVyIiwiZnVuYyIsInN0cmluZyIsIm9uZU9mVHlwZSIsImVsZW1lbnQiLCJtYXBMYXllcnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7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dXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudCwgdXNlQ2FsbGJhY2t9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQge0ljb25Sb3VuZFNtYWxsLCBNYXBDb250cm9sQnV0dG9uLCBUb29sdGlwfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgTWFwTGF5ZXJTZWxlY3RvciBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9tYXAtbGF5ZXItc2VsZWN0b3InO1xuaW1wb3J0IEtlcGxlckdsTG9nbyBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9sb2dvJztcbmltcG9ydCBNYXBMZWdlbmQgZnJvbSAnLi9tYXAtbGVnZW5kJztcbmltcG9ydCB7XG4gIENsb3NlLFxuICBDdWJlM2QsXG4gIEN1cnNvckNsaWNrLFxuICBEZWxldGUsXG4gIERyYXdQb2x5Z29uLFxuICBFeWVTZWVuLFxuICBFeWVVbnNlZW4sXG4gIExheWVycyxcbiAgTGVnZW5kLFxuICBQb2x5Z29uLFxuICBSZWN0YW5nbGUsXG4gIFNwbGl0XG59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBWZXJ0aWNhbFRvb2xiYXIgZnJvbSAnY29tcG9uZW50cy9jb21tb24vdmVydGljYWwtdG9vbGJhcic7XG5pbXBvcnQgVG9vbGJhckl0ZW0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vdG9vbGJhci1pdGVtJztcbmltcG9ydCB7RURJVE9SX01PREVTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge0xPQ0FMRV9DT0RFU30gZnJvbSAnbG9jYWxpemF0aW9uL2xvY2FsZXMnO1xuXG5jb25zdCBTdHlsZWRNYXBDb250cm9sID0gc3R5bGVkLmRpdmBcbiAgcmlnaHQ6IDA7XG4gIHBhZGRpbmc6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubWFwQ29udHJvbC5wYWRkaW5nfXB4O1xuICB6LWluZGV4OiAxMDtcbiAgbWFyZ2luLXRvcDogJHtwcm9wcyA9PiBwcm9wcy50b3AgfHwgMH1weDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuYDtcblxuY29uc3QgU3R5bGVkTWFwQ29udHJvbEFjdGlvbiA9IHN0eWxlZC5kaXZgXG4gIHBhZGRpbmc6IDRweCAwO1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuYDtcblxuY29uc3QgU3R5bGVkTWFwQ29udHJvbFBhbmVsID0gc3R5bGVkLmRpdmBcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5tYXBQYW5lbEJhY2tncm91bmRDb2xvcn07XG4gIGZsZXgtZ3JvdzogMTtcbiAgei1pbmRleDogMTtcbiAgcCB7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkTWFwQ29udHJvbFBhbmVsQ29udGVudCA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdtYXAtY29udHJvbF9fcGFuZWwtY29udGVudCdcbn0pYFxuICAke3Byb3BzID0+IHByb3BzLnRoZW1lLmRyb3Bkb3duU2Nyb2xsQmFyfTtcbiAgbWF4LWhlaWdodDogNTAwcHg7XG4gIG1pbi1oZWlnaHQ6IDEwMHB4O1xuICBtaW4td2lkdGg6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubWFwQ29udHJvbC53aWR0aH1weDtcbiAgb3ZlcmZsb3c6IGF1dG87XG5gO1xuXG5jb25zdCBTdHlsZWRNYXBDb250cm9sUGFuZWxIZWFkZXIgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbWFwLWNvbnRyb2xfX3BhbmVsLWhlYWRlcidcbn0pYFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubWFwUGFuZWxIZWFkZXJCYWNrZ3JvdW5kQ29sb3J9O1xuICBoZWlnaHQ6IDMycHg7XG4gIHBhZGRpbmc6IDZweCAxMnB4O1xuICBmb250LXNpemU6IDExcHg7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRpdGxlVGV4dENvbG9yfTtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuXG4gIGJ1dHRvbiB7XG4gICAgd2lkdGg6IDE4cHg7XG4gICAgaGVpZ2h0OiAxOHB4O1xuICB9XG5gO1xuXG5jb25zdCBBY3Rpb25QYW5lbCA9ICh7Y2xhc3NOYW1lLCBjaGlsZHJlbn0pID0+IChcbiAgPFN0eWxlZE1hcENvbnRyb2xBY3Rpb24gY2xhc3NOYW1lPXtjbGFzc05hbWV9PntjaGlsZHJlbn08L1N0eWxlZE1hcENvbnRyb2xBY3Rpb24+XG4pO1xuXG5BY3Rpb25QYW5lbC5kaXNwbGF5TmFtZSA9ICdBY3Rpb25QYW5lbCc7XG5cbmNvbnN0IE1hcENvbnRyb2xUb29sdGlwID0gUmVhY3QubWVtbygoe2lkLCBtZXNzYWdlfSkgPT4gKFxuICA8VG9vbHRpcCBpZD17aWR9IHBsYWNlPVwibGVmdFwiIGVmZmVjdD1cInNvbGlkXCI+XG4gICAgPHNwYW4+XG4gICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17bWVzc2FnZX0gLz5cbiAgICA8L3NwYW4+XG4gIDwvVG9vbHRpcD5cbikpO1xuXG5NYXBDb250cm9sVG9vbHRpcC5kaXNwbGF5TmFtZSA9ICdNYXBDb250cm9sVG9vbHRpcCc7XG5cbmNvbnN0IE1hcExlZ2VuZFRvb2x0aXAgPSAoe2lkLCBtZXNzYWdlfSkgPT4gKFxuICA8VG9vbHRpcCBpZD17aWR9IHBsYWNlPVwibGVmdFwiIGVmZmVjdD1cInNvbGlkXCI+XG4gICAgPHNwYW4+XG4gICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17bWVzc2FnZX0gLz5cbiAgICA8L3NwYW4+XG4gIDwvVG9vbHRpcD5cbik7XG5cbmNvbnN0IExheWVyU2VsZWN0b3JQYW5lbCA9IFJlYWN0Lm1lbW8oKHtpdGVtcywgb25NYXBUb2dnbGVMYXllciwgaXNBY3RpdmUsIHRvZ2dsZU1lbnVQYW5lbH0pID0+XG4gICFpc0FjdGl2ZSA/IChcbiAgICA8TWFwQ29udHJvbEJ1dHRvblxuICAgICAga2V5PXsxfVxuICAgICAgb25DbGljaz17ZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdG9nZ2xlTWVudVBhbmVsKCk7XG4gICAgICB9fVxuICAgICAgY2xhc3NOYW1lPVwibWFwLWNvbnRyb2wtYnV0dG9uIHRvZ2dsZS1sYXllclwiXG4gICAgICBkYXRhLXRpcFxuICAgICAgZGF0YS1mb3I9XCJ0b2dnbGUtbGF5ZXJcIlxuICAgID5cbiAgICAgIDxMYXllcnMgaGVpZ2h0PVwiMjJweFwiIC8+XG4gICAgICA8TWFwQ29udHJvbFRvb2x0aXBcbiAgICAgICAgaWQ9XCJ0b2dnbGUtbGF5ZXJcIlxuICAgICAgICBtZXNzYWdlPXtpc0FjdGl2ZSA/ICd0b29sdGlwLmhpZGVMYXllclBhbmVsJyA6ICd0b29sdGlwLnNob3dMYXllclBhbmVsJ31cbiAgICAgIC8+XG4gICAgPC9NYXBDb250cm9sQnV0dG9uPlxuICApIDogKFxuICAgIDxNYXBDb250cm9sUGFuZWwgaGVhZGVyPVwiaGVhZGVyLnZpc2libGVMYXllcnNcIiBvbkNsaWNrPXt0b2dnbGVNZW51UGFuZWx9PlxuICAgICAgPE1hcExheWVyU2VsZWN0b3IgbGF5ZXJzPXtpdGVtc30gb25NYXBUb2dnbGVMYXllcj17b25NYXBUb2dnbGVMYXllcn0gLz5cbiAgICA8L01hcENvbnRyb2xQYW5lbD5cbiAgKVxuKTtcblxuTGF5ZXJTZWxlY3RvclBhbmVsLmRpc3BsYXlOYW1lID0gJ0xheWVyU2VsZWN0b3JQYW5lbCc7XG5cbmNvbnN0IE1hcENvbnRyb2xQYW5lbCA9IFJlYWN0Lm1lbW8oXG4gICh7Y2hpbGRyZW4sIGhlYWRlciwgb25DbGljaywgc2NhbGUgPSAxLCBpc0V4cG9ydCwgZGlzYWJsZUNsb3NlID0gZmFsc2UsIGxvZ29Db21wb25lbnR9KSA9PiAoXG4gICAgPFN0eWxlZE1hcENvbnRyb2xQYW5lbFxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoJHtzY2FsZX0pYCxcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnOHB4J1xuICAgICAgfX1cbiAgICA+XG4gICAgICA8U3R5bGVkTWFwQ29udHJvbFBhbmVsSGVhZGVyPlxuICAgICAgICB7aXNFeHBvcnQgJiYgbG9nb0NvbXBvbmVudCA/IChcbiAgICAgICAgICBsb2dvQ29tcG9uZW50XG4gICAgICAgICkgOiBoZWFkZXIgPyAoXG4gICAgICAgICAgPHNwYW4gc3R5bGU9e3t2ZXJ0aWNhbEFsaWduOiAnbWlkZGxlJ319PlxuICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9e2hlYWRlcn0gLz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7aXNFeHBvcnQgPyBudWxsIDogKFxuICAgICAgICAgIDxJY29uUm91bmRTbWFsbCBjbGFzc05hbWU9XCJjbG9zZS1tYXAtY29udHJvbC1pdGVtXCIgb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICA8Q2xvc2UgaGVpZ2h0PVwiMTZweFwiIC8+XG4gICAgICAgICAgPC9JY29uUm91bmRTbWFsbD5cbiAgICAgICAgKX1cbiAgICAgIDwvU3R5bGVkTWFwQ29udHJvbFBhbmVsSGVhZGVyPlxuICAgICAgPFN0eWxlZE1hcENvbnRyb2xQYW5lbENvbnRlbnQ+e2NoaWxkcmVufTwvU3R5bGVkTWFwQ29udHJvbFBhbmVsQ29udGVudD5cbiAgICA8L1N0eWxlZE1hcENvbnRyb2xQYW5lbD5cbiAgKVxuKTtcblxuTWFwQ29udHJvbFBhbmVsLmRpc3BsYXlOYW1lID0gJ01hcENvbnRyb2xQYW5lbCc7XG5cbmV4cG9ydCBjb25zdCBNYXBMZWdlbmRQYW5lbCA9ICh7XG4gIGxheWVycyxcbiAgaXNBY3RpdmUsXG4gIHNjYWxlLFxuICBvblRvZ2dsZU1lbnVQYW5lbCxcbiAgaXNFeHBvcnQsXG4gIGRpc2FibGVDbG9zZSxcbiAgbG9nb0NvbXBvbmVudFxufSkgPT5cbiAgIWlzQWN0aXZlID8gKFxuICAgIDxNYXBDb250cm9sQnV0dG9uXG4gICAgICBrZXk9ezJ9XG4gICAgICBkYXRhLXRpcFxuICAgICAgZGF0YS1mb3I9XCJzaG93LWxlZ2VuZFwiXG4gICAgICBjbGFzc05hbWU9XCJtYXAtY29udHJvbC1idXR0b24gc2hvdy1sZWdlbmRcIlxuICAgICAgb25DbGljaz17ZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub2dnbGVNZW51UGFuZWwoKTtcbiAgICAgIH19XG4gICAgPlxuICAgICAgPExlZ2VuZCBoZWlnaHQ9XCIyMnB4XCIgLz5cbiAgICAgIDxNYXBMZWdlbmRUb29sdGlwIGlkPVwic2hvdy1sZWdlbmRcIiBtZXNzYWdlPXsndG9vbHRpcC5zaG93TGVnZW5kJ30gLz5cbiAgICA8L01hcENvbnRyb2xCdXR0b24+XG4gICkgOiAoXG4gICAgPE1hcENvbnRyb2xQYW5lbFxuICAgICAgc2NhbGU9e3NjYWxlfVxuICAgICAgaGVhZGVyPXsnaGVhZGVyLmxheWVyTGVnZW5kJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTWVudVBhbmVsfVxuICAgICAgaXNFeHBvcnQ9e2lzRXhwb3J0fVxuICAgICAgZGlzYWJsZUNsb3NlPXtkaXNhYmxlQ2xvc2V9XG4gICAgICBsb2dvQ29tcG9uZW50PXtsb2dvQ29tcG9uZW50fVxuICAgID5cbiAgICAgIDxNYXBMZWdlbmQgbGF5ZXJzPXtsYXllcnN9IC8+XG4gICAgPC9NYXBDb250cm9sUGFuZWw+XG4gICk7XG5cbk1hcExlZ2VuZFBhbmVsLmRpc3BsYXlOYW1lID0gJ01hcENvbnRyb2xQYW5lbCc7XG5cbmNvbnN0IFNwbGl0TWFwQnV0dG9uID0gUmVhY3QubWVtbygoe2lzU3BsaXQsIG1hcEluZGV4LCBvblRvZ2dsZVNwbGl0TWFwfSkgPT4gKFxuICA8TWFwQ29udHJvbEJ1dHRvblxuICAgIGFjdGl2ZT17aXNTcGxpdH1cbiAgICBvbkNsaWNrPXtlID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIG9uVG9nZ2xlU3BsaXRNYXAoaXNTcGxpdCA/IG1hcEluZGV4IDogdW5kZWZpbmVkKTtcbiAgICB9fVxuICAgIGtleT17YHNwbGl0LSR7aXNTcGxpdH1gfVxuICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnbWFwLWNvbnRyb2wtYnV0dG9uJywgJ3NwbGl0LW1hcCcsIHsnY2xvc2UtbWFwJzogaXNTcGxpdH0pfVxuICAgIGRhdGEtdGlwXG4gICAgZGF0YS1mb3I9XCJhY3Rpb24tdG9nZ2xlXCJcbiAgPlxuICAgIHtpc1NwbGl0ID8gPERlbGV0ZSBoZWlnaHQ9XCIxOHB4XCIgLz4gOiA8U3BsaXQgaGVpZ2h0PVwiMThweFwiIC8+fVxuICAgIDxNYXBDb250cm9sVG9vbHRpcFxuICAgICAgaWQ9XCJhY3Rpb24tdG9nZ2xlXCJcbiAgICAgIG1lc3NhZ2U9e2lzU3BsaXQgPyAndG9vbHRpcC5jbG9zZVBhbmVsJyA6ICd0b29sdGlwLnN3aXRjaFRvRHVhbFZpZXcnfVxuICAgIC8+XG4gIDwvTWFwQ29udHJvbEJ1dHRvbj5cbikpO1xuXG5TcGxpdE1hcEJ1dHRvbi5kaXNwbGF5TmFtZSA9ICdTcGxpdE1hcEJ1dHRvbic7XG5cbmNvbnN0IFRvZ2dsZTNkQnV0dG9uID0gUmVhY3QubWVtbygoe2RyYWdSb3RhdGUsIG9uVG9nZ2xlUGVyc3BlY3RpdmV9KSA9PiAoXG4gIDxNYXBDb250cm9sQnV0dG9uXG4gICAgb25DbGljaz17ZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvblRvZ2dsZVBlcnNwZWN0aXZlKCk7XG4gICAgfX1cbiAgICBhY3RpdmU9e2RyYWdSb3RhdGV9XG4gICAgZGF0YS10aXBcbiAgICBkYXRhLWZvcj1cImFjdGlvbi0zZFwiXG4gID5cbiAgICA8Q3ViZTNkIGhlaWdodD1cIjIycHhcIiAvPlxuICAgIDxNYXBDb250cm9sVG9vbHRpcFxuICAgICAgaWQ9XCJhY3Rpb24tM2RcIlxuICAgICAgbWVzc2FnZT17ZHJhZ1JvdGF0ZSA/ICd0b29sdGlwLmRpc2FibGUzRE1hcCcgOiAndG9vbHRpcC4zRE1hcCd9XG4gICAgLz5cbiAgPC9NYXBDb250cm9sQnV0dG9uPlxuKSk7XG5cblRvZ2dsZTNkQnV0dG9uLmRpc3BsYXlOYW1lID0gJ1RvZ2dsZTNkQnV0dG9uJztcblxuY29uc3QgU3R5bGVkVG9vbGJhciA9IHN0eWxlZChWZXJ0aWNhbFRvb2xiYXIpYFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiAzMnB4O1xuYDtcblxuY29uc3QgTWFwRHJhd1BhbmVsID0gUmVhY3QubWVtbyhcbiAgKHtlZGl0b3IsIGlzQWN0aXZlLCBvblRvZ2dsZU1lbnVQYW5lbCwgb25TZXRFZGl0b3JNb2RlLCBvblRvZ2dsZUVkaXRvclZpc2liaWxpdHl9KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWFwLWRyYXctY29udHJvbHNcIiBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0+XG4gICAgICAgIHtpc0FjdGl2ZSA/IChcbiAgICAgICAgICA8U3R5bGVkVG9vbGJhciBzaG93PXtpc0FjdGl2ZX0+XG4gICAgICAgICAgICA8VG9vbGJhckl0ZW1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZWRpdC1mZWF0dXJlXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZXRFZGl0b3JNb2RlKEVESVRPUl9NT0RFUy5FRElUKX1cbiAgICAgICAgICAgICAgbGFiZWw9XCJ0b29sYmFyLnNlbGVjdFwiXG4gICAgICAgICAgICAgIGljb25IZWlnaHQ9XCIyMnB4XCJcbiAgICAgICAgICAgICAgaWNvbj17Q3Vyc29yQ2xpY2t9XG4gICAgICAgICAgICAgIGFjdGl2ZT17ZWRpdG9yLm1vZGUgPT09IEVESVRPUl9NT0RFUy5FRElUfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxUb29sYmFySXRlbVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkcmF3LWZlYXR1cmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNldEVkaXRvck1vZGUoRURJVE9SX01PREVTLkRSQVdfUE9MWUdPTil9XG4gICAgICAgICAgICAgIGxhYmVsPVwidG9vbGJhci5wb2x5Z29uXCJcbiAgICAgICAgICAgICAgaWNvbkhlaWdodD1cIjIycHhcIlxuICAgICAgICAgICAgICBpY29uPXtQb2x5Z29ufVxuICAgICAgICAgICAgICBhY3RpdmU9e2VkaXRvci5tb2RlID09PSBFRElUT1JfTU9ERVMuRFJBV19QT0xZR09OfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxUb29sYmFySXRlbVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkcmF3LXJlY3RhbmdsZVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2V0RWRpdG9yTW9kZShFRElUT1JfTU9ERVMuRFJBV19SRUNUQU5HTEUpfVxuICAgICAgICAgICAgICBsYWJlbD1cInRvb2xiYXIucmVjdGFuZ2xlXCJcbiAgICAgICAgICAgICAgaWNvbkhlaWdodD1cIjIycHhcIlxuICAgICAgICAgICAgICBpY29uPXtSZWN0YW5nbGV9XG4gICAgICAgICAgICAgIGFjdGl2ZT17ZWRpdG9yLm1vZGUgPT09IEVESVRPUl9NT0RFUy5EUkFXX1JFQ1RBTkdMRX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8VG9vbGJhckl0ZW1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidG9nZ2xlLWZlYXR1cmVzXCJcbiAgICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVFZGl0b3JWaXNpYmlsaXR5fVxuICAgICAgICAgICAgICBsYWJlbD17ZWRpdG9yLnZpc2libGUgPyAndG9vbGJhci5oaWRlJyA6ICd0b29sYmFyLnNob3cnfVxuICAgICAgICAgICAgICBpY29uSGVpZ2h0PVwiMjJweFwiXG4gICAgICAgICAgICAgIGljb249e2VkaXRvci52aXNpYmxlID8gRXllU2VlbiA6IEV5ZVVuc2Vlbn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9TdHlsZWRUb29sYmFyPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPE1hcENvbnRyb2xCdXR0b25cbiAgICAgICAgICBvbkNsaWNrPXtlID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIG9uVG9nZ2xlTWVudVBhbmVsKCk7XG4gICAgICAgICAgfX1cbiAgICAgICAgICBhY3RpdmU9e2lzQWN0aXZlfVxuICAgICAgICAgIGRhdGEtdGlwXG4gICAgICAgICAgZGF0YS1mb3I9XCJtYXAtZHJhd1wiXG4gICAgICAgID5cbiAgICAgICAgICA8RHJhd1BvbHlnb24gaGVpZ2h0PVwiMjJweFwiIC8+XG4gICAgICAgICAgPE1hcENvbnRyb2xUb29sdGlwIGlkPVwibWFwLWRyYXdcIiBtZXNzYWdlPVwidG9vbHRpcC5EcmF3T25NYXBcIiAvPlxuICAgICAgICA8L01hcENvbnRyb2xCdXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG4pO1xuXG5NYXBEcmF3UGFuZWwuZGlzcGxheU5hbWUgPSAnTWFwRHJhd1BhbmVsJztcblxuY29uc3QgTG9jYWxlUGFuZWwgPSBSZWFjdC5tZW1vKFxuICAoe2F2YWlsYWJsZUxvY2FsZXMsIGlzQWN0aXZlLCBvblRvZ2dsZU1lbnVQYW5lbCwgb25TZXRMb2NhbGUsIGFjdGl2ZUxvY2FsZX0pID0+IHtcbiAgICBjb25zdCBvbkNsaWNrSXRlbSA9IHVzZUNhbGxiYWNrKFxuICAgICAgbG9jYWxlID0+IHtcbiAgICAgICAgb25TZXRMb2NhbGUobG9jYWxlKTtcbiAgICAgIH0sXG4gICAgICBbb25TZXRMb2NhbGVdXG4gICAgKTtcblxuICAgIGNvbnN0IG9uQ2xpY2tCdXR0b24gPSB1c2VDYWxsYmFjayhcbiAgICAgIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9uVG9nZ2xlTWVudVBhbmVsKCk7XG4gICAgICB9LFxuICAgICAgW29uVG9nZ2xlTWVudVBhbmVsXVxuICAgICk7XG4gICAgY29uc3QgZ2V0TGFiZWwgPSB1c2VDYWxsYmFjayhsb2NhbGUgPT4gYHRvb2xiYXIuJHtsb2NhbGV9YCwgW10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJ319PlxuICAgICAgICB7aXNBY3RpdmUgPyAoXG4gICAgICAgICAgPFN0eWxlZFRvb2xiYXIgc2hvdz17aXNBY3RpdmV9PlxuICAgICAgICAgICAge2F2YWlsYWJsZUxvY2FsZXMubWFwKGxvY2FsZSA9PiAoXG4gICAgICAgICAgICAgIDxUb29sYmFySXRlbVxuICAgICAgICAgICAgICAgIGtleT17bG9jYWxlfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2xpY2tJdGVtKGxvY2FsZSl9XG4gICAgICAgICAgICAgICAgbGFiZWw9e2dldExhYmVsKGxvY2FsZSl9XG4gICAgICAgICAgICAgICAgYWN0aXZlPXthY3RpdmVMb2NhbGUgPT09IGxvY2FsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvU3R5bGVkVG9vbGJhcj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxNYXBDb250cm9sQnV0dG9uIG9uQ2xpY2s9e29uQ2xpY2tCdXR0b259IGFjdGl2ZT17aXNBY3RpdmV9IGRhdGEtdGlwIGRhdGEtZm9yPVwibG9jYWxlXCI+XG4gICAgICAgICAge2FjdGl2ZUxvY2FsZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgIDxNYXBDb250cm9sVG9vbHRpcCBpZD1cImxvY2FsZVwiIG1lc3NhZ2U9XCJ0b29sdGlwLnNlbGVjdExvY2FsZVwiIC8+XG4gICAgICAgIDwvTWFwQ29udHJvbEJ1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbik7XG5cbkxvY2FsZVBhbmVsLmRpc3BsYXlOYW1lID0gJ0xvY2FsZVBhbmVsJztcblxuY29uc3QgTGVnZW5kTG9nbyA9IDxLZXBsZXJHbExvZ28gdmVyc2lvbj17ZmFsc2V9IGFwcE5hbWU9XCJrZXBsZXIuZ2xcIiAvPjtcbmNvbnN0IE1hcENvbnRyb2xGYWN0b3J5ID0gKCkgPT4ge1xuICBjbGFzcyBNYXBDb250cm9sIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgZGF0YXNldHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGRyYWdSb3RhdGU6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgICBpc1NwbGl0OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICAgIGxheWVyc1RvUmVuZGVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBtYXBJbmRleDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgbWFwQ29udHJvbHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIG9uVG9nZ2xlUGVyc3BlY3RpdmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBvblRvZ2dsZVNwbGl0TWFwOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgb25Ub2dnbGVNYXBDb250cm9sOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgb25TZXRFZGl0b3JNb2RlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgb25Ub2dnbGVFZGl0b3JWaXNpYmlsaXR5OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgdG9wOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICBvblNldExvY2FsZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGxvY2FsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgbG9nb0NvbXBvbmVudDogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmVsZW1lbnQsIFByb3BUeXBlcy5mdW5jXSksXG5cbiAgICAgIC8vIG9wdGlvbmFsXG4gICAgICByZWFkT25seTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBzY2FsZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIG1hcExheWVyczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIGVkaXRvcjogUHJvcFR5cGVzLm9iamVjdFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgaXNTcGxpdDogZmFsc2UsXG4gICAgICB0b3A6IDAsXG4gICAgICBtYXBJbmRleDogMCxcbiAgICAgIGxvZ29Db21wb25lbnQ6IExlZ2VuZExvZ29cbiAgICB9O1xuXG4gICAgbGF5ZXJTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmxheWVycztcbiAgICBsYXllcnNUb1JlbmRlclNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMubGF5ZXJzVG9SZW5kZXI7XG4gICAgbGF5ZXJQYW5lbEl0ZW1zU2VsZWN0b3IgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgIHRoaXMubGF5ZXJTZWxlY3RvcixcbiAgICAgIHRoaXMubGF5ZXJzVG9SZW5kZXJTZWxlY3RvcixcbiAgICAgIChsYXllcnMsIGxheWVyc1RvUmVuZGVyKSA9PlxuICAgICAgICBsYXllcnNcbiAgICAgICAgICAuZmlsdGVyKGwgPT4gbC5jb25maWcuaXNWaXNpYmxlKVxuICAgICAgICAgIC5tYXAobGF5ZXIgPT4gKHtcbiAgICAgICAgICAgIGlkOiBsYXllci5pZCxcbiAgICAgICAgICAgIG5hbWU6IGxheWVyLmNvbmZpZy5sYWJlbCxcbiAgICAgICAgICAgIC8vIGxheWVyXG4gICAgICAgICAgICBpc1Zpc2libGU6IGxheWVyc1RvUmVuZGVyW2xheWVyLmlkXVxuICAgICAgICAgIH0pKVxuICAgICk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRyYWdSb3RhdGUsXG4gICAgICAgIGxheWVycyxcbiAgICAgICAgbGF5ZXJzVG9SZW5kZXIsXG4gICAgICAgIGlzU3BsaXQsXG4gICAgICAgIGlzRXhwb3J0LFxuICAgICAgICBtYXBJbmRleCxcbiAgICAgICAgbWFwQ29udHJvbHMsXG4gICAgICAgIG9uVG9nZ2xlUGVyc3BlY3RpdmUsXG4gICAgICAgIG9uVG9nZ2xlU3BsaXRNYXAsXG4gICAgICAgIG9uTWFwVG9nZ2xlTGF5ZXIsXG4gICAgICAgIG9uVG9nZ2xlTWFwQ29udHJvbCxcbiAgICAgICAgZWRpdG9yLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcmVhZE9ubHksXG4gICAgICAgIGxvY2FsZSxcbiAgICAgICAgdG9wLFxuICAgICAgICBsb2dvQ29tcG9uZW50XG4gICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3Qge1xuICAgICAgICB2aXNpYmxlTGF5ZXJzID0ge30sXG4gICAgICAgIG1hcExlZ2VuZCA9IHt9LFxuICAgICAgICB0b2dnbGUzZCA9IHt9LFxuICAgICAgICBzcGxpdE1hcCA9IHt9LFxuICAgICAgICBtYXBEcmF3ID0ge30sXG4gICAgICAgIG1hcExvY2FsZSA9IHt9XG4gICAgICB9ID0gbWFwQ29udHJvbHM7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRNYXBDb250cm9sIGNsYXNzTmFtZT1cIm1hcC1jb250cm9sXCIgdG9wPXt0b3B9PlxuICAgICAgICAgIHsvKiBTcGxpdCBNYXAgKi99XG4gICAgICAgICAge3NwbGl0TWFwLnNob3cgJiYgcmVhZE9ubHkgIT09IHRydWUgPyAoXG4gICAgICAgICAgICA8QWN0aW9uUGFuZWwgY2xhc3NOYW1lPVwic3BsaXQtbWFwXCIga2V5PXswfT5cbiAgICAgICAgICAgICAgPFNwbGl0TWFwQnV0dG9uXG4gICAgICAgICAgICAgICAgaXNTcGxpdD17aXNTcGxpdH1cbiAgICAgICAgICAgICAgICBtYXBJbmRleD17bWFwSW5kZXh9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGVTcGxpdE1hcD17b25Ub2dnbGVTcGxpdE1hcH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7LyogTWFwIExheWVycyAqL31cbiAgICAgICAgICB7aXNTcGxpdCAmJiB2aXNpYmxlTGF5ZXJzLnNob3cgJiYgcmVhZE9ubHkgIT09IHRydWUgPyAoXG4gICAgICAgICAgICA8QWN0aW9uUGFuZWwgY2xhc3NOYW1lPVwibWFwLWxheWVyc1wiIGtleT17MX0+XG4gICAgICAgICAgICAgIDxMYXllclNlbGVjdG9yUGFuZWxcbiAgICAgICAgICAgICAgICBpdGVtcz17dGhpcy5sYXllclBhbmVsSXRlbXNTZWxlY3Rvcih0aGlzLnByb3BzKX1cbiAgICAgICAgICAgICAgICBvbk1hcFRvZ2dsZUxheWVyPXtvbk1hcFRvZ2dsZUxheWVyfVxuICAgICAgICAgICAgICAgIGlzQWN0aXZlPXt2aXNpYmxlTGF5ZXJzLmFjdGl2ZX1cbiAgICAgICAgICAgICAgICB0b2dnbGVNZW51UGFuZWw9eygpID0+IG9uVG9nZ2xlTWFwQ29udHJvbCgndmlzaWJsZUxheWVycycpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHsvKiAzRCBNYXAgKi99XG4gICAgICAgICAge3RvZ2dsZTNkLnNob3cgPyAoXG4gICAgICAgICAgICA8QWN0aW9uUGFuZWwgY2xhc3NOYW1lPVwidG9nZ2xlLTNkXCIga2V5PXsyfT5cbiAgICAgICAgICAgICAgPFRvZ2dsZTNkQnV0dG9uIGRyYWdSb3RhdGU9e2RyYWdSb3RhdGV9IG9uVG9nZ2xlUGVyc3BlY3RpdmU9e29uVG9nZ2xlUGVyc3BlY3RpdmV9IC8+XG4gICAgICAgICAgICA8L0FjdGlvblBhbmVsPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgey8qIE1hcCBMZWdlbmQgKi99XG4gICAgICAgICAge21hcExlZ2VuZC5zaG93ID8gKFxuICAgICAgICAgICAgPEFjdGlvblBhbmVsIGNsYXNzTmFtZT1cInNob3ctbGVnZW5kXCIga2V5PXszfT5cbiAgICAgICAgICAgICAgPE1hcExlZ2VuZFBhbmVsXG4gICAgICAgICAgICAgICAgbGF5ZXJzPXtsYXllcnMuZmlsdGVyKGwgPT4gbGF5ZXJzVG9SZW5kZXJbbC5pZF0pfVxuICAgICAgICAgICAgICAgIHNjYWxlPXtzY2FsZX1cbiAgICAgICAgICAgICAgICBpc0V4cG9ydD17aXNFeHBvcnR9XG4gICAgICAgICAgICAgICAgb25NYXBUb2dnbGVMYXllcj17b25NYXBUb2dnbGVMYXllcn1cbiAgICAgICAgICAgICAgICBpc0FjdGl2ZT17bWFwTGVnZW5kLmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZU1lbnVQYW5lbD17KCkgPT4gb25Ub2dnbGVNYXBDb250cm9sKCdtYXBMZWdlbmQnKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlQ2xvc2U9e21hcExlZ2VuZC5kaXNhYmxlQ2xvc2V9XG4gICAgICAgICAgICAgICAgbG9nb0NvbXBvbmVudD17bG9nb0NvbXBvbmVudH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bWFwRHJhdy5zaG93ID8gKFxuICAgICAgICAgICAgPEFjdGlvblBhbmVsIGtleT17NH0+XG4gICAgICAgICAgICAgIDxNYXBEcmF3UGFuZWxcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZT17bWFwRHJhdy5hY3RpdmUgJiYgbWFwRHJhdy5hY3RpdmVNYXBJbmRleCA9PT0gbWFwSW5kZXh9XG4gICAgICAgICAgICAgICAgZWRpdG9yPXtlZGl0b3J9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGVNZW51UGFuZWw9eygpID0+IG9uVG9nZ2xlTWFwQ29udHJvbCgnbWFwRHJhdycpfVxuICAgICAgICAgICAgICAgIG9uU2V0RWRpdG9yTW9kZT17dGhpcy5wcm9wcy5vblNldEVkaXRvck1vZGV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGVFZGl0b3JWaXNpYmlsaXR5PXt0aGlzLnByb3BzLm9uVG9nZ2xlRWRpdG9yVmlzaWJpbGl0eX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bWFwTG9jYWxlLnNob3cgPyAoXG4gICAgICAgICAgICA8QWN0aW9uUGFuZWwga2V5PXs1fT5cbiAgICAgICAgICAgICAgPExvY2FsZVBhbmVsXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU9e21hcExvY2FsZS5hY3RpdmV9XG4gICAgICAgICAgICAgICAgYWN0aXZlTG9jYWxlPXtsb2NhbGV9XG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlTG9jYWxlcz17T2JqZWN0LmtleXMoTE9DQUxFX0NPREVTKX1cbiAgICAgICAgICAgICAgICBvblNldExvY2FsZT17dGhpcy5wcm9wcy5vblNldExvY2FsZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZU1lbnVQYW5lbD17KCkgPT4gb25Ub2dnbGVNYXBDb250cm9sKCdtYXBMb2NhbGUnKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQWN0aW9uUGFuZWw+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvU3R5bGVkTWFwQ29udHJvbD5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgTWFwQ29udHJvbC5kaXNwbGF5TmFtZSA9ICdNYXBDb250cm9sJztcblxuICByZXR1cm4gTWFwQ29udHJvbDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hcENvbnRyb2xGYWN0b3J5O1xuIl19