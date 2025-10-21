// src/controllers/userController.js
const User = require("../models/User");
const {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
} = require("../middlewares/cloudinary");


/**
 * @desc Get all users (Admin only)
 * @route GET /api/users
 * @access Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -confirmPassword");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get a single user
 * @route GET /api/users/:id
 * @access Private (self or admin)
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select(
      "-password -confirmPassword"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.auth.id !== user._id.toString() && req.auth.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Toggle anonymous mode
 * @route PATCH /api/users/anonymous
 * @access Private
 */
const toggleAnonymous = async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isAnonymous = !user.isAnonymous;
    await user.save();

    res.status(200).json({
      message: `Anonymous mode ${user.isAnonymous ? "enabled" : "disabled"}`,
      isAnonymous: user.isAnonymous,
    });
  } catch (error) {
    console.error("Toggle anonymous error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: delete avatar
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
      user.avatar = undefined;
    }

    // Soft deactivate
    user.isActive = false;
    user.deactivatedAt = new Date();

    // Anonymize sensitive info
    user.email = `deactivated_${user._id}@example.com`;
    user.firstName = "Deactivated";
    user.lastName = "User";
    user.alias = "Anonymous";

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Account deactivated successfully",
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const reactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already active
    if (user.isActive) {
      return res.status(400).json({ message: "Account is already active" });
    }

    // Reactivate
    user.isActive = true;
    user.deactivatedAt = null;

    // Optionally restore anonymized fields
    if (user.email.startsWith("deactivated_")) {
      user.email = undefined; // force user to set new email on next login
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Account reactivated successfully",
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Reactivate account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/users/delete
 * @access Private
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    // Optionally delete related data
    await Promise.all([
      Post.deleteMany({ author: user._id }),
      Comment.deleteMany({ author: user._id }),
      Like.deleteMany({ userId: user._id }),
    ]);

    await user.deleteOne();

    res.status(200).json({ message: "Account permanently deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get current user (me)
 * @route GET /api/users/me
 * @access Private
 */

module.exports = {
  getAllUsers,
  getUserById,
  toggleAnonymous,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
};
