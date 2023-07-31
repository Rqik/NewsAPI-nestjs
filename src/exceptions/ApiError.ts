import HttpStatuses from '../shared/HttpStatuses';

class ApiError extends Error {
  status;

  errors;

  constructor({
    status,
    message,
    errors = [],
  }: {
    status: HttpStatuses;
    message: string;
    errors?: Error[];
  }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static NotFound() {
    return new ApiError({
      status: HttpStatuses.NOT_FOUND,
      message: 'Not Found',
    });
  }

  static UnauthorizeError() {
    return new ApiError({
      status: HttpStatuses.UNAUTHORIZED,
      message: 'User is not authorized',
    });
  }

  static BadRequest(message: string, errors = []) {
    return new ApiError({ status: HttpStatuses.BAD_REQUEST, message, errors });
  }

  static ValidationFailed(errors: Error[] = []) {
    return new ApiError({
      status: HttpStatuses.VALIDATION_FAILED,
      message: 'Validation error.',
      errors,
    });
  }

  static AuthorNotFound() {
    return new ApiError({
      status: HttpStatuses.NOT_FOUND,
      message: 'Author not found',
    });
  }

  static CategoryNotFound() {
    return new ApiError({
      status: HttpStatuses.NOT_FOUND,
      message: 'Category not found',
    });
  }

  static PostsNotFound() {
    return new ApiError({
      status: HttpStatuses.NOT_FOUND,
      message: 'Post not found',
    });
  }

  static DraftNotFound() {
    return new ApiError({
      status: HttpStatuses.NOT_FOUND,
      message: 'Draft not found',
    });
  }
}

export default ApiError;
