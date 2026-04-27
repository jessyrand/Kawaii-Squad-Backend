import { prisma } from "@prisma/client"

function errorHandler(err, _req, res, _next) {
  console.error("Error:", err);

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token has expired." });
  }
}

module.exports = { errorHandler };