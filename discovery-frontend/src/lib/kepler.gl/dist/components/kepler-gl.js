"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _window = require("global/window");

var _redux = require("redux");

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _reselect = require("reselect");

var _keplerglConnect = require("../connect/keplergl-connect");

var _reactIntl = require("react-intl");

var _localization = require("../localization");

var _context = require("./context");

var VisStateActions = _interopRequireWildcard(require("../actions/vis-state-actions"));

var MapStateActions = _interopRequireWildcard(require("../actions/map-state-actions"));

var MapStyleActions = _interopRequireWildcard(require("../actions/map-style-actions"));

var UIStateActions = _interopRequireWildcard(require("../actions/ui-state-actions"));

var ProviderActions = _interopRequireWildcard(require("../actions/provider-actions"));

var _defaultSettings = require("../constants/default-settings");

var _userFeedbacks = require("../constants/user-feedbacks");

var _sidePanel = _interopRequireDefault(require("./side-panel"));

var _mapContainer = _interopRequireDefault(require("./map-container"));

var _bottomWidget = _interopRequireDefault(require("./bottom-widget"));

var _modalContainer = _interopRequireDefault(require("./modal-container"));

var _plotContainer = _interopRequireDefault(require("./plot-container"));

var _notificationPanel = _interopRequireDefault(require("./notification-panel"));

var _geocoderPanel = _interopRequireDefault(require("./geocoder-panel"));

var _utils = require("../utils/utils");

var _mapboxUtils = require("../utils/mapbox-utils");

var _localeUtils = require("../utils/locale-utils");

var _base = require("../styles/base");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-family: ", ";\n  font-weight: ", ";\n  font-size: ", ";\n  line-height: ", ";\n\n  *,\n  *:before,\n  *:after {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n\n  ul {\n    margin: 0;\n    padding: 0;\n  }\n\n  li {\n    margin: 0;\n  }\n\n  a {\n    text-decoration: none;\n    color: ", ";\n  }\n\n  .mapboxgl-ctrl .mapboxgl-ctrl-logo {\n    display: none;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

// Maybe we should think about exporting this or creating a variable
// as part of the base.js theme
var GlobalStyle = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.fontFamily;
}, function (props) {
  return props.theme.fontWeight;
}, function (props) {
  return props.theme.fontSize;
}, function (props) {
  return props.theme.lineHeight;
}, function (props) {
  return props.theme.labelColor;
});

KeplerGlFactory.deps = [_bottomWidget["default"], _geocoderPanel["default"], _mapContainer["default"], _modalContainer["default"], _sidePanel["default"], _plotContainer["default"], _notificationPanel["default"]];

