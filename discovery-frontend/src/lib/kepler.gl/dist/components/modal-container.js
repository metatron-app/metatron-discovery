"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ModalContainerFactory;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = require("styled-components");

var _reactDom = require("react-dom");

var _reselect = require("reselect");

var _lodash = _interopRequireDefault(require("lodash.get"));

var _document = _interopRequireDefault(require("global/document"));

var _modalDialog = _interopRequireDefault(require("./modals/modal-dialog"));

var _exportUtils = require("../utils/export-utils");

var _mapInfoUtils = require("../utils/map-info-utils");

var _deleteDataModal = _interopRequireDefault(require("./modals/delete-data-modal"));

var _overwriteMapModal = _interopRequireDefault(require("./modals/overwrite-map-modal"));

var _dataTableModal = _interopRequireDefault(require("./modals/data-table-modal"));

var _loadDataModal = _interopRequireDefault(require("./modals/load-data-modal"));

var _exportImageModal = _interopRequireDefault(require("./modals/export-image-modal"));

var _exportDataModal = _interopRequireDefault(require("./modals/export-data-modal"));

var _exportMapModal = _interopRequireDefault(require("./modals/export-map-modal/export-map-modal"));

var _addMapStyleModal = _interopRequireDefault(require("./modals/add-map-style-modal"));

var _saveMapModal = _interopRequireDefault(require("./modals/save-map-modal"));

var _shareMapModal = _interopRequireDefault(require("./modals/share-map-modal"));

var _mediaBreakpoints = require("../styles/media-breakpoints");

var _defaultSettings = require("../constants/default-settings");

var _keyevent = _interopRequireDefault(require("../constants/keyevent"));

var _visStateSelectors = require("../reducers/vis-state-selectors");

function _templateObject8() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n                width: ", "px;\n              "]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n              ", ";\n              ", "\n            "]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  max-width: 960px;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  top: 60px;\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 40%;\n  padding: 40px 40px 32px 40px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    padding: 0;\n    margin: 0 auto;\n  "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    padding: 0;\n  "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  top: 80px;\n  padding: 32px 0 0 0;\n  width: 90vw;\n  max-width: 90vw;\n\n  ", "\n\n  ", "\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var DataTableModalStyle = (0, _styledComponents.css)(_templateObject(), _mediaBreakpoints.media.portable(_templateObject2()), _mediaBreakpoints.media.palm(_templateObject3()));
var smallModalCss = (0, _styledComponents.css)(_templateObject4());
var LoadDataModalStyle = (0, _styledComponents.css)(_templateObject5());
var DefaultStyle = (0, _styledComponents.css)(_templateObject6());
ModalContainerFactory.deps = [_deleteDataModal["default"], _overwriteMapModal["default"], _dataTableModal["default"], _loadDataModal["default"], _exportImageModal["default"], _exportDataModal["default"], _exportMapModal["default"], _addMapStyleModal["default"], _modalDialog["default"], _saveMapModal["default"], _shareMapModal["default"]];

