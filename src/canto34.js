import { build } from 'plist';

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
};

class PatternDefinitionException extends Error {
	constructor(message) {
		super(message);
	}
}

class LexerException extends Error {
	constructor(message) {
		super(message);
	}
}

class ParserException extends Error {
	constructor(message) {
		super(message);
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
class Lexer {
	constructor(options) {
		var defaults = {
			languageName: "unnamedlanguage"
		};
		this.options = util.extend({}, defaults, options);
		this.tokenTypes = [];
	}
	addTokenType(tokenType) {

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

		if(tokenType.consume && typeof tokenType.consume !== "function") {
			throw new PatternDefinitionException("Token types 'consume' property must be a function");
		}

		if(tokenType.interpret && typeof tokenType.interpret !== "function") {
			throw new PatternDefinitionException("Token types 'interpret' property must be a function");
		}
		this.tokenTypes.push(tokenType);
	}
	tokenize(content) {
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

		while(remaining.length > 0) {
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
}

function escapeRegExp(string){
	return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
}

class StandardTokenTypes {
	static constant(literal, name, role) {
		role = role || ["keyword"];
		return {
			name: name,
			regexp: new RegExp("^" + escapeRegExp(literal)),
			role: role
		};
	}
	static integer() {
		return {
			name: "integer",
			regexp: /^-?\d+/,
			role: ["constant", "numeric"],
			interpret: function(content) {
				return parseInt(content);
			}
		};
	}
	static whitespace() {
		return {
			name: "whitespace",
			ignore: true,
			regexp: /^[ \t]+/
		};
	}
	static whitespaceWithNewlines() {
		return {
			name: "whitespace",
			ignore: true,
			regexp: /^[ \t\r\n]+/
		};
	}
	static real() {
		return {
			name: "real number",
			regexp: /^X/,
			role: ["constant", "numeric"]
		};
	}
	static comma() {
		return this.constant(",", "comma", ["punctuation"]);
	}
	static period() {
		return this.constant(".", "period", ["punctuation"]);
	}
	static star() {
		return this.constant("*", "star", ["punctuation"]);
	}
	static colon() {
		return this.constant(":", "colon", ["punctuation"]);
	}
	static openParen() {
		return this.constant("(", "open paren", ["punctuation"]);
	}
	static closeParen() {
		return this.constant(")", "close paren", ["punctuation"]);
	}
	static openBracket() {
		return this.constant("{", "open bracket", ["punctuation"]);
	}
	static closeBracket() {
		return this.constant("}", "close bracket", ["punctuation"]);
	}
	static openSquareBracket() {
		return this.constant("[", "open square bracket", ["punctuation"]);
	}
	static closeSquareBracket() {
		return this.constant("]", "close square bracket", ["punctuation"]);
	}
	static JsonString() {
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
				} while(!finished);


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
}

class tmLanguage {
	static generateTmLanguageDefinition(lexer) {
		// https://github.com/TooTallNate/plist.js
		//var build = require('plist').build;
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
			if (regexPattern.indexOf("^") === 0) {
				regexPattern = regexPattern.substr(1);
			}

			// the name value represents the tmLanguage 'role', such as
			// 'keyword.control.mylanguage' for 'a keyword in my language'.
			// This is used in the colour schemes of text editors to give
			// tokens appropriate colours. Token types can supply these roles

			var nameParts;
			if (typeof(tt.role) === "string") {
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
	}
}

let expectMatchers = {
	toHaveTokenTypes(expected) {
		var msg = "";
		this.message = () => msg;
		var actualLength = this.actual.length;
		var expectedLength = expected.length;
		if (actualLength != expectedLength) {
			msg = "Expected " + expectedLength + " tokens but found " + actualLength;
			return false;
		}

		for(var i = 0; i < actualLength; i++) {
			var actualType = this.actual[i].type;
			var expectedType = expected[i];
			if (actualType != expectedType) {
				msg = "Expected token type '" + expectedType + "' but found '" + actualType + "' at index " + i;
				return false;
			}
		}

		return true;
	},
	toHaveTokenContent(expected) {
		var msg = "";
		this.message = () => msg;

		var actualLength = this.actual.length;
		var expectedLength = expected.length;
		if (actualLength != expectedLength) {
			msg = "Expected " + expectedLength + " tokens but found " + actualLength;
			return false;
		}

		for(var i = 0; i < actualLength; i++) {
			var actualContent = this.actual[i].content;
			var expectedContent = expected[i];
			if (actualContent != expectedContent) {
				msg = "Expected token content '" + expectedContent + "' but found '" + actualContent + "' at index " + i;
				return false;
			}
		}

		return true;
	},	
	toBeAt: function(line, character) {
		var actualLine = this.actual.line;
		var actualCharacter = this.actual.character;
		if (actualLine != line) {
			this.message = () => "Expected line to be " + line + " but it was " + actualLine;
			return false;
		}
		if (actualCharacter != character) {
			this.message = function () { return "Expected character to be " + character + " but it was " + actualCharacter ; };
			return false;
		}
		return true;
	}
};

class Parser {
	initialize(tokens) {
		if (!tokens) {
			throw new ParserException("No tokens provided to the parser");
		}

		if (!(tokens instanceof Array)) {
			throw new ParserException("A non-array was provided to the parser instead of a token array");
		}

		this.tokens = tokens;
	}
	la1(tokenType) {
		if (this.eof()) {
			throw new ParserException("No tokens available");
		}

		return this.tokens[0].type == tokenType;
	}
	match(tokenType) {

		if (this.eof()) {
			throw new ParserException("Expected " + tokenType + " but found EOF");
		}

		if (!this.la1(tokenType)) {
			throw new ParserException("Expected " + tokenType + " but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
		}

		return this.tokens.shift();
	}
	eof() {
		return this.tokens.length === 0;
	}
	expectEof() {
		if (!this.eof()) {
			throw new ParserException("Expected EOF but found " + this.tokens[0].type + " at l" + this.tokens[0].line + "." + this.tokens[0].character);
		}
	}
}

class LineTracker {
	constructor() {
		this.line = 1;
		this.character = 1;
		this.justSeenSlashR = false;
	}
	consume(content) {

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
	}
}

export { 
	PatternDefinitionException, 
	LexerException, 
	ParserException, 
	Lexer, 
	StandardTokenTypes, 
	Parser, 
	LineTracker, 
	tmLanguage,
	expectMatchers
 };