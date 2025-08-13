const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Express body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware with Prisma session store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,  // Every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

require("./config/passport")(passport);


app.get("/", (req, res) => {
  res.send("Pandora's Box");
});


app.listen(PORT, () => {
  console.log(`Server now running on localhost:${PORT}`);
});
