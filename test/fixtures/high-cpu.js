import run from 'speedracer'

const isPrime = num => {
  if (num < 2) return false

  for (var i = 2; i <= Math.sqrt(num); i++) {
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

run('search for 10e4 first primes', r => {
  searchPrimes(10e4)
})
