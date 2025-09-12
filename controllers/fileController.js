const prisma = require("../client/prisma");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const { v4: uuidv4 } = require("uuid");

// Upload a file
exports.postUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file selected" });
  }

  try {
    const publicId = `pandoras-box/${uuidv4()}`;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "pandoras-box", public_id: publicId, resource_type: "auto" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const newFile = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user.id,
        url: result.secure_url,
        cloudinary_public_id: result.public_id,
        storage: "cloudinary",
        format: result.format,
      },
    });

    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading file", details: err.message });
  }
};

// List all files for user
exports.listFiles = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch files" });
  }
};

// Download a file (redirect to Cloudinary)
exports.downloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.storage === "cloudinary") {
      return res.redirect(file.url);
    }

    // Optional fallback for local files
    res.status(400).json({ message: "File not stored in Cloudinary" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.storage === "cloudinary") {
      await cloudinary.uploader.destroy(file.cloudinary_public_id, { resource_type: "auto" });
    }

    await prisma.file.delete({ where: { id: file.id } });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting file" });
  }
};

// Get all images
exports.getImages = async (req, res) => {
  try {
    const images = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        mimetype: { startsWith: "image/" },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        mimetype: { startsWith: "video/" },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all audios
exports.getAudios = async (req, res) => {
  try {
    const audios = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        mimetype: { startsWith: "audio/" },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(audios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        OR: [
          { mimetype: { startsWith: "application/" } },
          { mimetype: { startsWith: "text/" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
