const multer = require("multer");

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();
const parser = multer({ storage });

module.exports = { parser };
