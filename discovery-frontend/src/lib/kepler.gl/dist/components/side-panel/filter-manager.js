"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reselect = require("reselect");

var _localization = require("../../localization");

var _styledComponents = require("../common/styled-components");

var _icons = require("../common/icons");

var _sourceDataCatalog = _interopRequireDefault(require("./common/source-data-catalog"));

var _filterPanel = _interopRequireDefault(require("./filter-panel/filter-panel"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

FilterManagerFactory.deps = [_sourceDataCatalog["default"], _filterPanel["default"]];

function FilterManagerFactory(SourceDataCatalog, FilterPanel) {
  var _class, _temp;

  return _temp = _class = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(FilterManager, _Component);

    var _super = _createSuper(FilterManager);

    function FilterManager() {
      var _this;

      (0, _classCallCheck2["default"])(this, FilterManager);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "datasetsSelector", function (state) {
        return state.datasets;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "defaultDatasetSelector", (0, _reselect.createSelector)(_this.datasetsSelector, function (datasets) {
        return Object.keys(datasets).length && Object.keys(datasets)[0] || null;
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_addFilter", function () {
        var defaultDataset = _this.defaultDatasetSelector(_this.props);

        _this.props.addFilter(defaultDataset);
      });
      return _this;
    }

    (0, _createClass2["default"])(FilterManager, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props = this.props,
            filters = _this$props.filters,
            datasets = _this$props.datasets,
            layers = _this$props.layers;
        var isAnyFilterAnimating = filters.some(function (f) {
          return f.isAnimating;
        });
        var hadEmptyFilter = filters.some(function (f) {
          return !f.name;
        });
        var hadDataset = Object.keys(datasets).length;
        return /*#__PURE__*/_react["default"].createElement("div", {
          className: "filter-manager"
        }, /*#__PURE__*/_react["default"].createElement(SourceDataCatalog, {
          datasets: datasets,
          showDatasetTable: this.props.showDatasetTable
        }), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelDivider, null), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, filters && filters.map(function (filter, idx) {
          return /*#__PURE__*/_react["default"].createElement(FilterPanel, {
            key: "".concat(filter.id, "-").concat(idx),
            idx: idx,
            filters: filters,
            filter: filter,
            datasets: datasets,
            layers: layers,
            isAnyFilterAnimating: isAnyFilterAnimating,
            removeFilter: function removeFilter() {
              return _this2.props.removeFilter(idx);
            },
            enlargeFilter: function enlargeFilter() {
              return _this2.props.enlargeFilter(idx);
            },
            toggleAnimation: function toggleAnimation() {
              return _this2.props.toggleAnimation(idx);
            },
            toggleFilterFeature: function toggleFilterFeature() {
              return _this2.props.toggleFilterFeature(idx);
            },
            setFilter: _this2.props.setFilter
          });
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents.Button, {
          className: "add-filter-button",
          inactive: hadEmptyFilter || !hadDataset,
          width: "105px",
          onClick: this._addFilter
        }, /*#__PURE__*/_react["default"].createElement(_icons.Add, {
          height: "12px"
        }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'filterManager.addFilter'
        })));
      }
    }]);
    return FilterManager;
  }(_react.Component), (0, _defineProperty2["default"])(_class, "propTypes", {
    datasets: _propTypes["default"].object,
    layers: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    addFilter: _propTypes["default"].func.isRequired,
    removeFilter: _propTypes["default"].func.isRequired,
    enlargeFilter: _propTypes["default"].func.isRequired,
    toggleAnimation: _propTypes["default"].func.isRequired,
    toggleFilterFeature: _propTypes["default"].func.isRequired,
    setFilter: _propTypes["default"].func.isRequired,
    filters: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    showDatasetTable: _propTypes["default"].func,
    // fields can be undefined when dataset is not selected
    fields: _propTypes["default"].arrayOf(_propTypes["default"].any)
  }), _temp;
}

