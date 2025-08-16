 const prisma = require("../client/prisma")
 const fs = require("fs");
 const path = require("path")
const { cloudinary } = require("../config/cloudinary");


 exports.getUpload = (req,res) => {
    res.render("upload", {title: "Upload File", user: req.user})
 }



exports.postUpload = async (req, res) => {
  if (!req.file) {
    req.flash("error", "No file selected");
    return res.redirect("/upload");
  }

  try {
    // Upload file buffer to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) {
          console.error(error);
          req.flash("error", "Upload failed");
          return res.redirect("/upload");
        }

        // Save metadata in DB
        await prisma.file.create({
          data: {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            userId: req.user.id,
            savedFilename: result.public_id,
            url: result.secure_url,
          },
        });

        req.flash("success", "File uploaded successfully");
        res.redirect("/files");
      }
    );

    // Push the file buffer to Cloudinary
    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while uploading the file");
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
    const file = await prisma.file.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!file) {
      req.flash("error", "File not found");
      return res.redirect("/files");
    }

    res.redirect(file.url); // direct link from Cloudinary
  } catch (err) {
    console.error(err);
    req.flash("error", "Error downloading file");
    res.redirect("/files");
  }
};


 exports.deleteFile = async (req,res) => {
    try{
        const file = await prisma.file.findUnique({
            where: {id: parseInt(req.params.id)}
        });
        if(!file){
            req.flash("error", "File not found")
            res.redirect("/")
        }
        const filePath = path.join(__dirname, "../uploads", file.savedFilename);
          fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error deleting file from filesystem:", err);
      }
    });

        await prisma.file.delete({
            where: {id: parseInt(req.params.id)}

        })
        req.flash("success", "File deleted successfully");
        res.redirect("/")
    }catch(err){
        req.flash("error", "Error deleting file")
        res.redirect("")

    }
 }
