"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckMark = exports.TruncatedTitleText = exports.StyledFilterContent = exports.MapControlButton = exports.BottomWidgetInner = exports.WidgetContainer = exports.StyledType = exports.StyledFilteredOption = exports.StyledExportSection = exports.StyledAttrbution = exports.StyledMapContainer = exports.StyledModalInputFootnote = exports.StyledModalSection = exports.StyledModalVerticalPanel = exports.StyledModalContent = exports.Table = exports.SelectionButton = exports.DatasetSquare = exports.ButtonGroup = exports.StyledPanelDropdown = exports.StyledPanelHeader = exports.InlineInput = exports.TextAreaLight = exports.TextArea = exports.InputLight = exports.Input = exports.Button = exports.Tooltip = exports.SidePanelDivider = exports.SidePanelSection = exports.PanelContent = exports.PanelHeaderContent = exports.PanelHeaderTitle = exports.PanelLabelBold = exports.PanelLabelWrapper = exports.PanelLabel = exports.SBFlexboxNoMargin = exports.SBFlexboxItem = exports.SpaceBetweenFlexbox = exports.CenterVerticalFlexbox = exports.CenterFlexbox = exports.IconRoundSmall = exports.SelectTextBold = exports.SelectText = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactTooltip = _interopRequireDefault(require("react-tooltip"));

var _mediaBreakpoints = require("../../styles/media-breakpoints");

var _classnames = _interopRequireDefault(require("classnames"));

function _templateObject48() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  position: absolute;\n  top: 0;\n  right: 0;\n  display: block;\n  width: 10px;\n  height: 10px;\n  border-top-left-radius: 2px;\n\n  :after {\n    position: absolute;\n    display: table;\n    border: 1px solid #fff;\n    border-top: 0;\n    border-left: 0;\n    transform: rotate(45deg) scale(1) translate(-50%, -50%);\n    opacity: 1;\n    content: ' ';\n    top: 40%;\n    left: 30%;\n    width: 3.2px;\n    height: 6.22px;\n  }\n"]);

  _templateObject48 = function _templateObject48() {
    return data;
  };

  return data;
}

function _templateObject47() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n"]);

  _templateObject47 = function _templateObject47() {
    return data;
  };

  return data;
}

function _templateObject46() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  padding: 12px;\n"]);

  _templateObject46 = function _templateObject46() {
    return data;
  };

  return data;
}

function _templateObject45() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.16);\n  height: 32px;\n  width: 32px;\n  padding: 0;\n  border-radius: 0;\n  background-color: ", ";\n  color: ", ";\n  border: ", ";\n\n  :hover,\n  :focus,\n  :active,\n  &.active {\n    background-color: ", ";\n    color: ", ";\n    border: ", ";\n  }\n  svg {\n    margin-right: 0;\n  }\n"]);

  _templateObject45 = function _templateObject45() {
    return data;
  };

  return data;
}

function _templateObject44() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  padding: ", ";\n  position: relative;\n  margin-top: ", "px;\n"]);

  _templateObject44 = function _templateObject44() {
    return data;
  };

  return data;
}

function _templateObject43() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  z-index: 1;\n"]);

  _templateObject43 = function _templateObject43() {
    return data;
  };

  return data;
}

function _templateObject42() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  height: 100px;\n  margin: 4px;\n  padding: 6px 10px;\n  width: 100px;\n"]);

  _templateObject42 = function _templateObject42() {
    return data;
  };

  return data;
}

function _templateObject41() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  margin: 4px;\n  padding: 8px 12px;\n  width: 140px;\n\n  .filter-option-title {\n    color: ", ";\n    font-size: 12px;\n    font-weight: 500;\n  }\n  .filter-option-subtitle {\n    color: ", ";\n    font-size: 11px;\n  }\n"]);

  _templateObject41 = function _templateObject41() {
    return data;
  };

  return data;
}

function _templateObject40() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: row;\n  margin: 35px 0;\n  width: 100%;\n  color: ", ";\n  font-size: 12px;\n  opacity: ", ";\n  pointer-events: ", ";\n\n  .description {\n    width: 185px;\n    .title {\n      font-weight: 500;\n    }\n    .subtitle {\n      color: ", ";\n      font-size: 11px;\n    }\n  }\n  .warning {\n    color: ", ";\n    font-weight: 500;\n  }\n  .description.full {\n    width: 100%;\n  }\n  .selection {\n    display: flex;\n    flex-wrap: wrap;\n    flex: 1;\n    padding-left: 50px;\n\n    select {\n      background-color: white;\n      border-radius: 1px;\n      display: inline-block;\n      font: inherit;\n      line-height: 1.5em;\n      padding: 0.5em 3.5em 0.5em 1em;\n      margin: 0;\n      box-sizing: border-box;\n      appearance: none;\n      width: 250px;\n      height: 36px;\n\n      background-image: linear-gradient(45deg, transparent 50%, gray 50%),\n        linear-gradient(135deg, gray 50%, transparent 50%), linear-gradient(to right, #ccc, #ccc);\n      background-position: calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px),\n        calc(100% - 2.5em) 4.5em;\n      background-size: 5px 5px, 5px 5px, 1px 1.5em;\n      background-repeat: no-repeat;\n    }\n\n    select:focus {\n      background-image: linear-gradient(45deg, green 50%, transparent 50%),\n        linear-gradient(135deg, transparent 50%, green 50%), linear-gradient(to right, #ccc, #ccc);\n      background-position: calc(100% - 15px) 1em, calc(100% - 20px) 1em, calc(100% - 2.5em) 4.5em;\n      background-size: 5px 5px, 5px 5px, 1px 1.5em;\n      background-repeat: no-repeat;\n      border-color: green;\n      outline: 0;\n    }\n  }\n"]);

  _templateObject40 = function _templateObject40() {
    return data;
  };

  return data;
}

function _templateObject39() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  bottom: 0;\n  right: 0;\n  position: absolute;\n  display: block;\n  margin: 0 10px 2px;\n  z-index: 0;\n\n  .attrition-logo {\n    display: flex;\n    font-size: 10px;\n    justify-content: flex-end;\n    align-items: center;\n    color: ", ";\n\n    a.mapboxgl-ctrl-logo {\n      width: 72px;\n      margin-left: 6px;\n    }\n  }\n  a {\n    font-size: 10px;\n  }\n"]);

  _templateObject39 = function _templateObject39() {
    return data;
  };

  return data;
}

function _templateObject38() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  .mapboxgl-map {\n    .mapboxgl-missing-css {\n      display: none;\n    }\n    .mapboxgl-ctrl-attrib {\n      display: none;\n    }\n  }\n"]);

  _templateObject38 = function _templateObject38() {
    return data;
  };

  return data;
}

function _templateObject37() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: flex-end;\n  color: ", ";\n  font-size: 10px;\n"]);

  _templateObject37 = function _templateObject37() {
    return data;
  };

  return data;
}

function _templateObject36() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 16px;\n  "]);

  _templateObject36 = function _templateObject36() {
    return data;
  };

  return data;
}

function _templateObject35() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    margin-bottom: 24px;\n  "]);

  _templateObject35 = function _templateObject35() {
    return data;
  };

  return data;
}

function _templateObject34() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 32px;\n\n  .modal-section-title {\n    font-weight: 500;\n  }\n  .modal-section-subtitle {\n    color: ", ";\n  }\n\n  input {\n    margin-top: 8px;\n  }\n\n  ", ";\n  ", ";\n"]);

  _templateObject34 = function _templateObject34() {
    return data;
  };

  return data;
}

function _templateObject33() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n      margin-top: 0;\n    "]);

  _templateObject33 = function _templateObject33() {
    return data;
  };

  return data;
}

function _templateObject32() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  justify-content: space-around;\n  font-size: 12px;\n\n  .modal-section:first-child {\n    margin-top: 24px;\n    ", ";\n  }\n\n  input {\n    margin-right: 8px;\n  }\n"]);

  _templateObject32 = function _templateObject32() {
    return data;
  };

  return data;
}

function _templateObject31() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n    flex-direction: column;\n    padding: 16px ", ";\n    margin: 0 -", ";\n  "]);

  _templateObject31 = function _templateObject31() {
    return data;
  };

  return data;
}

function _templateObject30() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background: ", ";\n  color: ", ";\n  display: flex;\n  flex-direction: row;\n  font-size: 10px;\n  padding: 24px ", ";\n  margin: 0 -", ";\n  justify-content: space-between;\n  ", ";\n"]);

  _templateObject30 = function _templateObject30() {
    return data;
  };

  return data;
}

function _templateObject29() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  width: 100%;\n  border-spacing: 0;\n\n  thead {\n    tr th {\n      background: ", ";\n      color: ", ";\n      padding: 18px 12px;\n      text-align: start;\n    }\n  }\n\n  tbody {\n    tr td {\n      border-bottom: ", ";\n      padding: 12px;\n    }\n  }\n"]);

  _templateObject29 = function _templateObject29() {
    return data;
  };

  return data;
}

