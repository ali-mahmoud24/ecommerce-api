const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("../models/userModel");
const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/v2/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Extract Google info
        const email = profile.emails[0].value;
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        console.log("📧 Email:", email);
        // 2️⃣ Check if user exists
        let user = await UserModel.findOne({ email });

        // 3️⃣ If not, create a new one
        if (!user) {
          user = await UserModel.create({
            firstName,
            lastName,
            email,
            password: Math.random().toString(36).slice(-8), // dummy password (required by your schema)
          });
        }

        // 4️⃣ Pass user to next middleware
        return done(null, user);
      } catch (error) {
        console.error("❌ Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

// ✅ Serialize / Deserialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id);
  done(null, user);
});

module.exports = passport;
