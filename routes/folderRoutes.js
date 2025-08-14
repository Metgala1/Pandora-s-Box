const {Router} = require("express")
const router = Router()
const folderController = require("../controllers/folderController")
const {isAuthenticated} = require("../middleware/authMiddleWare")

router.get("/folders", isAuthenticated, folderController.listFolders);
router.get("/folders/new", isAuthenticated, folderController.getNewFolder);
router.post("/folders/new", isAuthenticated, folderController.postNewFolder);

module.exports = router
