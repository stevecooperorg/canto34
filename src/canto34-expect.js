const pass = message => ({
  message: () => message,
  pass: true
});

const fail = message => ({
  message: () => message,
  pass: false
});

export const expectMatchers = {
  toHaveTokenTypes(actual, expected) {
    const actualLength = actual.length;
    const expectedLength = expected.length;

    if (actualLength !== expectedLength) {
      return fail(
        `Expected ${expectedLength} tokens but found ${actualLength}`
      );
    }

    for (let i = 0; i < actualLength; i++) {
      const actualType = actual[i].type;
      const expectedType = expected[i];
      if (actualType !== expectedType) {
        return fail(
          `Expected token type '${expectedType}' but found '${actualType}' at index ${i}`
        );
      }
    }

    return pass("");
  },
  toHaveTokenContent(actual, expected) {
    const msg = "";

    const actualLength = actual.length;
    const expectedLength = expected.length;

    if (actualLength !== expectedLength) {
      return fail(
        `Expected ${expectedLength} tokens but found ${actualLength}`
      );
    }

    for (let i = 0; i < actualLength; i++) {
      const actualContent = actual[i].content;
      const expectedContent = expected[i];

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
