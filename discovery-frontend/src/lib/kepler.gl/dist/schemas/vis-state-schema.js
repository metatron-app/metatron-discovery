"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.visStateSchema = exports.visStateSchemaV1 = exports.visStateSchemaV0 = exports.propertiesV1 = exports.propertiesV0 = exports.filterPropsV1 = exports.SplitMapsSchema = exports.DimensionFieldSchema = exports.filterPropsV0 = exports.layerPropsV1 = exports.layerPropsV0 = exports.dimensionPropsV0 = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash.pick"));

var _versions = require("./versions");

var _filterUtils = require("../utils/filter-utils");

var _layerFactory = require("../layers/layer-factory");

var _schema = _interopRequireDefault(require("./schema"));

var _lodash2 = _interopRequireDefault(require("lodash.clonedeep"));

var _dataUtils = require("../utils/data-utils");

var _visStateSchema;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * V0 Schema
 */
var dimensionPropsV0 = ['name', 'type']; // in v0 geojson there is only sizeField
// in v1 geojson
// stroke base on -> sizeField
// height based on -> heightField
// radius based on -> radiusField
// here we make our wiredst guess on which channel sizeField belongs to

exports.dimensionPropsV0 = dimensionPropsV0;

function geojsonSizeFieldV0ToV1(config) {
  var defaultRaiuds = 10;
  var defaultRadiusRange = [0, 50]; // if extruded, sizeField is most likely used for height

  if (config.visConfig.extruded) {
    return 'heightField';
  } // if show stroke enabled, sizeField is most likely used for stroke


  if (config.visConfig.stroked) {
    return 'sizeField';
  } // if radius changed, or radius Range Changed, sizeField is most likely used for radius
  // this is the most unreliable guess, that's why we put it in the end


  if (config.visConfig.radius !== defaultRaiuds || config.visConfig.radiusRange.some(function (d, i) {
    return d !== defaultRadiusRange[i];
  })) {
    return 'radiusField';
  }

  return 'sizeField';
} // convert v0 to v1 layer config


var DimensionFieldSchemaV0 = /*#__PURE__*/function (_Schema) {
  (0, _inherits2["default"])(DimensionFieldSchemaV0, _Schema);

  var _super = _createSuper(DimensionFieldSchemaV0);

  function DimensionFieldSchemaV0() {
    var _this;

    (0, _classCallCheck2["default"])(this, DimensionFieldSchemaV0);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "version", _versions.VERSIONS.v0);
    return _this;
  }

  (0, _createClass2["default"])(DimensionFieldSchemaV0, [{
    key: "save",
    value: function save(field) {
      // should not be called anymore
      return (0, _defineProperty2["default"])({}, this.key, field !== null ? this.savePropertiesOrApplySchema(field)[this.key] : null);
    }
  }, {
    key: "load",
    value: function load(field, parents, accumulated) {
      var _parents$slice = parents.slice(-1),
          _parents$slice2 = (0, _slicedToArray2["default"])(_parents$slice, 1),
          config = _parents$slice2[0];

      var fieldName = this.key;

      if (config.type === 'geojson' && this.key === 'sizeField' && field) {
        fieldName = geojsonSizeFieldV0ToV1(config);
      } // fold into visualChannels to be load by VisualChannelSchemaV1


      return {
        visualChannels: _objectSpread(_objectSpread({}, accumulated.visualChannels || {}), {}, (0, _defineProperty2["default"])({}, fieldName, field))
      };
    }
  }]);
  return DimensionFieldSchemaV0;
}(_schema["default"]);

var DimensionScaleSchemaV0 = /*#__PURE__*/function (_Schema2) {
  (0, _inherits2["default"])(DimensionScaleSchemaV0, _Schema2);

  var _super2 = _createSuper(DimensionScaleSchemaV0);

  function DimensionScaleSchemaV0() {
    var _this2;

    (0, _classCallCheck2["default"])(this, DimensionScaleSchemaV0);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this2 = _super2.call.apply(_super2, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this2), "version", _versions.VERSIONS.v0);
    return _this2;
  }

  (0, _createClass2["default"])(DimensionScaleSchemaV0, [{
    key: "save",
    value: function save(scale) {
      return (0, _defineProperty2["default"])({}, this.key, scale);
    }
  }, {
    key: "load",
    value: function load(scale, parents, accumulated) {
      var _parents$slice3 = parents.slice(-1),
          _parents$slice4 = (0, _slicedToArray2["default"])(_parents$slice3, 1),
          config = _parents$slice4[0]; // fold into visualChannels to be load by VisualChannelSchemaV1


      if (this.key === 'sizeScale' && config.type === 'geojson') {
        // sizeScale now split into radiusScale, heightScale
        // no user customization, just use default
        return {};
      }

      return {
        visualChannels: _objectSpread(_objectSpread({}, accumulated.visualChannels || {}), {}, (0, _defineProperty2["default"])({}, this.key, scale))
      };
    }
  }]);
  return DimensionScaleSchemaV0;
}(_schema["default"]); // used to convert v0 to v1 layer config


var LayerConfigSchemaV0 = /*#__PURE__*/function (_Schema3) {
  (0, _inherits2["default"])(LayerConfigSchemaV0, _Schema3);

  var _super3 = _createSuper(LayerConfigSchemaV0);

  function LayerConfigSchemaV0() {
    var _this3;

    (0, _classCallCheck2["default"])(this, LayerConfigSchemaV0);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this3 = _super3.call.apply(_super3, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this3), "version", _versions.VERSIONS.v0);
    return _this3;
  }

  (0, _createClass2["default"])(LayerConfigSchemaV0, [{
    key: "load",
    value: function load(saved, parents, accumulated) {
      // fold v0 layer property into config.key
      return {
        config: _objectSpread(_objectSpread({}, accumulated.config || {}), {}, (0, _defineProperty2["default"])({}, this.key, saved))
      };
    }
  }]);
  return LayerConfigSchemaV0;
}(_schema["default"]); // used to convert v0 to v1 layer columns
// only return column value for each column


var LayerColumnsSchemaV0 = /*#__PURE__*/function (_Schema4) {
  (0, _inherits2["default"])(LayerColumnsSchemaV0, _Schema4);

  var _super4 = _createSuper(LayerColumnsSchemaV0);

  function LayerColumnsSchemaV0() {
    var _this4;

    (0, _classCallCheck2["default"])(this, LayerColumnsSchemaV0);

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    _this4 = _super4.call.apply(_super4, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "version", _versions.VERSIONS.v0);
    return _this4;
  }

  (0, _createClass2["default"])(LayerColumnsSchemaV0, [{
    key: "load",
    value: function load(saved, parents, accumulated) {
      // fold v0 layer property into config.key, flatten columns
      return {
        config: _objectSpread(_objectSpread({}, accumulated.config || {}), {}, {
          columns: Object.keys(saved).reduce(function (accu, key) {
            return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, saved[key].value));
          }, {})
        })
      };
    }
  }]);
  return LayerColumnsSchemaV0;
}(_schema["default"]); // used to convert v0 to v1 layer config.visConfig


var LayerConfigToVisConfigSchemaV0 = /*#__PURE__*/function (_Schema5) {
  (0, _inherits2["default"])(LayerConfigToVisConfigSchemaV0, _Schema5);

  var _super5 = _createSuper(LayerConfigToVisConfigSchemaV0);

  function LayerConfigToVisConfigSchemaV0() {
    var _this5;

    (0, _classCallCheck2["default"])(this, LayerConfigToVisConfigSchemaV0);

    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    _this5 = _super5.call.apply(_super5, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "version", _versions.VERSIONS.v0);
    return _this5;
  }

  (0, _createClass2["default"])(LayerConfigToVisConfigSchemaV0, [{
    key: "load",
    value: function load(saved, parents, accumulated) {
      // fold v0 layer property into config.visConfig
      var accumulatedConfig = accumulated.config || {};
      return {
        config: _objectSpread(_objectSpread({}, accumulatedConfig), {}, {
          visConfig: _objectSpread(_objectSpread({}, accumulatedConfig.visConfig || {}), {}, (0, _defineProperty2["default"])({}, this.key, saved))
        })
      };
    }
  }]);
  return LayerConfigToVisConfigSchemaV0;
}(_schema["default"]);

var LayerVisConfigSchemaV0 = /*#__PURE__*/function (_Schema6) {
  (0, _inherits2["default"])(LayerVisConfigSchemaV0, _Schema6);

  var _super6 = _createSuper(LayerVisConfigSchemaV0);

  function LayerVisConfigSchemaV0() {
    var _this6;

    (0, _classCallCheck2["default"])(this, LayerVisConfigSchemaV0);

    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    _this6 = _super6.call.apply(_super6, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this6), "version", _versions.VERSIONS.v0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this6), "key", 'visConfig');
    return _this6;
  }

  (0, _createClass2["default"])(LayerVisConfigSchemaV0, [{
    key: "load",
    value: function load(visConfig, parents, accumulator) {
      var _parents$slice5 = parents.slice(-1),
          _parents$slice6 = (0, _slicedToArray2["default"])(_parents$slice5, 1),
          config = _parents$slice6[0];

      var rename = {
        geojson: {
          extruded: 'enable3d',
          elevationRange: 'heightRange'
        }
      };

      if (config.type in rename) {
        var propToRename = rename[config.type];
        return {
          config: _objectSpread(_objectSpread({}, accumulator.config || {}), {}, {
            visConfig: Object.keys(visConfig).reduce(function (accu, key) {
              return _objectSpread(_objectSpread({}, accu), propToRename[key] ? (0, _defineProperty2["default"])({}, propToRename[key], visConfig[key]) : (0, _defineProperty2["default"])({}, key, visConfig[key]));
            }, {})
          })
        };
      }

      return {
        config: _objectSpread(_objectSpread({}, accumulator.config || {}), {}, {
          visConfig: visConfig
        })
      };
    }
  }]);
  return LayerVisConfigSchemaV0;
}(_schema["default"]);

var LayerConfigSchemaDeleteV0 = /*#__PURE__*/function (_Schema7) {
  (0, _inherits2["default"])(LayerConfigSchemaDeleteV0, _Schema7);

  var _super7 = _createSuper(LayerConfigSchemaDeleteV0);

  function LayerConfigSchemaDeleteV0() {
    var _this7;

    (0, _classCallCheck2["default"])(this, LayerConfigSchemaDeleteV0);

    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    _this7 = _super7.call.apply(_super7, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this7), "version", _versions.VERSIONS.v0);
    return _this7;
  }

  (0, _createClass2["default"])(LayerConfigSchemaDeleteV0, [{
    key: "load",
    value: function load(value) {
      return {};
    }
  }]);
  return LayerConfigSchemaDeleteV0;
}(_schema["default"]);
/**
 * V0 -> V1 Changes
 * - layer is now a class
 * - config saved in a config object
 * - id, type, isAggregated is outside layer.config
 * - visualChannels is outside config, it defines available visual channel and
 *   property names for field, scale, domain and range of each visual chanel.
 * - enable3d, colorAggregation and sizeAggregation are moved into visConfig
 * - GeojsonLayer - added height, radius specific properties
 */


