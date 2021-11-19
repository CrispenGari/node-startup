### Simple test

In this simple example we are going to run simple tests using jest and have a simple understanding of the library it self.

### Unit testing

We are going to perform unit testing using `jest` to test some of the functions that we are going to create.

> **Note**: _all the files that we will be testing will have a certain naming conversion that they should follows, let's say we have file called `sum.js` the test file for this file will be `sum.test.js` in jest._

### A simple test.

In this simple example we are going to write a simple test file called `name.test.js` which will test the function in the `name.js`.

1. `name.js`

```js
module.exports = () => {
  return "crispen";
};
```

2. `name.test.js`

```js
const myName = require("./name.js");

test("checking if the correct name is given", () => {
  const name = "crispen";
  expect(myName()).toBe(name);
});
```

To run the test we use the command:

```shell
yarn test
```

If everything went well all the `test` cases will pass, unless the name is different from the one that is passed in the `toBe()` method.

### Organizing test files

As we said all the files where we write our test should be have an extention `.test.js` we are going to create a folder called test. And all the `test` files will live in there, since jest will be looking at files with extention `.test.js` it will be able to pickup all the tests for us.

All the files that we are going to test will be in the `src` folder. So the folder structure will be as follows:

```
📁 test
    - filename.test.js
    ...
📁 src
    - filename.js
    ...
...
```

### Using matchers.

All the matchers can be found in the documentation
