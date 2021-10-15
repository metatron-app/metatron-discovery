"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileUpload = exports["default"] = exports.WarningMsg = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

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

var _reactIntl = require("react-intl");

var _uploadButton = _interopRequireDefault(require("./upload-button"));

var _icons = require("../icons");

var _fileUploadProgress = _interopRequireDefault(require("./file-upload-progress"));

var _fileDrop = _interopRequireDefault(require("./file-drop"));

var _utils = require("../../../utils/utils");

var _userGuides = require("../../../constants/user-guides");

var _reactMarkdown = _interopRequireDefault(require("react-markdown"));

var _mediaBreakpoints = require("../../../styles/media-breakpoints");

var _localization = require("../../../localization");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject18() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin: 0 auto;\n"]);

  _templateObject18 = function _templateObject18() {
    return data;
  };

  return data;
}

function _templateObject17() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 16px;\n  "]);

  _templateObject17 = function _templateObject17() {
    return data;
  };

  return data;
}

function _templateObject16() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 24px;\n  "]);

  _templateObject16 = function _templateObject16() {
    return data;
  };

  return data;
}

function _templateObject15() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 32px;\n  ", ";\n  ", "\n"]);

  _templateObject15 = function _templateObject15() {
    return data;
  };

  return data;
}

function _templateObject14() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  margin-bottom: 32px;\n\n  .loading-action {\n    margin-right: 10px;\n  }\n  .loading-spinner {\n    margin-left: 10px;\n  }\n"]);

  _templateObject14 = function _templateObject14() {
    return data;
  };

  return data;
}

function _templateObject13() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .file-drop {\n    position: relative;\n  }\n"]);

  _templateObject13 = function _templateObject13() {
    return data;
  };

  return data;
}

function _templateObject12() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 8px;\n  "]);

  _templateObject12 = function _templateObject12() {
    return data;
  };

  return data;
}

function _templateObject11() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 16px;\n  "]);

  _templateObject11 = function _templateObject11() {
    return data;
  };

  return data;
}

function _templateObject10() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 24px;\n  ", ";\n  ", ";\n"]);

  _templateObject10 = function _templateObject10() {
    return data;
  };

  return data;
}

function _templateObject9() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 8px;\n  "]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 16px;\n  "]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  margin-bottom: 48px;\n\n  ", ";\n  ", ";\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: 20px;\n  height: 36px;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    padding: 16px 4px 0;\n  "]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: white;\n  border-radius: 4px;\n  border-style: ", ";\n  border-width: 1px;\n  border-color: ", ";\n  text-align: center;\n  width: 100%;\n  padding: 48px 8px 0;\n  height: 360px;\n\n  .file-upload-or {\n    color: ", ";\n    padding-right: 4px;\n  }\n\n  .file-type-row {\n    opacity: 0.5;\n  }\n  ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-top: 10px;\n  color: ", ";\n  font-weight: 500;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    font-size: 12px;\n  "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: 14px;\n  margin-bottom: 12px;\n\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/** @typedef {import('./file-upload').FileUploadProps} FileUploadProps */
var fileIconColor = '#D3D8E0';

var LinkRenderer = function LinkRenderer(props) {
  return /*#__PURE__*/_react["default"].createElement("a", {
    href: props.href,
    target: "_blank",
    rel: "noopener noreferrer"
  }, props.children);
};

var StyledUploadMessage = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColorLT;
}, _mediaBreakpoints.media.portable(_templateObject2()));

var WarningMsg = _styledComponents["default"].span(_templateObject3(), function (props) {
  return props.theme.errorColor;
});

exports.WarningMsg = WarningMsg;

var StyledFileDrop = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.dragOver ? 'solid' : 'dashed';
}, function (props) {
  return props.dragOver ? props.theme.textColorLT : props.theme.subtextColorLT;
}, function (props) {
  return props.theme.linkBtnColor;
}, _mediaBreakpoints.media.portable(_templateObject5()));

var MsgWrapper = _styledComponents["default"].div(_templateObject6(), function (props) {
  return props.theme.modalTitleColor;
});

var StyledDragNDropIcon = _styledComponents["default"].div(_templateObject7(), fileIconColor, _mediaBreakpoints.media.portable(_templateObject8()), _mediaBreakpoints.media.palm(_templateObject9()));

