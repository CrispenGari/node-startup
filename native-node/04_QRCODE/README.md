### Generating QR Codes in Node

In this repository we are going to learn how to generate `QR-Codes` in node.js using the module called `qrcode`

<p align="center"><img src="cover.webp" alt="cover" width="80%"/></p>

### Installation

To install `qrcode` module we run the following command:

```shell
yarn add qrcode
```

### Generating as simple QR Code

To generate a simple QR code is simple as doing the following:

```js
import QrCode from "qrcode";

(async () => {
  const qrImage = await QrCode.toString("hello there", {
    errorCorrectionLevel: "H",
    type: "terminal",
    quality: 0.95,
    margin: 1,
    color: {
      dark: "#208698",
      light: "#FFF",
    },
  });
  console.log(qrImage);
})();
```

There are various methods that can be used to generate `qr-codes` which are:

1. `toDataURL` to pass into HTML IMG tag.

```js
import QrCode from "qrcode";

(async () => {
  const qrImage = await QrCode.toDataURL("hello there", {
    errorCorrectionLevel: "H",
    type: "image/jpeg",
    quality: 0.95,
    margin: 1,
    color: {
      dark: "#208698",
      light: "#FFF",
    },
  });
  console.log(qrImage);
})();
```

> The above will return a base64 image url

2. `toFile` to create file image.

```js
import QrCode from "qrcode";

(async () => {
  const qrImage = await QrCode.toFile(
    "qr.jpeg",
    "https://github.com/aaron-xichen/pytorch-playground",
    {
      errorCorrectionLevel: "H",
      type: "image/jpeg",
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
```

> This will generate a qr-code and save it as a file. 3. `toString` to create a string representation of the QR Code. If the output format is SVG it will return a string containing XML code.

```js
import QrCode from "qrcode";

(async () => {
  const qrImage = await QrCode.toString(
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
```

I'm specifying the type to be `svg` so that the qrCode will be generated as an svg icon.

4. `toCanvas` to draw QR code symbol to node canvas. You have to pass the document id where canvas should be drawn.

   > Here you need to link the generated qr-code with the html5 canvas element read more [here](https://www.npmjs.com/package/qrcode)

5. `create` to generate a QR Code symbol and returns a QRcode object.

```js
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
```

### Refs

1. [www.npmjs.com](https://www.npmjs.com/package/qrcode)
