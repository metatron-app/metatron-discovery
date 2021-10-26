"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _imagePreview = _interopRequireDefault(require("../common/image-preview"));

var _defaultSettings = require("../../constants/default-settings");

var _styledComponents2 = require("../common/styled-components");

var _switch = _interopRequireDefault(require("../common/switch"));

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  justify-content: space-around;\n  width: 250px;\n\n  .image-option-section {\n    .image-option-section-title {\n      font-weight: 500;\n      font-size: 14px;\n    }\n  }\n\n  .button-list {\n    display: flex;\n    flex-direction: row;\n    padding: 8px 0px;\n  }\n\n  input {\n    margin-right: 8px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/** @typedef {import('./export-image-modal').ExportImageModalProps} ExportImageModalProps */
var ImageOptionList = _styledComponents["default"].div(_templateObject());

var ExportImageModalFactory = function ExportImageModalFactory() {
  /**
   * @type {React.FunctionComponent<ExportImageModalProps>}
   */
  var ExportImageModal = function ExportImageModal(_ref) {
    var mapW = _ref.mapW,
        mapH = _ref.mapH,
        exportImage = _ref.exportImage,
        onUpdateImageSetting = _ref.onUpdateImageSetting,
        cleanupExportImage = _ref.cleanupExportImage,
        intl = _ref.intl;
    var legend = exportImage.legend,
        ratio = exportImage.ratio,
        resolution = exportImage.resolution;
    (0, _react.useEffect)(function () {
      onUpdateImageSetting({
        exporting: true
      });
      return cleanupExportImage;
    }, [onUpdateImageSetting, cleanupExportImage]);
    (0, _react.useEffect)(function () {
      if (mapH !== exportImage.mapH || mapW !== exportImage.mapW) {
        onUpdateImageSetting({
          mapH: mapH,
          mapW: mapW
        });
      }
    }, [mapH, mapW, exportImage, onUpdateImageSetting]);
    return /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledModalContent, {
      className: "export-image-modal"
    }, /*#__PURE__*/_react["default"].createElement(ImageOptionList, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section-title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportImage.ratioTitle'
    })), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportImage.ratioDescription'
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "button-list",
      id: "export-image-modal__option_ratio"
    }, _defaultSettings.EXPORT_IMG_RATIO_OPTIONS.filter(function (op) {
      return !op.hidden;
    }).map(function (op) {
      return /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectionButton, {
        key: op.id,
        selected: ratio === op.id,
        onClick: function onClick() {
          return onUpdateImageSetting({
            ratio: op.id
          });
        }
      }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: op.label
      }), ratio === op.id && /*#__PURE__*/_react["default"].createElement(_styledComponents2.CheckMark, null));
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section-title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportImage.resolutionTitle'
    })), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportImage.resolutionDescription'
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "button-list",
      id: "export-image-modal__option_resolution"
    }, _defaultSettings.EXPORT_IMG_RESOLUTION_OPTIONS.map(function (op) {
      return /*#__PURE__*/_react["default"].createElement(_styledComponents2.SelectionButton, {
        key: op.id,
        selected: resolution === op.id,
        onClick: function onClick() {
          return op.available && onUpdateImageSetting({
            resolution: op.id
          });
        }
      }, op.label, resolution === op.id && /*#__PURE__*/_react["default"].createElement(_styledComponents2.CheckMark, null));
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "image-option-section-title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.exportImage.mapLegendTitle'
    })), /*#__PURE__*/_react["default"].createElement(_switch["default"], {
      type: "checkbox",
      id: "add-map-legend",
      checked: legend,
      label: intl.formatMessage({
        id: 'modal.exportImage.mapLegendAdd'
      }),
      onChange: function onChange() {
        return onUpdateImageSetting({
          legend: !legend
        });
      }
    }))), /*#__PURE__*/_react["default"].createElement(_imagePreview["default"], {
      exportImage: exportImage
    }));
  };

  return (0, _reactIntl.injectIntl)(ExportImageModal);
};

