### Yarn workspaces Monorepo with Lerna

In this one we are going to expand the previous idea with the use of `lerna`.

<div align="center"><img src="https://user-images.githubusercontent.com/645641/79596653-38f81200-80e1-11ea-98cd-1c6a3bb5de51.png"/></div>

### What are we going to create?

We are going to create a simple project that we can manage using `lerna` and yarn workspaces using the monorepo approach.

### Getting started.

We are going to run the following command to initialize the project using lerna:

```shell
npx lerna init
```

This will generate the following folder structure in our project.

```
📁 monorepo:
    📁 packages
    🗄 .gitignore
    🗄 README.md
    🗄 package.json
    🗄 lerna.json

```

Our `lerna.json` will look as follows:

```json
{
  "packages": ["packages/*"],
  "version": "1.0.0"
}
```

Our `package.json` will be looking as follows:

```json
{
  "name": "root",
  "private": true,
  "version": "1.0.0",
  "devDependencies": {
    "lerna": "^4.0.0"
  }
}
```

Next we are going to create two packages `web` and `server` in the packages folder.

The `web` package will be nothing but a react project which is created using the following command:

```shell
yarn create react-app web
```

We are then going to create a `server` package which will serve a basic `api` using express server.

### Creating our `express` server

We are going to create our `express` server in the `server` package. We are going to initialize our server by running the following commands:

```shell
yarn init -y
```

Then

```shell
yarn add express cors
```

We are then going to create the `src` folder which will contain all the backend logic for our server. In there we are just going to create a basic `express` api that will serve a `json` response on the `GET` request method at `/`.

Our `package.json` will look as follows:

```json
{
  "name": "@monorepo/server",
  "version": "1.0.0",
  "main": "index.js",
  "author": "CrispenGari",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1"
  },
  "scripts": {
    "start": "nodemon src/index.js"
  }
}
```

As you have noticed that we have two `node_modules` folder in both our packages `web` and `server`. We need to clean those packages. We only need `one` single `node_modules` folder in the `root` of our project. So to clean that up we are going to navigate to the `root` folder and run the following command:

First we need to install `lerna` as a `dev` dependency by running the following command:

(optional)

```shell
yarn add -D lerna
```

```shell
npx lerna clean -y
```

> The above command will delete all the node_modules folder in all the packages.

Then we are going to run the `bootstrap` command:

```shell
npx lerna bootstrap --hoist
```

> The above command: _"Link local packages together and install remaining package dependencies"_.

- Delete the `package-lock.json` and run the following command if you want to use `yarn` instead of `npm`:

```shell
yarn
```

Now in the `root` folder in our `package.json` file we are going to add the following `scripts`:

```json
 "scripts": {
    "start": "lerna run start",
    "test": "lerna run test",
    "new-version": "lerna version convectional-commits --yes",
    "diff": "lerna diff"
  }
```

So now if we run the command:

```shell
yarn start
```

We are going to run all the `script` that are named `start` in all the packages in this `repo`.

### Scoping scripts

Sometimes we don't want to run all the `scripts` we want to run the script of a certain package. This is where the `--scoped` flags comes in. We can specify which package do we want to execute it's script or which packages we want to execute their scripts for example:

1. Specifying a single package

```json
"scripts": {
    "start": "lerna run start --scope=web",
    "test": "lerna run test --scope=backend",
}
```

2. Specifying more than one package

```json
"scripts": {
    "start": "lerna run start --scope={web, backend}",
    "test": "lerna run test --scope={backend}",
}
```

> Note that the without the `--scope` flag, by default lerna will run all the the scripts in all the packages.

### Refs

- [docs](https://github.com/lerna/lerna)
