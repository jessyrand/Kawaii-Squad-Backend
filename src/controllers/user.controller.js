// =============================================================================
// src/controllers/user.controller.js — Authenticated User Actions
// =============================================================================

import prisma from "../utils/prisma.js";

// ---------------------------------------------------------------------------
// GET /api/user/profile
// Returns the authenticated user's own profile
// ---------------------------------------------------------------------------
export async function getProfile(req, res) {
  // Destructure to remove password even if the middleware already sanitized it
  const { password, ...safe } = req.user;
  res.json({ user: safe });
}

// ---------------------------------------------------------------------------
// GET /api/user/status
// Lightweight endpoint for polling identity status
// ---------------------------------------------------------------------------
export async function getStatus(req, res) {
  res.json({
    status          : req.user.status,
    rejectionReason : req.user.rejectionReason || null,
  });
}