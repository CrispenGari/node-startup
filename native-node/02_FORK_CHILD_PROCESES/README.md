### Fork Child Processes

Let's say you have a express server that is running and ready to accept requests that are being send. Sometimes other requests has to wait for others to finish. Let's take a example where we have a simple express routes `/hello` and `/isprime/:number`.

```js
app.get("/hello", (req, res) => {
  return res.status(200).json({
    path: "/hello",
    message: "hello world",
  });
});

app.get("/isprime/:number", (req, res) => {
  return res.status(200).json(isPrime(req.params.number));
});
```

Our `isPrime` function is a function that checks if a number is prime or not. If a number is not prime, it will returns all the factors of that number in the object of the following nature:

```json
{
  "number": "3",
  "factors": [],
  "prime": true
}
```

The `isPrime` function looks as follows:

```js
const isPrime = (number) => {
  const factors = [];
  if (number < 1) return false;
  if (number == 1) return true;

  for (let i = 2; i < number; i++) {
    if (number % i === 0) {
      factors.push(i);
    }
  }
  return {
    number,
    factors,
    prime: factors.length > 0 ? false : true,
  };
};
```

We can tell that if we send the request at `http://localhost:3001/isprime/3` and pass a big number instead of `3` this will be a huge computation and when it is running it will block us to make request to `http://localhost:3001/isprime/:number` with a smaller number because the server will be busy. It will also blocks us to make request to our `http://localhost:3001/hello` route as well.

### So how can we solve this problem?

Well we can make use of a `nodejs` module called `child_process` specifically the `fork`. You can read more about this in the [documentation](https://nodejs.org/api/child_process.html) they give a clear explanation of `child_process` in general.

What we will do is to create a file called `child.js` and add our `isPrime` function there

```js
console.log("Process Id: ", process.pid);

const isPrime = (number) => {
  const factors = [];
  if (number < 1) return false;
  if (number == 1) return true;

  for (let i = 2; i < number; i++) {
    if (number % i === 0) {
      factors.push(i);
    }
  }
  return {
    number,
    factors,
    prime: factors.length > 0 ? false : true,
  };
};
```

Now if we change our `isprime` route to:

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  return res.status(200).json(child.pid); //res.status(200).json(isPrime(req.params.number));
});
```

And if we make a request to this route a child process will be created. And we will be able to see the process id from the console as well as from the browser.

### Sending the data to the child process.

We can send the data to the child process using the method, send as follows:

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  child.send({
    number: req.params.number,
    pid: child.pid,
  });
  return res.status(200).json(child.pid); //res.status(200).json(isPrime(req.params.number));
});
```

Then in the `child.js` file we will be able to listen to the message that was sent but listening to the message event using the `on` function from the process as follows:

```js
process.on("message", (message) => {
  console.log(message);
});
```

So in the console we will get something like:

```shell
{ number: '3', pid: 12008 }
```

### Sending the data from the Child process.

Again we can be able to send the data from the child process to the main process as follows:

```js
process.send({
  pid: process.pid,
  message: "Message from the child process.",
});
```

In the main process we can listen to this as following:

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  child.send({
    number: req.params.number,
    pid: child.pid,
  });
  child.on("message", (m) => console.log(m));
  return res.status(200).json(child.pid);
});
```

In the console you can get something that is similar to this:

```shell
{ pid: 6976, message: 'Message from the child process.' }
```

### Listening to `exit` from the child process.

To listen to an exit from the child process is simple.First we need to call the exit from the child process as follows:

```js
process.exit(9);
```

In the main process we will have something like:

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});

  child.on("exit", (code) =>
    console.log({
      code,
      message: "Child process terminated",
    })
  );
  return res.status(200).json(child.pid);
});
```

In the console we will get something simmilar to:

```shell
{ code: 9, message: 'Child process terminated' }
```

### Listening on errors in the child process

In the child process we can throw errors and listen to them. For example in our `child.js` we can throw an error as follows

```js
throw new Error("Something went wrong.");
```

Now in the main process we can listen to the `error` event as follows

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  child.on("error", (e) =>
    console.log({
      error: error.message,
      pid: process.pid,
    })
  );
  return res.status(200).json(child.pid);
});
```

### Disconnecting to the child process

To disconnect to the child process we can use the disconnect function as follows:

```js
child.disconnect();

// or connect Again
child.connect();
```

### Creating our api

Now we can create an API using this technique such that when `isPrime` is executing we can do some other process without waiting for it to finish for large numbers. We are going to change our `/isprime/:number` route code to look as follows:

```js
app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  child.send({ number: req.params.number });
  child.on("message", (m) => {
    return res.status(200).json(child.pid);
  });
});
```

Now in our child process we can change it to have the following code in it:

```js
process.on("message", ({ number }) => {
  process.send(isPrime(number));
});

const isPrime = (number) => {
  const factors = [];
  if (number < 1) return false;
  if (number == 1) return true;

  for (let i = 2; i < number; i++) {
    if (number % i === 0) {
      factors.push(i);
    }
  }
  return {
    number,
    factors,
    prime: factors.length > 0 ? false : true,
  };
};
```

> Now we can be able to make multiple request at the same time without waiting for other request to finish.

### Ref

1. [child_process](https://nodejs.org/api/child_process.html)
