export interface ApiErrorType extends Error {
  statusCode: number;
  isOperational: boolean;
}

class ApiError extends Error {
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack: string = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  statusCode: number;
  isOperational: boolean;
}

export default ApiError;
