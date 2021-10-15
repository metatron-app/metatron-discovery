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

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _localization = require("../../../localization");

var _reselect = require("reselect");

var _styledComponents2 = require("../../common/styled-components");

var _fieldSelector = _interopRequireDefault(require("../../common/field-selector"));

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 75%;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 25%;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  margin-bottom: 8px;\n  align-items: center;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: space-between;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var TopRow = _styledComponents["default"].div(_templateObject());

LayerColumnConfigFactory.deps = [ColumnSelectorFactory];

function LayerColumnConfigFactory(ColumnSelector) {
  var LayerColumnConfig = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(LayerColumnConfig, _Component);

    var _super = _createSuper(LayerColumnConfig);

    function LayerColumnConfig() {
      var _this;

      (0, _classCallCheck2["default"])(this, LayerColumnConfig);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "columnPairs", function (props) {
        return props.columnPairs;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldPairs", function (props) {
        return props.fieldPairs;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "fieldPairsSelector", (0, _reselect.createSelector)(_this.columnPairs, _this.fieldPairs, function (columnPairs, fieldPairs) {
        return columnPairs ? fieldPairs.map(function (fp) {
          return {
            name: fp.defaultName,
            type: 'point',
            pair: fp.pair
          };
        }) : null;
      }));
      return _this;
    }

    (0, _createClass2["default"])(LayerColumnConfig, [{
      key: "_updateColumn",
      value: function _updateColumn(key, value) {
        var _this$props = this.props,
            columnPairs = _this$props.columnPairs,
            assignColumnPairs = _this$props.assignColumnPairs,
            assignColumn = _this$props.assignColumn;
        var columns = value && value.pair && columnPairs ? assignColumnPairs(key, value.pair) : assignColumn(key, value);
        this.props.updateLayerConfig({
          columns: columns
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props2 = this.props,
            columns = _this$props2.columns,
            columnLabels = _this$props2.columnLabels,
            fields = _this$props2.fields;
        var fieldPairs = this.fieldPairsSelector(this.props);
        return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement("div", {
          className: "layer-config__column"
        }, /*#__PURE__*/_react["default"].createElement(TopRow, null, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: 'columns.title'
        })), /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: "layer.required"
        }))), Object.keys(columns).map(function (key) {
          return /*#__PURE__*/_react["default"].createElement(ColumnSelector, {
            column: columns[key],
            label: columnLabels && columnLabels[key] || key,
            key: key,
            allFields: fields,
            fieldPairs: fieldPairs,
            onSelect: function onSelect(val) {
              return _this2._updateColumn(key, val);
            }
          });
        }))));
      }
    }]);
    return LayerColumnConfig;
  }(_react.Component);

  (0, _defineProperty2["default"])(LayerColumnConfig, "propTypes", {
    columns: _propTypes["default"].object.isRequired,
    fields: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    assignColumnPairs: _propTypes["default"].func.isRequired,
    assignColumn: _propTypes["default"].func.isRequired,
    updateLayerConfig: _propTypes["default"].func.isRequired,
    columnPairs: _propTypes["default"].object,
    fieldPairs: _propTypes["default"].arrayOf(_propTypes["default"].any),
    columnLabels: _propTypes["default"].object
  });
  return LayerColumnConfig;
}

ColumnSelectorFactory.deps = [_fieldSelector["default"]];

function ColumnSelectorFactory(FieldSelector) {
  var ColumnSelector = function ColumnSelector(_ref) {
    var column = _ref.column,
        label = _ref.label,
        allFields = _ref.allFields,
        onSelect = _ref.onSelect,
        fieldPairs = _ref.fieldPairs;
    return /*#__PURE__*/_react["default"].createElement(ColumnRow, {
      className: "layer-config__column__selector"
    }, /*#__PURE__*/_react["default"].createElement(ColumnName, {
      className: "layer-config__column__name"
    }, /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: "columns.".concat(label)
    })), !column.optional ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.PanelLabel, null, "  *") : null), /*#__PURE__*/_react["default"].createElement(ColumnSelect, {
      className: "layer-config__column__select"
    }, /*#__PURE__*/_react["default"].createElement(FieldSelector, {
      suggested: fieldPairs,
      error: !column.optional && !column.value,
      fields: allFields,
      value: column.value,
      erasable: Boolean(column.optional),
      onSelect: onSelect
    })));
  };

  return ColumnSelector;
}

