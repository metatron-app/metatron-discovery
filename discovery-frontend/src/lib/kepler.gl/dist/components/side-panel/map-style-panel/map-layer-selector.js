"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _panelHeaderAction = _interopRequireDefault(require("../panel-header-action"));

var _icons = require("../../common/icons");

var _styledComponents2 = require("../../common/styled-components");

var _localization = require("../../../localization");

var _utils = require("../../../utils/utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 10px;\n  display: flex;\n  justify-content: space-between;\n\n  &:last-child {\n    margin-bottom: 0;\n  }\n\n  .layer-group__visibility-toggle {\n    margin-right: 12px;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding-bottom: 12px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledInteractionPanel = _styledComponents["default"].div(_templateObject());

var StyledLayerGroupItem = _styledComponents["default"].div(_templateObject2());

var LayerLabel = (0, _styledComponents["default"])(_styledComponents2.PanelLabelBold)(_templateObject3(), function (props) {
  return props.active ? props.theme.textColor : props.theme.labelColor;
});

function LayerGroupSelectorFactory() {
  var LayerGroupSelector = function LayerGroupSelector(_ref) {
    var layers = _ref.layers,
        editableLayers = _ref.editableLayers,
        onChange = _ref.onChange,
        topLayers = _ref.topLayers;
    return /*#__PURE__*/_react["default"].createElement(StyledInteractionPanel, {
      className: "map-style__layer-group__selector"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "layer-group__header"
    }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'mapLayers.title'
    }))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelContent, {
      className: "map-style__layer-group"
    }, editableLayers.map(function (slug) {
      return /*#__PURE__*/_react["default"].createElement(StyledLayerGroupItem, {
        className: "layer-group__select",
        key: slug
      }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabelWrapper, null, /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
        className: "layer-group__visibility-toggle",
        id: "".concat(slug, "-toggle"),
        tooltip: layers[slug] ? 'tooltip.hide' : 'tooltip.show',
        onClick: function onClick() {
          return onChange({
            visibleLayerGroups: _objectSpread(_objectSpread({}, layers), {}, (0, _defineProperty2["default"])({}, slug, !layers[slug]))
          });
        },
        IconComponent: layers[slug] ? _icons.EyeSeen : _icons.EyeUnseen,
        active: layers[slug],
        flush: true
      }), /*#__PURE__*/_react["default"].createElement(LayerLabel, {
        active: layers[slug]
      }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: "mapLayers.".concat((0, _utils.camelize)(slug))
      }))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, {
        className: "layer-group__bring-top"
      }, /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
        id: "".concat(slug, "-top"),
        tooltip: "tooltip.moveToTop",
        disabled: !layers[slug],
        IconComponent: _icons.Upload,
        active: topLayers[slug],
        onClick: function onClick() {
          return onChange({
            topLayerGroups: _objectSpread(_objectSpread({}, topLayers), {}, (0, _defineProperty2["default"])({}, slug, !topLayers[slug]))
          });
        }
      })));
    })));
  };

  return LayerGroupSelector;
}

