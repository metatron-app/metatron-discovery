/**
 * at.js - 1.5.4
 * Copyright (c) 2017 chord.luo <chord.luo@gmail.com>;
 * Homepage: http://ichord.github.com/At.js
 * License: MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["jquery"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
}(this, function ($) {
var DEFAULT_CALLBACKS, KEY_CODE;

KEY_CODE = {
  ESC: 27,
  TAB: 9,
  ENTER: 13,
  CTRL: 17,
  A: 65,
  P: 80,
  N: 78,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  BACKSPACE: 8,
  SPACE: 32
};

DEFAULT_CALLBACKS = {
  beforeSave: function(data) {
    return Controller.arrayToDefaultHash(data);
  },
  matcher: function(flag, subtext, should_startWithSpace, acceptSpaceBar) {
    var _a, _y, match, regexp, space;
    flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    if (should_startWithSpace) {
      flag = '(?:^|\\s+)' + flag;
    }
    _a = decodeURI("%C3%80");
    _y = decodeURI("%C3%BF");
    space = acceptSpaceBar ? "\ " : "";

    // 앞에 대괄호 오는 케이스 추가
    regexp = new RegExp(flag + "([A-Za-z" + _a + "-" + _y + "0-9_" + space + "\[\'\.\+\-]*)$|" + flag + "([^\\x00-\\xff]*)$", 'gi');
    match = regexp.exec(subtext);

    if (match) {
      return match[2] ? match[2] : match[1];
    } else {
      return null;
    }
  },
  filter: function(query, data, searchKey) {
    var _results, i, item, len;
    _results = [];
    for (i = 0, len = data.length; i < len; i++) {
      item = data[i];
      if (~new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase())) {
        _results.push(item);
      }
    }
    return _results;
  },
  remoteFilter: null,
  sorter: function(query, items, searchKey) {
    var _results, i, item, len;
    if (!query) {
      return items;
    }
    _results = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      item.atwho_order = new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase());
      if (item.atwho_order > -1) {
        _results.push(item);
      }
    }
    return _results.sort(function(a, b) {
      return a.atwho_order - b.atwho_order;
    });
  },
  tplEval: function(tpl, map) {
    var error, error1, template;
    template = tpl;
    try {
      if (typeof tpl !== 'string') {
        template = tpl(map);
      }
      return template.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
        return map[key];
      });
    } catch (error1) {
      error = error1;
      return "";
    }
  },
  highlighter: function(li, query) {
    var regexp;
    if (!query) {
      return li;
    }
    regexp = new RegExp(">\\s*([^\<]*?)(" + query.replace("+", "\\+") + ")([^\<]*)\\s*<", 'ig');
    return li.replace(regexp, function(str, $1, $2, $3) {
      return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
    });
  },
  beforeInsert: function(value, $li, e) {
    return value;
  },
  afterInsert: function(value, $li, e) {},
  beforeReposition: function(offset) {
    return offset;
  },
  afterMatchFailed: function(at, el) {}
};

var App;

App = (function() {
  function App(inputor) {
    this.currentFlag = null;
    this.controllers = {};
    this.aliasMaps = {};
    this.$inputor = $(inputor);
    this.setupRootElement();
    this.listen();
  }

  App.prototype.createContainer = function(doc) {
    var ref;
    if ((ref = this.$el) != null) {
      ref.remove();
    }
    // ddp 중복 생성 제거
    $(".atwho-container").remove();
    // ddp - class추가
    return $(doc.body).append(this.$el = $("<div class='atwho-container'></div>"));
  };

  App.prototype.setupRootElement = function(iframe, asRoot) {
    var error, error1;
    if (asRoot == null) {
      asRoot = false;
    }
    if (iframe) {
      this.window = iframe.contentWindow;
      this.document = iframe.contentDocument || this.window.document;
      this.iframe = iframe;
    } else {
      this.document = this.$inputor[0].ownerDocument;
      this.window = this.document.defaultView || this.document.parentWindow;
      try {
        this.iframe = this.window.frameElement;
      } catch (error1) {
        error = error1;
        this.iframe = null;
        if ($.fn.atwho.debug) {
          throw new Error("iframe auto-discovery is failed.\nPlease use `setIframe` to set the target iframe manually.\n" + error);
        }
      }
    }
    return this.createContainer((this.iframeAsRoot = asRoot) ? this.document : document);
  };

  App.prototype.controller = function(at) {
    var c, current, currentFlag, ref;
    if (this.aliasMaps[at]) {
      current = this.controllers[this.aliasMaps[at]];
    } else {
      ref = this.controllers;
      for (currentFlag in ref) {
        c = ref[currentFlag];
        if (currentFlag === at) {
          current = c;
          break;
        }
      }
    }
    if (current) {
      return current;
    } else {
      return this.controllers[this.currentFlag];
    }
  };

  App.prototype.setContextFor = function(at) {
    this.currentFlag = at;
    return this;
  };

  App.prototype.reg = function(flag, setting) {
    var base, controller;
    controller = (base = this.controllers)[flag] || (base[flag] = this.$inputor.is('[contentEditable]') ? new EditableController(this, flag) : new TextareaController(this, flag));
    if (setting.alias) {
      this.aliasMaps[setting.alias] = flag;
    }
    controller.init(setting);
    return this;
  };

  App.prototype.listen = function() {
    return this.$inputor.on('compositionstart', (function(_this) {
      return function(e) {
        var ref;
        if ((ref = _this.controller()) != null) {
          ref.view.hide();
        }
        _this.isComposing = true;
        return null;
      };
    })(this)).on('compositionend', (function(_this) {
      return function(e) {
        _this.isComposing = false;
        setTimeout(function(e) {
          return _this.dispatch(e);
        });
        return null;
      };
    })(this)).on('keyup.atwhoInner', (function(_this) {
      return function(e) {
        return _this.onKeyup(e);
      };
    })(this)).on('keydown.atwhoInner', (function(_this) {
      return function(e) {
        return _this.onKeydown(e);
      };
    })(this)).on('blur.atwhoInner', (function(_this) {
      return function(e) {
        var c;
        if (c = _this.controller()) {
          c.expectedQueryCBId = null;
          return c.view.hide(e, c.getOpt("displayTimeout"));
        }
      };
    })(this)).on('click.atwhoInner', (function(_this) {
      return function(e) {
        return _this.dispatch(e);
      };
    })(this)).on('scroll.atwhoInner', (function(_this) {
      return function() {
        var lastScrollTop;
        lastScrollTop = _this.$inputor.scrollTop();
        return function(e) {
          var currentScrollTop, ref;
          currentScrollTop = e.target.scrollTop;
          if (lastScrollTop !== currentScrollTop) {
            if ((ref = _this.controller()) != null) {
              ref.view.hide(e);
            }
          }
          lastScrollTop = currentScrollTop;
          return true;
        };
      };
    })(this)());
  };

  App.prototype.shutdown = function() {
    var _, c, ref;
    ref = this.controllers;
    for (_ in ref) {
      c = ref[_];
      c.destroy();
      delete this.controllers[_];
    }
    this.$inputor.off('.atwhoInner');
    return this.$el.remove();
  };

  App.prototype.dispatch = function(e) {
    var _, c, ref, results;
    ref = this.controllers;
    results = [];
    for (_ in ref) {
      c = ref[_];
      results.push(c.lookUp(e));
    }
    return results;
  };

  App.prototype.onKeyup = function(e) {
    var ref;
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        if ((ref = this.controller()) != null) {
          ref.view.hide();
        }
        break;
      case KEY_CODE.DOWN:
      case KEY_CODE.UP:
      case KEY_CODE.CTRL:
      case KEY_CODE.ENTER:
        $.noop();
        break;
      case KEY_CODE.P:
      case KEY_CODE.N:
        if (!e.ctrlKey) {
          this.dispatch(e);
        }
        break;
      default:
        this.dispatch(e);
    }
  };

  App.prototype.onKeydown = function(e) {
    var ref, view;
    view = (ref = this.controller()) != null ? ref.view : void 0;
    if (!(view && view.visible())) {
      return;
    }
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        view.hide(e);
        break;
      case KEY_CODE.UP:
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.DOWN:
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.P:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.N:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.TAB:
      case KEY_CODE.ENTER:
      case KEY_CODE.SPACE:
        if (!view.visible()) {
          return;
        }
        if (!this.controller().getOpt('spaceSelectsMatch') && e.keyCode === KEY_CODE.SPACE) {
          return;
        }
        if (!this.controller().getOpt('tabSelectsMatch') && e.keyCode === KEY_CODE.TAB) {
          return;
        }
        if (view.highlighted()) {
          e.preventDefault();
          view.choose(e);
        } else {
          view.hide(e);
        }
        break;
      default:
        $.noop();
    }
  };

  return App;

})();

var Controller,
  slice = [].slice;

Controller = (function() {
  Controller.prototype.uid = function() {
    return (Math.random().toString(16) + "000000000").substr(2, 8) + (new Date().getTime());
  };

  function Controller(app, at1) {
    this.app = app;
    this.at = at1;
    this.$inputor = this.app.$inputor;
    this.id = this.$inputor[0].id || this.uid();
    this.expectedQueryCBId = null;
    this.setting = null;
    this.query = null;
    this.pos = 0;
    this.range = null;
    if ((this.$el = $("#atwho-ground-" + this.id, this.app.$el)).length === 0) {
      this.app.$el.append(this.$el = $("<div id='atwho-ground-" + this.id + "'></div>"));
    }
    this.model = new Model(this);
    this.view = new View(this);
  }

  Controller.prototype.init = function(setting) {
    this.setting = $.extend({}, this.setting || $.fn.atwho["default"], setting);
    this.view.init();
    return this.model.reload(this.setting.data);
  };

  Controller.prototype.destroy = function() {
    this.trigger('beforeDestroy');
    this.model.destroy();
    this.view.destroy();
    return this.$el.remove();
  };

  Controller.prototype.callDefault = function() {
    var args, error, error1, funcName;
    funcName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    try {
      return DEFAULT_CALLBACKS[funcName].apply(this, args);
    } catch (error1) {
      error = error1;
      return $.error(error + " Or maybe At.js doesn't have function " + funcName);
    }
  };

  Controller.prototype.trigger = function(name, data) {
    var alias, eventName;
    if (data == null) {
      data = [];
    }
    data.push(this);
    alias = this.getOpt('alias');
    eventName = alias ? name + "-" + alias + ".atwho" : name + ".atwho";
    return this.$inputor.trigger(eventName, data);
  };

  Controller.prototype.callbacks = function(funcName) {
    return this.getOpt("callbacks")[funcName] || DEFAULT_CALLBACKS[funcName];
  };

  Controller.prototype.getOpt = function(at, default_value) {
    var e, error1;
    try {
      return this.setting[at];
    } catch (error1) {
      e = error1;
      return null;
    }
  };

  Controller.prototype.insertContentFor = function($li) {
    var data, tpl;
    tpl = this.getOpt('insertTpl');
    data = $.extend({}, $li.data('item-data'), {
      'atwho-at': this.at
    });
    return this.callbacks("tplEval").call(this, tpl, data, "onInsert");
  };

  Controller.prototype.renderView = function(data) {
    var searchKey;
    searchKey = this.getOpt("searchKey");
    data = this.callbacks("sorter").call(this, this.query.text, data.slice(0, 1001), searchKey);
    return this.view.render(data.slice(0, this.getOpt('limit')));
  };

  Controller.arrayToDefaultHash = function(data) {
    var i, item, len, results;
    if (!$.isArray(data)) {
      return data;
    }
    results = [];
    for (i = 0, len = data.length; i < len; i++) {
      item = data[i];
      if ($.isPlainObject(item)) {
        results.push(item);
      } else {
        results.push({
          name: item
        });
      }
    }
    return results;
  };

  Controller.prototype.lookUp = function(e) {
    var query, wait;
    if (e && e.type === 'click' && !this.getOpt('lookUpOnClick')) {
      return;
    }
    if (this.getOpt('suspendOnComposing') && this.app.isComposing) {
      return;
    }
    query = this.catchQuery(e);
    if (!query) {
      this.expectedQueryCBId = null;
      return query;
    }
    this.app.setContextFor(this.at);
    if (wait = this.getOpt('delay')) {
      this._delayLookUp(query, wait);
    } else {
      this._lookUp(query);
    }
    return query;
  };

  Controller.prototype._delayLookUp = function(query, wait) {
    var now, remaining;
    now = Date.now ? Date.now() : new Date().getTime();
    this.previousCallTime || (this.previousCallTime = now);
    remaining = wait - (now - this.previousCallTime);
    if ((0 < remaining && remaining < wait)) {
      this.previousCallTime = now;
      this._stopDelayedCall();
      return this.delayedCallTimeout = setTimeout((function(_this) {
        return function() {
          _this.previousCallTime = 0;
          _this.delayedCallTimeout = null;
          return _this._lookUp(query);
        };
      })(this), wait);
    } else {
      this._stopDelayedCall();
      if (this.previousCallTime !== now) {
        this.previousCallTime = 0;
      }
      return this._lookUp(query);
    }
  };

  Controller.prototype._stopDelayedCall = function() {
    if (this.delayedCallTimeout) {
      clearTimeout(this.delayedCallTimeout);
      return this.delayedCallTimeout = null;
    }
  };

  Controller.prototype._generateQueryCBId = function() {
    return {};
  };

  Controller.prototype._lookUp = function(query) {
    var _callback;
    _callback = function(queryCBId, data) {
      if (queryCBId !== this.expectedQueryCBId) {
        return;
      }
      if (data && data.length > 0) {
        return this.renderView(this.constructor.arrayToDefaultHash(data));
      } else {
        return this.view.hide();
      }
    };
    this.expectedQueryCBId = this._generateQueryCBId();
    return this.model.query(query.text, $.proxy(_callback, this, this.expectedQueryCBId));
  };

  return Controller;

})();

var TextareaController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextareaController = (function(superClass) {
  extend(TextareaController, superClass);

  function TextareaController() {
    return TextareaController.__super__.constructor.apply(this, arguments);
  }

  TextareaController.prototype.catchQuery = function() {
    var caretPos, content, end, isString, query, start, subtext;
    content = this.$inputor.val();
    caretPos = this.$inputor.caret('pos', {
      iframe: this.app.iframe
    });
    subtext = content.slice(0, caretPos);
    query = this.callbacks("matcher").call(this, this.at, subtext, this.getOpt('startWithSpace'), this.getOpt("acceptSpaceBar"));
    isString = typeof query === 'string';
    if (isString && query.length < this.getOpt('minLen', 0)) {
      return;
    }
    if (isString && query.length <= this.getOpt('maxLen', 20)) {
      start = caretPos - query.length;
      end = start + query.length;
      this.pos = start;
      query = {
        'text': query,
        'headPos': start,
        'endPos': end
      };
      // this.trigger("matched", [this.at, query.text]);
    } else {
      query = null;
      this.view.hide();
    }
    return this.query = query;
  };

  TextareaController.prototype.rect = function() {
    var c, iframeOffset, scaleBottom;
    if (!(c = this.$inputor.caret('offset', this.pos - 1, {
      iframe: this.app.iframe
    }))) {
      return;
    }
    if (this.app.iframe && !this.app.iframeAsRoot) {
      iframeOffset = $(this.app.iframe).offset();
      c.left += iframeOffset.left;
      c.top += iframeOffset.top;
    }
    scaleBottom = this.app.document.selection ? 0 : 2;
    return {
      left: c.left,
      top: c.top,
      bottom: c.top + c.height + scaleBottom
    };
  };

  TextareaController.prototype.insert = function(content, $li) {
    var $inputor, source, startStr, suffix, text;
    $inputor = this.$inputor;
    source = $inputor.val();
    startStr = source.slice(0, Math.max(this.query.headPos - this.at.length, 0));
    suffix = (suffix = this.getOpt('suffix')) === "" ? suffix : suffix || " ";
    content += suffix;
    text = "" + startStr + content + (source.slice(this.query['endPos'] || 0));
    $inputor.val(text);
    $inputor.caret('pos', startStr.length + content.length, {
      iframe: this.app.iframe
    });
    if (!$inputor.is(':focus')) {
      $inputor.focus();
    }
    return $inputor.change();
  };

  return TextareaController;

})(Controller);

var EditableController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EditableController = (function(superClass) {
  extend(EditableController, superClass);

  function EditableController() {
    return EditableController.__super__.constructor.apply(this, arguments);
  }

  EditableController.prototype._getRange = function() {
    var sel;
    sel = this.app.window.getSelection();
    if (sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
  };

  EditableController.prototype._setRange = function(position, node, range) {
    if (range == null) {
      range = this._getRange();
    }
    if (!(range && node)) {
      return;
    }
    node = $(node)[0];
    if (position === 'after') {
      range.setEndAfter(node);
      range.setStartAfter(node);
    } else {
      range.setEndBefore(node);
      range.setStartBefore(node);
    }
    range.collapse(false);
    return this._clearRange(range);
  };

  EditableController.prototype._clearRange = function(range) {
    var sel;
    if (range == null) {
      range = this._getRange();
    }
    sel = this.app.window.getSelection();
    if (this.ctrl_a_pressed == null) {
      sel.removeAllRanges();
      sel = window.getSelection();
      return sel.addRange(range);
    }
  };

  EditableController.prototype._movingEvent = function(e) {
    var ref;
    return e.type === 'click' || ((ref = e.which) === KEY_CODE.RIGHT || ref === KEY_CODE.LEFT || ref === KEY_CODE.UP || ref === KEY_CODE.DOWN);
  };

  EditableController.prototype._unwrap = function(node) {
    var next;
    node = $(node).unwrap().get(0);
    if ((next = node.nextSibling) && next.nodeValue) {
      node.nodeValue += next.nodeValue;
      $(next).remove();
    }
    return node;
  };

  EditableController.prototype.catchQuery = function(e) {
    var $inserted, $query, _range, index, inserted, isString, lastNode, matched, offset, query, query_content, range;
    if (!(range = this._getRange())) {
      return;
    }
    if (!range.collapsed) {
      return;
    }

    // e null check by juhee
    if (!e) {
      return;
    }

    if (e.which === KEY_CODE.ENTER) {
      ($query = $(range.startContainer).closest('.atwho-query')).contents().unwrap();
      if ($query.is(':empty')) {
        $query.remove();
      }
      ($query = $(".atwho-query", this.app.document)).text($query.text()).contents().last().unwrap();
      this._clearRange();
      return;
    }
    if (/firefox/i.test(navigator.userAgent)) {
      if ($(range.startContainer).is(this.$inputor)) {
        this._clearRange();
        return;
      }
      if (e.which === KEY_CODE.BACKSPACE && range.startContainer.nodeType === document.ELEMENT_NODE && (offset = range.startOffset - 1) >= 0) {
        // _range = range.cloneRange();
        // _range.setStart(range.startContainer, offset);
        // if ($(_range.cloneContents()).contents().last().is('.atwho-inserted')) {
        //   inserted = $(range.startContainer).contents().get(offset);
        //   this._setRange('after', $(inserted).contents().last());
        // }
      } else if (e.which === KEY_CODE.LEFT && range.startContainer.nodeType === document.TEXT_NODE) {
        // $inserted = $(range.startContainer.previousSibling);
        // if ($inserted.is('.atwho-inserted') && range.startOffset === 0) {
        //   this._setRange('after', $inserted.contents().last());
        // }
      }
    }

    // 함수와 컬럼에 적용된 스타일 각각 분리해서 처리
    $(range.startContainer).closest('.atwho-inserted').addClass('atwho-query').siblings().removeClass('atwho-query');
    if (($query = $(".atwho-query", this.app.document)).length > 0 && $query.is(':empty') && $query.text().length === 0) {
      $query.remove();
    }
    if (!this._movingEvent(e)) {
      // $query.removeClass('atwho-inserted');
    }
    if ($query.length > 0) {
      switch (e.which) {
        case KEY_CODE.LEFT:
          // this._setRange('before', $query.get(0), range);
          $query.removeClass('atwho-query');
          return;
        case KEY_CODE.RIGHT:
          // this._setRange('after', $query.get(0).nextSibling, range);
          $query.removeClass('atwho-query');
          return;
      }
    }
    if ($query.length > 0 && (query_content = $query.attr('data-atwho-at-query'))) {
      // $query.empty().html(query_content).attr('data-atwho-at-query', null);
      // this._setRange('after', $query.get(0), range);
    }
    _range = range.cloneRange();
    _range.setStart(range.startContainer, 0);
    matched = this.callbacks("matcher").call(this, this.at, _range.toString(), this.getOpt('startWithSpace'), this.getOpt("acceptSpaceBar"));
    isString = typeof matched === 'string';

    if ($query.length === 0 && isString && (index = range.startOffset - this.at.length - matched.length) >= 0 && matched.length > 0) {
      range.setStart(range.startContainer, index);
      $query = $('<span/>', this.app.document).attr(this.getOpt("editableAtwhoQueryAttrs")).addClass('atwho-query');
      range.surroundContents($query.get(0));
      lastNode = $query.contents().last().get(0);
      if (lastNode) {
        if (/firefox/i.test(navigator.userAgent)) {
          range.setStart(lastNode, lastNode.length);
          range.setEnd(lastNode, lastNode.length);
          this._clearRange(range);
        } else {
          this._setRange('after', lastNode, range);
        }
      }
    }

    if (isString && matched.length < this.getOpt('minLen', 0)) {
      this.view.hide();
      return;
    }
    if (isString && matched.length <= this.getOpt('maxLen', 20)) {
      query = {
        text: matched,
        el: $query
      };
      this.trigger("matched", [this.at, query.text]);
      return this.query = query;
    } else {
      this.view.hide();
      this.query = {
        el: $query
      };
      if ($query.text().indexOf(this.at) >= 0) {
        if (this._movingEvent(e) && ($query.hasClass('atwho-inserted1') || $query.hasClass('atwho-inserted2')) ) {
          $query.removeClass('atwho-query');
        } else if (false !== this.callbacks('afterMatchFailed').call(this, this.at, $query)) {
        }
      }
      return null;
    }
  };

  EditableController.prototype.rect = function() {
    var $iframe, iframeOffset, rect;
    rect = this.query.el.offset();
    if (!(rect && this.query.el[0].getClientRects().length)) {
      return;
    }
    if (this.app.iframe && !this.app.iframeAsRoot) {
      iframeOffset = ($iframe = $(this.app.iframe)).offset();
      rect.left += iframeOffset.left - this.$inputor.scrollLeft();
      rect.top += iframeOffset.top - this.$inputor.scrollTop();
    }
    rect.bottom = rect.top + this.query.el.height();
    return rect;
  };

  EditableController.prototype.insert = function(content, $li) {

    var data, overrides, range, suffix, suffixNode;
    if (!this.$inputor.is(':focus')) {
      this.$inputor.focus();
    }
    overrides = this.getOpt('functionOverrides');
    if (overrides.insert) {
      return overrides.insert.call(this, content, $li);
    }
    suffix = (suffix = this.getOpt('suffix')) === "" ? suffix : suffix || "\u00A0";
    data = $li.data('item-data');

    // 함수와 컬럼에 스타일 각각 분리해서 처리
    this.query.el.removeClass('atwho-query');
    if( this.query.text.trim() === this.query.el.text().trim() ) {
      // edit by eltriny - for prep
      this.query.el.addClass( ( data.commonCode || data.category ) ? 'atwho-inserted1' : 'atwho-inserted2' ).html(content);
    } else {
      var text = this.query.el.text();
      this.query.el.text(text.replace( this.query.text, ''));
      // edit by eltriny - for prep
      this.query.el.after(
        '<span class="' + ( ( data.commonCode || data.category ) ? 'atwho-inserted1' : 'atwho-inserted2' ) + '" >' + content + '</span>'
      );
    }

    //this.query.el.removeClass('atwho-query').addClass('atwho-inserted').html(content).attr('data-atwho-at-query', "" + data['atwho-at'] + this.query.text).attr('contenteditable', "true");
    if (range = this._getRange()) {
      if (this.query.el.length) {
        range.setEndAfter(this.query.el[0]);
      }
      range.collapse(false);
      range.insertNode(suffixNode = this.app.document.createTextNode("" + suffix));
      this._setRange('after', suffixNode, range);
    }
    if (!this.$inputor.is(':focus')) {
      this.$inputor.focus();
    }

    return this.$inputor.change();
  };

  return EditableController;

})(Controller);

var Model;

Model = (function() {
  function Model(context) {
    this.context = context;
    this.at = this.context.at;
    this.storage = this.context.$inputor;
  }

  Model.prototype.destroy = function() {
    return this.storage.data(this.at, null);
  };

  Model.prototype.saved = function() {
    return this.fetch() > 0;
  };

  Model.prototype.query = function(query, callback) {
    var _remoteFilter, data, searchKey;
    data = this.fetch();
    searchKey = this.context.getOpt("searchKey");
    data = this.context.callbacks('filter').call(this.context, query, data, searchKey) || [];
    _remoteFilter = this.context.callbacks('remoteFilter');
    if (data.length > 0 || (!_remoteFilter && data.length === 0)) {
      return callback(data);
    } else {
      return _remoteFilter.call(this.context, query, callback);
    }
  };

  Model.prototype.fetch = function() {
    return this.storage.data(this.at) || [];
  };

  Model.prototype.save = function(data) {
    return this.storage.data(this.at, this.context.callbacks("beforeSave").call(this.context, data || []));
  };

  Model.prototype.load = function(data) {
    if (!(this.saved() || !data)) {
      return this._load(data);
    }
  };

  Model.prototype.reload = function(data) {
    return this._load(data);
  };

  Model.prototype._load = function(data) {
    if (typeof data === "string") {
      return $.ajax(data, {
        dataType: "json"
      }).done((function(_this) {
        return function(data) {
          return _this.save(data);
        };
      })(this));
    } else {
      return this.save(data);
    }
  };

  return Model;

})();

var View;

View = (function() {
  function View(context) {
    this.context = context;
    // ddp - element추가
    this.$el = $("<div class='atwho-view ddp-wrap-popup2 ddp-types ddp-accout-popup'><div class='ddp-ui-label column'>Column</div><ul class='atwho-view-ul column ddp-list-popup'></ul><div class='ddp-ui-label formula'>Formula</div><ul class='atwho-view-ul formula ddp-list-popup'></ul></div>");
    this.$elUl = this.$el;
    this.timeoutID = null;
    this.context.$el.append(this.$el);
    this.bindEvent();
  }

  View.prototype.init = function() {
    var header_tpl, id;
    id = this.context.getOpt("alias") || this.context.at.charCodeAt(0);
    header_tpl = this.context.getOpt("headerTpl");
    if (header_tpl && this.$el.children().length === 1) {
      this.$el.prepend(header_tpl);
    }
    return this.$el.attr({
      'id': "at-view-" + id
    });
  };

  View.prototype.destroy = function() {
    return this.$el.remove();
  };

  View.prototype.bindEvent = function() {
    var $menu, lastCoordX, lastCoordY;
    $menu = this.$el.find('ul');
    lastCoordX = 0;
    lastCoordY = 0;
    return $menu.on('mousemove.atwho-view', 'li', (function(_this) {
      return function(e) {
        var $cur;
        if (lastCoordX === e.clientX && lastCoordY === e.clientY) {
          return;
        }
        lastCoordX = e.clientX;
        lastCoordY = e.clientY;
        $cur = $(e.currentTarget);
        if ($cur.hasClass('cur')) {
          return;
        }
        $menu.find('.cur').removeClass('cur');
        return $cur.addClass('cur');
      };
    })(this)).on('click.atwho-view', 'li', (function(_this) {
      return function(e) {
        $menu.find('.cur').removeClass('cur');
        $(e.currentTarget).addClass('cur');
        _this.choose(e);
        return e.preventDefault();
      };
    })(this));
  };

  View.prototype.visible = function() {
    return $.expr.filters.visible(this.$el[0]);
  };

  View.prototype.highlighted = function() {
    return this.$el.find(".cur").length > 0;
  };

  View.prototype.choose = function(e) {
    var $li, content;
    if (($li = this.$el.find(".cur")).length) {
      content = this.context.insertContentFor($li);
      this.context._stopDelayedCall();
      this.context.insert(this.context.callbacks("beforeInsert").call(this.context, content, $li, e), $li);
      this.context.trigger("inserted", [$li, e]);
      this.context.callbacks("afterInsert").call(this.context, content, $li, e);
      this.hide(e);
    }
    if (this.context.getOpt("hideWithoutSuffix")) {
      return this.stopShowing = true;
    }
  };

  View.prototype.reposition = function(rect) {
    var _window, offset, overflowOffset, ref;
    _window = this.context.app.iframeAsRoot ? this.context.app.window : window;
    if (rect.bottom + this.$el.height() - $(_window).scrollTop() > $(_window).height()) {
      rect.bottom = rect.top - this.$el.height();
    }
    if (rect.left > (overflowOffset = $(_window).width() - this.$el.width() - 5)) {
      rect.left = overflowOffset;
    }
    offset = {
      left: rect.left,
      top: rect.bottom
    };
    if ((ref = this.context.callbacks("beforeReposition")) != null) {
      ref.call(this.context, offset);
    }
    this.$el.offset(offset);
    return this.context.trigger("reposition", [offset]);
  };

  // ddp 아래위 키보드 이동 처리
  View.prototype.next = function() {

    var cur, next, nextEl, offset;
    cur = this.$el.find('.cur').removeClass('cur');
    next = cur.next();

    var parentUl;

    var ul2Size = this.$el.find('ul.formula li').length;

    if (cur.parent().attr('class').indexOf('column') > -1) {
      parentUl = 'ul';
    } else {
      parentUl = 'ul2';
    }

    // 다음이 없을 경우
    if (!next.length) {
      // 현재 위치가 컬럼인경우
      if (parentUl === 'ul') {
        // 함수가 있을 경우
        if(ul2Size != 0) {
          next = this.$el.find('ul.formula li:first');
        // 함수가 없을 경우
        } else {
          next = this.$el.find('ul.column li:first');
        }
      // 현재 위치가 함수인경우
      } else {

        // 컬럼이 있을 경우
        if(ul2Size != 0) {
          next = this.$el.find('ul.column li:first');
          // 컬럼이 없을 경우
        } else {
          next = this.$el.find('ul.formula li:first');
        }
      }

    }


    next.addClass('cur');
    nextEl = next[0];
    offset = nextEl.offsetTop + nextEl.offsetHeight + (nextEl.nextSibling ? nextEl.nextSibling.offsetHeight : 0);
    return this.scrollTop(Math.max(0, offset - this.$el.height()));
  };

  View.prototype.prev = function() {
    var cur, offset, prev, prevEl;
    cur = this.$el.find('.cur').removeClass('cur');
    prev = cur.prev();

    var parentUl;

    var ul2Size = this.$el.find('ul.formula li').length;

    if (cur.parent().attr('class').indexOf('column') > -1) {
      parentUl = 'ul';
    } else {
      parentUl = 'ul2';
    }

    // 다음이 없을 경우
    if (!prev.length) {
      // 현재 위치가 컬럼인경우
      if (parentUl === 'ul') {
        // 함수가 있을 경우
        if(ul2Size != 0) {
          prev = this.$el.find('ul.formula li:last');
          // 함수가 없을 경우
        } else {
          prev = this.$el.find('ul.column li:last');
        }
      // 현재 위치가 함수인경우
      } else {
        // 컬럼이 있을 경우
        if(ul2Size != 0) {
          prev = this.$el.find('ul.column li:last');
          // 컬럼이 없을 경우
        } else {
          prev = this.$el.find('ul.formula li:last');
        }
      }

    }



    prev.addClass('cur');
    prevEl = prev[0];
    offset = prevEl.offsetTop + prevEl.offsetHeight + (prevEl.nextSibling ? prevEl.nextSibling.offsetHeight : 0);
    return this.scrollTop(Math.max(0, offset - this.$el.height()));
  };

  View.prototype.scrollTop = function(scrollTop) {
    var scrollDuration;
    scrollDuration = this.context.getOpt('scrollDuration');
    if (scrollDuration) {
      return this.$elUl.animate({
        scrollTop: scrollTop
      }, scrollDuration);
    } else {
      return this.$elUl.scrollTop(scrollTop);
    }
  };

  View.prototype.show = function() {
    var rect;
    if (this.stopShowing) {
      this.stopShowing = false;
      return;
    }
    if (!this.visible()) {
      this.$el.show();
      this.$el.scrollTop(0);
      this.context.trigger('shown');
    }
    if (rect = this.context.rect()) {
      return this.reposition(rect);
    }
  };

  View.prototype.hide = function(e, time) {
    var callback;
    if (!this.visible()) {
      return;
    }
    if (isNaN(time)) {
      this.$el.hide();
      return this.context.trigger('hidden', [e]);
    } else {
      callback = (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this);
      clearTimeout(this.timeoutID);
      return this.timeoutID = setTimeout(callback, time);
    }
  };

  View.prototype.render = function(list) {
    var $li, $ul, i, item, len, li, tpl;
    if (!($.isArray(list) && list.length > 0)) {
      this.hide();
      return;
    }
    // ddp-column-list
    this.$el.find('ul.column').empty();
    $ul = this.$el.find('ul.column');
    tpl = this.context.getOpt('displayTpl');

    // ddp-formula-list
    this.$el.find('ul.formula').empty();
    $ul2 = this.$el.find('ul.formula');
    tpl2 = this.context.getOpt('displayTpl');

    var functionCount = 0;
    var columnCount = 0;

    for (i = 0, len = list.length; i < len; i++) {
      item = list[i];
      item = $.extend({}, item, {
        'atwho-at': this.context.at
      });

      // TODO ddp 데이터 분기
      if (item.commonCode) {
        functionCount++;
        item.name = item.commonValue;
        item.class = 'ddp-icon-type-account';
        li = this.context.callbacks("tplEval").call(this.context, tpl2, item, "onDisplay");
        $li = $(this.context.callbacks("highlighter").call(this.context, li, this.context.query.text));
        $li.data("item-data", item);
        $ul2.append($li);
      } else if (item.category) { // add by eltriny - for prep
        functionCount++;
        item.class = 'ddp-icon-type-account';
        li = this.context.callbacks("tplEval").call(this.context, tpl2, item, "onDisplay");
        $li = $(this.context.callbacks("highlighter").call(this.context, li, this.context.query.text));
        $li.data("item-data", item);
        $ul2.append($li);
      } else {
        columnCount++;
        if (item.ref) item.name = item.ref + '.' + item.name;
        item.class = getIconClass(item.type, item.role);
        li = this.context.callbacks("tplEval").call(this.context, tpl, item, "onDisplay");
        $li = $(this.context.callbacks("highlighter").call(this.context, li, this.context.query.text));
        $li.data("item-data", item);
        $ul.append($li);

      }

    }

    // ddp - 데이터 없을 경우 요소 숨김
    if (functionCount === 0) {
      $ul2.parent().find('div.formula').css('display','none');
    } else {
      $ul2.parent().find('div.formula').css('display','block');
    }

    if (columnCount === 0) {
      $ul.parent().find('div.column').css('display','none');
    } else {
      $ul.parent().find('div.column').css('display','block');
    }

    this.show();
    if (this.context.getOpt('highlightFirst')) {
      if (columnCount > 0) {
        return $ul.find("li:first").addClass("cur");
      } else {
        return $ul2.find("li:first").addClass("cur");
      }
      // ddp calss변경

    }

  };
function getIconClass(itemType, role){
    var result = '';
    switch (itemType.toUpperCase()) {
      case 'TIMESTAMP':
        result = 'ddp-icon-type-calen';
        break;
      case 'BOOLEAN':
        result = 'ddp-icon-type-tf';
        break;
      case 'TEXT':
      case 'STRING':
      case 'USER_DEFINED':
        result = 'ddp-icon-type-ab';
        break;
      case 'INTEGER':
      case 'DOUBLE':
      case 'CALCULATED':
        result = 'ddp-icon-type-sharp';
        break;
      case 'LNG':
      case 'LNT':
        result = 'ddp-icon-type-local';
        break;
      case 'USER_EXPR':
        result = (role == 'DIMENSION')?'ddp-icon-type-ab':'ddp-icon-type-sharp';
        break;
      default:
        break;
    }
    return result;
  }

  return View;

})();

var Api;

Api = {
  load: function(at, data) {
    var c;
    if (c = this.controller(at)) {
      return c.model.load(data);
    }
  },
  isSelecting: function() {
    var ref;
    return !!((ref = this.controller()) != null ? ref.view.visible() : void 0);
  },
  hide: function() {
    var ref;
    return (ref = this.controller()) != null ? ref.view.hide() : void 0;
  },
  reposition: function() {
    var c;
    if (c = this.controller()) {
      return c.view.reposition(c.rect());
    }
  },
  setIframe: function(iframe, asRoot) {
    this.setupRootElement(iframe, asRoot);
    return null;
  },
  run: function() {
    return this.dispatch();
  },
  destroy: function() {
    this.shutdown();
    return this.$inputor.data('atwho', null);
  }
};

$.fn.atwho = function(method) {
  var _args, result;
  _args = arguments;
  result = null;
  this.filter('textarea, input, [contenteditable=""], [contenteditable=true]').each(function() {
    var $this, app;
    if (!(app = ($this = $(this)).data("atwho"))) {
      $this.data('atwho', (app = new App(this)));
    }
    if (typeof method === 'object' || !method) {
      return app.reg(method.at, method);
    } else if (Api[method] && app) {
      return result = Api[method].apply(app, Array.prototype.slice.call(_args, 1));
    } else {
      return $.error("Method " + method + " does not exist on jQuery.atwho");
    }
  });
  if (result != null) {
    return result;
  } else {
    return this;
  }
};

$.fn.atwho["default"] = {
  at: void 0,
  alias: void 0,
  data: null,
  displayTpl: "<li>${name}</li>",
  insertTpl: "${atwho-at}${name}",
  headerTpl: null,
  callbacks: DEFAULT_CALLBACKS,
  functionOverrides: {},
  searchKey: "name",
  suffix: void 0,
  hideWithoutSuffix: false,
  startWithSpace: true,
  acceptSpaceBar: false,
  highlightFirst: true,
  limit: 5,
  maxLen: 20,
  minLen: 0,
  displayTimeout: 300,
  delay: null,
  spaceSelectsMatch: false,
  tabSelectsMatch: true,
  editableAtwhoQueryAttrs: {},
  scrollDuration: 150,
  suspendOnComposing: true,
  lookUpOnClick: true
};

$.fn.atwho.debug = false;

}));
