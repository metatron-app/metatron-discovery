"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayerTitleSectionFactory = LayerTitleSectionFactory;
exports["default"] = exports.LayerLabelEditor = exports.DragHandle = exports.defaultProps = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactSortableHoc = require("react-sortable-hoc");

var _panelHeaderAction = _interopRequireDefault(require("../panel-header-action"));

var _icons = require("../../common/icons");

var _styledComponents2 = require("../../common/styled-components");

var _localization = require("../../../localization");

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-left: 4px;\n\n    .layer__title__type {\n      color: ", ";\n      font-size: 10px;\n      line-height: 12px;\n      letter-spacing: 0.37px;\n      text-transform: capitalize;\n    }\n  "]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  opacity: 0;\n  z-index: 1000;\n\n  :hover {\n    cursor: move;\n    opacity: 1;\n    color: ", ";\n  }\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  color: ", ";\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  height: ", "px;\n  .layer__remove-layer {\n    opacity: 0;\n  }\n  :hover {\n    cursor: pointer;\n    background-color: ", ";\n\n    .layer__drag-handle {\n      opacity: 1;\n    }\n\n    .layer__remove-layer {\n      opacity: 1;\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var propTypes = {
  // required
  layerId: _propTypes["default"].string.isRequired,
  isVisible: _propTypes["default"].bool.isRequired,
  onToggleVisibility: _propTypes["default"].func.isRequired,
  onUpdateLayerLabel: _propTypes["default"].func.isRequired,
  onToggleEnableConfig: _propTypes["default"].func.isRequired,
  onRemoveLayer: _propTypes["default"].func.isRequired,
  isConfigActive: _propTypes["default"].bool.isRequired,
  // optional
  showRemoveLayer: _propTypes["default"].bool,
  label: _propTypes["default"].string,
  layerType: _propTypes["default"].string,
  isDragNDropEnabled: _propTypes["default"].bool,
  labelRCGColorValues: _propTypes["default"].arrayOf(_propTypes["default"].number)
};
var defaultProps = {
  isDragNDropEnabled: true,
  showRemoveLayer: true
};
exports.defaultProps = defaultProps;
var StyledLayerPanelHeader = (0, _styledComponents["default"])(_styledComponents2.StyledPanelHeader)(_templateObject(), function (props) {
  return props.theme.layerPanelHeaderHeight;
}, function (props) {
  return props.theme.panelBackgroundHover;
});

var HeaderLabelSection = _styledComponents["default"].div(_templateObject2(), function (props) {
  return props.theme.textColor;
});

var HeaderActionSection = _styledComponents["default"].div(_templateObject3());

var StyledDragHandle = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.textColorHl;
});

var DragHandle = (0, _reactSortableHoc.sortableHandle)(function (_ref) {
  var className = _ref.className,
      children = _ref.children;
  return /*#__PURE__*/_react["default"].createElement(StyledDragHandle, {
    className: className
  }, children);
});
exports.DragHandle = DragHandle;

var LayerLabelEditor = function LayerLabelEditor(_ref2) {
  var layerId = _ref2.layerId,
      label = _ref2.label,
      onEdit = _ref2.onEdit;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.InlineInput, {
    type: "text",
    className: "layer__title__editor",
    value: label,
    onClick: function onClick(e) {
      e.stopPropagation();
    },
    onChange: onEdit,
    id: "".concat(layerId, ":input-layer-label")
  });
};

exports.LayerLabelEditor = LayerLabelEditor;

function LayerTitleSectionFactory() {
  var StyledLayerTitleSection = _styledComponents["default"].div(_templateObject5(), function (props) {
    return props.theme.subtextColor;
  });

  var LayerTitleSection = function LayerTitleSection(_ref3) {
    var layerType = _ref3.layerType,
        layerId = _ref3.layerId,
        label = _ref3.label,
        onUpdateLayerLabel = _ref3.onUpdateLayerLabel;
    return /*#__PURE__*/_react["default"].createElement(StyledLayerTitleSection, {
      className: "layer__title"
    }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(LayerLabelEditor, {
      layerId: layerId,
      label: label,
      onEdit: onUpdateLayerLabel
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "layer__title__type"
    }, layerType && /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: "layer.type.".concat(layerType.toLowerCase())
    }))));
  };

  return LayerTitleSection;
}

