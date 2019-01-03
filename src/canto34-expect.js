const pass = message => ({
  message: () => message,
  pass: true
});

const fail = message => ({
  message: () => message,
  pass: false
});

let expectMatchers = {
  toHaveTokenTypes(actual, expected) {
    let actualLength = actual.length;
    let expectedLength = expected.length;

    if (actualLength !== expectedLength) {
      return fail(
        `Expected ${expectedLength} tokens but found ${actualLength}`
      );
    }

    for (let i = 0; i < actualLength; i++) {
      let actualType = actual[i].type;
      let expectedType = expected[i];
      if (actualType !== expectedType) {
        return fail(
          `Expected token type '${expectedType}' but found '${actualType}' at index ${i}`
        );
      }
    }

    return pass("");
  },
  toHaveTokenContent(actual, expected) {
    let msg = "";

    let actualLength = actual.length;
    let expectedLength = expected.length;

    if (actualLength !== expectedLength) {
      return fail(
        `Expected ${expectedLength} tokens but found ${actualLength}`
      );
    }

    for (let i = 0; i < actualLength; i++) {
      let actualContent = actual[i].content;
      let expectedContent = expected[i];

      if (actualContent !== expectedContent) {
        return fail(
          `Expected token content '${expectedContent}' but found '${actualContent}' at index${i}`
        );
      }
    }

    return pass("");
  },
  toBeAt(actual, line, character) {
    const actualLine = actual.line;
    const actualCharacter = actual.character;
    if (actualLine !== line) {
      return fail(`Expected line to be ${line} but it was ${actualLine}`);
    }

    if (actualCharacter !== character) {
      fail(
        `Expected character to be ${character}  but it was ${actualCharacter}`
      );
    }

    return pass("");
  }
};

export { expectMatchers };
