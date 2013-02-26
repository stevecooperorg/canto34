// Canto 34 is a library for building recursive-descent parsers.
//
// When it comes to writing a parser, you get two main choices. Write your
// own, or use a parser generator like PEGJS or Jison. I've never really had
// much success with parser generators, and it's always seemed pretty easy to
// write a recursive-descent parser yourself, *if* you have some basic tools
// like a regex-based lexer, and some basic functions for matching tokens and
// reporting errors. Canto34 gives you the functions you need to write a
// recursive descent parser yourself.
var Canto34;
(function(canto) {
	// A *Lexer* takes a string and chops it into pieces. A Canto34 Lexer is a series of pattern objects, like 
	// 
	//     { 
    //         name: "whitespace",
    //         regexp: "[ \t\r\n]+",
    //         ignore: true
    //     }
	canto.Lexer = function() {
		this.patterns = [];
	};

    var PatternDefinitionException = function(message) {
    	this.message = message;
    }

	canto.Lexer.prototype = {
		addPattern: function(pattern) {
			if (!pattern.name) {
				throw new PatternDefinitionException("Patterns must have a 'name' property");
			}

			if (!pattern.regexp) { 
				throw new PatternDefinitionException("Patterns must have a 'regexp' property");
			}

			if (pattern.regexp instanceof RegExp) { 
				throw new PatternDefinitionException("Patterns 'regexp' property must be an instance of RegExp");
			}
		}
	};

})(Canto34 ? Canto34 : Canto34 = {});