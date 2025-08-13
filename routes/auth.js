const {Router} = require("express");
const authRouter = Router()
const authController = require("../controllers/authController")

authRouter.get('/register', authController.getRegister);

authRouter.post('/register', authController.postRegister);

authRouter.get('/login', authController.getLogin);

authRouter.post('/login', authController.postLogin)

authRouter.get('/logout', authController.logout)

module.exports = authRouter