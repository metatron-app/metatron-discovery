"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processCsvData = processCsvData;
exports.parseRowsByFields = parseRowsByFields;
exports.getSampleForTypeAnalyze = getSampleForTypeAnalyze;
exports.parseCsvRowsByFieldType = parseCsvRowsByFieldType;
exports.getFieldsFromData = getFieldsFromData;
exports.renameDuplicateFields = renameDuplicateFields;
exports.analyzerTypeToFieldType = analyzerTypeToFieldType;
exports.processRowObject = processRowObject;
exports.processGeojson = processGeojson;
exports.formatCsv = formatCsv;
exports.validateInputData = validateInputData;
exports.processKeplerglJSON = processKeplerglJSON;
exports.processKeplerglDataset = processKeplerglDataset;
exports.Processors = exports.DATASET_HANDLERS = exports.PARSE_FIELD_VALUE_FROM_STRING = exports.CSV_NULLS = exports.ACCEPTED_ANALYZER_TYPES = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _d3Dsv = require("d3-dsv");

var _d3Array = require("d3-array");

var _window = require("global/window");

var _assert = _interopRequireDefault(require("assert"));

var _typeAnalyzer = require("type-analyzer");

var _geojsonNormalize = _interopRequireDefault(require("@mapbox/geojson-normalize"));

var _defaultSettings = require("../constants/default-settings");

var _dataUtils = require("../utils/data-utils");

var _schemas = _interopRequireDefault(require("../schemas"));

var _userGuides = require("../constants/user-guides");

var _utils = require("../utils/utils");

var _PARSE_FIELD_VALUE_FR, _DATASET_HANDLERS;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ACCEPTED_ANALYZER_TYPES = [_typeAnalyzer.DATA_TYPES.DATE, _typeAnalyzer.DATA_TYPES.TIME, _typeAnalyzer.DATA_TYPES.DATETIME, _typeAnalyzer.DATA_TYPES.NUMBER, _typeAnalyzer.DATA_TYPES.INT, _typeAnalyzer.DATA_TYPES.FLOAT, _typeAnalyzer.DATA_TYPES.BOOLEAN, _typeAnalyzer.DATA_TYPES.STRING, _typeAnalyzer.DATA_TYPES.GEOMETRY, _typeAnalyzer.DATA_TYPES.GEOMETRY_FROM_STRING, _typeAnalyzer.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING, _typeAnalyzer.DATA_TYPES.ZIPCODE, _typeAnalyzer.DATA_TYPES.ARRAY, _typeAnalyzer.DATA_TYPES.OBJECT]; // if any of these value occurs in csv, parse it to null;
// const CSV_NULLS = ['', 'null', 'NULL', 'Null', 'NaN', '/N'];
// matches empty string

exports.ACCEPTED_ANALYZER_TYPES = ACCEPTED_ANALYZER_TYPES;
var CSV_NULLS = /^(null|NULL|Null|NaN|\/N||)$/;
exports.CSV_NULLS = CSV_NULLS;
var IGNORE_DATA_TYPES = Object.keys(_typeAnalyzer.DATA_TYPES).filter(function (type) {
  return !ACCEPTED_ANALYZER_TYPES.includes(type);
});
var PARSE_FIELD_VALUE_FROM_STRING = (_PARSE_FIELD_VALUE_FR = {}, (0, _defineProperty2["default"])(_PARSE_FIELD_VALUE_FR, _defaultSettings.ALL_FIELD_TYPES["boolean"], {
  valid: function valid(d) {
    return typeof d === 'boolean';
  },
  parse: function parse(d) {
    return d === 'true' || d === 'True' || d === '1';
  }
}), (0, _defineProperty2["default"])(_PARSE_FIELD_VALUE_FR, _defaultSettings.ALL_FIELD_TYPES.integer, {
  valid: function valid(d) {
    return parseInt(d, 10) === d;
  },
  parse: function parse(d) {
    return parseInt(d, 10);
  }
}), (0, _defineProperty2["default"])(_PARSE_FIELD_VALUE_FR, _defaultSettings.ALL_FIELD_TYPES.timestamp, {
  valid: function valid(d, field) {
    return ['x', 'X'].includes(field.format) ? typeof d === 'number' : typeof d === 'string';
  },
  parse: function parse(d, field) {
    return ['x', 'X'].includes(field.format) ? Number(d) : d;
  }
}), (0, _defineProperty2["default"])(_PARSE_FIELD_VALUE_FR, _defaultSettings.ALL_FIELD_TYPES.real, {
  valid: function valid(d) {
    return parseFloat(d) === d;
  },
  // Note this will result in NaN for some string
  parse: parseFloat
}), _PARSE_FIELD_VALUE_FR);
/**
 * Process csv data, output a data object with `{fields: [], rows: []}`.
 * The data object can be wrapped in a `dataset` and pass to [`addDataToMap`](../actions/actions.md#adddatatomap)
 * @param rawData raw csv string
 * @returns  data object `{fields: [], rows: []}` can be passed to addDataToMaps
 * @type {typeof import('./data-processor').processCsvData}
 * @public
 * @example
 * import {processCsvData} from 'kepler.gl/processors';
 *
 * const testData = `gps_data.utc_timestamp,gps_data.lat,gps_data.lng,gps_data.types,epoch,has_result,id,time,begintrip_ts_utc,begintrip_ts_local,date
 * 2016-09-17 00:09:55,29.9900937,31.2590542,driver_analytics,1472688000000,False,1,2016-09-23T00:00:00.000Z,2016-10-01 09:41:39+00:00,2016-10-01 09:41:39+00:00,2016-09-23
 * 2016-09-17 00:10:56,29.9927699,31.2461142,driver_analytics,1472688000000,False,2,2016-09-23T00:00:00.000Z,2016-10-01 09:46:37+00:00,2016-10-01 16:46:37+00:00,2016-09-23
 * 2016-09-17 00:11:56,29.9907261,31.2312742,driver_analytics,1472688000000,False,3,2016-09-23T00:00:00.000Z,,,2016-09-23
 * 2016-09-17 00:12:58,29.9870074,31.2175827,driver_analytics,1472688000000,False,4,2016-09-23T00:00:00.000Z,,,2016-09-23`
 *
 * const dataset = {
 *  info: {id: 'test_data', label: 'My Csv'},
 *  data: processCsvData(testData)
 * };
 *
 * dispatch(addDataToMap({
 *  datasets: [dataset],
 *  options: {centerMap: true, readOnly: true}
 * }));
 */

exports.PARSE_FIELD_VALUE_FROM_STRING = PARSE_FIELD_VALUE_FROM_STRING;

function processCsvData(rawData, header) {
  var rows;
  var headerRow;

  if (typeof rawData === 'string') {
    var _parsedRows = (0, _d3Dsv.csvParseRows)(rawData);

    if (!Array.isArray(_parsedRows) || _parsedRows.length < 2) {
      // looks like an empty file, throw error to be catch
      throw new Error('process Csv Data Failed: CSV is empty');
    }

    headerRow = _parsedRows[0];
    rows = _parsedRows.slice(1);
  } else if (Array.isArray(rawData) && rawData.length) {
    rows = rawData;
    headerRow = header;

    if (!Array.isArray(headerRow)) {
      // if data is passed in as array of rows and missing header
      // assume first row is header
      headerRow = rawData[0];
      rows = rawData.slice(1);
    }
  }

  if (!rows || !headerRow) {
    throw new Error('invalid input passed to processCsvData');
  } // here we assume the csv file that people uploaded will have first row
  // as name of the column


  cleanUpFalsyCsvValue(rows); // No need to run type detection on every data point
  // here we get a list of none null values to run analyze on

  var sample = getSampleForTypeAnalyze({
    fields: headerRow,
    allData: rows
  });
  var fields = getFieldsFromData(sample, headerRow);
  var parsedRows = parseRowsByFields(rows, fields);
  return {
    fields: fields,
    rows: parsedRows
  };
}
/**
 * Parse rows of csv by analyzed field types. So that `'1'` -> `1`, `'True'` -> `true`
 * @param {Array<Array>} rows
 * @param {Array<Object>} fields
 */


function parseRowsByFields(rows, fields) {
  // Edit rows in place
  var geojsonFieldIdx = fields.findIndex(function (f) {
    return f.name === '_geojson';
  });
  fields.forEach(parseCsvRowsByFieldType.bind(null, rows, geojsonFieldIdx));
  return rows;
}
/**
 * Getting sample data for analyzing field type.
 *
 * @type {typeof import('./data-processor').getSampleForTypeAnalyze}
 */


function getSampleForTypeAnalyze(_ref) {
  var fields = _ref.fields,
      allData = _ref.allData,
      _ref$sampleCount = _ref.sampleCount,
      sampleCount = _ref$sampleCount === void 0 ? 50 : _ref$sampleCount;
  var total = Math.min(sampleCount, allData.length); // const fieldOrder = fields.map(f => f.name);

  var sample = (0, _d3Array.range)(0, total, 1).map(function (d) {
    return {};
  }); // collect sample data for each field

  fields.forEach(function (field, fieldIdx) {
    // data counter
    var i = 0; // sample counter

    var j = 0;

    while (j < total) {
      if (i >= allData.length) {
        // if depleted data pool
        sample[j][field] = null;
        j++;
      } else if ((0, _dataUtils.notNullorUndefined)(allData[i][fieldIdx])) {
        sample[j][field] = allData[i][fieldIdx];
        j++;
        i++;
      } else {
        i++;
      }
    }
  });
  return sample;
}
/**
 * Convert falsy value in csv including `'', 'null', 'NULL', 'Null', 'NaN'` to `null`,
 * so that type-analyzer won't detect it as string
 *
 * @param {Array<Array>} rows
 */


function cleanUpFalsyCsvValue(rows) {
  var re = new RegExp(CSV_NULLS, 'g');

  for (var i = 0; i < rows.length; i++) {
    for (var j = 0; j < rows[i].length; j++) {
      // analyzer will set any fields to 'string' if there are empty values
      // which will be parsed as '' by d3.csv
      // here we parse empty data as null
      // TODO: create warning when deltect `CSV_NULLS` in the data
      if (typeof rows[i][j] === 'string' && rows[i][j].match(re)) {
        rows[i][j] = null;
      }
    }
  }
}
/**
 * Process uploaded csv file to parse value by field type
 *
 * @param rows
 * @param geoFieldIdx field index
 * @param field
 * @param i
 * @type {typeof import('./data-processor').parseCsvRowsByFieldType}
 */


