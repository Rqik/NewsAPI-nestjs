const enum HttpStatuses {
  OK_200 = 200,
  CREATED_201 = 201,
  NO_CONTENT_204 = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  VALIDATION_FAILED = 422,

  INTERNAL_SERVER = 500,
}

export default HttpStatuses;
