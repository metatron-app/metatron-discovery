"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _classnames = _interopRequireDefault(require("classnames"));

var _mapbox = _interopRequireDefault(require("mapbox"));

var _reactIntl = require("react-intl");

var _viewportMercatorProject = require("viewport-mercator-project");

var _keyevent = _interopRequireDefault(require("../../constants/keyevent"));

var _styledComponents2 = require("../common/styled-components");

var _icons = require("../common/icons");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: relative;\n  color: ", ";\n\n  .geocoder-input {\n    box-shadow: ", ";\n\n    .geocoder-input__search {\n      position: absolute;\n      height: ", "px;\n      width: 30px;\n      padding-left: 6px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: ", ";\n    }\n\n    input {\n      padding: 4px 36px;\n      height: ", "px;\n    }\n  }\n\n  .geocoder-results {\n    box-shadow: ", ";\n    background-color: ", ";\n    position: absolute;\n    width: ", "px;\n    margin-top: ", "px;\n  }\n\n  .geocoder-item {\n    ", ";\n    ", ";\n\n    &.active {\n      background-color: ", ";\n    }\n  }\n\n  .remove-result {\n    position: absolute;\n    right: 16px;\n    top: 0px;\n    height: ", "px;\n    display: flex;\n    align-items: center;\n\n    :hover {\n      cursor: pointer;\n      color: ", ";\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var debounceTimeout = null;

var StyledContainer = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.boxShadow;
}, function (props) {
  return props.theme.geocoderInputHeight;
}, function (props) {
  return props.theme.subtextColor;
}, function (props) {
  return props.theme.geocoderInputHeight;
}, function (props) {
  return props.theme.boxShadow;
}, function (props) {
  return props.theme.panelBackground;
}, function (props) {
  return Number.isFinite(props.width) ? props.width : props.theme.geocoderWidth;
}, function (props) {
  return props.theme.dropdownWapperMargin;
}, function (props) {
  return props.theme.dropdownListItem;
}, function (props) {
  return props.theme.textTruncate;
}, function (props) {
  return props.theme.dropdownListHighlightBg;
}, function (props) {
  return props.theme.geocoderInputHeight;
}, function (props) {
  return props.theme.textColorHl;
});

var PLACEHOLDER = 'Enter an Address';

