// controllers/fileController.js
const prisma = require("../client/prisma");
const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

// Upload a file
exports.postUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file selected" });

  try {
    const uniqueName = `${uuidv4()}-${req.file.originalname}`;

    // Upload to Supabase
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(uniqueName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(uniqueName);

    // Save metadata to DB
    const newFile = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        url: data.publicUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        storage: "supabase",
        format: req.file.mimetype.split("/")[1] || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error("Upload error:", err);
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

// Download a file
const fetch = require("node-fetch");

exports.downloadFile = async (req, res) => {
  try {
    const fileId = parseInt(req.params.id, 10);
    if (isNaN(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, name: true, url: true }, // Only fetch needed fields
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from source: ${response.status} ${response.statusText}`);
    }

    // Use original filename if available, fallback to safe default
    const originalName = file.name?.trim();
    const safeFilename = originalName && originalName.length > 0 
      ? originalName 
      : `file-${fileId}`;

    // Sanitize filename to prevent header injection
    const encodedFilename = encodeURIComponent(safeFilename);

    // Determine content type (fallback to octet-stream)
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    // Set response headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedFilename}`);

    // Optional: Add caching control if needed
    // res.setHeader("Cache-Control", "no-cache");

    // Stream the response
    if (response.body) {
      response.body.pipe(res);
    } else {
      throw new Error("Response body is missing");
    }
  } catch (err) {
    console.error("Download error [ID:", req.params.id, "]:", err.message);
    res.status(500).json({ message: "Failed to download file" });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!file) return res.status(404).json({ message: "File not found" });

    // Extract stored filename from URL
    const filename = file.url.split("/").pop();

    // Delete from Supabase
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .remove([filename]);
    if (error) throw error;

    // Delete from DB
    await prisma.file.delete({ where: { id: file.id } });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting file" });
  }
};

// Get all images
exports.getImages = async (req, res) => {
  try {
    const images = await prisma.file.findMany({
      where: { userId: req.user.id, mimetype: { startsWith: "image/" } },
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
      where: { userId: req.user.id, mimetype: { startsWith: "video/" } },
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
      where: { userId: req.user.id, mimetype: { startsWith: "audio/" } },
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
