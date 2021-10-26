"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLocaleUpdater = exports.toggleSplitMapUpdater = exports.loadFilesErrUpdater = exports.loadFilesSuccessUpdater = exports.loadFilesUpdater = exports.removeNotificationUpdater = exports.addNotificationUpdater = exports.setExportMapHTMLModeUpdater = exports.setExportMapFormatUpdater = exports.setUserMapboxAccessTokenUpdater = exports.setExportDataUpdater = exports.setExportFilteredUpdater = exports.setExportDataTypeUpdater = exports.setExportSelectedDatasetUpdater = exports.startExportingImageUpdater = exports.cleanupExportImageUpdater = exports.setExportImageErrorUpdater = exports.setExportImageDataUriUpdater = exports.setExportImageSettingUpdater = exports.openDeleteModalUpdater = exports.toggleMapControlUpdater = exports.hideExportDropdownUpdater = exports.showExportDropdownUpdater = exports.toggleModalUpdater = exports.toggleSidePanelUpdater = exports.initUiStateUpdater = exports.INITIAL_UI_STATE = exports.DEFAULT_EXPORT_MAP = exports.DEFAULT_EXPORT_JSON = exports.DEFAULT_EXPORT_HTML = exports.DEFAULT_NOTIFICATIONS = exports.DEFAULT_EXPORT_DATA = exports.DEFAULT_LOAD_FILES = exports.DEFAULT_EXPORT_IMAGE = exports.DEFAULT_MAP_CONTROLS = exports.DEFAULT_MODAL = exports.DEFAULT_ACTIVE_SIDE_PANEL = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _defaultSettings = require("../constants/default-settings");

var _locales = require("../localization/locales");

var _notificationsUtils = require("../utils/notifications-utils");

var _exportUtils = require("../utils/export-utils");

var _composerHelpers = require("./composer-helpers");

var _DEFAULT_EXPORT_MAP;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_ACTIVE_SIDE_PANEL = 'layer';
exports.DEFAULT_ACTIVE_SIDE_PANEL = DEFAULT_ACTIVE_SIDE_PANEL;
var DEFAULT_MODAL = _defaultSettings.ADD_DATA_ID;
/**
 * Updaters for `uiState` reducer. Can be used in your root reducer to directly modify kepler.gl's state.
 * Read more about [Using updaters](../advanced-usage/using-updaters.md)
 *
 * @public
 * @example
 *
 * import keplerGlReducer, {uiStateUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    // click button to close side panel
 *    case 'CLICK_BUTTON':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          foo: {
 *             ...state.keplerGl.foo,
 *             uiState: uiStateUpdaters.toggleSidePanelUpdater(
 *               uiState, {payload: null}
 *             )
 *          }
 *        }
 *      };
 *  }
 *  return reducers(state, action);
 * };
 *
 * export default composedReducer;
 */

/* eslint-disable no-unused-vars */

exports.DEFAULT_MODAL = DEFAULT_MODAL;
var uiStateUpdaters = null;
/* eslint-enable no-unused-vars */

var DEFAULT_MAP_CONTROLS_FEATURES = {
  show: true,
  active: false,
  // defines which map index users are interacting with (through map controls)
  activeMapIndex: 0
};
/**
 * A list of map control visibility and whether is it active.
 * @memberof uiStateUpdaters
 * @constant
 * @property visibleLayers Default: `{show: true, active: false}`
 * @property mapLegend Default: `{show: true, active: false}`
 * @property toggle3d Default: `{show: true}`
 * @property splitMap Default: `{show: true}`
 * @property mapDraw Default: `{show: true, active: false}`
 * @property mapLocale Default: `{show: false, active: false}`
 * @type {import('./ui-state-updaters').MapControls}
 * @public
 */

var DEFAULT_MAP_CONTROLS = ['visibleLayers', 'mapLegend', 'toggle3d', 'splitMap', 'mapDraw', 'mapLocale'].reduce(function (_final, current) {
  return _objectSpread(_objectSpread({}, _final), {}, (0, _defineProperty2["default"])({}, current, DEFAULT_MAP_CONTROLS_FEATURES));
}, {});
/**
 * Default image export config
 * @memberof uiStateUpdaters
 * @constant
 * @property ratio Default: `'SCREEN'`,
 * @property resolution Default: `'ONE_X'`,
 * @property legend Default: `false`,
 * @property mapH Default: 0,
 * @property mapW Default: 0,
 * @property imageSize Default: {zoomOffset: 0, scale: 1, imageW: 0, imageH: 0},
 * @property imageDataUri Default: `''`,
 * @property exporting Default: `false`
 * @property error Default: `false`
 * @type {import('./ui-state-updaters').ExportImage}
 * @public
 */

exports.DEFAULT_MAP_CONTROLS = DEFAULT_MAP_CONTROLS;
var DEFAULT_EXPORT_IMAGE = {
  // user options
  ratio: _defaultSettings.EXPORT_IMG_RATIOS.SCREEN,
  resolution: _defaultSettings.RESOLUTIONS.ONE_X,
  legend: false,
  mapH: 0,
  mapW: 0,
  imageSize: {
    zoomOffset: 0,
    scale: 1,
    imageW: 0,
    imageH: 0
  },
  // when this is set to true, the mock map viewport will move to the center of data
  center: false,
  // exporting state
  imageDataUri: '',
  // exporting: used to attach plot-container to dom
  exporting: false,
  // processing: used as loading indicator when export image is being produced
  processing: false,
  error: false
};
exports.DEFAULT_EXPORT_IMAGE = DEFAULT_EXPORT_IMAGE;
var DEFAULT_LOAD_FILES = {
  fileLoading: false
};
/**
 * Default initial `exportData` settings
 * @memberof uiStateUpdaters
 * @constant
 * @property selectedDataset Default: `''`,
 * @property dataType Default: `'csv'`,
 * @property filtered Default: `true`,
 * @type {import('./ui-state-updaters').ExportData}
 * @public
 */

exports.DEFAULT_LOAD_FILES = DEFAULT_LOAD_FILES;
var DEFAULT_EXPORT_DATA = {
  selectedDataset: '',
  dataType: _defaultSettings.EXPORT_DATA_TYPE.CSV,
  filtered: true
};
/**
 * @constant
 */

exports.DEFAULT_EXPORT_DATA = DEFAULT_EXPORT_DATA;
var DEFAULT_NOTIFICATIONS = [];
/**
 * @constant
 * @property exportMapboxAccessToken - Default: null, this is used when we provide a default mapbox token for users to take advantage of
 * @property userMapboxToken - Default: '', mapbox token provided by user through input field
 * @property mode - Default: 'READ', read only or editable
 * @type {import('./ui-state-updaters').ExportHtml}
 * @public
 */

exports.DEFAULT_NOTIFICATIONS = DEFAULT_NOTIFICATIONS;
var DEFAULT_EXPORT_HTML = {
  exportMapboxAccessToken: null,
  userMapboxToken: '',
  mode: _defaultSettings.EXPORT_HTML_MAP_MODES.READ
};
/**
 * @constant
 * @property hasData - Default: 'true',
 * @type {import('./ui-state-updaters').ExportJson}
 * @public
 */

exports.DEFAULT_EXPORT_HTML = DEFAULT_EXPORT_HTML;
var DEFAULT_EXPORT_JSON = {
  hasData: true
};
/**
 * Export Map Config
 * @constant
 * @property HTML - Default: 'DEFAULT_EXPORT_HTML',
 * @property JSON - Default: 'DEFAULT_EXPORT_JSON',
 * @property format - Default: 'HTML',
 * @type {import('./ui-state-updaters').ExportMap}
 * @public
 */

exports.DEFAULT_EXPORT_JSON = DEFAULT_EXPORT_JSON;
var DEFAULT_EXPORT_MAP = (_DEFAULT_EXPORT_MAP = {}, (0, _defineProperty2["default"])(_DEFAULT_EXPORT_MAP, _defaultSettings.EXPORT_MAP_FORMATS.HTML, DEFAULT_EXPORT_HTML), (0, _defineProperty2["default"])(_DEFAULT_EXPORT_MAP, _defaultSettings.EXPORT_MAP_FORMATS.JSON, DEFAULT_EXPORT_JSON), (0, _defineProperty2["default"])(_DEFAULT_EXPORT_MAP, "format", _defaultSettings.EXPORT_MAP_FORMATS.HTML), _DEFAULT_EXPORT_MAP);
/**
 * Default initial `uiState`
 * @memberof uiStateUpdaters
 * @constant
 * @property readOnly Default: `false`
 * @property activeSidePanel Default: `'layer'`
 * @property currentModal Default: `'addData'`
 * @property datasetKeyToRemove Default: `null`
 * @property visibleDropdown Default: `null`
 * @property exportImage Default: [`DEFAULT_EXPORT_IMAGE`](#default_export_image)
 * @property exportData Default: [`DEFAULT_EXPORT_DATA`](#default_export_data)
 * @property exportMap Default: [`DEFAULT_EXPORT_MAP`](#default_export_map)
 * @property mapControls Default: [`DEFAULT_MAP_CONTROLS`](#default_map_controls)
 * @property notifications Default: `[]`
 * @property notifications Default: `[]`
 * @property loadFiles
 * @type {import('./ui-state-updaters').UiState}
 * @public
 */

