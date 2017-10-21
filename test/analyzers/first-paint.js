import test from 'ava'

import analyzeFirstPaint from '../../lib/analyzers/first-paint'

test('compute the first paint time', async t => {
  const report = await analyzeFirstPaint({
    events: require('../fixtures/artifacts/first-paint.json')
  })
  t.is(report.firstPaint, 0.027329)
})

test('return null is no usable events were found', async t => {
  const report = await analyzeFirstPaint({ events: [] })
  t.is(report.firstPaint, null)
})
