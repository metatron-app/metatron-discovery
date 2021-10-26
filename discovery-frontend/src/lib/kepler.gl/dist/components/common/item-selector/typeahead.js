"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _reactLifecyclesCompat = require("react-lifecycles-compat");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _fuzzy = _interopRequireDefault(require("fuzzy"));

var _classnames = _interopRequireDefault(require("classnames"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _window = require("global/window");

var _accessor = _interopRequireDefault(require("./accessor"));

var _dropdownList = _interopRequireWildcard(require("./dropdown-list"));

var _icons = require("../icons");

var _keyevent = _interopRequireDefault(require("../../../constants/keyevent"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: absolute;\n  right: 15px;\n  top: 14px;\n  color: ", ";\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", " :hover {\n    cursor: pointer;\n    background-color: ", ";\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  padding: 8px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  background-color: ", ";\n  box-shadow: ", ";\n\n  :focus {\n    outline: 0;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var DEFAULT_CLASS = 'typeahead';
/**
 * Copied mostly from 'react-typeahead', an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.
 */

var TypeaheadWrapper = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.dropdownListBgd;
}, function (props) {
  return props.theme.dropdownListShadow;
});

var InputBox = _styledComponents["default"].div(_templateObject2());

var TypeaheadInput = _styledComponents["default"].input(_templateObject3(), function (props) {
  return props.theme.secondaryInput;
}, function (props) {
  return props.theme.secondaryInputBgd;
});

var InputIcon = _styledComponents["default"].div(_templateObject4(), function (props) {
  return props.theme.inputPlaceholderColor;
});

function generateSearchFunction(props) {
  var searchOptions = props.searchOptions,
      filterOption = props.filterOption;

  if (typeof searchOptions === 'function') {
    if (filterOption !== null) {
      _window.console.warn('searchOptions prop is being used, filterOption prop will be ignored');
    }

    return searchOptions;
  } else if (typeof filterOption === 'function') {
    // use custom filter option
    return function (value, options) {
      return options.filter(function (o) {
        return filterOption(value, o);
      });
    };
  }

  var mapper = typeof filterOption === 'string' ? _accessor["default"].generateAccessor(filterOption) : _accessor["default"].IDENTITY_FN;
  return function (value, options) {
    return _fuzzy["default"].filter(value, options, {
      extract: mapper
    }).map(function (res) {
      return options[res.index];
    });
  };
}

function getOptionsForValue(value, props, state) {
  var options = props.options,
      showOptionsWhenEmpty = props.showOptionsWhenEmpty;

  if (!props.searchable) {
    // directly pass through options if can not be searched
    return options;
  }

  if (shouldSkipSearch(value, state, showOptionsWhenEmpty)) {
    return options;
  }

  var searchOptions = generateSearchFunction(props);
  return searchOptions(value, options);
}

function shouldSkipSearch(input, state, showOptionsWhenEmpty) {
  var emptyValue = !input || input.trim().length === 0; // this.state must be checked because it may not be defined yet if this function
  // is called from within getInitialState

  var isFocused = state && state.isFocused;
  return !(showOptionsWhenEmpty && isFocused) && emptyValue;
}

var Typeahead = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Typeahead, _Component);

  var _super = _createSuper(Typeahead);

  (0, _createClass2["default"])(Typeahead, null, [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      //  invoked after a component is instantiated as well as before it is re-rendered
      var searchResults = getOptionsForValue(state.entryValue, props, state);
      return {
        searchResults: searchResults
      };
    }
  }]);

  function Typeahead(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Typeahead);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "root", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "entry", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "focus", function () {
      if (_this.entry.current) {
        _this.entry.current.focus();
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_hasCustomValue", function () {
      return _this.props.allowCustomValues > 0 && _this.state.entryValue.length >= _this.props.allowCustomValues && _this.state.searchResults.indexOf(_this.state.entryValue) < 0;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_getCustomValue", function () {
      return _this._hasCustomValue() ? _this.state.entryValue : null;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onOptionSelected", function (option, event) {
      if (_this.props.searchable) {
        // reset entry input
        _this.setState({
          searchResults: getOptionsForValue('', _this.props, _this.state),
          selection: '',
          entryValue: ''
        });
      }

      return _this.props.onOptionSelected(option, event);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onTextEntryUpdated", function () {
      if (_this.props.searchable) {
        var value = _this.entry.current.value;

        _this.setState({
          searchResults: getOptionsForValue(value, _this.props, _this.state),
          selection: '',
          entryValue: value
        });
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onEnter", function (event) {
      var selection = _this.getSelection();

      if (!selection) {
        return _this.props.onKeyDown(event);
      }

      return _this._onOptionSelected(selection, event);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onEscape", function () {
      _this.setState({
        selectionIndex: null
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onTab", function (event) {
      var selection = _this.getSelection();

      var option = selection ? selection : _this.state.searchResults.length > 0 ? _this.state.searchResults[0] : null;

      if (option === null && _this._hasCustomValue()) {
        option = _this._getCustomValue();
      }

      if (option !== null) {
        return _this._onOptionSelected(option, event);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "eventMap", function (event) {
      var events = {};
      events[_keyevent["default"].DOM_VK_UP] = _this.navUp;
      events[_keyevent["default"].DOM_VK_DOWN] = _this.navDown;
      events[_keyevent["default"].DOM_VK_RETURN] = events[_keyevent["default"].DOM_VK_ENTER] = _this._onEnter;
      events[_keyevent["default"].DOM_VK_ESCAPE] = _this._onEscape;
      events[_keyevent["default"].DOM_VK_TAB] = _this._onTab;
      return events;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_nav", function (delta) {
      if (!_this._hasHint()) {
        return;
      }

      var newIndex = _this.state.selectionIndex === null ? delta === 1 ? 0 : delta : _this.state.selectionIndex + delta;
      var length = _this.props.maxVisible ? _this.state.searchResults.slice(0, _this.props.maxVisible).length : _this.state.searchResults.length;

      if (_this._hasCustomValue()) {
        length += 1;
      }

      if (newIndex < 0) {
        newIndex += length;
      } else if (newIndex >= length) {
        newIndex -= length;
      }

      _this.setState({
        selectionIndex: newIndex
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "navDown", function () {
      _this._nav(1);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "navUp", function () {
      _this._nav(-1);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onChange", function (event) {
      if (_this.props.onChange) {
        _this.props.onChange(event);
      }

      _this._onTextEntryUpdated();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onKeyDown", function (event) {
      // If there are no visible elements, don't perform selector navigation.
      // Just pass this up to the upstream onKeydown handler.
      // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
      if (!_this._hasHint() || event.shiftKey) {
        return _this.props.onKeyDown(event);
      }

      var handler = _this.eventMap()[event.keyCode];

      if (handler) {
        handler(event);
      } else {
        return _this.props.onKeyDown(event);
      } // Don't propagate the keystroke back to the DOM/browser


      event.preventDefault();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onFocus", function (event) {
      _this.setState({
        isFocused: true
      });

      if (_this.props.onFocus) {
        return _this.props.onFocus(event);
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_onBlur", function (event) {
      _this.setState({
        isFocused: false
      });

      if (_this.props.onBlur) {
        return _this.props.onBlur(event);
      }
    });
    _this.state = {
      searchResults: [],
      // This should be called something else, 'entryValue'
      entryValue: _this.props.value || _this.props.initialValue,
      // A valid typeahead value
      selection: _this.props.value,
      // Index of the selection
      selectionIndex: null,
      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false
    };
    return _this;
  }

  (0, _createClass2["default"])(Typeahead, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // call focus on entry or div to trigger key events listener
      if (this.entry.current) {
        this.entry.current.focus();
      } else {
        this.root.current.focus();
      }
    }
  }, {
    key: "_renderIncrementalSearchResults",
    value: function _renderIncrementalSearchResults() {
      return /*#__PURE__*/_react["default"].createElement(this.props.customListComponent, {
        fixedOptions: this.props.fixedOptions,
        options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
        areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
        resultsTruncatedMessage: this.props.resultsTruncatedMessage,
        onOptionSelected: this._onOptionSelected,
        allowCustomValues: this.props.allowCustomValues,
        customValue: this._getCustomValue(),
        customClasses: this.props.customClasses,
        customListItemComponent: this.props.customListItemComponent,
        customListHeaderComponent: this.props.customListHeaderComponent,
        selectionIndex: this.state.selectionIndex,
        defaultClassNames: this.props.defaultClassNames,
        displayOption: this.props.displayOption,
        selectedItems: this.props.selectedItems
      });
    }
  }, {
    key: "getSelection",
    value: function getSelection() {
      var index = this.state.selectionIndex;

      if (this._hasCustomValue()) {
        if (index === 0) {
          return this.state.entryValue;
        }

        index--;
      }

      if (this._hasFixedOptions()) {
        return index < this.props.fixedOptions.length ? this.props.fixedOptions[index] : this.state.searchResults[index - this.props.fixedOptions.length];
      }

      return this.state.searchResults[index];
    }
  }, {
    key: "_renderHiddenInput",
    value: function _renderHiddenInput() {
      if (!this.props.name) {
        return null;
      }

      return /*#__PURE__*/_react["default"].createElement("input", {
        type: "hidden",
        name: this.props.name,
        value: this.state.selection
      });
    }
  }, {
    key: "_hasHint",
    value: function _hasHint() {
      return this.state.searchResults.length > 0 || this._hasCustomValue();
    }
  }, {
    key: "_hasFixedOptions",
    value: function _hasFixedOptions() {
      return Array.isArray(this.props.fixedOptions) && this.props.fixedOptions.length;
    }
  }, {
    key: "render",
    value: function render() {
      var inputClasses = {};
      inputClasses[this.props.customClasses.input] = Boolean(this.props.customClasses.input);
      var inputClassList = (0, _classnames["default"])(inputClasses);
      var classes = (0, _defineProperty2["default"])({}, DEFAULT_CLASS, this.props.defaultClassNames);
      classes[this.props.className] = Boolean(this.props.className);
      var classList = (0, _classnames["default"])(classes);
      return /*#__PURE__*/_react["default"].createElement(TypeaheadWrapper, {
        className: classList,
        ref: this.root,
        tabIndex: "0",
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this._onFocus
      }, this._renderHiddenInput(), this.props.searchable ? /*#__PURE__*/_react["default"].createElement(InputBox, null, /*#__PURE__*/_react["default"].createElement(TypeaheadInput, (0, _extends2["default"])({
        ref: this.entry,
        type: "text",
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onBlur: this._onBlur
      })), /*#__PURE__*/_react["default"].createElement(InputIcon, null, /*#__PURE__*/_react["default"].createElement(_icons.Search, {
        height: "18px"
      }))) : null, this._renderIncrementalSearchResults());
    }
  }]);
  return Typeahead;
}(_react.Component);

(0, _defineProperty2["default"])(Typeahead, "propTypes", {
  name: _propTypes["default"].string,
  customClasses: _propTypes["default"].object,
  maxVisible: _propTypes["default"].number,
  resultsTruncatedMessage: _propTypes["default"].string,
  options: _propTypes["default"].arrayOf(_propTypes["default"].any),
  fixedOptions: _propTypes["default"].arrayOf(_propTypes["default"].any),
  allowCustomValues: _propTypes["default"].number,
  initialValue: _propTypes["default"].string,
  value: _propTypes["default"].string,
  placeholder: _propTypes["default"].string,
  disabled: _propTypes["default"].bool,
  textarea: _propTypes["default"].bool,
  inputProps: _propTypes["default"].object,
  onOptionSelected: _propTypes["default"].func,
  onChange: _propTypes["default"].func,
  onKeyDown: _propTypes["default"].func,
  onKeyPress: _propTypes["default"].func,
  onKeyUp: _propTypes["default"].func,
  onFocus: _propTypes["default"].func,
  onBlur: _propTypes["default"].func,
  filterOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  searchOptions: _propTypes["default"].func,
  displayOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  inputDisplayOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  formInputOption: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
  defaultClassNames: _propTypes["default"].bool,
  customListComponent: _propTypes["default"].oneOfType([_propTypes["default"].element, _propTypes["default"].func]),
  customListItemComponent: _propTypes["default"].oneOfType([_propTypes["default"].element, _propTypes["default"].func]),
  customListHeaderComponent: _propTypes["default"].oneOfType([_propTypes["default"].element, _propTypes["default"].func]),
  showOptionsWhenEmpty: _propTypes["default"].bool,
  searchable: _propTypes["default"].bool
});
(0, _defineProperty2["default"])(Typeahead, "defaultProps", {
  options: [],
  customClasses: {},
  allowCustomValues: 0,
  initialValue: '',
  value: '',
  placeholder: '',
  disabled: false,
  textarea: false,
  inputProps: {},
  onOptionSelected: function onOptionSelected(option) {},
  onChange: function onChange(event) {},
  onKeyDown: function onKeyDown(event) {},
  onKeyPress: function onKeyPress(event) {},
  onKeyUp: function onKeyUp(event) {},
  onFocus: function onFocus(event) {},
  onBlur: function onBlur(event) {},
  filterOption: null,
  searchOptions: null,
  inputDisplayOption: null,
  defaultClassNames: true,
  customListComponent: _dropdownList["default"],
  customListItemComponent: _dropdownList.ListItem,
  customListHeaderComponent: null,
  showOptionsWhenEmpty: true,
  searchable: true,
  resultsTruncatedMessage: null
});
(0, _reactLifecyclesCompat.polyfill)(Typeahead);
var _default = Typeahead;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9pdGVtLXNlbGVjdG9yL3R5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX0NMQVNTIiwiVHlwZWFoZWFkV3JhcHBlciIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJkcm9wZG93bkxpc3RCZ2QiLCJkcm9wZG93bkxpc3RTaGFkb3ciLCJJbnB1dEJveCIsIlR5cGVhaGVhZElucHV0IiwiaW5wdXQiLCJzZWNvbmRhcnlJbnB1dCIsInNlY29uZGFyeUlucHV0QmdkIiwiSW5wdXRJY29uIiwiaW5wdXRQbGFjZWhvbGRlckNvbG9yIiwiZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbiIsInNlYXJjaE9wdGlvbnMiLCJmaWx0ZXJPcHRpb24iLCJDb25zb2xlIiwid2FybiIsInZhbHVlIiwib3B0aW9ucyIsImZpbHRlciIsIm8iLCJtYXBwZXIiLCJBY2Nlc3NvciIsImdlbmVyYXRlQWNjZXNzb3IiLCJJREVOVElUWV9GTiIsImZ1enp5IiwiZXh0cmFjdCIsIm1hcCIsInJlcyIsImluZGV4IiwiZ2V0T3B0aW9uc0ZvclZhbHVlIiwic3RhdGUiLCJzaG93T3B0aW9uc1doZW5FbXB0eSIsInNlYXJjaGFibGUiLCJzaG91bGRTa2lwU2VhcmNoIiwiZW1wdHlWYWx1ZSIsInRyaW0iLCJsZW5ndGgiLCJpc0ZvY3VzZWQiLCJUeXBlYWhlYWQiLCJzZWFyY2hSZXN1bHRzIiwiZW50cnlWYWx1ZSIsImVudHJ5IiwiY3VycmVudCIsImZvY3VzIiwiYWxsb3dDdXN0b21WYWx1ZXMiLCJpbmRleE9mIiwiX2hhc0N1c3RvbVZhbHVlIiwib3B0aW9uIiwiZXZlbnQiLCJzZXRTdGF0ZSIsInNlbGVjdGlvbiIsIm9uT3B0aW9uU2VsZWN0ZWQiLCJnZXRTZWxlY3Rpb24iLCJvbktleURvd24iLCJfb25PcHRpb25TZWxlY3RlZCIsInNlbGVjdGlvbkluZGV4IiwiX2dldEN1c3RvbVZhbHVlIiwiZXZlbnRzIiwiS2V5RXZlbnQiLCJET01fVktfVVAiLCJuYXZVcCIsIkRPTV9WS19ET1dOIiwibmF2RG93biIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJfb25FbnRlciIsIkRPTV9WS19FU0NBUEUiLCJfb25Fc2NhcGUiLCJET01fVktfVEFCIiwiX29uVGFiIiwiZGVsdGEiLCJfaGFzSGludCIsIm5ld0luZGV4IiwibWF4VmlzaWJsZSIsInNsaWNlIiwiX25hdiIsIm9uQ2hhbmdlIiwiX29uVGV4dEVudHJ5VXBkYXRlZCIsInNoaWZ0S2V5IiwiaGFuZGxlciIsImV2ZW50TWFwIiwia2V5Q29kZSIsInByZXZlbnREZWZhdWx0Iiwib25Gb2N1cyIsIm9uQmx1ciIsImluaXRpYWxWYWx1ZSIsInJvb3QiLCJmaXhlZE9wdGlvbnMiLCJyZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSIsImN1c3RvbUNsYXNzZXMiLCJjdXN0b21MaXN0SXRlbUNvbXBvbmVudCIsImN1c3RvbUxpc3RIZWFkZXJDb21wb25lbnQiLCJkZWZhdWx0Q2xhc3NOYW1lcyIsImRpc3BsYXlPcHRpb24iLCJzZWxlY3RlZEl0ZW1zIiwiX2hhc0ZpeGVkT3B0aW9ucyIsIm5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCJpbnB1dENsYXNzZXMiLCJCb29sZWFuIiwiaW5wdXRDbGFzc0xpc3QiLCJjbGFzc2VzIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiX29uS2V5RG93biIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwiX29uRm9jdXMiLCJfcmVuZGVySGlkZGVuSW5wdXQiLCJkaXNhYmxlZCIsImlucHV0UHJvcHMiLCJwbGFjZWhvbGRlciIsIl9vbkNoYW5nZSIsIl9vbkJsdXIiLCJfcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzIiwiQ29tcG9uZW50IiwiUHJvcFR5cGVzIiwic3RyaW5nIiwib2JqZWN0IiwibnVtYmVyIiwiYXJyYXlPZiIsImFueSIsImJvb2wiLCJ0ZXh0YXJlYSIsImZ1bmMiLCJvbmVPZlR5cGUiLCJpbnB1dERpc3BsYXlPcHRpb24iLCJmb3JtSW5wdXRPcHRpb24iLCJjdXN0b21MaXN0Q29tcG9uZW50IiwiZWxlbWVudCIsIkRyb3Bkb3duTGlzdCIsIkxpc3RJdGVtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLGFBQWEsR0FBRyxXQUF0QjtBQUNBOzs7Ozs7O0FBT0EsSUFBTUMsZ0JBQWdCLEdBQUdDLDZCQUFPQyxHQUFWLG9CQUdBLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsZUFBaEI7QUFBQSxDQUhMLEVBSU4sVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxrQkFBaEI7QUFBQSxDQUpDLENBQXRCOztBQVdBLElBQU1DLFFBQVEsR0FBR04sNkJBQU9DLEdBQVYsb0JBQWQ7O0FBSUEsSUFBTU0sY0FBYyxHQUFHUCw2QkFBT1EsS0FBVixxQkFDaEIsVUFBQU4sS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZTSxjQUFoQjtBQUFBLENBRFcsRUFHSSxVQUFBUCxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlPLGlCQUFoQjtBQUFBLENBSFQsQ0FBcEI7O0FBT0EsSUFBTUMsU0FBUyxHQUFHWCw2QkFBT0MsR0FBVixxQkFJSixVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlTLHFCQUFoQjtBQUFBLENBSkQsQ0FBZjs7QUFPQSxTQUFTQyxzQkFBVCxDQUFnQ1gsS0FBaEMsRUFBdUM7QUFBQSxNQUM5QlksYUFEOEIsR0FDQ1osS0FERCxDQUM5QlksYUFEOEI7QUFBQSxNQUNmQyxZQURlLEdBQ0NiLEtBREQsQ0FDZmEsWUFEZTs7QUFFckMsTUFBSSxPQUFP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QUxhO0FBTXBCZ0csRUFBQUEsV0FBVyxFQUFFLEVBTk87QUFPcEJGLEVBQUFBLFFBQVEsRUFBRSxLQVBVO0FBUXBCYyxFQUFBQSxRQUFRLEVBQUUsS0FSVTtBQVNwQmIsRUFBQUEsVUFBVSxFQUFFLEVBVFE7QUFVcEI1RCxFQUFBQSxnQkFWb0IsNEJBVUhKLE1BVkcsRUFVSyxDQUFFLENBVlA7QUFXcEI2QixFQUFBQSxRQVhvQixvQkFXWDVCLEtBWFcsRUFXSixDQUFFLENBWEU7QUFZcEJLLEVBQUFBLFNBWm9CLHFCQVlWTCxLQVpVLEVBWUgsQ0FBRSxDQVpDO0FBYXBCMEQsRUFBQUEsVUFib0Isc0JBYVQxRCxLQWJTLEVBYUYsQ0FBRSxDQWJBO0FBY3BCMkQsRUFBQUEsT0Fkb0IsbUJBY1ozRCxLQWRZLEVBY0wsQ0FBRSxDQWRHO0FBZXBCbUMsRUFBQUEsT0Fmb0IsbUJBZVpuQyxLQWZZLEVBZUwsQ0FBRSxDQWZHO0FBZ0JwQm9DLEVBQUFBLE1BaEJvQixrQkFnQmJwQyxLQWhCYSxFQWdCTixDQUFFLENBaEJJO0FBaUJwQm5DLEVBQUFBLFlBQVksRUFBRSxJQWpCTTtBQWtCcEJELEVBQUFBLGFBQWEsRUFBRSxJQWxCSztBQW1CcEJtSCxFQUFBQSxrQkFBa0IsRUFBRSxJQW5CQTtBQW9CcEJuQyxFQUFBQSxpQkFBaUIsRUFBRSxJQXBCQztBQXFCcEJxQyxFQUFBQSxtQkFBbUIsRUFBRUUsd0JBckJEO0FBc0JwQnpDLEVBQUFBLHVCQUF1QixFQUFFMEMsc0JBdEJMO0FBdUJwQnpDLEVBQUFBLHlCQUF5QixFQUFFLElBdkJQO0FBd0JwQjVELEVBQUFBLG9CQUFvQixFQUFFLElBeEJGO0FBeUJwQkMsRUFBQUEsVUFBVSxFQUFFLElBekJRO0FBMEJwQndELEVBQUFBLHVCQUF1QixFQUFFO0FBMUJMLEM7QUFpVnhCLHFDQUFTbEQsU0FBVDtlQUVlQSxTIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7Q29tcG9uZW50LCBjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7cG9seWZpbGx9IGZyb20gJ3JlYWN0LWxpZmVjeWNsZXMtY29tcGF0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgZnV6enkgZnJvbSAnZnV6enknO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7Y29uc29sZSBhcyBDb25zb2xlfSBmcm9tICdnbG9iYWwvd2luZG93JztcblxuaW1wb3J0IEFjY2Vzc29yIGZyb20gJy4vYWNjZXNzb3InO1xuaW1wb3J0IERyb3Bkb3duTGlzdCwge0xpc3RJdGVtfSBmcm9tICcuL2Ryb3Bkb3duLWxpc3QnO1xuaW1wb3J0IHtTZWFyY2h9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBLZXlFdmVudCBmcm9tICdjb25zdGFudHMva2V5ZXZlbnQnO1xuXG5jb25zdCBERUZBVUxUX0NMQVNTID0gJ3R5cGVhaGVhZCc7XG4vKipcbiAqIENvcGllZCBtb3N0bHkgZnJvbSAncmVhY3QtdHlwZWFoZWFkJywgYW4gYXV0by1jb21wbGV0aW5nIHRleHQgaW5wdXRcbiAqXG4gKiBSZW5kZXJzIGFuIHRleHQgaW5wdXQgdGhhdCBzaG93cyBvcHRpb25zIG5lYXJieSB0aGF0IHlvdSBjYW4gdXNlIHRoZVxuICoga2V5Ym9hcmQgb3IgbW91c2UgdG8gc2VsZWN0LlxuICovXG5cbmNvbnN0IFR5cGVhaGVhZFdyYXBwZXIgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmRyb3Bkb3duTGlzdEJnZH07XG4gIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25MaXN0U2hhZG93fTtcblxuICA6Zm9jdXMge1xuICAgIG91dGxpbmU6IDA7XG4gIH1cbmA7XG5cbmNvbnN0IElucHV0Qm94ID0gc3R5bGVkLmRpdmBcbiAgcGFkZGluZzogOHB4O1xuYDtcblxuY29uc3QgVHlwZWFoZWFkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2Vjb25kYXJ5SW5wdXR9IDpob3ZlciB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2Vjb25kYXJ5SW5wdXRCZ2R9O1xuICB9XG5gO1xuXG5jb25zdCBJbnB1dEljb24gPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiAxNXB4O1xuICB0b3A6IDE0cHg7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmlucHV0UGxhY2Vob2xkZXJDb2xvcn07XG5gO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZVNlYXJjaEZ1bmN0aW9uKHByb3BzKSB7XG4gIGNvbnN0IHtzZWFyY2hPcHRpb25zLCBmaWx0ZXJPcHRpb259ID0gcHJvcHM7XG4gIGlmICh0eXBlb2Ygc2VhcmNoT3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmaWx0ZXJPcHRpb24gIT09IG51bGwpIHtcbiAgICAgIENvbnNvbGUud2Fybignc2VhcmNoT3B0aW9ucyBwcm9wIGlzIGJlaW5nIHVzZWQsIGZpbHRlck9wdGlvbiBwcm9wIHdpbGwgYmUgaWdub3JlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gc2VhcmNoT3B0aW9ucztcbiAgfSBlbHNlIGlmICh0eXBlb2YgZmlsdGVyT3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gdXNlIGN1c3RvbSBmaWx0ZXIgb3B0aW9uXG4gICAgcmV0dXJuICh2YWx1ZSwgb3B0aW9ucykgPT4gb3B0aW9ucy5maWx0ZXIobyA9PiBmaWx0ZXJPcHRpb24odmFsdWUsIG8pKTtcbiAgfVxuXG4gIGNvbnN0IG1hcHBlciA9XG4gICAgdHlwZW9mIGZpbHRlck9wdGlvbiA9PT0gJ3N0cmluZydcbiAgICAgID8gQWNjZXNzb3IuZ2VuZXJhdGVBY2Nlc3NvcihmaWx0ZXJPcHRpb24pXG4gICAgICA6IEFjY2Vzc29yLklERU5USVRZX0ZOO1xuXG4gIHJldHVybiAodmFsdWUsIG9wdGlvbnMpID0+XG4gICAgZnV6enkuZmlsdGVyKHZhbHVlLCBvcHRpb25zLCB7ZXh0cmFjdDogbWFwcGVyfSkubWFwKHJlcyA9PiBvcHRpb25zW3Jlcy5pbmRleF0pO1xufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zRm9yVmFsdWUodmFsdWUsIHByb3BzLCBzdGF0ZSkge1xuICBjb25zdCB7b3B0aW9ucywgc2hvd09wdGlvbnNXaGVuRW1wdHl9ID0gcHJvcHM7XG5cbiAgaWYgKCFwcm9wcy5zZWFyY2hhYmxlKSB7XG4gICAgLy8gZGlyZWN0bHkgcGFzcyB0aHJvdWdoIG9wdGlvbnMgaWYgY2FuIG5vdCBiZSBzZWFyY2hlZFxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG4gIGlmIChzaG91bGRTa2lwU2VhcmNoKHZhbHVlLCBzdGF0ZSwgc2hvd09wdGlvbnNXaGVuRW1wdHkpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICBjb25zdCBzZWFyY2hPcHRpb25zID0gZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbihwcm9wcyk7XG4gIHJldHVybiBzZWFyY2hPcHRpb25zKHZhbHVlLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkU2tpcFNlYXJjaChpbnB1dCwgc3RhdGUsIHNob3dPcHRpb25zV2hlbkVtcHR5KSB7XG4gIGNvbnN0IGVtcHR5VmFsdWUgPSAhaW5wdXQgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PT0gMDtcblxuICAvLyB0aGlzLnN0YXRlIG11c3QgYmUgY2hlY2tlZCBiZWNhdXNlIGl0IG1heSBub3QgYmUgZGVmaW5lZCB5ZXQgaWYgdGhpcyBmdW5jdGlvblxuICAvLyBpcyBjYWxsZWQgZnJvbSB3aXRoaW4gZ2V0SW5pdGlhbFN0YXRlXG4gIGNvbnN0IGlzRm9jdXNlZCA9IHN0YXRlICYmIHN0YXRlLmlzRm9jdXNlZDtcbiAgcmV0dXJuICEoc2hvd09wdGlvbnNXaGVuRW1wdHkgJiYgaXNGb2N1c2VkKSAmJiBlbXB0eVZhbHVlO1xufVxuXG5jbGFzcyBUeXBlYWhlYWQgZXh0ZW5kcyBDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgY3VzdG9tQ2xhc3NlczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBtYXhWaXNpYmxlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9wdGlvbnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLFxuICAgIGZpeGVkT3B0aW9uczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSksXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0ZXh0YXJlYTogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5wdXRQcm9wczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbk9wdGlvblNlbGVjdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlck9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBzZWFyY2hPcHRpb25zOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIGlucHV0RGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5lbGVtZW50LCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIGN1c3RvbUxpc3RJdGVtQ29tcG9uZW50OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuZWxlbWVudCwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBjdXN0b21MaXN0SGVhZGVyQ29tcG9uZW50OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuZWxlbWVudCwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogUHJvcFR5cGVzLmJvb2wsXG4gICAgc2VhcmNoYWJsZTogUHJvcFR5cGVzLmJvb2xcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIG9wdGlvbnM6IFtdLFxuICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgdmFsdWU6ICcnLFxuICAgIHBsYWNlaG9sZGVyOiAnJyxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgdGV4dGFyZWE6IGZhbHNlLFxuICAgIGlucHV0UHJvcHM6IHt9LFxuICAgIG9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uKSB7fSxcbiAgICBvbkNoYW5nZShldmVudCkge30sXG4gICAgb25LZXlEb3duKGV2ZW50KSB7fSxcbiAgICBvbktleVByZXNzKGV2ZW50KSB7fSxcbiAgICBvbktleVVwKGV2ZW50KSB7fSxcbiAgICBvbkZvY3VzKGV2ZW50KSB7fSxcbiAgICBvbkJsdXIoZXZlbnQpIHt9LFxuICAgIGZpbHRlck9wdGlvbjogbnVsbCxcbiAgICBzZWFyY2hPcHRpb25zOiBudWxsLFxuICAgIGlucHV0RGlzcGxheU9wdGlvbjogbnVsbCxcbiAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICBjdXN0b21MaXN0Q29tcG9uZW50OiBEcm9wZG93bkxpc3QsXG4gICAgY3VzdG9tTGlzdEl0ZW1Db21wb25lbnQ6IExpc3RJdGVtLFxuICAgIGN1c3RvbUxpc3RIZWFkZXJDb21wb25lbnQ6IG51bGwsXG4gICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IHRydWUsXG4gICAgc2VhcmNoYWJsZTogdHJ1ZSxcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogbnVsbFxuICB9O1xuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMocHJvcHMsIHN0YXRlKSB7XG4gICAgLy8gIGludm9rZWQgYWZ0ZXIgYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGFzIHdlbGwgYXMgYmVmb3JlIGl0IGlzIHJlLXJlbmRlcmVkXG4gICAgY29uc3Qgc2VhcmNoUmVzdWx0cyA9IGdldE9wdGlvbnNGb3JWYWx1ZShzdGF0ZS5lbnRyeVZhbHVlLCBwcm9wcywgc3RhdGUpO1xuXG4gICAgcmV0dXJuIHtzZWFyY2hSZXN1bHRzfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlYXJjaFJlc3VsdHM6IFtdLFxuXG4gICAgICAvLyBUaGlzIHNob3VsZCBiZSBjYWxsZWQgc29tZXRoaW5nIGVsc2UsICdlbnRyeVZhbHVlJ1xuICAgICAgZW50cnlWYWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB8fCB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZSxcblxuICAgICAgLy8gQSB2YWxpZCB0eXBlYWhlYWQgdmFsdWVcbiAgICAgIHNlbGVjdGlvbjogdGhpcy5wcm9wcy52YWx1ZSxcblxuICAgICAgLy8gSW5kZXggb2YgdGhlIHNlbGVjdGlvblxuICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGwsXG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGZvY3VzIHN0YXRlIG9mIHRoZSBpbnB1dCBlbGVtZW50LCB0byBkZXRlcm1pbmVcbiAgICAgIC8vIHdoZXRoZXIgdG8gc2hvdyBvcHRpb25zIHdoZW4gZW1wdHkgKGlmIHNob3dPcHRpb25zV2hlbkVtcHR5IGlzIHRydWUpXG4gICAgICBpc0ZvY3VzZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIGNhbGwgZm9jdXMgb24gZW50cnkgb3IgZGl2IHRvIHRyaWdnZXIga2V5IGV2ZW50cyBsaXN0ZW5lclxuICAgIGlmICh0aGlzLmVudHJ5LmN1cnJlbnQpIHtcbiAgICAgIHRoaXMuZW50cnkuY3VycmVudC5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvb3QuY3VycmVudC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHJvb3QgPSBjcmVhdGVSZWYoKTtcbiAgZW50cnkgPSBjcmVhdGVSZWYoKTtcblxuICBmb2N1cyA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5lbnRyeS5jdXJyZW50KSB7XG4gICAgICB0aGlzLmVudHJ5LmN1cnJlbnQuZm9jdXMoKTtcbiAgICB9XG4gIH07XG5cbiAgX2hhc0N1c3RvbVZhbHVlID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzID4gMCAmJlxuICAgICAgdGhpcy5zdGF0ZS5lbnRyeVZhbHVlLmxlbmd0aCA+PSB0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzICYmXG4gICAgICB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuaW5kZXhPZih0aGlzLnN0YXRlLmVudHJ5VmFsdWUpIDwgMFxuICAgICk7XG4gIH07XG5cbiAgX2dldEN1c3RvbVZhbHVlID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNDdXN0b21WYWx1ZSgpID8gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlIDogbnVsbDtcbiAgfTtcblxuICBfcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dGhpcy5wcm9wcy5jdXN0b21MaXN0Q29tcG9uZW50XG4gICAgICAgIGZpeGVkT3B0aW9ucz17dGhpcy5wcm9wcy5maXhlZE9wdGlvbnN9XG4gICAgICAgIG9wdGlvbnM9e1xuICAgICAgICAgIHRoaXMucHJvcHMubWF4VmlzaWJsZVxuICAgICAgICAgICAgPyB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuc2xpY2UoMCwgdGhpcy5wcm9wcy5tYXhWaXNpYmxlKVxuICAgICAgICAgICAgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNcbiAgICAgICAgfVxuICAgICAgICBhcmVSZXN1bHRzVHJ1bmNhdGVkPXtcbiAgICAgICAgICB0aGlzLnByb3BzLm1heFZpc2libGUgJiYgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmxlbmd0aCA+IHRoaXMucHJvcHMubWF4VmlzaWJsZVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlPXt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICBvbk9wdGlvblNlbGVjdGVkPXt0aGlzLl9vbk9wdGlvblNlbGVjdGVkfVxuICAgICAgICBhbGxvd0N1c3RvbVZhbHVlcz17dGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlc31cbiAgICAgICAgY3VzdG9tVmFsdWU9e3RoaXMuX2dldEN1c3RvbVZhbHVlKCl9XG4gICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgY3VzdG9tTGlzdEl0ZW1Db21wb25lbnQ9e3RoaXMucHJvcHMuY3VzdG9tTGlzdEl0ZW1Db21wb25lbnR9XG4gICAgICAgIGN1c3RvbUxpc3RIZWFkZXJDb21wb25lbnQ9e3RoaXMucHJvcHMuY3VzdG9tTGlzdEhlYWRlckNvbXBvbmVudH1cbiAgICAgICAgc2VsZWN0aW9uSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXh9XG4gICAgICAgIGRlZmF1bHRDbGFzc05hbWVzPXt0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzfVxuICAgICAgICBkaXNwbGF5T3B0aW9uPXt0aGlzLnByb3BzLmRpc3BsYXlPcHRpb259XG4gICAgICAgIHNlbGVjdGVkSXRlbXM9e3RoaXMucHJvcHMuc2VsZWN0ZWRJdGVtc31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIGdldFNlbGVjdGlvbigpIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4O1xuXG4gICAgaWYgKHRoaXMuX2hhc0N1c3RvbVZhbHVlKCkpIHtcbiAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlO1xuICAgICAgfVxuICAgICAgaW5kZXgtLTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2hhc0ZpeGVkT3B0aW9ucygpKSB7XG4gICAgICByZXR1cm4gaW5kZXggPCB0aGlzLnByb3BzLmZpeGVkT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgPyB0aGlzLnByb3BzLmZpeGVkT3B0aW9uc1tpbmRleF1cbiAgICAgICAgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNbaW5kZXggLSB0aGlzLnByb3BzLmZpeGVkT3B0aW9ucy5sZW5ndGhdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzW2luZGV4XTtcbiAgfVxuXG4gIF9vbk9wdGlvblNlbGVjdGVkID0gKG9wdGlvbiwgZXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWFyY2hhYmxlKSB7XG4gICAgICAvLyByZXNldCBlbnRyeSBpbnB1dFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlYXJjaFJlc3VsdHM6IGdldE9wdGlvbnNGb3JWYWx1ZSgnJywgdGhpcy5wcm9wcywgdGhpcy5zdGF0ZSksXG4gICAgICAgIHNlbGVjdGlvbjogJycsXG4gICAgICAgIGVudHJ5VmFsdWU6ICcnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKG9wdGlvbiwgZXZlbnQpO1xuICB9O1xuXG4gIC8vIHVzZSAoKSA9PiB7fSB0byBhdm9pZCBiaW5kaW5nICd0aGlzJ1xuICBfb25UZXh0RW50cnlVcGRhdGVkID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5lbnRyeS5jdXJyZW50LnZhbHVlO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2VhcmNoUmVzdWx0czogZ2V0T3B0aW9uc0ZvclZhbHVlKHZhbHVlLCB0aGlzLnByb3BzLCB0aGlzLnN0YXRlKSxcbiAgICAgICAgc2VsZWN0aW9uOiAnJyxcbiAgICAgICAgZW50cnlWYWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBfb25FbnRlciA9IGV2ZW50ID0+IHtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb25PcHRpb25TZWxlY3RlZChzZWxlY3Rpb24sIGV2ZW50KTtcbiAgfTtcblxuICBfb25Fc2NhcGUgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbFxuICAgIH0pO1xuICB9O1xuXG4gIF9vblRhYiA9IGV2ZW50ID0+IHtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgIGxldCBvcHRpb24gPSBzZWxlY3Rpb25cbiAgICAgID8gc2VsZWN0aW9uXG4gICAgICA6IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiAwXG4gICAgICA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0c1swXVxuICAgICAgOiBudWxsO1xuXG4gICAgaWYgKG9wdGlvbiA9PT0gbnVsbCAmJiB0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBvcHRpb24gPSB0aGlzLl9nZXRDdXN0b21WYWx1ZSgpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vbk9wdGlvblNlbGVjdGVkKG9wdGlvbiwgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBldmVudE1hcCA9IGV2ZW50ID0+IHtcbiAgICBjb25zdCBldmVudHMgPSB7fTtcblxuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfVVBdID0gdGhpcy5uYXZVcDtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0RPV05dID0gdGhpcy5uYXZEb3duO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfUkVUVVJOXSA9IGV2ZW50c1tLZXlFdmVudC5ET01fVktfRU5URVJdID0gdGhpcy5fb25FbnRlcjtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0VTQ0FQRV0gPSB0aGlzLl9vbkVzY2FwZTtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX1RBQl0gPSB0aGlzLl9vblRhYjtcblxuICAgIHJldHVybiBldmVudHM7XG4gIH07XG5cbiAgX25hdiA9IGRlbHRhID0+IHtcbiAgICBpZiAoIXRoaXMuX2hhc0hpbnQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgbmV3SW5kZXggPVxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCA9PT0gbnVsbFxuICAgICAgICA/IGRlbHRhID09PSAxXG4gICAgICAgICAgPyAwXG4gICAgICAgICAgOiBkZWx0YVxuICAgICAgICA6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBkZWx0YTtcbiAgICBsZXQgbGVuZ3RoID0gdGhpcy5wcm9wcy5tYXhWaXNpYmxlXG4gICAgICA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpLmxlbmd0aFxuICAgICAgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBsZW5ndGggKz0gMTtcbiAgICB9XG5cbiAgICBpZiAobmV3SW5kZXggPCAwKSB7XG4gICAgICBuZXdJbmRleCArPSBsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChuZXdJbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgIG5ld0luZGV4IC09IGxlbmd0aDtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogbmV3SW5kZXh9KTtcbiAgfTtcblxuICBuYXZEb3duID0gKCkgPT4ge1xuICAgIHRoaXMuX25hdigxKTtcbiAgfTtcblxuICBuYXZVcCA9ICgpID0+IHtcbiAgICB0aGlzLl9uYXYoLTEpO1xuICB9O1xuXG4gIF9vbkNoYW5nZSA9IGV2ZW50ID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb25UZXh0RW50cnlVcGRhdGVkKCk7XG4gIH07XG5cbiAgX29uS2V5RG93biA9IGV2ZW50ID0+IHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gdmlzaWJsZSBlbGVtZW50cywgZG9uJ3QgcGVyZm9ybSBzZWxlY3RvciBuYXZpZ2F0aW9uLlxuICAgIC8vIEp1c3QgcGFzcyB0aGlzIHVwIHRvIHRoZSB1cHN0cmVhbSBvbktleWRvd24gaGFuZGxlci5cbiAgICAvLyBBbHNvIHNraXAgaWYgdGhlIHVzZXIgaXMgcHJlc3NpbmcgdGhlIHNoaWZ0IGtleSwgc2luY2Ugbm9uZSBvZiBvdXIgaGFuZGxlcnMgYXJlIGxvb2tpbmcgZm9yIHNoaWZ0XG4gICAgaWYgKCF0aGlzLl9oYXNIaW50KCkgfHwgZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uS2V5RG93bihldmVudCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFuZGxlciA9IHRoaXMuZXZlbnRNYXAoKVtldmVudC5rZXlDb2RlXTtcblxuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgcHJvcGFnYXRlIHRoZSBrZXlzdHJva2UgYmFjayB0byB0aGUgRE9NL2Jyb3dzZXJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9O1xuXG4gIF9vbkZvY3VzID0gZXZlbnQgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe2lzRm9jdXNlZDogdHJ1ZX0pO1xuICAgIGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBfb25CbHVyID0gZXZlbnQgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe2lzRm9jdXNlZDogZmFsc2V9KTtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIF9yZW5kZXJIaWRkZW5JbnB1dCgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT17dGhpcy5wcm9wcy5uYW1lfSB2YWx1ZT17dGhpcy5zdGF0ZS5zZWxlY3Rpb259IC8+O1xuICB9XG5cbiAgX2hhc0hpbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiAwIHx8IHRoaXMuX2hhc0N1c3RvbVZhbHVlKCk7XG4gIH1cblxuICBfaGFzRml4ZWRPcHRpb25zKCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMucHJvcHMuZml4ZWRPcHRpb25zKSAmJiB0aGlzLnByb3BzLmZpeGVkT3B0aW9ucy5sZW5ndGg7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0ge307XG4gICAgaW5wdXRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5pbnB1dF0gPSBCb29sZWFuKHRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5pbnB1dCk7XG4gICAgY29uc3QgaW5wdXRDbGFzc0xpc3QgPSBjbGFzc05hbWVzKGlucHV0Q2xhc3Nlcyk7XG5cbiAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgW0RFRkFVTFRfQ0xBU1NdOiB0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzXG4gICAgfTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY2xhc3NOYW1lXSA9IEJvb2xlYW4odGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFR5cGVhaGVhZFdyYXBwZXJcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgIHJlZj17dGhpcy5yb290fVxuICAgICAgICB0YWJJbmRleD1cIjBcIlxuICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgb25LZXlQcmVzcz17dGhpcy5wcm9wcy5vbktleVByZXNzfVxuICAgICAgICBvbktleVVwPXt0aGlzLnByb3BzLm9uS2V5VXB9XG4gICAgICAgIG9uRm9jdXM9e3RoaXMuX29uRm9jdXN9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJIaWRkZW5JbnB1dCgpfVxuICAgICAgICB7dGhpcy5wcm9wcy5zZWFyY2hhYmxlID8gKFxuICAgICAgICAgIDxJbnB1dEJveD5cbiAgICAgICAgICAgIDxUeXBlYWhlYWRJbnB1dFxuICAgICAgICAgICAgICByZWY9e3RoaXMuZW50cnl9XG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgICAgIHsuLi50aGlzLnByb3BzLmlucHV0UHJvcHN9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2lucHV0Q2xhc3NMaXN0fVxuICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5lbnRyeVZhbHVlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5fb25CbHVyfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxJbnB1dEljb24+XG4gICAgICAgICAgICAgIDxTZWFyY2ggaGVpZ2h0PVwiMThweFwiIC8+XG4gICAgICAgICAgICA8L0lucHV0SWNvbj5cbiAgICAgICAgICA8L0lucHV0Qm94PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3RoaXMuX3JlbmRlckluY3JlbWVudGFsU2VhcmNoUmVzdWx0cygpfVxuICAgICAgPC9UeXBlYWhlYWRXcmFwcGVyPlxuICAgICk7XG4gIH1cbn1cblxucG9seWZpbGwoVHlwZWFoZWFkKTtcblxuZXhwb3J0IGRlZmF1bHQgVHlwZWFoZWFkO1xuIl19