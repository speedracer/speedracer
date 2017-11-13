import { fromPairs, map, pipe, toPairs } from 'lodash/fp'

export default function analyzeSummary({ model }) {
  const categories = model.bottomUpGroupBy('Category').children

  const summary = pipe(
    toPairs,
    map(([ name, category ]) => {
      return [ name, category.totalTime ]
    }),
    fromPairs
  )(categories)

  return { summary }
}
