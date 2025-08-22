 const prisma = require("../client/prisma")
 const fs = require("fs");
const { type } = require("os");
 const path = require("path")



 exports.getUpload = (req,res) => {
    res.render("upload", {title: "Upload File", user: req.user})
 }




exports.postUpload = async (req, res) => {
  if (!req.file) {
    req.flash("error", "No file selected");
    return res.redirect("/upload");
  }

  try {
    await prisma.file.create({
      data: {
        filename: req.file.originalname,
        savedFilename: req.file.filename, // actual stored file
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user.id,
        url: `/uploads/${req.file.filename}`, // local path
      },
    });

    req.flash("success", "File uploaded successfully");
    res.redirect("/files");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while uploading");
    res.redirect("/upload");
  }
};


 exports.listFiles = async (req,res) => {
    try{
        const files = await prisma.file.findMany({
            where: {userId: req.user.id},
            orderBy: {createdAt: "desc"}
        });
        res.render("files", {title: "My Files", files, user: req.user})
    }catch(err) {
        console.error(err);
        req.flash("error", "Could not fetch file.");
        res.redirect("/")
    }
 }

exports.downloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file) {
      req.flash("error", "File not found");
      return res.redirect("/files");
    }

    const filePath = path.join(__dirname, "../uploads", file.savedFilename);
    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error(err);
        req.flash("error", "Error downloading file");
        res.redirect("/files");
      }
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Error downloading file");
    res.redirect("/files");
  }
};


exports.deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file) {
      req.flash("error", "File not found");
      return res.redirect("/files");
    }

    const filePath = path.join(__dirname, "../uploads", file.savedFilename);

    // Remove from filesystem
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error deleting file:", err);
      }
    });

    // Remove from DB
    await prisma.file.delete({
      where: { id: parseInt(req.params.id) },
    });

    req.flash("success", "File deleted successfully");
    res.redirect("/files");

  } catch (err) {
    console.error(err);
    req.flash("error", "Error deleting file");
    res.redirect("/files");
  }
};

exports.getImages = async (req,res) => {
  try{
  const images = await prisma.file.findMany({
      where: {
        mimetype: {
          startsWith: "image/", // filter only image MIME types
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  res.render("image", {files: images})
  }catch(err){
    console.error(err)
    res.status(500).send("Server Error") 
  }
}
