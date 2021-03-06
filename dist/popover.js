(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var POPUP_NAME = 'Popup';
var POPOVER_NAME = 'Popover';

var Popup = require('./popup');
var Popover = require('./popover');

if (typeof define === 'function' && define.amd) { // For AMD
  define(POPUP_NAME, function() {
    return Popup;
  });
  define(POPOVER_NAME, function() {
    return Popover;
  });
} else if (typeof angular === 'object' && !!angular.version) {
  angular.module('popover.js', []).factory(POPUP_NAME, function() {
    return Popup;
  }).factory(POPOVER_NAME, function() {
    return Popover;
  });
}
Number(document.documentMode) < 9 && window.execScript('var ' + POPUP_NAME + ',' + POPOVER_NAME + ';');
window[POPUP_NAME] = Popup;
window[POPOVER_NAME] = Popover;

},{"./popover":5,"./popup":6}],2:[function(require,module,exports){
var domUtil = require('./dom-util');
var transition = require('./transition');

var transitionProperty = transition.prefix + 'transition';
var transformProperty = transition.prefix + 'transform';

module.exports = {
  'fade': {
    duration: 200,
    show: function(popover) {
      domUtil.setStyle(popover.dom, 'opacity', 0);

      popover.dom.style.visibility = '';

      setTimeout(function() {
        domUtil.bindOnce(popover.dom, transition.event, function() {
          domUtil.setStyle(popover.dom, transitionProperty, '');
          domUtil.setStyle(popover.dom, 'opacity', '');
        });
        domUtil.setStyle(popover.dom, transitionProperty, 'opacity 200ms linear');
        domUtil.setStyle(popover.dom, 'opacity', 1);
      }, 10);
    },
    hide: function(popover) {
      domUtil.setStyle(popover.dom, 'opacity', 1);

      setTimeout(function() {
        domUtil.bindOnce(popover.dom, transition.event, function() {
          popover.afterHide();
          domUtil.setStyle(popover.dom, transitionProperty, '');
          domUtil.setStyle(popover.dom, 'opacity', '');
        });
        domUtil.setStyle(popover.dom, transitionProperty, 'opacity 200ms linear');
        domUtil.setStyle(popover.dom, 'opacity', 0);
      }, 10);
    }
  },
  'pop': {
    duration: 200,
    show: function(popover) {
      domUtil.setStyle(popover.dom, transformProperty, 'scale(0.8)');

      popover.dom.style.visibility = '';

      setTimeout(function() {
        domUtil.bindOnce(popover.dom, transition.event, function() {
          domUtil.setStyle(popover.dom, transitionProperty, '');
          domUtil.setStyle(popover.dom, transformProperty, '');
        });
        domUtil.setStyle(popover.dom, transitionProperty, transformProperty + ' 200ms cubic-bezier(0.3, 0, 0, 1.5)');
        domUtil.setStyle(popover.dom, transformProperty, 'none');
      }, 10);
    },
    hide: function(popover) {
      domUtil.setStyle(popover.dom, transformProperty, 'none');

      setTimeout(function() {
        domUtil.bindOnce(popover.dom, transition.event, function() {
          popover.afterHide();
          domUtil.setStyle(popover.dom, transitionProperty, '');
          domUtil.setStyle(popover.dom, transformProperty, '');
        });
        domUtil.setStyle(popover.dom, transitionProperty, transformProperty + ' 200ms cubic-bezier(0.3, 0, 0, 1.5)');
        domUtil.setStyle(popover.dom, transformProperty, 'scale(0.8)');
      }, 10);
    }
  }
};
},{"./dom-util":3,"./transition":7}],3:[function(require,module,exports){
var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
var MOZ_HACK_REGEXP = /^moz([A-Z])/;

function camelCase(name) {
  return name.
    replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).
    replace(MOZ_HACK_REGEXP, 'Moz$1');
}

var ieVersion = Number(document.documentMode);
var getStyle = ieVersion < 9 ? function(element, styleName) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'styleFloat';
  }
  try {
    switch (styleName) {
      case 'opacity':
        try {
          return element.filters.item('alpha').opacity / 100;
        }
        catch (e) {
          return 1.0;
        }
        break;
      default:
        return ( element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null );
    }
  } catch(e) {
    return element.style[styleName];
  }
} : function(element, styleName) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '');
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch(e) {
    return element.style[styleName];
  }
};

