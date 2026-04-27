import jwt from "jsonwebtoken";

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

if (!SECRET) throw new Error("JWT_SECRET environment variable is not set");

/**
 * Sign a JWT containing the user's id, email, and role.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} Signed JWT string
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
