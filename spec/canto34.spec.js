"use strict"
var canto34 = require('../src/canto34');

describe('When adding token types to the lexer,', function() {

	var lexer;
	var tokenType;

	beforeEach(function() {
		lexer = new canto34.Lexer();
		tokenType = {
			name: "name",
			regexp: / \t/
		};
	});

	it('requires token types to have names', function() {
		expect(function() {
			delete tokenType.name;
			lexer.addTokenType(tokenType); 
		}).toThrow("Token types must have a 'name' property");
	});
		
	it('requires token types to have regexps', function() {
		expect(function() {
			delete tokenType.regexp
			lexer.addTokenType(tokenType); 
		}).toThrow("Token types must have a 'regexp' property");
	});

    it('requires the regexp property to be a regexp', function() {
		expect(function() {
			tokenType.regexp = "not a regexp";
			lexer.addTokenType(tokenType); 
		}).toThrow("Token types 'regexp' property must be an instance of RegExp");
	});

	it('allows an interpreter property to be a function', function() {
		
		expect(function() {
			tokenType.interpreter = function() { return 0; };
			lexer.addTokenType(tokenType);
		}).not.toThrow();
	});

	it('requires the interpreter property to be a function', function() {

		expect(function() {
			tokenType.interpreter = "not a function";
			lexer.addTokenType(tokenType);
		}).toThrow("Token types 'interpreter' property must be a function");
	});

});

describe('When lexing tokens', function() {
	
	var lexer;

	beforeEach(function() {
		lexer = new canto34.Lexer();
	});

	it('requires content to be passed', function() {
		expect(function() {
			lexer.tokenize(undefined);
		}).toThrow("No content provided");
	})

	it('requires at least one token type', function() {
		expect(function() {
			// we've not added any token types
			lexer.tokenize("something to tokenise");
		}).toThrow("No token types defined");
	})

    it('can tokenize a simple example', function() {
		lexer.addTokenType({
			name: "A",
			regexp: /a+/
		});

		lexer.addTokenType({
			name: "B",
			regexp: /b+/
		});

		var tokens = lexer.tokenize("aaabbbaaa");
		expect(tokens).toEqual([
			{ content: "aaa", type: "A", position:0 },
			{ content: "bbb", type: "B", position:3 },
			{ content: "aaa", type: "A", position:6 },
		]);
    })

	it('allows the use of an ignore flag in token types', function() {

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

		var tokens = lexer.tokenize("aa bb cc");
		expect(tokens).toEqual([ 
			{ content:"aa", type:"word", position:0 },
			{ content:"bb", type:"word", position:3 },
			{ content:"cc", type:"word", position:6 }
		]);
	});

	it('reports when there is no matching pattern', function() {
		lexer.addTokenType({
			name: "lettersOnly",
			regexp: /[a-z]+/
		});
		expect(function() {
			lexer.tokenize("123"); 
		}).toThrow("No viable alternative at position 0: '123...'");
	});

	it('allows the use of custom interpreters', function() {
		lexer.addTokenType({
			name: "integer",
			regexp: /\d+/,
			interpreter: function(content) {
				return parseInt(content);
			}
		});

		var tokens = lexer.tokenize("123");
		expect(tokens).toEqual([
			{ content: 123, type:"integer", position:0 }
		]);
	});

	it('ensures that custom interpeters track position correctly', function() {
		lexer.addTokenType({
			name: "threeAs",
			regexp: /aaa/,
			interpreter: function(content) {
				return "A";
			}
		});

		lexer.addTokenType({
			name: "threeBs",
			regexp: /bbb/,
			interpreter: function(content) {
				return "B";
			}
		});

		var tokens = lexer.tokenize("aaabbb");
		expect(tokens).toEqual([
			{ content: "A", type:"threeAs", position:0 },
			{ content: "B", type:"threeBs", position:3 }
		]);
	});
});

