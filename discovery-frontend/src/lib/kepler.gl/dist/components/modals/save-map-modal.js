"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.MapInfoPanel = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _cloudTile = _interopRequireDefault(require("./cloud-tile"));

var _imageModalContainer = _interopRequireDefault(require("./image-modal-container"));

var _providerModalContainer = _interopRequireDefault(require("./provider-modal-container"));

var _statusPanel = _interopRequireWildcard(require("./status-panel"));

var _defaultSettings = require("../../constants/default-settings");

var _styledComponents2 = require("../common/styled-components");

var _imagePreview = _interopRequireDefault(require("../common/image-preview"));

var _localization = require("../../localization");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .save-map-modal-content {\n    min-height: 400px;\n    flex-direction: column;\n  }\n\n  .description {\n    width: 300px;\n  }\n\n  .image-preview-panel {\n    width: 300px;\n\n    .image-preview {\n      padding: 0;\n    }\n  }\n\n  .map-info-panel {\n    flex-direction: column;\n  }\n\n  .save-map-modal-description {\n    .modal-section-subtitle {\n      margin-left: 6px;\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/** @typedef {import('./save-map-modal').SaveMapModalProps} SaveMapModalProps */
var StyledSaveMapModal = _styledComponents["default"].div.attrs({
  className: 'save-map-modal'
})(_templateObject());

var nop = function nop() {};

var MapInfoPanel = function MapInfoPanel(_ref) {
  var _ref$mapInfo = _ref.mapInfo,
      mapInfo = _ref$mapInfo === void 0 ? {
    description: '',
    title: ''
  } : _ref$mapInfo,
      characterLimits = _ref.characterLimits,
      onChangeInput = _ref.onChangeInput;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "selection map-info-panel"
  }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledModalSection, {
    className: "save-map-modal-name"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "modal-section-title"
  }, "Name*"), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.InputLight, {
    id: "map-title",
    type: "text",
    value: mapInfo.title,
    onChange: function onChange(e) {
      return onChangeInput('title', e);
    },
    placeholder: "Type map title"
  }))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledModalSection, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "save-map-modal-description",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "modal-section-title"
  }, "Description"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "modal-section-subtitle"
  }, "(optional)")), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.TextAreaLight, {
    rows: "3",
    id: "map-description",
    style: {
      resize: 'none'
    },
    value: mapInfo.description,
    onChange: function onChange(e) {
      return onChangeInput('description', e);
    },
    placeholder: "Type map description"
  })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledModalInputFootnote, {
    className: "save-map-modal-description__footnote",
    error: characterLimits.description && mapInfo.description.length > characterLimits.description
  }, mapInfo.description.length, "/", characterLimits.description || _defaultSettings.MAP_INFO_CHARACTER.description, ' ', "characters")));
};

exports.MapInfoPanel = MapInfoPanel;

