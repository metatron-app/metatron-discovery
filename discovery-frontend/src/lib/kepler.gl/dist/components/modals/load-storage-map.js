"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ProviderSelect = void 0;

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

var _moment = _interopRequireDefault(require("moment"));

var _loadingDialog = _interopRequireDefault(require("./loading-dialog"));

var _styledComponents2 = require("../common/styled-components");

var _cloudTile = _interopRequireDefault(require("./cloud-tile"));

var _icons = require("../common/icons");

var _providerModalContainer = _interopRequireDefault(require("./provider-modal-container"));

var _localization = require("../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject9() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  flex: 0 0 auto;\n  width: 208px;\n  display: flex;\n  flex-direction: column;\n  padding: 16px 8px;\n  color: #3a414c;\n  cursor: pointer;\n  font-size: 12px;\n  line-height: 18px;\n\n  &:hover {\n    .vis_item-icon,\n    .vis_item-thumb,\n    .vis_item-description,\n    .vis_item-modification-date {\n      opacity: 1;\n    }\n  }\n\n  .vis_item-icon,\n  .vis_item-thumb,\n  .vis_item-description,\n  .vis_item-modification-date {\n    opacity: 0.9;\n    transition: opacity 0.4s ease;\n  }\n\n  .vis_item-icon {\n    position: relative;\n    flex: 0 0 108px;\n    background-color: #6a7484;\n    border-radius: 4px;\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    justify-content: center;\n  }\n\n  .vis_item-thumb {\n    position: relative;\n    flex: 0 0 108px;\n    background-size: cover;\n    background-position: center;\n    border-radius: 4px;\n  }\n\n  .vis_item-privacy {\n    position: absolute;\n    top: 0;\n    left: 0;\n    padding: 3px 6px;\n    border-radius: 4px 0;\n    background-color: rgba(58, 65, 76, 0.7);\n    color: #fff;\n    font-size: 11px;\n    line-height: 18px;\n  }\n\n  .vis_item-title {\n    margin-top: 16px;\n    font-weight: 500;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .vis_item-description {\n    flex: 1 1 auto;\n    margin-top: 8px;\n  }\n\n  .vis_item-modification-date {\n    margin-top: 16px;\n    flex: 1 0 auto;\n    color: #6a7484;\n    line-height: 15px;\n  }\n"]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-flow: row wrap;\n  align-items: stretch;\n  justify-content: space-between;\n"]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  border: solid #bfbfbf;\n  border-width: 0 0 1px 0;\n  margin-bottom: 16px;\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  flex: 1 1 auto;\n  background-color: #f8f8f9;\n  padding: 20px 24px;\n  min-height: 280px;\n\n  .title {\n    font-size: 14px;\n    line-height: 16px;\n    font-weight: 500;\n    margin-bottom: 16px;\n\n    span {\n      text-transform: capitalize;\n    }\n  }\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 16px;\n  color: #3a414c;\n  cursor: pointer;\n\n  &:hover {\n    font-weight: 500;\n  }\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n  font-size: 12px;\n  line-height: 14px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  text-align: center;\n  span {\n    margin: 0 auto;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledProviderSection = _styledComponents["default"].div.attrs({
  className: 'provider-selection'
})(_templateObject());

var StyledSpinner = _styledComponents["default"].div(_templateObject2());

var StyledVisualizationSection = _styledComponents["default"].div(_templateObject3());

var StyledStorageHeader = _styledComponents["default"].div(_templateObject4());

var StyledBackBtn = _styledComponents["default"].a(_templateObject5());

var StyledProviderVisSection = _styledComponents["default"].div(_templateObject6());

var StyledSeparator = _styledComponents["default"].hr(_templateObject7());

var StyledVisualizationList = _styledComponents["default"].div(_templateObject8());

var StyledVisualizationItem = _styledComponents["default"].div(_templateObject9());

var MapIcon = function MapIcon(props) {
  return /*#__PURE__*/_react["default"].createElement("div", props, props.children, /*#__PURE__*/_react["default"].createElement(_icons.Base, {
    height: "32px",
    viewBox: '0 0 16 16'
  }, /*#__PURE__*/_react["default"].createElement("path", {
    fill: "#d3d8d6",
    d: "m13.6 11.572-3.2 2.1336v-9.2776l3.2-2.1336zm-12-7.144 3.2-2.1336v9.2776l-3.2 2.1336zm13.244 8.2376c0.2224-0.148 0.356-0.3984 0.356-0.6656v-11.2c0-0.2952-0.1624-0.5664-0.4224-0.7048-0.26-0.14-0.576-0.1248-0.8216 0.0392l-4.3128 2.876-3.5432-2.8352c-0.1208-0.0936-0.2952-0.1624-0.472-0.1688-0.1648-0.0064-0.348 0.0464-0.472 0.128l-4.8 3.2c-0.2224 0.1488-0.356 0.3984-0.356 0.6656v11.2c0 0.2952 0.1624 0.5664 0.4224 0.7056 0.1184 0.0632 0.248 0.0944 0.3776 0.0944 0.1552 0 0.3096-0.0448 0.444-0.1344l4.3128-2.876 3.5432 2.8352c0.1448 0.116 0.3216 0.1752 0.5 0.1752 0.1184 0 0.236-0.0248 0.3464-0.0784z"
  })));
};

