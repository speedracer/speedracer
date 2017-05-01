// Packages
import test from 'ava'

// Ours
import launchChrome from '../lib/launch-chrome'

test('launch chrome', async t => {
  const chrome = await launchChrome()
  t.true(typeof chrome.pid === 'number')
  chrome.kill()
})
