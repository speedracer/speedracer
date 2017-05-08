// Native
import zlib from 'zlib'

// Packages
import test from 'ava'
import pify from 'pify'

// Ours
import Report from '../lib/report'
import Trace from '../lib/trace'
const { readFile } = require('../lib/.internal/util')

const loadEvents = filename =>
  readFile(filename, null)
    .then(pify(zlib.gunzip))
    .then(JSON.parse)

test('report profiling', async t => {
  const events = await loadEvents('./test/fixtures/alternate-body-background.trace.gz')
  const report = new Report({}, new Trace(events))
  t.snapshot(report.profiling)
})

test('report fps', async t => {
  const events = await loadEvents('./test/fixtures/alternate-body-background.trace.gz')
  const report = new Report({}, new Trace(events))
  t.snapshot(report.fps)
})

test('report first paint', async t => {
  const events = await loadEvents('./test/fixtures/alternate-body-background.trace.gz')
  const report = new Report({}, new Trace(events))
  t.snapshot(report.firstPaint)
})
