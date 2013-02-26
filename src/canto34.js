(function(canto34){

    /**
        A *Lexer* takes a string and chops it into pieces. A Canto34 Lexer is a series of pattern objects, like 
	
	    { 
             name: "whitespace",
             regexp: "[ \t\r\n]+",
             ignore: true
         }
    **/
	canto34.Lexer = function() {
		this.patterns = [];
	};

    var PatternDefinitionException = function(message) {
    	this.message = message;
    }

	canto34.Lexer.prototype = {
		addTokenType: function(pattern) {
			if (!pattern.name) {
				throw new PatternDefinitionException("Patterns must have a 'name' property");
			}

			if (!pattern.regexp) { 
				throw new PatternDefinitionException("Patterns must have a 'regexp' property");
			}


			if (!(pattern.regexp instanceof RegExp)) { 
				throw new PatternDefinitionException("Patterns 'regexp' property must be an instance of RegExp");
			}
		}
	};

})(typeof exports === 'undefined'? this['canto34']={}: exports);