var ColumnRow = _styledComponents["default"].div(_templateObject2());

var ColumnName = _styledComponents["default"].div(_templateObject3());

var ColumnSelect = _styledComponents["default"].div(_templateObject4());

var _default = LayerColumnConfigFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvbGF5ZXItY29sdW1uLWNvbmZpZy5qcyJdLCJuYW1lcyI6WyJUb3BSb3ciLCJzdHlsZWQiLCJkaXYiLCJMYXllckNvbHVtbkNvbmZpZ0ZhY3RvcnkiLCJkZXBzIiwiQ29sdW1uU2VsZWN0b3JGYWN0b3J5IiwiQ29sdW1uU2VsZWN0b3IiLCJMYXllckNvbHVtbkNvbmZpZyIsInByb3BzIiwiY29sdW1uUGFpcnMiLCJmaWVsZFBhaXJzIiwibWFwIiwiZnAiLCJuYW1lIiwiZGVmYXVsdE5hbWUiLCJ0eXBlIiwicGFpciIsImtleSIsInZhbHVlIiwiYXNzaWduQ29sdW1uUGFpcnMiLCJhc3NpZ25Db2x1bW4iLCJjb2x1bW5zIiwidXBkYXRlTGF5ZXJDb25maWciLCJjb2x1bW5MYWJlbHMiLCJmaWVsZHMiLCJmaWVsZFBhaXJzU2VsZWN0b3IiLCJPYmplY3QiLCJrZXlzIiwidmFsIiwiX3VwZGF0ZUNvbHVtbiIsIkNvbXBvbmVudCIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJhcnJheU9mIiwiYW55IiwiZnVuYyIsIkZpZWxkU2VsZWN0b3JGYWN0b3J5IiwiRmllbGRTZWxlY3RvciIsImNvbHVtbiIsImxhYmVsIiwiYWxsRmllbGRzIiwib25TZWxlY3QiLCJvcHRpb25hbCIsIkJvb2xlYW4iLCJDb2x1bW5Sb3ciLCJDb2x1bW5OYW1lIiwiQ29sdW1uU2VsZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxNQUFNLEdBQUdDLDZCQUFPQyxHQUFWLG1CQUFaOztBQUlBQyx3QkFBd0IsQ0FBQ0MsSUFBekIsR0FBZ0MsQ0FBQ0MscUJBQUQsQ0FBaEM7O0FB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QURGLENBREYsRUFJRyxDQUFDRCxNQUFNLENBQUNJLFFBQVIsZ0JBQW1CLGdDQUFDLDZCQUFELGNBQW5CLEdBQXNELElBSnpELENBREYsZUFPRSxnQ0FBQyxZQUFEO0FBQWMsTUFBQSxTQUFTLEVBQUM7QUFBeEIsb0JBQ0UsZ0NBQUMsYUFBRDtBQUNFLE1BQUEsU0FBUyxFQUFFakMsVUFEYjtBQUVFLE1BQUEsS0FBSyxFQUFFLENBQUM2QixNQUFNLENBQUNJLFFBQVIsSUFBb0IsQ0FBQ0osTUFBTSxDQUFDckIsS0FGckM7QUFHRSxNQUFBLE1BQU0sRUFBRXVCLFNBSFY7QUFJRSxNQUFBLEtBQUssRUFBRUYsTUFBTSxDQUFDckIsS0FKaEI7QUFLRSxNQUFBLFFBQVEsRUFBRTBCLE9BQU8sQ0FBQ0wsTUFBTSxDQUFDSSxRQUFSLENBTG5CO0FBTUUsTUFBQSxRQUFRLEVBQUVEO0FBTlosTUFERixDQVBGLENBRHFCO0FBQUEsR0FBdkI7O0FBb0JBLFNBQU9wQyxjQUFQO0FBQ0Q7O0FBRUQsSUFBTXVDLFNBQVMsR0FBRzVDLDZCQUFPQyxHQUFWLG9CQUFmOztBQU1BLElBQU00QyxVQUFVLEdBQUc3Qyw2QkFBT0MsR0FBVixvQkFBaEI7O0FBR0EsSUFBTTZDLFlBQVksR0FBRzlDLDZCQUFPQyxHQUFWLG9CQUFsQjs7ZUFJZUMsd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcbmltcG9ydCB7Y3JlYXRlU2VsZWN0b3J9IGZyb20gJ3Jlc2VsZWN0JztcblxuaW1wb3J0IHtQYW5lbExhYmVsLCBTaWRlUGFuZWxTZWN0aW9ufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgRmllbGRTZWxlY3RvckZhY3RvcnkgZnJvbSAnLi4vLi4vY29tbW9uL2ZpZWxkLXNlbGVjdG9yJztcblxuY29uc3QgVG9wUm93ID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuYDtcbkxheWVyQ29sdW1uQ29uZmlnRmFjdG9yeS5kZXBzID0gW0NvbHVtblNlbGVjdG9yRmFjdG9yeV07XG5mdW5jdGlvbiBMYXllckNvbHVtbkNvbmZpZ0ZhY3RvcnkoQ29sdW1uU2VsZWN0b3IpIHtcbiAgY2xhc3MgTGF5ZXJDb2x1bW5Db25maWcgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBjb2x1bW5zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBmaWVsZHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBhc3NpZ25Db2x1bW5QYWlyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGFzc2lnbkNvbHVtbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHVwZGF0ZUxheWVyQ29uZmlnOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgY29sdW1uUGFpcnM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICBmaWVsZFBhaXJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuYW55KSxcbiAgICAgIGNvbHVtbkxhYmVsczogUHJvcFR5cGVzLm9iamVjdFxuICAgIH07XG5cbiAgICBjb2x1bW5QYWlycyA9IHByb3BzID0+IHByb3BzLmNvbHVtblBhaXJzO1xuICAgIGZpZWxkUGFpcnMgPSBwcm9wcyA9PiBwcm9wcy5maWVsZFBhaXJzO1xuICAgIGZpZWxkUGFpcnNTZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yKFxuICAgICAgdGhpcy5jb2x1bW5QYWlycyxcbiAgICAgIHRoaXMuZmllbGRQYWlycyxcbiAgICAgIChjb2x1bW5QYWlycywgZmllbGRQYWlycykgPT5cbiAgICAgICAgY29sdW1uUGFpcnNcbiAgICAgICAgICA/IGZpZWxkUGFpcnMubWFwKGZwID0+ICh7XG4gICAgICAgICAgICAgIG5hbWU6IGZwLmRlZmF1bHROYW1lLFxuICAgICAgICAgICAgICB0eXBlOiAncG9pbnQnLFxuICAgICAgICAgICAgICBwYWlyOiBmcC5wYWlyXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICA6IG51bGxcbiAgICApO1xuXG4gICAgX3VwZGF0ZUNvbHVtbihrZXksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7Y29sdW1uUGFpcnMsIGFzc2lnbkNvbHVtblBhaXJzLCBhc3NpZ25Db2x1bW59ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3QgY29sdW1ucyA9XG4gICAgICAgIHZhbHVlICYmIHZhbHVlLnBhaXIgJiYgY29sdW1uUGFpcnNcbiAgICAgICAgICA/IGFzc2lnbkNvbHVtblBhaXJzKGtleSwgdmFsdWUucGFpcilcbiAgICAgICAgICA6IGFzc2lnbkNvbHVtbihrZXksIHZhbHVlKTtcblxuICAgICAgdGhpcy5wcm9wcy51cGRhdGVMYXllckNvbmZpZyh7Y29sdW1uc30pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtjb2x1bW5zLCBjb2x1bW5MYWJlbHMsIGZpZWxkc30gPSB0aGlzLnByb3BzO1xuXG4gICAgICBjb25zdCBmaWVsZFBhaXJzID0gdGhpcy5maWVsZFBhaXJzU2VsZWN0b3IodGhpcy5wcm9wcyk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxheWVyLWNvbmZpZ19fY29sdW1uXCI+XG4gICAgICAgICAgICAgIDxUb3BSb3c+XG4gICAgICAgICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J2NvbHVtbnMudGl0bGUnfSAvPlxuICAgICAgICAgICAgICAgIDwvUGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAgICA8UGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPVwibGF5ZXIucmVxdWlyZWRcIiAvPlxuICAgICAgICAgICAgICAgIDwvUGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAgPC9Ub3BSb3c+XG4gICAgICAgICAgICAgIHtPYmplY3Qua2V5cyhjb2x1bW5zKS5tYXAoa2V5ID0+IChcbiAgICAgICAgICAgICAgICA8Q29sdW1uU2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgIGNvbHVtbj17Y29sdW1uc1trZXldfVxuICAgICAgICAgICAgICAgICAgbGFiZWw9eyhjb2x1bW5MYWJlbHMgJiYgY29sdW1uTGFiZWxzW2tleV0pIHx8IGtleX1cbiAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgYWxsRmllbGRzPXtmaWVsZHN9XG4gICAgICAgICAgICAgICAgICBmaWVsZFBhaXJzPXtmaWVsZFBhaXJzfVxuICAgICAgICAgICAgICAgICAgb25TZWxlY3Q9e3ZhbCA9PiB0aGlzLl91cGRhdGVDb2x1bW4oa2V5LCB2YWwpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9TaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBMYXllckNvbHVtbkNvbmZpZztcbn1cbkNvbHVtblNlbGVjdG9yRmFjdG9yeS5kZXBzID0gW0ZpZWxkU2VsZWN0b3JGYWN0b3J5XTtcbmZ1bmN0aW9uIENvbHVtblNlbGVjdG9yRmFjdG9yeShGaWVsZFNlbGVjdG9yKSB7XG4gIGNvbnN0IENvbHVtblNlbGVjdG9yID0gKHtjb2x1bW4sIGxhYmVsLCBhbGxGaWVsZHMsIG9uU2VsZWN0LCBmaWVsZFBhaXJzfSkgPT4gKFxuICAgIDxDb2x1bW5Sb3cgY2xhc3NOYW1lPVwibGF5ZXItY29uZmlnX19jb2x1bW5fX3NlbGVjdG9yXCI+XG4gICAgICA8Q29sdW1uTmFtZSBjbGFzc05hbWU9XCJsYXllci1jb25maWdfX2NvbHVtbl9fbmFtZVwiPlxuICAgICAgICA8UGFuZWxMYWJlbD5cbiAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17YGNvbHVtbnMuJHtsYWJlbH1gfSAvPlxuICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgIHshY29sdW1uLm9wdGlvbmFsID8gPFBhbmVsTGFiZWw+e2AgICpgfTwvUGFuZWxMYWJlbD4gOiBudWxsfVxuICAgICAgPC9Db2x1bW5OYW1lPlxuICAgICAgPENvbHVtblNlbGVjdCBjbGFzc05hbWU9XCJsYXllci1jb25maWdfX2NvbHVtbl9fc2VsZWN0XCI+XG4gICAgICAgIDxGaWVsZFNlbGVjdG9yXG4gICAgICAgICAgc3VnZ2VzdGVkPXtmaWVsZFBhaXJzfVxuICAgICAgICAgIGVycm9yPXshY29sdW1uLm9wdGlvbmFsICYmICFjb2x1bW4udmFsdWV9XG4gICAgICAgICAgZmllbGRzPXthbGxGaWVsZHN9XG4gICAgICAgICAgdmFsdWU9e2NvbHVtbi52YWx1ZX1cbiAgICAgICAgICBlcmFzYWJsZT17Qm9vbGVhbihjb2x1bW4ub3B0aW9uYWwpfVxuICAgICAgICAgIG9uU2VsZWN0PXtvblNlbGVjdH1cbiAgICAgICAgLz5cbiAgICAgIDwvQ29sdW1uU2VsZWN0PlxuICAgIDwvQ29sdW1uUm93PlxuICApO1xuICByZXR1cm4gQ29sdW1uU2VsZWN0b3I7XG59XG5cbmNvbnN0IENvbHVtblJvdyA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1hcmdpbi1ib3R0b206IDhweDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbmA7XG5cbmNvbnN0IENvbHVtbk5hbWUgPSBzdHlsZWQuZGl2YFxuICB3aWR0aDogMjUlO1xuYDtcbmNvbnN0IENvbHVtblNlbGVjdCA9IHN0eWxlZC5kaXZgXG4gIHdpZHRoOiA3NSU7XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBMYXllckNvbHVtbkNvbmZpZ0ZhY3Rvcnk7XG4iXX0=