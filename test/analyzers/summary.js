import test from 'ava'
import DevtoolsTimelineModel from 'devtools-timeline-model'

import analyzeSummary from '../../lib/analyzers/summary'

test('return a summary by categories', async t => {
  const events = require('../fixtures/artefacts/events/raw.json')
  const { summary } = await analyzeSummary({
    model: new DevtoolsTimelineModel(events)
  })
  t.is(summary.rendering, 169.5319995880127)
  t.is(summary.scripting, 157.57100009918213)
  t.is(summary.loading, 51.161999225616455)
  t.is(summary.painting, 9.823999404907227)
})