function parseCsvRowsByFieldType(rows, geoFieldIdx, field, i) {
  var parser = PARSE_FIELD_VALUE_FROM_STRING[field.type];

  if (parser) {
    // check first not null value of it's already parsed
    var first = rows.find(function (r) {
      return (0, _dataUtils.notNullorUndefined)(r[i]);
    });

    if (!first || parser.valid(first[i], field)) {
      return;
    }

    rows.forEach(function (row) {
      // parse string value based on field type
      if (row[i] !== null) {
        row[i] = parser.parse(row[i], field);

        if (geoFieldIdx > -1 && row[geoFieldIdx] && row[geoFieldIdx].properties) {
          row[geoFieldIdx].properties[field.name] = row[i];
        }
      }
    });
  }
}
/**
 * Analyze field types from data in `string` format, e.g. uploaded csv.
 * Assign `type`, `tableFieldIndex` and `format` (timestamp only) to each field
 *
 * @param data array of row object
 * @param fieldOrder array of field names as string
 * @returns formatted fields
 * @type {typeof import('./data-processor').getFieldsFromData}
 * @public
 * @example
 *
 * import {getFieldsFromData} from 'kepler.gl/processors';
 * const data = [{
 *   time: '2016-09-17 00:09:55',
 *   value: '4',
 *   surge: '1.2',
 *   isTrip: 'true',
 *   zeroOnes: '0'
 * }, {
 *   time: '2016-09-17 00:30:08',
 *   value: '3',
 *   surge: null,
 *   isTrip: 'false',
 *   zeroOnes: '1'
 * }, {
 *   time: null,
 *   value: '2',
 *   surge: '1.3',
 *   isTrip: null,
 *   zeroOnes: '1'
 * }];
 *
 * const fieldOrder = ['time', 'value', 'surge', 'isTrip', 'zeroOnes'];
 * const fields = getFieldsFromData(data, fieldOrder);
 * // fields = [
 * // {name: 'time', format: 'YYYY-M-D H:m:s', tableFieldIndex: 1, type: 'timestamp'},
 * // {name: 'value', format: '', tableFieldIndex: 4, type: 'integer'},
 * // {name: 'surge', format: '', tableFieldIndex: 5, type: 'real'},
 * // {name: 'isTrip', format: '', tableFieldIndex: 6, type: 'boolean'},
 * // {name: 'zeroOnes', format: '', tableFieldIndex: 7, type: 'integer'}];
 *
 */


function getFieldsFromData(data, fieldOrder) {
  // add a check for epoch timestamp
  var metadata = _typeAnalyzer.Analyzer.computeColMeta(data, [{
    regex: /.*geojson|all_points/g,
    dataType: 'GEOMETRY'
  }], {
    ignoredDataTypes: IGNORE_DATA_TYPES
  });

  var _renameDuplicateField = renameDuplicateFields(fieldOrder),
      fieldByIndex = _renameDuplicateField.fieldByIndex;

  var result = fieldOrder.map(function (field, index) {
    var name = fieldByIndex[index];
    var fieldMeta = metadata.find(function (m) {
      return m.key === field;
    });

    var _ref2 = fieldMeta || {},
        type = _ref2.type,
        format = _ref2.format;

    return {
      name: name,
      format: format,
      tableFieldIndex: index + 1,
      type: analyzerTypeToFieldType(type),
      analyzerType: type
    };
  });
  return result;
}
/**
 * pass in an array of field names, rename duplicated one
 * and return a map from old field index to new name
 *
 * @param {Array} fieldOrder
 * @returns {Object} new field name by index
 */


function renameDuplicateFields(fieldOrder) {
  return fieldOrder.reduce(function (accu, field, i) {
    var allNames = accu.allNames;
    var fieldName = field; // add a counter to duplicated names

    if (allNames.includes(field)) {
      var counter = 0;

      while (allNames.includes("".concat(field, "-").concat(counter))) {
        counter++;
      }

      fieldName = "".concat(field, "-").concat(counter);
    }

    accu.fieldByIndex[i] = fieldName;
    accu.allNames.push(fieldName);
    return accu;
  }, {
    allNames: [],
    fieldByIndex: {}
  });
}
/**
 * Convert type-analyzer output to kepler.gl field types
 *
 * @param aType
 * @returns corresponding type in `ALL_FIELD_TYPES`
 * @type {typeof import('./data-processor').analyzerTypeToFieldType}}
 */

/* eslint-disable complexity */


function analyzerTypeToFieldType(aType) {
  var DATE = _typeAnalyzer.DATA_TYPES.DATE,
      TIME = _typeAnalyzer.DATA_TYPES.TIME,
      DATETIME = _typeAnalyzer.DATA_TYPES.DATETIME,
      NUMBER = _typeAnalyzer.DATA_TYPES.NUMBER,
      INT = _typeAnalyzer.DATA_TYPES.INT,
      FLOAT = _typeAnalyzer.DATA_TYPES.FLOAT,
      BOOLEAN = _typeAnalyzer.DATA_TYPES.BOOLEAN,
      STRING = _typeAnalyzer.DATA_TYPES.STRING,
      GEOMETRY = _typeAnalyzer.DATA_TYPES.GEOMETRY,
      GEOMETRY_FROM_STRING = _typeAnalyzer.DATA_TYPES.GEOMETRY_FROM_STRING,
      PAIR_GEOMETRY_FROM_STRING = _typeAnalyzer.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING,
      ZIPCODE = _typeAnalyzer.DATA_TYPES.ZIPCODE,
      ARRAY = _typeAnalyzer.DATA_TYPES.ARRAY,
      OBJECT = _typeAnalyzer.DATA_TYPES.OBJECT; // TODO: un recognized types
  // CURRENCY PERCENT NONE

  switch (aType) {
    case DATE:
      return _defaultSettings.ALL_FIELD_TYPES.date;

    case TIME:
    case DATETIME:
      return _defaultSettings.ALL_FIELD_TYPES.timestamp;

    case FLOAT:
      return _defaultSettings.ALL_FIELD_TYPES.real;

    case INT:
      return _defaultSettings.ALL_FIELD_TYPES.integer;

    case BOOLEAN:
      return _defaultSettings.ALL_FIELD_TYPES["boolean"];

    case GEOMETRY:
    case GEOMETRY_FROM_STRING:
    case PAIR_GEOMETRY_FROM_STRING:
    case ARRAY:
    case OBJECT:
      // TODO: create a new data type for objects and arrays
      return _defaultSettings.ALL_FIELD_TYPES.geojson;

    case NUMBER:
    case STRING:
    case ZIPCODE:
      return _defaultSettings.ALL_FIELD_TYPES.string;

    default:
      _window.console.warn("Unsupported analyzer type: ".concat(aType));

      return _defaultSettings.ALL_FIELD_TYPES.string;
  }
}
/* eslint-enable complexity */

/**
 * Process data where each row is an object, output can be passed to [`addDataToMap`](../actions/actions.md#adddatatomap)
 * @param rawData an array of row object, each object should have the same number of keys
 * @returns dataset containing `fields` and `rows`
 * @type {typeof import('./data-processor').processRowObject}
 * @public
 * @example
 * import {addDataToMap} from 'kepler.gl/actions';
 * import {processRowObject} from 'kepler.gl/processors';
 *
 * const data = [
 *  {lat: 31.27, lng: 127.56, value: 3},
 *  {lat: 31.22, lng: 126.26, value: 1}
 * ];
 *
 * dispatch(addDataToMap({
 *  datasets: {
 *    info: {label: 'My Data', id: 'my_data'},
 *    data: processRowObject(data)
 *  }
 * }));
 */


function processRowObject(rawData) {
  if (!Array.isArray(rawData) || !rawData.length) {
    return null;
  }

  var keys = Object.keys(rawData[0]);
  var rows = rawData.map(function (d) {
    return keys.map(function (key) {
      return d[key];
    });
  }); // row object an still contain values like `Null` or `N/A`

  cleanUpFalsyCsvValue(rows);
  return processCsvData(rows, keys);
}
/**
 * Process GeoJSON [`FeatureCollection`](http://wiki.geojson.org/GeoJSON_draft_version_6#FeatureCollection),
 * output a data object with `{fields: [], rows: []}`.
 * The data object can be wrapped in a `dataset` and pass to [`addDataToMap`](../actions/actions.md#adddatatomap)
 *
 * @param  rawData raw geojson feature collection
 * @returns  dataset containing `fields` and `rows`
 * @type {typeof import('./data-processor').processGeojson}
 * @public
 * @example
 * import {addDataToMap} from 'kepler.gl/actions';
 * import {processGeojson} from 'kepler.gl/processors';
 *
 * const geojson = {
 * 	"type" : "FeatureCollection",
 * 	"features" : [{
 * 		"type" : "Feature",
 * 		"properties" : {
 * 			"capacity" : "10",
 * 			"type" : "U-Rack"
 * 		},
 * 		"geometry" : {
 * 			"type" : "Point",
 * 			"coordinates" : [ -71.073283, 42.417500 ]
 * 		}
 * 	}]
 * };
 *
 * dispatch(addDataToMap({
 *  datasets: {
 *    info: {
 *      label: 'Sample Taxi Trips in New York City',
 *      id: 'test_trip_data'
 *    },
 *    data: processGeojson(geojson)
 *  }
 * }));
 */


function processGeojson(rawData) {
  var normalizedGeojson = (0, _geojsonNormalize["default"])(rawData);

  if (!normalizedGeojson || !Array.isArray(normalizedGeojson.features)) {
    var error = new Error("Read File Failed: File is not a valid GeoJSON. Read more about [supported file format](".concat(_userGuides.GUIDES_FILE_FORMAT_DOC, ")"));
    throw error; // fail to normalize geojson
  } // getting all feature fields


  var allDataRows = [];

  for (var i = 0; i < normalizedGeojson.features.length; i++) {
    var f = normalizedGeojson.features[i];

    if (f.geometry) {
      allDataRows.push(_objectSpread({
        // add feature to _geojson field
        _geojson: f
      }, f.properties || {}));
    }
  } // get all the field


  var fields = allDataRows.reduce(function (prev, curr) {
    Object.keys(curr).forEach(function (key) {
      if (!prev.includes(key)) {
        prev.push(key);
      }
    });
    return prev;
  }, []); // make sure each feature has exact same fields

  allDataRows.forEach(function (d) {
    fields.forEach(function (f) {
      if (!(f in d)) {
        d[f] = null;
        d._geojson.properties[f] = null;
      }
    });
  });
  return processRowObject(allDataRows);
}
/**
 * On export data to csv
 * @param {Array<Array>} data `dataset.allData` or filtered data `dataset.data`
 * @param {Array<Object>} fields `dataset.fields`
 * @returns {string} csv string
 */


function formatCsv(data, fields) {
  var columns = fields.map(function (f) {
    return f.name;
  });
  var formattedData = [columns]; // parse geojson object as string

  data.forEach(function (row) {
    formattedData.push(row.map(function (d, i) {
      return (0, _dataUtils.parseFieldValue)(d, fields[i].type);
    }));
  });
  return (0, _d3Dsv.csvFormatRows)(formattedData);
}
/**
 * Validate input data, adding missing field types, rename duplicate columns
 * @type {typeof import('./data-processor').validateInputData}
 */


