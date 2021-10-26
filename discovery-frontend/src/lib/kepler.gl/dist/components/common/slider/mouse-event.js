"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _document = _interopRequireDefault(require("global/document"));

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
function nope() {}

var MouseEventHandler = /*#__PURE__*/function () {
  function MouseEventHandler(_ref) {
    var _this = this;

    var _ref$vertical = _ref.vertical,
        vertical = _ref$vertical === void 0 ? false : _ref$vertical,
        _ref$valueListener = _ref.valueListener,
        valueListener = _ref$valueListener === void 0 ? nope : _ref$valueListener,
        _ref$toggleMouseOver = _ref.toggleMouseOver,
        toggleMouseOver = _ref$toggleMouseOver === void 0 ? nope : _ref$toggleMouseOver,
        track = _ref.track,
        _ref$setAnchor = _ref.setAnchor,
        setAnchor = _ref$setAnchor === void 0 ? null : _ref$setAnchor;
    (0, _classCallCheck2["default"])(this, MouseEventHandler);
    (0, _defineProperty2["default"])(this, "handleMouseDown", function (e) {
      _document["default"].addEventListener('mouseup', _this._mouseup);

      _document["default"].addEventListener('mousemove', _this._mousemove);

      if (_this._setAnchor) {
        var pos = _this._getMousePos(e);

        _this._setAnchor(_this._getDistanceToTrack(pos));
      }

      _this._toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "_mouseup", function () {
      _document["default"].removeEventListener('mouseup', _this._mouseup);

      _document["default"].removeEventListener('mousemove', _this._mousemove);

      _this._toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "_mousemove", function (e) {
      e.preventDefault();

      var pos = _this._getMousePos(e);

      _this._valueListener(_this._getDistanceToTrack(pos));
    });
    (0, _defineProperty2["default"])(this, "handleTouchStart", function (e) {
      // TODO: fix touch event
      _document["default"].addEventListener('touchend', _this._touchend);

      _document["default"].addEventListener('touchmove', _this._touchmove);

      if (_this._setAnchor) {
        var pos = _this._getTouchPosition(e);

        _this._setAnchor(_this._getDistanceToTrack(pos));
      }

      _this._toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "_touchmove", function (e) {
      // TODO: touch not tested
      var pos = _this._getTouchPosition(e);

      _this._valueListener(_this._getDistanceToTrack(pos));
    });
    (0, _defineProperty2["default"])(this, "_touchend", function () {
      _document["default"].removeEventListener('touchend', _this._touchend);

      _document["default"].removeEventListener('touchmove', _this._touchmove);

      _this._toggleMouseOver();
    });
    this._vertical = vertical;
    this._valueListener = valueListener;
    this._toggleMouseOver = toggleMouseOver;
    this._track = track;
    this._setAnchor = setAnchor;
  }

  (0, _createClass2["default"])(MouseEventHandler, [{
    key: "_getMousePos",
    value: function _getMousePos(e) {
      return this._vertical ? e.clientY : e.clientX;
    }
  }, {
    key: "_getTouchPosition",
    value: function _getTouchPosition(e) {
      return this._vertical ? e.touches[0].clientY : e.touches[0].clientX;
    }
  }, {
    key: "_getDistanceToTrack",
    value: function _getDistanceToTrack(pos) {
      var trackRect = this._track.current.getBoundingClientRect();

      return pos - (this._vertical ? trackRect.bottom : trackRect.left);
    }
  }]);
  return MouseEventHandler;
}();

exports["default"] = MouseEventHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9zbGlkZXIvbW91c2UtZXZlbnQuanMiXSwibmFtZXMiOlsibm9wZSIsIk1vdXNlRXZlbnRIYW5kbGVyIiwidmVydGljYWwiLCJ2YWx1ZUxpc3RlbmVyIiwidG9nZ2xlTW91c2VPdmVyIiwidHJhY2siLCJzZXRBbmNob3IiLCJlIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiX21vdXNldXAiLCJfbW91c2Vtb3ZlIiwiX3NldEFuY2hvciIsInBvcyIsIl9nZXRNb3VzZVBvcyIsIl9nZXREaXN0YW5jZVRvVHJhY2siLCJfdG9nZ2xlTW91c2VPdmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInByZXZlbnREZWZhdWx0IiwiX3ZhbHVlTGlzdGVuZXIiLCJfdG91Y2hlbmQiLCJfdG91Y2htb3ZlIiwiX2dldFRvdWNoUG9zaXRpb24iLCJfdmVydGljYWwiLCJfdHJhY2siLCJjbGllbnRZIiwiY2xpZW50WCIsInRvdWNoZXMiLCJ0cmFja1JlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYm90dG9tIiwibGVmdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBLFNBQVNBLElBQVQsR0FBdUIsQ0FBRTs7SUFFSkMsaUI7QUFDbkIsbUNBTUc7QUFBQTs7QUFBQSw2QkFMREMsUUFLQztBQUFBLFFBTERBLFFBS0MsOEJBTFUsS0FLVjtBQUFBLGtDQUpEQyxhQUlDO0FBQUEsUUFKREEsYUFJQyxtQ0FKZUgsSUFJZjtBQUFBLG9DQUhESSxlQUdDO0FBQUEsUUFIREEsZUFHQyxxQ0FIaUJKLElBR2pCO0FBQUEsUUFGREssS0FFQyxRQUZEQSxLQUVDO0FBQUEsOEJBRERDLFNBQ0M7QUFB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O3dDQVFtQmIsRyxFQUFLO0FBQ3ZCLFVBQU1lLFNBQVMsR0FBRyxLQUFLSixNQUFMLENBQVlLLE9BQVosQ0FBb0JDLHFCQUFwQixFQUFsQjs7QUFDQSxhQUFPakIsR0FBRyxJQUFJLEtBQUtVLFNBQUwsR0FBaUJLLFNBQVMsQ0FBQ0csTUFBM0IsR0FBb0NILFNBQVMsQ0FBQ0ksSUFBbEQsQ0FBVjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IGRvY3VtZW50IGZyb20gJ2dsb2JhbC9kb2N1bWVudCc7XG5cbmZ1bmN0aW9uIG5vcGUoLi4uYXJncykge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW91c2VFdmVudEhhbmRsZXIge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdmVydGljYWwgPSBmYWxzZSxcbiAgICB2YWx1ZUxpc3RlbmVyID0gbm9wZSxcbiAgICB0b2dnbGVNb3VzZU92ZXIgPSBub3BlLFxuICAgIHRyYWNrLFxuICAgIHNldEFuY2hvciA9IG51bGxcbiAgfSkge1xuICAgIHRoaXMuX3ZlcnRpY2FsID0gdmVydGljYWw7XG4gICAgdGhpcy5fdmFsdWVMaXN0ZW5lciA9IHZhbHVlTGlzdGVuZXI7XG4gICAgdGhpcy5fdG9nZ2xlTW91c2VPdmVyID0gdG9nZ2xlTW91c2VPdmVyO1xuICAgIHRoaXMuX3RyYWNrID0gdHJhY2s7XG4gICAgdGhpcy5fc2V0QW5jaG9yID0gc2V0QW5jaG9yO1xuICB9XG5cbiAgaGFuZGxlTW91c2VEb3duID0gZSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlbW92ZSk7XG4gICAgaWYgKHRoaXMuX3NldEFuY2hvcikge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0TW91c2VQb3MoZSk7XG4gICAgICB0aGlzLl9zZXRBbmNob3IodGhpcy5fZ2V0RGlzdGFuY2VUb1RyYWNrKHBvcykpO1xuICAgIH1cbiAgICB0aGlzLl90b2dnbGVNb3VzZU92ZXIoKTtcbiAgfTtcblxuICBfZ2V0TW91c2VQb3MoZSkge1xuICAgIHJldHVybiB0aGlzLl92ZXJ0aWNhbCA/IGUuY2xpZW50WSA6IGUuY2xpZW50WDtcbiAgfVxuXG4gIF9nZXRUb3VjaFBvc2l0aW9uKGUpIHtcbiAgICByZXR1cm4gdGhpcy5fdmVydGljYWwgPyBlLnRvdWNoZXNbMF0uY2xpZW50WSA6IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICB9XG5cbiAgX21vdXNldXAgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlbW92ZSk7XG4gICAgdGhpcy5fdG9nZ2xlTW91c2VPdmVyKCk7XG4gIH07XG5cbiAgX2dldERpc3RhbmNlVG9UcmFjayhwb3MpIHtcbiAgICBjb25zdCB0cmFja1JlY3QgPSB0aGlzLl90cmFjay5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBwb3MgLSAodGhpcy5fdmVydGljYWwgPyB0cmFja1JlY3QuYm90dG9tIDogdHJhY2tSZWN0LmxlZnQpO1xuICB9XG5cbiAgX21vdXNlbW92ZSA9IGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRNb3VzZVBvcyhlKTtcbiAgICB0aGlzLl92YWx1ZUxpc3RlbmVyKHRoaXMuX2dldERpc3RhbmNlVG9UcmFjayhwb3MpKTtcbiAgfTtcblxuICBoYW5kbGVUb3VjaFN0YXJ0ID0gZSA9PiB7XG4gICAgLy8gVE9ETzogZml4IHRvdWNoIGV2ZW50XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl90b3VjaGVuZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fdG91Y2htb3ZlKTtcbiAgICBpZiAodGhpcy5fc2V0QW5jaG9yKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRUb3VjaFBvc2l0aW9uKGUpO1xuICAgICAgdGhpcy5fc2V0QW5jaG9yKHRoaXMuX2dldERpc3RhbmNlVG9UcmFjayhwb3MpKTtcbiAgICB9XG4gICAgdGhpcy5fdG9nZ2xlTW91c2VPdmVyKCk7XG4gIH07XG5cbiAgX3RvdWNobW92ZSA9IGUgPT4ge1xuICAgIC8vIFRPRE86IHRvdWNoIG5vdCB0ZXN0ZWRcbiAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRUb3VjaFBvc2l0aW9uKGUpO1xuICAgIHRoaXMuX3ZhbHVlTGlzdGVuZXIodGhpcy5fZ2V0RGlzdGFuY2VUb1RyYWNrKHBvcykpO1xuICB9O1xuXG4gIF90b3VjaGVuZCA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoZW5kKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl90b3VjaG1vdmUpO1xuICAgIHRoaXMuX3RvZ2dsZU1vdXNlT3ZlcigpO1xuICB9O1xufVxuIl19