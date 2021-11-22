// Polyfill for IE11
import "whatwg-fetch";

// Dummy call to make it work with a Polyfill in IE11
Promise.resolve();

// This polyfill adds compatibility to all browsers supporting ES5
// https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

import "./index";
