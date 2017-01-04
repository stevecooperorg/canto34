(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports", "./canto34"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./canto34"));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.canto34);
		global.example = mod.exports;
	}
})(this, function (exports, _canto) {
	"use strict";

	var canto34 = _interopRequireWildcard(_canto);

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

	var lexer = new canto34.Lexer();

	// add a token for whitespace
	lexer.addTokenType({
		name: "ws", // give it a name
		regexp: /[ \t]+/, // match spaces and tabs
		ignore: true // don't return this token in the result
	});

	// add a token type for names, defines as strings of lower-case characters
	lexer.addTokenType({ name: "name", regexp: /^[a-z]+/, role: ['entity', 'name'] });

	// bring in some predefined types for commas, period, and integers.
	var types = canto34.StandardTokenTypes;
	lexer.addTokenType(types.comma());
	lexer.addTokenType(types.period());
	lexer.addTokenType(types.integer());

	var parser = new canto34.Parser();
	parser.listOfNameValuePairs = function () {
		this.result = [];
		this.nameValuePair();
		while (!this.eof() && this.la1("comma")) {
			this.match("comma");
			this.nameValuePair();
		}
		this.match("period");
	};

	parser.nameValuePair = function () {
		var name = this.match("name").content;
		var value = this.match("integer").content;
		this.result.push({ name: name, value: value });
	};

	exports.lexer = lexer;
	exports.parser = parser;
});