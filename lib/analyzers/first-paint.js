import { find } from 'lodash'

import { toSecond } from '../utils'

export default function analyzeFirstPaint({ events }) {
  const firstPaintEvent = find(events, e => e.name === 'firstPaint')
  if (!firstPaintEvent) return { firstPaint: null }

  const firstEvent = find(events, e => e.name === 'TracingStartedInPage')
  const firstPaint = toSecond(firstPaintEvent.ts - firstEvent.ts)

  return { firstPaint }
}
