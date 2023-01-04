import QrCode from "qrcode";

(async () => {
  const qrImage = await QrCode.create(
    "https://github.com/aaron-xichen/pytorch-playground",
    {
      errorCorrectionLevel: "H",
      type: "svg",
      quality: 0.95,
      margin: 1,
      color: {
        dark: "#208698",
        light: "#FFF",
      },
    }
  );
  console.log(qrImage);
})();
