# txtinput

A cross browser input event module. It also can be supported as a CommonJS/AMD module.

## Usage

This module will expose an method named `txtinput` on the global object. Then, you can use it to bind a cross-browser input event listener on an `input` or `textarea` element. 

**For example:**

```js
var keyword = document.getElementById('keyword');

txtinput(keyword, function(event) {
  console.log('An input event is triggered.');
  console.log(event);
});
```

The native event object `event` will be passed as the first argument of the listener. The native event object is the `input` event object in IE10+ and other modern browsers, and may be the one of the `propertychange`, `selectionchange`, `keydown`, `paste` or `drop` event objects in IE6-9.

A method `_unbindTxtinput` will be as the property of the `keyword` element, which is executed to unbind the input event listener(s) from the `keyword` element.

```js
keyword._unbindTxtinput();
```

## Packages

**NPM:**

```bash
npm install txtinput
```

## Compatibility

IE6-11, Chrome, Firefox, Safari and Opera.

You can check the `example/behavior-test.html` file for the test details. If you came across a bug or any other problem, opening an issue is welcome.

## License

MIT
