import searchPrimes from './lib/search-primes'

race('search for 10e4 first primes', r => {
  searchPrimes(10e4)
})