var PrivacyBadge = function PrivacyBadge(_ref) {
  var privateMap = _ref.privateMap;
  return /*#__PURE__*/_react["default"].createElement("span", {
    className: "vis_item-privacy"
  }, privateMap ? 'Private' : 'Public');
};

var VisualizationItem = function VisualizationItem(_ref2) {
  var vis = _ref2.vis,
      onClick = _ref2.onClick;
  return /*#__PURE__*/_react["default"].createElement(StyledVisualizationItem, {
    onClick: onClick
  }, vis.thumbnail ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "vis_item-thumb",
    style: {
      backgroundImage: "url(".concat(vis.thumbnail, ")")
    }
  }, vis.hasOwnProperty('privateMap') ? /*#__PURE__*/_react["default"].createElement(PrivacyBadge, {
    privateMap: vis.privateMap
  }) : null) : /*#__PURE__*/_react["default"].createElement(MapIcon, {
    className: "vis_item-icon"
  }, vis.hasOwnProperty('privateMap') ? /*#__PURE__*/_react["default"].createElement(PrivacyBadge, {
    privateMap: vis.privateMap
  }) : null), /*#__PURE__*/_react["default"].createElement("span", {
    className: "vis_item-title"
  }, vis.title), vis.description && vis.description.length && /*#__PURE__*/_react["default"].createElement("span", {
    className: "vis_item-description"
  }, vis.description), /*#__PURE__*/_react["default"].createElement("span", {
    className: "vis_item-modification-date"
  }, "Last modified ", _moment["default"].utc(vis.lastModification).fromNow()));
};

var ProviderSelect = function ProviderSelect(_ref3) {
  var _ref3$cloudProviders = _ref3.cloudProviders,
      cloudProviders = _ref3$cloudProviders === void 0 ? [] : _ref3$cloudProviders,
      _onSelect = _ref3.onSelect,
      onSetCloudProvider = _ref3.onSetCloudProvider,
      currentProvider = _ref3.currentProvider;
  return cloudProviders.length ? /*#__PURE__*/_react["default"].createElement(StyledProviderSection, null, cloudProviders.map(function (provider) {
    return /*#__PURE__*/_react["default"].createElement(_cloudTile["default"], {
      key: provider.name,
      onSelect: function onSelect() {
        return _onSelect(provider.name);
      },
      onSetCloudProvider: onSetCloudProvider,
      cloudProvider: provider,
      isSelected: provider.name === currentProvider,
      isConnected: Boolean(provider.getAccessToken && provider.getAccessToken())
    });
  })) : /*#__PURE__*/_react["default"].createElement("p", null, "No storage provider available");
};

exports.ProviderSelect = ProviderSelect;

