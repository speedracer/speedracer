// Native
import zlib from 'zlib'

// Packages
import test from 'ava'
import pify from 'pify'

// Ours
import createReport from '../lib/create-report'
const { readFile } = require('./.internal/util')

const loadTrace = filename =>
  readFile(filename)
    .then(pify(zlib.gunzip))
    .then(JSON.parse)

test('report profiling', async t => {
  const trace = await loadTrace('./test/fixtures/high-cpu.trace')
  const report = await createReport('./test/fixtures/high-cpu.trace', trace)
  t.snapshot(report.profiling)
})

test('report fps', async t => {
  const trace = await loadTrace('./test/fixtures/render-loop.trace')
  const report = await createReport('./test/fixtures/render-loop.trace', trace)
  t.snapshot(report.fps)
})

test('report first paint', async t => {
  const trace = await loadTrace('./test/fixtures/render-loop.trace')
  const report = await createReport('./test/fixtures/render-loop.trace', trace)
  t.snapshot(report.firstPaint)
})
