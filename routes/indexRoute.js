const {Router} = require("express")
const router = Router()
const {isAuthenticated} = require("../middleware/authMiddleWare")
const upload = require("../middleware/uploadMiddleware");

const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const { file } = require("../client/prisma");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin)
router.post("/login", authController.postLogin)

router.post("/logout", authController.logout) 

router.get("/upload", isAuthenticated, fileController.getUpload);
router.post("/upload", isAuthenticated, upload.single("file"), fileController.postUpload);

router.get("/files", isAuthenticated, fileController.listFiles)

router.get("/download/:id", isAuthenticated, fileController.downloadFile)

router.post("/delete/:id", isAuthenticated, fileController.deleteFile)

router.get("/images", isAuthenticated, fileController.getImages)
router.get("/videos", isAuthenticated, fileController.getVideos)
router.get("/audios", isAuthenticated, fileController.getAudios)

router.get("/dev", isAuthenticated, (req,res) => {
    res.render("development")
})

router.get("/", (req,res) => {
    res.render("home", {title: "Home"}) 
}) 

module.exports = router;