function LoadStorageMapFactory() {
  var LoadStorageMap = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(LoadStorageMap, _Component);

    var _super = _createSuper(LoadStorageMap);

    function LoadStorageMap() {
      var _this;

      (0, _classCallCheck2["default"])(this, LoadStorageMap);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        showProviderSelect: true
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_getProvider", function () {
        var _this$props = _this.props,
            currentProvider = _this$props.currentProvider,
            cloudProviders = _this$props.cloudProviders;
        return (cloudProviders || []).find(function (p) {
          return p.name === currentProvider;
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_clickBack", function () {
        _this.setState({
          showProviderSelect: true
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_selectProvider", function (providerName) {
        _this.props.onSetCloudProvider(providerName);

        var provider = (_this.props.cloudProviders || []).find(function (p) {
          return p.name === providerName;
        });

        _this.props.getSavedMaps(provider);

        _this.setState({
          showProviderSelect: false
        });
      });
      return _this;
    }

    (0, _createClass2["default"])(LoadStorageMap, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._getSavedMaps();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (prevProps.currentProvider !== this.props.currentProvider) {
          this._getSavedMaps();
        }
      }
    }, {
      key: "_getSavedMaps",
      value: function _getSavedMaps() {
        var provider = this._getProvider();

        if (provider) {
          this.props.getSavedMaps(provider);
          this.setState({
            showProviderSelect: false
          });
        }
      }
    }, {
      key: "_onLoadCloudMap",
      value: function _onLoadCloudMap(provider, vis) {
        this.props.onLoadCloudMap({
          loadParams: vis.loadParams,
          provider: provider
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props2 = this.props,
            visualizations = _this$props2.visualizations,
            cloudProviders = _this$props2.cloudProviders,
            currentProvider = _this$props2.currentProvider,
            isProviderLoading = _this$props2.isProviderLoading,
            onSetCloudProvider = _this$props2.onSetCloudProvider;

        var provider = this._getProvider();

        return /*#__PURE__*/_react["default"].createElement(_providerModalContainer["default"], {
          onSetCloudProvider: onSetCloudProvider,
          cloudProviders: cloudProviders,
          currentProvider: currentProvider
        }, this.state.showProviderSelect ? /*#__PURE__*/_react["default"].createElement(ProviderSelect, {
          onSelect: this._selectProvider,
          cloudProviders: cloudProviders,
          onSetCloudProvider: onSetCloudProvider,
          currentProvider: currentProvider
        }) : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, isProviderLoading && /*#__PURE__*/_react["default"].createElement(StyledSpinner, null, /*#__PURE__*/_react["default"].createElement(_loadingDialog["default"], {
          size: 64
        })), !isProviderLoading && visualizations && /*#__PURE__*/_react["default"].createElement(StyledVisualizationSection, null, /*#__PURE__*/_react["default"].createElement(StyledStorageHeader, null, /*#__PURE__*/_react["default"].createElement(StyledBackBtn, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
          link: true,
          onClick: this._clickBack
        }, /*#__PURE__*/_react["default"].createElement(_icons.ArrowLeft, {
          height: "14px"
        }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.loadStorageMap.back'
        }))), provider.getManagementUrl && /*#__PURE__*/_react["default"].createElement("a", {
          key: 1,
          href: provider.getManagementUrl(),
          target: "_blank",
          rel: "noopener noreferrer",
          style: {
            textDecoration: 'underline'
          }
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.loadStorageMap.back',
          values: {
            displayName: provider.displayName
          }
        }))), /*#__PURE__*/_react["default"].createElement(StyledProviderVisSection, null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "title"
        }, /*#__PURE__*/_react["default"].createElement("span", null, currentProvider), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.loadStorageMap.storageMaps'
        })), /*#__PURE__*/_react["default"].createElement(StyledSeparator, null), /*#__PURE__*/_react["default"].createElement(StyledVisualizationList, null, visualizations.length ? visualizations.map(function (vis) {
          return /*#__PURE__*/_react["default"].createElement(VisualizationItem, {
            key: vis.id,
            onClick: function onClick() {
              return _this2._onLoadCloudMap(provider, vis);
            },
            vis: vis
          });
        }) : /*#__PURE__*/_react["default"].createElement("div", {
          className: "visualization-list__message"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.loadStorageMap.noSavedMaps'
        })))))));
      }
    }]);
    return LoadStorageMap;
  }(_react.Component);

  return LoadStorageMap;
}

