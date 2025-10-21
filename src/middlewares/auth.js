const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const RefreshToken = require("../models/RefreshToken");

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET missing from .env");
}

const signJwt = (entity) => {
  const payload = {
    id: entity._id.toString(),
    role: entity.role || (entity.specialization ? "Doctor" : "User"),
    name: `${entity.firstName || ""} ${entity.lastName || ""}`.trim(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const signRefreshToken = async (entity) => {
  const payload = { id: entity._id.toString(), role: entity.role || "User" };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(token, salt);

  await RefreshToken.create({
    token: hashedToken,
    userId: entity._id,
    userType: entity.role || "User",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { token, hashedToken };
};

const generateTokens = async (user, userType) => {
  console.log("[Auth Middleware] Generating tokens for user ID:", user._id, "Type:", userType);
  try {
    const accessToken = jwt.sign(
      { id: user._id.toString(), role: userType },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString(), role: userType },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(refreshToken, salt);

    await RefreshToken.create({
      token: hashedToken,
      userId: user._id,
      userType: userType,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("[Auth Middleware] Tokens generated successfully");
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("[Auth Middleware] Token generation error:", error);
    throw error;
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    console.log("[Auth Middleware] Authorization header:", authHeader || "None");

    if (!authHeader.startsWith("Bearer ")) {
      console.log("[Auth Middleware] No token provided");
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("[Auth Middleware] Malformed token");
      return res.status(401).json({ message: "Unauthorized - Malformed token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[Auth Middleware] Decoded token:", decoded);

    let entity =
      (await User.findById(decoded.id).select("-password")) ||
      (await Doctor.findById(decoded.id).select("-password"));

    if (!entity) {
      console.log("[Auth Middleware] User/Doctor not found for ID:", decoded.id);
      return res.status(404).json({ message: "User or Doctor not found" });
    }

    req.auth = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
    };
    req.user = entity;

    next();
  } catch (err) {
    console.error("[Auth Middleware] Token verification failed:", err);
    const message = err.name === "TokenExpiredError" ? "Unauthorized - Token expired" : "Unauthorized - Invalid token";
    return res.status(401).json({ message });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      console.log("[Auth Middleware] Forbidden: Role:", req.auth?.role, "Allowed:", allowedRoles);
      return res.status(403).json({ message: "Forbidden - Insufficient role" });
    }
    next();
  };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

const revokeToken = async (token) => {
  const decoded = verifyRefreshToken(token);

  const savedTokens = await RefreshToken.find({ userId: decoded.id });

  for (const saved of savedTokens) {
    const match = await bcrypt.compare(token, saved.token);
    if (match) {
      await RefreshToken.deleteOne({ _id: saved._id });
      return true;
    }
  }

  throw new Error("Token not found or already revoked");
};

const hydrateUser = async (req, res, next) => {
  try {
    const userId = req.auth?.id;
    if (!userId) {
      console.log("[Auth Middleware] Not authenticated: No user ID");
      return res.status(401).json({ message: "Unauthorized - Not authenticated" });
    }

    const entity =
      (await User.findById(userId).select("-password").lean()) ||
      (await Doctor.findById(userId).select("-password").lean());

    if (!entity) {
      console.log("[Auth Middleware] User/Doctor not found for ID:", userId);
      return res.status(404).json({ message: "User/Doctor not found" });
    }

    req.user = entity;
    next();
  } catch (err) {
    console.error("[Auth Middleware] hydrateUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signJwt,
  signRefreshToken,
  generateTokens,
  verifyToken,
  authorize,
  verifyRefreshToken,
  revokeToken,
  hydrateUser,
};