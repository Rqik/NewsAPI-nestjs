import { NextFunction, Request, Response } from 'express';

const loggerMiddleware = (
  err: Error,
  _: Request,
  __: Response,
  next: NextFunction,
) => {
  console.log('res');

  console.error(err);
  next();
};

export default loggerMiddleware;