function LayerPanelHeaderFactory(LayerTitleSection) {
  var LayerPanelHeader = function LayerPanelHeader(_ref4) {
    var isConfigActive = _ref4.isConfigActive,
        isDragNDropEnabled = _ref4.isDragNDropEnabled,
        isVisible = _ref4.isVisible,
        label = _ref4.label,
        layerId = _ref4.layerId,
        layerType = _ref4.layerType,
        labelRCGColorValues = _ref4.labelRCGColorValues,
        onToggleVisibility = _ref4.onToggleVisibility,
        onUpdateLayerLabel = _ref4.onUpdateLayerLabel,
        onToggleEnableConfig = _ref4.onToggleEnableConfig,
        onRemoveLayer = _ref4.onRemoveLayer,
        showRemoveLayer = _ref4.showRemoveLayer;
    return /*#__PURE__*/_react["default"].createElement(StyledLayerPanelHeader, {
      className: (0, _classnames["default"])('layer-panel__header', {
        'sort--handle': !isConfigActive
      }),
      active: isConfigActive,
      labelRCGColorValues: labelRCGColorValues,
      onClick: onToggleEnableConfig
    }, /*#__PURE__*/_react["default"].createElement(HeaderLabelSection, {
      className: "layer-panel__header__content"
    }, isDragNDropEnabled && /*#__PURE__*/_react["default"].createElement(DragHandle, {
      className: "layer__drag-handle"
    }, /*#__PURE__*/_react["default"].createElement(_icons.VertDots, {
      height: "20px"
    })), /*#__PURE__*/_react["default"].createElement(LayerTitleSection, {
      layerId: layerId,
      label: label,
      onUpdateLayerLabel: onUpdateLayerLabel,
      layerType: layerType
    })), /*#__PURE__*/_react["default"].createElement(HeaderActionSection, {
      className: "layer-panel__header__actions"
    }, showRemoveLayer ? /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
      className: "layer__remove-layer",
      id: layerId,
      tooltip: 'tooltip.removeLayer',
      onClick: onRemoveLayer,
      tooltipType: "error",
      IconComponent: _icons.Trash
    }) : null, /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
      className: "layer__visibility-toggle",
      id: layerId,
      tooltip: isVisible ? 'tooltip.hideLayer' : 'tooltip.showLayer',
      onClick: onToggleVisibility,
      IconComponent: isVisible ? _icons.EyeSeen : _icons.EyeUnseen
    }), /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
      className: "layer__enable-config",
      id: layerId,
      tooltip: 'tooltip.layerSettings',
      onClick: onToggleEnableConfig,
      IconComponent: _icons.ArrowDown
    })));
  };

  LayerPanelHeader.propTypes = propTypes;
  LayerPanelHeader.defaultProps = defaultProps;
  return LayerPanelHeader;
}