var _default = ExportImageModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9leHBvcnQtaW1hZ2UtbW9kYWwuanMiXSwibmFtZXMiOlsiSW1hZ2VPcHRpb25MaXN0Iiwic3R5bGVkIiwiZGl2IiwiRXhwb3J0SW1hZ2VNb2RhbEZhY3RvcnkiLCJFeHBvcnRJbWFnZU1vZGFsIiwibWFwVyIsIm1hcEgiLCJleHBvcnRJbWFnZSIsIm9uVXBkYXRlSW1hZ2VTZXR0aW5nIiwiY2xlYW51cEV4cG9ydEltYWdlIiwiaW50bCIsImxlZ2VuZCIsInJhdGlvIiwicmVzb2x1dGlvbiIsImV4cG9ydGluZyIsIkVYUE9SVF9JTUdfUkFUSU9fT1BUSU9OUyIsImZpbHRlciIsIm9wIiwiaGlkZGVuIiwibWFwIiwiaWQiLCJsYWJlbCIsIkVYUE9SVF9JTUdfUkVTT0xVVElPTl9PUFRJT05TIiwiYXZhaWxhYmxlIiwiZm9ybWF0TWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7QUFFQSxJQUFNQSxlQUFlLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUFyQjs7QUF3QkEsSUFBTUMsdUJBQXVCLEdBQUcsU0FBMUJBLHVCQUEwQixHQUFNO0FBQ3BDOzs7QUFHQSxNQUFNQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLE9BT25CO0FBQUEsUUFOSkMsSUFNSSxRQU5KQSxJQU1JO0FBQUEsUUFMSkMsSUFLSSxRQUxKQSxJQUtJO0FBQUEsUUFKSkMsV0FJSSxRQUpKQSxXQUlJO0FBQUEsUUFISkMsb0JBR0ksUUFISkEsb0JBR0k7QUFBQSxRQUZKQyxrQkFFSSxRQUZKQSxrQkFFSTtBQUFBLFFBREpDLElBQ0ksUUFESkEsSUFDSTtBQUFBLFFBQ0dDLE1BREgsR0FDZ0NKLFdBRGhDLENBQ0dJLE1BREg7QUFBQSxRQUNXQyxLQURYLEdBQ2dDTCxXQURoQyxDQUNXSyxLQURYO0FBQUEsUUFDa0JD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LENBREgsQ0FMRixDQW5CRixlQXFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLGdDQUFDLDhCQUFEO0FBQWtCLE1BQUEsRUFBRSxFQUFFO0FBQXRCLE1BREYsQ0FERixlQUlFLGdDQUFDLGtCQUFEO0FBQ0UsTUFBQSxJQUFJLEVBQUMsVUFEUDtBQUVFLE1BQUEsRUFBRSxFQUFDLGdCQUZMO0FBR0UsTUFBQSxPQUFPLEVBQUVULE1BSFg7QUFJRSxNQUFBLEtBQUssRUFBRUQsSUFBSSxDQUFDYyxhQUFMLENBQW1CO0FBQUNKLFFBQUFBLEVBQUUsRUFBRTtBQUFMLE9BQW5CLENBSlQ7QUFLRSxNQUFBLFFBQVEsRUFBRTtBQUFBLGVBQU1aLG9CQUFvQixDQUFDO0FBQUNHLFVBQUFBLE1BQU0sRUFBRSxDQUFDQTtBQUFWLFNBQUQsQ0FBMUI7QUFBQTtBQUxaLE1BSkYsQ0FyQ0YsQ0FERixlQW1ERSxnQ0FBQyx3QkFBRDtBQUFjLE1BQUEsV0FBVyxFQUFFSjtBQUEzQixNQW5ERixDQURGO0FBdURELEdBakZEOztBQW1GQSxTQUFPLDJCQUFXSCxnQkFBWCxDQUFQO0FBQ0QsQ0F4RkQ7O2VBMEZlRCx1QiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge3VzZUVmZmVjdH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgSW1hZ2VQcmV2aWV3IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ltYWdlLXByZXZpZXcnO1xuXG5pbXBvcnQge0VYUE9SVF9JTUdfUkFUSU9fT1BUSU9OUywgRVhQT1JUX0lNR19SRVNPTFVUSU9OX09QVElPTlN9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuaW1wb3J0IHtTdHlsZWRNb2RhbENvbnRlbnQsIFNlbGVjdGlvbkJ1dHRvbiwgQ2hlY2tNYXJrfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgU3dpdGNoIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N3aXRjaCc7XG5pbXBvcnQge2luamVjdEludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9leHBvcnQtaW1hZ2UtbW9kYWwnKS5FeHBvcnRJbWFnZU1vZGFsUHJvcHN9IEV4cG9ydEltYWdlTW9kYWxQcm9wcyAqL1xuXG5jb25zdCBJbWFnZU9wdGlvbkxpc3QgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcbiAgd2lkdGg6IDI1MHB4O1xuXG4gIC5pbWFnZS1vcHRpb24tc2VjdGlvbiB7XG4gICAgLmltYWdlLW9wdGlvbi1zZWN0aW9uLXRpdGxlIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgfVxuICB9XG5cbiAgLmJ1dHRvbi1saXN0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgcGFkZGluZzogOHB4IDBweDtcbiAgfVxuXG4gIGlucHV0IHtcbiAgICBtYXJnaW4tcmlnaHQ6IDhweDtcbiAgfVxuYDtcblxuY29uc3QgRXhwb3J0SW1hZ2VNb2RhbEZhY3RvcnkgPSAoKSA9PiB7XG4gIC8qKlxuICAgKiBAdHlwZSB7UmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8RXhwb3J0SW1hZ2VNb2RhbFByb3BzPn1cbiAgICovXG4gIGNvbnN0IEV4cG9ydEltYWdlTW9kYWwgPSAoe1xuICAgIG1hcFcsXG4gICAgbWFwSCxcbiAgICBleHBvcnRJbWFnZSxcbiAgICBvblVwZGF0ZUltYWdlU2V0dGluZyxcbiAgICBjbGVhbnVwRXhwb3J0SW1hZ2UsXG4gICAgaW50bFxuICB9KSA9PiB7XG4gICAgY29uc3Qge2xlZ2VuZCwgcmF0aW8sIHJlc29sdXRpb259ID0gZXhwb3J0SW1hZ2U7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgb25VcGRhdGVJbWFnZVNldHRpbmcoe1xuICAgICAgICBleHBvcnRpbmc6IHRydWVcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNsZWFudXBFeHBvcnRJbWFnZTtcbiAgICB9LCBbb25VcGRhdGVJbWFnZVNldHRpbmcsIGNsZWFudXBFeHBvcnRJbWFnZV0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGlmIChtYXBIICE9PSBleHBvcnRJbWFnZS5tYXBIIHx8IG1hcFcgIT09IGV4cG9ydEltYWdlLm1hcFcpIHtcbiAgICAgICAgb25VcGRhdGVJbWFnZVNldHRpbmcoe1xuICAgICAgICAgIG1hcEgsXG4gICAgICAgICAgbWFwV1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCBbbWFwSCwgbWFwVywgZXhwb3J0SW1hZ2UsIG9uVXBkYXRlSW1hZ2VTZXR0aW5nXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFN0eWxlZE1vZGFsQ29udGVudCBjbGFzc05hbWU9XCJleHBvcnQtaW1hZ2UtbW9kYWxcIj5cbiAgICAgICAgPEltYWdlT3B0aW9uTGlzdD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImltYWdlLW9wdGlvbi1zZWN0aW9uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImltYWdlLW9wdGlvbi1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0SW1hZ2UucmF0aW9UaXRsZSd9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0SW1hZ2UucmF0aW9EZXNjcmlwdGlvbid9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ1dHRvbi1saXN0XCIgaWQ9XCJleHBvcnQtaW1hZ2UtbW9kYWxfX29wdGlvbl9yYXRpb1wiPlxuICAgICAgICAgICAgICB7RVhQT1JUX0lNR19SQVRJT19PUFRJT05TLmZpbHRlcihvcCA9PiAhb3AuaGlkZGVuKS5tYXAob3AgPT4gKFxuICAgICAgICAgICAgICAgIDxTZWxlY3Rpb25CdXR0b25cbiAgICAgICAgICAgICAgICAgIGtleT17b3AuaWR9XG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZD17cmF0aW8gPT09IG9wLmlkfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25VcGRhdGVJbWFnZVNldHRpbmcoe3JhdGlvOiBvcC5pZH0pfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXtvcC5sYWJlbH0gLz5cbiAgICAgICAgICAgICAgICAgIHtyYXRpbyA9PT0gb3AuaWQgJiYgPENoZWNrTWFyayAvPn1cbiAgICAgICAgICAgICAgICA8L1NlbGVjdGlvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImltYWdlLW9wdGlvbi1zZWN0aW9uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImltYWdlLW9wdGlvbi1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0SW1hZ2UucmVzb2x1dGlvblRpdGxlJ30gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRJbWFnZS5yZXNvbHV0aW9uRGVzY3JpcHRpb24nfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidXR0b24tbGlzdFwiIGlkPVwiZXhwb3J0LWltYWdlLW1vZGFsX19vcHRpb25fcmVzb2x1dGlvblwiPlxuICAgICAgICAgICAgICB7RVhQT1JUX0lNR19SRVNPTFVUSU9OX09QVElPTlMubWFwKG9wID0+IChcbiAgICAgICAgICAgICAgICA8U2VsZWN0aW9uQnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e29wLmlkfVxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3Jlc29sdXRpb24gPT09IG9wLmlkfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb3AuYXZhaWxhYmxlICYmIG9uVXBkYXRlSW1hZ2VTZXR0aW5nKHtyZXNvbHV0aW9uOiBvcC5pZH0pfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtvcC5sYWJlbH1cbiAgICAgICAgICAgICAgICAgIHtyZXNvbHV0aW9uID09PSBvcC5pZCAmJiA8Q2hlY2tNYXJrIC8+fVxuICAgICAgICAgICAgICAgIDwvU2VsZWN0aW9uQnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW1hZ2Utb3B0aW9uLXNlY3Rpb25cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW1hZ2Utb3B0aW9uLXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnRJbWFnZS5tYXBMZWdlbmRUaXRsZSd9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxTd2l0Y2hcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgaWQ9XCJhZGQtbWFwLWxlZ2VuZFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e2xlZ2VuZH1cbiAgICAgICAgICAgICAgbGFiZWw9e2ludGwuZm9ybWF0TWVzc2FnZSh7aWQ6ICdtb2RhbC5leHBvcnRJbWFnZS5tYXBMZWdlbmRBZGQnfSl9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiBvblVwZGF0ZUltYWdlU2V0dGluZyh7bGVnZW5kOiAhbGVnZW5kfSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0ltYWdlT3B0aW9uTGlzdD5cbiAgICAgICAgPEltYWdlUHJldmlldyBleHBvcnRJbWFnZT17ZXhwb3J0SW1hZ2V9IC8+XG4gICAgICA8L1N0eWxlZE1vZGFsQ29udGVudD5cbiAgICApO1xuICB9O1xuXG4gIHJldHVybiBpbmplY3RJbnRsKEV4cG9ydEltYWdlTW9kYWwpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRXhwb3J0SW1hZ2VNb2RhbEZhY3Rvcnk7XG4iXX0=