function KeplerGlFactory(BottomWidget, GeoCoderPanel, MapContainer, ModalContainer, SidePanel, PlotContainer, NotificationPanel) {
  /** @typedef {import('./kepler-gl').KeplerGlProps} KeplerGlProps */

  /** @augments React.Component<KeplerGlProps> */
  var KeplerGL = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(KeplerGL, _Component);

    var _super = _createSuper(KeplerGL);

    function KeplerGL() {
      var _this;

      (0, _classCallCheck2["default"])(this, KeplerGL);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "root", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "themeSelector", function (props) {
        return props.theme;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "availableThemeSelector", (0, _reselect.createSelector)(_this.themeSelector, function (theme) {
        return (0, _typeof2["default"])(theme) === 'object' ? _objectSpread(_objectSpread({}, _base.theme), theme) : theme === _defaultSettings.THEME.light ? _base.themeLT : theme === _defaultSettings.THEME.base ? _base.themeBS : theme;
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "availableProviders", (0, _reselect.createSelector)(function (props) {
        return props.cloudProviders;
      }, function (providers) {
        return Array.isArray(providers) && providers.length ? {
          hasStorage: providers.some(function (p) {
            return p.hasPrivateStorage();
          }),
          hasShare: providers.some(function (p) {
            return p.hasSharingUrl();
          })
        } : {};
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "localeMessagesSelector", (0, _reselect.createSelector)(function (props) {
        return props.localeMessages;
      }, function (customMessages) {
        return customMessages ? (0, _localeUtils.mergeMessages)(_localization.messages, customMessages) : _localization.messages;
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_loadMapStyle", function () {
        var defaultStyles = Object.values(_this.props.mapStyle.mapStyles); // add id to custom map styles if not given

        var customStyles = (_this.props.mapStyles || []).map(function (ms) {
          return _objectSpread(_objectSpread({}, ms), {}, {
            id: ms.id || (0, _utils.generateHashId)()
          });
        });
        var allStyles = [].concat((0, _toConsumableArray2["default"])(customStyles), (0, _toConsumableArray2["default"])(defaultStyles)).reduce(function (accu, style) {
          var hasStyleObject = style.style && (0, _typeof2["default"])(style.style) === 'object';
          accu[hasStyleObject ? 'toLoad' : 'toRequest'][style.id] = style;
          return accu;
        }, {
          toLoad: {},
          toRequest: {}
        });

        _this.props.mapStyleActions.loadMapStyles(allStyles.toLoad);

        _this.props.mapStyleActions.requestMapStyles(allStyles.toRequest);
      });
      return _this;
    }

    (0, _createClass2["default"])(KeplerGL, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._validateMapboxToken();

        this._loadMapStyle(this.props.mapStyles);

        this._handleResize(this.props);
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if ( // if dimension props has changed
        this.props.height !== prevProps.height || this.props.width !== prevProps.width || // react-map-gl will dispatch updateViewport after this._handleResize is called
        // here we check if this.props.mapState.height is sync with props.height
        this.props.height !== this.props.mapState.height) {
          this._handleResize(this.props);
        }
      }
    }, {
      key: "_validateMapboxToken",

      /* private methods */
      value: function _validateMapboxToken() {
        var mapboxApiAccessToken = this.props.mapboxApiAccessToken;

        if (!(0, _mapboxUtils.validateToken)(mapboxApiAccessToken)) {
          _window.console.warn(_userFeedbacks.MISSING_MAPBOX_TOKEN);
        }
      }
    }, {
      key: "_handleResize",
      value: function _handleResize(_ref) {
        var width = _ref.width,
            height = _ref.height;

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
          _window.console.warn('width and height is required');

          return;
        }

        this.props.mapStateActions.updateMap({
          width: width / (1 + Number(this.props.mapState.isSplit)),
          height: height
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            id = _this$props.id,
            appName = _this$props.appName,
            version = _this$props.version,
            appWebsite = _this$props.appWebsite,
            onSaveMap = _this$props.onSaveMap,
            onViewStateChange = _this$props.onViewStateChange,
            onDeckInitialized = _this$props.onDeckInitialized,
            width = _this$props.width,
            height = _this$props.height,
            mapboxApiAccessToken = _this$props.mapboxApiAccessToken,
            mapboxApiUrl = _this$props.mapboxApiUrl,
            getMapboxRef = _this$props.getMapboxRef,
            deckGlProps = _this$props.deckGlProps,
            mapStyle = _this$props.mapStyle,
            mapState = _this$props.mapState,
            uiState = _this$props.uiState,
            visState = _this$props.visState,
            providerState = _this$props.providerState,
            visStateActions = _this$props.visStateActions,
            mapStateActions = _this$props.mapStateActions,
            mapStyleActions = _this$props.mapStyleActions,
            uiStateActions = _this$props.uiStateActions,
            providerActions = _this$props.providerActions,
            readOnly = _this$props.readOnly;
        var availableProviders = this.availableProviders(this.props);
        var filters = visState.filters,
            layers = visState.layers,
            splitMaps = visState.splitMaps,
            layerOrder = visState.layerOrder,
            layerBlending = visState.layerBlending,
            layerClasses = visState.layerClasses,
            interactionConfig = visState.interactionConfig,
            datasets = visState.datasets,
            layerData = visState.layerData,
            hoverInfo = visState.hoverInfo,
            clicked = visState.clicked,
            mousePos = visState.mousePos,
            animationConfig = visState.animationConfig,
            mapInfo = visState.mapInfo;
        var notificationPanelFields = {
          removeNotification: uiStateActions.removeNotification,
          notifications: uiState.notifications
        };
        var sideFields = {
          appName: appName,
          version: version,
          appWebsite: appWebsite,
          datasets: datasets,
          filters: filters,
          layers: layers,
          layerOrder: layerOrder,
          layerClasses: layerClasses,
          interactionConfig: interactionConfig,
          mapStyle: mapStyle,
          mapInfo: mapInfo,
          layerBlending: layerBlending,
          onSaveMap: onSaveMap,
          uiState: uiState,
          mapStyleActions: mapStyleActions,
          visStateActions: visStateActions,
          uiStateActions: uiStateActions,
          width: this.props.sidePanelWidth,
          availableProviders: availableProviders,
          mapSaved: providerState.mapSaved
        };
        var mapFields = {
          datasets: datasets,
          getMapboxRef: getMapboxRef,
          mapboxApiAccessToken: mapboxApiAccessToken,
          mapboxApiUrl: mapboxApiUrl,
          mapState: mapState,
          uiState: uiState,
          editor: visState.editor,
          mapStyle: mapStyle,
          mapControls: uiState.mapControls,
          layers: layers,
          layerOrder: layerOrder,
          layerData: layerData,
          layerBlending: layerBlending,
          filters: filters,
          interactionConfig: interactionConfig,
          hoverInfo: hoverInfo,
          clicked: clicked,
          mousePos: mousePos,
          readOnly: uiState.readOnly,
          onDeckInitialized: onDeckInitialized,
          onViewStateChange: onViewStateChange,
          uiStateActions: uiStateActions,
          visStateActions: visStateActions,
          mapStateActions: mapStateActions,
          animationConfig: animationConfig,
          deckGlProps: deckGlProps
        };
        var isSplit = splitMaps && splitMaps.length > 1;
        var containerW = mapState.width * (Number(isSplit) + 1);
        var mapContainers = !isSplit ? [/*#__PURE__*/_react["default"].createElement(MapContainer, (0, _extends2["default"])({
          key: 0,
          index: 0
        }, mapFields, {
          mapLayers: null
        }))] : splitMaps.map(function (settings, index) {
          return /*#__PURE__*/_react["default"].createElement(MapContainer, (0, _extends2["default"])({
            key: index,
            index: index
          }, mapFields, {
            mapLayers: splitMaps[index].layers
          }));
        });
        var isExportingImage = uiState.exportImage.exporting;
        var theme = this.availableThemeSelector(this.props);
        var localeMessages = this.localeMessagesSelector(this.props);
        return /*#__PURE__*/_react["default"].createElement(_context.RootContext.Provider, {
          value: this.root
        }, /*#__PURE__*/_react["default"].createElement(_reactIntl.IntlProvider, {
          locale: uiState.locale,
          messages: localeMessages[uiState.locale]
        }, /*#__PURE__*/_react["default"].createElement(_styledComponents.ThemeProvider, {
          theme: theme
        }, /*#__PURE__*/_react["default"].createElement(GlobalStyle, {
          width: width,
          height: height,
          className: "kepler-gl",
          id: "kepler-gl__".concat(id),
          ref: this.root
        }, /*#__PURE__*/_react["default"].createElement(NotificationPanel, notificationPanelFields), !uiState.readOnly && !readOnly && /*#__PURE__*/_react["default"].createElement(SidePanel, sideFields), /*#__PURE__*/_react["default"].createElement("div", {
          className: "maps",
          style: {
            display: 'flex'
          }
        }, mapContainers), isExportingImage && /*#__PURE__*/_react["default"].createElement(PlotContainer, {
          width: width,
          height: height,
          exportImageSetting: uiState.exportImage,
          mapFields: mapFields,
          addNotification: uiStateActions.addNotification,
          setExportImageSetting: uiStateActions.setExportImageSetting,
          setExportImageDataUri: uiStateActions.setExportImageDataUri,
          setExportImageError: uiStateActions.setExportImageError,
          splitMaps: splitMaps
        }), interactionConfig.geocoder.enabled && /*#__PURE__*/_react["default"].createElement(GeoCoderPanel, {
          isGeocoderEnabled: interactionConfig.geocoder.enabled,
          mapboxApiAccessToken: mapboxApiAccessToken,
          mapState: mapState,
          updateVisData: visStateActions.updateVisData,
          removeDataset: visStateActions.removeDataset,
          updateMap: mapStateActions.updateMap
        }), /*#__PURE__*/_react["default"].createElement(BottomWidget, {
          filters: filters,
          datasets: datasets,
          uiState: uiState,
          layers: layers,
          animationConfig: animationConfig,
          visStateActions: visStateActions,
          sidePanelWidth: uiState.readOnly ? 0 : this.props.sidePanelWidth + theme.sidePanel.margin.left,
          containerW: containerW
        }), /*#__PURE__*/_react["default"].createElement(ModalContainer, {
          mapStyle: mapStyle,
          visState: visState,
          mapState: mapState,
          uiState: uiState,
          mapboxApiAccessToken: mapboxApiAccessToken,
          mapboxApiUrl: mapboxApiUrl,
          visStateActions: visStateActions,
          uiStateActions: uiStateActions,
          mapStyleActions: mapStyleActions,
          providerActions: providerActions,
          rootNode: this.root.current,
          containerW: containerW,
          containerH: mapState.height,
          providerState: this.props.providerState // User defined cloud provider props
          ,
          cloudProviders: this.props.cloudProviders,
          onExportToCloudSuccess: this.props.onExportToCloudSuccess,
          onLoadCloudMapSuccess: this.props.onLoadCloudMapSuccess,
          onLoadCloudMapError: this.props.onLoadCloudMapError,
          onExportToCloudError: this.props.onExportToCloudError
        })))));
      }
    }]);
    return KeplerGL;
  }(_react.Component);

  (0, _defineProperty2["default"])(KeplerGL, "defaultProps", {
    mapStyles: [],
    mapStylesReplaceDefault: false,
    mapboxApiUrl: _defaultSettings.DEFAULT_MAPBOX_API_URL,
    width: 800,
    height: 800,
    appName: _defaultSettings.KEPLER_GL_NAME,
    version: _defaultSettings.KEPLER_GL_VERSION,
    sidePanelWidth: _defaultSettings.DIMENSIONS.sidePanel.width,
    theme: {},
    cloudProviders: [],
    readOnly: false
  });
  (0, _defineProperty2["default"])(KeplerGL, "contextType", _context.RootContext);
  return (0, _keplerglConnect.connect)(mapStateToProps, makeMapDispatchToProps)((0, _styledComponents.withTheme)(KeplerGL));
}

function mapStateToProps() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var props = arguments.length > 1 ? arguments[1] : undefined;
  return _objectSpread(_objectSpread({}, props), {}, {
    visState: state.visState,
    mapStyle: state.mapStyle,
    mapState: state.mapState,
    uiState: state.uiState,
    providerState: state.providerState
  });
}

var defaultUserActions = {};

var getDispatch = function getDispatch(dispatch) {
  return dispatch;
};

var getUserActions = function getUserActions(dispatch, props) {
  return props.actions || defaultUserActions;
};

function makeGetActionCreators() {
  return (0, _reselect.createSelector)([getDispatch, getUserActions], function (dispatch, userActions) {
    var _map = [VisStateActions, MapStateActions, MapStyleActions, UIStateActions, ProviderActions].map(function (actions) {
      return (0, _redux.bindActionCreators)(mergeActions(actions, userActions), dispatch);
    }),
        _map2 = (0, _slicedToArray2["default"])(_map, 5),
        visStateActions = _map2[0],
        mapStateActions = _map2[1],
        mapStyleActions = _map2[2],
        uiStateActions = _map2[3],
        providerActions = _map2[4];

    return {
      visStateActions: visStateActions,
      mapStateActions: mapStateActions,
      mapStyleActions: mapStyleActions,
      uiStateActions: uiStateActions,
      providerActions: providerActions,
      dispatch: dispatch
    };
  });
}

function makeMapDispatchToProps() {
  var getActionCreators = makeGetActionCreators();

  var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
    var groupedActionCreators = getActionCreators(dispatch, ownProps);
    return _objectSpread(_objectSpread({}, groupedActionCreators), {}, {
      dispatch: dispatch
    });
  };

  return mapDispatchToProps;
}
/**
 * Override default kepler.gl actions with user defined actions using the same key
 */


