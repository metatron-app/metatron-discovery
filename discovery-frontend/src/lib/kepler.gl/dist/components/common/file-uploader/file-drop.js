"use strict";

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

var _react = _interopRequireDefault(require("react"));

var _window = _interopRequireDefault(require("global/window"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/** @typedef {import('./file-drop').FileDropProps} FileDropProps */

/** @augments React.PureComponent<FileDropProps> */
var FileDrop = /*#__PURE__*/function (_React$PureComponent) {
  (0, _inherits2["default"])(FileDrop, _React$PureComponent);

  var _super = _createSuper(FileDrop);

  function FileDrop(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, FileDrop);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "resetDragging", function () {
      _this.frameDragCounter = 0;

      _this.setState({
        draggingOverFrame: false,
        draggingOverTarget: false
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleWindowDragOverOrDrop", function (event) {
      // This prevents the browser from trying to load whatever file the user dropped on the window
      event.preventDefault();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleFrameDrag", function (event) {
      // Only allow dragging of files
      if (!FileDrop.eventHasFiles(event)) return; // We are listening for events on the 'frame', so every time the user drags over any element in the frame's tree,
      // the event bubbles up to the frame. By keeping count of how many "dragenters" we get, we can tell if they are still
      // "draggingOverFrame" (b/c you get one "dragenter" initially, and one "dragenter"/one "dragleave" for every bubble)
      // This is far better than a "dragover" handler, which would be calling `setState` continuously.

      _this.frameDragCounter += event.type === 'dragenter' ? 1 : -1;

      if (_this.frameDragCounter === 1) {
        _this.setState({
          draggingOverFrame: true
        });

        if (_this.props.onFrameDragEnter) _this.props.onFrameDragEnter(event);
        return;
      }

      if (_this.frameDragCounter === 0) {
        _this.setState({
          draggingOverFrame: false
        });

        if (_this.props.onFrameDragLeave) _this.props.onFrameDragLeave(event);
        return;
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleFrameDrop", function (event) {
      event.preventDefault();

      if (!_this.state.draggingOverTarget) {
        _this.resetDragging();

        if (_this.props.onFrameDrop) _this.props.onFrameDrop(event);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDragOver", function (event) {
      if (FileDrop.eventHasFiles(event)) {
        _this.setState({
          draggingOverTarget: true
        });

        if (!FileDrop.isIE() && _this.props.dropEffect) event.dataTransfer.dropEffect = _this.props.dropEffect;
        if (_this.props.onDragOver) _this.props.onDragOver(event);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDragLeave", function (event) {
      _this.setState({
        draggingOverTarget: false
      });

      if (_this.props.onDragLeave) _this.props.onDragLeave(event);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDrop", function (event) {
      if (_this.props.onDrop && FileDrop.eventHasFiles(event)) {
        var files = event.dataTransfer ? event.dataTransfer.files : null;

        _this.props.onDrop(files, event);
      }

      _this.resetDragging();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "stopFrameListeners", function (frame) {
      if (frame) {
        frame.removeEventListener('dragenter', _this.handleFrameDrag);
        frame.removeEventListener('dragleave', _this.handleFrameDrag);
        frame.removeEventListener('drop', _this.handleFrameDrop);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "startFrameListeners", function (frame) {
      if (frame) {
        frame.addEventListener('dragenter', _this.handleFrameDrag);
        frame.addEventListener('dragleave', _this.handleFrameDrag);
        frame.addEventListener('drop', _this.handleFrameDrop);
      }
    });
    _this.frameDragCounter = 0;
    _this.state = {
      draggingOverFrame: false,
      draggingOverTarget: false
    };
    return _this;
  }

  (0, _createClass2["default"])(FileDrop, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.startFrameListeners(this.props.frame);
      this.resetDragging();

      _window["default"].addEventListener('dragover', this.handleWindowDragOverOrDrop);

      _window["default"].addEventListener('drop', this.handleWindowDragOverOrDrop);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.frame !== this.props.frame) {
        this.resetDragging();
        this.stopFrameListeners(prevProps.frame);
        this.startFrameListeners(this.props.frame);
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.stopFrameListeners(this.props.frame);

      _window["default"].removeEventListener('dragover', this.handleWindowDragOverOrDrop);

      _window["default"].removeEventListener('drop', this.handleWindowDragOverOrDrop);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          children = _this$props.children,
          className = _this$props.className,
          targetClassName = _this$props.targetClassName,
          draggingOverFrameClassName = _this$props.draggingOverFrameClassName,
          draggingOverTargetClassName = _this$props.draggingOverTargetClassName;
      var _this$state = this.state,
          draggingOverTarget = _this$state.draggingOverTarget,
          draggingOverFrame = _this$state.draggingOverFrame;
      var fileDropTargetClassName = targetClassName;
      if (draggingOverFrame) fileDropTargetClassName += " ".concat(draggingOverFrameClassName);
      if (draggingOverTarget) fileDropTargetClassName += " ".concat(draggingOverTargetClassName);
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: className,
        onDragOver: this.handleDragOver,
        onDragLeave: this.handleDragLeave,
        onDrop: this.handleDrop
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: fileDropTargetClassName
      }, children));
    }
  }]);
  return FileDrop;
}(_react["default"].PureComponent);

(0, _defineProperty2["default"])(FileDrop, "isIE", function () {
  return _window["default"] && _window["default"].navigator && ((_window["default"].navigator.userAgent || []).includes('MSIE') || (_window["default"].navigator.appVersion || []).includes('Trident/'));
});
(0, _defineProperty2["default"])(FileDrop, "eventHasFiles", function (event) {
  // In most browsers this is an array, but in IE11 it's an Object :(
  var hasFiles = false;

  if (event.dataTransfer) {
    var types = event.dataTransfer.types;

    for (var keyOrIndex in types) {
      if (types[keyOrIndex] === 'Files') {
        hasFiles = true;
        break;
      }
    }
  }

  return hasFiles;
});
(0, _defineProperty2["default"])(FileDrop, "defaultProps", {
  dropEffect: 'copy',
  frame: _window["default"] ? _window["default"].document : undefined,
  className: 'file-drop',
  targetClassName: 'file-drop-target',
  draggingOverFrameClassName: 'file-drop-dragging-over-frame',
  draggingOverTargetClassName: 'file-drop-dragging-over-target'
});
var _default = FileDrop;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9maWxlLXVwbG9hZGVyL2ZpbGUtZHJvcC5qcyJdLCJuYW1lcyI6WyJGaWxlRHJvcCIsInByb3BzIiwiZnJhbWVEcmFnQ291bnRlciIsInNldFN0YXRlIiwiZHJhZ2dpbmdPdmVyRnJhbWUiLCJkcmFnZ2luZ092ZXJUYXJnZXQiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiZXZlbnRIYXNGaWxlcyIsInR5cGUiLCJvbkZyYW1lRHJhZ0VudGVyIiwib25GcmFtZURyYWdMZWF2ZSIsInN0YXRlIiwicmVzZXREcmFnZ2luZyIsIm9uRnJhbWVEcm9wIiwiaXNJRSIsImRyb3BFZmZlY3QiLCJkYXRhVHJhbnNmZXIiLCJvbkRyYWdPdmVyIiwib25EcmFnTGVhdmUiLCJvbkRyb3AiLCJmaWxlcyIsImZyYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImhhbmRsZUZyYW1lRHJhZyIsImhhbmRsZUZyYW1lRHJvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzdGFydEZyYW1lTGlzdGVuZXJzIiwid2luZG93IiwiaGFuZGxlV2luZG93RHJhZ092ZXJPckRyb3AiLCJwcmV2UHJvcHMiLCJzdG9wRnJhbWVMaXN0ZW5lcnMiLCJjaGlsZHJlbiIsImNsYXNzTmFtZSIsInRhcmdldENsYXNzTmFtZSIsImRyYWdnaW5nT3ZlckZyYW1lQ2xhc3NOYW1lIiwiZHJhZ2dpbmdPdmVyVGFyZ2V0Q2xhc3NOYW1lIiwiZmlsZURyb3BUYXJnZXRDbGFzc05hbWUiLCJoYW5kbGVEcmFnT3ZlciIsImhhbmRsZURyYWdMZWF2ZSIsImhhbmRsZURyb3AiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmNsdWRlcyIsImFwcFZlcnNpb24iLCJoYXNGaWxlcyIsInR5cGVzIiwia2V5T3JJbmRleCIsImRvY3VtZW50IiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7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eXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2FyaW5rL3JlYWN0LWZpbGUtZHJvcFxuICogRm9yIFJlYWN0IDE2LjggY29tcGF0aWJpbGl0eVxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICdnbG9iYWwvd2luZG93JztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vZmlsZS1kcm9wJykuRmlsZURyb3BQcm9wc30gRmlsZURyb3BQcm9wcyAqL1xuXG4vKiogQGF1Z21lbnRzIFJlYWN0LlB1cmVDb21wb25lbnQ8RmlsZURyb3BQcm9wcz4gKi9cbmNsYXNzIEZpbGVEcm9wIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBpc0lFID0gKCkgPT5cbiAgICB3aW5kb3cgJiZcbiAgICB3aW5kb3cubmF2aWdhdG9yICYmXG4gICAgKCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBbXSkuaW5jbHVkZXMoJ01TSUUnKSB8fFxuICAgICAgKHdpbmRvdy5uYXZpZ2F0b3IuYXBwVmVyc2lvbiB8fCBbXSkuaW5jbHVkZXMoJ1RyaWRlbnQvJykpO1xuXG4gIHN0YXRpYyBldmVudEhhc0ZpbGVzID0gZXZlbnQgPT4ge1xuICAgIC8vIEluIG1vc3QgYnJvd3NlcnMgdGhpcyBpcyBhbiBhcnJheSwgYnV0IGluIElFMTEgaXQncyBhbiBPYmplY3QgOihcblxuICAgIGxldCBoYXNGaWxlcyA9IGZhbHNlO1xuICAgIGlmIChldmVudC5kYXRhVHJhbnNmZXIpIHtcbiAgICAgIGNvbnN0IHR5cGVzID0gZXZlbnQuZGF0YVRyYW5zZmVyLnR5cGVzO1xuICAgICAgZm9yIChjb25zdCBrZXlPckluZGV4IGluIHR5cGVzKSB7XG4gICAgICAgIGlmICh0eXBlc1trZXlPckluZGV4XSA9PT0gJ0ZpbGVzJykge1xuICAgICAgICAgIGhhc0ZpbGVzID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFzRmlsZXM7XG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBkcm9wRWZmZWN0OiAnY29weScsXG4gICAgZnJhbWU6IHdpbmRvdyA/IHdpbmRvdy5kb2N1bWVudCA6IHVuZGVmaW5lZCxcbiAgICBjbGFzc05hbWU6ICdmaWxlLWRyb3AnLFxuICAgIHRhcmdldENsYXNzTmFtZTogJ2ZpbGUtZHJvcC10YXJnZXQnLFxuICAgIGRyYWdnaW5nT3ZlckZyYW1lQ2xhc3NOYW1lOiAnZmlsZS1kcm9wLWRyYWdnaW5nLW92ZXItZnJhbWUnLFxuICAgIGRyYWdnaW5nT3ZlclRhcmdldENsYXNzTmFtZTogJ2ZpbGUtZHJvcC1kcmFnZ2luZy1vdmVyLXRhcmdldCdcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLmZyYW1lRHJhZ0NvdW50ZXIgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSB7ZHJhZ2dpbmdPdmVyRnJhbWU6IGZhbHNlLCBkcmFnZ2luZ092ZXJUYXJnZXQ6IGZhbHNlfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc3RhcnRGcmFtZUxpc3RlbmVycyh0aGlzLnByb3BzLmZyYW1lKTtcbiAgICB0aGlzLnJlc2V0RHJhZ2dpbmcoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZVdpbmRvd0RyYWdPdmVyT3JEcm9wKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlV2luZG93RHJhZ092ZXJPckRyb3ApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgIGlmIChwcmV2UHJvcHMuZnJhbWUgIT09IHRoaXMucHJvcHMuZnJhbWUpIHtcbiAgICAgIHRoaXMucmVzZXREcmFnZ2luZygpO1xuICAgICAgdGhpcy5zdG9wRnJhbWVMaXN0ZW5lcnMocHJldlByb3BzLmZyYW1lKTtcbiAgICAgIHRoaXMuc3RhcnRGcmFtZUxpc3RlbmVycyh0aGlzLnByb3BzLmZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnN0b3BGcmFtZUxpc3RlbmVycyh0aGlzLnByb3BzLmZyYW1lKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZVdpbmRvd0RyYWdPdmVyT3JEcm9wKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlV2luZG93RHJhZ092ZXJPckRyb3ApO1xuICB9XG5cbiAgcmVzZXREcmFnZ2luZyA9ICgpID0+IHtcbiAgICB0aGlzLmZyYW1lRHJhZ0NvdW50ZXIgPSAwO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdnaW5nT3ZlckZyYW1lOiBmYWxzZSwgZHJhZ2dpbmdPdmVyVGFyZ2V0OiBmYWxzZX0pO1xuICB9O1xuXG4gIGhhbmRsZVdpbmRvd0RyYWdPdmVyT3JEcm9wID0gZXZlbnQgPT4ge1xuICAgIC8vIFRoaXMgcHJldmVudHMgdGhlIGJyb3dzZXIgZnJvbSB0cnlpbmcgdG8gbG9hZCB3aGF0ZXZlciBmaWxlIHRoZSB1c2VyIGRyb3BwZWQgb24gdGhlIHdpbmRvd1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG5cbiAgaGFuZGxlRnJhbWVEcmFnID0gZXZlbnQgPT4ge1xuICAgIC8vIE9ubHkgYWxsb3cgZHJhZ2dpbmcgb2YgZmlsZXNcbiAgICBpZiAoIUZpbGVEcm9wLmV2ZW50SGFzRmlsZXMoZXZlbnQpKSByZXR1cm47XG5cbiAgICAvLyBXZSBhcmUgbGlzdGVuaW5nIGZvciBldmVudHMgb24gdGhlICdmcmFtZScsIHNvIGV2ZXJ5IHRpbWUgdGhlIHVzZXIgZHJhZ3Mgb3ZlciBhbnkgZWxlbWVudCBpbiB0aGUgZnJhbWUncyB0cmVlLFxuICAgIC8vIHRoZSBldmVudCBidWJibGVzIHVwIHRvIHRoZSBmcmFtZS4gQnkga2VlcGluZyBjb3VudCBvZiBob3cgbWFueSBcImRyYWdlbnRlcnNcIiB3ZSBnZXQsIHdlIGNhbiB0ZWxsIGlmIHRoZXkgYXJlIHN0aWxsXG4gICAgLy8gXCJkcmFnZ2luZ092ZXJGcmFtZVwiIChiL2MgeW91IGdldCBvbmUgXCJkcmFnZW50ZXJcIiBpbml0aWFsbHksIGFuZCBvbmUgXCJkcmFnZW50ZXJcIi9vbmUgXCJkcmFnbGVhdmVcIiBmb3IgZXZlcnkgYnViYmxlKVxuICAgIC8vIFRoaXMgaXMgZmFyIGJldHRlciB0aGFuIGEgXCJkcmFnb3ZlclwiIGhhbmRsZXIsIHdoaWNoIHdvdWxkIGJlIGNhbGxpbmcgYHNldFN0YXRlYCBjb250aW51b3VzbHkuXG4gICAgdGhpcy5mcmFtZURyYWdDb3VudGVyICs9IGV2ZW50LnR5cGUgPT09ICdkcmFnZW50ZXInID8gMSA6IC0xO1xuXG4gICAgaWYgKHRoaXMuZnJhbWVEcmFnQ291bnRlciA9PT0gMSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZHJhZ2dpbmdPdmVyRnJhbWU6IHRydWV9KTtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uRnJhbWVEcmFnRW50ZXIpIHRoaXMucHJvcHMub25GcmFtZURyYWdFbnRlcihldmVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZnJhbWVEcmFnQ291bnRlciA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZHJhZ2dpbmdPdmVyRnJhbWU6IGZhbHNlfSk7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkZyYW1lRHJhZ0xlYXZlKSB0aGlzLnByb3BzLm9uRnJhbWVEcmFnTGVhdmUoZXZlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVGcmFtZURyb3AgPSBldmVudCA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZHJhZ2dpbmdPdmVyVGFyZ2V0KSB7XG4gICAgICB0aGlzLnJlc2V0RHJhZ2dpbmcoKTtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uRnJhbWVEcm9wKSB0aGlzLnByb3BzLm9uRnJhbWVEcm9wKGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlRHJhZ092ZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKEZpbGVEcm9wLmV2ZW50SGFzRmlsZXMoZXZlbnQpKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtkcmFnZ2luZ092ZXJUYXJnZXQ6IHRydWV9KTtcbiAgICAgIGlmICghRmlsZURyb3AuaXNJRSgpICYmIHRoaXMucHJvcHMuZHJvcEVmZmVjdClcbiAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSB0aGlzLnByb3BzLmRyb3BFZmZlY3Q7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkRyYWdPdmVyKSB0aGlzLnByb3BzLm9uRHJhZ092ZXIoZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVEcmFnTGVhdmUgPSBldmVudCA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7ZHJhZ2dpbmdPdmVyVGFyZ2V0OiBmYWxzZX0pO1xuICAgIGlmICh0aGlzLnByb3BzLm9uRHJhZ0xlYXZlKSB0aGlzLnByb3BzLm9uRHJhZ0xlYXZlKGV2ZW50KTtcbiAgfTtcblxuICBoYW5kbGVEcm9wID0gZXZlbnQgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLm9uRHJvcCAmJiBGaWxlRHJvcC5ldmVudEhhc0ZpbGVzKGV2ZW50KSkge1xuICAgICAgY29uc3QgZmlsZXMgPSBldmVudC5kYXRhVHJhbnNmZXIgPyBldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMgOiBudWxsO1xuICAgICAgdGhpcy5wcm9wcy5vbkRyb3AoZmlsZXMsIGV2ZW50KTtcbiAgICB9XG4gICAgdGhpcy5yZXNldERyYWdnaW5nKCk7XG4gIH07XG5cbiAgc3RvcEZyYW1lTGlzdGVuZXJzID0gZnJhbWUgPT4ge1xuICAgIGlmIChmcmFtZSkge1xuICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5oYW5kbGVGcmFtZURyYWcpO1xuICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5oYW5kbGVGcmFtZURyYWcpO1xuICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlRnJhbWVEcm9wKTtcbiAgICB9XG4gIH07XG5cbiAgc3RhcnRGcmFtZUxpc3RlbmVycyA9IGZyYW1lID0+IHtcbiAgICBpZiAoZnJhbWUpIHtcbiAgICAgIGZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuaGFuZGxlRnJhbWVEcmFnKTtcbiAgICAgIGZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlRnJhbWVEcmFnKTtcbiAgICAgIGZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZUZyYW1lRHJvcCk7XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBjaGlsZHJlbixcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIHRhcmdldENsYXNzTmFtZSxcbiAgICAgIGRyYWdnaW5nT3ZlckZyYW1lQ2xhc3NOYW1lLFxuICAgICAgZHJhZ2dpbmdPdmVyVGFyZ2V0Q2xhc3NOYW1lXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge2RyYWdnaW5nT3ZlclRhcmdldCwgZHJhZ2dpbmdPdmVyRnJhbWV9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGxldCBmaWxlRHJvcFRhcmdldENsYXNzTmFtZSA9IHRhcmdldENsYXNzTmFtZTtcbiAgICBpZiAoZHJhZ2dpbmdPdmVyRnJhbWUpIGZpbGVEcm9wVGFyZ2V0Q2xhc3NOYW1lICs9IGAgJHtkcmFnZ2luZ092ZXJGcmFtZUNsYXNzTmFtZX1gO1xuICAgIGlmIChkcmFnZ2luZ092ZXJUYXJnZXQpIGZpbGVEcm9wVGFyZ2V0Q2xhc3NOYW1lICs9IGAgJHtkcmFnZ2luZ092ZXJUYXJnZXRDbGFzc05hbWV9YDtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICBvbkRyYWdPdmVyPXt0aGlzLmhhbmRsZURyYWdPdmVyfVxuICAgICAgICBvbkRyYWdMZWF2ZT17dGhpcy5oYW5kbGVEcmFnTGVhdmV9XG4gICAgICAgIG9uRHJvcD17dGhpcy5oYW5kbGVEcm9wfVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17ZmlsZURyb3BUYXJnZXRDbGFzc05hbWV9PntjaGlsZHJlbn08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlsZURyb3A7XG4iXX0=