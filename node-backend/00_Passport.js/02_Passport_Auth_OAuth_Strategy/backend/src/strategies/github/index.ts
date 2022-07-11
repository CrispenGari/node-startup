/*
GitHub Passport Strategy

Docs: http://www.passportjs.org/packages/passport-github/
*/
import GitHubStrategy from "passport-github";
import Users from "../../models";
import dotenv from "dotenv";
dotenv.config();

export default new GitHubStrategy.Strategy(
  {
    clientID: `${process.env.GITHUB_CLIENT_ID}`,
    clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
    callbackURL: "http://localhost:3001/auth/github/callback",
  },
  (accessToken, refreshToken, profile, cb) => {
    Users.findOne({ githubId: profile.id }, async (error: Error, doc: any) => {
      if (error) {
        throw error;
      } else {
        if (!doc) {
          const newUser = new Users({
            githubId: profile.id,
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
