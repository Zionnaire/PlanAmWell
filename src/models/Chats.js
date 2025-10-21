const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "participants.type" },
        type: { type: String, required: true, enum: ["User", "Doctor"] },
      },
    ],
    userIsAnonymous: { type: Boolean, default: false },
    userAlias: { type: String },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCounts: {
      user: { type: Number, default: 0 },
      doctor: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
