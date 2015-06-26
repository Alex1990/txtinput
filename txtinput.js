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
  var isIE9 = document.documentMode && (document.documentMode === 9);

  // Check if an event is supported on the node.
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

  // Cache if the input event is supported by `input` and `textarea` tag.
  var inputSupported = {
    input: isEventSupported('input', 'input'),
    textarea: isEventSupported('input', 'textarea')
  };

  // A cross browser wrapper to bind event listener.
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

  // A cross browser wrapper to unbind event listener.
  var removeEvent = function(elem, type, listener) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, listener, false);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + type, listener._listener || listener);
    }
  };

  // Bind the listener for input event on the `elem`.
  function txtinput(elem, listener) {
    var isInputSupported = inputSupported[elem.tagName.toLowerCase()] ||
                          elem.contenteditable === 'true';
    var lastValue = elem.value;

    // If the browser supports `input` event, the native `input` event will be used.
    //
    // In IE 9, propertychange/input fires for most input events but is buggy
    // and doesn't fire when text is deleted, but conveniently,
    // "selectionchange" appears to fire in all of the remaining cases so
    // we catch those.
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

      // When the `keydown`/`cut`/`paste` event is triggered, the content 
      // of the field hasn't been modified. In the next tick, the content 
      // is modified.
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

    var lastUnbindTxtinput = elem._unbindTxtinput;

    // Unbind the input event.
    elem._unbindTxtinput = function() {

      lastUnbindTxtinput && lastUnbindTxtinput.call(elem);

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

  // If the jQuery exists, the `txtinput` method will be exposed on the 
  // jQuery prototype. Otherwise, it will be exposed on the global object.
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
