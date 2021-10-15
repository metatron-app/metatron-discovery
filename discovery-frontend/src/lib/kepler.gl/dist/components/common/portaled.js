"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.getChildPos = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _lodash2 = _interopRequireDefault(require("lodash.isequal"));

var _exenv = require("exenv");

var _styledComponents = require("styled-components");

var _context = require("../context");

var _reactModal = _interopRequireDefault(require("react-modal"));

var _window = _interopRequireDefault(require("global/window"));

var _base = require("../../styles/base");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var listeners = {};

var startListening = function startListening() {
  return Object.keys(listeners).forEach(function (key) {
    return listeners[key]();
  });
};

var getPageOffset = function getPageOffset() {
  return {
    x: _window["default"].pageXOffset !== undefined ? _window["default"].pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
    y: _window["default"].pageYOffset !== undefined ? _window["default"].pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
  };
};

var addEventListeners = function addEventListeners() {
  if (document && document.body) document.body.addEventListener('mousewheel', (0, _lodash["default"])(startListening, 100, true));

  _window["default"].addEventListener('resize', (0, _lodash["default"])(startListening, 50, true));
};

var getChildPos = function getChildPos(_ref) {
  var offsets = _ref.offsets,
      rect = _ref.rect,
      childRect = _ref.childRect,
      pageOffset = _ref.pageOffset,
      padding = _ref.padding;
  var topOffset = offsets.topOffset,
      leftOffset = offsets.leftOffset,
      rightOffset = offsets.rightOffset;
  var anchorLeft = leftOffset !== undefined;

  var pos = _objectSpread({
    top: pageOffset.y + rect.top + (topOffset || 0)
  }, anchorLeft ? {
    left: pageOffset.x + rect.left + leftOffset
  } : {
    right: _window["default"].innerWidth - rect.right - pageOffset.x + (rightOffset || 0)
  });

  var leftOrRight = anchorLeft ? 'left' : 'right';

  if (pos[leftOrRight] && pos[leftOrRight] < 0) {
    pos[leftOrRight] = padding;
  } else if (pos[leftOrRight] && pos[leftOrRight] + childRect.width > _window["default"].innerWidth) {
    pos[leftOrRight] = _window["default"].innerWidth - childRect.width - padding;
  }

  if (pos.top < 0) {
    pos.top = padding;
  } else if (pos.top + childRect.height > _window["default"].innerHeight) {
    pos.top = _window["default"].innerHeight - childRect.height - padding;
  }

  return pos;
};

exports.getChildPos = getChildPos;

if (_exenv.canUseDOM) {
  if (document.body) {
    addEventListeners();
  } else {
    document.addEventListener('DOMContentLoaded', addEventListeners);
  }
}

var listenerIdCounter = 0;

function subscribe(fn) {
  listenerIdCounter += 1;
  var id = listenerIdCounter;
  listeners[id] = fn;
  return function () {
    return delete listeners[id];
  };
}

