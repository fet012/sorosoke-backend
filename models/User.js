const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailOTP: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);