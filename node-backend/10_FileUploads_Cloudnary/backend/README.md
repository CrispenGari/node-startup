### Cloudnary File Upload in Node.js

We are going to use cloudnery as our cloud storage to store images from a react application.

### Installation

```
yarn add cloudinary
```

### Creating a preset

1. Go to the settings
2. Go to the upload tab
3. Go to Upload presets and create a new preset

### Configuring `cloudinary`

We are going to create a config `cloudinary` folder and the `index.ts` file in it will be looking as follows:

```ts
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export { cloudinary };
```

### Uploading an image

Note that the frontend should send us a `base64` string to upload. The logic to do that is as follows:

```ts
router.post("/api/upload", async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const uploadRes = await cloudinary.uploader.upload(data, {
      public_id: Math.random().toString(),
      upload_preset: "node_backend", // the folder we are uploading
    });
    return res.status(200).json(uploadRes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
});
```

### Getting all the images.

```ts
router.get("/api/all-images", async (_req: Request, res: Response) => {
  try {
    const { resources } = await cloudinary.search
      .expression("folder:node_backend")
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute();
    return res.status(200).json(resources);
  } catch (error) {
    console.log(error);
    return;
  }
});
```

### Deleting an image from storage

To delete an image we do it as follows:

```ts
router.delete("/api/delete/:id", async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    //  Id is like node_backend-0.4854037185186677 instead of node_backend/0.4854037185186677
    id = id.replace("-", "/");
    const results = await cloudinary.api.delete_resources([id]);
    return res.status(201).json(results);
  } catch (error) {
    console.log(error);
    return;
  }
});
```

Or:

```ts
router.delete("/api/delete/:id", async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    //  Id is like node_backend-0.4854037185186677 instead of node_backend/0.4854037185186677
    id = id.replace("-", "/");
    const results = await cloudinary.uploader.destroy(id, {
      invalidate: true,
    });
    return res.status(201).json(results);
  } catch (error) {
    console.log(error);
    return;
  }
});
```

**I recommend the first second method.**

### Ref

- [Docs](https://cloudinary.com/documentation/node_integration#installation_and_setup)
