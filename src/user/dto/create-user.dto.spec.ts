import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

describe('CreateUserDto', () => {
  describe('정상처리', () => {
    test.each([
      { name: 'keroro', role: 'STUDENT' },
      { name: 'a', role: 'ADMIN' },
      { name: 'a'.repeat(255), role: 'STUDENT' },
    ])('requestDto: %p', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(CreateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
  
      //then
      expect(errors.length).toBe(0);
    })
  })

  describe('에러발생: 2개 모두 형식에 맞지 않는 경우', () => {
    test.each([
      {
        requestDto: { role: 'Student' },
        expectedErrors: [
          { value: undefined, property: 'name', constraints: ['isString','isNotEmpty'] },
          { value: 'Student', property: 'role', constraints: ['isEnum'] }
        ]
      },
      {
        requestDto: { name: 123 },
        expectedErrors: [
          { value: 123, property: 'name', constraints: ['isString'] },
          { value: undefined, property: 'role', constraints: ['isEnum', 'isNotEmpty'] }
        ]
      },
    ])('requestDto: $requestDto', async ({requestDto, expectedErrors}) => {
      //given
      const requestDtoObj = plainToInstance(CreateUserDto, requestDto);
  
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
  })

  describe('name에서 에러발생', () => {
    test.each`
    requestDto                                    | expectedError
    ${{ name: undefined, role: 'STUDENT' }}       | ${{ value: undefined, property: 'name', constraints: ['isNotEmpty'] }}
    ${{ name: '', role: 'STUDENT' }}              | ${{ value: '', property: 'name', constraints: ['isNotEmpty'] }}
    ${{ name: 123, role: 'STUDENT' }}             | ${{ value: 123, property: 'name', constraints: ['isString'] }}
    ${{ name: 'a'.repeat(256), role: 'STUDENT' }} | ${{ value: 'a'.repeat(256), property: 'name', constraints: ['maxLength'] }}
    `('request: $requestDto', async ({requestDto, expectedError}) => {
      const requestDtoObj = plainToInstance(CreateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
      
      //then
      expect(errors.length).toBe(1);
      expect(errors[0].value).toEqual(expectedError.value);
      expect(errors[0].property).toEqual(expectedError.property);
      expect(Object.keys(errors[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  });

  describe('role에서 에러발생', () => {
    test.each`
    requestDto                         | expectedError
    ${{ name: 'kero' }}                | ${{ value: undefined, property: 'role', constraints: ['isNotEmpty'] }}
    ${{ name: 'kero', role: '' }}      | ${{ value: '', property: 'role', constraints: ['isNotEmpty'] }}
    ${{ name: 'kero', role: 'admin' }} | ${{ value: 'admin', property: 'role', constraints: ['isEnum'] }}
    `('request: $requestDto', async ({requestDto, expectedError}) => {
      const requestDtoObj = plainToInstance(CreateUserDto, requestDto);
  
      //when
      const errors = await validate(requestDtoObj);
  
      //then
      expect(errors.length).toBe(1);
      expect(errors[0].value).toEqual(expectedError.value);
      expect(errors[0].property).toEqual(expectedError.property);
      expect(Object.keys(errors[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  });
});
