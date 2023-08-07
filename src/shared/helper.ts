import { ApiError } from '@/exceptions';

const isError = (err: any): err is ApiError => {
  return err instanceof ApiError;
};

export { isError };
