const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "sender.type" },
      type: { type: String, required: true, enum: ["User", "Doctor"] },
    },
    isAnonymous: { type: Boolean, default: false },
    alias: { type: String },
    content: { type: String },
    file: { type: String },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
