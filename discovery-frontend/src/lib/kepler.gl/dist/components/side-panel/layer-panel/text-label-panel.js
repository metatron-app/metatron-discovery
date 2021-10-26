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

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _localization = require("../../../localization");

var _styledComponents = require("../../common/styled-components");

var _icons = require("../../common/icons");

var _colorSelector = _interopRequireDefault(require("./color-selector"));

var _itemSelector = _interopRequireDefault(require("../../common/item-selector/item-selector"));

var _layerConfigGroup = _interopRequireWildcard(require("./layer-config-group"));

var _rangeSlider = _interopRequireDefault(require("../../common/range-slider"));

var _layerFactory = require("../../../layers/layer-factory");

var _fieldSelector = _interopRequireDefault(require("../../common/field-selector"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

TextLabelPanelFactory.deps = [_rangeSlider["default"], _layerConfigGroup["default"], _fieldSelector["default"]];

function TextLabelPanelFactory(RangeSlider, LayerConfigGroup, FieldSelector) {
  var TextLabelPanel = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(TextLabelPanel, _Component);

    var _super = _createSuper(TextLabelPanel);

    function TextLabelPanel() {
      (0, _classCallCheck2["default"])(this, TextLabelPanel);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(TextLabelPanel, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            updateLayerTextLabel = _this$props.updateLayerTextLabel,
            textLabel = _this$props.textLabel,
            fields = _this$props.fields;
        var currentFields = textLabel.map(function (tl) {
          return tl.field && tl.field.name;
        }).filter(function (d) {
          return d;
        });
        return /*#__PURE__*/_react["default"].createElement(LayerConfigGroup, {
          label: 'panel.text.label',
          collapsible: true
        }, /*#__PURE__*/_react["default"].createElement(_layerConfigGroup.ConfigGroupCollapsibleHeader, null, /*#__PURE__*/_react["default"].createElement(FieldSelector, {
          fields: fields,
          value: currentFields,
          onSelect: function onSelect(selected) {
            return updateLayerTextLabel('all', 'fields', selected);
          },
          multiSelect: true
        })), /*#__PURE__*/_react["default"].createElement(_layerConfigGroup.ConfigGroupCollapsibleContent, null, textLabel.map(function (tl, idx) {
          return /*#__PURE__*/_react["default"].createElement("div", {
            key: tl.field ? tl.field.name : "null-".concat(idx)
          }, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: 'panel.text.labelWithId',
            values: {
              labelId: idx + 1
            }
          })), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(FieldSelector, {
            fields: fields,
            value: tl.field && tl.field.name || 'placeholder.selectField',
            placeholder: 'placeholder.empty',
            onSelect: function onSelect(v) {
              return updateLayerTextLabel(idx, 'field', v);
            },
            erasable: true
          })), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: "panel.text.fontSize"
          })), /*#__PURE__*/_react["default"].createElement(RangeSlider, (0, _extends2["default"])({}, _layerFactory.LAYER_TEXT_CONFIGS.fontSize, {
            value1: tl.size,
            isRange: false,
            onChange: function onChange(v) {
              return updateLayerTextLabel(idx, 'size', v[1]);
            }
          }))), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: "panel.text.fontColor"
          })), /*#__PURE__*/_react["default"].createElement(_colorSelector["default"], {
            colorSets: [{
              selectedColor: tl.color,
              setColor: function setColor(v) {
                return updateLayerTextLabel(idx, 'color', v);
              }
            }]
          })), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.SpaceBetweenFlexbox, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.SBFlexboxItem, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: "panel.text.textAnchor"
          })), /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], (0, _extends2["default"])({}, _layerFactory.LAYER_TEXT_CONFIGS.textAnchor, {
            selectedItems: tl.anchor,
            onChange: function onChange(val) {
              return updateLayerTextLabel(idx, 'anchor', val);
            }
          }))), /*#__PURE__*/_react["default"].createElement(_styledComponents.SBFlexboxItem, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.PanelLabel, null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
            id: "panel.text.alignment"
          })), /*#__PURE__*/_react["default"].createElement(_itemSelector["default"], (0, _extends2["default"])({}, _layerFactory.LAYER_TEXT_CONFIGS.textAlignment, {
            selectedItems: tl.alignment,
            onChange: function onChange(val) {
              return updateLayerTextLabel(idx, 'alignment', val);
            }
          }))))));
        }), /*#__PURE__*/_react["default"].createElement(_styledComponents.SidePanelSection, null, /*#__PURE__*/_react["default"].createElement(_styledComponents.Button, {
          link: true,
          onClick: function onClick(val) {
            return updateLayerTextLabel(textLabel.length);
          }
        }, /*#__PURE__*/_react["default"].createElement(_icons.Add, {
          height: "12px"
        }), /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
          id: "panel.text.addMoreLabel"
        })))));
      }
    }]);
    return TextLabelPanel;
  }(_react.Component);

  (0, _defineProperty2["default"])(TextLabelPanel, "propTypes", {
    fields: _propTypes["default"].arrayOf(_propTypes["default"].object),
    textLabel: _propTypes["default"].arrayOf(_propTypes["default"].object),
    updateLayerTextLabel: _propTypes["default"].func.isRequired
  });
  return TextLabelPanel;
}

