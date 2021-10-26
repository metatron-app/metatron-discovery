"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

var _reselect = require("reselect");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _lodash = _interopRequireDefault(require("lodash.get"));

var _defaultSettings = require("../../../constants/default-settings");

var _filterPanelHeader = _interopRequireDefault(require("./filter-panel-header"));

var _newFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/new-filter-panel"));

var _timeRangeFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/time-range-filter-panel"));

var _singleSelectFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/single-select-filter-panel"));

var _multiSelectFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/multi-select-filter-panel"));

var _rangeFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/range-filter-panel"));

var _polygonFilterPanel = _interopRequireDefault(require("../../filters/filter-panels/polygon-filter-panel"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 12px;\n  border-radius: 1px;\n\n  .filter-panel__filter {\n    margin-top: 24px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledFilterPanel = _styledComponents["default"].div(_templateObject());

FilterPanelFactory.deps = [_filterPanelHeader["default"], _newFilterPanel["default"], _timeRangeFilterPanel["default"], _singleSelectFilterPanel["default"], _multiSelectFilterPanel["default"], _rangeFilterPanel["default"], _polygonFilterPanel["default"]];

function FilterPanelFactory(FilterPanelHeader, NewFilterPanel, TimeRangeFilterPanel, SingleSelectFilterPanel, MultiSelectFilterPanel, RangeFilterPanel, PolygonFilterPanel) {
  var _FilterPanelComponent, _class, _temp;

  var FilterPanelComponents = (_FilterPanelComponent = {
    "default": NewFilterPanel
  }, (0, _defineProperty2["default"])(_FilterPanelComponent, _defaultSettings.FILTER_TYPES.timeRange, TimeRangeFilterPanel), (0, _defineProperty2["default"])(_FilterPanelComponent, _defaultSettings.FILTER_TYPES.select, SingleSelectFilterPanel), (0, _defineProperty2["default"])(_FilterPanelComponent, _defaultSettings.FILTER_TYPES.multiSelect, MultiSelectFilterPanel), (0, _defineProperty2["default"])(_FilterPanelComponent, _defaultSettings.FILTER_TYPES.range, RangeFilterPanel), (0, _defineProperty2["default"])(_FilterPanelComponent, _defaultSettings.FILTER_TYPES.polygon, PolygonFilterPanel), _FilterPanelComponent);
  return _temp = _class = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(FilterPanel, _Component);

    var _super = _createSuper(FilterPanel);

    function FilterPanel() {
      var _this;

      (0, _classCallCheck2["default"])(this, FilterPanel);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldsSelector", function (props) {
        var datasetId = props.filter.dataId[0];

        if (!datasetId) {
          return [];
        }

        return (0, _lodash["default"])(props, ['datasets', datasetId, 'fields'], []);
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "filterSelector", function (props) {
        return props.filters;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "nameSelector", function (props) {
        return props.filter.name;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "dataIdSelector", function (props) {
        return props.filter.dataId[0];
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "availableFieldsSelector", (0, _reselect.createSelector)(_this.fieldsSelector, _this.filterSelector, _this.nameSelector, _this.dataIdSelector, function (fields, filters, name, dataId) {
        return fields.filter(function (f) {
          return f.type && f.type !== _defaultSettings.ALL_FIELD_TYPES.geojson && (f.name === name || !filters.find(function (d) {
            return d.name === f.name && d.dataId === dataId;
          }));
        });
      }));
      return _this;
    }

    (0, _createClass2["default"])(FilterPanel, [{
      key: "render",
      value: function render() {
        var filter = this.props.filter;
        var type = filter.type;
        var FilterFilterComponent = type && FilterPanelComponents[type] || FilterPanelComponents["default"];
        var allAvailableFields = this.availableFieldsSelector(this.props);
        return /*#__PURE__*/_react["default"].createElement(StyledFilterPanel, {
          className: "filter-panel"
        }, /*#__PURE__*/_react["default"].createElement(FilterFilterComponent, (0, _extends2["default"])({
          allAvailableFields: allAvailableFields
        }, this.props)));
      }
    }]);
    return FilterPanel;
  }(_react.Component), (0, _defineProperty2["default"])(_class, "propTypes", {
    idx: _propTypes["default"].number,
    filters: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    filter: _propTypes["default"].object.isRequired,
    setFilter: _propTypes["default"].func.isRequired,
    removeFilter: _propTypes["default"].func.isRequired,
    enlargeFilter: _propTypes["default"].func.isRequired,
    toggleAnimation: _propTypes["default"].func.isRequired,
    toggleFilterFeature: _propTypes["default"].func.isRequired,
    datasets: _propTypes["default"].object,
    showDatasetTable: _propTypes["default"].func,
    isAnyFilterAnimating: _propTypes["default"].bool
  }), _temp;
}

var _default = FilterPanelFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvZmlsdGVyLXBhbmVsL2ZpbHRlci1wYW5lbC5qcyJdLCJuYW1lcyI6WyJTdHlsZWRGaWx0ZXJQYW5lbCIsInN0eWxlZCIsImRpdiIsIkZpbHRlclBhbmVsRmFjdG9yeSIsImRlcHMiLCJGaWx0ZXJQYW5lbEhlYWRlckZhY3RvcnkiLCJOZXdGaWx0ZXJQYW5lbEZhY3RvcnkiLCJUaW1lUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnkiLCJTaW5nbGVTZWxlY3RGaWx0ZXJQYW5lbEZhY3RvcnkiLCJNdWx0aVNlbGVjdEZpbHRlclBhbmVsRmFjdG9yeSIsIlJhbmdlRmlsdGVyUGFuZWxGYWN0b3J5IiwiUG9seWdvbkZpbHRlclBhbmVsRmFjdG9yeSIsIkZpbHRlclBhbmVsSGVhZGVyIiwiTmV3RmlsdGVyUGFuZWwiLCJUaW1lUmFuZ2VGaWx0ZXJQYW5lbCIsIlNpbmdsZVNlbGVjdEZpbHRlclBhbmVsIiwiTXVsdGlTZWxlY3RGaWx0ZXJQYW5lbCIsIlJhbmdlRmlsdGVyUGFuZWwiLCJQb2x5Z29uRmlsdGVyUGFuZWwiLCJGaWx0ZXJQYW5lbENvbXBvbmVudHMiLCJGSUxURVJfVFlQRVMiLCJ0aW1lUmFuZ2UiLCJzZWxlY3QiLCJtdWx0aVNlbGVjdCIsInJhbmdlIiwicG9seWdvbiIsInByb3BzIiwiZGF0YXNldElkIiwiZmlsdGVyIiwiZGF0YUlkIiwiZmlsdGVycyIsIm5hbWUiLCJmaWVsZHNTZWxlY3RvciIsImZpbHRlclNlbGVjdG9yIiwibmFtZVNlbGVjdG9yIiwiZGF0YUlkU2VsZWN0b3IiLCJmaWVsZHMiLCJmIiwidHlwZSIsIkFMTF9GSUVMRF9UWVBFUyIsImdlb2pzb24iLCJmaW5kIiwiZCIsIkZpbHRlckZpbHRlckNvbXBvbmVudCIsImFsbEF2YWlsYWJsZUZpZWxkcyIsImF2YWlsYWJsZUZpZWxkc1NlbGVjdG9yIiwiQ29tcG9uZW50IiwiaWR4IiwiUHJvcFR5cGVzIiwibnVtYmVyIiwiYXJyYXlPZiIsImFueSIsImlzUmVxdWlyZWQiLCJvYmplY3QiLCJzZXRGaWx0ZXIiLCJmdW5jIiwicmVtb3ZlRmlsdGVyIiwiZW5sYXJnZUZpbHRlciIsInRvZ2dsZUFuaW1hdGlvbiIsInRvZ2dsZUZpbHRlckZlYXR1cmUiLCJkYXRhc2V0cyIsInNob3dEYXRhc2V0VGFibGUiLCJpc0FueUZpbHRlckFuaW1hdGluZyIsImJvb2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsaUJBQWlCLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUF2Qjs7QUFTQUMsa0JBQWtCLENBQUNDLElBQW5CLEdBQTBCLENBQ3hCQyw2QkFEd0IsRUFFeEJDLDBCQUZ3QixFQUd4QkMsZ0NBSHdCLEVBSXhCQyxtQ0FKd0IsRUFLeEJDLGtDQUx3QixFQU14QkMsNEJBTndCLEVBT3hCQyw4QkFQd0IsQ0FBMUI7O0FBVUEsU0FBU1Isa0JBQVQsQ0FDRVMsaUJBREYsRUFFRUMsY0FGRixFQUdFQyxvQkFIRixFQUlFQyx1QkFKRixFQUtFQyxzQkFMRixFQU1FQyxnQkFORixFQU9FQyxrQkFQRixFQVFFO0FBQUE7O0FBQ0EsTUFBTUMscUJBQXFCO0FBQ3pCLGVBQVNOO0FBRGdCLDZEQUV4Qk8sOEJBQWFDLFNBRlcsRUFFQ1Asb0JBRkQsMkRBR3hCTSw4QkFBYUUsTUFIVyxFQUdGUCx1QkFIRSwyREFJeEJLLDhCQUFhRyxXQUpXLEVBSUdQLHNCQUpILDJEQUt4QkksOEJBQWFJLEtBTFcsRUFLSFAsZ0JBTEcsMkRBTXhCRyw4QkFBYUssT0FOVyxFQU1EUCxrQkFOQyx5QkFBM0I7QUFTQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEseUdBZ0JtQixVQUFBUSxLQUFLLEVBQUk7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TyxJQVZYO0FBV2pCTyxJQUFBQSxvQkFBb0IsRUFBRWQsc0JBQVVlO0FBWGYsR0FEckI7QUEwREQ7O2VBRWM1RCxrQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcbmltcG9ydCB7QUxMX0ZJRUxEX1RZUEVTLCBGSUxURVJfVFlQRVN9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcblxuaW1wb3J0IEZpbHRlclBhbmVsSGVhZGVyRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvZmlsdGVyLXBhbmVsL2ZpbHRlci1wYW5lbC1oZWFkZXInO1xuaW1wb3J0IE5ld0ZpbHRlclBhbmVsRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2ZpbHRlcnMvZmlsdGVyLXBhbmVscy9uZXctZmlsdGVyLXBhbmVsJztcbmltcG9ydCBUaW1lUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9maWx0ZXJzL2ZpbHRlci1wYW5lbHMvdGltZS1yYW5nZS1maWx0ZXItcGFuZWwnO1xuaW1wb3J0IFNpbmdsZVNlbGVjdEZpbHRlclBhbmVsRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2ZpbHRlcnMvZmlsdGVyLXBhbmVscy9zaW5nbGUtc2VsZWN0LWZpbHRlci1wYW5lbCc7XG5pbXBvcnQgTXVsdGlTZWxlY3RGaWx0ZXJQYW5lbEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9maWx0ZXJzL2ZpbHRlci1wYW5lbHMvbXVsdGktc2VsZWN0LWZpbHRlci1wYW5lbCc7XG5pbXBvcnQgUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9maWx0ZXJzL2ZpbHRlci1wYW5lbHMvcmFuZ2UtZmlsdGVyLXBhbmVsJztcbmltcG9ydCBQb2x5Z29uRmlsdGVyUGFuZWxGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvZmlsdGVycy9maWx0ZXItcGFuZWxzL3BvbHlnb24tZmlsdGVyLXBhbmVsJztcblxuY29uc3QgU3R5bGVkRmlsdGVyUGFuZWwgPSBzdHlsZWQuZGl2YFxuICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICBib3JkZXItcmFkaXVzOiAxcHg7XG5cbiAgLmZpbHRlci1wYW5lbF9fZmlsdGVyIHtcbiAgICBtYXJnaW4tdG9wOiAyNHB4O1xuICB9XG5gO1xuXG5GaWx0ZXJQYW5lbEZhY3RvcnkuZGVwcyA9IFtcbiAgRmlsdGVyUGFuZWxIZWFkZXJGYWN0b3J5LFxuICBOZXdGaWx0ZXJQYW5lbEZhY3RvcnksXG4gIFRpbWVSYW5nZUZpbHRlclBhbmVsRmFjdG9yeSxcbiAgU2luZ2xlU2VsZWN0RmlsdGVyUGFuZWxGYWN0b3J5LFxuICBNdWx0aVNlbGVjdEZpbHRlclBhbmVsRmFjdG9yeSxcbiAgUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnksXG4gIFBvbHlnb25GaWx0ZXJQYW5lbEZhY3Rvcnlcbl07XG5cbmZ1bmN0aW9uIEZpbHRlclBhbmVsRmFjdG9yeShcbiAgRmlsdGVyUGFuZWxIZWFkZXIsXG4gIE5ld0ZpbHRlclBhbmVsLFxuICBUaW1lUmFuZ2VGaWx0ZXJQYW5lbCxcbiAgU2luZ2xlU2VsZWN0RmlsdGVyUGFuZWwsXG4gIE11bHRpU2VsZWN0RmlsdGVyUGFuZWwsXG4gIFJhbmdlRmlsdGVyUGFuZWwsXG4gIFBvbHlnb25GaWx0ZXJQYW5lbFxuKSB7XG4gIGNvbnN0IEZpbHRlclBhbmVsQ29tcG9uZW50cyA9IHtcbiAgICBkZWZhdWx0OiBOZXdGaWx0ZXJQYW5lbCxcbiAgICBbRklMVEVSX1RZUEVTLnRpbWVSYW5nZV06IFRpbWVSYW5nZUZpbHRlclBhbmVsLFxuICAgIFtGSUxURVJfVFlQRVMuc2VsZWN0XTogU2luZ2xlU2VsZWN0RmlsdGVyUGFuZWwsXG4gICAgW0ZJTFRFUl9UWVBFUy5tdWx0aVNlbGVjdF06IE11bHRpU2VsZWN0RmlsdGVyUGFuZWwsXG4gICAgW0ZJTFRFUl9UWVBFUy5yYW5nZV06IFJhbmdlRmlsdGVyUGFuZWwsXG4gICAgW0ZJTFRFUl9UWVBFUy5wb2x5Z29uXTogUG9seWdvbkZpbHRlclBhbmVsXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEZpbHRlclBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgaWR4OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgZmlsdGVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGZpbHRlcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgc2V0RmlsdGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgcmVtb3ZlRmlsdGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgZW5sYXJnZUZpbHRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHRvZ2dsZUFuaW1hdGlvbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHRvZ2dsZUZpbHRlckZlYXR1cmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBkYXRhc2V0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIHNob3dEYXRhc2V0VGFibGU6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgaXNBbnlGaWx0ZXJBbmltYXRpbmc6IFByb3BUeXBlcy5ib29sXG4gICAgfTtcblxuICAgIC8qIHNlbGVjdG9ycyAqL1xuICAgIGZpZWxkc1NlbGVjdG9yID0gcHJvcHMgPT4ge1xuICAgICAgY29uc3QgZGF0YXNldElkID0gcHJvcHMuZmlsdGVyLmRhdGFJZFswXTtcbiAgICAgIGlmICghZGF0YXNldElkKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXQocHJvcHMsIFsnZGF0YXNldHMnLCBkYXRhc2V0SWQsICdmaWVsZHMnXSwgW10pO1xuICAgIH07XG5cbiAgICBmaWx0ZXJTZWxlY3RvciA9IHByb3BzID0+IHByb3BzLmZpbHRlcnM7XG4gICAgbmFtZVNlbGVjdG9yID0gcHJvcHMgPT4gcHJvcHMuZmlsdGVyLm5hbWU7XG4gICAgZGF0YUlkU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5maWx0ZXIuZGF0YUlkWzBdO1xuXG4gICAgLy8gb25seSBzaG93IGN1cnJlbnQgZmllbGQgYW5kIGZpZWxkIHRoYXQncyBub3QgYWxyZWFkeSBiZWVuIHVzZWQgYXMgYSBmaWx0ZXJcbiAgICBhdmFpbGFibGVGaWVsZHNTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy5maWVsZHNTZWxlY3RvcixcbiAgICAgIHRoaXMuZmlsdGVyU2VsZWN0b3IsXG4gICAgICB0aGlzLm5hbWVTZWxlY3RvcixcbiAgICAgIHRoaXMuZGF0YUlkU2VsZWN0b3IsXG4gICAgICAoZmllbGRzLCBmaWx0ZXJzLCBuYW1lLCBkYXRhSWQpID0+XG4gICAgICAgIGZpZWxkcy5maWx0ZXIoXG4gICAgICAgICAgZiA9PlxuICAgICAgICAgICAgZi50eXBlICYmXG4gICAgICAgICAgICBmLnR5cGUgIT09IEFMTF9GSUVMRF9UWVBFUy5nZW9qc29uICYmXG4gICAgICAgICAgICAoZi5uYW1lID09PSBuYW1lIHx8ICFmaWx0ZXJzLmZpbmQoZCA9PiBkLm5hbWUgPT09IGYubmFtZSAmJiBkLmRhdGFJZCA9PT0gZGF0YUlkKSlcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7ZmlsdGVyfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGNvbnN0IHt0eXBlfSA9IGZpbHRlcjtcbiAgICAgIGNvbnN0IEZpbHRlckZpbHRlckNvbXBvbmVudCA9XG4gICAgICAgICh0eXBlICYmIEZpbHRlclBhbmVsQ29tcG9uZW50c1t0eXBlXSkgfHwgRmlsdGVyUGFuZWxDb21wb25lbnRzLmRlZmF1bHQ7XG4gICAgICBjb25zdCBhbGxBdmFpbGFibGVGaWVsZHMgPSB0aGlzLmF2YWlsYWJsZUZpZWxkc1NlbGVjdG9yKHRoaXMucHJvcHMpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8U3R5bGVkRmlsdGVyUGFuZWwgY2xhc3NOYW1lPVwiZmlsdGVyLXBhbmVsXCI+XG4gICAgICAgICAgPEZpbHRlckZpbHRlckNvbXBvbmVudCBhbGxBdmFpbGFibGVGaWVsZHM9e2FsbEF2YWlsYWJsZUZpZWxkc30gey4uLnRoaXMucHJvcHN9IC8+XG4gICAgICAgIDwvU3R5bGVkRmlsdGVyUGFuZWw+XG4gICAgICApO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyUGFuZWxGYWN0b3J5O1xuIl19