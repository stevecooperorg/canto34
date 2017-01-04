(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './canto34', 'expect'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./canto34'), require('expect'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.canto34, global.expect);
		global.canto34Expect = mod.exports;
	}
})(this, function (exports, _canto, _expect) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.expectMatchers = undefined;

	var expect = _interopRequireWildcard(_expect);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var expectMatchers = {
		toHaveTokenTypes: function toHaveTokenTypes(expected) {
			var actualLength = this.actual.length;
			var expectedLength = expected.length;

			expect.assert(actualLength === expectedLength, "Expected " + expectedLength + " tokens but found " + actualLength, this.actual);

			for (var i = 0; i < actualLength; i++) {
				var actualType = this.actual[i].type;
				var expectedType = expected[i];
				expect.assert(actualType === expectedType, "Expected token type '" + expectedType + "' but found '" + actualType + "' at index " + i, actualType);
			}

			return this;
		},
		toHaveTokenContent: function toHaveTokenContent(expected) {
			var msg = "";
			this.message = function () {
				return msg;
			};

			var actualLength = this.actual.length;
			var expectedLength = expected.length;

			expect.assert(actualLength === expectedLength, "Expected " + expectedLength + " tokens but found " + actualLength, actualLength);

			for (var i = 0; i < actualLength; i++) {
				var actualContent = this.actual[i].content;
				var expectedContent = expected[i];

				expect.assert(actualContent === expectedContent, "Expected token content '" + expectedContent + "' but found '" + actualContent + "' at index " + i, actualContent);
			}

			return true;
		},
		toBeAt: function toBeAt(line, character) {
			var actualLine = this.actual.line;
			var actualCharacter = this.actual.character;
			expect.assert(actualLine === line, "Expected line to be " + line + " but it was " + actualLine, actualLine);

			expect.assert(actualCharacter === character, "Expected character to be " + character + " but it was " + actualCharacter, actualCharacter);

			return this;
		}
	};

	exports.expectMatchers = expectMatchers;
});