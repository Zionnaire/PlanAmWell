// src/app.js
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const errorHandler = require("./src/middlewares/errorHandler");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRouters");
const doctorRoutes = require("./src/routes/doctorRouters");
const appointmentRoutes = require("./src/routes/appointmentRouters");
const productRoutes = require("./src/routes/productRouters");
const orderRoutes = require("./src/routes/orderRouters");
const chatRoutes = require("./src/routes/chatRouters");
const communityPostsRoutes = require("./src/routes/communityPost")
const commentForPostRoutes = require("./src/routes/commentRouter")

const app = express();

// === Global Middlewares ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === File Upload ===
app.use(
  fileUpload({
    // FIX: Set to false to keep the file data in the buffer (file.data)
    useTempFiles: false, 
    // Consider lowering this limit since you're now keeping the file in memory
    limits: { fileSize: 5 * 1024 * 1024 }, // Example: 5MB limit
    createParentPath: true,
  })
);

// === API Routes ===
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/communityPost", communityPostsRoutes);
app.use("/api/v1/comment", commentForPostRoutes);
// app.use("/api/v1/appointments", appointmentRoutes);
// app.use("/api/v1/products", productRoutes);
// app.use("/api/v1/orders", orderRoutes);
// app.use("/api/v1/chats", chatRoutes);

// === Error Handler ===
app.use(errorHandler);

module.exports = app;
