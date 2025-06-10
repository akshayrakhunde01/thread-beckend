import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle HttpException (e.g. thrown by NestJS or ValidationPipe)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    }

    // Handle MongoDB Duplicate Key Error (code 11000)
    if (
      (exception as any).code === 11000 &&
      (exception as any).name === 'MongoServerError'
    ) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error (e.g., email already exists)';
    }

    // Handle other MongoDB errors
    if (exception instanceof MongoError) {
      message = exception.message;
    }
// console.error(
//   'Exception caught:',
//   typeof exception === 'object' && exception !== null && 'message' in exception
//     ? (exception as any).message
//     : exception
// );
console.error('Exception caught:', (exception as any).message);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
