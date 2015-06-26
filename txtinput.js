/*!
 * txtinput.js - A cross-browser input event module
 * https://github.com/Alex1990/txtinput
 * Under the MIT License | (c) 2015 Alex Chao
 */

!(function(global, factory) {

  // Uses CommonJS, AMD or browser global to create a jQuery plugin.
  // See: https://github.com/umdjs/umd
  if (typeof define === 'function' && define.amd) {
    // Expose this plugin as an AMD module. Register an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS module
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(global.jQuery, global);
  }

}(this, function($, global) {

  var isIE = /msie|trident/i.test(navigator.userAgent);
  var isIE9 = document.documentMode && document.documentMode === 9;

  var isEventSupported = function(eventName, nodeName) {
    var elem = document.createElement(nodeName);
    eventName = 'on' + eventName;
    var isSupported = eventName in elem;
    if (!isSupported) {
      elem.setAttribute(eventName, 'return;');
      isSupported = typeof elem[eventName] === 'function';
    }
    elem = null;
    return isSupported;
  };

  var inputSupported = {
    input: isEventSupported('input', 'input'),
    textarea: isEventSupported('input', 'textarea')
  };

  var addEvent = function(elem, type, listener) {
    if (elem.addEventListener) {
      elem.addEventListener(type, listener, false);
    } else if (elem.attachEvent) {
      var wrapper = function(e) {
        e = e || window.event;
        e.target = e.srcElement;
        listener.call(elem, e);
      };
      listener._listener = wrapper;
      elem.attachEvent('on' + type, wrapper);
    }
  };

  var removeEvent = function(elem, type, listener) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, listener, false);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + type, listener._listener || listener);
    }
  };

  function txtinput(elem, listener) {
    var isInputSupported = inputSupported[elem.tagName.toLowerCase()] ||
                          elem.contenteditable === 'true';
    var lastValue = elem.value;

    if (isInputSupported && !isIE9) {
      addEvent(elem, 'input', listener);
    } else {

      var inputListener = function(e) {
        if (elem.value !== lastValue) {
          lastValue =  elem.value;
          listener.call(elem, e);
        }
      };

      if (isIE) {
        var propertychangeListener = function(e) {
          if (e.propertyName === 'value') {
            inputListener.call(elem, e);
          }
        };

        addEvent(elem, 'propertychange', propertychangeListener);
      }

      if (isIE9) {
        var focusListener = function(e) {
          if (e.type === 'focus') {
            addEvent(document, 'selectionchange', inputListener);
          } else {
            removeEvent(document, 'selectionchange', inputListener);
          }
        };

        addEvent(elem, 'focus', focusListener);
        addEvent(elem, 'blur', focusListener);
      }

      var nextTickInputListener = function(e) {
        var that = this;
        setTimeout(function() {
          inputListener.call(that, e);
        }, 0);
      };

      addEvent(elem, 'keydown', nextTickInputListener);
      addEvent(elem, 'cut', nextTickInputListener);
      addEvent(elem, 'paste', nextTickInputListener);
    }

    var lastUnbindInput = elem._unbindInput;

    elem._unbindInput = function() {

      lastUnbindInput && lastUnbindInput.call(elem);

      if (isInputSupported && !isIE9) {
        removeEvent(elem, 'input', listener);
      } else {

        if (isIE) {
          removeEvent(elem, 'propertychange', propertychangeListener);
        }

        if (isIE9) {
          removeEvent(document, 'selectionchange', inputListener);
          removeEvent(elem, 'focus', focusListener);
          removeEvent(elem, 'blur', focusListener);
        }

        removeEvent(elem, 'keydown', nextTickInputListener);
        removeEvent(elem, 'cut', nextTickInputListener);
        removeEvent(elem, 'paste', nextTickInputListener);
      }
    };
  }

  if ($ && $.fn) {
    $.fn.txtinput = function(listener) {
      return this.each(function() {
        txtinput(this, listener);
      });
    };
  } else if (global) {
    global.txtinput = txtinput;
  }

  return txtinput;

}));
