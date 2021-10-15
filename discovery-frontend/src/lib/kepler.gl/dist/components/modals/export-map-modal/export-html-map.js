"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = require("../../common/styled-components");

var _components = require("./components");

var _defaultSettings = require("../../../constants/default-settings");

var _userGuides = require("../../../constants/user-guides");

var _styledComponents2 = _interopRequireDefault(require("styled-components"));

var _reactIntl = require("react-intl");

var _localization = require("../../../localization");

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  height: unset;\n  width: unset;\n  img {\n    width: 180px;\n    height: 120px;\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 100%;\n  padding: ", ";\n  color: ", ";\n  height: ", ";\n  outline: 0;\n  font-size: ", ";\n\n  :active,\n  :focus,\n  &.focus,\n  &.active {\n    outline: 0;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .disclaimer {\n    font-size: ", ";\n    color: ", ";\n    margin-top: 12px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/** @typedef {import('./export-html-map').ExportHtmlMapProps} ExportHtmlMapProps */
var ExportMapStyledExportSection = (0, _styledComponents2["default"])(_styledComponents.StyledExportSection)(_templateObject(), function (props) {
  return props.theme.inputFontSize;
}, function (props) {
  return props.theme.inputColor;
});

var StyledInput = _styledComponents2["default"].input(_templateObject2(), function (props) {
  return props.theme.inputPadding;
}, function (props) {
  return props.error ? 'red' : props.theme.titleColorLT;
}, function (props) {
  return props.theme.inputBoxHeight;
}, function (props) {
  return props.theme.inputFontSize;
});

var BigStyledTile = (0, _styledComponents2["default"])(_styledComponents.StyledType)(_templateObject3());
var exportHtmlPropTypes = {
  options: _propTypes["default"].object,
  onEditUserMapboxAccessToken: _propTypes["default"].func.isRequired
};

function ExportHtmlMapFactory() {
  /**
   * @type {React.FunctionComponent<ExportHtmlMapProps>}
   */
  var ExportHtmlMap = function ExportHtmlMap(_ref) {
    var _ref$onChangeExportMa = _ref.onChangeExportMapHTMLMode,
        onChangeExportMapHTMLMode = _ref$onChangeExportMa === void 0 ? function (mode) {} : _ref$onChangeExportMa,
        _ref$onEditUserMapbox = _ref.onEditUserMapboxAccessToken,
        onEditUserMapboxAccessToken = _ref$onEditUserMapbox === void 0 ? function (token) {} : _ref$onEditUserMapbox,
        _ref$options = _ref.options,
        options = _ref$options === void 0 ? {} : _ref$options,
        intl = _ref.intl;
    return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_components.StyledExportMapSection, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.selection'
    }))), /*#__PURE__*/_react["default"].createElement(ExportMapStyledExportSection, {
      className: "export-map-modal__html-options"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.tokenTitle'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "subtitle"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.tokenSubtitle'
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, /*#__PURE__*/_react["default"].createElement(StyledInput, {
      onChange: function onChange(e) {
        return onEditUserMapboxAccessToken(e.target.value);
      },
      type: "text",
      placeholder: intl.formatMessage({
        id: 'modal.exportMap.html.tokenPlaceholder'
      }),
      value: options ? options.userMapboxToken : ''
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "disclaimer"
    }, /*#__PURE__*/_react["default"].createElement(_components.StyledWarning, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.tokenMisuseWarning'
    })), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.tokenDisclaimer'
    }), /*#__PURE__*/_react["default"].createElement(_components.ExportMapLink, {
      href: _userGuides.EXPORT_HTML_MAP_DOC
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.tokenUpdate'
    }))))), /*#__PURE__*/_react["default"].createElement(ExportMapStyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.modeTitle'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "subtitle"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.modeSubtitle1'
    }), /*#__PURE__*/_react["default"].createElement("a", {
      href: _userGuides.EXPORT_HTML_MAP_MODES_DOC
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportMap.html.modeSubtitle2'
    })))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, _defaultSettings.EXPORT_HTML_MAP_MODE_OPTIONS.map(function (mode) {
      return /*#__PURE__*/_react["default"].createElement(BigStyledTile, {
        key: mode.id,
        selected: options.mode === mode.id,
        available: mode.available,
        onClick: function onClick() {
          return mode.available && onChangeExportMapHTMLMode(mode.id);
        }
      }, /*#__PURE__*/_react["default"].createElement("img", {
        src: mode.url,
        alt: ""
      }), /*#__PURE__*/_react["default"].createElement("p", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: 'modal.exportMap.html.modeDescription',
        values: {
          mode: intl.formatMessage({
            id: mode.label
          })
        }
      })), options.mode === mode.id && /*#__PURE__*/_react["default"].createElement(_styledComponents.CheckMark, null));
    }))));
  };

  ExportHtmlMap.propTypes = exportHtmlPropTypes;
  ExportHtmlMap.displayName = 'ExportHtmlMap';
  return (0, _reactIntl.injectIntl)(ExportHtmlMap);
}

