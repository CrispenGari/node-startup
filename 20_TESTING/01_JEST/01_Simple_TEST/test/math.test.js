const { mult, sum, diff, div } = require("../src/math.js");

test("should test for multiplication of two numbers ", () => {
  expect(mult(2, 3)).toBe(6);
});

test("should test for addition of two numbers ", () => {
  expect(sum(2, 3)).toBe(5);
});
test("should test for difference of two numbers ", () => {
  expect(diff(2, 3)).toBe(-1);
});
test("should test for division of two numbers ", () => {
  expect(div(3, 3)).toBe(1);
});
