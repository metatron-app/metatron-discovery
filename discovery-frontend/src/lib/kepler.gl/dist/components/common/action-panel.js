"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ActionPanelItem = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _classnames = _interopRequireDefault(require("classnames"));

var _icons = require("./icons");

var _switch = _interopRequireDefault(require("./switch"));

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: ", ";\n  box-shadow: ", ";\n  transition: ", ";\n  color: ", ";\n\n  .action-panel-item {\n    ", "\n\n    &:last-of-type {\n      border-bottom: 0;\n    }\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  label {\n    margin-bottom: 0;\n    color: ", ";\n    padding-left: 20px;\n    line-height: 12px;\n\n    &:before {\n      width: 12px;\n      height: 12px;\n      background-color: ", ";\n    }\n    &:hover {\n      color: ", ";\n    }\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  font-size: 12px;\n  line-height: 14px;\n  padding: 8px;\n  min-height: ", "px;\n  text-transform: capitalize;\n  background-color: ", ";\n  width: ", "px;\n  position: relative;\n  ", "\n\n  :hover {\n    cursor: pointer;\n    color: ", ";\n    .nested-group {\n      display: block;\n    }\n  }\n\n  .label {\n    margin-left: 8px;\n  }\n\n  .label-icon {\n    margin-left: auto;\n  }\n\n  .nested-group {\n    width: 110px;\n    display: none;\n    color: ", ";\n    position: absolute;\n    left: 110px;\n    top: 0px;\n    padding-left: 4px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledItem = _styledComponents["default"].div(_templateObject(), function (props) {
  return props.theme.actionPanelHeight;
}, function (props) {
  return props.theme.dropdownListBgd;
}, function (props) {
  return props.theme.actionPanelWidth;
}, function (props) {
  return props.color ? "border-left: 3px solid rgb(".concat(props.color, ");") : '';
}, function (props) {
  return props.theme.textColorHl;
}, function (props) {
  return props.theme.textColor;
});

var StyledCheckedbox = (0, _styledComponents["default"])(_switch["default"])(_templateObject2(), function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.dropdownListBgd;
}, function (props) {
  return props.theme.textColorHl;
});

var renderChildren = function renderChildren(child, index) {
  return /*#__PURE__*/_react["default"].cloneElement(child, {
    onClick: function onClick() {
      if ( /*#__PURE__*/_react["default"].isValidElement(child)) {
        if (child.props.onClick) {
          child.props.onClick(index);
        }
      }
    },
    className: (0, _classnames["default"])('action-panel-item', child.props.className)
  });
};

var ActionPanelItem = /*#__PURE__*/_react["default"].memo(function (_ref) {
  var children = _ref.children,
      color = _ref.color,
      className = _ref.className,
      Icon = _ref.Icon,
      label = _ref.label,
      onClick = _ref.onClick,
      isSelection = _ref.isSelection,
      isActive = _ref.isActive,
      style = _ref.style;
  var onClickCallback = (0, _react.useCallback)(function (event) {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  }, [onClick]);
  return /*#__PURE__*/_react["default"].createElement(StyledItem, {
    className: className,
    onClick: onClickCallback,
    color: color,
    style: style
  }, Icon ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "icon"
  }, /*#__PURE__*/_react["default"].createElement(Icon, {
    height: "16px"
  })) : null, isSelection ? /*#__PURE__*/_react["default"].createElement(StyledCheckedbox, {
    type: "checkbox",
    checked: Boolean(isActive),
    id: "switch-".concat(label),
    secondary: true,
    label: label
  }) : /*#__PURE__*/_react["default"].createElement("span", {
    className: "label"
  }, label), children && children.length ? /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("div", {
    className: "label-icon"
  }, /*#__PURE__*/_react["default"].createElement(_icons.ArrowRight, {
    height: "16px"
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "nested-group"
  }, _react["default"].Children.map(children, renderChildren))) : null);
});

