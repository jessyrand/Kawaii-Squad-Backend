import { verifyToken } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";

/**
 * authenticate — Validates the Bearer token and attaches the full user record
 * to req.user. Denies PENDING and REJECTED users at the middleware level.
 *
 * This ensures no protected route is ever reached by an unverified identity.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        message: err.name === "TokenExpiredError" ? "Token has expired." : "Invalid token.",
      });
    }

    // Fetch a fresh copy from DB — status may have changed since token was issued
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }

    if (user.status === "PENDING") {
      return res.status(403).json({
        message:
          "Your identity is still under review. Access is granted only after admin confirmation.",
        status: "PENDING",
      });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        message:
          "Your identity verification was rejected. Please contact support or re-register.",
        status: "REJECTED",
        reason: user.rejectionReason || null,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireRole — Factory that produces an RBAC middleware for one or more roles.
 *
 * Usage:  requireRole("ADMIN")
 * requireRole("ADMIN", "USER")
 *
 * Must be used AFTER authenticate.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
}