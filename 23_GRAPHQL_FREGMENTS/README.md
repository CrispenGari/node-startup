### GraphQL Fragments

In this readme file we are going to demostrate the basic usage of graphql fragments. We are going to clone the server code from [this folder](https://github.com/CrispenGari/nextjs-ts/tree/main/01_Next_Cool/10_URQL_CLIENT/server) and run the following command to install all the packages that were used in this backend server.

```shell
yarn
```

> Note that we are not going to built the backend server from scratch, i just want to show how to use graphql fragments.

To start the server run the following command:

```shell
yarn start:fast
```

Then when the server is up and running visit http://localhost:3001/graphql for the graphql playground interface.

### Schemas

We have the following schemas in our graphql api.

```
type Query {
  hello: String!
  todos: [Todo!]!
  todo(id: Int!): Todo
}

type Todo {
  id: Int!
  createdat: String!
  updatedat: String!
  title: String!
  completed: Boolean!
}

type Mutation {
  addTodo(title: String!): Todo!
  deleteTodo(id: Int!): Boolean!
  updateTodo(id: Int!): Todo
}
```

### Definition

A GraphQL fragment is a piece of logic that can be shared between multiple queries and mutations.

Considering our `Todo` Schema we can create a new fragment for the craetedat and updatedat fields named `Date`. Let's say we want to query all todos in the api we and retrive all the fields we can run the following query:

```
query {
  todos {
    createdat
    updatedat
    id
    title
    completed
  }
}
```

To get the following response:

```json
{
  "data": {
    "todos": [
      {
        "createdat": "1644326523162",
        "updatedat": "1644326523162",
        "id": 3,
        "title": "django",
        "completed": false
      },
      {
        "createdat": "1644327443190",
        "updatedat": "1644327551000",
        "id": 4,
        "title": "dealing with ssr",
        "completed": true
      },
      {
        "createdat": "1644327532734",
        "updatedat": "1644327532734",
        "id": 7,
        "title": "new todo",
        "completed": false
      }
    ]
  }
}
```

### Using fragments

Now we want to do the same task using fragments on the created and updated at date field called `date`. Creating a fragment on a todo is simple as doing the following:

```
fragment Dates on Todo {
  createdat
  updatedat
}
```

Now when querying all todos we can do it as follows using fragment `Dates`:

```
query {
  todos {
    ...Dates
    id
    title
    completed
  }
}
```

If we run the above query in the playground we will get the following response:

```json
{
  "data": {
    "todos": [
      {
        "createdat": "1644326523162",
        "updatedat": "1644326523162",
        "id": 3,
        "title": "django",
        "completed": false
      },
      {
        "createdat": "1644327443190",
        "updatedat": "1644327551000",
        "id": 4,
        "title": "dealing with ssr",
        "completed": true
      },
      {
        "createdat": "1644327532734",
        "updatedat": "1644327532734",
        "id": 7,
        "title": "new todo",
        "completed": false
      }
    ]
  }
}
```

> Note that fragments works the same on mutation and queries.

If you want to know more about fragments read visit [www.apollographql.com](https://www.apollographql.com/docs/react/data/fragments/)

### Ref

1. [www.apollographql.com](https://www.apollographql.com/docs/react/data/fragments/)
