// Native
import fs from 'fs'

// Packages
import del from 'del'
import pify from 'pify'
import test from 'ava'

// Ours
import execCli from './helpers/exec-cli'

test.afterEach(async () => {
  await del('test/fixtures/.speedracer')
})

test('run files in perf by default', async t => {
  const out = await execCli('run')
  t.regex(out, /3 races/)
})

test('run files as a glob', async t => {
  const out = await execCli('run', 'perf/{,*/}*.js')
  t.regex(out, /3 races/)
})

test('display error when no file is found', async t => {
  await t.throws(execCli('run', 'idonotexist.js'), /No files found!/)
})

test('save traces and reports in .speedracer directory by default', async t => {
  await execCli('run', 'perf/foo-bar.js')
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--foo.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--foo.speedracer'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--bar.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--bar.speedracer'))
})

test('save traces and reports to the given output directory', async t => {
  await execCli('run', 'perf/foo-bar.js --output=__reports__')
  await t.notThrows(pify(fs.stat)('test/fixtures/__reports__/perf--foo-bar--foo.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/__reports__/perf--foo-bar--foo.speedracer'))
  await t.notThrows(pify(fs.stat)('test/fixtures/__reports__/perf--foo-bar--bar.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/__reports__/perf--foo-bar--bar.speedracer'))
  await del('test/fixtures/__reports__')
})

test('do not save traces if specified', async t => {
  await execCli('run', 'perf/foo-bar.js --no-traces')
  await t.throws(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar/foo.trace.gz'))
  await t.throws(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar/bar.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--foo.speedracer'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--bar.speedracer'))
})

test('do not save reports if specified', async t => {
  await execCli('run', 'perf/foo-bar.js --no-reports')
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--foo.trace.gz'))
  await t.notThrows(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--bar.trace.gz'))
  await t.throws(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--foo.speedracer'))
  await t.throws(pify(fs.stat)('test/fixtures/.speedracer/perf--foo-bar--bar.speedracer'))
})
