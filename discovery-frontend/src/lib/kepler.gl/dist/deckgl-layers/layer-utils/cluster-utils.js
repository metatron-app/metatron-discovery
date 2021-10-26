"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGeoJSON = getGeoJSON;
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _supercluster = _interopRequireDefault(require("supercluster"));

var _lodash = _interopRequireDefault(require("lodash.memoize"));

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
function getGeoJSON(data, getPosition, filterData) {
  var raw = typeof filterData === 'function' ? data.filter(filterData) : data;
  return raw.map(function (d) {
    return {
      type: 'Point',
      properties: {
        data: d,
        points: [d],
        point_count: 1,
        point_count_abbreviated: '1'
      },
      geometry: {
        coordinates: getPosition(d)
      }
    };
  }).filter(function (d) {
    return d.geometry.coordinates.every(Number.isFinite);
  });
}

var clusterResolver = function clusterResolver(_ref) {
  var clusterRadius = _ref.clusterRadius;
  return "".concat(clusterRadius);
};

var getClusterer = function getClusterer(_ref2) {
  var clusterRadius = _ref2.clusterRadius,
      geoJSON = _ref2.geoJSON;
  return new _supercluster["default"]({
    maxZoom: 20,
    radius: clusterRadius,
    reduce: function reduce(accumulated, props) {
      accumulated.points = [].concat((0, _toConsumableArray2["default"])(accumulated.points), (0, _toConsumableArray2["default"])(props.points));
    },
    map: function map(props) {
      return {
        points: [props.data]
      };
    }
  }).load(geoJSON);
};

var ClusterBuilder = /*#__PURE__*/function () {
  function ClusterBuilder() {
    (0, _classCallCheck2["default"])(this, ClusterBuilder);
    this.clusterer = (0, _lodash["default"])(getClusterer, clusterResolver);
  }

  (0, _createClass2["default"])(ClusterBuilder, [{
    key: "clustersAtZoom",
    value: function clustersAtZoom(_ref3) {
      var bbox = _ref3.bbox,
          clusterRadius = _ref3.clusterRadius,
          geoJSON = _ref3.geoJSON,
          zoom = _ref3.zoom;
      var clusterer = this.clusterer({
        clusterRadius: clusterRadius,
        geoJSON: geoJSON
      }); // map clusters to formatted bins to be passed to deck.gl bin-sorter

      var clusters = clusterer.getClusters(bbox, zoom).map(function (c, i) {
        return {
          points: c.properties.points,
          position: c.geometry.coordinates,
          index: i
        };
      });
      return clusters;
    }
  }, {
    key: "clearClustererCache",
    value: function clearClustererCache() {
      this.clusterer.cache.clear();
    }
  }]);
  return ClusterBuilder;
}();

