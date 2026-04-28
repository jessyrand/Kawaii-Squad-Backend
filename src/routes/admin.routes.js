// =============================================================================
// src/routes/admin.routes.js
// =============================================================================

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

// ---------------------------------------------------------------------------
// Master-secret middleware — used for the bootstrap admin creation endpoint
// ---------------------------------------------------------------------------
function masterSecretGuard(req, res, next) {
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== process.env.ADMIN_MASTER_SECRET) {
    return res.status(401).json({ message: "Invalid or missing admin master secret." });
  }
  next();
}

// ---------------------------------------------------------------------------
// POST /api/admin/create
// Bootstrap: create the very first admin (no JWT needed, just the master secret)
// OR: an existing admin can create more admins (JWT + ADMIN role)
// ---------------------------------------------------------------------------
const adminCreateValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("fatherName").trim().notEmpty().withMessage("Father's name is required."),
  body("motherName").trim().notEmpty().withMessage("Mother's name is required."),
  body("dateOfBirth").isISO8601().toDate().withMessage("Valid ISO date required."),
  body("placeOfBirth").trim().notEmpty().withMessage("Place of birth is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

// Accepts either the master secret OR an authenticated admin JWT
router.post(
  "/create",
  (req, res, next) => {
    // If master secret header is present, use that guard
    if (req.headers["x-admin-secret"]) return masterSecretGuard(req, res, next);
    // Otherwise fall through to JWT + RBAC
    authenticate(req, res, () => requireRole("ADMIN")(req, res, next));
  },
  adminCreateValidation,
  validate,
  createAdmin
);

// ---------------------------------------------------------------------------
// All routes below are protected: JWT required + ADMIN role
// ---------------------------------------------------------------------------
router.use(authenticate, requireRole("ADMIN"));

// GET  /api/admin/identities/pending   — paginated list of PENDING users
router.get("/identities/pending", getPendingIdentities);

// GET  /api/admin/identities           — all users, optional ?status= filter
router.get("/identities", getAllIdentities);

// GET  /api/admin/identities/:id       — single user detail
router.get("/identities/:id", getIdentityById);

// PATCH /api/admin/identities/:id/approve
router.patch("/identities/:id/approve", approveIdentity);

// PATCH /api/admin/identities/:id/reject
router.patch(
  "/identities/:id/reject",
  [body("reason").trim().notEmpty().withMessage("A rejection reason is required.")],
  validate,
  rejectIdentity
);

export default router;