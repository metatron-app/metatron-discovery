"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideInitialState = provideInitialState;
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _reduxActions = require("redux-actions");

var _actionWrapper = require("../actions/action-wrapper");

var _actions = require("../actions/actions");

var _core = require("./core");

var _actionTypes = _interopRequireDefault(require("../constants/action-types"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// INITIAL_STATE
var initialCoreState = {};

function provideInitialState(initialState) {
  var coreReducer = (0, _core.coreReducerFactory)(initialState);

  var handleRegisterEntry = function handleRegisterEntry(state, _ref) {
    var _ref$payload = _ref.payload,
        id = _ref$payload.id,
        mint = _ref$payload.mint,
        mapboxApiAccessToken = _ref$payload.mapboxApiAccessToken,
        mapboxApiUrl = _ref$payload.mapboxApiUrl,
        mapStylesReplaceDefault = _ref$payload.mapStylesReplaceDefault,
        initialUiState = _ref$payload.initialUiState;
    // by default, always create a mint state even if the same id already exist
    // if state.id exist and mint=false, keep the existing state
    var previousState = state[id] && mint === false ? state[id] : undefined;
    return _objectSpread(_objectSpread({}, state), {}, (0, _defineProperty2["default"])({}, id, coreReducer(previousState, (0, _actions.keplerGlInit)({
      mapboxApiAccessToken: mapboxApiAccessToken,
      mapboxApiUrl: mapboxApiUrl,
      mapStylesReplaceDefault: mapStylesReplaceDefault,
      initialUiState: initialUiState
    }))));
  };

  var handleDeleteEntry = function handleDeleteEntry(state, _ref2) {
    var id = _ref2.payload;
    return Object.keys(state).reduce(function (accu, curr) {
      return _objectSpread(_objectSpread({}, accu), curr === id ? {} : (0, _defineProperty2["default"])({}, curr, state[curr]));
    }, {});
  };

  var handleRenameEntry = function handleRenameEntry(state, _ref4) {
    var _ref4$payload = _ref4.payload,
        oldId = _ref4$payload.oldId,
        newId = _ref4$payload.newId;
    return Object.keys(state).reduce(function (accu, curr) {
      return _objectSpread(_objectSpread({}, accu), (0, _defineProperty2["default"])({}, curr === oldId ? newId : curr, state[curr]));
    }, {});
  };

  return function () {
    var _handleActions;

    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialCoreState;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    // update child states
    Object.keys(state).forEach(function (id) {
      var updateItemState = coreReducer(state[id], (0, _actionWrapper._actionFor)(id, action));
      state = (0, _actionWrapper._updateProperty)(state, id, updateItemState);
    }); // perform additional state reducing (e.g. switch action.type etc...)

    return (0, _reduxActions.handleActions)((_handleActions = {}, (0, _defineProperty2["default"])(_handleActions, _actionTypes["default"].REGISTER_ENTRY, handleRegisterEntry), (0, _defineProperty2["default"])(_handleActions, _actionTypes["default"].DELETE_ENTRY, handleDeleteEntry), (0, _defineProperty2["default"])(_handleActions, _actionTypes["default"].RENAME_ENTRY, handleRenameEntry), _handleActions), initialCoreState)(state, action);
  };
}

var _keplerGlReducer = provideInitialState();

function mergeInitialState() {
  var saved = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var provided = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var keys = ['mapState', 'mapStyle', 'visState', 'uiState']; // shallow merge each reducer

  return keys.reduce(function (accu, key) {
    return _objectSpread(_objectSpread({}, accu), saved[key] && provided[key] ? (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, saved[key]), provided[key])) : (0, _defineProperty2["default"])({}, key, saved[key] || provided[key] || {}));
  }, {});
}

