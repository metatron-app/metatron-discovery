"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.colorMaker = exports.layerColors = exports.OVERLAY_TYPE = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _window = require("global/window");

var _keymirror = _interopRequireDefault(require("keymirror"));

var _extensions = require("@deck.gl/extensions");

var _core = require("@deck.gl/core");

var _layers = require("@deck.gl/layers");

var _defaultLayerIcon = _interopRequireDefault(require("./default-layer-icon"));

var _layerUpdate = require("./layer-update");

var _defaultSettings = require("../constants/default-settings");

var _colorRanges = require("../constants/color-ranges");

var _customColorRanges = require("../constants/custom-color-ranges");

var _layerFactory = require("./layer-factory");

var _utils = require("../utils/utils");

var _dataUtils = require("../utils/data-utils");

var _dataScaleUtils = require("../utils/data-scale-utils");

var _colorUtils = require("../utils/color-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _marked = /*#__PURE__*/_regenerator["default"].mark(generateColor);

/**
 * Approx. number of points to sample in a large data set
 * @type {number}
 */
var MAX_SAMPLE_SIZE = 5000;
var dataFilterExtension = new _extensions.DataFilterExtension({
  filterSize: _defaultSettings.MAX_GPU_FILTERS
});

var identity = function identity(d) {
  return d;
};

var OVERLAY_TYPE = (0, _keymirror["default"])({
  deckgl: null,
  mapboxgl: null
});
exports.OVERLAY_TYPE = OVERLAY_TYPE;
var layerColors = Object.values(_customColorRanges.DataVizColors).map(_colorUtils.hexToRgb);
exports.layerColors = layerColors;

function generateColor() {
  var index;
  return _regenerator["default"].wrap(function generateColor$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          index = 0;

        case 1:
          if (!(index < layerColors.length + 1)) {
            _context.next = 7;
            break;
          }

          if (index === layerColors.length) {
            index = 0;
          }

          _context.next = 5;
          return layerColors[index++];

        case 5:
          _context.next = 1;
          break;

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

var colorMaker = generateColor();
exports.colorMaker = colorMaker;

var defaultGetFieldValue = function defaultGetFieldValue(field, d) {
  return d[field.tableFieldIndex - 1];
};

var Layer = /*#__PURE__*/function () {
  function Layer() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Layer);
    this.id = props.id || (0, _utils.generateHashId)(6); // meta

    this.meta = {}; // visConfigSettings

    this.visConfigSettings = {};
    this.config = this.getDefaultLayerConfig(_objectSpread({
      columns: this.getLayerColumns()
    }, props));
  }

  (0, _createClass2["default"])(Layer, [{
    key: "getDefaultLayerConfig",
    value: function getDefaultLayerConfig() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        dataId: props.dataId || null,
        label: props.label || 'new layer',
        color: props.color || colorMaker.next().value,
        columns: props.columns || null,
        isVisible: props.isVisible || false,
        isConfigActive: props.isConfigActive || false,
        highlightColor: props.highlightColor || [252, 242, 26, 255],
        hidden: props.hidden || false,
        // TODO: refactor this into separate visual Channel config
        // color by field, domain is set by filters, field, scale type
        colorField: null,
        colorDomain: [0, 1],
        colorScale: _defaultSettings.SCALE_TYPES.quantile,
        // color by size, domain is set by filters, field, scale type
        sizeDomain: [0, 1],
        sizeScale: _defaultSettings.SCALE_TYPES.linear,
        sizeField: null,
        visConfig: {},
        textLabel: [_layerFactory.DEFAULT_TEXT_LABEL],
        colorUI: {
          color: _layerFactory.DEFAULT_COLOR_UI,
          colorRange: _layerFactory.DEFAULT_COLOR_UI
        },
        animation: {
          enabled: false
        }
      };
    }
    /**
     * Get the description of a visualChannel config
     * @param key
     * @returns {{label: string, measure: (string|string)}}
     */

  }, {
    key: "getVisualChannelDescription",
    value: function getVisualChannelDescription(key) {
      // e.g. label: Color, measure: Vehicle Type
      return {
        label: this.visConfigSettings[this.visualChannels[key].range].label,
        measure: this.config[this.visualChannels[key].field] ? this.config[this.visualChannels[key].field].name : this.visualChannels[key].defaultMeasure
      };
    }
    /**
     * Assign a field to layer column, return column config
     * @param key - Column Key
     * @param field - Selected field
     * @returns {{}} - Column config
     */

  }, {
    key: "assignColumn",
    value: function assignColumn(key, field) {
      // field value could be null for optional columns
      var update = field ? {
        value: field.name,
        fieldIdx: field.tableFieldIndex - 1
      } : {
        value: null,
        fieldIdx: -1
      };
      return _objectSpread(_objectSpread({}, this.config.columns), {}, (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, this.config.columns[key]), update)));
    }
    /**
     * Assign a field pair to column config, return column config
     * @param key - Column Key
     * @param pair - field Pair
     * @returns {{}} - Column config
     */

  }, {
    key: "assignColumnPairs",
    value: function assignColumnPairs(key, pair) {
      var _objectSpread3;

      if (!this.columnPairs || !this.columnPairs[key]) {
        // should not end in this state
        return this.config.columns;
      }

      var _this$columnPairs$key = this.columnPairs[key],
          partnerKey = _this$columnPairs$key.pair,
          fieldPairKey = _this$columnPairs$key.fieldPairKey;
      var partnerFieldPairKey = this.columnPairs[partnerKey].fieldPairKey;
      return _objectSpread(_objectSpread({}, this.config.columns), {}, (_objectSpread3 = {}, (0, _defineProperty2["default"])(_objectSpread3, key, pair[fieldPairKey]), (0, _defineProperty2["default"])(_objectSpread3, partnerKey, pair[partnerFieldPairKey]), _objectSpread3));
    }
    /**
     * Calculate a radius zoom multiplier to render points, so they are visible in all zoom level
     * @param mapState
     * @param mapState.zoom - actual zoom
     * @param mapState.zoomOffset - zoomOffset when render in the plot container for export image
     * @returns {number}
     */

  }, {
    key: "getZoomFactor",
    value: function getZoomFactor(_ref) {
      var zoom = _ref.zoom,
          _ref$zoomOffset = _ref.zoomOffset,
          zoomOffset = _ref$zoomOffset === void 0 ? 0 : _ref$zoomOffset;
      return Math.pow(2, Math.max(14 - zoom + zoomOffset, 0));
    }
    /**
     * Calculate a elevation zoom multiplier to render points, so they are visible in all zoom level
     * @param mapState
     * @param mapState.zoom - actual zoom
     * @param mapState.zoomOffset - zoomOffset when render in the plot container for export image
     * @returns {number}
     */

  }, {
    key: "getElevationZoomFactor",
    value: function getElevationZoomFactor(_ref2) {
      var zoom = _ref2.zoom,
          _ref2$zoomOffset = _ref2.zoomOffset,
          zoomOffset = _ref2$zoomOffset === void 0 ? 0 : _ref2$zoomOffset;
      return Math.pow(2, Math.max(8 - zoom + zoomOffset, 0));
    }
  }, {
    key: "formatLayerData",
    value: function formatLayerData(datasets, filteredIndex) {
      return {};
    }
  }, {
    key: "renderLayer",
    value: function renderLayer() {
      return [];
    }
  }, {
    key: "getHoverData",
    value: function getHoverData(object) {
      if (!object) {
        return null;
      } // by default, each entry of layerData should have a data property points
      // to the original item in the allData array
      // each layer can implement its own getHoverData method


      return object.data;
    }
    /**
     * When change layer type, try to copy over layer configs as much as possible
     * @param configToCopy - config to copy over
     * @param visConfigSettings - visConfig settings of config to copy
     */

  }, {
    key: "assignConfigToLayer",
    value: function assignConfigToLayer(configToCopy, visConfigSettings) {
      var _this = this;

      // don't deep merge visualChannel field
      // don't deep merge color range, reversed: is not a key by default
      var shallowCopy = ['colorRange', 'strokeColorRange'].concat(Object.values(this.visualChannels).map(function (v) {
        return v.field;
      })); // don't copy over domain and animation

      var notToCopy = ['animation'].concat(Object.values(this.visualChannels).map(function (v) {
        return v.domain;
      })); // if range is for the same property group copy it, otherwise, not to copy

      Object.values(this.visualChannels).forEach(function (v) {
        if (configToCopy.visConfig[v.range] && visConfigSettings[v.range].group !== _this.visConfigSettings[v.range].group) {
          notToCopy.push(v.range);
        }
      }); // don't copy over visualChannel range

      var currentConfig = this.config;
      var copied = this.copyLayerConfig(currentConfig, configToCopy, {
        shallowCopy: shallowCopy,
        notToCopy: notToCopy
      });
      this.updateLayerConfig(copied); // validate visualChannel field type and scale types

      Object.keys(this.visualChannels).forEach(function (channel) {
        _this.validateVisualChannel(channel);
      });
    }
    /*
     * Recursively copy config over to an empty layer
     * when received saved config, or copy config over from a different layer type
     * make sure to only copy over value to existing keys
     * @param {object} currentConfig - existing config to be override
     * @param {object} configToCopy - new Config to copy over
     * @param {string[]} shallowCopy - array of properties to not to be deep copied
     * @param {string[]} notToCopy - array of properties not to copy
     * @returns {object} - copied config
     */

  }, {
    key: "copyLayerConfig",
    value: function copyLayerConfig(currentConfig, configToCopy) {
      var _this2 = this;

      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$shallowCopy = _ref3.shallowCopy,
          shallowCopy = _ref3$shallowCopy === void 0 ? [] : _ref3$shallowCopy,
          _ref3$notToCopy = _ref3.notToCopy,
          notToCopy = _ref3$notToCopy === void 0 ? [] : _ref3$notToCopy;

      var copied = {};
      Object.keys(currentConfig).forEach(function (key) {
        if ((0, _utils.isPlainObject)(currentConfig[key]) && (0, _utils.isPlainObject)(configToCopy[key]) && !shallowCopy.includes(key) && !notToCopy.includes(key)) {
          // recursively assign object value
          copied[key] = _this2.copyLayerConfig(currentConfig[key], configToCopy[key], {
            shallowCopy: shallowCopy,
            notToCopy: notToCopy
          });
        } else if ((0, _dataUtils.notNullorUndefined)(configToCopy[key]) && !notToCopy.includes(key)) {
          // copy
          copied[key] = configToCopy[key];
        } else {
          // keep existing
          copied[key] = currentConfig[key];
        }
      });
      return copied;
    }
  }, {
    key: "registerVisConfig",
    value: function registerVisConfig(layerVisConfigs) {
      var _this3 = this;

      Object.keys(layerVisConfigs).forEach(function (item) {
        if (typeof item === 'string' && _layerFactory.LAYER_VIS_CONFIGS[layerVisConfigs[item]]) {
          // if assigned one of default LAYER_CONFIGS
          _this3.config.visConfig[item] = _layerFactory.LAYER_VIS_CONFIGS[layerVisConfigs[item]].defaultValue;
          _this3.visConfigSettings[item] = _layerFactory.LAYER_VIS_CONFIGS[layerVisConfigs[item]];
        } else if (['type', 'defaultValue'].every(function (p) {
          return layerVisConfigs[item].hasOwnProperty(p);
        })) {
          // if provided customized visConfig, and has type && defaultValue
          // TODO: further check if customized visConfig is valid
          _this3.config.visConfig[item] = layerVisConfigs[item].defaultValue;
          _this3.visConfigSettings[item] = layerVisConfigs[item];
        }
      });
    }
  }, {
    key: "getLayerColumns",
    value: function getLayerColumns() {
      var required = this.requiredLayerColumns.reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, {
          value: null,
          fieldIdx: -1
        }));
      }, {});
      var optional = this.optionalColumns.reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, {
          value: null,
          fieldIdx: -1,
          optional: true
        }));
      }, {});
      return _objectSpread(_objectSpread({}, required), optional);
    }
  }, {
    key: "updateLayerConfig",
    value: function updateLayerConfig(newConfig) {
      this.config = _objectSpread(_objectSpread({}, this.config), newConfig);
      return this;
    }
  }, {
    key: "updateLayerVisConfig",
    value: function updateLayerVisConfig(newVisConfig) {
      this.config.visConfig = _objectSpread(_objectSpread({}, this.config.visConfig), newVisConfig);
      return this;
    }
  }, {
    key: "updateLayerColorUI",
    value: function updateLayerColorUI(prop, newConfig) {
      var _this$config = this.config,
          previous = _this$config.colorUI,
          visConfig = _this$config.visConfig;

      if (!(0, _utils.isPlainObject)(newConfig) || typeof prop !== 'string') {
        return this;
      }

      var colorUIProp = Object.entries(newConfig).reduce(function (accu, _ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, (0, _utils.isPlainObject)(accu[key]) && (0, _utils.isPlainObject)(value) ? _objectSpread(_objectSpread({}, accu[key]), value) : value));
      }, previous[prop] || _layerFactory.DEFAULT_COLOR_UI);

      var colorUI = _objectSpread(_objectSpread({}, previous), {}, (0, _defineProperty2["default"])({}, prop, colorUIProp));

      this.updateLayerConfig({
        colorUI: colorUI
      }); // if colorUI[prop] is colorRange

      var isColorRange = visConfig[prop] && visConfig[prop].colors;

      if (isColorRange) {
        this.updateColorUIByColorRange(newConfig, prop);
        this.updateColorRangeByColorUI(newConfig, previous, prop);
        this.updateCustomPalette(newConfig, previous, prop);
      }

      return this;
    }
  }, {
    key: "updateCustomPalette",
    value: function updateCustomPalette(newConfig, previous, prop) {
      if (!newConfig.colorRangeConfig || !newConfig.colorRangeConfig.custom) {
        return;
      }

      var _this$config2 = this.config,
          colorUI = _this$config2.colorUI,
          visConfig = _this$config2.visConfig;
      if (!visConfig[prop]) return;
      var colors = visConfig[prop].colors;

      var customPalette = _objectSpread(_objectSpread({}, colorUI[prop].customPalette), {}, {
        name: 'Custom Palette',
        colors: (0, _toConsumableArray2["default"])(colors)
      });

      this.updateLayerConfig({
        colorUI: _objectSpread(_objectSpread({}, colorUI), {}, (0, _defineProperty2["default"])({}, prop, _objectSpread(_objectSpread({}, colorUI[prop]), {}, {
          customPalette: customPalette
        })))
      });
    }
    /**
     * if open dropdown and prop is color range
     * Automatically set colorRangeConfig's step and reversed
     * @param {*} newConfig
     * @param {*} prop
     */

  }, {
    key: "updateColorUIByColorRange",
    value: function updateColorUIByColorRange(newConfig, prop) {
      if (typeof newConfig.showDropdown !== 'number') return;
      var _this$config3 = this.config,
          colorUI = _this$config3.colorUI,
          visConfig = _this$config3.visConfig;
      this.updateLayerConfig({
        colorUI: _objectSpread(_objectSpread({}, colorUI), {}, (0, _defineProperty2["default"])({}, prop, _objectSpread(_objectSpread({}, colorUI[prop]), {}, {
          colorRangeConfig: _objectSpread(_objectSpread({}, colorUI[prop].colorRangeConfig), {}, {
            steps: visConfig[prop].colors.length,
            reversed: Boolean(visConfig[prop].reversed)
          })
        })))
      });
    }
  }, {
    key: "updateColorRangeByColorUI",
    value: function updateColorRangeByColorUI(newConfig, previous, prop) {
      // only update colorRange if changes in UI is made to 'reversed', 'steps' or steps
      var shouldUpdate = newConfig.colorRangeConfig && ['reversed', 'steps'].some(function (key) {
        return newConfig.colorRangeConfig.hasOwnProperty(key) && newConfig.colorRangeConfig[key] !== (previous[prop] || _layerFactory.DEFAULT_COLOR_UI).colorRangeConfig[key];
      });
      if (!shouldUpdate) return;
      var _this$config4 = this.config,
          colorUI = _this$config4.colorUI,
          visConfig = _this$config4.visConfig;
      var _colorUI$prop$colorRa = colorUI[prop].colorRangeConfig,
          steps = _colorUI$prop$colorRa.steps,
          reversed = _colorUI$prop$colorRa.reversed;
      var colorRange = visConfig[prop]; // find based on step or reversed

      var update;

      if (newConfig.colorRangeConfig.hasOwnProperty('steps')) {
        var group = (0, _colorUtils.getColorGroupByName)(colorRange);

        if (group) {
          var sameGroup = _colorRanges.COLOR_RANGES.filter(function (cr) {
            return (0, _colorUtils.getColorGroupByName)(cr) === group;
          });

          update = sameGroup.find(function (cr) {
            return cr.colors.length === steps;
          });

          if (update && colorRange.reversed) {
            update = (0, _colorUtils.reverseColorRange)(true, update);
          }
        }
      }

      if (newConfig.colorRangeConfig.hasOwnProperty('reversed')) {
        update = (0, _colorUtils.reverseColorRange)(reversed, update || colorRange);
      }

      if (update) {
        this.updateLayerVisConfig((0, _defineProperty2["default"])({}, prop, update));
      }
    }
    /**
     * Check whether layer has all columns
     *
     * @param {object} layer
     * @returns {boolean} yes or no
     */

  }, {
    key: "hasAllColumns",
    value: function hasAllColumns() {
      var columns = this.config.columns;
      return columns && Object.values(columns).every(function (v) {
        return Boolean(v.optional || v.value && v.fieldIdx > -1);
      });
    }
    /**
     * Check whether layer has data
     *
     * @param {object} layer
     * @param {Array | Object} layerData
     * @returns {boolean} yes or no
     */

  }, {
    key: "hasLayerData",
    value: function hasLayerData(layerData) {
      if (!layerData) {
        return false;
      }

      return Boolean(layerData.data && layerData.data.length);
    }
  }, {
    key: "isValidToSave",
    value: function isValidToSave() {
      return this.type && this.hasAllColumns();
    }
  }, {
    key: "shouldRenderLayer",
    value: function shouldRenderLayer(data) {
      return this.type && this.config.isVisible && this.hasAllColumns() && this.hasLayerData(data) && typeof this.renderLayer === 'function';
    }
  }, {
    key: "getVisChannelScale",
    value: function getVisChannelScale(scale, domain, range, fixed) {
      return _defaultSettings.SCALE_FUNC[fixed ? 'linear' : scale]().domain(domain).range(fixed ? domain : range);
    }
  }, {
    key: "getPointsBounds",
    value: function getPointsBounds(allData) {
      var getPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;
      // no need to loop through the entire dataset
      // get a sample of data to calculate bounds
      var sampleData = allData.length > MAX_SAMPLE_SIZE ? (0, _dataUtils.getSampleData)(allData, MAX_SAMPLE_SIZE) : allData;
      var points = sampleData.map(getPosition);
      var latBounds = (0, _dataUtils.getLatLngBounds)(points, 1, [-90, 90]);
      var lngBounds = (0, _dataUtils.getLatLngBounds)(points, 0, [-180, 180]);

      if (!latBounds || !lngBounds) {
        return null;
      }

      return [lngBounds[0], latBounds[0], lngBounds[1], latBounds[1]];
    }
  }, {
    key: "getChangedTriggers",
    value: function getChangedTriggers(dataUpdateTriggers) {
      var triggerChanged = (0, _layerUpdate.diffUpdateTriggers)(dataUpdateTriggers, this._oldDataUpdateTriggers);
      this._oldDataUpdateTriggers = dataUpdateTriggers;
      return triggerChanged;
    }
  }, {
    key: "getEncodedChannelValue",
    value: function getEncodedChannelValue(scale, data, field) {
      var nullValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _defaultSettings.NO_VALUE_COLOR;
      var getValue = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaultGetFieldValue;
      var type = field.type;
      var value = getValue(field, data);

      if (!(0, _dataUtils.notNullorUndefined)(value)) {
        return nullValue;
      }

      var attributeValue;

      if (type === _defaultSettings.ALL_FIELD_TYPES.timestamp) {
        // shouldn't need to convert here
        // scale Function should take care of it
        attributeValue = scale(new Date(value));
      } else {
        attributeValue = scale(value);
      }

      if (!(0, _dataUtils.notNullorUndefined)(attributeValue)) {
        attributeValue = nullValue;
      }

      return attributeValue;
    }
  }, {
    key: "updateMeta",
    value: function updateMeta(meta) {
      this.meta = _objectSpread(_objectSpread({}, this.meta), meta);
    }
  }, {
    key: "getDataUpdateTriggers",
    value: function getDataUpdateTriggers(_ref6) {
      var filteredIndex = _ref6.filteredIndex,
          id = _ref6.id;
      var columns = this.config.columns;
      return _objectSpread({
        getData: {
          datasetId: id,
          columns: columns,
          filteredIndex: filteredIndex
        },
        getMeta: {
          datasetId: id,
          columns: columns
        }
      }, (this.config.textLabel || []).reduce(function (accu, tl, i) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, "getLabelCharacterSet-".concat(i), tl.field ? tl.field.name : null));
      }, {}));
    }
  }, {
    key: "updateData",
    value: function updateData(datasets, oldLayerData) {
      var layerDataset = datasets[this.config.dataId];
      var allData = datasets[this.config.dataId].allData;
      var getPosition = this.getPositionAccessor();
      var dataUpdateTriggers = this.getDataUpdateTriggers(layerDataset);
      var triggerChanged = this.getChangedTriggers(dataUpdateTriggers);

      if (triggerChanged.getMeta) {
        this.updateLayerMeta(allData, getPosition);
      }

      var data = [];

      if (!triggerChanged.getData) {
        // same data
        data = oldLayerData.data;
      } else {
        data = this.calculateDataAttribute(layerDataset, getPosition);
      }

      return {
        data: data,
        triggerChanged: triggerChanged
      };
    }
    /**
     * helper function to update one layer domain when state.data changed
     * if state.data change is due ot update filter, newFiler will be passed
     * called by updateAllLayerDomainData
     * @param {Object} dataset
     * @param {Object} newFilter
     * @returns {object} layer
     */

  }, {
    key: "updateLayerDomain",
    value: function updateLayerDomain(datasets, newFilter) {
      var _this4 = this;

      var dataset = this.getDataset(datasets);

      if (!dataset) {
        return this;
      }

      Object.values(this.visualChannels).forEach(function (channel) {
        var scale = channel.scale;
        var scaleType = _this4.config[scale]; // ordinal domain is based on allData, if only filter changed
        // no need to update ordinal domain

        if (!newFilter || scaleType !== _defaultSettings.SCALE_TYPES.ordinal) {
          var domain = channel.domain;

          var updatedDomain = _this4.calculateLayerDomain(dataset, channel);

          _this4.updateLayerConfig((0, _defineProperty2["default"])({}, domain, updatedDomain));
        }
      });
      return this;
    }
  }, {
    key: "getDataset",
    value: function getDataset(datasets) {
      return datasets[this.config.dataId];
    }
    /**
     * Validate visual channel field and scales based on supported field & scale type
     * @param channel
     */

  }, {
    key: "validateVisualChannel",
    value: function validateVisualChannel(channel) {
      this.validateFieldType(channel);
      this.validateScale(channel);
    }
    /**
     * Validate field type based on channelScaleType
     */

  }, {
    key: "validateFieldType",
    value: function validateFieldType(channel) {
      var visualChannel = this.visualChannels[channel];
      var field = visualChannel.field,
          channelScaleType = visualChannel.channelScaleType,
          supportedFieldTypes = visualChannel.supportedFieldTypes;

      if (this.config[field]) {
        // if field is selected, check if field type is supported
        var channelSupportedFieldTypes = supportedFieldTypes || _defaultSettings.CHANNEL_SCALE_SUPPORTED_FIELDS[channelScaleType];

        if (!channelSupportedFieldTypes.includes(this.config[field].type)) {
          // field type is not supported, set it back to null
          // set scale back to default
          this.updateLayerConfig((0, _defineProperty2["default"])({}, field, null));
        }
      }
    }
    /**
     * Validate scale type based on aggregation
     */

  }, {
    key: "validateScale",
    value: function validateScale(channel) {
      var visualChannel = this.visualChannels[channel];
      var scale = visualChannel.scale;

      if (!scale) {
        // visualChannel doesn't have scale
        return;
      }

      var scaleOptions = this.getScaleOptions(channel); // check if current selected scale is
      // supported, if not, change to default

      if (!scaleOptions.includes(this.config[scale])) {
        this.updateLayerConfig((0, _defineProperty2["default"])({}, scale, scaleOptions[0]));
      }
    }
    /**
     * Get scale options based on current field
     * @param {string} channel
     * @returns {string[]}
     */

  }, {
    key: "getScaleOptions",
    value: function getScaleOptions(channel) {
      var visualChannel = this.visualChannels[channel];
      var field = visualChannel.field,
          scale = visualChannel.scale,
          channelScaleType = visualChannel.channelScaleType;
      return this.config[field] ? _defaultSettings.FIELD_OPTS[this.config[field].type].scale[channelScaleType] : [this.getDefaultLayerConfig()[scale]];
    }
  }, {
    key: "updateLayerVisualChannel",
    value: function updateLayerVisualChannel(dataset, channel) {
      var visualChannel = this.visualChannels[channel];
      this.validateVisualChannel(channel); // calculate layer channel domain

      var updatedDomain = this.calculateLayerDomain(dataset, visualChannel);
      this.updateLayerConfig((0, _defineProperty2["default"])({}, visualChannel.domain, updatedDomain));
    }
  }, {
    key: "calculateLayerDomain",
    value: function calculateLayerDomain(dataset, visualChannel) {
      var allData = dataset.allData,
          filteredIndexForDomain = dataset.filteredIndexForDomain;
      var defaultDomain = [0, 1];
      var scale = visualChannel.scale;
      var scaleType = this.config[scale];
      var field = this.config[visualChannel.field];

      if (!field) {
        // if colorField or sizeField were set back to null
        return defaultDomain;
      }

      if (!_defaultSettings.SCALE_TYPES[scaleType]) {
        _window.console.error("scale type ".concat(scaleType, " not supported"));

        return defaultDomain;
      } // TODO: refactor to add valueAccessor to field


      var fieldIdx = field.tableFieldIndex - 1;
      var isTime = field.type === _defaultSettings.ALL_FIELD_TYPES.timestamp;

      var valueAccessor = _dataUtils.maybeToDate.bind(null, isTime, fieldIdx, field.format);

      var indexValueAccessor = function indexValueAccessor(i) {
        return valueAccessor(allData[i]);
      };

      var sortFunction = (0, _dataUtils.getSortingFunction)(field.type);

      switch (scaleType) {
        case _defaultSettings.SCALE_TYPES.ordinal:
        case _defaultSettings.SCALE_TYPES.point:
          // do not recalculate ordinal domain based on filtered data
          // don't need to update ordinal domain every time
          return (0, _dataScaleUtils.getOrdinalDomain)(allData, valueAccessor);

        case _defaultSettings.SCALE_TYPES.quantile:
          return (0, _dataScaleUtils.getQuantileDomain)(filteredIndexForDomain, indexValueAccessor, sortFunction);

        case _defaultSettings.SCALE_TYPES.log:
          return (0, _dataScaleUtils.getLogDomain)(filteredIndexForDomain, indexValueAccessor);

        case _defaultSettings.SCALE_TYPES.quantize:
        case _defaultSettings.SCALE_TYPES.linear:
        case _defaultSettings.SCALE_TYPES.sqrt:
        default:
          return (0, _dataScaleUtils.getLinearDomain)(filteredIndexForDomain, indexValueAccessor);
      }
    }
  }, {
    key: "isLayerHovered",
    value: function isLayerHovered(objectInfo) {
      return objectInfo && objectInfo.layer && objectInfo.picked && objectInfo.layer.props.id === this.id;
    }
  }, {
    key: "getRadiusScaleByZoom",
    value: function getRadiusScaleByZoom(mapState, fixedRadius) {
      var radiusChannel = Object.values(this.visualChannels).find(function (vc) {
        return vc.property === 'radius';
      });

      if (!radiusChannel) {
        return 1;
      }

      var field = radiusChannel.field;
      var fixed = fixedRadius === undefined ? this.config.visConfig.fixedRadius : fixedRadius;
      var radius = this.config.visConfig.radius;
      return fixed ? 1 : (this.config[field] ? 1 : radius) * this.getZoomFactor(mapState);
    }
  }, {
    key: "shouldCalculateLayerData",
    value: function shouldCalculateLayerData(props) {
      var _this5 = this;

      return props.some(function (p) {
        return !_this5.noneLayerDataAffectingProps.includes(p);
      });
    }
  }, {
    key: "getBrushingExtensionProps",
    value: function getBrushingExtensionProps(interactionConfig, brushingTarget) {
      var brush = interactionConfig.brush;
      return {
        // brushing
        autoHighlight: !brush.enabled,
        brushingRadius: brush.config.size * 1000,
        brushingTarget: brushingTarget || 'source',
        brushingEnabled: brush.enabled
      };
    }
  }, {
    key: "getDefaultDeckLayerProps",
    value: function getDefaultDeckLayerProps(_ref7) {
      var idx = _ref7.idx,
          gpuFilter = _ref7.gpuFilter,
          mapState = _ref7.mapState;
      return {
        id: this.id,
        idx: idx,
        coordinateSystem: _core.COORDINATE_SYSTEM.LNGLAT,
        pickable: true,
        wrapLongitude: true,
        parameters: {
          depthTest: Boolean(mapState.dragRotate || this.config.visConfig.enable3d)
        },
        hidden: this.config.hidden,
        // visconfig
        opacity: this.config.visConfig.opacity,
        highlightColor: this.config.highlightColor,
        // data filtering
        extensions: [dataFilterExtension],
        filterRange: gpuFilter.filterRange
      };
    }
  }, {
    key: "getDefaultHoverLayerProps",
    value: function getDefaultHoverLayerProps() {
      return {
        id: "".concat(this.id, "-hovered"),
        pickable: false,
        wrapLongitude: true,
        coordinateSystem: _core.COORDINATE_SYSTEM.LNGLAT
      };
    }
  }, {
    key: "renderTextLabelLayer",
    value: function renderTextLabelLayer(_ref8, renderOpts) {
      var _this6 = this;

      var getPosition = _ref8.getPosition,
          getPixelOffset = _ref8.getPixelOffset,
          updateTriggers = _ref8.updateTriggers,
          sharedProps = _ref8.sharedProps;
      var data = renderOpts.data,
          mapState = renderOpts.mapState;
      var textLabel = this.config.textLabel;
      return data.textLabels.reduce(function (accu, d, i) {
        if (d.getText) {
          accu.push(new _layers.TextLayer(_objectSpread(_objectSpread({}, sharedProps), {}, {
            id: "".concat(_this6.id, "-label-").concat(textLabel[i].field.name),
            data: data.data,
            getText: d.getText,
            getPosition: getPosition,
            characterSet: d.characterSet,
            getPixelOffset: getPixelOffset(textLabel[i]),
            getSize: 1,
            sizeScale: textLabel[i].size,
            getTextAnchor: textLabel[i].anchor,
            getAlignmentBaseline: textLabel[i].alignment,
            getColor: textLabel[i].color,
            parameters: {
              // text will always show on top of all layers
              depthTest: false
            },
            getFilterValue: data.getFilterValue,
            updateTriggers: _objectSpread(_objectSpread({}, updateTriggers), {}, {
              getText: textLabel[i].field.name,
              getPixelOffset: _objectSpread(_objectSpread({}, updateTriggers.getRadius), {}, {
                mapState: mapState,
                anchor: textLabel[i].anchor,
                alignment: textLabel[i].alignment
              }),
              getTextAnchor: textLabel[i].anchor,
              getAlignmentBaseline: textLabel[i].alignment,
              getColor: textLabel[i].color
            })
          })));
        }

        return accu;
      }, []);
    }
  }, {
    key: "layerIcon",
    get: function get() {
      return _defaultLayerIcon["default"];
    }
  }, {
    key: "overlayType",
    get: function get() {
      return OVERLAY_TYPE.deckgl;
    }
  }, {
    key: "type",
    get: function get() {
      return null;
    }
  }, {
    key: "name",
    get: function get() {
      return this.type;
    }
  }, {
    key: "isAggregated",
    get: function get() {
      return false;
    }
  }, {
    key: "requiredLayerColumns",
    get: function get() {
      return [];
    }
  }, {
    key: "optionalColumns",
    get: function get() {
      return [];
    }
  }, {
    key: "noneLayerDataAffectingProps",
    get: function get() {
      return ['label', 'opacity', 'thickness', 'isVisible', 'hidden'];
    }
  }, {
    key: "visualChannels",
    get: function get() {
      return {
        color: {
          property: 'color',
          field: 'colorField',
          scale: 'colorScale',
          domain: 'colorDomain',
          range: 'colorRange',
          key: 'color',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.color
        },
        size: {
          property: 'size',
          field: 'sizeField',
          scale: 'sizeScale',
          domain: 'sizeDomain',
          range: 'sizeRange',
          key: 'size',
          channelScaleType: _defaultSettings.CHANNEL_SCALES.size
        }
      };
    }
    /*
     * Column pairs maps layer column to a specific field pairs,
     * By default, it is set to null
     */

  }, {
    key: "columnPairs",
    get: function get() {
      return null;
    }
    /*
     * Default point column pairs, can be used for point based layers: point, icon etc.
     */

  }, {
    key: "defaultPointColumnPairs",
    get: function get() {
      return {
        lat: {
          pair: 'lng',
          fieldPairKey: 'lat'
        },
        lng: {
          pair: 'lat',
          fieldPairKey: 'lng'
        }
      };
    }
    /*
     * Default link column pairs, can be used for link based layers: arc, line etc
     */

  }, {
    key: "defaultLinkColumnPairs",
    get: function get() {
      return {
        lat0: {
          pair: 'lng0',
          fieldPairKey: 'lat'
        },
        lng0: {
          pair: 'lat0',
          fieldPairKey: 'lng'
        },
        lat1: {
          pair: 'lng1',
          fieldPairKey: 'lat'
        },
        lng1: {
          pair: 'lat1',
          fieldPairKey: 'lng'
        }
      };
    }
    /**
     * Return a React component for to render layer instructions in a modal
     * @returns {object} - an object
     * @example
     *  return {
     *    id: 'iconInfo',
     *    template: IconInfoModal,
     *    modalProps: {
     *      title: 'How to draw icons'
     *   };
     * }
     */

  }, {
    key: "layerInfoModal",
    get: function get() {
      return null;
    }
    /*
     * Given a dataset, automatically find props to create layer based on it
     * and return the props and previous found layers.
     * By default, no layers will be found
     */

  }], [{
    key: "findDefaultLayerProps",
    value: function findDefaultLayerProps(dataset, foundLayers) {
      return {
        props: [],
        foundLayers: foundLayers
      };
    }
    /**
     * Given a array of preset required column names
     * found field that has the same name to set as layer column
     *
     * @param {object} defaultFields
     * @param {object[]} allFields
     * @returns {object[] | null} all possible required layer column pairs
     */

  }, {
    key: "findDefaultColumnField",
    value: function findDefaultColumnField(defaultFields, allFields) {
      // find all matched fields for each required col
      var requiredColumns = Object.keys(defaultFields).reduce(function (prev, key) {
        var requiredFields = allFields.filter(function (f) {
          return f.name === defaultFields[key] || defaultFields[key].includes(f.name);
        });
        prev[key] = requiredFields.length ? requiredFields.map(function (f) {
          return {
            value: f.name,
            fieldIdx: f.tableFieldIndex - 1
          };
        }) : null;
        return prev;
      }, {});

      if (!Object.values(requiredColumns).every(Boolean)) {
        // if any field missing, return null
        return null;
      }

      return this.getAllPossibleColumnParis(requiredColumns);
    }
  }, {
    key: "getAllPossibleColumnParis",
    value: function getAllPossibleColumnParis(requiredColumns) {
      // for multiple matched field for one required column, return multiple
      // combinations, e. g. if column a has 2 matched, column b has 3 matched
      // 6 possible column pairs will be returned
      var allKeys = Object.keys(requiredColumns);
      var pointers = allKeys.map(function (k, i) {
        return i === allKeys.length - 1 ? -1 : 0;
      });
      var countPerKey = allKeys.map(function (k) {
        return requiredColumns[k].length;
      });
      var pairs = [];
      /* eslint-disable no-loop-func */

      while (incrementPointers(pointers, countPerKey, pointers.length - 1)) {
        var newPair = pointers.reduce(function (prev, cuur, i) {
          prev[allKeys[i]] = requiredColumns[allKeys[i]][cuur];
          return prev;
        }, {});
        pairs.push(newPair);
      }
      /* eslint-enable no-loop-func */
      // recursively increment pointers


      function incrementPointers(pts, counts, index) {
        if (index === 0 && pts[0] === counts[0] - 1) {
          // nothing to increment
          return false;
        }

        if (pts[index] + 1 < counts[index]) {
          pts[index] = pts[index] + 1;
          return true;
        }

        pts[index] = 0;
        return incrementPointers(pts, counts, index - 1);
      }

      return pairs;
    }
  }, {
    key: "hexToRgb",
    value: function hexToRgb(c) {
      return (0, _colorUtils.hexToRgb)(c);
    }
  }]);
  return Layer;
}();

