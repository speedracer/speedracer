import { max as maxOf, mean, min as minOf, reduce, round } from 'lodash'

const { pow, sqrt } = Math

export const freqOf = xs => xs.length / (xs[xs.length - 1] - xs[0])

export const varOf = (xs, avg) => (
  reduce(xs, (sum, x) => sum + pow(x - avg, 2), 0) / (xs.length - 1)
)

export const stats = (xs) => {
  const min = round(minOf(xs), 2)
  const max = round(maxOf(xs), 2)
  const avg = round(mean(xs), 2)
  const v = round(varOf(xs, avg), 2)
  const std = round(sqrt(v), 2)

  return { min, max, avg, v, std }
}