function SaveMapModalFactory() {
  /**
   * @type {React.FunctionComponent<SaveMapModalProps>}
   */
  var SaveMapModal = function SaveMapModal(_ref2) {
    var mapInfo = _ref2.mapInfo,
        exportImage = _ref2.exportImage,
        _ref2$characterLimits = _ref2.characterLimits,
        characterLimits = _ref2$characterLimits === void 0 ? {} : _ref2$characterLimits,
        cloudProviders = _ref2.cloudProviders,
        isProviderLoading = _ref2.isProviderLoading,
        currentProvider = _ref2.currentProvider,
        providerError = _ref2.providerError,
        onSetCloudProvider = _ref2.onSetCloudProvider,
        onUpdateImageSetting = _ref2.onUpdateImageSetting,
        cleanupExportImage = _ref2.cleanupExportImage,
        onSetMapInfo = _ref2.onSetMapInfo;

    var onChangeInput = function onChangeInput(key, _ref3) {
      var value = _ref3.target.value;
      onSetMapInfo((0, _defineProperty2["default"])({}, key, value));
    };

    var provider = currentProvider ? cloudProviders.find(function (p) {
      return p.name === currentProvider;
    }) : null;
    return /*#__PURE__*/_react["default"].createElement(_providerModalContainer["default"], {
      onSetCloudProvider: onSetCloudProvider,
      cloudProviders: cloudProviders,
      currentProvider: currentProvider
    }, /*#__PURE__*/_react["default"].createElement(_imageModalContainer["default"], {
      currentProvider: currentProvider,
      cloudProviders: cloudProviders,
      onUpdateImageSetting: onUpdateImageSetting,
      cleanupExportImage: cleanupExportImage
    }, /*#__PURE__*/_react["default"].createElement(StyledSaveMapModal, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledModalContent, {
      className: "save-map-modal-content"
    }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, {
      disabled: isProviderLoading
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "title"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.saveMap.title'
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "subtitle"
    }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: 'modal.saveMap.subtitle'
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, cloudProviders.map(function (cloudProvider) {
      return /*#__PURE__*/_react["default"].createElement(_cloudTile["default"], {
        key: cloudProvider.name,
        onSelect: function onSelect() {
          return onSetCloudProvider(cloudProvider.name);
        },
        onSetCloudProvider: onSetCloudProvider,
        cloudProvider: cloudProvider,
        isSelected: cloudProvider.name === currentProvider,
        isConnected: Boolean(cloudProvider.getAccessToken && cloudProvider.getAccessToken())
      });
    }))), provider && provider.getManagementUrl && /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, {
      style: {
        margin: '2px 0'
      }
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description"
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection"
    }, /*#__PURE__*/_react["default"].createElement("a", {
      key: 1,
      href: provider.getManagementUrl(),
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        textDecoration: 'underline'
      }
    }, "Go to your Kepler.gl ", provider.displayName, " page"))), /*#__PURE__*/_react["default"].createElement(_styledComponents2.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: "description image-preview-panel"
    }, /*#__PURE__*/_react["default"].createElement(_imagePreview["default"], {
      exportImage: exportImage,
      width: _defaultSettings.MAP_THUMBNAIL_DIMENSION.width,
      showDimension: false
    })), isProviderLoading ? /*#__PURE__*/_react["default"].createElement("div", {
      className: "selection map-saving-animation"
    }, /*#__PURE__*/_react["default"].createElement(_statusPanel.UploadAnimation, {
      icon: provider && provider.icon
    })) : /*#__PURE__*/_react["default"].createElement(MapInfoPanel, {
      mapInfo: mapInfo,
      characterLimits: characterLimits,
      onChangeInput: onChangeInput
    })), providerError ? /*#__PURE__*/_react["default"].createElement(_statusPanel["default"], {
      isLoading: false,
      error: providerError,
      providerIcon: provider && provider.icon
    }) : null))));
  };

  SaveMapModal.defaultProps = {
    characterLimits: _defaultSettings.MAP_INFO_CHARACTER,
    cloudProviders: [],
    currentProvider: null,
    providerError: null,
    isProviderLoading: false,
    onSetCloudProvider: nop,
    onUpdateImageSetting: nop
  };
  return SaveMapModal;
}

