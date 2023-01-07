/**
 * 음수를 0으로 변환, 양수는 그대로 반환
 * @param input 정수
 * @returns 0이상의 양의 정수
 */
export const negativeNumberToZero = (number: number) => {
  if (number < 0 || number === 0) {
    return 0;
  } else {
    return number;
  }
}
/**
 * 문자열 형태로된 양의 정수만 숫자로 변환함.
 * @param input 문자열
 * @returns 0이상의 양의 정수, 변환못할시 NaN반환, 얘외로 undefined null은 그대로 반환
 */
export const stringToInt = (input: any) => {
  if (input === undefined || input === null) {
    return input;
  }
  const paresedInput = parseInt(input)
  if (typeof input === 'string' && parseFloat(input) === paresedInput && paresedInput > -1) {
    if(paresedInput === -0) {
      return 0;
    }
    return paresedInput;
  }
  return NaN;
}