var layerPropsV0 = {
  id: null,
  type: null,
  // move into layer.config
  dataId: new LayerConfigSchemaV0({
    key: 'dataId'
  }),
  label: new LayerConfigSchemaV0({
    key: 'label'
  }),
  color: new LayerConfigSchemaV0({
    key: 'color'
  }),
  isVisible: new LayerConfigSchemaV0({
    key: 'isVisible'
  }),
  hidden: new LayerConfigSchemaV0({
    key: 'hidden'
  }),
  // convert visConfig
  visConfig: new LayerVisConfigSchemaV0({
    key: 'visConfig'
  }),
  // move into layer.config
  // flatten
  columns: new LayerColumnsSchemaV0(),
  // save into visualChannels
  colorField: new DimensionFieldSchemaV0({
    properties: dimensionPropsV0,
    key: 'colorField'
  }),
  colorScale: new DimensionScaleSchemaV0({
    key: 'colorScale'
  }),
  sizeField: new DimensionFieldSchemaV0({
    properties: dimensionPropsV0,
    key: 'sizeField'
  }),
  sizeScale: new DimensionScaleSchemaV0({
    key: 'sizeScale'
  }),
  // move into config.visConfig
  enable3d: new LayerConfigToVisConfigSchemaV0({
    key: 'enable3d'
  }),
  colorAggregation: new LayerConfigToVisConfigSchemaV0({
    key: 'colorAggregation'
  }),
  sizeAggregation: new LayerConfigToVisConfigSchemaV0({
    key: 'sizeAggregation'
  }),
  // delete
  isAggregated: new LayerConfigSchemaDeleteV0()
};
/**
 * V1 Schema
 */

exports.layerPropsV0 = layerPropsV0;

var ColumnSchemaV1 = /*#__PURE__*/function (_Schema8) {
  (0, _inherits2["default"])(ColumnSchemaV1, _Schema8);

  var _super8 = _createSuper(ColumnSchemaV1);

  function ColumnSchemaV1() {
    (0, _classCallCheck2["default"])(this, ColumnSchemaV1);
    return _super8.apply(this, arguments);
  }

  (0, _createClass2["default"])(ColumnSchemaV1, [{
    key: "save",
    value: function save(columns, state) {
      // starting from v1, only save column value
      // fieldIdx will be calculated during merge
      return (0, _defineProperty2["default"])({}, this.key, Object.keys(columns).reduce(function (accu, ckey) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, ckey, columns[ckey].value));
      }, {}));
    }
  }, {
    key: "load",
    value: function load(columns) {
      return {
        columns: columns
      };
    }
  }]);
  return ColumnSchemaV1;
}(_schema["default"]);

var TextLabelSchemaV1 = /*#__PURE__*/function (_Schema9) {
  (0, _inherits2["default"])(TextLabelSchemaV1, _Schema9);

  var _super9 = _createSuper(TextLabelSchemaV1);

  function TextLabelSchemaV1() {
    (0, _classCallCheck2["default"])(this, TextLabelSchemaV1);
    return _super9.apply(this, arguments);
  }

  (0, _createClass2["default"])(TextLabelSchemaV1, [{
    key: "save",
    value: function save(textLabel) {
      return (0, _defineProperty2["default"])({}, this.key, textLabel.map(function (tl) {
        return _objectSpread(_objectSpread({}, tl), {}, {
          field: tl.field ? (0, _lodash["default"])(tl.field, ['name', 'type']) : null
        });
      }));
    }
  }, {
    key: "load",
    value: function load(textLabel) {
      return {
        textLabel: Array.isArray(textLabel) ? textLabel : [textLabel]
      };
    }
  }]);
  return TextLabelSchemaV1;
}(_schema["default"]);

var visualChannelModificationV1 = {
  point: function point(vc, parents, accumulator) {
    var _parents$slice7 = parents.slice(-1),
        _parents$slice8 = (0, _slicedToArray2["default"])(_parents$slice7, 1),
        layer = _parents$slice8[0];

    if (layer.config.visConfig.outline && vc.colorField && !vc.hasOwnProperty('strokeColorField')) {
      // point layer now supports both outline and fill
      // for older schema where filled has not been added to point layer
      // copy colorField, colorScale to strokeColorField, and strokeColorScale
      return {
        strokeColorField: vc.colorField,
        strokeColorScale: vc.colorScale,
        colorField: null,
        colorScale: 'quantile'
      };
    }

    return {};
  },
  geojson: function geojson(vc, parents, accumulator) {
    var _parents$slice9 = parents.slice(-1),
        _parents$slice10 = (0, _slicedToArray2["default"])(_parents$slice9, 1),
        layer = _parents$slice10[0];

    var isOld = !vc.hasOwnProperty('strokeColorField'); // make our best guess if this geojson layer contains point

    var isPoint = vc.radiusField || layer.config.visConfig.radius !== _layerFactory.LAYER_VIS_CONFIGS.radius.defaultValue;

    if (isOld && !isPoint && layer.config.visConfig.stroked) {
      // if stroked is true, copy color config to stroke color config
      return {
        strokeColorField: vc.colorField,
        strokeColorScale: vc.colorScale
      };
    }

    return {};
  }
};
/**
 * V1: save [field]: {name, type}, [scale]: '' for each channel
 */

var VisualChannelSchemaV1 = /*#__PURE__*/function (_Schema10) {
  (0, _inherits2["default"])(VisualChannelSchemaV1, _Schema10);

  var _super10 = _createSuper(VisualChannelSchemaV1);

  function VisualChannelSchemaV1() {
    (0, _classCallCheck2["default"])(this, VisualChannelSchemaV1);
    return _super10.apply(this, arguments);
  }

  (0, _createClass2["default"])(VisualChannelSchemaV1, [{
    key: "save",
    value: function save(visualChannels, parents) {
      // only save field and scale of each channel
      var _parents$slice11 = parents.slice(-1),
          _parents$slice12 = (0, _slicedToArray2["default"])(_parents$slice11, 1),
          layer = _parents$slice12[0];

      return (0, _defineProperty2["default"])({}, this.key, Object.keys(visualChannels).reduce( //  save channel to null if didn't select any field
      function (accu, key) {
        var _objectSpread8;

        return _objectSpread(_objectSpread({}, accu), {}, (_objectSpread8 = {}, (0, _defineProperty2["default"])(_objectSpread8, visualChannels[key].field, layer.config[visualChannels[key].field] ? (0, _lodash["default"])(layer.config[visualChannels[key].field], ['name', 'type']) : null), (0, _defineProperty2["default"])(_objectSpread8, visualChannels[key].scale, layer.config[visualChannels[key].scale]), _objectSpread8));
      }, {}));
    }
  }, {
    key: "load",
    value: function load(vc, parents, accumulator) {
      // fold channels into config
      var _parents$slice13 = parents.slice(-1),
          _parents$slice14 = (0, _slicedToArray2["default"])(_parents$slice13, 1),
          layer = _parents$slice14[0];

      var modified = visualChannelModificationV1[layer.type] ? visualChannelModificationV1[layer.type](vc, parents, accumulator) : {};
      return _objectSpread(_objectSpread({}, accumulator), {}, {
        config: _objectSpread(_objectSpread(_objectSpread({}, accumulator.config || {}), vc), modified)
      });
    }
  }]);
  return VisualChannelSchemaV1;
}(_schema["default"]);

var visConfigModificationV1 = {
  point: function point(visConfig, parents, accumulated) {
    var modified = {};

    var _parents$slice15 = parents.slice(-2, -1),
        _parents$slice16 = (0, _slicedToArray2["default"])(_parents$slice15, 1),
        layer = _parents$slice16[0];

    var isOld = !visConfig.hasOwnProperty('filled') && !visConfig.strokeColor && !visConfig.strokeColorRange;

    if (isOld) {
      // color color & color range to stroke color
      modified.strokeColor = layer.config.color;
      modified.strokeColorRange = (0, _lodash2["default"])(visConfig.colorRange);

      if (visConfig.outline) {
        // point layer now supports both outline and fill
        // for older schema where filled has not been added to point layer
        // set it to false
        modified.filled = false;
      }
    }

    return modified;
  },
  geojson: function geojson(visConfig, parents, accumulated) {
    // is points?
    var modified = {};

    var _parents$slice17 = parents.slice(-2, -1),
        _parents$slice18 = (0, _slicedToArray2["default"])(_parents$slice17, 1),
        layer = _parents$slice18[0];

    var isOld = layer.visualChannels && !layer.visualChannels.hasOwnProperty('strokeColorField') && !visConfig.strokeColor && !visConfig.strokeColorRange; // make our best guess if this geojson layer contains point

    var isPoint = layer.visualChannels && layer.visualChannels.radiusField || visConfig && visConfig.radius !== _layerFactory.LAYER_VIS_CONFIGS.radius.defaultValue;

    if (isOld) {
      // color color & color range to stroke color
      modified.strokeColor = layer.config.color;
      modified.strokeColorRange = (0, _lodash2["default"])(visConfig.colorRange);

      if (isPoint) {
        // if is point, set stroke to false
        modified.filled = true;
        modified.stroked = false;
      }
    }

    return modified;
  }
};

var VisConfigSchemaV1 = /*#__PURE__*/function (_Schema11) {
  (0, _inherits2["default"])(VisConfigSchemaV1, _Schema11);

  var _super11 = _createSuper(VisConfigSchemaV1);

  function VisConfigSchemaV1() {
    var _this8;

    (0, _classCallCheck2["default"])(this, VisConfigSchemaV1);

    for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    _this8 = _super11.call.apply(_super11, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this8), "key", 'visConfig');
    return _this8;
  }

  (0, _createClass2["default"])(VisConfigSchemaV1, [{
    key: "load",
    value: function load(visConfig, parents, accumulated) {
      var _parents$slice19 = parents.slice(-2, -1),
          _parents$slice20 = (0, _slicedToArray2["default"])(_parents$slice19, 1),
          layer = _parents$slice20[0];

      var modified = visConfigModificationV1[layer.type] ? visConfigModificationV1[layer.type](visConfig, parents, accumulated) : {};
      return {
        visConfig: _objectSpread(_objectSpread({}, visConfig), modified)
      };
    }
  }]);
  return VisConfigSchemaV1;
}(_schema["default"]);

var layerPropsV1 = {
  id: null,
  type: null,
  config: new _schema["default"]({
    version: _versions.VERSIONS.v1,
    key: 'config',
    properties: {
      dataId: null,
      label: null,
      color: null,
      columns: new ColumnSchemaV1({
        version: _versions.VERSIONS.v1,
        key: 'columns'
      }),
      isVisible: null,
      visConfig: new VisConfigSchemaV1({
        version: _versions.VERSIONS.v1
      }),
      hidden: null,
      textLabel: new TextLabelSchemaV1({
        version: _versions.VERSIONS.v1,
        key: 'textLabel'
      })
    }
  }),
  visualChannels: new VisualChannelSchemaV1({
    version: _versions.VERSIONS.v1,
    key: 'visualChannels'
  })
};
exports.layerPropsV1 = layerPropsV1;

var LayerSchemaV0 = /*#__PURE__*/function (_Schema12) {
  (0, _inherits2["default"])(LayerSchemaV0, _Schema12);

  var _super12 = _createSuper(LayerSchemaV0);

  function LayerSchemaV0() {
    var _this9;

    (0, _classCallCheck2["default"])(this, LayerSchemaV0);

    for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    _this9 = _super12.call.apply(_super12, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this9), "key", 'layers');
    return _this9;
  }

  (0, _createClass2["default"])(LayerSchemaV0, [{
    key: "save",
    value: function save(layers, parents) {
      var _this10 = this;

      var _parents$slice21 = parents.slice(-1),
          _parents$slice22 = (0, _slicedToArray2["default"])(_parents$slice21, 1),
          visState = _parents$slice22[0];

      return (0, _defineProperty2["default"])({}, this.key, visState.layerOrder.reduce(function (saved, index) {
        // save layers according to their rendering order
        var layer = layers[index];

        if (layer.isValidToSave()) {
          saved.push(_this10.savePropertiesOrApplySchema(layer).layers);
        }

        return saved;
      }, []));
    }
  }, {
    key: "load",
    value: function load(layers) {
      var _this11 = this;

      return (0, _defineProperty2["default"])({}, this.key, layers.map(function (layer) {
        return _this11.loadPropertiesOrApplySchema(layer, layers).layers;
      }));
    }
  }]);
  return LayerSchemaV0;
}(_schema["default"]);

