"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _timeRangeFilter = _interopRequireDefault(require("../time-range-filter"));

var _icons = require("../../common/icons");

var _sourceDataSelector = _interopRequireDefault(require("../../side-panel/common/source-data-selector"));

var _filterPanelWithFieldSelect = _interopRequireDefault(require("./filter-panel-with-field-select"));

// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
TimeRangeFilterPanelFactory.deps = [_filterPanelWithFieldSelect["default"], _timeRangeFilter["default"], _sourceDataSelector["default"]];

function TimeRangeFilterPanelFactory(FieldPanelWithFieldSelect, TimeRangeFilter) {
  var TimeRangeFilterPanel = /*#__PURE__*/_react["default"].memo(function (_ref) {
    var idx = _ref.idx,
        datasets = _ref.datasets,
        allAvailableFields = _ref.allAvailableFields,
        filter = _ref.filter,
        isAnyFilterAnimating = _ref.isAnyFilterAnimating,
        enlargeFilter = _ref.enlargeFilter,
        setFilter = _ref.setFilter,
        removeFilter = _ref.removeFilter,
        toggleAnimation = _ref.toggleAnimation;
    var onSetFilter = (0, _react.useCallback)(function (value) {
      return setFilter(idx, 'value', value);
    }, [idx, setFilter]);
    var panelActions = (0, _react.useMemo)(function () {
      return [{
        id: filter.id,
        onClick: enlargeFilter,
        tooltip: 'tooltip.timePlayback',
        iconComponent: _icons.Clock,
        active: filter.enlarged
      }];
    }, [filter.id, filter.enlarged, enlargeFilter]);
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(FieldPanelWithFieldSelect, {
      allAvailableFields: allAvailableFields,
      datasets: datasets,
      filter: filter,
      idx: idx,
      removeFilter: removeFilter,
      setFilter: setFilter,
      panelActions: panelActions
    }, filter.type && !filter.enlarged && /*#__PURE__*/_react["default"].createElement("div", {
      className: "filter-panel__filter"
    }, /*#__PURE__*/_react["default"].createElement(TimeRangeFilter, {
      filter: filter,
      idx: idx,
      isAnyFilterAnimating: isAnyFilterAnimating,
      toggleAnimation: toggleAnimation,
      setFilter: onSetFilter
    }))));
  });

  TimeRangeFilterPanel.displayName = 'TimeRangeFilterPanel';
  return TimeRangeFilterPanel;
}

var _default = TimeRangeFilterPanelFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlcnMvZmlsdGVyLXBhbmVscy90aW1lLXJhbmdlLWZpbHRlci1wYW5lbC5qcyJdLCJuYW1lcyI6WyJUaW1lUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnkiLCJkZXBzIiwiRmllbGRQYW5lbFdpdGhGaWVsZFNlbGVjdEZhY3RvcnkiLCJUaW1lUmFuZ2VGaWx0ZXJGYWN0b3J5IiwiU291cmNlRGF0YVNlbGVjdG9yRmFjdG9yeSIsIkZpZWxkUGFuZWxXaXRoRmllbGRTZWxlY3QiLCJUaW1lUmFuZ2VGaWx0ZXIiLCJUaW1lUmFuZ2VGaWx0ZXJQYW5lbCIsIlJlYWN0IiwibWVtbyIsImlkeCIsImRhdGFzZXRzIiwiYWxsQXZhaWxhYmxlRmllbGRzIiwiZmlsdGVyIiwiaXNBbnlGaWx0ZXJBbmltYXRpbmciLCJlbmxhcmdlRmlsdGVyIiwic2V0RmlsdGVyIiwicmVtb3ZlRmlsdGVyIiwidG9nZ2xlQW5pbWF0aW9uIiwib25TZXRGaWx0ZXIiLCJ2YWx1ZSIsInBhbmVsQWN0aW9ucyIsImlkIiwib25DbGljayIsInRvb2x0aXAiLCJpY29uQ29tcG9uZW50IiwiQ2xvY2siLCJhY3RpdmUiLCJlbmxhcmdlZCIsInR5cGUiLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUUFBLDJCQUEyQixDQUFDQyxJQUE1QixHQUFtQyxDQUNqQ0Msc0NBRGlDLEVBRWpDQywyQkFGaUMsRUFHakNDLDhCQUhpQyxDQUFuQzs7QUFNQSxTQUFTSiwyQkFBVCxDQUFxQ0sseUJBQXJDLEVBQWdFQyxlQUFoRSxFQUFpRjtBQUMvRSxNQUFNQyxvQkFBb0IsZ0JBQUdDLGtCQUFNQyxJQUFOLENBQzNCLGdCQVVNO0FBQUEsUUFUSkMsR0FTSSxRQVRKQSxHQVNJO0FBQUEsUUFSSkMsUUFRSSxRQVJKQSxRQVFJO0FBQUEsUUFQSkMsa0JBT0ksUUFQSkEsa0JBT0k7QUFBQSxRQU5KQyxNQU1JLFFBTkpBLE1BTUk7QUFBQSxRQUxKQyxvQkFLSSxRQUxKQSxvQkFLSTtBQUFBLFFBSkpDLGFBSUksUUFKSkEsYUFJSTtBQUFBLFFBSEpDLFNBR0ksUUFISkEsU0FHSTtBQUFBLFFBRkpDLFlBRUksUUFGSkEsWUFFSTtBQUFBLFFBREpDLGVBQ0ksUUFESkEsZUFDSTtBQUNKLFFBQU1DLFdBQVcsR0FBRyx3QkFBWSxVQUFBQyxLQUFLO0FBQUEsYUFBSUosU0FBUyxDQUFDTixHQUFELEVBQU0sT0FBTixFQUFlVSxLQUFmLENBQWI7QUFBQSxLQUFqQixFQUFxRCxDQUFDVixHQUFELEVBQU1NLFNBQU4sQ0FBckQsQ0FBcEI7QUFFQSxRQUFNSyxZQUFZLEdBQUcsb0JBQ25CO0FBQUEsYUFBTSxDQUNKO0FBQ0VDLFFBQUFBLEVBQUUsRUFBRVQsTUFBTSxDQUFDUyxFQURiO0FBRUVDLFFBQUFBLE9BQU8sRUFBRVIsYUFGWDtBQUdFUyxRQUFBQSxPQUFPLEVBQUUsc0JBSFg7QUFJRUMsUUFBQUEsYUFBYSxFQUFFQyxZQUpqQjtBQUtFQyxRQUFBQSxNQUFNLEVBQUVkLE1BQU0sQ0FBQ2U7QUFMakIsT0FESSxDQUFOO0FBQUEsS0FEbUIsRUFVbkIsQ0FBQ2YsTUFBTSxDQUFDUyxFQUFSLEVBQVlULE1BQU0sQ0FBQ2UsUUFBbkIsRUFBNkJiLGFBQTdCLENBVm1CLENBQXJCO0FBYUEsd0JBQ0UsK0VBQ0UsZ0NBQUMseUJBQUQ7QUFDRSxNQUFBLGtCQUFrQixFQUFFSCxrQkFEdEI7QUFFRSxNQUFBLFFBQVEsRUFBRUQsUUFGWjtBQUdFLE1BQUEsTUFBTSxFQUFFRSxNQUhWO0FBSUUsTUFBQSxHQUFHLEVBQUVILEdBSlA7QUFLRSxNQUFBLFlBQVksRUFBRU8sWUFMaEI7QUFNRSxNQUFBLFNBQVMsRUFBRUQsU0FOYjtBQU9FLE1BQUEsWUFBWSxFQUFFSztBQVBoQixPQVNHUixNQUFNLENBQUNnQixJQUFQLElBQWUsQ0FBQ2hCLE1BQU0sQ0FBQ2UsUUFBdkIsaUJBQ0M7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNFLGdDQUFDLGVBQUQ7QUFDRSxNQUFBLE1BQU0sRUFBRWYsTUFEVjtBQUVFLE1BQUEsR0FBRyxFQUFFSCxHQUZQO0FBR0UsTUFBQSxvQkFBb0IsRUFBRUksb0JBSHhCO0FBSUUsTUFBQSxlQUFlLEVBQUVJLGVBSm5CO0FBS0UsTUFBQSxTQUFTLEVBQUVDO0FBTGIsTUFERixDQVZKLENBREYsQ0FERjtBQXlCRCxHQXBEMEIsQ0FBN0I7O0FBdURBWixFQUFBQSxvQkFBb0IsQ0FBQ3VCLFdBQXJCLEdBQW1DLHNCQUFuQztBQUVBLFNBQU92QixvQkFBUDtBQUNEOztlQUVjUCwyQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge3VzZUNhbGxiYWNrLCB1c2VNZW1vfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVGltZVJhbmdlRmlsdGVyRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL2ZpbHRlcnMvdGltZS1yYW5nZS1maWx0ZXInO1xuaW1wb3J0IHtDbG9ja30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IFNvdXJjZURhdGFTZWxlY3RvckZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9zaWRlLXBhbmVsL2NvbW1vbi9zb3VyY2UtZGF0YS1zZWxlY3Rvcic7XG5pbXBvcnQgRmllbGRQYW5lbFdpdGhGaWVsZFNlbGVjdEZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9maWx0ZXJzL2ZpbHRlci1wYW5lbHMvZmlsdGVyLXBhbmVsLXdpdGgtZmllbGQtc2VsZWN0JztcblxuVGltZVJhbmdlRmlsdGVyUGFuZWxGYWN0b3J5LmRlcHMgPSBbXG4gIEZpZWxkUGFuZWxXaXRoRmllbGRTZWxlY3RGYWN0b3J5LFxuICBUaW1lUmFuZ2VGaWx0ZXJGYWN0b3J5LFxuICBTb3VyY2VEYXRhU2VsZWN0b3JGYWN0b3J5XG5dO1xuXG5mdW5jdGlvbiBUaW1lUmFuZ2VGaWx0ZXJQYW5lbEZhY3RvcnkoRmllbGRQYW5lbFdpdGhGaWVsZFNlbGVjdCwgVGltZVJhbmdlRmlsdGVyKSB7XG4gIGNvbnN0IFRpbWVSYW5nZUZpbHRlclBhbmVsID0gUmVhY3QubWVtbyhcbiAgICAoe1xuICAgICAgaWR4LFxuICAgICAgZGF0YXNldHMsXG4gICAgICBhbGxBdmFpbGFibGVGaWVsZHMsXG4gICAgICBmaWx0ZXIsXG4gICAgICBpc0FueUZpbHRlckFuaW1hdGluZyxcbiAgICAgIGVubGFyZ2VGaWx0ZXIsXG4gICAgICBzZXRGaWx0ZXIsXG4gICAgICByZW1vdmVGaWx0ZXIsXG4gICAgICB0b2dnbGVBbmltYXRpb25cbiAgICB9KSA9PiB7XG4gICAgICBjb25zdCBvblNldEZpbHRlciA9IHVzZUNhbGxiYWNrKHZhbHVlID0+IHNldEZpbHRlcihpZHgsICd2YWx1ZScsIHZhbHVlKSwgW2lkeCwgc2V0RmlsdGVyXSk7XG5cbiAgICAgIGNvbnN0IHBhbmVsQWN0aW9ucyA9IHVzZU1lbW8oXG4gICAgICAgICgpID0+IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogZmlsdGVyLmlkLFxuICAgICAgICAgICAgb25DbGljazogZW5sYXJnZUZpbHRlcixcbiAgICAgICAgICAgIHRvb2x0aXA6ICd0b29sdGlwLnRpbWVQbGF5YmFjaycsXG4gICAgICAgICAgICBpY29uQ29tcG9uZW50OiBDbG9jayxcbiAgICAgICAgICAgIGFjdGl2ZTogZmlsdGVyLmVubGFyZ2VkXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBbZmlsdGVyLmlkLCBmaWx0ZXIuZW5sYXJnZWQsIGVubGFyZ2VGaWx0ZXJdXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGaWVsZFBhbmVsV2l0aEZpZWxkU2VsZWN0XG4gICAgICAgICAgICBhbGxBdmFpbGFibGVGaWVsZHM9e2FsbEF2YWlsYWJsZUZpZWxkc31cbiAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICAgICAgaWR4PXtpZHh9XG4gICAgICAgICAgICByZW1vdmVGaWx0ZXI9e3JlbW92ZUZpbHRlcn1cbiAgICAgICAgICAgIHNldEZpbHRlcj17c2V0RmlsdGVyfVxuICAgICAgICAgICAgcGFuZWxBY3Rpb25zPXtwYW5lbEFjdGlvbnN9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2ZpbHRlci50eXBlICYmICFmaWx0ZXIuZW5sYXJnZWQgJiYgKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpbHRlci1wYW5lbF9fZmlsdGVyXCI+XG4gICAgICAgICAgICAgICAgPFRpbWVSYW5nZUZpbHRlclxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICBpZHg9e2lkeH1cbiAgICAgICAgICAgICAgICAgIGlzQW55RmlsdGVyQW5pbWF0aW5nPXtpc0FueUZpbHRlckFuaW1hdGluZ31cbiAgICAgICAgICAgICAgICAgIHRvZ2dsZUFuaW1hdGlvbj17dG9nZ2xlQW5pbWF0aW9ufVxuICAgICAgICAgICAgICAgICAgc2V0RmlsdGVyPXtvblNldEZpbHRlcn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9GaWVsZFBhbmVsV2l0aEZpZWxkU2VsZWN0PlxuICAgICAgICA8Lz5cbiAgICAgICk7XG4gICAgfVxuICApO1xuXG4gIFRpbWVSYW5nZUZpbHRlclBhbmVsLmRpc3BsYXlOYW1lID0gJ1RpbWVSYW5nZUZpbHRlclBhbmVsJztcblxuICByZXR1cm4gVGltZVJhbmdlRmlsdGVyUGFuZWw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbWVSYW5nZUZpbHRlclBhbmVsRmFjdG9yeTtcbiJdfQ==