var _default = LayerGroupSelectorFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbWFwLXN0eWxlLXBhbmVsL21hcC1sYXllci1zZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJTdHlsZWRJbnRlcmFjdGlvblBhbmVsIiwic3R5bGVkIiwiZGl2IiwiU3R5bGVkTGF5ZXJHcm91cEl0ZW0iLCJMYXllckxhYmVsIiwiUGFuZWxMYWJlbEJvbGQiLCJwcm9wcyIsImFjdGl2ZSIsInRoZW1lIiwidGV4dENvbG9yIiwibGFiZWxDb2xvciIsIkxheWVyR3JvdXBTZWxlY3RvckZhY3RvcnkiLCJMYXllckdyb3VwU2VsZWN0b3IiLCJsYXllcnMiLCJlZGl0YWJsZUxheWVycyIsIm9uQ2hhbmdlIiwidG9wTGF5ZXJzIiwibWFwIiwic2x1ZyIsInZpc2libGVMYXllckdyb3VwcyIsIkV5ZVNlZW4iLCJFeWVVbnNlZW4iLCJVcGxvYWQiLCJ0b3BMYXllckdyb3VwcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFPQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsc0JBQXNCLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUE1Qjs7QUFJQSxJQUFNQyxvQkFBb0IsR0FBR0YsNkJBQU9DLEdBQVYsb0JBQTFCOztBQWNBLElBQU1FLFVBQVUsR0FBRyxrQ0FBT0MsaUNBQVAsQ0FBSCxxQkFDTCxVQUFBQyxLQUFLO0FBQUEsU0FBS0EsS0FBSyxDQUFDQyxNQUFOLEdBQWVELEtBQUssQ0FBQ0UsS0FBTixDQUFZQyxTQUEzQixHQUF1Q0gsS0FBSyxDQUFDRSxLQUFOLENBQVlFLFVBQXhEO0FBQUEsQ0FEQSxDQUFoQjs7QUFJQSxTQUFTQyx5QkFBVCxHQUFxQztBQUNuQyxNQUFNQyxrQkFBa0IsR0FBRyxTQUFyQkEsa0JBQXFCO0FBQUEsUUFBRUMsTUFBRixRQUFFQSxNQUFGO0FBQUEsUUFBVUMsY0FBVixRQUFVQSxjQUFWO0FBQUEsUUFBMEJDLFFBQTFCLFFBQTBCQSxRQUExQjtBQUFBLFFBQW9DQyxTQUFwQyxRQUFvQ0EsU0FBcEM7QUFBQSx3QkFDekIsZ0NBQUMsc0JBQUQ7QUFBd0IsTUFBQSxTQUFTLEVBQUM7QUFBbEMsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLGdDQUFDLDZCQUFELHFCQUNFLGdDQUFDLDhCQUFEO0FBQWtCLE1BQUEsRUFBRSxFQUFFO0FBQXRCLE1BREYsQ0FERixDQURGLGVBTUUsZ0NBQUMsK0JBQUQ7QUFBYyxNQUFBLFNBQVMsRUFBQztBQUF4QixPQUNHRixjQUFjLENBQUNHLEdBQWYsQ0FBbUIsVUFBQUMsSUFBSTtBQUFBLDBCQUN0QixnQ0FBQyxvQkFBRDtBQUFzQixRQUFBLFNBQVMsRUFBQyxxQkFBaEM7QUFBc0QsUUFBQSxHQUFHLEVBQUVBO0FBQTNELHNCQUNFLGdDQUFDLG9DQUFELHFCQUNFLGdDQUFDLDZCQUFEO0FBQ0UsUUFBQSxTQUFTLEVBQUMsZ0NBRFo7QUFFRSxRQUFBLEVBQUUsWUFBS0EsSUFBTCxZQUZKO0FBR0UsUUFBQSxPQUFPLEVBQUVMLE1BQU0sQ0FBQ0ssSUFBRCxDQUFOLEdBQWUsY0FBZixHQUFnQyxjQUgzQztBQUlFLFFBQUEsT0FBTyxFQUFFO0FBQUEsaUJBQ1BILFFBQVEsQ0FBQztBQUNQSSxZQUFBQSxrQkFBa0Isa0NBQ2JOLE1BRGEsNENBRWZLLElBRmUsRUFFUixDQUFDTCxNQUFNLENBQUNLLElBQUQsQ0FGQztBQURYLFdBQUQsQ0FERDtBQUFBLFNBSlg7QUFZRSxRQUFBLGFBQWEsRUFBRUwsTUFBTSxDQUFDSyxJQUFELENBQU4sR0FBZUUsY0FBZixHQUF5QkMsZ0JBWjFDO0FBYUUsUUFBQSxNQUFNLEVBQUVSLE1BQU0sQ0FBQ0ssSUFBRCxDQWJoQjtBQWNFLFFBQUEsS0FBSztBQWRQLFFBREYsZUFpQkUsZ0NBQUMsVUFBRDtBQUFZLFFBQUEsTUFBTSxFQUFFTCxNQUFNLENBQUNLLElBQUQ7QUFBMUIsc0JBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsUUFBQSxFQUFFLHNCQUFlLHFCQUFTQSxJQUFULENBQWY7QUFBcEIsUUFERixDQWpCRixDQURGLGVBc0JFLGdDQUFDLGdDQUFEO0FBQWUsUUFBQSxTQUFTLEVBQUM7QUFBekIsc0JBQ0UsZ0NBQUMsNkJBQUQ7QUFDRSxRQUFBLEVBQUUsWUFBS0EsSUFBTCxTQURKO0FBRUUsUUFBQSxPQUFPLEVBQUMsbUJBRlY7QUFHRSxRQUFBLFFBQVEsRUFBRSxDQUFDTCxNQUFNLENBQUNLLElBQUQsQ0FIbkI7QUFJRSxRQUFBLGFBQWEsRUFBRUksYUFKakI7QUFLRSxRQUFBLE1BQU0sRUFBRU4sU0FBUyxDQUFDRSxJQUFELENBTG5CO0FBTUUsUUFBQSxPQUFPLEVBQUU7QUFBQSxpQkFDUEgsUUFBUSxDQUFDO0FBQ1BRLFlBQUFBLGNBQWMsa0NBQ1RQLFNBRFMsNENBRVhFLElBRlcsRUFFSixDQUFDRixTQUFTLENBQUNFLElBQUQsQ0FGTjtBQURQLFdBQUQsQ0FERDtBQUFBO0FBTlgsUUFERixDQXRCRixDQURzQjtBQUFBLEtBQXZCLENBREgsQ0FORixDQUR5QjtBQUFBLEdBQTNCOztBQXNEQSxTQUFPTixrQkFBUDtBQUNEOztlQUVjRCx5QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBQYW5lbEhlYWRlckFjdGlvbiBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvcGFuZWwtaGVhZGVyLWFjdGlvbic7XG5pbXBvcnQge0V5ZVNlZW4sIEV5ZVVuc2VlbiwgVXBsb2FkfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5cbmltcG9ydCB7XG4gIFBhbmVsTGFiZWwsXG4gIFBhbmVsQ29udGVudCxcbiAgUGFuZWxMYWJlbEJvbGQsXG4gIFBhbmVsTGFiZWxXcmFwcGVyLFxuICBDZW50ZXJGbGV4Ym94XG59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcbmltcG9ydCB7Y2FtZWxpemV9IGZyb20gJ3V0aWxzL3V0aWxzJztcblxuY29uc3QgU3R5bGVkSW50ZXJhY3Rpb25QYW5lbCA9IHN0eWxlZC5kaXZgXG4gIHBhZGRpbmctYm90dG9tOiAxMnB4O1xuYDtcblxuY29uc3QgU3R5bGVkTGF5ZXJHcm91cEl0ZW0gPSBzdHlsZWQuZGl2YFxuICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG5cbiAgJjpsYXN0LWNoaWxkIHtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICB9XG5cbiAgLmxheWVyLWdyb3VwX192aXNpYmlsaXR5LXRvZ2dsZSB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMnB4O1xuICB9XG5gO1xuXG5jb25zdCBMYXllckxhYmVsID0gc3R5bGVkKFBhbmVsTGFiZWxCb2xkKWBcbiAgY29sb3I6ICR7cHJvcHMgPT4gKHByb3BzLmFjdGl2ZSA/IHByb3BzLnRoZW1lLnRleHRDb2xvciA6IHByb3BzLnRoZW1lLmxhYmVsQ29sb3IpfTtcbmA7XG5cbmZ1bmN0aW9uIExheWVyR3JvdXBTZWxlY3RvckZhY3RvcnkoKSB7XG4gIGNvbnN0IExheWVyR3JvdXBTZWxlY3RvciA9ICh7bGF5ZXJzLCBlZGl0YWJsZUxheWVycywgb25DaGFuZ2UsIHRvcExheWVyc30pID0+IChcbiAgICA8U3R5bGVkSW50ZXJhY3Rpb25QYW5lbCBjbGFzc05hbWU9XCJtYXAtc3R5bGVfX2xheWVyLWdyb3VwX19zZWxlY3RvclwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJsYXllci1ncm91cF9faGVhZGVyXCI+XG4gICAgICAgIDxQYW5lbExhYmVsPlxuICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbWFwTGF5ZXJzLnRpdGxlJ30gLz5cbiAgICAgICAgPC9QYW5lbExhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgICA8UGFuZWxDb250ZW50IGNsYXNzTmFtZT1cIm1hcC1zdHlsZV9fbGF5ZXItZ3JvdXBcIj5cbiAgICAgICAge2VkaXRhYmxlTGF5ZXJzLm1hcChzbHVnID0+IChcbiAgICAgICAgICA8U3R5bGVkTGF5ZXJHcm91cEl0ZW0gY2xhc3NOYW1lPVwibGF5ZXItZ3JvdXBfX3NlbGVjdFwiIGtleT17c2x1Z30+XG4gICAgICAgICAgICA8UGFuZWxMYWJlbFdyYXBwZXI+XG4gICAgICAgICAgICAgIDxQYW5lbEhlYWRlckFjdGlvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxheWVyLWdyb3VwX192aXNpYmlsaXR5LXRvZ2dsZVwiXG4gICAgICAgICAgICAgICAgaWQ9e2Ake3NsdWd9LXRvZ2dsZWB9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17bGF5ZXJzW3NsdWddID8gJ3Rvb2x0aXAuaGlkZScgOiAndG9vbHRpcC5zaG93J31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlTGF5ZXJHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi5sYXllcnMsXG4gICAgICAgICAgICAgICAgICAgICAgW3NsdWddOiAhbGF5ZXJzW3NsdWddXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIEljb25Db21wb25lbnQ9e2xheWVyc1tzbHVnXSA/IEV5ZVNlZW4gOiBFeWVVbnNlZW59XG4gICAgICAgICAgICAgICAgYWN0aXZlPXtsYXllcnNbc2x1Z119XG4gICAgICAgICAgICAgICAgZmx1c2hcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPExheWVyTGFiZWwgYWN0aXZlPXtsYXllcnNbc2x1Z119PlxuICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXtgbWFwTGF5ZXJzLiR7Y2FtZWxpemUoc2x1Zyl9YH0gLz5cbiAgICAgICAgICAgICAgPC9MYXllckxhYmVsPlxuICAgICAgICAgICAgPC9QYW5lbExhYmVsV3JhcHBlcj5cbiAgICAgICAgICAgIDxDZW50ZXJGbGV4Ym94IGNsYXNzTmFtZT1cImxheWVyLWdyb3VwX19icmluZy10b3BcIj5cbiAgICAgICAgICAgICAgPFBhbmVsSGVhZGVyQWN0aW9uXG4gICAgICAgICAgICAgICAgaWQ9e2Ake3NsdWd9LXRvcGB9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD1cInRvb2x0aXAubW92ZVRvVG9wXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWxheWVyc1tzbHVnXX1cbiAgICAgICAgICAgICAgICBJY29uQ29tcG9uZW50PXtVcGxvYWR9XG4gICAgICAgICAgICAgICAgYWN0aXZlPXt0b3BMYXllcnNbc2x1Z119XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wTGF5ZXJHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi50b3BMYXllcnMsXG4gICAgICAgICAgICAgICAgICAgICAgW3NsdWddOiAhdG9wTGF5ZXJzW3NsdWddXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICAgIDwvU3R5bGVkTGF5ZXJHcm91cEl0ZW0+XG4gICAgICAgICkpfVxuICAgICAgPC9QYW5lbENvbnRlbnQ+XG4gICAgPC9TdHlsZWRJbnRlcmFjdGlvblBhbmVsPlxuICApO1xuXG4gIHJldHVybiBMYXllckdyb3VwU2VsZWN0b3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IExheWVyR3JvdXBTZWxlY3RvckZhY3Rvcnk7XG4iXX0=