"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _dataUtils = require("../../utils/data-utils");

var _icons = require("../common/icons");

var _layerHoverInfo = require("./layer-hover-info");

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
// 6th decimal is worth up to 0.11 m
// https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
var DECIMAL = 6;
var DECIMAL_Z = 1;

var CoordinateInfoFactory = function CoordinateInfoFactory() {
  var CoordinateInfo = function CoordinateInfo(_ref) {
    var coordinate = _ref.coordinate,
        zoom = _ref.zoom;
    return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_layerHoverInfo.StyledLayerName, {
      className: "map-popover__layer-name"
    }, /*#__PURE__*/_react["default"].createElement(_icons.CursorClick, {
      height: "12px"
    }), "Coordinate"), /*#__PURE__*/_react["default"].createElement("table", null, /*#__PURE__*/_react["default"].createElement("tbody", null, /*#__PURE__*/_react["default"].createElement("tr", {
      className: "row"
    }, /*#__PURE__*/_react["default"].createElement("td", {
      className: "row__value"
    }, (0, _dataUtils.preciseRound)(coordinate[1], DECIMAL), ","), /*#__PURE__*/_react["default"].createElement("td", {
      className: "row__value"
    }, (0, _dataUtils.preciseRound)(coordinate[0], DECIMAL), ","), /*#__PURE__*/_react["default"].createElement("td", {
      className: "row__value"
    }, (0, _dataUtils.preciseRound)(zoom, DECIMAL_Z), "z")))));
  };

  return CoordinateInfo;
};

var _default = CoordinateInfoFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL21hcC9jb29yZGluYXRlLWluZm8uanMiXSwibmFtZXMiOlsiREVDSU1BTCIsIkRFQ0lNQUxfWiIsIkNvb3JkaW5hdGVJbmZvRmFjdG9yeSIsIkNvb3JkaW5hdGVJbmZvIiwiY29vcmRpbmF0ZSIsInpvb20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUNBO0FBQ0EsSUFBTUEsT0FBTyxHQUFHLENBQWhCO0FBQ0EsSUFBTUMsU0FBUyxHQUFHLENBQWxCOztBQUVBLElBQU1DLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0IsR0FBTTtBQUNsQyxNQUFNQyxjQUFjLEdBQUcsU0FBakJBLGNBQWlCO0FBQUEsUUFBRUMsVUFBRixRQUFFQSxVQUFGO0FBQUEsUUFBY0MsSUFBZCxRQUFjQSxJQUFkO0FBQUEsd0JBQ3JCLDBEQUNFLGdDQUFDLCtCQUFEO0FBQWlCLE1BQUEsU0FBUyxFQUFDO0FBQTNCLG9CQUNFLGdDQUFDLGtCQUFEO0FBQWEsTUFBQSxNQUFNLEVBQUM7QUFBcEIsTUFERixlQURGLGVBS0UsNERBQ0UsNERBQ0U7QUFBSSxNQUFBLFNBQVMsRUFBQztBQUFkLG9CQUNFO0FBQUksTUFBQSxTQUFTLEVBQUM7QUFBZCxPQUE0Qiw2QkFBYUQsVUFBVSxDQUFDLENBQUQsQ0FBdkIsRUFBNEJKLE9BQTVCLENBQTVCLE1BREYsZUFFRTtBQUFJLE1BQUEsU0FBUyxFQUFDO0FBQWQsT0FBNEIsNkJBQWFJLFVBQVUsQ0FBQyxDQUFELENBQXZCLEVBQTRCSixPQUE1QixDQUE1QixNQUZGLGVBR0U7QUFBSSxNQUFBLFNBQVMsRUFBQztBQUFkLE9BQTRCLDZCQUFhSyxJQUFiLEVBQW1CSixTQUFuQixDQUE1QixNQUhGLENBREYsQ0FERixDQUxGLENBRHFCO0FBQUEsR0FBdkI7O0FBa0JBLFNBQU9FLGNBQVA7QUFDRCxDQXBCRDs7ZUFzQmVELHFCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7cHJlY2lzZVJvdW5kfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7Q3Vyc29yQ2xpY2t9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCB7U3R5bGVkTGF5ZXJOYW1lfSBmcm9tICcuL2xheWVyLWhvdmVyLWluZm8nO1xuXG4vLyA2dGggZGVjaW1hbCBpcyB3b3J0aCB1cCB0byAwLjExIG1cbi8vIGh0dHBzOi8vZ2lzLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy84NjUwL21lYXN1cmluZy1hY2N1cmFjeS1vZi1sYXRpdHVkZS1hbmQtbG9uZ2l0dWRlXG5jb25zdCBERUNJTUFMID0gNjtcbmNvbnN0IERFQ0lNQUxfWiA9IDE7XG5cbmNvbnN0IENvb3JkaW5hdGVJbmZvRmFjdG9yeSA9ICgpID0+IHtcbiAgY29uc3QgQ29vcmRpbmF0ZUluZm8gPSAoe2Nvb3JkaW5hdGUsIHpvb219KSA9PiAoXG4gICAgPGRpdj5cbiAgICAgIDxTdHlsZWRMYXllck5hbWUgY2xhc3NOYW1lPVwibWFwLXBvcG92ZXJfX2xheWVyLW5hbWVcIj5cbiAgICAgICAgPEN1cnNvckNsaWNrIGhlaWdodD1cIjEycHhcIiAvPlxuICAgICAgICBDb29yZGluYXRlXG4gICAgICA8L1N0eWxlZExheWVyTmFtZT5cbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRib2R5PlxuICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJyb3dfX3ZhbHVlXCI+e3ByZWNpc2VSb3VuZChjb29yZGluYXRlWzFdLCBERUNJTUFMKX0sPC90ZD5cbiAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJyb3dfX3ZhbHVlXCI+e3ByZWNpc2VSb3VuZChjb29yZGluYXRlWzBdLCBERUNJTUFMKX0sPC90ZD5cbiAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJyb3dfX3ZhbHVlXCI+e3ByZWNpc2VSb3VuZCh6b29tLCBERUNJTUFMX1opfXo8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApO1xuXG4gIHJldHVybiBDb29yZGluYXRlSW5mbztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvb3JkaW5hdGVJbmZvRmFjdG9yeTtcbiJdfQ==