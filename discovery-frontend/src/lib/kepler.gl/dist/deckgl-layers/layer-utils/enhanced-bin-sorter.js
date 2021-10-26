"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _aggregationLayers = require("@deck.gl/aggregation-layers");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var EnhancedBinSorter = /*#__PURE__*/function (_BinSorter) {
  (0, _inherits2["default"])(EnhancedBinSorter, _BinSorter);

  var _super = _createSuper(EnhancedBinSorter);

  function EnhancedBinSorter() {
    (0, _classCallCheck2["default"])(this, EnhancedBinSorter);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(EnhancedBinSorter, [{
    key: "getValueRange",
    value: function getValueRange(percentileRange) {
      if (!this.sortedBins) {
        this.sortedBins = this.aggregatedBins.sort(function (a, b) {
          return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
        });
      }

      if (!this.sortedBins.length) {
        return [];
      }

      var lowerIdx = 0;
      var upperIdx = this.sortedBins.length - 1;

      if (Array.isArray(percentileRange)) {
        var idxRange = this._percentileToIndex(percentileRange);

        lowerIdx = idxRange[0];
        upperIdx = idxRange[1];
      }

      return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
    }
  }, {
    key: "getValueDomainByScale",
    value: function getValueDomainByScale(scale) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [],
          _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          _ref2$ = _ref2[0],
          lower = _ref2$ === void 0 ? 0 : _ref2$,
          _ref2$2 = _ref2[1],
          upper = _ref2$2 === void 0 ? 100 : _ref2$2;

      if (!this.sortedBins) {
        this.sortedBins = this.aggregatedBins.sort(function (a, b) {
          return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
        });
      }

      if (!this.sortedBins.length) {
        return [];
      }

      var indexEdge = this._percentileToIndex([lower, upper]);

      return this._getScaleDomain(scale, indexEdge);
    }
  }]);
  return EnhancedBinSorter;
}(_aggregationLayers._BinSorter);

