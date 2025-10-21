require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/database");
const app = require("./app"); // ✅ Import centralized Express setup

// === Initialize Database ===
connectDB();

// === Create HTTP Server ===
const server = http.createServer(app);

// === Initialize Socket.io ===
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ Replace with your frontend origin in production
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// === Attach Socket.io to App for Global Access ===
app.set("io", io);
io.userSocketMap = new Map(); // To track connected users

// === Handle Socket Events ===
io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("registerUser", (userId) => {
    io.userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered on socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    // Remove user from map
    for (const [userId, id] of io.userSocketMap.entries()) {
      if (id === socket.id) {
        io.userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 PlanAmWell API running on http://localhost:${PORT}`)
);

// === Handle Unhandled Promise Rejections ===
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
