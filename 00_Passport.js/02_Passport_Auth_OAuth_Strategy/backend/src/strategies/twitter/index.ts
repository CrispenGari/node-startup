/*
Twitter Passport Strategy
Docs: http://www.passportjs.org/packages/passport-twitter/
*/
import Users from "../../models";
import TwitterStrategy from "passport-twitter";

import dotenv from "dotenv";
dotenv.config();

export default new TwitterStrategy.Strategy(
  {
    consumerKey: `${process.env.TWITTER_APP_ID}`,
    consumerSecret: `${process.env.TWITTER_APP_SECRET}`,
    callbackURL: "http://localhost:3001/auth/twitter/callback",
  },
  (accessToken: any, refreshToken: any, profile: any, cb: any) => {
    Users.findOne({ twitterId: profile.id }, async (error: Error, doc: any) => {
      if (error) {
        throw error;
      } else {
        if (!doc) {
          const newUser = new Users({
            twitterId: profile.id,
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
