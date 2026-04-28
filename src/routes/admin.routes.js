import express from "express";
import { body } from "express-validator";

import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createAdmin,
  getPendingIdentities,
  getAllIdentities,
  getIdentityById,
  approveIdentity,
  rejectIdentity,
} from "../controllers/admin.controller.js";

const router = express.Router();

function masterSecretGuard(req, res, next) {
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== process.env.ADMIN_MASTER_SECRET) {
    return res.status(401).json({ message: "Invalid or missing admin master secret." });
  }
  next();
}

const adminCreateValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("fatherName").trim().notEmpty().withMessage("Father's name is required."),
  body("motherName").trim().notEmpty().withMessage("Mother's name is required."),
  body("dateOfBirth").isISO8601().toDate().withMessage("Valid ISO date required."),
  body("placeOfBirth").trim().notEmpty().withMessage("Place of birth is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

router.post(
  "/create",
  (req, res, next) => {
    if (req.headers["x-admin-secret"]) return masterSecretGuard(req, res, next);
    authenticate(req, res, () => requireRole("ADMIN")(req, res, next));
  },
  adminCreateValidation,
  validate,
  createAdmin
);

router.use(authenticate, requireRole("ADMIN"));

router.get("/identities/pending", getPendingIdentities);

router.get("/identities", getAllIdentities);

router.get("/identities/:id", getIdentityById);

router.patch("/identities/:id/approve", approveIdentity);

router.patch(
  "/identities/:id/reject",
  [body("reason").trim().notEmpty().withMessage("A rejection reason is required.")],
  validate,
  rejectIdentity
);

export default router;