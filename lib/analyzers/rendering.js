// Ours
const { toSec } = require('../.internal/util')
const { freqOf, minOf, maxOf, round, varOf } = require('../.internal/stats')

const { sqrt } = Math

const extractFrames = events =>
  events
    .filter(e => e.name.includes('DrawFrame'))
    .sort((a, b) => a.ts - b.ts)
    // remove first frame because it's often off the charts
    .slice(1)

const analyzeFirstPaint = events => {
  const firstPaint = events.find(e => e.name === 'firstPaint')
  if (!firstPaint) return null

  const first = events.find(e => e.name === 'TracingStartedInPage')
  return toSec(firstPaint.ts - first.ts)
}

const analyzeFps = frames => {
  if (frames.length === 0) return null

  frames = frames.map(f => toSec(f.ts))
  const fpsPerFrames = frames.reduce((fpsPerFrames, f, i, frames) => {
    if (i > 0) {
      const fps = 1 / (f - frames[i - 1])
      fpsPerFrames.push(fps)
    }
    return fpsPerFrames
  }, [])

  // Compute min
  const lo = round(minOf(fpsPerFrames), 2)
  // Compute max
  const hi = round(maxOf(fpsPerFrames), 2)
  // Compute mean
  const mean = round(freqOf(frames), 2)
  // Compute variance
  const variance = round(varOf(fpsPerFrames, mean), 2)
  // Compute standard deviation
  const sd = round(sqrt(variance), 2)

  return { mean, variance, sd, lo, hi }
}

const analyzeRendering = (model, events) => ({
  firstPaint: analyzeFirstPaint(events),
  fps: analyzeFps(extractFrames(events))
})

module.exports = analyzeRendering
