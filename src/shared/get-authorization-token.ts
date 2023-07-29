import { Request } from 'express';

import { ApiError } from '@/exceptions';

const getAuthorizationToken = (req: Request) => {
  if (typeof req.headers.authorization === 'undefined') {
    throw ApiError.UnauthorizeError();
  }

  return req.headers.authorization?.split(' ')[1] || '';
};

export default getAuthorizationToken;
