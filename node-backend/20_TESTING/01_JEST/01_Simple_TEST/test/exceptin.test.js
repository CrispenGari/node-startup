function compileAndroidCode() {
  throw new Error("you are using the wrong JDK");
}

test("compiling android goes as expected", () => {
  expect(() => compileAndroidCode()).toThrow();
  expect(() => compileAndroidCode()).toThrow(Error);

  // You can also use the exact error message or a regexp
  expect(() => compileAndroidCode()).toThrow("you are using the wrong JDK");
  expect(() => compileAndroidCode()).toThrow(/JDK/);
});