function ModalContainerFactory(DeleteDatasetModal, OverWriteMapModal, DataTableModal, LoadDataModal, ExportImageModal, ExportDataModal, ExportMapModal, AddMapStyleModal, ModalDialog, SaveMapModal, ShareMapModal) {
  /** @typedef {import('./modal-container').ModalContainerProps} ModalContainerProps */

  /** @augments React.Component<ModalContainerProps> */
  var ModalContainer = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(ModalContainer, _Component);

    var _super = _createSuper(ModalContainer);

    function ModalContainer() {
      var _this;

      (0, _classCallCheck2["default"])(this, ModalContainer);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "componentDidMount", function () {
        _document["default"].addEventListener('keyup', _this._onKeyUp);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "cloudProviders", function (props) {
        return props.cloudProviders;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "providerWithStorage", (0, _reselect.createSelector)(_this.cloudProviders, function (cloudProviders) {
        return cloudProviders.filter(function (p) {
          return p.hasPrivateStorage();
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "providerWithShare", (0, _reselect.createSelector)(_this.cloudProviders, function (cloudProviders) {
        return cloudProviders.filter(function (p) {
          return p.hasSharingUrl();
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onKeyUp", function (event) {
        var keyCode = event.keyCode;

        if (keyCode === _keyevent["default"].DOM_VK_ESCAPE) {
          _this._closeModal();
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_closeModal", function () {
        _this.props.uiStateActions.toggleModal(null);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_deleteDataset", function (key) {
        _this.props.visStateActions.removeDataset(key);

        _this._closeModal();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onAddCustomMapStyle", function () {
        _this.props.mapStyleActions.addCustomMapStyle();

        _this._closeModal();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onFileUpload", function (fileList) {
        _this.props.visStateActions.loadFiles(fileList);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onExportImage", function () {
        if (!_this.props.uiState.exportImage.processing) {
          (0, _exportUtils.exportImage)(_this.props);

          _this.props.uiStateActions.cleanupExportImage();

          _this._closeModal();
        }
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onExportData", function () {
        (0, _exportUtils.exportData)(_this.props, _this.props.uiState.exportData);

        _this._closeModal();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onExportMap", function () {
        var uiState = _this.props.uiState;
        var format = uiState.exportMap.format;
        (format === _defaultSettings.EXPORT_MAP_FORMATS.HTML ? _exportUtils.exportHtml : _exportUtils.exportJson)(_this.props, _this.props.uiState.exportMap[format] || {});

        _this._closeModal();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_exportFileToCloud", function (_ref) {
        var provider = _ref.provider,
            isPublic = _ref.isPublic,
            overwrite = _ref.overwrite,
            closeModal = _ref.closeModal;
        var toSave = (0, _exportUtils.exportMap)(_this.props);

        _this.props.providerActions.exportFileToCloud({
          // @ts-ignore
          mapData: toSave,
          provider: provider,
          options: {
            isPublic: isPublic,
            overwrite: overwrite
          },
          closeModal: closeModal,
          onSuccess: _this.props.onExportToCloudSuccess,
          onError: _this.props.onExportToCloudError
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onSaveMap", function () {
        var overwrite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var currentProvider = _this.props.providerState.currentProvider; // @ts-ignore

        var provider = _this.props.cloudProviders.find(function (p) {
          return p.name === currentProvider;
        });

        _this._exportFileToCloud({
          provider: provider,
          isPublic: false,
          overwrite: overwrite,
          closeModal: true
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onOverwriteMap", function () {
        _this._onSaveMap(true);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onShareMapUrl", function (provider) {
        _this._exportFileToCloud({
          provider: provider,
          isPublic: true,
          overwrite: false,
          closeModal: false
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onCloseSaveMap", function () {
        _this.props.providerActions.resetProviderStatus();

        _this._closeModal();
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onLoadCloudMap", function (payload) {
        _this.props.providerActions.loadCloudMap(_objectSpread(_objectSpread({}, payload), {}, {
          onSuccess: _this.props.onLoadCloudMapSuccess,
          onError: _this.props.onLoadCloudMapError
        }));
      });
      return _this;
    }

    (0, _createClass2["default"])(ModalContainer, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        _document["default"].removeEventListener('keyup', this._onKeyUp);
      }
    }, {
      key: "render",

      /* eslint-disable complexity */
      value: function render() {
        var _this2 = this;

        var _this$props = this.props,
            containerW = _this$props.containerW,
            containerH = _this$props.containerH,
            mapStyle = _this$props.mapStyle,
            mapState = _this$props.mapState,
            uiState = _this$props.uiState,
            visState = _this$props.visState,
            rootNode = _this$props.rootNode,
            visStateActions = _this$props.visStateActions,
            uiStateActions = _this$props.uiStateActions,
            providerState = _this$props.providerState;
        var currentModal = uiState.currentModal,
            datasetKeyToRemove = uiState.datasetKeyToRemove;
        var datasets = visState.datasets,
            layers = visState.layers,
            editingDataset = visState.editingDataset;
        var template = null;
        var modalProps = {}; // TODO - currentModal is a string
        // @ts-ignore

        if (currentModal && currentModal.id && currentModal.template) {
          // if currentMdoal template is already provided
          // TODO: need to check whether template is valid
          // @ts-ignore
          template = /*#__PURE__*/_react["default"].createElement(currentModal.template, null); // @ts-ignore

          modalProps = currentModal.modalProps;
        } else {
          switch (currentModal) {
            case _defaultSettings.DATA_TABLE_ID:
              var width = containerW * 0.9;
              template = /*#__PURE__*/_react["default"].createElement(DataTableModal, {
                width: containerW * 0.9,
                height: containerH * 0.85,
                datasets: datasets,
                dataId: editingDataset,
                showDatasetTable: visStateActions.showDatasetTable,
                sortTableColumn: visStateActions.sortTableColumn,
                pinTableColumn: visStateActions.pinTableColumn,
                copyTableColumn: visStateActions.copyTableColumn
              }); // TODO: we need to make this width consistent with the css rule defined modal.js:32 max-width: 70vw

              modalProps.cssStyle = (0, _styledComponents.css)(_templateObject7(), DataTableModalStyle, _mediaBreakpoints.media.palm(_templateObject8(), width));
              break;

            case _defaultSettings.DELETE_DATA_ID:
              // validate options
              if (datasetKeyToRemove && datasets && datasets[datasetKeyToRemove]) {
                template = /*#__PURE__*/_react["default"].createElement(DeleteDatasetModal, {
                  dataset: datasets[datasetKeyToRemove],
                  layers: layers
                });
                modalProps = {
                  title: 'modal.title.deleteDataset',
                  cssStyle: smallModalCss,
                  footer: true,
                  onConfirm: function onConfirm() {
                    return _this2._deleteDataset(datasetKeyToRemove);
                  },
                  onCancel: this._closeModal,
                  confirmButton: {
                    negative: true,
                    large: true,
                    children: 'modal.button.delete'
                  }
                };
              }

              break;
            // in case we add a new case after this one

            case _defaultSettings.ADD_DATA_ID:
              template = /*#__PURE__*/_react["default"].createElement(LoadDataModal, (0, _extends2["default"])({}, providerState, {
                onClose: this._closeModal,
                onFileUpload: this._onFileUpload,
                onLoadCloudMap: this._onLoadCloudMap,
                cloudProviders: this.providerWithStorage(this.props),
                onSetCloudProvider: this.props.providerActions.setCloudProvider,
                getSavedMaps: this.props.providerActions.getSavedMaps,
                loadFiles: uiState.loadFiles,
                fileLoading: visState.fileLoading,
                fileLoadingProgress: visState.fileLoadingProgress,
                fileFormatNames: (0, _visStateSelectors.getFileFormatNames)(this.props.visState),
                fileExtensions: (0, _visStateSelectors.getFileExtensions)(this.props.visState)
              }));
              modalProps = {
                title: 'modal.title.addDataToMap',
                cssStyle: LoadDataModalStyle,
                footer: false,
                onConfirm: this._closeModal
              };
              break;

            case _defaultSettings.EXPORT_IMAGE_ID:
              template = /*#__PURE__*/_react["default"].createElement(ExportImageModal, {
                exportImage: uiState.exportImage,
                mapW: containerW,
                mapH: containerH,
                onUpdateImageSetting: uiStateActions.setExportImageSetting,
                cleanupExportImage: uiStateActions.cleanupExportImage
              });
              modalProps = {
                title: 'modal.title.exportImage',
                cssStyle: '',
                footer: true,
                onCancel: this._closeModal,
                onConfirm: this._onExportImage,
                confirmButton: {
                  large: true,
                  disabled: uiState.exportImage.processing,
                  children: 'modal.button.download'
                }
              };
              break;

            case _defaultSettings.EXPORT_DATA_ID:
              template = /*#__PURE__*/_react["default"].createElement(ExportDataModal, (0, _extends2["default"])({}, uiState.exportData, {
                datasets: datasets,
                applyCPUFilter: this.props.visStateActions.applyCPUFilter,
                onClose: this._closeModal,
                onChangeExportDataType: uiStateActions.setExportDataType,
                onChangeExportSelectedDataset: uiStateActions.setExportSelectedDataset,
                onChangeExportFiltered: uiStateActions.setExportFiltered
              }));
              modalProps = {
                title: 'modal.title.exportData',
                cssStyle: '',
                footer: true,
                onCancel: this._closeModal,
                onConfirm: this._onExportData,
                confirmButton: {
                  large: true,
                  children: 'modal.button.export'
                }
              };
              break;

            case _defaultSettings.EXPORT_MAP_ID:
              var keplerGlConfig = visState.schema.getConfigToSave({
                mapStyle: mapStyle,
                visState: visState,
                mapState: mapState,
                uiState: uiState
              });
              template = /*#__PURE__*/_react["default"].createElement(ExportMapModal, {
                config: keplerGlConfig,
                options: uiState.exportMap,
                onChangeExportMapFormat: uiStateActions.setExportMapFormat,
                onEditUserMapboxAccessToken: uiStateActions.setUserMapboxAccessToken,
                onChangeExportMapHTMLMode: uiStateActions.setExportHTMLMapMode
              });
              modalProps = {
                title: 'modal.title.exportMap',
                cssStyle: '',
                footer: true,
                onCancel: this._closeModal,
                onConfirm: this._onExportMap,
                confirmButton: {
                  large: true,
                  children: 'modal.button.export'
                }
              };
              break;

            case _defaultSettings.ADD_MAP_STYLE_ID:
              template = /*#__PURE__*/_react["default"].createElement(AddMapStyleModal, {
                mapboxApiAccessToken: this.props.mapboxApiAccessToken,
                mapboxApiUrl: this.props.mapboxApiUrl,
                mapState: this.props.mapState,
                inputStyle: mapStyle.inputStyle,
                inputMapStyle: this.props.mapStyleActions.inputMapStyle,
                loadCustomMapStyle: this.props.mapStyleActions.loadCustomMapStyle
              });
              modalProps = {
                title: 'modal.title.addCustomMapboxStyle',
                cssStyle: '',
                footer: true,
                onCancel: this._closeModal,
                onConfirm: this._onAddCustomMapStyle,
                confirmButton: {
                  large: true,
                  disabled: !mapStyle.inputStyle.style,
                  children: 'modal.button.addStyle'
                }
              };
              break;

            case _defaultSettings.SAVE_MAP_ID:
              template = /*#__PURE__*/_react["default"].createElement(SaveMapModal, (0, _extends2["default"])({}, providerState, {
                exportImage: uiState.exportImage,
                mapInfo: visState.mapInfo,
                onSetMapInfo: visStateActions.setMapInfo,
                cloudProviders: this.providerWithStorage(this.props),
                onSetCloudProvider: this.props.providerActions.setCloudProvider,
                cleanupExportImage: uiStateActions.cleanupExportImage,
                onUpdateImageSetting: uiStateActions.setExportImageSetting
              }));
              modalProps = {
                title: 'modal.title.saveMap',
                cssStyle: '',
                footer: true,
                onCancel: this._closeModal,
                onConfirm: function onConfirm() {
                  return _this2._onSaveMap(false);
                },
                confirmButton: {
                  large: true,
                  disabled: uiState.exportImage.processing || !(0, _mapInfoUtils.isValidMapInfo)(visState.mapInfo) || !providerState.currentProvider,
                  children: 'modal.button.save'
                }
              };
              break;

            case _defaultSettings.OVERWRITE_MAP_ID:
              template = /*#__PURE__*/_react["default"].createElement(OverWriteMapModal, (0, _extends2["default"])({}, providerState, {
                cloudProviders: this.props.cloudProviders,
                title: (0, _lodash["default"])(visState, ['mapInfo', 'title']),
                onSetCloudProvider: this.props.providerActions.setCloudProvider,
                onUpdateImageSetting: uiStateActions.setExportImageSetting,
                cleanupExportImage: uiStateActions.cleanupExportImage
              }));
              modalProps = {
                title: 'Overwrite Existing File?',
                cssStyle: smallModalCss,
                footer: true,
                onConfirm: this._onOverwriteMap,
                onCancel: this._closeModal,
                confirmButton: {
                  large: true,
                  children: 'Yes',
                  disabled: uiState.exportImage.processing || !(0, _mapInfoUtils.isValidMapInfo)(visState.mapInfo) || !providerState.currentProvider
                }
              };
              break;

            case _defaultSettings.SHARE_MAP_ID:
              template = /*#__PURE__*/_react["default"].createElement(ShareMapModal, (0, _extends2["default"])({}, providerState, {
                isReady: !uiState.exportImage.processing,
                cloudProviders: this.providerWithShare(this.props),
                onExport: this._onShareMapUrl,
                onSetCloudProvider: this.props.providerActions.setCloudProvider,
                cleanupExportImage: uiStateActions.cleanupExportImage,
                onUpdateImageSetting: uiStateActions.setExportImageSetting
              }));
              modalProps = {
                title: 'modal.title.shareURL',
                cssStyle: '',
                onCancel: this._onCloseSaveMap
              };
              break;

            default:
              break;
          }
        }

        return this.props.rootNode ? /*#__PURE__*/_react["default"].createElement(ModalDialog, (0, _extends2["default"])({
          parentSelector: function parentSelector() {
            return (0, _reactDom.findDOMNode)(rootNode);
          },
          isOpen: Boolean(currentModal),
          onCancel: this._closeModal
        }, modalProps, {
          cssStyle: DefaultStyle.concat(modalProps.cssStyle)
        }), template) : null;
      }
      /* eslint-enable complexity */

    }]);
    return ModalContainer;
  }(_react.Component);

  (0, _defineProperty2["default"])(ModalContainer, "propTypes", {
    rootNode: _propTypes["default"].object,
    containerW: _propTypes["default"].number,
    containerH: _propTypes["default"].number,
    mapboxApiAccessToken: _propTypes["default"].string.isRequired,
    mapboxApiUrl: _propTypes["default"].string,
    mapState: _propTypes["default"].object.isRequired,
    mapStyle: _propTypes["default"].object.isRequired,
    uiState: _propTypes["default"].object.isRequired,
    visState: _propTypes["default"].object.isRequired,
    visStateActions: _propTypes["default"].object.isRequired,
    uiStateActions: _propTypes["default"].object.isRequired,
    mapStyleActions: _propTypes["default"].object.isRequired,
    onSaveToStorage: _propTypes["default"].func,
    cloudProviders: _propTypes["default"].arrayOf(_propTypes["default"].object)
  });
  return ModalContainer;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFsLWNvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJEYXRhVGFibGVNb2RhbFN0eWxlIiwiY3NzIiwibWVkaWEiLCJwb3J0YWJsZSIsInBhbG0iLCJzbWFsbE1vZGFsQ3NzIiwiTG9hZERhdGFNb2RhbFN0eWxlIiwiRGVmYXVsdFN0eWxlIiwiTW9kYWxDb250YWluZXJGYWN0b3J5IiwiZGVwcyIsIkRlbGV0ZURhdGFzZXRNb2RhbEZhY3RvcnkiLCJPdmVyV3JpdGVNYXBNb2RhbEZhY3RvcnkiLCJEYXRhVGFibGVNb2RhbEZhY3RvcnkiLCJMb2FkRGF0YU1vZGFsRmFjdG9yeSIsIkV4cG9ydEltYWdlTW9kYWxGYWN0b3J5IiwiRXhwb3J0RGF0YU1vZGFsRmFjdG9yeSIsIkV4cG9ydE1hcE1vZGFsRmFjdG9yeSIsIkFkZE1hcFN0eWxlTW9kYWxGYWN0b3J5IiwiTW9kYWxEaWFsb2dGYWN0b3J5IiwiU2F2ZU1hcE1vZGFsRmFjdG9yeSIsIlNoYXJlTWFwTW9kYWxGYWN0b3J5IiwiRGVsZXRlRGF0YXNldE1vZGFsIiwiT3ZlcldyaXRlTWFwTW9kYWwiLCJEYXRhVGFibGVNb2RhbCIsIkxvYWREYXRhTW9kYWwiLCJFeHBvcnRJbWFnZU1vZGFsIiwiRXhwb3J0RGF0YU1vZGFsIiwiRXhwb3J0TWFwTW9kYWwiLCJBZGRNYXBTdHlsZU1vZGFsIiwiTW9kYWxEaWFsb2ciLCJTYXZlTWFwTW9kYWwiLCJTaGFyZU1hcE1vZGFsIiwiTW9kYWxDb250YWluZXIiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJfb25LZXlVcCIsInByb3BzIiwiY2xvdWRQcm92aWRlcnMiLCJmaWx0ZXIiLCJwIiwiaGFzUHJpdmF0ZVN0b3JhZ2UiLCJoYXNTaGFyaW5nVXJsIiwiZXZlbnQiLCJrZXlDb2RlIiwiS2V5RXZlbnQiLCJET01fVktfRVNDQVBFIiwiX2Nsb3NlTW9kYWwiLCJ1aVN0YXRlQWN0aW9ucyIsInRvZ2dsZU1vZGFsIiwia2V5IiwidmlzU3RhdGVBY3Rpb25zIiwicmVtb3ZlRGF0YXNldCIsIm1hcFN0eWxlQWN0aW9ucyIsImFkZEN1c3RvbU1hcFN0eWxlIiwiZmlsZUxpc3QiLCJsb2FkRmlsZXMiLCJ1aVN0YXRlIiwiZXhwb3J0SW1hZ2UiLCJwcm9jZXNzaW5nIiwiY2xlYW51cEV4cG9ydEltYWdlIiwiZXhwb3J0RGF0YSIsImZvcm1hdCIsImV4cG9ydE1hcCIsIkVYUE9SVF9NQVBfRk9STUFUUyIsIkhUTUwiLCJleHBvcnRIdG1sIiwiZXhwb3J0SnNvbiIsInByb3ZpZGVyIiwiaXNQdWJsaWMiLCJvdmVyd3JpdGUiLCJjbG9zZU1vZGFsIiwidG9TYXZlIiwicHJvdmlkZXJBY3Rpb25zIiwiZXhwb3J0RmlsZVRvQ2xvdWQiLCJtYXBEYXRhIiwib3B0aW9ucyIsIm9uU3VjY2VzcyIsIm9uRXhwb3J0VG9DbG91ZFN1Y2Nlc3MiLCJvbkVycm9yIiwib25FeHBvcnRUb0Nsb3VkRXJyb3IiLCJjdXJyZW50UHJvdmlkZXIiLCJwcm92aWRlclN0YXRlIiwiZmluZCIsIm5hbWUiLCJfZXhwb3J0RmlsZVRvQ2xvdWQiLCJfb25TYXZlTWFwIiwicmVzZXRQcm92aWRlclN0YXR1cyIsInBheWxvYWQiLCJsb2FkQ2xvdWRNYXAiLCJvbkxvYWRDbG91ZE1hcFN1Y2Nlc3MiLCJvbkxvYWRDbG91ZE1hcEVycm9yIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRhaW5lclciLCJjb250YWluZXJIIiwibWFwU3R5bGUiLCJtYXBTdGF0ZSIsInZpc1N0YXRlIiwicm9vdE5vZGUiLCJjdXJyZW50TW9kYWwiLCJkYXRhc2V0S2V5VG9SZW1vdmUiLCJkYXRhc2V0cyIsImxheWVycyIsImVkaXRpbmdEYXRhc2V0IiwidGVtcGxhdGUiLCJtb2RhbFByb3BzIiwiaWQiLCJEQVRBX1RBQkxFX0lEIiwid2lkdGgiLCJzaG93RGF0YXNldFRhYmxlIiwic29ydFRhYmxlQ29sdW1uIiwicGluVGFibGVDb2x1bW4iLCJjb3B5VGFibGVDb2x1bW4iLCJjc3NTdHlsZSIsIkRFTEVURV9EQVRBX0lEIiwidGl0bGUiLCJmb290ZXIiLCJvbkNvbmZpcm0iLCJfZGVsZXRlRGF0YXNldCIsIm9uQ2FuY2VsIiwiY29uZmlybUJ1dHRvbiIsIm5lZ2F0aXZlIiwibGFyZ2UiLCJjaGlsZHJlbiIsIkFERF9EQVRBX0lEIiwiX29uRmlsZVVwbG9hZCIsIl9vbkxvYWRDbG91ZE1hcCIsInByb3ZpZGVyV2l0aFN0b3JhZ2UiLCJzZXRDbG91ZFByb3ZpZGVyIiwiZ2V0U2F2ZWRNYXBzIiwiZmlsZUxvYWRpbmciLCJmaWxlTG9hZGluZ1Byb2dyZXNzIiwiRVhQT1JUX0lNQUdFX0lEIiwic2V0RXhwb3J0SW1hZ2VTZXR0aW5nIiwiX29uRXhwb3J0SW1hZ2UiLCJkaXNhYmxlZCIsIkVYUE9SVF9EQVRBX0lEIiwiYXBwbHlDUFVGaWx0ZXIiLCJzZXRFeHBvcnREYXRhVHlwZSIsInNldEV4cG9ydFNlbGVjdGVkRGF0YXNldCIsInNldEV4cG9ydEZpbHRlcmVkIiwiX29uRXhwb3J0RGF0YSIsIkVYUE9SVF9NQVBfSUQiLCJrZXBsZXJHbENvbmZpZyIsInNjaGVtYSIsImdldENvbmZpZ1RvU2F2ZSIsInNldEV4cG9ydE1hcEZvcm1hdCIsInNldFVzZXJNYXBib3hBY2Nlc3NUb2tlbiIsInNldEV4cG9ydEhUTUxNYXBNb2RlIiwiX29uRXhwb3J0TWFwIiwiQUREX01BUF9TVFlMRV9JRCIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwibWFwYm94QXBpVXJsIiwiaW5wdXRTdHlsZSIsImlucHV0TWFwU3R5bGUiLCJsb2FkQ3VzdG9tTWFwU3R5bGUiLCJfb25BZGRDdXN0b21NYXBTdHlsZSIsInN0eWxlIiwiU0FWRV9NQVBfSUQiLCJtYXBJbmZvIiwic2V0TWFwSW5mbyIsIk9WRVJXUklURV9NQVBfSUQiLCJfb25PdmVyd3JpdGVNYXAiLCJTSEFSRV9NQVBfSUQiLCJwcm92aWRlcldpdGhTaGFyZSIsIl9vblNoYXJlTWFwVXJsIiwiX29uQ2xvc2VTYXZlTWFwIiwiQm9vbGVhbiIsImNvbmNhdCIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsIm9iamVjdCIsIm51bWJlciIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJvblNhdmVUb1N0b3JhZ2UiLCJmdW5jIiwiYXJyYXlPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBR0E7O0FBYUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLG1CQUFtQixPQUFHQyxxQkFBSCxxQkFNckJDLHdCQUFNQyxRQU5lLHNCQVVyQkQsd0JBQU1FLElBVmUscUJBQXpCO0FBZUEsSUFBTUMsYUFBYSxPQUFHSixxQkFBSCxxQkFBbkI7QUFLQSxJQUFNSyxrQkFBa0IsT0FBR0wscUJBQUgscUJBQXhCO0FBSUEsSUFBTU0sWUFBWSxPQUFHTixxQkFBSCxxQkFBbEI7QUFJQU8scUJBQXFCLENBQUNDLElBQXRCLEdBQTZCLENBQzNCQywyQkFEMkIsRUFFM0JDLDZCQUYyQixFQUczQkMsMEJBSDJCLEVBSTNCQyx5QkFKMkIsRUFLM0JDLDRCQUwyQixFQU0zQkMsMkJBTjJCLEVBTzNCQywwQkFQMkIsRUFRM0JDLDRCQVIyQixFQVMzQkMsdUJBVDJCLEVBVTNCQyx3QkFWMkIsRUFXM0JDLHlCQVgyQixDQUE3Qjs7QUFjZSxTQUFTWixxQkFBVCxDQUNiYSxrQkFEYSxFQUViQyxpQkFGYSxFQUdiQyxjQUhhLEVBSWJDLGFBSmEsRUFLYkMsZ0JBTGEsRUFNYkMsZUFOYSxFQU9iQyxjQVBhLEVBUWJDLGdCQVJhLEVBU2JDLFdBVGEsRUFVYkMsWUFWYSxFQVdiQyxhQVhhLEVBWWI7QUFDQTs7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Q0FBQ2dLLE1BQWIsQ0FBb0IvRCxVQUFVLENBQUNRLFFBQS9CO0FBTFosWUFPR1QsUUFQSCxDQURLLEdBVUgsSUFWSjtBQVdEO0FBQ0Q7O0FBdGFGO0FBQUE7QUFBQSxJQUc2QmlFLGdCQUg3Qjs7QUFBQSxtQ0FHTXhJLGNBSE4sZUFLcUI7QUFDakJpRSxJQUFBQSxRQUFRLEVBQUV3RSxzQkFBVUMsTUFESDtBQUVqQjlFLElBQUFBLFVBQVUsRUFBRTZFLHNCQUFVRSxNQUZMO0FBR2pCOUUsSUFBQUEsVUFBVSxFQUFFNEUsc0JBQVVFLE1BSEw7QUFJakJyQixJQUFBQSxvQkFBb0IsRUFBRW1CLHNCQUFVRyxNQUFWLENBQWlCQyxVQUp0QjtBQUtqQnRCLElBQUFBLFlBQVksRUFBRWtCLHNCQUFVRyxNQUxQO0FBTWpCN0UsSUFBQUEsUUFBUSxFQUFFMEUsc0JBQVVDLE1BQVYsQ0FBaUJHLFVBTlY7QUFPakIvRSxJQUFBQSxRQUFRLEVBQUUyRSxzQkFBVUMsTUFBVixDQUFpQkcsVUFQVjtBQVFqQnJILElBQUFBLE9BQU8sRUFBRWlILHNCQUFVQyxNQUFWLENBQWlCRyxVQVJUO0FBU2pCN0UsSUFBQUEsUUFBUSxFQUFFeUUsc0JBQVVDLE1BQVYsQ0FBaUJHLFVBVFY7QUFVakIzSCxJQUFBQSxlQUFlLEVBQUV1SCxzQkFBVUMsTUFBVixDQUFpQkcsVUFWakI7QUFXakI5SCxJQUFBQSxjQUFjLEVBQUUwSCxzQkFBVUMsTUFBVixDQUFpQkcsVUFYaEI7QUFZakJ6SCxJQUFBQSxlQUFlLEVBQUVxSCxzQkFBVUMsTUFBVixDQUFpQkcsVUFaakI7QUFhakJDLElBQUFBLGVBQWUsRUFBRUwsc0JBQVVNLElBYlY7QUFjakIxSSxJQUFBQSxjQUFjLEVBQUVvSSxzQkFBVU8sT0FBVixDQUFrQlAsc0JBQVVDLE1BQTVCO0FBZEMsR0FMckI7QUF5YUEsU0FBTzFJLGNBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7Y3NzfSBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge2ZpbmRET01Ob2RlfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcbmltcG9ydCBkb2N1bWVudCBmcm9tICdnbG9iYWwvZG9jdW1lbnQnO1xuXG5pbXBvcnQgTW9kYWxEaWFsb2dGYWN0b3J5IGZyb20gJy4vbW9kYWxzL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQge2V4cG9ydEpzb24sIGV4cG9ydEh0bWwsIGV4cG9ydERhdGEsIGV4cG9ydEltYWdlLCBleHBvcnRNYXB9IGZyb20gJ3V0aWxzL2V4cG9ydC11dGlscyc7XG5pbXBvcnQge2lzVmFsaWRNYXBJbmZvfSBmcm9tICd1dGlscy9tYXAtaW5mby11dGlscyc7XG5cbi8vIG1vZGFsc1xuaW1wb3J0IERlbGV0ZURhdGFzZXRNb2RhbEZhY3RvcnkgZnJvbSAnLi9tb2RhbHMvZGVsZXRlLWRhdGEtbW9kYWwnO1xuaW1wb3J0IE92ZXJXcml0ZU1hcE1vZGFsRmFjdG9yeSBmcm9tICcuL21vZGFscy9vdmVyd3JpdGUtbWFwLW1vZGFsJztcbmltcG9ydCBEYXRhVGFibGVNb2RhbEZhY3RvcnkgZnJvbSAnLi9tb2RhbHMvZGF0YS10YWJsZS1tb2RhbCc7XG5pbXBvcnQgTG9hZERhdGFNb2RhbEZhY3RvcnkgZnJvbSAnLi9tb2RhbHMvbG9hZC1kYXRhLW1vZGFsJztcbmltcG9ydCBFeHBvcnRJbWFnZU1vZGFsRmFjdG9yeSBmcm9tICcuL21vZGFscy9leHBvcnQtaW1hZ2UtbW9kYWwnO1xuaW1wb3J0IEV4cG9ydERhdGFNb2RhbEZhY3RvcnkgZnJvbSAnLi9tb2RhbHMvZXhwb3J0LWRhdGEtbW9kYWwnO1xuaW1wb3J0IEV4cG9ydE1hcE1vZGFsRmFjdG9yeSBmcm9tICcuL21vZGFscy9leHBvcnQtbWFwLW1vZGFsL2V4cG9ydC1tYXAtbW9kYWwnO1xuaW1wb3J0IEFkZE1hcFN0eWxlTW9kYWxGYWN0b3J5IGZyb20gJy4vbW9kYWxzL2FkZC1tYXAtc3R5bGUtbW9kYWwnO1xuaW1wb3J0IFNhdmVNYXBNb2RhbEZhY3RvcnkgZnJvbSAnLi9tb2RhbHMvc2F2ZS1tYXAtbW9kYWwnO1xuaW1wb3J0IFNoYXJlTWFwTW9kYWxGYWN0b3J5IGZyb20gJy4vbW9kYWxzL3NoYXJlLW1hcC1tb2RhbCc7XG5cbi8vIEJyZWFrcG9pbnRzXG5pbXBvcnQge21lZGlhfSBmcm9tICdzdHlsZXMvbWVkaWEtYnJlYWtwb2ludHMnO1xuXG4vLyBUZW1wbGF0ZVxuaW1wb3J0IHtcbiAgQUREX0RBVEFfSUQsXG4gIERBVEFfVEFCTEVfSUQsXG4gIERFTEVURV9EQVRBX0lELFxuICBFWFBPUlRfREFUQV9JRCxcbiAgRVhQT1JUX0lNQUdFX0lELFxuICBFWFBPUlRfTUFQX0lELFxuICBBRERfTUFQX1NUWUxFX0lELFxuICBTQVZFX01BUF9JRCxcbiAgU0hBUkVfTUFQX0lELFxuICBPVkVSV1JJVEVfTUFQX0lEXG59IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCB7RVhQT1JUX01BUF9GT1JNQVRTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQgS2V5RXZlbnQgZnJvbSAnY29uc3RhbnRzL2tleWV2ZW50JztcbmltcG9ydCB7Z2V0RmlsZUZvcm1hdE5hbWVzLCBnZXRGaWxlRXh0ZW5zaW9uc30gZnJvbSAnLi4vcmVkdWNlcnMvdmlzLXN0YXRlLXNlbGVjdG9ycyc7XG5cbmNvbnN0IERhdGFUYWJsZU1vZGFsU3R5bGUgPSBjc3NgXG4gIHRvcDogODBweDtcbiAgcGFkZGluZzogMzJweCAwIDAgMDtcbiAgd2lkdGg6IDkwdnc7XG4gIG1heC13aWR0aDogOTB2dztcblxuICAke21lZGlhLnBvcnRhYmxlYFxuICAgIHBhZGRpbmc6IDA7XG4gIGB9XG5cbiAgJHttZWRpYS5wYWxtYFxuICAgIHBhZGRpbmc6IDA7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gIGB9XG5gO1xuY29uc3Qgc21hbGxNb2RhbENzcyA9IGNzc2BcbiAgd2lkdGg6IDQwJTtcbiAgcGFkZGluZzogNDBweCA0MHB4IDMycHggNDBweDtcbmA7XG5cbmNvbnN0IExvYWREYXRhTW9kYWxTdHlsZSA9IGNzc2BcbiAgdG9wOiA2MHB4O1xuYDtcblxuY29uc3QgRGVmYXVsdFN0eWxlID0gY3NzYFxuICBtYXgtd2lkdGg6IDk2MHB4O1xuYDtcblxuTW9kYWxDb250YWluZXJGYWN0b3J5LmRlcHMgPSBbXG4gIERlbGV0ZURhdGFzZXRNb2RhbEZhY3RvcnksXG4gIE92ZXJXcml0ZU1hcE1vZGFsRmFjdG9yeSxcbiAgRGF0YVRhYmxlTW9kYWxGYWN0b3J5LFxuICBMb2FkRGF0YU1vZGFsRmFjdG9yeSxcbiAgRXhwb3J0SW1hZ2VNb2RhbEZhY3RvcnksXG4gIEV4cG9ydERhdGFNb2RhbEZhY3RvcnksXG4gIEV4cG9ydE1hcE1vZGFsRmFjdG9yeSxcbiAgQWRkTWFwU3R5bGVNb2RhbEZhY3RvcnksXG4gIE1vZGFsRGlhbG9nRmFjdG9yeSxcbiAgU2F2ZU1hcE1vZGFsRmFjdG9yeSxcbiAgU2hhcmVNYXBNb2RhbEZhY3Rvcnlcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1vZGFsQ29udGFpbmVyRmFjdG9yeShcbiAgRGVsZXRlRGF0YXNldE1vZGFsLFxuICBPdmVyV3JpdGVNYXBNb2RhbCxcbiAgRGF0YVRhYmxlTW9kYWwsXG4gIExvYWREYXRhTW9kYWwsXG4gIEV4cG9ydEltYWdlTW9kYWwsXG4gIEV4cG9ydERhdGFNb2RhbCxcbiAgRXhwb3J0TWFwTW9kYWwsXG4gIEFkZE1hcFN0eWxlTW9kYWwsXG4gIE1vZGFsRGlhbG9nLFxuICBTYXZlTWFwTW9kYWwsXG4gIFNoYXJlTWFwTW9kYWxcbikge1xuICAvKiogQHR5cGVkZWYge2ltcG9ydCgnLi9tb2RhbC1jb250YWluZXInKS5Nb2RhbENvbnRhaW5lclByb3BzfSBNb2RhbENvbnRhaW5lclByb3BzICovXG4gIC8qKiBAYXVnbWVudHMgUmVhY3QuQ29tcG9uZW50PE1vZGFsQ29udGFpbmVyUHJvcHM+ICovXG4gIGNsYXNzIE1vZGFsQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAvLyBUT0RPIC0gcmVtb3ZlIHdoZW4gcHJvcCB0eXBlcyBhcmUgZnVsbHkgZXhwb3J0ZWRcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgcm9vdE5vZGU6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICBjb250YWluZXJXOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgY29udGFpbmVySDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICBtYXBib3hBcGlVcmw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBtYXBTdGF0ZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwU3R5bGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIHVpU3RhdGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIHZpc1N0YXRlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICB2aXNTdGF0ZUFjdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIHVpU3RhdGVBY3Rpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBtYXBTdHlsZUFjdGlvbnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIG9uU2F2ZVRvU3RvcmFnZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICBjbG91ZFByb3ZpZGVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdClcbiAgICB9O1xuICAgIGNvbXBvbmVudERpZE1vdW50ID0gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9vbktleVVwKTtcbiAgICB9O1xuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9vbktleVVwKTtcbiAgICB9XG5cbiAgICBjbG91ZFByb3ZpZGVycyA9IHByb3BzID0+IHByb3BzLmNsb3VkUHJvdmlkZXJzO1xuICAgIHByb3ZpZGVyV2l0aFN0b3JhZ2UgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLmNsb3VkUHJvdmlkZXJzLCBjbG91ZFByb3ZpZGVycyA9PlxuICAgICAgY2xvdWRQcm92aWRlcnMuZmlsdGVyKHAgPT4gcC5oYXNQcml2YXRlU3RvcmFnZSgpKVxuICAgICk7XG4gICAgcHJvdmlkZXJXaXRoU2hhcmUgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLmNsb3VkUHJvdmlkZXJzLCBjbG91ZFByb3ZpZGVycyA9PlxuICAgICAgY2xvdWRQcm92aWRlcnMuZmlsdGVyKHAgPT4gcC5oYXNTaGFyaW5nVXJsKCkpXG4gICAgKTtcblxuICAgIF9vbktleVVwID0gZXZlbnQgPT4ge1xuICAgICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgICBpZiAoa2V5Q29kZSA9PT0gS2V5RXZlbnQuRE9NX1ZLX0VTQ0FQRSkge1xuICAgICAgICB0aGlzLl9jbG9zZU1vZGFsKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9jbG9zZU1vZGFsID0gKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy51aVN0YXRlQWN0aW9ucy50b2dnbGVNb2RhbChudWxsKTtcbiAgICB9O1xuXG4gICAgX2RlbGV0ZURhdGFzZXQgPSBrZXkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy52aXNTdGF0ZUFjdGlvbnMucmVtb3ZlRGF0YXNldChrZXkpO1xuICAgICAgdGhpcy5fY2xvc2VNb2RhbCgpO1xuICAgIH07XG5cbiAgICBfb25BZGRDdXN0b21NYXBTdHlsZSA9ICgpID0+IHtcbiAgICAgIHRoaXMucHJvcHMubWFwU3R5bGVBY3Rpb25zLmFkZEN1c3RvbU1hcFN0eWxlKCk7XG4gICAgICB0aGlzLl9jbG9zZU1vZGFsKCk7XG4gICAgfTtcblxuICAgIF9vbkZpbGVVcGxvYWQgPSBmaWxlTGlzdCA9PiB7XG4gICAgICB0aGlzLnByb3BzLnZpc1N0YXRlQWN0aW9ucy5sb2FkRmlsZXMoZmlsZUxpc3QpO1xuICAgIH07XG5cbiAgICBfb25FeHBvcnRJbWFnZSA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy51aVN0YXRlLmV4cG9ydEltYWdlLnByb2Nlc3NpbmcpIHtcbiAgICAgICAgZXhwb3J0SW1hZ2UodGhpcy5wcm9wcyk7XG4gICAgICAgIHRoaXMucHJvcHMudWlTdGF0ZUFjdGlvbnMuY2xlYW51cEV4cG9ydEltYWdlKCk7XG4gICAgICAgIHRoaXMuX2Nsb3NlTW9kYWwoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uRXhwb3J0RGF0YSA9ICgpID0+IHtcbiAgICAgIGV4cG9ydERhdGEodGhpcy5wcm9wcywgdGhpcy5wcm9wcy51aVN0YXRlLmV4cG9ydERhdGEpO1xuICAgICAgdGhpcy5fY2xvc2VNb2RhbCgpO1xuICAgIH07XG5cbiAgICBfb25FeHBvcnRNYXAgPSAoKSA9PiB7XG4gICAgICBjb25zdCB7dWlTdGF0ZX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3Qge2Zvcm1hdH0gPSB1aVN0YXRlLmV4cG9ydE1hcDtcbiAgICAgIChmb3JtYXQgPT09IEVYUE9SVF9NQVBfRk9STUFUUy5IVE1MID8gZXhwb3J0SHRtbCA6IGV4cG9ydEpzb24pKFxuICAgICAgICB0aGlzLnByb3BzLFxuICAgICAgICB0aGlzLnByb3BzLnVpU3RhdGUuZXhwb3J0TWFwW2Zvcm1hdF0gfHwge31cbiAgICAgICk7XG4gICAgICB0aGlzLl9jbG9zZU1vZGFsKCk7XG4gICAgfTtcblxuICAgIF9leHBvcnRGaWxlVG9DbG91ZCA9ICh7cHJvdmlkZXIsIGlzUHVibGljLCBvdmVyd3JpdGUsIGNsb3NlTW9kYWx9KSA9PiB7XG4gICAgICBjb25zdCB0b1NhdmUgPSBleHBvcnRNYXAodGhpcy5wcm9wcyk7XG5cbiAgICAgIHRoaXMucHJvcHMucHJvdmlkZXJBY3Rpb25zLmV4cG9ydEZpbGVUb0Nsb3VkKHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBtYXBEYXRhOiB0b1NhdmUsXG4gICAgICAgIHByb3ZpZGVyLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgaXNQdWJsaWMsXG4gICAgICAgICAgb3ZlcndyaXRlXG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlTW9kYWwsXG4gICAgICAgIG9uU3VjY2VzczogdGhpcy5wcm9wcy5vbkV4cG9ydFRvQ2xvdWRTdWNjZXNzLFxuICAgICAgICBvbkVycm9yOiB0aGlzLnByb3BzLm9uRXhwb3J0VG9DbG91ZEVycm9yXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU2F2ZU1hcCA9IChvdmVyd3JpdGUgPSBmYWxzZSkgPT4ge1xuICAgICAgY29uc3Qge2N1cnJlbnRQcm92aWRlcn0gPSB0aGlzLnByb3BzLnByb3ZpZGVyU3RhdGU7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMucHJvcHMuY2xvdWRQcm92aWRlcnMuZmluZChwID0+IHAubmFtZSA9PT0gY3VycmVudFByb3ZpZGVyKTtcbiAgICAgIHRoaXMuX2V4cG9ydEZpbGVUb0Nsb3VkKHtcbiAgICAgICAgcHJvdmlkZXIsXG4gICAgICAgIGlzUHVibGljOiBmYWxzZSxcbiAgICAgICAgb3ZlcndyaXRlLFxuICAgICAgICBjbG9zZU1vZGFsOiB0cnVlXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uT3ZlcndyaXRlTWFwID0gKCkgPT4ge1xuICAgICAgdGhpcy5fb25TYXZlTWFwKHRydWUpO1xuICAgIH07XG5cbiAgICBfb25TaGFyZU1hcFVybCA9IHByb3ZpZGVyID0+IHtcbiAgICAgIHRoaXMuX2V4cG9ydEZpbGVUb0Nsb3VkKHtwcm92aWRlciwgaXNQdWJsaWM6IHRydWUsIG92ZXJ3cml0ZTogZmFsc2UsIGNsb3NlTW9kYWw6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vbkNsb3NlU2F2ZU1hcCA9ICgpID0+IHtcbiAgICAgIHRoaXMucHJvcHMucHJvdmlkZXJBY3Rpb25zLnJlc2V0UHJvdmlkZXJTdGF0dXMoKTtcbiAgICAgIHRoaXMuX2Nsb3NlTW9kYWwoKTtcbiAgICB9O1xuXG4gICAgX29uTG9hZENsb3VkTWFwID0gcGF5bG9hZCA9PiB7XG4gICAgICB0aGlzLnByb3BzLnByb3ZpZGVyQWN0aW9ucy5sb2FkQ2xvdWRNYXAoe1xuICAgICAgICAuLi5wYXlsb2FkLFxuICAgICAgICBvblN1Y2Nlc3M6IHRoaXMucHJvcHMub25Mb2FkQ2xvdWRNYXBTdWNjZXNzLFxuICAgICAgICBvbkVycm9yOiB0aGlzLnByb3BzLm9uTG9hZENsb3VkTWFwRXJyb3JcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb250YWluZXJXLFxuICAgICAgICBjb250YWluZXJILFxuICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgIHVpU3RhdGUsXG4gICAgICAgIHZpc1N0YXRlLFxuICAgICAgICByb290Tm9kZSxcbiAgICAgICAgdmlzU3RhdGVBY3Rpb25zLFxuICAgICAgICB1aVN0YXRlQWN0aW9ucyxcbiAgICAgICAgcHJvdmlkZXJTdGF0ZVxuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB7Y3VycmVudE1vZGFsLCBkYXRhc2V0S2V5VG9SZW1vdmV9ID0gdWlTdGF0ZTtcbiAgICAgIGNvbnN0IHtkYXRhc2V0cywgbGF5ZXJzLCBlZGl0aW5nRGF0YXNldH0gPSB2aXNTdGF0ZTtcblxuICAgICAgbGV0IHRlbXBsYXRlID0gbnVsbDtcbiAgICAgIGxldCBtb2RhbFByb3BzID0ge307XG5cbiAgICAgIC8vIFRPRE8gLSBjdXJyZW50TW9kYWwgaXMgYSBzdHJpbmdcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmIChjdXJyZW50TW9kYWwgJiYgY3VycmVudE1vZGFsLmlkICYmIGN1cnJlbnRNb2RhbC50ZW1wbGF0ZSkge1xuICAgICAgICAvLyBpZiBjdXJyZW50TWRvYWwgdGVtcGxhdGUgaXMgYWxyZWFkeSBwcm92aWRlZFxuICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIGNoZWNrIHdoZXRoZXIgdGVtcGxhdGUgaXMgdmFsaWRcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0ZW1wbGF0ZSA9IDxjdXJyZW50TW9kYWwudGVtcGxhdGUgLz47XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgbW9kYWxQcm9wcyA9IGN1cnJlbnRNb2RhbC5tb2RhbFByb3BzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChjdXJyZW50TW9kYWwpIHtcbiAgICAgICAgICBjYXNlIERBVEFfVEFCTEVfSUQ6XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGNvbnRhaW5lclcgKiAwLjk7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IChcbiAgICAgICAgICAgICAgPERhdGFUYWJsZU1vZGFsXG4gICAgICAgICAgICAgICAgd2lkdGg9e2NvbnRhaW5lclcgKiAwLjl9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXtjb250YWluZXJIICogMC44NX1cbiAgICAgICAgICAgICAgICBkYXRhc2V0cz17ZGF0YXNldHN9XG4gICAgICAgICAgICAgICAgZGF0YUlkPXtlZGl0aW5nRGF0YXNldH1cbiAgICAgICAgICAgICAgICBzaG93RGF0YXNldFRhYmxlPXt2aXNTdGF0ZUFjdGlvbnMuc2hvd0RhdGFzZXRUYWJsZX1cbiAgICAgICAgICAgICAgICBzb3J0VGFibGVDb2x1bW49e3Zpc1N0YXRlQWN0aW9ucy5zb3J0VGFibGVDb2x1bW59XG4gICAgICAgICAgICAgICAgcGluVGFibGVDb2x1bW49e3Zpc1N0YXRlQWN0aW9ucy5waW5UYWJsZUNvbHVtbn1cbiAgICAgICAgICAgICAgICBjb3B5VGFibGVDb2x1bW49e3Zpc1N0YXRlQWN0aW9ucy5jb3B5VGFibGVDb2x1bW59XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB3ZSBuZWVkIHRvIG1ha2UgdGhpcyB3aWR0aCBjb25zaXN0ZW50IHdpdGggdGhlIGNzcyBydWxlIGRlZmluZWQgbW9kYWwuanM6MzIgbWF4LXdpZHRoOiA3MHZ3XG4gICAgICAgICAgICBtb2RhbFByb3BzLmNzc1N0eWxlID0gY3NzYFxuICAgICAgICAgICAgICAke0RhdGFUYWJsZU1vZGFsU3R5bGV9O1xuICAgICAgICAgICAgICAke21lZGlhLnBhbG1gXG4gICAgICAgICAgICAgICAgd2lkdGg6ICR7d2lkdGh9cHg7XG4gICAgICAgICAgICAgIGB9XG4gICAgICAgICAgICBgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBERUxFVEVfREFUQV9JRDpcbiAgICAgICAgICAgIC8vIHZhbGlkYXRlIG9wdGlvbnNcbiAgICAgICAgICAgIGlmIChkYXRhc2V0S2V5VG9SZW1vdmUgJiYgZGF0YXNldHMgJiYgZGF0YXNldHNbZGF0YXNldEtleVRvUmVtb3ZlXSkge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IChcbiAgICAgICAgICAgICAgICA8RGVsZXRlRGF0YXNldE1vZGFsIGRhdGFzZXQ9e2RhdGFzZXRzW2RhdGFzZXRLZXlUb1JlbW92ZV19IGxheWVycz17bGF5ZXJzfSAvPlxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBtb2RhbFByb3BzID0ge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnbW9kYWwudGl0bGUuZGVsZXRlRGF0YXNldCcsXG4gICAgICAgICAgICAgICAgY3NzU3R5bGU6IHNtYWxsTW9kYWxDc3MsXG4gICAgICAgICAgICAgICAgZm9vdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIG9uQ29uZmlybTogKCkgPT4gdGhpcy5fZGVsZXRlRGF0YXNldChkYXRhc2V0S2V5VG9SZW1vdmUpLFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiB0aGlzLl9jbG9zZU1vZGFsLFxuICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b246IHtcbiAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgbGFyZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJ21vZGFsLmJ1dHRvbi5kZWxldGUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7IC8vIGluIGNhc2Ugd2UgYWRkIGEgbmV3IGNhc2UgYWZ0ZXIgdGhpcyBvbmVcbiAgICAgICAgICBjYXNlIEFERF9EQVRBX0lEOlxuICAgICAgICAgICAgdGVtcGxhdGUgPSAoXG4gICAgICAgICAgICAgIDxMb2FkRGF0YU1vZGFsXG4gICAgICAgICAgICAgICAgey4uLnByb3ZpZGVyU3RhdGV9XG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5fY2xvc2VNb2RhbH1cbiAgICAgICAgICAgICAgICBvbkZpbGVVcGxvYWQ9e3RoaXMuX29uRmlsZVVwbG9hZH1cbiAgICAgICAgICAgICAgICBvbkxvYWRDbG91ZE1hcD17dGhpcy5fb25Mb2FkQ2xvdWRNYXB9XG4gICAgICAgICAgICAgICAgY2xvdWRQcm92aWRlcnM9e3RoaXMucHJvdmlkZXJXaXRoU3RvcmFnZSh0aGlzLnByb3BzKX1cbiAgICAgICAgICAgICAgICBvblNldENsb3VkUHJvdmlkZXI9e3RoaXMucHJvcHMucHJvdmlkZXJBY3Rpb25zLnNldENsb3VkUHJvdmlkZXJ9XG4gICAgICAgICAgICAgICAgZ2V0U2F2ZWRNYXBzPXt0aGlzLnByb3BzLnByb3ZpZGVyQWN0aW9ucy5nZXRTYXZlZE1hcHN9XG4gICAgICAgICAgICAgICAgbG9hZEZpbGVzPXt1aVN0YXRlLmxvYWRGaWxlc31cbiAgICAgICAgICAgICAgICBmaWxlTG9hZGluZz17dmlzU3RhdGUuZmlsZUxvYWRpbmd9XG4gICAgICAgICAgICAgICAgZmlsZUxvYWRpbmdQcm9ncmVzcz17dmlzU3RhdGUuZmlsZUxvYWRpbmdQcm9ncmVzc31cbiAgICAgICAgICAgICAgICBmaWxlRm9ybWF0TmFtZXM9e2dldEZpbGVGb3JtYXROYW1lcyh0aGlzLnByb3BzLnZpc1N0YXRlKX1cbiAgICAgICAgICAgICAgICBmaWxlRXh0ZW5zaW9ucz17Z2V0RmlsZUV4dGVuc2lvbnModGhpcy5wcm9wcy52aXNTdGF0ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbW9kYWxQcm9wcyA9IHtcbiAgICAgICAgICAgICAgdGl0bGU6ICdtb2RhbC50aXRsZS5hZGREYXRhVG9NYXAnLFxuICAgICAgICAgICAgICBjc3NTdHlsZTogTG9hZERhdGFNb2RhbFN0eWxlLFxuICAgICAgICAgICAgICBmb290ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNvbmZpcm06IHRoaXMuX2Nsb3NlTW9kYWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEVYUE9SVF9JTUFHRV9JRDpcbiAgICAgICAgICAgIHRlbXBsYXRlID0gKFxuICAgICAgICAgICAgICA8RXhwb3J0SW1hZ2VNb2RhbFxuICAgICAgICAgICAgICAgIGV4cG9ydEltYWdlPXt1aVN0YXRlLmV4cG9ydEltYWdlfVxuICAgICAgICAgICAgICAgIG1hcFc9e2NvbnRhaW5lcld9XG4gICAgICAgICAgICAgICAgbWFwSD17Y29udGFpbmVySH1cbiAgICAgICAgICAgICAgICBvblVwZGF0ZUltYWdlU2V0dGluZz17dWlTdGF0ZUFjdGlvbnMuc2V0RXhwb3J0SW1hZ2VTZXR0aW5nfVxuICAgICAgICAgICAgICAgIGNsZWFudXBFeHBvcnRJbWFnZT17dWlTdGF0ZUFjdGlvbnMuY2xlYW51cEV4cG9ydEltYWdlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1vZGFsUHJvcHMgPSB7XG4gICAgICAgICAgICAgIHRpdGxlOiAnbW9kYWwudGl0bGUuZXhwb3J0SW1hZ2UnLFxuICAgICAgICAgICAgICBjc3NTdHlsZTogJycsXG4gICAgICAgICAgICAgIGZvb3RlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgb25DYW5jZWw6IHRoaXMuX2Nsb3NlTW9kYWwsXG4gICAgICAgICAgICAgIG9uQ29uZmlybTogdGhpcy5fb25FeHBvcnRJbWFnZSxcbiAgICAgICAgICAgICAgY29uZmlybUJ1dHRvbjoge1xuICAgICAgICAgICAgICAgIGxhcmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB1aVN0YXRlLmV4cG9ydEltYWdlLnByb2Nlc3NpbmcsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46ICdtb2RhbC5idXR0b24uZG93bmxvYWQnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEVYUE9SVF9EQVRBX0lEOlxuICAgICAgICAgICAgdGVtcGxhdGUgPSAoXG4gICAgICAgICAgICAgIDxFeHBvcnREYXRhTW9kYWxcbiAgICAgICAgICAgICAgICB7Li4udWlTdGF0ZS5leHBvcnREYXRhfVxuICAgICAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgICAgICBhcHBseUNQVUZpbHRlcj17dGhpcy5wcm9wcy52aXNTdGF0ZUFjdGlvbnMuYXBwbHlDUFVGaWx0ZXJ9XG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5fY2xvc2VNb2RhbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZUV4cG9ydERhdGFUeXBlPXt1aVN0YXRlQWN0aW9ucy5zZXRFeHBvcnREYXRhVHlwZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZUV4cG9ydFNlbGVjdGVkRGF0YXNldD17dWlTdGF0ZUFjdGlvbnMuc2V0RXhwb3J0U2VsZWN0ZWREYXRhc2V0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlRXhwb3J0RmlsdGVyZWQ9e3VpU3RhdGVBY3Rpb25zLnNldEV4cG9ydEZpbHRlcmVkfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1vZGFsUHJvcHMgPSB7XG4gICAgICAgICAgICAgIHRpdGxlOiAnbW9kYWwudGl0bGUuZXhwb3J0RGF0YScsXG4gICAgICAgICAgICAgIGNzc1N0eWxlOiAnJyxcbiAgICAgICAgICAgICAgZm9vdGVyOiB0cnVlLFxuICAgICAgICAgICAgICBvbkNhbmNlbDogdGhpcy5fY2xvc2VNb2RhbCxcbiAgICAgICAgICAgICAgb25Db25maXJtOiB0aGlzLl9vbkV4cG9ydERhdGEsXG4gICAgICAgICAgICAgIGNvbmZpcm1CdXR0b246IHtcbiAgICAgICAgICAgICAgICBsYXJnZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogJ21vZGFsLmJ1dHRvbi5leHBvcnQnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEVYUE9SVF9NQVBfSUQ6XG4gICAgICAgICAgICBjb25zdCBrZXBsZXJHbENvbmZpZyA9IHZpc1N0YXRlLnNjaGVtYS5nZXRDb25maWdUb1NhdmUoe1xuICAgICAgICAgICAgICBtYXBTdHlsZSxcbiAgICAgICAgICAgICAgdmlzU3RhdGUsXG4gICAgICAgICAgICAgIG1hcFN0YXRlLFxuICAgICAgICAgICAgICB1aVN0YXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gKFxuICAgICAgICAgICAgICA8RXhwb3J0TWFwTW9kYWxcbiAgICAgICAgICAgICAgICBjb25maWc9e2tlcGxlckdsQ29uZmlnfVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e3VpU3RhdGUuZXhwb3J0TWFwfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlRXhwb3J0TWFwRm9ybWF0PXt1aVN0YXRlQWN0aW9ucy5zZXRFeHBvcnRNYXBGb3JtYXR9XG4gICAgICAgICAgICAgICAgb25FZGl0VXNlck1hcGJveEFjY2Vzc1Rva2VuPXt1aVN0YXRlQWN0aW9ucy5zZXRVc2VyTWFwYm94QWNjZXNzVG9rZW59XG4gICAgICAgICAgICAgICAgb25DaGFuZ2VFeHBvcnRNYXBIVE1MTW9kZT17dWlTdGF0ZUFjdGlvbnMuc2V0RXhwb3J0SFRNTE1hcE1vZGV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbW9kYWxQcm9wcyA9IHtcbiAgICAgICAgICAgICAgdGl0bGU6ICdtb2RhbC50aXRsZS5leHBvcnRNYXAnLFxuICAgICAgICAgICAgICBjc3NTdHlsZTogJycsXG4gICAgICAgICAgICAgIGZvb3RlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgb25DYW5jZWw6IHRoaXMuX2Nsb3NlTW9kYWwsXG4gICAgICAgICAgICAgIG9uQ29uZmlybTogdGhpcy5fb25FeHBvcnRNYXAsXG4gICAgICAgICAgICAgIGNvbmZpcm1CdXR0b246IHtcbiAgICAgICAgICAgICAgICBsYXJnZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogJ21vZGFsLmJ1dHRvbi5leHBvcnQnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFERF9NQVBfU1RZTEVfSUQ6XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IChcbiAgICAgICAgICAgICAgPEFkZE1hcFN0eWxlTW9kYWxcbiAgICAgICAgICAgICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbj17dGhpcy5wcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbn1cbiAgICAgICAgICAgICAgICBtYXBib3hBcGlVcmw9e3RoaXMucHJvcHMubWFwYm94QXBpVXJsfVxuICAgICAgICAgICAgICAgIG1hcFN0YXRlPXt0aGlzLnByb3BzLm1hcFN0YXRlfVxuICAgICAgICAgICAgICAgIGlucHV0U3R5bGU9e21hcFN0eWxlLmlucHV0U3R5bGV9XG4gICAgICAgICAgICAgICAgaW5wdXRNYXBTdHlsZT17dGhpcy5wcm9wcy5tYXBTdHlsZUFjdGlvbnMuaW5wdXRNYXBTdHlsZX1cbiAgICAgICAgICAgICAgICBsb2FkQ3VzdG9tTWFwU3R5bGU9e3RoaXMucHJvcHMubWFwU3R5bGVBY3Rpb25zLmxvYWRDdXN0b21NYXBTdHlsZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtb2RhbFByb3BzID0ge1xuICAgICAgICAgICAgICB0aXRsZTogJ21vZGFsLnRpdGxlLmFkZEN1c3RvbU1hcGJveFN0eWxlJyxcbiAgICAgICAgICAgICAgY3NzU3R5bGU6ICcnLFxuICAgICAgICAgICAgICBmb290ZXI6IHRydWUsXG4gICAgICAgICAgICAgIG9uQ2FuY2VsOiB0aGlzLl9jbG9zZU1vZGFsLFxuICAgICAgICAgICAgICBvbkNvbmZpcm06IHRoaXMuX29uQWRkQ3VzdG9tTWFwU3R5bGUsXG4gICAgICAgICAgICAgIGNvbmZpcm1CdXR0b246IHtcbiAgICAgICAgICAgICAgICBsYXJnZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogIW1hcFN0eWxlLmlucHV0U3R5bGUuc3R5bGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46ICdtb2RhbC5idXR0b24uYWRkU3R5bGUnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFNBVkVfTUFQX0lEOlxuICAgICAgICAgICAgdGVtcGxhdGUgPSAoXG4gICAgICAgICAgICAgIDxTYXZlTWFwTW9kYWxcbiAgICAgICAgICAgICAgICB7Li4ucHJvdmlkZXJTdGF0ZX1cbiAgICAgICAgICAgICAgICBleHBvcnRJbWFnZT17dWlTdGF0ZS5leHBvcnRJbWFnZX1cbiAgICAgICAgICAgICAgICBtYXBJbmZvPXt2aXNTdGF0ZS5tYXBJbmZvfVxuICAgICAgICAgICAgICAgIG9uU2V0TWFwSW5mbz17dmlzU3RhdGVBY3Rpb25zLnNldE1hcEluZm99XG4gICAgICAgICAgICAgICAgY2xvdWRQcm92aWRlcnM9e3RoaXMucHJvdmlkZXJXaXRoU3RvcmFnZSh0aGlzLnByb3BzKX1cbiAgICAgICAgICAgICAgICBvblNldENsb3VkUHJvdmlkZXI9e3RoaXMucHJvcHMucHJvdmlkZXJBY3Rpb25zLnNldENsb3VkUHJvdmlkZXJ9XG4gICAgICAgICAgICAgICAgY2xlYW51cEV4cG9ydEltYWdlPXt1aVN0YXRlQWN0aW9ucy5jbGVhbnVwRXhwb3J0SW1hZ2V9XG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbWFnZVNldHRpbmc9e3VpU3RhdGVBY3Rpb25zLnNldEV4cG9ydEltYWdlU2V0dGluZ31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtb2RhbFByb3BzID0ge1xuICAgICAgICAgICAgICB0aXRsZTogJ21vZGFsLnRpdGxlLnNhdmVNYXAnLFxuICAgICAgICAgICAgICBjc3NTdHlsZTogJycsXG4gICAgICAgICAgICAgIGZvb3RlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgb25DYW5jZWw6IHRoaXMuX2Nsb3NlTW9kYWwsXG4gICAgICAgICAgICAgIG9uQ29uZmlybTogKCkgPT4gdGhpcy5fb25TYXZlTWFwKGZhbHNlKSxcbiAgICAgICAgICAgICAgY29uZmlybUJ1dHRvbjoge1xuICAgICAgICAgICAgICAgIGxhcmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOlxuICAgICAgICAgICAgICAgICAgdWlTdGF0ZS5leHBvcnRJbWFnZS5wcm9jZXNzaW5nIHx8XG4gICAgICAgICAgICAgICAgICAhaXNWYWxpZE1hcEluZm8odmlzU3RhdGUubWFwSW5mbykgfHxcbiAgICAgICAgICAgICAgICAgICFwcm92aWRlclN0YXRlLmN1cnJlbnRQcm92aWRlcixcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogJ21vZGFsLmJ1dHRvbi5zYXZlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBPVkVSV1JJVEVfTUFQX0lEOlxuICAgICAgICAgICAgdGVtcGxhdGUgPSAoXG4gICAgICAgICAgICAgIDxPdmVyV3JpdGVNYXBNb2RhbFxuICAgICAgICAgICAgICAgIHsuLi5wcm92aWRlclN0YXRlfVxuICAgICAgICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXt0aGlzLnByb3BzLmNsb3VkUHJvdmlkZXJzfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtnZXQodmlzU3RhdGUsIFsnbWFwSW5mbycsICd0aXRsZSddKX1cbiAgICAgICAgICAgICAgICBvblNldENsb3VkUHJvdmlkZXI9e3RoaXMucHJvcHMucHJvdmlkZXJBY3Rpb25zLnNldENsb3VkUHJvdmlkZXJ9XG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbWFnZVNldHRpbmc9e3VpU3RhdGVBY3Rpb25zLnNldEV4cG9ydEltYWdlU2V0dGluZ31cbiAgICAgICAgICAgICAgICBjbGVhbnVwRXhwb3J0SW1hZ2U9e3VpU3RhdGVBY3Rpb25zLmNsZWFudXBFeHBvcnRJbWFnZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtb2RhbFByb3BzID0ge1xuICAgICAgICAgICAgICB0aXRsZTogJ092ZXJ3cml0ZSBFeGlzdGluZyBGaWxlPycsXG4gICAgICAgICAgICAgIGNzc1N0eWxlOiBzbWFsbE1vZGFsQ3NzLFxuICAgICAgICAgICAgICBmb290ZXI6IHRydWUsXG4gICAgICAgICAgICAgIG9uQ29uZmlybTogdGhpcy5fb25PdmVyd3JpdGVNYXAsXG4gICAgICAgICAgICAgIG9uQ2FuY2VsOiB0aGlzLl9jbG9zZU1vZGFsLFxuICAgICAgICAgICAgICBjb25maXJtQnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgbGFyZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46ICdZZXMnLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOlxuICAgICAgICAgICAgICAgICAgdWlTdGF0ZS5leHBvcnRJbWFnZS5wcm9jZXNzaW5nIHx8XG4gICAgICAgICAgICAgICAgICAhaXNWYWxpZE1hcEluZm8odmlzU3RhdGUubWFwSW5mbykgfHxcbiAgICAgICAgICAgICAgICAgICFwcm92aWRlclN0YXRlLmN1cnJlbnRQcm92aWRlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBTSEFSRV9NQVBfSUQ6XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IChcbiAgICAgICAgICAgICAgPFNoYXJlTWFwTW9kYWxcbiAgICAgICAgICAgICAgICB7Li4ucHJvdmlkZXJTdGF0ZX1cbiAgICAgICAgICAgICAgICBpc1JlYWR5PXshdWlTdGF0ZS5leHBvcnRJbWFnZS5wcm9jZXNzaW5nfVxuICAgICAgICAgICAgICAgIGNsb3VkUHJvdmlkZXJzPXt0aGlzLnByb3ZpZGVyV2l0aFNoYXJlKHRoaXMucHJvcHMpfVxuICAgICAgICAgICAgICAgIG9uRXhwb3J0PXt0aGlzLl9vblNoYXJlTWFwVXJsfVxuICAgICAgICAgICAgICAgIG9uU2V0Q2xvdWRQcm92aWRlcj17dGhpcy5wcm9wcy5wcm92aWRlckFjdGlvbnMuc2V0Q2xvdWRQcm92aWRlcn1cbiAgICAgICAgICAgICAgICBjbGVhbnVwRXhwb3J0SW1hZ2U9e3VpU3RhdGVBY3Rpb25zLmNsZWFudXBFeHBvcnRJbWFnZX1cbiAgICAgICAgICAgICAgICBvblVwZGF0ZUltYWdlU2V0dGluZz17dWlTdGF0ZUFjdGlvbnMuc2V0RXhwb3J0SW1hZ2VTZXR0aW5nfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1vZGFsUHJvcHMgPSB7XG4gICAgICAgICAgICAgIHRpdGxlOiAnbW9kYWwudGl0bGUuc2hhcmVVUkwnLFxuICAgICAgICAgICAgICBjc3NTdHlsZTogJycsXG4gICAgICAgICAgICAgIG9uQ2FuY2VsOiB0aGlzLl9vbkNsb3NlU2F2ZU1hcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb290Tm9kZSA/IChcbiAgICAgICAgPE1vZGFsRGlhbG9nXG4gICAgICAgICAgcGFyZW50U2VsZWN0b3I9eygpID0+IGZpbmRET01Ob2RlKHJvb3ROb2RlKX1cbiAgICAgICAgICBpc09wZW49e0Jvb2xlYW4oY3VycmVudE1vZGFsKX1cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fY2xvc2VNb2RhbH1cbiAgICAgICAgICB7Li4ubW9kYWxQcm9wc31cbiAgICAgICAgICBjc3NTdHlsZT17RGVmYXVsdFN0eWxlLmNvbmNhdChtb2RhbFByb3BzLmNzc1N0eWxlKX1cbiAgICAgICAgPlxuICAgICAgICAgIHt0ZW1wbGF0ZX1cbiAgICAgICAgPC9Nb2RhbERpYWxvZz5cbiAgICAgICkgOiBudWxsO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cbiAgfVxuXG4gIHJldHVybiBNb2RhbENvbnRhaW5lcjtcbn1cbiJdfQ==