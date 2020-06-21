import * as canto34 from "./canto34";

describe("When adding token types to the lexer,", () => {
  let lexer;
  let tokenType;

  beforeEach(() => {
    lexer = new canto34.Lexer();
    tokenType = {
      name: "name",
      regexp: / \t/
    };
  });

  it("requires token types to have names", () => {
    expect(() => {
      delete tokenType.name;
      lexer.addTokenType(tokenType);
    }).toThrow("Token types must have a 'name' property");
  });

  it("requires token types to have regexps", () => {
    expect(() => {
      delete tokenType.regexp;
      lexer.addTokenType(tokenType);
    }).toThrow(
      "Token types must have a 'regexp' property or a 'consume' function"
    );
  });

  it("does not require a regexp if a consume function is available", () => {
    expect(() => {
      delete tokenType.regexp;
      tokenType.consume = function() {};
      lexer.addTokenType(tokenType);
    }).not.toThrow();
  });

  it("requires the regexp property to be a regexp", () => {
    expect(() => {
      tokenType.regexp = "not a regexp";
      lexer.addTokenType(tokenType);
    }).toThrow("Token types 'regexp' property must be an instance of RegExp");
  });

  it("allows the consume property to be a function", () => {
    expect(() => {
      delete tokenType.regexp;
      tokenType.consume = function() {};
      lexer.addTokenType(tokenType);
    }).not.toThrow();
  });

  it("requires the consume property to be a function", () => {
    expect(() => {
      delete tokenType.regexp;
      tokenType.consume = "not a function";
      lexer.addTokenType(tokenType);
    }).toThrow("Token types 'consume' property must be a function");
  });

  it("allows an interpret property to be a function", () => {
    expect(() => {
      tokenType.interpret = function() {
        return 0;
      };
      lexer.addTokenType(tokenType);
    }).not.toThrow();
  });

  it("requires the interpret property to be a function", () => {
    expect(() => {
      tokenType.interpret = "not a function";
      lexer.addTokenType(tokenType);
    }).toThrow("Token types 'interpret' property must be a function");
  });
});

describe("When lexing tokens", () => {
  let lexer;

  beforeEach(() => {
    lexer = new canto34.Lexer();
  });

  it("requires content to be passed", () => {
    expect(() => {
      lexer.tokenize(undefined);
    }).toThrow("No content provided");
  });

  it("requires at least one token type", () => {
    expect(() => {
      // we've not added any token types
      lexer.tokenize("something to tokenise");
    }).toThrow("No token types defined");
  });

  it("can tokenize a simple example", () => {
    lexer.addTokenType({
      name: "A",
      regexp: /a+/
    });

    lexer.addTokenType({
      name: "B",
      regexp: /b+/
    });

    const tokens = lexer.tokenize("aaabbbaaa");
    expect(tokens).toEqual([
      {
        content: "aaa",
        type: "A",
        character: 1,
        line: 1
      },
      {
        content: "bbb",
        type: "B",
        character: 4,
        line: 1
      },
      {
        content: "aaa",
        type: "A",
        character: 7,
        line: 1
      }
    ]);
  });

  it("allows the use of an ignore flag in token types", () => {
    lexer.addTokenType({
      name: "whitespace",
      regexp: /[ \t]+/,
      ignore: true
    });

    lexer.addTokenType({
      name: "word",
      regexp: /[a-z]+/,
      ignore: false
    });

    const tokens = lexer.tokenize("aa bb cc");
    expect(tokens).toEqual([
      {
        content: "aa",
        type: "word",
        line: 1,
        character: 1
      },
      {
        content: "bb",
        type: "word",
        line: 1,
        character: 4
      },
      {
        content: "cc",
        type: "word",
        line: 1,
        character: 7
      }
    ]);
  });

  it("reports when there is no matching pattern", () => {
    lexer.addTokenType({
      name: "lettersOnly",
      regexp: /[a-z]+/
    });
    expect(() => {
      lexer.tokenize("123");
    }).toThrow("No viable alternative at 1.1: '123...'");
  });

  it("allows the use of custom consumers", () => {
    lexer.addTokenType({
      name: "custom",
      consume: function anyThreeCharacters(remaining) {
        return {
          success: true,
          consumed: remaining.substring(0, 3)
        };
      }
    });

    const tokens = lexer.tokenize("abcdefg");
    expect(tokens).toEqual([
      {
        content: "abc",
        type: "custom",
        line: 1,
        character: 1
      },
      {
        content: "def",
        type: "custom",
        line: 1,
        character: 4
      },
      {
        content: "g",
        type: "custom",
        line: 1,
        character: 7
      }
    ]);
  });

  it("protects against badly-consuming consume functions", () => {
    lexer.addTokenType({
      name: "custom",
      consume: function broken(remaining) {
        return {
          success: true,
          consumed: "xxx" // not the start of the string
        };
      }
    });

    expect(() => {
      lexer.tokenize("abcdefg");
    }).toThrow(
      "The consume function for custom failed to return the start of the remaining content at 1.1 and instead returned xxx"
    );
  });

  it("allows the use of custom interpreters", () => {
    lexer.addTokenType({
      name: "integer",
      regexp: /\d+/,
      interpret(content) {
        return parseInt(content);
      }
    });

    const tokens = lexer.tokenize("123");
    expect(tokens).toEqual([
      {
        content: 123,
        type: "integer",
        line: 1,
        character: 1
      }
    ]);
  });

  it("ensures that custom interpeters track position correctly", () => {
    lexer.addTokenType({
      name: "threeAs",
      regexp: /aaa/,
      interpret(content) {
        return "A";
      }
    });

    lexer.addTokenType({
      name: "threeBs",
      regexp: /bbb/,
      interpret(content) {
        return "B";
      }
    });

    const tokens = lexer.tokenize("aaabbb");
    expect(tokens).toEqual([
      {
        content: "A",
        type: "threeAs",
        line: 1,
        character: 1
      },
      {
        content: "B",
        type: "threeBs",
        line: 1,
        character: 4
      }
    ]);
  });
});

