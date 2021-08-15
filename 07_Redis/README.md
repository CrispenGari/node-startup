### Redis.

Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache, and message broker.

### Redis basic commands

Redis is an in-memory database that stored key value pairs. Not that in redis values are stored as strings.

0. Getting all the keys in the redis database

```
KEYS *
```

1. Storing a value

```
SET <key> <value>
```

2. Setting a values that are separated by spaces

```
SET <key> "this is a value"
```

3. Getting a value

```
GET <key>
```

4. Deleting a value

```
DEL <key>
```

5. Deleting all values

```
FLUSHALL
```

5. Setting the expiring time for a key

```
EXPIRE <KEY> <TIME | seconds>
```

6. Checking how long the stored key will last in the database

```
TTL <key>
<!-- -1 for never expire -2 expired or +N seconds not yet expired -->
```

7. Checking if the key exists in the database

```
EXISTS <key>
<!-- 0 or 1 -->
```

8. Creating a record with expire time

```
SETEX <KEY> <SECONDS> <VALUE>
```

### Arrays and list

9. Creating arrays

```
LPUSH <key> value, value...
<!-- OR -->
RPUSH <key> value, value...
```

10. Getting values of arrays

```
LRANGE <START> <STOP>
<!-- Example -->
LRANGE 0 -1
```

11. Removing elements in arrays

```
LPOP <key>
<!-- OR -->
RPOP <key>
```

### SETS

12. Creating a set

```
SADD <key> member1, member2, ....
```

13. Deleting a member of a set

```
SREM <key> member1, member2, ....
```

14. Getting all members of a set

```
SMEMBERS <key>
```

### Hash Set

15. Adding values in an HSET

```
HSET <key> <field> <value>
```

17. GETTING values in an HSET

```
HGET <key> <field>
```

18. Getting all the keys and values

```
HGETALL <key>
```

19. Deleting in an HSET

```
HDEL <key> <field> [field ...]
```

### Real world example

We are going to use the [jsonplaceholder](https://jsonplaceholder.typicode.com/photos) api to make api request using `axios` and postman together with redis `cache`. We will be fetching all the photos and a specific photo from this api and store the data in redis database. This will improve the performance our application by `~99%` on the second call of the API.

To setup the backend for this application I'm going to use my package that generates boiler plate code start up. We are going to use typescript in our case. The package is very easy to use and easy to spin up all you need to do it to run:

```
npx @crispengari/node-backend
```

The [docs can be found here](https://github.com/CrispenGari/nodejs-backend)

### Installing Redis

```
yarn add redis
<!-- And then -->
yarn add @types/redis
```

### Installing axios

```
yarn add axios
<!-- And then -->
yarn add @types/axios -D
```

### Creating a redis client

- Make sure that the redis server is running on the background.
  To create a client we just do it as follows:

```ts
import redis from 'redis'
....
const client = redis.createClient()
```

### Storing photos data in redis server.

- The idea is that we make an api request to the server, In my case it took `5s` for the first time.
- We then store the data in a redis server so that next time we won't bother making an api call to the server.
- Note that redis values are stored as strings
- Here is the code that stored data in a redis server

```ts
router.get("/photos", async (req: Request, res: Response) => {
  await client.get(
    "photos",
    async (error: Error | null, data: string | null) => {
      if (error) {
        console.error(error);
        return;
      }
      if (Boolean(data)) {
        return res.status(200).json(JSON.parse(String(data)));
      } else {
        if (req.method === "GET") {
          const { data } = await axios.get("photos");
          await client.setex("photos", MAX_AGE, JSON.stringify(data, null, 2));
          return res.status(200).json(data);
        } else {
          return res.status(500).json({
            message: "Only get request are allowed",
            code: 500,
          });
        }
      }
    }
  );
});
```

- In the second call an api call took `~84ms` to fetch the data from redis.

* Now let's say we want to find a single photo. This takes around `500ms` to get a single photo for the first time of a specific id.

```ts
router.get("/photo/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await client.get(
    `photo:${id}`,
    async (error: Error | null, data: string | null) => {
      if (error) {
        console.error(error);
        return;
      }
      if (Boolean(data)) {
        return res.status(200).json(JSON.parse(String(data)));
      } else {
        if (req.method === "GET") {
          const { data } = await axios.get("photos/" + id);
          await client.setex(
            `photo:${id}`,
            MAX_AGE,
            JSON.stringify(data, null, 2)
          );
          return res.status(200).json(data);
        } else {
          return res.status(500).json({
            message: "Only get request are allowed",
            code: 500,
          });
        }
      }
    }
  );
});
```

- By getting the photo by it's `id`, we then store it in the redis database as `photo:id` so that when we search again for the same photo the query won't take that long. In my case on the second search we it took `~12ms` from `500ms`. **That's how we can use redis to improve the performance of our application.**

### Make it more cleaner and fancy for the love of typescript.

We can even perform the task we performed above with cleaner and shorter code. Let's create a function called `fetchData` that takes in a callback and a key as its parameters and return a promise rejection or resolved. In this example we are going to use `types`.

```ts
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
```

The key is of string type and the callback is a function which returns a promise of type array or a `PhotoType`. This type in in the folder `type/index.ts` and it looks as follows:

```ts
export type PhotoType = {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};
```

- Then out two routes will change to:

```ts
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
```

We are passing a key and get the data back which we will then send to the client.

### Docs

- [documentation](https://redis.io/documentation)

* [Redis Command](https://redis.io/commands)
