"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContainerFactory = ContainerFactory;
exports.injectComponents = injectComponents;
exports["default"] = exports.appInjector = exports.ERROR_MSG = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _window = require("global/window");

var _injector = require("./injector");

var _keplerGl = _interopRequireDefault(require("./kepler-gl"));

var _actionWrapper = require("../actions/action-wrapper");

var _identityActions = require("../actions/identity-actions");

var _dataUtils = require("../utils/data-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ERROR_MSG = {
  noState: "kepler.gl state does not exist. " + "You might forget to mount keplerGlReducer in your root reducer." + "If it is not mounted as state.keplerGl by default, you need to provide getState as a prop"
};
exports.ERROR_MSG = ERROR_MSG;
ContainerFactory.deps = [_keplerGl["default"]];

function ContainerFactory(KeplerGl) {
  /** @lends KeplerGl */

  /**
    * Main Kepler.gl Component
    * @param {Object} props
    *
    * @param {string} props.id - _required_
    *
    * - Default: `map`
    * The id of this KeplerGl instance. `id` is required if you have multiple
    * KeplerGl instances in your app. It defines the prop name of the KeplerGl state that is
    * stored in the KeplerGl reducer. For example, the state of the KeplerGl component with id `foo` is
    * stored in `state.keplerGl.foo`.
    *
    * In case you create multiple kepler.gl instances using the same id, the kepler.gl state defined by the entry will be
    * overridden by the latest instance and reset to a blank state.
    * @param {string} props.mapboxApiAccessToken - _required_
    * @param {string} props.mapboxApiUrl - _optional_
    * @param {Boolean} props.mapStylesReplaceDefault - _optional_
    * @param {object} props.initialUiState - _optional_
     * You can create a free account at [www.mapbox.com](www.mapbox.com) and create a token at
    * [www.mapbox.com/account/access-tokens](www.mapbox.com/account/access-tokens)
    *
    *
    * @param {Number} props.width - _required_ Width of the KeplerGl UI.
    * @public
   */
  var Container = /*#__PURE__*/function (_Component) {
    (0, _inherits2["default"])(Container, _Component);

    var _super = _createSuper(Container);

    // default id and address if not provided
    function Container(props, ctx) {
      var _this;

      (0, _classCallCheck2["default"])(this, Container);
      _this = _super.call(this, props, ctx);
      _this.getSelector = (0, _lodash["default"])(function (id, getState) {
        return function (state) {
          if (!getState(state)) {
            // log error
            _window.console.error(ERROR_MSG.noState);

            return null;
          }

          return getState(state)[id];
        };
      });
      _this.getDispatch = (0, _lodash["default"])(function (id, dispatch) {
        return (0, _actionWrapper.forwardTo)(id, dispatch);
      });
      return _this;
    }

    (0, _createClass2["default"])(Container, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this$props = this.props,
            id = _this$props.id,
            mint = _this$props.mint,
            mapboxApiAccessToken = _this$props.mapboxApiAccessToken,
            mapboxApiUrl = _this$props.mapboxApiUrl,
            mapStylesReplaceDefault = _this$props.mapStylesReplaceDefault,
            initialUiState = _this$props.initialUiState; // add a new entry to reducer

        this.props.dispatch((0, _identityActions.registerEntry)({
          id: id,
          mint: mint,
          mapboxApiAccessToken: mapboxApiAccessToken,
          mapboxApiUrl: mapboxApiUrl,
          mapStylesReplaceDefault: mapStylesReplaceDefault,
          initialUiState: initialUiState
        }));
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        // check if id has changed, if true, copy state over
        if ((0, _dataUtils.notNullorUndefined)(prevProps.id) && (0, _dataUtils.notNullorUndefined)(this.props.id) && prevProps.id !== this.props.id) {
          this.props.dispatch((0, _identityActions.renameEntry)(prevProps.id, this.props.id));
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (this.props.mint !== false) {
          // delete entry in reducer
          this.props.dispatch((0, _identityActions.deleteEntry)(this.props.id));
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props2 = this.props,
            id = _this$props2.id,
            getState = _this$props2.getState,
            dispatch = _this$props2.dispatch,
            state = _this$props2.state;
        var selector = this.getSelector(id, getState);

        if (!selector || !selector(state)) {
          // instance state hasn't been mounted yet
          return /*#__PURE__*/_react["default"].createElement("div", null);
        }

        return /*#__PURE__*/_react["default"].createElement(KeplerGl, (0, _extends2["default"])({}, this.props, {
          id: id,
          selector: selector,
          dispatch: this.getDispatch(id, dispatch)
        }));
      }
    }]);
    return Container;
  }(_react.Component);

  (0, _defineProperty2["default"])(Container, "defaultProps", {
    id: 'map',
    getState: function getState(state) {
      return state.keplerGl;
    },
    mint: true
  });

  var mapStateToProps = function mapStateToProps(state, props) {
    return _objectSpread({
      state: state
    }, props);
  };

  var dispatchToProps = function dispatchToProps(dispatch) {
    return {
      dispatch: dispatch
    };
  };

  return (0, _reactRedux.connect)(mapStateToProps, dispatchToProps)(Container);
} // entryPoint


