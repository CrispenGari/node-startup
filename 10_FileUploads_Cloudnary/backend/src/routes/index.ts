import { Request, Response, Router } from "express";

import { cloudinary } from "../cloudnary";
const router: Router = Router();

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

export default router;
