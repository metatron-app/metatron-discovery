"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.hexagonAggregation = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _aggregationLayers = require("@deck.gl/aggregation-layers");

var _cpuAggregator = _interopRequireWildcard(require("../layer-utils/cpu-aggregator"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var hexagonAggregation = {
  key: 'position',
  updateSteps: [{
    key: 'aggregate',
    triggers: {
      cellSize: {
        prop: 'radius'
      },
      position: {
        prop: 'getPosition',
        updateTrigger: 'getPosition'
      },
      aggregator: {
        prop: 'hexagonAggregator'
      }
    },
    updater: _cpuAggregator.getAggregatedData
  }]
};
exports.hexagonAggregation = hexagonAggregation;

var ScaleEnhancedHexagonLayer = /*#__PURE__*/function (_HexagonLayer) {
  (0, _inherits2["default"])(ScaleEnhancedHexagonLayer, _HexagonLayer);

  var _super = _createSuper(ScaleEnhancedHexagonLayer);

  function ScaleEnhancedHexagonLayer() {
    (0, _classCallCheck2["default"])(this, ScaleEnhancedHexagonLayer);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ScaleEnhancedHexagonLayer, [{
    key: "initializeState",
    value: function initializeState() {
      var cpuAggregator = new _cpuAggregator["default"]({
        aggregation: hexagonAggregation
      });
      this.state = {
        cpuAggregator: cpuAggregator,
        aggregatorState: cpuAggregator.state
      };
      var attributeManager = this.getAttributeManager();
      attributeManager.add({
        positions: {
          size: 3,
          accessor: 'getPosition'
        }
      });
    }
  }]);
  return ScaleEnhancedHexagonLayer;
}(_aggregationLayers.HexagonLayer);

exports["default"] = ScaleEnhancedHexagonLayer;
ScaleEnhancedHexagonLayer.layerName = 'ScaleEnhancedHexagonLayer';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL2hleGFnb24tbGF5ZXIvZW5oYW5jZWQtaGV4YWdvbi1sYXllci5qcyJdLCJuYW1lcyI6WyJoZXhhZ29uQWdncmVnYXRpb24iLCJrZXkiLCJ1cGRhdGVTdGVwcyIsInRyaWdnZXJzIiwiY2VsbFNpemUiLCJwcm9wIiwicG9zaXRpb24iLCJ1cGRhdGVUcmlnZ2VyIiwiYWdncmVnYXRvciIsInVwZGF0ZXIiLCJnZXRBZ2dyZWdhdGVkRGF0YSIsIlNjYWxlRW5oYW5jZWRIZXhhZ29uTGF5ZXIiLCJjcHVBZ2dyZWdhdG9yIiwiQ1BVQWdncmVnYXRvciIsImFnZ3JlZ2F0aW9uIiwic3RhdGUiLCJhZ2dyZWdhdG9yU3RhdGUiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwiZ2V0QXR0cmlidXRlTWFuYWdlciIsImFkZCIsInBvc2l0aW9ucyIsInNpemUiLCJhY2Nlc3NvciIsIkhleGFnb25MYXllciIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7Ozs7QUFFTyxJQUFNQSxrQkFBa0IsR0FBRztBQUNoQ0MsRUFBQUEsR0FBRyxFQUFFLFVBRDJCO0FBRWhDQyxFQUFBQSxXQUFXLEVBQUUsQ0FDWDtBQUNFRCxJQUFBQSxHQUFHLEVBQUUsV0FEUDtBQUVFRSxJQUFBQSxRQUFRLEVBQUU7QUFDUkMsTUFBQUEsUUFBUSxFQUFFO0FBQ1JDLFFBQUFBLElBQUksRUFBRTtBQURFLE9BREY7QUFJUkMsTUFBQUEsUUFBUSxFQUFFO0FBQ1JELFFBQUFBLElBQUksRUFBRSxhQURFO0FBRVJFLFFBQUFBLGFBQWEsRUFBRTtBQUZQLE9BSkY7QUFRUkMsTUFBQUEsVUFBVSxFQUFFO0FBQ1ZILFFBQUFBLElBQUksRUFBRTtBQURJO0FBUkosS0FGWjtBQWNFSSxJQUFBQSxPQUFPLEVBQUVDO0FBZFgsR0FEVztBQUZtQixDQUEzQjs7O0lBc0JjQyx5Qjs7Ozs7Ozs7Ozs7O3NDQUNEO0FBQ2hCLFVBQU1DLGFBQWEsR0FBRyxJQUFJQyx5QkFBSixDQUFrQjtBQUN0Q0MsUUFBQUEsV0FBVyxFQUFFZDtBQUR5QixPQUFsQixDQUF0QjtBQUlBLFdBQUtlLEtBQUwsR0FBYTtBQUNYSCxRQUFBQSxhQUFhLEVBQWJBLGFBRFc7QUFFWEksUUFBQUEsZUFBZSxFQUFFSixhQUFhLENBQUNHO0FBRnBCLE9BQWI7QUFJQSxVQUFNRSxnQkFBZ0IsR0FBRyxLQUFLQyxtQkFBTCxFQUF6QjtBQUNBRCxNQUFBQSxnQkFBZ0IsQ0FBQ0UsR0FBakIsQ0FBcUI7QUFDbkJDLFFBQUFBLFNBQVMsRUFBRTtBQUFDQyxVQUFBQSxJQUFJLEVBQUUsQ0FBUDtBQUFVQyxVQUFBQSxRQUFRLEVBQUU7QUFBcEI7QUFEUSxPQUFyQjtBQUdEOzs7RUFkb0RDLCtCOzs7QUFpQnZEWix5QkFBeUIsQ0FBQ2EsU0FBMUIsR0FBc0MsMkJBQXRDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtIZXhhZ29uTGF5ZXJ9IGZyb20gJ0BkZWNrLmdsL2FnZ3JlZ2F0aW9uLWxheWVycyc7XG5pbXBvcnQgQ1BVQWdncmVnYXRvciwge2dldEFnZ3JlZ2F0ZWREYXRhfSBmcm9tICcuLi9sYXllci11dGlscy9jcHUtYWdncmVnYXRvcic7XG5cbmV4cG9ydCBjb25zdCBoZXhhZ29uQWdncmVnYXRpb24gPSB7XG4gIGtleTogJ3Bvc2l0aW9uJyxcbiAgdXBkYXRlU3RlcHM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdhZ2dyZWdhdGUnLFxuICAgICAgdHJpZ2dlcnM6IHtcbiAgICAgICAgY2VsbFNpemU6IHtcbiAgICAgICAgICBwcm9wOiAncmFkaXVzJ1xuICAgICAgICB9LFxuICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgIHByb3A6ICdnZXRQb3NpdGlvbicsXG4gICAgICAgICAgdXBkYXRlVHJpZ2dlcjogJ2dldFBvc2l0aW9uJ1xuICAgICAgICB9LFxuICAgICAgICBhZ2dyZWdhdG9yOiB7XG4gICAgICAgICAgcHJvcDogJ2hleGFnb25BZ2dyZWdhdG9yJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlcjogZ2V0QWdncmVnYXRlZERhdGFcbiAgICB9XG4gIF1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYWxlRW5oYW5jZWRIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBIZXhhZ29uTGF5ZXIge1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3QgY3B1QWdncmVnYXRvciA9IG5ldyBDUFVBZ2dyZWdhdG9yKHtcbiAgICAgIGFnZ3JlZ2F0aW9uOiBoZXhhZ29uQWdncmVnYXRpb25cbiAgICB9KTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjcHVBZ2dyZWdhdG9yLFxuICAgICAgYWdncmVnYXRvclN0YXRlOiBjcHVBZ2dyZWdhdG9yLnN0YXRlXG4gICAgfTtcbiAgICBjb25zdCBhdHRyaWJ1dGVNYW5hZ2VyID0gdGhpcy5nZXRBdHRyaWJ1dGVNYW5hZ2VyKCk7XG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGQoe1xuICAgICAgcG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbid9XG4gICAgfSk7XG4gIH1cbn1cblxuU2NhbGVFbmhhbmNlZEhleGFnb25MYXllci5sYXllck5hbWUgPSAnU2NhbGVFbmhhbmNlZEhleGFnb25MYXllcic7XG4iXX0=