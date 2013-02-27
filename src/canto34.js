(function(canto34){

    /**
        A *Lexer* takes a string and chops it into pieces. A Canto34 Lexer is a series of pattern objects, like 
	
	    { 
             name: "integer",
             regexp: "\d+",
             ignore: true,
             interpreter: function(content) {
				return parseInt(content); 
             }
         }
    **/
	canto34.Lexer = function() {
		this.tokenTypes = [];
	};

    var PatternDefinitionException = function(message) {
    	this.message = message;
    }

    var LexerException = function(message) {
    	this.message = message;
    }

	canto34.Lexer.prototype.addTokenType = function(tokenType) {
			
		if (!tokenType.name) {
			throw new PatternDefinitionException("Token types must have a 'name' property");
		}

		if (!tokenType.regexp) { 
			throw new PatternDefinitionException("Token types must have a 'regexp' property");
		}


		if (!(tokenType.regexp instanceof RegExp)) { 
			throw new PatternDefinitionException("Token types 'regexp' property must be an instance of RegExp");
		}

		if(tokenType.interpreter && typeof tokenType.interpreter !== "function") {
			throw new PatternDefinitionException("Token types 'interpreter' property must be a function");
		}
		this.tokenTypes.push(tokenType);
	};

	canto34.Lexer.prototype.tokenize = function(content) {
		if (content === undefined) {
			throw new LexerException("No content provided");
		}

		if (this.tokenTypes.length === 0) {
			throw new LexerException("No token types defined");
		}

		var result = [];

		var remaining = content;
		var position = 0;
		var tokenTypeLength = this.tokenTypes.length;

		while(remaining.length > 0) {
			var somethingFoundThisPass = false;

			for (var i = 0; i < tokenTypeLength; i++) {
				var tokenType = this.tokenTypes[i];
				var match = tokenType.regexp.exec(remaining);
				if (match) {
					// we found a token! great. What did it say? We only
					// want to match at the start of the string
					if (match.index == 0) {
						somethingFoundThisPass = true;
						var content = match[0];
						remaining = remaining.substring(content.length);
						
						if (tokenType.interpreter) {
							content = tokenType.interpreter(content);
						}

						var token = {
							content: content,
							type: tokenType.name,
							position: position
						};

						if (!tokenType.ignore) {
							result.push(token);
						}

						position += content.length;
						continue;
					}
				}
			}

			if (!somethingFoundThisPass) {
				throw new LexerException("No viable alternative at position " + position + ": '" + remaining.substring(0, 15) + "...'");
			}
		}

		return result;
	};

	canto34.StandardTokenTypes = {};

	canto34.StandardTokenTypes.integer = function() {
		return {
			name: "integer",
			regexp: /^-?\d+/,
			interpreter: function(content) {
				return parseInt(content);
			}
		};
	};

	canto34.StandardTokenTypes.whitespace = function() {
		return {
			name: "whitespace",
			ignore: true,
			regexp: /[ \t]+/
		};
	};

})(typeof exports === 'undefined'? this['canto34']={}: exports);