var FilterSchemaV0 = /*#__PURE__*/function (_Schema13) {
  (0, _inherits2["default"])(FilterSchemaV0, _Schema13);

  var _super13 = _createSuper(FilterSchemaV0);

  function FilterSchemaV0() {
    var _this12;

    (0, _classCallCheck2["default"])(this, FilterSchemaV0);

    for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      args[_key10] = arguments[_key10];
    }

    _this12 = _super13.call.apply(_super13, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this12), "key", 'filters');
    return _this12;
  }

  (0, _createClass2["default"])(FilterSchemaV0, [{
    key: "save",
    value: function save(filters) {
      var _this13 = this;

      return {
        filters: filters.filter(_filterUtils.isValidFilterValue).map(function (filter) {
          return _this13.savePropertiesOrApplySchema(filter).filters;
        })
      };
    }
  }, {
    key: "load",
    value: function load(filters) {
      return {
        filters: filters
      };
    }
  }]);
  return FilterSchemaV0;
}(_schema["default"]);

var interactionPropsV0 = ['tooltip', 'brush'];

var InteractionSchemaV0 = /*#__PURE__*/function (_Schema14) {
  (0, _inherits2["default"])(InteractionSchemaV0, _Schema14);

  var _super14 = _createSuper(InteractionSchemaV0);

  function InteractionSchemaV0() {
    var _this14;

    (0, _classCallCheck2["default"])(this, InteractionSchemaV0);

    for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
      args[_key11] = arguments[_key11];
    }

    _this14 = _super14.call.apply(_super14, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this14), "key", 'interactionConfig');
    return _this14;
  }

  (0, _createClass2["default"])(InteractionSchemaV0, [{
    key: "save",
    value: function save(interactionConfig) {
      return Array.isArray(this.properties) ? (0, _defineProperty2["default"])({}, this.key, this.properties.reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), interactionConfig[key].enabled ? (0, _defineProperty2["default"])({}, key, interactionConfig[key].config) : {});
      }, {})) : {};
    }
  }, {
    key: "load",
    value: function load(interactionConfig) {
      // convert v0 -> v1
      // return enabled: false if disabled,
      return Array.isArray(this.properties) ? (0, _defineProperty2["default"])({}, this.key, this.properties.reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, interactionConfig[key] || {}), {}, {
          enabled: Boolean(interactionConfig[key])
        })));
      }, {})) : {};
    }
  }]);
  return InteractionSchemaV0;
}(_schema["default"]);

var interactionPropsV1 = [].concat(interactionPropsV0, ['geocoder', 'coordinate']);

var InteractionSchemaV1 = /*#__PURE__*/function (_Schema15) {
  (0, _inherits2["default"])(InteractionSchemaV1, _Schema15);

  var _super15 = _createSuper(InteractionSchemaV1);

  function InteractionSchemaV1() {
    var _this15;

    (0, _classCallCheck2["default"])(this, InteractionSchemaV1);

    for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
      args[_key12] = arguments[_key12];
    }

    _this15 = _super15.call.apply(_super15, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this15), "key", 'interactionConfig');
    return _this15;
  }

  (0, _createClass2["default"])(InteractionSchemaV1, [{
    key: "save",
    value: function save(interactionConfig) {
      // save config even if disabled,
      return Array.isArray(this.properties) ? (0, _defineProperty2["default"])({}, this.key, this.properties.reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, interactionConfig[key].config), {}, {
          enabled: interactionConfig[key].enabled
        })));
      }, {})) : {};
    }
  }, {
    key: "load",
    value: function load(interactionConfig) {
      var _this16 = this;

      var modifiedConfig = interactionConfig;
      Object.keys(interactionConfig).forEach(function (configType) {
        if (configType === 'tooltip') {
          var fieldsToShow = modifiedConfig[configType].fieldsToShow;

          if (!(0, _dataUtils.notNullorUndefined)(fieldsToShow)) {
            return (0, _defineProperty2["default"])({}, _this16.key, modifiedConfig);
          }

          Object.keys(fieldsToShow).forEach(function (key) {
            fieldsToShow[key] = fieldsToShow[key].map(function (fieldData) {
              if (!fieldData.name) {
                return {
                  name: fieldData,
                  format: null
                };
              }

              return fieldData;
            });
          });
        }

        return;
      });
      return (0, _defineProperty2["default"])({}, this.key, modifiedConfig);
    }
  }]);
  return InteractionSchemaV1;
}(_schema["default"]);

var filterPropsV0 = {
  dataId: null,
  id: null,
  name: null,
  type: null,
  value: null,
  enlarged: null
};
exports.filterPropsV0 = filterPropsV0;

var DimensionFieldSchema = /*#__PURE__*/function (_Schema16) {
  (0, _inherits2["default"])(DimensionFieldSchema, _Schema16);

  var _super16 = _createSuper(DimensionFieldSchema);

  function DimensionFieldSchema() {
    (0, _classCallCheck2["default"])(this, DimensionFieldSchema);
    return _super16.apply(this, arguments);
  }

  (0, _createClass2["default"])(DimensionFieldSchema, [{
    key: "save",
    value: function save(field) {
      return (0, _defineProperty2["default"])({}, this.key, field ? this.savePropertiesOrApplySchema(field)[this.key] : null);
    }
  }, {
    key: "load",
    value: function load(field) {
      return (0, _defineProperty2["default"])({}, this.key, field);
    }
  }]);
  return DimensionFieldSchema;
}(_schema["default"]);

exports.DimensionFieldSchema = DimensionFieldSchema;

var SplitMapsSchema = /*#__PURE__*/function (_Schema17) {
  (0, _inherits2["default"])(SplitMapsSchema, _Schema17);

  var _super17 = _createSuper(SplitMapsSchema);

  function SplitMapsSchema() {
    (0, _classCallCheck2["default"])(this, SplitMapsSchema);
    return _super17.apply(this, arguments);
  }

  (0, _createClass2["default"])(SplitMapsSchema, [{
    key: "convertLayerSettings",
    value: function convertLayerSettings(accu, _ref18) {
      var _ref19 = (0, _slicedToArray2["default"])(_ref18, 2),
          key = _ref19[0],
          value = _ref19[1];

      if (typeof value === 'boolean') {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, value));
      } else if (value && (0, _typeof2["default"])(value) === 'object' && value.isAvailable) {
        return _objectSpread(_objectSpread({}, accu), {}, (0, _defineProperty2["default"])({}, key, Boolean(value.isVisible)));
      }

      return accu;
    }
  }, {
    key: "load",
    value: function load(splitMaps) {
      var _this17 = this;

      // previous splitMaps Schema {layers: {layerId: {isVisible, isAvailable}}}
      if (!Array.isArray(splitMaps) || !splitMaps.length) {
        return {
          splitMaps: []
        };
      }

      return {
        splitMaps: splitMaps.map(function (settings) {
          return _objectSpread(_objectSpread({}, settings), {}, {
            layers: Object.entries(settings.layers || {}).reduce(_this17.convertLayerSettings, {})
          });
        })
      };
    }
  }]);
  return SplitMapsSchema;
}(_schema["default"]);

exports.SplitMapsSchema = SplitMapsSchema;

var filterPropsV1 = _objectSpread(_objectSpread({}, filterPropsV0), {}, {
  plotType: null,
  yAxis: new DimensionFieldSchema({
    version: _versions.VERSIONS.v1,
    key: 'yAxis',
    properties: {
      name: null,
      type: null
    }
  }),
  // polygon filter properties
  layerId: null
});

exports.filterPropsV1 = filterPropsV1;
var propertiesV0 = {
  filters: new FilterSchemaV0({
    version: _versions.VERSIONS.v0,
    properties: filterPropsV0
  }),
  layers: new LayerSchemaV0({
    version: _versions.VERSIONS.v0,
    properties: layerPropsV0
  }),
  interactionConfig: new InteractionSchemaV0({
    version: _versions.VERSIONS.v0,
    properties: interactionPropsV0
  }),
  layerBlending: null
};
exports.propertiesV0 = propertiesV0;
var propertiesV1 = {
  filters: new FilterSchemaV0({
    version: _versions.VERSIONS.v1,
    properties: filterPropsV1
  }),
  layers: new LayerSchemaV0({
    version: _versions.VERSIONS.v1,
    properties: layerPropsV1
  }),
  interactionConfig: new InteractionSchemaV1({
    version: _versions.VERSIONS.v1,
    properties: interactionPropsV1
  }),
  layerBlending: null,
  splitMaps: new SplitMapsSchema({
    key: 'splitMaps',
    version: _versions.VERSIONS.v1
  }),
  animationConfig: new _schema["default"]({
    version: _versions.VERSIONS.v1,
    properties: {
      currentTime: null,
      speed: null
    },
    key: 'animationConfig'
  })
};
exports.propertiesV1 = propertiesV1;
var visStateSchemaV0 = new _schema["default"]({
  version: _versions.VERSIONS.v0,
  properties: propertiesV0,
  key: 'visState'
});
exports.visStateSchemaV0 = visStateSchemaV0;
var visStateSchemaV1 = new _schema["default"]({
  version: _versions.VERSIONS.v1,
  properties: propertiesV1,
  key: 'visState'
});
exports.visStateSchemaV1 = visStateSchemaV1;
var visStateSchema = (_visStateSchema = {}, (0, _defineProperty2["default"])(_visStateSchema, _versions.VERSIONS.v0, {
  save: function save(toSave) {
    return visStateSchemaV0.save(toSave);
  },
  load: function load(toLoad) {
    return visStateSchemaV1.load(visStateSchemaV0.load(toLoad).visState);
  }
}), (0, _defineProperty2["default"])(_visStateSchema, _versions.VERSIONS.v1, visStateSchemaV1), _visStateSchema); // test load v0

