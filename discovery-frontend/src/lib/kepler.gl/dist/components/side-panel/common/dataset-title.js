"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = DatasetTitleFactory;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _localization = require("../../../localization");

var _styledComponents2 = require("../../common/styled-components");

var _icons = require("../../common/icons");

var _datasetTag = _interopRequireDefault(require("./dataset-tag"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-left: 12px;\n  height: 16px;\n  opacity: 0;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  display: flex;\n  align-items: flex-start;\n\n  .source-data-arrow {\n    height: 16px;\n  }\n  :hover {\n    cursor: ", ";\n\n    .dataset-name {\n      color: ", ";\n    }\n\n    .dataset-action {\n      color: ", ";\n      opacity: 1;\n    }\n\n    .dataset-action:hover {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function nop() {}

var StyledDatasetTitle = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.clickable ? 'pointer' : 'auto';
}, function (props) {
  return props.clickable ? props.theme.textColorHl : props.theme.textColor;
}, function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.textColorHl;
});

var DataTagAction = _styledComponents["default"].div(_templateObject2());

var ShowDataTable = function ShowDataTable(_ref) {
  var id = _ref.id,
      _ref$showDatasetTable = _ref.showDatasetTable,
      showDatasetTable = _ref$showDatasetTable === void 0 ? nop : _ref$showDatasetTable;
  return /*#__PURE__*/_react["default"].createElement(DataTagAction, {
    className: "dataset-action show-data-table",
    "data-tip": true,
    "data-for": "data-table-".concat(id)
  }, /*#__PURE__*/_react["default"].createElement(_icons.Table, {
    height: "16px",
    onClick: function onClick(e) {
      e.stopPropagation();
      showDatasetTable(id);
    }
  }), /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
    id: "data-table-".concat(id),
    effect: "solid"
  }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: 'datasetTitle.showDataTable'
  }))));
};

var RemoveDataset = function RemoveDataset(_ref2) {
  var datasetKey = _ref2.datasetKey,
      _ref2$removeDataset = _ref2.removeDataset,
      removeDataset = _ref2$removeDataset === void 0 ? nop : _ref2$removeDataset;
  return /*#__PURE__*/_react["default"].createElement(DataTagAction, {
    className: "dataset-action remove-dataset",
    "data-tip": true,
    "data-for": "delete-".concat(datasetKey)
  }, /*#__PURE__*/_react["default"].createElement(_icons.Trash, {
    height: "16px",
    onClick: function onClick(e) {
      e.stopPropagation();
      removeDataset(datasetKey);
    }
  }), /*#__PURE__*/_react["default"].createElement(_styledComponents2.Tooltip, {
    id: "delete-".concat(datasetKey),
    effect: "solid",
    type: "error"
  }, /*#__PURE__*/_react["default"].createElement("span", null, /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
    id: 'datasetTitle.removeDataset'
  }))));
};

DatasetTitleFactory.deps = [_datasetTag["default"]];

