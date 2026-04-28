// =============================================================================
// src/utils/supabase.js — Supabase Client + Storage Helper (ESM Version)
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // Service role bypasses RLS for server-side ops
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "identity-photos";

/**
 * Upload a user's ID photo to Supabase Storage.
 *
 * @param {Buffer} fileBuffer   - Raw file data from multer (req.file.buffer)
 * @param {string} originalName - Original filename from the upload
 * @param {string} mimetype     - MIME type (e.g. "image/jpeg")
 * @returns {Promise<string>}   - Public URL of the uploaded file
 */
export async function uploadIdPhoto(fileBuffer, originalName, mimetype) {
  const ext      = path.extname(originalName) || ".jpg";
  const fileName = `${uuidv4()}${ext}`;
  const filePath = `id-photos/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete a previously uploaded ID photo by its public URL.
 *
 * @param {string} publicUrl - The public URL returned by uploadIdPhoto
 */
export async function deleteIdPhoto(publicUrl) {
  // Extract the path segment after the bucket name
  const marker = `/${BUCKET}/`;
  const idx    = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const filePath = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([filePath]);
}