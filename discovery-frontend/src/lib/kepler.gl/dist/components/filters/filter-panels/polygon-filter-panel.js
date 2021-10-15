"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = require("../../common/styled-components");

var _polygonFilter = _interopRequireDefault(require("../polygon-filter"));

var _panelHeaderAction = _interopRequireDefault(require("../../side-panel/panel-header-action"));

var _icons = require("../../common/icons");

var _filterPanelHeader = _interopRequireDefault(require("../../side-panel/filter-panel/filter-panel-header"));

var _components = require("../components");

var _lodash = _interopRequireDefault(require("lodash.get"));

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
PolygonFilterPanelFactory.deps = [_filterPanelHeader["default"], _polygonFilter["default"]];

function PolygonFilterPanelFactory(FilterPanelHeader, PolygonFilter) {
  var PolygonFilterPanel = /*#__PURE__*/_react["default"].memo(function (_ref) {
    var idx = _ref.idx,
        datasets = _ref.datasets,
        layers = _ref.layers,
        allAvailableFields = _ref.allAvailableFields,
        filter = _ref.filter,
        removeFilter = _ref.removeFilter,
        setFilter = _ref.setFilter,
        toggleFilterFeature = _ref.toggleFilterFeature;
    var filterDatasets = (0, _react.useMemo)(function () {
      return filter.dataId.map(function (d) {
        return datasets[d];
      });
    }, [filter, datasets]);
    var onSetLayers = (0, _react.useCallback)(function (value) {
      return setFilter(idx, 'layerId', value);
    }, [setFilter, idx]);
    var isVisible = (0, _lodash["default"])(filter, ['value', 'properties', 'isVisible'], true);
    var featureType = (0, _lodash["default"])(filter, ['value', 'properties', 'renderType'], true);
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "polygon-filter-panel"
    }, /*#__PURE__*/_react["default"].createElement(FilterPanelHeader, {
      datasets: filterDatasets,
      allAvailableFields: allAvailableFields,
      idx: idx,
      filter: filter,
      removeFilter: removeFilter
    }, /*#__PURE__*/_react["default"].createElement(_components.StyledFilterPanel, null, "Geo - ", featureType), /*#__PURE__*/_react["default"].createElement(_panelHeaderAction["default"], {
      id: filter.id,
      onClick: toggleFilterFeature,
      tooltip: isVisible ? 'tooltip.hideFeature' : 'tooltip.showFeature',
      IconComponent: isVisible ? _icons.EyeSeen : _icons.EyeUnseen,
      active: isVisible
    })), /*#__PURE__*/_react["default"].createElement(_styledComponents.StyledFilterContent, {
      className: "filter-panel__content"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "filter-panel__filter"
    }, /*#__PURE__*/_react["default"].createElement(PolygonFilter, {
      filter: filter,
      layers: layers,
      setLayers: onSetLayers,
      toggleFilterFeature: toggleFilterFeature
    }))));
  });

  PolygonFilterPanel.displayName = 'PolygonFilterPanel';
  return PolygonFilterPanel;
}