var StyledFileTypeFow = _styledComponents["default"].div(_templateObject10(), _mediaBreakpoints.media.portable(_templateObject11()), _mediaBreakpoints.media.palm(_templateObject12()));

var StyledFileUpload = _styledComponents["default"].div(_templateObject13());

var StyledMessage = _styledComponents["default"].div(_templateObject14());

var StyledDragFileWrapper = _styledComponents["default"].div(_templateObject15(), _mediaBreakpoints.media.portable(_templateObject16()), _mediaBreakpoints.media.portable(_templateObject17()));

var StyledDisclaimer = (0, _styledComponents["default"])(StyledMessage)(_templateObject18());

function FileUploadFactory() {
  /** @augments {Component<FileUploadProps>} */
  var FileUpload = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(FileUpload, _Component);

    var _super = _createSuper(FileUpload);

    function FileUpload() {
      var _this;

      (0, _classCallCheck2["default"])(this, FileUpload);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        dragOver: false,
        fileLoading: false,
        files: [],
        errorFiles: []
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "frame", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isValidFileType", function (filename) {
        var _this$props$fileExten = _this.props.fileExtensions,
            fileExtensions = _this$props$fileExten === void 0 ? [] : _this$props$fileExten;
        var fileExt = fileExtensions.find(function (ext) {
          return filename.endsWith(ext);
        });
        return Boolean(fileExt);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_handleFileInput", function (fileList, event) {
        if (event) {
          event.stopPropagation();
        }

        var files = (0, _toConsumableArray2["default"])(fileList).filter(Boolean);
        var _this$props$disableEx = _this.props.disableExtensionFilter,
            disableExtensionFilter = _this$props$disableEx === void 0 ? false : _this$props$disableEx; // TODO - move this code out of the component

        var filesToLoad = [];
        var errorFiles = [];

        var _iterator = _createForOfIteratorHelper(files),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var file = _step.value;

            if (disableExtensionFilter || _this._isValidFileType(file.name)) {
              filesToLoad.push(file);
            } else {
              errorFiles.push(file.name);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var nextState = {
          files: filesToLoad,
          errorFiles: errorFiles,
          dragOver: false
        };

        _this.setState(nextState, function () {
          return nextState.files.length ? _this.props.onFileUpload(nextState.files) : null;
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_toggleDragState", function (newState) {
        _this.setState({
          dragOver: newState
        });
      });
      return _this;
    }

    (0, _createClass2["default"])(FileUpload, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$state = this.state,
            dragOver = _this$state.dragOver,
            files = _this$state.files,
            errorFiles = _this$state.errorFiles;
        var _this$props = this.props,
            fileLoading = _this$props.fileLoading,
            fileLoadingProgress = _this$props.fileLoadingProgress,
            theme = _this$props.theme,
            intl = _this$props.intl;
        var _this$props2 = this.props,
            _this$props2$fileExte = _this$props2.fileExtensions,
            fileExtensions = _this$props2$fileExte === void 0 ? [] : _this$props2$fileExte,
            _this$props2$fileForm = _this$props2.fileFormatNames,
            fileFormatNames = _this$props2$fileForm === void 0 ? [] : _this$props2$fileForm;
        return /*#__PURE__*/_react["default"].createElement(StyledFileUpload, {
          className: "file-uploader",
          ref: this.frame
        }, _fileDrop["default"] ? /*#__PURE__*/_react["default"].createElement(_fileDrop["default"], {
          frame: this.frame.current || document,
          onDragOver: function onDragOver() {
            return _this2._toggleDragState(true);
          },
          onDragLeave: function onDragLeave() {
            return _this2._toggleDragState(false);
          },
          onDrop: this._handleFileInput,
          className: "file-uploader__file-drop"
        }, /*#__PURE__*/_react["default"].createElement(StyledUploadMessage, {
          className: "file-upload__message"
        }, /*#__PURE__*/_react["default"].createElement(_reactMarkdown["default"], {
          source: "".concat(intl.formatMessage({
            id: 'fileUploader.configUploadMessage'
          }, {
            fileFormatNames: fileFormatNames.map(function (format) {
              return "**".concat(format, "**");
            }).join(', ')
          }), "(").concat(_userGuides.GUIDES_FILE_FORMAT_DOC, ")."),
          renderers: {
            link: LinkRenderer
          }
        })), /*#__PURE__*/_react["default"].createElement(StyledFileDrop, {
          dragOver: dragOver
        }, /*#__PURE__*/_react["default"].createElement(StyledFileTypeFow, {
          className: "file-type-row"
        }, fileExtensions.map(function (ext) {
          return /*#__PURE__*/_react["default"].createElement(_icons.FileType, {
            key: ext,
            ext: ext,
            height: "50px",
            fontSize: "9px"
          });
        })), fileLoading ? /*#__PURE__*/_react["default"].createElement(_fileUploadProgress["default"], {
          fileLoadingProgress: fileLoadingProgress,
          theme: theme
        }) : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
          style: {
            opacity: dragOver ? 0.5 : 1
          },
          className: "file-upload-display-message"
        }, /*#__PURE__*/_react["default"].createElement(StyledDragNDropIcon, null, /*#__PURE__*/_react["default"].createElement(_icons.DragNDrop, {
          height: "44px"
        })), errorFiles.length ? /*#__PURE__*/_react["default"].createElement(WarningMsg, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.fileNotSupported',
          values: {
            errorFiles: errorFiles.join(', ')
          }
        })) : null), !files.length ? /*#__PURE__*/_react["default"].createElement(StyledDragFileWrapper, null, /*#__PURE__*/_react["default"].createElement(MsgWrapper, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.message'
        })), /*#__PURE__*/_react["default"].createElement("span", {
          className: "file-upload-or"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.or'
        })), /*#__PURE__*/_react["default"].createElement(_uploadButton["default"], {
          onUpload: this._handleFileInput
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.browseFiles'
        }))) : null, /*#__PURE__*/_react["default"].createElement(StyledDisclaimer, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.disclaimer'
        }))))) : null, /*#__PURE__*/_react["default"].createElement(WarningMsg, null, (0, _utils.isChrome)() ? /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'fileUploader.chromeMessage'
        }) : ''));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(props, state) {
        if (state.fileLoading && props.fileLoading === false && state.files.length) {
          return {
            files: [],
            fileLoading: props.fileLoading
          };
        }

        return {
          fileLoading: props.fileLoading
        };
      }
    }]);
    return FileUpload;
  }(_react.Component);

  return (0, _reactIntl.injectIntl)(FileUpload);
}