var _default = FilterManagerFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvZmlsdGVyLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiRmlsdGVyTWFuYWdlckZhY3RvcnkiLCJkZXBzIiwiU291cmNlRGF0YUNhdGFsb2dGYWN0b3J5IiwiRmlsdGVyUGFuZWxGYWN0b3J5IiwiU291cmNlRGF0YUNhdGFsb2ciLCJGaWx0ZXJQYW5lbCIsInN0YXRlIiwiZGF0YXNldHMiLCJkYXRhc2V0c1NlbGVjdG9yIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImRlZmF1bHREYXRhc2V0IiwiZGVmYXVsdERhdGFzZXRTZWxlY3RvciIsInByb3BzIiwiYWRkRmlsdGVyIiwiZmlsdGVycyIsImxheWVycyIsImlzQW55RmlsdGVyQW5pbWF0aW5nIiwic29tZSIsImYiLCJpc0FuaW1hdGluZyIsImhhZEVtcHR5RmlsdGVyIiwibmFtZSIsImhhZERhdGFzZXQiLCJzaG93RGF0YXNldFRhYmxlIiwibWFwIiwiZmlsdGVyIiwiaWR4IiwiaWQiLCJyZW1vdmVGaWx0ZXIiLCJlbmxhcmdlRmlsdGVyIiwidG9nZ2xlQW5pbWF0aW9uIiwidG9nZ2xlRmlsdGVyRmVhdHVyZSIsInNldEZpbHRlciIsIl9hZGRGaWx0ZXIiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJhcnJheU9mIiwiYW55IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJmaWVsZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBQSxvQkFBb0IsQ0FBQ0MsSUFBckIsR0FBNEIsQ0FBQ0MsNkJBQUQsRUFBMkJDLHVCQUEzQixDQUE1Qjs7QUFFQSxTQUFTSCxvQkFBVCxDQUE4QkksaUJBQTlCLEVBQWlEQyxXQUFqRCxFQUE4RDtBQUFBOztBQUM1RDtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBQUE7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SyxFQUFDLE9BSFI7QUFJRSxVQUFBLE9BQU8sRUFBRSxLQUFLVztBQUpoQix3QkFNRSxnQ0FBQyxVQUFEO0FBQUssVUFBQSxNQUFNLEVBQUM7QUFBWixVQU5GLGVBT0UsZ0NBQUMsOEJBQUQ7QUFBa0IsVUFBQSxFQUFFLEVBQUU7QUFBdEIsVUFQRixDQXRCRixDQURGO0FBa0NEO0FBdEVIO0FBQUE7QUFBQSxJQUFtQ0MsZ0JBQW5DLHlEQUNxQjtBQUNqQjdCLElBQUFBLFFBQVEsRUFBRThCLHNCQUFVQyxNQURIO0FBRWpCckIsSUFBQUEsTUFBTSxFQUFFb0Isc0JBQVVFLE9BQVYsQ0FBa0JGLHNCQUFVRyxHQUE1QixFQUFpQ0MsVUFGeEI7QUFHakIxQixJQUFBQSxTQUFTLEVBQUVzQixzQkFBVUssSUFBVixDQUFlRCxVQUhUO0FBSWpCWCxJQUFBQSxZQUFZLEVBQUVPLHNCQUFVSyxJQUFWLENBQWVELFVBSlo7QUFLakJWLElBQUFBLGFBQWEsRUFBRU0sc0JBQVVLLElBQVYsQ0FBZUQsVUFMYjtBQU1qQlQsSUFBQUEsZUFBZSxFQUFFSyxzQkFBVUssSUFBVixDQUFlRCxVQU5mO0FBT2pCUixJQUFBQSxtQkFBbUIsRUFBRUksc0JBQVVLLElBQVYsQ0FBZUQsVUFQbkI7QUFRakJQLElBQUFBLFNBQVMsRUFBRUcsc0JBQVVLLElBQVYsQ0FBZUQsVUFSVDtBQVNqQnpCLElBQUFBLE9BQU8sRUFBRXFCLHNCQUFVRSxPQUFWLENBQWtCRixzQkFBVUcsR0FBNUIsRUFBaUNDLFVBVHpCO0FBVWpCaEIsSUFBQUEsZ0JBQWdCLEVBQUVZLHNCQUFVSyxJQVZYO0FBWWpCO0FBQ0FDLElBQUFBLE1BQU0sRUFBRU4sc0JBQVVFLE9BQVYsQ0FBa0JGLHNCQUFVRyxHQUE1QjtBQWJTLEdBRHJCO0FBd0VEOztlQUVjeEMsb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVNlbGVjdG9yfSBmcm9tICdyZXNlbGVjdCc7XG5pbXBvcnQge0Zvcm1hdHRlZE1lc3NhZ2V9IGZyb20gJ2xvY2FsaXphdGlvbic7XG5pbXBvcnQge0J1dHRvbiwgU2lkZVBhbmVsRGl2aWRlciwgU2lkZVBhbmVsU2VjdGlvbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtBZGR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBTb3VyY2VEYXRhQ2F0YWxvZ0ZhY3RvcnkgZnJvbSAnLi9jb21tb24vc291cmNlLWRhdGEtY2F0YWxvZyc7XG5pbXBvcnQgRmlsdGVyUGFuZWxGYWN0b3J5IGZyb20gJy4vZmlsdGVyLXBhbmVsL2ZpbHRlci1wYW5lbCc7XG5cbkZpbHRlck1hbmFnZXJGYWN0b3J5LmRlcHMgPSBbU291cmNlRGF0YUNhdGFsb2dGYWN0b3J5LCBGaWx0ZXJQYW5lbEZhY3RvcnldO1xuXG5mdW5jdGlvbiBGaWx0ZXJNYW5hZ2VyRmFjdG9yeShTb3VyY2VEYXRhQ2F0YWxvZywgRmlsdGVyUGFuZWwpIHtcbiAgcmV0dXJuIGNsYXNzIEZpbHRlck1hbmFnZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBkYXRhc2V0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgIGxheWVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIGFkZEZpbHRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHJlbW92ZUZpbHRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGVubGFyZ2VGaWx0ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICB0b2dnbGVBbmltYXRpb246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICB0b2dnbGVGaWx0ZXJGZWF0dXJlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgc2V0RmlsdGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgZmlsdGVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICAgIHNob3dEYXRhc2V0VGFibGU6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAvLyBmaWVsZHMgY2FuIGJlIHVuZGVmaW5lZCB3aGVuIGRhdGFzZXQgaXMgbm90IHNlbGVjdGVkXG4gICAgICBmaWVsZHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpXG4gICAgfTtcblxuICAgIC8qIHNlbGVjdG9ycyAqL1xuICAgIGRhdGFzZXRzU2VsZWN0b3IgPSBzdGF0ZSA9PiBzdGF0ZS5kYXRhc2V0cztcbiAgICBkZWZhdWx0RGF0YXNldFNlbGVjdG9yID0gY3JlYXRlU2VsZWN0b3IoXG4gICAgICB0aGlzLmRhdGFzZXRzU2VsZWN0b3IsXG4gICAgICBkYXRhc2V0cyA9PiAoT2JqZWN0LmtleXMoZGF0YXNldHMpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyhkYXRhc2V0cylbMF0pIHx8IG51bGxcbiAgICApO1xuXG4gICAgLyogYWN0aW9ucyAqL1xuICAgIF9hZGRGaWx0ZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkZWZhdWx0RGF0YXNldCA9IHRoaXMuZGVmYXVsdERhdGFzZXRTZWxlY3Rvcih0aGlzLnByb3BzKTtcbiAgICAgIHRoaXMucHJvcHMuYWRkRmlsdGVyKGRlZmF1bHREYXRhc2V0KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2ZpbHRlcnMsIGRhdGFzZXRzLCBsYXllcnN9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGlzQW55RmlsdGVyQW5pbWF0aW5nID0gZmlsdGVycy5zb21lKGYgPT4gZi5pc0FuaW1hdGluZyk7XG4gICAgICBjb25zdCBoYWRFbXB0eUZpbHRlciA9IGZpbHRlcnMuc29tZShmID0+ICFmLm5hbWUpO1xuICAgICAgY29uc3QgaGFkRGF0YXNldCA9IE9iamVjdC5rZXlzKGRhdGFzZXRzKS5sZW5ndGg7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmlsdGVyLW1hbmFnZXJcIj5cbiAgICAgICAgICA8U291cmNlRGF0YUNhdGFsb2cgZGF0YXNldHM9e2RhdGFzZXRzfSBzaG93RGF0YXNldFRhYmxlPXt0aGlzLnByb3BzLnNob3dEYXRhc2V0VGFibGV9IC8+XG4gICAgICAgICAgPFNpZGVQYW5lbERpdmlkZXIgLz5cbiAgICAgICAgICA8U2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICAgIHtmaWx0ZXJzICYmXG4gICAgICAgICAgICAgIGZpbHRlcnMubWFwKChmaWx0ZXIsIGlkeCkgPT4gKFxuICAgICAgICAgICAgICAgIDxGaWx0ZXJQYW5lbFxuICAgICAgICAgICAgICAgICAga2V5PXtgJHtmaWx0ZXIuaWR9LSR7aWR4fWB9XG4gICAgICAgICAgICAgICAgICBpZHg9e2lkeH1cbiAgICAgICAgICAgICAgICAgIGZpbHRlcnM9e2ZpbHRlcnN9XG4gICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgICAgICAgIGxheWVycz17bGF5ZXJzfVxuICAgICAgICAgICAgICAgICAgaXNBbnlGaWx0ZXJBbmltYXRpbmc9e2lzQW55RmlsdGVyQW5pbWF0aW5nfVxuICAgICAgICAgICAgICAgICAgcmVtb3ZlRmlsdGVyPXsoKSA9PiB0aGlzLnByb3BzLnJlbW92ZUZpbHRlcihpZHgpfVxuICAgICAgICAgICAgICAgICAgZW5sYXJnZUZpbHRlcj17KCkgPT4gdGhpcy5wcm9wcy5lbmxhcmdlRmlsdGVyKGlkeCl9XG4gICAgICAgICAgICAgICAgICB0b2dnbGVBbmltYXRpb249eygpID0+IHRoaXMucHJvcHMudG9nZ2xlQW5pbWF0aW9uKGlkeCl9XG4gICAgICAgICAgICAgICAgICB0b2dnbGVGaWx0ZXJGZWF0dXJlPXsoKSA9PiB0aGlzLnByb3BzLnRvZ2dsZUZpbHRlckZlYXR1cmUoaWR4KX1cbiAgICAgICAgICAgICAgICAgIHNldEZpbHRlcj17dGhpcy5wcm9wcy5zZXRGaWx0ZXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9TaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFkZC1maWx0ZXItYnV0dG9uXCJcbiAgICAgICAgICAgIGluYWN0aXZlPXtoYWRFbXB0eUZpbHRlciB8fCAhaGFkRGF0YXNldH1cbiAgICAgICAgICAgIHdpZHRoPVwiMTA1cHhcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fYWRkRmlsdGVyfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxBZGQgaGVpZ2h0PVwiMTJweFwiIC8+XG4gICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J2ZpbHRlck1hbmFnZXIuYWRkRmlsdGVyJ30gLz5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyTWFuYWdlckZhY3Rvcnk7XG4iXX0=