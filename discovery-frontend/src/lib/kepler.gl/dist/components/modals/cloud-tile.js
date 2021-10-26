"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _icons = require("../common/icons");

var _styledComponents2 = require("../common/styled-components");

var _loadingSpinner = _interopRequireDefault(require("../common/loading-spinner"));

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 11px;\n  margin-top: 8px;\n  text-align: center;\n  color: ", ";\n  overflow: hidden;\n  width: 100px;\n  text-overflow: ellipsis;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 12px;\n  margin-top: 12px;\n  margin-bottom: 4px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-right: 12px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-start;\n  border-radius: 2px;\n  border: 1px solid\n    ", ";\n  color: ", ";\n  cursor: pointer;\n  font-weight: 500;\n  width: 120px;\n  height: 168px;\n  background-color: #ffffff;\n  transition: ", ";\n  position: relative;\n  :hover {\n    border: 1px solid ", ";\n    color: ", ";\n  }\n\n  .button {\n    margin-top: 20px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledTileWrapper = _styledComponents["default"].div.attrs({
  className: 'provider-tile__wrapper'
})(_templateObject(), function (props) {
  return props.selected ? props.theme.primaryBtnBgd : props.theme.selectBorderColorLT;
}, function (props) {
  return props.selected ? props.theme.primaryBtnBgd : props.theme.selectBorderColorLT;
}, function (props) {
  return props.theme.transition;
}, function (props) {
  return props.theme.primaryBtnBgd;
}, function (props) {
  return props.theme.primaryBtnBgd;
});

var StyledBox = (0, _styledComponents["default"])(_styledComponents2.CenterVerticalFlexbox)(_templateObject2());

var StyledCloudName = _styledComponents["default"].div(_templateObject3());

var StyledUserName = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.primaryBtnActBgd;
});

var LoginButton = function LoginButton(_ref) {
  var onClick = _ref.onClick;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
    className: "login-button",
    link: true,
    small: true,
    onClick: onClick
  }, /*#__PURE__*/_react["default"].createElement(_icons.Login, null), "Login");
};

var LogoutButton = function LogoutButton(_ref2) {
  var onClick = _ref2.onClick;
  return /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
    className: "logout-button",
    link: true,
    small: true,
    onClick: onClick
  }, /*#__PURE__*/_react["default"].createElement(_icons.Logout, null), "Logout");
};

var ActionButton = function ActionButton(_ref3) {
  var isConnected = _ref3.isConnected,
      _ref3$actionName = _ref3.actionName,
      actionName = _ref3$actionName === void 0 ? null : _ref3$actionName,
      isReady = _ref3.isReady;
  return isConnected && actionName ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
    className: "cloud-tile__action",
    small: true,
    secondary: true,
    disabled: !isReady
  }, isReady ? actionName : /*#__PURE__*/_react["default"].createElement(_loadingSpinner["default"], {
    size: 12
  })) : null;
};

var CloudTile = function CloudTile(_ref4) {
  var onSelect = _ref4.onSelect,
      _ref4$onConnect = _ref4.onConnect,
      onConnect = _ref4$onConnect === void 0 ? null : _ref4$onConnect,
      _ref4$onLogout = _ref4.onLogout,
      onLogout = _ref4$onLogout === void 0 ? null : _ref4$onLogout,
      _ref4$actionName = _ref4.actionName,
      actionName = _ref4$actionName === void 0 ? null : _ref4$actionName,
      cloudProvider = _ref4.cloudProvider,
      onSetCloudProvider = _ref4.onSetCloudProvider,
      isSelected = _ref4.isSelected,
      isConnected = _ref4.isConnected,
      _ref4$isReady = _ref4.isReady,
      isReady = _ref4$isReady === void 0 ? true : _ref4$isReady;
  var userName = typeof cloudProvider.getUserName === 'function' ? cloudProvider.getUserName() : null;
  var onClickConnect = typeof onConnect === 'function' ? onConnect : function () {
    return cloudProvider.login(function () {
      return onSetCloudProvider(cloudProvider.name);
    });
  };
  var onClickLogout = typeof onLogout === 'function' ? onLogout : function () {
    return cloudProvider.logout(function () {
      return isSelected ? onSetCloudProvider(null) : null;
    });
  };
  return /*#__PURE__*/_react["default"].createElement(StyledBox, null, /*#__PURE__*/_react["default"].createElement(StyledTileWrapper, {
    onClick: isConnected ? onSelect : onClickConnect,
    selected: isSelected
  }, /*#__PURE__*/_react["default"].createElement(StyledCloudName, null, cloudProvider.displayName || cloudProvider.name), cloudProvider.icon ? /*#__PURE__*/_react["default"].createElement(cloudProvider.icon, {
    height: "64px"
  }) : null, /*#__PURE__*/_react["default"].createElement(ActionButton, {
    isConnected: isConnected,
    actionName: actionName,
    isReady: isReady
  }), userName && /*#__PURE__*/_react["default"].createElement(StyledUserName, null, userName), isSelected && /*#__PURE__*/_react["default"].createElement(_styledComponents2.CheckMark, null)), isConnected ? /*#__PURE__*/_react["default"].createElement(LogoutButton, {
    onClick: onClickLogout
  }) : /*#__PURE__*/_react["default"].createElement(LoginButton, {
    onClick: onClickConnect
  }));
};

