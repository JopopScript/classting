import { negativeNumberToZero, stringToInt } from "./util";

describe('util', () => {
  describe('negativeNumberToZero', () => {
    test.each([
      { input: Number.MIN_SAFE_INTEGER, expected: 0 },
      { input: -1, expected: 0 },
      { input: -0, expected: 0 },
      { input: 0, expected: 0 },
      { input: 1, expected: 1 },
      { input: 12345, expected: 12345 },
      { input: Number.MAX_SAFE_INTEGER, expected: Number.MAX_SAFE_INTEGER },
    ])('input: $input', ({ input, expected }) => {
      const output = negativeNumberToZero(input);
      expect(output).toBe(expected)
    })
  });

  describe('stringToInt', () => {
    test.each([
      { input: `${Number.MIN_SAFE_INTEGER}`, expected: NaN },
      { input: '-1', expected: NaN },
      { input: '-0', expected: 0 },
      { input: '0', expected: 0 },
      { input: '1', expected: 1 },
      { input: `${Number.MAX_SAFE_INTEGER}`, expected: Number.MAX_SAFE_INTEGER },
      { input: '1.11', expected: NaN },
      { input: '-1.11', expected: NaN },
      { input: 'true', expected: NaN },
      { input: 'false', expected: NaN },
      { input: true, expected: NaN },
      { input: false, expected: NaN },
      { input: {}, expected: NaN },
      { input: [], expected: NaN },
      { input: undefined, expected: undefined },
      { input: null, expected: null },
    ])('input: $input', ({ input, expected }) => {
      const output = stringToInt(input);
      expect(output).toBe(expected)
    })
  });
})