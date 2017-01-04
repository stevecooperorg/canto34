import * as canto34 from '../src/canto34';
import expect, { createSpy, spyOn, isSpy } from 'expect';
import example from '../src/example';

expect.extend(canto34.expectMatchers);

var lexer = example.lexer;
var parser = example.parser;

describe("The README.md example", function() {
    
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