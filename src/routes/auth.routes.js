
import express from "express";
import { body } from "express-validator";

import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { register, login, me } from "../controllers/auth.controller.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("fatherName").trim().notEmpty().withMessage("Father's name is required."),
  body("motherName").trim().notEmpty().withMessage("Mother's name is required."),
  body("dateOfBirth").isISO8601().toDate().withMessage("Date of birth must be a valid ISO date (YYYY-MM-DD)."),
  body("placeOfBirth").trim().notEmpty().withMessage("Place of birth is required."),
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),
];

router.post(
  "/register",
  upload.single("idPhoto"),
  registerValidation,
  validate,
  register
);

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

// ---------------------------------------------------------------------------
// GET /api/auth/me  (protected)
// ---------------------------------------------------------------------------
router.get("/me", authenticate, me);

export default router;