// Packages
import getStream from 'get-stream'
import test from 'ava'

// Ours
import createBundleStream from '../lib/create-bundle-stream'

test('create a bundle', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundle.js'))
  t.snapshot(content)
})

test('create a bundle that import runtime', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundle-runtime.js'))
  t.snapshot(content)
})

test('create a bundle that uses cjs', async t => {
  const content = await getStream(createBundleStream('./test/fixtures/bundle-cjs.js'))
  t.snapshot(content)
})
