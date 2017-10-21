import { Race, Serie } from '../../../../lib/core'

const code = `
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

  const race = () => {
    searchPrimes(10e4)
  }
`
const race = new Race('search for 10e4 first primes')
race.ref = 'race'

module.exports = new Serie(code, [race])