function _templateObject28() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  position: relative;\n  border-radius: 2px;\n  border: 1px solid\n    ", ";\n  color: ", ";\n  background-color: ", ";\n\n  cursor: pointer;\n  font-weight: 500;\n  margin-right: 6px;\n  padding: 6px 16px;\n\n  :hover {\n    color: ", ";\n    border: 1px solid ", ";\n  }\n"]);

  _templateObject28 = function _templateObject28() {
    return data;
  };

  return data;
}

function _templateObject27() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: inline-block;\n  width: 8px;\n  height: 8px;\n  background-color: rgb(", ");\n  margin-right: 12px;\n"]);

  _templateObject27 = function _templateObject27() {
    return data;
  };

  return data;
}

function _templateObject26() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  .button {\n    border-radius: 0;\n    margin-left: 2px;\n  }\n  .button:first-child {\n    border-bottom-left-radius: ", ";\n    border-top-left-radius: ", ";\n    margin-left: 0;\n  }\n  .button:last-child {\n    border-bottom-right-radius: ", ";\n    border-top-right-radius: ", ";\n  }\n"]);

  _templateObject26 = function _templateObject26() {
    return data;
  };

  return data;
}

function _templateObject25() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", "\n  background-color: ", ";\n  overflow-y: auto;\n  box-shadow: ", ";\n  border-radius: ", ";\n  max-height: 500px;\n  position: relative;\n  z-index: 999;\n"]);

  _templateObject25 = function _templateObject25() {
    return data;
  };

  return data;
}

function _templateObject24() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  border-left: 3px solid\n    rgb(\n      ", "\n    );\n  padding: 0 10px 0 0;\n  height: ", "px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  border-radius: ", ";\n  transition: ", ";\n"]);

  _templateObject24 = function _templateObject24() {
    return data;
  };

  return data;
}

function _templateObject23() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n"]);

  _templateObject23 = function _templateObject23() {
    return data;
  };

  return data;
}

function _templateObject22() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", "\n  height: auto;\n  white-space: pre-wrap;\n"]);

  _templateObject22 = function _templateObject22() {
    return data;
  };

  return data;
}

function _templateObject21() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n"]);

  _templateObject21 = function _templateObject21() {
    return data;
  };

  return data;
}

function _templateObject20() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", "\n"]);

  _templateObject20 = function _templateObject20() {
    return data;
  };

  return data;
}

function _templateObject19() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  ", ";\n"]);

  _templateObject19 = function _templateObject19() {
    return data;
  };

  return data;
}

function _templateObject18() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  align-items: center;\n  background-color: ", ";\n  border-radius: ", ";\n  color: ", ";\n  cursor: pointer;\n  display: inline-flex;\n  font-size: ", ";\n  font-weight: 500;\n  font-family: ", ";\n  justify-content: center;\n  letter-spacing: 0.3px;\n  line-height: 14px;\n  outline: 0;\n  padding: ", ";\n  text-align: center;\n  transition: ", ";\n  vertical-align: middle;\n  width: ", ";\n  opacity: ", ";\n  pointer-events: ", ";\n  border: ", ";\n  :hover,\n  :focus,\n  :active,\n  &.active {\n    background-color: ", ";\n    color: ", ";\n  }\n\n  svg {\n    margin-right: ", ";\n  }\n"]);

  _templateObject18 = function _templateObject18() {
    return data;
  };

  return data;
}

function _templateObject17() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  &.__react_component_tooltip {\n    font-size: ", ";\n    font-weight: 500;\n    padding: 7px 18px;\n    box-shadow: ", ";\n\n    &.type-dark {\n      background-color: ", ";\n      color: ", ";\n      &.place-bottom {\n        :after {\n          border-bottom-color: ", ";\n        }\n      }\n\n      &.place-top {\n        :after {\n          border-top-color: ", ";\n        }\n      }\n\n      &.place-right {\n        :after {\n          border-right-color: ", ";\n        }\n      }\n\n      &.place-left {\n        :after {\n          border-left-color: ", ";\n        }\n      }\n    }\n  }\n"]);

  _templateObject17 = function _templateObject17() {
    return data;
  };

  return data;
}

function _templateObject16() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  border-bottom: ", " solid\n    ", ";\n  margin-bottom: ", "px;\n  height: ", "px;\n"]);

  _templateObject16 = function _templateObject16() {
    return data;
  };

  return data;
}

function _templateObject15() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  margin-bottom: 12px;\n\n  opacity: ", ";\n  pointer-events: ", ";\n"]);

  _templateObject15 = function _templateObject15() {
    return data;
  };

  return data;
}

function _templateObject14() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  background-color: ", ";\n  padding: 12px;\n"]);

  _templateObject14 = function _templateObject14() {
    return data;
  };

  return data;
}

function _templateObject13() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n  color: ", ";\n  padding-left: 12px;\n\n  .icon {\n    color: ", ";\n    display: flex;\n    align-items: center;\n    margin-right: 12px;\n  }\n"]);

  _templateObject13 = function _templateObject13() {
    return data;
  };

  return data;
}

function _templateObject12() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: 13px;\n  letter-spacing: 0.43px;\n  text-transform: capitalize;\n"]);

  _templateObject12 = function _templateObject12() {
    return data;
  };

  return data;
}

function _templateObject11() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  font-weight: 500;\n"]);

  _templateObject11 = function _templateObject11() {
    return data;
  };

  return data;
}

function _templateObject10() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: self-start;\n"]);

  _templateObject10 = function _templateObject10() {
    return data;
  };

  return data;
}

