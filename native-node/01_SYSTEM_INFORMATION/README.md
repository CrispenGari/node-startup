### System Information

In this repository we are gong to expose the `systeminformation` package and access information of the computer using node.js.

### Installation

To install `systeminformation` we need to run the following command

```shell
yarn add systeminformation
```

Our `package.json` will look as follows

```json
{
  "name": "01_SYSTEM_INFORMATION",
  "version": "1.0.0",
  "main": "index.js",
  "author": "CrispenGari",
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "start": "nodemon src/index.ts"
  },
  "dependencies": {
    "systeminformation": "^5.11.24",
    "typescript": "^4.7.4"
  },
  "devDependencies": {
    "nodemon": "^2.0.19"
  }
}
```

### General

In this section we are going to write a script that will allow us to get the general system information.

```ts
const version = si.version();
const time = si.time();
console.log({
  version,
  time,
});
```

The `si.get()` function is an alternative, where you can obtain several system information data in one call.

```ts
si.get({
  cpu: "*",
  osInfo: "platform, release",
  system: "model, manufacturer",
  processLoad: "(postgres) pids, cpu",
  networkInterfaces: "iface, ip4 | iface:en0",
}).then((res) => console.log(res));
```

### System

In this section we are going to get the hardware information of our computer.

```ts
si.system().then((res) => console.log(res));
```

```ts

```

```ts

```

```ts

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

```

### Ref

1. [systeminformation](https://systeminformation.io/general.html)
