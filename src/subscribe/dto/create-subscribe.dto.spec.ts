import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateSubscribeDto } from "./create-subscribe.dto";

describe('CreateSubscribeDto', () => {
  describe('정상처리', () => {
    test.each([
      { userId: 1, schoolId: 1 },
      { userId: Number.MAX_SAFE_INTEGER, schoolId: 1_000_000 },
      { userId: 123, schoolId: Number.MAX_SAFE_INTEGER },
    ])('requestDto: %p', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(CreateSubscribeDto, requestDto);
      //when
      const errors = await validate(requestDtoObj);
      //then
      expect(errors.length).toBe(0);
    });
  });

  describe('에러발생: 2개 이상 형식에 맞지 않는 경우', () => {
    test.each([
      {
        requestDto: { userId: true, schoolId: {} },
        expectedErrors: [
          { value: true, property: 'userId', constraints: ['isInt'] },
          { value: {}, property: 'schoolId', constraints: ['isInt'] },
        ]
      },
      {
        requestDto: { schoolId: '123' },
        expectedErrors: [
          { value: undefined, property: 'userId', constraints: ['isNotEmpty'] },
          { value: '123', property: 'schoolId', constraints: ['isInt'] },
        ]
      },
    ])('requestDto: $requestDto', async ({requestDto, expectedErrors}) => {
      //given
      const requestDtoObj = plainToInstance(CreateSubscribeDto, requestDto);
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

  describe('userId에서 에러발생', () => {
    test.each`
    userId       | expectedError
    ${undefined} | ${{ value: undefined, property: 'userId', constraints: ['isNotEmpty'] }}
    ${{}}        | ${{ value: {}, property: 'userId', constraints: ['isInt'] }}
    ${1.1}       | ${{ value: 1.1, property: 'userId', constraints: ['isInt'] }}
  `('userId: $userId', async ({ userId, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateSubscribeDto, { userId, schoolId: 1 });
      //when
      const error = await validate(requestDtoObj);      
      //then
      expect(error.length).toBe(1);
      expect(error[0].value).toEqual(expectedError.value);
      expect(error[0].property).toEqual(expectedError.property);
      expect(Object.keys(error[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  })

  describe('schoolId에서 에러발생', () => {
    test.each`
    schoolId       | expectedError
    ${undefined} | ${{ value: undefined, property: 'schoolId', constraints: ['isNotEmpty'] }}
    ${{}}        | ${{ value: {}, property: 'schoolId', constraints: ['isInt'] }}
    ${1.1}       | ${{ value: 1.1, property: 'schoolId', constraints: ['isInt'] }}
  `('schoolId: $schoolId', async ({ schoolId, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateSubscribeDto, { userId: 1, schoolId });
      //when
      const error = await validate(requestDtoObj);      
      //then
      expect(error.length).toBe(1);
      expect(error[0].value).toEqual(expectedError.value);
      expect(error[0].property).toEqual(expectedError.property);
      expect(Object.keys(error[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  })
});