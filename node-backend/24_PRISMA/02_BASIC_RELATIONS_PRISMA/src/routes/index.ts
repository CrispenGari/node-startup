import { Request, Response, Router } from "express";
import { PrismaClient, User } from "@prisma/client";

const router: Router = Router();
const prisma = new PrismaClient();

router.put(
  "/api/user/:id/post/create",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { title } = req.body;
      const userId = Number.parseInt(req.params?.id);
      const post = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          posts: {
            create: {
              title,
            },
          },
        },
        select: {
          posts: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      });
      return res.status(201).json(post);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);

router.post(
  "/api/user/create",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        email,
        firstName,
        lastName,
        profile: { gender, profile },
      } = req.body;
      const user: User = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          profile: {
            create: {
              gender,
              profile,
            },
          },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          id: true,
          profile: {
            select: {
              id: true,
              gender: true,
              profile: true,
            },
          },
          posts: {
            select: {
              title: true,
              id: true,
            },
          },
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
      const users = await prisma.user.findMany({
        select: {
          email: true,
          id: true,
          profile: {
            select: {
              gender: true,
              profile: true,
            },
          },
        },
      });
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
      const user = await prisma.user.findFirst({
        where: {
          id: Number.parseInt(id),
        },
        select: {
          email: true,
          id: true,
          profile: {
            select: {
              gender: true,
              profile: true,
            },
          },
          posts: {
            select: {
              title: true,
              id: true,
            },
          },
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
