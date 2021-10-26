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

var _defaultSettings = require("../../constants/default-settings");

var _icons = require("../common/icons");

var _styledComponents = require("../common/styled-components");

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var propTypes = {
  datasets: _propTypes["default"].object.isRequired,
  selectedDataset: _propTypes["default"].string,
  dataType: _propTypes["default"].string.isRequired,
  filtered: _propTypes["default"].bool.isRequired,
  // callbacks
  applyCPUFilter: _propTypes["default"].func.isRequired,
  onClose: _propTypes["default"].func.isRequired,
  onChangeExportSelectedDataset: _propTypes["default"].func.isRequired,
  onChangeExportDataType: _propTypes["default"].func.isRequired,
  onChangeExportFiltered: _propTypes["default"].func.isRequired
};

var getDataRowCount = function getDataRowCount(datasets, selectedDataset, filtered, intl) {
  var selectedData = datasets[selectedDataset];

  if (!selectedData) {
    return intl.formatMessage({
      id: 'modal.exportData.fileCount'
    }, {
      fileCount: Object.keys(datasets).length
    });
  }

  var allData = selectedData.allData,
      filteredIdxCPU = selectedData.filteredIdxCPU;

  if (filtered && !filteredIdxCPU) {
    return '-';
  }

  var rowCount = filtered ? filteredIdxCPU.length : allData.length;
  return intl.formatMessage({
    id: 'modal.exportData.rowCount'
  }, {
    rowCount: rowCount.toLocaleString()
  });
};

var ExportDataModalFactory = function ExportDataModalFactory() {
  var ExportDataModal = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(ExportDataModal, _Component);

    var _super = _createSuper(ExportDataModal);

    function ExportDataModal() {
      var _this;

      (0, _classCallCheck2["default"])(this, ExportDataModal);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onSelectDataset", function (_ref) {
        var value = _ref.target.value;

        _this.props.applyCPUFilter(value);

        _this.props.onChangeExportSelectedDataset(value);
      });
      return _this;
    }

    (0, _createClass2["default"])(ExportDataModal, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var toCPUFilter = this.props.selectedDataset || Object.keys(this.props.datasets);
        this.props.applyCPUFilter(toCPUFilter);
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            datasets = _this$props.datasets,
            selectedDataset = _this$props.selectedDataset,
            dataType = _this$props.dataType,
            filtered = _this$props.filtered,
            onChangeExportDataType = _this$props.onChangeExportDataType,
            onChangeExportFiltered = _this$props.onChangeExportFiltered,
            intl = _this$props.intl;
        return /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledModalContent, {
          className: "export-data-modal"
        }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
          className: "description"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.datasetTitle'
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "subtitle"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.datasetSubtitle'
        }))), /*#__PURE__*/_react["default"].createElement("div", {
          className: "selection"
        }, /*#__PURE__*/_react["default"].createElement("select", {
          value: selectedDataset,
          onChange: this._onSelectDataset
        }, [intl.formatMessage({
          id: 'modal.exportData.allDatasets'
        })].concat(Object.keys(datasets)).map(function (d) {
          return /*#__PURE__*/_react["default"].createElement("option", {
            key: d,
            value: d
          }, datasets[d] && datasets[d].label || d);
        })))), /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
          className: "description"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.dataTypeTitle'
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "subtitle"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.dataTypeSubtitle'
        }))), /*#__PURE__*/_react["default"].createElement("div", {
          className: "selection"
        }, _defaultSettings.EXPORT_DATA_TYPE_OPTIONS.map(function (op) {
          return /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledType, {
            key: op.id,
            selected: dataType === op.id,
            available: op.available,
            onClick: function onClick() {
              return op.available && onChangeExportDataType(op.id);
            }
          }, /*#__PURE__*/_react["default"].createElement(_icons.FileType, {
            ext: op.label,
            height: "80px",
            fontSize: "11px"
          }), dataType === op.id && /*#__PURE__*/_react["default"].createElement(_styledComponents.CheckMark, null));
        }))), /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledExportSection, null, /*#__PURE__*/_react["default"].createElement("div", {
          className: "description"
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.dataTypeTitle'
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "subtitle"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.filterDataSubtitle'
        }))), /*#__PURE__*/_react["default"].createElement("div", {
          className: "selection"
        }, /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledFilteredOption, {
          className: "unfiltered-option",
          selected: !filtered,
          onClick: function onClick() {
            return onChangeExportFiltered(false);
          }
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "filter-option-title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.unfilteredData'
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "filter-option-subtitle"
        }, getDataRowCount(datasets, selectedDataset, false, intl)), !filtered && /*#__PURE__*/_react["default"].createElement(_styledComponents.CheckMark, null)), /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledFilteredOption, {
          className: "filtered-option",
          selected: filtered,
          onClick: function onClick() {
            return onChangeExportFiltered(true);
          }
        }, /*#__PURE__*/_react["default"].createElement("div", {
          className: "filter-option-title"
        }, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'modal.exportData.filteredData'
        })), /*#__PURE__*/_react["default"].createElement("div", {
          className: "filter-option-subtitle"
        }, getDataRowCount(datasets, selectedDataset, true, intl)), filtered && /*#__PURE__*/_react["default"].createElement(_styledComponents.CheckMark, null))))));
      }
    }]);
    return ExportDataModal;
  }(_react.Component);

  ExportDataModal.propTypes = propTypes;
  return (0, _reactIntl.injectIntl)(ExportDataModal);
};

