"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSavedMapsErrorUpdater = exports.getSavedMapsSuccessUpdater = exports.getSavedMapsUpdater = exports.setCloudProviderUpdater = exports.resetProviderStatusUpdater = exports.loadCloudMapErrorUpdater = exports.loadCloudMapSuccessUpdater = exports.loadCloudMapUpdater = exports.exportFileErrorUpdater = exports.postSaveLoadSuccessUpdater = exports.exportFileSuccessUpdater = exports.exportFileToCloudUpdater = exports.INITIAL_PROVIDER_STATE = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _tasks = require("react-palm/tasks");

var _console = _interopRequireDefault(require("global/console"));

var _utils = require("../utils/utils");

var _tasks2 = require("../tasks/tasks");

var _providerActions = require("../actions/provider-actions");

var _uiStateActions = require("../actions/ui-state-actions");

var _actions = require("../actions/actions");

var _defaultSettings = require("../constants/default-settings");

var _cloudProviders = require("../cloud-providers");

var _dataProcessor = require("../processors/data-processor");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var INITIAL_PROVIDER_STATE = {
  isProviderLoading: false,
  isCloudMapLoading: false,
  providerError: null,
  currentProvider: null,
  successInfo: {},
  mapSaved: null,
  visualizations: []
};
exports.INITIAL_PROVIDER_STATE = INITIAL_PROVIDER_STATE;

function createActionTask(action, payload) {
  if (typeof action === 'function') {
    return (0, _tasks2.ACTION_TASK)().map(function (_) {
      return action(payload);
    });
  }

  return null;
}

function _validateProvider(provider, method) {
  if (!provider) {
    _console["default"].error("provider is not defined");

    return false;
  }

  if (typeof provider[method] !== 'function') {
    _console["default"].error("".concat(method, " is not a function of Cloud provider: ").concat(provider.name));

    return false;
  }

  return true;
}
/**
 * @type {typeof import('./provider-state-updaters').createGlobalNotificationTasks}
 */


function createGlobalNotificationTasks(_ref) {
  var type = _ref.type,
      message = _ref.message,
      _ref$delayClose = _ref.delayClose,
      delayClose = _ref$delayClose === void 0 ? true : _ref$delayClose;
  var id = (0, _utils.generateHashId)();
  var successNote = {
    id: id,
    type: _defaultSettings.DEFAULT_NOTIFICATION_TYPES[type] || _defaultSettings.DEFAULT_NOTIFICATION_TYPES.success,
    topic: _defaultSettings.DEFAULT_NOTIFICATION_TOPICS.global,
    message: message
  };
  var task = (0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _uiStateActions.addNotification)(successNote);
  });
  return delayClose ? [task, (0, _tasks2.DELAY_TASK)(3000).map(function (_) {
    return (0, _uiStateActions.removeNotification)(id);
  })] : [task];
}
/**
 * This method will export the current kepler config file to the chosen cloud proder
 * add returns a share URL
 *
 * @type {typeof import('./provider-state-updaters').exportFileToCloudUpdater}
 */


var exportFileToCloudUpdater = function exportFileToCloudUpdater(state, action) {
  var _action$payload = action.payload,
      mapData = _action$payload.mapData,
      provider = _action$payload.provider,
      _action$payload$optio = _action$payload.options,
      options = _action$payload$optio === void 0 ? {} : _action$payload$optio,
      onSuccess = _action$payload.onSuccess,
      onError = _action$payload.onError,
      closeModal = _action$payload.closeModal;

  if (!_validateProvider(provider, 'uploadMap')) {
    return state;
  }

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: true,
    currentProvider: provider.name
  }); // payload called by provider.uploadMap


  var payload = {
    mapData: mapData,
    options: options
  };
  var uploadFileTask = (0, _tasks2.EXPORT_FILE_TO_CLOUD_TASK)({
    provider: provider,
    payload: payload
  }).bimap( // success
  function (response) {
    return (0, _providerActions.exportFileSuccess)({
      response: response,
      provider: provider,
      options: options,
      onSuccess: onSuccess,
      closeModal: closeModal
    });
  }, // error
  function (error) {
    return (0, _providerActions.exportFileError)({
      error: error,
      provider: provider,
      options: options,
      onError: onError
    });
  });
  return (0, _tasks.withTask)(newState, uploadFileTask);
};
/**
 *
 * @type {typeof import('./provider-state-updaters').exportFileSuccessUpdater}
 */


exports.exportFileToCloudUpdater = exportFileToCloudUpdater;

var exportFileSuccessUpdater = function exportFileSuccessUpdater(state, action) {
  var _action$payload2 = action.payload,
      response = _action$payload2.response,
      provider = _action$payload2.provider,
      _action$payload2$opti = _action$payload2.options,
      options = _action$payload2$opti === void 0 ? {} : _action$payload2$opti,
      onSuccess = _action$payload2.onSuccess,
      closeModal = _action$payload2.closeModal;

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false,
    // TODO: do we always have to store this?
    successInfo: response
  }, !options.isPublic ? {
    mapSaved: provider.name
  } : {});

  var tasks = [createActionTask(onSuccess, {
    response: response,
    provider: provider,
    options: options
  }), closeModal && (0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _providerActions.postSaveLoadSuccess)("Map saved to ".concat(state.currentProvider, "!"));
  })].filter(function (d) {
    return d;
  });
  return tasks.length ? (0, _tasks.withTask)(newState, tasks) : newState;
};
/**
 * Close modal on success and display notification
 * @type {typeof import('./provider-state-updaters').postSaveLoadSuccessUpdater}
 */


exports.exportFileSuccessUpdater = exportFileSuccessUpdater;

var postSaveLoadSuccessUpdater = function postSaveLoadSuccessUpdater(state, action) {
  var message = action.payload || "Saved / Load to ".concat(state.currentProvider, " Success");
  var tasks = [(0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _uiStateActions.toggleModal)(null);
  }), (0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _providerActions.resetProviderStatus)();
  })].concat((0, _toConsumableArray2["default"])(createGlobalNotificationTasks({
    message: message
  })));
  return (0, _tasks.withTask)(state, tasks);
};
/**
 *
 * @type {typeof import('./provider-state-updaters').exportFileErrorUpdater}
 */


exports.postSaveLoadSuccessUpdater = postSaveLoadSuccessUpdater;

