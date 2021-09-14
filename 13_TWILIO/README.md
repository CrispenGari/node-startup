## Serverless with TWILIO

We are going to have a look on how we can perform a lot of things using twilio for example, sending sms. We are going to use `yarn` as a package manager and typescript as a programming language

### Startup boiler plate

To get the startup boiler plate run the following command:

```shell
npx @crispengari/node-backend
```

### Installation of twilio

To install twilio run the following command.

```shell
yarn add twilio
# or
npm i twilio
```

### Getting started

1. All the route will be in the `src/routes/index.ts` file
2. All the code for each api will be explained in this README file.
3. We are going to use `Postman` to make api requests.
4. We need to create an account with [twillio](https://www.twilio.com/docs/)
5. All the environmental variables will be in the `.env` file which is in the root folder of our project:

```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
```

6. Go to the [twilio console](https://www.twilio.com/console/ahoy) and select the following options:

   - Which Twilio product are you here to use? (SMS)
     - What do you plan to build with Twilio? (Other)
     - How do you want to build with Twilio? (With Code)
     - What is your preferred coding language? (JavaScript)
     - Would you like Twilio to host your code? (Choose any)

7. Get the account `ACCOUNT SID` and `AUTH TOKEN` and replace them in the `.env` file as follows:

```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
```

8. Click on the button <button>Get Trial Phone Number</button>
9. Copy your phone number in the `.env` file.

```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TRIAL_PHONE_NUMBER = YOUR_TRIAL_PHONE_NUMBER
```

Now we are set up let's start building

### 1. Sending messages (SMS|MMS)

The twilio documentation is clear about sending sms but we are going to practically show how we can interact from front to backend using their API. We will be using Postman as our client to send request to the Node-Express backend server.

We want to create an application that sent sms to the number provided by the client.
**Note**: All the numbers should start with a `+`

### Sending and (SMS)

```ts
router.post("/send-sms", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(500).json({
      code: 500,
      message: "only post requests are allowed",
    });
  }

  try {
    let { to } = req.body;
    to = String(to).startsWith("+") ? to : "+" + to;
    to = String(to).trim().replace(/\s/, ""); // no spaces
    const response = await client.messages.create({
      to,
      body: "this message is coming from our backend, which is using typescript (@crispengari)",
      from: process.env.TRIAL_PHONE_NUMBER,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});
```

If you go to http://localhost:3001/send-sms and in the body add the following json:

```json
{
  "to": "+2765..058.." // this should be a valid phone number
}
```

Then the message will be send to that particular phone number.

### Sending an (MMS)

The code will be the same we are going to change the route from '/send-sms' to '/send-mms' and pass the `MediaUrl` as follows:

```ts
router.post("/send-mms", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(500).json({
      code: 500,
      message: "only post requests are allowed",
    });
  }

  try {
    let { to, mediaUrl } = req.body;
    to = String(to).startsWith("+") ? to : "+" + to;
    to = String(to).trim().replace(/\s/, ""); // no spaces
    const response = await client.messages.create({
      to,
      body: "this message is coming from our backend, which is using typescript (@crispengari)",
      from: process.env.TRIAL_PHONE_NUMBER,
      mediaUrl, // or array of medias []
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});
```

### 2. Verify

Again we are going to create a new account as we did and choose the option `verify` instead of `sms` and we will be ready to go. This time we will have two endpoints to sucesifully verify the phone-number. The first endpoint will request for verification and the second endpoint will verify the phone-number.

0. First get the service `SID` as follows:

```ts
let SERVICE_SID: string = "";
const getSID = async () => {
  const { sid } = await client.verify.services.create({
    friendlyName: "My First Verify Service",
  });
  SERVICE_SID = sid;
};
getSID();
```

1. Request for verification (/verify-requests)

```ts
router.post("/verify-requests", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(500).json({
      code: 500,
      message: "only post requests are allowed",
    });
  }

  try {
    let { to } = req.body;

    to = String(to).startsWith("+") ? to : "+" + to;
    to = String(to).trim().replace(/\s/, ""); // no spaces
    const response = await client.verify
      .services(SERVICE_SID)
      .verifications.create({
        to,
        channel: "sms", // sms, call, or email
      });
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});
```

Go to postman to http://localhost:3001/verify-requests. On the request body add the following:

```json
{
  "to": "+2765230..."
}
```

You will receive a message and to verify yourself the following piece of code will take care of the magic.

2. Verification (/verify-approve)

```ts
router.post("/verify-approve", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(500).json({
      code: 500,
      message: "only post requests are allowed",
    });
  }

  try {
    let { to, code } = req.body;
    to = String(to).startsWith("+") ? to : "+" + to;
    to = String(to).trim().replace(/\s/, ""); // no spaces

    const response = await client.verify
      .services(SERVICE_SID as string)
      .verificationChecks.create({
        to,
        code,
      });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});
```

After receiving the `sms` go to http://localhost:3001/verify-approve and add the following in the json body:

```json
{
  "to": "+2765230...",
  "code": "320666" // the code that you have received
}
```

You will get this as response on successful verification:

```json
{
  "sid": "....",
  "serviceSid": ".....",
  "accountSid": "....",
  "to": "+2765230...",
  "channel": "sms",
  "status": "approved",
  "valid": true,
  "amount": null,
  "payee": null,
  "dateCreated": "2021-09-14T13:30:29.000Z",
  "dateUpdated": "2021-09-14T13:30:54.000Z"
}
```

### Conclusion

Sending whats app messages and every API that they offers is really easy and same. Their documentation is the most friendly documentation ever.

### Code.

The whole code will be present in the files
