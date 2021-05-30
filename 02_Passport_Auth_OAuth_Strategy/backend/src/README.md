## Open Authentication (OAuth)

### OAuth Strategies.

1. Google

- Authenticate using google.
- First of all we need to get some [credentials](https://console.cloud.google.com/apis/dashboard?pli=1) from google developers.
  - Go to [Google Console](https://console.cloud.google.com/apis/dashboard?pli=1)
  - Create an OAuth application

<p align="center">
  <img src="">
</p>

Installation

```shell
npm install passport-google-oauth20
```

In the backend:

```ts
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      cb(null, profile);
    }
  )
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000",
    session: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
  }
);
```

In the frontend:

```js
const googleLogin = () => {
  window.open("http://localhost:3001/auth/google", "_self");
};
```

2. Facebook

- Authenticate using Facebook
- First of all we need to get some [credentials](https://developers.facebook.com/apps/) from facebook developers.

3. GitHub

- Authenticate using GitHub
- First of all we need to get some [credentials](https://github.com/settings/developers) from github for developers.
  - Create a new application
  - Get the ClientId and Client secrets

4. Twitter

- Authenticate using Twitter.
- First of all we need to get some [credentials](https://developer.twitter.com/en/portal/projects-and-apps) from twitter for developers.
  - Create a new application
  - Get the API Key and API Secret Key

```shell
 npm install passport-twitter-oauth2
```