function decorate(target) {
  var savedInitialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var targetInitialState = savedInitialState;
  /**
   * Returns a kepler.gl reducer that will also pass each action through additional reducers spiecified.
   * The parameter should be either a reducer map or a reducer function.
   * The state passed into the additional action handler is the instance state.
   * It will include all the subreducers `visState`, `uiState`, `mapState` and `mapStyle`.
   * `.plugin` is only meant to be called once when mounting the keplerGlReducer to the store.
   * **Note** This is an advanced option to give you more freedom to modify the internal state of the kepler.gl instance.
   * You should only use this to adding additional actions instead of replacing default actions.
   *
   * @mixin keplerGlReducer.plugin
   * @memberof keplerGlReducer
   * @param {Object|Function} customReducer - A reducer map or a reducer
   * @public
   * @example
   * const myKeplerGlReducer = keplerGlReducer
   *  .plugin({
   *    // 1. as reducer map
   *    HIDE_AND_SHOW_SIDE_PANEL: (state, action) => ({
   *      ...state,
   *      uiState: {
   *        ...state.uiState,
   *        readOnly: !state.uiState.readOnly
   *      }
   *    })
   *  })
   * .plugin(handleActions({
   *   // 2. as reducer
   *   'HIDE_MAP_CONTROLS': (state, action) => ({
   *     ...state,
   *     uiState: {
   *       ...state.uiState,
   *       mapControls: hiddenMapControl
   *     }
   *   })
   * }, {}));
   */

  target.plugin = function plugin(customReducer) {
    var _this = this;

    if ((0, _typeof2["default"])(customReducer) === 'object') {
      // if only provided a reducerMap, wrap it in a reducer
      customReducer = (0, _reduxActions.handleActions)(customReducer, {});
    } // use 'function' keyword to enable 'this'


    return decorate(function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var nextState = _this(state, action); // for each entry in the staten


      Object.keys(nextState).forEach(function (id) {
        // update child states
        nextState = (0, _actionWrapper._updateProperty)(nextState, id, customReducer(nextState[id], (0, _actionWrapper._actionFor)(id, action)));
      });
      return nextState;
    });
  };
  /**
   * Return a reducer that initiated with custom initial state.
   * The parameter should be an object mapping from `subreducer` name to custom subreducer state,
   * which will be shallow **merged** with default initial state.
   *
   * Default subreducer state:
   *  - [`visState`](./vis-state.md#INITIAL_VIS_STATE)
   *  - [`mapState`](./map-state.md#INITIAL_MAP_STATE)
   *  - [`mapStyle`](./map-style.md#INITIAL_MAP_STYLE)
   *  - [`uiState`](./ui-state.md#INITIAL_UI_STATE)
   * @mixin keplerGlReducer.initialState
   * @memberof keplerGlReducer
   * @param {Object} iniSt - custom state to be merged with default initial state
   * @public
   * @example
   * const myKeplerGlReducer = keplerGlReducer
   *  .initialState({
   *    uiState: {readOnly: true}
   *  });
   */


  target.initialState = function initialState(iniSt) {
    var merged = mergeInitialState(targetInitialState, iniSt);
    var targetReducer = provideInitialState(merged);
    return decorate(targetReducer, merged);
  };

  return target;
}
/**
 * Kepler.gl reducer to be mounted to your store. You can mount `keplerGlReducer` at property `keplerGl`, if you choose
 * to mount it at another address e.g. `foo` you will need to specify it when you mount `KeplerGl` component in your app with `getState: state => state.foo`
 * @public
 * @example
 * import keplerGlReducer from 'kepler.gl/reducers';
 * import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
 * import {taskMiddleware} from 'react-palm/tasks';
 *
 * const initialState = {};
 * const reducers = combineReducers({
 *   // <-- mount kepler.gl reducer in your app
 *   keplerGl: keplerGlReducer,
 *
 *   // Your other reducers here
 *   app: appReducer
 * });
 *
 * // using createStore
 * export default createStore(reducer, initialState, applyMiddleware(taskMiddleware));
 */