var _default = FileUploadFactory;
exports["default"] = _default;
var FileUpload = FileUploadFactory();
exports.FileUpload = FileUpload;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9maWxlLXVwbG9hZGVyL2ZpbGUtdXBsb2FkLmpzIl0sIm5hbWVzIjpbImZpbGVJY29uQ29sb3IiLCJMaW5rUmVuZGVyZXIiLCJwcm9wcyIsImhyZWYiLCJjaGlsZHJlbiIsIlN0eWxlZFVwbG9hZE1lc3NhZ2UiLCJzdHlsZWQiLCJkaXYiLCJ0aGVtZSIsInRleHRDb2xvckxUIiwibWVkaWEiLCJwb3J0YWJsZSIsIldhcm5pbmdNc2ciLCJzcGFuIiwiZXJyb3JDb2xvciIsIlN0eWxlZEZpbGVEcm9wIiwiZHJhZ092ZXIiLCJzdWJ0ZXh0Q29sb3JMVCIsImxpbmtCdG5Db2xvciIsIk1zZ1dyYXBwZXIiLCJtb2RhbFRpdGxlQ29sb3IiLCJTdHlsZWREcmFnTkRyb3BJY29uIiwicGFsbSIsIlN0eWxlZEZpbGVUeXBlRm93IiwiU3R5bGVkRmlsZVVwbG9hZCIsIlN0eWxlZE1lc3NhZ2UiLCJTdHlsZWREcmFnRmlsZVdyYXBwZXIiLCJTdHlsZWREaXNjbGFpbWVyIiwiRmlsZVVwbG9hZEZhY3RvcnkiLCJGaWxlVXBsb2FkIiwiZmlsZUxvYWRpbmciLCJmaWxlcyIsImVycm9yRmlsZXMiLCJmaWxlbmFtZSIsImZpbGVFeHRlbnNpb25zIiwiZmlsZUV4dCIsImZpbmQiLCJleHQiLCJlbmRzV2l0aCIsIkJvb2xlYW4iLCJmaWxlTGlzdCIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwiZmlsdGVyIiwiZGlzYWJsZUV4dGVuc2lvbkZpbHRlciIsImZpbGVzVG9Mb2FkIiwiZmlsZSIsIl9pc1ZhbGlkRmlsZVR5cGUiLCJuYW1lIiwicHVzaCIsIm5leHRTdGF0ZSIsInNldFN0YXRlIiwibGVuZ3RoIiwib25GaWxlVXBsb2FkIiwibmV3U3RhdGUiLCJzdGF0ZSIsImZpbGVMb2FkaW5nUHJvZ3Jlc3MiLCJpbnRsIiwiZmlsZUZvcm1hdE5hbWVzIiwiZnJhbWUiLCJGaWxlRHJvcCIsImN1cnJlbnQiLCJkb2N1bWVudCIsIl90b2dnbGVEcmFnU3RhdGUiLCJfaGFuZGxlRmlsZUlucHV0IiwiZm9ybWF0TWVzc2FnZSIsImlkIiwibWFwIiwiZm9ybWF0Iiwiam9pbiIsIkdVSURFU19GSUxFX0ZPUk1BVF9ET0MiLCJsaW5rIiwib3BhY2l0eSIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBO0FBRUEsSUFBTUEsYUFBYSxHQUFHLFNBQXRCOztBQUVBLElBQU1DLFlBQVksR0FBRyxTQUFmQSxZQUFlLENBQUFDLEtBQUssRUFBSTtBQUM1QixzQkFDRTtBQUFHLElBQUEsSUFBSSxFQUFFQSxLQUFLLENBQUNDLElBQWY7QUFBcUIsSUFBQSxNQUFNLEVBQUMsUUFBNUI7QUFBcUMsSUFBQSxHQUFHLEVBQUM7QUFBekMsS0FDR0QsS0FBSyxDQUFDRSxRQURULENBREY7QUFLRCxDQU5EOztBQU9BLElBQU1DLG1CQUFtQixHQUFHQyw2QkFBT0MsR0FBVixvQkFDZCxVQUFBTCxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDTSxLQUFOLENBQVlDLFdBQWhCO0FBQUEsQ0FEUyxFQUtyQkMsd0JBQU1DLFFBTGUscUJBQXpCOztBQVVPLElBQU1DLFVBQVUsR0FBR04sNkJBQU9PLElBQVYscUJBRVosVUFBQVgsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ00sS0FBTixDQUFZTSxVQUFoQjtBQUFBLENBRk8sQ0FBaEI7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RSxFQUFFO0FBQXRCLFVBREYsQ0FQRixDQURELEdBWUcsSUE5Qk4sZUFnQ0UsZ0NBQUMsZ0JBQUQscUJBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsVUFBQSxFQUFFLEVBQUU7QUFBdEIsVUFERixDQWhDRixDQVRKLENBcEJGLENBREQsR0FxRUcsSUF0RU4sZUF3RUUsZ0NBQUMsVUFBRCxRQUNHLHNDQUFhLGdDQUFDLDhCQUFEO0FBQWtCLFVBQUEsRUFBRSxFQUFFO0FBQXRCLFVBQWIsR0FBc0UsRUFEekUsQ0F4RUYsQ0FERjtBQThFRDtBQWpKd0I7QUFBQTtBQUFBLCtDQVVPOUQsS0FWUCxFQVVjcUQsS0FWZCxFQVVxQjtBQUM1QyxZQUFJQSxLQUFLLENBQUN6QixXQUFOLElBQXFCNUIsS0FBSyxDQUFDNEIsV0FBTixLQUFzQixLQUEzQyxJQUFvRHlCLEtBQUssQ0FBQ3hCLEtBQU4sQ0FBWXFCLE1BQXBFLEVBQTRFO0FBQzFFLGlCQUFPO0FBQ0xyQixZQUFBQSxLQUFLLEVBQUUsRUFERjtBQUVMRCxZQUFBQSxXQUFXLEVBQUU1QixLQUFLLENBQUM0QjtBQUZkLFdBQVA7QUFJRDs7QUFDRCxlQUFPO0FBQ0xBLFVBQUFBLFdBQVcsRUFBRTVCLEtBQUssQ0FBQzRCO0FBRGQsU0FBUDtBQUdEO0FBcEJ3QjtBQUFBO0FBQUEsSUFFRjJDLGdCQUZFOztBQW9KM0IsU0FBTywyQkFBVzVDLFVBQVgsQ0FBUDtBQUNEOztlQUVjRCxpQjs7QUFDUixJQUFNQyxVQUFVLEdBQUdELGlCQUFpQixFQUFwQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudCwgY3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7aW5qZWN0SW50bH0gZnJvbSAncmVhY3QtaW50bCc7XG5pbXBvcnQgVXBsb2FkQnV0dG9uIGZyb20gJy4vdXBsb2FkLWJ1dHRvbic7XG5pbXBvcnQge0RyYWdORHJvcCwgRmlsZVR5cGV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBGaWxlVXBsb2FkUHJvZ3Jlc3MgZnJvbSAnY29tcG9uZW50cy9jb21tb24vZmlsZS11cGxvYWRlci9maWxlLXVwbG9hZC1wcm9ncmVzcyc7XG5pbXBvcnQgRmlsZURyb3AgZnJvbSAnLi9maWxlLWRyb3AnO1xuXG5pbXBvcnQge2lzQ2hyb21lfSBmcm9tICd1dGlscy91dGlscyc7XG5pbXBvcnQge0dVSURFU19GSUxFX0ZPUk1BVF9ET0N9IGZyb20gJ2NvbnN0YW50cy91c2VyLWd1aWRlcyc7XG5pbXBvcnQgUmVhY3RNYXJrZG93biBmcm9tICdyZWFjdC1tYXJrZG93bic7XG4vLyBCcmVha3BvaW50c1xuaW1wb3J0IHttZWRpYX0gZnJvbSAnc3R5bGVzL21lZGlhLWJyZWFrcG9pbnRzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vZmlsZS11cGxvYWQnKS5GaWxlVXBsb2FkUHJvcHN9IEZpbGVVcGxvYWRQcm9wcyAqL1xuXG5jb25zdCBmaWxlSWNvbkNvbG9yID0gJyNEM0Q4RTAnO1xuXG5jb25zdCBMaW5rUmVuZGVyZXIgPSBwcm9wcyA9PiB7XG4gIHJldHVybiAoXG4gICAgPGEgaHJlZj17cHJvcHMuaHJlZn0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiPlxuICAgICAge3Byb3BzLmNoaWxkcmVufVxuICAgIDwvYT5cbiAgKTtcbn07XG5jb25zdCBTdHlsZWRVcGxvYWRNZXNzYWdlID0gc3R5bGVkLmRpdmBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yTFR9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIG1hcmdpbi1ib3R0b206IDEycHg7XG5cbiAgJHttZWRpYS5wb3J0YWJsZWBcbiAgICBmb250LXNpemU6IDEycHg7XG4gIGB9XG5gO1xuXG5leHBvcnQgY29uc3QgV2FybmluZ01zZyA9IHN0eWxlZC5zcGFuYFxuICBtYXJnaW4tdG9wOiAxMHB4O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5lcnJvckNvbG9yfTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbmA7XG5cbmNvbnN0IFN0eWxlZEZpbGVEcm9wID0gc3R5bGVkLmRpdmBcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgYm9yZGVyLXN0eWxlOiAke3Byb3BzID0+IChwcm9wcy5kcmFnT3ZlciA/ICdzb2xpZCcgOiAnZGFzaGVkJyl9O1xuICBib3JkZXItd2lkdGg6IDFweDtcbiAgYm9yZGVyLWNvbG9yOiAke3Byb3BzID0+IChwcm9wcy5kcmFnT3ZlciA/IHByb3BzLnRoZW1lLnRleHRDb2xvckxUIDogcHJvcHMudGhlbWUuc3VidGV4dENvbG9yTFQpfTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB3aWR0aDogMTAwJTtcbiAgcGFkZGluZzogNDhweCA4cHggMDtcbiAgaGVpZ2h0OiAzNjBweDtcblxuICAuZmlsZS11cGxvYWQtb3Ige1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmxpbmtCdG5Db2xvcn07XG4gICAgcGFkZGluZy1yaWdodDogNHB4O1xuICB9XG5cbiAgLmZpbGUtdHlwZS1yb3cge1xuICAgIG9wYWNpdHk6IDAuNTtcbiAgfVxuICAke21lZGlhLnBvcnRhYmxlYFxuICAgIHBhZGRpbmc6IDE2cHggNHB4IDA7XG4gIGB9O1xuYDtcblxuY29uc3QgTXNnV3JhcHBlciA9IHN0eWxlZC5kaXZgXG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLm1vZGFsVGl0bGVDb2xvcn07XG4gIGZvbnQtc2l6ZTogMjBweDtcbiAgaGVpZ2h0OiAzNnB4O1xuYDtcblxuY29uc3QgU3R5bGVkRHJhZ05Ecm9wSWNvbiA9IHN0eWxlZC5kaXZgXG4gIGNvbG9yOiAke2ZpbGVJY29uQ29sb3J9O1xuICBtYXJnaW4tYm90dG9tOiA0OHB4O1xuXG4gICR7bWVkaWEucG9ydGFibGVgXG4gICAgbWFyZ2luLWJvdHRvbTogMTZweDtcbiAgYH07XG4gICR7bWVkaWEucGFsbWBcbiAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gIGB9O1xuYDtcblxuY29uc3QgU3R5bGVkRmlsZVR5cGVGb3cgPSBzdHlsZWQuZGl2YFxuICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICAke21lZGlhLnBvcnRhYmxlYFxuICAgIG1hcmdpbi1ib3R0b206IDE2cHg7XG4gIGB9O1xuICAke21lZGlhLnBhbG1gXG4gICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICBgfTtcbmA7XG5cbmNvbnN0IFN0eWxlZEZpbGVVcGxvYWQgPSBzdHlsZWQuZGl2YFxuICAuZmlsZS1kcm9wIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIH1cbmA7XG5cbmNvbnN0IFN0eWxlZE1lc3NhZ2UgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWFyZ2luLWJvdHRvbTogMzJweDtcblxuICAubG9hZGluZy1hY3Rpb24ge1xuICAgIG1hcmdpbi1yaWdodDogMTBweDtcbiAgfVxuICAubG9hZGluZy1zcGlubmVyIHtcbiAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkRHJhZ0ZpbGVXcmFwcGVyID0gc3R5bGVkLmRpdmBcbiAgbWFyZ2luLWJvdHRvbTogMzJweDtcbiAgJHttZWRpYS5wb3J0YWJsZWBcbiAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICBgfTtcbiAgJHttZWRpYS5wb3J0YWJsZWBcbiAgICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICBgfVxuYDtcblxuY29uc3QgU3R5bGVkRGlzY2xhaW1lciA9IHN0eWxlZChTdHlsZWRNZXNzYWdlKWBcbiAgbWFyZ2luOiAwIGF1dG87XG5gO1xuXG5mdW5jdGlvbiBGaWxlVXBsb2FkRmFjdG9yeSgpIHtcbiAgLyoqIEBhdWdtZW50cyB7Q29tcG9uZW50PEZpbGVVcGxvYWRQcm9wcz59ICovXG4gIGNsYXNzIEZpbGVVcGxvYWQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRlID0ge1xuICAgICAgZHJhZ092ZXI6IGZhbHNlLFxuICAgICAgZmlsZUxvYWRpbmc6IGZhbHNlLFxuICAgICAgZmlsZXM6IFtdLFxuICAgICAgZXJyb3JGaWxlczogW11cbiAgICB9O1xuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wcywgc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5maWxlTG9hZGluZyAmJiBwcm9wcy5maWxlTG9hZGluZyA9PT0gZmFsc2UgJiYgc3RhdGUuZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZmlsZXM6IFtdLFxuICAgICAgICAgIGZpbGVMb2FkaW5nOiBwcm9wcy5maWxlTG9hZGluZ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsZUxvYWRpbmc6IHByb3BzLmZpbGVMb2FkaW5nXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZyYW1lID0gY3JlYXRlUmVmKCk7XG5cbiAgICBfaXNWYWxpZEZpbGVUeXBlID0gZmlsZW5hbWUgPT4ge1xuICAgICAgY29uc3Qge2ZpbGVFeHRlbnNpb25zID0gW119ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGZpbGVFeHQgPSBmaWxlRXh0ZW5zaW9ucy5maW5kKGV4dCA9PiBmaWxlbmFtZS5lbmRzV2l0aChleHQpKTtcblxuICAgICAgcmV0dXJuIEJvb2xlYW4oZmlsZUV4dCk7XG4gICAgfTtcblxuICAgIC8qKiBAcGFyYW0ge0ZpbGVMaXN0fSBmaWxlTGlzdCAqL1xuICAgIF9oYW5kbGVGaWxlSW5wdXQgPSAoZmlsZUxpc3QsIGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gWy4uLmZpbGVMaXN0XS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgIGNvbnN0IHtkaXNhYmxlRXh0ZW5zaW9uRmlsdGVyID0gZmFsc2V9ID0gdGhpcy5wcm9wcztcblxuICAgICAgLy8gVE9ETyAtIG1vdmUgdGhpcyBjb2RlIG91dCBvZiB0aGUgY29tcG9uZW50XG4gICAgICBjb25zdCBmaWxlc1RvTG9hZCA9IFtdO1xuICAgICAgY29uc3QgZXJyb3JGaWxlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgIGlmIChkaXNhYmxlRXh0ZW5zaW9uRmlsdGVyIHx8IHRoaXMuX2lzVmFsaWRGaWxlVHlwZShmaWxlLm5hbWUpKSB7XG4gICAgICAgICAgZmlsZXNUb0xvYWQucHVzaChmaWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlcnJvckZpbGVzLnB1c2goZmlsZS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXh0U3RhdGUgPSB7ZmlsZXM6IGZpbGVzVG9Mb2FkLCBlcnJvckZpbGVzLCBkcmFnT3ZlcjogZmFsc2V9O1xuXG4gICAgICB0aGlzLnNldFN0YXRlKG5leHRTdGF0ZSwgKCkgPT5cbiAgICAgICAgbmV4dFN0YXRlLmZpbGVzLmxlbmd0aCA/IHRoaXMucHJvcHMub25GaWxlVXBsb2FkKG5leHRTdGF0ZS5maWxlcykgOiBudWxsXG4gICAgICApO1xuICAgIH07XG5cbiAgICBfdG9nZ2xlRHJhZ1N0YXRlID0gbmV3U3RhdGUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZHJhZ092ZXI6IG5ld1N0YXRlfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtkcmFnT3ZlciwgZmlsZXMsIGVycm9yRmlsZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGNvbnN0IHtmaWxlTG9hZGluZywgZmlsZUxvYWRpbmdQcm9ncmVzcywgdGhlbWUsIGludGx9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHtmaWxlRXh0ZW5zaW9ucyA9IFtdLCBmaWxlRm9ybWF0TmFtZXMgPSBbXX0gPSB0aGlzLnByb3BzO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZEZpbGVVcGxvYWQgY2xhc3NOYW1lPVwiZmlsZS11cGxvYWRlclwiIHJlZj17dGhpcy5mcmFtZX0+XG4gICAgICAgICAge0ZpbGVEcm9wID8gKFxuICAgICAgICAgICAgPEZpbGVEcm9wXG4gICAgICAgICAgICAgIGZyYW1lPXt0aGlzLmZyYW1lLmN1cnJlbnQgfHwgZG9jdW1lbnR9XG4gICAgICAgICAgICAgIG9uRHJhZ092ZXI9eygpID0+IHRoaXMuX3RvZ2dsZURyYWdTdGF0ZSh0cnVlKX1cbiAgICAgICAgICAgICAgb25EcmFnTGVhdmU9eygpID0+IHRoaXMuX3RvZ2dsZURyYWdTdGF0ZShmYWxzZSl9XG4gICAgICAgICAgICAgIG9uRHJvcD17dGhpcy5faGFuZGxlRmlsZUlucHV0fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaWxlLXVwbG9hZGVyX19maWxlLWRyb3BcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8U3R5bGVkVXBsb2FkTWVzc2FnZSBjbGFzc05hbWU9XCJmaWxlLXVwbG9hZF9fbWVzc2FnZVwiPlxuICAgICAgICAgICAgICAgIDxSZWFjdE1hcmtkb3duXG4gICAgICAgICAgICAgICAgICBzb3VyY2U9e2Ake2ludGwuZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsZVVwbG9hZGVyLmNvbmZpZ1VwbG9hZE1lc3NhZ2UnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlRm9ybWF0TmFtZXM6IGZpbGVGb3JtYXROYW1lcy5tYXAoZm9ybWF0ID0+IGAqKiR7Zm9ybWF0fSoqYCkuam9pbignLCAnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApfSgke0dVSURFU19GSUxFX0ZPUk1BVF9ET0N9KS5gfVxuICAgICAgICAgICAgICAgICAgcmVuZGVyZXJzPXt7bGluazogTGlua1JlbmRlcmVyfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L1N0eWxlZFVwbG9hZE1lc3NhZ2U+XG4gICAgICAgICAgICAgIDxTdHlsZWRGaWxlRHJvcCBkcmFnT3Zlcj17ZHJhZ092ZXJ9PlxuICAgICAgICAgICAgICAgIDxTdHlsZWRGaWxlVHlwZUZvdyBjbGFzc05hbWU9XCJmaWxlLXR5cGUtcm93XCI+XG4gICAgICAgICAgICAgICAgICB7ZmlsZUV4dGVuc2lvbnMubWFwKGV4dCA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHlwZSBrZXk9e2V4dH0gZXh0PXtleHR9IGhlaWdodD1cIjUwcHhcIiBmb250U2l6ZT1cIjlweFwiIC8+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZEZpbGVUeXBlRm93PlxuICAgICAgICAgICAgICAgIHtmaWxlTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxGaWxlVXBsb2FkUHJvZ3Jlc3MgZmlsZUxvYWRpbmdQcm9ncmVzcz17ZmlsZUxvYWRpbmdQcm9ncmVzc30gdGhlbWU9e3RoZW1lfSAvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tvcGFjaXR5OiBkcmFnT3ZlciA/IDAuNSA6IDF9fVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpbGUtdXBsb2FkLWRpc3BsYXktbWVzc2FnZVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkRHJhZ05Ecm9wSWNvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxEcmFnTkRyb3AgaGVpZ2h0PVwiNDRweFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWREcmFnTkRyb3BJY29uPlxuXG4gICAgICAgICAgICAgICAgICAgICAge2Vycm9yRmlsZXMubGVuZ3RoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdhcm5pbmdNc2c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9eydmaWxlVXBsb2FkZXIuZmlsZU5vdFN1cHBvcnRlZCd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzPXt7ZXJyb3JGaWxlczogZXJyb3JGaWxlcy5qb2luKCcsICcpfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvV2FybmluZ01zZz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHshZmlsZXMubGVuZ3RoID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWREcmFnRmlsZVdyYXBwZXI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TXNnV3JhcHBlcj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydmaWxlVXBsb2FkZXIubWVzc2FnZSd9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L01zZ1dyYXBwZXI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmaWxlLXVwbG9hZC1vclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J2ZpbGVVcGxvYWRlci5vcid9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VXBsb2FkQnV0dG9uIG9uVXBsb2FkPXt0aGlzLl9oYW5kbGVGaWxlSW5wdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J2ZpbGVVcGxvYWRlci5icm93c2VGaWxlcyd9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1VwbG9hZEJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZERyYWdGaWxlV3JhcHBlcj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgICAgICAgICAgPFN0eWxlZERpc2NsYWltZXI+XG4gICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydmaWxlVXBsb2FkZXIuZGlzY2xhaW1lcid9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkRGlzY2xhaW1lcj5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvU3R5bGVkRmlsZURyb3A+XG4gICAgICAgICAgICA8L0ZpbGVEcm9wPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgPFdhcm5pbmdNc2c+XG4gICAgICAgICAgICB7aXNDaHJvbWUoKSA/IDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnZmlsZVVwbG9hZGVyLmNocm9tZU1lc3NhZ2UnfSAvPiA6ICcnfVxuICAgICAgICAgIDwvV2FybmluZ01zZz5cbiAgICAgICAgPC9TdHlsZWRGaWxlVXBsb2FkPlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5qZWN0SW50bChGaWxlVXBsb2FkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlsZVVwbG9hZEZhY3Rvcnk7XG5leHBvcnQgY29uc3QgRmlsZVVwbG9hZCA9IEZpbGVVcGxvYWRGYWN0b3J5KCk7XG4iXX0=