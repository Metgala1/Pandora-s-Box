const prisma = require('../client/prisma');

exports.listFolders = async (req,res) => {
    const folders = await prisma.folder.findMany({
        where: {userId: req.user.id},
        orderBy: {createdAt: "desc"}
    });
    res.render("folders", {title: "My Folders", folders, user: req.user});
}

exports.getNewFolder = (req,res) => {
    res.render("newFolder", {title: "Create Folder", user: req.user})
}

exports.postNewFolder = async (req,res) => {
    const {name} = req.body;
    if(!name){
        req.flash("error", "Folder name is required");
        return res.redirect("/folders/new")
    }
    await prisma.folder.create({
        data: {name, userId: req.user.id}
    })
  req.flash("success", "Folder created successfully");
  res.redirect("/folders");
}
