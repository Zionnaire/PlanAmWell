const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: true,
    },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "author.type", // can reference either User or Doctor
        required: true,
      },
      type: {
        type: String,
        enum: ["User", "Doctor"],
        default: "User",
      },
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    media: [
      {
        url: String, // Cloudinary URL
        publicId: String, // Cloudinary public_id for deletion
        type: {
          type: String,
          enum: ["image", "video", "document"],
          default: "image",
        },
      },
    ],
    isAnonymous: { type: Boolean, default: false },
    alias: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔹 For threaded replies
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 🔹 Virtual: display name for anonymous users
commentSchema.virtual("displayName").get(function () {
  return this.isAnonymous && this.alias ? this.alias : "Anonymous User";
});

// 🔹 Virtual: replies count
commentSchema.virtual("repliesCount").get(function () {
  return this.replies ? this.replies.length : 0;
});

// 🔹 Optional cleanup hook: auto-remove orphaned replies
commentSchema.pre("remove", async function (next) {
  await this.model("Comment").deleteMany({ parentComment: this._id });
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
