"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _loadingSpinner = _interopRequireDefault(require("./loading-spinner"));

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  justify-content: center;\n  padding: 30px;\n\n  .dimension,\n  .instruction {\n    padding: 8px 0px;\n  }\n\n  .preview-image {\n    background: #e2e2e2;\n    border-radius: 4px;\n    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.18);\n    width: 100%;\n    position: relative;\n  }\n\n  .preview-image-placeholder {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n  }\n\n  .preview-image-spinner {\n    position: absolute;\n    left: calc(50% - 25px);\n    top: calc(50% - 25px);\n  }\n\n  .preview-image--error {\n    font-size: 12px;\n    padding: 12px;\n    color: ", ";\n    text-align: center;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/** @typedef {import('../../reducers/ui-state-updaters').ExportImage} ExportImage */
var StyledImagePreview = _styledComponents["default"].div.attrs({
  className: 'image-preview'
})(_templateObject(), function (props) {
  return props.theme.errorColor;
});
/**
 * @param {object} props
 * @param {ExportImage} [props.exportImage]
 * @param {number} [props.width]
 * @param {boolean} [props.showDimension]
 */


var ImagePreview = function ImagePreview(_ref) {
  var exportImage = _ref.exportImage,
      _ref$width = _ref.width,
      width = _ref$width === void 0 ? 400 : _ref$width,
      _ref$showDimension = _ref.showDimension,
      showDimension = _ref$showDimension === void 0 ? false : _ref$showDimension;

  var _ref2 = exportImage || {},
      error = _ref2.error,
      imageDataUri = _ref2.imageDataUri,
      processing = _ref2.processing,
      _ref2$imageSize = _ref2.imageSize;

  _ref2$imageSize = _ref2$imageSize === void 0 ? {} : _ref2$imageSize;
  var _ref2$imageSize$image = _ref2$imageSize.imageW,
      imageW = _ref2$imageSize$image === void 0 ? 0 : _ref2$imageSize$image,
      _ref2$imageSize$image2 = _ref2$imageSize.imageH,
      imageH = _ref2$imageSize$image2 === void 0 ? 0 : _ref2$imageSize$image2;
  var imageStyle = {
    width: "".concat(width, "px"),
    height: "".concat(imageH / (imageW || 1) * width, "px")
  };
  return /*#__PURE__*/_react["default"].createElement(StyledImagePreview, null, showDimension ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "dimension"
  }, imageW, " pixel x ", imageH, " pixel") : null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "preview-image",
    style: imageStyle
  }, processing ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "preview-image-spinner"
  }, /*#__PURE__*/_react["default"].createElement(_loadingSpinner["default"], null)) : error ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "preview-image--error"
  }, /*#__PURE__*/_react["default"].createElement("span", null, error.message || 'Generate map image failed!')) : /*#__PURE__*/_react["default"].createElement("img", {
    className: "preview-image-placeholder",
    src: imageDataUri
  })));
};

