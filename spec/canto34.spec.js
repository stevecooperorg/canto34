var canto34 = require('../src/canto34');
"use strict"

describe('The lexer,', function() {

	describe('when adding a token type,', function() {

		var lexer;
		var validTokenType;

		beforeEach(function() {
			lexer = new canto34.Lexer();
			tokenType = {
				name: "name",
				rexexp: / \t/g
			}
		});

		it('requires token types to have names', function() {
			expect(function() {
				delete tokenType.name;
				lexer.addTokenType(tokenType); 
			}).toThrow("Patterns must have a 'name' property");
		});
			
		it('requires token types to have regexps', function() {
			expect(function() {
				delete tokenType.regexp
				lexer.addTokenType(tokenType); 
			}).toThrow("Patterns must have a 'regexp' property");
		});

        it('requires the regexp property to be a regexp', function() {
			expect(function() {
				tokenType.regexp = "not a regexp";
				lexer.addTokenType(tokenType); 
			}).toThrow("Patterns 'regexp' property must be an instance of RegExp");
		});

	})

});