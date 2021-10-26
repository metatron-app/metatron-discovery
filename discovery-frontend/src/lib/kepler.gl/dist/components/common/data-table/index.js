"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.TableSection = exports.Container = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactVirtualized = require("react-virtualized");

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _classnames3 = _interopRequireDefault(require("classnames"));

var _reselect = require("reselect");

var _lodash = _interopRequireDefault(require("lodash.get"));

var _lodash2 = _interopRequireDefault(require("lodash.debounce"));

var _optionDropdown = _interopRequireDefault(require("./option-dropdown"));

var _grid = _interopRequireDefault(require("./grid"));

var _button = _interopRequireDefault(require("./button"));

var _icons = require("../icons");

var _dataUtils = require("../../../utils/data-utils");

var _cellSize = require("./cell-size");

var _defaultSettings = require("../../../constants/default-settings");

var _fieldToken = _interopRequireDefault(require("../field-token"));

var _fieldToAlignRight;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  font-size: 11px;\n  flex-grow: 1;\n  color: ", ";\n  width: 100%;\n\n  .ReactVirtualized__Grid:focus,\n  .ReactVirtualized__Grid:active {\n    outline: 0;\n  }\n\n  .cell {\n    &::-webkit-scrollbar {\n      display: none;\n    }\n  }\n\n  *:focus {\n    outline: 0;\n  }\n\n  .results-table-wrapper {\n    position: relative;\n    min-height: 100%;\n    max-height: 100%;\n    display: flex;\n    flex-direction: row;\n    flex-grow: 1;\n    overflow: hidden;\n    border-top: none;\n\n    .scroll-in-ui-thread::after {\n      content: '';\n      height: 100%;\n      left: 0;\n      position: absolute;\n      pointer-events: none;\n      top: 0;\n      width: 100%;\n    }\n\n    .grid-row {\n      position: relative;\n      display: flex;\n      flex-direction: row;\n    }\n    .grid-column {\n      display: flex;\n      flex-direction: column;\n      flex: 1 1 auto;\n    }\n    .pinned-grid-container {\n      flex: 0 0 75px;\n      z-index: 10;\n      position: absolute;\n      left: 0;\n      top: 0;\n      border-right: 2px solid ", ";\n    }\n\n    .header-grid {\n      overflow: hidden !important;\n    }\n\n    .body-grid {\n      overflow: overlay !important;\n    }\n\n    .pinned-grid {\n      overflow: overlay !important;\n    }\n\n    .even-row {\n      background-color: ", ";\n    }\n    .odd-row {\n      background-color: ", ";\n    }\n    .cell,\n    .header-cell {\n      width: 100%;\n      height: 100%;\n      display: flex;\n      flex-direction: column;\n      justify-content: center;\n      align-items: flex-start;\n      text-align: center;\n      overflow: hidden;\n\n      .n-sort-idx {\n        font-size: 9px;\n      }\n    }\n    .cell {\n      border-bottom: 1px solid ", ";\n      border-right: 1px solid ", ";\n      white-space: nowrap;\n      overflow: auto;\n      padding: 0 ", "px;\n      font-size: ", "px;\n\n      .result-link {\n        text-decoration: none;\n      }\n    }\n    .cell.end-cell,\n    .header-cell.end-cell {\n      border-right: none;\n      padding-right: ", "px;\n    }\n    .cell.first-cell,\n    .header-cell.first-cell {\n      padding-left: ", "px;\n    }\n    .cell.bottom-cell {\n      border-bottom: none;\n    }\n    .cell.align-right {\n      align-items: flex-end;\n    }\n    .header-cell {\n      border-bottom: 1px solid ", ";\n      border-top: 1px solid ", ";\n      padding-top: ", "px;\n      padding-right: 0;\n      padding-bottom: ", "px;\n      padding-left: ", "px;\n      align-items: center;\n      justify-content: space-between;\n      display: flex;\n      flex-direction: row;\n      background-color: ", ";\n\n      &:hover {\n        .more {\n          color: ", ";\n        }\n      }\n      .n-sort-idx {\n        font-size: 9px;\n      }\n      .details {\n        font-weight: 500;\n        display: flex;\n        flex-direction: column;\n        justify-content: flex-start;\n        height: 100%;\n        overflow: hidden;\n        flex-grow: 1;\n        .col-name {\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n\n          .col-name__left {\n            display: flex;\n            align-items: center;\n            overflow: hidden;\n            svg {\n              margin-left: 6px;\n            }\n          }\n          .col-name__name {\n            overflow: hidden;\n            white-space: nowrap;\n          }\n          .col-name__sort {\n            cursor: pointer;\n          }\n        }\n      }\n\n      .more {\n        color: transparent;\n        margin-left: 5px;\n      }\n    }\n  }\n\n  :focus {\n    outline: none;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var defaultHeaderRowHeight = 55;
var defaultRowHeight = 32;
var overscanColumnCount = 10;
var overscanRowCount = 10;
var fieldToAlignRight = (_fieldToAlignRight = {}, (0, _defineProperty2["default"])(_fieldToAlignRight, _defaultSettings.ALL_FIELD_TYPES.integer, true), (0, _defineProperty2["default"])(_fieldToAlignRight, _defaultSettings.ALL_FIELD_TYPES.real, true), _fieldToAlignRight);

var Container = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.textColorLT;
}, function (props) {
  return props.theme.pinnedGridBorderColor;
}, function (props) {
  return props.theme.evenRowBackground;
}, function (props) {
  return props.theme.oddRowBackground;
}, function (props) {
  return props.theme.cellBorderColor;
}, function (props) {
  return props.theme.cellBorderColor;
}, function (props) {
  return props.theme.cellPaddingSide;
}, function (props) {
  return props.theme.cellFontSize;
}, function (props) {
  return props.theme.cellPaddingSide + props.theme.edgeCellPaddingSide;
}, function (props) {
  return props.theme.cellPaddingSide + props.theme.edgeCellPaddingSide;
}, function (props) {
  return props.theme.headerCellBorderColor;
}, function (props) {
  return props.theme.headerCellBorderColor;
}, function (props) {
  return props.theme.headerPaddingTop;
}, function (props) {
  return props.theme.headerPaddingBottom;
}, function (props) {
  return props.theme.cellPaddingSide;
}, function (props) {
  return props.theme.headerCellBackground;
}, function (props) {
  return props.theme.headerCellIconColor;
});

exports.Container = Container;
var defaultColumnWidth = 200;

var columnWidthFunction = function columnWidthFunction(columns, cellSizeCache, ghost) {
  return function (_ref) {
    var index = _ref.index;
    return (columns[index] || {}).ghost ? ghost : cellSizeCache[columns[index]] || defaultColumnWidth;
  };
};
/*
 * This is an accessor method used to generalize getting a cell from a data row
 */


var getRowCell = function getRowCell(_ref2) {
  var rows = _ref2.rows,
      columns = _ref2.columns,
      column = _ref2.column,
      colMeta = _ref2.colMeta,
      rowIndex = _ref2.rowIndex,
      sortColumn = _ref2.sortColumn,
      sortOrder = _ref2.sortOrder;
  var rowIdx = sortOrder && sortOrder.length ? (0, _lodash["default"])(sortOrder, rowIndex) : rowIndex;
  var type = colMeta[column];
  return (0, _dataUtils.parseFieldValue)((0, _lodash["default"])(rows, [rowIdx, columns.indexOf(column)], 'Err'), type);
};

