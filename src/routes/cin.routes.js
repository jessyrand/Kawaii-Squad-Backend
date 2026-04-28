// =============================================================================
// src/routes/cin.routes.js
// =============================================================================

import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { createCin, getMyCin } from "../controllers/cin.controller.js";

const router = express.Router();

// All CIN routes require a fully confirmed identity (authenticate blocks PENDING/REJECTED)
router.use(authenticate);

// POST /api/cin   — upload a CIN photo and create the record
router.post("/", upload.single("cinPhoto"), createCin);

// GET  /api/cin   — retrieve the current user's CIN
router.get("/", getMyCin);

export default router;