exports.ActionPanelItem = ActionPanelItem;
ActionPanelItem.displayName = 'ActionPanelItem';

var StyledActionPanel = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.direction;
}, function (props) {
  return props.theme.dropdownListShadow;
}, function (props) {
  return props.theme.transitionSlow;
}, function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.direction === 'column' ? "border-bottom: 1px solid ".concat(props.theme.panelHeaderIcon) : "border-right: 1px solid ".concat(props.theme.panelHeaderIcon);
}); // React compound element https://medium.com/@Dane_s/react-js-compound-components-a6e54b5c9992


var ActionPanel = function ActionPanel(_ref2) {
  var children = _ref2.children,
      className = _ref2.className,
      _ref2$direction = _ref2.direction,
      direction = _ref2$direction === void 0 ? 'column' : _ref2$direction;
  return /*#__PURE__*/_react["default"].createElement(StyledActionPanel, {
    className: className,
    direction: direction
  }, _react["default"].Children.map(children, renderChildren));
};

ActionPanel.displayName = 'ActionPanel';
var _default = ActionPanel;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9hY3Rpb24tcGFuZWwuanMiXSwibmFtZXMiOlsiU3R5bGVkSXRlbSIsInN0eWxlZCIsImRpdiIsInByb3BzIiwidGhlbWUiLCJhY3Rpb25QYW5lbEhlaWdodCIsImRyb3Bkb3duTGlzdEJnZCIsImFjdGlvblBhbmVsV2lkdGgiLCJjb2xvciIsInRleHRDb2xvckhsIiwidGV4dENvbG9yIiwiU3R5bGVkQ2hlY2tlZGJveCIsIkNoZWNrYm94IiwicmVuZGVyQ2hpbGRyZW4iLCJjaGlsZCIsImluZGV4IiwiUmVhY3QiLCJjbG9uZUVsZW1lbnQiLCJvbkNsaWNrIiwiaXNWYWxpZEVsZW1lbnQiLCJjbGFzc05hbWUiLCJBY3Rpb25QYW5lbEl0ZW0iLCJtZW1vIiwiY2hpbGRyZW4iLCJJY29uIiwibGFiZWwiLCJpc1NlbGVjdGlvbiIsImlzQWN0aXZlIiwic3R5bGUiLCJvbkNsaWNrQ2FsbGJhY2siLCJldmVudCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiQm9vbGVhbiIsImxlbmd0aCIsIkNoaWxkcmVuIiwibWFwIiwiZGlzcGxheU5hbWUiLCJTdHlsZWRBY3Rpb25QYW5lbCIsImRpcmVjdGlvbiIsImRyb3Bkb3duTGlzdFNoYWRvdyIsInRyYW5zaXRpb25TbG93IiwicGFuZWxIZWFkZXJJY29uIiwiQWN0aW9uUGFuZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsVUFBVSxHQUFHQyw2QkFBT0MsR0FBVixvQkFPQSxVQUFBQyxLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlDLGlCQUFoQjtBQUFBLENBUEwsRUFTTSxVQUFBRixLQUFLO0FBQUEsU0FBSUEsS0FBSyxDQUFDQyxLQUFOLENBQVlFLGVBQWhCO0FBQUEsQ0FUWCxFQVVMLFVB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LFFBQUY7QUFBQSxNQUFZSCxTQUFaLFNBQVlBLFNBQVo7QUFBQSw4QkFBdUJtQixTQUF2QjtBQUFBLE1BQXVCQSxTQUF2QixnQ0FBbUMsUUFBbkM7QUFBQSxzQkFDbEIsZ0NBQUMsaUJBQUQ7QUFBbUIsSUFBQSxTQUFTLEVBQUVuQixTQUE5QjtBQUF5QyxJQUFBLFNBQVMsRUFBRW1CO0FBQXBELEtBQ0d2QixrQkFBTW1CLFFBQU4sQ0FBZUMsR0FBZixDQUFtQmIsUUFBbkIsRUFBNkJWLGNBQTdCLENBREgsQ0FEa0I7QUFBQSxDQUFwQjs7QUFNQThCLFdBQVcsQ0FBQ04sV0FBWixHQUEwQixhQUExQjtlQUVlTSxXIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0LCB7dXNlQ2FsbGJhY2t9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge0Fycm93UmlnaHR9IGZyb20gJ2NvbXBvbmVudHMvY29tbW9uL2ljb25zJztcbmltcG9ydCBDaGVja2JveCBmcm9tICdjb21wb25lbnRzL2NvbW1vbi9zd2l0Y2gnO1xuXG5jb25zdCBTdHlsZWRJdGVtID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBsaW5lLWhlaWdodDogMTRweDtcbiAgcGFkZGluZzogOHB4O1xuICBtaW4taGVpZ2h0OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmFjdGlvblBhbmVsSGVpZ2h0fXB4O1xuICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5kcm9wZG93bkxpc3RCZ2R9O1xuICB3aWR0aDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5hY3Rpb25QYW5lbFdpZHRofXB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICR7cHJvcHMgPT4gKHByb3BzLmNvbG9yID8gYGJvcmRlci1sZWZ0OiAzcHggc29saWQgcmdiKCR7cHJvcHMuY29sb3J9KTtgIDogJycpfVxuXG4gIDpob3ZlciB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckhsfTtcbiAgICAubmVzdGVkLWdyb3VwIHtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIH1cbiAgfVxuXG4gIC5sYWJlbCB7XG4gICAgbWFyZ2luLWxlZnQ6IDhweDtcbiAgfVxuXG4gIC5sYWJlbC1pY29uIHtcbiAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgfVxuXG4gIC5uZXN0ZWQtZ3JvdXAge1xuICAgIHdpZHRoOiAxMTBweDtcbiAgICBkaXNwbGF5OiBub25lO1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGxlZnQ6IDExMHB4O1xuICAgIHRvcDogMHB4O1xuICAgIHBhZGRpbmctbGVmdDogNHB4O1xuICB9XG5gO1xuXG5jb25zdCBTdHlsZWRDaGVja2VkYm94ID0gc3R5bGVkKENoZWNrYm94KWBcbiAgbGFiZWwge1xuICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbiAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XG4gICAgbGluZS1oZWlnaHQ6IDEycHg7XG5cbiAgICAmOmJlZm9yZSB7XG4gICAgICB3aWR0aDogMTJweDtcbiAgICAgIGhlaWdodDogMTJweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25MaXN0QmdkfTtcbiAgICB9XG4gICAgJjpob3ZlciB7XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JIbH07XG4gICAgfVxuICB9XG5gO1xuXG5jb25zdCByZW5kZXJDaGlsZHJlbiA9IChjaGlsZCwgaW5kZXgpID0+XG4gIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwge1xuICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgIGlmIChSZWFjdC5pc1ZhbGlkRWxlbWVudChjaGlsZCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgICBjaGlsZC5wcm9wcy5vbkNsaWNrKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2xhc3NOYW1lOiBjbGFzc25hbWVzKCdhY3Rpb24tcGFuZWwtaXRlbScsIGNoaWxkLnByb3BzLmNsYXNzTmFtZSlcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCBBY3Rpb25QYW5lbEl0ZW0gPSBSZWFjdC5tZW1vKFxuICAoe2NoaWxkcmVuLCBjb2xvciwgY2xhc3NOYW1lLCBJY29uLCBsYWJlbCwgb25DbGljaywgaXNTZWxlY3Rpb24sIGlzQWN0aXZlLCBzdHlsZX0pID0+IHtcbiAgICBjb25zdCBvbkNsaWNrQ2FsbGJhY2sgPSB1c2VDYWxsYmFjayhcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9uQ2xpY2soKTtcbiAgICAgIH0sXG4gICAgICBbb25DbGlja11cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxTdHlsZWRJdGVtIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSBvbkNsaWNrPXtvbkNsaWNrQ2FsbGJhY2t9IGNvbG9yPXtjb2xvcn0gc3R5bGU9e3N0eWxlfT5cbiAgICAgICAge0ljb24gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uXCI+XG4gICAgICAgICAgICA8SWNvbiBoZWlnaHQ9XCIxNnB4XCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHtpc1NlbGVjdGlvbiA/IChcbiAgICAgICAgICA8U3R5bGVkQ2hlY2tlZGJveFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4oaXNBY3RpdmUpfVxuICAgICAgICAgICAgaWQ9e2Bzd2l0Y2gtJHtsYWJlbH1gfVxuICAgICAgICAgICAgc2Vjb25kYXJ5XG4gICAgICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIHtjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGggPyAoXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGFiZWwtaWNvblwiPlxuICAgICAgICAgICAgICA8QXJyb3dSaWdodCBoZWlnaHQ9XCIxNnB4XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJuZXN0ZWQtZ3JvdXBcIj57UmVhY3QuQ2hpbGRyZW4ubWFwKGNoaWxkcmVuLCByZW5kZXJDaGlsZHJlbil9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9TdHlsZWRJdGVtPlxuICAgICk7XG4gIH1cbik7XG5cbkFjdGlvblBhbmVsSXRlbS5kaXNwbGF5TmFtZSA9ICdBY3Rpb25QYW5lbEl0ZW0nO1xuXG5jb25zdCBTdHlsZWRBY3Rpb25QYW5lbCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiAke3Byb3BzID0+IHByb3BzLmRpcmVjdGlvbn07XG4gIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuZHJvcGRvd25MaXN0U2hhZG93fTtcbiAgdHJhbnNpdGlvbjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50cmFuc2l0aW9uU2xvd307XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG5cbiAgLmFjdGlvbi1wYW5lbC1pdGVtIHtcbiAgICAke3Byb3BzID0+XG4gICAgICBwcm9wcy5kaXJlY3Rpb24gPT09ICdjb2x1bW4nXG4gICAgICAgID8gYGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAke3Byb3BzLnRoZW1lLnBhbmVsSGVhZGVySWNvbn1gXG4gICAgICAgIDogYGJvcmRlci1yaWdodDogMXB4IHNvbGlkICR7cHJvcHMudGhlbWUucGFuZWxIZWFkZXJJY29ufWB9XG5cbiAgICAmOmxhc3Qtb2YtdHlwZSB7XG4gICAgICBib3JkZXItYm90dG9tOiAwO1xuICAgIH1cbiAgfVxuYDtcblxuLy8gUmVhY3QgY29tcG91bmQgZWxlbWVudCBodHRwczovL21lZGl1bS5jb20vQERhbmVfcy9yZWFjdC1qcy1jb21wb3VuZC1jb21wb25lbnRzLWE2ZTU0YjVjOTk5MlxuY29uc3QgQWN0aW9uUGFuZWwgPSAoe2NoaWxkcmVuLCBjbGFzc05hbWUsIGRpcmVjdGlvbiA9ICdjb2x1bW4nfSkgPT4gKFxuICA8U3R5bGVkQWN0aW9uUGFuZWwgY2xhc3NOYW1lPXtjbGFzc05hbWV9IGRpcmVjdGlvbj17ZGlyZWN0aW9ufT5cbiAgICB7UmVhY3QuQ2hpbGRyZW4ubWFwKGNoaWxkcmVuLCByZW5kZXJDaGlsZHJlbil9XG4gIDwvU3R5bGVkQWN0aW9uUGFuZWw+XG4pO1xuXG5BY3Rpb25QYW5lbC5kaXNwbGF5TmFtZSA9ICdBY3Rpb25QYW5lbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGlvblBhbmVsO1xuIl19