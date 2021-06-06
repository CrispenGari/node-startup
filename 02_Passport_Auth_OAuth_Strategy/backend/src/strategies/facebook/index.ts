/*
Facebook Passport Strategy

    * Docs: http://www.passportjs.org/packages/passport-facebook/
*/

import dotenv from "dotenv";
import Users from "../../models";
import FacebookStrategy from "passport-facebook";
dotenv.config();

export default new FacebookStrategy.Strategy(
  {
    clientID: `${process.env.FACEBOOK_APP_ID}`,
    clientSecret: `${process.env.FACEBOOK_APP_SECRET}`,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
  },
  function (accessToken: any, refreshToken: any, profile: any, cb: any) {
    Users.findOne(
      { facebookId: profile.id },
      async (error: Error, doc: any) => {
        if (error) {
          throw error;
        } else {
          if (!doc) {
            const newUser = new Users({
              facebookId: profile.id,
              username: profile.displayName,
              provider: profile.provider,
            });
            await newUser.save();
            cb(null, newUser);
          } else {
            cb(null, doc);
          }
        }
      }
    );
  }
);
