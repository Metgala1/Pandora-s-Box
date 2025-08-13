const express = require("express");
const passport = require("passport");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");

const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const authRouter = require("./routes/auth");

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// EJS and Layouts
// ---------------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout"); // default layout: views/layout.ejs

// ---------------------------
// Static files
// ---------------------------
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------
// Body parsers
// ---------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------------------------
// Session + Prisma store
// ---------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
}));

// ---------------------------
// Flash messages
// ---------------------------
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ---------------------------
// Default title
// ---------------------------
app.use((req, res, next) => {
  if (!res.locals.title) res.locals.title = "Pandora's Box";
  next();
});

// ---------------------------
// Passport
// ---------------------------
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ---------------------------
// Routes
// ---------------------------
app.use('/', authRouter);

// Root route
app.get("/", (req, res) => {
  res.render("home", { title: "Home" }); // use res.render to inject body
});

// ---------------------------
// Start server
// ---------------------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
