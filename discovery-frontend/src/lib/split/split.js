/*! Split.js - v1.3.5 */

(function(window) {

  var global = window;
  var document = global.document;

  var addEventListener = 'addEventListener';
  var removeEventListener = 'removeEventListener';
  var getBoundingClientRect = 'getBoundingClientRect';
  var gutterStartDragging = '_a';
  var aGutterSize = '_b';
  var bGutterSize = '_c';
  var HORIZONTAL = 'horizontal';
  var NOOP = function() { return false; };

  var isIE8 = global['attachEvent'] && !global[addEventListener];

  var calc = (['', '-webkit-', '-moz-', '-o-'].filter(function(prefix) {
    var el = document.createElement('div');
    el.style.cssText = 'width:' + prefix + 'calc(9px)';
    return !!el.style.length;
  }).shift()) + 'calc';

  var isString = function(v) {
    return typeof v === 'string' || v instanceof String;
  };

  var elementOrSelector = function(el) {
    if (isString(el)) {
      var ele = document.querySelector(el);
      if (!ele) {
        throw new Error('Selector ' + el + 'did not match a DOM element');
      }
      return ele;
    }

    return el;
  };

  var getOption = function(options, propName, def) {
    var value = options[propName];
    if (value !== undefined) {
      return value;
    }
    return def;
  };

  var getGutterSize = function(gutterSize, isFirst, isLast, gutterAlign) {
    if (isFirst) {
      if (gutterAlign === 'end') {
        return 0;
      }
      if (gutterAlign === 'center') {
        return gutterSize / 2;
      }
    } else if (isLast) {
      if (gutterAlign === 'start') {
        return 0;
      }
      if (gutterAlign === 'center') {
        return gutterSize / 2;
      }
    }

    return gutterSize;
  };

  var defaultGutterFn = function(i, gutterDirection) {
    var gut = document.createElement('div');
    gut.className = 'gutter gutter-' + gutterDirection;
    return gut;
  };

  var defaultElementStyleFn = function(dim, size, gutSize) {
    var style = {};

    if (!isString(size)) {
      if (!isIE8) {
        style[dim] = calc + '(' + size + '% - ' + gutSize + 'px)';
      } else {
        style[dim] = size + '%';
      }
    } else {
      style[dim] = size;
    }

    return style;
  };

  var defaultGutterStyleFn = function(dim, gutSize) {
    var obj = {};
    obj[dim] = gutSize + 'px';
    return obj;
  };

  window.Split = function(idsOption, options) {

    if( options === void 0 ) options = {};

    var ids = idsOption;
    var dimension;
    var clientAxis;
    var position;
    var positionEnd;
    var clientSize;
    var elements;

    if (Array.from) {
      ids = Array.from(ids);
    }

    var firstElement = elementOrSelector(ids[0]);
    var parent = firstElement.parentNode;
    var parentFlexDirection = getComputedStyle ? getComputedStyle(parent).flexDirection : null;

    var sizes = getOption(options, 'sizes') || ids.map(function() { return 100 / ids.length; });

    var minSize = getOption(options, 'minSize', 100);
    var minSizes = Array.isArray(minSize) ? minSize : ids.map( function() { return minSize; });

    var expandToMin = getOption(options, 'expandToMin', false);
    var gutterSize = getOption(options, 'gutterSize', 10);
    var gutterAlign = getOption(options, 'gutterAlign', 'center');
    var snapOffset = getOption(options, 'snapOffset', 30);
    var dragInterval = getOption(options, 'dragInterval', 1);
    var direction = getOption(options, 'direction', HORIZONTAL);
    var cursor = getOption(
      options,
      'cursor',
      direction === HORIZONTAL ? 'col-resize' : 'row-resize'
    );
    var gutter = getOption(options, 'gutter', defaultGutterFn);
    var elementStyle = getOption(
      options,
      'elementStyle',
      defaultElementStyleFn
    );
    var gutterStyle = getOption(options, 'gutterStyle', defaultGutterStyleFn);

    if (direction === HORIZONTAL) {
      dimension = 'width';
      clientAxis = 'clientX';
      position = 'left';
      positionEnd = 'right';
      clientSize = 'clientWidth';
    } else if (direction === 'vertical') {
      dimension = 'height';
      clientAxis = 'clientY';
      position = 'top';
      positionEnd = 'bottom';
      clientSize = 'clientHeight';
    }

    function setElementSize(el, size, gutSize, i) {
      var style = elementStyle(dimension, size, gutSize, i);

      Object.keys(style).forEach(function(prop) {
        el.style[prop] = style[prop];
      })
    }

    function setGutterSize(gutterElement, gutSize, i) {
      var style = gutterStyle(dimension, gutSize, i);

      Object.keys(style).forEach(function(prop) {
        gutterElement.style[prop] = style[prop];
      });
    }

    function getSizes() {
      return elements.map(function(element) { return element.size});
    }

    function getMousePosition(e) {
      if ('touches' in e) return e.touches[0][clientAxis];
      return e[clientAxis];
    }

    function adjust(offset) {
      var a = elements[this.a];
      var b = elements[this.b];
      var percentage = a.size + b.size;

      a.size = (offset / this.size) * percentage;
      b.size = percentage - (offset / this.size) * percentage;

      setElementSize(a.element, a.size, this[aGutterSize], a.i);
      setElementSize(b.element, b.size, this[bGutterSize], b.i);
    }

    function drag(e) {
      var offset;
      var a = elements[this.a];
      var b = elements[this.b];

      if (!this.dragging) return;

      offset = getMousePosition(e) - this.start + (this[aGutterSize] - this.dragOffset);

      if (dragInterval > 1) {
        offset = Math.round(offset / dragInterval) * dragInterval;
      }

      if (offset <= a.minSize + snapOffset + this[aGutterSize]) {
        offset = a.minSize + this[aGutterSize];
      } else if (offset >= this.size - (b.minSize + snapOffset + this[bGutterSize])) {
        offset = this.size - (b.minSize + this[bGutterSize]);
      }

      adjust.call(this, offset);

      getOption(options, 'onDrag', NOOP)();
    }

    function calculateSizes() {
      var a = elements[this.a].element;
      var b = elements[this.b].element;

      var aBounds = a[getBoundingClientRect]();
      var bBounds = b[getBoundingClientRect]();

      this.size = aBounds[dimension] + bBounds[dimension] + this[aGutterSize] + this[bGutterSize];
      this.start = aBounds[position];
      this.end = aBounds[positionEnd];
    }

    function innerSize(element) {
      if (!getComputedStyle) return null;

      var computedStyle = getComputedStyle(element);
      var size = element[clientSize];

      if (size === 0) return null;

      if (direction === HORIZONTAL) {
        size -=
          parseFloat(computedStyle.paddingLeft) +
          parseFloat(computedStyle.paddingRight);
      } else {
        size -=
          parseFloat(computedStyle.paddingTop) +
          parseFloat(computedStyle.paddingBottom);
      }

      return size;
    }

    function trimToMin(sizesToTrim) {
      var parentSize = innerSize(parent);
      if (parentSize === null) {
        return sizesToTrim;
      }

      var excessPixels = 0;
      var toSpare = [];

      var pixelSizes = sizesToTrim.map(function(size, i) {
        var pixelSize = (parentSize * size) / 100;
        var elementGutterSize = getGutterSize(
          gutterSize,
          i === 0,
          i === sizesToTrim.length - 1,
          gutterAlign
        );
        var elementMinSize = minSizes[i] + elementGutterSize;

        if (pixelSize < elementMinSize) {
          excessPixels += elementMinSize - pixelSize;
          toSpare.push(0);
          return elementMinSize;
        }

        toSpare.push(pixelSize - elementMinSize);
        return pixelSize;
      });

      if (excessPixels === 0) {
        return sizesToTrim
      }

      return pixelSizes.map(function(pixelSize, i) {
        var newPixelSize = pixelSize;

        if (excessPixels > 0 && toSpare[i] - excessPixels > 0) {
          var takenPixels = Math.min(
            excessPixels,
            toSpare[i] - excessPixels
          );

          excessPixels -= takenPixels;
          newPixelSize = pixelSize - takenPixels;
        }

        return (newPixelSize / parentSize) * 100;
      });
    }

    function stopDragging() {
      var self = this;
      var a = elements[self.a].element;
      var b = elements[self.b].element;

      if (self.dragging) {
        getOption(options, 'onDragEnd', NOOP)(getSizes());
      }

      self.dragging = false;

      global[removeEventListener]('mouseup', self.stop);
      global[removeEventListener]('touchend', self.stop);
      global[removeEventListener]('touchcancel', self.stop);
      global[removeEventListener]('mousemove', self.move);
      global[removeEventListener]('touchmove', self.move);

      self.stop = null;
      self.move = null;

      a[removeEventListener]('selectstart', NOOP);
      a[removeEventListener]('dragstart', NOOP);
      b[removeEventListener]('selectstart', NOOP);
      b[removeEventListener]('dragstart', NOOP);

      a.style.userSelect = '';
      a.style.webkitUserSelect = '';
      a.style.MozUserSelect = '';
      a.style.pointerEvents = '';

      b.style.userSelect = '';
      b.style.webkitUserSelect = '';
      b.style.MozUserSelect = '';
      b.style.pointerEvents = '';

      self.gutter.style.cursor = '';
      self.parent.style.cursor = '';
      document.body.style.cursor = '';
    }

    function startDragging(e) {
      if ('button' in e && e.button !== 0) {
        return;
      }

      var self = this;
      var a = elements[self.a].element;
      var b = elements[self.b].element;

      if (!self.dragging) {
        getOption(options, 'onDragStart', NOOP)(getSizes());
      }

      e.preventDefault();

      self.dragging = true;

      self.move = drag.bind(self);
      self.stop = stopDragging.bind(self);

      global[addEventListener]('mouseup', self.stop);
      global[addEventListener]('touchend', self.stop);
      global[addEventListener]('touchcancel', self.stop);
      global[addEventListener]('mousemove', self.move);
      global[addEventListener]('touchmove', self.move);

      a[addEventListener]('selectstart', NOOP);
      a[addEventListener]('dragstart', NOOP);
      b[addEventListener]('selectstart', NOOP);
      b[addEventListener]('dragstart', NOOP);

      a.style.userSelect = 'none';
      a.style.webkitUserSelect = 'none';
      a.style.MozUserSelect = 'none';
      a.style.pointerEvents = 'none';

      b.style.userSelect = 'none';
      b.style.webkitUserSelect = 'none';
      b.style.MozUserSelect = 'none';
      b.style.pointerEvents = 'none';

      self.gutter.style.cursor = cursor;
      self.parent.style.cursor = cursor;
      document.body.style.cursor = cursor;

      calculateSizes.call(self);

      self.dragOffset = getMousePosition(e) - self.end;
    }

    sizes = trimToMin(sizes);

    var pairs = [];
    elements = ids.map(function(id, i) {
      var element = {
        element: elementOrSelector(id),
        size: sizes[i],
        minSize: minSizes[i],
        i : i
      };

      var pair;

      if (i > 0) {
        pair = {
          a: i - 1,
          b: i,
          dragging: false,
          direction : direction,
          parent : parent
        };

        pair[aGutterSize] = getGutterSize(
          gutterSize,
          i - 1 === 0,
          false,
          gutterAlign
        );
        pair[bGutterSize] = getGutterSize(
          gutterSize,
          false,
          i === ids.length - 1,
          gutterAlign
        );

        if (parentFlexDirection === 'row-reverse' || parentFlexDirection === 'column-reverse') {
          var temp = pair.a;
          pair.a = pair.b;
          pair.b = temp;
        }
      }

      if (!isIE8) {
        if (i > 0) {
          var gutterElement = gutter(i, direction, element.element);
          setGutterSize(gutterElement, gutterSize, i);

          pair[gutterStartDragging] = startDragging.bind(pair);

          gutterElement[addEventListener]('mousedown', pair[gutterStartDragging]);
          gutterElement[addEventListener]('touchstart', pair[gutterStartDragging]);

          parent.insertBefore(gutterElement, element.element);

          pair.gutter = gutterElement;
        }
      }

      setElementSize(
        element.element,
        element.size,
        getGutterSize(gutterSize, i === 0, i === ids.length - 1, gutterAlign)
      );

      if (i > 0) {
        pairs.push(pair);
      }

      return element;
    });

    function adjustToMin(element) {
      var isLast = element.i === pairs.length;
      var pair = isLast ? pairs[element.i - 1] : pairs[element.i];

      calculateSizes.call(pair);

      var size = isLast
        ? pair.size - element.minSize - pair[bGutterSize]
        : element.minSize + pair[aGutterSize];

      adjust.call(pair, size);
    }

    elements.forEach(function(element) {
      var computedSize = element.element[getBoundingClientRect]()[dimension];

      if (computedSize < element.minSize) {
        if (expandToMin) {
          adjustToMin(element);
        } else {
          element.minSize = computedSize;
        }
      }
    });

    function setSizes(newSizes) {
      var trimmed = trimToMin(newSizes);
      trimmed.forEach(function(newSize, i) {
        if (i > 0) {
          var pair = pairs[i - 1];

          var a = elements[pair.a];
          var b = elements[pair.b];

          a.size = trimmed[i - 1];
          b.size = newSize;

          setElementSize(a.element, a.size, pair[aGutterSize]);
          setElementSize(b.element, b.size, pair[bGutterSize]);
        }
      })
    }

    function destroy(preserveStyles, preserveGutter) {
      pairs.forEach(function(pair) {
        if (preserveGutter !== true) {
          pair.parent.removeChild(pair.gutter)
        } else {
          pair.gutter[removeEventListener]('mousedown', pair[gutterStartDragging]);
          pair.gutter[removeEventListener]('touchstart', pair[gutterStartDragging]);
        }

        if (preserveStyles !== true) {
          var style = elementStyle( dimension, pair.a.size, pair[aGutterSize] );

          Object.keys(style).forEach(function(prop) {
            elements[pair.a].element.style[prop] = '';
            elements[pair.b].element.style[prop] = '';
          })
        }
      })
    }

    if (isIE8) {
      return {
        setSizes : setSizes,
        destroy : destroy
      };
    }

    return {
      setSizes : setSizes,
      getSizes : getSizes,
      collapse : function(i) {
        adjustToMin(elements[i])
      },
      destroy : destroy,
      parent : parent,
      pairs : pairs
    };
  };

})(window);
