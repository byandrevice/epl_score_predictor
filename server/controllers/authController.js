// Auth endpoints.
// TODO(Gia): implement using models/User, bcryptjs, jsonwebtoken, and
// services/emailService. Enforce password complexity server-side.

exports.register = async (req, res) => {
  // TODO: create user, hash password, send verification email
  res.status(501).json({ message: "register not implemented" });
};

exports.login = async (req, res) => {
  // TODO: verify credentials, return a JWT
  res.status(501).json({ message: "login not implemented" });
};

exports.verifyEmail = async (req, res) => {
  // TODO: check the verification code, mark the user verified
  res.status(501).json({ message: "verifyEmail not implemented" });
};

exports.resendCode = async (req, res) => {
  // TODO: regenerate + email a new verification code
  res.status(501).json({ message: "resendCode not implemented" });
};

exports.forgotPassword = async (req, res) => {
  // TODO: email a password-reset code/link
  res.status(501).json({ message: "forgotPassword not implemented" });
};

exports.resetPassword = async (req, res) => {
  // TODO: validate the reset token, set a new (hashed) password
  res.status(501).json({ message: "resetPassword not implemented" });
};
