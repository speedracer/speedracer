import test from 'ava'

import analyzeFPS from '../../lib/analyzers/fps'

test('compute fps stats', async t => {
  const { fps } = await analyzeFPS({
    events: require('../fixtures/artefacts/events/frames.json')
  })
  t.is(fps.min, 31)
  t.is(fps.max, 33)
  t.is(fps.avg, 32)
  t.is(fps.v, 2)
  t.is(fps.std, 1.41)
})

test('return null is no usable events were found', async t => {
  const { fps } = await analyzeFPS({ events: [] })
  t.is(fps, null)
})
