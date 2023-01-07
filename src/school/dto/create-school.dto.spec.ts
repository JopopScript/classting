import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Area } from "../area.enum";
import { CreateSchoolDto } from "./create-school.dto";

describe('CreateSchoolDto', () => {
  describe('정상처리', () => {
    test.each([
      { name: '서울고등학교', area: 'SEOUL', userId: 1 },
      { name: 'a', area: 'INCHEON', userId: Number.MAX_SAFE_INTEGER },
      { name: 'a'.repeat(255), area: 'GYEONGSANGNAM', userId: 11 },
    ])('requestDto: %p', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(CreateSchoolDto, requestDto);
      //when
      const errors = await validate(requestDtoObj);
      //then
      expect(errors.length).toBe(0);
    });
  });

  describe('에러발생: 2개 이상 형식에 맞지 않는 경우', () => {
    test.each([
      {
        requestDto: { name: '', userId: true },
        expectedErrors: [
          { value: '', property: 'name', constraints: ['isNotEmpty'] },
          { value: undefined, property: 'area', constraints: ['isNotEmpty', 'isEnum'] },
          { value: true, property: 'userId', constraints: ['isInt'] },
        ]
      },
      {
        requestDto: { name: {}, area: 'abc', userId: '1' },
        expectedErrors: [
          { value: {}, property: 'name', constraints: ['isString'] },
          { value: 'abc', property: 'area', constraints: ['isEnum'] },
          { value: '1', property: 'userId', constraints: ['isInt'] },
        ]
      },
    ])('requestDto: $requestDto', async ({requestDto, expectedErrors}) => {
      //given
      const requestDtoObj = plainToInstance(CreateSchoolDto, requestDto);
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
    name               | expectedError
    ${undefined}       | ${{ value: undefined, property: 'name', constraints: ['isNotEmpty'] }}
    ${''}              | ${{ value: '', property: 'name', constraints: ['isNotEmpty'] }}
    ${123}             | ${{ value: 123, property: 'name', constraints: ['isString'] }}
    ${'a'.repeat(256)} | ${{ value: 'a'.repeat(256), property: 'name', constraints: ['maxLength'] }}
  `('name: $name', async ({ name, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateSchoolDto, { name, area: Area.SEOUL, userId: 1 });
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

  describe('area에서 에러발생', () => {
    test.each`
    area              | expectedError
    ${undefined}      | ${{ value: undefined, property: 'area', constraints: ['isNotEmpty'] }}
    ${''}             | ${{ value: '', property: 'area', constraints: ['isNotEmpty'] }}
    ${{}}             | ${{ value: {}, property: 'area', constraints: ['isEnum'] }}
    ${'a'.repeat(21)} | ${{ value: 'a'.repeat(21), property: 'area', constraints: ['maxLength'] }}
  `('area: $area', async ({ area, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateSchoolDto, { name: '경기고등학교', area, userId: 1 });
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

  describe('userId에서 에러발생', () => {
    test.each`
    userId       | expectedError
    ${undefined} | ${{ value: undefined, property: 'userId', constraints: ['isNotEmpty'] }}
    ${{}}        | ${{ value: {}, property: 'userId', constraints: ['isInt'] }}
    ${1.1}       | ${{ value: 1.1, property: 'userId', constraints: ['isInt'] }}
  `('userId: $userId', async ({ userId, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateSchoolDto, { name: '경기고등학교', area: Area.SEOUL, userId });
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