"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = SourceDataSelectorFactory;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reselect = require("reselect");

var _styledComponents = require("../../common/styled-components");

var _itemSelector = _interopRequireDefault(require("../../common/item-selector/item-selector"));

var _datasetTag = _interopRequireDefault(require("./dataset-tag"));

var _localization = require("../../../localization");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var defaultPlaceHolder = 'Select A Data Source';
SourceDataSelectorFactory.deps = [_datasetTag["default"]];

function SourceDataSelectorFactory(DatasetTag) {
  var DatasetItem = function DatasetItem(_ref) {
    var value = _ref.value;
    return /*#__PURE__*/_react["default"].createElement(DatasetTag, {
      dataset: value
    });
  };

  var SourceDataSelector = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(SourceDataSelector, _Component);

    var _super = _createSuper(SourceDataSelector);

    function SourceDataSelector() {
      var _this;

      (0, _classCallCheck2["default"])(this, SourceDataSelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "datasetsSelector", function (props) {
        return props.datasets;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "dsOptionsSelector", (0, _reselect.createSelector)(_this.datasetsSelector, function (datasets) {
        return Object.values(datasets).map(function (ds) {
          return {
            label: ds.label,
            value: ds.id,
            color: ds.color
          };
        });
      }));
      return _this;
    }

    (0, _createClass2["default"])(SourceDataSelector, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            dataId = _this$props.dataId,
            disabled = _this$props.disabled,
            onSelect = _this$props.onSelect,
            defaultValue = _this$props.defaultValue,
            inputTheme = _this$props.inputTheme;
        var dsOptions = this.dsOptionsSelector(this.props);
        return /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, {
          className: "data-source-selector"
        }, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'misc.dataSource'
        })), /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], {
          inputTheme: inputTheme,
          selectedItems: dataId ? this.props.datasets[dataId] : null,
          options: dsOptions,
          getOptionValue: 'value',
          filterOption: 'label',
          multiSelect: false,
          onChange: onSelect,
          placeholder: defaultValue,
          disabled: Boolean(disabled),
          displayOption: 'label',
          DropDownLineItemRenderComponent: DatasetItem
        }));
      }
    }]);
    return SourceDataSelector;
  }(_react.Component);

  SourceDataSelector.defaultProps = {
    defaultValue: defaultPlaceHolder
  };
  return SourceDataSelector;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvY29tbW9uL3NvdXJjZS1kYXRhLXNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbImRlZmF1bHRQbGFjZUhvbGRlciIsIlNvdXJjZURhdGFTZWxlY3RvckZhY3RvcnkiLCJkZXBzIiwiRGF0YXNldFRhZ0ZhY3RvcnkiLCJEYXRhc2V0VGFnIiwiRGF0YXNldEl0ZW0iLCJ2YWx1ZSIsIlNvdXJjZURhdGFTZWxlY3RvciIsInByb3BzIiwiZGF0YXNldHMiLCJkYXRhc2V0c1NlbGVjdG9yIiwiT2JqZWN0IiwidmFsdWVzIiwibWFwIiwiZHMiLCJsYWJlbCIsImlkIiwiY29sb3IiLCJkYXRhSWQiLCJkaXNhYmxlZCIsIm9uU2VsZWN0IiwiZGVmYXVsdFZhbHVlIiwiaW5wdXRUaGVtZSIsImRzT3B0aW9ucyIsImRzT3B0aW9uc1NlbGVjdG9yIiwiQm9vbGVhbiIsIkNvbXBvbmVudCIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsa0JBQWtCLEdBQUcsc0JBQTNCO0FBRUFDLHlCQUF5QixDQUFDQyxJQUExQixHQUFpQyxDQUFDQyxzQkFBRCxDQUFqQzs7QUFFZSxTQUFTRix5QkFBVCxDQUFtQ0csVUFBbkMsRUFBK0M7QUFDNUQsTUFBTUMsV0FBVyxHQUFHLFNBQWRBLFdBQWM7QUFBQSxRQUFFQyxLQUFGLFFBQUVBLEtBQUY7QUFBQSx3QkFBYSxnQ0FBQyxVQUFEO0FBQVksTUFBQSxPQUFPLEVBQUVBO0FBQXJCLE1BQWI7QUFBQSxHQUFwQjs7QUFENEQsTUFHdERDLGtCQUhzRDtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsMkdBTXZDLFVBQUFDLEtBQUs7QUFBQSxlQUFJQSxLQUFLLENBQUNDLFFBQVY7QUFBQSxPQU5rQztBQUFBLDRHQU90Qyw4QkFBZSxNQUFLQyxnQkFBcEIsRUFBc0MsVUFBQUQsUUFBUTtBQUFBLGVBQ2hFRSxNQUFNLENBQUNDLE1BQVAsQ0FBY0gsUUFBZCxFQUF3QkksR0FBeEIsQ0FBNEIsVUFBQUMsRUFBRTtBQUFBLGlCQUFLO0FBQ2pDQyxZQUFBQSxLQUFLLEVBQUVELEVBQUUsQ0FBQ0MsS0FEdUI7QUFFakNULFlBQUFBLEtBQUssRUFBRVEsRUFBRSxDQUFDRSxFQUZ1QjtBQUdqQ0MsWUFBQUEsS0FBSyxFQUFFSCxFQUFFLENBQUNHO0FBSHVCLFdBQUw7QUFBQSxTQUE5QixDQURnRTtBQUFBLE9BQTlDLENBUHNDO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsK0JBZWpEO0FBQUEsMEJBQ3dELEtBQUtULEtBRDdEO0FBQUEsWUFDQVUsTUFEQSxlQUNBQSxNQURBO0FBQUEsWUFDUUMsUUFEUixlQUNRQSxRQURSO0FBQUEsWUFDa0JDLFFBRGxCLGVBQ2tCQSxRQURsQjtBQUFBLFlBQzRCQyxZQUQ1QixlQUM0QkEsWUFENUI7QUFBQSxZQUMwQ0MsVUFEMUMsZUFDMENBLFVBRDFDO0FBRVAsWUFBTUMsU0FBUyxHQUFHLEtBQUtDLGlCQUFMLENBQXVCLEtBQUtoQixLQUE1QixDQUFsQjtBQUVBLDRCQUNFLGdDQUFDLGtDQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDO0FBQTVCLHdCQUNFLGdDQUFDLDRCQUFELHFCQUNFLGdDQUFDLDhCQUFEO0FBQWtCLFVBQUEsRUFBRSxFQUFFO0FBQXRCLFVBREYsQ0FERixlQUlFLGdDQUFDLHdCQUFEO0FBQ0UsVUFBQSxVQUFVLEVBQUVjLFVBRGQ7QUFFRSxVQUFBLGFBQWEsRUFBRUosTUFBTSxHQUFHLEtBQUtWLEtBQUwsQ0FBV0MsUUFBWCxDQUFvQlMsTUFBcEIsQ0FBSCxHQUFpQyxJQUZ4RDtBQUdFLFVBQUEsT0FBTyxFQUFFSyxTQUhYO0FBSUUsVUFBQSxjQUFjLEVBQUUsT0FKbEI7QUFLRSxVQUFBLFlBQVksRUFBRSxPQUxoQjtBQU1FLFVBQUEsV0FBVyxFQUFFLEtBTmY7QUFPRSxVQUFBLFFBQVEsRUFBRUgsUUFQWjtBQVFFLFVBQUEsV0FBVyxFQUFFQyxZQVJmO0FBU0UsVUFBQSxRQUFRLEVBQUVJLE9BQU8sQ0FBQ04sUUFBRCxDQVRuQjtBQVVFLFVBQUEsYUFBYSxFQUFFLE9BVmpCO0FBV0UsVUFBQSwrQkFBK0IsRUFBRWQ7QUFYbkMsVUFKRixDQURGO0FBb0JEO0FBdkN5RDtBQUFBO0FBQUEsSUFHM0JxQixnQkFIMkI7O0FBMEM1RG5CLEVBQUFBLGtCQUFrQixDQUFDb0IsWUFBbkIsR0FBa0M7QUFDaENOLElBQUFBLFlBQVksRUFBRXJCO0FBRGtCLEdBQWxDO0FBR0EsU0FBT08sa0JBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuXG5pbXBvcnQge1BhbmVsTGFiZWwsIFNpZGVQYW5lbFNlY3Rpb259IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBJdGVtU2VsZWN0b3IgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaXRlbS1zZWxlY3Rvci9pdGVtLXNlbGVjdG9yJztcbmltcG9ydCBEYXRhc2V0VGFnRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvY29tbW9uL2RhdGFzZXQtdGFnJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcblxuY29uc3QgZGVmYXVsdFBsYWNlSG9sZGVyID0gJ1NlbGVjdCBBIERhdGEgU291cmNlJztcblxuU291cmNlRGF0YVNlbGVjdG9yRmFjdG9yeS5kZXBzID0gW0RhdGFzZXRUYWdGYWN0b3J5XTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU291cmNlRGF0YVNlbGVjdG9yRmFjdG9yeShEYXRhc2V0VGFnKSB7XG4gIGNvbnN0IERhdGFzZXRJdGVtID0gKHt2YWx1ZX0pID0+IDxEYXRhc2V0VGFnIGRhdGFzZXQ9e3ZhbHVlfSAvPjtcblxuICBjbGFzcyBTb3VyY2VEYXRhU2VsZWN0b3IgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIC8qIHNlbGVjdG9ycyAqL1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWludmFsaWQtdGhpcyAqL1xuICAgIGRhdGFzZXRzU2VsZWN0b3IgPSBwcm9wcyA9PiBwcm9wcy5kYXRhc2V0cztcbiAgICBkc09wdGlvbnNTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKHRoaXMuZGF0YXNldHNTZWxlY3RvciwgZGF0YXNldHMgPT5cbiAgICAgIE9iamVjdC52YWx1ZXMoZGF0YXNldHMpLm1hcChkcyA9PiAoe1xuICAgICAgICBsYWJlbDogZHMubGFiZWwsXG4gICAgICAgIHZhbHVlOiBkcy5pZCxcbiAgICAgICAgY29sb3I6IGRzLmNvbG9yXG4gICAgICB9KSlcbiAgICApO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2RhdGFJZCwgZGlzYWJsZWQsIG9uU2VsZWN0LCBkZWZhdWx0VmFsdWUsIGlucHV0VGhlbWV9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGRzT3B0aW9ucyA9IHRoaXMuZHNPcHRpb25zU2VsZWN0b3IodGhpcy5wcm9wcyk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTaWRlUGFuZWxTZWN0aW9uIGNsYXNzTmFtZT1cImRhdGEtc291cmNlLXNlbGVjdG9yXCI+XG4gICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J21pc2MuZGF0YVNvdXJjZSd9IC8+XG4gICAgICAgICAgPC9QYW5lbExhYmVsPlxuICAgICAgICAgIDxJdGVtU2VsZWN0b3JcbiAgICAgICAgICAgIGlucHV0VGhlbWU9e2lucHV0VGhlbWV9XG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zPXtkYXRhSWQgPyB0aGlzLnByb3BzLmRhdGFzZXRzW2RhdGFJZF0gOiBudWxsfVxuICAgICAgICAgICAgb3B0aW9ucz17ZHNPcHRpb25zfVxuICAgICAgICAgICAgZ2V0T3B0aW9uVmFsdWU9eyd2YWx1ZSd9XG4gICAgICAgICAgICBmaWx0ZXJPcHRpb249eydsYWJlbCd9XG4gICAgICAgICAgICBtdWx0aVNlbGVjdD17ZmFsc2V9XG4gICAgICAgICAgICBvbkNoYW5nZT17b25TZWxlY3R9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17ZGVmYXVsdFZhbHVlfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e0Jvb2xlYW4oZGlzYWJsZWQpfVxuICAgICAgICAgICAgZGlzcGxheU9wdGlvbj17J2xhYmVsJ31cbiAgICAgICAgICAgIERyb3BEb3duTGluZUl0ZW1SZW5kZXJDb21wb25lbnQ9e0RhdGFzZXRJdGVtfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgU291cmNlRGF0YVNlbGVjdG9yLmRlZmF1bHRQcm9wcyA9IHtcbiAgICBkZWZhdWx0VmFsdWU6IGRlZmF1bHRQbGFjZUhvbGRlclxuICB9O1xuICByZXR1cm4gU291cmNlRGF0YVNlbGVjdG9yO1xufVxuIl19