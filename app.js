const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); // to allow React frontend requests

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(cors({ origin: "http://localhost:5173", credentials: true })); // allow React frontend
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
const indexRouter = require("./routes/indexRoute");
app.use("/", indexRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// Start server
app.listen(PORT, () => console.log("server running"))