var _default = ExportHtmlMapFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9leHBvcnQtbWFwLW1vZGFsL2V4cG9ydC1odG1sLW1hcC5qcyJdLCJuYW1lcyI6WyJFeHBvcnRNYXBTdHlsZWRFeHBvcnRTZWN0aW9uIiwiU3R5bGVkRXhwb3J0U2VjdGlvbiIsInByb3BzIiwidGhlbWUiLCJpbnB1dEZvbnRTaXplIiwiaW5wdXRDb2xvciIsIlN0eWxlZElucHV0Iiwic3R5bGVkIiwiaW5wdXQiLCJpbnB1dFBhZGRpbmciLCJlcnJvciIsInRpdGxlQ29sb3JMVCIsImlucHV0Qm94SGVpZ2h0IiwiQmlnU3R5bGVkVGlsZSIsIlN0eWxlZFR5cGUiLCJleHBvcnRIdG1sUHJvcFR5cGVzIiwib3B0aW9ucyIsIlByb3BUeXBlcyIsIm9iamVjdCIsIm9uRWRpdFVzZXJNYXBib3hBY2Nlc3NUb2tlbiIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiRXhwb3J0SHRtbE1hcEZhY3RvcnkiLCJFeHBvcnRIdG1sTWFwIiwib25DaGFuZ2VFeHBvcnRNYXBIVE1MTW9kZSIsIm1vZGUiLCJ0b2tlbiIsImludGwiLCJlIiwidGFyZ2V0IiwidmFsdWUiLCJmb3JtYXRNZXNzYWdlIiwiaWQiLCJ1c2VyTWFwYm94VG9rZW4iLCJFWFBPUlRfSFRNTF9NQVBfRE9DIiwiRVhQT1JUX0hUTUxfTUFQX01PREVTX0RPQyIsIkVYUE9SVF9IVE1MX01BUF9NT0RFX09QVElPTlMiLCJtYXAiLCJhdmFpbGFibGUiLCJ1cmwiLCJsYWJlbCIsInByb3BUeXBlcyIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTtBQUVBLElBQU1BLDRCQUE0QixHQUFHLG1DQUFPQyxxQ0FBUCxDQUFILG9CQUVqQixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxD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YUFBTCxDQUFtQjtBQUFDQyxZQUFBQSxFQUFFLEVBQUVQLElBQUksQ0FBQ2U7QUFBVixXQUFuQjtBQUFQO0FBRlYsUUFERixDQVBGLEVBYUd4QixPQUFPLENBQUNTLElBQVIsS0FBaUJBLElBQUksQ0FBQ08sRUFBdEIsaUJBQTRCLGdDQUFDLDJCQUFELE9BYi9CLENBRG9DO0FBQUEsS0FBckMsQ0FESCxDQVpGLENBbENGLENBTm9CO0FBQUEsR0FBdEI7O0FBMkVBVCxFQUFBQSxhQUFhLENBQUNrQixTQUFkLEdBQTBCMUIsbUJBQTFCO0FBQ0FRLEVBQUFBLGFBQWEsQ0FBQ21CLFdBQWQsR0FBNEIsZUFBNUI7QUFFQSxTQUFPLDJCQUFXbkIsYUFBWCxDQUFQO0FBQ0Q7O2VBRWNELG9CIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge1N0eWxlZEV4cG9ydFNlY3Rpb24sIFN0eWxlZFR5cGUsIENoZWNrTWFya30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtTdHlsZWRFeHBvcnRNYXBTZWN0aW9uLCBTdHlsZWRXYXJuaW5nLCBFeHBvcnRNYXBMaW5rfSBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0IHtFWFBPUlRfSFRNTF9NQVBfTU9ERV9PUFRJT05TfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge0VYUE9SVF9IVE1MX01BUF9ET0MsIEVYUE9SVF9IVE1MX01BUF9NT0RFU19ET0N9IGZyb20gJ2NvbnN0YW50cy91c2VyLWd1aWRlcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7aW5qZWN0SW50bH0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2V4cG9ydC1odG1sLW1hcCcpLkV4cG9ydEh0bWxNYXBQcm9wc30gRXhwb3J0SHRtbE1hcFByb3BzICovXG5cbmNvbnN0IEV4cG9ydE1hcFN0eWxlZEV4cG9ydFNlY3Rpb24gPSBzdHlsZWQoU3R5bGVkRXhwb3J0U2VjdGlvbilgXG4gIC5kaXNjbGFpbWVyIHtcbiAgICBmb250LXNpemU6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaW5wdXRGb250U2l6ZX07XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaW5wdXRDb2xvcn07XG4gICAgbWFyZ2luLXRvcDogMTJweDtcbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gIHdpZHRoOiAxMDAlO1xuICBwYWRkaW5nOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmlucHV0UGFkZGluZ307XG4gIGNvbG9yOiAke3Byb3BzID0+IChwcm9wcy5lcnJvciA/ICdyZWQnIDogcHJvcHMudGhlbWUudGl0bGVDb2xvckxUKX07XG4gIGhlaWdodDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5pbnB1dEJveEhlaWdodH07XG4gIG91dGxpbmU6IDA7XG4gIGZvbnQtc2l6ZTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5pbnB1dEZvbnRTaXplfTtcblxuICA6YWN0aXZlLFxuICA6Zm9jdXMsXG4gICYuZm9jdXMsXG4gICYuYWN0aXZlIHtcbiAgICBvdXRsaW5lOiAwO1xuICB9XG5gO1xuXG5jb25zdCBCaWdTdHlsZWRUaWxlID0gc3R5bGVkKFN0eWxlZFR5cGUpYFxuICBoZWlnaHQ6IHVuc2V0O1xuICB3aWR0aDogdW5zZXQ7XG4gIGltZyB7XG4gICAgd2lkdGg6IDE4MHB4O1xuICAgIGhlaWdodDogMTIwcHg7XG4gIH1cbmA7XG5cbmNvbnN0IGV4cG9ydEh0bWxQcm9wVHlwZXMgPSB7XG4gIG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QsXG4gIG9uRWRpdFVzZXJNYXBib3hBY2Nlc3NUb2tlbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxufTtcblxuZnVuY3Rpb24gRXhwb3J0SHRtbE1hcEZhY3RvcnkoKSB7XG4gIC8qKlxuICAgKiBAdHlwZSB7UmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8RXhwb3J0SHRtbE1hcFByb3BzPn1cbiAgICovXG4gIGNvbnN0IEV4cG9ydEh0bWxNYXAgPSAoe1xuICAgIG9uQ2hhbmdlRXhwb3J0TWFwSFRNTE1vZGUgPSBtb2RlID0+IHt9LFxuICAgIG9uRWRpdFVzZXJNYXBib3hBY2Nlc3NUb2tlbiA9IHRva2VuID0+IHt9LFxuICAgIG9wdGlvbnMgPSB7fSxcbiAgICBpbnRsXG4gIH0pID0+IChcbiAgICA8ZGl2PlxuICAgICAgPFN0eWxlZEV4cG9ydE1hcFNlY3Rpb24+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGVzY3JpcHRpb25cIiAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvblwiPlxuICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0TWFwLmh0bWwuc2VsZWN0aW9uJ30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1N0eWxlZEV4cG9ydE1hcFNlY3Rpb24+XG4gICAgICA8RXhwb3J0TWFwU3R5bGVkRXhwb3J0U2VjdGlvbiBjbGFzc05hbWU9XCJleHBvcnQtbWFwLW1vZGFsX19odG1sLW9wdGlvbnNcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXNjcmlwdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0TWFwLmh0bWwudG9rZW5UaXRsZSd9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdWJ0aXRsZVwiPlxuICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRNYXAuaHRtbC50b2tlblN1YnRpdGxlJ30gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICAgICAgPFN0eWxlZElucHV0XG4gICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBvbkVkaXRVc2VyTWFwYm94QWNjZXNzVG9rZW4oZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e2ludGwuZm9ybWF0TWVzc2FnZSh7aWQ6ICdtb2RhbC5leHBvcnRNYXAuaHRtbC50b2tlblBsYWNlaG9sZGVyJ30pfVxuICAgICAgICAgICAgdmFsdWU9e29wdGlvbnMgPyBvcHRpb25zLnVzZXJNYXBib3hUb2tlbiA6ICcnfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkaXNjbGFpbWVyXCI+XG4gICAgICAgICAgICA8U3R5bGVkV2FybmluZz5cbiAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRNYXAuaHRtbC50b2tlbk1pc3VzZVdhcm5pbmcnfSAvPlxuICAgICAgICAgICAgPC9TdHlsZWRXYXJuaW5nPlxuICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRNYXAuaHRtbC50b2tlbkRpc2NsYWltZXInfSAvPlxuICAgICAgICAgICAgPEV4cG9ydE1hcExpbmsgaHJlZj17RVhQT1JUX0hUTUxfTUFQX0RPQ30+XG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0TWFwLmh0bWwudG9rZW5VcGRhdGUnfSAvPlxuICAgICAgICAgICAgPC9FeHBvcnRNYXBMaW5rPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvRXhwb3J0TWFwU3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICAgIDxFeHBvcnRNYXBTdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRNYXAuaHRtbC5tb2RlVGl0bGUnfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3VidGl0bGVcIj5cbiAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0TWFwLmh0bWwubW9kZVN1YnRpdGxlMSd9IC8+XG4gICAgICAgICAgICA8YSBocmVmPXtFWFBPUlRfSFRNTF9NQVBfTU9ERVNfRE9DfT5cbiAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRNYXAuaHRtbC5tb2RlU3VidGl0bGUyJ30gLz5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICAgICAge0VYUE9SVF9IVE1MX01BUF9NT0RFX09QVElPTlMubWFwKG1vZGUgPT4gKFxuICAgICAgICAgICAgPEJpZ1N0eWxlZFRpbGVcbiAgICAgICAgICAgICAga2V5PXttb2RlLmlkfVxuICAgICAgICAgICAgICBzZWxlY3RlZD17b3B0aW9ucy5tb2RlID09PSBtb2RlLmlkfVxuICAgICAgICAgICAgICBhdmFpbGFibGU9e21vZGUuYXZhaWxhYmxlfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBtb2RlLmF2YWlsYWJsZSAmJiBvbkNoYW5nZUV4cG9ydE1hcEhUTUxNb2RlKG1vZGUuaWQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8aW1nIHNyYz17bW9kZS51cmx9IGFsdD1cIlwiIC8+XG4gICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICBpZD17J21vZGFsLmV4cG9ydE1hcC5odG1sLm1vZGVEZXNjcmlwdGlvbid9XG4gICAgICAgICAgICAgICAgICB2YWx1ZXM9e3ttb2RlOiBpbnRsLmZvcm1hdE1lc3NhZ2Uoe2lkOiBtb2RlLmxhYmVsfSl9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAge29wdGlvbnMubW9kZSA9PT0gbW9kZS5pZCAmJiA8Q2hlY2tNYXJrIC8+fVxuICAgICAgICAgICAgPC9CaWdTdHlsZWRUaWxlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvRXhwb3J0TWFwU3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKTtcblxuICBFeHBvcnRIdG1sTWFwLnByb3BUeXBlcyA9IGV4cG9ydEh0bWxQcm9wVHlwZXM7XG4gIEV4cG9ydEh0bWxNYXAuZGlzcGxheU5hbWUgPSAnRXhwb3J0SHRtbE1hcCc7XG5cbiAgcmV0dXJuIGluamVjdEludGwoRXhwb3J0SHRtbE1hcCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV4cG9ydEh0bWxNYXBGYWN0b3J5O1xuIl19