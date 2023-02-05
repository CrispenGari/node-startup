### Fastify

Building APIs using `fastify`

### Getting started

First you need to initialize a node application by running the following command:

```shell
yarn init -y
```

A `package.json` file will be created in the root folder, next we need to install `typescript` dependencies by running the following command

```shell
yarn add typescript @types/node -D
```

Next then we will need to generate a `tsconfig.json` file by running the following command:

```shell
npx tsc --init --rootDir src --outDir build --esModuleInterop --resolveJsonModule --lib es6  --module commonjs --allowJs true --noImplicitAny true
```

Then we will create a `src` directory, that's where `typescript` will look for code. Our `tsconfig.json` will look as follows:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "lib": ["es6"],
    "allowJs": true,
    "outDir": "build",
    "rootDir": "src",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

Next we are going to create a file called `nodemon.json` in the `root` folder of our project and add the following to it:

```json
{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "npx ts-node ./src/server.ts"
}
```

We will need to install `nodemon` as a dev dependence by running the following command:

```shell
yarn add -D nodemon
```

After that we are going to open the `package.json` and add the following `script`

```json
{
  "scripts": {
    "start:dev": "nodemon"
  }
}
```

Now in the `server.ts` we will add the following code to it:

```js
console.log({ message: "Hello there" });
```

Now we can start the server by running the command:

```shell
yarn start:dev
```

### Production Build

For production build we will need to start by installing the following package

```shell
yarn add rimraf -D
```

And then we will create a `build` and `start` scripts in the `package.json`:

```json
{
  "scripts": {
    "start:dev": "nodemon",
    "build": "rimraf ./build && tsc",
    "start": "yarn run build && node build/server.js"
  }
}
```

In development we use:

```shell
yarn start:dev
```

In production we use:

```shell
yarn start
```

### Refs

1. [fastify.io](https://www.fastify.io/)