exports.DEFAULT_EXPORT_MAP = DEFAULT_EXPORT_MAP;
var INITIAL_UI_STATE = {
  readOnly: false,
  activeSidePanel: DEFAULT_ACTIVE_SIDE_PANEL,
  currentModal: DEFAULT_MODAL,
  datasetKeyToRemove: null,
  visibleDropdown: null,
  // export image modal ui
  exportImage: DEFAULT_EXPORT_IMAGE,
  // export data modal ui
  exportData: DEFAULT_EXPORT_DATA,
  // html export
  exportMap: DEFAULT_EXPORT_MAP,
  // map control panels
  mapControls: DEFAULT_MAP_CONTROLS,
  // ui notifications
  notifications: DEFAULT_NOTIFICATIONS,
  // load files
  loadFiles: DEFAULT_LOAD_FILES,
  // Locale of the UI
  locale: _locales.LOCALE_CODES.en
};
/* Updaters */

/**
 * @memberof uiStateUpdaters

 */

exports.INITIAL_UI_STATE = INITIAL_UI_STATE;

var initUiStateUpdater = function initUiStateUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), (action.payload || {}).initialUiState);
};
/**
 * Toggle active side panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload id of side panel to be shown, one of `layer`, `filter`, `interaction`, `map`. close side panel if `null`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleSidePanelUpdater}
 * @public
 */


exports.initUiStateUpdater = initUiStateUpdater;

var toggleSidePanelUpdater = function toggleSidePanelUpdater(state, _ref) {
  var id = _ref.payload;
  return id === state.activeSidePanel ? state : _objectSpread(_objectSpread({}, state), {}, {
    activeSidePanel: id
  });
};
/**
 * Show and hide modal dialog
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @paramaction.payload id of modal to be shown, null to hide modals. One of:
 *  - [`DATA_TABLE_ID`](../constants/default-settings.md#data_table_id)
 *  - [`DELETE_DATA_ID`](../constants/default-settings.md#delete_data_id)
 *  - [`ADD_DATA_ID`](../constants/default-settings.md#add_data_id)
 *  - [`EXPORT_IMAGE_ID`](../constants/default-settings.md#export_image_id)
 *  - [`EXPORT_DATA_ID`](../constants/default-settings.md#export_data_id)
 *  - [`ADD_MAP_STYLE_ID`](../constants/default-settings.md#add_map_style_id)
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleModalUpdater}
 * @public
 */


exports.toggleSidePanelUpdater = toggleSidePanelUpdater;

var toggleModalUpdater = function toggleModalUpdater(state, _ref2) {
  var id = _ref2.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    currentModal: id
  });
};
/**
 * Hide and show side panel header dropdown, activated by clicking the share link on top of the side panel
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').showExportDropdownUpdater}
 * @public
 */


exports.toggleModalUpdater = toggleModalUpdater;

var showExportDropdownUpdater = function showExportDropdownUpdater(state, _ref3) {
  var id = _ref3.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    visibleDropdown: id
  });
};
/**
 * Hide side panel header dropdown, activated by clicking the share link on top of the side panel
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').hideExportDropdownUpdater}
 * @public
 */


exports.showExportDropdownUpdater = showExportDropdownUpdater;

var hideExportDropdownUpdater = function hideExportDropdownUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    visibleDropdown: null
  });
};
/**
 * Toggle active map control panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action action
 * @param action.payload map control panel id, one of the keys of: [`DEFAULT_MAP_CONTROLS`](#default_map_controls)
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleMapControlUpdater}
 * @public
 */


exports.hideExportDropdownUpdater = hideExportDropdownUpdater;

var toggleMapControlUpdater = function toggleMapControlUpdater(state, _ref4) {
  var _ref4$payload = _ref4.payload,
      panelId = _ref4$payload.panelId,
      _ref4$payload$index = _ref4$payload.index,
      index = _ref4$payload$index === void 0 ? 0 : _ref4$payload$index;
  return _objectSpread(_objectSpread({}, state), {}, {
    mapControls: _objectSpread(_objectSpread({}, state.mapControls), {}, (0, _defineProperty2["default"])({}, panelId, _objectSpread(_objectSpread({}, state.mapControls[panelId]), {}, {
      // this handles split map interaction
      // Toggling from within the same map will simply toggle the active property
      // Toggling from within different maps we set the active property to true
      active: index === state.mapControls[panelId].activeMapIndex ? !state.mapControls[panelId].active : true,
      activeMapIndex: index
    })))
  });
};
/**
 * Toggle active map control panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload dataset id
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').openDeleteModalUpdater}
 * @public
 */


exports.toggleMapControlUpdater = toggleMapControlUpdater;

var openDeleteModalUpdater = function openDeleteModalUpdater(state, _ref5) {
  var datasetKeyToRemove = _ref5.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    currentModal: _defaultSettings.DELETE_DATA_ID,
    datasetKeyToRemove: datasetKeyToRemove
  });
};
/**
 * Set `exportImage.legend` to `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportImageSettingUpdater}
 * @public
 */


exports.openDeleteModalUpdater = openDeleteModalUpdater;

var setExportImageSettingUpdater = function setExportImageSettingUpdater(state, _ref6) {
  var newSetting = _ref6.payload;

  var updated = _objectSpread(_objectSpread({}, state.exportImage), newSetting);

  var imageSize = (0, _exportUtils.calculateExportImageSize)(updated) || state.exportImage.imageSize;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportImage: _objectSpread(_objectSpread({}, updated), {}, {
      imageSize: imageSize
    })
  });
};
/**
 * Set `exportImage.setExportImageDataUri` to a image dataUri
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload export image data uri
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportImageDataUriUpdater}
 * @public
 */


exports.setExportImageSettingUpdater = setExportImageSettingUpdater;

var setExportImageDataUriUpdater = function setExportImageDataUriUpdater(state, _ref7) {
  var dataUri = _ref7.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportImage: _objectSpread(_objectSpread({}, state.exportImage), {}, {
      processing: false,
      imageDataUri: dataUri
    })
  });
};
/**
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').setExportImageErrorUpdater}
 * @public
 */


exports.setExportImageDataUriUpdater = setExportImageDataUriUpdater;

var setExportImageErrorUpdater = function setExportImageErrorUpdater(state, _ref8) {
  var error = _ref8.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportImage: _objectSpread(_objectSpread({}, state.exportImage), {}, {
      processing: false,
      error: error
    })
  });
};
/**
 * Delete cached export image
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').cleanupExportImageUpdater}
 * @public
 */


exports.setExportImageErrorUpdater = setExportImageErrorUpdater;

var cleanupExportImageUpdater = function cleanupExportImageUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    exportImage: _objectSpread(_objectSpread({}, state.exportImage), {}, {
      exporting: false,
      imageDataUri: '',
      error: false,
      processing: false,
      center: false
    })
  });
};
/**
 * Start image exporting flow
 * @memberof uiStateUpdaters
 * @param state
 * @param options
 * @returns {UiState}
 * @type {typeof import('./ui-state-updaters').startExportingImage}
 * @public
 */


exports.cleanupExportImageUpdater = cleanupExportImageUpdater;

var startExportingImageUpdater = function startExportingImageUpdater(state, _ref9) {
  var _ref9$payload = _ref9.payload,
      options = _ref9$payload === void 0 ? {} : _ref9$payload;

  var imageSettings = _objectSpread(_objectSpread({}, options), {}, {
    exporting: true
  });

  return (0, _composerHelpers.compose_)([cleanupExportImageUpdater, (0, _composerHelpers.apply_)(setExportImageSettingUpdater, (0, _composerHelpers.payload_)(imageSettings))])(state);
};
/**
 * Set selected dataset for export
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload dataset id
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportSelectedDatasetUpdater}
 * @public
 */


exports.startExportingImageUpdater = startExportingImageUpdater;

var setExportSelectedDatasetUpdater = function setExportSelectedDatasetUpdater(state, _ref10) {
  var dataset = _ref10.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportData: _objectSpread(_objectSpread({}, state.exportData), {}, {
      selectedDataset: dataset
    })
  });
};
/**
 * Set data format for exporting data
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload one of `'text/csv'`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportDataTypeUpdater}
 * @public
 */


exports.setExportSelectedDatasetUpdater = setExportSelectedDatasetUpdater;

var setExportDataTypeUpdater = function setExportDataTypeUpdater(state, _ref11) {
  var dataType = _ref11.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportData: _objectSpread(_objectSpread({}, state.exportData), {}, {
      dataType: dataType
    })
  });
};
/**
 * Whether to export filtered data, `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportFilteredUpdater}
 * @public
 */


exports.setExportDataTypeUpdater = setExportDataTypeUpdater;

var setExportFilteredUpdater = function setExportFilteredUpdater(state, _ref12) {
  var filtered = _ref12.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportData: _objectSpread(_objectSpread({}, state.exportData), {}, {
      filtered: filtered
    })
  });
};
/**
 * Whether to including data in map config, toggle between `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportDataUpdater}
 * @public
 */


exports.setExportFilteredUpdater = setExportFilteredUpdater;

var setExportDataUpdater = function setExportDataUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    exportMap: _objectSpread(_objectSpread({}, state.exportMap), {}, (0, _defineProperty2["default"])({}, _defaultSettings.EXPORT_MAP_FORMATS.JSON, _objectSpread(_objectSpread({}, state.exportMap[_defaultSettings.EXPORT_MAP_FORMATS.JSON]), {}, {
      hasData: !state.exportMap[_defaultSettings.EXPORT_MAP_FORMATS.JSON].hasData
    })))
  });
};
/**
 * whether to export a mapbox access to HTML single page
 * @param state - `uiState`
 * @param action
 * @param action.payload
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setUserMapboxAccessTokenUpdater}
 * @public
 */


