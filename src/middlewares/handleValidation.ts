import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// Middleware to handle validation errors
const handleValidationError = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array(),
    });
  }
  next();
};

// Validation rules for user registration
export const userRegistrationValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string.")
    .isLength({ max: 50 })
    .withMessage("Max name length is 50.")
    .notEmpty()
    .withMessage("Name is required."),
  body("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .isLength({ max: 100 })
    .withMessage("Max email length is 100.")
    .notEmpty()
    .withMessage("Email is required."),
  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .isLength({ max: 10 })
    .withMessage("Password must be between 10 characters.")
    .notEmpty()
    .withMessage("Password is required."),

  handleValidationError,
] as any;

export const userUpdateValidation = [
  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .isLength({ max: 10 })
    .withMessage("Password must be between 10 characters.")
    .notEmpty()
    .withMessage("Password is required."),

  handleValidationError,
] as any;
