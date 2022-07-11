import nodemailer from "nodemailer";
export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "bp5qklp3pb2eptph@ethereal.email", // generated ethereal user
      pass: "e51j2mya8PYHtQa29Y", // generated ethereal password
    },
  });
  const info = await transporter.sendMail({
    from: '"Fake App" <foo@example.com>', // sender address
    to,
    subject: "Reset Password", // Subject line
    html,
  });
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
