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

  // Shadow copy
  var copyObj = function(to, from) {
    for (var p in from) {
      // Do not use `hasOwnProperty`. Because of the property of the event object 
      // [object MSEventObj], it will return false in IE 9.
      to[p] = from[p];
    }
    return to;
  };

  // A shortcut for attachEvent.
  var addEvent = function(elem, type, listener) {
    elem[type + listener] = function(e) {
      e = e || window.event;
      e.target = e.srcElement;
      listener.call(elem, e);
    };
    elem.attachEvent('on' + type, elem[type + listener]);
  };

  // A shourtcut for detachEvent.
  var removeEvent = function(elem, type, listener) {
    elem.detachEvent('on' + type, elem[type + listener]);
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
      elem.addEventListener('input', listener, false);
    } else {

      var inputListener = function(e) {
        if (elem.value !== lastValue) {
          lastValue =  elem.value;
          if (e.target !== elem) {
            e.target = elem;
          }
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

      // When the `keydown`/`paste`/`drop` event is triggered, the content 
      // of the field hasn't been modified. In the next tick, the content 
      // is modified.
      var nextTickInputListener = function(e) {
        var that = this;
        var event = copyObj({}, e);
        setTimeout(function() {
          inputListener.call(that, event);
        }, 0);
      };

      // In IE6-9, the first input interaction may not trigger the `onpropertychange`
      // event on textarea.
      // In IE9, the ESC key may not trigger the `propertychange` or `selectionchange`
      // event.
      // The `keydown`/`paste`/`drop` event can fix the above bugs.
      addEvent(elem, 'keydown', nextTickInputListener);
      addEvent(elem, 'paste', nextTickInputListener);
      addEvent(elem, 'drop', nextTickInputListener);
    }

    var lastUnbindTxtinput = elem._unbindTxtinput;

    // Unbind the input event.
    elem._unbindTxtinput = function() {

      lastUnbindTxtinput && lastUnbindTxtinput.call(elem);

      if (isInputSupported && !isIE9) {
        elem.removeEventListener('input', listener);
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
        removeEvent(elem, 'paste', nextTickInputListener);
        removeEvent(elem, 'drop', nextTickInputListener);
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
