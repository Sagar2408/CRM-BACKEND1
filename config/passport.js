// config/passport.js
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const { Users, Op } = require("../config/sequelize"); // Import Users and Op from sequelize config

// OAuth Signup Handler (defined locally)
const handleOAuthSignup = async (profile, provider, done) => {
  try {
    // Check if user exists with this OAuth ID
    let user = await Users.findOne({
      where: {
        [Op.or]: [
          { oauth_id: profile.id, oauth_provider: provider },
          { email: profile.emails ? profile.emails[0].value : null },
        ],
      },
    });

    if (user) {
      return done(null, false, {
        message: `User already exists with this ${provider} account or email`,
      });
    }

    // Create new user if not found
    user = await Users.create({
      username:
        profile.displayName || `${provider}_${profile.id}`.substring(0, 25), // Truncate if too long
      email: profile.emails ? profile.emails[0].value : null,
      oauth_provider: provider,
      oauth_id: profile.id,
      profile_picture: profile.photos ? profile.photos[0].value : null,
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

module.exports = () => {
  // Twitter Strategy
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_API_KEY,
        consumerSecret: process.env.TWITTER_API_KEY_SECRET,
        callbackURL: "/api/auth/twitter/callback",
      },
      (token, tokenSecret, profile, done) => {
        handleOAuthSignup(profile, "twitter", done);
      }
    )
  );

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        handleOAuthSignup(profile, "facebook", done);
      }
    )
  );

  // LinkedIn Strategy
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/api/auth/linkedin/callback",
        scope: ["r_emailaddress", "r_liteprofile"],
      },
      (accessToken, refreshToken, profile, done) => {
        handleOAuthSignup(profile, "linkedin", done);
      }
    )
  );
};
