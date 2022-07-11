### Using Docker

In this example we are going to learn practically how we can use docker to develop a simple rest api. In this example we are to create an express application and use it to store data in a `mongodb` database.

### Express application

We are going to create a simple rest application that will store todos in a mongodb database. So to initialize our node backend application we will use the [initialiseur](https://github.com/CrispenGari/initialiseur) `init` command as follows.

```shell
initialiseur init
```

Next we will need to install the `mongoose` by which is a mongodb driver that will allows us to work with mongodb and nodejs as follows:

```shell
yarn add mongoose
```

Next we will create a `models` folder and inside that we will create an `index.ts` file and populate it with the following code,

```ts
import { model, Schema } from "mongoose";

const TodoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});
export default model("todos", TodoSchema);
```

> So we are basically creating a `todos` model on the todo's schema.

We will then go in our `routes/index.ts` file and add the following code:

```ts
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
const router: Router = Router();
import Todos from "../model";

const url: string = "";
mongoose.connect(
  url,
  {
    auth: {
      password: "",
      username: "",
    },
  },
  (err) => {
    if (err) {
      throw err;
    }
    console.log("connected to mongodb");
  }
);
mongoose.connection.once("open", (err) => {
  if (err) {
    throw err;
  }
  console.log("Ready to accept connections");
});

router.get("/todos", (_req: Request, res: Response) => {
  Todos.find({}, (error: any, doc: any) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("No todos found.");
    }
    return res.status(200).send(doc);
  });
});

router.get("/todo/:id", (req, res) => {
  const { id } = req.params;
  Todos.findById(id, (error: any, doc: any) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("Todo not found.");
    }
    return res.status(200).send(doc);
  });
});

router.post("/todo/create", (req: Request, res: Response) => {
  const data = req.body;
  const todo = new Todos(data);
  todo.save();
  res.status(201).send(todo);
});

export default router;
```

### Creating a Docker network

Docker networking is primarily used to establish communication between Docker containers and the outside world via the host machine where the Docker daemon is running. To list all the docker networks that we have we run the following command:

```shell
docker network ls
```

The above command will lists all the networks that we have in docker and the output will be of the simillar nature:

```shell
NETWORK ID     NAME      DRIVER    SCOPE
0963e906cd66   bridge    bridge    local
6b772f802f06   host      host      local
80aa5e46f328   none      null      local
```

We need to create a new network called `mongo-network` that will allow us to estabilish connection between the `mongo` and `mongo-express` by running the following command.

```shell
docker network create mongo-network
```

Now if we list all the networks by running the following command:

```shell
docker network ls
```

We will get the following output

```shell
NETWORK ID     NAME            DRIVER    SCOPE
0963e906cd66   bridge          bridge    local
6b772f802f06   host            host      local
b603ec659b46   mongo-network   bridge    local
80aa5e46f328   none            null      local
```

After creating our network we need to pull two docker images from docker hub which are:

1. mongo
2. mongo-express

We will run the following command to pull these two docker images

```shell
docker pull mongo
# Then
docker pull mongo-express
```

The next thing that we will do is to start our docker images in the same network, which is the network that we have created `mongo-network`.

1. starting the mongo

```shell
docker run -d \
 -p 27017:27017 \
 -e MONGO_INITDB_ROOT_USERNAME=admin \
 -e MONGO_INITDB_ROOT_PASSWORD=password \
 --name mongodb \
 --net mongo-network \
 mongo

# or
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password --name mongodb --net mongo-network mongo
```

2. starting the mongo-express

```shell
docker run -d \
 -p 8081:8081 \
 -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
 -e ME_CONFIG_MONGODB_ADMINPASSWORD=password \
 --name mongo-express \
 --net mongo-network \
 -e ME_CONFIG_MONGODB_SERVER=mongodb \
 mongo-express

#  or
docker run -d -p 8081:8081 -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin -e ME_CONFIG_MONGODB_ADMINPASSWORD=password --name mongo-express --net mongo-network -e ME_CONFIG_MONGODB_SERVER=mongodb mongo-express
```

We are passing a lot of options in the docker `run` command which are:

1. `-d` - running a container in detach mode
2. `-p` - for port binding
3. `-e` - environmental variables, and these environmental variables are required, you can find and read about them in the official image documentation.
4. `--name` - custom name of the container
5. `--net` - for specifying the network in which the container will be running.

> Note that creating a docker network is optional we can start both containers in a default network, in that case you just have to emit the `--net` flag or option

If we run the `ps` command we will see the following output:

```shell
CONTAINER ID   IMAGE           COMMAND                  CREATED              STATUS          PORTS                      NAMES
2390c8483842   mongo-express   "tini -- /docker-ent…"   8 seconds ago        Up 5 seconds    0.0.0.0:8081->8081/tcp     mongo-express
88392516ef5f   mongo           "docker-entrypoint.s…"   About a minute ago   Up 56 seconds   0.0.0.0:27017->27017/tcp   mongodb
```

After that we can go ahead and open the browser at:

```shell
http://localhost:8080
# or
http://127.0.0.1:8080
```

And we will be able to see the interface where we can create our database `todo`

https://gitlab.com/nanuchi/techworld-js-docker-demo-app/-/blob/master/app/server.js
