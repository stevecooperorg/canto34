import { build } from "plist";
import { canto34 } from "./canto34";

class tmLanguage {
  static generateTmLanguageDefinition(lexer) {
    const languageDef = {
      name: lexer.options.languageName,
      patterns: []
    };

    lexer.tokenTypes.forEach(tt => {
      // convert the regex back to a string; clean off leading and trailing slashes,
      // and leading ^ characters, which are meaningless.
      if (!tt.regexp) {
        throw `no regex for ${tt.name}`;
      }
      let regexPattern = tt.regexp.toString();
      regexPattern = regexPattern.substr(1, regexPattern.length - 2);
      if (regexPattern.indexOf("^") === 0) {
        regexPattern = regexPattern.substr(1);
      }

      // the name value represents the tmLanguage 'role', such as
      // 'keyword.control.mylanguage' for 'a keyword in my language'.
      // This is used in the colour schemes of text editors to give
      // tokens appropriate colours. Token types can supply these roles

      let nameParts;
      if (typeof tt.role === "string") {
        nameParts = [tt.role];
      } else {
        nameParts = tt.role || [];
      }

      nameParts.push(tt.name);

      if (lexer.options.languageName) {
        nameParts.push(lexer.options.languageName);
      }

      const noDups = [];
      for (let i = 0; i < nameParts.length; i++) {
        if (noDups.indexOf(nameParts[i]) === -1) {
          noDups.push(nameParts[i]);
        }
      }

      languageDef.patterns.push({
        match: regexPattern,
        name: noDups.join(".")
      });
    });

    const result = build(languageDef);

    return result;
  }
}

export { tmLanguage };
