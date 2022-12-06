### Getting started

In this repository we are going to walk through on how to start a graphql server using the `graphql-yoga`. First of all we need to install the packages as follows:

```shell
yarn add graphql graphql-yoga
```

> Note that i will be using `yarn` as my package manager feel free to use any package manager that you want.

### Creating a graphql Schema

There are many ways of creating a graphql schema as shown [here](https://the-guild.dev/graphql/yoga-server/docs#schema). We are going to use the `graphql-yoga` way of creating a schema. First we will open a file called `schema.js` which will contain the following code in it:

```js
import { createSchema } from "graphql-yoga";
export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    `,
  resolvers: {
    Query: {
      hello: () => "Hell world!!",
    },
  },
});
```

Now that we have our `schema` we can create a `server` that will server this simple graphql api. In our `index.js` file we are going to add the following to it:

```js
import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema.js";

const yoga = createYoga({
  schema,
  graphiql: true,
  cors: false,
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(3001, () =>
  console.log(`The server is running at: http://localhost:3001/graphql`)
);
```

Now if you start the server by running the following command:

```shell
yarn dev
```

And open the url: `http://localhost:3001/graphql` on the browser, you should be able to send a query to the server which as follows:

```graphql
query HelloWorld {
  hello
}
```

To get the following response:

```json
{
  "data": {
    "hello": "Hell world!!"
  }
}
```

If you don't specify `graphiql` to false then the graphiql interface will not be rendered when you visit `http://localhost:3001/graphq` and you will automatically get the following response:

```json
{
  "data": {
    "hello": "Hell world!!"
  }
}
```

### Context

A context is usually created for each execution of a GraphQL Operation, and it is injected into the GraphQL field resolver functions. The context is normally used when you are doing dependency injection for example if you want to access the user context or something like that. We will look later on on how we can use this context by example. Context is constructed for each incoming http request and graphql-yoga have the default context that can be accessed out of the fly such as `requests` and `params`.

### Getting the context

We are going to demonstrate how to access the request header called `x-foo` from our `hello` query and console log it to the terminal. Our `schema` will change to:

```js
import { createSchema } from "graphql-yoga";

export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    `,
  resolvers: {
    Query: {
      hello: (_, _args, context) => {
        console.log(context.request.headers.get("x-foo"));
        return "hello world";
      },
    },
  },
});
```

Now when we send the query:

```
query HelloWorld{
  hello
}
```

With the following headers:

```json
{
  "x-foo": "hello there my auth header."
}
```

We will be able to see the `"hello there my auth header."` as a value in our console.

### Passing Context

This is one of the useful feature in graphql, it allows us to pass in the context that can be accessed in all of our graphql resolvers. Here is how we can pass our own context to the server.

```js
const yoga = createYoga({
  schema,
  graphiql: true,
  cors: false,
  graphqlEndpoint: "/graphql",
  context() {
    return {
      someNumber: -10,
    };
  },
});
```

Now in the `schema.js` file we are going to modify it to look as follows:

```js
export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    `,
  resolvers: {
    Query: {
      hello: (_, _args, context) => {
        console.log(context.someNumber);
        return "hello world";
      },
    },
  },
});
```

> Now when run the hello query we should be able to get the `-10` number on the console which is coming from our `context`.

### Subscriptions

Subscriptions are used to send real-time data. You don't need to install extra packages to start working with subscriptions in `graphql-yoga`. In the following example I will show based on their example in the docs of `counting` down.

