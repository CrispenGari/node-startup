## Backend

This is the passport authentication backend with mongodb, express and typescript.

### TypeScript configuration.

1. Create a `tsconfig.json` in the root folder with the following configurations.

> `tsconfig.json`

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "outDir": "build/dist",
    "module": "commonjs",
    "target": "es5",
    "lib": ["es6", "dom"],
    "sourceMap": true,
    "allowJs": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "rootDir": "src",
    "noImplicitAny": true
  }
}
```

Then install the following dependencies:

```shell
npm install ts-node tsc typescript

```

Then now when installing the packages, we install the `js` package as well as the `@types` package as a dev dependence for example:

```shell
npm install <package>
npm install -D @types/<package>
            |
npm install express
npm install -D @types/express
```

### Starting the typescript server.

First we need to install nodemon, so that the server will automatically reload on save. To install nodemon we run the following command.

```shell
npm install -D nodemon
```

Then in the package.json we modify our `start` script to look as follows:

```json
"scripts": {
        "start": "node build/dist/index.js",
        "build": "tsc -p .",
        "dev": "nodemon --exec ts-node src/server.ts"
    }
```

### The `.env` file.

This file allows us to create our environment variables. This is allows us to hide our backend api keys and credentials especially when we will post the code on github. We will just add a `.env` file in the `.gitignore` file so that it will be ignored when making commits to github. So to make use of the `.env` we need to install the `dotenv` package as follows.

```shell
npm install dotenv
```
