// Packages
import test from 'ava'

// Ours
import launchChrome from '../lib/chrome-launcher'

// TODO: make test pass on travis
test.skip('launch chrome', async t => {
  const chrome = await launchChrome()
  t.true(typeof chrome.pid === 'number')
  chrome.kill()
})
