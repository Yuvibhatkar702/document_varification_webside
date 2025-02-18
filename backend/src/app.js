const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Passport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
