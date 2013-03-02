(function(canto34){

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
    	}
    }

    /**
        A *Lexer* takes a string and chops it into pieces. A Canto34 Lexer is a series of pattern objects, like 
	
	    { 
             name: "integer",
             regexp: "\d+",
             ignore: true,
             interpret: function(content) {
				return parseInt(content); 
             }
         }
    **/
	canto34.Lexer = function() {
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

		if (tokenType.regexp && tokenType.consume) {
			throw new canto34.PatternDefinitionException("Token types cannot have both a 'regexp' pattern and 'consume' function.");
		}

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
				if (tokenType.regexp) {
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
				} else {
					// must have a consume function;
					var consumeResult = tokenType.consume(remaining);
					// should have told us what it consumed;
					if (consumeResult.success) {
						if (remaining.indexOf(consumeResult.consumed) !== 0) {
							throw new canto34.LexerException("The consume function for " + tokenType.name + " failed to return the start of the remaining content at " + tracker.line + "." + tracker.character);
						} else {
							somethingFoundThisPass = true;
							consumed = consumeResult.consumed;
						}
					} else {
						continue;
					}		
				}

				//handle our new token
				if (tokenType.interpret) {
					content = tokenType.interpret(consumed);
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

	canto34.StandardTokenTypes.integer = function() {
		return {
			name: "integer",
			regexp: /^-?\d+/,
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


	canto34.StandardTokenTypes.comma = function() {
		return {
			name: "comma",
			regexp: /,/
		};
	};

	canto34.StandardTokenTypes.period = function() {
		return {
			name: "period",
			regexp: /^\./
		};
	};

	canto34.StandardTokenTypes.star = function() {
		return {
			name: "star",
			regexp: /^\*/
		};
	};

	canto34.StandardTokenTypes.JsonString = function() {
		return {
			name: "string",
			consume: function(remaining) {
				var fail = { success: false };
				if (remaining.indexOf('"') !== 0) {
					return fail;
				}

				var consumed = '"';
				var pos = 1;
				while(remaining[pos] != '"') {
					consumed += remaining[pos];
					pos++;
				}
				consumed += '"';
				return {
					success: true,
					consumed: consumed
				};
			}
		};
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
  				throw new canto34.ParserException("Expected " + tokenType + " but found " + this.tokens[0].type + " at " + this.tokens[0].position);
  			}

  			return this.tokens.shift();
  		};

  		canto34.Parser.prototype.eof = function() {
  			return this.tokens.length == 0;
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

})(typeof exports === 'undefined'? this['canto34']={}: exports);