exports["default"] = EnhancedBinSorter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL2xheWVyLXV0aWxzL2VuaGFuY2VkLWJpbi1zb3J0ZXIuanMiXSwibmFtZXMiOlsiRW5oYW5jZWRCaW5Tb3J0ZXIiLCJwZXJjZW50aWxlUmFuZ2UiLCJzb3J0ZWRCaW5zIiwiYWdncmVnYXRlZEJpbnMiLCJzb3J0IiwiYSIsImIiLCJ2YWx1ZSIsImxlbmd0aCIsImxvd2VySWR4IiwidXBwZXJJZHgiLCJBcnJheSIsImlzQXJyYXkiLCJpZHhSYW5nZSIsIl9wZXJjZW50aWxlVG9JbmRleCIsInNjYWxlIiwibG93ZXIiLCJ1cHBlciIsImluZGV4RWRnZSIsIl9nZXRTY2FsZURvbWFpbiIsIkJpblNvcnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOzs7Ozs7SUFFcUJBLGlCOzs7Ozs7Ozs7Ozs7a0NBQ0xDLGUsRUFBaUI7QUFDN0IsVUFBSSxDQUFDLEtBQUtDLFVBQVYsRUFBc0I7QUFDcEIsYUFBS0EsVUFBTCxHQUFrQixLQUFLQyxjQUFMLENBQW9CQyxJQUFwQixDQUF5QixVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxpQkFDekNELENBQUMsQ0FBQ0UsS0FBRixHQUFVRCxDQUFDLENBQUNDLEtBQVosR0FBb0IsQ0FBcEIsR0FBd0JGLENBQUMsQ0FBQ0UsS0FBRixHQUFVRCxDQUFDLENBQUNDLEtBQVosR0FBb0IsQ0FBQyxDQUFyQixHQUF5QixDQURSO0FBQUEsU0FBekIsQ0FBbEI7QUFHRDs7QUFDRCxVQUFJLENBQUMsS0FBS0wsVUFBTCxDQUFnQk0sTUFBckIsRUFBNkI7QUFDM0IsZUFBTyxFQUFQO0FBQ0Q7O0FBQ0QsVUFBSUMsUUFBUSxHQUFHLENBQWY7QUFDQSxVQUFJQyxRQUFRLEdBQUcsS0FBS1IsVUFBTCxDQUFnQk0sTUFBaEIsR0FBeUIsQ0FBeEM7O0FBRUEsVUFBSUcsS0FBSyxDQUFDQyxPQUFOLENBQWNYLGVBQWQsQ0FBSixFQUFvQztBQUNsQyxZQUFNWSxRQUFRLEdBQUcsS0FBS0Msa0JBQUwsQ0FBd0JiLGVBQXhCLENBQWpCOztBQUNBUSxRQUFBQSxRQUFRLEdBQUdJLFFBQVEsQ0FBQyxDQUFELENBQW5CO0FBQ0FILFFBQUFBLFFBQVEsR0FBR0csUUFBUSxDQUFDLENBQUQsQ0FBbkI7QUFDRDs7QUFFRCxhQUFPLENBQUMsS0FBS1gsVUFBTCxDQUFnQk8sUUFBaEIsRUFBMEJGLEtBQTNCLEVBQWtDLEtBQUtMLFVBQUwsQ0FBZ0JRLFFBQWhCLEVBQTBCSCxLQUE1RCxDQUFQO0FBQ0Q7OzswQ0FFcUJRLEssRUFBc0M7QUFBQSxxRkFBSixFQUFJO0FBQUE7QUFBQTtBQUFBLFVBQTlCQyxLQUE4Qix1QkFBdEIsQ0FBc0I7QUFBQTtBQUFBLFVBQW5CQyxLQUFtQix3QkFBWCxHQUFXOztBQUMxRCxVQUFJLENBQUMsS0FBS2YsVUFBVixFQUFzQjtBQUNwQixhQUFLQSxVQUFMLEdBQWtCLEtBQUtDLGNBQUwsQ0FBb0JDLElBQXBCLENBQXlCLFVBQUNDLENBQUQsRUFBSUMsQ0FBSjtBQUFBLGlCQUN6Q0QsQ0FBQyxDQUFDRSxLQUFGLEdBQVVELENBQUMsQ0FBQ0MsS0FBWixHQUFvQixDQUFwQixHQUF3QkYsQ0FBQyxDQUFDRSxLQUFGLEdBQVVELENBQUMsQ0FBQ0MsS0FBWixHQUFvQixDQUFDLENBQXJCLEdBQXlCLENBRFI7QUFBQSxTQUF6QixDQUFsQjtBQUdEOztBQUNELFVBQUksQ0FBQyxLQUFLTCxVQUFMLENBQWdCTSxNQUFyQixFQUE2QjtBQUMzQixlQUFPLEVBQVA7QUFDRDs7QUFDRCxVQUFNVSxTQUFTLEdBQUcsS0FBS0osa0JBQUwsQ0FBd0IsQ0FBQ0UsS0FBRCxFQUFRQyxLQUFSLENBQXhCLENBQWxCOztBQUVBLGFBQU8sS0FBS0UsZUFBTCxDQUFxQkosS0FBckIsRUFBNEJHLFNBQTVCLENBQVA7QUFDRDs7O0VBbEM0Q0UsNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge19CaW5Tb3J0ZXIgYXMgQmluU29ydGVyfSBmcm9tICdAZGVjay5nbC9hZ2dyZWdhdGlvbi1sYXllcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmhhbmNlZEJpblNvcnRlciBleHRlbmRzIEJpblNvcnRlciB7XG4gIGdldFZhbHVlUmFuZ2UocGVyY2VudGlsZVJhbmdlKSB7XG4gICAgaWYgKCF0aGlzLnNvcnRlZEJpbnMpIHtcbiAgICAgIHRoaXMuc29ydGVkQmlucyA9IHRoaXMuYWdncmVnYXRlZEJpbnMuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS52YWx1ZSA+IGIudmFsdWUgPyAxIDogYS52YWx1ZSA8IGIudmFsdWUgPyAtMSA6IDBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghdGhpcy5zb3J0ZWRCaW5zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgbG93ZXJJZHggPSAwO1xuICAgIGxldCB1cHBlcklkeCA9IHRoaXMuc29ydGVkQmlucy5sZW5ndGggLSAxO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGVyY2VudGlsZVJhbmdlKSkge1xuICAgICAgY29uc3QgaWR4UmFuZ2UgPSB0aGlzLl9wZXJjZW50aWxlVG9JbmRleChwZXJjZW50aWxlUmFuZ2UpO1xuICAgICAgbG93ZXJJZHggPSBpZHhSYW5nZVswXTtcbiAgICAgIHVwcGVySWR4ID0gaWR4UmFuZ2VbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0aGlzLnNvcnRlZEJpbnNbbG93ZXJJZHhdLnZhbHVlLCB0aGlzLnNvcnRlZEJpbnNbdXBwZXJJZHhdLnZhbHVlXTtcbiAgfVxuXG4gIGdldFZhbHVlRG9tYWluQnlTY2FsZShzY2FsZSwgW2xvd2VyID0gMCwgdXBwZXIgPSAxMDBdID0gW10pIHtcbiAgICBpZiAoIXRoaXMuc29ydGVkQmlucykge1xuICAgICAgdGhpcy5zb3J0ZWRCaW5zID0gdGhpcy5hZ2dyZWdhdGVkQmlucy5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLnZhbHVlID4gYi52YWx1ZSA/IDEgOiBhLnZhbHVlIDwgYi52YWx1ZSA/IC0xIDogMFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnNvcnRlZEJpbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGluZGV4RWRnZSA9IHRoaXMuX3BlcmNlbnRpbGVUb0luZGV4KFtsb3dlciwgdXBwZXJdKTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRTY2FsZURvbWFpbihzY2FsZSwgaW5kZXhFZGdlKTtcbiAgfVxufVxuIl19