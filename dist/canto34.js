(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.canto34 = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

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

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var util = {
		lang: {
			isNullOrUndefined: function isNullOrUndefined(x) {
				if (typeof x === "undefined") {
					return true;
				}

				if (x === null) {
					return true;
				}

				return false;
			}
		},
		extend: function extend() {
			// conparable to jquery's extend
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
				}
			}return arguments[0];
		}
	};

	var PatternDefinitionException = function (_Error) {
		_inherits(PatternDefinitionException, _Error);

		function PatternDefinitionException(message) {
			_classCallCheck(this, PatternDefinitionException);

			return _possibleConstructorReturn(this, (PatternDefinitionException.__proto__ || Object.getPrototypeOf(PatternDefinitionException)).call(this, message));
		}

		return PatternDefinitionException;
	}(Error);

	var LexerException = function (_Error2) {
		_inherits(LexerException, _Error2);

		function LexerException(message) {
			_classCallCheck(this, LexerException);

			return _possibleConstructorReturn(this, (LexerException.__proto__ || Object.getPrototypeOf(LexerException)).call(this, message));
		}

		return LexerException;
	}(Error);

	var ParserException = function (_Error3) {
		_inherits(ParserException, _Error3);

		function ParserException(message) {
			_classCallCheck(this, ParserException);

			return _possibleConstructorReturn(this, (ParserException.__proto__ || Object.getPrototypeOf(ParserException)).call(this, message));
		}

		return ParserException;
	}(Error);

	var Lexer = function () {
		function Lexer(options) {
			_classCallCheck(this, Lexer);

			var defaults = {
				languageName: "unnamedlanguage"
			};
			this.options = util.extend({}, defaults, options);
			this.tokenTypes = [];
		}

		_createClass(Lexer, [{
			key: "addTokenType",
			value: function addTokenType(tokenType) {

				if (!tokenType.name) {
					throw new PatternDefinitionException("Token types must have a 'name' property");
				}

				// FOR CONSIDERATION: for some tokens, the full 'consume' is required for correct interpretation
				// (eg, JSON strings with escaped character) but a regex will do for syntax highlighting. In this
				// situation, both are allowed but consume is used for lexing and regexp is used for language definition.
				// if (tokenType.regexp && tokenType.consume) {
				// 	throw new canto34.PatternDefinitionException("Token types cannot have both a 'regexp' pattern and 'consume' function.");
				// }

				if (!tokenType.regexp && !tokenType.consume) {
					throw new PatternDefinitionException("Token types must have a 'regexp' property or a 'consume' function");
				}

				if (tokenType.regexp && !(tokenType.regexp instanceof RegExp)) {
					throw new PatternDefinitionException("Token types 'regexp' property must be an instance of RegExp");
				}

				if (tokenType.consume && typeof tokenType.consume !== "function") {
					throw new PatternDefinitionException("Token types 'consume' property must be a function");
				}

				if (tokenType.interpret && typeof tokenType.interpret !== "function") {
					throw new PatternDefinitionException("Token types 'interpret' property must be a function");
				}
				this.tokenTypes.push(tokenType);
			}
		}, {
			key: "tokenize",
			value: function tokenize(content) {
				if (content === undefined) {
					throw new LexerException("No content provided");
				}

				if (this.tokenTypes.length === 0) {
					throw new LexerException("No token types defined");
				}

				var result = [];
				var consumed;
				var remaining = content;
				var tracker = new LineTracker();
				var tokenTypeLength = this.tokenTypes.length;
				var consumeResult;

				while (remaining.length > 0) {
					var somethingFoundThisPass = false;

					for (var i = 0; i < tokenTypeLength; i++) {
						var tokenType = this.tokenTypes[i];

						consumeResult = undefined;
						if (tokenType.consume) {
							// must have a consume function;
							consumeResult = tokenType.consume(remaining);
							// should have told us what it consumed;
							if (consumeResult.success) {
								if (remaining.indexOf(consumeResult.consumed) !== 0) {
									throw new LexerException("The consume function for " + tokenType.name + " failed to return the start of the remaining content at " + tracker.line + "." + tracker.character + " and instead returned " + consumeResult.consumed);
								} else {
									somethingFoundThisPass = true;
									consumed = consumeResult.consumed;
								}
							} else {
								continue;
							}
						} else {
							var match = tokenType.regexp.exec(remaining);
							if (match) {
								// we found a token! great. What did it say? We only
								// want to match at the start of the string
								if (match.index === 0) {
									somethingFoundThisPass = true;
									consumed = match[0];
								} else {
									continue;
								}
							} else {
								continue;
							}
						}

						//handle our new token
						if (tokenType.interpret) {
							content = tokenType.interpret(consumed);
						} else if (consumeResult && !util.lang.isNullOrUndefined(consumeResult.content)) {
							content = consumeResult.content;
						} else {
							content = consumed;
						}

						var token = {
							content: content,
							type: tokenType.name,
							line: tracker.line,
							character: tracker.character
						};

						if (!tokenType.ignore) {
							result.push(token);
						}

						remaining = remaining.substring(consumed.length);
						tracker.consume(consumed);
					}

					if (!somethingFoundThisPass) {
						var userPartOfString = remaining.substring(0, 15);
						var visibleUserPartOfString = userPartOfString.replace("\r", "\\r").replace("\t", "\\t").replace("\n", "\\n");
						throw new LexerException("No viable alternative at " + tracker.line + "." + tracker.character + ": '" + visibleUserPartOfString + "...'");
					}
				}

				return result;
			}
		}]);

		return Lexer;
	}();

	function escapeRegExp(string) {
		return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
	}

	var StandardTokenTypes = function () {
		function StandardTokenTypes() {
			_classCallCheck(this, StandardTokenTypes);
		}

		_createClass(StandardTokenTypes, null, [{
			key: "constant",
			value: function constant(literal, name, role) {
				role = role || ["keyword"];
				return {
					name: name,
					regexp: new RegExp("^" + escapeRegExp(literal)),
					role: role
				};
			}
		}, {
			key: "floatingPoint",
			value: function floatingPoint() {
				return {
					name: "floating point",
					regexp: /(^-?\d*\.\d+)/,
					role: ["constant", "numeric"],
					interpret: function interpret(content) {
						return parseFloat(content);
					}
				};
			}
		}, {
			key: "integer",
			value: function integer() {
				return {
					name: "integer",
					regexp: /^-?\d+/,
					role: ["constant", "numeric"],
					interpret: function interpret(content) {
						return parseInt(content);
					}
				};
			}
		}, {
			key: "whitespace",
			value: function whitespace() {
				return {
					name: "whitespace",
					ignore: true,
					regexp: /^[ \t]+/
				};
			}
		}, {
			key: "whitespaceWithNewlines",
			value: function whitespaceWithNewlines() {
				return {
					name: "whitespace",
					ignore: true,
					regexp: /^[ \t\r\n]+/
				};
			}
		}, {
			key: "real",
			value: function real() {
				return {
					name: "real number",
					regexp: /^X/,
					role: ["constant", "numeric"]
				};
			}
		}, {
			key: "comma",
			value: function comma() {
				return this.constant(",", "comma", ["punctuation"]);
			}
		}, {
			key: "period",
			value: function period() {
				return this.constant(".", "period", ["punctuation"]);
			}
		}, {
			key: "star",
			value: function star() {
				return this.constant("*", "star", ["punctuation"]);
			}
		}, {
			key: "colon",
			value: function colon() {
				return this.constant(":", "colon", ["punctuation"]);
			}
		}, {
			key: "openParen",
			value: function openParen() {
				return this.constant("(", "open paren", ["punctuation"]);
			}
		}, {
			key: "closeParen",
			value: function closeParen() {
				return this.constant(")", "close paren", ["punctuation"]);
			}
		}, {
			key: "openBracket",
			value: function openBracket() {
				return this.constant("{", "open bracket", ["punctuation"]);
			}
		}, {
			key: "closeBracket",
			value: function closeBracket() {
				return this.constant("}", "close bracket", ["punctuation"]);
			}
		}, {
			key: "openSquareBracket",
			value: function openSquareBracket() {
				return this.constant("[", "open square bracket", ["punctuation"]);
			}
		}, {
			key: "closeSquareBracket",
			value: function closeSquareBracket() {
				return this.constant("]", "close square bracket", ["punctuation"]);
			}
		}, {
			key: "JsonString",
			value: function JsonString() {
				return {
					name: "string",
					regexp: /"(?:[^"\\]|\\.)*"/,
					consume: function consume(remaining) {
						var fail = { success: false };
						if (remaining.indexOf('"') !== 0) {
							return fail;
						}

						var content = '';
						var pos = 1;
						var ch;
						var finished = false;
						do {
							ch = remaining[pos];
							pos += 1;

							switch (ch) {
								case '"':
									finished = true;
									break;
								case '\\':
									var ch2 = remaining[pos];
									pos += 1;
									switch (ch2) {
										case '"':
											return fail;
										case "t":
											content += "\t";break;
										case "r":
											content += "\r";break;
										case "n":
											content += "\n";break;
										case "u":
											var unicodeDigits = remaining.substr(pos, 4);
											if (unicodeDigits.length != 4 || !/\d{4}/.test(unicodeDigits)) {
												content += "\\u";
											} else {
												pos += 4;
												var codePoint = parseInt(unicodeDigits, 10);
												var codePointString = String.fromCharCode(codePoint);
												content += codePointString;
											}
											break;
										default:
											// something like \q, which doesn't mean anything
											return fail;
									}
									break;
								default:
									content += ch;
									break;
							}
						} while (!finished);

						var consumed = remaining.substring(0, pos);

						var successResult = {
							success: true,
							consumed: consumed,
							content: content
						};
						return successResult;
					}
				};
			}
		}]);

		return StandardTokenTypes;
	}();

	var Parser = function () {
		function Parser() {
			_classCallCheck(this, Parser);
		}

		_createClass(Parser, [{
			key: "initialize",
			value: function initialize(tokens) {
				if (!tokens) {
					throw new ParserException("No tokens provided to the parser");
				}

				if (!(tokens instanceof Array)) {
					throw new ParserException("A non-array was provided to the parser instead of a token array");
				}

				this.tokens = tokens;
			}
		}, {
			key: "la1",
			value: function la1(tokenType) {
				if (this.eof()) {
					throw new ParserException("No tokens available");
				}

				return this.tokens[0].type == tokenType;
			}
		}, {
			key: "match",
			value: function match(tokenType) {

				if (this.eof()) {
					throw new ParserException("Expected " + tokenType + " but found EOF");
				}

				if (!this.la1(tokenType)) {
					throw new ParserException("Expected " + tokenType + " but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
				}

				return this.tokens.shift();
			}
		}, {
			key: "eof",
			value: function eof() {
				return this.tokens.length === 0;
			}
		}, {
			key: "expectEof",
			value: function expectEof() {
				if (!this.eof()) {
					throw new ParserException("Expected EOF but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
				}
			}
		}]);

		return Parser;
	}();

	var LineTracker = function () {
		function LineTracker() {
			_classCallCheck(this, LineTracker);

			this.line = 1;
			this.character = 1;
			this.justSeenSlashR = false;
		}

		_createClass(LineTracker, [{
			key: "consume",
			value: function consume(content) {

				for (var i = 0, len = content.length; i < len; i++) {
					if (content[i] == "\r") {
						this.line += 1;
						this.character = 1;
						this.justSeenSlashR = true;
					} else if (content[i] == "\n") {
						if (!this.justSeenSlashR) {
							this.line += 1;
						}
						this.character = 1;
						this.justSeenSlashR = false;
					} else {
						this.character += 1;
						this.justSeenSlashR = false;
					}
				}
			}
		}]);

		return LineTracker;
	}();

	exports.PatternDefinitionException = PatternDefinitionException;
	exports.LexerException = LexerException;
	exports.ParserException = ParserException;
	exports.Lexer = Lexer;
	exports.StandardTokenTypes = StandardTokenTypes;
	exports.Parser = Parser;
	exports.LineTracker = LineTracker;
});