var exportFileErrorUpdater = function exportFileErrorUpdater(state, action) {
  var _action$payload3 = action.payload,
      error = _action$payload3.error,
      provider = _action$payload3.provider,
      onError = _action$payload3.onError;

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false
  });

  if (isFileConflict(error)) {
    newState.mapSaved = provider.name;
    return (0, _tasks.withTask)(newState, [(0, _tasks2.ACTION_TASK)().map(function (_) {
      return (0, _uiStateActions.toggleModal)(_defaultSettings.OVERWRITE_MAP_ID);
    })]);
  }

  newState.providerError = (0, _utils.getError)(error);
  var task = createActionTask(onError, {
    error: error,
    provider: provider
  });
  return task ? (0, _tasks.withTask)(newState, task) : newState;
};

exports.exportFileErrorUpdater = exportFileErrorUpdater;

var loadCloudMapUpdater = function loadCloudMapUpdater(state, action) {
  var _action$payload4 = action.payload,
      loadParams = _action$payload4.loadParams,
      provider = _action$payload4.provider,
      onSuccess = _action$payload4.onSuccess,
      onError = _action$payload4.onError;

  if (!loadParams) {
    _console["default"].warn('load map error: loadParams is undefined');

    return state;
  }

  if (!_validateProvider(provider, 'downloadMap')) {
    return state;
  }

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: true,
    isCloudMapLoading: true
  }); // payload called by provider.downloadMap


  var uploadFileTask = (0, _tasks2.LOAD_CLOUD_MAP_TASK)({
    provider: provider,
    payload: loadParams
  }).bimap( // success
  function (response) {
    return (0, _providerActions.loadCloudMapSuccess)({
      response: response,
      loadParams: loadParams,
      provider: provider,
      onSuccess: onSuccess,
      onError: onError
    });
  }, // error
  function (error) {
    return (0, _providerActions.loadCloudMapError)({
      error: error,
      provider: provider,
      onError: onError
    });
  });
  return (0, _tasks.withTask)(newState, uploadFileTask);
};

exports.loadCloudMapUpdater = loadCloudMapUpdater;

function isFileConflict(error) {
  return error && error.message === _cloudProviders.FILE_CONFLICT_MSG;
}

function checkLoadMapResponseError(response) {
  if (!response || !(0, _utils.isPlainObject)(response)) {
    return new Error('Load map response is empty');
  }

  if (!(0, _utils.isPlainObject)(response.map)) {
    return new Error("Load map response should be an object property \"map\"");
  }

  if (!response.map.datasets || !response.map.config) {
    return new Error("Load map response.map should be an object with property datasets or config");
  }

  return null;
}

function getDatasetHandler(format) {
  var defaultHandler = _dataProcessor.DATASET_HANDLERS[_defaultSettings.DATASET_FORMATS.csv];

  if (!format) {
    _console["default"].warn('format is not provided in load map response, will use csv by default');

    return defaultHandler;
  }

  if (!_dataProcessor.DATASET_HANDLERS[format]) {
    var supportedFormat = Object.keys(_defaultSettings.DATASET_FORMATS).map(function (k) {
      return "'".concat(k, "'");
    }).join(', ');

    _console["default"].warn("unknown format ".concat(format, ". Please use one of ").concat(supportedFormat, ", will use csv by default"));

    return defaultHandler;
  }

  return _dataProcessor.DATASET_HANDLERS[format];
}

function parseLoadMapResponse(response, loadParams, provider) {
  var map = response.map,
      format = response.format;
  var processorMethod = getDatasetHandler(format);
  var parsedDatasets = (0, _utils.toArray)(map.datasets).map(function (ds, i) {
    if (format === _defaultSettings.DATASET_FORMATS.keplergl) {
      // no need to obtain id, directly pass them in
      return processorMethod(ds);
    }

    var info = ds && ds.info || {
      id: (0, _utils.generateHashId)(6)
    };
    var data = processorMethod(ds.data || ds);
    return {
      info: info,
      data: data
    };
  });

  var info = _objectSpread(_objectSpread({}, map.info), {}, {
    provider: provider.name,
    loadParams: loadParams
  });

  return _objectSpread({
    datasets: parsedDatasets,
    info: info
  }, map.config ? {
    config: map.config
  } : {});
}
/**
 *
 * @type {typeof import('./provider-state-updaters').loadCloudMapSuccessUpdater}
 */


var loadCloudMapSuccessUpdater = function loadCloudMapSuccessUpdater(state, action) {
  var _action$payload5 = action.payload,
      response = _action$payload5.response,
      loadParams = _action$payload5.loadParams,
      provider = _action$payload5.provider,
      onSuccess = _action$payload5.onSuccess,
      onError = _action$payload5.onError;
  var formatError = checkLoadMapResponseError(response);

  if (formatError) {
    // if response format is not correct
    return exportFileErrorUpdater(state, {
      payload: {
        error: formatError,
        provider: provider,
        onError: onError
      }
    });
  }

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    mapSaved: provider.name,
    currentProvider: provider.name,
    isCloudMapLoading: false,
    isProviderLoading: false
  });

  var payload = parseLoadMapResponse(response, loadParams, provider);
  var tasks = [(0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _actions.addDataToMap)(payload);
  }), createActionTask(onSuccess, {
    response: response,
    loadParams: loadParams,
    provider: provider
  }), (0, _tasks2.ACTION_TASK)().map(function (_) {
    return (0, _providerActions.postSaveLoadSuccess)("Map from ".concat(provider.name, " loaded"));
  })].filter(function (d) {
    return d;
  });
  return tasks.length ? (0, _tasks.withTask)(newState, tasks) : newState;
};
/**
 *
 * @type {typeof import('./provider-state-updaters').loadCloudMapErrorUpdater}
 */


exports.loadCloudMapSuccessUpdater = loadCloudMapSuccessUpdater;

var loadCloudMapErrorUpdater = function loadCloudMapErrorUpdater(state, action) {
  var message = (0, _utils.getError)(action.payload.error) || "Error loading saved map";

  _console["default"].warn(message);

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false,
    isCloudMapLoading: false,
    providerError: null
  });

  return (0, _tasks.withTask)(newState, createGlobalNotificationTasks({
    type: 'error',
    message: message,
    delayClose: false
  }));
};
/**
 *
 * @type {typeof import('./provider-state-updaters').resetProviderStatusUpdater}
 */


exports.loadCloudMapErrorUpdater = loadCloudMapErrorUpdater;

var resetProviderStatusUpdater = function resetProviderStatusUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false,
    providerError: null,
    isCloudMapLoading: false,
    successInfo: {}
  });
};
/**
 * Set current cloudProvider
 * @type {typeof import('./provider-state-updaters').setCloudProviderUpdater}
 */


