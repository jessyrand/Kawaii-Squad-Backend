import prisma from "../utils/prisma.js";
import { uploadIdPhoto } from "../utils/supabase.js";

export async function createCin(req, res, next) {
  try {
    const userId = req.user.id;

    // Prevent duplicate CIN — one CIN per user
    const existing = await prisma.CIN.findUnique({ where: { userId } });
    if (existing) {
      return res.status(409).json({
        message: "A CIN already exists for this user.",
        cin: formatCin(existing, req.user),
      });
    }

    // Upload photo to Supabase Storage
    if (!req.file) {
      return res.status(422).json({ message: "A CIN photo is required." });
    }

    const cinPhotoUrl = await uploadIdPhoto(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const cin = await prisma.CIN.create({
      data: {
        userId,
        cinPhotoUrl,
      },
    });

    return res.status(201).json({
      message: "CIN created successfully.",
      cin: formatCin(cin, req.user),
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyCin(req, res, next) {
  try {
    const cin = await prisma.CIN.findUnique({ where: { userId: req.user.id } });

    if (!cin) {
      return res.status(404).json({ message: "No CIN found for this user." });
    }

    return res.json({ cin: formatCin(cin, req.user) });
  } catch (err) {
    next(err);
  }
}

function formatCin(cin, user) {
  return {
    cinId       : cin.id,
    cinPhotoUrl : cin.cinPhotoUrl,
    issuedAt    : cin.createdAt,
    updatedAt   : cin.updatedAt,
    owner: {
      id          : user.id,
      fullName    : user.fullName,
      fatherName  : user.fatherName,
      motherName  : user.motherName,
      dateOfBirth : user.dateOfBirth,
      placeOfBirth: user.placeOfBirth,
      email       : user.email,
      status      : user.status,
      idPhotoUrl  : user.idPhotoUrl,
    },
  };
}
