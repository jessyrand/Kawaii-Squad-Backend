// =============================================================================
// src/services/email.service.js — Nodemailer Email Service
// =============================================================================

import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transporter — swap this config for any SMTP provider (SendGrid, Resend, etc.)
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host   : process.env.SMTP_HOST,
  port   : Number(process.env.SMTP_PORT) || 587,
  secure : process.env.SMTP_SECURE === "true",
  auth   : {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup (non-fatal — just logs a warning)
transporter.verify().catch((err) =>
  console.warn("⚠️  SMTP connection failed:", err.message)
);

const FROM = process.env.EMAIL_FROM || "Digital Identity <noreply@example.com>";

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------

/**
 * Send an identity-confirmed email to the user.
 * @param {{ email: string, fullName: string }} user
 */
export async function sendConfirmationEmail({ email, fullName }) {
  await transporter.sendMail({
    from   : FROM,
    to     : email,
    subject: "✅ Your Digital Identity Has Been Confirmed",
    html   : `
      <h2>Congratulations, ${fullName}!</h2>
      <p>Your digital identity has been <strong>verified and confirmed</strong> by our team.</p>
      <p>You can now log in to the platform and access all services.</p>
      <br/>
      <p>Thank you for registering with us.</p>
    `,
    text: `Congratulations, ${fullName}!\n\nYour digital identity has been verified and confirmed. You can now log in to the platform.\n\nThank you.`,
  });
}

/**
 * Send an identity-rejected email to the user.
 * @param {{ email: string, fullName: string, reason: string }} params
 */
export async function sendRejectionEmail({ email, fullName, reason }) {
  await transporter.sendMail({
    from   : FROM,
    to     : email,
    subject: "❌ Your Digital Identity Verification Was Rejected",
    html   : `
      <h2>Hello, ${fullName}</h2>
      <p>Unfortunately, your digital identity submission has been <strong>rejected</strong>.</p>
      <h3>Reason:</h3>
      <blockquote style="border-left: 4px solid #e74c3c; padding-left: 12px; color: #555;">
        ${reason}
      </blockquote>
      <p>Please re-register with correct information and a clear photo of your ID document.</p>
      <br/>
      <p>If you believe this is a mistake, please contact support.</p>
    `,
    text: `Hello, ${fullName}\n\nYour digital identity submission has been rejected.\n\nReason: ${reason}\n\nPlease re-register with correct information.`,
  });
}