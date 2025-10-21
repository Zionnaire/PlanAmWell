const express = require("express");
const doctorRouter = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  updateDocProfile,
  toggleAnonymous,
  deleteAccount,
  getMe,
} = require("../controllers.js/doctorController");

const { verifyToken, authorize } = require("../middlewares/auth");

// 🧠 Protected doctor routes
doctorRouter.get("/me", verifyToken, getMe);
doctorRouter.put("/update", verifyToken, updateDocProfile);
doctorRouter.patch("/anonymous", verifyToken, toggleAnonymous);
doctorRouter.delete("/delete", verifyToken, deleteAccount);

// 👑 Admin routes
doctorRouter.get("/", verifyToken, authorize("admin"), getAllDoctors);
doctorRouter.get("/:id", verifyToken, getDoctorById);

module.exports = doctorRouter;