describe("the lexer standard integer type", function() {
	var lexer = new canto34.Lexer();
	lexer.addTokenType(canto34.StandardTokenTypes.integer());

	it("should parse integers", function() {
		var tokens = lexer.tokenize("123");
		expect(tokens).toEqual([ {content: 123, type:"integer", position:0}]);
	});

	it("should parse negative integers", function() {
		var tokens = lexer.tokenize("-123");
		expect(tokens).toEqual([ {content: -123, type:"integer", position:0}]);
	});
});

describe("the lexer standard whitespace type", function() {
	
	var lexer;

	beforeEach(function() {
		lexer = new canto34.Lexer();
	})
	
	it("should default to skipping whitespace tokens", function() {
		lexer.addTokenType(canto34.StandardTokenTypes.whitespace());
		lexer.addTokenType({ name:"letters", regexp: /^[a-z]+/ });
		var tokens = lexer.tokenize("  \t  abc \t  ");
		expect(tokens).toEqual([ {content: "abc", type:"letters", position:5}]);
	});

    it("will produce whitespace tokens spanning more than one character", function() {
    	var nonIgnoredWhitespace = canto34.StandardTokenTypes.whitespace();
    	nonIgnoredWhitespace.ignore = false;

		lexer.addTokenType(nonIgnoredWhitespace);
		lexer.addTokenType({ name:"letters", regexp: /^[a-z]+/ });
		var tokens = lexer.tokenize(" \t abc \t ");
		expect(tokens).toEqual([ 
			{content: " \t ", type:"whitespace", position:0},
			{content: "abc", type:"letters", position:3},
			{content: " \t ", type:"whitespace", position:6},
			]);
	});

	it("does not recognise newlines as part of the token", function() {
    	lexer.addTokenType(canto34.StandardTokenTypes.whitespace());
		expect(function() {
			lexer.tokenize("\r");
		}).toThrow("No viable alternative at position 0: '\\r...'");

		expect(function() {
			lexer.tokenize("\n");
		}).toThrow("No viable alternative at position 0: '\\n...'");
	});
});



describe("the lexer standard whitespace and newline type", function() {
	
	var lexer;

	beforeEach(function() {
		lexer = new canto34.Lexer();
	})
	
	it("should default to skipping whitespace tokens", function() {
		lexer.addTokenType(canto34.StandardTokenTypes.whitespaceWithNewlines());
		lexer.addTokenType({ name:"letters", regexp: /^[a-z]+/ });
		var tokens = lexer.tokenize("  \r\n\t  abc \r\n\t  ");
		expect(tokens).toEqual([ {content: "abc", type:"letters", position:7}]);
	});

    it("will produce whitespace tokens spanning more than one character", function() {
    	var nonIgnoredWhitespace = canto34.StandardTokenTypes.whitespaceWithNewlines();
    	nonIgnoredWhitespace.ignore = false;

		lexer.addTokenType(nonIgnoredWhitespace);
		lexer.addTokenType({ name:"letters", regexp: /^[a-z]+/ });
		var tokens = lexer.tokenize(" \t abc \t ");
		expect(tokens).toEqual([ 
			{content: " \t ", type:"whitespace", position:0},
			{content: "abc", type:"letters", position:3},
			{content: " \t ", type:"whitespace", position:6},
			]);
	});

	it("should recognise newlines as part of the token", function() {
    	lexer.addTokenType(canto34.StandardTokenTypes.whitespaceWithNewlines());
		expect(function() {
			return lexer.tokenize("\r");
		}).not.toThrow();

		expect(function() {
			return lexer.tokenize("\n");
		}).not.toThrow();
	});
});

