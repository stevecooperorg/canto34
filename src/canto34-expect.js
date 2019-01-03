const pass = (message) => ({
  message: () => message,
  pass: true,
});

const fail = (message) => ({
  message: () => message,
  pass: false,
});

let expectMatchers = {
  toHaveTokenTypes(actual, expected) {
    var actualLength = actual.length;
    var expectedLength = expected.length;

    if (actualLength !== expectedLength) {
      return fail(`Expected ${expectedLength} tokens but found ${actualLength}`);
    }

    for (var i = 0; i < actualLength; i++) {
      var actualType = actual[i].type;
      var expectedType = expected[i];
      if (actualType !== expectedType) {
        return fail(`Expected token type '${expectedType}' but found '${actualType}' at index ${i}`);
      }
    }

    return pass("");
  },
  toHaveTokenContent(actual, expected) {
    var msg = "";

    var actualLength = actual.length;
    var expectedLength = expected.length;

    if(actualLength !== expectedLength) {
      return fail(`Expected ${expectedLength} tokens but found ${actualLength}`);
    }

    for (var i = 0; i < actualLength; i++) {
      var actualContent = actual[i].content;
      var expectedContent = expected[i];

      if (actualContent !== expectedContent) {
        return fail(`Expected token content '${expectedContent}' but found '${actualContent}' at index${i}`);
      }
    }

    return pass("");
  },
  toBeAt(actual, line, character) {
    const actualLine = actual.line;
    const actualCharacter = actual.character;
    if(actualLine !== line) {
      return fail(`Expected line to be ${line} but it was ${actualLine}`);
    }

    if (actualCharacter !== character) {
      fail(`Expected character to be ${character}  but it was ${actualCharacter}`)
    }

    return pass("");
  }
};

export {
  expectMatchers
};