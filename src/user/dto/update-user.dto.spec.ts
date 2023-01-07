import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  describe('정상처리', () => {
    test.each([
      { name: 'keroro' },
      { role: 'ADMIN' },
      { },
    ])('requestDto: %p', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(UpdateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
  
      //then
      expect(errors.length).toBe(0);
    })
  })

  describe('에러발생: 2개', () => {
    test.each([
      {
        requestDto: { name: '', role: 'Student' },
        expectedErrors: [
          { value: '', property: 'name', constraints: ['isNotEmpty'] },
          { value: 'Student', property: 'role', constraints: ['isEnum'] }
        ]
      },
      {
        requestDto: { name: {}, role: 123 },
        expectedErrors: [
          { value: {}, property: 'name', constraints: ['isString'] },
          { value: 123, property: 'role', constraints: ['isEnum'] }
        ]
      },
    ])('requestDto: $requestDto', async ({requestDto, expectedErrors}) => {
      //given
      const requestDtoObj = plainToInstance(UpdateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
        
      //then
      expect(errors.length).toBe(expectedErrors.length);
      errors.forEach((error, i) => {
        const expectedError = expectedErrors[i];
        expect(error.value).toEqual(expectedError.value);
        expect(error.property).toEqual(expectedError.property);
        expect(Object.keys(error.constraints))
          .toEqual(expect.arrayContaining(expectedError.constraints));
      });
    })
  });

  describe('name에서 에러발생', () => {
    test.each`
    requestDto                   | expectedError
    ${{ name: '' }}              | ${{ value: '', property: 'name', constraints: ['isNotEmpty'] }}
    ${{ name: 123 }}             | ${{ value: 123, property: 'name', constraints: ['isString'] }}
    ${{ name: 'a'.repeat(256) }} | ${{ value: 'a'.repeat(256), property: 'name', constraints: ['maxLength'] }}
    `('request: $requestDto |errorType: $errorType', async ({requestDto, errorType, expectedError}) => {
      const requestDtoObj = plainToInstance(UpdateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
      
      //then
      expect(errors.length).toBe(1);
      expect(errors[0].value).toEqual(expectedError.value);
      expect(errors[0].property).toEqual(expectedError.property);
      expect(Object.keys(errors[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  })

  describe('role에서 에러발생', () => {
    test.each`
    requestDto           | expectedError
    ${{ role: '' }}      | ${{ value: '', property: 'role', constraints: ['isNotEmpty'] }}
    ${{ role: 'admin' }} | ${{ value: 'admin', property: 'role', constraints: ['isEnum'] }}
    ${{ role: true }}    | ${{ value: true, property: 'role', constraints: ['isEnum'] }}
    `('request: $requestDto |errorType: $errorType', async ({requestDto, errorType, expectedError}) => {
      const requestDtoObj = plainToInstance(UpdateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
  
      //then
      expect(errors.length).toBe(1);
      expect(errors[0].value).toEqual(expectedError.value);
      expect(errors[0].property).toEqual(expectedError.property);
      expect(Object.keys(errors[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  })
});
