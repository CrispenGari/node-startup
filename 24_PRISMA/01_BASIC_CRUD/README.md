### BASIC `CRUD` OPERATIONS

This section is just a continuation from the previous section on the `User` model. We are going to create a basic crud api that performs the following operations using `prisma`.

- CREATE
- READ
- UPDATE
- DELETE

In our `server.ts` we are going to create a basic express application as follows.

```ts
import "dotenv/config";
import express from "express";
import router from "./routes";
import cors from "cors";
const port: any = 3001 || process.env.PORT;

(async () => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(router);

  app.listen(port);
})().then(() => console.log("Server started at port: %s", port));
```

We are then going to write all our code in the `routes/index.ts` file.

### CREATE

In the `routes/index.ts` file we are going to add the following block of code that allows us to Create a user and save it using `prisma`.

```ts
....
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

```

### READ

We are going then to read the users that are stored in our database.

#### Getting all users

```ts
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
```

#### Getting a single user

```ts
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
```

### UPDATE

We are then going to create an update endpoint `/api/user/:id/update` and update the records of the user.

```ts
router.put(
  "/api/user/:id/update",
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
      const updatedUser: User = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          firstName: req.body?.firstName ?? user.firstName,
          lastName: req.body?.lastName ?? user.lastName,
          email: req.body?.email ?? user.email,
        },
      });

      return res.status(201).json(updatedUser);
    } catch (error) {
      return res.status(500).json({
        message: error.message.toString(),
      });
    }
  }
);
```

### DELETE

We are now going to create a `DELETE` endpoint that allows us to delete a user by id.

```ts
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
```

### Next

Next we are going to have a look on how we can work with relations in `prisma`.

### Refs

1. [www.prisma.io](https://www.prisma.io/docs/reference/api-reference/command-reference#run-prisma-init)
