import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../errors/error-codes';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let code: string;
    let message: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const res = exceptionResponse as Record<string, unknown>;

      if (res.code) {
        code = res.code as string;
        message = (res.message as string) || exception.message;
      } else if (
        status === HttpStatus.BAD_REQUEST &&
        Array.isArray(res.message)
      ) {
        code = ErrorCode.VALIDATION_ERROR;
        message = (res.message as string[]).join(', ');
      } else {
        code = this.mapStatusToCode(status);
        message =
          typeof res.message === 'string' ? res.message : exception.message;
      }
    } else {
      code = this.mapStatusToCode(status);
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exception.message;
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
    });
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.DUPLICATE_RESOURCE;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
