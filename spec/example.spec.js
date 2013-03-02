"use strict"
var canto34 = require('../src/canto34');

    var lexer = new canto34.Lexer();

    // add a token for whitespace
    lexer.addTokenType({ 
        name: "ws",       // give it a name
        regexp: /[ \t]+/, // match spaces and tabs
        ignore: true      // don't return this token in the result
    });
    
    // add a token type for names, defines as strings of lower-case characters
    lexer.addTokenType({ name: "name", regexp: /^[a-z]+/  });
    
    // bring in some predefined types for commas, period, and integers.
    var types = canto34.StandardTokenTypes;
    lexer.addTokenType(types.comma());
    lexer.addTokenType(types.period());
    lexer.addTokenType(types.integer());
    
    var parser = new canto34.Parser();
    parser.listOfNameValuePairs = function() {
        this.result = [];
        this.nameValuePair();
        while (!this.eof() && this.la1("comma")) {
            this.match("comma");
            this.nameValuePair();
        }
        this.match("period");
    };
    
    parser.nameValuePair = function() {
        var name = this.match("name").content;
        var value = this.match("integer").content;
        this.result.push({ name:name, value: value });
    };


describe("The README.md example", function() {

    beforeEach(function() {
        this.addMatchers(canto34.Jasmine.matchers);
    });

    describe("lexer", function() {
        it("should work as advertised", function() {
            var tokens = lexer.tokenize("foo 1, bar 2.");
            var expected = 
                [
                    { content: "foo", type: "name",    line:1, character:1 },
                    { content: 1,     type: "integer", line:1, character:5 },
                    { content: ",",   type: "comma",   line:1, character:6 },
                    { content: "bar", type: "name",    line:1, character:8 },
                    { content: 2,     type: "integer", line:1, character:12 },
                    { content: ".",   type: "period",  line:1, character:13 }
                ];
            expect(tokens).toEqual(expected);
        });
    });

    describe("parser", function() {
        it("should work as advertised", function() {
            var tokens = lexer.tokenize("foo 1, bar 2, baz 3.");
            parser.initialize(tokens);
            parser.listOfNameValuePairs();
            var expected = [
                {name:"foo", value:1},
                {name:"bar", value:2},
                {name:"baz", value:3},
            ];
            expect(parser.result).toEqual(expected);
        });
    });

    describe("parser", function() {
        it("should throw the expected error", function() {
            var tokens = lexer.tokenize("foo 1, bar 2, baz 3");
            parser.initialize(tokens);
            expect(function() {
            	parser.listOfNameValuePairs();
            }).toThrow("Expected period but found EOF");
        });
    });

});