function mergeActions(actions, userActions) {
  var overrides = {};

  for (var key in userActions) {
    if (userActions.hasOwnProperty(key) && actions.hasOwnProperty(key)) {
      overrides[key] = userActions[key];
    }
  }

  return _objectSpread(_objectSpread({}, actions), overrides);
}

var _default = KeplerGlFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2tlcGxlci1nbC5qcyJdLCJuYW1lcyI6WyJHbG9iYWxTdHlsZSIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJmb250RmFtaWx5IiwiZm9udFdlaWdodCIsImZvbnRTaXplIiwibGluZUhlaWdodCIsImxhYmVsQ29sb3IiLCJLZXBsZXJHbEZhY3RvcnkiLCJkZXBzIiwiQm90dG9tV2lkZ2V0RmFjdG9yeSIsIkdlb0NvZGVyUGFuZWxGYWN0b3J5IiwiTWFwQ29udGFpbmVyRmFjdG9yeSIsIk1vZGFsQ29udGFpbmVyRmFjdG9yeSIsIlNpZGVQYW5lbEZhY3RvcnkiLCJQbG90Q29udGFpbmVyRmFjdG9yeSIsIk5vdGlmaWNhdGlvblBhbmVsRmFjdG9yeSIsIkJvdHRvbVdpZGdldCIsIkdlb0NvZGVyUGFuZWwiLCJNYXBDb250YWluZXIiLCJNb2RhbENvbnRhaW5lciIsIlNpZGVQYW5lbCIsIlBsb3RDb250YWluZXIiLCJOb3RpZmljYXRpb25QYW5lbCIsIktlcGxlckdMIiwidGhlbWVTZWxlY3RvciIsImJhc2ljVGhlbWUiLCJUSEVNRSIsImxpZ2h0IiwidGhlbWVMVCIsImJhc2UiLCJ0aGVtZUJTIiwiY2xvdWRQcm92aWRlcnMiLCJwcm92aWRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJoYXNTdG9yYWdlIiwic29tZSIsInAiLCJoYXNQcml2YXRlU3RvcmFnZSIsImhhc1NoYXJlIiwiaGFzU2hhcmluZ1VybCIsImxvY2FsZU1lc3NhZ2VzIiwiY3VzdG9tTWVzc2FnZXMiLCJtZXNzYWdlcyIsImRlZmF1bHRTdHlsZXMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXBTdHlsZSIsIm1hcFN0eWxlcyIsImN1c3RvbVN0eWxlcyIsIm1hcCIsIm1zIiwiaWQiLCJhbGxTdHlsZXMiLCJyZWR1Y2UiLCJhY2N1Iiwic3R5bGUiLCJoYXNTdHlsZU9iamVjdCIsInRvTG9hZCIsInRvUmVxdWVzdCIsIm1hcFN0eWxlQWN0aW9ucyIsImxvYWRNYXBTdHlsZXMiLCJyZXF1ZXN0TWFwU3R5bGVzIiwiX3ZhbGlkYXRlTWFwYm94VG9rZW4iLCJfbG9hZE1hcFN0eWxlIiwiX2hhbmRsZVJlc2l6ZSIsInByZXZQcm9wcyIsImhlaWdodCIsIndpZHRoIiwibWFwU3RhdGUiLCJtYXBib3hBcGlBY2Nlc3NUb2tlbiIsIkNvbnNvbGUiLCJ3YXJuIiwiTUlTU0lOR19NQVBCT1hfVE9LRU4iLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIm1hcFN0YXRlQWN0aW9ucyIsInVwZGF0ZU1hcCIsImlzU3BsaXQiLCJhcHBOYW1lIiwidmVyc2lvbiIsImFwcFdlYnNpdGUiLCJvblNhdmVNYXAiLCJvblZpZXdTdGF0ZUNoYW5nZSIsIm9uRGVja0luaXRpYWxpemVkIiwibWFwYm94QXBpVXJsIiwiZ2V0TWFwYm94UmVmIiwiZGVja0dsUHJvcHMiLCJ1aVN0YXRlIiwidmlzU3RhdGUiLCJwcm92aWRlclN0YXRlIiwidmlzU3RhdGVBY3Rpb25zIiwidWlTdGF0ZUFjdGlvbnMiLCJwcm92aWRlckFjdGlvbnMiLCJyZWFkT25seSIsImF2YWlsYWJsZVByb3ZpZGVycyIsImZpbHRlcnMiLCJsYXllcnMiLCJzcGxpdE1hcHMiLCJsYXllck9yZGVyIiwibGF5ZXJCbGVuZGluZyIsImxheWVyQ2xhc3NlcyIsImludGVyYWN0aW9uQ29uZmlnIiwiZGF0YXNldHMiLCJsYXllckRhdGEiLCJob3ZlckluZm8iLCJjbGlja2VkIiwibW91c2VQb3MiLCJhbmltYXRpb25Db25maWciLCJtYXBJbmZvIiwibm90aWZpY2F0aW9uUGFuZWxGaWVsZHMiLCJyZW1vdmVOb3RpZmljYXRpb24iLCJub3RpZmljYXRpb25zIiwic2lkZUZpZWxkcyIsInNpZGVQYW5lbFdpZHRoIiwibWFwU2F2ZWQiLCJtYXBGaWVsZHMiLCJlZGl0b3IiLCJtYXBDb250cm9scyIsImNvbnRhaW5lclciLCJtYXBDb250YWluZXJzIiwic2V0dGluZ3MiLCJpbmRleCIsImlzRXhwb3J0aW5nSW1hZ2UiLCJleHBvcnRJbWFnZSIsImV4cG9ydGluZyIsImF2YWlsYWJsZVRoZW1lU2VsZWN0b3IiLCJsb2NhbGVNZXNzYWdlc1NlbGVjdG9yIiwicm9vdCIsImxvY2FsZSIsImRpc3BsYXkiLCJhZGROb3RpZmljYXRpb24iLCJzZXRFeHBvcnRJbWFnZVNldHRpbmciLCJzZXRFeHBvcnRJbWFnZURhdGFVcmkiLCJzZXRFeHBvcnRJbWFnZUVycm9yIiwiZ2VvY29kZXIiLCJlbmFibGVkIiwidXBkYXRlVmlzRGF0YSIsInJlbW92ZURhdGFzZXQiLCJzaWRlUGFuZWwiLCJtYXJnaW4iLCJsZWZ0IiwiY3VycmVudCIsIm9uRXhwb3J0VG9DbG91ZFN1Y2Nlc3MiLCJvbkxvYWRDbG91ZE1hcFN1Y2Nlc3MiLCJvbkxvYWRDbG91ZE1hcEVycm9yIiwib25FeHBvcnRUb0Nsb3VkRXJyb3IiLCJDb21wb25lbnQiLCJtYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCIsIkRFRkFVTFRfTUFQQk9YX0FQSV9VUkwiLCJLRVBMRVJfR0xfTkFNRSIsIktFUExFUl9HTF9WRVJTSU9OIiwiRElNRU5TSU9OUyIsIlJvb3RDb250ZXh0IiwibWFwU3RhdGVUb1Byb3BzIiwibWFrZU1hcERpc3BhdGNoVG9Qcm9wcyIsInN0YXRlIiwiZGVmYXVsdFVzZXJBY3Rpb25zIiwiZ2V0RGlzcGF0Y2giLCJkaXNwYXRjaCIsImdldFVzZXJBY3Rpb25zIiwiYWN0aW9ucyIsIm1ha2VHZXRBY3Rpb25DcmVhdG9ycyIsInVzZXJBY3Rpb25zIiwiVmlzU3RhdGVBY3Rpb25zIiwiTWFwU3RhdGVBY3Rpb25zIiwiTWFwU3R5bGVBY3Rpb25zIiwiVUlTdGF0ZUFjdGlvbnMiLCJQcm92aWRlckFjdGlvbnMiLCJtZXJnZUFjdGlvbnMiLCJnZXRBY3Rpb25DcmVhdG9ycyIsIm1hcERpc3BhdGNoVG9Qcm9wcyIsIm93blByb3BzIiwiZ3JvdXBlZEFjdGlvbkNyZWF0b3JzIiwib3ZlcnJpZGVzIiwia2V5IiwiaGFzT3duUHJvcGVydHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7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LE9BQXRCLEVBQStCRSxXQUEvQixFQUE0QztBQUMxQyxNQUFNVyxTQUFTLEdBQUcsRUFBbEI7O0FBQ0EsT0FBSyxJQUFNQyxHQUFYLElBQWtCWixXQUFsQixFQUErQjtBQUM3QixRQUFJQSxXQUFXLENBQUNhLGNBQVosQ0FBMkJELEdBQTNCLEtBQW1DZCxPQUFPLENBQUNlLGNBQVIsQ0FBdUJELEdBQXZCLENBQXZDLEVBQW9FO0FBQ2xFRCxNQUFBQSxTQUFTLENBQUNDLEdBQUQsQ0FBVCxHQUFpQlosV0FBVyxDQUFDWSxHQUFELENBQTVCO0FBQ0Q7QUFDRjs7QUFFRCx5Q0FBV2QsT0FBWCxHQUF1QmEsU0FBdkI7QUFDRDs7ZUFFY3hLLGUiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnQsIGNyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtjb25zb2xlIGFzIENvbnNvbGV9IGZyb20gJ2dsb2JhbC93aW5kb3cnO1xuaW1wb3J0IHtiaW5kQWN0aW9uQ3JlYXRvcnN9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBzdHlsZWQsIHtUaGVtZVByb3ZpZGVyLCB3aXRoVGhlbWV9IGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCB7Y29ubmVjdCBhcyBrZXBsZXJHbENvbm5lY3R9IGZyb20gJ2Nvbm5lY3Qva2VwbGVyZ2wtY29ubmVjdCc7XG5pbXBvcnQge0ludGxQcm92aWRlcn0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQge21lc3NhZ2VzfSBmcm9tICcuLi9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtSb290Q29udGV4dH0gZnJvbSAnY29tcG9uZW50cy9jb250ZXh0JztcblxuaW1wb3J0ICogYXMgVmlzU3RhdGVBY3Rpb25zIGZyb20gJ2FjdGlvbnMvdmlzLXN0YXRlLWFjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWFwU3RhdGVBY3Rpb25zIGZyb20gJ2FjdGlvbnMvbWFwLXN0YXRlLWFjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWFwU3R5bGVBY3Rpb25zIGZyb20gJ2FjdGlvbnMvbWFwLXN0eWxlLWFjdGlvbnMnO1xuaW1wb3J0ICogYXMgVUlTdGF0ZUFjdGlvbnMgZnJvbSAnYWN0aW9ucy91aS1zdGF0ZS1hY3Rpb25zJztcbmltcG9ydCAqIGFzIFByb3ZpZGVyQWN0aW9ucyBmcm9tICdhY3Rpb25zL3Byb3ZpZGVyLWFjdGlvbnMnO1xuXG5pbXBvcnQge1xuICBESU1FTlNJT05TLFxuICBLRVBMRVJfR0xfTkFNRSxcbiAgS0VQTEVSX0dMX1ZFUlNJT04sXG4gIFRIRU1FLFxuICBERUZBVUxUX01BUEJPWF9BUElfVVJMXG59IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCB7TUlTU0lOR19NQVBCT1hfVE9LRU59IGZyb20gJ2NvbnN0YW50cy91c2VyLWZlZWRiYWNrcyc7XG5cbmltcG9ydCBTaWRlUGFuZWxGYWN0b3J5IGZyb20gJy4vc2lkZS1wYW5lbCc7XG5pbXBvcnQgTWFwQ29udGFpbmVyRmFjdG9yeSBmcm9tICcuL21hcC1jb250YWluZXInO1xuaW1wb3J0IEJvdHRvbVdpZGdldEZhY3RvcnkgZnJvbSAnLi9ib3R0b20td2lkZ2V0JztcbmltcG9ydCBNb2RhbENvbnRhaW5lckZhY3RvcnkgZnJvbSAnLi9tb2RhbC1jb250YWluZXInO1xuaW1wb3J0IFBsb3RDb250YWluZXJGYWN0b3J5IGZyb20gJy4vcGxvdC1jb250YWluZXInO1xuaW1wb3J0IE5vdGlmaWNhdGlvblBhbmVsRmFjdG9yeSBmcm9tICcuL25vdGlmaWNhdGlvbi1wYW5lbCc7XG5pbXBvcnQgR2VvQ29kZXJQYW5lbEZhY3RvcnkgZnJvbSAnLi9nZW9jb2Rlci1wYW5lbCc7XG5cbmltcG9ydCB7Z2VuZXJhdGVIYXNoSWR9IGZyb20gJ3V0aWxzL3V0aWxzJztcbmltcG9ydCB7dmFsaWRhdGVUb2tlbn0gZnJvbSAndXRpbHMvbWFwYm94LXV0aWxzJztcbmltcG9ydCB7bWVyZ2VNZXNzYWdlc30gZnJvbSAndXRpbHMvbG9jYWxlLXV0aWxzJztcblxuaW1wb3J0IHt0aGVtZSBhcyBiYXNpY1RoZW1lLCB0aGVtZUxULCB0aGVtZUJTfSBmcm9tICdzdHlsZXMvYmFzZSc7XG5cbi8vIE1heWJlIHdlIHNob3VsZCB0aGluayBhYm91dCBleHBvcnRpbmcgdGhpcyBvciBjcmVhdGluZyBhIHZhcmlhYmxlXG4vLyBhcyBwYXJ0IG9mIHRoZSBiYXNlLmpzIHRoZW1lXG5jb25zdCBHbG9iYWxTdHlsZSA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtZmFtaWx5OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZvbnRGYW1pbHl9O1xuICBmb250LXdlaWdodDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5mb250V2VpZ2h0fTtcbiAgZm9udC1zaXplOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZvbnRTaXplfTtcbiAgbGluZS1oZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGluZUhlaWdodH07XG5cbiAgKixcbiAgKjpiZWZvcmUsXG4gICo6YWZ0ZXIge1xuICAgIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAtbW96LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgfVxuXG4gIHVsIHtcbiAgICBtYXJnaW46IDA7XG4gICAgcGFkZGluZzogMDtcbiAgfVxuXG4gIGxpIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cblxuICBhIHtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gIH1cblxuICAubWFwYm94Z2wtY3RybCAubWFwYm94Z2wtY3RybC1sb2dvIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG5gO1xuXG5LZXBsZXJHbEZhY3RvcnkuZGVwcyA9IFtcbiAgQm90dG9tV2lkZ2V0RmFjdG9yeSxcbiAgR2VvQ29kZXJQYW5lbEZhY3RvcnksXG4gIE1hcENvbnRhaW5lckZhY3RvcnksXG4gIE1vZGFsQ29udGFpbmVyRmFjdG9yeSxcbiAgU2lkZVBhbmVsRmFjdG9yeSxcbiAgUGxvdENvbnRhaW5lckZhY3RvcnksXG4gIE5vdGlmaWNhdGlvblBhbmVsRmFjdG9yeVxuXTtcblxuZnVuY3Rpb24gS2VwbGVyR2xGYWN0b3J5KFxuICBCb3R0b21XaWRnZXQsXG4gIEdlb0NvZGVyUGFuZWwsXG4gIE1hcENvbnRhaW5lcixcbiAgTW9kYWxDb250YWluZXIsXG4gIFNpZGVQYW5lbCxcbiAgUGxvdENvbnRhaW5lcixcbiAgTm90aWZpY2F0aW9uUGFuZWxcbikge1xuICAvKiogQHR5cGVkZWYge2ltcG9ydCgnLi9rZXBsZXItZ2wnKS5LZXBsZXJHbFByb3BzfSBLZXBsZXJHbFByb3BzICovXG4gIC8qKiBAYXVnbWVudHMgUmVhY3QuQ29tcG9uZW50PEtlcGxlckdsUHJvcHM+ICovXG4gIGNsYXNzIEtlcGxlckdMIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgbWFwU3R5bGVzOiBbXSxcbiAgICAgIG1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0OiBmYWxzZSxcbiAgICAgIG1hcGJveEFwaVVybDogREVGQVVMVF9NQVBCT1hfQVBJX1VSTCxcbiAgICAgIHdpZHRoOiA4MDAsXG4gICAgICBoZWlnaHQ6IDgwMCxcbiAgICAgIGFwcE5hbWU6IEtFUExFUl9HTF9OQU1FLFxuICAgICAgdmVyc2lvbjogS0VQTEVSX0dMX1ZFUlNJT04sXG4gICAgICBzaWRlUGFuZWxXaWR0aDogRElNRU5TSU9OUy5zaWRlUGFuZWwud2lkdGgsXG4gICAgICB0aGVtZToge30sXG4gICAgICBjbG91ZFByb3ZpZGVyczogW10sXG4gICAgICByZWFkT25seTogZmFsc2VcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl92YWxpZGF0ZU1hcGJveFRva2VuKCk7XG4gICAgICB0aGlzLl9sb2FkTWFwU3R5bGUodGhpcy5wcm9wcy5tYXBTdHlsZXMpO1xuICAgICAgdGhpcy5faGFuZGxlUmVzaXplKHRoaXMucHJvcHMpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICAgIGlmIChcbiAgICAgICAgLy8gaWYgZGltZW5zaW9uIHByb3BzIGhhcyBjaGFuZ2VkXG4gICAgICAgIHRoaXMucHJvcHMuaGVpZ2h0ICE9PSBwcmV2UHJvcHMuaGVpZ2h0IHx8XG4gICAgICAgIHRoaXMucHJvcHMud2lkdGggIT09IHByZXZQcm9wcy53aWR0aCB8fFxuICAgICAgICAvLyByZWFjdC1tYXAtZ2wgd2lsbCBkaXNwYXRjaCB1cGRhdGVWaWV3cG9ydCBhZnRlciB0aGlzLl9oYW5kbGVSZXNpemUgaXMgY2FsbGVkXG4gICAgICAgIC8vIGhlcmUgd2UgY2hlY2sgaWYgdGhpcy5wcm9wcy5tYXBTdGF0ZS5oZWlnaHQgaXMgc3luYyB3aXRoIHByb3BzLmhlaWdodFxuICAgICAgICB0aGlzLnByb3BzLmhlaWdodCAhPT0gdGhpcy5wcm9wcy5tYXBTdGF0ZS5oZWlnaHRcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9oYW5kbGVSZXNpemUodGhpcy5wcm9wcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcm9vdCA9IGNyZWF0ZVJlZigpO1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb3RDb250ZXh0O1xuXG4gICAgLyogc2VsZWN0b3JzICovXG4gICAgdGhlbWVTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLnRoZW1lO1xuICAgIGF2YWlsYWJsZVRoZW1lU2VsZWN0b3IgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLnRoZW1lU2VsZWN0b3IsIHRoZW1lID0+XG4gICAgICB0eXBlb2YgdGhlbWUgPT09ICdvYmplY3QnXG4gICAgICAgID8ge1xuICAgICAgICAgICAgLi4uYmFzaWNUaGVtZSxcbiAgICAgICAgICAgIC4uLnRoZW1lXG4gICAgICAgICAgfVxuICAgICAgICA6IHRoZW1lID09PSBUSEVNRS5saWdodFxuICAgICAgICA/IHRoZW1lTFRcbiAgICAgICAgOiB0aGVtZSA9PT0gVEhFTUUuYmFzZVxuICAgICAgICA/IHRoZW1lQlNcbiAgICAgICAgOiB0aGVtZVxuICAgICk7XG5cbiAgICBhdmFpbGFibGVQcm92aWRlcnMgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgIHByb3BzID0+IHByb3BzLmNsb3VkUHJvdmlkZXJzLFxuICAgICAgcHJvdmlkZXJzID0+XG4gICAgICAgIEFycmF5LmlzQXJyYXkocHJvdmlkZXJzKSAmJiBwcm92aWRlcnMubGVuZ3RoXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGhhc1N0b3JhZ2U6IHByb3ZpZGVycy5zb21lKHAgPT4gcC5oYXNQcml2YXRlU3RvcmFnZSgpKSxcbiAgICAgICAgICAgICAgaGFzU2hhcmU6IHByb3ZpZGVycy5zb21lKHAgPT4gcC5oYXNTaGFyaW5nVXJsKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7fVxuICAgICk7XG5cbiAgICBsb2NhbGVNZXNzYWdlc1NlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgICBwcm9wcyA9PiBwcm9wcy5sb2NhbGVNZXNzYWdlcyxcbiAgICAgIGN1c3RvbU1lc3NhZ2VzID0+IChjdXN0b21NZXNzYWdlcyA/IG1lcmdlTWVzc2FnZXMobWVzc2FnZXMsIGN1c3RvbU1lc3NhZ2VzKSA6IG1lc3NhZ2VzKVxuICAgICk7XG5cbiAgICAvKiBwcml2YXRlIG1ldGhvZHMgKi9cbiAgICBfdmFsaWRhdGVNYXBib3hUb2tlbigpIHtcbiAgICAgIGNvbnN0IHttYXBib3hBcGlBY2Nlc3NUb2tlbn0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKCF2YWxpZGF0ZVRva2VuKG1hcGJveEFwaUFjY2Vzc1Rva2VuKSkge1xuICAgICAgICBDb25zb2xlLndhcm4oTUlTU0lOR19NQVBCT1hfVE9LRU4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9oYW5kbGVSZXNpemUoe3dpZHRoLCBoZWlnaHR9KSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh3aWR0aCkgfHwgIU51bWJlci5pc0Zpbml0ZShoZWlnaHQpKSB7XG4gICAgICAgIENvbnNvbGUud2Fybignd2lkdGggYW5kIGhlaWdodCBpcyByZXF1aXJlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnByb3BzLm1hcFN0YXRlQWN0aW9ucy51cGRhdGVNYXAoe1xuICAgICAgICB3aWR0aDogd2lkdGggLyAoMSArIE51bWJlcih0aGlzLnByb3BzLm1hcFN0YXRlLmlzU3BsaXQpKSxcbiAgICAgICAgaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfbG9hZE1hcFN0eWxlID0gKCkgPT4ge1xuICAgICAgY29uc3QgZGVmYXVsdFN0eWxlcyA9IE9iamVjdC52YWx1ZXModGhpcy5wcm9wcy5tYXBTdHlsZS5tYXBTdHlsZXMpO1xuICAgICAgLy8gYWRkIGlkIHRvIGN1c3RvbSBtYXAgc3R5bGVzIGlmIG5vdCBnaXZlblxuICAgICAgY29uc3QgY3VzdG9tU3R5bGVzID0gKHRoaXMucHJvcHMubWFwU3R5bGVzIHx8IFtdKS5tYXAobXMgPT4gKHtcbiAgICAgICAgLi4ubXMsXG4gICAgICAgIGlkOiBtcy5pZCB8fCBnZW5lcmF0ZUhhc2hJZCgpXG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGFsbFN0eWxlcyA9IFsuLi5jdXN0b21TdHlsZXMsIC4uLmRlZmF1bHRTdHlsZXNdLnJlZHVjZShcbiAgICAgICAgKGFjY3UsIHN0eWxlKSA9PiB7XG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVPYmplY3QgPSBzdHlsZS5zdHlsZSAmJiB0eXBlb2Ygc3R5bGUuc3R5bGUgPT09ICdvYmplY3QnO1xuICAgICAgICAgIGFjY3VbaGFzU3R5bGVPYmplY3QgPyAndG9Mb2FkJyA6ICd0b1JlcXVlc3QnXVtzdHlsZS5pZF0gPSBzdHlsZTtcblxuICAgICAgICAgIHJldHVybiBhY2N1O1xuICAgICAgICB9LFxuICAgICAgICB7dG9Mb2FkOiB7fSwgdG9SZXF1ZXN0OiB7fX1cbiAgICAgICk7XG5cbiAgICAgIHRoaXMucHJvcHMubWFwU3R5bGVBY3Rpb25zLmxvYWRNYXBTdHlsZXMoYWxsU3R5bGVzLnRvTG9hZCk7XG4gICAgICB0aGlzLnByb3BzLm1hcFN0eWxlQWN0aW9ucy5yZXF1ZXN0TWFwU3R5bGVzKGFsbFN0eWxlcy50b1JlcXVlc3QpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIC8vIHByb3BzXG4gICAgICAgIGlkLFxuICAgICAgICBhcHBOYW1lLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgICBhcHBXZWJzaXRlLFxuICAgICAgICBvblNhdmVNYXAsXG4gICAgICAgIG9uVmlld1N0YXRlQ2hhbmdlLFxuICAgICAgICBvbkRlY2tJbml0aWFsaXplZCxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybCxcbiAgICAgICAgZ2V0TWFwYm94UmVmLFxuICAgICAgICBkZWNrR2xQcm9wcyxcblxuICAgICAgICAvLyByZWR1eCBzdGF0ZVxuICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgIHVpU3RhdGUsXG4gICAgICAgIHZpc1N0YXRlLFxuICAgICAgICBwcm92aWRlclN0YXRlLFxuXG4gICAgICAgIC8vIGFjdGlvbnMsXG4gICAgICAgIHZpc1N0YXRlQWN0aW9ucyxcbiAgICAgICAgbWFwU3RhdGVBY3Rpb25zLFxuICAgICAgICBtYXBTdHlsZUFjdGlvbnMsXG4gICAgICAgIHVpU3RhdGVBY3Rpb25zLFxuICAgICAgICBwcm92aWRlckFjdGlvbnMsXG5cbiAgICAgICAgLy8gcmVhZE9ubHkgb3ZlcnJpZGVcbiAgICAgICAgcmVhZE9ubHlcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBjb25zdCBhdmFpbGFibGVQcm92aWRlcnMgPSB0aGlzLmF2YWlsYWJsZVByb3ZpZGVycyh0aGlzLnByb3BzKTtcblxuICAgICAgY29uc3Qge1xuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBsYXllcnMsXG4gICAgICAgIHNwbGl0TWFwcywgLy8gdGhpcyB3aWxsIHN0b3JlIHN1cHBvcnQgZm9yIHNwbGl0IG1hcCB2aWV3IGlzIG5lY2Vzc2FyeVxuICAgICAgICBsYXllck9yZGVyLFxuICAgICAgICBsYXllckJsZW5kaW5nLFxuICAgICAgICBsYXllckNsYXNzZXMsXG4gICAgICAgIGludGVyYWN0aW9uQ29uZmlnLFxuICAgICAgICBkYXRhc2V0cyxcbiAgICAgICAgbGF5ZXJEYXRhLFxuICAgICAgICBob3ZlckluZm8sXG4gICAgICAgIGNsaWNrZWQsXG4gICAgICAgIG1vdXNlUG9zLFxuICAgICAgICBhbmltYXRpb25Db25maWcsXG4gICAgICAgIG1hcEluZm9cbiAgICAgIH0gPSB2aXNTdGF0ZTtcblxuICAgICAgY29uc3Qgbm90aWZpY2F0aW9uUGFuZWxGaWVsZHMgPSB7XG4gICAgICAgIHJlbW92ZU5vdGlmaWNhdGlvbjogdWlTdGF0ZUFjdGlvbnMucmVtb3ZlTm90aWZpY2F0aW9uLFxuICAgICAgICBub3RpZmljYXRpb25zOiB1aVN0YXRlLm5vdGlmaWNhdGlvbnNcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHNpZGVGaWVsZHMgPSB7XG4gICAgICAgIGFwcE5hbWUsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICAgIGFwcFdlYnNpdGUsXG4gICAgICAgIGRhdGFzZXRzLFxuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBsYXllcnMsXG4gICAgICAgIGxheWVyT3JkZXIsXG4gICAgICAgIGxheWVyQ2xhc3NlcyxcbiAgICAgICAgaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICAgIG1hcFN0eWxlLFxuICAgICAgICBtYXBJbmZvLFxuICAgICAgICBsYXllckJsZW5kaW5nLFxuICAgICAgICBvblNhdmVNYXAsXG4gICAgICAgIHVpU3RhdGUsXG4gICAgICAgIG1hcFN0eWxlQWN0aW9ucyxcbiAgICAgICAgdmlzU3RhdGVBY3Rpb25zLFxuICAgICAgICB1aVN0YXRlQWN0aW9ucyxcbiAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMuc2lkZVBhbmVsV2lkdGgsXG4gICAgICAgIGF2YWlsYWJsZVByb3ZpZGVycyxcbiAgICAgICAgbWFwU2F2ZWQ6IHByb3ZpZGVyU3RhdGUubWFwU2F2ZWRcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG1hcEZpZWxkcyA9IHtcbiAgICAgICAgZGF0YXNldHMsXG4gICAgICAgIGdldE1hcGJveFJlZixcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybCxcbiAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgIHVpU3RhdGUsXG4gICAgICAgIGVkaXRvcjogdmlzU3RhdGUuZWRpdG9yLFxuICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgbWFwQ29udHJvbHM6IHVpU3RhdGUubWFwQ29udHJvbHMsXG4gICAgICAgIGxheWVycyxcbiAgICAgICAgbGF5ZXJPcmRlcixcbiAgICAgICAgbGF5ZXJEYXRhLFxuICAgICAgICBsYXllckJsZW5kaW5nLFxuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgaG92ZXJJbmZvLFxuICAgICAgICBjbGlja2VkLFxuICAgICAgICBtb3VzZVBvcyxcbiAgICAgICAgcmVhZE9ubHk6IHVpU3RhdGUucmVhZE9ubHksXG4gICAgICAgIG9uRGVja0luaXRpYWxpemVkLFxuICAgICAgICBvblZpZXdTdGF0ZUNoYW5nZSxcbiAgICAgICAgdWlTdGF0ZUFjdGlvbnMsXG4gICAgICAgIHZpc1N0YXRlQWN0aW9ucyxcbiAgICAgICAgbWFwU3RhdGVBY3Rpb25zLFxuICAgICAgICBhbmltYXRpb25Db25maWcsXG4gICAgICAgIGRlY2tHbFByb3BzXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBpc1NwbGl0ID0gc3BsaXRNYXBzICYmIHNwbGl0TWFwcy5sZW5ndGggPiAxO1xuICAgICAgY29uc3QgY29udGFpbmVyVyA9IG1hcFN0YXRlLndpZHRoICogKE51bWJlcihpc1NwbGl0KSArIDEpO1xuXG4gICAgICBjb25zdCBtYXBDb250YWluZXJzID0gIWlzU3BsaXRcbiAgICAgICAgPyBbPE1hcENvbnRhaW5lciBrZXk9ezB9IGluZGV4PXswfSB7Li4ubWFwRmllbGRzfSBtYXBMYXllcnM9e251bGx9IC8+XVxuICAgICAgICA6IHNwbGl0TWFwcy5tYXAoKHNldHRpbmdzLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPE1hcENvbnRhaW5lclxuICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgIHsuLi5tYXBGaWVsZHN9XG4gICAgICAgICAgICAgIG1hcExheWVycz17c3BsaXRNYXBzW2luZGV4XS5sYXllcnN9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpO1xuXG4gICAgICBjb25zdCBpc0V4cG9ydGluZ0ltYWdlID0gdWlTdGF0ZS5leHBvcnRJbWFnZS5leHBvcnRpbmc7XG4gICAgICBjb25zdCB0aGVtZSA9IHRoaXMuYXZhaWxhYmxlVGhlbWVTZWxlY3Rvcih0aGlzLnByb3BzKTtcbiAgICAgIGNvbnN0IGxvY2FsZU1lc3NhZ2VzID0gdGhpcy5sb2NhbGVNZXNzYWdlc1NlbGVjdG9yKHRoaXMucHJvcHMpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Um9vdENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3RoaXMucm9vdH0+XG4gICAgICAgICAgPEludGxQcm92aWRlciBsb2NhbGU9e3VpU3RhdGUubG9jYWxlfSBtZXNzYWdlcz17bG9jYWxlTWVzc2FnZXNbdWlTdGF0ZS5sb2NhbGVdfT5cbiAgICAgICAgICAgIDxUaGVtZVByb3ZpZGVyIHRoZW1lPXt0aGVtZX0+XG4gICAgICAgICAgICAgIDxHbG9iYWxTdHlsZVxuICAgICAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJrZXBsZXItZ2xcIlxuICAgICAgICAgICAgICAgIGlkPXtga2VwbGVyLWdsX18ke2lkfWB9XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLnJvb3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uUGFuZWwgey4uLm5vdGlmaWNhdGlvblBhbmVsRmllbGRzfSAvPlxuICAgICAgICAgICAgICAgIHshdWlTdGF0ZS5yZWFkT25seSAmJiAhcmVhZE9ubHkgJiYgPFNpZGVQYW5lbCB7Li4uc2lkZUZpZWxkc30gLz59XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXBzXCIgc3R5bGU9e3tkaXNwbGF5OiAnZmxleCd9fT5cbiAgICAgICAgICAgICAgICAgIHttYXBDb250YWluZXJzfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtpc0V4cG9ydGluZ0ltYWdlICYmIChcbiAgICAgICAgICAgICAgICAgIDxQbG90Q29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXtoZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydEltYWdlU2V0dGluZz17dWlTdGF0ZS5leHBvcnRJbWFnZX1cbiAgICAgICAgICAgICAgICAgICAgbWFwRmllbGRzPXttYXBGaWVsZHN9XG4gICAgICAgICAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbj17dWlTdGF0ZUFjdGlvbnMuYWRkTm90aWZpY2F0aW9ufVxuICAgICAgICAgICAgICAgICAgICBzZXRFeHBvcnRJbWFnZVNldHRpbmc9e3VpU3RhdGVBY3Rpb25zLnNldEV4cG9ydEltYWdlU2V0dGluZ31cbiAgICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0SW1hZ2VEYXRhVXJpPXt1aVN0YXRlQWN0aW9ucy5zZXRFeHBvcnRJbWFnZURhdGFVcml9XG4gICAgICAgICAgICAgICAgICAgIHNldEV4cG9ydEltYWdlRXJyb3I9e3VpU3RhdGVBY3Rpb25zLnNldEV4cG9ydEltYWdlRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgIHNwbGl0TWFwcz17c3BsaXRNYXBzfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHtpbnRlcmFjdGlvbkNvbmZpZy5nZW9jb2Rlci5lbmFibGVkICYmIChcbiAgICAgICAgICAgICAgICAgIDxHZW9Db2RlclBhbmVsXG4gICAgICAgICAgICAgICAgICAgIGlzR2VvY29kZXJFbmFibGVkPXtpbnRlcmFjdGlvbkNvbmZpZy5nZW9jb2Rlci5lbmFibGVkfVxuICAgICAgICAgICAgICAgICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbj17bWFwYm94QXBpQWNjZXNzVG9rZW59XG4gICAgICAgICAgICAgICAgICAgIG1hcFN0YXRlPXttYXBTdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlVmlzRGF0YT17dmlzU3RhdGVBY3Rpb25zLnVwZGF0ZVZpc0RhdGF9XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZURhdGFzZXQ9e3Zpc1N0YXRlQWN0aW9ucy5yZW1vdmVEYXRhc2V0fVxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVNYXA9e21hcFN0YXRlQWN0aW9ucy51cGRhdGVNYXB9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPEJvdHRvbVdpZGdldFxuICAgICAgICAgICAgICAgICAgZmlsdGVycz17ZmlsdGVyc31cbiAgICAgICAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgICAgICAgIHVpU3RhdGU9e3VpU3RhdGV9XG4gICAgICAgICAgICAgICAgICBsYXllcnM9e2xheWVyc31cbiAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNvbmZpZz17YW5pbWF0aW9uQ29uZmlnfVxuICAgICAgICAgICAgICAgICAgdmlzU3RhdGVBY3Rpb25zPXt2aXNTdGF0ZUFjdGlvbnN9XG4gICAgICAgICAgICAgICAgICBzaWRlUGFuZWxXaWR0aD17XG4gICAgICAgICAgICAgICAgICAgIHVpU3RhdGUucmVhZE9ubHkgPyAwIDogdGhpcy5wcm9wcy5zaWRlUGFuZWxXaWR0aCArIHRoZW1lLnNpZGVQYW5lbC5tYXJnaW4ubGVmdFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgY29udGFpbmVyVz17Y29udGFpbmVyV31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxNb2RhbENvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgbWFwU3R5bGU9e21hcFN0eWxlfVxuICAgICAgICAgICAgICAgICAgdmlzU3RhdGU9e3Zpc1N0YXRlfVxuICAgICAgICAgICAgICAgICAgbWFwU3RhdGU9e21hcFN0YXRlfVxuICAgICAgICAgICAgICAgICAgdWlTdGF0ZT17dWlTdGF0ZX1cbiAgICAgICAgICAgICAgICAgIG1hcGJveEFwaUFjY2Vzc1Rva2VuPXttYXBib3hBcGlBY2Nlc3NUb2tlbn1cbiAgICAgICAgICAgICAgICAgIG1hcGJveEFwaVVybD17bWFwYm94QXBpVXJsfVxuICAgICAgICAgICAgICAgICAgdmlzU3RhdGVBY3Rpb25zPXt2aXNTdGF0ZUFjdGlvbnN9XG4gICAgICAgICAgICAgICAgICB1aVN0YXRlQWN0aW9ucz17dWlTdGF0ZUFjdGlvbnN9XG4gICAgICAgICAgICAgICAgICBtYXBTdHlsZUFjdGlvbnM9e21hcFN0eWxlQWN0aW9uc31cbiAgICAgICAgICAgICAgICAgIHByb3ZpZGVyQWN0aW9ucz17cHJvdmlkZXJBY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgcm9vdE5vZGU9e3RoaXMucm9vdC5jdXJyZW50fVxuICAgICAgICAgICAgICAgICAgY29udGFpbmVyVz17Y29udGFpbmVyV31cbiAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckg9e21hcFN0YXRlLmhlaWdodH1cbiAgICAgICAgICAgICAgICAgIHByb3ZpZGVyU3RhdGU9e3RoaXMucHJvcHMucHJvdmlkZXJTdGF0ZX1cbiAgICAgICAgICAgICAgICAgIC8vIFVzZXIgZGVmaW5lZCBjbG91ZCBwcm92aWRlciBwcm9wc1xuICAgICAgICAgICAgICAgICAgY2xvdWRQcm92aWRlcnM9e3RoaXMucHJvcHMuY2xvdWRQcm92aWRlcnN9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydFRvQ2xvdWRTdWNjZXNzPXt0aGlzLnByb3BzLm9uRXhwb3J0VG9DbG91ZFN1Y2Nlc3N9XG4gICAgICAgICAgICAgICAgICBvbkxvYWRDbG91ZE1hcFN1Y2Nlc3M9e3RoaXMucHJvcHMub25Mb2FkQ2xvdWRNYXBTdWNjZXNzfVxuICAgICAgICAgICAgICAgICAgb25Mb2FkQ2xvdWRNYXBFcnJvcj17dGhpcy5wcm9wcy5vbkxvYWRDbG91ZE1hcEVycm9yfVxuICAgICAgICAgICAgICAgICAgb25FeHBvcnRUb0Nsb3VkRXJyb3I9e3RoaXMucHJvcHMub25FeHBvcnRUb0Nsb3VkRXJyb3J9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9HbG9iYWxTdHlsZT5cbiAgICAgICAgICAgIDwvVGhlbWVQcm92aWRlcj5cbiAgICAgICAgICA8L0ludGxQcm92aWRlcj5cbiAgICAgICAgPC9Sb290Q29udGV4dC5Qcm92aWRlcj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGtlcGxlckdsQ29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1ha2VNYXBEaXNwYXRjaFRvUHJvcHMpKHdpdGhUaGVtZShLZXBsZXJHTCkpO1xufVxuXG5mdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGUgPSB7fSwgcHJvcHMpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9wcyxcbiAgICB2aXNTdGF0ZTogc3RhdGUudmlzU3RhdGUsXG4gICAgbWFwU3R5bGU6IHN0YXRlLm1hcFN0eWxlLFxuICAgIG1hcFN0YXRlOiBzdGF0ZS5tYXBTdGF0ZSxcbiAgICB1aVN0YXRlOiBzdGF0ZS51aVN0YXRlLFxuICAgIHByb3ZpZGVyU3RhdGU6IHN0YXRlLnByb3ZpZGVyU3RhdGVcbiAgfTtcbn1cblxuY29uc3QgZGVmYXVsdFVzZXJBY3Rpb25zID0ge307XG5jb25zdCBnZXREaXNwYXRjaCA9IGRpc3BhdGNoID0+IGRpc3BhdGNoO1xuY29uc3QgZ2V0VXNlckFjdGlvbnMgPSAoZGlzcGF0Y2gsIHByb3BzKSA9PiBwcm9wcy5hY3Rpb25zIHx8IGRlZmF1bHRVc2VyQWN0aW9ucztcblxuZnVuY3Rpb24gbWFrZUdldEFjdGlvbkNyZWF0b3JzKCkge1xuICByZXR1cm4gY3JlYXRlU2VsZWN0b3IoW2dldERpc3BhdGNoLCBnZXRVc2VyQWN0aW9uc10sIChkaXNwYXRjaCwgdXNlckFjdGlvbnMpID0+IHtcbiAgICBjb25zdCBbdmlzU3RhdGVBY3Rpb25zLCBtYXBTdGF0ZUFjdGlvbnMsIG1hcFN0eWxlQWN0aW9ucywgdWlTdGF0ZUFjdGlvbnMsIHByb3ZpZGVyQWN0aW9uc10gPSBbXG4gICAgICBWaXNTdGF0ZUFjdGlvbnMsXG4gICAgICBNYXBTdGF0ZUFjdGlvbnMsXG4gICAgICBNYXBTdHlsZUFjdGlvbnMsXG4gICAgICBVSVN0YXRlQWN0aW9ucyxcbiAgICAgIFByb3ZpZGVyQWN0aW9uc1xuICAgIF0ubWFwKGFjdGlvbnMgPT4gYmluZEFjdGlvbkNyZWF0b3JzKG1lcmdlQWN0aW9ucyhhY3Rpb25zLCB1c2VyQWN0aW9ucyksIGRpc3BhdGNoKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmlzU3RhdGVBY3Rpb25zLFxuICAgICAgbWFwU3RhdGVBY3Rpb25zLFxuICAgICAgbWFwU3R5bGVBY3Rpb25zLFxuICAgICAgdWlTdGF0ZUFjdGlvbnMsXG4gICAgICBwcm92aWRlckFjdGlvbnMsXG4gICAgICBkaXNwYXRjaFxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtYWtlTWFwRGlzcGF0Y2hUb1Byb3BzKCkge1xuICBjb25zdCBnZXRBY3Rpb25DcmVhdG9ycyA9IG1ha2VHZXRBY3Rpb25DcmVhdG9ycygpO1xuICBjb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSAoZGlzcGF0Y2gsIG93blByb3BzKSA9PiB7XG4gICAgY29uc3QgZ3JvdXBlZEFjdGlvbkNyZWF0b3JzID0gZ2V0QWN0aW9uQ3JlYXRvcnMoZGlzcGF0Y2gsIG93blByb3BzKTtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi5ncm91cGVkQWN0aW9uQ3JlYXRvcnMsXG4gICAgICBkaXNwYXRjaFxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIG1hcERpc3BhdGNoVG9Qcm9wcztcbn1cblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IGtlcGxlci5nbCBhY3Rpb25zIHdpdGggdXNlciBkZWZpbmVkIGFjdGlvbnMgdXNpbmcgdGhlIHNhbWUga2V5XG4gKi9cbmZ1bmN0aW9uIG1lcmdlQWN0aW9ucyhhY3Rpb25zLCB1c2VyQWN0aW9ucykge1xuICBjb25zdCBvdmVycmlkZXMgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgaW4gdXNlckFjdGlvbnMpIHtcbiAgICBpZiAodXNlckFjdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhY3Rpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIG92ZXJyaWRlc1trZXldID0gdXNlckFjdGlvbnNba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gey4uLmFjdGlvbnMsIC4uLm92ZXJyaWRlc307XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtlcGxlckdsRmFjdG9yeTtcbiJdfQ==