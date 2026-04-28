import { validationResult } from "express-validator";

/**
 * Run after any chain of express-validator check() calls.
 * Returns 422 with a structured error list if validation fails.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors : errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}