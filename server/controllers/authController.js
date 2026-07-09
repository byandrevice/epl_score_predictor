// Auth endpoints.
// TODO(Gia): implement using models/User, bcryptjs, jsonwebtoken, and
// services/emailService. Enforce password complexity server-side.

const jwt = require("jsonwebtoken"); // A library for creating and verifying JWTs (JSON Web Tokens)-the "ticket" that proves someone is logged in.
const User = require("../models/User"); // This file can look up and create user records.
const { sendVerificationEmail } = require("../services/emailService"); // sendVerificationEmail

function signToken(user) { // Helper function, produces a login token for that user.
                           // When someone logs in successfully you call this function, and it hands back a long encoded string (the JWT).
  return jwt.sign(
    {id: user._id.toString(), user: user.username }, // The data that baked into the token to identify who's making a request later.
    process.env.JWT_SECRET, // Private key store in your .env file, known only to your server. 
                            // It's used to sign the token - basically stamping it so your server can later verify "yes, I made this token, it hasn't been tampered with." 
                            // If someone doesn't have this secret, they can't forge a valid token.
    {expiresIn: "7d"}
  );
}

exports.register = async (req, res, next) => {
  // TODO: create user, hash password, send verification email
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existing) {

      if (!existing.isVerified) {
        await User.deleteOne({ _id: existing._id });
      } else {
        return res.status(409).json({
          success: false,
          message: "Email or username already exists."
        });
      }
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password,
      verificationCode,
    });

    await user.save(); // Write the new user to the database. Before this line runs, user only exists in memory (in the server's code)
                       // .save() is a MOngoose method that inserts it into MongoDB
                       // await matters here because .save() ia asynchronous-talking to a database takes time, so Node doesn't not freeze and wait by defult.
                       // await tell the code "pause this function right here until the save actually finishes" before moving on to the next line.
                       // Without await, the code might try to respond to the request before the user is actually saved.
    
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({ success: true, message: "Account created. Please check your email for the verification code." });
  } catch (err) { // If anything inside try throws an error, grab that error here instead of letting it crash the server.
    next(err); 
    // Handing the caught error off to Express's error-handling middleware(the errorHandler.js file)-which format into a proper JSON error response for the client.
  }
};

exports.login = async (req, res, next) => {
  // TODO: verify credentials, return a JWT
  try {
    const { identity, password } = req.body; // identity = email OR username

    if (!identity || !password) {
      return res.status(400).json({ success: false, message: "Email/username and password are required."});
    }

    const user = await User.findOne({
      $or: [{ email: identity.toLowerCase() }, { username: identity }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.status(200).json({ success: true, token});
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res) => {
  // TODO: check the verification code, mark the user verified
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code."
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resendCode = async (req, res) => {
  // TODO: regenerate + email a new verification code
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationCode = code;

    await user.save();

    // TODO: send email
    console.log("Verification Code:", code);

    res.json({
      success: true,
      message: "Verification code resent."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  // TODO: email a password-reset code/link
  try {

    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const resetCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = resetCode;

    await user.save();

    console.log("Reset Code:", resetCode);

    res.json({
      success: true,
      message: "Password reset code generated."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  // TODO: validate the reset token, set a new (hashed) password
  try {

    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code."
      });
    }

    user.password = newPassword;
    user.verificationCode = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};
