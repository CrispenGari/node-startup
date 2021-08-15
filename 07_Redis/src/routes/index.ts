import { Router, Request, Response } from "express";
import redis from "redis";
import Axios from "axios";
import { PhotoType } from "src/types";

const MAX_AGE: number = 60 * 60;

const axios = Axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/",
});
const client: redis.RedisClient = redis.createClient();
const router: Router = Router();

router.get("/photos", async (_req: Request, res: Response) => {
  const data = await fetchData(`photos`, async () => {
    const { data } = await axios.get("photos/");
    return data;
  });
  return res.status(200).json(data);
});
router.get("/photo/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await fetchData(`photo:${id}`, async () => {
    const { data } = await axios.get("photos/" + id);
    return data;
  });
  return res.status(200).json(data);
});

const fetchData = (key: string, cb: () => Promise<PhotoType | PhotoType[]>) => {
  return new Promise(async (resolve, reject) => {
    await client.get(key, async (error: Error | null, data: string | null) => {
      if (error) {
        return reject(error);
      }
      if (Boolean(data)) {
        return resolve(JSON.parse(String(data)));
      } else {
        const data: PhotoType | PhotoType[] = await cb();
        await client.setex(key, MAX_AGE, JSON.stringify(data, null, 2));
        return resolve(JSON.parse(JSON.stringify(data, null, 2)));
      }
    });
  });
};

export default router;