exports.resetProviderStatusUpdater = resetProviderStatusUpdater;

var setCloudProviderUpdater = function setCloudProviderUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false,
    providerError: null,
    successInfo: {},
    currentProvider: action.payload
  });
};
/**
 *
 * @type {typeof import('./provider-state-updaters').getSavedMapsUpdater}
 */


exports.setCloudProviderUpdater = setCloudProviderUpdater;

var getSavedMapsUpdater = function getSavedMapsUpdater(state, action) {
  var provider = action.payload;

  if (!_validateProvider(provider, 'listMaps')) {
    return state;
  }

  var getSavedMapsTask = (0, _tasks2.GET_SAVED_MAPS_TASK)(provider).bimap( // success
  function (visualizations) {
    return (0, _providerActions.getSavedMapsSuccess)({
      visualizations: visualizations,
      provider: provider
    });
  }, // error
  function (error) {
    return (0, _providerActions.getSavedMapsError)({
      error: error,
      provider: provider
    });
  });
  return (0, _tasks.withTask)(_objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: true
  }), getSavedMapsTask);
};
/**
 *
 * @type {typeof import('./provider-state-updaters').getSavedMapsSuccessUpdater}
 */


exports.getSavedMapsUpdater = getSavedMapsUpdater;

var getSavedMapsSuccessUpdater = function getSavedMapsSuccessUpdater(state, action) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isProviderLoading: false,
    visualizations: action.payload.visualizations
  });
};
/**
 *
 * @type {typeof import('./provider-state-updaters').getSavedMapsErrorUpdater}
 */


exports.getSavedMapsSuccessUpdater = getSavedMapsSuccessUpdater;

var getSavedMapsErrorUpdater = function getSavedMapsErrorUpdater(state, action) {
  var message = (0, _utils.getError)(action.payload.error) || "Error getting saved maps from ".concat(state.currentProvider);

  _console["default"].warn(action.payload.error);

  var newState = _objectSpread(_objectSpread({}, state), {}, {
    currentProvider: null,
    isProviderLoading: false
  });

  return (0, _tasks.withTask)(newState, createGlobalNotificationTasks({
    type: 'error',
    message: message,
    delayClose: false
  }));
};

