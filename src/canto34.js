function isNullOrUndefined(x) {
  if (typeof x === "undefined") {
    return true;
  }

  if (x === null) {
    return true;
  }

  return false;
}

export class PatternDefinitionException extends Error {
  constructor(message) {
    super(message);
  }
}

export class LexerException extends Error {
  constructor(message) {
    super(message);
  }
}

export class ParserException extends Error {
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
* */
export class Lexer {
  constructor(options) {
    const defaults = {
      languageName: "unnamedlanguage"
    };
    this.options = { ...defaults, ...options };
    this.tokenTypes = [];
  }

  addTokenType(tokenType) {
    if (!tokenType.name) {
      throw new PatternDefinitionException(
        "Token types must have a 'name' property"
      );
    }

    // FOR CONSIDERATION: for some tokens, the full 'consume' is requ§red for correct interpretation
    // (eg, JSON strings with escaped character) but a regex will do for syntax highlighting. In this
    // situation, both are allowed but consume is used for lexing and regexp is used for language definition.
    // if (tokenType.regexp && tokenType.consume) {
    // 	throw new canto34.PatternDefinitionException("Token types cannot have both a 'regexp' pattern and 'consume' function.");
    // }

    if (!tokenType.regexp && !tokenType.consume) {
      throw new PatternDefinitionException(
        "Token types must have a 'regexp' property or a 'consume' function"
      );
    }

    if (tokenType.regexp && !(tokenType.regexp instanceof RegExp)) {
      throw new PatternDefinitionException(
        "Token types 'regexp' property must be an instance of RegExp"
      );
    }

    if (tokenType.consume && typeof tokenType.consume !== "function") {
      throw new PatternDefinitionException(
        "Token types 'consume' property must be a function"
      );
    }

    if (tokenType.interpret && typeof tokenType.interpret !== "function") {
      throw new PatternDefinitionException(
        "Token types 'interpret' property must be a function"
      );
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

    const result = [];
    let consumed;
    let remaining = content;
    const tracker = new LineTracker();
    const tokenTypeLength = this.tokenTypes.length;
    let consumeResult;

    while (remaining.length > 0) {
      let somethingFoundThisPass = false;

      for (let i = 0; i < tokenTypeLength; i++) {
        const tokenType = this.tokenTypes[i];

        consumeResult = undefined;
        if (tokenType.consume) {
          // must have a consume function;
          consumeResult = tokenType.consume(remaining);
          // should have told us what it consumed;
          if (consumeResult.success) {
            if (remaining.indexOf(consumeResult.consumed) !== 0) {
              throw new LexerException(
                `The consume function for ${
                  tokenType.name
                } failed to return the start of the remaining content at ${
                  tracker.line
                }.${tracker.character} and instead returned ${
                  consumeResult.consumed
                }`
              );
            } else {
              somethingFoundThisPass = true;
              consumed = consumeResult.consumed;
            }
          } else {
            continue;
          }
        } else {
          const match = tokenType.regexp.exec(remaining);
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

        // handle our new token
        if (tokenType.interpret) {
          content = tokenType.interpret(consumed);
        } else if (consumeResult && !isNullOrUndefined(consumeResult.content)) {
          content = consumeResult.content;
        } else {
          content = consumed;
        }

        const token = {
          content,
          type: tokenType.name,
          line: tracker.line,
          character: tracker.character
        };

        if (!tokenType.ignore) {
          result.push(token);
        }

        remaining = remaining.substring(consumed.length);
        tracker.consume(consumed);
        break; // This break is needed as we need to start matching from top of tokenType list
      }

      if (!somethingFoundThisPass) {
        const userPartOfString = remaining.substring(0, 15);
        const visibleUserPartOfString = userPartOfString
          .replace("\r", "\\r")
          .replace("\t", "\\t")
          .replace("\n", "\\n");
        throw new LexerException(
          `No viable alternative at ${tracker.line}.${
            tracker.character
          }: '${visibleUserPartOfString}...'`
        );
      }
    }

    return result;
  }
}

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
}

export class StandardTokenTypes {
  static constant(literal, name, role) {
    role = role || ["keyword"];
    return {
      name,
      regexp: new RegExp(`^${escapeRegExp(literal)}`),
      role
    };
  }

  static floatingPoint() {
    return {
      name: "floating point",
      regexp: /(^-?\d*\.\d+)/,
      role: ["constant", "numeric"],
      interpret(content) {
        return parseFloat(content);
      }
    };
  }

  static integer() {
    return {
      name: "integer",
      regexp: /^-?\d+/,
      role: ["constant", "numeric"],
      interpret(content) {
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
      consume(remaining) {
        const fail = { success: false };
        if (remaining.indexOf('"') !== 0) {
          return fail;
        }

        let content = "";
        let pos = 1;
        let ch;
        let finished = false;
        do {
          if (remaining.slice(pos).indexOf('"') === -1) {
            return fail;
          }
          ch = remaining[pos];
          pos += 1;

          switch (ch) {
            case '"':
              finished = true;
              break;
            case "\\":
              const ch2 = remaining[pos];
              pos += 1;
              switch (ch2) {
                case '"':
                  return fail;
                case "t":
                  content += "\t";
                  break;
                case "r":
                  content += "\r";
                  break;
                case "n":
                  content += "\n";
                  break;
                case "u":
                  const unicodeDigits = remaining.substr(pos, 4);
                  if (
                    unicodeDigits.length != 4 ||
                    !/\d{4}/.test(unicodeDigits)
                  ) {
                    content += "\\u";
                  } else {
                    pos += 4;
                    const codePoint = parseInt(unicodeDigits, 10);
                    const codePointString = String.fromCharCode(codePoint);
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

        const consumed = remaining.substring(0, pos);

        const successResult = {
          success: true,
          consumed,
          content
        };
        return successResult;
      }
    };
  }
}

export class Parser {
  initialize(tokens) {
    if (!tokens) {
      throw new ParserException("No tokens provided to the parser");
    }

    if (!(tokens instanceof Array)) {
      throw new ParserException(
        "A non-array was provided to the parser instead of a token array"
      );
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
      throw new ParserException(`Expected ${tokenType} but found EOF`);
    }

    if (!this.la1(tokenType)) {
      throw new ParserException(
        `Expected ${tokenType} but found ${this.tokens[0].type} at l${
          this.tokens[0].line
        }.${this.tokens[0].character}`
      );
    }

    return this.tokens.shift();
  }

  eof() {
    return this.tokens.length === 0;
  }

  expectEof() {
    if (!this.eof()) {
      throw new ParserException(
        `Expected EOF but found ${this.tokens[0].type} at l${
          this.tokens[0].line
        }.${this.tokens[0].character}`
      );
    }
  }
}

export class LineTracker {
  constructor() {
    this.line = 1;
    this.character = 1;
    this.justSeenSlashR = false;
  }

  consume(content) {
    for (let i = 0, len = content.length; i < len; i++) {
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
