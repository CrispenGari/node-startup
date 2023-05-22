import "dotenv/config";
import { vonage } from "./vonage";

(async () => {
  const from = "appname";
  const to = "27684671609";
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
