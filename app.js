const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); // to allow React frontend requests

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pandora-s-box-theta.vercel.app"],
    credentials: true,
  })
);
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
const indexRouter = require("./routes/indexRoute");
app.use("/", indexRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" }); 
});

app.listen(PORT, () => console.log("server running" + " " + PORT))
