const mongoose = require("mongoose");

// TODO(Tahje): hash `password` with bcryptjs in a pre-save hook before storing.
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // store the hash, never plain text
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
