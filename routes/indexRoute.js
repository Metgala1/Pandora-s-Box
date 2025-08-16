const {Router} = require("express")
const router = Router()
const {isAuthenticated} = require("../middleware/authMiddleWare")
const { parser } = require("../config/multer");

const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin)
router.post("/login", authController.postLogin)

router.post("/logout", authController.logout)

router.get("/upload", isAuthenticated, fileController.getUpload);
router.post("/upload", isAuthenticated, parser.single("file"), fileController.postUpload);

router.get("/files", isAuthenticated, fileController.listFiles)

router.get("/download/:id", isAuthenticated, fileController.downloadFile)

router.post("/delete/:id", isAuthenticated, fileController.deleteFile)

router.get("/", (req,res) => {
    res.render("home", {title: "Home"}) 
})

module.exports = router; 