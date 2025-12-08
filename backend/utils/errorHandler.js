/**
 * Custom error classes for better error handling
 */

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class APIError extends AppError {
  constructor(message, status = 500) {
    super(message, status);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  console.error(`[ERROR] ${err.name}: ${message}`, {
    status,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  APIError,
  errorHandler
};
