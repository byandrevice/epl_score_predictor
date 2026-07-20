// Email delivery for verification / password reset.
// Sent via Resend's HTTP API (port 443) instead of raw SMTP — Render blocks
// or silently drops outbound SMTP (port 587), which HTTPS never hits since
// the app itself needs that port open to serve traffic.

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail({ to, subject, text, html }) {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

const sendVerificationEmail = async (email, code) => {
  await sendEmail({
    to: email,
    subject: "Verify Your PremPredict Account",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
};

const sendResetPasswordEmail = async (email, code) => {
  await sendEmail({
    to: email,
    subject: "PremPredict Password Reset",
    text: `Your password reset code is: ${code}`,
    html: `
      <p>Your password reset code is:</p>
      <h2>${code}</h2>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
