"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactIntl = require("react-intl");

var _localization = require("../../localization");

var _styledComponents = require("./styled-components");

var _icons = require("./icons");

var _styledComponents2 = _interopRequireDefault(require("styled-components"));

var _utils = require("../../utils/utils");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  margin-left: 10px;\n  color: ", ";\n  display: inline-flex;\n  .info-helper__content {\n    max-width: 100px;\n  }\n  :hover {\n    cursor: pointer;\n    color: ", ";\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var StyledInfoHelper = _styledComponents2["default"].div(_templateObject(), function (props) {
  return props.theme.labelColor;
}, function (props) {
  return props.theme.textColorHl;
});

function InfoHelperFactory() {
  var propTypes = {
    description: _propTypes["default"].string.isRequired,
    containerClass: _propTypes["default"].string
  };

  var InfoHelper = function InfoHelper(_ref) {
    var description = _ref.description,
        property = _ref.property,
        containerClass = _ref.containerClass,
        id = _ref.id;
    // TODO: move intl out
    var intl = (0, _reactIntl.useIntl)();
    return /*#__PURE__*/_react["default"].createElement(StyledInfoHelper, {
      className: "info-helper ".concat(containerClass || ''),
      "data-tip": true,
      "data-for": id
    }, /*#__PURE__*/_react["default"].createElement(_icons.Docs, {
      height: "16px"
    }), /*#__PURE__*/_react["default"].createElement(_styledComponents.Tooltip, {
      id: id,
      effect: "solid"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "info-helper__content"
    }, description && /*#__PURE__*/_react["default"].createElement(_localization.FormattedMessage, {
      id: description,
      defaultValue: description,
      values: {
        property: intl.formatMessage({
          id: property ? "property.".concat((0, _utils.camelize)(property)) : 'misc.empty'
        })
      }
    }))));
  };

  InfoHelper.propTypes = propTypes;
  return InfoHelper;
}

