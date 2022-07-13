const isPrime = (number) => {
  const factors = [];
  if (number < 1) return false;
  if (number === 1) return true;

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

process.on("message", ({ number }) => {
  process.send(isPrime(number));
});
