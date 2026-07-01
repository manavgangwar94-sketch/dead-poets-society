import { logger } from "../utils/logger.js";

/**
 * Global error handling middleware
 * Catches all errors and returns appropriate responses
 * Never exposes sensitive error details in production
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const nodeEnv = process.env.NODE_ENV || "development";

  // Log the error with details
  logger.error(`${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    stack: err.stack,
    body: req.body && !req.body.password ? req.body : "***REDACTED***",
  });

  // In production, don't expose internal error details
  const message =
    nodeEnv === "production"
      ? "Something went wrong. Please try again later."
      : err.message;

  res.status(statusCode).json({
    error: err.name || "Error",
    message,
    ...(nodeEnv === "development" && { stack: err.stack }),
    ...(nodeEnv === "development" && { details: err.details }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  logger.warn(`404 Not Found`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
};

/**
 * Request validation error handler
 */
export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

/**
 * Authentication error handler
 */
export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

/**
 * Authorization error handler
 */
export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = 403;
  }
}

/**
 * Account locked error
 */
export class AccountLockedError extends Error {
  constructor(message = "Account is locked due to too many failed login attempts") {
    super(message);
    this.name = "AccountLockedError";
    this.statusCode = 423; // 423 Locked (WebDAV)
  }
}