exports["default"] = Layer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvYmFzZS1sYXllci5qcyJdLCJuYW1lcyI6WyJnZW5lcmF0ZUNvbG9yIiwiTUFYX1NBTVBMRV9TSVpFIiwiZGF0YUZpbHRlckV4dGVuc2lvbiIsIkRhdGFGaWx0ZXJFeHRlbnNpb24iLCJmaWx0ZXJTaXplIiwiTUFYX0dQVV9GSUxURVJTIiwiaWRlbnRpdHkiLCJkIiwiT1ZFUkxBWV9UWVBFIiwiZGVja2dsIiwibWFwYm94Z2wiLCJsYXllckNvbG9ycyIsIk9iamVjdCIsInZhbHVlcyIsIkRhdGFWaXpDb2xvcnMiLCJtYXAiLCJoZXhUb1JnYiIsImluZGV4IiwibGVuZ3RoIiwiY29sb3JNYWtlciIsImRlZmF1bHRHZXRGaWVsZFZhbHVlIiwiZmllbGQiLCJ0YWJsZUZpZWxkSW5kZXgiLCJMYXllciIsInByb3BzIiwiaWQiLCJtZXRhIiwidmlzQ29uZmlnU2V0dGluZ3MiLCJjb25maWciLCJnZXREZWZhdWx0TGF5ZXJDb25maWciLCJjb2x1bW5zIiwiZ2V0TGF5ZXJDb2x1bW5zIiwiZGF0YUlkIiwibGFiZWwiLCJjb2xvciIsIm5leHQiLCJ2YWx1ZSIsImlzVmlzaWJsZSIsImlzQ29uZmlnQWN0aXZlIiwiaGlnaGxpZ2h0Q29sb3IiLCJoaWRkZW4iLCJjb2xvckZpZWxkIiwiY29sb3JEb21haW4iLCJjb2xvclNjYWxlIiwiU0NBTEVfVFlQRVMiLCJxdWFudGlsZSIsInNpemVEb21haW4iLCJzaXplU2NhbGUiLCJsaW5lYXIiLCJzaXplRmllbGQiLCJ2aXNDb25maWciLCJ0ZXh0TGFiZWwiLCJERUZBVUxUX1RFWFRfTEFCRUwiLCJjb2xvclVJIiwiREVGQVVMVF9DT0xPUl9VSSIsImNvbG9yUmFuZ2UiLCJhbmltYXRpb24iLCJlbmFibGVkIiwia2V5IiwidmlzdWFsQ2hhbm5lbHMiLCJyYW5nZSIsIm1lYXN1cmUiLCJuYW1lIiwiZGVmYXVsdE1lYXN1cmUiLCJ1cGRhdGUiLCJmaWVsZElkeCIsInBhaXIiLCJjb2x1bW5QYWlycyIsInBhcnRuZXJLZXkiLCJmaWVsZFBhaXJLZXkiLCJwYXJ0bmVyRmllbGRQYWlyS2V5Iiwiem9vbSIsInpvb21PZmZzZXQiLCJNYXRoIiwicG93IiwibWF4IiwiZGF0YXNldHMiLCJmaWx0ZXJlZEluZGV4Iiwib2JqZWN0IiwiZGF0YSIsImNvbmZpZ1RvQ29weSIsInNoYWxsb3dDb3B5IiwiY29uY2F0IiwidiIsIm5vdFRvQ29weSIsImRvbWFpbiIsImZvckVhY2giLCJncm91cCIsInB1c2giLCJjdXJyZW50Q29uZmlnIiwiY29waWVkIiwiY29weUxheWVyQ29uZmlnIiwidXBkYXRlTGF5ZXJDb25maWciLCJrZXlzIiwiY2hhbm5lbCIsInZhbGlkYXRlVmlzdWFsQ2hhbm5lbCIsImluY2x1ZGVzIiwibGF5ZXJWaXNDb25maWdzIiwiaXRlbSIsIkxBWUVSX1ZJU19DT05GSUdTIiwiZGVmYXVsdFZhbHVlIiwiZXZlcnkiLCJwIiwiaGFzT3duUHJvcGVydHkiLCJyZXF1aXJlZCIsInJlcXVpcmVkTGF5ZXJDb2x1bW5zIiwicmVkdWNlIiwiYWNjdSIsIm9wdGlvbmFsIiwib3B0aW9uYWxDb2x1bW5zIiwibmV3Q29uZmlnIiwibmV3VmlzQ29uZmlnIiwicHJvcCIsInByZXZpb3VzIiwiY29sb3JVSVByb3AiLCJlbnRyaWVzIiwiaXNDb2xvclJhbmdlIiwiY29sb3JzIiwidXBkYXRlQ29sb3JVSUJ5Q29sb3JSYW5nZSIsInVwZGF0ZUNvbG9yUmFuZ2VCeUNvbG9yVUkiLCJ1cGRhdGVDdXN0b21QYWxldHRlIiwiY29sb3JSYW5nZUNvbmZpZyIsImN1c3RvbSIsImN1c3RvbVBhbGV0dGUiLCJzaG93RHJvcGRvd24iLCJzdGVwcyIsInJldmVyc2VkIiwiQm9vbGVhbiIsInNob3VsZFVwZGF0ZSIsInNvbWUiLCJzYW1lR3JvdXAiLCJDT0xPUl9SQU5HRVMiLCJmaWx0ZXIiLCJjciIsImZpbmQiLCJ1cGRhdGVMYXllclZpc0NvbmZpZyIsImxheWVyRGF0YSIsInR5cGUiLCJoYXNBbGxDb2x1bW5zIiwiaGFzTGF5ZXJEYXRhIiwicmVuZGVyTGF5ZXIiLCJzY2FsZSIsImZpeGVkIiwiU0NBTEVfRlVOQyIsImFsbERhdGEiLCJnZXRQb3NpdGlvbiIsInNhbXBsZURhdGEiLCJwb2ludHMiLCJsYXRCb3VuZHMiLCJsbmdCb3VuZHMiLCJkYXRhVXBkYXRlVHJpZ2dlcnMiLCJ0cmlnZ2VyQ2hhbmdlZCIsIl9vbGREYXRhVXBkYXRlVHJpZ2dlcnMiLCJudWxsVmFsdWUiLCJOT19WQUxVRV9DT0xPUiIsImdldFZhbHVlIiwiYXR0cmlidXRlVmFsdWUiLCJBTExfRklFTERfVFlQRVMiLCJ0aW1lc3RhbXAiLCJEYXRlIiwiZ2V0RGF0YSIsImRhdGFzZXRJZCIsImdldE1ldGEiLCJ0bCIsImkiLCJvbGRMYXllckRhdGEiLCJsYXllckRhdGFzZXQiLCJnZXRQb3NpdGlvbkFjY2Vzc29yIiwiZ2V0RGF0YVVwZGF0ZVRyaWdnZXJzIiwiZ2V0Q2hhbmdlZFRyaWdnZXJzIiwidXBkYXRlTGF5ZXJNZXRhIiwiY2FsY3VsYXRlRGF0YUF0dHJpYnV0ZSIsIm5ld0ZpbHRlciIsImRhdGFzZXQiLCJnZXREYXRhc2V0Iiwic2NhbGVUeXBlIiwib3JkaW5hbCIsInVwZGF0ZWREb21haW4iLCJjYWxjdWxhdGVMYXllckRvbWFpbiIsInZhbGlkYXRlRmllbGRUeXBlIiwidmFsaWRhdGVTY2FsZSIsInZpc3VhbENoYW5uZWwiLCJjaGFubmVsU2NhbGVUeXBlIiwic3VwcG9ydGVkRmllbGRUeXBlcyIsImNoYW5uZWxTdXBwb3J0ZWRGaWVsZFR5cGVzIiwiQ0hBTk5FTF9TQ0FMRV9TVVBQT1JURURfRklFTERTIiwic2NhbGVPcHRpb25zIiwiZ2V0U2NhbGVPcHRpb25zIiwiRklFTERfT1BUUyIsImZpbHRlcmVkSW5kZXhGb3JEb21haW4iLCJkZWZhdWx0RG9tYWluIiwiQ29uc29sZSIsImVycm9yIiwiaXNUaW1lIiwidmFsdWVBY2Nlc3NvciIsIm1heWJlVG9EYXRlIiwiYmluZCIsImZvcm1hdCIsImluZGV4VmFsdWVBY2Nlc3NvciIsInNvcnRGdW5jdGlvbiIsInBvaW50IiwibG9nIiwicXVhbnRpemUiLCJzcXJ0Iiwib2JqZWN0SW5mbyIsImxheWVyIiwicGlja2VkIiwibWFwU3RhdGUiLCJmaXhlZFJhZGl1cyIsInJhZGl1c0NoYW5uZWwiLCJ2YyIsInByb3BlcnR5IiwidW5kZWZpbmVkIiwicmFkaXVzIiwiZ2V0Wm9vbUZhY3RvciIsIm5vbmVMYXllckRhdGFBZmZlY3RpbmdQcm9wcyIsImludGVyYWN0aW9uQ29uZmlnIiwiYnJ1c2hpbmdUYXJnZXQiLCJicnVzaCIsImF1dG9IaWdobGlnaHQiLCJicnVzaGluZ1JhZGl1cyIsInNpemUiLCJicnVzaGluZ0VuYWJsZWQiLCJpZHgiLCJncHVGaWx0ZXIiLCJjb29yZGluYXRlU3lzdGVtIiwiQ09PUkRJTkFURV9TWVNURU0iLCJMTkdMQVQiLCJwaWNrYWJsZSIsIndyYXBMb25naXR1ZGUiLCJwYXJhbWV0ZXJzIiwiZGVwdGhUZXN0IiwiZHJhZ1JvdGF0ZSIsImVuYWJsZTNkIiwib3BhY2l0eSIsImV4dGVuc2lvbnMiLCJmaWx0ZXJSYW5nZSIsInJlbmRlck9wdHMiLCJnZXRQaXhlbE9mZnNldCIsInVwZGF0ZVRyaWdnZXJzIiwic2hhcmVkUHJvcHMiLCJ0ZXh0TGFiZWxzIiwiZ2V0VGV4dCIsIlRleHRMYXllciIsImNoYXJhY3RlclNldCIsImdldFNpemUiLCJnZXRUZXh0QW5jaG9yIiwiYW5jaG9yIiwiZ2V0QWxpZ25tZW50QmFzZWxpbmUiLCJhbGlnbm1lbnQiLCJnZXRDb2xvciIsImdldEZpbHRlclZhbHVlIiwiZ2V0UmFkaXVzIiwiRGVmYXVsdExheWVySWNvbiIsIkNIQU5ORUxfU0NBTEVTIiwibGF0IiwibG5nIiwibGF0MCIsImxuZzAiLCJsYXQxIiwibG5nMSIsImZvdW5kTGF5ZXJzIiwiZGVmYXVsdEZpZWxkcyIsImFsbEZpZWxkcyIsInJlcXVpcmVkQ29sdW1ucyIsInByZXYiLCJyZXF1aXJlZEZpZWxkcyIsImYiLCJnZXRBbGxQb3NzaWJsZUNvbHVtblBhcmlzIiwiYWxsS2V5cyIsInBvaW50ZXJzIiwiayIsImNvdW50UGVyS2V5IiwicGFpcnMiLCJpbmNyZW1lbnRQb2ludGVycyIsIm5ld1BhaXIiLCJjdXVyIiwicHRzIiwiY291bnRzIiwiYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQVVBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQVFBOztBQU1BOzs7Ozs7d0RBZ0JVQSxhOztBQWRWOzs7O0FBSUEsSUFBTUMsZUFBZSxHQUFHLElBQXhCO0FBQ0EsSUFBTUMsbUJBQW1CLEdBQUcsSUFBSUMsK0JBQUosQ0FBd0I7QUFBQ0MsRUFBQUEsVUFBVSxFQUFFQztBQUFiLENBQXhCLENBQTVCOztBQUNBLElBQU1DLFFBQVEsR0FBRyxTQUFYQSxRQUFXLENBQUFDLENBQUM7QUFBQSxTQUFJQSxDQUFKO0FBQUEsQ0FBbEI7O0FBRU8sSUFBTUMsWUFBWSxHQUFHLDJCQUFVO0FBQ3BDQyxFQUFBQSxNQUFNLEVBQUUsSUFENEI7QUFFcENDLEVBQUFBLFFBQVEsRUFBRTtBQUYwQixDQUFWLENBQXJCOztBQUtBLElBQU1DLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWNDLGdDQUFkLEVBQTZCQyxHQUE3QixDQUFpQ0Msb0JBQWpDLENBQXBCOzs7QUFDUCxTQUFVaEIsYUFBVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDTWlCLFVBQUFBLEtBRE4sR0FDYyxDQURkOztBQUFBO0FBQUEsZ0JBRVNBLEtBQUssR0FBR04sV0FBVyxDQUFDTyxNQUFaLEdBQXFCLENBRnRDO0FBQUE7QUFBQTtBQUFBOztBQUdJLGNBQUlELEtBQUssS0FBS04sV0FBVyxDQUFDTyxNQUExQixFQUFrQztBQUNoQ0QsWUFBQUEsS0FBSyxHQUFHLENBQVI7QUFDRDs7QUFMTDtBQU1JLGlCQUFNTixXQUFXLENBQUNNLEtBQUssRUFBTixDQUFqQjs7QUFOSjtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7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LEdBQUcsQ0FBQ3BRLEtBQUQsQ0FBSCxHQUFhLENBQWIsR0FBaUJxUSxNQUFNLENBQUNyUSxLQUFELENBQTNCLEVBQW9DO0FBQ2xDb1EsVUFBQUEsR0FBRyxDQUFDcFEsS0FBRCxDQUFILEdBQWFvUSxHQUFHLENBQUNwUSxLQUFELENBQUgsR0FBYSxDQUExQjtBQUNBLGlCQUFPLElBQVA7QUFDRDs7QUFFRG9RLFFBQUFBLEdBQUcsQ0FBQ3BRLEtBQUQsQ0FBSCxHQUFhLENBQWI7QUFDQSxlQUFPaVEsaUJBQWlCLENBQUNHLEdBQUQsRUFBTUMsTUFBTixFQUFjclEsS0FBSyxHQUFHLENBQXRCLENBQXhCO0FBQ0Q7O0FBRUQsYUFBT2dRLEtBQVA7QUFDRDs7OzZCQUVlTSxDLEVBQUc7QUFDakIsYUFBTywwQkFBU0EsQ0FBVCxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NvbnNvbGUgYXMgQ29uc29sZX0gZnJvbSAnZ2xvYmFsL3dpbmRvdyc7XG5pbXBvcnQga2V5bWlycm9yIGZyb20gJ2tleW1pcnJvcic7XG5pbXBvcnQge0RhdGFGaWx0ZXJFeHRlbnNpb259IGZyb20gJ0BkZWNrLmdsL2V4dGVuc2lvbnMnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnQGRlY2suZ2wvY29yZSc7XG5pbXBvcnQge1RleHRMYXllcn0gZnJvbSAnQGRlY2suZ2wvbGF5ZXJzJztcblxuaW1wb3J0IERlZmF1bHRMYXllckljb24gZnJvbSAnLi9kZWZhdWx0LWxheWVyLWljb24nO1xuaW1wb3J0IHtkaWZmVXBkYXRlVHJpZ2dlcnN9IGZyb20gJy4vbGF5ZXItdXBkYXRlJztcblxuaW1wb3J0IHtcbiAgQUxMX0ZJRUxEX1RZUEVTLFxuICBOT19WQUxVRV9DT0xPUixcbiAgU0NBTEVfVFlQRVMsXG4gIENIQU5ORUxfU0NBTEVTLFxuICBGSUVMRF9PUFRTLFxuICBTQ0FMRV9GVU5DLFxuICBDSEFOTkVMX1NDQUxFX1NVUFBPUlRFRF9GSUVMRFMsXG4gIE1BWF9HUFVfRklMVEVSU1xufSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge0NPTE9SX1JBTkdFU30gZnJvbSAnY29uc3RhbnRzL2NvbG9yLXJhbmdlcyc7XG5pbXBvcnQge0RhdGFWaXpDb2xvcnN9IGZyb20gJ2NvbnN0YW50cy9jdXN0b20tY29sb3ItcmFuZ2VzJztcbmltcG9ydCB7TEFZRVJfVklTX0NPTkZJR1MsIERFRkFVTFRfVEVYVF9MQUJFTCwgREVGQVVMVF9DT0xPUl9VSX0gZnJvbSAnLi9sYXllci1mYWN0b3J5JztcblxuaW1wb3J0IHtnZW5lcmF0ZUhhc2hJZCwgaXNQbGFpbk9iamVjdH0gZnJvbSAndXRpbHMvdXRpbHMnO1xuXG5pbXBvcnQge1xuICBnZXRTYW1wbGVEYXRhLFxuICBnZXRMYXRMbmdCb3VuZHMsXG4gIG1heWJlVG9EYXRlLFxuICBnZXRTb3J0aW5nRnVuY3Rpb24sXG4gIG5vdE51bGxvclVuZGVmaW5lZFxufSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcblxuaW1wb3J0IHtcbiAgZ2V0UXVhbnRpbGVEb21haW4sXG4gIGdldE9yZGluYWxEb21haW4sXG4gIGdldExvZ0RvbWFpbixcbiAgZ2V0TGluZWFyRG9tYWluXG59IGZyb20gJ3V0aWxzL2RhdGEtc2NhbGUtdXRpbHMnO1xuaW1wb3J0IHtoZXhUb1JnYiwgZ2V0Q29sb3JHcm91cEJ5TmFtZSwgcmV2ZXJzZUNvbG9yUmFuZ2V9IGZyb20gJ3V0aWxzL2NvbG9yLXV0aWxzJztcblxuLyoqXG4gKiBBcHByb3guIG51bWJlciBvZiBwb2ludHMgdG8gc2FtcGxlIGluIGEgbGFyZ2UgZGF0YSBzZXRcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IE1BWF9TQU1QTEVfU0laRSA9IDUwMDA7XG5jb25zdCBkYXRhRmlsdGVyRXh0ZW5zaW9uID0gbmV3IERhdGFGaWx0ZXJFeHRlbnNpb24oe2ZpbHRlclNpemU6IE1BWF9HUFVfRklMVEVSU30pO1xuY29uc3QgaWRlbnRpdHkgPSBkID0+IGQ7XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX1RZUEUgPSBrZXltaXJyb3Ioe1xuICBkZWNrZ2w6IG51bGwsXG4gIG1hcGJveGdsOiBudWxsXG59KTtcblxuZXhwb3J0IGNvbnN0IGxheWVyQ29sb3JzID0gT2JqZWN0LnZhbHVlcyhEYXRhVml6Q29sb3JzKS5tYXAoaGV4VG9SZ2IpO1xuZnVuY3Rpb24qIGdlbmVyYXRlQ29sb3IoKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIHdoaWxlIChpbmRleCA8IGxheWVyQ29sb3JzLmxlbmd0aCArIDEpIHtcbiAgICBpZiAoaW5kZXggPT09IGxheWVyQ29sb3JzLmxlbmd0aCkge1xuICAgICAgaW5kZXggPSAwO1xuICAgIH1cbiAgICB5aWVsZCBsYXllckNvbG9yc1tpbmRleCsrXTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29sb3JNYWtlciA9IGdlbmVyYXRlQ29sb3IoKTtcbmNvbnN0IGRlZmF1bHRHZXRGaWVsZFZhbHVlID0gKGZpZWxkLCBkKSA9PiBkW2ZpZWxkLnRhYmxlRmllbGRJbmRleCAtIDFdO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXllciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICB0aGlzLmlkID0gcHJvcHMuaWQgfHwgZ2VuZXJhdGVIYXNoSWQoNik7XG5cbiAgICAvLyBtZXRhXG4gICAgdGhpcy5tZXRhID0ge307XG5cbiAgICAvLyB2aXNDb25maWdTZXR0aW5nc1xuICAgIHRoaXMudmlzQ29uZmlnU2V0dGluZ3MgPSB7fTtcblxuICAgIHRoaXMuY29uZmlnID0gdGhpcy5nZXREZWZhdWx0TGF5ZXJDb25maWcoe1xuICAgICAgY29sdW1uczogdGhpcy5nZXRMYXllckNvbHVtbnMoKSxcbiAgICAgIC4uLnByb3BzXG4gICAgfSk7XG4gIH1cblxuICBnZXQgbGF5ZXJJY29uKCkge1xuICAgIHJldHVybiBEZWZhdWx0TGF5ZXJJY29uO1xuICB9XG5cbiAgZ2V0IG92ZXJsYXlUeXBlKCkge1xuICAgIHJldHVybiBPVkVSTEFZX1RZUEUuZGVja2dsO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlO1xuICB9XG5cbiAgZ2V0IGlzQWdncmVnYXRlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXQgcmVxdWlyZWRMYXllckNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0IG9wdGlvbmFsQ29sdW1ucygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXQgbm9uZUxheWVyRGF0YUFmZmVjdGluZ1Byb3BzKCkge1xuICAgIHJldHVybiBbJ2xhYmVsJywgJ29wYWNpdHknLCAndGhpY2tuZXNzJywgJ2lzVmlzaWJsZScsICdoaWRkZW4nXTtcbiAgfVxuXG4gIGdldCB2aXN1YWxDaGFubmVscygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IHtcbiAgICAgICAgcHJvcGVydHk6ICdjb2xvcicsXG4gICAgICAgIGZpZWxkOiAnY29sb3JGaWVsZCcsXG4gICAgICAgIHNjYWxlOiAnY29sb3JTY2FsZScsXG4gICAgICAgIGRvbWFpbjogJ2NvbG9yRG9tYWluJyxcbiAgICAgICAgcmFuZ2U6ICdjb2xvclJhbmdlJyxcbiAgICAgICAga2V5OiAnY29sb3InLFxuICAgICAgICBjaGFubmVsU2NhbGVUeXBlOiBDSEFOTkVMX1NDQUxFUy5jb2xvclxuICAgICAgfSxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgcHJvcGVydHk6ICdzaXplJyxcbiAgICAgICAgZmllbGQ6ICdzaXplRmllbGQnLFxuICAgICAgICBzY2FsZTogJ3NpemVTY2FsZScsXG4gICAgICAgIGRvbWFpbjogJ3NpemVEb21haW4nLFxuICAgICAgICByYW5nZTogJ3NpemVSYW5nZScsXG4gICAgICAgIGtleTogJ3NpemUnLFxuICAgICAgICBjaGFubmVsU2NhbGVUeXBlOiBDSEFOTkVMX1NDQUxFUy5zaXplXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qXG4gICAqIENvbHVtbiBwYWlycyBtYXBzIGxheWVyIGNvbHVtbiB0byBhIHNwZWNpZmljIGZpZWxkIHBhaXJzLFxuICAgKiBCeSBkZWZhdWx0LCBpdCBpcyBzZXQgdG8gbnVsbFxuICAgKi9cbiAgZ2V0IGNvbHVtblBhaXJzKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLypcbiAgICogRGVmYXVsdCBwb2ludCBjb2x1bW4gcGFpcnMsIGNhbiBiZSB1c2VkIGZvciBwb2ludCBiYXNlZCBsYXllcnM6IHBvaW50LCBpY29uIGV0Yy5cbiAgICovXG4gIGdldCBkZWZhdWx0UG9pbnRDb2x1bW5QYWlycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF0OiB7cGFpcjogJ2xuZycsIGZpZWxkUGFpcktleTogJ2xhdCd9LFxuICAgICAgbG5nOiB7cGFpcjogJ2xhdCcsIGZpZWxkUGFpcktleTogJ2xuZyd9XG4gICAgfTtcbiAgfVxuXG4gIC8qXG4gICAqIERlZmF1bHQgbGluayBjb2x1bW4gcGFpcnMsIGNhbiBiZSB1c2VkIGZvciBsaW5rIGJhc2VkIGxheWVyczogYXJjLCBsaW5lIGV0Y1xuICAgKi9cbiAgZ2V0IGRlZmF1bHRMaW5rQ29sdW1uUGFpcnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdDA6IHtwYWlyOiAnbG5nMCcsIGZpZWxkUGFpcktleTogJ2xhdCd9LFxuICAgICAgbG5nMDoge3BhaXI6ICdsYXQwJywgZmllbGRQYWlyS2V5OiAnbG5nJ30sXG4gICAgICBsYXQxOiB7cGFpcjogJ2xuZzEnLCBmaWVsZFBhaXJLZXk6ICdsYXQnfSxcbiAgICAgIGxuZzE6IHtwYWlyOiAnbGF0MScsIGZpZWxkUGFpcktleTogJ2xuZyd9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBSZWFjdCBjb21wb25lbnQgZm9yIHRvIHJlbmRlciBsYXllciBpbnN0cnVjdGlvbnMgaW4gYSBtb2RhbFxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIGFuIG9iamVjdFxuICAgKiBAZXhhbXBsZVxuICAgKiAgcmV0dXJuIHtcbiAgICogICAgaWQ6ICdpY29uSW5mbycsXG4gICAqICAgIHRlbXBsYXRlOiBJY29uSW5mb01vZGFsLFxuICAgKiAgICBtb2RhbFByb3BzOiB7XG4gICAqICAgICAgdGl0bGU6ICdIb3cgdG8gZHJhdyBpY29ucydcbiAgICogICB9O1xuICAgKiB9XG4gICAqL1xuICBnZXQgbGF5ZXJJbmZvTW9kYWwoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgLypcbiAgICogR2l2ZW4gYSBkYXRhc2V0LCBhdXRvbWF0aWNhbGx5IGZpbmQgcHJvcHMgdG8gY3JlYXRlIGxheWVyIGJhc2VkIG9uIGl0XG4gICAqIGFuZCByZXR1cm4gdGhlIHByb3BzIGFuZCBwcmV2aW91cyBmb3VuZCBsYXllcnMuXG4gICAqIEJ5IGRlZmF1bHQsIG5vIGxheWVycyB3aWxsIGJlIGZvdW5kXG4gICAqL1xuICBzdGF0aWMgZmluZERlZmF1bHRMYXllclByb3BzKGRhdGFzZXQsIGZvdW5kTGF5ZXJzKSB7XG4gICAgcmV0dXJuIHtwcm9wczogW10sIGZvdW5kTGF5ZXJzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGFycmF5IG9mIHByZXNldCByZXF1aXJlZCBjb2x1bW4gbmFtZXNcbiAgICogZm91bmQgZmllbGQgdGhhdCBoYXMgdGhlIHNhbWUgbmFtZSB0byBzZXQgYXMgbGF5ZXIgY29sdW1uXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0RmllbGRzXG4gICAqIEBwYXJhbSB7b2JqZWN0W119IGFsbEZpZWxkc1xuICAgKiBAcmV0dXJucyB7b2JqZWN0W10gfCBudWxsfSBhbGwgcG9zc2libGUgcmVxdWlyZWQgbGF5ZXIgY29sdW1uIHBhaXJzXG4gICAqL1xuICBzdGF0aWMgZmluZERlZmF1bHRDb2x1bW5GaWVsZChkZWZhdWx0RmllbGRzLCBhbGxGaWVsZHMpIHtcbiAgICAvLyBmaW5kIGFsbCBtYXRjaGVkIGZpZWxkcyBmb3IgZWFjaCByZXF1aXJlZCBjb2xcbiAgICBjb25zdCByZXF1aXJlZENvbHVtbnMgPSBPYmplY3Qua2V5cyhkZWZhdWx0RmllbGRzKS5yZWR1Y2UoKHByZXYsIGtleSkgPT4ge1xuICAgICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBhbGxGaWVsZHMuZmlsdGVyKFxuICAgICAgICBmID0+IGYubmFtZSA9PT0gZGVmYXVsdEZpZWxkc1trZXldIHx8IGRlZmF1bHRGaWVsZHNba2V5XS5pbmNsdWRlcyhmLm5hbWUpXG4gICAgICApO1xuXG4gICAgICBwcmV2W2tleV0gPSByZXF1aXJlZEZpZWxkcy5sZW5ndGhcbiAgICAgICAgPyByZXF1aXJlZEZpZWxkcy5tYXAoZiA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IGYubmFtZSxcbiAgICAgICAgICAgIGZpZWxkSWR4OiBmLnRhYmxlRmllbGRJbmRleCAtIDFcbiAgICAgICAgICB9KSlcbiAgICAgICAgOiBudWxsO1xuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwge30pO1xuXG4gICAgaWYgKCFPYmplY3QudmFsdWVzKHJlcXVpcmVkQ29sdW1ucykuZXZlcnkoQm9vbGVhbikpIHtcbiAgICAgIC8vIGlmIGFueSBmaWVsZCBtaXNzaW5nLCByZXR1cm4gbnVsbFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUG9zc2libGVDb2x1bW5QYXJpcyhyZXF1aXJlZENvbHVtbnMpO1xuICB9XG5cbiAgc3RhdGljIGdldEFsbFBvc3NpYmxlQ29sdW1uUGFyaXMocmVxdWlyZWRDb2x1bW5zKSB7XG4gICAgLy8gZm9yIG11bHRpcGxlIG1hdGNoZWQgZmllbGQgZm9yIG9uZSByZXF1aXJlZCBjb2x1bW4sIHJldHVybiBtdWx0aXBsZVxuICAgIC8vIGNvbWJpbmF0aW9ucywgZS4gZy4gaWYgY29sdW1uIGEgaGFzIDIgbWF0Y2hlZCwgY29sdW1uIGIgaGFzIDMgbWF0Y2hlZFxuICAgIC8vIDYgcG9zc2libGUgY29sdW1uIHBhaXJzIHdpbGwgYmUgcmV0dXJuZWRcbiAgICBjb25zdCBhbGxLZXlzID0gT2JqZWN0LmtleXMocmVxdWlyZWRDb2x1bW5zKTtcbiAgICBjb25zdCBwb2ludGVycyA9IGFsbEtleXMubWFwKChrLCBpKSA9PiAoaSA9PT0gYWxsS2V5cy5sZW5ndGggLSAxID8gLTEgOiAwKSk7XG4gICAgY29uc3QgY291bnRQZXJLZXkgPSBhbGxLZXlzLm1hcChrID0+IHJlcXVpcmVkQ29sdW1uc1trXS5sZW5ndGgpO1xuICAgIGNvbnN0IHBhaXJzID0gW107XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1sb29wLWZ1bmMgKi9cbiAgICB3aGlsZSAoaW5jcmVtZW50UG9pbnRlcnMocG9pbnRlcnMsIGNvdW50UGVyS2V5LCBwb2ludGVycy5sZW5ndGggLSAxKSkge1xuICAgICAgY29uc3QgbmV3UGFpciA9IHBvaW50ZXJzLnJlZHVjZSgocHJldiwgY3V1ciwgaSkgPT4ge1xuICAgICAgICBwcmV2W2FsbEtleXNbaV1dID0gcmVxdWlyZWRDb2x1bW5zW2FsbEtleXNbaV1dW2N1dXJdO1xuICAgICAgICByZXR1cm4gcHJldjtcbiAgICAgIH0sIHt9KTtcblxuICAgICAgcGFpcnMucHVzaChuZXdQYWlyKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1sb29wLWZ1bmMgKi9cblxuICAgIC8vIHJlY3Vyc2l2ZWx5IGluY3JlbWVudCBwb2ludGVyc1xuICAgIGZ1bmN0aW9uIGluY3JlbWVudFBvaW50ZXJzKHB0cywgY291bnRzLCBpbmRleCkge1xuICAgICAgaWYgKGluZGV4ID09PSAwICYmIHB0c1swXSA9PT0gY291bnRzWzBdIC0gMSkge1xuICAgICAgICAvLyBub3RoaW5nIHRvIGluY3JlbWVudFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChwdHNbaW5kZXhdICsgMSA8IGNvdW50c1tpbmRleF0pIHtcbiAgICAgICAgcHRzW2luZGV4XSA9IHB0c1tpbmRleF0gKyAxO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcHRzW2luZGV4XSA9IDA7XG4gICAgICByZXR1cm4gaW5jcmVtZW50UG9pbnRlcnMocHRzLCBjb3VudHMsIGluZGV4IC0gMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhaXJzO1xuICB9XG5cbiAgc3RhdGljIGhleFRvUmdiKGMpIHtcbiAgICByZXR1cm4gaGV4VG9SZ2IoYyk7XG4gIH1cblxuICBnZXREZWZhdWx0TGF5ZXJDb25maWcocHJvcHMgPSB7fSkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhSWQ6IHByb3BzLmRhdGFJZCB8fCBudWxsLFxuICAgICAgbGFiZWw6IHByb3BzLmxhYmVsIHx8ICduZXcgbGF5ZXInLFxuICAgICAgY29sb3I6IHByb3BzLmNvbG9yIHx8IGNvbG9yTWFrZXIubmV4dCgpLnZhbHVlLFxuICAgICAgY29sdW1uczogcHJvcHMuY29sdW1ucyB8fCBudWxsLFxuICAgICAgaXNWaXNpYmxlOiBwcm9wcy5pc1Zpc2libGUgfHwgZmFsc2UsXG4gICAgICBpc0NvbmZpZ0FjdGl2ZTogcHJvcHMuaXNDb25maWdBY3RpdmUgfHwgZmFsc2UsXG4gICAgICBoaWdobGlnaHRDb2xvcjogcHJvcHMuaGlnaGxpZ2h0Q29sb3IgfHwgWzI1MiwgMjQyLCAyNiwgMjU1XSxcbiAgICAgIGhpZGRlbjogcHJvcHMuaGlkZGVuIHx8IGZhbHNlLFxuXG4gICAgICAvLyBUT0RPOiByZWZhY3RvciB0aGlzIGludG8gc2VwYXJhdGUgdmlzdWFsIENoYW5uZWwgY29uZmlnXG4gICAgICAvLyBjb2xvciBieSBmaWVsZCwgZG9tYWluIGlzIHNldCBieSBmaWx0ZXJzLCBmaWVsZCwgc2NhbGUgdHlwZVxuICAgICAgY29sb3JGaWVsZDogbnVsbCxcbiAgICAgIGNvbG9yRG9tYWluOiBbMCwgMV0sXG4gICAgICBjb2xvclNjYWxlOiBTQ0FMRV9UWVBFUy5xdWFudGlsZSxcblxuICAgICAgLy8gY29sb3IgYnkgc2l6ZSwgZG9tYWluIGlzIHNldCBieSBmaWx0ZXJzLCBmaWVsZCwgc2NhbGUgdHlwZVxuICAgICAgc2l6ZURvbWFpbjogWzAsIDFdLFxuICAgICAgc2l6ZVNjYWxlOiBTQ0FMRV9UWVBFUy5saW5lYXIsXG4gICAgICBzaXplRmllbGQ6IG51bGwsXG5cbiAgICAgIHZpc0NvbmZpZzoge30sXG5cbiAgICAgIHRleHRMYWJlbDogW0RFRkFVTFRfVEVYVF9MQUJFTF0sXG5cbiAgICAgIGNvbG9yVUk6IHtcbiAgICAgICAgY29sb3I6IERFRkFVTFRfQ09MT1JfVUksXG4gICAgICAgIGNvbG9yUmFuZ2U6IERFRkFVTFRfQ09MT1JfVUlcbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246IHtlbmFibGVkOiBmYWxzZX1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZGVzY3JpcHRpb24gb2YgYSB2aXN1YWxDaGFubmVsIGNvbmZpZ1xuICAgKiBAcGFyYW0ga2V5XG4gICAqIEByZXR1cm5zIHt7bGFiZWw6IHN0cmluZywgbWVhc3VyZTogKHN0cmluZ3xzdHJpbmcpfX1cbiAgICovXG4gIGdldFZpc3VhbENoYW5uZWxEZXNjcmlwdGlvbihrZXkpIHtcbiAgICAvLyBlLmcuIGxhYmVsOiBDb2xvciwgbWVhc3VyZTogVmVoaWNsZSBUeXBlXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiB0aGlzLnZpc0NvbmZpZ1NldHRpbmdzW3RoaXMudmlzdWFsQ2hhbm5lbHNba2V5XS5yYW5nZV0ubGFiZWwsXG4gICAgICBtZWFzdXJlOiB0aGlzLmNvbmZpZ1t0aGlzLnZpc3VhbENoYW5uZWxzW2tleV0uZmllbGRdXG4gICAgICAgID8gdGhpcy5jb25maWdbdGhpcy52aXN1YWxDaGFubmVsc1trZXldLmZpZWxkXS5uYW1lXG4gICAgICAgIDogdGhpcy52aXN1YWxDaGFubmVsc1trZXldLmRlZmF1bHRNZWFzdXJlXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NpZ24gYSBmaWVsZCB0byBsYXllciBjb2x1bW4sIHJldHVybiBjb2x1bW4gY29uZmlnXG4gICAqIEBwYXJhbSBrZXkgLSBDb2x1bW4gS2V5XG4gICAqIEBwYXJhbSBmaWVsZCAtIFNlbGVjdGVkIGZpZWxkXG4gICAqIEByZXR1cm5zIHt7fX0gLSBDb2x1bW4gY29uZmlnXG4gICAqL1xuICBhc3NpZ25Db2x1bW4oa2V5LCBmaWVsZCkge1xuICAgIC8vIGZpZWxkIHZhbHVlIGNvdWxkIGJlIG51bGwgZm9yIG9wdGlvbmFsIGNvbHVtbnNcbiAgICBjb25zdCB1cGRhdGUgPSBmaWVsZFxuICAgICAgPyB7XG4gICAgICAgICAgdmFsdWU6IGZpZWxkLm5hbWUsXG4gICAgICAgICAgZmllbGRJZHg6IGZpZWxkLnRhYmxlRmllbGRJbmRleCAtIDFcbiAgICAgICAgfVxuICAgICAgOiB7dmFsdWU6IG51bGwsIGZpZWxkSWR4OiAtMX07XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4udGhpcy5jb25maWcuY29sdW1ucyxcbiAgICAgIFtrZXldOiB7XG4gICAgICAgIC4uLnRoaXMuY29uZmlnLmNvbHVtbnNba2V5XSxcbiAgICAgICAgLi4udXBkYXRlXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NpZ24gYSBmaWVsZCBwYWlyIHRvIGNvbHVtbiBjb25maWcsIHJldHVybiBjb2x1bW4gY29uZmlnXG4gICAqIEBwYXJhbSBrZXkgLSBDb2x1bW4gS2V5XG4gICAqIEBwYXJhbSBwYWlyIC0gZmllbGQgUGFpclxuICAgKiBAcmV0dXJucyB7e319IC0gQ29sdW1uIGNvbmZpZ1xuICAgKi9cbiAgYXNzaWduQ29sdW1uUGFpcnMoa2V5LCBwYWlyKSB7XG4gICAgaWYgKCF0aGlzLmNvbHVtblBhaXJzIHx8ICF0aGlzLmNvbHVtblBhaXJzW2tleV0pIHtcbiAgICAgIC8vIHNob3VsZCBub3QgZW5kIGluIHRoaXMgc3RhdGVcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5jb2x1bW5zO1xuICAgIH1cblxuICAgIGNvbnN0IHtwYWlyOiBwYXJ0bmVyS2V5LCBmaWVsZFBhaXJLZXl9ID0gdGhpcy5jb2x1bW5QYWlyc1trZXldO1xuICAgIGNvbnN0IHtmaWVsZFBhaXJLZXk6IHBhcnRuZXJGaWVsZFBhaXJLZXl9ID0gdGhpcy5jb2x1bW5QYWlyc1twYXJ0bmVyS2V5XTtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi50aGlzLmNvbmZpZy5jb2x1bW5zLFxuICAgICAgW2tleV06IHBhaXJbZmllbGRQYWlyS2V5XSxcbiAgICAgIFtwYXJ0bmVyS2V5XTogcGFpcltwYXJ0bmVyRmllbGRQYWlyS2V5XVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGEgcmFkaXVzIHpvb20gbXVsdGlwbGllciB0byByZW5kZXIgcG9pbnRzLCBzbyB0aGV5IGFyZSB2aXNpYmxlIGluIGFsbCB6b29tIGxldmVsXG4gICAqIEBwYXJhbSBtYXBTdGF0ZVxuICAgKiBAcGFyYW0gbWFwU3RhdGUuem9vbSAtIGFjdHVhbCB6b29tXG4gICAqIEBwYXJhbSBtYXBTdGF0ZS56b29tT2Zmc2V0IC0gem9vbU9mZnNldCB3aGVuIHJlbmRlciBpbiB0aGUgcGxvdCBjb250YWluZXIgZm9yIGV4cG9ydCBpbWFnZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0Wm9vbUZhY3Rvcih7em9vbSwgem9vbU9mZnNldCA9IDB9KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KDIsIE1hdGgubWF4KDE0IC0gem9vbSArIHpvb21PZmZzZXQsIDApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYSBlbGV2YXRpb24gem9vbSBtdWx0aXBsaWVyIHRvIHJlbmRlciBwb2ludHMsIHNvIHRoZXkgYXJlIHZpc2libGUgaW4gYWxsIHpvb20gbGV2ZWxcbiAgICogQHBhcmFtIG1hcFN0YXRlXG4gICAqIEBwYXJhbSBtYXBTdGF0ZS56b29tIC0gYWN0dWFsIHpvb21cbiAgICogQHBhcmFtIG1hcFN0YXRlLnpvb21PZmZzZXQgLSB6b29tT2Zmc2V0IHdoZW4gcmVuZGVyIGluIHRoZSBwbG90IGNvbnRhaW5lciBmb3IgZXhwb3J0IGltYWdlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXRFbGV2YXRpb25ab29tRmFjdG9yKHt6b29tLCB6b29tT2Zmc2V0ID0gMH0pIHtcbiAgICByZXR1cm4gTWF0aC5wb3coMiwgTWF0aC5tYXgoOCAtIHpvb20gKyB6b29tT2Zmc2V0LCAwKSk7XG4gIH1cblxuICBmb3JtYXRMYXllckRhdGEoZGF0YXNldHMsIGZpbHRlcmVkSW5kZXgpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICByZW5kZXJMYXllcigpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXRIb3ZlckRhdGEob2JqZWN0KSB7XG4gICAgaWYgKCFvYmplY3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBieSBkZWZhdWx0LCBlYWNoIGVudHJ5IG9mIGxheWVyRGF0YSBzaG91bGQgaGF2ZSBhIGRhdGEgcHJvcGVydHkgcG9pbnRzXG4gICAgLy8gdG8gdGhlIG9yaWdpbmFsIGl0ZW0gaW4gdGhlIGFsbERhdGEgYXJyYXlcbiAgICAvLyBlYWNoIGxheWVyIGNhbiBpbXBsZW1lbnQgaXRzIG93biBnZXRIb3ZlckRhdGEgbWV0aG9kXG4gICAgcmV0dXJuIG9iamVjdC5kYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gY2hhbmdlIGxheWVyIHR5cGUsIHRyeSB0byBjb3B5IG92ZXIgbGF5ZXIgY29uZmlncyBhcyBtdWNoIGFzIHBvc3NpYmxlXG4gICAqIEBwYXJhbSBjb25maWdUb0NvcHkgLSBjb25maWcgdG8gY29weSBvdmVyXG4gICAqIEBwYXJhbSB2aXNDb25maWdTZXR0aW5ncyAtIHZpc0NvbmZpZyBzZXR0aW5ncyBvZiBjb25maWcgdG8gY29weVxuICAgKi9cbiAgYXNzaWduQ29uZmlnVG9MYXllcihjb25maWdUb0NvcHksIHZpc0NvbmZpZ1NldHRpbmdzKSB7XG4gICAgLy8gZG9uJ3QgZGVlcCBtZXJnZSB2aXN1YWxDaGFubmVsIGZpZWxkXG4gICAgLy8gZG9uJ3QgZGVlcCBtZXJnZSBjb2xvciByYW5nZSwgcmV2ZXJzZWQ6IGlzIG5vdCBhIGtleSBieSBkZWZhdWx0XG4gICAgY29uc3Qgc2hhbGxvd0NvcHkgPSBbJ2NvbG9yUmFuZ2UnLCAnc3Ryb2tlQ29sb3JSYW5nZSddLmNvbmNhdChcbiAgICAgIE9iamVjdC52YWx1ZXModGhpcy52aXN1YWxDaGFubmVscykubWFwKHYgPT4gdi5maWVsZClcbiAgICApO1xuXG4gICAgLy8gZG9uJ3QgY29weSBvdmVyIGRvbWFpbiBhbmQgYW5pbWF0aW9uXG4gICAgY29uc3Qgbm90VG9Db3B5ID0gWydhbmltYXRpb24nXS5jb25jYXQoT2JqZWN0LnZhbHVlcyh0aGlzLnZpc3VhbENoYW5uZWxzKS5tYXAodiA9PiB2LmRvbWFpbikpO1xuICAgIC8vIGlmIHJhbmdlIGlzIGZvciB0aGUgc2FtZSBwcm9wZXJ0eSBncm91cCBjb3B5IGl0LCBvdGhlcndpc2UsIG5vdCB0byBjb3B5XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLnZpc3VhbENoYW5uZWxzKS5mb3JFYWNoKHYgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBjb25maWdUb0NvcHkudmlzQ29uZmlnW3YucmFuZ2VdICYmXG4gICAgICAgIHZpc0NvbmZpZ1NldHRpbmdzW3YucmFuZ2VdLmdyb3VwICE9PSB0aGlzLnZpc0NvbmZpZ1NldHRpbmdzW3YucmFuZ2VdLmdyb3VwXG4gICAgICApIHtcbiAgICAgICAgbm90VG9Db3B5LnB1c2godi5yYW5nZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBkb24ndCBjb3B5IG92ZXIgdmlzdWFsQ2hhbm5lbCByYW5nZVxuICAgIGNvbnN0IGN1cnJlbnRDb25maWcgPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCBjb3BpZWQgPSB0aGlzLmNvcHlMYXllckNvbmZpZyhjdXJyZW50Q29uZmlnLCBjb25maWdUb0NvcHksIHtcbiAgICAgIHNoYWxsb3dDb3B5LFxuICAgICAgbm90VG9Db3B5XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKGNvcGllZCk7XG4gICAgLy8gdmFsaWRhdGUgdmlzdWFsQ2hhbm5lbCBmaWVsZCB0eXBlIGFuZCBzY2FsZSB0eXBlc1xuICAgIE9iamVjdC5rZXlzKHRoaXMudmlzdWFsQ2hhbm5lbHMpLmZvckVhY2goY2hhbm5lbCA9PiB7XG4gICAgICB0aGlzLnZhbGlkYXRlVmlzdWFsQ2hhbm5lbChjaGFubmVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IGNvcHkgY29uZmlnIG92ZXIgdG8gYW4gZW1wdHkgbGF5ZXJcbiAgICogd2hlbiByZWNlaXZlZCBzYXZlZCBjb25maWcsIG9yIGNvcHkgY29uZmlnIG92ZXIgZnJvbSBhIGRpZmZlcmVudCBsYXllciB0eXBlXG4gICAqIG1ha2Ugc3VyZSB0byBvbmx5IGNvcHkgb3ZlciB2YWx1ZSB0byBleGlzdGluZyBrZXlzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBjdXJyZW50Q29uZmlnIC0gZXhpc3RpbmcgY29uZmlnIHRvIGJlIG92ZXJyaWRlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWdUb0NvcHkgLSBuZXcgQ29uZmlnIHRvIGNvcHkgb3ZlclxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzaGFsbG93Q29weSAtIGFycmF5IG9mIHByb3BlcnRpZXMgdG8gbm90IHRvIGJlIGRlZXAgY29waWVkXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IG5vdFRvQ29weSAtIGFycmF5IG9mIHByb3BlcnRpZXMgbm90IHRvIGNvcHlcbiAgICogQHJldHVybnMge29iamVjdH0gLSBjb3BpZWQgY29uZmlnXG4gICAqL1xuICBjb3B5TGF5ZXJDb25maWcoY3VycmVudENvbmZpZywgY29uZmlnVG9Db3B5LCB7c2hhbGxvd0NvcHkgPSBbXSwgbm90VG9Db3B5ID0gW119ID0ge30pIHtcbiAgICBjb25zdCBjb3BpZWQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjdXJyZW50Q29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGlzUGxhaW5PYmplY3QoY3VycmVudENvbmZpZ1trZXldKSAmJlxuICAgICAgICBpc1BsYWluT2JqZWN0KGNvbmZpZ1RvQ29weVtrZXldKSAmJlxuICAgICAgICAhc2hhbGxvd0NvcHkuaW5jbHVkZXMoa2V5KSAmJlxuICAgICAgICAhbm90VG9Db3B5LmluY2x1ZGVzKGtleSlcbiAgICAgICkge1xuICAgICAgICAvLyByZWN1cnNpdmVseSBhc3NpZ24gb2JqZWN0IHZhbHVlXG4gICAgICAgIGNvcGllZFtrZXldID0gdGhpcy5jb3B5TGF5ZXJDb25maWcoY3VycmVudENvbmZpZ1trZXldLCBjb25maWdUb0NvcHlba2V5XSwge1xuICAgICAgICAgIHNoYWxsb3dDb3B5LFxuICAgICAgICAgIG5vdFRvQ29weVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAobm90TnVsbG9yVW5kZWZpbmVkKGNvbmZpZ1RvQ29weVtrZXldKSAmJiAhbm90VG9Db3B5LmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgLy8gY29weVxuICAgICAgICBjb3BpZWRba2V5XSA9IGNvbmZpZ1RvQ29weVtrZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8ga2VlcCBleGlzdGluZ1xuICAgICAgICBjb3BpZWRba2V5XSA9IGN1cnJlbnRDb25maWdba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjb3BpZWQ7XG4gIH1cblxuICByZWdpc3RlclZpc0NvbmZpZyhsYXllclZpc0NvbmZpZ3MpIHtcbiAgICBPYmplY3Qua2V5cyhsYXllclZpc0NvbmZpZ3MpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnICYmIExBWUVSX1ZJU19DT05GSUdTW2xheWVyVmlzQ29uZmlnc1tpdGVtXV0pIHtcbiAgICAgICAgLy8gaWYgYXNzaWduZWQgb25lIG9mIGRlZmF1bHQgTEFZRVJfQ09ORklHU1xuICAgICAgICB0aGlzLmNvbmZpZy52aXNDb25maWdbaXRlbV0gPSBMQVlFUl9WSVNfQ09ORklHU1tsYXllclZpc0NvbmZpZ3NbaXRlbV1dLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgdGhpcy52aXNDb25maWdTZXR0aW5nc1tpdGVtXSA9IExBWUVSX1ZJU19DT05GSUdTW2xheWVyVmlzQ29uZmlnc1tpdGVtXV07XG4gICAgICB9IGVsc2UgaWYgKFsndHlwZScsICdkZWZhdWx0VmFsdWUnXS5ldmVyeShwID0+IGxheWVyVmlzQ29uZmlnc1tpdGVtXS5oYXNPd25Qcm9wZXJ0eShwKSkpIHtcbiAgICAgICAgLy8gaWYgcHJvdmlkZWQgY3VzdG9taXplZCB2aXNDb25maWcsIGFuZCBoYXMgdHlwZSAmJiBkZWZhdWx0VmFsdWVcbiAgICAgICAgLy8gVE9ETzogZnVydGhlciBjaGVjayBpZiBjdXN0b21pemVkIHZpc0NvbmZpZyBpcyB2YWxpZFxuICAgICAgICB0aGlzLmNvbmZpZy52aXNDb25maWdbaXRlbV0gPSBsYXllclZpc0NvbmZpZ3NbaXRlbV0uZGVmYXVsdFZhbHVlO1xuICAgICAgICB0aGlzLnZpc0NvbmZpZ1NldHRpbmdzW2l0ZW1dID0gbGF5ZXJWaXNDb25maWdzW2l0ZW1dO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0TGF5ZXJDb2x1bW5zKCkge1xuICAgIGNvbnN0IHJlcXVpcmVkID0gdGhpcy5yZXF1aXJlZExheWVyQ29sdW1ucy5yZWR1Y2UoXG4gICAgICAoYWNjdSwga2V5KSA9PiAoe1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICBba2V5XToge3ZhbHVlOiBudWxsLCBmaWVsZElkeDogLTF9XG4gICAgICB9KSxcbiAgICAgIHt9XG4gICAgKTtcbiAgICBjb25zdCBvcHRpb25hbCA9IHRoaXMub3B0aW9uYWxDb2x1bW5zLnJlZHVjZShcbiAgICAgIChhY2N1LCBrZXkpID0+ICh7XG4gICAgICAgIC4uLmFjY3UsXG4gICAgICAgIFtrZXldOiB7dmFsdWU6IG51bGwsIGZpZWxkSWR4OiAtMSwgb3B0aW9uYWw6IHRydWV9XG4gICAgICB9KSxcbiAgICAgIHt9XG4gICAgKTtcblxuICAgIHJldHVybiB7Li4ucmVxdWlyZWQsIC4uLm9wdGlvbmFsfTtcbiAgfVxuXG4gIHVwZGF0ZUxheWVyQ29uZmlnKG5ld0NvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gey4uLnRoaXMuY29uZmlnLCAuLi5uZXdDb25maWd9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXBkYXRlTGF5ZXJWaXNDb25maWcobmV3VmlzQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcudmlzQ29uZmlnID0gey4uLnRoaXMuY29uZmlnLnZpc0NvbmZpZywgLi4ubmV3VmlzQ29uZmlnfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVwZGF0ZUxheWVyQ29sb3JVSShwcm9wLCBuZXdDb25maWcpIHtcbiAgICBjb25zdCB7Y29sb3JVSTogcHJldmlvdXMsIHZpc0NvbmZpZ30gPSB0aGlzLmNvbmZpZztcblxuICAgIGlmICghaXNQbGFpbk9iamVjdChuZXdDb25maWcpIHx8IHR5cGVvZiBwcm9wICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3QgY29sb3JVSVByb3AgPSBPYmplY3QuZW50cmllcyhuZXdDb25maWcpLnJlZHVjZSgoYWNjdSwgW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICBba2V5XTogaXNQbGFpbk9iamVjdChhY2N1W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsdWUpID8gey4uLmFjY3Vba2V5XSwgLi4udmFsdWV9IDogdmFsdWVcbiAgICAgIH07XG4gICAgfSwgcHJldmlvdXNbcHJvcF0gfHwgREVGQVVMVF9DT0xPUl9VSSk7XG5cbiAgICBjb25zdCBjb2xvclVJID0ge1xuICAgICAgLi4ucHJldmlvdXMsXG4gICAgICBbcHJvcF06IGNvbG9yVUlQcm9wXG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlTGF5ZXJDb25maWcoe2NvbG9yVUl9KTtcbiAgICAvLyBpZiBjb2xvclVJW3Byb3BdIGlzIGNvbG9yUmFuZ2VcbiAgICBjb25zdCBpc0NvbG9yUmFuZ2UgPSB2aXNDb25maWdbcHJvcF0gJiYgdmlzQ29uZmlnW3Byb3BdLmNvbG9ycztcblxuICAgIGlmIChpc0NvbG9yUmFuZ2UpIHtcbiAgICAgIHRoaXMudXBkYXRlQ29sb3JVSUJ5Q29sb3JSYW5nZShuZXdDb25maWcsIHByb3ApO1xuICAgICAgdGhpcy51cGRhdGVDb2xvclJhbmdlQnlDb2xvclVJKG5ld0NvbmZpZywgcHJldmlvdXMsIHByb3ApO1xuICAgICAgdGhpcy51cGRhdGVDdXN0b21QYWxldHRlKG5ld0NvbmZpZywgcHJldmlvdXMsIHByb3ApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXBkYXRlQ3VzdG9tUGFsZXR0ZShuZXdDb25maWcsIHByZXZpb3VzLCBwcm9wKSB7XG4gICAgaWYgKCFuZXdDb25maWcuY29sb3JSYW5nZUNvbmZpZyB8fCAhbmV3Q29uZmlnLmNvbG9yUmFuZ2VDb25maWcuY3VzdG9tKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2NvbG9yVUksIHZpc0NvbmZpZ30gPSB0aGlzLmNvbmZpZztcblxuICAgIGlmICghdmlzQ29uZmlnW3Byb3BdKSByZXR1cm47XG4gICAgY29uc3Qge2NvbG9yc30gPSB2aXNDb25maWdbcHJvcF07XG4gICAgY29uc3QgY3VzdG9tUGFsZXR0ZSA9IHtcbiAgICAgIC4uLmNvbG9yVUlbcHJvcF0uY3VzdG9tUGFsZXR0ZSxcbiAgICAgIG5hbWU6ICdDdXN0b20gUGFsZXR0ZScsXG4gICAgICBjb2xvcnM6IFsuLi5jb2xvcnNdXG4gICAgfTtcbiAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKHtcbiAgICAgIGNvbG9yVUk6IHtcbiAgICAgICAgLi4uY29sb3JVSSxcbiAgICAgICAgW3Byb3BdOiB7XG4gICAgICAgICAgLi4uY29sb3JVSVtwcm9wXSxcbiAgICAgICAgICBjdXN0b21QYWxldHRlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogaWYgb3BlbiBkcm9wZG93biBhbmQgcHJvcCBpcyBjb2xvciByYW5nZVxuICAgKiBBdXRvbWF0aWNhbGx5IHNldCBjb2xvclJhbmdlQ29uZmlnJ3Mgc3RlcCBhbmQgcmV2ZXJzZWRcbiAgICogQHBhcmFtIHsqfSBuZXdDb25maWdcbiAgICogQHBhcmFtIHsqfSBwcm9wXG4gICAqL1xuICB1cGRhdGVDb2xvclVJQnlDb2xvclJhbmdlKG5ld0NvbmZpZywgcHJvcCkge1xuICAgIGlmICh0eXBlb2YgbmV3Q29uZmlnLnNob3dEcm9wZG93biAhPT0gJ251bWJlcicpIHJldHVybjtcblxuICAgIGNvbnN0IHtjb2xvclVJLCB2aXNDb25maWd9ID0gdGhpcy5jb25maWc7XG4gICAgdGhpcy51cGRhdGVMYXllckNvbmZpZyh7XG4gICAgICBjb2xvclVJOiB7XG4gICAgICAgIC4uLmNvbG9yVUksXG4gICAgICAgIFtwcm9wXToge1xuICAgICAgICAgIC4uLmNvbG9yVUlbcHJvcF0sXG4gICAgICAgICAgY29sb3JSYW5nZUNvbmZpZzoge1xuICAgICAgICAgICAgLi4uY29sb3JVSVtwcm9wXS5jb2xvclJhbmdlQ29uZmlnLFxuICAgICAgICAgICAgc3RlcHM6IHZpc0NvbmZpZ1twcm9wXS5jb2xvcnMubGVuZ3RoLFxuICAgICAgICAgICAgcmV2ZXJzZWQ6IEJvb2xlYW4odmlzQ29uZmlnW3Byb3BdLnJldmVyc2VkKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlQ29sb3JSYW5nZUJ5Q29sb3JVSShuZXdDb25maWcsIHByZXZpb3VzLCBwcm9wKSB7XG4gICAgLy8gb25seSB1cGRhdGUgY29sb3JSYW5nZSBpZiBjaGFuZ2VzIGluIFVJIGlzIG1hZGUgdG8gJ3JldmVyc2VkJywgJ3N0ZXBzJyBvciBzdGVwc1xuICAgIGNvbnN0IHNob3VsZFVwZGF0ZSA9XG4gICAgICBuZXdDb25maWcuY29sb3JSYW5nZUNvbmZpZyAmJlxuICAgICAgWydyZXZlcnNlZCcsICdzdGVwcyddLnNvbWUoXG4gICAgICAgIGtleSA9PlxuICAgICAgICAgIG5ld0NvbmZpZy5jb2xvclJhbmdlQ29uZmlnLmhhc093blByb3BlcnR5KGtleSkgJiZcbiAgICAgICAgICBuZXdDb25maWcuY29sb3JSYW5nZUNvbmZpZ1trZXldICE9PVxuICAgICAgICAgICAgKHByZXZpb3VzW3Byb3BdIHx8IERFRkFVTFRfQ09MT1JfVUkpLmNvbG9yUmFuZ2VDb25maWdba2V5XVxuICAgICAgKTtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkgcmV0dXJuO1xuXG4gICAgY29uc3Qge2NvbG9yVUksIHZpc0NvbmZpZ30gPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCB7c3RlcHMsIHJldmVyc2VkfSA9IGNvbG9yVUlbcHJvcF0uY29sb3JSYW5nZUNvbmZpZztcbiAgICBjb25zdCBjb2xvclJhbmdlID0gdmlzQ29uZmlnW3Byb3BdO1xuICAgIC8vIGZpbmQgYmFzZWQgb24gc3RlcCBvciByZXZlcnNlZFxuICAgIGxldCB1cGRhdGU7XG4gICAgaWYgKG5ld0NvbmZpZy5jb2xvclJhbmdlQ29uZmlnLmhhc093blByb3BlcnR5KCdzdGVwcycpKSB7XG4gICAgICBjb25zdCBncm91cCA9IGdldENvbG9yR3JvdXBCeU5hbWUoY29sb3JSYW5nZSk7XG5cbiAgICAgIGlmIChncm91cCkge1xuICAgICAgICBjb25zdCBzYW1lR3JvdXAgPSBDT0xPUl9SQU5HRVMuZmlsdGVyKGNyID0+IGdldENvbG9yR3JvdXBCeU5hbWUoY3IpID09PSBncm91cCk7XG5cbiAgICAgICAgdXBkYXRlID0gc2FtZUdyb3VwLmZpbmQoY3IgPT4gY3IuY29sb3JzLmxlbmd0aCA9PT0gc3RlcHMpO1xuXG4gICAgICAgIGlmICh1cGRhdGUgJiYgY29sb3JSYW5nZS5yZXZlcnNlZCkge1xuICAgICAgICAgIHVwZGF0ZSA9IHJldmVyc2VDb2xvclJhbmdlKHRydWUsIHVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmV3Q29uZmlnLmNvbG9yUmFuZ2VDb25maWcuaGFzT3duUHJvcGVydHkoJ3JldmVyc2VkJykpIHtcbiAgICAgIHVwZGF0ZSA9IHJldmVyc2VDb2xvclJhbmdlKHJldmVyc2VkLCB1cGRhdGUgfHwgY29sb3JSYW5nZSk7XG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZSkge1xuICAgICAgdGhpcy51cGRhdGVMYXllclZpc0NvbmZpZyh7W3Byb3BdOiB1cGRhdGV9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBsYXllciBoYXMgYWxsIGNvbHVtbnNcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGxheWVyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB5ZXMgb3Igbm9cbiAgICovXG4gIGhhc0FsbENvbHVtbnMoKSB7XG4gICAgY29uc3Qge2NvbHVtbnN9ID0gdGhpcy5jb25maWc7XG4gICAgcmV0dXJuIChcbiAgICAgIGNvbHVtbnMgJiZcbiAgICAgIE9iamVjdC52YWx1ZXMoY29sdW1ucykuZXZlcnkodiA9PiB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKHYub3B0aW9uYWwgfHwgKHYudmFsdWUgJiYgdi5maWVsZElkeCA+IC0xKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBsYXllciBoYXMgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gbGF5ZXJcbiAgICogQHBhcmFtIHtBcnJheSB8IE9iamVjdH0gbGF5ZXJEYXRhXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB5ZXMgb3Igbm9cbiAgICovXG4gIGhhc0xheWVyRGF0YShsYXllckRhdGEpIHtcbiAgICBpZiAoIWxheWVyRGF0YSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBCb29sZWFuKGxheWVyRGF0YS5kYXRhICYmIGxheWVyRGF0YS5kYXRhLmxlbmd0aCk7XG4gIH1cblxuICBpc1ZhbGlkVG9TYXZlKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGUgJiYgdGhpcy5oYXNBbGxDb2x1bW5zKCk7XG4gIH1cblxuICBzaG91bGRSZW5kZXJMYXllcihkYXRhKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMudHlwZSAmJlxuICAgICAgdGhpcy5jb25maWcuaXNWaXNpYmxlICYmXG4gICAgICB0aGlzLmhhc0FsbENvbHVtbnMoKSAmJlxuICAgICAgdGhpcy5oYXNMYXllckRhdGEoZGF0YSkgJiZcbiAgICAgIHR5cGVvZiB0aGlzLnJlbmRlckxheWVyID09PSAnZnVuY3Rpb24nXG4gICAgKTtcbiAgfVxuXG4gIGdldFZpc0NoYW5uZWxTY2FsZShzY2FsZSwgZG9tYWluLCByYW5nZSwgZml4ZWQpIHtcbiAgICByZXR1cm4gU0NBTEVfRlVOQ1tmaXhlZCA/ICdsaW5lYXInIDogc2NhbGVdKClcbiAgICAgIC5kb21haW4oZG9tYWluKVxuICAgICAgLnJhbmdlKGZpeGVkID8gZG9tYWluIDogcmFuZ2UpO1xuICB9XG5cbiAgZ2V0UG9pbnRzQm91bmRzKGFsbERhdGEsIGdldFBvc2l0aW9uID0gaWRlbnRpdHkpIHtcbiAgICAvLyBubyBuZWVkIHRvIGxvb3AgdGhyb3VnaCB0aGUgZW50aXJlIGRhdGFzZXRcbiAgICAvLyBnZXQgYSBzYW1wbGUgb2YgZGF0YSB0byBjYWxjdWxhdGUgYm91bmRzXG4gICAgY29uc3Qgc2FtcGxlRGF0YSA9XG4gICAgICBhbGxEYXRhLmxlbmd0aCA+IE1BWF9TQU1QTEVfU0laRSA/IGdldFNhbXBsZURhdGEoYWxsRGF0YSwgTUFYX1NBTVBMRV9TSVpFKSA6IGFsbERhdGE7XG4gICAgY29uc3QgcG9pbnRzID0gc2FtcGxlRGF0YS5tYXAoZ2V0UG9zaXRpb24pO1xuXG4gICAgY29uc3QgbGF0Qm91bmRzID0gZ2V0TGF0TG5nQm91bmRzKHBvaW50cywgMSwgWy05MCwgOTBdKTtcbiAgICBjb25zdCBsbmdCb3VuZHMgPSBnZXRMYXRMbmdCb3VuZHMocG9pbnRzLCAwLCBbLTE4MCwgMTgwXSk7XG5cbiAgICBpZiAoIWxhdEJvdW5kcyB8fCAhbG5nQm91bmRzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gW2xuZ0JvdW5kc1swXSwgbGF0Qm91bmRzWzBdLCBsbmdCb3VuZHNbMV0sIGxhdEJvdW5kc1sxXV07XG4gIH1cblxuICBnZXRDaGFuZ2VkVHJpZ2dlcnMoZGF0YVVwZGF0ZVRyaWdnZXJzKSB7XG4gICAgY29uc3QgdHJpZ2dlckNoYW5nZWQgPSBkaWZmVXBkYXRlVHJpZ2dlcnMoZGF0YVVwZGF0ZVRyaWdnZXJzLCB0aGlzLl9vbGREYXRhVXBkYXRlVHJpZ2dlcnMpO1xuICAgIHRoaXMuX29sZERhdGFVcGRhdGVUcmlnZ2VycyA9IGRhdGFVcGRhdGVUcmlnZ2VycztcblxuICAgIHJldHVybiB0cmlnZ2VyQ2hhbmdlZDtcbiAgfVxuXG4gIGdldEVuY29kZWRDaGFubmVsVmFsdWUoXG4gICAgc2NhbGUsXG4gICAgZGF0YSxcbiAgICBmaWVsZCxcbiAgICBudWxsVmFsdWUgPSBOT19WQUxVRV9DT0xPUixcbiAgICBnZXRWYWx1ZSA9IGRlZmF1bHRHZXRGaWVsZFZhbHVlXG4gICkge1xuICAgIGNvbnN0IHt0eXBlfSA9IGZpZWxkO1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0VmFsdWUoZmllbGQsIGRhdGEpO1xuXG4gICAgaWYgKCFub3ROdWxsb3JVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gbnVsbFZhbHVlO1xuICAgIH1cblxuICAgIGxldCBhdHRyaWJ1dGVWYWx1ZTtcbiAgICBpZiAodHlwZSA9PT0gQUxMX0ZJRUxEX1RZUEVTLnRpbWVzdGFtcCkge1xuICAgICAgLy8gc2hvdWxkbid0IG5lZWQgdG8gY29udmVydCBoZXJlXG4gICAgICAvLyBzY2FsZSBGdW5jdGlvbiBzaG91bGQgdGFrZSBjYXJlIG9mIGl0XG4gICAgICBhdHRyaWJ1dGVWYWx1ZSA9IHNjYWxlKG5ldyBEYXRlKHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0dHJpYnV0ZVZhbHVlID0gc2NhbGUodmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghbm90TnVsbG9yVW5kZWZpbmVkKGF0dHJpYnV0ZVZhbHVlKSkge1xuICAgICAgYXR0cmlidXRlVmFsdWUgPSBudWxsVmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJpYnV0ZVZhbHVlO1xuICB9XG5cbiAgdXBkYXRlTWV0YShtZXRhKSB7XG4gICAgdGhpcy5tZXRhID0gey4uLnRoaXMubWV0YSwgLi4ubWV0YX07XG4gIH1cblxuICBnZXREYXRhVXBkYXRlVHJpZ2dlcnMoe2ZpbHRlcmVkSW5kZXgsIGlkfSkge1xuICAgIGNvbnN0IHtjb2x1bW5zfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldERhdGE6IHtkYXRhc2V0SWQ6IGlkLCBjb2x1bW5zLCBmaWx0ZXJlZEluZGV4fSxcbiAgICAgIGdldE1ldGE6IHtkYXRhc2V0SWQ6IGlkLCBjb2x1bW5zfSxcbiAgICAgIC4uLih0aGlzLmNvbmZpZy50ZXh0TGFiZWwgfHwgW10pLnJlZHVjZShcbiAgICAgICAgKGFjY3UsIHRsLCBpKSA9PiAoe1xuICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgW2BnZXRMYWJlbENoYXJhY3RlclNldC0ke2l9YF06IHRsLmZpZWxkID8gdGwuZmllbGQubmFtZSA6IG51bGxcbiAgICAgICAgfSksXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZURhdGEoZGF0YXNldHMsIG9sZExheWVyRGF0YSkge1xuICAgIGNvbnN0IGxheWVyRGF0YXNldCA9IGRhdGFzZXRzW3RoaXMuY29uZmlnLmRhdGFJZF07XG4gICAgY29uc3Qge2FsbERhdGF9ID0gZGF0YXNldHNbdGhpcy5jb25maWcuZGF0YUlkXTtcblxuICAgIGNvbnN0IGdldFBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkFjY2Vzc29yKCk7XG4gICAgY29uc3QgZGF0YVVwZGF0ZVRyaWdnZXJzID0gdGhpcy5nZXREYXRhVXBkYXRlVHJpZ2dlcnMobGF5ZXJEYXRhc2V0KTtcbiAgICBjb25zdCB0cmlnZ2VyQ2hhbmdlZCA9IHRoaXMuZ2V0Q2hhbmdlZFRyaWdnZXJzKGRhdGFVcGRhdGVUcmlnZ2Vycyk7XG5cbiAgICBpZiAodHJpZ2dlckNoYW5nZWQuZ2V0TWV0YSkge1xuICAgICAgdGhpcy51cGRhdGVMYXllck1ldGEoYWxsRGF0YSwgZ2V0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIGxldCBkYXRhID0gW107XG4gICAgaWYgKCF0cmlnZ2VyQ2hhbmdlZC5nZXREYXRhKSB7XG4gICAgICAvLyBzYW1lIGRhdGFcbiAgICAgIGRhdGEgPSBvbGRMYXllckRhdGEuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IHRoaXMuY2FsY3VsYXRlRGF0YUF0dHJpYnV0ZShsYXllckRhdGFzZXQsIGdldFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2RhdGEsIHRyaWdnZXJDaGFuZ2VkfTtcbiAgfVxuICAvKipcbiAgICogaGVscGVyIGZ1bmN0aW9uIHRvIHVwZGF0ZSBvbmUgbGF5ZXIgZG9tYWluIHdoZW4gc3RhdGUuZGF0YSBjaGFuZ2VkXG4gICAqIGlmIHN0YXRlLmRhdGEgY2hhbmdlIGlzIGR1ZSBvdCB1cGRhdGUgZmlsdGVyLCBuZXdGaWxlciB3aWxsIGJlIHBhc3NlZFxuICAgKiBjYWxsZWQgYnkgdXBkYXRlQWxsTGF5ZXJEb21haW5EYXRhXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhc2V0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBuZXdGaWx0ZXJcbiAgICogQHJldHVybnMge29iamVjdH0gbGF5ZXJcbiAgICovXG4gIHVwZGF0ZUxheWVyRG9tYWluKGRhdGFzZXRzLCBuZXdGaWx0ZXIpIHtcbiAgICBjb25zdCBkYXRhc2V0ID0gdGhpcy5nZXREYXRhc2V0KGRhdGFzZXRzKTtcbiAgICBpZiAoIWRhdGFzZXQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBPYmplY3QudmFsdWVzKHRoaXMudmlzdWFsQ2hhbm5lbHMpLmZvckVhY2goY2hhbm5lbCA9PiB7XG4gICAgICBjb25zdCB7c2NhbGV9ID0gY2hhbm5lbDtcbiAgICAgIGNvbnN0IHNjYWxlVHlwZSA9IHRoaXMuY29uZmlnW3NjYWxlXTtcbiAgICAgIC8vIG9yZGluYWwgZG9tYWluIGlzIGJhc2VkIG9uIGFsbERhdGEsIGlmIG9ubHkgZmlsdGVyIGNoYW5nZWRcbiAgICAgIC8vIG5vIG5lZWQgdG8gdXBkYXRlIG9yZGluYWwgZG9tYWluXG4gICAgICBpZiAoIW5ld0ZpbHRlciB8fCBzY2FsZVR5cGUgIT09IFNDQUxFX1RZUEVTLm9yZGluYWwpIHtcbiAgICAgICAgY29uc3Qge2RvbWFpbn0gPSBjaGFubmVsO1xuICAgICAgICBjb25zdCB1cGRhdGVkRG9tYWluID0gdGhpcy5jYWxjdWxhdGVMYXllckRvbWFpbihkYXRhc2V0LCBjaGFubmVsKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKHtbZG9tYWluXTogdXBkYXRlZERvbWFpbn0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXREYXRhc2V0KGRhdGFzZXRzKSB7XG4gICAgcmV0dXJuIGRhdGFzZXRzW3RoaXMuY29uZmlnLmRhdGFJZF07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdmlzdWFsIGNoYW5uZWwgZmllbGQgYW5kIHNjYWxlcyBiYXNlZCBvbiBzdXBwb3J0ZWQgZmllbGQgJiBzY2FsZSB0eXBlXG4gICAqIEBwYXJhbSBjaGFubmVsXG4gICAqL1xuICB2YWxpZGF0ZVZpc3VhbENoYW5uZWwoY2hhbm5lbCkge1xuICAgIHRoaXMudmFsaWRhdGVGaWVsZFR5cGUoY2hhbm5lbCk7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKGNoYW5uZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGZpZWxkIHR5cGUgYmFzZWQgb24gY2hhbm5lbFNjYWxlVHlwZVxuICAgKi9cbiAgdmFsaWRhdGVGaWVsZFR5cGUoY2hhbm5lbCkge1xuICAgIGNvbnN0IHZpc3VhbENoYW5uZWwgPSB0aGlzLnZpc3VhbENoYW5uZWxzW2NoYW5uZWxdO1xuICAgIGNvbnN0IHtmaWVsZCwgY2hhbm5lbFNjYWxlVHlwZSwgc3VwcG9ydGVkRmllbGRUeXBlc30gPSB2aXN1YWxDaGFubmVsO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnW2ZpZWxkXSkge1xuICAgICAgLy8gaWYgZmllbGQgaXMgc2VsZWN0ZWQsIGNoZWNrIGlmIGZpZWxkIHR5cGUgaXMgc3VwcG9ydGVkXG4gICAgICBjb25zdCBjaGFubmVsU3VwcG9ydGVkRmllbGRUeXBlcyA9XG4gICAgICAgIHN1cHBvcnRlZEZpZWxkVHlwZXMgfHwgQ0hBTk5FTF9TQ0FMRV9TVVBQT1JURURfRklFTERTW2NoYW5uZWxTY2FsZVR5cGVdO1xuXG4gICAgICBpZiAoIWNoYW5uZWxTdXBwb3J0ZWRGaWVsZFR5cGVzLmluY2x1ZGVzKHRoaXMuY29uZmlnW2ZpZWxkXS50eXBlKSkge1xuICAgICAgICAvLyBmaWVsZCB0eXBlIGlzIG5vdCBzdXBwb3J0ZWQsIHNldCBpdCBiYWNrIHRvIG51bGxcbiAgICAgICAgLy8gc2V0IHNjYWxlIGJhY2sgdG8gZGVmYXVsdFxuICAgICAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKHtbZmllbGRdOiBudWxsfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHNjYWxlIHR5cGUgYmFzZWQgb24gYWdncmVnYXRpb25cbiAgICovXG4gIHZhbGlkYXRlU2NhbGUoY2hhbm5lbCkge1xuICAgIGNvbnN0IHZpc3VhbENoYW5uZWwgPSB0aGlzLnZpc3VhbENoYW5uZWxzW2NoYW5uZWxdO1xuICAgIGNvbnN0IHtzY2FsZX0gPSB2aXN1YWxDaGFubmVsO1xuICAgIGlmICghc2NhbGUpIHtcbiAgICAgIC8vIHZpc3VhbENoYW5uZWwgZG9lc24ndCBoYXZlIHNjYWxlXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNjYWxlT3B0aW9ucyA9IHRoaXMuZ2V0U2NhbGVPcHRpb25zKGNoYW5uZWwpO1xuICAgIC8vIGNoZWNrIGlmIGN1cnJlbnQgc2VsZWN0ZWQgc2NhbGUgaXNcbiAgICAvLyBzdXBwb3J0ZWQsIGlmIG5vdCwgY2hhbmdlIHRvIGRlZmF1bHRcbiAgICBpZiAoIXNjYWxlT3B0aW9ucy5pbmNsdWRlcyh0aGlzLmNvbmZpZ1tzY2FsZV0pKSB7XG4gICAgICB0aGlzLnVwZGF0ZUxheWVyQ29uZmlnKHtbc2NhbGVdOiBzY2FsZU9wdGlvbnNbMF19KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNjYWxlIG9wdGlvbnMgYmFzZWQgb24gY3VycmVudCBmaWVsZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbm5lbFxuICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAqL1xuICBnZXRTY2FsZU9wdGlvbnMoY2hhbm5lbCkge1xuICAgIGNvbnN0IHZpc3VhbENoYW5uZWwgPSB0aGlzLnZpc3VhbENoYW5uZWxzW2NoYW5uZWxdO1xuICAgIGNvbnN0IHtmaWVsZCwgc2NhbGUsIGNoYW5uZWxTY2FsZVR5cGV9ID0gdmlzdWFsQ2hhbm5lbDtcblxuICAgIHJldHVybiB0aGlzLmNvbmZpZ1tmaWVsZF1cbiAgICAgID8gRklFTERfT1BUU1t0aGlzLmNvbmZpZ1tmaWVsZF0udHlwZV0uc2NhbGVbY2hhbm5lbFNjYWxlVHlwZV1cbiAgICAgIDogW3RoaXMuZ2V0RGVmYXVsdExheWVyQ29uZmlnKClbc2NhbGVdXTtcbiAgfVxuXG4gIHVwZGF0ZUxheWVyVmlzdWFsQ2hhbm5lbChkYXRhc2V0LCBjaGFubmVsKSB7XG4gICAgY29uc3QgdmlzdWFsQ2hhbm5lbCA9IHRoaXMudmlzdWFsQ2hhbm5lbHNbY2hhbm5lbF07XG4gICAgdGhpcy52YWxpZGF0ZVZpc3VhbENoYW5uZWwoY2hhbm5lbCk7XG4gICAgLy8gY2FsY3VsYXRlIGxheWVyIGNoYW5uZWwgZG9tYWluXG4gICAgY29uc3QgdXBkYXRlZERvbWFpbiA9IHRoaXMuY2FsY3VsYXRlTGF5ZXJEb21haW4oZGF0YXNldCwgdmlzdWFsQ2hhbm5lbCk7XG4gICAgdGhpcy51cGRhdGVMYXllckNvbmZpZyh7W3Zpc3VhbENoYW5uZWwuZG9tYWluXTogdXBkYXRlZERvbWFpbn0pO1xuICB9XG5cbiAgY2FsY3VsYXRlTGF5ZXJEb21haW4oZGF0YXNldCwgdmlzdWFsQ2hhbm5lbCkge1xuICAgIGNvbnN0IHthbGxEYXRhLCBmaWx0ZXJlZEluZGV4Rm9yRG9tYWlufSA9IGRhdGFzZXQ7XG4gICAgY29uc3QgZGVmYXVsdERvbWFpbiA9IFswLCAxXTtcbiAgICBjb25zdCB7c2NhbGV9ID0gdmlzdWFsQ2hhbm5lbDtcbiAgICBjb25zdCBzY2FsZVR5cGUgPSB0aGlzLmNvbmZpZ1tzY2FsZV07XG5cbiAgICBjb25zdCBmaWVsZCA9IHRoaXMuY29uZmlnW3Zpc3VhbENoYW5uZWwuZmllbGRdO1xuICAgIGlmICghZmllbGQpIHtcbiAgICAgIC8vIGlmIGNvbG9yRmllbGQgb3Igc2l6ZUZpZWxkIHdlcmUgc2V0IGJhY2sgdG8gbnVsbFxuICAgICAgcmV0dXJuIGRlZmF1bHREb21haW47XG4gICAgfVxuXG4gICAgaWYgKCFTQ0FMRV9UWVBFU1tzY2FsZVR5cGVdKSB7XG4gICAgICBDb25zb2xlLmVycm9yKGBzY2FsZSB0eXBlICR7c2NhbGVUeXBlfSBub3Qgc3VwcG9ydGVkYCk7XG4gICAgICByZXR1cm4gZGVmYXVsdERvbWFpbjtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZWZhY3RvciB0byBhZGQgdmFsdWVBY2Nlc3NvciB0byBmaWVsZFxuICAgIGNvbnN0IGZpZWxkSWR4ID0gZmllbGQudGFibGVGaWVsZEluZGV4IC0gMTtcbiAgICBjb25zdCBpc1RpbWUgPSBmaWVsZC50eXBlID09PSBBTExfRklFTERfVFlQRVMudGltZXN0YW1wO1xuICAgIGNvbnN0IHZhbHVlQWNjZXNzb3IgPSBtYXliZVRvRGF0ZS5iaW5kKG51bGwsIGlzVGltZSwgZmllbGRJZHgsIGZpZWxkLmZvcm1hdCk7XG4gICAgY29uc3QgaW5kZXhWYWx1ZUFjY2Vzc29yID0gaSA9PiB2YWx1ZUFjY2Vzc29yKGFsbERhdGFbaV0pO1xuXG4gICAgY29uc3Qgc29ydEZ1bmN0aW9uID0gZ2V0U29ydGluZ0Z1bmN0aW9uKGZpZWxkLnR5cGUpO1xuXG4gICAgc3dpdGNoIChzY2FsZVR5cGUpIHtcbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMub3JkaW5hbDpcbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMucG9pbnQ6XG4gICAgICAgIC8vIGRvIG5vdCByZWNhbGN1bGF0ZSBvcmRpbmFsIGRvbWFpbiBiYXNlZCBvbiBmaWx0ZXJlZCBkYXRhXG4gICAgICAgIC8vIGRvbid0IG5lZWQgdG8gdXBkYXRlIG9yZGluYWwgZG9tYWluIGV2ZXJ5IHRpbWVcbiAgICAgICAgcmV0dXJuIGdldE9yZGluYWxEb21haW4oYWxsRGF0YSwgdmFsdWVBY2Nlc3Nvcik7XG5cbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMucXVhbnRpbGU6XG4gICAgICAgIHJldHVybiBnZXRRdWFudGlsZURvbWFpbihmaWx0ZXJlZEluZGV4Rm9yRG9tYWluLCBpbmRleFZhbHVlQWNjZXNzb3IsIHNvcnRGdW5jdGlvbik7XG5cbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMubG9nOlxuICAgICAgICByZXR1cm4gZ2V0TG9nRG9tYWluKGZpbHRlcmVkSW5kZXhGb3JEb21haW4sIGluZGV4VmFsdWVBY2Nlc3Nvcik7XG5cbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMucXVhbnRpemU6XG4gICAgICBjYXNlIFNDQUxFX1RZUEVTLmxpbmVhcjpcbiAgICAgIGNhc2UgU0NBTEVfVFlQRVMuc3FydDpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBnZXRMaW5lYXJEb21haW4oZmlsdGVyZWRJbmRleEZvckRvbWFpbiwgaW5kZXhWYWx1ZUFjY2Vzc29yKTtcbiAgICB9XG4gIH1cblxuICBpc0xheWVySG92ZXJlZChvYmplY3RJbmZvKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG9iamVjdEluZm8gJiYgb2JqZWN0SW5mby5sYXllciAmJiBvYmplY3RJbmZvLnBpY2tlZCAmJiBvYmplY3RJbmZvLmxheWVyLnByb3BzLmlkID09PSB0aGlzLmlkXG4gICAgKTtcbiAgfVxuXG4gIGdldFJhZGl1c1NjYWxlQnlab29tKG1hcFN0YXRlLCBmaXhlZFJhZGl1cykge1xuICAgIGNvbnN0IHJhZGl1c0NoYW5uZWwgPSBPYmplY3QudmFsdWVzKHRoaXMudmlzdWFsQ2hhbm5lbHMpLmZpbmQodmMgPT4gdmMucHJvcGVydHkgPT09ICdyYWRpdXMnKTtcblxuICAgIGlmICghcmFkaXVzQ2hhbm5lbCkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZmllbGQgPSByYWRpdXNDaGFubmVsLmZpZWxkO1xuICAgIGNvbnN0IGZpeGVkID0gZml4ZWRSYWRpdXMgPT09IHVuZGVmaW5lZCA/IHRoaXMuY29uZmlnLnZpc0NvbmZpZy5maXhlZFJhZGl1cyA6IGZpeGVkUmFkaXVzO1xuICAgIGNvbnN0IHtyYWRpdXN9ID0gdGhpcy5jb25maWcudmlzQ29uZmlnO1xuXG4gICAgcmV0dXJuIGZpeGVkID8gMSA6ICh0aGlzLmNvbmZpZ1tmaWVsZF0gPyAxIDogcmFkaXVzKSAqIHRoaXMuZ2V0Wm9vbUZhY3RvcihtYXBTdGF0ZSk7XG4gIH1cblxuICBzaG91bGRDYWxjdWxhdGVMYXllckRhdGEocHJvcHMpIHtcbiAgICByZXR1cm4gcHJvcHMuc29tZShwID0+ICF0aGlzLm5vbmVMYXllckRhdGFBZmZlY3RpbmdQcm9wcy5pbmNsdWRlcyhwKSk7XG4gIH1cblxuICBnZXRCcnVzaGluZ0V4dGVuc2lvblByb3BzKGludGVyYWN0aW9uQ29uZmlnLCBicnVzaGluZ1RhcmdldCkge1xuICAgIGNvbnN0IHticnVzaH0gPSBpbnRlcmFjdGlvbkNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICAvLyBicnVzaGluZ1xuICAgICAgYXV0b0hpZ2hsaWdodDogIWJydXNoLmVuYWJsZWQsXG4gICAgICBicnVzaGluZ1JhZGl1czogYnJ1c2guY29uZmlnLnNpemUgKiAxMDAwLFxuICAgICAgYnJ1c2hpbmdUYXJnZXQ6IGJydXNoaW5nVGFyZ2V0IHx8ICdzb3VyY2UnLFxuICAgICAgYnJ1c2hpbmdFbmFibGVkOiBicnVzaC5lbmFibGVkXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHREZWNrTGF5ZXJQcm9wcyh7aWR4LCBncHVGaWx0ZXIsIG1hcFN0YXRlfSkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGlkeCxcbiAgICAgIGNvb3JkaW5hdGVTeXN0ZW06IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCxcbiAgICAgIHBpY2thYmxlOiB0cnVlLFxuICAgICAgd3JhcExvbmdpdHVkZTogdHJ1ZSxcbiAgICAgIHBhcmFtZXRlcnM6IHtkZXB0aFRlc3Q6IEJvb2xlYW4obWFwU3RhdGUuZHJhZ1JvdGF0ZSB8fCB0aGlzLmNvbmZpZy52aXNDb25maWcuZW5hYmxlM2QpfSxcbiAgICAgIGhpZGRlbjogdGhpcy5jb25maWcuaGlkZGVuLFxuICAgICAgLy8gdmlzY29uZmlnXG4gICAgICBvcGFjaXR5OiB0aGlzLmNvbmZpZy52aXNDb25maWcub3BhY2l0eSxcbiAgICAgIGhpZ2hsaWdodENvbG9yOiB0aGlzLmNvbmZpZy5oaWdobGlnaHRDb2xvcixcbiAgICAgIC8vIGRhdGEgZmlsdGVyaW5nXG4gICAgICBleHRlbnNpb25zOiBbZGF0YUZpbHRlckV4dGVuc2lvbl0sXG4gICAgICBmaWx0ZXJSYW5nZTogZ3B1RmlsdGVyLmZpbHRlclJhbmdlXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHRIb3ZlckxheWVyUHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBgJHt0aGlzLmlkfS1ob3ZlcmVkYCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcbiAgICAgIHdyYXBMb25naXR1ZGU6IHRydWUsXG4gICAgICBjb29yZGluYXRlU3lzdGVtOiBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVRcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyVGV4dExhYmVsTGF5ZXIoe2dldFBvc2l0aW9uLCBnZXRQaXhlbE9mZnNldCwgdXBkYXRlVHJpZ2dlcnMsIHNoYXJlZFByb3BzfSwgcmVuZGVyT3B0cykge1xuICAgIGNvbnN0IHtkYXRhLCBtYXBTdGF0ZX0gPSByZW5kZXJPcHRzO1xuICAgIGNvbnN0IHt0ZXh0TGFiZWx9ID0gdGhpcy5jb25maWc7XG5cbiAgICByZXR1cm4gZGF0YS50ZXh0TGFiZWxzLnJlZHVjZSgoYWNjdSwgZCwgaSkgPT4ge1xuICAgICAgaWYgKGQuZ2V0VGV4dCkge1xuICAgICAgICBhY2N1LnB1c2goXG4gICAgICAgICAgbmV3IFRleHRMYXllcih7XG4gICAgICAgICAgICAuLi5zaGFyZWRQcm9wcyxcbiAgICAgICAgICAgIGlkOiBgJHt0aGlzLmlkfS1sYWJlbC0ke3RleHRMYWJlbFtpXS5maWVsZC5uYW1lfWAsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXG4gICAgICAgICAgICBnZXRUZXh0OiBkLmdldFRleHQsXG4gICAgICAgICAgICBnZXRQb3NpdGlvbixcbiAgICAgICAgICAgIGNoYXJhY3RlclNldDogZC5jaGFyYWN0ZXJTZXQsXG4gICAgICAgICAgICBnZXRQaXhlbE9mZnNldDogZ2V0UGl4ZWxPZmZzZXQodGV4dExhYmVsW2ldKSxcbiAgICAgICAgICAgIGdldFNpemU6IDEsXG4gICAgICAgICAgICBzaXplU2NhbGU6IHRleHRMYWJlbFtpXS5zaXplLFxuICAgICAgICAgICAgZ2V0VGV4dEFuY2hvcjogdGV4dExhYmVsW2ldLmFuY2hvcixcbiAgICAgICAgICAgIGdldEFsaWdubWVudEJhc2VsaW5lOiB0ZXh0TGFiZWxbaV0uYWxpZ25tZW50LFxuICAgICAgICAgICAgZ2V0Q29sb3I6IHRleHRMYWJlbFtpXS5jb2xvcixcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgLy8gdGV4dCB3aWxsIGFsd2F5cyBzaG93IG9uIHRvcCBvZiBhbGwgbGF5ZXJzXG4gICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldEZpbHRlclZhbHVlOiBkYXRhLmdldEZpbHRlclZhbHVlLFxuICAgICAgICAgICAgdXBkYXRlVHJpZ2dlcnM6IHtcbiAgICAgICAgICAgICAgLi4udXBkYXRlVHJpZ2dlcnMsXG4gICAgICAgICAgICAgIGdldFRleHQ6IHRleHRMYWJlbFtpXS5maWVsZC5uYW1lLFxuICAgICAgICAgICAgICBnZXRQaXhlbE9mZnNldDoge1xuICAgICAgICAgICAgICAgIC4uLnVwZGF0ZVRyaWdnZXJzLmdldFJhZGl1cyxcbiAgICAgICAgICAgICAgICBtYXBTdGF0ZSxcbiAgICAgICAgICAgICAgICBhbmNob3I6IHRleHRMYWJlbFtpXS5hbmNob3IsXG4gICAgICAgICAgICAgICAgYWxpZ25tZW50OiB0ZXh0TGFiZWxbaV0uYWxpZ25tZW50XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGdldFRleHRBbmNob3I6IHRleHRMYWJlbFtpXS5hbmNob3IsXG4gICAgICAgICAgICAgIGdldEFsaWdubWVudEJhc2VsaW5lOiB0ZXh0TGFiZWxbaV0uYWxpZ25tZW50LFxuICAgICAgICAgICAgICBnZXRDb2xvcjogdGV4dExhYmVsW2ldLmNvbG9yXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2N1O1xuICAgIH0sIFtdKTtcbiAgfVxufVxuIl19