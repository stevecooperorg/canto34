import * as canto34 from '../src/canto34';
import { tmLanguage } from '../src/canto34-syntax';
import { expectMatchers } from '../src/canto34-expect';
import expect, { createSpy, spyOn, isSpy } from 'expect';
import { lexer } from '../src/example';

expect.extend(expectMatchers);

describe("the tmLanguage generator", function() {
	it("should generate a file without complaining", function() {
		var actual = tmLanguage.generateTmLanguageDefinition(lexer);
		expect(actual.length).toNotBe(0);
	});
});