var TableSection = function TableSection(_ref3) {
  var classList = _ref3.classList,
      isPinned = _ref3.isPinned,
      columns = _ref3.columns,
      headerGridProps = _ref3.headerGridProps,
      fixedWidth = _ref3.fixedWidth,
      _ref3$fixedHeight = _ref3.fixedHeight,
      fixedHeight = _ref3$fixedHeight === void 0 ? undefined : _ref3$fixedHeight,
      onScroll = _ref3.onScroll,
      scrollTop = _ref3.scrollTop,
      dataGridProps = _ref3.dataGridProps,
      columnWidth = _ref3.columnWidth,
      setGridRef = _ref3.setGridRef,
      headerCellRender = _ref3.headerCellRender,
      dataCellRender = _ref3.dataCellRender,
      _ref3$scrollLeft = _ref3.scrollLeft,
      scrollLeft = _ref3$scrollLeft === void 0 ? undefined : _ref3$scrollLeft;
  return /*#__PURE__*/_react["default"].createElement(_reactVirtualized.AutoSizer, null, function (_ref4) {
    var width = _ref4.width,
        height = _ref4.height;
    var gridDimension = {
      columnCount: columns.length,
      columnWidth: columnWidth,
      width: fixedWidth || width
    };
    var dataGridHeight = fixedHeight || height;
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
      className: (0, _classnames3["default"])('scroll-in-ui-thread', classList.header)
    }, /*#__PURE__*/_react["default"].createElement(_grid["default"], (0, _extends2["default"])({
      cellRenderer: headerCellRender
    }, headerGridProps, gridDimension, {
      scrollLeft: scrollLeft
    }))), /*#__PURE__*/_react["default"].createElement("div", {
      className: (0, _classnames3["default"])('scroll-in-ui-thread', classList.rows),
      style: {
        top: headerGridProps.height
      }
    }, /*#__PURE__*/_react["default"].createElement(_grid["default"], (0, _extends2["default"])({
      cellRenderer: dataCellRender
    }, dataGridProps, gridDimension, {
      className: isPinned ? 'pinned-grid' : 'body-grid',
      height: dataGridHeight - headerGridProps.height,
      onScroll: onScroll,
      scrollTop: scrollTop,
      setGridRef: setGridRef
    }))));
  });
};

exports.TableSection = TableSection;
DataTableFactory.deps = [_fieldToken["default"]];

function DataTableFactory(FieldToken) {
  var DataTable = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(DataTable, _Component);

    var _super = _createSuper(DataTable);

    function DataTable() {
      var _this;

      (0, _classCallCheck2["default"])(this, DataTable);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
        cellSizeCache: {},
        moreOptionsColumn: null
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "root", /*#__PURE__*/(0, _react.createRef)());
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "columns", function (props) {
        return props.columns;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "pinnedColumns", function (props) {
        return props.pinnedColumns;
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "unpinnedColumns", (0, _reselect.createSelector)(_this.columns, _this.pinnedColumns, function (columns, pinnedColumns) {
        return !Array.isArray(pinnedColumns) ? columns : columns.filter(function (c) {
          return !pinnedColumns.includes(c);
        });
      }));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "toggleMoreOptions", function (moreOptionsColumn) {
        return _this.setState({
          moreOptionsColumn: _this.state.moreOptionsColumn === moreOptionsColumn ? null : moreOptionsColumn
        });
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getCellSizeCache", function () {
        var _this$props = _this.props,
            propsCache = _this$props.cellSizeCache,
            fixedWidth = _this$props.fixedWidth,
            pinnedColumns = _this$props.pinnedColumns;

        var unpinnedColumns = _this.unpinnedColumns(_this.props);

        var width = fixedWidth ? fixedWidth : _this.root.current ? _this.root.current.clientWidth : 0; // pin column border is 2 pixel vs 1 pixel

        var adjustWidth = pinnedColumns.length ? width - 1 : width;

        var _adjustCellsToContain = (0, _cellSize.adjustCellsToContainer)(adjustWidth, propsCache, pinnedColumns, unpinnedColumns),
            cellSizeCache = _adjustCellsToContain.cellSizeCache,
            ghost = _adjustCellsToContain.ghost;

        return {
          cellSizeCache: cellSizeCache,
          ghost: ghost
        };
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "doScaleCellsToWidth", function () {
        _this.setState(_this.getCellSizeCache());
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "scaleCellsToWidth", (0, _lodash2["default"])(_this.doScaleCellsToWidth, 300));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "renderHeaderCell", function (columns, isPinned, props, toggleMoreOptions, moreOptionsColumn, TokenComponent) {
        // eslint-disable-next-line react/display-name
        return function (cellInfo) {
          var _classnames;

          var columnIndex = cellInfo.columnIndex,
              key = cellInfo.key,
              style = cellInfo.style;
          var colMeta = props.colMeta,
              sortColumn = props.sortColumn,
              _sortTableColumn = props.sortTableColumn,
              unsortColumn = props.unsortColumn,
              _pinTableColumn = props.pinTableColumn,
              _copyTableColumn = props.copyTableColumn,
              dataId = props.dataId;
          var column = columns[columnIndex];
          var isGhost = column.ghost;
          var isSorted = sortColumn[column];
          var firstCell = columnIndex === 0;
          return /*#__PURE__*/_react["default"].createElement("div", {
            className: (0, _classnames3["default"])('header-cell', (_classnames = {}, (0, _defineProperty2["default"])(_classnames, "column-".concat(columnIndex), true), (0, _defineProperty2["default"])(_classnames, 'pinned-header-cell', isPinned), (0, _defineProperty2["default"])(_classnames, 'first-cell', firstCell), _classnames)),
            key: key,
            style: style,
            onClick: function onClick(e) {
              e.shiftKey ? _sortTableColumn(dataId, column) : null;
            },
            onDoubleClick: function onDoubleClick() {
              return _sortTableColumn(dataId, column);
            },
            title: column
          }, isGhost ? /*#__PURE__*/_react["default"].createElement("div", null) : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("section", {
            className: "details"
          }, /*#__PURE__*/_react["default"].createElement("div", {
            className: "col-name"
          }, /*#__PURE__*/_react["default"].createElement("div", {
            className: "col-name__left"
          }, /*#__PURE__*/_react["default"].createElement("div", {
            className: "col-name__name"
          }, column), /*#__PURE__*/_react["default"].createElement(_button["default"], {
            className: "col-name__sort",
            onClick: function onClick() {
              return _sortTableColumn(dataId, column);
            }
          }, isSorted ? isSorted === _defaultSettings.SORT_ORDER.ASCENDING ? /*#__PURE__*/_react["default"].createElement(_icons.ArrowUp, {
            height: "14px"
          }) : /*#__PURE__*/_react["default"].createElement(_icons.ArrowDown, {
            height: "14px"
          }) : null)), /*#__PURE__*/_react["default"].createElement(_button["default"], {
            className: "more",
            onClick: function onClick() {
              return toggleMoreOptions(column);
            }
          }, /*#__PURE__*/_react["default"].createElement(_icons.VertThreeDots, {
            height: "14px"
          }))), /*#__PURE__*/_react["default"].createElement(FieldToken, {
            type: colMeta[column]
          })), /*#__PURE__*/_react["default"].createElement("section", {
            className: "options"
          }, /*#__PURE__*/_react["default"].createElement(_optionDropdown["default"], {
            isOpened: moreOptionsColumn === column,
            type: colMeta[column],
            column: column,
            toggleMoreOptions: toggleMoreOptions,
            sortTableColumn: function sortTableColumn(mode) {
              return _sortTableColumn(dataId, column, mode);
            },
            sortMode: sortColumn && sortColumn[column],
            pinTableColumn: function pinTableColumn() {
              return _pinTableColumn(dataId, column);
            },
            copyTableColumn: function copyTableColumn() {
              return _copyTableColumn(dataId, column);
            },
            isSorted: isSorted,
            isPinned: isPinned,
            unsortColumn: unsortColumn
          }))));
        };
      });
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "renderDataCell", function (columns, isPinned, props) {
        return function (cellInfo) {
          var _classnames2;

          var columnIndex = cellInfo.columnIndex,
              key = cellInfo.key,
              style = cellInfo.style,
              rowIndex = cellInfo.rowIndex;
          var rows = props.rows,
              colMeta = props.colMeta;
          var column = columns[columnIndex];
          var isGhost = column.ghost;
          var rowCell = isGhost ? '' : getRowCell(_objectSpread(_objectSpread({}, props), {}, {
            column: column,
            rowIndex: rowIndex
          }));
          var type = isGhost ? null : colMeta[column];
          var endCell = columnIndex === columns.length - 1;
          var firstCell = columnIndex === 0;
          var bottomCell = rowIndex === rows.length - 1;
          var alignRight = fieldToAlignRight[type];

          var cell = /*#__PURE__*/_react["default"].createElement("div", {
            className: (0, _classnames3["default"])('cell', (_classnames2 = {}, (0, _defineProperty2["default"])(_classnames2, rowIndex % 2 === 0 ? 'even-row' : 'odd-row', true), (0, _defineProperty2["default"])(_classnames2, "row-".concat(rowIndex), true), (0, _defineProperty2["default"])(_classnames2, 'pinned-cell', isPinned), (0, _defineProperty2["default"])(_classnames2, 'first-cell', firstCell), (0, _defineProperty2["default"])(_classnames2, 'end-cell', endCell), (0, _defineProperty2["default"])(_classnames2, 'bottom-cell', bottomCell), (0, _defineProperty2["default"])(_classnames2, 'align-right', alignRight), _classnames2)),
            key: key,
            style: style,
            title: isGhost ? undefined : rowCell
          }, "".concat(rowCell).concat(endCell ? '\n' : '\t'));

          return cell;
        };
      });
      return _this;
    }

    (0, _createClass2["default"])(DataTable, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        window.addEventListener('resize', this.scaleCellsToWidth);
        this.scaleCellsToWidth();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (this.props.cellSizeCache !== prevProps.cellSizeCache || this.props.pinnedColumns !== prevProps.pinnedColumns) {
          this.scaleCellsToWidth();
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        window.removeEventListener('resize', this.scaleCellsToWidth);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props2 = this.props,
            rows = _this$props2.rows,
            pinnedColumns = _this$props2.pinnedColumns,
            _this$props2$theme = _this$props2.theme,
            theme = _this$props2$theme === void 0 ? {} : _this$props2$theme,
            fixedWidth = _this$props2.fixedWidth,
            fixedHeight = _this$props2.fixedHeight;
        var unpinnedColumns = this.unpinnedColumns(this.props);
        var _this$state = this.state,
            cellSizeCache = _this$state.cellSizeCache,
            moreOptionsColumn = _this$state.moreOptionsColumn,
            ghost = _this$state.ghost;
        var unpinnedColumnsGhost = ghost ? [].concat((0, _toConsumableArray2["default"])(unpinnedColumns), [{
          ghost: true
        }]) : unpinnedColumns;
        var pinnedColumnsWidth = pinnedColumns.reduce(function (acc, val) {
          return acc + (0, _lodash["default"])(cellSizeCache, val, 0);
        }, 0);
        var hasPinnedColumns = Boolean(pinnedColumns.length);
        var _theme$headerRowHeigh = theme.headerRowHeight,
            headerRowHeight = _theme$headerRowHeigh === void 0 ? defaultHeaderRowHeight : _theme$headerRowHeigh,
            _theme$rowHeight = theme.rowHeight,
            rowHeight = _theme$rowHeight === void 0 ? defaultRowHeight : _theme$rowHeight;
        var headerGridProps = {
          cellSizeCache: cellSizeCache,
          className: 'header-grid',
          height: headerRowHeight,
          rowCount: 1,
          rowHeight: headerRowHeight
        };
        var dataGridProps = {
          cellSizeCache: cellSizeCache,
          overscanColumnCount: overscanColumnCount,
          overscanRowCount: overscanRowCount,
          rowCount: (rows || []).length,
          rowHeight: rowHeight
        };
        return /*#__PURE__*/_react["default"].createElement(Container, {
          className: "data-table-container",
          ref: this.root
        }, Object.keys(cellSizeCache).length && /*#__PURE__*/_react["default"].createElement(_reactVirtualized.ScrollSync, null, function (_ref5) {
          var _onScroll = _ref5.onScroll,
              scrollLeft = _ref5.scrollLeft,
              scrollTop = _ref5.scrollTop;
          return /*#__PURE__*/_react["default"].createElement("div", {
            className: "results-table-wrapper"
          }, hasPinnedColumns && /*#__PURE__*/_react["default"].createElement("div", {
            key: "pinned-columns",
            className: "pinned-columns grid-row"
          }, /*#__PURE__*/_react["default"].createElement(TableSection, {
            classList: {
              header: 'pinned-columns--header pinned-grid-container',
              rows: 'pinned-columns--rows pinned-grid-container'
            },
            isPinned: true,
            columns: pinnedColumns,
            headerGridProps: headerGridProps,
            fixedWidth: pinnedColumnsWidth,
            onScroll: function onScroll(args) {
              return _onScroll(_objectSpread(_objectSpread({}, args), {}, {
                scrollLeft: scrollLeft
              }));
            },
            scrollTop: scrollTop,
            dataGridProps: dataGridProps,
            setGridRef: function setGridRef(pinnedGrid) {
              return _this2.pinnedGrid = pinnedGrid;
            },
            columnWidth: columnWidthFunction(pinnedColumns, cellSizeCache),
            headerCellRender: _this2.renderHeaderCell(pinnedColumns, true, _this2.props, _this2.toggleMoreOptions, moreOptionsColumn),
            dataCellRender: _this2.renderDataCell(pinnedColumns, true, _this2.props)
          })), /*#__PURE__*/_react["default"].createElement("div", {
            key: "unpinned-columns",
            style: {
              marginLeft: "".concat(hasPinnedColumns ? "".concat(pinnedColumnsWidth, "px") : '0')
            },
            className: "unpinned-columns grid-column"
          }, /*#__PURE__*/_react["default"].createElement(TableSection, {
            classList: {
              header: 'unpinned-columns--header unpinned-grid-container',
              rows: 'unpinned-columns--rows unpinned-grid-container'
            },
            isPinned: false,
            columns: unpinnedColumnsGhost,
            headerGridProps: headerGridProps,
            fixedWidth: fixedWidth,
            fixedHeight: fixedHeight,
            onScroll: _onScroll,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            dataGridProps: dataGridProps,
            setGridRef: function setGridRef(unpinnedGrid) {
              return _this2.unpinnedGrid = unpinnedGrid;
            },
            columnWidth: columnWidthFunction(unpinnedColumnsGhost, cellSizeCache, ghost),
            headerCellRender: _this2.renderHeaderCell(unpinnedColumnsGhost, false, _this2.props, _this2.toggleMoreOptions, moreOptionsColumn),
            dataCellRender: _this2.renderDataCell(unpinnedColumnsGhost, false, _this2.props)
          })));
        }));
      }
    }]);
    return DataTable;
  }(_react.Component);

  (0, _defineProperty2["default"])(DataTable, "defaultProps", {
    rows: [],
    pinnedColumns: [],
    colMeta: {},
    cellSizeCache: {},
    sortColumn: {},
    fixedWidth: null,
    fixedHeight: null,
    theme: {}
  });
  return (0, _styledComponents.withTheme)(DataTable);
}

