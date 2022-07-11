import { Request, Response, Router } from "express";
import { PrismaClient, User } from "@prisma/client";

const router: Router = Router();
const prisma = new PrismaClient();

router.post(
  "/api/user/create",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, firstName, lastName } = req.body;
      const user: User = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
        },
      });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);

router.get(
  "/api/user/all",
  async (_req: Request, res: Response): Promise<any> => {
    try {
      const users: User[] = await prisma.user.findMany();
      return res.status(201).json(users);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);

router.get(
  "/api/user/:id",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const id = req.params?.id;
      const user: User | null = await prisma.user.findFirst({
        where: {
          id: Number.parseInt(id),
        },
      });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);

router.delete(
  "/api/user/:id/delete",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const id = req.params?.id;
      const user: User | null = await prisma.user.findFirst({
        where: {
          id: Number.parseInt(id),
        },
      });
      if (!user) {
        return res.status(200).json({
          message: "Can not find the user with id: " + id.toString(),
        });
      }

      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
      return res.status(201).json(true);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "backend",
    language: "typescript",
    message: "hello world!",
    programmer: "@programer",
    moto: "i'm a programer i have no life!",
  });
});

export default router;