describe("the lexer standard integer type", () => {
  const lexer = new canto34.Lexer();
  lexer.addTokenType(canto34.StandardTokenTypes.integer());

  it("should parse integers", () => {
    const tokens = lexer.tokenize("123");
    expect(tokens).toEqual([
      {
        content: 123,
        type: "integer",
        line: 1,
        character: 1
      }
    ]);
  });

  it("should parse negative integers", () => {
    const tokens = lexer.tokenize("-123");
    expect(tokens).toEqual([
      {
        content: -123,
        type: "integer",
        line: 1,
        character: 1
      }
    ]);
  });
});

describe("the lexer standard floating point type", () => {
  const lexer = new canto34.Lexer();
  lexer.addTokenType(canto34.StandardTokenTypes.floatingPoint());

  it("should parse floating points", () => {
    const tokens = lexer.tokenize("123.45");
    expect(tokens).toEqual([
      {
        content: 123.45,
        type: "floating point",
        line: 1,
        character: 1
      }
    ]);
  });

  it("should parse floating points without leading number", () => {
    const tokens = lexer.tokenize(".5");
    expect(tokens).toEqual([
      {
        content: 0.5,
        type: "floating point",
        line: 1,
        character: 1
      }
    ]);
  });

  it("should parse negative floating points", () => {
    const tokens = lexer.tokenize("-123.45");
    expect(tokens).toEqual([
      {
        content: -123.45,
        type: "floating point",
        line: 1,
        character: 1
      }
    ]);
  });
});

describe("the lexer standard JSON string type", () => {
  const lexer = new canto34.Lexer();
  lexer.addTokenType(canto34.StandardTokenTypes.JsonString());

  it("should parse an empty string", () => {
    const tokens = lexer.tokenize('""');
    expect(tokens).toHaveTokenContent([""]);
  });

  it("should parse a straightforward string", () => {
    const tokens = lexer.tokenize('"abc"');
    expect(tokens).toHaveTokenContent(["abc"]);
  });

  it("should not cause a heap overflow on unterminated string", () => {
  
    expect(() => {
      const tokens = lexer.tokenize('"abc');
    }).toThrow("No viable alternative at 1.1: '\"abc...");

  });

  it("should parse a \\t escape character", () => {
    const tokens = lexer.tokenize('"a\\tc"');
    expect(tokens).toHaveTokenContent(["a\tc"]);
  });

  it("should parse a \\r escape character", () => {
    const tokens = lexer.tokenize('"a\\rc"');
    expect(tokens).toHaveTokenContent(["a\rc"]);
  });

  it("should parse a \\n escape character", () => {
    const tokens = lexer.tokenize('"a\\nc"');
    expect(tokens).toHaveTokenContent(["a\nc"]);
  });

  it("should parse unicode \\u0000 escape characters", () => {
    const tokens = lexer.tokenize('"\\u0065"'); // unicode 'A'
    expect(tokens).toHaveTokenContent(["A"]);
  });

  it("should ignore not-really-unicode like \\u00 foo ", () => {
    const tokens = lexer.tokenize('"\\u00 foo"');
    expect(tokens).toHaveTokenContent(["\\u00 foo"]);
  });

  it("should fail to recognise \\ at the end of a string", () => {
    expect(() => {
      lexer.tokenize('"\\"');
    }).toThrow("No viable alternative at 1.1: '\"\\\"...'");
  });

  it("should not recognise unknown escaped character, like \\q", () => {
    expect(() => {
      lexer.tokenize('"\\q"');
    }).toThrow("No viable alternative at 1.1: '\"\\q\"...'");
  });
});