var _default = TextLabelPanelFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvbGF5ZXItcGFuZWwvdGV4dC1sYWJlbC1wYW5lbC5qcyJdLCJuYW1lcyI6WyJUZXh0TGFiZWxQYW5lbEZhY3RvcnkiLCJkZXBzIiwiUmFuZ2VTbGlkZXJGYWN0b3J5IiwiTGF5ZXJDb25maWdHcm91cEZhY3RvcnkiLCJGaWVsZFNlbGVjdG9yRmFjdG9yeSIsIlJhbmdlU2xpZGVyIiwiTGF5ZXJDb25maWdHcm91cCIsIkZpZWxkU2VsZWN0b3IiLCJUZXh0TGFiZWxQYW5lbCIsInByb3BzIiwidXBkYXRlTGF5ZXJUZXh0TGFiZWwiLCJ0ZXh0TGFiZWwiLCJmaWVsZHMiLCJjdXJyZW50RmllbGRzIiwibWFwIiwidGwiLCJmaWVsZCIsIm5hbWUiLCJmaWx0ZXIiLCJkIiwic2VsZWN0ZWQiLCJpZHgiLCJsYWJlbElkIiwidiIsIkxBWUVSX1RFWFRfQ09ORklHUyIsImZvbnRTaXplIiwic2l6ZSIsInNlbGVjdGVkQ29sb3IiLCJjb2xvciIsInNldENvbG9yIiwidGV4dEFuY2hvciIsImFuY2hvciIsInZhbCIsInRleHRBbGlnbm1lbnQiLCJhbGlnbm1lbnQiLCJsZW5ndGgiLCJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwib2JqZWN0IiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBT0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBRUE7O0FBQ0E7Ozs7OztBQUVBQSxxQkFBcUIsQ0FBQ0MsSUFBdEIsR0FBNkIsQ0FBQ0MsdUJBQUQsRUFBcUJDLDRCQUFyQixFQUE4Q0MseUJBQTlDLENBQTdCOztBQUNBLFNBQVNKLHFCQUFULENBQStCSyxXQUEvQixFQUE0Q0MsZ0JBQTVDLEVBQThEQyxhQUE5RCxFQUE2RTtBQUFBLE1BQ3JFQyxjQURxRTtBQUFBOztBQUFBOztBQUFBO0FB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RSxFQUFDO0FBQXJCLFVBRkYsQ0FERixDQWpFRixDQVRGLENBREY7QUFvRkQ7QUEvRndFO0FBQUE7QUFBQSxJQUM5Q0MsZ0JBRDhDOztBQUFBLG1DQUNyRTVCLGNBRHFFLGVBRXREO0FBQ2pCSSxJQUFBQSxNQUFNLEVBQUV5QixzQkFBVUMsT0FBVixDQUFrQkQsc0JBQVVFLE1BQTVCLENBRFM7QUFFakI1QixJQUFBQSxTQUFTLEVBQUUwQixzQkFBVUMsT0FBVixDQUFrQkQsc0JBQVVFLE1BQTVCLENBRk07QUFHakI3QixJQUFBQSxvQkFBb0IsRUFBRTJCLHNCQUFVRyxJQUFWLENBQWVDO0FBSHBCLEdBRnNEO0FBa0czRSxTQUFPakMsY0FBUDtBQUNEOztlQUVjUixxQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7Rm9ybWF0dGVkTWVzc2FnZX0gZnJvbSAnbG9jYWxpemF0aW9uJztcblxuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBQYW5lbExhYmVsLFxuICBTQkZsZXhib3hJdGVtLFxuICBTaWRlUGFuZWxTZWN0aW9uLFxuICBTcGFjZUJldHdlZW5GbGV4Ym94XG59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7QWRkfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQgQ29sb3JTZWxlY3RvciBmcm9tICcuL2NvbG9yLXNlbGVjdG9yJztcbmltcG9ydCBJdGVtU2VsZWN0b3IgZnJvbSAnY29tcG9uZW50cy9jb21tb24vaXRlbS1zZWxlY3Rvci9pdGVtLXNlbGVjdG9yJztcbmltcG9ydCBMYXllckNvbmZpZ0dyb3VwRmFjdG9yeSwge1xuICBDb25maWdHcm91cENvbGxhcHNpYmxlQ29udGVudCxcbiAgQ29uZmlnR3JvdXBDb2xsYXBzaWJsZUhlYWRlclxufSBmcm9tICcuL2xheWVyLWNvbmZpZy1ncm91cCc7XG5pbXBvcnQgUmFuZ2VTbGlkZXJGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3JhbmdlLXNsaWRlcic7XG5cbmltcG9ydCB7TEFZRVJfVEVYVF9DT05GSUdTfSBmcm9tICdsYXllcnMvbGF5ZXItZmFjdG9yeSc7XG5pbXBvcnQgRmllbGRTZWxlY3RvckZhY3RvcnkgZnJvbSAnLi4vLi4vY29tbW9uL2ZpZWxkLXNlbGVjdG9yJztcblxuVGV4dExhYmVsUGFuZWxGYWN0b3J5LmRlcHMgPSBbUmFuZ2VTbGlkZXJGYWN0b3J5LCBMYXllckNvbmZpZ0dyb3VwRmFjdG9yeSwgRmllbGRTZWxlY3RvckZhY3RvcnldO1xuZnVuY3Rpb24gVGV4dExhYmVsUGFuZWxGYWN0b3J5KFJhbmdlU2xpZGVyLCBMYXllckNvbmZpZ0dyb3VwLCBGaWVsZFNlbGVjdG9yKSB7XG4gIGNsYXNzIFRleHRMYWJlbFBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgZmllbGRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICAgIHRleHRMYWJlbDogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG4gICAgICB1cGRhdGVMYXllclRleHRMYWJlbDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7dXBkYXRlTGF5ZXJUZXh0TGFiZWwsIHRleHRMYWJlbCwgZmllbGRzfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBjdXJyZW50RmllbGRzID0gdGV4dExhYmVsLm1hcCh0bCA9PiB0bC5maWVsZCAmJiB0bC5maWVsZC5uYW1lKS5maWx0ZXIoZCA9PiBkKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxMYXllckNvbmZpZ0dyb3VwIGxhYmVsPXsncGFuZWwudGV4dC5sYWJlbCd9IGNvbGxhcHNpYmxlPlxuICAgICAgICAgIDxDb25maWdHcm91cENvbGxhcHNpYmxlSGVhZGVyPlxuICAgICAgICAgICAgPEZpZWxkU2VsZWN0b3JcbiAgICAgICAgICAgICAgZmllbGRzPXtmaWVsZHN9XG4gICAgICAgICAgICAgIHZhbHVlPXtjdXJyZW50RmllbGRzfVxuICAgICAgICAgICAgICBvblNlbGVjdD17c2VsZWN0ZWQgPT4gdXBkYXRlTGF5ZXJUZXh0TGFiZWwoJ2FsbCcsICdmaWVsZHMnLCBzZWxlY3RlZCl9XG4gICAgICAgICAgICAgIG11bHRpU2VsZWN0XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQ29uZmlnR3JvdXBDb2xsYXBzaWJsZUhlYWRlcj5cbiAgICAgICAgICA8Q29uZmlnR3JvdXBDb2xsYXBzaWJsZUNvbnRlbnQ+XG4gICAgICAgICAgICB7dGV4dExhYmVsLm1hcCgodGwsIGlkeCkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17dGwuZmllbGQgPyB0bC5maWVsZC5uYW1lIDogYG51bGwtJHtpZHh9YH0+XG4gICAgICAgICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD17J3BhbmVsLnRleHQubGFiZWxXaXRoSWQnfSB2YWx1ZXM9e3tsYWJlbElkOiBpZHggKyAxfX0gLz5cbiAgICAgICAgICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICAgICAgICA8RmllbGRTZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBmaWVsZHM9e2ZpZWxkc31cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9eyh0bC5maWVsZCAmJiB0bC5maWVsZC5uYW1lKSB8fCAncGxhY2Vob2xkZXIuc2VsZWN0RmllbGQnfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17J3BsYWNlaG9sZGVyLmVtcHR5J31cbiAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q9e3YgPT4gdXBkYXRlTGF5ZXJUZXh0TGFiZWwoaWR4LCAnZmllbGQnLCB2KX1cbiAgICAgICAgICAgICAgICAgICAgZXJhc2FibGVcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9TaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgICAgICAgIDxTaWRlUGFuZWxTZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPVwicGFuZWwudGV4dC5mb250U2l6ZVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICA8UmFuZ2VTbGlkZXJcbiAgICAgICAgICAgICAgICAgICAgey4uLkxBWUVSX1RFWFRfQ09ORklHUy5mb250U2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUxPXt0bC5zaXplfVxuICAgICAgICAgICAgICAgICAgICBpc1JhbmdlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3YgPT4gdXBkYXRlTGF5ZXJUZXh0TGFiZWwoaWR4LCAnc2l6ZScsIHZbMV0pfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICAgICAgPFNpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICAgICAgICA8UGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9XCJwYW5lbC50ZXh0LmZvbnRDb2xvclwiIC8+XG4gICAgICAgICAgICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICA8Q29sb3JTZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBjb2xvclNldHM9e1tcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENvbG9yOiB0bC5jb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbG9yOiB2ID0+IHVwZGF0ZUxheWVyVGV4dExhYmVsKGlkeCwgJ2NvbG9yJywgdilcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvU2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICAgICAgICA8U2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgIDxTcGFjZUJldHdlZW5GbGV4Ym94PlxuICAgICAgICAgICAgICAgICAgICA8U0JGbGV4Ym94SXRlbT5cbiAgICAgICAgICAgICAgICAgICAgICA8UGFuZWxMYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPVwicGFuZWwudGV4dC50ZXh0QW5jaG9yXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPEl0ZW1TZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgey4uLkxBWUVSX1RFWFRfQ09ORklHUy50ZXh0QW5jaG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcz17dGwuYW5jaG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3ZhbCA9PiB1cGRhdGVMYXllclRleHRMYWJlbChpZHgsICdhbmNob3InLCB2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvU0JGbGV4Ym94SXRlbT5cbiAgICAgICAgICAgICAgICAgICAgPFNCRmxleGJveEl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgPFBhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD1cInBhbmVsLnRleHQuYWxpZ25tZW50XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L1BhbmVsTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPEl0ZW1TZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgey4uLkxBWUVSX1RFWFRfQ09ORklHUy50ZXh0QWxpZ25tZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcz17dGwuYWxpZ25tZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3ZhbCA9PiB1cGRhdGVMYXllclRleHRMYWJlbChpZHgsICdhbGlnbm1lbnQnLCB2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvU0JGbGV4Ym94SXRlbT5cbiAgICAgICAgICAgICAgICAgIDwvU3BhY2VCZXR3ZWVuRmxleGJveD5cbiAgICAgICAgICAgICAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8U2lkZVBhbmVsU2VjdGlvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBsaW5rIG9uQ2xpY2s9e3ZhbCA9PiB1cGRhdGVMYXllclRleHRMYWJlbCh0ZXh0TGFiZWwubGVuZ3RoKX0+XG4gICAgICAgICAgICAgICAgPEFkZCBoZWlnaHQ9XCIxMnB4XCIgLz5cbiAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTWVzc2FnZSBpZD1cInBhbmVsLnRleHQuYWRkTW9yZUxhYmVsXCIgLz5cbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L1NpZGVQYW5lbFNlY3Rpb24+XG4gICAgICAgICAgPC9Db25maWdHcm91cENvbGxhcHNpYmxlQ29udGVudD5cbiAgICAgICAgPC9MYXllckNvbmZpZ0dyb3VwPlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gVGV4dExhYmVsUGFuZWw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRMYWJlbFBhbmVsRmFjdG9yeTtcbiJdfQ==