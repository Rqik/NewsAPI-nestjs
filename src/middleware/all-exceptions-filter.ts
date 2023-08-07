import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiError } from '@/exceptions';
import { HttpStatuses } from '@/shared';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // eslint-disable-next-line class-methods-use-this
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatuses.INTERNAL_SERVER;
    console.log(exception);

    if (exception instanceof ApiError && status === HttpStatuses.NOT_FOUND) {
      return res.status(status).send(exception.message);
    }

    if (exception instanceof ApiError) {
      return res.status(status).json({
        message: exception.message,
        error: exception.errors,
        statusCode: status,
      });
    }

    if (exception instanceof HttpException)
      return res.status(status).send(exception.getResponse());

    return res.status(status).json({ message: 'Unexpected error' });
  }
}