function validateInputData(data) {
  if (!(0, _utils.isPlainObject)(data)) {
    (0, _assert["default"])('addDataToMap Error: dataset.data cannot be null');
    return null;
  } else if (!Array.isArray(data.fields)) {
    (0, _assert["default"])('addDataToMap Error: expect dataset.data.fields to be an array');
    return null;
  } else if (!Array.isArray(data.rows)) {
    (0, _assert["default"])('addDataToMap Error: expect dataset.data.rows to be an array');
    return null;
  }

  var fields = data.fields,
      rows = data.rows; // check if all fields has name, format and type

  var allValid = fields.every(function (f, i) {
    if (!(0, _utils.isPlainObject)(f)) {
      (0, _assert["default"])("fields needs to be an array of object, but find ".concat((0, _typeof2["default"])(f)));
      fields[i] = {};
    }

    if (!f.name) {
      (0, _assert["default"])("field.name is required but missing in ".concat(JSON.stringify(f))); // assign a name

      fields[i].name = "column_".concat(i);
    }

    if (!_defaultSettings.ALL_FIELD_TYPES[f.type]) {
      (0, _assert["default"])("unknown field type ".concat(f.type));
      return false;
    }

    if (!fields.every(function (field) {
      return field.analyzerType;
    })) {
      (0, _assert["default"])('field missing analyzerType');
      return false;
    } // check time format is correct based on first 10 not empty element


    if (f.type === _defaultSettings.ALL_FIELD_TYPES.timestamp) {
      var sample = findNonEmptyRowsAtField(rows, i, 10).map(function (r) {
        return {
          ts: r[i]
        };
      });

      var analyzedType = _typeAnalyzer.Analyzer.computeColMeta(sample)[0];

      return analyzedType.category === 'TIME' && analyzedType.format === f.format;
    }

    return true;
  });

  if (allValid) {
    return {
      rows: rows,
      fields: fields
    };
  } // if any field has missing type, recalculate it for everyone
  // because we simply lost faith in humanity


  var sampleData = getSampleForTypeAnalyze({
    fields: fields.map(function (f) {
      return f.name;
    }),
    allData: rows
  });
  var fieldOrder = fields.map(function (f) {
    return f.name;
  });
  var meta = getFieldsFromData(sampleData, fieldOrder);
  var updatedFields = fields.map(function (f, i) {
    return _objectSpread(_objectSpread({}, f), {}, {
      type: meta[i].type,
      format: meta[i].format,
      analyzerType: meta[i].analyzerType
    });
  });
  return {
    fields: updatedFields,
    rows: rows
  };
}

function findNonEmptyRowsAtField(rows, fieldIdx, total) {
  var sample = [];
  var i = 0;

  while (sample.length < total && i < rows.length) {
    if ((0, _dataUtils.notNullorUndefined)(rows[i][fieldIdx])) {
      sample.push(rows[i]);
    }

    i++;
  }

  return sample;
}
/**
 * Process saved kepler.gl json to be pass to [`addDataToMap`](../actions/actions.md#adddatatomap).
 * The json object should contain `datasets` and `config`.
 * @param {Object} rawData
 * @param {Array} rawData.datasets
 * @param {Object} rawData.config
 * @returns {Object} datasets and config `{datasets: {}, config: {}}`
 * @public
 * @example
 * import {addDataToMap} from 'kepler.gl/actions';
 * import {processKeplerglJSON} from 'kepler.gl/processors';
 *
 * dispatch(addDataToMap(processKeplerglJSON(keplerGlJson)));
 */


function processKeplerglJSON(rawData) {
  return rawData ? _schemas["default"].load(rawData.datasets, rawData.config) : null;
}
/**
 * Parse a single or an array of datasets saved using kepler.gl schema
 * @param {Array | Array<Object>} rawData
 */


function processKeplerglDataset(rawData) {
  if (!rawData) {
    return null;
  }

  var results = _schemas["default"].parseSavedData((0, _utils.toArray)(rawData));

  if (!results) {
    return null;
  }

  return Array.isArray(rawData) ? results : results[0];
}

