const cloudinary = require("../config/cloudinary");

// Upload Images to Cloudinary
const uploadToCloudinary = async (buffer, folder) => {
  try {
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      console.error("Invalid buffer:", buffer);
      throw new Error("Invalid buffer provided for upload");
    }

    const base64 = buffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64}`;

    // console.log("Data URI (first 50 chars):", dataURI.slice(0, 50)); // Debug

    const { secure_url, public_id } = await cloudinary.uploader.upload(dataURI, {
      folder,
    });

    return { secure_url, public_id };
  } catch (error) {
    console.error("Cloudinary Upload Error (Image):", error.message);
    throw new Error("Error uploading image to Cloudinary");
  }
};

// Upload Videos to Cloudinary
const uploadVideoToCloudinary = async (buffer, folderPath) => {
  try {
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      console.error("Invalid buffer:", buffer);
      throw new Error("Invalid buffer provided for upload");
    }

    const base64 = buffer.toString('base64');
    const dataURI = `data:video/mp4;base64,${base64}`;

    const { secure_url: videoUrl, public_id: videoCldId } = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'video',
      folder: folderPath,
    });

    return { videoUrl, videoCldId };
  } catch (error) {
    console.error("Cloudinary Upload Error (Video):", error.message);
    throw new Error("Error uploading video to Cloudinary");
  }
};

// Upload Documents (PDF, DOCX, etc.) to Cloudinary
const uploadDocumentToCloudinary = async (buffer, folderPath, mimetype) => {
  try {
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      console.error("Invalid buffer:", buffer);
      throw new Error("Invalid buffer provided for upload");
    }

    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${base64}`;

    const { secure_url: fileUrl, public_id: fileCldId } = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw', // required for non-image/video files
      folder: folderPath,
    });

    return { fileUrl, fileCldId };
  } catch (error) {
    console.error("Cloudinary Upload Error (Document):", error.message);
    throw new Error("Error uploading document to Cloudinary");
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
};