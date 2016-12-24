import * as canto34 from '../src/canto34';

var lexer = new canto34.Lexer();
var types = canto34.StandardTokenTypes;
lexer.addTokenType(types.JsonString());
lexer.addTokenType(types.integer());
lexer.addTokenType(types.whitespaceWithNewlines());
lexer.addTokenType(types.openBracket());
lexer.addTokenType(types.closeBracket());
lexer.addTokenType(types.openSquareBracket());
lexer.addTokenType(types.closeSquareBracket());
lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

var parser = new canto34.Parser();

describe("The JSON lexer", function() {
	// it("should parse all the token types", function() {
	// 	var input = "( ) { } [ ] 123 -123 1.234 -1.234";
	// 	var tokens = lexer.tokenize(input);
	// });
});