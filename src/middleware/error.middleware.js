import { Prisma } from "@prisma/client";

export function errorHandler(err, _req, res, _next) {
  console.error("❌ Error:", err);

  // Multer file-size / file-type errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large. Maximum size is 5 MB." });
  }

  if (err.message && err.message.includes("Only JPEG")) {
    return res.status(415).json({ message: err.message });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(409).json({ message: `A user with this ${field} already exists.` });
    }

    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found." });
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token." });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token has expired." });
  }

  // Generic error fallback
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  return res.status(status).json({ message });
}