var _default = ImagePreview;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9pbWFnZS1wcmV2aWV3LmpzIl0sIm5hbWVzIjpbIlN0eWxlZEltYWdlUHJldmlldyIsInN0eWxlZCIsImRpdiIsImF0dHJzIiwiY2xhc3NOYW1lIiwicHJvcHMiLCJ0aGVtZSIsImVycm9yQ29sb3IiLCJJbWFnZVByZXZpZXciLCJleHBvcnRJbWFnZSIsIndpZHRoIiwic2hvd0RpbWVuc2lvbiIsImVycm9yIiwiaW1hZ2VEYXRhVXJpIiwicHJvY2Vzc2luZyIsImltYWdlU2l6ZSIsImltYWdlVyIsImltYWdlSCIsImltYWdlU3R5bGUiLCJoZWlnaHQiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7QUFFQSxJQUFNQSxrQkFBa0IsR0FBR0MsNkJBQU9DLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQjtBQUMxQ0MsRUFBQUEsU0FBUyxFQUFFO0FBRCtCLENBQWpCLENBQUgsb0JBd0NYLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsVUFBaEI7QUFBQSxDQXhDTSxDQUF4QjtBQTZDQTs7Ozs7Ozs7QUFNQSxJQUFNQyxZQUFZLEdBQUcsU0FBZkEsWUFBZSxPQUF1RDtBQUFBLE1BQXJEQyxXQUFxRCxRQUFyREEsV0FBcUQ7QUFBQSx3QkFBeENDLEtBQXdDO0FBQUEsTUFBeENBLEtBQXdDLDJCQUFoQyxHQUFnQztBQUFBLGdDQUEzQkMsYUFBMkI7QUFBQSxNQUEzQkEsYUFBMkIsbUNBQVgsS0FBVzs7QUFBQSxjQUV4RUYsV0FBVyxJQUFJLEVBRnlEO0FBQUEsTUFDbkVHLEtBRG1FLFNBQ25FQSxLQURtRTtBQUFBLE1BQzVEQyxZQUQ0RCxTQUM1REEsWUFENEQ7QUFBQSxNQUM5Q0MsVUFEOEMsU0FDOUNBLFVBRDhDO0FBQUEsOEJBQ2xDQyxTQURrQzs7QUFBQSxpREFDSSxFQURKO0FBQUEsOENBQ3RCQyxNQURzQjtBQUFBLE1BQ3RCQSxNQURzQixzQ0FDYixDQURhO0FBQUEsK0NBQ1ZDLE1BRFU7QUFBQSxNQUNWQSxNQURVLHVDQUNELENBREM7QUFJMUUsTUFBTUMsVUFBVSxHQUFHO0FBQ2pCUixJQUFBQSxLQUFLLFlBQUtBLEtBQUwsT0FEWTtBQUVqQlMsSUFBQUEsTUFBTSxZQUFNRixNQUFNLElBQUlELE1BQU0sSUFBSSxDQUFkLENBQVAsR0FBMkJOLEtBQWhDO0FBRlcsR0FBbkI7QUFLQSxzQkFDRSxnQ0FBQyxrQkFBRCxRQUNHQyxhQUFhLGdCQUNaO0FBQUssSUFBQSxTQUFTLEVBQUM7QUFBZixLQUNHSyxNQURILGVBQ29CQyxNQURwQixXQURZLEdBSVYsSUFMTixlQU1FO0FBQUssSUFBQSxTQUFTLEVBQUMsZUFBZjtBQUErQixJQUFBLEtBQUssRUFBRUM7QUFBdEMsS0FDR0osVUFBVSxnQkFDVDtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0UsZ0NBQUMsMEJBQUQsT0FERixDQURTLEdBSVBGLEtBQUssZ0JBQ1A7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLGtCQUNFLDhDQUFPQSxLQUFLLENBQUNRLE9BQU4sSUFBaUIsNEJBQXhCLENBREYsQ0FETyxnQkFLUDtBQUFLLElBQUEsU0FBUyxFQUFDLDJCQUFmO0FBQTJDLElBQUEsR0FBRyxFQUFFUDtBQUFoRCxJQVZKLENBTkYsQ0FERjtBQXNCRCxDQS9CRDs7ZUFpQ2VMLFkiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgTG9hZGluZ1NwaW5uZXIgZnJvbSAnY29tcG9uZW50cy9jb21tb24vbG9hZGluZy1zcGlubmVyJztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uLy4uL3JlZHVjZXJzL3VpLXN0YXRlLXVwZGF0ZXJzJykuRXhwb3J0SW1hZ2V9IEV4cG9ydEltYWdlICovXG5cbmNvbnN0IFN0eWxlZEltYWdlUHJldmlldyA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdpbWFnZS1wcmV2aWV3J1xufSlgXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGZsZXg6IDE7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBwYWRkaW5nOiAzMHB4O1xuXG4gIC5kaW1lbnNpb24sXG4gIC5pbnN0cnVjdGlvbiB7XG4gICAgcGFkZGluZzogOHB4IDBweDtcbiAgfVxuXG4gIC5wcmV2aWV3LWltYWdlIHtcbiAgICBiYWNrZ3JvdW5kOiAjZTJlMmUyO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBib3gtc2hhZG93OiAwIDhweCAxNnB4IDAgcmdiYSgwLCAwLCAwLCAwLjE4KTtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIH1cblxuICAucHJldmlldy1pbWFnZS1wbGFjZWhvbGRlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgfVxuXG4gIC5wcmV2aWV3LWltYWdlLXNwaW5uZXIge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiBjYWxjKDUwJSAtIDI1cHgpO1xuICAgIHRvcDogY2FsYyg1MCUgLSAyNXB4KTtcbiAgfVxuXG4gIC5wcmV2aWV3LWltYWdlLS1lcnJvciB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIHBhZGRpbmc6IDEycHg7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZXJyb3JDb2xvcn07XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG5gO1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICogQHBhcmFtIHtFeHBvcnRJbWFnZX0gW3Byb3BzLmV4cG9ydEltYWdlXVxuICogQHBhcmFtIHtudW1iZXJ9IFtwcm9wcy53aWR0aF1cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Byb3BzLnNob3dEaW1lbnNpb25dXG4gKi9cbmNvbnN0IEltYWdlUHJldmlldyA9ICh7ZXhwb3J0SW1hZ2UsIHdpZHRoID0gNDAwLCBzaG93RGltZW5zaW9uID0gZmFsc2V9KSA9PiB7XG4gIGNvbnN0IHtlcnJvciwgaW1hZ2VEYXRhVXJpLCBwcm9jZXNzaW5nLCBpbWFnZVNpemU6IHtpbWFnZVcgPSAwLCBpbWFnZUggPSAwfSA9IHt9fSA9XG4gICAgZXhwb3J0SW1hZ2UgfHwge307XG5cbiAgY29uc3QgaW1hZ2VTdHlsZSA9IHtcbiAgICB3aWR0aDogYCR7d2lkdGh9cHhgLFxuICAgIGhlaWdodDogYCR7KGltYWdlSCAvIChpbWFnZVcgfHwgMSkpICogd2lkdGh9cHhgXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8U3R5bGVkSW1hZ2VQcmV2aWV3PlxuICAgICAge3Nob3dEaW1lbnNpb24gPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGltZW5zaW9uXCI+XG4gICAgICAgICAge2ltYWdlV30gcGl4ZWwgeCB7aW1hZ2VIfSBwaXhlbFxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcmV2aWV3LWltYWdlXCIgc3R5bGU9e2ltYWdlU3R5bGV9PlxuICAgICAgICB7cHJvY2Vzc2luZyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByZXZpZXctaW1hZ2Utc3Bpbm5lclwiPlxuICAgICAgICAgICAgPExvYWRpbmdTcGlubmVyIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBlcnJvciA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByZXZpZXctaW1hZ2UtLWVycm9yXCI+XG4gICAgICAgICAgICA8c3Bhbj57ZXJyb3IubWVzc2FnZSB8fCAnR2VuZXJhdGUgbWFwIGltYWdlIGZhaWxlZCEnfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cInByZXZpZXctaW1hZ2UtcGxhY2Vob2xkZXJcIiBzcmM9e2ltYWdlRGF0YVVyaX0gLz5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvU3R5bGVkSW1hZ2VQcmV2aWV3PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VQcmV2aWV3O1xuIl19