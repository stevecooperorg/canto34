import { lexer, parser } from "./example";

describe("The README.md example", () => {
  describe("lexer", () => {
    it("should work as advertised", () => {
      const tokens = lexer.tokenize("foo 1, bar 2.");
      const expected = [
        {
          content: "foo",
          type: "name",
          line: 1,
          character: 1
        },
        {
          content: 1,
          type: "integer",
          line: 1,
          character: 5
        },
        {
          content: ",",
          type: "comma",
          line: 1,
          character: 6
        },
        {
          content: "bar",
          type: "name",
          line: 1,
          character: 8
        },
        {
          content: 2,
          type: "integer",
          line: 1,
          character: 12
        },
        {
          content: ".",
          type: "period",
          line: 1,
          character: 13
        }
      ];
      expect(tokens).toEqual(expected);
    });
  });

  describe("parser", () => {
    it("should work as advertised", () => {
      const tokens = lexer.tokenize("foo 1, bar 2, baz 3.");
      parser.initialize(tokens);
      parser.listOfNameValuePairs();
      const expected = [
        { name: "foo", value: 1 },
        { name: "bar", value: 2 },
        { name: "baz", value: 3 }
      ];
      expect(parser.result).toEqual(expected);
    });
  });

  describe("parser", () => {
    it("should throw the expected error", () => {
      const tokens = lexer.tokenize("foo 1, bar 2, baz 3");
      parser.initialize(tokens);
      expect(() => {
        parser.listOfNameValuePairs();
      }).toThrow("Expected period but found EOF");
    });
  });
});
