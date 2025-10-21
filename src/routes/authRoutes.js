const express = require("express");
const authRouter = express.Router();


const {
  register,
  login,
  socialAuth,
  refresh,
  updateProfile,
  logout,
  getMe,
} = require("../controllers.js/authController");

const { verifyToken } = require("../middlewares/auth");

// @route   POST /api/auth/register
// @desc    Register a new user or doctor
// @access  Public
authRouter.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login a user or doctor
// @access  Public
authRouter.post("/login", login);

// @route   POST /api/auth/social
// @desc    Social login (Google/Facebook)
// @access  Public
authRouter.post("/social", socialAuth);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
authRouter.post("/refresh", refresh);

authRouter.put("/update", verifyToken, updateProfile);


// @route   POST /api/auth/logout
// @desc    Logout and revoke refresh token
// @access  Public
authRouter.post("/logout", verifyToken, logout);

// @route   GET /api/auth/me
// @desc    Get authenticated user profile
// @access  Private
authRouter.get("/me", verifyToken, getMe);

module.exports = authRouter;
