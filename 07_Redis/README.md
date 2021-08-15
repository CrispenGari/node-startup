### Redis.

Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache, and message broker.

### Redis basic commands

Redis is an in-memory database that stored key value pairs. Not that in redis values are stored as strings.

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

### Docs

- [documentation](https://redis.io/documentation)

* [Redis Command](https://redis.io/commands)
