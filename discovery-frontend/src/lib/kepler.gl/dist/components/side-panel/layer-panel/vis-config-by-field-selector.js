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

var _reactIntl = require("react-intl");

var _styledComponents = require("../../common/styled-components");

var _infoHelper = _interopRequireDefault(require("../../common/info-helper"));

var _dimensionScaleSelector = _interopRequireDefault(require("./dimension-scale-selector"));

var _utils = require("../../../utils/utils");

var _fieldSelector = _interopRequireDefault(require("../../common/field-selector"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

VisConfigByFieldSelectorFactory.deps = [_infoHelper["default"], _fieldSelector["default"]];

function VisConfigByFieldSelectorFactory(InfoHelper, FieldSelector) {
  var VisConfigByFieldSelector = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(VisConfigByFieldSelector, _Component);

    var _super = _createSuper(VisConfigByFieldSelector);

    function VisConfigByFieldSelector() {
      var _this;

      (0, _classCallCheck2["default"])(this, VisConfigByFieldSelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_updateVisByField", function (val) {
        _this.props.updateField(val);
      });
      return _this;
    }

    (0, _createClass2["default"])(VisConfigByFieldSelector, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            property = _this$props.property,
            showScale = _this$props.showScale,
            selectedField = _this$props.selectedField,
            description = _this$props.description,
            label = _this$props.label,
            intl = _this$props.intl,
            _this$props$scaleOpti = _this$props.scaleOptions,
            scaleOptions = _this$props$scaleOpti === void 0 ? [] : _this$props$scaleOpti;
        return /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabelWrapper, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, label && /*#__PURE__*/_react["default"].createElement(_reactIntl.FormattedMessage, {
          id: label
        }) || /*#__PURE__*/_react["default"].createElement(_reactIntl.FormattedMessage, {
          id: "layer.propertyBasedOn",
          values: {
            property: intl.formatMessage({
              id: "property.".concat((0, _utils.camelize)(property)),
              defaultMessage: property
            })
          }
        })), description && /*#__PURE__*/_react["default"].createElement(InfoHelper, {
          description: description,
          property: property,
          id: "".concat(this.props.id, "-").concat(property)
        })), /*#__PURE__*/_react["default"].createElement(FieldSelector, {
          fields: this.props.fields,
          value: selectedField && selectedField.name,
          placeholder: this.props.placeholder,
          onSelect: this._updateVisByField,
          erasable: true
        })), /*#__PURE__*/_react["default"].createElement("div", null, showScale ? /*#__PURE__*/_react["default"].createElement(_dimensionScaleSelector["default"], {
          scaleType: this.props.scaleType,
          options: scaleOptions,
          label: "".concat(property, " scale"),
          onSelect: this.props.updateScale,
          disabled: scaleOptions.length < 2
        }) : null));
      }
    }]);
    return VisConfigByFieldSelector;
  }(_react.Component);

  (0, _defineProperty2["default"])(VisConfigByFieldSelector, "propTypes", {
    channel: _propTypes["default"].string.isRequired,
    fields: _propTypes["default"].arrayOf(_propTypes["default"].any).isRequired,
    id: _propTypes["default"].string.isRequired,
    property: _propTypes["default"].string.isRequired,
    showScale: _propTypes["default"].bool.isRequired,
    updateField: _propTypes["default"].func.isRequired,
    updateScale: _propTypes["default"].func.isRequired,
    // optional
    scaleType: _propTypes["default"].string,
    selectedField: _propTypes["default"].object,
    description: _propTypes["default"].string,
    label: _propTypes["default"].string,
    placeholder: _propTypes["default"].string
  });
  return (0, _reactIntl.injectIntl)(VisConfigByFieldSelector);
}

var _default = VisConfigByFieldSelectorFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvdmlzLWNvbmZpZy1ieS1maWVsZC1zZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJWaXNDb25maWdCeUZpZWxkU2VsZWN0b3JGYWN0b3J5IiwiZGVwcyIsIkluZm9IZWxwZXJGYWNvdHJ5IiwiRmllbGRTZWxlY3RvckZhY3RvcnkiLCJJbmZvSGVscGVyIiwiRmllbGRTZWxlY3RvciIsIlZpc0NvbmZpZ0J5RmllbGRTZWxlY3RvciIsInZhbCIsInByb3BzIiwidXBkYXRlRmllbGQiLCJwcm9wZXJ0eSIsInNob3dTY2FsZSIsInNlbGVjdGVkRmllbGQiLCJkZXNjcmlwdGlvbiIsImxhYmVsIiwiaW50bCIsInNjYWxlT3B0aW9ucyIsImZvcm1hdE1lc3NhZ2UiLCJpZCIsImRlZmF1bHRNZXNzYWdlIiwiZmllbGRzIiwibmFtZSIsInBsYWNlaG9sZGVyIiwiX3VwZGF0ZVZpc0J5RmllbGQiLCJzY2FsZVR5cGUiLCJ1cGRhdGVTY2FsZSIsImxlbmd0aCIsIkNvbXBvbmVudCIsImNoYW5uZWwiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsImFueSIsImJvb2wiLCJmdW5jIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQUEsK0JBQStCLENBQUNDLElBQWhDLEdBQXVDLENBQUNDLHNCQUFELEVBQW9CQyx5QkFBcEIsQ0FBdkM7O0FBQ0EsU0FBU0gsK0JBQVQsQ0FBeUNJLFVBQXpDLEVBQXFEQyxhQUFyRCxFQUFvRTtBQUFBLE1BQzVEQyx3QkFENEQ7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLDRHQW1CNUMsVUFBQUMsR0FBRyxFQUFJO0FBQ3pCLGNBQUtD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LEVBQUVnQixzQkFBVUMsTUFaTjtBQWFqQmhCLElBQUFBLEtBQUssRUFBRWUsc0JBQVVDLE1BYkE7QUFjakJSLElBQUFBLFdBQVcsRUFBRU8sc0JBQVVDO0FBZE4sR0FGNkM7QUFrRmxFLFNBQU8sMkJBQVd4Qix3QkFBWCxDQUFQO0FBQ0Q7O2VBRWNOLCtCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlLCBpbmplY3RJbnRsfSBmcm9tICdyZWFjdC1pbnRsJztcblxuaW1wb3J0IHtQYW5lbExhYmVsLCBQYW5lbExhYmVsV3JhcHBlciwgU2lkZVBhbmVsU2VjdGlvbn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IEluZm9IZWxwZXJGYWNvdHJ5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2luZm8taGVscGVyJztcbmltcG9ydCBEaW1lbnNpb25TY2FsZVNlbGVjdG9yIGZyb20gJy4vZGltZW5zaW9uLXNjYWxlLXNlbGVjdG9yJztcbmltcG9ydCB7Y2FtZWxpemV9IGZyb20gJ3V0aWxzL3V0aWxzJztcbmltcG9ydCBGaWVsZFNlbGVjdG9yRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vZmllbGQtc2VsZWN0b3InO1xuXG5WaXNDb25maWdCeUZpZWxkU2VsZWN0b3JGYWN0b3J5LmRlcHMgPSBbSW5mb0hlbHBlckZhY290cnksIEZpZWxkU2VsZWN0b3JGYWN0b3J5XTtcbmZ1bmN0aW9uIFZpc0NvbmZpZ0J5RmllbGRTZWxlY3RvckZhY3RvcnkoSW5mb0hlbHBlciwgRmllbGRTZWxlY3Rvcikge1xuICBjbGFzcyBWaXNDb25maWdCeUZpZWxkU2VsZWN0b3IgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICBjaGFubmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICBmaWVsZHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBpZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgcHJvcGVydHk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIHNob3dTY2FsZTogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICAgIHVwZGF0ZUZpZWxkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgdXBkYXRlU2NhbGU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAgIC8vIG9wdGlvbmFsXG4gICAgICBzY2FsZVR5cGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBzZWxlY3RlZEZpZWxkOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgZGVzY3JpcHRpb246IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nXG4gICAgfTtcblxuICAgIF91cGRhdGVWaXNCeUZpZWxkID0gdmFsID0+IHtcbiAgICAgIHRoaXMucHJvcHMudXBkYXRlRmllbGQodmFsKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgc2hvd1NjYWxlLFxuICAgICAgICBzZWxlY3RlZEZpZWxkLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIGludGwsXG4gICAgICAgIHNjYWxlT3B0aW9ucyA9IFtdXG4gICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICA8UGFuZWxMYWJlbFdyYXBwZXI+XG4gICAgICAgICAgICAgIDxQYW5lbExhYmVsPlxuICAgICAgICAgICAgICAgIHsobGFiZWwgJiYgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9e2xhYmVsfSAvPikgfHwgKFxuICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJsYXllci5wcm9wZXJ0eUJhc2VkT25cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM9e3tcbiAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogaW50bC5mb3JtYXRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBgcHJvcGVydHkuJHtjYW1lbGl6ZShwcm9wZXJ0eSl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRNZXNzYWdlOiBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvUGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAge2Rlc2NyaXB0aW9uICYmIChcbiAgICAgICAgICAgICAgICA8SW5mb0hlbHBlclxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgcHJvcGVydHk9e3Byb3BlcnR5fVxuICAgICAgICAgICAgICAgICAgaWQ9e2Ake3RoaXMucHJvcHMuaWR9LSR7cHJvcGVydHl9YH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9QYW5lbExhYmVsV3JhcHBlcj5cbiAgICAgICAgICAgIDxGaWVsZFNlbGVjdG9yXG4gICAgICAgICAgICAgIGZpZWxkcz17dGhpcy5wcm9wcy5maWVsZHN9XG4gICAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZEZpZWxkICYmIHNlbGVjdGVkRmllbGQubmFtZX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgIG9uU2VsZWN0PXt0aGlzLl91cGRhdGVWaXNCeUZpZWxkfVxuICAgICAgICAgICAgICBlcmFzYWJsZVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIHtzaG93U2NhbGUgPyAoXG4gICAgICAgICAgICAgIDxEaW1lbnNpb25TY2FsZVNlbGVjdG9yXG4gICAgICAgICAgICAgICAgc2NhbGVUeXBlPXt0aGlzLnByb3BzLnNjYWxlVHlwZX1cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtzY2FsZU9wdGlvbnN9XG4gICAgICAgICAgICAgICAgbGFiZWw9e2Ake3Byb3BlcnR5fSBzY2FsZWB9XG4gICAgICAgICAgICAgICAgb25TZWxlY3Q9e3RoaXMucHJvcHMudXBkYXRlU2NhbGV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3NjYWxlT3B0aW9ucy5sZW5ndGggPCAyfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpbmplY3RJbnRsKFZpc0NvbmZpZ0J5RmllbGRTZWxlY3Rvcik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpc0NvbmZpZ0J5RmllbGRTZWxlY3RvckZhY3Rvcnk7XG4iXX0=