const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType", // can reference User or Doctor dynamically
      required: true,
    },
    userType: {
      type: String,
      required: false,
enum: ["User", "Doctor", "user", "doctor"],
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto cleanup

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
