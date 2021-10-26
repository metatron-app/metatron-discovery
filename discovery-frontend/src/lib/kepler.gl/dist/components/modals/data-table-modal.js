"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.DatasetTabs = exports.DatasetModalTab = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _datasetLabel = _interopRequireDefault(require("../common/dataset-label"));

var _dataTable = _interopRequireDefault(require("../common/data-table"));

var _reselect = require("reselect");

var _cellSize = require("../common/data-table/cell-size");

var _canvas = _interopRequireDefault(require("../common/data-table/canvas"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  flex-grow: 1;\n  min-height: 70vh;\n  max-height: 70vh;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  border-bottom: 3px solid ", ";\n  cursor: pointer;\n  display: flex;\n  height: 35px;\n  margin: 0 3px;\n  padding: 0 5px;\n\n  :first-child {\n    margin-left: 0;\n    padding-left: 0;\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  padding: ", " ", " 0;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  min-height: 70vh;\n  overflow: hidden;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var dgSettings = {
  sidePadding: '38px',
  verticalPadding: '16px',
  height: '36px'
};

var StyledModal = _styledComponents["default"].div(_templateObject());

var DatasetCatalog = _styledComponents["default"].div(_templateObject2(), dgSettings.verticalPadding, dgSettings.sidePadding);

var DatasetModalTab = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.active ? 'black' : 'transparent';
});

exports.DatasetModalTab = DatasetModalTab;

var DatasetTabsUnmemoized = function DatasetTabsUnmemoized(_ref) {
  var activeDataset = _ref.activeDataset,
      datasets = _ref.datasets,
      showDatasetTable = _ref.showDatasetTable;
  return /*#__PURE__*/_react["default"].createElement(DatasetCatalog, {
    className: "dataset-modal-catalog"
  }, Object.values(datasets).map(function (dataset) {
    return /*#__PURE__*/_react["default"].createElement(DatasetModalTab, {
      className: "dataset-modal-tab",
      active: dataset === activeDataset,
      key: dataset.id,
      onClick: function onClick() {
        return showDatasetTable(dataset.id);
      }
    }, /*#__PURE__*/_react["default"].createElement(_datasetLabel["default"], {
      dataset: dataset
    }));
  }));
};

var DatasetTabs = /*#__PURE__*/_react["default"].memo(DatasetTabsUnmemoized);

exports.DatasetTabs = DatasetTabs;
DatasetTabs.displayName = 'DatasetTabs';
DataTableModalFactory.deps = [_dataTable["default"]];

var TableContainer = _styledComponents["default"].div(_templateObject4());

function DataTableModalFactory(DataTable) {
  var DataTableModal = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DataTableModal, _React$Component);

    var _super = _createSuper(DataTableModal);

    function DataTableModal() {
      var _this;

      (0, _classCallCheck2["default"])(this, DataTableModal);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "datasetCellSizeCache", {});
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "dataId", function (props) {
        return props.dataId;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "datasets", function (props) {
        return props.datasets;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fields", function (props) {
        return (props.datasets[props.dataId] || {}).fields;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "columns", (0, _reselect.createSelector)(_this.fields, function (fields) {
        return fields.map(function (f) {
          return f.name;
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "colMeta", (0, _reselect.createSelector)(_this.fields, function (fields) {
        return fields.reduce(function (acc, _ref2) {
          var name = _ref2.name,
              type = _ref2.type;
          return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, name, type));
        }, {});
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "cellSizeCache", (0, _reselect.createSelector)(_this.dataId, _this.datasets, function (dataId, datasets) {
        if (!_this.props.datasets[dataId]) {
          return {};
        }

        var _this$props$datasets$ = _this.props.datasets[dataId],
            fields = _this$props$datasets$.fields,
            allData = _this$props$datasets$.allData;
        var showCalculate = null;

        if (!_this.datasetCellSizeCache[dataId]) {
          showCalculate = true;
        } else if (_this.datasetCellSizeCache[dataId].fields !== fields || _this.datasetCellSizeCache[dataId].allData !== allData) {
          showCalculate = true;
        }

        if (!showCalculate) {
          return _this.datasetCellSizeCache[dataId].cellSizeCache;
        }

        var cellSizeCache = fields.reduce(function (acc, field, colIdx) {
          return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, field.name, (0, _cellSize.renderedSize)({
            text: {
              rows: allData,
              column: field.name
            },
            colIdx: colIdx,
            type: field.type,
            fontSize: _this.props.theme.cellFontSize,
            font: _this.props.theme.fontFamily
          })));
        }, {}); // save it to cache

        _this.datasetCellSizeCache[dataId] = {
          cellSizeCache: cellSizeCache,
          fields: fields,
          allData: allData
        };
        return cellSizeCache;
      }));
      return _this;
    }

    (0, _createClass2["default"])(DataTableModal, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            datasets = _this$props.datasets,
            dataId = _this$props.dataId,
            showDatasetTable = _this$props.showDatasetTable;

        if (!datasets || !dataId) {
          return null;
        }

        var activeDataset = datasets[dataId];
        var columns = this.columns(this.props);
        var colMeta = this.colMeta(this.props);
        var cellSizeCache = this.cellSizeCache(this.props);
        return /*#__PURE__*/_react["default"].createElement(StyledModal, {
          className: "dataset-modal",
          id: "dataset-modal"
        }, /*#__PURE__*/_react["default"].createElement(_canvas["default"], null), /*#__PURE__*/_react["default"].createElement(TableContainer, null, /*#__PURE__*/_react["default"].createElement(DatasetTabs, {
          activeDataset: activeDataset,
          datasets: datasets,
          showDatasetTable: showDatasetTable
        }), datasets[dataId] ? /*#__PURE__*/_react["default"].createElement(DataTable, {
          key: dataId,
          dataId: dataId,
          columns: columns,
          colMeta: colMeta,
          cellSizeCache: cellSizeCache,
          rows: activeDataset.allData,
          pinnedColumns: activeDataset.pinnedColumns,
          sortOrder: activeDataset.sortOrder,
          sortColumn: activeDataset.sortColumn,
          copyTableColumn: this.props.copyTableColumn,
          pinTableColumn: this.props.pinTableColumn,
          sortTableColumn: this.props.sortTableColumn
        }) : null));
      }
    }]);
    return DataTableModal;
  }(_react["default"].Component);

  return (0, _styledComponents.withTheme)(DataTableModal);
}

