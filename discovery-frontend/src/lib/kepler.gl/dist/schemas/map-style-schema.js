"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.propertiesV1 = exports.propertiesV0 = exports.customMapStylePropsV1 = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _versions = require("./versions");

var _schema = _interopRequireDefault(require("./schema"));

var _mapStyleSchema;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var customMapStylePropsV1 = {
  accessToken: null,
  custom: null,
  icon: null,
  id: null,
  label: null,
  url: null
};
exports.customMapStylePropsV1 = customMapStylePropsV1;
var CustomMapStyleSchema = new _schema["default"]({
  version: _versions.VERSIONS.v1,
  key: 'customStyle',
  properties: customMapStylePropsV1
});

var MapStyleSchemaV1 = /*#__PURE__*/function (_Schema) {
  (0, _inherits2["default"])(MapStyleSchemaV1, _Schema);

  var _super = _createSuper(MapStyleSchemaV1);

  function MapStyleSchemaV1() {
    var _this;

    (0, _classCallCheck2["default"])(this, MapStyleSchemaV1);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "version", _versions.VERSIONS.v1);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "key", 'mapStyles');
    return _this;
  }

  (0, _createClass2["default"])(MapStyleSchemaV1, [{
    key: "save",
    value: function save(mapStyles) {
      // save all custom styles
      var saveCustomStyle = Object.keys(mapStyles).reduce(function (accu, key) {
        return _objectSpread(_objectSpread({}, accu), mapStyles[key].custom ? (0, _defineProperty2["default"])({}, key, CustomMapStyleSchema.save(mapStyles[key]).customStyle) : {});
      }, {});
      return (0, _defineProperty2["default"])({}, this.key, saveCustomStyle);
    }
  }, {
    key: "load",
    value: function load(mapStyles) {
      // If mapStyle is an empty object, do not load it
      return (0, _typeof2["default"])(mapStyles) === 'object' && Object.keys(mapStyles).length ? (0, _defineProperty2["default"])({}, this.key, mapStyles) : {};
    }
  }]);
  return MapStyleSchemaV1;
}(_schema["default"]); // version v0


