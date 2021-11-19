const { isMale, names, subjects } = require("../src/truthness.js");

test("testing for undefined", () => {
  expect(names()).toBeUndefined(); // pass
});
test("testing for defined", () => {
  expect(names()).toBeDefined(); // fail
});

test("testing for false", () => {
  expect(isMale()).toBeFalsy(); // pass
});

test("testing for toBeTruthy", () => {
  expect(isMale()).toBeTruthy(); // fail
});

test("testing for toBeNull", () => {
  expect(subjects()).toBeNull(); // fail
});
