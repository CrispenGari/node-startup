/*
Google Passport Strategy
Docs: http://www.passportjs.org/packages/passport-google-oauth/
*/
import Users from "../../models";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

export default new GoogleStrategy.Strategy(
  {
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: "http://localhost:3001/auth/google/callback",
  },
  (accessToken, refreshToken, profile: any, cb) => {
    Users.findOne({ googleId: profile.id }, async (error: Error, doc: any) => {
      if (error) {
        throw error;
      } else {
        if (!doc) {
          const newUser = new Users({
            googleId: profile.id,
            username: profile.displayName,
            provider: profile.provider,
          });
          await newUser.save();
          cb(null, newUser);
        } else {
          cb(null, doc);
        }
      }
    });
  }
);
