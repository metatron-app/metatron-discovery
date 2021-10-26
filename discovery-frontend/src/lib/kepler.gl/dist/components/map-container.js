"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = MapContainerFactory;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactMapGl = _interopRequireDefault(require("react-map-gl"));

var _react2 = _interopRequireDefault(require("@deck.gl/react"));

var _reselect = require("reselect");

var _viewportMercatorProject = _interopRequireDefault(require("viewport-mercator-project"));

var _mapPopover = _interopRequireDefault(require("./map/map-popover"));

var _mapControl = _interopRequireDefault(require("./map/map-control"));

var _styledComponents = require("./common/styled-components");

var _editor = _interopRequireDefault(require("./editor/editor"));

var _mapboxUtils = require("../layers/mapbox-utils");

var _baseLayer = require("../layers/base-layer");

var _glUtils = require("../utils/gl-utils");

var _mapboxUtils2 = require("../utils/map-style-utils/mapbox-utils");

var _layerUtils = require("../utils/layer-utils");

var _dBuildingLayer = _interopRequireDefault(require("../deckgl-layers/3d-building-layer/3d-building-layer"));

var _defaultSettings = require("../constants/default-settings");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MAP_STYLE = {
  container: {
    display: 'inline-block',
    position: 'relative'
  },
  top: {
    position: 'absolute',
    top: '0px',
    pointerEvents: 'none'
  }
};
var MAPBOXGL_STYLE_UPDATE = 'style.load';
var MAPBOXGL_RENDER = 'render';
var TRANSITION_DURATION = 0;

var Attribution = function Attribution() {
  return /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledAttrbution, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "attrition-logo"
  }, "Basemap by:", /*#__PURE__*/_react["default"].createElement("a", {
    className: "mapboxgl-ctrl-logo",
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://www.mapbox.com/",
    "aria-label": "Mapbox logo"
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "attrition-link"
  }, /*#__PURE__*/_react["default"].createElement("a", {
    href: "https://kepler.gl/policy/",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\xA9 kepler.gl |", ' '), /*#__PURE__*/_react["default"].createElement("a", {
    href: "https://www.mapbox.com/about/maps/",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\xA9 Mapbox |", ' '), /*#__PURE__*/_react["default"].createElement("a", {
    href: "http://www.openstreetmap.org/copyright",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\xA9 OpenStreetMap |", ' '), /*#__PURE__*/_react["default"].createElement("a", {
    href: "https://www.mapbox.com/map-feedback/",
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/_react["default"].createElement("strong", null, "Improve this map"))));
};

MapContainerFactory.deps = [_mapPopover["default"], _mapControl["default"], _editor["default"]];