var setStyle = function(element, styleName, value) {
  if (!element || !styleName) return;

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
    } else {
      element.style[styleName] = value;
    }
  }
};

var getRect = function(element) {
  if (ieVersion < 9) {
    var rect = element.getBoundingClientRect();

    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom
    };
  }
  return element.getBoundingClientRect();
};

var positionElement = function(element, target, placement, alignment) {
  if (!element || !target || !placement) {
    return null;
  }

  alignment = alignment || 'center';
  var targetRect = getRect(target);
  var selfRect = getRect(element);
  var position = {};

  switch (placement) {
    case 'left':
      position.left = targetRect.left - selfRect.width;
      break;
    case 'right':
      position.left = targetRect.right;
      break;
    case 'innerLeft':
      position.left = targetRect.left;
      break;
    case 'innerRight':
      position.left = targetRect.right - selfRect.width;
      break;
    case 'center':
      position.left = (targetRect.right - selfRect.width) / 2;
      break;
    case 'top':
      position.top = targetRect.top - selfRect.height;
      break;
    case 'bottom':
      position.top = targetRect.bottom;
      break;
  }

  if (placement == 'left' || placement == 'right' || placement == 'innerLeft' || placement == 'innerRight') {
    switch (alignment) {
      case 'start':
        position.top = targetRect.top;
        break;
      case 'center':
        position.top = (targetRect.top + targetRect.bottom) / 2 - selfRect.height / 2;
        break;
      case 'end':
        position.top = targetRect.bottom - selfRect.height;
        break;
    }
  } else {
    switch (alignment) {
      case 'start':
        position.left = targetRect.left;
        break;
      case 'center':
        position.left = (targetRect.left + targetRect.right) / 2 - selfRect.width / 2;
        break;
      case 'end':
        position.left = targetRect.right - selfRect.width;
        break;
    }
  }

  var currentNode = element.parentNode;

  while (currentNode && currentNode.nodeName !== 'HTML') {
    if (getStyle(currentNode, 'position') !== 'static') {
      break;
    }
    currentNode = currentNode.parentNode;
  }

  if (currentNode) {
    var parentRect = getRect(currentNode);

    position.left = position.left - parentRect.left;
    position.top = position.top - parentRect.top;
  }

  return position;
};

var isElementOutside = function(element) {
  var rect = element.getBoundingClientRect();
  var leftOutside = false;
  var topOutside = false;

  if (rect.top < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
    topOutside = true;
  }

  if (rect.left < 0 || rect.right > (window.innerWidth || document.documentElement.clientWidth)) {
    leftOutside = true;
  }

  if (leftOutside && topOutside) {
    return 'both';
  } else if (leftOutside) {
    return 'left';
  } else if (topOutside) {
    return 'top';
  }

  return 'none';
};

var bindEvent = (function() {
  if(document.addEventListener) {
    return function(element, event, handler) {
      element.addEventListener(event, handler, false);
    };
  } else {
    return function(element, event, handler) {
      element.attachEvent('on' + event, handler);
    };
  }
})();

var unbindEvent = (function() {
  if(document.removeEventListener) {
    return function(element, event, handler) {
      element.removeEventListener(event, handler);
    };
  } else {
    return function(element, event, handler) {
      element.detachEvent('on' + event, handler);
    };
  }
})();

var bindOnce = function(el, event, fn) {
  var listener = function() {
    if (fn) {
      fn.apply(this, arguments);
    }
    unbindEvent(el, event, listener);
  };
  bindEvent(el, event, listener);
};

''.trim || (String.prototype.trim = function(){ return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,''); });

var hasClass = function(el, cls) {
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
};

var addClass = function(el, cls) {
  var classes = cls.split(' ');
  var curClass = el.className;

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
};

var removeClass = function(el, cls) {
  if (!cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = curClass.trim();
  }
};