var _default = InfoHelperFactory;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9pbmZvLWhlbHBlci5qcyJdLCJuYW1lcyI6WyJTdHlsZWRJbmZvSGVscGVyIiwic3R5bGVkIiwiZGl2IiwicHJvcHMiLCJ0aGVtZSIsImxhYmVsQ29sb3IiLCJ0ZXh0Q29sb3JIbCIsIkluZm9IZWxwZXJGYWN0b3J5IiwicHJvcFR5cGVzIiwiZGVzY3JpcHRpb24iLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiY29udGFpbmVyQ2xhc3MiLCJJbmZvSGVscGVyIiwicHJvcGVydHkiLCJpZCIsImludGwiLCJmb3JtYXRNZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsZ0JBQWdCLEdBQUdDLDhCQUFPQyxHQUFWLG9CQUdYLFVBQUFDLEtBQUs7QUFBQSxTQUFJQSxLQUFLLENBQUNDLEtBQU4sQ0FBWUMsVUFBaEI7QUFBQSxDQUhNLEVBVVQsVUFBQUYsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZRSxXQUFoQjtBQUFBLENBVkksQ0FBdEI7O0FBY0EsU0FBU0MsaUJBQVQsR0FBNkI7QUFDM0IsTUFBTUMsU0FBUyxHQUFHO0FBQ2hCQyxJQUFBQSxXQUFXLEVBQUVDLHNCQUFVQyxNQUFWLENBQWlCQyxVQURkO0FBRWhCQyxJQUFBQSxjQUFjLEVBQUVILHNCQUFVQztBQUZWLEdBQWxCOztBQUlBLE1BQU1HLFVBQVUsR0FBRyxTQUFiQSxVQUFhLE9BQWlEO0FBQUEsUUFBL0NMLFdBQStDLFFBQS9DQSxXQUErQztBQUFBLFFBQWxDTSxRQUFrQyxRQUFsQ0EsUUFBa0M7QUFBQSxRQUF4QkYsY0FBd0IsUUFBeEJBLGNBQXdCO0FBQUEsUUFBUkcsRUFBUSxRQUFSQSxFQUFRO0FBQ2xFO0FBQ0EsUUFBTUMsSUFBSSxHQUFHLHlCQUFiO0FBRUEsd0JBQ0UsZ0NBQUMsZ0JBQUQ7QUFBa0IsTUFBQSxTQUFTLHdCQUFpQkosY0FBYyxJQUFJLEVBQW5DLENBQTNCO0FBQW9FLHNCQUFwRTtBQUE2RSxrQkFBVUc7QUFBdkYsb0JBQ0UsZ0NBQUMsV0FBRDtBQUFNLE1BQUEsTUFBTSxFQUFDO0FBQWIsTUFERixlQUVFLGdDQUFDLHlCQUFEO0FBQVMsTUFBQSxFQUFFLEVBQUVBLEVBQWI7QUFBaUIsTUFBQSxNQUFNLEVBQUM7QUFBeEIsb0JBQ0U7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0dQLFdBQVcsaUJBQ1YsZ0NBQUMsOEJBQUQ7QUFDRSxNQUFBLEVBQUUsRUFBRUEsV0FETjtBQUVFLE1BQUEsWUFBWSxFQUFFQSxXQUZoQjtBQUdFLE1BQUEsTUFBTSxFQUFFO0FBQ05NLFFBQUFBLFFBQVEsRUFBRUUsSUFBSSxDQUFDQyxhQUFMLENBQW1CO0FBQzNCRixVQUFBQSxFQUFFLEVBQUVELFFBQVEsc0JBQWUscUJBQVNBLFFBQVQsQ0FBZixJQUFzQztBQUR2QixTQUFuQjtBQURKO0FBSFYsTUFGSixDQURGLENBRkYsQ0FERjtBQW9CRCxHQXhCRDs7QUF5QkFELEVBQUFBLFVBQVUsQ0FBQ04sU0FBWCxHQUF1QkEsU0FBdkI7QUFDQSxTQUFPTSxVQUFQO0FBQ0Q7O2VBRWNQLGlCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge3VzZUludGx9IGZyb20gJ3JlYWN0LWludGwnO1xuaW1wb3J0IHtGb3JtYXR0ZWRNZXNzYWdlfSBmcm9tICdsb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtUb29sdGlwfSBmcm9tICcuL3N0eWxlZC1jb21wb25lbnRzJztcbmltcG9ydCB7RG9jc30gZnJvbSAnY29tcG9uZW50cy9jb21tb24vaWNvbnMnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQge2NhbWVsaXplfSBmcm9tICd1dGlscy91dGlscyc7XG5cbmNvbnN0IFN0eWxlZEluZm9IZWxwZXIgPSBzdHlsZWQuZGl2YFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBtYXJnaW4tbGVmdDogMTBweDtcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAuaW5mby1oZWxwZXJfX2NvbnRlbnQge1xuICAgIG1heC13aWR0aDogMTAwcHg7XG4gIH1cbiAgOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9ySGx9O1xuICB9XG5gO1xuXG5mdW5jdGlvbiBJbmZvSGVscGVyRmFjdG9yeSgpIHtcbiAgY29uc3QgcHJvcFR5cGVzID0ge1xuICAgIGRlc2NyaXB0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgY29udGFpbmVyQ2xhc3M6IFByb3BUeXBlcy5zdHJpbmdcbiAgfTtcbiAgY29uc3QgSW5mb0hlbHBlciA9ICh7ZGVzY3JpcHRpb24sIHByb3BlcnR5LCBjb250YWluZXJDbGFzcywgaWR9KSA9PiB7XG4gICAgLy8gVE9ETzogbW92ZSBpbnRsIG91dFxuICAgIGNvbnN0IGludGwgPSB1c2VJbnRsKCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFN0eWxlZEluZm9IZWxwZXIgY2xhc3NOYW1lPXtgaW5mby1oZWxwZXIgJHtjb250YWluZXJDbGFzcyB8fCAnJ31gfSBkYXRhLXRpcCBkYXRhLWZvcj17aWR9PlxuICAgICAgICA8RG9jcyBoZWlnaHQ9XCIxNnB4XCIgLz5cbiAgICAgICAgPFRvb2x0aXAgaWQ9e2lkfSBlZmZlY3Q9XCJzb2xpZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5mby1oZWxwZXJfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgIHtkZXNjcmlwdGlvbiAmJiAoXG4gICAgICAgICAgICAgIDxGb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgICAgICAgaWQ9e2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17ZGVzY3JpcHRpb259XG4gICAgICAgICAgICAgICAgdmFsdWVzPXt7XG4gICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogaW50bC5mb3JtYXRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHByb3BlcnR5ID8gYHByb3BlcnR5LiR7Y2FtZWxpemUocHJvcGVydHkpfWAgOiAnbWlzYy5lbXB0eSdcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvVG9vbHRpcD5cbiAgICAgIDwvU3R5bGVkSW5mb0hlbHBlcj5cbiAgICApO1xuICB9O1xuICBJbmZvSGVscGVyLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbiAgcmV0dXJuIEluZm9IZWxwZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEluZm9IZWxwZXJGYWN0b3J5O1xuIl19