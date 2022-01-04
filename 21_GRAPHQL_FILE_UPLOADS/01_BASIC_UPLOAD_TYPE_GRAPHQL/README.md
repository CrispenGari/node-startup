### File Uploads Graphql

In this one we are going to create a simple graphql api that will upload files to the server.

### Getting started

To get started we need to setup our server by initializing the backend server with `[initialiseur](https://github.com/CrispenGari/initialiseur)` as follows:

```shell
initialiseur init
```

> For the programming language we will be using typescript. After the initialization is complete we need to install the following packages:

```shell
yarn add graphql@^15.3.0 apollo-server-express type-graphql class-validator reflect-metadata
```

We will go to our `server.ts` and add the following code that will setup the graphql-server on an express application with `type-graphql` and `apollo-server-express`.

```ts
// src/server.ts
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
const PORT: any = 3001 || process.env.PORT;
(async () => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.listen(PORT);
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
})()
  .then(() => {
    console.log(`The server is running on port: ${PORT}`);
  })
  .catch((err) => console.error(err));
```

The `resolvers` looks as follows:

```ts
// src/resolvers/index.ts
import { NonEmptyArray } from "type-graphql";
import { UploadFileResolver } from "./UploadFile";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  UploadFileResolver,
];
```

### Graphql File Upload

We first need to install `graphql-upload`.

```shell
# package
yarn add graphql-upload

# types
yarn add -D @types/graphql-upload
```

### Creating an Upload File Resolver.

We are going to create a `uploadFile` resolver which will be located in the `src/resolvers/UploadFile/index.ts`.

```ts
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { createWriteStream } from "fs";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import path from "path";

@Resolver()
export class UploadFileResolver {
  @Query(() => String)
  async helloWorld(): Promise<string> {
    return "Hello World";
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Arg("picture", () => GraphQLUpload, { nullable: false })
    { createReadStream, filename, encoding, mimetype }: FileUpload
  ): Promise<boolean> {
    console.log(mimetype, encoding, filename);
    return new Promise(async (resolve, reject) => {
      createReadStream()
        .pipe(
          createWriteStream(path.join(__dirname, `../../../images/${filename}`))
        )
        .on("finish", () => resolve(true))
        .on("error", () => reject(false));
    });
  }
}
```

> So note that we are going to save the images in the `images` folder that are in the root folder.

### Uploading a file

1. Using `postman`

- To upload a file using `postman` we need to go to the GraphqlPlayground and write the following mutation:

```
mutation UploadFile($picture: Upload!){
  uploadFile(picture: $picture)
}
```

- Go on the top right conner and click `COPY CURL` button so that you will have something like:

```shell
curl 'http://localhost:3001/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3001' --data-binary '{"query":"mutation UploadFile($picture: Upload!){\n  uploadFile(picture: $picture)\n}\n\n"}' --compressed

```

Then we are interested in the part where it says

```
'{"query":"mutation UploadFile($picture: Upload!){\n  uploadFile(picture: $picture)\n}\n\n"}'
```

Open `Postman` and write the change the request method to `POST` with the following `url`:

```
http://localhost:3001/graphql
```

Change the body to `form` data and add the following `keys` and `values` pairs to the `form`.

1. `operations` key (type is text):

> Note that `\n` escapes must be avoided.

```
{"query":"mutation UploadFile($picture: Upload!){  uploadFile(picture: $picture)}"}
```

2. `map` key (type is string)

```
{"0":["variables.picture"]}
```

2. `0` key (type is file)

- Then you select the file that you want to upload and click send.

If everything went well we should get the following response:

```json
{
  "data": {
    "uploadFile": true
  }
}
```

And if you check the `images` folder in the root folder you will be able to see the image that you have uploaded.

### Querying the uploaded images

To query the uploaded images we use `http://localhost:3001` as the base url and use the `express` middleware `express.static()` so the code in the `server.ts` will change to:

```ts
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { graphqlUploadExpress } from "graphql-upload";
import path from "path";
const PORT: any = 3001 || process.env.PORT;
(async () => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use("/images", express.static(path.join(__dirname, "../images")));
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  app.listen(PORT);
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
})()
  .then(() => {
    console.log(`The server is running on port: ${PORT}`);
  })
  .catch((err) => console.error(err));
```

Now we can be able to get the image from the server by going to the url `http://localhost:3001/images/<image-name>` for example getting the image from the server with name `0.png` we will send a get request at:

```
http://localhost:3001/images/0.png
```

### All Files Query

Let's go to our `resolvers` and create a resolver that will get all the images uploaded on the server and return their urls.

```ts
//
@Resolver()
export class UploadFileResolver {
...
  @Query(() => [String])
  async getFiles(): Promise<string[] | undefined> {
    const images = await fs.readdirSync(
      path.join(__dirname, `../../../images`)
    );
    return images.map((image) => "http://localhost:3001/images/" + image);
  }
}
```

Now if we go to the `GraphQLPlayground` and run the following query:

```
query{
  getFiles
}
```

we get the following response:

```json
{
  "data": {
    "getFiles": [
      "http://localhost:3001/images/0.png",
      "http://localhost:3001/images/_programmers.life_20200617_22.png",
      ..
    ]
  }
}
```

> Next we are going to use this server to upload files using a react application.

### Refs

1. [graphql-upload](https://github.com/jaydenseric/graphql-upload)
2. [dev.to](https://dev.to/lastnameswayne/implementing-image-uploading-with-type-graphql-apollo-and-typeorm-1c63)