```js
// schema.js

import { createSchema } from "graphql-yoga";

export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    type Subscription {
        countdown(from: Int!): Int!
      }
    `,
  resolvers: {
    Query: {
      hello: (_, _args, context) => {
        console.log(context.someNumber);
        return "hello world";
      },
    },
    Subscription: {
      countdown: {
        // This will return the value on every 1 sec until it reaches 0
        subscribe: async function* (_, { from }) {
          for (let i = from; i >= 0; i--) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            yield { countdown: i };
          }
        },
      },
    },
  },
});
```

Now in the graphiql interface we will then send a following graphql subscription to our server:

```
subscription CountDown($start: Int!){
  countdown(from: $start)
}
```

With the following variables

```json
{
  "start": 9
}
```

We will be able to see the countdown application starting from `9` up until it reaches 0:

```json
{
  "data": {
    "countdown": 0
  }
}
```

### Handing Subscriptions on the Client

Handling graphql subscriptions on the client has been explained very well in the docs you can read more about it [here](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions#handling-subscriptions-on-the-client).

### Pubsub

GraphQL Yoga comes with a built-in `PubSub` (publish/subscribe) bus. This makes it easy to send new events to the client from within your mutation resolvers. We want to create a new subscription event that will listen to the `newMessage` event. So we are going to modify our `schema.js` file to look as follows:

```js
import { createSchema, createPubSub } from "graphql-yoga";

const pubSub = createPubSub();
export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    type Subscription {
        countdown(from: Int!): Int!
    }
    type Subscription{
        message: String!
    }
    type Mutation{
        sendMessage(message: String!): Boolean!
    }
    `,
  resolvers: {
    Query: {
      hello: (_, _args, context) => {
        console.log(context.someNumber);
        return "hello world";
      },
    },
    Subscription: {
      countdown: {
        // This will return the value on every 1 sec until it reaches 0
        subscribe: async function* (_, { from }) {
          for (let i = from; i >= 0; i--) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            yield { countdown: i };
          }
        },
      },
      message: {
        // subscribe to the newMessage event
        subscribe: () => pubSub.subscribe("newMessage"),
        resolve: (payload) => payload,
      },
    },
    Mutation: {
      sendMessage: (_, args) => {
        // publish a new message
        pubSub.publish("newMessage", args.message);
        return true;
      },
    },
  },
});
```

Now when we run a mutation `sendMessage` with the variable `message` from `graphiql` as follows:

```
mutation SendMessage($message: String!){
  sendMessage(message: $message)
}
```

Variables:

```json
{
  "message": "hi"
}
```

And when our subscription is already running:

```
subscription Messages{
  message
}
```

On every mutation that we make, we receive real time data from our subscription which looks as follows:

```json
{
  "data": {
    "message": "hi"
  }
}
```

### File Uploads

Graphql-yoga allows us to do [file-uploads](https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads). In this example we are going to demonstrate how we can do file uploads in graphql-yoga. So basically we are just going to read an uploaded text file.

In our `schema.js` file we are going to have the following:

```js
import { createSchema, createPubSub } from "graphql-yoga";

const pubSub = createPubSub();
export const schema = createSchema({
  typeDefs: `
    scalar File
    type Mutation {
        readTextFile(file: File!): String!
    }
    `,
  resolvers: {
    Mutation: {
      readTextFile: async (_, { file }) => {
        const textContent = await file.text();
        return textContent;
      },
    },
  },
});
```

Now we can go ahead and send a `cURL` request to the graphql server with the file `names.txt` as follows:

```shell
curl http://localhost:3001/graphql \
  -F operations='{ "query": "mutation ($file: File!) { readTextFile(file: $file) }", "variables": { "file": null } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@names.txt
```

We should be able to see the following response from the server:

```json
{ "data": { "readTextFile": "name1\r\nname2" } }
```

### Using Postman

- To do file upload using postman you need to change the request method to `POST` with the url `http://127.0.0.1:3001/graphql`.
- Select `body` and choose `form-data`.
- For the first key `operations` and the following value `{ "query": "mutation ($file: File!) { readTextFile(file: $file) }", "variables": { "file": null } }` with type `text`
- For the second key `map` add the following value `{ "0": ["variables.file"] }` with type of `text`
- For the last key `0` change the type to `file` and for the value choose the file that you want to upload and click `Send`.

> That's all you will be able to see the contents that are in that file based on our mutation.

### Refs:

1. [yoga-server](https://the-guild.dev/graphql/yoga-server/docs)