var propertiesV0 = {
  styleType: null,
  topLayerGroups: null,
  visibleLayerGroups: null,
  buildingLayer: null,
  mapStyles: new MapStyleSchemaV1()
};
exports.propertiesV0 = propertiesV0;
var propertiesV1 = {
  styleType: null,
  topLayerGroups: null,
  visibleLayerGroups: null,
  threeDBuildingColor: null,
  mapStyles: new MapStyleSchemaV1()
};
exports.propertiesV1 = propertiesV1;
var mapStyleSchema = (_mapStyleSchema = {}, (0, _defineProperty2["default"])(_mapStyleSchema, _versions.VERSIONS.v0, new _schema["default"]({
  version: _versions.VERSIONS.v0,
  properties: propertiesV0,
  key: 'mapStyle'
})), (0, _defineProperty2["default"])(_mapStyleSchema, _versions.VERSIONS.v1, new _schema["default"]({
  version: _versions.VERSIONS.v1,
  properties: propertiesV1,
  key: 'mapStyle'
})), _mapStyleSchema);
var _default = mapStyleSchema;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY2hlbWFzL21hcC1zdHlsZS1zY2hlbWEuanMiXSwibmFtZXMiOlsiY3VzdG9tTWFwU3R5bGVQcm9wc1YxIiwiYWNjZXNzVG9rZW4iLCJjdXN0b20iLCJpY29uIiwiaWQiLCJsYWJlbCIsInVybCIsIkN1c3RvbU1hcFN0eWxlU2NoZW1hIiwiU2NoZW1hIiwidmVyc2lvbiIsIlZFUlNJT05TIiwidjEiLCJrZXkiLCJwcm9wZXJ0aWVzIiwiTWFwU3R5bGVTY2hlbWFWMSIsIm1hcFN0eWxlcyIsInNhdmVDdXN0b21TdHlsZSIsIk9iamVjdCIsImtleXMiLCJyZWR1Y2UiLCJhY2N1Iiwic2F2ZSIsImN1c3RvbVN0eWxlIiwibGVuZ3RoIiwicHJvcGVydGllc1YwIiwic3R5bGVUeXBlIiwidG9wTGF5ZXJHcm91cHMiLCJ2aXNpYmxlTGF5ZXJHcm91cHMiLCJidWlsZGluZ0xheWVyIiwicHJvcGVydGllc1YxIiwidGhyZWVEQnVpbGRpbmdDb2xvciIsIm1hcFN0eWxlU2NoZW1hIiwidjAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVPLElBQU1BLHFCQUFxQixHQUFHO0FBQ25DQyxFQUFBQSxXQUFXLEVBQUUsSUFEc0I7QUFFbkNDLEVBQUFBLE1BQU0sRUFBRSxJQUYyQjtBQUduQ0MsRUFBQUEsSUFBSSxFQUFFLElBSDZCO0FBSW5DQyxFQUFBQSxFQUFFLEVBQUUsSUFKK0I7QUFLbkNDLEVBQUFBLEtBQUssRUFBRSxJQUw0QjtBQU1uQ0MsRUFBQUEsR0FBRyxFQUFFO0FBTjhCLENBQTlCOztBQVNQLElBQU1DLG9CQUFvQixHQUFHLElBQUlDLGtCQUFKLENBQVc7QUFDdENDLEVBQUFBLE9BQU8sRUFBRUMsbUJBQVNDLEVBRG9CO0FBRXRDQyxFQUFBQSxHQUFHLEVBQUUsYUFGaUM7QUFHdENDLEVBQUFBLFVBQVUsRUFBRWI7QUFIMEIsQ0FBWCxDQUE3Qjs7SUFNTWMsZ0I7Ozs7Ozs7Ozs7Ozs7OztnR0FDTUosbUJBQVNDLEU7NEZBQ2IsVzs7Ozs7O3lCQUNESSxTLEVBQVc7QUFDZDtBQUNBLFVBQU1DLGVBQWUsR0FBR0MsTUFBTSxDQUFDQyxJQUFQLENBQVlILFNBQVosRUFBdUJJLE1BQXZCLENBQ3RCLFVBQUNDLElBQUQsRUFBT1IsR0FBUDtBQUFBLCtDQUNLUSxJQURMLEdBRU1MLFNBQVMsQ0FBQ0gsR0FBRCxDQUFULENBQWVWLE1BQWYsd0NBQ0VVLEdBREYsRUFDUUwsb0JBQW9CLENBQUNjLElBQXJCLENBQTBCTixTQUFTLENBQUNILEdBQUQsQ0FBbkMsRUFBMENVLFdBRGxELElBRUEsRUFKTjtBQUFBLE9BRHNCLEVBT3RCLEVBUHNCLENBQXhCO0FBVUEsa0RBQVMsS0FBS1YsR0FBZCxFQUFvQkksZUFBcEI7QUFDRDs7O3lCQUVJRCxTLEVBQVc7QUFDZDtBQUNBLGFBQU8seUJBQU9BLFNBQVAsTUFBcUIsUUFBckIsSUFBaUNFLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZSCxTQUFaLEVBQXVCUSxNQUF4RCx3Q0FDRCxLQUFLWCxHQURKLEVBQ1VHLFNBRFYsSUFFSCxFQUZKO0FBR0Q7OztFQXZCNEJQLGtCLEdBMEIvQjs7O0FBQ08sSUFBTWdCLFlBQVksR0FBRztBQUMxQkMsRUFBQUEsU0FBUyxFQUFFLElBRGU7QUFFMUJDLEVBQUFBLGNBQWMsRUFBRSxJQUZVO0FBRzFCQyxFQUFBQSxrQkFBa0IsRUFBRSxJQUhNO0FBSTFCQyxFQUFBQSxhQUFhLEVBQUUsSUFKVztBQUsxQmIsRUFBQUEsU0FBUyxFQUFFLElBQUlELGdCQUFKO0FBTGUsQ0FBckI7O0FBUUEsSUFBTWUsWUFBWSxHQUFHO0FBQzFCSixFQUFBQSxTQUFTLEVBQUUsSUFEZTtBQUUxQkMsRUFBQUEsY0FBYyxFQUFFLElBRlU7QUFHMUJDLEVBQUFBLGtCQUFrQixFQUFFLElBSE07QUFJMUJHLEVBQUFBLG1CQUFtQixFQUFFLElBSks7QUFLMUJmLEVBQUFBLFNBQVMsRUFBRSxJQUFJRCxnQkFBSjtBQUxlLENBQXJCOztBQVFQLElBQU1pQixjQUFjLDRFQUNqQnJCLG1CQUFTc0IsRUFEUSxFQUNILElBQUl4QixrQkFBSixDQUFXO0FBQ3hCQyxFQUFBQSxPQUFPLEVBQUVDLG1CQUFTc0IsRUFETTtBQUV4Qm5CLEVBQUFBLFVBQVUsRUFBRVcsWUFGWTtBQUd4QlosRUFBQUEsR0FBRyxFQUFFO0FBSG1CLENBQVgsQ0FERyxxREFNakJGLG1CQUFTQyxFQU5RLEVBTUgsSUFBSUgsa0JBQUosQ0FBVztBQUN4QkMsRUFBQUEsT0FBTyxFQUFFQyxtQkFBU0MsRUFETTtBQUV4QkUsRUFBQUEsVUFBVSxFQUFFZ0IsWUFGWTtBQUd4QmpCLEVBQUFBLEdBQUcsRUFBRTtBQUhtQixDQUFYLENBTkcsbUJBQXBCO2VBYWVtQixjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtWRVJTSU9OU30gZnJvbSAnLi92ZXJzaW9ucyc7XG5pbXBvcnQgU2NoZW1hIGZyb20gJy4vc2NoZW1hJztcblxuZXhwb3J0IGNvbnN0IGN1c3RvbU1hcFN0eWxlUHJvcHNWMSA9IHtcbiAgYWNjZXNzVG9rZW46IG51bGwsXG4gIGN1c3RvbTogbnVsbCxcbiAgaWNvbjogbnVsbCxcbiAgaWQ6IG51bGwsXG4gIGxhYmVsOiBudWxsLFxuICB1cmw6IG51bGxcbn07XG5cbmNvbnN0IEN1c3RvbU1hcFN0eWxlU2NoZW1hID0gbmV3IFNjaGVtYSh7XG4gIHZlcnNpb246IFZFUlNJT05TLnYxLFxuICBrZXk6ICdjdXN0b21TdHlsZScsXG4gIHByb3BlcnRpZXM6IGN1c3RvbU1hcFN0eWxlUHJvcHNWMVxufSk7XG5cbmNsYXNzIE1hcFN0eWxlU2NoZW1hVjEgZXh0ZW5kcyBTY2hlbWEge1xuICB2ZXJzaW9uID0gVkVSU0lPTlMudjE7XG4gIGtleSA9ICdtYXBTdHlsZXMnO1xuICBzYXZlKG1hcFN0eWxlcykge1xuICAgIC8vIHNhdmUgYWxsIGN1c3RvbSBzdHlsZXNcbiAgICBjb25zdCBzYXZlQ3VzdG9tU3R5bGUgPSBPYmplY3Qua2V5cyhtYXBTdHlsZXMpLnJlZHVjZShcbiAgICAgIChhY2N1LCBrZXkpID0+ICh7XG4gICAgICAgIC4uLmFjY3UsXG4gICAgICAgIC4uLihtYXBTdHlsZXNba2V5XS5jdXN0b21cbiAgICAgICAgICA/IHtba2V5XTogQ3VzdG9tTWFwU3R5bGVTY2hlbWEuc2F2ZShtYXBTdHlsZXNba2V5XSkuY3VzdG9tU3R5bGV9XG4gICAgICAgICAgOiB7fSlcbiAgICAgIH0pLFxuICAgICAge31cbiAgICApO1xuXG4gICAgcmV0dXJuIHtbdGhpcy5rZXldOiBzYXZlQ3VzdG9tU3R5bGV9O1xuICB9XG5cbiAgbG9hZChtYXBTdHlsZXMpIHtcbiAgICAvLyBJZiBtYXBTdHlsZSBpcyBhbiBlbXB0eSBvYmplY3QsIGRvIG5vdCBsb2FkIGl0XG4gICAgcmV0dXJuIHR5cGVvZiBtYXBTdHlsZXMgPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKG1hcFN0eWxlcykubGVuZ3RoXG4gICAgICA/IHtbdGhpcy5rZXldOiBtYXBTdHlsZXN9XG4gICAgICA6IHt9O1xuICB9XG59XG5cbi8vIHZlcnNpb24gdjBcbmV4cG9ydCBjb25zdCBwcm9wZXJ0aWVzVjAgPSB7XG4gIHN0eWxlVHlwZTogbnVsbCxcbiAgdG9wTGF5ZXJHcm91cHM6IG51bGwsXG4gIHZpc2libGVMYXllckdyb3VwczogbnVsbCxcbiAgYnVpbGRpbmdMYXllcjogbnVsbCxcbiAgbWFwU3R5bGVzOiBuZXcgTWFwU3R5bGVTY2hlbWFWMSgpXG59O1xuXG5leHBvcnQgY29uc3QgcHJvcGVydGllc1YxID0ge1xuICBzdHlsZVR5cGU6IG51bGwsXG4gIHRvcExheWVyR3JvdXBzOiBudWxsLFxuICB2aXNpYmxlTGF5ZXJHcm91cHM6IG51bGwsXG4gIHRocmVlREJ1aWxkaW5nQ29sb3I6IG51bGwsXG4gIG1hcFN0eWxlczogbmV3IE1hcFN0eWxlU2NoZW1hVjEoKVxufTtcblxuY29uc3QgbWFwU3R5bGVTY2hlbWEgPSB7XG4gIFtWRVJTSU9OUy52MF06IG5ldyBTY2hlbWEoe1xuICAgIHZlcnNpb246IFZFUlNJT05TLnYwLFxuICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXNWMCxcbiAgICBrZXk6ICdtYXBTdHlsZSdcbiAgfSksXG4gIFtWRVJTSU9OUy52MV06IG5ldyBTY2hlbWEoe1xuICAgIHZlcnNpb246IFZFUlNJT05TLnYxLFxuICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXNWMSxcbiAgICBrZXk6ICdtYXBTdHlsZSdcbiAgfSlcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1hcFN0eWxlU2NoZW1hO1xuIl19