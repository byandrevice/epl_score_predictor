// Email delivery for verification / password reset.
// TODO(Gia): configure nodemailer with the EMAIL_* env vars and send real mail.

exports.sendVerificationCode = async (to, code) => {
  // TODO: send the 6-digit code to `to`
  console.log(`[emailService] would send code ${code} to ${to}`);
};