var GeoCoder = function GeoCoder(_ref) {
  var mapboxApiAccessToken = _ref.mapboxApiAccessToken,
      _ref$className = _ref.className,
      className = _ref$className === void 0 ? '' : _ref$className,
      _ref$initialInputValu = _ref.initialInputValue,
      initialInputValue = _ref$initialInputValu === void 0 ? '' : _ref$initialInputValu,
      _ref$limit = _ref.limit,
      limit = _ref$limit === void 0 ? 5 : _ref$limit,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 300 : _ref$timeout,
      _ref$formatItem = _ref.formatItem,
      formatItem = _ref$formatItem === void 0 ? function (item) {
    return item.place_name;
  } : _ref$formatItem,
      viewport = _ref.viewport,
      onSelected = _ref.onSelected,
      onDeleteMarker = _ref.onDeleteMarker,
      transitionDuration = _ref.transitionDuration,
      pointZoom = _ref.pointZoom,
      width = _ref.width,
      intl = _ref.intl;

  var _useState = (0, _react.useState)(initialInputValue),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      inputValue = _useState2[0],
      setInputValue = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
      showResults = _useState4[0],
      setShowResults = _useState4[1];

  var _useState5 = (0, _react.useState)(false),
      _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
      showDelete = _useState6[0],
      setShowDelete = _useState6[1];

  var _useState7 = (0, _react.useState)([]),
      _useState8 = (0, _slicedToArray2["default"])(_useState7, 2),
      results = _useState8[0],
      setResults = _useState8[1];

  var _useState9 = (0, _react.useState)(0),
      _useState10 = (0, _slicedToArray2["default"])(_useState9, 2),
      selectedIndex = _useState10[0],
      setSelectedIndex = _useState10[1];

  var client = (0, _react.useMemo)(function () {
    return new _mapbox["default"](mapboxApiAccessToken);
  }, [mapboxApiAccessToken]);
  var onChange = (0, _react.useCallback)(function (event) {
    var queryString = event.target.value;
    setInputValue(queryString);
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(limit > 0 && Boolean(queryString))) {
                _context.next = 6;
                break;
              }

              _context.next = 3;
              return client.geocodeForward(queryString, {
                limit: limit
              });

            case 3:
              response = _context.sent;
              setShowResults(true);
              setResults(response.entity.features);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })), timeout);
  }, [client, limit, timeout, setResults, setShowResults]);
  var onBlur = (0, _react.useCallback)(function () {
    setTimeout(function () {
      setShowResults(false);
    }, timeout);
  }, [setShowResults, timeout]);
  var onFocus = (0, _react.useCallback)(function () {
    return setShowResults(true);
  }, [setShowResults]);
  var onItemSelected = (0, _react.useCallback)(function (item) {
    var newViewport = new _viewportMercatorProject.WebMercatorViewport(viewport);
    var bbox = item.bbox,
        center = item.center;
    newViewport = bbox ? newViewport.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]]) : {
      longitude: center[0],
      latitude: center[1],
      zoom: pointZoom
    };
    var _newViewport = newViewport,
        longitude = _newViewport.longitude,
        latitude = _newViewport.latitude,
        zoom = _newViewport.zoom;
    onSelected(_objectSpread(_objectSpread({}, viewport), {
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      transitionDuration: transitionDuration
    }), item);
    setShowResults(false);
    setInputValue(formatItem(item));
    setShowDelete(true);
  }, [viewport, onSelected, transitionDuration, pointZoom, formatItem]);
  var onMarkDeleted = (0, _react.useCallback)(function () {
    setShowDelete(false);
    setInputValue('');
    onDeleteMarker();
  }, [onDeleteMarker]);
  var onKeyDown = (0, _react.useCallback)(function (e) {
    switch (e.keyCode) {
      case _keyevent["default"].DOM_VK_UP:
        setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : selectedIndex);
        break;

      case _keyevent["default"].DOM_VK_DOWN:
        setSelectedIndex(selectedIndex < results.length - 1 ? selectedIndex + 1 : selectedIndex);
        break;

      case _keyevent["default"].DOM_VK_ENTER:
      case _keyevent["default"].DOM_VK_RETURN:
        onItemSelected(results[selectedIndex]);
        break;

      default:
        break;
    }
  }, [results, selectedIndex, setSelectedIndex, onItemSelected]);
  return /*#__PURE__*/_react["default"].createElement(StyledContainer, {
    className: className,
    width: width
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "geocoder-input"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "geocoder-input__search"
  }, /*#__PURE__*/_react["default"].createElement(_icons.Search, {
    height: "20px"
  })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.Input, {
    type: "text",
    onChange: onChange,
    onBlur: onBlur,
    onFocus: onFocus,
    onKeyDown: onKeyDown,
    value: inputValue,
    placeholder: intl ? intl.formatMessage({
      id: 'geocoder.title',
      defaultMessage: PLACEHOLDER
    }) : PLACEHOLDER
  }), showDelete ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "remove-result"
  }, /*#__PURE__*/_react["default"].createElement(_icons.Delete, {
    height: "12px",
    onClick: onMarkDeleted
  })) : null), showResults ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "geocoder-results"
  }, results.map(function (item, index) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: index,
      className: (0, _classnames["default"])('geocoder-item', {
        active: selectedIndex === index
      }),
      onClick: function onClick() {
        return onItemSelected(item);
      }
    }, formatItem(item));
  })) : null);
};

var _default = (0, _reactIntl.injectIntl)(GeoCoder);

exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2dlb2NvZGVyL2dlb2NvZGVyLmpzIl0sIm5hbWVzIjpbImRlYm91bmNlVGltZW91dCIsIlN0eWxlZENvbnRhaW5lciIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJ0ZXh0Q29sb3IiLCJib3hTaGFkb3ciLCJnZW9jb2RlcklucHV0SGVpZ2h0Iiwic3VidGV4dENvbG9yIiwicGFuZWxCYWNrZ3JvdW5kIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ3aWR0aCIsImdlb2NvZGVyV2lkdGgiLCJkcm9wZG93bldhcHBlck1hcmdpbiIsImRyb3Bkb3duTGlzdEl0ZW0iLCJ0ZXh0VHJ1bmNhdGUiLCJkcm9wZG93bkxpc3RIaWdobGlnaHRCZyIsInRleHRDb2xvckhsIiwiUExBQ0VIT0xERVIiLCJHZW9Db2RlciIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwiY2xhc3NOYW1lIiwiaW5pdGlhbElucHV0VmFsdWUiLCJsaW1pdCIsInRpbWVvdXQiLCJmb3JtYXRJdGVtIiwiaXRlbSIsInBsYWNlX25hbWUiLCJ2aWV3cG9ydCIsIm9uU2VsZWN0ZWQiLCJvbkRlbGV0ZU1hcmtlciIsInRyYW5zaXRpb25EdXJhdGlvbiIsInBvaW50Wm9vbSIsImludGwiLCJpbnB1dFZhbHVlIiwic2V0SW5wdXRWYWx1ZSIsInNob3dSZXN1bHRzIiwic2V0U2hvd1Jlc3VsdHMiLCJzaG93RGVsZXRlIiwic2V0U2hvd0RlbGV0ZSIsInJlc3VsdHMiLCJzZXRSZXN1bHRzIiwic2VsZWN0ZWRJbmRleCIsInNldFNlbGVjdGVkSW5kZXgiLCJjbGllbnQiLCJNYXBib3hDbGllbnQiLCJvbkNoYW5nZSIsImV2ZW50IiwicXVlcnlTdHJpbmciLCJ0YXJnZXQiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJCb29sZWFuIiwiZ2VvY29kZUZvcndhcmQiLCJyZXNwb25zZSIsImVudGl0eSIsImZlYXR1cmVzIiwib25CbHVyIiwib25Gb2N1cyIsIm9uSXRlbVNlbGVjdGVkIiwibmV3Vmlld3BvcnQiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwiYmJveCIsImNlbnRlciIsImZpdEJvdW5kcyIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsIm9uTWFya0RlbGV0ZWQiLCJvbktleURvd24iLCJlIiwia2V5Q29kZSIsIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJsZW5ndGgiLCJET01fVktfRU5URVIiLCJET01fVktfUkVUVVJOIiwiZm9ybWF0TWVzc2FnZSIsImlkIiwiZGVmYXVsdE1lc3NhZ2UiLCJtYXAiLCJpbmRleCIsImFjdGl2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSUEsZUFBZSxHQUFHLElBQXRCOztBQUVBLElBQU1DLGVBQWUsR0FBR0MsNkJBQU9DLEdBQVYsb0JBRVYsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxTQUFoQjtBQUFBLENBRkssRUFLSCxVQUFBRixLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlFLFNBQWhCO0FBQUEsQ0FMRixFQVNMLFVBQUFILEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUcsbUJBQWhCO0FBQUEsQ0FUQSxFQWVOLFVBQUFKLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUksWUFBaEI7QUFBQSxDQWZDLEVBb0JMLFVBQUFMLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUcsbUJBQWhCO0FBQUEsQ0FwQkEsRUF5QkgsVUFBQUosS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxTQUFoQjtBQUFBLENBekJGLEVBMEJHLFVBQUFILEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtB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QUVDLE9BSlg7QUFLRSxJQUFBLFNBQVMsRUFBRVcsU0FMYjtBQU1FLElBQUEsS0FBSyxFQUFFcEMsVUFOVDtBQU9FLElBQUEsV0FBVyxFQUNURCxJQUFJLEdBQ0FBLElBQUksQ0FBQzhDLGFBQUwsQ0FBbUI7QUFBQ0MsTUFBQUEsRUFBRSxFQUFFLGdCQUFMO0FBQXVCQyxNQUFBQSxjQUFjLEVBQUUvRDtBQUF2QyxLQUFuQixDQURBLEdBRUFBO0FBVlIsSUFKRixFQWlCR29CLFVBQVUsZ0JBQ1Q7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLGtCQUNFLGdDQUFDLGFBQUQ7QUFBUSxJQUFBLE1BQU0sRUFBQyxNQUFmO0FBQXNCLElBQUEsT0FBTyxFQUFFK0I7QUFBL0IsSUFERixDQURTLEdBSVAsSUFyQk4sQ0FERixFQXlCR2pDLFdBQVcsZ0JBQ1Y7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ0dJLE9BQU8sQ0FBQzBDLEdBQVIsQ0FBWSxVQUFDeEQsSUFBRCxFQUFPeUQsS0FBUDtBQUFBLHdCQUNYO0FBQ0UsTUFBQSxHQUFHLEVBQUVBLEtBRFA7QUFFRSxNQUFBLFNBQVMsRUFBRSw0QkFBVyxlQUFYLEVBQTRCO0FBQUNDLFFBQUFBLE1BQU0sRUFBRTFDLGFBQWEsS0FBS3lDO0FBQTNCLE9BQTVCLENBRmI7QUFHRSxNQUFBLE9BQU8sRUFBRTtBQUFBLGVBQU12QixjQUFjLENBQUNsQyxJQUFELENBQXBCO0FBQUE7QUFIWCxPQUtHRCxVQUFVLENBQUNDLElBQUQsQ0FMYixDQURXO0FBQUEsR0FBWixDQURILENBRFUsR0FZUixJQXJDTixDQURGO0FBeUNELENBOUlEOztlQWdKZSwyQkFBV1AsUUFBWCxDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7dXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZVN0YXRlfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IE1hcGJveENsaWVudCBmcm9tICdtYXBib3gnO1xuaW1wb3J0IHtpbmplY3RJbnRsfSBmcm9tICdyZWFjdC1pbnRsJztcbmltcG9ydCB7V2ViTWVyY2F0b3JWaWV3cG9ydH0gZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5pbXBvcnQgS2V5RXZlbnQgZnJvbSAnY29uc3RhbnRzL2tleWV2ZW50JztcbmltcG9ydCB7SW5wdXR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7U2VhcmNoLCBEZWxldGV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcblxubGV0IGRlYm91bmNlVGltZW91dCA9IG51bGw7XG5cbmNvbnN0IFN0eWxlZENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcblxuICAuZ2VvY29kZXItaW5wdXQge1xuICAgIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuYm94U2hhZG93fTtcblxuICAgIC5nZW9jb2Rlci1pbnB1dF9fc2VhcmNoIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGhlaWdodDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5nZW9jb2RlcklucHV0SGVpZ2h0fXB4O1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBwYWRkaW5nLWxlZnQ6IDZweDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zdWJ0ZXh0Q29sb3J9O1xuICAgIH1cblxuICAgIGlucHV0IHtcbiAgICAgIHBhZGRpbmc6IDRweCAzNnB4O1xuICAgICAgaGVpZ2h0OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmdlb2NvZGVySW5wdXRIZWlnaHR9cHg7XG4gICAgfVxuICB9XG5cbiAgLmdlb2NvZGVyLXJlc3VsdHMge1xuICAgIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuYm94U2hhZG93fTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnBhbmVsQmFja2dyb3VuZH07XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHdpZHRoOiAke3Byb3BzID0+IChOdW1iZXIuaXNGaW5pdGUocHJvcHMud2lkdGgpID8gcHJvcHMud2lkdGggOiBwcm9wcy50aGVtZS5nZW9jb2RlcldpZHRoKX1weDtcbiAgICBtYXJnaW4tdG9wOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmRyb3Bkb3duV2FwcGVyTWFyZ2lufXB4O1xuICB9XG5cbiAgLmdlb2NvZGVyLWl0ZW0ge1xuICAgICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25MaXN0SXRlbX07XG4gICAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0VHJ1bmNhdGV9O1xuXG4gICAgJi5hY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bkxpc3RIaWdobGlnaHRCZ307XG4gICAgfVxuICB9XG5cbiAgLnJlbW92ZS1yZXN1bHQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICByaWdodDogMTZweDtcbiAgICB0b3A6IDBweDtcbiAgICBoZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZ2VvY29kZXJJbnB1dEhlaWdodH1weDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cbiAgICA6aG92ZXIge1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9ySGx9O1xuICAgIH1cbiAgfVxuYDtcblxuY29uc3QgUExBQ0VIT0xERVIgPSAnRW50ZXIgYW4gQWRkcmVzcyc7XG5cbmNvbnN0IEdlb0NvZGVyID0gKHtcbiAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBpbml0aWFsSW5wdXRWYWx1ZSA9ICcnLFxuICBsaW1pdCA9IDUsXG4gIHRpbWVvdXQgPSAzMDAsXG4gIGZvcm1hdEl0ZW0gPSBpdGVtID0+IGl0ZW0ucGxhY2VfbmFtZSxcbiAgdmlld3BvcnQsXG4gIG9uU2VsZWN0ZWQsXG4gIG9uRGVsZXRlTWFya2VyLFxuICB0cmFuc2l0aW9uRHVyYXRpb24sXG4gIHBvaW50Wm9vbSxcbiAgd2lkdGgsXG4gIGludGxcbn0pID0+IHtcbiAgY29uc3QgW2lucHV0VmFsdWUsIHNldElucHV0VmFsdWVdID0gdXNlU3RhdGUoaW5pdGlhbElucHV0VmFsdWUpO1xuICBjb25zdCBbc2hvd1Jlc3VsdHMsIHNldFNob3dSZXN1bHRzXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Nob3dEZWxldGUsIHNldFNob3dEZWxldGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZShbXSk7XG4gIGNvbnN0IFtzZWxlY3RlZEluZGV4LCBzZXRTZWxlY3RlZEluZGV4XSA9IHVzZVN0YXRlKDApO1xuXG4gIGNvbnN0IGNsaWVudCA9IHVzZU1lbW8oKCkgPT4gbmV3IE1hcGJveENsaWVudChtYXBib3hBcGlBY2Nlc3NUb2tlbiksIFttYXBib3hBcGlBY2Nlc3NUb2tlbl0pO1xuXG4gIGNvbnN0IG9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soXG4gICAgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICBzZXRJbnB1dFZhbHVlKHF1ZXJ5U3RyaW5nKTtcbiAgICAgIGNsZWFyVGltZW91dChkZWJvdW5jZVRpbWVvdXQpO1xuXG4gICAgICBkZWJvdW5jZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGxpbWl0ID4gMCAmJiBCb29sZWFuKHF1ZXJ5U3RyaW5nKSkge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50Lmdlb2NvZGVGb3J3YXJkKHF1ZXJ5U3RyaW5nLCB7bGltaXR9KTtcbiAgICAgICAgICBzZXRTaG93UmVzdWx0cyh0cnVlKTtcbiAgICAgICAgICBzZXRSZXN1bHRzKHJlc3BvbnNlLmVudGl0eS5mZWF0dXJlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH0sXG4gICAgW2NsaWVudCwgbGltaXQsIHRpbWVvdXQsIHNldFJlc3VsdHMsIHNldFNob3dSZXN1bHRzXVxuICApO1xuXG4gIGNvbnN0IG9uQmx1ciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldFNob3dSZXN1bHRzKGZhbHNlKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfSwgW3NldFNob3dSZXN1bHRzLCB0aW1lb3V0XSk7XG5cbiAgY29uc3Qgb25Gb2N1cyA9IHVzZUNhbGxiYWNrKCgpID0+IHNldFNob3dSZXN1bHRzKHRydWUpLCBbc2V0U2hvd1Jlc3VsdHNdKTtcblxuICBjb25zdCBvbkl0ZW1TZWxlY3RlZCA9IHVzZUNhbGxiYWNrKFxuICAgIGl0ZW0gPT4ge1xuICAgICAgbGV0IG5ld1ZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodmlld3BvcnQpO1xuICAgICAgY29uc3Qge2Jib3gsIGNlbnRlcn0gPSBpdGVtO1xuXG4gICAgICBuZXdWaWV3cG9ydCA9IGJib3hcbiAgICAgICAgPyBuZXdWaWV3cG9ydC5maXRCb3VuZHMoW1xuICAgICAgICAgICAgW2Jib3hbMF0sIGJib3hbMV1dLFxuICAgICAgICAgICAgW2Jib3hbMl0sIGJib3hbM11dXG4gICAgICAgICAgXSlcbiAgICAgICAgOiB7XG4gICAgICAgICAgICBsb25naXR1ZGU6IGNlbnRlclswXSxcbiAgICAgICAgICAgIGxhdGl0dWRlOiBjZW50ZXJbMV0sXG4gICAgICAgICAgICB6b29tOiBwb2ludFpvb21cbiAgICAgICAgICB9O1xuXG4gICAgICBjb25zdCB7bG9uZ2l0dWRlLCBsYXRpdHVkZSwgem9vbX0gPSBuZXdWaWV3cG9ydDtcblxuICAgICAgb25TZWxlY3RlZCh7Li4udmlld3BvcnQsIC4uLntsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tLCB0cmFuc2l0aW9uRHVyYXRpb259fSwgaXRlbSk7XG5cbiAgICAgIHNldFNob3dSZXN1bHRzKGZhbHNlKTtcbiAgICAgIHNldElucHV0VmFsdWUoZm9ybWF0SXRlbShpdGVtKSk7XG4gICAgICBzZXRTaG93RGVsZXRlKHRydWUpO1xuICAgIH0sXG4gICAgW3ZpZXdwb3J0LCBvblNlbGVjdGVkLCB0cmFuc2l0aW9uRHVyYXRpb24sIHBvaW50Wm9vbSwgZm9ybWF0SXRlbV1cbiAgKTtcblxuICBjb25zdCBvbk1hcmtEZWxldGVkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFNob3dEZWxldGUoZmFsc2UpO1xuICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgIG9uRGVsZXRlTWFya2VyKCk7XG4gIH0sIFtvbkRlbGV0ZU1hcmtlcl0pO1xuXG4gIGNvbnN0IG9uS2V5RG93biA9IHVzZUNhbGxiYWNrKFxuICAgIGUgPT4ge1xuICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBLZXlFdmVudC5ET01fVktfVVA6XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJbmRleChzZWxlY3RlZEluZGV4ID4gMCA/IHNlbGVjdGVkSW5kZXggLSAxIDogc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5RXZlbnQuRE9NX1ZLX0RPV046XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJbmRleChzZWxlY3RlZEluZGV4IDwgcmVzdWx0cy5sZW5ndGggLSAxID8gc2VsZWN0ZWRJbmRleCArIDEgOiBzZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlFdmVudC5ET01fVktfRU5URVI6XG4gICAgICAgIGNhc2UgS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTjpcbiAgICAgICAgICBvbkl0ZW1TZWxlY3RlZChyZXN1bHRzW3NlbGVjdGVkSW5kZXhdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LFxuICAgIFtyZXN1bHRzLCBzZWxlY3RlZEluZGV4LCBzZXRTZWxlY3RlZEluZGV4LCBvbkl0ZW1TZWxlY3RlZF1cbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxTdHlsZWRDb250YWluZXIgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHdpZHRoPXt3aWR0aH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdlb2NvZGVyLWlucHV0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2VvY29kZXItaW5wdXRfX3NlYXJjaFwiPlxuICAgICAgICAgIDxTZWFyY2ggaGVpZ2h0PVwiMjBweFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8SW5wdXRcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgIG9uQmx1cj17b25CbHVyfVxuICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgb25LZXlEb3duPXtvbktleURvd259XG4gICAgICAgICAgdmFsdWU9e2lucHV0VmFsdWV9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e1xuICAgICAgICAgICAgaW50bFxuICAgICAgICAgICAgICA/IGludGwuZm9ybWF0TWVzc2FnZSh7aWQ6ICdnZW9jb2Rlci50aXRsZScsIGRlZmF1bHRNZXNzYWdlOiBQTEFDRUhPTERFUn0pXG4gICAgICAgICAgICAgIDogUExBQ0VIT0xERVJcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIHtzaG93RGVsZXRlID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVtb3ZlLXJlc3VsdFwiPlxuICAgICAgICAgICAgPERlbGV0ZSBoZWlnaHQ9XCIxMnB4XCIgb25DbGljaz17b25NYXJrRGVsZXRlZH0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cblxuICAgICAge3Nob3dSZXN1bHRzID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdlb2NvZGVyLXJlc3VsdHNcIj5cbiAgICAgICAgICB7cmVzdWx0cy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnZ2VvY29kZXItaXRlbScsIHthY3RpdmU6IHNlbGVjdGVkSW5kZXggPT09IGluZGV4fSl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uSXRlbVNlbGVjdGVkKGl0ZW0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Zm9ybWF0SXRlbShpdGVtKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvU3R5bGVkQ29udGFpbmVyPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0SW50bChHZW9Db2Rlcik7XG4iXX0=