exports.visStateSchema = visStateSchema;
var _default = visStateSchema;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY2hlbWFzL3Zpcy1zdGF0ZS1zY2hlbWEuanMiXSwibmFtZXMiOlsiZGltZW5zaW9uUHJvcHNWMCIsImdlb2pzb25TaXplRmllbGRWMFRvVjEiLCJjb25maWciLCJkZWZhdWx0UmFpdWRzIiwiZGVmYXVsdFJhZGl1c1JhbmdlIiwidmlzQ29uZmlnIiwiZXh0cnVkZWQiLCJzdHJva2VkIiwicmFkaXVzIiwicmFkaXVzUmFuZ2UiLCJzb21lIiwiZCIsImkiLCJEaW1lbnNpb25GaWVsZFNjaGVtYVYwIiwiVkVSU0lPTlMiLCJ2MCIsImZpZWxkIiwia2V5Iiwic2F2ZVByb3BlcnRpZXNPckFwcGx5U2NoZW1hIiwicGFyZW50cyIsImFjY3VtdWxhdGVkIiwic2xpY2UiLCJmaWVsZE5hbWUiLCJ0eXBlIiwidmlzdWFsQ2hhbm5lbHMiLCJTY2hlbWEiLCJEaW1lbnNpb25TY2FsZVNjaGVtYVYwIiwic2NhbGUiLCJMYXllckNvbmZpZ1NjaGVtYVYwIiwic2F2ZWQiLCJMYXllckNvbHVtbnNTY2hlbWFWMCIsImNvbHVtbnMiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwiYWNjdSIsInZhbHVlIiwiTGF5ZXJDb25maWdUb1Zpc0NvbmZpZ1NjaGVtYVYwIiwiYWNjdW11bGF0ZWRDb25maWciLCJMYXllclZpc0NvbmZpZ1NjaGVtYVYwIiwiYWNjdW11bGF0b3IiLCJyZW5hbWUiLCJnZW9qc29uIiwiZWxldmF0aW9uUmFuZ2UiLCJwcm9wVG9SZW5hbWUiLCJMYXllckNvbmZpZ1NjaGVtYURlbGV0ZVYwIiwibGF5ZXJQcm9wc1YwIiwiaWQiLCJkYXRhSWQiLCJsYWJlbCIsImNvbG9yIiwiaXNWaXNpYmxlIiwiaGlkZGVuIiwiY29sb3JGaWVsZCIsInByb3BlcnRpZXMiLCJjb2xvclNjYWxlIiwic2l6ZUZpZWxkIiwic2l6ZVNjYWxlIiwiZW5hYmxlM2QiLCJjb2xvckFnZ3JlZ2F0aW9uIiwic2l6ZUFnZ3JlZ2F0aW9uIiwiaXNBZ2dyZWdhdGVkIiwiQ29sdW1uU2NoZW1hVjEiLCJzdGF0ZSIsImNrZXkiLCJUZXh0TGFiZWxTY2hlbWFWMSIsInRleHRMYWJlbCIsIm1hcCIsInRsIiwiQXJyYXkiLCJpc0FycmF5IiwidmlzdWFsQ2hhbm5lbE1vZGlmaWNhdGlvblYxIiwicG9pbnQiLCJ2YyIsImxheWVyIiwib3V0bGluZSIsImhhc093blByb3BlcnR5Iiwic3Ryb2tlQ29sb3JGaWVsZCIsInN0cm9rZUNvbG9yU2NhbGUiLCJpc09sZCIsImlzUG9pbnQiLCJyYWRpdXNGaWVsZCIsIkxBWUVSX1ZJU19DT05GSUdTIiwiZGVmYXVsdFZhbHVlIiwiVmlzdWFsQ2hhbm5lbFNjaGVtYVYxIiwibW9kaWZpZWQiLCJ2aXNDb25maWdNb2RpZmljYXRpb25WMSIsInN0cm9rZUNvbG9yIiwic3Ryb2tlQ29sb3JSYW5nZSIsImNvbG9yUmFuZ2UiLCJmaWxsZWQiLCJWaXNDb25maWdTY2hlbWFWMSIsImxheWVyUHJvcHNWMSIsInZlcnNpb24iLCJ2MSIsIkxheWVyU2NoZW1hVjAiLCJsYXllcnMiLCJ2aXNTdGF0ZSIsImxheWVyT3JkZXIiLCJpbmRleCIsImlzVmFsaWRUb1NhdmUiLCJwdXNoIiwibG9hZFByb3BlcnRpZXNPckFwcGx5U2NoZW1hIiwiRmlsdGVyU2NoZW1hVjAiLCJmaWx0ZXJzIiwiZmlsdGVyIiwiaXNWYWxpZEZpbHRlclZhbHVlIiwiaW50ZXJhY3Rpb25Qcm9wc1YwIiwiSW50ZXJhY3Rpb25TY2hlbWFWMCIsImludGVyYWN0aW9uQ29uZmlnIiwiZW5hYmxlZCIsIkJvb2xlYW4iLCJpbnRlcmFjdGlvblByb3BzVjEiLCJJbnRlcmFjdGlvblNjaGVtYVYxIiwibW9kaWZpZWRDb25maWciLCJmb3JFYWNoIiwiY29uZmlnVHlwZSIsImZpZWxkc1RvU2hvdyIsImZpZWxkRGF0YSIsIm5hbWUiLCJmb3JtYXQiLCJmaWx0ZXJQcm9wc1YwIiwiZW5sYXJnZWQiLCJEaW1lbnNpb25GaWVsZFNjaGVtYSIsIlNwbGl0TWFwc1NjaGVtYSIsImlzQXZhaWxhYmxlIiwic3BsaXRNYXBzIiwibGVuZ3RoIiwic2V0dGluZ3MiLCJlbnRyaWVzIiwiY29udmVydExheWVyU2V0dGluZ3MiLCJmaWx0ZXJQcm9wc1YxIiwicGxvdFR5cGUiLCJ5QXhpcyIsImxheWVySWQiLCJwcm9wZXJ0aWVzVjAiLCJsYXllckJsZW5kaW5nIiwicHJvcGVydGllc1YxIiwiYW5pbWF0aW9uQ29uZmlnIiwiY3VycmVudFRpbWUiLCJzcGVlZCIsInZpc1N0YXRlU2NoZW1hVjAiLCJ2aXNTdGF0ZVNjaGVtYVYxIiwidmlzU3RhdGVTY2hlbWEiLCJzYXZlIiwidG9TYXZlIiwibG9hZCIsInRvTG9hZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQTs7O0FBSU8sSUFBTUEsZ0JBQWdCLEdBQUcsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUF6QixDLENBRVA7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBQ0EsU0FBU0Msc0JBQVQsQ0FBZ0NDLE1BQWhDLEVBQXdDO0FBQ3RDLE1BQU1DLGFBQWEsR0FBRyxFQUF0QjtBQUNBLE1BQU1DLGtCQUFrQixHQUFHLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBM0IsQ0FGc0MsQ0FJdEM7O0FBQ0EsTUFBSUYsTUFBTSxDQUFDRyxTQUFQLENBQWlCQyxRQUFyQixFQUErQjtBQUM3QixXQUFPLGFBQVA7QUFDRCxHQVBxQyxDQVN0Qzs7O0FBQ0EsTUFBSUosTUFBTSxDQUFDRyxTQUFQLENBQWlCRSxPQUFyQixFQUE4QjtBQUM1QixXQUFPLFdBQVA7QUFDRCxHQVpxQyxDQWN0QztBQUNBOzs7QUFDQSxNQUNFTCxNQUFNLENBQUNHLFNBQVAsQ0FBaUJHLE1BQWpCLEtBQTRCTCxhQUE1QixJQUNBRCxNQUFNLENBQUNHLFNBQVAsQ0FBaUJJLFdBQWpCLENBQTZCQyxJQUE3QixDQUFrQyxVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxXQUFVRCxDQUFD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TyxFQUFFL0UsbUJBQVNnRixFQURRO0FBRTFCeEMsSUFBQUEsVUFBVSxFQUFFO0FBQ1ZxRixNQUFBQSxXQUFXLEVBQUUsSUFESDtBQUVWQyxNQUFBQSxLQUFLLEVBQUU7QUFGRyxLQUZjO0FBTTFCM0gsSUFBQUEsR0FBRyxFQUFFO0FBTnFCLEdBQVg7QUFsQlMsQ0FBckI7O0FBNEJBLElBQU00SCxnQkFBZ0IsR0FBRyxJQUFJcEgsa0JBQUosQ0FBVztBQUN6Q29FLEVBQUFBLE9BQU8sRUFBRS9FLG1CQUFTQyxFQUR1QjtBQUV6Q3VDLEVBQUFBLFVBQVUsRUFBRWlGLFlBRjZCO0FBR3pDdEgsRUFBQUEsR0FBRyxFQUFFO0FBSG9DLENBQVgsQ0FBekI7O0FBTUEsSUFBTTZILGdCQUFnQixHQUFHLElBQUlySCxrQkFBSixDQUFXO0FBQ3pDb0UsRUFBQUEsT0FBTyxFQUFFL0UsbUJBQVNnRixFQUR1QjtBQUV6Q3hDLEVBQUFBLFVBQVUsRUFBRW1GLFlBRjZCO0FBR3pDeEgsRUFBQUEsR0FBRyxFQUFFO0FBSG9DLENBQVgsQ0FBekI7O0FBTUEsSUFBTThILGNBQWMsNEVBQ3hCakksbUJBQVNDLEVBRGUsRUFDVjtBQUNiaUksRUFBQUEsSUFBSSxFQUFFLGNBQUFDLE1BQU07QUFBQSxXQUFJSixnQkFBZ0IsQ0FBQ0csSUFBakIsQ0FBc0JDLE1BQXRCLENBQUo7QUFBQSxHQURDO0FBRWJDLEVBQUFBLElBQUksRUFBRSxjQUFBQyxNQUFNO0FBQUEsV0FBSUwsZ0JBQWdCLENBQUNJLElBQWpCLENBQXNCTCxnQkFBZ0IsQ0FBQ0ssSUFBakIsQ0FBc0JDLE1BQXRCLEVBQThCbEQsUUFBcEQsQ0FBSjtBQUFBO0FBRkMsQ0FEVSxxREFLeEJuRixtQkFBU2dGLEVBTGUsRUFLVmdELGdCQUxVLG1CQUFwQixDLENBUVA7OztlQUNlQyxjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoLnBpY2snO1xuaW1wb3J0IHtWRVJTSU9OU30gZnJvbSAnLi92ZXJzaW9ucyc7XG5pbXBvcnQge2lzVmFsaWRGaWx0ZXJWYWx1ZX0gZnJvbSAndXRpbHMvZmlsdGVyLXV0aWxzJztcbmltcG9ydCB7TEFZRVJfVklTX0NPTkZJR1N9IGZyb20gJ2xheWVycy9sYXllci1mYWN0b3J5JztcbmltcG9ydCBTY2hlbWEgZnJvbSAnLi9zY2hlbWEnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJztcbmltcG9ydCB7bm90TnVsbG9yVW5kZWZpbmVkfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcblxuLyoqXG4gKiBWMCBTY2hlbWFcbiAqL1xuXG5leHBvcnQgY29uc3QgZGltZW5zaW9uUHJvcHNWMCA9IFsnbmFtZScsICd0eXBlJ107XG5cbi8vIGluIHYwIGdlb2pzb24gdGhlcmUgaXMgb25seSBzaXplRmllbGRcblxuLy8gaW4gdjEgZ2VvanNvblxuLy8gc3Ryb2tlIGJhc2Ugb24gLT4gc2l6ZUZpZWxkXG4vLyBoZWlnaHQgYmFzZWQgb24gLT4gaGVpZ2h0RmllbGRcbi8vIHJhZGl1cyBiYXNlZCBvbiAtPiByYWRpdXNGaWVsZFxuLy8gaGVyZSB3ZSBtYWtlIG91ciB3aXJlZHN0IGd1ZXNzIG9uIHdoaWNoIGNoYW5uZWwgc2l6ZUZpZWxkIGJlbG9uZ3MgdG9cbmZ1bmN0aW9uIGdlb2pzb25TaXplRmllbGRWMFRvVjEoY29uZmlnKSB7XG4gIGNvbnN0IGRlZmF1bHRSYWl1ZHMgPSAxMDtcbiAgY29uc3QgZGVmYXVsdFJhZGl1c1JhbmdlID0gWzAsIDUwXTtcblxuICAvLyBpZiBleHRydWRlZCwgc2l6ZUZpZWxkIGlzIG1vc3QgbGlrZWx5IHVzZWQgZm9yIGhlaWdodFxuICBpZiAoY29uZmlnLnZpc0NvbmZpZy5leHRydWRlZCkge1xuICAgIHJldHVybiAnaGVpZ2h0RmllbGQnO1xuICB9XG5cbiAgLy8gaWYgc2hvdyBzdHJva2UgZW5hYmxlZCwgc2l6ZUZpZWxkIGlzIG1vc3QgbGlrZWx5IHVzZWQgZm9yIHN0cm9rZVxuICBpZiAoY29uZmlnLnZpc0NvbmZpZy5zdHJva2VkKSB7XG4gICAgcmV0dXJuICdzaXplRmllbGQnO1xuICB9XG5cbiAgLy8gaWYgcmFkaXVzIGNoYW5nZWQsIG9yIHJhZGl1cyBSYW5nZSBDaGFuZ2VkLCBzaXplRmllbGQgaXMgbW9zdCBsaWtlbHkgdXNlZCBmb3IgcmFkaXVzXG4gIC8vIHRoaXMgaXMgdGhlIG1vc3QgdW5yZWxpYWJsZSBndWVzcywgdGhhdCdzIHdoeSB3ZSBwdXQgaXQgaW4gdGhlIGVuZFxuICBpZiAoXG4gICAgY29uZmlnLnZpc0NvbmZpZy5yYWRpdXMgIT09IGRlZmF1bHRSYWl1ZHMgfHxcbiAgICBjb25maWcudmlzQ29uZmlnLnJhZGl1c1JhbmdlLnNvbWUoKGQsIGkpID0+IGQgIT09IGRlZmF1bHRSYWRpdXNSYW5nZVtpXSlcbiAgKSB7XG4gICAgcmV0dXJuICdyYWRpdXNGaWVsZCc7XG4gIH1cblxuICByZXR1cm4gJ3NpemVGaWVsZCc7XG59XG5cbi8vIGNvbnZlcnQgdjAgdG8gdjEgbGF5ZXIgY29uZmlnXG5jbGFzcyBEaW1lbnNpb25GaWVsZFNjaGVtYVYwIGV4dGVuZHMgU2NoZW1hIHtcbiAgdmVyc2lvbiA9IFZFUlNJT05TLnYwO1xuICBzYXZlKGZpZWxkKSB7XG4gICAgLy8gc2hvdWxkIG5vdCBiZSBjYWxsZWQgYW55bW9yZVxuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5rZXldOiBmaWVsZCAhPT0gbnVsbCA/IHRoaXMuc2F2ZVByb3BlcnRpZXNPckFwcGx5U2NoZW1hKGZpZWxkKVt0aGlzLmtleV0gOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGxvYWQoZmllbGQsIHBhcmVudHMsIGFjY3VtdWxhdGVkKSB7XG4gICAgY29uc3QgW2NvbmZpZ10gPSBwYXJlbnRzLnNsaWNlKC0xKTtcbiAgICBsZXQgZmllbGROYW1lID0gdGhpcy5rZXk7XG4gICAgaWYgKGNvbmZpZy50eXBlID09PSAnZ2VvanNvbicgJiYgdGhpcy5rZXkgPT09ICdzaXplRmllbGQnICYmIGZpZWxkKSB7XG4gICAgICBmaWVsZE5hbWUgPSBnZW9qc29uU2l6ZUZpZWxkVjBUb1YxKGNvbmZpZyk7XG4gICAgfVxuICAgIC8vIGZvbGQgaW50byB2aXN1YWxDaGFubmVscyB0byBiZSBsb2FkIGJ5IFZpc3VhbENoYW5uZWxTY2hlbWFWMVxuICAgIHJldHVybiB7XG4gICAgICB2aXN1YWxDaGFubmVsczoge1xuICAgICAgICAuLi4oYWNjdW11bGF0ZWQudmlzdWFsQ2hhbm5lbHMgfHwge30pLFxuICAgICAgICBbZmllbGROYW1lXTogZmllbGRcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIERpbWVuc2lvblNjYWxlU2NoZW1hVjAgZXh0ZW5kcyBTY2hlbWEge1xuICB2ZXJzaW9uID0gVkVSU0lPTlMudjA7XG4gIHNhdmUoc2NhbGUpIHtcbiAgICByZXR1cm4ge1t0aGlzLmtleV06IHNjYWxlfTtcbiAgfVxuICBsb2FkKHNjYWxlLCBwYXJlbnRzLCBhY2N1bXVsYXRlZCkge1xuICAgIGNvbnN0IFtjb25maWddID0gcGFyZW50cy5zbGljZSgtMSk7XG4gICAgLy8gZm9sZCBpbnRvIHZpc3VhbENoYW5uZWxzIHRvIGJlIGxvYWQgYnkgVmlzdWFsQ2hhbm5lbFNjaGVtYVYxXG4gICAgaWYgKHRoaXMua2V5ID09PSAnc2l6ZVNjYWxlJyAmJiBjb25maWcudHlwZSA9PT0gJ2dlb2pzb24nKSB7XG4gICAgICAvLyBzaXplU2NhbGUgbm93IHNwbGl0IGludG8gcmFkaXVzU2NhbGUsIGhlaWdodFNjYWxlXG4gICAgICAvLyBubyB1c2VyIGN1c3RvbWl6YXRpb24sIGp1c3QgdXNlIGRlZmF1bHRcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmlzdWFsQ2hhbm5lbHM6IHtcbiAgICAgICAgLi4uKGFjY3VtdWxhdGVkLnZpc3VhbENoYW5uZWxzIHx8IHt9KSxcbiAgICAgICAgW3RoaXMua2V5XTogc2NhbGVcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbi8vIHVzZWQgdG8gY29udmVydCB2MCB0byB2MSBsYXllciBjb25maWdcbmNsYXNzIExheWVyQ29uZmlnU2NoZW1hVjAgZXh0ZW5kcyBTY2hlbWEge1xuICB2ZXJzaW9uID0gVkVSU0lPTlMudjA7XG4gIGxvYWQoc2F2ZWQsIHBhcmVudHMsIGFjY3VtdWxhdGVkKSB7XG4gICAgLy8gZm9sZCB2MCBsYXllciBwcm9wZXJ0eSBpbnRvIGNvbmZpZy5rZXlcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlnOiB7XG4gICAgICAgIC4uLihhY2N1bXVsYXRlZC5jb25maWcgfHwge30pLFxuICAgICAgICBbdGhpcy5rZXldOiBzYXZlZFxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuLy8gdXNlZCB0byBjb252ZXJ0IHYwIHRvIHYxIGxheWVyIGNvbHVtbnNcbi8vIG9ubHkgcmV0dXJuIGNvbHVtbiB2YWx1ZSBmb3IgZWFjaCBjb2x1bW5cbmNsYXNzIExheWVyQ29sdW1uc1NjaGVtYVYwIGV4dGVuZHMgU2NoZW1hIHtcbiAgdmVyc2lvbiA9IFZFUlNJT05TLnYwO1xuICBsb2FkKHNhdmVkLCBwYXJlbnRzLCBhY2N1bXVsYXRlZCkge1xuICAgIC8vIGZvbGQgdjAgbGF5ZXIgcHJvcGVydHkgaW50byBjb25maWcua2V5LCBmbGF0dGVuIGNvbHVtbnNcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlnOiB7XG4gICAgICAgIC4uLihhY2N1bXVsYXRlZC5jb25maWcgfHwge30pLFxuICAgICAgICBjb2x1bW5zOiBPYmplY3Qua2V5cyhzYXZlZCkucmVkdWNlKFxuICAgICAgICAgIChhY2N1LCBrZXkpID0+ICh7XG4gICAgICAgICAgICAuLi5hY2N1LFxuICAgICAgICAgICAgW2tleV06IHNhdmVkW2tleV0udmFsdWVcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB7fVxuICAgICAgICApXG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG4vLyB1c2VkIHRvIGNvbnZlcnQgdjAgdG8gdjEgbGF5ZXIgY29uZmlnLnZpc0NvbmZpZ1xuY2xhc3MgTGF5ZXJDb25maWdUb1Zpc0NvbmZpZ1NjaGVtYVYwIGV4dGVuZHMgU2NoZW1hIHtcbiAgdmVyc2lvbiA9IFZFUlNJT05TLnYwO1xuICBsb2FkKHNhdmVkLCBwYXJlbnRzLCBhY2N1bXVsYXRlZCkge1xuICAgIC8vIGZvbGQgdjAgbGF5ZXIgcHJvcGVydHkgaW50byBjb25maWcudmlzQ29uZmlnXG4gICAgY29uc3QgYWNjdW11bGF0ZWRDb25maWcgPSBhY2N1bXVsYXRlZC5jb25maWcgfHwge307XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZzoge1xuICAgICAgICAuLi5hY2N1bXVsYXRlZENvbmZpZyxcbiAgICAgICAgdmlzQ29uZmlnOiB7XG4gICAgICAgICAgLi4uKGFjY3VtdWxhdGVkQ29uZmlnLnZpc0NvbmZpZyB8fCB7fSksXG4gICAgICAgICAgW3RoaXMua2V5XTogc2F2ZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuY2xhc3MgTGF5ZXJWaXNDb25maWdTY2hlbWFWMCBleHRlbmRzIFNjaGVtYSB7XG4gIHZlcnNpb24gPSBWRVJTSU9OUy52MDtcbiAga2V5ID0gJ3Zpc0NvbmZpZyc7XG5cbiAgbG9hZCh2aXNDb25maWcsIHBhcmVudHMsIGFjY3VtdWxhdG9yKSB7XG4gICAgY29uc3QgW2NvbmZpZ10gPSBwYXJlbnRzLnNsaWNlKC0xKTtcbiAgICBjb25zdCByZW5hbWUgPSB7XG4gICAgICBnZW9qc29uOiB7XG4gICAgICAgIGV4dHJ1ZGVkOiAnZW5hYmxlM2QnLFxuICAgICAgICBlbGV2YXRpb25SYW5nZTogJ2hlaWdodFJhbmdlJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoY29uZmlnLnR5cGUgaW4gcmVuYW1lKSB7XG4gICAgICBjb25zdCBwcm9wVG9SZW5hbWUgPSByZW5hbWVbY29uZmlnLnR5cGVdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgLi4uKGFjY3VtdWxhdG9yLmNvbmZpZyB8fCB7fSksXG4gICAgICAgICAgdmlzQ29uZmlnOiBPYmplY3Qua2V5cyh2aXNDb25maWcpLnJlZHVjZShcbiAgICAgICAgICAgIChhY2N1LCBrZXkpID0+ICh7XG4gICAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICAgIC4uLihwcm9wVG9SZW5hbWVba2V5XVxuICAgICAgICAgICAgICAgID8ge1twcm9wVG9SZW5hbWVba2V5XV06IHZpc0NvbmZpZ1trZXldfVxuICAgICAgICAgICAgICAgIDoge1trZXldOiB2aXNDb25maWdba2V5XX0pXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHt9XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb25maWc6IHtcbiAgICAgICAgLi4uKGFjY3VtdWxhdG9yLmNvbmZpZyB8fCB7fSksXG4gICAgICAgIHZpc0NvbmZpZ1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuY2xhc3MgTGF5ZXJDb25maWdTY2hlbWFEZWxldGVWMCBleHRlbmRzIFNjaGVtYSB7XG4gIHZlcnNpb24gPSBWRVJTSU9OUy52MDtcbiAgbG9hZCh2YWx1ZSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxufVxuXG4vKipcbiAqIFYwIC0+IFYxIENoYW5nZXNcbiAqIC0gbGF5ZXIgaXMgbm93IGEgY2xhc3NcbiAqIC0gY29uZmlnIHNhdmVkIGluIGEgY29uZmlnIG9iamVjdFxuICogLSBpZCwgdHlwZSwgaXNBZ2dyZWdhdGVkIGlzIG91dHNpZGUgbGF5ZXIuY29uZmlnXG4gKiAtIHZpc3VhbENoYW5uZWxzIGlzIG91dHNpZGUgY29uZmlnLCBpdCBkZWZpbmVzIGF2YWlsYWJsZSB2aXN1YWwgY2hhbm5lbCBhbmRcbiAqICAgcHJvcGVydHkgbmFtZXMgZm9yIGZpZWxkLCBzY2FsZSwgZG9tYWluIGFuZCByYW5nZSBvZiBlYWNoIHZpc3VhbCBjaGFuZWwuXG4gKiAtIGVuYWJsZTNkLCBjb2xvckFnZ3JlZ2F0aW9uIGFuZCBzaXplQWdncmVnYXRpb24gYXJlIG1vdmVkIGludG8gdmlzQ29uZmlnXG4gKiAtIEdlb2pzb25MYXllciAtIGFkZGVkIGhlaWdodCwgcmFkaXVzIHNwZWNpZmljIHByb3BlcnRpZXNcbiAqL1xuXG5leHBvcnQgY29uc3QgbGF5ZXJQcm9wc1YwID0ge1xuICBpZDogbnVsbCxcbiAgdHlwZTogbnVsbCxcblxuICAvLyBtb3ZlIGludG8gbGF5ZXIuY29uZmlnXG4gIGRhdGFJZDogbmV3IExheWVyQ29uZmlnU2NoZW1hVjAoe2tleTogJ2RhdGFJZCd9KSxcbiAgbGFiZWw6IG5ldyBMYXllckNvbmZpZ1NjaGVtYVYwKHtrZXk6ICdsYWJlbCd9KSxcbiAgY29sb3I6IG5ldyBMYXllckNvbmZpZ1NjaGVtYVYwKHtrZXk6ICdjb2xvcid9KSxcbiAgaXNWaXNpYmxlOiBuZXcgTGF5ZXJDb25maWdTY2hlbWFWMCh7a2V5OiAnaXNWaXNpYmxlJ30pLFxuICBoaWRkZW46IG5ldyBMYXllckNvbmZpZ1NjaGVtYVYwKHtrZXk6ICdoaWRkZW4nfSksXG5cbiAgLy8gY29udmVydCB2aXNDb25maWdcbiAgdmlzQ29uZmlnOiBuZXcgTGF5ZXJWaXNDb25maWdTY2hlbWFWMCh7a2V5OiAndmlzQ29uZmlnJ30pLFxuXG4gIC8vIG1vdmUgaW50byBsYXllci5jb25maWdcbiAgLy8gZmxhdHRlblxuICBjb2x1bW5zOiBuZXcgTGF5ZXJDb2x1bW5zU2NoZW1hVjAoKSxcblxuICAvLyBzYXZlIGludG8gdmlzdWFsQ2hhbm5lbHNcbiAgY29sb3JGaWVsZDogbmV3IERpbWVuc2lvbkZpZWxkU2NoZW1hVjAoe1xuICAgIHByb3BlcnRpZXM6IGRpbWVuc2lvblByb3BzVjAsXG4gICAga2V5OiAnY29sb3JGaWVsZCdcbiAgfSksXG4gIGNvbG9yU2NhbGU6IG5ldyBEaW1lbnNpb25TY2FsZVNjaGVtYVYwKHtcbiAgICBrZXk6ICdjb2xvclNjYWxlJ1xuICB9KSxcbiAgc2l6ZUZpZWxkOiBuZXcgRGltZW5zaW9uRmllbGRTY2hlbWFWMCh7XG4gICAgcHJvcGVydGllczogZGltZW5zaW9uUHJvcHNWMCxcbiAgICBrZXk6ICdzaXplRmllbGQnXG4gIH0pLFxuICBzaXplU2NhbGU6IG5ldyBEaW1lbnNpb25TY2FsZVNjaGVtYVYwKHtcbiAgICBrZXk6ICdzaXplU2NhbGUnXG4gIH0pLFxuXG4gIC8vIG1vdmUgaW50byBjb25maWcudmlzQ29uZmlnXG4gIGVuYWJsZTNkOiBuZXcgTGF5ZXJDb25maWdUb1Zpc0NvbmZpZ1NjaGVtYVYwKHtrZXk6ICdlbmFibGUzZCd9KSxcbiAgY29sb3JBZ2dyZWdhdGlvbjogbmV3IExheWVyQ29uZmlnVG9WaXNDb25maWdTY2hlbWFWMCh7XG4gICAga2V5OiAnY29sb3JBZ2dyZWdhdGlvbidcbiAgfSksXG4gIHNpemVBZ2dyZWdhdGlvbjogbmV3IExheWVyQ29uZmlnVG9WaXNDb25maWdTY2hlbWFWMCh7a2V5OiAnc2l6ZUFnZ3JlZ2F0aW9uJ30pLFxuXG4gIC8vIGRlbGV0ZVxuICBpc0FnZ3JlZ2F0ZWQ6IG5ldyBMYXllckNvbmZpZ1NjaGVtYURlbGV0ZVYwKClcbn07XG5cbi8qKlxuICogVjEgU2NoZW1hXG4gKi9cbmNsYXNzIENvbHVtblNjaGVtYVYxIGV4dGVuZHMgU2NoZW1hIHtcbiAgc2F2ZShjb2x1bW5zLCBzdGF0ZSkge1xuICAgIC8vIHN0YXJ0aW5nIGZyb20gdjEsIG9ubHkgc2F2ZSBjb2x1bW4gdmFsdWVcbiAgICAvLyBmaWVsZElkeCB3aWxsIGJlIGNhbGN1bGF0ZWQgZHVyaW5nIG1lcmdlXG4gICAgcmV0dXJuIHtcbiAgICAgIFt0aGlzLmtleV06IE9iamVjdC5rZXlzKGNvbHVtbnMpLnJlZHVjZShcbiAgICAgICAgKGFjY3UsIGNrZXkpID0+ICh7XG4gICAgICAgICAgLi4uYWNjdSxcbiAgICAgICAgICBbY2tleV06IGNvbHVtbnNbY2tleV0udmFsdWVcbiAgICAgICAgfSksXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgfTtcbiAgfVxuXG4gIGxvYWQoY29sdW1ucykge1xuICAgIHJldHVybiB7Y29sdW1uc307XG4gIH1cbn1cblxuY2xhc3MgVGV4dExhYmVsU2NoZW1hVjEgZXh0ZW5kcyBTY2hlbWEge1xuICBzYXZlKHRleHRMYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5rZXldOiB0ZXh0TGFiZWwubWFwKHRsID0+ICh7XG4gICAgICAgIC4uLnRsLFxuICAgICAgICBmaWVsZDogdGwuZmllbGQgPyBwaWNrKHRsLmZpZWxkLCBbJ25hbWUnLCAndHlwZSddKSA6IG51bGxcbiAgICAgIH0pKVxuICAgIH07XG4gIH1cblxuICBsb2FkKHRleHRMYWJlbCkge1xuICAgIHJldHVybiB7dGV4dExhYmVsOiBBcnJheS5pc0FycmF5KHRleHRMYWJlbCkgPyB0ZXh0TGFiZWwgOiBbdGV4dExhYmVsXX07XG4gIH1cbn1cblxuY29uc3QgdmlzdWFsQ2hhbm5lbE1vZGlmaWNhdGlvblYxID0ge1xuICBwb2ludDogKHZjLCBwYXJlbnRzLCBhY2N1bXVsYXRvcikgPT4ge1xuICAgIGNvbnN0IFtsYXllcl0gPSBwYXJlbnRzLnNsaWNlKC0xKTtcblxuICAgIGlmIChsYXllci5jb25maWcudmlzQ29uZmlnLm91dGxpbmUgJiYgdmMuY29sb3JGaWVsZCAmJiAhdmMuaGFzT3duUHJvcGVydHkoJ3N0cm9rZUNvbG9yRmllbGQnKSkge1xuICAgICAgLy8gcG9pbnQgbGF5ZXIgbm93IHN1cHBvcnRzIGJvdGggb3V0bGluZSBhbmQgZmlsbFxuICAgICAgLy8gZm9yIG9sZGVyIHNjaGVtYSB3aGVyZSBmaWxsZWQgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHBvaW50IGxheWVyXG4gICAgICAvLyBjb3B5IGNvbG9yRmllbGQsIGNvbG9yU2NhbGUgdG8gc3Ryb2tlQ29sb3JGaWVsZCwgYW5kIHN0cm9rZUNvbG9yU2NhbGVcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0cm9rZUNvbG9yRmllbGQ6IHZjLmNvbG9yRmllbGQsXG4gICAgICAgIHN0cm9rZUNvbG9yU2NhbGU6IHZjLmNvbG9yU2NhbGUsXG4gICAgICAgIGNvbG9yRmllbGQ6IG51bGwsXG4gICAgICAgIGNvbG9yU2NhbGU6ICdxdWFudGlsZSdcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZ2VvanNvbjogKHZjLCBwYXJlbnRzLCBhY2N1bXVsYXRvcikgPT4ge1xuICAgIGNvbnN0IFtsYXllcl0gPSBwYXJlbnRzLnNsaWNlKC0xKTtcbiAgICBjb25zdCBpc09sZCA9ICF2Yy5oYXNPd25Qcm9wZXJ0eSgnc3Ryb2tlQ29sb3JGaWVsZCcpO1xuICAgIC8vIG1ha2Ugb3VyIGJlc3QgZ3Vlc3MgaWYgdGhpcyBnZW9qc29uIGxheWVyIGNvbnRhaW5zIHBvaW50XG4gICAgY29uc3QgaXNQb2ludCA9XG4gICAgICB2Yy5yYWRpdXNGaWVsZCB8fCBsYXllci5jb25maWcudmlzQ29uZmlnLnJhZGl1cyAhPT0gTEFZRVJfVklTX0NPTkZJR1MucmFkaXVzLmRlZmF1bHRWYWx1ZTtcblxuICAgIGlmIChpc09sZCAmJiAhaXNQb2ludCAmJiBsYXllci5jb25maWcudmlzQ29uZmlnLnN0cm9rZWQpIHtcbiAgICAgIC8vIGlmIHN0cm9rZWQgaXMgdHJ1ZSwgY29weSBjb2xvciBjb25maWcgdG8gc3Ryb2tlIGNvbG9yIGNvbmZpZ1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3Ryb2tlQ29sb3JGaWVsZDogdmMuY29sb3JGaWVsZCxcbiAgICAgICAgc3Ryb2tlQ29sb3JTY2FsZTogdmMuY29sb3JTY2FsZVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG59O1xuLyoqXG4gKiBWMTogc2F2ZSBbZmllbGRdOiB7bmFtZSwgdHlwZX0sIFtzY2FsZV06ICcnIGZvciBlYWNoIGNoYW5uZWxcbiAqL1xuY2xhc3MgVmlzdWFsQ2hhbm5lbFNjaGVtYVYxIGV4dGVuZHMgU2NoZW1hIHtcbiAgc2F2ZSh2aXN1YWxDaGFubmVscywgcGFyZW50cykge1xuICAgIC8vIG9ubHkgc2F2ZSBmaWVsZCBhbmQgc2NhbGUgb2YgZWFjaCBjaGFubmVsXG4gICAgY29uc3QgW2xheWVyXSA9IHBhcmVudHMuc2xpY2UoLTEpO1xuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5rZXldOiBPYmplY3Qua2V5cyh2aXN1YWxDaGFubmVscykucmVkdWNlKFxuICAgICAgICAvLyAgc2F2ZSBjaGFubmVsIHRvIG51bGwgaWYgZGlkbid0IHNlbGVjdCBhbnkgZmllbGRcbiAgICAgICAgKGFjY3UsIGtleSkgPT4gKHtcbiAgICAgICAgICAuLi5hY2N1LFxuICAgICAgICAgIFt2aXN1YWxDaGFubmVsc1trZXldLmZpZWxkXTogbGF5ZXIuY29uZmlnW3Zpc3VhbENoYW5uZWxzW2tleV0uZmllbGRdXG4gICAgICAgICAgICA/IHBpY2sobGF5ZXIuY29uZmlnW3Zpc3VhbENoYW5uZWxzW2tleV0uZmllbGRdLCBbJ25hbWUnLCAndHlwZSddKVxuICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgIFt2aXN1YWxDaGFubmVsc1trZXldLnNjYWxlXTogbGF5ZXIuY29uZmlnW3Zpc3VhbENoYW5uZWxzW2tleV0uc2NhbGVdXG4gICAgICAgIH0pLFxuICAgICAgICB7fVxuICAgICAgKVxuICAgIH07XG4gIH1cbiAgbG9hZCh2YywgcGFyZW50cywgYWNjdW11bGF0b3IpIHtcbiAgICAvLyBmb2xkIGNoYW5uZWxzIGludG8gY29uZmlnXG4gICAgY29uc3QgW2xheWVyXSA9IHBhcmVudHMuc2xpY2UoLTEpO1xuICAgIGNvbnN0IG1vZGlmaWVkID0gdmlzdWFsQ2hhbm5lbE1vZGlmaWNhdGlvblYxW2xheWVyLnR5cGVdXG4gICAgICA/IHZpc3VhbENoYW5uZWxNb2RpZmljYXRpb25WMVtsYXllci50eXBlXSh2YywgcGFyZW50cywgYWNjdW11bGF0b3IpXG4gICAgICA6IHt9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmFjY3VtdWxhdG9yLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIC4uLihhY2N1bXVsYXRvci5jb25maWcgfHwge30pLFxuICAgICAgICAuLi52YyxcbiAgICAgICAgLi4ubW9kaWZpZWRcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5jb25zdCB2aXNDb25maWdNb2RpZmljYXRpb25WMSA9IHtcbiAgcG9pbnQ6ICh2aXNDb25maWcsIHBhcmVudHMsIGFjY3VtdWxhdGVkKSA9PiB7XG4gICAgY29uc3QgbW9kaWZpZWQgPSB7fTtcbiAgICBjb25zdCBbbGF5ZXJdID0gcGFyZW50cy5zbGljZSgtMiwgLTEpO1xuICAgIGNvbnN0IGlzT2xkID1cbiAgICAgICF2aXNDb25maWcuaGFzT3duUHJvcGVydHkoJ2ZpbGxlZCcpICYmICF2aXNDb25maWcuc3Ryb2tlQ29sb3IgJiYgIXZpc0NvbmZpZy5zdHJva2VDb2xvclJhbmdlO1xuICAgIGlmIChpc09sZCkge1xuICAgICAgLy8gY29sb3IgY29sb3IgJiBjb2xvciByYW5nZSB0byBzdHJva2UgY29sb3JcbiAgICAgIG1vZGlmaWVkLnN0cm9rZUNvbG9yID0gbGF5ZXIuY29uZmlnLmNvbG9yO1xuICAgICAgbW9kaWZpZWQuc3Ryb2tlQ29sb3JSYW5nZSA9IGNsb25lRGVlcCh2aXNDb25maWcuY29sb3JSYW5nZSk7XG4gICAgICBpZiAodmlzQ29uZmlnLm91dGxpbmUpIHtcbiAgICAgICAgLy8gcG9pbnQgbGF5ZXIgbm93IHN1cHBvcnRzIGJvdGggb3V0bGluZSBhbmQgZmlsbFxuICAgICAgICAvLyBmb3Igb2xkZXIgc2NoZW1hIHdoZXJlIGZpbGxlZCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gcG9pbnQgbGF5ZXJcbiAgICAgICAgLy8gc2V0IGl0IHRvIGZhbHNlXG4gICAgICAgIG1vZGlmaWVkLmZpbGxlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtb2RpZmllZDtcbiAgfSxcbiAgZ2VvanNvbjogKHZpc0NvbmZpZywgcGFyZW50cywgYWNjdW11bGF0ZWQpID0+IHtcbiAgICAvLyBpcyBwb2ludHM/XG4gICAgY29uc3QgbW9kaWZpZWQgPSB7fTtcbiAgICBjb25zdCBbbGF5ZXJdID0gcGFyZW50cy5zbGljZSgtMiwgLTEpO1xuICAgIGNvbnN0IGlzT2xkID1cbiAgICAgIGxheWVyLnZpc3VhbENoYW5uZWxzICYmXG4gICAgICAhbGF5ZXIudmlzdWFsQ2hhbm5lbHMuaGFzT3duUHJvcGVydHkoJ3N0cm9rZUNvbG9yRmllbGQnKSAmJlxuICAgICAgIXZpc0NvbmZpZy5zdHJva2VDb2xvciAmJlxuICAgICAgIXZpc0NvbmZpZy5zdHJva2VDb2xvclJhbmdlO1xuICAgIC8vIG1ha2Ugb3VyIGJlc3QgZ3Vlc3MgaWYgdGhpcyBnZW9qc29uIGxheWVyIGNvbnRhaW5zIHBvaW50XG4gICAgY29uc3QgaXNQb2ludCA9XG4gICAgICAobGF5ZXIudmlzdWFsQ2hhbm5lbHMgJiYgbGF5ZXIudmlzdWFsQ2hhbm5lbHMucmFkaXVzRmllbGQpIHx8XG4gICAgICAodmlzQ29uZmlnICYmIHZpc0NvbmZpZy5yYWRpdXMgIT09IExBWUVSX1ZJU19DT05GSUdTLnJhZGl1cy5kZWZhdWx0VmFsdWUpO1xuXG4gICAgaWYgKGlzT2xkKSB7XG4gICAgICAvLyBjb2xvciBjb2xvciAmIGNvbG9yIHJhbmdlIHRvIHN0cm9rZSBjb2xvclxuICAgICAgbW9kaWZpZWQuc3Ryb2tlQ29sb3IgPSBsYXllci5jb25maWcuY29sb3I7XG4gICAgICBtb2RpZmllZC5zdHJva2VDb2xvclJhbmdlID0gY2xvbmVEZWVwKHZpc0NvbmZpZy5jb2xvclJhbmdlKTtcbiAgICAgIGlmIChpc1BvaW50KSB7XG4gICAgICAgIC8vIGlmIGlzIHBvaW50LCBzZXQgc3Ryb2tlIHRvIGZhbHNlXG4gICAgICAgIG1vZGlmaWVkLmZpbGxlZCA9IHRydWU7XG4gICAgICAgIG1vZGlmaWVkLnN0cm9rZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kaWZpZWQ7XG4gIH1cbn07XG5cbmNsYXNzIFZpc0NvbmZpZ1NjaGVtYVYxIGV4dGVuZHMgU2NoZW1hIHtcbiAga2V5ID0gJ3Zpc0NvbmZpZyc7XG5cbiAgbG9hZCh2aXNDb25maWcsIHBhcmVudHMsIGFjY3VtdWxhdGVkKSB7XG4gICAgY29uc3QgW2xheWVyXSA9IHBhcmVudHMuc2xpY2UoLTIsIC0xKTtcbiAgICBjb25zdCBtb2RpZmllZCA9IHZpc0NvbmZpZ01vZGlmaWNhdGlvblYxW2xheWVyLnR5cGVdXG4gICAgICA/IHZpc0NvbmZpZ01vZGlmaWNhdGlvblYxW2xheWVyLnR5cGVdKHZpc0NvbmZpZywgcGFyZW50cywgYWNjdW11bGF0ZWQpXG4gICAgICA6IHt9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZpc0NvbmZpZzoge1xuICAgICAgICAuLi52aXNDb25maWcsXG4gICAgICAgIC4uLm1vZGlmaWVkXG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgbGF5ZXJQcm9wc1YxID0ge1xuICBpZDogbnVsbCxcbiAgdHlwZTogbnVsbCxcbiAgY29uZmlnOiBuZXcgU2NoZW1hKHtcbiAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MSxcbiAgICBrZXk6ICdjb25maWcnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGRhdGFJZDogbnVsbCxcbiAgICAgIGxhYmVsOiBudWxsLFxuICAgICAgY29sb3I6IG51bGwsXG4gICAgICBjb2x1bW5zOiBuZXcgQ29sdW1uU2NoZW1hVjEoe1xuICAgICAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MSxcbiAgICAgICAga2V5OiAnY29sdW1ucydcbiAgICAgIH0pLFxuICAgICAgaXNWaXNpYmxlOiBudWxsLFxuICAgICAgdmlzQ29uZmlnOiBuZXcgVmlzQ29uZmlnU2NoZW1hVjEoe1xuICAgICAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MVxuICAgICAgfSksXG4gICAgICBoaWRkZW46IG51bGwsXG4gICAgICB0ZXh0TGFiZWw6IG5ldyBUZXh0TGFiZWxTY2hlbWFWMSh7XG4gICAgICAgIHZlcnNpb246IFZFUlNJT05TLnYxLFxuICAgICAgICBrZXk6ICd0ZXh0TGFiZWwnXG4gICAgICB9KVxuICAgIH1cbiAgfSksXG4gIHZpc3VhbENoYW5uZWxzOiBuZXcgVmlzdWFsQ2hhbm5lbFNjaGVtYVYxKHtcbiAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MSxcbiAgICBrZXk6ICd2aXN1YWxDaGFubmVscydcbiAgfSlcbn07XG5cbmNsYXNzIExheWVyU2NoZW1hVjAgZXh0ZW5kcyBTY2hlbWEge1xuICBrZXkgPSAnbGF5ZXJzJztcblxuICBzYXZlKGxheWVycywgcGFyZW50cykge1xuICAgIGNvbnN0IFt2aXNTdGF0ZV0gPSBwYXJlbnRzLnNsaWNlKC0xKTtcblxuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5rZXldOiB2aXNTdGF0ZS5sYXllck9yZGVyLnJlZHVjZSgoc2F2ZWQsIGluZGV4KSA9PiB7XG4gICAgICAgIC8vIHNhdmUgbGF5ZXJzIGFjY29yZGluZyB0byB0aGVpciByZW5kZXJpbmcgb3JkZXJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBsYXllcnNbaW5kZXhdO1xuICAgICAgICBpZiAobGF5ZXIuaXNWYWxpZFRvU2F2ZSgpKSB7XG4gICAgICAgICAgc2F2ZWQucHVzaCh0aGlzLnNhdmVQcm9wZXJ0aWVzT3JBcHBseVNjaGVtYShsYXllcikubGF5ZXJzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2F2ZWQ7XG4gICAgICB9LCBbXSlcbiAgICB9O1xuICB9XG5cbiAgbG9hZChsYXllcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgW3RoaXMua2V5XTogbGF5ZXJzLm1hcChsYXllciA9PiB0aGlzLmxvYWRQcm9wZXJ0aWVzT3JBcHBseVNjaGVtYShsYXllciwgbGF5ZXJzKS5sYXllcnMpXG4gICAgfTtcbiAgfVxufVxuXG5jbGFzcyBGaWx0ZXJTY2hlbWFWMCBleHRlbmRzIFNjaGVtYSB7XG4gIGtleSA9ICdmaWx0ZXJzJztcbiAgc2F2ZShmaWx0ZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbHRlcnM6IGZpbHRlcnNcbiAgICAgICAgLmZpbHRlcihpc1ZhbGlkRmlsdGVyVmFsdWUpXG4gICAgICAgIC5tYXAoZmlsdGVyID0+IHRoaXMuc2F2ZVByb3BlcnRpZXNPckFwcGx5U2NoZW1hKGZpbHRlcikuZmlsdGVycylcbiAgICB9O1xuICB9XG4gIGxvYWQoZmlsdGVycykge1xuICAgIHJldHVybiB7ZmlsdGVyc307XG4gIH1cbn1cblxuY29uc3QgaW50ZXJhY3Rpb25Qcm9wc1YwID0gWyd0b29sdGlwJywgJ2JydXNoJ107XG5cbmNsYXNzIEludGVyYWN0aW9uU2NoZW1hVjAgZXh0ZW5kcyBTY2hlbWEge1xuICBrZXkgPSAnaW50ZXJhY3Rpb25Db25maWcnO1xuXG4gIHNhdmUoaW50ZXJhY3Rpb25Db25maWcpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLnByb3BlcnRpZXMpXG4gICAgICA/IHtcbiAgICAgICAgICBbdGhpcy5rZXldOiB0aGlzLnByb3BlcnRpZXMucmVkdWNlKFxuICAgICAgICAgICAgKGFjY3UsIGtleSkgPT4gKHtcbiAgICAgICAgICAgICAgLi4uYWNjdSxcbiAgICAgICAgICAgICAgLi4uKGludGVyYWN0aW9uQ29uZmlnW2tleV0uZW5hYmxlZCA/IHtba2V5XTogaW50ZXJhY3Rpb25Db25maWdba2V5XS5jb25maWd9IDoge30pXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHt9XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICA6IHt9O1xuICB9XG4gIGxvYWQoaW50ZXJhY3Rpb25Db25maWcpIHtcbiAgICAvLyBjb252ZXJ0IHYwIC0+IHYxXG4gICAgLy8gcmV0dXJuIGVuYWJsZWQ6IGZhbHNlIGlmIGRpc2FibGVkLFxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMucHJvcGVydGllcylcbiAgICAgID8ge1xuICAgICAgICAgIFt0aGlzLmtleV06IHRoaXMucHJvcGVydGllcy5yZWR1Y2UoXG4gICAgICAgICAgICAoYWNjdSwga2V5KSA9PiAoe1xuICAgICAgICAgICAgICAuLi5hY2N1LFxuICAgICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgW2tleV06IHtcbiAgICAgICAgICAgICAgICAgIC4uLihpbnRlcmFjdGlvbkNvbmZpZ1trZXldIHx8IHt9KSxcbiAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IEJvb2xlYW4oaW50ZXJhY3Rpb25Db25maWdba2V5XSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAge31cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIDoge307XG4gIH1cbn1cblxuY29uc3QgaW50ZXJhY3Rpb25Qcm9wc1YxID0gWy4uLmludGVyYWN0aW9uUHJvcHNWMCwgJ2dlb2NvZGVyJywgJ2Nvb3JkaW5hdGUnXTtcblxuY2xhc3MgSW50ZXJhY3Rpb25TY2hlbWFWMSBleHRlbmRzIFNjaGVtYSB7XG4gIGtleSA9ICdpbnRlcmFjdGlvbkNvbmZpZyc7XG5cbiAgc2F2ZShpbnRlcmFjdGlvbkNvbmZpZykge1xuICAgIC8vIHNhdmUgY29uZmlnIGV2ZW4gaWYgZGlzYWJsZWQsXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgPyB7XG4gICAgICAgICAgW3RoaXMua2V5XTogdGhpcy5wcm9wZXJ0aWVzLnJlZHVjZShcbiAgICAgICAgICAgIChhY2N1LCBrZXkpID0+ICh7XG4gICAgICAgICAgICAgIC4uLmFjY3UsXG4gICAgICAgICAgICAgIFtrZXldOiB7XG4gICAgICAgICAgICAgICAgLi4uaW50ZXJhY3Rpb25Db25maWdba2V5XS5jb25maWcsXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogaW50ZXJhY3Rpb25Db25maWdba2V5XS5lbmFibGVkXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAge31cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIDoge307XG4gIH1cbiAgbG9hZChpbnRlcmFjdGlvbkNvbmZpZykge1xuICAgIGNvbnN0IG1vZGlmaWVkQ29uZmlnID0gaW50ZXJhY3Rpb25Db25maWc7XG4gICAgT2JqZWN0LmtleXMoaW50ZXJhY3Rpb25Db25maWcpLmZvckVhY2goY29uZmlnVHlwZSA9PiB7XG4gICAgICBpZiAoY29uZmlnVHlwZSA9PT0gJ3Rvb2x0aXAnKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkc1RvU2hvdyA9IG1vZGlmaWVkQ29uZmlnW2NvbmZpZ1R5cGVdLmZpZWxkc1RvU2hvdztcbiAgICAgICAgaWYgKCFub3ROdWxsb3JVbmRlZmluZWQoZmllbGRzVG9TaG93KSkge1xuICAgICAgICAgIHJldHVybiB7W3RoaXMua2V5XTogbW9kaWZpZWRDb25maWd9O1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKGZpZWxkc1RvU2hvdykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIGZpZWxkc1RvU2hvd1trZXldID0gZmllbGRzVG9TaG93W2tleV0ubWFwKGZpZWxkRGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpZWxkRGF0YS5uYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmFtZTogZmllbGREYXRhLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogbnVsbFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpZWxkRGF0YTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gICAgcmV0dXJuIHtbdGhpcy5rZXldOiBtb2RpZmllZENvbmZpZ307XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclByb3BzVjAgPSB7XG4gIGRhdGFJZDogbnVsbCxcbiAgaWQ6IG51bGwsXG4gIG5hbWU6IG51bGwsXG4gIHR5cGU6IG51bGwsXG4gIHZhbHVlOiBudWxsLFxuICBlbmxhcmdlZDogbnVsbFxufTtcblxuZXhwb3J0IGNsYXNzIERpbWVuc2lvbkZpZWxkU2NoZW1hIGV4dGVuZHMgU2NoZW1hIHtcbiAgc2F2ZShmaWVsZCkge1xuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy5rZXldOiBmaWVsZCA/IHRoaXMuc2F2ZVByb3BlcnRpZXNPckFwcGx5U2NoZW1hKGZpZWxkKVt0aGlzLmtleV0gOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGxvYWQoZmllbGQpIHtcbiAgICByZXR1cm4ge1t0aGlzLmtleV06IGZpZWxkfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3BsaXRNYXBzU2NoZW1hIGV4dGVuZHMgU2NoZW1hIHtcbiAgY29udmVydExheWVyU2V0dGluZ3MoYWNjdSwgW2tleSwgdmFsdWVdKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICBba2V5XTogdmFsdWVcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmlzQXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICBba2V5XTogQm9vbGVhbih2YWx1ZS5pc1Zpc2libGUpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gYWNjdTtcbiAgfVxuXG4gIGxvYWQoc3BsaXRNYXBzKSB7XG4gICAgLy8gcHJldmlvdXMgc3BsaXRNYXBzIFNjaGVtYSB7bGF5ZXJzOiB7bGF5ZXJJZDoge2lzVmlzaWJsZSwgaXNBdmFpbGFibGV9fX1cblxuICAgIGlmICghQXJyYXkuaXNBcnJheShzcGxpdE1hcHMpIHx8ICFzcGxpdE1hcHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge3NwbGl0TWFwczogW119O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzcGxpdE1hcHM6IHNwbGl0TWFwcy5tYXAoc2V0dGluZ3MgPT4gKHtcbiAgICAgICAgLi4uc2V0dGluZ3MsXG4gICAgICAgIGxheWVyczogT2JqZWN0LmVudHJpZXMoc2V0dGluZ3MubGF5ZXJzIHx8IHt9KS5yZWR1Y2UodGhpcy5jb252ZXJ0TGF5ZXJTZXR0aW5ncywge30pXG4gICAgICB9KSlcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJQcm9wc1YxID0ge1xuICAuLi5maWx0ZXJQcm9wc1YwLFxuICBwbG90VHlwZTogbnVsbCxcbiAgeUF4aXM6IG5ldyBEaW1lbnNpb25GaWVsZFNjaGVtYSh7XG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjEsXG4gICAga2V5OiAneUF4aXMnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG5hbWU6IG51bGwsXG4gICAgICB0eXBlOiBudWxsXG4gICAgfVxuICB9KSxcblxuICAvLyBwb2x5Z29uIGZpbHRlciBwcm9wZXJ0aWVzXG4gIGxheWVySWQ6IG51bGxcbn07XG5cbmV4cG9ydCBjb25zdCBwcm9wZXJ0aWVzVjAgPSB7XG4gIGZpbHRlcnM6IG5ldyBGaWx0ZXJTY2hlbWFWMCh7XG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjAsXG4gICAgcHJvcGVydGllczogZmlsdGVyUHJvcHNWMFxuICB9KSxcbiAgbGF5ZXJzOiBuZXcgTGF5ZXJTY2hlbWFWMCh7XG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjAsXG4gICAgcHJvcGVydGllczogbGF5ZXJQcm9wc1YwXG4gIH0pLFxuICBpbnRlcmFjdGlvbkNvbmZpZzogbmV3IEludGVyYWN0aW9uU2NoZW1hVjAoe1xuICAgIHZlcnNpb246IFZFUlNJT05TLnYwLFxuICAgIHByb3BlcnRpZXM6IGludGVyYWN0aW9uUHJvcHNWMFxuICB9KSxcbiAgbGF5ZXJCbGVuZGluZzogbnVsbFxufTtcblxuZXhwb3J0IGNvbnN0IHByb3BlcnRpZXNWMSA9IHtcbiAgZmlsdGVyczogbmV3IEZpbHRlclNjaGVtYVYwKHtcbiAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MSxcbiAgICBwcm9wZXJ0aWVzOiBmaWx0ZXJQcm9wc1YxXG4gIH0pLFxuICBsYXllcnM6IG5ldyBMYXllclNjaGVtYVYwKHtcbiAgICB2ZXJzaW9uOiBWRVJTSU9OUy52MSxcbiAgICBwcm9wZXJ0aWVzOiBsYXllclByb3BzVjFcbiAgfSksXG4gIGludGVyYWN0aW9uQ29uZmlnOiBuZXcgSW50ZXJhY3Rpb25TY2hlbWFWMSh7XG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjEsXG4gICAgcHJvcGVydGllczogaW50ZXJhY3Rpb25Qcm9wc1YxXG4gIH0pLFxuICBsYXllckJsZW5kaW5nOiBudWxsLFxuICBzcGxpdE1hcHM6IG5ldyBTcGxpdE1hcHNTY2hlbWEoe1xuICAgIGtleTogJ3NwbGl0TWFwcycsXG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjFcbiAgfSksXG4gIGFuaW1hdGlvbkNvbmZpZzogbmV3IFNjaGVtYSh7XG4gICAgdmVyc2lvbjogVkVSU0lPTlMudjEsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgY3VycmVudFRpbWU6IG51bGwsXG4gICAgICBzcGVlZDogbnVsbFxuICAgIH0sXG4gICAga2V5OiAnYW5pbWF0aW9uQ29uZmlnJ1xuICB9KVxufTtcblxuZXhwb3J0IGNvbnN0IHZpc1N0YXRlU2NoZW1hVjAgPSBuZXcgU2NoZW1hKHtcbiAgdmVyc2lvbjogVkVSU0lPTlMudjAsXG4gIHByb3BlcnRpZXM6IHByb3BlcnRpZXNWMCxcbiAga2V5OiAndmlzU3RhdGUnXG59KTtcblxuZXhwb3J0IGNvbnN0IHZpc1N0YXRlU2NoZW1hVjEgPSBuZXcgU2NoZW1hKHtcbiAgdmVyc2lvbjogVkVSU0lPTlMudjEsXG4gIHByb3BlcnRpZXM6IHByb3BlcnRpZXNWMSxcbiAga2V5OiAndmlzU3RhdGUnXG59KTtcblxuZXhwb3J0IGNvbnN0IHZpc1N0YXRlU2NoZW1hID0ge1xuICBbVkVSU0lPTlMudjBdOiB7XG4gICAgc2F2ZTogdG9TYXZlID0+IHZpc1N0YXRlU2NoZW1hVjAuc2F2ZSh0b1NhdmUpLFxuICAgIGxvYWQ6IHRvTG9hZCA9PiB2aXNTdGF0ZVNjaGVtYVYxLmxvYWQodmlzU3RhdGVTY2hlbWFWMC5sb2FkKHRvTG9hZCkudmlzU3RhdGUpXG4gIH0sXG4gIFtWRVJTSU9OUy52MV06IHZpc1N0YXRlU2NoZW1hVjFcbn07XG5cbi8vIHRlc3QgbG9hZCB2MFxuZXhwb3J0IGRlZmF1bHQgdmlzU3RhdGVTY2hlbWE7XG4iXX0=