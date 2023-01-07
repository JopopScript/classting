import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { DatabaseError } from './Database.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly BAD_REQUEST_ERROR_MESSAGE = 'Bad Request Exception';
  private readonly UKNOWN_ERROR_MESSAGE = '알수없는 오류가 발생했습니다. 다시 한번 시도해보시고 동일한 문제가 반복된다면 문의 부탁드립니다.';

  catch(exception: ValidationError[] | HttpException | DatabaseError | Error, host: ArgumentsHost) {
    Logger.debug(`AllExceptionsFilter call`);
    if (this.isValidationErrors(exception)) {
      exception.forEach(e => {
        Logger.debug(`exception.constructor: `, JSON.stringify(e.constructor.name));
        Logger.debug(`exception: `, JSON.stringify(exception));
      });
    } else {
      Logger.debug(`exception.constructor: `, JSON.stringify(exception.constructor.name));
      Logger.debug(`exception.message: `, JSON.stringify(exception.message));
      Logger.debug(`exception?.stack: `, JSON.stringify(exception?.stack));
    }

    const { status, message } = this.makeErrorResponse(exception);   
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    response.status(status).json({ message })
  }

  private isValidationErrors(exception: ValidationError[] | HttpException | DatabaseError | Error): exception is ValidationError[] {
    if (Array.isArray(exception) && exception.every(e => e instanceof ValidationError)) {
      return true
    }
    return false
  }

  private makeErrorResponse(exception: ValidationError[] | HttpException | DatabaseError | Error): { status: number, message: string} {
    if (this.isValidationErrors(exception)) {
      return { status: 404, message: this.BAD_REQUEST_ERROR_MESSAGE }
    } else if (exception instanceof HttpException) {
      return { status: exception.getStatus(), message: exception.message }
    } else if (exception instanceof DatabaseError) {
      const message = exception?.describe ?? this.UKNOWN_ERROR_MESSAGE;
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message }
    } else { //exception instanceof Error
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: this.UKNOWN_ERROR_MESSAGE}
    }
  }
}