exports.setExportDataUpdater = setExportDataUpdater;

var setUserMapboxAccessTokenUpdater = function setUserMapboxAccessTokenUpdater(state, _ref13) {
  var userMapboxToken = _ref13.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportMap: _objectSpread(_objectSpread({}, state.exportMap), {}, (0, _defineProperty2["default"])({}, _defaultSettings.EXPORT_MAP_FORMATS.HTML, _objectSpread(_objectSpread({}, state.exportMap[_defaultSettings.EXPORT_MAP_FORMATS.HTML]), {}, {
      userMapboxToken: userMapboxToken
    })))
  });
};
/**
 * Sets the export map format
 * @param state - `uiState`
 * @param action
 * @param action.payload format to use to export the map into
 * @return nextState
 * @type {typeof import('./ui-state-updaters').setExportMapFormatUpdater}
 */


exports.setUserMapboxAccessTokenUpdater = setUserMapboxAccessTokenUpdater;

var setExportMapFormatUpdater = function setExportMapFormatUpdater(state, _ref14) {
  var format = _ref14.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportMap: _objectSpread(_objectSpread({}, state.exportMap), {}, {
      format: format
    })
  });
};
/**
 * Set the export html map mode
 * @param state - `uiState`
 * @param action
 * @param action.payload to be set (available modes: EXPORT_HTML_MAP_MODES)
 * @return nextState
 * @type {typeof import('./ui-state-updaters').setExportMapHTMLModeUpdater}
 */


exports.setExportMapFormatUpdater = setExportMapFormatUpdater;

var setExportMapHTMLModeUpdater = function setExportMapHTMLModeUpdater(state, _ref15) {
  var mode = _ref15.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    exportMap: _objectSpread(_objectSpread({}, state.exportMap), {}, (0, _defineProperty2["default"])({}, _defaultSettings.EXPORT_MAP_FORMATS.HTML, _objectSpread(_objectSpread({}, state.exportMap[_defaultSettings.EXPORT_MAP_FORMATS.HTML]), {}, {
      mode: mode
    })))
  });
};
/**
 * Add a notification to be displayed
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').addNotificationUpdater}
 * @public
 */


exports.setExportMapHTMLModeUpdater = setExportMapHTMLModeUpdater;

var addNotificationUpdater = function addNotificationUpdater(state, _ref16) {
  var payload = _ref16.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    notifications: [].concat((0, _toConsumableArray2["default"])(state.notifications || []), [(0, _notificationsUtils.createNotification)(payload)])
  });
};
/**
 * Remove a notification
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload id of the notification to be removed
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').removeNotificationUpdater}
 * @public
 */


exports.addNotificationUpdater = addNotificationUpdater;

var removeNotificationUpdater = function removeNotificationUpdater(state, _ref17) {
  var id = _ref17.payload;
  return _objectSpread(_objectSpread({}, state), {}, {
    notifications: state.notifications.filter(function (n) {
      return n.id !== id;
    })
  });
};
/**
 * Fired when file loading begin
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesUpdater}
 * @public
 */


exports.removeNotificationUpdater = removeNotificationUpdater;

var loadFilesUpdater = function loadFilesUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    loadFiles: _objectSpread(_objectSpread({}, state.loadFiles), {}, {
      fileLoading: true
    })
  });
};
/**
 * Handles loading file success and set fileLoading property to false
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesSuccessUpdater}
 */


exports.loadFilesUpdater = loadFilesUpdater;

var loadFilesSuccessUpdater = function loadFilesSuccessUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    loadFiles: _objectSpread(_objectSpread({}, state.loadFiles), {}, {
      fileLoading: false
    })
  });
};
/**
 * Handles load file error and set fileLoading property to false
 * @memberof uiStateUpdaters
 * @param state
 * @param action
 * @param action.error
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesErrUpdater}
 * @public
 */


exports.loadFilesSuccessUpdater = loadFilesSuccessUpdater;

var loadFilesErrUpdater = function loadFilesErrUpdater(state, _ref18) {
  var error = _ref18.error;
  return addNotificationUpdater(_objectSpread(_objectSpread({}, state), {}, {
    loadFiles: _objectSpread(_objectSpread({}, state.loadFiles), {}, {
      fileLoading: false
    })
  }), {
    payload: (0, _notificationsUtils.errorNotification)({
      message: (error || {}).message || 'Failed to upload files',
      topic: _defaultSettings.DEFAULT_NOTIFICATION_TOPICS.global
    })
  });
};
/**
 * Handles toggle map split and reset all map control index to 0
 * @memberof uiStateUpdaters
 * @param state
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleSplitMapUpdater}
 * @public
 */


exports.loadFilesErrUpdater = loadFilesErrUpdater;

var toggleSplitMapUpdater = function toggleSplitMapUpdater(state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    mapControls: Object.entries(state.mapControls).reduce(function (acc, entry) {
      return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, entry[0], _objectSpread(_objectSpread({}, entry[1]), {}, {
        activeMapIndex: 0
      })));
    }, {})
  });
};
/**
 * Set the locale of the UI
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload
 * @param action.payload.locale locale
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setLocaleUpdater}
 * @public
 */


exports.toggleSplitMapUpdater = toggleSplitMapUpdater;

var setLocaleUpdater = function setLocaleUpdater(state, _ref19) {
  var locale = _ref19.payload.locale;
  return _objectSpread(_objectSpread({}, state), {}, {
    locale: locale
  });
};