describe("the canto jasmine matchers", function() {
	beforeEach(function() {
		this.addMatchers(canto34.Jasmine.matchers);
	});

	it("should be defined", function() {
		expect(canto34.Jasmine.matchers).toBeDefined();
	});

	it("should detect correct token types", function() {
		expect([
			{ content: "x", type:"y", position:0},
			{ content: "a", type:"b", position:1}
		]).toHaveTokenTypes(["y", "b"]);
	});

	it("should detect different token types", function() {
		var expectResult = {
			actual: [
				{ content: "x", type:"y", position:0},
				{ content: "a", type:"b", position:1}
			]
		};
		var result = canto34.Jasmine.matchers.toHaveTokenTypes.call(expectResult, ["y", "WRONG"]);
		expect(result).toBe(false);	
		var msg = expectResult.message();
		expect(msg).toBe("Expected token type 'WRONG' but found 'b' at index 1");
	});

	it("should detect correct token content", function() {
		expect([
			{ content: "x", type:"y", position:0},
			{ content: "a", type:"b", position:1}
		]).toHaveTokenContent(["x", "a"]);
	});

	it("should detect different token content", function() {
		var expectResult = {
			actual: [
				{ content: "x", type:"y", position:0},
				{ content: "a", type:"b", position:1}
			]
		};
		var result = canto34.Jasmine.matchers.toHaveTokenContent.call(expectResult, ["x", "WRONG"]);
		expect(result).toBe(false);	
		var msg = expectResult.message();
		expect(msg).toBe("Expected token content 'WRONG' but found 'a' at index 1");
	});

	it("should detect different lengths when checking types", function() {
		var expectResult = {
			actual: [
				{ content: "x", type:"y", position:0},
			]
		};
		var result = canto34.Jasmine.matchers.toHaveTokenTypes.call(expectResult, []);
		expect(result).toBe(false);	
		var msg = expectResult.message();
		expect(msg).toBe("Expected 0 tokens but found 1");
	});

	it("should detect different lengths when checking content", function() {
		var expectResult = {
			actual: [
				{ content: "x", type:"y", position:0},
			]
		};
		var result = canto34.Jasmine.matchers.toHaveTokenContent.call(expectResult, []);
		expect(result).toBe(false);	
		var msg = expectResult.message();
		expect(msg).toBe("Expected 0 tokens but found 1");
	});
})

describe("the parser", function() {

	it("should allow initialization from an array", function() {
		var parser = new canto34.Parser();
		parser.initialize([]);
		expect(parser.tokens.length).toBe(0);
	});

	it("should not allow initialization from undefined", function() {
		var parser = new canto34.Parser();
		expect(function() {
			parser.initialize();
		}).toThrow("No tokens provided to the parser");
	});

	it("should not allow initialization from non-arrays", function() {
		var parser = new canto34.Parser();
		expect(function() {
			parser.initialize("hello");
		}).toThrow("A non-array was provided to the parser instead of a token array");
	});

	it("should allow lookahead checks without consuming tokens", function() {
		var parser = new canto34.Parser();
		parser.initialize([
			{ content: "token1", type:"foo", position: 0 },
			{ content: "token2", type:"bar", position: 0 },
		]);
		expect(parser.la1("foo")).toBe(true);
		expect(parser.la1("foo")).toBe(true);
	});

	it("should allow matching which consumies tokens", function() {
		var parser = new canto34.Parser();
		parser.initialize([
			{ content: "token1", type:"foo", position: 0 },
			{ content: "token2", type:"bar", position: 0 },
		]);
		expect(parser.match("foo")).toEqual({ content: "token1", type:"foo", position: 0 });
		expect(parser.match("bar")).toEqual({ content: "token2", type:"bar", position: 0 });
	});

	it("should throw when matching the wrong type", function() {
		var parser = new canto34.Parser();
		parser.initialize([
			{ content: "token1", type:"foo", position: 0 }
		]);
		expect(function() {
			parser.match("bar");
		}).toThrow("Expected bar but found foo at 0");
	});

	it("should throw when looking ahead and no tokens are available", function() {
		var parser = new canto34.Parser();
		parser.initialize([]);
		expect(function() {
			parser.la1("bar");
		}).toThrow("No tokens available");
	});

	it("should throw when matching and no tokens are available", function() {
		var parser = new canto34.Parser();
		parser.initialize([]);
		expect(function() {
			parser.match("bar");
		}).toThrow("Expected bar but found EOF");
	});

	it("should recognise the end of input as eof", function() {
		var parser = new canto34.Parser();
		parser.initialize([ { type:"foo"}]);
		expect(parser.eof()).toBe(false);
		parser.match("foo");
		expect(parser.eof()).toBe(true);
	});


});