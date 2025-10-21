const express = require("express");
const userRouter = express.Router();

const {
  getAllUsers,
  getUserById,
  toggleAnonymous,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  // getMe,
} = require("../controllers.js/userController");

const { verifyToken, authorize } = require("../middlewares/auth");

// 🔍 Add logging middleware
userRouter.use((req, res, next) => {
  console.log(`📍 User Route Hit: ${req.method} ${req.path}`);
  next();
});

// 🧠 Protected user routes
// userRouter.get("/me", verifyToken, getMe);
userRouter.patch("/anonymous", verifyToken, toggleAnonymous);
userRouter.patch("/deactivate", verifyToken, deactivateAccount);
userRouter.patch("/reactivate", verifyToken, reactivateAccount);
userRouter.delete("/delete", verifyToken, deleteAccount);

// 👑 Admin routes
userRouter.get("/", verifyToken, authorize("admin"), getAllUsers);
userRouter.get("/:id", verifyToken, getUserById);

module.exports = userRouter;