### Express.ts + MySQL Server using `mysql2` driver.

In this one we are going to cover a simple REST api application using express typescript and mysql prepared statements.

### Sample code:

```ts
connection.query(
  "SELECT 'HELLO WORLD!';",
  (error: mysql.QueryError, res: UserI | null | undefined) => console.log(res)
);
```

We are going to use a created database find users from the users table.

Unlike from the previous examples we used `connection.query()` to get the data but bare that in mind that we will be using prepared statements therefore we are going to make use of the `connection.execute()`. **All the code will be found in the files.**

### Prepared statement `./src/routes/queries.ts`

```ts
export const FIND_USER = (): string => {
  return `
  SELECT * FROM users WHERE username=? AND password=?;
  `;
};
```

### Making use of the prepared statement `./src/routes/index.ts`

```ts
import { FIND_USER } from "./queries";
import { UserI } from "src/types";
...
router.post("/login/user", (req: Request, res: Response) => {
  const { username, password } = req.body;
  connection.execute(
    FIND_USER(),
    [username, password],
    (error: mysql.QueryError, result: UserI | any) => {
      if (error) {
        throw error;
      }
      return res.status(200).json(result);
    }
  );
});
```
