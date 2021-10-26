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

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = require("../common/styled-components");

var _mapStyleSelector = _interopRequireDefault(require("./map-style-panel/map-style-selector"));

var _mapLayerSelector = _interopRequireDefault(require("./map-style-panel/map-layer-selector"));

var _icons = require("../common/icons");

var _defaultSettings = require("../../constants/default-settings");

var _colorSelector = _interopRequireDefault(require("./layer-panel/color-selector"));

var _reselect = require("reselect");

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

MapManagerFactory.deps = [_mapStyleSelector["default"], _mapLayerSelector["default"]];

function MapManagerFactory(MapStyleSelector, LayerGroupSelector) {
  var MapManager = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(MapManager, _Component);

    var _super = _createSuper(MapManager);

    function MapManager() {
      var _this;

      (0, _classCallCheck2["default"])(this, MapManager);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        isSelecting: false
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "buildingColorSelector", function (props) {
        return props.mapStyle.threeDBuildingColor;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setColorSelector", function (props) {
        return props.set3dBuildingColor;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleSelecting", function () {
        _this.setState({
          isSelecting: !_this.state.isSelecting
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_selectStyle", function (val) {
        _this.props.onStyleChange(val);

        _this._toggleSelecting();
      });
      return _this;
    }

    (0, _createClass2["default"])(MapManager, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            mapStyle = _this$props.mapStyle,
            intl = _this$props.intl;

        var editableLayers = _defaultSettings.DEFAULT_LAYER_GROUPS.map(function (lg) {
          return lg.slug;
        });

        var hasBuildingLayer = mapStyle.visibleLayerGroups['3d building'];
        var colorSetSelector = (0, _reselect.createSelector)(this.buildingColorSelector, this.setColorSelector, function (selectedColor, setColor) {
          return [{
            selectedColor: selectedColor,
            setColor: setColor,
            isRange: false,
            label: intl.formatMessage({
              id: 'mapManager.3dBuildingColor'
            })
          }];
        });
        var colorSets = colorSetSelector(this.props);
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "map-style-panel"
        }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(MapStyleSelector, {
          mapStyle: mapStyle,
          isSelecting: this.state.isSelecting,
          onChange: this._selectStyle,
          toggleActive: this._toggleSelecting
        }), editableLayers.length ? /*#__PURE__*/_react["default"].createElement(LayerGroupSelector, {
          layers: mapStyle.visibleLayerGroups,
          editableLayers: editableLayers,
          topLayers: mapStyle.topLayerGroups,
          onChange: this.props.onConfigChange
        }) : null, /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_colorSelector["default"], {
          colorSets: colorSets,
          disabled: !hasBuildingLayer
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents.Button, {
          className: "add-map-style-button",
          onClick: this.props.showAddMapStyleModal,
          secondary: true
        }, /*#__PURE__*/_react["default"].createElement(_icons.Add, {
          height: "12px"
        }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'mapManager.addMapStyle'
        }))));
      }
    }]);
    return MapManager;
  }(_react.Component);

  (0, _defineProperty2["default"])(MapManager, "propTypes", {
    mapStyle: _propTypes["default"].object.isRequired,
    onConfigChange: _propTypes["default"].func.isRequired,
    onStyleChange: _propTypes["default"].func.isRequired,
    showAddMapStyleModal: _propTypes["default"].func.isRequired
  });
  return (0, _reactIntl.injectIntl)(MapManager);
}