exports.setLocaleUpdater = setLocaleUpdater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy91aS1zdGF0ZS11cGRhdGVycy5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX0FDVElWRV9TSURFX1BBTkVMIiwiREVGQVVMVF9NT0RBTCIsIkFERF9EQVRBX0lEIiwidWlTdGF0ZVVwZGF0ZXJzIiwiREVGQVVMVF9NQVBfQ09OVFJPTFNfRkVBVFVSRVMiLCJzaG93IiwiYWN0aXZlIiwiYWN0aXZlTWFwSW5kZXgiLCJERUZBVUxUX01BUF9DT05UUk9MUyIsInJlZHVjZSIsImZpbmFsIiwiY3VycmVudCIsIkRFRkFVTFRfRVhQT1JUX0lNQUdFIiwicmF0aW8iLCJFWFBPUlRfSU1HX1JBVElPUyIsIlNDUkVFTiIsInJlc29sdXRpb24iLCJSRVNPTFVUSU9OUyIsIk9ORV9YIiwibGVnZW5kIiwibWFwSCIsIm1hcFciLCJpbWFnZVNpemUiLCJ6b29tT2Zmc2V0Iiwic2NhbGUiLCJpbWFnZVciLCJpbWFnZUgiLCJjZW50ZXIiLCJpbWFnZURhdGFVcmkiLCJleHBvcnRpbmciLCJwcm9jZXNzaW5nIiwiZXJyb3IiLCJERUZBVUxUX0xPQURfRklMRVMiLCJmaWxlTG9hZGluZyIsIkRFRkFVTFRfRVhQT1JUX0RBVEEiLCJzZWxlY3RlZERhdGFzZXQiLCJkYXRhVHlwZSIsIkVYUE9SVF9EQVRBX1RZUEUiLCJDU1YiLCJmaWx0ZXJlZCIsIkRFRkFVTFRfTk9USUZJQ0FUSU9OUyIsIkRFRkFVTFRfRVhQT1JUX0hUTUwiLCJleHBvcnRNYXBib3hBY2Nlc3NUb2tlbiIsInVzZXJNYXBib3hUb2tlbiIsIm1vZGUiLCJFWFBPUlRfSFRNTF9NQVBfTU9ERVMiLCJSRUFEIiwiREVGQVVMVF9FWFBPUlRfSlNPTiIsImhhc0RhdGEiLCJERUZBVUxUX0VYUE9SVF9NQVAiLCJFWFBPUlRfTUFQX0ZPUk1BVFMiLCJIVE1MIiwiSlNPTiIsIklOSVRJQUxfVUlfU1RBVEUiLCJyZWFkT25seSIsImFjdGl2ZVNpZGVQYW5lbCIsImN1cnJlbnRNb2RhbCIsImRhdGFzZXRLZXlUb1JlbW92ZSIsInZpc2libGVEcm9wZG93biIsImV4cG9ydEltYWdlIiwiZXhwb3J0RGF0YSIsImV4cG9ydE1hcCIsIm1hcENvbnRyb2xzIiwibm90aWZpY2F0aW9ucyIsImxvYWRGaWxlcyIsImxvY2FsZSIsIkxPQ0FMRV9DT0RFUyIsImVuIiwiaW5pdFVpU3RhdGVVcGRhdGVyIiwic3RhdGUiLCJhY3Rpb24iLCJwYXlsb2FkIiwiaW5pdGlhbFVpU3RhdGUiLCJ0b2dnbGVTaWRlUGFuZWxVcGRhdGVyIiwiaWQiLCJ0b2dnbGVNb2RhbFVwZGF0ZXIiLCJzaG93RXhwb3J0RHJvcGRvd25VcGRhdGVyIiwiaGlkZUV4cG9ydERyb3Bkb3duVXBkYXRlciIsInRvZ2dsZU1hcENvbnRyb2xVcGRhdGVyIiwicGFuZWxJZCIsImluZGV4Iiwib3BlbkRlbGV0ZU1vZGFsVXBkYXRlciIsIkRFTEVURV9EQVRBX0lEIiwic2V0RXhwb3J0SW1hZ2VTZXR0aW5nVXBkYXRlciIsIm5ld1NldHRpbmciLCJ1cGRhdGVkIiwic2V0RXhwb3J0SW1hZ2VEYXRhVXJpVXBkYXRlciIsImRhdGFVcmkiLCJzZXRFeHBvcnRJbWFnZUVycm9yVXBkYXRlciIsImNsZWFudXBFeHBvcnRJbWFnZVVwZGF0ZXIiLCJzdGFydEV4cG9ydGluZ0ltYWdlVXBkYXRlciIsIm9wdGlvbnMiLCJpbWFnZVNldHRpbmdzIiwic2V0RXhwb3J0U2VsZWN0ZWREYXRhc2V0VXBkYXRlciIsImRhdGFzZXQiLCJzZXRFeHBvcnREYXRhVHlwZVVwZGF0ZXIiLCJzZXRFeHBvcnRGaWx0ZXJlZFVwZGF0ZXIiLCJzZXRFeHBvcnREYXRhVXBkYXRlciIsInNldFVzZXJNYXBib3hBY2Nlc3NUb2tlblVwZGF0ZXIiLCJzZXRFeHBvcnRNYXBGb3JtYXRVcGRhdGVyIiwiZm9ybWF0Iiwic2V0RXhwb3J0TWFwSFRNTE1vZGVVcGRhdGVyIiwiYWRkTm90aWZpY2F0aW9uVXBkYXRlciIsInJlbW92ZU5vdGlmaWNhdGlvblVwZGF0ZXIiLCJmaWx0ZXIiLCJuIiwibG9hZEZpbGVzVXBkYXRlciIsImxvYWRGaWxlc1N1Y2Nlc3NVcGRhdGVyIiwibG9hZEZpbGVzRXJyVXBkYXRlciIsIm1lc3NhZ2UiLCJ0b3BpYyIsIkRFRkFVTFRfTk9USUZJQ0FUSU9OX1RPUElDUyIsImdsb2JhbCIsInRvZ2dsZVNwbGl0TWFwVXBkYXRlciIsIk9iamVjdCIsImVudHJpZXMiLCJhY2MiLCJlbnRyeSIsInNldExvY2FsZVVwZGF0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFxQkE7O0FBVUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRU8sSUFBTUEseUJBQXlCLEdBQUcsT0FBbEM7O0FBQ0EsSUFBTUMsYUFBYSxHQUFHQyw0QkFBdEI7QUFFUDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQTs7O0FBQ0EsSUFBTUMsZUFBZSxHQUFHLElBQXhCO0FBQ0E7O0FBRUEsSUFBTUMsNkJBQTZCLEdBQUc7QUFDcENDLEVBQUFBLElBQUksRUFBRSxJQUQ4QjtBQUVwQ0MsRUFBQUEsTUFBTSxFQUFFLEtBRjRCO0FBR3BDO0FBQ0FDLEVBQUFBLGNBQWMsRUFBRTtBQUpvQixDQUF0QztBQU9BOzs7Ozs7Ozs7Ozs7OztBQWFPLElBQU1DLG9CQUFvQixHQUFHLENBQ2xDLGVBRGtDLEVBRWxDLFdBRmtDLEVBR2xDLFVBSGtDLEVBSWxDLFVBSmtDLEVBS2xDLFNBTGtDLEVBTWxDLFdBTmtDLEVBT2xDQyxNQVBrQyxDQVFsQyxVQUFDQyxNQUFELEVBQVFDLE9BQVI7QUFBQSx5Q0FDS0QsTUFETCw0Q0FFR0MsT0FGSCxFQUVhUCw2QkFGYjtBQUFBLENBUmtDLEVBWWxDLEVBWmtDLENBQTdCO0FBZVA7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCTyxJQUFNUSxvQkFBb0IsR0FBRztBQUNsQztBQUNBQyxFQUFBQSxLQUFLLEVBQUVDLG1DQUFrQkMsTUFGUztBQUdsQ0MsRUFBQUEsVUFBVSxFQUFFQyw2QkFBWUMsS0FIVTtBQUlsQ0MsRUFBQUEsTUFBTSxFQUFFLEtBSjBCO0FB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QUFBLFdBQVcsRUFBRW9ELE1BQU0sQ0FBQ0MsT0FBUCxDQUFlOUMsS0FBSyxDQUFDUCxXQUFyQixFQUFrQ3JELE1BQWxDLENBQ1gsVUFBQzJHLEdBQUQsRUFBTUMsS0FBTjtBQUFBLDZDQUNLRCxHQURMLDRDQUVHQyxLQUFLLENBQUMsQ0FBRCxDQUZSLGtDQUdPQSxLQUFLLENBQUMsQ0FBRCxDQUhaO0FBSUk5RyxRQUFBQSxjQUFjLEVBQUU7QUFKcEI7QUFBQSxLQURXLEVBUVgsRUFSVztBQUYyQjtBQUFBLENBQW5DO0FBY1A7Ozs7Ozs7Ozs7Ozs7OztBQVdPLElBQU0rRyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLENBQUNqRCxLQUFEO0FBQUEsTUFBbUJKLE1BQW5CLFVBQVNNLE9BQVQsQ0FBbUJOLE1BQW5CO0FBQUEseUNBQzNCSSxLQUQyQjtBQUU5QkosSUFBQUEsTUFBTSxFQUFOQTtBQUY4QjtBQUFBLENBQXpCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gQHRzLW5vY2hlY2tcbmltcG9ydCB7XG4gIEFERF9EQVRBX0lELFxuICBERUZBVUxUX05PVElGSUNBVElPTl9UT1BJQ1MsXG4gIERFTEVURV9EQVRBX0lELFxuICBFWFBPUlRfREFUQV9UWVBFLFxuICBFWFBPUlRfSFRNTF9NQVBfTU9ERVMsXG4gIEVYUE9SVF9JTUdfUkFUSU9TLFxuICBFWFBPUlRfTUFQX0ZPUk1BVFMsXG4gIFJFU09MVVRJT05TXG59IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCB7TE9DQUxFX0NPREVTfSBmcm9tICdsb2NhbGl6YXRpb24vbG9jYWxlcyc7XG5pbXBvcnQge2NyZWF0ZU5vdGlmaWNhdGlvbiwgZXJyb3JOb3RpZmljYXRpb259IGZyb20gJ3V0aWxzL25vdGlmaWNhdGlvbnMtdXRpbHMnO1xuaW1wb3J0IHtjYWxjdWxhdGVFeHBvcnRJbWFnZVNpemV9IGZyb20gJ3V0aWxzL2V4cG9ydC11dGlscyc7XG5pbXBvcnQge3BheWxvYWRfLCBhcHBseV8sIGNvbXBvc2VffSBmcm9tICcuL2NvbXBvc2VyLWhlbHBlcnMnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9BQ1RJVkVfU0lERV9QQU5FTCA9ICdsYXllcic7XG5leHBvcnQgY29uc3QgREVGQVVMVF9NT0RBTCA9IEFERF9EQVRBX0lEO1xuXG4vKipcbiAqIFVwZGF0ZXJzIGZvciBgdWlTdGF0ZWAgcmVkdWNlci4gQ2FuIGJlIHVzZWQgaW4geW91ciByb290IHJlZHVjZXIgdG8gZGlyZWN0bHkgbW9kaWZ5IGtlcGxlci5nbCdzIHN0YXRlLlxuICogUmVhZCBtb3JlIGFib3V0IFtVc2luZyB1cGRhdGVyc10oLi4vYWR2YW5jZWQtdXNhZ2UvdXNpbmctdXBkYXRlcnMubWQpXG4gKlxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQga2VwbGVyR2xSZWR1Y2VyLCB7dWlTdGF0ZVVwZGF0ZXJzfSBmcm9tICdrZXBsZXIuZ2wvcmVkdWNlcnMnO1xuICogLy8gUm9vdCBSZWR1Y2VyXG4gKiBjb25zdCByZWR1Y2VycyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gKiAga2VwbGVyR2w6IGtlcGxlckdsUmVkdWNlcixcbiAqICBhcHA6IGFwcFJlZHVjZXJcbiAqIH0pO1xuICpcbiAqIGNvbnN0IGNvbXBvc2VkUmVkdWNlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gKiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICogICAgLy8gY2xpY2sgYnV0dG9uIHRvIGNsb3NlIHNpZGUgcGFuZWxcbiAqICAgIGNhc2UgJ0NMSUNLX0JVVFRPTic6XG4gKiAgICAgIHJldHVybiB7XG4gKiAgICAgICAgLi4uc3RhdGUsXG4gKiAgICAgICAga2VwbGVyR2w6IHtcbiAqICAgICAgICAgIC4uLnN0YXRlLmtlcGxlckdsLFxuICogICAgICAgICAgZm9vOiB7XG4gKiAgICAgICAgICAgICAuLi5zdGF0ZS5rZXBsZXJHbC5mb28sXG4gKiAgICAgICAgICAgICB1aVN0YXRlOiB1aVN0YXRlVXBkYXRlcnMudG9nZ2xlU2lkZVBhbmVsVXBkYXRlcihcbiAqICAgICAgICAgICAgICAgdWlTdGF0ZSwge3BheWxvYWQ6IG51bGx9XG4gKiAgICAgICAgICAgICApXG4gKiAgICAgICAgICB9XG4gKiAgICAgICAgfVxuICogICAgICB9O1xuICogIH1cbiAqICByZXR1cm4gcmVkdWNlcnMoc3RhdGUsIGFjdGlvbik7XG4gKiB9O1xuICpcbiAqIGV4cG9ydCBkZWZhdWx0IGNvbXBvc2VkUmVkdWNlcjtcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmNvbnN0IHVpU3RhdGVVcGRhdGVycyA9IG51bGw7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbmNvbnN0IERFRkFVTFRfTUFQX0NPTlRST0xTX0ZFQVRVUkVTID0ge1xuICBzaG93OiB0cnVlLFxuICBhY3RpdmU6IGZhbHNlLFxuICAvLyBkZWZpbmVzIHdoaWNoIG1hcCBpbmRleCB1c2VycyBhcmUgaW50ZXJhY3Rpbmcgd2l0aCAodGhyb3VnaCBtYXAgY29udHJvbHMpXG4gIGFjdGl2ZU1hcEluZGV4OiAwXG59O1xuXG4vKipcbiAqIEEgbGlzdCBvZiBtYXAgY29udHJvbCB2aXNpYmlsaXR5IGFuZCB3aGV0aGVyIGlzIGl0IGFjdGl2ZS5cbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBjb25zdGFudFxuICogQHByb3BlcnR5IHZpc2libGVMYXllcnMgRGVmYXVsdDogYHtzaG93OiB0cnVlLCBhY3RpdmU6IGZhbHNlfWBcbiAqIEBwcm9wZXJ0eSBtYXBMZWdlbmQgRGVmYXVsdDogYHtzaG93OiB0cnVlLCBhY3RpdmU6IGZhbHNlfWBcbiAqIEBwcm9wZXJ0eSB0b2dnbGUzZCBEZWZhdWx0OiBge3Nob3c6IHRydWV9YFxuICogQHByb3BlcnR5IHNwbGl0TWFwIERlZmF1bHQ6IGB7c2hvdzogdHJ1ZX1gXG4gKiBAcHJvcGVydHkgbWFwRHJhdyBEZWZhdWx0OiBge3Nob3c6IHRydWUsIGFjdGl2ZTogZmFsc2V9YFxuICogQHByb3BlcnR5IG1hcExvY2FsZSBEZWZhdWx0OiBge3Nob3c6IGZhbHNlLCBhY3RpdmU6IGZhbHNlfWBcbiAqIEB0eXBlIHtpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5NYXBDb250cm9sc31cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUFQX0NPTlRST0xTID0gW1xuICAndmlzaWJsZUxheWVycycsXG4gICdtYXBMZWdlbmQnLFxuICAndG9nZ2xlM2QnLFxuICAnc3BsaXRNYXAnLFxuICAnbWFwRHJhdycsXG4gICdtYXBMb2NhbGUnXG5dLnJlZHVjZShcbiAgKGZpbmFsLCBjdXJyZW50KSA9PiAoe1xuICAgIC4uLmZpbmFsLFxuICAgIFtjdXJyZW50XTogREVGQVVMVF9NQVBfQ09OVFJPTFNfRkVBVFVSRVNcbiAgfSksXG4gIHt9XG4pO1xuXG4vKipcbiAqIERlZmF1bHQgaW1hZ2UgZXhwb3J0IGNvbmZpZ1xuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQGNvbnN0YW50XG4gKiBAcHJvcGVydHkgcmF0aW8gRGVmYXVsdDogYCdTQ1JFRU4nYCxcbiAqIEBwcm9wZXJ0eSByZXNvbHV0aW9uIERlZmF1bHQ6IGAnT05FX1gnYCxcbiAqIEBwcm9wZXJ0eSBsZWdlbmQgRGVmYXVsdDogYGZhbHNlYCxcbiAqIEBwcm9wZXJ0eSBtYXBIIERlZmF1bHQ6IDAsXG4gKiBAcHJvcGVydHkgbWFwVyBEZWZhdWx0OiAwLFxuICogQHByb3BlcnR5IGltYWdlU2l6ZSBEZWZhdWx0OiB7em9vbU9mZnNldDogMCwgc2NhbGU6IDEsIGltYWdlVzogMCwgaW1hZ2VIOiAwfSxcbiAqIEBwcm9wZXJ0eSBpbWFnZURhdGFVcmkgRGVmYXVsdDogYCcnYCxcbiAqIEBwcm9wZXJ0eSBleHBvcnRpbmcgRGVmYXVsdDogYGZhbHNlYFxuICogQHByb3BlcnR5IGVycm9yIERlZmF1bHQ6IGBmYWxzZWBcbiAqIEB0eXBlIHtpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5FeHBvcnRJbWFnZX1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRVhQT1JUX0lNQUdFID0ge1xuICAvLyB1c2VyIG9wdGlvbnNcbiAgcmF0aW86IEVYUE9SVF9JTUdfUkFUSU9TLlNDUkVFTixcbiAgcmVzb2x1dGlvbjogUkVTT0xVVElPTlMuT05FX1gsXG4gIGxlZ2VuZDogZmFsc2UsXG4gIG1hcEg6IDAsXG4gIG1hcFc6IDAsXG4gIGltYWdlU2l6ZToge1xuICAgIHpvb21PZmZzZXQ6IDAsXG4gICAgc2NhbGU6IDEsXG4gICAgaW1hZ2VXOiAwLFxuICAgIGltYWdlSDogMFxuICB9LFxuICAvLyB3aGVuIHRoaXMgaXMgc2V0IHRvIHRydWUsIHRoZSBtb2NrIG1hcCB2aWV3cG9ydCB3aWxsIG1vdmUgdG8gdGhlIGNlbnRlciBvZiBkYXRhXG4gIGNlbnRlcjogZmFsc2UsXG4gIC8vIGV4cG9ydGluZyBzdGF0ZVxuICBpbWFnZURhdGFVcmk6ICcnLFxuICAvLyBleHBvcnRpbmc6IHVzZWQgdG8gYXR0YWNoIHBsb3QtY29udGFpbmVyIHRvIGRvbVxuICBleHBvcnRpbmc6IGZhbHNlLFxuICAvLyBwcm9jZXNzaW5nOiB1c2VkIGFzIGxvYWRpbmcgaW5kaWNhdG9yIHdoZW4gZXhwb3J0IGltYWdlIGlzIGJlaW5nIHByb2R1Y2VkXG4gIHByb2Nlc3Npbmc6IGZhbHNlLFxuICBlcnJvcjogZmFsc2Vcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPQURfRklMRVMgPSB7XG4gIGZpbGVMb2FkaW5nOiBmYWxzZVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IGluaXRpYWwgYGV4cG9ydERhdGFgIHNldHRpbmdzXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAY29uc3RhbnRcbiAqIEBwcm9wZXJ0eSBzZWxlY3RlZERhdGFzZXQgRGVmYXVsdDogYCcnYCxcbiAqIEBwcm9wZXJ0eSBkYXRhVHlwZSBEZWZhdWx0OiBgJ2NzdidgLFxuICogQHByb3BlcnR5IGZpbHRlcmVkIERlZmF1bHQ6IGB0cnVlYCxcbiAqIEB0eXBlIHtpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5FeHBvcnREYXRhfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9FWFBPUlRfREFUQSA9IHtcbiAgc2VsZWN0ZWREYXRhc2V0OiAnJyxcbiAgZGF0YVR5cGU6IEVYUE9SVF9EQVRBX1RZUEUuQ1NWLFxuICBmaWx0ZXJlZDogdHJ1ZVxufTtcblxuLyoqXG4gKiBAY29uc3RhbnRcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTk9USUZJQ0FUSU9OUyA9IFtdO1xuXG4vKipcbiAqIEBjb25zdGFudFxuICogQHByb3BlcnR5IGV4cG9ydE1hcGJveEFjY2Vzc1Rva2VuIC0gRGVmYXVsdDogbnVsbCwgdGhpcyBpcyB1c2VkIHdoZW4gd2UgcHJvdmlkZSBhIGRlZmF1bHQgbWFwYm94IHRva2VuIGZvciB1c2VycyB0byB0YWtlIGFkdmFudGFnZSBvZlxuICogQHByb3BlcnR5IHVzZXJNYXBib3hUb2tlbiAtIERlZmF1bHQ6ICcnLCBtYXBib3ggdG9rZW4gcHJvdmlkZWQgYnkgdXNlciB0aHJvdWdoIGlucHV0IGZpZWxkXG4gKiBAcHJvcGVydHkgbW9kZSAtIERlZmF1bHQ6ICdSRUFEJywgcmVhZCBvbmx5IG9yIGVkaXRhYmxlXG4gKiBAdHlwZSB7aW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykuRXhwb3J0SHRtbH1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRVhQT1JUX0hUTUwgPSB7XG4gIGV4cG9ydE1hcGJveEFjY2Vzc1Rva2VuOiBudWxsLFxuICB1c2VyTWFwYm94VG9rZW46ICcnLFxuICBtb2RlOiBFWFBPUlRfSFRNTF9NQVBfTU9ERVMuUkVBRFxufTtcblxuLyoqXG4gKiBAY29uc3RhbnRcbiAqIEBwcm9wZXJ0eSBoYXNEYXRhIC0gRGVmYXVsdDogJ3RydWUnLFxuICogQHR5cGUge2ltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLkV4cG9ydEpzb259XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0VYUE9SVF9KU09OID0ge1xuICBoYXNEYXRhOiB0cnVlXG59O1xuXG4vKipcbiAqIEV4cG9ydCBNYXAgQ29uZmlnXG4gKiBAY29uc3RhbnRcbiAqIEBwcm9wZXJ0eSBIVE1MIC0gRGVmYXVsdDogJ0RFRkFVTFRfRVhQT1JUX0hUTUwnLFxuICogQHByb3BlcnR5IEpTT04gLSBEZWZhdWx0OiAnREVGQVVMVF9FWFBPUlRfSlNPTicsXG4gKiBAcHJvcGVydHkgZm9ybWF0IC0gRGVmYXVsdDogJ0hUTUwnLFxuICogQHR5cGUge2ltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLkV4cG9ydE1hcH1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRVhQT1JUX01BUCA9IHtcbiAgW0VYUE9SVF9NQVBfRk9STUFUUy5IVE1MXTogREVGQVVMVF9FWFBPUlRfSFRNTCxcbiAgW0VYUE9SVF9NQVBfRk9STUFUUy5KU09OXTogREVGQVVMVF9FWFBPUlRfSlNPTixcbiAgZm9ybWF0OiBFWFBPUlRfTUFQX0ZPUk1BVFMuSFRNTFxufTtcblxuLyoqXG4gKiBEZWZhdWx0IGluaXRpYWwgYHVpU3RhdGVgXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAY29uc3RhbnRcbiAqIEBwcm9wZXJ0eSByZWFkT25seSBEZWZhdWx0OiBgZmFsc2VgXG4gKiBAcHJvcGVydHkgYWN0aXZlU2lkZVBhbmVsIERlZmF1bHQ6IGAnbGF5ZXInYFxuICogQHByb3BlcnR5IGN1cnJlbnRNb2RhbCBEZWZhdWx0OiBgJ2FkZERhdGEnYFxuICogQHByb3BlcnR5IGRhdGFzZXRLZXlUb1JlbW92ZSBEZWZhdWx0OiBgbnVsbGBcbiAqIEBwcm9wZXJ0eSB2aXNpYmxlRHJvcGRvd24gRGVmYXVsdDogYG51bGxgXG4gKiBAcHJvcGVydHkgZXhwb3J0SW1hZ2UgRGVmYXVsdDogW2BERUZBVUxUX0VYUE9SVF9JTUFHRWBdKCNkZWZhdWx0X2V4cG9ydF9pbWFnZSlcbiAqIEBwcm9wZXJ0eSBleHBvcnREYXRhIERlZmF1bHQ6IFtgREVGQVVMVF9FWFBPUlRfREFUQWBdKCNkZWZhdWx0X2V4cG9ydF9kYXRhKVxuICogQHByb3BlcnR5IGV4cG9ydE1hcCBEZWZhdWx0OiBbYERFRkFVTFRfRVhQT1JUX01BUGBdKCNkZWZhdWx0X2V4cG9ydF9tYXApXG4gKiBAcHJvcGVydHkgbWFwQ29udHJvbHMgRGVmYXVsdDogW2BERUZBVUxUX01BUF9DT05UUk9MU2BdKCNkZWZhdWx0X21hcF9jb250cm9scylcbiAqIEBwcm9wZXJ0eSBub3RpZmljYXRpb25zIERlZmF1bHQ6IGBbXWBcbiAqIEBwcm9wZXJ0eSBub3RpZmljYXRpb25zIERlZmF1bHQ6IGBbXWBcbiAqIEBwcm9wZXJ0eSBsb2FkRmlsZXNcbiAqIEB0eXBlIHtpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5VaVN0YXRlfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgSU5JVElBTF9VSV9TVEFURSA9IHtcbiAgcmVhZE9ubHk6IGZhbHNlLFxuICBhY3RpdmVTaWRlUGFuZWw6IERFRkFVTFRfQUNUSVZFX1NJREVfUEFORUwsXG4gIGN1cnJlbnRNb2RhbDogREVGQVVMVF9NT0RBTCxcbiAgZGF0YXNldEtleVRvUmVtb3ZlOiBudWxsLFxuICB2aXNpYmxlRHJvcGRvd246IG51bGwsXG4gIC8vIGV4cG9ydCBpbWFnZSBtb2RhbCB1aVxuICBleHBvcnRJbWFnZTogREVGQVVMVF9FWFBPUlRfSU1BR0UsXG4gIC8vIGV4cG9ydCBkYXRhIG1vZGFsIHVpXG4gIGV4cG9ydERhdGE6IERFRkFVTFRfRVhQT1JUX0RBVEEsXG4gIC8vIGh0bWwgZXhwb3J0XG4gIGV4cG9ydE1hcDogREVGQVVMVF9FWFBPUlRfTUFQLFxuICAvLyBtYXAgY29udHJvbCBwYW5lbHNcbiAgbWFwQ29udHJvbHM6IERFRkFVTFRfTUFQX0NPTlRST0xTLFxuICAvLyB1aSBub3RpZmljYXRpb25zXG4gIG5vdGlmaWNhdGlvbnM6IERFRkFVTFRfTk9USUZJQ0FUSU9OUyxcbiAgLy8gbG9hZCBmaWxlc1xuICBsb2FkRmlsZXM6IERFRkFVTFRfTE9BRF9GSUxFUyxcbiAgLy8gTG9jYWxlIG9mIHRoZSBVSVxuICBsb2NhbGU6IExPQ0FMRV9DT0RFUy5lblxufTtcblxuLyogVXBkYXRlcnMgKi9cbi8qKlxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0VWlTdGF0ZVVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIC4uLihhY3Rpb24ucGF5bG9hZCB8fCB7fSkuaW5pdGlhbFVpU3RhdGVcbn0pO1xuXG4vKipcbiAqIFRvZ2dsZSBhY3RpdmUgc2lkZSBwYW5lbFxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHBhcmFtIHN0YXRlIGB1aVN0YXRlYFxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkIGlkIG9mIHNpZGUgcGFuZWwgdG8gYmUgc2hvd24sIG9uZSBvZiBgbGF5ZXJgLCBgZmlsdGVyYCwgYGludGVyYWN0aW9uYCwgYG1hcGAuIGNsb3NlIHNpZGUgcGFuZWwgaWYgYG51bGxgXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykudG9nZ2xlU2lkZVBhbmVsVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVNpZGVQYW5lbFVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkOiBpZH0pID0+IHtcbiAgcmV0dXJuIGlkID09PSBzdGF0ZS5hY3RpdmVTaWRlUGFuZWxcbiAgICA/IHN0YXRlXG4gICAgOiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBhY3RpdmVTaWRlUGFuZWw6IGlkXG4gICAgICB9O1xufTtcblxuLyoqXG4gKiBTaG93IGFuZCBoaWRlIG1vZGFsIGRpYWxvZ1xuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHBhcmFtIHN0YXRlIGB1aVN0YXRlYFxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtYWN0aW9uLnBheWxvYWQgaWQgb2YgbW9kYWwgdG8gYmUgc2hvd24sIG51bGwgdG8gaGlkZSBtb2RhbHMuIE9uZSBvZjpcbiAqICAtIFtgREFUQV9UQUJMRV9JRGBdKC4uL2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzLm1kI2RhdGFfdGFibGVfaWQpXG4gKiAgLSBbYERFTEVURV9EQVRBX0lEYF0oLi4vY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MubWQjZGVsZXRlX2RhdGFfaWQpXG4gKiAgLSBbYEFERF9EQVRBX0lEYF0oLi4vY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MubWQjYWRkX2RhdGFfaWQpXG4gKiAgLSBbYEVYUE9SVF9JTUFHRV9JRGBdKC4uL2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzLm1kI2V4cG9ydF9pbWFnZV9pZClcbiAqICAtIFtgRVhQT1JUX0RBVEFfSURgXSguLi9jb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncy5tZCNleHBvcnRfZGF0YV9pZClcbiAqICAtIFtgQUREX01BUF9TVFlMRV9JRGBdKC4uL2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzLm1kI2FkZF9tYXBfc3R5bGVfaWQpXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykudG9nZ2xlTW9kYWxVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlTW9kYWxVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogaWR9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgY3VycmVudE1vZGFsOiBpZFxufSk7XG5cbi8qKlxuICogSGlkZSBhbmQgc2hvdyBzaWRlIHBhbmVsIGhlYWRlciBkcm9wZG93biwgYWN0aXZhdGVkIGJ5IGNsaWNraW5nIHRoZSBzaGFyZSBsaW5rIG9uIHRvcCBvZiB0aGUgc2lkZSBwYW5lbFxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zaG93RXhwb3J0RHJvcGRvd25VcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2hvd0V4cG9ydERyb3Bkb3duVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IGlkfSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIHZpc2libGVEcm9wZG93bjogaWRcbn0pO1xuXG4vKipcbiAqIEhpZGUgc2lkZSBwYW5lbCBoZWFkZXIgZHJvcGRvd24sIGFjdGl2YXRlZCBieSBjbGlja2luZyB0aGUgc2hhcmUgbGluayBvbiB0b3Agb2YgdGhlIHNpZGUgcGFuZWxcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykuaGlkZUV4cG9ydERyb3Bkb3duVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGhpZGVFeHBvcnREcm9wZG93blVwZGF0ZXIgPSBzdGF0ZSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgdmlzaWJsZURyb3Bkb3duOiBudWxsXG59KTtcblxuLyoqXG4gKiBUb2dnbGUgYWN0aXZlIG1hcCBjb250cm9sIHBhbmVsXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGUgYHVpU3RhdGVgXG4gKiBAcGFyYW0gYWN0aW9uIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkIG1hcCBjb250cm9sIHBhbmVsIGlkLCBvbmUgb2YgdGhlIGtleXMgb2Y6IFtgREVGQVVMVF9NQVBfQ09OVFJPTFNgXSgjZGVmYXVsdF9tYXBfY29udHJvbHMpXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykudG9nZ2xlTWFwQ29udHJvbFVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVNYXBDb250cm9sVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IHtwYW5lbElkLCBpbmRleCA9IDB9fSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIG1hcENvbnRyb2xzOiB7XG4gICAgLi4uc3RhdGUubWFwQ29udHJvbHMsXG4gICAgW3BhbmVsSWRdOiB7XG4gICAgICAuLi5zdGF0ZS5tYXBDb250cm9sc1twYW5lbElkXSxcbiAgICAgIC8vIHRoaXMgaGFuZGxlcyBzcGxpdCBtYXAgaW50ZXJhY3Rpb25cbiAgICAgIC8vIFRvZ2dsaW5nIGZyb20gd2l0aGluIHRoZSBzYW1lIG1hcCB3aWxsIHNpbXBseSB0b2dnbGUgdGhlIGFjdGl2ZSBwcm9wZXJ0eVxuICAgICAgLy8gVG9nZ2xpbmcgZnJvbSB3aXRoaW4gZGlmZmVyZW50IG1hcHMgd2Ugc2V0IHRoZSBhY3RpdmUgcHJvcGVydHkgdG8gdHJ1ZVxuICAgICAgYWN0aXZlOlxuICAgICAgICBpbmRleCA9PT0gc3RhdGUubWFwQ29udHJvbHNbcGFuZWxJZF0uYWN0aXZlTWFwSW5kZXhcbiAgICAgICAgICA/ICFzdGF0ZS5tYXBDb250cm9sc1twYW5lbElkXS5hY3RpdmVcbiAgICAgICAgICA6IHRydWUsXG4gICAgICBhY3RpdmVNYXBJbmRleDogaW5kZXhcbiAgICB9XG4gIH1cbn0pO1xuXG4vKipcbiAqIFRvZ2dsZSBhY3RpdmUgbWFwIGNvbnRyb2wgcGFuZWxcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24ucGF5bG9hZCBkYXRhc2V0IGlkXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykub3BlbkRlbGV0ZU1vZGFsVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG9wZW5EZWxldGVNb2RhbFVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkOiBkYXRhc2V0S2V5VG9SZW1vdmV9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgY3VycmVudE1vZGFsOiBERUxFVEVfREFUQV9JRCxcbiAgZGF0YXNldEtleVRvUmVtb3ZlXG59KTtcblxuLyoqXG4gKiBTZXQgYGV4cG9ydEltYWdlLmxlZ2VuZGAgdG8gYHRydWVgIG9yIGBmYWxzZWBcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zZXRFeHBvcnRJbWFnZVNldHRpbmdVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2V0RXhwb3J0SW1hZ2VTZXR0aW5nVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IG5ld1NldHRpbmd9KSA9PiB7XG4gIGNvbnN0IHVwZGF0ZWQgPSB7Li4uc3RhdGUuZXhwb3J0SW1hZ2UsIC4uLm5ld1NldHRpbmd9O1xuICBjb25zdCBpbWFnZVNpemUgPSBjYWxjdWxhdGVFeHBvcnRJbWFnZVNpemUodXBkYXRlZCkgfHwgc3RhdGUuZXhwb3J0SW1hZ2UuaW1hZ2VTaXplO1xuXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIC4uLnVwZGF0ZWQsXG4gICAgICBpbWFnZVNpemVcbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIFNldCBgZXhwb3J0SW1hZ2Uuc2V0RXhwb3J0SW1hZ2VEYXRhVXJpYCB0byBhIGltYWdlIGRhdGFVcmlcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24ucGF5bG9hZCBleHBvcnQgaW1hZ2UgZGF0YSB1cmlcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zZXRFeHBvcnRJbWFnZURhdGFVcmlVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2V0RXhwb3J0SW1hZ2VEYXRhVXJpVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IGRhdGFVcml9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0SW1hZ2U6IHtcbiAgICAuLi5zdGF0ZS5leHBvcnRJbWFnZSxcbiAgICBwcm9jZXNzaW5nOiBmYWxzZSxcbiAgICBpbWFnZURhdGFVcmk6IGRhdGFVcmlcbiAgfVxufSk7XG5cbi8qKlxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zZXRFeHBvcnRJbWFnZUVycm9yVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEV4cG9ydEltYWdlRXJyb3JVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogZXJyb3J9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0SW1hZ2U6IHtcbiAgICAuLi5zdGF0ZS5leHBvcnRJbWFnZSxcbiAgICBwcm9jZXNzaW5nOiBmYWxzZSxcbiAgICBlcnJvclxuICB9XG59KTtcblxuLyoqXG4gKiBEZWxldGUgY2FjaGVkIGV4cG9ydCBpbWFnZVxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5jbGVhbnVwRXhwb3J0SW1hZ2VVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgY2xlYW51cEV4cG9ydEltYWdlVXBkYXRlciA9IHN0YXRlID0+ICh7XG4gIC4uLnN0YXRlLFxuICBleHBvcnRJbWFnZToge1xuICAgIC4uLnN0YXRlLmV4cG9ydEltYWdlLFxuICAgIGV4cG9ydGluZzogZmFsc2UsXG4gICAgaW1hZ2VEYXRhVXJpOiAnJyxcbiAgICBlcnJvcjogZmFsc2UsXG4gICAgcHJvY2Vzc2luZzogZmFsc2UsXG4gICAgY2VudGVyOiBmYWxzZVxuICB9XG59KTtcblxuLyoqXG4gKiBTdGFydCBpbWFnZSBleHBvcnRpbmcgZmxvd1xuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHBhcmFtIHN0YXRlXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge1VpU3RhdGV9XG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLnN0YXJ0RXhwb3J0aW5nSW1hZ2V9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBzdGFydEV4cG9ydGluZ0ltYWdlVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IG9wdGlvbnMgPSB7fX0pID0+IHtcbiAgY29uc3QgaW1hZ2VTZXR0aW5ncyA9IHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGV4cG9ydGluZzogdHJ1ZVxuICB9O1xuXG4gIHJldHVybiBjb21wb3NlXyhbXG4gICAgY2xlYW51cEV4cG9ydEltYWdlVXBkYXRlcixcbiAgICBhcHBseV8oc2V0RXhwb3J0SW1hZ2VTZXR0aW5nVXBkYXRlciwgcGF5bG9hZF8oaW1hZ2VTZXR0aW5ncykpXG4gIF0pKHN0YXRlKTtcbn07XG5cbi8qKlxuICogU2V0IHNlbGVjdGVkIGRhdGFzZXQgZm9yIGV4cG9ydFxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHBhcmFtIHN0YXRlIGB1aVN0YXRlYFxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkIGRhdGFzZXQgaWRcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zZXRFeHBvcnRTZWxlY3RlZERhdGFzZXRVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2V0RXhwb3J0U2VsZWN0ZWREYXRhc2V0VXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IGRhdGFzZXR9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0RGF0YToge1xuICAgIC4uLnN0YXRlLmV4cG9ydERhdGEsXG4gICAgc2VsZWN0ZWREYXRhc2V0OiBkYXRhc2V0XG4gIH1cbn0pO1xuXG4vKipcbiAqIFNldCBkYXRhIGZvcm1hdCBmb3IgZXhwb3J0aW5nIGRhdGFcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24ucGF5bG9hZCBvbmUgb2YgYCd0ZXh0L2NzdidgXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykuc2V0RXhwb3J0RGF0YVR5cGVVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3Qgc2V0RXhwb3J0RGF0YVR5cGVVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogZGF0YVR5cGV9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0RGF0YToge1xuICAgIC4uLnN0YXRlLmV4cG9ydERhdGEsXG4gICAgZGF0YVR5cGVcbiAgfVxufSk7XG5cbi8qKlxuICogV2hldGhlciB0byBleHBvcnQgZmlsdGVyZWQgZGF0YSwgYHRydWVgIG9yIGBmYWxzZWBcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24ucGF5bG9hZFxuICogQHJldHVybnMgbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLnNldEV4cG9ydEZpbHRlcmVkVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEV4cG9ydEZpbHRlcmVkVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IGZpbHRlcmVkfSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGV4cG9ydERhdGE6IHtcbiAgICAuLi5zdGF0ZS5leHBvcnREYXRhLFxuICAgIGZpbHRlcmVkXG4gIH1cbn0pO1xuXG4vKipcbiAqIFdoZXRoZXIgdG8gaW5jbHVkaW5nIGRhdGEgaW4gbWFwIGNvbmZpZywgdG9nZ2xlIGJldHdlZW4gYHRydWVgIG9yIGBmYWxzZWBcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5zZXRFeHBvcnREYXRhVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEV4cG9ydERhdGFVcGRhdGVyID0gc3RhdGUgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGV4cG9ydE1hcDoge1xuICAgIC4uLnN0YXRlLmV4cG9ydE1hcCxcbiAgICBbRVhQT1JUX01BUF9GT1JNQVRTLkpTT05dOiB7XG4gICAgICAuLi5zdGF0ZS5leHBvcnRNYXBbRVhQT1JUX01BUF9GT1JNQVRTLkpTT05dLFxuICAgICAgaGFzRGF0YTogIXN0YXRlLmV4cG9ydE1hcFtFWFBPUlRfTUFQX0ZPUk1BVFMuSlNPTl0uaGFzRGF0YVxuICAgIH1cbiAgfVxufSk7XG5cbi8qKlxuICogd2hldGhlciB0byBleHBvcnQgYSBtYXBib3ggYWNjZXNzIHRvIEhUTUwgc2luZ2xlIHBhZ2VcbiAqIEBwYXJhbSBzdGF0ZSAtIGB1aVN0YXRlYFxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykuc2V0VXNlck1hcGJveEFjY2Vzc1Rva2VuVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldFVzZXJNYXBib3hBY2Nlc3NUb2tlblVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkOiB1c2VyTWFwYm94VG9rZW59KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0TWFwOiB7XG4gICAgLi4uc3RhdGUuZXhwb3J0TWFwLFxuICAgIFtFWFBPUlRfTUFQX0ZPUk1BVFMuSFRNTF06IHtcbiAgICAgIC4uLnN0YXRlLmV4cG9ydE1hcFtFWFBPUlRfTUFQX0ZPUk1BVFMuSFRNTF0sXG4gICAgICB1c2VyTWFwYm94VG9rZW5cbiAgICB9XG4gIH1cbn0pO1xuXG4vKipcbiAqIFNldHMgdGhlIGV4cG9ydCBtYXAgZm9ybWF0XG4gKiBAcGFyYW0gc3RhdGUgLSBgdWlTdGF0ZWBcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24ucGF5bG9hZCBmb3JtYXQgdG8gdXNlIHRvIGV4cG9ydCB0aGUgbWFwIGludG9cbiAqIEByZXR1cm4gbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLnNldEV4cG9ydE1hcEZvcm1hdFVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBzZXRFeHBvcnRNYXBGb3JtYXRVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDogZm9ybWF0fSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGV4cG9ydE1hcDoge1xuICAgIC4uLnN0YXRlLmV4cG9ydE1hcCxcbiAgICBmb3JtYXRcbiAgfVxufSk7XG5cbi8qKlxuICogU2V0IHRoZSBleHBvcnQgaHRtbCBtYXAgbW9kZVxuICogQHBhcmFtIHN0YXRlIC0gYHVpU3RhdGVgXG4gKiBAcGFyYW0gYWN0aW9uXG4gKiBAcGFyYW0gYWN0aW9uLnBheWxvYWQgdG8gYmUgc2V0IChhdmFpbGFibGUgbW9kZXM6IEVYUE9SVF9IVE1MX01BUF9NT0RFUylcbiAqIEByZXR1cm4gbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLnNldEV4cG9ydE1hcEhUTUxNb2RlVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IHNldEV4cG9ydE1hcEhUTUxNb2RlVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWQ6IG1vZGV9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgZXhwb3J0TWFwOiB7XG4gICAgLi4uc3RhdGUuZXhwb3J0TWFwLFxuICAgIFtFWFBPUlRfTUFQX0ZPUk1BVFMuSFRNTF06IHtcbiAgICAgIC4uLnN0YXRlLmV4cG9ydE1hcFtFWFBPUlRfTUFQX0ZPUk1BVFMuSFRNTF0sXG4gICAgICBtb2RlXG4gICAgfVxuICB9XG59KTtcblxuLyoqXG4gKiBBZGQgYSBub3RpZmljYXRpb24gdG8gYmUgZGlzcGxheWVkXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGUgYHVpU3RhdGVgXG4gKiBAcGFyYW0gYWN0aW9uXG4gKiBAcGFyYW0gYWN0aW9uLnBheWxvYWRcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5hZGROb3RpZmljYXRpb25VcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgYWRkTm90aWZpY2F0aW9uVXBkYXRlciA9IChzdGF0ZSwge3BheWxvYWR9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbm90aWZpY2F0aW9uczogWy4uLihzdGF0ZS5ub3RpZmljYXRpb25zIHx8IFtdKSwgY3JlYXRlTm90aWZpY2F0aW9uKHBheWxvYWQpXVxufSk7XG5cbi8qKlxuICogUmVtb3ZlIGEgbm90aWZpY2F0aW9uXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGUgYHVpU3RhdGVgXG4gKiBAcGFyYW0gYWN0aW9uXG4gKiBAcGFyYW0gYWN0aW9uLnBheWxvYWQgaWQgb2YgdGhlIG5vdGlmaWNhdGlvbiB0byBiZSByZW1vdmVkXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykucmVtb3ZlTm90aWZpY2F0aW9uVXBkYXRlcn1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vdGlmaWNhdGlvblVwZGF0ZXIgPSAoc3RhdGUsIHtwYXlsb2FkOiBpZH0pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBub3RpZmljYXRpb25zOiBzdGF0ZS5ub3RpZmljYXRpb25zLmZpbHRlcihuID0+IG4uaWQgIT09IGlkKVxufSk7XG5cbi8qKlxuICogRmlyZWQgd2hlbiBmaWxlIGxvYWRpbmcgYmVnaW5cbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZSBgdWlTdGF0ZWBcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS5sb2FkRmlsZXNVcGRhdGVyfVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgbG9hZEZpbGVzVXBkYXRlciA9IHN0YXRlID0+ICh7XG4gIC4uLnN0YXRlLFxuICBsb2FkRmlsZXM6IHtcbiAgICAuLi5zdGF0ZS5sb2FkRmlsZXMsXG4gICAgZmlsZUxvYWRpbmc6IHRydWVcbiAgfVxufSk7XG5cbi8qKlxuICogSGFuZGxlcyBsb2FkaW5nIGZpbGUgc3VjY2VzcyBhbmQgc2V0IGZpbGVMb2FkaW5nIHByb3BlcnR5IHRvIGZhbHNlXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGUgYHVpU3RhdGVgXG4gKiBAcmV0dXJucyBuZXh0U3RhdGVcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3VpLXN0YXRlLXVwZGF0ZXJzJykubG9hZEZpbGVzU3VjY2Vzc1VwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZXNTdWNjZXNzVXBkYXRlciA9IHN0YXRlID0+ICh7XG4gIC4uLnN0YXRlLFxuICBsb2FkRmlsZXM6IHtcbiAgICAuLi5zdGF0ZS5sb2FkRmlsZXMsXG4gICAgZmlsZUxvYWRpbmc6IGZhbHNlXG4gIH1cbn0pO1xuXG4vKipcbiAqIEhhbmRsZXMgbG9hZCBmaWxlIGVycm9yIGFuZCBzZXQgZmlsZUxvYWRpbmcgcHJvcGVydHkgdG8gZmFsc2VcbiAqIEBtZW1iZXJvZiB1aVN0YXRlVXBkYXRlcnNcbiAqIEBwYXJhbSBzdGF0ZVxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5lcnJvclxuICogQHJldHVybnMgbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLmxvYWRGaWxlc0VyclVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZXNFcnJVcGRhdGVyID0gKHN0YXRlLCB7ZXJyb3J9KSA9PlxuICBhZGROb3RpZmljYXRpb25VcGRhdGVyKFxuICAgIHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgbG9hZEZpbGVzOiB7XG4gICAgICAgIC4uLnN0YXRlLmxvYWRGaWxlcyxcbiAgICAgICAgZmlsZUxvYWRpbmc6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBwYXlsb2FkOiBlcnJvck5vdGlmaWNhdGlvbih7XG4gICAgICAgIG1lc3NhZ2U6IChlcnJvciB8fCB7fSkubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHVwbG9hZCBmaWxlcycsXG4gICAgICAgIHRvcGljOiBERUZBVUxUX05PVElGSUNBVElPTl9UT1BJQ1MuZ2xvYmFsXG4gICAgICB9KVxuICAgIH1cbiAgKTtcblxuLyoqXG4gKiBIYW5kbGVzIHRvZ2dsZSBtYXAgc3BsaXQgYW5kIHJlc2V0IGFsbCBtYXAgY29udHJvbCBpbmRleCB0byAwXG4gKiBAbWVtYmVyb2YgdWlTdGF0ZVVwZGF0ZXJzXG4gKiBAcGFyYW0gc3RhdGVcbiAqIEByZXR1cm5zIG5leHRTdGF0ZVxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vdWktc3RhdGUtdXBkYXRlcnMnKS50b2dnbGVTcGxpdE1hcFVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVTcGxpdE1hcFVwZGF0ZXIgPSBzdGF0ZSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbWFwQ29udHJvbHM6IE9iamVjdC5lbnRyaWVzKHN0YXRlLm1hcENvbnRyb2xzKS5yZWR1Y2UoXG4gICAgKGFjYywgZW50cnkpID0+ICh7XG4gICAgICAuLi5hY2MsXG4gICAgICBbZW50cnlbMF1dOiB7XG4gICAgICAgIC4uLmVudHJ5WzFdLFxuICAgICAgICBhY3RpdmVNYXBJbmRleDogMFxuICAgICAgfVxuICAgIH0pLFxuICAgIHt9XG4gIClcbn0pO1xuXG4vKipcbiAqIFNldCB0aGUgbG9jYWxlIG9mIHRoZSBVSVxuICogQG1lbWJlcm9mIHVpU3RhdGVVcGRhdGVyc1xuICogQHBhcmFtIHN0YXRlIGB1aVN0YXRlYFxuICogQHBhcmFtIGFjdGlvblxuICogQHBhcmFtIGFjdGlvbi5wYXlsb2FkXG4gKiBAcGFyYW0gYWN0aW9uLnBheWxvYWQubG9jYWxlIGxvY2FsZVxuICogQHJldHVybnMgbmV4dFN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi91aS1zdGF0ZS11cGRhdGVycycpLnNldExvY2FsZVVwZGF0ZXJ9XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRMb2NhbGVVcGRhdGVyID0gKHN0YXRlLCB7cGF5bG9hZDoge2xvY2FsZX19KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbG9jYWxlXG59KTtcbiJdfQ==