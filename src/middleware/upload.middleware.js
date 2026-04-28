// =============================================================================
// src/middleware/upload.middleware.js — Multer (in-memory for Supabase upload)
// =============================================================================

import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES     = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),             // Keep in RAM, then push to Supabase
  limits : { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are accepted for ID photos."));
    }
  },
});

export default upload;