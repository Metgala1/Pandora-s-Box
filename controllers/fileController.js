const prisma = require("../client/prisma");
const fs = require("fs");
const path = require("path");

// Upload a file
exports.postUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file selected" });
  }

  try {
    const newFile = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        savedFilename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user.id,
        url: `/uploads/${req.file.filename}`, // or your public URL
      },
    });

    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading file" });
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

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(__dirname, "../uploads", file.savedFilename);
    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
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

    const filePath = path.join(__dirname, "../uploads", file.savedFilename);

    // Remove from filesystem
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error deleting file:", err);
      }
    });

    // Remove from DB
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