var _default = DataTableFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9kYXRhLXRhYmxlL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHRIZWFkZXJSb3dIZWlnaHQiLCJkZWZhdWx0Um93SGVpZ2h0Iiwib3ZlcnNjYW5Db2x1bW5Db3VudCIsIm92ZXJzY2FuUm93Q291bnQiLCJmaWVsZFRvQWxpZ25SaWdodCIsIkFMTF9GSUVMRF9UWVBFUyIsImludGVnZXIiLCJyZWFsIiwiQ29udGFpbmVyIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJ0aGVtZSIsInRleHRDb2xvckxUIiwicGlubmVkR3JpZEJvcmRlckNvbG9yIiwiZXZlblJvd0JhY2tncm91bmQiLCJvZGRSb3dCYWNrZ3JvdW5kIiwiY2VsbEJvcmRlckNvbG9yIiwiY2VsbFBhZGRpbmdTaWRlIiwiY2VsbEZvbnRTaXplIiwiZWRnZUNlbGxQYWRkaW5nU2lkZSIsImhlYWRlckNlbGxCb3JkZXJDb2xvciIsImhlYWRlclBhZGRpbmdUb3AiLCJoZWFkZXJQYWRkaW5nQm90dG9tIiwiaGVhZGVyQ2VsbEJhY2tncm91bmQiLCJoZWFkZXJDZWxsSWNvbkNvbG9yIiwiZGVmYXVsdENvbHVtbldpZHRoIiwiY29sdW1uV2lkdGhGdW5jdGlvbiIsImNvbHVtbnMiLCJjZWxsU2l6ZUNhY2hlIiwiZ2hvc3QiLCJpbmRleCIsImdldFJvd0NlbGwiLCJyb3dzIiwiY29sdW1uIiwiY29sTWV0YSIsInJvd0luZGV4Iiwic29ydENvbHVtbiIsInNvcnRPcmRlciIsInJvd0lkeCIsImxlbmd0aCIsInR5cGUiLCJpbmRleE9mIiwiVGFibGVTZWN0aW9uIiwiY2xhc3NMaXN0IiwiaXNQaW5uZWQiLCJoZWFkZXJHcmlkUHJvcHMiLCJmaXhlZFdpZHRoIiwiZml4ZWRIZWlnaHQiLCJ1bmRlZmluZWQiLCJvblNjcm9sbCIsInNjcm9sbFRvcCIsImRhdGFHcmlkUHJvcHMiLCJjb2x1bW5XaWR0aCIsInNldEdyaWRSZWYiLCJoZWFkZXJDZWxsUmVuZGVyIiwiZGF0YUNlbGxSZW5kZXIiLCJzY3JvbGxMZWZ0Iiwid2lkdGgiLCJoZWlnaHQiLCJncmlkRGltZW5zaW9uIiwiY29sdW1uQ291bnQiLCJkYXRhR3JpZEhlaWdodCIsImhlYWRlciIsInRvcCIsIkRhdGFUYWJsZUZhY3RvcnkiLCJkZXBzIiwiRmllbGRUb2tlbkZhY3RvcnkiLCJGaWVsZFRva2VuIiwiRGF0YVRhYmxlIiwibW9yZU9wdGlvbnNDb2x1bW4iLCJwaW5uZWRDb2x1bW5zIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwiYyIsImluY2x1ZGVzIiwic2V0U3RhdGUiLCJzdGF0ZSIsInByb3BzQ2FjaGUiLCJ1bnBpbm5lZENvbHVtbnMiLCJyb290IiwiY3VycmVudCIsImNsaWVudFdpZHRoIiwiYWRqdXN0V2lkdGgiLCJnZXRDZWxsU2l6ZUNhY2hlIiwiZG9TY2FsZUNlbGxzVG9XaWR0aCIsInRvZ2dsZU1vcmVPcHRpb25zIiwiVG9rZW5Db21wb25lbnQiLCJjZWxsSW5mbyIsImNvbHVtbkluZGV4Iiwia2V5Iiwic3R5bGUiLCJzb3J0VGFibGVDb2x1bW4iLCJ1bnNvcnRDb2x1bW4iLCJwaW5UYWJsZUNvbHVtbiIsImNvcHlUYWJsZUNvbHVtbiIsImRhdGFJZCIsImlzR2hvc3QiLCJpc1NvcnRlZCIsImZpcnN0Q2VsbCIsImUiLCJzaGlmdEtleSIsIlNPUlRfT1JERVIiLCJBU0NFTkRJTkciLCJtb2RlIiwicm93Q2VsbCIsImVuZENlbGwiLCJib3R0b21DZWxsIiwiYWxpZ25SaWdodCIsImNlbGwiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic2NhbGVDZWxsc1RvV2lkdGgiLCJwcmV2UHJvcHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidW5waW5uZWRDb2x1bW5zR2hvc3QiLCJwaW5uZWRDb2x1bW5zV2lkdGgiLCJyZWR1Y2UiLCJhY2MiLCJ2YWwiLCJoYXNQaW5uZWRDb2x1bW5zIiwiQm9vbGVhbiIsImhlYWRlclJvd0hlaWdodCIsInJvd0hlaWdodCIsImNsYXNzTmFtZSIsInJvd0NvdW50IiwiT2JqZWN0Iiwia2V5cyIsImFyZ3MiLCJwaW5uZWRHcmlkIiwicmVuZGVySGVhZGVyQ2VsbCIsInJlbmRlckRhdGFDZWxsIiwibWFyZ2luTGVmdCIsInVucGlubmVkR3JpZCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLHNCQUFzQixHQUFHLEVBQS9CO0FBQ0EsSUFBTUMsZ0JBQWdCLEdBQUcsRUFBekI7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxFQUE1QjtBQUNBLElBQU1DLGdCQUFnQixHQUFHLEVBQXpCO0FBQ0EsSUFBTUMsaUJBQWlCLGtGQUNwQkMsaUNBQWdCQyxPQURJLEVBQ00sSUFETix3REFFcEJELGlDQUFnQkUsSUFGSSxFQUVHLElBRkgsc0JBQXZCOztBQUtPLElBQU1DLFNBQVMsR0FBR0MsNkJBQU9DLEdBQVYsb0JBSVgsVUFBQUMsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxXQUFoQjtBQUFBLENBSk0sRUEwRFUsVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxxQkFBaEI7QUFBQSxDQTFEZixFQTBFSSxVQUFBSCxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlHLGlCQUFoQjtBQUFBLENBMUVULEVBNkVJLFVBQUFKLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUksZ0JBQWhCO0FBQUEsQ0E3RVQsRUErRlcsVUFBQUwsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZSyxlQUFoQjtBQUFBLENBL0ZoQixFQWdHVSxVQUFBTixLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxL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VyxFQUFFM0csbUJBQW1CLENBQzlCeUYsb0JBRDhCLEVBRTlCdkYsYUFGOEIsRUFHOUJDLEtBSDhCLENBZmxDO0FBb0JFLFlBQUEsZ0JBQWdCLEVBQUUsTUFBSSxDQUFDcUcsZ0JBQUwsQ0FDaEJmLG9CQURnQixFQUVoQixLQUZnQixFQUdoQixNQUFJLENBQUN6RyxLQUhXLEVBSWhCLE1BQUksQ0FBQzRFLGlCQUpXLEVBS2hCakIsaUJBTGdCLENBcEJwQjtBQTJCRSxZQUFBLGNBQWMsRUFBRSxNQUFJLENBQUM4RCxjQUFMLENBQ2RoQixvQkFEYyxFQUVkLEtBRmMsRUFHZCxNQUFJLENBQUN6RyxLQUhTO0FBM0JsQixZQVBGLENBNUJGLENBREY7QUF3RUQsU0ExRUgsQ0FGSixDQURGO0FBa0ZEO0FBMVRpQztBQUFBO0FBQUEsSUFDWjRILGdCQURZOztBQUFBLG1DQUM5QmxFLFNBRDhCLGtCQUVaO0FBQ3BCcEMsSUFBQUEsSUFBSSxFQUFFLEVBRGM7QUFFcEJzQyxJQUFBQSxhQUFhLEVBQUUsRUFGSztBQUdwQnBDLElBQUFBLE9BQU8sRUFBRSxFQUhXO0FBSXBCTixJQUFBQSxhQUFhLEVBQUUsRUFKSztBQUtwQlEsSUFBQUEsVUFBVSxFQUFFLEVBTFE7QUFNcEJVLElBQUFBLFVBQVUsRUFBRSxJQU5RO0FBT3BCQyxJQUFBQSxXQUFXLEVBQUUsSUFQTztBQVFwQnBDLElBQUFBLEtBQUssRUFBRTtBQVJhLEdBRlk7QUE2VHBDLFNBQU8saUNBQVV5RCxTQUFWLENBQVA7QUFDRDs7ZUFFY0osZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnQsIGNyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtTY3JvbGxTeW5jLCBBdXRvU2l6ZXJ9IGZyb20gJ3JlYWN0LXZpcnR1YWxpemVkJztcbmltcG9ydCBzdHlsZWQsIHt3aXRoVGhlbWV9IGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtjcmVhdGVTZWxlY3Rvcn0gZnJvbSAncmVzZWxlY3QnO1xuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnO1xuXG5pbXBvcnQgT3B0aW9uRHJvcGRvd24gZnJvbSAnLi9vcHRpb24tZHJvcGRvd24nO1xuXG5pbXBvcnQgR3JpZCBmcm9tICcuL2dyaWQnO1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuL2J1dHRvbic7XG5pbXBvcnQge0Fycm93VXAsIEFycm93RG93bn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IHtWZXJ0VGhyZWVEb3RzfSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQge3BhcnNlRmllbGRWYWx1ZX0gZnJvbSAndXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQge2FkanVzdENlbGxzVG9Db250YWluZXJ9IGZyb20gJy4vY2VsbC1zaXplJztcblxuaW1wb3J0IHtBTExfRklFTERfVFlQRVMsIFNPUlRfT1JERVJ9IGZyb20gJ2NvbnN0YW50cy9kZWZhdWx0LXNldHRpbmdzJztcbmltcG9ydCBGaWVsZFRva2VuRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9maWVsZC10b2tlbic7XG5cbmNvbnN0IGRlZmF1bHRIZWFkZXJSb3dIZWlnaHQgPSA1NTtcbmNvbnN0IGRlZmF1bHRSb3dIZWlnaHQgPSAzMjtcbmNvbnN0IG92ZXJzY2FuQ29sdW1uQ291bnQgPSAxMDtcbmNvbnN0IG92ZXJzY2FuUm93Q291bnQgPSAxMDtcbmNvbnN0IGZpZWxkVG9BbGlnblJpZ2h0ID0ge1xuICBbQUxMX0ZJRUxEX1RZUEVTLmludGVnZXJdOiB0cnVlLFxuICBbQUxMX0ZJRUxEX1RZUEVTLnJlYWxdOiB0cnVlXG59O1xuXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZm9udC1zaXplOiAxMXB4O1xuICBmbGV4LWdyb3c6IDE7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckxUfTtcbiAgd2lkdGg6IDEwMCU7XG5cbiAgLlJlYWN0VmlydHVhbGl6ZWRfX0dyaWQ6Zm9jdXMsXG4gIC5SZWFjdFZpcnR1YWxpemVkX19HcmlkOmFjdGl2ZSB7XG4gICAgb3V0bGluZTogMDtcbiAgfVxuXG4gIC5jZWxsIHtcbiAgICAmOjotd2Via2l0LXNjcm9sbGJhciB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgfVxuXG4gICo6Zm9jdXMge1xuICAgIG91dGxpbmU6IDA7XG4gIH1cblxuICAucmVzdWx0cy10YWJsZS13cmFwcGVyIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgbWluLWhlaWdodDogMTAwJTtcbiAgICBtYXgtaGVpZ2h0OiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBmbGV4LWdyb3c6IDE7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBib3JkZXItdG9wOiBub25lO1xuXG4gICAgLnNjcm9sbC1pbi11aS10aHJlYWQ6OmFmdGVyIHtcbiAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgbGVmdDogMDtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgdG9wOiAwO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxuXG4gICAgLmdyaWQtcm93IHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIH1cbiAgICAuZ3JpZC1jb2x1bW4ge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICBmbGV4OiAxIDEgYXV0bztcbiAgICB9XG4gICAgLnBpbm5lZC1ncmlkLWNvbnRhaW5lciB7XG4gICAgICBmbGV4OiAwIDAgNzVweDtcbiAgICAgIHotaW5kZXg6IDEwO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgbGVmdDogMDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGJvcmRlci1yaWdodDogMnB4IHNvbGlkICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGlubmVkR3JpZEJvcmRlckNvbG9yfTtcbiAgICB9XG5cbiAgICAuaGVhZGVyLWdyaWQge1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgIC5ib2R5LWdyaWQge1xuICAgICAgb3ZlcmZsb3c6IG92ZXJsYXkgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAucGlubmVkLWdyaWQge1xuICAgICAgb3ZlcmZsb3c6IG92ZXJsYXkgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAuZXZlbi1yb3cge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5ldmVuUm93QmFja2dyb3VuZH07XG4gICAgfVxuICAgIC5vZGQtcm93IHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUub2RkUm93QmFja2dyb3VuZH07XG4gICAgfVxuICAgIC5jZWxsLFxuICAgIC5oZWFkZXItY2VsbCB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG5cbiAgICAgIC5uLXNvcnQtaWR4IHtcbiAgICAgICAgZm9udC1zaXplOiA5cHg7XG4gICAgICB9XG4gICAgfVxuICAgIC5jZWxsIHtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAke3Byb3BzID0+IHByb3BzLnRoZW1lLmNlbGxCb3JkZXJDb2xvcn07XG4gICAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAke3Byb3BzID0+IHByb3BzLnRoZW1lLmNlbGxCb3JkZXJDb2xvcn07XG4gICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICBwYWRkaW5nOiAwICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuY2VsbFBhZGRpbmdTaWRlfXB4O1xuICAgICAgZm9udC1zaXplOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmNlbGxGb250U2l6ZX1weDtcblxuICAgICAgLnJlc3VsdC1saW5rIHtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgfVxuICAgIH1cbiAgICAuY2VsbC5lbmQtY2VsbCxcbiAgICAuaGVhZGVyLWNlbGwuZW5kLWNlbGwge1xuICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xuICAgICAgcGFkZGluZy1yaWdodDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5jZWxsUGFkZGluZ1NpZGUgKyBwcm9wcy50aGVtZS5lZGdlQ2VsbFBhZGRpbmdTaWRlfXB4O1xuICAgIH1cbiAgICAuY2VsbC5maXJzdC1jZWxsLFxuICAgIC5oZWFkZXItY2VsbC5maXJzdC1jZWxsIHtcbiAgICAgIHBhZGRpbmctbGVmdDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5jZWxsUGFkZGluZ1NpZGUgKyBwcm9wcy50aGVtZS5lZGdlQ2VsbFBhZGRpbmdTaWRlfXB4O1xuICAgIH1cbiAgICAuY2VsbC5ib3R0b20tY2VsbCB7XG4gICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgIH1cbiAgICAuY2VsbC5hbGlnbi1yaWdodCB7XG4gICAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gICAgfVxuICAgIC5oZWFkZXItY2VsbCB7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5oZWFkZXJDZWxsQm9yZGVyQ29sb3J9O1xuICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaGVhZGVyQ2VsbEJvcmRlckNvbG9yfTtcbiAgICAgIHBhZGRpbmctdG9wOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmhlYWRlclBhZGRpbmdUb3B9cHg7XG4gICAgICBwYWRkaW5nLXJpZ2h0OiAwO1xuICAgICAgcGFkZGluZy1ib3R0b206ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaGVhZGVyUGFkZGluZ0JvdHRvbX1weDtcbiAgICAgIHBhZGRpbmctbGVmdDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5jZWxsUGFkZGluZ1NpZGV9cHg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmhlYWRlckNlbGxCYWNrZ3JvdW5kfTtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIC5tb3JlIHtcbiAgICAgICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5oZWFkZXJDZWxsSWNvbkNvbG9yfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLm4tc29ydC1pZHgge1xuICAgICAgICBmb250LXNpemU6IDlweDtcbiAgICAgIH1cbiAgICAgIC5kZXRhaWxzIHtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgIGZsZXgtZ3JvdzogMTtcbiAgICAgICAgLmNvbC1uYW1lIHtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuXG4gICAgICAgICAgLmNvbC1uYW1lX19sZWZ0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgICAgIHN2ZyB7XG4gICAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiA2cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC5jb2wtbmFtZV9fbmFtZSB7XG4gICAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLmNvbC1uYW1lX19zb3J0IHtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLm1vcmUge1xuICAgICAgICBjb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiA1cHg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lO1xuICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0Q29sdW1uV2lkdGggPSAyMDA7XG5cbmNvbnN0IGNvbHVtbldpZHRoRnVuY3Rpb24gPSAoY29sdW1ucywgY2VsbFNpemVDYWNoZSwgZ2hvc3QpID0+ICh7aW5kZXh9KSA9PiB7XG4gIHJldHVybiAoY29sdW1uc1tpbmRleF0gfHwge30pLmdob3N0ID8gZ2hvc3QgOiBjZWxsU2l6ZUNhY2hlW2NvbHVtbnNbaW5kZXhdXSB8fCBkZWZhdWx0Q29sdW1uV2lkdGg7XG59O1xuXG4vKlxuICogVGhpcyBpcyBhbiBhY2Nlc3NvciBtZXRob2QgdXNlZCB0byBnZW5lcmFsaXplIGdldHRpbmcgYSBjZWxsIGZyb20gYSBkYXRhIHJvd1xuICovXG5jb25zdCBnZXRSb3dDZWxsID0gKHtyb3dzLCBjb2x1bW5zLCBjb2x1bW4sIGNvbE1ldGEsIHJvd0luZGV4LCBzb3J0Q29sdW1uLCBzb3J0T3JkZXJ9KSA9PiB7XG4gIGNvbnN0IHJvd0lkeCA9IHNvcnRPcmRlciAmJiBzb3J0T3JkZXIubGVuZ3RoID8gZ2V0KHNvcnRPcmRlciwgcm93SW5kZXgpIDogcm93SW5kZXg7XG4gIGNvbnN0IHR5cGUgPSBjb2xNZXRhW2NvbHVtbl07XG5cbiAgcmV0dXJuIHBhcnNlRmllbGRWYWx1ZShnZXQocm93cywgW3Jvd0lkeCwgY29sdW1ucy5pbmRleE9mKGNvbHVtbildLCAnRXJyJyksIHR5cGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IFRhYmxlU2VjdGlvbiA9ICh7XG4gIGNsYXNzTGlzdCxcbiAgaXNQaW5uZWQsXG4gIGNvbHVtbnMsXG4gIGhlYWRlckdyaWRQcm9wcyxcbiAgZml4ZWRXaWR0aCxcbiAgZml4ZWRIZWlnaHQgPSB1bmRlZmluZWQsXG4gIG9uU2Nyb2xsLFxuICBzY3JvbGxUb3AsXG4gIGRhdGFHcmlkUHJvcHMsXG4gIGNvbHVtbldpZHRoLFxuICBzZXRHcmlkUmVmLFxuICBoZWFkZXJDZWxsUmVuZGVyLFxuICBkYXRhQ2VsbFJlbmRlcixcbiAgc2Nyb2xsTGVmdCA9IHVuZGVmaW5lZFxufSkgPT4gKFxuICA8QXV0b1NpemVyPlxuICAgIHsoe3dpZHRoLCBoZWlnaHR9KSA9PiB7XG4gICAgICBjb25zdCBncmlkRGltZW5zaW9uID0ge1xuICAgICAgICBjb2x1bW5Db3VudDogY29sdW1ucy5sZW5ndGgsXG4gICAgICAgIGNvbHVtbldpZHRoLFxuICAgICAgICB3aWR0aDogZml4ZWRXaWR0aCB8fCB3aWR0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGRhdGFHcmlkSGVpZ2h0ID0gZml4ZWRIZWlnaHQgfHwgaGVpZ2h0O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnc2Nyb2xsLWluLXVpLXRocmVhZCcsIGNsYXNzTGlzdC5oZWFkZXIpfT5cbiAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgIGNlbGxSZW5kZXJlcj17aGVhZGVyQ2VsbFJlbmRlcn1cbiAgICAgICAgICAgICAgey4uLmhlYWRlckdyaWRQcm9wc31cbiAgICAgICAgICAgICAgey4uLmdyaWREaW1lbnNpb259XG4gICAgICAgICAgICAgIHNjcm9sbExlZnQ9e3Njcm9sbExlZnR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnc2Nyb2xsLWluLXVpLXRocmVhZCcsIGNsYXNzTGlzdC5yb3dzKX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHRvcDogaGVhZGVyR3JpZFByb3BzLmhlaWdodFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICBjZWxsUmVuZGVyZXI9e2RhdGFDZWxsUmVuZGVyfVxuICAgICAgICAgICAgICB7Li4uZGF0YUdyaWRQcm9wc31cbiAgICAgICAgICAgICAgey4uLmdyaWREaW1lbnNpb259XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17aXNQaW5uZWQgPyAncGlubmVkLWdyaWQnIDogJ2JvZHktZ3JpZCd9XG4gICAgICAgICAgICAgIGhlaWdodD17ZGF0YUdyaWRIZWlnaHQgLSBoZWFkZXJHcmlkUHJvcHMuaGVpZ2h0fVxuICAgICAgICAgICAgICBvblNjcm9sbD17b25TY3JvbGx9XG4gICAgICAgICAgICAgIHNjcm9sbFRvcD17c2Nyb2xsVG9wfVxuICAgICAgICAgICAgICBzZXRHcmlkUmVmPXtzZXRHcmlkUmVmfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApO1xuICAgIH19XG4gIDwvQXV0b1NpemVyPlxuKTtcbkRhdGFUYWJsZUZhY3RvcnkuZGVwcyA9IFtGaWVsZFRva2VuRmFjdG9yeV07XG5mdW5jdGlvbiBEYXRhVGFibGVGYWN0b3J5KEZpZWxkVG9rZW4pIHtcbiAgY2xhc3MgRGF0YVRhYmxlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgcm93czogW10sXG4gICAgICBwaW5uZWRDb2x1bW5zOiBbXSxcbiAgICAgIGNvbE1ldGE6IHt9LFxuICAgICAgY2VsbFNpemVDYWNoZToge30sXG4gICAgICBzb3J0Q29sdW1uOiB7fSxcbiAgICAgIGZpeGVkV2lkdGg6IG51bGwsXG4gICAgICBmaXhlZEhlaWdodDogbnVsbCxcbiAgICAgIHRoZW1lOiB7fVxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgIGNlbGxTaXplQ2FjaGU6IHt9LFxuICAgICAgbW9yZU9wdGlvbnNDb2x1bW46IG51bGxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5zY2FsZUNlbGxzVG9XaWR0aCk7XG4gICAgICB0aGlzLnNjYWxlQ2VsbHNUb1dpZHRoKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnByb3BzLmNlbGxTaXplQ2FjaGUgIT09IHByZXZQcm9wcy5jZWxsU2l6ZUNhY2hlIHx8XG4gICAgICAgIHRoaXMucHJvcHMucGlubmVkQ29sdW1ucyAhPT0gcHJldlByb3BzLnBpbm5lZENvbHVtbnNcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNjYWxlQ2VsbHNUb1dpZHRoKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5zY2FsZUNlbGxzVG9XaWR0aCk7XG4gICAgfVxuICAgIHJvb3QgPSBjcmVhdGVSZWYoKTtcbiAgICBjb2x1bW5zID0gcHJvcHMgPT4gcHJvcHMuY29sdW1ucztcbiAgICBwaW5uZWRDb2x1bW5zID0gcHJvcHMgPT4gcHJvcHMucGlubmVkQ29sdW1ucztcbiAgICB1bnBpbm5lZENvbHVtbnMgPSBjcmVhdGVTZWxlY3Rvcih0aGlzLmNvbHVtbnMsIHRoaXMucGlubmVkQ29sdW1ucywgKGNvbHVtbnMsIHBpbm5lZENvbHVtbnMpID0+XG4gICAgICAhQXJyYXkuaXNBcnJheShwaW5uZWRDb2x1bW5zKSA/IGNvbHVtbnMgOiBjb2x1bW5zLmZpbHRlcihjID0+ICFwaW5uZWRDb2x1bW5zLmluY2x1ZGVzKGMpKVxuICAgICk7XG5cbiAgICB0b2dnbGVNb3JlT3B0aW9ucyA9IG1vcmVPcHRpb25zQ29sdW1uID0+XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9yZU9wdGlvbnNDb2x1bW46XG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb3JlT3B0aW9uc0NvbHVtbiA9PT0gbW9yZU9wdGlvbnNDb2x1bW4gPyBudWxsIDogbW9yZU9wdGlvbnNDb2x1bW5cbiAgICAgIH0pO1xuXG4gICAgZ2V0Q2VsbFNpemVDYWNoZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHtjZWxsU2l6ZUNhY2hlOiBwcm9wc0NhY2hlLCBmaXhlZFdpZHRoLCBwaW5uZWRDb2x1bW5zfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB1bnBpbm5lZENvbHVtbnMgPSB0aGlzLnVucGlubmVkQ29sdW1ucyh0aGlzLnByb3BzKTtcblxuICAgICAgY29uc3Qgd2lkdGggPSBmaXhlZFdpZHRoID8gZml4ZWRXaWR0aCA6IHRoaXMucm9vdC5jdXJyZW50ID8gdGhpcy5yb290LmN1cnJlbnQuY2xpZW50V2lkdGggOiAwO1xuXG4gICAgICAvLyBwaW4gY29sdW1uIGJvcmRlciBpcyAyIHBpeGVsIHZzIDEgcGl4ZWxcbiAgICAgIGNvbnN0IGFkanVzdFdpZHRoID0gcGlubmVkQ29sdW1ucy5sZW5ndGggPyB3aWR0aCAtIDEgOiB3aWR0aDtcbiAgICAgIGNvbnN0IHtjZWxsU2l6ZUNhY2hlLCBnaG9zdH0gPSBhZGp1c3RDZWxsc1RvQ29udGFpbmVyKFxuICAgICAgICBhZGp1c3RXaWR0aCxcbiAgICAgICAgcHJvcHNDYWNoZSxcbiAgICAgICAgcGlubmVkQ29sdW1ucyxcbiAgICAgICAgdW5waW5uZWRDb2x1bW5zXG4gICAgICApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2VsbFNpemVDYWNoZSxcbiAgICAgICAgZ2hvc3RcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGRvU2NhbGVDZWxsc1RvV2lkdGggPSAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0Q2VsbFNpemVDYWNoZSgpKTtcbiAgICB9O1xuXG4gICAgc2NhbGVDZWxsc1RvV2lkdGggPSBkZWJvdW5jZSh0aGlzLmRvU2NhbGVDZWxsc1RvV2lkdGgsIDMwMCk7XG5cbiAgICByZW5kZXJIZWFkZXJDZWxsID0gKFxuICAgICAgY29sdW1ucyxcbiAgICAgIGlzUGlubmVkLFxuICAgICAgcHJvcHMsXG4gICAgICB0b2dnbGVNb3JlT3B0aW9ucyxcbiAgICAgIG1vcmVPcHRpb25zQ29sdW1uLFxuICAgICAgVG9rZW5Db21wb25lbnRcbiAgICApID0+IHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC9kaXNwbGF5LW5hbWVcbiAgICAgIHJldHVybiBjZWxsSW5mbyA9PiB7XG4gICAgICAgIGNvbnN0IHtjb2x1bW5JbmRleCwga2V5LCBzdHlsZX0gPSBjZWxsSW5mbztcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGNvbE1ldGEsXG4gICAgICAgICAgc29ydENvbHVtbixcbiAgICAgICAgICBzb3J0VGFibGVDb2x1bW4sXG4gICAgICAgICAgdW5zb3J0Q29sdW1uLFxuICAgICAgICAgIHBpblRhYmxlQ29sdW1uLFxuICAgICAgICAgIGNvcHlUYWJsZUNvbHVtbixcbiAgICAgICAgICBkYXRhSWRcbiAgICAgICAgfSA9IHByb3BzO1xuXG4gICAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnNbY29sdW1uSW5kZXhdO1xuICAgICAgICBjb25zdCBpc0dob3N0ID0gY29sdW1uLmdob3N0O1xuICAgICAgICBjb25zdCBpc1NvcnRlZCA9IHNvcnRDb2x1bW5bY29sdW1uXTtcbiAgICAgICAgY29uc3QgZmlyc3RDZWxsID0gY29sdW1uSW5kZXggPT09IDA7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKCdoZWFkZXItY2VsbCcsIHtcbiAgICAgICAgICAgICAgW2Bjb2x1bW4tJHtjb2x1bW5JbmRleH1gXTogdHJ1ZSxcbiAgICAgICAgICAgICAgJ3Bpbm5lZC1oZWFkZXItY2VsbCc6IGlzUGlubmVkLFxuICAgICAgICAgICAgICAnZmlyc3QtY2VsbCc6IGZpcnN0Q2VsbFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgIHN0eWxlPXtzdHlsZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e2UgPT4ge1xuICAgICAgICAgICAgICBlLnNoaWZ0S2V5ID8gc29ydFRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKSA6IG51bGw7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KCkgPT4gc29ydFRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKX1cbiAgICAgICAgICAgIHRpdGxlPXtjb2x1bW59XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2lzR2hvc3QgPyAoXG4gICAgICAgICAgICAgIDxkaXYgLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1uYW1lX19sZWZ0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbmFtZV9fbmFtZVwiPntjb2x1bW59PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sLW5hbWVfX3NvcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc29ydFRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7aXNTb3J0ZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzU29ydGVkID09PSBTT1JUX09SREVSLkFTQ0VORElORyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dVcCBoZWlnaHQ9XCIxNHB4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dEb3duIGhlaWdodD1cIjE0cHhcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwibW9yZVwiIG9uQ2xpY2s9eygpID0+IHRvZ2dsZU1vcmVPcHRpb25zKGNvbHVtbil9PlxuICAgICAgICAgICAgICAgICAgICAgIDxWZXJ0VGhyZWVEb3RzIGhlaWdodD1cIjE0cHhcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICA8RmllbGRUb2tlbiB0eXBlPXtjb2xNZXRhW2NvbHVtbl19IC8+XG4gICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwib3B0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgPE9wdGlvbkRyb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgIGlzT3BlbmVkPXttb3JlT3B0aW9uc0NvbHVtbiA9PT0gY29sdW1ufVxuICAgICAgICAgICAgICAgICAgICB0eXBlPXtjb2xNZXRhW2NvbHVtbl19XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbj17Y29sdW1ufVxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVNb3JlT3B0aW9ucz17dG9nZ2xlTW9yZU9wdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgIHNvcnRUYWJsZUNvbHVtbj17bW9kZSA9PiBzb3J0VGFibGVDb2x1bW4oZGF0YUlkLCBjb2x1bW4sIG1vZGUpfVxuICAgICAgICAgICAgICAgICAgICBzb3J0TW9kZT17c29ydENvbHVtbiAmJiBzb3J0Q29sdW1uW2NvbHVtbl19XG4gICAgICAgICAgICAgICAgICAgIHBpblRhYmxlQ29sdW1uPXsoKSA9PiBwaW5UYWJsZUNvbHVtbihkYXRhSWQsIGNvbHVtbil9XG4gICAgICAgICAgICAgICAgICAgIGNvcHlUYWJsZUNvbHVtbj17KCkgPT4gY29weVRhYmxlQ29sdW1uKGRhdGFJZCwgY29sdW1uKX1cbiAgICAgICAgICAgICAgICAgICAgaXNTb3J0ZWQ9e2lzU29ydGVkfVxuICAgICAgICAgICAgICAgICAgICBpc1Bpbm5lZD17aXNQaW5uZWR9XG4gICAgICAgICAgICAgICAgICAgIHVuc29ydENvbHVtbj17dW5zb3J0Q29sdW1ufVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIHJlbmRlckRhdGFDZWxsID0gKGNvbHVtbnMsIGlzUGlubmVkLCBwcm9wcykgPT4ge1xuICAgICAgcmV0dXJuIGNlbGxJbmZvID0+IHtcbiAgICAgICAgY29uc3Qge2NvbHVtbkluZGV4LCBrZXksIHN0eWxlLCByb3dJbmRleH0gPSBjZWxsSW5mbztcbiAgICAgICAgY29uc3Qge3Jvd3MsIGNvbE1ldGF9ID0gcHJvcHM7XG4gICAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnNbY29sdW1uSW5kZXhdO1xuICAgICAgICBjb25zdCBpc0dob3N0ID0gY29sdW1uLmdob3N0O1xuXG4gICAgICAgIGNvbnN0IHJvd0NlbGwgPSBpc0dob3N0ID8gJycgOiBnZXRSb3dDZWxsKHsuLi5wcm9wcywgY29sdW1uLCByb3dJbmRleH0pO1xuICAgICAgICBjb25zdCB0eXBlID0gaXNHaG9zdCA/IG51bGwgOiBjb2xNZXRhW2NvbHVtbl07XG5cbiAgICAgICAgY29uc3QgZW5kQ2VsbCA9IGNvbHVtbkluZGV4ID09PSBjb2x1bW5zLmxlbmd0aCAtIDE7XG4gICAgICAgIGNvbnN0IGZpcnN0Q2VsbCA9IGNvbHVtbkluZGV4ID09PSAwO1xuICAgICAgICBjb25zdCBib3R0b21DZWxsID0gcm93SW5kZXggPT09IHJvd3MubGVuZ3RoIC0gMTtcbiAgICAgICAgY29uc3QgYWxpZ25SaWdodCA9IGZpZWxkVG9BbGlnblJpZ2h0W3R5cGVdO1xuXG4gICAgICAgIGNvbnN0IGNlbGwgPSAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKCdjZWxsJywge1xuICAgICAgICAgICAgICBbcm93SW5kZXggJSAyID09PSAwID8gJ2V2ZW4tcm93JyA6ICdvZGQtcm93J106IHRydWUsXG4gICAgICAgICAgICAgIFtgcm93LSR7cm93SW5kZXh9YF06IHRydWUsXG4gICAgICAgICAgICAgICdwaW5uZWQtY2VsbCc6IGlzUGlubmVkLFxuICAgICAgICAgICAgICAnZmlyc3QtY2VsbCc6IGZpcnN0Q2VsbCxcbiAgICAgICAgICAgICAgJ2VuZC1jZWxsJzogZW5kQ2VsbCxcbiAgICAgICAgICAgICAgJ2JvdHRvbS1jZWxsJzogYm90dG9tQ2VsbCxcbiAgICAgICAgICAgICAgJ2FsaWduLXJpZ2h0JzogYWxpZ25SaWdodFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgIHN0eWxlPXtzdHlsZX1cbiAgICAgICAgICAgIHRpdGxlPXtpc0dob3N0ID8gdW5kZWZpbmVkIDogcm93Q2VsbH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YCR7cm93Q2VsbH0ke2VuZENlbGwgPyAnXFxuJyA6ICdcXHQnfWB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGNlbGw7XG4gICAgICB9O1xuICAgIH07XG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge3Jvd3MsIHBpbm5lZENvbHVtbnMsIHRoZW1lID0ge30sIGZpeGVkV2lkdGgsIGZpeGVkSGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB1bnBpbm5lZENvbHVtbnMgPSB0aGlzLnVucGlubmVkQ29sdW1ucyh0aGlzLnByb3BzKTtcblxuICAgICAgY29uc3Qge2NlbGxTaXplQ2FjaGUsIG1vcmVPcHRpb25zQ29sdW1uLCBnaG9zdH0gPSB0aGlzLnN0YXRlO1xuICAgICAgY29uc3QgdW5waW5uZWRDb2x1bW5zR2hvc3QgPSBnaG9zdCA/IFsuLi51bnBpbm5lZENvbHVtbnMsIHtnaG9zdDogdHJ1ZX1dIDogdW5waW5uZWRDb2x1bW5zO1xuICAgICAgY29uc3QgcGlubmVkQ29sdW1uc1dpZHRoID0gcGlubmVkQ29sdW1ucy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIHZhbCkgPT4gYWNjICsgZ2V0KGNlbGxTaXplQ2FjaGUsIHZhbCwgMCksXG4gICAgICAgIDBcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGhhc1Bpbm5lZENvbHVtbnMgPSBCb29sZWFuKHBpbm5lZENvbHVtbnMubGVuZ3RoKTtcbiAgICAgIGNvbnN0IHtoZWFkZXJSb3dIZWlnaHQgPSBkZWZhdWx0SGVhZGVyUm93SGVpZ2h0LCByb3dIZWlnaHQgPSBkZWZhdWx0Um93SGVpZ2h0fSA9IHRoZW1lO1xuXG4gICAgICBjb25zdCBoZWFkZXJHcmlkUHJvcHMgPSB7XG4gICAgICAgIGNlbGxTaXplQ2FjaGUsXG4gICAgICAgIGNsYXNzTmFtZTogJ2hlYWRlci1ncmlkJyxcbiAgICAgICAgaGVpZ2h0OiBoZWFkZXJSb3dIZWlnaHQsXG4gICAgICAgIHJvd0NvdW50OiAxLFxuICAgICAgICByb3dIZWlnaHQ6IGhlYWRlclJvd0hlaWdodFxuICAgICAgfTtcblxuICAgICAgY29uc3QgZGF0YUdyaWRQcm9wcyA9IHtcbiAgICAgICAgY2VsbFNpemVDYWNoZSxcbiAgICAgICAgb3ZlcnNjYW5Db2x1bW5Db3VudCxcbiAgICAgICAgb3ZlcnNjYW5Sb3dDb3VudCxcbiAgICAgICAgcm93Q291bnQ6IChyb3dzIHx8IFtdKS5sZW5ndGgsXG4gICAgICAgIHJvd0hlaWdodFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPENvbnRhaW5lciBjbGFzc05hbWU9XCJkYXRhLXRhYmxlLWNvbnRhaW5lclwiIHJlZj17dGhpcy5yb290fT5cbiAgICAgICAgICB7T2JqZWN0LmtleXMoY2VsbFNpemVDYWNoZSkubGVuZ3RoICYmIChcbiAgICAgICAgICAgIDxTY3JvbGxTeW5jPlxuICAgICAgICAgICAgICB7KHtvblNjcm9sbCwgc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wfSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlc3VsdHMtdGFibGUtd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICB7aGFzUGlubmVkQ29sdW1ucyAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9XCJwaW5uZWQtY29sdW1uc1wiIGNsYXNzTmFtZT1cInBpbm5lZC1jb2x1bW5zIGdyaWQtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVTZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGlzdD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcjogJ3Bpbm5lZC1jb2x1bW5zLS1oZWFkZXIgcGlubmVkLWdyaWQtY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzOiAncGlubmVkLWNvbHVtbnMtLXJvd3MgcGlubmVkLWdyaWQtY29udGFpbmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Bpbm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtwaW5uZWRDb2x1bW5zfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJHcmlkUHJvcHM9e2hlYWRlckdyaWRQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17cGlubmVkQ29sdW1uc1dpZHRofVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbD17YXJncyA9PiBvblNjcm9sbCh7Li4uYXJncywgc2Nyb2xsTGVmdH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A9e3Njcm9sbFRvcH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUdyaWRQcm9wcz17ZGF0YUdyaWRQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0R3JpZFJlZj17cGlubmVkR3JpZCA9PiAodGhpcy5waW5uZWRHcmlkID0gcGlubmVkR3JpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoPXtjb2x1bW5XaWR0aEZ1bmN0aW9uKHBpbm5lZENvbHVtbnMsIGNlbGxTaXplQ2FjaGUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJDZWxsUmVuZGVyPXt0aGlzLnJlbmRlckhlYWRlckNlbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlubmVkQ29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVNb3JlT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3JlT3B0aW9uc0NvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhQ2VsbFJlbmRlcj17dGhpcy5yZW5kZXJEYXRhQ2VsbChwaW5uZWRDb2x1bW5zLCB0cnVlLCB0aGlzLnByb3BzKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJ1bnBpbm5lZC1jb2x1bW5zXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogYCR7aGFzUGlubmVkQ29sdW1ucyA/IGAke3Bpbm5lZENvbHVtbnNXaWR0aH1weGAgOiAnMCd9YFxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidW5waW5uZWQtY29sdW1ucyBncmlkLWNvbHVtblwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8VGFibGVTZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0xpc3Q9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiAndW5waW5uZWQtY29sdW1ucy0taGVhZGVyIHVucGlubmVkLWdyaWQtY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm93czogJ3VucGlubmVkLWNvbHVtbnMtLXJvd3MgdW5waW5uZWQtZ3JpZC1jb250YWluZXInXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNQaW5uZWQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17dW5waW5uZWRDb2x1bW5zR2hvc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJHcmlkUHJvcHM9e2hlYWRlckdyaWRQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e2ZpeGVkV2lkdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXhlZEhlaWdodD17Zml4ZWRIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbD17b25TY3JvbGx9XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A9e3Njcm9sbFRvcH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbExlZnQ9e3Njcm9sbExlZnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhR3JpZFByb3BzPXtkYXRhR3JpZFByb3BzfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0R3JpZFJlZj17dW5waW5uZWRHcmlkID0+ICh0aGlzLnVucGlubmVkR3JpZCA9IHVucGlubmVkR3JpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5XaWR0aD17Y29sdW1uV2lkdGhGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdW5waW5uZWRDb2x1bW5zR2hvc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxTaXplQ2FjaGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGdob3N0XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcj17dGhpcy5yZW5kZXJIZWFkZXJDZWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1bnBpbm5lZENvbHVtbnNHaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTW9yZU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVPcHRpb25zQ29sdW1uXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUNlbGxSZW5kZXI9e3RoaXMucmVuZGVyRGF0YUNlbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVucGlubmVkQ29sdW1uc0dob3N0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA8L1Njcm9sbFN5bmM+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9Db250YWluZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3aXRoVGhlbWUoRGF0YVRhYmxlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YVRhYmxlRmFjdG9yeTtcbiJdfQ==