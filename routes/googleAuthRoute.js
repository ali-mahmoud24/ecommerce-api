const express = require("express");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { sanitizeUser } = require("../utils/sanitizeData"); // your helper
const { createToken } = require("../utils/auth");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v2/auth/failure' }),
  asyncHandler(async (req, res) => {
    console.log('🧩 req.user:', req.user);

    if (!req.user) {
      return res.status(400).json({ message: 'req.user is undefined — check passport config' });
    }

    const token = createToken(req.user._id);
    res.status(200).json({
      data: sanitizeUser(req.user),
      token,
    });
  })
);


router.get("/failure", (req, res) => {
  res.status(400).json({ message: "Google authentication failed" });
});

module.exports = router;
