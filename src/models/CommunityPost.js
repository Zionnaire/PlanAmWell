const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "author.type" },
      type: {
        type: String,
        enum: ["User", "Doctor"],
        required: true,
        default: "User",
      },
    },
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    media: [
      {
        url: String, // Cloudinary secure_url
        type: {
          type: String,
          enum: ["image", "video", "document"],
          default: "image",
        },
        publicId: String, // Cloudinary public_id (for deletion)
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // ✅ Category now open-ended, no enum restriction
    category: {
      type: String,
      trim: true,
      lowercase: true,
      default: "wellness",
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    // 🔹 For anonymous posting
    isAnonymous: { type: Boolean, default: false },
    alias: { type: String }, // shown if isAnonymous is true
  },
  { timestamps: true }
);

// 🔸 Virtual field for frontend display
communityPostSchema.virtual("displayName").get(function () {
  return this.isAnonymous && this.alias ? this.alias : "Anonymous User";
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
