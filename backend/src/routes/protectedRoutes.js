const express = require("express");
const passport = require("passport");

const router = express.Router();

// @route   GET /protected
router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "Welcome to the protected route", user: req.user });
});

module.exports = router;