exports.getSavedMapsErrorUpdater = getSavedMapsErrorUpdater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy9wcm92aWRlci1zdGF0ZS11cGRhdGVycy5qcyJdLCJuYW1lcyI6WyJJTklUSUFMX1BST1ZJREVSX1NUQVRFIiwiaXNQcm92aWRlckxvYWRpbmciLCJpc0Nsb3VkTWFwTG9hZGluZyIsInByb3ZpZGVyRXJyb3IiLCJjdXJyZW50UHJvdmlkZXIiLCJzdWNjZXNzSW5mbyIsIm1hcFNhdmVkIiwidmlzdWFsaXphdGlvbnMiLCJjcmVhdGVBY3Rpb25UYXNrIiwiYWN0aW9uIiwicGF5bG9hZCIsIm1hcCIsIl8iLCJfdmFsaWRhdGVQcm92aWRlciIsInByb3ZpZGVyIiwibWV0aG9kIiwiQ29uc29sZSIsImVycm9yIiwibmFtZSIsImNyZWF0ZUdsb2JhbE5vdGlmaWNhdGlvblRhc2tzIiwidHlwZSIsIm1lc3NhZ2UiLCJkZWxheUNsb3NlIiwiaWQiLCJzdWNjZXNzTm90ZSIsIkRFRkFVTFRfTk9USUZJQ0FUSU9OX1RZUEVTIiwic3VjY2VzcyIsInRvcGljIiwiREVGQVVMVF9OT1RJRklDQVRJT05fVE9QSUNTIiwiZ2xvYmFsIiwidGFzayIsImV4cG9ydEZpbGVUb0Nsb3VkVXBkYXRlciIsInN0YXRlIiwibWFwRGF0YSIsIm9wdGlvbnMiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwiY2xvc2VNb2RhbCIsIm5ld1N0YXRlIiwidXBsb2FkRmlsZVRhc2siLCJiaW1hcCIsInJlc3BvbnNlIiwiZXhwb3J0RmlsZVN1Y2Nlc3NVcGRhdGVyIiwiaXNQdWJsaWMiLCJ0YXNrcyIsImZpbHRlciIsImQiLCJsZW5ndGgiLCJwb3N0U2F2ZUxvYWRTdWNjZXNzVXBkYXRlciIsImV4cG9ydEZpbGVFcnJvclVwZGF0ZXIiLCJpc0ZpbGVDb25mbGljdCIsIk9WRVJXUklURV9NQVBfSUQiLCJsb2FkQ2xvdWRNYXBVcGRhdGVyIiwibG9hZFBhcmFtcyIsIndhcm4iLCJGSUxFX0NPTkZMSUNUX01TRyIsImNoZWNrTG9hZE1hcFJlc3BvbnNlRXJyb3IiLCJFcnJvciIsImRhdGFzZXRzIiwiY29uZmlnIiwiZ2V0RGF0YXNldEhhbmRsZXIiLCJmb3JtYXQiLCJkZWZhdWx0SGFuZGxlciIsIkRBVEFTRVRfSEFORExFUlMiLCJEQVRBU0VUX0ZPUk1BVFMiLCJjc3YiLCJzdXBwb3J0ZWRGb3JtYXQiLCJPYmplY3QiLCJrZXlzIiwiayIsImpvaW4iLCJwYXJzZUxvYWRNYXBSZXNwb25zZSIsInByb2Nlc3Nvck1ldGhvZCIsInBhcnNlZERhdGFzZXRzIiwiZHMiLCJpIiwia2VwbGVyZ2wiLCJpbmZvIiwiZGF0YSIsImxvYWRDbG91ZE1hcFN1Y2Nlc3NVcGRhdGVyIiwiZm9ybWF0RXJyb3IiLCJsb2FkQ2xvdWRNYXBFcnJvclVwZGF0ZXIiLCJyZXNldFByb3ZpZGVyU3RhdHVzVXBkYXRlciIsInNldENsb3VkUHJvdmlkZXJVcGRhdGVyIiwiZ2V0U2F2ZWRNYXBzVXBkYXRlciIsImdldFNhdmVkTWFwc1Rhc2siLCJnZXRTYXZlZE1hcHNTdWNjZXNzVXBkYXRlciIsImdldFNhdmVkTWFwc0Vycm9yVXBkYXRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFPQTs7QUFVQTs7QUFDQTs7QUFDQTs7QUFPQTs7QUFDQTs7Ozs7O0FBRU8sSUFBTUEsc0JBQXNCLEdBQUc7QUFDcENDLEVBQUFBLGlCQUFpQixFQUFFLEtBRGlCO0FBRXBDQyxFQUFBQSxpQkFBaUIsRUFBRSxLQUZpQjtBQUdwQ0MsRUFBQUEsYUFBYSxFQUFFLElBSHFCO0FBSXBDQyxFQUFBQSxlQUFlLEVBQUUsSUFKbUI7QUFLcENDLEVBQUFBLFdBQVcsRUFBRSxFQUx1QjtBQU1wQ0MsRUFBQUEsUUFBUSxFQUFFLElBTjBCO0FBT3BDQyxFQUFBQSxjQUFjLEVBQUU7QUFQb0IsQ0FBL0I7OztBQVVQLFNBQVNDLGdCQUFULENBQTBCQyxNQUExQixFQUFrQ0MsT0FBbEMsRUFBMkM7QUFDekMsTUFBSSxPQUFPRCxNQUFQLEtBQWtCLFVBQXRCLEVBQWtDO0FBQ2hDLFdBQU8s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QUFDQyxPQUFQLENBQWVIO0FBSFM7QUFBQSxDQUFuQztBQU1QOzs7Ozs7OztBQUlPLElBQU1nRix3QkFBd0IsR0FBRyxTQUEzQkEsd0JBQTJCLENBQUN2RCxLQUFELEVBQVF2QixNQUFSLEVBQW1CO0FBQ3pELE1BQU1ZLE9BQU8sR0FDWCxxQkFBU1osTUFBTSxDQUFDQyxPQUFQLENBQWVPLEtBQXhCLDZDQUFtRWUsS0FBSyxDQUFDNUIsZUFBekUsQ0FERjs7QUFHQVksc0JBQVFzQyxJQUFSLENBQWE3QyxNQUFNLENBQUNDLE9BQVAsQ0FBZU8sS0FBNUI7O0FBRUEsTUFBTXFCLFFBQVEsbUNBQ1ROLEtBRFM7QUFFWjVCLElBQUFBLGVBQWUsRUFBRSxJQUZMO0FBR1pILElBQUFBLGlCQUFpQixFQUFFO0FBSFAsSUFBZDs7QUFNQSxTQUFPLHFCQUNMcUMsUUFESyxFQUVMbkIsNkJBQTZCLENBQUM7QUFBQ0MsSUFBQUEsSUFBSSxFQUFFLE9BQVA7QUFBZ0JDLElBQUFBLE9BQU8sRUFBUEEsT0FBaEI7QUFBeUJDLElBQUFBLFVBQVUsRUFBRTtBQUFyQyxHQUFELENBRnhCLENBQVA7QUFJRCxDQWhCTSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7d2l0aFRhc2t9IGZyb20gJ3JlYWN0LXBhbG0vdGFza3MnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIENvbnNvbGV9IGZyb20gJ2dsb2JhbC9jb25zb2xlJztcbmltcG9ydCB7Z2VuZXJhdGVIYXNoSWQsIGdldEVycm9yLCBpc1BsYWluT2JqZWN0fSBmcm9tICd1dGlscy91dGlscyc7XG5pbXBvcnQge1xuICBFWFBPUlRfRklMRV9UT19DTE9VRF9UQVNLLFxuICBBQ1RJT05fVEFTSyxcbiAgREVMQVlfVEFTSyxcbiAgTE9BRF9DTE9VRF9NQVBfVEFTSyxcbiAgR0VUX1NBVkVEX01BUFNfVEFTS1xufSBmcm9tICd0YXNrcy90YXNrcyc7XG5pbXBvcnQge1xuICBleHBvcnRGaWxlU3VjY2VzcyxcbiAgZXhwb3J0RmlsZUVycm9yLFxuICBwb3N0U2F2ZUxvYWRTdWNjZXNzLFxuICBsb2FkQ2xvdWRNYXBTdWNjZXNzLFxuICBnZXRTYXZlZE1hcHNTdWNjZXNzLFxuICBnZXRTYXZlZE1hcHNFcnJvcixcbiAgbG9hZENsb3VkTWFwRXJyb3IsXG4gIHJlc2V0UHJvdmlkZXJTdGF0dXNcbn0gZnJvbSAnYWN0aW9ucy9wcm92aWRlci1hY3Rpb25zJztcbmltcG9ydCB7cmVtb3ZlTm90aWZpY2F0aW9uLCB0b2dnbGVNb2RhbCwgYWRkTm90aWZpY2F0aW9ufSBmcm9tICdhY3Rpb25zL3VpLXN0YXRlLWFjdGlvbnMnO1xuaW1wb3J0IHthZGREYXRhVG9NYXB9IGZyb20gJ2FjdGlvbnMvYWN0aW9ucyc7XG5pbXBvcnQge1xuICBERUZBVUxUX05PVElGSUNBVElPTl9UWVBFUyxcbiAgREVGQVVMVF9OT1RJRklDQVRJT05fVE9QSUNTLFxuICBEQVRBU0VUX0ZPUk1BVFMsXG4gIE9WRVJXUklURV9NQVBfSURcbn0gZnJvbSAnY29uc3RhbnRzL2RlZmF1bHQtc2V0dGluZ3MnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICd1dGlscy91dGlscyc7XG5pbXBvcnQge0ZJTEVfQ09ORkxJQ1RfTVNHfSBmcm9tICdjbG91ZC1wcm92aWRlcnMnO1xuaW1wb3J0IHtEQVRBU0VUX0hBTkRMRVJTfSBmcm9tICdwcm9jZXNzb3JzL2RhdGEtcHJvY2Vzc29yJztcblxuZXhwb3J0IGNvbnN0IElOSVRJQUxfUFJPVklERVJfU1RBVEUgPSB7XG4gIGlzUHJvdmlkZXJMb2FkaW5nOiBmYWxzZSxcbiAgaXNDbG91ZE1hcExvYWRpbmc6IGZhbHNlLFxuICBwcm92aWRlckVycm9yOiBudWxsLFxuICBjdXJyZW50UHJvdmlkZXI6IG51bGwsXG4gIHN1Y2Nlc3NJbmZvOiB7fSxcbiAgbWFwU2F2ZWQ6IG51bGwsXG4gIHZpc3VhbGl6YXRpb25zOiBbXVxufTtcblxuZnVuY3Rpb24gY3JlYXRlQWN0aW9uVGFzayhhY3Rpb24sIHBheWxvYWQpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQUNUSU9OX1RBU0soKS5tYXAoXyA9PiBhY3Rpb24ocGF5bG9hZCkpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIF92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyLCBtZXRob2QpIHtcbiAgaWYgKCFwcm92aWRlcikge1xuICAgIENvbnNvbGUuZXJyb3IoYHByb3ZpZGVyIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcm92aWRlclttZXRob2RdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgQ29uc29sZS5lcnJvcihgJHttZXRob2R9IGlzIG5vdCBhIGZ1bmN0aW9uIG9mIENsb3VkIHByb3ZpZGVyOiAke3Byb3ZpZGVyLm5hbWV9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vcHJvdmlkZXItc3RhdGUtdXBkYXRlcnMnKS5jcmVhdGVHbG9iYWxOb3RpZmljYXRpb25UYXNrc31cbiAqL1xuZnVuY3Rpb24gY3JlYXRlR2xvYmFsTm90aWZpY2F0aW9uVGFza3Moe3R5cGUsIG1lc3NhZ2UsIGRlbGF5Q2xvc2UgPSB0cnVlfSkge1xuICBjb25zdCBpZCA9IGdlbmVyYXRlSGFzaElkKCk7XG4gIGNvbnN0IHN1Y2Nlc3NOb3RlID0ge1xuICAgIGlkLFxuICAgIHR5cGU6IERFRkFVTFRfTk9USUZJQ0FUSU9OX1RZUEVTW3R5cGVdIHx8IERFRkFVTFRfTk9USUZJQ0FUSU9OX1RZUEVTLnN1Y2Nlc3MsXG4gICAgdG9waWM6IERFRkFVTFRfTk9USUZJQ0FUSU9OX1RPUElDUy5nbG9iYWwsXG4gICAgbWVzc2FnZVxuICB9O1xuICBjb25zdCB0YXNrID0gQUNUSU9OX1RBU0soKS5tYXAoXyA9PiBhZGROb3RpZmljYXRpb24oc3VjY2Vzc05vdGUpKTtcbiAgcmV0dXJuIGRlbGF5Q2xvc2UgPyBbdGFzaywgREVMQVlfVEFTSygzMDAwKS5tYXAoXyA9PiByZW1vdmVOb3RpZmljYXRpb24oaWQpKV0gOiBbdGFza107XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2Qgd2lsbCBleHBvcnQgdGhlIGN1cnJlbnQga2VwbGVyIGNvbmZpZyBmaWxlIHRvIHRoZSBjaG9zZW4gY2xvdWQgcHJvZGVyXG4gKiBhZGQgcmV0dXJucyBhIHNoYXJlIFVSTFxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Byb3ZpZGVyLXN0YXRlLXVwZGF0ZXJzJykuZXhwb3J0RmlsZVRvQ2xvdWRVcGRhdGVyfVxuICovXG5leHBvcnQgY29uc3QgZXhwb3J0RmlsZVRvQ2xvdWRVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge21hcERhdGEsIHByb3ZpZGVyLCBvcHRpb25zID0ge30sIG9uU3VjY2Vzcywgb25FcnJvciwgY2xvc2VNb2RhbH0gPSBhY3Rpb24ucGF5bG9hZDtcblxuICBpZiAoIV92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyLCAndXBsb2FkTWFwJykpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBpc1Byb3ZpZGVyTG9hZGluZzogdHJ1ZSxcbiAgICBjdXJyZW50UHJvdmlkZXI6IHByb3ZpZGVyLm5hbWVcbiAgfTtcblxuICAvLyBwYXlsb2FkIGNhbGxlZCBieSBwcm92aWRlci51cGxvYWRNYXBcbiAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICBtYXBEYXRhLFxuICAgIG9wdGlvbnNcbiAgfTtcbiAgY29uc3QgdXBsb2FkRmlsZVRhc2sgPSBFWFBPUlRfRklMRV9UT19DTE9VRF9UQVNLKHtwcm92aWRlciwgcGF5bG9hZH0pLmJpbWFwKFxuICAgIC8vIHN1Y2Nlc3NcbiAgICByZXNwb25zZSA9PiBleHBvcnRGaWxlU3VjY2Vzcyh7cmVzcG9uc2UsIHByb3ZpZGVyLCBvcHRpb25zLCBvblN1Y2Nlc3MsIGNsb3NlTW9kYWx9KSxcbiAgICAvLyBlcnJvclxuICAgIGVycm9yID0+IGV4cG9ydEZpbGVFcnJvcih7ZXJyb3IsIHByb3ZpZGVyLCBvcHRpb25zLCBvbkVycm9yfSlcbiAgKTtcblxuICByZXR1cm4gd2l0aFRhc2sobmV3U3RhdGUsIHVwbG9hZEZpbGVUYXNrKTtcbn07XG5cbi8qKlxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Byb3ZpZGVyLXN0YXRlLXVwZGF0ZXJzJykuZXhwb3J0RmlsZVN1Y2Nlc3NVcGRhdGVyfVxuICovXG5leHBvcnQgY29uc3QgZXhwb3J0RmlsZVN1Y2Nlc3NVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge3Jlc3BvbnNlLCBwcm92aWRlciwgb3B0aW9ucyA9IHt9LCBvblN1Y2Nlc3MsIGNsb3NlTW9kYWx9ID0gYWN0aW9uLnBheWxvYWQ7XG5cbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgaXNQcm92aWRlckxvYWRpbmc6IGZhbHNlLFxuICAgIC8vIFRPRE86IGRvIHdlIGFsd2F5cyBoYXZlIHRvIHN0b3JlIHRoaXM/XG4gICAgc3VjY2Vzc0luZm86IHJlc3BvbnNlLFxuICAgIC4uLighb3B0aW9ucy5pc1B1YmxpY1xuICAgICAgPyB7XG4gICAgICAgICAgbWFwU2F2ZWQ6IHByb3ZpZGVyLm5hbWVcbiAgICAgICAgfVxuICAgICAgOiB7fSlcbiAgfTtcblxuICBjb25zdCB0YXNrcyA9IFtcbiAgICBjcmVhdGVBY3Rpb25UYXNrKG9uU3VjY2Vzcywge3Jlc3BvbnNlLCBwcm92aWRlciwgb3B0aW9uc30pLFxuICAgIGNsb3NlTW9kYWwgJiZcbiAgICAgIEFDVElPTl9UQVNLKCkubWFwKF8gPT4gcG9zdFNhdmVMb2FkU3VjY2VzcyhgTWFwIHNhdmVkIHRvICR7c3RhdGUuY3VycmVudFByb3ZpZGVyfSFgKSlcbiAgXS5maWx0ZXIoZCA9PiBkKTtcblxuICByZXR1cm4gdGFza3MubGVuZ3RoID8gd2l0aFRhc2sobmV3U3RhdGUsIHRhc2tzKSA6IG5ld1N0YXRlO1xufTtcblxuLyoqXG4gKiBDbG9zZSBtb2RhbCBvbiBzdWNjZXNzIGFuZCBkaXNwbGF5IG5vdGlmaWNhdGlvblxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vcHJvdmlkZXItc3RhdGUtdXBkYXRlcnMnKS5wb3N0U2F2ZUxvYWRTdWNjZXNzVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IHBvc3RTYXZlTG9hZFN1Y2Nlc3NVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgbWVzc2FnZSA9IGFjdGlvbi5wYXlsb2FkIHx8IGBTYXZlZCAvIExvYWQgdG8gJHtzdGF0ZS5jdXJyZW50UHJvdmlkZXJ9IFN1Y2Nlc3NgO1xuXG4gIGNvbnN0IHRhc2tzID0gW1xuICAgIEFDVElPTl9UQVNLKCkubWFwKF8gPT4gdG9nZ2xlTW9kYWwobnVsbCkpLFxuICAgIEFDVElPTl9UQVNLKCkubWFwKF8gPT4gcmVzZXRQcm92aWRlclN0YXR1cygpKSxcbiAgICAuLi5jcmVhdGVHbG9iYWxOb3RpZmljYXRpb25UYXNrcyh7bWVzc2FnZX0pXG4gIF07XG5cbiAgcmV0dXJuIHdpdGhUYXNrKHN0YXRlLCB0YXNrcyk7XG59O1xuXG4vKipcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9wcm92aWRlci1zdGF0ZS11cGRhdGVycycpLmV4cG9ydEZpbGVFcnJvclVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBleHBvcnRGaWxlRXJyb3JVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge2Vycm9yLCBwcm92aWRlciwgb25FcnJvcn0gPSBhY3Rpb24ucGF5bG9hZDtcblxuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBpc1Byb3ZpZGVyTG9hZGluZzogZmFsc2VcbiAgfTtcblxuICBpZiAoaXNGaWxlQ29uZmxpY3QoZXJyb3IpKSB7XG4gICAgbmV3U3RhdGUubWFwU2F2ZWQgPSBwcm92aWRlci5uYW1lO1xuICAgIHJldHVybiB3aXRoVGFzayhuZXdTdGF0ZSwgW0FDVElPTl9UQVNLKCkubWFwKF8gPT4gdG9nZ2xlTW9kYWwoT1ZFUldSSVRFX01BUF9JRCkpXSk7XG4gIH1cblxuICBuZXdTdGF0ZS5wcm92aWRlckVycm9yID0gZ2V0RXJyb3IoZXJyb3IpO1xuICBjb25zdCB0YXNrID0gY3JlYXRlQWN0aW9uVGFzayhvbkVycm9yLCB7ZXJyb3IsIHByb3ZpZGVyfSk7XG5cbiAgcmV0dXJuIHRhc2sgPyB3aXRoVGFzayhuZXdTdGF0ZSwgdGFzaykgOiBuZXdTdGF0ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2FkQ2xvdWRNYXBVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge2xvYWRQYXJhbXMsIHByb3ZpZGVyLCBvblN1Y2Nlc3MsIG9uRXJyb3J9ID0gYWN0aW9uLnBheWxvYWQ7XG4gIGlmICghbG9hZFBhcmFtcykge1xuICAgIENvbnNvbGUud2FybignbG9hZCBtYXAgZXJyb3I6IGxvYWRQYXJhbXMgaXMgdW5kZWZpbmVkJyk7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIGlmICghX3ZhbGlkYXRlUHJvdmlkZXIocHJvdmlkZXIsICdkb3dubG9hZE1hcCcpKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgaXNQcm92aWRlckxvYWRpbmc6IHRydWUsXG4gICAgaXNDbG91ZE1hcExvYWRpbmc6IHRydWVcbiAgfTtcblxuICAvLyBwYXlsb2FkIGNhbGxlZCBieSBwcm92aWRlci5kb3dubG9hZE1hcFxuICBjb25zdCB1cGxvYWRGaWxlVGFzayA9IExPQURfQ0xPVURfTUFQX1RBU0soe3Byb3ZpZGVyLCBwYXlsb2FkOiBsb2FkUGFyYW1zfSkuYmltYXAoXG4gICAgLy8gc3VjY2Vzc1xuICAgIHJlc3BvbnNlID0+IGxvYWRDbG91ZE1hcFN1Y2Nlc3Moe3Jlc3BvbnNlLCBsb2FkUGFyYW1zLCBwcm92aWRlciwgb25TdWNjZXNzLCBvbkVycm9yfSksXG4gICAgLy8gZXJyb3JcbiAgICBlcnJvciA9PiBsb2FkQ2xvdWRNYXBFcnJvcih7ZXJyb3IsIHByb3ZpZGVyLCBvbkVycm9yfSlcbiAgKTtcblxuICByZXR1cm4gd2l0aFRhc2sobmV3U3RhdGUsIHVwbG9hZEZpbGVUYXNrKTtcbn07XG5cbmZ1bmN0aW9uIGlzRmlsZUNvbmZsaWN0KGVycm9yKSB7XG4gIHJldHVybiBlcnJvciAmJiBlcnJvci5tZXNzYWdlID09PSBGSUxFX0NPTkZMSUNUX01TRztcbn1cblxuZnVuY3Rpb24gY2hlY2tMb2FkTWFwUmVzcG9uc2VFcnJvcihyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlIHx8ICFpc1BsYWluT2JqZWN0KHJlc3BvbnNlKSkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoJ0xvYWQgbWFwIHJlc3BvbnNlIGlzIGVtcHR5Jyk7XG4gIH1cbiAgaWYgKCFpc1BsYWluT2JqZWN0KHJlc3BvbnNlLm1hcCkpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKGBMb2FkIG1hcCByZXNwb25zZSBzaG91bGQgYmUgYW4gb2JqZWN0IHByb3BlcnR5IFwibWFwXCJgKTtcbiAgfVxuICBpZiAoIXJlc3BvbnNlLm1hcC5kYXRhc2V0cyB8fCAhcmVzcG9uc2UubWFwLmNvbmZpZykge1xuICAgIHJldHVybiBuZXcgRXJyb3IoYExvYWQgbWFwIHJlc3BvbnNlLm1hcCBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggcHJvcGVydHkgZGF0YXNldHMgb3IgY29uZmlnYCk7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YXNldEhhbmRsZXIoZm9ybWF0KSB7XG4gIGNvbnN0IGRlZmF1bHRIYW5kbGVyID0gREFUQVNFVF9IQU5ETEVSU1tEQVRBU0VUX0ZPUk1BVFMuY3N2XTtcbiAgaWYgKCFmb3JtYXQpIHtcbiAgICBDb25zb2xlLndhcm4oJ2Zvcm1hdCBpcyBub3QgcHJvdmlkZWQgaW4gbG9hZCBtYXAgcmVzcG9uc2UsIHdpbGwgdXNlIGNzdiBieSBkZWZhdWx0Jyk7XG4gICAgcmV0dXJuIGRlZmF1bHRIYW5kbGVyO1xuICB9XG5cbiAgaWYgKCFEQVRBU0VUX0hBTkRMRVJTW2Zvcm1hdF0pIHtcbiAgICBjb25zdCBzdXBwb3J0ZWRGb3JtYXQgPSBPYmplY3Qua2V5cyhEQVRBU0VUX0ZPUk1BVFMpXG4gICAgICAubWFwKGsgPT4gYCcke2t9J2ApXG4gICAgICAuam9pbignLCAnKTtcbiAgICBDb25zb2xlLndhcm4oXG4gICAgICBgdW5rbm93biBmb3JtYXQgJHtmb3JtYXR9LiBQbGVhc2UgdXNlIG9uZSBvZiAke3N1cHBvcnRlZEZvcm1hdH0sIHdpbGwgdXNlIGNzdiBieSBkZWZhdWx0YFxuICAgICk7XG4gICAgcmV0dXJuIGRlZmF1bHRIYW5kbGVyO1xuICB9XG5cbiAgcmV0dXJuIERBVEFTRVRfSEFORExFUlNbZm9ybWF0XTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMb2FkTWFwUmVzcG9uc2UocmVzcG9uc2UsIGxvYWRQYXJhbXMsIHByb3ZpZGVyKSB7XG4gIGNvbnN0IHttYXAsIGZvcm1hdH0gPSByZXNwb25zZTtcbiAgY29uc3QgcHJvY2Vzc29yTWV0aG9kID0gZ2V0RGF0YXNldEhhbmRsZXIoZm9ybWF0KTtcblxuICBjb25zdCBwYXJzZWREYXRhc2V0cyA9IHRvQXJyYXkobWFwLmRhdGFzZXRzKS5tYXAoKGRzLCBpKSA9PiB7XG4gICAgaWYgKGZvcm1hdCA9PT0gREFUQVNFVF9GT1JNQVRTLmtlcGxlcmdsKSB7XG4gICAgICAvLyBubyBuZWVkIHRvIG9idGFpbiBpZCwgZGlyZWN0bHkgcGFzcyB0aGVtIGluXG4gICAgICByZXR1cm4gcHJvY2Vzc29yTWV0aG9kKGRzKTtcbiAgICB9XG4gICAgY29uc3QgaW5mbyA9IChkcyAmJiBkcy5pbmZvKSB8fCB7aWQ6IGdlbmVyYXRlSGFzaElkKDYpfTtcbiAgICBjb25zdCBkYXRhID0gcHJvY2Vzc29yTWV0aG9kKGRzLmRhdGEgfHwgZHMpO1xuICAgIHJldHVybiB7aW5mbywgZGF0YX07XG4gIH0pO1xuXG4gIGNvbnN0IGluZm8gPSB7XG4gICAgLi4ubWFwLmluZm8sXG4gICAgcHJvdmlkZXI6IHByb3ZpZGVyLm5hbWUsXG4gICAgbG9hZFBhcmFtc1xuICB9O1xuICByZXR1cm4ge1xuICAgIGRhdGFzZXRzOiBwYXJzZWREYXRhc2V0cyxcbiAgICBpbmZvLFxuICAgIC4uLihtYXAuY29uZmlnID8ge2NvbmZpZzogbWFwLmNvbmZpZ30gOiB7fSlcbiAgfTtcbn1cblxuLyoqXG4gKlxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vcHJvdmlkZXItc3RhdGUtdXBkYXRlcnMnKS5sb2FkQ2xvdWRNYXBTdWNjZXNzVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRDbG91ZE1hcFN1Y2Nlc3NVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge3Jlc3BvbnNlLCBsb2FkUGFyYW1zLCBwcm92aWRlciwgb25TdWNjZXNzLCBvbkVycm9yfSA9IGFjdGlvbi5wYXlsb2FkO1xuXG4gIGNvbnN0IGZvcm1hdEVycm9yID0gY2hlY2tMb2FkTWFwUmVzcG9uc2VFcnJvcihyZXNwb25zZSk7XG4gIGlmIChmb3JtYXRFcnJvcikge1xuICAgIC8vIGlmIHJlc3BvbnNlIGZvcm1hdCBpcyBub3QgY29ycmVjdFxuICAgIHJldHVybiBleHBvcnRGaWxlRXJyb3JVcGRhdGVyKHN0YXRlLCB7XG4gICAgICBwYXlsb2FkOiB7ZXJyb3I6IGZvcm1hdEVycm9yLCBwcm92aWRlciwgb25FcnJvcn1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIG1hcFNhdmVkOiBwcm92aWRlci5uYW1lLFxuICAgIGN1cnJlbnRQcm92aWRlcjogcHJvdmlkZXIubmFtZSxcbiAgICBpc0Nsb3VkTWFwTG9hZGluZzogZmFsc2UsXG4gICAgaXNQcm92aWRlckxvYWRpbmc6IGZhbHNlXG4gIH07XG5cbiAgY29uc3QgcGF5bG9hZCA9IHBhcnNlTG9hZE1hcFJlc3BvbnNlKHJlc3BvbnNlLCBsb2FkUGFyYW1zLCBwcm92aWRlcik7XG5cbiAgY29uc3QgdGFza3MgPSBbXG4gICAgQUNUSU9OX1RBU0soKS5tYXAoXyA9PiBhZGREYXRhVG9NYXAocGF5bG9hZCkpLFxuICAgIGNyZWF0ZUFjdGlvblRhc2sob25TdWNjZXNzLCB7cmVzcG9uc2UsIGxvYWRQYXJhbXMsIHByb3ZpZGVyfSksXG4gICAgQUNUSU9OX1RBU0soKS5tYXAoXyA9PiBwb3N0U2F2ZUxvYWRTdWNjZXNzKGBNYXAgZnJvbSAke3Byb3ZpZGVyLm5hbWV9IGxvYWRlZGApKVxuICBdLmZpbHRlcihkID0+IGQpO1xuXG4gIHJldHVybiB0YXNrcy5sZW5ndGggPyB3aXRoVGFzayhuZXdTdGF0ZSwgdGFza3MpIDogbmV3U3RhdGU7XG59O1xuXG4vKipcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9wcm92aWRlci1zdGF0ZS11cGRhdGVycycpLmxvYWRDbG91ZE1hcEVycm9yVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRDbG91ZE1hcEVycm9yVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBnZXRFcnJvcihhY3Rpb24ucGF5bG9hZC5lcnJvcikgfHwgYEVycm9yIGxvYWRpbmcgc2F2ZWQgbWFwYDtcblxuICBDb25zb2xlLndhcm4obWVzc2FnZSk7XG5cbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgaXNQcm92aWRlckxvYWRpbmc6IGZhbHNlLFxuICAgIGlzQ2xvdWRNYXBMb2FkaW5nOiBmYWxzZSxcbiAgICBwcm92aWRlckVycm9yOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIHdpdGhUYXNrKFxuICAgIG5ld1N0YXRlLFxuICAgIGNyZWF0ZUdsb2JhbE5vdGlmaWNhdGlvblRhc2tzKHt0eXBlOiAnZXJyb3InLCBtZXNzYWdlLCBkZWxheUNsb3NlOiBmYWxzZX0pXG4gICk7XG59O1xuXG4vKipcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9wcm92aWRlci1zdGF0ZS11cGRhdGVycycpLnJlc2V0UHJvdmlkZXJTdGF0dXNVcGRhdGVyfVxuICovXG5leHBvcnQgY29uc3QgcmVzZXRQcm92aWRlclN0YXR1c1VwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGlzUHJvdmlkZXJMb2FkaW5nOiBmYWxzZSxcbiAgcHJvdmlkZXJFcnJvcjogbnVsbCxcbiAgaXNDbG91ZE1hcExvYWRpbmc6IGZhbHNlLFxuICBzdWNjZXNzSW5mbzoge31cbn0pO1xuXG4vKipcbiAqIFNldCBjdXJyZW50IGNsb3VkUHJvdmlkZXJcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Byb3ZpZGVyLXN0YXRlLXVwZGF0ZXJzJykuc2V0Q2xvdWRQcm92aWRlclVwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBzZXRDbG91ZFByb3ZpZGVyVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgaXNQcm92aWRlckxvYWRpbmc6IGZhbHNlLFxuICBwcm92aWRlckVycm9yOiBudWxsLFxuICBzdWNjZXNzSW5mbzoge30sXG4gIGN1cnJlbnRQcm92aWRlcjogYWN0aW9uLnBheWxvYWRcbn0pO1xuXG4vKipcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9wcm92aWRlci1zdGF0ZS11cGRhdGVycycpLmdldFNhdmVkTWFwc1VwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTYXZlZE1hcHNVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgcHJvdmlkZXIgPSBhY3Rpb24ucGF5bG9hZDtcbiAgaWYgKCFfdmFsaWRhdGVQcm92aWRlcihwcm92aWRlciwgJ2xpc3RNYXBzJykpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCBnZXRTYXZlZE1hcHNUYXNrID0gR0VUX1NBVkVEX01BUFNfVEFTSyhwcm92aWRlcikuYmltYXAoXG4gICAgLy8gc3VjY2Vzc1xuICAgIHZpc3VhbGl6YXRpb25zID0+IGdldFNhdmVkTWFwc1N1Y2Nlc3Moe3Zpc3VhbGl6YXRpb25zLCBwcm92aWRlcn0pLFxuICAgIC8vIGVycm9yXG4gICAgZXJyb3IgPT4gZ2V0U2F2ZWRNYXBzRXJyb3Ioe2Vycm9yLCBwcm92aWRlcn0pXG4gICk7XG5cbiAgcmV0dXJuIHdpdGhUYXNrKFxuICAgIHtcbiAgICAgIC4uLnN0YXRlLFxuICAgICAgaXNQcm92aWRlckxvYWRpbmc6IHRydWVcbiAgICB9LFxuICAgIGdldFNhdmVkTWFwc1Rhc2tcbiAgKTtcbn07XG5cbi8qKlxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL3Byb3ZpZGVyLXN0YXRlLXVwZGF0ZXJzJykuZ2V0U2F2ZWRNYXBzU3VjY2Vzc1VwZGF0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTYXZlZE1hcHNTdWNjZXNzVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgaXNQcm92aWRlckxvYWRpbmc6IGZhbHNlLFxuICB2aXN1YWxpemF0aW9uczogYWN0aW9uLnBheWxvYWQudmlzdWFsaXphdGlvbnNcbn0pO1xuXG4vKipcbiAqXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9wcm92aWRlci1zdGF0ZS11cGRhdGVycycpLmdldFNhdmVkTWFwc0Vycm9yVXBkYXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNhdmVkTWFwc0Vycm9yVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGNvbnN0IG1lc3NhZ2UgPVxuICAgIGdldEVycm9yKGFjdGlvbi5wYXlsb2FkLmVycm9yKSB8fCBgRXJyb3IgZ2V0dGluZyBzYXZlZCBtYXBzIGZyb20gJHtzdGF0ZS5jdXJyZW50UHJvdmlkZXJ9YDtcblxuICBDb25zb2xlLndhcm4oYWN0aW9uLnBheWxvYWQuZXJyb3IpO1xuXG4gIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRQcm92aWRlcjogbnVsbCxcbiAgICBpc1Byb3ZpZGVyTG9hZGluZzogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gd2l0aFRhc2soXG4gICAgbmV3U3RhdGUsXG4gICAgY3JlYXRlR2xvYmFsTm90aWZpY2F0aW9uVGFza3Moe3R5cGU6ICdlcnJvcicsIG1lc3NhZ2UsIGRlbGF5Q2xvc2U6IGZhbHNlfSlcbiAgKTtcbn07XG4iXX0=