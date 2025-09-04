const { body } = require("express-validator");

const signupValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }).trim().escape(),
  body("name").isLength({ min: 3 }).trim().escape(),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().trim().escape(),
];

const uploadValidation = [
  body("file").custom((_, { req }) => !!req.file),
];

module.exports = {
  signupValidation,
  loginValidation,
  uploadValidation,
};
