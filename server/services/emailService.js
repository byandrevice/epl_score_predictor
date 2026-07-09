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

module.exports = { sendVerificationEmail };