"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _moment = _interopRequireDefault(require("moment"));

var _icons = require("../common/icons");

var _localization = require("../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: red;\n  font-size: 14px;\n  margin-bottom: 16px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  font-size: 14px;\n  align-items: center;\n  color: ", ";\n  cursor: pointer;\n  margin-bottom: 40px;\n\n  :hover {\n    font-weight: 500;\n  }\n\n  span {\n    white-space: nowrap;\n  }\n  svg {\n    margin-right: 10px;\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 23%;\n  margin-right: 2%;\n  max-width: 500px;\n  margin-bottom: 40px;\n  height: 245px;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n\n  :last {\n    margin-right: 0;\n  }\n\n  .asset__title {\n    font-size: 12px;\n    font-weight: 500;\n    color: ", ";\n    line-height: 18px;\n    height: 32px;\n  }\n\n  .asset__image {\n    border-radius: 4px;\n    overflow: hidden;\n    margin-bottom: 12px;\n    opacity: 0.9;\n    transition: opacity 0.4s ease;\n    position: relative;\n    line-height: 0;\n    height: ", "px;\n    flex-shrink: 0;\n\n    img {\n      max-width: 100%;\n    }\n    :hover {\n      cursor: pointer;\n      opacity: 1;\n    }\n  }\n\n  .asset__image__caption {\n    font-size: 11px;\n    font-weight: 400;\n    line-height: 16px;\n    margin-top: 10px;\n    height: 48px;\n    overflow: hidden;\n    display: -webkit-box;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 3;\n    -webkit-box-orient: vertical;\n  }\n\n  .asset__last-updated {\n    font-size: 11px;\n    color: ", ";\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: flex-start;\n  flex-wrap: wrap;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var imageH = 108;
var propTypes = {
  onLoadAsset: _propTypes["default"].func.isRequired,
  back: _propTypes["default"].func.isRequired
};

var StyledAssetGallery = _styledComponents["default"].div.attrs({
  className: 'storage-asset-gallery'
})(_templateObject());

var StyledAssetItem = _styledComponents["default"].div.attrs({
  className: 'asset__item'
})(_templateObject2(), function (props) {
  return props.theme.textColorLT;
}, imageH, function (props) {
  return props.theme.textColorLT;
});

var BackLink = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.titleColorLT;
});

var StyledError = _styledComponents["default"].div(_templateObject4());

var getDuration = function getDuration(last) {
  return _moment["default"].duration(new Date().valueOf() - last).humanize();
};

var AssetItem = function AssetItem(_ref) {
  var asset = _ref.asset,
      onClick = _ref.onClick;
  return /*#__PURE__*/_react["default"].createElement(StyledAssetItem, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "asset__image",
    onClick: onClick
  }, asset.imageUrl && /*#__PURE__*/_react["default"].createElement("img", {
    src: asset.imageUrl
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "asset__title"
  }, asset.label || asset.title), /*#__PURE__*/_react["default"].createElement("div", {
    className: "asset__image__caption"
  }, asset.description), asset.lastUpdated ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "asset__last-updated"
  }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: 'modal.storageMapViewer.lastModified',
    values: {
      lastUpdated: getDuration(asset.lastUpdated)
    }
  })) : null);
};

var StorageAssetsViewer = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(StorageAssetsViewer, _React$Component);

  var _super = _createSuper(StorageAssetsViewer);

  function StorageAssetsViewer() {
    (0, _classCallCheck2["default"])(this, StorageAssetsViewer);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(StorageAssetsViewer, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          assets = _this$props.assets,
          onLoadAsset = _this$props.onLoadAsset,
          back = _this$props.back,
          error = _this$props.error;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "storage-asset-viewer"
      }, /*#__PURE__*/_react["default"].createElement(BackLink, {
        onClick: back
      }, /*#__PURE__*/_react["default"].createElement(_icons.LeftArrow, {
        height: "12px"
      }), /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
        id: 'modal.storageMapViewer.back'
      }))), error && /*#__PURE__*/_react["default"].createElement(StyledError, null, error.message), /*#__PURE__*/_react["default"].createElement(StyledAssetGallery, null, assets.map(function (sp) {
        return /*#__PURE__*/_react["default"].createElement(AssetItem, {
          asset: sp,
          key: sp.id,
          onClick: function onClick() {
            return onLoadAsset(sp);
          }
        });
      })));
    }
  }]);
  return StorageAssetsViewer;
}(_react["default"].Component);

(0, _defineProperty2["default"])(StorageAssetsViewer, "propTypes", propTypes);
var _default = StorageAssetsViewer;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9zdG9yYWdlLW1hcC12aWV3ZXIuanMiXSwibmFtZXMiOlsiaW1hZ2VIIiwicHJvcFR5cGVzIiwib25Mb2FkQXNzZXQiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsImJhY2siLCJTdHlsZWRBc3NldEdhbGxlcnkiLCJzdHlsZWQiLCJkaXYiLCJhdHRycyIsImNsYXNzTmFtZSIsIlN0eWxlZEFzc2V0SXRlbSIsInByb3BzIiwidGhlbWUiLCJ0ZXh0Q29sb3JMVCIsIkJhY2tMaW5rIiwidGl0bGVDb2xvckxUIiwiU3R5bGVkRXJyb3IiLCJnZXREdXJhdGlvbiIsImxhc3QiLCJtb21lbnQiLCJkdXJhdGlvbiIsIkRhdGUiLCJ2YWx1ZU9mIiwiaHVtYW5pemUiLCJBc3NldEl0ZW0iLCJhc3NldCIsIm9uQ2xpY2siLCJpbWFnZVVybCIsImxhYmVsIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImxhc3RVcGRhdGVkIiwiU3RvcmFnZUFzc2V0c1ZpZXdlciIsImFzc2V0cyIsImVycm9yIiwibWVzc2FnZSIsIm1hcCIsInNwIiwiaWQiLCJSZWFjdCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsR0FBZjtBQUVBLElBQU1DLFNBQVMsR0FBRztBQUNoQkMsRUFBQUEsV0FBVyxFQUFFQyxzQkFBVUMsSUFBVixDQUFlQyxVQURaO0FBRWhCQyxFQUFBQSxJQUFJLEVBQUVILHNCQUFVQyxJQUFWLENBQWVDO0FBRkwsQ0FBbEI7O0FBS0EsSUFBTUUsa0JBQWtCLEdBQUdDLDZCQUFPQyxHQUFQLENBQVdDLEtBQVgsQ0FBaUI7QUFDMUNDLEVBQUFBLFNBQVMsRUFBRTtBQUQrQixDQUFqQixD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LENBUkYsQ0FERjtBQWdCRDs7O0VBdEIrQkUsa0JBQU1DLFM7O2lDQUFsQ1IsbUIsZUFDZWpDLFM7ZUF3Qk5pQyxtQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQge0xlZnRBcnJvd30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBpbWFnZUggPSAxMDg7XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgb25Mb2FkQXNzZXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIGJhY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbn07XG5cbmNvbnN0IFN0eWxlZEFzc2V0R2FsbGVyeSA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdzdG9yYWdlLWFzc2V0LWdhbGxlcnknXG59KWBcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xuICBmbGV4LXdyYXA6IHdyYXA7XG5gO1xuXG5jb25zdCBTdHlsZWRBc3NldEl0ZW0gPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnYXNzZXRfX2l0ZW0nXG59KWBcbiAgd2lkdGg6IDIzJTtcbiAgbWFyZ2luLXJpZ2h0OiAyJTtcbiAgbWF4LXdpZHRoOiA1MDBweDtcbiAgbWFyZ2luLWJvdHRvbTogNDBweDtcbiAgaGVpZ2h0OiAyNDVweDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuXG4gIDpsYXN0IHtcbiAgICBtYXJnaW4tcmlnaHQ6IDA7XG4gIH1cblxuICAuYXNzZXRfX3RpdGxlIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gICAgbGluZS1oZWlnaHQ6IDE4cHg7XG4gICAgaGVpZ2h0OiAzMnB4O1xuICB9XG5cbiAgLmFzc2V0X19pbWFnZSB7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICBvcGFjaXR5OiAwLjk7XG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjRzIGVhc2U7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGxpbmUtaGVpZ2h0OiAwO1xuICAgIGhlaWdodDogJHtpbWFnZUh9cHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG5cbiAgICBpbWcge1xuICAgICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIH1cbiAgICA6aG92ZXIge1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgb3BhY2l0eTogMTtcbiAgICB9XG4gIH1cblxuICAuYXNzZXRfX2ltYWdlX19jYXB0aW9uIHtcbiAgICBmb250LXNpemU6IDExcHg7XG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICBsaW5lLWhlaWdodDogMTZweDtcbiAgICBtYXJnaW4tdG9wOiAxMHB4O1xuICAgIGhlaWdodDogNDhweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGRpc3BsYXk6IC13ZWJraXQtYm94O1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIC13ZWJraXQtbGluZS1jbGFtcDogMztcbiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICB9XG5cbiAgLmFzc2V0X19sYXN0LXVwZGF0ZWQge1xuICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gIH1cbmA7XG5cbmNvbnN0IEJhY2tMaW5rID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aXRsZUNvbG9yTFR9O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIG1hcmdpbi1ib3R0b206IDQwcHg7XG5cbiAgOmhvdmVyIHtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICB9XG5cbiAgc3BhbiB7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgfVxuICBzdmcge1xuICAgIG1hcmdpbi1yaWdodDogMTBweDtcbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkRXJyb3IgPSBzdHlsZWQuZGl2YFxuICBjb2xvcjogcmVkO1xuICBmb250LXNpemU6IDE0cHg7XG4gIG1hcmdpbi1ib3R0b206IDE2cHg7XG5gO1xuXG5jb25zdCBnZXREdXJhdGlvbiA9IGxhc3QgPT4gbW9tZW50LmR1cmF0aW9uKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gbGFzdCkuaHVtYW5pemUoKTtcblxuY29uc3QgQXNzZXRJdGVtID0gKHthc3NldCwgb25DbGlja30pID0+IChcbiAgPFN0eWxlZEFzc2V0SXRlbT5cbiAgICA8ZGl2IGNsYXNzTmFtZT1cImFzc2V0X19pbWFnZVwiIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAge2Fzc2V0LmltYWdlVXJsICYmIDxpbWcgc3JjPXthc3NldC5pbWFnZVVybH0gLz59XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9XCJhc3NldF9fdGl0bGVcIj57YXNzZXQubGFiZWwgfHwgYXNzZXQudGl0bGV9PC9kaXY+XG4gICAgPGRpdiBjbGFzc05hbWU9XCJhc3NldF9faW1hZ2VfX2NhcHRpb25cIj57YXNzZXQuZGVzY3JpcHRpb259PC9kaXY+XG4gICAge2Fzc2V0Lmxhc3RVcGRhdGVkID8gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhc3NldF9fbGFzdC11cGRhdGVkXCI+XG4gICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgaWQ9eydtb2RhbC5zdG9yYWdlTWFwVmlld2VyLmxhc3RNb2RpZmllZCd9XG4gICAgICAgICAgdmFsdWVzPXt7bGFzdFVwZGF0ZWQ6IGdldER1cmF0aW9uKGFzc2V0Lmxhc3RVcGRhdGVkKX19XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApIDogbnVsbH1cbiAgPC9TdHlsZWRBc3NldEl0ZW0+XG4pO1xuXG5jbGFzcyBTdG9yYWdlQXNzZXRzVmlld2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHByb3BUeXBlcztcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2Fzc2V0cywgb25Mb2FkQXNzZXQsIGJhY2ssIGVycm9yfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdG9yYWdlLWFzc2V0LXZpZXdlclwiPlxuICAgICAgICA8QmFja0xpbmsgb25DbGljaz17YmFja30+XG4gICAgICAgICAgPExlZnRBcnJvdyBoZWlnaHQ9XCIxMnB4XCIgLz5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc3RvcmFnZU1hcFZpZXdlci5iYWNrJ30gLz5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvQmFja0xpbms+XG4gICAgICAgIHtlcnJvciAmJiA8U3R5bGVkRXJyb3I+e2Vycm9yLm1lc3NhZ2V9PC9TdHlsZWRFcnJvcj59XG4gICAgICAgIDxTdHlsZWRBc3NldEdhbGxlcnk+XG4gICAgICAgICAge2Fzc2V0cy5tYXAoc3AgPT4gKFxuICAgICAgICAgICAgPEFzc2V0SXRlbSBhc3NldD17c3B9IGtleT17c3AuaWR9IG9uQ2xpY2s9eygpID0+IG9uTG9hZEFzc2V0KHNwKX0gLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9TdHlsZWRBc3NldEdhbGxlcnk+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0b3JhZ2VBc3NldHNWaWV3ZXI7XG4iXX0=