function flattenDeps(allDeps, factory) {
  var addToDeps = allDeps.concat([factory]);
  return Array.isArray(factory.deps) && factory.deps.length ? factory.deps.reduce(function (accu, dep) {
    return flattenDeps(accu, dep);
  }, addToDeps) : addToDeps;
}

var allDependencies = flattenDeps([], ContainerFactory); // provide all dependencies to appInjector

var appInjector = allDependencies.reduce(function (inj, factory) {
  return inj.provide(factory, factory);
}, (0, _injector.injector)()); // Helper to inject custom components and return kepler.gl container

exports.appInjector = appInjector;

function injectComponents() {
  var recipes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return recipes.reduce(function (inj, recipe) {
    var _inj;

    if (!(0, _injector.typeCheckRecipe)(recipe)) {
      return inj;
    } // collect dependencies of custom factories, if there is any.
    // Add them to the injector


    var customDependencies = flattenDeps([], recipe[1]);
    inj = customDependencies.reduce(function (ij, factory) {
      return ij.provide(factory, factory);
    }, inj);
    return (_inj = inj).provide.apply(_inj, (0, _toConsumableArray2["default"])(recipe));
  }, appInjector).get(ContainerFactory);
}

var InjectedContainer = appInjector.get(ContainerFactory);
var _default = InjectedContainer;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2NvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJFUlJPUl9NU0ciLCJub1N0YXRlIiwiQ29udGFpbmVyRmFjdG9yeSIsImRlcHMiLCJLZXBsZXJHbEZhY3RvcnkiLCJLZXBsZXJHbCIsIkNvbnRhaW5lciIsInByb3BzIiwiY3R4IiwiZ2V0U2VsZWN0b3IiLCJpZCIsImdldFN0YXRlIiwic3RhdGUiLCJDb25zb2xlIiwiZXJyb3IiLCJnZXREaXNwYXRjaCIsImRpc3BhdGNoIiwibWludCIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwibWFwYm94QXBpVXJsIiwibWFwU3R5bGVzUmVwbGFjZURlZmF1bHQiLCJpbml0aWFsVWlTdGF0ZSIsInByZXZQcm9wcyIsInNlbGVjdG9yIiwiQ29tcG9uZW50Iiwia2VwbGVyR2wiLCJtYXBTdGF0ZVRvUHJvcHMiLCJkaXNwYXRjaFRvUHJvcHMiLCJmbGF0dGVuRGVwcyIsImFsbERlcHMiLCJmYWN0b3J5IiwiYWRkVG9EZXBzIiwiY29uY2F0IiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwicmVkdWNlIiwiYWNjdSIsImRlcCIsImFsbERlcGVuZGVuY2llcyIsImFwcEluamVjdG9yIiwiaW5qIiwicHJvdmlkZSIsImluamVjdENvbXBvbmVudHMiLCJyZWNpcGVzIiwicmVjaXBlIiwiY3VzdG9tRGVwZW5kZW5jaWVzIiwiaWoiLCJnZXQiLCJJbmplY3RlZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7QUFFTyxJQUFNQSxTQUFTLEdBQUc7QUFDdkJDLEVBQUFBLE9BQU8sRUFDTDtBQUZxQixDQUFsQjs7QUFPUEMsZ0JBQWdCLENBQUNDLElBQWpCLEdBQXdCLENBQUNDLG9CQUFELENBQXhCOztBQUVPLFNBQVNGLGdCQUFULENBQTBC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QUFnQjlDLGdCQUFoQixDQUExQjtlQUVlK0MsaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Y29ubmVjdH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoLm1lbW9pemUnO1xuaW1wb3J0IHtjb25zb2xlIGFzIENvbnNvbGV9IGZyb20gJ2dsb2JhbC93aW5kb3cnO1xuaW1wb3J0IHtpbmplY3RvciwgdHlwZUNoZWNrUmVjaXBlfSBmcm9tICcuL2luamVjdG9yJztcbmltcG9ydCBLZXBsZXJHbEZhY3RvcnkgZnJvbSAnLi9rZXBsZXItZ2wnO1xuaW1wb3J0IHtmb3J3YXJkVG99IGZyb20gJ2FjdGlvbnMvYWN0aW9uLXdyYXBwZXInO1xuXG5pbXBvcnQge3JlZ2lzdGVyRW50cnksIGRlbGV0ZUVudHJ5LCByZW5hbWVFbnRyeX0gZnJvbSAnYWN0aW9ucy9pZGVudGl0eS1hY3Rpb25zJztcbmltcG9ydCB7bm90TnVsbG9yVW5kZWZpbmVkfSBmcm9tICd1dGlscy9kYXRhLXV0aWxzJztcblxuZXhwb3J0IGNvbnN0IEVSUk9SX01TRyA9IHtcbiAgbm9TdGF0ZTpcbiAgICBga2VwbGVyLmdsIHN0YXRlIGRvZXMgbm90IGV4aXN0LiBgICtcbiAgICBgWW91IG1pZ2h0IGZvcmdldCB0byBtb3VudCBrZXBsZXJHbFJlZHVjZXIgaW4geW91ciByb290IHJlZHVjZXIuYCArXG4gICAgYElmIGl0IGlzIG5vdCBtb3VudGVkIGFzIHN0YXRlLmtlcGxlckdsIGJ5IGRlZmF1bHQsIHlvdSBuZWVkIHRvIHByb3ZpZGUgZ2V0U3RhdGUgYXMgYSBwcm9wYFxufTtcblxuQ29udGFpbmVyRmFjdG9yeS5kZXBzID0gW0tlcGxlckdsRmFjdG9yeV07XG5cbmV4cG9ydCBmdW5jdGlvbiBDb250YWluZXJGYWN0b3J5KEtlcGxlckdsKSB7XG4gIC8qKiBAbGVuZHMgS2VwbGVyR2wgKi9cbiAgLyoqXG4gICAgKiBNYWluIEtlcGxlci5nbCBDb21wb25lbnRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5pZCAtIF9yZXF1aXJlZF9cbiAgICAqXG4gICAgKiAtIERlZmF1bHQ6IGBtYXBgXG4gICAgKiBUaGUgaWQgb2YgdGhpcyBLZXBsZXJHbCBpbnN0YW5jZS4gYGlkYCBpcyByZXF1aXJlZCBpZiB5b3UgaGF2ZSBtdWx0aXBsZVxuICAgICogS2VwbGVyR2wgaW5zdGFuY2VzIGluIHlvdXIgYXBwLiBJdCBkZWZpbmVzIHRoZSBwcm9wIG5hbWUgb2YgdGhlIEtlcGxlckdsIHN0YXRlIHRoYXQgaXNcbiAgICAqIHN0b3JlZCBpbiB0aGUgS2VwbGVyR2wgcmVkdWNlci4gRm9yIGV4YW1wbGUsIHRoZSBzdGF0ZSBvZiB0aGUgS2VwbGVyR2wgY29tcG9uZW50IHdpdGggaWQgYGZvb2AgaXNcbiAgICAqIHN0b3JlZCBpbiBgc3RhdGUua2VwbGVyR2wuZm9vYC5cbiAgICAqXG4gICAgKiBJbiBjYXNlIHlvdSBjcmVhdGUgbXVsdGlwbGUga2VwbGVyLmdsIGluc3RhbmNlcyB1c2luZyB0aGUgc2FtZSBpZCwgdGhlIGtlcGxlci5nbCBzdGF0ZSBkZWZpbmVkIGJ5IHRoZSBlbnRyeSB3aWxsIGJlXG4gICAgKiBvdmVycmlkZGVuIGJ5IHRoZSBsYXRlc3QgaW5zdGFuY2UgYW5kIHJlc2V0IHRvIGEgYmxhbmsgc3RhdGUuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW4gLSBfcmVxdWlyZWRfXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcHMubWFwYm94QXBpVXJsIC0gX29wdGlvbmFsX1xuICAgICogQHBhcmFtIHtCb29sZWFufSBwcm9wcy5tYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCAtIF9vcHRpb25hbF9cbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcy5pbml0aWFsVWlTdGF0ZSAtIF9vcHRpb25hbF9cblxuICAgICogWW91IGNhbiBjcmVhdGUgYSBmcmVlIGFjY291bnQgYXQgW3d3dy5tYXBib3guY29tXSh3d3cubWFwYm94LmNvbSkgYW5kIGNyZWF0ZSBhIHRva2VuIGF0XG4gICAgKiBbd3d3Lm1hcGJveC5jb20vYWNjb3VudC9hY2Nlc3MtdG9rZW5zXSh3d3cubWFwYm94LmNvbS9hY2NvdW50L2FjY2Vzcy10b2tlbnMpXG4gICAgKlxuICAgICpcbiAgICAqIEBwYXJhbSB7TnVtYmVyfSBwcm9wcy53aWR0aCAtIF9yZXF1aXJlZF8gV2lkdGggb2YgdGhlIEtlcGxlckdsIFVJLlxuICAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xhc3MgQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAvLyBkZWZhdWx0IGlkIGFuZCBhZGRyZXNzIGlmIG5vdCBwcm92aWRlZFxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICBpZDogJ21hcCcsXG4gICAgICBnZXRTdGF0ZTogc3RhdGUgPT4gc3RhdGUua2VwbGVyR2wsXG4gICAgICBtaW50OiB0cnVlXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjdHgpIHtcbiAgICAgIHN1cGVyKHByb3BzLCBjdHgpO1xuXG4gICAgICB0aGlzLmdldFNlbGVjdG9yID0gbWVtb2l6ZSgoaWQsIGdldFN0YXRlKSA9PiBzdGF0ZSA9PiB7XG4gICAgICAgIGlmICghZ2V0U3RhdGUoc3RhdGUpKSB7XG4gICAgICAgICAgLy8gbG9nIGVycm9yXG4gICAgICAgICAgQ29uc29sZS5lcnJvcihFUlJPUl9NU0cubm9TdGF0ZSk7XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0U3RhdGUoc3RhdGUpW2lkXTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5nZXREaXNwYXRjaCA9IG1lbW9pemUoKGlkLCBkaXNwYXRjaCkgPT4gZm9yd2FyZFRvKGlkLCBkaXNwYXRjaCkpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpZCxcbiAgICAgICAgbWludCxcbiAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgIG1hcGJveEFwaVVybCxcbiAgICAgICAgbWFwU3R5bGVzUmVwbGFjZURlZmF1bHQsXG4gICAgICAgIGluaXRpYWxVaVN0YXRlXG4gICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgLy8gYWRkIGEgbmV3IGVudHJ5IHRvIHJlZHVjZXJcbiAgICAgIHRoaXMucHJvcHMuZGlzcGF0Y2goXG4gICAgICAgIHJlZ2lzdGVyRW50cnkoe1xuICAgICAgICAgIGlkLFxuICAgICAgICAgIG1pbnQsXG4gICAgICAgICAgbWFwYm94QXBpQWNjZXNzVG9rZW4sXG4gICAgICAgICAgbWFwYm94QXBpVXJsLFxuICAgICAgICAgIG1hcFN0eWxlc1JlcGxhY2VEZWZhdWx0LFxuICAgICAgICAgIGluaXRpYWxVaVN0YXRlXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICAgIC8vIGNoZWNrIGlmIGlkIGhhcyBjaGFuZ2VkLCBpZiB0cnVlLCBjb3B5IHN0YXRlIG92ZXJcbiAgICAgIGlmIChcbiAgICAgICAgbm90TnVsbG9yVW5kZWZpbmVkKHByZXZQcm9wcy5pZCkgJiZcbiAgICAgICAgbm90TnVsbG9yVW5kZWZpbmVkKHRoaXMucHJvcHMuaWQpICYmXG4gICAgICAgIHByZXZQcm9wcy5pZCAhPT0gdGhpcy5wcm9wcy5pZFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucHJvcHMuZGlzcGF0Y2gocmVuYW1lRW50cnkocHJldlByb3BzLmlkLCB0aGlzLnByb3BzLmlkKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5taW50ICE9PSBmYWxzZSkge1xuICAgICAgICAvLyBkZWxldGUgZW50cnkgaW4gcmVkdWNlclxuICAgICAgICB0aGlzLnByb3BzLmRpc3BhdGNoKGRlbGV0ZUVudHJ5KHRoaXMucHJvcHMuaWQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7aWQsIGdldFN0YXRlLCBkaXNwYXRjaCwgc3RhdGV9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gdGhpcy5nZXRTZWxlY3RvcihpZCwgZ2V0U3RhdGUpO1xuXG4gICAgICBpZiAoIXNlbGVjdG9yIHx8ICFzZWxlY3RvcihzdGF0ZSkpIHtcbiAgICAgICAgLy8gaW5zdGFuY2Ugc3RhdGUgaGFzbid0IGJlZW4gbW91bnRlZCB5ZXRcbiAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxLZXBsZXJHbFxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAgIGlkPXtpZH1cbiAgICAgICAgICBzZWxlY3Rvcj17c2VsZWN0b3J9XG4gICAgICAgICAgZGlzcGF0Y2g9e3RoaXMuZ2V0RGlzcGF0Y2goaWQsIGRpc3BhdGNoKX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlLCBwcm9wcykgPT4gKHtzdGF0ZSwgLi4ucHJvcHN9KTtcbiAgY29uc3QgZGlzcGF0Y2hUb1Byb3BzID0gZGlzcGF0Y2ggPT4gKHtkaXNwYXRjaH0pO1xuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIGRpc3BhdGNoVG9Qcm9wcykoQ29udGFpbmVyKTtcbn1cblxuLy8gZW50cnlQb2ludFxuZnVuY3Rpb24gZmxhdHRlbkRlcHMoYWxsRGVwcywgZmFjdG9yeSkge1xuICBjb25zdCBhZGRUb0RlcHMgPSBhbGxEZXBzLmNvbmNhdChbZmFjdG9yeV0pO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShmYWN0b3J5LmRlcHMpICYmIGZhY3RvcnkuZGVwcy5sZW5ndGhcbiAgICA/IGZhY3RvcnkuZGVwcy5yZWR1Y2UoKGFjY3UsIGRlcCkgPT4gZmxhdHRlbkRlcHMoYWNjdSwgZGVwKSwgYWRkVG9EZXBzKVxuICAgIDogYWRkVG9EZXBzO1xufVxuXG5jb25zdCBhbGxEZXBlbmRlbmNpZXMgPSBmbGF0dGVuRGVwcyhbXSwgQ29udGFpbmVyRmFjdG9yeSk7XG5cbi8vIHByb3ZpZGUgYWxsIGRlcGVuZGVuY2llcyB0byBhcHBJbmplY3RvclxuZXhwb3J0IGNvbnN0IGFwcEluamVjdG9yID0gYWxsRGVwZW5kZW5jaWVzLnJlZHVjZShcbiAgKGluaiwgZmFjdG9yeSkgPT4gaW5qLnByb3ZpZGUoZmFjdG9yeSwgZmFjdG9yeSksXG4gIGluamVjdG9yKClcbik7XG5cbi8vIEhlbHBlciB0byBpbmplY3QgY3VzdG9tIGNvbXBvbmVudHMgYW5kIHJldHVybiBrZXBsZXIuZ2wgY29udGFpbmVyXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q29tcG9uZW50cyhyZWNpcGVzID0gW10pIHtcbiAgcmV0dXJuIHJlY2lwZXNcbiAgICAucmVkdWNlKChpbmosIHJlY2lwZSkgPT4ge1xuICAgICAgaWYgKCF0eXBlQ2hlY2tSZWNpcGUocmVjaXBlKSkge1xuICAgICAgICByZXR1cm4gaW5qO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2xsZWN0IGRlcGVuZGVuY2llcyBvZiBjdXN0b20gZmFjdG9yaWVzLCBpZiB0aGVyZSBpcyBhbnkuXG4gICAgICAvLyBBZGQgdGhlbSB0byB0aGUgaW5qZWN0b3JcbiAgICAgIGNvbnN0IGN1c3RvbURlcGVuZGVuY2llcyA9IGZsYXR0ZW5EZXBzKFtdLCByZWNpcGVbMV0pO1xuICAgICAgaW5qID0gY3VzdG9tRGVwZW5kZW5jaWVzLnJlZHVjZSgoaWosIGZhY3RvcnkpID0+IGlqLnByb3ZpZGUoZmFjdG9yeSwgZmFjdG9yeSksIGluaik7XG5cbiAgICAgIHJldHVybiBpbmoucHJvdmlkZSguLi5yZWNpcGUpO1xuICAgIH0sIGFwcEluamVjdG9yKVxuICAgIC5nZXQoQ29udGFpbmVyRmFjdG9yeSk7XG59XG5cbmNvbnN0IEluamVjdGVkQ29udGFpbmVyID0gYXBwSW5qZWN0b3IuZ2V0KENvbnRhaW5lckZhY3RvcnkpO1xuXG5leHBvcnQgZGVmYXVsdCBJbmplY3RlZENvbnRhaW5lcjtcbiJdfQ==