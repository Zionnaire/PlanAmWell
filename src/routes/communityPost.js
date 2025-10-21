const express = require("express");
const postRouter = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
  createPost,
  getAllPosts,
  getMyPosts,
  likePost,
  deletePost,
} = require("../controllers.js/communityPost");

postRouter.post("/createPost", verifyToken, createPost);
postRouter.get("/allPosts", getAllPosts);
postRouter.get("/me", verifyToken, getMyPosts);
postRouter.put("/:postId/like", verifyToken, likePost);
postRouter.delete("/:postId", verifyToken, deletePost);

module.exports = postRouter;
