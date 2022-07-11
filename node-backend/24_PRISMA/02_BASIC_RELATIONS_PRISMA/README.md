### BASIC RELATIONS IN PRISMA ORM

In this section we are going to create basic relations in `prisma`. We are going to look at the following relationships:

1. one-one
2. one-many or many-one
3. many-many

### one-one relationship

In this section we are going to look on how we can implement one to one relationship in prisma orm. First we are going to add the following in our `prisma/schema.prisma` file. The relationship that we are going to create is about the `User` and `Profile`. So our model will then look as follows:

```ts
model User {
  id        Int   @id @default(autoincrement())
  firstName String
  lastName  String
  email     String
  profile   Profile?
}

model Profile{
  id Int @id @default(autoincrement())
  user User @relation(fields: [userId], references: [id])
  userId Int
  gender String
  profile String
}
```

After that we will then open the command line and run the following command:

```shell
yarn prisma db push
```

### Creating a user with a profile.

In our `routes/index.ts` file we will create an endpoint that allows us to create a user with a profile as follows:

```ts
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

Now if we send a POST request to `http://localhost:3001/api/user/create` with the following request body:

```json
{
  "firstName": "Name4",
  "lastName": "LastName4",
  "email": "name4@gmail.com",
  "profile": {
    "gender": "male",
    "profile": "http://localhost:3001/strogage/profile/name4.jpg"
  }
}
```

We will get the following `json` response:

```json
{
  "email": "name4@gmail.com",
  "firstName": "Name4",
  "lastName": "LastName4",
  "id": 6,
  "profile": {
    "id": 1,
    "gender": "male",
    "profile": "http://localhost:3001/strogage/profile/name4.jpg"
  }
}
```

### One to Many Relationship

Let's take an example of a model `User` and a model `Post`. We can create a relationship between these two models as 1 to Many relationship. In this situation a `User` can have more `Post` and a `Post` can only belong to the one `User`. To implement this in code we are going to add the following block of code in the `schema.prisma`:

```ts
model User {
  id        Int   @id @default(autoincrement())
  firstName String
  lastName  String
  email     String
  profile   Profile?
  posts     Post[]
}

model Post{
  id Int @id @default(autoincrement())
  user User @relation(fields: [userId], references: [id])
  userId Int
  title String
}
```

After creating this, we will need to run the following command:

```shell
yarn prisma db push
```

### Creating a Post

We are going to create an endpoint where we will be able to create post for the user. In the `routes/index.ts` we are going to add the following code:

```ts
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
```

Now if we go to the a post requests at `http://localhost:3001/api/user/6/post/create` with the following request body:

```json
{
  "title": "My second Post"
}
```

We will get the following response:

```json

  "posts": [
    {
      "id": 1,
      "title": "My first Post",
      "userId": 6
    },
    {
      "id": 2,
      "title": "My first Post",
      "userId": 6
    },
    {
      "id": 3,
      "title": "My second Post",
      "userId": 6
    }
  ]
}
```

### Many To Many Relationship

Let's say we have a model `Post` and a model `Category`. We can map this as a many to many relationship between these two models where 1 Post can have many categories and many categories belongs to many Posts.
Explicit many-to-many relations define three models:

- Two models that have a many-to-many relation, such as Category and Post

* One model that represents the relation table, such as CategoriesOnPosts (also sometimes called JOIN, link or pivot table) in the underlying database.

In the `schema.prisma` we are going to add the following block of code:

```ts
model Post{
  id Int @id @default(autoincrement())
  user User @relation(fields: [userId], references: [id])
  userId Int
  title String
  categories CategoriesOnPosts[]
}

model Category {
  id    Int                 @id @default(autoincrement())
  name  String
  posts CategoriesOnPosts[]
}

model CategoriesOnPosts{
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int // relation scalar field (used in the `@relation` attribute above)
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int // relation scalar field (used in the `@relation` attribute above)
   @@id([postId, categoryId])
}
```

### Ref

1. [www.prisma.io](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/one-to-many-relations)