exports["default"] = ClusterBuilder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL2xheWVyLXV0aWxzL2NsdXN0ZXItdXRpbHMuanMiXSwibmFtZXMiOlsiZ2V0R2VvSlNPTiIsImRhdGEiLCJnZXRQb3NpdGlvbiIsImZpbHRlckRhdGEiLCJyYXciLCJmaWx0ZXIiLCJtYXAiLCJkIiwidHlwZSIsInByb3BlcnRpZXMiLCJwb2ludHMiLCJwb2ludF9jb3VudCIsInBvaW50X2NvdW50X2FiYnJldmlhdGVkIiwiZ2VvbWV0cnkiLCJjb29yZGluYXRlcyIsImV2ZXJ5IiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJjbHVzdGVyUmVzb2x2ZXIiLCJjbHVzdGVyUmFkaXVzIiwiZ2V0Q2x1c3RlcmVyIiwiZ2VvSlNPTiIsIlN1cGVyY2x1c3RlciIsIm1heFpvb20iLCJyYWRpdXMiLCJyZWR1Y2UiLCJhY2N1bXVsYXRlZCIsInByb3BzIiwibG9hZCIsIkNsdXN0ZXJCdWlsZGVyIiwiY2x1c3RlcmVyIiwiYmJveCIsInpvb20iLCJjbHVzdGVycyIsImdldENsdXN0ZXJzIiwiYyIsImkiLCJwb3NpdGlvbiIsImluZGV4IiwiY2FjaGUiLCJjbGVhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLTyxTQUFTQSxVQUFULENBQW9CQyxJQUFwQixFQUEwQkMsV0FBMUIsRUFBdUNDLFVBQXZDLEVBQW1EO0FBQ3hELE1BQU1DLEdBQUcsR0FBRyxPQUFPRCxVQUFQLEtBQXNCLFVBQXRCLEdBQW1DRixJQUFJLENBQUNJLE1BQUwsQ0FBWUYsVUFBWixDQUFuQyxHQUE2REYsSUFBekU7QUFFQSxTQUFPRyxHQUFHLENBQ1BFLEdBREksQ0FDQSxVQUFBQyxDQUFDO0FBQUEsV0FBSztBQUNUQyxNQUFBQSxJQUFJLEVBQUUsT0FERztBQUVUQyxNQUFBQSxVQUFVLEVBQUU7QUFDVlIsUUFBQUEsSUFBSSxFQUFFTSxDQURJO0FBRVZHLFFBQUFBLE1BQU0sRUFBRSxDQUFDSCxDQUFELENBRkU7QUFHVkksUUFBQUEsV0FBVyxFQUFFLENBSEg7QUFJVkMsUUFBQUEsdUJBQXVCLEVBQUU7QUFKZixPQUZIO0FBUVRDLE1BQUFBLFFBQVEsRUFBRTtBQUNSQyxRQUFBQSxXQUFXLEVBQUVaLFdBQVcsQ0FBQ0ssQ0FBRDtBQURoQjtBQVJELEtBQUw7QUFBQSxHQURELEVBYUpGLE1BYkksQ0FhRyxVQUFBRSxDQUFDO0FBQUEsV0FBSUEsQ0FBQyxDQUFDTSxRQUFGLENBQVdDLFdBQVgsQ0FBdUJDLEtBQXZCLENBQTZCQyxNQUFNLENBQUNDLFFBQXBDLENBQUo7QUFBQSxHQWJKLENBQVA7QUFjRDs7QUFFRCxJQUFNQyxlQUFlLEdBQUcsU0FBbEJBLGVBQWtCO0FBQUEsTUFBRUMsYUFBRixRQUFFQSxhQUFGO0FBQUEsbUJBQXdCQSxhQUF4QjtBQUFBLENBQXhCOztBQUVBLElBQU1DLFlBQVksR0FBRyxTQUFmQSxZQUFlO0FBQUEsTUFBRUQsYUFBRixTQUFFQSxhQUFGO0FBQUEsTUFBaUJFLE9BQWpCLFNBQWlCQSxPQUFqQjtBQUFBLFNBQ25CLElBQUlDLHdCQUFKLENBQWlCO0FBQ2ZDLElBQUFBLE9BQU8sRUFBRSxFQURNO0FBRWZDLElBQUFBLE1BQU0sRUFBRUwsYUFGTztBQUdmTSxJQUFBQSxNQUFNLEVBQUUsZ0JBQUNDLFdBQUQsRUFBY0MsS0FBZCxFQUF3QjtBQUM5QkQsTUFBQUEsV0FBVyxDQUFDaEIsTUFBWixpREFBeUJnQixXQUFXLENBQUNoQixNQUFyQyx1Q0FBZ0RpQixLQUFLLENBQUNqQixNQUF0RDtBQUNELEtBTGM7QUFNZkosSUFBQUEsR0FBRyxFQUFFLGFBQUFxQixLQUFLO0FBQUEsYUFBSztBQUFDakIsUUFBQUEsTUFBTSxFQUFFLENBQUNpQixLQUFLLENBQUMxQixJQUFQO0FBQVQsT0FBTDtBQUFBO0FBTkssR0FBakIsRUFPRzJCLElBUEgsQ0FPUVAsT0FQUixDQURtQjtBQUFBLENBQXJCOztJQVVxQlEsYztBQUNuQiw0QkFBYztBQUFBO0FBQ1osU0FBS0MsU0FBTCxHQUFpQix3QkFBUVYsWUFBUixFQUFzQkYsZUFBdEIsQ0FBakI7QUFDRDs7OzswQ0FFb0Q7QUFBQSxVQUFyQ2EsSUFBcUMsU0FBckNBLElBQXFDO0FBQUEsVUFBL0JaLGFBQStCLFNBQS9CQSxhQUErQjtBQUFBLFVBQWhCRSxPQUFnQixTQUFoQkEsT0FBZ0I7QUFBQSxVQUFQVyxJQUFPLFNBQVBBLElBQU87QUFDbkQsVUFBTUYsU0FBUyxHQUFHLEtBQUtBLFNBQUwsQ0FBZTtBQUFDWCxRQUFBQSxhQUFhLEVBQWJBLGFBQUQ7QUFBZ0JFLFFBQUFBLE9BQU8sRUFBUEE7QUFBaEIsT0FBZixDQUFsQixDQURtRCxDQUduRDs7QUFDQSxVQUFNWSxRQUFRLEdBQUdILFNBQVMsQ0FBQ0ksV0FBVixDQUFzQkgsSUFBdEIsRUFBNEJDLElBQTVCLEVBQWtDMUIsR0FBbEMsQ0FBc0MsVUFBQzZCLENBQUQsRUFBSUMsQ0FBSjtBQUFBLGVBQVc7QUFDaEUxQixVQUFBQSxNQUFNLEVBQUV5QixDQUFDLENBQUMxQixVQUFGLENBQWFDLE1BRDJDO0FBRWhFMkIsVUFBQUEsUUFBUSxFQUFFRixDQUFDLENBQUN0QixRQUFGLENBQVdDLFdBRjJDO0FBR2hFd0IsVUFBQUEsS0FBSyxFQUFFRjtBQUh5RCxTQUFYO0FBQUEsT0FBdEMsQ0FBakI7QUFNQSxhQUFPSCxRQUFQO0FBQ0Q7OzswQ0FFcUI7QUFDcEIsV0FBS0gsU0FBTCxDQUFlUyxLQUFmLENBQXFCQyxLQUFyQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFN1cGVyY2x1c3RlciBmcm9tICdzdXBlcmNsdXN0ZXInO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoLm1lbW9pemUnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2VvSlNPTihkYXRhLCBnZXRQb3NpdGlvbiwgZmlsdGVyRGF0YSkge1xuICBjb25zdCByYXcgPSB0eXBlb2YgZmlsdGVyRGF0YSA9PT0gJ2Z1bmN0aW9uJyA/IGRhdGEuZmlsdGVyKGZpbHRlckRhdGEpIDogZGF0YTtcblxuICByZXR1cm4gcmF3XG4gICAgLm1hcChkID0+ICh7XG4gICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBkYXRhOiBkLFxuICAgICAgICBwb2ludHM6IFtkXSxcbiAgICAgICAgcG9pbnRfY291bnQ6IDEsXG4gICAgICAgIHBvaW50X2NvdW50X2FiYnJldmlhdGVkOiAnMSdcbiAgICAgIH0sXG4gICAgICBnZW9tZXRyeToge1xuICAgICAgICBjb29yZGluYXRlczogZ2V0UG9zaXRpb24oZClcbiAgICAgIH1cbiAgICB9KSlcbiAgICAuZmlsdGVyKGQgPT4gZC5nZW9tZXRyeS5jb29yZGluYXRlcy5ldmVyeShOdW1iZXIuaXNGaW5pdGUpKTtcbn1cblxuY29uc3QgY2x1c3RlclJlc29sdmVyID0gKHtjbHVzdGVyUmFkaXVzfSkgPT4gYCR7Y2x1c3RlclJhZGl1c31gO1xuXG5jb25zdCBnZXRDbHVzdGVyZXIgPSAoe2NsdXN0ZXJSYWRpdXMsIGdlb0pTT059KSA9PlxuICBuZXcgU3VwZXJjbHVzdGVyKHtcbiAgICBtYXhab29tOiAyMCxcbiAgICByYWRpdXM6IGNsdXN0ZXJSYWRpdXMsXG4gICAgcmVkdWNlOiAoYWNjdW11bGF0ZWQsIHByb3BzKSA9PiB7XG4gICAgICBhY2N1bXVsYXRlZC5wb2ludHMgPSBbLi4uYWNjdW11bGF0ZWQucG9pbnRzLCAuLi5wcm9wcy5wb2ludHNdO1xuICAgIH0sXG4gICAgbWFwOiBwcm9wcyA9PiAoe3BvaW50czogW3Byb3BzLmRhdGFdfSlcbiAgfSkubG9hZChnZW9KU09OKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsdXN0ZXJlciA9IG1lbW9pemUoZ2V0Q2x1c3RlcmVyLCBjbHVzdGVyUmVzb2x2ZXIpO1xuICB9XG5cbiAgY2x1c3RlcnNBdFpvb20oe2Jib3gsIGNsdXN0ZXJSYWRpdXMsIGdlb0pTT04sIHpvb219KSB7XG4gICAgY29uc3QgY2x1c3RlcmVyID0gdGhpcy5jbHVzdGVyZXIoe2NsdXN0ZXJSYWRpdXMsIGdlb0pTT059KTtcblxuICAgIC8vIG1hcCBjbHVzdGVycyB0byBmb3JtYXR0ZWQgYmlucyB0byBiZSBwYXNzZWQgdG8gZGVjay5nbCBiaW4tc29ydGVyXG4gICAgY29uc3QgY2x1c3RlcnMgPSBjbHVzdGVyZXIuZ2V0Q2x1c3RlcnMoYmJveCwgem9vbSkubWFwKChjLCBpKSA9PiAoe1xuICAgICAgcG9pbnRzOiBjLnByb3BlcnRpZXMucG9pbnRzLFxuICAgICAgcG9zaXRpb246IGMuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICBpbmRleDogaVxuICAgIH0pKTtcblxuICAgIHJldHVybiBjbHVzdGVycztcbiAgfVxuXG4gIGNsZWFyQ2x1c3RlcmVyQ2FjaGUoKSB7XG4gICAgdGhpcy5jbHVzdGVyZXIuY2FjaGUuY2xlYXIoKTtcbiAgfVxufVxuIl19