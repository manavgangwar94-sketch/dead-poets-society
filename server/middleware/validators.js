import { body, validationResult } from "express-validator";

/**
 * Validation rules for user registration
 * Ensures strong password and valid email format
 */
export const validateRegister = [
  body("displayName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Display name must be 2-50 characters"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail() // Remove dots and plus addressing
    .toLowerCase(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

/**
 * Validation rules for creating a post
 */
export const validateCreatePost = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be 3-100 characters"),

  body("message")
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage("Content must be 10-10000 characters"),

  body("tags")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Maximum 5 tags allowed")
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every((t) => typeof t === "string" && t.length <= 20);
    })
    .withMessage("Each tag must be a string with max 20 characters"),
];

/**
 * Validation rules for updating user profile
 */
export const validateUpdateProfile = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Display name must be 2-50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
];

/**
 * Validation rules for password change
 */
export const validateChangePassword = [
  body("currentPassword")
    .isLength({ min: 8 })
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "New password must contain uppercase, lowercase, number, and special character"
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

/**
 * Middleware to handle validation errors
 * Runs after all validation rules and returns errors if any
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  next();
};
