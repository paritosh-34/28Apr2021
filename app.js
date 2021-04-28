const path = require("path");
const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");

const connectDB = require("./util/connectDB");

require("dotenv").config();
connectDB();
const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logging
app.use(morgan("dev"));

// ejs
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/manage", require("./routes/manage"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", console.log(`Server running on port ${PORT}`));
