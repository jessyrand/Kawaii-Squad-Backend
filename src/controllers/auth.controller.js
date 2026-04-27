import { bcrypt } from "bcryptjs";
import { prisma } from "../utils/prisma"
import { signToken } from "../utils/jwt"
import { uploadIdPhoto } from "../utils/supabase"

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

async function register(req, res, next) {
  try {
    const {
      fullName,
      fatherName,
      motherName,
      dateOfBirth,
      placeOfBirth,
      email,
      password,
    } = req.body;

    const hashed = await bcrypt.hash(password, 12);

    let idPhotoUrl = null;
    if (req.file) {
      idPhotoUrl = await uploadIdPhoto(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        fatherName,
        motherName,
        dateOfBirth : new Date(dateOfBirth),
        placeOfBirth,
        email,
        password    : hashed,
        idPhotoUrl,
        role        : "USER",
        status      : "PENDING",
      },
    });

    res.status(201).json({
      message: "Registration successful. Your identity is under review.",
      user   : sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    const INVALID_MSG = "Invalid email or password.";

    if (!user) return res.status(401).json({ message: INVALID_MSG });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: INVALID_MSG });

    if (user.status === "PENDING") {
      return res.status(403).json({
        message:
          "Your identity is still under review. You will be notified by email once it is confirmed.",
        status: "PENDING",
      });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        message:
          "Your identity verification was rejected. Please contact support.",
        status  : "REJECTED",
        reason  : user.rejectionReason || null,
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: "Login successful.",
      token,
      user   : sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { register, login, me };