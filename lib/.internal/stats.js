const { pow } = Math

const freqOf = xs => xs.length / (xs[xs.length - 1] - xs[0])

const minOf = xs => xs.reduce((lo, x) => x < lo ? x : lo)

const maxOf = xs => xs.reduce((hi, x) => x > hi ? x : hi)

const round = x => Math.round(x * 100) / 100

const varOf = (xs, mean) => xs.reduce((sum, x) => sum + pow(x - mean, 2), 0) / (xs.length - 1)

module.exports = { freqOf, minOf, maxOf, round, varOf }