function MapContainerFactory(MapPopover, MapControl, Editor) {
  var MapContainer = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(MapContainer, _Component);

    var _super = _createSuper(MapContainer);

    function MapContainer(_props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapContainer);
      _this = _super.call(this, _props);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layersSelector", function (props) {
        return props.layers;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerDataSelector", function (props) {
        return props.layerData;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "mapLayersSelector", function (props) {
        return props.mapLayers;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerOrderSelector", function (props) {
        return props.layerOrder;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layersToRenderSelector", (0, _reselect.createSelector)(_this.layersSelector, _this.layerDataSelector, _this.mapLayersSelector, // {[id]: true \ false}
      function (layers, layerData, mapLayers) {
        return layers.reduce(function (accu, layer, idx) {
          return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, layer.id, layer.id !== _defaultSettings.GEOCODER_LAYER_ID && layer.shouldRenderLayer(layerData[idx]) && _this._isVisibleMapLayer(layer, mapLayers)));
        }, {});
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filtersSelector", function (props) {
        return props.filters;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "polygonFilters", (0, _reselect.createSelector)(_this.filtersSelector, function (filters) {
        return filters.filter(function (f) {
          return f.type === _defaultSettings.FILTER_TYPES.polygon;
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "mapboxLayersSelector", (0, _reselect.createSelector)(_this.layersSelector, _this.layerDataSelector, _this.layerOrderSelector, _this.layersToRenderSelector, _mapboxUtils.generateMapboxLayers));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onCloseMapPopover", function () {
        _this.props.visStateActions.onLayerClick(null);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onLayerSetDomain", function (idx, colorDomain) {
        _this.props.visStateActions.layerConfigChange(_this.props.layers[idx], {
          colorDomain: colorDomain
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_handleMapToggleLayer", function (layerId) {
        var _this$props = _this.props,
            _this$props$index = _this$props.index,
            mapIndex = _this$props$index === void 0 ? 0 : _this$props$index,
            visStateActions = _this$props.visStateActions;
        visStateActions.toggleLayerForMap(mapIndex, layerId);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onMapboxStyleUpdate", function () {
        // force refresh mapboxgl layers
        _this.previousLayers = {};

        _this._updateMapboxLayers();

        if (typeof _this.props.onMapStyleLoaded === 'function') {
          _this.props.onMapStyleLoaded(_this._map);
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_setMapboxMap", function (mapbox) {
        if (!_this._map && mapbox) {
          _this._map = mapbox.getMap(); // i noticed in certain context we don't access the actual map element

          if (!_this._map) {
            return;
          } // bind mapboxgl event listener


          _this._map.on(MAPBOXGL_STYLE_UPDATE, _this._onMapboxStyleUpdate);

          _this._map.on(MAPBOXGL_RENDER, function () {
            if (typeof _this.props.onMapRender === 'function') {
              _this.props.onMapRender(_this._map);
            }
          });
        }

        if (_this.props.getMapboxRef) {
          // The parent component can gain access to our MapboxGlMap by
          // providing this callback. Note that 'mapbox' will be null when the
          // ref is unset (e.g. when a split map is closed).
          _this.props.getMapboxRef(mapbox, _this.props.index);
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onBeforeRender", function (_ref) {
        var gl = _ref.gl;
        (0, _glUtils.setLayerBlending)(gl, _this.props.layerBlending);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_renderLayer", function (overlays, idx) {
        var _this$props2 = _this.props,
            datasets = _this$props2.datasets,
            layers = _this$props2.layers,
            layerData = _this$props2.layerData,
            hoverInfo = _this$props2.hoverInfo,
            clicked = _this$props2.clicked,
            mapState = _this$props2.mapState,
            interactionConfig = _this$props2.interactionConfig,
            animationConfig = _this$props2.animationConfig;
        var layer = layers[idx];
        var data = layerData[idx];

        var _ref2 = datasets[layer.config.dataId] || {},
            gpuFilter = _ref2.gpuFilter;

        var objectHovered = clicked || hoverInfo;
        var layerCallbacks = {
          onSetLayerDomain: function onSetLayerDomain(val) {
            return _this._onLayerSetDomain(idx, val);
          }
        }; // Layer is Layer class

        var layerOverlay = layer.renderLayer({
          data: data,
          gpuFilter: gpuFilter,
          idx: idx,
          interactionConfig: interactionConfig,
          layerCallbacks: layerCallbacks,
          mapState: mapState,
          animationConfig: animationConfig,
          objectHovered: objectHovered
        });
        return overlays.concat(layerOverlay || []);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onViewportChange", function (viewState) {
        if (typeof _this.props.onViewStateChange === 'function') {
          _this.props.onViewStateChange(viewState);
        }

        _this.props.mapStateActions.updateMap(viewState);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleMapControl", function (panelId) {
        var _this$props3 = _this.props,
            index = _this$props3.index,
            uiStateActions = _this$props3.uiStateActions;
        uiStateActions.toggleMapControl(panelId, index);
      });
      _this.previousLayers = {// [layers.id]: mapboxLayerConfig
      };
      _this._deck = null;
      return _this;
    }

    (0, _createClass2["default"])(MapContainer, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // unbind mapboxgl event listener
        if (this._map) {
          this._map.off(MAPBOXGL_STYLE_UPDATE);

          this._map.off(MAPBOXGL_RENDER);
        }
      }
    }, {
      key: "_isVisibleMapLayer",

      /* component private functions */
      value: function _isVisibleMapLayer(layer, mapLayers) {
        // if layer.id is not in mapLayers, don't render it
        return !mapLayers || mapLayers && mapLayers[layer.id];
      }
    }, {
      key: "_onDeckInitialized",
      value: function _onDeckInitialized(gl) {
        if (this.props.onDeckInitialized) {
          this.props.onDeckInitialized(this._deck, gl);
        }
      }
    }, {
      key: "_renderMapPopover",

      /* component render functions */

      /* eslint-disable complexity */
      value: function _renderMapPopover(layersToRender) {
        // TODO: move this into reducer so it can be tested
        var _this$props4 = this.props,
            mapState = _this$props4.mapState,
            hoverInfo = _this$props4.hoverInfo,
            clicked = _this$props4.clicked,
            datasets = _this$props4.datasets,
            interactionConfig = _this$props4.interactionConfig,
            layers = _this$props4.layers,
            _this$props4$mousePos = _this$props4.mousePos,
            mousePosition = _this$props4$mousePos.mousePosition,
            coordinate = _this$props4$mousePos.coordinate,
            pinned = _this$props4$mousePos.pinned;

        if (!mousePosition) {
          return null;
        } // if clicked something, ignore hover behavior


        var layerHoverProp = null;
        var layerPinnedProp = null;
        var position = {
          x: mousePosition[0],
          y: mousePosition[1]
        };
        var pinnedPosition = {};
        layerHoverProp = (0, _layerUtils.getLayerHoverProp)({
          interactionConfig: interactionConfig,
          hoverInfo: hoverInfo,
          layers: layers,
          layersToRender: layersToRender,
          datasets: datasets
        });
        var compareMode = interactionConfig.tooltip.config ? interactionConfig.tooltip.config.compareMode : false;
        var hasTooltip = pinned || clicked;
        var hasComparisonTooltip = compareMode || !clicked && !pinned;

        if (hasTooltip) {
          // project lnglat to screen so that tooltip follows the object on zoom
          var viewport = new _viewportMercatorProject["default"](mapState);
          var lngLat = clicked ? clicked.lngLat : pinned.coordinate;
          pinnedPosition = this._getHoverXY(viewport, lngLat);
          layerPinnedProp = (0, _layerUtils.getLayerHoverProp)({
            interactionConfig: interactionConfig,
            hoverInfo: clicked,
            layers: layers,
            layersToRender: layersToRender,
            datasets: datasets
          });

          if (layerHoverProp) {
            layerHoverProp.primaryData = layerPinnedProp.data;
            layerHoverProp.compareType = interactionConfig.tooltip.config.compareType;
          }
        }

        var commonProp = {
          onClose: this._onCloseMapPopover,
          mapW: mapState.width,
          mapH: mapState.height,
          zoom: mapState.zoom
        };
        return /*#__PURE__*/_react["default"].createElement("div", null, hasTooltip && /*#__PURE__*/_react["default"].createElement(MapPopover, (0, _extends2["default"])({}, pinnedPosition, commonProp, {
          layerHoverProp: layerPinnedProp,
          coordinate: interactionConfig.coordinate.enabled && (pinned || {}).coordinate,
          frozen: Boolean(hasTooltip),
          isBase: compareMode
        })), hasComparisonTooltip && /*#__PURE__*/_react["default"].createElement(MapPopover, (0, _extends2["default"])({}, position, commonProp, {
          layerHoverProp: layerHoverProp,
          coordinate: interactionConfig.coordinate.enabled && coordinate
        })));
      }
      /* eslint-enable complexity */

    }, {
      key: "_getHoverXY",
      value: function _getHoverXY(viewport, lngLat) {
        var screenCoord = !viewport || !lngLat ? null : viewport.project(lngLat);
        return screenCoord && {
          x: screenCoord[0],
          y: screenCoord[1]
        };
      }
    }, {
      key: "_renderDeckOverlay",
      value: function _renderDeckOverlay(layersToRender) {
        var _this2 = this;

        var _this$props5 = this.props,
            mapState = _this$props5.mapState,
            mapStyle = _this$props5.mapStyle,
            layerData = _this$props5.layerData,
            layerOrder = _this$props5.layerOrder,
            layers = _this$props5.layers,
            visStateActions = _this$props5.visStateActions,
            mapboxApiAccessToken = _this$props5.mapboxApiAccessToken,
            mapboxApiUrl = _this$props5.mapboxApiUrl;
        var deckGlLayers = []; // wait until data is ready before render data layers

        if (layerData && layerData.length) {
          // last layer render first
          deckGlLayers = layerOrder.slice().reverse().filter(function (idx) {
            return layers[idx].overlayType === _baseLayer.OVERLAY_TYPE.deckgl && layersToRender[layers[idx].id];
          }).reduce(this._renderLayer, []);
        }

        if (mapStyle.visibleLayerGroups['3d building']) {
          deckGlLayers.push(new _dBuildingLayer["default"]({
            id: '_keplergl_3d-building',
            mapboxApiAccessToken: mapboxApiAccessToken,
            mapboxApiUrl: mapboxApiUrl,
            threeDBuildingColor: mapStyle.threeDBuildingColor,
            updateTriggers: {
              getFillColor: mapStyle.threeDBuildingColor
            }
          }));
        }

        return /*#__PURE__*/_react["default"].createElement(_react2["default"], (0, _extends2["default"])({}, this.props.deckGlProps, {
          viewState: mapState,
          id: "default-deckgl-overlay",
          layers: deckGlLayers,
          onBeforeRender: this._onBeforeRender,
          onHover: visStateActions.onLayerHover,
          onClick: visStateActions.onLayerClick,
          ref: function ref(comp) {
            if (comp && comp.deck && !_this2._deck) {
              _this2._deck = comp.deck;
            }
          },
          onWebGLInitialized: function onWebGLInitialized(gl) {
            return _this2._onDeckInitialized(gl);
          }
        }));
      }
    }, {
      key: "_updateMapboxLayers",
      value: function _updateMapboxLayers() {
        var mapboxLayers = this.mapboxLayersSelector(this.props);

        if (!Object.keys(mapboxLayers).length && !Object.keys(this.previousLayers).length) {
          return;
        }

        (0, _mapboxUtils.updateMapboxLayers)(this._map, mapboxLayers, this.previousLayers);
        this.previousLayers = mapboxLayers;
      }
    }, {
      key: "_renderMapboxOverlays",
      value: function _renderMapboxOverlays() {
        if (this._map && this._map.isStyleLoaded()) {
          this._updateMapboxLayers();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props6 = this.props,
            mapState = _this$props6.mapState,
            mapStyle = _this$props6.mapStyle,
            mapStateActions = _this$props6.mapStateActions,
            mapLayers = _this$props6.mapLayers,
            layers = _this$props6.layers,
            MapComponent = _this$props6.MapComponent,
            datasets = _this$props6.datasets,
            mapboxApiAccessToken = _this$props6.mapboxApiAccessToken,
            mapboxApiUrl = _this$props6.mapboxApiUrl,
            mapControls = _this$props6.mapControls,
            uiState = _this$props6.uiState,
            uiStateActions = _this$props6.uiStateActions,
            visStateActions = _this$props6.visStateActions,
            interactionConfig = _this$props6.interactionConfig,
            editor = _this$props6.editor,
            index = _this$props6.index;
        var layersToRender = this.layersToRenderSelector(this.props);

        if (!mapStyle.bottomMapStyle) {
          // style not yet loaded
          return /*#__PURE__*/_react["default"].createElement("div", null);
        }

        var mapProps = _objectSpread(_objectSpread({}, mapState), {}, {
          preserveDrawingBuffer: true,
          mapboxApiAccessToken: mapboxApiAccessToken,
          mapboxApiUrl: mapboxApiUrl,
          onViewportChange: this._onViewportChange,
          transformRequest: _mapboxUtils2.transformRequest
        });

        var isEdit = uiState.mapControls.mapDraw.active;
        var hasGeocoderLayer = layers.find(function (l) {
          return l.id === _defaultSettings.GEOCODER_LAYER_ID;
        });
        return /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledMapContainer, {
          style: MAP_STYLE.container
        }, /*#__PURE__*/_react["default"].createElement(MapControl, {
          datasets: datasets,
          dragRotate: mapState.dragRotate,
          isSplit: Boolean(mapLayers),
          isExport: this.props.isExport,
          layers: layers,
          layersToRender: layersToRender,
          mapIndex: index,
          mapControls: mapControls,
          readOnly: this.props.readOnly,
          scale: mapState.scale || 1,
          top: interactionConfig.geocoder && interactionConfig.geocoder.enabled ? 52 : 0,
          editor: editor,
          locale: uiState.locale,
          onTogglePerspective: mapStateActions.togglePerspective,
          onToggleSplitMap: mapStateActions.toggleSplitMap,
          onMapToggleLayer: this._handleMapToggleLayer,
          onToggleMapControl: this._toggleMapControl,
          onSetEditorMode: visStateActions.setEditorMode,
          onSetLocale: uiStateActions.setLocale,
          onToggleEditorVisibility: visStateActions.toggleEditorVisibility
        }), /*#__PURE__*/_react["default"].createElement(MapComponent, (0, _extends2["default"])({}, mapProps, {
          key: "bottom",
          ref: this._setMapboxMap,
          mapStyle: mapStyle.bottomMapStyle,
          getCursor: this.props.hoverInfo ? function () {
            return 'pointer';
          } : undefined,
          transitionDuration: TRANSITION_DURATION,
          onMouseMove: this.props.visStateActions.onMouseMove
        }), this._renderDeckOverlay(layersToRender), this._renderMapboxOverlays(layersToRender), /*#__PURE__*/_react["default"].createElement(Editor, {
          index: index,
          datasets: datasets,
          editor: editor,
          filters: this.polygonFilters(this.props),
          isEnabled: isEdit,
          layers: layers,
          layersToRender: layersToRender,
          onDeleteFeature: visStateActions.deleteFeature,
          onSelect: visStateActions.setSelectedFeature,
          onUpdate: visStateActions.setFeatures,
          onTogglePolygonFilter: visStateActions.setPolygonFilterLayer,
          style: {
            pointerEvents: isEdit ? 'all' : 'none',
            position: 'absolute',
            display: editor.visible ? 'block' : 'none'
          }
        })), mapStyle.topMapStyle || hasGeocoderLayer ? /*#__PURE__*/_react["default"].createElement("div", {
          style: MAP_STYLE.top
        }, /*#__PURE__*/_react["default"].createElement(MapComponent, (0, _extends2["default"])({}, mapProps, {
          key: "top",
          mapStyle: mapStyle.topMapStyle
        }), this._renderDeckOverlay((0, _defineProperty2["default"])({}, _defaultSettings.GEOCODER_LAYER_ID, true)))) : null, this._renderMapPopover(layersToRender), /*#__PURE__*/_react["default"].createElement(Attribution, null));
      }
    }]);
    return MapContainer;
  }(_react.Component);

  (0, _defineProperty2["default"])(MapContainer, "propTypes", {
    // required
    datasets: _propTypes["default"].object,
    interactionConfig: _propTypes["default"].object.isRequired,
    layerBlending: _propTypes["default"].string.isRequired,
    layerOrder: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    layerData: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    layers: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    filters: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    mapState: _propTypes["default"].object.isRequired,
    mapControls: _propTypes["default"].object.isRequired,
    uiState: _propTypes["default"].object.isRequired,
    mapStyle: _propTypes["default"].object.isRequired,
    mousePos: _propTypes["default"].object.isRequired,
    mapboxApiAccessToken: _propTypes["default"].string.isRequired,
    mapboxApiUrl: _propTypes["default"].string,
    visStateActions: _propTypes["default"].object.isRequired,
    mapStateActions: _propTypes["default"].object.isRequired,
    uiStateActions: _propTypes["default"].object.isRequired,
    // optional
    readOnly: _propTypes["default"].bool,
    isExport: _propTypes["default"].bool,
    clicked: _propTypes["default"].object,
    hoverInfo: _propTypes["default"].object,
    mapLayers: _propTypes["default"].object,
    onMapToggleLayer: _propTypes["default"].func,
    onMapStyleLoaded: _propTypes["default"].func,
    onMapRender: _propTypes["default"].func,
    getMapboxRef: _propTypes["default"].func,
    index: _propTypes["default"].number
  });
  (0, _defineProperty2["default"])(MapContainer, "defaultProps", {
    MapComponent: _reactMapGl["default"],
    deckGlProps: {},
    index: 0
  });
  MapContainer.displayName = 'MapContainer';
  return MapContainer;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21hcC1jb250YWluZXIuanMiXSwibmFtZXMiOlsiTUFQX1NUWUxFIiwiY29udGFpbmVyIiwiZGlzcGxheSIsInBvc2l0aW9uIiwidG9wIiwicG9pbnRlckV2ZW50cyIsIk1BUEJPWEdMX1NUWUxFX1VQREFURSIsIk1BUEJPWEdMX1JFTkRFUiIsIlRSQU5TSVRJT05fRFVSQVRJT04iLCJBdHRyaWJ1dGlvbiIsIk1hcENvbnRhaW5lckZhY3RvcnkiLCJkZXBzIiwiTWFwUG9wb3ZlckZhY3RvcnkiLCJNYXBDb250cm9sRmFjdG9yeSIsIkVkaXRvckZhY3RvcnkiLCJNYXBQb3BvdmVyIiwiTWFwQ29udHJvbCIsIkVkaXRvciIsIk1hcENvbnRhaW5lciIsInByb3BzIiwibGF5ZXJzIiwibGF5ZXJEYXRhIiwibWFwTGF5ZXJzIiwibGF5ZXJPcmRlciIsImxheWVyc1NlbGVjdG9yIiwibGF5ZXJEYXRhU2VsZWN0b3IiLCJtYXBMYXllcnNTZWxlY3RvciIsInJlZHVjZSIsImFjY3UiLCJsYXllciIsImlkeCIsImlkIiwiR0VPQ09ERVJfTEFZRVJfSUQiLCJzaG91bGRSZW5kZXJMYXllciIsIl9pc1Zpc2libGVNYXBMYXllciIsImZpbHRlcnMiLCJmaWx0ZXJzU2VsZWN0b3IiLCJmaWx0ZXIiLCJmIiwidHlwZSIsIkZJTFRFUl9UWVBFUyIsInBvbHlnb24iLCJsYXllck9yZGVyU2VsZWN0b3IiLCJsYXllcnNUb1JlbmRlclNlbGVjdG9yIiwiZ2VuZXJhdGVNYXBib3hMYXllcnMiLCJ2aXNTdGF0ZUFjdGlvbnMiLCJvbkxheWVyQ2xpY2siLCJjb2xvckRvbWFpbiIsImxheWVyQ29uZmlnQ2hhbmdlIiwibGF5ZXJJZCIsImluZGV4IiwibWFwSW5kZXgiLCJ0b2dnbGVMYXllckZvck1hcCIsInByZXZpb3VzTGF5ZXJzIiwiX3VwZGF0ZU1hcGJveExheWVycyIsIm9uTWFwU3R5bGVMb2FkZWQiLCJfbWFwIiwibWFwYm94IiwiZ2V0TWFwIiwib24iLCJfb25NYXBib3hTdHlsZVVwZGF0ZSIsIm9uTWFwUmVuZGVyIiwiZ2V0TWFwYm94UmVmIiwiZ2wiLCJsYXllckJsZW5kaW5nIiwib3ZlcmxheXMiLCJkYXRhc2V0cyIsImhvdmVySW5mbyIsImNsaWNrZWQiLCJtYXBTdGF0ZSIsImludGVyYWN0aW9uQ29uZmlnIiwiYW5pbWF0aW9uQ29uZmlnIiwiZGF0YSIsImNvbmZpZyIsImRhdGFJZCIsImdwdUZpbHRlciIsIm9iamVjdEhvdmVyZWQiLCJsYXllckNhbGxiYWNrcyIsIm9uU2V0TGF5ZXJEb21haW4iLCJ2YWwiLCJfb25MYXllclNldERvbWFpbiIsImxheWVyT3ZlcmxheSIsInJlbmRlckxheWVyIiwiY29uY2F0Iiwidmlld1N0YXRlIiwib25WaWV3U3RhdGVDaGFuZ2UiLCJtYXBTdGF0ZUFjdGlvbnMiLCJ1cGRhdGVNYXAiLCJwYW5lbElkIiwidWlTdGF0ZUFjdGlvbnMiLCJ0b2dnbGVNYXBDb250cm9sIiwiX2RlY2siLCJvZmYiLCJvbkRlY2tJbml0aWFsaXplZCIsImxheWVyc1RvUmVuZGVyIiwibW91c2VQb3MiLCJtb3VzZVBvc2l0aW9uIiwiY29vcmRpbmF0ZSIsInBpbm5lZCIsImxheWVySG92ZXJQcm9wIiwibGF5ZXJQaW5uZWRQcm9wIiwieCIsInkiLCJwaW5uZWRQb3NpdGlvbiIsImNvbXBhcmVNb2RlIiwidG9vbHRpcCIsImhhc1Rvb2x0aXAiLCJoYXNDb21wYXJpc29uVG9vbHRpcCIsInZpZXdwb3J0IiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsImxuZ0xhdCIsIl9nZXRIb3ZlclhZIiwicHJpbWFyeURhdGEiLCJjb21wYXJlVHlwZSIsImNvbW1vblByb3AiLCJvbkNsb3NlIiwiX29uQ2xvc2VNYXBQb3BvdmVyIiwibWFwVyIsIndpZHRoIiwibWFwSCIsImhlaWdodCIsInpvb20iLCJlbmFibGVkIiwiQm9vbGVhbiIsInNjcmVlbkNvb3JkIiwicHJvamVjdCIsIm1hcFN0eWxlIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJtYXBib3hBcGlVcmwiLCJkZWNrR2xMYXllcnMiLCJsZW5ndGgiLCJzbGljZSIsInJldmVyc2UiLCJvdmVybGF5VHlwZSIsIk9WRVJMQVlfVFlQRSIsImRlY2tnbCIsIl9yZW5kZXJMYXllciIsInZpc2libGVMYXllckdyb3VwcyIsInB1c2giLCJUaHJlZURCdWlsZGluZ0xheWVyIiwidGhyZWVEQnVpbGRpbmdDb2xvciIsInVwZGF0ZVRyaWdnZXJzIiwiZ2V0RmlsbENvbG9yIiwiZGVja0dsUHJvcHMiLCJfb25CZWZvcmVSZW5kZXIiLCJvbkxheWVySG92ZXIiLCJjb21wIiwiZGVjayIsIl9vbkRlY2tJbml0aWFsaXplZCIsIm1hcGJveExheWVycyIsIm1hcGJveExheWVyc1NlbGVjdG9yIiwiT2JqZWN0Iiwia2V5cyIsImlzU3R5bGVMb2FkZWQiLCJNYXBDb21wb25lbnQiLCJtYXBDb250cm9scyIsInVpU3RhdGUiLCJlZGl0b3IiLCJib3R0b21NYXBTdHlsZSIsIm1hcFByb3BzIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwib25WaWV3cG9ydENoYW5nZSIsIl9vblZpZXdwb3J0Q2hhbmdlIiwidHJhbnNmb3JtUmVxdWVzdCIsImlzRWRpdCIsIm1hcERyYXciLCJhY3RpdmUiLCJoYXNHZW9jb2RlckxheWVyIiwiZmluZCIsImwiLCJkcmFnUm90YXRlIiwiaXNFeHBvcnQiLCJyZWFkT25seSIsInNjYWxlIiwiZ2VvY29kZXIiLCJsb2NhbGUiLCJ0b2dnbGVQZXJzcGVjdGl2ZSIsInRvZ2dsZVNwbGl0TWFwIiwiX2hhbmRsZU1hcFRvZ2dsZUxheWVyIiwiX3RvZ2dsZU1hcENvbnRyb2wiLCJzZXRFZGl0b3JNb2RlIiwic2V0TG9jYWxlIiwidG9nZ2xlRWRpdG9yVmlzaWJpbGl0eSIsIl9zZXRNYXBib3hNYXAiLCJ1bmRlZmluZWQiLCJvbk1vdXNlTW92ZSIsIl9yZW5kZXJEZWNrT3ZlcmxheSIsIl9yZW5kZXJNYXBib3hPdmVybGF5cyIsInBvbHlnb25GaWx0ZXJzIiwiZGVsZXRlRmVhdHVyZSIsInNldFNlbGVjdGVkRmVhdHVyZSIsInNldEZlYXR1cmVzIiwic2V0UG9seWdvbkZpbHRlckxheWVyIiwidmlzaWJsZSIsInRvcE1hcFN0eWxlIiwiX3JlbmRlck1hcFBvcG92ZXIiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwiYXJyYXlPZiIsImFueSIsImJvb2wiLCJvbk1hcFRvZ2dsZUxheWVyIiwiZnVuYyIsIm51bWJlciIsIk1hcGJveEdMTWFwIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQVMsR0FBRztBQUNoQkMsRUFBQUEsU0FBUyxFQUFFO0FBQ1RDLElBQUFBLE9BQU8sRUFBRSxjQURBO0FBRVRDLElBQUFBLFFBQVEsRUFBRTtBQUZELEdBREs7QUFLaEJDLEVBQUFBLEdBQUcsRUFBRTtBQUNIRCxJQUFBQSxRQUFRLEVBQUUsVUFEUDtBQUVIQyxJQUFBQSxHQUFHLEVBQUUsS0FGRjtBQUdIQyxJQUFBQSxhQUFhLEVBQUU7QUFIWjtBQUxXLENBQWxCO0FBWUEsSUFBTUMscUJBQXFCLEdBQUcsWUFBOUI7QUFDQSxJQUFNQyxlQUFlLEdBQUcsUUFBeEI7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxDQUE1Qjs7QUFFQSxJQUFNQyxXQUFXLEdBQUcsU0FBZEEsV0FBYztBQUFBLHNCQUNsQixnQ0FBQyxrQ0FBRCxxQkFDRTtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsaUNBRUU7QUFDRSxJQUFBLFNBQVMsRUFBQyxvQkFEWjtBQUVFLElBQUEsTUFBTSxFQUFDLFFBRlQ7QUFHRSxJQUFBLEdBQUcsRUFBQyxxQkFITjtBQUlFLElBQUEsSUFBSSxFQUFDLHlCQUpQO0FBS0Usa0JB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MkIsY0FBM0I7QUFFQSxTQUFPOUwsWUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gbGlicmFyaWVzXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgTWFwYm94R0xNYXAgZnJvbSAncmVhY3QtbWFwLWdsJztcbmltcG9ydCBEZWNrR0wgZnJvbSAnQGRlY2suZ2wvcmVhY3QnO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbi8vIGNvbXBvbmVudHNcbmltcG9ydCBNYXBQb3BvdmVyRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL21hcC9tYXAtcG9wb3Zlcic7XG5pbXBvcnQgTWFwQ29udHJvbEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9tYXAvbWFwLWNvbnRyb2wnO1xuaW1wb3J0IHtTdHlsZWRNYXBDb250YWluZXIsIFN0eWxlZEF0dHJidXRpb259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcblxuaW1wb3J0IEVkaXRvckZhY3RvcnkgZnJvbSAnLi9lZGl0b3IvZWRpdG9yJztcblxuLy8gdXRpbHNcbmltcG9ydCB7Z2VuZXJhdGVNYXBib3hMYXllcnMsIHVwZGF0ZU1hcGJveExheWVyc30gZnJvbSAnbGF5ZXJzL21hcGJveC11dGlscyc7XG5pbXBvcnQge09WRVJMQVlfVFlQRX0gZnJvbSAnbGF5ZXJzL2Jhc2UtbGF5ZXInO1xuaW1wb3J0IHtzZXRMYXllckJsZW5kaW5nfSBmcm9tICd1dGlscy9nbC11dGlscyc7XG5pbXBvcnQge3RyYW5zZm9ybVJlcXVlc3R9IGZyb20gJ3V0aWxzL21hcC1zdHlsZS11dGlscy9tYXBib3gtdXRpbHMnO1xuaW1wb3J0IHtnZXRMYXllckhvdmVyUHJvcH0gZnJvbSAndXRpbHMvbGF5ZXItdXRpbHMnO1xuXG4vLyBkZWZhdWx0LXNldHRpbmdzXG5pbXBvcnQgVGhyZWVEQnVpbGRpbmdMYXllciBmcm9tICdkZWNrZ2wtbGF5ZXJzLzNkLWJ1aWxkaW5nLWxheWVyLzNkLWJ1aWxkaW5nLWxheWVyJztcbmltcG9ydCB7RklMVEVSX1RZUEVTLCBHRU9DT0RFUl9MQVlFUl9JRH0gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuXG5jb25zdCBNQVBfU1RZTEUgPSB7XG4gIGNvbnRhaW5lcjoge1xuICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gIH0sXG4gIHRvcDoge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogJzBweCcsXG4gICAgcG9pbnRlckV2ZW50czogJ25vbmUnXG4gIH1cbn07XG5cbmNvbnN0IE1BUEJPWEdMX1NUWUxFX1VQREFURSA9ICdzdHlsZS5sb2FkJztcbmNvbnN0IE1BUEJPWEdMX1JFTkRFUiA9ICdyZW5kZXInO1xuY29uc3QgVFJBTlNJVElPTl9EVVJBVElPTiA9IDA7XG5cbmNvbnN0IEF0dHJpYnV0aW9uID0gKCkgPT4gKFxuICA8U3R5bGVkQXR0cmJ1dGlvbj5cbiAgICA8ZGl2IGNsYXNzTmFtZT1cImF0dHJpdGlvbi1sb2dvXCI+XG4gICAgICBCYXNlbWFwIGJ5OlxuICAgICAgPGFcbiAgICAgICAgY2xhc3NOYW1lPVwibWFwYm94Z2wtY3RybC1sb2dvXCJcbiAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgIGhyZWY9XCJodHRwczovL3d3dy5tYXBib3guY29tL1wiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJNYXBib3ggbG9nb1wiXG4gICAgICAvPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3NOYW1lPVwiYXR0cml0aW9uLWxpbmtcIj5cbiAgICAgIDxhIGhyZWY9XCJodHRwczovL2tlcGxlci5nbC9wb2xpY3kvXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiPlxuICAgICAgICDCqSBrZXBsZXIuZ2wgfHsnICd9XG4gICAgICA8L2E+XG4gICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cubWFwYm94LmNvbS9hYm91dC9tYXBzL1wiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5cbiAgICAgICAgwqkgTWFwYm94IHx7JyAnfVxuICAgICAgPC9hPlxuICAgICAgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiPlxuICAgICAgICDCqSBPcGVuU3RyZWV0TWFwIHx7JyAnfVxuICAgICAgPC9hPlxuICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwLWZlZWRiYWNrL1wiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5cbiAgICAgICAgPHN0cm9uZz5JbXByb3ZlIHRoaXMgbWFwPC9zdHJvbmc+XG4gICAgICA8L2E+XG4gICAgPC9kaXY+XG4gIDwvU3R5bGVkQXR0cmJ1dGlvbj5cbik7XG5cbk1hcENvbnRhaW5lckZhY3RvcnkuZGVwcyA9IFtNYXBQb3BvdmVyRmFjdG9yeSwgTWFwQ29udHJvbEZhY3RvcnksIEVkaXRvckZhY3RvcnldO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYXBDb250YWluZXJGYWN0b3J5KE1hcFBvcG92ZXIsIE1hcENvbnRyb2wsIEVkaXRvcikge1xuICBjbGFzcyBNYXBDb250YWluZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAvLyByZXF1aXJlZFxuICAgICAgZGF0YXNldHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICBpbnRlcmFjdGlvbkNvbmZpZzogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJCbGVuZGluZzogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJPcmRlcjogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyRGF0YTogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGZpbHRlcnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBtYXBTdGF0ZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwQ29udHJvbHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIHVpU3RhdGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIG1hcFN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBtb3VzZVBvczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIG1hcGJveEFwaVVybDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIHZpc1N0YXRlQWN0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwU3RhdGVBY3Rpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICB1aVN0YXRlQWN0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXG4gICAgICAvLyBvcHRpb25hbFxuICAgICAgcmVhZE9ubHk6IFByb3BUeXBlcy5ib29sLFxuICAgICAgaXNFeHBvcnQ6IFByb3BUeXBlcy5ib29sLFxuICAgICAgY2xpY2tlZDogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIGhvdmVySW5mbzogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIG1hcExheWVyczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIG9uTWFwVG9nZ2xlTGF5ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgb25NYXBTdHlsZUxvYWRlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICBvbk1hcFJlbmRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICBnZXRNYXBib3hSZWY6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgaW5kZXg6IFByb3BUeXBlcy5udW1iZXJcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgIE1hcENvbXBvbmVudDogTWFwYm94R0xNYXAsXG4gICAgICBkZWNrR2xQcm9wczoge30sXG4gICAgICBpbmRleDogMFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICB0aGlzLnByZXZpb3VzTGF5ZXJzID0ge1xuICAgICAgICAvLyBbbGF5ZXJzLmlkXTogbWFwYm94TGF5ZXJDb25maWdcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX2RlY2sgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgLy8gdW5iaW5kIG1hcGJveGdsIGV2ZW50IGxpc3RlbmVyXG4gICAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICAgIHRoaXMuX21hcC5vZmYoTUFQQk9YR0xfU1RZTEVfVVBEQVRFKTtcbiAgICAgICAgdGhpcy5fbWFwLm9mZihNQVBCT1hHTF9SRU5ERVIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxheWVyc1NlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMubGF5ZXJzO1xuICAgIGxheWVyRGF0YVNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMubGF5ZXJEYXRhO1xuICAgIG1hcExheWVyc1NlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMubWFwTGF5ZXJzO1xuICAgIGxheWVyT3JkZXJTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmxheWVyT3JkZXI7XG4gICAgbGF5ZXJzVG9SZW5kZXJTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy5sYXllcnNTZWxlY3RvcixcbiAgICAgIHRoaXMubGF5ZXJEYXRhU2VsZWN0b3IsXG4gICAgICB0aGlzLm1hcExheWVyc1NlbGVjdG9yLFxuICAgICAgLy8ge1tpZF06IHRydWUgXFwgZmFsc2V9XG4gICAgICAobGF5ZXJzLCBsYXllckRhdGEsIG1hcExheWVycykgPT5cbiAgICAgICAgbGF5ZXJzLnJlZHVjZShcbiAgICAgICAgICAoYWNjdSwgbGF5ZXIsIGlkeCkgPT4gKHtcbiAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICBbbGF5ZXIuaWRdOlxuICAgICAgICAgICAgICBsYXllci5pZCAhPT0gR0VPQ09ERVJfTEFZRVJfSUQgJiZcbiAgICAgICAgICAgICAgbGF5ZXIuc2hvdWxkUmVuZGVyTGF5ZXIobGF5ZXJEYXRhW2lkeF0pICYmXG4gICAgICAgICAgICAgIHRoaXMuX2lzVmlzaWJsZU1hcExheWVyKGxheWVyLCBtYXBMYXllcnMpXG4gICAgICAgICAgfSksXG4gICAgICAgICAge31cbiAgICAgICAgKVxuICAgICk7XG5cbiAgICBmaWx0ZXJzU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5maWx0ZXJzO1xuICAgIHBvbHlnb25GaWx0ZXJzID0gY3JlYXRlU2VsZWN0b3IodGhpcy5maWx0ZXJzU2VsZWN0b3IsIGZpbHRlcnMgPT5cbiAgICAgIGZpbHRlcnMuZmlsdGVyKGYgPT4gZi50eXBlID09PSBGSUxURVJfVFlQRVMucG9seWdvbilcbiAgICApO1xuXG4gICAgbWFwYm94TGF5ZXJzU2VsZWN0b3IgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgIHRoaXMubGF5ZXJzU2VsZWN0b3IsXG4gICAgICB0aGlzLmxheWVyRGF0YVNlbGVjdG9yLFxuICAgICAgdGhpcy5sYXllck9yZGVyU2VsZWN0b3IsXG4gICAgICB0aGlzLmxheWVyc1RvUmVuZGVyU2VsZWN0b3IsXG4gICAgICBnZW5lcmF0ZU1hcGJveExheWVyc1xuICAgICk7XG5cbiAgICAvKiBjb21wb25lbnQgcHJpdmF0ZSBmdW5jdGlvbnMgKi9cbiAgICBfaXNWaXNpYmxlTWFwTGF5ZXIobGF5ZXIsIG1hcExheWVycykge1xuICAgICAgLy8gaWYgbGF5ZXIuaWQgaXMgbm90IGluIG1hcExheWVycywgZG9uJ3QgcmVuZGVyIGl0XG4gICAgICByZXR1cm4gIW1hcExheWVycyB8fCAobWFwTGF5ZXJzICYmIG1hcExheWVyc1tsYXllci5pZF0pO1xuICAgIH1cblxuICAgIF9vbkNsb3NlTWFwUG9wb3ZlciA9ICgpID0+IHtcbiAgICAgIHRoaXMucHJvcHMudmlzU3RhdGVBY3Rpb25zLm9uTGF5ZXJDbGljayhudWxsKTtcbiAgICB9O1xuXG4gICAgX29uTGF5ZXJTZXREb21haW4gPSAoaWR4LCBjb2xvckRvbWFpbikgPT4ge1xuICAgICAgdGhpcy5wcm9wcy52aXNTdGF0ZUFjdGlvbnMubGF5ZXJDb25maWdDaGFuZ2UodGhpcy5wcm9wcy5sYXllcnNbaWR4XSwge1xuICAgICAgICBjb2xvckRvbWFpblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9oYW5kbGVNYXBUb2dnbGVMYXllciA9IGxheWVySWQgPT4ge1xuICAgICAgY29uc3Qge2luZGV4OiBtYXBJbmRleCA9IDAsIHZpc1N0YXRlQWN0aW9uc30gPSB0aGlzLnByb3BzO1xuICAgICAgdmlzU3RhdGVBY3Rpb25zLnRvZ2dsZUxheWVyRm9yTWFwKG1hcEluZGV4LCBsYXllcklkKTtcbiAgICB9O1xuXG4gICAgX29uTWFwYm94U3R5bGVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAvLyBmb3JjZSByZWZyZXNoIG1hcGJveGdsIGxheWVyc1xuICAgICAgdGhpcy5wcmV2aW91c0xheWVycyA9IHt9O1xuICAgICAgdGhpcy5fdXBkYXRlTWFwYm94TGF5ZXJzKCk7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5vbk1hcFN0eWxlTG9hZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25NYXBTdHlsZUxvYWRlZCh0aGlzLl9tYXApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfc2V0TWFwYm94TWFwID0gbWFwYm94ID0+IHtcbiAgICAgIGlmICghdGhpcy5fbWFwICYmIG1hcGJveCkge1xuICAgICAgICB0aGlzLl9tYXAgPSBtYXBib3guZ2V0TWFwKCk7XG4gICAgICAgIC8vIGkgbm90aWNlZCBpbiBjZXJ0YWluIGNvbnRleHQgd2UgZG9uJ3QgYWNjZXNzIHRoZSBhY3R1YWwgbWFwIGVsZW1lbnRcbiAgICAgICAgaWYgKCF0aGlzLl9tYXApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYmluZCBtYXBib3hnbCBldmVudCBsaXN0ZW5lclxuICAgICAgICB0aGlzLl9tYXAub24oTUFQQk9YR0xfU1RZTEVfVVBEQVRFLCB0aGlzLl9vbk1hcGJveFN0eWxlVXBkYXRlKTtcblxuICAgICAgICB0aGlzLl9tYXAub24oTUFQQk9YR0xfUkVOREVSLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uTWFwUmVuZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTWFwUmVuZGVyKHRoaXMuX21hcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMuZ2V0TWFwYm94UmVmKSB7XG4gICAgICAgIC8vIFRoZSBwYXJlbnQgY29tcG9uZW50IGNhbiBnYWluIGFjY2VzcyB0byBvdXIgTWFwYm94R2xNYXAgYnlcbiAgICAgICAgLy8gcHJvdmlkaW5nIHRoaXMgY2FsbGJhY2suIE5vdGUgdGhhdCAnbWFwYm94JyB3aWxsIGJlIG51bGwgd2hlbiB0aGVcbiAgICAgICAgLy8gcmVmIGlzIHVuc2V0IChlLmcuIHdoZW4gYSBzcGxpdCBtYXAgaXMgY2xvc2VkKS5cbiAgICAgICAgdGhpcy5wcm9wcy5nZXRNYXBib3hSZWYobWFwYm94LCB0aGlzLnByb3BzLmluZGV4KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uRGVja0luaXRpYWxpemVkKGdsKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkRlY2tJbml0aWFsaXplZCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uRGVja0luaXRpYWxpemVkKHRoaXMuX2RlY2ssIGdsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfb25CZWZvcmVSZW5kZXIgPSAoe2dsfSkgPT4ge1xuICAgICAgc2V0TGF5ZXJCbGVuZGluZyhnbCwgdGhpcy5wcm9wcy5sYXllckJsZW5kaW5nKTtcbiAgICB9O1xuXG4gICAgLyogY29tcG9uZW50IHJlbmRlciBmdW5jdGlvbnMgKi9cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgICBfcmVuZGVyTWFwUG9wb3ZlcihsYXllcnNUb1JlbmRlcikge1xuICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIGludG8gcmVkdWNlciBzbyBpdCBjYW4gYmUgdGVzdGVkXG4gICAgICBjb25zdCB7XG4gICAgICAgIG1hcFN0YXRlLFxuICAgICAgICBob3ZlckluZm8sXG4gICAgICAgIGNsaWNrZWQsXG4gICAgICAgIGRhdGFzZXRzLFxuICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgbGF5ZXJzLFxuICAgICAgICBtb3VzZVBvczoge21vdXNlUG9zaXRpb24sIGNvb3JkaW5hdGUsIHBpbm5lZH1cbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBpZiAoIW1vdXNlUG9zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBpZiBjbGlja2VkIHNvbWV0aGluZywgaWdub3JlIGhvdmVyIGJlaGF2aW9yXG4gICAgICBsZXQgbGF5ZXJIb3ZlclByb3AgPSBudWxsO1xuICAgICAgbGV0IGxheWVyUGlubmVkUHJvcCA9IG51bGw7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHt4OiBtb3VzZVBvc2l0aW9uWzBdLCB5OiBtb3VzZVBvc2l0aW9uWzFdfTtcbiAgICAgIGxldCBwaW5uZWRQb3NpdGlvbiA9IHt9O1xuXG4gICAgICBsYXllckhvdmVyUHJvcCA9IGdldExheWVySG92ZXJQcm9wKHtcbiAgICAgICAgaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICAgIGhvdmVySW5mbyxcbiAgICAgICAgbGF5ZXJzLFxuICAgICAgICBsYXllcnNUb1JlbmRlcixcbiAgICAgICAgZGF0YXNldHNcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBjb21wYXJlTW9kZSA9IGludGVyYWN0aW9uQ29uZmlnLnRvb2x0aXAuY29uZmlnXG4gICAgICAgID8gaW50ZXJhY3Rpb25Db25maWcudG9vbHRpcC5jb25maWcuY29tcGFyZU1vZGVcbiAgICAgICAgOiBmYWxzZTtcblxuICAgICAgY29uc3QgaGFzVG9vbHRpcCA9IHBpbm5lZCB8fCBjbGlja2VkO1xuICAgICAgY29uc3QgaGFzQ29tcGFyaXNvblRvb2x0aXAgPSBjb21wYXJlTW9kZSB8fCAoIWNsaWNrZWQgJiYgIXBpbm5lZCk7XG5cbiAgICAgIGlmIChoYXNUb29sdGlwKSB7XG4gICAgICAgIC8vIHByb2plY3QgbG5nbGF0IHRvIHNjcmVlbiBzbyB0aGF0IHRvb2x0aXAgZm9sbG93cyB0aGUgb2JqZWN0IG9uIHpvb21cbiAgICAgICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydChtYXBTdGF0ZSk7XG4gICAgICAgIGNvbnN0IGxuZ0xhdCA9IGNsaWNrZWQgPyBjbGlja2VkLmxuZ0xhdCA6IHBpbm5lZC5jb29yZGluYXRlO1xuICAgICAgICBwaW5uZWRQb3NpdGlvbiA9IHRoaXMuX2dldEhvdmVyWFkodmlld3BvcnQsIGxuZ0xhdCk7XG4gICAgICAgIGxheWVyUGlubmVkUHJvcCA9IGdldExheWVySG92ZXJQcm9wKHtcbiAgICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgICBob3ZlckluZm86IGNsaWNrZWQsXG4gICAgICAgICAgbGF5ZXJzLFxuICAgICAgICAgIGxheWVyc1RvUmVuZGVyLFxuICAgICAgICAgIGRhdGFzZXRzXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAobGF5ZXJIb3ZlclByb3ApIHtcbiAgICAgICAgICBsYXllckhvdmVyUHJvcC5wcmltYXJ5RGF0YSA9IGxheWVyUGlubmVkUHJvcC5kYXRhO1xuICAgICAgICAgIGxheWVySG92ZXJQcm9wLmNvbXBhcmVUeXBlID0gaW50ZXJhY3Rpb25Db25maWcudG9vbHRpcC5jb25maWcuY29tcGFyZVR5cGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbW1vblByb3AgPSB7XG4gICAgICAgIG9uQ2xvc2U6IHRoaXMuX29uQ2xvc2VNYXBQb3BvdmVyLFxuICAgICAgICBtYXBXOiBtYXBTdGF0ZS53aWR0aCxcbiAgICAgICAgbWFwSDogbWFwU3RhdGUuaGVpZ2h0LFxuICAgICAgICB6b29tOiBtYXBTdGF0ZS56b29tXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIHtoYXNUb29sdGlwICYmIChcbiAgICAgICAgICAgIDxNYXBQb3BvdmVyXG4gICAgICAgICAgICAgIHsuLi5waW5uZWRQb3NpdGlvbn1cbiAgICAgICAgICAgICAgey4uLmNvbW1vblByb3B9XG4gICAgICAgICAgICAgIGxheWVySG92ZXJQcm9wPXtsYXllclBpbm5lZFByb3B9XG4gICAgICAgICAgICAgIGNvb3JkaW5hdGU9e2ludGVyYWN0aW9uQ29uZmlnLmNvb3JkaW5hdGUuZW5hYmxlZCAmJiAocGlubmVkIHx8IHt9KS5jb29yZGluYXRlfVxuICAgICAgICAgICAgICBmcm96ZW49e0Jvb2xlYW4oaGFzVG9vbHRpcCl9XG4gICAgICAgICAgICAgIGlzQmFzZT17Y29tcGFyZU1vZGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAge2hhc0NvbXBhcmlzb25Ub29sdGlwICYmIChcbiAgICAgICAgICAgIDxNYXBQb3BvdmVyXG4gICAgICAgICAgICAgIHsuLi5wb3NpdGlvbn1cbiAgICAgICAgICAgICAgey4uLmNvbW1vblByb3B9XG4gICAgICAgICAgICAgIGxheWVySG92ZXJQcm9wPXtsYXllckhvdmVyUHJvcH1cbiAgICAgICAgICAgICAgY29vcmRpbmF0ZT17aW50ZXJhY3Rpb25Db25maWcuY29vcmRpbmF0ZS5lbmFibGVkICYmIGNvb3JkaW5hdGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAgIF9nZXRIb3ZlclhZKHZpZXdwb3J0LCBsbmdMYXQpIHtcbiAgICAgIGNvbnN0IHNjcmVlbkNvb3JkID0gIXZpZXdwb3J0IHx8ICFsbmdMYXQgPyBudWxsIDogdmlld3BvcnQucHJvamVjdChsbmdMYXQpO1xuICAgICAgcmV0dXJuIHNjcmVlbkNvb3JkICYmIHt4OiBzY3JlZW5Db29yZFswXSwgeTogc2NyZWVuQ29vcmRbMV19O1xuICAgIH1cblxuICAgIF9yZW5kZXJMYXllciA9IChvdmVybGF5cywgaWR4KSA9PiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRhdGFzZXRzLFxuICAgICAgICBsYXllcnMsXG4gICAgICAgIGxheWVyRGF0YSxcbiAgICAgICAgaG92ZXJJbmZvLFxuICAgICAgICBjbGlja2VkLFxuICAgICAgICBtYXBTdGF0ZSxcbiAgICAgICAgaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICAgIGFuaW1hdGlvbkNvbmZpZ1xuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBsYXllciA9IGxheWVyc1tpZHhdO1xuICAgICAgY29uc3QgZGF0YSA9IGxheWVyRGF0YVtpZHhdO1xuICAgICAgY29uc3Qge2dwdUZpbHRlcn0gPSBkYXRhc2V0c1tsYXllci5jb25maWcuZGF0YUlkXSB8fCB7fTtcblxuICAgICAgY29uc3Qgb2JqZWN0SG92ZXJlZCA9IGNsaWNrZWQgfHwgaG92ZXJJbmZvO1xuICAgICAgY29uc3QgbGF5ZXJDYWxsYmFja3MgPSB7XG4gICAgICAgIG9uU2V0TGF5ZXJEb21haW46IHZhbCA9PiB0aGlzLl9vbkxheWVyU2V0RG9tYWluKGlkeCwgdmFsKVxuICAgICAgfTtcblxuICAgICAgLy8gTGF5ZXIgaXMgTGF5ZXIgY2xhc3NcbiAgICAgIGNvbnN0IGxheWVyT3ZlcmxheSA9IGxheWVyLnJlbmRlckxheWVyKHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZ3B1RmlsdGVyLFxuICAgICAgICBpZHgsXG4gICAgICAgIGludGVyYWN0aW9uQ29uZmlnLFxuICAgICAgICBsYXllckNhbGxiYWNrcyxcbiAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgIGFuaW1hdGlvbkNvbmZpZyxcbiAgICAgICAgb2JqZWN0SG92ZXJlZFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBvdmVybGF5cy5jb25jYXQobGF5ZXJPdmVybGF5IHx8IFtdKTtcbiAgICB9O1xuXG4gICAgX3JlbmRlckRlY2tPdmVybGF5KGxheWVyc1RvUmVuZGVyKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIG1hcFN0YXRlLFxuICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgbGF5ZXJEYXRhLFxuICAgICAgICBsYXllck9yZGVyLFxuICAgICAgICBsYXllcnMsXG4gICAgICAgIHZpc1N0YXRlQWN0aW9ucyxcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGxldCBkZWNrR2xMYXllcnMgPSBbXTtcbiAgICAgIC8vIHdhaXQgdW50aWwgZGF0YSBpcyByZWFkeSBiZWZvcmUgcmVuZGVyIGRhdGEgbGF5ZXJzXG4gICAgICBpZiAobGF5ZXJEYXRhICYmIGxheWVyRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgLy8gbGFzdCBsYXllciByZW5kZXIgZmlyc3RcbiAgICAgICAgZGVja0dsTGF5ZXJzID0gbGF5ZXJPcmRlclxuICAgICAgICAgIC5zbGljZSgpXG4gICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICBpZHggPT4gbGF5ZXJzW2lkeF0ub3ZlcmxheVR5cGUgPT09IE9WRVJMQVlfVFlQRS5kZWNrZ2wgJiYgbGF5ZXJzVG9SZW5kZXJbbGF5ZXJzW2lkeF0uaWRdXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZWR1Y2UodGhpcy5fcmVuZGVyTGF5ZXIsIFtdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1hcFN0eWxlLnZpc2libGVMYXllckdyb3Vwc1snM2QgYnVpbGRpbmcnXSkge1xuICAgICAgICBkZWNrR2xMYXllcnMucHVzaChcbiAgICAgICAgICBuZXcgVGhyZWVEQnVpbGRpbmdMYXllcih7XG4gICAgICAgICAgICBpZDogJ19rZXBsZXJnbF8zZC1idWlsZGluZycsXG4gICAgICAgICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgIG1hcGJveEFwaVVybCxcbiAgICAgICAgICAgIHRocmVlREJ1aWxkaW5nQ29sb3I6IG1hcFN0eWxlLnRocmVlREJ1aWxkaW5nQ29sb3IsXG4gICAgICAgICAgICB1cGRhdGVUcmlnZ2Vyczoge1xuICAgICAgICAgICAgICBnZXRGaWxsQ29sb3I6IG1hcFN0eWxlLnRocmVlREJ1aWxkaW5nQ29sb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8RGVja0dMXG4gICAgICAgICAgey4uLnRoaXMucHJvcHMuZGVja0dsUHJvcHN9XG4gICAgICAgICAgdmlld1N0YXRlPXttYXBTdGF0ZX1cbiAgICAgICAgICBpZD1cImRlZmF1bHQtZGVja2dsLW92ZXJsYXlcIlxuICAgICAgICAgIGxheWVycz17ZGVja0dsTGF5ZXJzfVxuICAgICAgICAgIG9uQmVmb3JlUmVuZGVyPXt0aGlzLl9vbkJlZm9yZVJlbmRlcn1cbiAgICAgICAgICBvbkhvdmVyPXt2aXNTdGF0ZUFjdGlvbnMub25MYXllckhvdmVyfVxuICAgICAgICAgIG9uQ2xpY2s9e3Zpc1N0YXRlQWN0aW9ucy5vbkxheWVyQ2xpY2t9XG4gICAgICAgICAgcmVmPXtjb21wID0+IHtcbiAgICAgICAgICAgIGlmIChjb21wICYmIGNvbXAuZGVjayAmJiAhdGhpcy5fZGVjaykge1xuICAgICAgICAgICAgICB0aGlzLl9kZWNrID0gY29tcC5kZWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgICAgb25XZWJHTEluaXRpYWxpemVkPXtnbCA9PiB0aGlzLl9vbkRlY2tJbml0aWFsaXplZChnbCl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIF91cGRhdGVNYXBib3hMYXllcnMoKSB7XG4gICAgICBjb25zdCBtYXBib3hMYXllcnMgPSB0aGlzLm1hcGJveExheWVyc1NlbGVjdG9yKHRoaXMucHJvcHMpO1xuICAgICAgaWYgKCFPYmplY3Qua2V5cyhtYXBib3hMYXllcnMpLmxlbmd0aCAmJiAhT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0xheWVycykubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlTWFwYm94TGF5ZXJzKHRoaXMuX21hcCwgbWFwYm94TGF5ZXJzLCB0aGlzLnByZXZpb3VzTGF5ZXJzKTtcblxuICAgICAgdGhpcy5wcmV2aW91c0xheWVycyA9IG1hcGJveExheWVycztcbiAgICB9XG5cbiAgICBfcmVuZGVyTWFwYm94T3ZlcmxheXMoKSB7XG4gICAgICBpZiAodGhpcy5fbWFwICYmIHRoaXMuX21hcC5pc1N0eWxlTG9hZGVkKCkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTWFwYm94TGF5ZXJzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX29uVmlld3BvcnRDaGFuZ2UgPSB2aWV3U3RhdGUgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uVmlld1N0YXRlQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25WaWV3U3RhdGVDaGFuZ2Uodmlld1N0YXRlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvcHMubWFwU3RhdGVBY3Rpb25zLnVwZGF0ZU1hcCh2aWV3U3RhdGUpO1xuICAgIH07XG5cbiAgICBfdG9nZ2xlTWFwQ29udHJvbCA9IHBhbmVsSWQgPT4ge1xuICAgICAgY29uc3Qge2luZGV4LCB1aVN0YXRlQWN0aW9uc30gPSB0aGlzLnByb3BzO1xuXG4gICAgICB1aVN0YXRlQWN0aW9ucy50b2dnbGVNYXBDb250cm9sKHBhbmVsSWQsIGluZGV4KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBtYXBTdGF0ZSxcbiAgICAgICAgbWFwU3R5bGUsXG4gICAgICAgIG1hcFN0YXRlQWN0aW9ucyxcbiAgICAgICAgbWFwTGF5ZXJzLFxuICAgICAgICBsYXllcnMsXG4gICAgICAgIE1hcENvbXBvbmVudCxcbiAgICAgICAgZGF0YXNldHMsXG4gICAgICAgIG1hcGJveEFwaUFjY2Vzc1Rva2VuLFxuICAgICAgICBtYXBib3hBcGlVcmwsXG4gICAgICAgIG1hcENvbnRyb2xzLFxuICAgICAgICB1aVN0YXRlLFxuICAgICAgICB1aVN0YXRlQWN0aW9ucyxcbiAgICAgICAgdmlzU3RhdGVBY3Rpb25zLFxuICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgZWRpdG9yLFxuICAgICAgICBpbmRleFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGNvbnN0IGxheWVyc1RvUmVuZGVyID0gdGhpcy5sYXllcnNUb1JlbmRlclNlbGVjdG9yKHRoaXMucHJvcHMpO1xuXG4gICAgICBpZiAoIW1hcFN0eWxlLmJvdHRvbU1hcFN0eWxlKSB7XG4gICAgICAgIC8vIHN0eWxlIG5vdCB5ZXQgbG9hZGVkXG4gICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXBQcm9wcyA9IHtcbiAgICAgICAgLi4ubWFwU3RhdGUsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZSxcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybCxcbiAgICAgICAgb25WaWV3cG9ydENoYW5nZTogdGhpcy5fb25WaWV3cG9ydENoYW5nZSxcbiAgICAgICAgdHJhbnNmb3JtUmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgY29uc3QgaXNFZGl0ID0gdWlTdGF0ZS5tYXBDb250cm9scy5tYXBEcmF3LmFjdGl2ZTtcbiAgICAgIGNvbnN0IGhhc0dlb2NvZGVyTGF5ZXIgPSBsYXllcnMuZmluZChsID0+IGwuaWQgPT09IEdFT0NPREVSX0xBWUVSX0lEKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZE1hcENvbnRhaW5lciBzdHlsZT17TUFQX1NUWUxFLmNvbnRhaW5lcn0+XG4gICAgICAgICAgPE1hcENvbnRyb2xcbiAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgIGRyYWdSb3RhdGU9e21hcFN0YXRlLmRyYWdSb3RhdGV9XG4gICAgICAgICAgICBpc1NwbGl0PXtCb29sZWFuKG1hcExheWVycyl9XG4gICAgICAgICAgICBpc0V4cG9ydD17dGhpcy5wcm9wcy5pc0V4cG9ydH1cbiAgICAgICAgICAgIGxheWVycz17bGF5ZXJzfVxuICAgICAgICAgICAgbGF5ZXJzVG9SZW5kZXI9e2xheWVyc1RvUmVuZGVyfVxuICAgICAgICAgICAgbWFwSW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgbWFwQ29udHJvbHM9e21hcENvbnRyb2xzfVxuICAgICAgICAgICAgcmVhZE9ubHk9e3RoaXMucHJvcHMucmVhZE9ubHl9XG4gICAgICAgICAgICBzY2FsZT17bWFwU3RhdGUuc2NhbGUgfHwgMX1cbiAgICAgICAgICAgIHRvcD17aW50ZXJhY3Rpb25Db25maWcuZ2VvY29kZXIgJiYgaW50ZXJhY3Rpb25Db25maWcuZ2VvY29kZXIuZW5hYmxlZCA/IDUyIDogMH1cbiAgICAgICAgICAgIGVkaXRvcj17ZWRpdG9yfVxuICAgICAgICAgICAgbG9jYWxlPXt1aVN0YXRlLmxvY2FsZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlUGVyc3BlY3RpdmU9e21hcFN0YXRlQWN0aW9ucy50b2dnbGVQZXJzcGVjdGl2ZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlU3BsaXRNYXA9e21hcFN0YXRlQWN0aW9ucy50b2dnbGVTcGxpdE1hcH1cbiAgICAgICAgICAgIG9uTWFwVG9nZ2xlTGF5ZXI9e3RoaXMuX2hhbmRsZU1hcFRvZ2dsZUxheWVyfVxuICAgICAgICAgICAgb25Ub2dnbGVNYXBDb250cm9sPXt0aGlzLl90b2dnbGVNYXBDb250cm9sfVxuICAgICAgICAgICAgb25TZXRFZGl0b3JNb2RlPXt2aXNTdGF0ZUFjdGlvbnMuc2V0RWRpdG9yTW9kZX1cbiAgICAgICAgICAgIG9uU2V0TG9jYWxlPXt1aVN0YXRlQWN0aW9ucy5zZXRMb2NhbGV9XG4gICAgICAgICAgICBvblRvZ2dsZUVkaXRvclZpc2liaWxpdHk9e3Zpc1N0YXRlQWN0aW9ucy50b2dnbGVFZGl0b3JWaXNpYmlsaXR5fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPE1hcENvbXBvbmVudFxuICAgICAgICAgICAgey4uLm1hcFByb3BzfVxuICAgICAgICAgICAga2V5PVwiYm90dG9tXCJcbiAgICAgICAgICAgIHJlZj17dGhpcy5fc2V0TWFwYm94TWFwfVxuICAgICAgICAgICAgbWFwU3R5bGU9e21hcFN0eWxlLmJvdHRvbU1hcFN0eWxlfVxuICAgICAgICAgICAgZ2V0Q3Vyc29yPXt0aGlzLnByb3BzLmhvdmVySW5mbyA/ICgpID0+ICdwb2ludGVyJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbj17VFJBTlNJVElPTl9EVVJBVElPTn1cbiAgICAgICAgICAgIG9uTW91c2VNb3ZlPXt0aGlzLnByb3BzLnZpc1N0YXRlQWN0aW9ucy5vbk1vdXNlTW92ZX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGhpcy5fcmVuZGVyRGVja092ZXJsYXkobGF5ZXJzVG9SZW5kZXIpfVxuICAgICAgICAgICAge3RoaXMuX3JlbmRlck1hcGJveE92ZXJsYXlzKGxheWVyc1RvUmVuZGVyKX1cbiAgICAgICAgICAgIDxFZGl0b3JcbiAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICBkYXRhc2V0cz17ZGF0YXNldHN9XG4gICAgICAgICAgICAgIGVkaXRvcj17ZWRpdG9yfVxuICAgICAgICAgICAgICBmaWx0ZXJzPXt0aGlzLnBvbHlnb25GaWx0ZXJzKHRoaXMucHJvcHMpfVxuICAgICAgICAgICAgICBpc0VuYWJsZWQ9e2lzRWRpdH1cbiAgICAgICAgICAgICAgbGF5ZXJzPXtsYXllcnN9XG4gICAgICAgICAgICAgIGxheWVyc1RvUmVuZGVyPXtsYXllcnNUb1JlbmRlcn1cbiAgICAgICAgICAgICAgb25EZWxldGVGZWF0dXJlPXt2aXNTdGF0ZUFjdGlvbnMuZGVsZXRlRmVhdHVyZX1cbiAgICAgICAgICAgICAgb25TZWxlY3Q9e3Zpc1N0YXRlQWN0aW9ucy5zZXRTZWxlY3RlZEZlYXR1cmV9XG4gICAgICAgICAgICAgIG9uVXBkYXRlPXt2aXNTdGF0ZUFjdGlvbnMuc2V0RmVhdHVyZXN9XG4gICAgICAgICAgICAgIG9uVG9nZ2xlUG9seWdvbkZpbHRlcj17dmlzU3RhdGVBY3Rpb25zLnNldFBvbHlnb25GaWx0ZXJMYXllcn1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBpc0VkaXQgPyAnYWxsJyA6ICdub25lJyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBlZGl0b3IudmlzaWJsZSA/ICdibG9jaycgOiAnbm9uZSdcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9NYXBDb21wb25lbnQ+XG4gICAgICAgICAge21hcFN0eWxlLnRvcE1hcFN0eWxlIHx8IGhhc0dlb2NvZGVyTGF5ZXIgPyAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtNQVBfU1RZTEUudG9wfT5cbiAgICAgICAgICAgICAgPE1hcENvbXBvbmVudCB7Li4ubWFwUHJvcHN9IGtleT1cInRvcFwiIG1hcFN0eWxlPXttYXBTdHlsZS50b3BNYXBTdHlsZX0+XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckRlY2tPdmVybGF5KHtbR0VPQ09ERVJfTEFZRVJfSURdOiB0cnVlfSl9XG4gICAgICAgICAgICAgIDwvTWFwQ29tcG9uZW50PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3RoaXMuX3JlbmRlck1hcFBvcG92ZXIobGF5ZXJzVG9SZW5kZXIpfVxuICAgICAgICAgIDxBdHRyaWJ1dGlvbiAvPlxuICAgICAgICA8L1N0eWxlZE1hcENvbnRhaW5lcj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgTWFwQ29udGFpbmVyLmRpc3BsYXlOYW1lID0gJ01hcENvbnRhaW5lcic7XG5cbiAgcmV0dXJuIE1hcENvbnRhaW5lcjtcbn1cbiJdfQ==