var _default = LoadStorageMapFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9sb2FkLXN0b3JhZ2UtbWFwLmpzIl0sIm5hbWVzIjpbIlN0eWxlZFByb3ZpZGVyU2VjdGlvbiIsInN0eWxlZCIsImRpdiIsImF0dHJzIiwiY2xhc3NOYW1lIiwiU3R5bGVkU3Bpbm5lciIsIlN0eWxlZFZpc3VhbGl6YXRpb25TZWN0aW9uIiwiU3R5bGVkU3RvcmFnZUhlYWRlciIsIlN0eWxlZEJhY2tCdG4iLCJhIiwiU3R5bGVkUHJvdmlkZXJWaXNTZWN0aW9uIiwiU3R5bGVkU2VwYXJhdG9yIiwiaHIiLCJTdHlsZWRWaXN1YWxpemF0aW9uTGlzdCIsIlN0eWxlZFZpc3VhbGl6YXRpb25JdGVtIiwiTWFwSWNvbiIsInByb3BzIiwiY2hpbGRyZW4iLCJQcml2YWN5QmFkZ2UiLCJwcml2YXRlTWFwIiwiVmlzdWFsaXphdGlvbkl0ZW0iLCJ2aXMiLCJvbkNsaWNrIiwidGh1bWJuYWlsIiwiYmFja2dyb3VuZEltYWdlIiwiaGFzT3duUHJvcGVydHkiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibGVuZ3RoIiwibW9tZW50IiwidXRjIiwibGFzdE1vZGlmaWNhdGlvbiIsImZyb21Ob3ciLCJQcm92aWRlclNlbGVjdCIsImNsb3VkUHJvdmlkZXJzIiwib25TZWxlY3QiLCJvblNldENsb3VkUHJvdmlkZXIiLCJjdXJyZW50UHJvdmlkZXIiLCJtYXAiLCJwcm92aWRlciIsIm5hbWUiLCJCb29sZWFuIiwiZ2V0QWNjZXNzVG9rZW4iLCJMb2FkU3RvcmFnZU1hcEZhY3RvcnkiLCJMb2FkU3RvcmFnZU1hcCIsInNob3dQcm92aWRlclNlbGVjdCIsImZpbmQiLCJwIiwic2V0U3RhdGUiLCJwcm92aWRlck5hbWUiLCJnZXRTYXZlZE1hcHMiLCJfZ2V0U2F2ZWRNYXBzIiwicHJldlByb3BzIiwiX2dldFByb3ZpZGVyIiwib25Mb2FkQ2xvdWRNYXAiLCJsb2FkUGFyYW1zIiwidmlzdWFsaXphdGlvbnMiLCJpc1Byb3ZpZGVyTG9hZGluZyIsInN0YXRlIiwiX3NlbGVjdFByb3ZpZGVyIiwiX2NsaWNrQmFjayIsImdldE1hbmFnZW1lbnRVcmwiLCJ0ZXh0RGVjb3JhdGlvbiIsImRpc3BsYXlOYW1lIiwiaWQiLCJfb25Mb2FkQ2xvdWRNYXAiLCJDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEscUJBQXFCLEdBQUdDLDZCQUFPQyxHQUFQLENBQVdDLEtBQVgsQ0FBaUI7QUFDN0NDLEVBQUFBLFNBQVMsRUFBRTtBQURrQyxDQUFqQixDQUFILG1CQUEzQjs7QUFNQSxJQUFNQyxhQUFhLEdBQUdKLDZCQUFPQyxHQUFWLG9CQUFuQjs7QUFPQSxJQUFNSSwwQkFBMEIsR0FBR0wsNkJBQU9DLEdBQVYsb0JBQWhDOztBQU1BLElBQU1LLG1CQUFtQixHQUFHTiw2QkFBT0MsR0FBVixvQkFBekI7O0FBVUEsSUFBTU0sYUFBYSxHQUFHUCw2QkFBT1EsQ0FBVixvQkFBbkI7O0FBVUEsSUFBTUMsd0JBQXdCLEdBQUdULDZCQUFPQyxHQUFWLG9CQUE5Qjs7QUFrQkEsSUFBTVMsZUFBZSxHQUFHViw2QkFBT1csRUFBVixvQkFBckI7O0FBTUEsSUFBTUMsdUJBQXVCLEdBQUdaLDZCQUFPQyxHQUFWLG9CQUE3Qjs7QUFPQSxJQUFNWSx1QkFBdUIsR0FBR2IsNkJBQU9DLEdBQVYsb0JBQTdCOztBQWdGQSxJQUFNYSxPQUFPLEdBQUcsU0FBVkEsT0FBVSxDQUFBQyxLQUFLLEVBQUk7QUFDdkIsc0JBQ0UsdUNBQVNBLEtBQVQsRUFDR0EsS0FBSyxDQUFDQyxRQURULGVBRUUsZ0NBQUMsV0FBRDtBQUFNLElBQUEsTUFBTSxFQUFD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QUFBakIsR0FBRztBQUFBLDhCQUNwQixnQ0FBQyxpQkFBRDtBQUNFLFlBQUEsR0FBRyxFQUFFQSxHQUFHLENBQUMyQyxFQURYO0FBRUUsWUFBQSxPQUFPLEVBQUU7QUFBQSxxQkFBTSxNQUFJLENBQUNDLGVBQUwsQ0FBcUIxQixRQUFyQixFQUErQmxCLEdBQS9CLENBQU47QUFBQSxhQUZYO0FBR0UsWUFBQSxHQUFHLEVBQUVBO0FBSFAsWUFEb0I7QUFBQSxTQUF0QixDQURELGdCQVNDO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZix3QkFDRSxnQ0FBQyw4QkFBRDtBQUFrQixVQUFBLEVBQUUsRUFBRTtBQUF0QixVQURGLENBVkosQ0FORixDQXZCRixDQVBKLENBYkosQ0FERjtBQXdFRDtBQWxJNEI7QUFBQTtBQUFBLElBQ0Y2QyxnQkFERTs7QUFvSS9CLFNBQU90QixjQUFQO0FBQ0Q7O2VBRWNELHFCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuaW1wb3J0IExvYWRpbmdEaWFsb2cgZnJvbSAnLi9sb2FkaW5nLWRpYWxvZyc7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IENsb3VkVGlsZSBmcm9tICcuL2Nsb3VkLXRpbGUnO1xuaW1wb3J0IHtCYXNlLCBBcnJvd0xlZnR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBQcm92aWRlck1vZGFsQ29udGFpbmVyIGZyb20gJy4vcHJvdmlkZXItbW9kYWwtY29udGFpbmVyJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcblxuY29uc3QgU3R5bGVkUHJvdmlkZXJTZWN0aW9uID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ3Byb3ZpZGVyLXNlbGVjdGlvbidcbn0pYFxuICBkaXNwbGF5OiBmbGV4O1xuYDtcblxuY29uc3QgU3R5bGVkU3Bpbm5lciA9IHN0eWxlZC5kaXZgXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgc3BhbiB7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZFZpc3VhbGl6YXRpb25TZWN0aW9uID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG5gO1xuXG5jb25zdCBTdHlsZWRTdG9yYWdlSGVhZGVyID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xuYDtcblxuY29uc3QgU3R5bGVkQmFja0J0biA9IHN0eWxlZC5hYFxuICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICBjb2xvcjogIzNhNDE0YztcbiAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICY6aG92ZXIge1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZFByb3ZpZGVyVmlzU2VjdGlvbiA9IHN0eWxlZC5kaXZgXG4gIGZsZXg6IDEgMSBhdXRvO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOGY5O1xuICBwYWRkaW5nOiAyMHB4IDI0cHg7XG4gIG1pbi1oZWlnaHQ6IDI4MHB4O1xuXG4gIC50aXRsZSB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMTZweDtcblxuICAgIHNwYW4ge1xuICAgICAgdGV4dC10cmFuc2Zvcm06IGNhcGl0YWxpemU7XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBTdHlsZWRTZXBhcmF0b3IgPSBzdHlsZWQuaHJgXG4gIGJvcmRlcjogc29saWQgI2JmYmZiZjtcbiAgYm9yZGVyLXdpZHRoOiAwIDAgMXB4IDA7XG4gIG1hcmdpbi1ib3R0b206IDE2cHg7XG5gO1xuXG5jb25zdCBTdHlsZWRWaXN1YWxpemF0aW9uTGlzdCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogcm93IHdyYXA7XG4gIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG5gO1xuXG5jb25zdCBTdHlsZWRWaXN1YWxpemF0aW9uSXRlbSA9IHN0eWxlZC5kaXZgXG4gIGZsZXg6IDAgMCBhdXRvO1xuICB3aWR0aDogMjA4cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIHBhZGRpbmc6IDE2cHggOHB4O1xuICBjb2xvcjogIzNhNDE0YztcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LXNpemU6IDEycHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuXG4gICY6aG92ZXIge1xuICAgIC52aXNfaXRlbS1pY29uLFxuICAgIC52aXNfaXRlbS10aHVtYixcbiAgICAudmlzX2l0ZW0tZGVzY3JpcHRpb24sXG4gICAgLnZpc19pdGVtLW1vZGlmaWNhdGlvbi1kYXRlIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgfVxuICB9XG5cbiAgLnZpc19pdGVtLWljb24sXG4gIC52aXNfaXRlbS10aHVtYixcbiAgLnZpc19pdGVtLWRlc2NyaXB0aW9uLFxuICAudmlzX2l0ZW0tbW9kaWZpY2F0aW9uLWRhdGUge1xuICAgIG9wYWNpdHk6IDAuOTtcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuNHMgZWFzZTtcbiAgfVxuXG4gIC52aXNfaXRlbS1pY29uIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZmxleDogMCAwIDEwOHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6ICM2YTc0ODQ7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB9XG5cbiAgLnZpc19pdGVtLXRodW1iIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZmxleDogMCAwIDEwOHB4O1xuICAgIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgfVxuXG4gIC52aXNfaXRlbS1wcml2YWN5IHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcGFkZGluZzogM3B4IDZweDtcbiAgICBib3JkZXItcmFkaXVzOiA0cHggMDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDU4LCA2NSwgNzYsIDAuNyk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udC1zaXplOiAxMXB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICB9XG5cbiAgLnZpc19pdGVtLXRpdGxlIHtcbiAgICBtYXJnaW4tdG9wOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICB9XG5cbiAgLnZpc19pdGVtLWRlc2NyaXB0aW9uIHtcbiAgICBmbGV4OiAxIDEgYXV0bztcbiAgICBtYXJnaW4tdG9wOiA4cHg7XG4gIH1cblxuICAudmlzX2l0ZW0tbW9kaWZpY2F0aW9uLWRhdGUge1xuICAgIG1hcmdpbi10b3A6IDE2cHg7XG4gICAgZmxleDogMSAwIGF1dG87XG4gICAgY29sb3I6ICM2YTc0ODQ7XG4gICAgbGluZS1oZWlnaHQ6IDE1cHg7XG4gIH1cbmA7XG5cbmNvbnN0IE1hcEljb24gPSBwcm9wcyA9PiB7XG4gIHJldHVybiAoXG4gICAgPGRpdiB7Li4ucHJvcHN9PlxuICAgICAge3Byb3BzLmNoaWxkcmVufVxuICAgICAgPEJhc2UgaGVpZ2h0PVwiMzJweFwiIHZpZXdCb3g9eycwIDAgMTYgMTYnfT5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsPVwiI2QzZDhkNlwiXG4gICAgICAgICAgZD1cIm0xMy42IDExLjU3Mi0zLjIgMi4xMzM2di05LjI3NzZsMy4yLTIuMTMzNnptLTEyLTcuMTQ0IDMuMi0yLjEzMzZ2OS4yNzc2bC0zLjIgMi4xMzM2em0xMy4yNDQgOC4yMzc2YzAuMjIyNC0wLjE0OCAwLjM1Ni0wLjM5ODQgMC4zNTYtMC42NjU2di0xMS4yYzAtMC4yOTUyLTAuMTYyNC0wLjU2NjQtMC40MjI0LTAuNzA0OC0wLjI2LTAuMTQtMC41NzYtMC4xMjQ4LTAuODIxNiAwLjAzOTJsLTQuMzEyOCAyLjg3Ni0zLjU0MzItMi44MzUyYy0wLjEyMDgtMC4wOTM2LTAuMjk1Mi0wLjE2MjQtMC40NzItMC4xNjg4LTAuMTY0OC0wLjAwNjQtMC4zNDggMC4wNDY0LTAuNDcyIDAuMTI4bC00LjggMy4yYy0wLjIyMjQgMC4xNDg4LTAuMzU2IDAuMzk4NC0wLjM1NiAwLjY2NTZ2MTEuMmMwIDAuMjk1MiAwLjE2MjQgMC41NjY0IDAuNDIyNCAwLjcwNTYgMC4xMTg0IDAuMDYzMiAwLjI0OCAwLjA5NDQgMC4zNzc2IDAuMDk0NCAwLjE1NTIgMCAwLjMwOTYtMC4wNDQ4IDAuNDQ0LTAuMTM0NGw0LjMxMjgtMi44NzYgMy41NDMyIDIuODM1MmMwLjE0NDggMC4xMTYgMC4zMjE2IDAuMTc1MiAwLjUgMC4xNzUyIDAuMTE4NCAwIDAuMjM2LTAuMDI0OCAwLjM0NjQtMC4wNzg0elwiXG4gICAgICAgIC8+XG4gICAgICA8L0Jhc2U+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5jb25zdCBQcml2YWN5QmFkZ2UgPSAoe3ByaXZhdGVNYXB9KSA9PiAoXG4gIDxzcGFuIGNsYXNzTmFtZT1cInZpc19pdGVtLXByaXZhY3lcIj57cHJpdmF0ZU1hcCA/ICdQcml2YXRlJyA6ICdQdWJsaWMnfTwvc3Bhbj5cbik7XG5cbmNvbnN0IFZpc3VhbGl6YXRpb25JdGVtID0gKHt2aXMsIG9uQ2xpY2t9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPFN0eWxlZFZpc3VhbGl6YXRpb25JdGVtIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAge3Zpcy50aHVtYm5haWwgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidmlzX2l0ZW0tdGh1bWJcIiBzdHlsZT17e2JhY2tncm91bmRJbWFnZTogYHVybCgke3Zpcy50aHVtYm5haWx9KWB9fT5cbiAgICAgICAgICB7dmlzLmhhc093blByb3BlcnR5KCdwcml2YXRlTWFwJykgPyA8UHJpdmFjeUJhZGdlIHByaXZhdGVNYXA9e3Zpcy5wcml2YXRlTWFwfSAvPiA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IChcbiAgICAgICAgPE1hcEljb24gY2xhc3NOYW1lPVwidmlzX2l0ZW0taWNvblwiPlxuICAgICAgICAgIHt2aXMuaGFzT3duUHJvcGVydHkoJ3ByaXZhdGVNYXAnKSA/IDxQcml2YWN5QmFkZ2UgcHJpdmF0ZU1hcD17dmlzLnByaXZhdGVNYXB9IC8+IDogbnVsbH1cbiAgICAgICAgPC9NYXBJY29uPlxuICAgICAgKX1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInZpc19pdGVtLXRpdGxlXCI+e3Zpcy50aXRsZX08L3NwYW4+XG4gICAgICB7dmlzLmRlc2NyaXB0aW9uICYmIHZpcy5kZXNjcmlwdGlvbi5sZW5ndGggJiYgKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ2aXNfaXRlbS1kZXNjcmlwdGlvblwiPnt2aXMuZGVzY3JpcHRpb259PC9zcGFuPlxuICAgICAgKX1cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInZpc19pdGVtLW1vZGlmaWNhdGlvbi1kYXRlXCI+XG4gICAgICAgIExhc3QgbW9kaWZpZWQge21vbWVudC51dGModmlzLmxhc3RNb2RpZmljYXRpb24pLmZyb21Ob3coKX1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L1N0eWxlZFZpc3VhbGl6YXRpb25JdGVtPlxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IFByb3ZpZGVyU2VsZWN0ID0gKHtcbiAgY2xvdWRQcm92aWRlcnMgPSBbXSxcbiAgb25TZWxlY3QsXG4gIG9uU2V0Q2xvdWRQcm92aWRlcixcbiAgY3VycmVudFByb3ZpZGVyXG59KSA9PlxuICBjbG91ZFByb3ZpZGVycy5sZW5ndGggPyAoXG4gICAgPFN0eWxlZFByb3ZpZGVyU2VjdGlvbj5cbiAgICAgIHtjbG91ZFByb3ZpZGVycy5tYXAocHJvdmlkZXIgPT4gKFxuICAgICAgICA8Q2xvdWRUaWxlXG4gICAgICAgICAga2V5PXtwcm92aWRlci5uYW1lfVxuICAgICAgICAgIG9uU2VsZWN0PXsoKSA9PiBvblNlbGVjdChwcm92aWRlci5uYW1lKX1cbiAgICAgICAgICBvblNldENsb3VkUHJvdmlkZXI9e29uU2V0Q2xvdWRQcm92aWRlcn1cbiAgICAgICAgICBjbG91ZFByb3ZpZGVyPXtwcm92aWRlcn1cbiAgICAgICAgICBpc1NlbGVjdGVkPXtwcm92aWRlci5uYW1lID09PSBjdXJyZW50UHJvdmlkZXJ9XG4gICAgICAgICAgaXNDb25uZWN0ZWQ9e0Jvb2xlYW4ocHJvdmlkZXIuZ2V0QWNjZXNzVG9rZW4gJiYgcHJvdmlkZXIuZ2V0QWNjZXNzVG9rZW4oKSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L1N0eWxlZFByb3ZpZGVyU2VjdGlvbj5cbiAgKSA6IChcbiAgICA8cD5ObyBzdG9yYWdlIHByb3ZpZGVyIGF2YWlsYWJsZTwvcD5cbiAgKTtcblxuZnVuY3Rpb24gTG9hZFN0b3JhZ2VNYXBGYWN0b3J5KCkge1xuICBjbGFzcyBMb2FkU3RvcmFnZU1hcCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGUgPSB7XG4gICAgICBzaG93UHJvdmlkZXJTZWxlY3Q6IHRydWVcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl9nZXRTYXZlZE1hcHMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgICBpZiAocHJldlByb3BzLmN1cnJlbnRQcm92aWRlciAhPT0gdGhpcy5wcm9wcy5jdXJyZW50UHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5fZ2V0U2F2ZWRNYXBzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3ZpZGVyID0gKCkgPT4ge1xuICAgICAgY29uc3Qge2N1cnJlbnRQcm92aWRlciwgY2xvdWRQcm92aWRlcnN9ID0gdGhpcy5wcm9wcztcbiAgICAgIHJldHVybiAoY2xvdWRQcm92aWRlcnMgfHwgW10pLmZpbmQocCA9PiBwLm5hbWUgPT09IGN1cnJlbnRQcm92aWRlcik7XG4gICAgfTtcblxuICAgIF9nZXRTYXZlZE1hcHMoKSB7XG4gICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMuX2dldFByb3ZpZGVyKCk7XG4gICAgICBpZiAocHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5nZXRTYXZlZE1hcHMocHJvdmlkZXIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93UHJvdmlkZXJTZWxlY3Q6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX29uTG9hZENsb3VkTWFwKHByb3ZpZGVyLCB2aXMpIHtcbiAgICAgIHRoaXMucHJvcHMub25Mb2FkQ2xvdWRNYXAoe1xuICAgICAgICBsb2FkUGFyYW1zOiB2aXMubG9hZFBhcmFtcyxcbiAgICAgICAgcHJvdmlkZXJcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9jbGlja0JhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG93UHJvdmlkZXJTZWxlY3Q6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgX3NlbGVjdFByb3ZpZGVyID0gcHJvdmlkZXJOYW1lID0+IHtcbiAgICAgIHRoaXMucHJvcHMub25TZXRDbG91ZFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICBjb25zdCBwcm92aWRlciA9ICh0aGlzLnByb3BzLmNsb3VkUHJvdmlkZXJzIHx8IFtdKS5maW5kKHAgPT4gcC5uYW1lID09PSBwcm92aWRlck5hbWUpO1xuICAgICAgdGhpcy5wcm9wcy5nZXRTYXZlZE1hcHMocHJvdmlkZXIpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1Byb3ZpZGVyU2VsZWN0OiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHZpc3VhbGl6YXRpb25zLFxuICAgICAgICBjbG91ZFByb3ZpZGVycyxcbiAgICAgICAgY3VycmVudFByb3ZpZGVyLFxuICAgICAgICBpc1Byb3ZpZGVyTG9hZGluZyxcbiAgICAgICAgb25TZXRDbG91ZFByb3ZpZGVyXG4gICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLl9nZXRQcm92aWRlcigpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8UHJvdmlkZXJNb2RhbENvbnRhaW5lclxuICAgICAgICAgIG9uU2V0Q2xvdWRQcm92aWRlcj17b25TZXRDbG91ZFByb3ZpZGVyfVxuICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXtjbG91ZFByb3ZpZGVyc31cbiAgICAgICAgICBjdXJyZW50UHJvdmlkZXI9e2N1cnJlbnRQcm92aWRlcn1cbiAgICAgICAgPlxuICAgICAgICAgIHt0aGlzLnN0YXRlLnNob3dQcm92aWRlclNlbGVjdCA/IChcbiAgICAgICAgICAgIDxQcm92aWRlclNlbGVjdFxuICAgICAgICAgICAgICBvblNlbGVjdD17dGhpcy5fc2VsZWN0UHJvdmlkZXJ9XG4gICAgICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXtjbG91ZFByb3ZpZGVyc31cbiAgICAgICAgICAgICAgb25TZXRDbG91ZFByb3ZpZGVyPXtvblNldENsb3VkUHJvdmlkZXJ9XG4gICAgICAgICAgICAgIGN1cnJlbnRQcm92aWRlcj17Y3VycmVudFByb3ZpZGVyfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAge2lzUHJvdmlkZXJMb2FkaW5nICYmIChcbiAgICAgICAgICAgICAgICA8U3R5bGVkU3Bpbm5lcj5cbiAgICAgICAgICAgICAgICAgIDxMb2FkaW5nRGlhbG9nIHNpemU9ezY0fSAvPlxuICAgICAgICAgICAgICAgIDwvU3R5bGVkU3Bpbm5lcj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgeyFpc1Byb3ZpZGVyTG9hZGluZyAmJiB2aXN1YWxpemF0aW9ucyAmJiAoXG4gICAgICAgICAgICAgICAgPFN0eWxlZFZpc3VhbGl6YXRpb25TZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgPFN0eWxlZFN0b3JhZ2VIZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgIDxTdHlsZWRCYWNrQnRuPlxuICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gbGluayBvbkNsaWNrPXt0aGlzLl9jbGlja0JhY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFycm93TGVmdCBoZWlnaHQ9XCIxNHB4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwubG9hZFN0b3JhZ2VNYXAuYmFjayd9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkQmFja0J0bj5cbiAgICAgICAgICAgICAgICAgICAge3Byb3ZpZGVyLmdldE1hbmFnZW1lbnRVcmwgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9ezF9XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtwcm92aWRlci5nZXRNYW5hZ2VtZW50VXJsKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e3RleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJ319XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9eydtb2RhbC5sb2FkU3RvcmFnZU1hcC5iYWNrJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzPXt7ZGlzcGxheU5hbWU6IHByb3ZpZGVyLmRpc3BsYXlOYW1lfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRTdG9yYWdlSGVhZGVyPlxuICAgICAgICAgICAgICAgICAgPFN0eWxlZFByb3ZpZGVyVmlzU2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y3VycmVudFByb3ZpZGVyfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmxvYWRTdG9yYWdlTWFwLnN0b3JhZ2VNYXBzJ30gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8U3R5bGVkU2VwYXJhdG9yIC8+XG4gICAgICAgICAgICAgICAgICAgIDxTdHlsZWRWaXN1YWxpemF0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICAgICAgICB7dmlzdWFsaXphdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzdWFsaXphdGlvbnMubWFwKHZpcyA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxWaXN1YWxpemF0aW9uSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dmlzLmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuX29uTG9hZENsb3VkTWFwKHByb3ZpZGVyLCB2aXMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpcz17dmlzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ2aXN1YWxpemF0aW9uLWxpc3RfX21lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5sb2FkU3RvcmFnZU1hcC5ub1NhdmVkTWFwcyd9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZFZpc3VhbGl6YXRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRQcm92aWRlclZpc1NlY3Rpb24+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRWaXN1YWxpemF0aW9uU2VjdGlvbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvUHJvdmlkZXJNb2RhbENvbnRhaW5lcj5cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBMb2FkU3RvcmFnZU1hcDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9hZFN0b3JhZ2VNYXBGYWN0b3J5O1xuIl19