describe("the lexer standard whitespace type", () => {
  let lexer;

  beforeEach(() => {
    lexer = new canto34.Lexer();
  });

  it("should default to skipping whitespace tokens", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.whitespace());
    lexer.addTokenType({ name: "letters", regexp: /^[a-z]+/ });
    const tokens = lexer.tokenize("  \t  abc \t  ");
    expect(tokens).toEqual([
      {
        content: "abc",
        type: "letters",
        line: 1,
        character: 6
      }
    ]);
  });

  it("will produce whitespace tokens spanning more than one character", () => {
    const nonIgnoredWhitespace = canto34.StandardTokenTypes.whitespace();
    nonIgnoredWhitespace.ignore = false;

    lexer.addTokenType(nonIgnoredWhitespace);
    lexer.addTokenType({ name: "letters", regexp: /^[a-z]+/ });
    const tokens = lexer.tokenize(" \t abc \t ");
    expect(tokens).toEqual([
      {
        content: " \t ",
        type: "whitespace",
        line: 1,
        character: 1
      },
      {
        content: "abc",
        type: "letters",
        line: 1,
        character: 4
      },
      {
        content: " \t ",
        type: "whitespace",
        line: 1,
        character: 7
      }
    ]);
  });

  it("does not recognise newlines as part of the token", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.whitespace());
    expect(() => {
      lexer.tokenize("\r");
    }).toThrow("No viable alternative at 1.1: '\\r...'");

    expect(() => {
      lexer.tokenize("\n");
    }).toThrow("No viable alternative at 1.1: '\\n...'");
  });
});

describe("the lexer standard whitespace and newline type", () => {
  let lexer;

  beforeEach(() => {
    lexer = new canto34.Lexer();
  });

  it("should default to skipping whitespace tokens", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.whitespaceWithNewlines());
    lexer.addTokenType({ name: "letters", regexp: /^[a-z]+/ });
    const tokens = lexer.tokenize("  \r\n\t  abc \r\n\t  ");
    expect(tokens).toEqual([
      {
        content: "abc",
        type: "letters",
        line: 2,
        character: 4
      }
    ]);
  });

  it("will produce whitespace tokens spanning more than one character", () => {
    const nonIgnoredWhitespace = canto34.StandardTokenTypes.whitespaceWithNewlines();
    nonIgnoredWhitespace.ignore = false;

    lexer.addTokenType(nonIgnoredWhitespace);
    lexer.addTokenType({ name: "letters", regexp: /^[a-z]+/ });
    const tokens = lexer.tokenize(" \t abc \t ");
    expect(tokens).toEqual([
      {
        content: " \t ",
        type: "whitespace",
        line: 1,
        character: 1
      },
      {
        content: "abc",
        type: "letters",
        line: 1,
        character: 4
      },
      {
        content: " \t ",
        type: "whitespace",
        line: 1,
        character: 7
      }
    ]);
  });

  it("should recognise newlines as part of the token", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.whitespaceWithNewlines());
    expect(() => lexer.tokenize("\r")).not.toThrow();

    expect(() => lexer.tokenize("\n")).not.toThrow();
  });
});

describe("the lexer standard types", () => {
  let lexer;
  beforeEach(() => {
    lexer = new canto34.Lexer();
  });

  it("should recognise commas", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.comma());
    expect(lexer.tokenize(",")).toHaveTokenTypes(["comma"]);
  });

  it("should recognise periods", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.period());
    expect(lexer.tokenize(".")).toHaveTokenTypes(["period"]);
  });

  it("should recognise colons", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.colon());
    expect(lexer.tokenize(":")).toHaveTokenTypes(["colon"]);
  });

  it("should recognise star", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.star());
    expect(lexer.tokenize("*")).toHaveTokenTypes(["star"]);
  });

  it("should recognise real numbers", () => {});

  it("should recognise several brackets and parens", () => {
    lexer.addTokenType(canto34.StandardTokenTypes.openBracket());
    lexer.addTokenType(canto34.StandardTokenTypes.closeBracket());
    lexer.addTokenType(canto34.StandardTokenTypes.openSquareBracket());
    lexer.addTokenType(canto34.StandardTokenTypes.closeSquareBracket());
    lexer.addTokenType(canto34.StandardTokenTypes.openParen());
    lexer.addTokenType(canto34.StandardTokenTypes.closeParen());
    expect(lexer.tokenize("{}[]()")).toHaveTokenTypes([
      "open bracket",
      "close bracket",
      "open square bracket",
      "close square bracket",
      "open paren",
      "close paren"
    ]);
  });
});

