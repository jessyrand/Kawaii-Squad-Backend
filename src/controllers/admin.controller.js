// =============================================================================
// src/controllers/admin.controller.js — Admin Operations
// =============================================================================

import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import { sendConfirmationEmail, sendRejectionEmail } from "../services/email.service.js";

// ---------------------------------------------------------------------------
// POST /api/admin/create
// Create an admin account — protected by ADMIN_MASTER_SECRET or existing admin
// ---------------------------------------------------------------------------
export async function createAdmin(req, res, next) {
  try {
    const { fullName, fatherName, motherName, dateOfBirth, placeOfBirth, email, password } =
      req.body;

    const hashed = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        fullName,
        fatherName,
        motherName,
        dateOfBirth : new Date(dateOfBirth),
        placeOfBirth,
        email,
        password    : hashed,
        role        : "ADMIN",
        status      : "CONFIRMED", // Admins are auto-confirmed
      },
    });

    const { password: _, ...safe } = admin;
    res.status(201).json({ message: "Admin account created successfully.", admin: safe });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/identities/pending
// List all PENDING identity submissions
// ---------------------------------------------------------------------------
export async function getPendingIdentities(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where  : { status: "PENDING", role: "USER" },
        skip,
        take   : limit,
        orderBy: { createdAt: "asc" },
        select : {
          id          : true,
          fullName    : true,
          fatherName  : true,
          motherName  : true,
          dateOfBirth : true,
          placeOfBirth: true,
          email       : true,
          idPhotoUrl  : true,
          status      : true,
          createdAt   : true,
        },
      }),
      prisma.user.count({ where: { status: "PENDING", role: "USER" } }),
    ]);

    res.json({
      data      : users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/identities
// List ALL identities with optional status filter
// ---------------------------------------------------------------------------
export async function getAllIdentities(req, res, next) {
  try {
    const { status } = req.query;
    const page        = Math.max(1, parseInt(req.query.page)  || 1);
    const limit       = Math.min(100, parseInt(req.query.limit) || 20);
    const skip        = (page - 1) * limit;

    const where = { role: "USER" };
    if (status && ["PENDING", "CONFIRMED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take   : limit,
        orderBy: { createdAt: "desc" },
        select : {
          id             : true,
          fullName       : true,
          email          : true,
          status         : true,
          idPhotoUrl     : true,
          rejectionReason: true,
          createdAt      : true,
          updatedAt      : true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data      : users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/identities/:id
// Get a single identity detail for review
// ---------------------------------------------------------------------------
export async function getIdentityById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where : { id: req.params.id },
      select: {
        id             : true,
        fullName       : true,
        fatherName     : true,
        motherName     : true,
        dateOfBirth    : true,
        placeOfBirth   : true,
        email          : true,
        idPhotoUrl     : true,
        role           : true,
        status         : true,
        rejectionReason: true,
        createdAt      : true,
        updatedAt      : true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/identities/:id/approve
// Approve a PENDING identity → CONFIRMED + send email
// ---------------------------------------------------------------------------
export async function approveIdentity(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user)           return res.status(404).json({ message: "User not found." });
    if (user.role === "ADMIN") return res.status(400).json({ message: "Cannot change admin status." });
    if (user.status !== "PENDING") {
      return res.status(409).json({
        message: `Identity is already ${user.status}. Only PENDING identities can be approved.`,
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data : { status: "CONFIRMED", rejectionReason: null },
    });

    // Fire-and-forget email
    sendConfirmationEmail({ email: updated.email, fullName: updated.fullName }).catch((e) =>
      console.error("Confirmation email failed:", e.message)
    );

    const { password: _, ...safe } = updated;
    res.json({ message: "Identity confirmed successfully. Notification email sent.", user: safe });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/identities/:id/reject
// Reject a PENDING identity → REJECTED + send email with reason
// ---------------------------------------------------------------------------
export async function rejectIdentity(req, res, next) {
  try {
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user)           return res.status(404).json({ message: "User not found." });
    if (user.role === "ADMIN") return res.status(400).json({ message: "Cannot change admin status." });
    if (user.status !== "PENDING") {
      return res.status(409).json({
        message: `Identity is already ${user.status}. Only PENDING identities can be rejected.`,
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data : { status: "REJECTED", rejectionReason: reason },
    });

    sendRejectionEmail({
      email   : updated.email,
      fullName: updated.fullName,
      reason,
    }).catch((e) => console.error("Rejection email failed:", e.message));

    const { password: _, ...safe } = updated;
    res.json({ message: "Identity rejected. Notification email sent.", user: safe });
  } catch (err) {
    next(err);
  }
}