var DATASET_HANDLERS = (_DATASET_HANDLERS = {}, (0, _defineProperty2["default"])(_DATASET_HANDLERS, _defaultSettings.DATASET_FORMATS.row, processRowObject), (0, _defineProperty2["default"])(_DATASET_HANDLERS, _defaultSettings.DATASET_FORMATS.geojson, processGeojson), (0, _defineProperty2["default"])(_DATASET_HANDLERS, _defaultSettings.DATASET_FORMATS.csv, processCsvData), (0, _defineProperty2["default"])(_DATASET_HANDLERS, _defaultSettings.DATASET_FORMATS.keplergl, processKeplerglDataset), _DATASET_HANDLERS);
exports.DATASET_HANDLERS = DATASET_HANDLERS;
var Processors = {
  processGeojson: processGeojson,
  processCsvData: processCsvData,
  processRowObject: processRowObject,
  processKeplerglJSON: processKeplerglJSON,
  processKeplerglDataset: processKeplerglDataset,
  analyzerTypeToFieldType: analyzerTypeToFieldType,
  getFieldsFromData: getFieldsFromData,
  parseCsvRowsByFieldType: parseCsvRowsByFieldType,
  formatCsv: formatCsv
};
exports.Processors = Processors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzb3JzL2RhdGEtcHJvY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFDQ0VQVEVEX0FOQUxZWkVSX1RZUEVTIiwiQW5hbHl6ZXJEQVRBX1RZUEVTIiwiREFURSIsIlRJTUUiLCJEQVRFVElNRSIsIk5VTUJFUiIsIklOVCIsIkZMT0FUIiwiQk9PTEVBTiIsIlNUUklORyIsIkdFT01FVFJZIiwiR0VPTUVUUllfRlJPTV9TVFJJTkciLCJQQUlSX0dFT01FVFJZX0ZST01fU1RSSU5HIiwiWklQQ09ERSIsIkFSUkFZIiwiT0JKRUNUIiwiQ1NWX05VTExTIiwiSUdOT1JFX0RBVEFfVFlQRVMiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwidHlwZSIsImluY2x1ZGVzIiwiUEFSU0VfRklFTERfVkFMVUVfRlJPTV9TVFJJTkciLCJBTExfRklFTERfVFlQRVMiLCJ2YWxpZCIsImQiLCJwYXJzZSIsImludGVnZXIiLCJwYXJzZUludCIsInRpbWVzdGFtcCIsImZpZWxkIiwiZm9ybWF0IiwiTnVtYmVyIiwicmVhbCIsInBhcnNlRmxvYXQiLCJwcm9jZXNzQ3N2RGF0YSIsInJhd0RhdGEiLCJoZWFkZXIiLCJyb3dzIiwiaGVhZGVyUm93IiwicGFyc2VkUm93cyIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIkVycm9yIiwic2xpY2UiLCJjbGVhblVwRmFsc3lDc3ZWYWx1ZSIsInNhbXBsZSIsImdldFNhbXBsZUZvclR5cGVBbmFseXplIiwiZmllbGRzIiwiYWxsRGF0YSIsImdldEZpZWxkc0Zyb21EYXRhIiwicGFyc2VSb3dzQnlGaWVsZHMiLCJnZW9qc29uRmllbGRJZHgiLCJmaW5kSW5kZXgiLCJmIiwibmFtZSIsImZvckVhY2giLCJwYXJzZUNzdlJvd3NCeUZpZWxkVHlwZSIsImJpbmQiLCJzYW1wbGVDb3VudCIsInRvdGFsIiwiTWF0aCIsIm1pbiIsIm1hcCIsImZpZWxkSWR4IiwiaSIsImoiLCJyZSIsIlJlZ0V4cCIsIm1hdGNoIiwiZ2VvRmllbGRJZHgiLCJwYXJzZXIiLCJmaXJzdCIsImZpbmQiLCJyIiwicm93IiwicHJvcGVydGllcyIsImRhdGEiLCJmaWVsZE9yZGVyIiwibWV0YWRhdGEiLCJBbmFseXplciIsImNvbXB1dGVDb2xNZXRhIiwicmVnZXgiLCJkYXRhVHlwZSIsImlnbm9yZWREYXRhVHlwZXMiLCJyZW5hbWVEdXBsaWNhdGVGaWVsZHMiLCJmaWVsZEJ5SW5kZXgiLCJyZXN1bHQiLCJpbmRleCIsImZpZWxkTWV0YSIsIm0iLCJrZXkiLCJ0YWJsZUZpZWxkSW5kZXgiLCJhbmFseXplclR5cGVUb0ZpZWxkVHlwZSIsImFuYWx5emVyVHlwZSIsInJlZHVjZSIsImFjY3UiLCJhbGxOYW1lcyIsImZpZWxkTmFtZSIsImNvdW50ZXIiLCJwdXNoIiwiYVR5cGUiLCJkYXRlIiwiZ2VvanNvbiIsInN0cmluZyIsImdsb2JhbENvbnNvbGUiLCJ3YXJuIiwicHJvY2Vzc1Jvd09iamVjdCIsInByb2Nlc3NHZW9qc29uIiwibm9ybWFsaXplZEdlb2pzb24iLCJmZWF0dXJlcyIsImVycm9yIiwiR1VJREVTX0ZJTEVfRk9STUFUX0RPQyIsImFsbERhdGFSb3dzIiwiZ2VvbWV0cnkiLCJfZ2VvanNvbiIsInByZXYiLCJjdXJyIiwiZm9ybWF0Q3N2IiwiY29sdW1ucyIsImZvcm1hdHRlZERhdGEiLCJ2YWxpZGF0ZUlucHV0RGF0YSIsImFsbFZhbGlkIiwiZXZlcnkiLCJKU09OIiwic3RyaW5naWZ5IiwiZmluZE5vbkVtcHR5Um93c0F0RmllbGQiLCJ0cyIsImFuYWx5emVkVHlwZSIsImNhdGVnb3J5Iiwic2FtcGxlRGF0YSIsIm1ldGEiLCJ1cGRhdGVkRmllbGRzIiwicHJvY2Vzc0tlcGxlcmdsSlNPTiIsIktlcGxlckdsU2NoZW1hIiwibG9hZCIsImRhdGFzZXRzIiwiY29uZmlnIiwicHJvY2Vzc0tlcGxlcmdsRGF0YXNldCIsInJlc3VsdHMiLCJwYXJzZVNhdmVkRGF0YSIsIkRBVEFTRVRfSEFORExFUlMiLCJEQVRBU0VUX0ZPUk1BVFMiLCJj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RUQ7Ozs7OztBQUlPLFNBQVNDLHNCQUFULENBQWdDdkcsT0FBaEMsRUFBeUM7QUFDOUMsTUFBSSxDQUFDQSxPQUFMLEVBQWM7QUFDWixXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFNd0csT0FBTyxHQUFHTCxvQkFBZU0sY0FBZixDQUE4QixvQkFBUXpHLE9BQVIsQ0FBOUIsQ0FBaEI7O0FBQ0EsTUFBSSxDQUFDd0csT0FBTCxFQUFjO0FBQ1osV0FBTyxJQUFQO0FBQ0Q7O0FBQ0QsU0FBT25HLEtBQUssQ0FBQ0MsT0FBTixDQUFjTixPQUFkLElBQXlCd0csT0FBekIsR0FBbUNBLE9BQU8sQ0FBQyxDQUFELENBQWpEO0FBQ0Q7O0FBRU0sSUFBTUUsZ0JBQWdCLGdGQUMxQkMsaUNBQWdCbkUsR0FEVSxFQUNKZ0MsZ0JBREksdURBRTFCbUMsaUNBQWdCdkMsT0FGVSxFQUVBSyxjQUZBLHVEQUcxQmtDLGlDQUFnQkMsR0FIVSxFQUdKN0csY0FISSx1REFJMUI0RyxpQ0FBZ0JFLFFBSlUsRUFJQ04sc0JBSkQscUJBQXRCOztBQU9BLElBQU1PLFVBQVUsR0FBRztBQUN4QnJDLEVBQUFBLGNBQWMsRUFBZEEsY0FEd0I7QUFFeEIxRSxFQUFBQSxjQUFjLEVBQWRBLGNBRndCO0FBR3hCeUUsRUFBQUEsZ0JBQWdCLEVBQWhCQSxnQkFId0I7QUFJeEIwQixFQUFBQSxtQkFBbUIsRUFBbkJBLG1CQUp3QjtBQUt4QkssRUFBQUEsc0JBQXNCLEVBQXRCQSxzQkFMd0I7QUFNeEI3QyxFQUFBQSx1QkFBdUIsRUFBdkJBLHVCQU53QjtBQU94QjNDLEVBQUFBLGlCQUFpQixFQUFqQkEsaUJBUHdCO0FBUXhCTyxFQUFBQSx1QkFBdUIsRUFBdkJBLHVCQVJ3QjtBQVN4QjZELEVBQUFBLFNBQVMsRUFBVEE7QUFUd0IsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NzdlBhcnNlUm93cywgY3N2Rm9ybWF0Um93c30gZnJvbSAnZDMtZHN2JztcbmltcG9ydCB7cmFuZ2V9IGZyb20gJ2QzLWFycmF5JztcbmltcG9ydCB7Y29uc29sZSBhcyBnbG9iYWxDb25zb2xlfSBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7QW5hbHl6ZXIsIERBVEFfVFlQRVMgYXMgQW5hbHl6ZXJEQVRBX1RZUEVTfSBmcm9tICd0eXBlLWFuYWx5emVyJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnQG1hcGJveC9nZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge0FMTF9GSUVMRF9UWVBFUywgREFUQVNFVF9GT1JNQVRTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5pbXBvcnQge25vdE51bGxvclVuZGVmaW5lZCwgcGFyc2VGaWVsZFZhbHVlfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCBLZXBsZXJHbFNjaGVtYSBmcm9tICdzY2hlbWFzJztcbmltcG9ydCB7R1VJREVTX0ZJTEVfRk9STUFUX0RPQ30gZnJvbSAnY29uc3RhbnRzL3VzZXItZ3VpZGVzJztcbmltcG9ydCB7aXNQbGFpbk9iamVjdCwgdG9BcnJheX0gZnJvbSAndXRpbHMvdXRpbHMnO1xuXG5leHBvcnQgY29uc3QgQUNDRVBURURfQU5BTFlaRVJfVFlQRVMgPSBbXG4gIEFuYWx5emVyREFUQV9UWVBFUy5EQVRFLFxuICBBbmFseXplckRBVEFfVFlQRVMuVElNRSxcbiAgQW5hbHl6ZXJEQVRBX1RZUEVTLkRBVEVUSU1FLFxuICBBbmFseXplckRBVEFfVFlQRVMuTlVNQkVSLFxuICBBbmFseXplckRBVEFfVFlQRVMuSU5ULFxuICBBbmFseXplckRBVEFfVFlQRVMuRkxPQVQsXG4gIEFuYWx5emVyREFUQV9UWVBFUy5CT09MRUFOLFxuICBBbmFseXplckRBVEFfVFlQRVMuU1RSSU5HLFxuICBBbmFseXplckRBVEFfVFlQRVMuR0VPTUVUUlksXG4gIEFuYWx5emVyREFUQV9UWVBFUy5HRU9NRVRSWV9GUk9NX1NUUklORyxcbiAgQW5hbHl6ZXJEQVRBX1RZUEVTLlBBSVJfR0VPTUVUUllfRlJPTV9TVFJJTkcsXG4gIEFuYWx5emVyREFUQV9UWVBFUy5aSVBDT0RFLFxuICBBbmFseXplckRBVEFfVFlQRVMuQVJSQVksXG4gIEFuYWx5emVyREFUQV9UWVBFUy5PQkpFQ1Rcbl07XG5cbi8vIGlmIGFueSBvZiB0aGVzZSB2YWx1ZSBvY2N1cnMgaW4gY3N2LCBwYXJzZSBpdCB0byBudWxsO1xuLy8gY29uc3QgQ1NWX05VTExTID0gWycnLCAnbnVsbCcsICdOVUxMJywgJ051bGwnLCAnTmFOJywgJy9OJ107XG4vLyBtYXRjaGVzIGVtcHR5IHN0cmluZ1xuZXhwb3J0IGNvbnN0IENTVl9OVUxMUyA9IC9eKG51bGx8TlVMTHxOdWxsfE5hTnxcXC9OfHwpJC87XG5cbmNvbnN0IElHTk9SRV9EQVRBX1RZUEVTID0gT2JqZWN0LmtleXMoQW5hbHl6ZXJEQVRBX1RZUEVTKS5maWx0ZXIoXG4gIHR5cGUgPT4gIUFDQ0VQVEVEX0FOQUxZWkVSX1RZUEVTLmluY2x1ZGVzKHR5cGUpXG4pO1xuXG5leHBvcnQgY29uc3QgUEFSU0VfRklFTERfVkFMVUVfRlJPTV9TVFJJTkcgPSB7XG4gIFtBTExfRklFTERfVFlQRVMuYm9vbGVhbl06IHtcbiAgICB2YWxpZDogZCA9PiB0eXBlb2YgZCA9PT0gJ2Jvb2xlYW4nLFxuICAgIHBhcnNlOiBkID0+IGQgPT09ICd0cnVlJyB8fCBkID09PSAnVHJ1ZScgfHwgZCA9PT0gJzEnXG4gIH0sXG4gIFtBTExfRklFTERfVFlQRVMuaW50ZWdlcl06IHtcbiAgICB2YWxpZDogZCA9PiBwYXJzZUludChkLCAxMCkgPT09IGQsXG4gICAgcGFyc2U6IGQgPT4gcGFyc2VJbnQoZCwgMTApXG4gIH0sXG4gIFtBTExfRklFTERfVFlQRVMudGltZXN0YW1wXToge1xuICAgIHZhbGlkOiAoZCwgZmllbGQpID0+XG4gICAgICBbJ3gnLCAnWCddLmluY2x1ZGVzKGZpZWxkLmZvcm1hdCkgPyB0eXBlb2YgZCA9PT0gJ251bWJlcicgOiB0eXBlb2YgZCA9PT0gJ3N0cmluZycsXG4gICAgcGFyc2U6IChkLCBmaWVsZCkgPT4gKFsneCcsICdYJ10uaW5jbHVkZXMoZmllbGQuZm9ybWF0KSA/IE51bWJlcihkKSA6IGQpXG4gIH0sXG4gIFtBTExfRklFTERfVFlQRVMucmVhbF06IHtcbiAgICB2YWxpZDogZCA9PiBwYXJzZUZsb2F0KGQpID09PSBkLFxuICAgIC8vIE5vdGUgdGhpcyB3aWxsIHJlc3VsdCBpbiBOYU4gZm9yIHNvbWUgc3RyaW5nXG4gICAgcGFyc2U6IHBhcnNlRmxvYXRcbiAgfVxufTtcblxuLyoqXG4gKiBQcm9jZXNzIGNzdiBkYXRhLCBvdXRwdXQgYSBkYXRhIG9iamVjdCB3aXRoIGB7ZmllbGRzOiBbXSwgcm93czogW119YC5cbiAqIFRoZSBkYXRhIG9iamVjdCBjYW4gYmUgd3JhcHBlZCBpbiBhIGBkYXRhc2V0YCBhbmQgcGFzcyB0byBbYGFkZERhdGFUb01hcGBdKC4uL2FjdGlvbnMvYWN0aW9ucy5tZCNhZGRkYXRhdG9tYXApXG4gKiBAcGFyYW0gcmF3RGF0YSByYXcgY3N2IHN0cmluZ1xuICogQHJldHVybnMgIGRhdGEgb2JqZWN0IGB7ZmllbGRzOiBbXSwgcm93czogW119YCBjYW4gYmUgcGFzc2VkIHRvIGFkZERhdGFUb01hcHNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2RhdGEtcHJvY2Vzc29yJykucHJvY2Vzc0NzdkRhdGF9XG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHtwcm9jZXNzQ3N2RGF0YX0gZnJvbSAna2VwbGVyLmdsL3Byb2Nlc3NvcnMnO1xuICpcbiAqIGNvbnN0IHRlc3REYXRhID0gYGdwc19kYXRhLnV0Y190aW1lc3RhbXAsZ3BzX2RhdGEubGF0LGdwc19kYXRhLmxuZyxncHNfZGF0YS50eXBlcyxlcG9jaCxoYXNfcmVzdWx0LGlkLHRpbWUsYmVnaW50cmlwX3RzX3V0YyxiZWdpbnRyaXBfdHNfbG9jYWwsZGF0ZVxuICogMjAxNi0wOS0xNyAwMDowOTo1NSwyOS45OTAwOTM3LDMxLjI1OTA1NDIsZHJpdmVyX2FuYWx5dGljcywxNDcyNjg4MDAwMDAwLEZhbHNlLDEsMjAxNi0wOS0yM1QwMDowMDowMC4wMDBaLDIwMTYtMTAtMDEgMDk6NDE6MzkrMDA6MDAsMjAxNi0xMC0wMSAwOTo0MTozOSswMDowMCwyMDE2LTA5LTIzXG4gKiAyMDE2LTA5LTE3IDAwOjEwOjU2LDI5Ljk5Mjc2OTksMzEuMjQ2MTE0Mixkcml2ZXJfYW5hbHl0aWNzLDE0NzI2ODgwMDAwMDAsRmFsc2UsMiwyMDE2LTA5LTIzVDAwOjAwOjAwLjAwMFosMjAxNi0xMC0wMSAwOTo0NjozNyswMDowMCwyMDE2LTEwLTAxIDE2OjQ2OjM3KzAwOjAwLDIwMTYtMDktMjNcbiAqIDIwMTYtMDktMTcgMDA6MTE6NTYsMjkuOTkwNzI2MSwzMS4yMzEyNzQyLGRyaXZlcl9hbmFseXRpY3MsMTQ3MjY4ODAwMDAwMCxGYWxzZSwzLDIwMTYtMDktMjNUMDA6MDA6MDAuMDAwWiwsLDIwMTYtMDktMjNcbiAqIDIwMTYtMDktMTcgMDA6MTI6NTgsMjkuOTg3MDA3NCwzMS4yMTc1ODI3LGRyaXZlcl9hbmFseXRpY3MsMTQ3MjY4ODAwMDAwMCxGYWxzZSw0LDIwMTYtMDktMjNUMDA6MDA6MDAuMDAwWiwsLDIwMTYtMDktMjNgXG4gKlxuICogY29uc3QgZGF0YXNldCA9IHtcbiAqICBpbmZvOiB7aWQ6ICd0ZXN0X2RhdGEnLCBsYWJlbDogJ015IENzdid9LFxuICogIGRhdGE6IHByb2Nlc3NDc3ZEYXRhKHRlc3REYXRhKVxuICogfTtcbiAqXG4gKiBkaXNwYXRjaChhZGREYXRhVG9NYXAoe1xuICogIGRhdGFzZXRzOiBbZGF0YXNldF0sXG4gKiAgb3B0aW9uczoge2NlbnRlck1hcDogdHJ1ZSwgcmVhZE9ubHk6IHRydWV9XG4gKiB9KSk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzQ3N2RGF0YShyYXdEYXRhLCBoZWFkZXIpIHtcbiAgbGV0IHJvd3M7XG4gIGxldCBoZWFkZXJSb3c7XG5cbiAgaWYgKHR5cGVvZiByYXdEYXRhID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IHBhcnNlZFJvd3MgPSBjc3ZQYXJzZVJvd3MocmF3RGF0YSk7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGFyc2VkUm93cykgfHwgcGFyc2VkUm93cy5sZW5ndGggPCAyKSB7XG4gICAgICAvLyBsb29rcyBsaWtlIGFuIGVtcHR5IGZpbGUsIHRocm93IGVycm9yIHRvIGJlIGNhdGNoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MgQ3N2IERhdGEgRmFpbGVkOiBDU1YgaXMgZW1wdHknKTtcbiAgICB9XG4gICAgaGVhZGVyUm93ID0gcGFyc2VkUm93c1swXTtcbiAgICByb3dzID0gcGFyc2VkUm93cy5zbGljZSgxKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJhd0RhdGEpICYmIHJhd0RhdGEubGVuZ3RoKSB7XG4gICAgcm93cyA9IHJhd0RhdGE7XG4gICAgaGVhZGVyUm93ID0gaGVhZGVyO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGhlYWRlclJvdykpIHtcbiAgICAgIC8vIGlmIGRhdGEgaXMgcGFzc2VkIGluIGFzIGFycmF5IG9mIHJvd3MgYW5kIG1pc3NpbmcgaGVhZGVyXG4gICAgICAvLyBhc3N1bWUgZmlyc3Qgcm93IGlzIGhlYWRlclxuICAgICAgaGVhZGVyUm93ID0gcmF3RGF0YVswXTtcbiAgICAgIHJvd3MgPSByYXdEYXRhLnNsaWNlKDEpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghcm93cyB8fCAhaGVhZGVyUm93KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGlucHV0IHBhc3NlZCB0byBwcm9jZXNzQ3N2RGF0YScpO1xuICB9XG5cbiAgLy8gaGVyZSB3ZSBhc3N1bWUgdGhlIGNzdiBmaWxlIHRoYXQgcGVvcGxlIHVwbG9hZGVkIHdpbGwgaGF2ZSBmaXJzdCByb3dcbiAgLy8gYXMgbmFtZSBvZiB0aGUgY29sdW1uXG5cbiAgY2xlYW5VcEZhbHN5Q3N2VmFsdWUocm93cyk7XG4gIC8vIE5vIG5lZWQgdG8gcnVuIHR5cGUgZGV0ZWN0aW9uIG9uIGV2ZXJ5IGRhdGEgcG9pbnRcbiAgLy8gaGVyZSB3ZSBnZXQgYSBsaXN0IG9mIG5vbmUgbnVsbCB2YWx1ZXMgdG8gcnVuIGFuYWx5emUgb25cbiAgY29uc3Qgc2FtcGxlID0gZ2V0U2FtcGxlRm9yVHlwZUFuYWx5emUoe2ZpZWxkczogaGVhZGVyUm93LCBhbGxEYXRhOiByb3dzfSk7XG4gIGNvbnN0IGZpZWxkcyA9IGdldEZpZWxkc0Zyb21EYXRhKHNhbXBsZSwgaGVhZGVyUm93KTtcbiAgY29uc3QgcGFyc2VkUm93cyA9IHBhcnNlUm93c0J5RmllbGRzKHJvd3MsIGZpZWxkcyk7XG5cbiAgcmV0dXJuIHtmaWVsZHMsIHJvd3M6IHBhcnNlZFJvd3N9O1xufVxuXG4vKipcbiAqIFBhcnNlIHJvd3Mgb2YgY3N2IGJ5IGFuYWx5emVkIGZpZWxkIHR5cGVzLiBTbyB0aGF0IGAnMSdgIC0+IGAxYCwgYCdUcnVlJ2AgLT4gYHRydWVgXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5Pn0gcm93c1xuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBmaWVsZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUm93c0J5RmllbGRzKHJvd3MsIGZpZWxkcykge1xuICAvLyBFZGl0IHJvd3MgaW4gcGxhY2VcbiAgY29uc3QgZ2VvanNvbkZpZWxkSWR4ID0gZmllbGRzLmZpbmRJbmRleChmID0+IGYubmFtZSA9PT0gJ19nZW9qc29uJyk7XG4gIGZpZWxkcy5mb3JFYWNoKHBhcnNlQ3N2Um93c0J5RmllbGRUeXBlLmJpbmQobnVsbCwgcm93cywgZ2VvanNvbkZpZWxkSWR4KSk7XG5cbiAgcmV0dXJuIHJvd3M7XG59XG4vKipcbiAqIEdldHRpbmcgc2FtcGxlIGRhdGEgZm9yIGFuYWx5emluZyBmaWVsZCB0eXBlLlxuICpcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2RhdGEtcHJvY2Vzc29yJykuZ2V0U2FtcGxlRm9yVHlwZUFuYWx5emV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTYW1wbGVGb3JUeXBlQW5hbHl6ZSh7ZmllbGRzLCBhbGxEYXRhLCBzYW1wbGVDb3VudCA9IDUwfSkge1xuICBjb25zdCB0b3RhbCA9IE1hdGgubWluKHNhbXBsZUNvdW50LCBhbGxEYXRhLmxlbmd0aCk7XG4gIC8vIGNvbnN0IGZpZWxkT3JkZXIgPSBmaWVsZHMubWFwKGYgPT4gZi5uYW1lKTtcbiAgY29uc3Qgc2FtcGxlID0gcmFuZ2UoMCwgdG90YWwsIDEpLm1hcChkID0+ICh7fSkpO1xuXG4gIC8vIGNvbGxlY3Qgc2FtcGxlIGRhdGEgZm9yIGVhY2ggZmllbGRcbiAgZmllbGRzLmZvckVhY2goKGZpZWxkLCBmaWVsZElkeCkgPT4ge1xuICAgIC8vIGRhdGEgY291bnRlclxuICAgIGxldCBpID0gMDtcbiAgICAvLyBzYW1wbGUgY291bnRlclxuICAgIGxldCBqID0gMDtcblxuICAgIHdoaWxlIChqIDwgdG90YWwpIHtcbiAgICAgIGlmIChpID49IGFsbERhdGEubGVuZ3RoKSB7XG4gICAgICAgIC8vIGlmIGRlcGxldGVkIGRhdGEgcG9vbFxuICAgICAgICBzYW1wbGVbal1bZmllbGRdID0gbnVsbDtcbiAgICAgICAgaisrO1xuICAgICAgfSBlbHNlIGlmIChub3ROdWxsb3JVbmRlZmluZWQoYWxsRGF0YVtpXVtmaWVsZElkeF0pKSB7XG4gICAgICAgIHNhbXBsZVtqXVtmaWVsZF0gPSBhbGxEYXRhW2ldW2ZpZWxkSWR4XTtcbiAgICAgICAgaisrO1xuICAgICAgICBpKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc2FtcGxlO1xufVxuXG4vKipcbiAqIENvbnZlcnQgZmFsc3kgdmFsdWUgaW4gY3N2IGluY2x1ZGluZyBgJycsICdudWxsJywgJ05VTEwnLCAnTnVsbCcsICdOYU4nYCB0byBgbnVsbGAsXG4gKiBzbyB0aGF0IHR5cGUtYW5hbHl6ZXIgd29uJ3QgZGV0ZWN0IGl0IGFzIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk+fSByb3dzXG4gKi9cbmZ1bmN0aW9uIGNsZWFuVXBGYWxzeUNzdlZhbHVlKHJvd3MpIHtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKENTVl9OVUxMUywgJ2cnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAvLyBhbmFseXplciB3aWxsIHNldCBhbnkgZmllbGRzIHRvICdzdHJpbmcnIGlmIHRoZXJlIGFyZSBlbXB0eSB2YWx1ZXNcbiAgICAgIC8vIHdoaWNoIHdpbGwgYmUgcGFyc2VkIGFzICcnIGJ5IGQzLmNzdlxuICAgICAgLy8gaGVyZSB3ZSBwYXJzZSBlbXB0eSBkYXRhIGFzIG51bGxcbiAgICAgIC8vIFRPRE86IGNyZWF0ZSB3YXJuaW5nIHdoZW4gZGVsdGVjdCBgQ1NWX05VTExTYCBpbiB0aGUgZGF0YVxuICAgICAgaWYgKHR5cGVvZiByb3dzW2ldW2pdID09PSAnc3RyaW5nJyAmJiByb3dzW2ldW2pdLm1hdGNoKHJlKSkge1xuICAgICAgICByb3dzW2ldW2pdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIHVwbG9hZGVkIGNzdiBmaWxlIHRvIHBhcnNlIHZhbHVlIGJ5IGZpZWxkIHR5cGVcbiAqXG4gKiBAcGFyYW0gcm93c1xuICogQHBhcmFtIGdlb0ZpZWxkSWR4IGZpZWxkIGluZGV4XG4gKiBAcGFyYW0gZmllbGRcbiAqIEBwYXJhbSBpXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9kYXRhLXByb2Nlc3NvcicpLnBhcnNlQ3N2Um93c0J5RmllbGRUeXBlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ZSb3dzQnlGaWVsZFR5cGUocm93cywgZ2VvRmllbGRJZHgsIGZpZWxkLCBpKSB7XG4gIGNvbnN0IHBhcnNlciA9IFBBUlNFX0ZJRUxEX1ZBTFVFX0ZST01fU1RSSU5HW2ZpZWxkLnR5cGVdO1xuICBpZiAocGFyc2VyKSB7XG4gICAgLy8gY2hlY2sgZmlyc3Qgbm90IG51bGwgdmFsdWUgb2YgaXQncyBhbHJlYWR5IHBhcnNlZFxuICAgIGNvbnN0IGZpcnN0ID0gcm93cy5maW5kKHIgPT4gbm90TnVsbG9yVW5kZWZpbmVkKHJbaV0pKTtcbiAgICBpZiAoIWZpcnN0IHx8IHBhcnNlci52YWxpZChmaXJzdFtpXSwgZmllbGQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgLy8gcGFyc2Ugc3RyaW5nIHZhbHVlIGJhc2VkIG9uIGZpZWxkIHR5cGVcbiAgICAgIGlmIChyb3dbaV0gIT09IG51bGwpIHtcbiAgICAgICAgcm93W2ldID0gcGFyc2VyLnBhcnNlKHJvd1tpXSwgZmllbGQpO1xuICAgICAgICBpZiAoZ2VvRmllbGRJZHggPiAtMSAmJiByb3dbZ2VvRmllbGRJZHhdICYmIHJvd1tnZW9GaWVsZElkeF0ucHJvcGVydGllcykge1xuICAgICAgICAgIHJvd1tnZW9GaWVsZElkeF0ucHJvcGVydGllc1tmaWVsZC5uYW1lXSA9IHJvd1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQW5hbHl6ZSBmaWVsZCB0eXBlcyBmcm9tIGRhdGEgaW4gYHN0cmluZ2AgZm9ybWF0LCBlLmcuIHVwbG9hZGVkIGNzdi5cbiAqIEFzc2lnbiBgdHlwZWAsIGB0YWJsZUZpZWxkSW5kZXhgIGFuZCBgZm9ybWF0YCAodGltZXN0YW1wIG9ubHkpIHRvIGVhY2ggZmllbGRcbiAqXG4gKiBAcGFyYW0gZGF0YSBhcnJheSBvZiByb3cgb2JqZWN0XG4gKiBAcGFyYW0gZmllbGRPcmRlciBhcnJheSBvZiBmaWVsZCBuYW1lcyBhcyBzdHJpbmdcbiAqIEByZXR1cm5zIGZvcm1hdHRlZCBmaWVsZHNcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2RhdGEtcHJvY2Vzc29yJykuZ2V0RmllbGRzRnJvbURhdGF9XG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICpcbiAqIGltcG9ydCB7Z2V0RmllbGRzRnJvbURhdGF9IGZyb20gJ2tlcGxlci5nbC9wcm9jZXNzb3JzJztcbiAqIGNvbnN0IGRhdGEgPSBbe1xuICogICB0aW1lOiAnMjAxNi0wOS0xNyAwMDowOTo1NScsXG4gKiAgIHZhbHVlOiAnNCcsXG4gKiAgIHN1cmdlOiAnMS4yJyxcbiAqICAgaXNUcmlwOiAndHJ1ZScsXG4gKiAgIHplcm9PbmVzOiAnMCdcbiAqIH0sIHtcbiAqICAgdGltZTogJzIwMTYtMDktMTcgMDA6MzA6MDgnLFxuICogICB2YWx1ZTogJzMnLFxuICogICBzdXJnZTogbnVsbCxcbiAqICAgaXNUcmlwOiAnZmFsc2UnLFxuICogICB6ZXJvT25lczogJzEnXG4gKiB9LCB7XG4gKiAgIHRpbWU6IG51bGwsXG4gKiAgIHZhbHVlOiAnMicsXG4gKiAgIHN1cmdlOiAnMS4zJyxcbiAqICAgaXNUcmlwOiBudWxsLFxuICogICB6ZXJvT25lczogJzEnXG4gKiB9XTtcbiAqXG4gKiBjb25zdCBmaWVsZE9yZGVyID0gWyd0aW1lJywgJ3ZhbHVlJywgJ3N1cmdlJywgJ2lzVHJpcCcsICd6ZXJvT25lcyddO1xuICogY29uc3QgZmllbGRzID0gZ2V0RmllbGRzRnJvbURhdGEoZGF0YSwgZmllbGRPcmRlcik7XG4gKiAvLyBmaWVsZHMgPSBbXG4gKiAvLyB7bmFtZTogJ3RpbWUnLCBmb3JtYXQ6ICdZWVlZLU0tRCBIOm06cycsIHRhYmxlRmllbGRJbmRleDogMSwgdHlwZTogJ3RpbWVzdGFtcCd9LFxuICogLy8ge25hbWU6ICd2YWx1ZScsIGZvcm1hdDogJycsIHRhYmxlRmllbGRJbmRleDogNCwgdHlwZTogJ2ludGVnZXInfSxcbiAqIC8vIHtuYW1lOiAnc3VyZ2UnLCBmb3JtYXQ6ICcnLCB0YWJsZUZpZWxkSW5kZXg6IDUsIHR5cGU6ICdyZWFsJ30sXG4gKiAvLyB7bmFtZTogJ2lzVHJpcCcsIGZvcm1hdDogJycsIHRhYmxlRmllbGRJbmRleDogNiwgdHlwZTogJ2Jvb2xlYW4nfSxcbiAqIC8vIHtuYW1lOiAnemVyb09uZXMnLCBmb3JtYXQ6ICcnLCB0YWJsZUZpZWxkSW5kZXg6IDcsIHR5cGU6ICdpbnRlZ2VyJ31dO1xuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkc0Zyb21EYXRhKGRhdGEsIGZpZWxkT3JkZXIpIHtcbiAgLy8gYWRkIGEgY2hlY2sgZm9yIGVwb2NoIHRpbWVzdGFtcFxuICBjb25zdCBtZXRhZGF0YSA9IEFuYWx5emVyLmNvbXB1dGVDb2xNZXRhKFxuICAgIGRhdGEsXG4gICAgW3tyZWdleDogLy4qZ2VvanNvbnxhbGxfcG9pbnRzL2csIGRhdGFUeXBlOiAnR0VPTUVUUlknfV0sXG4gICAge2lnbm9yZWREYXRhVHlwZXM6IElHTk9SRV9EQVRBX1RZUEVTfVxuICApO1xuXG4gIGNvbnN0IHtmaWVsZEJ5SW5kZXh9ID0gcmVuYW1lRHVwbGljYXRlRmllbGRzKGZpZWxkT3JkZXIpO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGZpZWxkT3JkZXIubWFwKChmaWVsZCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBuYW1lID0gZmllbGRCeUluZGV4W2luZGV4XTtcblxuICAgIGNvbnN0IGZpZWxkTWV0YSA9IG1ldGFkYXRhLmZpbmQobSA9PiBtLmtleSA9PT0gZmllbGQpO1xuICAgIGNvbnN0IHt0eXBlLCBmb3JtYXR9ID0gZmllbGRNZXRhIHx8IHt9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBmb3JtYXQsXG4gICAgICB0YWJsZUZpZWxkSW5kZXg6IGluZGV4ICsgMSxcbiAgICAgIHR5cGU6IGFuYWx5emVyVHlwZVRvRmllbGRUeXBlKHR5cGUpLFxuICAgICAgYW5hbHl6ZXJUeXBlOiB0eXBlXG4gICAgfTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBwYXNzIGluIGFuIGFycmF5IG9mIGZpZWxkIG5hbWVzLCByZW5hbWUgZHVwbGljYXRlZCBvbmVcbiAqIGFuZCByZXR1cm4gYSBtYXAgZnJvbSBvbGQgZmllbGQgaW5kZXggdG8gbmV3IG5hbWVcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBmaWVsZE9yZGVyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBuZXcgZmllbGQgbmFtZSBieSBpbmRleFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuYW1lRHVwbGljYXRlRmllbGRzKGZpZWxkT3JkZXIpIHtcbiAgcmV0dXJuIGZpZWxkT3JkZXIucmVkdWNlKFxuICAgIChhY2N1LCBmaWVsZCwgaSkgPT4ge1xuICAgICAgY29uc3Qge2FsbE5hbWVzfSA9IGFjY3U7XG4gICAgICBsZXQgZmllbGROYW1lID0gZmllbGQ7XG5cbiAgICAgIC8vIGFkZCBhIGNvdW50ZXIgdG8gZHVwbGljYXRlZCBuYW1lc1xuICAgICAgaWYgKGFsbE5hbWVzLmluY2x1ZGVzKGZpZWxkKSkge1xuICAgICAgICBsZXQgY291bnRlciA9IDA7XG4gICAgICAgIHdoaWxlIChhbGxOYW1lcy5pbmNsdWRlcyhgJHtmaWVsZH0tJHtjb3VudGVyfWApKSB7XG4gICAgICAgICAgY291bnRlcisrO1xuICAgICAgICB9XG4gICAgICAgIGZpZWxkTmFtZSA9IGAke2ZpZWxkfS0ke2NvdW50ZXJ9YDtcbiAgICAgIH1cblxuICAgICAgYWNjdS5maWVsZEJ5SW5kZXhbaV0gPSBmaWVsZE5hbWU7XG4gICAgICBhY2N1LmFsbE5hbWVzLnB1c2goZmllbGROYW1lKTtcblxuICAgICAgcmV0dXJuIGFjY3U7XG4gICAgfSxcbiAgICB7YWxsTmFtZXM6IFtdLCBmaWVsZEJ5SW5kZXg6IHt9fVxuICApO1xufVxuXG4vKipcbiAqIENvbnZlcnQgdHlwZS1hbmFseXplciBvdXRwdXQgdG8ga2VwbGVyLmdsIGZpZWxkIHR5cGVzXG4gKlxuICogQHBhcmFtIGFUeXBlXG4gKiBAcmV0dXJucyBjb3JyZXNwb25kaW5nIHR5cGUgaW4gYEFMTF9GSUVMRF9UWVBFU2BcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2RhdGEtcHJvY2Vzc29yJykuYW5hbHl6ZXJUeXBlVG9GaWVsZFR5cGV9fVxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZXJUeXBlVG9GaWVsZFR5cGUoYVR5cGUpIHtcbiAgY29uc3Qge1xuICAgIERBVEUsXG4gICAgVElNRSxcbiAgICBEQVRFVElNRSxcbiAgICBOVU1CRVIsXG4gICAgSU5ULFxuICAgIEZMT0FULFxuICAgIEJPT0xFQU4sXG4gICAgU1RSSU5HLFxuICAgIEdFT01FVFJZLFxuICAgIEdFT01FVFJZX0ZST01fU1RSSU5HLFxuICAgIFBBSVJfR0VPTUVUUllfRlJPTV9TVFJJTkcsXG4gICAgWklQQ09ERSxcbiAgICBBUlJBWSxcbiAgICBPQkpFQ1RcbiAgfSA9IEFuYWx5emVyREFUQV9UWVBFUztcblxuICAvLyBUT0RPOiB1biByZWNvZ25pemVkIHR5cGVzXG4gIC8vIENVUlJFTkNZIFBFUkNFTlQgTk9ORVxuICBzd2l0Y2ggKGFUeXBlKSB7XG4gICAgY2FzZSBEQVRFOlxuICAgICAgcmV0dXJuIEFMTF9GSUVMRF9UWVBFUy5kYXRlO1xuICAgIGNhc2UgVElNRTpcbiAgICBjYXNlIERBVEVUSU1FOlxuICAgICAgcmV0dXJuIEFMTF9GSUVMRF9UWVBFUy50aW1lc3RhbXA7XG4gICAgY2FzZSBGTE9BVDpcbiAgICAgIHJldHVybiBBTExfRklFTERfVFlQRVMucmVhbDtcbiAgICBjYXNlIElOVDpcbiAgICAgIHJldHVybiBBTExfRklFTERfVFlQRVMuaW50ZWdlcjtcbiAgICBjYXNlIEJPT0xFQU46XG4gICAgICByZXR1cm4gQUxMX0ZJRUxEX1RZUEVTLmJvb2xlYW47XG4gICAgY2FzZSBHRU9NRVRSWTpcbiAgICBjYXNlIEdFT01FVFJZX0ZST01fU1RSSU5HOlxuICAgIGNhc2UgUEFJUl9HRU9NRVRSWV9GUk9NX1NUUklORzpcbiAgICBjYXNlIEFSUkFZOlxuICAgIGNhc2UgT0JKRUNUOlxuICAgICAgLy8gVE9ETzogY3JlYXRlIGEgbmV3IGRhdGEgdHlwZSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzXG4gICAgICByZXR1cm4gQUxMX0ZJRUxEX1RZUEVTLmdlb2pzb247XG4gICAgY2FzZSBOVU1CRVI6XG4gICAgY2FzZSBTVFJJTkc6XG4gICAgY2FzZSBaSVBDT0RFOlxuICAgICAgcmV0dXJuIEFMTF9GSUVMRF9UWVBFUy5zdHJpbmc7XG4gICAgZGVmYXVsdDpcbiAgICAgIGdsb2JhbENvbnNvbGUud2FybihgVW5zdXBwb3J0ZWQgYW5hbHl6ZXIgdHlwZTogJHthVHlwZX1gKTtcbiAgICAgIHJldHVybiBBTExfRklFTERfVFlQRVMuc3RyaW5nO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuLyoqXG4gKiBQcm9jZXNzIGRhdGEgd2hlcmUgZWFjaCByb3cgaXMgYW4gb2JqZWN0LCBvdXRwdXQgY2FuIGJlIHBhc3NlZCB0byBbYGFkZERhdGFUb01hcGBdKC4uL2FjdGlvbnMvYWN0aW9ucy5tZCNhZGRkYXRhdG9tYXApXG4gKiBAcGFyYW0gcmF3RGF0YSBhbiBhcnJheSBvZiByb3cgb2JqZWN0LCBlYWNoIG9iamVjdCBzaG91bGQgaGF2ZSB0aGUgc2FtZSBudW1iZXIgb2Yga2V5c1xuICogQHJldHVybnMgZGF0YXNldCBjb250YWluaW5nIGBmaWVsZHNgIGFuZCBgcm93c2BcbiAqIEB0eXBlIHt0eXBlb2YgaW1wb3J0KCcuL2RhdGEtcHJvY2Vzc29yJykucHJvY2Vzc1Jvd09iamVjdH1cbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQge2FkZERhdGFUb01hcH0gZnJvbSAna2VwbGVyLmdsL2FjdGlvbnMnO1xuICogaW1wb3J0IHtwcm9jZXNzUm93T2JqZWN0fSBmcm9tICdrZXBsZXIuZ2wvcHJvY2Vzc29ycyc7XG4gKlxuICogY29uc3QgZGF0YSA9IFtcbiAqICB7bGF0OiAzMS4yNywgbG5nOiAxMjcuNTYsIHZhbHVlOiAzfSxcbiAqICB7bGF0OiAzMS4yMiwgbG5nOiAxMjYuMjYsIHZhbHVlOiAxfVxuICogXTtcbiAqXG4gKiBkaXNwYXRjaChhZGREYXRhVG9NYXAoe1xuICogIGRhdGFzZXRzOiB7XG4gKiAgICBpbmZvOiB7bGFiZWw6ICdNeSBEYXRhJywgaWQ6ICdteV9kYXRhJ30sXG4gKiAgICBkYXRhOiBwcm9jZXNzUm93T2JqZWN0KGRhdGEpXG4gKiAgfVxuICogfSkpO1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc1Jvd09iamVjdChyYXdEYXRhKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShyYXdEYXRhKSB8fCAhcmF3RGF0YS5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhyYXdEYXRhWzBdKTtcbiAgY29uc3Qgcm93cyA9IHJhd0RhdGEubWFwKGQgPT4ga2V5cy5tYXAoa2V5ID0+IGRba2V5XSkpO1xuXG4gIC8vIHJvdyBvYmplY3QgYW4gc3RpbGwgY29udGFpbiB2YWx1ZXMgbGlrZSBgTnVsbGAgb3IgYE4vQWBcbiAgY2xlYW5VcEZhbHN5Q3N2VmFsdWUocm93cyk7XG5cbiAgcmV0dXJuIHByb2Nlc3NDc3ZEYXRhKHJvd3MsIGtleXMpO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgR2VvSlNPTiBbYEZlYXR1cmVDb2xsZWN0aW9uYF0oaHR0cDovL3dpa2kuZ2VvanNvbi5vcmcvR2VvSlNPTl9kcmFmdF92ZXJzaW9uXzYjRmVhdHVyZUNvbGxlY3Rpb24pLFxuICogb3V0cHV0IGEgZGF0YSBvYmplY3Qgd2l0aCBge2ZpZWxkczogW10sIHJvd3M6IFtdfWAuXG4gKiBUaGUgZGF0YSBvYmplY3QgY2FuIGJlIHdyYXBwZWQgaW4gYSBgZGF0YXNldGAgYW5kIHBhc3MgdG8gW2BhZGREYXRhVG9NYXBgXSguLi9hY3Rpb25zL2FjdGlvbnMubWQjYWRkZGF0YXRvbWFwKVxuICpcbiAqIEBwYXJhbSAgcmF3RGF0YSByYXcgZ2VvanNvbiBmZWF0dXJlIGNvbGxlY3Rpb25cbiAqIEByZXR1cm5zICBkYXRhc2V0IGNvbnRhaW5pbmcgYGZpZWxkc2AgYW5kIGByb3dzYFxuICogQHR5cGUge3R5cGVvZiBpbXBvcnQoJy4vZGF0YS1wcm9jZXNzb3InKS5wcm9jZXNzR2VvanNvbn1cbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQge2FkZERhdGFUb01hcH0gZnJvbSAna2VwbGVyLmdsL2FjdGlvbnMnO1xuICogaW1wb3J0IHtwcm9jZXNzR2VvanNvbn0gZnJvbSAna2VwbGVyLmdsL3Byb2Nlc3NvcnMnO1xuICpcbiAqIGNvbnN0IGdlb2pzb24gPSB7XG4gKiBcdFwidHlwZVwiIDogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICogXHRcImZlYXR1cmVzXCIgOiBbe1xuICogXHRcdFwidHlwZVwiIDogXCJGZWF0dXJlXCIsXG4gKiBcdFx0XCJwcm9wZXJ0aWVzXCIgOiB7XG4gKiBcdFx0XHRcImNhcGFjaXR5XCIgOiBcIjEwXCIsXG4gKiBcdFx0XHRcInR5cGVcIiA6IFwiVS1SYWNrXCJcbiAqIFx0XHR9LFxuICogXHRcdFwiZ2VvbWV0cnlcIiA6IHtcbiAqIFx0XHRcdFwidHlwZVwiIDogXCJQb2ludFwiLFxuICogXHRcdFx0XCJjb29yZGluYXRlc1wiIDogWyAtNzEuMDczMjgzLCA0Mi40MTc1MDAgXVxuICogXHRcdH1cbiAqIFx0fV1cbiAqIH07XG4gKlxuICogZGlzcGF0Y2goYWRkRGF0YVRvTWFwKHtcbiAqICBkYXRhc2V0czoge1xuICogICAgaW5mbzoge1xuICogICAgICBsYWJlbDogJ1NhbXBsZSBUYXhpIFRyaXBzIGluIE5ldyBZb3JrIENpdHknLFxuICogICAgICBpZDogJ3Rlc3RfdHJpcF9kYXRhJ1xuICogICAgfSxcbiAqICAgIGRhdGE6IHByb2Nlc3NHZW9qc29uKGdlb2pzb24pXG4gKiAgfVxuICogfSkpO1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0dlb2pzb24ocmF3RGF0YSkge1xuICBjb25zdCBub3JtYWxpemVkR2VvanNvbiA9IG5vcm1hbGl6ZShyYXdEYXRhKTtcblxuICBpZiAoIW5vcm1hbGl6ZWRHZW9qc29uIHx8ICFBcnJheS5pc0FycmF5KG5vcm1hbGl6ZWRHZW9qc29uLmZlYXR1cmVzKSkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgYFJlYWQgRmlsZSBGYWlsZWQ6IEZpbGUgaXMgbm90IGEgdmFsaWQgR2VvSlNPTi4gUmVhZCBtb3JlIGFib3V0IFtzdXBwb3J0ZWQgZmlsZSBmb3JtYXRdKCR7R1VJREVTX0ZJTEVfRk9STUFUX0RPQ30pYFxuICAgICk7XG4gICAgdGhyb3cgZXJyb3I7XG4gICAgLy8gZmFpbCB0byBub3JtYWxpemUgZ2VvanNvblxuICB9XG5cbiAgLy8gZ2V0dGluZyBhbGwgZmVhdHVyZSBmaWVsZHNcbiAgY29uc3QgYWxsRGF0YVJvd3MgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub3JtYWxpemVkR2VvanNvbi5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGYgPSBub3JtYWxpemVkR2VvanNvbi5mZWF0dXJlc1tpXTtcbiAgICBpZiAoZi5nZW9tZXRyeSkge1xuICAgICAgYWxsRGF0YVJvd3MucHVzaCh7XG4gICAgICAgIC8vIGFkZCBmZWF0dXJlIHRvIF9nZW9qc29uIGZpZWxkXG4gICAgICAgIF9nZW9qc29uOiBmLFxuICAgICAgICAuLi4oZi5wcm9wZXJ0aWVzIHx8IHt9KVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8vIGdldCBhbGwgdGhlIGZpZWxkXG4gIGNvbnN0IGZpZWxkcyA9IGFsbERhdGFSb3dzLnJlZHVjZSgocHJldiwgY3VycikgPT4ge1xuICAgIE9iamVjdC5rZXlzKGN1cnIpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICghcHJldi5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIHByZXYucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCBbXSk7XG5cbiAgLy8gbWFrZSBzdXJlIGVhY2ggZmVhdHVyZSBoYXMgZXhhY3Qgc2FtZSBmaWVsZHNcbiAgYWxsRGF0YVJvd3MuZm9yRWFjaChkID0+IHtcbiAgICBmaWVsZHMuZm9yRWFjaChmID0+IHtcbiAgICAgIGlmICghKGYgaW4gZCkpIHtcbiAgICAgICAgZFtmXSA9IG51bGw7XG4gICAgICAgIGQuX2dlb2pzb24ucHJvcGVydGllc1tmXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBwcm9jZXNzUm93T2JqZWN0KGFsbERhdGFSb3dzKTtcbn1cblxuLyoqXG4gKiBPbiBleHBvcnQgZGF0YSB0byBjc3ZcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk+fSBkYXRhIGBkYXRhc2V0LmFsbERhdGFgIG9yIGZpbHRlcmVkIGRhdGEgYGRhdGFzZXQuZGF0YWBcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gZmllbGRzIGBkYXRhc2V0LmZpZWxkc2BcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGNzdiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdENzdihkYXRhLCBmaWVsZHMpIHtcbiAgY29uc3QgY29sdW1ucyA9IGZpZWxkcy5tYXAoZiA9PiBmLm5hbWUpO1xuICBjb25zdCBmb3JtYXR0ZWREYXRhID0gW2NvbHVtbnNdO1xuXG4gIC8vIHBhcnNlIGdlb2pzb24gb2JqZWN0IGFzIHN0cmluZ1xuICBkYXRhLmZvckVhY2gocm93ID0+IHtcbiAgICBmb3JtYXR0ZWREYXRhLnB1c2gocm93Lm1hcCgoZCwgaSkgPT4gcGFyc2VGaWVsZFZhbHVlKGQsIGZpZWxkc1tpXS50eXBlKSkpO1xuICB9KTtcblxuICByZXR1cm4gY3N2Rm9ybWF0Um93cyhmb3JtYXR0ZWREYXRhKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBpbnB1dCBkYXRhLCBhZGRpbmcgbWlzc2luZyBmaWVsZCB0eXBlcywgcmVuYW1lIGR1cGxpY2F0ZSBjb2x1bW5zXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9kYXRhLXByb2Nlc3NvcicpLnZhbGlkYXRlSW5wdXREYXRhfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbnB1dERhdGEoZGF0YSkge1xuICBpZiAoIWlzUGxhaW5PYmplY3QoZGF0YSkpIHtcbiAgICBhc3NlcnQoJ2FkZERhdGFUb01hcCBFcnJvcjogZGF0YXNldC5kYXRhIGNhbm5vdCBiZSBudWxsJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YS5maWVsZHMpKSB7XG4gICAgYXNzZXJ0KCdhZGREYXRhVG9NYXAgRXJyb3I6IGV4cGVjdCBkYXRhc2V0LmRhdGEuZmllbGRzIHRvIGJlIGFuIGFycmF5Jyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YS5yb3dzKSkge1xuICAgIGFzc2VydCgnYWRkRGF0YVRvTWFwIEVycm9yOiBleHBlY3QgZGF0YXNldC5kYXRhLnJvd3MgdG8gYmUgYW4gYXJyYXknKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHtmaWVsZHMsIHJvd3N9ID0gZGF0YTtcblxuICAvLyBjaGVjayBpZiBhbGwgZmllbGRzIGhhcyBuYW1lLCBmb3JtYXQgYW5kIHR5cGVcbiAgY29uc3QgYWxsVmFsaWQgPSBmaWVsZHMuZXZlcnkoKGYsIGkpID0+IHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoZikpIHtcbiAgICAgIGFzc2VydChgZmllbGRzIG5lZWRzIHRvIGJlIGFuIGFycmF5IG9mIG9iamVjdCwgYnV0IGZpbmQgJHt0eXBlb2YgZn1gKTtcbiAgICAgIGZpZWxkc1tpXSA9IHt9O1xuICAgIH1cblxuICAgIGlmICghZi5uYW1lKSB7XG4gICAgICBhc3NlcnQoYGZpZWxkLm5hbWUgaXMgcmVxdWlyZWQgYnV0IG1pc3NpbmcgaW4gJHtKU09OLnN0cmluZ2lmeShmKX1gKTtcbiAgICAgIC8vIGFzc2lnbiBhIG5hbWVcbiAgICAgIGZpZWxkc1tpXS5uYW1lID0gYGNvbHVtbl8ke2l9YDtcbiAgICB9XG5cbiAgICBpZiAoIUFMTF9GSUVMRF9UWVBFU1tmLnR5cGVdKSB7XG4gICAgICBhc3NlcnQoYHVua25vd24gZmllbGQgdHlwZSAke2YudHlwZX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWZpZWxkcy5ldmVyeShmaWVsZCA9PiBmaWVsZC5hbmFseXplclR5cGUpKSB7XG4gICAgICBhc3NlcnQoJ2ZpZWxkIG1pc3NpbmcgYW5hbHl6ZXJUeXBlJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgdGltZSBmb3JtYXQgaXMgY29ycmVjdCBiYXNlZCBvbiBmaXJzdCAxMCBub3QgZW1wdHkgZWxlbWVudFxuICAgIGlmIChmLnR5cGUgPT09IEFMTF9GSUVMRF9UWVBFUy50aW1lc3RhbXApIHtcbiAgICAgIGNvbnN0IHNhbXBsZSA9IGZpbmROb25FbXB0eVJvd3NBdEZpZWxkKHJvd3MsIGksIDEwKS5tYXAociA9PiAoe3RzOiByW2ldfSkpO1xuICAgICAgY29uc3QgYW5hbHl6ZWRUeXBlID0gQW5hbHl6ZXIuY29tcHV0ZUNvbE1ldGEoc2FtcGxlKVswXTtcbiAgICAgIHJldHVybiBhbmFseXplZFR5cGUuY2F0ZWdvcnkgPT09ICdUSU1FJyAmJiBhbmFseXplZFR5cGUuZm9ybWF0ID09PSBmLmZvcm1hdDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgaWYgKGFsbFZhbGlkKSB7XG4gICAgcmV0dXJuIHtyb3dzLCBmaWVsZHN9O1xuICB9XG5cbiAgLy8gaWYgYW55IGZpZWxkIGhhcyBtaXNzaW5nIHR5cGUsIHJlY2FsY3VsYXRlIGl0IGZvciBldmVyeW9uZVxuICAvLyBiZWNhdXNlIHdlIHNpbXBseSBsb3N0IGZhaXRoIGluIGh1bWFuaXR5XG4gIGNvbnN0IHNhbXBsZURhdGEgPSBnZXRTYW1wbGVGb3JUeXBlQW5hbHl6ZSh7XG4gICAgZmllbGRzOiBmaWVsZHMubWFwKGYgPT4gZi5uYW1lKSxcbiAgICBhbGxEYXRhOiByb3dzXG4gIH0pO1xuICBjb25zdCBmaWVsZE9yZGVyID0gZmllbGRzLm1hcChmID0+IGYubmFtZSk7XG4gIGNvbnN0IG1ldGEgPSBnZXRGaWVsZHNGcm9tRGF0YShzYW1wbGVEYXRhLCBmaWVsZE9yZGVyKTtcbiAgY29uc3QgdXBkYXRlZEZpZWxkcyA9IGZpZWxkcy5tYXAoKGYsIGkpID0+ICh7XG4gICAgLi4uZixcbiAgICB0eXBlOiBtZXRhW2ldLnR5cGUsXG4gICAgZm9ybWF0OiBtZXRhW2ldLmZvcm1hdCxcbiAgICBhbmFseXplclR5cGU6IG1ldGFbaV0uYW5hbHl6ZXJUeXBlXG4gIH0pKTtcblxuICByZXR1cm4ge2ZpZWxkczogdXBkYXRlZEZpZWxkcywgcm93c307XG59XG5cbmZ1bmN0aW9uIGZpbmROb25FbXB0eVJvd3NBdEZpZWxkKHJvd3MsIGZpZWxkSWR4LCB0b3RhbCkge1xuICBjb25zdCBzYW1wbGUgPSBbXTtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoc2FtcGxlLmxlbmd0aCA8IHRvdGFsICYmIGkgPCByb3dzLmxlbmd0aCkge1xuICAgIGlmIChub3ROdWxsb3JVbmRlZmluZWQocm93c1tpXVtmaWVsZElkeF0pKSB7XG4gICAgICBzYW1wbGUucHVzaChyb3dzW2ldKTtcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBzYW1wbGU7XG59XG4vKipcbiAqIFByb2Nlc3Mgc2F2ZWQga2VwbGVyLmdsIGpzb24gdG8gYmUgcGFzcyB0byBbYGFkZERhdGFUb01hcGBdKC4uL2FjdGlvbnMvYWN0aW9ucy5tZCNhZGRkYXRhdG9tYXApLlxuICogVGhlIGpzb24gb2JqZWN0IHNob3VsZCBjb250YWluIGBkYXRhc2V0c2AgYW5kIGBjb25maWdgLlxuICogQHBhcmFtIHtPYmplY3R9IHJhd0RhdGFcbiAqIEBwYXJhbSB7QXJyYXl9IHJhd0RhdGEuZGF0YXNldHNcbiAqIEBwYXJhbSB7T2JqZWN0fSByYXdEYXRhLmNvbmZpZ1xuICogQHJldHVybnMge09iamVjdH0gZGF0YXNldHMgYW5kIGNvbmZpZyBge2RhdGFzZXRzOiB7fSwgY29uZmlnOiB7fX1gXG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHthZGREYXRhVG9NYXB9IGZyb20gJ2tlcGxlci5nbC9hY3Rpb25zJztcbiAqIGltcG9ydCB7cHJvY2Vzc0tlcGxlcmdsSlNPTn0gZnJvbSAna2VwbGVyLmdsL3Byb2Nlc3NvcnMnO1xuICpcbiAqIGRpc3BhdGNoKGFkZERhdGFUb01hcChwcm9jZXNzS2VwbGVyZ2xKU09OKGtlcGxlckdsSnNvbikpKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NLZXBsZXJnbEpTT04ocmF3RGF0YSkge1xuICByZXR1cm4gcmF3RGF0YSA/IEtlcGxlckdsU2NoZW1hLmxvYWQocmF3RGF0YS5kYXRhc2V0cywgcmF3RGF0YS5jb25maWcpIDogbnVsbDtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBkYXRhc2V0cyBzYXZlZCB1c2luZyBrZXBsZXIuZ2wgc2NoZW1hXG4gKiBAcGFyYW0ge0FycmF5IHwgQXJyYXk8T2JqZWN0Pn0gcmF3RGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0tlcGxlcmdsRGF0YXNldChyYXdEYXRhKSB7XG4gIGlmICghcmF3RGF0YSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0cyA9IEtlcGxlckdsU2NoZW1hLnBhcnNlU2F2ZWREYXRhKHRvQXJyYXkocmF3RGF0YSkpO1xuICBpZiAoIXJlc3VsdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gQXJyYXkuaXNBcnJheShyYXdEYXRhKSA/IHJlc3VsdHMgOiByZXN1bHRzWzBdO1xufVxuXG5leHBvcnQgY29uc3QgREFUQVNFVF9IQU5ETEVSUyA9IHtcbiAgW0RBVEFTRVRfRk9STUFUUy5yb3ddOiBwcm9jZXNzUm93T2JqZWN0LFxuICBbREFUQVNFVF9GT1JNQVRTLmdlb2pzb25dOiBwcm9jZXNzR2VvanNvbixcbiAgW0RBVEFTRVRfRk9STUFUUy5jc3ZdOiBwcm9jZXNzQ3N2RGF0YSxcbiAgW0RBVEFTRVRfRk9STUFUUy5rZXBsZXJnbF06IHByb2Nlc3NLZXBsZXJnbERhdGFzZXRcbn07XG5cbmV4cG9ydCBjb25zdCBQcm9jZXNzb3JzID0ge1xuICBwcm9jZXNzR2VvanNvbixcbiAgcHJvY2Vzc0NzdkRhdGEsXG4gIHByb2Nlc3NSb3dPYmplY3QsXG4gIHByb2Nlc3NLZXBsZXJnbEpTT04sXG4gIHByb2Nlc3NLZXBsZXJnbERhdGFzZXQsXG4gIGFuYWx5emVyVHlwZVRvRmllbGRUeXBlLFxuICBnZXRGaWVsZHNGcm9tRGF0YSxcbiAgcGFyc2VDc3ZSb3dzQnlGaWVsZFR5cGUsXG4gIGZvcm1hdENzdlxufTtcbiJdfQ==