import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  html: string,
  subject: string
): Promise<void> => {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "ykekveh2m4yidshw@ethereal.email",
      pass: "Z7FwzKvnZD4Nb5xF2q",
    },
  });

  let info = await transporter.sendMail({
    from: '"Fake Application 👻" <foo@example.com>',
    to,
    subject,
    html,
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