var defaultModalStyle = {
  content: {
    top: 0,
    left: 0,
    border: 0,
    right: 'auto',
    bottom: 'auto',
    padding: '0px 0px 0px 0px'
  },
  overlay: {
    right: 'auto',
    bottom: 'auto',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
};
var WINDOW_PAD = 40;

var noop = function noop() {};

var Portaled = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Portaled, _Component);

  var _super = _createSuper(Portaled);

  function Portaled() {
    var _this;

    (0, _classCallCheck2["default"])(this, Portaled);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      pos: null,
      isVisible: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "element", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "child", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleScroll", function () {
      if (_this.child.current) {
        var rect = _this.element.current.getBoundingClientRect();

        var childRect = _this.child.current && _this.child.current.getBoundingClientRect();

        var pageOffset = getPageOffset();
        var _this$props = _this.props,
            topOffset = _this$props.top,
            leftOffset = _this$props.left,
            rightOffset = _this$props.right;
        var pos = getChildPos({
          offsets: {
            topOffset: topOffset,
            leftOffset: leftOffset,
            rightOffset: rightOffset
          },
          rect: rect,
          childRect: childRect,
          pageOffset: pageOffset,
          padding: WINDOW_PAD
        });

        if (!(0, _lodash2["default"])(pos, _this.state.pos)) {
          _this.setState({
            pos: pos
          });
        }
      }
    });
    return _this;
  }

  (0, _createClass2["default"])(Portaled, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // relative
      this.unsubscribe = subscribe(this.handleScroll);
      this.handleScroll();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var didOpen = this.props.isOpened && !prevProps.isOpened;
      var didClose = !this.props.isOpened && prevProps.isOpened;

      if (didOpen || didClose) {
        _window["default"].requestAnimationFrame(function () {
          if (_this2._unmounted) return;

          _this2.setState({
            isVisible: didOpen
          });
        });
      }

      this.handleScroll();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._unmounted = true; // @ts-ignore

      this.unsubscribe();
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props2 = this.props,
          Comp = _this$props2.component,
          overlayZIndex = _this$props2.overlayZIndex,
          isOpened = _this$props2.isOpened,
          onClose = _this$props2.onClose,
          children = _this$props2.children,
          modalProps = _this$props2.modalProps;
      var _this$state = this.state,
          isVisible = _this$state.isVisible,
          pos = _this$state.pos;

      var modalStyle = _objectSpread(_objectSpread({}, defaultModalStyle), {}, {
        overlay: _objectSpread(_objectSpread({}, defaultModalStyle.overlay), {}, {
          // needs to be on top of existing modal
          zIndex: overlayZIndex || 9999
        })
      });

      return /*#__PURE__*/_react["default"].createElement(_context.RootContext.Consumer, null, function (context) {
        return /*#__PURE__*/_react["default"].createElement(Comp, {
          ref: _this3.element
        }, isOpened ? /*#__PURE__*/_react["default"].createElement(_reactModal["default"], (0, _extends2["default"])({
          className: "modal-portal"
        }, modalProps, {
          ariaHideApp: false,
          isOpen: true,
          style: modalStyle,
          parentSelector: function parentSelector() {
            // React modal issue: https://github.com/reactjs/react-modal/issues/769
            // failed to execute removeChild on parent node when it is already unmounted
            return (// @ts-ignore
              context && context.current || {
                removeChild: function removeChild() {},
                appendChild: function appendChild() {}
              }
            );
          },
          onRequestClose: onClose
        }), /*#__PURE__*/_react["default"].createElement("div", {
          className: "portaled-content",
          key: "item",
          style: _objectSpread({
            position: 'fixed',
            opacity: isVisible ? 1 : 0,
            top: _this3.state.top,
            transition: _this3.props.theme.transition,
            marginTop: isVisible ? '0px' : '14px'
          }, pos)
        }, /*#__PURE__*/_react["default"].createElement("div", {
          ref: _this3.child,
          style: {
            position: 'absolute',
            zIndex: overlayZIndex ? overlayZIndex + 1 : 10000
          }
        }, children))) : null);
      });
    }
  }]);
  return Portaled;
}(_react.Component);

(0, _defineProperty2["default"])(Portaled, "defaultProps", {
  component: 'div',
  onClose: noop,
  theme: _base.theme
});

var _default = (0, _styledComponents.withTheme)(Portaled);

exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9wb3J0YWxlZC5qcyJdLCJuYW1lcyI6WyJsaXN0ZW5lcnMiLCJzdGFydExpc3RlbmluZyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiZ2V0UGFnZU9mZnNldCIsIngiLCJ3aW5kb3ciLCJwYWdlWE9mZnNldCIsInVuZGVmaW5lZCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiYm9keSIsInBhcmVudE5vZGUiLCJzY3JvbGxMZWZ0IiwieSIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwiYWRkRXZlbnRMaXN0ZW5lcnMiLCJhZGRFdmVudExpc3RlbmVyIiwiZ2V0Q2hpbGRQb3MiLCJvZmZzZXRzIiwicmVjdCIsImNoaWxkUmVjdCIsInBhZ2VPZmZzZXQiLCJwYWRkaW5nIiwidG9wT2Zmc2V0IiwibGVmdE9mZnNldCIsInJpZ2h0T2Zmc2V0IiwiYW5jaG9yTGVmdCIsInBvcyIsInRvcCIsImxlZnQiLCJyaWdodCIsImlubmVyV2lkdGgiLCJsZWZ0T3JSaWdodCIsIndpZHRoIiwiaGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJjYW5Vc2VET00iLCJsaXN0ZW5lcklkQ291bnRlciIsInN1YnNjcmliZSIsImZuIiwiaWQiLCJkZWZhdWx0TW9kYWxTdHlsZSIsImNvbnRlbnQiLCJib3JkZXIiLCJib3R0b20iLCJvdmVybGF5IiwiYmFja2dyb3VuZENvbG9yIiwiV0lORE9XX1BBRCIsIm5vb3AiLCJQb3J0YWxlZCIsImlzVmlzaWJsZSIsImNoaWxkIiwiY3VycmVudCIsImVsZW1lbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwcm9wcyIsInN0YXRlIiwic2V0U3RhdGUiLCJ1bnN1YnNjcmliZSIsImhhbmRsZVNjcm9sbCIsInByZXZQcm9wcyIsImRpZE9wZW4iLCJpc09wZW5lZCIsImRpZENsb3NlIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiX3VubW91bnRlZCIsIkNvbXAiLCJjb21wb25lbnQiLCJvdmVybGF5WkluZGV4Iiwib25DbG9zZSIsImNoaWxkcmVuIiwibW9kYWxQcm9wcyIsIm1vZGFsU3R5bGUiLCJ6SW5kZXgiLCJjb250ZXh0IiwicmVtb3ZlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsInBvc2l0aW9uIiwib3BhY2l0eSIsInRyYW5zaXRpb24iLCJ0aGVtZSIsIm1hcmdpblRvcCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBUyxHQUFHLEVBQWxCOztBQUVBLElBQU1DLGNBQWMsR0FBRyxTQUFqQkEsY0FBaUI7QUFBQSxTQUFNQyxNQUFNLENBQUNDLElBQVAsQ0FBWUgsU0FBWixFQUF1QkksT0FBdkIsQ0FBK0IsVUFBQUMsR0FBRztBQUFBLFdBQUlMLFNBQVMsQ0FBQ0ssR0FBRCxDQUFULEVBQUo7QUFBQSxHQUFsQyxDQUFOO0FBQUEsQ0FBdkI7O0FBRUEsSUFBTUMsYUFBYSxHQUFHLFNBQWhCQSxhQUFnQjtBQUFBLFNBQU87QUFDM0JDLElBQUFBLENBQUMsRUFDQ0MsbUJBQU9DLFdBQVAsS0FBdUJDLFNBQXZCLEdBQ0lGLG1CQUFPQyxXQURYLEdBRUksQ0FBQ0UsUUFBUSxDQUFDQyxlQUFULElBQTRCRCxRQUFRLENBQUNFLElBQVQsQ0FBY0MsVUFBMUMsSUFBd0RILFFBQVEsQ0FBQ0UsSUFBbEUsRUFBd0VFLFVBSm5EO0FBSzNCQyxJQUFBQSxDQUFDLEVBQ0NSLG1CQUFPUyxXQUFQLEtBQXVCUCxTQUF2QixHQUNJRixtQkFBT1MsV0FEWCxHQUVJLENBQUNOLFFBQVEsQ0FBQ0MsZUFBVCxJQUE0QkQsUUFBUSxDQUFDRSxJQUFULENBQWNDLFVBQTFDLElBQXdESCxRQUFRLENBQUNFLElBQWxFLEVBQXdFSztBQVJuRCxHQUFQO0FBQUEsQ0FBdEI7O0FBV0EsSUFBTUMsaUJBQWlCLEdBQUcs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U0FBUyxFQUFFLEtBRFM7QUFFcEJFLEVBQUFBLE9BQU8sRUFBRXJCLElBRlc7QUFHcEJnQyxFQUFBQSxLQUFLLEVBQUxBO0FBSG9CLEM7O2VBNklULGlDQUFVL0IsUUFBVixDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCBjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoLmlzZXF1YWwnO1xuXG5pbXBvcnQge2NhblVzZURPTX0gZnJvbSAnZXhlbnYnO1xuaW1wb3J0IHt3aXRoVGhlbWV9IGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Um9vdENvbnRleHR9IGZyb20gJ2NvbXBvbmVudHMvY29udGV4dCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAncmVhY3QtbW9kYWwnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCB7dGhlbWV9IGZyb20gJ3N0eWxlcy9iYXNlJztcblxuY29uc3QgbGlzdGVuZXJzID0ge307XG5cbmNvbnN0IHN0YXJ0TGlzdGVuaW5nID0gKCkgPT4gT2JqZWN0LmtleXMobGlzdGVuZXJzKS5mb3JFYWNoKGtleSA9PiBsaXN0ZW5lcnNba2V5XSgpKTtcblxuY29uc3QgZ2V0UGFnZU9mZnNldCA9ICgpID0+ICh7XG4gIHg6XG4gICAgd2luZG93LnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWRcbiAgICAgID8gd2luZG93LnBhZ2VYT2Zmc2V0XG4gICAgICA6IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlIHx8IGRvY3VtZW50LmJvZHkpLnNjcm9sbExlZnQsXG4gIHk6XG4gICAgd2luZG93LnBhZ2VZT2Zmc2V0ICE9PSB1bmRlZmluZWRcbiAgICAgID8gd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgICA6IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlIHx8IGRvY3VtZW50LmJvZHkpLnNjcm9sbFRvcFxufSk7XG5cbmNvbnN0IGFkZEV2ZW50TGlzdGVuZXJzID0gKCkgPT4ge1xuICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuYm9keSlcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBkZWJvdW5jZShzdGFydExpc3RlbmluZywgMTAwLCB0cnVlKSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZShzdGFydExpc3RlbmluZywgNTAsIHRydWUpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDaGlsZFBvcyA9ICh7b2Zmc2V0cywgcmVjdCwgY2hpbGRSZWN0LCBwYWdlT2Zmc2V0LCBwYWRkaW5nfSkgPT4ge1xuICBjb25zdCB7dG9wT2Zmc2V0LCBsZWZ0T2Zmc2V0LCByaWdodE9mZnNldH0gPSBvZmZzZXRzO1xuXG4gIGNvbnN0IGFuY2hvckxlZnQgPSBsZWZ0T2Zmc2V0ICE9PSB1bmRlZmluZWQ7XG4gIGNvbnN0IHBvcyA9IHtcbiAgICB0b3A6IHBhZ2VPZmZzZXQueSArIHJlY3QudG9wICsgKHRvcE9mZnNldCB8fCAwKSxcbiAgICAuLi4oYW5jaG9yTGVmdFxuICAgICAgPyB7bGVmdDogcGFnZU9mZnNldC54ICsgcmVjdC5sZWZ0ICsgbGVmdE9mZnNldH1cbiAgICAgIDoge3JpZ2h0OiB3aW5kb3cuaW5uZXJXaWR0aCAtIHJlY3QucmlnaHQgLSBwYWdlT2Zmc2V0LnggKyAocmlnaHRPZmZzZXQgfHwgMCl9KVxuICB9O1xuXG4gIGNvbnN0IGxlZnRPclJpZ2h0ID0gYW5jaG9yTGVmdCA/ICdsZWZ0JyA6ICdyaWdodCc7XG5cbiAgaWYgKHBvc1tsZWZ0T3JSaWdodF0gJiYgcG9zW2xlZnRPclJpZ2h0XSA8IDApIHtcbiAgICBwb3NbbGVmdE9yUmlnaHRdID0gcGFkZGluZztcbiAgfSBlbHNlIGlmIChwb3NbbGVmdE9yUmlnaHRdICYmIHBvc1tsZWZ0T3JSaWdodF0gKyBjaGlsZFJlY3Qud2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgIHBvc1tsZWZ0T3JSaWdodF0gPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGNoaWxkUmVjdC53aWR0aCAtIHBhZGRpbmc7XG4gIH1cblxuICBpZiAocG9zLnRvcCA8IDApIHtcbiAgICBwb3MudG9wID0gcGFkZGluZztcbiAgfSBlbHNlIGlmIChwb3MudG9wICsgY2hpbGRSZWN0LmhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgIHBvcy50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBjaGlsZFJlY3QuaGVpZ2h0IC0gcGFkZGluZztcbiAgfVxuXG4gIHJldHVybiBwb3M7XG59O1xuXG5pZiAoY2FuVXNlRE9NKSB7XG4gIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYWRkRXZlbnRMaXN0ZW5lcnMpO1xuICB9XG59XG5cbmxldCBsaXN0ZW5lcklkQ291bnRlciA9IDA7XG5mdW5jdGlvbiBzdWJzY3JpYmUoZm4pIHtcbiAgbGlzdGVuZXJJZENvdW50ZXIgKz0gMTtcbiAgY29uc3QgaWQgPSBsaXN0ZW5lcklkQ291bnRlcjtcbiAgbGlzdGVuZXJzW2lkXSA9IGZuO1xuICByZXR1cm4gKCkgPT4gZGVsZXRlIGxpc3RlbmVyc1tpZF07XG59XG5cbmNvbnN0IGRlZmF1bHRNb2RhbFN0eWxlID0ge1xuICBjb250ZW50OiB7XG4gICAgdG9wOiAwLFxuICAgIGxlZnQ6IDAsXG4gICAgYm9yZGVyOiAwLFxuICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgYm90dG9tOiAnYXV0bycsXG4gICAgcGFkZGluZzogJzBweCAwcHggMHB4IDBweCdcbiAgfSxcbiAgb3ZlcmxheToge1xuICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgYm90dG9tOiAnYXV0bycsXG4gICAgd2lkdGg6ICcxMDB2dycsXG4gICAgaGVpZ2h0OiAnMTAwdmgnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMCknXG4gIH1cbn07XG5cbmNvbnN0IFdJTkRPV19QQUQgPSA0MDtcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG5jbGFzcyBQb3J0YWxlZCBleHRlbmRzIENvbXBvbmVudCB7XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY29tcG9uZW50OiAnZGl2JyxcbiAgICBvbkNsb3NlOiBub29wLFxuICAgIHRoZW1lXG4gIH07XG5cbiAgc3RhdGUgPSB7XG4gICAgcG9zOiBudWxsLFxuICAgIGlzVmlzaWJsZTogZmFsc2VcbiAgfTtcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyByZWxhdGl2ZVxuICAgIHRoaXMudW5zdWJzY3JpYmUgPSBzdWJzY3JpYmUodGhpcy5oYW5kbGVTY3JvbGwpO1xuICAgIHRoaXMuaGFuZGxlU2Nyb2xsKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgY29uc3QgZGlkT3BlbiA9IHRoaXMucHJvcHMuaXNPcGVuZWQgJiYgIXByZXZQcm9wcy5pc09wZW5lZDtcbiAgICBjb25zdCBkaWRDbG9zZSA9ICF0aGlzLnByb3BzLmlzT3BlbmVkICYmIHByZXZQcm9wcy5pc09wZW5lZDtcbiAgICBpZiAoZGlkT3BlbiB8fCBkaWRDbG9zZSkge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNWaXNpYmxlOiBkaWRPcGVufSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmhhbmRsZVNjcm9sbCgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgZWxlbWVudCA9IGNyZWF0ZVJlZigpO1xuICBjaGlsZCA9IGNyZWF0ZVJlZigpO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG4gIGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5jaGlsZC5jdXJyZW50KSB7XG4gICAgICBjb25zdCByZWN0ID0gdGhpcy5lbGVtZW50LmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCBjaGlsZFJlY3QgPSB0aGlzLmNoaWxkLmN1cnJlbnQgJiYgdGhpcy5jaGlsZC5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgcGFnZU9mZnNldCA9IGdldFBhZ2VPZmZzZXQoKTtcbiAgICAgIGNvbnN0IHt0b3A6IHRvcE9mZnNldCwgbGVmdDogbGVmdE9mZnNldCwgcmlnaHQ6IHJpZ2h0T2Zmc2V0fSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGNvbnN0IHBvcyA9IGdldENoaWxkUG9zKHtcbiAgICAgICAgb2Zmc2V0czoge3RvcE9mZnNldCwgbGVmdE9mZnNldCwgcmlnaHRPZmZzZXR9LFxuICAgICAgICByZWN0LFxuICAgICAgICBjaGlsZFJlY3QsXG4gICAgICAgIHBhZ2VPZmZzZXQsXG4gICAgICAgIHBhZGRpbmc6IFdJTkRPV19QQURcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWlzRXF1YWwocG9zLCB0aGlzLnN0YXRlLnBvcykpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cG9zfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICAvLyByZWxhdGl2ZVxuICAgICAgY29tcG9uZW50OiBDb21wLFxuICAgICAgb3ZlcmxheVpJbmRleCxcbiAgICAgIGlzT3BlbmVkLFxuICAgICAgb25DbG9zZSxcblxuICAgICAgLy8gTW9yZGFsXG4gICAgICBjaGlsZHJlbixcbiAgICAgIG1vZGFsUHJvcHNcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IHtpc1Zpc2libGUsIHBvc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgbW9kYWxTdHlsZSA9IHtcbiAgICAgIC4uLmRlZmF1bHRNb2RhbFN0eWxlLFxuICAgICAgb3ZlcmxheToge1xuICAgICAgICAuLi5kZWZhdWx0TW9kYWxTdHlsZS5vdmVybGF5LFxuICAgICAgICAvLyBuZWVkcyB0byBiZSBvbiB0b3Agb2YgZXhpc3RpbmcgbW9kYWxcbiAgICAgICAgekluZGV4OiBvdmVybGF5WkluZGV4IHx8IDk5OTlcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSb290Q29udGV4dC5Db25zdW1lcj5cbiAgICAgICAge2NvbnRleHQgPT4gKFxuICAgICAgICAgIDxDb21wIHJlZj17dGhpcy5lbGVtZW50fT5cbiAgICAgICAgICAgIHtpc09wZW5lZCA/IChcbiAgICAgICAgICAgICAgPE1vZGFsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibW9kYWwtcG9ydGFsXCJcbiAgICAgICAgICAgICAgICB7Li4ubW9kYWxQcm9wc31cbiAgICAgICAgICAgICAgICBhcmlhSGlkZUFwcD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgaXNPcGVuXG4gICAgICAgICAgICAgICAgc3R5bGU9e21vZGFsU3R5bGV9XG4gICAgICAgICAgICAgICAgcGFyZW50U2VsZWN0b3I9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIFJlYWN0IG1vZGFsIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vcmVhY3Rqcy9yZWFjdC1tb2RhbC9pc3N1ZXMvNzY5XG4gICAgICAgICAgICAgICAgICAvLyBmYWlsZWQgdG8gZXhlY3V0ZSByZW1vdmVDaGlsZCBvbiBwYXJlbnQgbm9kZSB3aGVuIGl0IGlzIGFscmVhZHkgdW5tb3VudGVkXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQuY3VycmVudCkgfHwge1xuICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUNoaWxkOiAoKSA9PiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZDogKCkgPT4ge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlPXtvbkNsb3NlfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicG9ydGFsZWQtY29udGVudFwiXG4gICAgICAgICAgICAgICAgICBrZXk9XCJpdGVtXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBpc1Zpc2libGUgPyAxIDogMCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0aGlzLnN0YXRlLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdGhpcy5wcm9wcy50aGVtZS50cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6IGlzVmlzaWJsZSA/ICcwcHgnIDogJzE0cHgnLFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIC4uLnBvc1xuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5jaGlsZH1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IG92ZXJsYXlaSW5kZXggPyBvdmVybGF5WkluZGV4ICsgMSA6IDEwMDAwXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L01vZGFsPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9Db21wPlxuICAgICAgICApfVxuICAgICAgPC9Sb290Q29udGV4dC5Db25zdW1lcj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhUaGVtZShQb3J0YWxlZCk7XG4iXX0=