var keplerGlReducer = decorate(_keplerGlReducer);
var _default = keplerGlReducer;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy9yb290LmpzIl0sIm5hbWVzIjpbImluaXRpYWxDb3JlU3RhdGUiLCJwcm92aWRlSW5pdGlhbFN0YXRlIiwiaW5pdGlhbFN0YXRlIiwiY29yZVJlZHVjZXIiLCJoYW5kbGVSZWdpc3RlckVudHJ5Iiwic3RhdGUiLCJwYXlsb2FkIiwiaWQiLCJtaW50IiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJtYXBib3hBcGlVcmwiLCJtYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCIsImluaXRpYWxVaVN0YXRlIiwicHJldmlvdXNTdGF0ZSIsInVuZGVmaW5lZCIsImhhbmRsZURlbGV0ZUVudHJ5IiwiT2JqZWN0Iiwia2V5cyIsInJlZHVjZSIsImFjY3UiLCJjdXJyIiwiaGFuZGxlUmVuYW1lRW50cnkiLCJvbGRJZCIsIm5ld0lkIiwiYWN0aW9uIiwiZm9yRWFjaCIsInVwZGF0ZUl0ZW1TdGF0ZSIsIkFjdGlvblR5cGVzIiwiUkVHSVNURVJfRU5UUlkiLCJERUxFVEVfRU5UUlkiLCJSRU5BTUVfRU5UUlkiLCJfa2VwbGVyR2xSZWR1Y2VyIiwibWVyZ2VJbml0aWFsU3RhdGUiLCJzYXZlZCIsInByb3ZpZGVkIiwia2V5IiwiZGVjb3JhdGUiLCJ0YXJnZXQiLCJzYXZlZEluaXRpYWxTdGF0ZSIsInRhcmdldEluaXRpYWxTdGF0ZSIsInBsdWdpbiIsImN1c3RvbVJlZHVjZXIiLCJuZXh0U3RhdGUiLCJpbmlTdCIsIm1lcmdlZCIsInRhcmdldFJlZHVjZXIiLCJrZXBsZXJHbFJlZHVjZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBLElBQU1BLGdCQUFnQixHQUFHLEVBQXpCOztBQUVPLFNBQVNDLG1CQUFULENBQTZCQyxZQUE3QixFQUEyQztBQUNoRCxNQUFNQyxXQUFXLEdBQUcsOEJBQW1CRCxZQUFuQixDQUFwQjs7QUFFQSxNQUFNRSxtQkFBbUIsR0FBRyxT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MkMsQ0FHM0M7OztBQUNBUixNQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWXlCLFNBQVosRUFBdUJqQixPQUF2QixDQUErQixVQUFBbEIsRUFBRSxFQUFJO0FBQ25DO0FBQ0FtQyxRQUFBQSxTQUFTLEdBQUcsb0NBQ1ZBLFNBRFUsRUFFVm5DLEVBRlUsRUFHVmtDLGFBQWEsQ0FBQ0MsU0FBUyxDQUFDbkMsRUFBRCxDQUFWLEVBQWdCLCtCQUFXQSxFQUFYLEVBQWVpQixNQUFmLENBQWhCLENBSEgsQ0FBWjtBQUtELE9BUEQ7QUFTQSxhQUFPa0IsU0FBUDtBQUNELEtBZGMsQ0FBZjtBQWVELEdBdEJEO0FBd0JBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBTCxFQUFBQSxNQUFNLENBQUNuQyxZQUFQLEdBQXNCLFNBQVNBLFlBQVQsQ0FBc0J5QyxLQUF0QixFQUE2QjtBQUNqRCxRQUFNQyxNQUFNLEdBQUdaLGlCQUFpQixDQUFDTyxrQkFBRCxFQUFxQkksS0FBckIsQ0FBaEM7QUFDQSxRQUFNRSxhQUFhLEdBQUc1QyxtQkFBbUIsQ0FBQzJDLE1BQUQsQ0FBekM7QUFFQSxXQUFPUixRQUFRLENBQUNTLGFBQUQsRUFBZ0JELE1BQWhCLENBQWY7QUFDRCxHQUxEOztBQU9BLFNBQU9QLE1BQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQSxJQUFNUyxlQUFlLEdBQUdWLFFBQVEsQ0FBQ0wsZ0JBQUQsQ0FBaEM7ZUFDZWUsZSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAyMCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7aGFuZGxlQWN0aW9uc30gZnJvbSAncmVkdXgtYWN0aW9ucyc7XG5cbmltcG9ydCB7X2FjdGlvbkZvciwgX3VwZGF0ZVByb3BlcnR5fSBmcm9tICcuLi9hY3Rpb25zL2FjdGlvbi13cmFwcGVyJztcbmltcG9ydCB7a2VwbGVyR2xJbml0fSBmcm9tICcuLi9hY3Rpb25zL2FjdGlvbnMnO1xuaW1wb3J0IHtjb3JlUmVkdWNlckZhY3Rvcnl9IGZyb20gJy4vY29yZSc7XG5pbXBvcnQgQWN0aW9uVHlwZXMgZnJvbSAnY29uc3RhbnRzL2FjdGlvbi10eXBlcyc7XG5cbi8vIElOSVRJQUxfU1RBVEVcbmNvbnN0IGluaXRpYWxDb3JlU3RhdGUgPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVJbml0aWFsU3RhdGUoaW5pdGlhbFN0YXRlKSB7XG4gIGNvbnN0IGNvcmVSZWR1Y2VyID0gY29yZVJlZHVjZXJGYWN0b3J5KGluaXRpYWxTdGF0ZSk7XG5cbiAgY29uc3QgaGFuZGxlUmVnaXN0ZXJFbnRyeSA9IChcbiAgICBzdGF0ZSxcbiAgICB7XG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlkLFxuICAgICAgICBtaW50LFxuICAgICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbixcbiAgICAgICAgbWFwYm94QXBpVXJsLFxuICAgICAgICBtYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCxcbiAgICAgICAgaW5pdGlhbFVpU3RhdGVcbiAgICAgIH1cbiAgICB9XG4gICkgPT4ge1xuICAgIC8vIGJ5IGRlZmF1bHQsIGFsd2F5cyBjcmVhdGUgYSBtaW50IHN0YXRlIGV2ZW4gaWYgdGhlIHNhbWUgaWQgYWxyZWFkeSBleGlzdFxuICAgIC8vIGlmIHN0YXRlLmlkIGV4aXN0IGFuZCBtaW50PWZhbHNlLCBrZWVwIHRoZSBleGlzdGluZyBzdGF0ZVxuICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBzdGF0ZVtpZF0gJiYgbWludCA9PT0gZmFsc2UgPyBzdGF0ZVtpZF0gOiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLy8gcmVnaXN0ZXIgZW50cnkgdG8ga2VwbGVyLmdsIHBhc3NpbmcgaW4gbWFwYm94IGNvbmZpZyB0byBtYXBTdHlsZVxuICAgICAgLi4uc3RhdGUsXG4gICAgICBbaWRdOiBjb3JlUmVkdWNlcihcbiAgICAgICAgcHJldmlvdXNTdGF0ZSxcbiAgICAgICAga2VwbGVyR2xJbml0KHttYXBib3hBcGlBY2Nlc3NUb2tlbiwgbWFwYm94QXBpVXJsLCBtYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCwgaW5pdGlhbFVpU3RhdGV9KVxuICAgICAgKVxuICAgIH07XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRGVsZXRlRW50cnkgPSAoc3RhdGUsIHtwYXlsb2FkOiBpZH0pID0+XG4gICAgT2JqZWN0LmtleXMoc3RhdGUpLnJlZHVjZShcbiAgICAgIChhY2N1LCBjdXJyKSA9PiAoe1xuICAgICAgICAuLi5hY2N1LFxuICAgICAgICAuLi4oY3VyciA9PT0gaWQgPyB7fSA6IHtbY3Vycl06IHN0YXRlW2N1cnJdfSlcbiAgICAgIH0pLFxuICAgICAge31cbiAgICApO1xuXG4gIGNvbnN0IGhhbmRsZVJlbmFtZUVudHJ5ID0gKHN0YXRlLCB7cGF5bG9hZDoge29sZElkLCBuZXdJZH19KSA9PlxuICAgIE9iamVjdC5rZXlzKHN0YXRlKS5yZWR1Y2UoXG4gICAgICAoYWNjdSwgY3VycikgPT4gKHtcbiAgICAgICAgLi4uYWNjdSxcbiAgICAgICAgLi4ue1tjdXJyID09PSBvbGRJZCA/IG5ld0lkIDogY3Vycl06IHN0YXRlW2N1cnJdfVxuICAgICAgfSksXG4gICAgICB7fVxuICAgICk7XG5cbiAgcmV0dXJuIChzdGF0ZSA9IGluaXRpYWxDb3JlU3RhdGUsIGFjdGlvbikgPT4ge1xuICAgIC8vIHVwZGF0ZSBjaGlsZCBzdGF0ZXNcbiAgICBPYmplY3Qua2V5cyhzdGF0ZSkuZm9yRWFjaChpZCA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVJdGVtU3RhdGUgPSBjb3JlUmVkdWNlcihzdGF0ZVtpZF0sIF9hY3Rpb25Gb3IoaWQsIGFjdGlvbikpO1xuICAgICAgc3RhdGUgPSBfdXBkYXRlUHJvcGVydHkoc3RhdGUsIGlkLCB1cGRhdGVJdGVtU3RhdGUpO1xuICAgIH0pO1xuXG4gICAgLy8gcGVyZm9ybSBhZGRpdGlvbmFsIHN0YXRlIHJlZHVjaW5nIChlLmcuIHN3aXRjaCBhY3Rpb24udHlwZSBldGMuLi4pXG4gICAgcmV0dXJuIGhhbmRsZUFjdGlvbnMoXG4gICAgICB7XG4gICAgICAgIFtBY3Rpb25UeXBlcy5SRUdJU1RFUl9FTlRSWV06IGhhbmRsZVJlZ2lzdGVyRW50cnksXG4gICAgICAgIFtBY3Rpb25UeXBlcy5ERUxFVEVfRU5UUlldOiBoYW5kbGVEZWxldGVFbnRyeSxcbiAgICAgICAgW0FjdGlvblR5cGVzLlJFTkFNRV9FTlRSWV06IGhhbmRsZVJlbmFtZUVudHJ5XG4gICAgICB9LFxuICAgICAgaW5pdGlhbENvcmVTdGF0ZVxuICAgICkoc3RhdGUsIGFjdGlvbik7XG4gIH07XG59XG5cbmNvbnN0IF9rZXBsZXJHbFJlZHVjZXIgPSBwcm92aWRlSW5pdGlhbFN0YXRlKCk7XG5cbmZ1bmN0aW9uIG1lcmdlSW5pdGlhbFN0YXRlKHNhdmVkID0ge30sIHByb3ZpZGVkID0ge30pIHtcbiAgY29uc3Qga2V5cyA9IFsnbWFwU3RhdGUnLCAnbWFwU3R5bGUnLCAndmlzU3RhdGUnLCAndWlTdGF0ZSddO1xuXG4gIC8vIHNoYWxsb3cgbWVyZ2UgZWFjaCByZWR1Y2VyXG4gIHJldHVybiBrZXlzLnJlZHVjZShcbiAgICAoYWNjdSwga2V5KSA9PiAoe1xuICAgICAgLi4uYWNjdSxcbiAgICAgIC4uLihzYXZlZFtrZXldICYmIHByb3ZpZGVkW2tleV1cbiAgICAgICAgPyB7W2tleV06IHsuLi5zYXZlZFtrZXldLCAuLi5wcm92aWRlZFtrZXldfX1cbiAgICAgICAgOiB7W2tleV06IHNhdmVkW2tleV0gfHwgcHJvdmlkZWRba2V5XSB8fCB7fX0pXG4gICAgfSksXG4gICAge31cbiAgKTtcbn1cblxuZnVuY3Rpb24gZGVjb3JhdGUodGFyZ2V0LCBzYXZlZEluaXRpYWxTdGF0ZSA9IHt9KSB7XG4gIGNvbnN0IHRhcmdldEluaXRpYWxTdGF0ZSA9IHNhdmVkSW5pdGlhbFN0YXRlO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEga2VwbGVyLmdsIHJlZHVjZXIgdGhhdCB3aWxsIGFsc28gcGFzcyBlYWNoIGFjdGlvbiB0aHJvdWdoIGFkZGl0aW9uYWwgcmVkdWNlcnMgc3BpZWNpZmllZC5cbiAgICogVGhlIHBhcmFtZXRlciBzaG91bGQgYmUgZWl0aGVyIGEgcmVkdWNlciBtYXAgb3IgYSByZWR1Y2VyIGZ1bmN0aW9uLlxuICAgKiBUaGUgc3RhdGUgcGFzc2VkIGludG8gdGhlIGFkZGl0aW9uYWwgYWN0aW9uIGhhbmRsZXIgaXMgdGhlIGluc3RhbmNlIHN0YXRlLlxuICAgKiBJdCB3aWxsIGluY2x1ZGUgYWxsIHRoZSBzdWJyZWR1Y2VycyBgdmlzU3RhdGVgLCBgdWlTdGF0ZWAsIGBtYXBTdGF0ZWAgYW5kIGBtYXBTdHlsZWAuXG4gICAqIGAucGx1Z2luYCBpcyBvbmx5IG1lYW50IHRvIGJlIGNhbGxlZCBvbmNlIHdoZW4gbW91bnRpbmcgdGhlIGtlcGxlckdsUmVkdWNlciB0byB0aGUgc3RvcmUuXG4gICAqICoqTm90ZSoqIFRoaXMgaXMgYW4gYWR2YW5jZWQgb3B0aW9uIHRvIGdpdmUgeW91IG1vcmUgZnJlZWRvbSB0byBtb2RpZnkgdGhlIGludGVybmFsIHN0YXRlIG9mIHRoZSBrZXBsZXIuZ2wgaW5zdGFuY2UuXG4gICAqIFlvdSBzaG91bGQgb25seSB1c2UgdGhpcyB0byBhZGRpbmcgYWRkaXRpb25hbCBhY3Rpb25zIGluc3RlYWQgb2YgcmVwbGFjaW5nIGRlZmF1bHQgYWN0aW9ucy5cbiAgICpcbiAgICogQG1peGluIGtlcGxlckdsUmVkdWNlci5wbHVnaW5cbiAgICogQG1lbWJlcm9mIGtlcGxlckdsUmVkdWNlclxuICAgKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gY3VzdG9tUmVkdWNlciAtIEEgcmVkdWNlciBtYXAgb3IgYSByZWR1Y2VyXG4gICAqIEBwdWJsaWNcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgbXlLZXBsZXJHbFJlZHVjZXIgPSBrZXBsZXJHbFJlZHVjZXJcbiAgICogIC5wbHVnaW4oe1xuICAgKiAgICAvLyAxLiBhcyByZWR1Y2VyIG1hcFxuICAgKiAgICBISURFX0FORF9TSE9XX1NJREVfUEFORUw6IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAgKiAgICAgIC4uLnN0YXRlLFxuICAgKiAgICAgIHVpU3RhdGU6IHtcbiAgICogICAgICAgIC4uLnN0YXRlLnVpU3RhdGUsXG4gICAqICAgICAgICByZWFkT25seTogIXN0YXRlLnVpU3RhdGUucmVhZE9ubHlcbiAgICogICAgICB9XG4gICAqICAgIH0pXG4gICAqICB9KVxuICAgKiAucGx1Z2luKGhhbmRsZUFjdGlvbnMoe1xuICAgKiAgIC8vIDIuIGFzIHJlZHVjZXJcbiAgICogICAnSElERV9NQVBfQ09OVFJPTFMnOiAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgICogICAgIC4uLnN0YXRlLFxuICAgKiAgICAgdWlTdGF0ZToge1xuICAgKiAgICAgICAuLi5zdGF0ZS51aVN0YXRlLFxuICAgKiAgICAgICBtYXBDb250cm9sczogaGlkZGVuTWFwQ29udHJvbFxuICAgKiAgICAgfVxuICAgKiAgIH0pXG4gICAqIH0sIHt9KSk7XG4gICAqL1xuICB0YXJnZXQucGx1Z2luID0gZnVuY3Rpb24gcGx1Z2luKGN1c3RvbVJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIGN1c3RvbVJlZHVjZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyBpZiBvbmx5IHByb3ZpZGVkIGEgcmVkdWNlck1hcCwgd3JhcCBpdCBpbiBhIHJlZHVjZXJcbiAgICAgIGN1c3RvbVJlZHVjZXIgPSBoYW5kbGVBY3Rpb25zKGN1c3RvbVJlZHVjZXIsIHt9KTtcbiAgICB9XG5cbiAgICAvLyB1c2UgJ2Z1bmN0aW9uJyBrZXl3b3JkIHRvIGVuYWJsZSAndGhpcydcbiAgICByZXR1cm4gZGVjb3JhdGUoKHN0YXRlID0ge30sIGFjdGlvbiA9IHt9KSA9PiB7XG4gICAgICBsZXQgbmV4dFN0YXRlID0gdGhpcyhzdGF0ZSwgYWN0aW9uKTtcblxuICAgICAgLy8gZm9yIGVhY2ggZW50cnkgaW4gdGhlIHN0YXRlblxuICAgICAgT2JqZWN0LmtleXMobmV4dFN0YXRlKS5mb3JFYWNoKGlkID0+IHtcbiAgICAgICAgLy8gdXBkYXRlIGNoaWxkIHN0YXRlc1xuICAgICAgICBuZXh0U3RhdGUgPSBfdXBkYXRlUHJvcGVydHkoXG4gICAgICAgICAgbmV4dFN0YXRlLFxuICAgICAgICAgIGlkLFxuICAgICAgICAgIGN1c3RvbVJlZHVjZXIobmV4dFN0YXRlW2lkXSwgX2FjdGlvbkZvcihpZCwgYWN0aW9uKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSByZWR1Y2VyIHRoYXQgaW5pdGlhdGVkIHdpdGggY3VzdG9tIGluaXRpYWwgc3RhdGUuXG4gICAqIFRoZSBwYXJhbWV0ZXIgc2hvdWxkIGJlIGFuIG9iamVjdCBtYXBwaW5nIGZyb20gYHN1YnJlZHVjZXJgIG5hbWUgdG8gY3VzdG9tIHN1YnJlZHVjZXIgc3RhdGUsXG4gICAqIHdoaWNoIHdpbGwgYmUgc2hhbGxvdyAqKm1lcmdlZCoqIHdpdGggZGVmYXVsdCBpbml0aWFsIHN0YXRlLlxuICAgKlxuICAgKiBEZWZhdWx0IHN1YnJlZHVjZXIgc3RhdGU6XG4gICAqICAtIFtgdmlzU3RhdGVgXSguL3Zpcy1zdGF0ZS5tZCNJTklUSUFMX1ZJU19TVEFURSlcbiAgICogIC0gW2BtYXBTdGF0ZWBdKC4vbWFwLXN0YXRlLm1kI0lOSVRJQUxfTUFQX1NUQVRFKVxuICAgKiAgLSBbYG1hcFN0eWxlYF0oLi9tYXAtc3R5bGUubWQjSU5JVElBTF9NQVBfU1RZTEUpXG4gICAqICAtIFtgdWlTdGF0ZWBdKC4vdWktc3RhdGUubWQjSU5JVElBTF9VSV9TVEFURSlcbiAgICogQG1peGluIGtlcGxlckdsUmVkdWNlci5pbml0aWFsU3RhdGVcbiAgICogQG1lbWJlcm9mIGtlcGxlckdsUmVkdWNlclxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5pU3QgLSBjdXN0b20gc3RhdGUgdG8gYmUgbWVyZ2VkIHdpdGggZGVmYXVsdCBpbml0aWFsIHN0YXRlXG4gICAqIEBwdWJsaWNcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgbXlLZXBsZXJHbFJlZHVjZXIgPSBrZXBsZXJHbFJlZHVjZXJcbiAgICogIC5pbml0aWFsU3RhdGUoe1xuICAgKiAgICB1aVN0YXRlOiB7cmVhZE9ubHk6IHRydWV9XG4gICAqICB9KTtcbiAgICovXG4gIHRhcmdldC5pbml0aWFsU3RhdGUgPSBmdW5jdGlvbiBpbml0aWFsU3RhdGUoaW5pU3QpIHtcbiAgICBjb25zdCBtZXJnZWQgPSBtZXJnZUluaXRpYWxTdGF0ZSh0YXJnZXRJbml0aWFsU3RhdGUsIGluaVN0KTtcbiAgICBjb25zdCB0YXJnZXRSZWR1Y2VyID0gcHJvdmlkZUluaXRpYWxTdGF0ZShtZXJnZWQpO1xuXG4gICAgcmV0dXJuIGRlY29yYXRlKHRhcmdldFJlZHVjZXIsIG1lcmdlZCk7XG4gIH07XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBLZXBsZXIuZ2wgcmVkdWNlciB0byBiZSBtb3VudGVkIHRvIHlvdXIgc3RvcmUuIFlvdSBjYW4gbW91bnQgYGtlcGxlckdsUmVkdWNlcmAgYXQgcHJvcGVydHkgYGtlcGxlckdsYCwgaWYgeW91IGNob29zZVxuICogdG8gbW91bnQgaXQgYXQgYW5vdGhlciBhZGRyZXNzIGUuZy4gYGZvb2AgeW91IHdpbGwgbmVlZCB0byBzcGVjaWZ5IGl0IHdoZW4geW91IG1vdW50IGBLZXBsZXJHbGAgY29tcG9uZW50IGluIHlvdXIgYXBwIHdpdGggYGdldFN0YXRlOiBzdGF0ZSA9PiBzdGF0ZS5mb29gXG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IGtlcGxlckdsUmVkdWNlciBmcm9tICdrZXBsZXIuZ2wvcmVkdWNlcnMnO1xuICogaW1wb3J0IHtjcmVhdGVTdG9yZSwgY29tYmluZVJlZHVjZXJzLCBhcHBseU1pZGRsZXdhcmUsIGNvbXBvc2V9IGZyb20gJ3JlZHV4JztcbiAqIGltcG9ydCB7dGFza01pZGRsZXdhcmV9IGZyb20gJ3JlYWN0LXBhbG0vdGFza3MnO1xuICpcbiAqIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHt9O1xuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogICAvLyA8LS0gbW91bnQga2VwbGVyLmdsIHJlZHVjZXIgaW4geW91ciBhcHBcbiAqICAga2VwbGVyR2w6IGtlcGxlckdsUmVkdWNlcixcbiAqXG4gKiAgIC8vIFlvdXIgb3RoZXIgcmVkdWNlcnMgaGVyZVxuICogICBhcHA6IGFwcFJlZHVjZXJcbiAqIH0pO1xuICpcbiAqIC8vIHVzaW5nIGNyZWF0ZVN0b3JlXG4gKiBleHBvcnQgZGVmYXVsdCBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGFwcGx5TWlkZGxld2FyZSh0YXNrTWlkZGxld2FyZSkpO1xuICovXG5jb25zdCBrZXBsZXJHbFJlZHVjZXIgPSBkZWNvcmF0ZShfa2VwbGVyR2xSZWR1Y2VyKTtcbmV4cG9ydCBkZWZhdWx0IGtlcGxlckdsUmVkdWNlcjtcbiJdfQ==