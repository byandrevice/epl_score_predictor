// Email delivery for verification / password reset.
// TODO(Gia): configure nodemailer with the EMAIL_* env vars and send real mail.

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Same ENETUNREACH/IPv6 issue as the Mongo connection: some hosts (e.g.
  // smtp.gmail.com) resolve to an IPv6 address that Render can't reach
  // outbound. Force IPv4 for this socket explicitly.
  family: 4,
});

const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your PremPredict Account",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  });
};

const sendResetPasswordEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "PremPredict Password Reset",
    text: `Your password reset code is: ${code}`,
    html: `
      <p>Your password reset code is:</p>
      <h2>${code}</h2>
    `
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };