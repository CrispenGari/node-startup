### Pagination (REST)

We are going to illustrate how we can create pagination from the backend. We are going to create pagination api using the following databases:

1. MongoDB
2. MySQL
3. PostgreSQL

**Note**: We are using typescript as a programming language

### Project Initialization'

Run the following command to initialize the project

```
npx @crispengari/node-backend
```

### Installation of required dependencies

```shell
yarn add pg mysql2 mongoose

# Types installations
yarn add -D @types/pg
```

### Creating Pagination with MongoDB

We first need to create our simple model and populate it with data. The code can be found in the folder `mongodb/models`. For populating the data in the database we are going to write the following code in the `server.ts`:

```ts
...
mongoose.connect(connectionURL, () => console.log("connected to mongodb"));
mongoose.connection.once("open", async () => {
  console.log("connection is now open");
  if ((await Post.countDocuments().exec()) > 0) return;

  // Promise.all([]);
  for (let p of posts) {
    await Post.create({
      title: p.post,
    });
  }
});
```

We are going to create a middleware function which we will reuse with other drivers such as mysql. This middleware is responsible for executing or querying the data from the Model. The model will be the Mongo DB model that we have created before. For now the middleware looks as follows:

```ts
// src/middlewares/index.ts

import { Request, Response } from "express";
/*
This is our middleware function that:
    * Takes a model
    * Get the required results
    * return the results
    * call next() -> To execute the next middleware
*/
const fetchResults = (model: any) => {
  return async (req: Request, res: Response | any, next: any) => {
    const page: number = Number.parseInt((req.query as any).page);
    const limit: number = Number.parseInt((req.query as any).limit);
    const results: any = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model.find({}).limit(limit).skip(endIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({
        code: 500,
        error,
      });
    }
  };
};
export default fetchResults;
```

Now in our `router/index.ts` file we will be having the following code:

```ts
import { Router, Request, Response } from "express";
import fetchResults from "../middlewares";
import Post from "../mongodb/models";
const router: Router = Router();
router.get(
  "/posts",
  fetchResults(Post),
  (_req: Request, res: Response | any) => {
    return res.json(res.paginatedResults);
  }
);
export default router;
```

So all we have to do is to query results at http://localhost:3001/posts?limit=5&page=5 and specify the page size and limit per page to get the required results. If we run the following in the file `response.rest` we ill get the following json response:

```json
{
  "next": {
    "page": 6,
    "limit": 5
  },
  "previous": {
    "page": 4,
    "limit": 5
  },
  "results": [
    {
      "_id": "6128c9416070bc301f1234bc",
      "title": "Indigo",
      "date": "Fri Aug 27 2021 13:14:56 GMT+0200 (South Africa Standard Time)",
      "__v": 0
    },
    {
      "_id": "6128c9416070bc301f1234be",
      "title": "Turquoise",
      "date": "Fri Aug 27 2021 13:14:56 GMT+0200 (South Africa Standard Time)",
      "__v": 0
    }
    ...
    ]
}
```

Now we have our pagination with mongodb database. The idea is the same with `MySQL` and `PostGreSQL` all we have to do is to change the way we are querying data.

### MySQL Pagination

1. Create database post

```sql
CREATE DATABASE posts;
```

2. Selecting the database

```sql
USE posts;
```

3. Create a table called post:

```sql
CREATE TABLE IF NOT EXISTS posts(
  id INT NOT NULL AUTO_INCREMENT,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  PRIMARY KEY(id)
);
```

**Note** This command is the one that will help us send paginated data to the user:

```ts
`SELECT * FROM posts LIMIT ${startIndex}, ${startIndex};`;
```

4. We are going to fill the table with dummy data as follows:

```ts
// server.ts

(async () => {
  if ((await connection.query("SELECT * FROM posts;"))[0] as any) {
    return;
  }
  for (let p of posts) {
    const COMMAND = `INSERT INTO posts(title) values("${p.post}");`;
    await connection.query(COMMAND);
  }
})().then(() => {
  console.log("Insert Done");
});
```

Our middleware for mysql will be in the `middlewares/mysql.ts` file and it looks as follows:

```ts
import { Request, Response } from "express";
import mysql from "mysql2/promise";
const port: number = 3306;
const user: string = "root";
const password: string = "root";
const host: string = "127.0.0.1" || "localhost";
export const connection = mysql.createPool({
  user: user,
  port: port,
  host: host,
  password: password,
  database: "posts",
});

/*
This is our middleware function that:
    * Takes a model
    * Get the required results
    * return the results
    * call next() -> To execute the next middleware
*/
const fetchResults = () => {
  return async (req: Request, res: Response | any, next: any) => {
    const page: number = Number.parseInt((req.query as any).page);
    const limit: number = Number.parseInt((req.query as any).limit);
    const results: any = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const conn = await connection.getConnection();
    const all = await conn.query(`SELECT * FROM posts;`);
    console.log((all[0] as any).length);
    if (endIndex < (all[0] as any).length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = (
        (await conn.query(
          `SELECT * FROM posts LIMIT ${startIndex}, ${startIndex};`
        )) as any
      )[0];
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({
        code: 500,
        error,
      });
    }
  };
};
export default fetchResults;
```

We will then go and create a route for `mysql` and call the `mysql` middleware that we have just created on our `/posts/mysql` route as follows:

```ts
router.get(
  "/posts/mysql",
  fetchResultsMySql(),
  (_req: Request, res: Response | any) => {
    return res.json(res.paginatedResults);
  }
);
```

### PostgreSQL Pagination API

### Uses

- This idea is very usefull in programing because it improve the performance of our application. Instead of querying all the data at once we fetch the data that is required by the user at a time.
