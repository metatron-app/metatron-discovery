"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ShareMapUrlModalFactory;
exports.SharingUrl = exports.StyleSharingUrl = exports.StyledInputLabel = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _reactCopyToClipboard = require("react-copy-to-clipboard");

var _base = require("../../styles/base");

var _imageModalContainer = _interopRequireDefault(require("./image-modal-container"));

var _providerModalContainer = _interopRequireDefault(require("./provider-modal-container"));

var _styledComponents2 = require("../common/styled-components");

var _cloudTile = _interopRequireDefault(require("./cloud-tile"));

var _statusPanel = _interopRequireDefault(require("./status-panel"));

var _localization = require("../../localization");

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  min-height: 500px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding: 24px 72px 40px 72px;\n  margin: 0 -72px -40px -72px;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 100%;\n  display: flex;\n  margin-bottom: 14px;\n  flex-direction: column;\n\n  input {\n    border-right: 0;\n  }\n\n  .button {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-size: 12px;\n  color: ", ";\n  letter-spacing: 0.2px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledInputLabel = _styledComponents["default"].label(_templateObject(), function (props) {
  return props.theme.textColorLT;
});

exports.StyledInputLabel = StyledInputLabel;

var StyleSharingUrl = _styledComponents["default"].div.attrs({
  className: 'sharing-url'
})(_templateObject2());

exports.StyleSharingUrl = StyleSharingUrl;

var SharingUrl = function SharingUrl(_ref) {
  var url = _ref.url,
      _ref$message = _ref.message,
      message = _ref$message === void 0 ? '' : _ref$message;

  var _useState = (0, _react.useState)(false),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      copied = _useState2[0],
      setCopy = _useState2[1];

  return /*#__PURE__*/_react["default"].createElement(StyleSharingUrl, null, /*#__PURE__*/_react["default"].createElement(StyledInputLabel, null, message), /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.InputLight, {
    type: "text",
    value: url,
    readOnly: true,
    selected: true
  }), /*#__PURE__*/_react["default"].createElement(_reactCopyToClipboard.CopyToClipboard, {
    text: url,
    onCopy: function onCopy() {
      return setCopy(true);
    }
  }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.Button, {
    width: "80px"
  }, copied ? 'Copied!' : 'Copy'))));
};

exports.SharingUrl = SharingUrl;

var nop = function nop() {};

var StyledShareMapModal = (0, _styledComponents["default"])(_styledComponents2.StyledModalContent)(_templateObject3());

var StyledInnerDiv = _styledComponents["default"].div(_templateObject4());