function DatasetTitleFactory(DatasetTag) {
  var DatasetTitle = /*#__PURE__*/function (_PureComponent) {
    (0, _inherits2["default"])(DatasetTitle, _PureComponent);

    var _super = _createSuper(DatasetTitle);

    function DatasetTitle() {
      var _this;

      (0, _classCallCheck2["default"])(this, DatasetTitle);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onClickTitle", function (e) {
        e.stopPropagation();

        if (typeof _this.props.onTitleClick === 'function') {
          _this.props.onTitleClick();
        } else if (typeof _this.props.showDatasetTable === 'function') {
          _this.props.showDatasetTable(_this.props.dataset.id);
        }
      });
      return _this;
    }

    (0, _createClass2["default"])(DatasetTitle, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            showDatasetTable = _this$props.showDatasetTable,
            showDeleteDataset = _this$props.showDeleteDataset,
            onTitleClick = _this$props.onTitleClick,
            removeDataset = _this$props.removeDataset,
            dataset = _this$props.dataset;
        return /*#__PURE__*/_react["default"].createElement(StyledDatasetTitle, {
          className: "source-data-title",
          clickable: Boolean(showDatasetTable || onTitleClick)
        }, /*#__PURE__*/_react["default"].createElement(DatasetTag, {
          dataset: dataset,
          onClick: this._onClickTitle
        }), showDatasetTable ? /*#__PURE__*/_react["default"].createElement(_styledComponents2.CenterFlexbox, {
          className: "source-data-arrow"
        }, /*#__PURE__*/_react["default"].createElement(_icons.ArrowRight, {
          height: "12px"
        })) : null, showDatasetTable ? /*#__PURE__*/_react["default"].createElement(ShowDataTable, {
          id: dataset.id,
          showDatasetTable: showDatasetTable
        }) : null, showDeleteDataset ? /*#__PURE__*/_react["default"].createElement(RemoveDataset, {
          datasetKey: dataset.id,
          removeDataset: removeDataset
        }) : null);
      }
    }]);
    return DatasetTitle;
  }(_react.PureComponent);

  return DatasetTitle;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3NpZGUtcGFuZWwvY29tbW9uL2RhdGFzZXQtdGl0bGUuanMiXSwibmFtZXMiOlsibm9wIiwiU3R5bGVkRGF0YXNldFRpdGxlIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvciIsImNsaWNrYWJsZSIsInRleHRDb2xvckhsIiwiRGF0YVRhZ0FjdGlvbiIsIlNob3dEYXRhVGFibGUiLCJpZCIsInNob3dEYXRhc2V0VGFibGUiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwiUmVtb3ZlRGF0YXNldCIsImRhdGFzZXRLZXkiLCJyZW1vdmVEYXRhc2V0IiwiRGF0YXNldFRpdGxlRmFjdG9yeSIsImRlcHMiLCJEYXRhc2V0VGFnRmFjdG9yeSIsIkRhdGFzZXRUYWciLCJEYXRhc2V0VGl0bGUiLCJvblRpdGxlQ2xpY2siLCJkYXRhc2V0Iiwic2hvd0RlbGV0ZURhdGFzZXQiLCJCb29sZWFuIiwiX29uQ2xpY2tUaXRsZSIsIlB1cmVDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQSxHQUFULEdBQWUsQ0FBRTs7QUFFakIsSUFBTUMsa0JBQWtCLEdBQUdDLDZCQUFPQyxHQUFWLG9CQUNiLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsU0FBaEI7QUFBQSxDQURRLEVBU1YsVUFBQUYsS0FBSztBQUFBLFNBQUtBLEtBQUssQ0FBQ0csU0FBTixHQUFrQixTQUFsQixHQUE4QixNQUFuQztBQUFBLENBVEssRUFZVCxVQUFBSCxLQUFLO0FBQUEsU0FBS0EsS0FBSyxDQUFDRyxTQUFOLEdBQWtCSCxLQUFLLENBQUNDLEtBQU4sQ0FBWUcsV0FBOUIsR0FBNENKLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxTQUE3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R0xhLGlCQUhLLGVBR0xBLGlCQUhLO0FBQUEsWUFJTEYsWUFKSyxlQUlMQSxZQUpLO0FBQUEsWUFLTE4sYUFMSyxlQUtMQSxhQUxLO0FBQUEsWUFNTE8sT0FOSyxlQU1MQSxPQU5LO0FBU1AsNEJBQ0UsZ0NBQUMsa0JBQUQ7QUFDRSxVQUFBLFNBQVMsRUFBQyxtQkFEWjtBQUVFLFVBQUEsU0FBUyxFQUFFRSxPQUFPLENBQUNkLGdCQUFnQixJQUFJVyxZQUFyQjtBQUZwQix3QkFJRSxnQ0FBQyxVQUFEO0FBQVksVUFBQSxPQUFPLEVBQUVDLE9BQXJCO0FBQThCLFVBQUEsT0FBTyxFQUFFLEtBQUtHO0FBQTVDLFVBSkYsRUFLR2YsZ0JBQWdCLGdCQUNmLGdDQUFDLGdDQUFEO0FBQWUsVUFBQSxTQUFTLEVBQUM7QUFBekIsd0JBQ0UsZ0NBQUMsaUJBQUQ7QUFBWSxVQUFBLE1BQU0sRUFBQztBQUFuQixVQURGLENBRGUsR0FJYixJQVROLEVBVUdBLGdCQUFnQixnQkFDZixnQ0FBQyxhQUFEO0FBQWUsVUFBQSxFQUFFLEVBQUVZLE9BQU8sQ0FBQ2IsRUFBM0I7QUFBK0IsVUFBQSxnQkFBZ0IsRUFBRUM7QUFBakQsVUFEZSxHQUViLElBWk4sRUFhR2EsaUJBQWlCLGdCQUNoQixnQ0FBQyxhQUFEO0FBQWUsVUFBQSxVQUFVLEVBQUVELE9BQU8sQ0FBQ2IsRUFBbkM7QUFBdUMsVUFBQSxhQUFhLEVBQUVNO0FBQXRELFVBRGdCLEdBRWQsSUFmTixDQURGO0FBbUJEO0FBdkNtRDtBQUFBO0FBQUEsSUFDM0JXLG9CQUQyQjs7QUEwQ3RELFNBQU9OLFlBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge1B1cmVDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuXG5pbXBvcnQge0NlbnRlckZsZXhib3gsIFRvb2x0aXB9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7QXJyb3dSaWdodCwgVGFibGUsIFRyYXNofSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQgRGF0YXNldFRhZ0ZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9zaWRlLXBhbmVsL2NvbW1vbi9kYXRhc2V0LXRhZyc7XG5cbmZ1bmN0aW9uIG5vcCgpIHt9XG5cbmNvbnN0IFN0eWxlZERhdGFzZXRUaXRsZSA9IHN0eWxlZC5kaXZgXG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuXG4gIC5zb3VyY2UtZGF0YS1hcnJvdyB7XG4gICAgaGVpZ2h0OiAxNnB4O1xuICB9XG4gIDpob3ZlciB7XG4gICAgY3Vyc29yOiAke3Byb3BzID0+IChwcm9wcy5jbGlja2FibGUgPyAncG9pbnRlcicgOiAnYXV0bycpfTtcblxuICAgIC5kYXRhc2V0LW5hbWUge1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gKHByb3BzLmNsaWNrYWJsZSA/IHByb3BzLnRoZW1lLnRleHRDb2xvckhsIDogcHJvcHMudGhlbWUudGV4dENvbG9yKX07XG4gICAgfVxuXG4gICAgLmRhdGFzZXQtYWN0aW9uIHtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC5kYXRhc2V0LWFjdGlvbjpob3ZlciB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JIbH07XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCBEYXRhVGFnQWN0aW9uID0gc3R5bGVkLmRpdmBcbiAgbWFyZ2luLWxlZnQ6IDEycHg7XG4gIGhlaWdodDogMTZweDtcbiAgb3BhY2l0eTogMDtcbmA7XG5cbmNvbnN0IFNob3dEYXRhVGFibGUgPSAoe2lkLCBzaG93RGF0YXNldFRhYmxlID0gbm9wfSkgPT4gKFxuICA8RGF0YVRhZ0FjdGlvbiBjbGFzc05hbWU9XCJkYXRhc2V0LWFjdGlvbiBzaG93LWRhdGEtdGFibGVcIiBkYXRhLXRpcCBkYXRhLWZvcj17YGRhdGEtdGFibGUtJHtpZH1gfT5cbiAgICA8VGFibGVcbiAgICAgIGhlaWdodD1cIjE2cHhcIlxuICAgICAgb25DbGljaz17ZSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEYXRhc2V0VGFibGUoaWQpO1xuICAgICAgfX1cbiAgICAvPlxuICAgIDxUb29sdGlwIGlkPXtgZGF0YS10YWJsZS0ke2lkfWB9IGVmZmVjdD1cInNvbGlkXCI+XG4gICAgICA8c3Bhbj5cbiAgICAgICAgPEZvcm1hdHRlZE1lc3NhZ2UgaWQ9eydkYXRhc2V0VGl0bGUuc2hvd0RhdGFUYWJsZSd9IC8+XG4gICAgICA8L3NwYW4+XG4gICAgPC9Ub29sdGlwPlxuICA8L0RhdGFUYWdBY3Rpb24+XG4pO1xuXG5jb25zdCBSZW1vdmVEYXRhc2V0ID0gKHtkYXRhc2V0S2V5LCByZW1vdmVEYXRhc2V0ID0gbm9wfSkgPT4gKFxuICA8RGF0YVRhZ0FjdGlvblxuICAgIGNsYXNzTmFtZT1cImRhdGFzZXQtYWN0aW9uIHJlbW92ZS1kYXRhc2V0XCJcbiAgICBkYXRhLXRpcFxuICAgIGRhdGEtZm9yPXtgZGVsZXRlLSR7ZGF0YXNldEtleX1gfVxuICA+XG4gICAgPFRyYXNoXG4gICAgICBoZWlnaHQ9XCIxNnB4XCJcbiAgICAgIG9uQ2xpY2s9e2UgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICByZW1vdmVEYXRhc2V0KGRhdGFzZXRLZXkpO1xuICAgICAgfX1cbiAgICAvPlxuICAgIDxUb29sdGlwIGlkPXtgZGVsZXRlLSR7ZGF0YXNldEtleX1gfSBlZmZlY3Q9XCJzb2xpZFwiIHR5cGU9XCJlcnJvclwiPlxuICAgICAgPHNwYW4+XG4gICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlIGlkPXsnZGF0YXNldFRpdGxlLnJlbW92ZURhdGFzZXQnfSAvPlxuICAgICAgPC9zcGFuPlxuICAgIDwvVG9vbHRpcD5cbiAgPC9EYXRhVGFnQWN0aW9uPlxuKTtcblxuRGF0YXNldFRpdGxlRmFjdG9yeS5kZXBzID0gW0RhdGFzZXRUYWdGYWN0b3J5XTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRGF0YXNldFRpdGxlRmFjdG9yeShEYXRhc2V0VGFnKSB7XG4gIGNsYXNzIERhdGFzZXRUaXRsZSBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICAgIF9vbkNsaWNrVGl0bGUgPSBlID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMub25UaXRsZUNsaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25UaXRsZUNsaWNrKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnByb3BzLnNob3dEYXRhc2V0VGFibGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zaG93RGF0YXNldFRhYmxlKHRoaXMucHJvcHMuZGF0YXNldC5pZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2hvd0RhdGFzZXRUYWJsZSxcbiAgICAgICAgc2hvd0RlbGV0ZURhdGFzZXQsXG4gICAgICAgIG9uVGl0bGVDbGljayxcbiAgICAgICAgcmVtb3ZlRGF0YXNldCxcbiAgICAgICAgZGF0YXNldFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWREYXRhc2V0VGl0bGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJzb3VyY2UtZGF0YS10aXRsZVwiXG4gICAgICAgICAgY2xpY2thYmxlPXtCb29sZWFuKHNob3dEYXRhc2V0VGFibGUgfHwgb25UaXRsZUNsaWNrKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxEYXRhc2V0VGFnIGRhdGFzZXQ9e2RhdGFzZXR9IG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tUaXRsZX0gLz5cbiAgICAgICAgICB7c2hvd0RhdGFzZXRUYWJsZSA/IChcbiAgICAgICAgICAgIDxDZW50ZXJGbGV4Ym94IGNsYXNzTmFtZT1cInNvdXJjZS1kYXRhLWFycm93XCI+XG4gICAgICAgICAgICAgIDxBcnJvd1JpZ2h0IGhlaWdodD1cIjEycHhcIiAvPlxuICAgICAgICAgICAgPC9DZW50ZXJGbGV4Ym94PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzaG93RGF0YXNldFRhYmxlID8gKFxuICAgICAgICAgICAgPFNob3dEYXRhVGFibGUgaWQ9e2RhdGFzZXQuaWR9IHNob3dEYXRhc2V0VGFibGU9e3Nob3dEYXRhc2V0VGFibGV9IC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3Nob3dEZWxldGVEYXRhc2V0ID8gKFxuICAgICAgICAgICAgPFJlbW92ZURhdGFzZXQgZGF0YXNldEtleT17ZGF0YXNldC5pZH0gcmVtb3ZlRGF0YXNldD17cmVtb3ZlRGF0YXNldH0gLz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9TdHlsZWREYXRhc2V0VGl0bGU+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBEYXRhc2V0VGl0bGU7XG59XG4iXX0=