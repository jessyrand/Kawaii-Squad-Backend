const bcrypt              = require("bcryptjs");
const prisma              = require("../utils/prisma");
const { signToken }       = require("../utils/jwt");
const { uploadIdPhoto }   = require("../utils/supabase");

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