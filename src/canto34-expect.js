import { canto34 } from './canto34';
import *  as expect from 'expect';

let expectMatchers = {
	toHaveTokenTypes(expected) {
    	var actualLength = this.actual.length;
		var expectedLength = expected.length;
	
	    expect.assert(
			actualLength === expectedLength,
			"Expected " + expectedLength + " tokens but found " + actualLength,
			this.actual
		);

		for(var i = 0; i < actualLength; i++) {
			var actualType = this.actual[i].type;
			var expectedType = expected[i];
			expect.assert(
				actualType === expectedType,
				"Expected token type '" + expectedType + "' but found '" + actualType + "' at index " + i,
				actualType
			);
		}

		return this;
	},
	toHaveTokenContent(expected) {
		var msg = "";
		this.message = () => msg;

		var actualLength = this.actual.length;
		var expectedLength = expected.length;

		expect.assert(
			actualLength === expectedLength,
			"Expected " + expectedLength + " tokens but found " + actualLength,
			actualLength
		);
		
		for(var i = 0; i < actualLength; i++) {
			var actualContent = this.actual[i].content;
			var expectedContent = expected[i];

			expect.assert(
				actualContent === expectedContent,
				"Expected token content '" + expectedContent + "' but found '" + actualContent + "' at index " + i,
				actualContent
			);
		}

		return true;
	},	
	toBeAt(line, character) {
		var actualLine = this.actual.line;
		var actualCharacter = this.actual.character;
		expect.assert(
			actualLine === line,
			"Expected line to be " + line + " but it was " + actualLine,
            actualLine
		);

		expect.assert(
			actualCharacter === character,
			"Expected character to be " + character + " but it was " + actualCharacter,
			actualCharacter
		);

		return this;
	}
}; 

export { 
	expectMatchers
 };