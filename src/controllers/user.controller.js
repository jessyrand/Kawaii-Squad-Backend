import prisma from "../utils/prisma.js";

export async function getProfile(req, res) {
  const { password, ...safe } = req.user;
  res.json({ user: safe });
}

export async function getStatus(req, res) {
  res.json({
    status          : req.user.status,
    rejectionReason : req.user.rejectionReason || null,
  });
}