module.exports = {
  getStyle: getStyle,
  setStyle: setStyle,
  hasClass: hasClass,
  addClass: addClass,
  camelCase: camelCase,
  removeClass: removeClass,
  bindEvent: bindEvent,
  unbindEvent: unbindEvent,
  bindOnce: bindOnce,
  positionElement: positionElement,
  isElementOutside: isElementOutside
};
},{}],4:[function(require,module,exports){
var domUtil = require('./dom-util');

var getModal = function() {
  var modalDom = ModalManager.modalDom;
  if (!modalDom) {
    modalDom = document.createElement('div');
    ModalManager.modalDom = modalDom;

    domUtil.bindEvent(modalDom, 'click', function() {
      ModalManager.doOnClick && ModalManager.doOnClick();
    });
  }

  return modalDom;
};

var ModalManager = {
  stack: [],
  doOnClick: function() {
  },
  show: function(id, zIndex) {
    if (!id || zIndex === undefined) return;

    var modalDom = getModal();

    var style = {
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      opacity: '0.5',
      background: '#000'
    };

    domUtil.setStyle(modalDom, style);

    if (!modalDom.parentNode || modalDom.parentNode.nodeType === 11)
      document.body.appendChild(modalDom);

    if (zIndex) {
      modalDom.style.zIndex = zIndex;
    }
    modalDom.style.display = '';

    this.stack.push({ id: id, zIndex: zIndex });
  },
  hide: function(id) {
    var stack = this.stack;
    var modalDom = getModal();

    if (stack.length > 0) {
      var topItem = stack[stack.length - 1];
      if (topItem.id === id) {
        stack.pop();
        if (stack.length > 0) {
          modalDom.style.zIndex = stack[stack.length - 1].zIndex;
        }
      } else {
        for (var i = stack.length - 1; i >= 0; i--) {
          if (stack[i].id === id) {
            stack.splice(i, 1);
            break;
          }
        }
      }
    }

    if (stack.length === 0) {
      modalDom.style.display = 'none';

      modalDom.parentNode.removeChild(modalDom);
    }
  }
};

module.exports = ModalManager;
},{"./dom-util":3}],5:[function(require,module,exports){
var domUtil = require('./dom-util');
var bindEvent = domUtil.bindEvent;
var unbindEvent = domUtil.unbindEvent;

var Popup = require('./popup');

var Popover = Popup.extend({
  defaults: {
    trigger: 'mouseenter',

    //not implement yet
    followMouse: false
  },
  constructor: function() {
    Popup.apply(this, arguments);
    var target = this.options.target;

    if (target !== null) {
      this.bindTarget();
    }
  },
  destroy: function() {
    var target = this.options.target;
    if (target) {
      this.unbindTarget();
    }
    Popup.prototype.destroy.apply(this, arguments);
  },
  bindTarget: function() {
    var popover = this;
    var target = popover.get('target');
    if (!target) return;

    var trigger = popover.get('trigger');

    if (trigger === 'click') {
      var toggle = function() {
        if (popover.visible) {
          popover.hide();
        } else {
          popover.show();
        }
      };
      popover.toggleListener = toggle;

      bindEvent(target, 'click', toggle);
    } else {
      var show = function () {
        popover.show();
      };
      var hide = function () {
        popover.hide();
      };
      popover.showListener = show;
      popover.hideListener = hide;

      if (trigger === 'mouseenter') {
        bindEvent(target, 'mouseenter', show);
        bindEvent(target, 'mouseleave', hide);
      } else if (trigger === 'focus') {
        bindEvent(target, 'focus', show);
        bindEvent(target, 'blur', hide);
      }
    }
  },
  unbindTarget: function() {
    var popover = this;
    var target = popover.get('target');
    if (!target) return;

    var trigger = popover.get('trigger');

    if (trigger === 'click') {
      var toggle = popover.toggleListener;
      if (toggle) {
        bindEvent(target, 'click', toggle);
      }
    } else {
      var show = popover.showListener;
      var hide = popover.hideListener;
      if (!show) return;

      if (trigger === 'mouseenter') {
        unbindEvent(target, 'mouseenter', show);
        unbindEvent(target, 'mouseleave', hide);
      } else if (trigger === 'focus') {
        unbindEvent(target, 'focus', show);
        unbindEvent(target, 'blur', hide);
      }
    }
  }
});

module.exports = Popover;
},{"./dom-util":3,"./popup":6}],6:[function(require,module,exports){
var domUtil = require('./dom-util');
var positionElement = domUtil.positionElement;
var isElementOutside = domUtil.isElementOutside;

var transition = require('./transition');

var extend = function(dst) {
  for (var i = 1, j = arguments.length; i < j; i++) {
    var src = arguments[i];
    for (var prop in src) {
      if (src.hasOwnProperty(prop)) {
        var value = src[prop];
        if (value !== undefined) {
          dst[prop] = value;
        }
      }
    }
  }

  return dst;
};

var modalManager = require('./modal-manager');

var seed = 1;

var Popup = function (options) {
  options = options || {};
  this.options = extend({}, this.defaults, options);

  //inside use only
  this.$id = '$popup_' + seed++;

  Popup.register(this.$id, this);

  this.shouldRefreshOnVisible = false;
  this.visible = false;
  this.showTimer = null;
  this.hideTimer = null;
};

var instances = {};

Popup.getInstance = function(id) {
  return instances[id];
};

Popup.register = function(id, instance) {
  if (id && instance) {
    instances[id] = instance;
  }
};

Popup.unregister = function(id) {
  if (id) {
    instances[id] = null;
    delete instances[id];
  }
};

var getExtendFn = function(parentClass) {
  return function(options) {
    var subClass;
    if (options.hasOwnProperty('constructor')) {
      subClass = options.constructor;

      delete options.constructor;
    } else {
      subClass = function() {
        parentClass.apply(this, arguments);
      };
    }

    subClass.prototype = new parentClass();
    subClass.constructor = subClass;
    subClass.extend = getExtendFn(subClass);

    var defaults = options.defaults || {};
    subClass.prototype.defaults = extend({}, parentClass.prototype.defaults, defaults);
    delete options.defaults;

    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        subClass.prototype[prop] = options[prop];
      }
    }

    return subClass;
  }
};

