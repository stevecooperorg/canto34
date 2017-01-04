(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'plist', './canto34'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('plist'), require('./canto34'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.plist, global.canto34);
		global.canto34Syntax = mod.exports;
	}
})(this, function (exports, _plist, _canto) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.tmLanguage = undefined;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var tmLanguage = function () {
		function tmLanguage() {
			_classCallCheck(this, tmLanguage);
		}

		_createClass(tmLanguage, null, [{
			key: 'generateTmLanguageDefinition',
			value: function generateTmLanguageDefinition(lexer) {
				var languageDef = {
					name: lexer.options.languageName,
					patterns: []
				};

				lexer.tokenTypes.forEach(function (tt) {

					// convert the regex back to a string; clean off leading and trailing slashes,
					// and leading ^ characters, which are meaningless.
					if (!tt.regexp) {
						throw "no regex for " + tt.name;
					}
					var regexPattern = tt.regexp.toString();
					regexPattern = regexPattern.substr(1, regexPattern.length - 2);
					if (regexPattern.indexOf("^") === 0) {
						regexPattern = regexPattern.substr(1);
					}

					// the name value represents the tmLanguage 'role', such as
					// 'keyword.control.mylanguage' for 'a keyword in my language'.
					// This is used in the colour schemes of text editors to give
					// tokens appropriate colours. Token types can supply these roles

					var nameParts;
					if (typeof tt.role === "string") {
						nameParts = [tt.role];
					} else {
						nameParts = tt.role || [];
					}

					nameParts.push(tt.name);

					if (lexer.options.languageName) {
						nameParts.push(lexer.options.languageName);
					}

					var noDups = [];
					for (var i = 0; i < nameParts.length; i++) {
						if (noDups.indexOf(nameParts[i]) === -1) {
							noDups.push(nameParts[i]);
						}
					}

					languageDef.patterns.push({
						match: regexPattern,
						name: noDups.join(".")
					});
				});

				var result = (0, _plist.build)(languageDef);

				return result;
			}
		}]);

		return tmLanguage;
	}();

	exports.tmLanguage = tmLanguage;
});