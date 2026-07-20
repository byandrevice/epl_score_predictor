// Email delivery for verification / password reset.

const dns = require("dns").promises;
const nodemailer = require("nodemailer");

const SMTP_HOST = "smtp.gmail.com";

// Render's container doesn't expose a usable IPv4 interface to Node, so
// nodemailer's own resolver silently skips IPv4 and only tries IPv6, which
// fails to route (ENETUNREACH). Resolving the A record ourselves and handing
// nodemailer the literal IP sidesteps that check; tls.servername keeps
// certificate validation working when connecting by IP instead of hostname.
let transporterPromise;
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = dns
      .resolve4(SMTP_HOST)
      .then(([ip]) => ip)
      .catch((err) => {
        console.error("IPv4 resolution for SMTP host failed, falling back to hostname:", err.message);
        return SMTP_HOST;
      })
      .then((host) => {
        const transporter = nodemailer.createTransport({
          host,
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: { servername: SMTP_HOST },
        });

        transporter.verify((error) => {
          if (error) {
            console.error("SMTP failed:", error);
          } else {
            console.log("SMTP ready");
          }
        });

        return transporter;
      });
  }
  return transporterPromise;
}

const sendVerificationEmail = async (email, code) => {
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your PremPredict Account",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  });
};

const sendResetPasswordEmail = async (email, code) => {
  const transporter = await getTransporter();
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