import test from 'ava'

import analyzeFirstPaint from '../../lib/analyzers/first-paint'

test('compute the first paint time', async t => {
  const { firstPaint } = await analyzeFirstPaint({
    events: require('../fixtures/artefacts/events/first-paint.json')
  })
  t.is(firstPaint, 0.027329)
})

test('return null is no usable events were found', async t => {
  const { firstPaint } = await analyzeFirstPaint({ events: [] })
  t.is(firstPaint, null)
})
