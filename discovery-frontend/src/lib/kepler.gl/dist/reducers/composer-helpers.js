"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.payload_ = payload_;
exports.apply_ = apply_;
exports.with_ = with_;
exports.if_ = if_;
exports.compose_ = compose_;
exports.merge_ = merge_;
exports.pick_ = pick_;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _console = _interopRequireDefault(require("global/console"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var identity = function identity(state) {
  return state;
};
/* eslint-disable no-unused-vars */
// @ts-ignore


function log(text) {
  return function (value) {
    return _console["default"].log(text, value);
  };
}
/* eslint-enable no-unused-vars */


function payload_(p) {
  return {
    payload: p
  };
}

function apply_(updater, payload) {
  return function (state) {
    return updater(state, payload);
  };
}

function with_(fn) {
  return function (state) {
    return fn(state)(state);
  };
}

function if_(pred, fn) {
  return pred ? fn : identity;
}

function compose_(fns) {
  return function (state) {
    return fns.reduce(function (state2, fn) {
      return fn(state2);
    }, state);
  };
}

function merge_(obj) {
  return function (state) {
    return _objectSpread(_objectSpread({}, state), obj);
  };
}

function pick_(prop) {
  return function (fn) {
    return function (state) {
      return _objectSpread(_objectSpread({}, state), {}, (0, _defineProperty2["default"])({}, prop, fn(state[prop])));
    };
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy9jb21wb3Nlci1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbImlkZW50aXR5Iiwic3RhdGUiLCJsb2ciLCJ0ZXh0IiwidmFsdWUiLCJDb25zb2xlIiwicGF5bG9hZF8iLCJwIiwicGF5bG9hZCIsImFwcGx5XyIsInVwZGF0ZXIiLCJ3aXRoXyIsImZuIiwiaWZfIiwicHJlZCIsImNvbXBvc2VfIiwiZm5zIiwicmVkdWNlIiwic3RhdGUyIiwibWVyZ2VfIiwib2JqIiwicGlja18iLCJwcm9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7OztBQUVBLElBQU1BLFFBQVEsR0FBRyxTQUFYQSxRQUFXLENBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFKO0FBQUEsQ0FBdEI7QUFFQTtBQUNBOzs7QUFDTyxTQUFTQyxHQUFULENBQWFDLElBQWIsRUFBbUI7QUFDeEIsU0FBTyxVQUFBQyxLQUFLO0FBQUEsV0FBSUMsb0JBQVFILEdBQVIsQ0FBWUMsSUFBWixFQUFrQkMsS0FBbEIsQ0FBSjtBQUFBLEdBQVo7QUFDRDtBQUNEOzs7QUFFTyxTQUFTRSxRQUFULENBQWtCQyxDQUFsQixFQUFxQjtBQUMxQixTQUFPO0FBQUNDLElBQUFBLE9BQU8sRUFBRUQ7QUFBVixHQUFQO0FBQ0Q7O0FBRU0sU0FBU0UsTUFBVCxDQUFnQkMsT0FBaEIsRUFBeUJGLE9BQXpCLEVBQWtDO0FBQ3ZDLFNBQU8sVUFBQVAsS0FBSztBQUFBLFdBQUlTLE9BQU8sQ0FBQ1QsS0FBRCxFQUFRTyxPQUFSLENBQVg7QUFBQSxHQUFaO0FBQ0Q7O0FBRU0sU0FBU0csS0FBVCxDQUFlQyxFQUFmLEVBQW1CO0FBQ3hCLFNBQU8sVUFBQVgsS0FBSztBQUFBLFdBQUlXLEVBQUUsQ0FBQ1gsS0FBRCxDQUFGLENBQVVBLEtBQVYsQ0FBSjtBQUFBLEdBQVo7QUFDRDs7QUFFTSxTQUFTWSxHQUFULENBQWFDLElBQWIsRUFBbUJGLEVBQW5CLEVBQXVCO0FBQzVCLFNBQU9FLElBQUksR0FBR0YsRUFBSCxHQUFRWixRQUFuQjtBQUNEOztBQUVNLFNBQVNlLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCO0FBQzVCLFNBQU8sVUFBQWYsS0FBSztBQUFBLFdBQUllLEdBQUcsQ0FBQ0MsTUFBSixDQUFXLFVBQUNDLE1BQUQsRUFBU04sRUFBVDtBQUFBLGFBQWdCQSxFQUFFLENBQUNNLE1BQUQsQ0FBbEI7QUFBQSxLQUFYLEVBQXVDakIsS0FBdkMsQ0FBSjtBQUFBLEdBQVo7QUFDRDs7QUFFTSxTQUFTa0IsTUFBVCxDQUFnQkMsR0FBaEIsRUFBcUI7QUFDMUIsU0FBTyxVQUFBbkIsS0FBSztBQUFBLDJDQUFTQSxLQUFULEdBQW1CbUIsR0FBbkI7QUFBQSxHQUFaO0FBQ0Q7O0FBRU0sU0FBU0MsS0FBVCxDQUFlQyxJQUFmLEVBQXFCO0FBQzFCLFNBQU8sVUFBQVYsRUFBRTtBQUFBLFdBQUksVUFBQVgsS0FBSztBQUFBLDZDQUFTQSxLQUFULDRDQUFpQnFCLElBQWpCLEVBQXdCVixFQUFFLENBQUNYLEtBQUssQ0FBQ3FCLElBQUQsQ0FBTixDQUExQjtBQUFBLEtBQVQ7QUFBQSxHQUFUO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgQ29uc29sZSBmcm9tICdnbG9iYWwvY29uc29sZSc7XG5cbmNvbnN0IGlkZW50aXR5ID0gc3RhdGUgPT4gc3RhdGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gbG9nKHRleHQpIHtcbiAgcmV0dXJuIHZhbHVlID0+IENvbnNvbGUubG9nKHRleHQsIHZhbHVlKTtcbn1cbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBheWxvYWRfKHApIHtcbiAgcmV0dXJuIHtwYXlsb2FkOiBwfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Xyh1cGRhdGVyLCBwYXlsb2FkKSB7XG4gIHJldHVybiBzdGF0ZSA9PiB1cGRhdGVyKHN0YXRlLCBwYXlsb2FkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhfKGZuKSB7XG4gIHJldHVybiBzdGF0ZSA9PiBmbihzdGF0ZSkoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWZfKHByZWQsIGZuKSB7XG4gIHJldHVybiBwcmVkID8gZm4gOiBpZGVudGl0eTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VfKGZucykge1xuICByZXR1cm4gc3RhdGUgPT4gZm5zLnJlZHVjZSgoc3RhdGUyLCBmbikgPT4gZm4oc3RhdGUyKSwgc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VfKG9iaikge1xuICByZXR1cm4gc3RhdGUgPT4gKHsuLi5zdGF0ZSwgLi4ub2JqfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrXyhwcm9wKSB7XG4gIHJldHVybiBmbiA9PiBzdGF0ZSA9PiAoey4uLnN0YXRlLCBbcHJvcF06IGZuKHN0YXRlW3Byb3BdKX0pO1xufVxuIl19