### VONAGE

In this one we are going to learn how to use `vonage` in sendig sms messages using node.js. First we need to install the `vonage` package by running the following command:

```shell
yarn add @vonage/server-sdk dotenv @vonage/auth
```

Next we will need to get the `Keys` and store them in the `.env` file that looks as follows:

```shell
API_KEY = YOURS
API_SECRETE = YOURS
```

Now in the `vonage/index.ts` file we are going to create a client as follows:

```ts
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";

const auth = new Auth({
  apiKey: process.env.API_KEY as string,
  apiSecret: process.env.API_SECRETE as string,
});

export const vonage = new Vonage(auth);
```

Now we want to say when we start our `index.ts` we want to send the message to our phone number.

```ts
import "dotenv/config";
import { vonage } from "./vonage";

(async () => {
  const from = "appname";
  const to = "276*******";
  const text = "Hello how are you?";
  const { messages, messageCount } = await vonage.sms.send({
    to,
    from,
    text,
  });
  console.log({ messages, messageCount });
})()
  .then(() => console.log("Message was sent"))
  .catch((err) => console.log(err));
```

If the message was sent successfully you will see the following logs:

```js
{
  messages: [
    {
      to: '27684671609',
      'message-id': 'a7521d57-93d2-47f3-aa39-c8f87d2bf06b',
      status: '0',
      'remaining-balance': '1.95380000',
      'message-price': '0.02310000',
      network: '65502',
      messageId: 'a7521d57-93d2-47f3-aa39-c8f87d2bf06b',
      remainingBalance: '1.95380000',
      messagePrice: '0.02310000'
    }
  ],
  messageCount: '1'
}
```

### Refs

1. [developer.vonage.com](https://developer.vonage.com/en/home)
