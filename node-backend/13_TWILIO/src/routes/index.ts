import { Request, Response, Router } from "express";
import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);
const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    name: "Twilio serverless",
    language: "typescript",
    author: "crispengari",
  });
});

// console.log(client);
// Sending sms code
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

// Verification

let SERVICE_SID: string = "";
const getSID = async () => {
  const { sid } = await client.verify.services.create({
    friendlyName: "My First Verify Service",
  });
  SERVICE_SID = sid;
};
getSID();
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
export default router;