var _default = SaveMapModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9zYXZlLW1hcC1tb2RhbC5qcyJdLCJuYW1lcyI6WyJTdHlsZWRTYXZlTWFwTW9kYWwiLCJzdHlsZWQiLCJkaXYiLCJhdHRycyIsImNsYXNzTmFtZSIsIm5vcCIsIk1hcEluZm9QYW5lbCIsIm1hcEluZm8iLCJkZXNjcmlwdGlvbiIsInRpdGxlIiwiY2hhcmFjdGVyTGltaXRzIiwib25DaGFuZ2VJbnB1dCIsImUiLCJkaXNwbGF5IiwicmVzaXplIiwibGVuZ3RoIiwiTUFQX0lORk9fQ0hBUkFDVEVSIiwiU2F2ZU1hcE1vZGFsRmFjdG9yeSIsIlNhdmVNYXBNb2RhbCIsImV4cG9ydEltYWdlIiwiY2xvdWRQcm92aWRlcnMiLCJpc1Byb3ZpZGVyTG9hZGluZyIsImN1cnJlbnRQcm92aWRlciIsInByb3ZpZGVyRXJyb3IiLCJvblNldENsb3VkUHJvdmlkZXIiLCJvblVwZGF0ZUltYWdlU2V0dGluZyIsImNsZWFudXBFeHBvcnRJbWFnZSIsIm9uU2V0TWFwSW5mbyIsImtleSIsInZhbHVlIiwidGFyZ2V0IiwicHJvdmlkZXIiLCJmaW5kIiwicCIsIm5hbWUiLCJtYXAiLCJjbG91ZFByb3ZpZGVyIiwiQm9vbGVhbiIsImdldEFjY2Vzc1Rva2VuIiwiZ2V0TWFuYWdlbWVudFVybCIsIm1hcmdpbiIsInRleHREZWNvcmF0aW9uIiwiZGlzcGxheU5hbWUiLCJNQVBfVEhVTUJOQUlMX0RJTUVOU0lPTiIsIndpZHRoIiwiaWNvbiIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQVFBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQTtBQUVBLElBQU1BLGtCQUFrQixHQUFHQyw2QkFBT0MsR0FBUCxDQUFXQyxLQUFYLENBQWlCO0FBQzFDQyxFQUFBQSxTQUFTLEVBQUU7QUFEK0IsQ0FBakIsQ0FBSCxtQkFB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LG9CQUNFLGdDQUFDLDRCQUFEO0FBQWlCLE1BQUEsSUFBSSxFQUFFVSxRQUFRLElBQUlBLFFBQVEsQ0FBQ2M7QUFBNUMsTUFERixDQURnQixnQkFLaEIsZ0NBQUMsWUFBRDtBQUNFLE1BQUEsT0FBTyxFQUFFdEMsT0FEWDtBQUVFLE1BQUEsZUFBZSxFQUFFRyxlQUZuQjtBQUdFLE1BQUEsYUFBYSxFQUFFQztBQUhqQixNQWJKLENBekNGLEVBNkRHWSxhQUFhLGdCQUNaLGdDQUFDLHVCQUFEO0FBQ0UsTUFBQSxTQUFTLEVBQUUsS0FEYjtBQUVFLE1BQUEsS0FBSyxFQUFFQSxhQUZUO0FBR0UsTUFBQSxZQUFZLEVBQUVRLFFBQVEsSUFBSUEsUUFBUSxDQUFDYztBQUhyQyxNQURZLEdBTVYsSUFuRU4sQ0FERixDQU5GLENBTEYsQ0FERjtBQXNGRCxHQXhHRDs7QUEwR0EzQixFQUFBQSxZQUFZLENBQUM0QixZQUFiLEdBQTRCO0FBQzFCcEMsSUFBQUEsZUFBZSxFQUFFTSxtQ0FEUztBQUUxQkksSUFBQUEsY0FBYyxFQUFFLEVBRlU7QUFHMUJFLElBQUFBLGVBQWUsRUFBRSxJQUhTO0FBSTFCQyxJQUFBQSxhQUFhLEVBQUUsSUFKVztBQUsxQkYsSUFBQUEsaUJBQWlCLEVBQUUsS0FMTztBQU0xQkcsSUFBQUEsa0JBQWtCLEVBQUVuQixHQU5NO0FBTzFCb0IsSUFBQUEsb0JBQW9CLEVBQUVwQjtBQVBJLEdBQTVCO0FBVUEsU0FBT2EsWUFBUDtBQUNEOztlQUVjRCxtQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBDbG91ZFRpbGUgZnJvbSAnLi9jbG91ZC10aWxlJztcbmltcG9ydCBJbWFnZU1vZGFsQ29udGFpbmVyIGZyb20gJy4vaW1hZ2UtbW9kYWwtY29udGFpbmVyJztcbmltcG9ydCBQcm92aWRlck1vZGFsQ29udGFpbmVyIGZyb20gJy4vcHJvdmlkZXItbW9kYWwtY29udGFpbmVyJztcbmltcG9ydCBTdGF0dXNQYW5lbCwge1VwbG9hZEFuaW1hdGlvbn0gZnJvbSAnLi9zdGF0dXMtcGFuZWwnO1xuXG5pbXBvcnQge01BUF9USFVNQk5BSUxfRElNRU5TSU9OLCBNQVBfSU5GT19DSEFSQUNURVJ9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuaW1wb3J0IHtcbiAgU3R5bGVkTW9kYWxDb250ZW50LFxuICBJbnB1dExpZ2h0LFxuICBUZXh0QXJlYUxpZ2h0LFxuICBTdHlsZWRFeHBvcnRTZWN0aW9uLFxuICBTdHlsZWRNb2RhbFNlY3Rpb24sXG4gIFN0eWxlZE1vZGFsSW5wdXRGb290bm90ZVxufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgSW1hZ2VQcmV2aWV3IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ltYWdlLXByZXZpZXcnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9zYXZlLW1hcC1tb2RhbCcpLlNhdmVNYXBNb2RhbFByb3BzfSBTYXZlTWFwTW9kYWxQcm9wcyAqL1xuXG5jb25zdCBTdHlsZWRTYXZlTWFwTW9kYWwgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnc2F2ZS1tYXAtbW9kYWwnXG59KWBcbiAgLnNhdmUtbWFwLW1vZGFsLWNvbnRlbnQge1xuICAgIG1pbi1oZWlnaHQ6IDQwMHB4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIH1cblxuICAuZGVzY3JpcHRpb24ge1xuICAgIHdpZHRoOiAzMDBweDtcbiAgfVxuXG4gIC5pbWFnZS1wcmV2aWV3LXBhbmVsIHtcbiAgICB3aWR0aDogMzAwcHg7XG5cbiAgICAuaW1hZ2UtcHJldmlldyB7XG4gICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgfVxuXG4gIC5tYXAtaW5mby1wYW5lbCB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgfVxuXG4gIC5zYXZlLW1hcC1tb2RhbC1kZXNjcmlwdGlvbiB7XG4gICAgLm1vZGFsLXNlY3Rpb24tc3VidGl0bGUge1xuICAgICAgbWFyZ2luLWxlZnQ6IDZweDtcbiAgICB9XG4gIH1cbmA7XG5cbmNvbnN0IG5vcCA9ICgpID0+IHt9O1xuXG5leHBvcnQgY29uc3QgTWFwSW5mb1BhbmVsID0gKHtcbiAgbWFwSW5mbyA9IHtkZXNjcmlwdGlvbjogJycsIHRpdGxlOiAnJ30sXG4gIGNoYXJhY3RlckxpbWl0cyxcbiAgb25DaGFuZ2VJbnB1dFxufSkgPT4gKFxuICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvbiBtYXAtaW5mby1wYW5lbFwiPlxuICAgIDxTdHlsZWRNb2RhbFNlY3Rpb24gY2xhc3NOYW1lPVwic2F2ZS1tYXAtbW9kYWwtbmFtZVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1zZWN0aW9uLXRpdGxlXCI+TmFtZSo8L2Rpdj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxJbnB1dExpZ2h0XG4gICAgICAgICAgaWQ9XCJtYXAtdGl0bGVcIlxuICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICB2YWx1ZT17bWFwSW5mby50aXRsZX1cbiAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBvbkNoYW5nZUlucHV0KCd0aXRsZScsIGUpfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVHlwZSBtYXAgdGl0bGVcIlxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9TdHlsZWRNb2RhbFNlY3Rpb24+XG4gICAgPFN0eWxlZE1vZGFsU2VjdGlvbj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2F2ZS1tYXAtbW9kYWwtZGVzY3JpcHRpb25cIiBzdHlsZT17e2Rpc3BsYXk6ICdmbGV4J319PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1vZGFsLXNlY3Rpb24tdGl0bGVcIj5EZXNjcmlwdGlvbjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1vZGFsLXNlY3Rpb24tc3VidGl0bGVcIj4ob3B0aW9uYWwpPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxUZXh0QXJlYUxpZ2h0XG4gICAgICAgICAgcm93cz1cIjNcIlxuICAgICAgICAgIGlkPVwibWFwLWRlc2NyaXB0aW9uXCJcbiAgICAgICAgICBzdHlsZT17e3Jlc2l6ZTogJ25vbmUnfX1cbiAgICAgICAgICB2YWx1ZT17bWFwSW5mby5kZXNjcmlwdGlvbn1cbiAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBvbkNoYW5nZUlucHV0KCdkZXNjcmlwdGlvbicsIGUpfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVHlwZSBtYXAgZGVzY3JpcHRpb25cIlxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8U3R5bGVkTW9kYWxJbnB1dEZvb3Rub3RlXG4gICAgICAgIGNsYXNzTmFtZT1cInNhdmUtbWFwLW1vZGFsLWRlc2NyaXB0aW9uX19mb290bm90ZVwiXG4gICAgICAgIGVycm9yPXtcbiAgICAgICAgICBjaGFyYWN0ZXJMaW1pdHMuZGVzY3JpcHRpb24gJiYgbWFwSW5mby5kZXNjcmlwdGlvbi5sZW5ndGggPiBjaGFyYWN0ZXJMaW1pdHMuZGVzY3JpcHRpb25cbiAgICAgICAgfVxuICAgICAgPlxuICAgICAgICB7bWFwSW5mby5kZXNjcmlwdGlvbi5sZW5ndGh9L3tjaGFyYWN0ZXJMaW1pdHMuZGVzY3JpcHRpb24gfHwgTUFQX0lORk9fQ0hBUkFDVEVSLmRlc2NyaXB0aW9ufXsnICd9XG4gICAgICAgIGNoYXJhY3RlcnNcbiAgICAgIDwvU3R5bGVkTW9kYWxJbnB1dEZvb3Rub3RlPlxuICAgIDwvU3R5bGVkTW9kYWxTZWN0aW9uPlxuICA8L2Rpdj5cbik7XG5cbmZ1bmN0aW9uIFNhdmVNYXBNb2RhbEZhY3RvcnkoKSB7XG4gIC8qKlxuICAgKiBAdHlwZSB7UmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8U2F2ZU1hcE1vZGFsUHJvcHM+fVxuICAgKi9cbiAgY29uc3QgU2F2ZU1hcE1vZGFsID0gKHtcbiAgICBtYXBJbmZvLFxuICAgIGV4cG9ydEltYWdlLFxuICAgIGNoYXJhY3RlckxpbWl0cyA9IHt9LFxuICAgIGNsb3VkUHJvdmlkZXJzLFxuICAgIGlzUHJvdmlkZXJMb2FkaW5nLFxuICAgIGN1cnJlbnRQcm92aWRlcixcbiAgICBwcm92aWRlckVycm9yLFxuICAgIG9uU2V0Q2xvdWRQcm92aWRlcixcbiAgICBvblVwZGF0ZUltYWdlU2V0dGluZyxcbiAgICBjbGVhbnVwRXhwb3J0SW1hZ2UsXG4gICAgb25TZXRNYXBJbmZvXG4gIH0pID0+IHtcbiAgICBjb25zdCBvbkNoYW5nZUlucHV0ID0gKGtleSwge3RhcmdldDoge3ZhbHVlfX0pID0+IHtcbiAgICAgIG9uU2V0TWFwSW5mbyh7W2tleV06IHZhbHVlfSk7XG4gICAgfTtcbiAgICBjb25zdCBwcm92aWRlciA9IGN1cnJlbnRQcm92aWRlciA/IGNsb3VkUHJvdmlkZXJzLmZpbmQocCA9PiBwLm5hbWUgPT09IGN1cnJlbnRQcm92aWRlcikgOiBudWxsO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQcm92aWRlck1vZGFsQ29udGFpbmVyXG4gICAgICAgIG9uU2V0Q2xvdWRQcm92aWRlcj17b25TZXRDbG91ZFByb3ZpZGVyfVxuICAgICAgICBjbG91ZFByb3ZpZGVycz17Y2xvdWRQcm92aWRlcnN9XG4gICAgICAgIGN1cnJlbnRQcm92aWRlcj17Y3VycmVudFByb3ZpZGVyfVxuICAgICAgPlxuICAgICAgICA8SW1hZ2VNb2RhbENvbnRhaW5lclxuICAgICAgICAgIGN1cnJlbnRQcm92aWRlcj17Y3VycmVudFByb3ZpZGVyfVxuICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXtjbG91ZFByb3ZpZGVyc31cbiAgICAgICAgICBvblVwZGF0ZUltYWdlU2V0dGluZz17b25VcGRhdGVJbWFnZVNldHRpbmd9XG4gICAgICAgICAgY2xlYW51cEV4cG9ydEltYWdlPXtjbGVhbnVwRXhwb3J0SW1hZ2V9XG4gICAgICAgID5cbiAgICAgICAgICA8U3R5bGVkU2F2ZU1hcE1vZGFsPlxuICAgICAgICAgICAgPFN0eWxlZE1vZGFsQ29udGVudCBjbGFzc05hbWU9XCJzYXZlLW1hcC1tb2RhbC1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxTdHlsZWRFeHBvcnRTZWN0aW9uIGRpc2FibGVkPXtpc1Byb3ZpZGVyTG9hZGluZ30+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLnNhdmVNYXAudGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuc2F2ZU1hcC5zdWJ0aXRsZSd9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvblwiPlxuICAgICAgICAgICAgICAgICAge2Nsb3VkUHJvdmlkZXJzLm1hcChjbG91ZFByb3ZpZGVyID0+IChcbiAgICAgICAgICAgICAgICAgICAgPENsb3VkVGlsZVxuICAgICAgICAgICAgICAgICAgICAgIGtleT17Y2xvdWRQcm92aWRlci5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0PXsoKSA9PiBvblNldENsb3VkUHJvdmlkZXIoY2xvdWRQcm92aWRlci5uYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgICBvblNldENsb3VkUHJvdmlkZXI9e29uU2V0Q2xvdWRQcm92aWRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBjbG91ZFByb3ZpZGVyPXtjbG91ZFByb3ZpZGVyfVxuICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e2Nsb3VkUHJvdmlkZXIubmFtZSA9PT0gY3VycmVudFByb3ZpZGVyfVxuICAgICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkPXtCb29sZWFuKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvdWRQcm92aWRlci5nZXRBY2Nlc3NUb2tlbiAmJiBjbG91ZFByb3ZpZGVyLmdldEFjY2Vzc1Rva2VuKClcbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvU3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICAgICAgICAgICAge3Byb3ZpZGVyICYmIHByb3ZpZGVyLmdldE1hbmFnZW1lbnRVcmwgJiYgKFxuICAgICAgICAgICAgICAgIDxTdHlsZWRFeHBvcnRTZWN0aW9uIHN0eWxlPXt7bWFyZ2luOiAnMnB4IDAnfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAga2V5PXsxfVxuICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e3Byb3ZpZGVyLmdldE1hbmFnZW1lbnRVcmwoKX1cbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7dGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIEdvIHRvIHlvdXIgS2VwbGVyLmdsIHtwcm92aWRlci5kaXNwbGF5TmFtZX0gcGFnZVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L1N0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxTdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGVzY3JpcHRpb24gaW1hZ2UtcHJldmlldy1wYW5lbFwiPlxuICAgICAgICAgICAgICAgICAgPEltYWdlUHJldmlld1xuICAgICAgICAgICAgICAgICAgICBleHBvcnRJbWFnZT17ZXhwb3J0SW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPXtNQVBfVEhVTUJOQUlMX0RJTUVOU0lPTi53aWR0aH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd0RpbWVuc2lvbj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtpc1Byb3ZpZGVyTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uIG1hcC1zYXZpbmctYW5pbWF0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxVcGxvYWRBbmltYXRpb24gaWNvbj17cHJvdmlkZXIgJiYgcHJvdmlkZXIuaWNvbn0gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8TWFwSW5mb1BhbmVsXG4gICAgICAgICAgICAgICAgICAgIG1hcEluZm89e21hcEluZm99XG4gICAgICAgICAgICAgICAgICAgIGNoYXJhY3RlckxpbWl0cz17Y2hhcmFjdGVyTGltaXRzfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZUlucHV0PXtvbkNoYW5nZUlucHV0fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L1N0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgICAgICAgICAgIHtwcm92aWRlckVycm9yID8gKFxuICAgICAgICAgICAgICAgIDxTdGF0dXNQYW5lbFxuICAgICAgICAgICAgICAgICAgaXNMb2FkaW5nPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgIGVycm9yPXtwcm92aWRlckVycm9yfVxuICAgICAgICAgICAgICAgICAgcHJvdmlkZXJJY29uPXtwcm92aWRlciAmJiBwcm92aWRlci5pY29ufVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9TdHlsZWRNb2RhbENvbnRlbnQ+XG4gICAgICAgICAgPC9TdHlsZWRTYXZlTWFwTW9kYWw+XG4gICAgICAgIDwvSW1hZ2VNb2RhbENvbnRhaW5lcj5cbiAgICAgIDwvUHJvdmlkZXJNb2RhbENvbnRhaW5lcj5cbiAgICApO1xuICB9O1xuXG4gIFNhdmVNYXBNb2RhbC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgY2hhcmFjdGVyTGltaXRzOiBNQVBfSU5GT19DSEFSQUNURVIsXG4gICAgY2xvdWRQcm92aWRlcnM6IFtdLFxuICAgIGN1cnJlbnRQcm92aWRlcjogbnVsbCxcbiAgICBwcm92aWRlckVycm9yOiBudWxsLFxuICAgIGlzUHJvdmlkZXJMb2FkaW5nOiBmYWxzZSxcbiAgICBvblNldENsb3VkUHJvdmlkZXI6IG5vcCxcbiAgICBvblVwZGF0ZUltYWdlU2V0dGluZzogbm9wXG4gIH07XG5cbiAgcmV0dXJuIFNhdmVNYXBNb2RhbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2F2ZU1hcE1vZGFsRmFjdG9yeTtcbiJdfQ==