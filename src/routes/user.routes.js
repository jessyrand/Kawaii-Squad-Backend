// =============================================================================
// src/routes/user.routes.js
// =============================================================================

import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProfile, getStatus } from "../controllers/user.controller.js";

const router = express.Router();

// All user routes require a valid, CONFIRMED identity token
router.use(authenticate);

router.get("/profile", getProfile);
router.get("/status", getStatus);

export default router;