describe("the parser", () => {
  it("should allow initialization from an array", () => {
    const parser = new canto34.Parser();
    parser.initialize([]);
    expect(parser.tokens.length).toBe(0);
  });

  it("should not allow initialization from undefined", () => {
    const parser = new canto34.Parser();
    expect(() => {
      parser.initialize();
    }).toThrow("No tokens provided to the parser");
  });

  it("should not allow initialization from non-arrays", () => {
    const parser = new canto34.Parser();
    expect(() => {
      parser.initialize("hello");
    }).toThrow(
      "A non-array was provided to the parser instead of a token array"
    );
  });

  it("should allow lookahead checks without consuming tokens", () => {
    const parser = new canto34.Parser();
    parser.initialize([
      { content: "token1", type: "foo", position: 0 },
      { content: "token2", type: "bar", position: 0 }
    ]);
    expect(parser.la1("foo")).toBe(true);
    expect(parser.la1("foo")).toBe(true);
  });

  it("should allow matching which consumies tokens", () => {
    const parser = new canto34.Parser();
    parser.initialize([
      { content: "token1", type: "foo", position: 0 },
      { content: "token2", type: "bar", position: 0 }
    ]);
    expect(parser.match("foo")).toEqual({
      content: "token1",
      type: "foo",
      position: 0
    });
    expect(parser.match("bar")).toEqual({
      content: "token2",
      type: "bar",
      position: 0
    });
  });

  it("should throw when matching the wrong type", () => {
    const parser = new canto34.Parser();
    parser.initialize([
      {
        content: "token1",
        type: "foo",
        line: 1,
        character: 1
      }
    ]);
    expect(() => {
      parser.match("bar");
    }).toThrow("Expected bar but found foo at l1.1");
  });

  it("should throw when looking ahead and no tokens are available", () => {
    const parser = new canto34.Parser();
    parser.initialize([]);
    expect(() => {
      parser.la1("bar");
    }).toThrow("No tokens available");
  });

  it("should throw when matching and no tokens are available", () => {
    const parser = new canto34.Parser();
    parser.initialize([]);
    expect(() => {
      parser.match("bar");
    }).toThrow("Expected bar but found EOF");
  });

  it("should recognise the end of input as eof", () => {
    const parser = new canto34.Parser();
    parser.initialize([{ type: "foo" }]);
    expect(parser.eof()).toBe(false);
    parser.match("foo");
    expect(parser.eof()).toBe(true);
  });

  it("should throw correctly if there are tokens and expectEof() called", () => {
    const parser = new canto34.Parser();
    parser.initialize([{ type: "foo" }]);
    expect(parser.expectEof.bind(parser)).toThrow();
  });

  it("should not throw if there are no tokens and expectEof() called", () => {
    const parser = new canto34.Parser();
    parser.initialize([]);
    expect(parser.expectEof.bind(parser)).not.toThrow();
  });
});

describe("canto34.LineTracker", () => {
  let tracker;
  beforeEach(() => {
    tracker = new canto34.LineTracker();
  });

  it("should initialize to 1,1", () => {
    expect(tracker).toBeAt(1, 1);
  });

  it("should track characters in the first line", () => {
    tracker.consume("1234567890");
    expect(tracker).toBeAt(1, 11);
  });

  it("should track \\r", () => {
    tracker.consume("foo\rbar");
    expect(tracker).toBeAt(2, 4);
  });

  it("should track \\n", () => {
    tracker.consume("foo\nbar");
    expect(tracker).toBeAt(2, 4);
  });

  it("should track \\r\\n", () => {
    tracker.consume("foo\r\nbar");
    expect(tracker).toBeAt(2, 4);
  });

  it("should track \\r, \\n, and both together in complex situations", () => {
    tracker.consume("\r");
    expect(tracker).toBeAt(2, 1);

    tracker.consume("\n");
    expect(tracker).toBeAt(2, 1); // don't advance the line because of previous \r

    tracker.consume("foo");
    expect(tracker).toBeAt(2, 4);
  });
});
