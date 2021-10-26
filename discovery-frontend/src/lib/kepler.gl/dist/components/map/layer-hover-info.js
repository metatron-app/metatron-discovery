"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.StyledLayerName = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _styledComponents2 = require("../common/styled-components");

var _icons = require("../common/icons");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _dataUtils = require("../../utils/data-utils");

var _interactionUtils = require("../../utils/interaction-utils");

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  & .row__delta-value {\n    text-align: right;\n\n    &.positive {\n      color: ", ";\n    }\n\n    &.negative {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: 12px;\n  letter-spacing: 0.43px;\n  text-transform: capitalize;\n  padding: 0 14px;\n  margin-top: 12px;\n\n  svg {\n    margin-right: 4px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledLayerName = (0, _styledComponents["default"])(_styledComponents2.CenterFlexbox)(_templateObject(), function (props) {
  return props.theme.textColorHl;
});
exports.StyledLayerName = StyledLayerName;

var StyledTable = _styledComponents["default"].table(_templateObject2(), function (props) {
  return props.theme.primaryBtnBgd;
}, function (props) {
  return props.theme.negativeBtnActBgd;
});

var Row = function Row(_ref) {
  var name = _ref.name,
      value = _ref.value,
      deltaValue = _ref.deltaValue,
      url = _ref.url;

  // Set 'url' to 'value' if it looks like a url
  if (!url && value && typeof value === 'string' && value.match(/^http/)) {
    url = value;
  }

  var asImg = /<img>/.test(name);
  return /*#__PURE__*/_react["default"].createElement("tr", {
    className: "row",
    key: name
  }, /*#__PURE__*/_react["default"].createElement("td", {
    className: "row__name"
  }, name), /*#__PURE__*/_react["default"].createElement("td", {
    className: "row__value"
  }, asImg ? /*#__PURE__*/_react["default"].createElement("img", {
    src: value
  }) : url ? /*#__PURE__*/_react["default"].createElement("a", {
    target: "_blank",
    rel: "noopener noreferrer",
    href: url
  }, value) : value), (0, _dataUtils.notNullorUndefined)(deltaValue) && /*#__PURE__*/_react["default"].createElement("td", {
    className: "row__delta-value ".concat(deltaValue.toString().charAt(0) === '+' ? 'positive' : 'negative')
  }, deltaValue));
};

var EntryInfo = function EntryInfo(_ref2) {
  var fieldsToShow = _ref2.fieldsToShow,
      fields = _ref2.fields,
      data = _ref2.data,
      primaryData = _ref2.primaryData,
      compareType = _ref2.compareType;
  return /*#__PURE__*/_react["default"].createElement("tbody", null, fieldsToShow.map(function (item) {
    return /*#__PURE__*/_react["default"].createElement(EntryInfoRow, {
      key: item.name,
      item: item,
      fields: fields,
      data: data,
      primaryData: primaryData,
      compareType: compareType
    });
  }));
};

var EntryInfoRow = function EntryInfoRow(_ref3) {
  var item = _ref3.item,
      fields = _ref3.fields,
      data = _ref3.data,
      primaryData = _ref3.primaryData,
      compareType = _ref3.compareType;
  var fieldIdx = fields.findIndex(function (f) {
    return f.name === item.name;
  });

  if (fieldIdx < 0) {
    return null;
  }

  var field = fields[fieldIdx];
  var displayValue = (0, _interactionUtils.getTooltipDisplayValue)({
    item: item,
    field: field,
    data: data,
    fieldIdx: fieldIdx
  });
  var displayDeltaValue = (0, _interactionUtils.getTooltipDisplayDeltaValue)({
    item: item,
    field: field,
    data: data,
    fieldIdx: fieldIdx,
    primaryData: primaryData,
    compareType: compareType
  });
  return /*#__PURE__*/_react["default"].createElement(Row, {
    name: item.name,
    value: displayValue,
    deltaValue: displayDeltaValue
  });
}; // TODO: supporting comparative value for aggregated cells as well


var CellInfo = function CellInfo(_ref4) {
  var data = _ref4.data,
      layer = _ref4.layer;
  var _layer$config = layer.config,
      colorField = _layer$config.colorField,
      sizeField = _layer$config.sizeField;
  return /*#__PURE__*/_react["default"].createElement("tbody", null, /*#__PURE__*/_react["default"].createElement(Row, {
    name: 'total points',
    key: "count",
    value: data.points && data.points.length
  }), colorField && layer.visualChannels.color ? /*#__PURE__*/_react["default"].createElement(Row, {
    name: layer.getVisualChannelDescription('color').measure,
    key: "color",
    value: data.colorValue || 'N/A'
  }) : null, sizeField && layer.visualChannels.size ? /*#__PURE__*/_react["default"].createElement(Row, {
    name: layer.getVisualChannelDescription('size').measure,
    key: "size",
    value: data.elevationValue || 'N/A'
  }) : null);
};

var LayerHoverInfoFactory = function LayerHoverInfoFactory() {
  var LayerHoverInfo = function LayerHoverInfo(props) {
    var data = props.data,
        layer = props.layer;

    if (!data || !layer) {
      return null;
    }

    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "map-popover__layer-info"
    }, /*#__PURE__*/_react["default"].createElement(StyledLayerName, {
      className: "map-popover__layer-name"
    }, /*#__PURE__*/_react["default"].createElement(_icons.Layers, {
      height: "12px"
    }), props.layer.config.label), /*#__PURE__*/_react["default"].createElement(StyledTable, null, props.layer.isAggregated ? /*#__PURE__*/_react["default"].createElement(CellInfo, props) : /*#__PURE__*/_react["default"].createElement(EntryInfo, props)));
  };

  LayerHoverInfo.propTypes = {
    fields: _propTypes["default"].arrayOf(_propTypes["default"].any),
    fieldsToShow: _propTypes["default"].arrayOf(_propTypes["default"].any),
    layer: _propTypes["default"].object,
    data: _propTypes["default"].oneOfType([_propTypes["default"].arrayOf(_propTypes["default"].any), _propTypes["default"].object])
  };
  return LayerHoverInfo;
};

var _default = LayerHoverInfoFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21hcC9sYXllci1ob3Zlci1pbmZvLmpzIl0sIm5hbWVzIjpbIlN0eWxlZExheWVyTmFtZSIsIkNlbnRlckZsZXhib3giLCJwcm9wcyIsInRoZW1lIiwidGV4dENvbG9ySGwiLCJTdHlsZWRUYWJsZSIsInN0eWxlZCIsInRhYmxlIiwicHJpbWFyeUJ0bkJnZCIsIm5lZ2F0aXZlQnRuQWN0QmdkIiwiUm93IiwibmFtZSIsInZhbHVlIiwiZGVsdGFWYWx1ZSIsInVybCIsIm1hdGNoIiwiYXNJbWciLCJ0ZXN0IiwidG9TdHJpbmciLCJjaGFyQXQiLCJFbnRyeUluZm8iLCJmaWVsZHNUb1Nob3ciLCJmaWVsZHMiLCJkYXRhIiwicHJpbWFyeURhdGEiLCJjb21wYXJlVHlwZSIsIm1hcCIsIml0ZW0iLCJFbnRyeUluZm9Sb3ciLCJmaWVsZElkeCIsImZpbmRJbmRleCIsImYiLCJmaWVsZCIsImRpc3BsYXlWYWx1ZSIsImRpc3BsYXlEZWx0YVZhbHVlIiwiQ2VsbEluZm8iLCJsYXllciIsImNvbmZpZyIsImNvbG9yRmllbGQiLCJzaXplRmllbGQiLCJwb2ludHMiLCJsZW5ndGgiLCJ2aXN1YWxDaGFubmVscyIsImNvbG9yIiwiZ2V0VmlzdWFsQ2hhbm5lbERlc2NyaXB0aW9uIiwibWVhc3VyZSIsImNvbG9yVmFsdWUiLCJzaXplIiwiZWxldmF0aW9uVmFsdWUiLCJMYXllckhvdmVySW5mb0ZhY3RvcnkiLCJMYXllckhvdmVySW5mbyIsImxhYmVsIiwiaXNBZ2dyZWdhdGVkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwiYXJyYXlPZiIsImFueSIsIm9iamVjdCIsIm9uZU9mVHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTyxJQUFNQSxlQUFlLEdBQUcsa0NBQU9DLGdDQUFQLENBQUgsb0JBQ2pCLFVB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UyxFQUFDO0FBQTNCLG9CQUNFLGdDQUFDLGFBQUQ7QUFBUSxNQUFBLE1BQU0sRUFBQztBQUFmLE1BREYsRUFFR2xDLEtBQUssQ0FBQ2tDLEtBQU4sQ0FBWUMsTUFBWixDQUFtQmMsS0FGdEIsQ0FERixlQUtFLGdDQUFDLFdBQUQsUUFDR2pELEtBQUssQ0FBQ2tDLEtBQU4sQ0FBWWdCLFlBQVosZ0JBQTJCLGdDQUFDLFFBQUQsRUFBY2xELEtBQWQsQ0FBM0IsZ0JBQXFELGdDQUFDLFNBQUQsRUFBZUEsS0FBZixDQUR4RCxDQUxGLENBREY7QUFXRCxHQWxCRDs7QUFvQkFnRCxFQUFBQSxjQUFjLENBQUNHLFNBQWYsR0FBMkI7QUFDekIvQixJQUFBQSxNQUFNLEVBQUVnQyxzQkFBVUMsT0FBVixDQUFrQkQsc0JBQVVFLEdBQTVCLENBRGlCO0FBRXpCbkMsSUFBQUEsWUFBWSxFQUFFaUMsc0JBQVVDLE9BQVYsQ0FBa0JELHNCQUFVRSxHQUE1QixDQUZXO0FBR3pCcEIsSUFBQUEsS0FBSyxFQUFFa0Isc0JBQVVHLE1BSFE7QUFJekJsQyxJQUFBQSxJQUFJLEVBQUUrQixzQkFBVUksU0FBVixDQUFvQixDQUFDSixzQkFBVUMsT0FBVixDQUFrQkQsc0JBQVVFLEdBQTVCLENBQUQsRUFBbUNGLHNCQUFVRyxNQUE3QyxDQUFwQjtBQUptQixHQUEzQjtBQU1BLFNBQU9QLGNBQVA7QUFDRCxDQTVCRDs7ZUE4QmVELHFCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtDZW50ZXJGbGV4Ym94fSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge0xheWVyc30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7bm90TnVsbG9yVW5kZWZpbmVkfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7Z2V0VG9vbHRpcERpc3BsYXlWYWx1ZSwgZ2V0VG9vbHRpcERpc3BsYXlEZWx0YVZhbHVlfSBmcm9tICd1dGlscy9pbnRlcmFjdGlvbi11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRMYXllck5hbWUgPSBzdHlsZWQoQ2VudGVyRmxleGJveClgXG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckhsfTtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBsZXR0ZXItc3BhY2luZzogMC40M3B4O1xuICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTtcbiAgcGFkZGluZzogMCAxNHB4O1xuICBtYXJnaW4tdG9wOiAxMnB4O1xuXG4gIHN2ZyB7XG4gICAgbWFyZ2luLXJpZ2h0OiA0cHg7XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZFRhYmxlID0gc3R5bGVkLnRhYmxlYFxuICAmIC5yb3dfX2RlbHRhLXZhbHVlIHtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcblxuICAgICYucG9zaXRpdmUge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucHJpbWFyeUJ0bkJnZH07XG4gICAgfVxuXG4gICAgJi5uZWdhdGl2ZSB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5uZWdhdGl2ZUJ0bkFjdEJnZH07XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBSb3cgPSAoe25hbWUsIHZhbHVlLCBkZWx0YVZhbHVlLCB1cmx9KSA9PiB7XG4gIC8vIFNldCAndXJsJyB0byAndmFsdWUnIGlmIGl0IGxvb2tzIGxpa2UgYSB1cmxcbiAgaWYgKCF1cmwgJiYgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5tYXRjaCgvXmh0dHAvKSkge1xuICAgIHVybCA9IHZhbHVlO1xuICB9XG5cbiAgY29uc3QgYXNJbWcgPSAvPGltZz4vLnRlc3QobmFtZSk7XG4gIHJldHVybiAoXG4gICAgPHRyIGNsYXNzTmFtZT1cInJvd1wiIGtleT17bmFtZX0+XG4gICAgICA8dGQgY2xhc3NOYW1lPVwicm93X19uYW1lXCI+e25hbWV9PC90ZD5cbiAgICAgIDx0ZCBjbGFzc05hbWU9XCJyb3dfX3ZhbHVlXCI+XG4gICAgICAgIHthc0ltZyA/IChcbiAgICAgICAgICA8aW1nIHNyYz17dmFsdWV9IC8+XG4gICAgICAgICkgOiB1cmwgPyAoXG4gICAgICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIGhyZWY9e3VybH0+XG4gICAgICAgICAgICB7dmFsdWV9XG4gICAgICAgICAgPC9hPlxuICAgICAgICApIDogKFxuICAgICAgICAgIHZhbHVlXG4gICAgICAgICl9XG4gICAgICA8L3RkPlxuICAgICAge25vdE51bGxvclVuZGVmaW5lZChkZWx0YVZhbHVlKSAmJiAoXG4gICAgICAgIDx0ZFxuICAgICAgICAgIGNsYXNzTmFtZT17YHJvd19fZGVsdGEtdmFsdWUgJHtcbiAgICAgICAgICAgIGRlbHRhVmFsdWUudG9TdHJpbmcoKS5jaGFyQXQoMCkgPT09ICcrJyA/ICdwb3NpdGl2ZScgOiAnbmVnYXRpdmUnXG4gICAgICAgICAgfWB9XG4gICAgICAgID5cbiAgICAgICAgICB7ZGVsdGFWYWx1ZX1cbiAgICAgICAgPC90ZD5cbiAgICAgICl9XG4gICAgPC90cj5cbiAgKTtcbn07XG5cbmNvbnN0IEVudHJ5SW5mbyA9ICh7ZmllbGRzVG9TaG93LCBmaWVsZHMsIGRhdGEsIHByaW1hcnlEYXRhLCBjb21wYXJlVHlwZX0pID0+IChcbiAgPHRib2R5PlxuICAgIHtmaWVsZHNUb1Nob3cubWFwKGl0ZW0gPT4gKFxuICAgICAgPEVudHJ5SW5mb1Jvd1xuICAgICAgICBrZXk9e2l0ZW0ubmFtZX1cbiAgICAgICAgaXRlbT17aXRlbX1cbiAgICAgICAgZmllbGRzPXtmaWVsZHN9XG4gICAgICAgIGRhdGE9e2RhdGF9XG4gICAgICAgIHByaW1hcnlEYXRhPXtwcmltYXJ5RGF0YX1cbiAgICAgICAgY29tcGFyZVR5cGU9e2NvbXBhcmVUeXBlfVxuICAgICAgLz5cbiAgICApKX1cbiAgPC90Ym9keT5cbik7XG5cbmNvbnN0IEVudHJ5SW5mb1JvdyA9ICh7aXRlbSwgZmllbGRzLCBkYXRhLCBwcmltYXJ5RGF0YSwgY29tcGFyZVR5cGV9KSA9PiB7XG4gIGNvbnN0IGZpZWxkSWR4ID0gZmllbGRzLmZpbmRJbmRleChmID0+IGYubmFtZSA9PT0gaXRlbS5uYW1lKTtcbiAgaWYgKGZpZWxkSWR4IDwgMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGZpZWxkID0gZmllbGRzW2ZpZWxkSWR4XTtcbiAgY29uc3QgZGlzcGxheVZhbHVlID0gZ2V0VG9vbHRpcERpc3BsYXlWYWx1ZSh7aXRlbSwgZmllbGQsIGRhdGEsIGZpZWxkSWR4fSk7XG5cbiAgY29uc3QgZGlzcGxheURlbHRhVmFsdWUgPSBnZXRUb29sdGlwRGlzcGxheURlbHRhVmFsdWUoe1xuICAgIGl0ZW0sXG4gICAgZmllbGQsXG4gICAgZGF0YSxcbiAgICBmaWVsZElkeCxcbiAgICBwcmltYXJ5RGF0YSxcbiAgICBjb21wYXJlVHlwZVxuICB9KTtcblxuICByZXR1cm4gPFJvdyBuYW1lPXtpdGVtLm5hbWV9IHZhbHVlPXtkaXNwbGF5VmFsdWV9IGRlbHRhVmFsdWU9e2Rpc3BsYXlEZWx0YVZhbHVlfSAvPjtcbn07XG5cbi8vIFRPRE86IHN1cHBvcnRpbmcgY29tcGFyYXRpdmUgdmFsdWUgZm9yIGFnZ3JlZ2F0ZWQgY2VsbHMgYXMgd2VsbFxuY29uc3QgQ2VsbEluZm8gPSAoe2RhdGEsIGxheWVyfSkgPT4ge1xuICBjb25zdCB7Y29sb3JGaWVsZCwgc2l6ZUZpZWxkfSA9IGxheWVyLmNvbmZpZztcblxuICByZXR1cm4gKFxuICAgIDx0Ym9keT5cbiAgICAgIDxSb3cgbmFtZT17J3RvdGFsIHBvaW50cyd9IGtleT1cImNvdW50XCIgdmFsdWU9e2RhdGEucG9pbnRzICYmIGRhdGEucG9pbnRzLmxlbmd0aH0gLz5cbiAgICAgIHtjb2xvckZpZWxkICYmIGxheWVyLnZpc3VhbENoYW5uZWxzLmNvbG9yID8gKFxuICAgICAgICA8Um93XG4gICAgICAgICAgbmFtZT17bGF5ZXIuZ2V0VmlzdWFsQ2hhbm5lbERlc2NyaXB0aW9uKCdjb2xvcicpLm1lYXN1cmV9XG4gICAgICAgICAga2V5PVwiY29sb3JcIlxuICAgICAgICAgIHZhbHVlPXtkYXRhLmNvbG9yVmFsdWUgfHwgJ04vQSd9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIHtzaXplRmllbGQgJiYgbGF5ZXIudmlzdWFsQ2hhbm5lbHMuc2l6ZSA/IChcbiAgICAgICAgPFJvd1xuICAgICAgICAgIG5hbWU9e2xheWVyLmdldFZpc3VhbENoYW5uZWxEZXNjcmlwdGlvbignc2l6ZScpLm1lYXN1cmV9XG4gICAgICAgICAga2V5PVwic2l6ZVwiXG4gICAgICAgICAgdmFsdWU9e2RhdGEuZWxldmF0aW9uVmFsdWUgfHwgJ04vQSd9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L3Rib2R5PlxuICApO1xufTtcblxuY29uc3QgTGF5ZXJIb3ZlckluZm9GYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBMYXllckhvdmVySW5mbyA9IHByb3BzID0+IHtcbiAgICBjb25zdCB7ZGF0YSwgbGF5ZXJ9ID0gcHJvcHM7XG5cbiAgICBpZiAoIWRhdGEgfHwgIWxheWVyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXAtcG9wb3Zlcl9fbGF5ZXItaW5mb1wiPlxuICAgICAgICA8U3R5bGVkTGF5ZXJOYW1lIGNsYXNzTmFtZT1cIm1hcC1wb3BvdmVyX19sYXllci1uYW1lXCI+XG4gICAgICAgICAgPExheWVycyBoZWlnaHQ9XCIxMnB4XCIgLz5cbiAgICAgICAgICB7cHJvcHMubGF5ZXIuY29uZmlnLmxhYmVsfVxuICAgICAgICA8L1N0eWxlZExheWVyTmFtZT5cbiAgICAgICAgPFN0eWxlZFRhYmxlPlxuICAgICAgICAgIHtwcm9wcy5sYXllci5pc0FnZ3JlZ2F0ZWQgPyA8Q2VsbEluZm8gey4uLnByb3BzfSAvPiA6IDxFbnRyeUluZm8gey4uLnByb3BzfSAvPn1cbiAgICAgICAgPC9TdHlsZWRUYWJsZT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH07XG5cbiAgTGF5ZXJIb3ZlckluZm8ucHJvcFR5cGVzID0ge1xuICAgIGZpZWxkczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSksXG4gICAgZmllbGRzVG9TaG93OiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuYW55KSxcbiAgICBsYXllcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBkYXRhOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuYW55KSwgUHJvcFR5cGVzLm9iamVjdF0pXG4gIH07XG4gIHJldHVybiBMYXllckhvdmVySW5mbztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IExheWVySG92ZXJJbmZvRmFjdG9yeTtcbiJdfQ==