import { tmLanguage } from "./canto34-syntax";
import { lexer } from "./example";

describe("the tmLanguage generator", () => {
  it("should generate a file without complaining", () => {
    const actual = tmLanguage.generateTmLanguageDefinition(lexer);
    expect(actual.length).not.toBe(0);
  });
});
