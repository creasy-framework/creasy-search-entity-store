import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  AppError,
  RequestValidationError,
  ResourceNotFoundError,
  UnexpectedError,
} from './common';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof ResourceNotFoundError) {
      status = HttpStatus.NOT_FOUND;
    }
    if (exception instanceof RequestValidationError) {
      status = HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof UnexpectedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    if (exception instanceof AppError) {
      const context = (exception as AppError<any>).getContext() || {};
      const errorCode = (exception as AppError<any>).getErrorCode();
      response.status(status).json({
        errorCode,
        ...context,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
