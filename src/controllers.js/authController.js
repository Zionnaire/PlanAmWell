const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateTokens, revokeToken } = require("../middlewares/auth");
const { uploadToCloudinary, deleteFromCloudinary } = require("../middlewares/cloudinary");

const register = async (req, res) => {
  console.log("--- START REGISTER REQUEST ---");
  console.log("📎 req.body:", req.body);
  try {
    const { role, email, password, confirmPassword, ...rest } = req.body;

    if (!email || !password || !confirmPassword) {
      console.log("[SERVER] ERROR: Missing email, password, or confirmPassword");
      return res.status(400).json({ message: "Email, password, and confirmPassword are required" });
    }

    if (password !== confirmPassword) {
      console.log("[SERVER] ERROR: Passwords do not match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isDoctor = role?.toLowerCase() === "doctor";
    const Model = isDoctor ? Doctor : User;

    const existing = await User.findOne({ email: trimmedEmail }) || await Doctor.findOne({ email: trimmedEmail });
    if (existing) {
      console.log("[SERVER] ERROR: Email already registered:", trimmedEmail);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      email: trimmedEmail,
      password: hashedPassword,
      role: isDoctor ? "doctor" : "user",
      firstName: rest.firstName?.trim(),
      lastName: rest.lastName?.trim(),
      phone: rest.phone?.trim(),
      gender: rest.gender,
      dob: rest.dob,
      bloodGroup: rest.bloodGroup,
      isAnonymous: rest.isAnonymous || false,
      alias: rest.alias?.trim(),
      avatar: { url: "", public_id: "" }
    };

    if (rest.address) {
      if (typeof rest.address === "string") {
        userData.address = { street: rest.address.trim() };
      } else if (typeof rest.address === "object") {
        userData.address = {
          street: rest.address.street?.trim(),
          city: rest.address.city?.trim(),
          state: rest.address.state?.trim(),
          country: rest.address.country?.trim(),
        };
      }
    }

    if (rest.medicalHistory) userData.medicalHistory = rest.medicalHistory;
    if (rest.allergies) userData.allergies = rest.allergies;
    if (rest.emergencyContact) userData.emergencyContact = rest.emergencyContact;
    if (isDoctor) {
      if (rest.specialization) userData.specialization = rest.specialization?.trim();
      if (rest.qualifications) userData.qualifications = rest.qualifications;
      if (rest.experienceYears) userData.experienceYears = Number(rest.experienceYears);
      if (rest.bio) userData.bio = rest.bio?.trim();
      if (rest.consultationFee) userData.consultationFee = Number(rest.consultationFee);
      if (rest.availability) userData.availability = rest.availability;
    }

    const newAccount = await Model.create(userData);
    const userType = isDoctor ? "doctor" : "user";
    const tokens = await generateTokens(newAccount, userType);

    console.log("[SERVER] Register successful, tokens:", tokens.accessToken ? "Access token present" : "No access token");

    const userResponse = newAccount.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      message: "Registration successful",
      user: userResponse,
      tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  } catch (error) {
    console.error("[SERVER] Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  } finally {
    console.log("--- END REGISTER REQUEST ---");
  }
};

const login = async (req, res) => {
  // console.log("--- START LOGIN REQUEST ---");
  // console.log("📎 req.body:", req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // console.log("[SERVER] ERROR: Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: trimmedEmail }) || await Doctor.findOne({ email: trimmedEmail });
    if (!user) {
      // console.log("[SERVER] ERROR: User/Doctor not found for email:", trimmedEmail);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // console.log("[SERVER] ERROR: Password mismatch for email:", trimmedEmail);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive || user.deactivatedAt) {
      // console.log("[SERVER] ERROR: Account inactive for email:", trimmedEmail);
      return res.status(403).json({ message: "Account is inactive" });
    }

    const tokens = await generateTokens(user, user.role);

    // console.log("[SERVER] Login successful, tokens:", tokens.accessToken ? "Access token present" : "No access token");

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.json({
      message: "Login successful",
      user: userResponse,
      tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  } catch (error) {
    console.error("[SERVER] Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  } finally {
    // console.log("--- END LOGIN REQUEST ---");
  }
};

const socialAuth = async (req, res) => {
    console.log("--- START SOCIAL AUTH REQUEST (Firebase) ---");

    try {
        const { idToken, role } = req.body;
        if (!idToken) {
            console.log("[SERVER] ERROR: Missing ID Token for social login");
            return res.status(400).json({ message: "Firebase ID Token is required" });
        }

        // 1. Verify the ID Token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email?.trim().toLowerCase();
        
        const isDoctor = role?.toLowerCase() === "doctor";
        const Model = isDoctor ? Doctor : User;

        // 2. Find the user's profile in MongoDB using the Firebase UID
        let user = await User.findOne({ uid: firebaseUid }) || await Doctor.findOne({ uid: firebaseUid });

        // Check if the user exists but without a UID (Legacy account matching by email)
        if (!user && email) {
            user = await User.findOne({ email }) || await Doctor.findOne({ email });
            // If we found a legacy account by email, update it with the new Firebase UID
            if (user) {
                console.log(`[SERVER] Found legacy account by email. Updating UID for ${email}`);
                user.uid = firebaseUid;
                await user.save();
            }
        }

        // 3. If User does NOT exist in MongoDB, create a new profile (Social Registration)
        if (!user) {
            console.log("[SERVER] Creating new social profile for UID:", firebaseUid);
            
            const [firstName, ...lastNameParts] = decodedToken.name?.split(' ') || [];
            const lastName = lastNameParts.join(' ');
            
            const newUserData = {
                uid: firebaseUid,
                email: email || decodedToken.provider_id, // Use email or provider ID as fallback
                role: isDoctor ? "doctor" : "user",
                firstName: firstName || null,
                lastName: lastName || null,
                avatar: { url: decodedToken.picture || "", public_id: "" }
                // NOTE: All other fields (password, dob, specialization, etc.) will be null or defaults
            };
            
            user = await Model.create(newUserData);
            console.log("[SERVER] New social profile created. UID:", firebaseUid);
        }

        // 4. Check account status
        if (!user.isActive || user.deactivatedAt) {
            return res.status(403).json({ message: "Account is inactive" });
        }

        // 5. Generate custom backend tokens
        const tokens = await generateTokens(user, user.role);

        // console.log("[SERVER] Social Auth successful, UID:", firebaseUid);

        const userResponse = user.toObject();
        delete userResponse.password; // Important: Ensure password field is removed
        delete userResponse.__v;

        res.json({
            message: "Login successful",
            user: userResponse,
            tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        });
    } catch (error) {
        if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired') {
            console.error("[SERVER] Firebase Token Error:", error.message);
            return res.status(401).json({ message: "Invalid or expired Firebase ID Token." });
        }
        console.error("[SERVER] Social Auth error:", error);
        res.status(500).json({ message: "Server error during social authentication" });
    } finally {
        console.log("--- END SOCIAL AUTH REQUEST (Firebase) ---");
    }
};

const refresh = async (req, res) => {
  console.log("--- START REFRESH REQUEST ---");
  try {
    const { token } = req.body;
    if (!token) {
      console.log("[SERVER] ERROR: Refresh token required");
      return res.status(400).json({ message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      console.log("[SERVER] ERROR: Invalid or expired refresh token:", err.message);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (!decoded.id) {
      console.log("[SERVER] ERROR: Invalid token payload, missing ID");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id) || await Doctor.findById(decoded.id);
    if (!user) {
      console.log("[SERVER] ERROR: User/Doctor not found for ID:", decoded.id);
      return res.status(404).json({ message: "User or Doctor not found" });
    }

    const tokens = await generateTokens(user, user.role);

    console.log("[SERVER] Refresh successful, tokens:", tokens.accessToken ? "Access token present" : "No access token");

    res.json({
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    console.error("[SERVER] Refresh error:", error);
    res.status(500).json({ message: "Server error during token refresh" });
  } finally {
    console.log("--- END REFRESH REQUEST ---");
  }
};

const logout = async (req, res) => {
  console.log("[SERVER] Logout attempt for user ID:", req.auth?.id);
  try {
    const refreshToken = req.body.token;
    if (refreshToken) {
      await revokeToken(refreshToken);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("[SERVER] Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

const getMe = async (req, res) => {
  console.log("[SERVER] GetMe attempt for user ID:", req.auth?.id);
  try {
    const user = await User.findById(req.auth.id).select("-password") ||
                await Doctor.findById(req.auth.id).select("-password");
    if (!user) {
      console.log("[SERVER] ERROR: User/Doctor not found for ID:", req.auth.id);
      return res.status(404).json({ message: "User or Doctor not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("[SERVER] GetMe error:", error);
    res.status(500).json({ message: "Server error during profile fetch" });
  }
};

const updateProfile = async (req, res) => {
  console.log("--- START PROFILE UPDATE REQUEST ---");
  console.log(`[SERVER] User ID: ${req.auth?.id}`);
  console.log("📎 req.body:", req.body);
  console.log("📎 Files received:", req.files ? Object.keys(req.files) : "No files");

  try {
    const {
      firstName,
      lastName,
      phone,
      gender,
      dob,
      bloodGroup,
      isAnonymous,
      alias,
      address,
      medicalHistory,
      allergies,
      emergencyContact,
      specialization,
      qualifications,
      experienceYears,
      bio,
      consultationFee,
      availability,
      ratings,
      isVerified,
      status,
      posts,
    } = req.body;

    const userId = req.auth?.id;
    if (!userId) {
      // console.log("[SERVER] ERROR: Missing user ID in token.");
      return res.status(401).json({ message: "Unauthorized - No user ID found in token" });
    }

    let user = await User.findById(userId) || await Doctor.findById(userId);
    if (!user) {
      // console.log(`[SERVER] ERROR: User/Doctor not found for ID: ${userId}`);
      return res.status(404).json({ message: "User or Doctor not found" });
    }

    const updates = {};
    const safeParse = (value, fieldName) => {
      if (!value) return null;
      if (typeof value === "string") {
        try {
          if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
            return JSON.parse(value);
          }
          return value.trim();
        } catch (e) {
          console.error(`[SERVER] ERROR: Failed to parse JSON for field '${fieldName}'.`);
          throw new Error(`Invalid data format for ${fieldName}.`);
        }
      }
      return value;
    };

    if (firstName !== undefined) updates.firstName = String(firstName).trim();
    if (lastName !== undefined) updates.lastName = String(lastName).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (gender) updates.gender = gender;
    if (dob) updates.dob = dob;
    if (bloodGroup) updates.bloodGroup = bloodGroup;
    if (isAnonymous !== undefined) updates.isAnonymous = isAnonymous;
    if (alias) updates.alias = String(alias).trim();
    if (user.role === "doctor") {
      if (specialization !== undefined) updates.specialization = String(specialization).trim();
      if (qualifications) updates.qualifications = safeParse(qualifications, "qualifications");
      if (experienceYears !== undefined) updates.experienceYears = Number(experienceYears);
      if (bio) updates.bio = String(bio).trim();
      if (consultationFee !== undefined) updates.consultationFee = Number(consultationFee);
      if (availability) {
        const parsedAvailability = safeParse(availability, "availability");
        if (Array.isArray(parsedAvailability)) {
          updates.availability = parsedAvailability.map((slot) => ({
            day: String(slot.day).trim(),
            from: String(slot.from).trim(),
            to: String(slot.to).trim(),
          }));
        } else {
          throw new Error("Invalid availability format");
        }
      }
      if (ratings) updates.ratings = safeParse(ratings, "ratings");
      if (isVerified !== undefined) updates.isVerified = Boolean(isVerified);
      if (status) updates.status = String(status).trim();
      if (posts) updates.posts = safeParse(posts, "posts");
    }

    try {
      if (address) updates.address = safeParse(address, "address");
      if (medicalHistory) updates.medicalHistory = safeParse(medicalHistory, "medicalHistory");
      if (allergies) updates.allergies = safeParse(allergies, "allergies");
      if (emergencyContact) updates.emergencyContact = safeParse(emergencyContact, "emergencyContact");
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (req.body.avatar) {
      console.warn("[SERVER] Removing malformed 'avatar' from req.body.");
      delete req.body.avatar;
    }

    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      // console.log(`[SERVER] Processing avatar: ${file.name}, Type: ${file.mimetype}`);
      // console.log("📊 File data size:", file.data.length);

      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed for avatar." });
      }

      const fileBuffer = file.data;
      if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
        console.error("[SERVER] ERROR: Invalid or empty file buffer.");
        return res.status(400).json({ message: "Invalid file buffer provided for avatar upload." });
      }

      if (user.avatar && user.avatar.public_id) {
        try {
          // console.log("🗑️ Deleting old avatar:", user.avatar.public_id);
          await deleteFromCloudinary(user.avatar.public_id);
        } catch (deleteError) {
          console.error("Error deleting old avatar (ignoring):", deleteError);
        }
      }

      const result = await uploadToCloudinary(fileBuffer, "users/images");
      console.log("✅ Avatar uploaded:", result.secure_url);
      user.avatar = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      user.markModified("avatar");
    } else {
      // console.log("[SERVER] No avatar file received in request.");
    }

    Object.assign(user, updates);
    user.markModified("address");
    user.markModified("medicalHistory");
    user.markModified("allergies");
    user.markModified("emergencyContact");
    if (user.role === "doctor") {
      user.markModified("specialization");
      user.markModified("qualifications");
      user.markModified("experienceYears");
      user.markModified("bio");
      user.markModified("consultationFee");
      user.markModified("availability");
      user.markModified("ratings");
      user.markModified("isVerified");
      user.markModified("status");
      user.markModified("posts");
    }

    await user.save({ validateBeforeSave: false });
    const freshUser = user.toObject();
    if (freshUser) {
      delete freshUser.password;
      delete freshUser.confirmPassword;
      delete freshUser.__v;
    }

    // console.log("✅ Profile update successful. Sending 200 response.");
    res.json({
      message: "Profile updated successfully",
      user: freshUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Server error during profile update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // console.log("--- END PROFILE UPDATE REQUEST ---");
  }
};

module.exports = { register, login, socialAuth, refresh, logout, getMe, updateProfile };