Popup.extend = getExtendFn(Popup);

var animations = {};

Popup.registerAnimation = function(name, config) {
  animations[name] = config;
};

Popup.getAnimation = function(name) {
  return animations[name];
};

Popup.zIndex = 1000;

Popup.nextZIndex = function() {
  return Popup.zIndex++;
};

var supportAnimations = require('./animation');

for (var prop in supportAnimations) {
  if (supportAnimations.hasOwnProperty(prop)) {
    Popup.registerAnimation(prop, supportAnimations[prop]);
  }
}

var PLACEMENT_REVERSE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
var ALIGNMENT_REVERSE = { start: 'end', end: 'start', center: 'center' };

Popup.prototype = {
  defaults: {
    showDelay: 0,
    hideDelay: 0,

    placement: 'top',
    alignment: 'center',

    attachToBody: false,
    detachAfterHide: true,

    target: null,

    adjustLeft: 0,
    adjustTop: 0,

    animation: false,
    showAnimation: undefined,
    hideAnimation: undefined,

    modal: false,
    zIndex: null,

    hideOnPressEscape: false,
    hideOnClickModal: false,

    viewport: 'window',
    updatePositionOnResize: false

    // Not Implement:
    //updatePositionOnScroll: false
  },
  set: function(prop, value) {
    if (prop !== null && typeof prop === 'object') {
      var props = prop;
      for (var p in props) {
        if (props.hasOwnProperty(p)) {
          this.set(p, props[p]);
        }
      }
    } else if (typeof prop === 'string') {
      this.options[prop] = value;
    }
    if (this.dom) {
      if (this.visible) {
        this.refresh();
      } else {
        this.shouldRefreshOnVisible = true;
      }
    }
  },
  get: function(prop) {
    return this.options[prop];
  },
  render: function() {
    return document.createElement('div');
  },
  refresh: function() {
  },
  destroy: function() {
    var dom = this.dom;
    if (dom && dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
    this.dom = null;
    this.options = null;
    Popup.unregister(this.$id);
    this.$id = null;
  },
  locate: function() {
    var popup = this;
    var dom = popup.dom;
    var target = popup.get('target');
    var adjustTop = popup.get('adjustTop') || 0;
    var adjustLeft = popup.get('adjustLeft') || 0;
    var afterLocateArgs = {};

    if (target && target.nodeType) {
      var placement = popup.get('placement');
      var alignment = popup.get('alignment') || 'center';

      var positionCache = {};

      var tryLocate = function(placement, alignment, adjustLeft, adjustTop) {
        var key = placement + ',' + alignment;
        var position = positionCache[key];

        if (!position) {
          position = positionElement(dom, target, placement, alignment);
          positionCache[key] = position;
        }

        dom.style.left = position.left + adjustLeft + 'px';
        dom.style.top = position.top + adjustTop + 'px';
      };

      tryLocate(placement, alignment, adjustLeft, adjustTop);

      var outside = isElementOutside(dom);
      var finalPlacement = placement;
      var finalAlignment = alignment;

      if (outside !== 'none') {
        var needReversePlacement = false;
        var needReverseAlignment = false;
        var reverseAdjustLeft = false;
        var reverseAdjustTop = false;

        if (outside === 'left') {
          if (placement === 'left' || placement === 'right') {
            needReversePlacement = true;
            reverseAdjustLeft = true;
          } else {
            needReverseAlignment = true;
            reverseAdjustTop = true;
          }
        } else if (outside === 'top') {
          if (placement === 'top' || placement === 'bottom') {
            needReversePlacement = true;
            reverseAdjustTop = true;
          } else {
            needReverseAlignment = true;
            reverseAdjustLeft = true;
          }
        }

        if (outside === 'both') {
          needReversePlacement = true;
          needReverseAlignment = true;
          reverseAdjustTop = true;
          reverseAdjustLeft = true;
        }

        if (needReversePlacement) {
          var reversedPlacement = PLACEMENT_REVERSE[placement];
          tryLocate(reversedPlacement, alignment, reverseAdjustLeft ? -adjustLeft : adjustLeft, reverseAdjustTop ? -adjustTop : adjustTop);
          outside = isElementOutside(dom);

          if ((placement === 'left' || placement === 'right') && outside !== 'left') {
            finalPlacement = reversedPlacement;
          } else if ((placement === 'top' || placement === 'bottom') && outside !== 'top') {
            finalPlacement = reversedPlacement;
          }
        }

        if (needReverseAlignment && outside !== 'none') {
          var reversedAlignment = ALIGNMENT_REVERSE[alignment];
          tryLocate(finalPlacement, reversedAlignment, reverseAdjustLeft ? -adjustLeft : adjustLeft, reverseAdjustTop ? -adjustTop : adjustTop);
          outside = isElementOutside(dom);

          if (outside !== 'none') {
            tryLocate(finalPlacement, alignment, reverseAdjustLeft ? -adjustLeft : adjustLeft, reverseAdjustTop ? -adjustTop : adjustTop);
          } else {
            finalAlignment = reversedAlignment;
          }
        }
      }

      afterLocateArgs = {
        placement: finalPlacement,
        alignment: finalAlignment,
        isOutside: outside !== 'none'
      };
    } else if (target instanceof Array && target.length === 2) {
      dom.style.left = target[0] + adjustLeft + 'px';
      dom.style.top = target[1] + adjustTop + 'px';
    } else if (target && target.target) {
      dom.style.left = target.pageX + adjustLeft + 'px';
      dom.style.top = target.pageY + adjustTop + 'px';
    } else if (target === 'center') {
      var selfWidth = dom.offsetWidth;
      var selfHeight = dom.offsetHeight;

      var windowWidth = window.innerWidth || document.documentElement.clientWidth;
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;

      var scrollTop = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);

      if (domUtil.getStyle(dom, 'position') === 'fixed') {
        scrollTop = 0;
      }

      dom.style.left = (windowWidth - selfWidth) / 2 + adjustLeft + 'px';
      dom.style.top = Math.max((windowHeight - selfHeight) / 2 + scrollTop + adjustTop, 0) + 'px';
    }
    popup.afterLocate(afterLocateArgs);
  },
  afterLocate: function() {
  },
  willShow: function() {
    return true;
  },
  show: function() {
    var popup = this;

    if (!popup.willShow()) return;

    if (popup.hideTimer) {
      clearTimeout(popup.hideTimer);
      popup.hideTimer = null;
    }

    if (popup.visible) return;

    if (popup.showTimer) {
      clearTimeout(popup.showTimer);
      popup.showTimer = null;
    }

    var showDelay = popup.get('showDelay');

    if (Number(showDelay) > 0) {
      popup.showTimer = setTimeout(function() {
        popup.showTimer = null;
        popup.doShow();
      }, showDelay);
    } else {
      popup.doShow();
    }
  },
  doShow: function() {
    var popup = this;

    popup.visible = true;

    var dom = popup.dom;

    function attach() {
      if (popup.get('attachToBody')) {
        document.body.appendChild(dom);
      } else {
        var target = popup.get('target');
        if (target && target.nodeType && target.nodeName !== 'BODY') {
          target.parentNode.appendChild(dom);
        } else {
          document.body.appendChild(dom);
        }
      }
    }

    var modal = this.get('modal');
    if (modal) {
      modalManager.show(popup.$id, Popup.nextZIndex());
    }

    if (!dom) {
      popup.dom = dom = popup.render();
      attach();
      popup.refresh();
    } else if (!dom.parentNode || dom.parentNode.nodeType === 11) { //detached element's parentNode is a DocumentFragment in IE8
      attach();

      if (popup.shouldRefreshOnVisible) {
        popup.refresh();
        popup.shouldRefreshOnVisible = false;
      }
    }

    dom.style.display = '';

    dom.style.visibility = 'hidden';
    dom.style.display = '';

    if (domUtil.getStyle(dom, 'position') === 'static') {
      domUtil.setStyle(dom, 'position', 'absolute');
    }

    popup.locate();

    var zIndex = this.get('zIndex');
    if (modal) {
      dom.style.zIndex = Popup.nextZIndex();
    } else if (zIndex) {
      dom.style.zIndex = zIndex;
    }

    var animation = popup.get('animation');
    var showAnimation = popup.get('showAnimation');
    if (showAnimation === undefined) {
      showAnimation = animation;
    }
    if (transition.support && showAnimation !== false) {
      var config = Popup.getAnimation(showAnimation);
      if (config.show) {
        config.show.apply(null, [popup]);
      }
    }

    dom.style.visibility = '';
  },
  willHide: function() {
    return true;
  },
  hide: function() {
    var popup = this;

    if (!popup.willHide()) return;

    if (popup.showTimer !== null) {
      clearTimeout(popup.showTimer);
      popup.showTimer = null;
    }

    if (!popup.visible) return;

    if (popup.hideTimer) {
      clearTimeout(popup.hideTimer);
      popup.hideTimer = null;
    }

    var hideDelay = popup.get('hideDelay');

    if (Number(hideDelay) > 0) {
      popup.hideTimer = setTimeout(function() {
        popup.hideTimer = null;
        popup.doHide();
      }, hideDelay);
    } else {
      popup.doHide();
    }
  },
  doHide: function() {
    var popup = this;

    popup.visible = false;

    var dom = popup.dom;
    if (dom) {

      var animation = popup.get('animation');
      var hideAnimation = popup.get('hideAnimation');
      if (hideAnimation === undefined) {
        hideAnimation = animation;
      }
      if (transition.support && hideAnimation !== false) {
        var config = Popup.getAnimation(hideAnimation);
        if (config.hide) {
          config.hide.apply(null, [popup]);
        }
      } else {
        popup.afterHide();
      }
    }
  },
  afterHide: function() {
    var dom = this.dom;
    dom.style.display = 'none';
    dom.style.left = '';
    dom.style.top = '';

    if (this.get('modal')) {
      modalManager.hide(this.$id);
    }

    if (this.get('detachAfterHide')) {
      dom.parentNode && dom.parentNode.removeChild(dom);
    }
  }
};

