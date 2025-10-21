const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String },
    avatar: {
      url: String,
      public_id: String,
    },
    uid: { type: String, required: false, unique: true, sparse: true }, // Firebase UID
    role: { type: String, default: "Doctor" },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    consultationFee: { type: Number, default: 0 },
    availability: [
      {
        day: { type: String },
        from: { type: String },
        to: { type: String },
      },
    ],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stars: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    isAnonymous: { type: Boolean, default: false },
    alias: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // 🔹 New Fields for Posts
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

doctorSchema.virtual("displayName").get(function () {
  if (this.isAnonymous && this.alias) return this.alias;
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

module.exports = mongoose.model("Doctor", doctorSchema);
