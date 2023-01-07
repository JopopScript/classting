import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PagenationDto } from "./pagenation.dto";

describe('PagenationDto', () => {
  describe('validate', () => {
    test.each([
      { },
      { page: '13' },
      { pageSize: '20' },
      { page: '13', pageSize: '20' },
    ])('정상처리 requestDto: %p', async (requestDto) => {
      //given
      const requestDtoObj = plainToInstance(PagenationDto, requestDto);
      //when
      const errors = await validate(requestDtoObj);
      //then
      expect(errors.length).toBe(0);
    })

    test.each([
      { 
        requestDto: { page: '0', pageSize: '0' },
        expectedErrors: [
          { value: 0, property: 'page', constraints: 'min' },
          { value: 0, property: 'pageSize', constraints: 'min' },
        ]
      },
      { 
        requestDto: { page: 'five', pageSize: 'true' },
        expectedErrors: [
          { value: NaN, property: 'page', constraints: 'isInt' },
          { value: NaN, property: 'pageSize', constraints: 'isInt' },
        ]
      },
      {
        requestDto: { page: 'true', pageSize: undefined },
        expectedErrors: [{ value: NaN, property: 'page', constraints: 'isInt' }]
      },
      {
        requestDto: { page: undefined, pageSize: '열' },
        expectedErrors: [{ value: NaN, property: 'pageSize', constraints: 'isInt' }]
      },
    ])('에러발생 requestDto: $requestDto', async ({ requestDto, expectedErrors }) => {
      //given
      const requestDtoObj = plainToInstance(PagenationDto, requestDto);
      //when
      const errors = await validate(requestDtoObj);
      //then
      expect(errors.length).toBe(expectedErrors.length);
      for (let i = 0; i < errors.length; i++) {
        expect(errors[i].value).toBe(expectedErrors[i].value)
        expect(errors[i].property).toBe(expectedErrors[i].property)
        expect(JSON.stringify(Object.keys(errors[i].constraints)))
          .toContain(expectedErrors[i].constraints)
      }
    })
  });

  describe('property default value', () => {
    test.each`
    requestDto                        | expectedObj
    ${{}}                             | ${{ page: 1, pageSize: 10 }}
    ${{ page: '13' }}                 | ${{ page: 13, pageSize: 10 }}
    ${{ pageSize: '20' }}             | ${{ page: 1, pageSize: 20 }}
    ${{ page: '13', pageSize: '20' }} | ${{ page: 13, pageSize: 20 }}
    `('값 미입력시 기본값 적용 requestDto: $requestDto', async ({ requestDto, expectedObj }) => {
      const requestDtoObj = plainToInstance(PagenationDto, requestDto);
      expect(requestDtoObj).toEqual(expectedObj);
    });
  })
});