var _default = ExportDataModalFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21vZGFscy9leHBvcnQtZGF0YS1tb2RhbC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJkYXRhc2V0cyIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJzZWxlY3RlZERhdGFzZXQiLCJzdHJpbmciLCJkYXRhVHlwZSIsImZpbHRlcmVkIiwiYm9vbCIsImFwcGx5Q1BVRmlsdGVyIiwiZnVuYyIsIm9uQ2xvc2UiLCJvbkNoYW5nZUV4cG9ydFNlbGVjdGVkRGF0YXNldCIsIm9uQ2hhbmdlRXhwb3J0RGF0YVR5cGUiLCJvbkNoYW5nZUV4cG9ydEZpbHRlcmVkIiwiZ2V0RGF0YVJvd0NvdW50IiwiaW50bCIsInNlbGVjdGVkRGF0YSIsImZvcm1hdE1lc3NhZ2UiLCJpZCIsImZpbGVDb3VudCIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJhbGxEYXRhIiwiZmlsdGVyZWRJZHhDUFUiLCJyb3dDb3VudCIsInRvTG9jYWxlU3RyaW5nIiwiRXhwb3J0RGF0YU1vZGFsRmFjdG9yeSIsIkV4cG9ydERhdGFNb2RhbCIsInZhbHVlIiwidGFyZ2V0IiwicHJvcHMiLCJ0b0NQVUZpbHRlciIsIl9vblNlbGVjdERhdGFzZXQiLCJjb25jYXQiLCJtYXAiLCJkIiwibGFiZWwiLCJFWFBPUlRfREFUQV9UWVBFX09QVElPTlMiLCJvcCIsImF2YWlsYWJsZSIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFPQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsU0FBUyxHQUFHO0FBQ2hCQyxFQUFBQSxRQUFRLEVBQUVDLHNCQUFVQyxNQUFWLENBQWlCQyxVQURYO0FBRWhCQyxFQUFBQSxlQUFlLEVBQUVILHNCQUFVSSxNQUZYO0FBR2hCQyxFQUFBQSxRQUFRLEVBQUVMLHNCQUFVSSxNQUFWLENBQWlCRixVQUhYO0FBSWhCSSxF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dEIsVUFERixDQUxGLGVBUUU7QUFBSyxVQUFBLFNBQVMsRUFBQztBQUFmLFdBQ0dDLGVBQWUsQ0FBQ2YsUUFBRCxFQUFXSSxlQUFYLEVBQTRCLEtBQTVCLEVBQW1DWSxJQUFuQyxDQURsQixDQVJGLEVBV0csQ0FBQ1QsUUFBRCxpQkFBYSxnQ0FBQywyQkFBRCxPQVhoQixDQURGLGVBY0UsZ0NBQUMsc0NBQUQ7QUFDRSxVQUFBLFNBQVMsRUFBQyxpQkFEWjtBQUVFLFVBQUEsUUFBUSxFQUFFQSxRQUZaO0FBR0UsVUFBQSxPQUFPLEVBQUU7QUFBQSxtQkFBTU8sc0JBQXNCLENBQUMsSUFBRCxDQUE1QjtBQUFBO0FBSFgsd0JBS0U7QUFBSyxVQUFBLFNBQVMsRUFBQztBQUFmLHdCQUNFLGdDQUFDLDhCQUFEO0FBQWtCLFVBQUEsRUFBRSxFQUFFO0FBQXRCLFVBREYsQ0FMRixlQVFFO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZixXQUNHQyxlQUFlLENBQUNmLFFBQUQsRUFBV0ksZUFBWCxFQUE0QixJQUE1QixFQUFrQ1ksSUFBbEMsQ0FEbEIsQ0FSRixFQVdHVCxRQUFRLGlCQUFJLGdDQUFDLDJCQUFELE9BWGYsQ0FkRixDQVRGLENBN0NGLENBREYsQ0FERjtBQXdGRDtBQS9HZ0M7QUFBQTtBQUFBLElBQ0xtQyxnQkFESzs7QUFpSG5DYixFQUFBQSxlQUFlLENBQUM5QixTQUFoQixHQUE0QkEsU0FBNUI7QUFDQSxTQUFPLDJCQUFXOEIsZUFBWCxDQUFQO0FBQ0QsQ0FuSEQ7O2VBcUhlRCxzQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtFWFBPUlRfREFUQV9UWVBFX09QVElPTlN9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCB7RmlsZVR5cGV9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCB7XG4gIFN0eWxlZEV4cG9ydFNlY3Rpb24sXG4gIFN0eWxlZEZpbHRlcmVkT3B0aW9uLFxuICBTdHlsZWRNb2RhbENvbnRlbnQsXG4gIFN0eWxlZFR5cGUsXG4gIENoZWNrTWFya1xufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge2luamVjdEludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIGRhdGFzZXRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIHNlbGVjdGVkRGF0YXNldDogUHJvcFR5cGVzLnN0cmluZyxcbiAgZGF0YVR5cGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgZmlsdGVyZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIC8vIGNhbGxiYWNrc1xuICBhcHBseUNQVUZpbHRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25DaGFuZ2VFeHBvcnRTZWxlY3RlZERhdGFzZXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uQ2hhbmdlRXhwb3J0RGF0YVR5cGU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uQ2hhbmdlRXhwb3J0RmlsdGVyZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbn07XG5cbmNvbnN0IGdldERhdGFSb3dDb3VudCA9IChkYXRhc2V0cywgc2VsZWN0ZWREYXRhc2V0LCBmaWx0ZXJlZCwgaW50bCkgPT4ge1xuICBjb25zdCBzZWxlY3RlZERhdGEgPSBkYXRhc2V0c1tzZWxlY3RlZERhdGFzZXRdO1xuICBpZiAoIXNlbGVjdGVkRGF0YSkge1xuICAgIHJldHVybiBpbnRsLmZvcm1hdE1lc3NhZ2UoXG4gICAgICB7aWQ6ICdtb2RhbC5leHBvcnREYXRhLmZpbGVDb3VudCd9LFxuICAgICAge2ZpbGVDb3VudDogT2JqZWN0LmtleXMoZGF0YXNldHMpLmxlbmd0aH1cbiAgICApO1xuICB9XG4gIGNvbnN0IHthbGxEYXRhLCBmaWx0ZXJlZElkeENQVX0gPSBzZWxlY3RlZERhdGE7XG5cbiAgaWYgKGZpbHRlcmVkICYmICFmaWx0ZXJlZElkeENQVSkge1xuICAgIHJldHVybiAnLSc7XG4gIH1cblxuICBjb25zdCByb3dDb3VudCA9IGZpbHRlcmVkID8gZmlsdGVyZWRJZHhDUFUubGVuZ3RoIDogYWxsRGF0YS5sZW5ndGg7XG5cbiAgcmV0dXJuIGludGwuZm9ybWF0TWVzc2FnZShcbiAgICB7aWQ6ICdtb2RhbC5leHBvcnREYXRhLnJvd0NvdW50J30sXG4gICAge3Jvd0NvdW50OiByb3dDb3VudC50b0xvY2FsZVN0cmluZygpfVxuICApO1xufTtcblxuY29uc3QgRXhwb3J0RGF0YU1vZGFsRmFjdG9yeSA9ICgpID0+IHtcbiAgY2xhc3MgRXhwb3J0RGF0YU1vZGFsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIGNvbnN0IHRvQ1BVRmlsdGVyID0gdGhpcy5wcm9wcy5zZWxlY3RlZERhdGFzZXQgfHwgT2JqZWN0LmtleXModGhpcy5wcm9wcy5kYXRhc2V0cyk7XG4gICAgICB0aGlzLnByb3BzLmFwcGx5Q1BVRmlsdGVyKHRvQ1BVRmlsdGVyKTtcbiAgICB9XG5cbiAgICBfb25TZWxlY3REYXRhc2V0ID0gKHt0YXJnZXQ6IHt2YWx1ZX19KSA9PiB7XG4gICAgICB0aGlzLnByb3BzLmFwcGx5Q1BVRmlsdGVyKHZhbHVlKTtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VFeHBvcnRTZWxlY3RlZERhdGFzZXQodmFsdWUpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRhdGFzZXRzLFxuICAgICAgICBzZWxlY3RlZERhdGFzZXQsXG4gICAgICAgIGRhdGFUeXBlLFxuICAgICAgICBmaWx0ZXJlZCxcbiAgICAgICAgb25DaGFuZ2VFeHBvcnREYXRhVHlwZSxcbiAgICAgICAgb25DaGFuZ2VFeHBvcnRGaWx0ZXJlZCxcbiAgICAgICAgaW50bFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRNb2RhbENvbnRlbnQgY2xhc3NOYW1lPVwiZXhwb3J0LWRhdGEtbW9kYWxcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPFN0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmV4cG9ydERhdGEuZGF0YXNldFRpdGxlJ30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmV4cG9ydERhdGEuZGF0YXNldFN1YnRpdGxlJ30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCB2YWx1ZT17c2VsZWN0ZWREYXRhc2V0fSBvbkNoYW5nZT17dGhpcy5fb25TZWxlY3REYXRhc2V0fT5cbiAgICAgICAgICAgICAgICAgIHtbaW50bC5mb3JtYXRNZXNzYWdlKHtpZDogJ21vZGFsLmV4cG9ydERhdGEuYWxsRGF0YXNldHMnfSldXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoT2JqZWN0LmtleXMoZGF0YXNldHMpKVxuICAgICAgICAgICAgICAgICAgICAubWFwKGQgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtkfSB2YWx1ZT17ZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7KGRhdGFzZXRzW2RdICYmIGRhdGFzZXRzW2RdLmxhYmVsKSB8fCBkfVxuICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1N0eWxlZEV4cG9ydFNlY3Rpb24+XG4gICAgICAgICAgICA8U3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0RGF0YS5kYXRhVHlwZVRpdGxlJ30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmV4cG9ydERhdGEuZGF0YVR5cGVTdWJ0aXRsZSd9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdGlvblwiPlxuICAgICAgICAgICAgICAgIHtFWFBPUlRfREFUQV9UWVBFX09QVElPTlMubWFwKG9wID0+IChcbiAgICAgICAgICAgICAgICAgIDxTdHlsZWRUeXBlXG4gICAgICAgICAgICAgICAgICAgIGtleT17b3AuaWR9XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtkYXRhVHlwZSA9PT0gb3AuaWR9XG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZT17b3AuYXZhaWxhYmxlfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvcC5hdmFpbGFibGUgJiYgb25DaGFuZ2VFeHBvcnREYXRhVHlwZShvcC5pZCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHlwZSBleHQ9e29wLmxhYmVsfSBoZWlnaHQ9XCI4MHB4XCIgZm9udFNpemU9XCIxMXB4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAge2RhdGFUeXBlID09PSBvcC5pZCAmJiA8Q2hlY2tNYXJrIC8+fVxuICAgICAgICAgICAgICAgICAgPC9TdHlsZWRUeXBlPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvU3R5bGVkRXhwb3J0U2VjdGlvbj5cbiAgICAgICAgICAgIDxTdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnREYXRhLmRhdGFUeXBlVGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3VidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnbW9kYWwuZXhwb3J0RGF0YS5maWx0ZXJEYXRhU3VidGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWxlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8U3R5bGVkRmlsdGVyZWRPcHRpb25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInVuZmlsdGVyZWQtb3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXshZmlsdGVyZWR9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZUV4cG9ydEZpbHRlcmVkKGZhbHNlKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpbHRlci1vcHRpb24tdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydtb2RhbC5leHBvcnREYXRhLnVuZmlsdGVyZWREYXRhJ30gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaWx0ZXItb3B0aW9uLXN1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIHtnZXREYXRhUm93Q291bnQoZGF0YXNldHMsIHNlbGVjdGVkRGF0YXNldCwgZmFsc2UsIGludGwpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7IWZpbHRlcmVkICYmIDxDaGVja01hcmsgLz59XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRGaWx0ZXJlZE9wdGlvbj5cbiAgICAgICAgICAgICAgICA8U3R5bGVkRmlsdGVyZWRPcHRpb25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpbHRlcmVkLW9wdGlvblwiXG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZD17ZmlsdGVyZWR9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZUV4cG9ydEZpbHRlcmVkKHRydWUpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmlsdGVyLW9wdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21vZGFsLmV4cG9ydERhdGEuZmlsdGVyZWREYXRhJ30gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaWx0ZXItb3B0aW9uLXN1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIHtnZXREYXRhUm93Q291bnQoZGF0YXNldHMsIHNlbGVjdGVkRGF0YXNldCwgdHJ1ZSwgaW50bCl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtmaWx0ZXJlZCAmJiA8Q2hlY2tNYXJrIC8+fVxuICAgICAgICAgICAgICAgIDwvU3R5bGVkRmlsdGVyZWRPcHRpb24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9TdHlsZWRFeHBvcnRTZWN0aW9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1N0eWxlZE1vZGFsQ29udGVudD5cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIEV4cG9ydERhdGFNb2RhbC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG4gIHJldHVybiBpbmplY3RJbnRsKEV4cG9ydERhdGFNb2RhbCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFeHBvcnREYXRhTW9kYWxGYWN0b3J5O1xuIl19