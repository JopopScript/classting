import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateNewsDto } from "./create-news.dto";

describe('CreateNewsDto', () => {
  describe('정상처리', () => {
    test.each([
      { title: '공지사항', contents: '가', schoolId: 1 },
      { title: 'a', contents: 'a'.repeat(1_000_000), schoolId: 11 },
      { title: 'a'.repeat(255), contents: 'abc', schoolId: Number.MAX_SAFE_INTEGER },
    ])('%#', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(CreateNewsDto, requestDto);
      //when
      const errors = await validate(requestDtoObj);
      //then
      expect(errors.length).toBe(0);
    });
  });

  describe('에러발생: 2개 이상 형식에 맞지 않는 경우', () => {
    test.each([
      {
        requestDto: { contents: 123, schoolId: true },
        expectedErrors: [
          { value: undefined, property: 'title', constraints: ['isNotEmpty'] },
          { value: 123, property: 'contents', constraints: ['isString'] },
          { value: true, property: 'schoolId', constraints: ['isInt'] },
        ]
      },
      {
        requestDto: { title: {}, contents: null, schoolId: '1' },
        expectedErrors: [
          { value: {}, property: 'title', constraints: ['isString'] },
          { value: null, property: 'contents', constraints: ['isNotEmpty'] },
          { value: '1', property: 'schoolId', constraints: ['isInt'] },
        ]
      },
    ])('requestDto: $requestDto', async ({requestDto, expectedErrors}) => {
      //given
      const requestDtoObj = plainToInstance(CreateNewsDto, requestDto);
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

  describe('title에서 에러발생', () => {
    test.each`
    title               | expectedError
    ${undefined}       | ${{ value: undefined, property: 'title', constraints: ['isNotEmpty'] }}
    ${''}              | ${{ value: '', property: 'title', constraints: ['isNotEmpty'] }}
    ${123}             | ${{ value: 123, property: 'title', constraints: ['isString'] }}
    ${'a'.repeat(256)} | ${{ value: 'a'.repeat(256), property: 'title', constraints: ['maxLength'] }}
    `('title: $title', async ({ title, expectedError }) => {
      // given
      const requestDtoObj = plainToInstance(CreateNewsDto, { title, contents: 'abc', schoolId: 1 });
      // when
      const error = await validate(requestDtoObj);      
      // then
      expect(error.length).toBe(1);
      expect(error[0].value).toEqual(expectedError.value);
      expect(error[0].property).toEqual(expectedError.property);
      expect(Object.keys(error[0].constraints))
        .toEqual(expect.arrayContaining(expectedError.constraints));
    });
  })

  describe('contents에서 에러발생', () => {
    test.each`
    contents           | expectedError
    ${undefined}       | ${{ value: undefined, property: 'contents', constraints: ['isNotEmpty'] }}
    ${''}              | ${{ value: '', property: 'contents', constraints: ['isNotEmpty'] }}
    ${{}}              | ${{ value: {}, property: 'contents', constraints: ['isString'] }}
  `('contents: $contents', async ({ contents, expectedError }) => {
      //given
      const requestDtoObj = plainToInstance(CreateNewsDto, { title: '공지사항', contents, schoolId: 1 });
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
      const requestDtoObj = plainToInstance(CreateNewsDto, { title: '공지사항', contents: '가나다', schoolId });
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