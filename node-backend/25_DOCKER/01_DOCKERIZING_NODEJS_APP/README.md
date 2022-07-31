### Docker-izing Nodejs App

In this readme we are going to learn how to dockerize nodejs express application. So basically we will do the following.

1. create a nodejs express application
2. create a `Dockerfile` - a blueprint to build a docker image
3. building an image for our express application
4. running our image as a container.

### Creating an express app

We are gong to create a simple express application in our `app.js`.

```js
const express = require("express");
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";
app = express();

app.all("*", (req, res) =>
  res.status(200).json({
    status: 200,
    message: "Hello world from Docker.",
  })
);

app.listen(PORT, HOST, () =>
  console.log("The server is running on port: %s", PORT)
);
```

### Dockerfile

A dockerfile is a blueprint tha allow us to create docker images. We want to create an image based for our express application. For that we need to create a `Dockerfile` in the root folder of our app.

```
FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

So we are building our image based on the `node` image of version `18-alpine`. We are setting the `WORKDIR` to be the `app` folder in the image. Next we are copying the `package.json` and `package-lock.json` in our app folder by the command:

```shell
COPY package*.json .
```

Next we tell docker to install the packages by specifying the command:

```shell
RUN npm install
```

After our packages has been installed we will need to copy the files and folders of our express application using the following command:

```shell
COPY . .
```

> But note that the above command copies everything including the `node_modules` folder of-which the node_modules folder was generated after running `npm install`. So we need to tell docker to ignore the `node_modules` folder by creating a `.dockerignore` file which will look as follows:

```shell
node_modules
```

> Note that the `.dockerignore` files works exactly like the `.gitignore`. Then the last command that will be in our dockerfile is:

```shell
CMD ["npm", "start"]
```

This specifies the entry point of our application. And there should be one `CMD` command and you can have more `RUN` commands.

### Building our image

Next we are going to build an image using the docker `build` command as follows

```shell
docker build -t my-app:1.0 .
```

> `-t` flags tells docker that we want to give our image a tag and. Our image is called `may-app` with a version of `1.0`. The last argument specifies the location of our `Dockerfile`

### Testing our image.

To test our image we need to run the following command:

```shell
docker run -p 3001:3001 my-app:1.0
```

Note that we are exposing our application will be exposed to a port of `3001` using the `-p` flag. Now if we run the `ps` command we will get the following output:

```shell
CONTAINER ID   IMAGE        COMMAND                  CREATED         STATUS         PORTS                    NAMES
f148f71d73c6   my-app:1.0   "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   0.0.0.0:3001->3001/tcp   infallible_black
```

Now we can get the interactive shell of our container by running the following command:

```shell
docker exec -it f148f71d73c6 sh
```

Now you can run linux commands in that interactive shell as follows

```
/app # ls
Dockerfile         README.md          app.js             node_modules       package-lock.json  package.json
```

### Docker compose

Now we can create a docker compose, so that we can run multiple containers at once.

```
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3001:3001"
  db:
    image: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

Now we can run the docker compose up command as follows:

```shell
docker compose up
```

And if we go to `http://localhost:3001` we will get the following response:

```json
{
  "status": 200,
  "message": "Hello world from Docker."
}
```

Now we want to make use of volumes so that our server restart in the container when we make changes from the host. First we need to change our `package.json` start script to use `nodemon` as follows:

```json
{
  ....
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.1",
    "nodemon": "^2.0.19"
  }
}
```

After that we will then need to rebuild our image by running the following command:

```shell
docker build -t my-app:1.0 .
```

Now when we are starting our container we need to specify the volume from the host maped to the volume in the container itself as follows:

```shell
docker run -v C:\Users\crisp\OneDrive\Documents\Node\node-backend\25_DOCKER\01_DOCKERIZING_NODEJS_APP:/app -p:3001:3001 my-app:1.0
```

We can use a docker compose to start our application with containers as follows:

```yml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - C:\Users\crisp\OneDrive\Documents\Node\node-backend\25_DOCKER\01_DOCKERIZING_NODEJS_APP:/app
  db:
    image: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=password
```
