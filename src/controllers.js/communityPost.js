const CommunityPost = require("../models/CommunityPost");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const {  uploadToCloudinary,
  uploadVideoToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary
 } = require("../middlewares/cloudinary");


// -------------------------
// 🔹 CREATE POST
// -------------------------
const createPost = async (req, res) => {
  try {
    const { content, tags, category, isAnonymous, alias } = req.body;
    const files = req.files;
    const userId = req.auth?.sub || req.auth?.id || req.auth?.userId || req.user?.id || req.userId;
    const role = req.user?.role || req.auth?.role;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!content?.trim() && !files)
      return res.status(400).json({ message: "Post content or media is required" });

    // 🧩 Determine author model
    const authorModel = role === "doctor" ? Doctor : User;
    const author = await authorModel.findById(userId);
    if (!author) return res.status(404).json({ message: "Author not found" });

    // 🖼️ Upload media if any
    let mediaUploads = [];
    if (files && Object.keys(files).length > 0) {
      const uploadPromises = Object.values(files).map(async (file) => {
        const buffer = file.data;
        const mime = file.mimetype;

        if (!buffer || !Buffer.isBuffer(buffer)) {
          throw new Error(`Invalid file buffer for ${file.name}`);
        }

        let result;
        let type;

        if (mime.startsWith("video/")) {
          result = await uploadVideoToCloudinary(buffer, "community_posts/videos");
          type = "video";
        } else if (/(pdf|docx?|txt)/i.test(mime)) {
          result = await uploadDocumentToCloudinary(buffer, "community_posts/documents", mime);
          type = "document";
        } else if (mime.startsWith("image/")) {
          result = await uploadToCloudinary(buffer, "community_posts/images");
          type = "image";
        } else {
          throw new Error(`Unsupported file type: ${mime}`);
        }

        return {
          url: result.secure_url,
          publicId: result.public_id,
          type,
        };
      });

      mediaUploads = await Promise.all(uploadPromises);
    }

    // 🆕 Create post
    const newPost = await CommunityPost.create({
      author: { id: userId, type: role },
      content,
      media: mediaUploads,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      category: category || "general",
      isAnonymous: isAnonymous ?? false,
      alias: alias || (isAnonymous ? "Anonymous" : undefined),
    });

    // 🧵 Link post to author
    author.posts = author.posts || [];
    author.posts.push(newPost._id);
    await author.save({ validateBeforeSave: false });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({
      message: "Failed to create post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// -------------------------
// 🔹 GET ALL POSTS
// -------------------------
const getAllPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .populate("author.id", "firstName lastName avatar role");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// -------------------------
// 🔹 GET MY POSTS
// -------------------------
const getMyPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ "author.id": req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your posts" });
  }
};

// -------------------------
// 🔹 LIKE / UNLIKE POST
// -------------------------
const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to like/unlike post" });
  }
};

// -------------------------
// 🔹 DELETE POST
// -------------------------
const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    // Delete media from Cloudinary
    const deletePromises = post.media.map((m) =>
      cloudinary.uploader.destroy(m.publicId, {
        resource_type: m.type === "video" ? "video" : m.type === "document" ? "raw" : "image",
      })
    );
    await Promise.all(deletePromises);

    // Remove post from author's posts
    const authorModel = req.user.role === "doctor" ? Doctor : User;
    await authorModel.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  likePost,
  deletePost
}