Popup.prototype.constructor = Popup;

domUtil.bindEvent(window, 'keydown', function(event) {
  if (event.keyCode === 27) { // ESC
    if (modalManager.stack.length > 0) {
      var topId = modalManager.stack[modalManager.stack.length - 1].id;
      var instance = Popup.getInstance(topId);
      if (instance.get('hideOnPressEscape')) {
        instance.hide();
      }
    }
  }
});

domUtil.bindEvent(window, 'resize', function() {
  for (var id in instances) {
    if (instances.hasOwnProperty(id)) {
      var instance = Popup.getInstance(id);
      if (instance.visible && instance.get('updatePositionOnResize')) {
        instance.locate();
      }
    }
  }
});

modalManager.doOnClick = function() {
  var topId = modalManager.stack[modalManager.stack.length - 1].id;
  var instance = Popup.getInstance(topId);
  if (instance.get('hideOnClickModal')) {
    instance.hide();
  }
};

module.exports = Popup;
},{"./animation":2,"./dom-util":3,"./modal-manager":4,"./transition":7}],7:[function(require,module,exports){
var prefixMap = {
  'MozTransition': {
    prefix: '-moz-',
    event: 'transitionend'
  },
  'oTransition': {
    prefix:'-o-',
    event: 'oTransitionEnd'
  },
  'webkitTransition': {
    prefix: '-webkit-',
    event: 'webkitTransitionEnd'
  }
};

var testEl = document.body ? document.body : document.createElement('div');

var result;

for (var prop in prefixMap) {
  if (prefixMap.hasOwnProperty(prop)) {
    if (prop in testEl.style) {
      result = prefixMap[prop];

      break;
    }
  }
}

if (result === undefined) {
  result = {
    support: false
  }
} else {
  result.support = true;
}

module.exports = result;
},{}]},{},[1]);