var _default = CloudTile;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9jbG91ZC10aWxlLmpzIl0sIm5hbWVzIjpbIlN0eWxlZFRpbGVXcmFwcGVyIiwic3R5bGVkIiwiZGl2IiwiYXR0cnMiLCJjbGFzc05hbWUiLCJwcm9wcyIsInNlbGVjdGVkIiwidGhlbWUiLCJwcmltYXJ5QnRuQmdkIiwic2VsZWN0Qm9yZGVyQ29sb3JMVCIsInRyYW5zaXRpb24iLCJTdHlsZWRCb3giLCJDZW50ZXJWZXJ0aWNhbEZsZXhib3giLCJTdHlsZWRDbG91ZE5hbWUiLCJTdHlsZWRVc2VyTmFtZSIsInByaW1hcnlCdG5BY3RCZ2QiLCJMb2dpbkJ1dHRvbiIsIm9uQ2xpY2siLCJMb2dvdXRCdXR0b24iLCJBY3Rpb25CdXR0b24iLCJpc0Nvbm5lY3RlZCIsImFjdGlvbk5hbWUiLCJpc1JlYWR5IiwiQ2xvdWRUaWxlIiwib25TZWxlY3QiLCJvbkNvbm5lY3QiLCJvbkxvZ291dCIsImNsb3VkUHJvdmlkZXIiLCJvblNldENsb3VkUHJvdmlkZXIiLCJpc1NlbGVjdGVkIiwidXNlck5hbWUiLCJnZXRVc2VyTmFtZSIsIm9uQ2xpY2tDb25uZWN0IiwibG9naW4iLCJuYW1lIiwib25DbGlja0xvZ291dCIsImxvZ291dCIsImRpc3BsYXlOYW1lIiwiaWNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixHQUFHQyw2QkFBT0MsR0FBUCxDQUFXQyxLQUFYLENBQWlCO0FBQ3pDQyxFQUFBQSxTQUFTLEVBQUU7QUFEOEIsQ0FBakIsQ0FBSCxvQkFTakIsVUFBQUMsS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0MsUUFBTixHQUFpQkQsS0FBSyxDQUFDRSxLQUFOLENBQVlDLGFBQTdCLEdBQTZDSCxLQUFLLENBQUNFLEtBQU4sQ0FBWUUsbUJBQTlEO0FB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Z0NBQUMsV0FBRDtBQUFhLElBQUEsT0FBTyxFQUFFSDtBQUF0QixJQVhKLENBREY7QUFnQkQsQ0FqREQ7O2VBbURlVCxTIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtMb2dvdXQsIExvZ2lufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQge0NlbnRlclZlcnRpY2FsRmxleGJveCwgQnV0dG9uLCBDaGVja01hcmt9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBMb2FkaW5nU3Bpbm5lciBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9sb2FkaW5nLXNwaW5uZXInO1xuXG5jb25zdCBTdHlsZWRUaWxlV3JhcHBlciA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdwcm92aWRlci10aWxlX193cmFwcGVyJ1xufSlgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xuICBib3JkZXI6IDFweCBzb2xpZFxuICAgICR7cHJvcHMgPT4gKHByb3BzLnNlbGVjdGVkID8gcHJvcHMudGhlbWUucHJpbWFyeUJ0bkJnZCA6IHByb3BzLnRoZW1lLnNlbGVjdEJvcmRlckNvbG9yTFQpfTtcbiAgY29sb3I6ICR7cHJvcHMgPT4gKHByb3BzLnNlbGVjdGVkID8gcHJvcHMudGhlbWUucHJpbWFyeUJ0bkJnZCA6IHByb3BzLnRoZW1lLnNlbGVjdEJvcmRlckNvbG9yTFQpfTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LXdlaWdodDogNTAwO1xuICB3aWR0aDogMTIwcHg7XG4gIGhlaWdodDogMTY4cHg7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7XG4gIHRyYW5zaXRpb246ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudHJhbnNpdGlvbn07XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgOmhvdmVyIHtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAke3Byb3BzID0+IHByb3BzLnRoZW1lLnByaW1hcnlCdG5CZ2R9O1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnByaW1hcnlCdG5CZ2R9O1xuICB9XG5cbiAgLmJ1dHRvbiB7XG4gICAgbWFyZ2luLXRvcDogMjBweDtcbiAgfVxuYDtcblxuY29uc3QgU3R5bGVkQm94ID0gc3R5bGVkKENlbnRlclZlcnRpY2FsRmxleGJveClgXG4gIG1hcmdpbi1yaWdodDogMTJweDtcbmA7XG5cbmNvbnN0IFN0eWxlZENsb3VkTmFtZSA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgbWFyZ2luLXRvcDogMTJweDtcbiAgbWFyZ2luLWJvdHRvbTogNHB4O1xuYDtcblxuY29uc3QgU3R5bGVkVXNlck5hbWUgPSBzdHlsZWQuZGl2YFxuICBmb250LXNpemU6IDExcHg7XG4gIG1hcmdpbi10b3A6IDhweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wcmltYXJ5QnRuQWN0QmdkfTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd2lkdGg6IDEwMHB4O1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbmA7XG5cbmNvbnN0IExvZ2luQnV0dG9uID0gKHtvbkNsaWNrfSkgPT4gKFxuICA8QnV0dG9uIGNsYXNzTmFtZT1cImxvZ2luLWJ1dHRvblwiIGxpbmsgc21hbGwgb25DbGljaz17b25DbGlja30+XG4gICAgPExvZ2luIC8+XG4gICAgTG9naW5cbiAgPC9CdXR0b24+XG4pO1xuXG5jb25zdCBMb2dvdXRCdXR0b24gPSAoe29uQ2xpY2t9KSA9PiAoXG4gIDxCdXR0b24gY2xhc3NOYW1lPVwibG9nb3V0LWJ1dHRvblwiIGxpbmsgc21hbGwgb25DbGljaz17b25DbGlja30+XG4gICAgPExvZ291dCAvPlxuICAgIExvZ291dFxuICA8L0J1dHRvbj5cbik7XG5cbmNvbnN0IEFjdGlvbkJ1dHRvbiA9ICh7aXNDb25uZWN0ZWQsIGFjdGlvbk5hbWUgPSBudWxsLCBpc1JlYWR5fSkgPT5cbiAgaXNDb25uZWN0ZWQgJiYgYWN0aW9uTmFtZSA/IChcbiAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNsb3VkLXRpbGVfX2FjdGlvblwiIHNtYWxsIHNlY29uZGFyeSBkaXNhYmxlZD17IWlzUmVhZHl9PlxuICAgICAge2lzUmVhZHkgPyBhY3Rpb25OYW1lIDogPExvYWRpbmdTcGlubmVyIHNpemU9ezEyfSAvPn1cbiAgICA8L0J1dHRvbj5cbiAgKSA6IG51bGw7XG5cbmNvbnN0IENsb3VkVGlsZSA9ICh7XG4gIC8vIGFjdGlvbiB3aGVuIGNsaWNrIG9uIHRoZSB0aWxlXG4gIG9uU2VsZWN0LFxuICAvLyBkZWZhdWx0IHRvIGxvZ2luXG4gIG9uQ29ubmVjdCA9IG51bGwsXG4gIC8vIGRlZmF1bHQgdG8gbG9nb3V0XG4gIG9uTG9nb3V0ID0gbnVsbCxcbiAgLy8gYWN0aW9uIG5hbWVcbiAgYWN0aW9uTmFtZSA9IG51bGwsXG4gIC8vIGNsb3VkIHByb3ZpZGVyIGNsYXNzXG4gIGNsb3VkUHJvdmlkZXIsXG4gIC8vIGZ1bmN0aW9uIHRvIHRha2UgYWZ0ZXIgbG9naW4gb3IgbG9nb3V0XG4gIG9uU2V0Q2xvdWRQcm92aWRlcixcbiAgLy8gd2hldGhlciBwcm92aWRlciBpcyBzZWxlY3RlZCBhcyBjdXJyZW50UHJvdmlkZXJcbiAgaXNTZWxlY3RlZCxcbiAgLy8gd2hldGhlciB1c2VyIGhhcyBsb2dnZWQgaW5cbiAgaXNDb25uZWN0ZWQsXG5cbiAgaXNSZWFkeSA9IHRydWVcbn0pID0+IHtcbiAgY29uc3QgdXNlck5hbWUgPVxuICAgIHR5cGVvZiBjbG91ZFByb3ZpZGVyLmdldFVzZXJOYW1lID09PSAnZnVuY3Rpb24nID8gY2xvdWRQcm92aWRlci5nZXRVc2VyTmFtZSgpIDogbnVsbDtcblxuICBjb25zdCBvbkNsaWNrQ29ubmVjdCA9XG4gICAgdHlwZW9mIG9uQ29ubmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBvbkNvbm5lY3RcbiAgICAgIDogKCkgPT4gY2xvdWRQcm92aWRlci5sb2dpbigoKSA9PiBvblNldENsb3VkUHJvdmlkZXIoY2xvdWRQcm92aWRlci5uYW1lKSk7XG5cbiAgY29uc3Qgb25DbGlja0xvZ291dCA9XG4gICAgdHlwZW9mIG9uTG9nb3V0ID09PSAnZnVuY3Rpb24nXG4gICAgICA/IG9uTG9nb3V0XG4gICAgICA6ICgpID0+IGNsb3VkUHJvdmlkZXIubG9nb3V0KCgpID0+IChpc1NlbGVjdGVkID8gb25TZXRDbG91ZFByb3ZpZGVyKG51bGwpIDogbnVsbCkpO1xuXG4gIHJldHVybiAoXG4gICAgPFN0eWxlZEJveD5cbiAgICAgIDxTdHlsZWRUaWxlV3JhcHBlciBvbkNsaWNrPXtpc0Nvbm5lY3RlZCA/IG9uU2VsZWN0IDogb25DbGlja0Nvbm5lY3R9IHNlbGVjdGVkPXtpc1NlbGVjdGVkfT5cbiAgICAgICAgPFN0eWxlZENsb3VkTmFtZT57Y2xvdWRQcm92aWRlci5kaXNwbGF5TmFtZSB8fCBjbG91ZFByb3ZpZGVyLm5hbWV9PC9TdHlsZWRDbG91ZE5hbWU+XG4gICAgICAgIHtjbG91ZFByb3ZpZGVyLmljb24gPyA8Y2xvdWRQcm92aWRlci5pY29uIGhlaWdodD1cIjY0cHhcIiAvPiA6IG51bGx9XG4gICAgICAgIDxBY3Rpb25CdXR0b24gaXNDb25uZWN0ZWQ9e2lzQ29ubmVjdGVkfSBhY3Rpb25OYW1lPXthY3Rpb25OYW1lfSBpc1JlYWR5PXtpc1JlYWR5fSAvPlxuICAgICAgICB7dXNlck5hbWUgJiYgPFN0eWxlZFVzZXJOYW1lPnt1c2VyTmFtZX08L1N0eWxlZFVzZXJOYW1lPn1cbiAgICAgICAge2lzU2VsZWN0ZWQgJiYgPENoZWNrTWFyayAvPn1cbiAgICAgIDwvU3R5bGVkVGlsZVdyYXBwZXI+XG4gICAgICB7aXNDb25uZWN0ZWQgPyAoXG4gICAgICAgIDxMb2dvdXRCdXR0b24gb25DbGljaz17b25DbGlja0xvZ291dH0gLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxMb2dpbkJ1dHRvbiBvbkNsaWNrPXtvbkNsaWNrQ29ubmVjdH0gLz5cbiAgICAgICl9XG4gICAgPC9TdHlsZWRCb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDbG91ZFRpbGU7XG4iXX0=