const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    favoriteTeam: { type: String, default: "" },
    emailNotifications: { type: Boolean, default: true },
    reminderNotifications: { type: Boolean, default: true },
    // Opt-in flag: when true, other users can view this user's graded
    // prediction history from their public profile (leaderboard click-through).
    // Defaults to false/private so nothing is exposed until the user allows it.
    predictionsPublic: { type: Boolean, default: false },
  }, { timestamps: true });

// Runs automatically right before a document saves.
// ONly re-hashes if the password field actually changed, so re-saving
// a user for an unrelated reason (like isVerified) doesn't hash it twice.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Lets authController do 'user.comparePassword(plaintextPassword)'.
// bcrypt hashes the candidate internally and compares - you never
// reverse the store hash.
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
