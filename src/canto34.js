(function (define) {
	// define canto34 as a UMD module; http://know.cujojs.com/tutorials/modules/authoring-umd-modules

	// note: we're injecting all three CommonJS scoped variables
	define(function (require, exports, module) {
        "use strict";

        var canto34 = exports;

	    var util = {
	    	lang: {
	    		isNullOrUndefined: function(x) {
	    			if (typeof x === "undefined") {
	    				return true;
	    			}

	    			if (x === null) {
	    				return true;
	    			}

	    			return false;
	    		}
	    	},
			extend: function() {
				// conparable to jquery's extend
				for(var i=1; i<arguments.length; i++)
					for(var key in arguments[i])
						if(arguments[i].hasOwnProperty(key))
							arguments[0][key] = arguments[i][key];
				return arguments[0];
			}
	    }

	    /**
	        A *Lexer* takes a string and chops it into pieces. A Canto34 Lexer is a series of pattern objects, like

		    {
	             name: "integer",
	             regexp: "\d+",
	             ignore: true,
				 role: ["keyword"],
	             interpret: function(content) {
					return parseInt(content);
	             }
	         }
	    **/
		canto34.Lexer = function(options) {
			var defaults = {
				languageName: "unnamedlanguage"
			};
			this.options = util.extend({}, defaults, options);
			this.tokenTypes = [];
		};

	    canto34.PatternDefinitionException = function(message) {
	    	this.message = message;
	    }
	    canto34.PatternDefinitionException.prototype = Error.prototype;

	    canto34.LexerException = function(message) {
	    	this.message = message;
	    }
	    canto34.LexerException.prototype = Error.prototype;

	    canto34.ParserException = function(message) {
	    	this.message = message;
	    }
	    canto34.ParserException.prototype = Error.prototype;

		canto34.Lexer.prototype.addTokenType = function(tokenType) {

			if (!tokenType.name) {
				throw new canto34.PatternDefinitionException("Token types must have a 'name' property");
			}

			// FOR CONSIDERATION: for some tokens, the full 'consume' is required for correct interpretation
			// (eg, JSON strings with escaped character) but a regex will do for syntax highlighting. In this
			// situation, both are allowed but consume is used for lexing and regexp is used for language definition.
			// if (tokenType.regexp && tokenType.consume) {
			// 	throw new canto34.PatternDefinitionException("Token types cannot have both a 'regexp' pattern and 'consume' function.");
			// }

			if (!tokenType.regexp && !tokenType.consume) {
				throw new canto34.PatternDefinitionException("Token types must have a 'regexp' property or a 'consume' function");
			}

			if (tokenType.regexp && !(tokenType.regexp instanceof RegExp)) {
				throw new canto34.PatternDefinitionException("Token types 'regexp' property must be an instance of RegExp");
			}

			if(tokenType.consume && typeof tokenType.consume !== "function") {
				throw new canto34.PatternDefinitionException("Token types 'consume' property must be a function");
			}

			if(tokenType.interpret && typeof tokenType.interpret !== "function") {
				throw new canto34.PatternDefinitionException("Token types 'interpret' property must be a function");
			}
			this.tokenTypes.push(tokenType);
		};

		canto34.Lexer.prototype.tokenize = function(content) {
			if (content === undefined) {
				throw new canto34.LexerException("No content provided");
			}

			if (this.tokenTypes.length === 0) {
				throw new canto34.LexerException("No token types defined");
			}

			var result = [];
			var consumed;
			var remaining = content;
			var tracker = new canto34.LineTracker();
			var tokenTypeLength = this.tokenTypes.length;

			while(remaining.length > 0) {
				var somethingFoundThisPass = false;

				for (var i = 0; i < tokenTypeLength; i++) {
					var tokenType = this.tokenTypes[i];

					consumeResult = undefined;
					if (tokenType.consume) {
						// must have a consume function;
						var consumeResult = tokenType.consume(remaining);
						// should have told us what it consumed;
						if (consumeResult.success) {
							if (remaining.indexOf(consumeResult.consumed) !== 0) {
								throw new canto34.LexerException("The consume function for " + tokenType.name + " failed to return the start of the remaining content at " + tracker.line + "." + tracker.character + " and instead returned " + consumeResult.consumed);
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
					tracker.consume(consumed)

				}

				if (!somethingFoundThisPass) {
					var userPartOfString = remaining.substring(0, 15);
					var visibleUserPartOfString = userPartOfString.replace("\r", "\\r").replace("\t", "\\t").replace("\n", "\\n")
					throw new canto34.LexerException("No viable alternative at " + tracker.line + "." + tracker.character + ": '" + visibleUserPartOfString + "...'");
				}
			}

			return result;
		};

		canto34.StandardTokenTypes = {};

		function escapeRegExp(string){
		  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
		};

		canto34.StandardTokenTypes.constant = function(literal, name, role) {
			var role = role || ["keyword"];
			return {
				name: name,
				regexp: new RegExp("^" + escapeRegExp(literal)),
				role: role
			};
		}

		canto34.StandardTokenTypes.integer = function() {
			return {
				name: "integer",
				regexp: /^-?\d+/,
				role: ["constant", "numeric"],
				interpret: function(content) {
					return parseInt(content);
				}
			};
		};

		canto34.StandardTokenTypes.whitespace = function() {
			return {
				name: "whitespace",
				ignore: true,
				regexp: /^[ \t]+/
			};
		};

		canto34.StandardTokenTypes.whitespaceWithNewlines = function() {
			return {
				name: "whitespace",
				ignore: true,
				regexp: /^[ \t\r\n]+/
			};
		};

		canto34.StandardTokenTypes.real = function() {
			return {
				name: "real number",
				regexp: /^X/,
				role: ["constant", "numeric"]
			}
		}

		canto34.StandardTokenTypes.comma = function() {
			return canto34.StandardTokenTypes.constant(",", "comma", ["punctuation"]);
		};

		canto34.StandardTokenTypes.period = function() {
			return canto34.StandardTokenTypes.constant(".", "period", ["punctuation"]);
		};

		canto34.StandardTokenTypes.star = function() {
			return canto34.StandardTokenTypes.constant("*", "star", ["punctuation"]);
		};

		canto34.StandardTokenTypes.colon = function() {
			return canto34.StandardTokenTypes.constant(":", "colon", ["punctuation"]);
		};

		canto34.StandardTokenTypes.openParen = function() {
			return canto34.StandardTokenTypes.constant("(", "open paren", ["punctuation"]);
		};

		canto34.StandardTokenTypes.closeParen = function() {
			return canto34.StandardTokenTypes.constant(")", "close paren", ["punctuation"]);
		};

		canto34.StandardTokenTypes.openBracket = function() {
			return canto34.StandardTokenTypes.constant("{", "open bracket", ["punctuation"]);
		};

		canto34.StandardTokenTypes.closeBracket = function() {
			return canto34.StandardTokenTypes.constant("}", "close bracket", ["punctuation"]);
		};

		canto34.StandardTokenTypes.openSquareBracket = function() {
			return canto34.StandardTokenTypes.constant("[", "open square bracket", ["punctuation"]);
		};

		canto34.StandardTokenTypes.closeSquareBracket = function() {
			return canto34.StandardTokenTypes.constant("]", "close square bracket", ["punctuation"]);
		};

		canto34.StandardTokenTypes.JsonString = function() {
			return {
				name: "string",
				regexp: /"(?:[^"\\]|\\.)*"/,
				consume: function(remaining) {
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

						switch(ch)
						{
							case '"':
								finished = true;
								break;
							case '\\':
								var ch2 = remaining[pos];
								pos += 1;
								switch (ch2) {
									case '"': return fail;
									case "t": content += "\t"; break;
									case "r": content += "\r"; break;
									case "n": content += "\n"; break;
									case "u":
										var unicodeDigits = remaining.substr(pos, 4);
										if (unicodeDigits.length != 4 || !/\d{4}/.test(unicodeDigits)) {
											content += "\\u";
											break;
										} else {
											pos += 4;
											var codePoint = parseInt(unicodeDigits, 10);
											var codePointString = String.fromCharCode(codePoint);;
											content += codePointString;
											break;
										}
									default:
										// something like \q, which doesn't mean anything
										return fail;
								}
								break;
							default:
								content += ch;
								break;
						}
					} while(!finished)


					var consumed = remaining.substring(0, pos);

					var successResult = {
						success: true,
						consumed: consumed,
						content: content
					};
					//console.log(successResult);
					return successResult;
				}
			};
		};

		canto34.tmLanguage = {};

	    canto34.tmLanguage.generateTmLanguageDefinition = function(lexer) {
			// https://github.com/TooTallNate/plist.js
			var build = require('plist').build;
			var languageDef = {
				name: lexer.options.languageName,
				patterns: []
			};

			lexer.tokenTypes.forEach(tt => {

				// convert the regex back to a string; clean off leading and trailing slashes,
				// and leading ^ characters, which are meaningless.
				if (!tt.regexp) {
					throw "no regex for " + tt.name;
				}
				var regexPattern = tt.regexp.toString();
				regexPattern = regexPattern.substr(1, regexPattern.length - 2);
				if (regexPattern.indexOf("^") == 0) {
					regexPattern = regexPattern.substr(1);
				}

				// the name value represents the tmLanguage 'role', such as
				// 'keyword.control.mylanguage' for 'a keyword in my language'.
				// This is used in the colour schemes of text editors to give
				// tokens appropriate colours. Token types can supply these roles

				var nameParts;
				if (typeof(tt.role) === "String") {
					nameParts = [ tt.role ];
				} else {
					nameParts = tt.role || [];
				}

				nameParts.push(tt.name);

				if (lexer.options.languageName) {
					nameParts.push(lexer.options.languageName);
				}

				var noDups = [];
				for(var i = 0; i < nameParts.length; i++) {
					if (noDups.indexOf(nameParts[i]) === -1) {
						noDups.push(nameParts[i]);
					}
				}

				languageDef.patterns.push({
					match: regexPattern,
					name:  noDups.join(".")
				});
			});

			var result = build(languageDef);

			return result;
		};

		canto34.Jasmine = {};
		canto34.Jasmine.matchers = {
	    		toHaveTokenTypes: function(expected) {
	    			var actualLength = this.actual.length;
	    			var expectedLength = expected.length;
	      			if (actualLength != expectedLength) {
	      				this.message = function() {
	      					return "Expected " + expectedLength + " tokens but found " + actualLength;
	      				}
	      				return false;
	      			}

	      			for(var i = 0; i < actualLength; i++) {
	      				var actualType = this.actual[i].type;
	      				var expectedType = expected[i];
	      				if (actualType != expectedType) {
	      					var that = this;
	      					(function() {
	      						var failingIndex = i;
								that.message = function() {
									return "Expected token type '" + expectedType + "' but found '" + actualType + "' at index " + failingIndex;
								}
							})();
							return false;
	      				}
	      			}

	      			return true;
	    		},
	    		toHaveTokenContent: function(expected) {
	    			var actualLength = this.actual.length;
	    			var expectedLength = expected.length;
	      			if (actualLength != expectedLength) {
	      				this.message = function() {
	      					return "Expected " + expectedLength + " tokens but found " + actualLength;
	      				}
	      				return false;
	      			}

	      			for(var i = 0; i < actualLength; i++) {
	      				var actualContent = this.actual[i].content;
	      				var expectedContent = expected[i];
	      				if (actualContent != expectedContent) {
	      					var that = this;
	      					(function() {
	      						var failingIndex = i;
								that.message = function() {
									return "Expected token content '" + expectedContent + "' but found '" + actualContent + "' at index " + failingIndex;
								}
							})();
							return false;
	      				}
	      			}

	      			return true;
	    		}
	  		};

	  		canto34.Parser = function() {
	  		};

	  		canto34.Parser.prototype.initialize = function(tokens) {
	  			if (!tokens) {
	  				throw new canto34.ParserException("No tokens provided to the parser");
	  			}

	  			if (!(tokens instanceof Array)) {
	  				throw new canto34.ParserException("A non-array was provided to the parser instead of a token array");
	  			}

	  			this.tokens = tokens;
	  		};

	  		canto34.Parser.prototype.la1 = function(tokenType) {
	  			if (this.eof()) {
	  				throw new canto34.ParserException("No tokens available");
	  			}

	  			return this.tokens[0].type == tokenType;
	  		};

	  		canto34.Parser.prototype.match = function(tokenType) {

				if (this.eof()) {
	  				throw new canto34.ParserException("Expected " + tokenType + " but found EOF");
	  			}

	  			if (!this.la1(tokenType)) {
	  				throw new canto34.ParserException("Expected " + tokenType + " but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
	  			}

	  			return this.tokens.shift();
	  		};

	  		canto34.Parser.prototype.eof = function() {
	  			return this.tokens.length == 0;
	  		};

			canto34.Parser.prototype.expectEof = function() {
				if (!this.eof()) {
	  				throw new canto34.ParserException("Expected EOF but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
				}
			};

	  		canto34.LineTracker = function() {
	  			this.line = 1;
	  			this.character = 1;
	  			this.justSeenSlashR = false;
	  		};

	  		canto34.LineTracker.prototype.consume = function(content) {

	  			for(var i = 0, len=content.length; i < len; i++) {
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
	  		};
	});
}(
    typeof define == 'function' && define.amd
        ? define
        : function (factory) { factory(require, exports, module); }
));