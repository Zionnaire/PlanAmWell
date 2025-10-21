const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const {
    uploadToCloudinary,
    uploadVideoToCloudinary,
    uploadDocumentToCloudinary,
    deleteFromCloudinary,

} = require("../middlewares/cloudinary");

/**
 * @desc Get all doctors (admin only)
 * @route GET /api/doctors
 * @access Admin
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password -confirmPassword");
    res.json(doctors);
  } catch (error) {
    console.error("Get all doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get a single doctor by ID
 * @route GET /api/doctors/:id
 * @access Private/Admin
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password -confirmPassword");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get current logged-in doctor
 * @route GET /api/doctors/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.auth.userId).select("-password -confirmPassword");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Helper function to safely parse JSON strings or return trimmed strings.
 * Used for fields like address, qualifications, and availability which might be
 * stringified when sent from the client.
 */
const safeParse = (value, fieldName) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") {
        const trimmedValue = value.trim();
        // Check if the string looks like a JSON object or array
        if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[")) {
            try {
                return JSON.parse(trimmedValue);
            } catch (e) {
                console.error(`[SERVER] ERROR: Failed to parse JSON for field '${fieldName}'.`);
                throw new Error(`Invalid data format for ${fieldName}.`);
            }
        }
        return trimmedValue;
    }
    return value;
};

const updateDocProfile = async (req, res) => {
    try {
        // Use a generic ID check to find the doctor
        const doctorId = req.auth?.sub || req.auth?.id || req.auth?.userId || req.user?.id || req.userId;
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized - No doctor ID found in token" });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const updates = {};
        const body = req.body;

        // --- 1. Basic User Fields ---
        if (body.firstName !== undefined) updates.firstName = String(body.firstName).trim();
        if (body.lastName !== undefined) updates.lastName = String(body.lastName).trim();
        if (body.phone !== undefined) updates.phone = String(body.phone).trim();
        if (body.gender !== undefined) updates.gender = String(body.gender).trim();
        if (body.isAnonymous !== undefined) updates.isAnonymous = body.isAnonymous;
        if (body.alias) updates.alias = String(body.alias).trim();
        
        // --- 2. Doctor-Specific Professional Fields ---
        if (body.specialization !== undefined) updates.specialization = String(body.specialization).trim();
        if (body.experienceYears !== undefined) updates.experienceYears = Number(body.experienceYears);
        if (body.bio !== undefined) updates.bio = String(body.bio).trim();
        if (body.consultationFee !== undefined) updates.consultationFee = Number(body.consultationFee);
        
        // --- 3. Nested/Array Fields (Require Parsing) ---
        try {
            if (body.address) updates.address = safeParse(body.address, "address");
            if (body.qualifications) updates.qualifications = safeParse(body.qualifications, "qualifications");
            if (body.availability) updates.availability = safeParse(body.availability, "availability");
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
        
        // Exclude sensitive fields from being updated via this route
        delete updates.password;
        delete updates.confirmPassword;
        delete updates.email;
        
        // --- 4. Handle Avatar File Upload (req.files.avatar) ---
        const avatarFile = req.files && req.files.avatar;

        if (avatarFile) {
            if (!avatarFile.mimetype.startsWith("image/")) {
                return res.status(400).json({ message: "Only image files are allowed for avatar." });
            }
            
            // Delete old avatar if it exists
            if (doctor.avatar && doctor.avatar.public_id) {
                try {
                    await deleteFromCloudinary(doctor.avatar.public_id);
                } catch (deleteError) {
                    console.error("Error deleting old doctor avatar (ignoring):", deleteError);
                }
            }

            // Upload new avatar
            const result = await uploadToCloudinary(avatarFile.data, "doctors/images");
            doctor.avatar = {
                url: result.secure_url,
                public_id: result.public_id,
            };
            // Ensure Mongoose knows the nested object was changed
            doctor.markModified("avatar"); 
        }

        // --- 5. Apply updates and Save ---
        Object.assign(doctor, updates);

        // Mark nested/array fields as modified if they were updated
        if (updates.address) doctor.markModified("address");
        if (updates.qualifications) doctor.markModified("qualifications");
        if (updates.availability) doctor.markModified("availability");

        await doctor.save({ validateBeforeSave: true });

        // Clean up and format the response object
        const freshDoctor = doctor.toObject();
        if (freshDoctor) {
            delete freshDoctor.password;
            delete freshDoctor.__v;
        }

        res.json({
            message: "Profile updated successfully",
            user: freshDoctor, // IMPORTANT: Renamed 'doctor' to 'user' for client consistency
        });

    } catch (error) {
        console.error("Doctor profile update error:", error);
        res.status(500).json({
            message: "Server error during doctor profile update",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
/**
 * @desc Toggle anonymous mode
 * @route PATCH /api/doctors/anonymous
 * @access Private
 */
const toggleAnonymous = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.auth.userId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isAnonymous = !doctor.isAnonymous;
    await doctor.save();

    res.json({ message: `Anonymous mode ${doctor.isAnonymous ? "enabled" : "disabled"}` });
  } catch (error) {
    console.error("Toggle anonymous error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Delete doctor account
 * @route DELETE /api/doctors/delete
 * @access Private
 */
const deleteAccount = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.auth.userId);
    res.json({ message: "Doctor account deleted successfully" });
  } catch (error) {
    console.error("Delete doctor account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getMe,
  updateDocProfile,
  toggleAnonymous,
  deleteAccount,
};
