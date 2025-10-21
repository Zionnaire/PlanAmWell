const express = require("express");
const commentRouter = express.Router();
const { verifyToken } = require("../middlewares/auth");

const {
 createComment,
  getCommentsForPost,
  getRepliesByComment,
  toggleLike,
  deleteComment,
} = require("../controllers.js/commentController");

/**
 * @route POST /api/comments/:postId
 * @desc Create a new comment or reply (if parentComment is provided)
 * @access Private
 */
commentRouter.post("/:postId", verifyToken, createComment);

/**
 * @route GET /api/comments/:postId
 * @desc Get all comments for a specific post (with nested replies if needed)
 * @access Public
 */
commentRouter.get("/:postId", getCommentsForPost);

/**
 * @route GET /api/comments/replies/:commentId
 * @desc Get all replies for a specific comment
 * @access Public
 */
commentRouter.get("/replies/:commentId", getRepliesByComment);

/**
 * @route PUT /api/comments/:commentId/like
 * @desc Like or unlike a comment
 * @access Private
 */
commentRouter.put("/:commentId/like", verifyToken, toggleLike);

/**
 * @route DELETE /api/comments/:commentId
 * @desc Delete a comment (and its replies, likes, and media)
 * @access Private
 */
commentRouter.delete("/:commentId", verifyToken, deleteComment);

module.exports = commentRouter;