function ShareMapUrlModalFactory() {
  var ShareMapUrlModal = function ShareMapUrlModal(_ref2) {
    var isProviderLoading = _ref2.isProviderLoading,
        isReady = _ref2.isReady,
        onExport = _ref2.onExport,
        cloudProviders = _ref2.cloudProviders,
        currentProvider = _ref2.currentProvider,
        providerError = _ref2.providerError,
        successInfo = _ref2.successInfo,
        onSetCloudProvider = _ref2.onSetCloudProvider,
        onUpdateImageSetting = _ref2.onUpdateImageSetting,
        cleanupExportImage = _ref2.cleanupExportImage;
    var shareUrl = successInfo.shareUrl,
        folderLink = successInfo.folderLink;
    var provider = currentProvider ? cloudProviders.find(function (p) {
      return p.name === currentProvider;
    }) : null;
    return /*#__PURE__*/_react["default"].createElement(_styledComponents.ThemeProvider, {
      theme: _base.themeLT
    }, /*#__PURE__*/_react["default"].createElement(_providerModalContainer["default"], {
      onSetCloudProvider: onSetCloudProvider,
      cloudProviders: cloudProviders,
      currentProvider: currentProvider
    }, /*#__PURE__*/_react["default"].createElement(_imageModalContainer["default"], {
      currentProvider: currentProvider,
      cloudProviders: cloudProviders,
      onUpdateImageSetting: onUpdateImageSetting,
      cleanupExportImage: cleanupExportImage
    }, /*#__PURE__*/_react["default"].createElement(StyledShareMapModal, {
      className: "export-cloud-modal"
    }, /*#__PURE__*/_react["default"].createElement(StyledInnerDiv, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.shareUriTitle'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "subtitle"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.shareUriSubtitle'
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title warning"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.shareDisclaimer'
    })))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, {
      disabled: isProviderLoading
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.cloudTitle'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "subtitle"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.cloudSubtitle'
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, cloudProviders.map(function (cloudProvider) {
      return /*#__PURE__*/_react["default"].createElement(_cloudTile["default"], {
        key: cloudProvider.name,
        onSelect: function onSelect() {
          return onExport(cloudProvider);
        },
        onSetCloudProvider: onSetCloudProvider,
        cloudProvider: cloudProvider,
        actionName: "Upload",
        isSelected: cloudProvider.name === currentProvider,
        isConnected: Boolean(cloudProvider.getAccessToken()),
        isReady: isReady
      });
    }))), isProviderLoading || providerError ? /*#__PURE__*/_react["default"].createElement(_statusPanel["default"], {
      isLoading: isProviderLoading,
      error: providerError,
      providerIcon: provider && provider.icon
    }) : null, shareUrl && /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, "Share Url")), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, /*#__PURE__*/_react["default"].createElement(SharingUrl, {
      key: 0,
      url: shareUrl
    }), provider && folderLink && /*#__PURE__*/_react["default"].createElement("a", {
      key: 1,
      href: folderLink,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        textDecoration: 'underline'
      }
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.shareMap.gotoPage',
      values: {
        currentProvider: currentProvider
      }
    })))))))));
  };

  ShareMapUrlModal.defaultProps = {
    isProviderLoading: false,
    onExport: nop,
    cloudProviders: [],
    currentProvider: null,
    providerError: null,
    successInfo: {},
    onSetCloudProvider: nop,
    onUpdateImageSetting: nop
  };
  return ShareMapUrlModal;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9zaGFyZS1tYXAtbW9kYWwuanMiXSwibmFtZXMiOlsiU3R5bGVkSW5wdXRMYWJlbCIsInN0eWxlZCIsImxhYmVsIiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvckxUIiwiU3R5bGVTaGFyaW5nVXJsIiwiZGl2IiwiYXR0cnMiLCJjbGFzc05hbWUiLCJTaGFyaW5nVXJsIiwidXJsIiwibWVzc2FnZSIsImNvcGllZCIsInNldENvcHkiLCJkaXNwbGF5Iiwibm9wIiwiU3R5bGVkU2hhcmVNYXBNb2RhbCIsIlN0eWxlZE1vZGFsQ29udGVudCIsIlN0eWxlZElubmVyRGl2IiwiU2hhcmVNYXBVcmxNb2RhbEZhY3RvcnkiLCJTaGFyZU1hcFVybE1vZGFsIiwiaXNQcm92aWRlckxvYWRpbmciLCJpc1JlYWR5Iiwib25FeHBvcnQiLCJjbG91ZFByb3ZpZGVycyIsImN1cnJlbnRQcm92aWRlciIsInByb3ZpZGVyRXJyb3IiLCJzdWNjZXNzSW5mbyIsIm9uU2V0Q2xvdWRQcm92aWRlciIsIm9uVXBkYXRlSW1hZ2VTZXR0aW5nIiwiY2xlYW51cEV4cG9ydEltYWdlIiwic2hhcmVVcmwiLCJmb2xkZXJMaW5rIiwicHJvdmlkZXIiLCJmaW5kIiwicCIsIm5hbWUiLCJ0aGVtZUxUIiwibWFwIiwiY2xvdWRQcm92aWRlciIsIkJvb2xlYW4iLCJnZXRBY2Nlc3NUb2tlbiIsImljb24iLCJ0ZXh0RGVjb3JhdGlvbiIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFNQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRU8sSUFBTUEsZ0JBQWdCLEdBQUdDLDZCQUFPQyxLQUFWLG9CQUVsQixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLFdBQWhCO0FBQUEsQ0FGYSxDQUF0Qjs7OztBQU1BLElBQU1DLGVBQWUsR0FBR0wsNkJBQU9NLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQjtBQUM5Q0MsRUFBQUEsU0FBUyxFQUFFO0FBRG1DLENBQWpCLENBQUgsb0JBQXJCOzs7O0FBa0JBLElBQU1DLFVBQVUsR0FBRyxTQUFiQSxVQUFhLE9BQXlCO0FBQUEsTUFBdkJDLEdBQXVCLFFBQXZCQSxHQUF1QjtBQUFBLDBCQUFsQkMsT0FBa0I7QUFBQSxNQUFsQkEsT0FBa0IsNkJBQVIsRUFBUTs7QUFBQSxrQkFDdkIscUJBQVMsS0FBVCxDQUR1QjtBQUFBO0FBQUEsTUFDMUNDLE1BRDBDO0FBQUEsTUFDbENDLE9BRGtDOztBQUVqRCxzQkFDRSxnQ0FBQyxlQUFELHFCQUNFLGdDQUFDLGdCQUFELFFBQW1CRixPQUFuQixDQURGLGVBRUU7QUFBSyxJQUFBLEtBQUssRUFBRTtBQUFDRyxNQUFBQSxPQUFPLEVBQUU7QUFBVjtBQUFaLGtCQUNFLGdDQUFDLDZCQUFEO0FBQVksSUFBQSxJQUFJLEVBQUMsTUFBakI7QUFBd0IsSUFBQSxLQUFLLEVBQUVKLEdBQS9CO0FBQW9DLElBQUEsUUFBUSxNQUE1QztBQUE2QyxJQUFBLFFBQVE7QUFBckQsSUFERixlQUVFLGdDQUFDLHFDQUFEO0FBQWlCLElBQUEsSUFBSSxFQUFFQSxHQUF2QjtBQUE0QixJQUFBLE1BQU0sRUFBRTtBQUFBLGFBQU1HLE9BQU8sQ0FBQyxJQUFELENBQWI7QUFBQTtBQUFwQyxrQkFDRSxnQ0FBQyx5QkFBRDtBQUFRLElBQUEsS0FBSyxFQUFDO0FBQWQsS0FBc0JELE1BQU0sR0FBRyxTQUFILEdBQWUsTUFBM0MsQ0FERixDQUZGLENBRkYsQ0FERjtBQVdELENBYk07Ozs7QUFjUCxJQUFNRyxHQUFHLEdBQUcsU0FBTkEsR0FBTSxHQUFNLENBQUUsQ0FBcEI7O0FBRUEsSUFBTUMsbUJBQW1CLEdBQUcsa0NBQU9DLHFDQUFQLENBQUgsb0JBQXpCOztBQUtBLElBQU1DLGNBQWMsR0FBR2xCLDZCQUFPTSxHQUFWLG9CQUFwQjs7QUFJZSxTQUFTYSx1QkFBVCxHQUFtQztBQUNoRCxNQUFNQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLFFBV25CO0FBQUEsUUFWSkMsaUJBVUksU0FWSkEsaUJBVUk7QUFBQSxRQVRKQyxPQVNJLFNBVEpBLE9BU0k7QUFBQSxRQVJKQyxRQVFJLFNBUkpBLFFBUUk7QUFBQSxRQVBKQyxjQU9JLFNBUEpBLGNBT0k7QUFBQSxRQU5KQyxlQU1JLFNBTkpBLGVBTUk7QUFBQSxRQUxKQyxhQUtJLFNBTEpBLGFBS0k7QUFBQSxRQUpKQyxXQUlJLFNBSkpBLFdBSUk7QUFBQSxRQUhKQyxrQkFHSSxTQUhKQSxrQkFHSTtBQUFBLFFBRkpDLG9CQUVJLFNBRkpBLG9CQUVJO0FBQUEsUUFESkMsa0JBQ0ksU0FESkEsa0JBQ0k7QUFBQSxRQUNHQyxRQURILEdBQzJCSixXQUQzQixDQUNHSSxRQURIO0FBQUEsUUFDYUMsVUFEYixHQUMyQkwsV0FEM0IsQ0FDYUssVUFEYjtBQUVKLFFBQU1DLFFBQVEsR0FBR1IsZUFBZSxHQUFHRCxjQUFjLENBQUNVLElBQWYsQ0FBb0IsVUFBQUMsQ0FBQztBQUFBLGFBQUlBLENBQUMsQ0FBQ0MsSUFBRixLQUFXWCxlQUFmO0FBQUEsS0FBckIsQ0FBSCxHQUEwRCxJQUExRjtBQUVBLHdCQUNFLGdDQUFDLCtCQUFEO0FBQWUsTUFBQSxLQUFLLEVBQUVZO0FBQXRCLG9CQUNFLGdDQUFDLGtDQUFEO0FBQ0UsTUFBQSxrQkFBa0IsRUFBRVQsa0JBRHRCO0FBRUUsTUFBQSxjQUFjLEVBQUVKLGNBRmxCO0FBR0UsTUFBQSxlQUFlLEVBQUVDO0FBSG5CLG9CQUtFLGdDQUFDLCtCQUFEO0FBQ0UsTUFBQSxlQUFlLEVBQUVBLGVBRG5CO0FBRUUsTUFBQSxjQUFjLEVBQUVELGNBRmxCO0FBR0UsTUFBQSxvQkFBb0IsRUFBRUssb0JBSHhCO0FBSUUsTUFBQSxrQkFBa0IsRUFBRUM7QUFKdEIsb0JBTUUsZ0NBQUMsbUJBQUQ7QUFBcUIsTUFBQSxTQUFTLEVBQUM7QUFBL0Isb0JBQ0UsZ0NBQUMsY0FBRCxxQkFDRSxnQ0FBQyxzQ0FBRCxxQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLGdDQUFDLDhCQUFEO0FBQWtCLE1BQUEsRUFBRSxFQUFFO0FBQXRCLE1BREYsQ0FERixlQUlFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRSxnQ0FBQyw4QkFBRDtBQUFrQixNQUFBLEVBQUUsRUFBRTtBQUF0QixNQURGLENBSkYsQ0FERixlQVNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsTUFBQSxFQUFFLEVBQUU7QUFBdEIsTUFERixDQURGLENBVEYsQ0FERixlQWdCRSxnQ0FBQyxzQ0FBRDtBQUFxQixNQUFBLFFBQVEsRUFBRVQ7QUFBL0Isb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRSxnQ0FBQyw4QkFBRDtBQUFrQixNQUFBLEVBQUUsRUFBRTtBQUF0QixNQURGLENBREYsZUFJRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0UsZ0NBQUMsOEJBQUQ7QUFBa0IsTUFBQSxFQUFFLEVBQUU7QUFBdEIsTUFERixDQUpGLENBREYsZUFTRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDR0csY0FBYyxDQUFDYyxHQUFmLENBQW1CLFVBQUFDLGFBQWE7QUFBQSwwQkFDL0IsZ0NBQUMscUJBQUQ7QUFDRSxRQUFBLEdBQUcsRUFBRUEsYUFBYSxDQUFDSCxJQURyQjtBQUVFLFFBQUEsUUFBUSxFQUFFO0FBQUEsaUJBQU1iLFFBQVEsQ0FBQ2dCLGFBQUQsQ0FBZDtBQUFBLFNBRlo7QUFHRSxRQUFBLGtCQUFrQixFQUFFWCxrQkFIdEI7QUFJRSxRQUFBLGFBQWEsRUFBRVcsYUFKakI7QUFLRSxRQUFBLFVBQVUsRUFBQyxRQUxiO0FBTUUsUUFBQSxVQUFVLEVBQUVBLGFBQWEsQ0FBQ0gsSUFBZCxLQUF1QlgsZUFOckM7QUFPRSxRQUFBLFdBQVcsRUFBRWUsT0FBTyxDQUFDRCxhQUFhLENBQUNFLGNBQWQsRUFBRCxDQVB0QjtBQVFFLFFBQUEsT0FBTyxFQUFFbkI7QUFSWCxRQUQrQjtBQUFBLEtBQWhDLENBREgsQ0FURixDQWhCRixFQXdDR0QsaUJBQWlCLElBQUlLLGFBQXJCLGdCQUNDLGdDQUFDLHVCQUFEO0FBQ0UsTUFBQSxTQUFTLEVBQUVMLGlCQURiO0FBRUUsTUFBQSxLQUFLLEVBQUVLLGFBRlQ7QUFHRSxNQUFBLFlBQVksRUFBRU8sUUFBUSxJQUFJQSxRQUFRLENBQUNTO0FBSHJDLE1BREQsR0FNRyxJQTlDTixFQStDR1gsUUFBUSxpQkFDUCxnQ0FBQyxzQ0FBRCxxQkFDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG1CQURGLENBREYsZUFJRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0UsZ0NBQUMsVUFBRDtBQUFZLE1BQUEsR0FBRyxFQUFFLENBQWpCO0FBQW9CLE1BQUEsR0FBRyxFQUFFQTtBQUF6QixNQURGLEVBRUdFLFFBQVEsSUFBSUQsVUFBWixpQkFDQztBQUNFLE1BQUEsR0FBRyxFQUFFLENBRFA7QUFFRSxNQUFBLElBQUksRUFBRUEsVUFGUjtBQUdFLE1BQUEsTUFBTSxFQUFDLFFBSFQ7QUFJRSxNQUFBLEdBQUcsRUFBQyxxQkFKTjtBQUtFLE1BQUEsS0FBSyxFQUFFO0FBQUNXLFFBQUFBLGNBQWMsRUFBRTtBQUFqQjtBQUxULG9CQU9FLGdDQUFDLDhCQUFEO0FBQ0UsTUFBQSxFQUFFLEVBQUUseUJBRE47QUFFRSxNQUFBLE1BQU0sRUFBRTtBQUFDbEIsUUFBQUEsZUFBZSxFQUFmQTtBQUFEO0FBRlYsTUFQRixDQUhKLENBSkYsQ0FoREosQ0FERixDQU5GLENBTEYsQ0FERixDQURGO0FBMkZELEdBMUdEOztBQTRHQUwsRUFBQUEsZ0JBQWdCLENBQUN3QixZQUFqQixHQUFnQztBQUM5QnZCLElBQUFBLGlCQUFpQixFQUFFLEtBRFc7QUFFOUJFLElBQUFBLFFBQVEsRUFBRVIsR0FGb0I7QUFHOUJTLElBQUFBLGNBQWMsRUFBRSxFQUhjO0FBSTlCQyxJQUFBQSxlQUFlLEVBQUUsSUFKYTtBQUs5QkMsSUFBQUEsYUFBYSxFQUFFLElBTGU7QUFNOUJDLElBQUFBLFdBQVcsRUFBRSxFQU5pQjtBQU85QkMsSUFBQUEsa0JBQWtCLEVBQUViLEdBUFU7QUFROUJjLElBQUFBLG9CQUFvQixFQUFFZDtBQVJRLEdBQWhDO0FBV0EsU0FBT0ssZ0JBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge3VzZVN0YXRlfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkLCB7VGhlbWVQcm92aWRlcn0gZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtDb3B5VG9DbGlwYm9hcmR9IGZyb20gJ3JlYWN0LWNvcHktdG8tY2xpcGJvYXJkJztcbmltcG9ydCB7dGhlbWVMVH0gZnJvbSAnc3R5bGVzL2Jhc2UnO1xuaW1wb3J0IEltYWdlTW9kYWxDb250YWluZXIgZnJvbSAnLi9pbWFnZS1tb2RhbC1jb250YWluZXInO1xuaW1wb3J0IFByb3ZpZGVyTW9kYWxDb250YWluZXIgZnJvbSAnLi9wcm92aWRlci1tb2RhbC1jb250YWluZXInO1xuXG5pbXBvcnQge1xuICBTdHlsZWRNb2RhbENvbnRlbnQsXG4gIFN0eWxlZEV4cG9ydFNlY3Rpb24sXG4gIElucHV0TGlnaHQsXG4gIEJ1dHRvblxufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgQ2xvdWRUaWxlIGZyb20gJy4vY2xvdWQtdGlsZSc7XG5pbXBvcnQgU3RhdHVzUGFuZWwgZnJvbSAnLi9zdGF0dXMtcGFuZWwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5leHBvcnQgY29uc3QgU3R5bGVkSW5wdXRMYWJlbCA9IHN0eWxlZC5sYWJlbGBcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gIGxldHRlci1zcGFjaW5nOiAwLjJweDtcbmA7XG5cbmV4cG9ydCBjb25zdCBTdHlsZVNoYXJpbmdVcmwgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnc2hhcmluZy11cmwnXG59KWBcbiAgd2lkdGg6IDEwMCU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1hcmdpbi1ib3R0b206IDE0cHg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgaW5wdXQge1xuICAgIGJvcmRlci1yaWdodDogMDtcbiAgfVxuXG4gIC5idXR0b24ge1xuICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDA7XG4gICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFNoYXJpbmdVcmwgPSAoe3VybCwgbWVzc2FnZSA9ICcnfSkgPT4ge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3B5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgcmV0dXJuIChcbiAgICA8U3R5bGVTaGFyaW5nVXJsPlxuICAgICAgPFN0eWxlZElucHV0TGFiZWw+e21lc3NhZ2V9PC9TdHlsZWRJbnB1dExhYmVsPlxuICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXk6ICdmbGV4J319PlxuICAgICAgICA8SW5wdXRMaWdodCB0eXBlPVwidGV4dFwiIHZhbHVlPXt1cmx9IHJlYWRPbmx5IHNlbGVjdGVkIC8+XG4gICAgICAgIDxDb3B5VG9DbGlwYm9hcmQgdGV4dD17dXJsfSBvbkNvcHk9eygpID0+IHNldENvcHkodHJ1ZSl9PlxuICAgICAgICAgIDxCdXR0b24gd2lkdGg9XCI4MHB4XCI+e2NvcGllZCA/ICdDb3BpZWQhJyA6ICdDb3B5J308L0J1dHRvbj5cbiAgICAgICAgPC9Db3B5VG9DbGlwYm9hcmQ+XG4gICAgICA8L2Rpdj5cbiAgICA8L1N0eWxlU2hhcmluZ1VybD5cbiAgKTtcbn07XG5jb25zdCBub3AgPSAoKSA9PiB7fTtcblxuY29uc3QgU3R5bGVkU2hhcmVNYXBNb2RhbCA9IHN0eWxlZChTdHlsZWRNb2RhbENvbnRlbnQpYFxuICBwYWRkaW5nOiAyNHB4IDcycHggNDBweCA3MnB4O1xuICBtYXJnaW46IDAgLTcycHggLTQwcHggLTcycHg7XG5gO1xuXG5jb25zdCBTdHlsZWRJbm5lckRpdiA9IHN0eWxlZC5kaXZgXG4gIG1pbi1oZWlnaHQ6IDUwMHB4O1xuYDtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2hhcmVNYXBVcmxNb2RhbEZhY3RvcnkoKSB7XG4gIGNvbnN0IFNoYXJlTWFwVXJsTW9kYWwgPSAoe1xuICAgIGlzUHJvdmlkZXJMb2FkaW5nLFxuICAgIGlzUmVhZHksXG4gICAgb25FeHBvcnQsXG4gICAgY2xvdWRQcm92aWRlcnMsXG4gICAgY3VycmVudFByb3ZpZGVyLFxuICAgIHByb3ZpZGVyRXJyb3IsXG4gICAgc3VjY2Vzc0luZm8sXG4gICAgb25TZXRDbG91ZFByb3ZpZGVyLFxuICAgIG9uVXBkYXRlSW1hZ2VTZXR0aW5nLFxuICAgIGNsZWFudXBFeHBvcnRJbWFnZVxuICB9KSA9PiB7XG4gICAgY29uc3Qge3NoYXJlVXJsLCBmb2xkZXJMaW5rfSA9IHN1Y2Nlc3NJbmZvO1xuICAgIGNvbnN0IHByb3ZpZGVyID0gY3VycmVudFByb3ZpZGVyID8gY2xvdWRQcm92aWRlcnMuZmluZChwID0+IHAubmFtZSA9PT0gY3VycmVudFByb3ZpZGVyKSA6IG51bGw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFRoZW1lUHJvdmlkZXIgdGhlbWU9e3RoZW1lTFR9PlxuICAgICAgICA8UHJvdmlkZXJNb2RhbENvbnRhaW5lclxuICAgICAgICAgIG9uU2V0Q2xvdWRQcm92aWRlcj17b25TZXRDbG91ZFByb3ZpZGVyfVxuICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXtjbG91ZFByb3ZpZGVyc31cbiAgICAgICAgICBjdXJyZW50UHJvdmlkZXI9e2N1cnJlbnRQcm92aWRlcn1cbiAgICAgICAgPlxuICAgICAgICAgIDxJbWFnZU1vZGFsQ29udGFpbmVyXG4gICAgICAgICAgICBjdXJyZW50UHJvdmlkZXI9e2N1cnJlbnRQcm92aWRlcn1cbiAgICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXtjbG91ZFByb3ZpZGVyc31cbiAgICAgICAgICAgIG9uVXBkYXRlSW1hZ2VTZXR0aW5nPXtvblVwZGF0ZUltYWdlU2V0dGluZ31cbiAgICAgICAgICAgIGNsZWFudXBFeHBvcnRJbWFnZT17Y2xlYW51cEV4cG9ydEltYWdlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxTdHlsZWRTaGFyZU1hcE1vZGFsIGNsYXNzTmFtZT1cImV4cG9ydC1jbG91ZC1tb2RhbFwiPlxuICAgICAgICAgICAgICA8U3R5bGVkSW5uZXJEaXY+XG4gICAgICAgICAgICAgICAgPFN0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLnNoYXJlTWFwLnNoYXJlVXJpVGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdWJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc2hhcmVNYXAuc2hhcmVVcmlTdWJ0aXRsZSd9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpdGxlIHdhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLnNoYXJlTWFwLnNoYXJlRGlzY2xhaW1lcid9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgICAgICAgIDxTdHlsZWRFeHBvcnRTZWN0aW9uIGRpc2FibGVkPXtpc1Byb3ZpZGVyTG9hZGluZ30+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLnNoYXJlTWFwLmNsb3VkVGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdWJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc2hhcmVNYXAuY2xvdWRTdWJ0aXRsZSd9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICB7Y2xvdWRQcm92aWRlcnMubWFwKGNsb3VkUHJvdmlkZXIgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxDbG91ZFRpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y2xvdWRQcm92aWRlci5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q9eygpID0+IG9uRXhwb3J0KGNsb3VkUHJvdmlkZXIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZXRDbG91ZFByb3ZpZGVyPXtvblNldENsb3VkUHJvdmlkZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG91ZFByb3ZpZGVyPXtjbG91ZFByb3ZpZGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uTmFtZT1cIlVwbG9hZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkPXtjbG91ZFByb3ZpZGVyLm5hbWUgPT09IGN1cnJlbnRQcm92aWRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkPXtCb29sZWFuKGNsb3VkUHJvdmlkZXIuZ2V0QWNjZXNzVG9rZW4oKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1JlYWR5PXtpc1JlYWR5fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgICAgICAgIHtpc1Byb3ZpZGVyTG9hZGluZyB8fCBwcm92aWRlckVycm9yID8gKFxuICAgICAgICAgICAgICAgICAgPFN0YXR1c1BhbmVsXG4gICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZz17aXNQcm92aWRlckxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yPXtwcm92aWRlckVycm9yfVxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlckljb249e3Byb3ZpZGVyICYmIHByb3ZpZGVyLmljb259XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIHtzaGFyZVVybCAmJiAoXG4gICAgICAgICAgICAgICAgICA8U3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5TaGFyZSBVcmw8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPFNoYXJpbmdVcmwga2V5PXswfSB1cmw9e3NoYXJlVXJsfSAvPlxuICAgICAgICAgICAgICAgICAgICAgIHtwcm92aWRlciAmJiBmb2xkZXJMaW5rICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17MX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17Zm9sZGVyTGlua31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7dGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD17J21vZGFsLnNoYXJlTWFwLmdvdG9QYWdlJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM9e3tjdXJyZW50UHJvdmlkZXJ9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvU3R5bGVkSW5uZXJEaXY+XG4gICAgICAgICAgICA8L1N0eWxlZFNoYXJlTWFwTW9kYWw+XG4gICAgICAgICAgPC9JbWFnZU1vZGFsQ29udGFpbmVyPlxuICAgICAgICA8L1Byb3ZpZGVyTW9kYWxDb250YWluZXI+XG4gICAgICA8L1RoZW1lUHJvdmlkZXI+XG4gICAgKTtcbiAgfTtcblxuICBTaGFyZU1hcFVybE1vZGFsLmRlZmF1bHRQcm9wcyA9IHtcbiAgICBpc1Byb3ZpZGVyTG9hZGluZzogZmFsc2UsXG4gICAgb25FeHBvcnQ6IG5vcCxcbiAgICBjbG91ZFByb3ZpZGVyczogW10sXG4gICAgY3VycmVudFByb3ZpZGVyOiBudWxsLFxuICAgIHByb3ZpZGVyRXJyb3I6IG51bGwsXG4gICAgc3VjY2Vzc0luZm86IHt9LFxuICAgIG9uU2V0Q2xvdWRQcm92aWRlcjogbm9wLFxuICAgIG9uVXBkYXRlSW1hZ2VTZXR0aW5nOiBub3BcbiAgfTtcblxuICByZXR1cm4gU2hhcmVNYXBVcmxNb2RhbDtcbn1cbiJdfQ==