var _default = DataTableModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9kYXRhLXRhYmxlLW1vZGFsLmpzIl0sIm5hbWVzIjpbImRnU2V0dGluZ3MiLCJzaWRlUGFkZGluZyIsInZlcnRpY2FsUGFkZGluZyIsImhlaWdodCIsIlN0eWxlZE1vZGFsIiwic3R5bGVkIiwiZGl2IiwiRGF0YXNldENhdGFsb2ciLCJEYXRhc2V0TW9kYWxUYWIiLCJwcm9wcyIsImFjdGl2ZSIsIkRhdGFzZXRUYWJzVW5tZW1vaXplZCIsImFjdGl2ZURhdGFzZXQiLCJkYXRhc2V0cyIsInNob3dEYXRhc2V0VGFibGUiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJkYXRhc2V0IiwiaWQiLCJEYXRhc2V0VGFicyIsIlJlYWN0IiwibWVtbyIsImRpc3BsYXlOYW1lIiwiRGF0YVRhYmxlTW9kYWxGYWN0b3J5IiwiZGVwcyIsIkRhdGFUYWJsZUZhY3RvcnkiLCJUYWJsZUNvbnRhaW5lciIsIkRhdGFUYWJsZSIsIkRhdGFUYWJsZU1vZGFsIiwiZGF0YUlkIiwiZmllbGRzIiwiZiIsIm5hbWUiLCJyZWR1Y2UiLCJhY2MiLCJ0eXBlIiwiYWxsRGF0YSIsInNob3dDYWxjdWxhdGUiLCJkYXRhc2V0Q2VsbFNpemVDYWNoZSIsImNlbGxTaXplQ2FjaGUiLCJmaWVsZCIsImNvbElkeCIsInRleHQiLCJyb3dzIiwiY29sdW1uIiwiZm9udFNpemUiLCJ0aGVtZSIsImNlbGxGb250U2l6ZSIsImZvbnQiLCJmb250RmFtaWx5IiwiY29sdW1ucyIsImNvbE1ldGEiLCJwaW5uZWRDb2x1bW5zIiwic29ydE9yZGVyIiwic29ydENvbHVtbiIsImNvcHlUYWJsZUNvbHVtbiIsInBpblRhYmxlQ29sdW1uIiwic29ydFRhYmxlQ29sdW1uIiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7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LFNBQVMsRUFBQyxlQUF2QjtBQUF1QyxVQUFBLEVBQUUsRUFBQztBQUExQyx3QkFDRSxnQ0FBQyxrQkFBRCxPQURGLGVBRUUsZ0NBQUMsY0FBRCxxQkFDRSxnQ0FBQyxXQUFEO0FBQ0UsVUFBQSxhQUFhLEVBQUVHLGFBRGpCO0FBRUUsVUFBQSxRQUFRLEVBQUVDLFFBRlo7QUFHRSxVQUFBLGdCQUFnQixFQUFFQztBQUhwQixVQURGLEVBTUdELFFBQVEsQ0FBQ2lCLE1BQUQsQ0FBUixnQkFDQyxnQ0FBQyxTQUFEO0FBQ0UsVUFBQSxHQUFHLEVBQUVBLE1BRFA7QUFFRSxVQUFBLE1BQU0sRUFBRUEsTUFGVjtBQUdFLFVBQUEsT0FBTyxFQUFFcUIsT0FIWDtBQUlFLFVBQUEsT0FBTyxFQUFFQyxPQUpYO0FBS0UsVUFBQSxhQUFhLEVBQUVaLGFBTGpCO0FBTUUsVUFBQSxJQUFJLEVBQUU1QixhQUFhLENBQUN5QixPQU50QjtBQU9FLFVBQUEsYUFBYSxFQUFFekIsYUFBYSxDQUFDeUMsYUFQL0I7QUFRRSxVQUFBLFNBQVMsRUFBRXpDLGFBQWEsQ0FBQzBDLFNBUjNCO0FBU0UsVUFBQSxVQUFVLEVBQUUxQyxhQUFhLENBQUMyQyxVQVQ1QjtBQVVFLFVBQUEsZUFBZSxFQUFFLEtBQUs5QyxLQUFMLENBQVcrQyxlQVY5QjtBQVdFLFVBQUEsY0FBYyxFQUFFLEtBQUsvQyxLQUFMLENBQVdnRCxjQVg3QjtBQVlFLFVBQUEsZUFBZSxFQUFFLEtBQUtoRCxLQUFMLENBQVdpRDtBQVo5QixVQURELEdBZUcsSUFyQk4sQ0FGRixDQURGO0FBNEJEO0FBcEdxQztBQUFBO0FBQUEsSUFDWHJDLGtCQUFNc0MsU0FESzs7QUF1R3hDLFNBQU8saUNBQVU5QixjQUFWLENBQVA7QUFDRDs7ZUFFY0wscUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCwge3dpdGhUaGVtZX0gZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IERhdGFzZXRMYWJlbCBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9kYXRhc2V0LWxhYmVsJztcbmltcG9ydCBEYXRhVGFibGVGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2RhdGEtdGFibGUnO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuaW1wb3J0IHtyZW5kZXJlZFNpemV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2RhdGEtdGFibGUvY2VsbC1zaXplJztcbmltcG9ydCBDYW52YXNIYWNrIGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2RhdGEtdGFibGUvY2FudmFzJztcblxuY29uc3QgZGdTZXR0aW5ncyA9IHtcbiAgc2lkZVBhZGRpbmc6ICczOHB4JyxcbiAgdmVydGljYWxQYWRkaW5nOiAnMTZweCcsXG4gIGhlaWdodDogJzM2cHgnXG59O1xuXG5jb25zdCBTdHlsZWRNb2RhbCA9IHN0eWxlZC5kaXZgXG4gIG1pbi1oZWlnaHQ6IDcwdmg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG5gO1xuXG5jb25zdCBEYXRhc2V0Q2F0YWxvZyA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIHBhZGRpbmc6ICR7ZGdTZXR0aW5ncy52ZXJ0aWNhbFBhZGRpbmd9ICR7ZGdTZXR0aW5ncy5zaWRlUGFkZGluZ30gMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBEYXRhc2V0TW9kYWxUYWIgPSBzdHlsZWQuZGl2YFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBib3JkZXItYm90dG9tOiAzcHggc29saWQgJHtwcm9wcyA9PiAocHJvcHMuYWN0aXZlID8gJ2JsYWNrJyA6ICd0cmFuc3BhcmVudCcpfTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBkaXNwbGF5OiBmbGV4O1xuICBoZWlnaHQ6IDM1cHg7XG4gIG1hcmdpbjogMCAzcHg7XG4gIHBhZGRpbmc6IDAgNXB4O1xuXG4gIDpmaXJzdC1jaGlsZCB7XG4gICAgbWFyZ2luLWxlZnQ6IDA7XG4gICAgcGFkZGluZy1sZWZ0OiAwO1xuICB9XG5gO1xuXG5jb25zdCBEYXRhc2V0VGFic1VubWVtb2l6ZWQgPSAoe2FjdGl2ZURhdGFzZXQsIGRhdGFzZXRzLCBzaG93RGF0YXNldFRhYmxlfSkgPT4gKFxuICA8RGF0YXNldENhdGFsb2cgY2xhc3NOYW1lPVwiZGF0YXNldC1tb2RhbC1jYXRhbG9nXCI+XG4gICAge09iamVjdC52YWx1ZXMoZGF0YXNldHMpLm1hcChkYXRhc2V0ID0+IChcbiAgICAgIDxEYXRhc2V0TW9kYWxUYWJcbiAgICAgICAgY2xhc3NOYW1lPVwiZGF0YXNldC1tb2RhbC10YWJcIlxuICAgICAgICBhY3RpdmU9e2RhdGFzZXQgPT09IGFjdGl2ZURhdGFzZXR9XG4gICAgICAgIGtleT17ZGF0YXNldC5pZH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2hvd0RhdGFzZXRUYWJsZShkYXRhc2V0LmlkKX1cbiAgICAgID5cbiAgICAgICAgPERhdGFzZXRMYWJlbCBkYXRhc2V0PXtkYXRhc2V0fSAvPlxuICAgICAgPC9EYXRhc2V0TW9kYWxUYWI+XG4gICAgKSl9XG4gIDwvRGF0YXNldENhdGFsb2c+XG4pO1xuXG5leHBvcnQgY29uc3QgRGF0YXNldFRhYnMgPSBSZWFjdC5tZW1vKERhdGFzZXRUYWJzVW5tZW1vaXplZCk7XG5cbkRhdGFzZXRUYWJzLmRpc3BsYXlOYW1lID0gJ0RhdGFzZXRUYWJzJztcblxuRGF0YVRhYmxlTW9kYWxGYWN0b3J5LmRlcHMgPSBbRGF0YVRhYmxlRmFjdG9yeV07XG5cbmNvbnN0IFRhYmxlQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZmxleC1ncm93OiAxO1xuICBtaW4taGVpZ2h0OiA3MHZoO1xuICBtYXgtaGVpZ2h0OiA3MHZoO1xuYDtcblxuZnVuY3Rpb24gRGF0YVRhYmxlTW9kYWxGYWN0b3J5KERhdGFUYWJsZSkge1xuICBjbGFzcyBEYXRhVGFibGVNb2RhbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgZGF0YXNldENlbGxTaXplQ2FjaGUgPSB7fTtcbiAgICBkYXRhSWQgPSBwcm9wcyA9PiBwcm9wcy5kYXRhSWQ7XG4gICAgZGF0YXNldHMgPSBwcm9wcyA9PiBwcm9wcy5kYXRhc2V0cztcbiAgICBmaWVsZHMgPSBwcm9wcyA9PiAocHJvcHMuZGF0YXNldHNbcHJvcHMuZGF0YUlkXSB8fCB7fSkuZmllbGRzO1xuICAgIGNvbHVtbnMgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLmZpZWxkcywgZmllbGRzID0+IGZpZWxkcy5tYXAoZiA9PiBmLm5hbWUpKTtcbiAgICBjb2xNZXRhID0gY3JlYXRlU2VsZWN0b3IodGhpcy5maWVsZHMsIGZpZWxkcyA9PlxuICAgICAgZmllbGRzLnJlZHVjZShcbiAgICAgICAgKGFjYywge25hbWUsIHR5cGV9KSA9PiAoe1xuICAgICAgICAgIC4uLmFjYyxcbiAgICAgICAgICBbbmFtZV06IHR5cGVcbiAgICAgICAgfSksXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgKTtcbiAgICBjZWxsU2l6ZUNhY2hlID0gY3JlYXRlU2VsZWN0b3IodGhpcy5kYXRhSWQsIHRoaXMuZGF0YXNldHMsIChkYXRhSWQsIGRhdGFzZXRzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMuZGF0YXNldHNbZGF0YUlkXSkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgICBjb25zdCB7ZmllbGRzLCBhbGxEYXRhfSA9IHRoaXMucHJvcHMuZGF0YXNldHNbZGF0YUlkXTtcblxuICAgICAgbGV0IHNob3dDYWxjdWxhdGUgPSBudWxsO1xuICAgICAgaWYgKCF0aGlzLmRhdGFzZXRDZWxsU2l6ZUNhY2hlW2RhdGFJZF0pIHtcbiAgICAgICAgc2hvd0NhbGN1bGF0ZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0aGlzLmRhdGFzZXRDZWxsU2l6ZUNhY2hlW2RhdGFJZF0uZmllbGRzICE9PSBmaWVsZHMgfHxcbiAgICAgICAgdGhpcy5kYXRhc2V0Q2VsbFNpemVDYWNoZVtkYXRhSWRdLmFsbERhdGEgIT09IGFsbERhdGFcbiAgICAgICkge1xuICAgICAgICBzaG93Q2FsY3VsYXRlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzaG93Q2FsY3VsYXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFzZXRDZWxsU2l6ZUNhY2hlW2RhdGFJZF0uY2VsbFNpemVDYWNoZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2VsbFNpemVDYWNoZSA9IGZpZWxkcy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIGZpZWxkLCBjb2xJZHgpID0+ICh7XG4gICAgICAgICAgLi4uYWNjLFxuICAgICAgICAgIFtmaWVsZC5uYW1lXTogcmVuZGVyZWRTaXplKHtcbiAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgcm93czogYWxsRGF0YSxcbiAgICAgICAgICAgICAgY29sdW1uOiBmaWVsZC5uYW1lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29sSWR4LFxuICAgICAgICAgICAgdHlwZTogZmllbGQudHlwZSxcbiAgICAgICAgICAgIGZvbnRTaXplOiB0aGlzLnByb3BzLnRoZW1lLmNlbGxGb250U2l6ZSxcbiAgICAgICAgICAgIGZvbnQ6IHRoaXMucHJvcHMudGhlbWUuZm9udEZhbWlseVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pLFxuICAgICAgICB7fVxuICAgICAgKTtcbiAgICAgIC8vIHNhdmUgaXQgdG8gY2FjaGVcbiAgICAgIHRoaXMuZGF0YXNldENlbGxTaXplQ2FjaGVbZGF0YUlkXSA9IHtcbiAgICAgICAgY2VsbFNpemVDYWNoZSxcbiAgICAgICAgZmllbGRzLFxuICAgICAgICBhbGxEYXRhXG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNlbGxTaXplQ2FjaGU7XG4gICAgfSk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7ZGF0YXNldHMsIGRhdGFJZCwgc2hvd0RhdGFzZXRUYWJsZX0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKCFkYXRhc2V0cyB8fCAhZGF0YUlkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVEYXRhc2V0ID0gZGF0YXNldHNbZGF0YUlkXTtcbiAgICAgIGNvbnN0IGNvbHVtbnMgPSB0aGlzLmNvbHVtbnModGhpcy5wcm9wcyk7XG4gICAgICBjb25zdCBjb2xNZXRhID0gdGhpcy5jb2xNZXRhKHRoaXMucHJvcHMpO1xuICAgICAgY29uc3QgY2VsbFNpemVDYWNoZSA9IHRoaXMuY2VsbFNpemVDYWNoZSh0aGlzLnByb3BzKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZE1vZGFsIGNsYXNzTmFtZT1cImRhdGFzZXQtbW9kYWxcIiBpZD1cImRhdGFzZXQtbW9kYWxcIj5cbiAgICAgICAgICA8Q2FudmFzSGFjayAvPlxuICAgICAgICAgIDxUYWJsZUNvbnRhaW5lcj5cbiAgICAgICAgICAgIDxEYXRhc2V0VGFic1xuICAgICAgICAgICAgICBhY3RpdmVEYXRhc2V0PXthY3RpdmVEYXRhc2V0fVxuICAgICAgICAgICAgICBkYXRhc2V0cz17ZGF0YXNldHN9XG4gICAgICAgICAgICAgIHNob3dEYXRhc2V0VGFibGU9e3Nob3dEYXRhc2V0VGFibGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2RhdGFzZXRzW2RhdGFJZF0gPyAoXG4gICAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgICBrZXk9e2RhdGFJZH1cbiAgICAgICAgICAgICAgICBkYXRhSWQ9e2RhdGFJZH1cbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIGNvbE1ldGE9e2NvbE1ldGF9XG4gICAgICAgICAgICAgICAgY2VsbFNpemVDYWNoZT17Y2VsbFNpemVDYWNoZX1cbiAgICAgICAgICAgICAgICByb3dzPXthY3RpdmVEYXRhc2V0LmFsbERhdGF9XG4gICAgICAgICAgICAgICAgcGlubmVkQ29sdW1ucz17YWN0aXZlRGF0YXNldC5waW5uZWRDb2x1bW5zfVxuICAgICAgICAgICAgICAgIHNvcnRPcmRlcj17YWN0aXZlRGF0YXNldC5zb3J0T3JkZXJ9XG4gICAgICAgICAgICAgICAgc29ydENvbHVtbj17YWN0aXZlRGF0YXNldC5zb3J0Q29sdW1ufVxuICAgICAgICAgICAgICAgIGNvcHlUYWJsZUNvbHVtbj17dGhpcy5wcm9wcy5jb3B5VGFibGVDb2x1bW59XG4gICAgICAgICAgICAgICAgcGluVGFibGVDb2x1bW49e3RoaXMucHJvcHMucGluVGFibGVDb2x1bW59XG4gICAgICAgICAgICAgICAgc29ydFRhYmxlQ29sdW1uPXt0aGlzLnByb3BzLnNvcnRUYWJsZUNvbHVtbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvVGFibGVDb250YWluZXI+XG4gICAgICAgIDwvU3R5bGVkTW9kYWw+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3aXRoVGhlbWUoRGF0YVRhYmxlTW9kYWwpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBEYXRhVGFibGVNb2RhbEZhY3Rvcnk7XG4iXX0=