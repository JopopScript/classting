import { HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { DatabaseStatus } from '../constant/Database.constant';
import { AllExceptionsFilter } from './all-exception.filter';
import { DatabaseError } from './Database.error';

describe('AllExceptionsFilter', () => {
  test.each`
  exception                                              | expectedResponse
  ${[new ValidationError()]}                             | ${{ status: 404, message: 'Bad Request Exception' }}
  ${[new ValidationError(), new ValidationError()]}      | ${{ status: 404, message: 'Bad Request Exception' }}
  ${new HttpException('test', 404)}                      | ${{ status: 404, message: 'test' }}
  ${new DatabaseError(DatabaseStatus.UNKNOWN)}           | ${{ status: 500, message: '알수없는 오류가 발생했습니다. 다시 한번 시도해보시고 동일한 문제가 반복된다면 문의 부탁드립니다.' }}
  ${new DatabaseError(DatabaseStatus.NO_RESULT, 'test')} | ${{ status: 500, message: 'test' }}
  ${new Error()}                                         | ${{ status: 500, message: '알수없는 오류가 발생했습니다. 다시 한번 시도해보시고 동일한 문제가 반복된다면 문의 부탁드립니다.' }}
  `('에러별 reponse값 검증 exception: $exception', async ({ exception, expectedResponse }) => {
    //given
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockImplementation(() => ({
        json: mockJson
    }));
    const mockGetResponse = jest.fn().mockImplementation(() => ({
        status: mockStatus
    }));
    const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
        getResponse: mockGetResponse,
        getRequest: jest.fn()
    }));
    const mockArgumentsHost = {
        switchToHttp: mockHttpArgumentsHost,
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn()
    };

    //when
    const allExceptionsFilter = new AllExceptionsFilter();
    allExceptionsFilter.catch(exception, mockArgumentsHost);
    
    //then
    expect(mockStatus).toBeCalledWith(expectedResponse.status);
    expect(mockJson).toBeCalledWith({ message: expectedResponse.message })
  })
});
