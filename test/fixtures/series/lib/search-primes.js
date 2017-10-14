const isPrime = num => {
  if (num < 2) return false

  const limit = Math.sqrt(num)
  for (var i = 2; i <= limit; i++) {
    if (num % i === 0) {
      return false
    }
  }

  return true
}

const searchPrimes = limit => {
  const optGuard = [0, 0]
  for (let i = 0; i < limit; i++) {
    optGuard[i % 2] = isPrime(i)
  }
  return optGuard
}

export default searchPrimes