var _default = PolygonFilterPanelFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2ZpbHRlcnMvZmlsdGVyLXBhbmVscy9wb2x5Z29uLWZpbHRlci1wYW5lbC5qcyJdLCJuYW1lcyI6WyJQb2x5Z29uRmlsdGVyUGFuZWxGYWN0b3J5IiwiZGVwcyIsIkZpbHRlclBhbmVsSGVhZGVyRmFjdG9yeSIsIlBvbHlnb25GaWx0ZXJGYWN0b3J5IiwiRmlsdGVyUGFuZWxIZWFkZXIiLCJQb2x5Z29uRmlsdGVyIiwiUG9seWdvbkZpbHRlclBhbmVsIiwiUmVhY3QiLCJtZW1vIiwiaWR4IiwiZGF0YXNldHMiLCJsYXllcnMiLCJhbGxBdmFpbGFibGVGaWVsZHMiLCJmaWx0ZXIiLCJyZW1vdmVGaWx0ZXIiLCJzZXRGaWx0ZXIiLCJ0b2dnbGVGaWx0ZXJGZWF0dXJlIiwiZmlsdGVyRGF0YXNldHMiLCJkYXRhSWQiLCJtYXAiLCJkIiwib25TZXRMYXllcnMiLCJ2YWx1ZSIsImlzVmlzaWJsZSIsImZlYXR1cmVUeXBlIiwiaWQiLCJFeWVTZWVuIiwiRXllVW5zZWVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFBQSx5QkFBeUIsQ0FBQ0MsSUFBMUIsR0FBaUMsQ0FBQ0MsNkJBQUQsRUFBMkJDLHlCQUEzQixDQUFqQzs7QUFFQSxTQUFTSCx5QkFBVCxDQUFtQ0ksaUJBQW5DLEVBQXNEQyxhQUF0RCxFQUFxRTtBQUNuRSxNQUFNQyxrQkFBa0IsZ0JBQUdDLGtCQUFNQyxJQUFOLENBQ3pCLGdCQVNNO0FBQUEsUUFSSkMsR0FRSSxRQVJKQSxHQVFJO0FBQUEsUUFQSkMsUUFPSSxRQVBKQSxRQU9JO0FBQUEsUUFOSkMsTUFNSSxRQU5KQSxNQU1JO0FBQUEsUUFMSkMsa0JBS0ksUUFMSkEsa0JBS0k7QUFBQSxRQUpKQyxNQUlJLFFBSkpBLE1BSUk7QUFBQSxRQUhKQyxZQUdJLFFBSEpBLFlBR0k7QUFBQSxRQUZKQyxTQUVJLFFBRkpBLFNBRUk7QUFBQSxRQURKQyxtQkFDSSxRQURKQSxtQkFDSTtBQUNKLFFBQU1DLGNBQWMsR0FBRyxvQkFBUTtBQUFBLGFBQU1KLE1BQU0sQ0FBQ0ssTUFBUCxDQUFjQyxHQUFkLENBQWtCLFVBQUFDLENBQUM7QUFBQSxlQUFJVixRQUFRLENBQUNVLENBQUQsQ0FBWjtBQUFBLE9BQW5CLENBQU47QUFBQSxLQUFSLEVBQW1ELENBQUNQLE1BQUQsRUFBU0gsUUFBVCxDQUFuRCxDQUF2QjtBQUVBLFFBQU1XLFdBQVcsR0FBRyx3QkFBWSxVQUFBQyxLQUFLO0FBQUEsYUFBSVAsU0FBUyxDQUFDTixHQUFELEVBQU0sU0FBTixFQUFpQmEsS0FBakIsQ0FBYjtBQUFBLEtBQWpCLEVBQXVELENBQUNQLFNBQUQsRUFBWU4sR0FBWixDQUF2RCxDQUFwQjtBQUVBLFFBQU1jLFNBQVMsR0FBRyx3QkFBSVYsTUFBSixFQUFZLENBQUMsT0FBRCxFQUFVLFlBQVYsRUFBd0IsV0FBeEIsQ0FBWixFQUFrRCxJQUFsRCxDQUFsQjtBQUNBLFFBQU1XLFdBQVcsR0FBRyx3QkFBSVgsTUFBSixFQUFZLENBQUMsT0FBRCxFQUFVLFlBQVYsRUFBd0IsWUFBeEIsQ0FBWixFQUFtRCxJQUFuRCxDQUFwQjtBQUVBLHdCQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRSxnQ0FBQyxpQkFBRDtBQUNFLE1BQUEsUUFBUSxFQUFFSSxjQURaO0FBRUUsTUFBQSxrQkFBa0IsRUFBRUwsa0JBRnRCO0FBR0UsTUFBQSxHQUFHLEVBQUVILEdBSFA7QUFJRSxNQUFBLE1BQU0sRUFBRUksTUFKVjtBQUtFLE1BQUEsWUFBWSxFQUFFQztBQUxoQixvQkFPRSxnQ0FBQyw2QkFBRCxrQkFBMEJVLFdBQTFCLENBUEYsZUFRRSxnQ0FBQyw2QkFBRDtBQUNFLE1BQUEsRUFBRSxFQUFFWCxNQUFNLENBQUNZLEVBRGI7QUFFRSxNQUFBLE9BQU8sRUFBRVQsbUJBRlg7QUFHRSxNQUFBLE9BQU8sRUFBRU8sU0FBUyxHQUFHLHFCQUFILEdBQTJCLHFCQUgvQztBQUlFLE1BQUEsYUFBYSxFQUFFQSxTQUFTLEdBQUdHLGNBQUgsR0FBYUMsZ0JBSnZDO0FBS0UsTUFBQSxNQUFNLEVBQUVKO0FBTFYsTUFSRixDQURGLGVBaUJFLGdDQUFDLHFDQUFEO0FBQXFCLE1BQUEsU0FBUyxFQUFDO0FBQS9CLG9CQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDRSxnQ0FBQyxhQUFEO0FBQ0UsTUFBQSxNQUFNLEVBQUVWLE1BRFY7QUFFRSxNQUFBLE1BQU0sRUFBRUYsTUFGVjtBQUdFLE1BQUEsU0FBUyxFQUFFVSxXQUhiO0FBSUUsTUFBQSxtQkFBbUIsRUFBRUw7QUFKdkIsTUFERixDQURGLENBakJGLENBREY7QUE4QkQsR0FoRHdCLENBQTNCOztBQW1EQVYsRUFBQUEsa0JBQWtCLENBQUNzQixXQUFuQixHQUFpQyxvQkFBakM7QUFFQSxTQUFPdEIsa0JBQVA7QUFDRDs7ZUFFY04seUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHt1c2VNZW1vLCB1c2VDYWxsYmFja30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtTdHlsZWRGaWx0ZXJDb250ZW50fSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgUG9seWdvbkZpbHRlckZhY3RvcnkgZnJvbSAnY29tcG9uZW50cy9maWx0ZXJzL3BvbHlnb24tZmlsdGVyJztcbmltcG9ydCBQYW5lbEhlYWRlckFjdGlvbiBmcm9tICdjb21wb25lbnRzL3NpZGUtcGFuZWwvcGFuZWwtaGVhZGVyLWFjdGlvbic7XG5pbXBvcnQge0V5ZVNlZW59IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCB7RXllVW5zZWVufSBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9pY29ucyc7XG5pbXBvcnQgRmlsdGVyUGFuZWxIZWFkZXJGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvc2lkZS1wYW5lbC9maWx0ZXItcGFuZWwvZmlsdGVyLXBhbmVsLWhlYWRlcic7XG5pbXBvcnQge1N0eWxlZEZpbHRlclBhbmVsfSBmcm9tICcuLi9jb21wb25lbnRzJztcblxuaW1wb3J0IGdldCBmcm9tICdsb2Rhc2guZ2V0JztcblxuUG9seWdvbkZpbHRlclBhbmVsRmFjdG9yeS5kZXBzID0gW0ZpbHRlclBhbmVsSGVhZGVyRmFjdG9yeSwgUG9seWdvbkZpbHRlckZhY3RvcnldO1xuXG5mdW5jdGlvbiBQb2x5Z29uRmlsdGVyUGFuZWxGYWN0b3J5KEZpbHRlclBhbmVsSGVhZGVyLCBQb2x5Z29uRmlsdGVyKSB7XG4gIGNvbnN0IFBvbHlnb25GaWx0ZXJQYW5lbCA9IFJlYWN0Lm1lbW8oXG4gICAgKHtcbiAgICAgIGlkeCxcbiAgICAgIGRhdGFzZXRzLFxuICAgICAgbGF5ZXJzLFxuICAgICAgYWxsQXZhaWxhYmxlRmllbGRzLFxuICAgICAgZmlsdGVyLFxuICAgICAgcmVtb3ZlRmlsdGVyLFxuICAgICAgc2V0RmlsdGVyLFxuICAgICAgdG9nZ2xlRmlsdGVyRmVhdHVyZVxuICAgIH0pID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlckRhdGFzZXRzID0gdXNlTWVtbygoKSA9PiBmaWx0ZXIuZGF0YUlkLm1hcChkID0+IGRhdGFzZXRzW2RdKSwgW2ZpbHRlciwgZGF0YXNldHNdKTtcblxuICAgICAgY29uc3Qgb25TZXRMYXllcnMgPSB1c2VDYWxsYmFjayh2YWx1ZSA9PiBzZXRGaWx0ZXIoaWR4LCAnbGF5ZXJJZCcsIHZhbHVlKSwgW3NldEZpbHRlciwgaWR4XSk7XG5cbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IGdldChmaWx0ZXIsIFsndmFsdWUnLCAncHJvcGVydGllcycsICdpc1Zpc2libGUnXSwgdHJ1ZSk7XG4gICAgICBjb25zdCBmZWF0dXJlVHlwZSA9IGdldChmaWx0ZXIsIFsndmFsdWUnLCAncHJvcGVydGllcycsICdyZW5kZXJUeXBlJ10sIHRydWUpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvbHlnb24tZmlsdGVyLXBhbmVsXCI+XG4gICAgICAgICAgPEZpbHRlclBhbmVsSGVhZGVyXG4gICAgICAgICAgICBkYXRhc2V0cz17ZmlsdGVyRGF0YXNldHN9XG4gICAgICAgICAgICBhbGxBdmFpbGFibGVGaWVsZHM9e2FsbEF2YWlsYWJsZUZpZWxkc31cbiAgICAgICAgICAgIGlkeD17aWR4fVxuICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICByZW1vdmVGaWx0ZXI9e3JlbW92ZUZpbHRlcn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8U3R5bGVkRmlsdGVyUGFuZWw+R2VvIC0ge2ZlYXR1cmVUeXBlfTwvU3R5bGVkRmlsdGVyUGFuZWw+XG4gICAgICAgICAgICA8UGFuZWxIZWFkZXJBY3Rpb25cbiAgICAgICAgICAgICAgaWQ9e2ZpbHRlci5pZH1cbiAgICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlRmlsdGVyRmVhdHVyZX1cbiAgICAgICAgICAgICAgdG9vbHRpcD17aXNWaXNpYmxlID8gJ3Rvb2x0aXAuaGlkZUZlYXR1cmUnIDogJ3Rvb2x0aXAuc2hvd0ZlYXR1cmUnfVxuICAgICAgICAgICAgICBJY29uQ29tcG9uZW50PXtpc1Zpc2libGUgPyBFeWVTZWVuIDogRXllVW5zZWVufVxuICAgICAgICAgICAgICBhY3RpdmU9e2lzVmlzaWJsZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9GaWx0ZXJQYW5lbEhlYWRlcj5cbiAgICAgICAgICA8U3R5bGVkRmlsdGVyQ29udGVudCBjbGFzc05hbWU9XCJmaWx0ZXItcGFuZWxfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmlsdGVyLXBhbmVsX19maWx0ZXJcIj5cbiAgICAgICAgICAgICAgPFBvbHlnb25GaWx0ZXJcbiAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICBsYXllcnM9e2xheWVyc31cbiAgICAgICAgICAgICAgICBzZXRMYXllcnM9e29uU2V0TGF5ZXJzfVxuICAgICAgICAgICAgICAgIHRvZ2dsZUZpbHRlckZlYXR1cmU9e3RvZ2dsZUZpbHRlckZlYXR1cmV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L1N0eWxlZEZpbHRlckNvbnRlbnQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gICk7XG5cbiAgUG9seWdvbkZpbHRlclBhbmVsLmRpc3BsYXlOYW1lID0gJ1BvbHlnb25GaWx0ZXJQYW5lbCc7XG5cbiAgcmV0dXJuIFBvbHlnb25GaWx0ZXJQYW5lbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9seWdvbkZpbHRlclBhbmVsRmFjdG9yeTtcbiJdfQ==