LayerPanelHeaderFactory.deps = [LayerTitleSectionFactory];
var _default = LayerPanelHeaderFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvbGF5ZXItcGFuZWwtaGVhZGVyLmpzIl0sIm5hbWVzIjpbInByb3BUeXBlcyIsImxheWVySWQiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiaXNWaXNpYmxlIiwiYm9vbCIsIm9uVG9nZ2xlVmlzaWJpbGl0eSIsImZ1bmMiLCJvblVwZGF0ZUxheWVyTGFiZWwiLCJvblRvZ2dsZUVuYWJsZUNvbmZpZyIsIm9uUmVtb3ZlTGF5ZXIiLCJpc0NvbmZpZ0FjdGl2ZSIsInNob3dSZW1vdmVMYXllciIsImxhYmVsIiwibGF5ZXJUeXBlIiwiaXNEcmFnTkRyb3BFbmFibGVkIiwibGFiZWxSQ0dDb2xvclZhbHVlcyIsImFycmF5T2YiLCJudW1iZXIiLCJkZWZhdWx0UHJvcHMiLCJTdHlsZWRMYXllclBhbmVsSGVhZGVyIiwiU3R5bGVkUGFuZWxIZWFkZXIiLCJwcm9wcyIsInRoZW1lIiwibGF5ZXJQYW5lbEhlYWRlckhlaWdodCIsInBhbmVsQmFja2dyb3VuZEhvdmVyIiwiSGVhZGVyTGFiZWxTZWN0aW9uIiwic3R5bGVkIiwiZGl2IiwidGV4dENvbG9yIiwiSGVhZGVyQWN0aW9uU2VjdGlvbiIsIlN0eWxlZERyYWdIYW5kbGUiLCJ0ZXh0Q29sb3JIbCIsIkRyYWdIYW5kbGUiLCJjbGFzc05hbWUiLCJjaGlsZHJlbiIsIkxheWVyTGFiZWxFZGl0b3IiLCJvbkVkaXQiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwiTGF5ZXJUaXRsZVNlY3Rpb25GYWN0b3J5IiwiU3R5bGVkTGF5ZXJUaXRsZVNlY3Rpb24iLCJzdWJ0ZXh0Q29sb3IiLCJMYXllclRpdGxlU2VjdGlvbiIsInRvTG93ZXJDYXNlIiwiTGF5ZXJQYW5lbEhlYWRlckZhY3RvcnkiLCJMYXllclBhbmVsSGVhZGVyIiwiVHJhc2giLCJFeWVTZWVuIiwiRXllVW5zZWVuIiwiQXJyb3dEb3duIiwiZGVwcyJdLCJt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LGdDQUFDLDZCQUFEO0FBQ0UsTUFBQSxTQUFTLEVBQUMsMEJBRFo7QUFFRSxNQUFBLEVBQUUsRUFBRS9DLE9BRk47QUFHRSxNQUFBLE9BQU8sRUFBRUksU0FBUyxHQUFHLG1CQUFILEdBQXlCLG1CQUg3QztBQUlFLE1BQUEsT0FBTyxFQUFFRSxrQkFKWDtBQUtFLE1BQUEsYUFBYSxFQUFFRixTQUFTLEdBQUc0QyxjQUFILEdBQWFDO0FBTHZDLE1BWEYsZUFrQkUsZ0NBQUMsNkJBQUQ7QUFDRSxNQUFBLFNBQVMsRUFBQyxzQkFEWjtBQUVFLE1BQUEsRUFBRSxFQUFFakQsT0FGTjtBQUdFLE1BQUEsT0FBTyxFQUFFLHVCQUhYO0FBSUUsTUFBQSxPQUFPLEVBQUVTLG9CQUpYO0FBS0UsTUFBQSxhQUFhLEVBQUV5QztBQUxqQixNQWxCRixDQXJCRixDQWR1QjtBQUFBLEdBQXpCOztBQWdFQUosRUFBQUEsZ0JBQWdCLENBQUMvQyxTQUFqQixHQUE2QkEsU0FBN0I7QUFDQStDLEVBQUFBLGdCQUFnQixDQUFDM0IsWUFBakIsR0FBZ0NBLFlBQWhDO0FBRUEsU0FBTzJCLGdCQUFQO0FBQ0Q7O0FBQ0RELHVCQUF1QixDQUFDTSxJQUF4QixHQUErQixDQUFDWCx3QkFBRCxDQUEvQjtlQUVlSyx1QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7c29ydGFibGVIYW5kbGV9IGZyb20gJ3JlYWN0LXNvcnRhYmxlLWhvYyc7XG5pbXBvcnQgUGFuZWxIZWFkZXJBY3Rpb24gZnJvbSAnY29tcG9uZW50cy9zaWRlLXBhbmVsL3BhbmVsLWhlYWRlci1hY3Rpb24nO1xuaW1wb3J0IHtBcnJvd0Rvd24sIEV5ZVNlZW4sIEV5ZVVuc2VlbiwgVHJhc2gsIFZlcnREb3RzfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5cbmltcG9ydCB7SW5saW5lSW5wdXQsIFN0eWxlZFBhbmVsSGVhZGVyfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gcmVxdWlyZWRcbiAgbGF5ZXJJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBpc1Zpc2libGU6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIG9uVG9nZ2xlVmlzaWJpbGl0eTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25VcGRhdGVMYXllckxhYmVsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBvblRvZ2dsZUVuYWJsZUNvbmZpZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25SZW1vdmVMYXllcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgaXNDb25maWdBY3RpdmU6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG5cbiAgLy8gb3B0aW9uYWxcbiAgc2hvd1JlbW92ZUxheWVyOiBQcm9wVHlwZXMuYm9vbCxcbiAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGxheWVyVHlwZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgaXNEcmFnTkRyb3BFbmFibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgbGFiZWxSQ0dDb2xvclZhbHVlczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm51bWJlcilcbn07XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGlzRHJhZ05Ecm9wRW5hYmxlZDogdHJ1ZSxcbiAgc2hvd1JlbW92ZUxheWVyOiB0cnVlXG59O1xuXG5jb25zdCBTdHlsZWRMYXllclBhbmVsSGVhZGVyID0gc3R5bGVkKFN0eWxlZFBhbmVsSGVhZGVyKWBcbiAgaGVpZ2h0OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxheWVyUGFuZWxIZWFkZXJIZWlnaHR9cHg7XG4gIC5sYXllcl9fcmVtb3ZlLWxheWVyIHtcbiAgICBvcGFjaXR5OiAwO1xuICB9XG4gIDpob3ZlciB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCYWNrZ3JvdW5kSG92ZXJ9O1xuXG4gICAgLmxheWVyX19kcmFnLWhhbmRsZSB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC5sYXllcl9fcmVtb3ZlLWxheWVyIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBIZWFkZXJMYWJlbFNlY3Rpb24gPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3J9O1xuYDtcblxuY29uc3QgSGVhZGVyQWN0aW9uU2VjdGlvbiA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG5gO1xuXG5jb25zdCBTdHlsZWREcmFnSGFuZGxlID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgb3BhY2l0eTogMDtcbiAgei1pbmRleDogMTAwMDtcblxuICA6aG92ZXIge1xuICAgIGN1cnNvcjogbW92ZTtcbiAgICBvcGFjaXR5OiAxO1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckhsfTtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IERyYWdIYW5kbGUgPSBzb3J0YWJsZUhhbmRsZSgoe2NsYXNzTmFtZSwgY2hpbGRyZW59KSA9PiAoXG4gIDxTdHlsZWREcmFnSGFuZGxlIGNsYXNzTmFtZT17Y2xhc3NOYW1lfT57Y2hpbGRyZW59PC9TdHlsZWREcmFnSGFuZGxlPlxuKSk7XG5cbmV4cG9ydCBjb25zdCBMYXllckxhYmVsRWRpdG9yID0gKHtsYXllcklkLCBsYWJlbCwgb25FZGl0fSkgPT4gKFxuICA8SW5saW5lSW5wdXRcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgY2xhc3NOYW1lPVwibGF5ZXJfX3RpdGxlX19lZGl0b3JcIlxuICAgIHZhbHVlPXtsYWJlbH1cbiAgICBvbkNsaWNrPXtlID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfX1cbiAgICBvbkNoYW5nZT17b25FZGl0fVxuICAgIGlkPXtgJHtsYXllcklkfTppbnB1dC1sYXllci1sYWJlbGB9XG4gIC8+XG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gTGF5ZXJUaXRsZVNlY3Rpb25GYWN0b3J5KCkge1xuICBjb25zdCBTdHlsZWRMYXllclRpdGxlU2VjdGlvbiA9IHN0eWxlZC5kaXZgXG4gICAgbWFyZ2luLWxlZnQ6IDRweDtcblxuICAgIC5sYXllcl9fdGl0bGVfX3R5cGUge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc3VidGV4dENvbG9yfTtcbiAgICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxMnB4O1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuMzdweDtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplO1xuICAgIH1cbiAgYDtcbiAgY29uc3QgTGF5ZXJUaXRsZVNlY3Rpb24gPSAoe2xheWVyVHlwZSwgbGF5ZXJJZCwgbGFiZWwsIG9uVXBkYXRlTGF5ZXJMYWJlbH0pID0+IChcbiAgICA8U3R5bGVkTGF5ZXJUaXRsZVNlY3Rpb24gY2xhc3NOYW1lPVwibGF5ZXJfX3RpdGxlXCI+XG4gICAgICA8ZGl2PlxuICAgICAgICA8TGF5ZXJMYWJlbEVkaXRvciBsYXllcklkPXtsYXllcklkfSBsYWJlbD17bGFiZWx9IG9uRWRpdD17b25VcGRhdGVMYXllckxhYmVsfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxheWVyX190aXRsZV9fdHlwZVwiPlxuICAgICAgICAgIHtsYXllclR5cGUgJiYgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9e2BsYXllci50eXBlLiR7bGF5ZXJUeXBlLnRvTG93ZXJDYXNlKCl9YH0gLz59XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9TdHlsZWRMYXllclRpdGxlU2VjdGlvbj5cbiAgKTtcbiAgcmV0dXJuIExheWVyVGl0bGVTZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBMYXllclBhbmVsSGVhZGVyRmFjdG9yeShMYXllclRpdGxlU2VjdGlvbikge1xuICBjb25zdCBMYXllclBhbmVsSGVhZGVyID0gKHtcbiAgICBpc0NvbmZpZ0FjdGl2ZSxcbiAgICBpc0RyYWdORHJvcEVuYWJsZWQsXG4gICAgaXNWaXNpYmxlLFxuICAgIGxhYmVsLFxuICAgIGxheWVySWQsXG4gICAgbGF5ZXJUeXBlLFxuICAgIGxhYmVsUkNHQ29sb3JWYWx1ZXMsXG4gICAgb25Ub2dnbGVWaXNpYmlsaXR5LFxuICAgIG9uVXBkYXRlTGF5ZXJMYWJlbCxcbiAgICBvblRvZ2dsZUVuYWJsZUNvbmZpZyxcbiAgICBvblJlbW92ZUxheWVyLFxuICAgIHNob3dSZW1vdmVMYXllclxuICB9KSA9PiAoXG4gICAgPFN0eWxlZExheWVyUGFuZWxIZWFkZXJcbiAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnbGF5ZXItcGFuZWxfX2hlYWRlcicsIHtcbiAgICAgICAgJ3NvcnQtLWhhbmRsZSc6ICFpc0NvbmZpZ0FjdGl2ZVxuICAgICAgfSl9XG4gICAgICBhY3RpdmU9e2lzQ29uZmlnQWN0aXZlfVxuICAgICAgbGFiZWxSQ0dDb2xvclZhbHVlcz17bGFiZWxSQ0dDb2xvclZhbHVlc31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlRW5hYmxlQ29uZmlnfVxuICAgID5cbiAgICAgIDxIZWFkZXJMYWJlbFNlY3Rpb24gY2xhc3NOYW1lPVwibGF5ZXItcGFuZWxfX2hlYWRlcl9fY29udGVudFwiPlxuICAgICAgICB7aXNEcmFnTkRyb3BFbmFibGVkICYmIChcbiAgICAgICAgICA8RHJhZ0hhbmRsZSBjbGFzc05hbWU9XCJsYXllcl9fZHJhZy1oYW5kbGVcIj5cbiAgICAgICAgICAgIDxWZXJ0RG90cyBoZWlnaHQ9XCIyMHB4XCIgLz5cbiAgICAgICAgICA8L0RyYWdIYW5kbGU+XG4gICAgICAgICl9XG4gICAgICAgIDxMYXllclRpdGxlU2VjdGlvblxuICAgICAgICAgIGxheWVySWQ9e2xheWVySWR9XG4gICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgIG9uVXBkYXRlTGF5ZXJMYWJlbD17b25VcGRhdGVMYXllckxhYmVsfVxuICAgICAgICAgIGxheWVyVHlwZT17bGF5ZXJUeXBlfVxuICAgICAgICAvPlxuICAgICAgPC9IZWFkZXJMYWJlbFNlY3Rpb24+XG4gICAgICA8SGVhZGVyQWN0aW9uU2VjdGlvbiBjbGFzc05hbWU9XCJsYXllci1wYW5lbF9faGVhZGVyX19hY3Rpb25zXCI+XG4gICAgICAgIHtzaG93UmVtb3ZlTGF5ZXIgPyAoXG4gICAgICAgICAgPFBhbmVsSGVhZGVyQWN0aW9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJsYXllcl9fcmVtb3ZlLWxheWVyXCJcbiAgICAgICAgICAgIGlkPXtsYXllcklkfVxuICAgICAgICAgICAgdG9vbHRpcD17J3Rvb2x0aXAucmVtb3ZlTGF5ZXInfVxuICAgICAgICAgICAgb25DbGljaz17b25SZW1vdmVMYXllcn1cbiAgICAgICAgICAgIHRvb2x0aXBUeXBlPVwiZXJyb3JcIlxuICAgICAgICAgICAgSWNvbkNvbXBvbmVudD17VHJhc2h9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxQYW5lbEhlYWRlckFjdGlvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImxheWVyX192aXNpYmlsaXR5LXRvZ2dsZVwiXG4gICAgICAgICAgaWQ9e2xheWVySWR9XG4gICAgICAgICAgdG9vbHRpcD17aXNWaXNpYmxlID8gJ3Rvb2x0aXAuaGlkZUxheWVyJyA6ICd0b29sdGlwLnNob3dMYXllcid9XG4gICAgICAgICAgb25DbGljaz17b25Ub2dnbGVWaXNpYmlsaXR5fVxuICAgICAgICAgIEljb25Db21wb25lbnQ9e2lzVmlzaWJsZSA/IEV5ZVNlZW4gOiBFeWVVbnNlZW59XG4gICAgICAgIC8+XG4gICAgICAgIDxQYW5lbEhlYWRlckFjdGlvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImxheWVyX19lbmFibGUtY29uZmlnXCJcbiAgICAgICAgICBpZD17bGF5ZXJJZH1cbiAgICAgICAgICB0b29sdGlwPXsndG9vbHRpcC5sYXllclNldHRpbmdzJ31cbiAgICAgICAgICBvbkNsaWNrPXtvblRvZ2dsZUVuYWJsZUNvbmZpZ31cbiAgICAgICAgICBJY29uQ29tcG9uZW50PXtBcnJvd0Rvd259XG4gICAgICAgIC8+XG4gICAgICA8L0hlYWRlckFjdGlvblNlY3Rpb24+XG4gICAgPC9TdHlsZWRMYXllclBhbmVsSGVhZGVyPlxuICApO1xuXG4gIExheWVyUGFuZWxIZWFkZXIucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuICBMYXllclBhbmVsSGVhZGVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcblxuICByZXR1cm4gTGF5ZXJQYW5lbEhlYWRlcjtcbn1cbkxheWVyUGFuZWxIZWFkZXJGYWN0b3J5LmRlcHMgPSBbTGF5ZXJUaXRsZVNlY3Rpb25GYWN0b3J5XTtcblxuZXhwb3J0IGRlZmF1bHQgTGF5ZXJQYW5lbEhlYWRlckZhY3Rvcnk7XG4iXX0=