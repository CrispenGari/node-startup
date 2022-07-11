const myName = require("../src/name.js");

test("checking if the correct name is given", () => {
  const name = "crispen";
  expect(myName()).toBe(name);
});
