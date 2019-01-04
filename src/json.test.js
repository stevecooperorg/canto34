import * as canto34 from "./canto34";

const lexer = new canto34.Lexer();
const types = canto34.StandardTokenTypes;
lexer.addTokenType(types.JsonString());
lexer.addTokenType(types.floatingPoint());
lexer.addTokenType(types.integer());
lexer.addTokenType(types.whitespaceWithNewlines());
lexer.addTokenType(types.openBracket());
lexer.addTokenType(types.closeBracket());
lexer.addTokenType(types.openSquareBracket());
lexer.addTokenType(types.closeSquareBracket());
lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

describe("The JSON lexer", () => {
  it("should parse all the token types", () => {
    const input = "( ) { } [ ] 123 -123 1.234 -1.234";
    const tokens = lexer.tokenize(input);
    expect(tokens).toHaveTokenTypes([
      "open paren",
      "close paren",
      "open bracket",
      "close bracket",
      "open square bracket",
      "close square bracket",
      "integer",
      "integer",
      "floating point",
      "floating point"
    ]);
  });
});