var _default = MapManagerFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbWFwLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiTWFwTWFuYWdlckZhY3RvcnkiLCJkZXBzIiwiTWFwU3R5bGVTZWxlY3RvckZhY3RvcnkiLCJMYXllckdyb3VwU2VsZWN0b3JGYWN0b3J5IiwiTWFwU3R5bGVTZWxlY3RvciIsIkxheWVyR3JvdXBTZWxlY3RvciIsIk1hcE1hbmFnZXIiLCJpc1NlbGVjdGluZyIsInByb3BzIiwibWFwU3R5bGUiLCJ0aHJlZURCdWlsZGluZ0NvbG9yIiwic2V0M2RCdWlsZGluZ0NvbG9yIiwic2V0U3RhdGUiLCJzdGF0ZSIsInZhbCIsIm9uU3R5bGVDaGFuZ2UiLCJfdG9nZ2xlU2VsZWN0aW5nIiwiaW50bCIsImVkaXRhYmxlTGF5ZXJzIiwiREVGQVVMVF9MQVlFUl9HUk9VUFMiLCJtYXAiLCJsZyIsInNsdWciLCJoYXNCdWlsZGluZ0xheWVyIiwidmlzaWJsZUxheWVyR3JvdXBzIiwiY29sb3JTZXRTZWxlY3RvciIsImJ1aWxkaW5nQ29sb3JTZWxlY3RvciIsInNldENvbG9yU2VsZWN0b3IiLCJzZWxlY3RlZENvbG9yIiwic2V0Q29sb3IiLCJpc1JhbmdlIiwibGFiZWwiLCJmb3JtYXRNZXNzYWdlIiwiaWQiLCJjb2xvclNldHMiLCJfc2VsZWN0U3R5bGUiLCJsZW5ndGgiLCJ0b3BMYXllckdyb3VwcyIsIm9uQ29uZmlnQ2hhbmdlIiwic2hvd0FkZE1hcFN0eWxlTW9kYWwiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUFBLGlCQUFpQixDQUFDQyxJQUFsQixHQUF5QixDQUFDQyw0QkFBRCxFQUEwQkMsNEJBQTFC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O0FBQVosVUFMRixlQU1FLGdDQUFDLDhCQUFEO0FBQWtCLFVBQUEsRUFBRSxFQUFFO0FBQXRCLFVBTkYsQ0FsQkYsQ0FERixDQURGO0FBK0JEO0FBM0U0RDtBQUFBO0FBQUEsSUFDdENDLGdCQURzQzs7QUFBQSxtQ0FDekRsQyxVQUR5RCxlQUUxQztBQUNqQkcsSUFBQUEsUUFBUSxFQUFFZ0Msc0JBQVVDLE1BQVYsQ0FBaUJDLFVBRFY7QUFFakJMLElBQUFBLGNBQWMsRUFBRUcsc0JBQVVHLElBQVYsQ0FBZUQsVUFGZDtBQUdqQjVCLElBQUFBLGFBQWEsRUFBRTBCLHNCQUFVRyxJQUFWLENBQWVELFVBSGI7QUFJakJKLElBQUFBLG9CQUFvQixFQUFFRSxzQkFBVUcsSUFBVixDQUFlRDtBQUpwQixHQUYwQztBQTZFL0QsU0FBTywyQkFBV3JDLFVBQVgsQ0FBUDtBQUNEOztlQUVjTixpQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtCdXR0b24sIFNpZGVQYW5lbFNlY3Rpb259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBNYXBTdHlsZVNlbGVjdG9yRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvbWFwLXN0eWxlLXBhbmVsL21hcC1zdHlsZS1zZWxlY3Rvcic7XG5pbXBvcnQgTGF5ZXJHcm91cFNlbGVjdG9yRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvbWFwLXN0eWxlLXBhbmVsL21hcC1sYXllci1zZWxlY3Rvcic7XG5cbmltcG9ydCB7QWRkfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQge0RFRkFVTFRfTEFZRVJfR1JPVVBTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQgQ29sb3JTZWxlY3RvciBmcm9tICcuL2xheWVyLXBhbmVsL2NvbG9yLXNlbGVjdG9yJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCB7aW5qZWN0SW50bH0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5cbk1hcE1hbmFnZXJGYWN0b3J5LmRlcHMgPSBbTWFwU3R5bGVTZWxlY3RvckZhY3RvcnksIExheWVyR3JvdXBTZWxlY3RvckZhY3RvcnldO1xuXG5mdW5jdGlvbiBNYXBNYW5hZ2VyRmFjdG9yeShNYXBTdHlsZVNlbGVjdG9yLCBMYXllckdyb3VwU2VsZWN0b3IpIHtcbiAgY2xhc3MgTWFwTWFuYWdlciBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgIG1hcFN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBvbkNvbmZpZ0NoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIG9uU3R5bGVDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBzaG93QWRkTWFwU3R5bGVNb2RhbDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgIGlzU2VsZWN0aW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICBidWlsZGluZ0NvbG9yU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5tYXBTdHlsZS50aHJlZURCdWlsZGluZ0NvbG9yO1xuICAgIHNldENvbG9yU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5zZXQzZEJ1aWxkaW5nQ29sb3I7XG5cbiAgICBfdG9nZ2xlU2VsZWN0aW5nID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNTZWxlY3Rpbmc6ICF0aGlzLnN0YXRlLmlzU2VsZWN0aW5nfSk7XG4gICAgfTtcblxuICAgIF9zZWxlY3RTdHlsZSA9IHZhbCA9PiB7XG4gICAgICB0aGlzLnByb3BzLm9uU3R5bGVDaGFuZ2UodmFsKTtcbiAgICAgIHRoaXMuX3RvZ2dsZVNlbGVjdGluZygpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7bWFwU3R5bGUsIGludGx9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGVkaXRhYmxlTGF5ZXJzID0gREVGQVVMVF9MQVlFUl9HUk9VUFMubWFwKGxnID0+IGxnLnNsdWcpO1xuICAgICAgY29uc3QgaGFzQnVpbGRpbmdMYXllciA9IG1hcFN0eWxlLnZpc2libGVMYXllckdyb3Vwc1snM2QgYnVpbGRpbmcnXTtcbiAgICAgIGNvbnN0IGNvbG9yU2V0U2VsZWN0b3IgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgICAgdGhpcy5idWlsZGluZ0NvbG9yU2VsZWN0b3IsXG4gICAgICAgIHRoaXMuc2V0Q29sb3JTZWxlY3RvcixcbiAgICAgICAgKHNlbGVjdGVkQ29sb3IsIHNldENvbG9yKSA9PiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2VsZWN0ZWRDb2xvcixcbiAgICAgICAgICAgIHNldENvbG9yLFxuICAgICAgICAgICAgaXNSYW5nZTogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogaW50bC5mb3JtYXRNZXNzYWdlKHtpZDogJ21hcE1hbmFnZXIuM2RCdWlsZGluZ0NvbG9yJ30pXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICApO1xuXG4gICAgICBjb25zdCBjb2xvclNldHMgPSBjb2xvclNldFNlbGVjdG9yKHRoaXMucHJvcHMpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1hcC1zdHlsZS1wYW5lbFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8TWFwU3R5bGVTZWxlY3RvclxuICAgICAgICAgICAgICBtYXBTdHlsZT17bWFwU3R5bGV9XG4gICAgICAgICAgICAgIGlzU2VsZWN0aW5nPXt0aGlzLnN0YXRlLmlzU2VsZWN0aW5nfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fc2VsZWN0U3R5bGV9XG4gICAgICAgICAgICAgIHRvZ2dsZUFjdGl2ZT17dGhpcy5fdG9nZ2xlU2VsZWN0aW5nfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlZGl0YWJsZUxheWVycy5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIDxMYXllckdyb3VwU2VsZWN0b3JcbiAgICAgICAgICAgICAgICBsYXllcnM9e21hcFN0eWxlLnZpc2libGVMYXllckdyb3Vwc31cbiAgICAgICAgICAgICAgICBlZGl0YWJsZUxheWVycz17ZWRpdGFibGVMYXllcnN9XG4gICAgICAgICAgICAgICAgdG9wTGF5ZXJzPXttYXBTdHlsZS50b3BMYXllckdyb3Vwc31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICAgIDxDb2xvclNlbGVjdG9yIGNvbG9yU2V0cz17Y29sb3JTZXRzfSBkaXNhYmxlZD17IWhhc0J1aWxkaW5nTGF5ZXJ9IC8+XG4gICAgICAgICAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFkZC1tYXAtc3R5bGUtYnV0dG9uXCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5zaG93QWRkTWFwU3R5bGVNb2RhbH1cbiAgICAgICAgICAgICAgc2Vjb25kYXJ5XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxBZGQgaGVpZ2h0PVwiMTJweFwiIC8+XG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbWFwTWFuYWdlci5hZGRNYXBTdHlsZSd9IC8+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaW5qZWN0SW50bChNYXBNYW5hZ2VyKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwTWFuYWdlckZhY3Rvcnk7XG4iXX0=