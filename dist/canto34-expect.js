/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/canto34-expect.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/canto34-expect.js":
/*!*******************************!*\
  !*** ./src/canto34-expect.js ***!
  \*******************************/
/*! exports provided: expectMatchers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"expectMatchers\", function() { return expectMatchers; });\nvar pass = function pass(_message) {\n  return {\n    message: function message() {\n      return _message;\n    },\n    pass: true\n  };\n};\n\nvar fail = function fail(_message2) {\n  return {\n    message: function message() {\n      return _message2;\n    },\n    pass: false\n  };\n};\n\nvar expectMatchers = {\n  toHaveTokenTypes: function toHaveTokenTypes(actual, expected) {\n    var actualLength = actual.length;\n    var expectedLength = expected.length;\n\n    if (actualLength !== expectedLength) {\n      return fail(\"Expected \".concat(expectedLength, \" tokens but found \").concat(actualLength));\n    }\n\n    for (var i = 0; i < actualLength; i++) {\n      var actualType = actual[i].type;\n      var expectedType = expected[i];\n\n      if (actualType !== expectedType) {\n        return fail(\"Expected token type '\".concat(expectedType, \"' but found '\").concat(actualType, \"' at index \").concat(i));\n      }\n    }\n\n    return pass(\"\");\n  },\n  toHaveTokenContent: function toHaveTokenContent(actual, expected) {\n    var msg = \"\";\n    var actualLength = actual.length;\n    var expectedLength = expected.length;\n\n    if (actualLength !== expectedLength) {\n      return fail(\"Expected \".concat(expectedLength, \" tokens but found \").concat(actualLength));\n    }\n\n    for (var i = 0; i < actualLength; i++) {\n      var actualContent = actual[i].content;\n      var expectedContent = expected[i];\n\n      if (actualContent !== expectedContent) {\n        return fail(\"Expected token content '\".concat(expectedContent, \"' but found '\").concat(actualContent, \"' at index\").concat(i));\n      }\n    }\n\n    return pass(\"\");\n  },\n  toBeAt: function toBeAt(actual, line, character) {\n    var actualLine = actual.line;\n    var actualCharacter = actual.character;\n\n    if (actualLine !== line) {\n      return fail(\"Expected line to be \".concat(line, \" but it was \").concat(actualLine));\n    }\n\n    if (actualCharacter !== character) {\n      fail(\"Expected character to be \".concat(character, \"  but it was \").concat(actualCharacter));\n    }\n\n    return pass(\"\");\n  }\n};\n\n\n//# sourceURL=webpack:///./src/canto34-expect.js?");

/***/ })

/******/ });