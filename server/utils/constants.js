/**
 * Security constants and configuration
 */

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBERS: true,
  REQUIRES_SPECIAL_CHARS: true,
  SPECIAL_CHARS: "@$!%*?&",
};

export const ACCOUNT_SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME_HOURS: 2,
  SESSION_TIMEOUT_MINUTES: 30, // Auto-logout after inactivity
};

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRE: "15m", // Short-lived access token
  REFRESH_TOKEN_EXPIRE: "7d", // Longer-lived refresh token
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  EMAIL: {
    PATTERN: /^\S+@\S+\.\S+$/,
  },
  POST_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  POST_MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10000,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
};

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    WINDOW_MINUTES: 15,
    MAX_REQUESTS: 5,
  },
  GENERAL: {
    WINDOW_MINUTES: 15,
    MAX_REQUESTS: 100,
  },
  POST_CREATION: {
    WINDOW_HOURS: 1,
    MAX_POSTS: 10,
  },
  REGISTRATION: {
    WINDOW_HOURS: 1,
    MAX_REGISTRATIONS: 5,
  },
  PASSWORD_CHANGE: {
    WINDOW_HOURS: 1,
    MAX_ATTEMPTS: 3,
  },
};

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://dead-poets-society-frontend.vercel.app",
  ],
  ALLOWED_METHODS: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  ALLOWED_HEADERS: ["Content-Type", "Authorization"],
};

export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
};
