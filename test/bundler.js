// Packages
import getStream from 'get-stream'
import test from 'ava'

// Ours
import createBundleStream from '../lib/bundler'

test('create a es6 bundle', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundles/es6.js'))
  t.snapshot(content)
})

test('create a common js bundle', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundles/cjs.js'))
  t.snapshot(content)
})

test('bundle runner client', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundles/runner-client.js'))
  t.snapshot(content)
})
