import { CustomValidateMessage } from './custom-validate-message';

describe('CustomValidateMessage', () => {
  describe('isNotEmpty', () => {
    test.each`
    validationArguments                       | expectedMessage
    ${{ value: undefined, property: 'name' }} | ${'value:undefined|name should not be empty'}
    ${{ value: null, property: 'page' }}      | ${'value:null|page should not be empty'}
    ${{ value: '', property: 'area' }}        | ${'value:|area should not be empty'}
    `('정상처리 rvalidationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.isNotEmpty(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })

  describe('isString', () => {
    test.each`
    validationArguments                       | expectedMessage
    ${{ value: 123, property: 'title' }}      | ${'value:123|title must be a string'}
    ${{ value: true, property: 'title' }}     | ${'value:true|title must be a string'}
    ${{ value: {}, property: 'title' }}       | ${'value:[object Object]|title must be a string'}
    `('정상처리 validationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.isString(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })

  describe('isIntString', () => {
    test.each`
    validationArguments                        | expectedMessage
    ${{ value: '1.0', property: 'page' }}      | ${'value:1.0|page must be a integer string'}
    ${{ value: 'true', property: 'pageSize' }} | ${'value:true|pageSize must be a integer string'}
    ${{ value: 'abc', property: 'id' }}        | ${'value:abc|id must be a integer string'}
    `('정상처리 validationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.isIntString(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })

  describe('maxLength', () => {
    test.each`
    validationArguments                                              | expectedMessage
    ${{ value: 'ab', property: 'name', constraints: [1] }}           | ${'value:ab|name must be shorter than or equal to 1 characters'}
    ${{ value: '12345678901', property: 'name', constraints: [10] }} | ${`value:12345678901|name must be shorter than or equal to 10 characters`}
    `('정상처리 validationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.maxLength(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })

  describe('isInt', () => {
    test.each`
    validationArguments                       | expectedMessage
    ${{ value: true, property: 'schoolId' }}  | ${'value:true|schoolId must be an integer number'}
    ${{ value: {}, property: 'schoolId' }}    | ${'value:[object Object]|schoolId must be an integer number'}
    ${{ value: 'x10', property: 'schoolId' }} | ${'value:x10|schoolId must be an integer number'}
    `('정상처리 validationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.isInt(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })

  describe('isEnum', () => {
    test.each`
    validationArguments                       | expectedMessage
    ${{ value: 'student', property: 'role' }}  | ${'value:student|role must be a valid enum value'}
    ${{ value: 'Admin', property: 'role' }}    | ${'value:Admin|role must be a valid enum value'}
    `('정상처리 validationArguments: $validationArguments', async ({ validationArguments, expectedMessage }) => {
      //when
      const customValidateMessage = CustomValidateMessage.isEnum(validationArguments);
      //then
      expect(customValidateMessage).toEqual(expectedMessage);
    })
  })
});
