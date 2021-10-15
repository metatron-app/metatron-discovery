"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var _layerConfigurator = _interopRequireDefault(require("./layer-configurator"));

var _layerPanelHeader = _interopRequireDefault(require("./layer-panel-header"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 12px;\n  border-radius: 1px;\n  margin-bottom: 8px;\n  z-index: 1000;\n\n  &.dragging {\n    cursor: move;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var PanelWrapper = _styledComponents["default"].div(_templateObject());

LayerPanelFactory.deps = [_layerConfigurator["default"], _layerPanelHeader["default"]];

function LayerPanelFactory(LayerConfigurator, LayerPanelHeader) {
  var LayerPanel = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(LayerPanel, _Component);

    var _super = _createSuper(LayerPanel);

    function LayerPanel() {
      var _this;

      (0, _classCallCheck2["default"])(this, LayerPanel);

      for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
        _args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(_args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerConfig", function (newProp) {
        _this.props.layerConfigChange(_this.props.layer, newProp);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerType", function (newType) {
        _this.props.layerTypeChange(_this.props.layer, newType);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerVisConfig", function (newVisConfig) {
        _this.props.layerVisConfigChange(_this.props.layer, newVisConfig);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerColorUI", function () {
        var _this$props;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        (_this$props = _this.props).layerColorUIChange.apply(_this$props, [_this.props.layer].concat(args));
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerTextLabel", function () {
        var _this$props2;

        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        (_this$props2 = _this.props).layerTextLabelChange.apply(_this$props2, [_this.props.layer].concat(args));
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "updateLayerVisualChannelConfig", function (newConfig, channel, scaleKey) {
        _this.props.layerVisualChannelConfigChange(_this.props.layer, newConfig, channel, scaleKey);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateLayerLabel", function (_ref) {
        var value = _ref.target.value;

        _this.updateLayerConfig({
          label: value
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleVisibility", function (e) {
        e.stopPropagation();
        var isVisible = !_this.props.layer.config.isVisible;

        _this.updateLayerConfig({
          isVisible: isVisible
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleEnableConfig", function (e) {
        e.stopPropagation();
        var isConfigActive = _this.props.layer.config.isConfigActive;

        _this.updateLayerConfig({
          isConfigActive: !isConfigActive
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_removeLayer", function (e) {
        e.stopPropagation();

        _this.props.removeLayer(_this.props.idx);
      });
      return _this;
    }

    (0, _createClass2["default"])(LayerPanel, [{
      key: "render",
      value: function render() {
        var _this$props3 = this.props,
            layer = _this$props3.layer,
            datasets = _this$props3.datasets,
            layerTypeOptions = _this$props3.layerTypeOptions;
        var config = layer.config;
        var isConfigActive = config.isConfigActive;
        return /*#__PURE__*/_react["default"].createElement(PanelWrapper, {
          active: isConfigActive,
          className: "layer-panel ".concat(this.props.className),
          style: this.props.style,
          onMouseDown: this.props.onMouseDown,
          onTouchStart: this.props.onTouchStart
        }, /*#__PURE__*/_react["default"].createElement(LayerPanelHeader, {
          isConfigActive: isConfigActive,
          layerId: layer.id,
          isVisible: config.isVisible,
          label: config.label,
          labelRCGColorValues: config.dataId ? datasets[config.dataId].color : null,
          layerType: layer.type,
          onToggleEnableConfig: this._toggleEnableConfig,
          onToggleVisibility: this._toggleVisibility,
          onUpdateLayerLabel: this._updateLayerLabel,
          onRemoveLayer: this._removeLayer
        }), isConfigActive && /*#__PURE__*/_react["default"].createElement(LayerConfigurator, {
          layer: layer,
          datasets: datasets,
          layerTypeOptions: layerTypeOptions,
          openModal: this.props.openModal,
          updateLayerColorUI: this.updateLayerColorUI,
          updateLayerConfig: this.updateLayerConfig,
          updateLayerVisualChannelConfig: this.updateLayerVisualChannelConfig,
          updateLayerType: this.updateLayerType,
          updateLayerTextLabel: this.updateLayerTextLabel,
          updateLayerVisConfig: this.updateLayerVisConfig
        }));
      }
    }]);
    return LayerPanel;
  }(_react.Component);

  (0, _defineProperty2["default"])(LayerPanel, "propTypes", {
    layer: _propTypes["default"].object.isRequired,
    datasets: _propTypes["default"].object.isRequired,
    idx: _propTypes["default"].number.isRequired,
    layerConfigChange: _propTypes["default"].func.isRequired,
    layerTypeChange: _propTypes["default"].func.isRequired,
    openModal: _propTypes["default"].func.isRequired,
    removeLayer: _propTypes["default"].func.isRequired,
    onCloseConfig: _propTypes["default"].func,
    layerTypeOptions: _propTypes["default"].arrayOf(_propTypes["default"].any),
    layerVisConfigChange: _propTypes["default"].func.isRequired,
    layerVisualChannelConfigChange: _propTypes["default"].func.isRequired,
    layerColorUIChange: _propTypes["default"].func.isRequired,
    updateAnimationTime: _propTypes["default"].func,
    updateLayerAnimationSpeed: _propTypes["default"].func
  });
  return LayerPanel;
}

var _default = LayerPanelFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvbGF5ZXItcGFuZWwuanMiXSwibmFtZXMiOlsiUGFuZWxXcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwiTGF5ZXJQYW5lbEZhY3RvcnkiLCJkZXBzIiwiTGF5ZXJDb25maWd1cmF0b3JGYWN0b3J5IiwiTGF5ZXJQYW5lbEhlYWRlckZhY3RvcnkiLCJMYXllckNvbmZpZ3VyYXRvciIsIkxheWVyUGFuZWxIZWFkZXIiLCJMYXllclBhbmVsIiwibmV3UHJvcCIsInByb3BzIiwibGF5ZXJDb25maWdDaGFuZ2UiLCJsYXllciIsIm5ld1R5cGUiLCJsYXllclR5cGVDaGFuZ2UiLCJuZXdWaXNDb25maWciLCJsYXllclZpc0NvbmZpZ0NoYW5nZSIsImFyZ3MiLCJsYXllckNvbG9yVUlDaGFuZ2UiLCJsYXllclRleHRMYWJlbENoYW5nZSIsIm5ld0NvbmZpZyIsImNoYW5uZWwiLCJzY2FsZUtleSIsImxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZ0NoYW5nZSIsInZhbHVlIiwidGFyZ2V0IiwidXBkYXRlTGF5ZXJDb25maWciLCJsYWJlbCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJpc1Zpc2libGUiLCJjb25maWciLCJpc0NvbmZpZ0FjdGl2ZSIsInJlbW92ZUxheWVyIiwiaWR4IiwiZGF0YXNldHMiLCJsYXllclR5cGVPcHRpb25zIiwiY2xhc3NOYW1lIiwic3R5bGUiLCJvbk1vdXNlRG93biIsIm9uVG91Y2hTdGFydCIsImlkIiwiZGF0YUlkIiwiY29sb3IiLCJ0eXBlIiwiX3RvZ2dsZUVuYWJsZUNvbmZpZyIsIl90b2dnbGVWaXNpYmlsaXR5IiwiX3VwZGF0ZUxheWVyTGFiZWwiLCJfcmVtb3ZlTGF5ZXIiLCJvcGVuTW9kYWwiLCJ1cGRhdGVMYXllckNvbG9yVUkiLCJ1cGRhdGVMYXllclZpc3VhbENoYW5uZWxDb25maWciLCJ1cGRhdGVMYXllclR5cGUiLCJ1cGRhdGVMYXllclRleHRMYWJlbCIsInVwZGF0ZUxheWVyVmlzQ29uZmlnIiwiQ29tcG9uZW50IiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsIm51bWJlciIsImZ1bmMiLCJvbkNsb3NlQ29uZmlnIiwiYXJyYXlPZiIsImFueSIsInVwZGF0ZUFuaW1hdGlvblRpbWUiLCJ1cGRhdGVMYXllckFuaW1hdGlvblNwZWVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUFsQjs7QUFXQUMsaUJBQWlCLENBQUNDLElBQWxCLEdBQXlCLENBQUNDLDZCQUFELEVBQTJCQyw0QkFBM0IsQ0FBekI7O0FBRUEsU0FBU0gsaUJBQVQsQ0FBMkJJLGlCQUEzQixFQUE4Q0MsZ0JBQTlDLEVBQWdFO0FBQUEsTUFDeERDLFVBRHdEO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSw0R0FtQnhDLFVBQUFDLE9BQU8sRUFBSTtBQUM3QixjQUFLQyxLQUFMLENBQVdDLGlCQUFYLENBQTZCLE1BQUtELEtBQUwsQ0FBV0UsS0FBeEMsRUFBK0NILE9BQS9DO0FBQ0QsT0FyQjJEO0FBQUEsMEdBdUIxQyxVQUFBSSxPQUFPLEVBQUk7QUFDM0IsY0FBS0gsS0FBTCxDQUFXSSxlQUFYLENBQTJCLE1BQUtKLEtBQUwsQ0FBV0UsS0FBdEMsRUFBNkNDLE9BQTdDO0FBQ0QsT0F6QjJEO0FBQUEsK0dBMkJyQyxVQUFBRSxZQUFZLEVBQUk7QUFDckMsY0FBS0wsS0FBTCxDQUFXTSxvQkFBWCxDQUFnQyxNQUFLTixLQUFMLENBQVdFLEtBQTNDLEVBQWtERyxZQUFsRDtBQUNELE9BN0IyRDtBQUFBLDZHQStCdkMsWUFBYTtBQUFBOztBQUFBLDJDQUFURSxJQUFTO0FBQVRBLFVBQUFBLElBQVM7QUFBQTs7QUFDaEMsNkJBQUtQLEtB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ZUYsVUFOVDtBQU9qQnpCLElBQUFBLFdBQVcsRUFBRXVCLHNCQUFVSSxJQUFWLENBQWVGLFVBUFg7QUFRakJHLElBQUFBLGFBQWEsRUFBRUwsc0JBQVVJLElBUlI7QUFTakJ4QixJQUFBQSxnQkFBZ0IsRUFBRW9CLHNCQUFVTSxPQUFWLENBQWtCTixzQkFBVU8sR0FBNUIsQ0FURDtBQVVqQi9DLElBQUFBLG9CQUFvQixFQUFFd0Msc0JBQVVJLElBQVYsQ0FBZUYsVUFWcEI7QUFXakJuQyxJQUFBQSw4QkFBOEIsRUFBRWlDLHNCQUFVSSxJQUFWLENBQWVGLFVBWDlCO0FBWWpCeEMsSUFBQUEsa0JBQWtCLEVBQUVzQyxzQkFBVUksSUFBVixDQUFlRixVQVpsQjtBQWFqQk0sSUFBQUEsbUJBQW1CLEVBQUVSLHNCQUFVSSxJQWJkO0FBY2pCSyxJQUFBQSx5QkFBeUIsRUFBRVQsc0JBQVVJO0FBZHBCLEdBRnlDO0FBZ0g5RCxTQUFPcEQsVUFBUDtBQUNEOztlQUVjTixpQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgTGF5ZXJDb25maWd1cmF0b3JGYWN0b3J5IGZyb20gJy4vbGF5ZXItY29uZmlndXJhdG9yJztcbmltcG9ydCBMYXllclBhbmVsSGVhZGVyRmFjdG9yeSBmcm9tICcuL2xheWVyLXBhbmVsLWhlYWRlcic7XG5cbmNvbnN0IFBhbmVsV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgYm9yZGVyLXJhZGl1czogMXB4O1xuICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gIHotaW5kZXg6IDEwMDA7XG5cbiAgJi5kcmFnZ2luZyB7XG4gICAgY3Vyc29yOiBtb3ZlO1xuICB9XG5gO1xuXG5MYXllclBhbmVsRmFjdG9yeS5kZXBzID0gW0xheWVyQ29uZmlndXJhdG9yRmFjdG9yeSwgTGF5ZXJQYW5lbEhlYWRlckZhY3RvcnldO1xuXG5mdW5jdGlvbiBMYXllclBhbmVsRmFjdG9yeShMYXllckNvbmZpZ3VyYXRvciwgTGF5ZXJQYW5lbEhlYWRlcikge1xuICBjbGFzcyBMYXllclBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgbGF5ZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGRhdGFzZXRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBpZHg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyQ29uZmlnQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgbGF5ZXJUeXBlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgb3Blbk1vZGFsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgcmVtb3ZlTGF5ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBvbkNsb3NlQ29uZmlnOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgIGxheWVyVHlwZU9wdGlvbnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLFxuICAgICAgbGF5ZXJWaXNDb25maWdDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsYXllckNvbG9yVUlDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICB1cGRhdGVBbmltYXRpb25UaW1lOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgIHVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWQ6IFByb3BUeXBlcy5mdW5jXG4gICAgfTtcblxuICAgIHVwZGF0ZUxheWVyQ29uZmlnID0gbmV3UHJvcCA9PiB7XG4gICAgICB0aGlzLnByb3BzLmxheWVyQ29uZmlnQ2hhbmdlKHRoaXMucHJvcHMubGF5ZXIsIG5ld1Byb3ApO1xuICAgIH07XG5cbiAgICB1cGRhdGVMYXllclR5cGUgPSBuZXdUeXBlID0+IHtcbiAgICAgIHRoaXMucHJvcHMubGF5ZXJUeXBlQ2hhbmdlKHRoaXMucHJvcHMubGF5ZXIsIG5ld1R5cGUpO1xuICAgIH07XG5cbiAgICB1cGRhdGVMYXllclZpc0NvbmZpZyA9IG5ld1Zpc0NvbmZpZyA9PiB7XG4gICAgICB0aGlzLnByb3BzLmxheWVyVmlzQ29uZmlnQ2hhbmdlKHRoaXMucHJvcHMubGF5ZXIsIG5ld1Zpc0NvbmZpZyk7XG4gICAgfTtcblxuICAgIHVwZGF0ZUxheWVyQ29sb3JVSSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLmxheWVyQ29sb3JVSUNoYW5nZSh0aGlzLnByb3BzLmxheWVyLCAuLi5hcmdzKTtcbiAgICB9O1xuXG4gICAgdXBkYXRlTGF5ZXJUZXh0TGFiZWwgPSAoLi4uYXJncykgPT4ge1xuICAgICAgdGhpcy5wcm9wcy5sYXllclRleHRMYWJlbENoYW5nZSh0aGlzLnByb3BzLmxheWVyLCAuLi5hcmdzKTtcbiAgICB9O1xuXG4gICAgdXBkYXRlTGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnID0gKG5ld0NvbmZpZywgY2hhbm5lbCwgc2NhbGVLZXkpID0+IHtcbiAgICAgIHRoaXMucHJvcHMubGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlKHRoaXMucHJvcHMubGF5ZXIsIG5ld0NvbmZpZywgY2hhbm5lbCwgc2NhbGVLZXkpO1xuICAgIH07XG5cbiAgICBfdXBkYXRlTGF5ZXJMYWJlbCA9ICh7dGFyZ2V0OiB7dmFsdWV9fSkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVMYXllckNvbmZpZyh7bGFiZWw6IHZhbHVlfSk7XG4gICAgfTtcblxuICAgIF90b2dnbGVWaXNpYmlsaXR5ID0gZSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgY29uc3QgaXNWaXNpYmxlID0gIXRoaXMucHJvcHMubGF5ZXIuY29uZmlnLmlzVmlzaWJsZTtcbiAgICAgIHRoaXMudXBkYXRlTGF5ZXJDb25maWcoe2lzVmlzaWJsZX0pO1xuICAgIH07XG5cbiAgICBfdG9nZ2xlRW5hYmxlQ29uZmlnID0gZSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBsYXllcjoge1xuICAgICAgICAgIGNvbmZpZzoge2lzQ29uZmlnQWN0aXZlfVxuICAgICAgICB9XG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHRoaXMudXBkYXRlTGF5ZXJDb25maWcoe2lzQ29uZmlnQWN0aXZlOiAhaXNDb25maWdBY3RpdmV9KTtcbiAgICB9O1xuXG4gICAgX3JlbW92ZUxheWVyID0gZSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5wcm9wcy5yZW1vdmVMYXllcih0aGlzLnByb3BzLmlkeCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtsYXllciwgZGF0YXNldHMsIGxheWVyVHlwZU9wdGlvbnN9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHtjb25maWd9ID0gbGF5ZXI7XG4gICAgICBjb25zdCB7aXNDb25maWdBY3RpdmV9ID0gY29uZmlnO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8UGFuZWxXcmFwcGVyXG4gICAgICAgICAgYWN0aXZlPXtpc0NvbmZpZ0FjdGl2ZX1cbiAgICAgICAgICBjbGFzc05hbWU9e2BsYXllci1wYW5lbCAke3RoaXMucHJvcHMuY2xhc3NOYW1lfWB9XG4gICAgICAgICAgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9XG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMucHJvcHMub25Nb3VzZURvd259XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0PXt0aGlzLnByb3BzLm9uVG91Y2hTdGFydH1cbiAgICAgICAgPlxuICAgICAgICAgIDxMYXllclBhbmVsSGVhZGVyXG4gICAgICAgICAgICBpc0NvbmZpZ0FjdGl2ZT17aXNDb25maWdBY3RpdmV9XG4gICAgICAgICAgICBsYXllcklkPXtsYXllci5pZH1cbiAgICAgICAgICAgIGlzVmlzaWJsZT17Y29uZmlnLmlzVmlzaWJsZX1cbiAgICAgICAgICAgIGxhYmVsPXtjb25maWcubGFiZWx9XG4gICAgICAgICAgICBsYWJlbFJDR0NvbG9yVmFsdWVzPXtjb25maWcuZGF0YUlkID8gZGF0YXNldHNbY29uZmlnLmRhdGFJZF0uY29sb3IgOiBudWxsfVxuICAgICAgICAgICAgbGF5ZXJUeXBlPXtsYXllci50eXBlfVxuICAgICAgICAgICAgb25Ub2dnbGVFbmFibGVDb25maWc9e3RoaXMuX3RvZ2dsZUVuYWJsZUNvbmZpZ31cbiAgICAgICAgICAgIG9uVG9nZ2xlVmlzaWJpbGl0eT17dGhpcy5fdG9nZ2xlVmlzaWJpbGl0eX1cbiAgICAgICAgICAgIG9uVXBkYXRlTGF5ZXJMYWJlbD17dGhpcy5fdXBkYXRlTGF5ZXJMYWJlbH1cbiAgICAgICAgICAgIG9uUmVtb3ZlTGF5ZXI9e3RoaXMuX3JlbW92ZUxheWVyfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2lzQ29uZmlnQWN0aXZlICYmIChcbiAgICAgICAgICAgIDxMYXllckNvbmZpZ3VyYXRvclxuICAgICAgICAgICAgICBsYXllcj17bGF5ZXJ9XG4gICAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgICAgbGF5ZXJUeXBlT3B0aW9ucz17bGF5ZXJUeXBlT3B0aW9uc31cbiAgICAgICAgICAgICAgb3Blbk1vZGFsPXt0aGlzLnByb3BzLm9wZW5Nb2RhbH1cbiAgICAgICAgICAgICAgdXBkYXRlTGF5ZXJDb2xvclVJPXt0aGlzLnVwZGF0ZUxheWVyQ29sb3JVSX1cbiAgICAgICAgICAgICAgdXBkYXRlTGF5ZXJDb25maWc9e3RoaXMudXBkYXRlTGF5ZXJDb25maWd9XG4gICAgICAgICAgICAgIHVwZGF0ZUxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZz17dGhpcy51cGRhdGVMYXllclZpc3VhbENoYW5uZWxDb25maWd9XG4gICAgICAgICAgICAgIHVwZGF0ZUxheWVyVHlwZT17dGhpcy51cGRhdGVMYXllclR5cGV9XG4gICAgICAgICAgICAgIHVwZGF0ZUxheWVyVGV4dExhYmVsPXt0aGlzLnVwZGF0ZUxheWVyVGV4dExhYmVsfVxuICAgICAgICAgICAgICB1cGRhdGVMYXllclZpc0NvbmZpZz17dGhpcy51cGRhdGVMYXllclZpc0NvbmZpZ31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYW5lbFdyYXBwZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBMYXllclBhbmVsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBMYXllclBhbmVsRmFjdG9yeTtcbiJdfQ==