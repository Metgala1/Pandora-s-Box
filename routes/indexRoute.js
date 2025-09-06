const { Router } = require("express");
const router = Router();
const { isAuthenticated } = require("../middleware/authMiddleWare");
const upload = require("../middleware/uploadMiddleware");
const {   signupValidation,loginValidation,uploadValidation, } = require("../middleware/validationMiddleware");

const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");

// Auth
router.post("/signup", signupValidation, authController.signup);
router.post("/login", loginValidation, authController.login);
router.post("/logout", authController.logout);

// Files
router.post(
  "/upload",
  isAuthenticated,
  uploadValidation,
  upload.single("file"),
  fileController.postUpload
);

router.get("/files", isAuthenticated, fileController.listFiles);
router.get("/download/:id", isAuthenticated, fileController.downloadFile);
router.delete("/delete/:id", isAuthenticated, fileController.deleteFile);

router.get("/images", isAuthenticated, fileController.getImages);
router.get("/videos", isAuthenticated, fileController.getVideos);
router.get("/audios", isAuthenticated, fileController.getAudios);

module.exports = router;
