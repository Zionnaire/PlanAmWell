const Comment = require("../models/Comment");
const CommunityPost = require("../models/CommunityPost");
const {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
} = require("../middlewares/cloudinary");

// ==========================================================
// CREATE COMMENT OR REPLY
// ==========================================================
const createComment = async (req, res) => {
  try {
    const { postId, content, isAnonymous, alias, parentComment } = req.body;
    const userId = req.auth.id || req.auth.userId;
    const role = req.auth.role || "User";

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    if (!content && !req.files?.media) {
      return res.status(400).json({ message: "Content or media is required" });
    }

    let mediaUploads = [];

    // 🔹 Handle file upload (image / video / doc)
    if (req.files && req.files.media) {
      const file = req.files.media;
      const mimetype = file.mimetype;
      let uploadResult;

      if (mimetype.startsWith("image/")) {
        uploadResult = await uploadToCloudinary(file.data, "comments/images");
        mediaUploads.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          type: "image",
        });
      } else if (mimetype.startsWith("video/")) {
        uploadResult = await uploadVideoToCloudinary(file.data, "comments/videos");
        mediaUploads.push({
          url: uploadResult.videoUrl,
          publicId: uploadResult.videoCldId,
          type: "video",
        });
      } else {
        uploadResult = await uploadDocumentToCloudinary(
          file.data,
          "comments/docs",
          mimetype
        );
        mediaUploads.push({
          url: uploadResult.fileUrl,
          publicId: uploadResult.fileCldId,
          type: "document",
        });
      }
    }

    // 🔹 Create comment document
    const newComment = await Comment.create({
      post: postId,
      author: { id: userId, type: role },
      content,
      media: mediaUploads,
      isAnonymous: isAnonymous || false,
      alias: alias || null,
      parentComment: parentComment || null,
    });

    // 🔹 Update parent post or comment properly
    if (parentComment) {
      // Add this comment ID to the parent's replies array
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: newComment._id },
      });
    } else {
      await CommunityPost.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    }

    // Populate author before sending response
    await newComment.populate("author.id", "firstName lastName avatar role");

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ message: "Error creating comment" });
  }
};

// ==========================================================
// GET COMMENTS FOR A POST (top-level only)
// ==========================================================
const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("author.id", "firstName lastName avatar role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};


// ==========================================================
// GET REPLIES FOR A SPECIFIC COMMENT
// ==========================================================
const getRepliesByComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const parent = await Comment.findById(commentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const replies = await Comment.find({ parentComment: commentId })
      .populate("author.id", "firstName lastName avatar role")
      .sort({ createdAt: 1 }); // oldest first — makes threading natural

    res.status(200).json({
      message: "Replies fetched successfully",
      parentComment: commentId,
      totalReplies: replies.length,
      replies,
    });
  } catch (error) {
    console.error("Get Replies Error:", error);
    res.status(500).json({ message: "Error fetching replies" });
  }
};

// ==========================================================
// LIKE / UNLIKE COMMENT
// ==========================================================
const toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.auth.id || req.auth.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasLiked = comment.likes.includes(userId);
    if (hasLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: hasLiked ? "Comment unliked" : "Comment liked",
      totalLikes: comment.likes.length,
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// ==========================================================
// DELETE COMMENT (Recursive deletion of replies & media)
// ==========================================================
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.auth.id || req.auth.userId;
    const role = req.auth.role || "User";

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author or admin can delete
    if (comment.author.id.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete comment" });
    }

    // 🔹 Recursive deletion helper
    const deleteRecursively = async (id) => {
      const current = await Comment.findById(id);
      if (!current) return;

      // Delete media from Cloudinary
      for (const m of current.media) {
        if (m.publicId) await deleteFromCloudinary(m.publicId);
      }

      // Find and delete replies recursively
      const replies = await Comment.find({ parentComment: id });
      for (const reply of replies) {
        await deleteRecursively(reply._id);
      }

      await current.deleteOne();
    };

    await deleteRecursively(commentId);

    // 🔹 Update parent or post after deletion
    if (!comment.parentComment) {
      await CommunityPost.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -1 },
      });
    } else {
      // Pull deleted comment from parent's replies array
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    res.status(200).json({ message: "Comment and its replies deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

module.exports = {
  createComment,
  getCommentsForPost,
  getRepliesByComment,
  toggleLike,
  deleteComment,
};
