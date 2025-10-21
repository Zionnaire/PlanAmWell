const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true, minlength: 6 },
    confirmPassword: { type: String, required: false, minlength: 6 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    bloodGroup: { type: String },
    avatar: {
      url: String,
      public_id: String,
    },
    uid: { type: String, required: false, unique: true, sparse: true }, // Firebase UID
    role: { type: String, default: "user" },
    isAnonymous: { type: Boolean, default: false },
    alias: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
deactivatedAt: { type: Date, default: null },

    medicalHistory: [{ condition: String, since: Date, notes: String }],
    allergies: [{ name: String, severity: String }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    isVerified: { type: Boolean, default: false },

    // 🔹 New Fields for Posts
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  
  { timestamps: true }
);

userSchema.virtual("displayName").get(function () {
  if (this.isAnonymous && this.alias) return this.alias;
  return `${this.firstName || ""} ${this.lastName || ""}`.trim() || "Anonymous";
});

module.exports = mongoose.model("User", userSchema);
