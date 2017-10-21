import { countBy, filter, map, pipe, slice, sortBy, toArray } from 'lodash/fp'

import { stats, toSecond } from '../utils'

const extractFrames = (events) => (
  pipe(
    filter(e => e.name.includes('DrawFrame')),
    sortBy('ts'),
    map(e => toSecond(e.ts))
  )(events)
)

const extractFPSPerFrame = frames => (
  pipe(
    countBy(Math.floor),
    toArray,
    slice(1, -1)
  )(frames)
)

export default function analyzeFPS({ events }) {
  const frames = extractFrames(events)
  if (frames.length === 0) return { fps: null }

  const fpsPerFrame = extractFPSPerFrame(frames)
  const fps = stats(fpsPerFrame)

  return { fps }
}
