import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface IUserAuthInfoRequest extends Request {
  user2: string | JwtPayload; // or any other type
}

export default IUserAuthInfoRequest;
