 const prisma = require("../client/prisma")
 const multer = require("multer");
 const fs = require("fs");
 const path = require("path")

 const storage = multer.diskStorage({
    destination: function (req,file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req,file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
 })

 const upload = multer({storage})

 exports.getUpload = (req,res) => {
    res.render("upload", {title: "Upload File", user: req.user})
 }

 exports.postUpload = [
    upload.single("file"), async (req,res) => {
        if(!req.file) {
            req.flash("error", "No file selected");
            return res.redirect("/upload");
        }

        try{
            await prisma.file.create({
                data: {
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    userId: req.user.id,
                    savedFilename: req.file.filename,
                    url: `/uploads/${req.file.filename}`
                }
            });
            req.flash("success", "File uploaded successfuly");
            res.redirect("/files");
        }catch(err){
            console.error(err)
            req.flash("error", "Something went wrong while uploading the file");
            res.redirect("/upload")
        }
    }
 ];

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

 exports.downloadFile = async (req,res) => {
    try{
        const file = await prisma.file.findUnique({
            where: {id: parseInt(req.params.id)}
        })
        if(!file){
            req.flash("error", "File ot found")
            res.redirect("/")
        }
        const filePath = path.join(__dirname, "../uploads", file.savedFilename);
        res.download(filePath, file.filename)
    }catch(err){
        console.error(err);
        req.flash("error", "Error downloading file")
        res.redirect("/")

    }
 }

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