function _templateObject9() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  display: inline-block;\n  font-size: 11px;\n  font-weight: 400;\n  margin-bottom: 4px;\n  text-transform: capitalize;\n"]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: space-between;\n"]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  flex-grow: 1;\n  margin-left: 16px;\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  justify-content: space-between;\n  margin-left: -16px;\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  align-items: center;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  display: flex;\n  width: 18px;\n  height: 18px;\n  border-radius: 9px;\n  background-color: ", ";\n  color: ", ";\n  align-items: center;\n  justify-content: center;\n\n  :hover {\n    cursor: pointer;\n    background-color: ", ";\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-weight: 500;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  color: ", ";\n  font-size: ", ";\n  font-weight: 400;\n\n  i {\n    font-size: 13px;\n    margin-right: 6px;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var SelectText = _styledComponents["default"].span(_templateObject(), function (props) {
  return props.theme.labelColor;
}, function (props) {
  return props.theme.selectFontSize;
});

exports.SelectText = SelectText;
var SelectTextBold = (0, _styledComponents["default"])(SelectText)(_templateObject2(), function (props) {
  return props.theme.textColor;
});
exports.SelectTextBold = SelectTextBold;

var IconRoundSmall = _styledComponents["default"].div(_templateObject3(), function (props) {
  return props.theme.secondaryBtnBgdHover;
}, function (props) {
  return props.theme.secondaryBtnColor;
}, function (props) {
  return props.theme.secondaryBtnBgdHover;
});

exports.IconRoundSmall = IconRoundSmall;

var CenterFlexbox = _styledComponents["default"].div(_templateObject4());

exports.CenterFlexbox = CenterFlexbox;

var CenterVerticalFlexbox = _styledComponents["default"].div(_templateObject5());

exports.CenterVerticalFlexbox = CenterVerticalFlexbox;

var SpaceBetweenFlexbox = _styledComponents["default"].div(_templateObject6());

exports.SpaceBetweenFlexbox = SpaceBetweenFlexbox;

var SBFlexboxItem = _styledComponents["default"].div(_templateObject7());

exports.SBFlexboxItem = SBFlexboxItem;

var SBFlexboxNoMargin = _styledComponents["default"].div(_templateObject8());

exports.SBFlexboxNoMargin = SBFlexboxNoMargin;

var PanelLabel = _styledComponents["default"].label.attrs({
  className: 'side-panel-panel__label'
})(_templateObject9(), function (props) {
  return props.theme.labelColor;
});

exports.PanelLabel = PanelLabel;

var PanelLabelWrapper = _styledComponents["default"].div.attrs({
  className: 'side-panel-panel__label-wrapper'
})(_templateObject10());

exports.PanelLabelWrapper = PanelLabelWrapper;
var PanelLabelBold = (0, _styledComponents["default"])(PanelLabel)(_templateObject11());
exports.PanelLabelBold = PanelLabelBold;

var PanelHeaderTitle = _styledComponents["default"].span.attrs({
  className: 'side-panel-panel__header__title'
})(_templateObject12(), function (props) {
  return props.theme.textColor;
});

exports.PanelHeaderTitle = PanelHeaderTitle;

var PanelHeaderContent = _styledComponents["default"].div(_templateObject13(), function (props) {
  return props.theme.textColor;
}, function (props) {
  return props.theme.labelColor;
});

exports.PanelHeaderContent = PanelHeaderContent;

var PanelContent = _styledComponents["default"].div.attrs({
  className: 'side-panel-panel__content'
})(_templateObject14(), function (props) {
  return props.theme.panelContentBackground;
});

exports.PanelContent = PanelContent;

var SidePanelSection = _styledComponents["default"].div.attrs({
  className: 'side-panel-section'
})(_templateObject15(), function (props) {
  return props.disabled ? 0.4 : 1;
}, function (props) {
  return props.disabled ? 'none' : 'all';
});

exports.SidePanelSection = SidePanelSection;

var SidePanelDivider = _styledComponents["default"].div.attrs({
  className: 'side-panel-divider'
})(_templateObject16(), function (props) {
  return props.theme.sidepanelDividerBorder;
}, function (props) {
  return props.theme.panelBorderColor;
}, function (props) {
  return props.theme.sidepanelDividerMargin;
}, function (props) {
  return props.theme.sidepanelDividerHeight;
});

exports.SidePanelDivider = SidePanelDivider;
var Tooltip = (0, _styledComponents["default"])(_reactTooltip["default"])(_templateObject17(), function (props) {
  return props.theme.tooltipFontSize;
}, function (props) {
  return props.theme.tooltipBoxShadow;
}, function (props) {
  return props.theme.tooltipBg;
}, function (props) {
  return props.theme.tooltipColor;
}, function (props) {
  return props.theme.tooltipBg;
}, function (props) {
  return props.theme.tooltipBg;
}, function (props) {
  return props.theme.tooltipBg;
}, function (props) {
  return props.theme.tooltipBg;
});
exports.Tooltip = Tooltip;

var Button = _styledComponents["default"].div.attrs(function (props) {
  return {
    className: (0, _classnames["default"])('button', props.className)
  };
})(_templateObject18(), function (props) {
  return props.negative ? props.theme.negativeBtnBgd : props.secondary ? props.theme.secondaryBtnBgd : props.link ? props.theme.linkBtnBgd : props.floating ? props.theme.floatingBtnBgd : props.theme.primaryBtnBgd;
}, function (props) {
  return props.theme.primaryBtnRadius;
}, function (props) {
  return props.negative ? props.theme.negativeBtnColor : props.secondary ? props.theme.secondaryBtnColor : props.link ? props.theme.linkBtnColor : props.floating ? props.theme.floatingBtnColor : props.theme.primaryBtnColor;
}, function (props) {
  return props.large ? props.theme.primaryBtnFontSizeLarge : props.small ? props.theme.primaryBtnFontSizeSmall : props.theme.primaryBtnFontSizeDefault;
}, function (props) {
  return props.theme.btnFontFamily;
}, function (props) {
  return props.large ? '14px 32px' : props.small ? '6px 9px' : '9px 12px';
}, function (props) {
  return props.theme.transition;
}, function (props) {
  return props.width || 'auto';
}, function (props) {
  return props.disabled ? 0.4 : 1;
}, function (props) {
  return props.disabled ? 'none' : 'all';
}, function (props) {
  return props.secondary ? props.theme.secondaryBtnBorder : props.floating ? props.theme.floatingBtnBorder : props.link ? props.theme.linkBtnBorder : props.theme.primaryBtnBorder;
}, function (props) {
  return props.negative ? props.theme.negativeBtnBgdHover : props.secondary ? props.theme.secondaryBtnBgdHover : props.link ? props.theme.linkBtnActBgdHover : props.floating ? props.theme.floatingBtnBgdHover : props.theme.primaryBtnBgdHover;
}, function (props) {
  return props.negative ? props.theme.negativeBtnActColor : props.secondary ? props.theme.secondaryBtnActColor : props.link ? props.theme.linkBtnActColor : props.floating ? props.theme.floatingBtnActColor : props.theme.primaryBtnActColor;
}, function (props) {
  return props.large ? '10px' : props.small ? '6px' : '8px';
});

exports.Button = Button;

var Input = _styledComponents["default"].input(_templateObject19(), function (props) {
  return props.secondary ? props.theme.secondaryInput : props.theme.input;
});

exports.Input = Input;

var InputLight = _styledComponents["default"].input(_templateObject20(), function (props) {
  return props.theme.inputLT;
});

exports.InputLight = InputLight;

var TextArea = _styledComponents["default"].textarea(_templateObject21(), function (props) {
  return props.secondary ? props.theme.secondaryInput : props.theme.input;
});

exports.TextArea = TextArea;

var TextAreaLight = _styledComponents["default"].textarea(_templateObject22(), function (props) {
  return props.theme.inputLT;
});

exports.TextAreaLight = TextAreaLight;
var InlineInput = (0, _styledComponents["default"])(Input)(_templateObject23(), function (props) {
  return props.theme.inlineInput;
});
exports.InlineInput = InlineInput;

var StyledPanelHeader = _styledComponents["default"].div(_templateObject24(), function (props) {
  return props.active ? props.theme.panelBackgroundHover : props.theme.panelBackground;
}, function (props) {
  return props.labelRCGColorValues ? props.labelRCGColorValues.join(',') : 'transparent';
}, function (props) {
  return props.theme.panelHeaderHeight;
}, function (props) {
  return props.theme.panelHeaderBorderRadius;
}, function (props) {
  return props.theme.transition;
});

exports.StyledPanelHeader = StyledPanelHeader;

var StyledPanelDropdown = _styledComponents["default"].div(_templateObject25(), function (props) {
  return props.theme.panelDropdownScrollBar;
}, function (props) {
  return props.type === 'light' ? props.theme.modalDropdownBackground : props.theme.panelBackground;
}, function (props) {
  return props.theme.panelBoxShadow;
}, function (props) {
  return props.theme.panelBorderRadius;
});

exports.StyledPanelDropdown = StyledPanelDropdown;

var ButtonGroup = _styledComponents["default"].div(_templateObject26(), function (props) {
  return props.theme.primaryBtnRadius;
}, function (props) {
  return props.theme.primaryBtnRadius;
}, function (props) {
  return props.theme.primaryBtnRadius;
}, function (props) {
  return props.theme.primaryBtnRadius;
});

exports.ButtonGroup = ButtonGroup;

var DatasetSquare = _styledComponents["default"].div(_templateObject27(), function (props) {
  return props.color.join(',');
});

exports.DatasetSquare = DatasetSquare;

var SelectionButton = _styledComponents["default"].div(_templateObject28(), function (props) {
  return props.selected ? props.theme.selectionBtnBorderActColor : props.theme.selectionBtnBorderColor;
}, function (props) {
  return props.selected ? props.theme.selectionBtnActColor : props.theme.selectionBtnColor;
}, function (props) {
  return props.selected ? props.theme.selectionBtnActBgd : props.theme.selectionBtnBgd;
}, function (props) {
  return props.theme.selectionBtnActColor;
}, function (props) {
  return props.theme.selectionBtnBorderActColor;
});

exports.SelectionButton = SelectionButton;

var Table = _styledComponents["default"].table(_templateObject29(), function (props) {
  return props.theme.panelBackgroundLT;
}, function (props) {
  return props.theme.titleColorLT;
}, function (props) {
  return props.theme.panelBorderLT;
});

exports.Table = Table;

var StyledModalContent = _styledComponents["default"].div(_templateObject30(), function (props) {
  return props.theme.panelBackgroundLT;
}, function (props) {
  return props.theme.textColorLT;
}, function (props) {
  return props.theme.modalLateralPadding;
}, function (props) {
  return props.theme.modalLateralPadding;
}, _mediaBreakpoints.media.portable(_templateObject31(), function (props) {
  return props.theme.modalPortableLateralPadding;
}, function (props) {
  return props.theme.modalPortableLateralPadding;
}));

exports.StyledModalContent = StyledModalContent;

var StyledModalVerticalPanel = _styledComponents["default"].div.attrs({
  className: 'modal-vertical-panel'
})(_templateObject32(), _mediaBreakpoints.media.palm(_templateObject33()));

exports.StyledModalVerticalPanel = StyledModalVerticalPanel;

var StyledModalSection = _styledComponents["default"].div.attrs({
  className: 'modal-section'
})(_templateObject34(), function (props) {
  return props.theme.subtextColorLT;
}, _mediaBreakpoints.media.portable(_templateObject35()), _mediaBreakpoints.media.palm(_templateObject36()));

exports.StyledModalSection = StyledModalSection;

var StyledModalInputFootnote = _styledComponents["default"].div.attrs({
  className: 'modal-input__footnote'
})(_templateObject37(), function (props) {
  return props.error ? props.theme.errorColor : props.theme.subtextColorLT;
});
/**
 * Newer versions of mapbox.gl display an error message banner on top of the map by default
 * which will cause the map to display points in the wrong locations
 * This workaround will hide the error banner.
 */


exports.StyledModalInputFootnote = StyledModalInputFootnote;

var StyledMapContainer = _styledComponents["default"].div(_templateObject38());

exports.StyledMapContainer = StyledMapContainer;

var StyledAttrbution = _styledComponents["default"].div.attrs({
  className: 'mapbox-attribution-container'
})(_templateObject39(), function (props) {
  return props.theme.labelColor;
});

exports.StyledAttrbution = StyledAttrbution;

var StyledExportSection = _styledComponents["default"].div(_templateObject40(), function (props) {
  return props.theme.textColorLT;
}, function (props) {
  return props.disabled ? 0.3 : 1;
}, function (props) {
  return props.disabled ? 'none' : 'all';
}, function (props) {
  return props.theme.subtextColorLT;
}, function (props) {
  return props.theme.errorColor;
});

exports.StyledExportSection = StyledExportSection;
var StyledFilteredOption = (0, _styledComponents["default"])(SelectionButton)(_templateObject41(), function (props) {
  return props.theme.textColorLT;
}, function (props) {
  return props.theme.subtextColorLT;
});
exports.StyledFilteredOption = StyledFilteredOption;
var StyledType = (0, _styledComponents["default"])(SelectionButton)(_templateObject42());
exports.StyledType = StyledType;

var WidgetContainer = _styledComponents["default"].div(_templateObject43());

exports.WidgetContainer = WidgetContainer;

var BottomWidgetInner = _styledComponents["default"].div(_templateObject44(), function (props) {
  return props.theme.bottomWidgetBgd;
}, function (props) {
  return "".concat(props.theme.bottomInnerPdVert, "px ").concat(props.theme.bottomInnerPdSide, "px");
}, function (props) {
  return props.theme.bottomPanelGap;
});

exports.BottomWidgetInner = BottomWidgetInner;
var MapControlButton = (0, _styledComponents["default"])(Button).attrs({
  className: 'map-control-button'
})(_templateObject45(), function (props) {
  return props.active ? props.theme.floatingBtnBgdHover : props.theme.floatingBtnBgd;
}, function (props) {
  return props.active ? props.theme.floatingBtnActColor : props.theme.floatingBtnColor;
}, function (props) {
  return props.active ? props.theme.floatingBtnBorderHover : props.theme.floatingBtnBorder;
}, function (props) {
  return props.theme.floatingBtnBgdHover;
}, function (props) {
  return props.theme.floatingBtnActColor;
}, function (props) {
  return props.theme.floatingBtnBorderHover;
});
exports.MapControlButton = MapControlButton;

var StyledFilterContent = _styledComponents["default"].div(_templateObject46(), function (props) {
  return props.theme.panelContentBackground;
});

exports.StyledFilterContent = StyledFilterContent;

var TruncatedTitleText = _styledComponents["default"].div(_templateObject47());

exports.TruncatedTitleText = TruncatedTitleText;

var CheckMark = _styledComponents["default"].span.attrs({
  className: 'checkbox-inner'
})(_templateObject48(), function (props) {
  return props.theme.selectionBtnBorderActColor;
});

exports.CheckMark = CheckMark;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvbW1vbi9zdHlsZWQtY29tcG9uZW50cy5qcyJdLCJuYW1lcyI6WyJTZWxlY3RUZXh0Iiwic3R5bGVkIiwic3BhbiIsInByb3BzIiwidGhlbWUiLCJsYWJlbENvbG9yIiwic2VsZWN0Rm9udFNpemUiLCJTZWxlY3RUZXh0Qm9sZCIsInRleHRDb2xvciIsIkljb25Sb3VuZFNtYWxsIiwiZGl2Iiwic2Vjb25kYXJ5QnRuQmdkSG92ZXIiLCJzZWNvbmRhcnlCdG5Db2xvciIsIkNlbnRlckZsZXhib3giLCJDZW50ZXJWZXJ0aWNhbEZsZXhib3giLCJTcGFjZUJldHdlZW5GbGV4Ym94IiwiU0JGbGV4Ym94SXRlbSIsIlNCRmxleGJveE5vTWFyZ2luIiwiUGFuZWxMYWJlbCIsImxhYmVsIiwiYXR0cnMiLCJjbGFzc05hbWUiLCJQYW5lbExhYmVsV3JhcHBlciIsIlBhbmVsTGFiZWxCb2xkIiwiUGFuZWxIZWFkZXJUaXRsZSIsIlBhbmVsSGVhZGVyQ29udGVudCIsIlBhbmVsQ29udGVudCIsInBhbmVsQ29udGVudEJhY2tncm91bmQiLCJTaWRlUGFuZWxTZWN0aW9uIiwiZGlzYWJsZWQiLCJTaWRlUGFuZWxEaXZpZGVyIiwic2lkZXBhbmVsRGl2aWRlckJvcmRlciIsInBhbmVsQm9yZGVyQ29sb3IiLCJzaWRlcGFuZWxEaXZpZGVyTWFyZ2luIiwic2lkZXBhbmVsRGl2aWRlckhlaWdodCIsIlRvb2x0aXAiLCJSZWFjdFRvb2x0aXAiLCJ0b29sdGlwRm9udFNpemUiLCJ0b29sdGlwQm94U2hhZG93IiwidG9vbHRpcEJnIiwidG9vbHRpcENvbG9yIiwiQnV0dG9uIiwibmVnYXRpdmUiLCJuZWdhdGl2ZUJ0bkJnZCIsInNlY29uZGFyeSIsInNlY29uZGFyeUJ0bkJnZCIsImxpbmsiLCJsaW5rQnRuQmdkIiwiZmxvYXRpbmciLCJmbG9hdGluZ0J0bkJnZCIsInByaW1hcnlCdG5CZ2QiLCJwcmltYXJ5QnRuUmFkaXVzIiwibmVnYXRpdmVCdG5Db2xvciIsImxpbmtCdG5Db2xvciIsImZsb2F0aW5nQnRuQ29sb3IiLCJwcmltYXJ5QnRuQ29sb3IiLCJsYXJnZSIsInByaW1hcnlCdG5Gb250U2l6ZUxhcmdlIiwic21hbGwiLCJwcmltYXJ5QnRuRm9udFNpemVTbWFsbCIsInByaW1hcnlCdG5Gb250U2l6ZURlZmF1bHQiLCJidG5Gb250RmFtaWx5IiwidHJhbnNpdGlvbiIsIndpZHRoIiwic2Vjb25kYXJ5QnRuQm9yZGVyIiwiZmxvYXRpbmdCdG5Cb3JkZXIiLCJsaW5rQnRuQm9yZGVyIiwicHJpbWFyeUJ0bkJvcmRlciIsIm5lZ2F0aXZlQnRuQmdkSG92ZXIiLCJsaW5rQnRuQWN0QmdkSG92ZXIiLCJmbG9hdGluZ0J0bkJnZEhvdmVyIiwicHJpbWFyeUJ0bkJnZEhvdmVyIiwibmVnYXRpdmVCdG5BY3RDb2xvciIsInNlY29uZGFyeUJ0bkFjdENvbG9yIiwibGlua0J0bkFjdENvbG9yIiwiZmxvYXRpbmdCdG5BY3RDb2xvciIsInByaW1hcnlCdG5BY3RDb2xvciIsIklucHV0IiwiaW5wdXQiLCJzZWNvbmRhcnlJbnB1dCIsIklucHV0TGlnaHQiLCJpbnB1dExUIiwiVGV4dEFyZWEiLCJ0ZXh0YXJlYSIsIlRleHRBcmVhTGlnaHQiLCJJbmxpbmVJbnB1dCIsImlubGluZUlucHV0IiwiU3R5bGVkUGFuZWxIZWFkZXIiLCJhY3RpdmUiLCJwYW5lbEJhY2tncm91bmRIb3ZlciIsInBhbmVsQmFja2dyb3VuZCIsImxhYmVsUkNHQ29sb3JWYWx1ZXMiLCJqb2luIiwicGFuZWxIZWFkZXJIZWlnaHQiLCJwYW5lbEhlYWRlckJvcmRlclJhZGl1cyIsIlN0eWxlZFBhbmVsRHJvcGRvd24iLCJwYW5lbERyb3Bkb3duU2Nyb2xsQmFyIiwidHlwZSIsIm1vZGFsRHJvcGRvd25CYWNrZ3JvdW5kIiwicGFuZWxCb3hTaGFkb3ciLCJwYW5lbEJvcmRlclJhZGl1cyIsIkJ1dHRvbkdyb3VwIiwiRGF0YXNldFNxdWFyZSIsImNvbG9yIiwiU2VsZWN0aW9uQnV0dG9uIiwic2VsZWN0ZWQiLCJzZWxlY3Rpb25CdG5Cb3JkZXJBY3RDb2xvciIsInNlbGVjdGlvbkJ0bkJvcmRlckNvbG9yIiwic2VsZWN0aW9uQnRuQWN0Q29sb3IiLCJzZWxlY3Rpb25CdG5Db2xvciIsInNlbGVjdGlvbkJ0bkFjdEJnZCIsInNlbGVjdGlvbkJ0bkJnZCIsIlRhYmxlIiwidGFibGUiLCJwYW5lbEJhY2tncm91bmRMVCIsInRpdGxlQ29sb3JMVCIsInBhbmVsQm9yZGVyTFQiLCJTdHlsZWRNb2RhbENvbnRlbnQiLCJ0ZXh0Q29sb3JMVCIsIm1vZGFsTGF0ZXJhbFBhZGRpbmciLCJtZWRpYSIsInBvcnRhYmxlIiwibW9kYWxQb3J0YWJsZUxhdGVyYWxQYWRkaW5nIiwiU3R5bGVkTW9kYWxWZXJ0aWNhbFBhbmVsIiwicGFsbSIsIlN0eWxlZE1vZGFsU2VjdGlvbiIsInN1YnRleHRDb2xvckxUIiwiU3R5bGVkTW9kYWxJbnB1dEZvb3Rub3RlIiwiZXJyb3IiLCJlcnJvckNvbG9yIiwiU3R5bGVkTWFwQ29udGFpbmVyIiwiU3R5bGVkQXR0cmJ1dGlvbiIsIlN0eWxlZEV4cG9ydFNlY3Rpb24iLCJTdHlsZWRGaWx0ZXJlZE9wdGlvbiIsIlN0eWxlZFR5cGUiLCJXaWRnZXRDb250YWluZXIiLCJCb3R0b21XaWRnZXRJbm5lciIsImJvdHRvbVdpZGdldEJnZCIsImJvdHRvbUlubmVyUGRWZXJ0IiwiYm90dG9tSW5uZXJQZFNpZGUiLCJib3R0b21QYW5lbEdhcCIsIk1hcENvbnRyb2xCdXR0b24iLCJmbG9hdGluZ0J0bkJvcmRlckhvdmVyIiwiU3R5bGVkRmlsdGVyQ29udGVudCIsIlRydW5jYXRlZFRpdGxlVGV4dCIsIkNoZWNrTWFyayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QixHQUFHL0ksNkJBQU9TLEdBQVYscUJBQXhCOzs7O0FBTUEsSUFBTXVJLFNBQVMsR0FBR2hKLDZCQUFPQyxJQUFQLENBQVlrQixLQUFaLENBQWtCO0FBQ3pDQyxFQUFBQSxTQUFTLEVBQUU7QUFEOEIsQ0FBbEIsQ0FBSCxzQkFHQSxVQUFBbEIsS0FBSztBQUFBLFNBQUlBLEtBQUssQ0FBQ0MsS0FBTixDQUFZc0csMEJBQWhCO0FBQUEsQ0FITCxDQUFmIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDIwIFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgUmVhY3RUb29sdGlwIGZyb20gJ3JlYWN0LXRvb2x0aXAnO1xuaW1wb3J0IHttZWRpYX0gZnJvbSAnc3R5bGVzL21lZGlhLWJyZWFrcG9pbnRzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5leHBvcnQgY29uc3QgU2VsZWN0VGV4dCA9IHN0eWxlZC5zcGFuYFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5sYWJlbENvbG9yfTtcbiAgZm9udC1zaXplOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNlbGVjdEZvbnRTaXplfTtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcblxuICBpIHtcbiAgICBmb250LXNpemU6IDEzcHg7XG4gICAgbWFyZ2luLXJpZ2h0OiA2cHg7XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBTZWxlY3RUZXh0Qm9sZCA9IHN0eWxlZChTZWxlY3RUZXh0KWBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudGV4dENvbG9yfTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBJY29uUm91bmRTbWFsbCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIHdpZHRoOiAxOHB4O1xuICBoZWlnaHQ6IDE4cHg7XG4gIGJvcmRlci1yYWRpdXM6IDlweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zZWNvbmRhcnlCdG5CZ2RIb3Zlcn07XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNlY29uZGFyeUJ0bkNvbG9yfTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cbiAgOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zZWNvbmRhcnlCdG5CZ2RIb3Zlcn07XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJGbGV4Ym94ID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJWZXJ0aWNhbEZsZXhib3ggPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuYDtcblxuZXhwb3J0IGNvbnN0IFNwYWNlQmV0d2VlbkZsZXhib3ggPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIG1hcmdpbi1sZWZ0OiAtMTZweDtcbmA7XG5cbmV4cG9ydCBjb25zdCBTQkZsZXhib3hJdGVtID0gc3R5bGVkLmRpdmBcbiAgZmxleC1ncm93OiAxO1xuICBtYXJnaW4tbGVmdDogMTZweDtcbmA7XG5cbmV4cG9ydCBjb25zdCBTQkZsZXhib3hOb01hcmdpbiA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbmA7XG5cbmV4cG9ydCBjb25zdCBQYW5lbExhYmVsID0gc3R5bGVkLmxhYmVsLmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnc2lkZS1wYW5lbC1wYW5lbF9fbGFiZWwnXG59KWBcbiAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgZm9udC1zaXplOiAxMXB4O1xuICBmb250LXdlaWdodDogNDAwO1xuICBtYXJnaW4tYm90dG9tOiA0cHg7XG4gIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplO1xuYDtcblxuZXhwb3J0IGNvbnN0IFBhbmVsTGFiZWxXcmFwcGVyID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ3NpZGUtcGFuZWwtcGFuZWxfX2xhYmVsLXdyYXBwZXInXG59KWBcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IHNlbGYtc3RhcnQ7XG5gO1xuXG5leHBvcnQgY29uc3QgUGFuZWxMYWJlbEJvbGQgPSBzdHlsZWQoUGFuZWxMYWJlbClgXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG5gO1xuXG5leHBvcnQgY29uc3QgUGFuZWxIZWFkZXJUaXRsZSA9IHN0eWxlZC5zcGFuLmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnc2lkZS1wYW5lbC1wYW5lbF9faGVhZGVyX190aXRsZSdcbn0pYFxuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3J9O1xuICBmb250LXNpemU6IDEzcHg7XG4gIGxldHRlci1zcGFjaW5nOiAwLjQzcHg7XG4gIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplO1xuYDtcblxuZXhwb3J0IGNvbnN0IFBhbmVsSGVhZGVyQ29udGVudCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvcn07XG4gIHBhZGRpbmctbGVmdDogMTJweDtcblxuICAuaWNvbiB7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIG1hcmdpbi1yaWdodDogMTJweDtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFBhbmVsQ29udGVudCA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdzaWRlLXBhbmVsLXBhbmVsX19jb250ZW50J1xufSlgXG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxDb250ZW50QmFja2dyb3VuZH07XG4gIHBhZGRpbmc6IDEycHg7XG5gO1xuXG5leHBvcnQgY29uc3QgU2lkZVBhbmVsU2VjdGlvbiA9IHN0eWxlZC5kaXYuYXR0cnMoe1xuICBjbGFzc05hbWU6ICdzaWRlLXBhbmVsLXNlY3Rpb24nXG59KWBcbiAgbWFyZ2luLWJvdHRvbTogMTJweDtcblxuICBvcGFjaXR5OiAke3Byb3BzID0+IChwcm9wcy5kaXNhYmxlZCA/IDAuNCA6IDEpfTtcbiAgcG9pbnRlci1ldmVudHM6ICR7cHJvcHMgPT4gKHByb3BzLmRpc2FibGVkID8gJ25vbmUnIDogJ2FsbCcpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBTaWRlUGFuZWxEaXZpZGVyID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ3NpZGUtcGFuZWwtZGl2aWRlcidcbn0pYFxuICBib3JkZXItYm90dG9tOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnNpZGVwYW5lbERpdmlkZXJCb3JkZXJ9IHNvbGlkXG4gICAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbEJvcmRlckNvbG9yfTtcbiAgbWFyZ2luLWJvdHRvbTogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zaWRlcGFuZWxEaXZpZGVyTWFyZ2lufXB4O1xuICBoZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2lkZXBhbmVsRGl2aWRlckhlaWdodH1weDtcbmA7XG5cbmV4cG9ydCBjb25zdCBUb29sdGlwID0gc3R5bGVkKFJlYWN0VG9vbHRpcClgXG4gICYuX19yZWFjdF9jb21wb25lbnRfdG9vbHRpcCB7XG4gICAgZm9udC1zaXplOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRvb2x0aXBGb250U2l6ZX07XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICBwYWRkaW5nOiA3cHggMThweDtcbiAgICBib3gtc2hhZG93OiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRvb2x0aXBCb3hTaGFkb3d9O1xuXG4gICAgJi50eXBlLWRhcmsge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50b29sdGlwQmd9O1xuICAgICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudG9vbHRpcENvbG9yfTtcbiAgICAgICYucGxhY2UtYm90dG9tIHtcbiAgICAgICAgOmFmdGVyIHtcbiAgICAgICAgICBib3JkZXItYm90dG9tLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRvb2x0aXBCZ307XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgJi5wbGFjZS10b3Age1xuICAgICAgICA6YWZ0ZXIge1xuICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudG9vbHRpcEJnfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAmLnBsYWNlLXJpZ2h0IHtcbiAgICAgICAgOmFmdGVyIHtcbiAgICAgICAgICBib3JkZXItcmlnaHQtY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudG9vbHRpcEJnfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAmLnBsYWNlLWxlZnQge1xuICAgICAgICA6YWZ0ZXIge1xuICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRvb2x0aXBCZ307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBCdXR0b24gPSBzdHlsZWQuZGl2LmF0dHJzKHByb3BzID0+ICh7XG4gIGNsYXNzTmFtZTogY2xhc3NuYW1lcygnYnV0dG9uJywgcHJvcHMuY2xhc3NOYW1lKVxufSkpYFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMubmVnYXRpdmVcbiAgICAgID8gcHJvcHMudGhlbWUubmVnYXRpdmVCdG5CZ2RcbiAgICAgIDogcHJvcHMuc2Vjb25kYXJ5XG4gICAgICA/IHByb3BzLnRoZW1lLnNlY29uZGFyeUJ0bkJnZFxuICAgICAgOiBwcm9wcy5saW5rXG4gICAgICA/IHByb3BzLnRoZW1lLmxpbmtCdG5CZ2RcbiAgICAgIDogcHJvcHMuZmxvYXRpbmdcbiAgICAgID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5CZ2RcbiAgICAgIDogcHJvcHMudGhlbWUucHJpbWFyeUJ0bkJnZH07XG4gIGJvcmRlci1yYWRpdXM6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucHJpbWFyeUJ0blJhZGl1c307XG4gIGNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMubmVnYXRpdmVcbiAgICAgID8gcHJvcHMudGhlbWUubmVnYXRpdmVCdG5Db2xvclxuICAgICAgOiBwcm9wcy5zZWNvbmRhcnlcbiAgICAgID8gcHJvcHMudGhlbWUuc2Vjb25kYXJ5QnRuQ29sb3JcbiAgICAgIDogcHJvcHMubGlua1xuICAgICAgPyBwcm9wcy50aGVtZS5saW5rQnRuQ29sb3JcbiAgICAgIDogcHJvcHMuZmxvYXRpbmdcbiAgICAgID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5Db2xvclxuICAgICAgOiBwcm9wcy50aGVtZS5wcmltYXJ5QnRuQ29sb3J9O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBmb250LXNpemU6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5sYXJnZVxuICAgICAgPyBwcm9wcy50aGVtZS5wcmltYXJ5QnRuRm9udFNpemVMYXJnZVxuICAgICAgOiBwcm9wcy5zbWFsbFxuICAgICAgPyBwcm9wcy50aGVtZS5wcmltYXJ5QnRuRm9udFNpemVTbWFsbFxuICAgICAgOiBwcm9wcy50aGVtZS5wcmltYXJ5QnRuRm9udFNpemVEZWZhdWx0fTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgZm9udC1mYW1pbHk6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuYnRuRm9udEZhbWlseX07XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBsZXR0ZXItc3BhY2luZzogMC4zcHg7XG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xuICBvdXRsaW5lOiAwO1xuICBwYWRkaW5nOiAke3Byb3BzID0+IChwcm9wcy5sYXJnZSA/ICcxNHB4IDMycHgnIDogcHJvcHMuc21hbGwgPyAnNnB4IDlweCcgOiAnOXB4IDEycHgnKX07XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdHJhbnNpdGlvbjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50cmFuc2l0aW9ufTtcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgd2lkdGg6ICR7cHJvcHMgPT4gcHJvcHMud2lkdGggfHwgJ2F1dG8nfTtcbiAgb3BhY2l0eTogJHtwcm9wcyA9PiAocHJvcHMuZGlzYWJsZWQgPyAwLjQgOiAxKX07XG4gIHBvaW50ZXItZXZlbnRzOiAke3Byb3BzID0+IChwcm9wcy5kaXNhYmxlZCA/ICdub25lJyA6ICdhbGwnKX07XG4gIGJvcmRlcjogJHtwcm9wcyA9PlxuICAgIHByb3BzLnNlY29uZGFyeVxuICAgICAgPyBwcm9wcy50aGVtZS5zZWNvbmRhcnlCdG5Cb3JkZXJcbiAgICAgIDogcHJvcHMuZmxvYXRpbmdcbiAgICAgID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5Cb3JkZXJcbiAgICAgIDogcHJvcHMubGlua1xuICAgICAgPyBwcm9wcy50aGVtZS5saW5rQnRuQm9yZGVyXG4gICAgICA6IHByb3BzLnRoZW1lLnByaW1hcnlCdG5Cb3JkZXJ9O1xuICA6aG92ZXIsXG4gIDpmb2N1cyxcbiAgOmFjdGl2ZSxcbiAgJi5hY3RpdmUge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT5cbiAgICAgIHByb3BzLm5lZ2F0aXZlXG4gICAgICAgID8gcHJvcHMudGhlbWUubmVnYXRpdmVCdG5CZ2RIb3ZlclxuICAgICAgICA6IHByb3BzLnNlY29uZGFyeVxuICAgICAgICA/IHByb3BzLnRoZW1lLnNlY29uZGFyeUJ0bkJnZEhvdmVyXG4gICAgICAgIDogcHJvcHMubGlua1xuICAgICAgICA/IHByb3BzLnRoZW1lLmxpbmtCdG5BY3RCZ2RIb3ZlclxuICAgICAgICA6IHByb3BzLmZsb2F0aW5nXG4gICAgICAgID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5CZ2RIb3ZlclxuICAgICAgICA6IHByb3BzLnRoZW1lLnByaW1hcnlCdG5CZ2RIb3Zlcn07XG4gICAgY29sb3I6ICR7cHJvcHMgPT5cbiAgICAgIHByb3BzLm5lZ2F0aXZlXG4gICAgICAgID8gcHJvcHMudGhlbWUubmVnYXRpdmVCdG5BY3RDb2xvclxuICAgICAgICA6IHByb3BzLnNlY29uZGFyeVxuICAgICAgICA/IHByb3BzLnRoZW1lLnNlY29uZGFyeUJ0bkFjdENvbG9yXG4gICAgICAgIDogcHJvcHMubGlua1xuICAgICAgICA/IHByb3BzLnRoZW1lLmxpbmtCdG5BY3RDb2xvclxuICAgICAgICA6IHByb3BzLmZsb2F0aW5nXG4gICAgICAgID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5BY3RDb2xvclxuICAgICAgICA6IHByb3BzLnRoZW1lLnByaW1hcnlCdG5BY3RDb2xvcn07XG4gIH1cblxuICBzdmcge1xuICAgIG1hcmdpbi1yaWdodDogJHtwcm9wcyA9PiAocHJvcHMubGFyZ2UgPyAnMTBweCcgOiBwcm9wcy5zbWFsbCA/ICc2cHgnIDogJzhweCcpfTtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IElucHV0ID0gc3R5bGVkLmlucHV0YFxuICAke3Byb3BzID0+IChwcm9wcy5zZWNvbmRhcnkgPyBwcm9wcy50aGVtZS5zZWNvbmRhcnlJbnB1dCA6IHByb3BzLnRoZW1lLmlucHV0KX07XG5gO1xuXG5leHBvcnQgY29uc3QgSW5wdXRMaWdodCA9IHN0eWxlZC5pbnB1dGBcbiAgJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5pbnB1dExUfVxuYDtcblxuZXhwb3J0IGNvbnN0IFRleHRBcmVhID0gc3R5bGVkLnRleHRhcmVhYFxuICAke3Byb3BzID0+IChwcm9wcy5zZWNvbmRhcnkgPyBwcm9wcy50aGVtZS5zZWNvbmRhcnlJbnB1dCA6IHByb3BzLnRoZW1lLmlucHV0KX07XG5gO1xuZXhwb3J0IGNvbnN0IFRleHRBcmVhTGlnaHQgPSBzdHlsZWQudGV4dGFyZWFgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuaW5wdXRMVH1cbiAgaGVpZ2h0OiBhdXRvO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG5gO1xuXG5leHBvcnQgY29uc3QgSW5saW5lSW5wdXQgPSBzdHlsZWQoSW5wdXQpYFxuICAke3Byb3BzID0+IHByb3BzLnRoZW1lLmlubGluZUlucHV0fTtcbmA7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRQYW5lbEhlYWRlciA9IHN0eWxlZC5kaXZgXG4gIGJhY2tncm91bmQtY29sb3I6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5hY3RpdmUgPyBwcm9wcy50aGVtZS5wYW5lbEJhY2tncm91bmRIb3ZlciA6IHByb3BzLnRoZW1lLnBhbmVsQmFja2dyb3VuZH07XG4gIGJvcmRlci1sZWZ0OiAzcHggc29saWRcbiAgICByZ2IoXG4gICAgICAke3Byb3BzID0+IChwcm9wcy5sYWJlbFJDR0NvbG9yVmFsdWVzID8gcHJvcHMubGFiZWxSQ0dDb2xvclZhbHVlcy5qb2luKCcsJykgOiAndHJhbnNwYXJlbnQnKX1cbiAgICApO1xuICBwYWRkaW5nOiAwIDEwcHggMCAwO1xuICBoZWlnaHQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxIZWFkZXJIZWlnaHR9cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgYm9yZGVyLXJhZGl1czogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbEhlYWRlckJvcmRlclJhZGl1c307XG4gIHRyYW5zaXRpb246ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUudHJhbnNpdGlvbn07XG5gO1xuXG5leHBvcnQgY29uc3QgU3R5bGVkUGFuZWxEcm9wZG93biA9IHN0eWxlZC5kaXZgXG4gICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxEcm9wZG93blNjcm9sbEJhcn1cbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PlxuICAgIHByb3BzLnR5cGUgPT09ICdsaWdodCcgPyBwcm9wcy50aGVtZS5tb2RhbERyb3Bkb3duQmFja2dyb3VuZCA6IHByb3BzLnRoZW1lLnBhbmVsQmFja2dyb3VuZH07XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIGJveC1zaGFkb3c6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCb3hTaGFkb3d9O1xuICBib3JkZXItcmFkaXVzOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnBhbmVsQm9yZGVyUmFkaXVzfTtcbiAgbWF4LWhlaWdodDogNTAwcHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgei1pbmRleDogOTk5O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJ1dHRvbkdyb3VwID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgLmJ1dHRvbiB7XG4gICAgYm9yZGVyLXJhZGl1czogMDtcbiAgICBtYXJnaW4tbGVmdDogMnB4O1xuICB9XG4gIC5idXR0b246Zmlyc3QtY2hpbGQge1xuICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucHJpbWFyeUJ0blJhZGl1c307XG4gICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wcmltYXJ5QnRuUmFkaXVzfTtcbiAgICBtYXJnaW4tbGVmdDogMDtcbiAgfVxuICAuYnV0dG9uOmxhc3QtY2hpbGQge1xuICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnByaW1hcnlCdG5SYWRpdXN9O1xuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnByaW1hcnlCdG5SYWRpdXN9O1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgRGF0YXNldFNxdWFyZSA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2lkdGg6IDhweDtcbiAgaGVpZ2h0OiA4cHg7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigke3Byb3BzID0+IHByb3BzLmNvbG9yLmpvaW4oJywnKX0pO1xuICBtYXJnaW4tcmlnaHQ6IDEycHg7XG5gO1xuXG5leHBvcnQgY29uc3QgU2VsZWN0aW9uQnV0dG9uID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBib3JkZXItcmFkaXVzOiAycHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkXG4gICAgJHtwcm9wcyA9PlxuICAgICAgcHJvcHMuc2VsZWN0ZWRcbiAgICAgICAgPyBwcm9wcy50aGVtZS5zZWxlY3Rpb25CdG5Cb3JkZXJBY3RDb2xvclxuICAgICAgICA6IHByb3BzLnRoZW1lLnNlbGVjdGlvbkJ0bkJvcmRlckNvbG9yfTtcbiAgY29sb3I6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5zZWxlY3RlZCA/IHByb3BzLnRoZW1lLnNlbGVjdGlvbkJ0bkFjdENvbG9yIDogcHJvcHMudGhlbWUuc2VsZWN0aW9uQnRuQ29sb3J9O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuc2VsZWN0ZWQgPyBwcm9wcy50aGVtZS5zZWxlY3Rpb25CdG5BY3RCZ2QgOiBwcm9wcy50aGVtZS5zZWxlY3Rpb25CdG5CZ2R9O1xuXG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgbWFyZ2luLXJpZ2h0OiA2cHg7XG4gIHBhZGRpbmc6IDZweCAxNnB4O1xuXG4gIDpob3ZlciB7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2VsZWN0aW9uQnRuQWN0Q29sb3J9O1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc2VsZWN0aW9uQnRuQm9yZGVyQWN0Q29sb3J9O1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgVGFibGUgPSBzdHlsZWQudGFibGVgXG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXItc3BhY2luZzogMDtcblxuICB0aGVhZCB7XG4gICAgdHIgdGgge1xuICAgICAgYmFja2dyb3VuZDogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5wYW5lbEJhY2tncm91bmRMVH07XG4gICAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50aXRsZUNvbG9yTFR9O1xuICAgICAgcGFkZGluZzogMThweCAxMnB4O1xuICAgICAgdGV4dC1hbGlnbjogc3RhcnQ7XG4gICAgfVxuICB9XG5cbiAgdGJvZHkge1xuICAgIHRyIHRkIHtcbiAgICAgIGJvcmRlci1ib3R0b206ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCb3JkZXJMVH07XG4gICAgICBwYWRkaW5nOiAxMnB4O1xuICAgIH1cbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFN0eWxlZE1vZGFsQ29udGVudCA9IHN0eWxlZC5kaXZgXG4gIGJhY2tncm91bmQ6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUucGFuZWxCYWNrZ3JvdW5kTFR9O1xuICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gIGZvbnQtc2l6ZTogMTBweDtcbiAgcGFkZGluZzogMjRweCAke3Byb3BzID0+IHByb3BzLnRoZW1lLm1vZGFsTGF0ZXJhbFBhZGRpbmd9O1xuICBtYXJnaW46IDAgLSR7cHJvcHMgPT4gcHJvcHMudGhlbWUubW9kYWxMYXRlcmFsUGFkZGluZ307XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgJHttZWRpYS5wb3J0YWJsZWBcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIHBhZGRpbmc6IDE2cHggJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5tb2RhbFBvcnRhYmxlTGF0ZXJhbFBhZGRpbmd9O1xuICAgIG1hcmdpbjogMCAtJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5tb2RhbFBvcnRhYmxlTGF0ZXJhbFBhZGRpbmd9O1xuICBgfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRNb2RhbFZlcnRpY2FsUGFuZWwgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbW9kYWwtdmVydGljYWwtcGFuZWwnXG59KWBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XG4gIGZvbnQtc2l6ZTogMTJweDtcblxuICAubW9kYWwtc2VjdGlvbjpmaXJzdC1jaGlsZCB7XG4gICAgbWFyZ2luLXRvcDogMjRweDtcbiAgICAke21lZGlhLnBhbG1gXG4gICAgICBtYXJnaW4tdG9wOiAwO1xuICAgIGB9O1xuICB9XG5cbiAgaW5wdXQge1xuICAgIG1hcmdpbi1yaWdodDogOHB4O1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgU3R5bGVkTW9kYWxTZWN0aW9uID0gc3R5bGVkLmRpdi5hdHRycyh7XG4gIGNsYXNzTmFtZTogJ21vZGFsLXNlY3Rpb24nXG59KWBcbiAgbWFyZ2luLWJvdHRvbTogMzJweDtcblxuICAubW9kYWwtc2VjdGlvbi10aXRsZSB7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgfVxuICAubW9kYWwtc2VjdGlvbi1zdWJ0aXRsZSB7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuc3VidGV4dENvbG9yTFR9O1xuICB9XG5cbiAgaW5wdXQge1xuICAgIG1hcmdpbi10b3A6IDhweDtcbiAgfVxuXG4gICR7bWVkaWEucG9ydGFibGVgXG4gICAgbWFyZ2luLWJvdHRvbTogMjRweDtcbiAgYH07XG4gICR7bWVkaWEucGFsbWBcbiAgICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICBgfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRNb2RhbElucHV0Rm9vdG5vdGUgPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbW9kYWwtaW5wdXRfX2Zvb3Rub3RlJ1xufSlgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gIGNvbG9yOiAke3Byb3BzID0+IChwcm9wcy5lcnJvciA/IHByb3BzLnRoZW1lLmVycm9yQ29sb3IgOiBwcm9wcy50aGVtZS5zdWJ0ZXh0Q29sb3JMVCl9O1xuICBmb250LXNpemU6IDEwcHg7XG5gO1xuLyoqXG4gKiBOZXdlciB2ZXJzaW9ucyBvZiBtYXBib3guZ2wgZGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIGJhbm5lciBvbiB0b3Agb2YgdGhlIG1hcCBieSBkZWZhdWx0XG4gKiB3aGljaCB3aWxsIGNhdXNlIHRoZSBtYXAgdG8gZGlzcGxheSBwb2ludHMgaW4gdGhlIHdyb25nIGxvY2F0aW9uc1xuICogVGhpcyB3b3JrYXJvdW5kIHdpbGwgaGlkZSB0aGUgZXJyb3IgYmFubmVyLlxuICovXG5leHBvcnQgY29uc3QgU3R5bGVkTWFwQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgLm1hcGJveGdsLW1hcCB7XG4gICAgLm1hcGJveGdsLW1pc3NpbmctY3NzIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIC5tYXBib3hnbC1jdHJsLWF0dHJpYiB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFN0eWxlZEF0dHJidXRpb24gPSBzdHlsZWQuZGl2LmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbWFwYm94LWF0dHJpYnV0aW9uLWNvbnRhaW5lcidcbn0pYFxuICBib3R0b206IDA7XG4gIHJpZ2h0OiAwO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICBtYXJnaW46IDAgMTBweCAycHg7XG4gIHotaW5kZXg6IDA7XG5cbiAgLmF0dHJpdGlvbi1sb2dvIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgY29sb3I6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUubGFiZWxDb2xvcn07XG5cbiAgICBhLm1hcGJveGdsLWN0cmwtbG9nbyB7XG4gICAgICB3aWR0aDogNzJweDtcbiAgICAgIG1hcmdpbi1sZWZ0OiA2cHg7XG4gICAgfVxuICB9XG4gIGEge1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFN0eWxlZEV4cG9ydFNlY3Rpb24gPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICBtYXJnaW46IDM1cHggMDtcbiAgd2lkdGg6IDEwMCU7XG4gIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnRleHRDb2xvckxUfTtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBvcGFjaXR5OiAke3Byb3BzID0+IChwcm9wcy5kaXNhYmxlZCA/IDAuMyA6IDEpfTtcbiAgcG9pbnRlci1ldmVudHM6ICR7cHJvcHMgPT4gKHByb3BzLmRpc2FibGVkID8gJ25vbmUnIDogJ2FsbCcpfTtcblxuICAuZGVzY3JpcHRpb24ge1xuICAgIHdpZHRoOiAxODVweDtcbiAgICAudGl0bGUge1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICB9XG4gICAgLnN1YnRpdGxlIHtcbiAgICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnN1YnRleHRDb2xvckxUfTtcbiAgICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICB9XG4gIH1cbiAgLndhcm5pbmcge1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmVycm9yQ29sb3J9O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbiAgLmRlc2NyaXB0aW9uLmZ1bGwge1xuICAgIHdpZHRoOiAxMDAlO1xuICB9XG4gIC5zZWxlY3Rpb24ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGZsZXg6IDE7XG4gICAgcGFkZGluZy1sZWZ0OiA1MHB4O1xuXG4gICAgc2VsZWN0IHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyLXJhZGl1czogMXB4O1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgZm9udDogaW5oZXJpdDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjVlbTtcbiAgICAgIHBhZGRpbmc6IDAuNWVtIDMuNWVtIDAuNWVtIDFlbTtcbiAgICAgIG1hcmdpbjogMDtcbiAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICBhcHBlYXJhbmNlOiBub25lO1xuICAgICAgd2lkdGg6IDI1MHB4O1xuICAgICAgaGVpZ2h0OiAzNnB4O1xuXG4gICAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsIHRyYW5zcGFyZW50IDUwJSwgZ3JheSA1MCUpLFxuICAgICAgICBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCBncmF5IDUwJSwgdHJhbnNwYXJlbnQgNTAlKSwgbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCAjY2NjLCAjY2NjKTtcbiAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IGNhbGMoMTAwJSAtIDIwcHgpIGNhbGMoMWVtICsgMnB4KSwgY2FsYygxMDAlIC0gMTVweCkgY2FsYygxZW0gKyAycHgpLFxuICAgICAgICBjYWxjKDEwMCUgLSAyLjVlbSkgNC41ZW07XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IDVweCA1cHgsIDVweCA1cHgsIDFweCAxLjVlbTtcbiAgICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XG4gICAgfVxuXG4gICAgc2VsZWN0OmZvY3VzIHtcbiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgZ3JlZW4gNTAlLCB0cmFuc3BhcmVudCA1MCUpLFxuICAgICAgICBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB0cmFuc3BhcmVudCA1MCUsIGdyZWVuIDUwJSksIGxpbmVhci1ncmFkaWVudCh0byByaWdodCwgI2NjYywgI2NjYyk7XG4gICAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjYWxjKDEwMCUgLSAxNXB4KSAxZW0sIGNhbGMoMTAwJSAtIDIwcHgpIDFlbSwgY2FsYygxMDAlIC0gMi41ZW0pIDQuNWVtO1xuICAgICAgYmFja2dyb3VuZC1zaXplOiA1cHggNXB4LCA1cHggNXB4LCAxcHggMS41ZW07XG4gICAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuICAgICAgYm9yZGVyLWNvbG9yOiBncmVlbjtcbiAgICAgIG91dGxpbmU6IDA7XG4gICAgfVxuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgU3R5bGVkRmlsdGVyZWRPcHRpb24gPSBzdHlsZWQoU2VsZWN0aW9uQnV0dG9uKWBcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIG1hcmdpbjogNHB4O1xuICBwYWRkaW5nOiA4cHggMTJweDtcbiAgd2lkdGg6IDE0MHB4O1xuXG4gIC5maWx0ZXItb3B0aW9uLXRpdGxlIHtcbiAgICBjb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS50ZXh0Q29sb3JMVH07XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbiAgLmZpbHRlci1vcHRpb24tc3VidGl0bGUge1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnN1YnRleHRDb2xvckxUfTtcbiAgICBmb250LXNpemU6IDExcHg7XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBTdHlsZWRUeXBlID0gc3R5bGVkKFNlbGVjdGlvbkJ1dHRvbilgXG4gIGhlaWdodDogMTAwcHg7XG4gIG1hcmdpbjogNHB4O1xuICBwYWRkaW5nOiA2cHggMTBweDtcbiAgd2lkdGg6IDEwMHB4O1xuYDtcblxuZXhwb3J0IGNvbnN0IFdpZGdldENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHotaW5kZXg6IDE7XG5gO1xuXG5leHBvcnQgY29uc3QgQm90dG9tV2lkZ2V0SW5uZXIgPSBzdHlsZWQuZGl2YFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmJvdHRvbVdpZGdldEJnZH07XG4gIHBhZGRpbmc6ICR7cHJvcHMgPT4gYCR7cHJvcHMudGhlbWUuYm90dG9tSW5uZXJQZFZlcnR9cHggJHtwcm9wcy50aGVtZS5ib3R0b21Jbm5lclBkU2lkZX1weGB9O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG1hcmdpbi10b3A6ICR7cHJvcHMgPT4gcHJvcHMudGhlbWUuYm90dG9tUGFuZWxHYXB9cHg7XG5gO1xuXG5leHBvcnQgY29uc3QgTWFwQ29udHJvbEJ1dHRvbiA9IHN0eWxlZChCdXR0b24pLmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnbWFwLWNvbnRyb2wtYnV0dG9uJ1xufSlgXG4gIGJveC1zaGFkb3c6IDAgNnB4IDEycHggMCByZ2JhKDAsIDAsIDAsIDAuMTYpO1xuICBoZWlnaHQ6IDMycHg7XG4gIHdpZHRoOiAzMnB4O1xuICBwYWRkaW5nOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+XG4gICAgcHJvcHMuYWN0aXZlID8gcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5CZ2RIb3ZlciA6IHByb3BzLnRoZW1lLmZsb2F0aW5nQnRuQmdkfTtcbiAgY29sb3I6ICR7cHJvcHMgPT5cbiAgICBwcm9wcy5hY3RpdmUgPyBwcm9wcy50aGVtZS5mbG9hdGluZ0J0bkFjdENvbG9yIDogcHJvcHMudGhlbWUuZmxvYXRpbmdCdG5Db2xvcn07XG4gIGJvcmRlcjogJHtwcm9wcyA9PlxuICAgIHByb3BzLmFjdGl2ZSA/IHByb3BzLnRoZW1lLmZsb2F0aW5nQnRuQm9yZGVySG92ZXIgOiBwcm9wcy50aGVtZS5mbG9hdGluZ0J0bkJvcmRlcn07XG5cbiAgOmhvdmVyLFxuICA6Zm9jdXMsXG4gIDphY3RpdmUsXG4gICYuYWN0aXZlIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZsb2F0aW5nQnRuQmdkSG92ZXJ9O1xuICAgIGNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLmZsb2F0aW5nQnRuQWN0Q29sb3J9O1xuICAgIGJvcmRlcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5mbG9hdGluZ0J0bkJvcmRlckhvdmVyfTtcbiAgfVxuICBzdmcge1xuICAgIG1hcmdpbi1yaWdodDogMDtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IFN0eWxlZEZpbHRlckNvbnRlbnQgPSBzdHlsZWQuZGl2YFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAke3Byb3BzID0+IHByb3BzLnRoZW1lLnBhbmVsQ29udGVudEJhY2tncm91bmR9O1xuICBwYWRkaW5nOiAxMnB4O1xuYDtcblxuZXhwb3J0IGNvbnN0IFRydW5jYXRlZFRpdGxlVGV4dCA9IHN0eWxlZC5kaXZgXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuYDtcblxuZXhwb3J0IGNvbnN0IENoZWNrTWFyayA9IHN0eWxlZC5zcGFuLmF0dHJzKHtcbiAgY2xhc3NOYW1lOiAnY2hlY2tib3gtaW5uZXInXG59KWBcbiAgYmFja2dyb3VuZC1jb2xvcjogJHtwcm9wcyA9PiBwcm9wcy50aGVtZS5zZWxlY3Rpb25CdG5Cb3JkZXJBY3RDb2xvcn07XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiAxMHB4O1xuICBoZWlnaHQ6IDEwcHg7XG4gIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDJweDtcblxuICA6YWZ0ZXIge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBkaXNwbGF5OiB0YWJsZTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjZmZmO1xuICAgIGJvcmRlci10b3A6IDA7XG4gICAgYm9yZGVyLWxlZnQ6IDA7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNDVkZWcpIHNjYWxlKDEpIHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgICBvcGFjaXR5OiAxO1xuICAgIGNvbnRlbnQ6ICcgJztcbiAgICB0b3A6IDQwJTtcbiAgICBsZWZ0OiAzMCU7XG4gICAgd2lkdGg6IDMuMnB4O1xuICAgIGhlaWdodDogNi4yMnB4O1xuICB9XG5gO1xuIl19